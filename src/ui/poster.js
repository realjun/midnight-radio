/**
 * 📻 复古磁带电台卡片与海报生成器 (Retro Cassette Poster Generator)
 * 使用原生 HTML5 Canvas 绘制高清复古磁带/黑胶通行证卡片并支持一键下载
 */

export class PosterGenerator {
  /**
   * 生成并下载电台纪念卡片
   * @param {Object} station 
   */
  static exportStationCard(station) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;

    // 1. 背景深色磨砂材质
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#1c1917");
    bgGrad.addColorStop(0.5, "#0c0a09");
    bgGrad.addColorStop(1, "#181412");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. 复古边框
    ctx.strokeStyle = station.theme?.accent || "#fbbf24";
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, width - 72, height - 72);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 1;
    ctx.strokeRect(46, 46, width - 92, height - 92);

    // 3. 顶部 Header
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = "bold 16px monospace";
    ctx.letterSpacing = "3px";
    ctx.fillText("MIDNIGHT DREAM RADIO · ARCHIVE PASS", 65, 85);

    ctx.fillStyle = station.theme?.accent || "#fbbf24";
    ctx.font = "900 48px sans-serif";
    ctx.fillText(`FM ${station.freq.toFixed(1)} MHz`, 65, 150);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.fillText(station.title, 65, 195);

    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "16px sans-serif";
    ctx.fillText(`📍 ${station.location}  |  🎙️ DJ: ${station.dj}`, 65, 230);

    // 4. 绘制磁带核心插画 (Cassette Body)
    this.drawCassetteGraphic(ctx, 100, 270, 600, 360, station.theme?.accent || "#fbbf24");

    // 5. 金句引言
    ctx.fillStyle = station.theme?.accent || "#fbbf24";
    ctx.font = "italic bold 20px serif";
    ctx.fillText(station.tagline, 65, 690);

    // 6. DJ 独白段落（自动换行排版）
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "18px sans-serif";
    this.wrapText(ctx, station.story, 65, 740, 670, 32);

    // 7. 底部印章与条形码 (Stamp & Barcode)
    this.drawStamp(ctx, 630, 960, station.theme?.accent || "#fbbf24");
    this.drawBarcode(ctx, 65, 990, 220, 45);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "13px monospace";
    const nowStr = new Date().toISOString().slice(0, 10).replace(/-/g, ".");
    ctx.fillText(`REC-DATE: ${nowStr} · NOSTALGIA ARCHIVES`, 65, 1055);

    // 8. 触发图片下载
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `MidnightRadio_FM${station.freq.toFixed(1)}_${station.dj}.png`;
    link.href = dataUrl;
    link.click();
  }

  static drawCassetteGraphic(ctx, x, y, w, h, accent) {
    // 磁带外壳
    ctx.fillStyle = "#1e1e1e";
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 磁带贴纸
    ctx.fillStyle = "#2d2a29";
    ctx.beginPath();
    ctx.roundRect(x + 30, y + 25, w - 60, h - 50, 8);
    ctx.fill();

    // 磁带色彩条带
    ctx.fillStyle = accent;
    ctx.fillRect(x + 30, y + 60, w - 60, 16);

    // 中间观察窗口
    ctx.fillStyle = "#0c0a09";
    ctx.beginPath();
    ctx.roundRect(x + 130, y + 100, w - 260, 140, 12);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    ctx.stroke();

    // 左右两个卷带转轮
    this.drawReel(ctx, x + 200, y + 170, 40, accent);
    this.drawReel(ctx, x + w - 200, y + 170, 40, accent);

    // 连接带
    ctx.strokeStyle = "#44403c";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.moveTo(x + 200, y + 170);
    ctx.lineTo(x + w - 200, y + 170);
    ctx.stroke();
  }

  static drawReel(ctx, cx, cy, r, accent) {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.45, 0, Math.PI * 2);
    ctx.fill();

    // 齿轮齿
    ctx.strokeStyle = "#78716c";
    ctx.lineWidth = 4;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * (r * 0.45), cy + Math.sin(angle) * (r * 0.45));
      ctx.lineTo(cx + Math.cos(angle) * (r * 0.85), cy + Math.sin(angle) * (r * 0.85));
      ctx.stroke();
    }
  }

  static drawStamp(ctx, cx, cy, accent) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.15);
    ctx.strokeStyle = accent;
    ctx.lineWidth = 3;
    ctx.strokeRect(-55, -30, 110, 60);

    ctx.fillStyle = accent;
    ctx.font = "bold 13px monospace";
    ctx.textAlign = "center";
    ctx.fillText("AI BROADCAST", 0, -6);
    ctx.fillText("VERIFIED", 0, 14);
    ctx.restore();
  }

  static drawBarcode(ctx, x, y, w, h) {
    ctx.fillStyle = "#ffffff";
    let curX = x;
    while (curX < x + w) {
      const barW = Math.random() < 0.4 ? 3 : 1.5;
      const gap = 2 + Math.random() * 3;
      ctx.fillRect(curX, y, barW, h);
      curX += barW + gap;
    }
  }

  static wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const chars = text.split("");
    let line = "";
    for (let n = 0; n < chars.length; n++) {
      const testLine = line + chars[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = chars[n];
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }
}
