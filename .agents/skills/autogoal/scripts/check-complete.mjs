#!/usr/bin/env node
/** biome-ignore-all lint/suspicious/noConsole: CLI scripts write command output. */
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const CHECKLIST_ITEM_PATTERN = /^-\s+\[([ xX])\]\s+/;
const GATE_SECTION_NAMES = ['Start Gates', 'Completion Gates'];
const HEADING_PATTERN = /^#{1,6}\s+\S/;
const HTML_COMMENT_PATTERN = /<!--[\s\S]*?-->/g;
const NEWLINE_PATTERN = /\r?\n/;
const OPEN_STATUS_PATTERN = /^(pending|in[_ -]?progress|todo|open)$/i;
const PHASE_HEADER_PATTERN = /^phase$/i;
const PLACEHOLDER_ONLY_PATTERN = /^(?:-\s*)?(?:pending|none yet)\.?$/i;
const RULE_ONLY_LINE_PATTERN = /^\s*[-|]+\s*$/gm;
const SECTION_START_PATTERN = /^[A-Z][A-Za-z /-]+:\s*$/;
const TABLE_MARKDOWN_SEPARATOR_CELL_PATTERN = /^:?-+:?$/;
const TABLE_SEPARATOR_PATTERN = /^-+$/;
const TODO_PATTERN = /\b(TODO|TBD)\b/i;

const args = parseArgs(process.argv.slice(2));

if (args.help) {
  printHelp();
  process.exit(0);
}

if (args.planPath) {
  const root = findRepoRoot(process.cwd());
  const planPath = path.resolve(root, args.planPath);
  const relativePlanPath = path.relative(root, planPath);
  const failures = [];

  if (
    relativePlanPath.startsWith('..') ||
    path.isAbsolute(relativePlanPath) ||
    !relativePlanPath.startsWith(`docs${path.sep}plans${path.sep}`)
  ) {
    failures.push('goal plan must live under docs/plans/');
  }

  if (existsSync(planPath)) {
    const content = await readFile(planPath, 'utf8');
    failures.push(...checkPlanContent(content));
  } else {
    failures.push(`goal plan not found: ${relativePlanPath}`);
  }

  if (failures.length > 0) {
    console.error(`[autogoal] incomplete: ${relativePlanPath}`);

    for (const failure of failures) {
      console.error(`- ${failure}`);
    }

    process.exitCode = 1;
  } else {
    console.log(`[autogoal] complete: ${relativePlanPath}`);
  }
} else {
  printHelp();
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {};

  for (const arg of argv) {
    if (arg === '--help' || arg === '-h') {
      parsed.help = true;
      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(`unknown flag: ${arg}`);
    }

    if (parsed.planPath) {
      throw new Error(`unexpected extra argument: ${arg}`);
    }

    parsed.planPath = arg;
  }

  return parsed;
}

function checkPlanContent(content) {
  const failures = [];

  for (const section of [
    'Objective',
    'Completion threshold',
    'Verification surface',
    'Constraints',
    'Boundaries',
    'Blocked condition',
  ]) {
    const block = getSectionBlock(content, section);

    if (!hasConcreteContent(block)) {
      failures.push(`${section} must be present and concrete`);
    }
  }

  const checklist = getWorkChecklist(content);

  if (checklist.length === 0) {
    failures.push('Work Checklist must contain checklist items');
  }

  const unchecked = checklist.filter((item) => item.state === ' ');

  if (unchecked.length > 0) {
    failures.push(
      `Work Checklist has unchecked items: ${unchecked
        .map((item) => `line ${item.line}`)
        .join(', ')}`
    );
  }

  failures.push(...checkGateSections(content));

  const phaseStatuses = getPhaseStatuses(content);

  if (phaseStatuses.length === 0) {
    failures.push('Phase / pass table must contain at least one status row');
  }

  const openStatuses = phaseStatuses.filter((status) =>
    OPEN_STATUS_PATTERN.test(status.value)
  );

  if (openStatuses.length > 0) {
    failures.push(
      `Phase / pass table still has open statuses: ${openStatuses
        .map((status) => `${status.name || 'unnamed'}=${status.value}`)
        .join(', ')}`
    );
  }

  const verification = getSectionBlock(content, 'Verification evidence');

  if (!hasConcreteContent(verification)) {
    failures.push('Verification evidence must record fresh final evidence');
  }

  const rebootStatus = getSectionBlock(content, 'Reboot status');

  if (!hasConcreteContent(rebootStatus)) {
    failures.push('Reboot status must be current');
  }

  const openRisks = getSectionBlock(content, 'Open risks');

  if (!hasConcreteContent(openRisks)) {
    failures.push('Open risks must be recorded, even if the value is "None"');
  }

  return failures;
}

function checkGateSections(content) {
  const failures = [];

  for (const sectionName of GATE_SECTION_NAMES) {
    const block = getSectionBlock(content, sectionName);

    if (!block.trim()) {
      continue;
    }

    const table = parseMarkdownTable(block);

    if (table.rows.length === 0) {
      failures.push(`${sectionName} must contain resolved gate table rows`);
      continue;
    }

    for (const column of ['gate', 'applies', 'evidence']) {
      if (!table.headers.includes(column)) {
        failures.push(`${sectionName} table must include ${column}`);
      }
    }

    for (const [index, row] of table.rows.entries()) {
      const label = row.gate || `row ${index + 1}`;

      if (!hasConcreteContent(row.gate || '')) {
        failures.push(`${sectionName} row ${index + 1} must name a gate`);
      }

      if (!hasConcreteContent(row.applies || '')) {
        failures.push(`${sectionName} ${label} must resolve Applies`);
      }

      if (!hasConcreteContent(row.evidence || '')) {
        failures.push(`${sectionName} ${label} must record evidence or reason`);
      }

      for (const [column, value] of Object.entries(row)) {
        if (
          !['gate', 'applies', 'evidence'].includes(column) &&
          !hasConcreteContent(value)
        ) {
          failures.push(`${sectionName} ${label} has unresolved ${column}`);
        }
      }
    }
  }

  return failures;
}

function getSectionBlock(content, label) {
  const lines = content.split(NEWLINE_PATTERN);
  const startIndex = lines.findIndex((line) => line.trim() === `${label}:`);

  if (startIndex === -1) {
    return '';
  }

  const block = [];

  for (let index = startIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (isSectionStart(line)) {
      break;
    }

    block.push(line);
  }

  return block.join('\n').trim();
}

function isSectionStart(line) {
  return HEADING_PATTERN.test(line) || SECTION_START_PATTERN.test(line.trim());
}

function hasConcreteContent(block) {
  if (!block.trim()) {
    return false;
  }

  const normalized = block
    .replace(HTML_COMMENT_PATTERN, '')
    .replace(RULE_ONLY_LINE_PATTERN, '')
    .trim();

  if (!normalized) {
    return false;
  }

  if (TODO_PATTERN.test(normalized)) {
    return false;
  }

  return !PLACEHOLDER_ONLY_PATTERN.test(normalized);
}

function getWorkChecklist(content) {
  const block =
    getSectionBlock(content, 'Work Checklist') ||
    getSectionBlock(content, 'Required checklist');
  const lines = block.split(NEWLINE_PATTERN);
  const items = [];

  for (let index = 0; index < lines.length; index += 1) {
    const match = CHECKLIST_ITEM_PATTERN.exec(lines[index]);

    if (match) {
      items.push({
        line: index + 1,
        state: match[1],
      });
    }
  }

  return items;
}

function parseMarkdownTable(block) {
  let headers = [];
  const rows = [];

  for (const line of block.split(NEWLINE_PATTERN)) {
    if (!line.trim().startsWith('|')) {
      continue;
    }

    const cells = getTableCells(line);

    if (cells.length === 0 || isTableSeparatorRow(cells)) {
      continue;
    }

    if (headers.length === 0) {
      headers = cells.map(normalizeTableHeader);
      continue;
    }

    const row = {};

    for (const [index, header] of headers.entries()) {
      if (header) {
        row[header] = cells[index] ?? '';
      }
    }

    rows.push(row);
  }

  return { headers, rows };
}

function getTableCells(line) {
  return line
    .split('|')
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function isTableSeparatorRow(cells) {
  return cells.every((cell) =>
    TABLE_MARKDOWN_SEPARATOR_CELL_PATTERN.test(cell)
  );
}

function normalizeTableHeader(value) {
  return value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function getPhaseStatuses(content) {
  const block = getSectionBlock(content, 'Phase / pass table');
  const statuses = [];

  for (const line of block.split(NEWLINE_PATTERN)) {
    if (!line.trim().startsWith('|')) {
      continue;
    }

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (
      cells.length < 2 ||
      TABLE_SEPARATOR_PATTERN.test(cells[0]) ||
      PHASE_HEADER_PATTERN.test(cells[0])
    ) {
      continue;
    }

    statuses.push({
      name: cells[0],
      value: cells[1],
    });
  }

  return statuses;
}

function findRepoRoot(start) {
  let current = path.resolve(start);

  while (true) {
    const marker = path.join(current, 'AGENTS.md');

    if (existsSync(marker)) {
      return current;
    }

    const parent = path.dirname(current);

    if (parent === current) {
      throw new Error('could not find repo root containing AGENTS.md');
    }

    current = parent;
  }
}

function printHelp() {
  console.log(`Usage:
  node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/<goal-plan>.md

Validates the active goal plan before update_goal(status: complete). The check
is mechanical: it proves the checklist, phase table, verification evidence,
reboot status, risks, and any Start Gates / Completion Gates tables are
recorded. It does not replace the goal's named tests, browser proof, source
audit, or artifact verification.`);
}
