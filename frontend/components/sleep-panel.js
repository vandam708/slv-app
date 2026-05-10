(function () {
    function createSleepPanel(options = {}) {
        const startEl = document.getElementById(options.startId || 'sleepStart');
        const endEl = document.getElementById(options.endId || 'sleepEnd');
        const resultEl = document.getElementById(options.resultId || 'sleepResultDisplay');

        return {
            mount() {},
            update(state = {}) {
                const { start = '', end = '', diff = '' } = state;
                if (startEl) startEl.value = start;
                if (endEl) endEl.value = end;
                if (resultEl) resultEl.innerText = diff || '-- ч -- мин';
                return { start, end, diff };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createSleepPanel = createSleepPanel;
})();
