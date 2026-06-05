import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './patient.entity';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientProfile } from './patient-profile.entity';
import { PatientProfilesService } from './patient-profiles.service';
import { PatientProfilesController } from './patient-profiles.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, PatientProfile])],
  controllers: [PatientsController, PatientProfilesController],
  providers: [PatientsService, PatientProfilesService],
  exports: [PatientsService, PatientProfilesService],
})
export class PatientsModule {}
