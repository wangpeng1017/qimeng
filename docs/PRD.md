# Listen & Pick 英语启蒙产品 PRD

最后更新：2026-07-01

## 1. 产品一句话

不背单词，不看字幕，先让孩子听懂英语。

孩子在 Pad 或 PC 浏览器上听一句英语短句，从两张图片中选出匹配图片；答对后自动进入下一题。

## 2. 产品定位

Listen & Pick 不是单词卡、绘本课、口语课或课堂游戏，而是面向 3-8 岁非母语儿童的英语听觉理解训练器。

核心训练目标：

- 建立“英语声音 -> 画面意义”的直觉连接。
- 先输入、先听懂，再考虑开口、认字和阅读。
- 把会分散注意力的按钮、文字、奖励系统和菜单尽量移除。

目标用户：

- 3-8 岁儿童。
- 家庭主要使用 Pad 横屏访问。
- 家长希望每天 3-5 分钟做轻量英语启蒙。
- 孩子还不适合背单词、读字幕、做复杂题型。

## 3. 核心产品主张

- 不背单词：不要求孩子记拼写或中文释义。
- 不看字幕：儿童学习态默认不显示英文句子或中文解释。
- 先听懂英语：用音频和图片建立声音理解。
- 一题只测一个变量：例如颜色、数量、动作、位置、名词等。
- 少刺激：不做金币、排行榜、复杂结算和强奖励动画。
- 自动流转：孩子点对图片后自动进入下一题。
- 家长复杂度外置：儿童端极简，家长端以后再做记录和分析。

## 4. 当前 MVP 范围

当前线上版本：

- 访问地址：`http://8.130.182.148:3333/`
- 部署方式：阿里云 ECS + Node 原生静态服务 + PM2。
- 服务名：`qimeng`
- 代码仓库：`https://github.com/wangpeng1017/qimeng`
- 本地仓库：`/Users/wangpeng/GitHub/qimeng`

当前内容：

- 10 个 Level。
- 每关 15 题。
- 总计 150 道听句选图题。
- 161 个唯一插画场景。
- 62 个启蒙核心词。
- 每题 2 选 1。
- 已建立图片资产和音频资产生产脚本。

当前上线记录：

- 2026-07-01：Level 7-9 已补齐正式写实插画、WebP 优化图和慢速清晰短句 MP3。
- GitHub 提交：`19da181 Complete Level 7 to 9 assets`。
- 线上验证：`qimeng` PM2 服务在线，首页、关键 WebP 图片和 Level 7/9 示例音频均返回 200。

## 5. 儿童端交互

### 5.1 首页

首页只承担关卡入口，不做营销长文案。

保留：

- `LP Listen & Pick` 品牌标识。
- Level 分组。
- Level 卡片。
- 开始按钮。

避免：

- 大段产品理念文案。
- 过多说明文字。
- 复杂筛选或设置。

### 5.2 答题页

儿童答题页只保留：

- 返回按钮。
- 当前 Level。
- 进度：`1 / 15`。
- 大号播放按钮。
- 两张大图。

不显示：

- 英文字幕。
- 中文翻译。
- 语法解释。
- 星星、金币、排行榜。
- 语速开关等设置项。

### 5.3 答题流程

1. 进入题目后自动播放英文短句。
2. 孩子点击图片。
3. 答对：轻反馈，自动下一题。
4. 答错：不扣分、不弹窗，自动重播音频。
5. 同题多次错误：降低播放速度。
6. 完成 15 题后显示结果页。

## 6. 内容体系

内容不按“主题课”粗暴堆词，而按听力理解能力逐步升级。

当前前 10 关：

| Level | 名称 | 目标 |
|---|---|---|
| 1 | People | girl / boy / baby / mom / dad |
| 2 | Animals | cat / dog / bird / fish / rabbit |
| 3 | Things | ball / book / bag / cup / toy / car |
| 4 | Colors | red / blue / yellow / green |
| 5 | Size & Numbers | big / small / one / two / three / four / five |
| 6 | Actions | run / jump / sleep / eat / drink / read |
| 7 | Body & Clothes | hand / head / eyes / hat / shoes / shirt |
| 8 | Home | bed / chair / table / door / window / lamp |
| 9 | Food | apple / banana / milk / water / egg / bread |
| 10 | Places & Nature | house / school / park / tree / flower / sun / moon |

当前 62 个核心词：

`apple, baby, bag, ball, banana, bed, big, bird, blue, book, boy, bread, car, cat, chair, cup, dad, dog, door, drink, eat, egg, eyes, fish, five, flower, four, girl, green, hand, happy, hat, head, house, jump, lamp, milk, mom, moon, on, one, park, rabbit, read, red, run, sad, school, shirt, shoes, sleep, small, sun, table, three, toy, tree, two, under, water, window, yellow`

## 7. 题目设计规则

每道题只测试一个语言变量，其余视觉元素尽量保持一致。

示例：

- `A red flower.` vs `A blue flower.` 测颜色。
- `The cat is on the chair.` vs `The cat is under the chair.` 测位置。
- `Two apples.` vs `Three apples.` 测数量。
- `The boy runs.` vs `The boy jumps.` 测动作。

错误标签：

- `noun`：名词区分。
- `color`：颜色区分。
- `action`：动作区分。
- `position`：位置区分。
- `number`：数量区分。
- `attribute`：大小、情绪、状态。
- `object`：人物与物品搭配。
- `body`：身体部位。

后续用于家长端分析：孩子到底是颜色不稳、介词不稳、数量不稳，还是动作不稳。

## 8. 插画风格决策

已生成四种风格对比图，最新决策采用：

**A：越真实越好**

内部命名：

**Style A / Real Picturebook / 写实绘本风**

风格定义：

- 真实感优先，人物、动物和物品要接近孩子日常能见到的样子。
- 涉及人物时，默认是中国宝宝、中国孩子、中国妈妈/爸爸，黑发或深棕发，东亚面孔。
- 保持绘本级温和质感，不做低龄贴纸或扁平矢量。
- 背景极简，只服务于识别，不做复杂故事场景。
- 主体居中、轮廓清楚，Pad 上一眼能认出来。
- 光线柔和，色彩温暖、干净。
- 不做幼稚贴纸感。
- 不做动漫感。
- 物品不拟人化，不加表情。
- 一张图只表达一个语言点。
- 可以做低干扰文化融合：用中式庭院、窗棂、青瓷器物等画面气质呼应孩子喜欢的四大名著，但不直接加入复杂角色或故事线，避免干扰听力判断。

统一正向提示词：

```text
Style A realistic modern picturebook illustration for a preschool English listening app.
Natural realistic materials, believable child-friendly proportions, soft studio lighting, gentle depth, clear silhouette, warm clean colors, minimal real-world background, centered subject, high readability on tablet screens.
When any person appears, make them clearly Chinese or East Asian: black or dark brown hair, East Asian facial features, natural Chinese family look, age-appropriate clothing.
Show only the target subject or action. No extra characters, no decorative clutter, no text, no letters, no watermark, no logo.
The image must help a child choose the correct picture after hearing an English word or sentence.
```

统一负向约束：

```text
Avoid Caucasian stock-photo look, avoid blonde hair, avoid blue eyes, avoid flat vector style, avoid childish sticker style, avoid anime, avoid complex storybook scenes, avoid busy background, avoid extra animals or people, avoid facial expressions on objects.
```

当前风格投票图：

- `social-output/style-vote/xhs-style-vote.png`

Style A 确认样图：

- `assets/style-samples/style-a-modern-picturebook/apple.png`
- `assets/style-samples/style-a-modern-picturebook/girl.png`
- `assets/style-samples/style-a-modern-picturebook/cat.png`
- `assets/style-samples/style-a-modern-picturebook/red-ball.png`
- `assets/style-samples/style-a-modern-picturebook/boy-reads.png`

## 9. 图片资产计划

当前图片结构：

- 正式插画源图：`assets/illustrations/<scene-id>.png`
- 前端加载优化图：`assets/illustrations-webp/<scene-id>.webp`
- 风格样图：`assets/style-samples/<style-id>/<scene-id>.png`
- 生成脚本：`scripts/generate-illustrations.mjs`
- 压缩脚本：`scripts/optimize-illustrations.mjs`

当前状态：

- 已接入真实图片优先展示。
- 前端优先加载 768px WebP 优化图，PNG 源图作为兼容兜底。
- 图片缺失时 fallback 到代码生成的 SVG 占位图，页面不会崩。
- 正式插画目录当前不保留旧风格散图，避免线上混用。
- Level 1-9 已按 Style A 写实绘本风生成正式插画。
- Level 4 颜色关已改成红/蓝/黄/绿花，画面带轻微中式古典绘本氛围。
- 剩余 Level 仍待继续批量生成正式插画。

正式生成策略：

1. 使用 Style A 写实绘本风批量生成 161 个场景。
2. 对每关抽样目检。
3. 对最容易混淆的图片做人工复核：颜色、数量、位置、动作。

## 10. 音频资产计划

### 10.1 单词音频

已完成 62 个核心词 MP3 下载。

文件位置：

- `assets/audio/words/<word>.mp3`

来源清单：

- `data/audio-sources.json`

来源策略：

- 优先使用 GitHub 上的 `thousandlemons/English-words-pronunciation-mp3-audio-download` 作为词典音频 URL 索引。
- 实际下载时优先选择 Cambridge / Macmillan / Dictionary 等 URL 明确匹配目标词的音频。
- 对失效链接做多 URL 重试。
- 对个别词 fallback 到可用词典源。

注意：

- GitHub 仓库主要提供音频 URL 索引，不等于所有音频版权都归该仓库。
- 产品上线前如果商业化，需要再次核查音频源许可。

### 10.2 短句音频

当前儿童答题播放的是完整句子，例如 `The girl is happy.`。

现实边界：

- GitHub/词典源主要覆盖单词音频。
- 完整短句音频不能直接靠词典库解决。

短句音频方案：

1. Level 1-9 已生成慢速清晰版固定 MP3 短句音频：`assets/audio/sentences/level-<n>/01.mp3` 到 `15.mp3`。
2. 页面优先播放固定短句音频，浏览器 Web Speech API 只作为 fallback。
3. 商业化阶段：考虑真人录制或固定高质量 TTS 声线。

## 11. 技术架构

当前是零构建链静态 Web：

- `index.html`：页面入口。
- `styles.css`：Pad 优先样式。
- `app.js`：关卡、播放、答题、结果逻辑。
- `data/levels.js`：关卡、题目、场景、图片提示词。
- `server.js`：Node 原生静态服务。

脚本：

- `npm run fetch:audio`：下载并记录单词音频。
- `npm run generate:audio`：生成指定 Level 的短句音频，支持 `RATE`、`TEMPO`、`VOICE`。
- `npm run generate:images`：按场景批量生成插画。
- `npm run optimize:images`：将正式 PNG 插画批量压缩为前端加载的 WebP。
- `npm start`：启动静态服务。

部署：

- 服务器：`8.130.182.148`
- 端口：`3333`
- PM2 服务：`qimeng`
- 服务器目录：`/root/qimeng`

## 12. 版本路线

### V0.1 已完成

- 静态 Web MVP。
- 关卡选择页。
- 答题页。
- 10 关内容数据。
- Node 直接部署到阿里云。
- 单词音频资产下载。
- 风格对比图生成。

### V0.2 当前阶段

- 已确认 Style A 写实绘本风。
- Level 1-9 正式插画已生成并接入关卡。
- 已完成正式插画 WebP 压缩接入，线上优先加载优化图。
- 已重新部署线上并完成家庭验证。
- 用 Pad 检查首屏、答题页和完成页。

### V0.3

- 为剩余短句生成稳定音频文件。
- 页面播放逻辑已切换为短句音频优先。
- 加入错题隔题复现。
- 本地保存学习进度。
- 家长端基础报告。

### V0.4

- 扩展到 Level 1-100。
- 建立内容生产后台或数据导入流程。
- 多孩子档案。
- 云端同步。
- 付费内容包。

## 13. 当前未解决问题

- Level 1-9 正式插画已生成，剩余 Level 还未按 Style A 写实绘本风全量生成。
- Level 1-9 短句音频已生成，剩余 Level 的完整短句音频还未生成。
- 儿童端仍有完成页数据文字，后续需要考虑是否隐藏到家长入口。
- GitHub/词典音频用于商业化前需要做许可复核。
- 目前没有登录和云端进度。

## 14. 下一步

1. 按 Style A 写实绘本风继续补齐剩余 Level 的正式插画。
2. 目检关键图片，必要时重生成。
3. 为剩余 Level 补齐慢速清晰短句音频。
4. 将新增资产推送 GitHub 并部署到阿里云。
5. 做 Pad 实机体验检查。
