import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientProfile } from './patient-profile.entity';

@Injectable()
export class PatientProfilesService {
  constructor(
    @InjectRepository(PatientProfile)
    private readonly profileRepository: Repository<PatientProfile>,
  ) {}

  async findAllByIps(ipsEmail: string): Promise<PatientProfile[]> {
    return this.profileRepository.find({
      where: { ipsEmail },
    });
  }

  async findByDocumentAndIps(documentNumber: string, ipsEmail: string): Promise<PatientProfile | null> {
    return this.profileRepository.findOne({
      where: { documentNumber, ipsEmail },
    });
  }

  async create(profileData: Partial<PatientProfile>, ipsEmail: string): Promise<PatientProfile> {
    const existing = await this.profileRepository.findOne({
      where: { documentNumber: profileData.documentNumber, ipsEmail },
    });

    if (existing) {
      // Auto-actualización si ya existe el documento para la misma IPS
      Object.assign(existing, profileData);
      return this.profileRepository.save(existing);
    }

    const profile = this.profileRepository.create({
      ...profileData,
      ipsEmail,
    });
    return this.profileRepository.save(profile);
  }

  async delete(id: number, ipsEmail: string): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { id, ipsEmail },
    });

    if (!profile) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado.`);
    }

    await this.profileRepository.remove(profile);
  }
}
