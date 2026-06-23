// Lightweight DOM-based juice: floating +XP text and burst particles.
// Kept outside React so it can fire from any event handler without re-renders.

let styleInjected = false;

function injectStyles() {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement('style');
  style.textContent = `
  @keyframes slv-float-xp { 0%{transform:translate(-50%,0);opacity:1} 100%{transform:translate(-50%,-46px);opacity:0} }
  @keyframes slv-particle { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(.2);opacity:0} }
  .slv-fx-xp{position:fixed;z-index:9999;pointer-events:none;font-weight:800;font-size:18px;transform:translate(-50%,0);text-shadow:0 0 10px currentColor;animation:slv-float-xp .95s ease-out forwards}
  .slv-fx-p{position:fixed;z-index:9998;pointer-events:none;width:8px;height:8px;border-radius:50%;animation:slv-particle .8s ease-out forwards}
  `;
  document.head.appendChild(style);
}

export function fireXP(x: number, y: number, amount: number, color = '#4cc9f0') {
  if (typeof document === 'undefined') return;
  injectStyles();
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  const xp = document.createElement('div');
  xp.className = 'slv-fx-xp';
  xp.textContent = `+${Math.round(amount)} XP`;
  xp.style.left = `${x}px`;
  xp.style.top = `${y - 14}px`;
  xp.style.color = color;
  document.body.appendChild(xp);
  setTimeout(() => xp.remove(), 950);

  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'slv-fx-p';
    p.style.left = `${x}px`;
    p.style.top = `${y}px`;
    p.style.background = color;
    const angle = Math.random() * Math.PI * 2;
    const dist = 28 + Math.random() * 46;
    p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}
