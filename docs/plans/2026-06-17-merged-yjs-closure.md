# merged yjs closure

Objective:
Close merged Yjs work until no accepted actionable autoclosure findings remain.

Goal plan:
docs/plans/2026-06-17-merged-yjs-closure.md

Template:
docs/plans/templates/autoclosure.md

Primary template:
docs/plans/templates/autoclosure.md

Applied packs:
- none

Closure source:
- type: user-invoked autoclosure
- prompt / link: `ok go $autoclosure the merged yjs`
- target kind: post-merge/current-tree Yjs surface, to be resolved from recent git history and changed files
- target ref / surface: `34cf20ab64 feat(yjs): add indexeddb provider (#5027)`
- base / comparison: `34cf20ab64^..34cf20ab64`
- current tree scope: Yjs merge commit reviewed/proved in detached worktree `/Users/zbeyens/git/plate-2-yjs-autoclosure`; this checkout's unrelated agent-skill dirty files are outside the Yjs closure target except this plan
- completion threshold summary: zero accepted actionable closure/review findings, focused proof green or N/A with reason, generated/docs/API rows closed, and check-complete green

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: target, scope, non-goals, stop
  conditions, deliverables, final handoff sections, verification surfaces, and
  success criteria.
- Do not continue into closure work until this extraction is complete or marked
  N/A with reason.
- Extracted requirements:
  - use `autoclosure` for the merged Yjs work;
  - treat this as loop-until-clean closure, not a single review pass;
  - isolate the Yjs merge surface before proof/review;
  - patch safe issues found during closure;
  - rerun focused proof and autoreview after material fixes;
  - do not commit, push, open PRs, release, publish, merge, or mutate public GitHub without explicit user authority;
  - stop only when clean, blocked by unavailable proof/authority, or routed to a broader owner;
  - final handoff must include target basis, changed list, commands, accepted/rejected findings, review attention, residual risks, stopping checkpoints, and goal result.

Completion threshold:
- Clean state: the merged Yjs surface is coherent with `VISION.md`, `.agents/AGENTS.md`, package/API/docs boundaries, focused proof passes or is marked N/A with reason, `autoreview` has zero accepted/actionable findings after the last material fix, and no speculative half-patch remains.
- Clean is legal only when there are zero accepted actionable review findings,
  required focused proof after the last patch is green or N/A with reason,
  architecture/docs/API/generated-output rows are closed, review-attention and
  residual-risk rows are filled, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-merged-yjs-closure.md`
  passes.
- For risky public API, agent-rule, package-boundary, or broad refactor diffs,
  require two consecutive clean closure passes after the last patch.

Verification surface:
- source audits: recent git history, current diff, Yjs files, exports/barrels, docs/examples, tests, generated outputs, and owner boundaries.
- focused tests/type checks: `pnpm install`, Yjs package typecheck/test commands selected from package scripts, provider focused tests, docs/source audits, and `pnpm brl` only if export/barrel generation requires it.
- browser proof: docs are changed, but no user-visible app route behavior is changed by the provider package itself; browser proof is N/A unless docs build/import proof exposes route breakage.
- generated-output sync: `pnpm install` when `.agents/rules/**` changed; `pnpm brl` when package exports/barrels changed; other generated outputs only when target map shows them.
- review: run `autoreview` in the target mode that matches the resolved Yjs surface; fix or reject findings with source evidence; rerun after material fixes until clean.
- architecture cleanup: invoke only if closure finds source-shape/deslop/agent-navigation friction; otherwise record N/A.

Constraints:
- Closure target is already-landed/current-tree/branch work; do not expand into
  broad quality/perf/research unless a row routes to `auto`.
- Patch safe findings; route public API/runtime/product forks to
  `slate-plan`, `plate-plan`, or `major-task`.
- Do not commit, push, open PRs, merge, release, publish, or mutate public
  GitHub unless explicitly authorized.
- Do not call stale, speculative, or out-of-scope review findings accepted.
- Do not leave dirty speculative half-patches.

Boundaries:
- Source of truth: root `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `docs/vision/plate.md`, `.agents/AGENTS.md`, live source/tests/docs in current checkout, and resolved Yjs merge/diff.
- Allowed edit scope: safe closure fixes in Yjs-related source/tests/docs/generated outputs plus this plan.
- Target diff/tree scope: `.changeset/yjs-indexeddb-provider.md`, `content/docs/(plugins)/(collaboration)/yjs*.mdx`, `docs/plans/2026-06-15-4650-indexeddb-yjs-provider.md`, `packages/yjs/**`, and `pnpm-lock.yaml` from `34cf20ab64^..34cf20ab64`.
- Browser surfaces: docs route `/docs/yjs` content changed, but closure proof is source/docs/package focused unless docs compile/import fails.
- Package/API surfaces: `@platejs/yjs` dependency, provider registry/types, IndexedDB provider wrapper, provider init behavior, README, and changeset.
- Agent/skill surfaces: this plan only unless target map shows `.agents/**` changes relevant to closure.
- Docs/generated-output surfaces: pending target map.
- Non-goals: no broad Yjs architecture redesign, no release/publish/PR/commit, no public GitHub mutation, no unrelated repo-wide cleanup unless it blocks Yjs closure.

Blocked condition:
- Stop only for missing Yjs target basis after reasonable git/source search, unavailable required proof, required commit/push/PR/release/public mutation authority, a taste/API decision not covered by `VISION.md`, or a broad architecture fork that cannot be safely closed as a small packet.

Closure state:
- target_kind: pending
- target_ref: 34cf20ab64
- base_ref: 34cf20ab64^
- loop_count: 0
- last_patch_loop: pending
- consecutive_clean_passes: 0
- clean_required_passes: pending
- current_pass: checkpoint-zero
- current_pass_status: in_progress
- next_pass: target-map
- goal_status: active

Current verdict:
- verdict: pending
- confidence: pending
- next owner: autoclosure
- clean / patch / reject / route call: pending
- reason: pending

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-merged-yjs-closure.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | extracted in First checkpoint |
| `autoclosure` source rule read | yes | read `.agents/skills/autoclosure/SKILL.md` |
| `vision` / root `VISION.md` read | yes | read `VISION.md`, `docs/vision/common.md`, `docs/vision/slate.md`, `docs/vision/plate.md` |
| `.agents/AGENTS.md` routing read | yes | read `.agents/AGENTS.md` |
| Active goal checked or created | yes | created goal `Close merged Yjs work until no accepted actionable closure findings remain; plan docs/plans/2026-06-17-merged-yjs-closure.md.` |
| Target kind resolved | yes | commit target `34cf20ab64` found from Yjs history; current `slate-v2` branch does not contain it |
| Base/comparison resolved or marked N/A | yes | use `34cf20ab64^..34cf20ab64`; detached proof worktree `/Users/zbeyens/git/plate-2-yjs-autoclosure` |
| Output budget strategy recorded | yes | use capped `git`/`rg` output, write large findings to plan/artifacts, avoid streaming huge diffs |
| Public authority boundary recorded | yes | no commit/push/PR/release/publish/merge/public mutation without explicit authority |
| Browser proof decision recorded | yes | docs-only route content touched; no app/editor interaction changed, browser proof N/A unless docs/build proof fails |
| Package/API proof decision recorded | yes | `@platejs/yjs` package API changed; run install, focused package tests/typecheck, export/source audits |
| Agent/rule/generated-output sync decision recorded | yes | no `.agents/rules/**` in target; package exports/barrels checked by source audit and `pnpm brl` only if package export generation requires it |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, target,
      scope boundary, stop condition, deliverable, final handoff section,
      verification surface, and success criterion is copied into this plan.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Target map records changed files, untracked files, generated outputs,
      packages, docs, tests, examples, agent rules, and browser surfaces in
      scope, or N/A with reason.
- [ ] Coherence audit checks stale dirty fixes, fake aliases, docs/API mismatch,
      orphan tests, stale generated output, weak proof commands, and
      Slate-vs-Plate boundary drift.
- [ ] Focused proof is run for each changed behavior/API/docs/generated surface,
      or marked N/A with reason.
- [ ] `autoreview` target mode is selected from actual target state.
- [ ] Each accepted `autoreview` finding is fixed or rejected with source-backed
      reason.
- [ ] Affected proof is rerun after every accepted finding fix.
- [ ] `autoreview` is rerun after material fixes until zero accepted actionable
      findings remain.
- [ ] `architecture-cleanup` is invoked when review/coherence finds source-shape,
      deslop, over-split, fake-wrapper, or agent-navigation issues, or marked
      N/A with reason.
- [ ] Public API/runtime/product forks are routed to `slate-plan`, `plate-plan`,
      `major-task`, or owner, not patched blindly.
- [ ] Generated outputs are synced when source owners require it, or marked N/A.
- [ ] Browser proof is run for browser-visible app/docs/package behavior, or
      marked N/A with reason.
- [ ] Package/API checks and changeset decision are recorded when packages or
      exports changed, or marked N/A.
- [ ] Docs/examples/source-backed claim audit is run when docs/examples changed,
      or marked N/A.
- [ ] Agent-native review is run for `.agents/**`, skills, hooks, commands,
      prompts, or user-action tooling, or marked N/A.
- [ ] Needs-your-attention list is ranked and capped at five items.
- [ ] Stopping checkpoints are queued or marked none.
- [ ] Changed list is current and includes only this closure run.
- [ ] No dirty speculative half-patch remains: every packet is kept, reverted,
      quarantined, or routed.
- [ ] Clean pass count satisfies the required clean pass count.
- [ ] Output budget discipline is followed: broad scans are capped or written to
      artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the proof commands/artifacts named in this plan | pending |
| Workspace authority proof | pending | Record cwd/tool for every proof command | pending |
| Target map closure | pending | Record target files/surfaces and comparison basis | pending |
| Coherence audit closure | pending | Close stale fixes/docs/API/orphan/generated/boundary rows | pending |
| Focused proof after last patch | pending | Run focused proof or record N/A with reason | pending |
| Browser proof | pending | Capture Browser/route proof or record N/A/blocker | pending |
| Package/API proof | pending | Run package/type/export/source audit or record N/A | pending |
| Docs/generated-output proof | pending | Run docs/generated-output/source audit or record N/A | pending |
| Agent/rule/generated sync | pending | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | pending |
| Architecture cleanup | pending | Invoke `architecture-cleanup` for source-shape findings or record N/A | pending |
| Findings ledger closure | pending | Every accepted/rejected/routed finding has evidence | pending |
| Clean pass count | pending | Record consecutive clean passes after the last patch | pending |
| Changed list / review attention / stopping checkpoints | pending | Fill final handoff ledgers from current evidence | pending |
| Agent-native review | pending | Load `agent-native-reviewer` for agent/tooling changes or record N/A | pending |
| Autoreview | pending | Load `autoreview`, run selected target mode, fix/reject accepted findings, rerun after material fixes until clean | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-merged-yjs-closure.md` | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | in_progress | created plan | target map |
| Target map | pending | | coherence audit |
| Coherence audit | pending | | focused proof |
| Focused proof | pending | | autoreview |
| Autoreview and finding verification | pending | | patch/reject/route |
| Patch/reject/route | pending | | rerun proof |
| Architecture/docs/API/generated-output closure | pending | | clean pass |
| Clean pass confirmation | pending | | final handoff |
| Final handoff and goal-plan check | pending | | final response |

Target map:
| Surface | Files / refs | Owner | Required proof | Status |
|---------|--------------|-------|----------------|--------|
| Yjs provider API | `packages/yjs/src/lib/providers/indexeddb-provider.ts`, `types.ts`, `registry.ts`, `index.ts` | `@platejs/yjs` | focused provider tests, typecheck, source audit | in_progress |
| Yjs plugin init lifecycle | `packages/yjs/src/lib/BaseYjsPlugin.ts`, `BaseYjsPlugin.init.spec.ts` | `@platejs/yjs` | focused init tests and typecheck | in_progress |
| Package metadata/deps | `packages/yjs/package.json`, `pnpm-lock.yaml`, `.changeset/yjs-indexeddb-provider.md` | `@platejs/yjs` | install, changeset/source audit | in_progress |
| Docs/README | `content/docs/(plugins)/(collaboration)/yjs*.mdx`, `packages/yjs/README.md` | docs + `@platejs/yjs` | source-backed docs audit, docs syntax/import sanity if available | in_progress |
| Agent/skills | target has none | N/A | N/A: no `.agents/**` in target commit | closed |

Findings ledger:
| Id | Source | Finding | Decision | Files / owner | Proof after decision |
|----|--------|---------|----------|---------------|----------------------|
| pending | pending | pending | pending | pending | pending |

Proof ledger:
| Surface | Command / audit | Cwd | Result | Follow-up |
|---------|-----------------|-----|--------|-----------|
| pending | pending | pending | pending | pending |

Clean pass ledger:
| Pass | After patch loop | Autoreview result | Proof result | Accepted findings left | Clean? |
|------|------------------|-------------------|--------------|------------------------|--------|
| pending | pending | pending | pending | pending | pending |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | pending |
| tests/proof | pending |
| docs/examples | pending |
| generated outputs | pending |
| skills/workflow | pending |
| reverted/quarantined/routed packets | pending |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| pending | pending | pending | pending | pending |

Stopping checkpoints:
| Id | Question / decision | Why it matters | Continued work | Recommendation | Anchor |
|----|---------------------|----------------|----------------|----------------|--------|
| pending | pending | pending | pending | pending | pending |

Findings:
- None yet.

Decisions and tradeoffs:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- Pending.

Final handoff contract:
- Goal plan: pending
- Closure target and comparison basis: pending
- Loop count and clean pass count: pending
- Accepted findings fixed: pending
- Findings rejected/routed: pending
- Commands run with cwd: pending
- Autoreview result and rerun count: pending
- Architecture-cleanup result: pending
- Changed list: pending
- Needs your attention: pending
- Stopping checkpoints: pending
- Residual risks and next owner: pending

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint zero |
| Where am I going? | Target map, coherence audit, proof, autoreview, clean pass |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-06-17T11:31:43.041Z Goal plan created.

Open risks:
- Pending.
