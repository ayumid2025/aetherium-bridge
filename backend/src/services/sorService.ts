import { buyOrders, sellOrders } from './matchingEngine';
import { getUniswapQuote } from './uniswapService';
import { OrderSide } from '../entities/Order';

interface Quote {
  source: string;
  price: number;
  quantityAvailable: number;
  costOrProceeds: number; // for buy: total cost in USD; for sell: total proceeds in USD
}

export async function getBestQuote(side: OrderSide, quantity: number): Promise<Quote | null> {
  // 1. Get internal order book quote
  const internalQuote = getInternalQuote(side, quantity);
  // 2. Get Uniswap quote
  const uniswapQuote = await getUniswapQuote(quantity, side === OrderSide.BUY);
  // 3. Compare and return best
  const quotes: Quote[] = [];
  if (internalQuote) quotes.push(internalQuote);
  if (uniswapQuote) {
    quotes.push({
      source: 'uniswap',
      price: uniswapQuote.price,
      quantityAvailable: quantity, // Uniswap can handle any amount (slippage handled later)
      costOrProceeds: side === OrderSide.BUY ? uniswapQuote.price * quantity : uniswapQuote.price * quantity,
    });
  }
  if (quotes.length === 0) return null;
  // For buy, we want the lowest price; for sell, the highest price
  const bestQuote = quotes.reduce((best, current) => {
    if (side === OrderSide.BUY) {
      return current.price < best.price ? current : best;
    } else {
      return current.price > best.price ? current : best;
    }
  });
  return bestQuote;
}

function getInternalQuote(side: OrderSide, quantity: number): Quote | null {
  const orders = side === OrderSide.BUY ? sellOrders : buyOrders; // to buy, we need sell orders
  if (orders.length === 0) return null;

  let remainingQty = quantity;
  let totalCostOrProceeds = 0;
  let weightedPrice = 0;
  for (const order of orders) {
    const fillQty = Math.min(remainingQty, order.remainingQuantity);
    const cost = fillQty * order.price;
    totalCostOrProceeds += cost;
    remainingQty -= fillQty;
    if (remainingQty === 0) break;
  }
  if (remainingQty > 0) return null; // not enough liquidity internally
  const avgPrice = totalCostOrProceeds / quantity;
  return {
    source: 'internal',
    price: avgPrice,
    quantityAvailable: quantity,
    costOrProceeds: totalCostOrProceeds,
  };
}
