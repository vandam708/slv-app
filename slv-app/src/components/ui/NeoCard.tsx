import { motion, useMotionValue, useSpring, useTransform, type MotionStyle } from 'framer-motion';
import { useRef, type ReactNode, type PointerEvent } from 'react';
import { cn } from '../../lib/cn';

interface NeoCardProps {
  children: ReactNode;
  className?: string;
  accent?: string;
  tilt?: boolean;
  glow?: boolean;
  style?: MotionStyle;
}

/**
 * The signature surface of the app: a soft-extruded neumorphic panel with a
 * thin accent edge and an optional subtle 3D tilt that follows the pointer.
 */
export function NeoCard({ children, className, accent, tilt = true, glow = false, style }: NeoCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [4.5, -4.5]), { stiffness: 200, damping: 18 });
  const ry = useSpring(useTransform(mx, [0, 1], [-4.5, 4.5]), { stiffness: 200, damping: 18 });

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (!tilt || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: tilt ? rx : 0, rotateY: tilt ? ry : 0, transformPerspective: 1000, ...style }}
      className={cn(
        'relative rounded-neo bg-surface p-5 shadow-neo will-change-transform',
        glow && 'shadow-neo-accent',
        className,
      )}
    >
      {accent && (
        <span
          aria-hidden
          className="absolute left-0 top-5 bottom-5 w-[3px] rounded-full"
          style={{ background: accent, boxShadow: `0 0 12px ${accent}` }}
        />
      )}
      {children}
    </motion.div>
  );
}
