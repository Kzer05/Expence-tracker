import { createHmac } from "node:crypto";
import { safeEqual } from "./config.js";

export function verifyWebhookSignature({ appSecret, rawBody, signatureHeader }) {
  if (!appSecret || !rawBody || !signatureHeader) return false;

  const digest = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  return safeEqual(`sha256=${digest}`, String(signatureHeader).trim());
}
