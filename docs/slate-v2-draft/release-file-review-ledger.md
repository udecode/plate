---
date: 2026-04-08
topic: slate-v2-release-file-review-ledger
---

# Slate v2 Release File Review Ledger

## Purpose

File-level review ledger for the `slate-v2` release program.

This is now the single live human control ledger for legacy-file closure truth.

The exact 1:1 legacy-file ledgers live under
[docs/slate-v2/ledgers/](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/README.md).

External closeout docs may still exist as historical batch notes, but this file
should be enough to answer:

- where did a legacy file or deleted family go?
- was it recovered, mirrored, adapted, or explicitly skipped?
- which current proof owner carries the surviving value?

Update it:

1. at Ralph batch exit
2. at roadmap reconsolidation milestones
3. when proof ownership changes
4. at `True Slate RC` judgment

Disposition key:

- `preserved`
- `adapted`
- `created`
- `restored`
- `replaced`
- `explicitly dropped`

In this file, `proof owner` means the primary proof document or proof surface
that currently carries the claim. It does **not** mean the person or lane that
executes the proof work.

## Exact Ledgers

For the 1:1 exact-path ledgers, use:

- [legacy-slate-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-test-files.md)
- [legacy-slate-react-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-react-test-files.md)
- [legacy-slate-history-test-files.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-slate-history-test-files.md)
- [legacy-playwright-example-tests.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-playwright-example-tests.md)

Hard read:

- this file is the control ledger
- the files above are the exhaustive exact ledgers
- if the exact ledgers say `needs-triage`, the no-regression story is still
  incomplete even if this control ledger says `closed`

## Reopened Browser / Input Parity Lane

As of 2026-04-11, the older “closed” / “better-cut” shorthand for this family
is no longer enough.

The browser/input zero-regression proof truth is now governed by:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

Until that ledger closes:

- prior `better-cut` notes for deleted `restore-dom` and Android helpers do
  **not** count as final parity closure
- prior broad “deleted family closed” language for browser/input behavior does
  **not** count as final parity closure

Reopened rows:

- [x] `packages/slate-react/src/components/editable.tsx` legacy vs current
- [x] `packages/slate-react/src/components/restore-dom/**`
- [x] `packages/slate-react/src/hooks/android-input-manager/**`
- [x] `packages/slate-react/src/plugin/react-editor.ts`
- [x] `packages/slate-dom/src/bridge.ts`
- [x] `playwright/integration/examples/*ime*.test.ts`
- [x] platform parity rows for real Android, iOS Safari / WebKit, and Firefox

Execution order for the reopened lane now lives in:

- [2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-12-slate-v2-zero-regression-parity-reconsolidated-plan.md)

Current reclose read:

- `packages/slate-react/src/components/restore-dom/**` is no longer an open
  standalone blocker family; see the consolidated browser/input legacy family
  matrix below and
  [2026-04-12-restore-dom-was-a-rerender-era-guard-not-a-current-v2-runtime-need.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-12-restore-dom-was-a-rerender-era-guard-not-a-current-v2-runtime-need.md)
- `packages/slate-react/src/components/editable.tsx` is reviewed as the current
  runtime owner for structural key handling, Firefox guards, drag cleanup, and
  shared input/hotkey behavior; specialist browser rows do not close source or
  contract drift in this file by themselves
- deleted `packages/slate-react/src/hooks/android-input-manager/**` is not a
  blanket better-cut; it only stops being debt when the surviving shared input
  surface proves full relied-on parity or an explicit engine-rewrite exception
  is recorded
- `packages/slate-react/src/plugin/react-editor.ts`, `packages/slate-dom/src/bridge.ts`,
  and the current `*ime*.test.ts` browser lanes are now the active proof owners
  rather than reopened unknowns; they stay covered through the live parity
  rows in
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- platform parity rows are now explicitly classified:
  Firefox is locally closed, Android structural/browser rows are locally closed,
  and the remaining Android keyboard-feature plus broader iOS rows are explicit
  external/tooling evidence lanes rather than bare reopened unknowns

## POC RC Groundwork Already Classified

- [x] `docs/slate-v2/overview.md` — disposition: adapted | release relevance: high | proof owner: `master-roadmap.md` | docs owner: `docs/slate-v2` | maintainer note: front door routes readers into the canonical stack
- [x] `docs/slate-v2/release-readiness-decision.md` — disposition: adapted | release relevance: high | proof owner: `replacement-gates-scoreboard.md` | docs owner: `docs/slate-v2` | maintainer note: live stop/go verdict still owns the current recommendation
- [x] `docs/slate-v2/replacement-family-ledger.md` — disposition: adapted | release relevance: high | proof owner: `replacement-candidate.md` | docs owner: `docs/slate-v2` | maintainer note: current family truth is explicit and no longer buried in phase notes
- [x] `docs/slate-v2/replacement-gates-scoreboard.md` — disposition: adapted | release relevance: high | proof owner: `replacement-gate-local.sh` | docs owner: `docs/slate-v2` | maintainer note: current evidence board is explicit and lane-by-lane
- [x] `docs/slate-v2/archive/oracle-harvest-ledger.md` — disposition: adapted | release relevance: high | proof owner: `snapshot-contract.ts` | docs owner: `docs/slate-v2` | maintainer note: core oracle work is scoped to the current claim instead of pretending to be the whole backlog
- [x] `docs/slate-v2/master-roadmap.md` — disposition: replaced | release relevance: high | proof owner: `2026-04-08-slate-v2-true-slate-rc-roadmap-consensus-plan.md` | docs owner: `docs/slate-v2` | maintainer note: roadmap now owns the linear path instead of a frozen Target A/Target B ladder
- [x] `docs/slate-v2/release-file-review-ledger.md` — disposition: replaced | release relevance: high | proof owner: `docs/slate-v2/pr-description.md` | docs owner: `docs/slate-v2` | maintainer note: granular review stays durable and file-granular
- [x] `docs/slate-v2/pr-description.md` — disposition: created | release relevance: high | proof owner: `master-roadmap.md` | docs owner: `docs/slate-v2` | maintainer note: maintainers still get a short read instead of raw diff archaeology
- [x] `../slate-v2/Readme.md` — disposition: adapted | release relevance: high | proof owner: `release-readiness-decision.md` | docs owner: `../slate-v2` | maintainer note: repo front door still reflects the live verdict
- [x] `../slate-v2/docs/general/replacement-candidate.md` — disposition: adapted | release relevance: high | proof owner: `replacement-family-ledger.md` | docs owner: `../slate-v2/docs/general` | maintainer note: repo-local envelope stays aligned with the live docs

## True Slate RC Recovery Buckets

- [x] extension model / behavior interception — release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `docs/slate-v2` | maintainer note: the current instance-method plus transaction-boundary extension model is now closed by direct headless proof over the representative wrapper ports, history composition over the real `withLinks` / `withMentions` wrappers, React runtime composition over the real `withLinks` / `withMentions` wrappers plus a same-seam forced-layout harness, and browser proof across `forced-layout`, `links`, and `mentions`
- [x] schema / normalization extensibility — release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `docs/slate-v2` | maintainer note: the current default-vs-explicit normalization model is now closed by a strengthened `normalization-contract.ts` owner file, direct proof over app-owned schema normalization through the real `withForcedLayout` wrapper and descendant rewrites, and guard proof across range refs, clipboard, runtime, and the live-shape register; broader blanket legacy built-in coercion remains an explicit non-claim, not an open hidden gap
- [x] non-React / headless core usability — release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `docs/slate-v2` | maintainer note: direct headless composition is now closed by a dedicated `headless-contract.ts` owner file, package-name-import proof across `slate`, `slate-history`, and `slate-hyperscript`, and docs/readmes that show a real non-React entry path without pretending the package split should collapse
- [x] operation-history-collaboration integrity — release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `docs/slate-v2` | maintainer note: the local operation/history substrate is now closed by a dedicated `integrity-contract.ts` owner file, direct proof tying operation records to saved history batches and reentrant commit ordering, and a docs truth pass that marks external `slate-yjs` integration as external instead of pretending `slate-v2` ships its own multiplayer layer
- [ ] broad API / public surface reconciliation — release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `docs/slate-v2` | maintainer note: the package matrix is still useful, but the lane is reopened under challenge because supposedly mirrored API rows can still hide narrower accepted arguments or option bags; the first exposed `Editor.before(...)` / `Editor.after(...)` `voids: true` and `nonSelectable` family is now recovered, which proves the audit needed to reopen the lane in the first place; exhaustive per-API contract-width audit is still required before this bucket can close again
- [x] major file/test deletion review — release relevance: high | proof owner: `release-file-review-ledger.md` | docs owner: `docs/slate-v2` | maintainer note: the core `packages/slate/test/**`, full `packages/slate-react/**`, full `packages/slate-history/**`, `playwright/integration/examples/**`, and the last example residue `site/examples/ts/custom-types.d.ts` are now explicitly closed or explicit skip; deletion review no longer blocks `True Slate RC`

## Package-Level Deletion Closure Trees

- [x] `packages/slate/test/**` — release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: deleted core test-family bucket is explicitly closed here through the consolidated core test-family matrix below; the deleted corpus is mapped to recovered proof or explicit skip instead of living as an unclassified blocker
- [x] `packages/slate-react/**` — release relevance: high | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-react` | maintainer note: package parent now closes because `test/**` is closed, `src/**` is closed, and package-root residue is explicit skip
- [x] `packages/slate-react/test/**` — release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/test` | maintainer note: deleted test-family bucket remains explicitly closed
- [x] `packages/slate-react/src/**` — release relevance: high | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: deleted source-family bucket is explicitly closed here through the package-level trees plus the `packages/slate-react/src` recovery rows below
- [x] `packages/slate-react/src/chunking/**` — release relevance: medium | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src/chunking` | maintainer note: deleted chunking internals are an explicit better-cut; semantic islands and selector-local invalidation are the actual v2 direction
- [x] `packages/slate-react/src/components/restore-dom/**` — release relevance: medium | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src/components/restore-dom` | maintainer note: deleted restore-dom helpers are an explicit better-cut because the mounted bridge plus current `Editable` owns the live seam
- [x] `packages/slate-react/src/hooks/android-input-manager/**` — release relevance: medium | proof owner: `docs/slate-browser/proof-lane-matrix.md` | docs owner: `../slate-v2/packages/slate-react/src/hooks/android-input-manager` | maintainer note: deleted Android-only helpers are not automatically a better-cut; specialist browser lanes are secondary proof only, and the surviving shared input surface still needs same-path parity or an explicit engine-rewrite exception
- [x] remaining deleted `packages/slate-react/src/hooks/*` files — release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src/hooks` | maintainer note: the old split public hooks are now mirrored by the current `.tsx` hook surface, while old decorate/android/rollback glue is explicitly cut elsewhere
- [x] remaining deleted `packages/slate-react/src/components/*` files — release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src/components` | maintainer note: the old primitive component split is now mirrored by the current `slate-*` and text primitives, while chunk-tree and restore-dom internals are explicitly cut elsewhere
- [x] `packages/slate-react/src/utils/environment.ts` — release relevance: low | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src/utils` | maintainer note: deleted single-file residue is explicit skip, not live package proof
- [x] `packages/slate-react/src/custom-types.ts` — release relevance: low | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: deleted declaration-merging helper is explicit skip under the current structural typing contract
- [x] `packages/slate-react/src/@types/direction.d.ts` — release relevance: low | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src/@types` | maintainer note: deleted single-file type residue is explicit skip
- [x] `packages/slate-react/CHANGELOG.md` — release relevance: low | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-react` | maintainer note: deleted package-root changelog is explicit skip, not release-proof
- [x] `packages/slate-history/**` — release relevance: high | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-history` | maintainer note: package parent closes because `test/**` is closed in the consolidated history test-family matrix below, `src/history.ts` is adapted in the recovery rows below, and package-root changelog residue is explicit skip here
- [x] `packages/slate-history/test/**` — release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-history/test` | maintainer note: deleted test-family bucket is explicitly closed here through the consolidated history test-family matrix below
- [x] `packages/slate-history/src/history.ts` — release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-history/src` | maintainer note: this is a live adapted file, not a current deleted-source hole; `History` / `HistoryBatch` are already restored and proved on the current package surface
- [x] `packages/slate-history/CHANGELOG.md` — release relevance: low | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/packages/slate-history` | maintainer note: deleted package-root changelog is an explicit skip here, not a live package proof

## Supporting Example / Browser Deletion Trees

Hard read:

- deletion closure here does **not** mean example parity is closed
- example parity is now owned by
  [2026-04-15-slate-v2-example-parity-recovery-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-15-slate-v2-example-parity-recovery-plan.md)
  and
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

- [x] `playwright/integration/examples/**` — release relevance: medium | proof owner: `docs/slate-browser/proof-lane-matrix.md` | docs owner: `../slate-v2/playwright/integration/examples` | maintainer note: deleted Playwright family is explicitly closed here through the consolidated example-test matrix below; this closes deleted-file accounting only, not the reopened maximum-parity example lane
- [x] `site/examples/ts/**` — release relevance: low | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/site/examples/ts` | maintainer note: example TypeScript deletion residue is closed here because `custom-types.d.ts` is an explicit skip; this does not close legacy/current example parity
- [x] `site/examples/ts/custom-types.d.ts` — release relevance: low | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/site/examples/ts` | maintainer note: deleted declaration-merging file is an explicit skip here under the current structural typing contract
- [x] `site/examples/js/**` — release relevance: low | proof owner: `release-file-review-ledger.md` | docs owner: `../slate-v2/site/examples` | maintainer note: the handwritten JS mirror lane is an explicit better-cut; `site/examples/ts/**` is now the only maintained example source of truth

## Consolidated Deleted Test-Family Matrices

### Core Deleted `packages/slate/test/**` Family

| Family | Deleted count | Current disposition | Current owner |
| --- | ---: | --- | --- |
| `interfaces/**` | `576` | direct legacy fixture proof now owns the mirrored rows; `CustomTypes` declaration merging has been recovered on the package type surface and the old explicit-skip notes are stale | `legacy-interfaces-fixtures.ts`, `packages/slate/type-tests/custom-types/usage.tsx` |
| `transforms/**` | `408` | direct legacy transform audit is green again; remaining transform debt is the explicit-skip matrix only | `legacy-transforms-fixtures.ts`, `transforms-contract.ts`, `clipboard-contract.ts` |
| `operations/**` | `31` | raw operation seam is directly recovered and explicit skips are named | `operations-contract.ts` |
| `normalization/**` | `20` | current default-vs-explicit normalization split mirrors the deleted rows | `normalization-contract.ts` |
| `utils/**` + root `index.js` + `jsx.d.ts` | `13` | surviving string-unit value is mirrored; helper/harness residue is explicit skip | `text-units-contract.ts` |

Core totals:

- reconciled deleted paths: `1048`
- status: `closed`

### Deleted `packages/slate-react/test/**` Family

| Deleted file | Current claim cluster | Status | Current proof owner | Resolution |
| --- | --- | --- | --- | --- |
| `use-slate-selector.spec.tsx` | selector equality + selector identity swap | `mirrored now` | `provider-hooks-contract.tsx` | current provider-hook proof covers referential stability and selector replacement |
| `use-slate.spec.tsx` | provider editor + version counter exposure | `mirrored now` | `provider-hooks-contract.tsx` | current provider-hook proof covers `useSlateWithV` and hook-surface editor exposure |
| `react-editor.spec.tsx` | mounted window + helper surface | `mirrored now` | `react-editor-contract.tsx` | current mounted-bridge proof covers helper/window behavior |
| `react-editor.spec.tsx` | `ReactEditor.focus` null-selection init, mid-transform safety, no `onValueChange` | `recovered now` | `surface-contract.tsx` | direct proof covers the deleted focus rows on the live mounted bridge |
| `editable.spec.tsx` | callback partition | `mirrored now` | `editable-behavior.tsx` | current editable behavior proof covers `onChange` / `onSelectionChange` / `onValueChange` partition |
| `editable.spec.tsx` | low-level `Editable` translate policy | `recovered now` | `surface-contract.tsx` | source and direct proof restore default `translate="no"` plus override |
| `editable.spec.tsx` | structured split/merge mount identity | `recovered now` | `surface-contract.tsx` | direct proof covers stable element mounts on the current structured surface |
| `use-selected.spec.tsx` | selection-overlap rerender | `mirrored now` | `provider-hooks-contract.tsx` | current hook proof covers selection switching |
| `use-selected.spec.tsx` | path-rebasing stability after structural edits | `recovered now` | `surface-contract.tsx` | direct proof covers the selected element staying selected after path shift |
| `use-selected.spec.tsx` | chunking-specific branch | `explicit skip` | none | dead chunking architecture, not current contributor-facing proof |
| `decorations.spec.tsx` | render-leaf split metadata + projection-local decoration behavior | `mirrored now` | `primitives-contract.tsx`, `projections-and-selection-contract.tsx` | current primitive and projection proofs cover the surviving projection-driven renderer value |
| `decorations.spec.tsx` | exact old `decorate` API parity plus chunking-specific redecorate semantics | `explicit skip` | none | current package is projection-first; reviving `decorate` and its chunking-era redecorate behavior would widen the contract |
| `chunking.spec.ts` | internal chunk-tree reconcile logic | `explicit skip` | none | dead internal architecture, not current contributor-facing proof |
| `tsconfig.json` | test-local harness config | `explicit skip` | none | no current value in reviving a deleted test-local tsconfig |

Slate React deleted test-family totals:

- `mirrored now`: `5`
- `recovered now`: `4`
- `explicit skip`: `4`
- status: `closed`

### Deleted `packages/slate-history/test/**` Family

| Deleted file / cluster | Deleted count | Status | Current proof owner | Resolution |
| --- | ---: | --- | --- | --- |
| harness files (`test/index.js`, `test/jsx.d.ts`) | `2` | `explicit skip` | `history-contract.ts` | fixture harness files add no current contributor-facing value |
| `test/isHistory/*` | `4` | `recovered now` | `history-contract.ts` | direct proof keeps `History.isHistory(...)` true before edits and across undo/redo |
| `test/undo/cursor/keep_after_focus_and_remove_text_undo.js` | `1` | `recovered now` | `history-contract.ts` | direct proof restores the saved expanded selection after delete, blur, refocus, and undo |
| `test/undo/delete_backward/block-join-reverse.tsx`, `block-nested-reverse.tsx`, `block-text.tsx` | `3` | `recovered now` | `history-contract.ts` | direct proof restores reverse block joins, reverse nested block joins, and reverse same-text deletes |
| `test/undo/delete_backward/custom-prop.tsx` | `1` | `recovered now` | `history-contract.ts` | direct undo proof now covers the legacy cross-block custom-prop delete row |
| `test/undo/delete_backward/inline-across.tsx` | `1` | `recovered now` | `history-contract.ts` | direct undo proof now covers the legacy cross-inline delete row |
| `test/undo/insert_break/basic.tsx` | `1` | `recovered now` | `history-contract.ts` | direct proof restores `insertBreak()` commits |
| `test/undo/insert_fragment/basic.tsx` | `1` | `recovered now` | `history-contract.ts`, `clipboard-contract.ts` | single-descendant fragment undo now passes on the live insertFragment seam |
| `test/undo/insert_text/basic.tsx` | `1` | `recovered now` | `history-contract.ts` | direct proof restores a plain `insertText(...)` commit |
| `test/undo/insert_text/contiguous.tsx` | `1` | `recovered now` | `history-contract.ts` | contiguous insertText undo now restores the original selection on the live history seam |
| `test/undo/insert_text/non-contiguous.tsx` | `1` | `explicit skip` | `history-contract.ts` | timing-based auto-merge heuristics are not the live contract |

Slate History deleted test-family totals:

- `recovered now`: `14`
- `explicit skip`: `3`
- reconciled deleted test paths: `17`
- status: `closed`

### Deleted Playwright Example-Test Family

| Deleted file | Status | Current proof owner / replacement | Resolution |
| --- | --- | --- | --- |
| `playwright/integration/examples/select.test.ts` | `recovered now` | `richtext.test.ts`, `proof-lane-matrix.md`, `yarn test:slate-browser:e2e:local` | direct browser proof covers the live triple-click paragraph-selection intent on the current richtext surface |
| `playwright/integration/examples/huge-document.test.ts` | `explicit skip` | `chunking-review.md`, `replacement-gates-scoreboard.md`, `yarn bench:replacement:huge-document:local` | the deleted test asserted old chunking internals; the live owner is the benchmark lane |

Playwright example-test totals:

- `recovered now`: `1`
- `explicit skip`: `1`
- status: `closed`

## Consolidated Browser / Input Legacy Family Matrices

### Deleted `restore-dom` Legacy Family

| Legacy behavior | Legacy mechanism | Current read | Classification | Current owner / gap |
| --- | --- | --- | --- | --- |
| buffer browser mutations only during real user input | `receivedUserInput` gate | current runtime does not use the same pre-commit DOM replay lifecycle | `justified-omission` | non-current lifecycle guard |
| restore removed/added DOM nodes before React commit | mutation observer + `getSnapshotBeforeUpdate` | current runtime owns direct DOM commit on `input` / `compositionend` instead of pre-commit DOM replay | `justified-omission` | superseded by current root-owned DOM commit plus direct behavior rows |
| ignore `characterData` mutation restore during composition | explicit skip in restore manager | main IME rows are green on the behavior-bearing current surfaces without this family | `covered-by-current-proof` | current IME proof lanes own this user-visible behavior |
| Android-only activation of the restore-dom wrapper | `IS_ANDROID` guard | current Android rows are green on placeholder, no-FEFF placeholder, inline-edge, void-edge, and split/join without this wrapper | `covered-by-current-proof` | current Android proof already covers the visible behavior |
| restore before update, clear after update, then resume observation | class lifecycle contract | current runtime no longer depends on that rerender-era lifecycle | `justified-omission` | old lifecycle shape is not the current architecture contract |

Restore-dom closure read:

- behavior rows are covered on current proof surfaces
- rerender-era mutation replay is explicitly non-current

### Legacy Android Manual Case Classification

| Legacy case | Legacy intent | Current read | Classification | Current proof / gap |
| --- | --- | --- | --- | --- |
| `split-join` | enter/backspace around formatting boundaries | direct Android proof row is green, and the matching desktop Chromium row is green | `directly-proved` | `android-split-join.tsx`, `android-split-join.test.ts`, `pnpm proof:appium:android:split-join:local` |
| `insert` | tap typing, glide typing, voice input, any IME words | ordinary insertion intent is covered by the green placeholder / no-FEFF / inline-edge / void-edge rows | `partially-covered / tooling-blocked remainder` | direct green rows cover ordinary typing; glide and voice still need external or alternate-transport evidence |
| `special` | cursor-in-word enter, repeated space/backspace, punctuation/caps edge | structural subcases are green on both Chromium and direct Android | `directly-proved` | `android-special-structural.tsx`, `android-special-structural.test.ts` |
| `empty` | type into empty doc, add/remove lines, backspace over everything | direct Chromium and Android rows are green once the row waits briefly after structural `Enter` | `directly-proved` | `android-empty-rebuild.tsx`, `android-empty-rebuild.test.ts`, `pnpm proof:appium:android:empty-rebuild:local` |
| `remove` | selection deletion across anchor/focus and full backspace cleanup | direct proof row is green on both Chromium and Android Appium | `directly-proved` | `android-remove-range.tsx`, `android-remove-range.test.ts`, `pnpm proof:appium:android:remove-range:local` |
| `autocorrect` | Android keyboard autocorrect and cursor placement after correction | current Appium + Chrome emulator stack can show keyboard state but exposes zero Gboard candidate nodes and keycodes only yield literal `cant ` insertion | `tooling-blocked` | direct probe evidence only; external evidence still required |

Android legacy-case read:

- local structural/browser rows are exhausted
- remaining Android debt is keyboard-feature evidence only:
  - autocorrect
  - glide typing
  - voice input

## Seeded Proof And Review Rows

- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: current oracle tranche now covers the widened editor behavior and static read/query surface on the proved seam
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/interfaces-contract.ts` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: the helper-heavy deleted interfaces family is now classified as mostly mirrored by `snapshot-contract.ts` plus this direct runtime-guard suite, while deleted `CustomTypes` declaration-merging rows are explicit skips and the TypeScript docs now describe the real structural typing contract
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: representative deleted normalization rows are now recovered on the current default and explicit seams instead of living only as deleted legacy fixtures
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/operations-contract.ts` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: the deleted operations family is now explicitly classified: `move_node` and core `split_node` rows stay mirrored, `remove_node`/`remove_text` plus `split_node` empty-properties and `set_node` omit-removal now have direct proof, and legacy custom-selection/null-sentinel rows are explicit skips instead of ghost gaps
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/transaction-contract.ts` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: batch lifecycle and failure semantics are now explicit on the current transaction seam: direct replacement stays draft-visible and publishes once on exit, while exact legacy partial-commit failure semantics are an explicit cut and the kept contract is atomic rollback on throw
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/transforms-contract.ts` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: the deleted `setNodes/inline/**` transforms cluster now has direct proof for selection, explicit `Point` / `Range` / `Span`, and `mode: 'highest'`, and the same suite now also proves `moveNodes/path` no-op plus later nested-container rebasing while richer text-merge rows stay explicitly outside the current live contract
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/text-units-contract.ts` — disposition: created | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: the surviving `utils/string.ts` value is now directly proved on the current text-unit seam that drives movement behavior, while deleted `utils/deep-equal/**` plus the old root `test/index.js` and `jsx.d.ts` harness files are explicit skips instead of fake open gaps
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: headless refs and anchor behavior are explicitly reviewed and mapped into the True Slate RC proof lane
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/test` | maintainer note: clipboard/import-export proof is explicit for the current mixed-inline and wrapper-unit contract
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts` — disposition: preserved | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-history/test` | maintainer note: history semantics are explicitly reviewed as part of the broader contract, and the deleted history test family is now reconciled against the live proof surface
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/test/provider-hooks-contract.tsx` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/test` | maintainer note: the old `runtime.tsx` landfill was split into provider-hooks, react-editor, primitives, editable-behavior, projections-and-selection, app-owned-customization, large-doc-and-scroll, runtime-fixtures, and shared test-utils so recovered React runtime proof now has explicit behavior owners
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/test` | maintainer note: focused deleted-family recovery now directly proves `ReactEditor.focus` null-selection and mid-transform safety, no `onValueChange` on focus, low-level `Editable` translate policy, structured split/merge mount identity, and `useSelected` path-rebasing stability
- [x] `/Users/zbeyens/git/slate-v2/playwright/integration/examples/richtext.test.ts` — disposition: adapted | release relevance: medium | proof owner: `docs/slate-browser/proof-lane-matrix.md` | docs owner: `../slate-v2/playwright/integration/examples` | maintainer note: richtext browser proof now directly covers the deleted triple-click paragraph-selection intent that used to live in `select.test.ts`
- [x] `/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/playwright/integration/examples` | maintainer note: widened browser proof now has fresh same-turn replacement compatibility evidence instead of a pending placeholder row
- [x] `docs/slate-browser/proof-lane-matrix.md` — disposition: preserved | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `docs/slate-browser` | maintainer note: specialist lanes stay aligned with the live contract and the replacement compatibility lane has fresh evidence

## Specialist And Envelope Drift Checks

- [x] `docs/slate-browser/overview.md` — disposition: adapted | release relevance: medium | proof owner: `master-roadmap.md` | docs owner: `docs/slate-browser` | maintainer note: specialist front door now points at the live runtime/browser proof surfaces without pretending to own roadmap sequence
- [x] `../slate-v2/Readme.md` — disposition: adapted | release relevance: high | proof owner: `release-readiness-decision.md` | docs owner: `../slate-v2` | maintainer note: repo front door now says completed `POC RC`, earned `True Slate RC`, and calls out the widened proof stack plainly
- [x] `../slate-v2/docs/general/replacement-candidate.md` — disposition: adapted | release relevance: high | proof owner: `replacement-family-ledger.md` | docs owner: `../slate-v2/docs/general` | maintainer note: repo-local envelope is aligned with the live verdict and the widened current core/helper surface

## packages/slate/src File-Granular Review

- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/core.ts` — disposition: replaced | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: transaction-first core now internalizes the old `core/**` split and carries the live-tree normalization and fragment/read seams
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: editor instance construction now owns the proved overrideable method surface instead of the old broad instance grab-bag
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/editor.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: `EditorImplementation` still owns the default instance semantics and shared helper layer, while the public `Editor.*` wrapper surface is restored back onto the `src/editor/*.ts` historical paths
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: barrel exports are reviewed against the live public surface instead of relying on stale dist luck, including the restored transform helper namespaces
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: the aggregate interface surface is now just the explicit contract barrel; the historical `interfaces/*.ts` paths again own the `Path` / `Point` / `Range` / `Location` / ref / `Text` / `Element` / `Operation` / `Scrubber` / `Node` / `Editor` namespaces directly
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/range-projection.ts` — disposition: created | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: projected text segments are a new explicit helper seam for marks and range-based proof
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/range-ref-transform.ts` — disposition: created | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: range-ref rebasing is carried by a focused helper instead of the old multi-file ref stack
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-fragment.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: fragment insert semantics are reviewed as a single current seam, not a deleted-file mystery
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-node.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: node transforms now stand in for the former `transforms-node/**` tree with explicit proof responsibility
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-selection.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: selection transforms are reviewed as a live helper seam backed by oracle rows
- [x] `/Users/zbeyens/git/slate-v2/packages/slate/src/transforms-text.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate/src` | maintainer note: text/delete helpers are reviewed as the current narrow text transform surface

Current read:

- file-granular review for the current `packages/slate/src` tree is closed
- remaining legacy editor file gaps are now capability-proof questions, not
  unreviewed file holes

## packages/slate-history Current Recovery Rows

- [x] `/Users/zbeyens/git/slate-v2/packages/slate-history/src/history.ts` — disposition: adapted | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-history/src` | maintainer note: the live `History` / `HistoryBatch` surface is restored in place, exported from the package root, and directly proved by the current history contract
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-history/src/history-editor.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-history/src` | maintainer note: history helpers now carry `withNewBatch`, `withoutMerging`, split-once state, and the current saving/merging guard surface on the snapshot engine
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-history/src/interfaces.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-history/src` | maintainer note: the public history editor contract now includes the `writeHistory` instance seam instead of leaving docs ahead of source
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-history/src/with-history.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-history/src` | maintainer note: commit-time history capture now routes new-stack writes through `editor.writeHistory` and applies split-once semantics at the subscriber boundary
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-history/src/index.ts` — disposition: adapted | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-history/src` | maintainer note: barrel exports now include the split-once helper state alongside the other history weakmaps

## packages/slate-react/src Current Recovery Rows

- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/context.tsx` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: React context now carries focused/readOnly/composing plus current element/path/runtime-id seams
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: mounted root now syncs ReactEditor state and clipboard helpers instead of hiding that seam in stale docs
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: element render contexts now carry enough information for `useElement`, `useSelected`, runtime-id binding, and `renderElement.attributes` host ownership
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: the structured editing surface now also owns `readOnly`, so apps do not need to fake the editor root by hand
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text.tsx` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: text rendering now supports `renderText`, custom placeholder hosts, and `leafPosition`/`text` metadata on the current split-leaf seam
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate.tsx` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: provider now owns initial document seeding, snapshot-based change callbacks, and provider-scoped focused/readOnly/composing hook state instead of pretending to be a dumb context wrapper
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/slate-element.tsx` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: base element hosts bind mounted DOM nodes when a runtime-id context exists and still render standalone without Slate context
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-element.tsx` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: element hooks are restored on the current render-element seam
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-selected.tsx` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: selected-state hooks now ride the current path-aware element context instead of depending on dead DOM-editor glue
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-slate-node-ref.tsx` — disposition: adapted | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: node binding stays optional so base presentational components still render outside `<Slate>`
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/react-editor.ts` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: current ReactEditor exposes the proved DOM/focus/clipboard/root/window helper namespace over the mounted bridge without resurrecting the old plugin stack wholesale
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/with-react.ts` — disposition: created | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: withReact is restored as a compatibility construction helper that records the clipboard format key without mutating the editor instance
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-react/src/index.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-react/src` | maintainer note: barrel exports now match the current recovered hook/default/helper surface instead of silently dropping obvious names

Current read:

- the obvious public `packages/slate-react/src` gap is no longer the hook/default
  seam
- deeper missing breadth is now a narrower `slate-dom` / legacy DOMEditor
  question, not an unreviewed `slate-react` blob

## packages/slate-dom Current Recovery Rows

- [x] `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/bridge.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-dom/src` | maintainer note: the mounted bridge now carries current DOM target checks, node translation, range translation, and event-range resolution instead of leaving ReactEditor glued to stale docs
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/clipboard.ts` — disposition: adapted | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-dom/src` | maintainer note: clipboard helpers now expose split fragment-vs-text insertion on the current fragment envelope seam
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-dom/src/interfaces.ts` — disposition: adapted | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-dom/src` | maintainer note: public bridge interfaces now match the recovered mounted DOM helper surface
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/bridge.ts` — disposition: preserved | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-dom/test` | maintainer note: direct package proof now owns mounted path/point/range translation, zero-width handling, and decorated-leaf offset behavior
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts` — disposition: preserved | release relevance: high | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-dom/test` | maintainer note: direct package proof now owns fragment envelope round-trips, fallback rules, and fail-closed clipboard boundaries

## packages/slate-browser Current Recovery Rows

- [x] `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/core/selection.ts` — disposition: preserved | release relevance: medium | proof owner: `docs/slate-browser/proof-lane-matrix.md` | docs owner: `../slate-v2/packages/slate-browser/src` | maintainer note: pure selection helper semantics are explicitly owned by the `test:slate-browser:core` lane
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/browser/selection.ts` — disposition: adapted | release relevance: medium | proof owner: `docs/slate-browser/proof-lane-matrix.md` | docs owner: `../slate-v2/packages/slate-browser/src` | maintainer note: browser selection snapshot helpers are explicitly owned by the `test:slate-browser:dom` and `test:slate-browser:selection` lanes
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/browser/zero-width.ts` — disposition: adapted | release relevance: medium | proof owner: `docs/slate-browser/proof-lane-matrix.md` | docs owner: `../slate-v2/packages/slate-browser/src` | maintainer note: zero-width placeholder inspection is explicitly owned by the IME/browser proof lanes
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-browser/src/playwright/index.ts` — disposition: adapted | release relevance: high | proof owner: `docs/slate-browser/proof-lane-matrix.md` | docs owner: `../slate-v2/packages/slate-browser/src` | maintainer note: the editor-first Playwright harness now owns the broad current example e2e lane, IME lane, anchors lane, and replacement matrix routing explicitly
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-browser/README.md` — disposition: adapted | release relevance: medium | proof owner: `docs/slate-browser/proof-lane-matrix.md` | docs owner: `../slate-v2/packages/slate-browser` | maintainer note: package docs now match the specialist proof role instead of floating as anonymous tooling

## packages/slate-hyperscript Current Recovery Rows

- [x] `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/index.ts` — disposition: created | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-hyperscript` | maintainer note: the workspace package now has a live root entry so fixture imports resolve to source instead of dead `dist/` paths under Yarn PnP
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/src/index.ts` — disposition: preserved | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-hyperscript/src` | maintainer note: public exports still match the legacy hyperscript package surface
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/src/hyperscript.ts` — disposition: preserved | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-hyperscript/src` | maintainer note: factory and shorthand creation surface remains source-compatible with the legacy package
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/src/creators.ts` — disposition: preserved | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-hyperscript/src` | maintainer note: creator semantics remain intact and the fixture matrix is green again
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/index.js` — disposition: preserved | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-hyperscript/test` | maintainer note: full fixture proof is now explicitly owned instead of implied by a contributor-facing note
- [x] `/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/smoke.js` — disposition: preserved | release relevance: medium | proof owner: `true-slate-rc-proof-ledger.md` | docs owner: `../slate-v2/packages/slate-hyperscript/test` | maintainer note: smoke proof stays the quick canary on the default factory and shorthand seam

Current read:

- the obvious `ReactEditor` / `slate-dom` helper seam is no longer missing
- the obvious provider seam is no longer missing either
- the obvious hook-scope seam is no longer missing either
- the package's own direct bridge and clipboard proof lanes are now explicitly green
- deleted `packages/slate-react/src/**` residue is now explicitly classified: mirrored split public surfaces plus better-cuts for chunking, restore-dom, Android-only helpers, and stale type/env residue
- remaining depth in this family is explicitly better-cut for now:
  - Android-only helper internals that the current repo does not actively use as
    public surface
  - legacy internal maps like `NODE_TO_INDEX` / `NODE_TO_PARENT`
  - any future React runtime optimization work
- it is no longer the mounted target/clipboard/provider/hook-scope seam
- the contributor-facing `slate-hyperscript` slot is now explicitly reviewed and
  source-runnable in the workspace

## Current Read

This ledger is not frozen.

- `POC RC` classifications stay checked
- `True Slate RC` rows stay closed unless a later regression or broader claim
  change reopens them
- missing tests, deleted files, and narrowed seams do not get to hide behind
  generic buckets anymore
