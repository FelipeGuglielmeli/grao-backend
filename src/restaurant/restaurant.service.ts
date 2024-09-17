import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../models/restaurant.entity';
import { MenuType } from '../models/menu.entity';
import { PaginatedRestaurantsDto } from './dto/paginated-restaurants.dto';
import { RestaurantDetailsDto } from './dto/restaurant-details.dto';
import { MenuDto } from './dto/menu.dto'

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) { }

  async findAll(page: number, limit: number, searchTerm?: string): Promise<PaginatedRestaurantsDto> {
    try {
      const queryBuilder = this.restaurantRepository.createQueryBuilder('restaurant')
        .leftJoinAndSelect('restaurant.menus', 'menu')
        .where('restaurant.isActive = :isActive', { isActive: true })
        .take(limit)
        .skip((page - 1) * limit);

      if (searchTerm) {
        queryBuilder.andWhere(
          `(restaurant.name LIKE :searchTerm OR restaurant.description LIKE :searchTerm 
            OR menu.name LIKE :searchTerm OR menu.description LIKE :searchTerm)`,
          { searchTerm: `%${searchTerm}%` }
        );
      }

      const [restaurants, total] = await queryBuilder.getManyAndCount();

      const restaurantData = restaurants.map((restaurant) => {
        const { id, name, description, deliveryFee, averageRating } = restaurant;
        return {
          id,
          name,
          description,
          deliveryFee,
          averageRating,
        };
      });

      return {
        data: restaurantData,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Erro ao buscar restaurantes:', error.message, error.stack);
      throw new InternalServerErrorException('Erro ao buscar restaurantes');
    }
  }

  async findOne(id: number): Promise<RestaurantDetailsDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id, isActive: true },
        relations: ['address'],
      });

      if (!restaurant) {
        throw new NotFoundException(`Restaurante com id ${id} não encontrado`);
      }

      if (!restaurant.address) {
        throw new NotFoundException(`Endereço não encontrado para o restaurante com id ${id}`);
      }

      const { name, averageRating, phone, deliveryFee, address } = restaurant;

      return {
        id,
        name,
        averageRating,
        deliveryFee,
        phone,
        address: {
          street: address.street,
          city: address.city,
          number: address.number,
          neighborhood: address.neighborhood,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException('Erro ao buscar restaurante');
    }
  }

  async getMenu(id: number): Promise<MenuDto> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        where: { id, isActive: true },
        relations: ['menus'],
      });

      if (!restaurant) {
        throw new NotFoundException(`Restaurante com id ${id} não encontrado`);
      }

      const dishes = restaurant.menus.filter(
        (menu) => menu.type === MenuType.DISH && menu.isActive
      );

      const drinks = restaurant.menus.filter(
        (menu) => menu.type === MenuType.DRINK && menu.isActive
      );

      return {
        dishes: dishes.map((dish) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          price: dish.price,
        })),
        drinks: drinks.map((drink) => ({
          id: drink.id,
          name: drink.name,
          description: drink.description,
          price: drink.price,
        })),
      };
    } catch (error) {
      console.error('Erro ao buscar o cardápio do restaurante:', error);
      throw new InternalServerErrorException('Erro ao buscar o cardápio do restaurante');
    }
  }
}
