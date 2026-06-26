import { mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
global.window = global;
require("../data/levels.js");

const levelId = Number(process.env.LEVEL_ID || process.argv.find((arg) => arg.startsWith("--level="))?.split("=")[1] || 1);
const voice = process.env.VOICE || "Samantha";
const rate = String(process.env.RATE || 105);
const tempo = String(process.env.TEMPO || 0.72);
const outputDir = `assets/audio/sentences/level-${levelId}`;
const level = global.LISTEN_PICK_LEVELS.find((item) => item.id === levelId);

if (!level) {
  console.error(`[audio] level not found: ${levelId}`);
  process.exit(1);
}

mkdirSync(outputDir, { recursive: true });

for (let index = 0; index < level.items.length; index += 1) {
  const sentence = level.items[index][0];
  const itemId = String(index + 1).padStart(2, "0");
  const aiff = `/tmp/qimeng-level-${levelId}-${itemId}.aiff`;
  const mp3 = `${outputDir}/${itemId}.mp3`;

  console.log(`[audio] level=${levelId} item=${itemId} voice=${voice} rate=${rate} tempo=${tempo}: ${sentence}`);
  let result = spawnSync("say", ["-v", voice, "-r", rate, "-o", aiff, sentence], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);

  result = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", aiff, "-af", `atempo=${tempo},loudnorm=I=-18:TP=-2:LRA=7`, "-codec:a", "libmp3lame", "-q:a", "2", mp3],
    { stdio: "inherit" }
  );
  rmSync(aiff, { force: true });
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log(`[audio] done. level=${levelId} count=${level.items.length}`);
