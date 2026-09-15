# Large-document rendering contract research

Status: **research complete; production design gated**. Started September 11,
closed September 12, 2026. The [Task plan](../../../plans/2026-09-11-large-documents-api-review.md)
owns the lifecycle. The [proposed contract](../../../research/decisions/large-documents-rendering-api.md)
owns the current recommendation; immutable assessment
`2026-09-12-large-documents-deep-contract` reconciles the preceding design.

The strongest cut is to remove pagination's second viewport/coordinate owner.
Keep one Editable native host and root-local coverage, let ordinary flow use its
measured block viewport, and let pagination mount content on its existing canvas.
This removes the public layout-array/offset protocol without changing the
fragment reader's coordinate system or adding a CSS state marker.

## Question and scope

What is the smallest truthful API for ordinary complete-DOM editing and explicit
large-document omission, including native input, pagination and custom content?
The earlier `virtualize` proposal is a hypothesis, not an accepted premise.

The scope includes the original eight large-document inventory groups and their
direct pagination, clipboard, lifecycle, package and teaching dependencies.
Independent Plate features, model format, core changes/history/collaboration
protocols, external editor engines and full headless pagination algorithms are
not redesign targets. No production source, manifest, registry or public docs
were edited. No publication, external message, worktree or new thread occurred.

Stop rule: stop discovery when each material decision has direct source evidence
and a falsifiable owner/proof packet, and more sources repeat known constraints.
That point is reached. The next uncertainty requires an actual target renderer;
more reference links cannot prove native DOM lifetime or hydration behavior.

## Decisive evidence

| Evidence | Result | Claim boundary |
| --- | --- | --- |
| Actual Editable full→virtual transition | New host; old host disconnected; focus lost | Compiled React/JSDOM, not trusted native IME |
| Actual grouping helper and shipped key hierarchy | Overlapping item 1 replaced for window `[0,1,2]`→`[1,2,3]` | Establishes parent-key problem; full editor composition still needs proof |
| Default/full paginated fragment hook | 60 table units → 1 with a controlled 400px viewport | Injected rectangles; the probe keeps children, while source shows the real example omits from this result |
| Mixed copy policy writer | `model` plus `exclude` includes excluded text in plain output | Actual local clipboard function; synthetic data; not fixed or an application security finding |
| Direct page-key projection | Same keys/extent at 100/1k/10k pages; repeated reads 214/2,014/20,014→2 | Counts at the supplied-page adapter only; not all layout work or a speed claim |
| Runtime build | Root has no external imports; React statically imports TanStack | Scratch output of real tsdown runtime config, no packed declarations |
| Missing-peer resolver | Root succeeds; React fails when TanStack is withheld | Explicit dependency reachability, not a clean consumer installation |
| Node SSR, 10k blocks | Full 10k strings; auto 32; virtual request staged fallback 16 | No browser, hydration or first-input latency claim |
| Proposed call-site typecheck | Raw/Plate callbacks, refs, named root and boolean paginated opt-in compile | Declaration projection only; not an exported implementation |

Five current-contract probe cases and three projection cases pass. The runtime
build captured 475 input files, the current-contract run 476; no source changed
across the recorded windows. Nine server-output cases cover 100/1,001/10,000
blocks in three current modes. The raw 100-block browser packet from the previous
phase remains source-uncertain and is not promoted.

The [reconciled owner manifest](../../../plans/artifacts/large-documents-deep/owner-manifest.json)
accounts for 126 bounded rows: 100 named declarations in the original eight
files, 11 original shared blocks and 15 newly selected shared responsibilities.
Babel re-enumeration found no missing or obsolete dedicated declarations.
Dispositions: 61 delete, 26 retain-private, 26 runtime gates, three moves to
pagination, two localizations, two public deletions with private proof ownership,
five retained authorities and one deferred optimization. These are complete
**bounded dispositions**, not 126 implementation acceptances. Unrelated nested
editing algorithms, the entire layout engine and external engines are excluded.

The adoption census has 83 paths: 41 product, 32 proof, nine current teaching and
one generated match. Counts are lexical scope checks, not public-consumer counts.
Material production families are: raw huge-document controls; raw hidden/nested
coverage; raw pagination; Plate huge-document UI; Plate details boundary; dev
performance fixtures; the raw host/runtime; pagination's owner; and the exact
Plate facades. Calls, tests and barrels do not establish independent APIs.

## Synthesis and rejected proposals

The preferred public proposal is `virtualize` on the existing Editable and
PlateContent. Pagination accepts the permission as a boolean; it does not reuse
ordinary block-count tuning for page/spread units. False/default forbids
renderer-driven omission; explicit semantic hiding remains a separate feature.

Remove automatic segments, staged visited-group state, strategy taxonomy,
threshold, layout arrays, offset hook, public mode metrics and inert find
metadata. Keep actual selection/copy/coverage jobs, but require exact mixed
clipboard semantics and committed materialization. Retained keys are not enough:
active native elements and their parents must survive scrolling and transitions.

The prior normalized fragment coordinates and new root CSS marker are rejected
because they compensate for the duplicated page transform. Empty SSR shell and
permanent error-on-unbounded-container decisions also lacked evidence. A bounded
initial window is the leading explicit-omission prototype; compare it to full
first rendering before choosing. No new public SSR/fallback/loading mode.

A dedicated virtual component/subpath is the strongest challenger to one
Editable input. It must be reconsidered if stable parentage, dependency breadth
or cold rendering cost fails. An async loader, global window store, new height
index, public virtualizer factory or passthrough backend config has no accepted
independent job. Existing E20/E23 optimization questions stay deferred.

## Research provenance and state

Six local reference repositories were searched and read in targeted slices:
CodeMirror view, the local Slate fork, Lexical, ProseMirror view, TanStack Virtual
and WPT. These are not six exhaustive editor architecture audits. Five have
working-file reads checked against their pinned commit; the sparse WPT clone's
two short tests were read from pinned Git objects. The current Plate checkout
and CSSWG draft make eight registry rows. Primary web search used CodeMirror,
TanStack and CSSWG; unrelated/social results were not used. Direct web opens
for the CodeMirror guide and TanStack page returned errors, so local source and
the available primary search content bound those claims.

The CodeMirror/ProseMirror evidence contributes native identity and service
proof requirements. Slate and Lexical keep reconciliation/paint work distinct
from omission. WPT's print reference comparison and selection crash test require
different oracle claims. CSSWG's draft is specification evidence, not current
browser compatibility proof. No third-party code or tests were copied.

- Repositories searched/read: six targeted reference repositories; no clones
  added. External issues/PRs read: zero; this run needed source and test owners.
- Ledgers: four query rows, 32 exact read rows, 12 semantic leads, 11 promoted
  plan/proof packets, one deferred optimization and eight rejected proposals.
- Historical dedupe: E19 is already implemented; E20, E21, E22 and E23 are
  existing questions, and prior endpoint-retention research is support rather
  than a new architecture. These six histories are reconciled, not re-promoted
  as fresh implementations.
- Next search shard: none. Current source and disposable probes identify the
  next executable owner. Reopen on a target failure, changed hard requirement
  or materially changed reference/source evidence.
- Needs user attention: none for this planning scope. Native device/AT/OS lanes
  remain explicit future proof needs, not an approval request.
- Workflow slowdowns: root lacked the Vitest binary; reran from its package.
  The first import regex matched string contents; replaced it with an AST static
  import walk. A temporary Node resolver mishandled builtins and import
  conditions; corrected it and retained failures. These are local probe
  mistakes, not product defects or reasons to change reusable workflows.
- Stopping checkpoints: source gaps found; current counterexamples reproduced;
  projection-only claim proved; packaging/SSR grounded; architecture gates and
  adoption recorded. Research completion does not close P0–P4 target gates.

## Promoted packets and proof owners

| Lead | Grade | Owner and next proof |
| --- | --- | --- |
| `rendering:stable-active-dom:identity` | A | Plite Plan P1; actual root/Text identity, composition and multiple-view tests |
| `pagination:one-canvas:projection` | A | Plite Plan P2 + Benchmark; direct canvas render, coordinate/hit-test and surviving-cost proof |
| `coverage:mixed-copy-policies:clipboard` | A | Best API/S2; specify policy composition, then exact text/HTML/fragment oracles |
| `rendering:first-window:hydration` | A | Benchmark P3; same-source full versus bounded initial window, hydration and first input |
| `packaging:honest-virtual-dependency:artifact` | A | Best API/P4; actual declared clean install and application bundle comparison |
| `native-coverage:service-proof:browser` | A source; C draft | Verify Plate; exact browser Find/print/native input/AT lane, with no substituted claim |

All 11 packets are listed in [promoted-ledger.tsv](promoted-ledger.tsv), with
current reproducer commands and target exit gates in the Task plan. None is a
product patch, accepted performance optimization or public feature completion.

## Evidence files

- [Native coverage and lifetime](shards/001-native-and-lifetime.md)
- [Pagination and deterministic work](shards/002-pagination-and-cost.md)
- [Package and initial render](shards/003-package-and-initial-render.md)
- [Read log](read-log.tsv), [source registry](repo-registry.tsv),
  [queries](query-ledger.tsv), [leads](lead-ledger.tsv),
  [rejections](rejected-ledger.tsv)
- [Current probes](../../../plans/artifacts/large-documents-deep/current-contract-result.json),
  [projection](../../../plans/artifacts/large-documents-deep/page-plan-result.json),
  [bundle](../../../plans/artifacts/large-documents-deep/bundle-result.json),
  [SSR](../../../plans/artifacts/large-documents-deep/ssr-result.json),
  [call-site sketch](../../../plans/artifacts/large-documents-deep/call-sites.tsx)

Changed material: this research run and its ledgers/shards, the current decision,
the existing Task plan, immutable review/index/log and local disposable artifacts.
No runtime, package manifest, public teaching, registry, generated skill or
attestation changes are part of the research result.
