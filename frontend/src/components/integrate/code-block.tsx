"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  code: string;
  language: string;
}

type TokenType = "keyword" | "string" | "comment" | "number" | "function" | "type" | "plain";

interface Token {
  type: TokenType;
  value: string;
}

const SOLIDITY_KEYWORDS = new Set([
  "pragma", "solidity", "contract", "interface", "function", "modifier",
  "constructor", "external", "internal", "public", "private", "view",
  "pure", "returns", "return", "require", "address", "bool", "uint256",
  "string", "mapping", "struct", "enum", "event", "emit", "if", "else",
  "for", "while", "import", "is", "memory", "storage", "calldata",
  "payable", "msg", "sender",
]);

const TS_KEYWORDS = new Set([
  "import", "export", "from", "const", "let", "var", "function", "return",
  "if", "else", "for", "while", "new", "await", "async", "class", "type",
  "interface", "extends", "implements", "true", "false", "null", "undefined",
  "as", "of", "in",
]);

function isDigit(c: number): boolean {
  return c >= 48 && c <= 57; // 0-9
}

function isAlpha(c: number): boolean {
  return (c >= 65 && c <= 90) || (c >= 97 && c <= 122); // A-Z, a-z
}

function isWordChar(c: number): boolean {
  return isAlpha(c) || isDigit(c) || c === 95 || c === 36 || c === 46; // _ $ .
}

function isWordStart(c: number): boolean {
  return isAlpha(c) || c === 95 || c === 36; // a-zA-Z _ $
}

function isUpper(c: number): boolean {
  return c >= 65 && c <= 90;
}

function tokenize(code: string, lang: string): Token[][] {
  const keywords = lang.toLowerCase().includes("solidity") ? SOLIDITY_KEYWORDS : TS_KEYWORDS;
  const lines = code.split("\n");

  return lines.map((line) => {
    const tokens: Token[] = [];
    let i = 0;
    const len = line.length;

    while (i < len) {
      const ch = line.charCodeAt(i);

      // Single-line comment
      if (ch === 47 && i + 1 < len && line.charCodeAt(i + 1) === 47) {
        tokens.push({ type: "comment", value: line.slice(i) });
        break;
      }

      // String
      if (ch === 34 || ch === 39 || ch === 96) { // " ' `
        let j = i + 1;
        while (j < len && line.charCodeAt(j) !== ch) {
          if (line.charCodeAt(j) === 92) j++; // backslash escape
          j++;
        }
        tokens.push({ type: "string", value: line.slice(i, j + 1) });
        i = j + 1;
        continue;
      }

      // Number
      if (isDigit(ch)) {
        let j = i + 1;
        while (j < len && (isDigit(line.charCodeAt(j)) || line.charCodeAt(j) === 46 || isAlpha(line.charCodeAt(j)))) j++;
        tokens.push({ type: "number", value: line.slice(i, j) });
        i = j;
        continue;
      }

      // Word
      if (isWordStart(ch)) {
        let j = i + 1;
        while (j < len && isWordChar(line.charCodeAt(j))) j++;
        const word = line.slice(i, j);

        if (keywords.has(word)) {
          tokens.push({ type: "keyword", value: word });
        } else if (j < len && line.charCodeAt(j) === 40) { // (
          tokens.push({ type: "function", value: word });
        } else if (isUpper(ch)) {
          tokens.push({ type: "type", value: word });
        } else {
          tokens.push({ type: "plain", value: word });
        }
        i = j;
        continue;
      }

      // Other
      tokens.push({ type: "plain", value: line[i] });
      i++;
    }

    return tokens;
  });
}

const tokenColors: Record<TokenType, string> = {
  keyword: "text-purple-600",
  string: "text-green-700",
  comment: "italic opacity-50",
  number: "text-amber-600",
  function: "text-blue-600",
  type: "text-teal-600",
  plain: "",
};

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const tokenizedLines = useMemo(() => tokenize(code, language), [code, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border bg-card">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-xs text-muted-foreground">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 text-xs"
        >
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="text-sm leading-relaxed">
          {tokenizedLines.map((tokens, lineIndex) => (
            <span key={lineIndex}>
              {tokens.map((token, tokenIndex) => (
                <span key={tokenIndex} className={tokenColors[token.type]}>
                  {token.value}
                </span>
              ))}
              {lineIndex < tokenizedLines.length - 1 && "\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
