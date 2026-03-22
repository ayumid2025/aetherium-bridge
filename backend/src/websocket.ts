import { WebSocketServer } from 'ws';
import { buyOrders, sellOrders } from './services/matchingEngine';

let wss: WebSocketServer;

export const initWebSocket = (server: any) => {
  wss = new WebSocketServer({ server });
  wss.on('connection', (ws) => {
    // Send initial order book
    ws.send(JSON.stringify({ type: 'orderBook', bids: buyOrders, asks: sellOrders }));
    // Optionally, broadcast updates when orders change
  });
};

export const broadcastOrderBook = () => {
  if (!wss) return;
  const data = JSON.stringify({
    type: 'orderBook',
    bids: buyOrders.map(o => ({ price: o.price, quantity: o.remainingQuantity })),
    asks: sellOrders.map(o => ({ price: o.price, quantity: o.remainingQuantity })),
  });
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) client.send(data);
  });
};
