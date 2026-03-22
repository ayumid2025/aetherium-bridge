import { Order, OrderSide, OrderStatus } from '../entities/Order';
import { AppDataSource } from '../../ormconfig';
import { User } from '../entities/User';

// In‑memory order books (price sorted)
export let buyOrders: Order[] = []; // sorted by price descending
export let sellOrders: Order[] = []; // sorted by price ascending

// Helper to sort orders
function sortBuyOrders() {
  buyOrders.sort((a, b) => b.price - a.price);
}
function sortSellOrders() {
  sellOrders.sort((a, b) => a.price - b.price);
}

// Add an order to the book and attempt matches
export async function addOrder(order: Order) {
  if (order.side === OrderSide.BUY) {
    buyOrders.push(order);
    sortBuyOrders();
  } else {
    sellOrders.push(order);
    sortSellOrders();
  }
  await matchOrders();
}

// Match orders by scanning the top of each book
async function matchOrders() {
  while (buyOrders.length > 0 && sellOrders.length > 0) {
    const bestBuy = buyOrders[0];
    const bestSell = sellOrders[0];

    // Stop if no match (buy price < sell price)
    if (bestBuy.price < bestSell.price) break;

    // Determine fill quantity
    const fillQty = Math.min(bestBuy.remainingQuantity, bestSell.remainingQuantity);
    const totalValue = fillQty * bestSell.price; // price is in USD per ETH

    // Update buyer and seller balances
    const buyer = await AppDataSource.getRepository(User).findOneBy({ id: bestBuy.user.id });
    const seller = await AppDataSource.getRepository(User).findOneBy({ id: bestSell.user.id });
    if (!buyer || !seller) throw new Error('User not found');

    // For a BUY order: buyer pays USD, receives ETH
    buyer.usdBalance -= totalValue;
    buyer.ethBalance += fillQty;

    // For a SELL order: seller receives USD, gives ETH
    seller.usdBalance += totalValue;
    seller.ethBalance -= fillQty;

    await AppDataSource.getRepository(User).save([buyer, seller]);

    // Update order quantities
    bestBuy.remainingQuantity -= fillQty;
    bestSell.remainingQuantity -= fillQty;

    // Determine if orders are fully filled
    if (bestBuy.remainingQuantity === 0) {
      bestBuy.status = OrderStatus.FILLED;
      buyOrders.shift(); // remove from in‑memory
    } else {
      bestBuy.status = OrderStatus.PARTIALLY_FILLED;
      // keep in memory but re‑sort (already sorted)
    }

    if (bestSell.remainingQuantity === 0) {
      bestSell.status = OrderStatus.FILLED;
      sellOrders.shift();
    } else {
      bestSell.status = OrderStatus.PARTIALLY_FILLED;
    }

    // Save updated orders to DB
    await AppDataSource.getRepository(Order).save([bestBuy, bestSell]);
  }
}

// Cancel an order
export async function cancelOrder(orderId: string, userId: string) {
  const orderRepo = AppDataSource.getRepository(Order);
  const order = await orderRepo.findOne({
    where: { id: orderId, user: { id: userId } },
    relations: ['user'],
  });
  if (!order) throw new Error('Order not found');
  if (order.status !== OrderStatus.OPEN && order.status !== OrderStatus.PARTIALLY_FILLED) {
    throw new Error('Order cannot be cancelled');
  }

  order.status = OrderStatus.CANCELLED;
  await orderRepo.save(order);

  // Remove from in‑memory books
  const book = order.side === OrderSide.BUY ? buyOrders : sellOrders;
  const index = book.findIndex(o => o.id === orderId);
  if (index !== -1) book.splice(index, 1);
}
