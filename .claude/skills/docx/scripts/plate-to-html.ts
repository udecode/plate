#!/usr/bin/env bun
/**
 * CLI: Plate JSON → HTML
 * Usage: bun run cli/plate-to-html.ts <input.json> [-o output.html]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

// Mark mapping: Plate mark → HTML tag
const MARK_MAP: Record<string, { open: string; close: string }> = {
  bold: { open: '<strong>', close: '</strong>' },
  italic: { open: '<em>', close: '</em>' },
  underline: { open: '<u>', close: '</u>' },
  strikethrough: { open: '<s>', close: '</s>' },
  code: { open: '<code>', close: '</code>' },
  subscript: { open: '<sub>', close: '</sub>' },
  superscript: { open: '<sup>', close: '</sup>' },
};

// Block mapping: Plate type → HTML tag
const BLOCK_MAP: Record<string, string> = {
  p: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  blockquote: 'blockquote',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  lic: 'span', // list item content
  table: 'table',
  tr: 'tr',
  td: 'td',
  th: 'th',
  code_block: 'pre',
};

interface PlateText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  subscript?: boolean;
  superscript?: boolean;
}

interface PlateElement {
  type: string;
  children: (PlateElement | PlateText)[];
  url?: string;
  [key: string]: unknown;
}

type PlateNode = PlateElement | PlateText;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isText(node: PlateNode): node is PlateText {
  return 'text' in node;
}

function serializeText(node: PlateText): string {
  let html = escapeHtml(node.text);

  // Apply marks in order
  for (const [mark, tags] of Object.entries(MARK_MAP)) {
    if (node[mark as keyof PlateText]) {
      html = `${tags.open}${html}${tags.close}`;
    }
  }

  return html;
}

function serializeElement(node: PlateElement): string {
  const { type, children, url } = node;

  // Handle inline link
  if (type === 'a' && url) {
    const childHtml = children.map(serializeNode).join('');
    return `<a href="${escapeHtml(url)}">${childHtml}</a>`;
  }

  // Handle block elements
  const tag = BLOCK_MAP[type] || 'div';
  const childHtml = children.map(serializeNode).join('');

  // Code blocks get wrapped in <code>
  if (type === 'code_block') {
    return `<pre><code>${childHtml}</code></pre>`;
  }

  return `<${tag}>${childHtml}</${tag}>`;
}

function serializeNode(node: PlateNode): string {
  if (isText(node)) {
    return serializeText(node);
  }
  return serializeElement(node);
}

function plateToHtml(value: PlateNode[]): string {
  return value.map(serializeNode).join('\n');
}

// CLI entry
const args = process.argv.slice(2);
const inputPath = args[0];
const outputIndex = args.indexOf('-o');
const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

if (!inputPath) {
  console.error(
    'Usage: bun run plate-to-html.ts <input.json> [-o output.html]'
  );
  process.exit(1);
}

if (!existsSync(inputPath)) {
  console.error(`Error: File not found: ${inputPath}`);
  process.exit(1);
}

try {
  const json = readFileSync(inputPath, 'utf-8');
  const plateValue = JSON.parse(json) as PlateNode[];
  const html = plateToHtml(plateValue);

  if (outputPath) {
    writeFileSync(outputPath, html);
    console.log(`✓ Written to ${outputPath}`);
  } else {
    console.log(html);
  }
} catch (err) {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
}
