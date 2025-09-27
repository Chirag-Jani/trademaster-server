import { CronJob } from "cron";
import dotenv from "dotenv";
import { getTokenLeaderboard } from "../common/getTokenlist";
import { IUser, Toggle, TokenDataItem } from "../common/types";
import { getAllUsers } from "../db/users";
import { formatTokenNotification } from "../telegram/formatMessage";
import { sendMessage } from "../telegram/messageSender";
import TokenModel from "../db/TokenModel";

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
    const currentTime = Date.now();

    console.log("Starting token database update...");
    // Update token database and get new tokens
    const newTokens: TokenDataItem[] = [];
    for (const token of tokenData.result) {
      try {
        if (!token.token_id) {
          console.log("Skipping token without token_id:", token.token_symbol);
          continue;
        }

        // Check if token exists in database
        const existingToken = await TokenModel.findOne({
          token_id: token.token_id,
        });

        if (!existingToken) {
          // New token found
          console.log(
            `Storing new token: ${token.token_symbol} (${token.token_id})`
          );
          const tokenDoc = new TokenModel({
            ...token,
            createdAt: currentTime,
            updatedAt: currentTime,
          });
          await tokenDoc.save();
          newTokens.push(token);
        } else {
          // Update existing token
          console.log(
            `Updating existing token: ${token.token_symbol} (${token.token_id})`
          );
          await TokenModel.updateOne(
            { token_id: token.token_id },
            {
              ...token,
              updatedAt: currentTime,
            }
          );
        }
      } catch (error) {
        console.error(`Error processing token ${token.token_symbol}:`, error);
      }
    }

    console.log(`Found ${newTokens.length} new tokens`);

    // Process new tokens for each user
    for (const user of users) {
      try {
        // Skip if notifications are turned off for the user
        if (user.notificationOn !== Toggle.TRUE) {
          console.log(`Notifications are disabled for user ${user.telegramId}`);
          continue;
        }

        // Filter new tokens based on user preferences
        const filteredNewTokens = filterTokensForUser(newTokens, user);
        console.log(
          `Filtered ${filteredNewTokens.length} new tokens for user ${user.telegramId}`
        );

        // Send notifications for each filtered new token
        for (const token of filteredNewTokens) {
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

    // Clean up old tokens (older than 7 days)
    const sevenDaysAgo = currentTime - 7 * 24 * 60 * 60 * 1000;
    await TokenModel.deleteMany({ updatedAt: { $lt: sevenDaysAgo } });
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
