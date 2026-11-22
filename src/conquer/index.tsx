import React from "react";
import { Composition, registerRoot } from "remotion";
import { BobruiskTest, TEST_TOTAL } from "./BobruiskTest";
import { Proto, PROTO_TOTAL } from "./Proto";

const RootC: React.FC = () => (
  <>
    <Composition id="BobruiskTest" component={BobruiskTest} durationInFrames={TEST_TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="BobruiskProto" component={Proto} durationInFrames={PROTO_TOTAL} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(RootC);
