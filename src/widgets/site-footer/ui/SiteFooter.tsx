import { SITE } from "@/shared/config/site";
import { hhmm } from "@/shared/lib/format";

export function SiteFooter({ marginTop = 40 }: { marginTop?: number }) {
  const updated = hhmm(new Date());

  return (
    <footer
      style={{
        marginTop,
        paddingTop: 20,
        borderTop: "1px solid #dfe5ec",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 13,
        color: "#8a98a6",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <span>
        {SITE.name} · © {SITE.copyrightYear}
      </span>
      <span style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <a href="https://www.yr.no" target="_blank" rel="noopener noreferrer" style={{ color: "#8a98a6" }}>
          {SITE.source}
        </a>
        <span>обновлено {updated}</span>
      </span>
    </footer>
  );
}
