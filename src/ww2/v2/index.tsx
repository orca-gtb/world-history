import React from "react";
import { Composition, registerRoot } from "remotion";
import { SheetV2, CloseUp, VehSheet } from "./Sheet";
import { Showcase, SC_FPS, SC_TOTAL } from "./Showcase";
const RootC: React.FC = () => (
  <>
    <Composition id="V2SheetUS" component={SheetV2} defaultProps={{ skins: ["us_rifleman", "us_radio"] as any }} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="V2SheetDE" component={SheetV2} defaultProps={{ skins: ["de_rifleman", "de_mg"] as any }} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="V2SheetSU" component={SheetV2} defaultProps={{ skins: ["su_smg", "su_rifleman"] as any }} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="V2Showcase" component={Showcase} durationInFrames={SC_TOTAL} fps={SC_FPS} width={1920} height={1080} />
    <Composition id="V2Veh" component={VehSheet} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="V2Close" component={CloseUp} durationInFrames={1} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(RootC);
