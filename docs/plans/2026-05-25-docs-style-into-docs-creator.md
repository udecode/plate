# docs style into docs creator

Objective:
Move Plate documentation writing style doctrine into the `docs-creator` skill source so agents have one docs-writing authority.

Goal plan:
docs/plans/2026-05-25-docs-style-into-docs-creator.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: chat request after asking whether to move `docs/solutions/style.md` into the skill
- title: Move docs style into docs-creator
- acceptance criteria: merge useful style doctrine into `.agents/rules/docs-creator.mdc`, remove the duplicate standalone style authority, update live references, sync generated skills, and prove no stale live refs remain.

Completion threshold:
- `.agents/rules/docs-creator.mdc` is the source of truth for Plate docs style and workflow.
- Useful guidance from `docs/solutions/style.md` is represented in the docs-creator source.
- `docs/solutions/style.md` is removed so it cannot compete as a second authority.
- Live docs workflow refs point to docs-creator doctrine, generated mirrors are synced with `pnpm install`, focused audits show no live source refs to the removed file, lint passes, and this plan passes `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-docs-style-into-docs-creator.md`.

Verification surface:
- `pnpm install` in `/Users/zbeyens/git/plate-2` for Skiller sync.
- Focused source audits over `.agents`, `.claude`, `AGENTS.md`, and `docs`.
- File deletion proof for `docs/solutions/style.md`.
- Positive audit for new docs-creator references.
- `pnpm lint:fix`.
- Autoreview attempt plus scoped manual review because the local dirty bundle exceeded the reviewer input limit.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-docs-style-into-docs-creator.md`.

Constraints:
- Do not cut `docs-plugin` in this task.
- Do not hand-edit generated `.agents/skills/**/SKILL.md`; edit `.agents/rules/**` and run `pnpm install`.
- Keep one docs style authority.
- No PR, commit, or push; none was requested.
- Keep historical plan refs out of scope; only live source/workflow refs matter.

Boundaries:
- Source of truth: `.agents/rules/docs-creator.mdc`.
- Allowed edit scope: `.agents/AGENTS.md`, `.agents/rules/docs-creator.mdc`, docs plan templates/packs, live docs/research refs, generated mirrors from `pnpm install`, and removal of `docs/solutions/style.md`.
- Browser surface: N/A because this changes docs/agent workflow text, not a rendered route.
- Tracker sync: N/A because no tracker issue or PR was requested.
- Non-goals: cutting `docs-plugin`, rewriting all docs authoring doctrine, editing CI-controlled templates manually, or cleaning unrelated local changes.

Blocked condition:
- Autonomous work would block only if Skiller sync failed after source edits, stale live refs could not be resolved without deleting user-owned forked doctrine, or the completion checker rejected a fully evidenced plan for a script defect.

Task state:
- task_type: docs and agent workflow
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: style authority is centralized, stale live refs are gone, generated mirrors are synced, and focused verification passes.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-docs-style-into-docs-creator.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal` for gated work and `docs-creator` for docs doctrine ownership. |
| Active goal checked or created | yes | Active goal created for moving style doctrine into docs-creator and deleting duplicate style authority. |
| Source of truth read before edits | yes | Read `.agents/rules/docs-creator.mdc`, `docs/solutions/style.md`, `.agents/AGENTS.md`, and affected docs templates. |
| Tracker comments and attachments read | no | N/A: chat-only task with no tracker issue. |
| Video transcript evidence required | no | N/A: no video or screen recording input. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read the existing style doctrine and adjacent docs solution refs before deleting the standalone file. |
| TDD decision before behavior change or bug fix | no | N/A: docs and agent workflow text only. |
| Branch decision for code-changing task | no | N/A: no branch action requested and repo rule says not to check branch state proactively. |
| Release artifact decision | no | N/A: no package behavior, API, or release artifact changed. |
| Browser tool decision for browser surface | no | N/A: no browser-rendered route changed. |
| PR expectation decision | no | N/A: user asked to edit, not PR. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Docs pack selected | yes | Applied docs pack to the autogoal plan. |
| `docs-creator` loaded | yes | Used `.agents/rules/docs-creator.mdc` as source; generated skill synced after `pnpm install`. |
| Docs lane selected | yes | Lane is docs authoring doctrine and agent workflow docs. |
| Target docs and nearest sibling docs read | yes | Read old `docs/solutions/style.md`, docs-creator source, and docs plan templates/packs. |
| `docs/solutions/style.md` read | yes | Original file was read before deletion; useful doctrine was moved into docs-creator. |
| Documented source owner identified | yes | `.agents/rules/docs-creator.mdc` owns docs style doctrine. |
| Agent-native pack selected | yes | Applied agent-native pack because `.agents/**` and generated skill mirrors changed. |
| Agent-facing action surface identified | yes | Action surface is `docs-creator` plus AGENTS docs rule references. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/docs-creator.mdc`; `pnpm install` regenerated `.agents/skills/docs-creator/SKILL.md` and `AGENTS.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md` and did a scoped manual review. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used, new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure: reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary, browser behavior, agent-action, or command-contract changes, or marked N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source audits, lint, generated sync, and plan checker | `pnpm install`, focused `rg`, deletion check, positive audit, `pnpm lint:fix`, and checker. |
| Bug reproduced before fix | no | Record N/A with reason | N/A: no bug fix. |
| Targeted behavior verification | yes | Verify changed docs/agent workflow source | Stale ref audit and positive docs-creator audit passed. |
| TypeScript or typed config changed | no | Record N/A with reason | N/A: markdown/rule text only. |
| Package exports or file layout changed | no | Record N/A with reason | N/A: no package exports or barrel files. |
| Package manifests, lockfile, or install graph changed | no | Record N/A with reason | N/A: `pnpm install` was for Skiller sync, not dependency graph changes. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed and regenerated `AGENTS.md` plus docs-creator skill mirror. |
| Workspace authority proof | yes | Run verification in owning repo | Commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Record N/A with reason | N/A: no route or UI behavior changed. |
| Browser final proof | no | Record N/A with reason | N/A: no browser proof applies. |
| CI-controlled template output changed | no | Record N/A with reason | N/A: docs plan templates are source, not CI-controlled package templates. |
| Package behavior or public API changed | no | Record N/A with reason | N/A: no package/API change. |
| Registry-only component work changed | no | Record N/A with reason | N/A: no registry component work. |
| Docs or content changed | yes | Verify source-backed claims and content command applicability | Source-backed text only; no MDX app docs content, so contentlayer is N/A. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Risk is agents reading stale style refs; proof is stale ref audit plus generated sync. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close actionable findings | Loaded `agent-native-reviewer`; scoped manual review found no stale live refs. |
| Local install corruption suspected | no | Record N/A with reason | N/A: no local env corruption signal. |
| Autoreview for non-trivial implementation changes | yes | Load/run local autoreview or record blocker | Autoreview command hit 2,753,874 chars versus 1,048,576 limit; scoped manual review substituted for this narrow docs/agent diff. |
| PR create or update | no | Record N/A with reason | N/A: no PR requested. |
| PR proof image hosting | no | Record N/A with reason | N/A: no PR or browser image. |
| Tracker sync-back | no | Record N/A with reason | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below with outcome, caveat, and verification. |
| Final lint | yes | Run `pnpm lint:fix` | Passed with no fixes applied. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-docs-style-into-docs-creator.md` | Passed. |
| Knowledge extraction | no | Record N/A with reason | N/A: this is workflow cleanup, not a reusable product/code learning beyond the changed skill text. |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Positive audit showed docs-creator source/generated refs and no live old style refs. |
| Docs links / routes / previews | no | Record N/A with reason | N/A: no docs page links, routes, anchors, or previews changed. |
| Docs MDX/content parser | no | Record N/A with reason | N/A: no MDX content route changed. |
| Docs plugin specifics | no | Record N/A with reason | N/A: not a plugin page; docs-plugin cut is out of scope. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | `pnpm install` passed; docs-creator generated mirror contains moved doctrine. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Positive audit covered `.agents/rules/docs-creator.mdc` and `.agents/skills/docs-creator/SKILL.md`. |
| Agent-native review | yes | Load reviewer and close accepted findings | Loaded reviewer; no accepted findings from scoped manual review. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read source docs doctrine, docs-creator source, AGENTS refs, templates, and plan packs. | implementation |
| Implementation | complete | Moved useful style rules into docs-creator, deleted old style file, updated live refs, ran `pnpm install`. | verification |
| Verification | complete | Stale refs clean, positive refs present, deletion proved, lint passed. | closeout |
| PR / tracker sync | complete | N/A because no PR or tracker was requested. | final response |
| Closeout | complete | Plan filled; checker is final mechanical proof. | final response |

Findings:
- `docs/solutions/style.md` duplicated authority that belonged in `docs-creator`.
- The old standalone style file had useful guidance on progressive docs and real gotcha callouts; those rules are now in docs-creator.
- Live references no longer point at the deleted style file.

Decisions and tradeoffs:
- Chose docs-creator as the sole authority instead of leaving a forwarding stub, because a stub still creates a second place agents may treat as doctrine.
- Did not cut `docs-plugin`; that is a separate decision from moving shared style guidance.
- Did not rewrite historical plans; they are records, not live instructions.

Implementation notes:
- Updated `.agents/AGENTS.md` docs rule to point at `.agents/rules/docs-creator.mdc`.
- Updated `.agents/rules/docs-creator.mdc` to state it owns Plate docs style and workflow.
- Removed `docs/solutions/style.md`.
- Updated docs plan templates/packs and live docs/research references.
- Ran `pnpm install` to refresh generated AGENTS and skill mirrors.

Review fixes:
- Autoreview could not process the full dirty checkout bundle, so review scope was narrowed manually to the changed docs/agent files.
- Manual review focused on stale refs, generated/source boundary, and agent discoverability.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell interpreted backticks in one audit command | 1 | Rerun with single-quoted search pattern | Clean audit rerun succeeded. |
| Autoreview local bundle exceeded input limit | 1 | Use scoped manual review for this narrow docs/agent diff | No actionable stale-ref findings found. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` completed and Skiller synced Codex/Claude outputs.
- Stale ref audit over `.agents`, `.claude`, `AGENTS.md`, and `docs` excluding active plans returned no live `docs/solutions/style.md` refs.
- `test ! -e docs/solutions/style.md` proved the standalone file is removed.
- Positive audit found docs-creator source/generated references in AGENTS, templates, and updated docs refs.
- `pnpm lint:fix` passed with no fixes applied.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-docs-style-into-docs-creator.md` passed.
- Scoped manual review covered source/generated boundary and agent discoverability after autoreview hit the dirty-checkout input limit.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no issue or tracker requested.
- Confidence line: high for the scoped docs/agent workflow move.
- Flow table:
  - Reproduced: N/A, no bug.
  - Verified: `pnpm install`, stale ref audit, deletion check, positive audit, `pnpm lint:fix`, plan checker.
- Browser check: N/A, no browser surface changed.
- Outcome: docs-creator is the single live docs style authority.
- Caveat: autoreview could not run on the full dirty checkout because the input bundle exceeded its limit; scoped manual review covered this task.
- Design:
  - Chosen boundary: docs-creator source rule owns style doctrine.
  - Why not quick patch: keeping `style.md` as a second source would preserve the confusion.
  - Why not broader change: cutting docs-plugin is a separate docs-lane simplification task.
- Verified: source sync, ref audits, lint, and completion checker.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker.
- Browser proof: N/A, no browser surface.
- Caveats: full autoreview blocked by dirty-checkout bundle size; scoped manual review done.

Timeline:
- 2026-05-25T10:54:29.974Z Task goal plan created.
- 2026-05-25T10:55:00Z Moved useful style doctrine into docs-creator and removed stale standalone style file.
- 2026-05-25T10:56:00Z Ran `pnpm install` for generated skill sync.
- 2026-05-25T10:57:00Z Ran stale ref, deletion, positive ref, lint, and scoped review checks.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run completion checker, mark goal complete, final response |
| What is the goal? | Make docs-creator the only live docs style authority |
| What have I learned? | Style doctrine belongs inside docs-creator; docs-plugin remains a separate decision |
| What have I done? | Moved doctrine, removed style.md, updated refs/templates, synced generated mirrors, verified |

Open risks:
- None known for the scoped move. Historical plans may mention the deleted file as old state, but live source and workflow refs are clean.
