---
date: 2026-04-01
topic: slate-v2-issue-intelligence-master-plan
---

# Slate v2 Issue Intelligence Master Plan

## Goal

Read every open Slate issue into a structured research ledger, cluster the real pain patterns, score them, and turn that into a package-by-package v2 architecture plan.

This is explicitly a multi-pass program. The whole point is to avoid a lazy one-shot synthesis where the loudest issues or our favorite ideas dominate the result.

The output must also be valuable for future maintainer triage:

- deciding whether an issue is valid
- deciding whether an issue is stale, duplicate, or invalid
- deciding what kind of maintainer reply would be useful
- deciding whether an issue belongs in the v2 roadmap at all

The output must also be directly useful for later TDD:

- writing the first red test without reopening the issue thread
- identifying the public seam the behavior should be tested through
- capturing the minimal repro shape in behavior terms instead of implementation-detail sludge

The output must also be directly useful for later benchmark work:

- identifying which performance issues deserve a reproducible benchmark lane
- capturing the minimal workload shape without rereading the issue thread
- separating benchmark candidates from ordinary correctness tests

## Decision

Do not start by designing Slate v2 from taste.

Do not start by reading issue comments at random.

Do not start by clustering from labels alone.

Start with a frozen snapshot of every open issue, classify them under a strict rubric, then derive architecture requirements from the ranked clusters.

## North Star

The output is not:

- a generic issue summary
- a vibe-based list of “what users want”
- a random brainstorm about editors

The output is:

- a complete open-issue ledger
- a scored issue-theme map
- a package impact matrix
- a v2 requirements document grounded in actual pain
- a roadmap for `slate-v2`, `slate-react-v2`, and supporting packages

## Scope

Primary source:

- every open GitHub issue in `ianstormtaylor/slate`

Secondary source, only after the open-issue pass is done:

- high-signal recently closed issues for recurrence
- existing local Slate v2 thinking in [engine.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/engine.md)
- local learned patterns in `.claude/docs/solutions/`

Out of scope for the first pass:

- feature popularity voting
- implementation
- migration strategy details

## Anti-Lazy Rules

These are mandatory.

1. No architecture recommendation before 100% of open issues are triaged into the ledger.
2. No issue is allowed to remain “skimmed only”. Every open issue gets a ledger row.
3. Every issue gets a primary cluster. No floating “misc” pile until the end.
4. “Unknown” is allowed for root cause. Bullshit certainty is not.
5. Comments are read only for:
   - no exceptions in the full program
   - every open issue must have its full current thread read before it is marked fully triaged
   - pilot batches may stop after a bounded issue count, but not after reading body-only partial rows
6. Closed issues do not create themes by themselves. They only strengthen recurrence for open themes.
7. We rank by weighted architectural relevance, not raw count.
8. We separate facts, inference, and recommendation in every deliverable.

## Artifacts

Create and maintain these in order:

1. `.claude/docs/slate-issues/open-issues-ledger.md`
2. `.claude/docs/slate-issues/open-issues-dossiers.md`
3. `.claude/docs/slate-issues/test-candidate-map.md`
4. `.claude/docs/slate-issues/benchmark-candidate-map.md`
5. `.claude/docs/slate-issues/issue-clusters.md`
6. `.claude/docs/slate-issues/package-impact-matrix.md`
7. `.claude/docs/slate-issues/requirements-from-issues.md`
8. `.claude/docs/slate-issues/roadmap-from-issues.md`

This file is the control plan for the whole program.

## Live Triage Status

The research corpus is still the frozen `2026-04-02` `682`-issue snapshot.

Post-snapshot maintainer triage update:

- Dylan executed Batch A from [triage-close-queue.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-issues/triage-close-queue.md)
- Batch A queue size: `54`
- Batch A issues still open: `0`
- live repo open-issue count after Batch A: `628`

That means the analysis docs should keep their `682`-issue corpus numbers, but Batch A should no longer be described as pending work.

## Pilot Calibration

The first 3-issue pilot exposed a few things worth locking in before the full pass:

- maintainer-authored architecture issues are real tracker input and need to fit the same ledger, not get waved away as “not user pain”
- comment threads are not optional if the output is supposed to help future maintainer triage; `#6022` became materially more precise only after reading the added repro wrapper and apply logs
- the ledger needs a stricter enum for reply posture instead of mushy prose
- the ledger will eventually need a `known-duplicate-target` field, not just a duplicate-risk score

### Pilot Schema Change Log

#### After batch 1

Changed:

- `reply usefulness` becomes `reply posture`
- added `known duplicate target`
- compact TDD metadata is expected in the ledger, with detailed test shape in the test-candidate map

Why:

- freeform reply prose will rot at scale
- duplicate risk without a concrete target is too vague for maintainer triage
- TDD extraction should be visible in triage, not hidden in a separate later artifact

Backfill:

- backfill batch 1 immediately before processing batch 2

#### After batch 2

No new schema change yet, but one real pressure point showed up:

- an issue can be invalid for the current Slate contract and still be a valuable v2 capability target

Open question for later batches:

- whether `TDD readiness` alone is enough
- or whether we need a second field that distinguishes:
  - current-contract test candidate
  - v2-target test candidate

#### After batch 3

No schema change yet, but two more pressure points are real now:

- performance issues fit the same research program, but they want benchmark extraction more than red-test extraction
- some issues stay open even after the thread effectively resolves them, so validity plus maintainer action must keep carrying that signal unless this pattern becomes common enough to deserve a dedicated field

#### After batch 4

Changed:

- add linked artifact tracking to the issue schema

Why:

- linked PRs, commits, and related issues often carry the best technical context
- they can contain fix attempts, maintainer reasoning, or duplicate consolidation that should not be rediscovered later

Backfill:

- backfill obvious linked artifacts lazily as batches are revisited or when they materially affect triage

#### After batch 5

Changed:

- add benchmark extraction to the implementation layer for performance issues

Why:

- performance issues were being forced into a TDD-only shape that did not fit the actual work
- benchmark-ready workload capture is a real deliverable, not an awkward footnote

Backfill:

- backfill obvious current performance issues immediately

#### After batch 6

No schema change yet.

What got validated:

- benchmark extraction deserves its own artifact and works cleanly in practice
- current fields are already enough to separate:
  - Slate-owned input/runtime issues
  - browser-owned input issues
  - consumer-side resolved support threads
  - v2-interesting layout requests that are weak current tickets

Open pressure for later:

- linked-artifact backfill will matter more as older issues start linking to more failed PRs and related threads

#### After batch 7

No schema change yet.

What got validated:

- the dossier format still holds at 50+ issues if the per-issue writeups stay sharp instead of bloated
- the issue set now clearly separates into:
  - real Slate runtime bugs
  - browser-owned input bugs
  - consumer-side resolved support threads
  - example/plugin ergonomics requests
  - repo/tooling maintenance noise
- benchmark extraction did not need expansion for this batch, which is useful negative signal

Open pressure for later:

- if collaboration issues keep showing up, the ledger may need a slightly richer field for remote-op model assumptions versus local runtime assumptions
- if more ecosystem/support threads appear, we may want a stricter enum that separates `invalid`, `stale`, and `out-of-scope` more cleanly

#### After batch 8

No schema change yet.

What got validated:

- the format still holds at 75+ issues without collapsing into unreadable sludge
- there is now a very clear separation between:
  - real runtime adapter pressure
  - official-example bugs
  - mobile/input-method failures
  - support threads caused by consumer misuse
  - repo-only maintenance/security noise
- React/runtime pressure is recurring in a meaningful way, but still mostly as transaction, identity, selection, and subscription-model pain rather than “make the core React-shaped”
- benchmark extraction still does not need expansion; this batch was mostly correctness and adapter semantics

Open pressure for later:

- package impact may eventually want a stricter distinction between `site/examples`, `docs-only`, and real package runtime ownership

#### After batch 9

No schema change yet.

What got validated:

- the format still holds at `100+` issues without collapsing into nonsense
- there is now a very clear split between:
  - current Slate runtime bugs
  - browser/input-method contract failures
  - docs/example/support noise
  - ecosystem adapter demand
  - old repo/tooling debris
- React/runtime pressure keeps showing up, but mostly as identity, focus, selection, and event-contract pain rather than “make the core React-shaped”
- benchmark extraction still did not need expansion, which is exactly the kind of restraint we want

Open pressure for later:

- dossier and test-map range splitting is now done; keep the ledger monolithic unless grep quality actually degrades
- if more adapter/framework requests pile up, we may want a stricter distinction between `ecosystem demand`, `out-of-scope`, and `v2-interesting but not core-owned`


#### After batch 10

No schema change yet.

What got validated:

- older open issues add real signal in three areas: TypeScript API design, collaboration/history semantics, and `slate-react` rerender pressure
- mobile/input issues stay one of the strongest clusters even this far down the queue, which means they are not just recent churn
- stale process and support noise also grows with age, so reply posture keeps mattering as much as architecture classification

Open pressure for later:

- if more old browser-owned issues look resolved in-thread, we may eventually want a dedicated `resolved-in-thread` field instead of overloading `stale-candidate`
- the typing/API cluster is now big enough that it may deserve its own first-pass scoring lens instead of living under generic API ergonomics


#### After batch 11

No schema change yet.

What got validated:

- the mobile/input cluster is not a recent anomaly; it stays strong all the way through much older issues
- the React/runtime pressure is also persistent, especially around selection subscriptions, hidden/show lifecycles, autofocus, and external rerenders
- the typing/API cluster is now undeniably real: operation guards, hook return types, `createEditor`, `PropsMerge`, `useSlate`, and controlled-value ergonomics keep surfacing in different forms
- older issues add a lot more stale docs/support/process noise, which justifies keeping maintainer action and reply posture as first-class fields

Open pressure for later:

- the typing/API cluster likely deserves a dedicated first-pass score instead of living under generic API ergonomics
- if more old issues resolve in-thread or upstream, we may want a `resolved-in-thread` field instead of continuing to overload `stale-candidate`

#### After batch 13

No schema change yet.

What got validated:

- legacy issues still reinforce the same mobile/IME/input-method pressure instead of fading into noise
- shadow DOM, nested editor, DOM ownership, and click-hit-testing bugs stay real this far down the queue
- plugin seam pressure also stays real: `insertText` suppression, `beforeInsertText`, `scrollSelectionIntoView`, and Android `readOnly` lifecycle bugs all point at weak runtime boundaries
- old issues add even more example/docs/support sludge, which keeps justifying the maintainer-triage fields instead of a pure architecture-only ledger

Open pressure for later:

- the package impact matrix is even more justified now, because the same pain keeps spanning `slate`, `slate-react`, and `slate-dom`
- if the next batches keep surfacing DOM-boundary bugs, we may want a stricter split between browser-owned behavior, adapter-owned behavior, and core-owned behavior


#### After batches 14 and 15

No schema change yet.

What got validated:

- runtime-boundary pain keeps dominating older issues too: focus after insert, inline-void cursor traps, selections crossing editor ownership lines, and nested editor seams all keep resurfacing
- mobile and IME debt stays real in older issues too, including Android backspace, browser-specific composition, Windows emoji insertion, and Safari dead-key behavior
- docs, examples, and typing debt also keep compounding, which means that cluster is not just recent churn and should not be mistaken for rejection of the core model
- linked PRs and related issues keep adding useful context in older threads, so artifact tracking is carrying its weight

Open pressure for later:

- the package impact matrix is even more justified now, because these issues keep cutting across `slate`, `slate-react`, `slate-dom`, examples, and docs
- if the next batches look similar, it may be worth codifying a cleaner split between `core bug`, `runtime adapter bug`, `example/docs debt`, and `ecosystem/support noise`

#### After first cluster pass

No schema change yet.

What got validated:

- the first `201` issues are enough to produce a stable macro-theme map instead of just per-issue notes
- the dominant signal is runtime-boundary pain, not rejection of the Slate data model:
  - selection/focus/DOM bridge
  - mobile/IME/input semantics
  - `slate-react` runtime identity and subscription behavior
- docs/support/repo noise is large enough that it would absolutely distort roadmap work without the maintainer-triage fields
- performance issues are low-count but still high-leverage, which means scoring cannot follow raw issue volume alone

Open pressure for later:

- the next artifact should be package impact, not more freeform clustering
- theme counts are useful, but package ownership and v2 requirement extraction are what will actually constrain architecture decisions

#### After package impact matrix

No schema change yet.

What got clarified:

- `slate-react-v2` and `slate-dom-v2` should carry most runtime-boundary work by default
- `slate-v2` still owns the highest-leverage architectural work, but mostly as engine semantics: transactions, operations, normalization, identity, and history-friendly commit boundaries
- low direct `slate-dom` issue counts are misleading because many DOM and selection bugs were correctly triaged as `cross-package`
- docs/examples/support noise needs an explicit non-v2 lane or it will keep contaminating package-level roadmap calls

Open pressure for later:

- the requirements doc should now be written package-first, not theme-first
- if later batches keep reinforcing the same split, the roadmap should explicitly separate:
  - `slate-v2` engine work
  - `slate-react-v2` runtime work
  - `slate-dom-v2` bridge work
  - docs/examples debt

#### After requirements extraction

No schema change yet.

What got locked in:

- the corpus supports a very specific v2 shape:
  - data-model-first
  - op-first externally
  - transaction-first internally
  - React-optimized runtime
- the requirements are now package-first instead of theme-first, which is the right shape for actual roadmap decisions
- docs/examples/support noise is explicitly separated from v2 architecture requirements, which should stop it from poisoning later prioritization

Open pressure for later:

- the roadmap doc should sequence work by dependency order, not by rhetorical importance
- the first roadmap cut should decide what has to exist in `slate-v2` before `slate-react-v2` can become real instead of listing all packages symmetrically

#### After full open-issue coverage

No schema change yet.

What got locked in:

- the open-issue pass is complete against the `2026-04-02` snapshot:
  - GitHub open issues: `682`
  - ledger rows: `682`
  - dossier sections: `682`
  - test-map sections: `682`
- post-snapshot triage moved the live repo state:
  - Batch A executed cleanly
  - Batch A issues still open: `0`
  - live GitHub open issues after Batch A: `628`
- the caching model held up:
  - one canonical ledger
  - range-split dossiers
  - range-split test map
  - one benchmark map
- reading the oldest still-open issues did not flip the architecture story; it strengthened it

What got clarified:

- runtime-boundary pain is ancient, not recent churn
- mobile/IME debt is chronic, not browser-week noise
- docs/example/support sludge is big enough to poison any roadmap that does not explicitly de-weight it

Open pressure for later:

- no more reading pressure for the open set
- only revisit individual issues if:
  - GitHub state changes
  - linked artifacts matter
  - a top-ranked cluster needs deeper recurrence work from recently closed issues

#### After full-corpus rescore

No schema change yet.

What got locked in:

- the `682`-issue rescore did not change the center of gravity
- top weighted themes are now explicit:
  - `Mobile, IME, And Input Semantics`: `21.37`
  - `Performance And Scalability`: `19.58`
  - `React Runtime, Identity, And Subscription Model`: `17.41`
  - `Selection, Focus, And DOM Bridge`: `17.04`
- raw count and priority score diverge in useful ways, especially for performance

What got clarified:

- the corpus still does not justify replacing Slate’s JSON model
- the corpus absolutely does justify replacing Slate’s execution and runtime model
- performance must stay benchmark-scored, not popularity-scored

#### After full-corpus package impact refresh

No schema change yet.

What got locked in:

- package ownership is now grounded in the full corpus:
  - runtime-boundary ownership: `407`
  - core-engine ownership: `113`
  - maintainer-noise: `162`
- direct package pressure is now clear:
  - `cross-package`: `267`
  - `slate-react`: `136`
  - `slate`: `100`

What got clarified:

- `slate-react-v2` and `slate-dom-v2` should carry most runtime-boundary work
- `slate-v2` owns the engine semantics that make that runtime sane
- low direct `slate-dom` counts are still misleading because the DOM bridge mostly shows up as `cross-package`

#### After full-corpus requirements refresh

No schema change yet.

What got locked in:

- the requirements doc now cites the full `682`-issue corpus instead of the old pilot pass
- the v2 shape is now strongly evidenced instead of merely plausible:
  - data-model-first
  - op-first externally
  - transaction-first internally
  - React-optimized runtime

What got clarified:

- the package-first requirement split is stable
- the non-goals are now clearer too, especially:
  - no React-shaped core
  - no browser-quirk dumping ground in `slate-v2`
  - no docs/support noise masquerading as architecture pressure

#### After roadmap extraction

No schema change yet.

What got locked in:

- the roadmap now exists as a dependency-first build order, not a theme list
- the correct phase order is:
  1. lock contract and harnesses
  2. build `slate-v2`
  3. build `slate-dom-v2`
  4. build `slate-react-v2`
  5. add history and clipboard boundaries
  6. kill the chronic runtime clusters
  7. benchmark hardening
  8. docs/examples/migration surfaces

What got clarified:

- starting with `slate-react-v2` would just recreate cleanup-crew architecture
- starting with docs/examples or migration would be theater
- the smallest serious proof cut is:
  - `slate-v2` transaction core
  - `slate-dom-v2` selection bridge foundation
  - `slate-react-v2` snapshot subscriptions
  - one IME lane
  - one selection lane
  - one rerender-breadth lane

#### After core foundation spec

No schema change yet.

What got locked in:

- the first concrete implementation-spec artifact now exists:
  - [core-foundation-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/core-foundation-spec.md)
- Phase 0 and Phase 1 are now expressed as:
  - package shape
  - core primitives
  - invariants
  - first red-test lanes
  - first benchmark lanes
  - explicit deferrals

What got clarified:

- `slate-v2` should start alone as a prototype package
- `slate-dom-v2` and `slate-react-v2` should not be scaffolded yet
- the first serious implementation cut is now precise enough to start work without reopening the full issue corpus

## Format Evolution Rule

Do not let the first schema become a prison.

The point of the pilot and early batches is to improve the research format while the pain is still visible. If the ledger, dossier, cluster file, or package matrix format turns out to be too weak, too vague, or too annoying to use, change it.

### Hard Rules

1. Optimize for the best final research artifact, not loyalty to the first draft.
2. Evolve the format only at clear batch boundaries, not randomly in the middle of reviewing one issue.
3. When the format changes, update this plan with:
   - what changed
   - why it changed
   - whether prior rows must be backfilled immediately or can be backfilled in the next cleanup pass
4. If a new field materially improves triage quality, add it even if it creates backfill work.
5. If a field is producing mush instead of signal, tighten it or delete it.
6. Never keep a bad schema just to avoid rework. That is fake efficiency.

### Allowed Mid-Run Improvements

- tighten freeform fields into enums
- split one artifact into two if scale demands it
- add evidence fields when ambiguity stays too high
- add duplicate-target tracking when duplicate risk is too fuzzy
- refine package-impact ownership when cross-package classification is too blunt
- promote useful dossier sections into first-class ledger columns
- add or tighten test-extraction fields when a dossier is not sufficient to write the red test later
- add or tighten benchmark-extraction fields when a performance issue needs a workload lane instead of a behavior test

### Guardrail Against Chaos

Format evolution is allowed. Silent drift is not.

Every schema change must be written down here before the run continues at scale.

## Execution Model

The research owner is the main thread.

Do not delegate final synthesis, cluster naming, score weighting, or v2 architecture recommendations. Those are the highest-context decisions and should not be split across weaker or partial contexts.

Subagents are allowed only for bounded extraction work:

- issue inventory
- first-pass ledger triage
- recurrence lookups
- repo package-boundary grounding

Subagents are not allowed for:

- final taxonomy decisions
- cluster merges and splits
- score normalization
- package ownership decisions
- roadmap recommendations

### Subagent Rules

1. Prefer the main thread by default.
2. Only use subagents when the work is embarrassingly parallel and structurally bounded.
3. If there is any risk of weaker-model drift, do not delegate.
4. If there is any risk of context fragmentation, do not delegate.
5. If subagents are used, they must write structured outputs only:
   - inventory rows
   - triage rows
   - factual repo notes
6. Every delegated output must be merged into the canonical artifacts before the next pass starts.
7. No subagent is allowed to invent new rubric fields, rename clusters, or score priorities.

### Model Parity Rule

If subagents are used, they must run on the same frontier-capable model tier as the main thread, not on a cheaper weaker fallback.

If that is not available, stay single-threaded.

This research is exactly the kind of work where a weaker model quietly produces fake certainty and poisons the later synthesis.

### Context-Safety Rule

The canonical source of truth is always the on-disk artifact, not subagent memory.

That means:

- one canonical ledger
- one canonical cluster file
- one canonical package matrix
- one canonical requirements file

Subagents may propose rows. The main thread accepts or rewrites them.

### Recommended Delegation Shape

If delegation is used at all, keep it to this shape:

1. one subagent for issue inventory and metadata freeze
2. at most two subagents for first-pass triage, split by issue-number ranges
3. one subagent for repo/package grounding

Everything else stays in the main thread.

## Caching And Reuse

The cache is not model memory. The cache is the research artifacts.

That means we should never need to fully reread all 600+ issues for a later pass unless the tracker itself changed dramatically.

### Canonical Cache Layers

#### 1. Ledger

`open-issues-ledger.md` stores one compact canonical row per issue:

- issue number
- title
- labels
- createdAt
- updatedAt
- comment count
- linked artifacts
- rubric fields
- primary cluster
- confidence
- last reviewed at
- thread-read status

This is the navigation layer.

#### 2. Dossiers

`open-issues-dossiers.md` stores the maintainer-grade summary for each fully reviewed issue:

- one-paragraph issue summary
- one-paragraph thread summary
- linked artifacts summary
- current repro status
- workaround status
- whether the issue still looks valid
- whether it looks duplicate / invalid / stale / underspecified
- maintainer action suggestion
- possible future reply direction
- v2 relevance note
- red-test extraction note
- benchmark extraction note

This is the reusable triage layer.

#### 3. Test Candidate Map

`test-candidate-map.md` stores the implementation-facing TDD extraction for issues that are valid enough to reproduce:

- issue number
- target package
- public test seam
- minimal repro setup
- minimal UI or operation sequence
- expected failing assertion
- TDD readiness
- blocker note when not ready

This is the reusable implementation layer.

#### 4. Benchmark Candidate Map

`benchmark-candidate-map.md` stores the implementation-facing benchmark extraction for performance issues:

- issue number
- target package
- benchmark readiness
- benchmark seam
- minimal workload
- primary metric
- blocker note when not ready

This is the reusable performance-implementation layer.

#### 5. Clusters

`issue-clusters.md` stores theme-level synthesis so later passes can work from groups instead of reopening individual issues by default.

### Re-read Policy

An issue should only be reopened in a later pass if one of these is true:

- `updatedAt` changed since last review
- the issue was marked low-confidence
- the issue belongs to a top-ranked cluster under active design discussion
- the dossier says the thread was underspecified or contradictory

Otherwise, use the dossier and ledger as the source of truth.

### Why Comments Must Be Read

If the goal includes future maintainer triage, comments are not optional.

Issue bodies alone miss:

- reproduction clarifications
- maintainer rebuttals
- user-confirmed workarounds
- hidden duplicates
- “cannot reproduce anymore” signals
- whether the issue is actually a support request, docs gap, ecosystem misuse, or a real engine flaw

That means:

- body-only is enough for inventory
- body-only is not enough for final triage
- full issue threads are required before an issue is marked fully classified

## Pass Structure

### Pass 0: Frame The Research

Goal:

- lock the methodology before reading issues deeply

Tasks:

- define the issue rubric
- define the scoring model
- define cluster rules
- define package mapping rules
- define recurrence handling

Deliverable:

- this plan

Exit criteria:

- rubric is explicit enough that two passes would classify issues similarly

### Pass 1: Inventory Every Open Issue

Goal:

- freeze the full open-issue set

Tasks:

- fetch every open issue with minimal fields
- record snapshot date
- record total issue count
- assign each issue a stable row in the ledger

Fetch fields:

- number
- title
- labels
- state
- createdAt
- updatedAt
- author
- body excerpt
- comments count
- reactions

Deliverable:

- `.claude/docs/slate-issues/open-issues-ledger.md` with one row per open issue

Exit criteria:

- open issue count in GitHub equals ledger row count

### Pass 2: First-Pass Triage

Goal:

- classify every open issue under a strict rubric without prematurely designing solutions
- read the full body and full current comment thread for each issue in the active batch

Per-issue fields:

- primary subsystem
- secondary subsystem, if needed
- issue type
- user pain
- recurrence signal
- workaround quality
- v2 relevance
- scope class
- likely root-cause layer
- package impact
- confidence
- issue validity status
- duplicate risk
- known duplicate target
- linked artifacts
- maintainer action suggestion
- reply posture
- TDD readiness
- public test seam
- minimal red-test shape
- benchmark readiness
- benchmark seam

Allowed issue validity values:

- valid
- likely-valid
- unclear
- likely-invalid
- duplicate-candidate
- stale-candidate

Allowed maintainer action suggestion values:

- keep-open
- ask-for-repro
- ask-for-scope-clarification
- mark-duplicate
- close-invalid
- close-stale
- v2-roadmap
- fix-current-architecture

Allowed reply posture values:

- none
- acknowledge
- ask-clarifying-question
- request-repro
- share-status

Allowed TDD readiness values:

- ready-now
- ready-with-minor-setup
- blocked-on-repro
- not-a-test-candidate

Allowed benchmark readiness values:

- ready-now
- ready-with-minor-setup
- blocked-on-repro
- not-a-benchmark-candidate

Allowed subsystem values:

- core-model
- operations
- normalization
- selection
- history
- rendering
- dom-bridge
- react-runtime
- performance
- api-ergonomics
- typing
- plugins
- collaboration
- serialization
- mobile-ime
- docs

Allowed issue type values:

- bug
- performance
- architectural-limit
- api-gap
- dx-friction
- docs-gap
- feature-request

Allowed user pain values:

- blocker
- severe
- moderate
- minor

Allowed recurrence values:

- isolated
- recurring
- endemic
- unknown

Allowed workaround values:

- none
- poor
- acceptable
- strong

Allowed v2 relevance values:

- direct
- indirect
- none

Allowed scope class values:

- core-only
- react-only
- dom-only
- history-only
- cross-package
- ecosystem

Allowed root-cause layer values:

- mutable-engine-model
- operation-semantics
- normalization-design
- path-identity
- dom-selection-bridge
- react-subscription-model
- history-model
- api-surface
- typing-model
- unknown

Allowed package impact values:

- `slate`
- `slate-react`
- `slate-dom`
- `slate-history`
- `slate-hyperscript`
- docs-only
- cross-package

Exit criteria:

- every open issue has a full rubric row
- every issue in the active batch has a full thread-read mark
- every valid issue in the active batch has either:
  - a TDD extraction seed
  - or an explicit reason it is not yet test-ready
- every performance issue in the active batch has either:
  - a benchmark extraction seed
  - or an explicit reason it is not a benchmark candidate yet
- no architecture recommendation has been written yet

### Pass 2.5: TDD Extraction

Goal:

- make the research directly useful for red-green-refactor work later

Tasks:

- identify the public seam each valid issue should be tested through
- reduce the issue to the smallest behavior-first reproduction shape
- write the expected failing assertion in public behavior terms
- mark whether the issue is ready for a red test immediately

Rules:

- optimize for integration-style tests through public interfaces
- do not describe tests in implementation-detail terms
- do not assume a future maintainer will reread the original issue thread
- if an issue is not test-ready, say exactly what missing repro detail blocks it

Deliverable:

- `.claude/docs/slate-issues/test-candidate-map.md`

Exit criteria:

- a maintainer can pick a `ready-now` issue and start the red test without reopening GitHub

### Pass 2.6: Benchmark Extraction

Goal:

- make performance issues directly useful for later profiling and benchmark work

Tasks:

- identify the benchmark seam each performance issue should use
- reduce the issue to the smallest meaningful workload shape
- name the primary metric that should move
- mark whether the issue is benchmark-ready immediately

Rules:

- optimize for reproducible workload lanes, not hand-wavy “Slate feels slow” summaries
- separate benchmark candidates from correctness-test candidates
- do not assume a future maintainer will reread the original issue thread
- if the issue is not benchmark-ready, say exactly what workload detail is still missing

Deliverable:

- `.claude/docs/slate-issues/benchmark-candidate-map.md`

Exit criteria:

- a maintainer can pick a `ready-now` performance issue and start a benchmark lane without reopening GitHub

### Pass 3: Ambiguity And Foundation Review

Goal:

- resolve the issues where the first pass is too fuzzy to trust

Read full issue bodies/comments only for:

- low-confidence triage rows
- likely foundational constraints
- top-severity issues
- issues that appear to cross multiple clusters

This pass is no longer the first time comments are read.

It is the pass where ambiguous threads are reread carefully and dossier summaries are tightened.

Tasks:

- promote or demote confidence
- tighten root-cause classification
- add short evidence notes where needed

Exit criteria:

- no top-ranked issue remains low-confidence unless the issue itself is underspecified

### Pass 4: Cluster By Systemic Pain

Goal:

- turn issue rows into actual themes

Cluster rules:

- cluster by failing system assumption, not by label wording
- every issue gets one primary cluster
- one optional secondary cluster only if truly cross-cutting
- enhancement requests stay separate from defect clusters unless they clearly describe the same constraint

Example cluster shapes:

- transactionality and operation timing
- normalization unpredictability
- path identity and stale references
- DOM selection synchronization
- React rerender and subscription pressure
- mobile and IME input
- plugin override fragility
- serialization and direct value replacement
- history grouping and undo semantics
- large-document performance
- API discoverability and typing

Deliverable:

- `.claude/docs/slate-issues/issue-clusters.md`

Exit criteria:

- 3 to 10 clusters
- no giant junk-drawer cluster

### Pass 5: Score And Rank

Goal:

- rank themes by architectural importance, not noise

Score each cluster 1 to 5 on:

- pain
- recurrence
- architectural depth
- breadth across packages
- v2 leverage

Weighted formula:

```text
priority = (pain * recurrence) + architectural_depth + breadth + v2_leverage
```

Interpretation:

- high issue count with low architectural depth should not dominate
- smaller clusters that point at a foundational bad assumption can rank very high

Deliverable:

- ranked clusters section in `.claude/docs/slate-issues/issue-clusters.md`

Exit criteria:

- every cluster has a numeric score and written rationale

### Pass 6: Map Clusters To Packages

Goal:

- convert issue themes into a package-by-package v2 map

Packages to evaluate:

- `slate-v2`
- `slate-react-v2`
- `slate-dom-v2`
- `slate-history-v2`
- `slate-hyperscript-v2`

Per package:

- core responsibility
- issue clusters it must solve directly
- issue clusters it should not own
- must-have v2 principles
- defer-to-later items

Deliverable:

- `.claude/docs/slate-issues/package-impact-matrix.md`

Exit criteria:

- every top-ranked cluster has an owning package or explicit shared ownership

### Pass 7: Derive v2 Requirements

Goal:

- translate ranked issue clusters into architecture requirements

Requirement format:

- problem signal
- failing current assumption
- v2 requirement
- affected packages
- expected user-visible improvement
- evidence issues

Example:

- problem signal: repeated stale-path and move semantics issues
- failing assumption: path position is sufficient identity
- v2 requirement: stable node identity separate from path location

Deliverable:

- `.claude/docs/slate-issues/requirements-from-issues.md`

Exit criteria:

- top clusters are all represented by explicit requirements

### Pass 8: Build The Roadmap

Goal:

- turn requirements into a staged v2 program

Stages:

1. proof-of-concept core
2. React-first runtime proof
3. selection and DOM bridge proof
4. history model proof
5. package expansion
6. migration strategy exploration

Each stage needs:

- success criteria
- benchmark or correctness proof
- non-goals
- blockers

Deliverable:

- `.claude/docs/slate-issues/roadmap-from-issues.md`

Exit criteria:

- roadmap ties directly back to the ranked issue clusters, not just opinion

## Scoring Rubric

### Pain

1. cosmetic or narrow inconvenience
2. meaningful annoyance with workaround
3. repeated workflow damage
4. severe limitation or frequent defect
5. blocker or trust-destroying behavior

### Recurrence

1. isolated
2. occasional
3. recurring
4. very recurring
5. endemic / keeps reappearing in multiple forms

### Architectural Depth

1. leaf bug
2. local abstraction issue
3. subsystem issue
4. foundational runtime constraint
5. invalidates a core model assumption

### Breadth

1. one package, one surface
2. one package, multiple surfaces
3. two packages
4. cross-package
5. ecosystem-wide pressure

### v2 Leverage

1. barely relevant to v2
2. nice-to-have
3. moderately shaped by v2
4. strongly shaped by v2
5. should directly drive v2 architecture

#### After batches 16 and 17

No schema change yet.

What got reinforced:

- runtime-boundary pain still dominates older issues
- clipboard and copy-paste semantics pressure is stronger now because `#4716` and `#4542` are clearly architecture debates, not ordinary bugs
- controlled-vs-uncontrolled `slate-react` pressure remains one of the strongest package-level signals because of `#4612`
- docs, examples, and support noise keep showing up and still need to stay isolated from v2 architecture work
- no new benchmark-worthy cluster emerged from this tranche

#### After batches 18 and 19

No schema change yet.

What got reinforced:

- IME and mobile input debt is still everywhere, including Android headings, suggestion duplication, Japanese and Chinese composition, and AndroidEditable itself
- Shadow DOM is not a niche edge case; it keeps surfacing as a real DOM-bridge ownership problem
- framework-decoupling and data-model interoperability pressure are real, but still architecture pressure, not near-term bug work
- `slate-react` runtime ownership keeps showing up through focus transfer, render callback churn, shared object identity, and blur-selection behavior
- this tranche produced one legitimate new benchmark candidate: dynamic decorations in `#4483`

## Review Gates

Before moving from one pass to the next:

- re-read the plan
- update the ledger/cluster artifact
- log any rubric changes explicitly
- do not silently reclassify old rows without recording why

## Package-Specific Questions To Answer

### `slate-v2`

- Should the core be transaction-first?
- Should snapshots be immutable and versioned?
- Should stable node identity replace path-only identity?
- Which current operation semantics are fundamentally bad, not just slow?

### `slate-react-v2`

- Can the renderer move to selector subscriptions over immutable snapshots?
- Which open issues are really React invalidation problems disguised as Slate bugs?
- What must be synchronous versus deferred?

### `slate-dom-v2`

- Which DOM issues are bridge problems versus core engine problems?
- How should selection reconciliation work with committed snapshots?

### `slate-history-v2`

- Which undo/redo issues are symptoms of per-op mutation instead of a real history model?
- Should transactions become native history units?

### `slate-hyperscript-v2`

- Does it need real v2 redesign, or just compatibility once the core stabilizes?

## Risks

- overfitting v2 to noisy feature requests
- letting label taxonomy drive architecture
- counting duplicates as independent requirements
- reading comments too early and drowning in local detail
- deciding on package boundaries before issue clustering is stable

## Recommendation

Start with Pass 0 through Pass 2 only.

Do not try to read, cluster, score, and roadmap in one marathon. That is how the whole thing turns into “I kind of remember some issues about selection.”

The first milestone is simple:

- every open issue captured
- every open issue triaged
- no architecture conclusions yet

That is the first point where the research becomes trustworthy.

## Pilot Requirement

Do not jump straight to all 600+ issues.

First run a pilot batch of 25 to 50 open issues and use it to validate:

- the ledger schema
- the dossier format
- the triage rubric
- the maintainer-action fields
- the re-read policy

Only after that pilot should the schema be locked for the full run.

#### After batches 20 and 21

No schema change yet.

What got reinforced:

- delete and caret-positioning debt stays real across old issues, especially around empty blocks, marked leaves, and structural wraps
- composition and browser-input debt was already big and this tranche keeps confirming it with `Cmd+A`/delete, Safari autocorrect, and multibyte input cases
- `slate-react` rerender breadth is now clearly benchmark-worthy from `#4210`, with nested-block depth in `#4141` as the same family rather than a new family
- plugin-surface and hook-shape pressure keeps appearing, but mostly as v2/runtime design signal instead of must-fix current bugs
- old issues add even more example/support/process sludge, which keeps justifying the maintainer-action fields


#### After batches 22 and 23

No schema change yet.

What got validated:

- old open issues keep reinforcing the same runtime-boundary story instead of opening a totally new architecture front
- IME, placeholder, and browser-text-assistance bugs are older and deeper than the recent issue pool alone suggested
- readonly, iframe, nested-contenteditable, and static-renderer requests are real package-boundary pressure, not noise
- docs/process churn stays noisy enough that the maintainer-triage fields keep earning their keep

Open pressure for later:

- if older issues keep producing more renderer-runtime complaints like focus drift and event ownership, the package impact matrix may need a slightly stronger split between `slate-react` runtime debt and `slate-dom` bridge debt


#### After batches 24 and 25

No schema change yet.

What got validated:

- older issues add real history and collaboration pressure, not just more runtime noise
- cross-window, iframe, and portal ownership bugs were already there years ago, which strengthens the package-boundary case for `slate-react-v2` plus `slate-dom-v2`
- IME and composition gating bugs are still ancient debt, especially around empty state, composition, and keydown interaction
- older examples/docs/process threads continue to create a lot of sludge, which keeps justifying the triage fields and duplicate handling

Open pressure for later:

- if the next older tranche keeps surfacing history/collaboration edge cases, the requirements doc may need a slightly sharper distinction between local transaction semantics and remote operation semantics


#### After batches 26 and 27

No schema change yet.

What got validated:

- old issues keep reinforcing the same center of gravity: focus ownership, IME/input semantics, structural delete behavior, and history restore debt
- cross-window and iframe ownership bugs were already strong before the later issue pool, which keeps supporting the `slate-react-v2` plus `slate-dom-v2` split
- history and collaboration pressure stayed real in older issues too, especially around partial selection ops, `move_node` undo, and grouped state restore
- Android demand remains strong, but a lot of those issues are still clearly outside the supported current contract and should stay separated from present-tense bug counts
- this tranche adds one legitimate old `slate-react` perf lane from `#3656`, but it mostly reinforced already-known runtime and input clusters instead of creating a new architecture front

Open pressure for later:

- if the next older tranche keeps surfacing plugin hook confusion around paste, focus, and external stores, the requirements doc may need a slightly sharper split between public hook-surface design and renderer ownership design


#### After batches 28 and 29

No schema change yet.

What got validated:

- old issues keep reinforcing placeholder, decoration, and inline-boundary runtime debt instead of merely repeating generic selection bugs
- plugin and render-composition complaints around `renderElement`, plugin events, and editor hook surfaces are older and more principled than recent noise made them look
- Android/input debt and upstream browser event gaps were already shaping Slate in late 2019, so that pressure is foundational, not incidental
- this tranche adds one legitimate older `slate-react` perf lane from `#3430`, but most of the signal still points at runtime semantics and extension-surface pressure rather than raw throughput alone

Open pressure for later:

- if the next older tranche keeps surfacing API-surface and inline data-model tensions together, the roadmap may need a tighter split between core data-model purity and runtime escape hatches

#### After batch 30

No schema change yet.

What got validated:

- the oldest still-open issues still reinforce the same runtime and engine seams instead of opening a totally different architecture front
- zero-width sentinels, render-time mark splitting, selection normalization, operation granularity, and dirty tracking are all deep-rooted pressure, not recent fashion
- the final tranche adds clear old roadmap pressure around clipboard transfer typing, large-document rendering, and operation composition
- the artifact format held through the full corpus without needing another schema rewrite, which means the cache is good enough to reuse for later triage and TDD

Open pressure for later:

- the corpus is complete for the current snapshot, so the next step should be rescoring and roadmap extraction, not more blind reading unless the snapshot is refreshed

## After The Full-Corpus Extraction Stack

The issue-intelligence program is complete enough to hand off into real v2 planning.

Stable outputs now exist for:

- full-corpus clusters
- package ownership
- requirements
- roadmap
- core foundation spec
- cohesive program plan

That means the next lane is no longer “read more issues.”

It is:

1. use [cohesive-program-plan.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/cohesive-program-plan.md) as the connective control doc
2. treat [core-foundation-spec.md](/Users/zbeyens/git/plate-2/.claude/docs/slate-v2/core-foundation-spec.md) as the first implementation-spec artifact
3. start `packages/slate-v2` only after the Phase 0 proof gates are accepted
