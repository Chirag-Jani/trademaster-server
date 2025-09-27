import { CronJob } from "cron";
import dotenv from "dotenv";
import { getTokenLeaderboard } from "../common/getTokenlist";
import { IUser, Toggle, TokenDataItem } from "../common/types";
import { getAllUsers } from "../db/users";
import { formatTokenNotification } from "../telegram/formatMessage";
import { sendMessage } from "../telegram/messageSender";

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
    console.log("Total tokens:", tokenData.result.length);
    const usersResponse = await getAllUsers({ isActive: Toggle.TRUE });

    if (!usersResponse.success || !tokenData.result) {
      console.error("Failed to fetch users or token data");
      return;
    }

    const users = usersResponse.data;

    // Process tokens for each user
    for (const user of users) {
      try {
        // Skip if notifications are turned off for the user
        if (user.notificationOn !== Toggle.TRUE) {
          console.log(`Notifications are disabled for user ${user.telegramId}`);
          continue;
        }

        const filteredTokens = filterTokensForUser(tokenData.result, user);
        console.log(
          `Filtered ${filteredTokens.length} tokens for user ${user.telegramId}`
        );

        // Send notifications for each filtered token
        for (const token of filteredTokens) {
          try {
            const message = formatTokenNotification(token);
            await sendMessage(user.telegramId, message);

            // Add a small delay between messages to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error(
              `Failed to send notification for token ${token.token_symbol} to user ${user.telegramId}:`,
              error
            );
          }
        }
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
