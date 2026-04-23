---
date: 2026-04-10
topic: slate-v2-api-drift-perf-scoreboard
---

# Slate v2 API Drift Perf Scoreboard

> Archive only. Diagnostic perf readout. The live perf/blocker read is owned by
> [../perf-gate-package.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/perf-gate-package.md)
> and [../replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md).

## Purpose

Single scoreboard separating blocker-facing lanes from diagnostic lanes.

If a lane is not blocker-facing, it does not get to hijack roadmap priority
just because the number looks ugly.

Use with:

- [api-drift-perf-register.md](/Users/zbeyens/git/plate-2/docs/slate-v2/archive/api-drift-perf-register.md)
- [replacement-gates-scoreboard.md](/Users/zbeyens/git/plate-2/docs/slate-v2/replacement-gates-scoreboard.md)

## Blocker-Facing Lanes

| Lane | Command | Current read | Status |
| --- | --- | --- | --- |
| placeholder runtime | `pnpm bench:replacement:placeholder:local` | rerun: legacy `9.31ms`; current `3.51ms`; delta `-5.80ms` | `pass` |
| huge-document user flow | `pnpm bench:replacement:huge-document:local` | ready `-179.82ms`; type `+4.73ms`; select-all `-74.16ms`; paste `-60.46ms` vs legacy | `mixed-pass` |
| markdown shortcut | `pnpm bench:replacement:markdown:local` | legacy `7.27ms`; current `6.01ms`; delta `-1.26ms` | `pass` |
| table edit | `pnpm bench:replacement:table:local` | legacy `8.60ms`; current `3.73ms`; delta `-4.87ms` | `pass` |
| editable-void insert | `pnpm bench:replacement:void:local` | legacy `93.11ms`; current `93.16ms`; delta `+0.05ms` | `near-parity` |
| mainstream richtext blockquote toggle | `pnpm bench:replacement:richtext:local` | rerun after leaf-path fix: legacy `23.01ms`; current `22.09ms`; delta `-0.92ms` | `pass` |

## Diagnostic Lanes

| Lane | Command | Current read | Status |
| --- | --- | --- | --- |
| richtext runtime dissection | `pnpm bench:replacement:richtext:dissection:local` | rerun after leaf-path fix: default `25.93ms`; no toolbar subscribe `20.81ms`; no toolbar subscribe + no mark renderers `19.44ms`; add no event handlers `17.32ms` | `measured` |
| richtext wrapper dissection | `pnpm bench:replacement:richtext:wrappers:local` | default `28.83ms`; `withLinks` `20.28ms`; `withMentions` `28.41ms`; `withLinks + withMentions` `33.42ms` (`+4.59ms`) | `measured` |
| richtext normalization mapping | `pnpm bench:replacement:richtext:normalization:local` | default `25.75ms`; minimal `19.35ms`; default + normalize-root-scan `28.47ms` (`+2.72ms`); minimal + normalize-root-scan `32.22ms` (`+12.87ms` vs minimal) | `measured` |
| normalization compare | `pnpm bench:normalization:compare:local` | explicit adjacent-text `3.08ms` vs `13.26ms` (`-10.18ms`); explicit inline flatten `10.36ms` vs `301.49ms` (`-291.13ms`); read-after-each `78.01ms` vs `4.65ms` (`+73.36ms`) | `diagnostic-mixed` |
| query/ref observation | `pnpm bench:drift:query-ref:local` | write-only `36.49ms`; `nodes` `+6.59ms`; `positions` `-1.28ms`; `pathRef` `-3.01ms`; `rangeRef` `+11.51ms`; `rangeRefs` `+6.30ms` | `diagnostic-mixed` |
| node-transform wrappers | `pnpm bench:drift:node-transforms:local` | `insertFragment` `4.39ms`; `insertFragment + snapshot read` `3.82ms`; `setNodes` `3.05ms`; `setNodes + nodes read` `2.98ms` | `diagnostic-green` |
| batch-transform compare context | no promoted live command | compare-only legacy black-box evidence in [slate-batch-engine.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/slate-batch-engine.md) | `deferred-compare-only` |

## Cause Read

### Richtext cause read

- the kept leaf-path fix removed the live blocker
- passive wrapper install tax is still modest
- normalization/control can leak upward, but it is not the first default-shell
  bill
- after the fix, the remaining runtime cuts are smaller and split across
  toolbar observation, marks, and event plumbing instead of one dominant cliff

### Diagnostic red lanes

- normalization explicit canonicalization is no longer the cliff
- the remaining normalization question is read-after-write observation cost
- query/ref observation only shows one obvious hot seam right now:
  `rangeRef` rebasing
- node-transform wrappers are cheap on the current local shell

## Fix Ranking

1. huge-document typing only if the mixed pass remains stubborn across reruns
2. `rangeRef` rebasing only if it maps upward into a blocker-facing flow
3. normalization observation/read-after-write only if a blocker-facing lane
   proves the leak is large enough to matter
4. residual richtext runtime tightening only if the band still matters after
   current green status

## Non-Ranking

- do not reopen broad normalization contract work from the diagnostic compare
  lane alone
- do not promote `slate-batch-engine` from compare context into a v2 design lane
- do not spend time on node-transform wrapper perf before the richtext blocker
  is cleaner
