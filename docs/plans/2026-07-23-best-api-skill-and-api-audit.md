# best api skill and api audit

Objective:
Land a source-owned `best-api` skill and repair API-skill routing; done when
generated skills validate and the current Plate/Plite public API debt ledger
ranks every accepted candidate P0/P1/P2/P3.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-23-best-api-skill-and-api-audit.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Cleanup source:
- type: direct user correction after repeated API-design misses
- id / link: current thread; no external ticket
- title: best-api skill and API audit
- requested surface: every repo-local skill/rule that owns or routes public
  API taste, plus current Plate/Plite public API candidates
- cleanup intent: create one high-level API-taste owner, remove duplicated or
  contradictory taste from worker skills, and use the new owner for a ranked
  current-state audit
- acceptance criteria: `best-api` supports explicit modes including `design`
  and `review`; it optimizes DX, AX, cleanliness, and scalability without
  treating current API or machinery as requirements; relevant skills route to
  it; self-maintenance is explicit; generated mirrors and source audits pass;
  P0/P1/P2/P3 API findings are source-backed

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Prompt requirement ledger:
- [x] Create a `best-api` skill rather than another local answer or plan-only
      patch.
- [x] Make it the high-level API vision owner without freezing current APIs,
      compatibility, existing plans, or current machinery as requirements.
- [x] Explicitly permit better-value and breaking proposals.
- [x] Optimize for the best attainable balance of DX, AX, cleanliness,
      simplicity, scalability, inference, discoverability, and ownership.
- [x] Fight machinery and overdesign; every abstraction must earn its public
      cost.
- [x] Reuse architecture-cleanup's earned deep-interface test: callers learn a
      small stable public surface while honest complexity remains behind its
      owner.
- [x] Require examples, tests, and normal customization to stay on the public
      surface; needing internals is evidence that the API boundary is wrong.
- [x] Do not import architecture-cleanup ceremony into `best-api`: no candidate
      quotas, navigation scores, timed loops, packet taxonomy, or mandatory
      plan/goal for ordinary design and review.
- [x] Support parameters/modes including at least `design` and `review`, with
      additional modes only when they have distinct jobs.
- [x] Analyze all repo-local skills/rules for duplicated API taste,
      contradictions, and missing routing.
- [x] Refactor relevant source rules to dedupe and link `best-api`; do not edit
      generated skill mirrors directly.
- [x] Add automatic self-maintenance: any reusable API-vision change or
      correction must repair the skill and its smallest Vision owner.
- [x] Sync and validate generated skills.
- [x] After landing the skill, run it against current public APIs and publish a
      source-backed P0/P1/P2/P3 review.
- [x] Do not implement the ranked product API changes in this task.
- [x] Final handoff must name changed owners, validation, P0/P1 highlights,
      deferred risks, and the exact next execution owner.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no timed checkpoint
- initial confidence / cleanliness score: 42/100 — API taste is distributed
  across Vision, Plate/Plite plan, creator, cleanup, review, and supervisor
  skills; no owner starts from a blank-slate public call site
- improvement loop: source-map all rules, create one taste owner, route/dedupe,
  sync, forward-test, run it on current APIs, repair findings
- final score / loop closure: target >= 90/100 with no dimension below 85 for
  simplicity, DX/AX, scalability, routing clarity, and anti-machinery pressure
  - achieved: 95/100 — simplicity 94, DX/AX 92, scalability 92, routing
    clarity 97, anti-machinery pressure 98

Completion threshold:
- One source-owned `.agents/rules/best-api.mdc` exists and generates the
  discoverable `.agents/skills/best-api/SKILL.md`.
- The skill has at least `design`, `review`, `audit`, and `repair` modes with
  clear output contracts and no mandatory ceremony that is not risk-earned.
- The skill applies deep-interface and public-proof tests without copying
  architecture-cleanup's audit/execution machinery.
- Every repo-local source rule containing reusable public API taste or routing
  is classified and either links to `best-api`, remains an execution/proof
  owner with a stated boundary, or is explicitly kept as non-overlapping.
- Contradictory requirements that freeze current API, equate compatibility with
  quality, require machinery, or make plans execution requirements are removed
  or narrowed without weakening evidence and safety.
- Automatic self-maintenance is explicit: changes to public API doctrine,
  reusable API builders/patterns, or repeated API-review corrections must route
  through `best-api repair` and update the smallest durable vision owner.
- A source-backed API debt artifact ranks all accepted current candidates
  P0/P1/P2/P3 with call-site evidence, desired direction, owner, and next proof.
- Generated mirrors sync, source/generated audits match, agent-native review
  has zero accepted unresolved findings, and the goal checker passes.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-best-api-skill-and-api-audit.md`
  passes.

Verification surface:
- Complete `.agents/rules/*.mdc` inventory with targeted API-taste/routing
  searches and classification in this plan.
- Source/generated equality through `pnpm install`, exact-term audits, and any
  repo-owned skill validation command discovered from current scripts.
- Independent forward tests of `best-api design` and `best-api review` against
  raw current API surfaces.
- Ranked current API ledger in
  `docs/analysis/best-api-review.md`, grounded in source call sites and public
  types/docs.
- `git diff --check` for edited source-owned files and
  `check-complete.mjs` for this plan.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not implement product API changes during this task; list and rank them for
  later owner plans.
- Skill/rule/docs architecture changes are authorized.
- Treat current API, compatibility, existing machinery, and accepted plans as
  evidence, never hard requirements. Breaking proposals are allowed when they
  buy materially better long-term value.
- Optimize the smallest honest call-site surface for humans and agents.
  Architecture must earn every abstraction, profile, registry, option,
  lifecycle, layer, and diagnostic surface.
- Preserve proof, safety, ownership, and runtime truth; anti-overdesign does
  not mean hand-waving away real invariants.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: `.agents/rules/*.mdc`, `.agents/AGENTS.md`, root/detail
  Vision, current package public source/exports/docs, and generated skills only
  as sync evidence
- Allowed edit scope: `.agents/rules/**`, `.agents/AGENTS.md` when routing
  requires it, `VISION.md`/`docs/vision/**` only for durable owner routing,
  this goal plan, the API review artifact, generated `.agents/skills/**` only
  through `pnpm install`
- Plite / Plate boundary: `best-api` owns cross-layer public API taste; Plate
  and Plite plan skills own source-backed architecture/rollout execution for
  their respective layers
- Public API boundary: read and rank current APIs; no package source mutation
- Browser surface: N/A unless a candidate claim cannot be established from
  current source/docs; no visible behavior changes are authorized
- Package/API surface: Plate Core plugin builders/portals/editor APIs, Plite
  editor read/update/state/tx/extensions, representative feature packages and
  public docs
- Non-goals: product implementation, compatibility shims, migrations,
  exhaustive behavior proof for unimplemented proposals, a universal style
  guide, or a heavyweight API governance framework

Output budget strategy:
- Inventory filenames/counts first. Search only `.agents/rules`, named Vision
  files, public exports/types/docs, and representative call sites. Exclude
  generated registry data, templates, `node_modules`, build output, tests not
  tied to a candidate, and historical plans except the triggering plan.
- Cap broad outputs with counts/files, then read bounded owner ranges. Store the
  API ledger as an artifact instead of streaming every match.

Blocked condition:
- Block only if source/generated skill ownership cannot be determined after
  reading current repo scripts/config, or if a proposed routing change would
  erase an execution/proof owner without a replacement. Otherwise continue.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: major agent-native architecture cleanup plus read-only API
  review
- current_phase: closeout
- current_phase_status: completed
- next_phase: N/A: closeout complete
- goal_status: complete

Current verdict:
- verdict: create one `best-api` taste owner; keep plan/runtime/package skills
  as execution owners and route API-shape decisions through it
- cleanliness confidence: 94/100 after repair
- next owner: `plite-plan` for extension identity/slot P0, then `plate-plan`
  for plugin authoring/API ownership
- keep / revert / quarantine call: keep every applied workflow packet
- reason: user correction proves the current distributed taste model repeatedly
  converges on machinery before call-site simplicity

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-23-best-api-skill-and-api-audit.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Prompt requirement ledger above has 16 checked rows |
| Timed checkpoint parsed | no | N/A: no duration requested |
| `architecture-cleanup` loaded | yes | Full generated skill read before edits |
| Active goal checked or created | yes | Matching paused goal resumed from latest explicit user instruction |
| Source of truth read before analysis | yes | Repo AGENTS plus generated skill source metadata identify `.agents/rules/*.mdc`; deeper source map is the next phase |
| VISION fit gate read | yes | Root/common/Plate/Plite doctrine already read in the immediately preceding API decision and will be source-refreshed before routing edits |
| Plite / Plate boundary selected | yes | Cross-layer taste in `best-api`; layer-specific architecture/execution in `plate-plan`/`plite-plan` |
| Cleanup surface selected | yes | All repo-local source rules plus API-related AGENTS/Vision routing and current public API surfaces |
| Non-goals recorded | yes | Boundaries section excludes product implementation and governance machinery |
| Output budget strategy recorded | yes | Count/files first, bounded owner reads, artifacted API ledger |
| Implementation authority decided | yes | Skill/rule/docs edits authorized; package API edits not authorized |
| Proof strategy selected | yes | Sync, source audits, skill validation, forward tests, agent-native review, goal checker |
| Agent-native pack selected | yes | Materialized in this plan |
| Agent-facing action surface identified | yes | New `best-api` command/modes plus routing from API-owner skills |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules`; generate `.agents/skills` through `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Full generated skill read after the source draft; capability map and findings are recorded below |

## Complete Source-Rule Classification

All 44 top-level repo-local rule sources were read or independently audited.
Direct links are limited to real routing/decision owners; evidence collectors
stay transitive so `best-api` does not become a mandatory hop everywhere.

| Source rule | Decision | API boundary |
| --- | --- | --- |
| `agent-browser-issue` | keep | Browser-tool follow-up only |
| `architecture-cleanup` | link | Finds source-shape debt; public call shape goes to `best-api` |
| `auto` | link/dedupe | Supervises; API shape goes to `best-api`, durable taste to Vision |
| `autoclosure` | link | Material public diffs require `best-api review` |
| `best-api` | create | Owns design/review/audit/repair, no execution machinery |
| `changeset` | narrow | Reports accepted shipped API; no namespace doctrine |
| `clawpatch` | keep/transitive | Review mechanics only |
| `clawsweeper` | keep/transitive | Provenance/classification feeds maintainer/plan owners |
| `components` | narrow/link | Accessibility stays hard; exported Plate shape uses `best-api` |
| `docs-creator` | narrow/link | Teaches source; exposed API debt routes to `best-api` |
| `editor-test-harvester` | keep/transitive | Harvests behavior evidence; lane owners route API forks |
| `gpt-pro` | keep/transitive | External opinion is evidence, never API authority |
| `grill-me` | keep/transitive | Interview mechanics, no API ownership |
| `hard-cut` | keep | Explicit deletion executor after user/accepted decision |
| `issue-harvester` | link | API/DX to `best-api`; runtime/adoption to `plite-plan` |
| `maintainer` | link | Queue routes call shape to `best-api`, execution to layer owner |
| `major-task` | link/dedupe | Orchestrates adoption; no mandatory compatibility-first API design |
| `performance` | narrow/link | Measurement stays here; public instrumentation needs `best-api` |
| `plate-next` | link/dedupe | Migration rules remain; “best” call shape no longer freezes spellings |
| `plate-plan` | link/dedupe | Owns Plate boundary/adoption/proof after `best-api` target |
| `plate-plugin-creator` | link | Implements settled plugin contracts |
| `plate-ui` | narrow/link | UI mechanics stay; reusable hook/component API uses `best-api` |
| `plite-plan` | link/dedupe | Owns substrate runtime/adoption/proof after `best-api` target |
| `potion-yjs-browser-test` | keep | Browser proof only |
| `promote-beta` | keep | Release-wrapper compatibility, not API design |
| `react` | keep | React implementation doctrine only |
| `registry-changelog` | keep | Reports accepted registry output |
| `release-lanes` | keep | Release orchestration only |
| `research-wiki` | keep | Research compilation only |
| `resolve-slate-issue` | link | Issue pressure cannot redesign public API locally |
| `review-sweep` | narrow/link | Mines objective patterns; public taste goes to `best-api` |
| `shadcn-parity` | narrow/link | Upstream owns external protocol, not Plate public API |
| `slate-ar` | link | Measured work stays; public API goes to `best-api` |
| `slate-migration` | link | Migration consumes `best-api` target and layer plan |
| `slate-patch` | link/dedupe | Bug workflow keeps proof; public API lens is `best-api` |
| `slate-research` | link | Evidence to `best-api`; runtime/adoption to `plite-plan` |
| `sync-main-to-next` | keep | Release sync only |
| `sync-plate-ui` | keep | Downstream component sync, no API-design authority |
| `sync-shadcn` | narrow/link | Upstream protocol remains; Plate API forks use `best-api` |
| `sync-vision` | link | Reusable API taste cannot baseline without repair/reaffirmation |
| `task` | link | Public API design/review wraps implementation only when triggered |
| `testing-review` | keep/transitive | Finds contract gaps; never ranks API alternatives |
| `testing` | narrow/link | Proves accepted behavior; no ownership or file-size doctrine |
| `vision` | narrow/link | Durable doctrine/ownership; concrete call shape uses `best-api` |

## Deslop And Contradiction Inventory

| Candidate | Facts | Decision | Net navigation effect |
| --- | --- | --- | --- |
| Missing API-taste owner | Vision routed, plans designed, workers fossilized conventions | create one lightweight `best-api` source | one named call-shape owner |
| “Profile-driven behavior” in Vision | solution noun forced profiles before user job | delete; require composability, profiles only when earned | prevents machinery-first detours |
| Plate/Plite Plan duplicate breaking law | same target-shape prose in both planners | dedupe to `best-api`; keep adoption/proof | one rubric instead of two |
| Vision vs plan vs creator ownership | all claimed parts of API design | split doctrine / call shape / adoption / implementation | four clear owners, no overlap |
| Plate Next exact Table spellings | one feature example became universal law | replace with `best-api` review gate | future API can beat current spelling |
| Mandatory compatibility strategy | migration cost acted like design requirement | use adoption/rollback; compatibility only when it wins | ideal target remains visible |
| Docs/changeset/testing API doctrine | reporting/proof skills hard-coded current namespaces/owners | narrow to shipped/accepted source | workers stop designing by accident |
| Plate UI future hook law | proposed redesign was frozen as universal package law | turn into ownership pressure plus `best-api` | current plan is evidence, not ceiling |
| Testing extraction/file-size rules | contradicted inline-once and no-line-ceiling policy | owner/reuse rule replaces size bias | fewer fake helpers and file hops |
| Shadcn absolute authority | external protocol truth leaked into Plate-owned design | restrict authority to registry/install protocol | precedent remains evidence |
| Stale `docs/vision/slate.md` routes | live owner is `docs/vision/plite.md` | repair all direct routes | agents reach the real doctrine file |
| Automatic-maintenance machinery | hook/registry/state proposals would fossilize spelling | reject; semantic repair gate only | no new infrastructure |

No file split was accepted. The new skill is one source file because it is a
durable missing owner, not a wrapper; generation is existing Skiller output.

## Source Map

| Surface | Current owners and size | Public/private boundary | Proof owner |
| --- | --- | --- | --- |
| Agent doctrine | 44 top-level `.agents/rules/*.mdc` sources, 17,178 lines; largest are `auto` 1,457, `components` 1,314, `sync-shadcn` 1,211, `react` 1,205, `editor-test-harvester` 1,056, and `plate-next` 917 | `.agents/rules/**` and `.agents/AGENTS.md` are source; `.agents/skills/**`, `.claude/skills/**`, and root `AGENTS.md` are generated | Skiller through `pnpm install`, exact mirror comparison, dry run |
| Durable API taste | root `VISION.md`, `docs/vision/common.md`, `plate.md`, `plite.md`, `sync.md` | Vision owns doctrine; `best-api` owns the concrete decision method | exact-term route/contradiction audits |
| Plate plugin types | `BasePlugin.ts` 1,205 lines, `PluginConfig.ts` 862, `PlatePlugin.ts` 1,032 | exported through Core plugin barrels; private accumulator arrays stay implementation detail | Core compile-only inference and resolution tests |
| Plite extension types/runtime | `interfaces/editor.ts` 3,894 lines, `editor-extension.ts` 2,219, `extension-slot.ts` 70 | `packages/plite/src/index.ts` is public; registries/profiling are internal | Plite type contracts, lifecycle tests, package declarations |
| Representative feature owners | Table 5,179 lines, Suggestion 1,775, Markdown 117 | Table/Suggestion barrels publish their plugin contracts; Markdown root API is intentional | package tests, docs/call-site/export audits |
| API proof corpus | 225 focused spec/test files across Core, Plite, Table, Suggestion, and Markdown plus current EN/CN docs and apps | tests prove behavior; docs and exports prove public teaching/adoption | layer plan/package owner after each accepted API target |

The audit read bounded type/implementation ranges, exact public exports, docs,
and representative callers. Broad searches were capped or reduced to counts;
the full ranking is stored in `docs/analysis/best-api-review.md`.

Work Checklist:
- [x] First checkpoint captured every explicit requirement and boundary.
- [x] Source map records largest files, source owners, exports, public/private
      boundaries, tests, and proof owners.
- [x] Deslop inventory records duplicate doctrine, stale routes, solution-first
      profiles, hard-coded current spellings, and over-broad worker ownership.
- [x] Candidate matrix ranks ten skill/architecture candidates.
- [x] Every candidate has delete, simplify, create, repair, reject, or plan.
- [x] Every candidate records files-to-read, owner count, proof clarity, and
      expected navigation effect.
- [x] Anti-confetti applied: zero split accepted; file size was never evidence.
- [x] Delete, merge, inline, and simplify were considered before extraction.
- [x] Vision fit is explicit and reusable taste was repaired in root/detail
      owners.
- [x] Workflow packets are runtime-neutral and public-product-API-neutral.
- [x] Every applied packet ends `keep`.
- [x] Source-owner oracle is N/A: no runtime ownership moved; Skiller mirrors
      and the durable API ledger are the relevant workflow oracles.
- [x] Focused source/mirror proof ran before broad plan closure.
- [x] Broad proof is source/generated sync plus dry-run Skiller validation;
      package/browser proof is N/A because no product API or behavior changed.
- [x] Every proof command ran from `/Users/zbeyens/git/plate-2`.
- [x] Output stayed bounded through counts, targeted ranges, and the artifact.
- [x] Agent-native pack edited source rules, not generated mirrors.
- [x] Agent-native pack exposes modes, arguments, routing, owner, and proof.
- [x] Agent-native pack synced both generated skill mirrors.
- [x] Agent-native review has no accepted unresolved finding.

Completion Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Named verification threshold | yes | Commands and source audits below pass |
| Source map complete | yes | Source Map above |
| Deslop inventory complete | yes | Twelve classified contradictions above |
| Candidate matrix complete | yes | Ten ranked candidates below |
| Agent-navigation score complete | yes | Matrix records owner/file reduction |
| Anti-confetti gate | yes | Zero split accepted |
| Delete / merge / inline gate | yes | Duplicate doctrine deleted; worker wording simplified; no unjustified extraction |
| VISION fit gate | yes | Root/common/Plate/Plite/sync doctrine repaired |
| Implementation packet gate | yes | Five workflow/docs packets kept |
| Source-owner oracle gate | no | N/A: no runtime owner moved |
| Public API / behavior safety gate | yes | No package source or runtime behavior changed |
| Package/API proof | no | N/A: API changes are ranked, not implemented |
| Browser proof | no | N/A: no visible surface changed |
| Final lint/check | yes | Skiller sync/dry run, mirror comparison, source audits, diff check |
| Output budget discipline | yes | Count-first searches and one durable audit artifact |
| Timed checkpoint | no | N/A: no duration requested |
| Final handoff contract | yes | Completed below |
| Goal plan complete | yes | `check-complete.mjs` passes |
| Agent source / generated sync | yes | `pnpm install` passes; Codex/Claude mirrors compare exactly |
| Agent action discoverability | yes | Root `AGENTS.md`, source rule, generated skill, and Vision routes all contain `best-api` |
| Agent-native review | yes | Capability map passes; zero findings |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and source read | completed | requirement ledger and 44-rule classification | source map |
| Source map | completed | owner/size/export/proof table | contradiction inventory |
| Deslop inventory | completed | twelve decisions | candidate matrix |
| Candidate matrix | completed | ten ranked candidates | workflow packets |
| Cleanup packets / owner routing | completed | five kept packets | verification |
| Verification | completed | sync, mirrors, dry run, audits, diff check | closeout |
| Closeout | completed | API ledger and handoff | owning API plans |

Candidate matrix:
| Rank | Strength | Candidate | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 100 | Missing API-taste owner | Vision/plans/workers all partially decided call shape | 4 owners → 1 decision owner; direct proof | Create lightweight `best-api` | source rule | mirrors + forward audit | create |
| 2 | 99 | Profile-first behavior doctrine | Solution noun preceded current user job | machinery removed from every caller | Require composable/inspectable behavior; profiles only when earned | Vision | exact-term audit | delete |
| 3 | 97 | Plate/Plite plan duplicate API law | Same breaking/target rubric existed twice | 2 rubrics → 1; plans keep adoption | Link `best-api`; keep layer proof | plan rules/templates | route audit | simplify |
| 4 | 96 | Worker skills fossilize current APIs | docs/tests/changesets/creators claimed design authority | many accidental owners → explicit boundary | Narrow and link only real decision points | worker rules | 44-rule classification | simplify |
| 5 | 95 | Stale Plite doctrine routes | Several rules named nonexistent `docs/vision/slate.md` | dead route → live owner | Route to `docs/vision/plite.md` | routing rules | exact audit | repair |
| 6 | 94 | Automatic maintenance machinery | Hooks/state/registries would hard-code taste | added infrastructure → semantic repair gate | Self-maintain source + smallest Vision owner only | `best-api repair` | generated skill review | reject |
| 7 | 98 | Plate plugin authoring/API ownership | 12 verbs, accumulator types, contradictory `api` semantics | many authoring concepts → one inferred definition owner | Foundational API plan | `plate-plan` | P0 source ledger | plan |
| 8 | 98 | Plite extension identity/slot contract | raw names, guessed API key, uncorrelated replacement type | string/runtime archaeology → descriptor owner | Foundational substrate plan | `plite-plan` | P0 source ledger | plan |
| 9 | 94 | Host/DOM ownership | Core leaks `DataTransfer`; Plate `host` overlaps render | two vague owners → DOM/render owners | Hard-cut in owning plans | Plite/Plate plans | P0/P1 ledger | plan |
| 10 | 92 | File-size-driven extraction | Large coherent Table/Suggestion owners are easier to read than fragments | more files → no split | Keep files; shrink public portals instead | package owners | call-site audit | reject |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Result | Next |
| --- | --- | --- | --- | --- | --- | --- |
| API taste owner | Create modes, two-pass rubric, complexity budget, output, maintenance | `.agents/rules/best-api.mdc` | source + mirrors | Skiller sync/dry run, exact compare | keep | use for API decisions |
| Routing/dedupe | Route concrete call shape and narrow worker authority | `.agents/AGENTS.md`, relevant `.agents/rules/*.mdc` | classified source rules | 44/44 classification, route audit | keep | none |
| Durable doctrine | Remove profile-first/current-machinery locks | root/detail Vision | five Vision docs | contradiction audit | keep | `best-api repair` on future corrections |
| Plan adoption gates | Require one target verdict before target lock | Plate/Plite plan rules/templates | four owner/template files | source audit | keep | layer plans consume verdicts |
| Current API audit | Rank live Plate/Plite debt without implementation | `docs/analysis/best-api-review.md` | public types/docs/callers | source-backed P0-P3 ledger | keep | execute by priority |

Cleanup counts:
- delete: 3 duplicated/contradictory doctrine classes
- merge: 0 files; ownership merged semantically into `best-api`
- inline: 0 product changes; inline-first doctrine preserved
- simplify: 27 existing source rules/vision/template owners
- split: 0
- keep: 16 non-overlapping rules plus all five applied packets
- defer: 29 product API rows to owning plans
- reject: 4 machinery families and all size-only splits
- plan: 10 P0, 12 P1, 6 P2, and 1 P3 product API rows

Changed list:
- code/runtime/API: none
- tests/oracles: none; no runtime contract changed
- docs/plans: root/detail Vision, Plate/Plite plan templates, this plan, and
  `docs/analysis/best-api-review.md`
- skills/workflow: `.agents/AGENTS.md`, new `best-api`, and relevant routing /
  ownership rules; generated Codex/Claude skills and root `AGENTS.md`
- reverted/quarantined: rejected profile/registry/runtime-toggle machinery;
  no dirty speculative product implementation

## Agent-Native Review

### Verdict

PASS

### Capability Map

| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
| --- | --- | --- | --- | --- | --- |
| Ask for best/cleanest API | root AGENTS routing → `best-api` | `.agents/AGENTS.md`, `.agents/rules/best-api.mdc` | root AGENTS + both generated skills | route audit + Skiller dry run | pass |
| Design or review one API | `best-api design/review <surface>` | best-api mode/two-pass/output contract | generated skill | raw Table and `host` forward tests | pass |
| Audit a bounded API surface | `best-api audit <scope>` | audit rubric and P0-P3 contract | `docs/analysis/best-api-review.md` | current source/types/docs/callers | pass |
| Repair reusable API taste | `best-api repair <correction>` | best-api self-maintenance + smallest Vision owner | generated mirrors and Vision | `pnpm install`, exact compare, contradiction audit | pass |

### Findings

No unresolved findings. The reviews found and this packet repaired:

- P2: source/mirrors disagreed on P0-P3 severity.
- P2: design/review output omitted current-source evidence and explicit proof
  or N/A.
- P1: `disable-model-invocation: true` made the skill manual-only while routing
  expected agents to invoke it.

### Accepted / Rejected

- Accepted: explicit modes, ideal-target-first review, one recommendation,
  ranked audit, repair gate, layer-plan handoff, agent-native proof path.
- Rejected: wrapper-only skill, mandatory plans for ordinary review, hook/state
  maintenance machinery, generated-file editing, compatibility-first targets.

### Forward Tests

- A final fresh plugin-authoring design converged on one inferred declaration,
  optional `.extend()` only for genuine reuse, terminal `.configure()`, scoped
  `api`/`tx`, and explicit exceptional `editorApi`. It rejected the capability
  method zoo, annotations that repair broken inference, profiles, and a second
  composition DSL.
- Raw Table composition review converged on one full default plus ordinary
  named, colocated descriptors for proven-optional behavior; it rejected a
  Table-only behavior map, global profiles, `TablePlugin.extensions.*`, and
  universal omit/replace machinery.
- Raw `host` review plus source red-team cut unused `toDataAttributes` while
  preserving the cross-host security allowlist under an honest host/security
  owner rather than misclassifying it as render props.
- An independent broad source pass found the extension identity, DOM/React
  composition, option lifetime, and mutation-policy rows. They were verified
  against current source and merged; speculative or duplicated machinery was
  rejected.

Verification evidence:
- `pnpm install` from repo root -> passes; Skiller applies Codex and Claude
  sources.
- `cmp -s .agents/skills/best-api/SKILL.md .claude/skills/best-api/SKILL.md`
  -> exact.
- Generated source/mirrors contain no `disable-model-invocation`; final focused
  agent-native recheck -> `PASS`.
- `bun x skiller@latest apply --dry-run --local-only --agents codex,claude-code --backup=false`
  -> passes.
- `rg --files .agents/rules -g '*.mdc' | wc -l` -> `44`; every row is
  classified above.
- Exact contradiction audit -> no `Behavior should be profile-driven`,
  nonexistent `docs/vision/slate.md`, or old public-API Vision owner.
- Public API audits -> no production `host.toDataAttributes` author; seven
  Table extension blocks; Plite extension `config` appears only in type tests;
  public `ChangeSet` has a real Yjs dependency to migrate.
- `git diff HEAD --check` on the edited workflow/Vision/plan/audit scope ->
  passes.
- `check-complete.mjs` for this plan -> passes.

Needs review:
- Product API rows need user acceptance inside their owning plan before source
  implementation. The ledger's target spellings are illustrative where stated.

Final handoff contract:
- Source roots inspected: all 44 source rules; root/detail Vision; Plate Core
  plugin types/runtime/docs; Plite editor/extension/DOM/React/policy owners;
  Table, Suggestion, Markdown exports/docs/callers.
- Candidate count and top recommendation: 10 workflow candidates plus 29 API
  rows; first execute typed Plite extension identity/slot ownership, then one
  inferred Plate plugin definition and truthful API/options ownership.
- Cleanup counts: recorded above.
- Agent-navigation score changes: concrete API choice routes from four partial
  owners to one decision owner; generated proof is one command and exact mirror
  check.
- Packets applied: five, all kept.
- Proof commands/source audits: recorded above.
- Rejected/deferred candidates: no profiles, public registries, universal
  runtime toggles, method-family composition machinery, or size-only splits;
  product changes deferred to owner plans.
- Needs-review list: accept/adjust P0 ordering in the owner plans.
- Residual risks: P0 rows are architecture findings, not implemented fixes;
  raw APIs remain unchanged.
- Next owner and exact first file: `plite-plan` on
  `packages/plite/src/interfaces/editor.ts:2088-2145`; then `plate-plan` on
  `packages/core/src/lib/plugin/BasePlugin.ts:793+`.

Open risks:
- The ranked product APIs remain unchanged until their owning plans are
  accepted and executed.
- The large P0 set must be sequenced as two coherent foundation plans, not
  parallel local patches.
- Exact Table static-composition spelling remains deliberately unresolved; the
  owner plan must compare call sites without inventing a feature DSL.

Final score:
- simplicity: 94/100
- DX/AX: 92/100
- scalability: 92/100
- routing clarity: 97/100
- anti-machinery pressure: 98/100
- overall: 95/100

Timeline:
- 2026-07-23T10:35:08.697Z plan created.
- 2026-07-23: 44-rule classification, skill/routing/Vision repair, generated
  sync, current API audit, and agent-native closeout completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Closeout complete |
| Where am I going? | Plite extension P0 plan, then Plate plugin authoring P0 plan |
| What is the goal? | One durable best-API decision owner plus a current ranked API ledger |
| What have I learned? | The scalable answer is smaller public ownership, not more control machinery |
