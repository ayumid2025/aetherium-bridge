import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { BankAccount } from './BankAccount';

export enum DepositStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('deposits')
export class Deposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => BankAccount, (bankAccount) => bankAccount.id, { nullable: true })
  bankAccount: BankAccount;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string; // e.g., USD

  @Column({ type: 'enum', enum: DepositStatus, default: DepositStatus.PENDING })
  status: DepositStatus;

  @Column({ nullable: true })
  plaidTransferId: string; // if we use Plaid Transfer

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
