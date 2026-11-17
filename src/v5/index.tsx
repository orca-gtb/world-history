import React from "react";
import { Composition, registerRoot } from "remotion";
import { HartmannV5, V5_TOTAL } from "./HartmannV5";

// Entry v5: Hartmann + narasi British (ElevenLabs). v1-v4 tidak disentuh.
const RootV5: React.FC = () => <Composition id="AceHartmannV5" component={HartmannV5} durationInFrames={V5_TOTAL} fps={30} width={1080} height={1920} />;
registerRoot(RootV5);
