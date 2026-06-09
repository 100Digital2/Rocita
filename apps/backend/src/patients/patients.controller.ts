import { Controller, Get, Post, Body, Delete, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient } from './patient.entity';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async getAllPatients(): Promise<Patient[]> {
    return this.patientsService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPatient(@Body() patientData: Partial<Patient>): Promise<Patient> {
    return this.patientsService.create(patientData);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkUpload(@Body() patientsData: Partial<Patient>[]): Promise<{ message: string; count: number; patients: Patient[] }> {
    const savedPatients = await this.patientsService.bulkCreate(patientsData);
    return {
      message: 'Pacientes importados con éxito desde la plantilla Excel',
      count: savedPatients.length,
      patients: savedPatients,
    };
  }

  @Patch(':id')
  async updatePatient(@Param('id') id: string, @Body() patientData: Partial<Patient>): Promise<Patient> {
    return this.patientsService.update(Number(id), patientData);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePatient(@Param('id') id: string): Promise<void> {
    await this.patientsService.delete(Number(id));
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearAllPatients(): Promise<void> {
    await this.patientsService.clearAll();
  }
}
