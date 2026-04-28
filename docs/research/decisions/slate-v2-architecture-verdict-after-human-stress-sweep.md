---
title: Slate v2 architecture is right direction but not absolute or battle-tested yet
type: decision
status: accepted
updated: 2026-04-28
source_refs:
  - docs/slate-v2/absolute-architecture-release-claim.md
  - docs/slate-v2/release-readiness-decision.md
  - docs/slate-v2/replacement-gates-scoreboard.md
  - docs/plans/2026-04-27-slate-v2-internal-runtime-projection-firewall-plan.md
  - docs/plans/2026-04-27-slate-v2-selector-and-live-read-runtime-hard-cut-plan.md
  - docs/plans/2026-04-28-slate-v2-root-runtime-selector-guard-hard-cut-plan.md
  - docs/plans/2026-04-24-slate-v2-absolute-architecture-closure-plan.md
  - docs/plans/2026-04-26-slate-v2-human-editing-stress-sweep.md
  - docs/solutions/developer-experience/2026-04-27-slate-react-public-selectors-must-stay-model-truth.md
  - docs/solutions/developer-experience/2026-04-27-slate-react-runtime-owner-cuts-need-static-inventories-and-browser-proof.md
  - tmp/completion-check.md
  - docs/research/decisions/slate-v2-read-update-runtime-architecture.md
  - docs/research/decisions/slate-v2-data-model-first-react-perfect-runtime.md
  - docs/research/decisions/slate-v2-post-closure-architecture-review.md
  - docs/research/systems/slate-v2-perfect-plan-steal-reject-defer-map.md
  - /Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts
  - /Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts
  - /Users/zbeyens/git/slate-v2/packages/slate/test/write-boundary-contract.ts
  - /Users/zbeyens/git/slate-v2/packages/slate/test/public-field-hard-cut-contract.ts
  - /Users/zbeyens/git/slate-v2/packages/slate-dom/test/clipboard-boundary.ts
  - /Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable.tsx
  - /Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/root-selector-sources.ts
  - /Users/zbeyens/git/slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts
  - /Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx
  - /Users/zbeyens/git/slate-v2/playwright/stress/generated-editing.test.ts
  - /Users/zbeyens/git/slate-v2/package.json
related:
  - docs/research/decisions/slate-v2-perfect-plan-should-steal-read-update-transaction-discipline-and-extension-dx.md
  - docs/research/decisions/slate-v2-react-19-2-perf-architecture-vs-field.md
---

# Slate v2 architecture verdict after human stress sweep

## Question

Does Slate v2 currently have the absolute best architecture for React 19.2
runtime performance, hard-cut DX, Plate/Yjs migration, regression freedom, and
battle-tested editing?

## Decision

No, not yet.

The architecture direction is the right one:

- Slate model and operations remain the data and collaboration truth.
- `editor.read` / `editor.update` are the public lifecycle.
- primitive editor methods inside `editor.update` are the power API.
- `EditorCommit` is the local runtime fact for history, collaboration, React,
  DOM repair, and proof.
- extensions compose through `editor.extend`.
- React consumes live reads, dirty ids/ranges, commits, projection dirtiness,
  and capability-checked DOM text sync.
- browser claims require generated model + DOM + selection + commit proof.

That is the right "starting from scratch, pulled toward Slate" answer. It
correctly steals from Lexical, ProseMirror, and Tiptap while rejecting their
model choices that would punish Plate and Yjs migration.

But it is still not honest to call the current state absolute, regression-free,
or battle-tested. The item 4/5/6 hard-cut lane closes a serious gap: raw public
write/read escape hatches are cut or fenced, compatibility aliases are guarded
by release discipline, and generated browser contracts cover the reported
operation families. That moves the project from "humans are the regression
detector" toward a real proof spine.

It does not finish the broader architecture. The 2026-04-28 root runtime cut
closed the main root-component policy ownership smell, but runtime-owned public
void shells, legacy browser parity, Plate/Yjs migration proof, and real-device
soak still decide whether this becomes field-best instead of merely
field-serious.

## 2026-04-27 Current State

The item 4/5/6 hard-cut lane is complete:

- public `Editor.apply(editor, op)`, instance `editor.apply(op)`,
  `setChildren`, public `Editor.getLive*`, public `<Slate onChange>`,
  `SlateReactCompat`, decorate compat adapter, and `useEditor` are no longer
  normal public surfaces
- replay/import uses `applyOperations(...)`
- ordinary app writes use transactions, snapshots, transforms, and
  selector/runtime APIs
- generated `slate-browser` contracts cover inline void navigation, block void
  navigation, table boundary navigation, decoration refresh, mouse-selection
  toolbar, paste/normalize/undo, and IME repair
- `bun check:full` passed with release discipline, proof contracts, mobile
  guard, persistent-profile soak, and 628 Playwright rows passing with 4
  skipped replay-placeholder rows

That is a real upgrade over the 2026-04-26 verdict.

The selector/live-read runtime hard-cut lane is also complete:

- public `useNodeSelector` and `useTextSelector` are model-truth-only
- synced-text render skipping is internal to mounted render selector hooks
- direct `slate/internal` live reads in `slate-react/src` are limited to the
  runtime facade modules
- package guards prevent reintroducing the public stale-selector policy and
  scattered `slate/internal` imports
- focused browser rows for hovering toolbar, mentions, tables, images, and
  search highlighting pass
- `bun check:full` passes, with one Chromium richtext word-delete retry
  recorded as residual flake risk and the exact row passing alone with retries
  disabled

The remaining hard truth: this still does not prove absolute best architecture.
It proves the current direction deserves continued investment and that the
proof system is becoming serious.

## 2026-04-28 Current State

The root runtime selector guard lane is complete:

- `EditableDOMRoot` delegates root policy orchestration to
  `useEditableRootRuntime(...)`
- event handler assembly stays behind `useEditableEventRuntime(...)`
- generic root selectors are fenced to `root-selector-sources.ts`
- hot root render components are guarded against inline broad selectors and
  root policy calls
- release escape-hatch inventory reflected the reduced `react-runtime:stale`
  count after one stale core-field reference disappeared
- focused browser rows passed for hovering toolbar, search focus, mentions,
  tables, images, and large-document runtime
- `bun check:full` passed with 628 browser tests passing and 4 replay-artifact
  rows skipped

That removes the prior top React-component smell. The strongest remaining
architecture gap is now public DX and proof breadth:

- void authors still need helper components such as `VoidElement` and
  `InlineVoidElement`
- hidden spacer/anchor ownership is improved, but the normal public API still
  exposes enough shape that plugin authors can reach for raw `children`
- there is not yet a first-class `renderVoid` / runtime-owned shell contract
- browser parity against legacy `../slate` examples is not yet a generated
  operation-family harness
- Plate and Yjs migration are still architecture claims, not proved adapter
  lanes

The second hard gap is legacy browser parity. Core and benchmark lanes already
use legacy fixtures and `../slate` comparisons, but the browser proof spine is
not yet a generated current-vs-legacy example parity harness. Until the same
operation-family scenarios can run against legacy Slate examples and v2
examples, "tested against legacy" is only partly true.

## Current Architecture Grade

### React 19.2 runtime performance

Stronger after the selector/live-read cut, but still not proven absolute.

The current architecture has the right runtime facts: live reads, commit
dirtiness, dirty runtime ids, dirty top-level ranges, projection-source
invalidation, semantic islands, direct DOM text sync with fallback, and public
selector truth separated from internal mounted render skips.

The hard-cut lane adds a stronger public/runtime boundary, and generated
browser contracts reduce the chance that render fixes silently break editing.
The honest limit remains: React 19.2 makes Slate v2 competitive with serious
engines on React integration. It does not automatically beat ProseMirror's
document-view diff, Lexical's dirty-node reconciler, or VS Code's view-model
split.

The next React performance cut should remove broad hot-path React subscriptions
and direct `Editable` policy ownership where narrower runtime/source selectors
can own the same fact.

### DX and migration

The target DX is strong.

Keeping Slate's JSON-like model plus operation stream is the correct migration
magnet for Plate and Yjs. The hard cut away from public mutable fields and
primary `Transforms.*` usage is also correct. Public selectors staying
model-truth-only is the right app DX. Extension methods over `editor.update`
are cleaner than method monkeypatching, and less ceremonial than making
Tiptap-style `focus().chain().run()` the default mental model.

The weak point is not the public idea. It is migration proof. Plate and Yjs
need real adapter lanes and contract tests, not confidence from core tests
alone.

### Regression freedom

Better, but still not absolute.

The latest generated browser contracts close the exact class of problem exposed
by the human-like paste testing: model state, DOM state, selection, focus,
commit metadata, replay artifacts, and operation family coverage all matter.

That is the correct proof direction. It still needs wider operation-family
coverage, Plate/Yjs migration rows, longer persistent-profile soak, and real
device lanes before "regression-free" is an honest phrase.

It also needs browser parity against legacy Slate, not only core oracle rows
and performance comparisons against `../slate`. The current browser stress
suite is v2-centered. That is useful, but it cannot prove that v2 preserved
legacy editing behavior across examples.

`test:stress` being a separate command is correct. The mistake would be
pretending that a sparse stress corpus plus `bun check:full` means humans will
stop finding bugs. The right bar is generated, replayable, shrinking-capable
browser contracts by operation family, called sparingly but treated as release
law.

### Battle-tested status

No.

Current status is "architecture-serious with strong focused proof", not
"battle-tested".

Battle-tested requires weeks of green adversarial runs across:

- paste and clipboard variants
- select-all replacement
- word and block deletion
- IME and composition
- table, void, inline, mark, and block boundaries
- undo/redo after native and model-owned actions
- persistent debug profiles
- cross-browser rows
- scoped raw-device mobile rows when mobile is claimed
- Plate and Yjs migration rows

## Harsh Take

If the goal is absolute best, stop treating individual user reports as the test
suite.

The architecture is good enough to bet on harder. It is not good enough to
declare victory. The next architecture work should stay focused on runtime
ownership and proof architecture:

1. Finish selection/repair/composition ownership extraction so `Editable` wires
   runtime modules instead of owning policy. This is largely closed for the
   root component after the 2026-04-28 root runtime cut; keep the guards tight.
2. Move public void/atom rendering to runtime-owned shells so app renderers own
   visible content only.
3. Keep every browser-editing claim under generated model + DOM + selection +
   commit assertions.
4. Add legacy parity rows for every supported example route and operation
   family where parity matters.
5. Add Plate adapter and Yjs adapter migration rows before saying the API is
   migration-ready.
6. Keep direct low-level replay through `editor.applyOperations`, but keep
   ordinary app writes inside `editor.update`.
7. Treat any new "works in package tests, breaks in browser" result as a
   missing proof row, not a one-off patch.

## Bottom Line

Do not pivot to Lexical, ProseMirror, or Tiptap.

Do pivot harder into the current Slate v2 architecture and make the proof
system brutal enough that humans stop being the regression detector.
