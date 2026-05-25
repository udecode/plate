---
date: 2026-04-02
topic: slate-v2-roadmap-from-issues
pilot: false
pilot_scope: 682 open issues
repo: ianstormtaylor/slate
---

# Slate v2 Roadmap From Issues

## Purpose

This is the build order implied by the full `682`-issue corpus.

The `682` count is the frozen `2026-04-02` research snapshot.

Post-snapshot maintainer triage update:

- Dylan executed Batch A
- `54/54` queued issues are now closed
- live repo open-issue count is `628`

It is not “most requested features first.”

It is dependency order:

1. core execution model
2. DOM and input bridge
3. React runtime
4. history and clipboard boundaries
5. performance hardening
6. docs, examples, and migration surfaces

If the order changes, the work gets sloppier and the runtime packages keep paying for core debt.

## Inputs

- [issue-clusters.md](/Users/zbeyens/git/plate-2/docs/slate-issues/issue-clusters.md)
- [package-impact-matrix.md](/Users/zbeyens/git/plate-2/docs/slate-issues/package-impact-matrix.md)
- [requirements-from-issues.md](/Users/zbeyens/git/plate-2/docs/slate-issues/requirements-from-issues.md)
- [test-candidate-map.md](/Users/zbeyens/git/plate-2/docs/slate-issues/test-candidate-map.md)
- [benchmark-candidate-map.md](/Users/zbeyens/git/plate-2/docs/slate-issues/benchmark-candidate-map.md)
- [architecture-contract.md](/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md)

## Sequencing Rules

1. Keep the core data-model-first.
2. Keep operations first-class externally.
3. Do not start with compatibility shims.
4. Do not start with docs or migration theater.
5. Do not start with browser-specific patchwork before the engine and runtime contract exist.
6. Every phase needs explicit exit criteria.

## Phase 0: Lock The Contract And Harnesses

**Goal:** stop the roadmap from drifting while implementation starts.

**Primary packages:** repo-only, research docs

**Deliver:**

- freeze the v2 principles:
  - data-model-first
  - op-first externally
  - transaction-first internally
  - React-optimized runtime
  - explicit DOM ownership
- freeze package ownership:
  - `slate-v2`
  - `slate-dom-v2`
  - `slate-react-v2`
  - `slate-history-v2`
  - `slate-hyperscript-v2`
- freeze the first benchmark lanes
- freeze the first red-test candidate set

**Exit criteria:**

- roadmap accepted as the working order
- top benchmark lanes chosen
- top correctness lanes chosen
- no open architectural contradiction between the requirements doc and the engine doc

## Phase 1: Build `slate-v2` Core Foundation

**Goal:** replace the execution model without abandoning the Slate document model or operation model.

**Primary package:** `slate-v2`

**Must deliver:**

- transaction object and commit boundary
- immutable committed snapshots
- private draft state
- stable runtime identity outside serialized JSON
- op-lowering and op-first external contract
- normalization debt owned by the transaction
- transaction-friendly refs and selection state

**Must not try to solve yet:**

- browser event weirdness
- React hooks
- clipboard DOM
- example parity

**Representative issue pressure:**

- `#6038`
- `#5977`
- `#5771`
- `#5533`
- `#4750`

**Exit criteria:**

- core transform semantics run on transactions, not ad hoc mutable editor state
- current highest-value pure-core red tests have a home in `slate-v2`
- benchmark lanes for transaction execution and normalization debt exist

## Phase 2: Build `slate-dom-v2` Runtime Boundary

**Goal:** create a real DOM bridge instead of letting DOM ownership leak everywhere.

**Primary package:** `slate-dom-v2`

**Depends on:** Phase 1

**Must deliver:**

- DOM point/path translation over stable runtime identity
- explicit selection bridge
- nested-editor and shadow-DOM boundary rules
- browser-facing range ownership rules
- clipboard DOM boundary primitives
- composition and beforeinput contract at the DOM boundary

**Must not try to solve yet:**

- broad React lifecycle policy
- subscription ergonomics
- history grouping

**Representative issue pressure:**

- `#5947`
- `#5938`
- `#5749`
- `#4789`
- `#4839`
- `#4881`

**Exit criteria:**

- top DOM path and selection red tests pass against the new bridge
- nested editor and shadow DOM semantics are explicit, not accidental
- zero-width, void-boundary, and table-selection policy is documented in code and tests

## Phase 3: Build `slate-react-v2` As A Snapshot Runtime

**Goal:** make React consume coherent committed state instead of mutable editor guts.

**Primary package:** `slate-react-v2`

**Depends on:** Phase 1 and Phase 2

**Must deliver:**

- snapshot-driven editor store
- selector-based subscriptions
- stable editor instance semantics
- controlled and external update sanity
- placeholder and focus lifecycle correctness
- render-time identity rules that do not remount for stupid reasons
- a first-class projection model for decorations, render-time marks, and annotation anchors

**Must not try to solve yet:**

- every example surface
- full migration compatibility
- product-layer helpers

**Representative issue pressure:**

- `#5709`
- `#5697`
- `#5568`
- `#5488`
- `#5131`
- `#4612`
- `#5987`
- `#3354`
- `#3352`
- `#3383`
- `#2465`
- `#4477`

**Exit criteria:**

- rerender-breadth benchmark lanes exist and improve materially
- stale-editor-instance and controlled-update red tests pass
- React runtime no longer depends on reading half-mutated editor state
- decoration updates, render-time marks, and annotation anchors no longer rely on brittle leaf-splitting or broad invalidation

## Phase 4: Add Transaction-Aware History And Explicit Clipboard Boundaries

**Goal:** finish the engine/runtime contract where history and external formats currently leak semantics.

**Primary packages:** `slate-history-v2`, `slate-dom-v2`, `slate-v2`

**Depends on:** Phase 1 through Phase 3

**Must deliver:**

- transaction-aware undo units
- explicit grouping rules
- collaboration-safe history boundaries
- explicit internal fragment ownership
- cleaner HTML and plain-text import/export seams

**Representative issue pressure:**

- `#5587`
- `#5250`
- `#5364`
- `#5233`
- `#5328`
- `#5630`

**Exit criteria:**

- history grouping tests use transaction boundaries, not lucky timing
- clipboard and foreign-format tests no longer depend on accidental fragment coupling

## Phase 5: Kill The Chronic Runtime Clusters

**Goal:** cash out the new architecture on the worst recurring bug families.

**Primary packages:** `slate-dom-v2`, `slate-react-v2`, secondarily `slate-v2`

**Depends on:** Phase 1 through Phase 4

**Target clusters:**

- mobile, IME, and input semantics
- selection, focus, and DOM bridge
- React runtime identity and subscription model

**Representative issue pressure:**

- `#6022`
- `#5989`
- `#5984`
- `#5931`
- `#6034`
- `#5826`

**Exit criteria:**

- top chronic mobile and IME red tests pass
- top selection-loss and cursor-loss red tests pass
- the runtime can explain selection and composition behavior without hand-wavy fallback logic

## Phase 6: Benchmark-Driven Hardening

**Goal:** optimize only after the architecture can carry the fixes honestly.

**Primary packages:** shared

**Depends on:** Phase 1 through Phase 5

**Must deliver:**

- large-document edit benchmarks
- large paste benchmarks
- selection lag benchmarks
- React rerender breadth benchmarks
- clear baseline vs target numbers

**Representative issue pressure:**

- `#6038`
- `#5992`
- `#5945`
- `#5216`
- `#5131`
- `#3656`
- `#3430`

**Exit criteria:**

- benchmark suite is part of normal v2 evaluation
- performance claims are backed by lanes, not screenshots and hope

## Phase 7: Public Surface, Docs, Examples, And Migration Story

**Goal:** make the thing teachable and adoptable after the architecture is real.

**Primary packages:** docs/examples/repo, all packages secondarily

**Depends on:** Phase 1 through Phase 6

**Must deliver:**

- package docs for the actual v2 surfaces
- examples that reflect the intended runtime boundaries
- maintainer triage playbook for old issue classes
- migration guidance only after the surfaces stop moving

**Must not happen early:**

- faux compatibility layers that freeze bad decisions
- example-driven API design before the runtime contract is stable

**Representative issue pressure:**

- `#6007`
- `#5212`
- `#4956`
- `#4882`

**Exit criteria:**

- docs stop fighting the package boundaries
- examples stop teaching the old ownership mistakes

## Phase 1 Cut

If the goal is to prove v2 is real without boiling the ocean, the smallest serious cut is:

1. `slate-v2` transaction core
2. `slate-dom-v2` selection bridge foundation
3. `slate-react-v2` snapshot subscriptions
4. one IME lane
5. one selection lane
6. one rerender-breadth lane

That is enough to prove whether the architecture is actually better or just prettier.

## What To Defer

Defer these until the foundation exists:

- alternate framework adapters
- broad ecosystem parity
- docs cleanup as a substitute for runtime fixes
- wide example refresh
- support-thread gardening
- any attempt to make v2 look “feature complete” before the runtime contract is stable

## Brutal Truths

1. Starting with `slate-react-v2` before `slate-v2` just recreates current cleanup-crew architecture.
2. Starting with browser patches before `slate-dom-v2` exists is cargo cult.
3. Starting with docs/examples before the package seams are real is theater.
4. Starting with migration compatibility too early will lock bad decisions back in.

## Immediate Next Step

Start Phase 0 and Phase 1 together:

- freeze the benchmark and red-test lanes
- sketch the `slate-v2` transaction core package shape
- define the first snapshot and identity primitives

That is the first real fork in the road. Everything else is downstream of it.
