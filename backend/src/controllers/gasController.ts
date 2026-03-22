import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppDataSource } from '../../ormconfig';
import { GasCredit } from '../entities/GasCredit';
import { User } from '../entities/User';
import { fetchGasPrices, getCurrentGasPrice } from '../services/gasPriceService';

// Add gas credits (user pays from USD balance)
export const addGasCredits = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { amount } = req.body; // amount in USD
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    const userRepo = AppDataSource.getRepository(User);
    const gasRepo = AppDataSource.getRepository(GasCredit);

    const user = await userRepo.findOneBy({ id: userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if user has enough USD balance
    if (user.usdBalance < amount) {
      return res.status(400).json({ message: 'Insufficient USD balance' });
    }

    // Deduct from USD balance
    user.usdBalance -= amount;
    await userRepo.save(user);

    // Find or create gas credit record
    let gasCredit = await gasRepo.findOne({ where: { user: { id: userId } } });
    if (!gasCredit) {
      gasCredit = gasRepo.create({ user, balance: amount });
    } else {
      gasCredit.balance += amount;
    }
    await gasRepo.save(gasCredit);

    res.json({ message: `Added $${amount} gas credits`, balance: gasCredit.balance });
  } catch (error) {
    console.error('Add gas credits error:', error);
    res.status(500).json({ message: 'Failed to add gas credits' });
  }
};

// Get gas credit balance
export const getGasBalance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const gasRepo = AppDataSource.getRepository(GasCredit);
    const gasCredit = await gasRepo.findOne({ where: { user: { id: userId } } });
    res.json({ balance: gasCredit?.balance || 0 });
  } catch (error) {
    console.error('Get gas balance error:', error);
    res.status(500).json({ message: 'Failed to get gas balance' });
  }
};

// Estimate gas cost for a transaction (e.g., ETH transfer)
export const estimateGasCost = async (req: Request, res: Response) => {
  try {
    const { network, gasLimit, gasPriceGwei } = req.body;
    // If gasPriceGwei not provided, fetch current average gas price
    let priceGwei = gasPriceGwei;
    if (!priceGwei) {
      await fetchGasPrices();
      priceGwei = getCurrentGasPrice(network, 'average');
    }
    if (!priceGwei) {
      return res.status(400).json({ message: `No gas price available for ${network}` });
    }

    const gasCostEth = (gasLimit * priceGwei) / 1e9; // in ETH (or native token)
    // We need ETH price in USD to convert. For now, we'll hardcode a placeholder.
    // Ideally we would fetch ETH/USD price from an oracle.
    const ethUsdPrice = 3000; // placeholder
    const costUsd = gasCostEth * ethUsdPrice;

    res.json({
      network,
      gasPriceGwei: priceGwei,
      gasLimit,
      gasCostEth,
      costUsd,
    });
  } catch (error) {
    console.error('Estimate gas cost error:', error);
    res.status(500).json({ message: 'Failed to estimate gas cost' });
  }
};

// Utility to deduct gas credits from user (called by other services)
export async function deductGasCredits(userId: string, amountUsd: number): Promise<boolean> {
  const gasRepo = AppDataSource.getRepository(GasCredit);
  const gasCredit = await gasRepo.findOne({ where: { user: { id: userId } } });
  if (!gasCredit || gasCredit.balance < amountUsd) return false;
  gasCredit.balance -= amountUsd;
  await gasRepo.save(gasCredit);
  return true;
}
