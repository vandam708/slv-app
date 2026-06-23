(function () {
    function toNumber(value, fallback = 0) {
        const n = Number(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function parseDateRuToTs(dateStr) {
        const [dd, mm, yyyy] = String(dateStr || '').split('.');
        if (!dd || !mm || !yyyy) return NaN;
        return new Date(`${yyyy}-${mm}-${dd}`).getTime();
    }

    function calculateStreaks(params) {
        const {
            localStorageRef,
            shadowTasks = [],
            now = new Date()
        } = params || {};

        if (!localStorageRef || !Array.isArray(shadowTasks) || shadowTasks.length === 0) {
            return { current: 0, best: 0 };
        }

        const successDates = new Set();

        for (let i = 0; i < localStorageRef.length; i++) {
            const key = localStorageRef.key(i);
            if (!key || !key.startsWith('slv_secret_')) continue;
            if (localStorageRef.getItem(key) !== 'true') continue;
            if (!shadowTasks.some((t) => key.endsWith(t.id))) continue;

            const parts = key.split('_');
            if (parts.length >= 4) successDates.add(parts[2]);
        }

        const sortedDates = Array.from(successDates)
            .map(parseDateRuToTs)
            .filter((ts) => Number.isFinite(ts))
            .sort((a, b) => a - b);

        if (sortedDates.length === 0) return { current: 0, best: 0 };

        let bestStreak = 1;
        let tempStreak = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const diff = (sortedDates[i] - sortedDates[i - 1]) / 86400000;
            if (Math.round(diff) === 1) {
                tempStreak++;
            } else {
                if (tempStreak > bestStreak) bestStreak = tempStreak;
                tempStreak = 1;
            }
        }
        if (tempStreak > bestStreak) bestStreak = tempStreak;

        const today = new Date(now);
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const todayTs = today.getTime();
        const yesterdayTs = yesterday.getTime();
        const hasToday = sortedDates.includes(todayTs);
        const hasYesterday = sortedDates.includes(yesterdayTs);

        let currentStreak = 0;
        if (hasToday || hasYesterday) {
            let checkTs = hasToday ? todayTs : yesterdayTs;
            while (sortedDates.includes(checkTs)) {
                currentStreak++;
                checkTs -= 86400000;
            }
        }

        return { current: currentStreak, best: bestStreak };
    }

    function buildSecretChartData(params) {
        const {
            localStorageRef,
            soulTasks = [],
            shadowTasks = [],
            days = 7,
            locale = 'ru-RU'
        } = params || {};

        if (!localStorageRef) return { labels: [], soulData: [], shadowData: [] };

        const labels = [];
        const soulData = [];
        const shadowData = [];

        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString(locale);

            labels.push(dateStr.slice(0, 5));

            let sVal = 0;
            let shVal = 0;

            soulTasks.forEach((t) => {
                if (localStorageRef.getItem(`slv_secret_${dateStr}_${t.id}`) === 'true') {
                    sVal += toNumber(t.xp, 0);
                }
            });

            shadowTasks.forEach((t) => {
                if (localStorageRef.getItem(`slv_secret_${dateStr}_${t.id}`) === 'true') {
                    shVal += toNumber(t.xp, 0);
                }
            });

            soulData.push(sVal);
            shadowData.push(shVal);
        }

        return { labels, soulData, shadowData };
    }

    window.SLVSecretStatsEngine = {
        calculateStreaks,
        buildSecretChartData
    };
})();