import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import {
  createInputDigest,
  createProofReceiptId,
  validateRegressionPlan,
} from './validate-regression-plan.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const semanticTestPath =
  '.agents/rules/regression/scripts/validate-regression-plan.test.mjs';
const semanticTestTitle = 'complete fixture satisfies semantic closure';
const receiptInputs = [
  '.agents/rules/regression/scripts/capture-proof-receipt.mjs',
  '.agents/rules/regression/scripts/validate-regression-plan.mjs',
  semanticTestPath,
];
const digest = createInputDigest(root, receiptInputs);
const proofTimes = {
  ended: '2026-08-20T10:02:00.000Z',
  latestInput: '2026-08-20T10:00:00.000Z',
  started: '2026-08-20T10:01:00.000Z',
};

const receiptRow = ({
  attempt = 1,
  caseId = 'case-complete',
  host = 'host:none - deterministic Node workflow',
  inputDigest = digest,
} = {}) => {
  const receipt = {
    attempt: String(attempt),
    caseId,
    claim: 'completed',
    command: 'node --test validate-regression-plan.test.mjs',
    host,
    inputCount: '3',
    inputDigest,
    inputs: receiptInputs.join(','),
    latestInputMtime: proofTimes.latestInput,
    proofEnded: proofTimes.ended,
    proofStarted: proofTimes.started,
    ref: `commit:${'1'.repeat(40)}`,
    result: 'pass: semantic workflow proof',
    retries: '0',
  };

  return `| ${caseId} | ${attempt} | completed | ${receipt.command} | ${receipt.result} | ${receipt.ref} | ${inputDigest} | 3 | ${receipt.inputs} | ${host} | ${proofTimes.latestInput} | ${proofTimes.started} | ${proofTimes.ended} | 0 | ${createProofReceiptId(receipt)} |`;
};

const oracleRows = ({
  exactChrome = false,
  missingForbidden = false,
  missingPixelControls = false,
} = {}) => {
  const rows = [
    {
      applies: 'yes',
      forbidden: missingForbidden
        ? 'pending'
        : 'an incomplete semantic plan passes',
      layer: 'package',
      observation: 'model',
      positive: 'the complete semantic plan passes',
      result: 'pass: validator contract',
    },
    ...[
      'dom-native',
      'pointer-feedback',
      'focus',
      'popup',
      'runtime-errors',
      'follow-up-input',
    ].map((observation) => ({
      applies: 'no',
      forbidden: 'N/A: deterministic workflow case',
      layer: 'N/A: deterministic workflow case',
      observation,
      positive: 'N/A: deterministic workflow case',
      result: 'N/A: deterministic workflow case',
    })),
    exactChrome
      ? {
          applies: 'yes',
          forbidden: 'stale Blink paint remains visible',
          layer: 'exact-chrome pixel classifier',
          observation: 'geometry-paint',
          positive: 'paint matches final geometry',
          result: missingPixelControls
            ? 'pass: exact Chrome pixel oracle'
            : 'pass: exact Chrome pixel oracle; positive-control: pass known single-layer state; negative-control: pass known-absent state; duplicate-control: pass known duplicate-layer state rejected',
        }
      : {
          applies: 'no',
          forbidden: 'N/A: no rendered geometry',
          layer: 'N/A: no rendered geometry',
          observation: 'geometry-paint',
          positive: 'N/A: no rendered geometry',
          result: 'N/A: no rendered geometry',
        },
  ];

  return rows
    .map(
      (row) => {
        const phase =
          row.observation === 'follow-up-input'
            ? 'follow-up'
            : ['geometry-paint', 'pointer-feedback'].includes(row.observation)
              ? 'during-action'
              : 'after-action';

        return `| case-complete | ${row.observation} | ${phase} | ${row.applies} | ${row.positive} | ${row.forbidden} | ${row.layer} | ${
          row.applies === 'yes'
            ? `test: ${semanticTestPath}#${semanticTestTitle}`
            : 'N/A: deterministic workflow case'
        } | ${row.result} |`;
      }
    )
    .join('\n');
};

const reporterEvidenceRows = ({
  anchorToInapplicableOracle = false,
  failedCount = 0,
  failureKind = 'reporter-contradiction',
  missingBase = false,
  missingLatestReporterDelta = false,
  missingOracle = false,
  preImplementation = false,
  supersededBase = false,
} = {}) => {
  const result = preImplementation
    ? 'red: reporter claim reproduced'
    : 'pass: cumulative reporter claim proved';
  const rows = [];

  if (failedCount > 0 && !missingBase) {
    rows.push(
      supersededBase
        ? '| case-complete | base-acceptance | issue body acceptance criteria | during-action | preserve the original visual interaction | superseded: current product law replaced this acceptance | N/A: superseded acceptance | N/A: superseded acceptance | N/A: superseded acceptance |'
        : `| case-complete | base-acceptance | issue body acceptance criteria | after-action | preserve the original semantic result | required | model@after-action | test: ${semanticTestPath}#${semanticTestTitle} | ${result} |`
    );
  }
  if (
    failedCount === 0 ||
    (failureKind === 'reporter-contradiction' && !missingLatestReporterDelta)
  ) {
    rows.push(
      `| case-complete | ${
        failedCount > 0 ? 'latest-reporter-delta' : 'current-report'
      } | latest reporter evidence | after-action | semantic closure matches the cumulative report | required | ${
        missingOracle
          ? 'focus@during-action'
          : anchorToInapplicableOracle
            ? 'focus@after-action'
            : 'model@after-action'
      } | test: ${semanticTestPath}#${semanticTestTitle} | ${result} |`
    );
  }

  return rows.join('\n');
};

const noFailedFixRow =
  '| none | 0 | N/A: no claimed fix failed | N/A: no failed-fix kind | N/A: no prior claim | N/A: no repair | N/A: no repair test | no: no failure | N/A: no escalation | N/A: no resume |';
const noGateFailureRow =
  '| none | N/A: no started gate failed | N/A: no failure | N/A: no repair | N/A: no rerun required |';

const failedFixRows = ({
  count = 1,
  failureKind = 'reporter-contradiction',
  invalidate = true,
  repair = true,
} = {}) =>
  Array.from({ length: count }, (_, index) => {
    const attempt = index + 1;
    const architecture =
      attempt >= 2
        ? 'best-api: accepted durable API; plate-plan: accepted adoption plan'
        : 'N/A: first failed fix without architecture pressure';

    return `| case-complete | ${attempt} | reporter contradiction after claimed candidate | ${failureKind} | ${
      invalidate ? 'yes: prior green and completion receipt revoked' : 'no'
    } | ${
      repair
        ? 'repair-now: .agents/rules/regression/scripts/validate-regression-plan.mjs'
        : 'no-change: existing prose looked sufficient'
    } | pass: workflow rejection test | ${
      attempt >= 2
        ? 'yes: second-failed-fix'
        : 'no: first failure and no structural pressure'
    } | ${architecture} | reproduced: restart the exact reporter case |`;
  }).join('\n');

const fixture = ({
  anchorToInapplicableOracle = false,
  architectureVerdict = 'patch',
  exactChrome = false,
  failedCount = 0,
  failureKind = 'reporter-contradiction',
  failedRows,
  inputDigest = digest,
  missingBaseEvidence = false,
  missingLatestReporterDelta = false,
  missingAffectedCase = false,
  missingAffectedBaseline = false,
  missingExpectedOutcomeAuthority = false,
  missingForbidden = false,
  missingPixelControls = false,
  missingReporterOracle = false,
  preImplementation = false,
  preImplementationBaseline = false,
  receiptIdOverride,
  redTestEscalation = 'unit-red: semantic validator test fails before repair',
  selectedTestCommand = `${semanticTestPath}; node --test`,
  supersededBaseEvidence = false,
  unresolvedGateFailure = false,
} = {}) => {
  const host = exactChrome
    ? 'pid:4242;started:2026-08-20T09:55:00.000Z;base-url:http://localhost:3000;browser:exact-chrome:140;browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 140.0'
    : 'host:none - deterministic Node workflow';
  let receipt = receiptRow({
    attempt: failedCount + 1,
    host,
    inputDigest,
  });

  if (receiptIdOverride) {
    receipt = receipt.replace(/sha256:[a-f0-9]{64} \|$/, `${receiptIdOverride} |`);
  }
  if (preImplementation) {
    receipt =
      '| pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending | pending |';
  }

  const escalated = architectureVerdict === 'escalate';

  return `
Selected executable cases:
| Case ID | Source reference | Setup / action | Expected outcome | Expected-outcome authority | Red-test escalation | Exact environment | Test file / command | Status | Tested ref | Next owner |
|---|---|---|---|---|---|---|---|---|---|---|
| case-complete | ${exactChrome ? 'Blink compositor report' : 'local workflow report'} | validate one complete plan | semantic closure is accepted | ${
    missingExpectedOutcomeAuthority
      ? 'pending'
      : 'accepted-product-law: Regression semantic closure contract'
  } | ${redTestEscalation} | ${
    exactChrome
      ? 'exact-chrome: installed Chrome 140 on the proof host'
      : 'N/A: deterministic Node workflow'
  } | ${selectedTestCommand} | ${
    preImplementation ? 'reproduced' : 'completed'
  } | commit:${'1'.repeat(40)} | Regression |

Reporter evidence inventory:
| Case ID | Source role | Source reference | Phase | Claim | Disposition | Oracle anchors | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
${reporterEvidenceRows({
  anchorToInapplicableOracle,
  failedCount,
  failureKind,
  missingBase: missingBaseEvidence,
  missingLatestReporterDelta,
  missingOracle: missingReporterOracle,
  preImplementation,
  supersededBase: supersededBaseEvidence,
})}

Reporter oracle matrix:
| Case ID | Observation | Phase | Applies | Positive assertion | Forbidden state | Proof layer | Executable anchor | Result |
|---|---|---|---|---|---|---|---|---|
${oracleRows({ exactChrome, missingForbidden, missingPixelControls })}

Proof receipts:
| Case ID | Attempt | Claim | Command | Result | Ref | Input digest | Input count | Inputs | Host | Latest input mtime | Proof started | Proof ended | Retries | Receipt ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${receipt}

Affected corpus replay:
| Owner | Affected cases | Pre-edit baseline | Last owner edit | Combined command | Receipt input digest | Result |
|---|---|---|---|---|---|---|
${
  preImplementation
    ? preImplementationBaseline
      ? '| Regression validator | case-complete | pass: executable case passed before the shared-owner edit | pending | pending | pending | pending |'
      : '| pending | pending | pending | pending | pending | pending | pending |'
    : `| Regression validator | ${missingAffectedCase ? 'other-case' : 'case-complete'} | ${missingAffectedBaseline ? 'N/A: baseline skipped' : 'pass: semantic contract passed before the owner edit'} | ${proofTimes.latestInput} | node --test semantic contracts | ${inputDigest} | pass: affected corpus replayed after final owner edit |`
}

Gate failure closure:
| Gate | Failure signal | Classification | Resolution | Final rerun |
|---|---|---|---|---|
${
  preImplementation
    ? '| pending | pending | pending | pending | pending |'
    : unresolvedGateFailure
      ? '| pnpm check:plite | browser selection direction failed | shared selection owner | dismissed as unrelated | N/A: no final rerun |'
      : noGateFailureRow
}

Failed fix history:
| Case ID | Attempt | Failure signal | Failure kind | Prior claim invalidated | Regression repair | Workflow test | Architecture trigger | Best API / layer plan | Resume state |
|---|---|---|---|---|---|---|---|---|---|
${failedRows ?? (failedCount ? failedFixRows({ count: failedCount, failureKind }) : noFailedFixRow)}

Architecture pressure:
| Case ID | Failed fix count | Triggers | Verdict | Best API | Layer plan | Proof |
|---|---|---|---|---|---|---|
| case-complete | ${failedCount} | ${
    failedCount >= 2
      ? 'second-failed-fix'
      : 'none: no architecture trigger'
  } | ${architectureVerdict} | ${
    escalated ? 'required: best-api accepted target' : 'N/A: local correctness patch'
  } | ${
    escalated ? 'plate-plan: accepted adoption proof' : 'N/A: local correctness patch'
  } | pass: architecture decision recorded before implementation |

Methodology deltas:
| Case | Miss or owner checked | Decision | Durable owner/change | Focused proof | Trigger/result |
|---|---|---|---|---|---|
${
  preImplementation
    ? '| pending | pending | pending | pending | pending | pending |'
    : `| case-complete | ${
    failedCount ? 'claimed fix failed' : 'semantic workflow owner checked'
  } | ${failedCount ? 'repair-now' : 'no-change'} | ${
    failedCount
      ? '.agents/rules/regression/scripts/validate-regression-plan.mjs'
      : 'validator already covers the case'
  } | pass: semantic workflow contract | ${
    failedCount ? 'failed-fix interrupt completed' : 'no claimed fix failure'
  } |`
}
`;
};

test(semanticTestTitle, () => {
  assert.deepEqual(
    validateRegressionPlan(fixture(), { complete: true, rootDir: root }),
    []
  );
});

test('pre-implementation validation permits final-proof placeholders', () => {
  assert.deepEqual(
    validateRegressionPlan(fixture({ preImplementation: true }), {
      rootDir: root,
    }),
    []
  );
});

test('the four reporter-invalidated plans fail semantic validation', () => {
  for (const planPath of [
    'docs/plans/5091-fix-stale-font-size-selection-highlight.md',
    'docs/plans/5065-fix-table-tab-navigation.md',
    'docs/plans/5064-fix-homepage-table-grid-enter-crash.md',
    'docs/plans/2026-08-06-complete-remaining-felix-issues.md',
  ]) {
    const errors = validateRegressionPlan(readFileSync(join(root, planPath)), {
      complete: true,
      rootDir: root,
    });

    assert.match(
      errors.join('\n'),
      /missing (?:Selected executable cases|Reporter oracle matrix)/,
      planPath
    );
  }
});

test('positive assertions cannot omit the forbidden end state', () => {
  assert.match(
    validateRegressionPlan(fixture({ missingForbidden: true }), {
      complete: true,
      rootDir: root,
    }).join('\n'),
    /model@after-action requires Forbidden state/
  );
});

test('a negative-only report cannot authorize an invented positive outcome', () => {
  const errors = validateRegressionPlan(
    fixture({ missingExpectedOutcomeAuthority: true }),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.match(errors, /requires Expected-outcome authority/);
});

test('an exact unit RED rejects redundant E2E test escalation', () => {
  const errors = validateRegressionPlan(
    fixture({
      selectedTestCommand:
        'apps/plite/tests/plite-browser/redundant-regression.test.ts; pnpm --filter plite test:plite-browser:chromium',
    }),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.match(errors, /unit RED.*must not add a new E2E test/i);
});

test('E2E escalation requires a lower-layer reproduction limitation', () => {
  const errors = validateRegressionPlan(
    fixture({
      redTestEscalation: 'e2e-required: native selection cannot be RED in unit',
      selectedTestCommand:
        'tooling/e2e/native-selection.test.ts; pnpm e2e',
    }),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.doesNotMatch(errors, /Red-test escalation|must not add a new E2E/i);
});

test('a failed fix cannot drop the base acceptance when adding the latest reporter delta', () => {
  const errors = validateRegressionPlan(
    fixture({ failedCount: 1, missingBaseEvidence: true }),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.match(
    errors,
    /failed fix requires base-acceptance evidence marked required or superseded/
  );
});

test('superseded base acceptance remains inventoried without executable proof', () => {
  assert.deepEqual(
    validateRegressionPlan(
      fixture({ failedCount: 1, supersededBaseEvidence: true }),
      { complete: true, rootDir: root }
    ),
    []
  );
});

test('only applicable phase-specific oracles satisfy reporter evidence', () => {
  const errors = validateRegressionPlan(
    fixture({ anchorToInapplicableOracle: true }),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.match(errors, /requires applicable oracle focus@after-action/);
});

test('every cumulative reporter claim must map to an existing phase-specific oracle', () => {
  const errors = validateRegressionPlan(
    fixture({ missingReporterOracle: true }),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.match(errors, /requires missing oracle focus@during-action/);
});

test('only reporter contradictions require a latest reporter delta', () => {
  const reporterErrors = validateRegressionPlan(
    fixture({ failedCount: 1, missingLatestReporterDelta: true }),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.match(
    reporterErrors,
    /reporter contradiction requires required latest-reporter-delta evidence/
  );

  for (const failureKind of ['exact-replay', 'final-verification']) {
    assert.deepEqual(
      validateRegressionPlan(fixture({ failedCount: 1, failureKind }), {
        complete: true,
        rootDir: root,
      }),
      [],
      failureKind
    );
  }
});

test('pointer-driven cases require an applicable pointer-feedback oracle', () => {
  const pointerCase = fixture()
    .replace(
      'validate one complete plan',
      'drag pointer over an ignored resize handle'
    )
    .replace(
      'semantic closure is accepted',
      'the cursor stays text while resize remains ignored'
    );
  const errors = validateRegressionPlan(pointerCase, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(errors, /requires an applicable pointer-feedback oracle/);
});

test('pointer-feedback completion requires an interaction trace', () => {
  const pointerCase = fixture()
    .replace(
      'validate one complete plan',
      'drag pointer over an ignored resize handle'
    )
    .replace(
      'semantic closure is accepted',
      'the cursor stays text while resize remains ignored'
    )
    .replace(
      '| case-complete | pointer-feedback | during-action | no | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case |',
      `| case-complete | pointer-feedback | during-action | yes | held pointer keeps the text cursor | resize cursor appears | browser pointer event oracle | test: ${semanticTestPath}#${semanticTestTitle} | pass: computed cursor is text |`
    );
  const errors = validateRegressionPlan(pointerCase, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(errors, /requires interaction-trace: pass/);
});

test('no-flash pointer feedback requires pre-handler state', () => {
  const pointerCase = fixture()
    .replace(
      'validate one complete plan',
      'drag pointer over an ignored resize handle without a one-frame cursor flash'
    )
    .replace(
      'semantic closure is accepted',
      'the cursor is text before the resize handle processes pointer movement'
    )
    .replace(
      '| case-complete | pointer-feedback | during-action | no | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case |',
      `| case-complete | pointer-feedback | during-action | yes | reporter-noun: resize handle; affordance-inventory: column-end; held pointer keeps the text cursor without a frame flash | resize cursor appears before the handle processes pointer movement | browser target-capture oracle | test: ${semanticTestPath}#${semanticTestTitle} | pass: interaction-trace: pass; target: resize-handle; event: pointermove; buttons: 1; computed cursor is text |`
    );
  const errors = validateRegressionPlan(pointerCase, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(errors, /requires pre-handler-state: pass/);

  const resolvedErrors = validateRegressionPlan(
    pointerCase.replace(
      'computed cursor is text',
      'pre-handler-state: pass; computed cursor is text'
    ),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.doesNotMatch(resolvedErrors, /pre-handler-state|proof layer/);
});

test('pointer-feedback cannot narrow a reporter UI noun to one affordance', () => {
  const missingInventory = fixture()
    .replace(
      'validate one complete plan',
      'drag pointer over a visible drag handle'
    )
    .replace(
      'semantic closure is accepted',
      'every matching drag affordance stays hidden'
    )
    .replace(
      '| case-complete | pointer-feedback | during-action | no | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case | N/A: deterministic workflow case |',
      `| case-complete | pointer-feedback | during-action | yes | matching controls stay hidden | a selected-cell drag control remains visible | browser pointer event oracle | test: ${semanticTestPath}#${semanticTestTitle} | pass: interaction-trace: pass; target: table-cell; event: pointermove; buttons: 1 |`
    );
  const missingErrors = validateRegressionPlan(missingInventory, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(missingErrors, /requires reporter-noun: <plain UI noun>/);
  assert.match(missingErrors, /requires affordance-inventory:/);

  const inventoried = missingInventory.replace(
    'matching controls stay hidden',
    'reporter-noun: drag handle; affordance-inventory: Drag block, Move selected cells, Select or move row; matching controls stay hidden'
  );
  const inventoriedErrors = validateRegressionPlan(inventoried, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.doesNotMatch(inventoriedErrors, /requires reporter-noun:/);
  assert.doesNotMatch(inventoriedErrors, /requires affordance-inventory:/);
});

test('a failed claimed fix requires invalidation and automatic workflow repair', () => {
  const invalid = fixture({
    failedCount: 1,
    failedRows: failedFixRows({ invalidate: false, repair: false }),
  });
  const errors = validateRegressionPlan(invalid, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(errors, /must invalidate the prior claim/);
  assert.match(errors, /requires repair-now in a Regression source owner/);

  assert.deepEqual(
    validateRegressionPlan(fixture({ failedCount: 1 }), {
      complete: true,
      rootDir: root,
    }),
    []
  );
});

test('a second failed fix requires Best API and a layer plan', () => {
  const errors = validateRegressionPlan(fixture({ failedCount: 2 }), {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(errors, /requires architecture verdict escalate/);
  assert.match(errors, /requires Best API/);
  assert.match(errors, /requires a Plite or Plate layer plan/);

  assert.deepEqual(
    validateRegressionPlan(
      fixture({ architectureVerdict: 'escalate', failedCount: 2 }),
      { complete: true, rootDir: root }
    ),
    []
  );
});

test('browser-specific paint claims require exact Chrome proof', () => {
  const chromiumOnly = fixture({ exactChrome: true })
    .replace(
      'exact-chrome: installed Chrome 140 on the proof host',
      'browser: Playwright Chromium'
    )
    .replace('browser:exact-chrome:140', 'browser:chromium:140');
  const errors = validateRegressionPlan(chromiumOnly, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(errors, /requires Exact environment exact-chrome/);
  assert.match(
    errors,
    /requires an executable-attested exact Chrome proof receipt/
  );

  const handwrittenLabel = fixture({ exactChrome: true }).replace(
    ';browser-executable:/Applications/Google Chrome.app/Contents/MacOS/Google Chrome;browser-version:Google Chrome 140.0',
    ''
  );

  assert.match(
    validateRegressionPlan(handwrittenLabel, {
      complete: true,
      rootDir: root,
    }).join('\n'),
    /requires an executable-attested exact Chrome proof receipt/
  );

  assert.deepEqual(
    validateRegressionPlan(fixture({ exactChrome: true }), {
      complete: true,
      rootDir: root,
    }),
    []
  );
});

test('phase-qualified paint oracles trigger exact Chrome without source keywords', () => {
  const oracleOnly = fixture({ exactChrome: true })
    .replace('Blink compositor report', 'local workflow report')
    .replace(
      'exact-chrome: installed Chrome 140 on the proof host',
      'browser: generic browser proof'
    )
    .replace('browser:exact-chrome:140', 'browser:chromium:140');
  const errors = validateRegressionPlan(oracleOnly, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(errors, /requires Exact environment exact-chrome/);
  assert.match(
    errors,
    /requires an executable-attested exact Chrome proof receipt/
  );
});

test('pixel classifiers cannot complete without single-layer, absent, and duplicate controls', () => {
  const errors = validateRegressionPlan(
    fixture({ exactChrome: true, missingPixelControls: true }),
    { complete: true, rootDir: root }
  ).join('\n');

  assert.match(
    errors,
    /pixel classifier requires positive-control: pass, negative-control: pass, and duplicate-control: pass evidence/
  );

  assert.deepEqual(
    validateRegressionPlan(fixture({ exactChrome: true }), {
      complete: true,
      rootDir: root,
    }),
    []
  );
});

test('geometry-paint completion rejects computed-style-only evidence', () => {
  const computedStyleOnly = fixture({ exactChrome: true })
    .replace('exact-chrome pixel classifier', 'exact-chrome computed style')
    .replace(
      'pass: exact Chrome pixel oracle; positive-control: pass known single-layer state; negative-control: pass known-absent state; duplicate-control: pass known duplicate-layer state rejected',
      'pass: computed selection background is transparent'
    );
  const errors = validateRegressionPlan(computedStyleOnly, {
    complete: true,
    rootDir: root,
  }).join('\n');

  assert.match(errors, /requires actual pixel capture\/classification/);
  assert.match(errors, /requires positive-control: pass/);
  assert.match(errors, /requires negative-control: pass/);
});

test('completion requires affected-corpus replay after the last owner edit', () => {
  assert.match(
    validateRegressionPlan(fixture({ missingAffectedCase: true }), {
      complete: true,
      rootDir: root,
    }).join('\n'),
    /case-complete is missing from Affected corpus replay/
  );
});

test('shared-owner work requires an executable pre-edit affected baseline', () => {
  assert.match(
    validateRegressionPlan(fixture({ missingAffectedBaseline: true }), {
      complete: true,
      rootDir: root,
    }).join('\n'),
    /affected corpus Regression validator requires Pre-edit baseline pass: or red:/
  );
});

test('pre-implementation plans may record a baseline before final replay exists', () => {
  assert.deepEqual(
    validateRegressionPlan(
      fixture({ preImplementation: true, preImplementationBaseline: true }),
      {
        complete: false,
        rootDir: root,
      }
    ),
    []
  );
});

test('a started CI gate cannot be dismissed without a passing final rerun', () => {
  assert.match(
    validateRegressionPlan(fixture({ unresolvedGateFailure: true }), {
      complete: true,
      rootDir: root,
    }).join('\n'),
    /gate failure pnpm check:plite requires Final rerun pass/
  );
});

test('proof receipts are tamper-evident', () => {
  assert.match(
    validateRegressionPlan(
      fixture({ receiptIdOverride: `sha256:${'b'.repeat(64)}` }),
      { complete: true, rootDir: root }
    ).join('\n'),
    /has an invalid Receipt ID/
  );
});

test('completion recomputes the receipt digest from its exact input paths', () => {
  assert.match(
    validateRegressionPlan(
      fixture({ inputDigest: `sha256:${'b'.repeat(64)}` }),
      { complete: true, rootDir: root }
    ).join('\n'),
    /Input digest does not match current bytes/
  );
});

test('capture helper executes proof and prints a valid receipt row', () => {
  const script = join(
    root,
    '.agents/rules/regression/scripts/capture-proof-receipt.mjs'
  );
  const result = spawnSync(
    process.execPath,
    [
      script,
      '--case-id',
      'capture-case',
      '--attempt',
      '1',
      '--claim',
      'completed',
      '--input',
      semanticTestPath,
      '--host',
      'none: deterministic Node workflow',
      '--retries',
      '0',
      '--',
      process.execPath,
      '-e',
      'process.exit(0)',
    ],
    { cwd: root, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(
    result.stdout,
    /^\| capture-case \| 1 \| completed \| .+ \| pass: exit 0 in \d+ms \| (?:commit|dirty):[a-f0-9]{40} \| sha256:[a-f0-9]{64} \| 1 \| \.agents\/rules\/regression\/scripts\/validate-regression-plan\.test\.mjs \| host:none - deterministic Node workflow \| .+ \| 0 \| sha256:[a-f0-9]{64} \|$/m
  );
});

test('capture and validation share canonical mixed-path input ordering', () => {
  const script = join(
    root,
    '.agents/rules/regression/scripts/capture-proof-receipt.mjs'
  );
  const mixedInputs = [
    'AGENTS.md',
    '.agents/rules/regression/scripts/validate-regression-plan.mjs',
    semanticTestPath,
  ];
  const result = spawnSync(
    process.execPath,
    [
      script,
      '--case-id',
      'case-complete',
      '--attempt',
      '1',
      '--claim',
      'completed',
      ...mixedInputs.flatMap((input) => ['--input', input]),
      '--host',
      'none: deterministic Node workflow',
      '--retries',
      '0',
      '--',
      process.execPath,
      '-e',
      'process.exit(0)',
    ],
    { cwd: root, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, result.stderr);

  const receipt = result.stdout.trim();
  const inputDigest = receipt.match(/ \| (sha256:[a-f0-9]{64}) \| 3 \|/)?.[1];

  assert.ok(inputDigest, receipt);
  assert.deepEqual(
    validateRegressionPlan(
      fixture({ inputDigest }).replace(receiptRow({ inputDigest }), receipt),
      { complete: true, rootDir: root }
    ),
    []
  );
});

test('capture helper emits no receipt for a failed proof command', () => {
  const script = join(
    root,
    '.agents/rules/regression/scripts/capture-proof-receipt.mjs'
  );
  const result = spawnSync(
    process.execPath,
    [
      script,
      '--case-id',
      'capture-case',
      '--attempt',
      '1',
      '--claim',
      'completed',
      '--input',
      semanticTestPath,
      '--host',
      'none: deterministic Node workflow',
      '--retries',
      '0',
      '--',
      process.execPath,
      '-e',
      'process.exit(2)',
    ],
    { cwd: root, encoding: 'utf8' }
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /proof command failed with exit 2/);
  assert.doesNotMatch(result.stdout, /^\| capture-case/m);
});

test('capture helper emits no receipt when a proof input changes', () => {
  const script = join(
    root,
    '.agents/rules/regression/scripts/capture-proof-receipt.mjs'
  );
  const tmpRoot = join(root, 'tmp');
  mkdirSync(tmpRoot, { recursive: true });
  const tmpDir = mkdtempSync(join(tmpRoot, 'regression-proof-'));
  const inputPath = join(tmpDir, 'input.txt');
  writeFileSync(inputPath, 'before');

  try {
    const result = spawnSync(
      process.execPath,
      [
        script,
        '--case-id',
        'capture-case',
        '--attempt',
        '1',
        '--claim',
        'completed',
        '--input',
        relative(root, inputPath),
        '--host',
        'none: deterministic Node workflow',
        '--retries',
        '0',
        '--',
        process.execPath,
        '-e',
        `require('node:fs').appendFileSync(${JSON.stringify(inputPath)}, 'after')`,
      ],
      { cwd: root, encoding: 'utf8' }
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /proof inputs changed while the command ran/);
    assert.doesNotMatch(result.stdout, /^\| capture-case/m);
  } finally {
    rmSync(tmpDir, { force: true, recursive: true });
  }
});
