# normalize platejs peer manifests

Objective:
Normalize Plate package host edges; done when survivors use peer-plus-dev, manifest enforcement passes, and package checks are green; plan docs/plans/2026-08-27-normalize-platejs-peer-manifests.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-27-normalize-platejs-peer-manifests.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: direct user correction
- id / link: N/A
- title: Normalize `platejs` host dependency declarations
- acceptance criteria: workspace packages that consume `platejs` declare it as a compatible peer plus a workspace dev dependency, never a normal dependency; `platejs` keeps its normal `plitejs` dependency; the manifest checker enforces the law and passes.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A: no duration requested
- initial confidence score: N/A: command and source-audit thresholds are concrete
- improvement loop: fix each failing manifest/checker owner until the named gates pass
- final score / loop closure: N/A: close on exact pass/fail evidence

Completion threshold:
- Zero workspace manifests outside `platejs` declare `dependencies.platejs`.
- Every workspace package that imports or peers on `platejs` declares a compatible `peerDependencies.platejs` and `devDependencies.platejs=workspace:^`.
- The manifest checker handles current workspace directories, enforces both prohibitions/requirements, and `pnpm test:manifests` passes.
- `pnpm install`, scoped lint, relevant package checks, P1 autoreview, agent-native review, and the final plan checker pass or have an explicit evidence-backed N/A.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-normalize-platejs-peer-manifests.md` passes.

Verification surface:
- `pnpm test:manifests` in `/Users/zbeyens/git/plate-2`, including exact `platejs -> plitejs` prerelease ownership.
- A bounded manifest source audit for dependency/peer/dev placement.
- `pnpm install`, scoped lint, and affected package/type checks selected after the final diff.
- P1 autoreview and agent-native review of the final local diff.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `docs/plans/2026-08-26-plitejs-platejs-distribution-hard-cut.md`, current package manifests, and `tooling/scripts/check-workspace-package-manifests.mjs`.
- Allowed edit scope: workspace package manifests, lockfile/install metadata, manifest enforcement/tests, one release artifact when required, and this goal plan.
- Browser surface: N/A: dependency metadata and Node enforcement only.
- Browser strategy: N/A: no browser-rendered behavior changes.
- Tracker sync: N/A: direct user request without tracker.
- Non-goals: no feature/API implementation, package absorption, PR, commit, push, docs rewrite, or runtime behavior change.

Output budget strategy:
- Use exact manifest paths, a short Node-generated classification table, bounded `rg`, and capped command output. Exclude generated registry data, build output, dependencies, and unrelated package source.

Blocked condition:
- Stop only if package-manager/install state fails three times for the same external reason or current source proves a retained package requires a private `platejs` runtime contrary to the accepted distribution law.

Task state:
- task_type: package manifest and enforcement repair
- task_complexity: normal, non-trivial
- current_phase: review
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: valid; current manifests violate the accepted peer-host law and the checker targets deleted directories.
- confidence: high from current manifests, accepted distribution plan, and failing `pnpm test:manifests` reproduction.
- next owner: task
- reason: runtime-sharing packages must peer on the host; dev dependencies provide the local workspace implementation; normal dependencies can install a second host runtime.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-normalize-platejs-peer-manifests.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and non-goals above copy the user correction and agreed final law. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Loaded `task`, `autogoal`, and `changeset`; package-api and agent-native packs apply. |
| Active goal checked or created | yes | Created the matching active goal before implementation. |
| Source of truth read before edits | yes | Read the accepted distribution plan, representative manifests, and current checker. |
| Tracker comments and attachments read | no | N/A: no tracker source. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: the accepted distribution plan is the direct current source of truth. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior changes; the executable manifest checker is the regression surface. |
| Branch decision for code-changing task | yes | Continue in the user-provided checkout; no PR/commit/branch action requested. |
| Release artifact decision | yes | Compare against `main`; add/update package changesets only for published user-visible manifest deltas not already covered. |
| Browser tool decision for browser surface | no | N/A: metadata/tooling-only task. |
| PR expectation decision | no | N/A: user did not request a PR. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Bounded strategy recorded above. |
| Package/API pack selected | yes | Package host boundaries and publish metadata change. |
| Public surface or package boundary identified | yes | `platejs` is the shared host; scoped consumers must peer on it and use a dev workspace provider. |
| Release artifact path selected | yes | `.changeset` only when comparison with `main` proves an uncovered published delta; otherwise an exact N/A will be recorded. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before manifest edits; final need remains main-relative. |
| Barrel/export impact decision recorded | no | N/A: no exports or exported file layout change. |
| Agent-native pack selected | yes | The `pnpm test:manifests` command contract changes. |
| Agent-facing action surface identified | yes | `tooling/scripts/check-workspace-package-manifests.mjs`, invoked by `pnpm test:manifests`. |
| Source rule versus generated mirror boundary identified | yes | The tooling script is canonical source; no generated mirror exists. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Required before closeout; load after the final diff is available. |

Work Checklist:
- [x] N/A: no duration was requested. If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] N/A: no video or screen recording. Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions, accepted distribution law, representative manifests, and the current checker read before edits.
- [x] Implementation fixes the package-host ownership boundary across all 42 public scoped packages and the canonical manifest checker.
      is recorded with reason.
- [x] Release artifact requirement recorded: existing main-relative survivor changesets now include the peer-host requirement; absorbed packages receive no synthetic release.
      N/A with reason.
- [x] Final handoff shape decided: direct task outcome, exact tests, packed-manifest proof, review, no browser, no PR/tracker.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: continue in the user-provided checkout; no PR/commit/branch action requested.
      new branch needed, or N/A with reason.
- [x] N/A: no install-corruption signal occurred; peer warnings are pre-existing external compatibility warnings. Local-env-rot retry policy recorded for any surprising repo-wide failure:
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: all proof ran in `/Users/zbeyens/git/plate-2`; packed manifests were extracted from package-owned tarballs.
      owns the changed behavior.
- [x] High-risk note recorded: failure mode is a second Plate/Plite runtime or a peer missing from packed metadata; source audit, negative tests, install/typecheck, and packed manifest extraction prove the host boundary; peer-plus-dev is correct because extensions share the consumer's editor runtime.
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] P1 autoreview target selected from the exact manifest/checker/lockfile patch; the inherited full local bundle failed closed on an unrelated secret-like value, so the identical task files were reviewed in a temporary Git bundle.
- [x] Agent-native review PASS: `pnpm test:manifests` is the agent route, `tooling/scripts/check-workspace-package-manifests.mjs` is the source owner, package manifests/lockfile are inspectable output, and focused/root commands are repeatable proof.
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded: only bounded manifest classifications and exact-file reads are permitted.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Package/API pack: public runtime-host boundary and packed dependency metadata are recorded.
- [x] Package/API pack: existing survivor `.changeset` files cover the published peer-host delta; absorbed packages correctly receive no synthetic release.
- [x] Package/API pack: loaded `changeset`; kept one package per file and concise imperative user impact.
- [x] Package/API pack: N/A: no registry-only work.
- [x] Package/API pack: N/A: published survivors have release artifacts; absorbed packages are deleted by the accepted distribution cut.
- [x] Package/API pack: hard-cut decision is explicit: no normal `platejs` dependency in scoped packages and no direct `plitejs` declaration outside `platejs`.
- [x] Package/API pack: 46-package Turbo typecheck passed, including required dependency builds.
- [x] Package/API pack: N/A: no exported file layout or barrels changed; survivor release notes were updated.
- [x] Agent-native pack: the canonical tooling script and package manifests were edited, not generated mirrors.
- [x] Agent-native pack: `pnpm test:manifests` is discoverable in root `package.json` and its focused test is part of the fast test suite.
- [x] Agent-native pack: N/A: no `.agents/rules/**` source changed; `pnpm install` nevertheless completed successfully.
- [x] Agent-native pack: PASS with no accepted findings; command route, source owner, inspectable output, and repeatable proof are complete.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Final audit reports 42 scoped packages peer-plus-dev and exact Plate-to-Plite pin; all named commands pass. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Before fix, `pnpm test:manifests` failed on deleted `packages/udecode`; source audit found normal `dependencies.platejs` declarations. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Focused fast suite: 6 pass, 0 fail; `pnpm test:manifests` passes. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no typed code contract changed; nevertheless 74 Turbo tasks passed across all 46 packages. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or exported file layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` and final `pnpm install --frozen-lockfile` pass; packed manifests prove published edges. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no rule or skill source changed; install prepare still completed successfully. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; package tarballs supplied publish proof. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: package metadata and Node command only. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no browser surface. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output changed. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | All nine retained survivors state the Plate peer requirement in existing one-package changesets; `platejs-foundation` states exact beta Plite ownership. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry work. |
| Docs or content changed | no | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only internal goal plan and release artifacts changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Duplicate host or loose beta runtime risk closed by negative tests, frozen install, 46-package typecheck, source audit, and tarball inspection. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | PASS: root command route, canonical source, fast-suite coverage, and repeatable proof exist; no findings. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no corruption signal. |
| P1 autoreview for non-trivial implementation changes | yes | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | Scoped exact-file temporary Git bundle reviewed with `--mode local --max-priority P1`: clean, 0.98 confidence, no accepted/actionable findings. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: user did not request PR/commit/push. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or browser proof. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `ultracite fix`, then final `ultracite check` on 48 files passed. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Searches were bounded; the broad Turbo output was capped and completed. No generated registry/log trees were streamed. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-normalize-platejs-peer-manifests.md` | Final closeout run passes after this evidence row was resolved. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Final source audit: 42 scoped packages have no normal Plate dependency, explicit peers, and workspace dev providers; only `platejs` owns Plite exactly. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published install metadata changes for nine survivors plus exact beta runtime ownership for `platejs`; absorbed packages receive no synthetic release. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing one-package survivor changesets and `platejs-foundation.md` updated; no forbidden core minor added. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry work. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: release artifacts are required and present. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | 74 successful Turbo tasks across 46 packages; focused checker 6/6; packed package audit 10/10. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export/file-layout change. |
| Agent source / generated sync | no | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | N/A: no agent sources changed; install prepare passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Root `package.json` exposes `test:manifests`; the script's success/failure output names the enforced law. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS, no findings. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | accepted law, manifests, checker, skills, and requirements recorded | implementation |
| Implementation | complete | 42 public scoped manifests normalized; checker and six negative/positive rows added; exact Plite beta pin enforced | verification |
| Verification | complete | install, manifests, focused tests, lint, 46-package typecheck, and packed survivor manifests pass | review |
| PR / tracker sync | complete | N/A: direct user task; no PR or tracker requested | final response |
| Closeout | complete | final plan checker passes | final response |

Findings:
- Current packages use three conflicting shapes: normal dependency only, normal dependency plus dev, and normal dependency plus peer plus dev.
- `@platejs/browser` and `@platejs/yjs` already model the intended peer-plus-dev host relationship.
- `pnpm test:manifests` crashes because the checker scans deleted `packages/udecode`; it also later targets deleted `packages/plate` instead of `packages/platejs`.
- `workspace:^` would publish a caret Plite dependency, contradicting the accepted exact-beta-pin law; `platejs` therefore uses `workspace:*`, which packed as exact `plitejs@0.0.1`.
- Packed survivor manifests preserve explicit `platejs@>=54.0.0-beta.1` peers and omit normal `platejs` dependencies.

Decisions and tradeoffs:
- Enforce one host law across every current workspace consumer, including packages scheduled for absorption, because published packages must remain safe until deletion.
- Preserve `platejs -> plitejs` as the sole normal editor-runtime dependency and use `workspace:*` so beta packages publish an exact Plite version; only scoped Plate consumers peer on `platejs`.

Implementation notes:
- Normalized 42 public `@platejs/*` manifests to no `dependencies.platejs`, explicit `peerDependencies.platejs`, and `devDependencies.platejs=workspace:^`.
- Rebuilt manifest enforcement around current `packages/*`, added pure validation for tests, and removed deleted-directory assumptions.
- Added six checker tests covering the valid graph and each forbidden dependency shape.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm pack --dry-run` is unsupported by pnpm 9 | 1 | Pack into a generated temporary directory, inspect tarball manifests, then remove the exact temporary directory | Resolved; all ten packed manifests passed. |
| Full inherited local autoreview bundle contained an unrelated secret-like value | 1 | Rebuild the exact task patch in a temporary Git repository and rerun the same P1 helper | Resolved; TruffleHog clean and P1 autoreview clean. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` -> pass; lockfile reconciled. Existing external peer warnings remain unrelated.
- `pnpm test tooling/scripts/check-workspace-package-manifests.test.mjs` -> 6 pass, 0 fail.
- `pnpm test:manifests` -> pass across current workspace manifests.
- `pnpm exec ultracite check packages/*/package.json tooling/scripts/check-workspace-package-manifests.mjs tooling/scripts/check-workspace-package-manifests.test.mjs` -> pass on 48 files.
- `pnpm turbo typecheck --filter='./packages/*'` -> 74 tasks successful across 46 packages.
- Temporary `pnpm pack` audit -> nine survivors publish `platejs@>=54.0.0-beta.1` only as a peer; `platejs` publishes exact `plitejs@0.0.1`.
- Agent-native capability map: package-maintainer action -> `pnpm test:manifests` -> canonical tooling script -> manifests/lockfile -> focused test plus packed audit -> PASS, no findings.
- P1 autoreview exact task bundle -> clean, no accepted/actionable findings, overall 0.98.
- Final `pnpm install --frozen-lockfile` plus focused tests, manifest command, lint check, and 42-package source audit -> pass.

Final handoff contract:
- PR line: N/A: no PR requested
- Issue / tracker line: N/A: direct task
- Confidence line: 98%; package source, install graph, packed output, typechecks, negative tests, and P1 review agree
- Flow table:
  - Reproduced: stale checker failed on deleted workspace path and manifests contained normal Plate host dependencies; browser N/A
  - Verified: 6 focused tests, manifest check, frozen install, 46-package typecheck, 10 packed manifests, source audit, and P1 review pass; browser N/A
- Browser check: N/A: no browser surface
- Outcome: 42 scoped packages use peer-plus-dev; only `platejs` owns an exact Plite beta runtime; enforcement fails closed on regressions.
- Caveat: install still reports unrelated existing third-party peer warnings.
- Design:
  - Chosen boundary: public scoped packages share the consumer's Plate host; `platejs` alone installs Plite.
  - Why not quick patch: hand-fixing current manifests without executable enforcement would immediately regress.
  - Why not broader change: feature absorption and survivor source rewrites remain owned by the accepted distribution plan.
- Verified: exact commands and packed artifacts listed above.
- PR body verified: N/A: no PR

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
- PR: N/A: not requested
- Issue / tracker: N/A: none
- Browser proof: N/A: no browser surface
- Caveats: unrelated existing package-manager peer warnings only

Timeline:
- 2026-08-27T21:25:28.992Z Task goal plan created.
- 2026-08-27 Requirements, skills, accepted package law, failing checker, and bounded execution contract recorded before implementation.
- 2026-08-27 Normalized 42 package manifests, repaired enforcement, added six tests, reconciled install state, passed all package typechecks, and verified packed consumer metadata.
- 2026-08-27 Closed agent-native and P1 reviews, reran frozen install and focused proof, and completed the goal plan.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Goal complete |
| Where am I going? | Final handoff |
| What is the goal? | Normalize every `platejs` host edge to peer-plus-dev and make enforcement pass. |
| What have I learned? | Peer-plus-dev is the correct scoped host contract; Plate must pin its Plite prerelease exactly with `workspace:*`. |
| What have I done? | Implemented and proved the manifest graph, packed output, tooling route, lint, install, all package typechecks, agent-native parity, and P1 review. |

Open risks:
- Existing third-party peer warnings during install are outside this task and unchanged by the Plate host graph.
