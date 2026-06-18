---
date: 2026-05-07
topic: slate-v2-inline-delete-boundary-repro-ralplan
status: done
skill: slate-ralplan
completion: .tmp/completion-checks/slate-v2-inline-delete-boundary-repro-ralplan.md
score: 0.93
selected_issue: "#5972"
---

# Slate v2 Inline Delete Boundary Repro Ralplan

## Verdict

The next lane should be **#5972: empty editable inline Backspace in the inlines example**.

Do not take the mobile/IME cluster next. It is larger, but exact closure needs raw-device proof. Do not take split-specific #1654 next unless a fresh split repro appears. The structural-delete slice already improved #1654 and explicitly left split-specific closure unclaimed.

#5972 is the better next autonomous lane because it is issue-backed, browser-visible, narrow, and already has a ready-now test candidate. The plan is not to change public API. The plan is to prove the bug, route ownership by evidence, then patch the owning primitive.

## Intent And Boundary

- intent: turn #5972 from `needs repro` into a browser-proven fix or a documented current non-repro.
- desired outcome: Backspace after clearing the editable inline in `/examples/inlines` removes the empty inline without deleting the preceding character in the simple case.
- in scope:
  - #5972 current gitcrawl thread.
  - current `Plate repo root` inlines example and browser tests.
  - model-owned delete command path in `slate` and `slate-react`.
  - DOM selection import/repair only if the browser trace proves the model target is imported wrong.
- non-goals:
  - no public `normalizePoint` API.
  - no new inline-specific userland escape hatch.
  - no nested-inline semantic redesign in the first fix.
  - no raw-device mobile/IME claim.
  - no #1654 split closure claim.
- decision boundary: implementation may fix `slate`, `slate-react`, `slate-dom`, or the example only after the red browser proof identifies the owner.
- unresolved user-decision points: none.

## Current State Evidence

Issue evidence:

- `gitcrawl doctor --json` reports local Slate corpus present with 659 open threads and last sync `2026-05-04T14:58:11.123944Z`.
- `gitcrawl threads ianstormtaylor/slate --numbers 5972 --include-closed --json` reports #5972 open, labeled bug, with steps: clear text inside the inline/input element, then delete it.
- `gitcrawl search ianstormtaylor/slate --query "inline input delete preceding character" --mode hybrid --limit 10 --json` returns only #5972.
- `docs/slate-issues/test-candidate-map/5994-5918.md:206` marks #5972 `ready-now`.
- `docs/slate-issues/open-issues-dossiers/5994-5918.md:419` records the basic case as valid and direct v2 relevance.

Live Slate v2 evidence:

- `apps/www/src/app/(app)/examples/slate/_examples/inlines.tsx:29` defines the inlines example with `link`, editable `button`, and read-only `badge` inline children.
- `apps/www/src/app/(app)/examples/slate/_examples/inlines.tsx:149` registers `link`, `button`, and `badge` as inline elements.
- `apps/www/src/app/(app)/examples/slate/_examples/inlines.tsx:105` customizes only left/right movement to `unit: 'offset'`; Backspace is left to the runtime.
- `apps/www/tests/slate-browser/donor/examples/inlines.test.ts:34` already proves editable inline end typing.
- `apps/www/tests/slate-browser/donor/examples/inlines.test.ts:65` proves following text start is distinct from inline end.
- `apps/www/tests/slate-browser/donor/examples/inlines.test.ts:178` proves cut of inline link text keeps the caret editable.
- Exact #5972 browser row now exists in
  `apps/www/tests/slate-browser/donor/examples/inlines.test.ts`.

Likely owner files:

- `packages/slate-react/src/editable/input-controller.ts:148` classifies Backspace/Delete as delete intent.
- `packages/slate-react/src/editable/keyboard-input-strategy.ts:241` turns destructive keydown into a model-owned command.
- `packages/slate-react/src/editable/mutation-controller.ts:95` maps default Backspace to `tx.text.deleteBackward({ unit: 'character' })`.
- `packages/slate/src/transforms-text/delete-text.ts:421` already contains inline point relocation helpers.
- `packages/slate/src/core/leaf-lifecycle.ts:72` owns cleanup of empty text leaves while preserving required inline spacers.
- `packages/slate/src/core/normalize-node.ts:263` owns explicit inline children normalization and spacer insertion.
- `packages/slate-react/src/editable/clipboard-input-strategy.ts:207` already has cut-specific empty inline removal and caret reset logic; that is a useful pattern, not proof that Backspace is fixed.

## Decision Brief

Principles:

1. Browser-visible delete bugs need browser-first proof.
2. Slate owns model truth; browser DOM mutation is not the final delete authority.
3. Empty editable inline deletion is a model/selection boundary problem, not a public API problem.
4. The first fix handles the simple official-example case only.
5. Exact `Fixes #5972` requires matching red/green proof.

Top drivers:

- The issue is about official example behavior, so package-only proof is insufficient.
- The current runtime already routes destructive Backspace through model-owned commands.
- Existing inline cut cleanup shows Slate already has a local empty-inline cleanup concept, but Backspace needs its own proof.

Viable options:

| Option                                         | Pros                                                               | Cons                                                                           | Verdict                                   |
| ---------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------- |
| Browser-first #5972 row, route owner by trace  | Matches issue, keeps closure honest, avoids architecture guesswork | Requires a red browser test before code                                        | Chosen                                    |
| Core-only delete target patch first            | Fast if the bug is purely `delete-text.ts`                         | Can paper over a DOM selection import bug                                      | Rejected until proof                      |
| React keydown special-case for editable inline | Easy local hook                                                    | Duplicates delete semantics outside the model primitive                        | Rejected                                  |
| Example-specific Backspace handler             | Small diff                                                         | Would prove the example can hack around Slate, not that Slate v2 fixed the bug | Rejected except as evidence-only fallback |
| Public inline delete policy API                | Flexible                                                           | Product-shaped and premature                                                   | Rejected                                  |

Consequences:

- The red test decides the owner.
- The current example reproduced the bug. #5972 is now claimed as fixed after
  the core and browser proof passed.
- If it reproduces, only then update the issue coverage matrix from `Related` to `Fixes`.

## Ecosystem Strategy Synthesis

| System      | Source Used                                                                                                                                                               | Mechanism Observed                                                                                                           | Slate Target                                                                                                             | Steal                                                    | Reject                                                    | Verdict |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------- | ------- |
| Lexical     | `../lexical/packages/lexical-rich-text/src/index.ts:581`; `../lexical/packages/lexical/src/LexicalSelection.ts:1743`                                                      | Backspace dispatches `DELETE_CHARACTER_COMMAND`, then `RangeSelection.deleteCharacter` owns text vs decorator/node behavior. | Keep destructive input model-owned and route delete through one planner.                                                 | Command-owned delete with node-type-aware edge handling. | Lexical class nodes and `$` public style.                 | partial |
| Lexical     | `../lexical/packages/lexical/src/LexicalSelection.ts:1627`                                                                                                                | For movement, Lexical may ask DOM `selection.modify`, then imports the result.                                               | If #5972 is a selection-import bug, import DOM selection before model delete.                                            | DOM-as-measurement, model-as-truth.                      | Waiting for browser DOM delete as truth.                  | agree   |
| ProseMirror | `../prosemirror-commands/src/commands.ts:8`, `:30`, `:138`, `:736`                                                                                                        | Backspace chains `deleteSelection`, `joinBackward`, then `selectNodeBackward`.                                               | Split deletion into selection delete, structure boundary delete, and node-boundary selection.                            | Explicit command chain and fallback selection behavior.  | Integer-position model and schema-first API.              | partial |
| ProseMirror | `../prosemirror/model/src/schema.ts:390`, `:441`                                                                                                                          | `inline`, `atom`, `selectable`, and `isolating` schema flags influence editing boundaries.                                   | Use existing Slate schema flags (`inline`, `void`, `readOnly`, `isIsolating`) as internal delete policy inputs.          | Boundary flags as internal policy.                       | Making ProseMirror node specs the raw Slate public model. | partial |
| Tiptap      | `../tiptap/packages/core/src/extensions/keymap.ts:13`; `../tiptap/packages/core/src/commands/join.ts:59`; `../tiptap/packages/core/src/commands/selectNodeBackward.ts:17` | Product DX wraps ProseMirror commands behind extension keyboard shortcuts.                                                   | Keep raw Slate minimal; examples may customize keydown, but core deletion must not rely on product extension shortcuts.  | Discoverable commands as DX inspiration.                 | `focus().chain().run()` ceremony for raw Slate.           | diverge |
| Tiptap      | `../tiptap/packages/core/src/helpers/getSchemaByResolvedExtensions.ts:80`; `../tiptap/packages/core/src/NodeView.ts:261`                                                  | Extension schema carries `inline`, `atom`, `selectable`, `isolating`; atom node views are black boxes.                       | Slate should treat true void/read-only inline controls as boundary objects, but editable inline content remains content. | Clear atom vs editable-content distinction.              | NodeView black-box model as default Slate renderer API.   | partial |

## Public API Target

No public API change.

Hard cuts:

- no `deleteEmptyInline` option;
- no `normalizePoint`;
- no `onBeforeDeleteInline`;
- no `inlineDeletionPolicy` prop;
- no Plate-shaped shortcut in raw Slate.

If app authors need custom product behavior, the existing `onKeyDown` and extension surfaces are enough. The raw runtime must make the official example correct without extra public ceremony.

## Internal Runtime Target

Target shape:

```txt
browser Backspace
  -> import current DOM/model selection if needed
  -> model-owned delete command
  -> delete planner sees empty editable inline boundary
  -> remove empty inline only
  -> select the adjacent valid point
  -> repair DOM selection from model
  -> no preceding character deletion
```

Owner decision by trace:

| Evidence                                                                                                              | Owner                                                                         |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Model selection is already inside/after the cleared inline, but `delete-text.ts` chooses the previous character range | `packages/slate/src/transforms-text/delete-text.ts`                           |
| DOM selection after clearing the inline is not imported to the expected model point                                   | `packages/slate-react/src/editable/*selection*` or `slate-dom` bridge         |
| Backspace fires on an interactive internal native control instead of the editable runtime                             | `packages/slate-react/src/editable/input-controller.ts` and example DOM shape |
| Empty inline cleanup after delete removes the right node but rebases selection wrong                                  | `packages/slate/src/core/leaf-lifecycle.ts` or `normalize-node.ts`            |
| Existing v2 does not reproduce                                                                                        | update dossier as current non-repro; do not claim `Fixes #5972`               |

## Hook, Component, And Render DX Target

- The example remains the proof surface; it should not gain a custom Backspace workaround unless the bug proves example-only.
- `renderElement` must keep editable inline children mounted.
- Chromium inline bugfix sentinels remain a DOM aid, not document truth.
- `onKeyDown` may keep left/right `unit: 'offset'`; Backspace stays runtime-owned.

## Plate And slate-yjs Migration Backbone

Plate migration pressure:

- Plate can keep product shortcuts around mentions/links, but raw Slate must expose stable model-owned delete behavior first.
- Plate should not need to patch every inline element just to avoid eating adjacent text.

slate-yjs pressure:

- If the fix is core delete planning, emitted operations must be deterministic and history/collab friendly.
- If the fix removes the empty inline, the operation sequence must be intentional and replayable; avoid DOM-only deletion repair that does not map to model operations.

No slate-yjs fixture is required for the first #5972 browser slice unless the fix changes operation shape in a non-local way.

## Issue Ledger Accounting

ClawSweeper pass:

- status: applied.
- trigger: issue-facing browser/delete behavior.
- gitcrawl commands:
  - `gitcrawl doctor --json`
  - `gitcrawl threads ianstormtaylor/slate --numbers 5972 --include-closed --json`
  - `gitcrawl search ianstormtaylor/slate --query "inline input delete preceding character" --mode hybrid --limit 10 --json`
- reviewed issues:
  - #5972 selected.
  - #4618 kept related/non-claim because no public point-normalization API is planned.
  - #5806/#5690 are inline selection neighbors but require different drag/double-click repros.
  - #5183/#5391/#4348/#5984 remain mobile/raw-device rows, not this lane.

Fixed issue claims:

- none yet.

Planned exact claim after implementation:

- `Fixes #5972: Backspace after clearing the editable inline in the inlines example removes the empty inline without deleting the preceding character.`

Related but not fixed:

| Issue                   | Category                          | Reason                                                                                  |
| ----------------------- | --------------------------------- | --------------------------------------------------------------------------------------- |
| #4618                   | related/not fixed                 | Inline-boundary ergonomics, but no public `normalizePoint` API.                         |
| #5806                   | related/not fixed                 | Custom inline drag/slide selection, not empty inline Backspace.                         |
| #5690                   | related/not fixed                 | Double-click before inline then delete crash, requires Windows/Chrome-style repro.      |
| #5183/#5391/#4348/#5984 | related/not fixed                 | Mobile inline/Backspace/input rows need raw-device or dedicated mobile proof.           |
| #1654                   | improved elsewhere/not fixed here | Split-specific isolating behavior remains separate from empty editable inline deletion. |

Live ledger sync:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`: unchanged; it is generated corpus output and no implementation claim changed.
- `docs/slate-issues/open-issues-ledger.md`: #5972 moved to `fixes-claimed`.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`: #5972 moved from Related to Fixes.
- `docs/slate-v2/ledgers/fork-issue-dossier.md`: #5972 refreshed with implementation and proof.
- `docs/slate-v2/references/pr-description.md`: synced with the #5972 fixed claim.

Cluster coverage:

- Advances the inline-delete part of `Selection, Focus, And DOM Bridge` and `Core Model, Operations, Normalization, And History`.
- Does not advance the raw-device mobile cluster.

## Regression Proof Matrix

| Proof                                            | First Red Test                                                                                                            | Green Requirement                                                                                               | Claim Impact                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Exact #5972 Chromium browser row                 | Add `empty editable inline Backspace does not delete preceding text` in `playwright/integration/examples/inlines.test.ts` | Preceding text unchanged; empty inline removed or converted to valid adjacent selection; caret remains editable | Enables `Fixes #5972` if original steps match |
| Model selection trace                            | Browser row records model selection before/after Backspace                                                                | Selection lands on surviving adjacent point, not removed inline text                                            | Determines core vs React owner                |
| DOM selection trace                              | Browser row checks DOM selection target before Backspace                                                                  | DOM target maps to expected Slate point before delete                                                           | Determines DOM import owner                   |
| Core unit, if root cause is `delete-text.ts`     | Add narrow package test for empty inline before text                                                                      | `deleteBackward({ unit: 'character' })` removes empty inline only                                               | Supports model fix                            |
| React/input unit, if root cause is import/repair | Add focused `slate-react` contract                                                                                        | destructive command runs after correct selection import and repairs caret                                       | Supports runtime fix                          |
| Existing inline rows                             | Run existing inlines grep                                                                                                 | Existing typing/cut/navigation rows stay green                                                                  | Blocks regression                             |

## Browser Stress And Parity Strategy

First pass:

```bash
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium --grep "empty editable inline|types inside an editable inline|keeps the start of following text distinct|keeps caret editable after cutting inline link text"
```

Second pass when green:

```bash
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --grep "empty editable inline|types inside an editable inline|keeps the start of following text distinct|keeps caret editable after cutting inline link text"
```

Do not use mobile viewport as raw mobile proof. It can be a smoke row only.

## Implementation Phases

### Phase 1: Red Browser Row

Owner: `apps/www/tests/slate-browser/donor/examples/inlines.test.ts`

Work:

1. Open `/examples/inlines`.
2. Select the editable `button` inline text.
3. Delete or replace its text so the inline is empty.
4. Place selection at the expected delete boundary.
5. Press Backspace with the native keyboard path.
6. Assert preceding text remains unchanged.
7. Assert editor model, DOM text, and selection are coherent.

Gate:

- Test fails on current code, or records a current non-repro with enough trace to update the dossier honestly.

### Phase 2: Owner Classification

Owner: execution agent.

Work:

1. Capture model selection before Backspace.
2. Capture DOM selection target before Backspace.
3. Capture command/kernel trace if available.
4. Decide owner with the table in `Internal Runtime Target`.

Gate:

- No code patch before owner is classified.

### Phase 3A: Core Delete Fix

Use only if the model delete target crosses into preceding text.

Likely files:

- `packages/slate/src/transforms-text/delete-text.ts`
- `packages/slate/src/core/leaf-lifecycle.ts`
- `packages/slate/src/core/normalize-node.ts`
- `packages/slate/test/delete-contract.ts`

Target:

- Empty editable inline at a collapsed Backspace boundary is removed as a structural artifact before deleting adjacent character text.
- Required inline spacer leaves are preserved.
- Selection rebases to a surviving adjacent point.

### Phase 3B: React/DOM Selection Fix

Use only if DOM selection import/repair is wrong.

Likely files:

- `packages/slate-react/src/editable/input-controller.ts`
- `packages/slate-react/src/editable/keyboard-input-strategy.ts`
- `packages/slate-react/src/editable/model-input-strategy.ts`
- `packages/slate-react/src/editable/selection-controller.ts`
- `packages/slate-dom/src/**`

Target:

- Before destructive model command, current DOM selection maps to the expected model point.
- After command, DOM selection is repaired from the model point.

### Phase 3C: Example-Only Finding

Use only if runtime is correct and the example markup causes an app-local target issue.

Target:

- Keep example accessible and editable.
- Do not claim raw Slate fix unless package/runtime behavior is involved.

### Phase 4: Claim Sync

After green proof:

- update `docs/slate-v2/ledgers/issue-coverage-matrix.md`;
- update `docs/slate-v2/ledgers/fork-issue-dossier.md`;
- update `docs/slate-v2/references/pr-description.md`;
- update the completion checkpoint with exact command evidence.

## Fast Driver Gates

Minimal:

```bash
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium --grep "empty editable inline"
```

If core changed:

```bash
bun test packages/slate/test/delete-contract.ts packages/slate/test/leaf-lifecycle-contract.ts --bail 1
bunx turbo typecheck --filter=./packages/slate --force
```

If React/DOM changed:

```bash
bun --filter slate-react test:vitest -- model-input-strategy
bun --filter slate-react test:vitest -- selection-runtime
bunx turbo typecheck --filter=./packages/slate-react --filter=./packages/slate-dom --force
```

Always after code edits:

```bash
bun run lint:fix
```

Closeout browser gate:

```bash
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --grep "empty editable inline|types inside an editable inline|keeps the start of following text distinct|keeps caret editable after cutting inline link text"
```

## Applicable Skill Review Matrix

| Skill                         | Status  | Reason                                                                   |
| ----------------------------- | ------- | ------------------------------------------------------------------------ |
| `clawsweeper`                 | applied | #5972 selected through gitcrawl and issue ledger proof.                  |
| `tdd`                         | applied | Execution must start with a red browser row before patching.             |
| `high-risk-deliberate-pass`   | applied | Browser destructive editing behavior can corrupt text.                   |
| `performance-oracle`          | skipped | This lane is not a hot-path/perf claim; existing inline rows are enough. |
| `performance`                 | skipped | No cohort/benchmark behavior is being claimed.                           |
| `vercel-react-best-practices` | skipped | No React render/subscription API change planned.                         |
| `react-useeffect`             | skipped | No effect lifecycle change planned.                                      |
| `shadcn`                      | skipped | No UI component system change.                                           |

## High-Risk Pre-Mortem

Trigger: destructive browser editing behavior.

Blast radius:

- model delete semantics;
- inline normalization;
- DOM selection import/export;
- browser example correctness;
- issue closure claims.

Scenario 1: Core fix removes required inline spacers.

- Result: inline selection rows regress.
- Guard: run existing inlines tests and package leaf lifecycle tests.

Scenario 2: React fix imports a stale DOM selection.

- Result: Backspace deletes from the wrong model point.
- Guard: browser row asserts DOM and model selection before command.

Scenario 3: Fix handles the simple case but breaks cut or typing at inline edge.

- Result: #3148/#4074 regressions return.
- Guard: run existing inline typing/cut grep with the new #5972 row.

Rollback/remediation:

- If owner classification is wrong, revert the implementation slice and keep the red test as evidence.
- If nested inline behavior is ambiguous, keep the simple case fixed and add nested behavior as a separate user-decision row.

Verdict: keep plan.

## Maintainer Objection Ledger

| Objection                                                                | Answer                                                                                                                                                                               |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| "This is app-specific; raw Slate should not own it."                     | The issue names the official inlines example and uses editable inline content. Raw Slate owns the default delete contract unless proof shows the example is doing something invalid. |
| "Backspace should delete a character; empty inline deletion is special." | ProseMirror and Lexical both special-case node/boundary deletion. A model-present empty inline is not a character.                                                                   |
| "Nested inline semantics are ambiguous."                                 | Agreed. The first proof only covers the simple official-example case. Nested cases remain non-claims.                                                                                |
| "A user can handle this in `onKeyDown`."                                 | That is a workaround, not v2 correctness. The official example should not need a product shortcut to avoid deleting adjacent text.                                                   |
| "Do not overfit Chromium."                                               | Start with Chromium for red proof because the issue is browser-visible, then run Firefox/WebKit before closure.                                                                      |

## Hard Cuts

- No new public API.
- No example-only workaround as a `Fixes #5972` claim.
- No raw-device mobile claim.
- No nested inline semantic claim.
- No stale generated live-gitcrawl edits.
- No #1654 split-specific claim.

## Scorecard

| Dimension                                                | Score | Evidence                                                                                                                       |
| -------------------------------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------ |
| React 19.2 runtime performance                           |  0.90 | No render subscription change; existing model-owned command path in `keyboard-input-strategy.ts` and `mutation-controller.ts`. |
| Slate-close unopinionated DX                             |  0.96 | Public API target is no new API; raw Slate owns the primitive.                                                                 |
| Plate and slate-yjs migration backbone                   |  0.90 | Operation determinism and no product shortcut requirement recorded.                                                            |
| Regression-proof testing strategy                        |  0.96 | Red browser row, owner classification trace, package tests by owner, cross-browser closeout.                                   |
| Research evidence completeness                           |  0.94 | Live gitcrawl, current v2 source, Lexical, ProseMirror, and Tiptap local source checked.                                       |
| shadcn-style composability and hook/component minimalism |  0.92 | No new component/hook surface; example remains normal Slate React composition.                                                 |

Total: `0.93`.

## Pass-State Ledger

| Pass                                | Status   | Evidence Added                                                                                                            | Plan Delta                                                                                                    | Open Issues | Next Owner          |
| ----------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------- | ------------------- |
| Current-state read                  | complete | `active goal state`, structural delete checkpoint, current source/test files                                               | Selected new lane, not prior slice continuation                                                               | none        | Ralplan             |
| ClawSweeper related issue discovery | complete | gitcrawl #5972 and hybrid search                                                                                          | #5972 selected, neighbors classified non-claim                                                                | none        | Ralplan             |
| Issue-ledger pass                   | complete | test candidate map, dossier, coverage matrix                                                                              | #5972 was kept Related until implementation proof landed                                                      | none        | Ralplan             |
| Intent/boundary                     | complete | explicit scope/non-goals/decision boundary                                                                                | no user question needed                                                                                       | none        | Ralplan             |
| Ecosystem synthesis                 | complete | Lexical/ProseMirror/Tiptap local source                                                                                   | concrete steal/reject decisions added                                                                         | none        | Ralplan             |
| High-risk pass                      | complete | destructive edit pre-mortem                                                                                               | owner classification gate added                                                                               | none        | Ralplan             |
| Issue sync accounting               | complete | coverage/dossier/PR pointers                                                                                              | generated live corpus unchanged by design                                                                     | none        | Ralplan             |
| Closure score                       | complete | score `0.93` with no dimension below `0.90`                                                                               | ready for execution                                                                                           | none        | Ralph               |
| Ralph execution start               | complete | `.tmp/completion-checks/slate-v2-inline-delete-boundary-repro-ralplan.md` moved to `pending`                              | red browser row became the active pass                                                                        | none        | execution agent     |
| Red browser row                     | complete | `apps/www/tests/slate-browser/donor/examples/inlines.test.ts`                                                           | #5972 reproduced: Backspace after clearing the inline deleted the preceding space                             | none        | core delete planner |
| Core fix                            | complete | `packages/slate/src/transforms-text/delete-text.ts`; `packages/slate/test/delete-contract.ts` | Backspace at the start of an empty editable inline routes to path delete instead of previous-character delete | none        | verification        |
| Verification and issue sync         | complete | package test, browser parity, typecheck, lint, issue ledgers, PR reference                                                | #5972 moved from Related to Fixes                                                                             | none        | done                |

## Plan Deltas From Review

- Changed next lane from generic bucket selection to focused #5972.
- Strengthened "needs repro" into a red-browser-first execution plan.
- Rejected public API expansion.
- Added owner classification before patching.
- Added ecosystem-specific delete strategy rather than vague comparison.
- Kept mobile/IME rows related but unclaimed.

## What Would Change The Decision

- If current `/examples/inlines` cannot reproduce #5972 even with an equivalent empty editable inline, execution should stop at dossier update and not patch.
- If the red proof shows browser selection is wrong before Backspace, route to React/DOM selection instead of core delete.
- If the red proof shows only a native `<input>` embedded inside contenteditable can reproduce, this becomes interactive-internal-control policy, not editable inline content.
- If a nested-inline repro appears, split it into a second plan.

## Ralph Execution Prompt

Use `[$ralph](/Users/zbeyens/git/plate-2/.agents/skills/ralph/SKILL.md)` on this plan.

Start execution in `Plate repo root` with the red Chromium browser row for #5972. Do not patch before the red row classifies owner. After the first red row, choose the narrow owner branch:

- core delete target;
- React/DOM selection import/repair;
- example-only non-claim.

Then run the focused package/browser gates listed above and sync issue claims only after green proof.

## Completion Gates

- [x] current source owner recorded
- [x] issue corpus checked with gitcrawl
- [x] #5972 selected with explicit non-goals
- [x] ecosystem synthesis complete
- [x] issue coverage/dossier/PR sync planned and pointer-updated
- [x] no public API left in maybe language
- [x] implementation phases and fast gates are executable
- [x] red browser row reproduced #5972
- [x] owner classified as core delete target planning
- [x] core package proof added
- [x] Chromium/Firefox/WebKit inlines proof green
- [x] issue coverage, dossier, PR reference, and open-issues ledger synced
- [x] completion checkpoint marked `done`

## Execution Closeout

Decision:

- Claim `Fixes #5972`.
- Owner was `packages/slate/src/transforms-text/delete-text.ts`.
- No public API change.
- No mobile/IME or nested-inline claim.

Verification:

```bash
bun test ./packages/slate/test/delete-contract.ts --test-name-pattern "empty editable inline"
bun test ./packages/slate/test/delete-contract.ts
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium --grep "empty editable inline"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium --grep "empty editable inline|types inside an editable inline|keeps the start of following text distinct|keeps caret editable after cutting inline link text"
PLAYWRIGHT_RETRIES=0 bunx playwright test playwright/integration/examples/inlines.test.ts --project=chromium --project=firefox --project=webkit --grep "empty editable inline|types inside an editable inline|keeps the start of following text distinct|keeps caret editable after cutting inline link text"
bun typecheck:packages
bun lint:fix
```
