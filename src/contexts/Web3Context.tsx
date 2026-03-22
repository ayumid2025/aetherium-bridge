import React, { createContext, useContext, useState, useEffect } from 'react';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethereum';
import { mainnet, arbitrum, polygon } from 'viem/chains';

// 1. Get projectId from https://cloud.walletconnect.com
const projectId = 'YOUR_WALLETCONNECT_PROJECT_ID'; // You'll need to get this

// 2. Create wagmi config
const metadata = {
  name: 'Aetherium Bridge',
  description: 'Hybrid Fiat-Crypto Exchange',
  url: 'https://aetheriumbridge.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, arbitrum, polygon] as const;

export const web3Modal = createWeb3Modal({
  wagmiConfig: defaultConfig({ metadata, chains, projectId }),
  chains,
  projectId,
});

interface Web3ContextType {
  address: string | null;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      const session = await web3Modal.getWalletClient();
      if (session?.account.address) {
        setAddress(session.account.address);
        setIsConnected(true);
      }
    };
    checkConnection();
    // Listen for account changes
    web3Modal.subscribeEvents((event) => {
      if (event.data.event === 'ACCOUNTS_CHANGED') {
        setAddress(event.data.address?.[0] || null);
        setIsConnected(!!event.data.address);
      }
    });
  }, []);

  const connect = async () => {
    try {
      const session = await web3Modal.open();
      if (session?.account.address) {
        setAddress(session.account.address);
        setIsConnected(true);
      }
    } catch (err) {
      console.error('Connection failed', err);
    }
  };

  const disconnect = async () => {
    await web3Modal.disconnect();
    setAddress(null);
    setIsConnected(false);
  };

  return (
    <Web3Context.Provider value={{ address, isConnected, connect, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) throw new Error('useWeb3 must be used within Web3Provider');
  return context;
};
