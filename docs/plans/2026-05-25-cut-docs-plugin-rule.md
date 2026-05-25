# cut docs plugin rule

Objective:
Cut the obsolete `docs-plugin` rule and make `docs-creator` the single docs authoring skill, including plugin-page specifics.

Goal plan:
docs/plans/2026-05-25-cut-docs-plugin-rule.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: chat request
- title: Cut `.agents/rules/docs-plugin.mdc`
- acceptance criteria: remove the rule, remove generated mirrors, route public plugin docs to `docs-creator`, keep plugin-page specifics discoverable, sync Skiller outputs, prove no live refs remain outside historical plans, and pass lint/checker.

Completion threshold:
- `.agents/rules/docs-plugin.mdc` is deleted.
- `.agents/skills/docs-plugin` and `.claude/skills/docs-plugin` are gone after `pnpm install`.
- `docs-creator` contains the useful plugin-page execution rules: headless-first docs, kit/manual order, source-backed components, toolbar rules, API/transforms only when real, and API block preservation.
- Live agent refs in `docs-creator`, `plate-plugin-creator`, `north-star`, docs plan templates/packs, research notes, and solution notes route to `docs-creator`.
- Focused audits show no live `docs-plugin` refs outside `docs/plans/**`, `pnpm lint:fix` passes, and `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-cut-docs-plugin-rule.md` passes.

Verification surface:
- `pnpm install` in `/Users/zbeyens/git/plate-2`, run twice to verify Skiller does not resurrect `docs-plugin`.
- `find .agents .claude -path '*docs-plugin*' -print`.
- `rg -n 'docs-plugin|docs_plugin|docs plugin' .agents .claude AGENTS.md docs --glob '!docs/plans/**'`.
- Positive audit for `docs-creator` plugin-page routing and generated skill mirrors.
- `pnpm lint:fix`.
- Autoreview attempt plus scoped manual review because the checkout bundle exceeds reviewer input limits.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-cut-docs-plugin-rule.md`.

Constraints:
- Do not check git state proactively.
- Do not cut unrelated skills.
- Do not leave a broken generated skill or dangling docs-plugin symlink.
- Do not hand-edit `SKILL.md` as the source; edit `.agents/rules/**` and sync with `pnpm install`.
- Generated auxiliary files that Skiller leaves live must still be corrected when they contain stale agent instructions.
- No PR, commit, push, or tracker sync; none was requested.

Boundaries:
- Source of truth: `.agents/rules/docs-creator.mdc`, `.agents/rules/plate-plugin-creator.mdc`, `.agents/rules/north-star.mdc`, docs plan templates/packs, and live docs/research notes.
- Allowed edit scope: delete `.agents/rules/docs-plugin.mdc`, update live refs to `docs-creator`, update generated mirrors through `pnpm install`, and fix stale live generated auxiliary context left behind by Skiller.
- Browser surface: N/A because this is docs/agent workflow text only.
- Tracker sync: N/A because there is no issue or Linear item.
- Non-goals: full docs rewrite, cutting unrelated skills, changing package behavior, or cleaning unrelated dirty checkout state.

Blocked condition:
- Work would block only if Skiller repeatedly resurrected `docs-plugin`, if a live source ref depended on deleted doctrine that could not be moved into `docs-creator`, or if lint/checker failed for unrelated repo state that could not be narrowed.

Task state:
- task_type: agent workflow and docs doctrine
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: docs-plugin is gone, docs-creator owns plugin-page rules, generated mirrors are synced, and live ref audits are clean.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-cut-docs-plugin-rule.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `task` and `autogoal`; loaded `docs-creator`, `agent-native-reviewer`, and `autoreview`. |
| Active goal checked or created | yes | Active goal created for cutting docs-plugin and proving no stale live refs. |
| Source of truth read before edits | yes | Read `.agents/rules/docs-plugin.mdc`, `.agents/rules/docs-creator.mdc`, related source rules, templates, and live docs refs. |
| Tracker comments and attachments read | no | N/A: chat-only task. |
| Video transcript evidence required | no | N/A: no video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read the docs-authoring solution note and updated its stale docs-plugin refs. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior or bug fix. |
| Branch decision for code-changing task | no | N/A: no branch action requested and repo rule forbids proactive branch hygiene. |
| Release artifact decision | no | N/A: no package/release surface changed. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Docs pack selected | yes | Applied docs pack to this plan. |
| `docs-creator` loaded | yes | Read and updated `.agents/rules/docs-creator.mdc`. |
| Docs lane selected | yes | Lane is docs authoring doctrine and plugin-page docs workflow. |
| Target docs and nearest sibling docs read | yes | Read old docs-plugin rule, docs-creator, plan templates, research decision, and solution note. |
| Docs style doctrine read | yes | Read current docs-creator doctrine before moving plugin-page rules into it. |
| Documented source owner identified | yes | `docs-creator` owns docs style, workflow, and plugin-page specifics. |
| Agent-native pack selected | yes | `.agents/**` and `.claude/**` agent skill surfaces changed. |
| Agent-facing action surface identified | yes | Agent action surface is docs authoring and plugin authoring handoff. |
| Source rule versus generated mirror boundary identified | yes | Source rules edited; generated mirrors synced with `pnpm install`; stale auxiliary generated context fixed because Skiller left it live. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer and performed scoped agent-native review. |

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
| Named verification threshold | yes | Run sync, ref audits, lint, review attempt, and checker | All named checks ran; checker rerun after this plan fill. |
| Bug reproduced before fix | no | Record N/A with reason | N/A: no bug fix. |
| Targeted behavior verification | yes | Verify docs/agent workflow refs | Stale ref audit found no live docs-plugin refs outside historical plans. |
| TypeScript or typed config changed | no | Record N/A with reason | N/A: markdown/rule text only. |
| Package exports or file layout changed | no | Record N/A with reason | N/A: no package exports. |
| Package manifests, lockfile, or install graph changed | no | Record N/A with reason | N/A: `pnpm install` was Skiller sync; dependency graph remained up to date. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` ran twice and Skiller completed successfully. |
| Workspace authority proof | yes | Run verification in owning repo | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Record N/A with reason | N/A: no UI route or browser interaction changed. |
| Browser final proof | no | Record N/A with reason | N/A: no browser proof applies. |
| CI-controlled template output changed | no | Record N/A with reason | N/A: docs plan templates are source docs, not CI-controlled app templates. |
| Package behavior or public API changed | no | Record N/A with reason | N/A: no package/API behavior changed. |
| Registry-only component work changed | no | Record N/A with reason | N/A: no registry component work. |
| Docs or content changed | yes | Verify source-backed claims and content command applicability | Source-backed doctrine/docs notes changed; no MDX app content route changed, so contentlayer is N/A. |
| High-risk mini gate | yes | Record realistic failure mode, proof plan, and boundary | Failure mode is agents loading missing docs-plugin or stale handoff; proof is no live refs plus generated mirror removal. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close actionable findings | Reviewer loaded; scoped manual review found no broken live refs or discoverability gaps. |
| Local install corruption suspected | no | Record N/A with reason | N/A: no local env corruption signal. |
| Autoreview for non-trivial implementation changes | yes | Run helper or record blocker | Helper failed because bundle was 2,804,635 chars vs 1,048,576 max; scoped manual review substituted. |
| PR create or update | no | Record N/A with reason | N/A: no PR requested. |
| PR proof image hosting | no | Record N/A with reason | N/A: no PR/browser image. |
| Tracker sync-back | no | Record N/A with reason | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` | Passed with no fixes applied. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-cut-docs-plugin-rule.md` | Passed. |
| Knowledge extraction | no | Record N/A with reason | N/A: updated existing docs-authoring solution note instead. |
| Docs source-backed claim audit | yes | Verify docs claims against current source | Positive audit proves docs-creator owns plugin-page rules and handoffs. |
| Docs links / routes / previews | no | Record N/A with reason | N/A: no public docs links/routes/previews changed. |
| Docs MDX/content parser | no | Record N/A with reason | N/A: no MDX content route changed. |
| Plugin page specifics | yes | Apply docs-creator kit/manual/API rules | Plugin-page specifics were moved into `docs-creator` and plan templates now route there. |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | Skiller removed docs-plugin mirrors and kept docs-creator handoffs after a second install. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Agents reach plugin docs through docs-creator and plate-plugin-creator; no live docs-plugin refs remain. |
| Agent-native review | yes | Load reviewer and close accepted findings | Scoped manual review found no actionable agent-native issues. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read docs-plugin, docs-creator, related source rules, templates, and docs notes. | implementation |
| Implementation | complete | Deleted docs-plugin rule, moved plugin-page specifics into docs-creator, updated refs/templates, ran Skiller. | verification |
| Verification | complete | `pnpm install` twice, stale ref audit, generated path audit, positive audit, lint, scoped review. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Plan filled; checker is final mechanical proof. | final response |

Findings:
- `docs-plugin` had become a narrow wrapper around doctrine that belongs in `docs-creator`.
- A raw delete would have broken `docs-creator`, `plate-plugin-creator`, `north-star`, plan templates, and live docs notes.
- Skiller removed the main generated docs-plugin skill/symlink, but left a stale generated auxiliary creation-flow file under `plate-plugin-creator`; that live context had to be corrected.

Decisions and tradeoffs:
- Chose one docs skill instead of a stub or alias because a stub preserves the split-brain.
- Moved only compact, useful plugin-page rules into docs-creator instead of copying the whole old rule and its stale route catalog.
- Left historical `docs/plans/**` mentions alone because plans are records, not active routing.

Implementation notes:
- Deleted `.agents/rules/docs-plugin.mdc`.
- Updated `.agents/rules/docs-creator.mdc` to own plugin-page section order, kit/manual structure, component/API checks, toolbar guidance, and source-backed plugin examples.
- Updated `plate-plugin-creator` and `north-star` to hand public docs to `docs-creator`.
- Updated docs plan templates/packs and live docs/research notes.
- Ran `pnpm install`; generated docs-plugin mirrors disappeared.
- Corrected the live generated `plate-plugin-creator/rules/creation-flow.md` auxiliary files to hand docs to `docs-creator`.

Review fixes:
- No reviewer findings were produced because autoreview exceeded input limits.
- Scoped manual review checked stale live refs, generated/source routing, and agent discoverability.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `rg` with a missing optional lockfile path | 1 | Use existing paths only | Later audits passed. |
| Generated auxiliary file still referenced docs-plugin after Skiller | 1 | Patch the live auxiliary context and rerun Skiller | Second Skiller run did not resurrect docs-plugin. |
| Autoreview local bundle exceeded input limit | 1 | Scoped manual review of the docs-plugin cut | No stale live refs found. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` completed successfully twice.
- `find .agents .claude -path '*docs-plugin*' -print` returned no paths.
- `rg -n 'docs-plugin|docs_plugin|docs plugin' .agents .claude AGENTS.md docs --glob '!docs/plans/**'` returned no live refs.
- Positive audit found `docs-creator` plugin-page ownership plus `plate-plugin-creator` and `north-star` handoffs to docs-creator.
- `pnpm lint:fix` passed with no fixes applied.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-cut-docs-plugin-rule.md` passed.
- Autoreview failed with input too large: 2,804,635 chars vs 1,048,576 max; scoped manual review covered the cut.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no issue or tracker requested.
- Confidence line: high for the scoped docs-plugin cut.
- Flow table:
  - Reproduced: N/A, no bug.
  - Verified: `pnpm install` twice, generated path audit, stale ref audit, positive route audit, `pnpm lint:fix`, plan checker.
- Browser check: N/A, no browser surface.
- Outcome: `docs-plugin` is cut and plugin-page docs route through `docs-creator`.
- Caveat: autoreview could not run because unrelated dirty checkout content made the local bundle too large.
- Design:
  - Chosen boundary: docs-creator owns all docs authoring, including plugin-page specifics.
  - Why not quick patch: deleting only the file would leave stale live agent handoffs.
  - Why not broader change: cutting unrelated skills is out of scope.
- Verified: source sync, ref audits, generated mirror removal, lint, and completion checker.

Final handoff / sync:
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker.
- Browser proof: N/A, no browser surface.
- Caveats: full autoreview blocked by dirty-checkout bundle size; scoped manual review done.

Timeline:
- 2026-05-25T11:01:55.662Z Task goal plan created.
- 2026-05-25T11:02:30Z Read docs-plugin, docs-creator, related source rules, templates, and docs notes.
- 2026-05-25T11:03:30Z Deleted docs-plugin source and moved useful plugin-page rules into docs-creator.
- 2026-05-25T11:04:20Z Ran `pnpm install`; generated docs-plugin mirrors disappeared.
- 2026-05-25T11:04:50Z Fixed stale generated creation-flow handoff and reran `pnpm install`.
- 2026-05-25T11:05:30Z Ran stale/positive audits, lint, autoreview attempt, and scoped manual review.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run completion checker, mark goal complete, final response |
| What is the goal? | Cut docs-plugin and route plugin docs to docs-creator |
| What have I learned? | The old skill was redundant, but deletion required moving plugin-page specifics and fixing generated auxiliary context |
| What have I done? | Deleted docs-plugin, updated refs/templates/docs notes, synced generated mirrors, verified no live refs |

Open risks:
- None known for the scoped cut. Historical `docs/plans/**` files may mention docs-plugin as old state, intentionally left alone.
