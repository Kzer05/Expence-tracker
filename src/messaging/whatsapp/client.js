import { assertCanSend, getWhatsAppConfig } from "./config.js";

const TEXT_LIMIT = 4096;

export function createWhatsAppClient({ fetchImpl = fetch, env = process.env } = {}) {
  async function graphJson(path, { method = "GET", body } = {}) {
    const config = readSendConfig();
    const response = await fetchImpl(`${config.graphBaseUrl}/${config.apiVersion}/${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`WhatsApp API ${method} ${path} failed: ${response.status} ${detail}`);
    }

    return response.json();
  }

  function readSendConfig() {
    const config = getWhatsAppConfig(env);
    assertCanSend(config);
    return config;
  }

  return {
    async sendMessage(to, text) {
      const config = readSendConfig();
      const recipient = normalizeWhatsAppRecipient(to);
      if (!recipient) throw new Error("WhatsApp recipient is required");

      for (const chunk of splitText(text)) {
        await graphJson(`${config.phoneNumberId}/messages`, {
          method: "POST",
          body: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: recipient,
            type: "text",
            text: { preview_url: false, body: chunk },
          },
        });
      }
    },

    async downloadMedia(mediaId) {
      if (!mediaId) throw new Error("WhatsApp media id is required");

      const metadata = await graphJson(mediaId);
      if (!metadata?.url) throw new Error("WhatsApp media URL missing");

      const config = readSendConfig();
      const response = await fetchImpl(metadata.url, {
        headers: { Authorization: `Bearer ${config.token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to download WhatsApp media: ${response.status}`);
      }

      return Buffer.from(await response.arrayBuffer());
    },
  };
}

export function normalizeWhatsAppRecipient(value) {
  return String(value || "").replace(/^whatsapp:/i, "").replace(/\D/g, "");
}

export function splitText(text, limit = TEXT_LIMIT) {
  const value = String(text ?? "");
  if (value.length <= limit) return [value];

  const chunks = [];
  let rest = value;

  while (rest.length > limit) {
    let cut = rest.lastIndexOf("\n", limit);
    if (cut < Math.floor(limit / 2)) cut = limit;
    chunks.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\n/, "");
  }

  if (rest) chunks.push(rest);
  return chunks;
}
