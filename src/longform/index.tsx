import React from "react";
import { Composition, registerRoot } from "remotion";
import { HartmannLong, LONG_TOTAL } from "./Longform";

// Long-form Hartmann (16:9, 1920x1080). Entry terpisah; Short v1-v7 tidak tersentuh.
const RootLong: React.FC = () => <Composition id="HartmannLong" component={HartmannLong} durationInFrames={LONG_TOTAL} fps={30} width={1920} height={1080} />;
registerRoot(RootLong);
