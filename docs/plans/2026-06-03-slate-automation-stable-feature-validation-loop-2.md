# slate automation stable feature validation loop 2

Objective:
Run a 1h Slate automation batch loop on stable Slate v2 features; find/patch safe regressions and workflow misses, with proof-first closeout.

Goal plan:
docs/plans/2026-06-03-slate-automation-stable-feature-validation-loop-2.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user prompt
- id / link: chat
- title: slate-automation existing Slate v2 feature regression + API/DX validation loop 2
- acceptance criteria:
  - use `slate-automation` for existing Slate v2 feature regression plus
    API/DX validation
  - invocation mode: timed 1h batch-loop
  - scope: stable/current Slate features
  - non-goal: do not start broad experimental pagination/virtualization
    architecture or pagination optimization
  - cover richtext, plaintext, markdown shortcuts, history,
    selection/navigation, editable voids, custom-placeholder, hidden/dom
    coverage, core package API/DX, and test/oracle gaps
  - run huge-document smoke only if it reveals generic regression risk
  - behavior proof first, then visual proof, then API/test/skill repair
  - queue soft stopping checkpoints for final handoff
  - patch safe bugs, safe oracles, and safe workflow misses
  - final handoff routes broad pagination/virtualization architecture to
    `slate-plan` if encountered

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- Extracted requirements:
  - mode: timed + batch-loop
  - start: 2026-06-03T18:25:31+0200
  - target end: about 2026-06-03T19:25:31+0200, after closing or quarantining
    the current packet
  - surface: `.tmp/slate-v2` stable editor examples and package API/DX
  - behavior lanes: richtext, plaintext, markdown shortcuts, history,
    selection/navigation, editable voids, custom-placeholder, hidden/dom
    coverage
  - package/API lane: core package API/DX, especially public helper shape and
    test/oracle ergonomics discovered from the stable behavior lanes
  - visual lane: in-app Browser smoke on stable examples when behavior proof is
    green or when visible risk appears
  - huge-document: smoke only for generic regression risk; no broad
    virtualization/pagination optimization
  - repair authority: patch safe runtime bugs, Playwright/Bun oracles,
    `slate-browser` proof helpers, and `.agents/rules/**` workflow misses
  - stop policy: do not stop at first green/failure; keep safe alternate owners
    running until timebox, no safe owner, hard blocker, or current risky packet
    must be quarantined
  - final handoff must include changed list, workflow slowdowns,
    needs-your-attention, stopping checkpoints, accepted deferrals, residual
    risks, exact commands, Browser screenshots/caveats, and next owner

Completion threshold:
- The loop runs until the 1h timebox expires after the current packet is
  kept/reverted/quarantined, or until no safe owner remains.
- At least one stable behavior proof packet is run across relevant desktop
  engines or explicitly blocked with exact command/error.
- At least one API/DX or oracle-gap scan packet is run and either kept,
  repaired, queued, or marked no-change with evidence.
- In-app Browser visual proof is attempted for representative stable routes or
  the plan records why behavior failures made it premature.
- Any safe bug/oracle/workflow miss found during the loop is patched and
  reverified; broader architecture is queued for `slate-plan`.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-stable-feature-validation-loop-2.md` passes.

Verification surface:
- `.tmp/slate-v2` focused Playwright suites for richtext, plaintext,
  markdown-shortcuts, editable-voids, custom-placeholder, hidden/dom coverage,
  history, and selection/navigation behavior.
- `.tmp/slate-v2` Bun/package tests and source scans for core API/DX and
  `slate-browser` oracle helpers when touched.
- In-app Browser proof for stable examples via Browser runtime, with route
  screenshots and console error counts.
- Parent repo source/mirror audit when `.agents/rules/**` changes, followed by
  `pnpm install`.
- `git diff --check` for touched parent/nested files.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-06-03-slate-automation-stable-feature-validation-loop-2.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: `.tmp/slate-v2` source/tests/examples for Slate runtime;
  `.agents/rules/**` for skills; generated `.agents/skills/**` only via
  `pnpm install`; active plan for run state.
- Allowed edit scope: safe runtime/test/oracle fixes in `.tmp/slate-v2`; safe
  `slate-browser` helper/API improvements; safe workflow rule fixes in
  `.agents/rules/**`; this plan.
- Browser surface: stable examples on `http://localhost:3100/examples/*`.
- Tracker sync: N/A, no issue/PR/tracker requested.
- Non-goals: commit/PR/push; broad pagination optimization; broad
  pagination/virtualization architecture; review-branch/finalizer flow.

Output budget strategy:
- Use focused `rg`, `sed`, Playwright `--grep`, capped output, and Browser JSON
  snapshots. Do not stream bundled/generated one-line files. Write long
  evidence to this plan instead of chat.

Blocked condition:
- Hard stop only for missing dev server/browser after retry, command/tool access
  that blocks all meaningful proof, unsafe API/runtime fork needing user taste,
  timebox expiration with current packet closed, or commit/PR/destructive
  authority.

Task state:
- task_type: slate-automation timed batch stable-feature validation
- task_complexity: major
- current_phase: intake
- current_phase_status: complete
- next_phase: implementation
- goal_status: active

Current verdict:
- verdict: proceed
- confidence: high
- next owner: slate-automation
- reason: explicit stable-feature batch loop with measurable behavior, Browser,
  API/DX, and workflow proof gates

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-03-slate-automation-stable-feature-validation-loop-2.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint extracted scope, non-goals, timebox, stop policy, deliverables, verification, and final handoff rows before implementation. |
| Skill analysis before edits | yes | Read `slate-automation` from user prompt, `slate-north-star`, and `autogoal`; first checkpoint follows their contracts. |
| Active goal checked or created | yes | `get_goal` returned null before plan creation; goal created after first checkpoint. |
| Source of truth read before edits | yes | Read north-star and generated plan; target source/tests will be read before any runtime/test patch. |
| Tracker comments and attachments read | N/A: no tracker | User provided prompt only. |
| Video transcript evidence required | N/A: no new video | No video attached to this loop. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: proof-first loop | Live source/tests decide current stable behavior; use past docs only if a bug points there. |
| TDD decision before behavior change or bug fix | yes | If a bug is found, reproduce with existing proof or add/repair oracle before/with patch. |
| Branch decision for code-changing task | N/A: stay current branch | User requested loop, no branch/PR. |
| Release artifact decision | yes | Default N/A unless public package behavior/API changes; package pack will classify any runtime/API diff. |
| Browser tool decision for browser surface | yes | Use in-app Browser via Browser runtime for visual smoke; use Playwright for replayable behavior proof. |
| PR expectation decision | N/A: no PR requested | No commit/push/PR. |
| Tracker sync expectation decision | N/A: no tracker | No sync. |
| Output budget strategy recorded | yes | Focused commands/capped outputs; no bundled one-line dumps. |
| Browser pack selected | yes | Browser pack generated in this plan. |
| Browser route / app surface identified | yes | Stable examples under `http://localhost:3100/examples/*`. |
| Browser tool decision recorded | yes | In-app Browser first for visual smoke, Playwright for replayable behavior. |
| Console/network caveat policy recorded | yes | Browser smoke records console error counts; deeper network audit only if route proof needs it. |
| Package/API pack selected | yes | Core API/DX and oracle helper quality are in scope. |
| Public surface or package boundary identified | yes | Core Slate package API/DX and `slate-browser` helpers if touched. |
| Release artifact path selected | yes | `N/A: no published user-visible delta` unless a public package behavior/API delta is created. |
| `changeset` skill loaded when `.changeset` is required | N/A: no changeset yet | Load only if a published package user-visible delta is introduced. |
| Barrel/export impact decision recorded | yes | No export/file-layout change planned; rerun decision if source moves/exports change. |
| Agent-native pack selected | yes | Skill repair is allowed if workflow misses recur. |
| Agent-facing action surface identified | yes | `.agents/rules/slate-automation.mdc` and generated `.agents/skills/slate-automation/SKILL.md`. |
| Source rule versus generated mirror boundary identified | yes | Patch `.agents/rules/**`, run `pnpm install`, audit generated mirror. |
| `agent-native-reviewer` loaded or waiver recorded | deferred | Load only if `.agents/**` changes in this loop. |

Work Checklist:
- [x] First checkpoint copied explicit prompt requirements into this plan before implementation.
- [x] Objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Stable behavior proof ran before runtime edits.
- [x] Runtime failures were reproduced with focused Playwright and temporary trace scripts before fixes.
- [x] Safe runtime bugs were patched at the Slate React ownership boundary.
- [x] Test/oracle changes were kept only when they matched the final runtime behavior; temporary oracle adjustment was reverted.
- [x] API/DX and package checks ran with package-owned commands.
- [x] In-app Browser visual proof ran after the runtime patch.
- [x] Agent workflow misses were patched in source rule files, generated mirror was synced, and discoverability was audited.
- [x] Temporary debug scripts were deleted before closeout.
- [x] Final handoff includes changed list, workflow slowdowns, needs-your-attention, and stopping checkpoints.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run stable behavior, Browser, package, and workflow proof | Focused Playwright failure set passed; broad stable sweep passed; Browser smoke passed; bun check passed. |
| Bug reproduced before fix | yes | Record failing tests or trace evidence | Broad sweep initially failed 6 stable tests; serial rerun reproduced focus/Firefox/IME failures; trace scripts isolated focus blur, Firefox DOM repair, and Chromium IME selection drift. |
| Targeted behavior verification | yes | Rerun exact failing lanes | `document-state` + `richtext` focused grep across chromium/firefox/webkit: 7 passed, 2 skipped; Chromium IME cluster: 4 passed. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `bun --filter slate-react typecheck` passed; `bun check` package/site/root typecheck passed. |
| Package exports or file layout changed | N/A | No export/file-layout change | Only existing Slate React runtime internals changed. |
| Package manifests, lockfile, or install graph changed | N/A | No nested package manifest or lockfile edit | Runtime source-only change in `.tmp/slate-v2`. |
| Agent rules or skills changed | yes | Run sync and audit source/mirror | `pnpm install` was run after `.agents/rules/slate-automation.mdc` changes; mirror has matching generated entries for command pitfalls and Browser fallback rules. |
| Workspace authority proof | yes | Run checks in owning workspaces | Slate runtime proof ran in `/Users/zbeyens/git/plate-2/.tmp/slate-v2`; skill proof ran in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | yes | Capture Browser proof | In-app Browser smoke visited richtext, plaintext, editable-voids, custom-placeholder, hidden-content-blocks, document-state. |
| Browser final proof | yes | Record screenshot or caveat | Screenshots saved under `.tmp/slate-v2/.tmp/slate-automation-smoke-loop-2-postfix/*.png`; all six routes visible, zero console errors. |
| CI-controlled template output changed | N/A | No template output in Slate v2 runtime packet | Parent autogoal template changes are earlier uncommitted work, not this runtime packet. |
| Package behavior or public API changed | yes | Classify artifact need | Published runtime behavior changed inside `slate-react`; no public API/type/export shape changed. |
| Registry-only component work changed | N/A | No registry work | No `apps/www/src/registry/**` edits. |
| Docs or content changed | yes | Verify source-backed plan only | This plan records evidence; no user-facing docs content changed. |
| High-risk mini gate | yes | Record failure mode and boundary | Failure mode: browser-native selection/input drift after blur or IME corrupts model insertion; boundary: Slate React runtime focus/composition/native repair, not example code. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and audit discoverability | `agent-native-reviewer` read; `rg` confirmed source and generated `slate-automation` both expose generic-contract, Browser virtual clipboard, fresh-tab, and broad-scan guidance. |
| Local install corruption suspected | N/A | Not suspected | Failures reproduced deterministically and fixed by runtime code; no reinstall signal. |
| Autoreview for non-trivial implementation changes | N/A | User previously stopped autoreviews | Replaced with focused proof, broad sweep, package check, Browser smoke, and diff hygiene. |
| PR create or update | N/A | No PR requested | No commit, push, or PR authority in this loop. |
| Task-style PR body verified | N/A | No PR body | No PR requested. |
| PR proof image hosting | N/A | No PR body | Local Browser screenshots recorded for handoff only. |
| Tracker sync-back | N/A | No tracker | User prompt only. |
| Final handoff contract | yes | Fill handoff fields | See final handoff contract below. |
| Final lint | yes | Run scoped equivalent | `bun check` passed after formatting fix; lint retained one unrelated pagination warning. |
| Output budget discipline | yes | Record command-output misses and fixes | Slowdown ledger records broad test-name scan, giant Browser error page, Browser virtual clipboard limitation, and source-map/bundle scan hazard. |
| Goal plan complete | yes | Run check-complete | To run after this plan update. |
| Browser interaction proof | yes | Exercise approved Browser surface | Browser visual smoke completed with in-app Browser; interaction behavior covered by Playwright. |
| Browser console/network check | yes | Record console state | Browser dev logs returned zero console errors on six routes. |
| Browser final proof artifact | yes | Record screenshots | `.tmp/slate-v2/.tmp/slate-automation-smoke-loop-2-postfix/*.png`. |
| Public API / package boundary proof | yes | Source-audit API impact | Changed files are Slate React runtime internals; no exports/barrels/files moved. |
| Release artifact classification | yes | Record exact reason | Published runtime behavior fix for Slate React; no public API shape or docs artifact. |
| Published package changeset | N/A | Continuous private alpha | No release/publish/PR was requested; do not raise changesets for ordinary Slate v2 automation loops. |
| Registry changelog | N/A | No registry-only work | No registry files changed. |
| No release artifact | yes | Record exact reason | Continuous private alpha; no release, publish, PR, or changeset step applies. |
| Package typecheck/build/test | yes | Run owning package checks | `bun --filter slate-react typecheck`, `bun --filter slate-react build`, `bun check` passed. |
| Barrel/export generation | N/A | No exports changed | No `pnpm brl` needed. |
| Agent source / generated sync | yes | Sync generated mirror | `pnpm install` completed after skill source edits; source and generated mirror contain matching guidance lines. |
| Agent action discoverability | yes | Audit skill text | `slate-automation` now names remaining-backlog, command pitfalls, Browser fallback, changed-list, and slowdown ledgers. |
| Agent-native review | yes | Close accepted findings | No new agent-native findings after source/mirror audit. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | First checkpoint extracted scope, non-goals, timebox, stop rules, handoff sections. | closed |
| Implementation | complete | Runtime focus/composition/native repair patched; slate-automation workflow rules patched. | closed |
| Verification | complete | Focused Playwright, broad stable sweep, Browser visual smoke, slate-react typecheck, bun check, diff-check all passed. | closed |
| PR / tracker sync | N/A | No PR, commit, push, or tracker requested. | closed |
| Closeout | complete | Plan ledger and handoff sections filled; check-complete is the final mechanical gate. | final response |

Findings:
- Stable sweep exposed real Slate React runtime regressions, not flakes: model selection after blur, Firefox multi-character native repair drift, Firefox input-intent drift, and Chromium IME composition drift.
- Chrome composition fallback needed captured model target plus explicit pending marks; implicit selection was too late, explicit text insert alone lost marks.
- Browser visual smoke is useful for layout/console proof but Browser typing is blocked by the missing virtual clipboard in this environment; Playwright remains the interaction oracle.

Packet Ledger:
| Packet | Owner | Failure / hypothesis | Files | Proof | Decision | Next |
|--------|-------|----------------------|-------|-------|----------|------|
| P1 stable proof | slate-automation | Validate stable examples before edits | no code | Initial focused packet: 79 passed, 11 skipped; extra selection/table: 56 passed, 7 skipped; query/prior failures: 31 passed, 5 skipped. | keep evidence | closed |
| P2 API/DX proof | package-api | Avoid bad runtime invocation of type-contract tests | no code | `bun --filter slate typecheck`; slate/slate-history/slate-browser contract tests: 457 pass; history contracts: 51 pass; slate-browser proof: 26 pass. | keep evidence | closed |
| P3 Browser smoke | browser | Representative routes must render visibly | screenshots | Postfix Browser smoke: six routes visible, zero console errors. | keep evidence | closed |
| P4 workflow repair | skill-repair | Automation loop wasted time on bad command shapes and Browser retries | `.agents/rules/slate-automation.mdc`, generated `SKILL.md` | `pnpm install`; mirror rg audit; agent-native audit. | keep | closed |
| P5 focus blur repair | slate-react | Blur to external input made later model insert use stale DOM selection | `runtime-focus-mouse-events.ts` | Focus-leaves editor test passed across chromium/firefox/webkit in focused rerun. | keep | closed |
| P6 native text repair target | slate-react | Firefox multichar input and input-intent used post-mutation DOM offset | `input-router.ts`, `runtime-before-input-events.ts` | Firefox Cyrillic and input-intent tests passed; broad stable sweep passed. | keep | closed |
| P7 Chrome IME fallback | slate-react | Composition fallback drifted selection or lost marks | `composition-state.ts` | Chromium IME cluster 4 passed; broad stable sweep passed. | keep | closed |
| P8 temporary traces | debug | Needed root-cause proof | deleted `.tmp/debug-*.mjs` | Scripts removed before closeout. | revert temp artifacts | closed |

Changed list:
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-focus-mouse-events.ts`: mark model selection as authoritative when focus leaves the editor; sync programmatic focus selection across microtask/timer.
- `.tmp/slate-v2/packages/slate-react/src/editable/input-router.ts`: added runtime-selection repair target for model-owned native text repair.
- `.tmp/slate-v2/packages/slate-react/src/editable/runtime-before-input-events.ts`: uses runtime-selection repair target for non-native beforeinput repair.
- `.tmp/slate-v2/packages/slate-react/src/editable/composition-state.ts`: captured Chrome composition target, explicit pending-mark insertion, stronger unmanaged composition DOM cleanup.
- `.agents/rules/slate-automation.mdc` and generated `.agents/skills/slate-automation/SKILL.md`: added command pitfalls and Browser fallback guidance discovered by this loop.
- `docs/plans/2026-06-03-slate-automation-stable-feature-validation-loop-2.md`: this evidence and ledger.

Workflow slowdowns:
- Bad package command: running `generic-*-contract.ts` through `bun test` executes type-only expectations; skill now says use package typecheck for those files.
- Broad output hazard: broad test-name/source scans streamed too much; skill now says use curated files/targeted greps/artifacts.
- Browser error-page hazard: Browser can return a giant encoded error page after a refused route; skill now says retry once in a fresh in-app Browser tab and catch per-route errors.
- Browser typing limitation: Browser typing failed because the virtual clipboard is not installed; skill now says use Browser for visual/console and Playwright for interactions.
- Source-map/bundle scan hazard: broad rg over built one-line maps/bundles is noisy; current run avoided using that as proof after the miss.

Verification evidence:
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/document-state.test.ts playwright/integration/examples/richtext.test.ts --project=chromium --project=firefox --project=webkit --grep "keeps model selection when focus leaves editor|keeps Cyrillic input stable with spellcheck enabled|exposes input intent for start insert, number insert, and delete|commits IME composition inside bold markup"`: 7 passed, 2 skipped.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "commits IME composition inside bold markup|commits IME composition through an active mark in an empty block|commits IME composition through an active mark before a formatted sibling|replaces multiple formatted text nodes with Korean IME composition"`: 4 passed.
- `PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=2 bun playwright <stable-example-set> --project=chromium --project=firefox --project=webkit --reporter=dot`: 452 passed, 52 skipped.
- `bun --filter slate-react typecheck`: passed.
- `bun --filter slate-react build`: passed after runtime edits.
- `bun check`: passed; lint retained one unrelated pagination warning at `site/examples/ts/pagination.tsx:1855`.
- In-app Browser smoke: richtext, plaintext, editable-voids, custom-placeholder, hidden-content-blocks, document-state all visible, zero console errors; screenshots at `.tmp/slate-v2/.tmp/slate-automation-smoke-loop-2-postfix/*.png`.
- `git diff --check` in parent repo and `.tmp/slate-v2`: passed.

Needs your attention:
- The runtime packet is worth review because it changes low-level focus, beforeinput repair, and Chrome composition fallback in Slate React.
- Parent repo dirty state is intentionally ignored for Slate v2 automation handoffs unless the current work explicitly owns Slate-v2-related `docs/**` artifacts.
- The unrelated pagination hook warning remains in `bun check`; it did not fail the gate and was outside this stable-feature scope.

Stopping checkpoints:
- No hard blocker remains for the stable Slate v2 validation loop.
- Broad pagination/virtualization architecture stayed out of scope; route future pagination behavior/perf questions to `slate-plan` or the pagination-specific automation target.
- Current state remains continuous private alpha; no release, publish, PR, or changeset next step.

Decisions and tradeoffs:
- Fixed the runtime boundary instead of patching examples because failures were in selection ownership and native input repair.
- Kept Playwright as the interaction oracle because Browser typing is blocked locally; used Browser for visual and console proof.
- Did not start pagination/virtualization optimization because the prompt explicitly scoped it out.

Implementation notes:
- The Chrome IME fix uses explicit node insertion with pending marks when marks exist; otherwise it uses an explicit captured target for plain text.
- The Firefox repair fix prefers runtime selection only in the model-owned beforeinput repair path; normal DOM input repair remains DOM-first.
- Blur-to-external-control sets model selection preference so subsequent programmatic focus/input uses the model caret.

Review fixes:
- Fixed formatter output after the first `bun check` attempt.
- Reverted temporary IME oracle relaxation after the runtime fix restored the stricter split-leaf behavior.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Browser smoke variable collision | 1 | Reuse scratch variable names in persistent browser session | Browser smoke passed. |
| Wrong Playwright base URL in temp script | 1 | Set `PLAYWRIGHT_BASE_URL=http://localhost:3100` | Trace scripts ran. |
| First `bun check` formatter failure | 1 | Apply formatter shape manually | `bun check` passed. |
| Explicit composition `at` lost marks | 1 | Insert explicit text node with pending marks | IME cluster and broad sweep passed. |
| Implicit composition insert drifted selection | 1 | Capture target and avoid live-selection fallback | IME cluster and broad sweep passed. |

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker requested.
- Confidence line: high for stable-scope private-alpha keep; release readiness is not part of this loop.
- Flow table:
  - Reproduced: broad stable sweep failed before fixes; focused reruns isolated focus, Firefox native repair, and Chromium IME paths.
  - Verified: broad stable sweep, focused failures, Browser visual smoke, package checks, and diff checks passed.
- Browser check: six representative stable examples visible with zero console errors; screenshots saved under `.tmp/slate-v2/.tmp/slate-automation-smoke-loop-2-postfix/*.png`.
- Outcome: stable Slate v2 loop found and fixed real runtime regressions plus automation workflow misses.
- Caveat: no commit/PR/release artifact made or needed for private alpha; pagination optimization intentionally untouched.
- Design:
  - Chosen boundary: Slate React runtime focus/composition/native repair and slate-automation workflow source.
  - Why not quick patch: examples were only exposing runtime ownership bugs.
  - Why not broader change: pagination/virtualization architecture was outside prompt scope.
- Verified: see verification evidence above.
- PR body verified: N/A, no PR.

Task-style PR body contract:
- N/A: no PR requested in this loop.

Final handoff / sync:
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: `.tmp/slate-v2/.tmp/slate-automation-smoke-loop-2-postfix/*.png`.
- Caveats: current state is private alpha; parent repo dirty state ignored except current Slate-v2-related `docs/**` artifacts.

Timeline:
- 2026-06-03T16:25:26.948Z Task goal plan created.
- 2026-06-03T18:25:31+0200 First checkpoint extracted all prompt requirements before implementation.
- 2026-06-03T19:10+0200 Stable browser sweep, package checks, Browser smoke, and diff hygiene completed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete for stable Slate v2 validation loop 2. |
| Where am I going? | Final response after check-complete and stopping the dev server. |
| What is the goal? | Validate stable Slate v2 features/API/DX with automation, patch safe regressions/workflow misses, and hand off proof. |
| What have I learned? | Stable bugs were in Slate React selection/native input ownership; automation needed stronger command/Brower pitfalls. |
| What have I done? | Patched runtime, patched slate-automation guidance, ran focused/broad/browser/package proof, recorded ledger. |

Open risks:
- No known unclosed P0/P1 stable-scope regression from this loop.
- Release readiness is intentionally out of scope; current state is continuous private alpha.
- Pagination/virtualization architecture remains intentionally out of scope.
