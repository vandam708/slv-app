(function () {
    function toNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function calcDailyXP(params) {
        const {
            dateStr,
            localStorageRef,
            myTasks = [],
            bogdanTasks = [],
            sportExercises = [],
            nutriConfig = []
        } = params || {};

        if (!dateStr || !localStorageRef) return 0;

        let dXP = 0;

        [...myTasks, ...bogdanTasks].forEach((t) => {
            if (localStorageRef.getItem(`slv_${dateStr}_${t.id}`) === 'true') {
                dXP += toNumber(t.xp, 10);
            }
        });

        const w = toNumber(localStorageRef.getItem(`slv_water_${dateStr}`), 0);
        dXP += w / 100;

        const a = toNumber(localStorageRef.getItem(`slv_air_${dateStr}`), 0);
        dXP += (a / 15) * 5;

        sportExercises.forEach((s) => {
            const c = toNumber(localStorageRef.getItem(`slv_sport_${dateStr}_${s.id}`), 0);
            if (c > 0) dXP += c * toNumber(s.rate, 0);
        });

        for (let i = 0; i < localStorageRef.length; i++) {
            const key = localStorageRef.key(i);
            if (key && key.startsWith(`slv_fizz_${dateStr}_`)) {
                const raw = localStorageRef.getItem(key);
                try {
                    const data = JSON.parse(raw);
                    dXP += toNumber(data?.xp, 5);
                } catch (_) {
                    dXP += 5;
                }
            }
        }

        nutriConfig.forEach((cat) => {
            const val = toNumber(localStorageRef.getItem(`slv_nutri_${dateStr}_${cat.id}`), 0);
            dXP += val * 2;
        });

        if (localStorageRef.getItem(`slv_sleep_${dateStr}`)) dXP += 10;

        try {
            const oneOffLog = JSON.parse(localStorageRef.getItem(`slv_oneoff_log_${dateStr}`) || '[]');
            oneOffLog.forEach((item) => {
                dXP += toNumber(item?.xp, 0);
            });
        } catch (_) {
            // ignore malformed json
        }

        return dXP;
    }

    function compareDailyXP(xpToday, xpYest) {
        const today = toNumber(xpToday, 0);
        const yest = toNumber(xpYest, 0);

        if (yest === 0) {
            if (today > 0) {
                return {
                    state: 'start',
                    label: '🚀 СТАРТ!',
                    color: 'var(--success)',
                    text: 'Вчера активности не было'
                };
            }
            return {
                state: 'empty',
                label: '😴 Zzz...',
                color: '#666',
                text: 'Пока нет данных для сравнения'
            };
        }

        const diff = today - yest;
        const percent = ((diff / yest) * 100).toFixed(1);

        if (diff > 0) {
            return {
                state: 'up',
                label: `+${percent}% 📈`,
                color: 'var(--success)',
                text: `Ты лучше, чем вчера на ${Math.floor(diff)} XP`
            };
        }

        if (diff < 0) {
            return {
                state: 'down',
                label: `${percent}% 📉`,
                color: 'var(--danger)',
                text: `Отстаешь от вчерашнего на ${Math.floor(Math.abs(diff))} XP`
            };
        }

        return {
            state: 'same',
            label: '= 0%',
            color: 'var(--warning)',
            text: 'Идешь ровно в графике вчерашнего дня'
        };
    }

    function buildDailyComparison(params) {
        const {
            now = new Date(),
            calcDailyXPFn,
            compareDailyXPFn = compareDailyXP
        } = params || {};

        if (typeof calcDailyXPFn !== 'function') {
            return {
                xpToday: 0,
                xpYest: 0,
                result: compareDailyXPFn(0, 0)
            };
        }

        const today = new Date(now);
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);

        const tStr = today.toLocaleDateString('ru-RU');
        const yStr = yest.toLocaleDateString('ru-RU');

        const xpToday = toNumber(calcDailyXPFn(tStr), 0);
        const xpYest = toNumber(calcDailyXPFn(yStr), 0);

        return {
            xpToday,
            xpYest,
            result: compareDailyXPFn(xpToday, xpYest)
        };
    }

    window.SLVStatsEngine = {
        calcDailyXP,
        compareDailyXP,
        buildDailyComparison
    };
})();