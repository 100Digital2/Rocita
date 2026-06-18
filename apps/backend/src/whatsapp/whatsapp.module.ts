import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappClientService } from './whatsapp-client.service';
import { WhatsappQueueService } from './whatsapp-queue.service';
import { WhatsappMessageProcessor } from './whatsapp-message.processor';
import { WhatsappGateway } from './whatsapp.gateway';
import { WhatsappController } from './whatsapp.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatMessage } from './chat-message.entity';
import { Patient } from '../patients/patient.entity';
import { PatientProfile } from '../patients/patient-profile.entity';
import { Notification } from '../notifications/notification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, Patient, PatientProfile, Notification]),
  ],
  controllers: [WhatsappController],
  providers: [
    WhatsappService,
    WhatsappClientService,
    WhatsappQueueService,
    WhatsappMessageProcessor,
    WhatsappGateway,
  ],
  exports: [
    WhatsappService,
    WhatsappClientService,
    WhatsappQueueService,
    WhatsappMessageProcessor,
  ],
})
export class WhatsappModule {}
