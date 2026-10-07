---
review_scopes:
  - dnd
  - layout
review_basis: []
work_kind: implementation
---

# Side-drop columns

Status: building: uncommitted; 9 of 16 steps partial; the API reference manifest waits on `HistoryApi`, which other owners hold
Playbook: plan

## Brief

### What did you find?

Side drop needed one generic Plite extension point. The build also fixed a shipped `setColumns` crash, a key mismatch between read state and views, and an import cycle the full test partition caught.

### What will change?

Dropping a block on another block's inline-end strip makes them columns, or adds a column beside a block in a column. A handle menu offers the same as Move beside previous and next.

### What do you need from me?

Run `/setup-pstack` to write the missing models sheet. The Codex seats answer again after your CLI upgrade. You own the left-side approach.

### What happens if I say go?

Once your left-side approach lands and the partial boxes close, I fold this plan into the dnd subject, mark it executed and republish the page. Nothing is committed.

### What could go wrong?

No cross-family seat reviewed anything, because both Codex seats failed. Most mutation controls ran before the last restructure. The API reference manifest waits on `HistoryApi`.

## Close

Reversals and deviations come first.
- **Strip side.** The strip is inline-end only, because the plan's drift gate failed with both strips and applied its named fallback.
- **Wrap shape.** `TransferWrap` became a union with an `ancestor` level, because a key minted in a read belongs to the runtime owner and a view resolves its own.
- **Removed surface.** `editor.read.transfer.check` dropped its unused `copy` flag. The side gate (`hasSideLanding`, `hasReadMiddleware`) was deleted after measurement showed no cost without it.
- **Upload.** Upload narrows with `'edge' in target` instead of a `files` overload.
- **Step 0.** It folded into the platejs changeset and relied on the existing additive repair test instead of the two planned must-still-accept cases.
- **Build question.** The build question recommended Build now where AGENTS.md said Hold, because round 2's fixes changed public refusals and Column's correction output. The api-build panel then reviewed the diff.

What landed, uncommitted in the working tree:
- **Plite.** The side law, made of `TransferSide`, `transfer.side`, `TransferWrap`, `TransferVetoInput.wrap`, `editor.read.transfer.check`, side strips and the indicator, and the `transfer-guard.ts` split.
- **Plate.** The Column side read with a drop cap of 5, over-full width rescaling, the `setColumns` tolerance fix and the Footnote veto.
- **Registry and docs.** The copied menu actions, docs in English and Chinese, Vision, two changesets and a registry changelog entry.

Proof and its limits:
- **Tests.** 117 package tests, 17 geometry tests and 1,425 react partition tests pass. The partition passed three times in a row after the import-cycle fix.
- **Mutation controls.** Most ran before the restructure and panel fixes, so they prove those earlier bytes. Only MV, MW and M3b ran on later bytes.
- **Browser.** Playwright passed the new cases five times and the full `dnd.spec.ts` once in Chromium, Firefox and WebKit on the dev source build. On the final bytes each engine passed 40 of 40 side runs and 28 of 28 full cases. Two Chromium screenshots show the vertical bar at the heading's right edge and the two blocks as columns after the drop; Firefox and WebKit paint was not captured. WebKit is not Safari, and no OS drag, touch device or screen reader ran.
- **Performance.** Dragover p95 stayed within baseline plus 1 ms in four cohorts at 5,000 blocks, on React development builds under `next dev`, not the production path. With p95 near 1 ms and a 0.1 ms timer, that budget would admit a 2x regression, and no planted slowdown tested it. Admissions were counted only in the geometry test.
- **Review.** Two plan panel rounds and one api-build round ran with opus plus fable and sonnet; both Codex seats failed.
- **`pnpm check`.** `lint`, `test-slow` and `www`'s `api-reference:check` fail the same way at HEAD. `core-audits` passes with the Column chain entry you approved on 2026-10-07. The www `tsc` reports 13 errors in untouched AI route files that a HEAD worktree did not reproduce; their cause is not established.

Counts: 16 steps. 7 done, 9 partial, 0 skipped, 0 blocked, 0 open. Partial:
- the two phase parents and the Phase 1 keep box, which rest on partial children;
- the `landAt` step (no cross-root side test);
- the strip step (no x-axis case);
- the Benchmark step (no browser admission count);
- the menu step (no no-Column browser case);
- Docs (`check:docs` red at HEAD);
- Vision (no forward test);
- Closeout (the API reference manifest waits on `HistoryApi`).

Open work and owners are listed under Open work.

### Reflect

The reflect run applied 16 accepted lessons and rejected 15; its backlog went to Open work and the workflow items below.
- **Applied here.** `plan.md` loads `verify` before proof gates and lists reversed chat claims in the build question. `build.md` runs reachable `pnpm check` steps before an acceptance matrix. `verify` covers background matrices, split owner and view fixtures, failures that pass alone, worktree installs for `next dev`, probe preloads and TS6305. `benchmark` sizes budgets with a planted slowdown and measures removal. `best-api` checks widened guard inputs. `plate-plugins` and `plate-ui` trigger earlier.
- **Waiting for the shared source.** Three lessons in `AGENTS.md` under "Lessons waiting for the shared source": language as a standing constraint, a Brief in the user's language beside the link, and seat configuration errors as a first-time blocker. The `sync-pstack` skill is not installed, so nothing was pushed.
- **Workflow backlog.** A non-retryable seat error in `cross.mjs`, a missing-models-sheet check, chained check steps that report every failed sub-command, approval and expiry on schema-audit entries, a computed build recommendation, ledger gate cells in `plan-open.mjs`, every Brief violation per `plan-page.mjs` run, a stale-dist refusal in `api-reference`, and an import-cycle check for `plitejs`.

### Attention

Reviewed by claude-opus-5-5, a same-family fallback after the `codex:gpt-6.1-sol @xhigh` seat refused the ChatGPT-account login.
- **Stale registry and hidden www checks.** I rebuilt the registry and ran the www sub-checks directly.
- **Pre-existing claims not reproduced.** `lint` now fails the same way at HEAD. The Close narrows the `core-audits` and `plite-test` claims.
- **An unsuperseded acceptance row.** The log now supersedes it and three other replaced rows.
- **Boxes resting on narrowed proof.** They are unchecked, and the counts above include them.
- **The misrecommended build question.** The reversals above record it.
- **The unmeasured side gate.** I measured it, found no cost without it, and deleted it.
- **Writing passes, required skills and seat models.** The decision trail logs these lesser findings.

## What other editors do

The October 2 landing review read BlockNote `1e26f1c5`, ProseMirror, Tiptap, Lexical, ProseKit, Slate and CKEditor 5 in local source, without running them. Only BlockNote builds columns from a side drop. The others have no side target, because their landing is before or after a block.

| Delta | Editor | Side drop | Structure it builds | Emptied source | Source |
| --- | --- | --- | --- | --- | --- |
| added | BlockNote `1e26f1c5`, `xl-multi-column` (read, not run) | The left edge or the right 10% of a block | A column list from a block's edge, or a new column with width normalization; a column's whole content dropped on its own edge is a no-op | not recorded | `docs/plite/research/2026-10-02-dnd-landing-policy/editors.tsv:18`, citing `multiColumnDropCursor.ts:18-74` and `multiColumnHandleDropPlugin.ts:45-197` |
| added | ProseMirror, Tiptap, ProseKit, Lexical, Slate fork, CKEditor 5 (read, not run) | None | None | not applicable | `docs/plite/research/2026-10-02-dnd-landing-policy/editors.tsv` |
| added | Notion (not read) | The side strip of any block, shown as a vertical bar, as in the user's screenshot | Columns around both blocks | not in the sources | The user's screenshot, 2026-10-06 |
| added | Plate Plus, `../plate-pro` at `9ecc0bb85` (read, not run) | None. `block-draggable.tsx` drags columns by handle only | None | not applicable | `../plate-pro/src/registry/ui/block-draggable.tsx:32` |

## Public API

Code, a test or a handle action puts blocks beside another block with the same call the drop makes.

```ts before
// apps/www/src/registry/components/editor/dnd.tsx:170
editor.api.transfer.move({ announce, nodes: nodes(), to });
```

```ts after
// apps/www/src/registry/components/editor/dnd.tsx (planned)
editor.api.transfer.move({ announce: 'Moved beside', nodes: nodes(), to: { key, side: 'end' } });
```

The Column group plugin owns what "beside" builds, as a contribution to a new `transfer.side` read. Without a contributor, a side target refuses with `policy`, and the DOM driver skips strips.

```ts before
```

```ts after
// packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts (planned)
around(editorReads.transfer.side, ({ input, next, state }) =>
  columnBeside(state, input) ?? next()
),
```

A veto sees the wrap a side drop builds. Vetoes run once for the payload and, when a new group takes the target's place, once for the target, so Footnote keeps definitions at the root in both roles.

```ts before
// packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts:100
transferVeto.of(
  ({ payload, target: [, path] }) =>
    payload.kind === 'nodes' &&
    path.length > 1 &&
    payload.nodes.some((node) => ElementApi.isElementType(node, type))
),
```

```ts after
// packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts (planned)
transferVeto.of(
  ({ payload, target: [, path], wrap }) =>
    payload.kind === 'nodes' &&
    (path.length > 1 || wrap !== undefined) &&
    payload.nodes.some((node) => ElementApi.isElementType(node, type))
),
```

A menu or a custom driver asks the same dry run the hover uses, when the menu opens.

```ts before
```

```ts after
// apps/www/src/registry/components/editor/dnd.tsx, openActions (planned)
const to = { key: previousKey, side: 'end' } as const;
if (editor.read.transfer.check({ nodes: nodes(), to }).admitted) actions.push(besideAction(to));
```

The Editable drop passes a resolved block target through unchanged instead of rebuilding an edge.

```ts before
// packages/plitejs/src/react/editable/clipboard-input-strategy.ts:804
? resolved && 'key' in resolved
  ? { edge: resolved.edge, key: resolved.key }
  : null
```

```ts after
// packages/plitejs/src/react/editable/clipboard-input-strategy.ts (planned)
? resolved && 'key' in resolved
  ? 'side' in resolved
    ? resolved
    : { edge: resolved.edge, key: resolved.key }
  : null
```

## Layer and owner

| Delta | Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- | --- |
| added | `TransferSide` target and the `transfer.side` read with a `TransferWrap` result | Plite | `plitejs`, `src/core/transfer-types.ts`, `src/core/editor-reads.ts`, `src/core/landing.ts` | A side drop creates structure, which a redirect cannot express; Plite commits a shell the feature describes and never names a column |
| added | Wrap commit as an insert of an empty shell plus moves, inside `runTransfer`'s one update | Plite | `plitejs`, `src/core/transfer.ts` | One undo step and kept keys, measured by probe P1 |
| added | `editor.read.transfer.check` | Plite | `plitejs`, `src/core/transfer.ts` | A menu and a custom driver need the hover's dry run, so there is no second admission law |
| added | Side strips and the `{ key, side }` arm of `DOMDropTarget` | Plite | `plitejs`, `src/dom/plugin/dom-drag.ts` | The mounted view owns geometry; a strip is arithmetic on the anchor rect `edgeOf` already reads |
| added | Column side policy, a drop cap of 5 and over-full width rescaling | Plate | `platejs`, `src/features/layout` | Product opinion stays with the feature; the group descriptor owns every group-scoped rule |
| added | Footnote veto reads `wrap` | Plate | `platejs`, `src/features/footnote` | A definition must not land inside a new column, as payload or as target |
| added | "Move beside" handle actions | Plate copied registry | `apps/www/src/registry/components/editor/dnd.tsx` | WCAG 2.2 SC 2.5.7 single-pointer path, shown only when `check` admits |

The entrypoint graph (`tooling/entrypoints/entrypoint-dag.mjs`) holds. The new types and reads sit in plitejs `root`, geometry in `dom`, and the Column policy in platejs `layout`, which keeps depending on core only.

## Hard cuts and app migration

Nothing is deleted. Four types widen, and a caller that reads the old union breaks at compile time. A files drop never resolves to a side, but the return type still includes one, so Upload narrows with `'edge' in target` (`UploadPlugin.tsx:51`); an overload would have needed a cast at its implementation.

| Delta | Caller | Breaks because | Change | Source |
| --- | --- | --- | --- | --- |
| added | A custom driver that rebuilds `{ edge: target.edge, key: target.key }` from `resolveDropTarget` without `files` | `DOMDropTarget` gains a `{ key, side }` arm | Pass the target through, or narrow with `'edge' in target` | this plan, Public API |
| added | Code that switches exhaustively over `TransferTarget` or `TransferLandingTarget` | A new arm | Handle the side arm or pass it through | `transfer-types.ts:15`, `:21` |
| added | Readers of `TransferCheck.to`, including `landed()` in `dom-drag.ts` | An admitted side reports the requested `{ key, side }` | Narrow with `'side' in to` | `transfer-types.ts:104` |
| added | A veto that judges depth from `target` alone | A wrap lands deeper than its edge: two levels for a new group, one for an added column | Read `wrap`; every in-tree veto gets a case | `landing.ts:227-229` |

`DropIndicator` keeps its shape. A side publishes `axis: 'x'`, the physical edge (`before` for the left strip, `after` for the right strip, in either direction), the target's key, and a zero-width line at that rect side, so `sameIndicator` and copied `dnd.tsx` need no change.

## Native behavior and proof

| Delta | Behavior | What changes | Proof surface | Source |
| --- | --- | --- | --- | --- |
| added | Side drop | A block dropped on the innermost block's side strip lands beside it as a column; a strip that does not admit falls through to today's edges | `dom-drag-geometry.test.ts` and www `dnd.spec.ts`, Playwright Chromium, Firefox and WebKit, five runs each | this plan, Phase 2 |
| added | Undo after a side drop | One undo entry restores the original blocks and keys | `transfer-contract.test.ts`; www `dnd.spec.ts` | probe P1 |
| added | Selection after a side drop | The landed blocks are node-selected, as for any move | `transfer-contract.test.ts` | `transfer.ts` `landed` |
| added | Non-drag beside | "Move beside" handle actions, by click and keyboard | www `dnd.spec.ts`, Playwright Chromium; no screen reader run | this plan, Phase 1 |
| added | Hover cost with strips | A copy or file drag runs no strip check. A move's strip check refuses fast when nothing builds a side, and the check cache keeps a side slot and an edge slot, so a pointer resting in a strip adds no uncached admission after the first dragover and no rect reads | Benchmark dragover p95 in four cohorts, with and without Column; admissions counted only in the geometry test, not in the browser | this plan, Phase 2 |
| added | Collaboration | A wrap keeps local keys. Concurrent remote text edits survived in a plain schema for both this commit and a remove-then-insert control, so no test claims the commit shape protects them | none; probe P5 recorded as partial | probe P5 |

## Main changes

- **A feature read decides what a side target builds.** `{ key, side }` resolves through the new `editorReads.transfer.side` read to a `TransferWrap` or `null`. Without a contributor the read refuses `policy`. The landing read keeps its redirect-only law and List's middleware does not change.
- **`TransferWrap` is one of two shapes.** `{ shell, payload, target }` takes the target's place and moves the target into its slot. `{ shell, payload, ancestor, edge }` lands the shell at `edge` of the target's ancestor `ancestor` levels up, as Column does to add a column beside a block's column. A feature never names a key: a read's state keys belong to the runtime owner, and a view editor resolves its own (decision log, root cause row). `landBeside` resolves the anchor to a live key, and admission carries one tagged landing for an edge, a point or a wrap.
- **`transfer.ts` keeps the commit; `transfer-guard.ts` holds the draft guard.** The relocate and wrap commits share one move chain, and the file drops below its base size.
- **Column width correction rescales an over-full group.** When widths sum above 100 beyond float noise (1e-6), which only an inserted column produces, the correction scales every width by `100 / sum`. Below 100 it keeps today's additive rule. A joined column gets the mean width, so it ends at `100 / (n + 1)` and the others keep their ratios.
- **`landAt` judges every block a wrap moves.** Identity skips the contiguity no-op for a side. The target moves alone. A target whose `editorReads.transfer.source` expansion holds more than itself, such as a list item with deeper items, refuses `policy`. A target that is a payload entry or an ancestor of one refuses `inside-source`. Placement checks the filled shell in the anchor's parent, removing the payload's indices there and, for a new group, the target's index. It then checks each slot's content. Vetoes run once for the payload. For a new group they run again for the target, with `payload` as `{ kind: 'nodes', nodes: [target], parentKeys: [its parent's key] }`, `from` as the view, `intent: 'move'`, `relation: 'document'`, and the anchor's `target` and `edge`. Both runs set `wrap`. The draft guard expects the target and the payload in their slots.
- **`runTransfer` commits a wrap inside its one update.** It inserts the shell at the anchor edge, moves the target into its slot for a new group, then moves the payload into its slot. A side admits only a payload that relocates by `tx.nodes.move`, the transfer's no-slice case. A copy, a cross-editor drop, a read-only source and a cross-root move on a side refuse `policy`.
- **The DOM driver finds side strips without schema knowledge.** Only the innermost block under the pointer has a strip, at its inline end only: the drift gate showed a start strip catches a straight drag down. The strip runs only for a move; without a `transfer.side` contributor its check refuses at once. It is the outer `min(24px, width / 4)` of that block's rect, excluding its top and bottom quarters, where y edges and container bands win. The block's computed `direction` decides which physical side is its end.
- **The check cache keeps two slots.** `checkTransfer` caches one side check and one edge check per editor, so a strip's side check and the edge fallback stop evicting each other.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Column width correction | Exact `sum === 100`; cycles at 6, 7, 11, 12 columns | Same additive correction with a 1e-6 tolerance | Plate Column | Shipped `setColumns` crash, independent of side drop | Step 0, Bug fix playbook | `BaseColumnPlugin.spec.ts` at 6, 7, 11, 12 fails at base (control C0) | A stored group within 1e-6 of 100 is no longer nudged | gate |
| Width after a join | Additive; a mean-width join drives 70/30 to a 0% column in three joins | Proportional when over-full, additive when under-full | Plate Column | Round 2 critical; widths must stay positive | Phase 1 | Column spec: 70/30 joined to the cap keeps every width positive and in order, failing at base | A stored over-full group such as 80/40 repairs to 66.7/33.3 instead of 70/30 | gate |
| Side target | None; a `{ key, side }` object reports a false `moved` at base (control C1) | `TransferSide` arm of `TransferTarget` | Plite transfer | The gesture needs a position with no document index | Phase 1 | `transfer-contract.test.ts` refusal without a contributor | Exhaustive switches break at compile time | gate |
| What a side builds | Nothing | `editorReads.transfer.side` returning `TransferWrap \| null` | Plite read, Plate contributor | Keeps Column knowledge out of Plite and the redirect law intact | Phase 1 | Column spec wrap and join cases | A shell the schema refuses mid-update; P1 shows an empty shell is admitted | gate |
| Target relocation | Not applicable | The target moves alone; vetoes and the draft guard judge it; a target with a wider source family or holding the payload refuses | Plite transfer | Round 1 critical (unjudged target) and round 2 critical (a family holding the payload) | Phase 1 | Contract and spec cases with a definition as target, a list parent as target and a child dropped beside its parent, each with a mutation control | A veto that ignores `wrap` | gate |
| Wrap commit | `toggle` uses `replaceChildren` | Insert an empty shell, then `tx.nodes.move`; moves only | Plite transfer | One undo step and kept keys (P1); `toggle` stays as is | Phase 1 | `transfer-contract.test.ts` keys and undo | Content-root lowering | gate |
| Veto input | `TransferLandingInput` | `TransferVetoInput`, the landing input plus `wrap?`; the landing read's input is unchanged | Plite transfer; Footnote reads it | A wrap lands one level deeper than its edge | Phase 1 | A case per in-tree veto (Column, Table, Details, Footnote, Upload) | A veto that ignores `wrap` misjudges depth | gate |
| Public dry run | `checkTransfer` is internal to `dom-drag.ts` | `editor.read.transfer.check` | Plite transfer | A menu must not offer an action the admission law refuses | Phase 1 | `check` and `move` agree on placement and veto refusals; commit-time refusals are not predicted, as for hover today | None found | gate |
| Column cap | None in `setColumns`; schema `max` would fail stored documents (P2) | A constant of 5 in the side read, not an option, until a second consumer exists | Plate Column | Serialized-data law; an option named `maxColumns` would mislead while `setColumns` stays uncapped | Phase 1 | Column spec: a sixth column refuses; a stored 7-column group loads | None found | gate |
| Side strips | None; `bandsAt` is y only | Innermost block, `min(24px, width / 4)`, middle half of its height, same-editor moves only | Plite DOM | Geometry belongs to the mounted view | Phase 2 | `dom-drag-geometry.test.ts`; Playwright three engines including handle drift, a narrow cell and a reachable strip on a one-line block | Accidental columns near block edges; containers get no strips by drag | gate |
| Emptied source cleanup | Column pads an empty paragraph; group pads to two | Unchanged | Plate Column | Not in the ask; a cleanup removing a column loses a concurrent remote insert into it | Open work | none | none | defer |
| Horizontal fallback | Reads every mounted sibling (open finding) | Unchanged | Plite DOM | The drop cap of 5 adds no wider rows; the finding keeps its owner | Open work | none | none | defer |
| `moveMiddle`, Column descriptor names | Pending layout review | Unchanged here | Plate Column (`layout` scope) | Outside this ask | Layout review | none | none | defer |

Every `gate` verdict passes when its phase's proof passes. Phase 2 is scale-sensitive, so it also needs Benchmark's pre-acceptance probe with the performance pack before it can be kept.

## Defaults

| Decision | Pick | Alternative | Word |
| --- | --- | --- | --- |
| Where a side drop is admitted | Beside a block whose parent is the root or a column | Anywhere the schema admits the filled group, including quotes, cells and details | "beside anywhere" |
| Which block has strips | Only the innermost block under the pointer, so a table, code block, quote or toggle gets no strips by drag and only the menu reaches it | Walk outward to the first admitted block, stopping at a cell or column | "outer strips" |
| Beside a block already in a column | Add a column to that group; groups never nest | Nest a new group inside the column | "nest columns" |
| A payload that is the whole column beside the facing side | Refused as a no-op, as in BlockNote | Admit it and pad the emptied column | "admit whole-column side" |
| Column cap for a drop | 5, a constant in the side read | No cap, or a public option | "no column cap" |
| Strip shape | `min(24px, width / 4)` at the inline end only, middle half of the height. Approved pick was both sides; the drift gate applied the named fallback | Both sides, or the full height | "both strips" or "full-height strips" |
| Copy, cross-editor and cross-root drops on a side | Refused; a side admits only a payload that relocates by `tx.nodes.move` | A copy wrap through `replaceSliceAtBlockBoundary` | "copy beside" |
| A list item with deeper items as the target | Refused | Carry its family into the slot, with the payload excluded | "wrap list families" |
| Width of a new column | The mean of the group's widths, rescaled with the group when over-full, so it ends at `100 / (n + 1)` | Additive only, which drove 70/30 to a 0% column | "additive widths" |
| Emptied source cleanup | Out of this plan; today's padded column stays | A transfer-time `vacated` read | "clean empty columns" |
| `toggle` keeps `replaceChildren` | Unchanged; P5's control kept concurrent edits with remove-then-insert, so only local keys differ | Rewrite `toggle` as insert plus moves | "toggle as moves" |
| Shipped width crash | Fixed first as its own Bug fix change, tolerance only | Fold it into Phase 1 | "fold the crash fix" |


## Challenge delta

`improved`. The proposal in conversation was "Column contributes a side-drop zone; do not add `'left' | 'right'` to `TransferEdge`; wrap as one undo step". The arena kept the second and third parts and moved the zone into a generic Plite `{ key, side }` target plus a `transfer.side` read, because the Editable hides block drags from plugin handlers and a nested update throws. Panel round 1 cut the `vacated` read, the proportional rescale of every group and the horizontal-fallback rewrite. It added judging of the relocated target and narrowed strips to the innermost block. Round 2 replaced target-family expansion with a refusal, limited sides to relocating moves, and made the correction proportional only for over-full groups.

## Panel gate

Two rounds ran on the plan, and each applied a critical fix, which is the cap. Round 1 reviewed `823a840a` and round 2 reviewed its delta in `83e1ab64`. Each round had opus plus two same-family seats, fable and sonnet. Both Codex seats failed, so no cross-family seat reviewed either round. These round 2 fixes are unreviewed:

- The target moves alone; a wider source family refuses `policy`, and a target holding the payload refuses `inside-source`.
- The `columnGroup` correction rescales proportionally when over-full and stays additive when under-full.
- A side admits only a payload that relocates by `tx.nodes.move`.
- The check cache keeps a side slot and an edge slot.
- The side indicator publishes the physical edge.
- The target veto run's input shape.

## Scope

In scope are `plitejs` core transfer, landing and reads; `plitejs` DOM drag geometry; the Editable drop pass-through; `platejs` Column and Footnote; the copied `dnd.tsx`; the docs pages below; and Vision's transfer law. Out of scope are emptied-column cleanup, the horizontal-fallback rewrite, the Column rename and `moveMiddle` deletion (the `layout` review), a touch pointer driver, and `toggle`.

## Steps

- [x] **Step 0. Fix the width correction cycle** through the Bug fix playbook, as its own change. Replace `sum === 100` in `packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts:195` with `Math.abs(sum - 100) < 0.1` and keep the additive correction. Proof is a `BaseColumnPlugin.spec.ts` case for `setColumns` at 6, 7, 11 and 12 columns that throws at base (control C0) and passes after. A must-still-accept case keeps base widths for a stored `["0%", "50%"]` group and for unparseable widths. Closed by `BaseColumnPlugin.spec.ts` "settles widths that cannot sum to exactly one hundred at %i columns", red 4 of 4 at base; tolerance later tightened to 1e-6 (decision log).
- [ ] **Phase 1. Side law, Column policy and the handle action.** Closed by its sub-steps below and the Phase 1 keep box.
  - [x] Add `TransferSide`, `TransferWrap` and `TransferVetoInput` to `packages/plitejs/src/core/transfer-types.ts`, and `editorReads.transfer.side` with a default of `null` to `src/core/editor-reads.ts`. Proof is the source-first typecheck in `.agents/rules/verify/references/commands.md`. Closed by `pnpm check typecheck` (scratch `pnpm-check4.log`).
  - [ ] Teach `landAt` (`src/core/landing.ts`) the side branch and `runTransfer` (`src/core/transfer.ts`) the wrap commit, per Main changes. Proof is new `packages/plitejs/test/transfer-contract.test.ts` cases. A side target with no contributor refuses `policy`; control C1 returns `moved` at base. A wrap of adjacent siblings is admitted and keeps both keys. One undo restores. A copy and a cross-root move on a side refuse `policy`. A shell slot the schema refuses is refused `schema`, once for the payload slot and once for the target slot. A veto sees `wrap` in both runs. A child list item dropped beside its own parent refuses. Each case names a mutation control run during the build: delete the target veto run, the target-slot placement check, the family refusal or the ancestor refusal, and its case must fail. Run `bun test ./packages/plitejs/test/transfer-contract.test.ts`. Closed by `transfer-contract.test.ts` "side landing" cases with mutation controls M1 to M6 and MV (decision log). The cross-root case is covered by the no-slice rule; copy is tested.
  - [x] Publish `editor.read.transfer.check`, which runs the cached `checkTransfer` with `intent: 'move'` unless the input says copy. Proof is a contract case where `check` and `move` agree on a veto refusal and a placement refusal, with the mutation control that `check` skips vetoes. Closed by "checks a transfer against the vetoes its move obeys" with mutation M6. Deviation: no `copy` flag (decision log).
  - [x] Add the Column side read to `BaseColumnPlugin`, with a cap of 5 as a constant. The read wraps a block whose parent is the root, adds a column beside a block inside a column, and gives a new column the mean width. It refuses a column payload, nesting, the cap, a parent other than the root or a column, and a whole-column payload beside the facing side. Make the `columnGroup` correction proportional when a group is over-full. Update the Footnote veto. Proof is new `BaseColumnPlugin.spec.ts` and `BaseFootnotePlugin.spec.ts` cases, each failing at base. A root definition as the target refuses, which the census reproduced as a definition loading inside a column (`census/r1-footnote-in-column.ts`). A definition as the payload refuses. A list item with deeper items as the target refuses. A 70/30 group joined to the cap keeps every width positive and in order. Equal columns stay equal after a join. A stored 7-column group still loads, and a stored under-full group keeps its base widths. Run `bun test` on both spec files. Closed by `BaseColumnPlugin.spec.ts` "column side drop" and `BaseFootnotePlugin.spec.ts` side cases with mutations MC1 to MC5, MW and MF1.
  - [ ] Add the "Move beside previous" and "Move beside next" actions to the copied `dnd.tsx` handle menu, computed in `openActions` and shown only when `check` admits. Proof is a www `dnd.spec.ts` case in Playwright Chromium. It opens the menu by click and by keyboard, runs the action and undoes it. The action is hidden in an editor without the Column plugin.
- [ ] **Phase 2. Strips and paint.** Closed by its sub-steps below.
  - [ ] Add the `{ key, side }` arm to `DOMDropTarget`, a `files` overload of `resolveDropTarget` that returns only edges, the strip test in `resolveDOMDropTarget` (`src/dom/plugin/dom-drag.ts`) per Main changes, and the two-slot check cache in `src/core/transfer.ts`. Publish a side indicator in the existing `DropIndicator` shape with the physical edge. Pass a side target through the Editable drop. Proof is new `packages/plitejs/test/react/dom-drag-geometry.test.ts` cases. A strip hit returns a side. A refused strip returns today's y edge. The top and bottom quarters return y edges, and a container band wins over a strip at a corner. A parent block's edge shared with its child yields the child's side only. An x-axis block never yields a side. In RTL the left strip resolves to `end` and paints at the left edge. A files drag, a copy drag and an editor without a side contributor run no strip check. A refused strip at rest runs no uncached admission on the second dragover. Run `bun run test:react test/react/dom-drag-geometry.test.ts` from `packages/plitejs`. Closed by `dom-drag-geometry.test.ts` "DOM side strips" with mutations MG1, MG3, MG4, MG6, MG7 and MG8. Deviations: end strip only, Upload narrows instead of an overload (decision log).
  - [ ] Run Benchmark's pre-acceptance probe with the performance pack (`.agents/rules/benchmark/templates/performance-observability.md`). The dragover lane gains two cohorts that rest the pointer in a strip, one admitted on a root paragraph and one refused in a full 5-column group, and both count admissions and rect reads. Proof is dragover p95 at 5,000 blocks within baseline plus 1 ms, with the trunk baseline measured first. Closed by scratch `bench/summary.txt` and `bench/final-summary.txt`; every cohort within the frozen budget (decision log).
  - [x] Add www `dnd.spec.ts` cases in Playwright Chromium, Firefox and WebKit, five warm runs each. A paragraph dropped on a heading's right strip lands as a 2-column group. A block dropped beside a block in a column makes 3 columns. A pointer resting at the vertical center of a one-line block, 12px inside its edge, resolves a side. A drop near a block's bottom outside the strip still lands below. A handle drag down a stack of blocks with the pointer at `rect.left + 5` to `rect.left + 20` over the blocks below lands below, not beside; if it fails, apply "end strip only". A drop near the right edge of a narrow table cell creates no column group anywhere. One undo restores. Closed by scratch `final2/pw-*-side.log` and `pw-*-full.log`: 40 of 40 side runs and 28 of 28 full per engine. The drift case applied "end strip only".
  - [x] Keep or revert. Keep when the geometry, Playwright and Benchmark proofs pass. Revert removes the strips and leaves Phase 1 for the owner's call. Kept; decision log verify rows.
- [ ] **Phase 1 keep or revert**, after Phase 2's. Keep when every Phase 1 proof passes and Phase 2 is kept, or when the owner accepts the menu path alone. Revert deletes the types, the read, `check` and the actions together. Kept, because Phase 2 is kept.
- [ ] **Docs.** Run `plate-docs` on `content/docs/(plugins)/(functionality)/dnd.mdx`, `content/docs/(plugins)/(elements)/column.mdx` and `content/docs/api/dom.mdx`, with the Chinese twins `dnd.cn.mdx` and `column.cn.mdx`. Proof is its example coverage audit, a side-drop demo, the docs checks and a preview.
- [ ] **Vision and skills.** Run `best-api repair`. It updates the transfer law in `docs/vision/plite.md:497-503` ("a landing read only redirects an edge" gains the side read) and `docs/vision/plate.md:1095-1104`, and fixes any `plate-plugins`, `plate-ui` or `plate-next` text that teaches the old target union. Proof is its regenerated mirrors and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`.
- [ ] **Closeout.** Run `pnpm brl` if exports change, `pnpm --filter www build:registry` for `dnd.tsx`, a changeset and a registry changelog entry through `changeset`, the api-build panel on the diff, the writing passes, and `pnpm lint:fix` on the task's files. Proof is each command's exit status and `pnpm check` once on the settled change.

## Open work

- **Emptied-column cleanup.** Dragging the last block out of a column leaves a padded empty column, and a group never drops below two columns. A cleanup at transfer time loses a concurrent remote insert into the removed column. Owner: Plate Column (`layout` review scope), tracked in this plan's decision log until the subject file takes it.
- **Horizontal fallback.** Unchanged by this plan; it keeps its entry in `docs/plans/topics/dnd.md` Open findings with its Plite DOM owner.
- **List's landing redirect returns owner keys.** `BaseListPlugin.ts:1812` returns `state.key(...)`, the mechanism that made the side read refuse from a view editor. Inferred, not reproduced. Owner: Plite transfer read state (`packages/plitejs/src/core/landing.ts`), tracked in this plan's decision log.
- **Read middleware handlers get no contextual return type.** Column's side read needs `as const` on its edge literals because `PluginReadContext.around` (`packages/plitejs/src/interfaces/editor.ts:2315`) does not type the handler's return. Owner: Plite plugin read typing, tracked in this plan's decision log.
- **Vetoes infer landing depth from `wrap`.** A veto input that named the landing parent would let Footnote read depth directly. Owner: Plite transfer (`packages/plitejs/src/core/transfer-types.ts`), tracked in this plan's decision log.
- **`HistoryApi` API-reference classification.** `pnpm --filter www api-reference` stops on it at HEAD too; once classified, regenerate the manifest for `TransferSide`, `TransferSideInput`, `TransferVetoInput` and `TransferWrap`. Owner: the `HistoryApi` export's author, flagged on this page.
- **Left-side drop.** You chose on 2026-10-07 to add the start strip with a guard against the handle drift, and you are writing the approach. The guard must keep the browser case "lands below, not beside, when a downward drag drifts into the left strip" green; a guard keyed on leaving the source block's rows would not, because that drift is already over the next block. Owner: the repository owner, in `packages/plitejs/src/dom/plugin/dom-drag.ts`.
- **Cross-view node identity in Column's no-op check.** `onlyTradesPlaces` compares node objects. Owner: Plate Column (`packages/platejs/src/features/layout`), tracked in this plan's decision log.
- **Nested list items as targets.** A nested item without deeper items can be wrapped mid-family, as an edge drop can today. Owner: Plate List (`packages/platejs/src/features/list`), tracked in this plan's decision log.
- **Codex panel seats.** After the CLI upgrade to 0.160.1, `gpt-6-astra` and `gpt-6.1-sol` both answer under the ChatGPT login; `gpt-6.1-astra` still refuses a ChatGPT account. No review in this plan ran on them, so every round stays same-family. `~/.claude/pstack-models.md` is still missing. Owner: you, listed in the Brief.
- **Side-landing veto coverage.** Table, Details and Upload have no side-landing cases. Their vetoes are safe today only because Column's side read admits roots and columns alone. Owner: Plite transfer, tracked in this plan's decision log.
- **Production-path benchmark.** Rerun the four cohorts on a production build with a budget sized to the baseline and a planted-slowdown control. Owner: `benchmark`, tracked in this plan's decision log.

## Proof

Package tests prove the law. `dom-drag-geometry.test.ts` proves the geometry on stubbed rects. Playwright proves event handling in Chromium, Firefox and WebKit, but not OS drag negotiation, and WebKit is not Safari. Benchmark proves dragover cost. No test proves that the wrap's commit shape protects concurrent remote edits, because the remove-then-insert control also kept them (P5). No screen reader, touch device or Android run is planned.

## Appendix A. Census and controls

Each premise ran as a scratch probe from `packages/platejs` with `bun --preload ../../config/plite-source-aliases.ts`, and each is a row in the decision log.

- **P1, verified.** An empty shell inserted, then filled with `tx.nodes.move` in one update, is schema-valid, keeps keys and takes one undo. It ran for same-root moves only.
- **P2, verified.** A schema `max: 3` throws on loading a stored 4-child row.
- **P3, verified.** `min: 0` leaves an emptied slot empty, while `min: 1` pads it.
- **P4, at the source line.** Remote Yjs applies run with `skipCorrections: true` (`public-state.ts:7016`, `editor-adapter.ts:168`).
- **P5, partial.** An insert-plus-moves wrap keeps concurrent remote text edits, but a remove-then-insert control also kept them, so the probe separates the shapes only on local keys.
- **P6, verified.** A correction that removes and unwraps runs inside `transfer.move`, still reports `moved`, and takes one undo. It keeps a column that holds an empty paragraph.
- **P7, verified.** With `min: 0`, a stored zero-child column loads and persists. That load change, not an inability to tell columns apart, rules out correction cleanup.
- **R1, verified.** A footnote definition inside a column loads with Column and Footnote installed, so the schema alone does not keep definitions at the root.
- **Controls at base, in a detached worktree.** C0 `setColumns` 6 throws. C1 a `{ key, side }` target reports `moved` and changes nothing. C3c `read.transfer.check` is not installed.

## Appendix B. Alternatives rejected

- **`'left' | 'right'` in `TransferEdge`.** An edge is a sibling position, and a side has no document index. Every edge reader would gain a branch it cannot handle, and `left` is wrong in RTL.
- **A Column path outside `transfer`.** The Editable hides block drags from plugin handlers on purpose, and a nested update throws. It would need the hook runner Vision forbids, and it would duplicate identity, placement, veto, read-only, copy and hover law.
- **One widened `landing` read returning a union** (arena candidates A and B). It changes the redirect law and List's middleware for a concept List never uses.
- **A schema `max` on the group** (candidate B). Stored documents above the cap fail to load (P2).
- **Cleanup by Column corrections with `min: 0`** (candidate A). A zero-child column becomes a persistent, uncaretable state on load (P7).
- **A transfer-time `vacated` read** (candidates B and C, cut in panel round 1). It adds a second Plite read for one consumer, outside the ask, and loses a concurrent remote insert into the removed column.
- **Proportional rescaling of every group** (cut in panel round 1). It changes stored under-full groups and divides by zero for unparseable widths. Round 2 kept it only for over-full groups, which never sum to zero.
- **A mean-width join under the additive correction** (round 1 fix, cut in round 2). It drives the shipped 70/30 preset to a 0% column within the cap.
- **Carrying a list target's family into the slot** (round 1 fix, cut in round 2). The family can hold the payload, as when a child is dropped beside its parent.
- **Two commits joined in history.** The `announce` effect blocks the merge, and collaborators see the intermediate group.
- **Not building it.** Today the only path is Turn into columns, a drag into the empty column, then a delete of the leftover paragraph.

## Appendix C. Risks

1. **Accidental columns.** Strips turn drops near a block's sides into side drops in every editor with Column installed. One undo recovers. Strips sit on the innermost block only, in the middle half of its height, and Playwright's drift, near-edge and narrow-cell cases gate Phase 2.
2. **Content-root collaboration.** Lowering falls back to rewriting a child range when the schema has content roots, which already diverges for plain moves (`docs/plans/2026-10-01-dnd-transfer-consolidation.md:520`). A wrap inherits that finding and does not fix it.
3. **Vetoes that ignore `wrap`.** A future veto that judges depth from `target` alone misjudges a wrap. Every in-tree veto gets a case, and the `TransferVetoInput` JSDoc states the rule.

## Appendix D. Links

- Arena brief, candidates, judge verdict and panel seats are in this session's scratch directory, under `arena/` and `panel-r1/`. The synthesis, grafts and panel rows are in `docs/plans/2026-10-06-dnd-side-drop-columns.decisions.tsv`.
- The subject is `docs/plans/topics/dnd.md`. The pending column review is `node tooling/scripts/review-ledger.mjs show layout`.
- The execution playbook is `.agents/playbooks/build.md`, and Step 0 runs `.agents/playbooks/bug-fix.md`.
