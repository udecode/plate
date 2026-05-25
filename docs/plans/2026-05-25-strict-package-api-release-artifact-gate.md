# strict package api release artifact gate

Objective:
Make the `package-api` pack stricter so package/API work cannot finish with an ambiguous release-artifact decision.

Goal plan:
docs/plans/2026-05-25-strict-package-api-release-artifact-gate.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: chat request
- id / link: user said "ok make it stricter go" after agreeing that `package-api`, not a separate `changeset` pack, should own the release-artifact gate.
- title: Harden package-api release artifact gate
- acceptance criteria: no new changeset pack; `package-api` forces `.changeset`, registry changelog, or explicit no-artifact reason; `.changeset` path loads the `changeset` skill; registry-only work uses `docs/components/changelog.mdx`; lint and checker pass.

Completion threshold:
- `docs/plans/templates/packs/package-api.md` says it owns the release-artifact decision and explicitly rejects a separate `changeset` pack.
- The pack records the three legal release-artifact paths: `.changeset`, registry changelog, or `N/A: <reason>`.
- The pack forces `changeset` skill loading when `.changeset` is required and keeps registry-only work on `docs/components/changelog.mdx`.
- The pack requires a concrete no-artifact reason for internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main`.
- `pnpm lint:fix` passes and `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-strict-package-api-release-artifact-gate.md` passes.

Verification surface:
- Source audit of `docs/plans/templates/packs/package-api.md`.
- Search audit for the new strict rows: release artifact path, published package changeset, registry changelog, and no release artifact.
- `pnpm lint:fix`.
- Completion checker for this plan.

Constraints:
- Do not create a separate `changeset` pack.
- Do not duplicate the full `changeset` prose rules inside the pack; point to the skill for writing/version rules.
- Do not change runtime package behavior.
- Do not edit generated skill mirrors; this task changes plan templates only.
- No PR, commit, push, or tracker sync; none was requested.

Boundaries:
- Source of truth: `docs/plans/templates/packs/package-api.md`.
- Allowed edit scope: package-api pack plus this goal plan.
- Browser surface: N/A because this is a plan-template workflow change.
- Tracker sync: N/A because no tracker item exists.
- Non-goals: writing an actual changeset, changing package releases, editing package code, or adding a new pack.

Blocked condition:
- Work would block only if existing template composition could not express the stricter release-artifact matrix without introducing a separate pack.

Task state:
- task_type: workflow template hardening
- task_complexity: micro
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: none
- reason: package-api now has explicit release-artifact classification and proof gates.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-strict-package-api-release-artifact-gate.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `autogoal` and `changeset`; used `changeset` as release-prose policy source. |
| Active goal checked or created | yes | Active goal created for hardening package-api release-artifact gates. |
| Source of truth read before edits | yes | Read `docs/plans/templates/packs/package-api.md`, task template release rows, and changeset rules. |
| Tracker comments and attachments read | no | N/A: chat-only task. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: template-only policy hardening; memory/source search provided release context. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior. |
| Branch decision for code-changing task | no | N/A: no branch action requested and repo rule forbids proactive branch hygiene. |
| Release artifact decision | yes | The task changes the release-artifact gate itself; no actual package release artifact is needed. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Agent-native pack selected | yes | Plan templates are agent workflow surfaces. |
| Agent-facing action surface identified | yes | The changed action is how agents close package/API work with release artifacts. |
| Source rule versus generated mirror boundary identified | yes | Only `docs/plans/templates/packs/package-api.md` changed; no generated mirror sync applies. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded reviewer; scoped manual review applied to the template wording. |

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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source/search audits, lint, and checker | Source audit passed, `pnpm lint:fix` passed, checker passed. |
| Bug reproduced before fix | no | Record N/A with reason | N/A: no bug fix. |
| Targeted behavior verification | yes | Source-audit changed pack behavior | Search audit confirms strict release-artifact rows are present. |
| TypeScript or typed config changed | no | Record N/A with reason | N/A: markdown template only. |
| Package exports or file layout changed | no | Record N/A with reason | N/A: no package files changed. |
| Package manifests, lockfile, or install graph changed | no | Record N/A with reason | N/A: no manifest or lockfile edit. |
| Agent rules or skills changed | no | Record N/A with reason | N/A: no `.agents/rules/**` or skill mirror changed. |
| Workspace authority proof | yes | Run verification in owning repo | Commands run in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Record N/A with reason | N/A: no browser route. |
| Browser final proof | no | Record N/A with reason | N/A: no browser route. |
| CI-controlled template output changed | no | Record N/A with reason | N/A: docs plan templates are source workflow templates. |
| Package behavior or public API changed | no | Record N/A with reason | N/A: no package behavior changed; the pack now tells future package work how to decide. |
| Registry-only component work changed | no | Record N/A with reason | N/A: no registry component changed. |
| Docs or content changed | yes | Verify source-backed claims and parser need | Markdown workflow template changed; no MDX content parser applies. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Failure mode is agents skipping or misclassifying release artifacts; proof is explicit matrix in package-api. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Reviewer loaded; manual review found the action discoverable and not split into a new pack. |
| Local install corruption suspected | no | Record N/A with reason | N/A: no local corruption signal. |
| Autoreview for non-trivial implementation changes | no | Record N/A with reason | N/A: micro markdown template hardening; source audit is sufficient. |
| PR create or update | no | Record N/A with reason | N/A: no PR requested. |
| PR proof image hosting | no | Record N/A with reason | N/A: no PR image. |
| Tracker sync-back | no | Record N/A with reason | N/A: no tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` | Passed with no fixes applied. |
| Goal plan complete | yes | Run `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-strict-package-api-release-artifact-gate.md` | Passed. |
| Knowledge extraction | no | Record N/A with reason | N/A: the reusable rule lives directly in the pack. |
| Agent source / generated sync | no | Record N/A with reason | N/A: no `.agents/rules/**` changed. |
| Agent action discoverability | yes | Source-audit the plan template an agent will use | `package-api` pack now states the matrix and skill handoff. |
| Agent-native review | yes | Load reviewer and close findings | Loaded reviewer; no actionable issue from scoped manual review. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read pack, task template release rows, changeset skill, and memory release context. | implementation |
| Implementation | complete | Updated `docs/plans/templates/packs/package-api.md`. | verification |
| Verification | complete | Source audit, lint, and checker passed. | closeout |
| PR / tracker sync | complete | N/A: no PR or tracker requested. | final response |
| Closeout | complete | Plan filled; final commands close the mechanical gates. | final response |

Findings:
- The package-api pack had one weak row: "Add changeset/changelog when required." That lets agents dodge the actual classification.
- A separate changeset pack would be worse because it would duplicate package-api and make agents choose the wrong composition.

Decisions and tradeoffs:
- Kept `changeset` as the artifact-writing skill.
- Put release-artifact classification in `package-api`.
- Kept registry-only changelog work in the registry changelog path instead of `.changeset`.
- Did not edit generated skill mirrors because plan templates are direct source artifacts.

Implementation notes:
- Added the three legal release artifact paths to `docs/plans/templates/packs/package-api.md`.
- Added a start gate for the release artifact path.
- Added checklist rows forcing `.changeset`, registry changelog, or no-artifact reasoning.
- Split one vague completion gate into classification, package changeset, registry changelog, and no-release-artifact gates.

Review fixes:
- Scoped manual agent-native review: the pack now exposes the action at start, work, and completion gates.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- Source audit confirmed `package-api` states no separate `changeset` pack.
- Search audit confirmed rows for `Release artifact path selected`, `Published package changeset`, `Registry changelog`, and `No release artifact`.
- `pnpm lint:fix` passed with no fixes applied.
- `node .agents/rules/autogoal/scripts/check-complete.mjs docs/plans/2026-05-25-strict-package-api-release-artifact-gate.md` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, no bug.
  - Verified: source/search audit, lint, completion checker.
- Browser check: N/A, no browser surface.
- Outcome: package-api now owns the strict release-artifact matrix.
- Caveat: no actual package changeset was created because this task changes workflow templates only.
- Design:
  - Chosen boundary: package-api pack owns artifact classification.
  - Why not quick patch: a generic "when required" row is exactly the bug.
  - Why not broader change: changeset prose stays in the `changeset` skill.
- Verified: search audit, lint, checker.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A.
- Caveats: no actual package release artifact applies.

Timeline:
- 2026-05-25T11:19:09.246Z Task goal plan created.
- 2026-05-25T11:20:00Z Read package-api pack, task template release rows, and changeset skill.
- 2026-05-25T11:21:00Z Hardened package-api release-artifact gates.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run lint/checker, close goal, final response |
| What is the goal? | Make package-api stricter for changeset/changelog/no-artifact decisions |
| What have I learned? | The right split is package-api for classification, changeset for writing |
| What have I done? | Updated package-api pack and plan evidence |

Open risks:
- None known. Future plans must include the updated pack to get these stricter gates.
