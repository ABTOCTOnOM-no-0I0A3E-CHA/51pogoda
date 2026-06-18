# Погода Заполярья — PROJECT MAP

Региональный погодный сервис для Мурманска и Мурманской области: прогноз для
**224 точек** (города, посёлки, сёла, маяки, КПП, аэродромы, турбазы, рыболовные
лагеря) с акцентом на местный контекст — полярный день/ночь, метеограммы yr.no,
ИИ-сводка «простым языком».

Стек: **Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Bun**.
Этот файл — карта для быстрого въезда: как работает, где что лежит, за что отвечает.

---

## Запуск

```bash
bun install
bun run dev        # next dev (http://localhost:3000)
bun run build      # next build
bun run start      # next start (прод)
bun run typecheck  # tsc --noEmit
bun run lint       # eslint .
bun test           # юнит-тесты (bun:test)
```

**Рантайм — Bun**, не Node: `bunfig.toml` содержит `[run] bun = true`, поэтому все
`bun run <script>` исполняются Bun'ом. `proxy.ts` (бывший middleware) работает в
**Node-рантайме** Next 16 — там доступен `fs`.

Переменные окружения (`.env`, gitignored; пример — `.env.example`):

| Переменная | Назначение |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | базовый URL (canonical, sitemap, OG) |
| `MET_USER_AGENT` | контактный UA для api.met.no (требование ToS; example.com → 403) |
| `GIGACHAT_AUTH_KEY` | base64-ключ авторизации GigaChat (Сбер) |
| `GIGACHAT_SCOPE` | `GIGACHAT_API_PERS` \| `_B2B` \| `_CORP` |
| `GIGACHAT_MODEL` | опц. (`GigaChat` \| `GigaChat-Pro` \| `GigaChat-Max`) |
| `ADMIN_PASSWORD` | пароль входа в админку (без него админка недоступна) |
| `ADMIN_SESSION_SECRET` | секрет подписи сессионной куки (иначе деградирует на пароль) |

---

## Карта файлов

### `app/` — роуты (App Router)

```
app/
├── layout.tsx              корневой layout: <html>, шрифт Inter (next/font), SiteHeader, метадата
├── page.tsx                / — главная. force-dynamic, читает куки → рендерит views/home
├── [city]/page.tsx         /<slug> — страница точки. revalidate 1800, generateStaticParams (kind="город")
├── [city]/opengraph-image.tsx   og:image точки (next/og, 1200×630)
├── opengraph-image.tsx     og:image главной
├── manifest.ts             PWA-манифест (установка на домашний экран)
├── robots.ts, sitemap.ts   SEO (sitemap по всем точкам через registry)
├── not-found.tsx           404
├── api/
│   ├── meteogram/[id]/route.ts   прокси yr.no SVG-метеограммы (SSRF-фильтр 2-\d{4,9}, i18n, CSP)
│   └── admin/                    защищённые API админки (каждый сам проверяет сессию):
│       ├── cache/route.ts        POST: revalidateTag(weather|ai[:slug], "max")
│       ├── cities/route.ts       GET/POST/PUT/DELETE кастомных точек
│       ├── prompts/route.ts      GET/POST глобального и по-городских промптов
│       └── analytics/route.ts    GET статистики / DELETE сброс
└── admin/
    ├── actions.ts          server actions: loginAction (throttle+пароль→кука), logoutAction
    ├── admin.module.css    стили админки
    ├── login/page.tsx      форма входа (useActionState)
    └── (dash)/             route-group защищённой части (свой layout, force-dynamic):
        ├── layout.tsx          навигация + «Выйти»
        ├── page.tsx            обзор (счётчики)
        ├── analytics/page.tsx + ResetButton.tsx
        ├── cache/page.tsx     + CacheManager.tsx
        ├── cities/page.tsx    + CitiesManager.tsx   (add/edit/delete)
        └── prompts/page.tsx   + PromptsManager.tsx
```

### `src/` — Feature-Sliced Design

Слои (сверху вниз по зависимостям): `app-styles → shared → entities → features → widgets → views`.
Импортировать можно только «вниз». Алиас `@/*` → `./src/*`.

```
src/
├── app/styles/globals.css      глобальные стили, адаптив, .full-bleed-mobile, скелетоны

├── shared/                     переиспользуемое, без доменной логики
│   ├── config/site.ts          SITE (имя, url, описание), MET_USER_AGENT, FORECAST_REVALIDATE=1800
│   ├── lib/
│   │   ├── daylight.ts             полярный день/ночь по координатам и дате
│   │   ├── format.ts               форматтеры (tempStr, headerDate …)
│   │   ├── visit-cookie.ts         parse/serialize кук pv (визиты) и pr (недавние)
│   │   ├── admin-session.ts        HMAC-сессия (Web Crypto): verifyPassword, create/verifySessionToken
│   │   ├── admin-guard.ts          isAdminAuthed() для route handlers (через next/headers cookies)
│   │   ├── login-throttle.ts       per-IP анти-брутфорс (5 попыток/15мин → блок), in-memory
│   │   └── analytics-store.ts      счётчик просмотров: recordHit/getAnalytics/resetAnalytics (fs, НЕ server-only)
│   ├── og/render.tsx           renderOg() — OG-картинки; рядом Inter-*.ttf (читаются с диска)
│   └── ui/                     JsonLd, PolarBadge, Skeleton

├── entities/
│   ├── city/
│   │   ├── model/cities.ts         CITIES (224 встроенных, client-safe), getCity/getCapital/getRegionCities
│   │   ├── model/types.ts          City, CityKind
│   │   ├── lib/lookup.ts           getCityByYrId (по встроенным)
│   │   ├── lib/registry.ts         ★ server-only: merge встроенных + кастомных (data/custom-cities.json).
│   │   │                             getAllCities/getCityMerged/getRegionCitiesMerged, addCity/updateCity/deleteCity
│   │   ├── lib/city-validation.ts  чистая валидация (slug, атрибуты) — без fs, под тесты
│   │   └── index.ts                публичный barrel (CITIES, City, getCity… — client-safe)
│   └── weather/
│       ├── api/
│       │   ├── met-client.ts       fetchMetForecast (Data Cache: revalidate 1800, tags weather/weather:slug, 3 ретрая)
│       │   ├── build-weather.ts    buildCityWeather — парсинг ответа MET в CityWeather
│       │   ├── met-types.ts        типы ответа api.met.no
│       │   ├── get-weather.ts      getCityWeather (React cache, дедуп) + getCitiesWeather (батчи по 4)
│       │   ├── gigachat.ts         ★ вызов GigaChat через undici + кастомный CA (сертификаты Минцифры)
│       │   ├── gigachat-ca.ts      PEM корневого/промежуточного УЦ
│       │   └── ai-summary.ts       getAiSummary: unstable_cache(3600, tags ai/ai:slug), 3 ретрая, фильтр правил, fallback
│       ├── lib/
│       │   ├── summary.ts          buildSummary — детерминированная сводка (fallback без LLM) + склонения
│       │   ├── prompt-store.ts     ★ server-only: промпты (data/ai-prompts.json), getPromptTemplate, set*
│       │   ├── prompt-template.ts  чистый рендер шаблона {city}/{data} + DEFAULT_GLOBAL_PROMPT (под тесты)
│       │   ├── meteogram-i18n.ts   перевод подписей в SVG-метеограмме yr.no
│       │   ├── apparent.ts, condition.ts, chart.ts   ярлыки/иконки/конфиг графика
│       ├── model/types.ts          CityWeather, CurrentWeather, HourPoint, DayPoint
│       └── ui/                     WeatherIcon, TempChart

├── features/
│   ├── city-search/            клиентский поиск в шапке (zustand store); custom-точки приходят пропом
│   └── param-tooltip/          тултипы к параметрам погоды (zustand store)

├── widgets/                    композитные блоки UI (см. ниже «Страницы»)
│   ├── site-header (★ server: подмешивает кастомные точки в поиск), site-footer
│   ├── home-hero, city-hero, ai-summary, meteogram, rain-map (Windy iframe)
│   ├── cities-grid, current-params, daily-forecast, hourly-table
│   └── locations-catalog, sun-card, other-cities-cta

└── views/
    ├── home/ui/HomePage.tsx    сборка главной (Suspense-блоки: Hero, Ai, Meteo, Cities)
    └── city/ui/CityPage.tsx    сборка страницы точки (Hero, Ai, Meteo, Details)

proxy.ts                        ★ per-request хук (Node): защита /admin, трекинг кук визитов, recordHit аналитики
data/                           рантайм-данные (gitignored): custom-cities.json, ai-prompts.json, analytics.json
```

★ — модули с неочевидной ролью, см. «Конвенции и подводные камни».

---

## Как это работает

### Источники данных
- **MET Norway** (`api.met.no`) — прогноз по координатам, только реальные данные.
  `fetchMetForecast` кэшируется в Next Data Cache (revalidate 1800, теги для сброса).
  Список городов запрашивается батчами по 4 (троттлинг). `React.cache()` дедупит
  запрос в пределах одного рендера.
- **yr.no meteogram** — официальная SVG на 2 суток, проксируется через
  `/api/meteogram/[id]` (обход CORS/hotlink, перевод подписей, CSP). Если не
  загрузилась — клиент рисует свой почасовой график (`MeteoFallbackChart`).
- **GigaChat (Сбер)** — ИИ-сводка. Вызов идёт через `undici` с кастомным CA
  (сертификаты Минцифры нет в дефолтном бандле; TLS НЕ отключается). 3 ретрая +
  фильтр запрещённых тем (УФ/крем неактуальны в Заполярье). Любая ошибка → детермин.
  fallback `buildSummary`.
- **Windy** — iframe с картой осадков (ECMWF), без API-ключа.

### Модель рендеринга
- **Главная `/`** — `force-dynamic`: читает куки на сервере (персонализация без
  мерцания), полный ре-рендер на каждый запрос. Блоки стримятся через `<Suspense>`.
- **Страница точки `/[city]`** — ISR `revalidate 1800`. На сборке пререндерятся
  только `kind="город"` (16 шт.); остальные — on-demand (`dynamicParams`).
- **Деградация при сбое MET** — страница не падает: герой → `HeroUnavailable`,
  метеограмма и рассвет/закат рендерятся независимо.

### Кэш и инвалидация
- Погода: теги `weather`, `weather:<slug>` на fetch (Data Cache).
- ИИ: теги `ai`, `ai:<slug>` на `unstable_cache`.
- Сброс из админки: `revalidateTag(tag, "max")` (второй аргумент обязателен в Next 16).
- Добавление/правка точки: `revalidatePath("/")`, `/sitemap.xml`, `/<slug>`.

### Персонализация (cookie-based, в `proxy.ts`)
- `pv` — визиты по каждому slug; `pr` — последние 5 посещённых.
- **Предпочитаемый город** на главной: ≥5 визитов И ≥2× отрыв от второго → в герой.
- **«Недавно смотрели»** и badge «смотрели» в сетке.

### Админка (`/admin`)
- **Авторизация без регистрации**: `ADMIN_PASSWORD` → HMAC-подписанная httpOnly-кука
  (stateless, без БД). `proxy.ts` редиректит неавторизованных на `/admin/login`;
  API-роуты (матчер proxy исключает `/api`) проверяют сессию сами. Логин под
  per-IP троттлингом.
- **Разделы**: обзор · аналитика · кеш (сброс погоды/ИИ) · промпты (глобальный +
  по городу) · точки (add/edit/delete). UI-страницы — серверные, читают стораджи;
  мутации идут через `/api/admin/*` (клиентские *Manager-компоненты).

### Аналитика
- Самохостовая, без кук и внешних скриптов (адблок не режет). `recordHit` в
  `proxy.ts` (срабатывает на каждый запрос, в т.ч. на ISR-страницах). Копится в
  памяти процесса, флашится в `data/analytics.json` пачкой (порог 20 / 10с).
  В админке боты/несуществующие slug отфильтрованы (резолв в реальную точку).

### OG-картинки и PWA
- `opengraph-image.tsx` (главная + `[city]`) → `renderOg` (`src/shared/og`).
  Мета `og:image`/`twitter:image` вшивается Next автоматически. Шрифт Inter —
  статические TTF в репо, читаются `fs.readFileSync` (без рантайм-фетча).
- `manifest.ts` делает сайт устанавливаемым.

---

## Конвенции и подводные камни

- **client-safe vs server-only.** `cities.ts`/`index.ts` (entities/city) — без `fs`,
  т.к. `CITIES` импортит клиентский `CitySearch`. Вся логика merge со встроенными +
  кастомными живёт в **server-only** `registry.ts`. В серверных путях используем
  `getCityMerged`/`getAllCities`/`getRegionCitiesMerged`; клиентский поиск получает
  кастомные точки **пропом** из серверного `SiteHeader`. То же разделение: `prompt-store`
  (server-only) ↔ `prompt-template` (чистый).
- **Файловые стораджи в `data/`** (`registry`, `prompt-store`, `analytics-store`).
  Route handlers и рендеры страниц — разные бандлы ⇒ **разные инстансы модуля**,
  in-memory кэш между ними не шарится. Синхронизация — через **mtime файла**
  (перечитываем при изменении). `analytics-store` НЕ server-only — его импортит `proxy`.
- **Single-process допущение.** In-memory счётчик аналитики и login-throttle живут в
  одном процессе. При горизонтальном масштабировании их (и `data/`) надо выносить в
  общий стор (Redis/KV).
- **Записи в `data/` неатомарны** (`writeFileSync`) — окно порчи при краше; при
  битом JSON стор откатывается на дефолт (= потеря данных). Кандидат на temp+rename.
- **TS/линт.** `baseUrl` удалён (deprecated в TS6), пути через `paths`. `*.test.ts`
  исключены из `tsc`. ESLint — flat config (`eslint.config.mjs`), версия 9 (10
  несовместима с бандлёным typescript-eslint).
- **Тесты** запускает `bun test` (рантайм-типы Bun); модули с `import "server-only"`
  напрямую не тестируются — поэтому чистую логику выносим в отдельные модули.

---

## Тех-долг и известные ограничения

- **Мёртвые зависимости:** `leaflet`, `react-leaflet`, `@types/leaflet` нигде не
  импортятся (карта осадков — Windy iframe). Можно удалить.
- **Покрытие тестами:** 41 юнит-тест (HMAC-сессия, валидация точек, рендер промпта).
  Не покрыто: `buildCityWeather` (парсинг MET — главный кандидат на баги),
  `visit-cookie`, агрегация аналитики, E2E админки.
- **MET-fallback** можно улучшить: показывать последние кэшированные данные с
  временем устаревания вместо «временно недоступно».
- **Аналитика:** хранилище не ограничено (мусорные slug пишутся, фильтр только на
  отображении) — стоит валидировать slug до записи или капать число ключей/день.
- **Атомарность записи** файловых сторов (см. подводные камни).
- **Склонения:** `cityInflected` (summary.ts) покрывает ~12 городов; заголовок
  страницы спецкейсит только Мурманск.
- **Заголовки безопасности** (`next.config.ts`): есть `X-Frame-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `nosniff`. Нет HSTS и site-wide CSP
  (CSP только на SVG-прокси) — обычно вешают на реверс-прокси/CDN.
- **PWA-оффлайн** сознательно не делаем: погоде нужны свежие данные, SW-кэш отдаёт
  устаревший прогноз.
