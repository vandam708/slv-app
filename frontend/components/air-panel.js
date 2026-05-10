(function () {
    function createAirPanel(options = {}) {
        const goalEl = document.getElementById(options.goalId || 'airGoalDisplay');
        const currentEl = document.getElementById(options.currentId || 'airCurrent');
        const barEl = document.getElementById(options.barId || 'airBar');

        return {
            mount() {},
            update(state = {}) {
                const { current = 0, goal = 60 } = state;
                const percent = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
                if (goalEl) goalEl.innerText = `Цель: ${goal} мин`;
                if (currentEl) currentEl.innerText = `${current} / ${goal} мин`;
                if (barEl) barEl.style.width = `${percent}%`;
                return { current, goal };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createAirPanel = createAirPanel;
})();
