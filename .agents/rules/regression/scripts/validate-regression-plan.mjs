#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createInputDigest,
  createProofReceiptId,
} from './proof-receipt-contract.mjs';

export { createInputDigest, createProofReceiptId };

export const REGRESSION_OBSERVATIONS = [
  'model',
  'dom-native',
  'focus',
  'popup',
  'geometry-paint',
  'runtime-errors',
  'follow-up-input',
];
export const REGRESSION_PHASES = [
  'setup',
  'during-action',
  'after-action',
  'after-release',
  'follow-up',
];

const ARCHITECTURE_TRIGGERS = new Set([
  'cross-layer-compensation',
  'duplicated-live-identity',
  'per-node-hot-work',
  'second-failed-fix',
  'timer-focus-correctness',
  'ui-repairs-substrate',
]);
const FAILED_FIX_KINDS = new Set([
  'exact-replay',
  'final-verification',
  'reporter-contradiction',
]);
const REGRESSION_SOURCE_PATTERN =
  /(?:\.agents\/rules\/regression(?:\.mdc|\/)|docs\/plans\/templates\/regression\.md)/;
const normalizeHeader = (value) =>
  value
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const isResolved = (value) =>
  Boolean(value) &&
  !/^(?:pending|todo|tbd|none yet|n\/a(?:\s*:|$))/i.test(value.trim()) &&
  !value.includes('{{');

const isNotApplicable = (value) => /^N\/A:\s*\S/i.test(value ?? '');
const isPass = (value) => /^pass:\s*\S/i.test(value ?? '');
const isSuperseded = (value) => /^superseded:\s*\S/i.test(value ?? '');
const isSourceIdentity = (value) =>
  /^(?:commit|dirty):[a-f0-9]{40}$/i.test(value ?? '');
const isSha256 = (value) => /^sha256:[a-f0-9]{64}$/i.test(value ?? '');
const isPixelClassifierOracle = (row) =>
  /\b(?:pixel|classifier|image diff|screenshot diff)\b/i.test(
    [
      row.positive_assertion,
      row.forbidden_state,
      row.proof_layer,
      row.result,
    ].join(' ')
  );
const hasPixelClassifierControls = (value) =>
  /\bpositive-control:\s*pass\b/i.test(value ?? '') &&
  /\bnegative-control:\s*pass\b/i.test(value ?? '') &&
  /\bduplicate-control:\s*pass\b/i.test(value ?? '');
const parseTimestamp = (value) => {
  const timestamp = Date.parse(value ?? '');

  return Number.isFinite(timestamp) ? timestamp : null;
};

const parseCells = (line) => {
  const source = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  const cells = [];
  let cell = '';

  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '\\' && source[index + 1] === '|') {
      cell += '|';
      index += 1;
      continue;
    }
    if (source[index] === '|') {
      cells.push(cell.trim());
      cell = '';
      continue;
    }
    cell += source[index];
  }

  cells.push(cell.trim());

  return cells;
};

const isSeparatorRow = (cells) =>
  cells.every((cell) => /^:?-{3,}:?$/.test(cell));

const findSectionStart = (lines, label) =>
  lines.findIndex((line) => {
    const normalized = line.trim();

    return normalized === `${label}:` || normalized === `## ${label}`;
  });

const parseTable = (markdown, label) => {
  const lines = String(markdown).split(/\r?\n/);
  const sectionStart = findSectionStart(lines, label);

  if (sectionStart === -1) {
    return { error: `missing ${label}`, headers: [], rows: [] };
  }

  const sectionEnd = lines.findIndex(
    (line, index) =>
      index > sectionStart &&
      (/^#{1,6}\s+\S/.test(line) ||
        /^[A-Z][A-Za-z0-9 /-]+:\s*$/.test(line.trim()))
  );
  const effectiveEnd = sectionEnd === -1 ? lines.length : sectionEnd;
  const tableStart = lines.findIndex(
    (line, index) =>
      index > sectionStart &&
      index < effectiveEnd &&
      line.trim().startsWith('|')
  );

  if (tableStart === -1) {
    return { error: `missing ${label} rows`, headers: [], rows: [] };
  }

  const rawHeaders = parseCells(lines[tableStart]);
  const headers = rawHeaders.map(normalizeHeader);
  const rows = [];

  for (let index = tableStart + 1; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line.trim().startsWith('|')) {
      if (rows.length > 0) break;
      continue;
    }

    const cells = parseCells(line);

    if (isSeparatorRow(cells)) continue;

    const row = {};

    for (const [cellIndex, header] of headers.entries()) {
      row[header] = cells[cellIndex] ?? '';
    }

    rows.push(row);
  }

  return { headers, rows };
};

const requireHeaders = (table, label, expected, errors) => {
  if (table.error) {
    errors.push(table.error);
    return false;
  }

  for (const header of expected) {
    if (!table.headers.includes(header)) {
      errors.push(`${label} requires column ${header.replaceAll('_', ' ')}`);
    }
  }

  if (table.rows.length === 0) {
    errors.push(`${label} requires at least one row`);
  }

  return expected.every((header) => table.headers.includes(header));
};

const parseTestAnchor = (value) => {
  const normalized = value?.replaceAll('`', '').trim();
  const match = normalized?.match(/^test:\s*([^#]+)#(.+)$/i);

  return match ? { path: match[1].trim(), title: match[2].trim() } : null;
};

const validateTestAnchor = (value, rootDir, label, errors) => {
  const anchor = parseTestAnchor(value);

  if (!anchor) {
    errors.push(`${label} requires Executable anchor test: <path>#<title>`);
    return;
  }

  const absolutePath = resolve(rootDir, anchor.path);
  const relativePath = relative(rootDir, absolutePath);

  if (
    isAbsolute(relativePath) ||
    relativePath.startsWith('..') ||
    !existsSync(absolutePath)
  ) {
    errors.push(`${label} references missing executable test ${anchor.path}`);
    return;
  }

  if (!readFileSync(absolutePath, 'utf8').includes(anchor.title)) {
    errors.push(`${label} references missing test title ${anchor.title}`);
  }
};

const toReceipt = (row) => ({
  attempt: row.attempt,
  caseId: row.case_id,
  claim: row.claim,
  command: row.command,
  host: row.host,
  inputCount: row.input_count,
  inputDigest: row.input_digest,
  inputs: row.inputs,
  latestInputMtime: row.latest_input_mtime,
  proofEnded: row.proof_ended,
  proofStarted: row.proof_started,
  ref: row.ref,
  result: row.result,
  retries: row.retries,
});

const splitCases = (value) =>
  (value ?? '')
    .replaceAll('`', '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const splitInputs = (value) =>
  (value ?? '')
    .replaceAll('`', '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

const splitOracleAnchors = (value) =>
  (value ?? '')
    .replaceAll('`', '')
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);

const parseOracleAnchor = (value) => {
  const match = value.match(/^([a-z-]+)@([a-z-]+)$/);

  return match ? { observation: match[1], phase: match[2] } : null;
};

const parseArchitectureTriggers = (value) => {
  if (/^none:\s*\S/i.test(value ?? '')) return [];

  return (value ?? '')
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
};

const isPlaceholderRow = (row) =>
  Object.values(row).every((value) => !isResolved(value));

export const validateRegressionPlan = (
  markdown,
  { complete = false, rootDir = process.cwd() } = {}
) => {
  const errors = [];
  const selectedTable = parseTable(markdown, 'Selected executable cases');
  const selectedHeaders = [
    'case_id',
    'source_reference',
    'setup_action',
    'expected_outcome',
    'exact_environment',
    'test_file_command',
    'status',
    'tested_ref',
    'next_owner',
  ];

  if (
    !requireHeaders(
      selectedTable,
      'Selected executable cases',
      selectedHeaders,
      errors
    )
  ) {
    return errors;
  }

  const cases = new Map();

  for (const row of selectedTable.rows) {
    const caseId = row.case_id;
    const label = `case ${caseId || '<missing>'}`;

    if (!isResolved(caseId)) {
      errors.push('Selected executable cases requires Case ID');
      continue;
    }
    if (cases.has(caseId)) {
      errors.push(`duplicate selected case ${caseId}`);
      continue;
    }

    for (const field of [
      'source_reference',
      'setup_action',
      'expected_outcome',
      'test_file_command',
      'next_owner',
    ]) {
      if (!isResolved(row[field])) {
        errors.push(`${label} requires ${field.replaceAll('_', ' ')}`);
      }
    }
    if (
      !isResolved(row.exact_environment) &&
      !isNotApplicable(row.exact_environment)
    ) {
      errors.push(`${label} requires Exact environment or N/A reason`);
    }
    if (!isSourceIdentity(row.tested_ref)) {
      errors.push(`${label} requires Tested ref commit:<sha> or dirty:<sha>`);
    }
    if (
      complete &&
      !['completed', 'kept'].includes(row.status?.toLowerCase())
    ) {
      errors.push(`${label} is not completed or kept`);
    }

    cases.set(caseId, row);
  }

  const evidenceTable = parseTable(markdown, 'Reporter evidence inventory');
  const evidenceHeaders = [
    'case_id',
    'source_role',
    'source_reference',
    'phase',
    'claim',
    'disposition',
    'oracle_anchors',
    'executable_anchor',
    'result',
  ];
  const evidenceByCase = new Map();

  if (
    requireHeaders(
      evidenceTable,
      'Reporter evidence inventory',
      evidenceHeaders,
      errors
    )
  ) {
    const seenEvidence = new Set();

    for (const row of evidenceTable.rows) {
      const caseId = row.case_id;
      const label = `reporter evidence ${caseId || '<missing>'}`;

      if (!cases.has(caseId)) {
        errors.push(`${label} references an unknown case`);
        continue;
      }
      for (const field of ['source_role', 'source_reference', 'claim']) {
        if (!isResolved(row[field])) {
          errors.push(`${label} requires ${field.replaceAll('_', ' ')}`);
        }
      }
      const phase = row.phase?.toLowerCase();

      if (!REGRESSION_PHASES.includes(phase)) {
        errors.push(`${label} requires a valid interaction Phase`);
      }

      const evidenceKey = [
        caseId,
        row.source_role,
        row.source_reference,
        phase,
        row.claim,
      ].join('|');

      if (seenEvidence.has(evidenceKey)) {
        errors.push(`${label} duplicates one reporter claim`);
      }
      seenEvidence.add(evidenceKey);

      const disposition = row.disposition?.toLowerCase();

      if (disposition === 'required') {
        const anchors = splitOracleAnchors(row.oracle_anchors);

        if (anchors.length === 0) {
          errors.push(`${label} requires Oracle anchors`);
        }
        for (const anchor of anchors) {
          const parsed = parseOracleAnchor(anchor);

          if (
            !parsed ||
            !REGRESSION_OBSERVATIONS.includes(parsed.observation) ||
            !REGRESSION_PHASES.includes(parsed.phase)
          ) {
            errors.push(
              `${label} has invalid Oracle anchor ${anchor}; expected observation@phase`
            );
          }
        }
        validateTestAnchor(row.executable_anchor, rootDir, label, errors);
        if (complete && !isPass(row.result)) {
          errors.push(`${label} requires Result pass: <evidence>`);
        } else if (!complete && !isResolved(row.result)) {
          errors.push(`${label} requires a current Result`);
        }
      } else if (isSuperseded(row.disposition)) {
        for (const field of [
          'oracle_anchors',
          'executable_anchor',
          'result',
        ]) {
          if (!isNotApplicable(row[field])) {
            errors.push(
              `${label} superseded ${field.replaceAll('_', ' ')} requires N/A reason`
            );
          }
        }
      } else {
        errors.push(
          `${label} requires Disposition required or superseded: <reason>`
        );
      }

      const rows = evidenceByCase.get(caseId) ?? [];
      rows.push(row);
      evidenceByCase.set(caseId, rows);
    }

    for (const caseId of cases.keys()) {
      if (
        !evidenceByCase
          .get(caseId)
          ?.some((row) => row.disposition?.toLowerCase() === 'required')
      ) {
        errors.push(`${caseId} requires at least one required reporter claim`);
      }
    }
  }

  const oracleTable = parseTable(markdown, 'Reporter oracle matrix');
  const oracleHeaders = [
    'case_id',
    'observation',
    'phase',
    'applies',
    'positive_assertion',
    'forbidden_state',
    'proof_layer',
    'executable_anchor',
    'result',
  ];

  if (
    !requireHeaders(
      oracleTable,
      'Reporter oracle matrix',
      oracleHeaders,
      errors
    )
  ) {
    return errors;
  }

  const oracleByCase = new Map();

  for (const row of oracleTable.rows) {
    const caseId = row.case_id;
    const observation = row.observation?.toLowerCase();
    const phase = row.phase?.toLowerCase();
    const label = `${caseId || '<missing>'} ${observation || '<missing>'}@${phase || '<missing>'}`;

    if (!cases.has(caseId)) {
      errors.push(`Reporter oracle matrix references unknown case ${caseId}`);
      continue;
    }
    if (!REGRESSION_OBSERVATIONS.includes(observation)) {
      errors.push(`${label} has invalid Observation`);
      continue;
    }
    if (!REGRESSION_PHASES.includes(phase)) {
      errors.push(`${label} has invalid Phase`);
      continue;
    }

    const caseRows = oracleByCase.get(caseId) ?? new Map();
    const oracleKey = `${observation}@${phase}`;

    if (caseRows.has(oracleKey)) {
      errors.push(`${label} is duplicated`);
      continue;
    }

    caseRows.set(oracleKey, row);
    oracleByCase.set(caseId, caseRows);

    const applies = row.applies?.toLowerCase();

    if (!['yes', 'no'].includes(applies)) {
      errors.push(`${label} requires Applies yes or no`);
      continue;
    }

    if (applies === 'no') {
      for (const field of [
        'positive_assertion',
        'forbidden_state',
        'proof_layer',
        'executable_anchor',
        'result',
      ]) {
        if (!isNotApplicable(row[field])) {
          errors.push(
            `${label} ${field.replaceAll('_', ' ')} requires N/A reason`
          );
        }
      }
      continue;
    }

    if (!isResolved(row.positive_assertion)) {
      errors.push(`${label} requires Positive assertion`);
    }
    if (!isResolved(row.forbidden_state)) {
      errors.push(`${label} requires Forbidden state`);
    }
    if (
      isResolved(row.positive_assertion) &&
      row.positive_assertion === row.forbidden_state
    ) {
      errors.push(`${label} positive and forbidden states must differ`);
    }
    if (
      !isResolved(row.proof_layer) ||
      !/\b(?:package|dom|browser|exact-chrome|device)\b/i.test(row.proof_layer)
    ) {
      errors.push(`${label} requires an executable Proof layer`);
    }
    validateTestAnchor(row.executable_anchor, rootDir, label, errors);
    if (complete && !isPass(row.result)) {
      errors.push(`${label} requires Result pass: <evidence>`);
    } else if (!complete && !isResolved(row.result)) {
      errors.push(`${label} requires a current Result`);
    }
    if (
      complete &&
      observation === 'geometry-paint' &&
      isPixelClassifierOracle(row) &&
      !hasPixelClassifierControls(row.result)
    ) {
      errors.push(
        `${label} pixel classifier requires positive-control: pass, negative-control: pass, and duplicate-control: pass evidence`
      );
    }
  }

  for (const caseId of cases.keys()) {
    const rows = oracleByCase.get(caseId);

    for (const observation of REGRESSION_OBSERVATIONS) {
      if (
        !Array.from(rows?.values() ?? []).some(
          (row) => row.observation?.toLowerCase() === observation
        )
      ) {
        errors.push(`${caseId} is missing oracle observation ${observation}`);
      }
    }
    if (
      rows &&
      !Array.from(rows.values()).some(
        (row) => row.applies?.toLowerCase() === 'yes'
      )
    ) {
      errors.push(`${caseId} requires at least one applicable oracle row`);
    }
  }

  for (const [caseId, evidenceRows] of evidenceByCase) {
    const caseOracles = oracleByCase.get(caseId);

    for (const row of evidenceRows) {
      if (row.disposition?.toLowerCase() !== 'required') continue;

      for (const anchor of splitOracleAnchors(row.oracle_anchors)) {
        const oracle = caseOracles?.get(anchor);

        if (!oracle) {
          errors.push(
            `reporter evidence ${caseId} requires missing oracle ${anchor}`
          );
        } else if (oracle.applies?.toLowerCase() !== 'yes') {
          errors.push(
            `reporter evidence ${caseId} requires applicable oracle ${anchor}`
          );
        }
      }
    }
  }

  const failedTable = parseTable(markdown, 'Failed fix history');
  const failedHeaders = [
    'case_id',
    'attempt',
    'failure_signal',
    'failure_kind',
    'prior_claim_invalidated',
    'regression_repair',
    'workflow_test',
    'architecture_trigger',
    'best_api_layer_plan',
    'resume_state',
  ];
  const failedCountByCase = new Map(
    Array.from(cases.keys(), (caseId) => [caseId, 0])
  );

  if (
    requireHeaders(
      failedTable,
      'Failed fix history',
      failedHeaders,
      errors
    )
  ) {
    const noneRows = failedTable.rows.filter(
      (row) => row.case_id?.toLowerCase() === 'none'
    );
    const failedRows = failedTable.rows.filter(
      (row) => row.case_id?.toLowerCase() !== 'none'
    );

    if (failedRows.length === 0) {
      if (noneRows.length !== 1 || noneRows[0].attempt !== '0') {
        errors.push(
          'Failed fix history requires one explicit none / attempt 0 row when no claimed fix failed'
        );
      }
    } else if (noneRows.length > 0) {
      errors.push('Failed fix history cannot mix none with failed attempts');
    }

    const attemptsByCase = new Map();
    const failureKindsByCase = new Map();

    for (const row of failedRows) {
      const caseId = row.case_id;
      const attempt = Number.parseInt(row.attempt, 10);
      const label = `failed fix ${caseId} attempt ${row.attempt}`;

      if (!cases.has(caseId)) {
        errors.push(`${label} references an unknown case`);
        continue;
      }
      if (!Number.isInteger(attempt) || attempt < 1) {
        errors.push(`${label} requires a positive Attempt`);
        continue;
      }
      if (!isResolved(row.failure_signal)) {
        errors.push(`${label} requires Failure signal`);
      }
      const failureKind = row.failure_kind?.toLowerCase();

      if (!FAILED_FIX_KINDS.has(failureKind)) {
        errors.push(
          `${label} requires Failure kind exact-replay, final-verification, or reporter-contradiction`
        );
      } else {
        const failureKinds = failureKindsByCase.get(caseId) ?? new Set();

        failureKinds.add(failureKind);
        failureKindsByCase.set(caseId, failureKinds);
      }
      if (!/^yes:\s*\S/i.test(row.prior_claim_invalidated ?? '')) {
        errors.push(`${label} must invalidate the prior claim`);
      }
      if (
        !/^repair-now:\s*\S/i.test(row.regression_repair ?? '') ||
        !REGRESSION_SOURCE_PATTERN.test(row.regression_repair)
      ) {
        errors.push(
          `${label} requires repair-now in a Regression source owner`
        );
      }
      if (!isPass(row.workflow_test)) {
        errors.push(`${label} requires Workflow test pass: <evidence>`);
      }

      const architectureTrigger = row.architecture_trigger ?? '';
      const hasArchitectureTrigger = /^yes:\s*\S/i.test(architectureTrigger);

      if (
        !hasArchitectureTrigger &&
        !/^no:\s*\S/i.test(architectureTrigger)
      ) {
        errors.push(`${label} requires Architecture trigger yes/no with reason`);
      }
      if (attempt >= 2 || hasArchitectureTrigger) {
        if (!/\bbest-api\b/i.test(row.best_api_layer_plan ?? '')) {
          errors.push(`${label} requires Best API`);
        }
        if (!/\b(?:plite-plan|plate-plan)\b/i.test(row.best_api_layer_plan ?? '')) {
          errors.push(`${label} requires a Plite or Plate layer plan`);
        }
      } else if (
        !isNotApplicable(row.best_api_layer_plan) &&
        !/\bbest-api\b/i.test(row.best_api_layer_plan ?? '')
      ) {
        errors.push(`${label} requires escalation evidence or N/A reason`);
      }
      if (!/^(?:reproduced|blocked):\s*\S/i.test(row.resume_state ?? '')) {
        errors.push(
          `${label} must resume from reproduced: <evidence> or blocked: <reason>`
        );
      }

      const attempts = attemptsByCase.get(caseId) ?? [];
      attempts.push(attempt);
      attemptsByCase.set(caseId, attempts);
    }

    for (const [caseId, attempts] of attemptsByCase) {
      attempts.sort((left, right) => left - right);
      const expected = Array.from(
        { length: attempts.length },
        (_, index) => index + 1
      );

      if (attempts.join(',') !== expected.join(',')) {
        errors.push(`${caseId} failed fix attempts must be sequential from 1`);
      }
      failedCountByCase.set(caseId, attempts.length);
    }

    for (const [caseId, failedCount] of failedCountByCase) {
      if (failedCount === 0) continue;

      const evidenceRows = evidenceByCase.get(caseId) ?? [];
      const requiredRoles = new Set(
        evidenceRows
          .filter((row) => row.disposition?.toLowerCase() === 'required')
          .map((row) => row.source_role?.toLowerCase())
      );
      const baseAcceptance = evidenceRows.filter(
        (row) => row.source_role?.toLowerCase() === 'base-acceptance'
      );

      if (
        !baseAcceptance.some(
          (row) =>
            row.disposition?.toLowerCase() === 'required' ||
            isSuperseded(row.disposition)
        )
      ) {
        errors.push(
          `${caseId} failed fix requires base-acceptance evidence marked required or superseded`
        );
      }
      if (
        failureKindsByCase.get(caseId)?.has('reporter-contradiction') &&
        !requiredRoles.has('latest-reporter-delta')
      ) {
        errors.push(
          `${caseId} reporter contradiction requires required latest-reporter-delta evidence`
        );
      }
    }
  }

  const architectureTable = parseTable(markdown, 'Architecture pressure');
  const architectureHeaders = [
    'case_id',
    'failed_fix_count',
    'triggers',
    'verdict',
    'best_api',
    'layer_plan',
    'proof',
  ];

  if (
    requireHeaders(
      architectureTable,
      'Architecture pressure',
      architectureHeaders,
      errors
    )
  ) {
    const architectureByCase = new Map();

    for (const row of architectureTable.rows) {
      const caseId = row.case_id;
      const label = `architecture pressure ${caseId || '<missing>'}`;

      if (!cases.has(caseId)) {
        errors.push(`${label} references an unknown case`);
        continue;
      }
      if (architectureByCase.has(caseId)) {
        errors.push(`${label} is duplicated`);
        continue;
      }
      architectureByCase.set(caseId, row);

      const count = Number.parseInt(row.failed_fix_count, 10);
      const expectedCount = failedCountByCase.get(caseId) ?? 0;

      if (count !== expectedCount) {
        errors.push(
          `${label} Failed fix count ${row.failed_fix_count} does not match ${expectedCount}`
        );
      }

      const triggers = parseArchitectureTriggers(row.triggers);

      for (const trigger of triggers) {
        if (!ARCHITECTURE_TRIGGERS.has(trigger)) {
          errors.push(`${label} has unknown trigger ${trigger}`);
        }
      }
      if (count >= 2 && !triggers.includes('second-failed-fix')) {
        errors.push(`${label} requires trigger second-failed-fix`);
      }

      const mustEscalate = count >= 2 || triggers.length > 0;
      const verdict = row.verdict?.toLowerCase();

      if (mustEscalate) {
        if (verdict !== 'escalate') {
          errors.push(`${label} requires architecture verdict escalate`);
        }
        if (!/^required:.*\bbest-api\b/i.test(row.best_api ?? '')) {
          errors.push(`${label} requires Best API`);
        }
        if (!/^(?:plite-plan|plate-plan):\s*\S/i.test(row.layer_plan ?? '')) {
          errors.push(`${label} requires a Plite or Plate layer plan`);
        }
      } else if (!['patch', 'escalate'].includes(verdict)) {
        errors.push(`${label} requires verdict patch or escalate`);
      } else if (verdict === 'escalate') {
        if (!/^required:.*\bbest-api\b/i.test(row.best_api ?? '')) {
          errors.push(`${label} requires Best API`);
        }
        if (!/^(?:plite-plan|plate-plan):\s*\S/i.test(row.layer_plan ?? '')) {
          errors.push(`${label} requires a Plite or Plate layer plan`);
        }
      } else {
        if (!isNotApplicable(row.best_api)) {
          errors.push(`${label} Best API requires N/A reason`);
        }
        if (!isNotApplicable(row.layer_plan)) {
          errors.push(`${label} Layer plan requires N/A reason`);
        }
      }
      if (complete && !/^(?:pass|accepted):\s*\S/i.test(row.proof ?? '')) {
        errors.push(`${label} requires proof pass: or accepted:`);
      }
    }

    for (const caseId of cases.keys()) {
      if (!architectureByCase.has(caseId)) {
        errors.push(`${caseId} is missing Architecture pressure`);
      }
    }
  }

  const receiptTable = parseTable(markdown, 'Proof receipts');
  const receiptHeaders = [
    'case_id',
    'attempt',
    'claim',
    'command',
    'result',
    'ref',
    'input_digest',
    'input_count',
    'inputs',
    'host',
    'latest_input_mtime',
    'proof_started',
    'proof_ended',
    'retries',
    'receipt_id',
  ];
  const receiptsByCase = new Map();

  if (
    requireHeaders(receiptTable, 'Proof receipts', receiptHeaders, errors)
  ) {
    const receiptRows =
      !complete && receiptTable.rows.every(isPlaceholderRow)
        ? []
        : receiptTable.rows;

    for (const row of receiptRows) {
      const receipt = toReceipt(row);
      const label = `proof receipt ${receipt.caseId || '<missing>'}`;

      if (!cases.has(receipt.caseId)) {
        errors.push(`${label} references an unknown case`);
        continue;
      }

      const attempt = Number.parseInt(receipt.attempt, 10);
      const expectedAttempt = (failedCountByCase.get(receipt.caseId) ?? 0) + 1;

      if (attempt !== expectedAttempt) {
        errors.push(
          `${label} must replace invalidated receipts with attempt ${expectedAttempt}`
        );
      }
      if (complete && receipt.claim?.toLowerCase() !== 'completed') {
        errors.push(`${label} requires Claim completed`);
      }
      if (!isResolved(receipt.command)) {
        errors.push(`${label} requires Command`);
      }
      if (complete && !isPass(receipt.result)) {
        errors.push(`${label} requires Result pass: <evidence>`);
      }
      if (!isSourceIdentity(receipt.ref)) {
        errors.push(`${label} requires Ref commit:<sha> or dirty:<sha>`);
      }
      if (!isSha256(receipt.inputDigest)) {
        errors.push(`${label} requires Input digest sha256:<hash>`);
      }
      if (
        !Number.isInteger(Number.parseInt(receipt.inputCount, 10)) ||
        Number.parseInt(receipt.inputCount, 10) < 1
      ) {
        errors.push(`${label} requires positive Input count`);
      }
      const inputs = splitInputs(receipt.inputs);

      if (inputs.length !== Number.parseInt(receipt.inputCount, 10)) {
        errors.push(`${label} Input count does not match Inputs`);
      }
      if (new Set(inputs).size !== inputs.length) {
        errors.push(`${label} Inputs must be unique`);
      }
      if (complete && inputs.length > 0) {
        try {
          if (createInputDigest(rootDir, inputs) !== receipt.inputDigest) {
            errors.push(`${label} Input digest does not match current bytes`);
          }
        } catch (error) {
          errors.push(
            `${label} ${error instanceof Error ? error.message : error}`
          );
        }
      }
      if (!isResolved(receipt.host)) {
        errors.push(`${label} requires Host identity or host:none reason`);
      }

      const latestInput = parseTimestamp(receipt.latestInputMtime);
      const proofStarted = parseTimestamp(receipt.proofStarted);
      const proofEnded = parseTimestamp(receipt.proofEnded);

      if (latestInput === null) {
        errors.push(`${label} requires ISO Latest input mtime`);
      }
      if (proofStarted === null) {
        errors.push(`${label} requires ISO Proof started`);
      }
      if (proofEnded === null) {
        errors.push(`${label} requires ISO Proof ended`);
      }
      if (
        latestInput !== null &&
        proofStarted !== null &&
        latestInput > proofStarted
      ) {
        errors.push(`${label} started before its latest input edit`);
      }
      if (
        proofStarted !== null &&
        proofEnded !== null &&
        proofStarted > proofEnded
      ) {
        errors.push(`${label} ended before it started`);
      }
      if (receipt.retries !== '0') {
        errors.push(`${label} requires Retries 0`);
      }
      if (row.receipt_id !== createProofReceiptId(receipt)) {
        errors.push(`${label} has an invalid Receipt ID`);
      }

      const receipts = receiptsByCase.get(receipt.caseId) ?? [];
      receipts.push({
        ...receipt,
        proofStartedTimestamp: proofStarted,
      });
      receiptsByCase.set(receipt.caseId, receipts);
    }
  }

  for (const [caseId, selected] of cases) {
    const receipts = receiptsByCase.get(caseId) ?? [];
    const oracleRows = oracleByCase.get(caseId);
    const geometryPaintApplies = Array.from(oracleRows?.values() ?? []).some(
      (row) =>
        row.observation?.toLowerCase() === 'geometry-paint' &&
        row.applies?.toLowerCase() === 'yes'
    );
    const browserSpecific =
      /\b(?:chrome|blink|compositor|native browser)\b/i.test(
        [
          selected.source_reference,
          selected.setup_action,
          selected.expected_outcome,
        ].join(' ')
      ) || geometryPaintApplies;

    if (complete && receipts.length === 0) {
      errors.push(`${caseId} is missing a completed Proof receipt`);
    }
    if (browserSpecific) {
      if (!/^exact-chrome:\s*\S/i.test(selected.exact_environment ?? '')) {
        errors.push(`${caseId} requires Exact environment exact-chrome: <proof>`);
      }
      if (
        geometryPaintApplies &&
        !Array.from(oracleRows?.values() ?? []).some(
          (row) =>
            row.observation?.toLowerCase() === 'geometry-paint' &&
            row.applies?.toLowerCase() === 'yes' &&
            /\bexact-chrome\b/i.test(row.proof_layer ?? '')
        )
      ) {
        errors.push(`${caseId} geometry-paint requires proof layer exact-chrome`);
      }
      if (
        complete &&
        !receipts.some(
          (receipt) =>
            /(?:^|;)browser:exact-chrome(?::|;|$)/i.test(receipt.host) &&
            /(?:^|;)browser-executable:\S/i.test(receipt.host) &&
            /(?:^|;)browser-version:[^;]*chrome\s+\S/i.test(receipt.host)
        )
      ) {
        errors.push(
          `${caseId} requires an executable-attested exact Chrome proof receipt`
        );
      }
    }
  }

  const corpusTable = parseTable(markdown, 'Affected corpus replay');
  const corpusHeaders = [
    'owner',
    'affected_cases',
    'pre_edit_baseline',
    'last_owner_edit',
    'combined_command',
    'receipt_input_digest',
    'result',
  ];

  if (
    requireHeaders(
      corpusTable,
      'Affected corpus replay',
      corpusHeaders,
      errors
    )
  ) {
    if (!complete && corpusTable.rows.every(isPlaceholderRow)) {
      // Final shared-owner replay does not exist before implementation.
    } else {
    const coveredCases = new Set();
    const allReceipts = Array.from(receiptsByCase.values()).flat();

    for (const row of corpusTable.rows) {
      const label = `affected corpus ${row.owner || '<missing>'}`;
      const affectedCases = splitCases(row.affected_cases);

      if (!isResolved(row.owner)) errors.push(`${label} requires Owner`);
      if (affectedCases.length === 0) {
        errors.push(`${label} requires Affected cases`);
      }
      for (const caseId of affectedCases) {
        if (!cases.has(caseId)) {
          errors.push(`${label} references unknown case ${caseId}`);
        } else {
          coveredCases.add(caseId);
        }
      }
      if (!/^(?:pass|red):\s*\S/i.test(row.pre_edit_baseline ?? '')) {
        errors.push(`${label} requires Pre-edit baseline pass: or red:`);
      }

      const finalReplayFields = [
        row.last_owner_edit,
        row.combined_command,
        row.receipt_input_digest,
        row.result,
      ];

      if (!complete && finalReplayFields.every((field) => !isResolved(field))) {
        continue;
      }

      if (!isResolved(row.combined_command)) {
        errors.push(`${label} requires Combined command`);
      }
      if (!isSha256(row.receipt_input_digest)) {
        errors.push(`${label} requires Receipt input digest sha256:<hash>`);
      }
      if (complete && !isPass(row.result)) {
        errors.push(`${label} requires Result pass: <evidence>`);
      }

      const lastOwnerEdit = parseTimestamp(row.last_owner_edit);
      const matchingReceipts = allReceipts.filter(
        (receipt) => receipt.inputDigest === row.receipt_input_digest
      );

      if (lastOwnerEdit === null) {
        errors.push(`${label} requires ISO Last owner edit`);
      }
      if (matchingReceipts.length === 0) {
        errors.push(`${label} does not match a Proof receipt input digest`);
      } else if (
        lastOwnerEdit !== null &&
        matchingReceipts.every(
          (receipt) =>
            receipt.proofStartedTimestamp === null ||
            lastOwnerEdit > receipt.proofStartedTimestamp
        )
      ) {
        errors.push(`${label} replay started before the last owner edit`);
      }
    }

    if (complete) {
      for (const caseId of cases.keys()) {
        if (!coveredCases.has(caseId)) {
          errors.push(`${caseId} is missing from Affected corpus replay`);
        }
      }
    }
    }
  }

  const gateFailureTable = parseTable(markdown, 'Gate failure closure');
  const gateFailureHeaders = [
    'gate',
    'failure_signal',
    'classification',
    'resolution',
    'final_rerun',
  ];

  if (
    requireHeaders(
      gateFailureTable,
      'Gate failure closure',
      gateFailureHeaders,
      errors
    )
  ) {
    if (!complete && gateFailureTable.rows.every(isPlaceholderRow)) {
      // A gate cannot fail before execution starts.
    } else {
      const noneRows = gateFailureTable.rows.filter(
        (row) => row.gate?.toLowerCase() === 'none'
      );
      const failedGateRows = gateFailureTable.rows.filter(
        (row) => row.gate?.toLowerCase() !== 'none'
      );

      if (failedGateRows.length === 0) {
        if (noneRows.length !== 1) {
          errors.push(
            'Gate failure closure requires one explicit none row when no started gate failed'
          );
        } else {
          for (const field of [
            'failure_signal',
            'classification',
            'resolution',
            'final_rerun',
          ]) {
            if (!isNotApplicable(noneRows[0][field])) {
              errors.push(
                `Gate failure closure none ${field.replaceAll('_', ' ')} requires N/A reason`
              );
            }
          }
        }
      } else if (noneRows.length > 0) {
        errors.push('Gate failure closure cannot mix none with failed gates');
      }

      for (const row of failedGateRows) {
        const label = `gate failure ${row.gate || '<missing>'}`;

        for (const field of [
          'gate',
          'failure_signal',
          'classification',
          'resolution',
        ]) {
          if (!isResolved(row[field])) {
            errors.push(`${label} requires ${field.replaceAll('_', ' ')}`);
          }
        }
        if (complete && !isPass(row.final_rerun)) {
          errors.push(`${label} requires Final rerun pass: <evidence>`);
        } else if (!complete && !isResolved(row.final_rerun)) {
          errors.push(`${label} requires a current Final rerun`);
        }
      }
    }
  }

  const methodologyTable = parseTable(markdown, 'Methodology deltas');
  const methodologyHeaders = [
    'case',
    'miss_or_owner_checked',
    'decision',
    'durable_owner_change',
    'focused_proof',
    'trigger_result',
  ];

  if (
    requireHeaders(
      methodologyTable,
      'Methodology deltas',
      methodologyHeaders,
      errors
    )
  ) {
    if (!complete && methodologyTable.rows.every(isPlaceholderRow)) {
      return errors;
    }
    const methodologyByCase = new Map();

    for (const row of methodologyTable.rows) {
      methodologyByCase.set(row.case, row);
    }

    for (const caseId of cases.keys()) {
      const row = methodologyByCase.get(caseId);
      const failedCount = failedCountByCase.get(caseId) ?? 0;

      if (!row) {
        errors.push(`${caseId} is missing Methodology delta`);
        continue;
      }
      if (
        !['repair-now', 'no-change', 'defer'].includes(
          row.decision?.toLowerCase()
        )
      ) {
        errors.push(`${caseId} has invalid Methodology decision`);
      }
      if (failedCount > 0) {
        if (row.decision?.toLowerCase() !== 'repair-now') {
          errors.push(`${caseId} failed fix requires Methodology repair-now`);
        }
        if (!REGRESSION_SOURCE_PATTERN.test(row.durable_owner_change ?? '')) {
          errors.push(`${caseId} failed fix requires Regression durable owner`);
        }
        if (!isPass(row.focused_proof)) {
          errors.push(`${caseId} failed fix requires focused workflow proof`);
        }
      }
      for (const field of [
        'miss_or_owner_checked',
        'durable_owner_change',
        'focused_proof',
        'trigger_result',
      ]) {
        if (!isResolved(row[field])) {
          errors.push(`${caseId} Methodology delta requires ${field}`);
        }
      }
    }
  }

  return errors;
};

const findRepoRoot = (start) => {
  let current = resolve(start);

  while (true) {
    if (existsSync(join(current, 'AGENTS.md'))) return current;

    const parent = dirname(current);

    if (parent === current) {
      throw new Error('could not find repo root containing AGENTS.md');
    }
    current = parent;
  }
};

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))
) {
  const args = process.argv.slice(2);
  const complete = args.includes('--complete');
  const planPath = args.find((arg) => !arg.startsWith('--'));

  if (!planPath) {
    process.stderr.write(
      'Usage: validate-regression-plan.mjs <plan.md> [--complete]\n'
    );
    process.exitCode = 1;
  } else {
    const rootDir = findRepoRoot(process.cwd());
    const absolutePlan = resolve(rootDir, planPath);
    const errors = validateRegressionPlan(readFileSync(absolutePlan, 'utf8'), {
      complete,
      rootDir,
    });

    if (errors.length > 0) {
      process.stderr.write(`${errors.join('\n')}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(
        `Regression plan: ${complete ? 'semantically complete' : 'structurally valid'}.\n`
      );
    }
  }
}
