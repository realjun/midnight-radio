/**
 * 📻 午夜梦境调频 - 主应用程序控制器 (Midnight Dream Radio Main App)
 */

import { PRESET_STATIONS } from "./data/presets.js";
import { synthEngine } from "./audio/synth.js";
import { RadioTuner } from "./audio/tuner.js";
import { radioVoice } from "./audio/voice.js";
import { dreamGenerator } from "./ai/generator.js";
import { RetroVisualizer } from "./ui/visualizer.js";
import { PosterGenerator } from "./ui/poster.js";

class MidnightRadioApp {
  constructor() {
    this.stations = [...PRESET_STATIONS];
    this.currentStation = this.stations[0];
    this.isPoweredOn = false;
    this.isVoiceReading = false;

    // UI Elements
    this.dom = {
      appContainer: document.getElementById("radio-app"),
      powerBtn: document.getElementById("power-btn"),
      powerIndicator: document.getElementById("power-indicator"),
      dialScale: document.getElementById("dial-scale"),
      dialNeedle: document.getElementById("dial-needle"),
      tuningKnob: document.getElementById("tuning-knob"),
      freqDisplay: document.getElementById("freq-display"),
      signalBadge: document.getElementById("signal-badge"),
      stationTitle: document.getElementById("station-title"),
      stationLocation: document.getElementById("station-location"),
      stationDj: document.getElementById("station-dj"),
      stationTagline: document.getElementById("station-tagline"),
      stationStory: document.getElementById("station-story"),
      voicePlayBtn: document.getElementById("voice-play-btn"),
      cassetteReels: document.querySelectorAll(".cassette-reel"),
      presetChips: document.getElementById("preset-chips"),
      volMaster: document.getElementById("vol-master"),
      volRain: document.getElementById("vol-rain"),
      volVinyl: document.getElementById("vol-vinyl"),
      volDrone: document.getElementById("vol-drone"),
      thunderBtn: document.getElementById("thunder-btn"),
      exportCardBtn: document.getElementById("export-card-btn"),
      openDreamModalBtn: document.getElementById("open-dream-modal-btn"),
      dreamModal: document.getElementById("dream-modal"),
      closeDreamModalBtn: document.getElementById("close-dream-modal-btn"),
      dreamPromptInput: document.getElementById("dream-prompt-input"),
      submitDreamBtn: document.getElementById("submit-dream-btn"),
      openSettingsBtn: document.getElementById("open-settings-btn"),
      settingsModal: document.getElementById("settings-modal"),
      closeSettingsModalBtn: document.getElementById("close-settings-modal-btn"),
      saveSettingsBtn: document.getElementById("save-settings-btn"),
      aiProviderSelect: document.getElementById("ai-provider-select"),
      aiApiKeyInput: document.getElementById("ai-api-key-input"),
      aiBaseUrlInput: document.getElementById("ai-base-url-input"),
      aiModelInput: document.getElementById("ai-model-input"),
      canvasOsc: document.getElementById("oscilloscope-canvas"),
      canvasBg: document.getElementById("bg-canvas")
    };

    // Visualizer
    this.visualizer = new RetroVisualizer(this.dom.canvasOsc, this.dom.canvasBg, synthEngine);

    // Tuner
    this.tuner = new RadioTuner(this.stations, {
      initialFreq: this.currentStation.freq,
      onFrequencyChange: (freq, signalQuality, station) => this.handleFrequencyChange(freq, signalQuality, station),
      onStationLocked: (station) => this.handleStationLocked(station),
      onStationLost: () => this.handleStationLost()
    });

    this.init();
  }

  init() {
    this.renderPresetChips();
    this.setupEventListeners();
    this.setupKnobDrag();
    this.loadSettingsToForm();
    this.updateStationUI(this.currentStation);
    this.updateDialUI(this.currentStation.freq);
  }

  /**
   * 渲染预设电台快捷芯片
   */
  renderPresetChips() {
    if (!this.dom.presetChips) return;
    this.dom.presetChips.innerHTML = "";

    this.stations.forEach(st => {
      const chip = document.createElement("button");
      chip.className = `px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 border ${
        this.currentStation?.id === st.id
          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
          : "bg-stone-900/80 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700"
      }`;
      chip.innerHTML = `<span>FM ${st.freq.toFixed(1)}</span> <span class="text-[11px] opacity-70">${st.title.split("·")[1]?.trim() || st.title}</span>`;
      chip.onclick = () => {
        if (!this.isPoweredOn) this.togglePower();
        this.tuner.tuneToStation(st.id);
      };
      this.dom.presetChips.appendChild(chip);
    });
  }

  /**
   * 绑定所有按钮和交互事件
   */
  setupEventListeners() {
    // 1. 电源开关
    this.dom.powerBtn?.addEventListener("click", () => this.togglePower());

    // 2. 刻度盘点击/拖动跳转频率
    this.dom.dialScale?.addEventListener("click", (e) => {
      const rect = this.dom.dialScale.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const targetFreq = 87.5 + pct * (108.0 - 87.5);
      if (!this.isPoweredOn) this.togglePower();
      this.tuner.setFrequency(targetFreq, true);
    });

    // 3. DJ 独白朗读
    this.dom.voicePlayBtn?.addEventListener("click", () => this.toggleVoiceReading());

    // 4. 音量与混音滑块
    this.dom.volMaster?.addEventListener("input", (e) => synthEngine.setVolume("master", parseFloat(e.target.value)));
    this.dom.volRain?.addEventListener("input", (e) => synthEngine.setVolume("rain", parseFloat(e.target.value)));
    this.dom.volVinyl?.addEventListener("input", (e) => synthEngine.setVolume("vinyl", parseFloat(e.target.value)));
    this.dom.volDrone?.addEventListener("input", (e) => synthEngine.setVolume("drone", parseFloat(e.target.value)));

    // 5. 远雷音效触发
    this.dom.thunderBtn?.addEventListener("click", () => {
      if (!this.isPoweredOn) this.togglePower();
      synthEngine.triggerThunder();
    });

    // 6. 导出卡片海报
    this.dom.exportCardBtn?.addEventListener("click", () => {
      if (this.currentStation) {
        PosterGenerator.exportStationCard(this.currentStation);
      }
    });

    // 7. AI 梦境场景弹窗
    this.dom.openDreamModalBtn?.addEventListener("click", () => {
      this.dom.dreamModal?.classList.remove("hidden");
    });
    this.dom.closeDreamModalBtn?.addEventListener("click", () => {
      this.dom.dreamModal?.classList.add("hidden");
    });
    this.dom.submitDreamBtn?.addEventListener("click", () => this.handleGenerateDream());

    // 8. 设置弹窗
    this.dom.openSettingsBtn?.addEventListener("click", () => {
      this.dom.settingsModal?.classList.remove("hidden");
    });
    this.dom.closeSettingsModalBtn?.addEventListener("click", () => {
      this.dom.settingsModal?.classList.add("hidden");
    });
    this.dom.saveSettingsBtn?.addEventListener("click", () => this.handleSaveSettings());

    // 语音事件回调
    radioVoice.onWordSpoken = (index, currentText) => {
      if (this.dom.stationStory) {
        this.dom.stationStory.innerHTML = currentText + `<span class="typewriter-cursor"></span>`;
      }
    };
    radioVoice.onFinished = () => {
      this.isVoiceReading = false;
      this.updateVoiceBtnState();
    };
  }

  /**
   * 旋转调频物理旋钮拖拽算法 (Rotary Knob Tracking)
   */
  setupKnobDrag() {
    const knob = this.dom.tuningKnob;
    if (!knob) return;

    let isDragging = false;
    let startY = 0;
    let currentAngle = 0;

    const onStart = (clientY) => {
      isDragging = true;
      startY = clientY;
      if (!this.isPoweredOn) this.togglePower();
    };

    const onMove = (clientY) => {
      if (!isDragging) return;
      const deltaY = startY - clientY;
      startY = clientY;

      // 灵敏度换算：每移动 1px 改变 0.05 MHz
      const deltaFreq = deltaY * 0.04;
      const newFreq = this.tuner.currentFreq + deltaFreq;
      currentAngle += deltaY * 3.5;
      knob.style.transform = `rotate(${currentAngle}deg)`;

      this.tuner.setFrequency(newFreq, false);
    };

    const onEnd = () => {
      isDragging = false;
    };

    // Mouse Events
    knob.addEventListener("mousedown", (e) => onStart(e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientY));
    window.addEventListener("mouseup", onEnd);

    // Touch Events
    knob.addEventListener("touchstart", (e) => onStart(e.touches[0].clientY), { passive: true });
    window.addEventListener("touchmove", (e) => onMove(e.touches[0].clientY), { passive: true });
    window.addEventListener("touchend", onEnd);

    // 滚轮微调
    knob.addEventListener("wheel", (e) => {
      e.preventDefault();
      const deltaFreq = e.deltaY < 0 ? 0.1 : -0.1;
      currentAngle += e.deltaY < 0 ? 15 : -15;
      knob.style.transform = `rotate(${currentAngle}deg)`;
      this.tuner.setFrequency(this.tuner.currentFreq + deltaFreq, true);
    });
  }

  /**
   * 电源开/关切换
   */
  async togglePower() {
    this.isPoweredOn = !this.isPoweredOn;

    if (this.isPoweredOn) {
      await synthEngine.init();
      synthEngine.playClick();
      this.visualizer.start();
      this.tuner.evaluateReception();

      // UI 状态
      this.dom.powerIndicator?.classList.replace("bg-stone-700", "bg-emerald-500");
      this.dom.powerIndicator?.classList.add("shadow-[0_0_12px_#10b981]");
      this.dom.cassetteReels.forEach(el => el.classList.remove("cassette-reel-spin-paused"));
    } else {
      synthEngine.playClick();
      radioVoice.stop();
      this.isVoiceReading = false;
      this.updateVoiceBtnState();
      this.visualizer.stop();

      this.dom.powerIndicator?.classList.replace("bg-emerald-500", "bg-stone-700");
      this.dom.powerIndicator?.classList.remove("shadow-[0_0_12px_#10b981]");
      this.dom.cassetteReels.forEach(el => el.classList.add("cassette-reel-spin-paused"));
    }
  }

  /**
   * 频率发生变化回调
   */
  handleFrequencyChange(freq, signalQuality, station) {
    this.updateDialUI(freq);
    if (this.dom.freqDisplay) {
      this.dom.freqDisplay.textContent = freq.toFixed(1);
    }

    if (this.dom.signalBadge) {
      if (signalQuality >= 0.85) {
        this.dom.signalBadge.className = "px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
        this.dom.signalBadge.textContent = "STEREO LOCKED";
      } else if (signalQuality > 0.2) {
        this.dom.signalBadge.className = "px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30";
        this.dom.signalBadge.textContent = "TUNING...";
      } else {
        this.dom.signalBadge.className = "px-2 py-0.5 rounded text-[11px] font-mono bg-stone-800 text-stone-500 border border-stone-700";
        this.dom.signalBadge.textContent = "NO SIGNAL";
      }
    }
  }

  /**
   * 电台精准锁定
   */
  handleStationLocked(station) {
    this.currentStation = station;
    this.updateStationUI(station);
    this.renderPresetChips();
    this.visualizer.setThemeColor(station.theme?.crtColor || station.theme?.accent);
    document.documentElement.style.setProperty("--radio-accent", station.theme?.accent || "#f59e0b");
  }

  /**
   * 脱离电台信号
   */
  handleStationLost() {
    if (this.dom.stationTitle) {
      this.dom.stationTitle.textContent = "—— 搜寻电台信号中 ——";
    }
    if (this.dom.stationStory) {
      this.dom.stationStory.textContent = "转动右侧调频旋钮，探索穿梭于时空中的午夜电波……";
    }
    radioVoice.stop();
    this.isVoiceReading = false;
    this.updateVoiceBtnState();
  }

  /**
   * 更新刻度盘指针位置
   */
  updateDialUI(freq) {
    if (!this.dom.dialNeedle) return;
    const pct = ((freq - 87.5) / (108.0 - 87.5)) * 100;
    this.dom.dialNeedle.style.left = `${Math.max(0, Math.min(100, pct))}%`;
  }

  /**
   * 更新当前电台卡片图文
   */
  updateStationUI(station) {
    if (!station) return;
    if (this.dom.stationTitle) this.dom.stationTitle.textContent = station.title;
    if (this.dom.stationLocation) this.dom.stationLocation.textContent = `📍 ${station.location}`;
    if (this.dom.stationDj) this.dom.stationDj.textContent = `🎙️ DJ: ${station.dj}`;
    if (this.dom.stationTagline) this.dom.stationTagline.textContent = station.tagline;
    if (this.dom.stationStory) this.dom.stationStory.textContent = station.story;
  }

  /**
   * 切换 DJ 语音朗读
   */
  toggleVoiceReading() {
    if (!this.currentStation) return;
    if (!this.isPoweredOn) this.togglePower();

    if (this.isVoiceReading) {
      radioVoice.stop();
      this.isVoiceReading = false;
      this.dom.stationStory.textContent = this.currentStation.story;
    } else {
      this.isVoiceReading = true;
      radioVoice.speak(this.currentStation.story);
    }
    this.updateVoiceBtnState();
  }

  updateVoiceBtnState() {
    if (!this.dom.voicePlayBtn) return;
    if (this.isVoiceReading) {
      this.dom.voicePlayBtn.innerHTML = `<span>⏹ 停止播报</span>`;
      this.dom.voicePlayBtn.className = "px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-sm shadow-lg hover:bg-amber-400 transition-all flex items-center gap-2";
    } else {
      this.dom.voicePlayBtn.innerHTML = `<span>🎙️ 聆听 DJ 独白</span>`;
      this.dom.voicePlayBtn.className = "px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 font-bold text-sm border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center gap-2";
    }
  }

  /**
   * 触发 AI 梦境生成
   */
  async handleGenerateDream() {
    const prompt = this.dom.dreamPromptInput?.value?.trim();
    if (!prompt) return;

    const btn = this.dom.submitDreamBtn;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="animate-spin">⏳</span> 正在调频穿梭时空...`;
    btn.disabled = true;

    try {
      const newStation = await dreamGenerator.generateStation(prompt);
      this.stations.unshift(newStation); // 加入电台列表最前
      this.dom.dreamModal?.classList.add("hidden");
      if (this.dom.dreamPromptInput) this.dom.dreamPromptInput.value = "";

      if (!this.isPoweredOn) await this.togglePower();
      this.tuner.tuneToStation(newStation.id);
    } catch (e) {
      alert("生成梦境电台失败，请检查网络或配置: " + e.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }

  loadSettingsToForm() {
    const conf = dreamGenerator.config;
    if (this.dom.aiProviderSelect) this.dom.aiProviderSelect.value = conf.provider || "gemini";
    if (this.dom.aiApiKeyInput) this.dom.aiApiKeyInput.value = conf.apiKey || "";
    if (this.dom.aiBaseUrlInput) this.dom.aiBaseUrlInput.value = conf.baseUrl || "";
    if (this.dom.aiModelInput) this.dom.aiModelInput.value = conf.model || "gemini-1.5-flash";
  }

  handleSaveSettings() {
    dreamGenerator.saveConfig({
      provider: this.dom.aiProviderSelect?.value,
      apiKey: this.dom.aiApiKeyInput?.value,
      baseUrl: this.dom.aiBaseUrlInput?.value,
      model: this.dom.aiModelInput?.value
    });
    this.dom.settingsModal?.classList.add("hidden");
  }
}

// 页面加载完成后启动应用
window.addEventListener("DOMContentLoaded", () => {
  window.midnightApp = new MidnightRadioApp();
});
