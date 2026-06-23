(function () {
    function renderChart(params) {
        const {
            chartElement,
            chartInstance,
            labels = [],
            values = [],
            ChartRef
        } = params || {};

        if (!chartElement || !ChartRef) return chartInstance || null;

        if (chartInstance && typeof chartInstance.destroy === 'function') {
            chartInstance.destroy();
        }

        const ctx = chartElement.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(76, 201, 240, 0.5)');
        gradient.addColorStop(1, 'rgba(76, 201, 240, 0.0)');

        return new ChartRef(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'XP',
                    data: values,
                    backgroundColor: gradient,
                    borderColor: '#4CC9F0',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: '#333' },
                        ticks: { color: '#888' }
                    },
                    x: { grid: { display: false } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }

    window.SLVChartUIEngine = {
        renderChart
    };
})();
