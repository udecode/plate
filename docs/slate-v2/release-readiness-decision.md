---
date: 2026-04-18
topic: slate-v2-release-readiness
status: active
---

# Slate v2 Release Readiness Decision

## Current Verdict

Not release-ready.

The repo has moved past the package-runtime blocker phase. The active owner is
final claim-width closure for the absolute architecture plan.

## Readiness Gates

The migration cannot claim RC readiness until all of these are true:

1. tranche 1 root/tooling/docs lane is stable
2. tranche 2 React 19.2 + Next + TypeScript 6 compatibility lane is stable
   and behavior-preserving
3. package recovery finishes in declared order
4. every draft file has an explicit disposition
5. surviving drift is either:
   - engine-forced, or
   - clear current value
6. all other drift is named `post RC`

## Current Blockers

- final integration, build, typecheck, lint, and perf gates need a same-turn
  closeout run for the active plan
- the editing epoch destructive proof is green for focused generated and
  persistent-profile rows, but the full `bun test:integration-local` closure
  sweep still needs to run in the final slice
- release docs must keep the exact claim width from
  [absolute-architecture-release-claim.md](/Users/zbeyens/git/plate-2/docs/slate-v2/absolute-architecture-release-claim.md)
- native mobile proof stays scoped to the current automated claim
- the huge-document middle-shell caveat stays explicit
- RC ledger closure and completion-check closure are pending

## Current Claim Width

The live claim is only this:

- the migration program is active
- tranche order is locked
- drift discipline is locked
- absolute architecture doctrine is live:
  - Slate model and operations stay the collaboration truth
  - `editor.read` and `editor.update` are the public lifecycle
  - transaction-owned primitive editor methods are the mutation power API
  - `EditorCommit` is the local runtime truth for history, React, DOM repair,
    and proof
  - extension methods compose through `editor.extend({ methods })`
  - rewrite is allowed when retrofit shape blocks the better API or proof
- tranche 1 Bun/tooling/docs ownership is green
- tranche 2 React 19.2.5 + Next 16.2.4 + TypeScript 6.0.3 compatibility is
  green
- `packages/slate` is materially farther along:
  - package-local tests/build/typecheck/lint are green
  - query / operations / snapshot / legacy fixture owners are live
  - accessor / transaction seam is recovered
  - stale public field pressure is cut from primary docs/examples/tests:
    `editor.children`, `editor.selection`, `editor.marks`, and
    `editor.operations` are not primary read seams
  - `Transforms.*` is not the primary mutation story
  - direct `editor.apply` and `editor.onChange` are not extension points
  - commit subscribers and extension methods own those jobs
  - range refs, bookmarks, normalization, transforms, surface, clipboard, and
    extension owner files are live
  - the core benchmark package exists and runs
  - the broad write-path catastrophe has been cut down sharply
  - the remaining `slate` perf story is now bounded residual deltas, not a
    catastrophic regression class
  - standalone `snapshot-contract.ts` is not included in that package-closeout
    claim by default and should not be cited as green unless rerun directly
  - core perf regression coverage is complete but selective:
    - current-only family owners are landed
    - current-vs-legacy compare coverage exists for the kept blocker lanes
    - it is not exhaustive compare coverage for every exported helper family
- `packages/slate-history` is now materially farther along too:
  - package-local test/build/typecheck/lint are green
  - direct kept-row proof exists in `history-contract.ts`
  - batching / save / merge / stack-write / commit-order proof exists in
    `integrity-contract.ts`
  - the live history compare owner exists again:
    `bench:history:compare:local`
  - current history perf still trails legacy, but in a bounded class rather
    than a blocker-shaped regression
- `packages/slate-hyperscript` is now materially farther along too:
  - package-local test/build/typecheck/lint are green
  - fixture parsing and cursor/selection construction are still owned by
    `index.spec.ts`
  - draft smoke behavior is now directly owned by `smoke-contract.ts`
  - the public creation surface remains preserved:
    - `createHyperscript`
    - `createEditor`
    - `createText`
    - `jsx`
- `packages/slate-dom` is now materially farther along:
  - direct kept-row proof exists in:
    - `bridge.ts`
    - `clipboard-boundary.ts`
  - package build/typecheck/lint are green
  - `packages/slate-react` is now materially farther along:
  - focused runtime proof owners are green across provider/hooks, ReactEditor,
    primitives, editable behavior, projections/annotations/widgets, app-owned
    customization, large-document runtime, and with-react
  - required v2-only examples are real and green
  - kept north-star perf lanes are command-backed:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
    - `bench:react:huge-document:legacy-compare:local`
  - the data-model-first / React-perfect huge-doc runtime lane is closed:
    direct DOM sync has capability guards, custom render/projection/IME
    fallbacks are proved, shell activation is separate from selection,
    shell-backed fragment paste is safe, generated cursor/caret gauntlets are
    replayable, and `slate-dom` / `slate-react` build/typecheck are green
  - the editing epoch destructive lane is materially closed for the focused
    regression family:
    - repeated word-delete is model-owned and epoch-traced
    - plain text paste over selected range runs inside `editor.update`
    - generated destructive paste/word-delete gauntlets are replayable and
      shrinkable
    - persistent-profile soak emits release-proof artifacts
    - focused Chromium, Firefox, WebKit, and mobile-project rows are green
  - native mobile transport claim width is scoped:
    Playwright mobile viewport and semantic handles are not raw Android/iOS
    native keyboard or clipboard proof; Appium descriptors are direct-device
    candidates only when the device gate runs
  - the same-path `huge-document` example is not a parity blocker:
    it is explicitly cut as a legacy chunking playground; v2 huge-doc truth is
    owned by `large-document-runtime` and the 5000-block benchmark gate
  - the same-path `custom-placeholder`, `paste-html`, `richtext`,
    `editable-voids`, and `images` rows are recovered:
    their current browser proof is green for the supported placeholder,
    formatting, rich editing, editable void, and prompt/delete contracts
  - end-state gates are green:
    - `bun run test`
    - `bun run test:integration-local`

Tranches 3 through 6 are now settled enough to stop being the main blocker.

No blanket RC claim beyond that narrower package/runtime truth is live yet.

Parity alone is not enough.

The live program must also preserve the v2 reason to exist:

- read/update lifecycle with primitive-method DX
- best React runtime locality
- explicit decoration / annotation / widget architecture
- better large-document posture than legacy
- generated browser gauntlets for cursor/caret claims

The next mainline blocker is:

- final same-turn integration/build/type/lint/perf closure on top of the
  verified public API, kernel, generated gauntlet, mobile-scope, and perf
  owners

not:

- pretending DOM / React package recovery is still the blocker
- broad package rewrite by default
- rewrite-avoidance by default
- compacted-away v2 architecture truth
