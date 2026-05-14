(function () {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const ARC_COLORS = [
        '#a765ff',
        '#df5b7f',
        '#d88952',
        '#f0c45b',
        '#ffd96b',
        '#ffc24c',
        '#f0b34b',
        '#bfd96c',
        '#89e47f',
        '#44d2c8'
    ];
    const SEGMENT_START_DEG = -158.5;
    const SEGMENT_STEP_DEG = 32;
    const SEGMENT_SWEEP_DEG = 28.5;

    function clampEnergy(value) {
        const n = Number(value);
        if (!Number.isFinite(n)) return 5;
        return Math.min(10, Math.max(1, n));
    }

    function cleanEnergyLabel(label) {
        const raw = String(label || 'Норма').trim();
        const cleaned = raw.replace(/^[^\wА-Яа-яЁё]+/u, '').trim();
        return cleaned || raw || 'Норма';
    }

    function getStatusColor(value) {
        if (value <= 2) return '#8f98aa';
        if (value <= 4) return '#49c8dc';
        if (value <= 6) return '#ffd166';
        if (value <= 8) return '#9be66f';
        return '#ffc24c';
    }

    function polarToCartesian(cx, cy, radius, angleDeg) {
        const angleRad = (angleDeg - 90) * Math.PI / 180;
        return {
            x: cx + radius * Math.cos(angleRad),
            y: cy + radius * Math.sin(angleRad)
        };
    }

    function describeArc(cx, cy, radius, startAngle, endAngle) {
        const start = polarToCartesian(cx, cy, radius, endAngle);
        const end = polarToCartesian(cx, cy, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
        return [
            'M', start.x.toFixed(3), start.y.toFixed(3),
            'A', radius, radius, 0, largeArcFlag, 0, end.x.toFixed(3), end.y.toFixed(3)
        ].join(' ');
    }

    function createSvgEl(tag, attrs = {}) {
        const el = document.createElementNS(SVG_NS, tag);
        Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
        return el;
    }

    function createEnergyPanel(options = {}) {
        const valueEl = document.getElementById(options.valueId || 'energyVal');
        const textEl = document.getElementById(options.textId || 'energyText');
        const buttonTextEl = document.getElementById(options.buttonTextId || 'energyButtonText');
        const logEl = document.getElementById(options.logId || 'energyLog');
        const rangeEl = document.querySelector(options.rangeSelector || '.energy-range');
        const cardEl = document.querySelector(options.cardSelector || '.dash-energy-card');
        const dialEl = document.getElementById(options.dialId || 'energyDial');
        const saveBtn = cardEl ? cardEl.querySelector(options.saveSelector || '.energy-btn') : null;
        const calendarBtn = cardEl ? cardEl.querySelector(options.calendarSelector || '.energy-calendar-btn') : null;
        const svgEl = dialEl ? dialEl.querySelector('.energy-dial-svg') : null;
        const segments = [];
        let progressEl = null;
        let isLogOpen = false;

        function setLogOpen(nextOpen) {
            isLogOpen = Boolean(nextOpen);
            if (cardEl) cardEl.classList.toggle('energy-log-open', isLogOpen);
            if (calendarBtn) calendarBtn.setAttribute('aria-expanded', String(isLogOpen));
        }

        function renderLog(log, getEnergyText) {
            if (!logEl || !Array.isArray(log)) return;

            logEl.replaceChildren();
            if (log.length === 0) {
                const empty = document.createElement('div');
                empty.className = 'energy-log-empty';
                empty.textContent = 'Сегодня записей нет';
                logEl.appendChild(empty);
                return;
            }

            log.slice().reverse().forEach((item) => {
                const itemEl = document.createElement('div');
                itemEl.className = 'energy-log-item';

                const timeEl = document.createElement('span');
                timeEl.className = 'energy-log-time';
                timeEl.textContent = item.time || '--:--';

                const valueEl = document.createElement('span');
                valueEl.className = 'energy-log-state';
                const itemLabel = typeof getEnergyText === 'function' ? cleanEnergyLabel(getEnergyText(item.val)) : cleanEnergyLabel(item.val);
                valueEl.textContent = `${itemLabel} (${item.val})`;

                itemEl.append(timeEl, valueEl);
                logEl.appendChild(itemEl);
            });
        }

        function ensureDialSvg() {
            if (!svgEl || svgEl.dataset.ready === 'true') return;

            const defs = createSvgEl('defs');
            const progressGradient = createSvgEl('linearGradient', {
                id: 'energyProgressGradient',
                x1: '35%',
                y1: '12%',
                x2: '84%',
                y2: '82%'
            });
            [
                ['0%', '#ffe77a'],
                ['42%', '#ffd166'],
                ['76%', '#ffc24c'],
                ['100%', '#f0a23b']
            ].forEach(([offset, color]) => {
                progressGradient.appendChild(createSvgEl('stop', { offset, 'stop-color': color }));
            });

            const glow = createSvgEl('filter', {
                id: 'energyGlow',
                x: '-80%',
                y: '-80%',
                width: '260%',
                height: '260%'
            });
            glow.appendChild(createSvgEl('feGaussianBlur', { stdDeviation: '5', result: 'blur' }));
            glow.appendChild(createSvgEl('feMerge'));
            glow.lastChild.appendChild(createSvgEl('feMergeNode', { in: 'blur' }));
            glow.lastChild.appendChild(createSvgEl('feMergeNode', { in: 'SourceGraphic' }));

            const softGlow = createSvgEl('filter', {
                id: 'energySoftGlow',
                x: '-70%',
                y: '-70%',
                width: '240%',
                height: '240%'
            });
            softGlow.appendChild(createSvgEl('feGaussianBlur', { stdDeviation: '2.8', result: 'blur' }));
            softGlow.appendChild(createSvgEl('feMerge'));
            softGlow.lastChild.appendChild(createSvgEl('feMergeNode', { in: 'blur' }));
            softGlow.lastChild.appendChild(createSvgEl('feMergeNode', { in: 'SourceGraphic' }));

            defs.appendChild(progressGradient);
            defs.appendChild(glow);
            defs.appendChild(softGlow);
            svgEl.appendChild(defs);

            svgEl.appendChild(createSvgEl('circle', {
                class: 'energy-dial-bg',
                cx: '130',
                cy: '130',
                r: '94'
            }));
            svgEl.appendChild(createSvgEl('circle', {
                class: 'energy-orbit-track',
                cx: '130',
                cy: '130',
                r: '106'
            }));
            svgEl.appendChild(createSvgEl('circle', {
                class: 'energy-progress-track',
                cx: '130',
                cy: '130',
                r: '82',
                pathLength: '100',
                transform: 'rotate(-92 130 130)'
            }));

            ARC_COLORS.forEach((color, index) => {
                const start = SEGMENT_START_DEG + index * SEGMENT_STEP_DEG;
                const end = start + SEGMENT_SWEEP_DEG;
                const d = describeArc(130, 130, 106, start, end);
                const glowSegment = createSvgEl('path', {
                    class: `energy-segment-glow energy-segment-glow-${index + 1}`,
                    d,
                    stroke: color
                });
                const segment = createSvgEl('path', {
                    class: `energy-segment energy-segment-${index + 1}`,
                    d,
                    stroke: color
                });
                svgEl.appendChild(glowSegment);
                svgEl.appendChild(segment);
                segments.push({ segment, glowSegment });
            });

            progressEl = createSvgEl('circle', {
                class: 'energy-progress',
                cx: '130',
                cy: '130',
                r: '82',
                pathLength: '100',
                transform: 'rotate(-92 130 130)'
            });
            svgEl.appendChild(progressEl);
            svgEl.appendChild(createSvgEl('circle', {
                class: 'energy-inner-track',
                cx: '130',
                cy: '130',
                r: '62'
            }));
            svgEl.appendChild(createSvgEl('circle', {
                class: 'energy-inner-glow',
                cx: '130',
                cy: '130',
                r: '64'
            }));

            svgEl.dataset.ready = 'true';
        }

        function renderDial(value) {
            ensureDialSvg();

            const energy = clampEnergy(value);
            const activeSegments = Math.max(1, Math.round(energy));
            const glow = (0.16 + (energy / 10) * 0.84).toFixed(2);
            const progress = Math.max(8, energy * 10);
            const statusColor = getStatusColor(energy);

            if (cardEl) {
                cardEl.style.setProperty('--energy-glow', glow);
                cardEl.style.setProperty('--energy-progress-pct', String(progress));
                cardEl.style.setProperty('--energy-status-color', statusColor);
            }
            if (dialEl) {
                dialEl.style.setProperty('--energy-glow', glow);
                dialEl.style.setProperty('--energy-progress-pct', String(progress));
            }
            if (progressEl) progressEl.style.strokeDasharray = `${progress} 100`;

            segments.forEach(({ segment, glowSegment }, index) => {
                const isActive = index < activeSegments;
                segment.classList.toggle('is-active', isActive);
                glowSegment.classList.toggle('is-active', isActive);
            });
        }

        if (saveBtn && saveBtn.dataset.energyBound !== 'true') {
            saveBtn.dataset.energyBound = 'true';
            saveBtn.addEventListener('click', (event) => {
                event.preventDefault();
                if (typeof window.logEnergy === 'function') window.logEnergy();
            });
        }

        if (calendarBtn && calendarBtn.dataset.energyBound !== 'true') {
            calendarBtn.dataset.energyBound = 'true';
            calendarBtn.addEventListener('click', (event) => {
                event.preventDefault();
                if (!isLogOpen && typeof window.renderEnergy === 'function') window.renderEnergy();
                setLogOpen(!isLogOpen);
            });
        }

        return {
            mount() {},
            showLog(open = true) {
                setLogOpen(open);
            },
            update(state = {}) {
                const { value = 5, label = '', log = null, getEnergyText = null } = state;
                const energy = clampEnergy(value);
                const displayLabel = cleanEnergyLabel(label);
                if (valueEl) valueEl.innerText = energy;
                if (textEl) textEl.innerText = displayLabel;
                if (buttonTextEl) buttonTextEl.innerText = displayLabel;
                if (rangeEl) rangeEl.value = energy;
                renderDial(energy);
                renderLog(log, getEnergyText);
                return { value: energy, label: displayLabel };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createEnergyPanel = createEnergyPanel;
})();
