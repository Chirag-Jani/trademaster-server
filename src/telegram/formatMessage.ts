import { formatNumber } from "../common/helper/formatNumber";
import { StatusMessage, Toggle, TokenDataItem } from "../common/types";

export const formatStatusMessage = (message: StatusMessage) => {
  return `<b>🤖 Bot Status</b>
  
  🔔 <b>Notification:</b> ${
    message.notificationOn === Toggle.TRUE ? "On" : "Off"
  }
  🎯 <b>Sniping Status:</b> ${message.isActive === Toggle.TRUE ? "On" : "Off"}`;
};

export const formatTokenNotification = (token: TokenDataItem): string => {
  const formattedMessage = `🔔 <b>Token Alert</b>

<b>${token.token_name || "Unknown"} (${token.token_symbol || "Unknown"})</b>
💹 24h Change: ${token.pc_24_hr > 0 ? "+" : ""}${token.pc_24_hr}%
💰 Market Cap: $${formatNumber(parseFloat(token.market_cap))}
💧 Liquidity: $${formatNumber(token.liquidity)}
📊 24h Volume: $${formatNumber(parseFloat(token.vol_24hr || "0"))}

🔍 Social Metrics:
👥 Mentions: ${token.mention_count_24hr || 0}
🎯 Influencer Mentions: ${token.influencer_count_24hr || "0"}

🌐 Chain: ${token.chain || "Unknown"}
📍 Token ID: <code>${token.token_id || "Unknown"}</code>`;

  return formattedMessage;
};
