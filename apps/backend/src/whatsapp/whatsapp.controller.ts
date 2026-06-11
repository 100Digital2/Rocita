import { Controller, Get, Post, Body } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @Get('status')
  getStatus() {
    return this.whatsappService.getStatus();
  }

  @Post('connect')
  async connect() {
    await this.whatsappService.initialize();
    return { message: 'Inicialización de WhatsApp iniciada.' };
  }

  @Post('disconnect')
  async disconnect() {
    await this.whatsappService.disconnect();
    return { message: 'Sesión de WhatsApp cerrada y desconectada.' };
  }

  @Post('send-test')
  async sendTest(@Body() body: { phone: string; message: string }) {
    const success = await this.whatsappService.sendReminder(body.phone, body.message);
    return { success };
  }
}
