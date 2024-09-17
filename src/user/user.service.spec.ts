import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../models/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  findOne: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('createUser', () => {
    it('should hash the password and save the user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'senha123',
      };

      const salt = 'testSalt';
      const hashedPassword = 'hashedPassword';

      jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => Promise.resolve(salt));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));

      const user = {
        id: 1,
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        isActive: true,
      } as User;

      jest.spyOn(userRepository, 'create').mockReturnValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      const result = await userService.createUser(createUserDto);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, salt);
      expect(userRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        isActive: true,
      });
      expect(userRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);
    });
  });

  describe('deleteUser', () => {
    it('should set isActive to false instead of deleting the user', async () => {
      // Mock the user
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        isActive: true,
      } as User;

      // Mock findOne to return the user
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'save').mockResolvedValue({ ...user, isActive: false });

      // Call the deleteUser function
      await userService.deleteUser(user.id);

      // Assertions
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
      expect(user.isActive).toBe(false); // Ensure isActive is set to false
      expect(userRepository.save).toHaveBeenCalledWith({ ...user, isActive: false });
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      // Mock findOne to return null (user not found)
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      // Expect an exception to be thrown
      await expect(userService.deleteUser(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updatePassword', () => {
    it('should update the user password', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'oldPassword',
        isActive: true,
      } as User;

      const newPassword = 'newPassword123';
      const salt = 'testSalt';
      const hashedPassword = 'hashedNewPassword';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => Promise.resolve(salt));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);

      await userService.updatePassword(user.id, newPassword);

      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: user.id } });
      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, salt);
      expect(user.password).toBe(hashedPassword);
      expect(userRepository.save).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(userService.updatePassword(1, 'newPassword')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if saving the user fails', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'oldPassword',
        isActive: true,
      } as User;

      const newPassword = 'newPassword123';
      const salt = 'testSalt';
      const hashedPassword = 'hashedNewPassword';

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'genSalt').mockImplementation(() => Promise.resolve(salt));
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      jest.spyOn(userRepository, 'save').mockRejectedValue(new Error());

      await expect(userService.updatePassword(user.id, newPassword)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
