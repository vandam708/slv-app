// Domain configuration — mirrors the original SLVConfig exactly so cloud data stays compatible.

export const XP_PER_LEVEL = 150;

export interface Task {
  id: string;
  text: string;
  xp: number;
}

export interface SportExercise {
  id: string;
  text: string;
  rate: number;
}

export interface Idea {
  emoji: string;
  text: string;
}

/** The second tab is a user-configurable "focus profile" (default: БогданTime). */
export interface FocusProfile {
  name: string;
  emoji: string;
}

export const DEFAULT_FOCUS: FocusProfile = { name: 'БогданTime', emoji: '👦' };

export interface NutriCat {
  id: string;
  label: string;
  emoji: string;
  color: string;
  calc: (weight: number) => number;
  help: string;
}

export const DEFAULT_TASKS = {
  slv: [
    { id: 't1', text: 'Утренняя зарядка', xp: 10 },
    { id: 't2', text: 'Основная работа', xp: 20 },
    { id: 't3', text: 'Программирование', xp: 15 },
    { id: 't7', text: 'Контент', xp: 15 },
  ] as Task[],
  bogdan: [
    { id: 'b1', text: 'Спорт / Капоэйра', xp: 15 },
    { id: 'b6', text: 'Шахматы', xp: 10 },
  ] as Task[],
  sport: [
    { id: 's1', text: 'Отжимания', rate: 0.5 },
    { id: 's2', text: 'Приседания', rate: 0.2 },
  ] as SportExercise[],
  fizz: [
    { id: 'f1', text: 'Прыжки', xp: 5 },
    { id: 'f2', text: 'Растяжка', xp: 5 },
    { id: 'f3', text: 'Махи руками', xp: 5 },
    { id: 'f4', text: 'Пресс', xp: 5 },
  ] as Task[],
  shadow: [
    { id: 'sh1', text: 'Не сквернословил', xp: 20 },
    { id: 'sh2', text: 'Без вредной еды', xp: 15 },
  ] as Task[],
  soul: [
    { id: 'so1', text: 'Молитва', xp: 15 },
    { id: 'so2', text: 'Чтение Евангелия', xp: 20 },
    { id: 'so3', text: 'Доброе дело', xp: 25 },
  ] as Task[],
};

export const NUTRI_CONFIG: NutriCat[] = [
  { id: 'prot', label: 'Белок', emoji: '🥩', color: '#ef6f8f', calc: (w) => Math.ceil(w * 0.07), help: 'Мясо, Рыба, Яйца, Творог.' },
  { id: 'vege', label: 'Зелень', emoji: '🥦', color: '#5fd38a', calc: () => 5, help: 'Овощи, Салат, Зелень, Фрукты.' },
  { id: 'carb', label: 'Угли', emoji: '🔋', color: '#f5b14c', calc: (w) => Math.ceil(w * 0.05), help: 'Крупы, Хлеб, Паста, Картофель.' },
  { id: 'fats', label: 'Жиры', emoji: '🥑', color: '#9d7be8', calc: (w) => Math.ceil(w * 0.04), help: 'Орехи, Масло, Авокадо, Сыр.' },
  { id: 'calc', label: 'Кальций', emoji: '🦴', color: '#7fd1e8', calc: () => 2, help: 'Молочка, Творог, Кунжут.' },
];

export const AVATAR_IMAGES = {
  weak: './avatars/avatar-weak.jpeg',
  mid: './avatars/avatar-mid.jpeg',
  god: './avatars/avatar-god.jpeg',
};

export const MASTERS = [
  { emoji: '💻', name: 'ТурВозЛи', role: 'Мастер Кода', color: '#4cc9f0' },
  { emoji: '🧠', name: 'Фрейдунглоу', role: 'Психология', color: '#9d7be8' },
  { emoji: '🔮', name: 'Номерус', role: 'Нумерология', color: '#5fd38a' },
  { emoji: '⏱️', name: 'Алтрэйпорт', role: 'Тайм-менеджмент', color: '#f5b14c' },
  { emoji: '🥋', name: 'БимПаст', role: 'Спорт', color: '#ef6f6f' },
];

export const BOGDAN_IDEAS: Idea[] = [
  { emoji: '♟️', text: 'Шахматы' },
  { emoji: '🥋', text: 'Капоэйра' },
  { emoji: '💻', text: 'Scratch' },
  { emoji: '🎸', text: 'Гитара' },
  { emoji: '🎬', text: 'Монтаж' },
];
