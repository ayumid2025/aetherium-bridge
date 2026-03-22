import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppDataSource } from '../../ormconfig';
import { BankAccount } from '../entities/BankAccount';
import { FiatBalance } from '../entities/FiatBalance';
import { FiatTransaction } from '../entities/FiatTransaction';
import { createLinkToken, exchangePublicToken, initiateDeposit } from '../services/plaidService';

export const getLinkToken = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const linkToken = await createLinkToken(userId);
    res.json({ link_token: linkToken });
  } catch (error) {
    console.error('Error creating link token:', error);
    res.status(500).json({ message: 'Failed to create link token' });
  }
};

export const exchangeToken = async (req: AuthRequest, res: Response) => {
  try {
    const { public_token } = req.body;
    if (!public_token) {
      return res.status(400).json({ message: 'Public token required' });
    }

    const exchangeResponse = await exchangePublicToken(public_token);
    const { access_token, item_id } = exchangeResponse;

    // Get account details (optional, to show user-friendly name)
    // For now, we just store the token. In real app, you'd fetch accounts and let user choose.
    const bankAccountRepo = AppDataSource.getRepository(BankAccount);
    const newAccount = bankAccountRepo.create({
      user: { id: req.userId } as any,
      plaidAccessToken: access_token,
      plaidItemId: item_id,
      accountName: 'Linked Bank Account',
      isActive: true,
    });
    await bankAccountRepo.save(newAccount);

    res.json({ message: 'Bank account linked successfully', accountId: newAccount.id });
  } catch (error) {
    console.error('Error exchanging token:', error);
    res.status(500).json({ message: 'Failed to link bank account' });
  }
};

export const getBankAccounts = async (req: AuthRequest, res: Response) => {
  try {
    const bankAccountRepo = AppDataSource.getRepository(BankAccount);
    const accounts = await bankAccountRepo.find({
      where: { user: { id: req.userId } as any },
      select: ['id', 'accountName', 'accountMask', 'isActive', 'createdAt'],
    });
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ message: 'Failed to fetch bank accounts' });
  }
};

export const getBalance = async (req: AuthRequest, res: Response) => {
  try {
    const balanceRepo = AppDataSource.getRepository(FiatBalance);
    let balance = await balanceRepo.findOne({ where: { user: { id: req.userId } as any } });
    if (!balance) {
      // Create default balance if not exists
      balance = balanceRepo.create({ user: { id: req.userId } as any, usdBalance: 0, eurBalance: 0 });
      await balanceRepo.save(balance);
    }
    res.json({ usd: balance.usdBalance, eur: balance.eurBalance });
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ message: 'Failed to fetch balance' });
  }
};

export const initiateDepositRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, amount, currency = 'USD' } = req.body;
    if (!accountId || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Account ID and positive amount required' });
    }

    const bankAccountRepo = AppDataSource.getRepository(BankAccount);
    const bankAccount = await bankAccountRepo.findOne({ where: { id: accountId, user: { id: req.userId } as any } });
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // In sandbox, we can simulate deposit. Real implementation would call Plaid Transfer or other API.
    const depositResult = await initiateDeposit(bankAccount.plaidAccessToken!, amount);

    // Create transaction record
    const transactionRepo = AppDataSource.getRepository(FiatTransaction);
    const transaction = transactionRepo.create({
      user: { id: req.userId } as any,
      bankAccount,
      type: 'deposit',
      amount,
      currency,
      status: 'pending',
      externalId: depositResult.transactionId,
    });
    await transactionRepo.save(transaction);

    // For now, we'll simulate immediate completion (in production, we'd wait for webhook)
    // This is just for demonstration.
    transaction.status = 'completed';
    await transactionRepo.save(transaction);

    // Update user's fiat balance
    const balanceRepo = AppDataSource.getRepository(FiatBalance);
    let balance = await balanceRepo.findOne({ where: { user: { id: req.userId } as any } });
    if (!balance) {
      balance = balanceRepo.create({ user: { id: req.userId } as any, usdBalance: 0, eurBalance: 0 });
    }
    if (currency === 'USD') {
      balance.usdBalance += amount;
    } else if (currency === 'EUR') {
      balance.eurBalance += amount;
    }
    await balanceRepo.save(balance);

    res.json({ message: 'Deposit initiated', transactionId: transaction.id, newBalance: balance.usdBalance });
  } catch (error) {
    console.error('Error initiating deposit:', error);
    res.status(500).json({ message: 'Failed to initiate deposit' });
  }
};
