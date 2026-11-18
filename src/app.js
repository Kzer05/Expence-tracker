import express from "express";
import { handleIncomingMessage } from "./whatsapp.js";
import { buildDashboardHtml } from "./dashboard/index.js";
import {
  extractIncomingMessages,
  getWhatsAppConfig,
  resolveWebhookChallenge,
  verifyWebhookSignature,
} from "./messaging/whatsapp/index.js";

const app = express();
let warnedAboutMissingSecret = false;

app.use(express.json({
  limit: "1mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));

app.get("/", (_req, res) => {
  res.status(200).type("html").send(buildDashboardHtml());
});

app.get("/health", (_req, res) => res.send("Expense Tracker Bot is running ✅"));

app.get("/webhook", (req, res) => {
  const config = getWhatsAppConfig();
  const challenge = resolveWebhookChallenge({
    mode: req.query["hub.mode"],
    token: req.query["hub.verify_token"],
    challenge: req.query["hub.challenge"],
    verifyToken: config.verifyToken,
  });

  if (challenge == null) return res.sendStatus(403);
  return res.status(200).type("text/plain").send(challenge);
});

app.post("/webhook", (req, res) => {
  const config = getWhatsAppConfig();

  if (config.appSecret) {
    const valid = verifyWebhookSignature({
      appSecret: config.appSecret,
      rawBody: req.rawBody,
      signatureHeader: req.get("x-hub-signature-256"),
    });
    if (!valid) return res.sendStatus(403);
  } else if (!warnedAboutMissingSecret) {
    warnedAboutMissingSecret = true;
    console.warn("WHATSAPP_APP_SECRET is not set; webhook signatures are not being verified.");
  }

  const messages = extractIncomingMessages(req.body);
  res.sendStatus(200);

  for (const message of messages) {
    handleIncomingMessage(message).catch((err) => {
      console.error("Webhook processing error:", err);
    });
  }
});

export default app;
