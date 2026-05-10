(function () {
    function createEnergyPanel(options = {}) {
        const valueEl = document.getElementById(options.valueId || 'energyVal');
        const textEl = document.getElementById(options.textId || 'energyText');
        const logEl = document.getElementById(options.logId || 'energyLog');
        const rangeEl = document.querySelector(options.rangeSelector || '.energy-range');

        return {
            mount() {},
            update(state = {}) {
                const { value = 5, label = '', log = null, getEnergyText = null } = state;
                if (valueEl) valueEl.innerText = value;
                if (textEl) textEl.innerText = label;
                if (rangeEl) rangeEl.value = value;
                if (logEl && Array.isArray(log)) {
                    logEl.innerHTML = log.map((item) => {
                        const itemLabel = typeof getEnergyText === 'function' ? getEnergyText(item.val) : item.val;
                        return `<div class="energy-log-item"><span>${item.time}</span><span style="color:var(--warning)">${itemLabel}</span></div>`;
                    }).join('');
                }
                return { value, label };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createEnergyPanel = createEnergyPanel;
})();
