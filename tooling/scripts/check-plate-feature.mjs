#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const notApplicablePattern = /^N\/A:\s*\S/;
const barePlaceholderPattern = /^(?:pending|todo\b|tbd\b|n\/a\b)|\{\{/i;
const excludedReasonPlaceholderPattern =
  /\b(?:pending|todo|tbd)\b|\bn\/a\b|\{\{/i;
const excludedCellPlaceholderPattern = /\b(?:pending|todo|tbd)\b|\{\{/i;
const flowModePattern =
  /^(?:(?:#{2,6}[ \t]+Flow mode(?::[ \t]*|[ \t]*(?=\r?\n))|(?:\*\*)?Flow mode:(?:\*\*)?[ \t]*)(?:\r?\n[ \t]*)*(?:-[ \t]*)?([^\r\n]+))$/m;
const manifestHeadingPattern =
  /^(?:#{2,6}[ \t]+Feature Manifest:?|(?:\*\*)?Feature Manifest:(?:\*\*)?)[ \t]*$/gm;
const atxHeadingPattern = /^[ \t]{0,3}#{1,6}[ \t]+\S/;
const setextUnderlinePattern = /^[ \t]{0,3}(?:={3,}|-{3,})[ \t]*$/;
const legacyLabelPattern =
  /^[ \t]{0,3}(?:\*\*)?[A-Z][A-Za-z0-9 /_-]*:(?:\*\*)?[ \t]*$/;
const expectedHeaders = [
  'Surface',
  'Applies',
  'Owner',
  'Artifacts',
  'Consumer',
  'Proof',
  'Status',
];
const scriptPath = fileURLToPath(import.meta.url);

export const requiredSurfaces = [
  'API',
  'Package',
  'React adapter',
  'Registry UI',
  'Composition',
  'Scale proof',
  'Registry metadata/examples',
  'Docs',
  'Release artifacts',
];

const flowModes = new Map([
  [
    'new public feature entrypoint',
    {
      excluded: [],
      required: requiredSurfaces.filter((surface) => surface !== 'Scale proof'),
    },
  ],
  [
    'existing package plus React/registry',
    {
      excluded: [],
      required: [
        'Package',
        'React adapter',
        'Registry UI',
        'Composition',
        'Registry metadata/examples',
      ],
    },
  ],
  [
    'existing package plus kit',
    {
      excluded: ['React adapter', 'Registry UI'],
      required: ['Package', 'Composition', 'Registry metadata/examples'],
    },
  ],
  [
    'headless package',
    {
      excluded: [
        'React adapter',
        'Registry UI',
        'Composition',
        'Registry metadata/examples',
      ],
      required: ['Package'],
    },
  ],
  [
    'registry-only',
    {
      excluded: ['Package', 'React adapter'],
      required: ['Registry UI', 'Composition', 'Registry metadata/examples'],
    },
  ],
]);

const stripCommentsAndFences = (source) => {
  const out = [];
  let fence = null;
  let inHtmlComment = false;

  for (const rawLine of source.split(/\r?\n/)) {
    let line = rawLine;

    if (fence) {
      const closeMatch = line.match(/^[ \t]{0,3}(`{3,}|~{3,})[ \t]*$/);
      if (
        closeMatch &&
        closeMatch[1][0] === fence[0] &&
        closeMatch[1].length >= fence.length
      ) {
        fence = null;
      }
      out.push('');
      continue;
    }

    if (inHtmlComment) {
      const end = line.indexOf('-->');
      if (end === -1) {
        out.push('');
        continue;
      }
      line = line.slice(end + 3);
      inHtmlComment = false;
    }

    // Remove single-line HTML comments and detect multi-line comment opens.
    let cleaned = '';
    let cursor = 0;
    while (cursor < line.length) {
      const start = line.indexOf('<!--', cursor);
      if (start === -1) {
        cleaned += line.slice(cursor);
        break;
      }
      cleaned += line.slice(cursor, start);
      const end = line.indexOf('-->', start + 4);
      if (end === -1) {
        inHtmlComment = true;
        break;
      }
      cursor = end + 3;
    }

    const fenceMatch = cleaned.match(/^[ \t]{0,3}(`{3,}|~{3,})(.*)$/);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      const info = fenceMatch[2];
      // CommonMark: backtick fence info strings cannot contain backticks.
      if (marker.startsWith('~') || !info.includes('`')) {
        fence = marker;
        out.push('');
        continue;
      }
    }

    out.push(cleaned);
  }

  return out.join('\n');
};

const splitRow = (line) => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('|')) return null;

  const cells = [];
  let current = '';
  let closed = false;

  for (let index = 1; index < trimmed.length; index += 1) {
    const ch = trimmed[index];
    if (
      ch === '\\' &&
      index + 1 < trimmed.length &&
      trimmed[index + 1] === '|'
    ) {
      current += '|';
      index += 1;
      continue;
    }
    if (ch === '|') {
      cells.push(current.trim());
      current = '';
      if (index === trimmed.length - 1) {
        closed = true;
      }
      continue;
    }
    current += ch;
  }

  if (!closed) return null;
  return cells;
};

const isSeparatorRow = (line, columnCount) => {
  if (!line) return false;
  const cells = splitRow(line);
  return (
    cells !== null &&
    cells.length === columnCount &&
    cells.every((cell) => /^:?-{3,}:?$/.test(cell))
  );
};

const unwrapCodeSpan = (value) => {
  const trimmed = value.trim();
  const match = trimmed.match(/^(`+)(.*)\1$/);
  return match ? match[2].trim() : trimmed;
};

const isResolved = (value) => {
  const normalized = unwrapCodeSpan(value);
  return (
    Boolean(normalized) &&
    !barePlaceholderPattern.test(normalized) &&
    !notApplicablePattern.test(normalized)
  );
};

const isValidNotApplicable = (value) => {
  const normalized = unwrapCodeSpan(value);
  if (!notApplicablePattern.test(normalized)) return false;
  const reason = normalized.replace(/^N\/A:\s*/, '');
  return !excludedReasonPlaceholderPattern.test(reason);
};

const hasExcludedPlaceholder = (value) => {
  const normalized = unwrapCodeSpan(value);
  if (excludedCellPlaceholderPattern.test(normalized)) return true;
  if (notApplicablePattern.test(normalized)) {
    const reason = normalized.replace(/^N\/A:\s*/, '');
    return excludedReasonPlaceholderPattern.test(reason);
  }
  return false;
};

const isExpectedHeader = (cells) =>
  cells !== null &&
  cells.length === expectedHeaders.length &&
  expectedHeaders.every((name, index) => cells[index] === name);

const isHeadingMatch = (text) => /^[ \t]{0,3}#{2,6}[ \t]+/.test(text);

const readTable = (source, label) => {
  const rawMatches = [...source.matchAll(manifestHeadingPattern)];

  if (rawMatches.length === 0) throw new Error(`Missing ${label}`);

  // A `## Feature Manifest` section may wrap `Flow mode:` and a `Feature Manifest:` label before the table.
  const matches = rawMatches.filter((current, idx) => {
    const next = rawMatches[idx + 1];
    if (!next || !isHeadingMatch(current[0]) || isHeadingMatch(next[0])) {
      return true;
    }
    const between = source.slice(current.index + current[0].length, next.index);
    const betweenLines = between.split('\n');
    let hasSectionBreakOrTable = false;
    let prevNonEmpty = false;
    for (const line of betweenLines) {
      if (
        atxHeadingPattern.test(line) ||
        (prevNonEmpty && setextUnderlinePattern.test(line)) ||
        line.trim().startsWith('|')
      ) {
        hasSectionBreakOrTable = true;
        break;
      }
      prevNonEmpty = line.trim().length > 0;
    }
    return hasSectionBreakOrTable;
  });

  if (matches.length > 1) throw new Error(`Duplicate ${label} sections.`);

  const match = matches[0];
  const lines = source.slice(match.index + match[0].length).split('\n');
  let tableStart = -1;
  let prevNonEmpty = false;
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (atxHeadingPattern.test(line)) break;
    if (prevNonEmpty && setextUnderlinePattern.test(line)) break;
    if (legacyLabelPattern.test(line)) break;
    if (line.trim().startsWith('|')) {
      tableStart = index;
      break;
    }
    prevNonEmpty = line.trim().length > 0;
  }

  if (tableStart === -1) throw new Error(`Missing ${label} table.`);

  const headerCells = splitRow(lines[tableStart]);
  if (!isExpectedHeader(headerCells)) {
    throw new Error(`Malformed ${label} header: ${lines[tableStart]}`);
  }
  if (!isSeparatorRow(lines[tableStart + 1], expectedHeaders.length)) {
    throw new Error(`Malformed ${label} separator.`);
  }

  const rows = [];
  for (const line of lines.slice(tableStart + 2)) {
    if (!line.trim().startsWith('|')) break;
    const cells = splitRow(line);
    if (!cells || cells.length !== expectedHeaders.length) {
      throw new Error(`Malformed ${label} row: ${line}`);
    }
    rows.push(cells);
  }

  return rows;
};

export const validateFeaturePlan = (source) => {
  const stripped = stripCommentsAndFences(source);
  const errors = [];
  let rows = [];

  try {
    rows = readTable(stripped, 'Feature Manifest');
  } catch (error) {
    return [error.message];
  }

  const bySurface = new Map(rows.map((row) => [row[0], row]));
  if (bySurface.size !== rows.length) {
    errors.push('Feature Manifest contains duplicate surfaces.');
  }

  for (const surface of requiredSurfaces) {
    const row = bySurface.get(surface);
    if (!row) {
      errors.push(`Missing manifest surface: ${surface}`);
      continue;
    }

    const [, applies, owner, artifacts, consumer, proof, status] = row;
    if (!['yes', 'no'].includes(applies)) {
      errors.push(`${surface}: Applies must be yes or no.`);
    }
    if ([owner, artifacts, consumer, proof, status].some((value) => !value)) {
      errors.push(`${surface}: every manifest cell must be non-empty.`);
    }
    if (applies === 'yes' && status !== 'complete') {
      errors.push(`${surface}: applicable row must be complete.`);
    }
    if (
      applies === 'yes' &&
      [owner, artifacts, consumer, proof].some((value) => !isResolved(value))
    ) {
      errors.push(`${surface}: applicable evidence contains a placeholder.`);
    }
    if (applies === 'no') {
      if (
        ![artifacts, proof, status].every((value) =>
          isValidNotApplicable(value)
        )
      ) {
        errors.push(
          `${surface}: excluded row needs N/A reasons in Artifacts, Proof, and Status.`
        );
      }
      if ([owner, consumer].some((value) => hasExcludedPlaceholder(value))) {
        errors.push(`${surface}: excluded row contains a placeholder.`);
      }
    }
  }

  const extras = rows
    .map(([surface]) => surface)
    .filter((surface) => !requiredSurfaces.includes(surface));
  if (extras.length > 0) {
    errors.push(`Unexpected manifest surfaces: ${extras.join(', ')}`);
  }

  const flowMode = stripped.match(flowModePattern)?.[1]?.trim();
  const flowContract = flowMode ? flowModes.get(flowMode) : undefined;
  if (!flowContract) {
    errors.push(
      `Flow mode must be one of: ${[...flowModes.keys()].join(', ')}.`
    );
  } else {
    for (const surface of flowContract.required) {
      if (bySurface.get(surface)?.[1] !== 'yes') {
        errors.push(`${flowMode}: ${surface} must apply.`);
      }
    }
    for (const surface of flowContract.excluded) {
      if (bySurface.get(surface)?.[1] !== 'no') {
        errors.push(`${flowMode}: ${surface} must be excluded.`);
      }
    }
  }

  return errors;
};

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  const planPath = process.argv[2];
  if (!planPath) {
    console.error(
      'Usage: node tooling/scripts/check-plate-feature.mjs <plan.md>'
    );
    process.exit(1);
  }

  const errors = validateFeaturePlan(readFileSync(resolve(planPath), 'utf-8'));
  if (errors.length > 0) {
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(
    `Plate feature plan: complete (${requiredSurfaces.length} surfaces).`
  );
}
