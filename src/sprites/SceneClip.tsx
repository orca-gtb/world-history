import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneCard3D, WIN, SCENE_PAD } from "../longform/Scenes3D";
// Pra-render adegan 3D jadi klip 1700x900 (public/scenes/<id>.mp4) supaya long-form cukup memutar video (render cepat dengan --gl=angle).
// frame 0 = detik VO (WIN[id][0] - SCENE_PAD).
export const SceneClip: React.FC<{ id: keyof typeof WIN }> = ({ id }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#000" }}><SceneCard3D id={id} t={WIN[id][0] - SCENE_PAD + f / 30} /></AbsoluteFill>;
};
