import { connectDB } from "./common/db";
import { initTelegramBot } from "./telegram/bot";

const main = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Telegram Bot
    await initTelegramBot();

    // Your server initialization code will go here
    console.log("Server is running!");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

main();
