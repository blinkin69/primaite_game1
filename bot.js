import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Telegraf } from "telegraf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- ENV ----
const BOT_TOKEN = process.env.BOT_TOKEN;                   // von BotFather
const GAME_SHORT_NAME = process.env.GAME_SHORT_NAME || "suncity";
const GAME_URL = process.env.GAME_URL || "https://<DEINE-RAILWAY-URL>/"; // ABSOLUTE URL!

if (!BOT_TOKEN) throw new Error("BOT_TOKEN missing");

// ---- Telegram Bot ----
const bot = new Telegraf(BOT_TOKEN);

// /play zeigt die Game-Card (oder nutze Inline: @deinbot suncity)
bot.command("play", (ctx) => ctx.replyWithGame(GAME_SHORT_NAME));

// Klick auf „Play Game“ -> öffne deine WebApp-URL (Railway)
bot.on("callback_query", (ctx) => {
  const q = ctx.callbackQuery;
  if (q.game_short_name === GAME_SHORT_NAME) {
    return ctx.answerCbQuery(undefined, { url: GAME_URL });
  }
  return ctx.answerCbQuery();
});

bot.launch();
console.log("Bot launched");

// ---- Webserver: hostet dein Spiel unter / (public/index.html) ----
const app = express();
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => res.send("OK"));
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log("Web listening on", PORT));
