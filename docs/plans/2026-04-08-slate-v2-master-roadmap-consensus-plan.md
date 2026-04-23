---
date: 2026-04-08
topic: slate-v2-master-roadmap-consensus-plan
status: approved
source: /Users/zbeyens/git/plate-2/.omx/specs/deep-interview-slate-v2-roadmap-release-candidate.md
deepened: 2026-04-08
---

# Slate v2 Master Roadmap Consensus Plan

> Supporting plan. For current queue and roadmap truth, see [master-roadmap.md](/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md).

## Problem Frame

The `slate-v2` effort is currently split across:

- live verdict docs in `docs/slate-v2/`
- old roadmap and phase artifacts in `docs/slate-v2/archive/`
- active execution plans in `docs/plans/`
- separate `docs/slate-browser/` north-star/testing docs
- a large evolving diff in `/Users/zbeyens/git/slate-v2`

That is too much surface for one migration program.

The user wants one canonical roadmap in `docs/slate-v2/` that:

- is detailed enough to drive Ralph-sized work batches
- preserves migration obligations without regression theater
- folds `slate-browser` into the same vision
- carries reusable maintenance commands so this manual interview/planning pass
  does not need to happen again every time the repo shifts

## RALPLAN-DR Summary

### Principles

1. Migration-safe release truth beats roadmap archaeology.
2. Data-model-first core stays the top principle; React stays an optimization
   target, not the ontology.
3. Behavioral obligations matter more than preserving legacy file names.
4. The roadmap must be batch-oriented and execution-ready, not a pretty memo.
5. Maintainers need one canonical read plus one explicit diff/ledger story.

### Decision Drivers

1. The current doc stack is too fragmented for reliable execution.
2. The testing/proof story only gets stronger if `slate-browser` is treated as
   a co-equal development lane, not a sidecar.
3. The roadmap needs built-in re-consolidation/re-interview/re-plan commands so
   future work can restart without another giant manual sync pass.

### Viable Options

#### Option A: Keep `docs/slate-v2` as live verdict only, keep roadmap machinery in `docs/plans/`

Pros:

- smallest doc rewrite
- least risk to current live verdict docs

Cons:

- keeps the real roadmap out of the place users want it
- preserves the split-brain problem
- forces maintainers to triangulate between verdict docs and plans forever

#### Option B: One master roadmap in `docs/slate-v2/`, supporting plans in `docs/plans/`, archive old roadmaps, fold `slate-browser` into the roadmap

Pros:

- matches the requested artifact ownership exactly
- gives one canonical roadmap while preserving supporting plans
- lets live verdict docs stay small and sharp
- makes `slate-browser` part of the migration path instead of a parallel doc sea

Cons:

- requires a careful archive move and cross-link cleanup
- requires explicit separation between roadmap truth and release-verdict truth

#### Option C: Merge everything into `architecture-contract.md`

Pros:

- one giant file
- minimal navigation cost

Cons:

- confuses architecture north star with release/migration execution
- makes current-vs-future truth too muddy
- directly conflicts with the user’s release-first boundary

### Chosen Option

Pick **Option B**.

### Why Option A Loses

It preserves the current “where the hell is the real roadmap?” problem.

### Why Option C Loses

It would turn `architecture-contract.md` into a dumping ground and break the
release-vs-north-star boundary.

## ADR

### Decision

Create one canonical batch-oriented master roadmap in `docs/slate-v2/`,
archive older related roadmaps there, keep supporting execution plans in
`docs/plans/`, and fold `slate-browser` into the same roadmap as the testing
and proof-development lane.

### Drivers

- reduce roadmap sprawl
- preserve live verdict doc clarity
- make future roadmap maintenance repeatable
- encode testing/proof strategy into the migration story instead of bolting it
  on later

### Alternatives Considered

- keep roadmap ownership in `docs/plans/`
- collapse roadmap into `architecture-contract.md`

### Why Chosen

It is the only option that:

- matches the requested artifact ownership
- keeps release truth and architecture north star separate
- gives Ralph/team a durable execution surface

### Consequences

- `docs/slate-v2/` gains one heavier canonical roadmap file
- archive curation becomes part of the work, not an afterthought
- `docs/slate-browser/` stops acting like a parallel strategy universe
- the roadmap must be maintained actively at batch milestones

### Follow-ups

- create the master roadmap
- create the commands pack
- create the review ledger
- archive older related roadmaps
- relabel `architecture-contract.md` truth classes

## Implementation Units

### Unit 1: Canonical Doc Ownership Reset

Purpose:

- define exactly which docs own:
  - live release verdict
  - master execution roadmap
  - architecture north star
  - archive/history

Files:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/overview.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/README.md`
- new:
  - `/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md`

Required decisions:

- `overview.md` stays the front door
- live verdict docs stay small
- `master-roadmap.md` becomes the only canonical roadmap in `docs/slate-v2/`
- `master-roadmap.md` is explicitly non-owner of stop/go release truth
- `docs/plans/` becomes execution-record territory only:
  - batch-local execution records
  - investigations
  - audit ledgers
  - not queue/roadmap truth

Demotion protocol:

- every surviving doc in this explicit authority inventory:
  - `docs/slate-v2/`
  - `docs/slate-v2/archive/`
  - `docs/plans/`
  - `docs/slate-browser/`
    must either:
  - move to archive
  - or carry a standard non-canonical banner:
    - `Reference only. See master-roadmap.md for current queue and roadmap truth.`

Disposition matrix:

- canonical live verdict docs:
  - no banner
  - examples:
    - `overview.md`
    - `release-readiness-decision.md`
    - `replacement-family-ledger.md`
    - `full-replacement-blockers.md`
    - `replacement-gates-scoreboard.md`
    - `oracle-harvest-ledger.md`
- canonical roadmap:
  - no banner
  - `master-roadmap.md`
- reference specs:
  - keep file
  - add/reference-spec banner if missing
  - examples:
    - `architecture-contract.md`
    - `slate-batch-engine.md`
    - `chunking-review.md`
- specialist lane docs:
  - keep file
  - require non-canonical specialist-lane banner
  - examples:
    - `docs/slate-browser/*.md`
- supporting plans:
  - keep only when still needed
  - require non-canonical supporting-plan banner if kept
  - scope:
    - `docs/plans/*slate-v2*.md`
- archive docs:
  - keep archive-only header
  - no queue/roadmap authority language

Authority inventory to sweep explicitly:

- active `docs/slate-v2/` root docs:
  - `slate-batch-engine.md`
  - `chunking-review.md`
  - `architecture-contract.md`
- archive shadow owners already known:
  - `archive/package-end-state-roadmap.md`
  - `archive/cohesive-program-plan.md`
- every matching supporting plan file:
  - `docs/plans/*slate-v2*.md`
- specialist strategy docs under `docs/slate-browser/`

Naming rule:

- treat any file matching one of these as authority-inventory scope:
  - `docs/slate-v2/*.md`
  - `docs/slate-v2/archive/*.md`
  - `docs/plans/*slate-v2*.md`
  - `docs/slate-browser/*.md`

Banned ownership phrases outside `master-roadmap.md`:

- `single source of truth`
- `owns .*queue`
- `owns .*roadmap`
- `active default queue`
- `operating .* roadmap`
- `this file wins` for queue/next-slice ownership

Rule:

- inventory classification is the primary authority check
- phrase scan is a backstop for missed shadow-ownership language

Test scenarios:

- a reader can answer “where do I read the roadmap?” in one click
- `overview.md` clearly separates:
  - live verdict docs
  - master roadmap
  - reference specs
  - archive

### Unit 2: Archive Move Plan

Purpose:

- move older related roadmap/phase artifacts out of the active lane

Likely archive candidates:

- prior roadmap/status/phase docs currently under
  `/Users/zbeyens/git/plate-2/docs/slate-v2/archive/`
- every `docs/plans/*slate-v2*.md` file that should not survive as an active
  supporting plan

Rules:

- do not delete historical docs if they still provide archaeology value
- do archive anything that competes with the new master roadmap
- if an authority-inventory doc survives outside archive, it must gain the
  standard non-canonical banner

Concrete shadow-owner targets to neutralize:

- `docs/slate-v2/archive/package-end-state-roadmap.md`
- `docs/slate-v2/archive/cohesive-program-plan.md`
- every matching `docs/plans/*slate-v2*.md` file
- any `docs/slate-browser/*.md` file that still reads as a strategy owner

Test scenarios:

- no older roadmap file in `docs/slate-v2/` competes with `master-roadmap.md`
- archive docs are visibly labeled historical/reference only
- surviving authority-inventory docs outside archive are visibly demoted
- every matching `docs/plans/*slate-v2*.md` file is either archived or carries
  the standard non-canonical banner
- every authority-inventory file lands in exactly one disposition-matrix class
- banned ownership phrases are removed or replaced everywhere outside
  `master-roadmap.md`

### Unit 3: Master Roadmap Authoring

Purpose:

- write the canonical roadmap itself

Target file:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md`

Important scope rule:

- `master-roadmap.md` is canonical for:
  - batch order
  - milestone commands
  - current execution truth
- it should not duplicate every supporting proof/reference doc inline
- it should summarize and link when detail already lives better elsewhere

Required sections:

1. purpose and scope
2. north-star principles
3. release bar / non-regression rules
4. current status snapshot
5. ordered batch ladder
6. milestone command system
7. review-ledger protocol
8. architecture-contract alignment rules
9. `slate-browser` lane
10. release-candidate freeze protocol

Required batch shape:

Each batch must include:

- objective
- why now
- explicit entry conditions
- ordered substeps
- proof lanes
- rollback or branch decision point
- “if this changes the picture, run this command next”

Test scenarios:

- the roadmap is detailed enough to hand directly to Ralph without another
  full interview
- the roadmap is still readable as a single artifact

### Unit 4: `slate-browser` Lane Consolidation

Purpose:

- fold `docs/slate-browser/` into the same roadmap vision instead of leaving it
  as parallel strategy

Source inputs:

- `/Users/zbeyens/git/plate-2/docs/slate-browser/overview.md`
- `/Users/zbeyens/git/plate-2/docs/slate-browser/proof-lane-matrix.md`
- `/Users/zbeyens/git/plate-2/docs/analysis/editor-architecture-candidates.md`

Required output in the master roadmap:

- `slate-browser` as the testing/proof-development lane
- layered testing strategy:
  - core
  - dom
  - selection
  - browser e2e
  - IME/mobile
  - anchors
  - compatibility
  - performance
- explicit research hooks for difficult editor-testing problems using:
  - Lexical
  - edix
  - Premirror / Pretext
  - VS Code-style lane taxonomy where useful

Boundary:

- keep `slate-browser` as a linked specialist lane
- do not force every `docs/slate-browser/*.md` file to move immediately if that
  would just recreate a second doc churn wave

Important consolidation rule:

- first consolidate by **shared vision and explicit links**
- do not force every `docs/slate-browser/*.md` file to move immediately if that
  would just create churn without better ownership

Test scenarios:

- the roadmap makes it obvious when work belongs to `slate-browser`
- browser/mobile/editor-proof difficulty is treated as first-class planning
  input, not ad hoc debugging
- `docs/slate-browser/overview.md` no longer reads like a competing roadmap
  owner

### Unit 5: Architecture-Contract Alignment Plan

Purpose:

- push `architecture-contract.md` as far as possible without turning it into
  the live ship gate

Files:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/references/architecture-contract.md`
- `/Users/zbeyens/git/plate-2/docs/slate-v2/master-roadmap.md`

Required decisions:

- label major contract sections as:
  - current invariant
  - near-term required
  - future direction
- bake Ian’s feedback into the principles stack:
  - data-model-first
  - transaction-first
  - React-optimized runtime
  - not React-first ontology

Test scenarios:

- the roadmap references `architecture-contract.md` as canonical architecture map
- the contract no longer blurs current truth with future direction
- labels are applied at section/subsection grain, not sentence-by-sentence

### Unit 6: File-Level Review Ledger

Purpose:

- make granular review durable and batch-friendly

Target file:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/release-file-review-ledger.md`

Scope rule:

- every major changed/deleted file bucket must be represented
- every release-relevant file or file family gets an explicit checkbox row
- use family/file buckets where one row can honestly represent one decision
- do not preserve permanent checkbox noise for fully-settled trivial rows

Timing rule:

1. update at Ralph batch exit
2. update at roadmap reconsolidation milestones
3. full pass at release-candidate freeze

Required row fields:

- file or file family
- release relevance
- current disposition
  - preserved
  - adapted
  - replaced
  - explicitly dropped
- proof owner
- docs owner
- maintainer note
- `[ ]` / `[x]` state

Test scenarios:

- maintainers can tell what was reviewed and what still is not
- the ledger does not devolve into fake “all done” noise

### Unit 7: Commands Pack

Purpose:

- kill the need for another huge manual coordination pass next time

Target directory:

- `/Users/zbeyens/git/plate-2/docs/slate-v2/commands/`

Required command docs:

1. `reconsolidate-roadmap.md`
2. `refresh-file-review-ledger.md`
3. `reinterview-remaining-scope.md`
4. `replan-remaining-work.md`
5. `launch-next-ralph-batch.md`

Each command doc should include:

- when to run it
- exact invocation pattern
- required inputs
- expected outputs
- what docs/files must be refreshed afterward

Rule:

- commands should document existing command graph and refresh loops where
  possible
- do not invent new ceremony when an existing command already earns the job
- one stable schema so the pack feels like a real operator surface, not random
  notes

Test scenarios:

- a maintainer can resume the roadmap without repeating the original interview
- command docs point to the correct canonical artifacts

### Unit 8: Batch Ladder Design

Purpose:

- turn the current giant migration sea into a finite Ralph-friendly sequence

Required roadmap batch types:

1. contract and doc authority batch
2. testing/proof infrastructure batch
3. core oracle/parity batch
4. family-proof depth batches
5. maintainer/diff/migration-story batch
6. release-candidate freeze batch

Rules:

- batches should be large enough for Ralph
- not so large they blur objective/proof/rollback boundaries
- include agile flex points for unpredictable discoveries

Test scenarios:

- the batch ladder is detailed enough to staff directly
- the roadmap can absorb changed facts without collapsing

### Unit 9: Milestone Command System

Purpose:

- encode recovery loops into the roadmap itself

Required milestone triggers:

- after any batch that changes the public claim
- after any batch that changes proof ownership
- after any batch that changes command graph or release gate
- after any batch that reclassifies architecture-contract sections

Required outputs:

- when to run re-consolidation
- when to re-interview
- when to re-plan
- when to launch next Ralph batch
- when to escalate to team mode

Test scenarios:

- no future maintainer needs to improvise the workflow from scratch

## Deliberate-Mode Pre-Mortem

### Scenario 1: Master Roadmap Becomes Another Bloated Graveyard

Failure:

- the new roadmap tries to contain everything and becomes unreadable

Prevention:

- keep verdict docs separate
- keep architecture contract separate
- use the roadmap for execution truth only
- push archaeology into archive

### Scenario 4: Shadow Authority Survives The Rewrite

Failure:

- old docs keep ownership language after `master-roadmap.md` lands
- readers still find two or three docs that all claim to own the queue

Prevention:

- enforce the authority inventory sweep
- enforce the standard non-canonical banner
- grep for banned ownership phrases across:
  - `docs/slate-v2/`
  - `docs/plans/`
  - `docs/slate-browser/`

### Scenario 2: `slate-browser` Gets Folded In Superficially

Failure:

- the roadmap mentions `slate-browser` but still plans migration as if browser
  proof were an afterthought

Prevention:

- require a dedicated `slate-browser` lane section
- require testing-framework research hooks in the roadmap
- require batch/proof mapping against the proof-lane matrix

### Scenario 3: Granular Review Turns Into Bureaucratic Sludge

Failure:

- the ledger tracks every file forever and nobody updates it honestly

Prevention:

- represent every major bucket
- represent every release-relevant file/family
- allow one row to carry one real architectural decision
- enforce updates only at batch exit, reconsolidation, and release freeze

## Expanded Test Plan

### Unit

- docs consistency checks for canonical ownership
- architecture-contract labeling correctness
- commands-pack completeness

### Integration

- cross-link validation between:
  - overview
  - master roadmap
  - release verdict docs
  - archive README
  - review ledger
  - commands pack

### E2E / Workflow

- dry-run the milestone command system:
  - reconsolidate
  - refresh ledger
  - reinterview
  - replan
  - launch Ralph batch

### Observability

- maintainers can trace:
  - current verdict
  - current roadmap
  - current review ledger
  - current architecture map
    in one pass without hunting through plans

## Available-Agent-Types Roster

Use only these lanes for follow-up execution:

- `architect`
- `critic`
- `explore`
- `researcher`
- `writer`
- `verifier`
- `executor`

## Follow-Up Staffing Guidance

### For `ralph`

Suggested lane ownership:

1. docs authority + archive move
   - reasoning: `medium`
2. master roadmap authoring
   - reasoning: `high`
3. `slate-browser` lane consolidation
   - reasoning: `high`
4. architecture-contract labeling pass
   - reasoning: `high`
5. review ledger + commands pack
   - reasoning: `medium`
6. final coherence / verification pass
   - reasoning: `high`

Best launch hint:

- `$ralph /Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-master-roadmap-consensus-plan.md`

### For `team`

Parallel lane split:

1. worker A:
   - master roadmap scaffold
2. worker B:
   - `slate-browser` consolidation + testing-framework references
3. worker C:
   - review ledger + commands pack
4. leader:
   - architecture-contract alignment
   - archive move decisions
   - final merge/edit pass

Best launch hints:

- `omx team start` against this plan
- or:
  `$team /Users/zbeyens/git/plate-2/docs/plans/2026-04-08-slate-v2-master-roadmap-consensus-plan.md`

## Team Verification Path

Before calling the roadmap work complete:

1. verify one canonical roadmap exists in `docs/slate-v2/`
2. verify older related roadmap docs are archived or clearly demoted
3. verify `slate-browser` appears as a co-equal roadmap lane
4. verify `architecture-contract.md` labeling rules are reflected in the roadmap
5. verify `release-file-review-ledger.md` exists and is usable
6. verify `docs/slate-v2/commands/` exists with the required command docs
7. verify `overview.md` points cleanly to the new roadmap and archive

## Concrete Verification Steps

Minimum same-turn evidence:

1. markdown formatting passes on all touched docs
2. cross-link grep confirms the new canonical file paths
3. repo-wide grep for competing authority phrases is clean or explicitly
   explained
4. `overview.md` gives a one-click path to `master-roadmap.md` instead of
   sending roadmap readers into plans
5. archive/readme pointers are consistent
6. roadmap, ledger, and commands docs all exist
7. each command doc includes a real runnable invocation
8. architect review approves
9. critic approves

Required grep scope:

- `/Users/zbeyens/git/plate-2/docs/slate-v2`
- `/Users/zbeyens/git/plate-2/docs/plans/*slate-v2*`
- `/Users/zbeyens/git/plate-2/docs/slate-browser`

Required phrase scan:

- `single source of truth`
- `owns .*queue`
- `owns .*roadmap`
- `active default queue`
- `operating .* roadmap`
- `this file wins`

Required inventory verification:

- list every file matching:
  - `docs/slate-v2/*.md`
  - `docs/slate-v2/archive/*.md`
  - `docs/plans/*slate-v2*.md`
  - `docs/slate-browser/*.md`
- confirm each matching file is one of:
  - canonical live verdict doc
  - canonical master roadmap
  - reference spec
  - archived historical doc
  - specialist lane doc with banner
  - supporting plan with banner
