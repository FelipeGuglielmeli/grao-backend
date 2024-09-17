import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRatingDto } from './dto/create-rating.dto';
import { Rating } from '../models/rating.entity';
import { Restaurant } from '../models/restaurant.entity';
import { User } from '../models/user.entity';

@Injectable()
export class RatingService {
    constructor(
        @InjectRepository(Rating)
        private readonly ratingRepository: Repository<Rating>,
        @InjectRepository(Restaurant)
        private readonly restaurantRepository: Repository<Restaurant>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async create(createRatingDto: CreateRatingDto): Promise<Rating> {
        const { restaurantId, userId, rating, comment } = createRatingDto;

        const restaurant = await this.restaurantRepository.findOne({
            where: { id: restaurantId },
        });
        if (!restaurant) {
            throw new NotFoundException(`Restaurante com id ${restaurantId} não encontrado`);
        }

        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException(`Usuário com id ${userId} não encontrado`);
        }

        const newRating = this.ratingRepository.create({
            rating,
            comment,
            restaurant,
            user,
        });

        await this.ratingRepository.save(newRating);

        await this.updateRestaurantAverageRating(restaurantId);

        delete newRating.user.password;
        delete newRating.user.email;

        return newRating;
    }

    async findAll(restaurantId: number): Promise<any[]> {
        const ratings = await this.ratingRepository.find({
            where: { restaurant: { id: restaurantId } },
            relations: ['user'],
        });

        return ratings.map((rating) => ({
            id: rating.id,
            comment: rating.comment,
            rating: rating.rating,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
            user: {
                name: rating.user.name,
            }
        }));
    }

    private async updateRestaurantAverageRating(restaurantId: number): Promise<void> {
        const ratings = await this.ratingRepository.find({
            where: { restaurant: { id: restaurantId } },
        });

        const totalRatings = ratings.length;
        const averageRating = ratings.reduce((sum, rating) => sum + rating.rating, 0) / totalRatings;

        await this.restaurantRepository.update(restaurantId, { averageRating: averageRating });
    }
}
