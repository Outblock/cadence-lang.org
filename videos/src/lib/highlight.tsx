import React from "react";
import { COLORS, type Theme } from "./colors";

type Token = {
  text: string;
  type:
    | "keyword"
    | "type"
    | "comment"
    | "string"
    | "number"
    | "operator"
    | "annotation"
    | "function"
    | "plain";
};

const KEYWORDS = new Set([
  "access",
  "all",
  "self",
  "resource",
  "struct",
  "contract",
  "fun",
  "let",
  "var",
  "if",
  "else",
  "return",
  "import",
  "from",
  "init",
  "destroy",
  "emit",
  "pub",
  "priv",
  "prepare",
  "execute",
  "pre",
  "post",
  "transaction",
  "while",
  "for",
  "in",
  "break",
  "continue",
  "nil",
  "true",
  "false",
  "create",
  "move",
]);

const TYPES = new Set([
  "UInt8",
  "UInt16",
  "UInt32",
  "UInt64",
  "UInt128",
  "UInt256",
  "Int8",
  "Int16",
  "Int32",
  "Int64",
  "Int128",
  "Int256",
  "UFix64",
  "Fix64",
  "String",
  "Bool",
  "Address",
  "AnyStruct",
  "AnyResource",
  "Void",
  "Type",
  "Account",
  "AuthAccount",
  "PublicAccount",
  "NFT",
  "Collection",
  "Vault",
  "FlowToken",
  "NonFungibleToken",
  "FungibleToken",
  "MetadataViews",
]);

function tokenize(code: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < code.length) {
    // Comments
    if (code[i] === "/" && code[i + 1] === "/") {
      const end = code.indexOf("\n", i);
      const commentEnd = end === -1 ? code.length : end;
      tokens.push({ text: code.slice(i, commentEnd), type: "comment" });
      i = commentEnd;
      continue;
    }

    // Strings
    if (code[i] === '"') {
      let j = i + 1;
      while (j < code.length && code[j] !== '"') {
        if (code[j] === "\\") j++;
        j++;
      }
      tokens.push({ text: code.slice(i, j + 1), type: "string" });
      i = j + 1;
      continue;
    }

    // Operators: <-, <-!, @, &
    if (code[i] === "<" && code[i + 1] === "-") {
      const len = code[i + 2] === "!" ? 3 : 2;
      tokens.push({ text: code.slice(i, i + len), type: "operator" });
      i += len;
      continue;
    }
    if (code[i] === "@") {
      tokens.push({ text: "@", type: "operator" });
      i++;
      continue;
    }
    if (code[i] === "&") {
      tokens.push({ text: "&", type: "operator" });
      i++;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i]) && (i === 0 || /[\s(,:{=]/.test(code[i - 1]))) {
      let j = i;
      while (j < code.length && /[0-9._x]/.test(code[j])) j++;
      tokens.push({ text: code.slice(i, j), type: "number" });
      i = j;
      continue;
    }

    // Annotations: access(all), access(self), etc.
    if (code.slice(i).startsWith("access(")) {
      const end = code.indexOf(")", i);
      if (end !== -1) {
        tokens.push({ text: code.slice(i, end + 1), type: "annotation" });
        i = end + 1;
        continue;
      }
    }

    // Words (identifiers, keywords, types)
    if (/[a-zA-Z_]/.test(code[i])) {
      let j = i;
      while (j < code.length && /[a-zA-Z0-9_]/.test(code[j])) j++;
      const word = code.slice(i, j);

      if (KEYWORDS.has(word)) {
        tokens.push({ text: word, type: "keyword" });
      } else if (TYPES.has(word)) {
        tokens.push({ text: word, type: "type" });
      } else if (j < code.length && code[j] === "(") {
        tokens.push({ text: word, type: "function" });
      } else {
        tokens.push({ text: word, type: "plain" });
      }
      i = j;
      continue;
    }

    // Everything else (whitespace, punctuation)
    tokens.push({ text: code[i], type: "plain" });
    i++;
  }

  return tokens;
}

const TOKEN_COLORS: Record<Theme, Record<Token["type"], string>> = {
  dark: {
    keyword: "#FF79C6",    // pink
    type: "#8BE9FD",       // cyan
    comment: "#6272A4",    // muted blue-grey
    string: "#F1FA8C",     // yellow
    number: "#BD93F9",     // purple
    operator: "#FF79C6",   // pink (same as keyword)
    annotation: "#50FA7B", // green (accent-like)
    function: "#FFB86C",   // orange
    plain: "#F8F8F2",      // off-white
  },
  light: {
    keyword: "#D73A49",    // red
    type: "#005CC5",       // blue
    comment: "#6A737D",    // grey
    string: "#032F62",     // dark blue
    number: "#005CC5",     // blue
    operator: "#D73A49",   // red
    annotation: "#22863A", // green
    function: "#6F42C1",   // purple
    plain: "#24292E",      // near-black
  },
};

export function highlightCadence(
  code: string,
  theme: Theme,
  visibleChars?: number,
): React.ReactNode[] {
  const tokens = tokenize(code);
  const colorMap = TOKEN_COLORS[theme];

  if (visibleChars === undefined) {
    return tokens.map((token, i) => (
      <span key={i} style={{ color: colorMap[token.type] }}>
        {token.text}
      </span>
    ));
  }

  // Typewriter: only show first N chars
  const result: React.ReactNode[] = [];
  let shown = 0;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (shown >= visibleChars) break;

    const remaining = visibleChars - shown;
    const text =
      remaining >= token.text.length
        ? token.text
        : token.text.slice(0, remaining);

    result.push(
      <span key={i} style={{ color: colorMap[token.type] }}>
        {text}
      </span>,
    );
    shown += token.text.length;
  }

  return result;
}
