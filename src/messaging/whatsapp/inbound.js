export function extractIncomingMessages(payload) {
  if (payload?.object !== "whatsapp_business_account") return [];

  const messages = [];

  for (const entry of payload.entry || []) {
    for (const change of entry.changes || []) {
      for (const message of change.value?.messages || []) {
        const normalized = normalizeMessage(message);
        if (normalized) messages.push(normalized);
      }
    }
  }

  return messages;
}

function normalizeMessage(message) {
  const from = String(message?.from || "").trim();
  if (!from) return null;

  const type = message.type;

  if (type === "text") {
    return messageFields(from, message.text?.body);
  }

  if (type === "image") {
    return messageFields(from, message.image?.caption, {
      mediaId: message.image?.id || null,
      mediaType: message.image?.mime_type || "image/jpeg",
    });
  }

  if (type === "document" && String(message.document?.mime_type || "").startsWith("image/")) {
    return messageFields(from, message.document?.caption, {
      mediaId: message.document?.id || null,
      mediaType: message.document.mime_type,
    });
  }

  if (type === "button") {
    return messageFields(from, message.button?.text);
  }

  if (type === "interactive") {
    const reply = message.interactive?.button_reply || message.interactive?.list_reply;
    return messageFields(from, reply?.title);
  }

  return messageFields(from, "", { unsupportedType: type || "unknown" });
}

function messageFields(from, body, extra = {}) {
  return {
    from,
    body: String(body || "").trim(),
    mediaId: extra.mediaId || null,
    mediaType: extra.mediaType || null,
    unsupportedType: extra.unsupportedType || null,
  };
}
