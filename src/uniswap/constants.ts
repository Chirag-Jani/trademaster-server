import { ChainId, Token } from "@uniswap/sdk-core";

export const ETH_TOKEN = new Token(
  ChainId.MAINNET,
  "0x0000000000000000000000000000000000000000",
  18,
  "ETH",
  "Ether"
);
