(function () {
    function clampNumber(value, min, max) {
        const num = Number(value);
        if (Number.isNaN(num)) return min;
        return Math.min(max, Math.max(min, num));
    }

    function safeParseInt(value, fallback = 0) {
        const parsed = parseInt(value, 10);
        return Number.isNaN(parsed) ? fallback : parsed;
    }

    function safeParseFloat(value, fallback = 0) {
        const parsed = parseFloat(value);
        return Number.isNaN(parsed) ? fallback : parsed;
    }

    function getTodayRu() {
        return new Date().toLocaleDateString('ru-RU');
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        return String(text)
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#039;');
    }

    window.SLVUtils = {
        clampNumber,
        safeParseInt,
        safeParseFloat,
        getTodayRu,
        escapeHtml,
    };
})();