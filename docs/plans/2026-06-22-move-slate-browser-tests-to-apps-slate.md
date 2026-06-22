# move slate browser tests to apps slate

Objective:
Move Slate browser tests to apps/slate; done when apps/www no longer owns Slate browser specs and apps/slate Chromium proof passes.

Goal plan:
docs/plans/2026-06-22-move-slate-browser-tests-to-apps-slate.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: chat correction
- id / link: N/A
- title: Remove apps/www ownership of Slate browser tests
- acceptance criteria: move Slate browser specs under `apps/slate`, remove
  `apps/www` Slate Playwright scripts/config/tests, keep the `apps/slate`
  browser lane runnable, and update source rules/docs that still route Slate
  browser specs through `apps/www`.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no timed run requested
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `apps/www/tests/slate-browser/**` no longer exists.
- `apps/www/playwright.slate.config.ts` and `www` Slate browser scripts are
  removed.
- Slate browser specs live under `apps/slate/tests/slate-browser/**`.
- `apps/slate` Playwright config/script paths point at the local test tree.
- Source rules/docs no longer instruct agents to run Slate browser specs
  through `apps/www`.
- Focused `apps/slate` Chromium proof passes.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-move-slate-browser-tests-to-apps-slate.md` passes.

Verification surface:
- Source audits for `apps/www/tests/slate-browser`, `playwright.slate.config`,
  and `pnpm --filter www ... slate-browser`.
- `pnpm install` after source rule/package script edits.
- `pnpm --filter slate test:slate-browser:chromium` as the owning browser
  proof.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-06-22-move-slate-browser-tests-to-apps-slate.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `apps/slate` owns Slate browser proof; `apps/www` owns docs
  and Plate playground routes, not Slate proof specs.
- Allowed edit scope: `apps/slate/**`, `apps/www/package.json`,
  `apps/www/playwright.slate.config.ts`, `apps/www/tests/slate-browser/**`,
  `.github/workflows/slate-ci.yml`, `.agents/AGENTS.md`,
  `.agents/rules/auto.mdc`, `.agents/rules/slate-ar.mdc`, and stale docs that
  directly name the old path.
- Browser surface: Slate examples served by `apps/slate`; no in-app Browser
  manual proof needed because this is test ownership relocation, not route UI
  behavior.
- Browser strategy: Playwright through `pnpm --filter slate
  test:slate-browser:chromium`. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A.
- Non-goals: no Plate runtime/default-route migration, no `apps/www`
  playground proof replacement, no docs route redesign, no changeset.

Output budget strategy:
- Use exact owner-file reads and scoped `rg` over `apps/slate`, `apps/www`,
  `.agents/rules`, `.github/workflows`, and selected docs. Avoid generated
  `apps/www/public/r/**`, `.next/**`, `out/**`, and broad docs ledgers.

Blocked condition:
- Stop only if moving the specs reveals they import `apps/www`-relative private
  paths that cannot be made local to `apps/slate` without a broader app
  architecture choice.

Task state:
- task_type: test ownership cleanup
- task_complexity: normal
- current_phase: intake
- current_phase_status: complete
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: high
- next owner: implementation
- reason: `apps/slate` already owns the runnable proof app and only points its
  config/scripts back to `apps/www/tests/slate-browser`; moving the files makes
  ownership match the command surface.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-move-slate-browser-tests-to-apps-slate.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements copied into objective, threshold, boundaries, and non-goals before file moves. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `auto` in prior turn and `autogoal` this turn; used task plan with browser/package packs. |
| Active goal checked or created | yes | `get_goal` returned none; created active goal for this packet. |
| Source of truth read before edits | yes | Read `apps/slate/playwright.config.ts`, `apps/slate/scripts/run-slate-browser.mjs`, `apps/slate/package.json`, `apps/www/package.json`, and focused rule/docs owners. |
| Tracker comments and attachments read | no | N/A: chat-only task, no tracker. |
| Video transcript evidence required | no | N/A: no media evidence. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: ownership cleanup has direct local source owners and no diagnostic pattern lookup needed. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change; browser proof covers command ownership. |
| Branch decision for code-changing task | no | N/A: user asked to edit current checkout; no branch/PR requested. |
| Release artifact decision | yes | N/A: test/docs/agent workflow ownership cleanup only, no published package user-visible delta. |
| Browser tool decision for browser surface | yes | Playwright is the durable proof owner; no in-app Browser needed because no rendered route UI changed. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker. |
| Output budget strategy recorded | yes | Recorded scoped owner-file reads and excluded generated/high-volume outputs. |
| Browser pack selected | yes | Browser pack applies through `apps/slate` Playwright. |
| Browser route / app surface identified | yes | Slate example proof app served by `apps/slate`, default `http://localhost:3102`. |
| Browser tool decision recorded | yes | Use `pnpm --filter slate test:slate-browser:chromium`, not `apps/www`. |
| Console/network caveat policy recorded | yes | Playwright suite owns route/runtime error checks; this packet does not claim manual console inspection. |
| Package/API pack selected | yes | Package boundary applies because scripts/config and CI command ownership changed. |
| Public surface or package boundary identified | yes | Internal test-command boundary only; no public package API. |
| Release artifact path selected | no | N/A: internal test ownership cleanup. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required. |
| Barrel/export impact decision recorded | no | N/A: no exported package file layout changed. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no media.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason. N/A: no branch requested.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason. N/A: no env-rot signal.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A: small mechanical ownership move with deterministic proof.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exports/barrels.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit, typecheck, browser proof, and final plan check | Source audit clean; `pnpm --filter slate typecheck` passed; `pnpm --filter slate test:slate-browser:chromium` passed; final check below. |
| Bug reproduced before fix | no | N/A: ownership cleanup, not bug fix | No repro needed. |
| Targeted behavior verification | yes | Run focused proof for moved browser lane | `pnpm --filter slate test:slate-browser:chromium` passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter slate typecheck` passed. |
| Package exports or file layout changed | no | N/A: no public package exports changed | No `pnpm brl`. |
| Package manifests, lockfile, or install graph changed | yes | Run install and package checks | `pnpm install` passed; lockfile stayed current. |
| Agent rules or skills changed | yes | Run install and verify generated skill sync | `pnpm install` regenerated `auto` and `slate-ar` mirrors; source audit clean. |
| Workspace authority proof | yes | Run owning app proof from repo root | Commands run from `/Users/zbeyens/git/plate-2`; browser proof owned by `apps/slate`. |
| Browser surface changed | yes | Prove moved browser lane | `pnpm --filter slate test:slate-browser:chromium` passed; no manual route UI changed. |
| Browser final proof | yes | Attach browser proof result | 594 Chromium tests ran first, then serialized tails; total result 587 passed / 7 skipped, then 3 passed, 45 passed, 46 passed / 1 skipped. |
| CI-controlled template output changed | no | N/A | No template output touched. |
| Package behavior or public API changed | no | N/A: internal test/script ownership only | No changeset. |
| Registry-only component work changed | no | N/A | No registry work. |
| Docs or content changed | yes | Verify source-backed docs/rules path claims | Focused source audit clean after updates. |
| High-risk mini gate | yes | Record failure mode and proof | Risk was stale command ownership and app typecheck swallowing Playwright specs; fixed with local testDir, docs/rules update, and `tests` tsconfig exclusion. |
| Agent-native review for agent/tooling changes | no | N/A: generated mirror sync plus focused source audit is enough for path-only command guidance | Mirrors verified by `rg`. |
| Local install corruption suspected | no | N/A | No env-rot signal. |
| Autoreview for non-trivial implementation changes | no | N/A: mechanical test ownership move with deterministic browser/typecheck proof | No reviewer needed. |
| PR create or update | no | N/A | No PR requested. |
| Task-style PR body verified | no | N/A | No PR requested. |
| PR proof image hosting | no | N/A | No PR/browser image. |
| Tracker sync-back | no | N/A | No tracker. |
| Final handoff contract | yes | Fill final handoff fields | Filled below. |
| Final lint | yes | Run scoped equivalent | `pnpm exec biome check --fix apps/slate/playwright.config.ts apps/slate/scripts/run-slate-browser.mjs apps/slate/tsconfig.json apps/www/package.json` passed and fixed formatting. |
| Output budget discipline | yes | Record miss and recovery | One broad `rg` hit generated docs output; recorded in errors and reran with exact Node literal scan. |
| Timed checkpoint | no | N/A | No duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-22-move-slate-browser-tests-to-apps-slate.md` | See final verification. |
| Browser interaction proof | yes | Exercise target route/interaction through owning Playwright lane | `apps/slate` Chromium suite passed. |
| Browser console/network check | yes | Covered by route test harness where specs assert runtime errors; no manual console proof claimed | Playwright proof only. |
| Browser final proof artifact | yes | Record trace/screenshot caveat | No artifact attached because suite passed without screenshot; output recorded. |
| Public API / package boundary proof | yes | Source-audit public API/export impact | No exported package API/barrel changed; only app scripts/config/tests and source guidance. |
| Release artifact classification | yes | Classify diff | Internal test/docs/agent-only cleanup. |
| Published package changeset | no | N/A: no published package delta | No changeset. |
| Registry changelog | no | N/A | No registry work. |
| No release artifact | yes | Record exact reason | Internal test/docs/agent-only cleanup; no runtime/public API delta. |
| Package typecheck/build/test | yes | Run owning checks | `pnpm --filter slate typecheck`; `pnpm --filter slate test:slate-browser:chromium`. |
| Barrel/export generation | no | N/A: no exports changed | No `pnpm brl`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read owning app config/scripts/package files and focused rule/docs owners. | implementation |
| Implementation | complete | Moved spec tree, deleted `apps/www` Slate Playwright config/scripts/tests, updated `apps/slate` paths, CI path filters, and source rules/docs. | verification |
| Verification | complete | Source audit clean; typecheck/browser/lint/install passed. | closeout |
| PR / tracker sync | N/A | No PR/tracker requested. | final response |
| Closeout | complete | Plan filled and mechanical check run. | final response |

Findings:
- `apps/slate/playwright.config.ts` already owned the runnable proof app but
  pointed `testDir` at `../www/tests/slate-browser`.
- `apps/slate/scripts/run-slate-browser.mjs` special-cased pagination,
  synced-blocks, and check-lists through `../www/tests/slate-browser`.
- `apps/www` had Slate browser scripts/config that duplicated ownership and
  made the Plate docs app look like the Slate proof owner.
- Moving tests under `apps/slate` made `apps/slate` app typecheck include
  Playwright specs; excluding `tests` preserves the old typecheck boundary.

Decisions and tradeoffs:
- Keep Slate examples sourced from `apps/www/src/app/(app)/examples/slate`;
  only browser specs move to `apps/slate/tests/slate-browser`.
- Delete `apps/www/tests/slate-browser/playground.spec.ts` instead of moving it;
  it was a Plate playground proof and was already ignored by the Slate proof
  app config.
- Do not add test-only deps like `@faker-js/faker` to `apps/slate`; Playwright
  owns spec execution, app typecheck owns app/config source.

Implementation notes:
- Moved `apps/www/tests/slate-browser/**` to
  `apps/slate/tests/slate-browser/**`.
- Removed `apps/www/playwright.slate.config.ts` and `apps/www` Slate browser
  package scripts.
- Updated `.github/workflows/slate-ci.yml` path filters to
  `apps/slate/tests/slate-browser/**`.
- Updated `.agents/rules/auto.mdc`, `.agents/rules/slate-ar.mdc`, generated
  skill mirrors, and stale Slate docs path references.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad path audit streamed generated docs/public output | 1 | Use exact owner files and exclude generated outputs | Recovered with focused owner reads and a Node literal stale-string audit. |
| `pnpm --filter slate typecheck` included moved Playwright specs and failed on `@faker-js/faker` types | 1 | Keep app typecheck scoped to app/config source; Playwright owns specs | Added `"tests"` to `apps/slate/tsconfig.json` exclude; rerun passed. |
| Shell-quoted stale-string `rg` command failed with unmatched quote | 1 | Use literal Node scan for multi-pattern quote-heavy audits | Rerun passed with no stale ownership strings. |

Verification evidence:
- `pnpm install` passed and regenerated skill mirrors.
- Source audit: `apps/www/tests/slate-browser` and
  `apps/www/playwright.slate.config.ts` do not exist.
- Source audit: no stale `apps/www/tests/slate-browser`,
  `../www/tests/slate-browser`, `playwright.slate.config`, `pnpm --filter www
  test:slate-browser`, `playground.spec.ts`, or old `testDir` strings remain in
  active command/rule/doc surfaces.
- `pnpm --filter slate test:slate-browser:chromium` passed from
  `/Users/zbeyens/git/plate-2`: main suite 587 passed / 7 skipped, serialized
  check-lists 3 passed, synced-blocks 45 passed, pagination 46 passed / 1
  skipped.
- `pnpm --filter slate typecheck` passed.
- `pnpm exec biome check --fix apps/slate/playwright.config.ts
  apps/slate/scripts/run-slate-browser.mjs apps/slate/tsconfig.json
  apps/www/package.json` passed.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high; moved proof ownership is mechanically verified.
- Flow table:
  - Reproduced: N/A, ownership cleanup rather than bug repro
  - Verified: `apps/slate` Chromium browser lane and typecheck passed
- Browser check: `pnpm --filter slate test:slate-browser:chromium` passed.
- Outcome: Slate browser specs now live under `apps/slate`; `apps/www` no
  longer owns Slate Playwright tests/scripts/config.
- Caveat: historical docs/ledgers outside active command surfaces may still
  mention old paths as archival evidence.
- Design:
  - Chosen boundary: `apps/slate` owns browser proof specs and runner;
    `apps/www` owns example source and docs routes.
  - Why not quick patch: keeping specs under `apps/www` while scripts route
    through `apps/slate` was the confusing half-state.
  - Why not broader change: no Plate playground replacement or runtime
    migration was requested.
- Verified: install, source audit, typecheck, browser proof, scoped Biome.
- PR body verified: N/A.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: `pnpm --filter slate test:slate-browser:chromium` passed.
- Caveats: no `apps/www` playground proof replacement was created.

Timeline:
- 2026-06-22T09:00:19.005Z Task goal plan created.
- 2026-06-22 Moved Slate browser specs from `apps/www/tests/slate-browser` to
  `apps/slate/tests/slate-browser` and deleted the ignored Plate playground
  proof.
- 2026-06-22 Removed `apps/www` Slate Playwright config/scripts.
- 2026-06-22 Updated `apps/slate` Playwright config/runner paths and excluded
  tests from app typecheck.
- 2026-06-22 Updated CI path filters plus `auto`/`slate-ar` source rules and
  generated mirrors.
- 2026-06-22 Ran install, source audits, Slate browser Chromium proof,
  `apps/slate` typecheck, and scoped Biome.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response |
| What is the goal? | Move Slate browser tests to `apps/slate` and remove `apps/www` Slate Playwright ownership. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Historical ledgers/generated docs may still mention old paths as archival
  evidence; active command, rule, CI, and app surfaces are clean.
