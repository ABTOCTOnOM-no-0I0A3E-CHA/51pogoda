import { test, expect, describe } from "bun:test";
import { DEFAULT_GLOBAL_PROMPT, renderTemplate } from "./prompt-template";

describe("renderTemplate", () => {
  test("substitutes {city} and {data}", () => {
    const out = renderTemplate("Погода в {city}:\n{data}", { city: "Мурманск", data: "тепло" });
    expect(out).toBe("Погода в Мурманск:\nтепло");
  });

  test("replaces every occurrence of a placeholder", () => {
    expect(renderTemplate("{city}-{city}", { city: "X", data: "" })).toBe("X-X");
  });

  test("leaves unrelated braces (JSON example) intact", () => {
    const tpl = 'Ответь JSON: {"accurate":"..."} для {city}';
    expect(renderTemplate(tpl, { city: "Кола", data: "" })).toBe('Ответь JSON: {"accurate":"..."} для Кола');
  });

  test("does not interpret $ or special chars in data", () => {
    const out = renderTemplate("{data}", { city: "", data: "$1 100% & <тег>" });
    expect(out).toBe("$1 100% & <тег>");
  });
});

describe("DEFAULT_GLOBAL_PROMPT", () => {
  test("contains both placeholders", () => {
    expect(DEFAULT_GLOBAL_PROMPT).toContain("{city}");
    expect(DEFAULT_GLOBAL_PROMPT).toContain("{data}");
  });

  test("renders without leftover placeholders", () => {
    const out = renderTemplate(DEFAULT_GLOBAL_PROMPT, { city: "Апатиты", data: "Данные сейчас: ..." });
    expect(out).toContain("Апатиты");
    expect(out).not.toContain("{city}");
    expect(out).not.toContain("{data}");
  });
});
