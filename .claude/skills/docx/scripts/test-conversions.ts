#!/usr/bin/env bun
/**
 * Test Runner: Validate Plate → HTML and Plate → DOCX conversions
 * Usage: bun run cli/test-conversions.ts [--fixture <name>] [--all]
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = join(__dirname, '../tests/fixtures/plate');

interface TestResult {
  name: string;
  html: { success: boolean; output?: string; error?: string };
  docx: { success: boolean; output?: string; error?: string };
}

// Import converters (inline for simplicity)
// In production, these would be proper imports

// =============== HTML CONVERTER ===============
const MARK_MAP: Record<string, { open: string; close: string }> = {
  bold: { open: '<strong>', close: '</strong>' },
  italic: { open: '<em>', close: '</em>' },
  underline: { open: '<u>', close: '</u>' },
  strikethrough: { open: '<s>', close: '</s>' },
  code: { open: '<code>', close: '</code>' },
};

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
  lic: 'span',
  table: 'table',
  tr: 'tr',
  td: 'td',
  th: 'th',
};

interface PlateText {
  text: string;
  [k: string]: unknown;
}
interface PlateElement {
  type: string;
  children: PlateNode[];
  url?: string;
}
type PlateNode = PlateElement | PlateText;

function isText(n: PlateNode): n is PlateText {
  return 'text' in n;
}

function escapeHtml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function serializeTextHtml(n: PlateText): string {
  let html = escapeHtml(n.text);
  for (const [m, tags] of Object.entries(MARK_MAP)) {
    if (n[m]) html = `${tags.open}${html}${tags.close}`;
  }
  return html;
}

function serializeElementHtml(n: PlateElement): string {
  if (n.type === 'a' && n.url) {
    return `<a href="${escapeHtml(n.url)}">${n.children.map(serializeNodeHtml).join('')}</a>`;
  }
  const tag = BLOCK_MAP[n.type] || 'div';
  return `<${tag}>${n.children.map(serializeNodeHtml).join('')}</${tag}>`;
}

function serializeNodeHtml(n: PlateNode): string {
  return isText(n) ? serializeTextHtml(n) : serializeElementHtml(n);
}

function plateToHtml(v: PlateNode[]): string {
  return v.map(serializeNodeHtml).join('\n');
}

// =============== DOCX XML CONVERTER ===============
function escapeXml(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildRun(n: PlateText): string {
  const props: string[] = [];
  if (n.bold) props.push('<w:b/>');
  if (n.italic) props.push('<w:i/>');
  if (n.underline) props.push('<w:u w:val="single"/>');
  if (n.strikethrough) props.push('<w:strike/>');

  const rPr = props.length ? `<w:rPr>${props.join('')}</w:rPr>` : '';
  const xmlSpace = /^\s|\s$/.test(n.text) ? ' xml:space="preserve"' : '';
  return `<w:r>${rPr}<w:t${xmlSpace}>${escapeXml(n.text)}</w:t></w:r>`;
}

function getPPr(type: string): string {
  const map: Record<string, string> = {
    h1: 'Heading1',
    h2: 'Heading2',
    h3: 'Heading3',
    blockquote: 'Quote',
  };
  return map[type] ? `<w:pPr><w:pStyle w:val="${map[type]}"/></w:pPr>` : '';
}

function serializeDocx(n: PlateNode): string {
  if (isText(n)) return buildRun(n);

  const { type, children, url } = n as PlateElement;

  if (type === 'a' && url) {
    const runs = children
      .map((c) =>
        isText(c)
          ? `<w:r><w:rPr><w:rStyle w:val="Hyperlink"/></w:rPr><w:t>${escapeXml(c.text)}</w:t></w:r>`
          : serializeDocx(c)
      )
      .join('');
    return `<w:hyperlink r:id="rId4">${runs}</w:hyperlink>`;
  }

  if (['p', 'h1', 'h2', 'h3', 'blockquote'].includes(type)) {
    return `<w:p>${getPPr(type)}${children.map(serializeDocx).join('')}</w:p>`;
  }

  if (type === 'lic') return children.map(serializeDocx).join('');

  if (type === 'li') {
    const lic = children.find(
      (c) => !isText(c) && (c as PlateElement).type === 'lic'
    ) as PlateElement;
    const pPr = `<w:pPr><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>`;
    return `<w:p>${pPr}${lic ? lic.children.map(serializeDocx).join('') : ''}</w:p>`;
  }

  if (type === 'ul' || type === 'ol') {
    return children
      .filter((c) => !isText(c))
      .map(serializeDocx)
      .join('');
  }

  if (type === 'table') {
    const rows = children.filter((c) => !isText(c)) as PlateElement[];
    return `<w:tbl><w:tblPr/><w:tblGrid/>${rows.map(serializeDocx).join('')}</w:tbl>`;
  }

  if (type === 'tr') {
    return `<w:tr>${children
      .filter((c) => !isText(c))
      .map(serializeDocx)
      .join('')}</w:tr>`;
  }

  if (type === 'td' || type === 'th') {
    return `<w:tc><w:p>${children.map(serializeDocx).join('')}</w:p></w:tc>`;
  }

  return `<w:p>${children.map(serializeDocx).join('')}</w:p>`;
}

function plateToDocxXml(v: PlateNode[]): string {
  return v
    .filter((n) => !isText(n))
    .map(serializeDocx)
    .join('\n');
}

// =============== TEST RUNNER ===============

function runTest(fixturePath: string): TestResult {
  const name = basename(fixturePath, '.json');
  const result: TestResult = {
    name,
    html: { success: false },
    docx: { success: false },
  };

  try {
    const json = readFileSync(fixturePath, 'utf-8');
    const plateValue = JSON.parse(json) as PlateNode[];

    // Test HTML conversion
    try {
      const html = plateToHtml(plateValue);
      result.html = { success: true, output: html };
    } catch (err) {
      result.html = { success: false, error: String(err) };
    }

    // Test DOCX XML conversion
    try {
      const docx = plateToDocxXml(plateValue);
      result.docx = { success: true, output: docx };
    } catch (err) {
      result.docx = { success: false, error: String(err) };
    }
  } catch (err) {
    result.html = { success: false, error: `Failed to parse: ${err}` };
    result.docx = { success: false, error: `Failed to parse: ${err}` };
  }

  return result;
}

function printResult(r: TestResult): void {
  const htmlStatus = r.html.success ? '✓' : '✗';
  const docxStatus = r.docx.success ? '✓' : '✗';

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Fixture: ${r.name}`);
  console.log(`${'='.repeat(60)}`);

  console.log(`\n[${htmlStatus}] HTML Conversion`);
  if (r.html.success && r.html.output) {
    console.log('Output:');
    console.log(
      r.html.output
        .split('\n')
        .map((l) => `  ${l}`)
        .join('\n')
    );
  } else if (r.html.error) {
    console.log(`Error: ${r.html.error}`);
  }

  console.log(`\n[${docxStatus}] DOCX XML Conversion`);
  if (r.docx.success && r.docx.output) {
    console.log('Output:');
    console.log(
      r.docx.output
        .split('\n')
        .map((l) => `  ${l}`)
        .join('\n')
    );
  } else if (r.docx.error) {
    console.log(`Error: ${r.docx.error}`);
  }
}

// CLI
const args = process.argv.slice(2);
const fixtureIndex = args.indexOf('--fixture');
const specificFixture = fixtureIndex !== -1 ? args[fixtureIndex + 1] : null;
const runAll = args.includes('--all') || !specificFixture;

if (!existsSync(FIXTURES_DIR)) {
  console.error(`Fixtures directory not found: ${FIXTURES_DIR}`);
  process.exit(1);
}

const fixtures = readdirSync(FIXTURES_DIR)
  .filter((f) => f.endsWith('.json'))
  .filter(
    (f) => runAll || f === `${specificFixture}.json` || f === specificFixture
  );

if (fixtures.length === 0) {
  console.error('No fixtures found');
  process.exit(1);
}

console.log(`Running ${fixtures.length} test(s)...\n`);

let passed = 0;
let failed = 0;

for (const fixture of fixtures) {
  const result = runTest(join(FIXTURES_DIR, fixture));
  printResult(result);

  if (result.html.success && result.docx.success) {
    passed++;
  } else {
    failed++;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Summary: ${passed} passed, ${failed} failed`);
console.log(`${'='.repeat(60)}`);

process.exit(failed > 0 ? 1 : 0);
