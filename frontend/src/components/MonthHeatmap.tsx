import React, { useState } from "react";
import "../styles/monthHeatmap.css";

interface Props {
  sessions: any[];
}

interface HoverData {
  hours: number;
  day: number;
  x: number;
  y: number;
}

const DEFAULT_BUTTON_RGB = { r: 100, g: 108, b: 255 };
const DAY_EMPTY_CELL_RGB = { r: 235, g: 237, b: 240 };
const NIGHT_EMPTY_CELL_RGB = { r: 31, g: 35, b: 43 };

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const parseButtonColorToRgb = (color: string) => {
  const trimmed = color.trim();

  const hex = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hex) {
    const raw = hex[1];
    const normalized = raw.length === 3 ? raw.split("").map((ch) => ch + ch).join("") : raw;

    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }

  const rgb = trimmed.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgb) {
    return {
      r: clamp(Number(rgb[1]), 0, 255),
      g: clamp(Number(rgb[2]), 0, 255),
      b: clamp(Number(rgb[3]), 0, 255),
    };
  }

  return DEFAULT_BUTTON_RGB;
};

const blendRgb = (
  base: { r: number; g: number; b: number },
  top: { r: number; g: number; b: number },
  alpha: number
) => ({
  r: Math.round(base.r * (1 - alpha) + top.r * alpha),
  g: Math.round(base.g * (1 - alpha) + top.g * alpha),
  b: Math.round(base.b * (1 - alpha) + top.b * alpha),
});

const getTextColorForBackground = (rgb: { r: number; g: number; b: number }, isNightMode: boolean) => {
  const luminance = (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;

  if (luminance > 0.6) return "#111827";
  if (luminance > 0.42) return isNightMode ? "#f8fafc" : "#1f2937";
  return "#f8fafc";
};

const MonthHeatmap: React.FC<Props> = ({ sessions }) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const todayDate = now.getDate();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayWeekday = new Date(year, month, 1).getDay(); // 0 = Sunday

  const data: { day: number; hours: number }[] = [];

  for (let i = 0; i < firstDayWeekday; i++) {
    data.push({ day: 0, hours: 0 });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    data.push({ day: i, hours: 0 });
  }

  sessions.forEach((s) => {
    const date = new Date(s.startTime);
    if (date.getFullYear() === year && date.getMonth() === month) {
      const dayIndex = firstDayWeekday + date.getDate() - 1;
      data[dayIndex].hours += s.durationSec / 3600;
    }
  });

  const max = Math.max(...data.map((d) => d.hours), 1);

  const [hover, setHover] = useState<HoverData | null>(null);

  const isNightMode = document.body.classList.contains("night");

  const cssColor = getComputedStyle(document.documentElement).getPropertyValue("--button-color");
  const buttonColorRgb = parseButtonColorToRgb(cssColor);

  const emptyCellRgb = isNightMode ? NIGHT_EMPTY_CELL_RGB : DAY_EMPTY_CELL_RGB;

  return (
    <div className="month-heatmap-wrap">
      <div className="month-heatmap-grid">
        {data.map((d, index) => {
          if (d.day === 0) {
            return <div key={index} className="month-heatmap-spacer" />;
          }

          const isToday = d.day === todayDate;
          const intensity = d.hours / max;
          const alpha = intensity === 0 ? 0 : 0.18 + intensity * 0.74;
          const backgroundRgb = blendRgb(emptyCellRgb, buttonColorRgb, alpha);
          const textColor = getTextColorForBackground(backgroundRgb, isNightMode);
          const glowAlpha = intensity === 0 ? 0 : 0.2 + intensity * 0.45;

          return (
            <div
              key={index}
              className={`month-heatmap-cell ${isToday ? "month-heatmap-cell--today" : ""}`}
              style={{
                "--heatmap-cell-bg": `rgb(${backgroundRgb.r}, ${backgroundRgb.g}, ${backgroundRgb.b})`,
                "--heatmap-cell-glow": `rgba(${buttonColorRgb.r}, ${buttonColorRgb.g}, ${buttonColorRgb.b}, ${glowAlpha})`,
                "--heatmap-cell-text": textColor,
                "--heatmap-today-ring": `rgba(${buttonColorRgb.r}, ${buttonColorRgb.g}, ${buttonColorRgb.b}, ${isToday ? (isNightMode ? 0.95 : 0.9) : 0})`,
              } as React.CSSProperties}
              onMouseEnter={(e) =>
                setHover({
                  day: d.day,
                  hours: d.hours,
                  x: e.clientX,
                  y: e.clientY,
                })
              }
              onMouseMove={(e) =>
                setHover((prev) =>
                  prev ? { ...prev, x: e.clientX, y: e.clientY } : null
                )
              }
              onMouseLeave={() => setHover(null)}
            >
              {d.day}
            </div>
          );
        })}
      </div>

      {hover && (
        <div
          className="month-heatmap-tooltip"
          style={{
            left: hover.x + 12,
            top: hover.y + 12,
          }}
        >
          <div className="month-heatmap-tooltip-day">Day: {hover.day}{hover.day === todayDate ? " (Today)" : ""}</div>
          <div className="month-heatmap-tooltip-hours">{hover.hours.toFixed(2)}h</div>
        </div>
      )}
    </div>
  );
};

export default MonthHeatmap;
