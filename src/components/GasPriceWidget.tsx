import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const GasPriceWidget: React.FC = () => {
  const { token } = useAuth();
  const [prices, setPrices] = useState<any>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/gas/prices', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrices(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  if (!prices) return <div>Loading gas prices...</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-bold mb-2">Aetherium Pulse – Live Gas Fees</h2>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <strong>Ethereum</strong>
          <p>Avg: {prices.ethereum.average} gwei</p>
        </div>
        <div>
          <strong>BSC</strong>
          <p>Avg: {prices.bsc.average} gwei</p>
        </div>
        <div>
          <strong>Solana</strong>
          <p>Avg: {prices.solana.average} SOL</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-2">Cheapest now: BSC</p>
    </div>
  );
};

export default GasPriceWidget;
