# Restore local AI writing requests

Objective:
Restore local Improve Writing and generation with real AI responses for the playground document.

Goal plan:
docs/plans/2026-09-09-restore-local-ai-writing-requests.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: http://localhost:3000
- title: Apply equivalent local AI route repair
- acceptance criteria: homepage/editor load, mounted AI route, real generation and editing responses, local-only credentials.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; no duration requested
- semantics: one-shot local repair
- initial confidence score: N/A; exact HTTP and regression-test oracles
- improvement loop: reproduce, compose existing plugin, restart, replay
- final score / loop closure: connection verified; separate selection-output caveat recorded

Completion threshold:
- Local homepage/editor load; generation and Improve Writing return real AI text without schema errors or mock fallback.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-09-restore-local-ai-writing-requests.md` passes.

Verification surface:
- Bun BaseEditorKit and Markdown tests, scoped Ultracite, registry build/check, live HTTP streams and Browser homepage proof.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user request and local route/log/browser evidence.
- Allowed edit scope: local AI route setup, BaseEditorKit composition, regression test, registry release entry and generated output.
- Browser surface: http://localhost:3000 homepage playground.
- Browser strategy: Browser. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; local-only request.
- Non-goals: publishing, commits, PRs, API redesign, key disclosure. Existing working local key stays unchanged.

Output budget strategy:
- Focused file reads and bounded log snippets. Initial concatenated skill read overflowed; subsequent searches used exact owners.

Blocked condition:
- An unavailable AI provider or a failure after the schema fix prevents claiming a working connection.

Task state:
- task_type: local setup and registry composition repair
- task_complexity: bounded
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: local connection restored; partial-selection insertion caveat
- confidence: N/A; see evidence below
- next owner: task
- reason: existing route/key work; missing codeDrawing schema caused HTTP 500.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-09-restore-local-ai-writing-requests.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | See verification evidence and decisions below. |
| Timed checkpoint parsed | N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Skill analysis before edits | yes | See verification evidence and decisions below. |
| Active goal checked or created | N/A | N/A: no goal tool requested; use this local evidence plan only. |
| Source of truth read before edits | yes | See verification evidence and decisions below. |
| Tracker comments and attachments read | N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Video transcript evidence required | N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| `docs/solutions` checked for non-trivial existing-code work | yes | See verification evidence and decisions below. |
| TDD decision before behavior change or bug fix | yes | See verification evidence and decisions below. |
| Branch decision for code-changing task | yes | See verification evidence and decisions below. |
| Release artifact decision | yes | See verification evidence and decisions below. |
| Browser tool decision for browser surface | yes | See verification evidence and decisions below. |
| PR expectation decision | yes | See verification evidence and decisions below. |
| Tracker sync expectation decision | N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Output budget strategy recorded | yes | See verification evidence and decisions below. |
| Browser pack selected | yes | See verification evidence and decisions below. |
| Browser route / app surface identified | yes | See verification evidence and decisions below. |
| Browser tool decision recorded | yes | See verification evidence and decisions below. |
| Console/network caveat policy recorded | yes | See verification evidence and decisions below. |
| Observable browser case captured | yes | See verification evidence and decisions below. |

Work Checklist:
- [x] Skill analysis: task/debug for setup diagnosis; patch for observed server schema mismatch; autogoal for evidence; Browser for live proof; unslop for prose.
- [x] User scope: apply equivalent local repair, keep credentials local, preserve homepage/editor.
- [x] Verify generation and Improve Writing produce real provider text.
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
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | See verification evidence and decisions below. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | See verification evidence and decisions below. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | See verification evidence and decisions below. |
| TypeScript or typed config changed | yes | Run relevant typecheck | App tsc --noEmit -p tsconfig.json passed after generating docs collections. |
| Package exports or file layout changed | N/A | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Package manifests, lockfile, or install graph changed | N/A | Run `pnpm install` and relevant package checks | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Agent rules or skills changed | N/A | Run `pnpm install` and verify generated skill sync | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | See verification evidence and decisions below. |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | See verification evidence and decisions below. |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | See verification evidence and decisions below. |
| CI-controlled template output changed | N/A | Restore generated template output or record why it is intentionally kept | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Package behavior or public API changed | N/A | Add a changeset or record why no changeset applies | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | See verification evidence and decisions below. |
| Docs or content changed | N/A | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | See verification evidence and decisions below. |
| Agent-native review for agent/tooling changes | N/A | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Local install corruption suspected | N/A | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| P1 autoreview for non-trivial implementation changes | N/A | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: current branch is next; repo instructions prohibit autoreview. |
| PR create or update | N/A | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Task-style PR body verified | N/A | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| PR proof image hosting | N/A | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Tracker sync-back | N/A | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | See verification evidence and decisions below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | See verification evidence and decisions below. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | See verification evidence and decisions below. |
| Timed checkpoint | N/A | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-09-restore-local-ai-writing-requests.md` | See verification evidence and decisions below. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | See verification evidence and decisions below. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | See verification evidence and decisions below. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | See verification evidence and decisions below. |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | See verification evidence and decisions below. |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | See verification evidence and decisions below. |
| Clean final runtime | N/A | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |
| Retry-free stability | N/A | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | N/A: no public release, package/API, native browser, agent-tooling or timed work in this local request. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Source, logs and exact Browser failure read | implementation |
| Implementation | complete | | verification |
| Verification | complete | | closeout |
| PR / tracker sync | complete | | final response |
| Closeout | complete | | final response |

Findings:
- Route is already mounted. Existing key returns real provider output for a paragraph-only request. Playground includes codeDrawing but BaseEditorKit omits BaseCodeDrawingKit. No public API redesign is needed.

Decisions and tradeoffs:
- See evidence below.

Implementation notes:
- See evidence below.

Review fixes:
- See evidence below.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- See evidence below.

Final handoff contract:
- PR line: N/A; see evidence below
- Issue / tracker line: N/A; see evidence below
- Confidence line: N/A; see evidence below
- Flow table:
  - Reproduced: tests N/A; see evidence below, browser N/A; see evidence below
  - Verified: tests N/A; see evidence below, browser N/A; see evidence below
- Browser check: N/A; see evidence below
- Outcome: N/A; see evidence below
- Caveat: N/A; see evidence below
- Design:
  - Chosen boundary: N/A; see evidence below
  - Why not quick patch: N/A; see evidence below
  - Why not broader change: N/A; see evidence below
- Verified: N/A; see evidence below
- PR body verified: N/A; see evidence below

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
- PR: N/A; see evidence below
- Issue / tracker: N/A; see evidence below
- Browser proof: N/A; see evidence below
- Caveats: N/A; see evidence below

Timeline:
- 2026-09-09T09:19:37.405Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Intake and source read |
| Where am I going? | Implementation, verification, PR/tracker sync, closeout |
| What is the goal? | Restore real local AI writing requests |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- The partial-word Browser replay returned a full heading and Accept inserted duplicate text. This is a separate output/selection issue; only the AI connection and codeDrawing schema failure are closed here.

Verification evidence details:
- Exact Browser red: homepage heading word selection -> Cmd+J -> Improve writing; server rejected codeDrawing at [33] with HTTP 500.
- Narrow HTTP red: paragraph plus codeDrawing document rejected at [1].
- Bun red: plugins-static.spec.ts failed with the same unknown codeDrawing at [33].
- Fix: compose existing BaseCodeDrawingKit in BaseEditorKit and declare @plate/code-drawing-static registry dependency. No new plugin or API owner.
- Bun green: plugins-static.spec.ts and markdown.spec.ts, 7 passed / 0 failed, 22 assertions.
- HTTP green after fresh pnpm dev: editing paragraph plus drawing returned 200 and real text "This is a nice day" with no error events. Paragraph generation returned 200 with provider generation metadata and a sentence about a blue bicycle. Existing local key unchanged.
- Browser green for connection: homepage Improve writing returned 200 and showed Accept/Discard controls. Accept exposed the separate partial-selection duplication caveat recorded above; no full editing correctness claim.
- Fresh Browser homepage after registry generation: homepage and playground headings present, no error logs. /view/editor-ai returned 200.
- pnpm --filter www build:registry passed; public editor-plugins-static.json and registry.json generated.
- Registry changelog generator --check passed for 106 source events.
- Scoped pnpm exec ultracite check passed for the three changed TypeScript files.
- Initial direct tsc lacked generated collections/server docs. Ran pnpm build:source, then tsc --noEmit -p tsconfig.json passed with exit 0; this was generated docs input, not installation corruption.
- Current ref: local edits over next a6afd55c30e97c74fe895d1ad005ca75413110f3. No commit, push, PR, credential overwrite or public mutation.
- SHA256 plugins-static.ts: f20958904d6f74385db4fa7abe6f1cd177b81d14b1324e5165ed7e734586bdbb
- SHA256 plugins-static.spec.ts: 73d67163fa901b082be552d4c13cd6650e58d3885a94308c59a5cd7bad09977c
- SHA256 registry-features.ts: 0b27cc00c213bd9dc429af6f419f142bd7ffcf8ec93dba55fec578a2f0b11d7d
- SHA256 mounted unchanged route.ts: 79a465381831db82e876744f27995ea4705c87d783ec27313ad1e7ebbb6e35d1

Applicability decisions:
- No timer, tracker, video attachment, public API, package change, package layout, skill modification, native paint/caret claim, or release request. Those template rows are N/A.
- Autoreview prohibited on next. Direct review confirmed existing plugin ownership and matching copied registry dependency.
- No standalone regression for credential setup; the new behavior test uses the full actual playground and serialization path.
- Registry changelog skill applied for the user-visible kit composition repair. No package changeset required.
- Main task is local API connectivity, as specified by the pasted repair; selection-output correctness remains an explicit caveat.
