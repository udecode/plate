# 4650 indexeddb yjs provider

Objective:
Complete #4650 replacement IndexedDB Yjs provider; done when provider/docs/changeset/tests/check/PR are complete.

Goal plan:
docs/plans/2026-06-15-4650-indexeddb-yjs-provider.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: GitHub PR
- id / link: https://github.com/udecode/plate/pull/4650
- title: yjs: wip adding indexeddb yjs provider wrapper
- acceptance criteria: add a first-party IndexedDB provider for `@platejs/yjs`, address stale PR review concerns, wire registry/types/exports, update docs, add a changeset, verify package behavior, and open a replacement PR crediting @dpnova.

Completion threshold:
- `@platejs/yjs` exposes a built-in `indexeddb` provider that shares the plugin-owned `Y.Doc`, tracks connect/sync/destroy state honestly, and is covered by focused tests.
- Collaboration docs and package README show the current `providers` API and IndexedDB provider shape without stale `providerConfigs` / `customProviders` drift.
- `.changeset` exists for `@platejs/yjs`, generated barrels are current, package install graph resolves, focused tests/typecheck/lint/check pass or any blocker is recorded, and a task-style PR is opened against `main` with @dpnova credit.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4650-indexeddb-yjs-provider.md` passes.

Verification surface:
- `bun test ./packages/yjs/src/lib/providers/indexeddb-provider.spec.ts`
- `bun test ./packages/yjs/src/lib/providers/registry.spec.ts ./packages/yjs/src/lib/providers/indexeddb-provider.spec.ts`
- `pnpm turbo typecheck --filter=./packages/yjs`
- `pnpm lint:fix`
- `pnpm check`
- `pnpm brl`
- `pnpm --filter www build:source` for MDX/docs parse if `content/docs/**` changes.
- `gh pr view --json body` after PR creation.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: PR #4650 body/comments/review/diff, current `packages/yjs` provider registry, `BaseYjsPlugin`, current Collaboration docs, `y-indexeddb@9.0.12` types.
- Allowed edit scope: `packages/yjs/**`, `content/docs/(plugins)/(collaboration)/yjs*.mdx`, generated barrels/lockfile, `.changeset/**`, this plan.
- Browser surface: docs text/API change only; user waived demo if env setup is required. Browser proof N/A unless docs route check is cheap after content build.
- Tracker sync: open replacement PR and comment back on #4650 after PR exists.
- Non-goals: no Yjs demo wiring, no new custom provider API, no broader collaboration rewrite.

Output budget strategy:
- Use exact file reads and targeted `rg` only. Avoid broad `docs/solutions` output; if broad search is needed, use file lists/counts first and then open exact hits.

Blocked condition:
- Stop only if current package checks reveal a real upstream `y-indexeddb`/Bun/browser API limitation that prevents a safe provider contract, or if `check` fails for unrelated repo-wide breakage after one reinstall/rerun pass.

Task state:
- task_type: feature completion from stale public PR
- task_complexity: normal, package/API plus docs
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready for completion

Current verdict:
- verdict: partially valid
- confidence: high
- next owner: task
- reason: #4650 correctly identifies an IndexedDB provider gap, but its implementation is incomplete and stale: conflicting draft, optional `ydoc` mismatch, no registry/barrel, no tests, no changeset, and stale docs/API names.

Pre-solution issue challenge:
- reporter claim: add IndexedDB Yjs provider wrapper.
- suggested diagnosis or fix: PR adds `IndexeddbProviderWrapper` but passes `options.ydoc` to `IndexeddbPersistence`, keeps stale state after destroy, stores unused awareness without explanation, and omits registry/export/test/release wiring.
  - repro ladder:
  - tests / source-level repro: N/A for feature request; current source audit proves no built-in `indexeddb` provider exists.
  - Playwright / automated browser: N/A; no browser-visible bug claim.
  - Browser plugin: N/A; user explicitly waived demo if env setup is required and this is package API/docs work.
  - screenshot / visual proof: N/A; no layout/native visual state.
- reproduction verdict: N/A: feature completion, not a behavior bug.
- validity verdict: partially valid.
- best long-term fix boundary: provider registry/type union/docs/changelog in `@platejs/yjs`, not a one-off custom-provider recipe.
- harsh honest feedback: the old PR is a good seed but not mergeable; taking it as-is would ship silent doc/document mismatch and stale lifecycle state.
- hard-stop decision: pivot, do not merge/rebase the stale draft.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4650-indexeddb-yjs-provider.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, `autoreview`, `tdd`, `changeset`, and `docs-creator` because this is issue-backed package/API/docs work. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created active goal for this plan. |
| Source of truth read before edits | yes | `gh pr view 4650 --json ...` read body, reviews, comments, commits, conflict/draft state. |
| Tracker comments and attachments read | yes | PR comments and review were read; no attachments/videos. |
| Video transcript evidence required | no | N/A: no video/screen recording evidence. |
| Pre-solution issue challenge required | yes | Public PR with suggested fix reviewed before code. |
| Reproduction verdict before implementation | yes | N/A feature request; source audit confirms missing built-in provider. |
| Repro escalation ladder selected | yes | Tests/source-level source audit only; browser levels N/A for feature request. |
| Suggested fix reviewed against durable boundary | yes | Old implementation rejected; provider registry/type/docs boundary selected. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Relevant exact hit read: `docs/solutions/test-failures/2026-03-22-yjs-slow-tests-need-explicit-bun-paths-and-bootstrapped-shared-types.md`. |
| TDD decision before behavior change or bug fix | yes | Focused provider behavior spec added first and failed on missing module before implementation. |
| Branch decision for code-changing task | yes | Current branch was `main`; pulled and created `codex/4650-indexeddb-yjs-provider`. |
| Release artifact decision | yes | `.changeset` required for published `@platejs/yjs` feature. |
| Browser tool decision for browser surface | yes | N/A unless docs route check is cheap; user waived demo if env setup required. |
| PR expectation decision | yes | Task requires replacement PR before tracker sync-back. |
| Tracker sync expectation decision | yes | Comment on #4650 after replacement PR exists. |
| Output budget strategy recorded | yes | Exact file reads after one broad-search miss; avoid broad streamed output. |
| Package/API pack selected | yes | `--with package-api` applied. |
| Public surface or package boundary identified | yes | `@platejs/yjs` provider config/type/registry/export/public docs. |
| Release artifact path selected | yes | `.changeset` for `@platejs/yjs`. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded `changeset` before writing changeset. |
| Barrel/export impact decision recorded | yes | New exported provider file requires `pnpm brl`. |
| Docs pack selected | yes | `--with docs` applied. |
| `docs-creator` loaded | yes | Loaded before docs edits. |
| Docs lane selected | yes | Plugin/feature docs plus package README. |
| Target docs and nearest sibling docs read | yes | Read `content/docs/(plugins)/(collaboration)/yjs.mdx` and `packages/yjs/README.md`; source owner is `packages/yjs`. |
| Docs style doctrine read | yes | Read full `docs-creator` skill. |
| Documented source owner identified | yes | `BaseYjsPlugin`, provider registry, provider types, and provider wrappers own behavior. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm check` passed in `/Users/zbeyens/git/plate`. |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Recorded above: #4650 is partially valid; stale draft rejected in favor of current provider boundary. |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Feature completion, not a bug repro; source audit plus focused tests used. Browser and screenshot N/A. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A feature gap; RED test proved missing provider file before implementation. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `bun test ./packages/yjs/src/lib/BaseYjsPlugin.init.spec.ts ./packages/yjs/src/lib/providers/hocuspocus-provider.spec.ts ./packages/yjs/src/lib/providers/indexeddb-provider.spec.ts ./packages/yjs/src/lib/providers/registry.spec.ts ./packages/yjs/src/lib/providers/webrtc-provider.spec.ts` passed: 36 tests, 186 expects. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/yjs` passed. |
| Package exports or file layout changed | yes | Run `pnpm brl` before final verification and keep generated barrel updates | `pnpm brl` passed and updated `packages/yjs/src/lib/providers/index.ts`. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` updated lockfile; `pnpm check` passed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/**` or generated skill changes. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate`; focused tests target `packages/yjs`. |
| Browser surface changed | no | Capture Browser Use proof or record explicit waiver/blocker | N/A: package API/docs text change; user explicitly said no demo needed if env setup is required. |
| Browser final proof | no | Attach screenshot or exact browser verification caveat when browser proof applies | N/A: no browser proof required for this package/docs API task. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` changes. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | `.changeset/yjs-indexeddb-provider.md` adds a minor changeset for `@platejs/yjs`. |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no `apps/www/src/registry/**` user-visible registry output changed. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Docs claim audit against `BaseYjsPlugin`, provider types, registry, and wrappers; `pnpm --filter www build:source` passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risks: doc mismatch, fallback seeding over local persistence, DB-open leaks. Covered by provider/init tests and clean autoreview. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no install-corruption signature; normal `pnpm install` handled dependency graph. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | `.agents/skills/autoreview/scripts/autoreview --mode local` passed clean after accepted lifecycle/data-safety fixes. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | `pnpm check` passed before PR creation. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | `gh pr view 5027 --json url,title,body,headRefName,baseRefName,isDraft` verified auto-release block, `Completes udecode/plate#4650`, confidence line, required phase table, Outcome/Caveat/Design/Verified sections, and no current-PR self-link. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no browser proof image. |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Commented on #4650: https://github.com/udecode/plate/pull/4650#issuecomment-4711461056 |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below with PR #5027, tracker comment, confidence, browser N/A, and verification list. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed; `pnpm check` lint passed with one existing sidebar warning. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | One early broad `rg` over docs produced too much output; recovered with targeted reads. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-15-4650-indexeddb-yjs-provider.md` | Running as the final closeout check. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `DefaultYjsProviderType`, `YjsProviderConfig`, provider registry, barrel export, docs, README, and package dependency updated. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package behavior/API/types/runtime delta for `@platejs/yjs`. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | `.changeset/yjs-indexeddb-provider.md` minor for `@platejs/yjs`; no forbidden core/slate/platejs minor. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: package feature, not registry-only. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: release artifact required and added. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Focused Yjs suite, `pnpm turbo typecheck --filter=./packages/yjs`, and full `pnpm check` passed. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Docs examples match `providers: [{ type: 'indexeddb', options: { docName } }]`, registry/type exports, and package dependency shape. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Docs edit adds package/API reference prose only; no new preview route. Existing links kept. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:contentlayer` for MDX/content changes, or record N/A | `pnpm --filter www build:source` passed for Fumadocs source generation. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | `docs-creator` loaded; docs written as current-state reference, not migration/changelog prose. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | PR #4650 source/review/diff, provider registry/types, BaseYjsPlugin, docs page/README, y-indexeddb types, relevant Yjs solution note. | implementation |
| Implementation | complete | `IndexeddbProviderWrapper`, provider lifecycle state, registry/types/export, package dependency, README/docs, and changeset added. | verification |
| Verification | complete | Focused Yjs suite, package typecheck, docs source build, lint, autoreview, `pnpm brl`, and `pnpm check` passed. | PR / tracker sync |
| PR / tracker sync | complete | PR #5027 opened and body verified; #4650 sync-back comment posted. | closeout |
| Closeout | complete | This plan records final evidence and is ready for autogoal completion check. | final response |

Findings:
- PR #4650 is a conflicting draft with useful intent but incomplete/stale implementation.
- `y-indexeddb@9.0.12` exports `IndexeddbPersistence(name: string, doc: Y.Doc)`, not `IndexeddbProvider`.
- Current `BaseYjsPlugin` creates providers through `createProvider({ awareness, doc: ydoc, options, type, handlers })`; IndexedDB must use that shared `doc`, not an options-owned `ydoc`.
- `packages/yjs/README.md` still teaches removed `providerConfigs`, `customProviders`, and `waitForAllProviders`; the docs page uses the current `providers` option.
- Peer-only `y-indexeddb` would make the exported provider import unsafe for consumers; `y-indexeddb` belongs in `dependencies`.

Decisions and tradeoffs:
- Defer `IndexeddbPersistence` construction until `connect()` so `autoConnect: false` does not silently start local persistence.
- Keep `docName` as the only IndexedDB option; the plugin owns `Y.Doc` and `Awareness`.
- `disconnect()` destroys the local persistence binding and allows reconnect to create a fresh binding; `destroy()` permanently prevents reconnect.
- Awareness is retained only to satisfy `UnifiedProvider`; IndexedDB does not transport awareness.
- Local persistence is not a network sync source: it can unblock init only when it restores real shared state, and fallback seeding is skipped while local persistence is still loading.

Implementation notes:
- Added `packages/yjs/src/lib/providers/indexeddb-provider.spec.ts`.
- Added `packages/yjs/src/lib/providers/indexeddb-provider.ts`.
- Added `indexeddb` to `DefaultYjsProviderType`, `YjsProviderConfig`, and provider registry.
- Added `y-indexeddb` dependency and ran `pnpm install`.
- Rewrote the package README around the current `providers` API and documented IndexedDB in the docs page and Chinese docs page.

Review fixes:
- Autoreview P1: empty local persistence could satisfy the network sync gate; fixed by treating IndexedDB as local persistence and gating initial sync/fallback seeding.
- Autoreview P2: exported provider import made peer-only `y-indexeddb` unsafe; fixed by making `y-indexeddb` a direct dependency.
- Autoreview P1/P2 follow-ups: persisted empty Yjs content, including custom `sharedType`, could be overwritten; fixed with shared-root state/tombstone detection and tests.
- Autoreview P2/P3 follow-ups: IndexedDB open failure and fast disconnect before open could leak listeners or report false connection state; fixed with connection/sync-loading lifecycle signals, cleanup, and tests.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg` over `docs/solutions docs/plans` streamed too much output | 1 | Use exact solution file reads and capped targeted searches only | Recovered by reading only the Yjs slow-test solution hit. |
| Registry-first test run could cache the provider before the provider spec mock | 1 | Import provider spec with a unique query per harness | Fixed; registry-first combined test now passes. |

Verification evidence:
- RED: `bun test ./packages/yjs/src/lib/providers/indexeddb-provider.spec.ts` failed with missing `./indexeddb-provider` before implementation.
- GREEN: `bun test ./packages/yjs/src/lib/providers/indexeddb-provider.spec.ts` passed: 4 tests, 32 expects.
- GREEN: `bun test ./packages/yjs/src/lib/providers/registry.spec.ts ./packages/yjs/src/lib/providers/indexeddb-provider.spec.ts` passed: 8 tests, 40 expects, including registry-first order.
- GREEN: `bun test ./packages/yjs/src/lib/BaseYjsPlugin.init.spec.ts ./packages/yjs/src/lib/providers/hocuspocus-provider.spec.ts ./packages/yjs/src/lib/providers/indexeddb-provider.spec.ts ./packages/yjs/src/lib/providers/registry.spec.ts ./packages/yjs/src/lib/providers/webrtc-provider.spec.ts` passed: 36 tests, 186 expects.
- GREEN: `pnpm turbo typecheck --filter=./packages/yjs` passed.
- GREEN: `pnpm --filter www build:source` passed.
- GREEN: `pnpm lint:fix` passed.
- GREEN: `.agents/skills/autoreview/scripts/autoreview --mode local` passed clean after accepted fixes.
- GREEN: `pnpm brl` passed.
- GREEN: `pnpm check` passed. Existing warnings only: `apps/www/src/components/ui/sidebar.tsx` hook warning and the known multiple `@platejs/core` instance test log.
- GREEN: `gh pr view 5027 --json url,title,body,headRefName,baseRefName,isDraft` verified PR body format.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5027
- Issue / tracker line: https://github.com/udecode/plate/pull/4650#issuecomment-4711461056
- Confidence line: 95% confidence
- Flow table:
  - Reproduced: source audit plus RED provider test; browser N/A.
  - Verified: focused tests, package typecheck, docs source build, lint, autoreview, `pnpm brl`, `pnpm check`; browser N/A.
- Browser check: N/A: package API/docs work; user waived demo if env setup required.
- Outcome: `@platejs/yjs` exposes built-in `indexeddb` provider support through current provider config/types/registry/docs.
- Caveat: no demo/browser proof; package behavior is covered by provider/init tests and full repo check.
- Design:
  - Chosen boundary: `@platejs/yjs` provider registry/types/wrapper/docs.
  - Why not quick patch: stale PR implementation had doc ownership/lifecycle/release/doc gaps.
  - Why not broader change: no need to redesign the collaboration API; current `providers` API is sufficient.
- Verified: see verification evidence above.
- PR body verified: yes, with `gh pr view 5027 --json url,title,body,headRefName,baseRefName,isDraft`.

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
- PR: https://github.com/udecode/plate/pull/5027
- Issue / tracker: https://github.com/udecode/plate/pull/4650#issuecomment-4711461056
- Browser proof: N/A: package API/docs work; no demo needed per user.
- Caveats: PR has one existing lint warning from `apps/www/src/components/ui/sidebar.tsx` during `pnpm check`; no failing checks locally.

Timeline:
- 2026-06-15T18:07:42.254Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Final response |
| What is the goal? | Complete #4650 replacement IndexedDB Yjs provider with package docs, changeset, checks, PR, and tracker sync. |
| What have I learned? | #4650 is partially valid but stale; durable boundary is `@platejs/yjs` provider registry/type/docs/lifecycle. |
| What have I done? | Implemented and verified the replacement provider, opened PR #5027, and synced back to #4650. |

Open risks:
- Remote CI still needs to run on PR #5027.
