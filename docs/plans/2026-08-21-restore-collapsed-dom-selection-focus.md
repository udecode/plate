# Restore collapsed DOM selection focus

Objective:
Restore collapsed-caret DOM focus behavior; done when helper coverage and the exact Chromium refocus row pass; plan docs/plans/2026-08-21-restore-collapsed-dom-selection-focus.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-21-restore-collapsed-dom-selection-focus.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: delegated strict-Chromium regression report
- id / link: `plite-dom:collapsed-selection-refocus`
- title: Restore collapsed DOM selection focus
- acceptance criteria: `replaceDOMSelectionRange` calls `setBaseAndExtent` for collapsed and expanded ranges; helper coverage asserts the collapsed endpoints; focused unit coverage and the exact Chromium refocus row pass; then the owned DOM bytes freeze.

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
- initial confidence score: N/A: binary focused unit and Chromium gates
- improvement loop: N/A: one narrow regression repair
- final score / loop closure: N/A: command evidence decides closure

Completion threshold:
- Collapsed and expanded DOM ranges both execute the focus-preserving `setBaseAndExtent` operation with the computed direction endpoints.
- Focused `dom-coverage.ts` passes, including an explicit collapsed helper case.
- The exact Chromium row `does not scroll to top when refocusing a scrollable editor` passes on the final owned bytes.
- Exact-file Ultracite passes and no owned DOM file changes after browser proof.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-restore-collapsed-dom-selection-focus.md` passes.

Verification surface:
- `pnpm --filter @platejs/plite-dom test ./test/dom-coverage.ts`
- `PLITE_PROOF_FORCE_BUILD=1 PLITE_BROWSER_FORCE_PROOF=1 pnpm --filter plite test:plite-browser:chromium richtext.test.ts --grep "does not scroll to top when refocusing a scrollable editor"`
- `pnpm exec ultracite check packages/plite-dom/src/utils/dom.ts packages/plite-dom/test/dom-coverage.ts`.
- SHA-256 fingerprints after the final proof.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: live `packages/plite-dom` helper and coverage plus the exact `apps/plite` Chromium regression row.
- Final owned edit scope: `packages/plite-dom/src/utils/dom.ts` and `packages/plite-dom/test/dom-coverage.ts`. The temporary `packages/plite-react/src/editable/selection-controller.ts` baseline diagnostic was fully reverted.
- Browser surface: `apps/plite` rich-text refocus row in Chromium.
- Browser strategy: run the repository-owned exact Playwright Chromium command; no alternate browser or proxy route counts.
- Tracker sync: N/A: internal delegated checkout coordination only.
- Non-goals: no unrelated Plite lifecycle, selection, scrolling, package, snapshot, generated/template, commit, push, or PR changes.

Output budget strategy:
- Read only the named helper/test regions and cap command output; run one focused package file and one exact Chromium grep instead of broad suites.

Blocked condition:
- Stop only if the exact Chromium command cannot run after three distinct owner-level attempts or the final behavior contract conflicts with the current helper API.

Task state:
- task_type: Plite DOM focus/browser regression repair
- task_complexity: normal
- current_phase: verification
- current_phase_status: blocked
- next_phase: lifecycle-owner diagnosis
- goal_status: blocked

Current verdict:
- verdict: keep the atomic collapsed-range helper repair, but do not claim it fixes the refocus regression
- confidence: high that the helper contract is correct; high that it is not the decisive browser owner
- next owner: the broader Plite React lifecycle/browser-handle packet
- reason: a forced fresh build remained red, and a controlled restoration of the pre-migration `selection-controller` endpoint-assignment path failed identically

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-restore-collapsed-dom-selection-focus.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Acceptance criteria and boundaries above copy every delegated requirement |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | Autogoal and Patch selected for one exact browser-backed Plite regression |
| Active goal checked or created | yes | Prior migration goal is terminal-blocked and the tool rejects replacement as unfinished. Latest delegated correction explicitly authorizes degraded continuation under this concrete plan; the old goal will not be falsely completed. |
| Source of truth read before edits | yes | Delegated exact failure plus live helper/test diff will be read before source mutation |
| Tracker comments and attachments read | no | N/A: no public tracker or attachment |
| Video transcript evidence required | no | N/A: exact deterministic Chromium row is the source evidence |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: root cause and exact owner are already proven by the old implementation and failing row |
| TDD decision before behavior change or bug fix | yes | Existing exact Chromium row is red; add missing collapsed helper case before the repair |
| Branch decision for code-changing task | no | N/A: operate in the shared current checkout; no branch mutation authorized |
| Release artifact decision | no | N/A: this restores pre-refactor behavior inside an unshipped staged migration; no new release behavior |
| Browser tool decision for browser surface | yes | Use repository-owned exact Chromium Playwright row as requested |
| PR expectation decision | no | N/A: no PR authorized |
| Tracker sync expectation decision | no | N/A: notify only the delegating Codex task |
| Output budget strategy recorded | yes | Exact files, focused commands, capped output |
| Browser pack selected | yes | Browser pack materialized in this plan |
| Browser route / app surface identified | yes | `apps/plite` rich-text test, exact scrollable-editor refocus row |
| Browser tool decision recorded | yes | Exact repository Chromium runner is the required proof surface |
| Console/network caveat policy recorded | yes | Exact test result is authoritative; any console/network failure will be reported verbatim, not ignored |
| Observable browser case captured | yes | Case `plite-dom:collapsed-selection-refocus`: scrollable rich-text editor with a collapsed caret; call `editor.focus()`; expect root to retain active element and scroll position; current staged helper leaves `body` active. Final helper/test fingerprints required. |

Work Checklist:
- [ ] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded.
- [ ] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [ ] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete.
- [ ] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [ ] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason.
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
- [ ] Review/P1 autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason.
- [ ] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
- [ ] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [ ] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [ ] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [ ] Browser pack: console and network errors are checked or explicitly out of scope.
- [ ] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [ ] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
- [ ] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [ ] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree.
- [ ] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [ ] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
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
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-21-restore-collapsed-dom-selection-focus.md` | pending |
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
| Intake and source read | complete | Live helper, coverage, browser handle, selection controller, and exact row traced | implementation |
| Implementation | complete | Collapsed ranges use atomic `setBaseAndExtent`; expanded ranges preserve remove/add/directional assignment | verification |
| Verification | blocked | Focused unit 25/25 and Ultracite pass; forced fresh exact Chromium remains red | lifecycle-owner diagnosis |
| PR / tracker sync | N/A | No PR/tracker mutation authorized; delegating task receives the handoff | final response |
| Closeout | blocked | Exact Chromium acceptance criterion is unmet outside the helper owner | lifecycle-owner diagnosis |

Findings:
- The focused helper test reproduced the missing collapsed `setBaseAndExtent`: 24 pass, 1 fail before the helper repair.
- Calling `setBaseAndExtent` for collapsed ranges made helper coverage pass but did not restore the exact Chromium behavior.
- `PLITE_PROOF_FORCE_BUILD=1 PLITE_BROWSER_FORCE_PROOF=1` rebuilt the proof app and the exact row still failed with `body` active, disproving stale output.
- The final bundle contains the repaired helper. The remaining semantic delta is the transient empty native selection created by `removeAllRanges()` plus `addRange()` before collapsed endpoint assignment; selection-change handling can return focus to `body` during that interval.
- Branching on native `DOMRange.collapsed` still fails exact Chromium after a forced rebuild, so native range shape is not sufficient evidence for the semantically collapsed model caret.
- Restoring the pre-migration direct `setBaseAndExtent` branch at `selection-controller.ts` as a controlled diagnostic produced the identical fresh-build Chromium failure. That falsifies the helper/call-site migration as the decisive owner. The diagnostic was reverted before freeze.

Decisions and tradeoffs:
- Keep destructive range rebuilding for expanded ranges. For collapsed ranges, preserve the old atomic behavior with one direct `setBaseAndExtent(start, start)` and no transient empty selection. Call sites remain uniform.
- The first Chromium red was not a failed claimed fix: no candidate/kept/completed claim was made, and exact replay correctly blocked the claim. Regression methodology needs no source repair.

Implementation notes:
- `replaceDOMSelectionRange` assigns collapsed endpoints atomically and returns without transiently clearing the native selection.
- Expanded ranges retain `removeAllRanges`, `addRange`, and direction-preserving `setBaseAndExtent` in that order.
- Coverage asserts both endpoint direction and exact operation order for collapsed and expanded ranges.

Review fixes:
- None yet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `create_goal` rejected because the terminal-blocked migration goal is still considered unfinished | 1 | Continue only under the explicit latest correction and this materialized plan | Degraded goal control recorded; do not falsify the old goal lifecycle |
| Initial focused test command emitted an oversized JSDOM diff | 1 | Cap later output and inspect only the summary/failing assertion | Red case identified without further broad output |
| Exact Chromium remained red after collapsed helper repair | 1 | Force the proof-app build, then trace remaining semantic deltas before another source edit | Fresh rebuild also red; destructive range replacement is the remaining focus-path delta |
| Exact Chromium remained red after avoiding destructive replacement for native-collapsed ranges | 1 | Restore the browser-handle export call site to its pre-migration direct endpoint assignment and rerun exact proof | Controlled baseline failed identically; diagnostic reverted; owner reclassified to the broader lifecycle packet |

Verification evidence:
- Red helper proof: focused `dom-coverage.ts` produced 24 pass / 1 fail before the collapsed branch.
- Green helper proof: `pnpm --filter @platejs/plite-dom test ./test/dom-coverage.ts` produced 25 pass / 0 fail / 85 expectations.
- Scoped lint: `pnpm exec ultracite check packages/plite-dom/src/utils/dom.ts packages/plite-dom/test/dom-coverage.ts` passed after Oxfmt.
- Fresh exact browser proof: the forced-build Chromium command rebuilt `apps/plite` and remained red with `activeElementTagName: body` and `rootContainsActiveElement: false`.
- Controlled baseline proof: replacing the staged `selection-controller` helper call with its pre-migration direct endpoint assignment still failed with the same browser state; the diagnostic diff was then reverted to zero.

Final handoff contract:
- PR line: N/A: no commit, push, or PR authorized
- Issue / tracker line: N/A: internal delegated checkout coordination only
- Confidence line: high-confidence blocked owner reclassification
- Flow table:
  - Reproduced: helper unit red before repair; exact browser red after repair
  - Verified: helper unit and lint green; browser acceptance criterion not met
- Browser check: forced fresh Chromium replay remains red
- Outcome: helper operation-order bug repaired; refocus regression not fixed
- Caveat: the broader lifecycle/browser-handle packet must own the remaining active-element loss
- Design:
  - Chosen boundary: atomic collapsed selection assignment in the shared helper
  - Why not quick patch: caller-specific focus forcing would hide the lifecycle owner
  - Why not broader change: broader lifecycle files belong to the delegating task and the helper hypothesis is falsified
- Verified: focused unit and scoped Ultracite only; exact browser remains blocked
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
- PR: N/A
- Issue / tracker: hand back to delegating task with exact forced-build and controlled-baseline evidence
- Browser proof: red on the final helper bytes
- Caveats: no fixed/candidate/kept/completed claim is valid

Timeline:
- 2026-08-21T21:53:05.783Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | TODO: Fill from Objective |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- The exact refocus row still loses active element to `body`; the remaining regression is in the broader Plite React lifecycle/browser-handle packet.
- P1 autoreview and broader gates are deferred because this packet cannot legally close while the exact acceptance row is red.
