import { createHmac } from "node:crypto";
import { once } from "node:events";
import test from "node:test";
import assert from "node:assert/strict";

import app from "../src/app.js";
import { createWhatsAppClient } from "../src/messaging/whatsapp/client.js";
import { extractIncomingMessages } from "../src/messaging/whatsapp/inbound.js";
import { verifyWebhookSignature } from "../src/messaging/whatsapp/signature.js";

test("extracts text, image, and ignores delivery statuses", () => {
  const messages = extractIncomingMessages({
    object: "whatsapp_business_account",
    entry: [{
      changes: [{
        value: {
          statuses: [{ status: "delivered" }],
          messages: [
            { from: "5511999999999", type: "text", text: { body: " food 200 " } },
            {
              from: "5511888888888",
              type: "image",
              image: { id: "media-1", mime_type: "image/jpeg", caption: "lunch" },
            },
            { from: "5511777777777", type: "audio", audio: { id: "audio-1" } },
          ],
        },
      }],
    }],
  });

  assert.deepEqual(messages, [
    { from: "5511999999999", body: "food 200", mediaId: null, mediaType: null, unsupportedType: null },
    { from: "5511888888888", body: "lunch", mediaId: "media-1", mediaType: "image/jpeg", unsupportedType: null },
    { from: "5511777777777", body: "", mediaId: null, mediaType: null, unsupportedType: "audio" },
  ]);
});

test("verifies the Meta webhook signature", () => {
  const rawBody = Buffer.from('{"ok":true}');
  const signature = `sha256=${createHmac("sha256", "app-secret").update(rawBody).digest("hex")}`;

  assert.equal(verifyWebhookSignature({
    appSecret: "app-secret",
    rawBody,
    signatureHeader: signature,
  }), true);
  assert.equal(verifyWebhookSignature({
    appSecret: "app-secret",
    rawBody,
    signatureHeader: "sha256=deadbeef",
  }), false);
});

test("sends a text message to the Cloud API", async () => {
  const calls = [];
  const client = createWhatsAppClient({
    env: {
      WHATSAPP_TOKEN: "token",
      WHATSAPP_PHONE_NUMBER_ID: "phone-id",
      WHATSAPP_API_VERSION: "v23.0",
    },
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return { ok: true, json: async () => ({ messages: [{ id: "wamid" }] }), text: async () => "" };
    },
  });

  await client.sendMessage("whatsapp:+55 (11) 99999-9999", "oi");

  assert.equal(calls[0].url, "https://graph.facebook.com/v23.0/phone-id/messages");
  assert.equal(calls[0].options.headers.Authorization, "Bearer token");
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: "5511999999999",
    type: "text",
    text: { preview_url: false, body: "oi" },
  });
});

test("downloads media in two steps", async () => {
  const calls = [];
  const client = createWhatsAppClient({
    env: {
      WHATSAPP_TOKEN: "token",
      WHATSAPP_PHONE_NUMBER_ID: "phone-id",
    },
    fetchImpl: async (url) => {
      calls.push(url);
      if (calls.length === 1) {
        return { ok: true, json: async () => ({ url: "https://lookaside.example/file" }), text: async () => "" };
      }
      return { ok: true, arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer };
    },
  });

  const file = await client.downloadMedia("media-1");

  assert.equal(calls[0], "https://graph.facebook.com/v23.0/media-1");
  assert.equal(calls[1], "https://lookaside.example/file");
  assert.deepEqual([...file], [1, 2, 3]);
});

test("webhook handshake and signed post", async () => {
  const previous = {
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN,
    WHATSAPP_APP_SECRET: process.env.WHATSAPP_APP_SECRET,
  };
  process.env.WHATSAPP_VERIFY_TOKEN = "verify-me";
  process.env.WHATSAPP_APP_SECRET = "app-secret";

  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const { port } = server.address();

  try {
    const handshake = await fetch(
      `http://127.0.0.1:${port}/webhook?hub.mode=subscribe&hub.verify_token=verify-me&hub.challenge=12345`
    );
    assert.equal(handshake.status, 200);
    assert.equal(await handshake.text(), "12345");

    const rejected = await fetch(
      `http://127.0.0.1:${port}/webhook?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345`
    );
    assert.equal(rejected.status, 403);

    const payload = JSON.stringify({ object: "whatsapp_business_account", entry: [] });
    const signature = `sha256=${createHmac("sha256", "app-secret").update(payload).digest("hex")}`;
    const accepted = await fetch(`http://127.0.0.1:${port}/webhook`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hub-signature-256": signature,
      },
      body: payload,
    });
    assert.equal(accepted.status, 200);

    const forged = await fetch(`http://127.0.0.1:${port}/webhook`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-hub-signature-256": "sha256=nope",
      },
      body: payload,
    });
    assert.equal(forged.status, 403);
  } finally {
    server.close();
    restoreEnv(previous);
  }
});

function restoreEnv(previous) {
  for (const [key, value] of Object.entries(previous)) {
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
}
