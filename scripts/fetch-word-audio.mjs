import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import http from "node:http";
import https from "node:https";

const require = createRequire(import.meta.url);
global.window = global;
require("../data/levels.js");

const audioDir = resolve("assets/audio/words");
const sourcePath = resolve("data/audio-sources.json");
const ultimatePath = process.env.PRONUNCIATION_ULTIMATE_JSON || "/tmp/english-audio-repo/ultimate.json";
const wordAudioDir = process.env.WORD_AUDIO_DIR || "/tmp/wordaudio-repo/Audio";
const previousSources = existsSync(sourcePath) ? JSON.parse(readFileSync(sourcePath, "utf8")) : {};

mkdirSync(audioDir, { recursive: true });

const words = [...new Set(Object.values(global.LISTEN_PICK_SCENES).map((scene) => scene.word).filter(Boolean))]
  .map((word) => word.toLowerCase())
  .sort();

const ultimate = existsSync(ultimatePath) ? JSON.parse(readFileSync(ultimatePath, "utf8")) : {};
const sources = {};

function scoreUrl(word, url) {
  const lower = url.toLowerCase();
  let score = 0;
  if (lower.includes(`/${word}.mp3`)) score += 100;
  if (lower.includes(`${word}-american-english-pronunciation`)) score += 95;
  if (lower.includes(`${word}-british-english-pronunciation`)) score += 82;
  if (lower.includes(`/${word}/${word}.mp3`)) score += 92;
  if (lower.includes(`/${word}__/`)) score += 88;
  if (lower.includes(`/${word}_/`)) score += 78;
  if (lower.includes(`/${word}.`)) score += 75;
  if (lower.includes("cambridge.org") && lower.includes("us_pron")) score += 35;
  if (lower.includes("onelook.com") && lower.includes("american")) score += 30;
  if (lower.includes("yourdictionary.com")) score += 25;
  if (lower.includes("oxforddictionaries.com")) score += 18;
  if (lower.includes("vocabulary.com")) score += 15;
  if (lower.includes("static.sfdict.com")) score += 12;
  if (lower.includes("uk_pron") && !lower.includes(word)) score -= 35;
  if (!lower.includes(word)) score -= 60;
  return score;
}

function pickUrls(word) {
  const urls = ultimate[word] || [];
  return urls
    .map((url) => ({ url, score: scoreUrl(word, url) }))
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.url);
}

function download(url, output, redirects = 0) {
  return new Promise((resolvePromise, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const request = client.get(url, { headers: { "User-Agent": "qimeng-audio-fetcher/0.1" } }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 4) {
        res.resume();
        const nextUrl = new URL(res.headers.location, url).toString();
        download(nextUrl, output, redirects + 1).then(resolvePromise, reject);
        return;
      }

      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const body = Buffer.concat(chunks);
        if (body.length < 1000) {
          reject(new Error(`too small: ${body.length}`));
          return;
        }
        writeFileSync(output, body);
        resolvePromise({ bytes: body.length, url });
      });
    });

    request.on("error", reject);
    request.setTimeout(15000, () => request.destroy(new Error("timeout")));
  });
}

for (const word of words) {
  const output = resolve(audioDir, `${word}.mp3`);
  if (existsSync(output)) {
    sources[word] = previousSources[word] || { file: `assets/audio/words/${word}.mp3`, source: "existing" };
    continue;
  }

  const urls = pickUrls(word);
  for (const url of urls) {
    try {
      const result = await download(url, output);
      sources[word] = { file: `assets/audio/words/${word}.mp3`, source: url, bytes: result.bytes };
      console.log(`[audio] ${word} <- ${url}`);
      break;
    } catch (error) {
      console.warn(`[audio] ${word} failed: ${error.message} ${url}`);
    }
  }

  if (sources[word]?.file) continue;

  const local = resolve(wordAudioDir, `${word}.mp3`);
  if (existsSync(local)) {
    copyFileSync(local, output);
    sources[word] = {
      file: `assets/audio/words/${word}.mp3`,
      source: `https://github.com/mrcraked/WordAudio/blob/main/Audio/${encodeURIComponent(basename(local))}`
    };
    console.log(`[audio] ${word} <- WordAudio`);
    continue;
  }

  sources[word] = { file: null, source: null, missing: true };
  console.warn(`[audio] missing: ${word}`);
}

writeFileSync(sourcePath, `${JSON.stringify(sources, null, 2)}\n`);
console.log(`[audio] done. words=${words.length} manifest=${sourcePath}`);
