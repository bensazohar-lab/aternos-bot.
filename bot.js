const mineflayer = require("mineflayer");

const HOST = "your-server.aternos.me";
const PORT = 25565;
const USERNAME = "KeepAliveBot";

function createBot() {
  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: false,
  });

  bot.on("login", () => {
    console.log("Bot connected to " + HOST + ":" + PORT);
  });

  setInterval(() => {
    if (bot.entity) {
      bot.setControlState("jump", true);
      setTimeout(() => bot.setControlState("jump", false), 500);
    }
  }, 30000);

  bot.on("end", () => {
    console.log("Disconnected. Reconnecting in 10s...");
    setTimeout(createBot, 10000);
  });

  bot.on("error", (err) => {
    console.log("Error:", err.message);
  });
}

createBot();
