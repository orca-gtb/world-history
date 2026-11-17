import React from "react";
import type { Icon } from "./data";

// Siluet pesawat tampak atas, hidung ke kanan. viewBox 0 0 200 120.
const PATHS: Record<Icon, string> = {
  // Bf 109: ramping, sayap lancip dengan ujung membulat
  bf109:
    "M8 60 L30 58 L36 46 L42 46 L44 57 L92 56 L106 14 C112 8 126 8 128 14 L128 54 L150 57 L182 59 L192 60 L182 61 L150 63 L128 66 L128 106 C126 112 112 112 106 106 L92 64 L44 63 L42 74 L36 74 L30 62 Z M194 50 L194 70",
  // Fw 190: hidung radial gemuk, sayap elips
  fw190:
    "M8 60 L28 58 L34 44 L40 44 L42 57 L88 55 L100 16 C108 8 128 8 132 18 L134 52 L156 52 C176 52 188 55 190 60 C188 65 176 68 156 68 L134 68 L132 102 C128 112 108 112 100 104 L88 65 L42 63 L40 76 L34 76 L28 62 Z M194 48 L194 72",
  // Me 262: sayap menyapu, dua nasel jet
  me262:
    "M6 60 L40 58 L44 50 L50 50 L52 57 L96 56 L150 6 L162 10 L130 56 L176 58 L196 60 L176 62 L130 64 L162 110 L150 114 L96 64 L52 63 L50 70 L44 70 L40 62 Z M98 34 C110 30 134 32 136 38 C134 44 110 46 98 42 Z M98 78 C110 74 134 76 136 82 C134 88 110 90 98 86 Z",
};
export const Silhouette: React.FC<{ icon: Icon; color?: string; width?: number; opacity?: number }> = ({ icon, color = "#2a2418", width = 220, opacity = 1 }) => (
  <svg viewBox="0 0 200 120" width={width} height={(width * 120) / 200} style={{ opacity }}>
    <path d={PATHS[icon]} fill={color} stroke={color} strokeWidth={1.2} strokeLinejoin="round" />
  </svg>
);
