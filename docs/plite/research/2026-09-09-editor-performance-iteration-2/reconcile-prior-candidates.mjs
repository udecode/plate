import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../../..');
const output = resolve(
  root,
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const previous =
  'docs/plans/artifacts/2026-09-07-editor-performance-research/wordgard-prosekit';
const queuePath = `${previous}/unified-experiment-queue.json`;
const queue = JSON.parse(readFileSync(resolve(root, queuePath), 'utf8'));
const historical = new Map();
const matrixPaths = new Set();

const parseRow = (line) => {
  const cells = [];
  let cell = '';
  let code = false;
  let escaped = false;
  for (const character of line.trim()) {
    if (escaped) {
      cell += character;
      escaped = false;
      continue;
    }
    if (character === '\\') {
      escaped = true;
      continue;
    }
    if (character === '`') code = !code;
    if (character === '|' && !code) {
      cells.push(cell.trim());
      cell = '';
    } else cell += character;
  }
  cells.push(cell.trim());
  return cells.slice(1, -1);
};

for (const reference of ['wordgard', 'prosekit']) {
  const path = `${previous}/${reference}-concept-manifest.json`;
  const manifest = JSON.parse(readFileSync(resolve(root, path), 'utf8'));
  matrixPaths.add(`${previous}/${reference}-concept-matrix.md`);
  for (const candidate of manifest.priorCandidates) {
    const current = historical.get(candidate.id) ?? {
      id: candidate.id,
      title: candidate.id,
      sources: [],
    };
    current.sources.push({
      reference,
      manifest: path,
      evidence: candidate.evidence,
      oldConceptIds: candidate.conceptIds,
    });
    historical.set(candidate.id, current);
    if (candidate.evidence.endsWith('concept-matrix.md'))
      matrixPaths.add(candidate.evidence);
  }
}
for (const path of matrixPaths) {
  let header;
  for (const line of readFileSync(resolve(root, path), 'utf8').split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const row = parseRow(line);
    if (row.includes('Priority') && row.includes('Concept')) {
      header = row;
      continue;
    }
    if (!header || !/^P[0-3]$/.test(row[header.indexOf('Priority')] ?? ''))
      continue;
    const id = row[header.indexOf('ID')].replaceAll('`', '');
    const current = historical.get(id) ?? {
      id,
      title: row[header.indexOf('Concept')],
      sources: [],
    };
    current.title = row[header.indexOf('Concept')];
    current.sources.push({
      matrix: path,
      priority: row[header.indexOf('Priority')],
      verdict: row[header.indexOf('Verdict')],
    });
    historical.set(id, current);
  }
}

const dispositions = `
U00|supersede|plite.history|The first iteration adopted lazy recovery at the existing history owner. Preserve current replacement/history controls; do not present the old prototype as unimplemented upside.|docs/plans/2026-09-07-editor-performance-phase-1.md
U01|supersede|plate.find|Phase 3 rejected or left inconclusive the tested complete Find candidates. Current BaseFindPlugin still rescans on document commits; any new attempt must include publication and rendered matches.|docs/plans/2026-09-08-editor-performance-phase-3.md
U02|supersede|plite.transactions|Phase 2 kept scoped-reader reductions. Re-measure current global publication and remaining consumers; the original broad proposal cannot be counted again as an unimplemented gain.|docs/plans/2026-09-07-editor-performance-phase-2.md
U03|supersede|tooling.package-build|Phase 4 examined compiler pairing. Transformation coverage and runtime gain remain separate; current package and copied-source builds need their own emitted-function bindings.|docs/plans/2026-09-08-editor-performance-phase-4.md
U04|supersede|plate.react-state|Current feature hooks still use the base-store selector adapter. Earlier consumer cuts do not prove field-specific publication; retain a narrower current many-reader attribution packet.|packages/platejs/src/react/stores/plate/usePluginStore.ts:144
U05|reaffirm|plite.native-selection|Document selection transport remains a view-lifecycle question. No new shared listener is accepted without proving duplicate current work and exact Document/root routing.|packages/plitejs/src/react/editable/selection-reconciler.ts:1
U06|reaffirm|plite.react-subscriptions|The committed-selector adapter protects concurrent rendering. A second adapter is not automatically redundant when optional-store or filtering contracts differ.|packages/plitejs/src/react/hooks/use-generic-selector.tsx:1
U07|supersede|plate.ai|AI sessions and Excalidraw subscriptions have explicit current lifetimes. Code-drawing Graphviz construction is a narrower resource-reuse lead; no blanket resource recreation claim remains.|packages/platejs/src/ai/react/useAIChat.ts:262
U08|reaffirm|plite.dom-coordinates|Repeated geometry reads are a conditional lead; current layout-state equality and complete overlay settlement must be measured before coalescing.|packages/plitejs/src/dom/plugin/dom-geometry.ts:1
U09|supersede|plite.react-commit|Phase 5 kept commit-boundary work reductions and replayed structural actions. New renderer work requires a currently rendering cohort rather than a zero-render text edit.|docs/plans/2026-09-09-editor-performance-phase-5.md
U10|supersede|plite.text-rendering|Phase 5 improved selected native paths but the 10k-line code baseline remained red. Current attribution must separate validation, highlighting and DOM mutation.|docs/plans/2026-09-09-editor-performance-phase-5.md
U11|reaffirm|plite.annotations|The current store already routes changed IDs and dirty nodes. An interval index is conditional on an actual remaining overlap-query bottleneck.|packages/plitejs/src/annotations/store.ts:1
U12|reaffirm|plite.schema|Repeated correction setup is not established by a slow flatten operation. Preserve the existing correction owner and measure setup, discovery and repair separately.|packages/plitejs/src/core/correction.ts:1
U13|supersede|plate.table|Phase 5 changed table coordinate reuse and improved resize; selection remained slow. The next experiment must target the measured remaining operation and current topology cache.|docs/plans/2026-09-09-editor-performance-phase-5.md
U14|reaffirm|plate.code-block|Current highlighting reparses changed block text before reusing token identities. Incremental parsing remains a strong conditional mechanism with grammar and completion guards.|packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:1200
U15|reaffirm|plate.code-block|The existing CodeMirror adapter is the first specialized-view comparison. Its omitted-DOM contract stays separate from native full-DOM ranking.|packages/platejs/src/code-block/codemirror/createCodeMirrorAdapter.ts:1
U16|reaffirm|plite.virtualization|The current virtualized plan combines geometry, retained indexes and virtualizer state. Eliminate duplicate measured work before adding another index.|packages/plitejs/src/react/dom-strategy/use-virtualized-root-plan.ts:1
U17|reaffirm|plite.staged-rendering|Containment retains DOM but changes layout/paint behavior. It needs native Find, print, selection, table and overlay proof; it cannot remove model or parser work.|packages/plitejs/src/react/components/dom-coverage-boundary.tsx:1
U18|reaffirm|plite.virtualization|Overscan tuning must prove wheel, thumb, keyboard and reverse-scroll behavior in the current strategy, with no blank frames or missing endpoints.|packages/plitejs/src/react/dom-strategy/use-virtualized-root-plan.ts:1
U19|reaffirm|plite.virtualization|An immutable virtual-window snapshot remains a private compiler experiment, not authority to replace the virtualizer or remove a semantic compiler exclusion.|packages/plitejs/src/react/dom-strategy/use-virtualized-root-plan.ts:1
U20|reaffirm|plate.code-block|Syntax scheduling must preserve bounded complete highlighting. Moving work after an input timer is not removing it.|packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:1200
U21|reaffirm|plite.view-sources|Worker offload remains feature-specific and conditional on compute exceeding transfer/startup costs; canonical commits stay synchronous.|packages/plitejs/src/internal/view/view-source.ts:1
U22|supersede|plite.document|The inspected code-block line-offset scan belongs to block conversion rather than typing. Keep pathological string representation as a separate conditional probe with full read/serialize costs.|packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts:150
U23|reaffirm|plite.document|Current persistent identity/index owners remain the baseline. Allocation and retained-heap attribution must identify a specific copy before representation changes.|packages/plitejs/src/core/snapshot-index.ts:1
U24|reaffirm|plite.change-algebra|Canonical mapping, roots and move identity remain hard laws. Large collaboration replacement does not by itself identify mapping representation as the cause.|packages/plitejs/src/core/change/mapping.ts:1
U25|reaffirm|plite.history|History retention remains independent of lazy recovery. Use current depth/soak slopes and exact undo/redo/remote laws before removing retained state.|packages/plitejs/src/history/history-state.ts:1
U26|reaffirm|plate.packaging|Equivalent feature reachability is still worth measuring; dropping configured features or CSS changes the comparison contract.|packages/platejs/src/core.tsx:1
U27|reaffirm|product.registry|Copied-source React Compiler behavior needs an actual consuming build. Source or packed package compilation does not establish it.|apps/www/scripts/build-registry.mts:1
U28|supersede|plate.code-drawing|A concrete current hidden-work lead is code-drawing rendering: the effect depends on code/language/server, not the selected code/preview view. Preserve cancellation and final output in a focused visibility experiment.|apps/www/src/registry/components/editor/code-drawing.tsx:76
U29|reaffirm|tooling.package-build|Compiler labels must bind exact source, emitted hot function and exercised path. Neither a config flag nor total compile count proves a user-visible gain.|tooling/scripts/check-react-compiler-contract.mjs:1
U30|reaffirm|plite.virtualization|Native Find, print, AX and raw-device behaviors remain explicit presentation-mode proof gates, including materialization time and memory.|packages/plitejs/src/react/editable/projected-native-affordance.ts:1
U31|reject|plate.code-block|Silent size-triggered feature loss is excluded from equal-contract optimization. Any explicit degradation mode is a separate product decision, not a speedup in this roadmap.|docs/plans/artifacts/2026-09-07-editor-performance-research/wordgard-prosekit/unified-experiment-queue.md#u31-offer-explicit-feature-degradation-only-as-product-policy
U32|reject|plite.text-rendering|A general GPU rich-text rewrite duplicates native input/layout/accessibility ownership. VS Code GPU eligibility also excludes important rich-text cases; no equal-contract gain is established.|../vscode/src/vs/editor/browser/gpu/viewGpuContext.ts:161
U33|reaffirm|tooling.package-build|The earlier schema/typegraph failures are independent DX leads. Re-run current deterministic budgets and preserve unannotated callback inference before choosing a generic or migration cut.|benchmarks/editor/benchmarks/plite-schema-typecheck-budget.mjs:1
WG-STATE-013|supersede|plite.native-selection|The old caret-engine owner paths no longer identify the current substrate. Preserve the deterministic visual-bidi behavior requirement and compare exact native navigation; legal UTF-16 endpoints alone are insufficient.|apps/plite/tests/plite-browser/donor/examples/navigation-bidi.test.ts:1
WG-PRODUCT-003A2D|reaffirm|plate.basic-styles|The current feature-source scan still finds no textDirection/writingMode feature owner. This remains a scoped product/API gap, distinct from fast native caret movement.|packages/platejs/src/features/basic-styles/lib/BaseStylePlugins.ts:1
WG-PROOF-004C|reaffirm|proof.browser-host|Raw Android/iOS input artifacts remain a separate required capability. Browser viewport tests cannot close this historical gap.|apps/plite/playwright.config.ts:1
WG-VIEW-014C2|supersede|product.registry|Current floating/hover components own their lifetimes; the broad old architecture claim becomes a focused async-source and pointer race proof requirement, not a wholesale tooltip API transplant.|apps/plite/tests/plite-browser/donor/examples/hovering-toolbar.test.ts:1
WG-WEB-001|supersede|product.www-host|Current public symbol extraction and documentation infrastructure must be evaluated at current source owners. This is documentation/DX work; it has no demonstrated keystroke benefit.|apps/www/api-reference.config.json:1
PLATE-PLUGIN-IDENTITY|reject|plate.plugin-api|Current nominal plugin names, schema declarations and inferred capability definitions no longer universally invent an AST type for every capability. Preserve explicit schema identity; the old premise is stale.|packages/platejs/src/lib/plugin/defineBasePlugin.ts:310
LOCAL-SCHEMA-DEFAULT-SIDECHANNEL|reject|plite.schema|A current source scan finds no defaultBlockType owner. The old global-default proposal must not be treated as current debt without an exact present schema/default counterexample.|packages/plitejs/src/core/schema-definition.ts:1
LOCAL-LIFECYCLE-PHASE|supersede|plite.extensions|Current activation is staged against a candidate registry, rolls back activated records and fields, and preserves ordered errors. The old missing failure-atomic activation premise becomes preservation proof.|packages/plitejs/src/core/editor-extension.ts:2277
LOCAL-HISTORY-IDLE-GROUP|reject|plite.history|HistoryOptions exposes newBatchDelay and automatic merging compares performance.now against the prior group time. The requested idle-boundary behavior is implemented.|packages/plitejs/src/history/history-extension.ts:98
LOCAL-MAX-LENGTH-POLICY|reaffirm|plite.input-runtime|Current maxLength still has an editor-side setter and insertion-limit enforcement; Plate forwards the policy. Preserve this as an ownership/atomicity audit target, not a proven data corruption claim.|packages/plitejs/src/core/public-state.ts:6253
LOCAL-RUNTIME-API-TREESHAKING|supersede|plate.packaging|Package layout and entrypoints changed materially. The historical bundle probe is stale; repeat an equal-feature current consumer probe before recommending namespace deletion.|packages/platejs/src/core.tsx:1
LOCAL-MATH-CSS-BOUNDARY|reject|plate.math|The current package exposes math/katex.css and the source export trace resolves it as an asset. The old missing explicit CSS boundary premise is gone.|packages/platejs/package.json:1
LOCAL-MEDIA-KEYBOARD-RESIZE|reject|plate.resizable|ResizableHandle now exposes slider semantics, aria value attributes and arrow-key width updates. Keep exact keyboard/unit/cancellation tests as controls.|packages/platejs/src/react/features/resizable/Resizable.tsx:276
WG-DIFF-DOM-001|supersede|plite.dom-adapter|The current DOM bridge includes zero-width range mapping contracts. Verify the exact nested-wrapper invariant against current tests; do not copy the donor DOM architecture.|packages/plitejs/test/dom/bridge.ts:1518
WG-DIFF-GEOMETRY-001|supersede|plite.dom-coordinates|A canonical Chromium journey now tests consecutive soft-break lines and a trailing clickable break. This is a current proof replay requirement rather than an absent-test proposal.|apps/plite/tests/plite-browser/donor/examples/richtext.test.ts:968
WG-DIFF-HISTORY-001|supersede|plite.history|The current integrity corpus explicitly keeps extender-added edits in one isolated undo/redo batch. Preserve and rerun this guard.|packages/plitejs/test/history/integrity-contract.ts:163
WG-PROOF-004|reaffirm|proof.browser-host|The raw-device proof distinction still applies despite expanded desktop and viewport browser coverage.|apps/plite/playwright.config.ts:1
WG-VIEW-009|supersede|plite.input-runtime|Current runtime-before-input ownership replaces old paths. Exactly-once raw input/composition phase proof remains separate from headless and synthetic tests.|packages/plitejs/src/react/editable/runtime-before-input-events.ts:1
WG-VIEW-010B|supersede|plite.native-selection|Current view-bound selection routing replaces old caret ownership. Preserve the raw-device exactly-once selection proof obligation.|packages/plitejs/src/react/editable/selection-reconciler.ts:1
WG-VIEW-011|supersede|plite.clipboard|The current common runner exposes unsupported rich-HTML fixture cells and retains them. Reconcile the actual rich clipboard target rather than reuse the historical stale benchmark claim.|benchmarks/slate-v2/donor/browser/react/huge-document-cross-editor.mjs:1
PLITE-RUNTIME-001|reject|plite.public-contracts|NodeKey is branded and is a public NodeTarget. The former unbranded RuntimeId omission no longer describes the current API.|packages/plitejs/src/interfaces/editor.ts:327
PLITE-ANCHOR-001|supersede|plite.selection|Runtime node keys remain transient while mapped anchors/ranges own live text positions. Preserve the invariant in current annotation and identity consumers.|packages/plitejs/src/utils/node-keys.ts:5
PLATE-PERSISTED-ID-001|reject|plate.core-plugins|ElementIdPlugin owns explicit persisted element IDs and migration; runtime NodeKey remains separate. The former NodeIdPlugin blanket policy is not current source.|packages/platejs/src/lib/plugins/element-id/ElementIdPlugin.ts:22
SHARED-IDENTITY-POLICY-001|supersede|plite.document|Current runtime keys, mapped anchors and persisted element IDs have separate owners. Reaffirm the hard identity law while replacing the old all-in-one repair with consumer preservation proof.|packages/plitejs/src/utils/node-keys.ts:5
WG-FIND|supersede|plate.find|The current Find owner and Phase 3 complete-operation failures replace the prior generic P1 proposal; the next attempt must solve actual delivery and invalidation together.|docs/plans/2026-09-08-editor-performance-phase-3.md
WG-REACT|supersede|tooling.package-build|Compiler pairing was exercised in Phase 4; runtime advantage remains separate from eligible transformation counts and current consumer builds.|docs/plans/2026-09-08-editor-performance-phase-4.md
WG-FANOUT|supersede|plite.transactions|Phase 2 adopted specific locality cuts; retain only current remaining fanout attribution and exact callback/rerender counts.|docs/plans/2026-09-07-editor-performance-phase-2.md
PK-FIND|supersede|plate.find|ProseKit provides a search feature, but its presence does not solve current full Find delivery; prior generic proposal is narrowed by Phase 3 negative results.|packages/platejs/src/features/find/lib/BaseFindPlugin.ts:135
PK-REACT|supersede|plite.react-subscriptions|ProseKit derived-value hooks confirm observable snapshots; current Plite already protects committed selector identity. Compare precise mechanisms rather than transplant the mutable editor hook.|packages/plitejs/src/react/hooks/use-generic-selector.tsx:1
PK-FANOUT|supersede|plate.react-state|Current feature store notifications remain a conditional narrower experiment after earlier subscription reductions.|packages/platejs/src/react/stores/plate/usePluginStore.ts:144
PROSEKIT-NESTED-EDITABLE-2026-08-21|supersede|plite.multiview|Current private view-boundary ownership covers nested mounts and exact command context. Preserve exact nested-input replay instead of reviving obsolete donor adapter owners.|packages/plitejs/src/react/view-boundary-graph-core.ts:1
`
  .trim()
  .split('\n')
  .map((line) => {
    const [id, disposition, lane, reason, evidence] = line.split('|');
    return { id, disposition, lane, reason, evidence };
  });
const byId = new Map(
  dispositions.map((candidate) => [candidate.id, candidate])
);
if (byId.size !== dispositions.length) throw new Error('Duplicate disposition');
const expected = [
  ...queue.candidates.map((candidate) => ({
    id: candidate.id,
    title: candidate.title,
    aliases: candidate.aliases,
    sources: [{ queue: queuePath }],
  })),
  ...historical.values(),
];
const expectedIds = new Set(expected.map(({ id }) => id));
if (expectedIds.size !== expected.length)
  throw new Error('Duplicate prior identity across queue and material rows');
const missing = expected.filter(({ id }) => !byId.has(id));
const unknown = dispositions.filter(({ id }) => !expectedIds.has(id));
if (missing.length || unknown.length)
  throw new Error(JSON.stringify({ missing, unknown }));
const rows = expected.map((prior) => {
  const current = byId.get(prior.id);
  const sourcePath = current.evidence.replace(/:\d+$/, '').split('#')[0];
  readFileSync(resolve(root, sourcePath));
  return { ...prior, ...current };
});
const result = {
  capturedAt: new Date().toISOString(),
  method:
    'Prior candidates were read after independent current source accounting. Every previous queue ID and every material row reachable from the previous Wordgard/ProseKit manifests has one current disposition. This is a research disposition, not shipped closure.',
  previousQueueCount: queue.candidates.length,
  previousAliases: queue.candidates.flatMap(({ aliases }) => aliases),
  historicalMaterialCount: historical.size,
  expected: rows.length,
  missing: [],
  unknown: [],
  dispositions: Object.fromEntries(
    ['reaffirm', 'supersede', 'reject'].map((value) => [
      value,
      rows.filter((row) => row.disposition === value).map(({ id }) => id),
    ])
  ),
  rows,
};
writeFileSync(
  resolve(output, 'prior-candidate-reconciliation.json'),
  `${JSON.stringify(result, null, 2)}\n`
);
writeFileSync(
  resolve(output, 'prior-candidate-reconciliation.md'),
  [
    '# Prior candidate reconciliation',
    '',
    `${rows.length}/${rows.length} IDs: ${queue.candidates.length} previous experiment decisions and ${historical.size} historical material rows. The queue also preserves ${result.previousAliases.length} provenance aliases. No candidate is silently omitted.`,
    '',
    'Supersede replaces a stale scope, owner or premise; reject removes the obsolete proposal. Neither means an unrun behavioral proof passed. Research decisions do not close public issues.',
    '',
    '| ID | Current lane | Disposition | Current evidence and reason |',
    '| --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| \`${row.id}\` | ${row.lane} | ${row.disposition} | ${row.reason} [Evidence](${resolve(root, row.evidence)}). |`
    ),
    '',
  ].join('\n')
);
console.log(
  JSON.stringify({
    previousQueue: queue.candidates.length,
    historicalMaterial: historical.size,
    total: rows.length,
    counts: Object.fromEntries(
      Object.entries(result.dispositions).map(([key, ids]) => [key, ids.length])
    ),
  })
);
