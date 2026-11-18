import React from "react";
import { Composition, registerRoot } from "remotion";
import { SpriteScene, type SpriteProps } from "./Sprite";
import { Dogfight3D } from "./Dogfight3D";

const DEF: SpriteProps = { model: "bf109g6", base: [0, 0, 0], view: [0, 0, 0], toon: false, debug: "" };
const Root: React.FC = () => (
  <>
    <Composition id="Sprite" component={SpriteScene} durationInFrames={1} fps={30} width={1600} height={800} defaultProps={DEF} />
    <Composition id="Dogfight3D" component={Dogfight3D} durationInFrames={150} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(Root);
