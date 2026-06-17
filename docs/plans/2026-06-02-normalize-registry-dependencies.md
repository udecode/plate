# normalize registry dependencies

Objective:
Normalize Plate registry dependency semantics to shadcn convention; done when source/output reject @shadcn/* and checks/browser proof pass.

Goal plan:
docs/plans/2026-06-02-normalize-registry-dependencies.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- agent-native (docs/plans/templates/packs/agent-native.md)
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user request
- id / link: thread message, 2026-06-02
- title: Normalize Plate registry dependency source to shadcn convention
- acceptance criteria: Plate self-dependencies are explicit `@plate/*`; upstream
  shadcn dependencies are bare names like `command`; generated public registry
  output contains no `@shadcn/*`; scripts share one dependency convention;
  relevant tests, typecheck, lint, and browser proof pass.

Completion threshold:
- `apps/www/src/registry/**` has no `@shadcn/*` dependency strings.
- Public registry normalization preserves `@plate/*` and leaves shadcn default
  item names bare.
- Source/check scripts fail on stale `@shadcn/*` registry dependencies.
- Focused registry tests, source checks, `www` typecheck, lint, and browser
  proof pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-normalize-registry-dependencies.md` passes.

Verification surface:
- Source audit: `rg -n "@shadcn/" apps/www/src/registry apps/www/public/r apps/www/public/rd`.
- Runtime/source check: `pnpm --filter www exec tsx scripts/check-registry-source.mts`.
- Tests: `pnpm --filter www exec bun test scripts/registry-dependencies.test.mts src/app/r/registries.json/route.test.ts src/lib/plate-init.test.ts`.
- Typecheck: `pnpm --filter www typecheck`.
- Lint: `pnpm lint:fix`.
- Browser: verify `/r/registries.json` and at least one generated registry item
  through the in-app Browser/dev server.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.agents/rules/shadcn-parity.mdc`, `apps/www/src/registry/**`,
  and `apps/www/scripts/**`.
- Allowed edit scope: registry source semantics, registry dependency helpers,
  focused tests/checks, generated skill sync from rule changes, and this plan.
- Browser surface: `http://localhost:3003/r/registries.json` plus a registry item
  endpoint that exercises registry dependencies.
- Tracker sync: N/A, no external tracker.
- Non-goals: no `build:registry`; no template hand edits; no shadcn CLI fork;
  no broad registry folder rewrite beyond dependency semantics.

Output budget strategy:
- Searches are scoped to registry/script/rule paths and capped. Broad registry
  audits report counts and samples only.

Blocked condition:
- Stop only if upstream shadcn cannot resolve bare default items, source import
  cannot identify Plate item names, or required dev/browser verification is
  blocked by server/tool failure after focused retries.

Task state:
- task_type: implementation
- task_complexity: normal
- current_phase: closeout
- current_phase_status: completed
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: implement source convention flip
- confidence: high
- next owner: task
- reason: shadcn CLI resolves bare `command`; every existing bare registry dep
  is a Plate item, so the rewrite is mechanically auditable.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-normalize-registry-dependencies.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Used `autogoal` and `shadcn-parity`; Browser skill loaded before browser proof. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal. |
| Source of truth read before edits | yes | Read `.agents/skills/autogoal/SKILL.md`, `.agents/skills/shadcn-parity/SKILL.md`, `.agents/rules/shadcn-parity.mdc`, registry helper/source files. |
| Tracker comments and attachments read | N/A | No external tracker. |
| Video transcript evidence required | N/A | No video evidence. |
| `docs/solutions` checked for non-trivial existing-code work | N/A | Registry convention cleanup; memory and local source are the relevant prior context. |
| TDD decision before behavior change or bug fix | yes | Update existing focused registry helper/source tests; no new red-first path needed for mechanical convention cleanup. |
| Branch decision for code-changing task | N/A | User did not ask for branch/PR. |
| Release artifact decision | yes | Registry/source/tooling only; no package changeset. Changelog N/A because no component behavior/content change. |
| Browser tool decision for browser surface | yes | Use in-app Browser after dev route verification. |
| PR expectation decision | N/A | User did not ask for PR. |
| Tracker sync expectation decision | N/A | No tracker. |
| Output budget strategy recorded | yes | See Output budget strategy section. |
| Agent-native pack selected | yes | `.agents/rules/shadcn-parity.mdc` will change. |
| Agent-facing action surface identified | yes | `shadcn-parity` registry dependency rules. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/shadcn-parity.mdc`; run `pnpm install` to sync `.agents/skills/shadcn-parity/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded `.agents/skills/agent-native-reviewer/SKILL.md`; no UI action parity gap because this changed registry semantics and an agent rule. |
| Browser pack selected | yes | Registry routes are browser-visible. |
| Browser route / app surface identified | yes | `/r/registries.json` and `/r/ai-menu.json` on dev server. |
| Browser tool decision recorded | yes | Use repo-approved Browser plugin. |
| Console/network caveat policy recorded | yes | Record route status/body checks; console noise is not material for JSON endpoints unless Browser reports runtime errors. |

Work Checklist:
- [x] Objective includes outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `check-registry-source`, focused tests, source audit, `www` typecheck, lint, Browser proof all passed. |
| Bug reproduced before fix | N/A | Record failing test/repro or N/A with reason | Convention cleanup, not a bug repro. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter www exec bun test scripts/registry-dependencies.test.mts src/lib/plate-init.test.ts src/app/r/registries.json/route.test.ts` passed 9 tests. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | No package exports/barrels changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | No package manifest/lockfile changes; `pnpm install` still ran for agent rule sync. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; `rg` verified `.agents/skills/shadcn-parity/SKILL.md` mirror. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`; app checks owned by `apps/www`; Browser used `http://localhost:3003`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Browser verified `/r/registries.json` and `/api/registry-source/ai-menu`. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Browser JSON proof recorded in Verification evidence; screenshot not needed for JSON endpoints. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | Did not edit templates or run `build:registry`; generated registry output is CI-owned and intentionally left stale locally. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | No package release surface changed. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | Registry metadata/tooling semantics changed, not component behavior or registry component content. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | No `content/**` docs changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: bare shadcn deps could resolve as Plate deps. Fixed by explicit `@plate/*` source convention plus source guard/tests. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | Loaded reviewer; no UI action parity findings apply to rule text cleanup. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | No env-rot failure signals. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `.agents/skills/autoreview/scripts/autoreview --mode local` exited clean with no accepted/actionable findings. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | User did not ask for PR. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | No PR. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | No PR proof image. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | No tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were scoped/capped; one Browser skill read was large because the skill required full-file load. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-normalize-registry-dependencies.md` | Passed. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; generated `shadcn-parity` skill contains the new rule. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg` found the new bare-name and compatibility-input rules in source and generated skill. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Loaded; N/A for action parity. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Browser loaded `/r/registries.json` and `/api/registry-source/ai-menu`. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Browser dev logs for the verified route returned `[]` errors. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | JSON route proof recorded; screenshot not needed for JSON endpoints. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | Read skill/rule/source files; verified shadcn CLI resolves both `command` and `@shadcn/command`; audited current bare deps. | implementation |
| Implementation | completed | Rewrote source deps, centralized registry assembly, updated helper/check/tests/rule/rehype resolution. | verification |
| Verification | completed | Focused tests, source checks, typecheck, lint, Browser proof, autoreview all passed. | closeout |
| PR / tracker sync | N/A | User did not ask for PR; no tracker. | final response |
| Closeout | completed | Plan ledger filled; final checker rerun after status correction. | final response |

Findings:
- shadcn CLI resolves both `command` and `@shadcn/command`, so `@shadcn/*` is compatibility syntax, not required.
- All 173 pre-existing bare deps were Plate items; source convention could be safely flipped by making Plate deps explicit `@plate/*`.
- Local generated registry output under `apps/www/src/__registry__` is stale but CI-owned; it was not regenerated locally.

Decisions and tradeoffs:
- Keep TypeScript registry source because Plate registry data is computed and metadata-heavy.
- Centralize registry assembly through `createPlateRegistry()` instead of duplicating item lists in build/check scripts.
- Use bare names for default shadcn deps and explicit `@plate/*` for Plate self-deps.

Implementation notes:
- `apps/www/src/registry/**` registry dependency strings were AST-rewritten only inside `registryDependencies` arrays.
- `apps/www/scripts/registry-dependencies.mts` now strips legacy `@shadcn/*` to bare names and exposes `toPlateRegistryDependencySpecifier()` for synthetic Plate deps.
- `apps/www/src/lib/rehype-utils.ts` resolves `@plate/*`, legacy `@shadcn/*`, and bare shadcn deps without treating bare `command` as Plate.
- `.agents/rules/shadcn-parity.mdc` was updated and synced to `.agents/skills/shadcn-parity/SKILL.md`.

Review fixes:
- Autoreview reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Temp TSX rewrite script outside package could not resolve `typescript` | 1 | Run rewrite from app workspace with Node/TypeScript resolver anchored to `apps/www` | Resolved |
| Node heredoc mixed `require` with top-level await | 1 | Wrap rewrite in async CommonJS IIFE | Resolved |
| `pnpm --filter www typecheck` found stale `rehype-utils` helper references | 1 | Patch remaining source-file resolver path to use `resolveRegistryDependency()` | Resolved |
| `pnpm lint:fix` found dead `NAME` constant | 1 | Remove unused constant and rerun lint | Resolved |

Verification evidence:
- `pnpm install` passed and synced generated agent skills.
- `rg -n 'bare names like|compatibility input only|prefer `@shadcn|@shadcn/' .agents/rules/shadcn-parity.mdc .agents/skills/shadcn-parity/SKILL.md` verified generated skill sync.
- `pnpm --filter www exec tsx scripts/check-registry-source.mts` passed.
- `pnpm --filter www exec bun test scripts/registry-dependencies.test.mts src/lib/plate-init.test.ts src/app/r/registries.json/route.test.ts` passed 9 tests.
- Source audit: registry source has `shadcnPrefixed: 0`, `platePrefixed: 173`, bare deps limited to upstream shadcn names: `alert-dialog`, `avatar`, `button`, `calendar`, `checkbox`, `command`, `context-menu`, `dialog`, `dropdown-menu`, `form`, `hover-card`, `input`, `label`, `popover`, `radio-group`, `select`, `separator`, `tooltip`.
- Normalized `ai-menu` output deps audited as `command`, `popover`, `@plate/use-chat`, `@plate/editor-base-kit`, `@plate/ai-node`.
- `pnpm --filter www typecheck` passed.
- `pnpm lint:fix` passed.
- Browser proof on `http://localhost:3003`: `/r/registries.json` returned `@plate`; `/api/registry-source/ai-menu` returned 120 source files and Browser dev error logs were empty.
- `.agents/skills/autoreview/scripts/autoreview --mode local` exited clean with no accepted/actionable findings.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-02-normalize-registry-dependencies.md` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high.
- Flow table:
  - Reproduced: N/A, convention cleanup.
  - Verified: focused tests/typecheck/lint/source checks passed; Browser registry routes passed.
- Browser check: `http://localhost:3003/r/registries.json` and `/api/registry-source/ai-menu` verified; no Browser dev error logs.
- Outcome: Plate registry source now uses explicit `@plate/*` for Plate deps and bare shadcn names for upstream deps.
- Caveat: generated registry output was not rebuilt locally because repo policy reserves registry build output for CI.
- Design:
  - Chosen boundary: source registry semantics plus shared build/check helper.
  - Why not quick patch: only removing `@shadcn/` would make bare `command` vulnerable to Plate-dep rewriting.
  - Why not broader change: full registry folder rewrite is unnecessary while Plate still needs computed registry metadata.
- Verified: see Verification evidence.
- PR body verified: N/A, no PR.

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
- Browser proof: `/r/registries.json` and `/api/registry-source/ai-menu` passed on `http://localhost:3003`.
- Caveats: Generated registry output not rebuilt locally by policy.

Timeline:
- 2026-06-02T11:18:09.184Z Task goal plan created.
- 2026-06-02T11:23Z Registry source dependencies AST-rewritten.
- 2026-06-02T11:31Z Focused tests and source checks passed.
- 2026-06-02T11:36Z `pnpm install` synced generated skill mirror.
- 2026-06-02T11:44Z Typecheck, lint, Browser proof, and autoreview passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run final goal checker and hand off |
| What is the goal? | Normalize Plate registry dependency semantics to shadcn convention |
| What have I learned? | `@shadcn/*` is compatible but unnecessary; Plate deps need explicit `@plate/*` to make bare shadcn deps safe. |
| What have I done? | See Timeline |

Open risks:
- None requiring follow-up. Generated registry output remains stale locally by policy and will refresh in CI.
