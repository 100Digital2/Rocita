import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { AuthGuard } from '../auth/auth.guard';
import { Doctor } from './doctor.entity';

@Controller('doctors')
@UseGuards(AuthGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async getDoctors(@Request() req) {
    // req.user contiene el payload de JWT decodificado
    const ipsEmail = req.user.email;
    return this.doctorsService.findAllByIps(ipsEmail);
  }

  @Post()
  async createDoctor(@Body() doctorData: Partial<Doctor>, @Request() req) {
    const ipsEmail = req.user.email;
    return this.doctorsService.create(doctorData, ipsEmail);
  }

  @Delete(':id')
  async deleteDoctor(@Param('id') id: string, @Request() req) {
    const ipsEmail = req.user.email;
    return this.doctorsService.delete(Number(id), ipsEmail);
  }
}
