import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

export enum OrderSide {
  BUY = 'buy',
  SELL = 'sell',
}

export enum OrderStatus {
  OPEN = 'open',
  PARTIALLY_FILLED = 'partially_filled',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'enum', enum: OrderSide })
  side: OrderSide;

  @Column()
  symbol: string; // e.g., 'ETH/USD'

  @Column('decimal', { precision: 20, scale: 8 })
  price: number; // price per unit

  @Column('decimal', { precision: 20, scale: 8 })
  quantity: number; // amount of crypto (ETH)

  @Column('decimal', { precision: 20, scale: 8 })
  remainingQuantity: number; // quantity still unfilled

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.OPEN })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
