import React from "react";
import { Composition, registerRoot } from "remotion";
import { HartmannTeaser, TEASER_TOTAL } from "./HartmannTeaser";

// Short teaser Hartmann (memancing ke long-form). VO: vo-teaser/vo.mp3 (1 take Liam Dale, 50,6 dtk). Render muted; audio dicampur terpisah.
const RootT: React.FC = () => <Composition id="HartmannTeaser" component={HartmannTeaser} durationInFrames={TEASER_TOTAL} fps={30} width={1080} height={1920} />;
registerRoot(RootT);
