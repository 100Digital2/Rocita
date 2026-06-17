import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async findAllByIps(ipsEmail: string): Promise<Notification[]> {
    const list = await this.notificationRepository.find({
      where: { ipsEmail },
      order: { createdAt: 'DESC' },
    });

    if (list.length === 0) {
      // Si la lista está vacía, auto-sembramos las alertas iniciales para esta IPS
      return this.seed(ipsEmail);
    }

    return list;
  }

  async create(notificationData: Partial<Notification>, ipsEmail: string): Promise<Notification> {
    const notification = this.notificationRepository.create({
      ...notificationData,
      ipsEmail,
    });
    return this.notificationRepository.save(notification);
  }

  async update(id: number, notificationData: Partial<Notification>, ipsEmail: string): Promise<Notification> {
    await this.notificationRepository.update({ id, ipsEmail }, notificationData);
    const updated = await this.notificationRepository.findOne({ where: { id, ipsEmail } });
    if (!updated) {
      throw new Error(`Notification with id ${id} not found`);
    }
    return updated;
  }

  async markAllAsRead(ipsEmail: string): Promise<void> {
    await this.notificationRepository.update({ ipsEmail, unread: true }, { unread: false });
  }

  async delete(id: number, ipsEmail: string): Promise<void> {
    await this.notificationRepository.delete({ id, ipsEmail });
  }

  async clearAll(ipsEmail: string): Promise<void> {
    await this.notificationRepository.delete({ ipsEmail });
  }

  private async seed(ipsEmail: string): Promise<Notification[]> {
    const initialMockNotifications: Partial<Notification>[] = [
      {
        type: 'confirmacion',
        patientName: 'Carlos Humberto Pérez',
        doctorName: 'Dra. Carolina Gómez',
        specialty: 'Cardiología',
        text: 'Carlos Humberto Pérez ha confirmado su cita para el Lunes 25 de Mayo a las 10:30 AM.',
        time: 'Hace 5 mins',
        unread: true,
        chatHistory: [
          { sender: 'rocita', text: 'Hola Carlos. Te escribe Rocita virtual...', time: '09:00 AM' },
          { sender: 'paciente', text: 'Hola! Sí claro, allá estaré.', time: '09:02 AM' },
          { sender: 'rocita', text: '¡Excelente! Hemos confirmado tu asistencia.', time: '09:02 AM' }
        ]
      },
      {
        type: 'cancelacion',
        patientName: 'Laura Ruiz',
        doctorName: 'Dr. Alejandro Restrepo',
        specialty: 'Dermatología',
        text: 'Laura Ruiz ha cancelado su cita de Dermatología debido a motivos de fuerza mayor.',
        time: 'Hace 24 mins',
        unread: true,
        chatHistory: [
          { sender: 'rocita', text: 'Hola Laura. Te escribe Rocita...', time: '08:30 AM' },
          { sender: 'paciente', text: '2', time: '08:42 AM' },
          { sender: 'rocita', text: 'Entendido, Laura. Has indicado que NO asistirás.', time: '08:42 AM' }
        ]
      },
      {
        type: 'fallo',
        patientName: 'Mateo Sánchez',
        text: 'Recordatorio fallido: El número de paciente (+57 312 456 7890) no cuenta con una cuenta de WhatsApp activa.',
        time: 'Hace 1 hora',
        unread: true,
        chatHistory: []
      },
      {
        type: 'sistema',
        text: 'La campaña oficial "Recordatorios Lunes" se ha ejecutado con éxito. Se enviaron 120 recordatorios y la tasa de confirmación actual es del 92%.',
        time: 'Hace 2 horas',
        unread: false,
        chatHistory: []
      },
      {
        type: 'confirmacion',
        patientName: 'Martha Lucía Gómez',
        doctorName: 'Dra. Sandra Ortiz',
        specialty: 'Pediatría',
        text: 'Martha Lucía Gómez ha confirmado la cita de pediatría de su hijo para mañana a las 9:00 AM.',
        time: 'Hace 3 horas',
        unread: false,
        chatHistory: [
          { sender: 'rocita', text: 'Hola Martha. Te escribe Rocita. Recordamos la cita de Pediatría programada para mañana a las 9:00 AM con la Dra. Sandra Ortiz. ¿Confirmas la asistencia? responde 1 para SÍ, o 2 para NO.', time: '07:05 AM' },
          { sender: 'paciente', text: '1', time: '07:15 AM' },
          { sender: 'rocita', text: '¡Cita Confirmada con éxito! Gracias por tu puntualidad. Recuerda llegar 15 minutos antes.', time: '07:16 AM' }
        ]
      }
    ];

    const entities = initialMockNotifications.map((notif) => 
      this.notificationRepository.create({ ...notif, ipsEmail })
    );

    await this.notificationRepository.save(entities);

    return this.notificationRepository.find({
      where: { ipsEmail },
      order: { createdAt: 'DESC' },
    });
  }
}
