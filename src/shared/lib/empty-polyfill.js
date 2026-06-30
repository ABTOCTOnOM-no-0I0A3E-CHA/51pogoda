// Next.js встраивает polyfill-module.js (Array.prototype.at, flat, fromEntries, hasOwn, trimEnd/trimStart)
// для поддержки старых браузеров. Наш `.browserslistrc` уже режет эти браузеры,
// но polyfill-module вставляется до browserslist-проверки — обходим alias'ом.
// Аудитория сайта использует современные браузеры (Chrome/Firefox/Safari/Yandex Browser 2022+).
