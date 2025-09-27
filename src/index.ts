import { connectDB } from "./common/db";
import { initCronJobs } from "./cron";
import { initTelegramBot } from "./telegram/bot";

const main = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Telegram Bot
    await initTelegramBot();

    // Initialize Cron Jobs
    initCronJobs();

    console.log("Server is running!");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

main();
