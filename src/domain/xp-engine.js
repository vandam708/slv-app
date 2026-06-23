(function () {
    function normalize(value) {
        const n = Number(value);
        if (!Number.isFinite(n) || Number.isNaN(n)) return 0;
        return n < 0 ? 0 : n;
    }

    function add(currentXp, amount) {
        return normalize(normalize(currentXp) + Number(amount || 0));
    }

    function remove(currentXp, amount) {
        return normalize(normalize(currentXp) - Number(amount || 0));
    }

    function getLevelInfo(totalXp, xpPerLevel) {
        const safeXp = normalize(totalXp);
        const safePerLevel = Math.max(1, Number(xpPerLevel) || 150);
        const level = Math.floor(safeXp / safePerLevel) + 1;
        const progress = ((safeXp % safePerLevel) / safePerLevel) * 100;
        return {
            totalXp: safeXp,
            level,
            progress
        };
    }

    window.SLVXPEngine = {
        normalize,
        add,
        remove,
        getLevelInfo
    };
})();