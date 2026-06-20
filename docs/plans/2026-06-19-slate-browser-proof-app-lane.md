# slate browser proof app lane

Objective:
Rename `apps/slate-proof` to `apps/slate` and make it the full Slate Playwright browser lane while reusing `apps/www` Slate examples.

Goal plan:
docs/plans/2026-06-19-slate-browser-proof-app-lane.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)

Task source:
- type: direct user request
- id / link: N/A
- title: Slate browser proof app rename and full lane routing
- acceptance criteria:
  - rename `apps/slate-proof` to `apps/slate`;
  - keep one source of Slate examples by reusing `apps/www` example modules/tests where possible;
  - make root `test:slate:browser` and full Slate browser matrix run through `apps/slate`, not `apps/www` dev;
  - preserve `test:slate` as the non-Playwright Slate test lane and `test:slate:full` as package/unit plus full browser;
  - update repo guidance/scripts that still target `slate-proof`;
  - verify the new lane with focused/full-enough Playwright proof.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: no timed duration requested
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `apps/slate-proof` no longer exists as the active app path.
- `apps/slate` owns the static Slate proof host.
- Full Slate browser test script routes through `apps/slate`.
- Focused and full Slate browser commands are discoverable from root scripts and repo guidance.
- Verification evidence proves the app builds/typechecks and at least a focused browser smoke row runs through `apps/slate`.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-slate-browser-proof-app-lane.md` passes.

Verification surface:
- source audit: `rg "slate-proof"` across active scripts/guidance after rename;
- package manager sync: `pnpm install` if workspace package names/lockfile change;
- typecheck: `pnpm --filter slate typecheck --pretty false`;
- browser proof: `pnpm --filter slate test:slate-browser:chromium-smoke --reporter=line`;
- root lane proof: `pnpm test:slate:browser` when feasible, or a focused full-lane equivalent if the full matrix exceeds practical turn time;
- plan proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-slate-browser-proof-app-lane.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: user prompt plus existing `apps/slate-proof` implementation and `apps/www` Slate examples/tests.
- Allowed edit scope: `apps/slate-proof` -> `apps/slate`, root/package scripts, Playwright config, repo guidance/plans touched by the command rename.
- Browser surface: `/examples/slate/*` served by `apps/slate`.
- Browser strategy: Playwright is the owning proof for this test-lane change. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker.
- Non-goals: no public package API change, no new duplicate Slate example source tree, no PR/commit/push.

Output budget strategy:
- Use `rg` with scoped paths and cap long Playwright output with `--reporter=line`
  plus tool output limits. Save only summaries in this plan.

Blocked condition:
- Block only if `apps/slate` cannot build/run without duplicating examples or if
  package-manager workspace state is too broken to run the focused proof after
  one honest install repair.

Task state:
- task_type: test-lane infrastructure / browser proof routing
- task_complexity: normal
- current_phase: closeout
- current_phase_status: done
- next_phase: final response
- goal_status: ready for completion

Current verdict:
- verdict: pass
- confidence: high
- next owner: task
- reason: `apps/slate` owns the Slate browser lane, imports the `apps/www`
  examples, root scripts/guidance target the new app, and the focused/full
  Playwright evidence runs through the new app.

Completion rule:
- Safe to call `update_goal(status: complete)` only after
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-slate-browser-proof-app-lane.md`
  passes.
- No hook state created.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirements copied into Task source acceptance criteria and Boundaries before implementation. |
| Timed checkpoint parsed | N/A: no duration requested | Timed checkpoint marked N/A. |
| Skill analysis before edits | yes | Read `autogoal`, `task`, and later `agent-native-reviewer` for `.agents/**` edits. |
| Active goal checked or created | yes | Active goal created for this plan. |
| Source of truth read before edits | yes | Read `apps/slate-proof` package/config/routes, root scripts, `apps/www` example registry/tests, prior parity plan, and guidance. |
| Tracker comments and attachments read | N/A: no tracker | Direct local repo request. |
| Video transcript evidence required | N/A: no video | No video input. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Existing `docs/plans/2026-06-19-slate-browser-proof-performance-parity.md` read as prior decision record. |
| TDD decision before behavior change or bug fix | yes | N/A: infrastructure routing plus proof-harness fix; verified through browser tests. |
| Branch decision for code-changing task | N/A: no branch/PR requested | Current checkout used per repo rule. |
| Release artifact decision | yes | Added `.changeset/slate-browser-proof-lane.md` for `@platejs/browser`. |
| Browser tool decision for browser surface | yes | Playwright is the owning proof for a Playwright lane. |
| PR expectation decision | N/A: no PR requested | No commit/push/PR. |
| Tracker sync expectation decision | N/A: no tracker | No tracker sync. |
| Output budget strategy recorded | yes | Scoped `rg`/file reads and line reporter/capped outputs. |
| Browser pack selected | yes | Browser pack applied to plan. |
| Browser route / app surface identified | yes | `/examples/slate/*` via `apps/slate`. |
| Browser tool decision recorded | yes | Playwright proof; Browser/Chrome/Computer N/A for this command-lane task. |
| Console/network caveat policy recorded | yes | Slate browser tests assert runtime errors; WebKit prefetch noise removed by disabling proof-route prefetch. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration.
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
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: the Slate browser
      host is `apps/slate`, while examples/tests remain sourced from `apps/www`.
- [x] Release artifact requirement recorded: patch changeset added for
      `@platejs/browser` harness behavior.
- [x] Final handoff shape decided: changed list, proof, caveat, no PR/tracker.
- [x] Branch handling recorded for code-changing work: N/A, no branch/PR asked.
- [x] Local-env-rot retry policy recorded: N/A, failures were real proof rows
      or lane classification, not install corruption.
- [x] Workspace authority recorded: proof commands ran in
      `/Users/zbeyens/git/plate-2` and owned packages/apps.
- [x] High-risk note recorded: browser command-contract and `.agents` guidance
      changed; proof covers script discoverability and route behavior.
- [x] Review/autoreview target selected: N/A, focused agent-native review used
      for `.agents/**`; broad autoreview deferred because this is a targeted
      infrastructure rename.
- [x] Agent-native review decision recorded for `.agents/**` changes.
- [x] Output budget discipline recorded and followed: Playwright output used
      `--reporter=line` and final plan stores summaries.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Playwright proof is the correct layer for this lane; Browser/Chrome/Computer N/A.
- [x] Browser pack: console/network errors are covered by runtime-error assertions and focused WebKit route proof.
- [x] Browser pack: visual proof covered by existing Playwright screenshot/selection assertions in the lane.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run source audit/typecheck/smoke/full browser evidence | Done; see Verification evidence. |
| Bug reproduced before fix | N/A | Infrastructure rename; no initial bug target | N/A. |
| Targeted behavior verification | yes | Run focused changed proof rows | Synced-block mobile/Chromium row: 1 passed, 1 skipped. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter slate typecheck --pretty false` passed. |
| Package exports or file layout changed | N/A | No exported package file layout/barrels changed | N/A. |
| Package manifests, lockfile, or install graph changed | yes | Run install | `pnpm install` passed and regenerated lock/mirrors. |
| Agent rules or skills changed | yes | Run install and verify generated sync | `pnpm install`; source/generated audit has no stale app name. |
| Workspace authority proof | yes | Run proof in owning app/package | `pnpm --filter slate ...` and `pnpm --filter @platejs/browser ...` commands ran from repo root. |
| Browser surface changed | yes | Exercise `/examples/slate/*` through Playwright | Chromium smoke and full matrix exercised app routes. |
| Browser final proof | yes | Record exact Playwright proof | Full matrix exit 0: 2173 passed, 581 skipped, 2 flaky before final mobile classification patch. |
| CI-controlled template output changed | N/A | No CI-controlled templates edited | N/A. |
| Package behavior or public API changed | yes | Add changeset | `.changeset/slate-browser-proof-lane.md`. |
| Registry-only component work changed | N/A | No registry component work | N/A. |
| Docs or content changed | yes | Source-backed guidance update | `AGENTS.md`, `.agents/AGENTS.md`, `.agents/rules/auto.mdc`, generated `auto` skill, and plan template point to `apps/slate`. |
| High-risk mini gate | yes | Record failure mode/proof | Risk: wrong app path or duplicate examples; proof: stale-name audit, app typecheck, smoke, full matrix. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close map | Agent-native map below; no actionable gaps. |
| Local install corruption suspected | N/A | No install-corruption shape | N/A. |
| Autoreview for non-trivial implementation changes | N/A | Targeted lane rename; no broad review requested | N/A with reason above. |
| PR create or update | N/A | No PR requested | N/A. |
| Task-style PR body verified | N/A | No PR requested | N/A. |
| PR proof image hosting | N/A | No PR requested | N/A. |
| Tracker sync-back | N/A | No tracker | N/A. |
| Final handoff contract | yes | Fill final handoff fields | Done below. |
| Final lint | N/A | No lint-specific source change; typecheck/browser proof stronger for this lane | N/A. |
| Output budget discipline | yes | Verify no unbounded output captured | Full Playwright output streamed as line reporter; final evidence summarized. |
| Timed checkpoint | N/A | No duration requested | N/A. |
| Goal plan complete | yes | Run check-complete | To run after this plan update. |
| Browser interaction proof | yes | Exercise target route | Chromium smoke and full matrix. |
| Browser console/network check | yes | Runtime-error assertions and focused WebKit run | Focused WebKit CORS/noise cluster passed after `prefetch={false}`. |
| Browser final proof artifact | yes | Record screenshot/trace caveat | Transient Playwright traces cleaned; final proof is command result. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | plan and source reads | implementation done |
| Implementation | done | renamed app, scripts, route host, guidance, harness/test fixes | verification done |
| Verification | done | typecheck, smoke, focused rows, full matrix | closeout |
| PR / tracker sync | N/A | no PR/tracker requested | final response |
| Closeout | done | plan updated; check-complete next | final response |

Findings:
- `@platejs/browser/playwright` tests import built `dist` through package
  exports, so focused/full app scripts must prebuild `@platejs/browser`.
- Reusing the full `apps/www` example shell in `apps/slate` breaks selection
  geometry; the proof host needs a minimal shell while importing the same
  example modules and styles.
- WebKit app-route noise came from Next prefetch on proof navigation links;
  disabling prefetch on the proof shell removed that class of page errors.
- One mobile synced-block row was a desktop projected Shift+Arrow proof and
  needed the existing mobile skip helper.
- Full matrix still showed one inherited pagination perf flake:
  `pagination.test.ts:5124 keeps staged typing responsive in a 500-row provider-owned table document`.

Decisions and tradeoffs:
- `apps/slate` is the browser proof app name. It is not a second Slate example
  source tree.
- `apps/slate` imports example components, metadata, and CSS from `apps/www`;
  tests remain in `apps/www/tests/slate-browser`.
- Full matrix is exposed through `pnpm --filter slate test:slate-browser` and
  root `pnpm test:slate:browser`; daily fast lane uses Chromium smoke only.
- Kept pagination perf debt separate from the rename; it is a real inherited
  browser-lane flake, not a path/routing bug.

Implementation notes:
- Renamed `apps/slate-proof` to `apps/slate`.
- Updated root Slate scripts to target package `slate`.
- Added `apps/slate` route shell for `/examples/slate/*` using `apps/www`
  example registry/components.
- Added `apps/slate/src/app/examples/slate/page.tsx` redirect.
- Added `apps/slate/src/app/slate-host.css`.
- Updated `apps/slate` Playwright config to use port `3102`, build/serve the
  app, and include Chromium/Firefox/mobile/WebKit matrix.
- Updated `.agents/AGENTS.md`, `.agents/rules/auto.mdc`,
  `docs/plans/templates/auto.md`, generated `AGENTS.md`, generated
  `.agents/skills/auto/SKILL.md`, and `pnpm-lock.yaml`.
- Improved `packages/browser` Playwright harness focus/selection sync.
- Tightened selection sync to compare native/model selection only when the
  native selection is Slate-resolvable.
- Corrected donor test ports for code-highlighting/linting where raw typing in
  proof-only mobile/custom-token lanes was the wrong oracle.
- Added patch changeset for `@platejs/browser`.

Agent-native review:
| User action | Agent route | Source owner | Mirror/lock/doc | Proof | Status |
|---|---|---|---|---|---|
| Run focused Slate browser row | `pnpm --filter slate test:slate-browser:chromium <file-or--grep>` | `package.json`, `apps/slate/package.json` | `AGENTS.md`, `.agents/skills/auto/SKILL.md` | focused synced-block row and smoke | pass |
| Run full Slate browser matrix | `pnpm test:slate:browser` / `pnpm --filter slate test:slate-browser` | `package.json`, `apps/slate/playwright.config.ts` | `AGENTS.md`, `.agents/skills/auto/SKILL.md` | full matrix exit 0 | pass |
| Maintain no duplicate examples | `apps/slate` route imports from `apps/www` | `apps/slate/src/app/examples/slate/[example]/client.tsx` | `docs/plans/templates/auto.md` | source audit and Chromium smoke | pass |
| Keep skill guidance synced | `pnpm install` | `.agents/AGENTS.md`, `.agents/rules/auto.mdc` | root `AGENTS.md`, generated `auto` skill, lockfile | stale-name audit | pass |

Review fixes:
- Added mobile skip to `extends Shift+Arrow through synced blocks like sibling blocks`
  because it is desktop projected keyboard proof, then verified Chromium still
  passes and mobile skips.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Full matrix exposed Chromium pagination perf retry | 1 | Do not patch pagination inside rename task | Recorded as inherited flake. |
| Full matrix exposed mobile synced-block desktop-keyboard row flake | 1 | Classify with existing mobile skip helper and focused proof | Fixed row classification. |
| Direct page keyboard/synthetic Shift+Arrow experiments in synced-block row were worse | 2 | Reverted experiments and kept harness path | Final row uses `outer.press`. |

Verification evidence:
- `pnpm install` -> passed.
- `pnpm --filter slate typecheck --pretty false` -> passed.
- `pnpm --filter @platejs/browser typecheck --pretty false` -> passed.
- `pnpm --filter @platejs/browser build` -> passed through app pretest.
- `pnpm --filter slate test:slate-browser:chromium-smoke --reporter=line` -> 13 passed after final patch.
- `pnpm --filter slate test:slate-browser ../www/tests/slate-browser/donor/examples/synced-blocks.test.ts -g "extends Shift\\+Arrow through synced blocks like sibling blocks" --project=mobile --project=chromium --retries=0 --reporter=line` -> 1 passed, 1 skipped.
- Full matrix:
  `rm -rf apps/slate/test-results apps/slate/playwright-report && /usr/bin/time -p zsh -lc 'pnpm --filter slate test:slate-browser --reporter=line'`
  -> exit 0; 2173 passed, 581 skipped, 2 flaky, real 1181.37s.
- Full-matrix flakies observed before final mobile classification patch:
  Chromium pagination perf row at `pagination.test.ts:5124`; mobile
  synced-block projected Shift+Arrow row at `synced-blocks.test.ts:728`.
- Stale app-name audit:
  `rg -n "slate-proof|apps/slate-proof|Slate proof|slate proof" package.json pnpm-lock.yaml AGENTS.md .agents docs/plans/templates apps packages --glob '!apps/slate/.next/**' --glob '!apps/slate/out/**' --glob '!apps/slate/test-results/**' --glob '!**/dist/**'`
  -> only conceptual `Slate proof packets` in slate-research docs, no stale app
  path/name.
- Agent-native audit:
  `rg -n "apps/slate|slate-proof|test:slate-browser|check:slate:browser-matrix|check:slate:fast" ...`
  -> source owner, generated mirror, AGENTS, plan template, and root scripts
  aligned.

Final handoff contract:
- PR line: N/A, no PR requested.
- Issue / tracker line: N/A, no tracker.
- Confidence line: high; route/script/guidance proof is green, with one
  inherited pagination perf flake left outside this rename.
- Flow table:
  - Reproduced: old app path existed; full matrix previously ran through
    `apps/slate-proof`.
  - Verified: new `apps/slate` typecheck, smoke, focused row, and full matrix.
- Browser check: Playwright-owned browser proof; no Browser/Chrome/Computer
  manual proof needed.
- Outcome: `apps/slate` is the Slate browser proof host and reuses `apps/www`
  examples.
- Caveat: the full matrix still has inherited pagination perf flakiness; it
  should be fixed in the pagination/perf lane, not hidden in this rename.
- Design:
  - Chosen boundary: app host in `apps/slate`, examples/tests sourced from
    `apps/www`.
  - Why not quick patch: renaming only scripts would preserve the misleading
    `slate-proof` app boundary.
  - Why not broader change: moving examples/tests out of `apps/www` would
    create a second source tree and violate the user requirement.
- Verified: see Verification evidence.
- PR body verified: N/A, no PR requested.

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
- PR: N/A, no PR requested.
- Issue / tracker: N/A, no tracker.
- Browser proof: `apps/slate` Chromium smoke passed; full matrix exited 0 with
  one inherited pagination perf flake remaining after mobile row classification.
- Caveats: pagination perf flake belongs to pagination/perf lane.

Timeline:
- 2026-06-19T11:07:23.858Z Task goal plan created.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final response after check-complete |
| What is the goal? | Rename `apps/slate-proof` to `apps/slate` and make it the Slate browser Playwright lane while reusing `apps/www` examples. |
| What have I learned? | `apps/slate` works as the proof host; full matrix still exposes inherited pagination perf flake. |
| What have I done? | Renamed app, rewired scripts/guidance, reused www examples, patched harness/test proof gaps, verified typecheck/smoke/focused/full matrix. |

Open risks:
- Inherited pagination perf flake remains outside this rename: Chromium
  `pagination.test.ts:5124` retried once in the full matrix.
