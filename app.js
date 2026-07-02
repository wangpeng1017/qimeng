const app = document.querySelector("#app");
const levels = window.LISTEN_PICK_LEVELS;
const scenes = window.LISTEN_PICK_SCENES;

const state = {
  screen: "home",
  levelId: 1,
  items: [],
  index: 0,
  attempts: {},
  misses: [],
  locked: false,
  startedAt: 0,
  responseTimes: [],
  audio: null,
  showChinese: getStoredFlag("listenPick:showChinese"),
  showEnglish: getStoredFlag("listenPick:showEnglish")
};

const synth = window.speechSynthesis;
const assetVersion = "20260702-caption-toggle";

function normalizeItems(level) {
  return level.items.map(([sentence, skillTag, answerId, distractorId], index) => ({
    id: `${level.id}-${index + 1}`,
    sentence,
    skillTag,
    audio: `audio/sentences/level-${level.id}/${String(index + 1).padStart(2, "0")}?v=${assetVersion}`,
    answerId,
    choices: shuffle([
      { id: answerId, scene: scenes[answerId] },
      { id: distractorId, scene: scenes[distractorId] }
    ])
  }));
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function currentLevel() {
  return levels.find((level) => level.id === state.levelId) || levels[0];
}

function currentItems() {
  if (state.items.length) return state.items;
  return normalizeItems(currentLevel());
}

function currentItem() {
  return currentItems()[state.index];
}

function levelHeroScene(level) {
  const firstAnswer = level.items?.[0]?.[2];
  return scenes[firstAnswer] || scenes.girl;
}

function setScreen(screen) {
  state.screen = screen;
  render();
}

function toggleCaption(type) {
  if (type === "zh") state.showChinese = !state.showChinese;
  if (type === "en") state.showEnglish = !state.showEnglish;
  setStoredFlag("listenPick:showChinese", state.showChinese);
  setStoredFlag("listenPick:showEnglish", state.showEnglish);
  render();
}

function getStoredFlag(key) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function setStoredFlag(key, value) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    // localStorage can be unavailable in private or embedded browsers.
  }
}

function speak(text, rate = 0.86) {
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = rate;
  utterance.pitch = 1.05;
  synth.speak(utterance);
}

function stopAudio() {
  if (state.audio) {
    state.audio.pause();
    state.audio = null;
  }
  if (synth) synth.cancel();
}

function startLevel(levelId) {
  stopAudio();
  state.levelId = levelId;
  state.items = normalizeItems(currentLevel());
  state.index = 0;
  state.attempts = {};
  state.misses = [];
  state.locked = false;
  state.responseTimes = [];
  history.replaceState(null, "", `?level=${levelId}`);
  setScreen("play");
  window.setTimeout(() => playCurrent(), 280);
}

function playCurrent(rate) {
  const item = currentItem();
  state.startedAt = performance.now();
  stopAudio();
  const audio = new Audio(item.audio);
  state.audio = audio;
  audio.playbackRate = rate && rate < 0.8 ? 0.82 : 1;
  audio.play().catch(() => speak(item.sentence, rate || 0.86));
  audio.addEventListener("error", () => speak(item.sentence, rate || 0.86), { once: true });
}

function choose(choiceId) {
  if (state.locked) return;
  const item = currentItem();
  const key = item.id;
  state.attempts[key] = (state.attempts[key] || 0) + 1;

  if (choiceId === item.answerId) {
    state.locked = true;
    state.responseTimes.push(Math.round(performance.now() - state.startedAt));
    markChoice(choiceId, "correct");

    window.setTimeout(() => {
      if (state.index >= currentItems().length - 1) {
        setScreen("finish");
      } else {
        state.index += 1;
        state.locked = false;
        render();
        window.setTimeout(() => playCurrent(), 240);
      }
    }, 620);
    return;
  }

  state.misses.push({ itemId: item.id, skillTag: item.skillTag, sentence: item.sentence });
  markChoice(choiceId, "wrong");
  const missesForItem = state.attempts[key];
  window.setTimeout(() => playCurrent(missesForItem >= 2 ? 0.68 : 0.82), 420);
}

function markChoice(choiceId, status) {
  const button = document.querySelector(`[data-choice="${choiceId}"]`);
  if (!button) return;
  button.classList.remove("is-wrong", "is-correct");
  button.classList.add(status === "correct" ? "is-correct" : "is-wrong");
}

function exitToHome() {
  stopAudio();
  state.items = [];
  history.replaceState(null, "", location.pathname);
  setScreen("home");
}

function render() {
  if (state.screen === "home") renderHome();
  if (state.screen === "play") renderPlay();
  if (state.screen === "finish") renderFinish();
}

function renderHome() {
  const completed = Number(localStorage.getItem("listenPick:lastLevel") || "1");
  app.className = "app-shell home-shell";
  app.innerHTML = `
    <section class="hero-panel">
      <div class="brand-row">
        <span class="brand-mark" aria-hidden="true">LP</span>
        <span>Listen & Pick</span>
      </div>
    </section>

    <section class="level-panel" aria-label="关卡选择">
      <div class="panel-heading">
        <div>
          <h2>前 100 关路径</h2>
        </div>
        <strong>当前 Level ${completed}</strong>
      </div>

      <div class="band-tabs" role="list">
        <button class="band-tab is-active" type="button">Level 1-25</button>
        <button class="band-tab" type="button" disabled>Level 26-50</button>
        <button class="band-tab" type="button" disabled>Level 51-75</button>
        <button class="band-tab" type="button" disabled>Level 76-100</button>
      </div>

      <div class="level-grid">
        ${levels
          .map(
            (level) => `
              <article class="level-card">
                <button class="level-picture" type="button" aria-label="开始 Level ${level.id}: ${level.title}" onclick="startLevel(${level.id})">
                  ${renderScene(levelHeroScene(level))}
                </button>
                <div class="level-card-body">
                  <div>
                    <span class="level-number">Level ${level.id}</span>
                    <h3>${level.title}</h3>
                  </div>
                  <button class="primary-action" type="button" onclick="startLevel(${level.id})">
                    开始
                  </button>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderPlay() {
  const level = currentLevel();
  const item = currentItem();
  const total = currentItems().length;
  const progress = Math.round(((state.index + 1) / total) * 100);
  app.className = "app-shell play-shell";
  app.innerHTML = `
    <section class="play-topbar">
      <button class="quiet-exit" type="button" aria-label="返回关卡" title="返回关卡" onclick="exitToHome()">
        ${iconBack()}
      </button>
      <div class="compact-level">Level ${level.id}</div>
      <div class="progress-wrap" aria-label="第 ${state.index + 1} 题，共 ${total} 题">
        <span>${state.index + 1} / ${total}</span>
        <div class="progress-track"><i style="width:${progress}%"></i></div>
      </div>
      <div class="caption-toggles" aria-label="文字显示开关">
        <button class="label-toggle ${state.showChinese ? "is-active" : ""}" type="button" aria-pressed="${state.showChinese}" title="显示汉语" onclick="toggleCaption('zh')">中文</button>
        <button class="label-toggle ${state.showEnglish ? "is-active" : ""}" type="button" aria-pressed="${state.showEnglish}" title="显示英语" onclick="toggleCaption('en')">EN</button>
      </div>
    </section>

    <section class="listen-area">
      <button class="audio-button" type="button" aria-label="播放英文短句" onclick="playCurrent()">
        ${iconSpeaker()}
      </button>
    </section>

    <section class="choice-grid" aria-label="图片选项">
      ${item.choices
        .map(
          (choice) => `
            <button class="picture-choice" type="button" data-choice="${choice.id}" onclick="choose('${choice.id}')">
              ${renderScene(choice.scene)}
              ${renderChoiceCaption(choice)}
            </button>
          `
        )
        .join("")}
    </section>
  `;
}

function renderFinish() {
  const total = currentItems().length;
  const missedCount = state.misses.length;
  const firstTryCorrect = total - new Set(state.misses.map((miss) => miss.itemId)).size;
  const weakTags = Object.entries(
    state.misses.reduce((acc, miss) => {
      acc[miss.skillTag] = (acc[miss.skillTag] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]);
  const averageTime = state.responseTimes.length
    ? Math.round(state.responseTimes.reduce((sum, time) => sum + time, 0) / state.responseTimes.length / 100) / 10
    : 0;

  localStorage.setItem("listenPick:lastLevel", String(state.levelId));

  app.className = "app-shell finish-shell";
  app.innerHTML = `
    <section class="finish-panel">
      <span class="done-mark" aria-hidden="true">${iconCheck()}</span>
      <h1>完成 Level ${state.levelId}</h1>
      <p>儿童端到这里就可以结束。下面这些数据给家长看，用来决定是否复习。</p>

      <div class="result-grid">
        <div><strong>${firstTryCorrect}/${total}</strong><span>首次答对</span></div>
        <div><strong>${missedCount}</strong><span>总错误次数</span></div>
        <div><strong>${averageTime}s</strong><span>平均反应</span></div>
      </div>

      <div class="review-box">
        <h2>易错类型</h2>
        ${
          weakTags.length
            ? weakTags.map(([tag, count]) => `<span>${tag} · ${count}</span>`).join("")
            : "<span>本关没有明显易错项</span>"
        }
      </div>

      <div class="finish-actions">
        <button class="secondary-action" type="button" onclick="startLevel(${state.levelId})">再练一次</button>
        <button class="primary-action" type="button" onclick="exitToHome()">回到关卡</button>
      </div>
    </section>
  `;
}

const zhWordMap = {
  girl: "女孩",
  boy: "男孩",
  baby: "宝宝",
  mom: "妈妈",
  dad: "爸爸",
  cat: "猫",
  dog: "狗",
  bird: "鸟",
  fish: "鱼",
  rabbit: "兔子",
  ball: "球",
  book: "书",
  bag: "书包",
  cup: "杯子",
  toy: "玩具",
  car: "小车",
  flower: "花",
  hand: "手",
  head: "头",
  eyes: "眼睛",
  eye: "眼睛",
  hat: "帽子",
  shoes: "鞋子",
  shoe: "鞋子",
  shirt: "上衣",
  bed: "床",
  chair: "椅子",
  table: "桌子",
  door: "门",
  window: "窗户",
  lamp: "台灯",
  apple: "苹果",
  banana: "香蕉",
  milk: "牛奶",
  water: "水",
  egg: "鸡蛋",
  bread: "面包",
  house: "房子",
  school: "学校",
  park: "公园",
  tree: "树",
  sun: "太阳",
  moon: "月亮",
  rocket: "火箭",
  planet: "星球",
  star: "星星",
  helmet: "头盔",
  flag: "旗子",
  astronaut: "太空小朋友"
};

const zhPhraseMap = {
  "girl shows hand": "女孩伸出手",
  "boy touches head": "男孩摸头",
  "girl head": "女孩摸头",
  "boy head": "男孩摸头",
  "bird in tree": "鸟在树上",
  "fish in bowl": "鱼在碗里",
  "rabbit with carrot": "兔子和胡萝卜"
};

const zhColorMap = {
  red: "红色",
  blue: "蓝色",
  yellow: "黄色",
  green: "绿色",
  white: "白色"
};

const zhNumberMap = {
  one: "一个",
  two: "两个",
  three: "三个",
  four: "四个",
  five: "五个"
};

const zhAdjectiveMap = {
  big: "大",
  small: "小",
  happy: "开心",
  sad: "难过",
  sleeping: "睡觉",
  running: "跑步",
  jumping: "跳跃"
};

const zhVerbMap = {
  runs: "跑步",
  jumps: "跳跃",
  sleeps: "睡觉",
  reads: "读书",
  eats: "吃",
  drinks: "喝"
};

const sceneZhLabels = {
  "space-red-rocket": "红色火箭",
  "space-blue-rocket": "蓝色火箭",
  "space-yellow-star": "黄色星星",
  "space-blue-star": "蓝色星星",
  "space-white-star": "白色星星",
  "space-red-planet": "红色星球",
  "space-blue-planet": "蓝色星球",
  "space-green-planet": "绿色星球",
  "space-yellow-planet": "黄色星球",
  "space-red-helmet": "红色头盔",
  "space-blue-helmet": "蓝色头盔",
  "space-red-flag": "红色旗子",
  "space-green-flag": "绿色旗子",
  "space-white-moon": "白色月亮",
  "space-yellow-moon": "黄色月亮",
  "space-boy-runs": "男孩跑步",
  "space-boy-jumps": "男孩跳跃",
  "space-girl-runs": "女孩跑步",
  "space-girl-jumps": "女孩跳跃",
  "space-boy-sits": "男孩坐下",
  "space-boy-stands": "男孩站着",
  "space-girl-sits": "女孩坐下",
  "space-girl-stands": "女孩站着",
  "space-boy-waves": "男孩挥手",
  "space-girl-waves": "女孩挥手",
  "space-boy-reads": "男孩读书",
  "space-girl-reads": "女孩读书",
  "space-boy-eats": "男孩吃东西",
  "space-boy-drinks": "男孩喝水",
  "space-girl-eats": "女孩吃东西",
  "space-girl-drinks": "女孩喝水",
  "space-boy-sleeps": "男孩睡觉",
  "space-girl-sleeps": "女孩睡觉",
  "space-rocket-on-table": "火箭在桌子上",
  "space-rocket-under-table": "火箭在桌子下",
  "space-star-on-table": "星星在桌子上",
  "space-star-under-table": "星星在桌子下",
  "space-helmet-on-chair": "头盔在椅子上",
  "space-helmet-under-chair": "头盔在椅子下",
  "space-boy-in-rocket": "男孩在火箭里",
  "space-boy-by-rocket": "男孩在火箭旁",
  "space-girl-in-rocket": "女孩在火箭里",
  "space-girl-by-rocket": "女孩在火箭旁",
  "space-moon-in-window": "月亮在窗户里",
  "space-star-in-window": "星星在窗户里",
  "space-planet-by-rocket": "星球在火箭旁",
  "space-flag-by-rocket": "旗子在火箭旁",
  "space-flag-on-moon": "旗子在月亮上"
};

function renderChoiceCaption(choice) {
  if (!state.showChinese && !state.showEnglish) return "";
  const lines = [];
  if (state.showEnglish) lines.push(`<span lang="en">${escapeHtml(choiceEnglishLabel(choice.scene))}</span>`);
  if (state.showChinese) lines.push(`<span lang="zh-CN">${escapeHtml(choiceChineseLabel(choice.scene))}</span>`);
  return `<div class="choice-caption">${lines.join("")}</div>`;
}

function choiceEnglishLabel(scene) {
  return scene?.label || scene?.word || "";
}

function choiceChineseLabel(scene) {
  if (!scene) return "";
  if (sceneZhLabels[scene.id]) return sceneZhLabels[scene.id];
  return translateLabel(scene.label || scene.word || "");
}

function translateLabel(label) {
  const key = String(label || "").toLowerCase().trim();
  if (zhPhraseMap[key]) return zhPhraseMap[key];

  let match = key.match(/^(one|two|three|four|five) (.+)$/);
  if (match) return `${zhNumberMap[match[1]]}${translateNoun(match[2])}`;

  match = key.match(/^(red|blue|yellow|green|white) (.+)$/);
  if (match) return `${zhColorMap[match[1]]}${translateNoun(match[2])}`;

  match = key.match(/^(.+) with (.+)$/);
  if (match) return `${translateNoun(match[1])}和${translateNoun(match[2])}`;

  match = key.match(/^(.+) on (.+)$/);
  if (match) return `${translateNoun(match[1])}在${translateNoun(match[2])}上`;

  match = key.match(/^(.+) under (.+)$/);
  if (match) return `${translateNoun(match[1])}在${translateNoun(match[2])}下`;

  match = key.match(/^(.+) in (.+)$/);
  if (match) return `${translateNoun(match[1])}在${translateNoun(match[2])}里`;

  match = key.match(/^(.+) by (.+)$/);
  if (match) return `${translateNoun(match[1])}在${translateNoun(match[2])}旁边`;

  match = key.match(/^(.+) at (.+)$/);
  if (match) return `${translateNoun(match[1])}在${translateNoun(match[2])}旁`;

  match = key.match(/^(.+) (runs|jumps|sleeps|reads)$/);
  if (match) return `${translateNoun(match[1])}${zhVerbMap[match[2]]}`;

  match = key.match(/^(.+) (eats|drinks) (.+)$/);
  if (match) return `${translateNoun(match[1])}${zhVerbMap[match[2]]}${translateNoun(match[3])}`;

  match = key.match(/^(happy|sad|sleeping|running|jumping) (.+)$/);
  if (match) return `${zhAdjectiveMap[match[1]]}的${translateNoun(match[2])}`;

  return key
    .split(/\s+/)
    .map((part) => zhWordMap[part] || part)
    .join("");
}

function translateNoun(text) {
  const key = String(text || "").toLowerCase().trim().replace(/s$/, "");
  return zhPhraseMap[key] || zhWordMap[key] || key;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderScene(scene) {
  if (!scene) return "";
  if (scene.image) {
    return `
      <div class="image-scene">
        <picture>
          <source srcset="${scene.image}" type="image/webp" />
          <img src="${scene.fallbackImage || scene.image}" alt="${scene.label || scene.word || "illustration"}" onerror="this.closest('.image-scene').classList.add('is-missing')" />
        </picture>
        <div class="fallback-scene">${renderScene({ ...scene, image: "" })}</div>
      </div>
    `;
  }
  if (scene.type === "object") return objectScene(scene);
  if (scene.type === "action") return personScene({ ...scene, mood: "happy", prop: scene.action });
  if (scene.type === "sleep") return sleepScene(scene);
  if (scene.type === "animal") return animalScene(scene);
  return personScene(scene);
}

function personScene(scene) {
  const hair = scene.character === "boy" ? "#5b341c" : scene.character === "baby" ? "#8a5a2b" : "#6b3d25";
  const hairShape =
    scene.character === "girl"
      ? `<path d="M160 142c-36 14-64 57-52 107 14 57 107 66 137 11 21-38 8-101-30-117-17-7-37-8-55-1z" fill="${hair}"/>`
      : `<path d="M132 138c33-36 106-25 121 27 8 27-3 52-17 68H125c-20-28-17-71 7-95z" fill="${hair}"/>`;
  const mouth = scene.mood === "sad" ? "M165 246c18-14 39-14 58 0" : "M166 235c17 22 41 22 58 0";
  const prop = renderProp(scene.prop, scene.propColor);

  return `
    <svg class="scene-svg" viewBox="0 0 420 300" role="img" aria-label="${scene.character}">
      <rect width="420" height="300" rx="26" fill="#fff7ee"/>
      <circle cx="346" cy="78" r="28" fill="#d9f0db"/>
      <rect x="326" y="103" width="40" height="58" rx="6" fill="#d6ae7b"/>
      ${hairShape}
      <circle cx="190" cy="190" r="70" fill="#ffd3ad"/>
      <path d="M124 197c-17-2-27 8-26 23 1 18 20 28 35 18" fill="#ffd3ad"/>
      <path d="M257 197c17-2 27 8 26 23-1 18-20 28-35 18" fill="#ffd3ad"/>
      <circle cx="164" cy="191" r="13" fill="#172554"/>
      <circle cx="218" cy="191" r="13" fill="#172554"/>
      <circle cx="168" cy="187" r="4" fill="#fff"/>
      <circle cx="222" cy="187" r="4" fill="#fff"/>
      <path d="${mouth}" fill="none" stroke="#9d4a2f" stroke-width="8" stroke-linecap="round"/>
      <path d="M127 285c7-47 32-73 63-73 34 0 58 27 65 73H127z" fill="${scene.shirt}"/>
      ${scene.character === "girl" ? `<path d="M143 129c22 26 74 27 98 0" fill="none" stroke="#f28aa3" stroke-width="10" stroke-linecap="round"/><path d="M235 123l24-15 14 28-31 3z" fill="#f28aa3"/>` : ""}
      ${prop}
    </svg>
  `;
}

function objectScene(scene) {
  const object =
    scene.object === "ball"
      ? `<circle cx="210" cy="158" r="70" fill="${scene.color}"/><path d="M151 146c42 12 79 12 118 0" fill="none" stroke="#fff" stroke-width="8" opacity=".75"/><path d="M210 88c-13 43-13 91 0 140" fill="none" stroke="#fff" stroke-width="8" opacity=".75"/>`
      : scene.object === "car"
        ? `<rect x="112" y="145" width="196" height="64" rx="20" fill="${scene.color}"/><path d="M158 111h92l38 45H125z" fill="${scene.color}"/><rect x="169" y="124" width="36" height="28" rx="6" fill="#dff1ff"/><rect x="216" y="124" width="34" height="28" rx="6" fill="#dff1ff"/><circle cx="154" cy="212" r="22" fill="#1f2937"/><circle cx="270" cy="212" r="22" fill="#1f2937"/>`
        : `<path d="M145 112h130l19 135H126z" fill="${scene.color}"/><path d="M164 113c4-37 87-37 92 0" fill="none" stroke="#1f2937" stroke-width="10" stroke-linecap="round"/>`;

  return `
    <svg class="scene-svg" viewBox="0 0 420 300" role="img" aria-label="${scene.object}">
      <rect width="420" height="300" rx="26" fill="#f7fbff"/>
      <circle cx="72" cy="70" r="30" fill="#ffe69b"/>
      <path d="M54 246h312" stroke="#d6e6f4" stroke-width="12" stroke-linecap="round"/>
      ${object}
    </svg>
  `;
}

function sleepScene(scene) {
  const label = scene.character === "baby" ? "baby" : scene.character;
  return `
    <svg class="scene-svg" viewBox="0 0 420 300" role="img" aria-label="sleeping ${label}">
      <rect width="420" height="300" rx="26" fill="#f4f8ff"/>
      <rect x="78" y="181" width="262" height="54" rx="18" fill="#9fc5f8"/>
      <rect x="68" y="145" width="104" height="52" rx="18" fill="#fff"/>
      <circle cx="163" cy="153" r="38" fill="#ffd3ad"/>
      <path d="M129 151c15-33 66-35 82 0" fill="#7a4b2a"/>
      <path d="M147 162h21M186 162h21" stroke="#172554" stroke-width="5" stroke-linecap="round"/>
      <path d="M170 181c14 7 28 7 42 0" stroke="#9d4a2f" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M155 213h163" stroke="${scene.shirt}" stroke-width="42" stroke-linecap="round"/>
      <text x="277" y="98" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#4169a8">Z</text>
      <text x="310" y="70" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#6c8fc6">Z</text>
    </svg>
  `;
}

function animalScene(scene) {
  const isSleep = scene.action === "sleep";
  const isJump = scene.action === "jump";
  const ear =
    scene.animal === "cat"
      ? `<path d="M147 120l-24-39 47 22zM252 120l24-39-47 22z" fill="${scene.color}"/>`
      : `<path d="M136 128c-36-26-42-60-14-62 22-1 35 26 38 52zM264 128c36-26 42-60 14-62-22-1-35 26-38 52z" fill="${scene.color}"/>`;
  return `
    <svg class="scene-svg" viewBox="0 0 420 300" role="img" aria-label="${scene.animal} ${scene.action}">
      <rect width="420" height="300" rx="26" fill="#fffaf0"/>
      <path d="M62 238h296" stroke="#d8ead1" stroke-width="12" stroke-linecap="round"/>
      ${ear}
      <ellipse cx="200" cy="${isJump ? 143 : 171}" rx="78" ry="62" fill="${scene.color}"/>
      <circle cx="162" cy="${isJump ? 134 : 162}" r="9" fill="#172554"/>
      <circle cx="221" cy="${isJump ? 134 : 162}" r="9" fill="#172554"/>
      <path d="${isSleep ? "M153 157h22M211 157h22" : "M177 178c15 13 31 13 47 0"}" stroke="#4b2f1f" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M124 ${isJump ? 195 : 217}l-36 24M272 ${isJump ? 195 : 217}l38 22" stroke="${scene.color}" stroke-width="18" stroke-linecap="round"/>
      <path d="M157 ${isSleep ? 223 : 215}l-22 25M236 ${isSleep ? 223 : 215}l20 25" stroke="${scene.color}" stroke-width="18" stroke-linecap="round"/>
      ${isSleep ? `<text x="282" y="94" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#8aa1c6">Z</text>` : ""}
      ${!isSleep ? `<path d="M292 144c35 6 47 29 32 54" fill="none" stroke="${scene.color}" stroke-width="16" stroke-linecap="round"/>` : ""}
    </svg>
  `;
}

function renderProp(prop, color) {
  if (prop === "ball") return `<circle cx="302" cy="229" r="26" fill="${color}"/><path d="M278 225c15 5 31 5 48 0" stroke="#fff" stroke-width="5" opacity=".7"/>`;
  if (prop === "book") return `<path d="M277 211h56v42h-56z" fill="${color}"/><path d="M305 211v42" stroke="#fff" stroke-width="4" opacity=".8"/>`;
  if (prop === "toy") return `<rect x="278" y="218" width="54" height="36" rx="10" fill="${color}"/><circle cx="292" cy="254" r="8" fill="#1f2937"/><circle cx="319" cy="254" r="8" fill="#1f2937"/>`;
  if (prop === "cup") return `<path d="M281 214h43l-7 47h-29z" fill="${color}"/><path d="M323 224c20 0 20 24 0 24" fill="none" stroke="${color}" stroke-width="8"/>`;
  if (prop === "run") return `<path d="M91 234h53M284 234h47" stroke="#6dbf88" stroke-width="8" stroke-linecap="round"/>`;
  if (prop === "jump") return `<path d="M94 236c28-35 55-35 82 0M246 236c28-35 55-35 82 0" stroke="#6dbf88" stroke-width="8" fill="none" stroke-linecap="round"/>`;
  return "";
}

function iconSpeaker() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M8 20v8h9l12 10V10L17 20H8z" fill="currentColor"/>
      <path d="M34 17c4 4 4 10 0 14M39 12c7 7 7 17 0 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>
    </svg>
  `;
}

function iconBack() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
}

function iconCheck() {
  return `
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path d="M20 33L10 23l4-4 6 6 15-15 4 4z" fill="currentColor"/>
    </svg>
  `;
}

const deepLinkLevel = Number(new URLSearchParams(location.search).get("level"));
if (levels.some((level) => level.id === deepLinkLevel)) {
  startLevel(deepLinkLevel);
} else {
  render();
}
