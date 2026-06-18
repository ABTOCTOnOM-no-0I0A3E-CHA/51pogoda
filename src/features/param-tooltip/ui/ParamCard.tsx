"use client";

import { useEffect, useRef } from "react";
import { useParamTooltip } from "../model/store";

export interface ParamDef {
  id: string;
  label: string;
  value: string;
  valueColor?: string;
  sub: string;
  tipTitle: string;
  tipText: string;
}

export function ParamCard({ param }: { param: ParamDef }) {
  const { openId, toggle, close } = useParamTooltip();
  const open = openId === param.id;
  const ref = useRef<HTMLDivElement>(null);

  /* Закрытие открытой подсказки кликом вне карточки и по Escape */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        background: "#fff",
        border: "1px solid #d4dce5",
        boxShadow: "0 2px 12px rgba(20,33,43,.05)",
        borderRadius: 13,
        padding: "13px 15px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <div style={{ fontSize: 12, color: "#8a98a6", fontWeight: 600 }}>{param.label}</div>
        <button
          type="button"
          onClick={() => toggle(param.id)}
          title="Что это значит?"
          aria-expanded={open}
          aria-label={`Подробнее: ${param.label}`}
          className="param-info-btn"
          style={{
            flex: "none",
            width: 19,
            height: 19,
            borderRadius: "50%",
            border: "1.5px solid #cdd8e2",
            background: "#fff",
            color: "#8a98a6",
            fontSize: 12,
            fontWeight: 800,
            lineHeight: 1,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          i
        </button>
      </div>

      <div style={{ fontSize: 19, fontWeight: 800, marginTop: 6, letterSpacing: "-.01em", color: param.valueColor }}>{param.value}</div>
      <div style={{ fontSize: 11, color: "#8a98a6", marginTop: 1 }}>{param.sub}</div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 42,
            right: 10,
            left: 10,
            zIndex: 30,
            background: "#15212b",
            color: "#fff",
            borderRadius: 11,
            padding: "12px 13px",
            boxShadow: "0 12px 32px rgba(20,33,43,.3)",
          }}
        >
          <div style={{ fontSize: 12.5, fontWeight: 800, marginBottom: 4 }}>{param.tipTitle}</div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: "#cdd6df" }}>{param.tipText}</div>
        </div>
      )}
    </div>
  );
}
