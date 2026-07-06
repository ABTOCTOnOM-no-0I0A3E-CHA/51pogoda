import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedArticles } from "@/entities/article/article-store";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Статьи о погоде Заполярья",
  description: "Статьи о погоде Мурманской области: полярный день и ночь, ветра, сезоны, особенности Заполярья.",
  alternates: { canonical: "/articles" },
};

export default function ArticlesListPage() {
  const articles = getPublishedArticles();

  return (
    <div className="content-padding" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 48px" }}>
      <nav style={{ fontSize: 13, color: "#6d7f8e", marginBottom: 16 }}>
        <Link href="/" style={{ color: "#0b5cad", fontWeight: 600 }}>Главная</Link>
        <span style={{ margin: "0 6px" }}>·</span>
        <span style={{ color: "#5a6b7b" }}>Статьи</span>
      </nav>

      <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, letterSpacing: "-.02em" }}>Статьи о погоде Заполярья</h1>

      {articles.length === 0 ? (
        <p style={{ color: "#5b6b78", fontSize: 15, marginTop: 24 }}>Пока нет статей</p>
      ) : (
        <ul style={{ listStyle: "none", margin: "24px 0 0", padding: 0, display: "flex", flexDirection: "column", gap: 18 }}>
          {articles.map((a) => (
            <li key={a.slug} style={{ borderTop: "1px solid #e1e8f0", paddingTop: 16 }}>
              <Link href={`/articles/${a.slug}`} style={{ fontSize: 18, fontWeight: 700, color: "#0b5cad" }}>
                {a.title}
              </Link>
              <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5b6b78", lineHeight: 1.6 }}>{a.excerpt}</p>
              <time style={{ fontSize: 12, color: "#8a98a6" }}>{new Date(a.createdAt).toLocaleDateString("ru-RU")}</time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
