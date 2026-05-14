(function () {
    function createSleepPanel(options = {}) {
        const startEl = document.getElementById(options.startId || 'sleepStart');
        const endEl = document.getElementById(options.endId || 'sleepEnd');
        const resultEl = document.getElementById(options.resultId || 'sleepResultDisplay');
        const cardEl = document.querySelector(options.cardSelector || '.dash-sleep-card');
        let dialEl = null;
        let nightFaceEl = null;
        let startHandleEl = null;
        let endHandleEl = null;

        function timeToMinutes(value) {
            if (!value || !String(value).includes(':')) return null;
            const [hours, minutes] = String(value).split(':').map(Number);
            if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
            return hours * 60 + minutes;
        }

        function getSleepMetrics(start, end) {
            const startMinutes = timeToMinutes(start);
            const endMinutes = timeToMinutes(end);
            if (startMinutes === null || endMinutes === null) return null;

            let duration = endMinutes - startMinutes;
            if (duration < 0) duration += 24 * 60;

            const startClockMinutes = startMinutes % (12 * 60);
            const endClockMinutes = endMinutes % (12 * 60);
            const startDeg = (startClockMinutes / (12 * 60)) * 360;
            const sweepDeg = Math.min(360, (duration / (12 * 60)) * 360);

            return {
                startMinutes,
                endMinutes,
                duration,
                startDeg,
                endDeg: (endClockMinutes / (12 * 60)) * 360,
                sweepDeg
            };
        }

        function formatDuration(start, end) {
            const metrics = getSleepMetrics(start, end);
            if (!metrics) return '-- ч -- мин';

            const hours = Math.floor(metrics.duration / 60);
            const minutes = metrics.duration % 60;
            return `${hours} ч ${minutes} мин`;
        }

        function polarPosition(deg, radius = 43) {
            const rad = (deg - 90) * Math.PI / 180;
            return {
                x: 50 + Math.cos(rad) * radius,
                y: 50 + Math.sin(rad) * radius
            };
        }

        function ensureDial() {
            if (!cardEl || dialEl) return;

            const shell = document.createElement('div');
            shell.className = 'sleep-dial-shell';
            shell.innerHTML = `
                <div class="sleep-dial" aria-hidden="true">
                    <img class="sleep-dial-ring" src="./frontend/assets/ui/sleep-dial/sleep-dial-ring.png" alt="">
                    <img class="sleep-dial-face-img sleep-dial-day-face" src="./frontend/assets/ui/sleep-dial/sleep-dial-day-face.png" alt="">
                    <img class="sleep-dial-face-img sleep-dial-night-face" src="./frontend/assets/ui/sleep-dial/sleep-dial-night-face.png" alt="">
                    <img class="sleep-dial-marks" src="./frontend/assets/ui/sleep-dial/sleep-dial-marks.png" alt="">
                    <img class="sleep-handle sleep-handle-start" src="./frontend/assets/ui/sleep-dial/sleep-start-handle.png" alt="">
                    <img class="sleep-handle sleep-handle-end" src="./frontend/assets/ui/sleep-dial/sleep-end-handle.png" alt="">
                </div>
            `;

            const inputs = cardEl.querySelector('.sleep-inputs');
            if (inputs) cardEl.insertBefore(shell, inputs);
            else cardEl.appendChild(shell);

            dialEl = shell.querySelector('.sleep-dial');
            nightFaceEl = shell.querySelector('.sleep-dial-night-face');
            startHandleEl = shell.querySelector('.sleep-handle-start');
            endHandleEl = shell.querySelector('.sleep-handle-end');
        }

        function renderDial(start, end) {
            ensureDial();
            if (!dialEl) return;

            const metrics = getSleepMetrics(start, end);
            const hasRange = Boolean(metrics && metrics.duration > 0);
            dialEl.classList.toggle('sleep-has-range', hasRange);

            if (!metrics) {
                dialEl.style.setProperty('--sleep-mask-from', '0deg');
                dialEl.style.setProperty('--sleep-sweep-deg', '0deg');
                setHandlePosition(startHandleEl, 0);
                setHandlePosition(endHandleEl, (8 / 12) * 360);
                return;
            }

            dialEl.style.setProperty('--sleep-mask-from', `${metrics.startDeg}deg`);
            dialEl.style.setProperty('--sleep-sweep-deg', `${metrics.sweepDeg}deg`);
            if (nightFaceEl) nightFaceEl.style.opacity = hasRange ? '1' : '0';
            setHandlePosition(startHandleEl, metrics.startDeg);
            setHandlePosition(endHandleEl, metrics.endDeg);
        }

        function setHandlePosition(handle, deg) {
            if (!handle) return;
            const pos = polarPosition(deg, 43);
            handle.style.left = `${pos.x}%`;
            handle.style.top = `${pos.y}%`;
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
                if (resultEl) resultEl.innerText = diff || formatDuration(start, end);
                renderDial(start, end);
                return { start, end, diff };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createSleepPanel = createSleepPanel;
})();
