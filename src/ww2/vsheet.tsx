
import { renderToStaticMarkup } from "react-dom/server";
import { VEHICLES } from "./vehicles";
export function vsheet(): string {
  const cw = 330, ch = 200, cols = 4, rows = Math.ceil(VEHICLES.length / cols), W = cw * cols, H = ch * rows;
  return renderToStaticMarkup(<svg xmlns="http://www.w3.org/2000/svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}><rect width={W} height={H} fill="#e9dfc4" />
    {VEHICLES.map((v, i) => { const x = (i % cols) * cw + cw / 2, y = Math.floor(i / cols) * ch + 160; return <g key={v.id}><text x={x} y={y + 30} textAnchor="middle" fontFamily="Arial" fontSize={13} fontWeight={700} fill="#3a2f1d">{v.name}</text><g transform={`translate(${x},${y})`}>{v.draw("#14110e")}</g></g>; })}</svg>);
}
