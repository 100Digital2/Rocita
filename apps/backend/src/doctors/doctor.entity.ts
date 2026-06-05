import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  specialty: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  ipsEmail: string; // Relación con el email de la IPS logueada
}
