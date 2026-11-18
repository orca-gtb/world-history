import React from "react";
import { Composition, registerRoot } from "remotion";
import { SpriteScene, type SpriteProps } from "./Sprite";
import { Dogfight3D } from "./Dogfight3D";
import { SceneTest } from "./SceneTest";
import { SceneClip } from "./SceneClip";

const DEF: SpriteProps = { model: "bf109g6", base: [0, 0, 0], view: [0, 0, 0], toon: false, debug: "" };
const Root: React.FC = () => (
  <>
    <Composition id="Sprite" component={SpriteScene} durationInFrames={1} fps={30} width={1600} height={800} defaultProps={DEF} />
    <Composition id="SceneClip" component={SceneClip} durationInFrames={900} fps={30} width={1700} height={900} defaultProps={{ id: "brno" as const }} />
    <Composition id="SceneTest" component={SceneTest} durationInFrames={600} fps={30} width={1920} height={1080} defaultProps={{ id: "brno" as const, t0: 4.6 }} />
    <Composition id="Dogfight3D" component={Dogfight3D} durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(Root);
