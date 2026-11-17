import React from "react";
import { Img, staticFile } from "remotion";
import type { Icon } from "./data";

// Siluet profil dari gambar referensi (public/silhouettes/*.png, dipotong dari gambar kiriman Nanda/Angie).
// Skala relatif disamakan dengan panjang aslinya: Bf 109 ≈ 8,9 m, Fw 190 ≈ 8,95 m, Me 262 ≈ 10,6 m.
const LEN: Record<Icon, number> = { bf109: 8.9, fw190: 8.95, me262: 10.6 };
const ASPECT: Record<Icon, number> = { bf109: 700 / 206, fw190: 672 / 231, me262: 710 / 221 }; // w/h gambar sumber

export const AircraftImg: React.FC<{ icon: Icon; width?: number }> = ({ icon, width = 210 }) => {
  const w = (width * LEN[icon]) / 10.6;
  const h = w / ASPECT[icon];
  return (
    <div style={{ width, height: width / 2.7, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      <Img src={staticFile(`silhouettes/${icon}.png`)} style={{ width: w, height: h, transform: "scaleX(-1)" }} />
    </div>
  );
};
