# Editor node model standards research

Objective:
Decide the best Plate node model from editor standards; done when eight source
owners cover at least eight node-shape decisions and a ranked verdict is
published.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-17-editor-node-model-standards-research.md

Template:
docs/plans/templates/major-task.md

Primary template:
docs/plans/templates/major-task.md

Applied packs:
- none

Major source:
- type: direct user architecture question with explicit `plite-research`
- id / link: current Codex task
- title: Harsh review of Plate node APIs against editor standards
- decision to make: whether Plate should copy MDAST or another node standard,
  and which current discriminator/property shapes should change before beta.
- decision criteria: editor correctness, semantic clarity, TypeScript/DX,
  persistence/migration cost, Markdown fidelity, collaboration fitness, and
  deletion value.

Major lane:
- lane: framework comparison plus public API architecture
- output type: source-backed research artifact and ranked `best-api` verdict
- implementation expected: no; planning-only recommendation
- affected packages / surfaces: Plite base node types, Plate plugin schemas,
  generated application AST contracts, Markdown codecs, future v54 migration
- dominant risk: copying a serialization AST into an editor runtime, or
  preserving locally familiar names that are materially worse than established
  editor practice.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: source-count and decision-row threshold
- improvement loop: stop when eight source owners and all decision rows close
- final score / loop closure: N/A: binary evidence threshold

Completion threshold:
- At least eight representative node models are inspected from local source or
  official primary source at verified revisions.
- At least eight atomic node-shape decisions have Plate-current, reference,
  verdict, priority, and rejection evidence.
- Facts, inference, recommendation, and unresolved evidence are separated.
- The durable research artifact records repos searched/read, duplicate and
  rejected leads, promoted decisions, and exact next owners.
- Major-task closure is legal only when the decision criteria are satisfied or
  explicitly narrowed, facts/inference/recommendation are separated, required
  review or pressure passes are recorded, implementation gates are closed when
  code changed, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-editor-node-model-standards-research.md`
  passes.

Verification surface:
- Current Plate/Plite source audit of base nodes, generated exact application
  types, schema identity, and Markdown mappings.
- Local clone commit receipts and exact source citations for MDAST/UNIST,
  ProseMirror, Lexical, Slate, BlockNote, Portable Text, Editor.js, and Quill.
- `docs/plite/research/2026-08-17-editor-node-model-standards/README.md`
  plus research ledgers.
- `best-api` pressure pass over every recommended breaking shape.

Constraints:
- Start from repo evidence before external claims.
- Keep helper stack proportional.
- Separate measured evidence, source evidence, inference, and recommendation.
- Do not execute implementation unless this major goal explicitly includes it.

Boundaries:
- Source of truth: live Plate/Plite schema/node/codec owners and verified
  external repository source; earlier recommendations are leads only.
- Allowed edit scope: this plan and the research artifact/ledgers only.
- External sources: eight named editor/document models; official docs only when
  local source does not settle the public contract.
- Browser surface: N/A: persisted type/API analysis only.
- Tracker sync: N/A: no tracker.
- Non-goals: implementation, full editor-architecture superiority claims,
  behavior/test harvesting, issue-corpus closure, benchmarks, or copying code.

Output budget strategy:
- Search repository filenames/symbols first, then read only exact node/schema
  declarations and representative presets. Save comparison rows and source
  receipts in the artifact; never stream entire repositories, issues, or docs.
  Cap web queries to four and local reads to narrow line ranges.

Blocked condition:
- Stop only if fewer than eight authoritative source models are accessible or
  if current Plate node ownership cannot be determined from the live checkout.

Major state:
- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: keep the Plate-native schema model; accept P1 Heading, Code language,
  and Table vocabulary packets; defer Media intrinsic-dimension naming.
- confidence: high for the bounded node-model question
- next owner: user acceptance, then `best-api repair` and `plate-plan`
- reason: ten authoritative source owners converge on selective semantic fixes,
  while every wholesale model loses material Plate editing/schema capability.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-editor-node-model-standards-research.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | HHF, best node API, type/additional fields, MDAST versus alternatives, and general-editor scope are recorded. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `major-task` loaded | yes | Loaded for framework-comparison discipline. |
| Active goal checked or created | yes | Goal created with this exact plan. |
| Source of truth read before analysis | yes | Read Plite Element/Text/Value/document/envelope, generated www schema types, Markdown codec map, migration plan, and prior MDAST recommendation. |
| Major lane selected | yes | Framework comparison plus public API architecture. |
| Decision criteria stated | yes | Seven criteria listed under Major source. |
| Existing repo patterns / prior decisions checked | yes | Prior MDAST-adjacent recommendation and current v54 implementation were checked; current source wins. |
| Helper stack selected | yes | `plite-research` discovery, narrow `editor-audit` atomic rows, `best-api` verdict, `major-task`/`autogoal` lifecycle. |
| External research decision recorded | yes | Eight representative primary-source node models are required. |
| Implementation expectation recorded | no | N/A: analytical only; no runtime/API edits authorized. |
| Workspace authority selected | yes | Plate source in `/Users/zbeyens/git/plate-2`; external source in verified sibling clones. |
| Branch / PR expectation decided | no | N/A: no code, branch, commit, push, or PR. |
| Output budget strategy recorded | yes | Exact symbol reads, capped web queries, artifacted comparisons. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Major source records source type, id/link, title, decision type, expected
      outcome, decision criteria, likely files/packages/surfaces, browser
      surface, and highest-leverage owner.
- [x] Current state is mapped before proposing a new architecture, migration,
      benchmark, or plan.
- [x] Existing repo patterns, prior decisions, and nearby implementation
      constraints are recorded before external research.
- [x] External docs or source are used only where repo evidence does not settle
      the question, or N/A reason is recorded.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Facts, inference, and recommendation are separated.
- [x] Review or pressure lenses are selected and completed, or marked N/A with
      reason.
      `best-api` pressure selected only three P1 changes; seven complete model
      copies and MDAST `depth` were rejected.
- [x] If implementation happens, touched-surface packs cover docs, browser,
      package/API, or agent-native surfaces as needed.
      N/A: no implementation.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Accepted/actionable review findings are fixed or explicitly rejected with
      evidence.
      N/A for code fixes; every architecture finding has a keep, promote,
      reject, or evidence-backed defer disposition in the artifact.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the repo audit, benchmark, review, prototype, or artifact check named in this plan | 10 external owners and 10 atomic decisions exceed the 8/8 threshold; artifact/TSV validation passes. |
| Current-state source audit | yes | Map current owner, boundaries, constraints, and affected surfaces | Plite base/generated types and five Plate schema owners mapped; blast radius is Heading 84, Code 15, Table 24 files. |
| Decision criteria closure | yes | Mark each criterion satisfied, narrowed, rejected, or blocked with evidence | Correctness, semantics, DX/types, persistence, Markdown, collaboration, and deletion value are resolved per matrix row. |
| Options / tradeoffs / rejection record | yes | Record viable options, chosen recommendation, and why alternatives lose | Seven wholesale models and MDAST depth are rejected with reopen conditions; Plate base and three P1 packets are selected. |
| Review / pressure pass | yes | Run selected reviewer/lens or record N/A with reason | `best-api` two-pass lens kept the direct long-term shapes despite broad adoption cost and deferred unproved Media semantics. |
| Review findings closure | yes | Fix or explicitly reject accepted/actionable findings and record closure proof | Three material findings promoted; one Media finding deferred; all other rows keep/reject with evidence. |
| External-source audit | yes | Cite official/local clone/external sources when used, or record N/A | Ten clean local source owners recorded at immutable commits; final HEADs and cleanliness reverified. |
| Implementation gates | no | If code changed, close primary-template and touched-surface gates; otherwise N/A | N/A: no runtime, API, package, docs reference, or generated code changed. |
| Final handoff contract | yes | Record recommendation, evidence, caveats, residual risk, and next owner | Filled below and in research README. |
| Final lint | no | Run `pnpm lint:fix` or scoped equivalent when files changed | N/A: analytical Markdown/TSV only; TSV column validation and unresolved-placeholder audit pass. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Source discovery used capped `rg`; exact slices were read; all broad comparison state lives in ledgers. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-17-editor-node-model-standards-research.md` | Exact command passed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Goal, current Plate/Plite types, prior decision, and helper stack recorded. | current-state map |
| Current-state map | complete | Base/generated AST plus Heading, Code, List, Media, and Table owners mapped. | external source sampling |
| Options and recommendation | complete | Ten source owners and ten atomic decisions recorded in research artifact. | review |
| Review / pressure pass | complete | `best-api` selected three P1 packets, one P2 defer, and Plate base retention. | implementation decision |
| Implementation or plan artifact | complete | Research README and six ledgers completed; no implementation authorized. | verification |
| Verification | complete | Clone provenance/cleanliness, TSV columns, placeholder audit, and counts pass. | closeout |
| Closeout | complete | Handoff, risks, owners, and doctrine-repair trigger recorded. | final response |

Findings:
- Plate has a broad Slate-family base node model and an exact schema-generated
  application union; these are separate API jobs.
- MDAST/UNIST are already first-class external codec contracts, not the stored
  editor document.
- The previous `heading { depth }` recommendation was never adopted; current
  v54 still persists `h1` through `h6`.
- ProseMirror and BlockNote use one heading type plus `level`; Lexical uses one
  heading type plus tag; MDAST alone prefers the syntax-oriented `depth` word.
- Plate's Heading source repeats six descriptors and codecs. This is one
  parameterized capability falsely modeled as six capabilities.
- `lang` is the odd field out: Plate's own implementation vocabulary and the
  editor references say `language`.
- Table's `size` means cell width, row height, or border width depending on
  location; `background` means background color and `colSizes` means column
  widths. The generated API makes callers infer semantics from node context.
- Plate's base `type`/`children`, `{ text }`, flat properties, leaf marks,
  editable code lines, flat lists, direct caption children, table grammar, and
  document-level schema lineage all survived the external pressure pass.

Decisions and tradeoffs:
- Do not judge wholesale format adoption until each atomic node-shape decision
  is compared independently.
- Treat source popularity as signal only; current editor jobs and deletion
  value decide whether a break is material.
- Keep the Plate/Plite base and MDAST interchange boundary; no Plite change.
- P1 Heading: `heading { level }`, one descriptor, authored level-aware toggle,
  v54 h1-h6 migration.
- P1 Code: persisted `language`; external MDAST continues to use `lang`.
- P1 Table: `columnWidths`, `height`, `backgroundColor`, border `width`; imported
  cell widths normalize into table-owned column widths instead of persisting
  `TableCell.size`.
- P2 Media: defer `initialWidth`/`initialHeight` until their intrinsic/imported
  semantics are proven; an attractive rename without that proof would lie.
- Reject MDAST `depth` for the editor. `level` is clearer and wins the
  editor-facing source comparison.
- Current best-api/worker doctrine requiring distinct h1-h6 capabilities is
  stale if the user accepts the Heading packet. Read-only scope means report
  the exact `best-api repair` rather than editing doctrine now.

Implementation notes:
- N/A: planning-only research; no product implementation.

Review fixes:
- The initial old recommendation used MDAST `depth`; external editor evidence
  corrected the target to `level`.
- Table review narrowed the proposal from blindly renaming every `size` to
  removing canonical cell width duplication and naming each surviving owner by
  semantics.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Existing `../slate` and `../portabletext` checkouts were dirty or non-canonical | 1 | Leave them untouched and clone clean official sources under distinct sibling paths. | Official Slate and Portable Text commits were read and reverified clean. |
| One double-quoted `rg` pattern contained backticks and invoked shell substitution | 1 | Use literal source slices without executable punctuation. | Exact doctrine lines were read with `sed`; no mutation occurred. |

Verification evidence:
- Artifact: `docs/plite/research/2026-08-17-editor-node-model-standards/README.md` -> complete 10-row matrix and ranked packets.
- Registry/read ledgers -> 10 repositories, 21 source reads, 10 leads, 8 rejected alternatives, 5 promotions.
- External provenance audit -> all 10 selected source checkouts clean and still at recorded immutable commits after reads.
- Node TSV validator -> all six ledgers have consistent column counts and zero malformed rows.
- Placeholder audit -> zero unresolved placeholder markers in the research artifact.
- Plate blast-radius audit -> Heading 84 files, Code persisted `lang` 15 files, Table ambiguous fields 24 files.
- Pressure pass -> no P0; three P1 Plate packets, one P2 evidence gate, no Plite changes.

Final handoff contract:
- Recommendation: keep Plate's schema-derived Slate-family AST; accept
  `heading.level`, `codeBlock.language`, and semantic Table field cleanup; do
  not copy any external standard wholesale.
- Confidence: high for the bounded node-model/API decision.
- Evidence: ten clean external source owners, current Plate/Plite owners, ten
  atomic decision rows, rejected/reopen conditions, and blast-radius counts.
- Tests / commands: source/commit audit, TSV validation, placeholder audit, and
  final goal checker; no runtime tests because no product code changed.
- Browser proof: N/A: analytical type/persistence decision only.
- PR / tracker: N/A: none requested; no code change.
- Caveats: list derived-state persistence and Media initial dimensions remain
  deliberately unresolved by this narrow source pass; no global editor
  superiority claim is made.
- Next owner: user accepts/rejects packets; acceptance routes to `best-api
  repair`, then one `plate-plan` reopening v54 schema/migration work.

Timeline:
- 2026-08-17T14:18:13.110Z Major-task goal plan created.
- 2026-08-17 Current Plate/Plite node, schema, generated-value, Markdown, and prior-decision owners mapped.
- 2026-08-17 Ten external model owners cloned/reused at clean verified commits and exact node/schema sources read.
- 2026-08-17 Research ledgers and ten atomic decisions completed; three P1 packets promoted.
- 2026-08-17 External HEAD/cleanliness, six TSV ledgers, placeholder audit, and source counts verified.
- 2026-08-17 Goal-plan mechanical completion check passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final HHF handoff and user packet decision |
| What is the goal? | Decide whether Plate should copy a node standard and which current node fields should change. |
| What have I learned? | Plate's base wins, but Heading capability identity and Code/Table field vocabulary should change before stable. |
| What have I done? | Read ten source models, closed ten decisions, validated ledgers/provenance, and published three P1 packets. |

Open risks:
- A sampled comparison cannot support an overall “best editor architecture”
  claim; it supports only the named node-model decisions.
- Heading adoption is broad: 84 current files plus doctrine, migration,
  generated types, registry, and docs. That is adoption cost, not evidence
  against the target.
- Table cell import width needs focused implementation proof before deleting
  `TableCell.size`; the selected ownership is table-level column widths, but
  the normalization path is not implemented in this research pass.
