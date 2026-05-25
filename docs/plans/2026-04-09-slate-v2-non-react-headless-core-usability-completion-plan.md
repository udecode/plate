---
date: 2026-04-09
topic: slate-v2-non-react-headless-core-usability-completion
status: completed
---

# Slate V2 Non-React / Headless Core Usability Completion Plan

## Goal

Close the `non-React / headless core usability` lane in
[master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)
and turn the corresponding open bucket in
[release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
from `partial` to closed-by-proof.

For this lane, "100% completion" means:

1. headless package-split usage is explicit and honest
2. direct non-React composition is proved on the current package surfaces
3. contributor-facing package slots needed for headless use are source-runnable
   and directly verified
4. docs stop implying that serious Slate usage starts at `withReact(...)`
5. any remaining missing width is pushed into the broader public-surface lane
   instead of hiding here

## Problem Frame

The current repo already has a lot of real non-React value:

- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
  proves durable editor-owned refs
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)
  proves fragment extraction/insertion on the core side
- [slate-hyperscript proof closure](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-hyperscript-proof-closure.md)
  already restored the contributor-facing hyperscript slot
- workspace root entries are already fixed under Yarn PnP for source-time
  package-name imports
- package readmes for
  [slate](/Users/zbeyens/git/slate-v2/packages/slate/Readme.md),
  [slate-history](/Users/zbeyens/git/slate-v2/packages/slate-history/Readme.md),
  and
  [slate-hyperscript](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/Readme.md)
  already describe current non-React surfaces cleanly

So this lane is not open because headless core is missing.

It is open because the current story is still fragmented across:

- partial `headless/core` rows in
  [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- partial public-surface rows for
  [slate-hyperscript](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/index.js)
  and
  [slate/src/index.ts](/Users/zbeyens/git/slate-v2/packages/slate/src/index.ts)
- docs that still route almost every walkthrough through `withReact(createEditor())`

That makes the current headless claim weaker than it should be, and it lets the
remaining gap blur together with the broader public-surface lane.

## Planning Decision

Do **not** try to close this lane by collapsing the package split.

Do **not** treat headless as “single package with everything stuffed into
core.”

Close the lane on the current architecture:

- `slate` owns document meaning, refs, transforms, and fragment semantics
- `slate-history` owns undo/redo batching over the same transaction model
- `slate-hyperscript` owns test/fixture/document construction helpers
- `slate-dom` owns browser transport, not the headless lane
- `slate-react` is downstream of the headless lane, not its owner

That is the correct target because
[architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)
already says not to confuse headless with single-package.

## Scope

### In scope

- direct non-React composition over `slate`, `slate-history`, and
  `slate-hyperscript`
- proof that package-name imports resolve from source in the workspace
- proof that refs and clipboard behavior are first-class on the core side
- one explicit headless usage story in docs that does not route through React
- clean lane boundaries versus the broader public-surface lane

### Out of scope

- React runtime ergonomics
- DOM bridge and browser transport proof
- Android-only DOM baggage
- broader helper/API width that belongs to the public-surface lane
- collaboration design work beyond normal headless composition

## Relevant Current Truth

### Already recovered

- [2026-04-09-slate-v2-slate-hyperscript-proof-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-slate-hyperscript-proof-closure.md)
  closed the contributor-facing hyperscript package slot with fixture + smoke
  proof
- [2026-04-09-slate-v2-workspace-root-entry-closure.md](/Users/zbeyens/git/plate-2/docs/plans/2026-04-09-slate-v2-workspace-root-entry-closure.md)
  made workspace package roots source-runnable under Yarn PnP
- [packages/slate/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate/Readme.md)
  and
  [packages/slate-history/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate-history/Readme.md)
  already describe the current headless package surfaces
- [replacement-family-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-family-ledger.md)
  already treats `slate-hyperscript` as a restored contributor-facing slot

### Relevant learnings

- [2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-runtime-backed-refs-should-not-pretend-to-be-legacy-transformable-structs.md)
  proves ref docs must describe the current editor-owned model, not fake legacy
  helpers
- [2026-04-03-slate-v2-range-refs-must-be-transaction-aware-and-default-inward.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-range-refs-must-be-transaction-aware-and-default-inward.md)
  proves durable non-React anchors only work on the current transaction-aware
  design
- [2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md](/Users/zbeyens/git/plate-2/docs/solutions/logic-errors/2026-04-03-slate-v2-clipboard-boundary-proof-must-split-fragment-semantics-and-dom-transport.md)
  proves core owns fragment meaning while DOM owns browser transport
- [2026-04-09-slate-workspace-packages-should-have-live-root-source-entries-under-pnp.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-workspace-packages-should-have-live-root-source-entries-under-pnp.md)
  proves workspace package usability depends on live root entries, not `dist/`
  luck
- [2026-04-09-slate-workspace-package-tests-need-a-live-root-entry-under-pnp.md](/Users/zbeyens/git/plate-2/docs/solutions/developer-experience/2026-04-09-slate-workspace-package-tests-need-a-live-root-entry-under-pnp.md)
  proves package tests must import real workspace source by package name

### Current pressure points

- the proof ledger still leaves `headless/core` rows `partial` even though the
  underlying contract tests are already strong
- the walkthrough/docs stack is still mostly React-first
- the remaining difference between “headless lane” and “public-surface lane”
  is still blurry enough to waste future batches

## Completion Criteria

This lane is done when all of the following are true:

1. one explicit headless contract owner exists for direct non-React
   composition, instead of relying on scattered partial rows
2. the owner file proves a current package-split usage story across:
   - `slate`
   - `slate-history`
   - `slate-hyperscript`
3. `range-ref-contract.ts` and `clipboard-contract.ts` are treated as direct
   headless capability proof, not orphan rows parked under oracle harvest
4. workspace package-name imports for the headless packages are directly
   verified from source
5. one doc path shows non-React startup/composition without making React look
   mandatory
6. the proof ledger can close the `headless/core` lane without pretending the
   broader public-surface lane is also done
7. whatever still remains outside this batch is clearly handed to the
   `broad API / public surface reconciliation` lane

## Implementation Units

### Unit 1. Give the lane one real owner

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/headless-contract.ts` (new)
- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)

Work:

- create one dedicated headless owner file instead of letting the lane live as
  two partial rows plus scattered public-surface notes
- keep `range-ref-contract.ts` and `clipboard-contract.ts` as detailed proof
  files, but make `headless-contract.ts` the batch owner that ties them
  together into one honest usage story

Reason:

- the current proof exists
- the missing part is one auditable statement of what headless usage actually
  means in this repo

### Unit 2. Prove direct non-React composition over the package split

Files:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/headless-contract.ts` (new)
- [packages/slate/index.ts](/Users/zbeyens/git/slate-v2/packages/slate/index.ts)
- `/Users/zbeyens/git/slate-v2/packages/slate-history/index.ts`
- [packages/slate-hyperscript/index.ts](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/index.ts)

Work:

- prove one current composition flow that uses package-name imports from source:
  - `createEditor()`
  - `withHistory(...)`
  - `Editor.rangeRef(...)` / `Editor.getFragment(...)` or
    `Transforms.insertFragment(...)`
  - `slate-hyperscript` document construction
- keep it entirely non-React

Required test scenarios:

- package-name imports resolve to live source in the workspace for `slate`,
  `slate-history`, and `slate-hyperscript`
- a hyperscript-built editor tree can be consumed by the current core/editor
  package without local cheats
- `withHistory(createEditor())` works in the same headless flow
- refs and fragment helpers behave as part of that headless composition story,
  not as isolated curiosities

### Unit 3. Make the docs show a real headless entry path

Files:

- [docs/walkthroughs/01-installing-slate.md](/Users/zbeyens/git/slate-v2/docs/walkthroughs/01-installing-slate.md)
- [docs/concepts/08-plugins.md](/Users/zbeyens/git/slate-v2/docs/concepts/08-plugins.md)
- [packages/slate/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate/Readme.md)
- [packages/slate-history/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate-history/Readme.md)
- [packages/slate-hyperscript/Readme.md](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/Readme.md)

Work:

- add one explicit non-React startup path in the docs
- keep the package readmes aligned with that same path
- stop making the walkthrough stack feel like `withReact(createEditor())` is
  the only serious way in

Required doc outcome:

- readers can see a headless-first path immediately
- the package split remains explicit
- React still reads as the main runtime adapter, not the required starting
  point

### Unit 4. Close the proof rows cleanly

Files:

- [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md)
- [release-file-review-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md)
- [release-readiness-decision.md](/Users/zbeyens/git/plate-2/docs/slate-v2/release-readiness-decision.md)
- [full-replacement-blockers.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/full-replacement-blockers.md)
- [overview.md](/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md)
- [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md)

Work:

- close `headless/core` only if the owner file plus package/readme/doc updates
  are enough to defend the sentence
- keep the remaining gap explicit:
  - broader helper/API width stays in the public-surface lane
  - collaboration invariants stay in the history/collaboration lane

Reason:

- otherwise this lane will falsely absorb work that belongs somewhere else

## Recommended Order

1. create the dedicated headless owner file
2. prove package-split headless composition there
3. refresh the docs so non-React usage is visible and current
4. then close the headless/core lane in the live docs

## Verification Targets

Primary proof surfaces:

- `/Users/zbeyens/git/slate-v2/packages/slate/test/headless-contract.ts`
- [range-ref-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/range-ref-contract.ts)
- [clipboard-contract.ts](/Users/zbeyens/git/slate-v2/packages/slate/test/clipboard-contract.ts)
- [packages/slate-hyperscript/test/index.js](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/index.js)
- [packages/slate-hyperscript/test/smoke.js](/Users/zbeyens/git/slate-v2/packages/slate-hyperscript/test/smoke.js)

Required verification before declaring the lane closed:

- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/headless-contract.ts`
- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/range-ref-contract.ts ./packages/slate/test/clipboard-contract.ts`
- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate-hyperscript/test/index.js ./packages/slate-hyperscript/test/smoke.js`
- `yarn test:custom`
- `yarn lint:typescript`

## Hard Rules

- do not collapse the package split just to make the lane look simpler
- do not move browser transport into core to make clipboard seem “more
  headless”
- do not let this lane silently absorb broader helper/API width that belongs to
  public-surface reconciliation
- do not close the lane on readmes alone; one dedicated owner test file has to
  earn it

## Result

- `/Users/zbeyens/git/slate-v2/packages/slate/test/headless-contract.ts` now
  owns the lane directly
- the lane closes on direct package-split headless usage, not a fake
  single-package story
- whatever broader helper/API width still remains stays in the public-surface
  lane instead of hiding here

## Verification

- `yarn exec mocha --require ./config/babel/register.cjs ./packages/slate/test/headless-contract.ts`
- `yarn workspace slate-hyperscript run test`
- `yarn test:custom`
- `yarn lint:typescript`
- `yarn exec eslint packages/slate/test/headless-contract.ts`
