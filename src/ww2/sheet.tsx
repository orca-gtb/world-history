
import { renderToStaticMarkup } from "react-dom/server";
import { UNITS, type Faction } from "./units";
import { ANIMS, type AnimId } from "./anim";
import { UnitFigure, FIG } from "./Unit";
const PICK: Record<AnimId, number> = { idle: 0, walk: 2, run: 2, advance: 2, crouch: 0, aim: 0, fire: 0, reload: 3, hit: 3, fall: 6 };
export function sheet(f: Faction): string {
  const us = UNITS.filter((u) => u.faction === f), C = 0.5, cw = FIG.w * C, ch = FIG.h * C, L = 150;
  const W = L + ANIMS.length * cw, H = 30 + us.length * ch;
  return renderToStaticMarkup(
    <svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect width={W} height={H} fill="#e9dfc4" />
      {ANIMS.map((a, i) => <text key={a.id} x={L + i * cw + cw / 2} y={20} textAnchor="middle" fontFamily="Arial" fontSize={14} fontWeight={700} fill="#3a2f1d">{a.id.toUpperCase()}</text>)}
      {us.map((u, r) => (
        <g key={u.id}>
          <text x={8} y={30 + r * ch + ch / 2} fontFamily="Arial" fontSize={12} fontWeight={700} fill="#3a2f1d">{u.name}</text>
          <line x1={0} x2={W} y1={30 + (r + 1) * ch} y2={30 + (r + 1) * ch} stroke="#cdbf9b" />
          {ANIMS.map((a, i) => { const fr = PICK[a.id], uu = a.loop ? fr / a.frames : fr / (a.frames - 1); return <UnitFigure key={a.id} spec={u} anim={a.id} u={uu} x={L + i * cw + FIG.cx * C} y={30 + r * ch + FIG.gy * C} s={C} />; })}
        </g>))}
    </svg>);
}
