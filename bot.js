
   const express = require("express");
const cors = require("cors");
const mineflayer = require("mineflayer");

const app = express();
app.use(cors());
app.use(express.json());

const bots = {}; // key: "host:port" -> { bot, status, logs, ... }

function makeKey(host, port) {
  return `${host}:${port}`;
}

function addLog(meta, msg) {
  const time = new Date().toLocaleTimeString("he-IL");
  meta.logs.push(`[${time}] ${msg}`);
  if (meta.logs.length > 50) meta.logs.shift();
  console.log(`[${meta.key}] ${msg}`);
}

function startBot(host, port, username) {
  const key = makeKey(host, port);
  if (bots[key]) return { error: "Bot already running for this server" };

  const bot = mineflayer.createBot({
    host,
    port: parseInt(port),
    username: username || "AternosKeeper",
    auth: "offline",
    version: false, // auto-detect server version
  });

  const meta = {
    key,
    host,
    port,
    username: username || "AternosKeeper",
    status: "connecting",
    connectedAt: null,
    logs: [],
    bot,
  };
  bots[key] = meta;

  bot.on("spawn", () => {
    meta.status = "connected";
    meta.connectedAt = Date.now();
    addLog(meta, `Bot connected to ${host}:${port}`);

    // AFK prevention — walk + jump every 30 seconds
    setInterval(() => {
      try {
        bot.setControlState("forward", true);
        bot.setControlState("jump", true);
        setTimeout(() => {
          bot.setControlState("forward", false);
          bot.setControlState("jump", false);
        }, 1500);
      } catch (e) {}
    }, 30000);
  });

  bot.on("kicked", (reason) => addLog(meta, `Kicked: ${reason}`));
  bot.on("error", (err) => {
    addLog(meta, `Error: ${err.message}`);
    meta.status = "error";
  });
  bot.on("end", () => {
    addLog(meta, "Bot disconnected");
    meta.status = "disconnected";
    delete bots[key];
  });

  return { ok: true };
}

app.post("/connect", (req, res) => {
  const { host, port, username } = req.body;
  if (!host || !port) return res.status(400).json({ error: "host and port required" });
  const result = startBot(host, port, username);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/disconnect", (req, res) => {
  const { host, port } = req.body;
  const key = makeKey(host, port);
  if (bots[key]) {
    bots[key].bot.quit();
    delete bots[key];
  }
  res.json({ ok: true });
});

app.get("/status", (req, res) => {
  res.json(
    Object.values(bots).map((b) => ({
      host: b.host,
      port: b.port,
      username: b.username,
      status: b.status,
      connectedAt: b.connectedAt,
      logs: b.logs.slice(-20),
    }))
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot server running on port ${PORT}`));
