import React from "react";

/*
  Минимальный markdown-рендер для статей. Поддерживает:
  - ## Заголовки (h2)
  - Параграфы (текст между пустыми строками)
  - Списки (- item)
  - **bold** внутри параграфов и пунктов списка
  Не тащим markdown-библиотеку — статьи простые, этого достаточно.
*/

interface Block {
  type: "h2" | "p" | "ul";
  content: string | string[];
}

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] = [];

  function flushPara() {
    if (para.length > 0) {
      blocks.push({ type: "p", content: para.join(" ").trim() });
      para = [];
    }
  }
  function flushList() {
    if (list.length > 0) {
      blocks.push({ type: "ul", content: [...list] });
      list = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === "") {
      flushPara();
      flushList();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push({ type: "h2", content: trimmed.slice(3).trim() });
      continue;
    }
    if (trimmed.startsWith("- ")) {
      flushPara();
      list.push(trimmed.slice(2).trim());
      continue;
    }
    flushList();
    para.push(trimmed);
  }
  flushPara();
  flushList();
  return blocks;
}

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export function renderMarkdown(text: string): React.ReactNode[] {
  const blocks = parseBlocks(text);
  return blocks.map((block, i) => {
    if (block.type === "h2") {
      return (
        <h2 key={i} style={{ margin: "28px 0 12px", fontSize: 20, fontWeight: 800, letterSpacing: "-.01em", color: "#15212b" }}>
          {renderInline(block.content as string)}
        </h2>
      );
    }
    if (block.type === "ul") {
      return (
        <ul key={i} style={{ margin: "12px 0", paddingLeft: 22, lineHeight: 1.7, fontSize: 15, color: "#3a4a58" }}>
          {(block.content as string[]).map((item, j) => (
            <li key={j} style={{ marginBottom: 4 }}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} style={{ margin: "14px 0", fontSize: 15, lineHeight: 1.7, color: "#3a4a58" }}>
        {renderInline(block.content as string)}
      </p>
    );
  });
}
