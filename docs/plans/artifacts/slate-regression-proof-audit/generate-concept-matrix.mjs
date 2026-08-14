#!/usr/bin/env node

import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const artifactDir = dirname(fileURLToPath(import.meta.url));
const audit = '[audit](audit-report.md)';
const plateNA =
  'not-applicable — Plate product mapping is outside this regression-proof target; `docs/vision/plate.md:1`';
const priorNone = `none — ${audit} found no earlier durable decision for this atomic concept`;
const partial = (covers, missing, proof) =>
  `partial — covers=${covers}; missing=${missing}; proof=${proof}`;
const dim = (winner, reason, evidence) => `${winner} — ${reason}; ${evidence}`;
const disposition = (value, reason, evidence) =>
  `${value} — ${reason}; ${evidence}`;

const rows = [
  {
    id: 'SLATE-FIXTURE-001',
    concept: 'Fixture-driven model and transform regression corpus',
    origin: 'reference',
    reference: partial(
      'dynamic model and transform fixture discovery at `../slate-audit/packages/slate/test/index.js:1`',
      'fixture representation is private to Slate at `../slate-audit/packages/slate/test/support/fixtures.js:31`',
      '`docs/editor-test-harvester/slate/test-index.md:1` indexes runnable identities'
    ),
    plite: partial(
      'model and transform laws at `packages/plite/test/snapshot-contract.ts:1`',
      'no Slate JSX fixture runner at `packages/plite/package.json:1`',
      '`packages/plite/test/snapshot-contract.ts:1`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'equivalent',
        'both suites prove model and transform outcomes through different harnesses',
        '`docs/editor-test-harvester/slate/inventory.md:1`'
      ),
      dim(
        'different tradeoff',
        'Slate favors JSX fixtures while Plite favors typed transaction contracts',
        '`packages/plite/test/snapshot-contract.ts:1`'
      ),
      dim(
        'equivalent',
        'both exercise tree and selection state',
        '`../slate-audit/packages/slate/test/interfaces/Transforms:1`'
      ),
      dim(
        'Plite stronger',
        'local transaction owners keep behavior near runtime contracts',
        '`packages/plite/test/accessor-transaction.test.ts:1`'
      ),
      dim(
        'insufficient evidence',
        'no common fixture-runner benchmark was executed',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'different tradeoff',
        'Slate has more fixture files while Plite has more explicit host boundaries',
        '`docs/editor-test-harvester/slate/test-index.md:1`'
      ),
    ],
    classification: dim(
      'different tradeoff',
      'the portable laws matter but the fixture DSL does not',
      '`docs/editor-test-harvester/slate/report.md:1`'
    ),
    preferred: dim(
      'different tradeoff',
      'retain local contracts and use Slate as regression pressure',
      '`packages/plite/test/snapshot-contract.ts:1`'
    ),
    referenceAdaptation: disposition(
      'keep-local',
      'do not transplant the JSX runner',
      '`../slate-audit/packages/slate/test/support/fixtures.js:31`'
    ),
    localDebt: disposition(
      'none',
      'delta rows expose narrower gaps instead of a corpus-wide owner gap',
      '`docs/editor-issue-harvester/slate/matrix.md:1`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'current Plite proof commands remain authoritative',
      '`package.json:42`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'preserve local proof architecture',
      '`packages/plite/test/snapshot-contract.ts:1`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-DECORATION-001',
    concept: 'Async decoration updates preserve caret and composition',
    origin: 'shared',
    reference: partial(
      'async caret browser behavior at `../slate-audit/playwright/integration/examples/decorations-async.test.ts:14`',
      'no raw device claim at `../slate-audit/playwright/integration/examples/decorations-async.test.ts:1`',
      '`../slate-audit/playwright/integration/examples/decorations-async.test.ts:14`'
    ),
    plite: partial(
      'caret and composition rows at `apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:57`',
      'raw mobile composition at `apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:1`',
      '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:57`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'equivalent',
        'both keep async rerenders from moving the caret',
        '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:57`'
      ),
      dim(
        'Plite stronger',
        'local coverage names composition ownership as well as caret placement',
        '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:108`'
      ),
      dim(
        'equivalent',
        'decorations remain derived rendering data',
        '`../slate-audit/playwright/integration/examples/decorations-async.test.ts:8`'
      ),
      dim(
        'Plite stronger',
        'a dedicated donor browser row owns the local lifecycle',
        '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:1`'
      ),
      dim(
        'insufficient evidence',
        'neither suite publishes a rerender cost benchmark',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'equivalent',
        'both use browser-level assertions',
        '`../slate-audit/playwright/integration/examples/decorations-async.test.ts:14`'
      ),
    ],
    classification: dim(
      'equivalent',
      'the regression is already present in both browser suites',
      '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:57`'
    ),
    preferred: dim(
      'tie',
      'behavior matches and local proof stays local',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    referenceAdaptation: disposition(
      'keep-local',
      'no behavior transplant is needed',
      '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:57`'
    ),
    localDebt: disposition(
      'none',
      'exact local caret proof exists',
      '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:57`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'retain the local browser harness',
      '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:1`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'keep the current browser row',
      '`apps/plite/tests/plite-browser/donor/examples/decorations-async.test.ts:57`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-SELECTED-001',
    concept: 'Selected element removal is safe during unmount',
    origin: 'shared',
    reference: partial(
      'suppressed selected lookup at `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:214`',
      'Plite watched-path semantics at `../slate-audit/packages/slate-react/test/use-selected.spec.tsx:1`',
      '`../slate-audit/packages/slate-react/test/use-selected.spec.tsx:214`'
    ),
    plite: partial(
      'unmount and removed-path behavior at `packages/plite-react/test/use-element-selected.test.tsx:218`',
      'Slate hook identity at `packages/plite-react/test/use-element-selected.test.tsx:1`',
      '`packages/plite-react/test/use-element-selected.test.tsx:218`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'equivalent',
        'both return safely when the selected element disappears',
        '`packages/plite-react/test/use-element-selected.test.tsx:218`'
      ),
      dim(
        'different tradeoff',
        'Plite also exposes explicit watched paths',
        '`packages/plite-react/test/use-element-selected.test.tsx:279`'
      ),
      dim(
        'not-applicable',
        'selection-hook safety does not change document data',
        '`packages/plite-react/test/use-element-selected.test.tsx:218`'
      ),
      dim(
        'Plite stronger',
        'the local hook owns removal and cross-element watching',
        '`packages/plite-react/test/use-element-selected.test.tsx:279`'
      ),
      dim(
        'insufficient evidence',
        'render cost was not compared',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'equivalent',
        'both use React unit proof',
        '`../slate-audit/packages/slate-react/test/use-selected.spec.tsx:38`'
      ),
    ],
    classification: dim(
      'equivalent',
      'the removal law is exact',
      '`packages/plite-react/test/use-element-selected.test.tsx:218`'
    ),
    preferred: dim(
      'tie',
      'equivalent behavior requires no adoption',
      '`packages/plite-react/test/use-element-selected.test.tsx:218`'
    ),
    referenceAdaptation: disposition(
      'keep-local',
      'retain the local watched-path API',
      '`packages/plite-react/test/use-element-selected.test.tsx:279`'
    ),
    localDebt: disposition(
      'none',
      'exact assertions exist',
      '`packages/plite-react/test/use-element-selected.test.tsx:218`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'the local Vitest suite owns proof',
      '`packages/plite-react/package.json:13`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'no repair is needed',
      '`packages/plite-react/test/use-element-selected.test.tsx:218`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-GRAPHEME-001',
    concept: 'Indic conjunct clusters delete as one grapheme',
    origin: 'shared',
    reference: partial(
      'GB9c segmentation cases at `../slate-audit/packages/slate/test/utils/string.ts:100`',
      'host-specific delete routing at `../slate-audit/packages/slate/test/utils/string.ts:1`',
      '`../slate-audit/packages/slate/test/utils/string.ts:100`'
    ),
    plite: partial(
      'Tamil and Devanagari units at `packages/plite/test/text-units-contract.ts:25`',
      'raw browser IME deletion at `packages/plite/test/text-units-contract.ts:1`',
      '`packages/plite/test/text-units-contract.ts:25`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'equivalent',
        'both preserve Indic clusters',
        '`packages/plite/test/text-units-contract.ts:25`'
      ),
      dim(
        'Plite stronger',
        'the local API derives distances through one text-unit owner',
        '`packages/plite/src/text-units.ts:1`'
      ),
      dim(
        'equivalent',
        'both treat the sequence as text data',
        '`../slate-audit/packages/slate/test/utils/string.ts:100`'
      ),
      dim(
        'Plite stronger',
        'segmentation and deletion contracts share the Plite core owner',
        '`packages/plite/test/text-units-contract.ts:1`'
      ),
      dim(
        'insufficient evidence',
        'segmentation throughput was not compared',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'different tradeoff',
        'Slate asserts string segmentation while Plite also exercises editor deletion',
        '`packages/plite/test/text-units-contract.ts:25`'
      ),
    ],
    classification: dim(
      'equivalent',
      'GB9c behavior is already asserted locally',
      '`packages/plite/test/text-units-contract.ts:25`'
    ),
    preferred: dim(
      'tie',
      'both express the same Unicode law',
      '`../slate-audit/packages/slate/test/utils/string.ts:100`'
    ),
    referenceAdaptation: disposition(
      'keep-local',
      'Intl-backed local contracts remain the base',
      '`packages/plite/src/text-units.ts:1`'
    ),
    localDebt: disposition(
      'none',
      'Indic sequences are present',
      '`packages/plite/test/text-units-contract.ts:25`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'retain local deletion loops',
      '`packages/plite/test/text-units-contract.ts:1`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'no new grapheme row is needed',
      '`packages/plite/test/text-units-contract.ts:25`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-DOM-RESOLVE-001',
    concept: 'Recoverable DOM projection returns null while strict APIs throw',
    origin: 'shared',
    reference: partial(
      'suppressThrow DOM point conversion at `../slate-audit/packages/slate-dom/src/plugin/dom-editor.ts:694`',
      'separate strict-null proof at `../slate-audit/packages/slate-dom/src/plugin/dom-editor.ts:678`',
      '`../slate-audit/packages/slate-dom/src/plugin/dom-editor.ts:896`'
    ),
    plite: partial(
      'nullable and strict bridge behavior at `packages/plite-dom/test/bridge.ts:411`',
      'Slate boolean option shape at `packages/plite-dom/test/bridge.ts:1`',
      '`packages/plite-dom/test/bridge.ts:411`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'equivalent',
        'both distinguish recoverable gaps from strict misuse',
        '`packages/plite-dom/test/bridge.ts:411`'
      ),
      dim(
        'Plite stronger',
        'separate nullable and strict APIs avoid boolean-shaped return types',
        '`packages/plite-dom/test/bridge.ts:411`'
      ),
      dim(
        'not-applicable',
        'DOM resolution does not mutate editor data',
        '`packages/plite-dom/test/bridge.ts:411`'
      ),
      dim(
        'different tradeoff',
        'Slate owns conversion on DOMEditor while Plite owns it in the bridge',
        '`../slate-audit/packages/slate-dom/src/plugin/dom-editor.ts:678`'
      ),
      dim(
        'insufficient evidence',
        'resolver cost was not benchmarked',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'Plite stronger',
        'local proof asserts nullable and strict paths together',
        '`packages/plite-dom/test/bridge.ts:411`'
      ),
    ],
    classification: dim(
      'equivalent',
      'recoverable resolution semantics match',
      '`packages/plite-dom/test/bridge.ts:411`'
    ),
    preferred: dim(
      'tie',
      'behavior is equivalent despite API shape',
      '`../slate-audit/packages/slate-dom/src/plugin/dom-editor.ts:694`'
    ),
    referenceAdaptation: disposition(
      'keep-local',
      'preserve explicit bridge APIs',
      '`packages/plite-dom/test/bridge.ts:411`'
    ),
    localDebt: disposition(
      'none',
      'issue #3556 and PRs #6072 and #6080 map to current proof',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'local bridge test is exact',
      '`packages/plite-dom/test/bridge.ts:411`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'no resolver patch is needed',
      '`packages/plite-dom/test/bridge.ts:411`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-DEEP-ARRAY-001',
    concept: 'Nested arrays use recursive structural equality',
    origin: 'reference',
    reference: partial(
      'recursive arrays at `../slate-audit/packages/slate/src/utils/deep-equal.ts:12`',
      'non-JSON values at `../slate-audit/packages/slate/src/utils/deep-equal.ts:4`',
      '`../slate-audit/packages/slate/test/utils/deep-equal/deep-equals-with-array.js:1`'
    ),
    plite: partial(
      'primitive arrays at `packages/plite/src/utils/deep-equal.ts:23`',
      'recursive nested array members at `packages/plite/src/utils/deep-equal.ts:23`',
      '`packages/plite/src/utils/deep-equal.ts:14`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'reference stronger',
        'Slate recursively compares nested members while Plite uses member identity',
        '`../slate-audit/packages/slate/src/utils/deep-equal.ts:12`'
      ),
      dim(
        'equivalent',
        'both expose equality as an internal JSON-value utility',
        '`packages/plite/src/utils/deep-equal.ts:1`'
      ),
      dim(
        'reference stronger',
        'nested arrays are compared structurally upstream',
        '`../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equals-with-array.js:1`'
      ),
      dim(
        'different tradeoff',
        'both keep equality in core utilities',
        '`packages/plite/src/utils/deep-equal.ts:1`'
      ),
      dim(
        'insufficient evidence',
        'recursive cost was not benchmarked',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'reference stronger',
        'Slate has positive and negative nested-array fixtures',
        '`../slate-audit/packages/slate/test/utils/deep-equal/deep-equals-with-array.js:1`'
      ),
    ],
    classification: dim(
      'reference stronger',
      'the merged #6092 behavior is absent locally',
      '`packages/plite/src/utils/deep-equal.ts:23`'
    ),
    preferred: dim(
      'reference',
      'recursive JSON array semantics are the correct base',
      '`../slate-audit/packages/slate/src/utils/deep-equal.ts:12`'
    ),
    referenceAdaptation: disposition(
      'adapt',
      'port the recursive law without copying fixtures',
      '`../slate-audit/packages/slate/src/utils/deep-equal.ts:12`'
    ),
    localDebt: disposition(
      'material',
      'nested objects in arrays compare by identity',
      '`packages/plite/src/utils/deep-equal.ts:23`'
    ),
    proofAdaptation: disposition(
      'adapt',
      'add positive and negative nested-array contracts locally',
      '`../slate-audit/packages/slate/test/utils/deep-equal/deep-not-equals-with-array.js:1`'
    ),
    prior: priorNone,
    verdict: disposition(
      'rearchitect',
      'make the array branch recursive',
      '`packages/plite/src/utils/deep-equal.ts:23`'
    ),
    priority: 'P1',
  },
  {
    id: 'PLITE-HISTORY-001',
    concept: 'History cleanup rolls back when a callback throws',
    origin: 'Plite',
    reference: partial(
      'history callback modes at `../slate-audit/packages/slate-history/src/history-editor.ts:82`',
      'merged try-finally authority because PR #6063 is open at `docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`',
      '`../slate-audit/packages/slate-history/src/history-editor.ts:82`'
    ),
    plite: partial(
      'transaction rollback at `packages/plite-history/test/history-contract.ts:1294`',
      'Slate static helper names at `packages/plite-history/src/history-extension.ts:1`',
      '`packages/plite-history/test/history-contract.ts:1294`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'Plite stronger',
        'rollback is enforced transactionally instead of relying on helper cleanup',
        '`packages/plite-history/test/history-contract.ts:1294`'
      ),
      dim(
        'different tradeoff',
        'Slate exposes scoped static helpers while Plite exposes transaction History state',
        '`../slate-audit/packages/slate-history/src/history-editor.ts:82`'
      ),
      dim(
        'equivalent',
        'both protect undo and redo state',
        '`packages/plite-history/test/history-contract.ts:1294`'
      ),
      dim(
        'Plite stronger',
        'transaction rollback owns cleanup centrally',
        '`packages/plite-history/src/history-extension.ts:489`'
      ),
      dim(
        'insufficient evidence',
        'exception-path overhead was not measured',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'Plite stronger',
        'local proof throws mid-update and checks retained redo state',
        '`packages/plite-history/test/history-contract.ts:1294`'
      ),
    ],
    classification: dim(
      'Plite stronger',
      'transaction rollback subsumes open PR #6063',
      '`packages/plite-history/test/history-contract.ts:1294`'
    ),
    preferred: dim(
      'Plite',
      'central rollback is the governing base',
      '`packages/plite-history/src/history-extension.ts:489`'
    ),
    referenceAdaptation: disposition(
      'keep-local',
      'do not add Slate helper modes',
      '`packages/plite-history/src/history-extension.ts:489`'
    ),
    localDebt: disposition(
      'none',
      'rollback proof exists',
      '`packages/plite-history/test/history-contract.ts:1294`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'retain the throwing transaction test',
      '`packages/plite-history/test/history-contract.ts:1294`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'no History change is needed',
      '`packages/plite-history/test/history-contract.ts:1294`'
    ),
    priority: '—',
  },
  {
    id: 'PLITE-COMMAND-001',
    concept: 'Typed semantic commands own custom editor behavior',
    origin: 'Plite',
    reference: partial(
      'editor augmentation walkthrough at `../slate-audit/docs/walkthroughs/05-executing-commands.md:7`',
      'runtime helper and proof because PR #6091 is docs-only at `docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`',
      '`../slate-audit/docs/walkthroughs/05-executing-commands.md:148`'
    ),
    plite: partial(
      'typed descriptors at `packages/plite/src/core/command-definition.ts:73`',
      'Slate augmentation syntax at `packages/plite/src/core/command-definition.ts:1`',
      '`packages/plite/test/command-spec.test.ts:100`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'Plite stronger',
        'typed descriptors and routing have executable proof',
        '`packages/plite/test/command-spec.test.ts:100`'
      ),
      dim(
        'Plite stronger',
        'defineCommand owns identity and input inference',
        '`packages/plite/src/core/command-definition.ts:73`'
      ),
      dim(
        'not-applicable',
        'command transport does not prescribe document data',
        '`packages/plite/src/core/command-definition.ts:73`'
      ),
      dim(
        'Plite stronger',
        'extensions own handlers and lifecycle centrally',
        '`packages/plite/test/command-spec.test.ts:57`'
      ),
      dim(
        'insufficient evidence',
        'dispatch overhead was not compared with inline augmentation',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'Plite stronger',
        'generated chains and recursion have direct tests',
        '`packages/plite/test/command-spec.test.ts:181`'
      ),
    ],
    classification: dim(
      'Plite stronger',
      'the local command system subsumes the docs-only helper proposal',
      '`packages/plite/test/command-spec.test.ts:100`'
    ),
    preferred: dim(
      'Plite',
      'typed semantic commands are the current owner',
      '`packages/plite/src/core/command-definition.ts:73`'
    ),
    referenceAdaptation: disposition(
      'reject',
      'do not replace descriptors with ad hoc editor augmentation',
      '`../slate-audit/docs/walkthroughs/05-executing-commands.md:7`'
    ),
    localDebt: disposition(
      'none',
      'command laws are broadly tested',
      '`packages/plite/test/command-spec.test.ts:100`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'retain current command-spec proof',
      '`packages/plite/test/command-spec.test.ts:100`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'keep descriptor-owned commands',
      '`packages/plite/src/core/command-definition.ts:73`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-NODE-UNSET-001',
    concept: 'Property removal stays an explicit node mutation',
    origin: 'shared',
    reference: partial(
      'nullable `setNodes` plus explicit `unsetNodes` at `../slate-audit/packages/slate/src/interfaces/transforms/node.ts:86`',
      'one unambiguous public mutation because both spellings remain available at `../slate-audit/packages/slate/src/interfaces/transforms/node.ts:119`',
      '`../slate-audit/packages/slate/test/transforms/unsetNodes/operation-contents-check.tsx:1`'
    ),
    plite: partial(
      'separate typed `nodes.set` and `nodes.unset` at `packages/plite/src/interfaces/editor.ts:746`',
      'the internal null sentinel is intentionally hidden at `packages/plite/src/transforms-node/unset-nodes.ts:4`',
      '`packages/plite/test/primitive-method-runtime-contract.ts:420`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'equivalent',
        'both lower property removal to a canonical set-node operation without persisting null',
        '`../slate-audit/packages/slate/test/transforms/unsetNodes/operation-contents-check.tsx:9`'
      ),
      dim(
        'Plite stronger',
        'explicit `unset` keeps deletion out of the value domain of `set`',
        '`packages/plite/src/interfaces/editor.ts:791`'
      ),
      dim(
        'Plite stronger',
        'schema handles and inferred property keys preserve removal intent',
        '`packages/plite/src/interfaces/editor.ts:805`'
      ),
      dim(
        'Plite stronger',
        'one transaction owner resolves targets and schema handles before lowering',
        '`packages/plite/src/core/public-state.ts:3524`'
      ),
      dim(
        'insufficient evidence',
        'the syntax choice has no material runtime cost claim',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'Plite stronger',
        'runtime proof covers implicit targets while a production link consumer proves the split call shape',
        '`packages/link/src/lib/BaseLinkPlugin.ts:461`'
      ),
    ],
    classification: dim(
      'Plite stronger',
      'the local public surface expresses set and delete as different jobs',
      '`packages/plite/src/interfaces/editor.ts:791`'
    ),
    preferred: dim(
      'Plite',
      'keep explicit `nodes.set` and `nodes.unset`',
      '`packages/plite/src/interfaces/editor.ts:805`'
    ),
    referenceAdaptation: disposition(
      'reject',
      'do not widen set-value types with null-as-delete',
      '`docs/plans/artifacts/slate-regression-proof-audit/public-api-review.md#property-removal-pr-6083`'
    ),
    localDebt: disposition(
      'none',
      'current consumers already use the explicit split',
      '`packages/link/src/lib/BaseLinkPlugin.ts:461`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'retain target resolution and property-removal runtime contracts',
      '`packages/plite/test/primitive-method-runtime-contract.ts:420`'
    ),
    prior: priorNone,
    verdict: disposition(
      'reject',
      'the merged Slate type widening does not improve Plite',
      '`docs/plans/artifacts/slate-regression-proof-audit/public-api-review.md#property-removal-pr-6083`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-BATCHING-001',
    concept: 'One transaction publishes a mixed mutation batch atomically',
    origin: 'shared',
    reference: partial(
      'mutable batch proposals in closed PR #6039 and open PR #6050 at `docs/editor-issue-harvester/slate/full/classified-threads.json:1`',
      'merged upstream authority and a stable candidate implementation; `docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    plite: partial(
      'one synchronous transaction and commit owner at `packages/plite/src/core/public-state.ts:6666`',
      'a fair benchmark against the changing mutable proposal; `docs/editor-issue-harvester/slate/full/classified-threads.json:1`',
      '`benchmarks/slate-v2/donor/core/current/transaction-execution.mjs:1`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'Plite stronger',
        'current transactions already own atomicity, rollback, normalization, and one publication',
        '`packages/plite/src/core/public-state.ts:6666`'
      ),
      dim(
        'Plite stronger',
        'callers use one synchronous `editor.update` instead of selecting an apply engine',
        '`docs/vision/plite.md:58`'
      ),
      dim(
        'different tradeoff',
        'the unmerged proposals change mutation representation while Plite keeps canonical DocumentChange truth',
        '`VISION.md:129`'
      ),
      dim(
        'Plite stronger',
        'transaction finalization and commit publication remain one runtime owner',
        '`packages/plite/src/core/public-state.ts:6700`'
      ),
      dim(
        'Plite stronger',
        'fresh mixed-batch proof met median and p95 thresholds with one publication',
        '`docs/plans/artifacts/slate-regression-proof-audit/validation-receipt.json:1`'
      ),
      dim(
        'Plite stronger',
        'the registered local benchmark checks snapshot parity and one publication',
        '`benchmarks/targets/slate-v2.json:1`'
      ),
    ],
    classification: dim(
      'Plite stronger',
      'the current transaction owner has executable correctness and benchmark proof while the donor proposal has no stable authority',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    preferred: dim(
      'Plite',
      'retain canonical transactions with their current measured proof',
      '`packages/plite/src/core/public-state.ts:6666`'
    ),
    referenceAdaptation: disposition(
      'defer',
      'reconsider only from a stable benchmarked candidate rather than fork lineage',
      '`docs/plans/artifacts/slate-regression-proof-audit/audit-report.md#legacy-audit-recovery`'
    ),
    localDebt: disposition(
      'none',
      'the audit found no current correctness or measured performance failure in the transaction owner',
      '`benchmarks/targets/slate-v2.json:1`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'retain the transaction execution benchmark and correctness guard',
      '`packages/plite/test/core-benchmark-scripts-contract.ts:74`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'no layer plan is justified by unstable unmerged batching machinery',
      '`docs/plans/artifacts/slate-regression-proof-audit/planning-handoff.md#deferred-evidence-gates`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-SELECTION-ORIGIN-001',
    concept:
      'Queued native selectionchange cannot overwrite model-owned selection',
    origin: 'shared',
    reference: partial(
      'open issue #6086 describes queued Chrome selectionchange at `docs/editor-issue-harvester/slate/full/classified-threads.json:1`',
      'an upstream fix or executable test; `docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    plite: partial(
      'origin-aware import policy at `packages/plite-react/test/selection-controller-contract.ts:971`',
      'the exact upstream Chrome trace because the issue has no test; `docs/editor-issue-harvester/slate/full/classified-threads.json:1`',
      '`packages/plite-react/test/selection-controller-contract.ts:998`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'Plite stronger',
        'native imports are rejected while a programmatic model-owned selection is authoritative',
        '`packages/plite-react/test/selection-controller-contract.ts:998`'
      ),
      dim(
        'Plite stronger',
        'selection origin is explicit runtime policy instead of event-timing inference',
        '`packages/plite-react/test/selection-controller-contract.ts:971`'
      ),
      dim(
        'not-applicable',
        'the behavior changes selection ownership, not document data',
        '`packages/plite-react/test/selection-controller-contract.ts:971`'
      ),
      dim(
        'Plite stronger',
        'the input controller owns origin cleanup and the model-preference guard',
        '`packages/plite-react/test/selection-controller-contract.ts:998`'
      ),
      dim(
        'insufficient evidence',
        'event-policy overhead is not a material benchmark question',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'Plite stronger',
        'focused tests cover native-only import and model-owned collapsed selection',
        '`docs/plans/artifacts/slate-regression-proof-audit/validation-receipt.json:1`'
      ),
    ],
    classification: dim(
      'Plite stronger',
      'the open issue maps to an existing local ownership law and focused proof',
      '`packages/plite-react/test/selection-controller-contract.ts:971`'
    ),
    preferred: dim(
      'Plite',
      'keep the origin-aware selection controller',
      '`packages/plite-react/test/selection-controller-contract.ts:998`'
    ),
    referenceAdaptation: disposition(
      'keep-local',
      'track the upstream outcome without transplanting timing-specific logic',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    localDebt: disposition(
      'none',
      'the exact ownership guard is already tested',
      '`packages/plite-react/test/selection-controller-contract.ts:998`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'retain the focused origin and import-policy tests',
      '`packages/plite-react/test/selection-controller-contract.ts:971`'
    ),
    prior: priorNone,
    verdict: disposition(
      'keep',
      'no local selection-origin packet is justified',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-HYPERSCRIPT-REF-001',
    concept: 'Hyperscript fixtures expose live PointRef and RangeRef handles',
    origin: 'reference',
    reference: partial(
      'ref classes at `../slate-audit/packages/slate-hyperscript/src/refs.ts:8`',
      'runtime editor behavior at `../slate-audit/packages/slate-hyperscript/src/refs.ts:1`',
      '`../slate-audit/packages/slate-hyperscript/test/fixtures/point-ref.tsx:5`'
    ),
    plite:
      'absent — no PointRef or RangeRef hyperscript owner was found under `packages/plite-hyperscript`; inventory evidence at `docs/editor-test-harvester/slate/inventory.md:1`',
    plate: plateNA,
    dims: [
      dim(
        'reference stronger',
        'Slate can assert transformed live refs directly in fixtures',
        '`../slate-audit/packages/slate-hyperscript/test/fixtures/range-ref.tsx:9`'
      ),
      dim(
        'different tradeoff',
        'this is private test DSL ergonomics rather than product API',
        '`../slate-audit/packages/slate-hyperscript/src/refs.ts:8`'
      ),
      dim(
        'not-applicable',
        'refs observe positions without changing document representation',
        '`../slate-audit/packages/slate-hyperscript/src/refs.ts:8`'
      ),
      dim(
        'reference stronger',
        'Slate hyperscript owns construction and lifecycle',
        '`../slate-audit/packages/slate-hyperscript/src/index.ts:7`'
      ),
      dim(
        'insufficient evidence',
        'fixture authoring cost is unmeasured',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'reference stronger',
        'two dedicated fixtures prove point and range refs',
        '`../slate-audit/packages/slate-hyperscript/test/fixtures/point-ref.tsx:5`'
      ),
    ],
    classification: dim(
      'reference stronger',
      'the helper is absent locally',
      '`packages/plite-hyperscript/package.json:1`'
    ),
    preferred: dim(
      'reference',
      'the reference shape is the only proven fixture API',
      '`../slate-audit/packages/slate-hyperscript/src/refs.ts:8`'
    ),
    referenceAdaptation: disposition(
      'defer',
      'adopt only when a selected Plite test needs live-ref fixtures',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    localDebt: disposition(
      'non-material',
      'runtime behavior is unaffected',
      '`../slate-audit/packages/slate-hyperscript/src/refs.ts:8`'
    ),
    proofAdaptation: disposition(
      'defer',
      'no current Plite behavior row requires it',
      '`docs/editor-test-harvester/slate/report.md:1`'
    ),
    prior: priorNone,
    verdict: disposition(
      'defer',
      'leave with the Plite hyperscript owner',
      '`packages/plite-hyperscript/package.json:1`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-NATIVE-NOOP-001',
    concept: 'Native insertText no-op restores canonical DOM',
    origin: 'reference',
    reference: partial(
      'two browser scenarios recorded from hydrated PR #6084 at `docs/editor-issue-harvester/slate/full/classified-threads.json:1`',
      'merged authority because PR #6084 remains open at `docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    plite: partial(
      'adjacent native repair at `packages/plite-react/test/dom-repair-policy-contract.test.ts:1426`',
      'semantic no-op browser restoration at `packages/plite-react/test/dom-repair-policy-contract.test.ts:1`',
      '`packages/plite-react/test/dom-repair-policy-contract.test.ts:1426`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'insufficient evidence',
        'the open PR scenarios have not been reproduced against Plite',
        '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
      ),
      dim(
        'different tradeoff',
        'both route native input through private host machinery',
        '`packages/plite-react/test/input-router-contract.test.tsx:2241`'
      ),
      dim(
        'equivalent',
        'the intended model text remains unchanged',
        '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
      ),
      dim(
        'different tradeoff',
        'Slate patches Editable while Plite splits router and repair owners',
        '`packages/plite-react/test/dom-repair-policy-contract.test.ts:1`'
      ),
      dim(
        'insufficient evidence',
        'no common browser trace or timing exists',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'reference stronger',
        'only the open PR contains exact end-to-end scenarios',
        '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
      ),
    ],
    classification: dim(
      'insufficient evidence',
      'adjacent local contracts do not prove the no-op DOM outcome',
      '`packages/plite-react/test/dom-repair-policy-contract.test.ts:1426`'
    ),
    preferred: dim(
      'insufficient evidence',
      'reproduction must choose the correct owner',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    referenceAdaptation: disposition(
      'defer',
      'do not implement from an open PR before reproduction',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    localDebt: disposition(
      'insufficient evidence',
      'the exact behavior is untested locally',
      '`packages/plite-react/test/dom-repair-policy-contract.test.ts:1`'
    ),
    proofAdaptation: disposition(
      'defer',
      'first port only the scenario into the Plite browser harness',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    prior: priorNone,
    verdict: disposition(
      'defer',
      'needs focused browser reproduction',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-MOBILE-IME-001',
    concept:
      'Mobile predictive typing and composition require device-specific proof',
    origin: 'reference',
    reference: partial(
      'Firefox Android #5130 and emulated iPhone Chinese composition #5974 at `docs/editor-issue-harvester/slate/full/classified-threads.json:1`',
      'a merged current fix and reproducible real-device artifact for either report; `docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    plite: partial(
      'synthetic composition and Android manager contracts at `packages/plite-react/test/android-input-manager-contract.test.ts:1`',
      'Firefox Android and iOS hardware/IME proof; `docs/vision/common.md:25`',
      '`package.json:1`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'insufficient evidence',
        'the reports do not establish current Plite behavior on either named host',
        '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
      ),
      dim(
        'different tradeoff',
        'both implementations hide composition routing behind host input managers',
        '`packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts:137`'
      ),
      dim(
        'equivalent',
        'both intend to preserve the composed text and selection',
        '`packages/plite-react/test/android-input-manager-contract.test.ts:1`'
      ),
      dim(
        'different tradeoff',
        'browser and IME ownership varies by device and cannot be inferred from an emulator report',
        '`docs/vision/common.md:25`'
      ),
      dim(
        'insufficient evidence',
        'host timing and composition cost are unmeasured',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'insufficient evidence',
        'synthetic and viewport tests cannot satisfy a raw-device claim',
        '`VISION.md:48`'
      ),
    ],
    classification: dim(
      'insufficient evidence',
      'one issue is open and one closed without a merged fix or authoritative device proof',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    preferred: dim(
      'insufficient evidence',
      'device reproduction must select the behavior owner',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    referenceAdaptation: disposition(
      'defer',
      'do not copy workaround or emulator behavior into the runtime',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    localDebt: disposition(
      'insufficient evidence',
      'the named device/browser combinations remain unproved',
      '`package.json:1`'
    ),
    proofAdaptation: disposition(
      'defer',
      'run raw-device Firefox Android or iOS composition proof only when selected',
      '`docs/vision/common.md:25`'
    ),
    prior: priorNone,
    verdict: disposition(
      'defer',
      'keep both reports in the raw-device evidence queue',
      '`docs/plans/artifacts/slate-regression-proof-audit/planning-handoff.md#deferred-evidence-gates`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-ANDROID-IME-001',
    concept: 'Android IME first character survives an empty leaf',
    origin: 'reference',
    reference: partial(
      'open Android manager and string changes at `docs/editor-issue-harvester/slate/full/classified-threads.json:1`',
      'automated raw-device regression at `docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    plite: partial(
      'synthetic empty-state Android contracts at `packages/plite-react/test/model-input-strategy-contract.test.ts:706`',
      'real-device first-character proof at `packages/plite-react/test/android-input-manager-contract.test.ts:1`',
      '`packages/plite-react/test/android-input-manager-contract.test.ts:1138`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'insufficient evidence',
        'neither current side has raw-device proof for the open behavior',
        '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
      ),
      dim(
        'different tradeoff',
        'both hide Android state behind host managers',
        '`packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts:137`'
      ),
      dim(
        'equivalent',
        'both intend to insert the first text into an empty leaf',
        '`packages/plite-react/test/model-input-strategy-contract.test.ts:706`'
      ),
      dim(
        'different tradeoff',
        'placeholder rendering and manager lifecycle are split differently',
        '`packages/plite-react/src/components/editable.tsx:743`'
      ),
      dim(
        'insufficient evidence',
        'device composition timing is unmeasured',
        '`docs/editor-test-harvester/slate/report.md:1`'
      ),
      dim(
        'insufficient evidence',
        'synthetic events cannot satisfy the raw-device gate',
        '`package.json:1`'
      ),
    ],
    classification: dim(
      'insufficient evidence',
      'open source changes and synthetic tests do not prove Android IME behavior',
      '`docs/editor-issue-harvester/slate/full/issue-closure-ledger.md:1`'
    ),
    preferred: dim(
      'insufficient evidence',
      'real-device reproduction must precede design selection',
      '`packages/plite-react/test/android-input-manager-contract.test.ts:1`'
    ),
    referenceAdaptation: disposition(
      'defer',
      'do not copy the open patch without device proof',
      '`docs/editor-issue-harvester/slate/full/classified-threads.json:1`'
    ),
    localDebt: disposition(
      'insufficient evidence',
      'raw-device behavior is unknown',
      '`packages/plite-react/test/android-input-manager-contract.test.ts:1`'
    ),
    proofAdaptation: disposition(
      'defer',
      'use the repository raw-device command',
      '`package.json:1`'
    ),
    prior: priorNone,
    verdict: disposition(
      'defer',
      'needs real Android IME proof',
      '`docs/editor-test-harvester/slate/report.md:1`'
    ),
    priority: '—',
  },
  {
    id: 'SLATE-PROVENANCE-001',
    concept: 'Fork-specific legacy audit is separate from upstream cursor',
    origin: 'shared',
    reference: partial(
      'legacy 1120-file hash evidence in `docs/plans/artifacts/slate-regression-proof-audit/audit-report.md:1`',
      'unique commit identity because two fork commits share the file set at `docs/plans/artifacts/slate-regression-proof-audit/audit-report.md:1`',
      '`docs/editor-test-harvester/slate/inventory.md:1`'
    ),
    plite: partial(
      'current upstream registration at `docs/editor-audits/index.json:1`',
      'legacy fork cursor authority at `docs/editor-audits/index.json:1`',
      '`docs/plans/artifacts/slate-regression-proof-audit/audit-report.md:1`'
    ),
    plate: plateNA,
    dims: [
      dim(
        'equivalent',
        'both historical and current evidence are retained without conflating authority',
        '`docs/plans/artifacts/slate-regression-proof-audit/audit-report.md:1`'
      ),
      dim(
        'not-applicable',
        'cursor provenance is not a public editor API',
        '`docs/editor-audits/index.json:1`'
      ),
      dim(
        'not-applicable',
        'no editor data changes',
        '`docs/editor-audits/index.json:1`'
      ),
      dim(
        'Plite stronger',
        'the repaired registry names independent source test and tracker cursors',
        '`docs/editor-audits/index.json:1`'
      ),
      dim(
        'not-applicable',
        'provenance has no runtime path',
        '`docs/plans/artifacts/slate-regression-proof-audit/audit-report.md:1`'
      ),
      dim(
        'Plite stronger',
        'the current audit has strict matrix and closure ledgers',
        '`docs/plans/artifacts/slate-regression-proof-audit/concept-manifest.json:1`'
      ),
    ],
    classification: dim(
      'different tradeoff',
      'legacy fork evidence and current upstream proof answer different questions',
      '`docs/plans/artifacts/slate-regression-proof-audit/audit-report.md:1`'
    ),
    preferred: dim(
      'different tradeoff',
      'retain history but register only current upstream authority',
      '`docs/editor-audits/index.json:1`'
    ),
    referenceAdaptation: disposition(
      'keep-local',
      'preserve the legacy hash as provenance only',
      '`docs/plans/artifacts/slate-regression-proof-audit/audit-report.md:1`'
    ),
    localDebt: disposition(
      'none',
      'the repaired row separates all cursors',
      '`docs/editor-audits/index.json:1`'
    ),
    proofAdaptation: disposition(
      'keep-local',
      'keep current upstream inventory and tracker ledger',
      '`docs/editor-test-harvester/slate/inventory.md:1`'
    ),
    prior:
      '`LEGACY-SLATE-1120` supersede — the fork file set is preserved but cannot own upstream main; [legacy recovery](audit-report.md#legacy-audit-recovery)',
    verdict: disposition(
      'keep',
      'keep the current upstream registration and legacy note',
      '`docs/editor-audits/index.json:1`'
    ),
    priority: '—',
  },
];

const headers = [
  'ID',
  'Concept',
  'Origin',
  'Reference mapping',
  'Plite mapping',
  'Plate mapping',
  'Correctness',
  'API/types',
  'Data/collab',
  'Ownership/lifecycle',
  'Runtime/perf',
  'Proof/host',
  'Classification',
  'Preferred base',
  'Reference adaptation',
  'Local debt',
  'Proof adaptation',
  'Prior candidates',
  'Verdict',
  'Priority',
];
const values = (row) => [
  `\`${row.id}\``,
  row.concept,
  row.origin,
  row.reference,
  row.plite,
  row.plate,
  ...row.dims,
  row.classification,
  row.preferred,
  row.referenceAdaptation,
  row.localDebt,
  row.proofAdaptation,
  row.prior,
  row.verdict,
  row.priority,
];
const lines = [
  '# Slate regression-proof atomic concept matrix',
  '',
  'Frozen Slate source: `ec793483ada7f7e21ebc82c2b3aa9ea674605ce3`. This matrix is intentionally limited to regression-proof architecture and changed upstream behavior; it is not a full editor API comparison.',
  '',
  `| ${headers.join(' | ')} |`,
  `| ${headers.map(() => '---').join(' | ')} |`,
  ...rows.map((row) => `| ${values(row).join(' | ')} |`),
  '',
];

writeFileSync(resolve(artifactDir, 'concept-matrix.md'), lines.join('\n'));
process.stdout.write(`${rows.length}\n`);
