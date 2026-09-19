# Keep DOCX paste HTML inert

Objective:
Keep temporary DOCX HTML transforms in their source document; prove benign paste content cannot trigger browser behavior during cleaning, then deliver a verified package fix.

Goal plan:
docs/plans/2026-09-19-keep-docx-paste-html-inert.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- security-advisory (docs/plans/templates/packs/security-advisory.md)

Task source:
- type: private GitHub repository security advisory
- id / link: held in private repository advisory; omit identifier and payload from public PR artifacts
- title: DOCX HTML cleaning can trigger browser behavior before deserialization
- acceptance criteria: preserve DOCX formatting, prevent active-document parsing in affected helpers, prove behavior in a browser, release fixed packages before advisory publication

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: high for the two confirmed browser paths
- improvement loop: focused behavior test, source fix, browser proof, package checks and review
- final score / loop closure: high for package behavior; full editor gesture and release remain outstanding

Completion threshold:
- Both affected HTML helpers preserve their source document and avoid reparsing descendants; focused tests, package checks and a browser check pass.
- A sanitized PR contains the fix and one package changeset. Release and advisory publication follow only after the PR is merged and the fixed npm version exists; if merge is outside authorized scope, record that exact blocker.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-19-keep-docx-paste-html-inert.md` passes.

Verification surface:
- Focused core/DOCX tests; source-first package typecheck, lint, built package check, local browser transform proof, pnpm check, structured autoreview, PR and advisory API readback.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: private repository advisory, current source, integrity-verified npm artifacts and live browser proof.
- Allowed edit scope: core HTML helpers, focused core/DOCX tests if needed, one package changeset, and this plan.
- Browser surface: local DOCX HTML transform fixture in Chrome; verify no browser event occurs during cleaning.
- Tracker sync: private advisory after a meaningful result; keep exploit details private.
- Non-goals: unrelated HTML parser redesign, application routes, beta lane, public proof payloads.

Output budget strategy:
- Bounded source reads and named test commands; keep private browser proof and advisory text outside the repository.

Blocked condition:
- Unresolved failing verification or review; release/advisory closeout waits for an authorized PR merge and a published fixed package.

Task state:
- task_type: security package bug fix
- task_complexity: non-trivial one-shot
- current_phase: hosted CI and release wait
- current_phase_status: in_progress
- next_phase: release after authorized merge of PR #5131
- goal_status: active

Current verdict:
- verdict: valid but impact claims require narrowing
- confidence: high for the browser behavior observed during cleaning
- next owner: task
- reason: source paths and a Chrome run of the actual cleaner reproduced the pre-deserialization browser event

Pre-solution issue challenge:
- reporter claim: DOCX HTML cleaning reaches temporary active-document parsing before deserialization
- suggested diagnosis or fix: keep all temporary transforms inert; reject a caller-only sanitize patch as insufficient
- repro ladder:
  - tests / source-level repro: source trace reaches both helpers from the DOCX HTML transform
  - Playwright / automated browser: N/A: no existing focused browser harness for the package cleaner found
  - Browser plugin: Chrome ran bundled actual cleaner with harmless marker; browser event occurred before output
  - screenshot / visual proof: AX readback of marker sufficient; no visual layout claim
- reproduction verdict: reproduced in Chrome at the package cleaner boundary
- validity verdict: valid; claimed downstream theft and all CSP outcomes not demonstrated
- best long-term fix boundary: core HTML helpers retain source-document ownership and move existing child nodes without reparsing
- harsh honest feedback: the public text must not imply every CSP allows script execution or publish a copyable payload
- hard-stop decision: proceed with package fix; keep report private until fixed release

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-19-keep-docx-paste-html-inert.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: no requested duration |
| Skill analysis before edits | yes | Task, autogoal, security-triage, TDD, changeset and autoreview loaded |
| Active goal checked or created | no | N/A: no native goal requested; file plan owns execution |
| Source of truth read before edits | yes | Full private advisory via repo API; released core and DOCX artifacts inspected |
| Tracker comments and attachments read | yes | Advisory comments API returned zero; no attachments or video |
| Video transcript evidence required | no | N/A: no video |
| Pre-solution issue challenge required | yes | Source and browser reproduction support validity; impact language narrowed |
| Reproduction verdict before implementation | yes | Actual cleaner fired benign DOM marker in Chrome |
| Repro escalation ladder selected | yes | Source trace then browser fixture; package tests will guard final behavior |
| Suggested fix reviewed against durable boundary | yes | Use source document and preserve nodes in shared helpers, not caller filtering |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused HTML/DOCX/clipboard search; no applicable existing fix |
| TDD decision before behavior change or bug fix | yes | Add focused source-document behavior regression before helper changes |
| Branch decision for code-changing task | yes | Dedicated `codex/docx-html-cleanup` from current origin/main |
| Release artifact decision | yes | One core patch changeset for published behavior fix |
| Browser tool decision for browser surface | yes | browser-use unavailable in active tools; use Chrome via CUA |
| PR expectation decision | yes | Task requires a sanitized PR; no public payload or advisory details |
| Dedicated task plan selected for exact PR | yes | This plan owns the one PR; record exact URL after creation |
| Tracker sync expectation decision | yes | Private advisory update after meaningful outcome, with private API readback |
| Output budget strategy recorded | yes | Exact source paths, capped output, private proof outside repo |
| Browser pack selected | yes | Browser proof guards parse-time behavior |
| Browser route / app surface identified | yes | Local bundled cleaner fixture; no browser UI layout claim |
| Browser tool decision recorded | yes | Chrome via CUA, as browser-use is unavailable |
| Console/network caveat policy recorded | yes | Check local browser result; harmless missing image route is expected |
| Package/API pack selected | yes | Published core package changes; no export change expected |
| Public surface or package boundary identified | yes | Core HTML helpers consumed by DOCX package |
| Release artifact path selected | yes | `.changeset` core patch |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded with repository changeset rule |
| Barrel/export impact decision recorded | no | N/A: no files or package exports move |
| Security advisory pack selected | yes | Private report, published package fix and disclosure order |
| Advisory source read through correct authority or explicit access blocker | yes | Repository advisory API; report accepted as private draft |
| Affected package, vulnerable range, and fixed-version target identified | yes | Core through 53.3.11 and DOCX 53.0.0 path; fixed version assigned by later release |
| Disclosure/release order recorded | yes | Patch package, publish fixed npm version, then update/publish advisory |
| Private/draft disclosure safety recorded | yes | Private draft; sanitized public PR only, no payload or private advisory ID |
| CVE decision recorded | yes | GitHub accepted the CVE request; assignment remains pending |

Work Checklist:
- [ ] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [ ] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [ ] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [ ] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [ ] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction
      `N/A` with reason.
- [ ] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state
      matters.
- [ ] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's
      proposed path.
- [ ] Nearby repo instructions and implementation patterns read before edits.
- [ ] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [ ] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason.
- [ ] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [ ] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [ ] Every PR has its own `task` invocation and dedicated plan; this plan is
      not aggregate evidence for another PR.
- [ ] If a PR exists, its body has exactly one
      `🧭 Task plan: docs/plans/<plan>.md` line, this file exists at the exact PR
      head, and this plan records that exact PR number or URL.
- [ ] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [ ] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [ ] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [ ] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: browser proof uses the repo-approved browser tool or records a blocker/waiver.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot, trace, or exact verification caveat is ready for final handoff.
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.
- [ ] Security advisory pack: advisory source, state, `cve_id` when available, credits/reporter when available, affected products, and current vulnerable ranges are recorded from the correct source authority or marked blocked by permissions.
- [ ] Security advisory pack: public/global GHSA records are treated as read-only unless a repository security advisory owned by the current repo/org is located or created.
- [ ] Security advisory pack: impact, root cause, reproduction, remediation, affected package, vulnerable range, and fixed version are recorded.
- [ ] Security advisory pack: private, draft, embargoed, or not-yet-public reports avoid public PR/comment/release-note disclosure until the fixed version is available and disclosure is approved; any public pre-disclosure PR is sanitized or explicitly user-approved.
- [ ] Security advisory pack: security regression proof is recorded, or N/A reason explains why proof is external/manual.
- [ ] Security advisory pack: code fix, PR merge, release/version PR, npm/package publish, and GitHub release/tag are tracked when a published package is involved.
- [ ] Security advisory pack: repository advisory vulnerability metadata is updated with package, vulnerable range excluding the fixed version, and patched version after the fixed version is published, or N/A reason is recorded for read-only public GHSA/non-GitHub sources.
- [ ] Security advisory pack: repository advisory is published after the fixed version is available, or public GHSA/external/npm/private publication state or blocker is recorded.
- [ ] Security advisory pack: CVE is requested when a repository advisory has empty `cve_id` and is eligible, unless the user explicitly declines or a blocker is recorded; public GHSA/non-GitHub sources record existing CVE, GitHub/global owner, external CNA/request owner, or N/A reason.
- [ ] Security advisory pack: final readback records source, state, `published_at` when available, package, vulnerable range, patched version, CVE status, and propagation caveat or external-owner caveat.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Pre-solution issue challenge verdict | pending | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | pending |
| Repro escalation ladder | pending | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser Use proof or record explicit waiver/blocker | pending |
| Browser final proof | pending | Attach screenshot or exact browser verification caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| User-visible registry output changed | pending | Use the registry-changelog pack: add/update `apps/www/src/registry/changelog/entries/*.mdx`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --write`, run `node tooling/scripts/generate-ui-changelog-entries.mjs --check`, or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for supporting public docs/content/API/example changes, load `docs-creator` and close the docs pack; for typo/link-only edits, record the explicit reason and proportional proof | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| Autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; use dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>` until no accepted/actionable findings, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Per-PR task ownership | pending | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-19-keep-docx-paste-html-inert.md` | pending |
| Browser interaction proof | pending | Exercise the target route/interaction with the approved browser tool or record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route proof or exact caveat | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |
| Advisory source read | pending | Read repo advisories through `gh api repos/<owner>/<repo>/security-advisories/<GHSA_ID>`, public read-only GHSA records through `gh api advisories/<GHSA_ID>`, npm-only advisories through npm/advisory registry source, or private reports through the provided report source; otherwise record access blocker | pending |
| Security repro / regression proof | pending | Record failing-before/passing-after proof, PoC validation, or N/A reason | pending |
| Private disclosure guard | pending | For private/draft/embargoed/not-yet-public sources, use repository advisory/private fork or sanitized public artifacts until approved disclosure; otherwise record N/A: already public | pending |
| Patched version published | pending | Verify npm/package publish and GitHub release/tag when a package release is part of the fix | pending |
| Advisory metadata updated | pending | For repository advisories, update affected product metadata with exact package, vulnerable range, and patched version; for public read-only GHSA/non-GitHub sources, record N/A with source owner/blocker | pending |
| Advisory published | pending | Publish repository advisory after patched version availability, or record public GHSA/external/npm/private publication state or blocker | pending |
| CVE request decision | pending | Request CVE through repository advisory API when applicable, or record existing CVE, GitHub/global owner, external CNA/request owner, or N/A reason | pending |
| Advisory final readback | pending | Read back repository advisory state, `published_at`, `cve_id`, vulnerabilities, and URL, or record equivalent public GHSA/external source readback | pending |
| Propagation caveat | pending | Record GitHub review / Dependabot / advisory database propagation caveat, public GHSA/global owner, or external-source propagation owner in final handoff | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Private advisory and npm artifacts read; source and browser behavior reproduced | implementation |
| Implementation | done | Shared core helpers retain source document and move child nodes; core patch changeset | verification |
| Verification | done | 159 focused tests, core typecheck/build, platejs build, lint, pnpm check, Chrome proof, clean autoreview | PR |
| PR / tracker sync | done | Sanitized PR #5131 created; private report accepted and reporter updated | hosted CI |
| Closeout | pending | Fixed npm version and advisory publication require merged PR | final response |

Findings:
- The private repository report is valid at the package cleaner boundary. Current shipped core 53.3.11 and DOCX 53.0.0 contain the affected path.
- Chrome executed a harmless browser callback before the fix. After rebuilding the core and umbrella package artifacts, both styled-content and quote conversions returned cleaned HTML without that callback.
- The first browser rerun used stale built workspace output; rebuilding the package graph changed the result. Package artifact identity matters for this proof.

Decisions and tradeoffs:
- Change the two shared core transforms, avoiding a DOCX-only filter. The source document owns new elements and child nodes move rather than being reparsed.
- Preserve the reporter's private technical detail outside the public plan and PR. Release the package before metadata or public advisory publication.
- No public API, export, barrel, template, registry or docs change.

Implementation notes:
- Core helper changes, two focused behavior regressions and one core patch changeset. No source comments added for obvious operations.

Review fixes:
- Initial structured review raised nested FONT traversal. A runnable old/new comparison produced the same returned HTML in both versions; the old traversal visited only an orphaned subtree. A second structured review accepted that evidence and finished clean with no actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First Chrome rerun loaded stale built core | 1 | Build core and umbrella packages; rebundle fixture | Both browser paths pass |
| Initial review inferred nested FONT output regression | 1 | Run old/new output comparison and seek source-backed rereview | Clean second review |
| One Bun red test dumped oversized DOM objects | 1 | Redirect later test output to bounded log tail | Green tests read concisely |

Verification evidence:
- `bun test packages/core/src/lib/plugins/html/utils packages/docx/src/lib/docx-cleaner packages/docx/src/lib/DocxPlugin.spec.ts` in this checkout: 159 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core`, `pnpm --filter @platejs/core build`, `pnpm --filter platejs build`, `pnpm lint:fix` and `pnpm check` in this checkout: pass.
- Chrome local package fixture at `127.0.0.1:41244`: before fix callback fired; rebuilt fixed packages returned styled and quote HTML with no callback. Browser error log empty; the missing local image path is intentional proof input. Fixture files remain outside the repo.
- Autoreview `--mode local`: first P2 finding disproved by old/new output comparison; rerun with evidence reports no accepted/actionable findings.
- No real editor paste gesture or hosted release proof claimed.
- PR #5131: https://github.com/udecode/plate/pull/5131. Patch commit `deeccb6143` and plan ownership commit `2cdd3574f4` pushed. The public PR omits the private advisory ID and payload.
- Private tracker: accepted as a draft, reporter updated with the PR, and CVE request accepted by GitHub. Fixed version and publication remain pending release.

Final handoff contract:
- PR line: https://github.com/udecode/plate/pull/5131
- Issue / tracker line: private repository advisory; public identifier omitted until disclosure
- Confidence line: high for package behavior; limited to direct cleaner browser execution
- Flow table:
  - Reproduced: source trace plus actual cleaner browser callback before fix
  - Verified: 159 focused tests, full check, browser clean of both paths
- Browser check: direct cleaner fixture, no full editor paste gesture
- Outcome: shared HTML transforms preserve source-document ownership and avoid reparsing descendants
- Caveat: package release and advisory closeout require merged PR
- Design:
  - Chosen boundary: shared core HTML helpers
  - Why not quick patch: DOCX-only filtering would leave the shared conversion primitive unchanged
  - Why not broader change: no other reported path requires a parser redesign
- Verified: package tests, typecheck/build, lint, pnpm check, local Chrome and final structured review
- PR body verified: one task-plan line and sanitized description at pushed head; repeat at final head after this plan update

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
- PR: https://github.com/udecode/plate/pull/5131
- Task plan at exact PR head: this file identifies PR #5131; verify after final push
- Issue / tracker: private report accepted as draft; reporter updated; CVE requested, assignment pending
- Browser proof: direct cleaner fixture passed in Chrome; no full editor paste gesture
- Caveats: hosted CI, merge, fixed npm release and advisory publication pending

Timeline:
- 2026-09-19T09:28:13.095Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | PR and private tracker sync complete; hosted CI running |
| Where am I going? | Release/advisory after authorized merge |
| What is the goal? | Keep DOCX paste transforms in the source document and ship the fixed package |
| What have I learned? | Browser proof must use rebuilt workspace artifacts; old nested-font traversal changed no returned HTML |
| What have I done? | Source fix, changeset, focused/full checks, Chrome proof, structured review |

Open risks:
- Full editor paste gesture remains unexercised in this pass. Merge, npm release and advisory publication are separate pending authorities.
