const CX = 95;
const CY = 95;
const FACE = 84;
const BAND = FACE - 13;

function parseHours(hhmm: string): number | null {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h + m / 60;
}

// angle 0° points straight up (12 o'clock), increasing clockwise
function pt(angleDeg: number, r: number): [number, number] {
  const a = (angleDeg - 90) * (Math.PI / 180);
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
}

/**
 * Classic 12-hour clock face (12 up top). The sleep window is painted as a dark
 * night-sky arc whose length is strictly proportional to hours slept
 * (9 h → 270°, i.e. midnight → 9 a.m. covers three quarters of the dial).
 */
export function SleepClock({ start, end, duration }: { start: string; end: string; duration: string }) {
  const sH = parseHours(start);
  let eH = parseHours(end);
  const hasData = sH !== null && eH !== null;
  if (hasData && (eH as number) <= (sH as number)) eH = (eH as number) + 24;

  const durH = hasData ? (eH as number) - (sH as number) : 0;
  const startAngle = hasData ? (((sH as number) % 12) / 12) * 360 : 0;
  const sweep = Math.min(durH, 12) / 12 * 360;
  const endAngle = startAngle + sweep;
  const mid = startAngle + sweep / 2;

  let nightPath = '';
  let dayPath = '';
  const stars: { x: number; y: number; d: string }[] = [];
  let dayMid = 0;
  if (hasData) {
    const [nx1, ny1] = pt(startAngle, BAND);
    const [nx2, ny2] = pt(endAngle, BAND);
    const largeNight = sweep > 180 ? 1 : 0;
    nightPath = `M ${nx1} ${ny1} A ${BAND} ${BAND} 0 ${largeNight} 1 ${nx2} ${ny2}`;

    // the rest of the dial is "day": draw it white
    const daySweep = 360 - sweep;
    const [dx1, dy1] = pt(endAngle, BAND);
    const [dx2, dy2] = pt(startAngle + 360, BAND);
    const largeDay = daySweep > 180 ? 1 : 0;
    dayPath = `M ${dx1} ${dy1} A ${BAND} ${BAND} 0 ${largeDay} 1 ${dx2} ${dy2}`;
    dayMid = endAngle + daySweep / 2;

    const n = Math.max(3, Math.min(10, Math.round(durH * 1.2)));
    for (let i = 1; i < n; i++) {
      const f = startAngle + (sweep * i) / n;
      const [sx, sy] = pt(f, BAND + (i % 2 ? 7 : -6));
      stars.push({ x: sx, y: sy, d: `${(i % 4) * 0.4}s` });
    }
  }
  const moon = hasData ? pt(mid, BAND) : null;
  const sun = hasData ? pt(dayMid, BAND) : null;

  return (
    <svg width={190} height={190} viewBox="0 0 190 190" className="mx-auto">
      <defs>
        <radialGradient id="dayFace" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#28333f" />
          <stop offset="100%" stopColor="#1a2230" />
        </radialGradient>
        <linearGradient id="night" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4a3f86" />
          <stop offset="50%" stopColor="#241c54" />
          <stop offset="100%" stopColor="#0c1330" />
        </linearGradient>
      </defs>

      <circle cx={CX} cy={CY} r={FACE} fill="url(#dayFace)" stroke="#11151c" strokeWidth="2" />
      {/* empty-state band hint */}
      {!hasData && <circle cx={CX} cy={CY} r={BAND} fill="none" stroke="rgba(127,209,232,0.10)" strokeWidth="22" />}
      {/* white day arc (waking hours) */}
      {hasData && <path d={dayPath} fill="none" stroke="#f3f5fb" strokeWidth="22" strokeLinecap="butt" />}

      {/* hour ticks (12) */}
      {Array.from({ length: 12 }).map((_, h) => {
        const ang = (h / 12) * 360;
        const [x1, y1] = pt(ang, FACE - 4);
        const [x2, y2] = pt(ang, FACE - (h % 3 === 0 ? 12 : 8));
        return <line key={h} x1={x1} y1={y1} x2={x2} y2={y2} stroke={h % 3 === 0 ? '#5b6777' : '#3a4452'} strokeWidth={h % 3 === 0 ? 2 : 1} />;
      })}
      {/* cardinal labels 12 / 3 / 6 / 9 */}
      {[
        { h: 0, t: '12' },
        { h: 3, t: '3' },
        { h: 6, t: '6' },
        { h: 9, t: '9' },
      ].map(({ h, t }) => {
        const [x, y] = pt((h / 12) * 360, FACE - 22);
        return (
          <text key={t} x={x} y={y + 3} textAnchor="middle" fontSize="10" fill="#647082" fontWeight="700">
            {t}
          </text>
        );
      })}

      {hasData && (
        <>
          <path d={nightPath} fill="none" stroke="url(#night)" strokeWidth="22" strokeLinecap="round" />
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={1.3} fill="#fff" style={{ animation: 'slv-twinkle 2.4s ease-in-out infinite', animationDelay: s.d }} />
          ))}
          {sun && <circle cx={sun[0]} cy={sun[1]} r={5.5} fill="#f5d04c" style={{ filter: 'drop-shadow(0 0 7px #f5b14c)' }} />}
          {moon && (
            <g style={{ filter: 'drop-shadow(0 0 6px #b9b1ff)' }}>
              <circle cx={moon[0]} cy={moon[1]} r={6} fill="#e9e6ff" />
              <circle cx={moon[0] + 2.4} cy={moon[1] - 1.6} r={5} fill="#241c54" />
            </g>
          )}
        </>
      )}

      <text x={CX} y={CY - 2} textAnchor="middle" fontSize="16" fontWeight="800" fill="#9d7be8" fontFamily="Space Grotesk">
        {duration && duration !== '-- ч -- мин' ? duration.replace(' мин', '') : '—'}
      </text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize="9" fill="#647082">
        {hasData ? 'сна' : 'нет данных'}
      </text>
    </svg>
  );
}
