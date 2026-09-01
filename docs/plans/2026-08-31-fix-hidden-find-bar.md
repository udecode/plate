# Fix hidden Find bar

Objective:
Make the Find bar fully visible above editor chrome; done when focused regression tests and a fresh Mod+F browser replay pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-fix-hidden-find-bar.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:

- browser (docs/plans/templates/packs/browser.md)

Task source:

- type: user screenshot and direct bug report
- id / link: `/var/folders/md/2qpw448d4tx0dgncw_kqdpk80000gn/T/codex-clipboard-c12a57a8-3baa-4f7f-9d98-489c4ddff27c.png`
- title: Find bar is hidden behind the editor toolbar
- acceptance criteria: On the canonical Find demo, focusing the editor and pressing Mod+F shows the complete Find bar above document content without toolbar occlusion; search highlighting and Enter navigation remain functional.

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
- initial confidence score: N/A: binary repro and proof are stronger
- improvement loop: reproduce -> regression proof -> owning layout fix -> verify
- final score / loop closure: N/A: close on named proof gates

Completion threshold:

- The reporter interaction fails before the fix and passes afterward: Mod+F exposes the entire Find bar with no editor-toolbar overlap.
- Focused Find component tests, scoped type/lint checks, fresh Browser replay, console check, and required closeout review pass. P1 helper review is N/A for this one-token production edit when the inherited dirty checkout cannot fit its bundle; record the exact refusal and direct scoped review instead.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-hidden-find-bar.md` passes.

Verification surface:

- Focused tests for the registry Find component and its visible positioning contract.
- Scoped TypeScript/lint checks for changed registry files.
- Browser replay on the canonical `/blocks/find-demo` route: focus editor, press Mod+F, inspect the complete Find bar, search match, navigation, and console.

Constraints:

- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:

- Source of truth: attached screenshot, `apps/www/src/registry/components/editor/find.tsx`, its focused tests, and the canonical Find demo.
- Allowed edit scope: the copied registry Find component, focused tests, directly owning demo/layout source if source proves necessary, this plan, and generated registry output only when repo rules require it.
- Browser surface: canonical `/blocks/find-demo` route in `apps/www`.
- Browser strategy: Use Browser for this ordinary app QA. Use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no public issue or tracker target.
- Non-goals: Find/Replace API redesign, cursor/Yjs behavior, generic floating infrastructure, package API changes, commits, pushes, or PRs.

Output budget strategy:

- Read only the Find component, its tests/demo, route registration, and directly owning layout styles. Cap searches with exact paths and `head`; exclude generated output, build artifacts, and dependencies.

Blocked condition:

- Stop only if the canonical route cannot reproduce the screenshot after three distinct setup attempts or Browser cannot inspect the rendered route and no source/test path can certify the visible behavior.

Task state:

- task_type: Plate registry visual behavior bug
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:

- verdict: local fix verified on the exact route and interaction
- confidence: high; red/green browser regression, typed checks, fresh Browser proof, and 5/5 warm runs pass
- next owner: user for any commit/PR request
- reason: copied registry Find layout owns this visible behavior and now outranks the fixed toolbar

Completion rule:

- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-hidden-find-bar.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asks to fix the Find UI hidden in the attached screenshot; exact scope and proof are recorded above |
| Timed checkpoint parsed | no | N/A: none requested |
| Skill analysis before edits | yes | `patch` owns one local visible behavior repair; `autogoal` owns completion; Browser pack applies |
| Active goal checked or created | yes | Goal created for this plan |
| Source of truth read before edits | yes | Read `find.tsx`, `find.spec.tsx`, `find-demo.tsx`, `fixed-toolbar.tsx`, `editor.tsx`, and existing `transient-editor-geometry.spec.ts` |
| Tracker comments and attachments read | yes | Attached PNG inspected at original resolution; no tracker thread exists |
| Video transcript evidence required | no | N/A: attachment is a still image |
| `docs/solutions` checked for non-trivial existing-code work | yes | Focused filename search found no prior Find/toolbar stacking solution |
| TDD decision before behavior change or bug fix | yes | Add or repair focused visible-positioning coverage before production edit |
| Branch decision for code-changing task | yes | Work in the user-provided checkout without switching branches |
| Release artifact decision | yes | Registry-only user-visible fix: update existing draft `2026-08-31-transient-editor-geometry.mdx`, regenerate JSON, no package changeset |
| Browser tool decision for browser surface | yes | Browser is the required normal app QA surface |
| PR expectation decision | no | N/A: user did not request a PR |
| Tracker sync expectation decision | no | N/A: no tracker target |
| Output budget strategy recorded | yes | Exact-path reads and capped searches only |
| Browser pack selected | yes | browser pack materialized in this plan |
| Browser route / app surface identified | yes | `apps/www`, canonical `/blocks/find-demo` route |
| Browser tool decision recorded | yes | Browser; no native browser/OS behavior involved |
| Console/network caveat policy recorded | yes | Check console; network is out of scope unless route assets fail |
| Observable browser case captured | yes | `find-bar:toolbar-occlusion`; source PNG; route `/blocks/find-demo`; focus editor -> Mod+F; expected complete visible bar and working match navigation; normal desktop browser; claims: popup/toolbar, geometry/paint, focus, runtime errors; dirty current checkout fingerprints recorded at final replay |

Work Checklist:

- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration requested.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: still image only.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: the copied Find bar owns its stacking above copied editor chrome.
- [x] Release artifact requirement recorded: update the existing registry changelog entry and generated JSON; no package changeset.
- [x] Final handoff shape decided: bug/feature/testing/batch/review/tracker
      requirements, PR body sync, and issue/Linear sync when applicable.
- [x] Branch handling recorded for code-changing work: dedicated branch used,
      new branch needed, or N/A with reason.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: typed and focused test lanes passed. One fresh Turbopack process crashed internally; a second fresh Turbopack process compiled and passed without reinstalling or changing product code.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the changed behavior.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: a z-index-only patch can still leave the bar clipped or detached from its editor; proof must inspect full bounds and interaction.
- [x] Review/P1 autoreview target selected from actual diff state. The helper refused because the inherited 115-file dirty bundle exceeds eight passes and cannot path-filter. P1 is N/A for the one-token production edit; direct review covered the Find source, browser assertion, registry payload, and changelog only.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling.
      N/A: no agent/tooling source is in scope.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed into goal
      context.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console errors and warnings are empty; network is in scope only for route loading and the fresh route returned successfully.
- [x] Browser pack: Browser captured the rendered state; no Chrome/Computer fallback was needed.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Final capture: positive-control pass (complete bar visibly above toolbar); negative-control pass (zero bars before Mod+F and after Escape); duplicate-control pass (exactly one bar, its overlap point resolves inside it).
- [x] Browser pack: report-backed proof failed on the exact `/blocks/find-demo` Mod+F case before the fix: 32.54px overlap with search below toolbar.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records ref `377a77a537971b793a4ddbb34cc13797fdfeee15` plus fingerprints below.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A for clean/pushed certification: this is an explicitly local uncommitted candidate. A fresh process and page proved the current fingerprints.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording. Five Browser runs passed; the user did not name Chrome.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof. Generated `public/r/find.json` is required registry output, not scaffolding.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Unit 3/3, focused Chromium 1/1, www typecheck, scoped lint, registry build/check, and fresh Browser 5/5 pass |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Browser on `http://localhost:3000/blocks/find-demo`: Mod+F yields 32.54px search/toolbar overlap; search z-index 40, toolbar 50, and `elementFromPoint` resolves outside the search |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | Focused Playwright test is red before and green after; fresh Browser exact replay passes |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm turbo typecheck --filter=www` passed, 5/5 tasks |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no package export or file-layout change |
| Package manifests, lockfile, or install graph changed | no | Run `pnpm install` and relevant package checks | N/A: no manifest, lockfile, or dependency change |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no agent source changed |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | All commands ran in `/Users/zbeyens/git/plate-2`; Browser used fresh `apps/www` process at port 3108 |
| Browser surface changed | yes | Capture Browser proof for normal app surfaces, or Chrome/Computer proof for native browser/OS surfaces | Browser capture shows the complete bar above the toolbar on `/blocks/find-demo` |
| Browser final proof | yes | Attach Browser/Chrome/Computer proof or exact caveat when browser proof applies | Fresh-process screenshot plus geometry/hit-test ledger: z60 over z50, fully in viewport, overlap point inside Find |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no `templates/**` output changed; `public/r/find.json` is required registry output |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: registry-only behavior; no package changeset |
| Registry-only component work changed | yes | Update `docs/components/changelog.mdx` or record N/A | Updated canonical registry changelog MDX entry, generated JSON, `components.json`/`index.json` through the generator, and `--check` passed |
| Docs or content changed | yes | For docs-heavy work, use `--template docs`; for incidental docs, verify source-backed claims, links, examples, and rendered output or record N/A | Incidental registry changelog and goal plan passed Prettier; generated changelog check passed |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode was clipping/stacking despite mount; exact hit-test and viewport proof validates the local Find owner |
| Agent-native review for agent/tooling changes | no | For `.agents/**`, `.claude/**`, `.codex/**`, skills, hooks, commands, prompts, or user-action tooling, load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted/actionable findings, or record N/A | N/A: no agent/tooling change |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: all code checks pass; fresh Turbopack retry succeeded after one internal panic |
| P1 autoreview for non-trivial implementation changes | no | Load `.agents/skills/autoreview/SKILL.md`; pass `--max-priority P1` with dirty local `--mode local`, branch/PR `--mode branch --base <base>`, or committed slice `--mode commit --commit <ref>`; fix and rerun within the hard cap of three helper invocations for one unchanged scope, then stop and report any remaining accepted/actionable findings; use P2 or P3 only when explicitly requested, or record N/A for docs-only/trivial/no local patch | N/A: one-token production edit with focused browser coverage. Helper attempted with strict paths but refused inherited 115-file bundle as over eight passes; direct scoped review found no issue |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested |
| Task-style PR body verified | no | Verify the PR body with `gh pr view --json body`; it must preserve auto-release blocks when applicable, must not include a current-PR self-link, and must use the kitcn PR #270 emoji format: `🐛 Fixes ...`, `🟢 95-100% confidence`, `Phase / 🧪 Tests / 🌐 Browser` table, and bold emoji Outcome/Caveat/Design/Verified sections | N/A: no PR |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: no tracker target |
| Final handoff contract | yes | Fill the final handoff fields below with exact PR/issue/confidence/tests/browser/outcome/caveats/design/verification content or N/A reason | Completed below |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec ultracite check` passed on both changed code/test files; Prettier passed on MDX/plan |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed, or record the accidental output and recovery | Commands were path-scoped and capped. Changelog/build generators are inherently verbose; their output was capped and later searches stayed narrow |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-fix-hidden-find-bar.md` | Passed after final evidence update |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Mod+F, query `the`, Enter, Escape exercised on fresh port 3108 process |
| Browser console/network check | yes | Record console/network state or why it is not applicable | Zero Browser warnings/errors; route loaded successfully |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Browser screenshot captured the full bar above toolbar; screenshot is in this task's Browser proof output |
| Exact case replay | yes | For report-backed behavior, prove the exact case and all applicable end-state claim fields; otherwise N/A with reason | Exact screenshot route/action replayed: full popup, focus, two matches, active match, navigation, close, no runtime error |
| Final ref and fingerprints | yes | Record the replayed commit/ref and issue-owned production/test/fixture/harness SHA-256 fingerprints; any later code or generated change invalidates the result | Ref `377a77a537971b793a4ddbb34cc13797fdfeee15`; hashes listed in Verification evidence |
| Clean final runtime | no | Before fixed/completed wording, start a fresh process from a clean checkout at the exact final pushed ref or immutable CI artifact and prove zero tracked/untracked issue-owned runtime-input differences; local candidates record N/A with exact unpushed status | N/A: local uncommitted/unpushed candidate in inherited dirty checkout. Fresh process proved exact current file hashes only |
| Retry-free stability | yes | For native selection/paint, focus, DnD, compositor, or React DOM lifecycle, record 5/5 warm runs with no retry in the exact reported browser/device; otherwise N/A with reason | Browser 5/5: one visible bar, fully in viewport, on top, 2 matches, Enter moves, Escape closes |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | completed | exact source and Browser repro recorded | implementation complete |
| Implementation | completed | Find z-index 40 -> 60; browser regression and registry artifacts updated | verification complete |
| Verification | completed | focused unit/browser, typecheck, lint, generator, fresh Browser 5/5 | closeout complete |
| PR / tracker sync | completed | N/A: neither requested nor targeted | final response |
| Closeout | completed | direct scoped review and complete evidence ledger | final response |

Findings:

- The attached screenshot shows active search highlighting, proving Find logic ran. A rounded Find bar is partially visible behind the top editor toolbar, so the failure is presentation/geometry, not command registration or query execution.
- Live Browser reproduced the exact route and interaction. Search bounds are y=7.99..57.09, toolbar bounds are y=0..40.54, overlap is 32.54px, and stacking is 40 below 50.
- Existing browser coverage proves search/query/navigation but never asserts that the Find bar wins hit testing where it overlaps the fixed toolbar.

Decisions and tradeoffs:

- Fix the copied registry Find UI or its direct containing layout. Do not add a generic floating package or change Find query APIs.
- Preserve the deliberate top-right overlay position and raise only the Find bar above the fixed toolbar. Measuring toolbar height or moving generic render slots would add machinery for a simple local stacking law.

Implementation notes:

- Raised only the copied Find bar from z-index 40 to 60, above the copied fixed toolbar's 50.
- Added a browser invariant that accepts either no toolbar overlap or hit-testing owned by the Find bar at the overlap point.
- Updated the existing draft registry changelog entry and regenerated required outputs.

Review fixes:

- Direct scoped review: keep. The edit is local presentation policy, the browser assertion tests behavior rather than a specific class token, and generated source matches registry payload.
- Autoreview helper: no findings produced because it refused the inherited oversized bundle before model invocation; N/A under the trivial-edit exception.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Fresh Turbopack process panicked in internal duplicate-key map | 1 | Retry a fresh process without product edits | Second Turbopack process compiled and passed |
| Webpack fresh-process fallback rejected Turbopack-only config | 1 | Return to supported Turbopack lane on a new port | Superseded by passing port 3108 process |
| First port 3108 Browser navigation exceeded initial compile timeout | 1 | Inspect server once, then resume the loaded tab | Route returned 200 after 12s and exact replay passed |
| P1 autoreview local bundle exceeded eight passes due inherited dirty checkout | 1 | Apply trivial-edit exception and direct strict-path review | Recorded as N/A; no model finding claimed |

Verification evidence:

- Red: focused Playwright Find test failed `Expected true, Received false` at `searchWinsStacking`.
- Green: the same command passed 1/1 after the z-index fix.
- `bun test apps/www/src/registry/components/editor/find.spec.tsx` -> 3 passed, 0 failed.
- `pnpm turbo typecheck --filter=www` -> 5 tasks successful.
- `pnpm exec ultracite check apps/www/src/registry/components/editor/find.tsx apps/www/tests/browser/transient-editor-geometry.spec.ts` -> pass.
- `pnpm exec prettier --check ...transient-editor-geometry.mdx ...fix-hidden-find-bar.md` -> pass.
- Registry changelog `--write` and `--check` -> 96/96 events; `pnpm --filter www build:registry` -> 367 canonical payloads and 15 overlays.
- Fresh Browser process `/blocks/find-demo`: `fullyInViewport=true`, `searchZ=60`, `toolbarZ=50`, `topElementInsideSearch=true`, `searchCount=1`, `matches=2`, `activeMatches=1`, input focused, Enter -> `2 of 2`, Escape -> zero search bars, console warnings/errors empty.
- Browser warm stability -> 5/5 with visible/on-top/single bar, two matches, navigation, and close all passing.
- SHA-256: `find.tsx` `35e2a4c82b9ecc3ee170dc532e46e702fd9d2d761a9424ddf18f85e23f5cf059`; browser spec `752b7817fb0d79b2cff902f7beb61517e5dd4d9378a5f425910552ae2459ea88`; demo `b2c9b3214b3d863a02bdb5652aa8f76482a917e5e9e8df2ee92f20f9dfb16e94`; fixed toolbar `696d714825569db64945ae57264f79af0708f9d2cb0157c9350c886c6dd09b98`; generated `find.json` `51e170fa6e2899bf685ab7d0f5d15572006ed6b94cea88d792cd13d21b6e2274`.

Final handoff contract:

- PR line: N/A: no PR requested
- Issue / tracker line: N/A: no tracker target
- Confidence line: high for the exact local interaction; not a pushed/released claim
- Flow table:
  - Reproduced: focused browser test red; Browser exact case red
  - Verified: focused browser test green; fresh Browser exact case and 5/5 warm runs green
- Browser check: complete on fresh local app process, zero warnings/errors
- Outcome: complete Find bar visibly wins over fixed toolbar and remains keyboard functional
- Caveat: local uncommitted/unpushed checkout; helper P1 review could not isolate inherited 115-file dirty state
- Design:
  - Chosen boundary: copied registry Find bar stacking class
  - Why not quick patch: this is the correct quick patch because the screenshot proves only sibling z-order is wrong, and the browser regression makes it durable
  - Why not broader change: Plate slots, geometry APIs, and toolbar measurement are unrelated machinery
- Verified: unit, browser regression, typecheck, lint/format, changelog/build, exact Browser replay, 5/5 stability
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
- Browser proof: passed on fresh port 3108 process with final hashes
- Caveats: local uncommitted/unpushed; no P1 model result because inherited bundle exceeded helper limits

Timeline:

- 2026-08-31T05:23:16.573Z Task goal plan created.
- 2026-08-31 Source audit and exact Browser reproduction complete; root cause is z-index ordering.
- 2026-08-31 Red browser assertion failed, Find z-index raised to 60, focused browser test passed.
- 2026-08-31 Registry/changelog outputs regenerated; unit, typecheck, lint, format, and generator checks passed.
- 2026-08-31 Fresh-process Browser replay and 5/5 warm stability passed with zero warnings/errors.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete |
| Where am I going? | Final response |
| What is the goal? | Make Mod+F reveal the complete Find bar above editor chrome |
| What have I learned? | Find mounted correctly but lost sibling hit testing because z40 sat under fixed toolbar z50 |
| What have I done? | Added red/green browser coverage, fixed registry stacking, regenerated artifacts, and proved final behavior |

Open risks:

- No remaining behavior risk in the exact local case. Shipping state remains local/uncommitted, and the inherited dirty checkout prevented an isolated P1 helper run.
