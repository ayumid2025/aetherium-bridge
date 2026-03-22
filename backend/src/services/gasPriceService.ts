import axios from 'axios';

// Network gas price APIs
const GAS_PRICE_URLS = {
  ethereum: 'https://api.etherscan.io/api?module=gastracker&action=gasoracle&apikey=YOUR_ETHERSCAN_API_KEY',
  bsc: 'https://api.bscscan.com/api?module=gastracker&action=gasoracle&apikey=YOUR_BSCSCAN_API_KEY',
  solana: 'https://api.mainnet-beta.solana.com', // would need a custom RPC call
};

// Simple in‑memory cache for gas prices
let cachedGasPrices: any = {};

export async function fetchGasPrices() {
  try {
    // Fetch Ethereum gas price
    const ethResponse = await axios.get(GAS_PRICE_URLS.ethereum);
    const ethGas = ethResponse.data.result;
    cachedGasPrices.ethereum = {
      slow: parseFloat(ethGas.SafeGasPrice) / 10, // gwei
      average: parseFloat(ethGas.ProposeGasPrice) / 10,
      fast: parseFloat(ethGas.FastGasPrice) / 10,
    };
  } catch (err) {
    console.error('Failed to fetch ETH gas price', err);
  }

  // For BSC
  try {
    const bscResponse = await axios.get(GAS_PRICE_URLS.bsc);
    const bscGas = bscResponse.data.result;
    cachedGasPrices.bsc = {
      slow: parseFloat(bscGas.SafeGasPrice),
      average: parseFloat(bscGas.ProposeGasPrice),
      fast: parseFloat(bscGas.FastGasPrice),
    };
  } catch (err) {
    console.error('Failed to fetch BSC gas price', err);
  }

  // For Solana, we might need a different approach (e.g., recent blockhash fees). We'll skip for now.

  return cachedGasPrices;
}

export function getCurrentGasPrice(network: string, speed: 'slow' | 'average' | 'fast' = 'average'): number | null {
  const gas = cachedGasPrices[network];
  if (!gas) return null;
  return gas[speed];
}
