/**
 * 📻 午夜梦境调频 - 预设时空电台数据
 * 每个预设包含：频率、呼号、DJ、独白、程序化声音配方、视觉色彩主题
 */

export const PRESET_STATIONS = [
  {
    id: "chongqing-1995",
    freq: 88.5,
    title: "1995 · 重庆雨夜招待所",
    location: "中国 重庆 · 临江门二马路",
    dj: "老林",
    tagline: "“雨水顺着青苔瓦当滴落，屋里热着一壶沱茶。”",
    story: "这里是 FM 88.5，午夜一点十七分。窗外的嘉陵江面上起了薄雾，山城的雨还在断断续续地下着。招待所三楼走廊尽头的旧吊扇吱呀吱呀地转着，茶水炉的热气在玻璃上凝成了一层白雾。如果你也还没睡，不妨把窗户推开一条缝，听听这穿过三十年夜色的雨声……今夜，我们哪儿也不去，就在这里避避雨。",
    soundRecipe: {
      rain: 0.75,         // 雨声强度
      thunder: 0.3,       // 远雷概率
      vinyl: 0.6,         // 黑胶底噪
      droneFreq: 110,     // 氛围和弦基频 (A2)
      droneType: "warm",  // 温暖低保真
      chord: [110, 164.81, 220, 261.63], // A minor 7
      tapeSpeed: 0.98     // 磁带微晃抖动
    },
    theme: {
      accent: "#f59e0b",      // 琥珀暖黄
      bgGradients: ["#1c1917", "#0c0a09", "#1e1b18"],
      crtColor: "#fbbf24",
      vibe: "rainy-room"
    }
  },
  {
    id: "neotokyo-2077",
    freq: 94.2,
    title: "2077 · 新东京霓虹拉面摊",
    location: "新东京 · 第7层空中回廊 412号档口",
    dj: "KAI-9 (合成人DJ)",
    tagline: "“高架轻轨呼啸而过，豚骨汤在全息招牌下翻滚。”",
    story: "早上好，或者说夜深了，第7区的夜猫子们。这里是 FM 94.2，新东京夜间调频。刚才有一列货运磁悬浮列车从摊头上方轰鸣掠过，带落了几滴合成酸雨。师傅刚给汤锅加了一勺木鱼花，暖帘后面是闪烁不定的紫色霓虹。义体发热了就喝口热汤吧，明天的数据洪流，明天再去同步。",
    soundRecipe: {
      rain: 0.45,
      thunder: 0.1,
      vinyl: 0.4,
      droneFreq: 146.83,  // D3
      droneType: "cyber", // 赛博朋克合成器
      chord: [146.83, 174.61, 220, 293.66], // D minor 7
      tapeSpeed: 1.0
    },
    theme: {
      accent: "#ec4899",      // 赛博粉霓虹
      bgGradients: ["#0f172a", "#1e1035", "#09090b"],
      crtColor: "#38bdf8",
      vibe: "cyber-neon"
    }
  },
  {
    id: "iceland-lighthouse",
    freq: 98.0,
    title: "极北之境 · 冰岛极光灯塔",
    location: "冰岛 · 斯奈山半岛孤崖灯塔",
    dj: "Astrid",
    tagline: "“大西洋的海浪拍打黑沙滩，绿色极光在头顶静静流动。”",
    story: "欢迎调入 FM 98.0。我是 Astrid。灯塔的旋转透镜刚刚转过第八百次，外面是零下四度的寒风和大西洋的潮汐声。整个半岛除了这盏灯和这台发电机，方圆五十公里只有积雪与苔原。把手心贴在冒着热气的黑咖啡杯上，让我们在世界的边缘，分享这一刻绝对的宁静。",
    soundRecipe: {
      rain: 0.1,
      wind: 0.7,          // 寒风
      waves: 0.6,         // 海浪拍岸
      vinyl: 0.3,
      droneFreq: 130.81,  // C3
      droneType: "ethereal", // 空灵北欧弦乐
      chord: [130.81, 196.00, 246.94, 329.63], // C major 7 add 9
      tapeSpeed: 1.02
    },
    theme: {
      accent: "#10b981",      // 极光翡翠绿
      bgGradients: ["#022c22", "#064e3b", "#020617"],
      crtColor: "#34d399",
      vibe: "aurora"
    }
  },
  {
    id: "steampunk-airship",
    freq: 101.3,
    title: "云端漫游 · 蒸汽飞艇的书房",
    location: "对流层 3500米 · 『信风号』飞艇观景甲板",
    dj: "温斯顿船长",
    tagline: "“铜管气阀吐出微热的白气，舷窗外是无边无际的星海。”",
    story: "咳咳……调频 101.3 的乘客们请注意。我们现在平稳飞行在三千米云层之上，逆风时速二十八节。蒸汽锅炉的减压阀每隔十五秒会发出轻柔的叹息，壁挂式机械钟正在滴答作响。如果你正捧着一本翻旧的小说，请尽情享受这片没有地面喧嚣的天空。",
    soundRecipe: {
      wind: 0.5,
      steam: 0.4,         // 蒸汽气阀声
      clock: 0.5,         // 机械钟滴答
      vinyl: 0.5,
      droneFreq: 98.00,   // G2
      droneType: "brass", // 铜管与温暖大提琴
      chord: [98.00, 146.83, 196.00, 246.94], // G major
      tapeSpeed: 0.96
    },
    theme: {
      accent: "#d97706",      // 蒸汽黄铜金
      bgGradients: ["#291508", "#1c1008", "#0f0804"],
      crtColor: "#fbbf24",
      vibe: "steampunk"
    }
  },
  {
    id: "sf-vinyl-1988",
    freq: 104.5,
    title: "1988 · 旧金山海湾黑胶唱片店",
    location: "旧金山 · 嬉皮士街区『海风唱片』",
    dj: "Ray",
    tagline: "“落日把电车轨道染成金红色，针尖滑入爵士乐的第一道声槽。”",
    story: "Hey friends，这里是 FM 104.5，海风电台。刚把橱窗外的『OPEN』木牌翻过来，店里的黑胶唱机正放着一张有点磨损的 Bill Evans。海湾吹来的雾气正慢慢漫过金门大桥，街角的老电车叮叮当当地驶过。放下你手里的紧绷，让这段低音提琴接管你的思绪吧。",
    soundRecipe: {
      vinyl: 0.8,         // 浓厚黑胶
      rain: 0.2,
      jazzKeys: 0.5,      // 爵士和弦
      droneFreq: 116.54,  // Bb2
      droneType: "jazz",
      chord: [116.54, 146.83, 174.61, 220.00], // Bb maj 7
      tapeSpeed: 0.99
    },
    theme: {
      accent: "#f43f5e",      // 复古玫瑰红
      bgGradients: ["#2e0814", "#1a040b", "#0f0508"],
      crtColor: "#fb7185",
      vibe: "retro-diner"
    }
  },
  {
    id: "space-cargo-3042",
    freq: 107.1,
    title: "深空孤航 · 猎户座长途货运飞船",
    location: "柯伊伯带外缘 · 『旅行者9号』货运舱",
    dj: "导航AI-NOVA",
    tagline: "“核聚变反应堆发出平缓的低鸣，舷窗外是沉默亿万年的星尘。”",
    story: "调频 107.1 深度空间信标已校准。我是 NOVA。距离下一个跳跃引力点还有六十四个标准时。反应堆维持在百分之三十七巡航功率，散热冷凝管正发出轻微的结晶声。在这片真空与寂静中，向所有正在夜间航行的灵魂发送微波问候——你并不孤单。",
    soundRecipe: {
      cosmicDrone: 0.8,   // 深空低鸣
      radarBeep: 0.3,     // 脉冲信号
      vinyl: 0.2,
      droneFreq: 73.42,   // D2 (极深沉低音)
      droneType: "cosmic",
      chord: [73.42, 110.00, 164.81, 220.00], // D sus2
      tapeSpeed: 1.0
    },
    theme: {
      accent: "#818cf8",      // 宇宙深蓝紫
      bgGradients: ["#050816", "#0c1033", "#02040a"],
      crtColor: "#a5b4fc",
      vibe: "deep-space"
    }
  }
];
