#!/usr/bin/env bun
/**
 * CLI: Plate JSON → DOCX XML (document.xml fragment)
 * Usage: bun run cli/plate-to-docx-xml.ts <input.json> [-o output.xml]
 *
 * Outputs the w:body content as XML fragment for inspection.
 * For full DOCX creation, use plate-to-docx.ts
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R_NS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

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

// Track hyperlinks for relationship generation
const hyperlinks: { id: string; url: string }[] = [];
let hyperlinkCounter = 4; // Start at rId4 (rId1-3 typically reserved)

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isText(node: PlateNode): node is PlateText {
  return 'text' in node;
}

function buildRunProperties(node: PlateText): string {
  const props: string[] = [];

  if (node.bold) props.push('<w:b/>');
  if (node.italic) props.push('<w:i/>');
  if (node.underline) props.push('<w:u w:val="single"/>');
  if (node.strikethrough) props.push('<w:strike/>');
  if (node.code)
    props.push('<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>');
  if (node.subscript) props.push('<w:vertAlign w:val="subscript"/>');
  if (node.superscript) props.push('<w:vertAlign w:val="superscript"/>');

  if (props.length === 0) return '';
  return `<w:rPr>${props.join('')}</w:rPr>`;
}

function buildRun(node: PlateText): string {
  const rPr = buildRunProperties(node);
  const text = escapeXml(node.text);
  const xmlSpace = /^\s|\s$/.test(node.text) ? ' xml:space="preserve"' : '';

  return `<w:r>${rPr}<w:t${xmlSpace}>${text}</w:t></w:r>`;
}

function buildParagraphProperties(type: string): string {
  const headingMap: Record<string, string> = {
    h1: 'Heading1',
    h2: 'Heading2',
    h3: 'Heading3',
    h4: 'Heading4',
    h5: 'Heading5',
    h6: 'Heading6',
    blockquote: 'Quote',
  };

  const style = headingMap[type];
  if (style) {
    return `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`;
  }
  return '';
}

function serializeChildren(children: PlateNode[]): string {
  return children
    .map((child) => {
      if (isText(child)) {
        return buildRun(child);
      }
      return serializeElement(child);
    })
    .join('');
}

function serializeElement(node: PlateElement): string {
  const { type, children, url } = node;

  // Inline link
  if (type === 'a' && url) {
    const rId = `rId${hyperlinkCounter++}`;
    hyperlinks.push({ id: rId, url });

    const runs = children
      .map((child) => {
        if (isText(child)) {
          const rPr =
            '<w:rPr><w:rStyle w:val="Hyperlink"/><w:color w:val="0563C1"/><w:u w:val="single"/></w:rPr>';
          const text = escapeXml(child.text);
          return `<w:r>${rPr}<w:t>${text}</w:t></w:r>`;
        }
        return serializeElement(child);
      })
      .join('');

    return `<w:hyperlink r:id="${rId}">${runs}</w:hyperlink>`;
  }

  // Paragraph-level blocks
  if (['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(type)) {
    const pPr = buildParagraphProperties(type);
    const runs = serializeChildren(children);
    return `<w:p>${pPr}${runs}</w:p>`;
  }

  // List item content (lic) - just serialize children
  if (type === 'lic') {
    return serializeChildren(children);
  }

  // List item (li) - becomes paragraph with numPr
  if (type === 'li') {
    // Find the lic child and any nested lists
    const licChild = children.find(
      (c) => !isText(c) && (c as PlateElement).type === 'lic'
    ) as PlateElement | undefined;
    const nestedList = children.find(
      (c) => !isText(c) && ['ul', 'ol'].includes((c as PlateElement).type)
    ) as PlateElement | undefined;

    const pPr = `<w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>`;
    const runs = licChild ? serializeChildren(licChild.children) : '';
    let result = `<w:p>${pPr}${runs}</w:p>`;

    // Append nested list
    if (nestedList) {
      result += serializeElement(nestedList);
    }

    return result;
  }

  // List container (ul/ol) - serialize each li
  if (type === 'ul' || type === 'ol') {
    return children
      .filter((c) => !isText(c))
      .map((c) => serializeElement(c as PlateElement))
      .join('');
  }

  // Table
  if (type === 'table') {
    const rows = children.filter((c) => !isText(c)) as PlateElement[];
    const numCols = rows[0]?.children.filter((c) => !isText(c)).length || 1;

    const tblPr = `<w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/></w:tblPr>`;
    const gridCols = Array(numCols).fill('<w:gridCol w:w="4680"/>').join('');
    const tblGrid = `<w:tblGrid>${gridCols}</w:tblGrid>`;
    const rowsXml = rows.map((r) => serializeElement(r)).join('');

    return `<w:tbl>${tblPr}${tblGrid}${rowsXml}</w:tbl>`;
  }

  // Table row
  if (type === 'tr') {
    const cells = children
      .filter((c) => !isText(c))
      .map((c) => serializeElement(c as PlateElement))
      .join('');
    return `<w:tr>${cells}</w:tr>`;
  }

  // Table cell (td/th)
  if (type === 'td' || type === 'th') {
    const tcPr = `<w:tcPr><w:tcW w:w="4680" w:type="dxa"/></w:tcPr>`;
    // Cell content must be wrapped in paragraph
    const runs = serializeChildren(children);
    return `<w:tc>${tcPr}<w:p>${runs}</w:p></w:tc>`;
  }

  // Fallback: treat as paragraph
  const runs = serializeChildren(children);
  return `<w:p>${runs}</w:p>`;
}

function plateToDocxXml(value: PlateNode[]): {
  body: string;
  relationships: string;
} {
  hyperlinks.length = 0;
  hyperlinkCounter = 4;

  const bodyContent = value
    .filter((n) => !isText(n))
    .map((n) => serializeElement(n as PlateElement))
    .join('\n  ');

  const body = `<w:body xmlns:w="${W_NS}" xmlns:r="${R_NS}">
  ${bodyContent}
  <w:sectPr/>
</w:body>`;

  // Generate relationships for hyperlinks
  const rels = hyperlinks.map(
    (h) =>
      `<Relationship Id="${h.id}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" Target="${escapeXml(h.url)}" TargetMode="External"/>`
  );
  const relationships = rels.length > 0 ? rels.join('\n') : '';

  return { body, relationships };
}

// CLI entry
const args = process.argv.slice(2);
const inputPath = args[0];
const outputIndex = args.indexOf('-o');
const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

if (!inputPath) {
  console.error(
    'Usage: bun run plate-to-docx-xml.ts <input.json> [-o output.xml]'
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
  const { body, relationships } = plateToDocxXml(plateValue);

  const output = `<!-- DOCX Body Fragment -->
${body}

<!-- Hyperlink Relationships (add to word/_rels/document.xml.rels) -->
${relationships || '<!-- No hyperlinks -->'}`;

  if (outputPath) {
    writeFileSync(outputPath, output);
    console.log(`✓ Written to ${outputPath}`);
  } else {
    console.log(output);
  }
} catch (err) {
  console.error('Error:', err instanceof Error ? err.message : err);
  process.exit(1);
}
