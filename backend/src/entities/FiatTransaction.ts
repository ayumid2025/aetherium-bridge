import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { BankAccount } from './BankAccount';

export type TransactionType = 'deposit' | 'withdrawal';
export type TransactionStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity('fiat_transactions')
export class FiatTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => BankAccount, { nullable: true })
  bankAccount: BankAccount;

  @Column()
  type: TransactionType;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  amount: number;

  @Column()
  currency: string; // 'USD', 'EUR'

  @Column()
  status: TransactionStatus;

  @Column({ nullable: true })
  externalId: string; // Plaid transaction ID or bank reference

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
}
