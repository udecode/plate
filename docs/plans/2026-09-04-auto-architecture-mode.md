# auto architecture mode

Objective:
Make `auto architecture` the single Plate/Plite architecture front door, with a bounded hostile design challenge, optional execution, and no user-managed worker chain.

Goal plan:
docs/plans/2026-09-04-auto-architecture-mode.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Cleanup source:
- type: repeated user workflow plus current Auto doctrine audit
- id / link: current Codex task history; no external ticket
- title: consolidate recurring harsh architecture review into Auto
- requested surface: `.agents/rules/auto.mdc`, its on-demand resources, and repo routing doctrine
- cleanup intent: delete user ceremony without merging internal worker ownership
- acceptance criteria: one invocation owns audit, challenge, planning, optional execution, proof, and final challenge delta

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A for this implementation; the new mode must parse `loop timed <duration>`
- semantics: one-shot implementation now; timed mode is an invocation contract, not this task's duration
- initial confidence / cleanliness score: 5/10; correct workers exist, but users must remember and re-prompt the chain
- improvement loop: maximum three design passes, with one replay when the hostile pass improves the target
- final score / loop closure: target 9/10 after source, mirror, routing, and forward-test proof

Completion threshold:
- `.agents/AGENTS.md` and Auto expose `auto architecture <scope>`, optional
  `execute`, and optional `loop timed <duration>` as one public workflow.
- Architecture mode starts from the ideal target, compares at least two
  materially different architectures, runs a hostile delete/merge/inline
  challenge, replays once if improved, caps design work at three passes, and
  reports the `challenge delta`.
- Auto loads architecture doctrine on demand instead of growing its already
  oversized entrypoint, while existing worker skills remain the internal owners.
- Architecture mode does not stop merely because `plite-plan` or `plate-plan`
  is the next worker; ordinary Auto retains its existing stop policy.
- Historical prompts that previously required repeated “harsh”, “best”, and
  manual worker routing resolve to one Auto architecture invocation.
- `pnpm install`, source/generated parity checks, skill validation,
  independent agent-native prompt replay, and this goal-plan checker pass.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-auto-architecture-mode.md`
  passes.

Verification surface:
- Source audit of Auto routing, architecture reference, stop rules, and
  `.agents/AGENTS.md` ownership table.
- Structural skill validation plus an independent behavioral prompt matrix for
  invocation parsing, progressive resource routing, bounded challenge, and
  architecture-mode stop behavior. Do not substitute wording-regex tests.
- `pnpm install` followed by exact source/generated mirror comparison.
- Agent-native reviewer forward tests using representative historical prompts.
- Browser/package/runtime proof: N/A; only agent workflow instructions change.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: `.agents/rules/auto.mdc`, `.agents/rules/auto/**`, and `.agents/AGENTS.md`
- Allowed edit scope: Auto source/resources/tests, routing doctrine, generated mirrors via `pnpm install`, and this plan
- Plite / Plate boundary: one shared architecture front door; Plite and Plate plans retain their separate accepted-plan ownership
- Public API boundary: agent invocation syntax only; no Plate/Plite runtime or package API changes
- Browser surface: N/A; no visible product surface changes
- Package/API surface: N/A; no package exports or runtime source changes
- Non-goals: merging worker skills, adding a wrapper skill, model selection, product implementation, external messages, git publication

Output budget strategy:
- Inspect named Auto/routing owners and capped generated mirrors only. Use
  heading/range searches and focused tests; do not rescan all task histories or
  stream generated trees.

Blocked condition:
- Stop only if source generation cannot carry on-demand resources or if the
  invocation contract cannot preserve existing Auto routing without an
  incompatible doctrine decision.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: high
- current_phase: phase 3 - proof and closure
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:
- verdict: replace manual orchestration with an Auto mode; retain workers as private owners
- cleanliness confidence: 9/10 after independent forward review
- next owner: Auto, delegating internally to existing architecture workers
- keep / revert / quarantine call: keep all four packets
- reason: the workflow is recurring and measurable; a new wrapper would duplicate routing and violate repo skill topology

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-auto-architecture-mode.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Objective, threshold, boundaries, phases, and final handoff below |
| Timed checkpoint parsed | yes | Current task is one-shot; new invocation accepts `loop timed <duration>` |
| `architecture-cleanup` loaded | yes | Read complete source skill before planning |
| Active goal checked or created | yes | Active goal points to this plan |
| Source of truth read before analysis | yes | Auto source, repo routing doctrine, and generated mirror inspected |
| VISION fit gate read | yes | Root VISION and common vision doctrine support one ergonomic front door with private owners |
| Plite / Plate boundary selected | yes | Shared audit/challenge; accepted adoption remains in each layer plan |
| Cleanup surface selected | yes | Auto entrypoint, on-demand resources, tests, and routing doctrine |
| Non-goals recorded | yes | See Boundaries |
| Output budget strategy recorded | yes | See Output budget strategy |
| Implementation authority decided | yes | User said “ok go” after reviewing the three-phase proposal |
| Proof strategy selected | yes | Focused source/test/mirror/forward-test proof, then plan checker |
| Runtime scale applicability resolved | yes | N/A: zero-runtime agent instruction topology only |
| Agent-native pack selected | yes | Agent-native pack attached at plan creation |
| Agent-facing action surface identified | yes | `auto architecture <scope> [execute] [loop timed <duration>]` |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` and other mirrors with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read complete source skill before implementation |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks at least five candidates unless the prompt names a
      smaller surface.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; missing reusable taste routes to `vision` or
      `sync-vision`.
- [x] Implementation packets are product-behavior-neutral and package-API-neutral, narrow,
      reversible, and have focused proof.
- [x] Every hot-owner packet has a frozen pre-packet scale receipt and exact
      post-packet production rerun plus correctness guard; N/A because no
      runtime owner changed.
- [x] Each implementation packet ends keep, revert, or quarantine.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded.
- [x] Focused proof is run before broad proof for changed workflow code.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed.
- [x] Agent-native pack: all three agent-native review findings were fixed and the final replay passed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Plate Next validate, resource check, focused suites, and six-prompt replay pass |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | Source map below |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Deslop inventory below |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Seven ranked candidates |
| Agent-navigation score complete | yes | Record before/after files-to-read, owner, and proof clarity | Navigation score below |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost | Default Auto load fell from 1,473 to 113 lines; resources have distinct mode owners |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Manual chain and premature stops deleted; wrapper and monolith append rejected |
| VISION fit gate | yes | Confirm fit to VISION.md | One ergonomic front door with private canonical owners matches current doctrine |
| Implementation packet gate | yes | Record keep/revert/quarantine and focused proof | P1-P4 kept |
| Hot-owner scale preservation | N/A | Resolve runtime scale | Agent instructions only; zero product/runtime work |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves | Sync resources, exact required-skill parity, and Benchmark owner test repaired |
| Public API / behavior safety gate | yes | Prove no package API/product behavior changed | Changed paths are agent rules, mirrors, doctrine version, generator/test, and plan only |
| Package/API proof | N/A | Run package proof when boundaries changed | No package source/export boundary changed |
| Browser proof | N/A | Run browser proof when visible behavior changed | No product UI changed |
| Final lint/check | yes | Run focused checks appropriate to touched files | Node syntax, 14 Plate Next tests, and 22 Benchmark tests pass; Ultracite excludes `.agents` paths |
| Output budget discipline | yes | Verify capped output | Searches used named owners, bounded ranges, and capped result counts |
| Timed checkpoint | N/A | Honor requested task duration | Current implementation was one-shot; timed syntax was forward-tested |
| Final handoff contract | yes | Fill changed list, counts, proof, review, risks, and next owner | Sections below complete |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-auto-architecture-mode.md` | Run after this update |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | Skiller apply passed; Plate Next v140 validate and resource parity pass |
| Agent action discoverability | yes | Source-audit the path a fresh agent reads | Root Auto is 113 lines and directly routes to the 200-line architecture resource |
| Agent-native review | yes | Close accepted findings | Three findings fixed; final six-prompt matrix passed with no P0-P2 |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| 1. Progressive disclosure | complete | Auto entrypoint is 113 lines; its unchanged 1,473-line broad quality procedure loads only for that mode | P2 |
| 2. Architecture mode | complete | 200-line architecture resource owns audit, challenge, three-phase adoption, delegated execution, and handoff | P3 |
| 3. Proof and closure | complete | v140 validation, exact mirrors/resources, focused suites, and six-prompt hostile replay pass | closeout |

Source map:
- Public routing owner: `.agents/AGENTS.md` and its generated root `AGENTS.md` block.
- Default skill entrypoint: `.agents/rules/auto.mdc`, reduced from 1,473 lines to 113.
- Architecture procedure: `.agents/rules/auto/references/architecture.md`, 200 lines and loaded only for architecture mode.
- Broad quality procedure: `.agents/rules/auto/references/quality-loop.md`, 1,473 preserved lines and loaded only for broad quality mode.
- Private decision owners: Architecture Cleanup, Plate Review, Best API, Benchmark, Editor Audit, Plite Plan, and Plate Plan; package workers implement accepted packets.
- Goal/authority owners: Auto keeps one goal; Architecture Cleanup, Editor Audit, Plate Plan, and Plite Plan now honor delegated supervisor scope and mutation authority.
- Generation/proof owners: `sync-resources.mjs`, `version.mjs`, Plate Next v140 history, and Benchmark's routing contract suite.
- Package exports, browser routes, and product runtime: N/A; untouched.

Deslop inventory:
- The old Auto entrypoint mixed routing with every quality, browser, issue-harvest, release, and closeout procedure.
- Broad architecture required users to remember a four-to-seven-worker chain and ask again whether the first answer was actually best.
- Auto's old stop rule and both layer plans could return a user-invocation chore or create a second goal.
- Editor Audit could block audit-only Auto before private layer planning.
- Architecture Cleanup advertised audit mode without defining read-only authority.
- The first local proof attempt matched phrases with regexes; it was deleted because it tested wording, not agent behavior.
- The long quality-loop resource remains intact because it is one coherent broad-supervisor mode; splitting it further on size alone would add navigation without a proven owner.

Agent-navigation score:
- Before: one 1,473-line default skill, four to seven user-visible worker nouns, multiple goals, and two or more user turns for challenge plus adoption.
- After: one 113-line entrypoint, one 200-line architecture resource, one public invocation, one goal, and only applicable private workers loaded from scoped evidence.
- Proof clarity improved from prose handoffs to exact source/generated parity plus six fresh-agent routing/authority cases.

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | strongest | Add `auto architecture` with an on-demand architecture kernel | Auto source/resource/routing | Auto is already the front door and private worker router | user: 1 entrypoint; worker ownership unchanged; proof explicit | implement | Auto | generated parity plus forward prompts | simplify + split |
| 2 | strong supporting | Extract conditional Auto procedures into routed references | Auto source/resources | 1,473-line entrypoint loads unrelated modes every run | fewer default files/tokens; stable named resources | implement only durable mode owners | Auto | source/mirror parity and routing assertions | split |
| 3 | weak | Keep manual `architecture-cleanup -> best-api -> plite/plate-plan` chain | routing docs | repeated history shows users must re-ask whether the answer is actually best | 4-6 learned owners and multiple turns | remove from user-facing workflow | Auto | historical prompt replay | delete |
| 4 | weak | Append architecture instructions to the current monolith | Auto source | fastest edit, but worsens context cost and hides mode boundaries | one huge file; poor proof isolation | reject | Auto | line/resource audit | reject |
| 5 | invalid | Create a new architecture-supervisor wrapper skill | new skill plus routing | duplicates Auto and violates explicit repo topology law | another noun and owner for users/agents | reject | Auto | topology source audit | reject |
| 6 | invalid | Add `harsh`, `best`, editor-name, benchmark, or model flags | invocation grammar | these are quality/evidence requirements, not user-managed modes | more syntax and future drift | infer from scope and evidence needs | Auto | behavioral prompt replay | reject |
| 7 | harmful | Keep architecture mode's stop when a layer plan is next | Auto stop rules | recreates the exact ceremony being removed | extra user turn and manual routing | delete only inside architecture mode | Auto | source audit plus execute/audit prompt replay | delete |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Scale receipt / N/A | Result | Next |
|--------|--------|-------|-------|-------|---------------------|--------|------|
| P1 | progressive source split | Auto | `.agents/rules/auto.mdc`, `.agents/rules/auto/references/**` | resource routing and preservation audit | N/A: instructions only | kept: 113-line router plus mode resources | P2 |
| P2 | architecture mode contract | Auto with private worker routing | Auto, Cleanup, Editor Audit, Plate Plan, Plite Plan | six-prompt behavioral replay | N/A: instructions only | kept after three authority/continuity fixes | P3 |
| P3 | public routing and generation | repo doctrine/generator | `.agents/AGENTS.md`, v140, generated mirrors | `pnpm install`, exact parity, focused suites | N/A: instructions only | kept | P4 |
| P4 | adversarial forward review | agent-native reviewer | current generated skills and representative prompts | final matrix passed; no P0-P2 | N/A: instructions only | kept | closeout |

Cleanup counts:
- delete: 3 (manual public worker choreography, premature architecture-mode user handoff, regex-only wording test)
- merge: 0
- inline: 0
- simplify: 4 (public invocation, single goal, inherited authority, private plan continuity)
- split: 2 durable mode resources (architecture and broad quality)
- keep: 7 private architecture/evidence owners plus package implementers
- defer: 0
- reject: 3 (new wrapper, monolith append, user flags)
- plan: 4 packets, all kept

Changed list:
- code/runtime/API: N/A; no product/runtime/package source or API changed
- tests/oracles: Benchmark routing test follows the moved quality owner; Plate Next exact-skill validation now covers Architecture Cleanup, Auto, Editor Audit, Plate Plan, and Plite Plan
- docs/plans: this closure plan and Plate Next doctrine v140 history
- skills/workflow: Auto router/resources, repo routing, delegated worker authority, generated skills/resources, and shared resource sync
- reverted/quarantined: regex-only architecture wording test deleted; no runtime packet quarantined

Needs review:
- None at P0-P2. Independent replay covered progressive loading, private handoffs, audit/execute authority, timed read-only mode, direct Benchmark routing, and narrow Patch routing.

Open risks:
- Low: genuinely ambiguous natural-language scope can still be misclassified;
  explicit leading modes and the six-case forward matrix cover the known paths.

Verification evidence:
- `pnpm install` passed and regenerated source-owned skills/resources.
- `node .agents/rules/plate-next/scripts/version.mjs validate --json` passed at doctrine v140 with 2 active and 44 retired packages.
- `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` reported exact resources.
- `node --test .agents/rules/plate-next/scripts/version.test.mjs` passed 14/14.
- `node --test .agents/rules/benchmark/scripts/benchmark-contract.test.mjs` passed 22/22; the generated copy also passed 22/22 before the final unrelated authority edit, and exact resource parity remains green.
- `node --check` passed for the three changed JavaScript owners.
- Global `quick_validate.py` is N/A: it rejects repo-supported Skiller frontmatter keys `argument-hint` and `disable-model-invocation`; repo-native Skiller apply and exact version/resource validation passed instead.
- Independent agent-native replay passed all six cases with no remaining P0-P2: large-text plus four editor comparators, selection API, Plate plugin execute, Plite timed audit, explicit Benchmark, and one narrow selection bug.
- Browser/package/runtime proof: N/A; no product surface changed.

Final handoff contract:
- Source roots inspected: Auto, repo routing, Vision, private architecture workers, generation, version, and Benchmark proof owners.
- Candidate count and top recommendation: seven; keep one Auto architecture mode with on-demand doctrine.
- Cleanup counts: 3 delete, 0 merge, 0 inline, 4 simplify, 2 split, 7 private owners kept, 0 defer, 3 reject.
- Agent-navigation score changes: default context 1,473 to 113 lines; user workflow multiple nouns/goals/turns to one invocation and goal.
- Packets applied with keep/revert/quarantine result: P1-P4 kept.
- Proof commands/source audits: all commands and outcomes recorded above.
- Hot-owner pre/post scale receipts or source-backed zero-runtime N/A: N/A; instruction-only change.
- Rejected/deferred candidates: rejected new wrapper, monolith append, and user quality/model flags; no defers.
- Needs-review list: none at P0-P2.
- Residual risks: natural-language agents can still misclassify genuinely ambiguous scope; explicit leading modes and six forward cases bound the known risk.
- Next owner and exact first command/file: Auto; `.agents/rules/auto.mdc`, then its selected on-demand resource.

Timeline:
- 2026-09-04T10:00:11.090Z Architecture-cleanup goal plan created.
- 2026-09-04 First checkpoint completed; explicit invocation, challenge, phase, proof, boundary, and handoff requirements recorded before source edits.
- 2026-09-04 Auto split into a 113-line router, 200-line architecture resource, and preserved on-demand quality loop.
- 2026-09-04 Agent-native review found and closed three authority/continuity defects; final six-prompt replay passed.
- 2026-09-04 Plate Next doctrine v140, generated mirrors/resources, version suite, Benchmark suite, and syntax checks passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure complete |
| Where am I going? | Final goal checker, then user handoff |
| What is the goal? | Make `auto architecture` the single architecture front door without duplicating worker ownership |
| What have I learned? | One front door works only when every private worker inherits the same goal and exact mutation authority |
