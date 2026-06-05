import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('patient_profiles')
export class PatientProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: 'CC' })
  documentType: string;

  @Column()
  documentNumber: string;

  @Column({ nullable: true })
  gender: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  ipsEmail: string; // Asocia el paciente a la IPS que lo registró
}
