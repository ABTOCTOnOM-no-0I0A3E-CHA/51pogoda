# Погода Заполярья

Прогноз погоды для Мурманска и городов Мурманской области. Данные — [MET Norway / yr.no](https://api.met.no/), серверный рендеринг, две страницы из дизайна Claude Design.

## Стек

- **Next.js 15** (App Router, React 19, TypeScript strict)
- **Feature-Sliced Design** — слоистая архитектура
- **Zustand** — клиентское состояние (поиск города, тултипы)
- **SSR + ISR** — серверный фетч прогноза с ревалидацией раз в 30 минут
- **SEO** — `generateMetadata`, JSON-LD, `sitemap.xml`, `robots.txt`, OpenGraph

## Запуск

```bash
npm install
cp .env.example .env.local   # опционально
npm run dev                  # http://localhost:3000
```

Прод-сборка:

```bash
npm run build
npm start
```

> Сборка тянет шрифт Golos Text и прогноз с `api.met.no` — нужен доступ в интернет.
> Если MET недоступен, страница рендерится на локальных фолбэк-данных (как и задумано в исходном макете).

## Архитектура (FSD)

```
app/                     Next App Router: только роутинг и SEO
  layout.tsx             общий layout, шрифт, метаданные, шапка
  page.tsx               / — главная
  [city]/page.tsx        /:city — страница города (SSG + ISR)
  sitemap.ts robots.ts not-found.tsx

src/
  app/                   FSD app-слой: глобальные стили
  views/                 FSD pages-слой (переименован, чтобы не конфликтовать с Next)
    home/  city/
  widgets/               композиционные блоки страниц
    site-header/ site-footer/ home-hero/ cities-grid/
    city-hero/ ai-summary/ meteogram/ current-params/
    sun-card/ hourly-table/ daily-forecast/ other-cities-cta/
  features/              пользовательские сценарии (Zustand)
    city-search/ param-tooltip/
  entities/              бизнес-сущности
    weather/             модель, MET-клиент, иконки, график, сводка
    city/                список городов области + координаты
  shared/                переиспользуемое
    config/ lib/ ui/
```

### Почему `views`, а не `pages`

Слой `pages` в FSD конфликтует с Pages Router в Next.js. Поэтому слой переименован
в `views` — единственное отступление от канона FSD, всё остальное по слоям.

## Источник данных

`entities/weather/api/met-client.ts` обращается к `locationforecast/2.0/complete`.
По [условиям API](https://api.met.no/doc/TermsOfService) обязателен идентифицирующий
`User-Agent` (см. `MET_USER_AGENT`), а координаты округляются до 4 знаков. Ответ
кэшируется Next с `revalidate`, чтобы не нагружать бесплатный API.
