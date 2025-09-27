import { SwapExactInSingle } from "@uniswap/v4-sdk";
import dotenv from "dotenv";
import { ethers } from "ethers";

dotenv.config();

import ETH_QUOTER_ABI = require("./abis/EthQuoter.json");
const ETH_QUOTER_CONTRACT_ADDRESS = process.env
  .ETH_QUOTER_CONTRACT_ADDRESS as string;
const ETH_RPC_URL = process.env.ETH_RPC as string;

import BASE_QUOTER_ABI = require("./abis/BaseQuoter.json");
const BASE_QUOTER_CONTRACT_ADDRESS = process.env
  .BASE_QUOTER_CONTRACT_ADDRESS as string;
const BASE_RPC_URL = process.env.ETH_RPC as string;

const getTokenQuote = async (
  chain: "ETH" | "BASE",
  token0: string,
  token1: string,
  token0Decimals: number,
  token1Decimals: number
) => {
  try {
    if (!chain) {
      chain = "ETH";
    }

    // === Constants ===
    const abi = chain == "ETH" ? ETH_QUOTER_ABI : BASE_QUOTER_ABI;
    const quoter =
      chain == "ETH"
        ? ETH_QUOTER_CONTRACT_ADDRESS
        : BASE_QUOTER_CONTRACT_ADDRESS;

    const rpc = chain == "ETH" ? ETH_RPC_URL : BASE_RPC_URL;

    const CurrentConfig: SwapExactInSingle = {
      poolKey: {
        currency0: token0,
        currency1: token1,
        fee: 500,
        tickSpacing: 10,
        hooks: "0x0000000000000000000000000000000000000000",
      },
      zeroForOne: true,
      amountIn: ethers.utils.parseUnits("1", token0Decimals).toString(),
      amountOutMinimum: "0",
      hookData: "0x00",
    };

    const quoterContract = new ethers.Contract(
      quoter,
      abi, // Import or define the ABI for Quoter contract
      new ethers.providers.JsonRpcProvider(rpc) // Provide the right RPC address for the chain
    );

    const quotedAmountOut =
      await quoterContract.callStatic.quoteExactInputSingle({
        poolKey: CurrentConfig.poolKey,
        zeroForOne: CurrentConfig.zeroForOne,
        exactAmount: CurrentConfig.amountIn,
        hookData: CurrentConfig.hookData,
      });

    console.log(
      ethers.utils.formatUnits(quotedAmountOut.amountOut, token1Decimals)
    );
    console.log(
      `Amount Out: ${ethers.utils.formatUnits(
        quotedAmountOut[0],
        token1Decimals
      )} USDC (Gas Estimate: ${quotedAmountOut[1].toString()})`
    );
  } catch (error) {
    console.log("error fetching quote", error);
  }
};

export { getTokenQuote };
