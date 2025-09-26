import { StatusMessage, Toggle } from "../common/types";

export const formatStatusMessage = (message: StatusMessage) => {
  return `<b>🤖 Bot Status</b>
  
  🔔 <b>Notification:</b> ${
    message.notificationOn === Toggle.TRUE ? "On" : "Off"
  }
  📈 <b>Take Profit:</b> Sell ${message.tp.takeProfitPercent}% at ${
    message.tp.targetPercent
  }% profit
  📉 <b>Stop Loss:</b> ${message.sl}%
  💰 <b>Purchase Amount:</b> ${message.purchaseAmountInSol} SOL
  💧 <b>Min Liquidity:</b> ${message.minimumLiquidity} USD
  ⏰ <b>Auto-Sell Time:</b> ${message.autoSellTimeMinutes} minutes
  👤 <b>Max Top Holder:</b> ${message.maxTopHolderPercentage}%
  👥 <b>Max Top 10 Holders:</b> ${message.maxTopTenHoldersPercentage}%
  🎯 <b>Sniping Status:</b> ${message.isActive === Toggle.TRUE ? "On" : "Off"}`;
};
