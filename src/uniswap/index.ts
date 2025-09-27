import { SwapExactInSingle } from "@uniswap/v4-sdk";
import dotenv from "dotenv";
import { ethers } from "ethers";
import {
  BASE_POSITION_MANAGER_ABI,
  BASE_POSITION_MANAGER_CONTRACT_ADDRESS,
  BASE_QUOTER_ABI,
  BASE_QUOTER_CONTRACT_ADDRESS,
  BASE_RPC_URL,
  ETH_POSITION_MANAGER_ABI,
  ETH_POSITION_MANAGER_CONTRACT_ADDRESS,
  ETH_QUOTER_ABI,
  ETH_QUOTER_CONTRACT_ADDRESS,
  ETH_RPC_URL,
} from "./constants";

dotenv.config();

// const getTokenDecimals = async (
//   chain: "ethereum" | "base",
//   tokenAddress: string
// ) => {
//   if (chain === "ethereum") {
//     const positionManagerContract = new ethers.Contract(
//       tokenAddress,
//       IERC20_ABI,
//       new ethers.providers.JsonRpcProvider(ETH_RPC_URL)
//     );
//     const poolKeys = await positionManagerContract.poolKeys(tokenAddress);
//     return poolKeys;
//   } else {
//     const positionManagerContract = new ethers.Contract(
//       tokenAddress,
//       IERC20_ABI,
//       new ethers.providers.JsonRpcProvider(BASE_RPC_URL)
//     );
//     const poolKeys = await positionManagerContract.poolKeys(tokenAddress);
//     return poolKeys;
//   }
// };

const getPoolKeys = async (
  chain: "ethereum" | "base",
  tokenAddress: string
) => {
  if (chain === "ethereum") {
    const positionManagerContract = new ethers.Contract(
      ETH_POSITION_MANAGER_CONTRACT_ADDRESS,
      ETH_POSITION_MANAGER_ABI,
      new ethers.providers.JsonRpcProvider(ETH_RPC_URL)
    );
    const poolKeys = await positionManagerContract.poolKeys(tokenAddress);
    return poolKeys;
  } else {
    const positionManagerContract = new ethers.Contract(
      BASE_POSITION_MANAGER_CONTRACT_ADDRESS,
      BASE_POSITION_MANAGER_ABI,
      new ethers.providers.JsonRpcProvider(ETH_RPC_URL)
    );
    const poolKeys = await positionManagerContract.poolKeys(tokenAddress);
    return poolKeys;
  }
};

const getTokenQuote = async (
  chain: "ethereum" | "base",
  token1: string,
  amount: number,
  pairId: string
) => {
  try {
    if (!chain) {
      chain = "ethereum";
    }

    // === Constants ===
    const abi = chain == "ethereum" ? ETH_QUOTER_ABI : BASE_QUOTER_ABI;
    const quoter =
      chain == "ethereum"
        ? ETH_QUOTER_CONTRACT_ADDRESS
        : BASE_QUOTER_CONTRACT_ADDRESS;

    const rpc = chain == "ethereum" ? ETH_RPC_URL : BASE_RPC_URL;

    const poolKeys = await getPoolKeys(
      chain,
      pairId.substring(0, pairId.length - 14)
    );

    const CurrentConfig: SwapExactInSingle = {
      poolKey: {
        currency0: poolKeys.currency0,
        currency1: token1,
        fee: poolKeys.fee,
        tickSpacing: poolKeys.tickSpacing,
        hooks: poolKeys.hooks,
      },
      zeroForOne: true,
      amountIn: ethers.utils.parseUnits(amount.toString(), 18).toString(),
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

    console.log(`Amount Out: ${ethers.utils.formatUnits(quotedAmountOut[0])} `);
  } catch (error) {
    console.log("error fetching quote", error);
  }
};

export { getTokenQuote };
