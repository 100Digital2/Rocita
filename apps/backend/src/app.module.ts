import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { User } from './auth/user.entity';
import { Patient } from './patients/patient.entity';
import { PatientProfile } from './patients/patient-profile.entity';
import { PatientsModule } from './patients/patients.module';
import { Doctor } from './doctors/doctor.entity';
import { DoctorsModule } from './doctors/doctors.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { ChatMessage } from './whatsapp/chat-message.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqljs',
      autoSave: true,
      location: 'rocita.db',
      entities: [User, Patient, Doctor, PatientProfile, ChatMessage],
      synchronize: true,
    }),
    AuthModule,
    PatientsModule,
    DoctorsModule,
    WhatsappModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
