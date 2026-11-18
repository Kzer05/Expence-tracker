import test from "node:test";
import assert from "node:assert/strict";

import { getDashboardData } from "../src/dashboard/dashboardData.js";
import { buildDashboardHtml } from "../src/dashboard/index.js";

const readyEnv = {
  WHATSAPP_TOKEN: "EAAG-test-token-value",
  WHATSAPP_PHONE_NUMBER_ID: "123456",
  WHATSAPP_VERIFY_TOKEN: "verify-me",
  WHATSAPP_APP_SECRET: "app-secret-value-xyz",
  WHATSAPP_DISPLAY_PHONE_NUMBER: "+5511999999999",
  WEBHOOK_PUBLIC_URL: "https://bot.example.com",
  WHATSAPP_API_VERSION: "v23.0",
  LLM_PROVIDER: "gemini",
};

test("dashboard data maps WhatsApp Cloud API environment values", () => {
  const data = getDashboardData(readyEnv);

  assert.equal(data.displayPhoneNumber, "+5511999999999");
  assert.equal(data.phoneNumberId, "123456");
  assert.equal(data.webhookUrl, "https://bot.example.com/webhook");
  assert.equal(data.credentialsReady, true);
  assert.deepEqual(data.missingEnv, []);
  assert.equal(data.provider, "gemini");
});

test("dashboard lists missing WhatsApp credentials without exposing secrets", () => {
  const data = getDashboardData({ LLM_PROVIDER: "claude" });

  assert.equal(data.credentialsReady, false);
  assert.deepEqual(data.missingEnv, [
    "WHATSAPP_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_VERIFY_TOKEN",
    "WHATSAPP_APP_SECRET",
  ]);
});

test("dashboard html includes the Cloud API setup", () => {
  const html = buildDashboardHtml(readyEnv);

  assert.match(html, /\+5511999999999/);
  assert.match(html, /https:\/\/bot\.example\.com\/webhook/);
  assert.match(html, /Copy webhook URL/);
  assert.match(html, /Setup checklist/);
  assert.doesNotMatch(html, /EAAG-test-token-value/);
  assert.doesNotMatch(html, /app-secret-value-xyz/);
  assert.doesNotMatch(html, /verify-me/);
});
