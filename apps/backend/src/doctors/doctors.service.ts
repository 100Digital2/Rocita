import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService implements OnModuleInit {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

  async onModuleInit() {
    const doctorCount = await this.doctorRepository.count();
    if (doctorCount === 0) {
      const defaultDoctors = [
        this.doctorRepository.create({
          name: 'Dra. Carolina Gómez',
          specialty: 'Cardiología',
          phone: '310 111 2222',
          email: 'carolina.gomez@rocita.ai',
          ipsEmail: 'admin@rocita.ai',
        }),
        this.doctorRepository.create({
          name: 'Dr. Alejandro Restrepo',
          specialty: 'Dermatología',
          phone: '315 333 4444',
          email: 'alejandro.restrepo@rocita.ai',
          ipsEmail: 'admin@rocita.ai',
        }),
        this.doctorRepository.create({
          name: 'Dr. Manuel Cabrera',
          specialty: 'Oftalmología',
          phone: '312 555 6666',
          email: 'manuel.cabrera@rocita.ai',
          ipsEmail: 'admin@rocita.ai',
        })
      ];
      await this.doctorRepository.save(defaultDoctors);
      console.log('🌱 Semilla de Médicos sembrada en SQLite con éxito.');
    }
  }

  async findAllByIps(ipsEmail: string): Promise<Doctor[]> {
    return this.doctorRepository.find({
      where: { ipsEmail },
    });
  }

  async create(doctorData: Partial<Doctor>, ipsEmail: string): Promise<Doctor> {
    const doctor = this.doctorRepository.create({
      ...doctorData,
      ipsEmail,
    });
    return this.doctorRepository.save(doctor);
  }

  async delete(id: number, ipsEmail: string): Promise<void> {
    const doctor = await this.doctorRepository.findOne({
      where: { id, ipsEmail },
    });

    if (!doctor) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado para esta IPS.`);
    }

    await this.doctorRepository.remove(doctor);
  }
}
