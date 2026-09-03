"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    yaContextCb?: Array<() => void>;
    Ya?: {
      Context?: {
        AdvManager?: {
          render: (params: { blockId: string; renderTo: string }) => void;
        };
      };
    };
  }
}

/*
  Рекламный блок РСЯ. Загрузчик context.js подключается через next/script и
  дедуплицируется по id — сколько бы блоков ни было на странице, скрипт грузится
  один раз.

  Рендер идёт из useEffect, а не инлайн-скриптом из конструктора РСЯ: при
  клиентской навигации (город → город) инлайн <Script> с тем же id повторно не
  исполняется, и на второй странице блок остался бы пустым. Эффект отрабатывает
  на каждый монтаж. yaContextCb — очередь колбэков, context.js разбирает её при
  загрузке, поэтому пуш до готовности скрипта безопасен.
*/
export function YandexRtb({ blockId }: { blockId: string }) {
  const renderTo = `yandex_rtb_${blockId}`;

  useEffect(() => {
    window.yaContextCb = window.yaContextCb ?? [];
    window.yaContextCb.push(() => {
      window.Ya?.Context?.AdvManager?.render({ blockId, renderTo });
    });
  }, [blockId, renderTo]);

  return (
    <>
      <Script
        id="yandex-rtb-context"
        src="https://yandex.ru/ads/system/context.js"
        strategy="afterInteractive"
      />
      <div id={renderTo} />
    </>
  );
}
