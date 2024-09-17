import { Controller, Post, Body, Delete, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from '../models/user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('create')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (error) {
      throw error;
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number): Promise<void> {
    return this.userService.deleteUser(id);
  }

  @Patch(':id/password')
  async updatePassword(
    @Param('id') id: number,
    @Body('newPassword') newPassword: string,
  ): Promise<void> {
    return this.userService.updatePassword(id, newPassword);
  }
}
