import { createWhatsAppClient } from "./client.js";

const defaultClient = createWhatsAppClient();

export function sendMessage(to, text) {
  return defaultClient.sendMessage(to, text);
}

export function downloadMedia(mediaId) {
  return defaultClient.downloadMedia(mediaId);
}

export { createWhatsAppClient, normalizeWhatsAppRecipient, splitText } from "./client.js";
export { extractIncomingMessages } from "./inbound.js";
export { verifyWebhookSignature } from "./signature.js";
export {
  getWhatsAppConfig,
  missingWhatsAppEnv,
  resolveWebhookChallenge,
} from "./config.js";
