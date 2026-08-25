# 📻 午夜梦境调频 · Midnight Dream Radio

<p align="center">
  <strong>复古拟物美学 × Web Audio 程序化声音合成 × AI 梦境叙事的治愈深夜电台</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vibe_Coding-100%25-amber.svg" alt="Vibe Coding">
  <img src="https://img.shields.io/badge/Web_Audio-Procedural_Synth-emerald.svg" alt="Web Audio">
  <img src="https://img.shields.io/badge/AI_Powered-Gemini_&_OpenAI-blue.svg" alt="AI Powered">
  <img src="https://img.shields.io/badge/License-MIT-purple.svg" alt="License">
</p>

---

## ✨ 核心特色

### 🎛️ 1. 拟物视觉与沉浸动效（Audiovisual Aesthetic）
- **FM 调频刻度盘与旋转旋钮**：支持鼠标上下拖拽与滚轮，感受真实的调频阻尼感与换台电磁白噪音。
- **CRT 荧光示波器**：实时捕获音频信号，呈现绿色/琥珀色荧光余辉与扫描线。
- **动态真空管与磁带机**：温暖发光的电子管光效与跟随播放旋转的磁带卡座。
- **雨夜窗景粒子**：根据当前电台主题实时渲染雨滴滑落与散焦霓虹光晕。

### 🔊 2. 纯代码程序化声音合成（Web Audio Procedural Synth）
- **零外部大音频资源依赖**：所有声音均为纯代码数学算法实时合成（粉红噪声雨声、随机黑胶爆豆杂音、Lo-Fi 和弦 Drone）。
- **80s 收音机带通滤波器**：将声音调制成复古喇叭的温暖质感。
- **多轨混音器**：自由调配主音量、雨声/风声、黑胶底噪与氛围和弦。

### 🧠 3. AI 梦境时空生成（AI Narrative & TTS）
- **时空穿梭生成器**：输入任意时空场景（如*“1995年雨夜的重庆招待所”*、*“2077新东京霓虹拉面摊”*、*“冰岛极光灯塔”*），AI 自动编织台标、频率、DJ 独白与声音配方。
- **深情 DJ 语音独白**：集成 Web Speech API 与打字机流式字幕同步。
- **双模引擎**：支持接入 Google Gemini / OpenAI 兼容接口，亦自带离线启发式生成算法。

### 🎴 4. 一键导出复古磁带纪念卡片
- 点击 **「🎴 导出电台卡片」**，一键生成高清复古磁带通行证海报并保存到本地。

---

## 🚀 在线运行与部署

### 1. GitHub Pages（自动部署）
本项目已内置 `.github/workflows/deploy.yml`。进入仓库设置页面：
1. 访问 `Settings` -> `Pages`
2. 在 **Build and deployment** -> **Source** 中选择 **GitHub Actions**
3. 即可在 `https://realjun.github.io/midnight-radio/` 在线访问！

### 2. Vercel / Cloudflare Pages
- 导入本仓库即可零配置秒级上线。

---

## 🛠️ 技术栈

- **Frontend**: HTML5, Modern ES Modules, Tailwind CSS CDN
- **Audio Engine**: Web Audio API (AnalyserNode, BiquadFilter, WaveShaper, ScriptProcessor/Pink Noise Synth)
- **Speech**: Web Speech API (`SpeechSynthesisUtterance`)
- **Canvas Rendering**: HTML5 2D Canvas (Oscilloscope, Rain & Bokeh, High-res Poster Generator)
- **AI Backend**: Google Gemini API / OpenAI Compatible API + Algorithmic Generator

---

## 📄 开源许可

本项目遵循 [MIT License](LICENSE)。欢迎自由分发、改造成你心目中的专属氛围玩具！
