import { StatusMessage, Toggle } from "../common/types";

export const formatStatusMessage = (message: StatusMessage) => {
  return `<b>🤖 Bot Status</b>
  
  🔔 <b>Notification:</b> ${
    message.notificationOn === Toggle.TRUE ? "On" : "Off"
  }
  🎯 <b>Sniping Status:</b> ${message.isActive === Toggle.TRUE ? "On" : "Off"}`;
};
