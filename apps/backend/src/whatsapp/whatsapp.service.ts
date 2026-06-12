import { Injectable, OnModuleInit } from '@nestjs/common';
import { WhatsappGateway } from './whatsapp.gateway';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import pino from 'pino';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private sock: WASocket | null = null;
  private status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' = 'DISCONNECTED';
  private qrCodeBase64: string | null = null;
  private readonly sessionDir = path.join(process.cwd(), 'storage', 'whatsapp-session');

  constructor(private readonly gateway: WhatsappGateway) {}

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
      const { state, saveCreds } = await useMultiFileAuthState(this.sessionDir);

      this.sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }) as any,
        printQRInTerminal: false,
      });

      this.sock.ev.on('creds.update', saveCreds);

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
      console.error('Error al inicializar Baileys:', error);
      this.status = 'DISCONNECTED';
      this.gateway.emitStatus('DISCONNECTED');
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
      return true;
    } catch (err) {
      console.error('Error al enviar mensaje por Baileys:', err);
      return false;
    }
  }
}
