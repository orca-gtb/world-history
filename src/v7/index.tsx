import React from "react";
import { Composition, registerRoot } from "remotion";
import { HartmannV7, V7_TOTAL } from "./HartmannV7";

// v7 = v6 + siluet profil dari gambar referensi (public/silhouettes). Audio v6 dipakai ulang (timing sama).
const RootV7: React.FC = () => <Composition id="AceHartmannV7" component={HartmannV7} durationInFrames={V7_TOTAL} fps={30} width={1080} height={1920} />;
registerRoot(RootV7);
