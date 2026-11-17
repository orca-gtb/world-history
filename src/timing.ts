// Sumber tunggal timing episode (frame @30fps). Dipakai Root/Scenes dan skrip soundtrack.
export const HOOK = 100;
export const BRIEF = 330;
export const OOB_A = 330;
export const OOB_X = 220;
export const ALIVE = 560;
export const GLIDER = 300;
export const START = {
  hook: 0,
  brief: HOOK,
  oobA: HOOK + BRIEF,
  oobX: HOOK + BRIEF + OOB_A,
  alive: HOOK + BRIEF + OOB_A + OOB_X,
  glider: HOOK + BRIEF + OOB_A + OOB_X + ALIVE,
};
export const TOTAL = START.glider + GLIDER;
// adegan 3D glider: shot (frame lokal)
export const GL = { extIn: 70, extOut: 140, touch: 200 };
