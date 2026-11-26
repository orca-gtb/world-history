import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { UNITS, type UnitSpec } from "./units";
import { ANIMS, type AnimId } from "./anim";
import { UnitFigure, FIG } from "./Unit";
import { VEHICLES, type VDef } from "./vehicles";
const wrap = (w: number, h: number, inner: React.ReactElement) => `<?xml version="1.0" encoding="UTF-8"?>\n` + renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>{inner}</svg>);
export const staticSvg = (s: UnitSpec) => wrap(FIG.w, FIG.h, <UnitFigure spec={s} anim="idle" u={0} x={FIG.cx} y={FIG.gy} />);
export const stripSvg = (s: UnitSpec, a: AnimId) => { const A = ANIMS.find((x) => x.id === a)!; return wrap(FIG.w * A.frames, FIG.h, <g>{Array.from({ length: A.frames }, (_, i) => <UnitFigure key={i} spec={s} anim={a} u={A.loop ? i / A.frames : i / (A.frames - 1)} x={i * FIG.w + FIG.cx} y={FIG.gy} />)}</g>); };
export { UNITS, ANIMS, FIG };

export const VCELL = { w: 460, h: 230, cx: 200, gy: 205 };
export const vehicleSvg = (v: VDef) => wrap(VCELL.w, VCELL.h, <g transform={`translate(${VCELL.cx},${VCELL.gy})`}>{v.draw("#14110e")}</g>);
export { VEHICLES };
