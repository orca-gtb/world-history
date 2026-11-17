import React, { useMemo } from "react";
import * as THREE from "three";
import { random } from "remotion";

const CELL_X = 110;
const CELL_Z = 90;
const cellHash = (i: number, j: number, k: string) => random(`${k}${i}_${j}`);

// tekstur rumput/tanah: derau halus + goresan alur bajak, digambar sekali di canvas
const makeGroundTex = () => {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;
  g.fillStyle = "#808080";
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) {
    const x = random("gx" + i) * 512;
    const y = random("gy" + i) * 512;
    const v = 80 + Math.floor(random("gv" + i) * 110);
    g.fillStyle = `rgba(${v},${v},${v},${0.18 + random("ga" + i) * 0.3})`;
    g.fillRect(x, y, 1 + random("gw" + i) * 3, 1 + random("gh" + i) * 6);
  }
  g.strokeStyle = "rgba(255,255,255,0.08)";
  g.lineWidth = 2;
  for (let i = 0; i < 40; i++) {
    g.beginPath();
    g.moveTo(0, i * 13 + 4);
    g.lineTo(512, i * 13 + 4 + Math.sin(i) * 3);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(160, 90);
  t.anisotropy = 4;
  return t;
};

const FIELD = ["#3f6048", "#486040", "#5a5a3c", "#3c6046", "#3e6058", "#6a6042"];

// Medan skematis malam hari: ladang berpetak, pagar tanaman, pohon, rumah. Koridor pendaratan dibiarkan rata.
export const World: React.FC = () => {
  const tex = useMemo(() => makeGroundTex(), []);
  const { ground, hedges, trees, houses, canopy } = useMemo(() => {
    const mkGround = (x0: number, x1: number) => {
      const w = x1 - x0;
      const g = new THREE.PlaneGeometry(w, 900, Math.round(w / 10), 90);
      g.rotateX(-Math.PI / 2);
      g.translate((x0 + x1) / 2, 0, 0);
      const pos = g.attributes.position;
      const col = new Float32Array(pos.count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        const ci = Math.floor(x / CELL_X);
        const cj = Math.floor(z / CELL_Z);
        c.set(FIELD[Math.floor(cellHash(ci, cj, "f") * FIELD.length)]);
        const n = 0.85 + 0.3 * (Math.sin(x * 0.31) * Math.sin(z * 0.27) * 0.5 + 0.5);
        c.multiplyScalar(n);
        col[i * 3] = c.r;
        col[i * 3 + 1] = c.g;
        col[i * 3 + 2] = c.b;
        const corridor = Math.abs(z) < 30 && x > -20 && x < 200;
        if (!corridor) pos.setY(i, (Math.sin(x * 0.07) * Math.cos(z * 0.09) + Math.sin(x * 0.19 + z * 0.13) * 0.4) * 0.35);
      }
      g.setAttribute("color", new THREE.BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    };
    const eastG = mkGround(14, 1600);
    const westG = mkGround(-1000, -14);

    // pagar tanaman di batas petak
    const hm: THREE.Matrix4[] = [];
    for (let i = -9; i <= 14; i++) {
      for (let j = -5; j <= 4; j++) {
        const x = i * CELL_X;
        const z = j * CELL_Z;
        if (x > -14 && x < 14) continue;
        if (Math.abs(z) < 36 && x > -20 && x < 200) continue; // koridor
        if (cellHash(i, j, "hx") > 0.28) {
          const m = new THREE.Matrix4().compose(new THREE.Vector3(x + CELL_X / 2, 1.1, z), new THREE.Quaternion(), new THREE.Vector3(CELL_X, 2.4, 2.4));
          hm.push(m);
        }
        if (cellHash(i, j, "hz") > 0.4) {
          const m = new THREE.Matrix4().compose(new THREE.Vector3(x, 1.1, z + CELL_Z / 2), new THREE.Quaternion(), new THREE.Vector3(2.4, 2.4, CELL_Z));
          hm.push(m);
        }
      }
    }
    const hedgeMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#0b140d", roughness: 1 }), hm.length);
    hm.forEach((m, i) => hedgeMesh.setMatrixAt(i, m));

    // pohon
    const trunkCount = 420;
    const treeMesh = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 2, 7), new THREE.MeshStandardMaterial({ color: "#08120b", roughness: 1 }), trunkCount);
    for (let i = 0; i < trunkCount; i++) {
      const x = -900 + random("tx" + i) * 2400;
      const z = -420 + random("tz" + i) * 840;
      if (Math.abs(z) < 40 && x > -20 && x < 210) {
        treeMesh.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
        continue;
      }
      if (x > -22 && x < 22) {
        treeMesh.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
        continue;
      }
      const s = 4 + random("ts" + i) * 6;
      treeMesh.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, s, z), new THREE.Quaternion(), new THREE.Vector3(s * 0.55, s, s * 0.55)));
    }

    const canopy = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: "#0c1a10", roughness: 1 }), 260);
    for (let i = 0; i < 260; i++) {
      const x = -900 + random("cx" + i) * 2400;
      const z = -420 + random("cz" + i) * 840;
      if ((Math.abs(z) < 40 && x > -20 && x < 210) || (x > -22 && x < 22)) {
        canopy.setMatrixAt(i, new THREE.Matrix4().makeScale(0, 0, 0));
        continue;
      }
      const s2 = 4 + random("cs" + i) * 5;
      canopy.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, s2 * 1.5, z), new THREE.Quaternion(), new THREE.Vector3(s2 * 1.1, s2 * 0.9, s2 * 1.1)));
    }

    // desa di sisi barat kanal (siluet)
    const houseMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: "#161c27", roughness: 1 }), 26);
    for (let i = 0; i < 26; i++) {
      const x = -60 - random("hx" + i) * 260;
      const z = -140 + random("hz" + i) * 280;
      const w = 9 + random("hw" + i) * 8;
      const d = 7 + random("hd" + i) * 6;
      const h = 6 + random("hh" + i) * 4;
      houseMesh.setMatrixAt(i, new THREE.Matrix4().compose(new THREE.Vector3(x, h / 2, z), new THREE.Quaternion(), new THREE.Vector3(w, h, d)));
    }
    return { ground: [eastG, westG], hedges: hedgeMesh, trees: treeMesh, houses: houseMesh, canopy };
  }, []);

  return (
    <>
      {ground.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial vertexColors map={tex} roughness={1} />
        </mesh>
      ))}
      <primitive object={hedges} />
      <primitive object={trees} />
      <primitive object={canopy} />
      <primitive object={houses} />
    </>
  );
};

// Jembatan angkat (bascule) skematis + kanal. Ilustrasi, bukan model akurat.
export const BridgeAndCanal: React.FC<{ frame: number }> = ({ frame }) => (
  <group>
    {/* air kanal */}
    <mesh position={[0, -2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[28, 1000]} />
      <meshStandardMaterial color="#16304a" roughness={0.2} metalness={0.5} emissive="#3f78b0" emissiveIntensity={1.3} />
    </mesh>
    {/* kilau air */}
    {Array.from({ length: 16 }).map((_, i) => {
      const z = -400 + ((i * 53 + frame * 0.6) % 800);
      return (
        <mesh key={i} position={[(random("gx" + i) - 0.5) * 20, -2.1, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.8 + random("gw" + i) * 3, 0.25]} />
          <meshBasicMaterial color="#9fc4ee" transparent opacity={0.3} depthWrite={false} />
        </mesh>
      );
    })}
    {/* tebing kanal */}
    {[-1, 1].map((s) => (
      <mesh key={s} position={[s * 14.3, -1.2, 0]}>
        <boxGeometry args={[0.8, 2.6, 1000]} />
        <meshStandardMaterial color="#0c1018" roughness={1} />
      </mesh>
    ))}
    {/* dek jembatan */}
    <mesh position={[0, 0.25, 0]}>
      <boxGeometry args={[29, 0.7, 7.4]} />
      <meshStandardMaterial color="#4a5878" roughness={0.9} />
    </mesh>
    {/* rangka sisi */}
    {[-1, 1].map((s) => (
      <group key={s} position={[0, 0, s * 3.9]}>
        <mesh position={[0, 2.4, 0]}>
          <boxGeometry args={[29, 0.35, 0.35]} />
          <meshStandardMaterial color="#52668c" roughness={0.8} />
        </mesh>
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} position={[-12.5 + i * 2.5, 1.3, 0]} rotation={[0, 0, (i % 2 ? 1 : -1) * 0.6]}>
            <boxGeometry args={[0.25, 2.7, 0.25]} />
            <meshStandardMaterial color="#52668c" roughness={0.8} />
          </mesh>
        ))}
      </group>
    ))}
    {/* menara kontra-bobot (sisi barat) */}
    <mesh position={[-15.5, 5.5, 0]}>
      <boxGeometry args={[4.2, 11, 10.5]} />
      <meshStandardMaterial color="#3a4864" roughness={0.9} />
    </mesh>
    {/* jalan penghubung */}
    <mesh position={[75, 0.03, 0]}>
      <boxGeometry args={[130, 0.05, 7]} />
      <meshStandardMaterial color="#34383f" roughness={1} />
    </mesh>
    <mesh position={[-90, 0.03, 0]}>
      <boxGeometry args={[150, 0.05, 7]} />
      <meshStandardMaterial color="#34383f" roughness={1} />
    </mesh>
  </group>
);

export const StarSky: React.FC = () => {
  const stars = useMemo(() => {
    const n = 520;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = random("sa" + i) * Math.PI * 2;
      const ph = Math.acos(0.06 + random("sb" + i) * 0.94);
      arr[i * 3] = Math.sin(ph) * Math.cos(th) * 1700;
      arr[i * 3 + 1] = Math.cos(ph) * 1700;
      arr[i * 3 + 2] = Math.sin(ph) * Math.sin(th) * 1700;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: `varying vec3 vP; void main(){ float y = clamp(vP.y, 0.0, 1.0); vec3 hor = vec3(0.17, 0.23, 0.34); vec3 top = vec3(0.02, 0.035, 0.07); vec3 c = mix(hor, top, pow(y, 0.55)); c = mix(vec3(0.03,0.04,0.06), c, smoothstep(-0.05, 0.03, vP.y)); gl_FragColor = vec4(c, 1.0); }`,
      }),
    [],
  );
  return (
    <>
      <mesh scale={1800} material={mat}>
        <sphereGeometry args={[1, 24, 16]} />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial color="#cfd8ee" size={2.2} sizeAttenuation={false} transparent opacity={0.8} depthWrite={false} fog={false} />
      </points>
    </>
  );
};
