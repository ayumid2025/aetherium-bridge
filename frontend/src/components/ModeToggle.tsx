import React from 'react';
import { useWallet } from '../contexts/WalletContext';

const ModeToggle: React.FC = () => {
  const { mode, setMode, address, connectWallet, disconnectWallet, loading } = useWallet();

  return (
    <div className="bg-gray-200 p-2 rounded flex justify-between items-center">
      <div>
        <button
          onClick={() => setMode('easy')}
          className={`px-3 py-1 rounded ${mode === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          Easy Mode
        </button>
        <button
          onClick={() => setMode('pro')}
          className={`ml-2 px-3 py-1 rounded ${mode === 'pro' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}
        >
          Pro Mode
        </button>
      </div>
      {mode === 'pro' && (
        <div>
          {address ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">{address.slice(0,6)}...{address.slice(-4)}</span>
              <button onClick={disconnectWallet} className="bg-red-500 text-white px-2 py-1 rounded text-sm">Disconnect</button>
            </div>
          ) : (
            <button onClick={connectWallet} disabled={loading} className="bg-green-600 text-white px-3 py-1 rounded text-sm">
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ModeToggle;
