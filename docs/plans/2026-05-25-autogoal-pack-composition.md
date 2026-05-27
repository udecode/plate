# autogoal pack composition

Objective:
Implement static pack composition for Plate autogoal plans. `create-goal-
scratchpad.mjs` must support one primary template plus optional `--with` packs,
materialize pack rows into one concrete `docs/plans` file, record primary
template and applied packs, and keep `check-complete.mjs` focused on the final
materialized plan.

Goal plan:
docs/plans/2026-05-25-autogoal-pack-composition.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (agent workflow and generated skill surfaces changed)
- review (manual scoped review after autoreview bundle limit)

Task source:
- type: user request
- id / link: chat request
- title: make autogoal composable with packs
- acceptance criteria: add static pack composition, create reusable surface
  packs, add a major-task primary template that uses `work-core`, update source
  rules and generated skills, prove pack expansion and incomplete-plan rejection,
  run lint, and close the goal plan.

Completion threshold:
- `.agents/rules/autogoal/scripts/create-goal-scratchpad.mjs` accepts repeated
  or comma-separated `--with` pack arguments.
- The helper resolves packs from `docs/plans/templates/packs/*.md`, records
  `Primary template:` and `Applied packs:`, and merges pack rows into `Start
  Gates`, `Work Checklist`, and `Completion Gates`.
- Reusable packs exist for `work-core`, `docs`, `agent-native`, `browser`,
  `package-api`, and `review`.
- `docs/plans/templates/major-task.md` exists as the major-work primary template.
- `autogoal`, `task`, `major-task`, `docs-creator`, and `docs-plugin` source
  rules document primary-template-plus-pack routing.
- Generated skill mirrors are refreshed with `pnpm install`.
- Smoke plans prove no-pack and multi-pack behavior, unfinished smoke plans fail
  `check-complete.mjs`, lint passes, and this plan passes the final checker.

Verification surface:
- `pnpm install` in `/Users/zbeyens/git/plate-2`.
- `node --check` on `create-goal-scratchpad.mjs`, `check-complete.mjs`, and
  `create-goal-template.mjs`.
- Smoke create:
  - `--template task --with docs --with agent-native`
  - `--template major-task --with work-core,docs,package-api`
  - `--template task` with no packs
- `check-complete.mjs` on the unfinished pack smoke plan to prove materialized
  rows are enforced.
- Focused `rg` source/generated audits for `--with`, pack names, metadata rows,
  and generated skill sync.
- `pnpm lint:fix`.
- Scoped manual review of touched files because autoreview local mode exceeded
  its input limit before returning findings.

Constraints:
- Keep one active goal and one concrete runtime plan as truth.
- Do not add runtime template inheritance or checker-side hidden state.
- Do not weaken evidence gates.
- Do not hand-edit generated `.agents/skills/**/SKILL.md`; source rules drive
  generated mirrors through `pnpm install`.
- Do not open a PR or commit because the user did not ask.

Boundaries:
- Source of truth: `.agents/rules/autogoal.mdc`,
  `.agents/rules/autogoal/README.md`,
  `.agents/rules/autogoal/scripts/create-goal-scratchpad.mjs`,
  `.agents/rules/task.mdc`, `.agents/rules/major-task.mdc`,
  `.agents/rules/docs-creator.mdc`, `.agents/rules/docs-plugin.mdc`, and
  `docs/plans/templates/**`.
- Allowed edit scope: source rules, autogoal helper script, new pack templates,
  major-task template, generated skill mirrors from `pnpm install`, and this
  goal plan.
- Browser surface: N/A, no browser route or UI changed.
- Tracker sync: N/A, no issue or Linear task.
- Non-goals: implement template inheritance, alter `check-complete.mjs`
  semantics, rewrite unrelated skills, or create a PR.

Blocked condition:
Blocked only if the helper could not materialize pack rows, generated skill sync
failed, lint could not pass after focused fixes, or the final goal checker could
not pass. No blocker remains.

Task state:
- task_type: agent workflow / tooling
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: complete after final checker
- confidence: high
- next owner: none
- reason: helper behavior, packs, source rules, generated mirrors, smoke proof,
  lint, and scoped review are complete.

Completion rule:
- Completion is legal only after every required checklist item below is checked,
  gate evidence is concrete, final verification evidence is recorded, and the
  final `check-complete.mjs` command passes on this plan.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | Yes | Loaded autogoal, agent-native-reviewer, and autoreview guidance. |
| Active goal checked or created | Yes | `get_goal` returned no active goal; `create_goal` created the pack-composition goal. |
| Source of truth read before edits | Yes | Read autogoal source rule, helper script, README, task rule, major-task rule, docs-creator, docs-plugin, templates, and memory lines for template ownership context. |
| Tracker comments and attachments read | No | No tracker item was provided. |
| Video transcript evidence required | No | No video or screen recording was provided. |
| `docs/solutions` checked for non-trivial existing-code work | No | Agent workflow/tooling change, not product behavior implementation. |
| TDD decision before behavior change or bug fix | No | No runtime product bug or package behavior changed; script smoke tests were the right proof. |
| Branch decision for code-changing task | Yes | N/A: no PR or commit requested; no branch action taken. |
| Release artifact decision | Yes | N/A: no package release surface changed. |
| Browser tool decision for browser surface | Yes | N/A: no browser surface changed. |
| PR expectation decision | Yes | N/A: user asked for implementation only, not PR. |
| Tracker sync expectation decision | Yes | N/A: no tracker source. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: helper materializes
      packs; checker stays simple; generated plans stay truth.
- [x] Release artifact requirement recorded: N/A, no package/changelog surface.
- [x] Final handoff shape decided: concise local-change summary plus
      verification and autoreview caveat.
- [x] Branch handling recorded for code-changing work: N/A, no PR/commit asked.
- [x] Local-env-rot retry policy recorded: N/A, no install-corruption-shaped
      failure occurred.
- [x] Workspace authority recorded: every proof command ran in
      `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded for agent command-contract changes.
- [x] Review/autoreview target selected from actual diff state; full helper
      blocked on bundle size and scoped manual review was used.
- [x] Agent-native review decision recorded for `.agents/**` and skill/tooling
      changes.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | Yes | Run the smoke, source audit, sync, lint, and final checker commands named in this plan. | All named commands are recorded under Verification evidence. |
| Bug reproduced before fix | No | Record N/A. | N/A: architecture/tooling feature, not a reported bug. |
| Targeted behavior verification | Yes | Prove helper materializes packs and unfinished materialized plans fail. | Smoke plans for no-pack, task+docs+agent-native, and major-task+work-core+docs+package-api were generated; unfinished pack smoke failed `check-complete.mjs`. |
| TypeScript or typed config changed | No | Record N/A. | N/A: JavaScript helper and markdown rules/templates only. |
| Package exports or file layout changed | No | Record N/A. | N/A: no package exports or exported files changed. |
| Package manifests, lockfile, or install graph changed | No | Record N/A. | N/A: `pnpm install` was for Skiller sync; lockfile was already up to date. |
| Agent rules or skills changed | Yes | Run `pnpm install` and verify generated skill sync. | `pnpm install` completed and Skiller applied Codex/Claude rules; source/generated `rg` found pack routing in generated skills. |
| Workspace authority proof | Yes | Run verification in owning repo. | All proof commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | No | Record N/A. | N/A: no route/UI/browser behavior changed. |
| Browser final proof | No | Record N/A. | N/A: no browser surface. |
| CI-controlled template output changed | No | Record N/A. | N/A: no registry `templates/**` output changed. |
| Package behavior or public API changed | No | Record N/A. | N/A: no changeset needed. |
| Registry-only component work changed | No | Record N/A. | N/A: no registry component work. |
| Docs or content changed | Yes | Verify docs-plan templates and agent docs source/generation. | Pack templates, major-task template, autogoal README, and source rules were audited with `rg`; no app content page changed. |
| High-risk mini gate | Yes | Record realistic failure mode, proof plan, and boundary. | Failure mode: hidden inheritance or checker drift lets agents close plans without pack rows. Proof: helper materializes rows into the sections `check-complete` already reads; unfinished smoke failed. Boundary: composition in creator helper, not checker. |
| Agent-native review for agent/tooling changes | Yes | Load reviewer and close findings. | Reviewer guidance loaded; scoped manual review checked helper parsing, pack section merging, generated sync, and command docs. |
| Local install corruption suspected | No | Record N/A. | N/A: failures were lint and reviewer input size, not env rot. |
| Autoreview for non-trivial implementation changes | Yes | Run helper or record blocker with fallback. | `.agents/skills/autoreview/scripts/autoreview --mode local ...` failed before findings because bundle was 2,737,927 chars over the 1,048,576 limit; scoped manual review followed. |
| PR create or update | No | Record N/A. | N/A: no PR requested. |
| PR proof image hosting | No | Record N/A. | N/A: no PR or image proof. |
| Tracker sync-back | No | Record N/A. | N/A: no tracker item. |
| Final handoff contract | Yes | Fill final handoff fields. | Fields below are complete. |
| Final lint | Yes | Run `pnpm lint:fix`. | First run found top-level-regex lint errors; after moving regexes to constants, rerun passed. |
| Goal plan complete | Yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-autogoal-pack-composition.md`. | Final checker command recorded in Verification evidence. |
| Knowledge extraction | No | Record N/A. | N/A: current rule/template changes are the durable knowledge artifact. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read source rules/templates/helper and relevant memory. | implementation |
| Implementation | complete | Helper supports `--with`; packs and major-task template added; rules updated; skills synced. | verification |
| Verification | complete | Smoke plans, incomplete-plan rejection, `node --check`, `rg`, `pnpm install`, `pnpm lint:fix`, and manual review complete. | closeout |
| PR / tracker sync | skipped | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Goal ledger filled and final checker run. | final response |

Findings:
- Composition belongs in `create-goal-scratchpad.mjs`, not in
  `check-complete.mjs`; the checker should only validate the final plan.
- `major-task` needed its own primary template. Building it by inheriting the
  task template would import normal execution gates into planning-heavy work.
- `work-core` is the right shared base pack for heavyweight work that later
  executes; docs/browser/package/API/agent-native/review stay touched-surface
  packs.
- Generated plan metadata is useful even without packs; no-pack plans now record
  `Applied packs: - none`.

Decisions and tradeoffs:
- Pick one primary template by dominant risk, then add packs for touched
  surfaces.
- Materialize pack rows statically into one plan; no runtime inheritance and no
  hidden parent lookup.
- Keep pack files as markdown fragments with `Start Gates`, `Work Checklist`,
  and `Completion Gates` so the existing checker can enforce them.
- Leave `check-complete.mjs` unchanged; that avoids a second source of truth.

Implementation notes:
- Added `--with` parsing, repeated/comma-separated pack support, pack resolution,
  composition metadata insertion, and section-row merging in
  `.agents/rules/autogoal/scripts/create-goal-scratchpad.mjs`.
- Added packs under `docs/plans/templates/packs/`.
- Added `docs/plans/templates/major-task.md`.
- Updated autogoal, task, major-task, docs-creator, and docs-plugin source
  rules, plus the human README.
- Ran `pnpm install` to refresh generated skill mirrors.

Review fixes:
- Accepted lint finding: moved regex literals in `create-goal-scratchpad.mjs` to
  top-level constants.
- Manual review accepted no further code changes after checking helper parsing,
  pack row merging, no-pack metadata, generated skill sync, and checker
  compatibility.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm lint:fix` failed on inline regex literals. | 1 | Move regexes to top-level constants. | Fixed and reran lint successfully. |
| Autoreview local mode exceeded input limit before producing findings. | 1 | Use scoped manual review of touched files and record caveat. | Manual review completed; no unresolved findings. |

Verification evidence:
- `pnpm install` completed; Skiller applied rules for Claude Code and Codex.
- `node --check .agents/rules/autogoal/scripts/create-goal-scratchpad.mjs`
  passed.
- `node --check .agents/rules/autogoal/scripts/check-complete.mjs` passed.
- `node --check .agents/rules/autogoal/scripts/create-goal-template.mjs`
  passed.
- Smoke plan `--template task --with docs --with agent-native` contained
  `Primary template`, `Applied packs`, `Docs pack selected`, and
  `Agent-native pack selected` rows.
- `check-complete.mjs` on the unfinished pack smoke plan failed as expected and
  listed the materialized pack rows as unresolved.
- Smoke plan `--template major-task --with work-core,docs,package-api`
  contained major-task metadata plus work-core, docs, and package/API rows.
- Smoke plan `--template task` with no packs contained `Applied packs: - none`
  and no pack gate rows.
- Pack source audit confirmed every pack file has `Start Gates`, `Work
  Checklist`, and `Completion Gates`.
- Focused `rg` confirmed source and generated skills document `--with` routing,
  pack names, `Primary template`, `Applied packs`, and generated skill sync.
- `pnpm lint:fix` passed after the regex-constant fix: checked 3419 files, no
  fixes applied.
- Smoke files were removed after verification.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker item.
- Confidence line: high; helper behavior and generated docs were smoke-tested.
- Flow table:
  - Reproduced: N/A, no runtime bug.
  - Verified: `pnpm install`, smoke create, failed incomplete check, source
    audits, script syntax checks, lint, and final goal checker.
- Browser check: N/A, no browser surface.
- Outcome: autogoal now supports primary template plus materialized packs.
- Caveat: autoreview local mode could not run because unrelated dirty checkout
  content exceeded the tool input limit; scoped manual review covered this
  task's touched files.
- Design:
  - Chosen boundary: pack composition in `create-goal-scratchpad.mjs`.
  - Why not quick patch: rule-only guidance would still leave no executable
    `--with` path.
  - Why not broader change: checker-side inheritance would create hidden state
    and make plan closeout harder to debug.
- Verified: final checker run on this plan.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: autoreview bundle limit noted above.

Timeline:
- 2026-05-25T10:33:19.026Z Task goal plan created.
- 2026-05-25 Created active autogoal for static pack composition.
- 2026-05-25 Added helper `--with` support and reusable pack templates.
- 2026-05-25 Added major-task primary template and updated source rules.
- 2026-05-25 Ran `pnpm install` to sync generated skills.
- 2026-05-25 Ran smoke plan creation for no-pack and multi-pack flows.
- 2026-05-25 Verified unfinished pack smoke fails `check-complete.mjs`.
- 2026-05-25 Fixed lint regex findings and reran lint.
- 2026-05-25 Removed smoke plans and completed final ledger.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Implement static pack composition for autogoal plans |
| What have I learned? | Helper-side materialization keeps the checker simple and the plan auditable |
| What have I done? | Added packs, major-task template, helper support, rule docs, generated sync, and verification |

Open risks:
- No known scoped risk. Full local autoreview remains blocked by unrelated dirty
  checkout size, not by the pack-composition change.
