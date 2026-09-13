const mineflayer = require("mineflayer");

const HOST = "oooooij-A.aternos.me";
const PORT = 55413;
const USERNAME = "KeepAliveBot";

const bot = mineflayer.createBot({
  host: HOST,
  port: PORT,
  username: USERNAME,
  version: false,
});

bot.on("login", () => {
  console.log("Bot connected to " + HOST + ":" + PORT);
});

// קפיצה כל 15 שניות כדי למנוע כיבוי
setInterval(() => {
  if (bot.entity) {
    bot.setControlState("jump", true);
    setTimeout(() => bot.setControlState("jump", false), 500);
  }
}, 15000);

bot.on("error", (err) => {
  console.log("Error:", err.message);
});
