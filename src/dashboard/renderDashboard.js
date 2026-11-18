function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderDashboard(data) {
  const providerLabel = data.providerLabels?.[data.provider] || data.provider;
  const displayPhoneNumber = escapeHtml(data.displayPhoneNumber);
  const webhookUrl = escapeHtml(data.webhookUrl);
  const phoneNumberId = escapeHtml(data.phoneNumberId);
  const apiVersion = escapeHtml(data.apiVersion);
  const missingEnv = escapeHtml((data.missingEnv || []).join(", ") || "none");
  const credentialLabel = data.credentialsReady ? "Ready" : "Missing credentials";
  const credentialClass = data.credentialsReady ? "good" : "warn";
  const appName = escapeHtml(data.appName);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <title>${appName} Dashboard</title>
  <style>
    :root {
      --bg: #06101d;
      --bg-2: #09192c;
      --surface: rgba(9, 18, 34, 0.8);
      --surface-strong: rgba(10, 22, 42, 0.96);
      --surface-soft: rgba(148, 163, 184, 0.08);
      --border: rgba(148, 163, 184, 0.16);
      --border-strong: rgba(148, 163, 184, 0.26);
      --text: #e6eefc;
      --muted: #95a7c3;
      --muted-2: #71839f;
      --accent: #78f1d6;
      --accent-2: #7ab8ff;
      --accent-3: #f9d65c;
      --shadow: 0 30px 90px rgba(2, 8, 23, 0.55);
      --radius-xl: 28px;
      --radius-lg: 22px;
      --radius-md: 16px;
      --radius-sm: 12px;
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      min-height: 100vh;
      color: var(--text);
      background:
        radial-gradient(circle at top left, rgba(122, 184, 255, 0.22), transparent 26%),
        radial-gradient(circle at top right, rgba(120, 241, 214, 0.18), transparent 28%),
        linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      pointer-events: none;
      background-image:
        linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
      background-size: 64px 64px;
      mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 90%);
    }

    .page {
      position: relative;
      max-width: 1240px;
      margin: 0 auto;
      padding: 24px 20px 40px;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      padding: 18px 22px;
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: rgba(7, 14, 27, 0.72);
      backdrop-filter: blur(20px);
      box-shadow: var(--shadow);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }

    .brand-mark {
      width: 46px;
      height: 46px;
      border-radius: 16px;
      display: grid;
      place-items: center;
      background: linear-gradient(135deg, rgba(120, 241, 214, 0.2), rgba(122, 184, 255, 0.18));
      border: 1px solid rgba(120, 241, 214, 0.3);
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
      font-weight: 800;
      letter-spacing: -0.05em;
      color: var(--text);
    }

    .brand-copy {
      min-width: 0;
    }

    .brand-copy strong {
      display: block;
      font-size: 1rem;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }

    .brand-copy span {
      display: block;
      color: var(--muted);
      font-size: 0.92rem;
      margin-top: 2px;
    }

    .status-row {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 10px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: 999px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.02);
      color: var(--text);
      font-size: 0.88rem;
      line-height: 1;
      white-space: nowrap;
    }

    .chip-dot {
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--accent);
      box-shadow: 0 0 0 6px rgba(120, 241, 214, 0.12);
    }

    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
      gap: 20px;
      margin-top: 20px;
    }

    .panel {
      border: 1px solid var(--border);
      border-radius: var(--radius-xl);
      background: var(--surface);
      box-shadow: var(--shadow);
      backdrop-filter: blur(18px);
    }

    .hero-main {
      padding: 34px 34px 30px;
      position: relative;
      overflow: hidden;
    }

    .hero-main::after {
      content: "";
      position: absolute;
      right: -80px;
      top: -80px;
      width: 240px;
      height: 240px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(120, 241, 214, 0.16), transparent 68%);
      pointer-events: none;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: 999px;
      border: 1px solid rgba(122, 184, 255, 0.22);
      background: rgba(122, 184, 255, 0.08);
      color: #b9d7ff;
      font-size: 0.79rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    .eyebrow::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: var(--accent-2);
      box-shadow: 0 0 0 5px rgba(122, 184, 255, 0.12);
    }

    h1 {
      margin: 18px 0 0;
      font-size: clamp(2.5rem, 6vw, 4.9rem);
      line-height: 0.94;
      letter-spacing: -0.06em;
      max-width: 11ch;
      text-wrap: balance;
    }

    .lede {
      margin: 18px 0 0;
      max-width: 68ch;
      color: var(--muted);
      font-size: 1.04rem;
      line-height: 1.7;
    }

    .cta-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }

    .button {
      appearance: none;
      border: 1px solid transparent;
      border-radius: 14px;
      padding: 12px 16px;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
    }

    .button:hover {
      transform: translateY(-1px);
    }

    .button-primary {
      background: linear-gradient(135deg, rgba(120, 241, 214, 0.92), rgba(122, 184, 255, 0.9));
      color: #08101d;
      box-shadow: 0 16px 30px rgba(122, 184, 255, 0.18);
    }

    .button-secondary {
      background: rgba(255, 255, 255, 0.03);
      color: var(--text);
      border-color: var(--border);
    }

    .hero-side {
      padding: 18px;
      display: grid;
      gap: 12px;
    }

    .metric {
      padding: 18px 18px 16px;
      border-radius: var(--radius-lg);
      background: rgba(11, 20, 37, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .metric-label {
      display: block;
      color: var(--muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.14em;
      margin-bottom: 10px;
    }

    .metric-value {
      display: flex;
      align-items: center;
      gap: 10px;
      justify-content: space-between;
      font-size: 1.02rem;
      font-weight: 700;
      line-height: 1.35;
      word-break: break-word;
    }

    .metric-code {
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      color: #e2eeff;
      font-size: 0.95rem;
    }

    .copy {
      flex: 0 0 auto;
      border: 1px solid rgba(122, 184, 255, 0.22);
      background: rgba(122, 184, 255, 0.08);
      color: #cfe3ff;
      border-radius: 10px;
      padding: 8px 10px;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .copy:hover {
      border-color: rgba(122, 184, 255, 0.35);
    }

    .layout {
      display: grid;
      grid-template-columns: repeat(12, minmax(0, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .section {
      padding: 24px;
    }

    .span-7 { grid-column: span 7; }
    .span-5 { grid-column: span 5; }
    .span-6 { grid-column: span 6; }
    .span-12 { grid-column: span 12; }

    .section-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
    }

    h2 {
      margin: 0;
      font-size: 1.02rem;
      letter-spacing: -0.02em;
    }

    .section-copy {
      margin: 6px 0 0;
      color: var(--muted);
      font-size: 0.94rem;
      line-height: 1.55;
      max-width: 66ch;
    }

    .list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: grid;
      gap: 12px;
    }

    .list-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 16px;
      border-radius: var(--radius-md);
      background: rgba(11, 20, 37, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .list-icon {
      width: 34px;
      height: 34px;
      border-radius: 12px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      background: linear-gradient(135deg, rgba(120, 241, 214, 0.18), rgba(122, 184, 255, 0.16));
      border: 1px solid rgba(122, 184, 255, 0.18);
      color: var(--text);
      font-weight: 800;
    }

    .list-item strong {
      display: block;
      margin-bottom: 4px;
      font-size: 0.98rem;
    }

    .list-item p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
      font-size: 0.94rem;
    }

    .grid-two {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .info-card {
      padding: 16px;
      border-radius: var(--radius-md);
      border: 1px solid rgba(148, 163, 184, 0.12);
      background: rgba(11, 20, 37, 0.72);
    }

    .info-card span {
      display: block;
      color: var(--muted);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      margin-bottom: 10px;
    }

    .info-card strong {
      display: block;
      font-size: 1rem;
      line-height: 1.45;
      word-break: break-word;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      overflow: hidden;
      border-radius: var(--radius-md);
      border: 1px solid rgba(148, 163, 184, 0.12);
      background: rgba(11, 20, 37, 0.72);
    }

    .table th,
    .table td {
      padding: 14px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      vertical-align: top;
      font-size: 0.94rem;
    }

    .table th {
      color: var(--muted);
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.02);
    }

    .table tr:last-child td {
      border-bottom: none;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 999px;
      background: rgba(122, 184, 255, 0.1);
      border: 1px solid rgba(122, 184, 255, 0.18);
      color: #dcebff;
      font-size: 0.88rem;
      font-weight: 700;
    }

    .pill.good {
      background: rgba(120, 241, 214, 0.1);
      border-color: rgba(120, 241, 214, 0.18);
      color: #dafdf5;
    }

    .pill.warn {
      background: rgba(249, 214, 92, 0.12);
      border-color: rgba(249, 214, 92, 0.2);
      color: #fff0bb;
    }

    .footer {
      margin: 24px 0 8px;
      color: var(--muted-2);
      text-align: center;
      font-size: 0.9rem;
    }

    .timeline {
      display: grid;
      gap: 12px;
      margin-top: 6px;
    }

    .timeline-item {
      display: grid;
      grid-template-columns: 90px 1fr;
      gap: 12px;
      align-items: start;
      padding: 14px;
      border-radius: var(--radius-md);
      background: rgba(11, 20, 37, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .timeline-mark {
      color: #bcd7ff;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.11em;
      font-weight: 700;
      padding-top: 3px;
    }

    .timeline-item strong {
      display: block;
      margin-bottom: 4px;
      font-size: 0.97rem;
    }

    .timeline-item p {
      margin: 0;
      color: var(--muted);
      line-height: 1.6;
      font-size: 0.93rem;
    }

    .faq-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
      margin-top: 6px;
    }

    .faq-item {
      padding: 14px;
      border-radius: var(--radius-md);
      background: rgba(11, 20, 37, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.12);
    }

    .faq-item strong {
      display: block;
      margin-bottom: 6px;
      font-size: 0.95rem;
      color: #e9f2ff;
    }

    .faq-item p {
      margin: 0;
      font-size: 0.92rem;
      line-height: 1.58;
      color: var(--muted);
    }

    .checklist {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 10px;
    }

    .checklist li {
      padding: 12px 14px;
      border-radius: 12px;
      border: 1px solid rgba(148, 163, 184, 0.12);
      background: rgba(11, 20, 37, 0.72);
      color: var(--muted);
      line-height: 1.55;
      font-size: 0.93rem;
    }

    .checklist li strong {
      color: #e8f2ff;
    }

    .muted-link {
      color: #c5ddff;
      text-decoration: none;
    }

    .muted-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 960px) {
      .hero,
      .layout,
      .grid-two,
      .faq-grid {
        grid-template-columns: 1fr;
      }

      .span-7,
      .span-5,
      .span-6,
      .span-12 {
        grid-column: span 12;
      }

      .topbar,
      .section-head {
        flex-direction: column;
        align-items: flex-start;
      }

      .status-row {
        justify-content: flex-start;
      }
    }
  </style>
</head>
<body>
  <main class="page">
    <header class="topbar panel">
      <div class="brand">
        <div class="brand-mark">ET</div>
        <div class="brand-copy">
          <strong>${appName}</strong>
          <span>WhatsApp expense tracking with the Meta Cloud API</span>
        </div>
      </div>

      <div class="status-row">
        <span class="chip"><span class="chip-dot"></span> Dashboard live</span>
        <span class="chip">Provider: ${escapeHtml(providerLabel)}</span>
        <span class="chip">Route: <a class="muted-link" href="/health">/health</a></span>
      </div>
    </header>

    <section class="hero">
      <section class="panel hero-main">
        <div class="eyebrow">WhatsApp expense assistant</div>
        <h1>Track spending by sending one message or a bill photo.</h1>
        <p class="lede">
          Message the business number below. The bot logs the expense, stores it, and answers with the monthly summary.
        </p>
        <div class="cta-row">
          <button class="button button-primary" data-copy="${webhookUrl}">Copy webhook URL</button>
          <button class="button button-secondary" data-copy="${displayPhoneNumber}">Copy WhatsApp number</button>
        </div>
      </section>

      <aside class="panel hero-side">
        <div class="metric">
          <span class="metric-label">WhatsApp number</span>
          <div class="metric-value">
            <span class="metric-code">${displayPhoneNumber}</span>
            <button class="copy" data-copy="${displayPhoneNumber}">Copy</button>
          </div>
        </div>
        <div class="metric">
          <span class="metric-label">Webhook URL</span>
          <div class="metric-value">
            <span class="metric-code">${webhookUrl}</span>
            <button class="copy" data-copy="${webhookUrl}">Copy</button>
          </div>
        </div>
        <div class="metric">
          <span class="metric-label">Phone number ID · ${apiVersion}</span>
          <div class="metric-value">
            <span class="metric-code">${phoneNumberId}</span>
            <span class="pill ${credentialClass}">${credentialLabel}</span>
          </div>
        </div>
        <div class="metric">
          <span class="metric-label">Active AI provider</span>
          <div class="metric-value">
            <span>${escapeHtml(providerLabel)}</span>
            <span class="pill good">Configured</span>
          </div>
        </div>
      </aside>
    </section>

    <section class="layout">
      <article class="panel section span-7">
        <div class="section-head">
          <div>
            <h2>Setup checklist</h2>
            <p class="section-copy">A simple path for first-time users to connect WhatsApp to the bot and start logging expenses.</p>
          </div>
          <span class="pill">3 steps</span>
        </div>

        <ol class="list">
          <li class="list-item">
            <div class="list-icon">1</div>
            <div>
              <strong>Add the Cloud API credentials</strong>
              <p>Fill <code>WHATSAPP_TOKEN</code>, <code>WHATSAPP_PHONE_NUMBER_ID</code>, <code>WHATSAPP_VERIFY_TOKEN</code>, and <code>WHATSAPP_APP_SECRET</code> in <code>.env</code>. Missing now: ${missingEnv}.</p>
            </div>
          </li>
          <li class="list-item">
            <div class="list-icon">2</div>
            <div>
              <strong>Connect the Meta webhook</strong>
              <p>In the Meta app, set the callback to <code>${webhookUrl}</code>, paste the same verify token, and subscribe to the <code>messages</code> field.</p>
            </div>
          </li>
          <li class="list-item">
            <div class="list-icon">3</div>
            <div>
              <strong>Start sending expenses</strong>
              <p>Try <code>food 200</code>, <code>uber 150</code>, or a bill photo. The bot will parse, store, and summarize the data for you.</p>
            </div>
          </li>
        </ol>
      </article>

      <aside class="panel section span-5">
        <div class="section-head">
          <div>
            <h2>Quick reference</h2>
            <p class="section-copy">What users will need most often once they are connected.</p>
          </div>
        </div>

        <div class="grid-two">
          <div class="info-card">
            <span>Message the bot</span>
            <strong>${displayPhoneNumber}</strong>
          </div>
          <div class="info-card">
            <span>Webhook</span>
            <strong>${webhookUrl}</strong>
          </div>
          <div class="info-card">
            <span>Summary command</span>
            <strong><code>summary</code></strong>
          </div>
          <div class="info-card">
            <span>Monthly report</span>
            <strong><code>report</code></strong>
          </div>
        </div>
      </aside>

      <article class="panel section span-6">
        <div class="section-head">
          <div>
            <h2>What users can send</h2>
            <p class="section-copy">The bot accepts simple text commands or receipt images.</p>
          </div>
          <span class="pill warn">Examples</span>
        </div>

        <table class="table" aria-label="Supported message types">
          <thead>
            <tr>
              <th>Input</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>food 200</code></td>
              <td>Logs a Food expense with the parsed amount.</td>
            </tr>
            <tr>
              <td><code>uber 150</code></td>
              <td>Stores the transaction under Transport.</td>
            </tr>
            <tr>
              <td><code>summary</code></td>
              <td>Shows category totals for the current month.</td>
            </tr>
            <tr>
              <td>Receipt photo</td>
              <td>Extracts the final amount and category from the image.</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="panel section span-6">
        <div class="section-head">
          <div>
            <h2>Operational notes</h2>
            <p class="section-copy">Small details that help users and maintainers understand the system at a glance.</p>
          </div>
        </div>

        <div class="list">
          <div class="list-item">
            <div class="list-icon">AI</div>
            <div>
              <strong>Provider fallback is enabled</strong>
              <p>If the active AI provider fails, the app can fall back to the next configured provider automatically.</p>
            </div>
          </div>
          <div class="list-item">
            <div class="list-icon">HQ</div>
            <div>
              <strong>Designed for onboarding</strong>
              <p>The page shows the business number to message and the webhook URL to register in the Meta app.</p>
            </div>
          </div>
        </div>
      </article>

      <article class="panel section span-7">
        <div class="section-head">
          <div>
            <h2>Onboarding timeline</h2>
            <p class="section-copy">What a good first-day rollout looks like for this bot from setup to live usage.</p>
          </div>
          <span class="pill">Step-by-step</span>
        </div>

        <div class="timeline">
          <div class="timeline-item">
            <div class="timeline-mark">0-15 min</div>
            <div>
              <strong>Configure environment and credentials</strong>
              <p>Set the WhatsApp Cloud API keys, Supabase keys, and the AI provider in your env file, then start the server and confirm the dashboard is reachable.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-mark">15-30 min</div>
            <div>
              <strong>Register the Meta webhook</strong>
              <p>Point the Meta callback at the public webhook URL, confirm the verify token, and send a test message from an allowed number.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-mark">30-45 min</div>
            <div>
              <strong>Validate commands and parsing</strong>
              <p>Test expense text parsing, image parsing, summary report, and delete-last behavior. Confirm data writes to Supabase as expected.</p>
            </div>
          </div>
          <div class="timeline-item">
            <div class="timeline-mark">45-60 min</div>
            <div>
              <strong>Production readiness check</strong>
              <p>Review logs, fallback behavior, and API quotas. If needed, swap provider priority and verify behavior under simulated provider failure.</p>
            </div>
          </div>
        </div>
      </article>

      <article class="panel section span-5">
        <div class="section-head">
          <div>
            <h2>Integration checklist</h2>
            <p class="section-copy">Use this before inviting real users onto the WhatsApp business number.</p>
          </div>
        </div>

        <ul class="checklist">
          <li><strong>Webhook URL configured:</strong> the Meta app callback points at the public HTTPS <code>/webhook</code> endpoint and is subscribed to messages.</li>
          <li><strong>Database healthy:</strong> Supabase table and summary RPC available with correct service role permissions.</li>
          <li><strong>Provider strategy set:</strong> Primary provider chosen and fallback providers configured with valid API keys.</li>
          <li><strong>Command UX verified:</strong> help, summary, report, and delete flow tested from a real WhatsApp device.</li>
          <li><strong>Operations baseline:</strong> cron job enabled and monitoring in place for webhook errors and provider failures.</li>
        </ul>
      </article>

      <article class="panel section span-12">
        <div class="section-head">
          <div>
            <h2>Command and behavior reference</h2>
            <p class="section-copy">A fuller reference for support teams and first-time users so they know exactly what the bot does.</p>
          </div>
        </div>

        <table class="table" aria-label="Command and behavior reference">
          <thead>
            <tr>
              <th>Command or input</th>
              <th>Purpose</th>
              <th>Expected bot response</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>food 200</code></td>
              <td>Log a new expense</td>
              <td>Saved confirmation with category, amount, and short note.</td>
              <td>Natural phrases like paid 200 for lunch are also parsed.</td>
            </tr>
            <tr>
              <td><code>summary</code></td>
              <td>View monthly totals</td>
              <td>Category-wise totals plus month total amount.</td>
              <td>Uses monthly summary query in Supabase.</td>
            </tr>
            <tr>
              <td><code>report</code></td>
              <td>Detailed monthly ledger</td>
              <td>Chronological expense list grouped by category.</td>
              <td>Useful for audits and monthly reconciliation.</td>
            </tr>
            <tr>
              <td><code>delete last</code></td>
              <td>Undo most recent entry</td>
              <td>Deletion confirmation of latest expense.</td>
              <td>Removes only one latest transaction for that number.</td>
            </tr>
            <tr>
              <td>Receipt image upload</td>
              <td>Parse bill automatically</td>
              <td>Extracted amount and category, then saved result.</td>
              <td>Clear photos improve extraction reliability.</td>
            </tr>
            <tr>
              <td><code>help</code></td>
              <td>Show usage tips</td>
              <td>Command menu with examples and supported actions.</td>
              <td>Recommended for onboarding new users.</td>
            </tr>
          </tbody>
        </table>
      </article>

      <article class="panel section span-12">
        <div class="section-head">
          <div>
            <h2>FAQ and troubleshooting</h2>
            <p class="section-copy">Answers to common issues users and operators usually hit during setup and day-to-day usage.</p>
          </div>
        </div>

        <div class="faq-grid">
          <div class="faq-item">
            <strong>Messages are not reaching the bot. What should I check?</strong>
            <p>Confirm the Meta callback URL, the verify token, the <code>messages</code> subscription, and that the server is publicly reachable over HTTPS. Then check the server logs.</p>
          </div>
          <div class="faq-item">
            <strong>Meta rejected the webhook verification</strong>
            <p><code>WHATSAPP_VERIFY_TOKEN</code> must match the token typed in the Meta webhook form, and <code>GET /webhook</code> must be reachable from the internet.</p>
          </div>
          <div class="faq-item">
            <strong>Why is AI parsing inconsistent for some receipts?</strong>
            <p>Low light, blur, and cropped totals reduce OCR quality. Ask users to send clear, front-facing images with visible total amount and date.</p>
          </div>
          <div class="faq-item">
            <strong>What happens if one provider quota is exhausted?</strong>
            <p>The provider fallback strategy attempts the next configured provider so requests can still be processed without manual intervention.</p>
          </div>
          <div class="faq-item">
            <strong>Why does summary not match expected totals?</strong>
            <p>Check timezone boundaries for monthly windows and verify entries were saved under the same WhatsApp number identifier.</p>
          </div>
          <div class="faq-item">
            <strong>How do we go live beyond test numbers?</strong>
            <p>Finish Meta business verification, register the display name, and publish the app. Until then, only numbers added as testers can message the bot.</p>
          </div>
        </div>
      </article>
    </section>

    <div class="footer">Credentials stay in <code>.env</code>. The dashboard never shows the access token or the app secret.</div>
  </main>

  <script>
    const buttons = document.querySelectorAll("[data-copy]");
    buttons.forEach((button) => {
      button.addEventListener("click", async () => {
        const value = button.getAttribute("data-copy");
        try {
          await navigator.clipboard.writeText(value);
          const original = button.textContent;
          button.textContent = "Copied";
          setTimeout(() => {
            button.textContent = original;
          }, 1200);
        } catch {
          button.textContent = "Copy failed";
          setTimeout(() => {
            button.textContent = "Copy";
          }, 1200);
        }
      });
    });
  </script>
</body>
</html>`;
}
