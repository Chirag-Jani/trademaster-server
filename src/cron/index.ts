import { CronJob } from "cron";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const CRON_SCHEDULE = process.env.CRON_SCHEDULE as string;

const cronFunction = async () => {
  try {
    // const tokenData = await getTokenLeaderboard();
    // const allUsers = await getAllUsers({ isActive: Toggle.TRUE });
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
