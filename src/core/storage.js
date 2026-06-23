(function () {
    function getRaw(key, fallback = null) {
        const value = localStorage.getItem(key);
        return value === null ? fallback : value;
    }

    function setRaw(key, value) {
        localStorage.setItem(key, String(value));
        return value;
    }

    function remove(key) {
        localStorage.removeItem(key);
    }

    function getInt(key, fallback = 0) {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const parsed = parseInt(raw, 10);
        return Number.isNaN(parsed) ? fallback : parsed;
    }

    function getFloat(key, fallback = 0) {
        const raw = localStorage.getItem(key);
        if (raw === null) return fallback;
        const parsed = parseFloat(raw);
        return Number.isNaN(parsed) ? fallback : parsed;
    }

    function setNumber(key, value, fallback = 0) {
        const n = Number(value);
        const normalized = Number.isFinite(n) ? n : fallback;
        localStorage.setItem(key, String(normalized));
        return normalized;
    }

    function getJson(key, fallback = null) {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        try {
            return JSON.parse(raw);
        } catch (_) {
            return fallback;
        }
    }

    function setJson(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    }

    window.SLVStorage = {
        getRaw,
        setRaw,
        remove,
        getInt,
        getFloat,
        setNumber,
        getJson,
        setJson
    };
})();