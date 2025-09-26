import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const TELEGRAM_CONCURRENT_REQUESTS = Number(
  process.env.TELEGRAM_CONCURRENT_REQUESTS || 5
);
const TELEGRAM_MESSAGE_DELAY = Number(
  process.env.TELEGRAM_MESSAGE_DELAY || 0.5
);

const BASE_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const sendMessage = async (
  tgId: string,
  message: string,
  parseMode: "HTML" | "Markdown" | undefined = "HTML"
): Promise<boolean> => {
  try {
    const url = `${BASE_URL}/sendMessage`;

    const payload = {
      chat_id: tgId,
      text: message,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    };

    const response = await axios.post(url, payload);

    if (response.status === 200) {
      console.info(`✅ Message sent successfully to chat_id: ${tgId}`);
      return true;
    } else {
      console.error(`❌ Failed to send message to ${tgId}: ${response.status}`);
      return false;
    }
  } catch (error: any) {
    console.error(
      `⚠️ Error sending Telegram message to ${tgId}: ${error.message}`
    );
    return false;
  }
};

const sendBulkMessages = async (
  tgIds: string[],
  message: string
): Promise<Record<string, boolean>> => {
  if (!tgIds || tgIds.length === 0) {
    console.warn("⚠️ No chat IDs provided for bulk message send");
    return {};
  }

  console.info(
    `🚀 Sending bulk message to ${tgIds.length} chats with ${TELEGRAM_CONCURRENT_REQUESTS} concurrent requests and ${TELEGRAM_MESSAGE_DELAY}s delay`
  );

  const results: Record<string, boolean> = {};
  const queue = [...tgIds];

  const worker = async () => {
    while (queue.length > 0) {
      const tgId = queue.shift();
      if (!tgId) continue;

      await new Promise((res) =>
        setTimeout(res, TELEGRAM_MESSAGE_DELAY * 1000)
      );

      const success = await sendMessage(tgId, message);
      results[tgId] = success;
    }
  };

  const workers = Array.from({ length: TELEGRAM_CONCURRENT_REQUESTS }, () =>
    worker()
  );
  await Promise.all(workers);

  const successful = Object.values(results).filter(Boolean).length;
  const failed = tgIds.length - successful;

  console.info(`📊 Bulk send complete: ✅ ${successful} | ❌ ${failed}`);

  return results;
};

export { sendBulkMessages, sendMessage };
