import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRatingDto } from './dto/create-rating.dto';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createRatingDto: CreateRatingDto) {
    return await this.ratingService.create(createRatingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('restaurant/:restaurantId')
  async findAll(@Param('restaurantId') restaurantId: string) {
    return await this.ratingService.findAll(+restaurantId);
  }
}
