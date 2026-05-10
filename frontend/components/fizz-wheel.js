(function () {
    function createFizzWheel(options = {}) {
        const canvas = document.getElementById(options.canvasId || 'fizzWheel');

        function draw(tasks = []) {
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;
            const radius = width / 2 - 5;
            ctx.clearRect(0, 0, width, height);

            if (tasks.length === 0) {
                ctx.fillStyle = '#333';
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
                ctx.fill();
                ctx.fillStyle = '#FFB703';
                ctx.font = 'bold 14px Segoe UI';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Добавь пятиминутки', centerX, centerY);
                return;
            }

            const step = (2 * Math.PI) / tasks.length;
            const colors = ['#FFB703', '#FB8500', '#FFD166', '#E09F3E', '#F4A261', '#FFD60A'];
            const labelFontSize = tasks.length > 10 ? 10 : tasks.length > 6 ? 11 : 13;
            const maxLabelWidth = Math.max(42, radius * 0.58);

            function fitLabel(text) {
                const source = String(text || 'Пятиминутка');
                if (ctx.measureText(source).width <= maxLabelWidth) return source;
                let label = source;
                while (label.length > 4 && ctx.measureText(label + '...').width > maxLabelWidth) {
                    label = label.slice(0, -1);
                }
                return label + '...';
            }

            for (let i = 0; i < tasks.length; i++) {
                const startAngle = i * step - Math.PI / 2;
                const endAngle = startAngle + step;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, startAngle, endAngle);
                ctx.closePath();
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#10151f';
                ctx.stroke();
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(startAngle + step / 2);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#111620';
                ctx.font = `800 ${labelFontSize}px Segoe UI`;
                ctx.fillText(fitLabel(tasks[i].text), radius * 0.58, 0);
                ctx.restore();
            }

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            ctx.lineWidth = 4;
            ctx.strokeStyle = '#111620';
            ctx.stroke();
        }

        return {
            mount() {
                draw([]);
            },
            update(state = {}) {
                const { tasks = [], selectedTask = null } = state;
                draw(Array.isArray(tasks) ? tasks : []);
                return { tasks, selectedTask };
            },
            spin() {},
            destroy() {}
        };
    }

    window.SLVFrontend = window.SLVFrontend || {};
    window.SLVFrontend.createFizzWheel = createFizzWheel;
})();
