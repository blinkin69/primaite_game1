import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Telegraf } from "telegraf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- ENV ----
const BOT_TOKEN = process.env.BOT_TOKEN;                   // BotFather Token
const GAME_SHORT_NAME = process.env.GAME_SHORT_NAME || "suncity";
const APP_URL = process.env.APP_URL;                       // z.B. https://<dein>.up.railway.app
const GAME_URL = `${APP_URL}/`;                            // immer deine Railway-URL
const USE_POLLING = process.env.USE_POLLING === "true";    // optional: Polling erzwingen

if (!BOT_TOKEN) throw new Error("BOT_TOKEN missing");
if (!APP_URL)   console.warn("APP_URL not set – setze deine Railway-URL in Variables.");

// ---- Telegram Bot ----
const bot = new Telegraf(BOT_TOKEN);

// /play zeigt die Game-Card (oder nutze Inline: @deinbot suncity)
bot.command("play", (ctx) => ctx.replyWithGame(GAME_SHORT_NAME));

// Klick auf „Play Game“ -> öffne deine WebApp-URL (Railway)
bot.on("callback_query", (ctx) => {
  const q = ctx.callbackQuery;
  if (q?.game_short_name === GAME_SHORT_NAME) {
    return ctx.answerCbQuery(undefined, { url: GAME_URL });
  }
  return ctx.answerCbQuery();
});

// (optional nützlich) minimale Tests
bot.command("start", (ctx) => ctx.reply("Welcome to SunCity 🌞 Type /play"));
bot.command("ping", (ctx) => ctx.reply("pong ✅"));

// ---- Webserver: hostet dein Spiel unter / (public/index.html) ----
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.send("OK"));

// ---- Start (Webhook als Default; Polling optional) ----
const PORT = process.env.PORT || 8080;

if (USE_POLLING) {
  // ⚠️ Nur EINE Instanz betreiben, sonst 409-Conflict
  app.listen(PORT, () => console.log("Web listening on", PORT));
  bot.launch().then(() => console.log("Bot launched (polling)"));
} else {
  // Webhook (empfohlen, kein 409)
  const webhookPath = `/telegraf/${BOT_TOKEN}`;
  app.use(webhookPath, bot.webhookCallback(webhookPath));
  app.listen(PORT, async () => {
    console.log("Web listening on", PORT);
    try {
      const target = `${APP_URL}${webhookPath}`;
      await bot.telegram.setWebhook(target);
      console.log("Webhook set:", true, "→", target);
    } catch (e) {
      console.error("Failed to set webhook:", e.message);
    }
  });
}

// Hinweis: bei Webhook KEIN bot.launch() aufrufen.
