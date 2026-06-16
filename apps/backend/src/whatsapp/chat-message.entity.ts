import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string; // Número de teléfono limpio (ej: 3101234567)

  @Column()
  sender: 'rocita' | 'paciente';

  @Column('text')
  text: string;

  @Column()
  time: string; // Hora formateada (ej: 10:30 AM)

  @CreateDateColumn()
  createdAt: Date;
}
