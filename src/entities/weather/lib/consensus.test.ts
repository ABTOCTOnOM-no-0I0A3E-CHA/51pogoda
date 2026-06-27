import { test, expect, describe } from "bun:test";
import { buildConsensus, type ForecastModel } from "./consensus";

const MODELS: ForecastModel[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
];

/* Хелпер: собрать блок daily с одинаковым набором переменных по моделям */
function daily(rows: Record<string, Array<number | null>>, days = 1) {
  return { time: Array.from({ length: days }, (_, i) => `2026-06-${10 + i}`), ...rows };
}

describe("buildConsensus", () => {
  test("returns null on empty input", () => {
    expect(buildConsensus(undefined, MODELS)).toBeNull();
    expect(buildConsensus({ time: [] }, MODELS)).toBeNull();
  });

  test("skips a day with fewer than two valid sources", () => {
    const block = daily({
      temperature_2m_max_a: [5],
      temperature_2m_min_a: [1],
      /* b и c без данных */
    });
    expect(buildConsensus(block, MODELS)).toBeNull();
  });

  test("tight agreement → high confidence, spread computed on tmax", () => {
    const block = daily({
      temperature_2m_max_a: [5],
      temperature_2m_min_a: [0],
      precipitation_sum_a: [0],
      weather_code_a: [0],
      temperature_2m_max_b: [6],
      temperature_2m_min_b: [1],
      precipitation_sum_b: [0],
      weather_code_b: [1],
      temperature_2m_max_c: [4],
      temperature_2m_min_c: [0],
      precipitation_sum_c: [0],
      weather_code_c: [0],
    });
    const res = buildConsensus(block, MODELS)!;
    expect(res.sources).toEqual(["A", "B", "C"]);
    const d = res.days[0]!;
    expect(d.tmaxMin).toBe(4);
    expect(d.tmaxMax).toBe(6);
    expect(d.spread).toBe(2);
    expect(d.confidence).toBe("high");
    expect(d.precipAgreement).toBe(0);
  });

  test("wide tmax spread → low confidence", () => {
    const block = daily({
      temperature_2m_max_a: [0],
      temperature_2m_min_a: [-5],
      weather_code_a: [0],
      temperature_2m_max_b: [6],
      temperature_2m_min_b: [0],
      weather_code_b: [0],
      temperature_2m_max_c: [3],
      temperature_2m_min_c: [-2],
      weather_code_c: [0],
    });
    const d = buildConsensus(block, MODELS)!.days[0]!;
    expect(d.spread).toBe(6);
    expect(d.confidence).toBe("low");
  });

  test("split on precipitation drops a tight day to medium", () => {
    const block = daily({
      temperature_2m_max_a: [3],
      temperature_2m_min_a: [0],
      precipitation_sum_a: [2],
      weather_code_a: [61],
      temperature_2m_max_b: [3],
      temperature_2m_min_b: [0],
      precipitation_sum_b: [0],
      weather_code_b: [0],
    });
    const d = buildConsensus(block, MODELS)!.days[0]!;
    expect(d.spread).toBe(0);
    expect(d.precipAgreement).toBe(0.5);
    expect(d.confidence).toBe("medium");
  });

  test("consensus condition: majority wins, ties resolve to more severe", () => {
    const block = daily({
      temperature_2m_max_a: [1],
      temperature_2m_min_a: [-1],
      weather_code_a: [71], /* snow */
      temperature_2m_max_b: [1],
      temperature_2m_min_b: [-1],
      weather_code_b: [0], /* clear */
    });
    const d = buildConsensus(block, MODELS)!.days[0]!;
    expect(d.condition).toBe("snow");
  });
});
