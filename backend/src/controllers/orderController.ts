import { Request, Response } from 'express';
import { createOrder, cancelOrder } from '../services/orderService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppDataSource } from '../../ormconfig';
import { Order, OrderSide } from '../entities/Order';
import { buyOrders, sellOrders } from '../services/matchingEngine';
import { getBestQuote } from '../services/sorService';
import { createOrder } from '../services/orderService';

export const marketOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { side, quantity } = req.body;
    if (!side || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const quote = await getBestQuote(side, quantity);
    if (!quote) {
      return res.status(400).json({ message: 'No liquidity available' });
    }
    // Execute the trade at the quoted price
    // For internal, we need to consume the order book orders; for uniswap, we need to execute a swap.
    // For simplicity, we'll just create a limit order at the quoted price (which will get matched immediately).
    const order = await createOrder(req.userId!, side, quote.price, quantity, 'ETH/USD');
    // Optionally, we could mark that this order came from SOR and was routed externally.
    res.json({ order, quote });
  } catch (error: any) {
    console.error('Market order error:', error);
    res.status(400).json({ message: error.message });
  }
};
export const placeOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { side, price, quantity, symbol } = req.body;
    if (!side || !price || !quantity) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    if (side !== OrderSide.BUY && side !== OrderSide.SELL) {
      return res.status(400).json({ message: 'Invalid side' });
    }
    const order = await createOrder(req.userId!, side, price, quantity, symbol || 'ETH/USD');
    res.status(201).json(order);
  } catch (error: any) {
    console.error('Place order error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const cancelOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    await cancelOrder(orderId, req.userId!);
    res.json({ message: 'Order cancelled' });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    res.status(400).json({ message: error.message });
  }
};

export const getOrderBook = async (req: Request, res: Response) => {
  // Return aggregated order book from in‑memory orders
  const bids = buyOrders.map(o => ({ price: o.price, quantity: o.remainingQuantity }));
  const asks = sellOrders.map(o => ({ price: o.price, quantity: o.remainingQuantity }));
  res.json({ bids, asks });
};

export const getUserOrders = async (req: AuthRequest, res: Response) => {
  const orderRepo = AppDataSource.getRepository(Order);
  const orders = await orderRepo.find({
    where: { user: { id: req.userId } },
    order: { createdAt: 'DESC' },
  });
  res.json(orders);
};
