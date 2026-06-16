# Skill Topology Cleanup

Objective:
Clean skill topology; done when local source routing is patched, redundant
global skills are removed or quarantined, mirrors sync, and audits pass.

Goal plan:
docs/plans/2026-06-16-skill-topology-cleanup.md

Template:
docs/plans/templates/goal-repair.md

Primary template:
docs/plans/templates/goal-repair.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Expectation:
- user expectation: apply the agreed skill cleanup now.
- observed miss: too many visible entrypoints and overlapping Slate AR/status
  wrappers make the agent ask for routing instead of routing itself.
- owning skill/template/helper: `.agents/AGENTS.md`, `.agents/rules/slate-auto.mdc`,
  `.agents/rules/slate-ar.mdc`, Slate AR/Auto templates, and global npx skill
  registry entries.
- repair classification: agent-native topology cleanup.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: user said go, no duration.
- semantics: N/A.
- initial confidence score: N/A.
- improvement loop: N/A.
- final score / loop closure: N/A.

Completion threshold:
- The visible routing doctrine has five primary user-facing entrypoints:
  `slate-auto`, `maintainer`, `sync-vision`, `openclaw-sync`, and `autoreview`;
  `autogoal` remains the lifecycle kernel, not a routing brain.
- `slate-auto` explicitly routes worker skills so the user should not need to
  name them.
- `slate-ar-perf` policy is merged into `slate-ar` / `slate-auto` routing and
  the separate local skill source is removed.
- `status` and `continue` local skill wrappers are removed or demoted out of
  the visible repo-local skill set.
- Reviewer swarm skills are hidden behind `autoreview` as review lenses, not
  normal user-facing entrypoints.
- Global npx skills `github-triage`, `dev-browser`, `react-useeffect`,
  `vercel-react-best-practices`, `to-prd`, `to-issues`, `ralplan`, and
  `domain-model` are removed from the active global install or quarantined with
  evidence.
- Repair closure is legal only when the source owner is patched, generated
  skills are synced when `.agents/rules/**` changed, a source audit proves the
  repair text exists, the repaired template or rule is smoke-checked, deliberate
  non-repairs are recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-skill-topology-cleanup.md` passes.

Verification surface:
- `pnpm install` regenerates local skill mirrors after `.agents/rules/**`
  changes.
- Source/generated audits prove `slate-ar-perf`, `status`, and `continue`
  no longer exist as local generated skill mirrors.
- Source audits prove perf routing now names `slate-ar` perf mode and
  `slate-auto` worker routing.
- Global skill directory and lock audits prove the eight external npx
  entrypoints are inactive or quarantined.
- `check-complete.mjs` passes for this plan.

Constraints:
- Repair one expectation narrowly.
- Patch source-of-truth files, not generated skill mirrors.
- Do not weaken evidence safety or completion gates just to reduce annoyance.
- Do not broaden the repair to unrelated skills/templates.

Boundaries:
- Source of truth: latest `autogoal repair <expectation>` request.
- Allowed edit scope: `.agents/AGENTS.md`, `.agents/rules/**`, relevant
  `docs/plans/templates/**`, this plan, and `/Users/zbeyens/.agents` install
  registry/directories for the named global npx skills.
- Derived skill scope: local Plate/Slate skill routing and local generated
  mirrors only.
- Non-goals: runtime Slate/Plate code, public docs, package API, commits,
  pushes, PRs, deleting unrelated skills, or changing plugin-provided bundled
  skills.

Output budget strategy:
- Use targeted `rg -n 'slate-ar-perf'`, direct `sed` slices, and exact global
  skill names. No broad full-skill dump except capped reads of directly owned
  source files.

Blocked condition:
- Stop only if a named global skill cannot be removed/quarantined without
  losing its source evidence, `pnpm install` fails in a way unrelated to this
  cleanup, or local source/generation creates an inconsistent skill mirror.

Repair state:
- repair_type: topology_cleanup
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready_to_close

Current verdict:
- verdict: repaired
- confidence: high after source/generated/global audits.
- next owner: final response
- reason: local wrapper skills are gone, perf policy is in `slate-ar`, and
  global duplicate entrypoints are inactive.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final repair evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-skill-topology-cleanup.md` passes.
- Do not create hook state for this repair. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | This first checkpoint lists every requested cleanup item as completion rows. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Expectation restated | yes | Expectation section restates entrypoint cleanup and overlap removal. |
| Active goal checked | yes | `get_goal` returned no active goal; `create_goal` created this cleanup goal. |
| Named plan or skill read | yes | Read `skill-cleaner`, `autogoal`, `slate-auto`, `slate-ar`, `slate-ar-perf`, `status`, and `continue` source. |
| Owning source selected | yes | `.agents/AGENTS.md`, `.agents/rules/slate-auto.mdc`, `.agents/rules/slate-ar.mdc`, templates, and global npx registry. |
| Repair classification selected | yes | Agent-native topology cleanup. |
| Safety conflict checked | yes | No runtime/package scope; global removals will quarantine directories and remove lock entries. |
| Output budget strategy recorded | yes | Targeted exact-name reads/searches only. |
| Agent-native pack selected | yes | `.agents/**` and skill registry behavior changes. |
| Agent-facing action surface identified | yes | Future visible skill list and Slate Auto routing. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**` only, then run `pnpm install`; never hand-edit generated mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no actionable agent-native finding. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Expectation and observed miss are stated with source evidence.
- [x] Primary owner selected: runtime plan, template, skill rule, or
      helper/checker.
- [x] Secondary owners are justified or marked N/A.
- [x] Patch touches source-of-truth files only.
- [x] Derived skill vs generic `autogoal` ownership decision is recorded.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Deliberate non-repairs are recorded.
- [x] Final response shape is recorded.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source owner patched | yes | Patch the selected source owner or record runtime-plan-only repair | Patched `.agents/AGENTS.md`, `.agents/rules/slate-auto.mdc`, `.agents/rules/slate-ar.mdc`, `.agents/rules/slate-research.mdc`, `.agents/rules/slate-patch.mdc`, and Slate AR/Auto templates; deleted source wrappers for `slate-ar-perf`, `status`, and `continue`. |
| Generated skill sync | yes | If `.agents/rules/**` changed, run `pnpm install` and verify generated `SKILL.md` sync | `pnpm install` passed; generated audits found no `slate-ar-perf`, `status`, or `continue` mirrors. |
| Template smoke | yes | Instantiate the repaired template or inspect it directly when a smoke plan would create noise | Direct template audit shows Slate AR and Slate Auto templates route perf to `slate-ar perf`. |
| Incomplete-plan guard | no | Verify an unfinished generated plan still fails `check-complete.mjs`, or record N/A with reason | N/A: no template/checker logic changed; this cleanup changed routing source and generated mirrors. |
| Completed-plan representability | yes | Verify the repaired expectation can be recorded in a completed plan without editing the template again, or record N/A | This plan records the repaired expectation and closeout evidence without template changes beyond routing text. |
| Helper/checker tests | no | If scripts changed, run focused script tests; otherwise N/A | N/A: no scripts changed. |
| Autoreview / review | no | Run applicable review gate or record N/A for docs-only/source-rule-only repair | N/A: no runtime implementation diff; agent-native review covered the agent-facing surface. |
| Final lint | no | Run scoped formatter/lint or record ignored-path/N/A reason | N/A: markdown/rule-only cleanup; `pnpm install` and source audits were the relevant gates. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were exact-name `rg`/`sed` slices with capped output. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-16-skill-topology-cleanup.md` | Final mechanical gate run after this closeout update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; source/generated audits passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Root and local AGENTS list primary entrypoints; generated `slate-auto` and `slate-ar` mirrors contain worker routing/perf mode. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded reviewer; no actionable finding because agent routing is discoverable from AGENTS and generated skill mirrors. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake | complete | Plan filled with explicit cleanup requirements. | target selection |
| Target selection | complete | Owners selected from local source refs and global lock. | patch |
| Patch | complete | Source rules, templates, global lock, and global skill dirs updated. | verification |
| Verification | complete | `pnpm install`, mirror audits, global inactive/lock audits, JSON parse, and agent-native review passed. | closeout |
| Closeout | complete | This plan records changed files, evidence, caveats, and final handoff shape. | final response |

Findings:
- `slate-ar-perf` has separate local source plus refs from `slate-ar`,
  `slate-auto`, `slate-research`, `slate-patch`, and templates.
- `status` and `continue` are local generic wrappers; their behavior belongs in
  autogoal plans and supervisor routing.
- The eight external npx skills are active via `/Users/zbeyens/.agents/skills`
  and `/Users/zbeyens/.agents/.skill-lock.json`.

Decisions and tradeoffs:
- Quarantine global skill directories instead of hard deleting them, while also
  removing lock entries. This removes them from active use and keeps evidence
  recoverable.

Repair patch notes:
- `.agents/AGENTS.md` now defines the five primary user-facing entrypoints and
  hides reviewer lenses behind `autoreview`.
- `slate-ar` now owns perf mode and imported the target registry, plateau,
  exactness, pagination, and huge-document target policy from `slate-ar-perf`.
- `slate-auto`, `slate-patch`, `slate-research`, and templates route perf to
  `slate-ar perf`.
- Deleted source wrappers `.agents/rules/slate-ar-perf.mdc`,
  `.agents/rules/status.mdc`, and `.agents/rules/continue.mdc`.
- Removed the eight named external npx skills from
  `/Users/zbeyens/.agents/.skill-lock.json` and moved their directories to
  `/Users/zbeyens/.agents/skills.disabled/2026-06-16-skill-topology-cleanup/`.

Deliberate non-repairs:
- Did not delete reviewer persona skills from plugin/generated roots; they are
  still valid lenses behind `autoreview`.
- Did not remove plugin/bundled browser or React skills; only the named global
  npx duplicates were removed from active global install.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm install` passed and regenerated local skill mirrors.
- `rg -n "slate-ar-perf" .agents/rules .agents/skills .agents/AGENTS.md AGENTS.md docs/plans/templates` returned no active source/generated/root/template refs.
- `rg --files .agents/rules .agents/skills | rg '(^|/)slate-ar-perf(/|$)|(^|/)status(/|$)|(^|/)continue(/|$)|(^|/)status\\.mdc$|(^|/)continue\\.mdc$'` returned no local source/generated paths.
- Global inactive audit reported all eight named external npx skills inactive
  under `/Users/zbeyens/.agents/skills`.
- Global lock audit found none of the eight names in
  `/Users/zbeyens/.agents/.skill-lock.json` or active global skill dirs.
- `node -e "JSON.parse(...)"` parsed `/Users/zbeyens/.agents/.skill-lock.json`.
- Quarantine listing contains all eight moved global skill dirs.
- Source/generated audit found primary entrypoints, Slate Auto worker routing,
  and Slate AR perf mode in source and generated mirrors.

Final repair handoff:
- Expectation: reduce skill topology so agents route work instead of requiring
  user micro-routing.
- Repaired owner: `.agents/AGENTS.md`, Slate AR/Auto/Patch/Research rules and
  templates, plus global npx skill registry state.
- Files changed: local agent rules/templates/AGENTS, generated mirrors/root
  AGENTS via `pnpm install`, this plan, and global `.skill-lock.json` plus
  quarantined global skill dirs.
- Verification: `pnpm install`, source/generated audits, global inactive/lock
  audits, JSON parse, quarantine listing, and agent-native review passed.
- Caveat: the current Codex session's system-provided skill list was loaded
  before global npx removal, so future sessions are the real active-skill
  proof.

Timeline:
- 2026-06-16T19:17:20.851Z Goal repair plan created.
- Filled requirement-extraction checkpoint before source edits.
- Patched local source owners and deleted redundant local source wrappers.
- Removed global npx lock entries and quarantined their directories.
- Ran `pnpm install` to sync generated mirrors.
- Ran source/generated/global audits and agent-native review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Reduce visible skill topology and make slate-auto route workers. |
| What have I learned? | See Findings |
| What have I done? | Patched source, synced mirrors, removed/quarantined global npx entries, and verified. |

Open risks:
- Future sessions must reload the skill list to reflect global npx removal.
- Quarantine is reversible; if one of the removed global skills is explicitly
  needed later, restore it deliberately rather than letting it stay as a hidden
  default entrypoint.
