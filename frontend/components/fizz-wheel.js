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
            const radius = width / 2 - 26;

            ctx.clearRect(0, 0, width, height);

            if (tasks.length === 0) {
                ctx.fillStyle = '#f3c45b';
                ctx.font = '800 13px Segoe UI, Arial, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeStyle = 'rgba(2, 8, 12, 0.9)';
                ctx.lineWidth = 3;
                ctx.strokeText('Добавь пятиминутки', centerX, centerY);
                ctx.fillText('Добавь пятиминутки', centerX, centerY);
                return;
            }

            const step = (2 * Math.PI) / tasks.length;
            const labelFontSize = tasks.length > 12 ? 9 : tasks.length > 8 ? 10 : 11.5;
            const maxLabelWidth = Math.max(42, radius * 0.48);

            function fitLabel(text) {
                const source = String(text || 'Пятиминутка');
                ctx.font = `800 ${labelFontSize}px Segoe UI, Arial, sans-serif`;
                if (ctx.measureText(source).width <= maxLabelWidth) return source;

                let label = source;
                while (label.length > 4 && ctx.measureText(label + '...').width > maxLabelWidth) {
                    label = label.slice(0, -1);
                }
                return label + '...';
            }

            for (let i = 0; i < tasks.length; i++) {
                const midAngle = i * step - Math.PI / 2 + step / 2;
                const label = fitLabel(tasks[i].text);

                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(midAngle);
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#f6c65d';
                ctx.strokeStyle = 'rgba(2, 8, 12, 0.94)';
                ctx.lineWidth = 3.5;
                ctx.font = `800 ${labelFontSize}px Segoe UI, Arial, sans-serif`;
                ctx.strokeText(label, radius * 0.72, 0);
                ctx.fillText(label, radius * 0.72, 0);
                ctx.restore();
            }
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
