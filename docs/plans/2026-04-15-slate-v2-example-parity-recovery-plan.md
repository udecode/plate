---
date: 2026-04-15
topic: slate-v2-example-parity-recovery
status: active
---

# Slate v2 Example Parity Recovery Plan

## Purpose

Make the example story honest for the broader no-regression claim.

This lane is not closed by:

- same-path current example files
- same-path current Playwright example tests
- replacement compatibility rows that only cover a subset of examples

It closes only when legacy/current example parity is explicit across the full
example surface.

## Core Rule

Maximum parity with legacy is now required for **all** examples that still
matter to the blanket replacement claim.

Legacy examples may be **added or extended** when the rewrite unlocked a
fairer comparison surface, but those rows must be labeled explicitly as
`extended` instead of being smuggled in under vague “better cut” language.

For same-path legacy examples, the default recovery target is the **closest
legacy source structure and contributor-facing chrome** that the current runtime
can honestly support.

“Behavior passes somewhere” is not enough.
A scratch rewrite is debt unless the current-only divergence is recorded
explicitly.

Git diff wins ties.
If the same-path file still reads like a rewrite in source, the row stays
`open` even when a browser row is green.

## Owners

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
- [2026-04-13-slate-v2-full-no-regression-story-plan.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-13-slate-v2-full-no-regression-story-plan.md)

Supporting inputs:

- [legacy-playwright-example-tests.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/legacy-playwright-example-tests.md)
- [example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/example-parity-matrix.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- `/Users/zbeyens/git/slate/site/examples/**`
- `/Users/zbeyens/git/slate-v2/site/examples/**`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/**`

## Required Classification

Every example row must land in exactly one bucket:

- `mirrored`
- `recovered`
- `extended`
- `mixed`
- `explicit cut`
- `open`

## Workstreams

### 1. Legacy Example Inventory

- inventory legacy TS example surfaces
- inventory legacy Playwright example tests
- map them to current example and proof owners

### 2. Mirror vs Extend Decisions

- default to mirror
- extend only when the rewrite unlocked a clearly better comparison
- record the reason for every extension

### 3. Proof Ownership

- direct browser proof where possible
- replacement compatibility where honest
- benchmark owner where the example is really benchmark-owned
- explicit-cut rationale where the example no longer belongs to the kept claim

### 4. Control-Doc Sync

- roadmap
- verdict
- proof ledger
- release file review ledger
- maintainer drift register

### 5. Source/UI Recovery Default

- audit same-path examples for legacy-source closeness, not only behavior proof
- reopen rows where proof exists but the contributor-facing example drifted
- recover from legacy example source first; keep rewrites only with explicit
  justification

## Current Progress

- exact example drift inventory now exists in
  [example-parity-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-v2/ledgers/example-parity-matrix.md)
- first recovery batch is already landed in
  [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts):
  - replacement `search-highlighting` parity row
  - replacement `code-highlighting` parity row
- targeted cross-repo proof for that batch is green:
  - legacy + replacement `search-highlighting`
  - legacy + replacement `code-highlighting`
- second recovery batch is now landed in
  [replacement-compatibility.test.ts](/Users/zbeyens/git/slate-v2/playwright/integration/examples/replacement-compatibility.test.ts):
  - replacement `inlines` parity row
  - replacement `richtext` parity row
  - replacement `custom-placeholder` parity row
- targeted cross-repo proof for that batch is green:
  - legacy + replacement `inlines`
  - legacy + replacement `richtext`
  - legacy + replacement `custom-placeholder`
- third batch results:
  - `android-tests` is now recovered as an explicit `extended` row:
    the current page carries the legacy manual case picker plus the newer IME
    hub links
  - `check-lists` is now recovered with direct legacy/current parity rows
  - `huge-document` is now treated as an explicit benchmark-owned parity row
    instead of an ownerless gap
  - `scroll-into-view` is still open:
    the current row is green, but the mirrored legacy/current parity action is
    still red on the legacy inner-container scroll behavior even after a fair
    legacy extension attempt
  - targeted proof is green for:
  - legacy + replacement `android-tests`
  - legacy + replacement `check-lists`
- 2026-04-15 source + DOM audit result:
  - the softer runtime/DOM audit was still too generous for a source-first
    recovery standard
  - the git-diff rebaseline invalidated more rows than the earlier audit:
    - `custom-placeholder`
    - `forced-layout`
    - `markdown-preview`
    - `markdown-shortcuts`
    - `plaintext`
    - `read-only`
    - `shadow-dom`
    - `styling`
    - `tables`
  - `code-highlighting` remains the clearest hard-open row:
    source similarity is only `0.062`
  - some rows are now legitimately source-close after the actual ports:
    - `check-lists`
    - `embeds`
    - `hovering-toolbar`
    - `iframe`
    - `inlines`
    - `mentions`
  - `check-lists` is no longer one of the invalidated source-rewrite rows:
    the file now reads close to legacy again; the earlier `as CustomEditor`
    and test-only `id` drift were removed, and the remaining source-level gap
    is that the current `EditableBlocks` surface still does not expose legacy
    `spellCheck` / `autoFocus` and still carries current type/module syntax;
    the red standalone checkbox test is explicitly deferred to the later
    proof-fix pass
  - some rows are source-close but still not fully closed in proof:
    - `editable-voids`
    - `images`
    - `paste-html`
    - `richtext`
  - continuation batch:
    - the `slate-react` exported-type audit found no new legacy barrel misses
      beyond the already-explicit cuts:
      - `RenderChunkProps`
      - `NODE_TO_INDEX`
      - `NODE_TO_PARENT`
    - the audit did expose one real current public type regression:
      `EditableTextBlocksProps` was still intersecting the native textarea
      `placeholder?: string` with the current custom
      `placeholder?: ReactNode`, so JSX placeholder hosts in
      `custom-placeholder` / `placeholder-surface` typed as garbage until the
      inherited native `placeholder` key was omitted again
    - `forced-layout` is now source-close again after restoring the in-file
      legacy layout normalizer, legacy copy, and direct title/paragraph shell
    - targeted current proof is green for `forced-layout`:
      - initial title + paragraph shell
      - full-delete restoration
    - `search-highlighting` is now source-close again after restoring the
      legacy search/decorate flow, `Slate` wrapper, and contributor-facing
      input shell
    - remaining forced drift for `search-highlighting` is explicit:
      current `projectionStore` + `renderSegment` wiring instead of legacy
      `decorate` + `renderLeaf`
    - targeted current proof is green for `search-highlighting`:
      - typing `text` yields two highlighted matches

## Exit

- every legacy example row is classified
- every extension is explicit and justified
- same-path current files are no longer treated as implicit parity closure
- control docs stop pretending deletion closure equals example parity
- same-path recoveries either stay close to legacy source or record the reason
  they do not
