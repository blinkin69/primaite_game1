import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Telegraf } from "telegraf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ===== ENV =====
const BOT_TOKEN = process.env.BOT_TOKEN;                          // BotFather-Token
const GAME_SHORT_NAME = process.env.GAME_SHORT_NAME || "suncity"; // /newgame Shortname
const APP_URL = process.env.APP_URL;                              // z.B. https://<dein>.up.railway.app
const GAME_URL = process.env.GAME_URL || `${APP_URL}/`;           // was im Telegram-Game aufgeht

if (!BOT_TOKEN) throw new Error("BOT_TOKEN missing");
if (!APP_URL)   console.warn("APP_URL not set – trage deine Railway-URL als Env Var ein.");

// ===== Telegram Bot =====
const bot = new Telegraf(BOT_TOKEN);

// /play -> Game-Card
bot.command("play", (ctx) => ctx.replyWithGame(GAME_SHORT_NAME));

// Beim Klick auf „Play Game“ die URL liefern (ohne diese Antwort öffnet Telegram nichts)
bot.on("callback_query", (ctx) => {
  const q = ctx.callbackQuery;
  if (q.game_short_name === GAME_SHORT_NAME) {
    return ctx.answerCbQuery(undefined, { url: GAME_URL });
  }
  return ctx.answerCbQuery();
});

// ===== Webserver: hostet dein Game aus /public =====
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.send("OK"));

// ===== Webhook statt Polling (verhindert 409-Conflicts) =====
const webhookPath = `/telegraf/${BOT_TOKEN}`;      // „geheime“ Route
app.use(webhookPath, bot.webhookCallback(webhookPath));

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log("Web listening on", PORT);
  if (APP_URL) {
    const target = `${APP_URL}${webhookPath}`;
    try {
      await bot.telegram.setWebhook(target);
      console.log("Webhook set to:", target);
    } catch (e) {
      console.error("Failed to set webhook:", e.message);
    }
  }
});
// Wichtig: KEIN bot.launch() – wir nutzen Webhook!
