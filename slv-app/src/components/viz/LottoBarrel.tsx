import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import type { Task } from '../../domain/config';

const LOTTO = ['#FF6B6B', '#4DABF7', '#51CF66', '#FFD43B', '#FF922B', '#CC5DE8', '#22B8CF', '#FF8787', '#94D82D', '#FAA2C1', '#9775FA', '#63E6BE', '#FFA94D', '#74C0FC'];
const SIZE = 208;
const CENTER = SIZE / 2;
const BALL = 32;

export interface BarrelHandle {
  spin: () => void;
}

function ballBg(color: string) {
  return `radial-gradient(circle at 34% 26%, rgba(255,255,255,0.9), ${color} 50%, ${color}bb 100%)`;
}

function norm(d: number) {
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

interface Slot {
  x: number;
  y: number;
  rot: number;
  scale: number;
}
interface Model {
  theta: number;
  orbitR: number;
  pile: Slot;
}

// Build a believable heap: pyramid rows nestling from the bottom of the round
// drum, each ball jittered in position / rotation / size so it reads as a real
// pile of balls in 3-D space rather than a flat grid.
function buildModels(n: number): Model[] {
  const spacing = 23;
  const rowH = 19;
  const baseY = 58;
  let perRow = Math.min(5, Math.max(2, Math.round(Math.sqrt(n) + 1)));
  const counts: number[] = [];
  let rem = n;
  while (rem > 0) {
    const c = Math.min(perRow, rem);
    counts.push(c);
    rem -= c;
    perRow = Math.max(1, perRow - 1);
  }
  const out: Model[] = [];
  counts.forEach((count, r) => {
    const w = (count - 1) * spacing;
    for (let c = 0; c < count; c++) {
      const idx = out.length;
      const s1 = ((idx * 2654435761) % 1000) / 1000;
      const s2 = ((idx * 40503 + 13) % 1000) / 1000;
      const x = c * spacing - w / 2 + (s1 - 0.5) * 8;
      const curve = (x * x) / 230; // balls near the curved walls sit higher
      const y = baseY - r * rowH - curve + (s2 - 0.5) * 5;
      out.push({
        theta: (idx * 360) / Math.max(1, n),
        orbitR: 32 + (idx % 3) * 20,
        pile: { x, y, rot: (s1 - 0.5) * 30, scale: 1.12 - r * 0.06 + (s2 - 0.45) * 0.12 },
      });
    }
  });
  return out;
}

interface Props {
  tasks: Task[];
  result: Task | null;
  onResult: (task: Task) => void;
}

/**
 * Interactive bingo/lotto blower.
 * - idle: balls rest in a realistic 3-D heap at the bottom
 * - spin(): balls lift and swirl
 * - the user can grab the drum (mouse / touch) and keep spinning it
 * - when momentum decays to a stop, a ball is drawn and pops to the centre
 */
export const LottoBarrel = forwardRef<BarrelHandle, Props>(function LottoBarrel({ tasks, result, onResult }, ref) {
  const n = tasks.length;
  const ballEls = useRef<(HTMLDivElement | null)[]>([]);
  const drumRef = useRef<HTMLDivElement>(null);

  const model = useMemo(() => buildModels(n), [n]);

  const phase = useRef<'idle' | 'spin'>('idle');
  const phi = useRef(0);
  const vel = useRef(0);
  const dragging = useRef(false);
  const lastAng = useRef(0);
  const cur = useRef<Slot[]>(model.map((m) => ({ ...m.pile })));
  const resultRef = useRef<Task | null>(result);
  resultRef.current = result;

  useImperativeHandle(ref, () => ({
    spin() {
      if (!n || phase.current === 'spin') return;
      phase.current = 'spin';
      vel.current = 13;
    },
  }));

  useEffect(() => {
    cur.current = model.map((m) => ({ ...m.pile }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const t = performance.now() / 1000;
      const spinning = phase.current === 'spin';

      if (spinning) {
        if (!dragging.current) {
          phi.current += vel.current;
          vel.current *= 0.985;
        }
        if (!dragging.current && Math.abs(vel.current) < 0.5) {
          phase.current = 'idle';
          vel.current = 0;
          if (n) onResult(tasks[Math.floor(Math.random() * n)]);
        }
      }

      for (let i = 0; i < n; i++) {
        const el = ballEls.current[i];
        const c = cur.current[i];
        const m = model[i];
        if (!el || !c || !m) continue;
        if (spinning) {
          const ang = m.theta + phi.current * (1 + ((i % 3) - 1) * 0.05);
          const a = ((ang - 90) * Math.PI) / 180;
          const tx = Math.cos(a) * m.orbitR + Math.sin(t * 3 + i) * 4;
          const ty = Math.sin(a) * m.orbitR + Math.cos(t * 2.3 + i * 1.7) * 4;
          c.x += (tx - c.x) * 0.5;
          c.y += (ty - c.y) * 0.5;
          c.rot += 5 + Math.abs(vel.current) * 0.4;
          c.scale += (1 - c.scale) * 0.2;
        } else {
          c.x += (m.pile.x - c.x) * 0.14;
          c.y += (m.pile.y - c.y) * 0.14;
          c.rot += norm(m.pile.rot - c.rot) * 0.14;
          c.scale += (m.pile.scale - c.scale) * 0.14;
        }
        el.style.transform = `translate(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px) rotate(${c.rot.toFixed(1)}deg) scale(${c.scale.toFixed(3)})`;
        el.style.zIndex = String(Math.round(160 + c.y));
        el.style.opacity = !spinning && resultRef.current ? '0.16' : '1';
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  function pointerAngle(e: React.PointerEvent) {
    const r = drumRef.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  }
  function onDown(e: React.PointerEvent) {
    if (phase.current !== 'spin') return;
    dragging.current = true;
    lastAng.current = pointerAngle(e);
    drumRef.current?.setPointerCapture(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const a = pointerAngle(e);
    const d = norm(a - lastAng.current);
    phi.current += d;
    vel.current = d * 0.85 + vel.current * 0.15;
    lastAng.current = a;
  }
  function onUp() {
    dragging.current = false;
  }

  const winnerColor = result ? LOTTO[Math.max(0, tasks.findIndex((t) => t.id === result.id)) % LOTTO.length] : '#FFD43B';

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <div className="pointer-events-none absolute inset-0 rounded-full" style={{ boxShadow: '0 0 0 1px rgba(245,208,76,0.25)' }} />

      <div
        ref={drumRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="absolute inset-0 overflow-hidden rounded-full bg-sunken shadow-neo-inset"
        style={{ touchAction: 'none', cursor: result ? 'default' : 'grab' }}
      >
        {/* top glass sheen */}
        <div className="pointer-events-none absolute inset-0 z-[400] rounded-full" style={{ background: 'radial-gradient(circle at 36% 24%, rgba(255,255,255,0.14), transparent 40%)' }} />
        {/* grounding shadow at the bottom so the heap sits in space */}
        <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 42% at 50% 98%, rgba(0,0,0,0.55), transparent 72%)' }} />

        {n === 0 && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center text-sm font-semibold text-fizz">
            Добавь 5-минутки в Редакторе
          </div>
        )}

        {tasks.map((task, i) => {
          const color = LOTTO[i % LOTTO.length];
          const p = model[i].pile;
          return (
            <div
              key={task.id}
              ref={(el) => {
                ballEls.current[i] = el;
              }}
              className="absolute grid select-none place-items-center rounded-full text-[12px] font-extrabold"
              style={{
                left: CENTER - BALL / 2,
                top: CENTER - BALL / 2,
                width: BALL,
                height: BALL,
                background: ballBg(color),
                color: '#22160a',
                boxShadow: '0 5px 9px rgba(0,0,0,0.5), inset 0 -4px 6px rgba(0,0,0,0.28), inset 0 3px 5px rgba(255,255,255,0.4)',
                willChange: 'transform',
                transform: `translate(${p.x}px, ${p.y}px) rotate(${p.rot}deg) scale(${p.scale})`,
                zIndex: Math.round(160 + p.y),
              }}
            >
              {i + 1}
            </div>
          );
        })}
      </div>

      {result && (
        <motion.div
          initial={{ scale: 0.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 13 }}
          className="pointer-events-none absolute z-[500] grid place-items-center rounded-full text-center"
          style={{
            left: CENTER - 56,
            top: CENTER - 56,
            width: 112,
            height: 112,
            background: ballBg(winnerColor),
            color: '#22160a',
            boxShadow: `0 12px 28px -4px ${winnerColor}, inset 0 6px 14px rgba(255,255,255,0.5), inset 0 -7px 14px rgba(0,0,0,0.28)`,
          }}
        >
          <span className="px-2 text-[12.5px] font-extrabold leading-tight">{result.text}</span>
        </motion.div>
      )}
    </div>
  );
});
