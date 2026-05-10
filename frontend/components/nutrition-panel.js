(function () {
    function createNutritionPanel(options = {}) {
        const listEl = document.getElementById(options.listId || 'nutriList');

        return {
            mount() {},
            update(state = {}) {
                const { categories = [], weight = 70, getCurrent = () => 0 } = state;
                if (listEl) {
                    listEl.innerHTML = categories.map((category) => {
                        const goal = category.calc(weight);
                        const current = getCurrent(category);
                        const percent = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
                        return `<div class="nutri-row"><div class="nutri-label"><span style="font-weight:bold; color:${category.color}">${category.label}</span><span style="color:#aaa">${current} / ${goal} порц.</span></div><div class="nutri-bar-bg"><div class="nutri-bar-fill" style="width:${percent}%; background:${category.color}"></div></div><div class="nutri-controls"><button class="nutri-btn btn-minus" onclick="addNutri('${category.id}', -0.5)">-0.5</button><button class="nutri-btn" onclick="addNutri('${category.id}', 0.5)">+0.5</button><button class="nutri-btn" onclick="addNutri('${category.id}', 1)">+1.0</button></div></div>`;
                    }).join('');
                }
                return { categories, weight };
            },
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createNutritionPanel = createNutritionPanel;
})();
