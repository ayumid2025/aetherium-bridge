import { AppDataSource } from '../../ormconfig';
import { Order, OrderSide, OrderStatus } from '../entities/Order';
import { User } from '../entities/User';
import { addOrder, cancelOrder as cancelOrderEngine } from './matchingEngine';

export async function createOrder(userId: string, side: OrderSide, price: number, quantity: number, symbol: string = 'ETH/USD') {
  const userRepo = AppDataSource.getRepository(User);
  const orderRepo = AppDataSource.getRepository(Order);

  const user = await userRepo.findOneBy({ id: userId });
  if (!user) throw new Error('User not found');

  // Check balance
  const totalCost = price * quantity;
  if (side === OrderSide.BUY && user.usdBalance < totalCost) {
    throw new Error('Insufficient USD balance');
  }
  if (side === OrderSide.SELL && user.ethBalance < quantity) {
    throw new Error('Insufficient ETH balance');
  }

  // Reserve funds (subtract from balance temporarily)
  if (side === OrderSide.BUY) {
    user.usdBalance -= totalCost;
  } else {
    user.ethBalance -= quantity;
  }
  await userRepo.save(user);

  // Create order
  const order = orderRepo.create({
    user,
    side,
    symbol,
    price,
    quantity,
    remainingQuantity: quantity,
    status: OrderStatus.OPEN,
  });
  await orderRepo.save(order);

  // Add to matching engine
  await addOrder(order);

  return order;
}

export { cancelOrderEngine as cancelOrder };
