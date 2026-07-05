import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика конфиденциальности сайта Норметео — обработка cookie, данных Яндекс.Метрики и прав пользователей.",
  alternates: { canonical: "/politika" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="content-padding" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 48px" }}>
      <nav style={{ fontSize: 13, color: "#6d7f8e", marginBottom: 16 }}>
        <Link href="/" style={{ color: "#0b5cad", fontWeight: 600 }}>Главная</Link>
        <span style={{ margin: "0 6px" }}>·</span>
        <span style={{ color: "#5a6b7b" }}>Политика конфиденциальности</span>
      </nav>

      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.02em" }}>Политика конфиденциальности</h1>
      <p style={{ fontSize: 13, color: "#6d7f8e", marginTop: 6 }}>Редакция от {new Date().toLocaleDateString("ru-RU")}</p>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>1. Общие положения</h2>
        <p style={pStyle}>
          Настоящая Политика определяет порядок обработки персональных данных пользователей сайта{" "}
          <strong>{SITE.name}</strong> (<a href={SITE.url} style={linkStyle}>{SITE.url.replace("https://", "")}</a>)
          и регулирует права пользователей в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
          «О персональных данных».
        </p>
        <p style={pStyle}>
          Оператор персональных данных — владелец сайта {SITE.name}. Контактный адрес для вопросов по обработке
          персональных данных: <a href="mailto:contact@51pogoda.ru" style={linkStyle}>contact@51pogoda.ru</a>.
        </p>
        <p style={pStyle}>
          Используя сайт, пользователь соглашается с настоящей Политикой. Если пользователь не согласен с условиями,
          ему следует прекратить использование сайта.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>2. Какие данные собираются</h2>
        <p style={pStyle}>Сайт не требует регистрации и не запрашивает имя, фамилию, телефон или иные идентифицирующие данные. Обрабатываются только:</p>
        <ul style={{ ...pStyle, paddingLeft: 20, margin: "8px 0 0" }}>
          <li><strong>IP-адрес</strong> — автоматически при посещении; используется для определения региона и технической работы сервера.</li>
          <li><strong>Cookie Яндекс.Метрики</strong> — файлы <code>_ym_uid</code>, <code>_ym_d</code>, <code>_ym_ischeme</code>, <code>_ym_visorc</code> и др. для сбора статистики посещений.</li>
          <li><strong>Функциональные cookie сайта</strong> — <code>pv</code> (счётчик визитов по городам), <code>pr</code> (недавно просмотренные города), <code>pc</code> (закреплённый город главной). Нужны для персонализации и не передаются третьим лицам.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>3. Яндекс.Метрика</h2>
        <p style={pStyle}>
          Сайт использует сервис Яндекс.Метрика (счётчик 110283298) для анализа посещаемости и поведения пользователей.
          Метрика анонимизирует IP-адреса, собирает данные о просмотрах страниц, времени на сайте и кликах.
          Передача данных осуществляется в соответствии с{" "}
          <a href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Политикой конфиденциальности Яндекса
          </a>.
        </p>
        <p style={pStyle}>
          Пользователь может отключить передачу данных в Метрику, заблокировав cookie яндекса в настройках браузера
          или установив расширение для блокировки счётчиков (например, uBlock Origin, AdGuard).
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>4. Цели обработки</h2>
        <ul style={{ ...pStyle, paddingLeft: 20, margin: "8px 0 0" }}>
          <li>анализ посещаемости и популярности страниц;</li>
          <li>персонализация главной страницы (выбор города по истории визитов);</li>
          <li>обеспечение технической работоспособности сайта;</li>
          <li>улучшение контента и пользовательского опыта.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>5. Хранение и передача</h2>
        <p style={pStyle}>
          Персональные данные не передаются третьим лицам, кроме Яндекс.Метрики (аналитика) и хостинг-провайдера
          (техническое обслуживание). Срок хранения cookie — до 1 года для функциональных cookie сайта,
          согласно настройкам Яндекс.Метрики — для метрических. Данные не используются для принятия решений,
          порождающих юридические последствия в отношении пользователя.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>6. Права пользователя</h2>
        <p style={pStyle}>В соответствии со ст. 14–17 Закона № 152-ФЗ пользователь вправе:</p>
        <ul style={{ ...pStyle, paddingLeft: 20, margin: "8px 0 0" }}>
          <li>получить информацию об обрабатываемых данных;</li>
          <li>требовать уточнения, блокирования или уничтожения своих данных;</li>
          <li>отозвать согласие на обработку, отключив cookie в браузере;</li>
          <li>обращаться с запросами по адресу <a href="mailto:contact@51pogoda.ru" style={linkStyle}>contact@51pogoda.ru</a> — ответ в течение 30 дней.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>7. Cookie и их отключение</h2>
        <p style={pStyle}>
          Пользователь может управлять cookie в настройках браузера: полностью запретить их сохранение, удалить
          существующие или настроить исключения. Отключение cookie не препятствует использованию сайта —
          прогноз погоды доступен без cookie, персонализация главной страницы будет отключена.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>8. Изменения Политики</h2>
        <p style={pStyle}>
          Оператор вправе изменять настоящую Политику. Актуальная версия размещена на данной странице с указанием
          даты редакции.
        </p>
      </section>
    </div>
  );
}

const pStyle = { margin: "8px 0", lineHeight: 1.65, fontSize: 14, color: "#3a4a58" } as const;
const linkStyle = { color: "#0b5cad", fontWeight: 600 } as const;
