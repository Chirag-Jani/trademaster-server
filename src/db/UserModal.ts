import mongoose from "mongoose";
import { IUser, PoolType, Toggle } from "../common/types";

const UserSchema = new mongoose.Schema<IUser>({
  telegramId: {
    type: Number,
    unique: true,
    index: true,
    immutable: true,
  },
  tp: {
    type: {
      targetPercent: { type: Number, required: true },
      takeProfitPercent: { type: Number, required: true },
    },
    default: { targetPercent: 50, takeProfitPercent: 100 },
  },
  sl: { type: Number, default: 30 },
  poolType: {
    type: String,
    enum: PoolType,
    default: PoolType.BOTH,
  },
  notificationOn: { type: String, enum: Toggle, default: Toggle.TRUE },
  purchaseAmountInSol: { type: Number, default: 0.1 },
  slippagePercentage: { type: Number, default: 5 },
  priorityFeeInSol: { type: Number, default: 0.001 },
  minimumLiquidity: { type: Number, default: 5000 },
  autoSellTimeMinutes: { type: Number, default: 10 },
  maxTopHolderPercentage: { type: Number, default: 40 },
  maxTopTenHoldersPercentage: { type: Number, default: 60 },
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
  createdAt: { type: Number, default: Date.now, immutable: true },
  updatedAt: { type: Number, default: Date.now },
});

const UserModal = mongoose.model<IUser>("User", UserSchema);

export default UserModal;
