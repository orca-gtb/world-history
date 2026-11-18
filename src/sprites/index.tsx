import React from "react";
import { Composition, registerRoot } from "remotion";
import { SpriteScene, type SpriteProps } from "./Sprite";

const DEF: SpriteProps = { model: "bf109g6", base: [0, 0, 0], view: [0, 0, 0], toon: false, debug: "" };
const Root: React.FC = () => <Composition id="Sprite" component={SpriteScene} durationInFrames={1} fps={30} width={1600} height={800} defaultProps={DEF} />;
registerRoot(Root);
