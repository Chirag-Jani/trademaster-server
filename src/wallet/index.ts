import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

const RPC_URL = process.env.ETH_RPC as string;
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const GLOBAL_PRIVATE_KEY = process.env.GLOBAL_PRIVATE_KEY as string;

const generateWallet = () => {
  try {
    const wallet = new ethers.Wallet(GLOBAL_PRIVATE_KEY);
    return wallet.connect(provider);
  } catch (error) {
    throw new Error("Error generating wallet");
  }
};

const getWalletBalance = async (walletAddress: string): Promise<string> => {
  const balance = await provider.getBalance(walletAddress);
  return ethers.utils.formatUnits(balance, 18);
};

const signTransaction = async (
  walletAddress: string,
  transaction: ethers.providers.TransactionRequest
): Promise<string> => {
  const wallet = new ethers.Wallet(walletAddress);
  return await wallet.signTransaction(transaction);
};

const signMessage = async (
  walletAddress: string,
  message: string
): Promise<string> => {
  const wallet = new ethers.Wallet(walletAddress);
  return await wallet.signMessage(message);
};

export { generateWallet, getWalletBalance, signMessage, signTransaction };
