# Fix drag handle selection paint

Objective:
Fix drag-handle native selection paint; done when the exact homepage gesture
excludes editor chrome, focused proof passes, and Browser is green 5/5.

Goal plan:
docs/plans/2026-08-25-fix-drag-handle-selection-paint.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user bug report with screenshot
- id / link: `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-705f81ec-a48a-4442-af82-405a9a49a5ed.png`
- title: Drag handle receives native selection highlight
- acceptance criteria:
  - Reproduce the homepage text-selection gesture while the block drag handle is visible.
  - Native selection paint and selection text exclude the drag handle.
  - Editor text selection, focus, follow-up input, and drag-handle interaction still work.
  - Add focused regression coverage at the owning component boundary.
  - Run relevant typecheck/lint and 5/5 retry-free Browser replays with no task-owned console error.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A; none requested
- semantics: one-shot bug-fix execution
- initial confidence score: 75%; screenshot is exact, source owner still needs confirmation
- improvement loop: reproduce, trace owner, add regression proof, patch, rerun exact browser case
- final score / loop closure: 98%; exact red, focused green, fresh-server Browser 5/5, handle/focus/input/undo, lint, typecheck, and registry generation complete

Completion threshold:
- The exact report is reproduced before the fix, the canonical drag-handle
  owner excludes its chrome from native selection paint, focused regression
  coverage passes, scoped lint/typecheck pass, and the exact Browser gesture
  passes 5/5 on a fresh final-code page with selection/focus/handle/follow-up
  behavior and task-owned console state checked.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-fix-drag-handle-selection-paint.md` passes.

Verification surface:
- Exact `/` homepage Browser selection replay with screenshot and native
  `Selection` inspection; focused drag-handle/component test; scoped Ultracite;
  `pnpm --filter www typecheck`; `pnpm --filter www build:registry` if registry
  source changes; final issue-owned file SHA-256 fingerprints.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user screenshot, current homepage DOM, and current owning registry/component source.
- Allowed edit scope: the canonical drag-handle/editor-chrome owner and focused tests; expand to package selection code only if source and the exact repro prove ownership there.
- Browser surface: `apps/www` homepage `/`, editor block drag handle beside the `Collaborative Editing` heading.
- Browser strategy: Browser for exact normal app QA and screenshots. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A; no issue or Linear item supplied.
- Non-goals: redesigning DnD, changing editor selection semantics, editing `templates/**`, changing public APIs, committing, pushing, or opening a PR.

Output budget strategy:
- Use owner-scoped `rg` under `apps/www/src`, read only matched components/tests,
  exclude generated registry output and templates, cap command output, and run
  package-wide commands only for the final owning-app gate.

Blocked condition:
- Block only if three distinct exact gesture strategies cannot reproduce the
  screenshot, the homepage cannot run after the documented one-time install
  recovery, or concurrent writes repeatedly invalidate the final proof.

Task state:
- task_type: report-backed UI behavior bug
- task_complexity: focused but browser-sensitive
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: ready for completion

Current verdict:
- verdict: fixed locally
- confidence: 98%
- next owner: user/commit owner
- reason: the gutter chrome now has native `user-select: none`; exact red-to-green and fresh-server 5/5 Browser proof passed.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-25-fix-drag-handle-selection-paint.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact screenshot bug, scope, non-goals, proof, stop conditions, deliverable, and handoff captured above |
| Timed checkpoint parsed | N/A | No duration requested |
| Skill analysis before edits | yes | `autogoal` and `patch` read before source edits |
| Active goal checked or created | yes | Created active goal with the short objective after completing the first checkpoint |
| Source of truth read before edits | yes | Screenshot, live homepage DOM, `dnd.tsx`, `node-selection.tsx`, focused diffs, and nearby tests read before the source patch |
| Tracker comments and attachments read | yes | User screenshot is the only supplied attachment; no tracker exists |
| Video transcript evidence required | N/A | Static screenshot, no video |
| `docs/solutions` checked for non-trivial existing-code work | yes | Owner-scoped search found native-selection guidance but no existing drag-handle visual fix |
| TDD decision before behavior change or bug fix | yes | Exact Browser red is mandatory; add a focused semantic component test where jsdom can express the chrome contract |
| Branch decision for code-changing task | yes | Use current checkout as-is; no branch creation, commit, push, or PR requested |
| Release artifact decision | yes | `apps/www/public/r/dnd.json` regenerated; no package changeset; registry changelog N/A because this is a corrective line inside the current unreleased registry rewrite and no monolithic component changelog file exists |
| Browser tool decision for browser surface | yes | In-app Browser; exact Chrome-only native surfaces are not involved |
| PR expectation decision | N/A | No PR requested |
| Tracker sync expectation decision | N/A | No tracker supplied |
| Output budget strategy recorded | yes | Owner-scoped searches and capped output; generated/template paths excluded |
| Browser pack selected | yes | `browser` pack applied |
| Browser route / app surface identified | yes | `apps/www` `/`, drag handle beside `Collaborative Editing` |
| Browser tool decision recorded | yes | Browser for DOM/native Selection/visual paint; Chrome only if exact Chrome rendering becomes part of the claim |
| Console/network caveat policy recorded | yes | Check task-owned console errors; unrelated existing network noise is recorded, not hidden |
| Observable browser case captured | yes | `homepage:drag-handle-native-selection-paint`; `/`; select text across visible heading handle; current bad local ref; expected handle excluded; final local ref plus source/test fingerprints |

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
| Named verification threshold | yes | Run the named focused/browser/app gates | Focused browser test, scoped lint, www typecheck, registry build, and fresh-server Browser proof passed |
| Bug reproduced before fix | yes | Record failing test/repro | Browser selected text contained `⠿`; focused Chromium test failed on the same assertion before the source patch |
| Targeted behavior verification | yes | Run focused test/proof | `tests/browser/dnd.spec.ts` passed after the patch |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` exited 0 |
| Package exports or file layout changed | N/A | No package export/layout change | No barrel update required |
| Package manifests, lockfile, or install graph changed | N/A | No manifest/install graph change | No install required |
| Agent rules or skills changed | N/A | No agent files changed | No skill sync required |
| Workspace authority proof | yes | Verify from owning repo/app/route/tool | All commands ran in `/Users/zbeyens/git/plate-2`; Browser exercised `apps/www` `/` |
| Browser surface changed | yes | Capture Browser proof | Fresh in-app Browser screenshot showed selected heading with visible unpainted handle |
| Browser final proof | yes | Record final Browser state | Native range crossed the handle, selection text omitted `⠿`, computed `user-select` was `none`, focus stayed in editor |
| CI-controlled template output changed | N/A | Do not edit templates | No `templates/**` edits |
| Package behavior or public API changed | N/A | No npm package/public API change | Registry UI only; no changeset |
| Registry-only component work changed | yes | Regenerate registry payload | `pnpm --filter www build:registry`; `apps/www/public/r/dnd.json` contains the fix. Registry changelog N/A for this corrective line in the current unreleased rewrite |
| Docs or content changed | N/A | No user docs change | Goal plan is execution state, not product docs |
| High-risk mini gate | yes | Prove browser selection/focus behavior | Failure risk was suppressing editor text selection; scoping `select-none` to gutter chrome plus exact selection/focus/input/undo proof closes it |
| Agent-native review for agent/tooling changes | N/A | No agent/tooling files changed | Not applicable |
| Local install corruption suspected | N/A | No install-corruption signal | No reinstall run |
| P1 autoreview for non-trivial implementation changes | N/A | Branch policy forbids autoreview on `next` | Current branch is `next`; focused patch was manually source-audited and behavior-proven |
| PR create or update | N/A | No PR requested | No git mutation performed |
| Task-style PR body verified | N/A | No PR exists | Not applicable |
| PR proof image hosting | N/A | No PR exists | Browser image remained local proof |
| Tracker sync-back | N/A | No tracker supplied | Not applicable |
| Final handoff contract | yes | Fill final handoff below | Completed below |
| Final lint | yes | Run scoped equivalent | `pnpm exec ultracite fix ...` then `ultracite check ...` exited 0 |
| Output budget discipline | yes | Keep investigation bounded | Owner-scoped searches and capped outputs; broad registry build output was the required generation command |
| Timed checkpoint | N/A | No duration requested | One-shot loop completed |
| Goal plan complete | yes | Run completion checker | Run after this plan update |
| Browser interaction proof | yes | Exercise exact route/action | Exact text drag, handle click, node overlay/focus, follow-up input, and undo passed |
| Browser console/network check | yes | Check task-owned runtime state | Final fresh Browser page reported zero warning/error logs; dev-server docs-route noise was unrelated to `/` and pre-existing |
| Browser final proof artifact | yes | Record visual proof | Fresh-server screenshot captured selected heading with visible handle not painted |
| Exact case replay | yes | Replay report-backed case | `homepage:drag-handle-native-selection-paint` passed on `/` with all applicable selection/focus/paint/input fields |
| Final ref and fingerprints | yes | Record ref and SHA-256 | HEAD `168a4490e2ccf90dd9b1bd3230fb2f528460caa2`; hashes recorded below |
| Clean final runtime | N/A | Local candidate, not pushed | Fresh process and page used, but checkout remains intentionally uncommitted; no shipped/final-pushed claim |
| Retry-free stability | yes | Record five warm runs | Fresh-server in-app Browser: 5/5, no retry; each range intersected handle, omitted `⠿`, kept editor focus, and computed `user-select: none` |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | screenshot, DOM, source, diffs, tests, solutions | implementation |
| Implementation | complete | gutter `select-none`; focused browser regression | verification |
| Verification | complete | red→green, lint, typecheck, registry build, Browser 5/5 | closeout |
| PR / tracker sync | N/A | none requested or supplied | final response |
| Closeout | complete | fingerprints and final handoff recorded | final response |

Findings:
- `Gutter` was the literal owner. It already used `contentEditable={false}`,
  which prevents editing but leaves native `user-select: text` intact.
- The exact native range crossed both gutter and handle; before the fix,
  `window.getSelection().toString()` included `⠿`.
- Plite selection internals were not the owner. The handle is button chrome and
  existing root interaction logic already treats buttons as chrome.

Decisions and tradeoffs:
- Apply `select-none` to `Gutter`, not each handle child. Every current and
  activated handle state inherits the same native-selection contract.
- Keep `contentEditable={false}` because editing and native paint are separate
  browser contracts.
- Do not change Plite selection import, node-selection overlays, DnD behavior,
  or public APIs; those would be broader and solve the wrong layer.
- Local env retry: N/A; no install-corruption signal occurred.
- P1 autoreview: N/A; repo policy forbids `autoreview` on `next`.
- Agent-native review: N/A; no agent/tooling files changed.

Implementation notes:
- Added `select-none` to the canonical `.plite-gutterLeft` class in
  `apps/www/src/registry/components/editor/dnd.tsx`.
- Added `apps/www/tests/browser/dnd.spec.ts` with the exact native drag
  selection assertion and computed-style contract.
- Regenerated `apps/www/public/r/dnd.json` through the registry builder.

Review fixes:
- Scoped Ultracite formatted the new browser test; the post-format check passed.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| First in-app Browser drag used stale scroll geometry | 1 | Re-read visible viewport and scroll owner before replay | Exact visible gesture reproduced; no product edit based on the failed gesture |
| Initial scoped format check found the new test unformatted | 1 | Run scoped Ultracite fix, then recheck | Final format/lint check passed |

Verification evidence:
- Red: focused Chromium test failed because selected text contained `⠿`; the
  in-app Browser exact case also returned `handleSelectedByRange: true`,
  `handleUserSelect: text`, and selected text `\n⠿\nCollaborative Editing`.
- Green: `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www
  test:www-browser:chromium tests/browser/dnd.spec.ts` — 1 passed.
- Lint: `pnpm exec ultracite check
  apps/www/src/registry/components/editor/dnd.tsx
  apps/www/tests/browser/dnd.spec.ts` — passed.
- Types: `pnpm --filter www typecheck` — passed.
- Registry: `pnpm --filter www build:registry` — passed; generated payload
  contains the gutter `select-none` class.
- Browser: fresh dev process and fresh `/` page; 5/5 retry-free. Every run
  intersected the handle range, omitted `⠿`, computed `user-select: none`, and
  retained editor focus. Handle click produced node-selection overlays and
  editor focus; follow-up `x` input landed in editor content and undo restored it.
- Final Browser warning/error log: empty. The dev server separately emitted
  pre-existing docs-route prerender and transient registry-resolution noise;
  neither affected `/`, the focused test, typecheck, registry build, or final page log.
- Ref: `168a4490e2ccf90dd9b1bd3230fb2f528460caa2` plus local uncommitted task files.
- SHA-256:
  - source: `10ca69c24a77d41c3dd345198a7e7a05c8224c621cb510bfda0cd21c4b65e677`
  - test: `f91d12390d37324780034386512bfa41e6e1ea5e879803606fd8e60ab1de54be`
  - generated `dnd.json`: `c8242f0317a73df725c552d4337d7fa71011984189891ced5c6f3b5e464b9532`

Final handoff contract:
- PR line: N/A; no PR requested
- Issue / tracker line: N/A; none supplied
- Confidence line: 98%; exact behavior, focused regression, app gates, and fresh Browser stability passed; local candidate is uncommitted
- Flow table:
  - Reproduced: test red, Browser red
  - Verified: test green, Browser 5/5 green
- Browser check: fresh-server `/`; exact native range, paint contract, focus, handle click, follow-up input, undo, and empty page logs
- Outcome: drag-handle gutter is excluded from native selection paint and selection text
- Caveat: local uncommitted candidate; no pushed/shipped claim. Dev server has unrelated docs-route noise outside this task surface
- Design:
  - Chosen boundary: `.plite-gutterLeft`, the shared drag-handle chrome owner
  - Why not quick patch: styling only the placeholder glyph would miss the activated SVG handle
  - Why not broader change: Plite selection and DnD semantics were correct; changing them would add risk without fixing the CSS paint owner
- Verified: focused Chromium test, scoped lint, www typecheck, registry build, exact Browser 5/5, handle/focus/input/undo
- PR body verified: N/A; no PR exists

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
- Issue / tracker: N/A; none supplied
- Browser proof: exact final `/` screenshot and 5/5 ledger recorded above
- Caveats: local uncommitted candidate; unrelated docs-route dev-server errors were not counted as task-owned failures

Timeline:
- 2026-08-25T23:01:17.639Z Task goal plan created.
- 2026-08-26 Exact screenshot case reproduced in Browser and focused Chromium test.
- 2026-08-26 Gutter owner patched; focused test turned green.
- 2026-08-26 Registry, lint, and typecheck passed.
- 2026-08-26 Fresh-server Browser 5/5, handle interaction, follow-up input, undo, screenshot, logs, ref, and fingerprints recorded.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Exclude drag-handle chrome from native selection paint with exact regression and Browser proof |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- No task-owned runtime risk remains in the local candidate. Delivery remains
  unproven until the user commits/pushes it through the normal lane.
