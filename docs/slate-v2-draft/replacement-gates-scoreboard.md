---
date: 2026-04-08
topic: slate-v2-replacement-gates-scoreboard
---

# Slate v2 Replacement Gates Scoreboard

## Purpose

This is the explicit evidence board behind the current replacement verdict for
`/Users/zbeyens/git/slate-v2`.

Legacy comparison is measured against `/Users/zbeyens/git/slate`.

Use:

- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
  for the current stop/go read
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
  for the current proof read

Roadmap mapping:

- completed `POC RC` == the proved `Target A` surface
- prior earned `True Slate RC` == the broader claim now under perf-gate
  revalidation here

## Current Verdict

- current release target: **Target A**
  - completed `POC RC` surface for `Slate + EditableBlocks + withHistory(createEditor())`
- broader target: **Target B**
  - historical verdict label for the broader explicit replacement claim
- final gate:
  - `Target A`: **Go**
  - `Target B`: **Reopened under challenge**

Blunt read:

- current-family seams exist far beyond the default anchor surface
- the widened local proof stack is real
- the shipping release path still enforces the widened proof stack
- perf blocker classes are now concrete
- placeholder, huge-document, and mainstream richtext blocker-facing lanes are
  green enough under the current curated package
- core normalization compare remains diagnostic and ugly
- IME/mobile/browser zero-regression is explicit post-RC follow-up:
  it no longer holds the current release target, but it still limits the
  broader blanket replacement claim
- broader API/public-surface closure is also reopened under challenge, but that
  lane is owned by the proof/control docs rather than this perf board

## Perf Gate Package

This file now carries the live perf gate package.

### Non-blockers

These do not block RC truth by themselves:

- low-value demo/example lanes
- microbench noise without user-facing impact
- scenarios slower than legacy but still comfortably fast in practice

### Deterministic Target Rule

- `Target A` reopens iff a blocker lane lands inside the default recommendation
  surface:
  - `Slate`
  - `EditableBlocks`
  - `withHistory(createEditor())`
- `Target B` reopens iff a blocker lane invalidates the broader explicit
  package-level replacement claim
- perf wording only reopens iff a failing lane is diagnostic/core-only and does
  not map to either claim surface

### Blocker Class Matrix

| Perf class | Reopens `Target A`? | Reopens `Target B`? | Notes |
| --- | --- | --- | --- |
| `slate-react` mounted runtime basics | yes | yes | default recommendation surface |
| `slate-history` undo / redo on the default editor surface | yes | yes | default recommendation includes `withHistory(createEditor())` |
| huge-document user flows | no | yes | broader replacement truth |
| mainstream richtext formatting/edit flows | yes | yes | current runtime/browser proof stack already carries them |
| core normalization / engine lanes | no | no | diagnostic class; only matters when mapped upward into user-facing flows |

## Gates

### 1. Replacement Repo Cutover

Status: **pass**

Evidence:

- hard-cut legacy coexistence completed
- surviving package graph is now:
  - `slate`
  - `slate-dom`
  - `slate-react`
  - `slate-history`
  - `slate-browser`
  - `slate-hyperscript`

### 2. Modern Runtime Baseline

Status: **pass**

Evidence:

- root runtime is React `19.2`
- root site runtime is Next `16.2.2`
- the current runtime uses modern React features explicitly, not by accident

### 3. Package / Public Freeze Truth

Status: **pass**

Evidence:

- package README stable surfaces are explicit for:
  - `slate`
  - `slate-dom`
  - `slate-react`
  - `slate-history`
  - `slate-hyperscript`
  - `slate-browser`
- package-local proof lanes are now runnable for:
  - `slate`
  - `slate-history`
  - `slate-hyperscript`
  - `slate-browser`
- replacement docs and repo-local docs can be made to agree on the same public
  envelope without hedging

### 4. Current Runtime / Browser Proof Stack

Status: **pass as a proof surface for both targets**

Evidence:

- `yarn workspace slate-react run test`
- `yarn workspace slate-browser test`
- `yarn test:slate-browser:e2e:local`
- `yarn test:slate-browser:ime:local`
- local anchors run via:
  - `bash ./scripts/run-slate-browser-local.sh 3100 /examples/persistent-annotation-anchors "yarn build:slate-browser:playwright && yarn exec playwright test playwright/integration/examples/persistent-annotation-anchors.test.ts --project=chromium --workers=1"`
- local browser proof on `rich-inline` for:
  - type/edit
  - copy/paste
  - undo/redo
  - reset/load
  - blur/focus selection recovery
  - one outer transaction as one history step
- local browser proof on `richtext` for:
  - `strong`
  - `em`
  - `code`
  - `blockquote`
  - `heading-one`
  - expanded-selection bold add/remove
  - continued typing on the paragraph lane
- local browser proof on widened current families:
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
- local browser proof on recovered contributor-facing slots:
  - `android-tests`
  - `check-lists`
  - `code-highlighting`
  - `inlines`
  - `custom-placeholder`
  - `search-highlighting`
- direct contributor-facing package proof on:
  - `slate-hyperscript` fixture + smoke suite
- local IME proof on:
  - `placeholder`
  - `inline-edge`
  - `void-edge`

### 4.5 Browser / Input Zero-Regression Parity

Status: **post-RC follow-up**

Evidence:

- current direct IME proof is still Chromium-only:
  - `placeholder-ime`
  - `inline-edge-ime`
  - `void-edge-ime`
- current desktop composition proxy proof is green on:
  - placeholder IME
  - no-FEFF placeholder IME
  - inline-edge IME
  - void-edge IME
- current mobile proxy proof is green on:
  - placeholder IME
  - inline-edge IME
  - void-edge IME
  - IME undo/redo on those same rows
- current desktop-browser proof now also includes:
  - zero-width matrix on Chromium, Firefox, and desktop WebKit
  - rich-inline blur/focus selection recovery on Chromium, Firefox, and desktop
    WebKit
- Firefox local weirdness rows are now directly owned:
  - direct composition on the main IME surfaces
  - blur/focus selection recovery
  - zero-width normalization
  - drag/drop cleanup after dragged-node unmount
  - table multi-range preservation
  - nested editable focus bounce
- Android structural/browser rows are now directly owned:
  - placeholder
  - no-FEFF placeholder
  - inline-edge
  - void-edge
  - split/join
  - empty/delete-rebuild
  - remove-range
  - structural `special` subcases
- the remaining unresolved slice is:
  - external Android keyboard-feature behavior
  - broader iOS Safari / WebKit composition/focus
- focus-restore and transient DOM-point recovery now have current proof on the
  mounted bridge plus the desktop-browser focus row; the remaining blocker is
  no longer generic local platform uncertainty

Authority:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)

Read:

- the current browser stack is real
- local Firefox and Android structural/browser proof are now exhausted
- the remaining external Android keyboard-feature and broader iOS Safari rows
  are no longer treated as current RC blockers
- they still are not broad enough to honestly support “zero regression vs
  legacy Slate React on every relied-on weird-input surface”

### 5. Legacy Oracle Compatibility Matrix

Status: **pass on the rebuilt stable rows**

Command:

- `yarn test:replacement:compat:local`

Current green rows include:

- legacy:
  - `search-highlighting`
  - `code-highlighting`
  - `shadow-dom`
  - `iframe`
  - `mentions`
  - `inlines`
  - `plaintext`
  - `read-only`
  - `richtext`
  - `markdown-preview`
  - `markdown-shortcuts`
  - `forced-layout`
  - `styling`
  - `hovering-toolbar`
  - `images`
  - `tables`
  - `embeds`
  - `editable-voids`
  - `paste-html`
  - `custom-placeholder`
- current:
  - `placeholder`
  - `plaintext`
  - `read-only`
  - `shadow-dom`
  - `iframe`
  - `highlighted-text`
  - `persistent-annotation-anchors`
  - `markdown-preview`
  - `markdown-shortcuts`
  - `forced-layout`
  - `styling`
  - `hovering-toolbar`
  - `rich-inline`
  - `mentions`
  - `links`
  - `paste-html`
  - `editable-voids`
  - `images`
  - `tables`
  - `embeds`
  - `rich-inline` reset boundary

Read:

- the rebuilt matrix is no longer vibes-only
- it is still curated, not blanket legacy parity

### 6. Local Replacement Gate Manifest

Status: **pass**

Command:

- `yarn test:replacement:gate:local`

Manifest:

- `yarn test`
- package-local proof lanes:
  - `yarn workspace slate run test`
  - `yarn workspace slate-history run test`
  - `yarn workspace slate-hyperscript run test`
  - `yarn workspace slate-browser test`
- `yarn test:replacement:compat:local`
- Chromium browser lanes listed in
  [replacement-gate-local.sh](/Users/zbeyens/git/slate-v2/scripts/replacement-gate-local.sh)
- replacement benchmark lanes:
  - placeholder
  - huge-document
  - richtext
  - markdown
  - editable-voids
  - table

Read:

- this is the full local replacement evidence stack
- benchmark lanes are included here for manual and release-candidate evidence
- they are intentionally non-blocking for the routine shipping gate because
  they are slower and noisier than the correctness/coverage lanes

### 7. Shipping Release Gate Parity

Status: **pass**

Evidence:

- `prerelease` now runs:
  - `yarn build:rollup`
  - `yarn test:replacement:gate:local`
  - `yarn lint:release`
- `package.json` restores the missing replacement and `slate-browser` root
  command graph instead of pointing docs at dead commands

Read:

- the shipping release path now enforces the replacement proof stack
- the remaining blockers are no longer command-graph drift
- blocking shipping gate shape is:
  - `yarn build:rollup`
  - `yarn test:replacement:gate:local`
  - `yarn lint:release`

### 8. Placeholder Latency vs Legacy

Status: **pass**

Command:

- `pnpm bench:replacement:placeholder:local`

Current result at `5` iterations:

- legacy `custom-placeholder` type mean: `9.31ms`
- current `placeholder` type mean: `3.51ms`
- delta mean: `-5.80ms`

### 9. Huge-Document Latency vs Legacy

Status: **pass**

Command:

- `pnpm bench:replacement:huge-document:local`

Stable workload:

- `1000` blocks
- `5` iterations

Current result:

- ready:
  - legacy mean: `740.43ms`
  - current mean: `560.61ms`
  - delta: `-179.82ms`
- type:
  - legacy mean: `19.66ms`
  - current mean: `24.39ms`
  - delta: `+4.73ms`
- select-all:
  - legacy mean: `77.93ms`
  - current mean: `3.77ms`
  - delta: `-74.16ms`
- paste:
  - legacy mean: `105.04ms`
  - current mean: `44.58ms`
  - delta: `-60.46ms`

Read:

- this lane is still green enough under the curated gate package
- current is slower on typing in this rerun, but the gap stays in a comfortably
  fast range and does not reopen RC truth by itself

### 10. Markdown Shortcut Latency vs Legacy

Status: **pass**

Command:

- `yarn bench:replacement:markdown:local`

Current result at `5` iterations:

- legacy markdown blockquote shortcut mean: `7.27ms`
- current markdown blockquote shortcut mean: `6.01ms`
- delta mean: `-1.26ms`

### 11. Editable-Void Insert Latency vs Legacy

Status: **near-parity non-blocker**

Command:

- `yarn bench:replacement:void:local`

Current result at `5` iterations:

- legacy editable-void insert mean: `93.11ms`
- current editable-void insert mean: `93.16ms`
- delta mean: `+0.05ms`

Read:

- this lane is effectively parity in the latest rerun
- it is not a blocker lane under the curated package

### 12. Table Edit Latency vs Legacy

Status: **pass**

Command:

- `yarn bench:replacement:table:local`

Current result at `5` iterations:

- legacy table cell edit mean: `8.60ms`
- current table cell edit mean: `3.73ms`
- delta mean: `-4.87ms`

### 13. Richtext Formatting Latency vs Legacy

Status: **pass**

Command:

- `pnpm bench:replacement:richtext:local`

Current result at `5` iterations:

- legacy richtext blockquote toggle mean: `23.01ms`
- current richtext blockquote toggle mean: `22.09ms`
- delta mean: `-0.92ms`

Read:

- this lane cleared in the latest blocker rerun after the kept richtext
  leaf-path fix
- this removes the perf blocker that had reopened both `Target A` and `Target B`
- it does not close the separate browser/input parity blocker

### 14. Core Normalization Perf Package

Status: **diagnostic open**

Commands:

- `pnpm bench:normalization:local`
- `pnpm bench:normalization:compare:local`

Current compare result:

- explicit adjacent-text normalize:
  - legacy mean: `13.19ms`
  - current mean: `134.20ms`
  - delta: `+121.01ms`
- explicit inline flatten normalize:
  - legacy mean: `309.86ms`
  - current mean: `1779.73ms`
  - delta: `+1469.87ms`
- insert-text read-after-each observation:
  - legacy mean: `5.36ms`
  - current mean: `109.95ms`
  - delta: `+104.59ms`

Read:

- these numbers are bad
- but this package stays diagnostic until mapped into a user-facing blocker lane

## Batch 9 Freeze Read

Current measured lane read:

- faster:
  - placeholder
  - huge-document on ready/select-all/paste
  - markdown shortcut
  - table edit
- current blocker lane cleared:
  - richtext blockquote toggle
- near parity:
  - editable-void insert
- slower:
  - huge-document typing in the latest rerun, but still within the non-blocking
    range for the current curated package
  - core normalization compare (diagnostic only)
- locality proof:
  - rerender breadth now includes explicit overlay-source toggle locality and
    hidden-pane `Activity` resume behavior
  - rerender breadth now also includes annotation-backed widget rebasing, where
    the edited left text plus projection/sidebar/widget slices rerender once
    and unrelated right text stays at `0`
- current-only overlay proof:
  - huge-document overlay toggle + sidebar hide/show now have a dedicated
    corridor-scoped lane instead of hiding inside baseline huge-document
    numbers
  - fresh same-turn rerun stays in the same band: overlay toggle mean
    `98.12ms`, type-after-overlay mean `15.4ms`, and type-after-show mean
    `14.54ms`

Rule:

- keep blocker truth curated
- do not claim “faster everywhere”
- do not let diagnostic microbench lanes drive target truth by themselves
- mainstream richtext is no longer the live blocker lane
- browser/input parity remains the live blocker lane

## Commands

- `yarn test`
- `yarn test:replacement:compat:local`
- `yarn test:replacement:gate:local`
- `pnpm bench:replacement:placeholder:local`
- `pnpm bench:replacement:huge-document:local`
- `pnpm bench:replacement:huge-document:overlays:local`
- `pnpm bench:replacement:richtext:local`
- `pnpm bench:replacement:markdown:local`
- `pnpm bench:replacement:void:local`
- `pnpm bench:replacement:table:local`
- `pnpm bench:react:rerender-breadth:local`

## Decision Read

Current judgment read:

- the perf posture is now a curated blocker package
- the current perf package is green enough
- `Target A` is `Go` on the proved default surface
- `Target B` is still reopened under challenge because exhaustive
  API/public-surface audit remains unresolved and browser/input parity is still
  deferred follow-up for the broader blanket claim
- current remaining perf concerns are follow-up or diagnostic class, not live
  blocker class
- the bogus browser huge-document history compare row is gone; the headless
  history compare lane is the only honest owner for that claim

This file stays focused on evidence, not the final sales pitch.
