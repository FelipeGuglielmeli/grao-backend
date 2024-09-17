import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

const mockUserService = () => ({
  findByEmail: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('testToken'),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('validateUser', () => {
    it('should return user data without password if validation succeeds', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ratings: [],
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await authService.validateUser(user.email, 'senha123');

      expect(userService.findByEmail).toHaveBeenCalledWith(user.email);
      expect(bcrypt.compare).toHaveBeenCalledWith('senha123', user.password);

      expect(result).toEqual({
        id: user.id,
        name: user.name,
        email: user.email,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        ratings: [],
      });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ratings: [],
      };

      jest.spyOn(userService, 'findByEmail').mockResolvedValue(user);

      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(authService.validateUser(user.email, 'wrongPassword')).rejects.toThrow(
        'Credenciais inválidas: senha incorreta.'
      );
    });
  });
});
