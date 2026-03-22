import { plaidClient } from './plaidService';
import { AppDataSource } from '../../ormconfig';
import { Deposit, DepositStatus } from '../entities/Deposit';
import { User } from '../entities/User';
import { BankAccount } from '../entities/BankAccount';

export const initiateDeposit = async (userId: string, bankAccountId: string, amount: number) => {
  const depositRepo = AppDataSource.getRepository(Deposit);
  const userRepo = AppDataSource.getRepository(User);
  const bankAccountRepo = AppDataSource.getRepository(BankAccount);

  const user = await userRepo.findOneBy({ id: userId });
  const bankAccount = await bankAccountRepo.findOneBy({ id: bankAccountId });

  if (!user || !bankAccount) {
    throw new Error('User or bank account not found');
  }

  // Create deposit record
  const deposit = depositRepo.create({
    user,
    bankAccount,
    amount,
    currency: 'USD',
    status: DepositStatus.PENDING,
  });
  await depositRepo.save(deposit);

  // In a real implementation, we would call Plaid Transfer to create a transfer
  // For now, we'll simulate success and update status later via webhook.

  // For demo, we'll just return the deposit
  return deposit;
};
