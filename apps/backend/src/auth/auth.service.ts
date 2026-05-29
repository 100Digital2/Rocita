import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // Para la demo de Rocita, usaremos un usuario por defecto con contraseña encriptada
  private readonly defaultUser = {
    email: 'admin@rocita.ai',
    // Hash bcrypt para 'rocita2026'
    passwordHash: '$2b$10$wT0Xq/LzD.3d9Q7L/2J9zOen4G0eB56x6nQ1g9Uj9zO93v6hM6h8y',
    name: 'Administrador Rocita',
    role: 'admin',
  };

  constructor(private readonly jwtService: JwtService) {}

  async login(email: string, pass: string) {
    const isEmailValid = email === this.defaultUser.email;
    
    // Compara la contraseña en texto plano con el hash guardado
    const isPasswordValid = isEmailValid && await bcrypt.compare(pass, this.defaultUser.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = { 
      email: this.defaultUser.email, 
      sub: 'admin-id-123', 
      role: this.defaultUser.role,
      name: this.defaultUser.name
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        email: this.defaultUser.email,
        name: this.defaultUser.name,
        role: this.defaultUser.role,
      },
    };
  }
}
