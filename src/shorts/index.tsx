import React from "react";
import { Composition, registerRoot } from "remotion";
import { ShortComp, shortFrames } from "./ShortComp";

const RootS: React.FC = () => (
  <>
    <Composition id="BagShort01" component={ShortComp} defaultProps={{ id: "s01" }} durationInFrames={shortFrames("s01")} fps={30} width={1080} height={1920} />
  </>
);
registerRoot(RootS);
