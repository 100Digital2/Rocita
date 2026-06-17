import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../auth/auth.guard';
import { Notification } from './notification.entity';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Request() req) {
    const ipsEmail = req.user.email;
    return this.notificationsService.findAllByIps(ipsEmail);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(@Body() notificationData: Partial<Notification>, @Request() req) {
    const ipsEmail = req.user.email;
    return this.notificationsService.create(notificationData, ipsEmail);
  }

  @Patch(':id')
  async updateNotification(@Param('id') id: string, @Body() notificationData: Partial<Notification>, @Request() req) {
    const ipsEmail = req.user.email;
    return this.notificationsService.update(Number(id), notificationData, ipsEmail);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req) {
    const ipsEmail = req.user.email;
    await this.notificationsService.markAllAsRead(ipsEmail);
    return { message: 'Todas las notificaciones marcadas como leídas' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(@Param('id') id: string, @Request() req) {
    const ipsEmail = req.user.email;
    await this.notificationsService.delete(Number(id), ipsEmail);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearAllNotifications(@Request() req) {
    const ipsEmail = req.user.email;
    await this.notificationsService.clearAll(ipsEmail);
  }
}
