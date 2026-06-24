# Plite beta public readiness closure

Objective:
Close Plite beta public-readiness; done when stale PR is handled, beta docs/deploy/package/browser proof passes, and share copy is ready.

Goal plan:
docs/plans/2026-06-20-slate-beta-public-readiness-closure.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: user-directed public readiness closure
- id / link: current thread, PR https://github.com/udecode/plate/pull/5037, local docs at http://localhost:3002/docs/plite
- title: Plite beta public-readiness closure
- acceptance criteria: close or otherwise resolve stale PR #5037; confirm pushed `next` deploy state; audit Plite beta docs as a skeptical external reader; run Plite/docs/browser proof gates; verify `@platejs/plite-*` package story; prepare concise Slack/share copy and caveat.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: user did not provide a duration.
- semantics: N/A: normal one-shot closure.
- initial confidence score: 72/100: docs and local browser proof are recently green, but live deploy, stale PR closure, package story, and final share copy still need current proof.
- improvement loop: raise confidence by resolving PR #5037, checking live beta deploy, auditing current Plite docs/package wording, running focused commands, and recording residual beta risk.
- final score / loop closure: 96/100. The named PR, deploy, docs, package,
  browser, Plite fast, docs parser, and lint gates are green. Remaining risk is
  human review of whether `@platejs/slate-legacy` should stay public for beta.

Completion threshold:
- Stale PR #5037 is closed or explicitly left open with evidence-backed reason.
- `beta.platejs.org` or the active next deployment is checked for the Plite docs route and reported honestly.
- Plite beta docs audit finds no stale install/package-path blockers or records exact remaining blockers.
- Required local gates pass or any failure is fixed/reported with owner: docs source check, Plite fast check, focused browser proof for `/docs/plite`, `/docs/plite/why-this-fork`, `/docs/plite/migration`, and `/examples/plite/richtext`.
- Package/public surface story for intended Plite beta packages is verified from current repo/package metadata and release artifacts.
- Slack/share copy and known beta caveat are ready.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-20-slate-beta-public-readiness-closure.md` passes.

Verification surface:
- GitHub live state for PR #5037 through `gh pr view` and close mutation if still stale.
- Live deploy/network check for `https://beta.platejs.org/docs/plite` and key leaf routes, or exact deployment blocker.
- Source audit of `content/docs/plite/**`, `content/docs/meta.json`, `apps/www/next.config.ts`, `package.json`, `apps/www/package.json`, package manifests for Plite beta package names.
- Commands: `pnpm --filter www check:docs`; `pnpm check:plite:fast` if available; focused browser route proof with Browser or curl fallback when Browser is unavailable.
- Final mechanical gate: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-20-slate-beta-public-readiness-closure.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them. Closing PR #5037 is allowed because the user said `go` after
  the lane proposal that named closing stale PR #5037 first.
- Do not add broad ceremony when the task is trivial or docs-only.
- Do not restart broad Plate migration or package architecture work in this goal.
- Do not silently publish or release packages.

Boundaries:
- Source of truth: current `next` checkout, live GitHub PR #5037, `beta.platejs.org` / local `localhost:3002`, Plite docs/package metadata.
- Allowed edit scope: Plite docs, docs nav/redirects, release/readiness notes, narrow package/docs metadata fixes if audit finds blockers.
- Browser surface: `/docs/plite`, `/docs/plite/why-this-fork`, `/docs/plite/migration`, `/examples/plite/richtext`.
- Browser strategy: Use Browser for normal app QA; use curl only for deploy reachability or when Browser proof is unavailable. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: PR #5037 close only; no issue comments unless a live blocker requires user approval.
- Non-goals: Plate runtime migration, npm publish, release promotion, broad package redesign, broad external issue ledgers.

Output budget strategy:
- Use focused `rg` patterns and package manifest reads; cap tool output; avoid streaming generated trees, `.next`, `apps/plite/out`, full Playwright traces, or broad docs dumps. Use counts/file lists before line dumps when auditing many docs.

Blocked condition:
- Block only if GitHub/Vercel/live network auth prevents current proof, package/deploy state cannot be inspected locally or live, or a failing required gate needs a public release/deployment credential outside this checkout.

Task state:
- task_type: public beta readiness closure
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: 96/100
- next owner: autogoal executing docs/browser/package/maintainer closure
- reason: stale PR is closed, live beta and local Browser routes are green,
  docs/package audits are clean, and Plite fast proof passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-20-slate-beta-public-readiness-closure.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint recorded PR #5037 closure, deploy/docs/package/browser proof, Slack copy, caveat, no broad migration, no publish. |
| Timed checkpoint parsed | no | N/A: user did not give a duration. |
| Skill analysis before edits | yes | Loaded `autogoal` and `docs-creator`; used task template with docs/browser/package-api packs. |
| Active goal checked or created | yes | Active goal created for this exact objective before durable closure work. |
| Source of truth read before edits | yes | Read target Plite docs, package manifests, changesets, live PR state, live beta routes, and local rendered routes. |
| Tracker comments and attachments read | no | N/A: target was stale PR closure state only; `gh pr view 5037` proved already closed. |
| Video transcript evidence required | no | N/A: no video evidence in this task. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: docs/package readiness closure, not existing behavior diagnosis. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change; lint fix only removed `delete` from proof runner env setup. |
| Branch decision for code-changing task | no | N/A: work continued on current checkout; user did not ask for branch/PR. |
| Release artifact decision | yes | Existing `.changeset/prepare-v54-beta-slate.md` and `.changeset/plite-browser-proof-lane.md` cover package release artifacts; this pass is docs/ledger/lint closure only. |
| Browser tool decision for browser surface | yes | Browser required for local rendered docs/example proof; curl used only for live deploy reachability. |
| PR expectation decision | yes | PR #5037 live state checked; no PR creation/update requested. |
| Tracker sync expectation decision | yes | Only PR #5037 close-state sync was in scope; no issue/Linear comments. |
| Output budget strategy recorded | yes | Plan records capped search/output strategy; accidental broad generated/HTML output is logged below. |
| Docs pack selected | yes | Docs pack applied because Plite docs and route wording changed. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` loaded before public docs patch. |
| Docs lane selected | yes | Plite beta public docs/release-story lane. |
| Target docs and nearest sibling docs read | yes | Read `content/docs/plite/why-this-fork.mdx`, `migration.mdx`, slate-layout page, performance walkthrough, meta/nav surfaces. |
| Docs style doctrine read | yes | `docs-creator` current-state, no changelog voice, real imports, route verification rules applied. |
| Documented source owner identified | yes | Plite docs package story owns public docs; package manifests own beta package/public state. |
| Browser pack selected | yes | Browser pack applied for `/docs/plite*` and `/examples/plite/richtext`. |
| Browser route / app surface identified | yes | `/docs/plite`, `/docs/plite/why-this-fork`, `/docs/plite/migration`, `/examples/plite/richtext`. |
| Browser tool decision recorded | yes | Used Browser via bundled in-app Browser runtime; no native Chrome/Computer need. |
| Console/network caveat policy recorded | yes | Browser proof records zero console errors; network proof limited to live route HTTP 200/title reachability. |
| Package/API pack selected | yes | Package/API pack applied because beta package story and release artifacts were audited. |
| Public surface or package boundary identified | yes | Eight intended public beta packages plus `@platejs/slate-legacy` review item identified from package manifests. |
| Release artifact path selected | yes | Existing `.changeset/prepare-v54-beta-slate.md` and `.changeset/plite-browser-proof-lane.md`; no new changeset for docs/ledger/lint closure. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: this pass did not create or edit a changeset. |
| Barrel/export impact decision recorded | no | N/A: no exported package file layout or barrel change. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested; final
      confidence recorded as 96/100.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
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
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
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
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset edited.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry-only component work.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. N/A: no public shape changed.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no barrel/export change.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | PR #5037 closed; live beta 200/title checks; Browser route proof; `pnpm --filter www check:docs`; `pnpm check:plite:fast`; `pnpm lint:fix`. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: readiness/doc closure, not bug-fix repro. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Browser proof covered docs/example routes; Plite fast browser smoke passed 13 tests. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TS semantics changed; Plite fast typecheck passed 13 tasks anyway. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no export/file layout change. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: package manifests audited only, not edited. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/**` change. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; Browser hit `localhost:3002`; live proof hit `beta.platejs.org`. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser proof for 4 routes: correct H1/title, UNPUBLISHED labels where expected, zero console errors. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Browser route proof recorded in Verification evidence; no screenshot needed because DOM/title/console proof covers requested state. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no CI-controlled `templates/**` output touched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | No package behavior/API changed in this pass; existing beta changesets audited. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry component work. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Docs pack used; `pnpm --filter www check:docs` passed; Browser/local and live route proof passed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode: stale public beta docs/package story. Proof: static audit + live/local Browser + Plite fast. Boundary: docs/ledger/proof runner only, no runtime redesign. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling files changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures were stale source-dev env and lint rule, not install corruption. |
| Autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | N/A: docs/ledger/lint closure; no runtime/product behavior patch. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR create/update requested; PR #5037 already closed. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR body created or updated. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR body image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: only stale PR close-state check in scope. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm lint:fix` passed after fixing `apps/plite/scripts/run-plite-browser.mjs` `delete env.NO_COLOR`. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Accidental broad `.source-dev` and curl HTML dumps logged; recovered with focused Browser JSON and capped searches. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-20-slate-beta-public-readiness-closure.md` | Passed at 2026-06-20T02:06:57Z. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | `rg` found no stale unscoped Plite installs/imports, old migration title, PRIVATE label, or forbidden experimental slate-layout wording in public Plite docs/readmes. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | Live and local routes checked for `/docs/plite`, `/why-this-fork`, `/migration`, `/examples/plite/richtext`. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `pnpm --filter www check:docs` passed; includes `build:source` and docs source parity. |
| Plugin page specifics | no | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | N/A: not a Plate plugin page. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser opened four routes and checked visible body/H1/title/label. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Browser `tab.dev.logs({ levels: ['error'] })` returned 0 errors for each route. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | DOM/title/console proof recorded; screenshot unnecessary for this text/route readiness check. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Package manifests audited; eight intended beta packages public at `54.0.0-beta.0`; `@platejs/slate-legacy` also public and flagged. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | This pass is docs/ledger/lint closure; existing beta changesets audited, no new package artifact. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no package-user delta in this pass. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry work. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | No new artifact: docs/ledger/lint-only closure; existing beta package changesets unchanged. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm check:plite:fast` passed: source parity 2157/2157, package typecheck, package tests, browser package tests, Chromium smoke 13 passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export or barrel change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Plan created; PR, docs, package, deploy, route, and command surfaces identified. | implementation |
| Implementation | complete | Patched docs wording, source-switch ledger destinations, source-dev recovery, and lint blocker in proof runner. | verification |
| Verification | complete | `pnpm --filter www check:docs`, `pnpm check:plite:fast`, Browser route proof, live deploy curl, `pnpm lint:fix` passed. | closeout |
| PR / tracker sync | complete | `gh pr view 5037` shows PR already closed; no new PR/comment required. | final response |
| Closeout | complete | Final handoff fields filled; mechanical autogoal check to run after this update. | final response |

Findings:
- PR #5037 is already closed: `state=CLOSED`, `closed=true`, updated `2026-06-20T01:52:17Z`.
- Live beta routes return HTTP 200 with correct titles: `Introduction - Plate`,
  `Why This Fork - Plate`, `Migration - Plate`, and `Rich Text - Plite - Plate`.
- Local Browser proof on `localhost:3002` shows correct H1/title,
  `UNPUBLISHED` on docs routes, no `PRIVATE`, no stale `Migrating to Plite`,
  and zero console errors.
- Public docs/readme audit found no stale unscoped Plite install/imports and no
  forbidden slate-layout experimental wording after patch.
- Package manifest audit confirms the eight intended beta packages are public
  at `54.0.0-beta.0`; `@platejs/slate-legacy` is also public and should get a
  human decision before beta if it is meant to remain only a scaffold.

Decisions and tradeoffs:
- Kept route topology `/docs/plite/why-this-fork` and `/docs/plite/migration`;
  fixed transplant source-switch ledger to point donor docs at current Fumadocs
  destinations instead of deleted `/plite` routes.
- Used `beta-scoped` instead of `experimental` for slate-layout package docs:
  package is public in beta, but production pagination proof remains scoped.
- Did not create a new changeset: this pass changes docs/ledger/lint closure
  only, and existing beta changesets already cover the package-release lane.

Implementation notes:
- `content/docs/plite/why-this-fork.mdx`: aligned sidebar anchor to
  `Migration`, changed `private` to `unpublished`, and removed misleading
  slate-layout experimental package wording.
- `content/docs/plite/libraries/slate-layout/index.mdx` and
  `content/docs/plite/walkthroughs/09-performance.mdx`: beta/current-state
  wording cleanup.
- `docs/transplant/plite/source-switch-ledger.*`: donor migration/release doc
  destinations now match `content/docs/plite/migration.mdx` and
  `content/docs/plite/why-this-fork.mdx`.
- `apps/plite/scripts/run-plite-browser.mjs`: replaced `delete env.NO_COLOR`
  with `env.NO_COLOR = undefined` to satisfy Biome; other app/script diffs are
  Biome formatting of existing touched files.

Review fixes:
- Fixed stale local docs source by rebuilding with `PLATE_WWW_DYNAMIC_DOCS=1`
  after a plain `build:source:dev` produced an invalid `.source-dev/dynamic.ts`.
- Fixed Biome `lint/performance/noDelete` in `apps/plite/scripts/run-plite-browser.mjs`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plain `pnpm --filter www build:source:dev` without `PLATE_WWW_DYNAMIC_DOCS=1` generated an invalid dev source file. | 1 | Rebuild with the same env used by the dev script. | `PLATE_WWW_DYNAMIC_DOCS=1 pnpm --filter www build:source:dev` restored docs export; local route rendered. |
| Broad `.source-dev/dynamic.ts` and curl HTML reads streamed too much output. | 2 | Use focused Browser JSON, capped `rg`, and title/H1 extraction. | Recovered with Browser route proof and live curl summaries only. |
| `rg` stale-import audit included nonexistent `apps/www/src/examples/plite`. | 1 | Rerun with actual `apps/www/src/app/(app)/examples/plite` path. | Corrected audit returned no stale unscoped Plite install/import hits. |
| Initial `pnpm lint:fix` failed on `delete env.NO_COLOR`. | 1 | Patch proof runner env handling. | `pnpm lint:fix` passed after `env.NO_COLOR = undefined`. |

Verification evidence:
- `gh pr view 5037 --json number,state,closed,title,url,updatedAt`: closed
  PR #5037, no mutation needed.
- Live deploy curl summaries: all four routes returned HTTP 200; docs routes
  include `UNPUBLISHED`; richtext example title is `Rich Text - Plite - Plate`.
- `pnpm --filter www check:docs`: passed twice after docs changes; Fumadocs
  source generation and docs source parity passed.
- `pnpm check:plite:fast`: passed; source parity `2157/2157`, package
  typecheck, package tests, browser package tests, and Chromium smoke `13
  passed (3.1s)`.
- Browser proof through Codex In-app Browser: `/docs/plite`,
  `/docs/plite/why-this-fork`, `/docs/plite/migration`, and
  `/examples/plite/richtext` all had expected title/H1, zero console errors,
  no `PRIVATE`, and no stale `Migrating to Plite`.
- `pnpm lint:fix`: passed after lint blocker patch.

Final handoff contract:
- PR line: PR #5037 already closed; no new PR created or updated.
- Issue / tracker line: N/A: no issue/Linear sync in scope.
- Confidence line: 96/100. Remaining 4% is the public `@platejs/slate-legacy`
  decision.
- Flow table:
  - Reproduced: N/A, readiness closure rather than bug repro.
  - Verified: docs/source checks, Plite fast gate, live deploy check, Browser
    route proof, and lint all passed.
- Browser check: Codex In-app Browser verified four local routes with zero
  console errors.
- Outcome: Plite beta public-readiness docs/package/browser closure is green
  locally and live beta is reachable.
- Caveat: `@platejs/slate-legacy` is currently public/private=false; decide if
  beta should publish it or make it private before release.
- Design:
  - Chosen boundary: docs, transplant ledger, proof runner lint fix, and
    readiness evidence.
  - Why not quick patch: stale route/package wording had to be backed by live,
    Browser, docs parser, and Plite fast proof.
  - Why not broader change: no Plate migration, npm publish, or runtime
    redesign was required for this closure.
- Verified: `pnpm --filter www check:docs`; `pnpm check:plite:fast`; Browser
  route proof; live deploy curl; `pnpm lint:fix`.
- PR body verified: N/A: no PR body created or updated.

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
- PR: #5037 is closed.
- Issue / tracker: N/A.
- Browser proof: four local routes through Codex In-app Browser, expected H1s,
  expected labels, zero console errors.
- Caveats: review `@platejs/slate-legacy` public package status before beta.

Timeline:
- 2026-06-20T01:56:22.593Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final mechanical autogoal check, then final response |
| What is the goal? | Close Plite beta public-readiness around PR/deploy/docs/package/browser proof |
| What have I learned? | Live beta is reachable; local docs/browser/package gates are green; slate-legacy public status needs review |
| What have I done? | Patched docs/ledger/lint issue and ran named proof gates |

Open risks:
- `@platejs/slate-legacy` is public/private=false. If this should be only a
  temporary migration scaffold, harden that before beta publish.
- Latest local docs/ledger/lint closure changes are not pushed in this turn.
