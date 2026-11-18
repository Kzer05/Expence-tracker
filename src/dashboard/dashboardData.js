import { getWhatsAppConfig, missingWhatsAppEnv } from "../messaging/whatsapp/config.js";

export function getDashboardData(env = process.env) {
  const whatsapp = getWhatsAppConfig(env);
  const missingEnv = missingWhatsAppEnv(whatsapp);
  const webhookUrl = whatsapp.webhookPublicUrl
    ? `${whatsapp.webhookPublicUrl}/webhook`
    : "/webhook";

  return {
    appName: "Expense Tracker Bot",
    displayPhoneNumber: whatsapp.displayPhoneNumber || "Not set",
    phoneNumberId: whatsapp.phoneNumberId || "Not set",
    webhookUrl,
    apiVersion: whatsapp.apiVersion,
    credentialsReady: missingEnv.length === 0,
    missingEnv,
    provider: env.LLM_PROVIDER || "gemini",
    providerLabels: {
      claude: "Claude",
      openai: "OpenAI",
      gemini: "Gemini",
    },
  };
}
