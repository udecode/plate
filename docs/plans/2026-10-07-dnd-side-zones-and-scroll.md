---
review_scopes:
  - dnd
review_basis: []
work_kind: implementation
---

# Side zones beside blocks and a drop line that follows scrolling

Status: executed, 2026-10-07; uncommitted in the working tree
Playbook: plan

## Brief

### What did you find?

Columns formed only from a 24 by 16 px strip inside a block. Padding never made columns, the comment button froze the line, and scrolling mid-drag left the line at stale coordinates.

### What will change?

Done and uncommitted. The padding beside a top-level block is a side zone, a block drag passes through controls, and the line re-resolves on each scroll.

### What do you need from me?

Nothing for this plan. Commits are yours. The left zone's fixed 32 px offset and the RTL handle side are open work with owners.

### What happens if I say go?

Go picks the next ledger item, reads and snapshots. This plan is executed and folded into the dnd subject.

### What could go wrong?

The 32 px offset fits only the copied handle. Real hand drift, OS drag, touch, Safari and right-to-left text are unproven, because Playwright emulates the drags.

## Scope

Two reports from the owner on 2026-10-07, in their words: "如果我们拖到这部分区域则不会显示这个drop line … 感觉现在只有很小的区域可以 拖动为column", then "左侧直接下拖的话 我们应该是成功的，但只要再左侧稍微偏离一点就要启动 to column的方案。 此外我们可能需要占用一部分block selection的区域？ 最好他们能够共存", and "node被拖动时候 若此时上下滚动的话 drop line的position好像有点问题" with a screen recording.

This plan continues the open side-drop plan, `docs/plans/2026-10-06-dnd-side-drop-columns.md`, and changes its strip default. The inner end strip stays. The start strip inside the box, outside zones for nested blocks and touch stay out of scope.

## Findings

Each finding was reproduced in Chromium with a scratch Playwright probe, run as diagnosis only, against the `next-server` on `localhost:3000` whose cwd is this checkout's `apps/www`. The probes, logs and screenshot are in the ignored `docs/plans/artifacts/2026-10-07-dnd-side-zones-and-scroll/`. The repository specs in Steps 1 to 3 are the proof.

- **The drop line freezes while the page scrolls.** The probe dragged "Collaborative Editing" from its handle and held the pointer. It then scrolled the playground's scroller by 37 px with no pointer move. The line stayed at viewport y 518, 12.6 px from the nearest block edge and through the "AI-Powered Editing" text. After paced dragovers it moved to y 533, 1.6 px from an edge (`scroll-run.log`, `scroll-stale-before-after-control.png`). `publishDropIndicator` (`packages/plitejs/src/dom/utils/drop-indicator.ts:45`) runs only from `applyEditableDragOver` (`packages/plitejs/src/react/editable/clipboard-input-strategy.ts:590`). No scroll listener re-resolves. That handler also resolves before it autoscrolls (`:621` then `:637`), so every autoscroll step paints one step stale. In real Chrome, a held pointer gets periodic dragovers that correct the line late. How often they fire was not measured; the recording shows a lag of a few px.
- **The comment button freezes the line.** With the pointer over a paragraph's discussion button, the line stayed at y 366 on the block above instead of moving to the paragraph's top at y 418. The control, the padding 40 px left of the button, painted y 418 (`button-run.log`). `shouldHandleEditorDragEvent` refuses any target that `isInteractiveInternalTarget` matches (`clipboard-input-strategy.ts:174`, `packages/plitejs/src/react/editable/input-controller.ts:168`). So a block dragover over a button returns before it resolves or paints, and a drop there does not run.
- **Padding never makes columns.** The same control shows the right padding resolves the paragraph and paints a horizontal edge. `inEndStrip` refuses `clientX > rect.right` (`packages/plitejs/src/dom/plugin/dom-drag.ts:446`). The side-drop build removed the start strip because a drag down at `rect.left + 12` landed beside (decision log of the side-drop plan, row at 2026-10-06T14:29:26Z).
- **Block selection and drag zones use separate events.** Marquee selection starts on `pointerdown` whose target is the editable itself (`packages/platejs/src/react/components/NodeSelection.tsx:519-524`). A block drag reaches the editor only as `dragover` and `drop`. A zone that is arithmetic in the dragover path cannot take a pointerdown. An element laid over the padding would.

## Main changes

- **The drop line re-resolves on scroll.** While a block drag session is active, a capture `scroll` listener on the document re-runs `resolveDOMDropTarget` for the last view that handled a dragover, with that dragover's pointer and copy intent, at most once per animation frame. The session's `release` removes it, and a view drops its repaint on `dragleave`. The repaint runs through the DOM phase scheduler under one key, so a frame resolves once. The resolver hit-tests with `elementFromPoint` on this path, because the old event target may have scrolled away. Autoscroll then needs no reorder, because its scroll fires the same listener.
- **Block drags pass through interactive elements.** `applyEditableDragOver` and `applyEditableDrop` skip the `isInteractiveInternalTarget` refusal when the session is a block drag. Text and file drags keep it.
- **Top-level blocks get outside side zones.** When the pointer is outside the root's content column, the resolver tests the anchor's padding zones before the edge loop. The anchor is the root-level block `probeAt` already finds. The right zone runs from the content's right edge to the root's right edge. The left zone runs from the root's left edge to `L - 32`, where `L` is the content's left edge, so the 22 px handle gutter and 10 px beyond it stay before or after. Each zone covers the block's full height. Its side is `end` or `start` by the block's computed direction. The left zone's offset is physical and assumes the copied handle sits left of a left-to-right block; right-to-left text is open work. A zone that does not admit falls through to the edge loop, as the inner strip does. Blocks inside a column, cell, quote or details get no outside zone.

## Layer and owner

| Delta | Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- | --- |
| added | Scroll refresh of the drop line during a block drag | Plite | `plitejs`, `src/dom/utils/drag-session.ts` for the listener's lifetime, `src/react/editable/clipboard-input-strategy.ts` for the last dragover | The session already owns every transient drag listener and its cleanup |
| added | Outside side zones beside top-level blocks | Plite | `plitejs`, `src/dom/plugin/dom-drag.ts` | The mounted view owns geometry; Column still decides what a side builds |

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- | --- |
| changed | Drop indicator | One indicator per view paints only admitted edges, clears at drag end, re-resolves after each scroll and paints while the pointer is on a control inside the editor | Native bridge package test; two-view case in Playwright, three engines; www `dnd.spec.ts` scroll and button cases, three engines, five runs each; still pointer unproven | `plan` Phase 3, open finding 6; `side zones plan` Steps 1 and 2 |
| added | Outside side zones | A block dropped in the padding beside a top-level block lands beside it; the handle column and 10 px past it keep before and after | `dom-drag-geometry.test.ts`; www `dnd.spec.ts` in three engines, five runs each | `side zones plan` Step 3 |
| added | Marquee beside side zones | A pointerdown in the padding still starts block selection | www `dnd.spec.ts` `dnd:block-selection-from-side-padding`, three engines, five runs each | `side zones plan` Step 3 |

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where the left zone starts | `L - 32`, 19 px past the handle's center and 10 px past the gutter | At the gutter's edge, `L - 22`, or only after a dwell | "left zone at the gutter" or "dwell left zone" |
| Which blocks get outside zones | Root-level blocks only | Every level, clamped to the parent's box | "outside zones in containers" |
| Height of an outside zone | The block's full height | The middle half, as the inner strip | "middle-half outside zones" |
| Which drags pass interactive elements | Block drags only | Text and file drags too | "pass all drags" |
| The inner start strip | Stays removed | Restore it with the outside zones | "both strips" |
| Narrower proofs for Steps 1 and 4 | Accepted by the owner on 2026-10-07 | Run the autoscroll case and the missing cohorts | "run the missing proofs" |

## Steps

The plan runs under `.agents/playbooks/build.md`. A cheap test is written first and seen failing for its named defect, then lands with its fix.

- [x] **Step 1. Re-resolve the drop line on scroll.** Add the listener per Main changes. Add a www `dnd.spec.ts` case modeled on the scratch probe. It starts a block drag, holds the pointer, scrolls the scroller 37 px, waits one frame, and expects the line within 1 px of the edge of the block under the pointer. It fails at base with a 12.6 px offset (`scroll-run.log`). Also assert that the line follows a page autoscroll step. Run it in Chromium, Firefox and WebKit, five warm runs each without retries. Capture a screenshot right after the scroll and inspect that the line sits on a block edge. Closed, with the narrower proof the owner accepted on 2026-10-07, by `dnd:drop-line-follows-scroll` (red at base with a 14.8 px offset, `step1-red.log`; mutation M1 red) and its leave case (mutation red, `mutation-leave.log`), with the three-engine runs in `accept/`. Deviations: no separate autoscroll case, and the line is compared with a fresh dragover's line instead of a block edge, because the indicator paints at the gap center (decision log).
- [x] **Step 2. Let block drags pass through interactive elements.** Change `applyEditableDragOver` and `applyEditableDrop` per Main changes. Add one www case. It hovers a paragraph's discussion button during a block drag, expects the line at that paragraph's edge, and drops there. It fails at base with the line held on the previous block (`button-run.log`). A must-still-accept case keeps a text drag over a button refused, through the existing guard test if one covers it. Three engines, five warm runs each without retries, and an inspected screenshot of the line at the paragraph's edge. Closed by `dnd:drop-over-interactive-element` (red at base, `step2-red.log`; mutation M2 red) and the existing text-drop guard test in `dom-coverage-native-bridge-contract.test.ts`. Deviation: after Step 3 the button sits in a side zone, so the drop there builds columns (decision log).
- [x] **Step 3. Add the outside side zones.** Closed by `packages/plitejs/test/react/dom-drag-geometry.test.ts` and `apps/www/tests/browser/dnd.spec.ts`, per its sub-steps.
  - [x] Add `dom-drag-geometry.test.ts` cases. The right padding at mid-height returns `{ side: 'end' }`. The left padding beyond `L - 32` returns `start`. `L - 13 ± 8` returns a y edge. A block inside a column returns no outside side. A zone refused without a Column contributor returns today's y edge. RTL maps the left zone to `end`. Run `bun run test:react test/react/dom-drag-geometry.test.ts` from `packages/plitejs`. Each case fails at base, where padding yields only y edges. Closed by four new cases, red at base (`step3-geometry-red.log`), plus an edge-fallback case that passes at both. Deviation: the padding beside a nested block resolves to its top-level block, so no nested block gets the side (decision log).
  - [x] Add www `dnd.spec.ts` cases in three engines, five warm runs each without retries, with an inspected screenshot of the vertical line in each padding. A drop in the right padding beside a paragraph makes a two-column group with the payload second. A drop in the left padding puts the payload first. The existing drift case also runs at `L - 13 ± 8` and still lands below. A marquee started in the left padding still selects two blocks, unless an existing test already fails when an element covers the padding. Closed by the right padding, left padding, drift-left (now asserting the block lands directly below, `drift-*.log`, mutation `mutation-m3.log`) and `dnd:block-selection-from-side-padding` cases in `accept/`, and `zones.png` showing both vertical lines and the horizontal line in the handle column. Deviation: the landing plan's list-gutter case moved from the far-left padding to the item's handle gutter (decision log).
- [x] **Step 4. Measure and document.** Closed by `docs/plans/artifacts/2026-10-07-dnd-side-zones-and-scroll/bench/run.log`, `content/docs/(plugins)/(functionality)/dnd.mdx` and `.changeset/plitejs-side-landing.md`, per its sub-steps.
  - [x] Run Benchmark's pre-acceptance probe with the performance pack, per Performance below. Measure the baseline on this plan's base tree first, freeze the budgets, then measure the candidate. Closed with the narrower proof the owner accepted on 2026-10-07. `bench/` measured cohorts C1 (columns), C2 (columns, strip) and C4 (strip) at 5,000 blocks, plus a scroll cohort of 60 frames of 30 px and five extra scroll events. Planted controls are in `bench/planted.log`, and the final-bytes rerun of C1 and the scroll cohort is in `bench/final.log`. The virtualized and closed-details cohorts, the 2,000 px wheel scroll and rect reads per resolve did not run.
  - [x] Run `plate-docs` on `content/docs/(plugins)/(functionality)/dnd.mdx` (lines 21 and 67) and `content/docs/(plugins)/(elements)/column.mdx` (line 16), with their `.cn.mdx` twins, so they describe the padding zones. Proof is the docs checks and a preview of both pages. Closed by `build:source` and the docs source parity script passing, and the four routes on `:3102` serving the new text (`docs-receipts.log`). No visual preview was inspected. `check:docs` stops at `api-reference:check` on `HistoryApi`, the side-drop plan's open item, before its later steps run.
  - [x] Run `changeset` for the `plitejs` behavior change. Fold it into `.changeset/plitejs-side-landing.md` while that changeset is uncommitted. Closed by three bullets in that file.
- [x] **Step 5. Close.** Run `deslop`, then `no-comments` on the code, `unslop` on the plan and docs, `pnpm lint:fix` on this plan's paths, and the Step 1 to 3 browser cases once more on the final bytes. Then write the Close and fold this plan into `docs/plans/topics/dnd.md`. Closed by the Close below, the fold into `docs/plans/topics/dnd.md` and the `--folded` render.

## Completion Gates

| Gate | Artifact |
| --- | --- |
| `plate-docs` on `dnd.mdx`, `column.mdx` and their Chinese twins | Skill `plate-docs`; `build:source` and the docs source parity script pass |
| `pnpm check` steps the edits reach: typecheck, plite-test, public-types, core-audits | All four exit 0 on the final bytes (`final2-*.log` in the run's scratch) |
| `pstack:thermo-nuclear-code-quality-review` on the shared Plite diff | `/private/tmp/claude-501/dnd-thermo/summary.md`; its move into `dom-drag.ts` was reverted (decision log) |
| Benchmark rerun on the final source | `bench/final.log`, C1 and the scroll cohort only |
| `best-api repair` for a changed public API | skip: no public signature changed; `resolveDropTarget` already returned `{ key, side }` with `side: 'start' \| 'end'` |
| `pstack:blast-radius` before a public API change | skip: no public API change |
| Review ledger `draft` and `record` | `docs/research/review-records/2026-10-07-dnd-side-zones-and-scroll-execution.json` (partial), then `2026-10-07-dnd-side-zones-and-scroll-completed-execution.json` (completed) |

## Performance

- applicability: applied
- Vercel rules used: none; the change adds no React render or subscription
- extra rules used: css-layout-hotpath, event-delegation-budget
- repeated unit: none per block. One capture `scroll` listener per drag session and one re-resolve per animation frame while the page scrolls. The outside zones add arithmetic on rects the resolver already reads.
- cohorts: the existing dragover lane's cohorts at 5,000 blocks, normal, virtualized and with 3,000 closed details, plus one new cohort that scrolls 2,000 px by wheel during a held block drag
- budgets: dragover p95 within the base tree's value plus 1 ms; re-resolves at most one per frame in the scroll cohort; rect reads per re-resolve no more than the same dragover reads at that point. A planted control that re-resolves on every scroll event without frame coalescing must fail the per-frame line.
- interaction metrics: dragover p95 and scroll-frame time p95 in the scroll cohort
- trace/CWV proof: skipped; the claim is lab-only and changes no load path
- memory tags: skipped; one listener and one stored pointer per session
- degradation contract: none; no DOM is omitted or virtualized
- dashboard/RUM gap: no field data on drag latency
- plan delta: Step 4 gained the scroll cohort, the per-frame budget and its planted control

## Close

Reversals and deviations come first.
- **Thermo-nuclear move reverted.** The review moved the scroll repaint into `dom-drag.ts`. That import order broke two react-partition contracts, so the code went back to the Editable as a module-local helper.
- **Step 1 proof.** The line is compared with the line a fresh dragover paints, because the indicator sits at the gap center rather than on a block edge. There is no separate autoscroll case.
- **Step 2 outcome.** The comment button sits in the right padding, so a drop there now builds columns.
- **Nested blocks.** The padding beside a nested block resolves to its top-level block, so a nested block never gets the side.
- **List gutter case.** The landing plan's case that dropped from the far-left padding now drops from the list item's handle gutter. The far-left padding is a start zone, as you asked.
- **Repaint ownership.** Comment review replaced the "indicator is clear" guard. A view now drops its repaint on `dragleave`, and the repaint runs through the DOM phase scheduler, as `kernel-authority-audit-contract` requires.
- **Process slip.** I edited two files while comment-sicko was still reading them (decision log).

What landed, uncommitted in the working tree:
- **Plite resolver.** `paddingSide` in `packages/plitejs/src/dom/plugin/dom-drag.ts` adds the padding zones.
- **Plite session.** `packages/plitejs/src/dom/utils/drag-session.ts` adds the scroll repaint and `clearDragScrollRepaint`.
- **Editable.** `blockDrag` and the scheduled repaint are in `packages/plitejs/src/react/editable/clipboard-input-strategy.ts`, and the leave clear is in `packages/plitejs/src/react/components/editable.tsx`.
- **Tests.** Five geometry cases. In `dnd.spec.ts`: three padding cases, two scroll cases, a button case and a marquee case, plus the moved list-gutter case.
- **Harness.** A `--scroll` cohort in `apps/www/scripts/run-dnd-perf.mts`.
- **Docs and release.** English and Chinese docs for dnd and column, and three changeset bullets.

Proof and its limits:
- **Red before green.** The scroll, button and four geometry cases failed before their fixes; the edge-fallback geometry case passes at both as a must-still-accept. Mutation controls on the final bytes failed the scroll, button, leave and drift-left cases.
- **Packages.** The react partition passes, 1,430 tests. typecheck, plite-test, public-types and core-audits exit 0.
- **Browser.** The changed cases ran five times without retries in Chromium, Firefox and WebKit (`accept/`). WebKit is not Safari, and no OS drag, touch device or real hand ran.
- **Performance.** Every measured cohort stayed within the baseline plus 1 ms, and the scroll cohort resolved at most once per frame. Both planted controls broke their budgets. On the final bytes only C1 and the scroll cohort reran.
- **Visual.** `after-stack.png` shows the line on the gap after a held scroll, and `after-button.png` shows the side line while the pointer is on the comment button.
- **Docs.** `build:source` and the parity script pass, and the four routes serve the new sentences (`docs-receipts.log`); no visual preview was inspected. `check:docs` stops earlier, at `api-reference:check` on `HistoryApi`, which the side-drop plan lists as open, so its later steps did not run in that command.

Of 10 boxes, all 10 are done. Steps 1 and 4 closed on the narrower proofs the owner accepted on 2026-10-07. None were partial, skipped, blocked or open.

The ledger's next item is `reads`, "Reads, snapshots and subscriptions" (`node tooling/scripts/review-ledger.mjs next`).

### Attention

Reviewed by codex gpt-6.1-sol at xhigh effort, a cross-family seat. It raised no critical finding, four warnings and two nits.
- **Drift case.** It now asserts the dragged block lands directly below, with a mutation control.
- **Docs gate.** Its receipts are saved, and the claim narrows to served text without a visual preview.
- **Post-fix screenshots.** Both are inspected and cited.
- **Benchmark coverage.** The memo and Close say only C1 and the scroll cohort reran on the final bytes, and the earlier row is superseded.
- **Wording.** The red-before-green wording and the RTL tracking are corrected.

## Open work

- **Left zone offset.** `HANDLE_CLEARANCE` hard-codes 32 px, which fits the copied handle's gutter. Measuring from the drag's start x would keep Plite independent of the registry. Owner: Plite DOM (`packages/plitejs/src/dom/plugin/dom-drag.ts`), tracked in this plan's decision log.
- **RTL handle side.** The copied gutter has no RTL variant, so in right-to-left text the handle may sit inside the block's right edge, and `HANDLE_CLEARANCE` assumes a left handle. No RTL browser case ran. Owner: Plate UI `dnd.tsx`, tracked in this plan's decision log (RTL deferral row).

## Proof

Each step's proof is named in its box. Every new test fails at base for its named defect, as Steps 1 to 3 state. Playwright drives emulated drags, so how far a real hand drifts, how often real Chrome sends dragovers to a held pointer, OS drag, touch and Safari stay unproven.
