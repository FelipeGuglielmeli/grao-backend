import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantService } from './restaurant.service';
import { RestaurantController } from './restaurant.controller';
import { Restaurant } from '../models/restaurant.entity';
import { Menu } from '../models/menu.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Menu])],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule { }
