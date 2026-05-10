(function () {
    function createSleepPanel(options = {}) {
        const startEl = document.getElementById(options.startId || 'sleepStart');
        const endEl = document.getElementById(options.endId || 'sleepEnd');
        const resultEl = document.getElementById(options.resultId || 'sleepResultDisplay');
        const cardEl = document.querySelector(options.cardSelector || '.dash-sleep-card');
        let dialEl = null;
        let arcEl = null;
        let startHandleEl = null;
        let endHandleEl = null;

        function timeToHours(value) {
            if (!value || !String(value).includes(':')) return null;
            const [hours, minutes] = String(value).split(':').map(Number);
            if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
            return hours + minutes / 60;
        }

        function formatDuration(start, end) {
            const startHours = timeToHours(start);
            const endHours = timeToHours(end);
            if (startHours === null || endHours === null) return '-- ч -- мин';

            let diff = endHours - startHours;
            if (diff < 0) diff += 24;
            const hours = Math.floor(diff);
            const minutes = Math.round((diff - hours) * 60);
            return `${hours} ч ${minutes} мин`;
        }

        function polarPosition(hours, radius = 50) {
            const angle = (hours / 24) * 360 - 90;
            const rad = angle * Math.PI / 180;
            return {
                x: 50 + Math.cos(rad) * radius,
                y: 50 + Math.sin(rad) * radius
            };
        }

        function buildNightGradient(start, end) {
            const startHours = timeToHours(start);
            const endHours = timeToHours(end);
            if (startHours === null || endHours === null || start === end) {
                return 'conic-gradient(from -90deg, rgba(245,248,255,.92) 0deg 360deg)';
            }

            const startDeg = (startHours / 24) * 360;
            const endDeg = (endHours / 24) * 360;
            const day = 'rgba(244,248,255,.93)';
            const nightA = '#18295f';
            const nightB = '#0b5363';

            if (startDeg <= endDeg) {
                return `conic-gradient(from -90deg, ${day} 0deg ${startDeg}deg, ${nightA} ${startDeg}deg, ${nightB} ${endDeg}deg, ${day} ${endDeg}deg 360deg)`;
            }

            return `conic-gradient(from -90deg, ${nightB} 0deg ${endDeg}deg, ${day} ${endDeg}deg ${startDeg}deg, ${nightA} ${startDeg}deg 360deg)`;
        }

        function ensureDial() {
            if (!cardEl || dialEl) return;

            const labels = [24, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]
                .map((label) => {
                    const hours = label === 24 ? 0 : label;
                    const pos = polarPosition(hours, 57);
                    return `<span class="sleep-clock-label" style="left:${pos.x}%; top:${pos.y}%">${label}</span>`;
                })
                .join('');

            const ticks = Array.from({ length: 24 }, (_, index) => {
                const pos = polarPosition(index, 43);
                const rotation = (index / 24) * 360;
                return `<span class="sleep-clock-tick" style="left:${pos.x}%; top:${pos.y}%; transform:translate(-50%, -50%) rotate(${rotation}deg)"></span>`;
            }).join('');

            const shell = document.createElement('div');
            shell.className = 'sleep-dial-shell';
            shell.innerHTML = `
                <div class="sleep-dial">
                    <div class="sleep-dial-face">
                        <div class="sleep-day-symbol">☀️</div>
                        <div class="sleep-night-symbol">🌙</div>
                        <div class="sleep-stars">✦ · ✧</div>
                    </div>
                    ${labels}
                    ${ticks}
                    <span class="sleep-handle sleep-handle-start" title="Лёг"></span>
                    <span class="sleep-handle sleep-handle-end" title="Встал"></span>
                </div>
            `;

            const inputs = cardEl.querySelector('.sleep-inputs');
            if (inputs) cardEl.insertBefore(shell, inputs);
            else cardEl.appendChild(shell);

            dialEl = shell.querySelector('.sleep-dial');
            arcEl = shell.querySelector('.sleep-dial-face');
            startHandleEl = shell.querySelector('.sleep-handle-start');
            endHandleEl = shell.querySelector('.sleep-handle-end');
        }

        function renderDial(start, end) {
            ensureDial();
            if (!dialEl || !arcEl) return;

            arcEl.style.background = buildNightGradient(start, end);

            const startHours = timeToHours(start);
            const endHours = timeToHours(end);
            if (startHandleEl) {
                const pos = polarPosition(startHours === null ? 22 : startHours, 50);
                startHandleEl.style.left = `${pos.x}%`;
                startHandleEl.style.top = `${pos.y}%`;
            }
            if (endHandleEl) {
                const pos = polarPosition(endHours === null ? 7 : endHours, 50);
                endHandleEl.style.left = `${pos.x}%`;
                endHandleEl.style.top = `${pos.y}%`;
            }
        }

        function updateFromInputs() {
            const start = startEl ? startEl.value : '';
            const end = endEl ? endEl.value : '';
            const diff = formatDuration(start, end);
            if (resultEl) resultEl.innerText = diff;
            renderDial(start, end);
        }

        ensureDial();
        if (startEl) startEl.addEventListener('input', updateFromInputs);
        if (endEl) endEl.addEventListener('input', updateFromInputs);
        updateFromInputs();

        return {
            mount() {
                ensureDial();
                updateFromInputs();
            },
            update(state = {}) {
                const { start = '', end = '', diff = '' } = state;
                if (startEl) startEl.value = start;
                if (endEl) endEl.value = end;
                if (resultEl) resultEl.innerText = diff || '-- ч -- мин';
                renderDial(start, end);
                return { start, end, diff };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createSleepPanel = createSleepPanel;
})();
