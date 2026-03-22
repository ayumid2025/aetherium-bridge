import { ethers } from 'ethers';
import dotenv from 'dotenv';
dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);

export const getProvider = () => provider;
