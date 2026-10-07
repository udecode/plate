# Fix DOCX browser export

Objective:
Fix #5146: playground Export as Word downloads a valid DOCX; add regression proof, pass checks and review, then open and merge the issue-owned PR.

Goal plan:
docs/plans/5146-fix-docx-browser-export.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub bug
- id / link: https://github.com/udecode/plate/issues/5146
- title: DOCX playground export fails in Juice setStyleAttrs
- exact PR ownership: https://github.com/udecode/plate/pull/5148, task invocation in this run owns only #5148 and #5146.
- acceptance criteria: Export > Export as Word on /blocks/playground-demo downloads a valid DOCX without the Juice exception. Reproduce before implementation; prove the root cause, regression coverage, owning package checks and browser outcome. Complete task-owned PR through merge.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: outcome-based
- initial confidence score: 75%; prior browser trace locates failure, cause unproven
- improvement loop: reproduce, isolate, test, fix, review, merge
- final score / loop closure: 98%; local proof and structured review pass. Exact PR/feedback/merge closure remains.

Completion threshold:
- Original browser interaction downloads a DOCX with document.xml; focused regression passes, relevant source-first typecheck and pnpm check pass, structured autoreview has no accepted actionable findings, exact-head PR merged and #5146 closed.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5146-fix-docx-browser-export.md` passes.

Verification surface:
- Owning @platejs/docx-io tests/types; pnpm check; approved in-app browser on /blocks/playground-demo; downloaded DOCX ZIP audit; structured branch review; GitHub exact-head merge and issue-state readback.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: #5146 full body/comments, export plugin, Juice dependency source and actual browser execution.
- Allowed edit scope: DOCX export root cause and direct regression; package dependency/runtime configuration if proven necessary; supporting changeset and this plan.
- Browser surface: /blocks/playground-demo > Export > Export as Word.
- Tracker sync: task PR fixes #5146; concise issue progress/verification, then verify CLOSED.
- Non-goals: unrelated table-ID hydration warnings, spacing redesign, Word visual-rendering claims, workflow edits.

Output budget strategy:
- Scope rg to DOCX owner/dependency, cap output at 3-8k tokens. Save verbose install/check/review logs under /tmp. One metadata discovery accidentally returned a large tool inventory; recover by filtering to exact names and bounded descriptions.

Blocked condition:
- Stop for unavailable original-surface reproduction after applicable ladder, missing GitHub write/merge authority, or required fix outside DOCX export scope. No new product scope.

Task state:
- task_type: bug-fix
- task_complexity: non-trivial browser/package runtime
- current_phase: closeout
- current_phase_status: in_progress
- next_phase: exact-head receipt and merge
- goal_status: active

Current verdict:
- verdict: valid, reproduced
- confidence: 98% root-cause confidence; final artifact proof outstanding
- next owner: task
- reason: current main original browser action crashes; runtime input has React-escaped font quotes; Juice default parses entity semicolons as declarations. Minimal Node reproduction matches stack and decodeStyleAttributes resolves it.

Pre-solution issue challenge:
- reporter claim: browser Word export rejects in Juice setStyleAttrs before download.
- suggested diagnosis or fix: none; issue explicitly leaves cause/baseline unproven. Spacing changes are not assumed causal.
- repro ladder:
  - tests / source-level repro: Juice client with React-rendered quoted font matches exact prop.prop.indexOf failure; decodeStyleAttributes true succeeds and retains encoded text.
  - Playwright / automated browser: N/A: no existing DOCX browser regression harness; original surface driven with approved browser locator API.
  - Browser plugin: IAB fallback after no browser-use named tool found. http://localhost:3016/blocks/playground-demo; Export as Word times out after 15s with exact Juice setStyleAttrs error.
  - screenshot / visual proof: N/A before fix: crash is console/download behavior, not a visual assertion. Final artifact download is authoritative proof.
- reproduction verdict: reproduced on current main 6c3d7c4127
- validity verdict: valid; no proven relation to #5145 or table hydration warning
- best long-term fix boundary: DOCX export adapter's existing Juice options: decode HTML entities in style attributes before CSS parsing; preserve normal React HTML escaping.
- harsh honest feedback: a converter-only test cannot prove the browser export pipeline. Trace the browser-generated property before adding guards or changing dependencies.
- hard-stop decision: proceed; original-surface failure and mechanism confirmed. No unsupported null guards, font quote removal, whole-HTML decode or dependency patch.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5146-fix-docx-browser-export.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no duration |
| Skill analysis before edits | yes | task, autogoal, poteto-mode, how, why, autoreview, tdd, changeset read |
| Active goal checked or created | yes | no prior goal; created native #5146 goal |
| Source of truth read before edits | yes | issue, export adapter, serializeHtml, Juice source |
| Tracker comments and attachments read | yes | full issue; zero comments, no attachments |
| Video transcript evidence required | no | N/A: none supplied |
| Pre-solution issue challenge required | yes | valid original browser repro; see above |
| Reproduction verdict before implementation | yes | exact current-main browser stack, escaped styles captured |
| Repro escalation ladder selected | yes | Node matching mechanism; approved browser original interaction |
| Suggested fix reviewed against durable boundary | yes | style-attribute decode at DOCX/Juice adapter, not serializer |
| `docs/solutions` checked for non-trivial existing-code work | yes | DOCX and typecheck inventory; no Juice fix precedent |
| TDD decision before behavior change or bug fix | yes | cheap public exportToDocx regression, failing test commit before fix |
| Branch decision for code-changing task | yes | codex/fix-5146-docx-browser-export in managed worktree |
| Release artifact decision | yes | patch @platejs/docx-io |
| Browser tool decision for browser surface | yes | IAB through CUA; browser-use tool unavailable |
| PR expectation decision | yes | task requires PR; user closure workflow continues through merge |
| Dedicated task plan selected for exact PR | yes | this ticket-owned task plan; PR number recorded upon creation |
| Tracker sync expectation decision | yes | issue update after PR; verify CLOSED after merge |
| Output budget strategy recorded | yes | bounded source searches, /tmp long logs; accidental tool-list recovery recorded |
| Browser pack selected | yes | original download is necessary proof |
| Browser route / app surface identified | yes | /blocks/playground-demo > Export > Export as Word |
| Browser tool decision recorded | yes | approved IAB locator and console APIs |
| Console/network caveat policy recorded | yes | inspect export errors; unrelated table hydration warnings excluded; no network pipeline mutation |
| Package/API pack selected | yes | package runtime delta, no public shape change |
| Public surface or package boundary identified | yes | @platejs/docx-io exportToDocxInternal shared adapter |
| Release artifact path selected | yes | .changeset single-package patch |
| `changeset` skill loaded when `.changeset` is required | yes | fully read; imperative user-impact bullet |
| Barrel/export impact decision recorded | no | N/A: existing internal option; no public export or layout changes |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
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
- [x] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [x] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL.
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
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Browser download, nine XML parts, package proof and final pnpm check pass; GitHub closure remains a required external gate. |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Valid, original current-main browser failure and exact escaped-style mechanism established before implementation. |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | React/Juice source probe plus actual approved browser; no matching existing browser harness. Non-visual download proof, not Word rendering. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Browser setStyleAttrs TypeError and public regression red at dbdc629baa, before one-option fix. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Quoted-font public export integration: 1 pass, 7 assertions. Exact playground file download and XML parse. |
| TypeScript or typed config changed | yes | Run relevant typecheck | pnpm turbo typecheck --filter=./packages/docx-io and final root check pass. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: only test lane move; brl common_excludes explicitly excludes slow/spec files, no public layout/export change. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no dependency or lockfile delta. Initial pnpm install completed without versioned changes. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no workflow or agent-source changes. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All proof owns task managed worktree; ZIP audit specifically runs from packages/docx-io where jszip/xmlbuilder2 are dependencies. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Approved IAB and Chrome drove /blocks/playground-demo Export as Word in source mode. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Exact task-owned download with timestamp, size, SHA256 and XML audit. Browser event wait missed real download; no visual-render claim. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: templates untouched. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | Single @platejs/docx-io patch changeset; no API shape change. |
| User-visible registry output changed | no | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | N/A: no registry edits. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | N/A: internal task plan only; no public docs/content delta. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Escaped CSS quotes crashed normal export. Decode only style attributes using Juice-supported option; real XML text/font regression plus browser download prove boundary. |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent workflow/tool changes. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: missing peer dist and module mocks explained by source configuration/isolation, not install rot; no reinstall warranted. |
| Autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | Structured branch review against origin/main at 597ecbf0cc exits 0, no accepted/actionable findings. Stale red-test-only bundle superseded. |
| PR create or update | yes | Run `check` before PR work and sync PR body to the task-style final handoff | pnpm check passed before ready PR #5148 creation; body read back with task format. Auto release remains unchecked, no separate publication requested. |
| Per-PR task ownership | yes | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | OPEN #5148 body has exactly one task-plan line. git show refs/pr/5148 proves plan exists and identifies #5148. Live/fetched/local OIDs match; repeat after final push. |
| Task-style PR body verified | yes | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | Exact body readback has Fixes #5146, one plan line, confidence, required phase table and four emoji sections; no self-link, auto-release block preserved. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: non-visual download proof, exact artifact/console caveat; no local image paths in PR body. |
| Tracker sync-back | yes | Post concise issue/Linear sync after PR exists, or record N/A/blocker | Issue #5146 comment https://github.com/udecode/plate/issues/5146#issuecomment-6043605554 posted and read back, ties #5148 to original repro and verified outcome. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Exact PR, issue, confidence, red/green proof, browser caveat, chosen boundary and verification fields below. External merge/readback required before final answer. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | pnpm lint:fix checks 3309 files with no rewrites; final pnpm check lint passes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Bounded owner searches and /tmp logs. Accidental metadata inventory and console hydration output recorded, recovered with filtered bounded results. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/5146-fix-docx-browser-export.md` | Run after this final versioned update and again at final delivered head. Native goal stays active until external exact-head receipt, merge and issue-state readback succeed. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | Actual original Export as Word interaction creates fresh plate (4).docx, 71585 bytes. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | No new export errors. Unrelated table hydration warnings recorded. No network-path edits; remote image fetching disabled by default. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Fresh Chrome artifact, nine well-formed XML parts and expected heading/table/callout; SHA256 recorded above. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | One internal Juice option; no signature, package exports or dependency changes. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published package runtime bug fix, one patch changeset. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | changeset skill applied to @platejs/docx-io only; no forbidden core minor. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry-only delta. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: package runtime delta has required changeset. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Owning package types, isolated package tests, slow integration, explicit peer artifact build and root pnpm check pass. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no public export/layout change; test filenames excluded by brl. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | issue challenged; mechanism and original browser failure proven | implementation |
| Implementation | done | one Juice option; red-first public integration test; patch changeset | verification |
| Verification | done | browser artifact, package proof, pnpm check, structured review all pass | closeout |
| PR / tracker sync | done | compliant ready #5148; body and #5146 sync readback | external receipt |
| Closeout | ready | all local/versioned gates closed; exact-head feedback receipt and merge remain external guards | verify MERGED/CLOSED before final response |

Findings:
- Dedicated managed worktree starts at origin/main 6c3d7c4127, including #5145. Branch codex/fix-5146-docx-browser-export. No source .env or .env.local found to copy.
- task, autogoal, poteto-mode, how/why, root-cause and model-the-domain instructions selected. Native goal created; source read precedes implementation.
- docs/solutions inventory has DOCX parsing and source-typecheck precedents but no Juice exporter failure solution.

Decisions and tradeoffs:
- Enable Juice decodeStyleAttributes at the existing DOCX adapter. React must retain HTML escaping; decode only CSS attributes, not document text. No signature or function-boundary change, so architect N/A.
- Preserve CSS cascade/custom styles, tight no-DOCTYPE wrapper, font/page-size/margins/orientation forwarding. History links #4814, #4991 and #4997 state these contracts. Juice 11.1.1 entered via pnpm migration #4842; no historical first-failure or baseline browser proof exists, so no version-regression claim.
- Why coverage is scoped to Git/gh issue/PR history. No Plate-owned private Linear/Notion/Slack identifiers supplied; those records were not searched. Infrastructure observability, error tracking and warehouse evidence unavailable for this local standalone export. Runtime evidence proves current mechanism, not the author's past browser test state.
- Existing DOCX peer resolves dist with no source path mapping. Initial package typecheck reports only missing @platejs/docx. Build that explicit peer artifact, then rerun; do not expand this bug into source-entry configuration work.
- Use one existing task goal plan for all derived closeout state. No second tracker or native goal. Autoclosure requires exact-head feedback/receipt before merge.

Implementation notes:
- New public export regression uses an isolated Bun process to avoid existing mock.module interference. It renders editor text via React, exports two quoted font families, and asserts real DOCX XML fonts and exact literal text.
- Red proof observed by parent: bun test packages/docx-io/src/lib/docx-export-plugin.spec.tsx reports 0 pass, 1 fail; Juice prop.prop.indexOf TypeError matches browser.
- All worktree-holding delegates completed before failing-test commit. Deslop pass found no unnecessary guards, casts or comments in new test.
- Fix adds only decodeStyleAttributes true in existing Juice options. Regression moved to docx-export-plugin.slow.tsx because root check's fast-suite budget rejects its 298ms subprocess runtime. The slow lane is the correct integration-test owner; barrels explicitly exclude slow tests.
- Test initially included entity-looking literal &quot;. Baseline with Arial and original Juice options reproduces the converter's existing double decoding. Removed only that unrelated case; angle brackets, ampersand and actual quotes/apostrophes remain asserted. No converter or sibling mock-test changes.
- Browser download events timed out despite successful export. Read-only filesystem proof finds fresh task files; Chrome wrote plate (4).docx at 17:33:25 UTC. Chrome downloads UI was blocked by browser URL policy; did not bypass it. Validated exact task-owned file directly, without scanning unrelated downloads.
- No-comments report: zero changed comments, zero flags. Parent verified final source diff has no diagnostic logging or new comments.
- Autoreview scope freeze: #5146 browser crash, existing DOCX/Juice adapter, four intended files: adapter, integration test, one changeset, this plan. Production code delta is one added option. No public API, dependency, registry, template, or workflow changes.

Pstack bug-fix execution steps:
1. Reproduce it yourself on the matching surface via the driver skill (Non-negotiables), even when a debug or instrumentation protocol says to ask the user to reproduce. Ask the user only with a stated, specific reason the control surface cannot reach the target, and only after driving it as far as it goes. If it won't reproduce directly, synthesize the trigger, tighten conditions, or instrument until it fires.
2. Binary-search the cause. Form the candidate hypotheses, then rule them out until one survives. Seed them with `how` over the affected subsystem and the **why** skill for regression history. Each pass, take the split that cuts the most remaining problem space, get runtime evidence, eliminate. When program state is unclear, add instrumentation or logging and read it as the code runs. Don't guess. Drive a long or stubborn hunt with Claude Code's `loop` skill. Confirm the surviving *mechanism* with runtime evidence before the step-3 architect/interrogate fan-out.
3. Plan the fix. If it crosses a function boundary, `architect` first. Delegate implementation to a subagent using your configured bug-fix model (default in poteto-mode's Models section) with a specific scope.
4. Verify on the same surface. The original repro now passes. "Inconclusive" or wrong-surface is not a pass. Flag it. Unit tests show branch behavior, not bug absence.
5. Stage the commits so the failing repro lands before the fix in git history. See the **tdd** skill for the failing-test-first cadence when the bug has a cheap local test path. Skip it when the test would be expensive, integration-heavy, or unclear. This is the canonical **sequence-verifiable-units** principle skill, the failing test first and the fix on top.
6. Run **Opening a PR**.

Review fixes:
- Initial branch autoreview reviewed committed red-test tree dbdc629baa, not staged green changes. Its P1 asks to include implementation fix. Committed verified green tree and reran actual complete branch review. Final helper exits 0, no accepted/actionable findings. No additional product edit justified by stale bundle.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial browser navigation exceeded compile timeout | 1 | inspect existing tab after compile | tab rendered, original repro completed |
| Initial package typecheck lacks @platejs/docx peer dist | 1 | inspect paths and build explicit peer | rerun after peer build |
| Raw bun package run has existing module-mock interference | 1 | use repo-owned isolated runner | 108 tests pass; existing pair independently reproduces 4 failures |
| Browser download event unavailable despite completed blob | 2 | inspect exact task artifact timestamp/ZIP | Chrome plate (4).docx downloaded, 71585 bytes |
| ZIP audit started from root lacking jszip dependency | 1 | rerun in owning packages/docx-io cwd | nine XML parts parse successfully |
| Root check exceeds fast-test runtime budget | 1 | move public integration test to slow lane | root check rerun required |
| Branch review ignored staged green changes | 1 | commit verified fix and review complete branch | rerun correct committed target |

Verification evidence:
- Issue body/comments read via gh; zero comments. Juice setStyleAttrs reads prop.prop.indexOf('--'), so a malformed property object is a candidate, not a proven diagnosis.
- Browser original failure: 15s download timeout, TypeError in setStyleAttrs before htmlToDocxBlob. Temporary instrumentation captured 17 React-escaped quoted-font style attributes; instrumentation removed before tests/fix.
- Node mechanism confirmed with actual React markup. Juice defaults crash; decodeStyleAttributes true succeeds and leaves encoded literal text intact.
- Green regression before lane move: 1 pass, 7 assertions. Existing focused XML spacing suite 14/14 passes. Repo-owned pnpm test packages/docx-io runs 108 tests, all pass with mock isolation.
- Package typecheck passes after explicit @platejs/docx peer build. pnpm lint:fix checks 3309 files, zero rewrites. Initial pnpm check lint/types/fast/slow tests pass but fast budget rejects new integration test; classified and moved to .slow.tsx.
- Browser source mode PLATE_WWW_DEV_SOURCE=1, original route and action. No new export console errors. Download /Users/zbeyens/Downloads/plate (4).docx at 2026-10-07T17:33:25Z, 71585 bytes, SHA256 342dc4b06bf7220c2b3d54257870a9c50fa9f049e16a5c9c96864b6093a3e837. Nine XML parts parse; document.xml includes playground heading, table and callout. This is successful-download/package proof, not Word visual fidelity.
- Final pnpm check exits 0 after correct slow-lane classification; lint, package builds/types, fast and slow suites, fast runtime budget all pass. Exact slow integration command bun test ./packages/docx-io/src/lib/docx-export-plugin.slow.tsx reports 1 pass, 0 fail, 7 assertions.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5148
- Issue / tracker line: Fixes #5146
- Confidence line: 98% for escaped-style crash and successful download, no Word-rendering claim
- Flow table:
  - Reproduced: public export regression fails with exact Juice stack; current-main playground fails before download
  - Verified: quoted-font/text XML regression passes, package checks and root check pass; fresh Chrome DOCX download parses
- Browser check: /blocks/playground-demo > Export > Export as Word, source mode. Fresh task file 71585 bytes, nine XML parts.
- Outcome: Word export completes with React-escaped font-family quotes.
- Caveat: Existing table-ID hydration warnings; no Word visual fidelity claim. Event wait missed actual download, verified task artifact directly.
- Design:
  - Chosen boundary: DOCX export adapter's Juice options, decodeStyleAttributes true
  - Why not quick patch: nil guards or removing font quotes hide correctly escaped HTML instead of parsing CSS correctly
  - Why not broader change: serializer, converter, public API and dependency contracts remain unchanged
- Verified: red/green export regression, 108 isolated DOCX tests before lane move, package types, final pnpm check and clean structured branch review
- PR body verified: gh pr view body readback; exactly one plan line and required task sections, preserved auto-release block

Task-style PR body contract:
- Preserve any existing `<!-- auto-release:start -->` block. If a changeset is
  part of the diff and repo policy expects auto release, include that block.
- Use the accepted kitcn PR #270 visual format. The body starts with an emoji
  issue/tracker/fix line, for example `🐛 Fixes #123` or `🐛 Fixes ➖ N/A`, then
  exactly one `🧭 Task plan: docs/plans/<plan>.md` line, then an emoji
  confidence line like `🟢 95-100% confidence`. The plan must exist at the
  exact PR head and identify that exact PR.
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
- PR: https://github.com/udecode/plate/pull/5148, OPEN; exact issue-owned branch
- Task plan at exact PR head: fetched refs/pr/5148 contains exact #5148 ownership; live/local/fetched equality confirmed before feedback triage, repeated after final push
- Issue / tracker: https://github.com/udecode/plate/issues/5146, linked with Fixes #5146
- Browser proof: original action downloads fresh DOCX; exact artifact/XML audit in Verification evidence
- Caveats: table hydration warnings and Word rendering are outside this browser crash fix

Timeline:
- 2026-10-07T17:16:34.698Z Task goal plan created.
- 2026-10-07T17:33:25Z Chrome writes verified plate (4).docx.
- 2026-10-07T17:44:00Z Local closeout complete: final pnpm check and actual committed branch autoreview pass.
- 2026-10-07T17:48:16Z Ready #5148 created and attached to task. Exact ownership pushed and compliance verified before live-feedback triage.
- 2026-10-07T17:51:00Z Issue sync read back. Helper/raw feedback inventories have zero actionable items; three non-actionable comments ledgered below.

Live feedback ledger:
| Exact URL | Source | Priority | Verdict and rationale | Proof/reply/resolution |
| --- | --- | --- | --- | --- |
| https://github.com/udecode/plate/pull/5148#issuecomment-6043565686 | top-level, helper omitted | N/A: no finding | Non-actionable CodeSandbox editor/preview links, no behavior claim or failure | Content read; no reply or resolution API needed |
| https://github.com/udecode/plate/pull/5148#issuecomment-6043566035 | top-level | N/A: no finding | Non-actionable changeset status confirms one patch package, no defect request | Content matches scoped changeset; no reply or resolution needed |
| https://github.com/udecode/plate/pull/5148#issuecomment-6043568589 | top-level | N/A: no finding | Non-actionable Codex activity summary says review completed; no finding text | Actual raw review/thread inventories empty; not used as sole source review proof |

External delivery guards:
- After final material push, require live head = fetched refs/pr/5148 = local HEAD.
- Full resolve-pr-feedback inventories: helper 2 top-level, raw 3 top-level, excluded 1; 0 reviews, 0 resolved or unresolved inline threads. All actionable priority counts P0/P1/P2/P3 are zero; no deferred URLs. Repeat after final push and terminal receipt.
- P1 replay N/A: no live P1 findings. Existing structured review red-test-only finding is closed by inclusion of the verified fix and clean complete-branch review.
- Post one external terminal receipt naming exact head, proof and every ledger URL; read back exact URL/body/OID, re-fetch helper and raw inventories, and reject any unrecorded new item.
- Merge only after fresh terminal receipt. Verify GitHub MERGED and #5146 CLOSED before native goal completion or final answer. No Word visual or release-publication claim.
- Receipt remains external, not a receipt-only branch commit. These guards are required actions, not claims that merge already happened.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | GitHub delivery and live-feedback closure |
| Where am I going? | Task compliance, final receipt, merge and issue-state readback |
| What is the goal? | Valid DOCX browser download, regression proof, reviewed merged PR, #5146 closed |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Existing table-ID hydration warnings remain outside #5146. Browser event driver missed real Blob downloads; task-owned file timestamp and XML inspection provide actual download proof. Word visual rendering not tested. Existing literal entity-text conversion is not changed.
