import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './chat-message.entity';
import { WhatsappGateway } from './whatsapp.gateway';
import { Patient } from '../patients/patient.entity';
import { PatientProfile } from '../patients/patient-profile.entity';
import { Notification } from '../notifications/notification.entity';
import { WhatsappQueueService } from './whatsapp-queue.service';

@Injectable()
export class WhatsappMessageProcessor {
  constructor(
    private readonly gateway: WhatsappGateway,
    private readonly queueService: WhatsappQueueService,
    @InjectRepository(ChatMessage)
    private readonly chatRepository: Repository<ChatMessage>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(PatientProfile)
    private readonly patientProfileRepository: Repository<PatientProfile>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async processIncomingMessage(msg: any) {
    // Ignore if not a message or from ourselves
    if (!msg.message || msg.key.fromMe) return;

    const remoteJid = msg.key.remoteJid;
    if (!remoteJid || !remoteJid.endsWith('@s.whatsapp.net')) return;

    // Robust extraction of text content
    let messageContent = msg.message;
    
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

    console.log(`[Message Processor] Texto extraído: "${text}"`);

    if (!text) return;

    // Clean and normalize Colombian country codes
    const phoneWithCountry = remoteJid.split('@')[0];
    let cleanPhone = phoneWithCountry;
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

    // Save received message to SQLite DB
    await this.saveMessage(cleanPhone, 'paciente', text);

    console.log('[Message Processor]: Mensaje entrante procesado:', payload);
    this.gateway.emitMessage(payload);

    // Business Logic (B3: Auto-Confirmations)
    try {
      // Find patient with active 'Pendiente' appointment
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
          // 1. Update appointment status in SQLite
          patient.status = newStatus;
          await this.patientRepository.save(patient);
          console.log(`[Message Processor]: Cita ID ${patient.id} de ${patient.name} actualizada a ${newStatus} automáticamente.`);

          // 2. Queue automated responder message (Anti-Ban)
          let autoReplyText = '';
          if (newStatus === 'Confirmado') {
            autoReplyText = `¡Excelente, ${patient.name.split(' ')[0]}! Hemos confirmado tu asistencia de manera automática en el sistema. Recuerda llegar 15 minutos antes.`;
          } else {
            autoReplyText = `Entendido, ${patient.name.split(' ')[0]}. Hemos cancelado tu cita en el sistema. Si deseas agendar una nueva cita, por favor comunícate con admisiones.`;
          }
          
          await this.queueService.enqueueMessage(cleanPhone, autoReplyText);

          // 3. Create Notification alert in database (B2)
          const profile = await this.patientProfileRepository.findOne({
            where: { documentNumber: patient.documentNumber }
          });
          const ipsEmail = profile ? profile.ipsEmail : 'admin@rocita.ai';

          // Gather chat history logs
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
          console.log('[Message Processor]: Alerta guardada en SQLite con éxito.');

          // 4. Emit live update over WebSockets
          this.gateway.server.emit('whatsapp.appointment_update', {
            dbId: patient.id,
            status: newStatus,
            notification: newNotification
          });
        }
      }
    } catch (err) {
      console.error('[Message Processor]: Error al procesar flujo automatizado de mensajes:', err);
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
