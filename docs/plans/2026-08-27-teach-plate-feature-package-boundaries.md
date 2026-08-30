# teach plate feature package boundaries

Objective:
Teach Plate Feature package and Oxlint boundary law; done when source, generated skill, focused checks, and agent-native review pass; plan docs/plans/2026-08-27-teach-plate-feature-package-boundaries.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-27-teach-plate-feature-package-boundaries.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- agent-native (docs/plans/templates/packs/agent-native.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:

- type: direct user request
- id / link: N/A: no external tracker
- title: Teach package and Oxlint boundary maintenance in `plate-feature`
- acceptance criteria: the source rule, supporting rules, and reusable plan template state the shared-host dependency contract and the exact Oxlint import boundaries package work must maintain; generated mirrors are synced and reviewed.

First checkpoint:

- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:

- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary artifact and command threshold
- improvement loop: N/A: one-shot execution
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:

- `.agents/rules/plate-feature.mdc`, its supporting rules, and `docs/plans/templates/plate-feature.md` teach one consistent package-host and Oxlint maintenance contract.
- `pnpm install` regenerates `.agents/skills/plate-feature/**` with source/mirror parity.
- focused manifest, agent-native, lint, and goal checks pass with no accepted review finding left open.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-teach-plate-feature-package-boundaries.md` passes.

Verification surface:

- `pnpm test:manifests` for the dependency contract being taught.
- focused Oxlint/source audit for the configured import boundaries.
- `pnpm install` plus source/generated mirror comparison.
- scoped lint/format checks, agent-native review, and the autogoal completion checker.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: `.agents/rules/plate-feature.mdc`, `.agents/rules/plate-feature/rules/**`, `oxlint.config.ts`, and `tooling/scripts/check-workspace-package-manifests.mjs`.
- Allowed edit scope: Plate Feature source rule/resources, reusable Plate Feature plan template, generated skill mirrors, and this task plan.
- Browser surface: N/A: agent workflow prose and plan structure only.
- Browser strategy: N/A: no browser-facing source or behavior changes.
- Tracker sync: N/A: no tracker requested.
- Non-goals: changing package manifests, public runtime APIs, Oxlint enforcement, releases, commits, pushes, or PRs.

Output budget strategy:

- Read exact Plate Feature sources and bounded Oxlint/manifest sections only; cap command output and avoid generated/build/dependency trees.

Blocked condition:

- Stop only if source generation cannot reproduce the Plate Feature mirror or the authoritative package/Oxlint contracts contradict each other.

Task state:

- task_type: agent workflow doctrine
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: complete
- confidence: high
- next owner: user
- reason: Plate Feature source, generated mirrors, reusable template, and focused proof all close the request.

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-teach-plate-feature-package-boundaries.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Package rules and Oxlint maintenance rules copied into acceptance criteria and boundaries. |
| Timed checkpoint parsed | no | N/A: none requested. |
| Skill analysis before edits | yes | Read named `plate-feature`, supporting rules, `autogoal`, and `agent-native-reviewer`. |
| Active goal checked or created | yes | Created matching active goal after confirming none existed. |
| Source of truth read before edits | yes | Read `.agents/rules/plate-feature.mdc`, supporting rules, `oxlint.config.ts`, and manifest validator. |
| Tracker comments and attachments read | no | N/A: direct request only. |
| Video transcript evidence required | no | N/A: no video. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: workflow doctrine edit, not product-code diagnosis. |
| TDD decision before behavior change or bug fix | no | N/A: no runtime behavior change. |
| Branch decision for code-changing task | no | N/A: no branch or git mutation requested. |
| Release artifact decision | no | N/A: internal agent-only workflow change. |
| Browser tool decision for browser surface | no | N/A: no browser surface. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact files, bounded reads, and capped outputs only. |
| Agent-native pack selected | yes | `agent-native` pack materialized. |
| Agent-facing action surface identified | yes | Future Plate Feature package creation and entrypoint maintenance. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before edits. |
| Package/API pack selected | yes | `package-api` pack materialized to audit the taught boundary. |
| Public surface or package boundary identified | yes | `platejs` shared host, sole `plitejs` bridge, and headless/React import direction. |
| Release artifact path selected | no | N/A: no published user-visible delta. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset. |
| Barrel/export impact decision recorded | no | N/A: no exports or file layout change. |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
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
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the source-owned Plate Feature workflow and
      materializes the contract in its reusable plan template.
- [x] Release artifact requirement recorded: N/A because this is an internal agent-workflow change.
- [x] Final handoff shape decided: concise outcome, changed doctrine, verification, and no browser/release artifact.
- [x] Branch handling recorded for code-changing work: N/A because no git action was requested.
- [x] Local-env-rot retry policy recorded: run reinstall once only if install/check failure has the documented environment-rot signature.
- [x] Workspace authority recorded: all proof runs in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: wrong doctrine could let future packages bypass the host or pull React into headless bundles; manifest and Oxlint source audits prove the selected boundary.
- [x] P1 autoreview is N/A under the `autoreview` prose-only internal
      `SKILL.md`/workflow-doc exception; direct diff and agent-native review
      cover this task.
- [x] Agent-native review decision recorded: required and loaded.
- [x] Output budget discipline recorded and followed: searches are scoped and capped.
- [x] Agent-native pack: source-of-truth `.agents/rules/**` files were edited instead of generated skill mirrors.
- [x] Agent-native pack: package creation and entrypoint maintenance are discoverable from the named Plate Feature skill.
- [x] Agent-native pack: `pnpm install` synced `.agents/skills/plate-feature/**` and exact parity passed.
- [x] Agent-native pack: agent-native review passed with no accepted finding.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: no artifact because only internal agent workflow changes.
- [x] Package/API pack: N/A: no `.changeset` work.
- [x] Package/API pack: N/A: no registry work.
- [x] Package/API pack: no-artifact decision recorded as internal agent-only doctrine.
- [x] Package/API pack: N/A: the public shape does not change.
- [x] Package/API pack: N/A: no package source or types changed; `pnpm test:manifests` proves the dependency law being taught.
- [x] Package/API pack: N/A: no exports, barrels, or published release notes changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Manifest, workflow tests, mirror parity, Oxlint/template audit, formatting, and diff checks pass. |
| Bug reproduced before fix | no | Record failing test/repro or N/A with reason | N/A: doctrine addition, not a behavior bug. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `node --test tooling/scripts/check-plate-feature.test.mjs`: 12/12 pass. |
| TypeScript or typed config changed | no | Run relevant typecheck | N/A: no TypeScript or typed config changed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exports or exported files changed. |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no package metadata delta; `pnpm install` still ran to sync agent mirrors. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` passed; exact source/body/resource parity passed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Every command ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | no | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | N/A: no app or browser surface. |
| Browser final proof | no | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | N/A: no runnable browser behavior changed. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: `docs/plans/templates/plate-feature.md` is a source workflow template. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: internal agent workflow only. |
| Registry-only component work changed | no | Update `docs/components/changelog.mdx` or record N/A | N/A: no registry source. |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Internal workflow sources formatted and source/mirror audited; no rendered docs route. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Risk is teaching dependency or import escapes; authoritative manifest validator and Oxlint config were read and their exact laws are now named. |
| Agent-native review for agent/tooling changes | yes | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | PASS: route, source owner, generated mirrors, plan template, and repeatable proof are present; no finding. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: install and focused checks passed without environment-rot signals. |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: diff is prose-only internal skill/workflow documentation; direct and agent-native reviews passed. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR or browser image. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped `pnpm lint:fix` found no eligible files because `.agents/**` and `docs/**` are ignored; scoped Prettier write/check passed instead. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Initial broad Oxlint search was truncated; all later reads used exact files and capped slices. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-27-teach-plate-feature-package-boundaries.md` | Final command rerun after this plan update. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | Passed; final parity command passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Generated skill contains `Package Host Law` and `Oxlint Boundary Maintenance`; template contains mandatory boundary rows. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | PASS with no finding. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | No public API/export delta; `pnpm test:manifests` and Oxlint config assertions passed. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Agent-only internal workflow doctrine; no published delta. |
| Published package changeset | no | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no published package delta. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry delta. |
| No release artifact | yes | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal agent-only workflow change. |
| Package typecheck/build/test | no | Run owning package checks or record N/A with reason | N/A: no package implementation or types changed; manifest validator passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exports or exported layout changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read named skill, source rules, manifest validator, Oxlint config, and review skills. | implementation |
| Implementation | complete | Updated source rule/resources and reusable plan template; regenerated mirrors. | verification |
| Verification | complete | Focused tests, manifest law, parity, config/template audit, formatting, and diff checks pass. | closeout |
| PR / tracker sync | complete | N/A: neither requested. | final response |
| Closeout | complete | Agent-native review passed; goal checker is the final command. | final response |

Findings:

- The package dependency law is mechanically owned by `tooling/scripts/check-workspace-package-manifests.mjs`: public `@platejs/*` packages peer on `platejs`, use `workspace:^` as the dev provider, and only `platejs` declares `plitejs` with `workspace:*`.
- `oxlint.config.ts` already owns the import law through `no-restricted-imports`; Plate Feature lacked the instruction to update exact globs and exclusions when topology changes.
- Optional peers need a real optional capability or shared-runtime reason plus `peerDependenciesMeta` and a local dev provider; normal implementation libraries remain dependencies.

Decisions and tradeoffs:

- Keep enforcement in existing manifest and Oxlint owners and teach Plate Feature to maintain them; do not add a second validator.
- Add the contract to the reusable Plate Feature plan so future package work must resolve it, while keeping the cross-layer Feature Manifest schema unchanged.

Implementation notes:

- Added package host, Plite owner, optional-peer, self-import, reverse-import, and headless/React direction law.
- Added package-boundary rows to the manifest resource and reusable plan template.
- Added focused proof routing for manifest and Oxlint coverage.

Review fixes:

- Agent-native review: accepted none; route, source ownership, mirror generation, discoverability, and proof all pass.
- Direct review tightened optional-peer syntax and removed an apparent contradiction around raw Plite proof/test exceptions.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial broad Oxlint search produced truncated output | 1 | Restrict later reads to exact owner files and line ranges | Resolved; no later broad search. |
| Scoped `pnpm lint:fix` found no eligible `.agents/**` or `docs/**` files | 1 | Use the repo formatter directly on exact Markdown sources, then run format check | Resolved; Prettier write/check passed. |
| First mirror assertion searched for text split by formatting | 1 | Assert a stable phrase and exact body/resource parity | Resolved; final parity command passed. |

Verification evidence:

- `pnpm test:manifests` -> pass.
- `node --test tooling/scripts/check-plate-feature.test.mjs` -> 12/12 pass.
- source/generated parity assertion -> pass.
- Oxlint boundary plus template discoverability assertion -> pass.
- scoped Prettier checks and targeted `git diff --check` -> pass.

Final handoff contract:

- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: direct request.
- Confidence line: High; all named proof passed.
- Flow table:
  - Reproduced: N/A: doctrine addition; browser N/A.
  - Verified: manifest/workflow/parity/config/format checks pass; browser N/A.
- Browser check: N/A: no browser surface.
- Outcome: Plate Feature teaches and records the package host and Oxlint maintenance law.
- Caveat: Ultracite intentionally ignores these internal Markdown paths; scoped Prettier is the applicable format proof.
- Design:
  - Chosen boundary: Plate Feature source rule/resources plus reusable plan template, with existing manifest/Oxlint enforcement retained.
  - Why not quick patch: editing the generated skill would be overwritten by the next install.
  - Why not broader change: existing validators already enforce the package and import law; duplicate enforcement would drift.
- Verified: all commands listed in Verification evidence pass.
- PR body verified: N/A: no PR.

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

- PR: N/A: not requested.
- Issue / tracker: N/A: direct request.
- Browser proof: N/A: no browser surface.
- Caveats: no runtime, package manifest, export, or public API change.

Timeline:

- 2026-08-27T21:54:34.957Z Task goal plan created.
- 2026-08-27 Plate Feature source rules and reusable plan template updated; generated mirrors synced with `pnpm install`.
- 2026-08-28 Manifest/workflow tests, parity, Oxlint/template audit, formatting, diff check, and agent-native review passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final goal check and handoff |
| What is the goal? | Teach Plate Feature package and Oxlint boundary maintenance with synced, tested agent sources. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:

- None known. Future topology changes still require the scoped Oxlint audit named by the new workflow.
