import { renderToStaticMarkup } from "react-dom/server";
import { UNITS, type UnitSpec } from "./units";
import { ANIMS, type AnimId } from "./anim";
import { UnitFigure, FIG } from "./Unit";
const wrap = (w: number, h: number, inner: JSX.Element) => `<?xml version="1.0" encoding="UTF-8"?>\n` + renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>{inner}</svg>);
export const staticSvg = (s: UnitSpec) => wrap(FIG.w, FIG.h, <UnitFigure spec={s} anim="idle" u={0} x={FIG.cx} y={FIG.gy} />);
export const stripSvg = (s: UnitSpec, a: AnimId) => { const A = ANIMS.find((x) => x.id === a)!; return wrap(FIG.w * A.frames, FIG.h, <g>{Array.from({ length: A.frames }, (_, i) => <UnitFigure key={i} spec={s} anim={a} u={A.loop ? i / A.frames : i / (A.frames - 1)} x={i * FIG.w + FIG.cx} y={FIG.gy} />)}</g>); };
export { UNITS, ANIMS, FIG };
