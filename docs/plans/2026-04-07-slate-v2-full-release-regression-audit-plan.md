---
date: 2026-04-07
topic: slate-v2-full-release-regression-audit
status: active
---

# Slate v2 Full Release Regression Audit Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Goal

Get `/Users/zbeyens/git/slate-v2` to an honest production-release posture for
replacing legacy Slate.

Maintainer-facing short read:

- [pr-description.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/pr-description.md)

Bluntly:

- `battle-tested` is not true while large chunks of the old proof surface were
  deleted without explicit replacement
- literal `0` regression risk is fantasy
- the real bar is:
  - no known behavior regressions in claimed families
  - no deleted proof surface left untriaged
  - no release claim that outruns the gated suite
  - no perf claim broader than measured lanes

## Current Judgment

`Target B: Go` is not honest today.

Why:

1. the historical regression corpus is still far larger than the rebuilt oracle
   surface
2. contributor-facing recovery is closed, but widened family proof depth still
   trails the blanket claim
3. the public/package claim is still narrower than “fully replaces legacy
   Slate”
4. performance evidence is still lane-by-lane and currently mixed

Closed since the earlier audit draft:

- contributor-facing slot recovery:
  - `android-tests`
  - `check-lists`
  - `code-highlighting`
  - `custom-placeholder`
  - `inlines`
  - `search-highlighting`
  - `slate-hyperscript`
- live docs no longer point at dead contributor-facing slots
- root replacement command graph is restored:
  - replacement compatibility
  - replacement benchmarks
  - `slate-browser` root proof commands
- root `tsconfig.json` no longer points at deleted `*-v2` package paths

## Ordered Workstreams

### 1. Claim Discipline

Status:

- done

Current read:

- live verdict docs keep `Target B: No-Go`
- live docs now describe the widened current-family surface honestly without
  pretending blanket replacement

Files:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md`
- `/Users/zbeyens/git/slate-v2/docs/general/replacement-candidate.md`
- `/Users/zbeyens/git/slate-v2/Readme.md`
- package READMEs under `/Users/zbeyens/git/slate-v2/packages/*/README.md`

Exit condition:

- keep current until the remaining blockers below are actually closed

### 2. Contributor-Facing Concept Recovery

Status:

- closed for the current seven-slot matrix

Current read:

- every contributor-facing deleted concept in the active recovery tranche now
  has:
  - a current conceptual slot
  - a proof owner
  - docs ownership

This workstream no longer blocks on the first tranche.
It stays as a rule for later deletions, not as an active missing-slot queue.

## Contributor-Facing Concept Matrix

This matrix is the spine of the recovery. Every deleted contributor-facing
concept must land in a closest current conceptual slot before `Target B` can
turn green.

| Legacy concept        | Current status | Closest current conceptual slot                                             | Proof owner                     | Docs owner                                | Notes                                                                        |
| --------------------- | -------------- | --------------------------------------------------------------------------- | ------------------------------- | ----------------------------------------- | ---------------------------------------------------------------------------- |
| `android-tests`       | restored       | `android-tests` current hub pointing to IME/mobile-input lanes              | `android-tests.test.ts`         | `docs/general/contributing.md`, live docs | restored as a contributor-facing IME test hub                                |
| `check-lists`         | restored       | `check-lists` current interactive checklist slot                            | `check-lists.test.ts`           | example docs + replacement docs           | restored on the current `EditableBlocks` seam                                |
| `code-highlighting`   | restored       | `code-highlighting` current editable token-highlighting slot                | `code-highlighting.test.ts`     | example docs + replacement docs           | restored on the current projection seam                                      |
| `custom-placeholder`  | restored       | `custom-placeholder` current slot on the placeholder seam                   | `placeholder.test.ts`           | example docs + replacement docs           | current seam uses `placeholder` prop instead of old `renderPlaceholder` seam |
| `inlines`             | restored       | `inlines` current slot backed by `links` and related inline-family surfaces | `inlines.test.ts`               | root/examples docs + replacement docs     | current slot is narrower than the old monolithic example                     |
| `search-highlighting` | restored       | `search-highlighting` current slot backed by current highlight projections  | `search-highlighting.test.ts`   | example docs + replacement docs           | current slot uses projection-driven highlighting                             |
| `slate-hyperscript`   | restored       | `slate-hyperscript` package slot with current smoke proof                   | root mocha lane + package smoke | docs + package claim                      | old fixture corpus stays out of the release bar                              |

## Release-Gate Manifest

This is the required local proof stack for the current replacement claim while
recovery is in flight.

Canonical command:

- `yarn test:replacement:gate:local`

Manifest members:

1. `yarn test`
2. `yarn test:replacement:compat:local`
3. current browser lanes for:
   - `android-tests`
   - `check-lists`
   - `code-highlighting`
   - `inlines`
   - `custom-placeholder`
   - `search-highlighting`
   - `richtext`
   - `markdown-shortcuts`
   - `markdown-preview`
   - `forced-layout`
   - `styling`
   - `hovering-toolbar`
   - `editable-voids`
   - `images`
   - `embeds`
   - `tables`
   - `scroll-into-view`
4. benchmark lanes for:
   - placeholder
   - huge-document
   - richtext
   - markdown
   - editable-voids
   - tables

Open gap:

- the manifest exists and is wired into root commands
- what still matters is the depth and truth of the proof behind the widened
  family claim, not whether the command names exist

### 3. Rebuild The Real Release Gate

The release path must run the proof that the release claim depends on.

Status:

- command graph restored

Current state:

- `/Users/zbeyens/git/slate-v2/package.json`
  - root scripts now include:
    - `test:replacement:compat:local`
    - `test:replacement:gate:local`
    - `test:slate-browser:*`
    - `bench:replacement:*`
  - `prerelease` now routes through:
    - `yarn build:rollup`
    - `yarn test:replacement:gate:local`
    - `yarn lint:release`

What remains:

- same-turn green release evidence
- maintainers need one clear explanation of why `lint:release` is the release
  lint floor instead of the noisy repo-wide `yarn lint`

Required gated release stack:

1. `yarn test:mocha`
2. `yarn workspace slate-react run test`
3. `yarn workspace slate-dom test`
4. `yarn test:replacement:compat:local` or a CI-safe equivalent
5. browser lanes for all claimed families
6. measured benchmark lanes

Exit condition:

- one release command enforces the same proof stack the docs rely on
- maintainers can explain that command without hand-waving

### 4. Rebuild The Package Regression Oracle

The deleted historical package tests must be triaged family by family.

Status:

- in progress

Current read:

- current `snapshot-contract.ts` mirrors `77` legacy oracle rows across:
  - `move`
  - `Editor.before`
  - `Editor.after`
  - `select`
  - `setPoint`
  - `deselect`
  - `wrapNodes`
  - `unwrapNodes`
  - `liftNodes`
  - `delete`
- that is real progress
- it is still tiny next to the old corpus

For each deleted package-test bucket below:

1. classify rows into:
   - mirrored now
   - supportable next
   - explicit skip
2. restore enough coverage that the current suite is not a tiny contract shell
   pretending to replace a massive old corpus

Exit condition:

- the package-test shrink is explained, rebuilt, or explicitly cut from scope

### 5. Rebuild Direct Browser Proof For Deleted Family Lanes

`replacement-compatibility.test.ts` is useful, but it is not a full substitute
for direct current-family browser proof.

Status:

- in progress

Current read:

- current-family browser proof now exists for:
  - richtext
  - markdown
  - forced-layout
  - styling
  - hovering-toolbar
  - editable-voids
  - images
  - embeds
  - tables
  - scroll-into-view
- deleted direct lanes like `iframe`, `plaintext`, `read-only`, `shadow-dom`,
  and `select` are now mapped explicitly instead of silently disappearing

Deleted browser lanes need one of:

1. restored direct current-family lane
2. explicit move into comparison-only / out-of-scope

Exit condition:

- no deleted browser lane remains in limbo

### 6. Re-Audit Public Package Scope Deletions

Package removals and public-surface deletions are release-scope decisions, not
internal cleanup.

Status:

- in progress

Closed decisions already made:

1. `slate-hyperscript`
   - restored as a live package slot
   - root Mocha smoke proof added
   - old fixture corpus stays outside the release bar
2. root `tsconfig.json`
   - stale `*-v2` package references removed
3. root command graph
   - replacement and `slate-browser` commands restored
4. Rollup / React 19 interop
   - `react/jsx-runtime` named export handling restored for build output
5. `slate-browser` package integration
   - root workspace dependency restored
   - package-local Node types declared for release build/typecheck

Must still audit:

1. package source-surface deletions in:
   - `packages/slate/src/**`
   - `packages/slate-react/src/**`
   - `packages/slate-dom/src/**`

Exit condition:

- every public/package deletion is either restored, replaced, or explicitly cut
  from the release promise

### 7. Only Then Revisit Perf

The one measured richtext regression is not the main blocker right now.

Keep perf wording narrow until behavior and proof debt is closed.

Measured lanes to keep as-is:

- placeholder
- huge-document `1000`-block
- richtext blockquote toggle
- markdown blockquote shortcut
- editable-void insert `x5`
- table cell edit

Exit condition:

- behavior/test regressions are closed first
- perf language still matches only measured lanes

## Exhaustive Deleted-Surface Inventory

All counts below come from:

- `cd /Users/zbeyens/git/slate-v2 && git diff --diff-filter=D --name-only`

Processed disposition buckets:

- `blocked-restore-or-cut`
  - deleted surface that directly affects the release claim and still needs an
    explicit decision
- `closed-by-note`
  - deleted surface later reconciled by live proof plus a dedicated closure
    note
- `internal-rewrite-audit`
  - deleted source surface that may be okay, but still needs export/API audit
- `release-doc-noise`
  - deleted non-proof docs that do not block the claim by themselves

Exact grouped partition of all current deletions:

- `packages/slate/test/interfaces/**` — `576` — `blocked-restore-or-cut`
- `packages/slate/test/transforms/**` — `408` — `blocked-restore-or-cut`
- `packages/slate/test/operations/**` — `31` — `blocked-restore-or-cut`
- `packages/slate/test/normalization/**` — `20` — `blocked-restore-or-cut`
- `packages/slate/test/utils/**` — `11` — `blocked-restore-or-cut`
- `packages/slate/test/index.js` — `1` — `blocked-restore-or-cut`
- `packages/slate/test/jsx.d.ts` — `1` — `blocked-restore-or-cut`
- `packages/slate-react/test/**` — `8` — `blocked-restore-or-cut`
- `packages/slate-history/test/**` — `17` — `closed-by-note`
- `playwright/integration/examples/**` — `2` — `closed-by-note`
- `site/examples/ts/**` — `1` — `closed-by-note`
- `packages/slate-dom/src/**` — `13` — `internal-rewrite-audit`
- `packages/slate-react/src/**` — `30` — `internal-rewrite-audit`
- `packages/slate/src/**` — `116` — `internal-rewrite-audit`
- `packages/slate-dom/CHANGELOG.md` — `1` — `release-doc-noise`
- `packages/slate-history/CHANGELOG.md` — `1` — `release-doc-noise`
- `packages/slate-react/CHANGELOG.md` — `1` — `release-doc-noise`
- `packages/slate/CHANGELOG.md` — `1` — `release-doc-noise`

Grouped total:

- `1239` deleted paths
- `0` unmatched paths

### A. Deleted Package-Test Surface

#### `packages/slate/test` deletions: `1048`

Exact deleted buckets:

- `packages/slate/test/interfaces/**` — `576` deleted files
- `packages/slate/test/transforms/**` — `408` deleted files
- `packages/slate/test/operations/**` — `31` deleted files
- `packages/slate/test/normalization/**` — `20` deleted files
- `packages/slate/test/utils/**` — `11` deleted files
- `packages/slate/test/index.js`
- `packages/slate/test/jsx.d.ts`

Release action:

- rebuild or explicitly scope-cut each deleted family before claiming full
  replacement confidence

#### `packages/slate-react/test` deletions: `8`

Exact deleted files:

- `packages/slate-react/test/chunking.spec.ts`
- `packages/slate-react/test/decorations.spec.tsx`
- `packages/slate-react/test/editable.spec.tsx`
- `packages/slate-react/test/react-editor.spec.tsx`
- `packages/slate-react/test/tsconfig.json`
- `packages/slate-react/test/use-selected.spec.tsx`
- `packages/slate-react/test/use-slate-selector.spec.tsx`
- `packages/slate-react/test/use-slate.spec.tsx`

Release action:

- rebuild direct runtime coverage for each deleted seam or cut it from the
  claim

#### `packages/slate-history/test` deletions: `17`

Current status:

- closed by
  [2026-04-09-slate-v2-slate-history-deleted-test-family-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-history-deleted-test-family-closure.md)
  against the live `history-contract.ts` proof surface

Exact deleted files:

- `packages/slate-history/test/index.js`
- `packages/slate-history/test/isHistory/after-edit.js`
- `packages/slate-history/test/isHistory/after-redo.js`
- `packages/slate-history/test/isHistory/after-undo.js`
- `packages/slate-history/test/isHistory/before-edit.js`
- `packages/slate-history/test/jsx.d.ts`
- `packages/slate-history/test/undo/cursor/keep_after_focus_and_remove_text_undo.js`
- `packages/slate-history/test/undo/delete_backward/block-join-reverse.tsx`
- `packages/slate-history/test/undo/delete_backward/block-nested-reverse.tsx`
- `packages/slate-history/test/undo/delete_backward/block-text.tsx`
- `packages/slate-history/test/undo/delete_backward/custom-prop.tsx`
- `packages/slate-history/test/undo/delete_backward/inline-across.tsx`
- `packages/slate-history/test/undo/insert_break/basic.tsx`
- `packages/slate-history/test/undo/insert_fragment/basic.tsx`
- `packages/slate-history/test/undo/insert_text/basic.tsx`
- `packages/slate-history/test/undo/insert_text/contiguous.tsx`
- `packages/slate-history/test/undo/insert_text/non-contiguous.tsx`

Release action:

- keep the deleted test family closed per the dedicated closure note
- `slate-history` package deletion work is now fully closed by:
  - [2026-04-09-slate-v2-slate-history-deleted-test-family-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-history-deleted-test-family-closure.md)
  - [2026-04-09-slate-v2-slate-history-package-residue-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-history-package-residue-closure.md)

### B. Deleted Browser-Proof Surface

#### Playwright example-test deletions: `2`

Current status:

- closed by
  [2026-04-09-slate-v2-playwright-integration-examples-deleted-family-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-playwright-integration-examples-deleted-family-closure.md)
  against the current browser-proof stack

Exact deleted files:

- `playwright/integration/examples/huge-document.test.ts`
- `playwright/integration/examples/select.test.ts`

Release action:

- keep the family closed per the dedicated closure note
- current mapping:
  - `select` is recovered on the direct current richtext browser seam
  - `huge-document` is an explicit better-cut owned by the frozen benchmark
    lane

### C. Deleted Example Surface

#### TypeScript example deletions: `1`

Current status:

- closed by
  [2026-04-09-slate-v2-site-examples-ts-custom-types-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-site-examples-ts-custom-types-closure.md)
  as an explicit skip under the current structural typing contract

Exact deleted files:

- `site/examples/ts/custom-types.d.ts`

#### JavaScript example deletions: `0`

Current status:

- no current deleted paths remain under `site/examples/js/**`

Release action:

- keep the example/browser family closed per the dedicated closure notes
- current state:
  - example surface recovery is materially closed
  - `site/examples/ts/custom-types.d.ts` is explicit skip under the current
    structural typing contract

### D. Contributor-Doc Drift Tied To Removed Surfaces

Exact drift already found:

- `/Users/zbeyens/git/slate-v2/docs/general/contributing.md`
  - references:
    - `playwright/integration/examples/check-lists.test.ts`
    - `/examples/android-tests`
- `/Users/zbeyens/git/slate-v2/site/examples/Readme.md`
  - still says `replacement-candidate`
  - still frames `Rich Inline` as the replacement-candidate anchor

Release action:

- current state:
  - contributor docs were retargeted to restored current surfaces
  - remaining maintainer work is documenting the drift, not finding dead links

### E. Deleted Public Package Surface

#### Full package removal at the earlier audit snapshot: `packages/slate-hyperscript/**` — `39` deleted paths

Exact deleted package paths:

- `packages/slate-hyperscript/CHANGELOG.md`
- `packages/slate-hyperscript/Readme.md`
- `packages/slate-hyperscript/package.json`
- `packages/slate-hyperscript/src/creators.ts`
- `packages/slate-hyperscript/src/hyperscript.ts`
- `packages/slate-hyperscript/src/index.ts`
- `packages/slate-hyperscript/src/tokens.ts`
- `packages/slate-hyperscript/test/fixtures/cursor-across-element.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-across-elements-empty.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-across-elements-end.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-across-elements-middle.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-across-elements-start.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-element-empty.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-element-end.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-element-middle.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-element-nested-end.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-element-nested-middle.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-element-nested-start.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-element-start.tsx`
- `packages/slate-hyperscript/test/fixtures/cursor-text-empty.tsx`
- `packages/slate-hyperscript/test/fixtures/element-custom.tsx`
- `packages/slate-hyperscript/test/fixtures/element-empty.tsx`
- `packages/slate-hyperscript/test/fixtures/element-nested-empty.tsx`
- `packages/slate-hyperscript/test/fixtures/element-nested-string.tsx`
- `packages/slate-hyperscript/test/fixtures/element-string.tsx`
- `packages/slate-hyperscript/test/fixtures/element-text-empty.tsx`
- `packages/slate-hyperscript/test/fixtures/element-text-string.tsx`
- `packages/slate-hyperscript/test/fixtures/fragment-element.tsx`
- `packages/slate-hyperscript/test/fixtures/fragment-empty.tsx`
- `packages/slate-hyperscript/test/fixtures/fragment-string.tsx`
- `packages/slate-hyperscript/test/fixtures/selection-offset-start.tsx`
- `packages/slate-hyperscript/test/fixtures/selection.tsx`
- `packages/slate-hyperscript/test/fixtures/text-empty.tsx`
- `packages/slate-hyperscript/test/fixtures/text-full.tsx`
- `packages/slate-hyperscript/test/fixtures/text-nested.tsx`
- `packages/slate-hyperscript/test/fixtures/value-empty.tsx`
- `packages/slate-hyperscript/test/index.js`
- `packages/slate-hyperscript/test/jsx.d.ts`
- `packages/slate-hyperscript/tsconfig.json`

Release action:

- resolved:
  - `slate-hyperscript` is restored as a live package slot
  - README/docs references are restored
  - root Mocha smoke proof covers the contributor-facing package slot
  - the old fixture corpus remains outside the release bar

#### Large source-surface deletions from the earlier audit snapshot

Exact deleted source buckets:

- `packages/slate/src/editor/**` — `56` deleted files
- `packages/slate/src/interfaces/**` — `19` deleted files
- `packages/slate/src/transforms-node/**` — `11` deleted files
- `packages/slate/src/utils/**` — `9` deleted files
- `packages/slate/src/core/**` — `8` deleted files
- `packages/slate/src/transforms-selection/**` — `7` deleted files
- `packages/slate/src/types/**` — `3` deleted files
- `packages/slate/src/transforms-text/**` — `3` deleted files
- `packages/slate-react/src/hooks/**` — `16` deleted files
- `packages/slate-react/src/components/**` — `7` deleted files
- `packages/slate-react/src/chunking/**` — `6` deleted files
- `packages/slate-react/src/plugin/**` — `2` deleted files
- `packages/slate-react/src/utils/environment.ts`
- `packages/slate-react/src/custom-types.ts`
- `packages/slate-react/src/@types/direction.d.ts`
- `packages/slate-dom/src/utils/**` — `10` deleted files
- `packages/slate-dom/src/plugin/**` — `2` deleted files
- `packages/slate-dom/src/custom-types.ts`

Release action:

- audit each deleted source bucket against:
  - public exports
  - replaced proof
  - docs promise

### F. Deleted Changelog Files

Exact deleted files:

- `packages/slate/CHANGELOG.md`
- `packages/slate-dom/CHANGELOG.md`
- `packages/slate-history/CHANGELOG.md`
- `packages/slate-hyperscript/CHANGELOG.md`
- `packages/slate-react/CHANGELOG.md`

Release action:

- low priority
- only matters if release tooling or package docs still assume these files exist

## Acceptance Criteria Before `Target B` Can Flip Back To `Go`

1. every deleted proof surface in this plan has a recorded disposition:
   - restored
   - replaced
   - explicit scope cut
2. the live docs and repo docs match that disposition
3. the release script runs the real replacement gate
4. package-test shrink is explained by rebuilt coverage, not by wishful thinking
5. contributor docs no longer point at deleted surfaces
6. perf wording stays limited to measured lanes

## Repro Commands

Use these exact commands when refreshing this plan:

```sh
cd /Users/zbeyens/git/slate-v2
git diff --diff-filter=D --name-only
git diff --diff-filter=D --name-only | rg '^packages/slate/test/'
git diff --diff-filter=D --name-only | rg '^packages/slate-react/test/'
git diff --diff-filter=D --name-only | rg '^packages/slate-history/test/'
git diff --diff-filter=D --name-only | rg '^playwright/integration/examples/'
git diff --diff-filter=D --name-only | rg '^site/examples/ts/'
git diff --diff-filter=D --name-only | rg '^site/examples/js/'
git diff --diff-filter=D --name-only | rg '^packages/slate-hyperscript/'
```
