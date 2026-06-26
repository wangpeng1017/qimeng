import { mkdirSync, readdirSync, statSync } from "node:fs";
import { join, parse } from "node:path";
import { spawnSync } from "node:child_process";

const inputDir = process.env.IMAGE_INPUT_DIR || "assets/illustrations";
const outputDir = process.env.IMAGE_OUTPUT_DIR || "assets/illustrations-webp";
const size = process.env.IMAGE_OPTIMIZE_SIZE || "768x768";
const quality = process.env.IMAGE_OPTIMIZE_QUALITY || "82";

mkdirSync(outputDir, { recursive: true });

const files = readdirSync(inputDir)
  .filter((file) => file.toLowerCase().endsWith(".png"))
  .sort();

let originalBytes = 0;
let optimizedBytes = 0;

for (const file of files) {
  const input = join(inputDir, file);
  const output = join(outputDir, `${parse(file).name}.webp`);

  console.log(`[image-optimize] ${input} -> ${output}`);
  const result = spawnSync(
    "magick",
    [input, "-resize", `${size}>`, "-strip", "-define", "webp:method=6", "-quality", quality, output],
    { stdio: "inherit" }
  );

  if (result.status !== 0) process.exit(result.status || 1);

  originalBytes += statSync(input).size;
  optimizedBytes += statSync(output).size;
}

const ratio = originalBytes ? Math.round((optimizedBytes / originalBytes) * 1000) / 10 : 0;
console.log(`[image-optimize] done. files=${files.length} original=${originalBytes} optimized=${optimizedBytes} ratio=${ratio}%`);
