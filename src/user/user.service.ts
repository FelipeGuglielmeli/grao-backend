import { Injectable, ConflictException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../models/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { name, email, password } = createUserDto;

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const hashedEmail = await bcrypt.hash(email, salt);

    const newUser = this.userRepository.create({
      name,
      email: hashedEmail,
      password: hashedPassword,
      isActive: true,
    });

    try {
      const savedUser = await this.userRepository.save(newUser);
      delete savedUser.password;
      delete savedUser.email;
      return savedUser;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
        throw new ConflictException('Email já cadastrado.');
      } else {
        throw new InternalServerErrorException('Erro ao criar o usuário.');
      }
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    try {
      const users = await this.userRepository.find();

      for (const user of users) {
        const isEmailMatch = await bcrypt.compare(email, user.email);
        if (isEmailMatch) {
          return user;
        }
      }

      throw new NotFoundException(`Usuário com email ${email} não encontrado.`);

    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar o usuário por email.');
    }
  }

  async deleteUser(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }

    user.isActive = false;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao desativar o usuário.');
    }
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException('Erro ao alterar a senha.');
    }
  }
}
