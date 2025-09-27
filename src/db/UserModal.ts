import mongoose from "mongoose";
import { IUser, Toggle } from "../common/types";
import { generateWallet } from "../wallet";

const UserSchema = new mongoose.Schema<IUser>({
  telegramId: {
    type: Number,
    unique: true,
    index: true,
    immutable: true,
  },
  notificationOn: { type: String, enum: Toggle, default: Toggle.TRUE },
  isActive: {
    type: String,
    enum: Toggle,
    default: Toggle.TRUE,
  },
  isAdmin: {
    type: String,
    enum: Toggle,
    default: Toggle.FALSE,
  },
  isDeleted: {
    type: String,
    enum: Toggle,
    default: Toggle.FALSE,
  },
  walletAddress: {
    type: String,
    default: generateWallet().address,
  },
  createdAt: { type: Number, default: Date.now, immutable: true },
  updatedAt: { type: Number, default: Date.now },

  // Token data fields
  vol_24hr_gte: { type: String, default: "100000" }, // 100K
  pc_24_hr_gte: { type: Number },
  liquidity_gte: { type: Number, default: 25000 }, // 25K
  market_cap_gte: { type: String, default: "100000" }, // 100K
  chain: { type: [String], default: ["BASE", "ETH"] },
  amount: { type: Number, default: 1 }, // Trading amount in USD
  mention_count_24hr_gte: { type: Number, default: 25 },
  influencer_count_24hr_gte: { type: String, default: "5" },

  // Trading targets
  stop_loss: { type: String, default: "30" }, // 30%
  profit_target: { type: String, default: "50" }, // 50%
});

const UserModal = mongoose.model<IUser>("User", UserSchema);

export default UserModal;
