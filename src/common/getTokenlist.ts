import axios from "axios";
import {
  GetTokenLeaderboardParams,
  GetTokenLeaderboardResponse,
} from "../types/api";

const BASE_URL = process.env.API_BASE_URL || "https://api.example.com"; // Replace with actual API base URL

export async function getTokenLeaderboard(
  params: GetTokenLeaderboardParams = {}
): Promise<GetTokenLeaderboardResponse> {
  try {
    const response = await axios.get<GetTokenLeaderboardResponse>(
      `${BASE_URL}/token/token-leaderboard`,
      {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          sort_by: params.sort_by,
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
