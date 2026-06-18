# slate v2 deletion readiness

Objective:
Slate v2 donor checkout can be deleted; done when manifest/ledger are self-contained, no active refs remain, and check:slate/deletion audits pass.

Goal plan:
docs/plans/2026-06-18-slate-v2-deletion-readiness.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- docs (docs/plans/templates/packs/docs.md)

Task source:
- type: user follow-up from Slate v2 transplant closure
- id / link: N/A: local repo deletion-readiness gate
- title: Delete `.tmp/slate-v2` only after lossless, self-contained transplant proof
- acceptance criteria:
  - archive/research/docs rows are not hidden by nested `.gitignore`
  - `slate:source:check` works without requiring `.tmp/slate-v2`
  - `check:slate` is deletion-ready or blocker is recorded with exact failing gate
  - no active package/docs/examples/tests/scripts reference `.tmp/slate-v2`
  - delete `.tmp/slate-v2` only after the gates above pass

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: binary deletion-readiness gate
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `pnpm slate:source:check` passes without `.tmp/slate-v2` present.
- `pnpm check:slate` passes, or a real blocker is recorded with exact command, failing gate, and next owner.
- Source audit proves no active source/test/docs/example/tooling path depends on `.tmp/slate-v2`.
- Source audit proves donor research artifacts are tracked outside ignored archive paths.
- `.tmp/slate-v2` is deleted only if all deletion gates are green.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-slate-v2-deletion-readiness.md` passes.

Verification surface:
- `pnpm slate:source:check`
- `pnpm check:slate`
- `rg ".tmp/slate-v2|/slate-v2" ...` scoped active-reference audit
- `git check-ignore` and `git ls-files --others --exclude-standard` audits for transplant archive/research docs
- deletion simulation by moving `.tmp/slate-v2` aside before source checks

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `docs/transplant/slate-v2/*` manifest/ledger/scripts, `package.json` Slate scripts, active Slate packages/docs/examples/tests/tooling.
- Allowed edit scope: transplant scripts/ledgers, package scripts, docs/research raw storage, no-reference audit docs if needed.
- Browser surface: Slate browser proof only through `check:slate`; no new UI behavior work unless the gate exposes a real blocker.
- Tracker sync: N/A: no external tracker or PR requested.
- Non-goals: do not migrate Plate runtime, do not broaden public API/docs, do not delete donor checkout until gates pass.

Output budget strategy:
- Use `rg`/`find` scoped to transplant, docs/research, package scripts, and active Slate surfaces. Cap command output with `sed`, `head`, or focused summaries. Save high-volume audit results to command counts instead of streaming whole lists when possible.

Blocked condition:
- Stop before deleting `.tmp/slate-v2` if source checks still require the donor checkout, active references remain, tracking audits find ignored required artifacts, or `check:slate` fails for a product/test blocker that cannot be safely fixed in this closure pass.

Task state:
- task_type: transplant deletion-readiness verification and tooling repair
- task_complexity: normal
- current_phase: verification
- current_phase_status: in_progress
- next_phase: browser-gate closure
- goal_status: active

Current verdict:
- verdict: deletion accounting green; Slate browser proof mode hardened; full closure still needs an uninterrupted `pnpm check:slate`
- confidence: high for lossless donor accounting, higher for browser-proof reliability after isolated proof cache and source-mode guard; full deletion readiness still not complete until the full gate finishes
- next owner: task
- reason: `.tmp/slate-v2` is absent and source-switch parity accounts for every donor row; focused browser proof now runs against a dedicated source-mode Slate proof server, but the complete 2752-row browser gate was not allowed to finish in this packet.

Pre-solution issue challenge:
- reporter claim: N/A: not a bug report
- suggested diagnosis or fix: N/A
- repro ladder:
  - tests / source-level repro: N/A
  - Playwright / automated browser: N/A except `check:slate`
  - Browser plugin: N/A
  - screenshot / visual proof: N/A
- reproduction verdict: N/A
- validity verdict: N/A
- best long-term fix boundary: make transplant/deletion checks self-contained, not dependent on donor checkout.
- harsh honest feedback: deletion before self-contained proof would be fake confidence.
- hard-stop decision: hard stop before deletion on any active `.tmp/slate-v2` dependency or hidden required artifact.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-slate-v2-deletion-readiness.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | pending | pending |
| Skill analysis before edits | pending | pending |
| Active goal checked or created | pending | pending |
| Source of truth read before edits | pending | pending |
| Tracker comments and attachments read | pending | pending |
| Video transcript evidence required | pending | pending |
| Pre-solution issue challenge required | pending | pending |
| Reproduction verdict before implementation | pending | pending |
| Repro escalation ladder selected | pending | pending |
| Suggested fix reviewed against durable boundary | pending | pending |
| `docs/solutions` checked for non-trivial existing-code work | pending | pending |
| TDD decision before behavior change or bug fix | pending | pending |
| Branch decision for code-changing task | pending | pending |
| Release artifact decision | pending | pending |
| Browser tool decision for browser surface | pending | pending |
| PR expectation decision | pending | pending |
| Tracker sync expectation decision | pending | pending |
| Output budget strategy recorded | pending | pending |
| Docs pack selected | pending | pending |
| `docs-creator` loaded | pending | pending |
| Docs lane selected | pending | pending |
| Target docs and nearest sibling docs read | pending | pending |
| Docs style doctrine read | pending | pending |
| Documented source owner identified | pending | pending |

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
- [ ] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [ ] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [ ] Docs pack: docs use current-state reference voice, not changelog voice.
- [ ] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.

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
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-18-slate-v2-deletion-readiness.md` | pending |
| Docs source-backed claim audit | pending | Verify docs claims against current source or record N/A | pending |
| Docs links / routes / previews | pending | Verify leaf links, routes, anchors, and preview names or record N/A | pending |
| Docs MDX/content parser | pending | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | pending |
| Plugin page specifics | pending | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | in_progress | created plan | implementation |
| Implementation | pending | | verification |
| Verification | pending | | closeout |
| PR / tracker sync | pending | | final response |
| Closeout | pending | | final response |

Findings:
- `.tmp/slate-v2` is physically absent.
- `pnpm slate:source:check` passes without the donor checkout. Stored artifacts are self-contained and source-switch parity accounts for `2157/2157` donor rows.
- Donor category accounting includes `446` package-source rows, `1280` package-test rows, `37` Playwright integration rows, `35` benchmark-script rows, `134` docs rows, `43` site-example rows, and `21` raw research-artifact rows.
- Active exact reference audit for `.tmp/slate-v2` is clean across active Slate docs, rules/skills, package/app/tests/benchmarks/content paths, excluding historical research/archive folders.
- `git ls-files --others --exclude-standard docs/transplant/slate-v2` returned `0`; spot `git check-ignore` checks for donor manifest, source-switch ledger, and archived research/docs returned no ignore hits.
- Full `pnpm check:slate` reached the browser gate and failed before completion. Earlier gates in that command passed: source check, package typecheck/build/test, browser package tests, docs audit, benchmark target check, docs check, and www typecheck.
- Browser failures are not donor-path failures. Most failing Firefox rows surface Next dev `ChunkLoadError` while loading dynamic Slate example chunks; the huge-document Firefox downward-drag autoscroll row also fails with `scrollTop` staying `0`.

Decisions and tradeoffs:
- Keep `.tmp/slate-v2` deleted/absent for this verification pass; do not restore the donor checkout just to make checks pass.
- Treat source-switch parity as the authority for deletion/new-file accounting.
- Do not weaken runtime-error assertions to hide Next dev chunk errors.
- Force Slate browser Playwright to use source aliases (`PLATE_WWW_DEV_SOURCE=1`) so the prior `slate:packages:build` step cannot silently change browser behavior proof from source to dist.
- Rejected the Turbopack FS-cache disable experiment because focused reruns still produced chunk-load failures.
- Rejected switching the Slate browser lane to `next dev --webpack` in this pass because it was slower and still produced app route failures/timeouts.

Implementation notes:
- Rewrote active `docs/slate-v2/**` references away from `.tmp/slate-v2` to their transplanted Plate-root paths. Historical research/archive paths remain excluded from active-reference proof.
- Updated `apps/www/playwright.slate.config.ts` so the Slate browser web server starts with `PLATE_WWW_DEV_SOURCE=1`, and the Playwright process also defaults that env var.
- Added `apps/www` `dev:slate`, a minimal Slate shell, `/api/slate/ready`, and Playwright global setup so Slate browser proof fails fast unless `PLATE_WWW_SLATE=1` and `PLATE_WWW_DEV_SOURCE=1` are active.
- Isolated Slate mode into `apps/www/.next-slate` so normal docs dev chunks cannot poison source-mode Slate browser proof.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full `pnpm check:slate` browser gate failed/interrupted after 894 passed, 18 failed, 24 skipped, 1815 not run | 1 | Focus failed Firefox rows and separate dev-server chunk churn from real behavior failures | Source aliases fixed many dist-chunk errors, but not the whole browser gate |
| `PLATE_WWW_TURBOPACK_FS_CACHE=0` experiment | 1 | Remove ineffective env/config change | Reverted; failures still moved across chunk-load rows |
| `next dev --webpack` experiment | 1 | Do not switch the lane wholesale | Stopped; slower and still produced route errors/timeouts |
| Proof-mode benchmark initially left a normal Next dev child server alive | 1 | Kill the spawned process group and isolate proof mode cache | Stale dev lock explained the failed smoke attempt; rerun passed after cleanup |

Verification evidence:
- `pnpm --filter www typecheck` from `/Users/zbeyens/git/plate-2` passed after proof-mode and Next config edits.
- Focused proof command passed: `rm -rf apps/www/test-results/slate-browser && /usr/bin/time -p pnpm --filter www exec playwright test --config playwright.slate.config.ts --project=chromium tests/slate-browser/donor/examples/inlines.test.ts -g "copies and pastes only selected inline link text"` -> `1 passed (5.9s)`, wall `7.05s`.
- Wrong-server guard proof passed before the naming cleanup: normal docs dev returned a payload with both mode flags false and Playwright exited `1` before running the test with the expected mode error. The renamed guard now uses `/api/slate/ready` and `PLATE_WWW_SLATE=1`.
- Firefox proof smoke passed after isolated cache: `rm -rf apps/www/.next-slate apps/www/test-results/slate-browser && /usr/bin/time -p pnpm --filter www exec playwright test --config playwright.slate.config.ts --project=firefox tests/slate-browser/donor/examples/images.test.ts -g "keeps rapid image clicks selecting the latest void node|selects the lower adjacent image after dragging"` -> `2 passed (18.3s)`, wall `19.25s`.
- Source-chunk audit passed before rename: the isolated Slate cache returned no `packages_slate_dist*` chunk matches; renamed cache target is now `apps/www/.next-slate`.
- Readiness measurement before rename: normal docs dev without Slate mode returned ready payload in `3.80s`; the isolated Slate mode returned source/proof payload in `2.29s`; prestarted focused-test runtime was roughly unchanged because the test body dominates once the server is already warm. The mode is now named `dev:slate`.
- Naming cleanup proof passed: `rg -n 'slate-proof|SlateProof|PLATE_WWW_SLATE_PROOF|\\.next-slate-proof|dev:slate-proof|/api/slate-proof|slateProof|data-slate-proof' apps/www package.json docs/plans/2026-06-18-slate-v2-deletion-readiness.md .agents/rules .agents/skills -g '!**/node_modules/**'` returned no matches.
- Renamed Slate mode proof passed: `rm -rf apps/www/.next-slate apps/www/test-results/slate-browser && /usr/bin/time -p pnpm --filter www exec playwright test --config playwright.slate.config.ts --project=chromium tests/slate-browser/donor/examples/inlines.test.ts -g "copies and pastes only selected inline link text"` -> `1 passed (5.9s)`, wall `6.51s`.
- Renamed cache audit passed: `rg -n 'packages_slate_dist|packages_slate-react_dist|packages_slate-dom_dist|packages_slate-history_dist' apps/www/.next-slate` returned no matches; `packages_slate_src*` chunks were present.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: pending
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: pending
- Outcome: pending
- Caveat: pending
- Design:
  - Chosen boundary: pending
  - Why not quick patch: pending
  - Why not broader change: pending
- Verified: pending
- PR body verified: pending

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
- PR: pending
- Issue / tracker: pending
- Browser proof: pending
- Caveats: pending

Timeline:
- 2026-06-18T08:46:25.361Z Task goal plan created.
- 2026-06-18 Browser proof hardening packet added dedicated Slate proof mode, mode guard, isolated Next cache, and focused benchmark evidence.
- 2026-06-18 Renamed Slate mode from proof-specific names to `dev:slate`, `/api/slate/ready`, `PLATE_WWW_SLATE`, and `.next-slate`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Full `pnpm check:slate` rerun after browser proof hardening |
| What is the goal? | Delete `.tmp/slate-v2` only after lossless self-contained transplant proof and Slate gates are green |
| What have I learned? | Deletion accounting is green; remaining risk is proof-host reliability, not missing donor files |
| What have I done? | Added proof-mode isolation, source-mode guard, and focused browser/typecheck evidence |

Open risks:
- Full `pnpm check:slate` has not completed uninterrupted after the proof-mode isolation change.
- `apps/www` Slate mode improves reliability more than per-test runtime; a separate `apps/slate` app is only justified if the isolated mode still leaks docs-app failures.
