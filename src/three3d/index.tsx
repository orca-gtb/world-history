import React from "react";
import { Composition, registerRoot } from "remotion";
import { Bf109Glb } from "./Bf109Glb";

const TOTAL = 150;
const Root3D: React.FC = () => <Composition id="Bf109Glb" component={() => <Bf109Glb total={TOTAL} />} durationInFrames={TOTAL} fps={30} width={1920} height={1080} />;
registerRoot(Root3D);
