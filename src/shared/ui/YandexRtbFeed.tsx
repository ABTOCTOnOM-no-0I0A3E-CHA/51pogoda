"use client";

import { YANDEX_RTB_FEED_BLOCK } from "@/shared/config/site";
import { YandexRtb } from "./YandexRtb";

/*
  Лента РСЯ в конце страницы. Рендерится из SiteFooter — сразу под основным
  контентом и ВЫШЕ подвала: по правилам РСЯ Лента живёт на последнем или
  предпоследнем экране, а показы считаются видимые, поэтому прятать её ниже
  подвала невыгодно.
*/
export function YandexRtbFeed() {
  if (!YANDEX_RTB_FEED_BLOCK) return null;

  return (
    <div style={{ marginTop: 28 }}>
      <YandexRtb blockId={YANDEX_RTB_FEED_BLOCK} type="feed" />
    </div>
  );
}
