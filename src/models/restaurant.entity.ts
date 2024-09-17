import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Address } from './address.entity';
import { Menu } from './menu.entity';
import { Rating } from './rating.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  averageRating: number;

  @Column({ nullable: true })
  description: string;

  @Column()
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToOne(() => Address, (address) => address.restaurant)
  address: Address;

  @OneToMany(() => Menu, (menu) => menu.restaurant)
  menus: Menu[];

  @OneToMany(() => Rating, (rating) => rating.restaurant)
  ratings: Rating[];

  @Column('float', { nullable: true })
  deliveryFee: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
