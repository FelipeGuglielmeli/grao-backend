import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  number: string;

  @Column()
  neighborhood: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Restaurant, (restaurant) => restaurant.address)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
