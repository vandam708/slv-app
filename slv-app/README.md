# SLV Project: Cloud — v2

Полный rewrite личного трекера «Стал Лучше Чем Вчера» на современном стеке с цельным
**Neumorphic Soft-3D** дизайном и реальным WebGL.

## Стек

- **Vite 8 + React 19 + TypeScript**
- **Tailwind CSS** (дизайн-токены неоморфизма в `tailwind.config.js`)
- **Three.js + @react-three/fiber + drei** — реальные 3D-элементы (энергетический шар, био-ядро)
- **Framer Motion** — пружинные анимации, 3D-наклон карточек, переходы экранов
- **Zustand** — реактивный стор, зеркалирующий ключи localStorage
- **Firebase** (Auth + Firestore) — Google-вход и облачная синхронизация
- **Chart.js** — графики XP и тайной статистики
- **crypto-js** — AES-шифрование «Тайного блока» (zero-knowledge)
- **vite-plugin-pwa** — устанавливаемое офлайн-приложение

> Схема ключей localStorage и Firestore сохранена 1:1 с оригиналом — старые облачные данные подхватываются автоматически.

## Команды

```bash
npm install
npm run dev      # дев-сервер
npm run build    # продакшн-сборка в dist/ (+ service worker)
npm run preview  # предпросмотр собранного билда
```

## Архитектура

```
src/
  domain/      # чистая логика: config, xp, статистика, скоринг, графики
  lib/         # firebase, crypto, date, fx (частицы/XP), cn
  store/       # zustand-стор, селекторы (деривация конфигов), actions (мутации)
  components/
    ui/        # дизайн-система: NeoCard, NeoButton, NeoProgress, bits
    three/     # WebGL: Orb (ленивая загрузка Three.js)
    layout/    # Header, BottomNav
    XPChart    # обёртки Chart.js
  screens/     # Auth, Dashboard(+dash/*), Bogdan, Stats, Editor, Masters, Secret
```

Three.js, Firebase, Chart.js и сами экраны разнесены по отдельным чанкам и грузятся лениво —
первоначальная загрузка ~106 КБ gzip.

## Дев-режим

Открой `http://localhost:5173/?demo` чтобы посмотреть интерфейс залогиненного состояния
без Google-входа (только в dev, без облачной синхронизации).

## Деплой

Содержимое `dist/` — статика. Подойдёт любой хостинг (Firebase Hosting, Netlify, Vercel,
GitHub Pages). Для Firebase-входа добавь домен в Authentication → Settings → Authorized domains.
