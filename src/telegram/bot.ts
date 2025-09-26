import dotenv from "dotenv";
import { Markup, Telegraf } from "telegraf";
import { Toggle } from "../common/types";
import { createUser, getUser, updateUser } from "../db/users";
import { formatStatusMessage } from "./formatMessage";
import { sendMessage } from "./messageSender";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

const botCommands = [
  { command: "start", description: "Start Sniping" },
  { command: "status", description: "Check Bot Status" },
  { command: "update_stop_loss", description: "Update Stop Loss" },
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
          isActive: userData.isActive,
        })
      );
    } catch (error) {
      ctx.reply(
        "An error occurred while fetching your status. Please try again later."
      );
    }
  });

  bot.command("update_stop_loss", async (ctx) => {
    const tgId = ctx.from.id;
    try {
      const user = await getUser(tgId.toString());
      if (!user.success) {
        ctx.reply(
          "User not found. Please use /start to set up your profile first."
        );
        return;
      }

      const messageText = ctx.message?.text;
      if (!messageText || messageText.split(" ").length < 2) {
        const keyboard = Markup.inlineKeyboard([
          [
            Markup.button.callback("🛑 10%", "set_sl_10"),
            Markup.button.callback("🛑 20%", "set_sl_20"),
            Markup.button.callback("🛑 25%", "set_sl_25"),
          ],
          [
            Markup.button.callback("🛑 30%", "set_sl_30"),
            Markup.button.callback("🛑 40%", "set_sl_40"),
            Markup.button.callback("🛑 50%", "set_sl_50"),
          ],
          [Markup.button.callback("❌ Cancel", "cancel_sl")],
        ]);

        ctx.reply(
          "Please provide a stop loss percentage.\n\n" +
            "Usage: /update_stop_loss [percentage]\n" +
            "Example: /update_stop_loss 25\n\n" +
            "This sets stop loss at 25% (meaning sell at 75% of entry price)\n\n" +
            "Or click one of the buttons below:",
          {
            reply_markup: keyboard.reply_markup,
          }
        );
        return;
      }

      const stopLossInput = messageText.split(" ")[1];
      const stopLossPercent = parseFloat(stopLossInput);

      if (
        isNaN(stopLossPercent) ||
        stopLossPercent < 0 ||
        stopLossPercent > 100
      ) {
        ctx.reply(
          "❌ Invalid stop loss percentage. Please enter a number between 0 and 100.\n\n" +
            "Example: /update_stop_loss 25"
        );
        return;
      }

      // UPDATE STOP LOSS HERE

      ctx.reply(
        `✅ Stop Loss updated successfully!\n\n` +
          `🛑 Stop Loss: ${stopLossPercent}%\n` +
          `(Will sell at ${100 - stopLossPercent}% of entry price)`
      );
    } catch (error) {
      ctx.reply(
        "An error occurred while updating stop loss. Please try again later."
      );
    }
  });

  // Handle stop loss callback buttons
  bot.action(/^set_sl_(\d+)$/, async (ctx) => {
    try {
      //
      ctx.answerCbQuery("Stop loss updated");
    } catch (error) {
      console.error("Error updating stop loss:", error);
      await ctx.answerCbQuery("❌ Error updating stop loss");
    }
  });

  // Handle cancel stop loss
  bot.action("cancel_sl", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("❌ Stop loss update cancelled.");
  });

  // Drop pending updates to avoid duplicate messages
  bot.launch({
    dropPendingUpdates: true,
  });
};

export { bot, initTelegramBot };
