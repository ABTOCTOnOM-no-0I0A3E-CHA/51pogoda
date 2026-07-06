import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/shared/config/site";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Контакты",
  description: `Контактный email и форма обратной связи сайта ${SITE.name}. Вопросы, предложения, сообщения об ошибках прогноза.`,
  alternates: { canonical: "/contacts" },
};

export default function ContactsPage() {
  return (
    <div className="content-padding" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 48px" }}>
      <nav style={{ fontSize: 13, color: "#6d7f8e", marginBottom: 16 }}>
        <Link href="/" style={{ color: "#0b5cad", fontWeight: 600 }}>
          Главная
        </Link>
        <span style={{ margin: "0 6px" }}>·</span>
        <span style={{ color: "#5a6b7b" }}>Контакты</span>
      </nav>

      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.02em" }}>
        Контакты
      </h1>
      <p style={{ fontSize: 13, color: "#6d7f8e", marginTop: 6 }}>Email и форма обратной связи</p>

      <section style={{ marginTop: 28 }}>
        <p style={pStyle}>
          Вопросы, предложения, сообщения об ошибках и неточностях прогноза приветствуются.
          Мы отвечаем в течение 1-2 дней.
        </p>
        <p style={pStyle}>
          Email:{" "}
          <a href="mailto:contact@51pogoda.ru" style={linkStyle}>
            contact@51pogoda.ru
          </a>
        </p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2 style={h2Style}>Форма обратной связи</h2>
        <ContactForm />
      </section>
    </div>
  );
}

const pStyle = { margin: "8px 0", lineHeight: 1.65, fontSize: 14, color: "#3a4a58" } as const;
const h2Style = { fontSize: 18, fontWeight: 800, marginBottom: 8, marginTop: 0 } as const;
const linkStyle = { color: "#0b5cad", fontWeight: 600 } as const;
