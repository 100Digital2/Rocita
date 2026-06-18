import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import * as net from 'net';

@Injectable()
export class WhatsappQueueService implements OnModuleInit, OnModuleDestroy {
  private queue: Queue | null = null;
  private worker: Worker | null = null;
  private isRedisAvailable = false;
  private inMemoryQueue: {
    phone: string;
    message: string;
    isManual: boolean;
    resolve: (v: boolean) => void;
    reject: (err: any) => void;
  }[] = [];
  private processingInMemory = false;
  private senderFn: ((phone: string, message: string, isManual: boolean) => Promise<boolean>) | null = null;

  async onModuleInit() {
    this.isRedisAvailable = await this.checkRedisConnection();
    if (this.isRedisAvailable) {
      console.log('[Queue Service]: Redis detectado en el puerto 6379. Inicializando BullMQ...');
      
      this.queue = new Queue('whatsapp-messages', {
        connection: { host: '127.0.0.1', port: 6379 },
      });

      this.worker = new Worker(
        'whatsapp-messages',
        async (job) => {
          const { phone, message, isManual } = job.data;
          console.log(`[Queue Worker]: Procesando mensaje de WhatsApp en BullMQ para ${phone}`);
          
          let attempts = 0;
          while (!this.senderFn && attempts < 10) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            attempts++;
          }

          if (this.senderFn) {
            return this.senderFn(phone, message, isManual);
          }
          throw new Error('WhatsappQueueService: No sender registered after bootstrap timeout');
        },
        {
          connection: { host: '127.0.0.1', port: 6379 },
          limiter: {
            max: 1,
            duration: 3000, // Enviar máximo 1 mensaje cada 3 segundos
          },
        }
      );

      this.worker.on('failed', (job, err) => {
        console.error(`[Queue Worker]: Error procesando mensaje para ${job?.data?.phone}:`, err);
      });
    } else {
      console.warn('[Queue Service]: Redis NO detectado. Usando cola en memoria de contingencia con rate-limit...');
    }
  }

  async onModuleDestroy() {
    if (this.queue) {
      await this.queue.close();
    }
    if (this.worker) {
      await this.worker.close();
    }
  }

  registerSender(fn: (phone: string, message: string, isManual: boolean) => Promise<boolean>) {
    this.senderFn = fn;
  }

  private checkRedisConnection(): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1500);

      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.once('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(6379, '127.0.0.1');
    });
  }

  async enqueueMessage(phone: string, message: string, isManual = false): Promise<boolean> {
    if (this.isRedisAvailable && this.queue) {
      console.log(`[Queue Service]: Encolando mensaje en BullMQ para ${phone}`);
      await this.queue.add(
        'send-message',
        { phone, message, isManual },
        {
          attempts: 3,
          backoff: 5000,
        }
      );
      return true;
    } else {
      console.log(`[Queue Service]: Encolando mensaje en memoria para ${phone}`);
      return new Promise((resolve, reject) => {
        this.inMemoryQueue.push({ phone, message, isManual, resolve, reject });
        this.processInMemoryQueue();
      });
    }
  }

  private async processInMemoryQueue() {
    if (this.processingInMemory || this.inMemoryQueue.length === 0) {
      return;
    }

    this.processingInMemory = true;
    const job = this.inMemoryQueue.shift();

    if (job) {
      try {
        console.log(`[Queue Service]: Procesando mensaje en memoria para ${job.phone} (Pendientes: ${this.inMemoryQueue.length})`);
        if (this.senderFn) {
          const result = await this.senderFn(job.phone, job.message, job.isManual);
          job.resolve(result);
        } else {
          job.reject(new Error('No sender registered'));
        }
      } catch (err) {
        job.reject(err);
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        this.processingInMemory = false;
        this.processInMemoryQueue();
      }
    } else {
      this.processingInMemory = false;
    }
  }
}
