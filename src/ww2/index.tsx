import React from "react";
import { Composition, registerRoot } from "remotion";
import { Demo, DEMO_TOTAL, DEMO_FPS } from "./Demo";
const RootC: React.FC = () => <Composition id="WW2Demo" component={Demo} durationInFrames={DEMO_TOTAL} fps={DEMO_FPS} width={1920} height={1080} />;
registerRoot(RootC);
