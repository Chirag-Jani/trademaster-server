import { CronJob } from "cron";
import dotenv from "dotenv";
import { getAllUsers } from "../db/users";
import { getTokenLeaderboard } from "../common/getTokenlist";
import { IUser, Toggle, TokenDataItem } from "../common/types";

// Load environment variables
dotenv.config();

const CRON_SCHEDULE = process.env.CRON_SCHEDULE as string;

const filterTokensForUser = (
  tokens: TokenDataItem[],
  user: IUser
): TokenDataItem[] => {
  return tokens.filter((token) => {
    // Apply user's filter criteria
    if (
      user.vol_24hr_gte &&
      token.vol_24hr &&
      parseFloat(token.vol_24hr) < parseFloat(user.vol_24hr_gte)
    ) {
      return false;
    }
    if (
      user.pc_24_hr_gte &&
      token.pc_24_hr &&
      token.pc_24_hr < user.pc_24_hr_gte
    ) {
      return false;
    }
    if (
      user.liquidity_gte &&
      token.liquidity &&
      token.liquidity < user.liquidity_gte
    ) {
      return false;
    }
    if (
      user.market_cap_gte &&
      token.market_cap &&
      parseFloat(token.market_cap) < parseFloat(user.market_cap_gte)
    ) {
      return false;
    }
    if (user.chain && token.chain) {
      const userChains = Array.isArray(user.chain) ? user.chain : [user.chain];
      if (!userChains.includes(token.chain)) {
        return false;
      }
    }
    if (
      user.mention_count_24hr_gte &&
      token.mention_count_24hr &&
      token.mention_count_24hr < user.mention_count_24hr_gte
    ) {
      return false;
    }
    if (
      user.influencer_count_24hr_gte &&
      token.influencer_count_24hr &&
      parseFloat(token.influencer_count_24hr) <
        parseFloat(user.influencer_count_24hr_gte)
    ) {
      return false;
    }
    return true;
  });
};

const cronFunction = async () => {
  try {
    const tokenData = await getTokenLeaderboard();
    const usersResponse = await getAllUsers({ isActive: Toggle.TRUE });

    if (!usersResponse.success || !tokenData.result) {
      console.error("Failed to fetch users or token data");
      return;
    }

    const users = usersResponse.data;

    // Process tokens for each user
    for (const user of users) {
      try {
        const filteredTokens = filterTokensForUser(tokenData.result, user);
        console.log(
          `Filtered ${filteredTokens.length} tokens for user ${user.telegramId}`
        );

        // TODO: Add your logic here to handle the filtered tokens for each user
        // For example, send notifications, update database, etc.
      } catch (error) {
        console.error(
          `Error processing tokens for user ${user.telegramId}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error("Error in cron job:", error);
  }
};

export const initCronJobs = () => {
  try {
    // Create a new cron job
    const job = new CronJob(
      CRON_SCHEDULE,
      cronFunction,
      null, // onComplete
      true, // start
      "UTC" // timeZone
    );

    console.log("Cron job initialized with schedule:", CRON_SCHEDULE);
    return job;
  } catch (error) {
    console.error("Failed to initialize cron job:", error);
    throw error;
  }
};
