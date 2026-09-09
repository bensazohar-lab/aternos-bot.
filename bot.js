const mineflayer = require("mineflayer");

const SERVERS = [
  { host: "oooooij-A.aternos.me", port:55413, username: "KeepAliveBot1" },
];

SERVERS.forEach((server) => {
  const bot = mineflayer.createBot({
    host: server.host,
    port: server.port,
    username: server.username,
    version: false,
  });

  bot.on("login", () => {
    console.log(server.username + " connected — chunk loaded at " + server.host);
  });

  // תנועה קלה כל 10 שניות — שומר על הצ'אנק טעון ומונע כיבוי
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

  bot.on("error", (err) => console.log(server.username + " error: " + err.message));
  bot.on("end", () => console.log(server.username + " disconnected"));
