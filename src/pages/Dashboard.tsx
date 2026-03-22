import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { PlaidLink } from '../components/PlaidLink'; // we'll create this next

interface BankAccount {
  id: string;
  name: string;
  type: string;
  subtype: string;
}

const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  useEffect(() => {
    if (token) {
      fetchBankAccounts();
    }
  }, [token]);

  const fetchBankAccounts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/plaid/accounts');
      setBankAccounts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">USD Balance</h2>
          <p className="text-2xl">${user?.usdBalance?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-lg font-semibold">ETH Balance</h2>
          <p className="text-2xl">{user?.ethBalance?.toFixed(4) || '0.0000'} ETH</p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Linked Bank Accounts</h2>
        {bankAccounts.length === 0 ? (
          <p>No accounts linked. <PlaidLink onSuccess={fetchBankAccounts} /></p>
        ) : (
          <ul>
            {bankAccounts.map(acc => (
              <li key={acc.id}>{acc.name} ({acc.subtype})</li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <button className="bg-green-600 text-white px-4 py-2 rounded mr-2">Deposit</button>
        <button className="bg-red-600 text-white px-4 py-2 rounded">Withdraw</button>
      </div>
    </div>
  );
};

export default Dashboard;
