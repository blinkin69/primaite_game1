const express = require("express");
const path = require("path");
const { Telegraf } = require("telegraf");

// ===== ENV =====
const BOT_TOKEN = process.env.BOT_TOKEN;                    // BotFather Token
const GAME_SHORT_NAME = process.env.GAME_SHORT_NAME || "suncity";
const APP_URL = process.env.APP_URL;                        // z.B. https://<dein>.up.railway.app
const GAME_URL = process.env.GAME_URL || (APP_URL ? `${APP_URL}/` : undefined);

if (!BOT_TOKEN) throw new Error("BOT_TOKEN missing");
if (!APP_URL) console.warn("APP_URL not set – setze deine Railway-URL in den Variables, z. B. https://<app>.up.railway.app");

// ===== Telegram Bot =====
const bot = new Telegraf(BOT_TOKEN);

// Globales Logging (hilft beim Debuggen)
bot.use(async (ctx, next) => {
  try {
    console.log("update:", JSON.stringify(ctx.update));
  } catch {}
  return next();
});
bot.catch((err) => console.error("BOT ERROR:", err));

// /ping → schneller Test ob der Webhook Updates liefert
bot.command("ping", (ctx) => ctx.reply("pong ✅"));

// /open → öffnet deine Seite über WebApp-Button (Bypass des Game-Flows)
bot.command("open", (ctx) => {
  const url = GAME_URL || `${APP_URL}/`;
  return ctx.reply("Open WebApp:", {
    reply_markup: {
      inline_keyboard: [[ { text: "Open", web_app: { url } } ]]
    }
  });
});

// /play → zeigt die Game-Card (Shortname muss zu deinem /newgame passen)
bot.command("play", async (ctx) => {
  try {
    await ctx.replyWithGame(GAME_SHORT_NAME);
  } catch (e) {
    console.error("replyWithGame error:", e);
    await ctx.reply("❌ Game short name unknown. Check GAME_SHORT_NAME and BotFather /newgame.");
  }
});

// „Play Game“ geklickt → IMMER URL öffnen (zum Debuggen)
bot.on("callback_query", async (ctx) => {
  try {
    console.log("callback_query:", JSON.stringify(ctx.callbackQuery));
    const url = GAME_URL || `${APP_URL}/`;
    await ctx.answerCbQuery(undefined, { url });
  } catch (e) {
    console.error("answerCbQuery error:", e);
  }
});

// ===== Express hostet dein Spiel (./public) =====
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/health", (_req, res) => res.send("OK"));

// ===== Webhook statt Polling (verhindert 409-Conflicts) =====
const webhookPath = `/telegraf/${BOT_TOKEN}`; // „geheime“ Route
app.use(webhookPath, bot.webhookCallback(webhookPath));

const PORT = process.env.PORT || 8080;
app.listen(PORT, async () => {
  console.log("Web listening on", PORT);
  if (APP_URL) {
    const target = `${APP_URL}${webhookPath}`;
    try {
      const ok = await bot.telegram.setWebhook(target);
      console.log("Webhook set:", ok, "→", target);
    } catch (e) {
      console.error("Failed to set webhook:", e.message);
    }
  }
});

// Hinweis: KEIN bot.launch() – wir nutzen Webhook!
