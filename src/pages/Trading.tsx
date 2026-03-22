import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import OrderBook from '../components/OrderBook';
import toast from 'react-hot-toast';

const Trading: React.FC = () => {
  const { token } = useAuth();
  const [bids, setBids] = useState<any[]>([]);
  const [asks, setAsks] = useState<any[]>([]);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    fetchOrderBook();
    // WebSocket connection for real-time updates (optional)
    const ws = new WebSocket('ws://localhost:3000');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'orderBook') {
        setBids(data.bids);
        setAsks(data.asks);
      }
    };
    return () => ws.close();
  }, []);

  const fetchOrderBook = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/orders/book');
      setBids(res.data.bids);
      setAsks(res.data.asks);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/orders', {
        side,
        price: parseFloat(price),
        quantity: parseFloat(quantity),
        symbol: 'ETH/USD',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order placed');
      setPrice('');
      setQuantity('');
      fetchOrderBook(); // refresh
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order failed');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">ETH/USD Trading</h1>
      <div className="grid grid-cols-2 gap-8">
        <div>
          <OrderBook bids={bids} asks={asks} />
        </div>
        <div>
          <form onSubmit={handlePlaceOrder} className="bg-white p-4 rounded shadow">
            <div className="mb-4">
              <label className="block mb-1">Side</label>
              <select value={side} onChange={(e) => setSide(e.target.value as any)} className="w-full p-2 border rounded">
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Price (USD per ETH)</label>
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full p-2 border rounded" required />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Quantity (ETH)</label>
              <input type="number" step="0.0001" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full p-2 border rounded" required />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Place {side === 'buy' ? 'Buy' : 'Sell'} Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Trading;
