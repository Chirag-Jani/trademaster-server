import dotenv from "dotenv";
import { Markup, Telegraf } from "telegraf";
import { Toggle } from "../common/types";
import { createUser, getUser, updateUser } from "../db/users";
import { formatStatusMessage } from "./formatMessage";
import { sendMessage } from "./messageSender";
import { formatNumber } from "../common/helper/formatNumber";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

const botCommands = [
  { command: "start", description: "Start Sniping" },
  { command: "status", description: "Check Bot Status" },
  { command: "filters", description: "Set Token Filters" },
  { command: "targets", description: "Set Profit & Loss Targets" },
  { command: "amount", description: "Set Trading Amount in USD" },
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
      const formatValue = (
        value: string | number | undefined,
        prefix: string = ""
      ) => {
        if (!value) return "Not set";
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        return prefix + formatNumber(numValue);
      };

      const statusMessage =
        `🤖 <b>Bot Status</b>\n\n` +
        `🔔 Notifications: ${
          userData.notificationOn === "TRUE" ? "ON" : "OFF"
        }\n` +
        `⚡ Bot Active: ${userData.isActive === "TRUE" ? "YES" : "NO"}\n\n` +
        `📊 <b>Filter Settings</b>\n` +
        `💰 Market Cap: ${formatValue(userData.market_cap_gte, "$")}\n` +
        `📈 24h Volume: ${formatValue(userData.vol_24hr_gte, "$")}\n` +
        `💧 Liquidity: ${formatValue(userData.liquidity_gte, "$")}\n` +
        `💬 Mention Count: ${formatValue(userData.mention_count_24hr_gte)}\n` +
        `👥 Influencer Count: ${formatValue(
          userData.influencer_count_24hr_gte
        )}\n` +
        `💵 Trading Amount: ${formatValue(userData.amount, "$")}\n\n` +
        `📈 <b>Profit & Loss Targets</b>\n` +
        `🛑 Stop Loss: ${formatValue(userData.stop_loss, "")}%\n` +
        `🎯 Profit Target: ${formatValue(userData.profit_target, "")}%\n\n` +
        `🔗 Chains: ${userData.chain?.join(", ") || "Not set"}\n\n` +
        `Use /filters to update filter settings\n` +
        `Use /targets to update profit & loss targets`;

      await sendMessage(tgId.toString(), statusMessage);
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

  // Predefined filter values
  const targetValues = {
    stopLoss: [
      { label: "10%", value: "10" },
      { label: "20%", value: "20" },
      { label: "30%", value: "30" },
      { label: "40%", value: "40" },
      { label: "50%", value: "50" },
    ],
    profitTarget: [
      { label: "10%", value: "10" },
      { label: "25%", value: "25" },
      { label: "50%", value: "50" },
      { label: "75%", value: "75" },
      { label: "100%", value: "100" },
      { label: "200%", value: "200" },
    ],
  };

  const filterValues = {
    chain: [
      { label: "ETH", value: "ETH" },
      { label: "BASE", value: "BASE" },
      { label: "BOTH", value: "BOTH" },
    ],
    marketCap: [
      { label: "> $100K", value: "100000" },
      { label: "> $500K", value: "500000" },
      { label: "> $1M", value: "1000000" },
      { label: "> $5M", value: "5000000" },
      { label: "> $10M", value: "10000000" },
    ],
    volume: [
      { label: "> $10K", value: "10000" },
      { label: "> $50K", value: "50000" },
      { label: "> $100K", value: "100000" },
      { label: "> $500K", value: "500000" },
      { label: "> $1M", value: "1000000" },
    ],
    liquidity: [
      { label: "> $5K", value: "5000" },
      { label: "> $20K", value: "20000" },
      { label: "> $50K", value: "50000" },
      { label: "> $100K", value: "100000" },
      { label: "> $500K", value: "500000" },
    ],
    mentionCount: [
      { label: "> 5", value: "5" },
      { label: "> 10", value: "10" },
      { label: "> 25", value: "25" },
      { label: "> 50", value: "50" },
      { label: "> 100", value: "100" },
      { label: "> 250", value: "250" },
    ],
    influencerCount: [
      { label: "> 5", value: "5" },
      { label: "> 10", value: "10" },
      { label: "> 20", value: "20" },
      { label: "> 50", value: "50" },
      { label: "> 100", value: "100" },
    ],
  };

  // Filters command handler
  bot.command("filters", async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback("🔗 Chain", "filter_chain"),
        Markup.button.callback("💰 Market Cap", "filter_marketCap"),
      ],
      [
        Markup.button.callback("📊 Volume", "filter_volume"),
        Markup.button.callback("💧 Liquidity", "filter_liquidity"),
      ],
      [
        Markup.button.callback("💬 Mentions", "filter_mentionCount"),
        Markup.button.callback("👥 Influencers", "filter_influencerCount"),
      ],
      [Markup.button.callback("❌ Cancel", "cancel_filter")],
    ]);

    ctx.reply(
      "🎯 <b>Token Filter Settings</b>\n\n" +
        "Select a filter category to configure:\n\n" +
        "🔗 Chain - Select blockchain network(s)\n" +
        "💰 Market Cap - Filter by token market capitalization\n" +
        "📊 Volume - Filter by 24h trading volume\n" +
        "💧 Liquidity - Filter by token liquidity\n" +
        "💬 Mentions - Filter by social mention count\n" +
        "👥 Influencers - Filter by influencer mention count\n",
      {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      }
    );
  });

  // Handle filter category selection
  bot.action(/^filter_(.+)$/, async (ctx) => {
    const match = ctx.match[1] as keyof typeof filterValues;
    const values = filterValues[match];

    if (!values) {
      await ctx.answerCbQuery("Invalid filter category");
      return;
    }

    const buttons = values.map((v) => [
      Markup.button.callback(v.label, `set_filter_${match}_${v.value}`),
    ]);
    buttons.push([
      Markup.button.callback("⬅️ Back to Categories", "back_to_filters"),
    ]);
    buttons.push([Markup.button.callback("❌ Cancel", "cancel_filter")]);

    const keyboard = Markup.inlineKeyboard(buttons);

    let title = "";
    switch (match) {
      case "chain":
        title = "🔗 Chain Selection";
        break;
      case "marketCap":
        title = "💰 Market Cap Filter (Minimum Value)";
        break;
      case "volume":
        title = "📊 Volume Filter (Minimum Value)";
        break;
      case "liquidity":
        title = "💧 Liquidity Filter (Minimum Value)";
        break;
      case "mentionCount":
        title = "💬 Mention Count Filter (Minimum Value)";
        break;
      case "influencerCount":
        title = "👥 Influencer Count Filter (Minimum Value)";
        break;
    }

    await ctx.editMessageText(`${title}\n\nSelect a range:`, {
      reply_markup: keyboard.reply_markup,
    });
    await ctx.answerCbQuery();
  });

  // Handle specific filter value selection
  bot.action(/^set_filter_(\w+)_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    const value = ctx.match[2];
    const tgId = ctx.from?.id.toString();

    if (!tgId) {
      await ctx.answerCbQuery("❌ User ID not found");
      return;
    }

    try {
      const updateField = {
        marketCap: "market_cap_gte",
        volume: "vol_24hr_gte",
        liquidity: "liquidity_gte",
        mentionCount: "mention_count_24hr_gte",
        influencerCount: "influencer_count_24hr_gte",
        chain: "chain",
      }[category];

      // Prepare update value
      const updateValue =
        category === "chain"
          ? value === "BOTH"
            ? ["ETH", "BASE"]
            : [value]
          : value;

      if (!updateField) {
        throw new Error("Invalid filter category");
      }

      const result = await updateUser(tgId, {
        [updateField]: updateValue,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      await ctx.editMessageText(
        `✅ Filter Updated\n\n` +
          `Category: ${category}\n` +
          `Value: ${value}\n\n` +
          `Use /filters to configure more filters.`
      );
      await ctx.answerCbQuery("Filter updated successfully!");
    } catch (error) {
      console.error("Error updating filter:", error);
      await ctx.answerCbQuery("❌ Error updating filter");
      await ctx.editMessageText(
        `❌ Error updating filter: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\n` + `Please try again or contact support if the issue persists.`
      );
    }
  });

  // Handle back to filters button
  bot.action("back_to_filters", async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback("🔗 Chain", "filter_chain"),
        Markup.button.callback("💰 Market Cap", "filter_marketCap"),
      ],
      [
        Markup.button.callback("📊 Volume", "filter_volume"),
        Markup.button.callback("💧 Liquidity", "filter_liquidity"),
      ],
      [
        Markup.button.callback("💬 Mentions", "filter_mentionCount"),
        Markup.button.callback("👥 Influencers", "filter_influencerCount"),
      ],
      [Markup.button.callback("❌ Cancel", "cancel_filter")],
    ]);

    await ctx.editMessageText(
      "🎯 <b>Token Filter Settings</b>\n\n" +
        "Select a filter category to configure:\n\n" +
        "💰 Market Cap - Filter by token market capitalization\n" +
        "📊 Volume - Filter by 24h trading volume\n" +
        "💧 Liquidity - Filter by token liquidity\n" +
        "💬 Mentions - Filter by social mention count\n" +
        "👥 Influencers - Filter by influencer mention count\n",
      {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      }
    );
    await ctx.answerCbQuery();
  });

  // Handle cancel filter button
  bot.action("cancel_filter", async (ctx) => {
    await ctx.editMessageText("❌ Filter configuration cancelled.");
    await ctx.answerCbQuery();
  });

  // Targets command handler
  bot.command("targets", async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback("🛑 Stop Loss", "target_stopLoss"),
        Markup.button.callback("🎯 Profit Target", "target_profitTarget"),
      ],
      [Markup.button.callback("❌ Cancel", "cancel_target")],
    ]);

    ctx.reply(
      "📊 <b>Profit & Loss Targets</b>\n\n" +
        "Select a target to configure:\n\n" +
        "🛑 Stop Loss - Set loss percentage to auto-sell\n" +
        "🎯 Profit Target - Set profit percentage to auto-sell\n",
      {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      }
    );
  });

  // Handle target category selection
  bot.action(/^target_(.+)$/, async (ctx) => {
    const match = ctx.match[1] as keyof typeof targetValues;
    const values = targetValues[match];

    if (!values) {
      await ctx.answerCbQuery("Invalid target category");
      return;
    }

    const buttons = values.map((v) => [
      Markup.button.callback(v.label, `set_target_${match}_${v.value}`),
    ]);
    buttons.push([
      Markup.button.callback("⬅️ Back to Targets", "back_to_targets"),
    ]);
    buttons.push([Markup.button.callback("❌ Cancel", "cancel_target")]);

    const keyboard = Markup.inlineKeyboard(buttons);

    let title =
      match === "stopLoss" ? "🛑 Stop Loss Target" : "🎯 Profit Target";
    let description =
      match === "stopLoss"
        ? "Bot will sell if price drops by selected percentage"
        : "Bot will sell if profit reaches selected percentage";

    await ctx.editMessageText(
      `${title} (Percentage)\n\n${description}\n\nSelect a value:`,
      {
        reply_markup: keyboard.reply_markup,
      }
    );
    await ctx.answerCbQuery();
  });

  // Handle specific target value selection
  bot.action(/^set_target_(\w+)_(.+)$/, async (ctx) => {
    const category = ctx.match[1];
    const value = ctx.match[2];
    const tgId = ctx.from?.id.toString();

    if (!tgId) {
      await ctx.answerCbQuery("❌ User ID not found");
      return;
    }

    try {
      const updateField = {
        stopLoss: "stop_loss",
        profitTarget: "profit_target",
      }[category];

      if (!updateField) {
        throw new Error("Invalid target category");
      }

      const result = await updateUser(tgId, {
        [updateField]: value,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      await ctx.editMessageText(
        `✅ Target Updated\n\n` +
          `Category: ${
            category === "stopLoss" ? "Stop Loss" : "Profit Target"
          }\n` +
          `Value: ${value}%\n\n` +
          `Use /targets to configure more targets.`
      );
      await ctx.answerCbQuery("Target updated successfully!");
    } catch (error) {
      console.error("Error updating target:", error);
      await ctx.answerCbQuery("❌ Error updating target");
      await ctx.editMessageText(
        `❌ Error updating target: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\n` + `Please try again or contact support if the issue persists.`
      );
    }
  });

  // Handle back to targets button
  bot.action("back_to_targets", async (ctx) => {
    const keyboard = Markup.inlineKeyboard([
      [
        Markup.button.callback("🛑 Stop Loss", "target_stopLoss"),
        Markup.button.callback("🎯 Profit Target", "target_profitTarget"),
      ],
      [Markup.button.callback("❌ Cancel", "cancel_target")],
    ]);

    await ctx.editMessageText(
      "📊 <b>Profit & Loss Targets</b>\n\n" +
        "Select a target to configure:\n\n" +
        "🛑 Stop Loss - Set loss percentage to auto-sell\n" +
        "🎯 Profit Target - Set profit percentage to auto-sell\n",
      {
        parse_mode: "HTML",
        reply_markup: keyboard.reply_markup,
      }
    );
    await ctx.answerCbQuery();
  });

  // Handle cancel target button
  bot.action("cancel_target", async (ctx) => {
    await ctx.editMessageText("❌ Target configuration cancelled.");
    await ctx.answerCbQuery();
  });

  // Amount command handler
  bot.command("amount", async (ctx) => {
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
        ctx.reply(
          "💰 <b>Set Trading Amount</b>\n\n" +
            "Please provide the amount in USD.\n\n" +
            "Usage: /amount [value]\n" +
            "Example: /amount 100\n\n" +
            "This sets your trading amount to $100 USD.",
          { parse_mode: "HTML" }
        );
        return;
      }

      const amountInput = messageText.split(" ")[1];
      const amount = parseFloat(amountInput);

      if (isNaN(amount) || amount <= 0) {
        ctx.reply(
          "❌ Invalid amount. Please enter a positive number.\n\n" +
            "Example: /amount 100"
        );
        return;
      }

      const result = await updateUser(tgId.toString(), {
        amount: amount,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      ctx.reply(
        `✅ Trading amount updated successfully!\n\n` +
          `💰 Amount: $${formatNumber(amount)}\n\n` +
          `Use /status to view all your settings.`,
        { parse_mode: "HTML" }
      );
    } catch (error) {
      console.error("Error updating amount:", error);
      ctx.reply(
        "❌ An error occurred while updating the amount. Please try again later."
      );
    }
  });

  // Drop pending updates to avoid duplicate messages
  bot.launch({
    dropPendingUpdates: true,
  });
};

export { bot, initTelegramBot };
