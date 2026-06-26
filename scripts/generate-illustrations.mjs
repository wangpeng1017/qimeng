import { mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
global.window = global;
require("../data/levels.js");

const genScript = `${process.env.HOME}/.claude/skills/image-gen/gen.py`;
const size = process.env.IMAGE_SIZE || "1024x1024";
const limitArg = process.argv.find((arg) => arg.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;

const scenes = Object.values(global.LISTEN_PICK_SCENES)
  .filter((scene) => scene.image && scene.prompt)
  .sort((a, b) => a.id.localeCompare(b.id));

let skipped = 0;
const retries = Number(process.env.IMAGE_RETRIES || 3);
const jobs = Number(process.env.IMAGE_JOBS || 1);

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function run(command, args) {
  return new Promise((resolveRun) => {
    const child = spawn(command, args, { stdio: "inherit" });
    child.on("close", (code) => resolveRun(code || 0));
    child.on("error", () => resolveRun(1));
  });
}

const queue = [];

for (const scene of scenes) {
  const output = resolve(scene.image);
  mkdirSync(dirname(output), { recursive: true });

  if (existsSync(output)) {
    skipped += 1;
    continue;
  }

  if (queue.length >= limit) break;

  queue.push({ scene, output });
}

let cursor = 0;
let generated = 0;
const failed = [];

async function worker(workerId) {
  while (cursor < queue.length) {
    const item = queue[cursor];
    cursor += 1;
    const { scene, output } = item;
  let ok = false;
  for (let attempt = 1; attempt <= retries; attempt += 1) {
      console.log(`[image:${workerId}] ${scene.id} -> ${scene.image} attempt=${attempt}/${retries}`);
      const code = await run("python3", [genScript, scene.prompt, output, size]);

      if (code === 0 && existsSync(output)) {
      ok = true;
      break;
    }

    console.warn(`[image] retrying after failure: ${scene.id}`);
    await sleep(4000);
  }

  if (!ok) {
    console.error(`[image] failed after retries: ${scene.id}`);
      failed.push(scene.id);
      continue;
  }

  generated += 1;
  await sleep(1200);
  }
}

await Promise.all(Array.from({ length: Math.max(1, jobs) }, (_, index) => worker(index + 1)));

console.log(`[image] done. generated=${generated} skipped=${skipped} failed=${failed.length} total=${scenes.length}`);
if (failed.length) {
  console.error(`[image] failed scenes: ${failed.join(", ")}`);
  process.exit(1);
}
