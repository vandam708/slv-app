(function () {
    function createWaterTank(options = {}) {
        const goalEl = document.getElementById(options.goalId || 'waterGoalDisplay');
        const currentEl = document.getElementById(options.currentId || 'waterCurrent');
        const barEl = document.getElementById(options.barId || 'waterBar');
        const tankEl = barEl ? barEl.parentElement : null;

        return {
            mount() {},
            update(state = {}) {
                const { current = 0, goal = 0 } = state;
                const percent = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
                if (goalEl) goalEl.innerText = `Цель: ${goal} мл`;
                if (currentEl) currentEl.innerText = `${current} / ${goal} мл`;
                if (barEl) {
                    barEl.style.width = `${percent * 0.78}%`;
                    barEl.style.setProperty('--water-level', `${percent}%`);
                }
                if (tankEl) {
                    tankEl.style.setProperty('--water-fill-width', `${percent * 0.78}%`);
                }
                return { current, goal };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createWaterTank = createWaterTank;
})();
