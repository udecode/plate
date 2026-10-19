# staged plugin capability doctrine

Objective:
Repair staged plugin capability doctrine; done when source rules, Vision,
generated skills, reviewer, and forward test pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-staged-plugin-capability-doctrine.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:

- user expectation: `plate-next` and `plate-plugin-creator` must prefer repeated
  inferred `.extendApi()` / `.extendTx()` stages over new helper parameters,
  maximizing the removal of threaded `editor`, `api`, `read`, `tx`, options,
  and resolved type plumbing.
- observed miss: current rules reject some one-owner tx helpers but do not
  positively require staged capability ordering, dependent inference proof, or
  the lazy `context.api` publication rule discovered by the List experiment.
- owning skill/template/helper: durable API taste in `best-api` and Plate
  Vision; execution mechanics in `plate-next` and `plate-plugin-creator`.
- repair classification: reusable API doctrine plus worker-skill mechanics

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: binary source/sync/review gates apply
- improvement loop: patch durable doctrine and both worker owners, sync,
  source-audit, review, then forward-test on a real plugin shape.
- final score / loop closure: N/A: close only when every named gate passes

Completion threshold:

- Durable doctrine says capability dependency order should be expressed with
  repeated builder stages, later stages and required dependents consume the
  accumulated inferred surface, and new functions take domain inputs rather
  than editor/runtime plumbing by default.
- `plate-next` and `plate-plugin-creator` both encode the rule, including the
  active-transaction exception and lazy `context.api` publication caveat.
- `pnpm install` regenerates both named `SKILL.md` mirrors with matching text.
- Agent-native review has no accepted findings and an unseeded forward test
  independently recommends the staged pattern.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-staged-plugin-capability-doctrine.md` passes.

Verification surface:

- Exact source/mirror `rg` audit for staged builder, parameter-plumbing,
  dependency inference, active-view exception, and lazy extension access.
- `pnpm install` generated mirror sync.
- Agent-native reviewer parity map.
- Unseeded forward test against a real Plate plugin refactor scenario.
- `git diff --check` on the bounded doctrine packet.

Constraints:

- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.
- Do not edit the Table package in this packet.
- Preserve correctness: an active transaction must never be replaced with
  stale `editor.read` merely to remove a parameter.

Boundaries:

- Source of truth: latest user correction plus the passing staged List
  experiment in `BaseListPlugin`.
- Allowed edit scope: `.agents/rules/best-api.mdc`,
  `.agents/rules/plate-next.mdc`,
  `.agents/rules/plate-plugin-creator.mdc`,
  `.agents/skills/plate-plugin-creator/rules/typing.md`,
  `.agents/skills/plate-plugin-creator/rules/composition.md`,
  `docs/vision/plate.md`, generated named skill mirrors, and this plan.
- Derived skill scope: Plate plugin authoring and Plate Next package review.
- Non-goals: Table source repair, Core builder redesign, public package API
  changes, changesets, browser proof, commits, pushes, or PRs.

Output budget strategy:

- Read exact rule/vision files and bounded semantic ranges; use focused `rg`
  audits and capped reviewer output; never scan generated/build trees.

Blocked condition:

- Stop only if `pnpm install` cannot regenerate the named mirrors or a reviewer
  proves the staged rule would make active-transaction correctness impossible.

Repair state:

- repair_type: reusable API doctrine and worker-skill repair
- current_phase: closeout
- current_phase_status: complete
- next_phase: N/A
- goal_status: complete

Current verdict:

- verdict: encode staged capability composition, not parameter-threaded helpers
- confidence: high
- next owner: best-api doctrine, then both named worker skills
- reason: the List experiment proved inference and dependency propagation; its
  only lifecycle caveat is lazy API access from pre-publication extensions

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-staged-plugin-capability-doctrine.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact staged-builder, parameter-minimization, skill targets, and deferred Table boundary recorded above |
| Timed checkpoint parsed | no | N/A: no duration requested |
| Expectation restated | yes | Expectation section names the future behavior |
| Active goal checked | yes | Previous goal was complete; this matching goal was created |
| Named plan or skill read | yes | User supplied both named skills; required plugin-creator references, `best-api`, Vision, `autogoal`, and reviewer read |
| Owning source selected | yes | Durable owner chain and worker source rules listed above |
| Repair classification selected | yes | Reusable API doctrine plus worker mechanics |
| Safety conflict checked | yes | Active transaction correctness explicitly outranks parameter removal |
| Output budget strategy recorded | yes | Exact bounded reads/searches only |
| Agent-native pack selected | yes | Materialized in this plan |
| Agent-facing action surface identified | yes | Future package author/refactor decision inside both named skills |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `SKILL.md` with `pnpm install` |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read complete reviewer skill before edits |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified or marked N/A. `best-api` and Plate
      Vision own durable taste; named workers own execution mechanics.
- [x] Patch touches source-of-truth files only. Source rules and durable Plate
      Vision were edited; generated `SKILL.md` files changed only through
      `pnpm install`. Plugin-creator reference resources remain direct skill
      inputs, not generated mirrors.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
      This is Plate doctrine, not universal goal lifecycle.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded: exact doctrine, files, sync/review
      proof, and Table as the next separate packet.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | `best-api`, Plate Vision, `plate-next`, and `plate-plugin-creator` source owners patched |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | Final `pnpm install` passed; reviewer confirmed all three mirrors match their `.mdc` sources |
| Template smoke | no | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | N/A: no plan template changed |
| Incomplete-plan guard | no | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | N/A: no template/checker change |
| Completed-plan representability | no | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | N/A: worker/API doctrine repair, not a plan-shape repair |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no script changed |
| Autoreview / review | yes | Run applicable review gate or record N/A for docs-only/source-rule-only repair | Agent-native final review PASS with no actionable findings |
| Final lint | yes | Run scoped formatter/lint or record ignored-path/N/A reason | Prettier check and bounded `git diff --check` pass |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Reads/searches were bounded; one unsafe audit regex was immediately replaced with a literal bounded query |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-24-staged-plugin-capability-doctrine.md` | Pass recorded after final ledger closure |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Skiller applied successfully; exact mirrors confirmed |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | New rules found in both named generated skills and required plugin-creator references |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Four findings accepted/fixed; final verdict PASS |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | requirements, skills, references, Vision, and goal captured | target selection |
| Target selection | complete | durable owner chain and worker files selected | patch |
| Patch | complete | durable doctrine, worker rules, and plugin-creator references updated | verification |
| Verification | complete | sync, source/mirror audit, formatting, List proof, tx runtime probe, forward test, and reviewer pass | closeout |
| Closeout | complete | final contract filled and checker passes | final response |

Findings:

- Existing rules reject some one-owner `tx` helpers but still tell
  plugin-owned helper graphs to pass `api`/options/`tx`, which preserves the
  plumbing shape the user rejected.
- The List experiment proves repeated `.extendApi()` stages accumulate into
  later API/tx stages and required dependents.
- `extendExtension` factories run before API publication; eagerly destructured
  `api` can be empty. Runtime callbacks must resolve `context.api` lazily.
- The stale Plate Next instruction to pass plugin context into a helper was
  removed from both source and generated mirror.
- Staged API is for an honest scoped capability, not a private implementation
  fragment promoted merely to share code.
- A later tx stage must call an earlier mutation through active
  `tx[plugin.key]`; a portal one-shot would reopen the transaction.
- Operation options are valid domain inputs. Only resolved plugin-option values
  and other runtime plumbing are rejected helper parameters.

Decisions and tradeoffs:

- Prefer staged builder capabilities and domain-only method arguments.
- Keep private one-use machinery lexical and shared pure domain algorithms
  private; do not pollute the portal to avoid a helper.
- Keep active-state/view parameters only at an honest composition boundary
  when the same public query must run against an uncommitted transaction
  snapshot; never substitute stale `editor.read`.

Repair patch notes:

- `best-api` and Plate Vision now own the durable staged-capability principle.
- `plate-next` now flags plumbing-heavy helpers, prefers ordered builder stages,
  and records extension publication timing.
- `plate-plugin-creator` now teaches capability order, domain-only arguments,
  required-dependent proof, and the narrow active-state exception in both its
  source rule and required typing/composition references.
- Both workers teach active tx-to-tx reuse, lazy extension publication, and the
  proof required for each lifecycle.

Review fixes:

- Accepted: specify `tx[plugin.key].method(...)` for tx-to-tx reuse and add
  compile/runtime proof gates.
- Accepted: restrict staged publication to honest scoped capabilities; keep
  private fragments lexical/private or identify a builder gap.
- Accepted: distinguish valid operation options from resolved plugin-option
  plumbing.
- Accepted: add the new typing section to its contents and require extension
  runtime proof.
- Final agent-native re-review: PASS, no actionable findings.

Deliberate non-repairs:

- Table package source is the next packet, not part of skill repair.
- No Core generic change: the existing builder already proved accumulation and
  required-dependency inference.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Multi-file patch used one stale Plate Next context | 1 | Split into exact owner patches | Resolved with bounded patches; failed attempt changed no file |
| One audit regex used shell backticks inside a double-quoted command | 1 | Use a single-quoted literal regex | Resolved; rerun returned zero stale matches |

Verification evidence:

- `pnpm install` in `/Users/zbeyens/git/plate-2` -> lockfile already current;
  Skiller applied source rules to Claude/Codex mirrors successfully.
- Exact source/mirror audit -> staged-capability, domain-input, lazy
  `context.api`, and active-state wording present in all named owners.
- Stale Plate Next helper-plumbing audit -> 0 matches.
- Bounded `git diff --check` -> pass.
- Prettier check for changed Markdown/reference files -> pass.
- Independent agent-native review -> all three generated mirrors exactly match
  source; List typecheck 14/14; focused staged API tests 2/2; staged tx-to-tx
  runtime probe pass; final verdict PASS.
- Unseeded forward test on `BaseTablePlugin` -> independently selected ordered
  `createCell -> createRow -> create -> insert` stages, domain-only public
  arguments, lazy `context.api`, and focused inference/runtime proof.

Final repair handoff:

- Expectation: future plugin work stages honest inferred capabilities instead
  of threading editor/runtime plumbing through new function parameters.
- Repaired owner: `best-api`, Plate Vision, `plate-next`, and
  `plate-plugin-creator`.
- Files changed: three source rules, Plate Vision, two plugin-creator reference
  rules, three generated skill mirrors, and this repair plan.
- Verification: sync, exact source/mirror audit, formatting/diff checks,
  agent-native review, List type/runtime proof, tx-to-tx probe, and unseeded
  Table forward test pass.
- Caveat: Table source is intentionally unchanged; its first next packet is now
  source-backed.

Timeline:

- 2026-07-24T17:49:23.498Z Goal repair plan created.
- 2026-07-24 Source doctrine patched and Skiller mirrors regenerated.
- 2026-07-24 Four independent review findings accepted and repaired.
- 2026-07-24 Final agent-native review and Table forward test passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Complete |
| Where am I going? | Final handoff, then a separate Table packet |
| What is the goal? | Make future plugin work stage inferred capabilities instead of threading runtime plumbing |
| What have I learned? | Honest staged capabilities work; private fragments stay private; tx and extension lifecycle access must remain active/lazy |
| What have I done? | Patched and synced doctrine, closed four findings, and passed source, type, runtime, and forward-test proof |

Open risks:

- None in the doctrine packet. Table adoption remains deliberately separate.
