import React from "react";

// Glider Horsa sederhana (siluet gelap) untuk glider lain di kejauhan. Hidung = -x (arah terbang).
export const Horsa: React.FC<{ pos: [number, number, number]; yaw?: number; pitch?: number; roll?: number }> = ({ pos, yaw = 0, pitch = 0, roll = 0 }) => (
  <group position={pos} rotation={[roll, yaw, pitch]}>
    <mesh position={[0, 1.2, 0]}>
      <boxGeometry args={[15, 2.4, 2.6]} />
      <meshStandardMaterial color="#7d90b8" roughness={0.85} emissive="#2a3c62" emissiveIntensity={1.1} />
    </mesh>
    <mesh position={[-8.4, 1.1, 0]}>
      <boxGeometry args={[2.4, 2.0, 2.2]} />
      <meshStandardMaterial color="#627596" roughness={0.8} />
    </mesh>
    <mesh position={[-1, 2.9, 0]}>
      <boxGeometry args={[3.8, 0.35, 27]} />
      <meshStandardMaterial color="#4f6285" roughness={0.9} />
    </mesh>
    <mesh position={[7.2, 2.6, 0]}>
      <boxGeometry args={[2.2, 0.25, 8]} />
      <meshStandardMaterial color="#4f6285" roughness={0.9} />
    </mesh>
    <mesh position={[7.4, 3.8, 0]}>
      <boxGeometry args={[2.4, 3.2, 0.3]} />
      <meshStandardMaterial color="#4f6285" roughness={0.9} />
    </mesh>
  </group>
);
