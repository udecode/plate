---
date: 2026-04-25
topic: slate-v2-leaf-lifecycle-dom-shape-conformance
status: active
depends_on:
  - docs/plans/2026-04-25-slate-v2-editing-epoch-kernel-regression-closure-plan.md
  - docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/decisions/slate-v2-editing-epoch-legacy-timing-recovery-audit.md
code_repo:
  - /Users/zbeyens/git/slate-v2
source_repos:
  - /Users/zbeyens/git/slate
---

# Slate v2 Leaf Lifecycle And DOM Shape Conformance Plan

## Verdict

Keep the Slate v2 architecture:

```txt
Slate model + operations
editor.read / editor.update lifecycle
transaction commits
authoritative editing epoch kernel
React 19.2 live-read / dirty-commit runtime
slate-browser generated proof gates
```

Do not pivot to legacy Slate React, Lexical, ProseMirror, or another editor.

Pivot harder inside the current architecture. The editing epoch kernel closes
event timing and selection ownership. It does not yet close the next required
layer:

```txt
transaction
  -> leaf lifecycle cleanup
  -> selection rebase
  -> commit metadata
  -> render projection
  -> DOM repair
  -> rendered DOM shape conformance
```

Harsh take: the current proof still lets model-correct edits render garbage.
That is not release-grade browser editing.

## Concrete Failure To Close

Observed local browser path:

1. Open `http://localhost:3100/examples/richtext`.
2. Place the caret near the end of the first paragraph, around
   `<textarea>!`.
3. Press repeated `Backspace` / `Option+Backspace`.
4. The first paragraph accumulates visible blank lines as text/leaf segments are
   deleted.
5. The model and selection can still look broadly coherent, but the visible DOM
   contains empty zero-width leaves that render `<br>` inside a non-empty block.

Captured failure shape:

```txt
first block model text:
  "This is editable rich text, much better than a "

first block DOM includes:
  <code>
    <span data-slate-zero-width="n" data-slate-length="0"><br></span>
  </code>
  <span data-slate-zero-width="n" data-slate-length="0"><br></span>

visible result:
  fake blank visual lines inside a non-empty paragraph
```

This is not a keydown timing bug anymore. It is a document-shape and
render-shape invariant bug.

## What Current Tests Missed

Existing destructive editing proof asserts:

- tail block texts stay unchanged
- collapsed DOM selection stays inside the editor
- kernel traces join the destructive epoch
- follow-up typing works

That is useful but too weak.

It does not assert:

- first-block `innerText`
- non-empty block line count
- zero-width placeholder count
- whether zero-width nodes render `<br>`
- DOM selection target kind after deletion
- whether empty marked/code/decorated leaves survived in the model

So the suite allowed fake visual lines while claiming model/DOM coherence.

## Non-Negotiable Invariants

### Model Leaf Lifecycle

For every inline-compatible element after destructive edits:

- adjacent text nodes with equal marks/properties must merge
- empty text leaves must be removed unless they are structurally required
- required empty leaves must be classified, not accidental
- empty inline spacers may survive only when they are needed around inline or
  void inline elements
- an empty block may keep one empty text child
- a non-empty block may not end with empty marked/code/decorated leaves that are
  not required spacers
- a removed leaf must rebase selection before the path becomes dead

Allowed empty text leaf classes:

- `empty-block-anchor`: the only editable text child in an empty block
- `inline-leading-spacer`: required before an inline element
- `inline-trailing-spacer`: required after an inline element
- `inline-between-spacer`: required between inline elements
- `temporary-selection-anchor`: allowed only inside a transaction before commit,
  never as committed render truth

Everything else is garbage and must be removed or merged.

### Rendered DOM Shape

For every non-empty block:

- the rendered block text must equal `Node.string(block)` modulo expected
  browser whitespace normalization
- zero-width nodes inside the block must be explainable by a model leaf class
- `data-slate-zero-width="n"` with `<br>` is forbidden unless the model shape is
  an empty block or an explicit line-break placeholder
- empty marked/code/decorated leaves must not render visual line breaks
- line boxes must not increase when deleting text within the same paragraph
- `innerText` must not gain blank lines after leaf-boundary deletion
- DOM selection must not anchor inside a useless zero-width leaf after cleanup

### Selection Rebase

After destructive edits:

- if the selected text leaf survives, keep the selection in that leaf
- if the selected leaf is removed, rebase to the nearest valid text point using
  the delete direction and operation affinity
- if backward delete removes a suffix leaf, prefer the previous surviving text
  point
- if forward delete removes a prefix leaf, prefer the next surviving text point
- if the nearest surviving point is an inline spacer, preserve it only when it
  is a real inline-boundary spacer
- never leave selection inside a committed empty marked/code/decorated leaf that
  exists only because rendering needed a zero-width placeholder

## Architecture Target

Add a first-class leaf lifecycle owner in core.

Suggested package shape:

```txt
packages/slate/src/core/leaf-lifecycle.ts
packages/slate/src/core/render-shape.ts
packages/slate/src/core/selection-rebase.ts
```

The owner must be core-level because the invalid committed shape is independent
of React. React can render it visibly, but React should not be responsible for
guessing whether a deleted model leaf should still exist.

React then gets a narrow renderer policy:

```txt
model leaf class
  -> zero-width mode
  -> DOM shape
```

`slate-browser` gets a proof policy:

```txt
model tree
  -> rendered block DOM
  -> line/zero-width/selection shape
```

## Batch 0: RED Reproduction Lock

Goal: freeze the reported bug before refactoring.

Work in `/Users/zbeyens/git/slate-v2`:

- Add a focused Playwright row in
  `playwright/integration/examples/richtext.test.ts`.
- Use the same viewport/user-agent class that reproduced the screenshot.
- Place the caret at the end of the first paragraph.
- Run repeated `Backspace` and `Alt+Backspace` through `<textarea>!`, code leaf,
  punctuation, and normal leaf boundaries.
- Capture on failure:
  - Slate model tree
  - Slate selection
  - first block `innerText`
  - first block `textContent`
  - first block `innerHTML`
  - zero-width node list
  - DOM selection anchor/focus element path
  - line rect count
  - kernel trace

Acceptance:

- The row fails against current behavior by detecting fake blank visual lines or
  unexplained zero-width `<br>` nodes.
- If Playwright cannot fail but the in-app browser still fails, record that as a
  persistent-browser repro gap and add the same scenario to persistent soak.

Earliest gate:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "leaf|zero-width|word-delete|Backspace|DOM shape" --workers=1 --retries=0
```

## Batch 1: Core Leaf Lifecycle Contract

Goal: make invalid committed leaf shapes impossible.

Work:

- Add `packages/slate/test/leaf-lifecycle-contract.ts`.
- Build fixtures for:
  - non-empty paragraph ending with empty code leaf
  - non-empty paragraph ending with empty marked leaf
  - non-empty paragraph ending with empty decorated/projection-shaped leaf
  - adjacent same-props leaves after delete
  - adjacent different-props leaves after delete
  - inline leading/trailing spacer leaves
  - empty block single text child
  - range delete across mark boundaries
  - word delete across mark/code boundaries
- Add core helpers that classify empty leaves:
  - required empty block anchor
  - required inline spacer
  - removable empty leaf
  - mergeable adjacent leaf
- Run leaf lifecycle cleanup after destructive text mutations and explicit
  normalization, not from React rendering.
- Record cleanup in commit metadata:
  - cleanup kind
  - removed leaf paths
  - merged leaf paths
  - selection rebase source/target

Acceptance:

- Core tests prove committed trees do not retain removable empty leaves.
- Inline spacer and empty block rules stay green.
- Adjacent text merge behavior does not erase intentional mark boundaries.

Earliest gates:

```bash
bun test ./packages/slate/test/leaf-lifecycle-contract.ts --bail 1
bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1
bun test ./packages/slate/test/commit-metadata-contract.ts --bail 1
```

## Batch 2: Selection Rebase Contract

Goal: remove dead or useless selection anchors after cleanup.

Work:

- Add `packages/slate/test/selection-rebase-contract.ts`.
- Make destructive operations pass a delete affinity into cleanup:
  - backward character
  - backward word
  - forward character
  - forward word
  - range delete
  - cut
- Rebase selection before removing the leaf that owns it.
- Use point/path refs only as temporary probes; final selection must be resolved
  from the surviving tree.
- Preserve inline spacer selection only when the spacer is semantically required.

Acceptance:

- Selection never points to a removed path.
- Selection never points to a removable empty leaf after commit.
- Backward/forward/range delete rows choose deterministic surviving points.
- Existing inline delete normalization behavior remains green.

Earliest gates:

```bash
bun test ./packages/slate/test/selection-rebase-contract.ts --bail 1
bun test ./packages/slate/test/transforms-text-delete-contract.ts --bail 1
```

If `transforms-text-delete-contract.ts` does not exist yet, create the focused
contract beside the current text transform tests instead of widening the full
suite first.

## Batch 3: React Rendered DOM Shape Contract

Goal: make renderer output obey model leaf classes.

Work:

- Add `packages/slate-react/test/rendered-dom-shape-contract.tsx`.
- Add a small internal helper that derives zero-width render mode from model
  leaf class:
  - empty block anchor may render line-break zero-width
  - mark placeholder uses sentinel zero-width, not `<br>`
  - inline spacer uses sentinel zero-width unless it is the only text in an
    empty block
  - removable empty leaves should never reach render
- Update `EditableText` / `ZeroWidthString` usage so an empty marked/code leaf in
  a non-empty block cannot create a visual `<br>`.
- Keep custom renderers honest:
  - `renderLeaf`
  - `renderText`
  - `renderSegment`
  - projections/decorations

Acceptance:

- Non-empty block with empty marked/code/decorated leaf cannot render fake line
  breaks.
- Empty block still renders a caret-addressable placeholder.
- Placeholder behavior remains accessible.
- Custom leaf/render segment cases do not bypass the invariant.

Earliest gates:

```bash
bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx --bail 1
bun test ./packages/slate-react/test/primitives-contract.tsx --bail 1
bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1
```

## Batch 4: slate-browser DOM Shape Assertions

Goal: make visual DOM shape a reusable proof primitive.

Work in `packages/slate-browser/src/playwright/index.ts`:

- Add scenario step `assertRenderedDOMShape`.
- Add editor assertion helpers:
  - `editor.assert.renderedBlockText(index, text)`
  - `editor.assert.noUnexpectedZeroWidthBreaks(index)`
  - `editor.assert.zeroWidthShape(index, expected)`
  - `editor.assert.lineBoxCount(index, expected | { max })`
  - `editor.assert.domSelectionTarget({ path, offset, allowZeroWidth })`
- Add capture helpers:
  - block `innerText`
  - block `textContent`
  - zero-width node list
  - zero-width kind/length/hasBr
  - DOM selection owner segment
  - line rect buckets
- Include these snapshots in scenario trace artifacts.

Acceptance:

- Any generated gauntlet can assert visual DOM shape without one-off page
  scripts.
- Failure output prints the model tree, DOM shape, and selection target.
- `slate-browser` core tests cover the assertion helpers without launching the
  full integration suite.

Earliest gates:

```bash
bun run --cwd packages/slate-browser test:core --bail 1
bun test ./packages/slate-browser/test/core/scenario.test.ts --bail 1
bun test ./packages/slate-browser/test/browser/zero-width.browser.test.ts --bail 1
```

## Batch 5: Destructive Leaf-Boundary Gauntlets

Goal: cover the full destructive editing state space that creates empty leaves.

Expand generated gauntlets for:

- character Backspace
- character Delete
- word Backspace
- word Delete
- range delete
- cut
- repeated delete until empty block
- delete after paste
- undo/redo after destructive cleanup
- follow-up typing after cleanup

Run each across:

- plain text leaf boundary
- bold/italic/mark boundary
- code leaf boundary
- decorated/projection split boundary
- inline element boundary
- void inline boundary
- block start
- block middle
- block end
- single-block document
- multi-block document

Every row must assert:

- model tree
- model selection
- visible DOM text
- first affected block `innerText`
- zero-width node count and class
- no unexpected zero-width `<br>`
- DOM selection target
- line box count does not gain fake lines
- kernel trace has no illegal transition
- follow-up typing lands in the same logical block

Acceptance:

- The reported richtext row is covered by a generated destructive
  leaf-boundary gauntlet, not only a bespoke regression.
- Rows run on Chromium, Firefox, WebKit, and mobile viewport where raw transport
  is supported.
- Mobile semantic handles are labeled semantic proof, not raw native-device
  proof.

Earliest gate:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "destructive|leaf|zero-width|DOM shape|Backspace|Delete|word-delete" --workers=4 --retries=0
```

## Batch 6: Legacy Parity Rows

Goal: prove this class does not regress from legacy Slate.

Work:

- Add a parity matrix section for destructive leaf-boundary deletion.
- Compare against `../slate` for:
  - richtext first paragraph deleting through `<textarea>!`
  - mark boundary delete
  - code leaf delete
  - inline boundary delete
  - decorated text delete where legacy has an equivalent
  - range delete across mixed leaves
- Record where legacy behavior is copied, intentionally improved, or rejected.
- Convert accepted rows into v2 release gates.

Acceptance:

- Parity is file-backed, not chat memory.
- Any intentional divergence states the better v2 invariant.
- Legacy comparison includes visible DOM shape, not only editor value.

Suggested artifact:

```txt
docs/research/decisions/slate-v2-destructive-leaf-boundary-legacy-parity.md
```

## Batch 7: Release Discipline And Completion Sync

Goal: prevent this regression from returning.

Work:

- Add release-discipline guard names for:
  - `leaf-lifecycle-contract`
  - `rendered-dom-shape-contract`
  - `destructive-leaf-boundary-gauntlet`
  - `legacy-leaf-delete-parity`
- Update release claim docs to say browser editing proof includes rendered DOM
  shape.
- Update `bun check:full` only if the new gates are release-proof guards, not
  iteration-only checks.
- Keep `bun check` fast.
- Do not put `bun test:integration-local` into `bun check`.

Acceptance:

- `bun test:release-proof` fails if DOM-shape proof artifacts are absent.
- `bun check:full` includes the DOM-shape release proof before full integration.
- `tmp/completion-check.md` remains `done` for the old completed plan until this
  plan becomes the active implementation lane.

## Driver Gates

Focused first:

```bash
bun test ./packages/slate/test/leaf-lifecycle-contract.ts --bail 1
bun test ./packages/slate/test/selection-rebase-contract.ts --bail 1
bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx --bail 1
bun run --cwd packages/slate-browser test:core --bail 1
PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "leaf|zero-width|DOM shape|Backspace|word-delete" --workers=1 --retries=0
```

Package gates by touched area:

```bash
bunx turbo build --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-dom --filter=./packages/slate-browser --force
bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-dom --filter=./packages/slate-browser --force
bun run lint:fix
bun run lint
```

Closure gates:

```bash
bun test:release-proof
bun check:full
```

## Completion Target

This plan is complete only when:

- core has a named leaf lifecycle owner
- destructive edits remove or merge invalid empty leaves
- selection rebases away from removed/useless leaves
- React rendering cannot turn non-empty block artifacts into fake blank lines
- `slate-browser` can assert rendered DOM shape generically
- generated gauntlets cover destructive leaf-boundary editing
- legacy parity rows exist for destructive delete paths
- release proof fails without DOM-shape artifacts
- focused package build/type/lint gates pass
- closure gates pass or exact deferred scope is documented

## Stop Rules

Do not stop at a single richtext fix.

Stop only when:

- the full completion target is met, or
- this plan is explicitly deferred by the owner, or
- no autonomous progress is possible and the missing evidence/tooling is named.

If a checkpoint says “next move,” execute it. A red test is not a blocker; it is
the start of the lane.

## Execution Ledger

### 2026-04-25: Start Batch 0

- actions: activated this plan and set `tmp/completion-check.md` to `pending`.
- commands: none yet.
- artifacts: `tmp/continue.md` is being generated for Stop-hook continuation.
- evidence: user-reported richtext repeated Backspace/Option-Backspace visual
  blank-line repro; prior Playwright-style model/selection proof was too weak.
- hypothesis: the first missing release invariant is rendered DOM shape after
  destructive leaf-boundary deletion, not another event timing patch.
- decision: start with a focused RED browser row in `../slate-v2` before core
  cleanup.
- owner classification: Batch 0, RED reproduction lock.
- changed files: `tmp/completion-check.md`,
  `docs/plans/2026-04-25-slate-v2-leaf-lifecycle-dom-shape-conformance-plan.md`.
- rejected tactics: do not start by patching `ZeroWidthString`; do not claim the
  previous epoch proof covers visual DOM shape.
- next action: add and run the richtext RED row for fake blank visual lines and
  unexplained zero-width `<br>` nodes.

### 2026-04-25: Batch 0 RED Captured

- actions: added a focused richtext integration row for repeated leaf-boundary
  word-delete DOM shape.
- commands:
  `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "rendered DOM shape" --workers=1 --retries=0`.
- artifacts:
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- evidence: the new row fails with `domTextMatchesModel: false`,
  `hasFakeBlankLines: true`, and `unexpectedZeroWidthBreakCount: 2`; the first
  block model text is `This is editable rich text, much ` while DOM `innerText`
  contains extra blank lines from two `data-slate-zero-width="n"` nodes with
  `<br>`.
- hypothesis: the committed model retains removable empty code/plain leaves at
  paths `0,5` and `0,6`; React renders them as line-break zero-width nodes
  because the leaves reach rendering as empty text instead of being cleaned or
  classified.
- decision: Batch 0 is complete; proceed to Batch 1 core leaf lifecycle
  contract before renderer fallback patches.
- owner classification: Batch 1, core leaf lifecycle contract.
- changed files:
  `../slate-v2/playwright/integration/examples/richtext.test.ts`.
- rejected tactics: do not special-case richtext or hide the `<br>` in React
  first; prove/remediate the committed leaf shape in core.
- next action: add `../slate-v2/packages/slate/test/leaf-lifecycle-contract.ts`
  and make it fail on removable empty marked/code leaves after destructive
  deletes.

### 2026-04-25: Batch 1 Core Leaf Lifecycle Green

- actions: added a core leaf lifecycle owner and wired it into destructive text
  deletion after structure reconciliation and before final selection
  resolution.
- commands:
  - `bun test ./packages/slate/test/leaf-lifecycle-contract.ts --bail 1`
  - `bun test ./packages/slate/test/transaction-target-runtime-contract.ts --bail 1`
  - `bun test ./packages/slate/test/commit-metadata-contract.ts --bail 1`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "rendered DOM shape" --workers=1 --retries=0`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "leaf|zero-width|DOM shape|Backspace|word-delete" --workers=1 --retries=0`
  - `bunx turbo build --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bun run lint:fix`
  - `bun run lint`
- artifacts:
  - `../slate-v2/packages/slate/src/core/leaf-lifecycle.ts`
  - `../slate-v2/packages/slate/src/core/index.ts`
  - `../slate-v2/packages/slate/src/transforms-text/delete-text.ts`
  - `../slate-v2/packages/slate/test/leaf-lifecycle-contract.ts`
  - `../slate-v2/playwright/integration/examples/richtext.test.ts`
- evidence: the focused core test initially failed with trailing empty text
  children `["", ""]`; after cleanup, the core contract and the browser DOM
  shape regression both pass.
- hypothesis: the core invariant closes the reported runtime path, but Batch 3
  still needs a renderer contract for invalid shapes that reach React through
  replace/hydration/custom setup.
- decision: proceed to Batch 3 instead of claiming closure from the richtext
  row alone.
- owner classification: Batch 3, React rendered DOM shape contract.
- changed files: same as artifacts.
- rejected tactics: do not mark the plan done; do not hide zero-width `<br>` in
  React as the primary fix.
- next action: add
  `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`.

### 2026-04-25: Batch 2 Selection Rebase Contract Green

- actions: added a focused selection rebase contract for cleanup removing an
  empty marked suffix leaf that owns the selection.
- commands:
  `bun test ./packages/slate/test/selection-rebase-contract.ts --bail 1`.
- artifacts:
  `../slate-v2/packages/slate/test/selection-rebase-contract.ts`.
- evidence: backward delete from the removable empty code leaf rebases to the
  end of the previous surviving text leaf and removes invalid empty suffix
  leaves.
- hypothesis: selection rebase behavior is covered for this destructive suffix
  class; broader forward/range/cut rows still belong to later generated
  gauntlet work.
- decision: keep course to Batch 3.
- owner classification: Batch 3, React rendered DOM shape contract.
- changed files:
  `../slate-v2/packages/slate/test/selection-rebase-contract.ts`.
- rejected tactics: do not overfit selection to a spacer that cleanup also
  deletes.
- next action: add the rendered DOM shape React contract.

### 2026-04-25: Batch 3 React Rendered DOM Shape Green

- verdict: keep course.
- harsh take: the core cleanup fixed the live delete path, but React still
  needed a defensive render-shape invariant because invalid empty leaves can
  enter through replacement, hydration, custom setup, or future regressions.
- actions: added a React rendered DOM shape contract and made empty text
  artifacts inside non-empty editable blocks render as non-linebreak
  zero-width sentinels.
- commands:
  - `bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx --bail 1`
  - `bun test ./packages/slate-react/test/primitives-contract.tsx --bail 1`
  - `bun test ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
  - `bun test ./packages/slate/test/leaf-lifecycle-contract.ts ./packages/slate/test/selection-rebase-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts --bail 1`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "leaf|zero-width|DOM shape|Backspace|word-delete" --workers=1 --retries=0`
  - `bunx turbo build --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bun run lint:fix`
  - `bun run lint`
- artifacts:
  - `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`
  - `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- evidence: the new React contract failed red with two
  `data-slate-zero-width="n"` nodes containing `<br>` in a non-empty block;
  after the render policy change, non-empty blocks have no unexpected
  zero-width line breaks while empty blocks still render one line-break
  placeholder.
- hypothesis: the reported fake-line visual class now has core cleanup and
  renderer fallback coverage; the next missing layer is reusable
  `slate-browser` DOM-shape assertions so generated gauntlets stop carrying
  one-off page scripts.
- decision: proceed to Batch 4.
- risks: this renderer fallback is defensive only; if future mutations keep
  producing removable empty leaves, core/gauntlet gates must catch that rather
  than relying on React to hide it.
- earliest gates: `bun run --cwd packages/slate-browser test:core --bail 1`
  after adding assertion helpers, then the focused richtext Playwright grep.
- owner classification: Batch 4, slate-browser DOM shape assertions.
- changed files:
  - `../slate-v2/packages/slate-react/test/rendered-dom-shape-contract.tsx`
  - `../slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- rejected tactics: do not claim full closure from the React fallback; do not
  loosen `ZeroWidthString` itself because empty-block line breaks are still
  valid.
- do-not-do list: do not put `bun test:integration-local` into iteration; do
  not widen to mobile/raw-device proof before the DOM-shape assertion primitive
  exists.
- next action: add reusable `slate-browser` rendered DOM shape assertion helpers
  and core tests.

### 2026-04-25: Batch 4 slate-browser DOM Shape Assertions Green

- verdict: keep course.
- harsh take: the richtext regression was still too bespoke; if generated
  gauntlets cannot assert visual DOM shape directly, future rows will drift
  back into model-only proof and miss this class again.
- actions: added reusable `slate-browser/playwright` rendered DOM shape
  snapshots, assertion helpers, a replayable scenario step, and wired the
  richtext regression to the reusable assertion.
- commands:
  - `bun run --cwd packages/slate-browser test:core --bail 1`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "leaf|zero-width|DOM shape|Backspace|word-delete" --workers=1 --retries=0` failed once because Playwright imported stale built `slate-browser/playwright` output.
  - `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-dom --filter=./packages/slate-react --force`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "leaf|zero-width|DOM shape|Backspace|word-delete" --workers=1 --retries=0`
  - `bunx turbo build --filter=./packages/slate --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bun test ./packages/slate-react/test/rendered-dom-shape-contract.tsx ./packages/slate-react/test/primitives-contract.tsx ./packages/slate-react/test/dom-text-sync-contract.ts --bail 1`
  - `bun test ./packages/slate/test/leaf-lifecycle-contract.ts ./packages/slate/test/selection-rebase-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts --bail 1`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "leaf|zero-width|DOM shape|Backspace|word-delete" --workers=1 --retries=0`
- artifacts:
  - `../slate-v2/packages/slate-browser/src/playwright/index.ts`
  - `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
  - `../slate-v2/playwright/integration/examples/richtext.test.ts`
- evidence: `slate-browser` core tests now serialize
  `assertRenderedDOMShape` for replay; the harness can assert rendered block
  text, unexpected zero-width breaks, zero-width counts, line-box bounds, and
  DOM selection target; the richtext destructive row passes through that
  reusable assertion path.
- hypothesis: the proof primitive is now in the right layer; the next weakness
  is that generated destructive gauntlets do not yet emit these assertions for
  all destructive leaf-boundary families.
- decision: proceed to Batch 5.
- risks: line-box count is intentionally an optional bound because browser
  layout can vary; release rows should prefer text/zero-width/selection shape
  plus line-box max where stable.
- earliest gates:
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "destructive|leaf|zero-width|DOM shape|Backspace|Delete|word-delete" --workers=4 --retries=0`
  - `bun run --cwd packages/slate-browser test:core --bail 1`
- owner classification: Batch 5, destructive leaf-boundary gauntlets.
- changed files:
  - `../slate-v2/packages/slate-browser/src/playwright/index.ts`
  - `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
  - `../slate-v2/playwright/integration/examples/richtext.test.ts`
- rejected tactics: do not keep custom DOM-shape page scripts in example tests;
  do not make line-box count a universal exact assertion.
- do-not-do list: do not jump to release-proof docs before generated gauntlets
  consume the new assertion step.
- next action: expand generated destructive leaf-boundary gauntlets to include
  rendered DOM shape assertions across char/word/range/delete/follow-up paths.

### 2026-04-25: Batch 5 Destructive Leaf-Boundary Gauntlets Green

- verdict: keep course.
- harsh take: generated gauntlets were still too text/selection-heavy; the
  browser bug class needs visual DOM-shape assertions embedded in generated
  edit families, not only a bespoke richtext row.
- actions: expanded generated destructive, mixed-editing, and inline-cut
  gauntlets with optional rendered DOM-shape assertions; wired richtext and
  inlines generated rows to assert no unexpected zero-width line breaks.
- commands:
  - `bun run --cwd packages/slate-browser test:core --bail 1`
  - `bunx turbo build --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated destructive" --workers=1 --retries=0`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --grep "generated (destructive|mixed)" --workers=1 --retries=0`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/inlines.test.ts --project=chromium --grep "generated inline cut" --workers=1 --retries=0`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "destructive|leaf|zero-width|DOM shape|Backspace|Delete|word-delete|generated inline cut|generated mixed" --workers=4 --retries=0` failed once on the existing `Delete before trailing punctuation` row because selection rebased to the next paragraph after removing a suffix punctuation leaf.
  - `bun test ./packages/slate/test/selection-rebase-contract.ts --bail 1`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts --project=chromium --project=webkit --grep "Delete before trailing punctuation" --workers=1 --retries=0`
  - `bun test ./packages/slate/test/leaf-lifecycle-contract.ts ./packages/slate/test/selection-rebase-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts ./packages/slate/test/commit-metadata-contract.ts --bail 1`
  - `bunx turbo build --filter=./packages/slate --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bun run lint:fix`
  - `bun run lint`
  - `PLAYWRIGHT_BASE_URL=http://localhost:3100 bunx playwright test ./playwright/integration/examples/richtext.test.ts ./playwright/integration/examples/highlighted-text.test.ts ./playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --project=mobile --grep "destructive|leaf|zero-width|DOM shape|Backspace|Delete|word-delete|generated inline cut|generated mixed" --workers=4 --retries=0`
- artifacts:
  - `../slate-v2/packages/slate-browser/src/playwright/index.ts`
  - `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
  - `../slate-v2/packages/slate/src/core/leaf-lifecycle.ts`
  - `../slate-v2/packages/slate/test/selection-rebase-contract.ts`
  - `../slate-v2/playwright/integration/examples/richtext.test.ts`
  - `../slate-v2/playwright/integration/examples/inlines.test.ts`
- evidence: the final broad destructive/leaf grep passed 64 rows across
  Chromium, Firefox, WebKit, and mobile viewport; core rebase tests now cover
  forward delete of a suffix leaf with a next paragraph and keep selection in
  the same block.
- hypothesis: destructive leaf-boundary proof is now broad enough for this
  plan; the remaining non-negotiable layer is file-backed legacy parity so the
  v2 behavior is explicitly classified as copied, improved, or intentionally
  divergent.
- decision: proceed to Batch 6.
- risks: mobile rows remain Playwright mobile viewport or semantic-handle proof,
  not raw native-device keyboard proof; that limitation remains part of the
  broader architecture plan, not this leaf-lifecycle closure.
- earliest gates: create the legacy parity artifact, then rerun the focused
  core/browser gates that correspond to any accepted parity rows.
- owner classification: Batch 6, legacy parity rows.
- changed files:
  - `../slate-v2/packages/slate-browser/src/playwright/index.ts`
  - `../slate-v2/packages/slate-browser/test/core/scenario.test.ts`
  - `../slate-v2/packages/slate/src/core/leaf-lifecycle.ts`
  - `../slate-v2/packages/slate/test/selection-rebase-contract.ts`
  - `../slate-v2/playwright/integration/examples/richtext.test.ts`
  - `../slate-v2/playwright/integration/examples/inlines.test.ts`
- rejected tactics: do not mark `Delete before trailing punctuation` as flaky;
  it exposed a real same-block rebase invariant and got a core RED before the
  patch.
- do-not-do list: do not expand into raw native mobile proof in this plan; do
  not claim legacy parity from browser rows alone.
- next action: write
  `docs/research/decisions/slate-v2-destructive-leaf-boundary-legacy-parity.md`
  comparing v2 destructive delete behavior against `../slate`.

### 2026-04-25: Batch 6 Legacy Parity Rows Recorded

- verdict: keep course.
- harsh take: legacy parity is not "copy whatever legacy renders"; the durable
  contract is user-visible destructive editing, while the v2 improvement is
  refusing to commit garbage empty leaves that render fake lines.
- actions: read legacy Slate delete, zero-width string, leaf rendering, DOM
  point mapping, clipboard zero-width stripping, and delete fixture surfaces;
  added a file-backed parity decision for destructive leaf-boundary deletion.
- commands:
  - `rg -n "zero-width|ZeroWidth|deleteBackward|deleteForward|Backspace|Delete|renderLeaf|leaf|selection" packages slate-react site examples test -g '*.ts' -g '*.tsx' -g '*.js'`
  - `rg --files packages/slate-react packages/slate test site examples | rg "(string|leaf|editable|delete|selection|richtext|zero)"`
  - `sed -n '1,220p' packages/slate-react/src/components/string.tsx`
  - `sed -n '1,220p' packages/slate-react/src/components/leaf.tsx`
  - `sed -n '560,900p' packages/slate-dom/src/plugin/dom-editor.ts`
  - `sed -n '70,130p' packages/slate-dom/src/plugin/with-dom.ts`
  - `sed -n '230,300p' packages/slate-dom/src/plugin/with-dom.ts`
  - `sed -n '1,240p' packages/slate/src/transforms-text/delete-text.ts`
  - `rg --files packages/slate/test/transforms/delete | head -80`
- artifacts:
  - `docs/research/decisions/slate-v2-destructive-leaf-boundary-legacy-parity.md`
- evidence: legacy Slate renders empty leaves through `ZeroWidthString`,
  maps zero-width nodes explicitly in `DOMEditor.toDOMPoint` /
  `toSlatePoint`, strips or converts zero-width nodes for clipboard payloads,
  and carries broad delete fixtures; v2 now classifies destructive delete rows
  as copied, improved, or intentionally rejected.
- hypothesis: the remaining closure gap is release discipline, not another
  destructive editing implementation patch.
- decision: proceed to Batch 7.
- risks: raw Android/iOS keyboard, clipboard, and IME proof remains outside
  this local parity artifact and must stay scoped honestly.
- earliest gates:
  - `bun run --cwd packages/slate-browser test:core --bail 1`
  - `bun test:release-proof`
- owner classification: Batch 7, release discipline and completion sync.
- changed files:
  - `docs/research/decisions/slate-v2-destructive-leaf-boundary-legacy-parity.md`
- rejected tactics: do not claim legacy and v2 have identical empty-leaf
  internals; do not let "parity" weaken the stricter v2 DOM-shape invariant.
- do-not-do list: do not put the full integration suite into `bun check`; do
  not mark completion done until release proof knows about the DOM-shape and
  parity artifacts.
- next action: add release-proof guard coverage for leaf lifecycle,
  rendered DOM shape, destructive leaf-boundary gauntlets, and legacy parity.

### 2026-04-25: Batch 7 Release Discipline Green

- verdict: keep course.
- harsh take: the implementation was green, but release proof still did not
  know this regression class existed; that would have let future cleanup remove
  the guardrail without tripping the release gate.
- actions: added release-discipline guard names for leaf lifecycle, selection
  rebase, rendered DOM shape, destructive leaf-boundary gauntlets, and legacy
  parity; wired the release-discipline script to run the new core/React
  contracts; added rendered DOM-shape assertions to persistent destructive
  editing soak.
- commands:
  - `bun test:release-proof` failed once because
    `packages/slate/src/core/leaf-lifecycle.ts` called the public primitive
    `editor.removeNodes` outside `editor.update`, violating the escape-hatch
    source inventory.
  - `bun test:release-proof`
  - `bunx turbo build --filter=./packages/slate --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bunx turbo typecheck --filter=./packages/slate --filter=./packages/slate-browser --filter=./packages/slate-react --filter=./packages/slate-dom --force`
  - `bun run lint:fix`
  - `bun run lint`
  - `SLATE_BROWSER_SOAK_BASE_URL=http://localhost:3100 SLATE_BROWSER_SOAK_ITERATIONS=1 bun ./scripts/proof/persistent-browser-soak.mjs`
- artifacts:
  - `../slate-v2/packages/slate-browser/src/core/release-proof.ts`
  - `../slate-v2/packages/slate-browser/test/core/release-proof.test.ts`
  - `../slate-v2/package.json`
  - `../slate-v2/scripts/proof/persistent-browser-soak.mjs`
  - `../slate-v2/packages/slate/src/core/leaf-lifecycle.ts`
- evidence: `bun test:release-proof` passes; touched package
  build/typecheck/lint passes; one-iteration persistent soak passes and now
  asserts no unexpected zero-width line breaks in the destructive editing
  scenario.
- hypothesis: the remaining work is closure proof, not implementation.
- decision: proceed to closure gates.
- risks: `bun check:full` remains the expensive final sweep because it includes
  full integration; raw mobile device proof remains scoped unless the raw-device
  lane provides Appium artifacts.
- earliest gates:
  - `bun check:full`
  - `bun completion-check`
- owner classification: closure gates and completion sync.
- changed files:
  - `../slate-v2/packages/slate-browser/src/core/release-proof.ts`
  - `../slate-v2/packages/slate-browser/test/core/release-proof.test.ts`
  - `../slate-v2/package.json`
  - `../slate-v2/scripts/proof/persistent-browser-soak.mjs`
  - `../slate-v2/packages/slate/src/core/leaf-lifecycle.ts`
- rejected tactics: do not weaken the escape-hatch inventory to allow
  core-owned cleanup to call public primitives directly; use the central
  transform owner instead.
- do-not-do list: do not claim completion from focused gates alone.
- next action: run the closure gate `bun check:full`, then set
  `tmp/completion-check.md` according to the result.

### 2026-04-25: Closure Gates Passed

- verdict: stop.
- harsh take: this lane finally has the right kind of proof: core shape,
  selection rebase, rendered DOM shape, generated browser gauntlets, persistent
  soak, legacy parity, and the full integration sweep all agree.
- actions: ran the full Slate v2 closure gate and prepared completion state.
- commands:
  - `bun check:full`
- artifacts:
  - `../slate-v2/test-results/release-proof/persistent-browser-soak.json`
- evidence: `bun check:full` passed, including lint, package/site/root
  typecheck, default unit tests, Vitest, `bun test:release-proof`, scoped mobile
  proof, 5-iteration persistent-profile soak, and `bun test:integration-local`
  with 540 Playwright rows.
- hypothesis: the reported fake blank line regression is closed under the
  active plan's proof standard.
- decision: stop because the active plan completion target is met.
- risks: raw Android/iOS device keyboard, clipboard, and IME proof remains
  outside this local closure and is still scoped to the raw-device lane.
- earliest gates:
  - future regression safety: `bun test:release-proof`
  - final closure safety: `bun check:full`
- owner classification: complete.
- changed files:
  - `docs/plans/2026-04-25-slate-v2-leaf-lifecycle-dom-shape-conformance-plan.md`
  - `docs/research/decisions/slate-v2-destructive-leaf-boundary-legacy-parity.md`
  - `docs/solutions/logic-errors/2026-04-25-slate-v2-destructive-delete-must-clean-empty-leaves-before-render.md`
  - `tmp/completion-check.md`
  - `tmp/continue.md`
  - `../slate-v2/packages/slate/src/core/leaf-lifecycle.ts`
  - `../slate-v2/packages/slate-browser/src/core/release-proof.ts`
  - `../slate-v2/packages/slate-browser/test/core/release-proof.test.ts`
  - `../slate-v2/package.json`
  - `../slate-v2/scripts/proof/persistent-browser-soak.mjs`
- rejected tactics: do not keep looping on this lane after `bun check:full`
  passes; future raw-device proof belongs to the dedicated mobile lane.
- do-not-do list: do not claim raw native mobile proof from this closure.
- next action: none for this plan.
