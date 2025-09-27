import { FilterQuery } from "mongoose";
import { errorResponse, successResponse } from "../common/helper/sendResponse";
import { IUser, Toggle } from "../common/types";
import UserModal from "./UserModal";

const createUser = async (telegramId: string) => {
  const existingUser = await UserModal.findOne({ telegramId });
  if (existingUser) {
    return errorResponse("User already exists");
  }

  const user = new UserModal({ telegramId });
  await user.save();
  return successResponse("User created successfully", user);
};

const getUser = async (telegramId: string) => {
  try {
    const user = await UserModal.findOne(
      { telegramId },
      {
        isActive: 1,
        notificationOn: 1,
        vol_24hr_gte: 1,
        pc_24_hr_gte: 1,
        liquidity_gte: 1,
        market_cap_gte: 1,
        chain: 1,
        mention_count_24hr_gte: 1,
        influencer_count_24hr_gte: 1,
        amount: 1,
        stop_loss: 1,
        profit_target: 1,
        walletAddress: 1,
      }
    );
    if (!user) {
      return errorResponse("User not found", { telegramId });
    }
    return successResponse("User fetched successfully", user);
  } catch (error) {
    console.error(error);
    return errorResponse("Error fetching user", { error });
  }
};

const updateUser = async (
  telegramId: string,
  updates: {
    notificationOn?: Toggle;
    isActive?: Toggle;
    isDeleted?: Toggle;
    // Token data fields
    vol_24hr_gte?: string;
    pc_24_hr_gte?: number;
    liquidity_gte?: number;
    market_cap_gte?: string;
    chain?: string[] | string;
    mention_count_24hr_gte?: number;
    influencer_count_24hr_gte?: string;
    amount?: number;
    // Trading targets
    stop_loss?: string;
    profit_target?: string;
  }
) => {
  const existingUser = await UserModal.findOne({ telegramId });
  if (!existingUser) {
    return errorResponse("User not found", { telegramId });
  }

  const user = await UserModal.findOneAndUpdate(
    { telegramId },
    { $set: updates },
    { new: true }
  );
  return successResponse("User updated successfully", user);
};

const getAllUsers = async (filters: FilterQuery<IUser>) => {
  try {
    const users = await UserModal.find(filters, {
      isActive: 1,
      notificationOn: 1,
      isAdmin: 1,
      telegramId: 1,
      vol_24hr_gte: 1,
      pc_24_hr_gte: 1,
      liquidity_gte: 1,
      market_cap_gte: 1,
      chain: 1,
      mention_count_24hr_gte: 1,
      influencer_count_24hr_gte: 1,
      amount: 1,
      stop_loss: 1,
      profit_target: 1,
      walletAddress: 1,
    });
    return successResponse("Users fetched successfully", users);
  } catch (error: any) {
    console.error("[ERROR] Error fetching users:", error.message);
    return errorResponse("Error fetching users", error.message);
  }
};

const getUserById = async (userId: string) => {
  try {
    const user = await UserModal.findById(userId, {
      isActive: 1,
      notificationOn: 1,
      vol_24hr_gte: 1,
      pc_24_hr_gte: 1,
      liquidity_gte: 1,
      market_cap_gte: 1,
      chain: 1,
      mention_count_24hr_gte: 1,
      influencer_count_24hr_gte: 1,
      amount: 1,
      stop_loss: 1,
      profit_target: 1,
      walletAddress: 1,
    });
    if (!user) {
      return errorResponse("User not found", { userId });
    }
    return successResponse("User fetched successfully", user);
  } catch (error) {
    console.error(error);
    return errorResponse("Error fetching user", { error });
  }
};

const getAdminUser = async () => {
  try {
    const user = await UserModal.findOne(
      { isAdmin: Toggle.TRUE },
      {
        isActive: 1,
        notificationOn: 1,
        isAdmin: 1,
        telegramId: 1,
        walletAddress: 1,
      }
    );
    if (!user) {
      return errorResponse("Admin user not found");
    }
    return successResponse("Admin user fetched successfully", user);
  } catch (error: any) {
    console.error("[ERROR] Error fetching admin user:", error.message);
    return errorResponse("Error fetching admin user", error.message);
  }
};

export {
  createUser,
  getAdminUser,
  getAllUsers,
  getUser,
  getUserById,
  updateUser,
};
