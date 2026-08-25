/**
 * 📻 复古电台 DJ 语音播报与字幕联动 (Radio Voice Synthesizer)
 * 利用 Web Speech API 结合复古电台语速与停顿，实现低沉治愈的 DJ 独白朗读
 */

export class RadioVoicePlayer {
  constructor(options = {}) {
    this.synth = window.speechSynthesis || null;
    this.isSpeaking = false;
    this.currentUtterance = null;
    this.speechRate = 0.86; // 悠扬舒缓的电台语速
    this.speechPitch = 0.92; // 略微低沉温润的声线

    this.onSentenceStart = options.onSentenceStart || (() => {});
    this.onWordSpoken = options.onWordSpoken || (() => {});
    this.onFinished = options.onFinished || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * 寻找最适合中文/英文电台的播音声线
   */
  getBestVoice(lang = "zh-CN") {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    // 优先匹配自然流畅的中文声音 (如 Microsoft Kangkang, Xiaoxiao, Google 普通话, Tingting, Sinji)
    const preferredNames = ["Kangkang", "Xiaoxiao", "Yunyang", "Tingting", "Google 普通话", "Natural", "Female", "Male"];
    
    let matched = voices.find(v => v.lang.startsWith(lang.split("-")[0]) && preferredNames.some(p => v.name.includes(p)));
    if (!matched) {
      matched = voices.find(v => v.lang.startsWith(lang.split("-")[0])) || voices[0];
    }
    return matched;
  }

  /**
   * 朗读一段 DJ 独白
   * @param {string} text 
   * @param {Object} options 
   */
  speak(text, options = {}) {
    this.stop();

    if (!this.synth) {
      this.simulateSpeech(text);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || this.speechRate;
    utterance.pitch = options.pitch || this.speechPitch;
    utterance.volume = options.volume !== undefined ? options.volume : 0.9;

    const voice = this.getBestVoice(options.lang || "zh-CN");
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
    };

    utterance.onboundary = (event) => {
      if (event.name === "word" || event.charIndex !== undefined) {
        this.onWordSpoken(event.charIndex, text.slice(0, event.charIndex + (event.charLength || 1)));
      }
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.onFinished();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.onError(e);
    };

    this.currentUtterance = utterance;
    
    // 兼容部分浏览器垃圾回收导致中断的问题
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.synth.speak(utterance);
  }

  /**
   * 当环境不支持 TTS 时，优雅降级为模拟打字机推进
   */
  simulateSpeech(text) {
    this.isSpeaking = true;
    let idx = 0;
    const interval = setInterval(() => {
      if (!this.isSpeaking || idx >= text.length) {
        clearInterval(interval);
        this.isSpeaking = false;
        this.onFinished();
        return;
      }
      idx += 2;
      this.onWordSpoken(idx, text.slice(0, idx));
    }, 180);
  }

  /**
   * 停止当前朗读
   */
  stop() {
    this.isSpeaking = false;
    if (this.synth) {
      this.synth.cancel();
    }
  }

  /**
   * 暂停 / 继续
   */
  pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }
}

export const radioVoice = new RadioVoicePlayer();
