---
date: 2026-04-18
topic: slate-v2-release-readiness
status: active
---

# Slate v2 Release Readiness Decision

## Current Verdict

Not release-ready.

The repo has moved past the package-runtime blocker phase.

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

- the live `packages/slate` core benchmark package now exists and the latest
  compare read says:
  - explicit normalization is no longer the blocker
  - read-after-write observation is still slower than legacy, but bounded
  - huge-document core typing is still slower than legacy, but bounded
- contributor-facing example parity outside the kept v2-only set is still not
  fully classified:
  - same-path open rows still include:
    - `code-highlighting`
    - `markdown-preview`
    - `markdown-shortcuts`
    - `scroll-into-view`
    - `shadow-dom`
    - `styling`
    - `tables`
  - no same-path mixed rows remain after `images` prompt/delete proof
  - broader browser/input parity remains open in
    `true-slate-rc-proof-ledger.md`
- the stronger `slate-react` perf-superiority claim is command-owned and
  closed for important huge-doc lanes:
  - `bench:react:rerender-breadth:local`
  - `bench:react:huge-document-overlays:local`
  - `bench:react:huge-document:legacy-compare:local`
  - direct 5000-block comparison is the proof gate and is green on important
    lanes
  - 1000-block runs are smoke/debug only and do not close the lane
  - first shelled-block activation versus legacy chunking-on is the explicit
    accepted occlusion/corridor tradeoff
- RC ledger closure and final claim-width sync are still pending

## Current Claim Width

The live claim is only this:

- the migration program is active
- tranche order is locked
- drift discipline is locked
- redesign-first doctrine is now live for `packages/slate`:
  - native transaction/store-first direction wins
  - compatibility survives only where it still earns its keep
  - rewrite is allowed when retrofit shape blocks the better API
- tranche 1 Bun/tooling/docs ownership is green
- tranche 2 React 19.2.5 + Next 16.2.4 + TypeScript 6.0.3 compatibility is
  green
- `packages/slate` is materially farther along:
  - package-local tests/build/typecheck/lint are green
  - query / operations / snapshot / legacy fixture owners are live
  - accessor / transaction seam is recovered
  - `editor.operations` is now demoted behind an explicit getter seam
  - `editor.children` / `editor.selection` / `editor.marks` are now classified
    as compatibility mirrors instead of primary seams
  - `withTransaction(editor, tx => ...)` now exposes explicit draft reads
  - `Editor.apply(editor, op)` is now the explicit public single-op writer
  - instance `editor.apply(op)` is now compatibility-only
  - commit subscribers now outrank `editor.onChange()` as the post-commit seam
  - instance `editor.onChange()` is now compatibility-only
  - RC posture for those compatibility-only seams is now explicit:
    keep them through RC
    revisit hard cuts only after sibling-package migration pressure is gone
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
  - required v2-only examples are real and green in Chromium
  - kept north-star perf lanes are command-backed:
    - `bench:react:rerender-breadth:local`
    - `bench:react:huge-document-overlays:local`
    - `bench:react:huge-document:legacy-compare:local`
  - the data-model-first / React-perfect huge-doc runtime lane is closed:
    direct DOM sync has capability guards, custom render/projection/IME
    fallbacks are proved in Chromium, shell activation is separate from
    selection, shell-backed fragment paste is safe, and `slate-dom` /
    `slate-react` build/typecheck are green
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

- best React runtime locality
- explicit decoration / annotation / widget architecture
- better large-document posture than legacy

The next mainline blocker is:

- final claim-width / RC ledger closure on top of the now-verified package,
  example, and perf owners

not:

- pretending DOM / React package recovery is still the blocker
- broad package rewrite by default
- rewrite-avoidance by default
- compacted-away v2 architecture truth
