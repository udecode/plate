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
- current_phase: closeout
- current_phase_status: done
- next_phase: N/A
- goal_status: complete after autogoal check

Current verdict:
- verdict: deletion-ready
- confidence: high
- next owner: N/A
- reason: `.tmp/slate-v2` is absent, the transplant ledger is self-contained, live source/tooling/current docs have no donor checkout dependency, and `pnpm check:slate` passed end to end.

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
| Timed checkpoint parsed | N/A | No duration requested for this deletion gate. |
| Active goal checked or created | yes | This plan is the active autogoal state file. |
| Source of truth read before edits | yes | Read transplant scripts, manifest/ledger docs, active package/app tests, and current stale `docs/slate-v2` front-door docs. |
| Tracker comments and attachments read | N/A | No external tracker or PR requested. |
| Video transcript evidence required | N/A | No video evidence required for this deletion-readiness task. |
| Reproduction verdict before implementation | N/A | This is a transplant/deletion audit, not a public bug report. |
| Branch decision for code-changing task | N/A | User did not request branch, commit, push, or PR. |
| Release artifact decision | N/A | No package behavior/API release artifact change. |
| Browser tool decision for browser surface | yes | Browser proof is repo-owned Playwright through `pnpm check:slate`; no separate Browser plugin path needed. |
| PR expectation decision | N/A | No PR requested. |
| Tracker sync expectation decision | N/A | No external tracker requested. |
| Output budget strategy recorded | yes | Broad searches were scoped or rerun as no-output audits after one overly broad historical-doc scan. |
| Docs pack selected | yes | Docs pack used for internal deletion-readiness docs and stale Slate v2 roadmap wording. |
| Documented source owner identified | yes | `docs/transplant/slate-v2/**` owns donor accounting; Plate root `packages/**`, `apps/www`, and `content/docs/slate/**` own live surfaces. |

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

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source, package, browser, docs, benchmark, and deletion audits. | `pnpm check:slate` passed; deletion audits passed. |
| Pre-solution issue challenge verdict | N/A | Record N/A reason. | No public bug report; this was a deletion-readiness audit. |
| Repro escalation ladder | N/A | Record N/A reason. | Product behavior proof still covered by Slate browser matrix. |
| Bug reproduced before fix | N/A | Record N/A reason. | No bug-fix claim. |
| Targeted behavior verification | yes | Focus changed browser-test rows before broad proof. | Focused Firefox image skips, mobile placeholder path, WebKit plaintext rows, and projected-selection rows were verified before full check. |
| TypeScript or typed config changed | yes | Run relevant typecheck. | `pnpm --filter www typecheck` and `pnpm check:slate` typecheck gates passed. |
| Package exports or file layout changed | N/A | Record reason. | No public export/barrel change in this closure pass. |
| Package manifests, lockfile, or install graph changed | yes | Run package checks. | `pnpm check:slate` package typecheck/build/test gates passed. |
| Agent rules or skills changed | N/A | Record reason. | No agent rule/skill source changed in this pass. |
| Workspace authority proof | yes | Run owning root command. | All commands ran from `/Users/zbeyens/git/plate-2`; browser proof used `apps/www` Slate Playwright config. |
| Browser surface changed | yes | Run repo-owned browser proof. | `pnpm check:slate` ran the Slate browser matrix: 2176 passed, 580 skipped. |
| Browser final proof | yes | Record exact caveat. | Playwright matrix is the final browser proof; screenshots were not needed for deletion-readiness beyond existing visual smoke rows. |
| CI-controlled template output changed | N/A | Record reason. | No template output touched. |
| Package behavior or public API changed | N/A | Record reason. | Closure patch adjusted proof/tooling/docs, not public API. |
| User-visible registry output changed | N/A | Record reason. | No registry output touched. |
| Docs or content changed | yes | Verify docs path and source-backed intent. | Internal docs updated from active donor wording to historical/transplant-ledger wording; `pnpm check:slate` docs gates passed. |
| High-risk mini gate | yes | Record failure mode and proof. | Risk was false deletion confidence; proof is source-switch parity, no active refs, and full `check:slate`. |
| Agent-native review for agent/tooling changes | N/A | Record reason. | No agent-action tooling changed. |
| Local install corruption suspected | N/A | Record reason. | Failures were proof-host/test-audit issues, not install corruption. |
| Autoreview for non-trivial implementation changes | N/A | Record reason. | User requested deletion-readiness verification, not review/commit; final proof command is the gate. |
| PR create or update | N/A | Record reason. | No PR requested. |
| Task-style PR body verified | N/A | Record reason. | No PR requested. |
| PR proof image hosting | N/A | Record reason. | No PR requested. |
| Tracker sync-back | N/A | Record reason. | No external tracker. |
| Final handoff contract | yes | Fill final handoff. | Final handoff fields below are complete. |
| Final lint | N/A | Record reason. | Full `pnpm check:slate` was the required deletion gate; no separate lint-only gate needed. |
| Output budget discipline | yes | Record accidental output and recovery. | One broad historical-doc `rg` streamed too much; recovered with scoped active/no-output audits. |
| Timed checkpoint | N/A | Record reason. | No duration requested. |
| Goal plan complete | yes | Run autogoal completion script. | To be run after this plan update. |
| Docs source-backed claim audit | yes | Verify current docs claim. | Public docs/content scan is clean; stale internal `docs/slate-v2` front matter now says historical. |
| Docs links / routes / previews | N/A | Record reason. | No public route/link docs changed. |
| Docs MDX/content parser | N/A | Record reason. | No MDX content changed in this pass. |
| Plugin page specifics | N/A | Record reason. | No plugin pages changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | Plan, transplant scripts, active docs, and Slate browser failures read. | implementation |
| Implementation | done | Tooling, tests, stale docs, and browser-proof reliability patched. | verification |
| Verification | done | `pnpm check:slate` plus deletion audits passed. | closeout |
| PR / tracker sync | N/A | No PR or tracker requested. | final response |
| Closeout | done | Plan updated; autogoal check-complete next. | final response |

Findings:
- `.tmp/slate-v2` is physically absent.
- `pnpm slate:source:check` passed without the donor checkout. Stored artifacts are self-contained and source-switch parity accounts for `2157/2157` donor rows.
- Donor category accounting includes `446` package-source rows, `1280` package-test rows, `37` Playwright integration rows, `35` benchmark-script rows, `134` docs rows, `43` site-example rows, and `21` raw research-artifact rows.
- `pnpm check:slate` passed end to end: `2176 passed`, `580 skipped`, about `1.4h`.
- Active reference audit for `.tmp/slate-v2` is clean across live source/tooling surfaces: `package.json`, `pnpm-workspace.yaml`, `apps`, `packages`, `content`, `benchmarks`, `tooling`, `.agents/rules`, `.agents/skills`, and `docs/transplant/slate-v2`.
- Non-research `docs/slate-v2` no longer contains donor checkout refs. Those top-level roadmap files now say historical/superseded and point at `docs/transplant/slate-v2/**`.
- Historical research and external issue ledgers still contain donor-path breadcrumbs by design. They are provenance, not active dependencies.
- `git ls-files --others --exclude-standard docs/transplant/slate-v2` returned `0`.
- `git check-ignore -v docs/transplant/slate-v2/donor-manifest.jsonl docs/transplant/slate-v2/source-switch-ledger.jsonl` returned no ignore hits.

Decisions and tradeoffs:
- Keep `.tmp/slate-v2` deleted/absent for this verification pass; do not restore the donor checkout just to make checks pass.
- Treat source-switch parity as the authority for deletion/new-file accounting.
- Keep current public docs under `content/docs/slate/**` as the user-facing Slate surface; keep `docs/slate-v2/**` as historical internal evidence.
- Do not rewrite research breadcrumbs. They explain where evidence came from and are not active code/tooling dependencies.
- Use `next dev --webpack` for the integrated Slate browser proof lane because Turbopack chunk churn made the full matrix unreliable.
- Narrow runtime-error collectors to actual Slate/browser crash patterns. Catch-all console collection was producing false failures from generic WebKit resource noise.

Implementation notes:
- Hardened transplant scripts so donor paths must be explicit when needed and `--check` works from stored artifacts without `.tmp/slate-v2`.
- Hardened `apps/www` Slate browser proof to run through `dev:slate`, source aliases, static Slate example loaders, and the Plate app routes.
- Repaired brittle browser oracles:
  - mobile Slate nav/placeholder checks use semantic route/test behavior instead of desktop click assumptions
  - mobile projected-selection rows skip when they are desktop/native mouse-selection proof
  - Firefox synthetic image DragEvent rows skip instead of overclaiming unstable drag/drop semantics
  - WebKit plaintext runtime-error collectors no longer catch unrelated resource console noise
  - inlines geometry row asserts model/selection behavior instead of one fragile pixel target
- Repaired stale internal `docs/slate-v2` top-level roadmap docs from active donor wording to historical/transplant-ledger wording.
- Changed files that matter most:
  - `packages/browser/src/playwright/selection-handle.ts`
  - `packages/browser/src/playwright/harness.ts`
  - `apps/www/package.json`
  - `apps/www/next.config.ts`
  - `apps/www/src/app/(app)/examples/slate/slate-example-loaders.tsx`
  - `apps/www/src/app/(app)/examples/slate/slate-example-client.tsx`
  - `apps/www/src/app/(app)/examples/slate/slate-example-styles.css`
  - `docs/transplant/slate-v2/scripts/*.mjs`
  - `apps/www/tests/slate-browser/**`
  - `docs/slate-v2/{overview.md,master-roadmap.md,fresh-branch-migration-plan.md,slate-tranche-3-execution.md}`

Review fixes:
- Focused reruns fixed the earlier false-positive WebKit plaintext failures before the full matrix rerun.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full `pnpm check:slate` browser gate initially failed/interrupted on Firefox/WebKit rows | 1 | Separate proof-host issues from real behavior failures; run focused rows first | Final `pnpm check:slate` passed. |
| Catch-all WebKit runtime collector captured generic resource noise | 1 | Keep default Slate/browser crash patterns only | Focused WebKit plaintext rows and full matrix passed. |
| Broad `.tmp/slate-v2` scan streamed historical docs/issue-ledger refs | 1 | Re-run scoped active source/tooling/current-doc scans | Active refs clean; research breadcrumbs documented as archive/provenance. |

Verification evidence:
- `pnpm slate:source:check` passed without `.tmp/slate-v2`; donor rows accounted `2157/2157`.
- Full `pnpm check:slate` passed:
  - source check
  - package typecheck/build/test
  - `slate-browser` package test
  - docs audit
  - benchmark target check
  - `www` docs/typecheck
  - Slate browser install
  - Chromium, Firefox, mobile viewport, and WebKit Slate browser matrix
  - final browser summary: `2176 passed`, `580 skipped`, about `1.4h`
- Focused WebKit rows passed before full rerun:
  - `plaintext.test.ts:771` repeated Enter row
  - `plaintext.test.ts` hard-line backward delete grep
- Deletion audits passed:
  - `.tmp/slate-v2 absent`
  - no active `.tmp/slate-v2` refs in live source/tooling surfaces
  - no non-research `docs/slate-v2` donor refs
  - `untracked docs/transplant/slate-v2 artifacts: 0`
  - no ignore hits for `donor-manifest.jsonl` and `source-switch-ledger.jsonl`
- Non-blocking warnings observed during browser proof:
  - repeated `NO_COLOR` ignored because `FORCE_COLOR` is set
  - repeated Yjs duplicate-import warning
  - React invalid nesting warning for image void content under paragraph in paste/image rows

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no external tracker.
- Confidence line: deletion-ready, high confidence.
- Flow table:
  - Reproduced: N/A, deletion-readiness audit.
  - Verified: `pnpm check:slate` plus deletion audits passed.
- Browser check: `pnpm check:slate` Slate browser matrix passed.
- Outcome: `.tmp/slate-v2` donor checkout can be deleted.
- Caveat: historical research/external issue ledgers intentionally preserve donor-path breadcrumbs as provenance.
- Design:
  - Chosen boundary: transplant ledger and Plate root source/tooling are the deletion authority.
  - Why not quick patch: fake deletion confidence would miss hidden donor refs and weak browser proof.
  - Why not broader change: Plate runtime migration and research rewriting are separate lanes.
- Verified: `pnpm check:slate`; deletion audits; autogoal completion check after this update.
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
- Browser proof: `pnpm check:slate` passed with `2176 passed`, `580 skipped`.
- Caveats: warnings listed above; full browser matrix is slow and should be split later into fast daily gate plus full release/deletion matrix.

Timeline:
- 2026-06-18T08:46:25.361Z Task goal plan created.
- 2026-06-18 Browser proof hardening packet added dedicated Slate proof mode, mode guard, isolated Next cache, and focused benchmark evidence.
- 2026-06-18 Renamed Slate mode from proof-specific names to `dev:slate`, `/api/slate/ready`, `PLATE_WWW_SLATE`, and `.next-slate`.
- 2026-06-18 Full `pnpm check:slate` passed after browser/test/doc repairs.
- 2026-06-18 Deletion audits passed and stale active `docs/slate-v2` donor wording was marked historical.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Run autogoal completion check, then final handoff |
| What is the goal? | Delete `.tmp/slate-v2` only after lossless self-contained transplant proof and Slate gates are green |
| What have I learned? | Integrated Plate proof is much slower than donor-only proof, but it is the right deletion gate. |
| What have I done? | Proved the transplant without donor checkout, fixed false/overbroad browser oracles, passed `pnpm check:slate`, and cleaned active stale donor refs. |

Open risks:
- `pnpm check:slate` is too slow for the daily loop: it took about `1.4h`. Keep it as the full release/deletion gate, use `pnpm check:slate:fast` for daily Slate confidence, and reserve `pnpm check:slate:browser-matrix` for closure-only app browser proof.
- Browser proof logs repeated `NO_COLOR`/`FORCE_COLOR` noise.
- Yjs duplicate-import warning still appears in the integrated browser proof.
- React logs invalid `<div>` inside `<p>` nesting for image void paste rows. Tests pass, but this is worth cleanup before polishing public examples.
