import { Test, TestingModule } from '@nestjs/testing';
import { RatingService } from './rating.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Rating } from '../models/rating.entity';
import { Restaurant } from '../models/restaurant.entity';
import { User } from '../models/user.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockRatingRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

const mockRestaurantRepository = () => ({
  findOne: jest.fn(),
  update: jest.fn(),
});

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('RatingService', () => {
  let service: RatingService;
  let ratingRepository: Repository<Rating>;
  let restaurantRepository: Repository<Restaurant>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingService,
        {
          provide: getRepositoryToken(Rating),
          useFactory: mockRatingRepository,
        },
        {
          provide: getRepositoryToken(Restaurant),
          useFactory: mockRestaurantRepository,
        },
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<RatingService>(RatingService);
    ratingRepository = module.get<Repository<Rating>>(getRepositoryToken(Rating));
    restaurantRepository = module.get<Repository<Restaurant>>(getRepositoryToken(Restaurant));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new rating', async () => {
      const createRatingDto = { restaurantId: 1, userId: 1, rating: 4.5, comment: 'Great food!' };
      const mockRestaurant = { id: 1, name: 'Test Restaurant' };
      const mockUser = { id: 1, name: 'Test User' };
      const mockRating = { ...createRatingDto, restaurant: mockRestaurant, user: mockUser };

      restaurantRepository.findOne = jest.fn().mockResolvedValue(mockRestaurant);
      userRepository.findOne = jest.fn().mockResolvedValue(mockUser);
      ratingRepository.create = jest.fn().mockReturnValue(mockRating);
      ratingRepository.save = jest.fn().mockResolvedValue(mockRating);
      ratingRepository.find = jest.fn().mockResolvedValue([mockRating]);
      restaurantRepository.update = jest.fn();

      const result = await service.create(createRatingDto);

      expect(restaurantRepository.findOne).toHaveBeenCalledWith({ where: { id: createRatingDto.restaurantId } });
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: createRatingDto.userId } });
      expect(ratingRepository.create).toHaveBeenCalledWith({
        rating: createRatingDto.rating,
        comment: createRatingDto.comment,
        restaurant: mockRestaurant,
        user: mockUser,
      });
      expect(ratingRepository.save).toHaveBeenCalledWith(mockRating);
      expect(restaurantRepository.update).toHaveBeenCalledWith(
        createRatingDto.restaurantId,
        { averageRating: 4.5 }
      );
      expect(result).toEqual(mockRating);
    });

    it('should throw NotFoundException if restaurant is not found', async () => {
      const createRatingDto = { restaurantId: 1, userId: 1, rating: 4.5, comment: 'Great food!' };

      restaurantRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.create(createRatingDto)).rejects.toThrow(NotFoundException);
      expect(restaurantRepository.findOne).toHaveBeenCalledWith({ where: { id: createRatingDto.restaurantId } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const createRatingDto = { restaurantId: 1, userId: 1, rating: 4.5, comment: 'Great food!' };
      const mockRestaurant = { id: 1, name: 'Test Restaurant' };

      restaurantRepository.findOne = jest.fn().mockResolvedValue(mockRestaurant);
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.create(createRatingDto)).rejects.toThrow(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: createRatingDto.userId } });
    });
  });

  describe('findAll', () => {
    it('should return all ratings for a restaurant with only user name', async () => {
      const mockRatings = [
        { id: 1, rating: 4.5, comment: 'Great food!', createdAt: new Date(), updatedAt: new Date(), user: { name: 'User 1' } },
        { id: 2, rating: 3.8, comment: 'Good service', createdAt: new Date(), updatedAt: new Date(), user: { name: 'User 2' } },
      ];

      ratingRepository.find = jest.fn().mockResolvedValue(mockRatings);

      const result = await service.findAll(1);

      expect(ratingRepository.find).toHaveBeenCalledWith({
        where: { restaurant: { id: 1 } },
        relations: ['user'],
      });

      expect(result).toEqual([
        {
          id: 1,
          rating: 4.5,
          comment: 'Great food!',
          createdAt: mockRatings[0].createdAt,
          updatedAt: mockRatings[0].updatedAt,
          user: { name: 'User 1' },
        },
        {
          id: 2,
          rating: 3.8,
          comment: 'Good service',
          createdAt: mockRatings[1].createdAt,
          updatedAt: mockRatings[1].updatedAt,
          user: { name: 'User 2' },
        },
      ]);
    });
  });

  describe('updateRestaurantAverageRating', () => {
    it('should update the average rating of a restaurant', async () => {
      const mockRatings = [
        { rating: 4.5 },
        { rating: 3.5 },
      ];

      ratingRepository.find = jest.fn().mockResolvedValue(mockRatings);
      restaurantRepository.update = jest.fn();

      await service;

      expect(ratingRepository.find).toHaveBeenCalledWith({
        where: { restaurant: { id: 1 } },
      });

      expect(restaurantRepository.update).toHaveBeenCalledWith(1, { averageRating: 4 });
    });
  });

});
