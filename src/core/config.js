(function () {
    const XP_PER_LEVEL = 150;

    const DEFAULT_TASKS = {
        slv: [
            { id: 't1', text: 'Утренняя зарядка', xp: 10 },
            { id: 't2', text: 'Основная работа', xp: 20 },
            { id: 't3', text: 'Программирование', xp: 15 },
            { id: 't7', text: 'Контент', xp: 15 }
        ],
        bogdan: [
            { id: 'b1', text: 'Спорт / Капоэйра', xp: 15 },
            { id: 'b6', text: 'Шахматы', xp: 10 }
        ],
        sport: [
            { id: 's1', text: 'Отжимания', rate: 0.5 },
            { id: 's2', text: 'Приседания', rate: 0.2 }
        ],
        fizz: [
            { id: 'f1', text: 'Прыжки', xp: 5 },
            { id: 'f2', text: 'Растяжка', xp: 5 },
            { id: 'f3', text: 'Махи руками', xp: 5 },
            { id: 'f4', text: 'Пресс', xp: 5 }
        ],
        shadow: [
            { id: 'sh1', text: 'Не сквернословил', xp: 20 },
            { id: 'sh2', text: 'Без вредной еды', xp: 15 }
        ],
        soul: [
            { id: 'so1', text: 'Молитва', xp: 15 },
            { id: 'so2', text: 'Чтение Евангелия', xp: 20 },
            { id: 'so3', text: 'Доброе дело', xp: 25 }
        ]
    };

    const NUTRI_CONFIG = [
        { id: 'prot', label: '🥩 Белок', color: 'var(--nutri-protein)', calc: (w) => Math.ceil(w * 0.07) },
        { id: 'vege', label: '🥦 Зелень', color: 'var(--nutri-vege)', calc: () => 5 },
        { id: 'carb', label: '🔋 Угли', color: 'var(--nutri-carbs)', calc: (w) => Math.ceil(w * 0.05) },
        { id: 'fats', label: '🥑 Жиры', color: 'var(--nutri-fats)', calc: (w) => Math.ceil(w * 0.04) },
        { id: 'calc', label: '🦴 Кальций', color: 'var(--nutri-calcium)', calc: () => 2 }
    ];

    const AVATAR_IMAGES = {
        weak: './assets/avatars/avatar-weak.jpeg',
        mid: './assets/avatars/avatar-mid.jpeg',
        god: './assets/avatars/avatar-god.jpeg'
    };

    window.SLVConfig = {
        XP_PER_LEVEL,
        DEFAULT_TASKS,
        NUTRI_CONFIG,
        AVATAR_IMAGES
    };
})();