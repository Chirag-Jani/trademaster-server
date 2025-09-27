import { ChainId, Token } from "@uniswap/sdk-core";

export const ETH_TOKEN = new Token(
  ChainId.MAINNET,
  "0x0000000000000000000000000000000000000000",
  18,
  "ETH",
  "Ether"
);

export const USDC_TOKEN = new Token(
  ChainId.MAINNET,
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  6,
  "USDC",
  "USDC"
);
