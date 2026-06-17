# fix media embed advisory

Objective:
Fix GHSA-qj6x-xx2h-8hvv by blocking unsafe serialized media embed iframe URLs while preserving valid provider embeds.

Goal plan:
docs/plans/2026-06-14-fix-media-embed-advisory.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: GitHub repository security advisory
- id / link: https://github.com/udecode/plate/security/advisories/GHSA-qj6x-xx2h-8hvv
- title: Media embed provider metadata can bypass URL sanitization and execute iframe JavaScript
- acceptance criteria: the advisory PoC cannot produce an embed with `javascript:` iframe `src`; valid serialized YouTube/Vimeo/Twitter metadata still resolves through `useMediaState`; `@platejs/media` gets a patch changeset.

Completion threshold:
- `useMediaState` recomputes or validates rendered embed URLs instead of trusting serialized `provider` / `sourceUrl` metadata.
- Regression coverage proves the advisory PoC returns no renderable embed.
- Valid serialized provider metadata keeps rendering through parser-owned HTTP(S) output.
- Focused media package tests pass and release artifact is recorded.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-fix-media-embed-advisory.md` passes.

Verification surface:
- `pnpm --filter @platejs/media test -- useMediaState`
- `pnpm turbo typecheck --filter=./packages/media`
- `pnpm lint:fix`
- Source audit of `packages/media/src/react/media/useMediaState.ts`, media parsers, and package export impact.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: private GHSA advisory `GHSA-qj6x-xx2h-8hvv`, fetched with `gh api repos/udecode/plate/security-advisories/GHSA-qj6x-xx2h-8hvv`.
- Allowed edit scope: `packages/media/src/react/media/useMediaState.ts`, focused media tests, `.changeset`, and this plan.
- Browser surface: N/A for the package fix; the vulnerable behavior is hook/parser-owned and covered by unit tests.
- Tracker sync: N/A unless the user asks to comment or publish the advisory.
- Non-goals: public disclosure wording, npm release execution, PR creation, broad media parser redesign.

Output budget strategy:
- Use focused `rg`/`sed` reads and cap large command output. Avoid broad generated docs/public JSON output after initial search.

Blocked condition:
- Block only if package tests cannot run due to install corruption after the required reinstall retry, or if GitHub advisory access is revoked before confirming remediation.

Task state:
- task_type: security bug fix
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready to complete

Current verdict:
- verdict: valid high-severity package bug
- confidence: high
- next owner: task
- reason: advisory PoC matches current `useMediaState` fast path and registry iframe render path.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-fix-media-embed-advisory.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `task`, `autogoal`, GitHub, and `changeset` instructions. |
| Active goal checked or created | yes | Created active goal for GHSA-qj6x-xx2h-8hvv fix. |
| Source of truth read before edits | yes | Fetched advisory with `gh api repos/udecode/plate/security-advisories/GHSA-qj6x-xx2h-8hvv`. |
| Tracker comments and attachments read | N/A | GitHub repository advisory API returned the full report and no separate comment thread was needed. |
| Video transcript evidence required | N/A | Advisory contains text PoC only. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Scoped `rg` over `docs/solutions`, `.agents/rules`, and `docs/plans`; no prior fix for this media sanitizer bug found. |
| TDD decision before behavior change or bug fix | yes | Add regression coverage for the PoC and valid serialized metadata before closeout. |
| Branch decision for code-changing task | N/A | No PR/branch requested; repo instruction says do not check git state proactively. |
| Release artifact decision | yes | Add one `.changeset` for `@platejs/media` patch behavior. |
| Browser tool decision for browser surface | N/A | Package hook/parser behavior has no required browser route; unit proof is the ownership point. |
| PR expectation decision | N/A | User asked what to do; no PR requested. |
| Tracker sync expectation decision | N/A | No advisory comment/publication requested. |
| Output budget strategy recorded | yes | Command output kept scoped and capped after the first broad search. |
| Package/API pack selected | yes | Applied package-api pack because `@platejs/media` runtime behavior changes. |
| Public surface or package boundary identified | yes | Public package runtime: `@platejs/media/react` `useMediaState`. |
| Release artifact path selected | yes | `.changeset` required for published package behavior. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/rules/changeset.mdc`. |
| Barrel/export impact decision recorded | yes | No exports or file layout change expected; `pnpm brl` N/A unless implementation changes that. |

Work Checklist:
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work updates `tooling/data/plate-ui-changelog.mdx` and generated `/registry/changelog/*` JSON instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named verification commands and source audit | `pnpm --filter @platejs/media test -- useMediaState`, `pnpm turbo typecheck --filter=./packages/media`, `pnpm lint:fix`, and source diff review passed. |
| Bug reproduced before fix | yes | Record failing test/repro or reason | Regression test added for the advisory PoC path; it asserts unsafe serialized provider metadata produces no embed. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior | `pnpm --filter @platejs/media test -- useMediaState` passed, 95 tests. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=./packages/media` passed. |
| Package exports or file layout changed | N/A | Run `pnpm brl` if exports or exported layout changed | No exports or file layout changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run install if package graph changed | No manifest or lockfile changed. |
| Agent rules or skills changed | N/A | Run sync if agent files changed | No agent rules or skills changed. |
| Workspace authority proof | yes | Run verification in owning workspace | All commands ran in `/Users/zbeyens/git/plate`, owning repo/package. |
| Browser surface changed | N/A | Capture Browser Use proof or record waiver | No route or UI fixture changed; hook/parser package behavior is covered by unit tests. |
| Browser final proof | N/A | Attach screenshot or caveat when browser proof applies | No browser proof required for this package-only sanitizer fix. |
| CI-controlled template output changed | N/A | Restore generated output or justify | No template output changed. |
| Package behavior or public API changed | yes | Add a changeset | Added `.changeset/media-embed-url-sanitization.md`. |
| Registry-only component work changed | N/A | Update registry changelog when registry-only | No `apps/www/src/registry/**` files changed. |
| Docs or content changed | N/A | Verify docs/content if changed | No user-facing docs/content changed; goal scratchpad only. |
| High-risk mini gate | yes | Record risk, proof, and boundary | Risk: custom renderers trusting serialized metadata. Boundary: `useMediaState` now derives embed state from parsed render URL. Proof: regression test plus media package tests/typecheck. |
| Agent-native review for agent/tooling changes | N/A | Load agent-native reviewer if agent/tooling changed | No agent/tooling surface changed. |
| Local install corruption suspected | N/A | Reinstall once only if failure smells like install rot | No suspicious install/runtime failure occurred. |
| Autoreview for non-trivial implementation changes | yes | Run structured review until clean | `.agents/skills/autoreview/scripts/autoreview --mode local` passed clean with no accepted/actionable findings. |
| PR create or update | N/A | Run `check` before PR work | No PR requested. |
| Task-style PR body verified | N/A | Verify PR body if PR exists | No PR created or updated. |
| PR proof image hosting | N/A | Host proof images if PR body needs them | No PR proof images needed. |
| Tracker sync-back | N/A | Post sync after PR if requested | No advisory comment requested. |
| Final handoff contract | yes | Fill final handoff fields | Final handoff fields below are filled. |
| Final lint | yes | Run lint | `pnpm lint:fix` passed, no fixes applied. |
| Output budget discipline | yes | Verify command output stayed scoped | Broad output was capped; verification commands used focused scopes. |
| Goal plan complete | yes | Run autogoal checker | Check planned after this update. |
| Public API / package boundary proof | yes | Source-audit package boundary | Runtime behavior of public `useMediaState` changed; no export/API signature changed. |
| Release artifact classification | yes | Classify artifact need | Published package runtime behavior change in `@platejs/media`; patch changeset required. |
| Published package changeset | yes | Add one package changeset and avoid forbidden minor | `.changeset/media-embed-url-sanitization.md` uses `@platejs/media: patch`; no forbidden minor. |
| Registry changelog | N/A | Update registry changelog if registry-only | Not registry-only. |
| No release artifact | N/A | Record no-artifact reason if none | Release artifact exists. |
| Package typecheck/build/test | yes | Run package checks | Media tests and scoped typecheck passed. |
| Barrel/export generation | N/A | Run `pnpm brl` if exports or file layout changed | No barrel/export impact. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Advisory and local implementation path inspected | implementation |
| Implementation | complete | Removed serialized metadata fast path in `useMediaState` | verification |
| Verification | complete | Focused media tests, typecheck, lint, and autoreview passed | closeout |
| PR / tracker sync | N/A | No PR/comment requested | final response |
| Closeout | complete | Plan evidence recorded | final response |

Findings:
- GHSA is valid: serialized `provider` / `sourceUrl` metadata could make `useMediaState` skip `parseMediaUrl` and hand an unsafe render URL to registry iframe consumers.

Decisions and tradeoffs:
- Fix the package hook owner instead of patching registry iframe callers.
- Derive embed state from the render `url`; keep serialized metadata out of render trust decisions.
- Browser proof is N/A because no route fixture changed and unit coverage directly exercises the hook behavior.

Implementation notes:
- Removed the `element.provider || element.sourceUrl` fast path from `packages/media/src/react/media/useMediaState.ts`.
- Added hook-level regression tests for unsafe serialized metadata and provider recomputation from render URL.
- Added `.changeset/media-embed-url-sanitization.md`.

Review fixes:
- Autoreview reported no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/media test -- useMediaState` passed, 95 tests.
- `pnpm turbo typecheck --filter=./packages/media` passed.
- `pnpm lint:fix` passed, no fixes applied.
- `.agents/skills/autoreview/scripts/autoreview --mode local` passed clean with no accepted/actionable findings.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: GHSA-qj6x-xx2h-8hvv fixed locally; no advisory comment requested.
- Confidence line: high.
- Flow table:
  - Reproduced: test covers advisory PoC; browser N/A.
  - Verified: media tests, typecheck, lint, and autoreview passed; browser N/A.
- Browser check: N/A, package hook sanitizer behavior has focused unit proof.
- Outcome: unsafe serialized media embed metadata no longer bypasses URL parsing.
- Caveat: release/publish and advisory publication are not performed.
- Design:
  - Chosen boundary: `useMediaState`, the shared render-state owner.
  - Why not quick patch: registry iframe callers are not the only consumers of the hook.
  - Why not broader change: parser contracts already own supported media URL validation; no API redesign needed.
- Verified: media tests, scoped typecheck, lint, autoreview.
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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: N/A, package hook unit proof used.
- Caveats: release/publish and advisory publication not performed.

Timeline:
- 2026-06-14T11:14:10.441Z Task goal plan created.
- 2026-06-14: Removed unsafe serialized metadata fast path from `useMediaState`.
- 2026-06-14: Added GHSA regression tests and `@platejs/media` patch changeset.
- 2026-06-14: `pnpm --filter @platejs/media test -- useMediaState` passed.
- 2026-06-14: `pnpm turbo typecheck --filter=./packages/media` passed.
- 2026-06-14: `pnpm lint:fix` passed.
- 2026-06-14: `.agents/skills/autoreview/scripts/autoreview --mode local` passed clean.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Fix GHSA-qj6x-xx2h-8hvv with regression coverage and focused verification |
| What have I learned? | The vulnerable path was serialized media metadata bypassing URL parsing in `useMediaState` |
| What have I done? | Removed the bypass, added tests, added changeset, and verified |

Open risks:
- Release/publish and advisory publication remain separate maintainer actions.
