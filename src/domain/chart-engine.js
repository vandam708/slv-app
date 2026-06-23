(function () {
    function toNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function parseRuDateToTs(dateStr) {
        const [dd, mm, yyyy] = String(dateStr || '').split('.');
        if (!dd || !mm || !yyyy) return NaN;
        return new Date(`${yyyy}-${mm}-${dd}`).getTime();
    }

    function addDaily(dailyData, dateStr, amount) {
        if (!dateStr) return;
        dailyData[dateStr] = (dailyData[dateStr] || 0) + toNumber(amount, 0);
    }

    function getChartData(params) {
        const {
            period = 'month',
            localStorageRef,
            myTasks = [],
            bogdanTasks = [],
            sportExercises = [],
            nutriConfig = []
        } = params || {};

        if (!localStorageRef) return { labels: [], values: [] };

        const dailyData = {};
        const taskMap = {};
        [...myTasks, ...bogdanTasks].forEach((t) => {
            taskMap[t.id] = toNumber(t.xp, 0);
        });

        for (let i = 0; i < localStorageRef.length; i++) {
            const key = localStorageRef.key(i);
            if (!key) continue;

            if (key.startsWith('slv_') && !key.includes('secret') && !key.includes('sleep')) {
                const parts = key.split('_');
                const isPlainTask =
                    parts.length >= 3 &&
                    !key.includes('sport') &&
                    !key.includes('fizz') &&
                    !key.includes('water') &&
                    !key.includes('air') &&
                    !key.includes('nutri') &&
                    !key.includes('energy') &&
                    !key.includes('oneoff');

                if (isPlainTask) {
                    const date = parts[1];
                    const id = parts.slice(2).join('_');
                    if (localStorageRef.getItem(key) === 'true') {
                        addDaily(dailyData, date, taskMap[id] || 0);
                    }
                }
            }

            if (key.startsWith('slv_fizz_')) {
                const parts = key.split('_');
                if (parts.length >= 4) {
                    const date = parts[2];
                    try {
                        const data = JSON.parse(localStorageRef.getItem(key));
                        addDaily(dailyData, date, toNumber(data?.xp, 5));
                    } catch (_) {
                        addDaily(dailyData, date, 5);
                    }
                }
            }

            if (key.startsWith('slv_nutri_')) {
                const parts = key.split('_');
                if (parts.length >= 4) {
                    const date = parts[2];
                    const val = toNumber(localStorageRef.getItem(key), 0);
                    if (val > 0) addDaily(dailyData, date, val * 2);
                }
            }

            if (key.startsWith('slv_sport_')) {
                const parts = key.split('_');
                if (parts.length >= 4) {
                    const date = parts[2];
                    const id = parts.slice(3).join('_');
                    const count = toNumber(localStorageRef.getItem(key), 0);
                    if (count > 0) {
                        const rate = toNumber((sportExercises.find((s) => s.id === id) || {}).rate, 0);
                        addDaily(dailyData, date, count * rate);
                    }
                }
            }

            if (key.startsWith('slv_water_')) {
                const parts = key.split('_');
                if (parts.length === 3) {
                    const date = parts[2];
                    const val = toNumber(localStorageRef.getItem(key), 0);
                    if (val > 0) addDaily(dailyData, date, val / 100);
                }
            }

            if (key.startsWith('slv_air_')) {
                const parts = key.split('_');
                if (parts.length === 3) {
                    const date = parts[2];
                    const val = toNumber(localStorageRef.getItem(key), 0);
                    if (val > 0) addDaily(dailyData, date, (val / 15) * 5);
                }
            }

            if (key.startsWith('slv_sleep_')) {
                const parts = key.split('_');
                if (parts.length === 3 && localStorageRef.getItem(key)) {
                    addDaily(dailyData, parts[2], 10);
                }
            }

            if (key.startsWith('slv_oneoff_log_')) {
                const parts = key.split('_');
                if (parts.length >= 4) {
                    const date = parts.slice(3).join('_');
                    try {
                        const log = JSON.parse(localStorageRef.getItem(key) || '[]');
                        log.forEach((item) => addDaily(dailyData, date, toNumber(item?.xp, 0)));
                    } catch (_) {
                        // ignore malformed log
                    }
                }
            }
        }

        const entries = Object.entries(dailyData)
            .map(([date, value]) => ({ date, value: toNumber(value, 0), ts: parseRuDateToTs(date) }))
            .filter((x) => Number.isFinite(x.ts))
            .sort((a, b) => a.ts - b.ts);

        let filtered = entries;
        if (period === 'week') filtered = entries.slice(-7);
        else if (period === 'month') filtered = entries.slice(-30);

        return {
            labels: filtered.map((x) => x.date.slice(0, 5)),
            values: filtered.map((x) => Math.floor(x.value))
        };
    }

    window.SLVChartEngine = {
        getChartData
    };
})();