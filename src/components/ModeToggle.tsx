import React from 'react';
import { useMode } from '../contexts/ModeContext';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';

const ModeToggle: React.FC = () => {
  const { mode, setMode } = useMode();
  const { connect, disconnect, isConnected } = useWeb3();
  const { user } = useAuth();

  const toggleMode = async () => {
    if (mode === 'easy') {
      // Switching to Pro: need to connect wallet
      await connect();
      if (isConnected) setMode('pro');
    } else {
      // Switching to Easy: disconnect wallet
      await disconnect();
      setMode('easy');
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-200 p-1 rounded-full">
      <button
        onClick={() => mode === 'pro' && toggleMode()}
        className={`px-3 py-1 rounded-full text-sm ${mode === 'easy' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
      >
        Easy Mode
      </button>
      <button
        onClick={() => mode === 'easy' && toggleMode()}
        className={`px-3 py-1 rounded-full text-sm ${mode === 'pro' ? 'bg-blue-600 text-white' : 'text-gray-700'}`}
      >
        Pro Mode
      </button>
    </div>
  );
};

export default ModeToggle;
