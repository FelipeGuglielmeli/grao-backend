import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

export enum MenuType {
  DRINK = 'drink',
  DISH = 'dish',
}

@Entity()
export class Menu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MenuType,
    default: MenuType.DISH,
  })
  type: MenuType;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('float')
  price: number;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menus)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
