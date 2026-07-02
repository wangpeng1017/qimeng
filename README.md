# Listen & Pick

不背单词，不看字幕，先让孩子听懂英语。

这是一个面向 PC/Pad 浏览器的英语启蒙 MVP：听一句英语短句，从两张图里选出匹配图片，答对后自动进入下一题。

当前线上地址：`http://8.130.182.148:3333/`

## 本地运行

```bash
cd /Users/wangpeng/GitHub/qimeng
node server.js
```

然后访问：

```text
http://localhost:3333
```

也可以直接执行：

```bash
npm start
```

## 当前状态

- 已完成 Level 1-10 内容扩充。
- 已完成 Level 1-9 正式插画接入。
- 已完成 Level 1-9 慢速清晰短句 MP3 接入。
- Level 4 颜色关已改成红/蓝/黄/绿花，画面带轻微中式古典绘本氛围。
- 前端优先加载 `assets/illustrations-webp/` 中的 WebP 压缩图，弱网下加载更快。
- 浏览器 Web Speech API 仅作为短句音频缺失时的 fallback。
- 答题页已增加 `中文` / `EN` 标签开关，默认关闭，家长可临时打开辅助理解。

## 文件结构

```text
qimeng/
├── index.html
├── styles.css
├── app.js
├── server.js
├── assets/
│   ├── audio/
│   ├── illustrations/
│   ├── illustrations-webp/
│   └── style-samples/
├── data/
│   ├── levels.js
│   └── audio-sources.json
├── docs/
│   └── PRD.md
├── scripts/
│   ├── generate-illustrations.mjs
│   ├── generate-sentence-audio.mjs
│   └── optimize-illustrations.mjs
└── DEVELOPMENT_PLAN.md
```

## 快速改内容

改 `data/levels.js`。

每关 15 题，当前格式：

```js
["The girl.", "noun", "girl", "boy"]
```

字段含义：

- 第 1 项：英文短句。
- 第 2 项：能力标签。
- 第 3 项：正确图片场景 ID。
- 第 4 项：干扰图片场景 ID。

当前图片字段已经接入正式资源：

- `scene.image`：WebP 优化图。
- `scene.fallbackImage`：PNG 源图兜底。
- `scene.sourceImage`：供生成脚本复用的源图路径。

产品和资产规划见 [docs/PRD.md](/Users/wangpeng/GitHub/qimeng/docs/PRD.md)。
