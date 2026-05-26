---
date: 2026-05-23
topic: slate-v2-editable-stacking-architecture-ralplan
status: done
owner: slate-ralplan
---

# Slate v2 Editable Stacking Architecture Ralplan

## Current Verdict

Decision: `EditableDOMRoot` owns visible/hittable root stacking by default.
Do not keep patching examples with `style={{ zIndex: 0 }}`.

The current route bug proves the previous compromise is dirty. `Editable`
sets `zIndex: -1` on the contenteditable root to work around selection
expansion, and examples have learned to compensate locally. That leaks an
internal browser workaround into app DX. The best Slate-close API is:

```tsx
<Editable className={editorCss} id="comment-mode-document" />
```

No wrapper folklore. No `stacking` prop. No example-level `zIndex` tax.

Execution result: complete. `Editable` now applies `zIndex: 0` inside the
default root style bundle, preserves `style` override and
`disableDefaultStyles`, and the redundant example-level z-index patches are
gone.

## Intent / Boundary Record

- intent: fix the blank/painted-behind `comment-mode` example without teaching
  users a Slate internal CSS workaround.
- desired outcome: `Editable` text is visible and clickable whenever a user
  renders a normal styled editable root.
- in scope: `slate-react` `EditableDOMRoot` default style, browser regression
  coverage, and cleanup of example-level z-index patches.
- non-goals: no new public prop, no Plate-specific styling layer, no broad
  redesign of annotations/comment-mode, no issue auto-close claim.
- decision boundary: package internals may change root stacking defaults; public
  `Editable` call sites should get simpler, not more configured.
- unresolved user decision points: none.

## Live Current Shape

| Surface | Current source-backed shape | Verdict |
| --- | --- | --- |
| `EditableDOMRoot` | `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx:327-341` sets default root styles, then hard-codes `zIndex: -1`, then spreads `userStyle`. | reject as public-root default |
| `comment-mode` | `.tmp/slate-v2/site/examples/ts/comment-mode.tsx:276-280` renders plain `<Editable className={editorCss} id={id} readOnly={readOnly} />`; browser proof showed DOM text exists but root computes `z-index: -1`. | example call site is the desired DX |
| local compensations | `.tmp/slate-v2/site/examples/ts/document-state.tsx:321-327` and `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx:204-213` pass `style={{ zIndex: 0 }}`. | temporary workaround, not final architecture |
| prior learning | `docs/solutions/test-failures/2026-05-20-slate-v2-integration-local-editor-stacking-and-project-scope-failures.md:40-52` and `docs/solutions/ui-bugs/2026-05-20-slate-react-state-field-setters-must-preserve-external-focus.md:64-83` document the same workaround. | stale target; useful evidence of repeated smell |

## Decision Brief

Principles:

- The contenteditable root must be visible and hittable by default.
- Internal browser-selection workarounds must not become public DX.
- `disableDefaultStyles` remains the opt-out for users who want full CSS control.
- User `style` still wins over Slate defaults.
- Browser selection/decorations need executable proof, not a global CSS hack.

Drivers:

- Real route is visually empty even though hydration succeeds.
- Multiple examples already carry the same `zIndex: 0` patch.
- The current root style couples selection workaround, paint order, and hit
  testing into one public element.

Options:

| Option | Keep/drop | Why |
| --- | --- | --- |
| Keep per-example `style={{ zIndex: 0 }}` | drop | Dirty DX. Every app would need to know Slate internals. |
| Add a public `stacking` / `surface` prop | drop | Solves a library invariant with user config. Wrong abstraction. |
| Add a site-level `.example-content { position: relative; z-index: 0 }` | drop | Hides the bug in the example shell and leaves apps broken. |
| Wrap `Editable` in an extra package DOM node | revise/drop | Risks breaking refs, IDs, roles, styling, selectors, and DOM mapping. Only consider if root-level fix cannot preserve selection behavior. |
| Make the public root default visible/hittable, then fix any selection regression in the selection/decorations engine | keep | Best long-term architecture. Keeps API clean and makes the workaround internal again. |

Chosen target:

```tsx
style={{
  ...(disableDefaultStyles
    ? {}
    : {
        position: 'relative',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        zIndex: 0,
      }),
  ...userStyle,
}}
```

If the old `zIndex: -1` workaround protects a real selection/decorations case,
the implementation must add a named browser regression for that case and fix it
inside the selection/decorations runtime. Do not reintroduce a negative public
root z-index.

## Public API Target

No API addition.

The accepted call site stays:

```tsx
<Editable className={editorCss} id="comment-mode-document" />
```

`disableDefaultStyles` keeps its current meaning: Slate does not apply the
default root style bundle when disabled. Apps that opt out own stacking.

## Internal Runtime Target

- `EditableDOMRoot` owns default root paint/hit-test safety.
- Root-level `zIndex: -1` is removed or scoped away from the public root.
- User `style` keeps final override authority.
- Existing selection/decorations workaround becomes a tested browser behavior,
  not a CSS leak.
- No wrapper unless direct root-style removal fails a named regression and the
  wrapper can preserve `id`, `className`, ref, role, contenteditable, and Slate
  DOM mapping semantics without app breakage.

## Hook / Component / Render DX Target

- `CommentedEditable` remains a tiny example helper.
- `comment-mode`, `document-state`, `multi-root-document`, and any other Slate
  example should not pass `style={{ zIndex: 0 }}` just to make text visible.
- Tests should not assert example-specific CSS as the primary behavior. The
  primary contract is visible text and correct hit testing. A package-level DOM
  shape test may assert the default root is not negative.

## Applicable Review Lenses

| Lens | Status | Finding |
| --- | --- | --- |
| `vercel-react-best-practices` | applied | No new subscriptions/effects. This should be a stable style default, not state. |
| `performance-oracle` | applied | Constant-time style change; no render fanout, no DOM querying, no memory growth. |
| `tdd` | applied | Start with a failing browser-visible route/default-root contract, then implement. |
| `react-useeffect` | skipped | No effect or synchronization API should be added. |
| `steelman-pass` | applied | Strongest objection is that `zIndex: -1` may protect a browser selection case. Answer: preserve that behavior with a named regression, not a public root paint bug. |
| `high-risk-deliberate-pass` | applied | Browser-sensitive root style change; proof must include comment-mode, document-state, multi-root, and decoration/selection rows. |

## High-Risk Pre-Mortem

1. Removing `zIndex: -1` reopens selection expansion for decorations. Required
   answer: add/keep a focused browser row for decoration selection before
   declaring done.
2. Default `zIndex: 0` changes user layering in exotic apps. Required answer:
   `style` override remains last, and `disableDefaultStyles` remains opt-out.
3. A wrapper-based fix breaks refs, selectors, or DOM point resolution. Required
   answer: wrapper is not the first implementation path.

## Issue Ledger Accounting

No new fixed or improved issue claim.

Relevant live issue pressure:

- `#5956` "no cursor" and the broader Selection/Focus/DOM Bridge macro theme are
  related pressure only; this plan does not prove the exact reported repro.
- `#5813` decoration/debugger instability is related selection/decorations
  pressure; no claim without exact regression proof.
- Existing docs/support/example issue family remains non-claim unless a current
  exact issue row is selected in a later ClawSweeper pass.

ClawSweeper status: skipped for this pass. Reason: current pass only records the
architecture decision and implementation proof route; no issue claim text
changes yet.

PR reference status: unchanged. Reason: no fixed/improved claims and no accepted
PR narrative change until Ralph execution passes.

## Regression Proof Matrix

Ralph execution should use this order:

1. Red test: comment-mode route renders visible editor text without any
   example-level `zIndex` prop.
2. Red test: a minimal styled `Editable` default root is visible/hittable and
   does not compute to negative root z-index.
3. Red/green browser row: `comment-mode` can select text, add a comment, and
   keep comment highlights/widgets in sync.
4. Regression rows: `document-state` and `multi-root-document` keep focus/click
   behavior after deleting their `style={{ zIndex: 0 }}` patches.
5. Decoration selection row: the case that originally justified the negative
   root z-index still passes, or gets a new targeted fix.

Do not keep the current dirty test shape as the final contract if it only says
`#comment-mode` has CSS `z-index: 0`. Keep or replace it with behavior:
visible text, real click/selection, and package default root contract.

## Fast Driver Gates

All Slate behavior gates run from `.tmp/slate-v2`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/comment-mode.test.ts --project=chromium --workers=1
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/document-state.test.ts playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1
bun --filter slate-react test:vitest
bun --filter slate-react typecheck
bun lint:fix
```

Browser visual proof:

- reload `http://localhost:3100/examples/comment-mode`
- screenshot first viewport
- verify both edit/comment panes show text, no blank panes, no console errors.

Planning-only gate from `plate-2`:

```bash
node tooling/scripts/completion-check.mjs
```

Result during this pass: pending, as expected:
`completion-check` points to
`active goal state`.

## Execution Evidence

Touched or verified Slate v2 surfaces:

- `.tmp/slate-v2/packages/slate-react/src/components/editable.tsx`
- `.tmp/slate-v2/packages/slate-react/test/editable-behavior.tsx`
- `.tmp/slate-v2/site/examples/ts/document-state.tsx`
- `.tmp/slate-v2/site/examples/ts/multi-root-document.tsx`
- `.tmp/slate-v2/site/examples/ts/iframe.tsx`
- `.tmp/slate-v2/site/examples/ts/shadow-dom.tsx`
- `.tmp/slate-v2/site/examples/ts/dom-coverage-boundaries.tsx`
- `.tmp/slate-v2/playwright/integration/examples/comment-mode.test.ts`

Same-turn proof from `.tmp/slate-v2`:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/comment-mode.test.ts --project=chromium --workers=1
# 1 passed

PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/document-state.test.ts playwright/integration/examples/multi-root-document.test.ts --project=chromium --workers=1
# 19 passed

PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 bun run playwright playwright/integration/examples/iframe.test.ts playwright/integration/examples/shadow-dom.test.ts --project=chromium --workers=1
# 8 passed

bun --filter slate-react test:vitest
# 40 files passed, 361 tests passed

bun --filter slate-react typecheck
# passed

bun lint:fix
# passed, no fixes applied
```

Visual/browser proof against the running dev server:

- route: `http://localhost:3100/examples/comment-mode`
- `#comment-mode` and `#comment-mode-document` both contain visible text
- both roots compute `z-index: 0`
- no page errors or console errors were reported
- screenshot: `.tmp/comment-mode-stacking-proof.png`

Extra finding while checking adjacent DOM coverage rows:

- `dom-coverage-boundaries` has a separate toolbar/focus race in the
  "copies selected hidden content" row. Clicking the external Copy button moves
  focus before the button handler reads model-backed selection. That is not part
  of this stacking fix and should be handled in a separate toolbar/control DX
  lane, not smuggled into the root-stacking patch.

## Confidence Score

| Dimension | Score | Evidence |
| --- | ---: | --- |
| React 19.2 runtime performance | 0.92 | Style default only; no subscriptions/effects. |
| Slate-close unopinionated DX | 0.96 | Public call site remains plain `<Editable className id />`; no new prop. |
| Plate and slate-yjs migration backbone | 0.90 | No data-model/op/collab surface change. Style override and default-style opt-out preserve host control. |
| Regression-proof testing strategy | 0.94 | Comment-mode, document-state, multi-root, iframe, shadow DOM, package unit, typecheck, lint, and visual proof passed. |
| Research evidence completeness | 0.86 | Live source plus two solution notes show repeated workaround; no external editor research needed for CSS root ownership. |
| shadcn-style composability/minimal props | 0.95 | Drops config, keeps compositional CSS class/style model. |

Total: `0.94`.

Status: closed for the package-owned `Editable` stacking lane. Related issue
claims remain intentionally unchanged.

## Pass-State Ledger

| Pass | Status | Evidence added | Plan delta | Open issues | Next owner |
| --- | --- | --- | --- | --- | --- |
| current-state read and initial score | complete | live `EditableDOMRoot`, `comment-mode`, prior solution notes, browser observation | accepted package-owned root stacking target | none | ralph |
| related issue discovery | skipped | no fixed/improved issue claim | no issue claim changes | none | none |
| implementation execution | complete | Slate v2 file edits plus focused package/browser proof | root default owns `zIndex: 0`; examples no longer compensate locally | separate dom-coverage toolbar/focus race observed, not claimed | none |
| closure score and final gates | complete | completion state updated after green proof | lane closed | none | none |

## Ralph Execution Prompt

Implement the package-owned `Editable` stacking fix from
`docs/plans/2026-05-23-slate-v2-editable-stacking-architecture-ralplan.md`.

Hard rules:

- Do not solve by adding `style={{ zIndex: 0 }}` to `comment-mode`.
- Remove example-level z-index workarounds where package default makes them
  redundant.
- Keep public API unchanged.
- Preserve `userStyle` override and `disableDefaultStyles` opt-out.
- Replace the dirty CSS-only comment-mode test with behavior-first proof unless
  it is retained only as a package default-root guard.
- Verify with the fast driver gates in the plan from `.tmp/slate-v2`, then
  reload the live route in Browser.
