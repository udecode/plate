---
date: 2026-04-09
topic: slate-v2-extension-model-behavior-interception-completion
status: completed
---

# Slate V2 Extension Model / Behavior Interception Completion Plan

## Goal

Close the `extension model / behavior interception` lane in
[master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
and turn the corresponding open bucket in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
from `partial` to closed-by-proof.

For this lane, “100% completion” means:

1. the live extension story is explicit and coherent
2. representative real ports exist on the current engine
3. headless, history, React runtime, and browser proof all cover those ports
4. the lane closes without re-opening normalization, clipboard, range-ref, or
   history regressions

## Problem Frame

The current repo already recovered a lot of extension surface:

- overrideable editor instance methods on `createEditor()`
- `Editor.*` delegation through the instance seam
- `normalizeNode(...)` and `shouldNormalize(...)`
- `withHistory(...)`
- `withReact(...)`

That is real progress, but it still reads like a pile of recovered seams rather
than one finished extension model.

Right now the strongest proofs are:

- large `snapshot-contract.ts` monkey-patch rows
- one real app-owned normalizer in `forced-layout.tsx`
- thin `withHistory` / `withReact` compatibility helpers

That is not yet the same thing as proving:

- primitive behavior interception
- domain command extension
- non-React/headless-first extension usage
- composition under history/runtime/browser proof
- representative real ports serious Slate users would recognize as extension
  work instead of test-only stunts

## Planning Decision

Do **not** treat this lane as a greenfield middleware rewrite.

The live completion target is the current instance-method plus transaction
boundary model:

- `editor.apply(op)` stays the low-level seam
- overrideable instance methods stay the main behavior-interception seam
- `withHistory(...)` / `withReact(...)` stay explicit wrappers
- app-owned `normalizeNode(...)` stays the real schema-extension seam

The future named middleware-phase architecture in
[architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
remains reference-only.

If this plan tries to land that future architecture, it will balloon and miss
the actual lane closeout.

## Scope

### In scope

- close the extension-model proof lane on the current engine
- add representative wrapper ports that exercise real behavior interception
- prove wrapper composition across:
  - headless core
  - history
  - React runtime
  - browser behavior
- update roadmap / blocker / proof docs when the lane is verifiably green

### Out of scope

- replacing the engine with named middleware phases
- reopening major deletion review
- broad built-in normalization parity beyond the already-proved seams
- blanket legacy plugin-stack recreation

## Relevant Current Truth

### Already recovered

- [2026-04-08-slate-v2-instance-surface-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-instance-surface-recovery.md)
  recovered the overrideable instance surface, delete methods, query hooks,
  `markableVoid`, `insertBreak`, `insertSoftBreak`, and the real
  `normalizeNode(...)` seam
- [2026-04-08-slate-v2-normalization-policy-recovery.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-normalization-policy-recovery.md)
  narrowed `shouldNormalize(...)` into a pass-level gate
- [2026-04-09-slate-v2-built-in-normalization-recovery-lane.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-built-in-normalization-recovery-lane.md)
  recovered the safe built-in normalization floor without reopening broad
  coercion
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
  already has multiple `extension model` rows, but they are still `partial`

### Relevant learnings

- [2026-04-08-slate-v2-shouldnormalize-must-be-pass-level-and-fallback-safe.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-08-slate-v2-shouldnormalize-must-be-pass-level-and-fallback-safe.md)
  proves new hooks must be fallback-safe and have explicit call cadence
- [2026-04-07-slate-v2-node-op-wrappers-must-not-reuse-runtime-ids-or-read-committed-snapshots-inside-transactions.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-07-slate-v2-node-op-wrappers-must-not-reuse-runtime-ids-or-read-committed-snapshots-inside-transactions.md)
  proves wrappers must use live draft truth inside transactions
- [2026-04-07-slate-v2-selection-helpers-must-read-live-draft-selection.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-07-slate-v2-selection-helpers-must-read-live-draft-selection.md)
  proves intercepted behavior cannot reason from committed selection during an
  active transaction
- [2026-04-09-slate-built-in-normalization-cannot-be-ported-naively-onto-v2.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-09-slate-built-in-normalization-cannot-be-ported-naively-onto-v2.md)
  proves broad built-in normalization changes are not cheap wins

### Existing real ports

- [forced-layout.tsx](/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx)
  already installs a real app-owned `normalizeNode(...)` wrapper
- [with-history.ts](/Users/zbeyens/git/slate-v2/packages/slate-history/src/with-history.ts)
  is a real wrapper over `createEditor()`
- [with-react.ts](/Users/zbeyens/git/slate-v2/packages/slate-react/src/plugin/with-react.ts)
  is a real compatibility wrapper, but currently thin

### Missing real ports

- there is no first-class headless extension contract suite
- there is no representative app wrapper for primitive edit interception on the
  current engine
- there is no representative app wrapper proving domain command extension on
  the editor seam rather than only through UI-level props/handlers
- wrapper composition under `withHistory(...)` and `withReact(...)` is not yet
  the organizing proof story of the lane

## Completion Criteria

This lane is done when all of the following are true:

1. one dedicated headless extension contract suite exists
2. one representative primitive-interception port exists and is proved
3. one representative domain-command extension port exists and is proved
4. one representative schema-extension port exists and is proved without React
   coupling
5. wrapper composition is proved under:
   - plain `createEditor()`
   - `withHistory(createEditor())`
   - `withReact(createEditor())`
   - current browser example surfaces
6. `true-slate-rc-proof-ledger.md` can describe the lane without overloaded
   “partial” rows hiding missing capability coverage
7. `release-file-review-ledger.md` flips the extension-model bucket closed

## Implementation Units

### Unit 1. Split the lane into auditable proof rows

Files:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)

Work:

- split the current overloaded extension lane into explicit capability rows:
  - primitive behavior interception
  - domain command extension
  - schema / normalization extension without React coupling
  - non-React / headless extension composition
  - operation/history integrity under extension hooks
- keep each row attached to one primary proof surface
- close the lane only when all capability rows are green or intentionally cut

Reason:

- today the extension proof is real but too slogan-shaped
- the lane must stop hiding missing coverage inside giant `snapshot-contract.ts`
  rows

### Unit 2. Create a dedicated headless extension contract suite

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-contract.ts` (new)
- `/Users/zbeyens/git/slate-v2/packages/slate/test/snapshot-contract.ts`

Work:

- move extension-lane proof out of the giant oracle where it makes sense
- keep `snapshot-contract.ts` as the broad surface oracle
- use `extension-contract.ts` for explicit wrapper/interception scenarios

Test scenarios:

- a wrapper intercepts `insertText(...)` and delegates through the current
  engine while preserving transaction semantics
- a wrapper intercepts `deleteBackward(...)`, `deleteForward(...)`, or
  `deleteFragment(...)` and reads live draft selection correctly inside
  `Editor.withTransaction(...)`
- a wrapper intercepts `insertBreak(...)` and delegates through the same
  instance seam `Editor.*` uses
- multiple wrappers compose in deterministic order on one editor instance
- `editor.apply(op)` still works as the low-level seam under wrapped editors

### Unit 3. Extract the real schema-extension port

Files:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/plugins/with-forced-layout.ts` (new)
- `/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`

Work:

- extract the `forced-layout` normalizer into a named wrapper module
- make it the canonical representative port for schema / normalization
  extension
- keep its behavior on the already-proved safe normalization seam

Test scenarios:

- the wrapper enforces title-first / paragraph-second in headless usage
- the wrapper composes with `Editor.replace(...)` and explicit normalize passes
- the wrapper still works through the React runtime surface without re-opening
  the old subscribe-based workaround
- the wrapper does not widen normalization beyond the already-proved explicit
  and safe default seams

### Unit 4. Add a representative primitive-interception port

Files:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/plugins/with-links.ts` (new)
- `/Users/zbeyens/git/slate-v2/site/examples/ts/components/links-surface.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/links.test.ts`

Work:

- stop using `EditableBlocks isInline={...}` as the main story for the links
  example
- move inline behavior ownership onto a real editor wrapper
- keep the example’s current command behavior, but anchor it to the editor seam

Test scenarios:

- link nodes are recognized through wrapper-owned `editor.isInline(...)`
  behavior instead of only a render prop
- selection wrapping and paste wrapping still behave the same under the wrapped
  editor
- the wrapped editor composes with `withHistory(...)`
- browser proof still passes for wrapping the current selection as a link and
  paste-driven wrapping

### Unit 5. Add a representative domain-command / inline-void port

Files:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/plugins/with-mentions.ts` (new)
- `/Users/zbeyens/git/slate-v2/site/examples/ts/components/mentions-surface.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/mentions.test.ts`

Work:

- move mention inline/void behavior ownership onto a real wrapper
- use it as the canonical domain-command extension port

Test scenarios:

- mention nodes are recognized through wrapper-owned `isInline(...)`
- void/mark behavior, if required by the example shape, is owned through
  wrapper hooks instead of ad hoc runtime props
- mention insertion and post-insert selection behavior still work under
  `withHistory(...)`
- browser proof still passes for mention insertion and post-insert selection

### Unit 6. Prove wrapper composition under history and React

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/surface-contract.tsx`

Work:

- add explicit composition rows:
  - `withHistory(withLinks(createEditor()))`
  - `withHistory(withMentions(createEditor()))`
  - `withReact(withLinks(createEditor()))`
  - `withReact(withMentions(createEditor()))`
  - `withReact(withForcedLayout(createEditor()))`

Test scenarios:

- intercepted behavior still records sane history batches
- undo/redo semantics remain coherent under wrapped editors
- selection restore and mounted runtime behavior stay correct
- React helper surfaces do not silently bypass wrapper-owned behavior

### Unit 7. Close the lane in the live docs

Files:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

Work:

- flip the extension-model bucket closed only after proof is green
- remove extension-model language as the “next blocker”
- leave the remaining open lanes explicit:
  - schema / normalization breadth beyond the safe seam, if still partial
  - non-React / headless usability, if still partial
  - operation-history-collaboration integrity, if still partial
  - broad API/public-surface reconciliation, if still partial

## Verification Plan

Primary test files:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/extension-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-history/test/history-contract.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/test/runtime.tsx`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/links.test.ts`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/mentions.test.ts`
- `/Users/zbeyens/git/slate-v2/playwright/integration/examples/forced-layout.test.ts`

Verification bar:

- headless/package proof stays green
- history proof stays green under wrapped editors
- React runtime proof stays green under wrapped editors
- browser proof stays green on the representative example ports
- no regression in clipboard / range-ref / normalization proof for the touched
  seams

## Sequencing

1. split the lane into explicit proof rows
2. land `extension-contract.ts`
3. extract and prove `with-forced-layout`
4. land `with-links`
5. land `with-mentions`
6. add composition proof in history/runtime/browser layers
7. close the lane in the live docs

## Risks

- The easiest failure mode is fake completion through test-only monkey-patching.
  Real wrapper ports must exist.
- Moving example behavior from UI props to editor wrappers can accidentally
  change browser/runtime semantics. Keep ports narrow and prove them immediately.
- Normalization is the dangerous seam. Do not widen built-in normalization
  beyond the already-proved floor just to make the extension story look more
  symmetrical.
- Wrapper code that reads committed snapshot state during an active transaction
  will silently break the lane’s credibility.

## Assumptions

- No external research is needed; the repo already has enough current docs,
  proof surfaces, and solved examples to plan this lane honestly.
- Closing the extension lane does **not** require shipping the future
  middleware-phase architecture from Part I.
- It is acceptable for this lane to create small example-local plugin modules
  under `site/examples/ts/plugins/` when that produces cleaner representative
  ports and proof.
