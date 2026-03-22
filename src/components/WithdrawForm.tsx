import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const WithdrawForm: React.FC = () => {
  const { token } = useAuth();
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/withdraw/eth', { address, amount: parseFloat(amount) }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Withdrawal initiated');
      setAddress('');
      setAmount('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Withdrawal failed');
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h2 className="text-xl font-bold mb-2">Withdraw ETH</h2>
      <form onSubmit={handleWithdraw}>
        <div className="mb-2">
          <label className="block">Destination Address</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full border p-1 rounded" required />
        </div>
        <div className="mb-2">
          <label className="block">Amount (ETH)</label>
          <input type="number" step="0.001" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border p-1 rounded" required />
        </div>
        <button type="submit" className="bg-red-600 text-white px-3 py-1 rounded">Withdraw</button>
      </form>
    </div>
  );
};

export default WithdrawForm;
