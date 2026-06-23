import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Icosahedron } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import type { Mesh } from 'three';

export interface OrbProps {
  color: string;
  /** 0..1 — drives glow strength, distortion and rotation speed */
  intensity?: number;
  size?: number;
  wireOverlay?: boolean;
}

function OrbMesh({ color, intensity = 0.6, wireOverlay = true }: OrbProps) {
  const inner = useRef<Mesh>(null);
  const wire = useRef<Mesh>(null);

  useFrame((_, delta) => {
    const s = 0.15 + intensity * 0.5;
    if (inner.current) inner.current.rotation.y += delta * s;
    if (wire.current) {
      wire.current.rotation.y -= delta * s * 0.6;
      wire.current.rotation.x += delta * s * 0.3;
    }
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={0.6}>
      <Icosahedron ref={inner} args={[1, 6]} scale={1}>
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35 + intensity * 0.9}
          roughness={0.25}
          metalness={0.55}
          distort={0.22 + intensity * 0.3}
          speed={1.2 + intensity * 2.4}
        />
      </Icosahedron>
      {wireOverlay && (
        <Icosahedron ref={wire} args={[1, 1]} scale={1.32}>
          <meshBasicMaterial color={color} wireframe transparent opacity={0.18 + intensity * 0.25} />
        </Icosahedron>
      )}
    </Float>
  );
}

/** Self-contained WebGL canvas hosting the reactive orb. Perf-guarded with capped dpr. */
export default function OrbCanvas({ color, intensity = 0.6, size = 160, wireOverlay = true }: OrbProps) {
  return (
    <div style={{ width: size, height: size }} className="select-none">
      <Canvas
        dpr={[1, 1.8]}
        camera={{ position: [0, 0, 3.4], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={2.2} color={color} />
        <pointLight position={[-3, -2, -2]} intensity={1.1} color="#ffffff" />
        <Suspense fallback={null}>
          <OrbMesh color={color} intensity={intensity} wireOverlay={wireOverlay} />
        </Suspense>
      </Canvas>
    </div>
  );
}
