import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(patientData);
    return this.patientRepository.save(patient);
  }

  async bulkCreate(patientsData: Partial<Patient>[]): Promise<Patient[]> {
    // Para simplificar la demo de campañas, limpiamos los pacientes anteriores
    // antes de insertar la nueva tanda de la plantilla de Excel.
    await this.patientRepository.clear();

    const patients = patientsData.map((data) => {
      // Mapear campos de Excel comunes a los campos de la entidad
      return this.patientRepository.create({
        name: data.name || data['Nombre'] || data['nombre'] || 'Paciente Desconocido',
        age: Number(data.age || data['Edad'] || data['edad']) || 0,
        documentType: data.documentType || data['Tipo Documento'] || data['tipo_documento'] || data['Tipo de Documento'] || data['Tipo'] || data['tipo'] || 'CC',
        documentNumber: data.documentNumber || data['Cedula'] || data['cedula'] || data['Cédula'] || data['Documento'] || data['documento'] || data['Identificacion'] || data['identificacion'] || data['Nro Documento'] || data['nro_documento'] || '',
        gender: data.gender || data['Sexo'] || data['sexo'] || data['Género'] || data['genero'] || '',
        phone: data.phone || data['Telefono'] || data['telefono'] || data['Teléfono'] || data['Celular'] || '',
        email: data.email || data['Correo'] || data['correo'] || data['Email'] || data['email'] || '',
        status: data.status || data['Estado'] || data['estado'] || 'Pendiente',
        specialty: data.specialty || data['Especialidad'] || data['especialidad'] || '',
        doctor: data.doctor || data['Doctor'] || data['doctor'] || data['Médico'] || '',
        doctorEmail: data.doctorEmail || data['doctor_email'] || data['doctorEmail'] || data['Correo Doctor'] || data['Correo Profesional'] || '',
        doctorPhone: data.doctorPhone || data['doctor_phone'] || data['doctorPhone'] || data['Celular Doctor'] || data['Celular Profesional'] || data['Telefono Doctor'] || '',
        nextAppointment: data.nextAppointment || data['Fecha Cita'] || data['fecha_cita'] || data['Cita'] || '',
      });
    });

    return this.patientRepository.save(patients);
  }

  async update(id: number, patientData: Partial<Patient>): Promise<Patient> {
    await this.patientRepository.update(id, patientData);
    const updated = await this.patientRepository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`Patient with id ${id} not found`);
    }
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.patientRepository.delete(id);
  }

  async clearAll(): Promise<void> {
    await this.patientRepository.clear();
  }
}
