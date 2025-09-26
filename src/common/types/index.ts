// USER STORAGE
export enum PoolType {
  CLMM = "CLMM",
  AMM = "AMM",
  BOTH = "BOTH",
}

export enum Toggle {
  TRUE = "TRUE",
  FALSE = "FALSE",
}

export interface TPLevels {
  targetPercent: number;
  takeProfitPercent: number;
}

export interface IUser {
  telegramId: number;
  tp: TPLevels;
  sl: number;
  poolType: PoolType;
  notificationOn: Toggle;
  purchaseAmountInSol: number;
  slippagePercentage: number;
  priorityFeeInSol: number;
  minimumLiquidity: number;
  autoSellTimeMinutes: number; // Auto-sell time in minutes after purchase
  maxTopHolderPercentage: number; // Maximum percentage a single holder can own
  maxTopTenHoldersPercentage: number; // Maximum percentage top 10 holders can own combined
  isActive: Toggle;
  isAdmin: Toggle;
  isDeleted: Toggle;
  createdAt: number;
  updatedAt: number;
}

// TELEGRAM

export interface StatusMessage {
  notificationOn: Toggle;
  tp: TPLevels;
  sl: number;
  slippagePercentage: number;
  purchaseAmountInSol: number;
  poolType: PoolType;
  priorityFeeInSol: number;
  minimumLiquidity: number;
  autoSellTimeMinutes: number;
  maxTopHolderPercentage: number;
  maxTopTenHoldersPercentage: number;
  isActive: Toggle;
}
