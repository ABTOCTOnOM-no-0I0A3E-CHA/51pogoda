import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/shared/config/site";

/* Страница не индексируется: содержит реквизиты оператора, не должна попадать в выдачу.
   force-dynamic: реквизиты берутся из runtime env (.env контейнера), при сборке
   они недоступны — пререндеринг запёк бы плейсхолдеры в HTML. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description: "Политика конфиденциальности сайта Норметео (51pogoda.ru).",
  robots: { index: false, follow: false },
};

/* Реквизиты оператора берутся из окружения (вне VCS) — не попадают в репозиторий.
   Если переменные не заданы — показывается плейсхолдер с указанием, что нужно
   прописать OPERATOR_* в .env. */
const OPERATOR = {
  name: process.env.OPERATOR_NAME ?? "[ укажите OPERATOR_NAME в .env ]",
  inn: process.env.OPERATOR_INN ?? "[ укажите OPERATOR_INN в .env ]",
  ogrnip: process.env.OPERATOR_OGRNIP ?? "[ укажите OPERATOR_OGRNIP в .env ]",
  region: process.env.OPERATOR_REGION ?? "[ укажите OPERATOR_REGION в .env ]",
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
      <p style={{ fontSize: 13, color: "#6d7f8e", marginTop: 6 }}>Редакция от 5 июля 2026</p>

      <section style={{ marginTop: 28 }}>
        <h2 style={h2Style}>1. Оператор персональных данных</h2>
        <p style={pStyle}>
          Оператор персональных данных — {OPERATOR.name}, ИНН {OPERATOR.inn}, ОГРНИП {OPERATOR.ogrnip},
          регион регистрации: {OPERATOR.region} (далее — «Оператор»). Полный адрес регистрации доступен
          по запросу на контактный адрес электронной почты. Оператор является владельцем сайта {SITE.name} ({SITE.url.replace("https://", "")}).
        </p>
        <p style={pStyle}>
          Контактный адрес для вопросов по обработке персональных данных:{" "}
          <a href="mailto:contact@51pogoda.ru" style={linkStyle}>contact@51pogoda.ru</a>.
        </p>
        <p style={pStyle}>
          Настоящая Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ
          «О персональных данных».
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>2. Категории обрабатываемых данных и цели обработки</h2>
        <p style={pStyle}>
          Сайт не требует регистрации и не запрашивает имя, фамилию, телефон или иные идентифицирующие
          данные напрямую. Обрабатываются следующие категории данных:
        </p>

        <h3 style={h3Style}>2.1. IP-адрес</h3>
        <ul style={ulStyle}>
          <li><strong>Категория:</strong> IP-адрес устройства пользователя, автоматически передаваемый при подключении к серверу.</li>
          <li><strong>Цель:</strong> техническое обеспечение доступа к сайту, определение региона для корректного отображения контента, защита от злоупотреблений (предотвращение DDoS, брутфорс-атак на админ-панель).</li>
          <li><strong>Срок хранения:</strong> в логах сервера и хостинг-провайдера — согласно их политикам хранения (до 90 дней); постоянного хранения в базах данных сайта не осуществляется.</li>
        </ul>

        <h3 style={h3Style}>2.2. Данные Яндекс.Метрики</h3>
        <ul style={ulStyle}>
          <li><strong>Категория:</strong> анонимизированные данные о посещаемости и поведении — cookie <code>_ym_uid</code>, <code>_ym_d</code>, <code>_ym_ischeme</code>, <code>_ym_visorc</code> и др., информация о просмотрах страниц, времени на сайте, источниках трафика.</li>
          <li><strong>Цель:</strong> анализ посещаемости страниц, популярности городов, поведения пользователей для улучшения контента и пользовательского опыта.</li>
          <li><strong>Срок хранения:</strong> cookie Яндекс.Метрики — до 1 года согласно настройкам счётчика; aggregated-данные в интерфейсе Метрики — согласно политике хранения Яндекса.</li>
        </ul>

        <h3 style={h3Style}>2.3. Функциональные cookie сайта</h3>
        <ul style={ulStyle}>
          <li><strong>Категория:</strong> cookie <code>pv</code> (счётчик визитов по городам), <code>pr</code> (недавно просмотренные города), <code>pc</code> (закреплённый город главной страницы).</li>
          <li><strong>Цель:</strong> персонализация главной страницы — выбор города-героя по истории визитов, блок «Недавно смотрели», отметка посещённых городов в каталоге.</li>
          <li><strong>Срок хранения:</strong> 1 год с момента последнего обновления.</li>
        </ul>

        <h3 style={h3Style}>2.4. Cookie-уведомление</h3>
        <ul style={ulStyle}>
          <li><strong>Категория:</strong> cookie <code>cookie-notice-dismissed</code> — признак закрытия баннера о cookie.</li>
          <li><strong>Цель:</strong> не показывать информационный баннер повторно.</li>
          <li><strong>Срок хранения:</strong> бессрочно (до очистки localStorage пользователем).</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>3. Передача данных третьим лицам</h2>
        <p style={pStyle}>
          Функциональные cookie сайта (<code>pv</code>, <code>pr</code>, <code>pc</code>, <code>cookie-notice-dismissed</code>)
          не передаются третьим лицам и хранятся исключительно в браузере пользователя.
        </p>
        <p style={pStyle}>
          Данные Яндекс.Метрики (включая IP-адрес в анонимизированном виде) передаются сервису
          Яндекс.Метрика (счётчик 110283298), operated by ООО «Яндекс». Обработка данных Яндекс.Метрикой
          осуществляется в соответствии с{" "}
          <a href="https://yandex.ru/legal/confidential/" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Политикой конфиденциальности Яндекса
          </a>{" "}
          и{" "}
          <a href="https://yandex.ru/legal/yan_dpa_ch_ru/ru" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            Соглашением об обработке персональных данных РСЯ
          </a>. IP-адреса анонимизируются на стороне Яндекса.
        </p>
        <p style={pStyle}>
          IP-адреса также обрабатываются хостинг-провайдером (для технического обеспечения работы сервера)
          в соответствии с его политикой конфиденциальности. Иных передач третьим лицам не осуществляется.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>4. Права пользователя</h2>
        <p style={pStyle}>
          В соответствии со ст. 14–17 Федерального закона № 152-ФЗ «О персональных данных» пользователь
          имеет право:
        </p>
        <ul style={ulStyle}>
          <li>получать информацию об обрабатываемых персональных данных;</li>
          <li>требовать уточнения, блокирования или уничтожения своих персональных данных;</li>
          <li>отозвать согласие на обработку, отключив cookie в настройках браузера или очистив localStorage;</li>
          <li>обращаться с запросами к Оператору по адресу <a href="mailto:contact@51pogoda.ru" style={linkStyle}>contact@51pogoda.ru</a> — ответ предоставляется в течение 30 дней с момента поступления обращения;</li>
          <li>обжаловать действия или бездействие Оператора в уполномоченном органе — Федеральной службе по надзору в сфере связи, информационных технологий и массовых коммуникаций (Роскомнадзор), <a href="https://rkn.gov.ru/" target="_blank" rel="noopener noreferrer" style={linkStyle}>rkn.gov.ru</a>, адрес: 109074, Москва, Китайгородский проезд, д. 7, стр. 2.</li>
        </ul>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>5. Cookie и отключение</h2>
        <p style={pStyle}>
          Пользователь может управлять cookie в настройках браузера: полностью запретить их сохранение,
          удалить существующие или настроить исключения для отдельных сайтов. Отключение cookie не
          препятствует использованию сайта — прогноз погоды доступен без cookie, персонализация главной
          страницы (выбор города по истории) будет отключена.
        </p>
        <p style={pStyle}>
          Для отключения передачи данных в Яндекс.Метрику пользователь может заблокировать cookie домена
          <code> mc.yandex.ru</code> в настройках браузера или использовать расширения для блокировки
          счётчиков (uBlock Origin, AdGuard и подобные).
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>6. Меры безопасности</h2>
        <p style={pStyle}>
          Оператор принимает необходимые организационные и технические меры для защиты персональных данных
          от неправомерного доступа, копирования, блокирования, изменения и уничтожения. Сайт работает
          по HTTPS, cookie передаются только по зашифрованному соединению. Административная панель
          защищена паролем с per-IP ограничением попыток входа.
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>7. Изменения Политики</h2>
        <p style={pStyle}>
          Оператор вправе в одностороннем порядке изменять настоящую Политику. Актуальная версия
          размещена на данной странице с указанием даты редакции. Пользователю рекомендуется
          периодически знакомиться с актуальной редакцией.
        </p>
      </section>
    </div>
  );
}

const pStyle = { margin: "8px 0", lineHeight: 1.65, fontSize: 14, color: "#3a4a58" } as const;
const h2Style = { fontSize: 18, fontWeight: 800, marginBottom: 8, marginTop: 0 } as const;
const h3Style = { fontSize: 15, fontWeight: 700, margin: "14px 0 4px", color: "#22303b" } as const;
const ulStyle = { ...({ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.65, fontSize: 14, color: "#3a4a58" } as const) };
const linkStyle = { color: "#0b5cad", fontWeight: 600 } as const;
