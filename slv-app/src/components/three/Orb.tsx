import { lazy, Suspense } from 'react';
import type { OrbProps } from './OrbCanvas';

const OrbCanvas = lazy(() => import('./OrbCanvas'));

/** Lazy boundary so the Three.js bundle only loads when an orb actually renders. */
export function Orb(props: OrbProps) {
  const size = props.size ?? 160;
  return (
    <Suspense
      fallback={
        <div style={{ width: size, height: size }} className="grid place-items-center">
          <div
            className="h-1/2 w-1/2 animate-pulse-soft rounded-full"
            style={{ background: `radial-gradient(circle, ${props.color}55, transparent 70%)` }}
          />
        </div>
      }
    >
      <OrbCanvas {...props} />
    </Suspense>
  );
}
