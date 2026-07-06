import { getArticles } from "@/entities/article/article-store";
import { ArticlesManager } from "./ArticlesManager";
import styles from "../../admin.module.css";

export default function AdminArticlesPage() {
  const articles = getArticles();
  return (
    <>
      <h1 className={styles.h1}>Статьи</h1>
      <p className={styles.sub}>
        Статьи о погоде Заполярья: полярный день/ночь, ветра, сезоны. После публикации — сразу на /articles.
      </p>
      <ArticlesManager initial={articles} />
    </>
  );
}
