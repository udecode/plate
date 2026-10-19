#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../../..');
const input = resolve(
  root,
  process.argv[2] ??
    '.tmp/editor-issue-harvester/slate/raw/delta-corpus-2026-08-14.json'
);
const output = resolve(root, 'docs/editor-issue-harvester/slate');
const checkedAt = '2026-08-14T11:21:25.836091Z';
const sourceCommit = 'ec793483ada7f7e21ebc82c2b3aa9ea674605ce3';
const baseline = '2026-05-23T09:18:40Z';

const commands = {
  command: 'pnpm --filter @platejs/plite test -- command-spec.test.ts',
  decoration:
    'pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/decorations-async.test.ts',
  dom: "pnpm --filter @platejs/plite-dom exec bun test --preload ../../config/plite-source-test-setup.ts ./test/bridge.ts --test-name-pattern 'resolves recoverable DOM bridge gaps'",
  grapheme:
    'pnpm --filter @platejs/plite exec bun test --preload ../../config/plite-source-test-setup.ts ./test/text-units-contract.ts',
  history:
    "pnpm --filter @platejs/plite-history exec bun test --preload ../../config/plite-source-test-setup.ts ./test/history-contract.ts --test-name-pattern 'discards the redo branch'",
  selected:
    'pnpm --filter @platejs/plite-react test -- use-element-selected.test.tsx',
  selection:
    "pnpm --filter @platejs/plite-react exec bun test --preload ../../config/plite-source-test-setup.ts ./test/selection-controller-contract.ts --test-name-pattern 'DOM selectionchange import|model-owned collapsed'",
};

const decisions = {
  3556: {
    classification: 'portable-dom-resolution',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Merged PR #6080 made target-range path lookup recoverable; Plite already separates nullable bridge recovery from strict APIs.',
    linked_prs: [6080],
    upstream_test_provenance:
      'PR #6080 changed Editable and slate-dom resolution without adding a test.',
    local_coverage: 'Exact nullable-versus-strict DOM bridge contract.',
    local_test: 'packages/plite-dom/test/bridge.ts:411',
    verification_command: commands.dom,
    next_action: 'Keep the resolver contract; no transplant.',
  },
  5130: {
    classification: 'portable-mobile-ime',
    owner: 'slate-v2',
    status: 'needs-repro',
    reason:
      'Firefox Android predictive typing is device and IME specific; synthetic Android contracts cannot close the raw-device claim.',
    linked_prs: [],
    upstream_test_provenance:
      'No linked merged PR or upstream regression test.',
    local_coverage: 'Adjacent synthetic Android input-manager coverage only.',
    local_test:
      'packages/plite-react/test/android-input-manager-contract.test.ts',
    verification_command: 'bun test:mobile-device-proof:raw',
    next_action:
      'Reproduce on a real Firefox Android device before choosing a fix.',
  },
  5974: {
    classification: 'portable-mobile-ime',
    owner: 'slate-v2',
    status: 'needs-repro',
    reason:
      'The issue closed without a merged fix; an emulator report and a commenter workaround do not prove current behavior.',
    linked_prs: [],
    upstream_test_provenance: 'No linked merged PR or durable upstream test.',
    local_coverage:
      'Composition contracts are adjacent, not an iPhone-emulator Chinese-input reproduction.',
    local_test: 'packages/plite-react/test/composition-state-contract.test.ts',
    verification_command: 'bun test:mobile-device-proof:raw',
    next_action:
      'Reproduce only if mobile composition enters the selected work queue.',
  },
  5987: {
    classification: 'portable-decoration-selection',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Merged PR #6033 adds the async-decoration caret regression and Plite has the same browser behavior row.',
    linked_prs: [6033],
    upstream_test_provenance:
      'playwright/integration/examples/code-highlighting.test.ts in PR #6033.',
    local_coverage:
      'Exact async decoration caret and composition browser proof.',
    local_test:
      'apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts',
    verification_command: commands.decoration,
    next_action: 'Keep the existing browser row.',
  },
  6053: {
    classification: 'portable-react-selection',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Merged PR #6073 prevents selected-element removal from throwing; Plite has exact removal and unmount contracts.',
    linked_prs: [6073],
    upstream_test_provenance:
      'packages/slate-react/test/use-selected.spec.tsx in PR #6073.',
    local_coverage:
      'Exact selected element removal and explicit watched-path removal.',
    local_test: 'packages/plite-react/test/use-element-selected.test.tsx:218',
    verification_command: commands.selected,
    next_action: 'Keep the current hook contract.',
  },
  6086: {
    classification: 'portable-selection-origin',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Plite records selection origin and rejects queued native selectionchange when model-owned programmatic selection is authoritative.',
    linked_prs: [],
    upstream_test_provenance: 'Open issue; no upstream fix or test.',
    local_coverage:
      'Exact native-only import and model-owned programmatic selectionchange contracts.',
    local_test:
      'packages/plite-react/test/selection-controller-contract.ts:971',
    verification_command: commands.selection,
    next_action: 'Track upstream outcome; no local test gap.',
  },
  6087: {
    classification: 'plate-product-ui',
    owner: 'plate',
    status: 'deferred-with-owner',
    reason:
      'The request names Plate.js toolbar buttons and is filed in the wrong upstream repository; it is not a Slate editor-kernel behavior.',
    linked_prs: [],
    upstream_test_provenance: 'No Slate implementation or test provenance.',
    local_coverage: 'N/A: Plate toolbar product policy.',
    local_test: '',
    verification_command: '',
    next_action:
      'Route to the Plate UI owner if selected; do not create a Slate-v2 regression test.',
  },
  6003: {
    classification: 'broad-type-surface',
    owner: 'needs-plan',
    status: 'deferred-with-owner',
    reason:
      'The still-open 167-file PR mixes type tests and unrelated corrections; it is not a decision-atomic portable test slice.',
    linked_prs: [],
    upstream_test_provenance:
      'PR files and checks hydrated; no merged authority.',
    local_coverage:
      'Plite type inference is owned by its public API contracts, not this bulk patch.',
    local_test: '',
    verification_command: '',
    next_action: 'Split into atomic API questions before any best-api review.',
  },
  6033: {
    classification: 'portable-decoration-selection',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Merged async-decoration caret fix maps exactly to Plite browser proof.',
    linked_prs: [6033],
    upstream_test_provenance:
      'playwright/integration/examples/code-highlighting.test.ts.',
    local_coverage:
      'Exact async decoration caret and composition browser proof.',
    local_test:
      'apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts',
    verification_command: commands.decoration,
    next_action: 'Keep the current browser row.',
  },
  6039: {
    classification: 'fork-specific-batching-architecture',
    owner: 'needs-plan',
    status: 'deferred-with-owner',
    reason:
      'Closed unmerged fork batching engine is the source of the remembered legacy audit, not current upstream Slate law.',
    linked_prs: [6039],
    upstream_test_provenance:
      'Closed unmerged PR with a 109-file branch-specific patch.',
    local_coverage:
      'Plite has transactions and rollback, but no benchmark proves this engine is the right base.',
    local_test: '',
    verification_command: '',
    next_action:
      'Require a benchmarked architecture packet before reconsidering mutable batching.',
  },
  6050: {
    classification: 'mutable-batching-architecture',
    owner: 'needs-plan',
    status: 'deferred-with-owner',
    reason:
      'Open mutable-batching proposal changes ownership and runtime cost; isolated tests cannot settle adoption.',
    linked_prs: [],
    upstream_test_provenance:
      'Open PR; hydrated files, commits, checks, and review threads.',
    local_coverage:
      'Plite transaction laws cover atomicity, not this mutable representation.',
    local_test: '',
    verification_command: '',
    next_action:
      'Benchmark against Plite transactions before architecture review.',
  },
  6063: {
    classification: 'portable-history-rollback',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'The open try/finally cleanup proposal expresses rollback law already enforced by Plite transactions and History.',
    linked_prs: [],
    upstream_test_provenance:
      'Open PR changes history helpers; no merged authority.',
    local_coverage: 'Exact History redo-discard rollback contract.',
    local_test: 'packages/plite-history/test/history-contract.ts:1294',
    verification_command: commands.history,
    next_action: 'Keep transaction-owned cleanup.',
  },
  6065: {
    classification: 'portable-hyperscript-harness',
    owner: 'slate-v2',
    status: 'deferred-with-owner',
    reason:
      'Merged PointRef and RangeRef hyperscript helpers are useful test ergonomics, but Plite hyperscript has no equivalent owner.',
    linked_prs: [6065],
    upstream_test_provenance:
      'packages/slate-hyperscript/test fixtures and parser changes in PR #6065.',
    local_coverage: 'No PointRef or RangeRef hyperscript mapping found.',
    local_test: '',
    verification_command: '',
    next_action:
      'Add only when a selected Plite test needs ref-valued hyperscript fixtures.',
  },
  6072: {
    classification: 'portable-dom-resolution',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Suppress-throw propagation maps to Plite nullable-versus-strict bridge behavior.',
    linked_prs: [6072],
    upstream_test_provenance: 'Merged source fix without a new test.',
    local_coverage: 'Exact nullable-versus-strict DOM bridge contract.',
    local_test: 'packages/plite-dom/test/bridge.ts:411',
    verification_command: commands.dom,
    next_action: 'Keep the current resolver contract.',
  },
  6073: {
    classification: 'portable-react-selection',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason: 'Selected-element removal maps to exact Plite hook contracts.',
    linked_prs: [6073],
    upstream_test_provenance:
      'packages/slate-react/test/use-selected.spec.tsx.',
    local_coverage: 'Exact removal and unmount coverage.',
    local_test: 'packages/plite-react/test/use-element-selected.test.tsx:218',
    verification_command: commands.selected,
    next_action: 'Keep the current hook contract.',
  },
  6074: {
    classification: 'portable-unicode-grapheme',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Indic conjunct GB9c behavior is already asserted for Tamil and Devanagari deletion units.',
    linked_prs: [6074],
    upstream_test_provenance:
      'packages/slate/test/interfaces/editor/delete-backward/character/indic-conjunct.js.',
    local_coverage: 'Exact Indic grapheme unit cases and deletion loops.',
    local_test: 'packages/plite/test/text-units-contract.ts:25',
    verification_command: commands.grapheme,
    next_action: 'Keep Intl.Segmenter-backed contracts.',
  },
  6078: {
    classification: 'portable-decoration-selection',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Firefox decoration rerender safety is covered by the async-decoration browser suite.',
    linked_prs: [6078],
    upstream_test_provenance: 'Merged one-file runtime fix without a new test.',
    local_coverage: 'Browser decoration caret and composition proof.',
    local_test:
      'apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts',
    verification_command: commands.decoration,
    next_action: 'Keep the current browser row.',
  },
  6080: {
    classification: 'portable-dom-resolution',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'Recoverable beforeinput target-range lookup maps to Plite nullable bridge and selection reconciliation.',
    linked_prs: [6080],
    upstream_test_provenance:
      'Merged source fix for issue #3556 without a new test.',
    local_coverage: 'Exact nullable bridge recovery contract.',
    local_test: 'packages/plite-dom/test/bridge.ts:411',
    verification_command: commands.dom,
    next_action: 'Keep the current resolver contract.',
  },
  6083: {
    classification: 'reference-api-shape-rejected',
    owner: 'needs-plan',
    status: 'deferred-with-owner',
    reason:
      'Slate types null as implicit property removal; Plite deliberately exposes unsetNodes instead of overloading setNodes.',
    linked_prs: [6083],
    upstream_test_provenance: 'Merged type and fixture changes.',
    local_coverage: 'Explicit unsetNodes API owns removal semantics.',
    local_test: 'packages/plite/src/transforms-node/unset-nodes.ts',
    verification_command: '',
    next_action: 'Keep the explicit API unless best-api selects null-as-unset.',
  },
  6084: {
    classification: 'portable-native-input',
    owner: 'slate-v2',
    status: 'needs-repro',
    reason:
      'The open PR adds two browser regressions for native insertText that makes no model change; no exact Plite no-op browser row was found.',
    linked_prs: [],
    upstream_test_provenance:
      'playwright/integration/examples/insert-text-noop*.test.ts in open PR #6084.',
    local_coverage:
      'Adjacent repair and same-path insert contracts do not prove DOM restoration after a semantic no-op.',
    local_test: 'packages/plite-react/test/dom-repair-policy-contract.test.ts',
    verification_command: '',
    next_action:
      'Reproduce the two upstream scenarios in the Plite browser harness before implementing.',
  },
  6091: {
    classification: 'portable-command-api',
    owner: 'slate-v2',
    status: 'covered-by-existing-test',
    reason:
      'The docs-only Slate helper proposal is subsumed by Plite defineCommand, typed handlers, routing, recursion, and decline semantics.',
    linked_prs: [],
    upstream_test_provenance:
      'Open docs-only PR; no Slate runtime or test change.',
    local_coverage: 'Typed semantic command contract.',
    local_test: 'packages/plite/test/command-spec.test.ts',
    verification_command: commands.command,
    next_action:
      'Keep Plite command ownership; do not copy the docs helper shape.',
  },
  6092: {
    classification: 'portable-deep-equality',
    owner: 'slate-v2',
    status: 'deferred-with-owner',
    reason:
      'Merged recursive nested-array comparison exposes a real Plite gap: local deepEqual compares array elements by reference.',
    linked_prs: [6092],
    upstream_test_provenance:
      'packages/slate/test/utils/deep-equal/deep-*-with-array.js.',
    local_coverage:
      'Primitive arrays only; nested object and array values are unsupported.',
    local_test: 'packages/plite/src/utils/deep-equal.ts',
    verification_command: '',
    next_action: 'Open a focused Plite deep-equality test-and-fix slice.',
  },
  6096: {
    classification: 'portable-mobile-ime',
    owner: 'slate-v2',
    status: 'needs-repro',
    reason:
      'The open Android empty-leaf patch contains no automated regression test, and synthetic contracts cannot prove first-character IME behavior.',
    linked_prs: [],
    upstream_test_provenance:
      'Open PR changes Android manager, string rendering, and examples only.',
    local_coverage:
      'Adjacent empty-state and Android manager contracts; no raw-device first-character proof.',
    local_test:
      'packages/plite-react/test/android-input-manager-contract.test.ts',
    verification_command: 'bun test:mobile-device-proof:raw',
    next_action:
      'Require real Android IME reproduction before changing the placeholder or manager lifecycle.',
  },
};

const skipGroups = {
  security: new Set([
    5869, 6025, 6031, 6032, 6037, 6041, 6049, 6057, 6058, 6060, 6062, 6068,
    6069, 6070, 6071, 6081, 6085, 6089, 6090, 6093, 6094,
  ]),
  release: new Set([6066, 6077, 6079, 6082, 6088, 6095]),
  tooling: new Set([5801, 6075, 6076]),
  docs: new Set([6067]),
};

for (const [group, numbers] of Object.entries(skipGroups)) {
  for (const number of numbers) {
    decisions[number] = {
      classification: `${group}-non-behavior`,
      owner: 'docs-support-release',
      status: 'invalid-skip',
      reason: `${group} maintenance does not define a portable editor-behavior regression.`,
      linked_prs: [],
      upstream_test_provenance:
        'Hydrated PR metadata and file list show no decision-atomic editor behavior test.',
      local_coverage: 'N/A: outside editor behavior harvest.',
      local_test: '',
      verification_command: '',
      next_action:
        group === 'security'
          ? 'Leave dependency and advisory handling to the security/release lane.'
          : 'No editor audit action.',
    };
  }
}

const source = JSON.parse(readFileSync(input, 'utf8'));
const sourceNumbers = source.map(({ number }) => number).sort((a, b) => a - b);
const decisionNumbers = Object.keys(decisions)
  .map(Number)
  .sort((a, b) => a - b);
const missing = sourceNumbers.filter((number) => !decisions[number]);
const extra = decisionNumbers.filter(
  (number) => !sourceNumbers.includes(number)
);
if (source.length !== 54 || missing.length || extra.length) {
  throw new Error(
    `expected exact 54-row delta; missing=${missing.join(',')} extra=${extra.join(',')}`
  );
}

const rows = source
  .map((thread) => ({
    number: thread.number,
    issue_number: thread.number,
    kind: thread.kind,
    state: thread.state,
    merged: thread.merged === 1,
    title: thread.title.trim(),
    url: thread.url,
    created_at: thread.created_at_gh,
    updated_at: thread.updated_at_gh,
    delta_kind:
      thread.created_at_gh > baseline
        ? 'created-after-baseline'
        : 'materially-updated-after-baseline',
    ...decisions[thread.number],
    last_checked_at: checkedAt,
  }))
  .sort((a, b) => a.number - b.number);

const fields = [
  'issue_number',
  'number',
  'kind',
  'state',
  'merged',
  'title',
  'url',
  'created_at',
  'updated_at',
  'delta_kind',
  'classification',
  'owner',
  'status',
  'reason',
  'linked_prs',
  'upstream_test_provenance',
  'local_coverage',
  'local_test',
  'verification_command',
  'last_checked_at',
  'next_action',
];
const tsvCell = (value) =>
  String(Array.isArray(value) ? value.join(',') : (value ?? ''))
    .replaceAll('\t', ' ')
    .replaceAll('\n', ' ');
const mdCell = (value) => tsvCell(value).replaceAll('|', '\\|');
const countBy = (key) =>
  Object.fromEntries(
    [...new Set(rows.map((row) => row[key]))]
      .sort()
      .map((value) => [value, rows.filter((row) => row[key] === value).length])
  );
const counts = {
  total: rows.length,
  issues: rows.filter((row) => row.kind === 'issue').length,
  pull_requests: rows.filter((row) => row.kind === 'pull_request').length,
  created_after_baseline: rows.filter(
    (row) => row.delta_kind === 'created-after-baseline'
  ).length,
  materially_updated_after_baseline: rows.filter(
    (row) => row.delta_kind === 'materially-updated-after-baseline'
  ).length,
  statuses: countBy('status'),
};
const allowedOwners = new Set([
  'slate-v2',
  'plate',
  'external-framework',
  'docs-support-release',
  'needs-plan',
  'unknown',
]);
const allowedStatuses = new Set([
  'unchecked',
  'invalid-skip',
  'covered-by-existing-test',
  'test-written',
  'plate-owned-covered',
  'deferred-with-owner',
  'needs-repro',
  'blocked',
]);
const invalidRows = rows.filter(
  (row) => !allowedOwners.has(row.owner) || !allowedStatuses.has(row.status)
);
if (invalidRows.length || rows.some((row) => row.status === 'unchecked')) {
  throw new Error(
    `invalid or unchecked closure rows: ${invalidRows.map((row) => row.number).join(',')}`
  );
}
const table = (subset) =>
  [
    '| Check | Thread | Kind | State | Decision | Owner | Evidence / next action |',
    '| --- | ---: | --- | --- | --- | --- | --- |',
    ...subset.map(
      (row) =>
        `| [x] | [#${row.number}](${row.url}) | ${row.kind === 'pull_request' ? 'PR' : 'issue'} | ${row.merged ? 'merged' : row.state} | ${mdCell(row.status)} | ${mdCell(row.owner)} | ${mdCell(row.reason)} ${mdCell(row.next_action)} |`
    ),
  ].join('\n');

writeFileSync(
  resolve(output, 'full/classified-threads.json'),
  `${JSON.stringify({ schemaVersion: 1, source: { baseline, checkedAt, sourceCommit }, counts, rows }, null, 2)}\n`
);
writeFileSync(
  resolve(output, 'full/classified-threads.tsv'),
  `${fields.join('\t')}\n${rows.map((row) => fields.map((field) => tsvCell(row[field])).join('\t')).join('\n')}\n`
);
writeFileSync(
  resolve(output, 'full/issue-closure-ledger.tsv'),
  `${fields.join('\t')}\n${rows.map((row) => fields.map((field) => tsvCell(row[field])).join('\t')).join('\n')}\n`
);
writeFileSync(
  resolve(output, 'full/issue-closure-ledger.md'),
  `# Slate issue and PR delta closure ledger\n\nStatus: closed for the delta after \`${baseline}\`.\n\nSource head: \`${sourceCommit}\`. Metadata and PR details checked at \`${checkedAt}\`. Raw bodies, comments, checks, commits, and file lists remain unversioned under \`.tmp/editor-issue-harvester/slate/raw/\`.\n\n## Counts\n\n| Bucket | Count |\n| --- | ---: |\n| Total changed threads | ${counts.total} |\n| Issues | ${counts.issues} |\n| Pull requests | ${counts.pull_requests} |\n| Created after baseline | ${counts.created_after_baseline} |\n| Older and materially updated | ${counts.materially_updated_after_baseline} |\n${Object.entries(
    counts.statuses
  )
    .map(([status, count]) => `| ${status} | ${count} |`)
    .join(
      '\n'
    )}\n| Unchecked | 0 |\n\n## Row closure\n\n${table(rows)}\n\nMachine-readable ledger: [classified-threads.json](./classified-threads.json). Full columns: [issue-closure-ledger.tsv](./issue-closure-ledger.tsv).\n`
);

const issues = rows.filter((row) => row.kind === 'issue');
writeFileSync(
  resolve(output, 'issues.md'),
  `# Slate changed issues\n\nThese are all issues created or materially changed after \`${baseline}\`; PRs are in the [full closure ledger](./full/issue-closure-ledger.md).\n\n${table(issues)}\n`
);
const relevant = rows.filter((row) => row.status !== 'invalid-skip');
writeFileSync(
  resolve(output, 'matrix.md'),
  `# Slate portable behavior matrix\n\nThis matrix contains the ${relevant.length} behavior, API, architecture, product, and proof rows from the 54-thread delta. Infrastructure, dependency, docs, and release PRs remain explicitly checked in the full ledger.\n\n${table(relevant)}\n`
);

const clusters = [...new Set(relevant.map((row) => row.classification))].sort();
writeFileSync(
  resolve(output, 'clusters.md'),
  `# Slate delta clusters\n\n| Cluster | Threads | Closure |\n| --- | --- | --- |\n${clusters
    .map((cluster) => {
      const members = relevant.filter((row) => row.classification === cluster);
      return `| ${cluster} | ${members.map((row) => `#${row.number}`).join(', ')} | ${[...new Set(members.map((row) => row.status))].join(', ')} |`;
    })
    .join('\n')}\n`
);

writeFileSync(
  resolve(output, 'report.md'),
  `# Slate issue and PR delta audit\n\n## Verdict\n\nThe delta after \`${baseline}\` is closed: ${counts.total} changed threads, comprising ${counts.issues} issues and ${counts.pull_requests} PRs. ${counts.created_after_baseline} were created after the baseline and ${counts.materially_updated_after_baseline} are older threads with newer material activity. Every row has an explicit disposition; zero remain unchecked.\n\nOne merged change exposes a confirmed Plite implementation gap: [#6092](https://github.com/ianstormtaylor/slate/pull/6092) recursively compares nested arrays while Plite's current helper compares array members by reference. Point/range-ref hyperscript support is a small harness defer. Native no-op insertText and Android IME rows require reproduction; synthetic proof is not promoted to device proof.\n\n## Authority\n\n- All-state metadata sync: 5,853 threads, then exact hydration of the 54-row delta.\n- Hydrated delta: 7 issues, 47 PRs, 51 review threads, 47 PR details, 432 PR files, 151 commits, 498 checks, and 101 workflow runs.\n- Sync finished at \`${checkedAt}\`; source head is \`${sourceCommit}\`.\n- Raw upstream text remains unversioned. Durable outputs contain compact metadata and local decisions only.\n\n## Closure counts\n\n${Object.entries(
    counts.statuses
  )
    .map(([status, count]) => `- ${status}: ${count}`)
    .join(
      '\n'
    )}\n\n## Proof boundary\n\n\`covered-by-existing-test\` rows name a current exact owner and focused command. \`needs-repro\` rows are unresolved behavior claims, not failures. \`deferred-with-owner\` rows record an architecture, API, product, or proof owner. \`invalid-skip\` rows were inspected and rejected as non-behavior work.\n\nSee [issues.md](./issues.md), [clusters.md](./clusters.md), [matrix.md](./matrix.md), and the [full closure ledger](./full/issue-closure-ledger.md).\n`
);

process.stdout.write(`${JSON.stringify(counts)}\n`);
