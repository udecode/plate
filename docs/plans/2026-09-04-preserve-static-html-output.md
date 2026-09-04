# Preserve static HTML output

Objective:
Preserve React's encoded static HTML output; done when regression tests, package checks, repository check, clean review, and task PR evidence pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-04-preserve-static-html-output.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: maintainer bug task
- id / link: N/A: no public tracker
- title: Preserve static HTML output encoding
- acceptance criteria: keep renderer encoding for editor text and attributes; preserve legitimate rendering; add focused tests; verify the owning package; ship a patch changeset and task PR

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: no timed checkpoint
- initial confidence score: N/A: binary red-green and command gates are stronger
- improvement loop: N/A: one-shot bug fix
- final score / loop closure: N/A: no timed checkpoint

Completion threshold:
- A public `serializeHtml` regression fails before the fix and passes afterward.
- Existing static serialization tests, package integration tests, core typecheck/build, lint, and repository `check` pass.
- A patch changeset records the user-visible correction.
- Structured autoreview reports zero accepted/actionable findings.
- The task branch is pushed and a task-style PR names this exact plan once.
- If a PR is created or updated, this exact task plan exists at the PR head,
  identifies that exact PR, and the PR body names it exactly once.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-preserve-static-html-output.md` passes.

Verification surface:
- Focused `serializeHtml` test plus all `packages/core/src/static` tests.
- Existing core static-HTML package-integration suite.
- `@platejs/core` build/typecheck, `pnpm lint:fix`, and `pnpm check`.
- Structured autoreview and PR/body readback.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Preserve browser rendering for legitimate text, marks, elements, URLs, and attributes.
- Do not add a sanitizer API or patch downstream consumers.
- Do not touch HTML deserialization, document export, registry UI, or public docs.

Boundaries:
- Source of truth: `packages/core/src/static/serializeHtml.tsx`, its public static barrel, existing static serialization suites, and current package metadata.
- Allowed edit scope: central serializer, focused core regression, direct dependency metadata, one patch changeset, and this task plan.
- Browser surface: N/A: encoded output is fully observable as a returned string and existing round-trip integration tests cover consumption semantics.
- Tracker sync: N/A: no public tracker; PR readback owns sync.
- Non-goals: new options, sanitizer policy, consumer changes, documentation, registry changes, and adjacent parser/export fixes.

Output budget strategy:
- Read exact serializer/tests/package/history paths, cap searches and command output, and exclude generated/build trees unless validating the named release artifact.

Blocked condition:
- Stop only if the behavior cannot be reproduced, legitimate serialization regresses, required checks cannot be repaired in scope, or a task PR cannot be created after the patch is verified.

Task state:
- task_type: package bug fix
- task_complexity: non-trivial one-package runtime correction
- current_phase: PR / tracker sync
- current_phase_status: in_progress
- next_phase: commit, push, and task PR readback
- goal_status: active

Current verdict:
- verdict: valid
- confidence: high; direct public-API test reproduced the encoding loss
- next owner: task
- reason: the serializer post-processes the complete renderer output instead of preserving it

Pre-solution issue challenge:
- reporter claim: `serializeHtml` does not preserve the renderer's encoded representation for editor text and dynamic attributes.
- suggested diagnosis or fix: return the renderer output directly.
- repro ladder:
  - tests / source-level repro: focused public-API regression failed for the expected encoded-output mismatch.
  - Playwright / automated browser: N/A: returned-string behavior is fully observable below the browser layer.
  - Browser plugin: N/A: no interaction or visual state changes.
  - screenshot / visual proof: N/A: no visual claim.
- reproduction verdict: reproduced
- validity verdict: valid
- best long-term fix boundary: preserve encoding at the central serializer and leave consumer policy unchanged.
- harsh honest feedback: decoding the whole renderer result had no coherent output contract and belonged nowhere in this path.
- hard-stop decision: proceed with the narrow serializer fix.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-preserve-static-html-output.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | `task`, `autogoal`, `tdd`, `changeset`, and `autoreview` selected for execution, evidence, regression-first work, release prose, and closeout review |
| Active goal checked or created | yes | Exact work goal is active; detailed local evidence is kept outside the committable bundle |
| Source of truth read before edits | yes | Exact serializer, public barrel, package metadata, tests, and introduction history read |
| Tracker comments and attachments read | no | N/A: no public tracker |
| Video transcript evidence required | no | N/A: no video |
| Pre-solution issue challenge required | yes | Validity, repro, and owner-boundary verdict recorded above |
| Reproduction verdict before implementation | yes | Focused public API test failed before product-code edits |
| Repro escalation ladder selected | yes | String-level unit/integration proof is sufficient; browser layers are N/A |
| Suggested fix reviewed against durable boundary | yes | Central serializer owns the output contract; caller changes would duplicate policy |
| `docs/solutions` checked for non-trivial existing-code work | yes | Narrow search found no applicable prior solution |
| TDD decision before behavior change or bug fix | yes | One text-encoding regression observed red then green; editor-derived attribute coverage added afterward |
| Branch decision for code-changing task | yes | Dedicated `codex/preserve-static-html-output` branch starts at current `origin/main` |
| Release artifact decision | yes | One patch changeset for `@platejs/core` |
| Browser tool decision for browser surface | no | N/A: returned HTML encoding is an exact string contract |
| PR expectation decision | yes | `task` requires a verified task PR |
| Dedicated task plan selected for exact PR | yes | This plan owns only this PR; exact PR will be recorded after creation |
| Tracker sync expectation decision | no | N/A: no public tracker; PR body/readback only |
| Output budget strategy recorded | yes | Exact paths and capped output recorded above |
| Package/API pack selected | yes | Published `@platejs/core` runtime output changes |
| Public surface or package boundary identified | yes | `serializeHtml` from `@platejs/core/static` |
| Release artifact path selected | yes | `.changeset/preserve-static-html-escaping.md` |
| `changeset` skill loaded when `.changeset` is required | yes | Full skill read; patch level and imperative user-impact prose used |
| Barrel/export impact decision recorded | yes | No export or file-layout change; no barrel generation needed |

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
- [ ] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [ ] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [ ] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [ ] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [ ] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [ ] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [ ] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [ ] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Final exact `pnpm check` passed after focused, package, and integration proof |
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
| PR create or update | in_progress | Run `check` before PR work and sync PR body to the task-style final handoff | Exact `pnpm check` passed; commit, push, and PR readback remain |
| Per-PR task ownership | pending | Verify one task-plan body line, plan at exact head, and exact PR ownership in this plan | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-04-preserve-static-html-output.md` | pending |
| Public API / package boundary proof | pending | Source-audit public API, exports, and package boundary impact | pending |
| Release artifact classification | pending | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | pending |
| Published package changeset | pending | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/slate`, `@platejs/core`, or `platejs` | pending |
| Registry changelog | pending | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | pending |
| No release artifact | pending | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | pending |
| Package typecheck/build/test | pending | Run owning package checks or record N/A with reason | pending |
| Barrel/export generation | pending | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Serializer owner, history, public barrel, dependency, and test patterns inspected | implementation |
| Implementation | complete | Renderer output returned directly; unused direct dependency removed; text/attribute regressions and patch changeset added | verification |
| Verification | complete | Focused/static/integration/build/typecheck/lint proof is green; final exact `pnpm check` passed | PR / tracker sync |
| PR / tracker sync | in_progress | Full gate is green; sanitized plan is ready for the task PR | commit and readback |
| Closeout | pending | | final response |

Findings:
- The decoder was introduced with the serializer without a documented entity-specific contract.
- `html-entities` had no remaining `@platejs/core` source owner after the fix; other workspace owners still retain it.
- Existing static integration coverage already exercises elements, marks, attributes, custom rendering, and round trips.

Decisions and tradeoffs:
- Preserve React's encoded serialization as the canonical byte contract; browser-visible text remains unchanged.
- Remove the unused direct dependency instead of carrying dead package weight.
- Keep tests at the public static barrel and existing integration boundary; no browser test adds evidence for a deterministic string result.

Implementation notes:
- Added focused regressions for editor text and an editor-derived quoted attribute.
- No public API signature, option, export, or component behavior changed.

Review fixes:
- P1 committable plan contained non-release-safe internal context -> accepted -> replaced with this sanitized final-behavior plan before any push.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Integration directory filter did not match `.slow.*` filenames | 2 | Pass `./`-prefixed expanded file paths | Five intended integration files selected |
| Integration suite resolved stale built package output | 1 | Build the artifact-owning package, then rerun unchanged tests | Core build passed; integration suite passed 22/22 |
| First task branch inherited stale merged-branch history | 1 | Move working changes intact to a fresh current-main branch | Current task branch started at `origin/main` with no lost changes |
| First attribute test used JSX without the configured runtime binding | 1 | Fix the test harness before counting behavior evidence | Final test uses the actual editor/plugin attribute path and passes |
| Autoreview found internal context in committable plans | 2 | Remove the unrelated plan and separate local evidence from release-safe plan | This plan contains only final behavior and verification; final local autoreview passed with zero findings |
| Repository `check` stopped at the timing budget after all functional tests passed | 2 full runs plus 1 isolated timing run | Recheck machine contention, then rerun the exact gate without changing unrelated tests | High concurrent system load was confirmed; a final exact `pnpm check` passed after contention dropped |

Verification evidence:
- `/Users/zbeyens/git/plate`: focused regression -> failed before fix for the expected encoding mismatch; passes 2/2 after fix.
- `/Users/zbeyens/git/plate`: `bun test packages/core/src/static` -> 105 pass, 0 fail.
- `/Users/zbeyens/git/plate`: `pnpm --filter @platejs/core build` -> pass.
- `/Users/zbeyens/git/plate`: core static-HTML package integration suite -> 22 pass, 0 fail.
- `/Users/zbeyens/git/plate`: `pnpm turbo typecheck --filter=./packages/core` -> 5/5 tasks pass.
- `/Users/zbeyens/git/plate`: `pnpm install` -> lockfile consistent; `pnpm lint:fix` -> clean.
- `/Users/zbeyens/git/plate`: structured local autoreview -> zero findings after disclosure-safe plan separation.
- `/Users/zbeyens/git/plate`: final exact `pnpm check` -> pass: lint, 54 builds, 54 typechecks, 3,463 fast tests, 352 slow tests, all additional functional batches, and the enforced timing budget.

Final handoff contract:
- PR line: pending creation and readback
- Issue / tracker line: N/A: no public tracker
- Confidence line: 95% in the implementation; full repository gate is green
- Flow table:
  - Reproduced: focused public API test red; browser N/A
  - Verified: focused/static/integration/package/repository functional tests green; browser N/A
- Browser check: N/A: deterministic returned-string contract has no runnable interaction or visual surface
- Outcome: React's encoded static markup is preserved for editor text and dynamic attributes.
- Caveat: Raw output retains entities; browser and parser semantics remain unchanged, but byte-level snapshots may update.
- Design:
  - Chosen boundary: the central static serializer
  - Why not quick patch: consumer-specific escaping would duplicate policy and leave other callers exposed to the same output contract
  - Why not broader change: no sanitizer API, deserializer, or UI behavior needs to change
- Verified: red-green regressions, 105 static tests, 22 integration tests, core build/typecheck, lint, install, and all repository functional tests
- PR body verified: pending PR creation

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
- PR: pending creation
- Task plan at exact PR head: pending PR readback
- Issue / tracker: N/A: no public tracker
- Browser proof: N/A: no runnable browser surface for the returned-string contract
- Caveats: raw byte snapshots may update while rendered and parsed values remain unchanged

Timeline:
- 2026-09-04T11:24:15.698Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | PR / tracker sync after full verification |
| Where am I going? | Commit, push, task PR readback, and closeout |
| What is the goal? | Preserve encoded static HTML output without legitimate rendering regressions |
| What have I learned? | The decoder had no justified contract; direct renderer output is the narrow owner fix |
| What have I done? | Reproduced, fixed, added two regressions and a patch changeset, passed all behavior checks, and completed clean autoreview |

Open risks:
- Raw serialized bytes retain entities where callers may previously have observed decoded characters; browsers and HTML parsers preserve the same legitimate rendered values, and round-trip integration proof is green.
