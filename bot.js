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

// תנועה כל 10 שניות — הליכה + קפיצה כדי למנוע כיבוי
setInterval(() => {
  if (bot.entity) {
    bot.setControlState("forward", true);
    bot.setControlState("jump", true);
    setTimeout(() => {
      bot.setControlState("forward", false);
      bot.setControlState("jump", false);
    }, 1000);
  }
}, 10000);

bot.on("error", (err) => {
  console.log("Error:", err.message);
});
