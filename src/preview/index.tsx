import React from "react";
import { AbsoluteFill, Composition, registerRoot } from "remotion";
import { AircraftProfile } from "../aces/Profiles";
import { Silhouette } from "../aces/Silhouettes";

const Demo: React.FC = () => (
  <AbsoluteFill style={{ background: "#e6dab8", padding: 40, display: "flex", flexDirection: "column", gap: 20 }}>
    {(["bf109", "fw190", "me262"] as const).map((k) => (
      <div key={k} style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ width: 640 }}><AircraftProfile icon={k} width={640} /></div>
        <div style={{ width: 210, background: "#f4ecd6", padding: 10 }}><AircraftProfile icon={k} width={210} /></div>
        <div style={{ width: 160, opacity: 0.7 }}><Silhouette icon={k} width={160} /></div>
      </div>
    ))}
  </AbsoluteFill>
);
registerRoot(() => <Composition id="P" component={Demo} durationInFrames={1} fps={30} width={1200} height={1000} />);
