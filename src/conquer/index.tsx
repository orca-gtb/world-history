import React from "react";
import { Composition, registerRoot } from "remotion";
import { BobruiskTest, TEST_TOTAL } from "./BobruiskTest";
import { Proto, PROTO_TOTAL } from "./Proto";
import { ProtoV2, PROTO2_TOTAL } from "./ProtoV2";
import { ProtoV3, PROTO3_TOTAL } from "./ProtoV3";
import { Pilot, PILOT_TOTAL } from "./Pilot";
import { Part1, PART1_TOTAL } from "./Part1";
import { Thumb } from "./Thumb";
import { Part2, PART2_TOTAL } from "./Part2";

const RootC: React.FC = () => (
  <>
    <Composition id="BobruiskTest" component={BobruiskTest} durationInFrames={TEST_TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="P1ThumbA" component={Thumb} defaultProps={{ variant: "A" as const }} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="P1ThumbB" component={Thumb} defaultProps={{ variant: "B" as const }} durationInFrames={1} fps={30} width={1920} height={1080} />
    <Composition id="BagrationPart2" component={Part2} durationInFrames={PART2_TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="BagrationPart1" component={Part1} durationInFrames={PART1_TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="BobruiskPilot" component={Pilot} durationInFrames={PILOT_TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="BobruiskProtoV3" component={ProtoV3} durationInFrames={PROTO3_TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="BobruiskProtoV2" component={ProtoV2} durationInFrames={PROTO2_TOTAL} fps={30} width={1920} height={1080} />
    <Composition id="BobruiskProto" component={Proto} durationInFrames={PROTO_TOTAL} fps={30} width={1920} height={1080} />
  </>
);
registerRoot(RootC);
