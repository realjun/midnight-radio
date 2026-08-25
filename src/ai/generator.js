/**
 * 📻 梦境时空 AI 生成引擎 (Dream Radio AI Generator)
 * 支持用户配置 Gemini / OpenAI / DeepSeek API Key 实时生成，
 * 亦自带高品质启发式算法场景生成器（零 Key 也能秒级生成独特梦境电台）
 */

export class DreamRadioGenerator {
  constructor() {
    this.storageKey = "midnight_radio_ai_config";
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : { provider: "gemini", apiKey: "", baseUrl: "", model: "gemini-1.5-flash" };
    } catch (e) {
      return { provider: "gemini", apiKey: "", baseUrl: "", model: "gemini-1.5-flash" };
    }
  }

  saveConfig(config) {
    this.config = { ...this.config, ...config };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    } catch (e) {}
  }

  /**
   * 生成梦境电台
   * @param {string} prompt 用户输入的时空场景或心境
   * @returns {Promise<Object>} 电台完整配置对象
   */
  async generateStation(prompt) {
    if (!prompt || !prompt.trim()) {
      prompt = "深夜未眠的思考者与城市微光";
    }

    // 如果配置了有效 API Key，则调用远端 LLM
    if (this.config.apiKey && this.config.apiKey.trim()) {
      try {
        if (this.config.provider === "gemini") {
          return await this.callGeminiAPI(prompt.trim());
        } else {
          return await this.callOpenAICompatibleAPI(prompt.trim());
        }
      } catch (err) {
        console.warn("AI API 调用失败，优雅降级为内置智能生成器:", err);
      }
    }

    // 默认/降级：启发式智能场景生成器
    return this.algorithmicFallback(prompt.trim());
  }

  /**
   * 调用 Google Gemini API
   */
  async callGeminiAPI(prompt) {
    const key = this.config.apiKey.trim();
    const model = this.config.model || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const systemPrompt = `你是一个复古深夜电台首席制作人。请根据用户的场景或心境提示词，生成一个充满画面感、治愈、怀旧或科幻氛围的电台频道。
必须严格返回以下 JSON 格式（不要包含 markdown 代码块包裹）：
{
  "id": "custom-radio",
  "freq": 92.8,
  "title": "时代或场景 · 电台名称",
  "location": "具体的时空地理坐标",
  "dj": "DJ名字",
  "tagline": "一句充满诗意的金句引言",
  "story": "一段120-180字以内的深情、治愈、带环境音描摹的DJ深夜独白",
  "soundRecipe": {
    "rain": 0.5,
    "vinyl": 0.6,
    "wind": 0.3,
    "droneFreq": 110.0,
    "droneType": "warm",
    "chord": [110, 164.81, 220, 261.63]
  },
  "theme": {
    "accent": "#f59e0b",
    "bgGradients": ["#1c1917", "#0c0a09", "#1e1b18"],
    "crtColor": "#fbbf24",
    "vibe": "vintage"
  }
}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: `${systemPrompt}\n\n用户场景提示词：${prompt}` }] }
        ],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!res.ok) throw new Error(`Gemini API Error: ${res.statusText}`);
    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());
  }

  /**
   * 调用 OpenAI 兼容格式 API (OpenAI / DeepSeek / Moonshot / Ollama)
   */
  async callOpenAICompatibleAPI(prompt) {
    const key = this.config.apiKey.trim();
    const baseUrl = this.config.baseUrl?.trim() || "https://api.openai.com/v1";
    const model = this.config.model || "gpt-4o-mini";

    const systemPrompt = `你是一个复古深夜电台制作人。根据用户提示词生成梦境电台。严格返回 JSON 格式，包含: id, freq(87.5-108.0间的浮点数), title, location, dj, tagline, story, soundRecipe, theme。`;

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `用户场景：${prompt}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
    const data = await res.json();
    return JSON.parse(data.choices[0].message.content);
  }

  /**
   * 启发式智能生成器 (免 Key 极速高质量生成)
   */
  algorithmicFallback(prompt) {
    // 随机生成 87.5 ~ 108.0 之间的独一无二频率
    const randomFreq = Math.round((88.0 + Math.random() * 19.5) * 10) / 10;
    const isCyber = /赛博|未来|宇宙|飞船|星际|太空|2077|AI|机器人|数字/i.test(prompt);
    const isWinter = /雪|冬|寒|极地|冰|冷/i.test(prompt);
    const isSea = /海|港|岛|浪|船/i.test(prompt);
    const isNostalgic = /80|90|老|旧|茶|弄堂|小巷|童年|旧金山|港/i.test(prompt);

    let theme = {
      accent: "#f59e0b",
      bgGradients: ["#1c1917", "#0c0a09", "#171513"],
      crtColor: "#fbbf24",
      vibe: "warm-vintage"
    };

    let soundRecipe = {
      rain: 0.6,
      vinyl: 0.5,
      droneFreq: 110,
      droneType: "warm",
      chord: [110, 164.81, 220, 261.63]
    };

    let djName = "安然";
    let location = `某处温柔的时空 · 《${prompt}》`;

    if (isCyber) {
      theme = {
        accent: "#ec4899",
        bgGradients: ["#090d16", "#140a2b", "#05060b"],
        crtColor: "#38bdf8",
        vibe: "cyber-neon"
      };
      soundRecipe = {
        rain: 0.4,
        vinyl: 0.3,
        droneFreq: 146.83,
        droneType: "cyber",
        chord: [146.83, 174.61, 220, 293.66]
      };
      djName = "Echo-7";
      location = `新纪元深空频段 · ${prompt}`;
    } else if (isWinter) {
      theme = {
        accent: "#38bdf8",
        bgGradients: ["#081726", "#0b253a", "#030b14"],
        crtColor: "#7dd3fc",
        vibe: "winter"
      };
      soundRecipe = {
        rain: 0.1,
        vinyl: 0.4,
        droneFreq: 130.81,
        droneType: "ethereal",
        chord: [130.81, 196.00, 246.94, 329.63]
      };
      djName = "白岚";
      location = `北方漫天风雪处 · ${prompt}`;
    } else if (isSea) {
      theme = {
        accent: "#06b6d4",
        bgGradients: ["#041e24", "#083344", "#020f14"],
        crtColor: "#22d3ee",
        vibe: "ocean"
      };
      soundRecipe = {
        rain: 0.3,
        vinyl: 0.5,
        droneFreq: 116.54,
        droneType: "jazz",
        chord: [116.54, 146.83, 174.61, 220.00]
      };
      djName = "子墨";
      location = `潮水涌动的海岸 · ${prompt}`;
    }

    return {
      id: `custom-${Date.now()}`,
      freq: randomFreq,
      title: `${prompt} · 梦境特别调频`,
      location: location,
      dj: djName,
      tagline: `“在时空的缝隙里，收录关于『${prompt}』的声音记忆。”`,
      story: `这里是专属为你构建的 FM ${randomFreq.toFixed(1)} 特别调频。无论白天的生活多么喧嚣匆忙，此时此刻，关于『${prompt}』的一切正被夜色温柔包裹。闭上眼睛，让心跳慢下来，听一听来自心底最深处的回响……`,
      soundRecipe: soundRecipe,
      theme: theme
    };
  }
}

export const dreamGenerator = new DreamRadioGenerator();
