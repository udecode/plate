# Re-enable narrow React lint rules

Objective:
Re-enable four over-broad React lint rules; done when targeted diagnostics, policy, lint idempotence, focused checks, and browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-24-re-enable-narrow-react-lint-rules.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request following a source-backed Oxlint audit
- id / link: current Codex task; no external tracker
- title: Re-enable every React rule identified as too broadly disabled
- acceptance criteria: remove the four global offs; fix seven safe module-scope findings; retain only concrete production exceptions; preserve behavior; pass policy, lint idempotence, focused type/tests, browser smoke, and final root check

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no duration requested
- semantics: N/A
- initial confidence score: N/A: binary pass/fail gates exist
- improvement loop: repair each failing named rule without widening suppression
- final score / loop closure: N/A

Completion threshold:
- `react/prefer-function-component`, `react-doctor/prefer-module-scope-pure-function`, `react-doctor/effect-needs-cleanup`, and `react-doctor/zod-v4-no-deprecated-schema-apis` are no longer globally off.
- All four rules report zero unsuppressed diagnostics; only evidence-backed production inline exceptions remain, with no test directives or exact-file config overrides.
- `ultracite fix` and `ultracite check` pass twice, the strict config-policy audit passes, affected type/tests pass, browser smoke passes, P1 autoreview has no accepted finding, and the root check passes or any unrelated blocker is reported exactly.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-re-enable-narrow-react-lint-rules.md` passes.

Verification surface:
- Forced-rule Oxlint audit for the four rules and source audit of remaining directives.
- `pnpm lint:fix`, `pnpm lint`, repeated for idempotence; `pnpm lint:type-aware`; strict config-policy checker.
- Source-first typechecks and focused tests for changed packages/app, then `pnpm check`.
- Browser smoke at `/docs/examples/plate-to-html`, including console/network inspection.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Preserve unrelated checkout changes and do not commit or push.
- No test-local directives, file-level disables, exact-file config overrides, fake callbacks, wrappers, `void` laundering, unsafe casts, memoization changes, concurrency changes, or architecture rewrites solely for lint.
- Keep the structural `packages/plite-react/test/render-probes/**` `react/immutability` override.

Boundaries:
- Source of truth: `oxlint.config.ts`, installed Ultracite/Oxlint/React Doctor rule semantics, and the forced diagnostics recorded in the preceding audit.
- Allowed edit scope: `oxlint.config.ts`; the exact production findings for the four rules; this goal plan; formatter-owned nearby formatting only.
- Browser surface: `apps/www` route `/docs/examples/plate-to-html`.
- Browser strategy: Browser smoke for normal route rendering and console/network state. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no issue or PR requested.
- Non-goals: no package API, runtime behavior, dependency-version, build-integration, release, commit, push, or PR changes.

Output budget strategy:
- Use exact files and four rule IDs; summarize diagnostics by rule; cap command output; exclude generated, donor, build, and dependency trees.

Blocked condition:
- Stop only if the same in-scope rule cannot be satisfied without semantic behavior change or if final proof is repeatedly invalidated by an external writer after three confirmed attempts.

Task state:
- task_type: lint policy and behavior-preserving source cleanup
- task_complexity: normal
- current_phase: verification
- current_phase_status: in_progress
- next_phase: closeout
- goal_status: active

Current verdict:
- verdict: four global offs should be removed; exceptions belong inline only where the rule cannot see real teardown or a version/lifecycle invariant
- confidence: high for lint/source correctness; final Browser/root proof remains blocked by unrelated `www` registry and typed-route failures
- next owner: task
- reason: four-rule packet is frozen and every lint/package/review gate is green; waiting for the independent CI owner to restore the runnable `www` route and root gate

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-re-enable-narrow-react-lint-rules.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Four-rule scope, suppression rules, preservation constraints, and verification gates are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Skill analysis before edits | yes | Used `autogoal` for measurable closure and `oxlint` for rule/suppression policy; Browser and autoreview skills are deferred to their owning gates. |
| Active goal checked or created | yes | No prior goal; active goal created for this exact plan. |
| Source of truth read before edits | yes | Read current `oxlint.config.ts`, installed rule policy, forced diagnostics, and every current finding owner. |
| Tracker comments and attachments read | no | N/A: direct local task with no tracker. |
| Video transcript evidence required | no | N/A: no video report. |
| `docs/solutions` checked for non-trivial existing-code work | yes | No Oxlint/React lint solution entry matched. |
| TDD decision before behavior change or bug fix | no | N/A: no intended behavior change; existing lint/type/tests prove source-preserving cleanup. |
| Branch decision for code-changing task | yes | Use current checkout as-is; no branch creation, commit, or push requested. |
| Release artifact decision | no | N/A: lint policy and behavior-preserving internal source cleanup require no changeset or registry changelog. |
| Browser tool decision for browser surface | yes | Use in-app Browser because this is ordinary app route QA. |
| PR expectation decision | no | N/A: no PR requested. |
| Tracker sync expectation decision | no | N/A: no tracker. |
| Output budget strategy recorded | yes | Exact files/rules, capped outputs, generated/dependency trees excluded. |
| Browser pack selected | yes | Browser pack materialized in this plan. |
| Browser route / app surface identified | yes | `/docs/examples/plate-to-html` in `apps/www`. |
| Browser tool decision recorded | yes | In-app Browser; Chrome/Computer are unnecessary because no native browser/OS contract changes. |
| Console/network caveat policy recorded | yes | Record console/network errors from the final fresh route, distinguishing pre-existing external-resource failures. |
| Observable browser case captured | no | N/A: behavior-neutral lint cleanup, not a report-backed behavior fix. |

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
- [x] N/A: no video evidence. Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
- [x] Nearby repo instructions, Oxlint policy, config, and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason.
- [x] Release artifact requirement recorded: N/A because no package/public behavior changes.
      N/A with reason.
- [x] Final handoff shape decided: local lint-policy implementation with exact rule, exception, and verification results; no PR/tracker.
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded: current checkout as-is; no branch mutation requested.
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded: one reinstall only for recognized install-rot signals; otherwise debug the owning failure.
      reinstall/rerun evidence or N/A with reason.
- [x] Workspace authority recorded: all commands run in `/Users/zbeyens/git/plate-2`; Browser targets its `apps/www` server.
      owns the changed behavior.
- [x] N/A: no public API/runtime/package/browser/agent-action/command contract change intended. High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason.
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] N/A: no agent-native files. Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded: exact rule/file probes and capped output only.
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: load `/docs/examples/plate-to-html`; expect the example page to render without app console errors.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope. The docs wrapper had no Browser warnings/errors; the direct preview returned 500 from unrelated absent registry sources.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] N/A: no report-backed behavior case. Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [ ] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] N/A: local uncommitted lint candidate, not a shipped/fixed behavior claim. Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] N/A: no native interaction contract changed. Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass, or unshipped behavior scaffolding will be used.
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | pending | Run the command, proof, source audit, or artifact check named in this plan | pending |
| Bug reproduced before fix | pending | Record failing test/repro or N/A with reason | pending |
| Targeted behavior verification | pending | Run focused test/proof for changed behavior or record N/A | pending |
| TypeScript or typed config changed | pending | Run relevant typecheck | pending |
| Package exports or file layout changed | pending | Run `pnpm brl` before final verification and keep generated barrel updates | pending |
| Package manifests, lockfile, or install graph changed | pending | Run `pnpm install` and relevant package checks | pending |
| Agent rules or skills changed | pending | Run `pnpm install` and verify generated skill sync | pending |
| Workspace authority proof | pending | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | pending |
| Browser surface changed | pending | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | pending |
| Browser final proof | pending | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | pending |
| CI-controlled template output changed | pending | Restore generated template output or record why it is intentionally kept | pending |
| Package behavior or public API changed | pending | Add a changeset or record why no changeset applies | pending |
| Registry-only component work changed | pending | Update `docs/components/changelog.mdx` or record N/A | pending |
| Docs or content changed | pending | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | pending |
| High-risk mini gate | pending | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | pending |
| Agent-native review for agent/tooling changes | pending | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | pending |
| Local install corruption suspected | pending | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | pending |
| P1 autoreview for non-trivial implementation changes | pending | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | pending |
| PR create or update | pending | Run `check` before PR work and sync PR body to the task-style final handoff | pending |
| Task-style PR body verified | pending | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | pending |
| PR proof image hosting | pending | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | pending |
| Tracker sync-back | pending | Post concise issue/Linear sync after PR exists, or record N/A/blocker | pending |
| Final handoff contract | pending | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | pending |
| Final lint | pending | Run `pnpm lint:fix` or scoped equivalent | pending |
| Output budget discipline | pending | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | pending |
| Timed checkpoint | pending | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | pending |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-24-re-enable-narrow-react-lint-rules.md` | pending |
| Browser interaction proof | pending | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | pending |
| Browser console/network check | pending | Record console/network state or why it is not applicable | pending |
| Browser final proof artifact | pending | Record screenshot/trace/route/native proof or exact caveat | pending |
| Exact case replay | pending | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | pending |
| Final ref and fingerprints | pending | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | pending |
| Clean final runtime | pending | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | pending |
| Retry-free stability | pending | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | pending |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | audited all 17 forced findings and their owners | implementation |
| Implementation | completed | removed four global offs; applied seven hoists, one Zod 4 repair, and nine narrow production exceptions | verification |
| Verification | in_progress | lint, typed lint, policy, package checks, tests, and P1 review green; Browser/root blocked by unrelated `www` state | wait for CI owner, then replay Browser/root |
| PR / tracker sync | N/A | no PR/tracker mutation requested by this task; CI owner separately owns PR #5036 | final response |
| Closeout | pending | | final response |

Findings:
- The four global offs were over-broad. Every current finding is either safely repairable or backed by a concrete production lifecycle, teardown, or dependency-version invariant.
- `www` typecheck is independently red on seven Next typed-route errors outside this packet.
- `/docs/examples/plate-to-html` renders its wrapper without Browser console warnings/errors, but `/view/plate-to-html` returns 500 because generated `apps/www/src/__registry__/index.tsx` imports many absent registry source files.

Decisions and tradeoffs:
- Re-enable all four preset-owned rules without duplicating explicit `error` entries in project config.
- Keep exactly nine `oxlint-disable-next-line` exceptions in production: one class-only commit lifecycle, five real teardown owners the heuristic cannot follow, and three Zod 3.25 contracts in the published `depset` package.
- Do not fix unrelated typed routes or regenerate/restore absent registry source from a lint task; the active CI owner owns those failures.

Implementation notes:
- Hoisted seven pure helpers from component/hook bodies to module scope without changing captures, allocation semantics, or public API.
- Migrated the root-Zod-4 event schema to the two-argument `z.record(key, value)` signature.
- Removed the four global off entries and their stale rationales from `oxlint.config.ts`.

Review fixes:
- P1 Autoreview accepted no findings; result: clean, confidence 0.93.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Initial Zod/cleanup suppressions targeted allocation-chain lines instead of every diagnostic owner | 1 | Move each directive to the exact owning effect/schema node and rerun normal plus typed lint | Resolved; both modes and unused-directive enforcement pass |
| Concurrent CI task rewrote the same directives during typed lint | 1 | Coordinate an explicit ownership freeze before rerunning | Resolved; CI owner stopped this packet and final bytes are frozen |
| Direct Browser preview timed out on the first stale dev process | 1 | Restart only the owned `www` process with captured output | Diagnosed: deterministic 500 from absent generated-registry source imports |

Verification evidence:
- `pnpm lint:fix && pnpm lint`: green after final freeze; formatter 4,221 files, Oxlint clean.
- Second earlier `pnpm lint:fix && pnpm lint`: green, proving idempotence after directive repair.
- `pnpm lint:type-aware`: green; 60 package builds and repository-wide type-aware Oxlint.
- Strict config policy: exit 0; unused disables are errors, no invalid inline/test/file-level directives, no redundant preset-owned enabled rules.
- Affected source-first typechecks: `@platejs/plite-react`, `@platejs/selection`, `@udecode/react-utils`, and `depset` green; `www` reached TypeScript and failed only in seven unrelated typed-route files.
- Focused tests: Plite React 1,092/1,092; Selection 98/98; React Utils 26/26; depset 12/12.
- P1 Autoreview: clean, no accepted/actionable findings, confidence 0.93.
- Browser: docs wrapper rendered with no warning/error logs; direct preview blocked by generated-registry imports of absent files, so final Browser proof is not yet green.

Final handoff contract:
- PR line: pending
- Issue / tracker line: pending
- Confidence line: high for the frozen lint packet; root/browser closure pending unrelated CI repair
- Flow table:
  - Reproduced: tests pending, browser pending
  - Verified: tests pending, browser pending
- Browser check: blocked by unrelated generated-registry missing imports; replay required after CI repair
- Outcome: four rules re-enabled with zero unsuppressed diagnostics and no global replacement offs
- Caveat: pending
- Design:
  - Chosen boundary: semantic source repair for valid findings; exact production inline invariant for heuristic/version/lifecycle false positives
  - Why not quick patch: global or pattern disables would hide valid production findings
  - Why not broader change: registry and typed-route failures are independent owners, not lint fixes
- Verified: lint, typed lint, policy, package typechecks/tests, and P1 review green; Browser/root pending
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
- 2026-08-24T11:17:42.271Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verification with the four-rule source packet frozen |
| Where am I going? | Replay Browser and root check after the CI owner restores unrelated `www` state, then closeout |
| What is the goal? | Re-enable four over-broad React lint rules with zero unsuppressed diagnostics and complete policy/lint/type/test/browser proof |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- An unrelated task may mutate shared checkout inputs; final Browser/root evidence must be replayed after its explicit stability signal.
- Generated registry imports and Next typed routes currently prevent a green `www`/root proof.
