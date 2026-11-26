import React from "react";
import type { V } from "./math";
// Senjata v2: koordinat lokal cm, asal = pelat popor, +x ke moncong, y ke bawah. TERPISAH dari rig tubuh (rig2.WD menyimpan titik pegang).
const poly = (p: V[]) => "M" + p.map((q) => q.join(",")).join(" L") + " Z";
const R = (x: number, y: number, w: number, h: number, r = 0.6) => <rect x={x} y={y} width={w} height={h} rx={r} />;
export const WEAPON_ART: Record<string, (f: string, hi: string) => React.ReactNode> = {
  garand: (f, hi) => <g fill={f}>
    <path d={poly([[0, -3], [10, -2.4], [26, -1], [31, -3.6], [58, -3.6], [58, -2.6], [92, -2.6], [92, -1.7], [109, -1.5], [109, 1.4], [92, 1.6], [92, 3.4], [58, 3.4], [45, 4], [41, 9.5], [31, 9.5], [30, 4.6], [22, 5.6], [10, 9.8], [0, 11.5]])} />
    {R(103.5, -5.4, 2.6, 4, 0.4)}<path d="M33,-3.6 L33,-6 L36,-6 L36,-3.6 Z" /><path d={`M31,5 Q36,12 42,5`} fill="none" stroke={f} strokeWidth={1.3} />
    <path d="M2,-2.6 L26,-0.9 M58,-3.2 L92,-2.3" stroke={hi} strokeWidth={0.6} opacity={0.55} fill="none" />
  </g>,
  kar98k: (f, hi) => <g fill={f}>
    <path d={poly([[0, -2.5], [12, -2], [26, -0.5], [30, -3.5], [56, -3.8], [62, -3.2], [86, -3], [88, -1.5], [111, -1.4], [111, 1.2], [88, 1.4], [86, 3.2], [60, 3.4], [44, 4.2], [42, 8.4], [33, 8.4], [31, 4.6], [22, 6], [11, 10.5], [0, 11.5]])} />
    <path d="M39,-3.6 L41.5,-6.4" stroke={f} strokeWidth={1.6} /><circle cx={42} cy={-7.2} r={2} />{R(104, -4.6, 3.4, 3.4, 0.5)}
    <path d="M2,-2.2 L26,-0.4 M62,-3.4 L86,-3.1" stroke={hi} strokeWidth={0.6} opacity={0.55} fill="none" />
  </g>,
  mosin: (f, hi) => <g fill={f}>
    <path d={poly([[0, -2.5], [12, -2], [28, -0.5], [32, -3.4], [58, -3.7], [64, -3.1], [96, -2.9], [98, -1.5], [123, -1.4], [123, 1.2], [98, 1.5], [96, 3.2], [62, 3.4], [46, 4.2], [44, 8.2], [35, 8.2], [33, 4.6], [24, 6], [12, 10.5], [0, 11.5]])} />
    <path d="M41,-3.6 L44,-6.8" stroke={f} strokeWidth={1.6} /><circle cx={44.6} cy={-7.6} r={2} />{R(116, -4.8, 3.2, 3.4, 0.5)}
    <path d="M122,-0.4 L163,-0.2 L122,1 Z" /><path d="M2,-2.2 L28,-0.4 M64,-3.2 L96,-2.9" stroke={hi} strokeWidth={0.6} opacity={0.55} fill="none" />
  </g>,
  ppsh: (f, hi) => <g fill={f}>
    <path d={poly([[0, -1.2], [12, -3.6], [28, -4.6], [28, 4], [21, 5], [14, 9], [0, 10.5]])} />{R(28, -5.4, 44, 9.4, 1.4)}{R(72, -3.6, 13, 6.4, 0.8)}
    <path d={poly([[28, 4], [40, 4], [38, 9], [30, 9]])} /><circle cx={53} cy={14.4} r={9.4} /><rect x={48} y={3} width={10} height={6} />
    <path d="M30,-4.6 L70,-4.6" stroke={hi} strokeWidth={0.6} opacity={0.55} /><circle cx={53} cy={14.4} r={6.2} fill="none" stroke={hi} strokeWidth={0.5} opacity={0.4} />
  </g>,
  thompson: (f, hi) => <g fill={f}>
    <path d={poly([[0, -1], [14, -3], [28, -4], [28, 3.5], [20, 5], [12, 9], [0, 10]])} />{R(28, -5, 42, 8.6, 1.2)}{R(68, -4.2, 14, 6, 0.8)}
    <path d={poly([[36, 3.6], [40, 3.6], [40.6, 23], [35.4, 23]])} /><path d={poly([[52, 3.6], [57, 3.6], [57, 14], [52, 14]])} /><path d="M30,-4.8 L68,-4.8" stroke={hi} strokeWidth={0.6} opacity={0.55} />
  </g>,
  mg42: (f, hi) => <g fill={f}>
    <path d={poly([[0, -2.6], [14, -4], [22, -4], [22, 5], [16, 8], [8, 12], [0, 10]])} />{R(22, -8, 38, 13, 1.6)}{R(60, -5.4, 52, 8.4, 0.8)}{R(112, -4.4, 8, 6.2, 0.8)}
    <path d="M116,-6.4 L121,-6.4 L121,-4.4 L116,-4.4 Z" /><path d="M24,5 L30,5 L28,16 L22,16 Z" /><path d={poly([[44, -8], [50, -10.5], [58, -10.5], [60, -8]])} />
    <path d="M34,-8.4 L56,-8.4" stroke={hi} strokeWidth={0.7} opacity={0.55} /><path d="M62,-5.4 L110,-5.4" stroke={hi} strokeWidth={0.5} opacity={0.4} />
  </g>,
};
/** Bipod MG: kaki dari engsel di laras menuju tanah/parapet (y lokal tanah dihitung scene) */
export const bipod = (f: string, at: number, dx: number, dy: number) => <g stroke={f} strokeWidth={1.5} strokeLinecap="round" fill="none"><path d={`M${at},3 L${at + dx + 7},${dy}`} /><path d={`M${at},3 L${at + dx - 7},${dy}`} /></g>;
