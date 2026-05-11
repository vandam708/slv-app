(function () {
    const RU_MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

    function toNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function parseRuDate(dateStr) {
        const [dd, mm, yyyy] = String(dateStr || '').split('.').map((part) => Number(part));
        if (!dd || !mm || !yyyy) return null;

        const date = new Date(yyyy, mm - 1, dd);
        if (date.getFullYear() !== yyyy || date.getMonth() !== mm - 1 || date.getDate() !== dd) {
            return null;
        }
        date.setHours(0, 0, 0, 0);
        return date;
    }

    function formatRuDate(date) {
        const dd = String(date.getDate()).padStart(2, '0');
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const yyyy = date.getFullYear();
        return `${dd}.${mm}.${yyyy}`;
    }

    function addDaily(dailyData, dateStr, amount) {
        if (!parseRuDate(dateStr)) return;
        dailyData[dateStr] = (dailyData[dateStr] || 0) + toNumber(amount, 0);
    }

    function collectDailyData({ localStorageRef, myTasks, bogdanTasks, sportExercises }) {
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

                if (isPlainTask && localStorageRef.getItem(key) === 'true') {
                    const date = parts[1];
                    const id = parts.slice(2).join('_');
                    addDaily(dailyData, date, taskMap[id] || 0);
                }
            }

            if (key.startsWith('slv_fizz_')) {
                const parts = key.split('_');
                if (parts.length >= 4) {
                    try {
                        const data = JSON.parse(localStorageRef.getItem(key));
                        addDaily(dailyData, parts[2], toNumber(data?.xp, 5));
                    } catch (_) {
                        addDaily(dailyData, parts[2], 5);
                    }
                }
            }

            if (key.startsWith('slv_nutri_')) {
                const parts = key.split('_');
                if (parts.length >= 4) {
                    const val = toNumber(localStorageRef.getItem(key), 0);
                    if (val > 0) addDaily(dailyData, parts[2], val * 2);
                }
            }

            if (key.startsWith('slv_sport_')) {
                const parts = key.split('_');
                if (parts.length >= 4) {
                    const count = toNumber(localStorageRef.getItem(key), 0);
                    if (count > 0) {
                        const id = parts.slice(3).join('_');
                        const rate = toNumber((sportExercises.find((s) => s.id === id) || {}).rate, 0);
                        addDaily(dailyData, parts[2], count * rate);
                    }
                }
            }

            if (key.startsWith('slv_water_')) {
                const parts = key.split('_');
                if (parts.length === 3) {
                    const val = toNumber(localStorageRef.getItem(key), 0);
                    if (val > 0) addDaily(dailyData, parts[2], val / 100);
                }
            }

            if (key.startsWith('slv_air_')) {
                const parts = key.split('_');
                if (parts.length === 3) {
                    const val = toNumber(localStorageRef.getItem(key), 0);
                    if (val > 0) addDaily(dailyData, parts[2], (val / 15) * 5);
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
                        // Ignore malformed one-off logs.
                    }
                }
            }
        }

        return dailyData;
    }

    function getSortedEntries(dailyData) {
        return Object.entries(dailyData)
            .map(([date, value]) => ({ date, value: toNumber(value, 0), dateObj: parseRuDate(date) }))
            .filter((x) => x.dateObj)
            .sort((a, b) => a.dateObj - b.dateObj);
    }

    function getMonthData(dailyData, today) {
        const cursor = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today);
        end.setHours(0, 0, 0, 0);
        const labels = [];
        const values = [];

        while (cursor <= end) {
            const dateStr = formatRuDate(cursor);
            labels.push(dateStr.slice(0, 5));
            values.push(Math.floor(toNumber(dailyData[dateStr], 0)));
            cursor.setDate(cursor.getDate() + 1);
        }

        return { labels, values };
    }

    function getYearData(dailyData, today) {
        const year = today.getFullYear();
        const valuesByMonth = Array(12).fill(0);

        getSortedEntries(dailyData).forEach((entry) => {
            if (entry.dateObj.getFullYear() === year) {
                valuesByMonth[entry.dateObj.getMonth()] += entry.value;
            }
        });

        return {
            labels: RU_MONTHS,
            values: valuesByMonth.map((value) => Math.floor(value))
        };
    }

    function getAllTimeData(dailyData) {
        const entries = getSortedEntries(dailyData);
        return {
            labels: entries.map((x) => x.date.slice(0, 5)),
            values: entries.map((x) => Math.floor(x.value))
        };
    }

    function getChartData(params) {
        const {
            period = 'month',
            localStorageRef,
            myTasks = [],
            bogdanTasks = [],
            sportExercises = []
        } = params || {};

        if (!localStorageRef) return { labels: [], values: [] };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dailyData = collectDailyData({ localStorageRef, myTasks, bogdanTasks, sportExercises });

        if (period === 'year') return getYearData(dailyData, today);
        if (period === 'all') return getAllTimeData(dailyData);
        return getMonthData(dailyData, today);
    }

    window.SLVChartEngine = {
        getChartData
    };
})();
