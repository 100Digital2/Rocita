import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from './doctor.entity';

@Injectable()
export class DoctorsService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) {}

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
