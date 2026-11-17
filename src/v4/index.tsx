import React from "react";
import { Composition, registerRoot } from "remotion";
import { HartmannV4, V4_TOTAL } from "./HartmannV4";

// Entry point terpisah untuk v4 — file lama (src/index.ts, src/Root.tsx) tidak disentuh.
const RootV4: React.FC = () => <Composition id="AceHartmannV4" component={HartmannV4} durationInFrames={V4_TOTAL} fps={30} width={1080} height={1920} />;
registerRoot(RootV4);
