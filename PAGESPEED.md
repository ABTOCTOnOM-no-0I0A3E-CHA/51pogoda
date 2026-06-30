# PageSpeed — план устранения всех проблем

> Lighthouse-аудит 51pogoda.ru (30.06.2026). Каждый пункт трассируется к конкретному файлу/строке.

---

## 🔴 Critical — LCP (1 940 ms задержка)

### 1. Метеограмма — LCP-элемент не в изначальном HTML

| Аспект | Значение |
|---|---|
| **Проблема** | `<img src="/api/meteogram/…">` — крупнейший элемент страницы, но рендерится внутри `<Suspense>`, который ждёт `getCityWeather` |
| **Файлы** | `src/widgets/meteogram/ui/MeteogramImage.tsx` (client‑компонент с `useEffect`);<br>`src/views/city/ui/CityPage.tsx:39–43`;<br>`src/views/home/ui/HomePage.tsx:42–44` |
| **Фикс** | Создать серверный компонент `<MeteogramImg>`, который рендерит `<img>` без `Suspense`. Метеограмма НЕ зависит от данных погоды (только `yrId`). Перенести выше в DOM. |

### 2. Отсутствует `fetchpriority="high"` на LCP-изображении

| Аспект | Значение |
|---|---|
| **Файл** | `src/widgets/meteogram/ui/MeteogramImage.tsx:16–22` |
| **Фикс** | Добавить `fetchpriority="high"` к `<img>` |

### 3. Нет `width`/`height` на метеограмме → CLS

| Аспект | Значение |
|---|---|
| **Файл** | `src/widgets/meteogram/ui/MeteogramImage.tsx:20` — `width:100%; height:auto` без явных размеров |
| **Фикс** | Добавить `width={800} height={240}` + `style={{ aspectRatio: "800/240" }}` |

---

## 🔴 Critical — 13.5 KiB полифиллов (Baseline)

### 4. Нет `browserslist` → Next.js транспилирует ES2024 в ES5

| Аспект | Значение |
|---|---|
| **Полифиллы** | `Array.prototype.at`, `.flat`, `.flatMap`, `Object.fromEntries`, `Object.hasOwn`, `String.prototype.trimEnd`, `.trimStart` |
| **Файл** | `package.json` — поле `browserslist` отсутствует |
| **Фикс** | Добавить `"browserslist": ["last 2 versions", "not dead", "not op_mini all"]` → SWC перестанет вставлять полифиллы для современного JS |

---

## 🟡 High — загрузка ресурсов

### 5. Нет preconnect к windy.com (экономия ~300 ms LCP)

| Аспект | Значение |
|---|---|
| **Файл** | `app/layout.tsx` — нет preconnect-hint в `<head>` |
| **Фикс** | Добавить `<link rel="preconnect" href="https://www.windy.com">` в корневой layout |

### 6. Windy iframe без `title` (Accessibility)

| Аспект | Значение |
|---|---|
| **Файл** | `src/widgets/rain-map/ui/RainMapInner.tsx:13` |
| **Фикс** | Добавить `title="Карта осадков — windy.com"` |

### 7. Windy iframe без `loading="lazy"`

| Аспект | Значение |
|---|---|
| **Файл** | `src/widgets/rain-map/ui/RainMapInner.tsx:13` |
| **Фикс** | Добавить `loading="lazy"` — iframe ниже Hero, не критичен для LCP |

### 8. RainMap без `<Suspense>`

| Аспект | Значение |
|---|---|
| **Файл** | `src/views/home/ui/HomePage.tsx:51–55` |
| **Фикс** | Обернуть `<RainMap />` в `<Suspense>` с фоллбэком (скелет карты) |

---

## 🟡 High — JavaScript

### 9. Windy embed — 1 230 ms на Script Evaluation

| Аспект | Значение |
|---|---|
| **Файл** | Внешний скрипт `embed.windy.com` |
| **Фикс** | Пункты 7–8 (`loading="lazy"` + `Suspense`) решают проблему — скрипты windy не блокируют главный поток при старте |

### 10. 25 KiB неиспользуемого кода в нашем бандле

| Аспект | Значение |
|---|---|
| **Файл** | `...chunks/2nykiepra7i1k.js` — 69 KiB, из них 25 KiB unused |
| **Фикс** | Пункт 4 (browserslist) убирает полифиллы. Дополнительно: проверить tree-shaking через `next build --debug` |

---

## 🟢 Medium — CSS, шрифты

### 11. Render-blocking CSS (3.1 KiB, 150 ms)

| Аспект | Значение |
|---|---|
| **Файл** | CSS-чанки Next.js |
| **Фикс** | `experimental.optimizeCss` в `next.config.ts`. Эффект минимален, т.к. CSS критичен для FCP |

### 12. Шрифты windy.com без `font-display`

| Аспект | Значение |
|---|---|
| **Фикс** | Не наша проблема — встроенный embed windy. Пропускаем. |

### 13. Кэш windy.com — 1 день (53 KiB без кэша)

| Аспект | Значение |
|---|---|
| **Фикс** | Внешний ресурс — не контролируем. Пропускаем. |

---

## 🟢 Medium — Контрастность (Accessibility)

### 14. Low contrast text — `color: #8a98a6`

| Аспект | Значение |
|---|---|
| **Где** | HomePage, CityPage, SiteFooter, CityCrossLinks, SeoBlock — десятки элементов с `#8a98a6` (2.85:1) на белом фоне |
| **Статус** | ✅ `#8a98a6` → `#6d7f8e` (4.5:1, WCAG AA) — заменено в 17 файлах |

---

## Порядок фиксов

1. ✅ `package.json` → browserslist
2. ✅ `app/layout.tsx` → preconnect windy.com
3. ✅ Server-компонент метеограммы + `fetchpriority="high"` + width/height
4. ✅ `RainMapInner.tsx` → title + loading=lazy
5. ✅ `HomePage.tsx` → Suspense вокруг RainMap
6. ✅ `CityPage.tsx` + `HomePage.tsx` → метеограмма без Suspense
7. ✅ Контрастность → затемнить цвета

---

*Создан 30.06.2026 по результатам Lighthouse audit. После деплоя — повторный прогон.*
