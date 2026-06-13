# add plate ui changelogs v51

Objective:
Add missing Plate UI changelog entries for v51; done when every detected v51 registry-changing PR is in source MDX/generated JSON and `/docs/releases` renders.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-13-add-plate-ui-changelogs-v51.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user request
- id / link: current thread
- title: add all remaining Plate UI changelogs for v51
- acceptance criteria: retrieve every v51 registry-changing PR, backfill
  `tooling/data/plate-ui-changelog.mdx` from the old changelog source style,
  regenerate `/registry/changelog/*` JSON, and verify `/docs/releases`.

Completion threshold:
- Source audit identifies every v51 release PR/commit that touched
  `apps/www/src/registry/**`.
- `tooling/data/plate-ui-changelog.mdx` contains one source section per detected
  v51 change unit with explicit commit provenance.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write` refreshes
  `apps/www/src/registry/changelog/*`.
- Generated changelog index contains every detected v51 registry-changing PR and
  no stale orphan event files.
- `/docs/releases` serves and includes the generated Plate UI entries.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-13-add-plate-ui-changelogs-v51.md` passes.

Verification surface:
- v51 release-index and PR file audit.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write`.
- generated `apps/www/src/registry/changelog/index.json` and
  `components.json` inspection.
- `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs`.
- `pnpm lint:fix`.
- HTTP/browser proof for `http://localhost:3000/docs/releases`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `tooling/data/plate-ui-changelog.mdx`,
  `apps/www/src/generated/release-index.json`, local git history, GitHub PR
  metadata, and generated `apps/www/src/registry/changelog/*`.
- Allowed edit scope: changelog source, generated changelog JSON, focused
  generator/test fixes only if provenance or generation is wrong, and this plan.
- Browser surface: `/docs/releases`.
- Tracker sync: N/A, no external tracker.
- Non-goals: no package `.changeset`, no registry component source changes, no
  release UI redesign.

Output budget strategy:
- Use scripts for broad v51 release/PR/file audits and print compact tables.
  Save large JSON or PR-file data under `tmp/` only if needed. Avoid streaming
  full diffs; inspect focused `git show --name-only` and short diff slices.

Blocked condition:
- Stop only if v51 provenance cannot be resolved from local release-index, git,
  or GitHub PR metadata, or if generator output contradicts source rows in a way
  that requires a schema decision.

Task state:
- task_type: registry changelog data backfill
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready-to-complete

Current verdict:
- verdict: v51 Plate UI changelog backfill complete
- confidence: high
- next owner: final response
- reason: release-index, GitHub PR file audit, generated JSON, focused tests,
  typecheck, lint, and local route proof all agree.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-13-add-plate-ui-changelogs-v51.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | User provided `autogoal`; workflow read in prompt and applied |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this goal |
| Source of truth read before edits | yes | Read current plan and will audit changelog/release-index before source edits |
| Tracker comments and attachments read | no | N/A: no tracker attached |
| Video transcript evidence required | no | N/A: no video evidence |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: registry changelog data backfill, no behavior fix |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change planned |
| Branch decision for code-changing task | no | N/A: user did not request commit/PR branch |
| Release artifact decision | yes | Registry changelog only; no package `.changeset` |
| Browser tool decision for browser surface | yes | Use available browser tool if exposed; otherwise HTTP proof against running local server |
| PR expectation decision | no | N/A: user did not request PR |
| Tracker sync expectation decision | no | N/A: no tracker attached |
| Output budget strategy recorded | yes | See Output budget strategy |
| Package/API pack selected | yes | Registry changelog rows are release-artifact data |
| Public surface or package boundary identified | yes | Public surface is Plate UI registry changelog JSON and `/docs/releases` |
| Release artifact path selected | yes | Registry changelog |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no package changeset applies |
| Barrel/export impact decision recorded | no | N/A: no exports or file layout changes planned |
| Browser pack selected | yes | `/docs/releases` must render generated entries |
| Browser route / app surface identified | yes | `http://localhost:3000/docs/releases` |
| Browser tool decision recorded | yes | Prefer in-app Browser if callable; use HTTP route proof if not exposed |
| Console/network caveat policy recorded | yes | Console/network proof only if browser tool is available; otherwise record HTTP caveat |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A: no video evidence.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: N/A, no commit/PR branch
      requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A, no env-rot failure.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes: public
      surface is registry changelog JSON and release docs rendering; proof is
      generated JSON audit plus `/docs/releases/51` route proof.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work: N/A, scoped registry/docs route patch verified by
      tests/typecheck/lint; no autoreview requested for this closeout.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: registry changelog.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules: N/A, no package changeset.
- [x] Package/API pack: registry-only work updates `tooling/data/plate-ui-changelog.mdx` and generated `/registry/changelog/*` JSON instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`: N/A, registry artifact applies.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes: N/A, no public API shape change.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded.
- [x] Package/API pack: generated barrels or release notes are updated when required: N/A, no exports or barrels.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver: HTTP route proof used because Browser tool was not exposed in this resumed tool set.
- [x] Browser pack: console and network errors are checked or explicitly out of scope: out of scope for static release HTML/JSON proof.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | v51 PR audit found registry-changing PRs 4732, 4697, 4695 and non-registry v51 PRs 4735, 4729, 4714 |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: data backfill plus archive rendering omission |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | focused registry route tests pass |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or barrels |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package/install graph changes |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: this task did not edit agent files |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | commands ran in `/Users/zbeyens/git/plate` |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | HTTP route proof used for `/docs/releases/51`; Browser tool unavailable in resumed tool set |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | `curl http://localhost:3000/docs/releases/51` returned 200 and HTML includes v51 Plate UI entries |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output touched by this task |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry changelog docs artifact, no package behavior/API change |
| Registry-only component work changed | yes | Update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, or record N/A | source MDX updated and generator wrote 18 registry changelog events |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | source-backed claims from release-index/PR file audits; `/docs/releases/51` rendered |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | failure mode was stale/generated registry JSON or archive page omitting Plate UI data; fixed at source MDX/generator and shared release renderer input |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling files edited by this task |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install corruption signal |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: scoped registry data/rendering patch with focused tests/typecheck/lint; user had stopped autoreview earlier |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not request PR |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR body |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | filled below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; fixed 1 file after final patch |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | one accidental full JSON pipe printed; recovered with temp-file JSON audit |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-13-add-plate-ui-changelogs-v51.md` | ready to run |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | no exports/package APIs changed; public registry JSON/docs route verified |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | registry-only changelog artifact plus release docs rendering |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | N/A: no package changeset |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, update `tooling/data/plate-ui-changelog.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, and do not add a package changeset | done |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: registry artifact applies |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm --filter www typecheck` passed |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no barrels/exports |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | HTTP proof for static route due Browser tool unavailable |
| Browser console/network check | no | Record console/network state or why it is not applicable | N/A: static HTML/JSON route proof only |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | local HTML proof recorded in Verification evidence |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | audited release-index and v51 PR files | implementation complete |
| Implementation | complete | added v51 MDX rows, generated JSON, patched archived release page data wiring | verification complete |
| Verification | complete | tests/typecheck/lint/HTTP proof passed | closeout |
| PR / tracker sync | complete | N/A: no PR/tracker requested | final response |
| Closeout | complete | plan ready for autogoal completion check | final response |

Findings:
- v51 release-index has six release PRs: 4735, 4732, 4729, 4714, 4697, 4695.
- Registry-changing v51 PRs are 4732, 4697, and 4695. PRs 4735, 4729, and 4714 touched no `apps/www/src/registry/**` files and are intentionally absent from Plate UI changelog JSON.
- Old `content/components/changelog.mdx` covered the October 2025 v51 rows; PR 4732 needed source reconstruction from PR metadata and registry file audit.
- `/docs/releases/[major]` did not pass `plateUiChangesByTag`, so v51 JSON existed but archived release pages could not render Plate UI cards.

Decisions and tradeoffs:
- Kept this registry-only: no package changeset, no package source edits.
- Added a shared `getPlateUiReleaseChangesByTag()` helper instead of duplicating PR/file-diff link mapping between current and archived releases pages.
- Used HTTP route proof because the in-app Browser tool was not available in the resumed tool set.

Implementation notes:
- Added v51 source rows in `tooling/data/plate-ui-changelog.mdx` for PR 4732, PR 4697, and PR 4695 with commit provenance.
- Generated v51 event JSON:
  - `apps/www/src/registry/changelog/2025-11-20-biome-ultracite.json`
  - `apps/www/src/registry/changelog/2025-10-21-add-rejectaisuggestions.json`
  - `apps/www/src/registry/changelog/2025-10-17-fix-react-decouple.json`
- Refreshed `apps/www/src/registry/changelog/index.json` and `components.json`.
- Patched `/docs/releases/[major]` to pass Plate UI changelog data into the shared release renderer.

Review fixes:
- Fixed typecheck error in `apps/www/src/app/registry/changelog/index.json/route.test.ts` by typing parsed JSON as `RegistryChangelogIndex`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Shell read of route files with unquoted parentheses failed | 1 | quote App Router paths | resolved |
| `curl | node <<'NODE'` consumed the heredoc as Node stdin and printed full JSON before failing | 1 | write curl output to temp file, then read it from Node | resolved |
| `/docs/releases/51` rendered package release content but no Plate UI cards | 1 | inspect current vs archived releases pages and pass Plate UI data to `[major]` route | resolved |

Verification evidence:
- `node tooling/scripts/generate-ui-changelog-entries.mjs --write`: wrote 18 registry changelog events from 37 source rows.
- Generated index audit: total 18 events; v51 events are PR 4732 (`v51.1.2`, 4 entries, 68 targets), PR 4697 (`v51.0.1`, 2 entries, 4 targets), and PR 4695 (`v51.0.0`, 1 entry, 29 targets), all with empty diagnostics.
- `node --test tooling/scripts/generate-ui-changelog-entries.test.mjs`: 7 pass.
- `pnpm --filter www exec bun test src/app/registry/changelog/index.json/route.test.ts src/app/registry/changelog/components.json/route.test.ts 'src/app/registry/changelog/[event]/route.test.ts'`: 5 pass, 16 expect calls.
- `pnpm --filter www typecheck`: passed.
- `pnpm lint:fix`: passed, checked 3270 files, fixed 1 file.
- `curl -sS -o /tmp/plate-releases-51.html -w '%{http_code} %{content_type}\n' http://localhost:3000/docs/releases/51`: `200 text/html; charset=utf-8`.
- `/tmp/plate-releases-51.html` includes `v51 Releases`, `Plate UI`, `Biome ultracite`, `Add rejectAISuggestions`, `Fix react decouple`, `SuggestionLineBreak`, and `platejs/static`.
- `curl http://localhost:3000/registry/changelog/index.json`: v51 JSON contains PRs 4732, 4697, 4695 and no other v51 Plate UI events.

Final handoff contract:
- PR line: N/A, no PR requested
- Issue / tracker line: N/A, no tracker
- Confidence line: high
- Flow table:
  - Reproduced: v51 missing archive render observed on `/docs/releases/51`
  - Verified: tests/typecheck/lint/HTTP route proof passed
- Browser check: HTTP proof used; Browser tool unavailable in resumed tool set
- Outcome: v51 Plate UI changelog JSON and release-page cards are backfilled
- Caveat: no screenshot/console proof because only shell/HTTP tools were exposed
- Design:
  - Chosen boundary: source MDX plus generated registry JSON, with archived release page using the same Plate UI data mapping as current releases
  - Why not quick patch: manually editing generated JSON would drift from the changelog source
  - Why not broader change: no registry component/package API behavior changed
- Verified: generator tests, registry route tests, www typecheck, lint, HTTP route proof
- PR body verified: N/A, no PR requested

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
- PR: N/A
- Issue / tracker: N/A
- Browser proof: `/docs/releases/51` returned 200 and rendered v51 Plate UI text via HTTP HTML check
- Caveats: Browser tool/screenshot and console/network checks unavailable in this resumed tool set

Timeline:
- 2026-06-13T08:43:10.082Z Task goal plan created.
- Audited v51 release PRs and registry file touches.
- Backfilled v51 rows into `tooling/data/plate-ui-changelog.mdx`.
- Ran generator write and verified 18 total changelog events.
- Patched archived releases page to render Plate UI changelog cards.
- Ran generator tests, registry route tests, `www` typecheck, lint, and HTTP proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Completion checker and final response |
| What is the goal? | Add v51 Plate UI changelog entries and render them on release docs |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Low: Browser screenshot/console proof was unavailable, but static HTML and JSON endpoints prove the affected route/output.
