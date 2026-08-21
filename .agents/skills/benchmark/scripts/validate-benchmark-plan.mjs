#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_BENCHMARK_LANES = [
  'source-and-host-readiness',
  'current-vs-main-product-smoke',
  'plate-vs-plite-decomposition',
  'owner-microbench-and-trace',
  'product-mount-matrix',
  'trusted-editing-matrix',
  'plite-vs-pinned-slate',
  'example-breadth',
  'large-and-stress',
];

const CAUSE_FIELDS = [
  'cause-id',
  'lane',
  'comparable-baseline',
  'material-delta',
  'isolated-owner',
  'causal-intervention',
  'fix-class',
  'long-term-target',
  'decision-owner',
  'fix-owner',
  'benchmark-command',
  'benchmark-rerun',
  'correctness-command',
  'correctness-rerun',
  'resume-lane',
];
const CAUSE_STATES = new Set([
  'none',
  'investigating',
  'proven',
  'fixing',
  'rerun',
  'green',
  'invalidated',
]);
const ACTIVE_CAUSE_STATES = new Set(['proven', 'fixing', 'rerun']);
const FIX_CLASSES = new Set([
  'correctness',
  'internal-implementation',
  'public-api',
  'runtime-architecture',
]);
const ARCHITECTURAL_FIX_CLASSES = new Set([
  'public-api',
  'runtime-architecture',
]);
const CORRECTNESS_DECISION_OWNERS = new Set(['patch', 'regression', 'tdd']);
const LAYER_PLANS = new Set([
  'plate-plan',
  'plate-plan + plite-plan',
  'plite-plan',
  'plite-plan + plate-plan',
]);
const CAUSE_HISTORY_DECISIONS = new Set([
  'deferred',
  'invalidated',
  'kept',
  'quarantined',
  'reverted',
]);
const LANE_STATUSES = new Set([
  'complete',
  'in_progress',
  'paused',
  'pending',
  'red',
]);
const COMPARISON_SIGNATURE_FIELDS = [
  'ref / dirty fingerprint',
  'lockfile / package manager',
  'build mode / host / port',
  'browser / machine / viewport / DPR',
  'route / fixture / document / plugins',
  'setup / action / DOM strategy',
  'warmups / samples / interleave order',
];

const isResolved = (value) =>
  Boolean(value) &&
  !/^(?:pending|todo|tbd|n\/a(?:\s*:|$))/i.test(value.trim()) &&
  !value.includes('{{');

const isTaggedResult = (value, tag) => {
  const match = value?.match(new RegExp(`^${tag}:\\s*(.*)$`, 'i'));

  return Boolean(
    match && isResolved(match[1]) && !/^(?:fail|pass)\s*:/i.test(match[1])
  );
};

const isSuccessfulResult = (value) => isTaggedResult(value, 'pass');
const isFailedResult = (value) => isTaggedResult(value, 'fail');
const hasResolvedPrefixedValue = (value, prefixes) => {
  const match = value?.match(
    new RegExp(`^(?:${prefixes.join('|')}):\\s*(.*)$`, 'i')
  );

  return Boolean(match && isResolved(match[1]));
};
const isSourceIdentity = (value) =>
  hasResolvedPrefixedValue(value, ['commit', 'fingerprint', 'ref']);
const isArtifactReference = (value) =>
  hasResolvedPrefixedValue(value, ['artifact']);
const isHardLawPreservation = (value) => {
  const match = value?.match(
    /^preserve:\s*(correctness|security|serialized-data|native-behavior|runtime)\s+-\s+(.*)$/i
  );

  return Boolean(match && isResolved(match[2]));
};

const validateFixDecision = (decision, label, errors) => {
  const fixClass = decision.fixClass?.toLowerCase();
  const decisionOwner = decision.decisionOwner?.toLowerCase();

  if (!FIX_CLASSES.has(fixClass)) {
    errors.push(
      `${label} has invalid fix-class ${decision.fixClass ?? 'missing'}`
    );
    return;
  }
  if (!isResolved(decision.longTermTarget)) {
    errors.push(`${label} requires long-term-target`);
  }
  if (!isResolved(decision.decisionOwner)) {
    errors.push(`${label} requires decision-owner`);
  }
  if (!isResolved(decision.fixOwner)) {
    errors.push(`${label} requires fix-owner`);
  }

  if (ARCHITECTURAL_FIX_CLASSES.has(fixClass)) {
    if (decisionOwner !== 'best-api') {
      errors.push(`${label} ${fixClass} requires decision-owner best-api`);
    }
    if (!LAYER_PLANS.has(decision.layerPlan?.toLowerCase())) {
      errors.push(
        `${label} ${fixClass} requires layer-plan plite-plan, plate-plan, or both`
      );
    }
    if (
      !hasResolvedPrefixedValue(decision.compatibilityVerdict, ['hard-cut']) &&
      !isHardLawPreservation(decision.compatibilityVerdict)
    ) {
      errors.push(
        `${label} ${fixClass} requires compatibility-verdict hard-cut: <lasting value> or preserve: <hard law> - <reason>`
      );
    }
    return;
  }

  if (!isNotApplicable(decision.layerPlan)) {
    errors.push(`${label} ${fixClass} requires an N/A layer-plan reason`);
  }
  if (!isNotApplicable(decision.compatibilityVerdict)) {
    errors.push(
      `${label} ${fixClass} requires an N/A compatibility-verdict reason`
    );
  }
  if (fixClass === 'internal-implementation' && decisionOwner !== 'benchmark') {
    errors.push(
      `${label} internal-implementation requires decision-owner benchmark`
    );
  }
  if (
    fixClass === 'correctness' &&
    !CORRECTNESS_DECISION_OWNERS.has(decisionOwner)
  ) {
    errors.push(
      `${label} correctness requires decision-owner patch, regression, or tdd`
    );
  }
};

const parseCells = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

const parseLaneTable = (markdown) => {
  const lines = markdown.split('\n');
  const headingIndex = lines.findIndex(
    (line) => line.trim() === '## Benchmark Lane Table'
  );

  if (headingIndex === -1) return { error: 'missing Benchmark Lane Table' };

  const tableStart = lines.findIndex(
    (line, index) => index > headingIndex && line.trim().startsWith('|')
  );

  if (tableStart === -1) return { error: 'missing benchmark lane table rows' };

  const header = parseCells(lines[tableStart]);
  const expectedHeader = [
    'Order',
    'Lane',
    'Applies',
    'Status',
    'Evidence',
    'Next',
  ];

  if (header.join('|') !== expectedHeader.join('|')) {
    return { error: `invalid benchmark lane header: ${header.join('|')}` };
  }

  const rows = [];

  for (let index = tableStart + 2; index < lines.length; index += 1) {
    if (!lines[index].trim().startsWith('|')) break;

    const cells = parseCells(lines[index]);
    if (cells.length !== expectedHeader.length) continue;

    rows.push({
      applies: cells[2],
      evidence: cells[4],
      lane: cells[1],
      next: cells[5],
      order: cells[0],
      status: cells[3],
    });
  }

  return { rows };
};

const parseCauseCheckpoint = (markdown) => {
  const lines = markdown.split('\n');
  const headingIndex = lines.findIndex(
    (line) => line.trim() === '## Current Cause Checkpoint'
  );

  if (headingIndex === -1) return null;

  const fields = {};

  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith('## ')) break;

    const match = line.match(/^- ([a-z-]+):\s*(.*)$/);
    if (match) fields[match[1]] = match[2].trim();
  }

  return fields;
};

const parseBulletSection = (markdown, heading) => {
  const lines = markdown.split('\n');
  const headingIndex = lines.findIndex((line) => line.trim() === heading);

  if (headingIndex === -1) return null;

  const fields = {};

  for (let index = headingIndex + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (line.startsWith('## ')) break;

    const match = line.match(/^- ([a-z-]+):\s*(.*)$/);
    if (match) fields[match[1]] = match[2].trim();
  }

  return fields;
};

const parseComparisonSignature = (markdown) => {
  const lines = markdown.split('\n');
  const headingIndex = lines.findIndex(
    (line) => line.trim() === '## Comparison Signature'
  );

  if (headingIndex === -1) return { error: 'missing Comparison Signature' };

  const tableStart = lines.findIndex(
    (line, index) => index > headingIndex && line.trim().startsWith('|')
  );
  if (tableStart === -1) return { error: 'missing Comparison Signature rows' };

  const header = parseCells(lines[tableStart]);
  const expectedHeader = [
    'Field',
    'Candidate',
    'Baseline',
    'Comparable evidence',
  ];
  if (header.join('|') !== expectedHeader.join('|')) {
    return {
      error: `invalid Comparison Signature header: ${header.join('|')}`,
    };
  }

  const rows = [];
  for (let index = tableStart + 2; index < lines.length; index += 1) {
    if (!lines[index].trim().startsWith('|')) break;
    const cells = parseCells(lines[index]);
    if (cells.length !== expectedHeader.length) continue;
    rows.push({
      baseline: cells[2],
      candidate: cells[1],
      evidence: cells[3],
      field: cells[0],
    });
  }

  return { rows };
};

const parseCauseHistory = (markdown) => {
  const lines = markdown.split('\n');
  const headingIndex = lines.findIndex(
    (line) => line.trim() === '## Cause History'
  );

  if (headingIndex === -1) return { error: 'missing Cause History' };

  const tableStart = lines.findIndex(
    (line, index) => index > headingIndex && line.trim().startsWith('|')
  );

  if (tableStart === -1) return { error: 'missing Cause History rows' };

  const header = parseCells(lines[tableStart]);
  const expectedHeader = [
    'Cause ID',
    'Lane',
    'Decision',
    'Fix Class',
    'Long-Term Target',
    'Decision Owner',
    'Layer Plan',
    'Compatibility Verdict',
    'Fix Owner',
    'Causal Evidence',
    'Pre-Fix Correctness',
    'Benchmark Command',
    'Benchmark Result',
    'Correctness Command',
    'Post-Fix Correctness',
    'Evidence',
  ];

  if (header.join('|') !== expectedHeader.join('|')) {
    return { error: `invalid Cause History header: ${header.join('|')}` };
  }

  const rows = [];

  for (let index = tableStart + 2; index < lines.length; index += 1) {
    if (!lines[index].trim().startsWith('|')) break;

    const cells = parseCells(lines[index]);
    if (cells.length !== expectedHeader.length) continue;

    rows.push({
      benchmarkCommand: cells[11],
      benchmarkResult: cells[12],
      causalEvidence: cells[9],
      causeId: cells[0],
      compatibilityVerdict: cells[7],
      correctnessGuardResult: cells[10],
      correctnessCommand: cells[13],
      correctnessResult: cells[14],
      decisionOwner: cells[5],
      decision: cells[2],
      evidence: cells[15],
      fixClass: cells[3],
      fixOwner: cells[8],
      lane: cells[1],
      layerPlan: cells[6],
      longTermTarget: cells[4],
    });
  }

  return { rows };
};

const isNotApplicable = (value) => {
  const match = value?.match(/^n\/a:\s*(.*)$/i);

  return Boolean(match && isResolved(match[1]));
};
const getNotApplicableReason = (value) =>
  value?.match(/^n\/a:\s*(.*)$/i)?.[1]?.trim() ?? '';

export const validateBenchmarkPlan = (markdown, { complete = false } = {}) => {
  const errors = [];
  const benchmarkSource = parseBulletSection(markdown, '## Benchmark Source');
  const comparisonSignature = parseComparisonSignature(markdown);
  const laneTable = parseLaneTable(markdown);

  if (!benchmarkSource) {
    errors.push('missing Benchmark Source');
  }
  if (comparisonSignature.error) {
    errors.push(comparisonSignature.error);
  }
  if (laneTable.error) return [laneTable.error];

  const { rows } = laneTable;
  const laneIds = rows.map((row) => row.lane);
  const invocation = benchmarkSource?.invocation ?? '';
  const onlyInvocation = /^`?\$benchmark\s+only\s+\S/i.test(invocation);

  if (/^`?\$benchmark\s+only(?:\s|`|$)/i.test(invocation) && !onlyInvocation) {
    errors.push('$benchmark only requires a non-empty lane or target');
  }

  if (laneIds.join('|') !== DEFAULT_BENCHMARK_LANES.join('|')) {
    errors.push(
      `benchmark lanes must match default order: ${DEFAULT_BENCHMARK_LANES.join(', ')}`
    );
  }

  rows.forEach((row, index) => {
    if (row.order !== String(index + 1)) {
      errors.push(`lane ${row.lane} must have order ${index + 1}`);
    }

    const applies = row.applies.toLowerCase();
    const status = row.status.toLowerCase();

    if (!['yes', 'no', 'pending'].includes(applies)) {
      errors.push(`lane ${row.lane} has invalid Applies value: ${row.applies}`);
    }

    if (!LANE_STATUSES.has(status) && !isNotApplicable(row.status)) {
      errors.push(`lane ${row.lane} has invalid status: ${row.status}`);
    }

    if (applies === 'no' && !isNotApplicable(row.status)) {
      errors.push(
        `lane ${row.lane} must explain N/A status when Applies is no`
      );
    }

    if (applies === 'no' && isNotApplicable(row.status)) {
      const reason = getNotApplicableReason(row.status);

      if (/^only\s+-\s+\S/i.test(reason)) {
        if (!onlyInvocation) {
          errors.push(
            `lane ${row.lane} requires an explicit $benchmark only invocation to be narrowed`
          );
        }
      } else if (!/^inapplicable\s+-\s+\S/i.test(reason)) {
        errors.push(
          `lane ${row.lane} requires N/A: only - <reason> or N/A: inapplicable - <reason>`
        );
      }
    }

    if (applies === 'yes' && isNotApplicable(row.status)) {
      errors.push(`lane ${row.lane} cannot be N/A when Applies is yes`);
    }

    if (applies === 'pending' && status !== 'pending') {
      errors.push(
        `lane ${row.lane} cannot have status ${row.status} while Applies is pending`
      );
    }

    if (status !== 'pending' || isNotApplicable(row.status)) {
      if (!isResolved(row.evidence)) {
        errors.push(
          `lane ${row.lane} requires evidence for status ${row.status}`
        );
      }
      if (!isResolved(row.next)) {
        errors.push(
          `lane ${row.lane} requires a resolved next state for status ${row.status}`
        );
      }
    }

    if (complete && applies === 'pending') {
      errors.push(`lane ${row.lane} still has pending applicability`);
    }

    if (
      complete &&
      applies === 'yes' &&
      status !== 'complete' &&
      !isNotApplicable(row.status)
    ) {
      errors.push(`lane ${row.lane} is not complete`);
    }

    if (complete && applies !== 'pending' && !isResolved(row.evidence)) {
      errors.push(`lane ${row.lane} lacks completion evidence`);
    }

    if (complete && applies !== 'pending' && !isResolved(row.next)) {
      errors.push(`lane ${row.lane} lacks a resolved next state`);
    }
  });

  const executionStarted = rows.some(
    (row) =>
      row.status.toLowerCase() !== 'pending' && !isNotApplicable(row.status)
  );
  const measurementStarted =
    rows[0]?.status.toLowerCase() === 'complete' ||
    rows
      .slice(1)
      .some(
        (row) =>
          row.status.toLowerCase() !== 'pending' && !isNotApplicable(row.status)
      );

  if (executionStarted) {
    for (const row of rows) {
      if (row.applies.toLowerCase() === 'pending') {
        errors.push(
          `lane ${row.lane} must resolve Applies before benchmark execution starts`
        );
      }
    }
  }

  rows.forEach((row, index) => {
    if (
      !['complete', 'in_progress', 'red'].includes(row.status.toLowerCase())
    ) {
      return;
    }

    for (const prior of rows.slice(0, index)) {
      if (
        prior.applies.toLowerCase() === 'yes' &&
        prior.status.toLowerCase() !== 'complete'
      ) {
        errors.push(
          `lane ${row.lane} cannot run before prior applicable lane ${prior.lane} is complete`
        );
      }
    }
  });

  if (
    rows.filter((row) => row.status.toLowerCase() === 'in_progress').length > 1
  ) {
    errors.push('at most one benchmark lane may be in_progress');
  }

  const cause = parseCauseCheckpoint(markdown);
  const history = parseCauseHistory(markdown);

  if (!cause) {
    errors.push('missing Current Cause Checkpoint');
    return errors;
  }

  if (history.error) {
    errors.push(history.error);
    return errors;
  }

  const state = cause.state?.toLowerCase();

  if (!CAUSE_STATES.has(state)) {
    errors.push(`invalid cause state: ${cause.state ?? 'missing'}`);
    return errors;
  }

  if (state === 'none') {
    for (const field of [
      ...CAUSE_FIELDS,
      'compatibility-verdict',
      'layer-plan',
      'benchmark-rerun-result',
      'correctness-guard-result',
      'correctness-rerun-result',
    ]) {
      const value = cause[field];
      if (value !== 'pending' && !isNotApplicable(value)) {
        errors.push(`cause state none requires cleared ${field}`);
      }
    }
  }

  const causeLaneIndex = rows.findIndex((row) => row.lane === cause.lane);
  const requiresProvenCause = ['proven', 'fixing', 'rerun', 'green'].includes(
    state
  );

  if (requiresProvenCause) {
    for (const field of CAUSE_FIELDS) {
      if (!isResolved(cause[field])) {
        errors.push(`cause state ${state} requires ${field}`);
      }
    }

    if (causeLaneIndex === -1) {
      errors.push(`cause lane is not in the ordered inventory: ${cause.lane}`);
    }

    if (!isSuccessfulResult(cause['correctness-guard-result'])) {
      errors.push(
        `cause state ${state} requires correctness-guard-result with pass: <evidence>`
      );
    }
    if (cause['benchmark-rerun'] !== cause['benchmark-command']) {
      errors.push(
        `cause state ${state} requires benchmark-rerun to match benchmark-command`
      );
    }
    if (cause['correctness-rerun'] !== cause['correctness-command']) {
      errors.push(
        `cause state ${state} requires correctness-rerun to match correctness-command`
      );
    }

    validateFixDecision(
      {
        compatibilityVerdict: cause['compatibility-verdict'],
        decisionOwner: cause['decision-owner'],
        fixClass: cause['fix-class'],
        fixOwner: cause['fix-owner'],
        layerPlan: cause['layer-plan'],
        longTermTarget: cause['long-term-target'],
      },
      `cause state ${state}`,
      errors
    );
  }

  rows.forEach((row, index) => {
    const status = row.status.toLowerCase();
    const applies = row.applies.toLowerCase();

    if (status === 'paused') {
      if (applies !== 'yes') {
        errors.push(`paused lane ${row.lane} requires Applies yes`);
      } else if (!ACTIVE_CAUSE_STATES.has(state)) {
        errors.push(`paused lane ${row.lane} requires an active proven cause`);
      } else if (causeLaneIndex === -1 || index <= causeLaneIndex) {
        errors.push(
          `paused lane ${row.lane} must follow the active cause lane`
        );
      }
    }

    if (status === 'red') {
      if (applies !== 'yes') {
        errors.push(`red lane ${row.lane} requires Applies yes`);
      } else if (!ACTIVE_CAUSE_STATES.has(state)) {
        errors.push(`red lane ${row.lane} requires an active proven cause`);
      } else if (index !== causeLaneIndex) {
        errors.push('only the active cause lane may have red workflow status');
      }
    }
  });

  if (ACTIVE_CAUSE_STATES.has(state) && causeLaneIndex >= 0) {
    if (rows[causeLaneIndex].status.toLowerCase() !== 'red') {
      errors.push(
        `cause lane ${cause.lane} must stay red until rerun is green`
      );
    }

    for (const later of rows.slice(causeLaneIndex + 1)) {
      if (
        later.applies.toLowerCase() === 'yes' &&
        !['paused', 'pending'].includes(later.status.toLowerCase())
      ) {
        errors.push(
          `later lane ${later.lane} must be pending or paused while cause is ${state}`
        );
      }
    }

    const nextAfterCause = rows
      .slice(causeLaneIndex + 1)
      .find(
        (row) =>
          row.applies.toLowerCase() === 'yes' &&
          ['paused', 'pending'].includes(row.status.toLowerCase())
      );
    const expectedResume = nextAfterCause?.lane ?? 'complete';

    if (cause['resume-lane'] !== expectedResume) {
      errors.push(
        `active cause must resume ${expectedResume}, got ${cause['resume-lane']}`
      );
    }
  }

  const historyRows = history.rows;
  const resolvedHistoryRows = [];
  const historyCauseIds = new Set();

  for (const row of historyRows) {
    if (!isResolved(row.causeId)) {
      if (complete) {
        errors.push('Cause History contains an unresolved placeholder row');
      }
      continue;
    }

    if (historyCauseIds.has(row.causeId)) {
      errors.push(`Cause History repeats cause ID ${row.causeId}`);
    }
    historyCauseIds.add(row.causeId);
    resolvedHistoryRows.push(row);

    if (row.causeId === 'none') {
      if (!isNotApplicable(row.lane)) {
        errors.push('Cause History none row requires an N/A lane reason');
      }
      if (!isNotApplicable(row.decision)) {
        errors.push('Cause History none row requires an N/A decision reason');
      }
      for (const [field, value] of [
        ['Fix Class', row.fixClass],
        ['Long-Term Target', row.longTermTarget],
        ['Decision Owner', row.decisionOwner],
        ['Layer Plan', row.layerPlan],
        ['Compatibility Verdict', row.compatibilityVerdict],
        ['Fix Owner', row.fixOwner],
      ]) {
        if (!isNotApplicable(value)) {
          errors.push(`Cause History none row requires an N/A ${field} reason`);
        }
      }
      if (!isNotApplicable(row.causalEvidence)) {
        errors.push(
          'Cause History none row requires an N/A causal evidence reason'
        );
      }
      if (!isNotApplicable(row.benchmarkCommand)) {
        errors.push(
          'Cause History none row requires an N/A benchmark command reason'
        );
      }
      if (!isNotApplicable(row.benchmarkResult)) {
        errors.push(
          'Cause History none row requires an N/A benchmark result reason'
        );
      }
      if (!isNotApplicable(row.correctnessGuardResult)) {
        errors.push(
          'Cause History none row requires an N/A pre-fix correctness reason'
        );
      }
      if (!isNotApplicable(row.correctnessCommand)) {
        errors.push(
          'Cause History none row requires an N/A correctness command reason'
        );
      }
      if (!isNotApplicable(row.correctnessResult)) {
        errors.push(
          'Cause History none row requires an N/A correctness result reason'
        );
      }
      if (!isResolved(row.evidence)) {
        errors.push('Cause History none row requires completion evidence');
      }
      continue;
    }

    if (!DEFAULT_BENCHMARK_LANES.includes(row.lane)) {
      errors.push(`Cause History ${row.causeId} has unknown lane ${row.lane}`);
    }

    const decision = row.decision.toLowerCase();
    if (!CAUSE_HISTORY_DECISIONS.has(decision)) {
      errors.push(
        `Cause History ${row.causeId} has invalid decision ${row.decision}`
      );
    }
    if (!isResolved(row.evidence)) {
      errors.push(`Cause History ${row.causeId} requires evidence`);
    }
    if (!isResolved(row.causalEvidence)) {
      errors.push(`Cause History ${row.causeId} requires causal evidence`);
    }
    if (!isSuccessfulResult(row.correctnessGuardResult)) {
      errors.push(
        `cause ${row.causeId} requires Pre-Fix Correctness pass: <evidence>`
      );
    }
    if (!isResolved(row.benchmarkCommand)) {
      errors.push(`Cause History ${row.causeId} requires Benchmark Command`);
    }
    if (!isResolved(row.correctnessCommand)) {
      errors.push(`Cause History ${row.causeId} requires Correctness Command`);
    }

    validateFixDecision(row, `Cause History ${row.causeId}`, errors);

    if (decision === 'kept') {
      if (!isSuccessfulResult(row.benchmarkResult)) {
        errors.push(
          `kept cause ${row.causeId} requires Benchmark Result pass: <evidence>`
        );
      }
      if (!isSuccessfulResult(row.correctnessResult)) {
        errors.push(
          `kept cause ${row.causeId} requires Correctness Result pass: <evidence>`
        );
      }
    } else if (decision === 'invalidated') {
      if (!isFailedResult(row.benchmarkResult)) {
        errors.push(
          `invalidated cause ${row.causeId} requires Benchmark Result fail: <evidence>`
        );
      }
      if (
        !isSuccessfulResult(row.correctnessResult) &&
        !isFailedResult(row.correctnessResult) &&
        !isNotApplicable(row.correctnessResult)
      ) {
        errors.push(
          `invalidated cause ${row.causeId} requires resolved Correctness Result`
        );
      }
    } else {
      for (const [label, result] of [
        ['Benchmark Result', row.benchmarkResult],
        ['Correctness Result', row.correctnessResult],
      ]) {
        if (
          !isSuccessfulResult(result) &&
          !isFailedResult(result) &&
          !isNotApplicable(result)
        ) {
          errors.push(
            `${row.decision} cause ${row.causeId} requires resolved ${label}`
          );
        }
      }
    }
  }

  const noCauseRows = resolvedHistoryRows.filter(
    (row) => row.causeId === 'none'
  );
  const actualCauseRows = resolvedHistoryRows.filter(
    (row) => row.causeId !== 'none'
  );

  if (noCauseRows.length > 0 && actualCauseRows.length > 0) {
    errors.push('Cause History cannot mix a none row with actual causes');
  }

  if (complete && resolvedHistoryRows.length === 0) {
    errors.push(
      'complete benchmark plan requires resolved Cause History or an explicit none row'
    );
  }

  if (state === 'green' && causeLaneIndex >= 0) {
    if (rows[causeLaneIndex].status.toLowerCase() !== 'complete') {
      errors.push(`green cause lane ${cause.lane} must be complete`);
    }

    for (const field of [
      'benchmark-rerun-result',
      'correctness-rerun-result',
    ]) {
      if (!isSuccessfulResult(cause[field])) {
        errors.push(`green cause requires ${field} with pass: <evidence>`);
      }
    }

    const nextPending = rows.find(
      (row) =>
        row.applies.toLowerCase() === 'yes' &&
        ['in_progress', 'pending'].includes(row.status.toLowerCase())
    );
    const expectedResume = nextPending?.lane ?? 'complete';

    if (cause['resume-lane'] !== expectedResume) {
      errors.push(
        `green cause must resume ${expectedResume}, got ${cause['resume-lane']}`
      );
    }

    const keptHistory = actualCauseRows.find(
      (row) =>
        row.causeId === cause['cause-id'] &&
        row.lane === cause.lane &&
        row.decision.toLowerCase() === 'kept'
    );

    if (!keptHistory) {
      errors.push(
        `green cause ${cause['cause-id']} requires a matching kept Cause History row`
      );
    } else {
      for (const [historyField, causeField, label] of [
        ['fixClass', 'fix-class', 'fix class'],
        ['longTermTarget', 'long-term-target', 'long-term target'],
        ['decisionOwner', 'decision-owner', 'decision owner'],
        ['layerPlan', 'layer-plan', 'layer plan'],
        [
          'compatibilityVerdict',
          'compatibility-verdict',
          'compatibility verdict',
        ],
        ['fixOwner', 'fix-owner', 'fix owner'],
      ]) {
        if (keptHistory[historyField] !== cause[causeField]) {
          errors.push(
            `green cause ${cause['cause-id']} must preserve its ${label} in Cause History`
          );
        }
      }
      if (keptHistory.benchmarkCommand !== cause['benchmark-command']) {
        errors.push(
          `green cause ${cause['cause-id']} must preserve its benchmark command in Cause History`
        );
      }
      if (
        keptHistory.correctnessGuardResult !== cause['correctness-guard-result']
      ) {
        errors.push(
          `green cause ${cause['cause-id']} must preserve its pre-fix correctness result in Cause History`
        );
      }
      if (keptHistory.benchmarkResult !== cause['benchmark-rerun-result']) {
        errors.push(
          `green cause ${cause['cause-id']} must preserve its benchmark rerun result in Cause History`
        );
      }
      if (keptHistory.correctnessResult !== cause['correctness-rerun-result']) {
        errors.push(
          `green cause ${cause['cause-id']} must preserve its correctness rerun result in Cause History`
        );
      }
      if (keptHistory.correctnessCommand !== cause['correctness-command']) {
        errors.push(
          `green cause ${cause['cause-id']} must preserve its correctness command in Cause History`
        );
      }
    }
  }

  if (state === 'invalidated') {
    for (const field of [
      'cause-id',
      'lane',
      'causal-intervention',
      'benchmark-command',
      'benchmark-rerun',
      'benchmark-rerun-result',
      'correctness-guard-result',
      'correctness-command',
      'correctness-rerun',
      'resume-lane',
    ]) {
      if (!isResolved(cause[field])) {
        errors.push(`invalidated cause requires ${field}`);
      }
    }
    if (cause['resume-lane'] !== cause.lane) {
      errors.push('invalidated cause must resume its own lane');
    }
    if (
      causeLaneIndex >= 0 &&
      !['in_progress', 'pending'].includes(
        rows[causeLaneIndex].status.toLowerCase()
      )
    ) {
      errors.push(
        `invalidated cause lane ${cause.lane} must remain pending or in_progress`
      );
    }
    if (!isFailedResult(cause['benchmark-rerun-result'])) {
      errors.push(
        'invalidated cause requires benchmark-rerun-result with fail: <evidence>'
      );
    }
    if (!isSuccessfulResult(cause['correctness-guard-result'])) {
      errors.push(
        'invalidated cause requires correctness-guard-result with pass: <evidence>'
      );
    }
    if (cause['benchmark-rerun'] !== cause['benchmark-command']) {
      errors.push(
        'invalidated cause requires benchmark-rerun to match benchmark-command'
      );
    }
    if (cause['correctness-rerun'] !== cause['correctness-command']) {
      errors.push(
        'invalidated cause requires correctness-rerun to match correctness-command'
      );
    }

    validateFixDecision(
      {
        compatibilityVerdict: cause['compatibility-verdict'],
        decisionOwner: cause['decision-owner'],
        fixClass: cause['fix-class'],
        fixOwner: cause['fix-owner'],
        layerPlan: cause['layer-plan'],
        longTermTarget: cause['long-term-target'],
      },
      'invalidated cause',
      errors
    );

    if (causeLaneIndex >= 0) {
      for (const prior of rows.slice(0, causeLaneIndex)) {
        if (
          prior.applies.toLowerCase() === 'yes' &&
          prior.status.toLowerCase() !== 'complete'
        ) {
          errors.push(
            `invalidated cause lane ${cause.lane} requires prior lane ${prior.lane} complete`
          );
        }
      }
    }

    const invalidatedHistory = actualCauseRows.find(
      (row) =>
        row.causeId === cause['cause-id'] &&
        row.lane === cause.lane &&
        row.decision.toLowerCase() === 'invalidated'
    );

    if (!invalidatedHistory) {
      errors.push(
        `invalidated cause ${cause['cause-id']} requires matching Cause History`
      );
    } else {
      for (const [historyField, causeField, label] of [
        ['fixClass', 'fix-class', 'fix class'],
        ['longTermTarget', 'long-term-target', 'long-term target'],
        ['decisionOwner', 'decision-owner', 'decision owner'],
        ['layerPlan', 'layer-plan', 'layer plan'],
        [
          'compatibilityVerdict',
          'compatibility-verdict',
          'compatibility verdict',
        ],
        ['fixOwner', 'fix-owner', 'fix owner'],
      ]) {
        if (invalidatedHistory[historyField] !== cause[causeField]) {
          errors.push(
            `invalidated cause ${cause['cause-id']} must preserve its ${label} in Cause History`
          );
        }
      }
      if (invalidatedHistory.benchmarkCommand !== cause['benchmark-command']) {
        errors.push(
          `invalidated cause ${cause['cause-id']} must preserve benchmark command in Cause History`
        );
      }
      if (
        invalidatedHistory.correctnessGuardResult !==
        cause['correctness-guard-result']
      ) {
        errors.push(
          `invalidated cause ${cause['cause-id']} must preserve pre-fix correctness in Cause History`
        );
      }
      if (
        invalidatedHistory.benchmarkResult !== cause['benchmark-rerun-result']
      ) {
        errors.push(
          `invalidated cause ${cause['cause-id']} must preserve failed benchmark rerun in Cause History`
        );
      }
      if (
        invalidatedHistory.correctnessCommand !== cause['correctness-command']
      ) {
        errors.push(
          `invalidated cause ${cause['cause-id']} must preserve correctness command in Cause History`
        );
      }
    }
  }

  if (complete && state !== 'none') {
    errors.push(`complete benchmark plan cannot have cause state ${state}`);
  }

  if (measurementStarted || complete) {
    if (
      !isResolved(invocation) ||
      !/^`?\$benchmark(?:\s|`|$)/i.test(invocation)
    ) {
      errors.push(
        'measured benchmark plan requires a resolved $benchmark invocation'
      );
    }
    if (!isSourceIdentity(benchmarkSource?.['candidate-identity'])) {
      errors.push(
        'measured benchmark plan requires candidate-identity with ref, commit, or fingerprint'
      );
    }
    if (
      complete &&
      !isArtifactReference(benchmarkSource?.['final-artifacts'])
    ) {
      errors.push(
        'complete benchmark plan requires final-artifacts with artifact: <path>'
      );
    }

    const applies = (lane) =>
      rows.find((row) => row.lane === lane)?.applies.toLowerCase() === 'yes';
    const hasApplicableComparison = [
      'current-vs-main-product-smoke',
      'plate-vs-plite-decomposition',
      'plite-vs-pinned-slate',
    ].some(applies);

    if (
      applies('current-vs-main-product-smoke') &&
      !isSourceIdentity(benchmarkSource?.['plate-main-identity'])
    ) {
      errors.push('current-vs-main-product-smoke requires plate-main-identity');
    }
    if (
      (applies('plate-vs-plite-decomposition') ||
        applies('plite-vs-pinned-slate')) &&
      !isSourceIdentity(benchmarkSource?.['plite-identity'])
    ) {
      errors.push('Plite comparison lanes require plite-identity');
    }
    if (
      applies('plite-vs-pinned-slate') &&
      !isSourceIdentity(benchmarkSource?.['slate-identity'])
    ) {
      errors.push('plite-vs-pinned-slate requires slate-identity');
    }

    if (!comparisonSignature.error) {
      const signatureFields = comparisonSignature.rows.map((row) => row.field);
      if (signatureFields.join('|') !== COMPARISON_SIGNATURE_FIELDS.join('|')) {
        errors.push(
          `Comparison Signature fields must match: ${COMPARISON_SIGNATURE_FIELDS.join(', ')}`
        );
      }

      for (const row of comparisonSignature.rows) {
        if (!isResolved(row.candidate)) {
          errors.push(`Comparison Signature ${row.field} requires Candidate`);
        }
        if (
          (hasApplicableComparison && !isResolved(row.baseline)) ||
          (!hasApplicableComparison &&
            !isResolved(row.baseline) &&
            !isNotApplicable(row.baseline))
        ) {
          errors.push(
            `Comparison Signature ${row.field} requires comparable Baseline`
          );
        }
        if (!isArtifactReference(row.evidence)) {
          errors.push(
            `Comparison Signature ${row.field} requires artifact evidence`
          );
        }
      }
    }
  }

  return errors;
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
      'Usage: validate-benchmark-plan.mjs <plan.md> [--complete]\n'
    );
    process.exitCode = 1;
  } else {
    const errors = validateBenchmarkPlan(readFileSync(planPath, 'utf8'), {
      complete,
    });

    if (errors.length > 0) {
      process.stderr.write(`${errors.join('\n')}\n`);
      process.exitCode = 1;
    } else {
      process.stdout.write(
        `Benchmark plan: ${complete ? 'complete' : 'structurally valid'}.\n`
      );
    }
  }
}
