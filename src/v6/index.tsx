import React from "react";
import { Composition, registerRoot } from "remotion";
import { HartmannV6, V6_TOTAL } from "./HartmannV6";

// v6: tanpa framing "credited", zoom hanya momen penting, siluet profil pesawat, penutup timeline.
const RootV6: React.FC = () => <Composition id="AceHartmannV6" component={HartmannV6} durationInFrames={V6_TOTAL} fps={30} width={1080} height={1920} />;
registerRoot(RootV6);
