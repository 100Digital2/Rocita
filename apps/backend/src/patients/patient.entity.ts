import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  age: number;

  @Column({ nullable: true, default: 'CC' })
  documentType: string;

  @Column({ nullable: true })
  documentNumber: string;

  @Column({ nullable: true })
  gender: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ default: 'Pendiente' })
  status: string; // 'Confirmado' | 'Pendiente' | 'Cancelado'

  @Column({ nullable: true })
  specialty: string;

  @Column({ nullable: true })
  doctor: string;

  @Column({ nullable: true })
  doctorEmail: string;

  @Column({ nullable: true })
  doctorPhone: string;

  @Column({ nullable: true })
  nextAppointment: string;
}
