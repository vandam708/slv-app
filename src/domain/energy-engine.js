(function () {
    function getEnergyText(val) {
        const n = Number(val);
        if (!Number.isFinite(n)) return "😐 Норма";
        if (n <= 2) return "🧟 Зомби";
        if (n <= 4) return "🐢 Вялость";
        if (n <= 6) return "😐 Норма";
        if (n <= 8) return "💪 Бодрость";
        return "🚀 Ракета";
    }

    window.SLVEnergyEngine = {
        getEnergyText
    };
})();