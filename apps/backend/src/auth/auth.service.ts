import { Injectable, UnauthorizedException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // Semilla asíncrona automatizada al iniciar el servidor de desarrollo
  async onModuleInit() {
    const adminEmail = 'admin@rocita.ai';
    const adminExists = await this.userRepository.findOne({ where: { email: adminEmail } });
    
    if (!adminExists) {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash('rocita2026', saltRounds);
      
      const defaultAdmin = this.userRepository.create({
        email: adminEmail,
        passwordHash,
        name: 'Administrador Rocita',
        clinicName: 'Clínica Principal Rocita',
        role: 'admin',
      });
      
      await this.userRepository.save(defaultAdmin);
      console.log('🌱 Semilla de Administrador de Rocita sembrada con éxito en SQLite.');
    }
  }

  async register(userData: { clinicName: string; nit: string; address: string; phone: string; email: string; pass: string }) {
    const emailLower = userData.email.toLowerCase();
    const existingUser = await this.userRepository.findOne({ where: { email: emailLower } });
    
    if (existingUser) {
      throw new BadRequestException('El correo institucional ya se encuentra registrado.');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(userData.pass, saltRounds);

    const newUser = this.userRepository.create({
      email: emailLower,
      passwordHash,
      name: userData.clinicName, // Para compatibilidad con avatar/iniciales
      clinicName: userData.clinicName,
      role: 'admin',
      nit: userData.nit,
      address: userData.address,
      phone: userData.phone,
    });

    await this.userRepository.save(newUser);

    return {
      message: 'Cuenta registrada exitosamente en el sistema.',
      user: {
        email: newUser.email,
        name: newUser.name,
        clinicName: newUser.clinicName,
        role: newUser.role,
        nit: newUser.nit,
        address: newUser.address,
        phone: newUser.phone,
      }
    };
  }

  async login(email: string, pass: string) {
    const emailLower = email.toLowerCase();
    const user = await this.userRepository.findOne({ where: { email: emailLower } });
    
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
    
    // Compara la contraseña en texto plano con el hash guardado en SQLite
    const isPasswordValid = await bcrypt.compare(pass, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { 
      email: user.email, 
      sub: `user-id-${user.email}`, 
      role: user.role,
      name: user.name,
      clinicName: user.clinicName,
      nit: user.nit,
      address: user.address,
      phone: user.phone,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        email: user.email,
        name: user.name,
        role: user.role,
        clinicName: user.clinicName,
        nit: user.nit,
        address: user.address,
        phone: user.phone,
      },
    };
  }
}
