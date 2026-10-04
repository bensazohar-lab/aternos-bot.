const express = require("express");
const cors = require("cors");
const mineflayer = require("mineflayer");

const app = express();
app.use(cors());
app.use(express.json());

const bots = {};
const makeKey = (host, port) => `${host}:${port}`;

function addLog(meta, msg) {
  const time = new Date().toLocaleTimeString("he-IL");
  meta.logs.push(`[${time}] ${msg}`);
  if (meta.logs.length > 50) meta.logs.shift();
  console.log(`[${meta.key}] ${msg}`);
}

function startBot({ host, port, username }) {
  if (!host || !port) return { error: "host and port are required" };
  const key = makeKey(host, port);
  if (bots[key]) return { error: "Bot already running for this server" };

  const bot = mineflayer.createBot({
    host,
    port: parseInt(port),
    username: username || "AternosKeeper",
    auth: "offline",
    version: "1.21",
  });

  const meta = { key, host, port: parseInt(port), username: username || "AternosKeeper", status: "connecting", connectedAt: null, logs: [], bot };
  bots[key] = meta;
  addLog(meta, `Connecting to ${host}:${port}...`);

  bot.on("spawn", () => {
    meta.status = "connected";
    meta.connectedAt = Date.now();
    addLog(meta, `Bot connected to ${host}:${port}`);
    setInterval(() => {
      try {
        bot.setControlState("forward", true);
        bot.setControlState("jump", true);
        setTimeout(() => { bot.setControlState("forward", false); bot.setControlState("jump", false); }, 1500);
      } catch (e) {}
    }, 30000);
  });
  bot.on("kicked", (r) => addLog(meta, `Kicked: ${r}`));
  bot.on("error", (err) => { addLog(meta, `Error: ${err.message}`); meta.status = "error"; });
  bot.on("end", () => { addLog(meta, "Bot disconnected"); meta.status = "disconnected"; delete bots[key]; });

  return { ok: true };
}

app.post("/connect", (req, res) => {
  const result = startBot(req.body);
  if (result.error) return res.status(400).json(result);
  res.json(result);
});

app.post("/disconnect", (req, res) => {
  const key = makeKey(req.body.host, req.body.port);
  if (bots[key]) { bots[key].bot.quit(); delete bots[key]; }
  res.json({ ok: true });
});

app.get("/status", (req, res) => {
  res.json(Object.values(bots).map((b) => ({ host: b.host, port: b.port, username: b.username, status: b.status, connectedAt: b.connectedAt, logs: b.logs.slice(-20) })));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot server running on port ${PORT}`));
