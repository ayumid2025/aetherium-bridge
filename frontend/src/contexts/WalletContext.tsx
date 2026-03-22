import React, { createContext, useState, useContext, useEffect } from 'react';
import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

interface WalletContextType {
  mode: 'easy' | 'pro';
  setMode: (mode: 'easy' | 'pro') => void;
  provider: ethers.providers.Web3Provider | null;
  address: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  loading: boolean;
  signTransaction: (tx: any) => Promise<string>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<'easy' | 'pro'>('easy');
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Web3Modal instance
  let web3Modal: Web3Modal;

  if (typeof window !== 'undefined') {
    web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
      providerOptions: {}, // you can add wallet connect options here
    });
  }

  const connectWallet = async () => {
    setLoading(true);
    try {
      const instance = await web3Modal.connect();
      const web3Provider = new ethers.providers.Web3Provider(instance);
      const accounts = await web3Provider.listAccounts();
      setProvider(web3Provider);
      setAddress(accounts[0]);
    } catch (err) {
      console.error('Connection error:', err);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    if (web3Modal) web3Modal.clearCachedProvider();
    setProvider(null);
    setAddress(null);
  };

  const signTransaction = async (tx: any) => {
    if (!provider) throw new Error('No wallet connected');
    const signer = provider.getSigner();
    const signedTx = await signer.sendTransaction(tx);
    return signedTx.hash;
  };

  // Auto-connect if previously connected
  useEffect(() => {
    if (web3Modal && web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  return (
    <WalletContext.Provider value={{ mode, setMode, provider, address, connectWallet, disconnectWallet, loading, signTransaction }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};
