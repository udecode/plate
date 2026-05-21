# Slate v2 Absolute Architecture Cleanliness Review

status: done
owner: slate-ralplan
created: 2026-05-11
completion: `.tmp/019e1701-5e30-75c0-9a6d-bf7127ba2ee0/completion-check.md`
continuation: `.tmp/019e1701-5e30-75c0-9a6d-bf7127ba2ee0/continue.md`

## Verdict

No. Slate v2 has the right core bet, but it is not the cleanest possible
architecture yet.

Do not rewrite the editor kernel. Keep the JSON document model, deterministic
operations, commit metadata, `editor.read`, `editor.update`, `state` and `tx`
extension namespaces, internal command middleware, and explicit stress rendering
modes. That shape is better than legacy Slate and closer to the right
ProseMirror/Lexical lesson: transaction-owned state changes, explicit dirty
regions, and runtime-owned browser bridges.

The remaining architecture debt is narrower and more useful:

1. Prove or replace the custom selector substrate.
2. Split the root runtime coordinator into smaller owners.
3. Keep huge-document direct comparison as a regression gate, not a blocker:
   the fresh narrowed run makes default `auto` strong enough for architecture
   planning, while DOM-present staged and experimental modes still need honest
   native-behavior/proof rows.

Anything broader than that is architecture theater.

## Intent Boundary

| Field                    | Decision                                                                                                                                                                             |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Intent                   | Decide whether Slate v2 is already the absolute best, cleanest architecture and produce an execution-grade plan for what remains.                                                    |
| Desired outcome          | A scored plan that protects the correct architecture and names only the real cleanup work.                                                                                           |
| In scope                 | Slate v2 runtime architecture, public API shape, React selector/runtime behavior, large-document performance gates, issue-accounting impact.                                         |
| Non-goals                | Implementing changes in this pass, broad GitHub rediscovery, current Plate public API compatibility, stabilizing experimental stress modes, rewriting the core because it feels big. |
| Decision boundary        | Slate Ralplan may edit only planning, research, issue-ledger, PR-reference, and scoped `.tmp` files. Slate v2 implementation belongs to a later `ralph` execution.                   |
| Unresolved user decision | None needed for this pass. The review gate is complete; execution belongs to a later `ralph` run.                                                                                    |

## Current Source Evidence

| Surface                      | Current owner                                                                                                                                                | Read                                                                                                                                                                                   |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Editor state/update backbone | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:76-79`, `:480-490`, `:493-497`, `:900-906`                                                            | Current public shape reads through editor methods, writes through `editor.update`, and exposes `state`/`tx` extension namespaces. Keep.                                                |
| Legacy extension slots       | `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts:60-76`                                                                                            | Runtime rejects `methods` and public `commands`. Active source already cut the stale extension shape.                                                                                  |
| Internal command registry    | `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts:920-927`                                                                                              | Commands still exist internally, which is fine. Do not expose them as product API.                                                                                                     |
| Selector substrate           | `.tmp/slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:1-87`, `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:104-148` | Main editor selector path uses a custom `useReducer` force-render helper, not React's external-store primitive. This is the biggest cleanup candidate.                                 |
| Adjacent external stores     | `.tmp/slate-v2/packages/slate-react/src/hooks/use-slate-annotations.tsx`, `use-slate-projections.tsx`, `use-slate-widgets.tsx`                               | Adjacent stores already use `useSyncExternalStore`, so the custom selector helper needs a proof or replacement.                                                                        |
| Selector fanout              | `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:189-343`                                                                               | Runtime/global/deferred listener sets are well-scoped, but ownership is tied to the custom selector substrate.                                                                         |
| Root runtime                 | `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:97-405`                                                                              | One hook wires composition, Android input, selection import/export, repair, trace, input rules, event runtime, root refs, lifecycle, and pending marks. It works, but it is too dense. |
| Virtualized public shape     | `.tmp/slate-v2/packages/slate-react/src/rendering-strategy/create-segment-plan.ts:3-25`                                                                      | `virtualized` is object-only and explicitly experimental, not a stable string peer. Keep.                                                                                              |
| Virtualized contract test    | `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx:327-345`                                                                                       | Contract proves `virtualized` stays object-only and experimental.                                                                                                                      |
| `useElementIf`               | `rg useElementIf` over `.tmp/slate-v2/packages/slate-react/src`, tests, site, and active docs                                                                | No live public use found in current source. This is not a current architecture blocker.                                                                                                |
| Perf replacement gate        | `docs/slate-v2/replacement-gates-scoreboard.md:32`                                                                                                           | Slate React perf superiority versus legacy chunking remains `pending / typing red`.                                                                                                    |
| RC proof ledger              | `docs/slate-v2/true-slate-rc-proof-ledger.md:74-83`                                                                                                          | Direct v2-vs-legacy huge-document typing superiority is still open.                                                                                                                    |

## Current Verification

Commands were run from the live sibling repo, not from `plate-2`.

| Command                                                                                                                            | Cwd                                                | Result                  | What it proves                                                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- |
| `bun --filter slate-react typecheck`                                                                                               | `/Users/zbeyens/git/slate-v2`                      | pass                    | Current `slate-react` types are coherent.                                                       |
| `bun test:vitest test/surface-contract.test.tsx test/provider-hooks-contract.test.tsx test/rendering-strategy-and-scroll.test.tsx` | `/Users/zbeyens/git/slate-v2/packages/slate-react` | 3 files / 64 tests pass | Public surface, provider hooks, rendering strategy, and scroll package contracts are green.     |
| `bun run bench:react:rerender-breadth:local`                                                                                       | `/Users/zbeyens/git/slate-v2`                      | pass                    | React rerender breadth is strong: broad/sibling/ancestor renders are zero in the measured rows. |

Fresh benchmark highlights:

- selection breadth: broad renders `0`, left block renders `0`, right block renders `0`, selection p95 `4.6ms`
- many leaf edit: block renders `0`, sibling leaf renders `0`, edited leaf renders `1`, edit p95 `4.27ms`
- deep ancestor edit: ancestor render events `0`, sibling branch/leaf renders `0`, deep leaf renders `1`, edit p95 `4.33ms`
- source-scoped invalidation: unrelated source recomputes stay `0` for text, selection, and external lanes

This is real evidence for the current invalidation direction. It does not close
the direct huge-document typing/select gate against legacy chunking.

## Final Score

Threshold for `done`: `0.92` with no P0 unresolved architecture item.

| Dimension                          | Weight | Score | Reason                                                                                                                                                          |
| ---------------------------------- | -----: | ----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React runtime performance          |   0.20 |  0.94 | Rerender breadth is strong; fresh 5,000-block narrowed compare shows default `auto` beating legacy chunking-on on the release-relevant type/promote/edit lanes. |
| Slate-close unopinionated DX       |   0.20 |  0.94 | `editor.read/update`, `state`/`tx`, no public `useElementIf`, active docs no longer teach legacy `methods`.                                                     |
| Plate/slate-yjs migration backbone |   0.15 |  0.90 | Commit/operation/state backbone is right; adapter proof is not this pass.                                                                                       |
| Regression-proof testing strategy  |   0.20 |  0.92 | Focused contracts, rerender breadth, and narrowed huge-doc compare all passed; future refactors still need contract-first execution.                            |
| Research evidence completeness     |   0.15 |  0.92 | React/Lexical/ProseMirror/Tiptap compiled research and cached issue ledgers agree on the narrower plan.                                                         |
| Composability/minimalism           |   0.10 |  0.92 | Stable API is cleaner; root runtime density and selector substrate keep it below excellent.                                                                     |
| Weighted score                     |   1.00 |  0.93 | Done as a planning/review gate; not done as implementation.                                                                                                     |

## Keep

| Decision                                                               | Why                                                                                               |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Keep `editor.read` / `editor.update` as the public state lifecycle     | It keeps writes transactional and gives collaboration/commit proof a stable backbone.             |
| Keep `state` and `tx` extension namespaces                             | They replace arbitrary method bags with a typed, scoped extension model.                          |
| Keep static `Editor.*` helpers as compatibility/runtime escape hatches | They do not need to be the recommended authoring API.                                             |
| Keep operation middleware internal                                     | Plugins need deterministic hooks, but public command middleware would become a product framework. |
| Keep `virtualized` object-only experimental                            | It is honest: useful for pathological documents, not native-behavior parity.                      |
| Keep shell/staged/full as explicit strategies                          | Default native-ish editing must not silently become a degraded stress mode.                       |

## Rewrite Or Prove

### P0: selector substrate

Current source:

- `useGenericSelector` uses `useReducer` force-render and ref-cached selector
  state.
- `useEditorSelector` wires that helper into editor/global/runtime/deferred
  listener fanout.
- Adjacent annotation/projection/widget stores use `useSyncExternalStore`.

Plan:

1. Build a tiny `useEditorExternalStoreSelector` adapter in the execution slice.
2. Compare it against current `useGenericSelector` for:
   - same-turn commit coalescing
   - selector error replay behavior
   - runtime-id scoped invalidation
   - deferred selector flush
   - React 19 compatibility under hidden/activity panels
3. Keep the current helper only if the execution proof records why `useSyncExternalStore`
   makes behavior worse or cannot model operations/change metadata cleanly.
4. If external-store wins, migrate editor and decoration selectors behind one
   adapter and keep the public hook surface unchanged.

Decision:

- Do not rewrite every selector blindly.
- Execute a proof spike first.
- The cleanest final architecture is one editor selector store adapter that can
  explain why it is or is not `useSyncExternalStore`-based. A custom
  force-render helper is acceptable only if it is explicitly defended by tests
  and benchmarks.

Proof:

```bash
cd /Users/zbeyens/git/slate-v2
bun --filter slate-react typecheck
cd /Users/zbeyens/git/slate-v2/packages/slate-react
bun test:vitest test/provider-hooks-contract.test.tsx test/surface-contract.test.tsx
cd /Users/zbeyens/git/slate-v2
bun run bench:react:rerender-breadth:local
```

### P0: root runtime coordinator

Current source:

- `useEditableRootRuntime` is 405 lines and wires almost every browser-runtime
  subsystem.
- Several subsystems already exist as separate modules, but the composition
  owner is still a dense dependency hub.

Plan:

1. Keep the public `<Editable>` API stable.
2. Split by ownership, not by file-size vanity:
   - composition and pending marks
   - Android/native input import
   - selection import/export/reconcile
   - repair and trace
   - input rules
   - event runtime bindings
   - scroll intent/export handoff
3. Add package contract rows before each split so behavior is pinned.
4. Do not split if the extracted owner just becomes a bag of refs.

Decision:

- Split ownership, not just files.
- The root hook may remain a coordinator, but it should stop owning every
  browser subsystem directly.
- A split that merely exports a giant mutable context is worse than doing
  nothing.

Proof:

```bash
cd /Users/zbeyens/git/slate-v2/packages/slate-react
bun test:vitest test/rendering-strategy-and-scroll.test.tsx
cd /Users/zbeyens/git/slate-v2
bun --filter slate-react typecheck
```

### P0: huge-document typing/select gate

Current docs explicitly said the direct legacy comparison was open for
typing/select lanes. This pass reran a narrowed fresh comparison for the
release-relevant current surfaces.

Fresh command:

```txt
cd /Users/zbeyens/git/slate-v2
REACT_HUGE_COMPARE_SKIP_BUILD=1 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent,v2VirtualizedExperimental REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local
```

Result:

| Lane                          | Legacy chunking-on mean | v2 default `auto` mean | Verdict          |
| ----------------------------- | ----------------------: | ---------------------: | ---------------- |
| ready                         |              `322.45ms` |              `26.28ms` | v2 wins          |
| start block type              |               `39.04ms` |              `11.46ms` | v2 wins          |
| start select then type        |               `47.63ms` |              `21.93ms` | v2 wins          |
| middle block type             |               `39.11ms` |              `10.79ms` | v2 wins          |
| middle select then type       |               `33.77ms` |              `31.74ms` | v2 wins narrowly |
| middle promote then type      |               `39.21ms` |              `30.50ms` | v2 wins          |
| replace full document         |              `118.14ms` |               `5.42ms` | v2 wins          |
| insert fragment full document |              `115.04ms` |               `7.94ms` | v2 wins          |

`selectAllMs` has a tiny mean regression for default `auto`
(`1.16ms` versus `0.94ms`) caused by one `4.65ms` sample; median is still
better (`0.30ms` versus `0.93ms`). That is not an architecture blocker.

`v2DomPresent` still has a few small middle-selection mean losses against
legacy chunking-on, and `v2VirtualizedExperimental` is still an explicit
degradation tier. Keep those as proof rows, not default-architecture blockers.

## Cut

| Candidate                                           | Verdict                      | Reason                                                                                                   |
| --------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| Public `useElementIf`                               | already cut in live source   | Do not restore aliases or compatibility names.                                                           |
| Active docs that teach `editor.extend({ methods })` | already cut from active docs | Historical plans can stay historical. Do not revive this surface.                                        |
| Stable string `virtualized`                         | already cut in live source   | Object-only experimental is the right pressure valve.                                                    |
| Public extension `commands`                         | hard cut                     | Internal registry is enough; public commands would make Slate a product framework.                       |
| Whole-core rewrite                                  | reject                       | The current kernel is not the problem. The mess is at selector/runtime composition and final perf proof. |

## Ecosystem Synthesis

| System      | Steal                                                                               | Reject                                                            | Current Slate v2 answer                                                                                          |
| ----------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| ProseMirror | Transaction-owned state, selection mapping, durable bookmarks, one DOM bridge owner | Schema/product heaviness                                          | `editor.update`, commit metadata, and runtime-owned browser bridges.                                             |
| Lexical     | Dirty-region discipline, command/runtime separation, commit data for React          | Class node model and custom DOM reconciler as the editor identity | Dirty runtime ids and scoped selector fanout without adopting Lexical's product model.                           |
| Tiptap      | Product-DX clarity and extension ergonomics                                         | Opinionated product API as Slate core                             | Keep Slate raw; Plate owns product ergonomics.                                                                   |
| React 19.2  | `useSyncExternalStore`, transitions/deferred work, hidden/background UI proof       | Pretending React primitives solve editor invalidation             | Use React primitives where they prove subscription/render behavior; keep editor dirty regions as the real truth. |

## Applicable Skill Review Notes

| Skill                         | Applicability | Result                                                                                                                                     |
| ----------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `intent-boundary-pass`        | applied       | Scope locked to architecture review and planning-only output.                                                                              |
| `steelman-pass`               | applied       | Whole rewrite rejected; selector/root runtime cleanup kept because it has concrete evidence.                                               |
| `high-risk-deliberate-pass`   | applied       | Public API/runtime/perf gates are high-risk; implementation deferred to `ralph`.                                                           |
| `vercel-react-best-practices` | applied       | Selector substrate maps to rerender/subscription rules; current evidence is good but not enough for external-store decision.               |
| `performance-oracle`          | applied       | P0 work targets repeated-unit render cost and root runtime fanout, not vague cleanup.                                                      |
| `performance`                 | applied       | Huge-doc cohort proof now supports default `auto`; DOM-present and experimental modes still need native-behavior rows before broad claims. |
| `tdd`                         | applied       | Future implementation must add behavior/contract rows before refactors. Do not write dead-code removal tests.                              |
| `clawsweeper`                 | applied       | Cache-first related-issue discovery found no new fixed/improved claim to add.                                                              |

## Issue Accounting

No issue claims change in this pass.

Broad GitHub issue rediscovery was not run. Cached ledgers were read first:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/gitcrawl-live-open-ledger.md`

ClawSweeper result:

| Surface                                         | Cached issue rows                                                        | Decision                                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Selector substrate and React subscriptions      | `#5131`, `#3656`, `#4141`, `#4210`, `#3430`, `#2051`, `#4483`            | Preserve existing `Improves`, `Related`, and `Not claimed` statuses. No new `Fixes`.                                                          |
| Root runtime / composition / selection pressure | `#5398`, `#5433`, Android/IME/focus rows in `gitcrawl-v2-sync-ledger.md` | Keep exact closure device/browser-proof gated. Root split is architecture hygiene unless it proves a repro.                                   |
| Huge-doc performance                            | `#5992`, `#5945`, `#4056`, `#790`, `#4202`, `#2733`, `#2669`             | Preserve existing conservative statuses. Fresh default-`auto` compare strengthens architecture confidence but does not create new issue text. |
| Accessibility/native behavior                   | `#2572` and policy rows                                                  | Keep as release guards; no performance win bypasses them.                                                                                     |

No changes were needed in `issue-coverage-matrix.md`,
`fork-issue-dossier.md`, `gitcrawl-v2-sync-ledger.md`, or
`pr-description.md`.

## Pass Schedule

| Pass                                 | Status   | Owner                             | Done when                                                               |
| ------------------------------------ | -------- | --------------------------------- | ----------------------------------------------------------------------- |
| Current-state read and initial score | complete | slate-ralplan                     | Live source, docs, research, and focused verification recorded.         |
| Related issue discovery              | complete | slate-ralplan + clawsweeper rules | Cached ledgers classify related issue rows without new claims.          |
| Selector substrate pressure pass     | complete | slate-ralplan                     | External-store versus custom selector decision brief is written.        |
| Root runtime split pressure pass     | complete | slate-ralplan                     | Split boundaries and proof rows are named without implementation churn. |
| Huge-doc final perf pass             | complete | slate-ralplan                     | Direct narrowed legacy comparison is rerun and recorded.                |
| Final score                          | complete | slate-ralplan                     | Score is at least `0.92`; implementation remains future `ralph` work.   |

## Future Ralph Execution Queue

Run with `ralph` if the user wants execution.

1. Selector substrate proof spike.
2. Root runtime split with contract-first tests.
3. Huge-document direct comparison regression guard sync if implementation
   changes selector/runtime behavior.
4. PR reference and issue-ledger sync only if public claims change.

## Current Handoff

The plan is `done` as a review/planning gate. The current answer is:

> Best core architecture: yes. Cleanest final implementation: not yet. The next
> execution work is selector substrate proof, root runtime ownership cleanup,
> and regression-guarded huge-doc verification.

## Ralph Execution Ledger

### 2026-05-11: selector substrate proof started

- Trigger: user requested `ralph full`.
- Current owner: `.tmp/slate-v2/packages/slate-react/src/hooks`.
- Scope: prove or replace `useGenericSelector` as the substrate for
  `useEditorSelector` and `useDecorationSelector`.
- Known starting point: `useGenericSelector` uses a reducer-based force-render
  path; projection, annotation, and widget stores already use
  `useSyncExternalStore`.
- First gates:
  - `bun test:vitest test/provider-hooks-contract.test.tsx`
  - `bun --filter slate-react typecheck`
  - `bun run bench:react:rerender-breadth:local`
- Issue/reference status: no public claim change yet; no ClawSweeper rerun
  needed until behavior or issue claims change.

### 2026-05-11: Ralph execution closed

- Selector substrate result:
  `.tmp/slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx` now
  uses `useSyncExternalStore` as the subscription primitive instead of
  `useReducer` force-rendering.
- Selector contracts:
  `.tmp/slate-v2/packages/slate-react/test/surface-contract.tsx` now pins the
  external-store substrate; provider/decorator contracts stayed green.
- Root runtime result:
  `.tmp/slate-v2/packages/slate-react/src/editable/runtime-root-selection-import.ts`
  owns selectionchange handler, scheduler, and import-controller construction.
- Root runtime contract:
  `.tmp/slate-v2/packages/slate-react/test/kernel-authority-audit-contract.ts`
  now pins selection import ownership to the root selection import module.
- Reference/issue sync: no change needed. The slice changed internal runtime
  ownership and selector substrate only; public API and issue claims did not
  change.
- Verification:
  - `bun run lint:fix`: pass; formatted three files.
  - `bun --filter slate-react typecheck`: pass after lint.
  - `bun test:vitest test/provider-hooks-contract.test.tsx test/surface-contract.test.tsx test/projections-and-selection-contract.test.tsx test/kernel-authority-audit-contract.test.ts test/rendering-strategy-and-scroll.test.tsx`: pass, 5 files / 91 tests.
  - `bun run bench:react:rerender-breadth:local`: pass; broad/sibling/ancestor
    render counts remain zero in the measured rows.
  - `REACT_HUGE_COMPARE_SKIP_BUILD=1 REACT_HUGE_COMPARE_DISPOSE_DELAY_MS=0 REACT_HUGE_COMPARE_SURFACES=v2DefaultRenderAuto,v2DomPresent,v2VirtualizedExperimental REACT_HUGE_COMPARE_BLOCKS=5000 REACT_HUGE_COMPARE_ITERATIONS=5 REACT_HUGE_COMPARE_TYPE_OPS=10 bun run bench:react:huge-document:legacy-compare:local`:
    pass. `v2DefaultRenderAuto` beat legacy chunking-on on every recorded mean:
    ready `22.82ms` vs `332.03ms`, select all `0.31ms` vs `0.98ms`, start type
    `11.64ms` vs `51.02ms`, middle type `10.88ms` vs `56.47ms`, middle select
    then type `45.61ms` vs `48.6ms`, promote then type `33.18ms` vs `54.5ms`,
    full replace `5.35ms` vs `117.34ms`, fragment insert `6.52ms` vs
    `115.96ms`.
