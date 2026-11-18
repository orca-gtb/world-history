import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { SceneCard3D } from "../longform/Scenes3D";
// Uji adegan 3D lepas dari long-form: t = t0 + frame/30.
export const SceneTest: React.FC<{ id: "first" | "ambush" | "goebel" | "brno"; t0: number }> = ({ id, t0 }) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#d8cdb2", alignItems: "center", justifyContent: "center" }}><div style={{ position: "relative", width: 1700, height: 900 }}><SceneCard3D id={id} t={t0 + f / 30} /></div></AbsoluteFill>;
};
