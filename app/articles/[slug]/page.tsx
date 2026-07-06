import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticle } from "@/entities/article/article-store";
import { renderMarkdown } from "@/shared/lib/markdown";

export const revalidate = 3600;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* Статьи управляются через админку в рантайме — не пререндерим, но кешируем на час. */
export function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || !article.published) return {};

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article || !article.published) notFound();

  return (
    <div className="content-padding" style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px 48px" }}>
      <nav style={{ fontSize: 13, color: "#6d7f8e", marginBottom: 16 }}>
        <Link href="/" style={{ color: "#0b5cad", fontWeight: 600 }}>Главная</Link>
        <span style={{ margin: "0 6px" }}>·</span>
        <Link href="/articles" style={{ color: "#0b5cad", fontWeight: 600 }}>Статьи</Link>
      </nav>

      <article>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: "-.02em" }}>{article.title}</h1>
        <time style={{ display: "block", fontSize: 13, color: "#8a98a6", marginTop: 8, marginBottom: 24 }}>
          {new Date(article.createdAt).toLocaleDateString("ru-RU")}
        </time>
        {renderMarkdown(article.body)}
      </article>
    </div>
  );
}
