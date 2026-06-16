import { test, expect, describe } from "bun:test";

process.env.ADMIN_PASSWORD = "s3cret-pass";
process.env.ADMIN_SESSION_SECRET = "unit-test-secret-key";

import {
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  isAdminConfigured,
} from "./admin-session";

describe("verifyPassword", () => {
  test("accepts the exact password", () => {
    expect(verifyPassword("s3cret-pass")).toBe(true);
  });
  test("rejects a wrong password", () => {
    expect(verifyPassword("wrong")).toBe(false);
  });
  test("rejects a prefix of the password (length guard)", () => {
    expect(verifyPassword("s3cret")).toBe(false);
  });
  test("rejects empty", () => {
    expect(verifyPassword("")).toBe(false);
  });
});

describe("isAdminConfigured", () => {
  test("true when ADMIN_PASSWORD set", () => {
    expect(isAdminConfigured()).toBe(true);
  });
});

describe("session token", () => {
  test("round-trips a freshly signed token", async () => {
    const token = await createSessionToken();
    expect(token).toBeTruthy();
    expect(await verifySessionToken(token!)).toBe(true);
  });

  test("rejects undefined / empty / malformed", async () => {
    expect(await verifySessionToken(undefined)).toBe(false);
    expect(await verifySessionToken("")).toBe(false);
    expect(await verifySessionToken("no-dot-here")).toBe(false);
    expect(await verifySessionToken(".onlysig")).toBe(false);
  });

  test("rejects a tampered signature", async () => {
    const token = await createSessionToken();
    const [payload] = token!.split(".");
    expect(await verifySessionToken(`${payload}.deadbeef`)).toBe(false);
  });

  test("rejects an expired token before checking signature", async () => {
    /* exp в далёком прошлом — отклоняется по сроку, подпись не важна */
    expect(await verifySessionToken("1000.anything")).toBe(false);
  });

  test("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken();
    process.env.ADMIN_SESSION_SECRET = "rotated-secret";
    expect(await verifySessionToken(token!)).toBe(false);
    process.env.ADMIN_SESSION_SECRET = "unit-test-secret-key"; /* восстановить */
  });
});
