import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { WhatsappGateway } from './whatsapp.gateway';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import pino from 'pino';
import * as fs from 'fs';
import * as path from 'path';
import { Patient } from '../patients/patient.entity';
import { PatientProfile } from '../patients/patient-profile.entity';
import { Notification } from '../notifications/notification.entity';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private sock: WASocket | null = null;
  private status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' = 'DISCONNECTED';
  private qrCodeBase64: string | null = null;
  private readonly sessionDir = path.join(process.cwd(), 'storage', 'whatsapp-session');

  constructor(
    private readonly gateway: WhatsappGateway,
    @InjectRepository(ChatMessage)
    private readonly chatRepository: Repository<ChatMessage>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(PatientProfile)
    private readonly patientProfileRepository: Repository<PatientProfile>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async onModuleInit() {
    // Si ya existe una sesión guardada, auto-conectamos
    if (this.hasSession()) {
      console.log('Sesión de WhatsApp encontrada. Auto-conectando...');
      this.initialize();
    }
  }

  private hasSession(): boolean {
    const credsPath = path.join(this.sessionDir, 'creds.json');
    return fs.existsSync(credsPath);
  }

  getStatus() {
    return {
      status: this.status,
      qr: this.status === 'CONNECTING' ? this.qrCodeBase64 : null,
    };
  }

  async initialize() {
    if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
      return;
    }

    this.status = 'CONNECTING';
    this.gateway.emitStatus('CONNECTING');

    try {
      // Asegurar la existencia del directorio de almacenamiento antes de cargar el estado de autenticación
      const storageDir = path.dirname(this.sessionDir);
      if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir, { recursive: true });
      }

      const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);

      this.sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) as any,
        printQRInTerminal: false,
      });

      this.sock.ev.on('creds.update', saveCreds);

      // Escuchar mensajes entrantes en tiempo real
      this.sock.ev.on('messages.upsert', async (upsert) => {
        console.log(`[Baileys] upsert tipo: ${upsert.type}, cantidad: ${upsert.messages?.length}`);
        if (upsert.type === 'notify' || upsert.type === 'append') {
          for (const msg of upsert.messages) {
            // Loguear estructura básica del mensaje para depurar
            console.log('[Baileys] Mensaje recibido:', {
              fromMe: msg.key?.fromMe,
              remoteJid: msg.key?.remoteJid,
              hasMessage: !!msg.message,
              messageKeys: msg.message ? Object.keys(msg.message) : [],
            });

            // Ignorar si no tiene mensaje, o si viene de nosotros mismos
            if (!msg.message || msg.key.fromMe) continue;

            const remoteJid = msg.key.remoteJid;
            // Solo procesar chats individuales
            if (!remoteJid || !remoteJid.endsWith('@s.whatsapp.net')) continue;

            // Extraer el contenido de texto de forma extremadamente robusta
            let messageContent = msg.message;
            
            // Desenvolver si es efímero u otros wrappers
            if (messageContent.ephemeralMessage?.message) {
              messageContent = messageContent.ephemeralMessage.message;
            }
            if (messageContent.viewOnceMessage?.message) {
              messageContent = messageContent.viewOnceMessage.message;
            }
            if (messageContent.viewOnceMessageV2?.message) {
              messageContent = messageContent.viewOnceMessageV2.message;
            }
            if (messageContent.documentWithCaptionMessage?.message) {
              messageContent = messageContent.documentWithCaptionMessage.message;
            }

            const text = messageContent.conversation ||
                         messageContent.extendedTextMessage?.text ||
                         messageContent.imageMessage?.caption ||
                         messageContent.buttonsResponseMessage?.selectedButtonId ||
                         messageContent.templateButtonReplyMessage?.selectedId ||
                         messageContent.listResponseMessage?.singleSelectReply?.selectedRowId ||
                         '';

            console.log(`[Baileys] Texto extraído: "${text}"`);

            if (!text) continue;

            // Limpiar y normalizar el número de teléfono
            const phoneWithCountry = remoteJid.split('@')[0];
            let cleanPhone = phoneWithCountry;
            // Si es de Colombia (57) y tiene 12 dígitos, extraer los últimos 10
            if (phoneWithCountry.startsWith('57') && phoneWithCountry.length === 12) {
              cleanPhone = phoneWithCountry.substring(2);
            }

            const payload = {
              sender: cleanPhone,
              text: text,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              timestamp: new Date().toISOString(),
              fromMe: false,
              pushName: msg.pushName || 'Paciente',
            };

            // Guardar el mensaje entrante en SQLite
            await this.saveMessage(cleanPhone, 'paciente', text);

            console.log('Mensaje de WhatsApp entrante detectado:', payload);
            this.gateway.emitMessage(payload);

            // B3. Procesamiento y respuestas automatizadas
            try {
              // Buscar si este paciente tiene una cita con estado "Pendiente"
              const patient = await this.patientRepository.findOne({
                where: { phone: cleanPhone, status: 'Pendiente' },
                order: { id: 'DESC' }
              });

              if (patient) {
                const cleanedText = text.trim().toLowerCase();
                let newStatus: 'Confirmado' | 'Cancelado' | null = null;
                let notificationText = '';
                let notificationType: 'confirmacion' | 'cancelacion' | 'fallo' | 'sistema' = 'sistema';

                if (cleanedText === '1' || cleanedText === 'sí' || cleanedText === 'si' || cleanedText.includes('confirm')) {
                  newStatus = 'Confirmado';
                  notificationType = 'confirmacion';
                  notificationText = `${patient.name} ha confirmado su cita para la especialidad de ${patient.specialty} con el profesional ${patient.doctor} el ${patient.nextAppointment}.`;
                } else if (cleanedText === '2' || cleanedText === 'no' || cleanedText.includes('cancel')) {
                  newStatus = 'Cancelado';
                  notificationType = 'cancelacion';
                  notificationText = `${patient.name} ha cancelado su cita de ${patient.specialty} con ${patient.doctor} debido a motivos personales.`;
                }

                if (newStatus) {
                  // 1. Actualizar el estado de la cita en base de datos
                  patient.status = newStatus;
                  await this.patientRepository.save(patient);
                  console.log(`B3: Cita ID ${patient.id} de ${patient.name} actualizada a ${newStatus} automáticamente.`);

                  // 2. Enviar respuesta automática por WhatsApp
                  let autoReplyText = '';
                  if (newStatus === 'Confirmado') {
                    autoReplyText = `¡Excelente, ${patient.name.split(' ')[0]}! Hemos confirmado tu asistencia de manera automática en el sistema. Recuerda llegar 15 minutos antes.`;
                  } else {
                    autoReplyText = `Entendido, ${patient.name.split(' ')[0]}. Hemos cancelado tu cita en el sistema. Si deseas agendar una nueva cita, por favor comunícate con admisiones.`;
                  }
                  
                  // Despachar el mensaje de respuesta automática
                  await this.sendReminder(cleanPhone, autoReplyText);

                  // 3. Crear alerta / notificación en la base de datos (B2)
                  const profile = await this.patientProfileRepository.findOne({
                    where: { documentNumber: patient.documentNumber }
                  });
                  const ipsEmail = profile ? profile.ipsEmail : 'admin@rocita.ai';

                  // Cargar el historial del chat para la alerta
                  const chats = await this.getChats(cleanPhone);
                  const chatHistory = chats.map(c => ({
                    sender: c.sender,
                    text: c.text,
                    time: c.time
                  }));

                  const newNotification = this.notificationRepository.create({
                    type: notificationType,
                    patientName: patient.name,
                    doctorName: patient.doctor,
                    specialty: patient.specialty,
                    text: notificationText,
                    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' ' + (new Date().getHours() >= 12 ? 'PM' : 'AM'),
                    unread: true,
                    chatHistory: chatHistory,
                    ipsEmail: ipsEmail
                  });

                  await this.notificationRepository.save(newNotification);
                  console.log('B3: Alerta guardada en SQLite con éxito.');

                  // 4. Emitir evento Websocket para actualizar el Dashboard en vivo
                  this.gateway.server.emit('whatsapp.appointment_update', {
                    dbId: patient.id,
                    status: newStatus,
                    notification: newNotification
                  });
                }
              }
            } catch (err) {
              console.error('B3: Error al procesar flujo automatizado de mensajes:', err);
            }
          }
        }
      });

      this.sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          try {
            this.qrCodeBase64 = await QRCode.toDataURL(qr);
            this.gateway.emitQr(this.qrCodeBase64);
          } catch (err) {
            console.error('Error al generar imagen QR:', err);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log(`Conexión cerrada. Razón: ${statusCode}. Reconectar: ${shouldReconnect}`);
          this.status = 'DISCONNECTED';
          this.qrCodeBase64 = null;
          this.gateway.emitStatus('DISCONNECTED');
          this.sock = null;

          if (shouldReconnect) {
            setTimeout(() => this.initialize(), 3000);
          } else {
            // Si fue un logout explícito, limpiamos la carpeta
            this.clearSession();
          }
        } else if (connection === 'open') {
          console.log('Conexión abierta exitosamente con WhatsApp.');
          this.status = 'CONNECTED';
          this.qrCodeBase64 = null;
          this.gateway.emitStatus('CONNECTED');
        }
      });
    } catch (error) {
      console.error('Error al inicializar Baileys (posible sesión corrupta):', error);
      this.clearSession(); // Limpiar sesión corrupta para permitir un nuevo escaneo limpio
      this.status = 'DISCONNECTED';
      this.gateway.emitStatus('DISCONNECTED');
      this.sock = null;
    }
  }

  async disconnect() {
    if (this.sock) {
      try {
        await this.sock.logout();
      } catch (err) {
        console.error('Error al desloguear Baileys:', err);
      }
    }
    this.clearSession();
    this.status = 'DISCONNECTED';
    this.qrCodeBase64 = null;
    this.gateway.emitStatus('DISCONNECTED');
    this.sock = null;
  }

  private clearSession() {
    if (fs.existsSync(this.sessionDir)) {
      try {
        fs.rmSync(this.sessionDir, { recursive: true, force: true });
        console.log('Directorio de sesión de WhatsApp limpiado.');
      } catch (err) {
        console.error('Error al limpiar directorio de sesión:', err);
      }
    }
  }

  async sendReminder(phone: string, message: string): Promise<boolean> {
    if (this.status !== 'CONNECTED' || !this.sock) {
      console.warn('Intento de enviar mensaje sin conexión activa a WhatsApp.');
      return false;
    }

    try {
      // Limpiar y formatear número de teléfono
      let cleanedPhone = String(phone || '').replace(/\D/g, '');
      // Si empieza con 3 y tiene 10 dígitos, asumimos que es Colombia (código país 57)
      if (cleanedPhone.length === 10 && cleanedPhone.startsWith('3')) {
        cleanedPhone = '57' + cleanedPhone;
      }
      const formattedPhone = `${cleanedPhone}@s.whatsapp.net`;
      await this.sock.sendMessage(formattedPhone, { text: message });
      console.log(`Mensaje enviado con éxito a ${formattedPhone}`);

      // Persistir mensaje enviado en SQLite
      const cleanPhone = cleanedPhone.startsWith('57') ? cleanedPhone.substring(2) : cleanedPhone;
      await this.saveMessage(cleanPhone, 'rocita', message);

      // Emitir el mensaje enviado para que se actualice en la interfaz del chat del analista
      this.gateway.emitMessage({
        sender: cleanPhone,
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date().toISOString(),
        fromMe: true,
        pushName: 'Rocita',
        status: 'read'
      });

      return true;
    } catch (err) {
      console.error('Error al enviar mensaje por Baileys:', err);
      return false;
    }
  }

  async saveMessage(phone: string, sender: 'rocita' | 'paciente', text: string): Promise<ChatMessage> {
    const cleanPhone = phone.replace(/\D/g, '');
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) + ' ' + (now.getHours() >= 12 ? 'PM' : 'AM');

    const chat = this.chatRepository.create({
      phone: cleanPhone,
      sender,
      text,
      time: timeString,
    });

    return this.chatRepository.save(chat);
  }

  async getChats(phone: string): Promise<ChatMessage[]> {
    const cleanPhone = phone.replace(/\D/g, '');
    return this.chatRepository.find({
      where: { phone: cleanPhone },
      order: { createdAt: 'ASC' },
    });
  }
}
