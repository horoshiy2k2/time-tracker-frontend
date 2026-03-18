import React from "react";

interface Props {
  seconds: number;
  progressColor: string;
}

function getLapColor(progressColor: string, lap: number): string {
  if (lap === 0) {
    return progressColor;
  }

  const level = Math.ceil(lap / 2);
  const mixPercent = Math.min(18 + level * 12, 70);
  const mixTarget = lap % 2 === 1 ? "white" : "black";

  return `color-mix(in srgb, ${progressColor}, ${mixTarget} ${mixPercent}%)`;
}

export default function HourProgressCircle({ seconds, progressColor }: Props) {
  const radius = 120;
  const stroke = 22;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const totalProgress = seconds / 3600;
  const completedLaps = Math.floor(totalProgress);
  const currentLapProgress = totalProgress - completedLaps;

  const visibleLaps = Math.max(
    currentLapProgress === 0 ? completedLaps : completedLaps + 1,
    1,
  );

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#eee"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />

      {Array.from({ length: visibleLaps }, (_, lap) => {
        const lapProgress = lap < completedLaps ? 1 : currentLapProgress;
        const strokeDashoffset = circumference - lapProgress * circumference;

        if (lapProgress <= 0) {
          return null;
        }

        return (
          <circle
            key={lap}
            stroke={getLapColor(progressColor, lap)}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap={lapProgress === 1 ? "butt" : "round"}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        );
      })}

      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize="3em"
        fill="#333"
      >
        {(() => {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = seconds % 60;

          if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
              .toString()
              .padStart(2, "0")}`;
          }

          return `${minutes.toString().padStart(2, "0")}:${secs
            .toString()
            .padStart(2, "0")}`;
        })()}
      </text>
    </svg>
  );
}
