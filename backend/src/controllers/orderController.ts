import { Request, Response } from 'express';
import { createOrder, cancelOrder } from '../services/orderService';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppDataSource } from '../../ormconfig';
import { Order, OrderSide } from '../entities/Order';
import { buyOrders, sellOrders } from '../services/matchingEngine';

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
