import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../models/restaurant.entity';

const mockQueryBuilder = {
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn(),
};

const mockRestaurantRepository = () => ({
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
});

describe('RestaurantService', () => {
  let service: RestaurantService;
  let restaurantRepository: Repository<Restaurant>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantService,
        {
          provide: getRepositoryToken(Restaurant),
          useFactory: mockRestaurantRepository,
        },
      ],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    restaurantRepository = module.get<Repository<Restaurant>>(getRepositoryToken(Restaurant));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated restaurants', async () => {
      const page = 1;
      const limit = 10;

      const mockRestaurants = [
        {
          id: 1,
          name: 'Restaurante 1',
          description: 'Descrição 1',
          deliveryFee: 5,
          averageRating: 4.5,
          phone: '123456789',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Restaurante 2',
          description: 'Descrição 2',
          deliveryFee: 3,
          averageRating: 4.0,
          phone: '987654321',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockTotal = 20;

      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockRestaurants, mockTotal]);

      const result = await service.findAll(page, limit);

      expect(restaurantRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('restaurant.menus', 'menu');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('restaurant.isActive = :isActive', { isActive: true });
      expect(result).toEqual({
        data: mockRestaurants.map(restaurant => ({
          name: restaurant.name,
          description: restaurant.description,
          deliveryFee: restaurant.deliveryFee,
          averageRating: restaurant.averageRating,
        })),
        total: mockTotal,
        page,
        lastPage: Math.ceil(mockTotal / limit),
      });
    });
  });
});
