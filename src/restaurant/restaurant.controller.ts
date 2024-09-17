import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { PaginatedRestaurantsDto } from './dto/paginated-restaurants.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RestaurantDetailsDto } from './dto/restaurant-details.dto';
import { MenuDto } from './dto/menu.dto';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('searchTerm') searchTerm?: string,
  ): Promise<PaginatedRestaurantsDto> {
    return this.restaurantService.findAll(page, limit, searchTerm);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<RestaurantDetailsDto> {
    return this.restaurantService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/menu')
  async getMenu(@Param('id') id: number): Promise<MenuDto> {
    return this.restaurantService.getMenu(id);
  }
}
