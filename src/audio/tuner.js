/**
 * 📻 收音机调频与物理旋钮阻尼模拟 (Radio Tuner Controller)
 * 管理 87.5MHz ~ 108.0MHz 刻度盘、旋钮拖拽旋转、电台信号捕捉与杂音过渡
 */

import { synthEngine } from "./synth.js";

export class RadioTuner {
  constructor(stations, options = {}) {
    this.stations = stations;
    this.minFreq = 87.5;
    this.maxFreq = 108.0;
    this.currentFreq = options.initialFreq || 88.5;

    // Signal lock parameters
    this.activeStation = null;
    this.signalQuality = 1.0; // 0.0 (无信号/纯杂音) 到 1.0 (清晰锁定)
    this.lockTolerance = 0.35; // 捕捉容差 (MHz)

    // Callbacks
    this.onFrequencyChange = options.onFrequencyChange || (() => {});
    this.onStationLocked = options.onStationLocked || (() => {});
    this.onStationLost = options.onStationLost || (() => {});
  }

  /**
   * 设置目标频率
   * @param {number} freq 
   * @param {boolean} triggerClick 
   */
  setFrequency(freq, triggerClick = false) {
    const clamped = Math.max(this.minFreq, Math.min(this.maxFreq, Math.round(freq * 10) / 10));
    this.currentFreq = clamped;

    if (triggerClick) {
      synthEngine.playClick();
    }

    this.evaluateReception();
  }

  /**
   * 评估当前频率的电台信号强弱与杂音
   */
  evaluateReception() {
    let nearestStation = null;
    let minDistance = 999;

    for (const station of this.stations) {
      const dist = Math.abs(this.currentFreq - station.freq);
      if (dist < minDistance) {
        minDistance = dist;
        nearestStation = station;
      }
    }

    if (minDistance <= this.lockTolerance) {
      // 信号由弱到强 线性衰减
      this.signalQuality = 1.0 - (minDistance / this.lockTolerance);
      // 杂音随着信号变强而减少
      synthEngine.setTuningStatic(1.0 - this.signalQuality);

      if (this.signalQuality >= 0.85) {
        if (this.activeStation?.id !== nearestStation.id) {
          this.activeStation = nearestStation;
          synthEngine.applyRecipe(nearestStation.soundRecipe);
          this.onStationLocked(nearestStation, this.currentFreq);
        }
      }
    } else {
      // 完全脱离电台频段，纯白噪音
      this.signalQuality = 0.0;
      synthEngine.setTuningStatic(0.7);
      if (this.activeStation) {
        this.activeStation = null;
        this.onStationLost(this.currentFreq);
      }
    }

    this.onFrequencyChange(this.currentFreq, this.signalQuality, nearestStation);
  }

  /**
   * 直接快速对齐到某个电台
   */
  tuneToStation(stationId) {
    const station = this.stations.find(s => s.id === stationId);
    if (station) {
      this.setFrequency(station.freq, true);
    }
  }

  /**
   * 获取当前刻度盘百分比 (0% ~ 100%)
   */
  getDialPercentage() {
    return ((this.currentFreq - this.minFreq) / (this.maxFreq - this.minFreq)) * 100;
  }
}
