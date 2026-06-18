interface PolarBadgeProps {
  label: string;
  padding?: string;
  className?: string;
}

/* Янтарная «таблетка» полярного дня/ночи в углу hero-блока */
export function PolarBadge({ label, padding = "7px 14px", className }: PolarBadgeProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        background: "rgba(255,255,255,.8)",
        border: "1px solid #e2d8bf",
        borderRadius: 999,
        padding,
        fontSize: 13,
        fontWeight: 700,
        color: "#a8730a",
        whiteSpace: "nowrap",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden style={{ overflow: "visible" }}>
        <circle className="polar-dot-pulse" cx="12" cy="12" r="5" fill="#f4a72c" />
        <circle cx="12" cy="12" r="5" fill="#f4a72c" />
      </svg>
      {label}
    </div>
  );
}
