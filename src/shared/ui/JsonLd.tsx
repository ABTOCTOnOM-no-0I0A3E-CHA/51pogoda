/*
  Вывод structured data. Данные формируем сами (не из пользовательского
  ввода), но на всякий случай экранируем «<», чтобы исключить разрыв тега
  </script> и потенциальный XSS-вектор.
*/
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
