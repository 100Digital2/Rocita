import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from './patient.entity';
import { PatientProfile } from './patient-profile.entity';

@Injectable()
export class PatientsService implements OnModuleInit {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(PatientProfile)
    private readonly profileRepository: Repository<PatientProfile>,
  ) {}

  async onModuleInit() {
    // 1. Sembrado de Citas (Patients entity)
    const patientCount = await this.patientRepository.count();
    if (patientCount === 0) {
      const defaultPatients = [
        this.patientRepository.create({
          name: 'Carlos Humberto Pérez',
          age: 45,
          documentType: 'CC',
          documentNumber: '123456',
          gender: 'M',
          phone: '+57 310 123 4567',
          email: 'carlos.perez@email.com',
          status: 'Confirmado',
          specialty: 'Cardiología',
          doctor: 'Dra. Carolina Gómez',
          doctorEmail: 'carolina.gomez@rocita.ai',
          doctorPhone: '310 111 2222',
          nextAppointment: 'Lunes 25 de Mayo - 10:30 AM',
        }),
        this.patientRepository.create({
          name: 'Laura Ruiz',
          age: 29,
          documentType: 'CC',
          documentNumber: '987654',
          gender: 'F',
          phone: '+57 315 987 6543',
          email: 'laura.ruiz@email.com',
          status: 'Cancelado',
          specialty: 'Dermatología',
          doctor: 'Dr. Alejandro Restrepo',
          doctorEmail: 'alejandro.restrepo@rocita.ai',
          doctorPhone: '315 333 4444',
          nextAppointment: 'Hoy - 4:00 PM',
        }),
        this.patientRepository.create({
          name: 'Mateo Sánchez',
          age: 19,
          documentType: 'TI',
          documentNumber: '456789',
          gender: 'M',
          phone: '+57 312 456 7890',
          email: 'mateo.sanchez@email.com',
          status: 'Pendiente',
          specialty: 'Oftalmología',
          doctor: 'Dr. Manuel Cabrera',
          doctorEmail: 'manuel.cabrera@rocita.ai',
          doctorPhone: '312 555 6666',
          nextAppointment: 'Mañana - 2:00 PM',
        })
      ];
      await this.patientRepository.save(defaultPatients);
      console.log('🌱 Semilla de Citas/Pacientes sembrada en SQLite con éxito.');
    }

    // 2. Sembrado de Perfiles de Pacientes (PatientProfile entity)
    const profileCount = await this.profileRepository.count();
    if (profileCount === 0) {
      const defaultProfiles = [
        this.profileRepository.create({
          name: 'Carlos Humberto Pérez',
          documentType: 'CC',
          documentNumber: '123456',
          gender: 'M',
          phone: '+57 310 123 4567',
          email: 'carlos.perez@email.com',
          ipsEmail: 'admin@rocita.ai',
        }),
        this.profileRepository.create({
          name: 'Laura Ruiz',
          documentType: 'CC',
          documentNumber: '987654',
          gender: 'F',
          phone: '+57 315 987 6543',
          email: 'laura.ruiz@email.com',
          ipsEmail: 'admin@rocita.ai',
        }),
        this.profileRepository.create({
          name: 'Mateo Sánchez',
          documentType: 'TI',
          documentNumber: '456789',
          gender: 'M',
          phone: '+57 312 456 7890',
          email: 'mateo.sanchez@email.com',
          ipsEmail: 'admin@rocita.ai',
        })
      ];
      await this.profileRepository.save(defaultProfiles);
      console.log('🌱 Semilla de Perfiles de Pacientes sembrada en SQLite con éxito.');
    }
  }

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

  async getStats(): Promise<any> {
    const patients = await this.patientRepository.find();
    const total = patients.length;
    const confirmado = patients.filter(p => p.status === 'Confirmado').length;
    const cancelado = patients.filter(p => p.status === 'Cancelado').length;
    const pendiente = patients.filter(p => p.status === 'Pendiente').length;

    const inasistenciaRate = total > 0 ? (cancelado / total) * 100 : 0;
    const rawIngresos = confirmado * 150000;
    const formattedIngresos = rawIngresos >= 1000000 
      ? `$${(rawIngresos / 1000000).toFixed(1)}M` 
      : `$${(rawIngresos / 1000).toFixed(0)}K`;

    const tiempoAhorrado = Math.round(total * 15 / 60);

    const confirmacionesHoy = patients.filter(p => p.status === 'Confirmado' && (p.nextAppointment?.toLowerCase().includes('hoy') || p.nextAppointment?.toLowerCase().includes('today'))).length;

    const daysName = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const chart = daysName.map(day => ({ d: day, h: 0, p: 0 }));

    const dateHelper = new Date();
    const weekdaysES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const todayES = weekdaysES[dateHelper.getDay()];

    patients.forEach(p => {
      let matchedDay = '';
      const appt = (p.nextAppointment || '').toLowerCase();
      if (appt.includes('lunes') || appt.includes('lun')) matchedDay = 'Lun';
      else if (appt.includes('martes') || appt.includes('mar')) matchedDay = 'Mar';
      else if (appt.includes('miércoles') || appt.includes('mier') || appt.includes('mie')) matchedDay = 'Mie';
      else if (appt.includes('jueves') || appt.includes('jue')) matchedDay = 'Jue';
      else if (appt.includes('viernes') || appt.includes('vie')) matchedDay = 'Vie';
      else if (appt.includes('sábado') || appt.includes('sab')) matchedDay = 'Sab';
      else if (appt.includes('domingo') || appt.includes('dom')) matchedDay = 'Dom';
      else if (appt.includes('hoy') || appt.includes('today')) matchedDay = todayES;
      else matchedDay = 'Lun';

      const dayObj = chart.find(c => c.d === matchedDay);
      if (dayObj) {
        if (p.status === 'Confirmado') {
          dayObj.h += 1;
        } else {
          dayObj.p += 1;
        }
      }
    });

    const formattedChart = chart.map(c => {
      const sum = c.h + c.p;
      const percentage = sum > 0 ? Math.round((c.h / sum) * 100) : 0;
      return { d: c.d, h: percentage, p: 100 - percentage };
    });

    const recientes = patients.slice(0, 3).map(p => ({
      name: p.name,
      desc: `Cita programada · ${p.specialty}`,
    }));

    return {
      inasistenciaRate: inasistenciaRate.toFixed(1) + '%',
      ingresosRecuperados: formattedIngresos,
      confirmacionesHoy,
      tiempoAhorrado: `${tiempoAhorrado}h`,
      chart: formattedChart,
      totalAppointments: total,
      recientes,
    };
  }
}
