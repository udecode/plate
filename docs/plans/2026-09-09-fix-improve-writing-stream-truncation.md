# Fix Improve Writing stream truncation

Objective:
Repair Improve Writing streaming so all chunks appear and Accept preserves the complete text. Local patch only; verify the recorded Chrome case and package regressions.

Goal plan:
docs/plans/2026-09-09-fix-improve-writing-stream-truncation.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: user report
- id / link: current conversation and tmp/walkthrough/improve-writing/improve-writing-recording.mp4
- title: Improve Writing retains only the first word
- acceptance criteria: complete streamed suggestion and complete accepted text

First checkpoint:
- [x] Fix the recorded Improve Writing truncation on current next branch.
- [x] Preserve local AI route and secret configuration; never print the key.
- [x] Verify complete streaming and Accept in Chrome; report tests and limitations.
- [x] No new request to commit, push, create PR, or change public API.
- [x] No time budget or additional deliverable requested; preserve the existing failure video.
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: N/A; one-shot repair
- initial confidence score: concrete reproduction used instead of a score
- improvement loop: red regression, owner repair, complete package and browser proof
- final score / loop closure: local acceptance criteria satisfied

Completion threshold:
- A multi-chunk regression fails before the fix and passes afterward; focused AI tests and package typecheck/lint pass; Chrome shows and accepts full output.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-09-fix-improve-writing-stream-truncation.md` passes.

Verification surface:
- AIChatPlugin.suggestions.spec.ts, focused AI tests, platejs source typecheck, scoped lint, Chrome /view/editor-ai and screenshots.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: recorded Chrome failure at 6d8108b91f and current AIChatPlugin implementation.
- Allowed edit scope: AIChatPlugin, focused tests, plan, applicable changeset.
- Browser surface: http://localhost:3000/view/editor-ai.
- Browser strategy: exact Chrome (the recorded failing surface). Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; local report.
- Non-goals: public API redesign, mock transport changes, key management, shipping.

Output budget strategy:
- Read bounded AI owner files; cap outputs and save verification logs under tmp/walkthrough/improve-writing.

Blocked condition:
- Record any unavailable exact Chrome replay or failing mandatory package proof; never upgrade a proxy test into final proof.

Task state:
- task_type: local bug repair
- task_complexity: bounded package runtime correction
- current_phase: closeout
- current_phase_status: complete
- next_phase: user handoff
- goal_status: complete (local scope)

Current verdict:
- verdict: local candidate verified
- confidence: high for the recorded case; no release claim
- next owner: user
- reason: deterministic regressions and real-model Chrome replay pass

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-09-fix-improve-writing-stream-truncation.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records every explicit request and boundary. |
| Timed checkpoint parsed | N/A | N/A: no duration requested. |
| Skill analysis before edits | yes | patch and autogoal read; Chrome skill for recorded surface. |
| Active goal checked or created | N/A | N/A: no explicit durable goal request; plan only. |
| Source of truth read before edits | yes | AIChatPlugin applySuggestions and source fixture read. |
| Tracker comments and attachments read | N/A | N/A: local conversational report, no external tracker. |
| Video transcript evidence required | N/A | N/A: agent directly observed and recorded the failure and DOM. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read existing localized rollback solution; preserve adjacent nodes. |
| TDD decision before behavior change or bug fix | yes | Three behavior regressions; truncation and undo tests failed before respective fixes. |
| Branch decision for code-changing task | yes | Stay on next as user requested; local candidate only. |
| Release artifact decision | yes | .changeset/fix-ai-streamed-edits.md for platejs package behavior. |
| Browser tool decision for browser surface | yes | Exact Chrome replay of the recorded failure; Browser explored earlier. |
| PR expectation decision | N/A | N/A: current request does not ask for a PR or shipping. |
| Tracker sync expectation decision | N/A | N/A: local report without tracker. |
| Output budget strategy recorded | yes | Scoped owner reads; tests/typecheck logs saved to artifacts. |
| Browser pack selected | yes | browser pack applied at creation. |
| Browser route / app surface identified | yes | http://localhost:3000/view/editor-ai. |
| Browser tool decision recorded | yes | Chrome macOS for exact recorded surface. |
| Console/network caveat policy recorded | yes | Server browser logs inspected and AI POST 200; no all-console-clear claim. |
| Observable browser case captured | yes | improve-writing:single-block-stream; original heading, Improve writing, wait, Accept; original result This. |

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
- [x] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | 87 AI tests, platejs typecheck, scoped formatting, real Chrome Accept all pass. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Test expected full sentence but received This; existing failure video records same symptom. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | 87 pass, 0 fail, 171 expectations across 10 AI files. |
| TypeScript or typed config changed | yes | Run relevant typecheck | platejs source typecheck: 76 tasks successful. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exported files moved or exports changed. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | N/A: no dependency changes in this repair. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | N/A: no rules or skills changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All package commands run in /Users/udecode/Desktop/repos/plate; www serves actual source. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Chrome source-connected /view/editor-ai, full streamed correction and Accept captured. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | tmp/walkthrough/improve-writing-fixed/accepted.png and improve-writing-fixed.mp4. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | N/A: templates untouched. |
| Package behavior or public API changed | yes | Add a changeset or record why no changeset applies | platejs patch changeset added; public API unchanged. |
| Registry-only component work changed | N/A | Update `docs/components/changelog.mdx` or record N/A | N/A: registry source unchanged, no registry output required. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: only internal plan and changeset; no public docs page changed. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Track live preview keys, retain deleted-target guard, merge only stream history; acceptance/undo/adjacent-node/deletion tests. |
| Agent-native review for agent/tooling changes | N/A | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent tooling changed. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no unexpected install failure during repair. |
| P1 autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: latest user AGENTS explicitly prohibits autoreview on next. Manual diff reviewed. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Local fix, root cause, 87 tests/typecheck, recorded real-model result, uncommitted status. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | Scoped ultracite fix passed on owner and tests; git diff whitespace check passes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Focused reads, capped outputs, saved logs. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no requested duration. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-09-fix-improve-writing-stream-truncation.md` | Completion checker run after evidence recorded; result saved with artifacts. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Exact heading selected through visible Ask AI menu, Improve writing, generation, Accept. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | POST /api/ai/command 200 in final server log; no server error shown. Full browser-console audit outside this text correctness claim. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | 47.2-second screenshot-timed recording and final accepted.png. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Original This sentence are badly write becomes complete This sentence is badly written after Accept. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | 6d8108b91f plus local owner/tests diff; plate-ai-final-fingerprints.txt records SHA-256 runtime/test files. |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A for pushed proof: local uncommitted candidate, fresh dev process and fresh Chrome tab; ignored real route and env remain required. |
| Retry-free stability | N/A | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | N/A: streaming text correctness, not native paint/focus/DnD lifecycle. AI regression suite plus exact Chrome replay. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | recorded failure and owner read | complete |
| Implementation | complete | live preview keys and stream history | complete |
| Verification | complete | AI tests, typecheck, lint, Chrome recording | complete |
| PR / tracker sync | N/A | no PR or tracker requested | complete |
| Closeout | complete | local handoff and video prepared | final response |

Findings:
- case_id: improve-writing:single-block-stream. Chrome macOS at 6d8108b91f. Select heading "This sentence are badly write", open Mod+J, choose Improve writing, wait, Accept. Actual heading is "This"; expected complete corrected sentence.
- Network provider returns complete streamed text; browser recorded first-word-only result.
- Confirmed root cause: single-block fragment replacement invalidates the original source node key and later chunks silently return.
- Local runtime includes ignored route wrapper and .env.local. This is local proof, not a pushed/release claim.
- Skills: patch owns repair; autogoal owns plan; autoreview is prohibited on next by user instructions. No goal tool creation: user requested repair, not a durable goal.
- No public API shape change is planned. No agent/native tooling edit.
- Video transcript N/A: same agent recorded and directly observed every step and DOM result.
- Risk: source-node identity must not be bypassed for genuine deletion; test both continuation and deletion.
- Flow mode: one-shot execution.
- Timed checkpoint N/A: no duration requested.

Decisions and tradeoffs:
- Reuse existing _replaceNodeKeys, already owned by this plugin; do not add another identity store or remove the stale-target guard.
- Merge subsequent stream updates into the first AI batch so Discard restores the original value.
- Public API, registry and model transport remain unchanged.

Implementation notes:
- AIChatPlugin tracks the committed preview block keys after each single-block update.
- Added complete streaming acceptance, whole-stream undo with adjacent-node preservation, and deleted-preview tests.

Review fixes:
- Manual owner diff review complete. Autoreview prohibited on next by user instructions.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Expected red truncation and undo regressions | 2 | fix owning identity/history paths | green |
| Browser selection setup did not initially open edit actions | 1 | verify native selection and use visible Ask AI | correct Improve writing menu observed |

Verification evidence:
- Working directory: /Users/udecode/Desktop/repos/plate.
- ./node_modules/.bin/bun test packages/platejs/src/ai: 87 pass, 0 fail; artifact plate-ai-tests.log.
- npx --yes pnpm@9.15.0 turbo typecheck --filter=./packages/platejs: 76 successful tasks; plate-ai-typecheck-final.log.
- Scoped ultracite fix of AIChatPlugin.ts and AIChatPlugin.suggestions.spec.ts passed; plate-ai-lint.log.
- Fresh www process and fresh Chrome tab after final code changes; POST /api/ai/command returned 200.
- Exact source heading selected via Ask AI -> Improve writing -> wait -> Accept. Final heading: This sentence is badly written.
- Artifacts: tmp/walkthrough/improve-writing-fixed/{accepted.png,improve-writing-fixed.mp4,timestamps.json,plate-ai-final-fingerprints.txt}.
- Paint classifier and five warm runs N/A: no selection-paint/compositor/focus lifecycle claim. Selection was setup, text truncation is the repaired invariant.
- Pushed/clean release proof N/A: this is an uncommitted local patch with user-authorized ignored AI route and env, no mock transport.
- Browser after Accept scrolled lower; manually scrolled to show final heading. This repair makes no scroll-position claim.
- Full browser console sweep outside scope; inspected server/browser forwarding logs and actual successful AI response.

Final handoff contract:
- PR line: N/A; no PR requested
- Issue / tracker line: N/A; local user report
- Confidence line: high for the recorded local flow
- Flow table:
  - Reproduced: red truncation test and existing Chrome failure recording
  - Verified: 87 tests pass, final real-model Chrome recording passes
- Browser check: exact Chrome case, full result after Accept
- Outcome: complete single-block streamed edits retained
- Caveat: local uncommitted patch; no deployment claim
- Design:
  - Chosen boundary: AIChatPlugin preview identity and history ownership
  - Why not quick patch: skipping target validation would mutate unrelated content after deletion
  - Why not broader change: existing replacement-key state supports the required lifetime
- Verified: acceptance, discard, adjacent blocks, deleted target, package types and real Chrome
- PR body verified: N/A; no PR

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
- PR: N/A; no PR requested
- Issue / tracker: N/A; local report
- Browser proof: tmp/walkthrough/improve-writing-fixed/improve-writing-fixed.mp4
- Caveats: uncommitted local next patch, local route/env required

Timeline:
- 2026-09-09T09:37:19.926Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Local repair verified, ready for handoff |
| Where am I going? | User handoff; no shipping authorized |
| What is the goal? | Complete Improve Writing streaming and accepted text |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Model wording can vary; exact local result verified. No pushed ref or release proof. Scroll behavior after Accept is outside this truncation repair.

- Final replay complete: recorded source sentence corrected fully and accepted; package/runtime inputs unchanged afterward.

Shipping follow-up:
- User explicitly requested push after local repair verification.
- Refreshed origin/next: current next is one commit ahead and zero behind before the repair commit.
- Production/test fingerprints match the verified candidate; whitespace check passes.
- Commit and push the repair, tests, changeset, and plan on next. This also publishes the previously authorized Tailscale origin commit.
- Local AI route and secret environment remain ignored. Earlier local browser proof is not upgraded to clean deployment proof.
