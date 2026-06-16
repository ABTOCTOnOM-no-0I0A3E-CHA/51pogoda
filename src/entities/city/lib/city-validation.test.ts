import { test, expect, describe } from "bun:test";
import { validateSlug, validateCityAttrs } from "./city-validation";

describe("validateSlug", () => {
  test.each(["murmansk", "my-point", "a", "abc123", "1point"])("accepts %p", (slug) => {
    expect(validateSlug(slug)).toBeNull();
  });

  test.each(["", "-bad", "Upper", "with space", "spec!al", "a".repeat(62)])("rejects %p", (slug) => {
    expect(validateSlug(slug)).not.toBeNull();
  });
});

describe("validateCityAttrs", () => {
  const valid = { name: "Точка", kind: "село", lat: 68.5, lon: 33.5, yrId: "2-524305" };

  test("accepts a valid payload and returns normalized value", () => {
    const r = validateCityAttrs(valid);
    expect(r.error).toBeUndefined();
    expect(r.value).toEqual(valid);
  });

  test("trims the name", () => {
    expect(validateCityAttrs({ ...valid, name: "  Точка  " }).value?.name).toBe("Точка");
  });

  test("rejects empty name", () => {
    expect(validateCityAttrs({ ...valid, name: "  " }).error).toContain("name");
  });

  test("rejects unknown kind", () => {
    expect(validateCityAttrs({ ...valid, kind: "галактика" as never }).error).toContain("kind");
  });

  test.each([91, -91, NaN])("rejects lat %p", (lat) => {
    expect(validateCityAttrs({ ...valid, lat }).error).toContain("lat");
  });

  test.each([181, -181])("rejects lon %p", (lon) => {
    expect(validateCityAttrs({ ...valid, lon }).error).toContain("lon");
  });

  test.each(["bad", "524305", "2-", "x-123"])("rejects yrId %p", (yrId) => {
    expect(validateCityAttrs({ ...valid, yrId }).error).toContain("yrId");
  });

  test("coerces numeric strings for lat/lon", () => {
    const r = validateCityAttrs({ ...valid, lat: "68.5" as never, lon: "33.5" as never });
    expect(r.value).toEqual(valid);
  });
});
