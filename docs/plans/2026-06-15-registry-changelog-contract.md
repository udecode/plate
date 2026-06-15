# registry changelog contract

Objective:
Add a scalable registry changelog contract for future registry tasks; done when rules/templates/helpers agree and checks pass; plan docs/plans/2026-06-15-registry-changelog-contract.md.

Goal plan:
docs/plans/2026-06-15-registry-changelog-contract.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user workflow repair request
- id / link: conversation after PR #5023
- title: Make registry changelog workflow scalable for future `$task` registry updates
- acceptance criteria:
  - `plate-ui` triggers registry changelog decisions for user-visible registry work.
  - `task` can add a `registry-changelog` pack for registry surfaces.
  - `changeset` / `package-api` delegate registry entry schema to the registry changelog contract.
  - `docs-creator` references the contract without owning it.
  - Agents have source-adjacent docs, a scaffold command, a generation command, and a check command.
  - Generated skill copies sync from `.agents/rules/**`.

Completion threshold:
- `.agents/rules/registry-changelog.mdc` defines the single schema/workflow contract.
- `docs/plans/templates/packs/registry-changelog.md` exists and can be composed into future task plans.
- `task`, `plate-ui`, `changeset`, `docs-creator`, and package-api template references agree on ownership.
- `tooling/scripts/generate-ui-changelog-entries.mjs` supports `--new` and `--check`.
- Focused generator tests, lint, generated skill sync, and PR-body verification pass.
- Task closure is legal only when `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-registry-changelog-contract.md` passes.

Verification surface:
- Source audit with `rg` over `.agents/rules`, `.agents/skills`, and `docs/plans/templates`.
- `pnpm install` to regenerate skills from rules.
- `pnpm lint:fix`.
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-registry-changelog-contract.md`.
- Existing PR #5023 body readback after update.

Constraints:
- Preserve the public registry changelog JSON contract from PR #5023.
- Do not duplicate the schema across `plate-ui`, `changeset`, `docs-creator`, and `task`.
- Edit `.agents/rules/**` as source of truth, then run `pnpm install`; do not hand-edit generated skill copies.
- Keep this as workflow/tooling only; no package changeset.

Boundaries:
- Source of truth: latest user request and existing PR #5023 branch.
- Allowed edit scope: `.agents/rules/**`, generated `.agents/skills/**`, `docs/plans/templates/**`, generator script/tests, registry changelog source README, this plan, PR #5023 body.
- Browser surface: N/A; no route, visual UI, or interaction changed.
- Tracker sync: N/A; no issue source.
- Non-goals: changing release-page UI, changing registry JSON schema, adding package release notes, or merging PR #5023.

Output budget strategy:
- Use scoped `rg` and `sed` over rule/template/generator files only.
- Cap command output with `sed -n`.
- Do not stream full generated JSON or full repo diffs.

Blocked condition:
- Stop if `pnpm install` cannot generate a new skill from `.agents/rules/registry-changelog.mdc`, or if `--check` cannot be implemented without mutating checked-in generated JSON.

Task state:
- task_type: workflow/tooling repair
- task_complexity: non-trivial
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implement canonical registry-changelog rule + pack + generator scaffold/check
- confidence: high
- next owner: PR update
- reason: Rule prose alone is too weak; the durable fix needs one contract and a mechanical CLI path.

Pre-solution issue challenge:
- reporter claim: N/A; user workflow repair, not tracker bug.
- suggested diagnosis or fix: User asked whether ownership belongs in `plate-ui` / `docs-creator`; conclusion is shared trigger/delegation with `registry-changelog` owning the contract.
- repro ladder:
  - tests / source-level repro: N/A; no bug behavior claim.
  - Playwright / automated browser: N/A; no browser surface.
  - Browser plugin: N/A; no browser surface.
  - screenshot / visual proof: N/A; no visual surface.
- reproduction verdict: N/A.
- validity verdict: valid.
- best long-term fix boundary: source rule + autogoal pack + generator CLI.
- harsh honest feedback: putting the schema only in `docs-creator` or `plate-ui` would rot; one contract with callers is the correct boundary.
- hard-stop decision: no hard stop.

Completion rule:
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-registry-changelog-contract.md` passes.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `task`, `plate-ui`, `autogoal`, `agent-native-reviewer`, and `autoreview`. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this objective. |
| Source of truth read before edits | yes | User request and existing rule/template/generator surfaces read. |
| Tracker comments and attachments read | no | N/A: no tracker source. |
| Video transcript evidence required | no | N/A: no video. |
| Pre-solution issue challenge required | no | N/A: no public tracker bug claim. |
| Branch decision for code-changing task | yes | Updated existing PR #5023 branch `codex/registry-changelog-entry-files`; abandoned empty new branch. |
| Release artifact decision | yes | No package changeset; this is agent/tooling workflow plus generator tests. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | yes | Update existing PR #5023 after `check` gate. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Recorded above. |
| Agent-native pack selected | yes | `.agents/rules/**` and generated skills change. |
| Agent-facing action surface identified | yes | Future task/plate-ui/changelog authoring flow. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; sync generated `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; full app parity map N/A because this changes skill/rule text, not user UI. |
| Package/API pack selected | yes | Release-artifact workflow changes. |
| Public surface or package boundary identified | yes | Agent-facing workflow and generator CLI; no published package API. |
| Release artifact path selected | yes | `N/A: no published package user-visible delta`; registry-changelog contract only. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package changeset. |
| Barrel/export impact decision recorded | yes | N/A: no package exports. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type, acceptance criteria, caveats, likely files/routes/packages, browser surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized `<video-transcripts>` XML, or marked N/A with reason.
- [x] Public issue challenge gate is marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: one `registry-changelog` contract plus callers.
- [x] Release artifact requirement recorded: no package changeset.
- [x] Final handoff shape decided: update existing PR #5023 and report verification.
- [x] Branch handling recorded for code-changing work.
- [x] Local-env-rot retry policy recorded: N/A unless repo-wide command fails with unrelated install-corruption signals.
- [x] Workspace authority recorded: all proof runs in `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded: command-contract change; proof is focused tests and CLI `--check`.
- [x] Review/autoreview target selected from actual diff state: local dirty diff.
- [x] Agent-native review decision recorded.
- [x] Output budget discipline recorded and followed.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: no package changeset.
- [x] Package/API pack: `.changeset` work is N/A.
- [x] Package/API pack: registry-only work delegates to `registry-changelog` pack instead of package changeset.
- [x] Package/API pack: no-artifact decision states why there is no published package delta.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is N/A.
- [x] Package/API pack: package-owned typecheck/build/test proof is N/A.
- [x] Package/API pack: generated barrels or release notes are N/A.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named source audits and commands | `pnpm install`; `pnpm lint:fix`; source audits; focused generator tests; CLI checks; `pnpm check` |
| Targeted behavior verification | yes | Run focused generator tests and CLI checks | `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`; `node tooling/scripts/generate-ui-changelog-entries.mjs --check`; temp `--new` scaffold smoke; `--check --limit` rejected |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS types or config changed |
| Package exports or file layout changed | no | Run `pnpm brl` | N/A: no package exports |
| Package manifests, lockfile, or install graph changed | no | Run install if needed | `pnpm install` required only for skill sync |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install`; `.agents/skills/registry-changelog/SKILL.md`; `.claude/skills/registry-changelog` generated |
| Workspace authority proof | yes | Run commands in `/Users/zbeyens/git/plate` | All commands run in `/Users/zbeyens/git/plate` |
| Browser surface changed | no | Browser proof | N/A: no browser surface |
| CI-controlled template output changed | no | Restore or justify | N/A |
| Package behavior or public API changed | no | Add changeset or N/A | N/A: no published package delta |
| Registry changelog contract changed | yes | Source audit, `--new`, `--write`, `--check`, focused tests | `--new` temp scaffold succeeded; `--check` passed; focused tests passed; stale schema references removed from rules/skills |
| High-risk mini gate | yes | Command-contract failure mode + proof | Failure mode: agents generate malformed/stale changelog entries; proof: scaffold/check tests, source audit, and `--check --limit` guard |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | Source/generated skill audit passed; no browser app parity surface |
| Local install corruption suspected | no | Reinstall/rerun | N/A unless failure shape appears |
| Autoreview for non-trivial implementation changes | yes | Run `.agents/skills/autoreview/scripts/autoreview --mode local` | Clean after fixing accepted P3 `--check --limit` finding |
| PR create or update | yes | Run `check` before PR update | `pnpm check` passed; PR #5023 body updated |
| Task-style PR body verified | yes | Verify PR #5023 body with `gh pr view --json body` | Passed: `gh pr view 5023 --json body --jq .body` |
| Tracker sync-back | no | Post issue/Linear sync | N/A: no tracker |
| Final handoff contract | yes | Fill final evidence | Passed |
| Final lint | yes | Run `pnpm lint:fix` | Passed |
| Output budget discipline | yes | Record result | No unbounded output streamed so far |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-registry-changelog-contract.md` | Passed after marking closeout done |
| Agent source / generated sync | yes | Run `pnpm install` and verify generated mirrors | Passed |
| Agent action discoverability | yes | Source-audit skill/rule text | Passed: `task`, `plate-ui`, `changeset`, `docs-creator`, `registry-changelog`, and generated skills agree |
| Public API / package boundary proof | yes | Source-audit release artifact impact | Passed: no published package delta; no changeset |
| Release artifact classification | yes | Record no published package delta | No package changeset; registry-changelog workflow only |
| Published package changeset | no | Add changeset if package users see delta | N/A |
| No release artifact | yes | Record reason | Agent/tooling workflow and generator CLI only |
| Package typecheck/build/test | no | Run package checks | N/A |
| Barrel/export generation | no | Run `pnpm brl` | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Source rules, skills, templates, generator, memory note read | implementation |
| Implementation | done | Rule/pack/README/generator edits completed | verification |
| Verification | done | Focused tests, source audits, autoreview, `pnpm check` passed | PR update |
| PR / tracker sync | done | PR #5023 body updated and read back | closeout |
| Closeout | done | PR body readback complete; goal checker ready | final response |

Findings:
- Current `plate-ui` did not trigger registry changelog entries.
- Current `changeset` / package-api wording knew the path but still owned too much of the contract.
- Current docs-creator wording should point to the contract, not own release-entry authoring.
- Generator lacked a non-mutating currentness check and a scaffold command.

Decisions and tradeoffs:
- Add a dedicated `registry-changelog` skill/rule and task pack.
- Keep schema in one place; callers reference the skill by name.
- Add CLI support instead of relying on agents to copy examples by hand.
- Update existing PR #5023 branch instead of creating a separate PR from `main`.

Implementation notes:
- Added `.agents/rules/registry-changelog.mdc`.
- Added `docs/plans/templates/packs/registry-changelog.md`.
- Added `apps/www/src/registry/changelog/entries/README.md`.
- Updated `task`, `plate-ui`, `changeset`, `docs-creator`, and package-api template source.
- Added generator `--new`, `--check`, and focused tests.

Review fixes:
- Accepted autoreview P3: rejected `--check --limit` because partial checks falsely report complete generated JSON as stale.
- Reduced generator test runtime by letting unit tests opt out of formatter subprocess while production `--check` stays byte-accurate.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initially created branch from `main` | 1 | Switch back to existing PR #5023 branch | Resolved before source edits; plan carried over |

Verification evidence:
- `pnpm install`
- `pnpm lint:fix`
- `bun test tooling/scripts/generate-ui-changelog-entries.test.mjs`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --source /tmp/registry-changelog-new-test --new 2026-06-15-fix-editor-wrapping --summary "Fix editor wrapping" --items editor,editor-static --kind fix`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check --limit 1` failed intentionally with `--check cannot be combined with --limit`
- `.agents/skills/autoreview/scripts/autoreview --mode local`
- `pnpm check`
- Source audit confirmed stale monthly registry changelog format was removed from rules/skills.

Final handoff contract:
- PR line: update PR #5023.
- Issue / tracker line: N/A.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A tests, N/A browser
  - Verified: focused tests and `pnpm check` passed, browser N/A
- Browser check: N/A.
- Outcome: registry changelog authoring now has a source rule, generated skill, task pack, source-adjacent README, scaffold command, generation command, and check command.
- Caveat: browser proof N/A because this is workflow/tooling only; no route or UI changed.
- Design:
  - Chosen boundary: dedicated registry-changelog rule/pack plus caller wiring.
  - Why not quick patch: one more line in `plate-ui` would leave schema scattered.
  - Why not broader change: no need to redesign release docs or package changesets.
- Verified: `pnpm install`; `pnpm lint:fix`; focused generator tests; registry changelog `--check`; temp `--new` scaffold; `--check --limit` guard; autoreview; `pnpm check`.
- PR body verified: `gh pr view 5023 --json body --jq .body`.

Timeline:
- 2026-06-15T14:44:35.650Z Task goal plan created.
- 2026-06-15T14:45:00Z Active goal created.
- 2026-06-15T14:50:00Z Switched from accidental new branch back to existing PR #5023 branch.
- 2026-06-15T15:30:00Z Verification passed after fixing accepted autoreview P3 `--check --limit` finding.
- 2026-06-15T15:40:00Z PR #5023 body updated and read back.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Goal check, commit, push, final response |
| What is the goal? | Make future registry tasks use a single registry changelog contract |
| What have I learned? | `plate-ui` needs to trigger; `registry-changelog` needs to own schema and commands |
| What have I done? | Added rule/pack/README, synced generated skills, added generator CLI support, and passed verification |

Open risks:
- None known.
