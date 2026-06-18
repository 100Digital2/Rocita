import { Injectable } from '@nestjs/common';
import { WhatsappClientService } from './whatsapp-client.service';
import { WhatsappQueueService } from './whatsapp-queue.service';
import { WhatsappMessageProcessor } from './whatsapp-message.processor';
import { ChatMessage } from './chat-message.entity';

@Injectable()
export class WhatsappService {
  constructor(
    private readonly clientService: WhatsappClientService,
    private readonly queueService: WhatsappQueueService,
    private readonly messageProcessor: WhatsappMessageProcessor,
  ) {}

  getStatus() {
    return this.clientService.getStatus();
  }

  async initialize() {
    return this.clientService.initialize();
  }

  async disconnect() {
    return this.clientService.disconnect();
  }

  async sendReminder(phone: string, message: string): Promise<boolean> {
    return this.queueService.enqueueMessage(phone, message, true);
  }

  async saveMessage(phone: string, sender: 'rocita' | 'paciente', text: string): Promise<ChatMessage> {
    return this.messageProcessor.saveMessage(phone, sender, text);
  }

  async getChats(phone: string): Promise<ChatMessage[]> {
    return this.messageProcessor.getChats(phone);
  }
}
