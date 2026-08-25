/**
 * 📻 Web Audio API 程序化声音合成引擎 (Procedural Audio Engine)
 * 纯代码算法生成：雨声、黑胶底噪、Lo-Fi 和弦氛围音、调频白噪音、80s收音机带通滤波器
 */

class ProceduralSynthEngine {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.isPlaying = false;

    // Master nodes
    this.masterGain = null;
    this.analyser = null;
    this.radioBandpass = null;
    this.radioDrive = null;

    // Channel gain nodes
    this.gains = {
      master: 0.8,
      vinyl: 0.5,
      rain: 0.6,
      drone: 0.45,
      tuning: 0.0,
      sfx: 0.4
    };

    // Sub-synthesizers & active nodes
    this.droneNodes = [];
    this.droneGain = null;
    this.vinylGain = null;
    this.rainGain = null;
    this.tuningGain = null;
    this.sfxGain = null;

    // Sound processors
    this.vinylProcessor = null;
    this.rainFilter = null;
    this.tuningSource = null;
    this.lfo = null;
  }

  /**
   * 初始化音频上下文（需用户手势唤醒）
   */
  async init() {
    if (this.isInitialized && this.ctx) {
      if (this.ctx.state === "suspended") {
        await this.ctx.resume();
      }
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // 1. Analyser Node 用于示波器渲染
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.analyser.smoothingTimeConstant = 0.8;

    // 2. Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.gains.master, this.ctx.currentTime);

    // 3. Vintage Radio Color Filter (80s 带通与温暖饱和)
    this.radioBandpass = this.ctx.createBiquadFilter();
    this.radioBandpass.type = "bandpass";
    this.radioBandpass.frequency.setValueAtTime(1800, this.ctx.currentTime);
    this.radioBandpass.Q.setValueAtTime(0.7, this.ctx.currentTime); // 宽带通，保留温暖细节

    // 4. Soft Saturation / Distortion for Vintage Tone
    this.radioDrive = this.createDistortionNode(8);

    // 5. Connect Master Chain: MasterGain -> RadioBandpass -> RadioDrive -> Analyser -> Destination
    this.masterGain.connect(this.radioBandpass);
    this.radioBandpass.connect(this.radioDrive);
    this.radioDrive.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    // 6. Setup Individual Channels
    this.setupChannels();

    // 7. Setup Generators
    this.setupVinylGenerator();
    this.setupRainGenerator();
    this.setupTuningNoiseGenerator();

    this.isInitialized = true;
  }

  /**
   * 建立各个子通道 Gain Node
   */
  setupChannels() {
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(this.gains.drone, this.ctx.currentTime);
    this.droneGain.connect(this.masterGain);

    this.vinylGain = this.ctx.createGain();
    this.vinylGain.gain.setValueAtTime(this.gains.vinyl, this.ctx.currentTime);
    this.vinylGain.connect(this.masterGain);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(this.gains.rain, this.ctx.currentTime);
    this.rainGain.connect(this.masterGain);

    this.tuningGain = this.ctx.createGain();
    this.tuningGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.tuningGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.gains.sfx, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  /**
   * 软失真曲线（模拟老式电子管与磁带饱和）
   */
  createDistortionNode(amount = 10) {
    const waveshaper = this.ctx.createWaveShaper();
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    const k = amount;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    waveshaper.curve = curve;
    waveshaper.oversample = "2x";
    return waveshaper;
  }

  /**
   * 纯算法黑胶杂音 (Vinyl Crackle & Hum)
   */
  setupVinylGenerator() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      let val = 0;
      // 随机黑胶爆豆杂音 (Crackle ticks)
      if (Math.random() < 0.0015) {
        val = (Math.random() * 2 - 1) * Math.pow(Math.random(), 3) * 0.9;
      }
      // 细微粉红底噪 (Surface hiss)
      val += (Math.random() * 2 - 1) * 0.015;
      output[i] = val;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // 滤波器增强老黑胶唱片的频响质感
    const vinylFilter = this.ctx.createBiquadFilter();
    vinylFilter.type = "highpass";
    vinylFilter.frequency.setValueAtTime(150, this.ctx.currentTime);

    // 50Hz 交流电嗡鸣 (AC Mains Hum)
    const humOsc = this.ctx.createOscillator();
    humOsc.type = "sine";
    humOsc.frequency.setValueAtTime(50, this.ctx.currentTime);
    const humGain = this.ctx.createGain();
    humGain.gain.setValueAtTime(0.012, this.ctx.currentTime);
    humOsc.connect(humGain);
    humGain.connect(this.vinylGain);
    humOsc.start();

    whiteNoise.connect(vinylFilter);
    vinylFilter.connect(this.vinylGain);
    whiteNoise.start();
  }

  /**
   * 纯算法雨声与风声 (Rain & Ambience)
   */
  setupRainGenerator() {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // 算法生成细腻的 Pink Noise 作为雨声基底
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const rainSource = this.ctx.createBufferSource();
    rainSource.buffer = noiseBuffer;
    rainSource.loop = true;

    this.rainFilter = this.ctx.createBiquadFilter();
    this.rainFilter.type = "lowpass";
    this.rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    rainSource.connect(this.rainFilter);
    this.rainFilter.connect(this.rainGain);
    rainSource.start();
  }

  /**
   * 调频搜台白噪音 (FM Static Noise on Tuning)
   */
  setupTuningNoiseGenerator() {
    const bufferSize = this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.tuningSource = this.ctx.createBufferSource();
    this.tuningSource.buffer = noiseBuffer;
    this.tuningSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2200, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.tuningSource.connect(filter);
    filter.connect(this.tuningGain);
    this.tuningSource.start();
  }

  /**
   * 调频搜台杂音强度（根据离目标电台频率的远近设置）
   * @param {number} staticLevel 0.0 (清晰电台) 到 1.0 (完全杂音)
   */
  setTuningStatic(staticLevel) {
    if (!this.ctx || !this.tuningGain) return;
    const target = Math.max(0, Math.min(1, staticLevel)) * 0.35;
    this.tuningGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
  }

  /**
   * 播放电台咔哒开关/旋钮音效
   */
  playClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(450, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.03);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  }

  /**
   * 触发一次远雷轰鸣 (Thunder Rumble)
   */
  triggerThunder() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(65, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 2.5);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(180, this.ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 2.5);

    gain.gain.setValueAtTime(0.01, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.rainGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 3.1);
  }

  /**
   * 应用电台环境音配方（平滑渐变切换）
   * @param {Object} recipe 
   */
  applyRecipe(recipe) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const rampTime = 1.2;

    // 1. 雨声强度
    const rainLevel = recipe.rain !== undefined ? recipe.rain * 0.65 : 0.0;
    this.rainGain.gain.setTargetAtTime(rainLevel, now, 0.4);

    // 2. 黑胶底噪强度
    const vinylLevel = recipe.vinyl !== undefined ? recipe.vinyl * 0.5 : 0.2;
    this.vinylGain.gain.setTargetAtTime(vinylLevel, now, 0.4);

    // 3. 重新构建 Ambient Drone 和弦
    this.buildAmbientChords(recipe.chord || [110, 164.81, 220, 261.63], recipe.droneType || "warm");
  }

  /**
   * 构建程序化多振荡器氛围和弦 (Ambient Drone Synthesizer)
   */
  buildAmbientChords(chordFreqs, type = "warm") {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    // 渐弱并清理旧的振荡器
    this.droneNodes.forEach(node => {
      try {
        node.gain.gain.setTargetAtTime(0.0001, now, 0.6);
        setTimeout(() => {
          try { node.osc.stop(); node.osc.disconnect(); } catch (e) {}
        }, 1200);
      } catch (e) {}
    });
    this.droneNodes = [];

    // 创建全新和弦声部
    chordFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // 音色微调
      if (type === "cyber") {
        osc.type = idx % 2 === 0 ? "sawtooth" : "square";
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(600 + idx * 120, now);
      } else if (type === "ethereal") {
        osc.type = "sine";
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(freq * 1.5, now);
      } else if (type === "cosmic") {
        osc.type = "triangle";
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(320, now);
      } else {
        // warm Lo-Fi
        osc.type = idx % 2 === 0 ? "triangle" : "sine";
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(500, now);
      }

      // 微小的音高随机漂移 (Detune & Vintage Tape Drift)
      const detuneCents = (Math.random() * 8 - 4) + (idx * 2 - 2);
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneCents, now);

      // 每个音符独立音量渐入
      const targetGain = (0.28 / chordFreqs.length) * (1 - idx * 0.12);
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.setTargetAtTime(targetGain, now + 0.1, 1.0);

      osc.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.droneGain);

      osc.start();
      this.droneNodes.push({ osc, gain: oscGain, filter });
    });
  }

  /**
   * 调节各通道音量
   */
  setVolume(channel, value) {
    if (!this.ctx) return;
    const clamped = Math.max(0, Math.min(1, value));
    this.gains[channel] = clamped;
    const now = this.ctx.currentTime;

    switch (channel) {
      case "master":
        if (this.masterGain) this.masterGain.gain.setTargetAtTime(clamped, now, 0.05);
        break;
      case "rain":
        if (this.rainGain) this.rainGain.gain.setTargetAtTime(clamped * 0.7, now, 0.05);
        break;
      case "vinyl":
        if (this.vinylGain) this.vinylGain.gain.setTargetAtTime(clamped * 0.6, now, 0.05);
        break;
      case "drone":
        if (this.droneGain) this.droneGain.gain.setTargetAtTime(clamped * 0.5, now, 0.05);
        break;
    }
  }

  /**
   * 获取示波器频域/时域波形数据
   */
  getWaveformData(array) {
    if (!this.analyser) return;
    this.analyser.getByteTimeDomainData(array);
  }

  getFrequencyData(array) {
    if (!this.analyser) return;
    this.analyser.getByteFrequencyData(array);
  }
}

export const synthEngine = new ProceduralSynthEngine();
