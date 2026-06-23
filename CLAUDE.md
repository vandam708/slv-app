# SLV Project: Cloud

Личный геймифицированный PWA-трекер привычек/энергии/здоровья/духовности («Стал Лучше Чем Вчера»). Пользователь — автор (vandam708@gmail.com) и сын Богдан. Язык UI и общения — русский.

## ⚠️ Где код
- **Актуальная версия (работаем тут): `slv-app/`** — Vite+React+TS rewrite с дизайном Neumorphic Soft-3D.
- `index.html` + `src/` в корне — **легаси** (старый vanilla-JS однофайловик). Только как референс, не трогать.

## Стек (slv-app/)
Vite 8 · React 19 · TypeScript · Tailwind v3 · Three.js (@react-three/fiber, drei) · Framer Motion · Zustand · Firebase (Auth+Firestore) · Chart.js · crypto-js · vite-plugin-pwa.

## Команды
```
cd slv-app
npm run dev      # дев-сервер (порт 5188 в .claude/launch.json)
npm run build    # прод-сборка в dist/ (typecheck + vite build)
```
Дев-превью залогиненного UI без Google-входа: открыть `?demo` (только dev).

## Архитектура slv-app/src
- `domain/` — чистая логика: `config.ts` (задачи/нутриенты/аватары), `logic.ts` (XP, уровни, скоринг аватара, стрики, графики).
- `lib/` — `firebase.ts`, `crypto.ts` (AES-сейф), `date.ts` (формат ru-RU), `fx.ts` (частицы +XP), `cn.ts`.
- `store/` — `useStore.ts` (Zustand: зеркало localStorage + sync), `selectors.ts` (деривация конфигов), `actions.ts` (все мутации/XP-правила).
- `components/ui/` — дизайн-система (NeoCard, NeoButton, NeoProgress, bits).
- `components/viz/` — живые визуалы: `Liquid` (вода), `Atmosphere` (воздух), `SleepClock` (сон), `LottoBarrel` (барабан 5-минуток).
- `components/three/Orb.tsx` — WebGL-шар (ленивый).
- `screens/` — Auth, Dashboard(+dash/*), Bogdan, Stats, Editor, Masters, Secret.

## 🔒 Критично: совместимость данных
Схема ключей localStorage и документ Firestore сохранены **1:1 с легаси** — у пользователя реальные облачные данные. НЕ переименовывать ключи.
- Даты — `toLocaleDateString('ru-RU')` → `dd.mm.yyyy`.
- Sync-ключи: всё на `slv_*` плюс `bogdan_config_tasks`.
- Firebase проект тот же: `slv-project-a51ff`.

## Дизайн
Neumorphic Soft-3D: тёмная база `#1b212c`, мягкие выпуклые тени (`shadow-neo*`), единый акцент cyan `#4cc9f0` + приглушённые семантические цвета по доменам. Адаптив телефон+десктоп. Анимации заполнения шкал — `spring, bounce:0` (без отскока). Реальный WebGL в ключевых местах.

## Gotchas (важно при отладке)
- **Превью-вкладка часто `document.hidden` → браузер ставит `requestAnimationFrame` на паузу.** Тогда НЕ работают: WebGL-шар, лото-барабан, переходы между экранами (framer AnimatePresence), скриншоты WebGL-страниц зависают. Это не баг кода — проверять анимации в активном окне. Статику/раскладку можно проверять через DOM.
- **HMR иногда отдаёт устаревший модуль** (правка не применяется, рендер старой версии). Лечится перезапуском дев-сервера (preview_stop → preview_start).
- Google-вход и реальную облачную синхронизацию headless проверить нельзя (нужен popup) — просить пользователя.

## Статус
Rewrite доведён до рабочего состояния; идёт полировка визуалов по фидбеку пользователя. Подробности эволюции — в авто-памяти (`MEMORY.md`).
