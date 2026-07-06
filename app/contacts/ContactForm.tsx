"use client";

import { useState, type FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const inputStyle = {
  width: "100%",
  border: "1px solid #d4dce5",
  borderRadius: 12,
  padding: "12px",
  fontSize: 14,
  color: "#15212b",
  background: "#fff",
  boxSizing: "border-box",
  fontFamily: "inherit",
} as const;

const labelStyle = { display: "block", fontSize: 13, color: "#5a6b7b", marginBottom: 6 } as const;

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      message: String(form.get("message") ?? ""),
      website: String(form.get("website") ?? ""),
    };

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setError(data.error ?? "Не удалось отправить сообщение");
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Не удалось отправить сообщение");
    }
  }

  if (status === "success") {
    return (
      <p style={{ color: "#0b5cad", fontSize: 14, fontWeight: 600, margin: 0 }}>
        Сообщение отправлено, спасибо!
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 480 }}
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />
      <div>
        <label style={labelStyle} htmlFor="name">
          Имя (необязательно)
        </label>
        <input id="name" name="name" type="text" placeholder="Ваше имя" style={inputStyle} />
      </div>
      <div>
        <label style={labelStyle} htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Ваш email"
          style={inputStyle}
        />
      </div>
      <div>
        <label style={labelStyle} htmlFor="message">
          Сообщение
        </label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          placeholder="Ваше сообщение"
          style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          border: "none",
          borderRadius: 12,
          padding: "12px 20px",
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          background: "#0b5cad",
          cursor: status === "submitting" ? "default" : "pointer",
        }}
      >
        {status === "submitting" ? "Отправка…" : "Отправить"}
      </button>
      {status === "error" && error && (
        <p style={{ color: "#b00020", fontSize: 13, margin: 0 }}>{error}</p>
      )}
    </form>
  );
}
