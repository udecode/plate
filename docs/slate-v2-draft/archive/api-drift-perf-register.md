---
date: 2026-04-10
topic: slate-v2-api-drift-perf-register
---

# Slate v2 API Drift Perf Register

> Archive only. Diagnostic perf-planning reference. The live perf/blocker read
> is owned by [../perf-gate-package.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/perf-gate-package.md)
> and [../replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md).

## Purpose

Single maintainer-facing register for the kept API drift classes that deserve
performance measurement.

Use this to decide:

- which kept API drifts already have real numbers
- which ones are only mapped indirectly through broader blocker lanes
- which ones still need first-class benchmark commands before optimization work

This file is not a wishlist.
If a class has no benchmark lane yet, say that plainly.

## Rules

1. Benchmark drift classes, not random file churn.
2. A red diagnostic lane does not become blocker truth until it maps into a
   user-facing lane.
3. Do not optimize a kept API drift until the cause split is explicit:
   - init vs live
   - wrapper vs core
   - pure value transform vs editor-operation path
   - read/observe vs write/mutate
4. Reuse existing root commands when they exist.
5. If a drift class only has package-local perf files, that still counts as
   real evidence, but it should be promoted to a stable root command if it is
   going to drive roadmap sequencing.

## Current Register

| Drift id | Kept public surface | Existing commands | Current artifact / source | Mapped blocker lane | Current read | Status | Next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `normalization-control` | `Editor.normalize`, `Editor.normalizeNode`, `Editor.shouldNormalize`, `Editor.withoutNormalizing` | `pnpm bench:normalization:local`; `pnpm bench:normalization:compare:local`; `pnpm bench:replacement:richtext:normalization:local` | `tmp/slate-normalization-benchmark.json`; `tmp/slate-normalization-compare-benchmark.json`; `tmp/slate-replacement-richtext-normalization-benchmark.json`; [normalization-reference.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/normalization-reference.md) | richtext diagnostic mapping only so far | fresh compare lane improved dramatically: explicit adjacent-text `3.08ms` vs `13.26ms` legacy (`-10.18ms`), explicit inline flatten `10.36ms` vs `301.49ms` (`-291.13ms`), insert-text read-after-each still slower at `78.01ms` vs `4.65ms` (`+73.36ms`). Local current-only lane now reads explicit adjacent-text `3.27ms`, explicit inline flatten `12.45ms`, observed insert-text read-after-each `2.07ms`. Richtext mapping still says default `25.75ms`, minimal `19.35ms`, default + normalize-root-scan `28.47ms` (`+2.72ms`), minimal + normalize-root-scan `32.22ms` (`+12.87ms` vs minimal). | `measured-diagnostic` | Keep the contract closed. The explicit normalization cliff is largely gone. The remaining normalization question is the read-after-write observation path, not the explicit canonicalization rules themselves. |
| `replacement-react-runtime` | `withReact`, `Editable`, `EditableBlocks`, `useSlateSelector`, `useElement`, `useSelected`, mounted runtime helpers | `pnpm bench:replacement:placeholder:local`; `pnpm bench:replacement:huge-document:local`; `pnpm bench:replacement:richtext:local`; `pnpm bench:replacement:richtext:dissection:local`; `pnpm bench:replacement:markdown:local`; `pnpm bench:replacement:void:local`; `pnpm bench:replacement:table:local` | [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md); `tmp/slate-replacement-richtext-dissection-benchmark.json` | direct blocker package for `Target A` / `Target B` | fresh blocker-facing reruns are green enough with one mixed huge-document sub-metric: placeholder rerun `3.51ms` vs `9.31ms` legacy (`-5.80ms`); richtext after the kept leaf-path fix `22.09ms` vs `23.01ms` (`-0.92ms`); huge-document ready `-179.82ms`, type `+4.73ms`, select-all `-74.16ms`, paste `-60.46ms`; markdown `-1.26ms`; table `-4.87ms`; editable-void `+0.05ms`. Richtext dissection after the fix says default `25.93ms`; no toolbar subscribe `20.81ms`; no toolbar subscribe + no mark renderers `19.44ms`; add no event handlers `17.32ms`. | `measured-green-enough` | Keep the richtext mark-path fix and stop treating broad runtime surgery as the default next move. Remaining user-facing work is band-tightening and deciding whether huge-document typing deserves its own follow-up lane. |
| `extension-wrapper-surface` | current wrapper composition and behavior interception surface proven through `withLinks`, `withMentions`, app-owned normalization seams | `pnpm bench:replacement:richtext:wrappers:local`; `pnpm bench:replacement:richtext:normalization:local` | `tmp/slate-replacement-richtext-wrapper-benchmark.json`; `tmp/slate-replacement-richtext-normalization-benchmark.json`; [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md) | richtext is the live blocker candidate; markdown/table/void are supporting lanes | passive wrapper tax is modest on the shared richtext shell: default `28.83ms`; `withLinks` `20.28ms`; `withMentions` `28.41ms`; `withLinks + withMentions` `33.42ms` (`+4.59ms`). `withForcedLayout` is not a fair passive-wrapper lane because it rewrites blockquote behavior through normalization. | `measured-diagnostic` | Treat passive wrapper install tax as secondary. If wrapper work stays in scope, measure active feature behavior separately instead of blaming the blocker on wrapper presence alone. |
| `batch-transform-surface` | `GeneralTransforms.applyBatch`, `Editor.withBatch`, `Editor.withoutNormalizing`, structural transform families under the kept batch contract | no live root command promoted; current evidence is doc-only compare context | [slate-batch-engine.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/slate-batch-engine.md) | none directly; diagnostic until tied to a user-facing lane | the compare-only record says `applyBatch(...)` and manual `withBatch(...)` stayed in the same performance class on exact-path and mixed structural lanes, but there is no current promoted runner in the live tree and it should not compete for roadmap priority by default | `deferred-compare-only` | Leave this out of the live fix queue unless a blocker lane forces it. If that happens, rebuild a current runner on purpose instead of pretending the legacy black-box lane is a first-class v2 program artifact. |
| `query-ref-observation-surface` | `Editor.nodes`, `Editor.positions`, `Editor.pathRef`, `Editor.rangeRef`, `Editor.rangeRefs`, tracked-ref inspection surface | `pnpm bench:drift:query-ref:local` | `tmp/slate-query-ref-observation-benchmark.json`; ref proof owners in [true-slate-rc-proof-ledger.md](/Users/zbeyens/git/plate-2/docs/slate-v2/true-slate-rc-proof-ledger.md) | none yet | current local numbers on the shared write shell: write-only `36.49ms`; `nodes` read-after-write `43.08ms` (`+6.59ms`); `positions` `35.21ms` (`-1.28ms`); `pathRef` rebasing `33.48ms` (`-3.01ms`); `rangeRef` rebasing `48.00ms` (`+11.51ms`); `rangeRefs` inspection `42.79ms` (`+6.30ms`). | `measured-diagnostic` | `rangeRef` rebasing is the only obvious red read/write seam here. Do not widen into generic query panic; map range-ref pressure upward first if it is going to compete for fix priority. |
| `node-transform-wrapper-surface` | `NodeTransforms.insertFragment`, `insertNodes`, `moveNodes`, `setNodes`, `splitNodes`, `mergeNodes`, `wrapNodes`, `unwrapNodes`, `unsetNodes` | `pnpm bench:drift:node-transforms:local` | `tmp/slate-node-transform-benchmark.json`; [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md) | huge-document type/paste/select-all, table edit, markdown shortcut, editable-void insert | current local numbers on the shared transform shell are cheap: `insertFragment` `4.39ms`; `insertFragment + snapshot read` `3.82ms`; `setNodes` `3.05ms`; `setNodes + nodes read` `2.98ms`. No red cost signal yet. | `measured-diagnostic` | Keep this class out of the main fix queue for now. It is measured, cheap, and not the current blocker story. |

## Current Priority Order

### 1. `replacement-react-runtime` + `extension-wrapper-surface`

Treat these as the next joint dissection target, not as separate random wars.

Why:

- the only live blocker is still mainstream richtext
- that lane is where mounted public runtime drift and wrapper drift actually
  collide

Immediate ask:

- add a richtext dissection bench that holds the scenario constant and toggles:
  - bare runtime shell
  - representative wrappers
  - normalization-heavy behavior

### 2. `normalization-control`

Why second now:

- explicit normalization cost dropped hard
- the remaining red normalization seam is the read-after-write observation path
- the contract still should not widen casually

Immediate ask:

- only map the remaining observation cost upward if a real user-facing lane
  proves it matters

### 3. `batch-transform-surface`

Why third:

- it already has real perf evidence
- it is a kept public API drift
- but its evidence should stay compare-only unless a blocker lane forces it
- `slate-batch-engine` is a legacy black box, not a target architecture for v2

Immediate ask:

- benchmark against it when useful
- never treat it as a design import candidate by itself

### 4. `query-ref-observation-surface` and `node-transform-wrapper-surface`

Why later:

- both are plausible
- neither has a good isolated compare lane yet
- both are easy to blame lazily without real numbers

## What Not To Do

- do not benchmark every kept symbol one by one
- do not widen into non-API cleanup because a diff looks ugly
- do not reopen broad normalization contract work from diagnostic numbers alone
- do not let package-local perf folklore outrank blocker-facing replacement
  lanes without an explicit mapping
- do not pull `slate-batch-engine` into v2 just because it benchmarks well on a
  narrow lane

## Next Concrete Execution Slice

If work continues immediately, the next honest slice is:

1. add a richtext API-drift dissection lane
2. keep the runtime shell fixed
3. toggle representative wrapper classes and normalization-heavy behavior
4. record whether the failing `+9.41ms` blocker is mostly:
   - mounted runtime infra
   - wrapper composition
   - normalization/control
   - or a mixed seam

That result should choose the first optimization target.
Anything before that is mostly architecture fan fiction.
