# stable registry changelog ids

Objective:
Stabilize registry changelog generated IDs so adding a changelog row does not rewrite existing event entry IDs.

Goal plan:
docs/plans/2026-06-14-stable-registry-changelog-ids.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user follow-up on PR #5013
- id / link: https://github.com/udecode/plate/pull/5013
- title: Long-term fix for generated registry changelog row churn
- acceptance criteria: generated entry IDs no longer depend on row numbers, adding a row above existing content leaves existing entry IDs stable, artifacts regenerate coherently, PR #5013 is updated.

Completion threshold:
- `tooling/scripts/generate-ui-changelog-entries.mjs` derives source entry IDs from row content rather than row ordinal.
- A focused generator test proves inserting a new row above an existing row does not change the existing row's ID.
- Generated registry changelog JSON is refreshed once under the new stable scheme.
- Focused tests, `pnpm check`, autoreview, commit, push, and PR body update pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-stable-registry-changelog-ids.md` passes.

Verification surface:
- `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs`
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write`
- `pnpm check`
- `.agents/skills/autoreview/scripts/autoreview --mode local ...`
- `gh pr view 5013 --json body`

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user follow-up "go long term fix" after generated changelog churn explanation.
- Allowed edit scope: registry changelog generator, generator tests, generated changelog JSON, goal plan, existing PR #5013.
- Browser surface: no real browser UI; this is generated JSON/tooling behavior.
- Tracker sync: PR body update only.
- Non-goals: changing user-facing changelog prose beyond generated ID/artifact updates; package API/runtime changes.

Output budget strategy:
- Use focused diffs and generator tests; cap command output; avoid dumping full generated JSON except targeted examples.

Blocked condition:
- Blocked only if generator tests expose unavoidable ID collisions that need a product decision, or if `pnpm check` fails for unrelated repo state after one focused triage pass.

Task state:
- task_type: tooling fix
- task_complexity: medium
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: ready_to_complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: maintainer review
- reason: generator source IDs are content-derived, stale artifacts are pruned safely, checks passed, autoreview clean, and PR #5013 body is synced.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-stable-registry-changelog-ids.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Re-read `task` and `autogoal`; previous PR workflow already loaded. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal for stable registry changelog IDs. |
| Source of truth read before edits | yes | Latest user message is source: "go long term fix". |
| Tracker comments and attachments read | no | N/A: no new tracker item; existing PR #5013 is target. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: generator source and tests are local source of truth. |
| TDD decision before behavior change or bug fix | yes | Add generator regression test for insertion-stable IDs. |
| Branch decision for code-changing task | yes | Continue on `codex/fix-shadcn-registry-kit-targets`, current PR branch. |
| Release artifact decision | yes | Registry generated changelog artifact only; no package changeset. |
| Browser tool decision for browser surface | no | N/A: no browser UI behavior. |
| PR expectation decision | yes | User explicitly wants PR updated. |
| Tracker sync expectation decision | yes | PR body update only; no issue comment requested. |
| Output budget strategy recorded | yes | Focused diffs/tests, capped output. |
| Package/API pack selected | yes | Registry generated artifact/public install metadata surface. |
| Public surface or package boundary identified | yes | Public registry changelog JSON IDs/metadata, not package runtime API. |
| Release artifact path selected | yes | Registry changelog JSON regeneration. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: `.changeset` not required. |
| Barrel/export impact decision recorded | yes | N/A: no exports/barrels. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence marked N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the ownership boundary: generator IDs and pruning
      live in `tooling/scripts/generate-ui-changelog-entries.mjs`.
- [x] Release artifact requirement recorded: registry changelog only; no
      package changeset.
- [x] Final handoff shape decided: update existing PR #5013.
- [x] Branch handling recorded: continued on
      `codex/fix-shadcn-registry-kit-targets`.
- [x] Local-env-rot retry policy recorded: N/A, no install-corruption failure.
- [x] Workspace authority recorded: every proof command ran in
      `/Users/zbeyens/git/plate`.
- [x] High-risk note recorded: generated registry changelog ID migration is
      one-time; regression test covers inserted-row stability.
- [x] Review/autoreview target selected from actual local diff and rerun clean.
- [x] Agent-native review decision recorded: N/A, no `.agents`, `.claude`, or
      `.codex` tooling changed.
- [x] Output budget discipline followed with capped command output and focused
      tests.
- [x] Package/API pack: public surface is registry changelog JSON and shadcn
      registry metadata, not package runtime API.
- [x] Package/API pack: release artifact matrix applied as registry changelog
      artifact work.
- [x] Package/API pack: `.changeset` N/A because no published package runtime,
      type, or API behavior changed.
- [x] Package/API pack: registry-only work regenerated
      `/apps/www/src/registry/changelog/*` JSON.
- [x] Package/API pack: no package artifact decision recorded above.
- [x] Package/API pack: compatibility decision explicit: one-time generated ID
      migration, future inserted rows stable.
- [x] Package/API pack: package-owned proof is root `pnpm check`.
- [x] Package/API pack: barrels N/A, no exports or exported file layout changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs`; route tests; `pnpm check`; autoreview clean |
| Bug reproduced before fix | yes | Record repro | Initial issue repro: shadcn smoke hit unresolved `./plugins/*` imports after custom component alias install |
| Targeted behavior verification | yes | Run focused proof | Generator insertion-stability test, stale-prune test, `--write --limit` guard test, changelog route tests |
| TypeScript or typed config changed | no | N/A | No TS config changed; root `pnpm check` typecheck passed |
| Package exports or file layout changed | no | N/A | No exported package file layout changed |
| Package manifests, lockfile, or install graph changed | no | N/A | No manifests or lockfile changed |
| Agent rules or skills changed | no | N/A | No agent rules or skills changed |
| Workspace authority proof | yes | Record cwd | All commands ran in `/Users/zbeyens/git/plate` |
| Browser surface changed | no | N/A | No runnable browser UI changed in this follow-up; generated JSON/tooling surface |
| Browser final proof | no | N/A | Browser proof N/A for generator follow-up |
| CI-controlled template output changed | no | N/A | No `templates/**` changed |
| Package behavior or public API changed | no | N/A | No package changeset; registry/web metadata only |
| Registry-only component work changed | yes | Regenerate changelog JSON | `node tooling/scripts/generate-ui-changelog-entries.mjs --write` wrote 20 events |
| Docs or content changed | no | N/A | No user-facing docs changed |
| High-risk mini gate | yes | Record failure mode and proof | Risk: stale JSON deletion or ID churn; proof: guard/prune/stability tests and autoreview clean |
| Agent-native review for agent/tooling changes | no | N/A | No agent tooling changed |
| Local install corruption suspected | no | N/A | No install-corruption failure |
| Autoreview for non-trivial implementation changes | yes | Run local autoreview clean | Final quick pass clean: no accepted/actionable findings |
| PR create or update | yes | Check before PR body sync | `pnpm check` passed before `gh pr edit 5013` |
| Task-style PR body verified | yes | Verify body | `gh pr view 5013 --json body,url,title,state` shows required issue line, confidence line, table, and sections |
| PR proof image hosting | no | N/A | No browser proof images |
| Tracker sync-back | yes | Sync PR body | Existing PR #5013 updated; no issue comment requested |
| Final handoff contract | yes | Fill below | Final handoff fields completed |
| Final lint | yes | Run lint fix | `pnpm lint:fix` fixed 22 generated JSON files, final `pnpm check` lint clean except existing warning |
| Output budget discipline | yes | Confirm scoped output | Command output capped; broad diffs summarized |
| Goal plan complete | yes | Run checker | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-stable-registry-changelog-ids.md` to run after this edit |
| Public API / package boundary proof | yes | Source audit | Registry JSON and registry item target metadata only; no package API |
| Release artifact classification | yes | Classify | Registry-only generated changelog artifact |
| Published package changeset | no | N/A | No published package runtime/API/types/config delta |
| Registry changelog | yes | Regenerate | `node tooling/scripts/generate-ui-changelog-entries.mjs --write` |
| No release artifact | no | N/A | Registry changelog artifact applies |
| Package typecheck/build/test | yes | Run root gate | `pnpm check` passed |
| Barrel/export generation | no | N/A | No exports or barrels changed |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | user follow-up and PR context read | implementation |
| Implementation | complete | generator content-hash IDs, pruning, guard, tests, generated JSON | verification |
| Verification | complete | focused tests, generator write, lint fix, `pnpm check`, autoreview clean | PR / tracker sync |
| PR / tracker sync | complete | PR #5013 body updated and verified | closeout |
| Closeout | complete | ready for commit, push, final response | final response |

Findings:
- Root cause: generated source IDs included the source row ordinal, so inserting
  a row above old entries rewrote every downstream entry ID.
- Accepted autoreview finding: full-output pruning plus `--write --limit` would
  make partial writes dangerous. Fixed by rejecting that argument combination.

Decisions and tradeoffs:
- Use a short content hash over stable row fields instead of row number.
- Keep the one-time generated ID migration because old row-number IDs cannot be
  made stable retroactively without a compatibility map.
- Prune stale generated JSON from the generator so renamed event files do not
  leave dead artifacts in `apps/www/src/registry/changelog`.

Implementation notes:
- `formatSourceId` now derives IDs from date, release entry, target items,
  summary, details, prefix, slug, and an 8-char SHA-1 content hash.
- `writeRegistryChangelogEvents` can prune stale `.json` files in the output
  directory during full writes.
- `validateArgs` rejects `--write --limit`.
- Route tests were updated for the new generated event ID.

Review fixes:
- Added the `--write --limit` guard after autoreview flagged unsafe pruning.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad final autoreview took over 6 minutes | 1 | Rerun with low thinking and no web search | Final quick autoreview clean |

Verification evidence:
- `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs`:
  11 pass.
- `bun test 'apps/www/src/app/registry/changelog/[event]/route.test.ts' apps/www/src/app/registry/changelog/components.json/route.test.ts apps/www/src/app/registry/changelog/index.json/route.test.ts`:
  5 pass.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write`: wrote 20
  registry changelog events from 39 source rows.
- `pnpm lint:fix`: final pass checked 3276 files; generated JSON formatted.
- `pnpm check`: passed lint, typecheck, test:all, and test:slowest; existing
  unrelated sidebar eslint warning only.
- `.agents/skills/autoreview/scripts/autoreview --mode local --thinking low --no-web-search ...`:
  clean, no accepted/actionable findings.

Final handoff contract:
- PR line: PR #5013 updated.
- Issue / tracker line: fixes GitHub issue #4971; no separate issue comment requested.
- Confidence line: high, 95-100%.
- Flow table:
  - Reproduced: shadcn smoke reproduced relative import failure before fix.
  - Verified: focused tests, generator write, `pnpm check`, autoreview clean.
- Browser check: N/A for generator follow-up; original issue had shadcn smoke.
- Outcome: stable changelog IDs and safe generated artifact pruning.
- Caveat: one-time generated ID migration remains in the diff.
- Design:
  - Chosen boundary: registry generator and registry source checker.
  - Why not quick patch: manual generated JSON edits would churn again.
  - Why not broader change: no package runtime/API change needed.
- Verified: commands listed above.
- PR body verified: `gh pr view 5013 --json body,url,title,state`.

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  an emoji confidence line like `🟢 95-100% confidence`.
- Use this exact table header: `| Phase | 🧪 Tests | 🌐 Browser |`.
- Use `Reproduced` and `Verified` rows. Mark passing proof with `🟢`, repro or
  failing proof with `🔴`, and non-applicable cells with `➖ N/A`.
- Use bold emoji section headings: `**✅ Outcome**`, `**⚠️ Caveat**`,
  `**🏗️ Design**`, and `**🧪 Verified**`.
- Never include a line that links to the current PR itself. The current PR URL
  belongs in the final response, not in its own description.
- Do not replace this with a generic `Summary` / `Verification` PR body, an
  adaptive prose body from a git helper skill, plain `## Outcome` sections, or
  an unrelated generated badge footer unless the caller or repo template
  explicitly asks for it.
- Proof is `gh pr view --json body` output or a concise source-backed summary
  of that output.

Final handoff / sync:
- PR: https://github.com/udecode/plate/pull/5013
- Issue / tracker: fixes #4971 through PR body sync.
- Browser proof: N/A for generator follow-up; shadcn smoke is command proof.
- Caveats: one-time generated ID migration; existing unrelated sidebar warning.

Timeline:
- 2026-06-14T17:59:00.714Z Task goal plan created.
- 2026-06-14T18:20:00Z Generator source IDs changed from row ordinal to
  content-hash IDs.
- 2026-06-14T18:35:00Z Stale generated changelog pruning and `--write --limit`
  guard added.
- 2026-06-14T18:45:00Z Focused generator and route tests passed.
- 2026-06-14T19:05:00Z Final `pnpm check` passed.
- 2026-06-14T19:16:00Z Final autoreview quick pass clean.
- 2026-06-14T19:20:00Z PR #5013 body updated and verified.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Commit, push, final response |
| What is the goal? | Stable registry changelog generated IDs and updated PR #5013 |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- No open blocker. Existing sidebar eslint warning is unrelated and non-fatal.
