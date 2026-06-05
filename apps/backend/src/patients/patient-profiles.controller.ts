import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PatientProfilesService } from './patient-profiles.service';
import { AuthGuard } from '../auth/auth.guard';
import { PatientProfile } from './patient-profile.entity';

@Controller('patients-profiles')
@UseGuards(AuthGuard)
export class PatientProfilesController {
  constructor(private readonly profilesService: PatientProfilesService) {}

  @Get()
  async getProfiles(@Request() req) {
    const ipsEmail = req.user.email;
    return this.profilesService.findAllByIps(ipsEmail);
  }

  @Post()
  async createProfile(@Body() profileData: Partial<PatientProfile>, @Request() req) {
    const ipsEmail = req.user.email;
    return this.profilesService.create(profileData, ipsEmail);
  }

  @Delete(':id')
  async deleteProfile(@Param('id') id: string, @Request() req) {
    const ipsEmail = req.user.email;
    return this.profilesService.delete(Number(id), ipsEmail);
  }
}
