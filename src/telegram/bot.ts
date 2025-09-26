import dotenv from "dotenv";
import { Telegraf } from "telegraf";
import { Toggle } from "../common/types";
import { createUser, getUser, updateUser } from "../db/users";
import { formatStatusMessage } from "./formatMessage";
import { sendMessage } from "./messageSender";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

const botCommands = [
  { command: "start", description: "Start Sniping" },
  { command: "status", description: "Check Bot Status" },
];

const initTelegramBot = async () => {
  // Set command menu (shows up when typing /)
  bot.telegram.setMyCommands(botCommands);

  // Handlers (for now just replies, you’ll add logic later)
  bot.start(async (ctx) => {
    const tgId = ctx.from.id;

    let user = await getUser(tgId.toString());
    if (user.success) {
      await updateUser(tgId.toString(), { isActive: Toggle.TRUE });
      ctx.reply(
        `👋 <b>Welcome back!</b>\n\n` +
          `🤖 <b>Sniping Bot Activated</b>\n` +
          `✅ Bot is now active and ready to snipe tokens\n` +
          `📊 Use /status to view your current settings\n` +
          `🛑 Use /stop to pause new purchases (existing trades continue)\n\n` +
          `Happy sniping! 🚀`,
        { parse_mode: "HTML" }
      );
      return;
    } else {
      let user = await createUser(tgId.toString());
      if (user.success) {
        await updateUser(tgId.toString(), { isActive: Toggle.TRUE });
      }
      ctx.reply(
        `👋 <b>Welcome to the Sniping Bot!</b>\n\n` +
          `🤖 <b>Bot Setup Complete</b>\n` +
          `✅ Your account has been created with default settings\n` +
          `📊 Use /status to view your current settings\n` +
          `⚙️ Configure your parameters before starting to snipe\n` +
          `🛑 Use /stop to pause new purchases (existing trades continue)\n\n` +
          `Ready to snipe! 🚀`,
        { parse_mode: "HTML" }
      );
    }
  });

  bot.command("status", async (ctx) => {
    const tgId = ctx.from.id;
    try {
      const user = await getUser(tgId.toString());
      if (!user.success) {
        ctx.reply(
          "User not found. Please use /start to set up your profile first."
        );
        return;
      }
      const userData = user.data;
      await sendMessage(
        tgId.toString(),
        formatStatusMessage({
          notificationOn: userData.notificationOn,
          tp: userData.tp,
          sl: userData.sl,
          slippagePercentage: userData.slippagePercentage,
          purchaseAmountInSol: userData.purchaseAmountInSol,
          poolType: userData.poolType,
          priorityFeeInSol: userData.priorityFeeInSol,
          minimumLiquidity: userData.minimumLiquidity,
          autoSellTimeMinutes: userData.autoSellTimeMinutes,
          maxTopHolderPercentage: userData.maxTopHolderPercentage,
          maxTopTenHoldersPercentage: userData.maxTopTenHoldersPercentage,
          isActive: userData.isActive,
        })
      );
    } catch (error) {
      ctx.reply(
        "An error occurred while fetching your status. Please try again later."
      );
    }
  });

  // Drop pending updates to avoid duplicate messages
  bot.launch({
    dropPendingUpdates: true,
  });
};

export { bot, initTelegramBot };
