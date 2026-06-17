import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: 'confirmacion' | 'cancelacion' | 'fallo' | 'sistema';

  @Column({ nullable: true })
  patientName: string;

  @Column({ nullable: true })
  doctorName: string;

  @Column({ nullable: true })
  specialty: string;

  @Column('text')
  text: string;

  @Column()
  time: string; // E.g., "Hace 5 mins", "10:30 AM"

  @Column({ default: true })
  unread: boolean;

  @Column('simple-json', { nullable: true })
  chatHistory: { sender: 'paciente' | 'rocita'; text: string; time: string }[];

  @Column()
  ipsEmail: string; // Asocia la alerta a la IPS que la originó

  @CreateDateColumn()
  createdAt: Date;
}
