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
