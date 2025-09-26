import mongoose from "mongoose";
import { IUser, Toggle } from "../common/types";

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
  createdAt: { type: Number, default: Date.now, immutable: true },
  updatedAt: { type: Number, default: Date.now },
});

const UserModal = mongoose.model<IUser>("User", UserSchema);

export default UserModal;
