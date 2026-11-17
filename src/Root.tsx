import React from "react";
import { AbsoluteFill, Composition, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { GLIDER, GliderLanding } from "./three/GliderLanding";
import { LightLeak } from "./kit/Cine";
import { AC, AceBoard, AceHook, AceBlueprint, AceOutro, AceSpot } from "./aces/AceScenes";
import { Briefing, Hook, MapAlive, OobAllied, OobAxis } from "./Scenes";
import { ALIVE, BRIEF, HOOK, OOB_A, OOB_X } from "./timing";

const Episode: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("audio/soundtrack.wav")} />
    <Sequence from={0} durationInFrames={HOOK}><Hook /></Sequence>
    <Sequence from={HOOK} durationInFrames={BRIEF}><Briefing /></Sequence>
    <Sequence from={HOOK + BRIEF} durationInFrames={OOB_A}><OobAllied /></Sequence>
    <Sequence from={HOOK + BRIEF + OOB_A} durationInFrames={OOB_X}><OobAxis /></Sequence>
    <Sequence from={HOOK + BRIEF + OOB_A + OOB_X} durationInFrames={ALIVE}><MapAlive /></Sequence>
    <Sequence from={HOOK + BRIEF + OOB_A + OOB_X + ALIVE} durationInFrames={GLIDER} premountFor={30}><GliderLanding /></Sequence>
  </AbsoluteFill>
);

const AceEpisode: React.FC = () => (
  <AbsoluteFill>
    <Audio src={staticFile("audio/aces.wav")} />
    <Sequence from={0} durationInFrames={AC.HOOK}><AceHook /></Sequence>
    <Sequence from={AC.HOOK} durationInFrames={AC.BOARD}><AceBoard /></Sequence>
    <Sequence from={AC.HOOK + AC.BOARD} durationInFrames={AC.SPOT}><AceSpot /></Sequence>
    <Sequence from={AC.HOOK + AC.BOARD + AC.SPOT} durationInFrames={AC.MODEL} premountFor={30}><AceBlueprint /></Sequence>
    <Sequence from={AC.HOOK + AC.BOARD + AC.SPOT + AC.MODEL} durationInFrames={AC.OUT}><AceOutro /></Sequence>
    {/* light leak di setiap titik potong (dipusatkan: mulai 16 frame sebelum cut) */}
    {[AC.HOOK, AC.HOOK + AC.BOARD, AC.HOOK + AC.BOARD + AC.SPOT, AC.HOOK + AC.BOARD + AC.SPOT + AC.MODEL].map((cut, i) => (
      <Sequence key={cut} from={cut - 16} durationInFrames={32}><LightLeak dir={i % 2 ? -1 : 1} seed={i} /></Sequence>
    ))}
  </AbsoluteFill>
);

export const Root: React.FC = () => (
  <>
  <Composition id="AceHartmann" component={AceEpisode} durationInFrames={AC.HOOK + AC.BOARD + AC.SPOT + AC.MODEL + AC.OUT} fps={30} width={1080} height={1920} />
  <Composition id="GliderLanding" component={GliderLanding} durationInFrames={GLIDER} fps={30} width={1080} height={1920} />
  <Composition id="PegasusBridge" component={Episode} durationInFrames={HOOK + BRIEF + OOB_A + OOB_X + ALIVE + GLIDER} fps={30} width={1080} height={1920} />
  </>
);
