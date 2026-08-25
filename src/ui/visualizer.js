/**
 * 📻 复古视觉渲染系统 (Visualizer & Particles Engine)
 * 包括：CRT 示波器荧光绿/琥珀波形、VU 电平表拟物指针、雨滴窗景与夜色粒子
 */

export class RetroVisualizer {
  constructor(canvasOsc, canvasBg, synthEngine) {
    this.canvasOsc = canvasOsc;
    this.ctxOsc = canvasOsc.getContext("2d");
    this.canvasBg = canvasBg;
    this.ctxBg = canvasBg.getContext("2d");
    this.synth = synthEngine;

    this.isRunning = false;
    this.animId = null;

    // Time domain data array
    this.dataArray = new Uint8Array(128);
    this.freqArray = new Uint8Array(64);

    // Particles & Rain
    this.rainDrops = [];
    this.bokehParticles = [];
    this.themeColor = "#fbbf24";

    this.initCanvasSize();
    window.addEventListener("resize", () => this.initCanvasSize());
    this.initParticles();
  }

  initCanvasSize() {
    if (this.canvasBg) {
      this.canvasBg.width = window.innerWidth;
      this.canvasBg.height = window.innerHeight;
    }
    if (this.canvasOsc) {
      this.canvasOsc.width = this.canvasOsc.parentElement?.clientWidth || 320;
      this.canvasOsc.height = this.canvasOsc.parentElement?.clientHeight || 90;
    }
  }

  initParticles() {
    // 50 颗雨滴
    this.rainDrops = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      len: 15 + Math.random() * 25,
      speed: 12 + Math.random() * 15,
      opacity: 0.15 + Math.random() * 0.35
    }));

    // 15 个霓虹光晕微粒 (Bokeh)
    this.bokehParticles = Array.from({ length: 18 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 40 + Math.random() * 120,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: 0.08 + Math.random() * 0.12
    }));
  }

  setThemeColor(color) {
    this.themeColor = color || "#fbbf24";
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) cancelAnimationFrame(this.animId);
  }

  loop() {
    if (!this.isRunning) return;

    this.renderBackground();
    this.renderOscilloscope();
    this.updateVUMeter();

    this.animId = requestAnimationFrame(() => this.loop());
  }

  /**
   * 渲染背景雨滴与霓虹色斑 (Rain & Bokeh Background)
   */
  renderBackground() {
    const ctx = this.ctxBg;
    const w = this.canvasBg.width;
    const h = this.canvasBg.height;
    if (!ctx || !w || !h) return;

    ctx.clearRect(0, 0, w, h);

    // 1. 绘制柔和霓虹光晕
    this.bokehParticles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -100) p.x = w + 100;
      if (p.x > w + 100) p.x = -100;
      if (p.y < -100) p.y = h + 100;
      if (p.y > h + 100) p.y = -100;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      grad.addColorStop(0, this.hexToRgba(this.themeColor, p.alpha));
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. 绘制下落雨丝
    ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    ctx.lineWidth = 1.2;
    this.rainDrops.forEach(r => {
      r.y += r.speed;
      r.x -= 1.5; // 微斜风雨
      if (r.y > h) {
        r.y = -30;
        r.x = Math.random() * (w + 100);
      }

      ctx.beginPath();
      ctx.moveTo(r.x, r.y);
      ctx.lineTo(r.x - 2, r.y + r.len);
      ctx.stroke();
    });
  }

  /**
   * 渲染 CRT 示波器波形 (CRT Oscilloscope)
   */
  renderOscilloscope() {
    const ctx = this.ctxOsc;
    const w = this.canvasOsc.width;
    const h = this.canvasOsc.height;
    if (!ctx || !w || !h) return;

    // 荧光余辉拖影 (Phosphor trail)
    ctx.fillStyle = "rgba(8, 12, 10, 0.28)";
    ctx.fillRect(0, 0, w, h);

    // 获取当前音频波形
    this.synth.getWaveformData(this.dataArray);

    ctx.lineWidth = 2.2;
    ctx.strokeStyle = this.themeColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.themeColor;

    ctx.beginPath();
    const sliceWidth = w / this.dataArray.length;
    let x = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const v = this.dataArray[i] / 128.0; // 0.0 ~ 2.0
      const y = (v * h) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }

    ctx.stroke();
    ctx.shadowBlur = 0; // 重置阴影

    // 绘制中心参考标线
    ctx.strokeStyle = "rgba(255, 255, 255, 0.07)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
  }

  /**
   * 更新拟物 VU 电平表指针
   */
  updateVUMeter() {
    this.synth.getFrequencyData(this.freqArray);
    let sum = 0;
    for (let i = 0; i < this.freqArray.length; i++) {
      sum += this.freqArray[i];
    }
    const avg = sum / this.freqArray.length; // 0 ~ 255
    const normalized = Math.min(1.0, avg / 140); // 0.0 ~ 1.0

    // 计算指针旋转角度 (-35deg 到 +35deg)
    const angle = -35 + normalized * 70;
    const needleEl = document.getElementById("vu-needle");
    if (needleEl) {
      needleEl.style.transform = `rotate(${angle}deg)`;
    }
  }

  hexToRgba(hex, alpha) {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c.split("").map(x => x + x).join("");
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
  }
}
