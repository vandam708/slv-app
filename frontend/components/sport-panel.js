(function () {
    function createSportPanel(options = {}) {
        const listEl = document.getElementById(options.listId || 'sportList');

        return {
            mount() {},
            update(state = {}) {
                const { exercises = [], getCount = () => 0 } = state;
                if (listEl) {
                    listEl.innerHTML = exercises.map((exercise) => {
                        const count = getCount(exercise);
                        return `<div class="sport-item"><label style="flex:1">${exercise.text}</label><div class="sport-controls"><button class="sport-btn" onclick="changeSport('${exercise.id}', -10)">-</button><input type="number" class="sport-input" value="${count}" onchange="setSportExact('${exercise.id}', this.value)"><button class="sport-btn" onclick="changeSport('${exercise.id}', 10)">+</button></div></div>`;
                    }).join('');
                }
                return { exercises };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createSportPanel = createSportPanel;
})();
