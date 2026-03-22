import React, { useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface PlaidLinkProps {
  onSuccess: () => void;
}

export const PlaidLink: React.FC<PlaidLinkProps> = ({ onSuccess }) => {
  const { token } = useAuth();
  const [linkToken, setLinkToken] = useState<string | null>(null);

  // Fetch link token from backend
  React.useEffect(() => {
    const createLinkToken = async () => {
      try {
        const res = await axios.post('http://localhost:3000/api/plaid/create-link-token', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLinkToken(res.data.link_token);
      } catch (err) {
        console.error('Failed to create link token', err);
      }
    };
    if (token) createLinkToken();
  }, [token]);

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (public_token, metadata) => {
      // Exchange public token with backend
      try {
        await axios.post('http://localhost:3000/api/plaid/exchange-public-token', { public_token }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        onSuccess();
      } catch (err) {
        console.error('Failed to exchange token', err);
      }
    },
  });

  return (
    <button
      onClick={() => open()}
      disabled={!ready}
      className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
    >
      Link Bank Account
    </button>
  );
};
