import React, { useMemo } from "react";
import * as THREE from "three";

// Messerschmitt Bf 109 G (ilustratif, prosedural). 1 unit = 1 m, hidung = +x, atas = +y, kanan pilot = +z.
// Dimensi acuan: panjang ±8,9 m, bentang sayap ±9,9 m. Warna: abu-abu RLM 74/75 (atas), biru-abu RLM 76 (bawah).
const TOP = new THREE.Color("#5e6f5e");
const BOT = new THREE.Color("#a9bcc6");

// vertex color berdasarkan normal.y -> atas gelap-hijau, bawah terang (transisi halus)
const tint = (g: THREE.BufferGeometry, top = TOP, bot = BOT) => {
  g.computeVertexNormals();
  const n = g.attributes.normal;
  const col = new Float32Array(n.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < n.count; i++) {
    const t = THREE.MathUtils.smoothstep(n.getY(i), -0.45, 0.35);
    c.copy(bot).lerp(top, t);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  return g;
};

// outline (x,z) bidang horizontal -> geometri ekstrusi tipis di sumbu y
const flat = (pts: [number, number][], thick: number) => {
  const sh = new THREE.Shape();
  pts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
  const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  return tint(g);
};
const mirror = (pts: [number, number][]): [number, number][] => pts.map(([x, z]) => [x, -z] as [number, number]).reverse();

const canvasTex = (draw: (g: CanvasRenderingContext2D, s: number) => void, s = 256) => {
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const g = c.getContext("2d")!;
  draw(g, s);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  return t;
};

// ---------- decal ----------
const drawTulip = (g: CanvasRenderingContext2D, s: number) => {
  g.clearRect(0, 0, s, s);
  g.translate(s / 2, s / 2);
  const petal = (a: number, len: number, w: number) => {
    g.save(); g.rotate(a);
    g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(-w, -len * 0.4, -w * 0.7, -len, 0, -len); g.bezierCurveTo(w * 0.7, -len, w, -len * 0.4, 0, 0); g.closePath();
    g.restore();
  };
  // garis luar putih lalu isi hitam
  for (const [col, grow] of [["#f2f2ee", 14], ["#0b0c0e", 0]] as const) {
    g.fillStyle = col; g.strokeStyle = col; g.lineWidth = grow * 2; g.lineJoin = "round";
    petal(-0.5, 100 + grow, 40 + grow); g.fill(); g.stroke();
    petal(0.5, 100 + grow, 40 + grow); g.fill(); g.stroke();
    petal(0, 112 + grow, 46 + grow); g.fill(); g.stroke();
    g.beginPath(); g.rect(-5 - grow * 0.4, 10, 10 + grow * 0.8, 96); g.fill();
  }
};
const drawCross = (g: CanvasRenderingContext2D, s: number) => {
  g.clearRect(0, 0, s, s);
  g.translate(s / 2, s / 2);
  const arm = (w: number, l: number, col: string) => { g.fillStyle = col; g.fillRect(-w / 2, -l / 2, w, l); g.fillRect(-l / 2, -w / 2, l, w); };
  arm(58, 220, "#f4f4f0"); arm(40, 204, "#0d0e10");
};
const drawHeart = (g: CanvasRenderingContext2D, s: number) => {
  g.clearRect(0, 0, s, s);
  g.translate(s / 2, s / 2 + 8);
  g.fillStyle = "#f4f4f0"; g.strokeStyle = "#0d0e10"; g.lineWidth = 8;
  g.beginPath(); g.moveTo(0, 70); g.bezierCurveTo(-120, -10, -50, -90, 0, -34); g.bezierCurveTo(50, -90, 120, -10, 0, 70); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = "#8d1b1b"; g.font = "bold 58px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("USCH", 0, 2);
};
const drawNum = (g: CanvasRenderingContext2D, s: number) => {
  g.clearRect(0, 0, s, s);
  g.fillStyle = "#f4f4f0"; g.font = "bold 220px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("1", s / 2, s / 2 + 8);
};

const Decal: React.FC<{ tex: THREE.Texture; pos: [number, number, number]; size: number; side: 1 | -1; rotY?: number }> = ({ tex, pos, size, side, rotY = 0 }) => (
  <mesh position={pos} rotation={[0, (side === 1 ? 0 : Math.PI) + rotY, 0]}>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial map={tex} transparent polygonOffset polygonOffsetFactor={-4} roughness={0.7} depthWrite={false} />
  </mesh>
);

export type Bf109Props = { propAngle?: number; gear?: boolean; showTulip?: boolean; showHeart?: boolean; showNumber?: boolean; glow?: boolean };

export const Bf109: React.FC<Bf109Props> = ({ propAngle = 0, gear = true, showTulip = true, showHeart = true, showNumber = true }) => {
  const m = useMemo(() => {
    // badan: lathe dari profil (radius per posisi x)
    const prof: [number, number][] = [[-4.7, 0.04], [-4.3, 0.09], [-3.2, 0.2], [-2.0, 0.33], [-0.8, 0.5], [0.5, 0.57], [1.6, 0.54], [2.5, 0.49], [3.2, 0.45], [3.75, 0.36]];
    const lathe = new THREE.LatheGeometry(prof.map(([x, r]) => new THREE.Vector2(r, x)), 28);
    lathe.rotateZ(-Math.PI / 2);
    lathe.scale(1, 1.1, 0.78);
    tint(lathe);
    const wingR: [number, number][] = [[1.0, 0.5], [-0.15, 4.7], [-0.55, 4.95], [-1.0, 4.85], [-1.3, 4.55], [-1.3, 0.5]];
    const wR = flat(wingR, 0.13);
    const wL = flat(mirror(wingR), 0.13);
    const tailR: [number, number][] = [[-3.75, 0.25], [-4.5, 1.5], [-4.85, 1.5], [-4.6, 0.25]];
    const tR = flat(tailR, 0.06);
    const tL = flat(mirror(tailR), 0.06);
    // sirip vertikal (bidang x-y, ekstrusi tipis di z)
    const fs = new THREE.Shape();
    [[-3.3, 0.28], [-4.35, 1.55], [-4.85, 1.55], [-4.78, 0.3]].forEach(([x, y], i) => (i ? fs.lineTo(x, y) : fs.moveTo(x, y)));
    const fin = new THREE.ExtrudeGeometry(fs, { depth: 0.07, bevelEnabled: false });
    fin.translate(0, 0, -0.035);
    tint(fin, TOP, TOP);
    return { lathe, wR, wL, tR, tL, fin, tulip: canvasTex(drawTulip), cross: canvasTex(drawCross), heart: canvasTex(drawHeart), num: canvasTex(drawNum) };
  }, []);

  const blades = [0, 1, 2].map((i) => (i * Math.PI * 2) / 3);
  return (
    <group>
      <mesh geometry={m.lathe}>
        <meshStandardMaterial vertexColors roughness={0.55} metalness={0.15} />
      </mesh>
      {/* kowling depan hitam + spinner */}
      <mesh position={[3.64, 0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[0.78, 1, 0.82]}>
        <cylinderGeometry args={[0.37, 0.41, 0.36, 24]} />
        <meshStandardMaterial color="#14171a" roughness={0.5} />
      </mesh>
      <mesh position={[4.1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.27, 0.9, 20]} />
        <meshStandardMaterial color="#16181b" roughness={0.35} metalness={0.4} />
      </mesh>
      {/* benjolan senapan kowling (G-6) */}
      {[-0.17, 0.17].map((z) => (
        <mesh key={z} position={[2.95, 0.43, z]}>
          <boxGeometry args={[0.95, 0.14, 0.16]} />
          <meshStandardMaterial color={TOP} roughness={0.6} />
        </mesh>
      ))}
      {/* radiator dagu */}
      <mesh position={[2.55, -0.45, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.42]} />
        <meshStandardMaterial color={BOT} roughness={0.55} />
      </mesh>
      {/* kanopi */}
      <mesh position={[0.05, 0.6, 0]} scale={[0.95, 0.26, 0.34]}>
        <sphereGeometry args={[1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 1.8]} />
        <meshStandardMaterial color="#9fc3d6" transparent opacity={0.55} roughness={0.1} metalness={0.3} />
      </mesh>
      {[-0.7, -0.15, 0.4].map((x) => (
        <mesh key={x} position={[x, 0.7, 0]} scale={[0.035, 0.3, 0.76]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={TOP} />
        </mesh>
      ))}
      {/* sayap + dihedral kecil */}
      <group position={[0, -0.28, 0]}>
        <group rotation={[0.03, 0, 0]}>
          <mesh geometry={m.wR}>
            <meshStandardMaterial vertexColors roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
        <group rotation={[-0.03, 0, 0]}>
          <mesh geometry={m.wL}>
            <meshStandardMaterial vertexColors roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
        {/* radiator bawah sayap */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[-0.35, -0.15, s * 2.1]}>
            <boxGeometry args={[1.0, 0.2, 0.55]} />
            <meshStandardMaterial color={BOT} roughness={0.55} />
          </mesh>
        ))}
        {/* salib sayap */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[-0.25, 0.16, s * 3.4]} rotation={[-Math.PI / 2, 0, s === 1 ? 0 : Math.PI]}>
            <planeGeometry args={[1.05, 1.05]} />
            <meshStandardMaterial map={m.cross} transparent polygonOffset polygonOffsetFactor={-4} depthWrite={false} />
          </mesh>
        ))}
      </group>
      {/* ekor */}
      <mesh geometry={m.tR} position={[0, 0.3, 0]}><meshStandardMaterial vertexColors roughness={0.6} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={m.tL} position={[0, 0.3, 0]}><meshStandardMaterial vertexColors roughness={0.6} side={THREE.DoubleSide} /></mesh>
      <mesh geometry={m.fin}><meshStandardMaterial vertexColors roughness={0.6} /></mesh>
      {/* roda ekor */}
      <mesh position={[-4.2, -0.15, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 10]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      {/* roda pendarat */}
      {gear && (
        <>
          {[-1, 1].map((s) => (
            <group key={s}>
              <mesh position={[0.25, -0.7, s * 1.1]} rotation={[s * 0.32, 0, 0]}>
                <boxGeometry args={[0.16, 0.95, 0.12]} />
                <meshStandardMaterial color="#2a2f34" roughness={0.6} />
              </mesh>
              <mesh position={[0.3, -1.1, s * 1.28]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.36, 0.36, 0.18, 16]} />
                <meshStandardMaterial color="#0d0e10" roughness={0.9} />
              </mesh>
            </group>
          ))}
        </>
      )}
      {/* baling-baling */}
      <group position={[4.0, 0, 0]} rotation={[propAngle, 0, 0]}>
        {blades.map((a) => (
          <mesh key={a} rotation={[a, 0, 0]} position={[0, Math.cos(a + Math.PI / 2) * 0, 0]}>
            <boxGeometry args={[0.05, 1.5, 0.15]} />
            <meshStandardMaterial color="#1a1c1f" roughness={0.5} transparent opacity={0.7} />
          </mesh>
        ))}
      </group>
      {/* salib badan, kode, tulip, hati */}
      {([1, -1] as const).map((s) => (
        <React.Fragment key={s}>
          <Decal tex={m.cross} pos={[-2.9, 0.02, s * 0.215]} size={0.62} side={s} />
          {showNumber && <Decal tex={m.num} pos={[-1.75, 0.06, s * 0.33]} size={0.62} side={s} />}
          {showTulip && <Decal tex={m.tulip} pos={[3.08, 0.03, s * 0.36]} size={0.8} side={s} />}
        </React.Fragment>
      ))}
      {showHeart && <Decal tex={m.heart} pos={[1.0, -0.02, -0.42]} size={0.55} side={-1} />}
    </group>
  );
};
