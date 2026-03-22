import { ethers } from 'ethers';
import { Fetcher, Route, Trade, TokenAmount, TradeType, Token } from '@uniswap/sdk';
import { getProvider } from './ethereumService';

// Define tokens (mainnet addresses)
const USDC = new Token(1, '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', 6, 'USDC', 'USD Coin');
const WETH = new Token(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', 18, 'WETH', 'Wrapped Ether');

export async function getUniswapQuote(amountIn: number, isBuyingETH: boolean, ethPrice?: number) {
  try {
    const provider = getProvider();
    // Fetch pair
    const pair = await Fetcher.fetchPairData(WETH, USDC, provider);
    const route = new Route([pair], isBuyingETH ? WETH : USDC, isBuyingETH ? USDC : WETH);
    const amountInWei = ethers.utils.parseUnits(amountIn.toString(), isBuyingETH ? 18 : 6);
    const tokenAmountIn = new TokenAmount(isBuyingETH ? WETH : USDC, amountInWei.toString());
    const trade = new Trade(route, tokenAmountIn, isBuyingETH ? TradeType.EXACT_INPUT : TradeType.EXACT_INPUT);
    const outputAmount = trade.outputAmount.toSignificant(6);
    const outputInUSD = isBuyingETH ? parseFloat(outputAmount) : parseFloat(outputAmount);
    // Compute effective price
    const effectivePrice = isBuyingETH ? outputInUSD / amountIn : amountIn / outputInUSD;
    return {
      source: 'uniswap',
      price: effectivePrice,
      outputAmount: parseFloat(outputAmount),
      trade,
    };
  } catch (error) {
    console.error('Uniswap quote error:', error);
    return null;
  }
}
