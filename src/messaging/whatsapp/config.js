import { timingSafeEqual } from "node:crypto";

const DEFAULT_API_VERSION = "v23.0";
const DEFAULT_GRAPH_BASE_URL = "https://graph.facebook.com";

export const REQUIRED_WHATSAPP_FIELDS = [
  ["WHATSAPP_TOKEN", "token"],
  ["WHATSAPP_PHONE_NUMBER_ID", "phoneNumberId"],
  ["WHATSAPP_VERIFY_TOKEN", "verifyToken"],
  ["WHATSAPP_APP_SECRET", "appSecret"],
];

export function getWhatsAppConfig(env = process.env) {
  const apiVersion = (env.WHATSAPP_API_VERSION || DEFAULT_API_VERSION).trim();

  return {
    token: (env.WHATSAPP_TOKEN || "").trim(),
    phoneNumberId: (env.WHATSAPP_PHONE_NUMBER_ID || "").trim(),
    businessAccountId: (env.WHATSAPP_BUSINESS_ACCOUNT_ID || "").trim(),
    appSecret: (env.WHATSAPP_APP_SECRET || "").trim(),
    verifyToken: (env.WHATSAPP_VERIFY_TOKEN || "").trim(),
    displayPhoneNumber: (env.WHATSAPP_DISPLAY_PHONE_NUMBER || "").trim(),
    apiVersion,
    graphBaseUrl: (env.WHATSAPP_GRAPH_BASE_URL || DEFAULT_GRAPH_BASE_URL).replace(/\/$/, ""),
    webhookPublicUrl: (env.WEBHOOK_PUBLIC_URL || "").trim().replace(/\/$/, ""),
  };
}

export function missingWhatsAppEnv(config) {
  return REQUIRED_WHATSAPP_FIELDS
    .filter(([, key]) => !config[key])
    .map(([name]) => name);
}

export function assertCanSend(config) {
  if (!config.token || !config.phoneNumberId) {
    throw new Error("WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID are required");
  }
}

export function resolveWebhookChallenge({ mode, token, challenge, verifyToken }) {
  if (mode !== "subscribe" || challenge == null || challenge === "") return null;
  if (!verifyToken || !token || !safeEqual(token, verifyToken)) return null;
  return String(challenge);
}

export function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
