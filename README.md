# Listen & Pick

不背单词，不看字幕，先让孩子听懂英语。

这是一个面向 PC/Pad 浏览器的英语启蒙 MVP：听一句英语短句，从两张图里选出匹配图片，答对后自动进入下一题。

## 本地运行

```bash
cd /Users/wangpeng/Downloads/个人/青岛择校/listen-pick-mvp
node server.js
```

然后访问：

```text
http://localhost:3333
```

## 文件结构

```text
listen-pick-mvp/
├── index.html
├── styles.css
├── app.js
├── data/
│   └── levels.js
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

后续替换正式插画时，可以把 `scene` 改成图片 URL 或加 `image` 字段。
