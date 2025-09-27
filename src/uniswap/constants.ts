import { ChainId, Token } from "@uniswap/sdk-core";
import dotenv from "dotenv";

dotenv.config();

export const ETH_TOKEN = new Token(
  ChainId.MAINNET,
  "0x0000000000000000000000000000000000000000",
  18,
  "ETH",
  "Ether"
);

export const ETH_QUOTER_ABI = require("./abis/EthQuoter.json");
export const ETH_POSITION_MANAGER_ABI = require("./abis/EthPositionManager.json");
export const ETH_QUOTER_CONTRACT_ADDRESS = process.env
  .ETH_QUOTER_CONTRACT_ADDRESS as string;
export const ETH_POSITION_MANAGER_CONTRACT_ADDRESS = process.env
  .ETH_POSITION_MANAGER_CONTRACT_ADDRESS as string;
export const ETH_RPC_URL = process.env.ETH_RPC as string;

export const BASE_QUOTER_ABI = require("./abis/BaseQuoter.json");
export const BASE_POSITION_MANAGER_ABI = require("./abis/BasePositionManager.json");
export const BASE_QUOTER_CONTRACT_ADDRESS = process.env
  .BASE_QUOTER_CONTRACT_ADDRESS as string;
export const BASE_POSITION_MANAGER_CONTRACT_ADDRESS = process.env
  .BASE_POSITION_MANAGER_CONTRACT_ADDRESS as string;
export const BASE_RPC_URL = process.env.ETH_RPC as string;

export const IERC20_ABI = require("./abis/IERC20.json");
