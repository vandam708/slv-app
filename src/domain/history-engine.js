(function () {
    function toNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function safeJsonParse(raw, fallback) {
        try {
            return JSON.parse(raw);
        } catch (_) {
            return fallback;
        }
    }

    function renderHistory(params) {
        const {
            historyDate,
            localStorageRef,
            myTasks = [],
            bogdanTasks = [],
            sportExercises = [],
            nutriConfig = [],
            userWeight = 70,
            getEnergyText,
            histItem
        } = params || {};

        if (!historyDate || !localStorageRef || typeof histItem !== 'function' || typeof getEnergyText !== 'function') {
            return {
                dateInputValue: '',
                dayXP: 0,
                html: '<div style="text-align:center; color:#666;">Нет записей</div>'
            };
        }

        const dateStr = historyDate.toLocaleDateString('ru-RU');
        const yyyy = historyDate.getFullYear();
        const mm = String(historyDate.getMonth() + 1).padStart(2, '0');
        const dd = String(historyDate.getDate()).padStart(2, '0');
        const dateInputValue = `${yyyy}-${mm}-${dd}`;

        let dayXP = 0;
        let slvH = '';
        let bogdanH = '';
        let sportH = '';
        let fizzH = '';
        let waterH = '';
        let energyH = '';
        let sleepH = '';
        let airH = '';

        const oneOffLog = safeJsonParse(localStorageRef.getItem(`slv_oneoff_log_${dateStr}`) || '[]', []);
        oneOffLog.forEach((item) => {
            const xp = toNumber(item?.xp, 0);
            dayXP += xp;
            const icon = item?.type === 'mind' ? '👁️' : '🧹';
            const color = item?.type === 'mind' ? 'var(--soul-color)' : 'var(--danger)';
            slvH += `<div class="task-item completed" style="padding:8px; margin-bottom:6px;"><span style="color:${color};">${icon}</span> <label style="margin-left:10px;">${item?.text || ''}</label> <span style="color:var(--primary);">+${xp}</span></div>`;
        });

        const sleepData = safeJsonParse(localStorageRef.getItem(`slv_sleep_${dateStr}`), null);
        if (sleepData && sleepData.diff) {
            sleepH = `<div class="task-item completed" style="padding:8px;margin-bottom:6px;"><span style="color:var(--sleep-color);">💤</span> <label style="margin-left:10px;">Сон: ${sleepData.diff}</label></div>`;
        }

        const airVal = toNumber(localStorageRef.getItem(`slv_air_${dateStr}`), 0);
        if (airVal > 0) {
            const earned = (airVal / 15) * 5;
            dayXP += earned;
            airH = `<div class="task-item completed" style="padding:8px;margin-bottom:6px;"><span style="color:var(--air-color);">🌬️</span> <label style="margin-left:10px;">Воздух: ${airVal} мин</label> <span style="color:var(--primary);">+${Math.floor(earned)}</span></div>`;
        }

        myTasks.forEach((t) => {
            if (localStorageRef.getItem(`slv_${dateStr}_${t.id}`) === 'true') {
                dayXP += toNumber(t.xp, 0);
                slvH += histItem(t.text, t.xp);
            }
        });

        bogdanTasks.forEach((t) => {
            if (localStorageRef.getItem(`slv_${dateStr}_${t.id}`) === 'true') {
                dayXP += toNumber(t.xp, 0);
                bogdanH += histItem(t.text, t.xp);
            }
        });

        sportExercises.forEach((s) => {
            const count = toNumber(localStorageRef.getItem(`slv_sport_${dateStr}_${s.id}`), 0);
            if (count > 0) {
                const earned = count * toNumber(s.rate, 0);
                dayXP += earned;
                sportH += `<div class="task-item completed" style="padding:8px; margin-bottom:6px;"><span style="color:var(--sport-color);">💪</span> <label style="margin-left:10px;">${s.text}: ${count}</label> <span style="color:var(--primary);">+${Math.floor(earned)}</span></div>`;
            }
        });

        for (let i = 0; i < localStorageRef.length; i++) {
            const key = localStorageRef.key(i);
            if (key && key.startsWith(`slv_fizz_${dateStr}_`)) {
                const data = safeJsonParse(localStorageRef.getItem(key), null);
                const xp = toNumber(data?.xp, 0);
                dayXP += xp;
                fizzH += `<div class="task-item completed" style="padding:8px; margin-bottom:6px;"><span style="color:var(--fizz-color);">⚡</span> <label style="margin-left:10px;">${data?.text || ''}</label> <span style="color:var(--primary);">+${xp}</span></div>`;
            }
        }

        let nutriH = '';
        nutriConfig.forEach((cat) => {
            const val = toNumber(localStorageRef.getItem(`slv_nutri_${dateStr}_${cat.id}`), 0);
            if (val > 0) {
                const earned = val * 2;
                dayXP += earned;
                nutriH += `<div style="color:#aaa; margin-left:10px; font-size:0.9em;">${cat.label}: ${val} порц. (+${earned} XP)</div>`;
            }
        });
        if (nutriH) {
            nutriH = `<div class="history-section-title" style="color:#06D6A0">🧬 Питание</div>${nutriH}`;
        }

        const w = toNumber(localStorageRef.getItem(`slv_water_${dateStr}`), 0);
        if (w > 0) {
            const goal = userWeight * 30;
            const wXP = w / 100;
            dayXP += wXP;
            waterH = `<div class="task-item completed" style="padding:8px; margin-bottom:6px;"><span style="color:var(--water-color);">💧</span> <label style="margin-left:10px;">Выпито: ${w} / ${goal} мл</label> <span style="color:var(--primary);">+${Math.floor(wXP)}</span></div>`;
        }

        const eLog = safeJsonParse(localStorageRef.getItem(`slv_energy_log_${dateStr}`) || '[]', []);
        if (eLog.length > 0) {
            energyH = eLog
                .map((e) => `<div style="color:#888; font-size:0.9em; margin-left:10px;">${e.time} — ${getEnergyText(e.val)} (${e.val})</div>`)
                .join('');
        }

        let html = '';
        if (sleepH) html += `<div class="history-section-title" style="color:var(--sleep-color)">💤 Сон</div>${sleepH}`;
        if (nutriH) html += nutriH;
        if (airH) html += `<div class="history-section-title" style="color:var(--air-color)">🌬️ Воздух</div>${airH}`;
        if (energyH) html += `<div class="history-section-title" style="color:var(--warning)">🔋 Энергия</div>${energyH}`;
        if (waterH) html += `<div class="history-section-title" style="color:var(--water-color)">💧 Вода</div>${waterH}`;
        if (fizzH) html += `<div class="history-section-title" style="color:var(--fizz-color)">⚡ Разминки</div>${fizzH}`;
        if (sportH) html += `<div class="history-section-title" style="color:var(--sport-color)">🥋 Спорт</div>${sportH}`;
        if (slvH) html += `<div class="history-section-title" style="color:var(--primary)">🚀 Задачи</div>${slvH}`;
        if (bogdanH) html += `<div class="history-section-title" style="color:var(--success)">👦 Богдан</div>${bogdanH}`;

        return {
            dateInputValue,
            dayXP,
            html: html || '<div style="text-align:center; color:#666;">Нет записей</div>'
        };
    }

    window.SLVHistoryEngine = {
        renderHistory
    };
})();
