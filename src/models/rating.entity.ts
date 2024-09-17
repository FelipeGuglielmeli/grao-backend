import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  comment: string;

  @ManyToOne(() => User, (user) => user.ratings)
  user: User;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.ratings)
  restaurant: Restaurant;

  @Column('float')
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
