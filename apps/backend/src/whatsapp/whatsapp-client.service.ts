import { Injectable, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import makeWASocket, { useMultiFileAuthState, DisconnectReason, WASocket } from '@whiskeysockets/baileys';
import * as QRCode from 'qrcode';
import pino from 'pino';
import * as fs from 'fs';
import * as path from 'path';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappQueueService } from './whatsapp-queue.service';
import { WhatsappMessageProcessor } from './whatsapp-message.processor';

@Injectable()
export class WhatsappClientService implements OnModuleInit {
  private sock: WASocket | null = null;
  private status: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' = 'DISCONNECTED';
  private qrCodeBase64: string | null = null;
  private readonly sessionDir = path.join(process.cwd(), 'storage', 'whatsapp-session');

  constructor(
    private readonly gateway: WhatsappGateway,
    private readonly queueService: WhatsappQueueService,
    @Inject(forwardRef(() => WhatsappMessageProcessor))
    private readonly messageProcessor: WhatsappMessageProcessor,
  ) {}

  async onModuleInit() {
    // Register the sender callback in the queue service
    this.queueService.registerSender(async (phone, message) => {
      return this.sendRawMessage(phone, message);
    });

    if (this.hasSession()) {
      console.log('[Whatsapp Client]: Sesión previa encontrada. Auto-conectando...');
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

  isConnected(): boolean {
    return this.status === 'CONNECTED' && this.sock !== null;
  }

  async initialize() {
    if (this.status === 'CONNECTED' || this.status === 'CONNECTING') {
      return;
    }

    this.status = 'CONNECTING';
    this.gateway.emitStatus('CONNECTING');

    try {
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

      // Listen to incoming messages and pass to message processor
      this.sock.ev.on('messages.upsert', async (upsert) => {
        if (upsert.type === 'notify' || upsert.type === 'append') {
          for (const msg of upsert.messages) {
            await this.messageProcessor.processIncomingMessage(msg);
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
            console.error('[Whatsapp Client]: Error al generar QR:', err);
          }
        }

        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          console.log(`[Whatsapp Client]: Conexión cerrada. Status: ${statusCode}. Reconectar: ${shouldReconnect}`);
          this.status = 'DISCONNECTED';
          this.qrCodeBase64 = null;
          this.gateway.emitStatus('DISCONNECTED');
          this.sock = null;

          if (shouldReconnect) {
            setTimeout(() => this.initialize(), 3000);
          } else {
            this.clearSession();
          }
        } else if (connection === 'open') {
          console.log('[Whatsapp Client]: Conexión abierta exitosamente con WhatsApp.');
          this.status = 'CONNECTED';
          this.qrCodeBase64 = null;
          this.gateway.emitStatus('CONNECTED');
        }
      });
    } catch (error) {
      console.error('[Whatsapp Client]: Error al inicializar Baileys:', error);
      this.clearSession();
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
        console.error('[Whatsapp Client]: Error al desloguear Baileys:', err);
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
        console.log('[Whatsapp Client]: Directorio de sesión limpiado.');
      } catch (err) {
        console.error('[Whatsapp Client]: Error al limpiar directorio de sesión:', err);
      }
    }
  }

  async sendRawMessage(phone: string, message: string): Promise<boolean> {
    if (this.status !== 'CONNECTED' || !this.sock) {
      console.warn('[Whatsapp Client]: Intento de enviar mensaje sin conexión activa.');
      return false;
    }

    try {
      let cleanedPhone = String(phone || '').replace(/\D/g, '');
      if (cleanedPhone.length === 10 && cleanedPhone.startsWith('3')) {
        cleanedPhone = '57' + cleanedPhone;
      }
      const formattedPhone = `${cleanedPhone}@s.whatsapp.net`;
      await this.sock.sendMessage(formattedPhone, { text: message });
      console.log(`[Whatsapp Client]: Mensaje enviado con éxito a ${formattedPhone}`);

      // Persist sent message in DB
      const cleanPhone = cleanedPhone.startsWith('57') ? cleanedPhone.substring(2) : cleanedPhone;
      await this.messageProcessor.saveMessage(cleanPhone, 'rocita', message);

      // Emit WS update to client
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
      console.error('[Whatsapp Client]: Error al enviar mensaje por Baileys:', err);
      return false;
    }
  }
}
