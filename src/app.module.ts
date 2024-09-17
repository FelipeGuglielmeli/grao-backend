import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './models/user.entity';
import { RestaurantModule } from './restaurant/restaurant.module';
import { Restaurant } from './models/restaurant.entity';
import { Address } from './models/address.entity';
import { Menu } from './models/menu.entity';
import { Rating } from './models/rating.entity';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [User, Restaurant, Address, Menu, Rating], 
        synchronize: true,
      }),
    }),
    
    AuthModule,
    UserModule,
    RestaurantModule,
    RatingModule,
  ],
})
export class AppModule {}
