import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Credenciais inválidas: email não encontrado.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas: senha incorreta.');
      }

      const { password: userPassword, ...result } = user;
      return result;

    } catch (error) {
      throw error;
    }
  }

  async login(user: any) {
    try {
      const payload = { email: user.email, sub: user.id };

      const token = this.jwtService.sign(payload);

      return {
        accessToken: token,
        user: {
          id: user.id,
          name: user.name,
          isActive: user.isActive,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao fazer login.');
    }
  }
}
