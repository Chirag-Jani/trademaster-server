import axios from "axios";
import dotenv from "dotenv";
import {
  GetTokenLeaderboardParams,
  GetTokenLeaderboardResponse,
} from "../common/types/index";

dotenv.config();

const BASE_URL = process.env.API_BASE_URL;
console.log("base url", BASE_URL);

export async function getTokenLeaderboard(
  params: GetTokenLeaderboardParams = {}
): Promise<GetTokenLeaderboardResponse> {
  try {
    const response = await axios.get<GetTokenLeaderboardResponse>(
      `${BASE_URL}/token/token-leaderboard`,
      {
        params: {
          start: params.start || 0,
          limit: params.limit || 30,
          market_cap_gte: params.market_cap_gte || 50000,
          market_cap_lte: params.market_cap_lte || 1500000000,
          vol_24hr_gte: params.vol_24hr_gte || 200000,
          sort_by: params.sort_by || "mention_count_24hr_desc",
          is_best_pair: params.is_best_pair || 1,
        },
        headers: {
          accept: "application/json, text/plain, */*",
          "api-key": process.env.X_ALPHA_API_KEY,
          authorization: process.env.X_ALPHA_AUTH_TOKEN,
          source: "web app",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`Failed to fetch token leaderboard: ${error.message}`);
    }
    throw error;
  }
}
