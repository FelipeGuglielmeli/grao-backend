import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { Rating } from '../models/rating.entity';
import { Restaurant } from '../models/restaurant.entity';
import { User } from '../models/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rating, Restaurant, User])],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule { }
