import { readFile } from "node:fs/promises";

export const DEFAULT_BILLS_MARKDOWN_PATH = process.env.CASHMARKER_BILLS_MD_PATH?.trim() ?? "";

export type MarkdownBill = {
  id: string;
  name: string;
  fee: string;
  muted: boolean;
};

export type MarkdownBillSource = {
  bills: MarkdownBill[];
  sourcePath: string;
  error?: string;
};

const TABLE_SEPARATOR_CELL = /^:?-{3,}:?$/;
const LEADING_MARKER = /^[（(][^）)]+[）)]/;

function stableBillId(name: string): string {
  let hash = 2166136261;
  for (const character of name) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return `markdown-bill-${(hash >>> 0).toString(36)}`;
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isSeparatorRow(line: string): boolean {
  const cells = parseTableRow(line);
  return cells.length > 0 && cells.every((cell) => TABLE_SEPARATOR_CELL.test(cell.replace(/\s/g, "")));
}

export function parseFirstBillsTable(markdown: string): MarkdownBill[] {
  const lines = markdown.replace(/^\uFEFF/, "").split(/\r?\n/);
  const headerIndex = lines.findIndex(
    (line, index) => line.includes("|") && index + 1 < lines.length && isSeparatorRow(lines[index + 1]),
  );

  if (headerIndex < 0) {
    throw new Error("没有找到 Markdown 表格。");
  }

  const headers = parseTableRow(lines[headerIndex]);
  const nameIndex = headers.indexOf("名称");
  const feeIndex = headers.indexOf("费用");
  if (nameIndex < 0 || feeIndex < 0) {
    throw new Error("第一个表格缺少“名称”或“费用”栏目。");
  }

  const bills: MarkdownBill[] = [];
  for (let index = headerIndex + 2; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || !line.includes("|")) {
      break;
    }

    const cells = parseTableRow(line);
    const name = cells[nameIndex]?.trim() ?? "";
    const fee = cells[feeIndex]?.trim() ?? "";
    if (!name || !fee || /^(总共|合计)$/.test(name)) {
      continue;
    }

    bills.push({
      id: stableBillId(name),
      name,
      fee,
      muted: LEADING_MARKER.test(name),
    });
  }

  return bills;
}

export async function readBillsMarkdown(
  sourcePath = DEFAULT_BILLS_MARKDOWN_PATH,
): Promise<MarkdownBillSource> {
  if (!sourcePath) {
    return {
      bills: [],
      sourcePath: "未配置",
      error: "请在 .env.local 中配置 CASHMARKER_BILLS_MD_PATH。",
    };
  }

  try {
    const markdown = await readFile(sourcePath, "utf8");
    return { bills: parseFirstBillsTable(markdown), sourcePath };
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法读取账单文件。";
    return { bills: [], sourcePath, error: message };
  }
}
