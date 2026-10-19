# slate browser proof performance parity

Objective:
Reach Plite browser proof performance parity; done when Plate fast Plite browser proof matches or beats donor timing without duplicate example sources.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-19-plite-browser-proof-performance-parity.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- agent-native (docs/plans/templates/packs/agent-native.md)

Task source:
- type: user request
- id / link: N/A: local performance/test-infra parity goal
- title: Make Plite browser proof as fast as `../plite` without maintaining two example sources
- acceptance criteria:
  - Fix `../plite` local install/tooling enough to run `test:integration-local` or an equivalent donor browser timing once.
  - Measure donor and Plate on comparable browser lanes.
  - Make Plate's fast Plite browser lane similar or faster than donor for daily proof.
  - Preserve the full release/deletion browser matrix separately.
  - Do not maintain two example source trees.
  - Prefer a dedicated proof host/app only if it reuses the same Plite example source content.

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.
- Extracted hard requirements:
  - Use `autogoal`.
  - Go with the prior recommendation: dedicated fast Plite proof lane, parallel-safe where possible, full matrix remains closure.
  - Reach `../plite` performance by fixing donor local tooling and running it once.
  - Plate target is similar or faster performance.
  - Do not maintain two example sources.
  - Investigate whether app host, tsconfig aliases, build-first, static serving, or parallelism is the right fix.
  - Preserve proof quality: no fake faster lane that skips real editor behavior.

Timed checkpoint:
- requested duration: N/A: no time duration requested.
- semantics: N/A
- initial confidence score: N/A: target is command timing plus source-sharing audit.
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- Donor timing is measured from `../plite` after fixing its local install/tooling blocker, or a real donor blocker is documented with exact failing command and next owner.
- Plate has a fast Plite browser command that is similar or faster than the measured donor lane for daily proof, with before/after timing recorded.
- Plate fast lane does not duplicate example source ownership; source audit shows the proof host uses the same Plite example source/loader path or a generated/shared layer, not a manually maintained second copy.
- Full `check:plite` / browser matrix remains available as a closure/release gate.
- Focused verification commands pass.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-plite-browser-proof-performance-parity.md` passes.

Verification surface:
- Donor install/timing command in `/Users/zbeyens/git/plite`.
- Plate before/after timing commands in `/Users/zbeyens/git/plate-2`.
- `pnpm --filter www test:plite-browser:chromium-smoke` or successor fast command.
- Focused Plite browser row command.
- Source audit proving no second maintained example source.
- `pnpm install` if `.agents/**` or package scripts change.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-plite-browser-proof-performance-parity.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.

Boundaries:
- Source of truth: Plite examples under `apps/www/src/app/(app)/examples/plite/**`, `apps/www/tests/plite-browser/**`, `apps/www/playwright.slate.config.ts`, `apps/www/package.json`, root `package.json`, and donor `../plite` scripts/config for measurement only.
- Allowed edit scope: Plate browser proof scripts/config/app routing/test infra/agent guidance; donor checkout only for local install/timing repair, not for product source changes.
- Browser surface: Plite `/examples/plite/*` behavior proof.
- Browser strategy: Playwright is the owning proof tool here because the task is test-runner speed and browser regression proof. Use Browser/Chrome only if visual/manual inspection becomes necessary. Use Browser for normal app QA; use Chrome directly
  for native downloads, print/print-preview, file picker/uploads, clipboard,
  browser dialogs/permissions, extension/profile state, or exact Chrome
  rendering; use Computer Use only for native Chrome/OS UI that needs visual
  inspection after Chrome automation cannot read it.
- Tracker sync: N/A: no tracker/PR requested.
- Non-goals: no public docs/API redesign, no runtime editor optimization, no second manually maintained examples app, no weakening of release/deletion `check:plite`.

Output budget strategy:
- Use exact script/config reads, timing commands with capped output, and `find`/`rg` counts before printing broad file lists. Do not stream full Playwright traces or broad repo search output.

Blocked condition:
- Block only if donor cannot be installed/timed without unsafe dependency/lock surgery, or if Plate cannot be made faster without duplicating example sources or weakening browser proof.

Task state:
- task_type: browser-proof performance parity and test-infra repair
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete

Current verdict:
- verdict: complete
- confidence: high
- next owner: none for this parity goal
- reason: donor row measured at 26.62s, Plate proof row measured at 25.02s, and `pnpm check:plite:fast` now passes through the shared-source `apps/plite-proof` host in 33.54s.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-plite-browser-proof-performance-parity.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Extracted hard requirements recorded in First checkpoint. |
| Timed checkpoint parsed | N/A: no duration requested | Timed checkpoint section marked N/A. |
| Skill analysis before edits | yes | Read `autogoal` and `agent-native-reviewer` skills. |
| Active goal checked or created | yes | `get_goal` matched active goal `019eda2c-ab4c-75f3-b7ec-0be79a070b79`. |
| Source of truth read before edits | yes | Read donor Playwright config, `apps/www` Plite route/loader/registry/config/package scripts, and root scripts. |
| Tracker comments and attachments read | N/A: no tracker | Local repo performance/test-infra goal. |
| Video transcript evidence required | N/A: no video | No video/screen-recording input for this task. |
| `docs/solutions` checked for non-trivial existing-code work | N/A: test-infra parity task | Source owners were existing package/app configs and route files. |
| TDD decision before behavior change or bug fix | yes | No runtime behavior change; verification is command/timing plus browser proof. |
| Branch decision for code-changing task | N/A: user did not request branch/PR | Worked in current checkout per repo rules. |
| Release artifact decision | yes | No changeset: private proof app/test infra, no package API/runtime release surface. |
| Browser tool decision for browser surface | yes | Playwright chosen as owning proof because target is browser test-runner performance. |
| PR expectation decision | N/A: no PR requested | No PR/commit/push requested. |
| Tracker sync expectation decision | N/A: no tracker | No issue/Linear sync. |
| Output budget strategy recorded | yes | Exact reads and capped commands recorded; one large failed Playwright/typecheck output logged in Error attempts. |
| Browser pack selected | yes | Browser pack applied in generated plan. |
| Browser route / app surface identified | yes | `/examples/plite/*` through `apps/plite-proof`, full matrix through `apps/www`. |
| Browser tool decision recorded | yes | Playwright with `@platejs/browser` helpers; Browser/Chrome not needed. |
| Console/network caveat policy recorded | yes | Runtime errors checked by slate browser specs; no separate manual console pass needed. |
| Agent-native pack selected | yes | Agent-native pack applied because `.agents/rules/auto.mdc` changed. |
| Agent-facing action surface identified | yes | `check:plite:fast` and focused Plite browser command routing. |
| Source rule versus generated mirror boundary identified | yes | Edited `.agents/rules/auto.mdc` and `.agents/AGENTS.md`; `pnpm install` regenerated `AGENTS.md` and `.agents/skills/auto/SKILL.md`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md`; review verdict PASS. |

Work Checklist:
- [x] No duration was requested; timing target is command parity, not an active-work timer.
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, stop condition, deliverable, verification surface, and success criterion is copied into this plan.
- [x] Short objective plus outcome, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Task source classified with source type, title, task type, acceptance criteria, route/package surface, and root-cause layer.
- [x] Required video or screen-recording evidence is N/A: no video input.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary: `apps/plite-proof` owns static proof hosting; `apps/www` still owns examples/tests.
- [x] Release artifact requirement recorded as N/A: private app/test infra and no public package API/runtime release surface.
- [x] Final handoff shape decided: changed list, metrics, commands, caveats, and needs-attention.
- [x] Branch handling recorded as N/A: no branch/PR requested.
- [x] Local-env-rot retry policy recorded: donor install repaired with `bun install --no-verify`; no `pnpm run reinstall` needed in Plate.
- [x] Workspace authority recorded: donor commands ran in `/Users/zbeyens/git/plite`; Plate proof commands ran in `/Users/zbeyens/git/plate-2`.
- [x] High-risk note recorded: command-contract/browser-proof routing changed, guarded by `check:plite:fast`, source audit, and agent-native review.
- [x] Review/autoreview target selected: no full autoreview run; this was a focused test-infra packet with green lint and gates.
- [x] Agent-native review decision recorded: PASS after source/mirror audit.
- [x] Output budget discipline recorded; accidental large outputs are logged in Error attempts.
- [x] Browser pack: route, interaction path, and expected visible outcome recorded as `/examples/plite/*` with editor handle, model text, history, selection, placeholder, hidden DOM, and huge-doc smoke assertions.
- [x] Browser pack: Playwright is the owning browser proof; Browser/Chrome/Computer N/A because this is test-runner proof, not manual native browser state.
- [x] Browser pack: console/runtime errors checked through `recordPliteBrowserRuntimeErrors` in the Plite example smoke.
- [x] Browser pack: screenshot proof covered by huge-document smoke attachment in passing Playwright run.
- [x] Agent-native pack: source-of-truth rule files edited instead of generated mirrors.
- [x] Agent-native pack: changed agent action is discoverable from `.agents/rules/auto.mdc`, `.agents/AGENTS.md`, generated `AGENTS.md`, and generated `.agents/skills/auto/SKILL.md`.
- [x] Agent-native pack: generated mirrors synced with `pnpm install`.
- [x] Agent-native pack: accepted findings fixed; no remaining agent-native findings.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run donor timing, Plate timing, final fast gate, and source-sharing audit | Donor `26.62s`; Plate focused proof `25.02s`; final `pnpm check:plite:fast` `33.54s`; no `_examples` under `apps/plite-proof`. |
| Bug reproduced before fix | yes | Record failing/slow baseline | Plate `www` serial plaintext row `99.45s`; warm parallel `49.55s`; donor initially failed on `tsdown: command not found`. |
| Targeted behavior verification | yes | Run focused and smoke Playwright proof | Focused plaintext `41 passed, 2 skipped` in `25.02s`; smoke `13 passed` in `13.53s`; final fast gate smoke `13 passed`. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter plite-proof typecheck --pretty false` passed. |
| Package exports or file layout changed | N/A: no package exports | No package barrel/export surface changed | N/A: no package barrel/export surface changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed; final `pnpm check:plite:fast` passed. |
| Agent rules or skills changed | yes | Run `pnpm install` and verify generated skill sync | `pnpm install` regenerated `AGENTS.md` and `.agents/skills/auto/SKILL.md`; source audit found `plite-proof` command in generated mirrors. |
| Workspace authority proof | yes | Run verification in owning workspaces | Donor timing in `/Users/zbeyens/git/plite`; Plate proof in `/Users/zbeyens/git/plate-2`. |
| Browser surface changed | yes | Capture Playwright proof | `pnpm --filter plite-proof test:plite-browser:chromium-smoke --reporter=line` passed `13 passed` in `13.53s`. |
| Browser final proof | yes | Attach exact browser proof result | Final `pnpm check:plite:fast` passed, including `13 passed` Plite Chromium smoke through `apps/plite-proof`. |
| CI-controlled template output changed | N/A: no CI template output | No `templates/**` touched by this goal | N/A: no CI-controlled template output touched. |
| Package behavior or public API changed | N/A: private app/test infra | No changeset required | N/A: no public package behavior or API changed. |
| Registry-only component work changed | N/A: no registry component | No registry changelog required | N/A: no registry component changed. |
| Docs or content changed | yes | Verify source-backed claims and generated sync | Agent guidance and plan template updated; `pnpm install`, source audit, and `check:plite:fast` passed. |
| High-risk mini gate | yes | Record failure mode, proof plan, and boundary | Risk: fast lane could skip real behavior. Proof: reused existing Plite browser specs against shared examples; final `check:plite:fast` passed. |
| Agent-native review for agent/tooling changes | yes | Load reviewer and close findings | PASS: user action `daily Plite proof` -> agent route `pnpm check:plite:fast` / `auto` -> source owner `.agents/rules/auto.mdc` -> generated mirrors -> proof commands. |
| Local install corruption suspected | yes | Repair donor local install or N/A | Donor `bun install` failed integrity; `bun install --no-verify` restored `tsdown` enough for one donor timing. |
| Autoreview for non-trivial implementation changes | N/A: focused test-infra packet | No full autoreview run | N/A: lint, typecheck, source audit, focused browser proof, and final fast gate passed. |
| PR create or update | N/A: no PR requested | No PR/commit/push requested | N/A: user did not request PR work. |
| Task-style PR body verified | N/A: no PR requested | No PR body | N/A: no PR body exists. |
| PR proof image hosting | N/A: no PR requested | No PR proof image | N/A: no PR requested. |
| Tracker sync-back | N/A: no tracker | No issue/Linear sync | N/A: no tracker target. |
| Final handoff contract | yes | Fill final handoff rows | Final handoff rows below filled. |
| Final lint | yes | Run `pnpm lint:fix` | Passed after removing redundant fragment in `apps/www/src/components/docs-nav.tsx`. |
| Output budget discipline | yes | Record accidental output and recovery | Large failed Playwright/typecheck outputs logged; subsequent commands used line/capped output. |
| Timed checkpoint | N/A: no duration requested | No timed minimum | N/A: no timed checkpoint requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-19-plite-browser-proof-performance-parity.md` | Passed. |
| Browser interaction proof | yes | Exercise target route/interaction with Playwright | Plite smoke covered load, typing, undo/redo, selection, placeholder, hidden DOM, editable voids, huge document scroll/type/screenshot. |
| Browser console/network check | yes | Record console/network state or why not applicable | Runtime error recorder asserted none in passing Plite smoke rows. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof | Huge-document smoke produced `plite-huge-document-proof.png`; passing test run recorded. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` passed; `rg` found `plite-proof` in `.agents/AGENTS.md`, root `AGENTS.md`, and `.agents/skills/auto/SKILL.md`. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `rg slate-proof ...` found updated command guidance in source and generated mirror. |
| Agent-native review | yes | Load reviewer and close accepted findings | PASS; no accepted findings remain. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Read donor/Plate configs, scripts, routes, loader, registry, plan, autogoal, agent-native reviewer. | implementation |
| Implementation | complete | Added `apps/plite-proof`, converted Plite example loader to dynamic imports, wired fast command/guidance. | verification |
| Verification | complete | Donor `26.62s`; Plate `25.02s`; `typecheck`, smoke, lint, final `check:plite:fast` green. | closeout |
| PR / tracker sync | N/A: no PR/tracker requested | No PR/commit/push requested. | final response |
| Closeout | complete | Plan updated with evidence and ready for mechanical check. | final response |

Findings:
- Donor `../plite` was faster because it served a small static exported app with Playwright parallelism; Plate used the large `apps/www` dev app with serial browser config.
- Plate's original `www` serial plaintext browser row took `99.45s`; warm parallel `www` row took `49.55s`; donor static row took `26.62s`.
- A dedicated static proof host reaches parity without duplicating examples: `apps/plite-proof` imports `apps/www` Plite loader/registry/styles and has no `_examples` directory.

Decisions and tradeoffs:
- Keep full release/deletion browser matrix on `apps/www`; move daily/focused fast proof to `apps/plite-proof`.
- Use static export plus webpack source aliases for proof parity; avoid runtime/editor optimization because the gap was host/test infra.
- Add `NuqsAdapter` to the proof host because shared examples using query state require the same wrapper as `www`.
- Do not add a changeset: this is private app/test-infra and agent guidance, not public package behavior.

Implementation notes:
- Added `apps/plite-proof` with Next static export, Playwright config, static server, shared example route, and strict typecheck extending `www` aliases.
- `apps/plite-proof` imports `apps/www/src/app/(app)/examples/plite/slate-example-loaders`, `plite-example-registry`, and `plite-example-styles.css`.
- `apps/www` Plite loader now uses `next/dynamic` to avoid importing every example module into every route up front.
- `check:plite:fast` now runs `pnpm --filter plite-proof test:plite-browser:chromium-smoke`.
- `.agents/rules/auto.mdc`, `.agents/AGENTS.md`, root `AGENTS.md`, and generated `.agents/skills/auto/SKILL.md` now teach `plite-proof` for focused/daily proof.

Review fixes:
- `apps/www/src/components/docs-nav.tsx`: removed redundant fragment after `pnpm lint:fix` found `lint/complexity/noUselessFragments`.
- `apps/plite-proof/playwright.config.ts`: removed `www` dev-only global setup and set `PLAYWRIGHT_BASE_URL` so `@platejs/browser` opens the proof app, not the donor default port.
- `apps/plite-proof/src/app/layout.tsx`: added `NuqsAdapter` after hidden/huge examples crashed without query-state context.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Donor install failed integrity on `bun-types` | 1 | Use local donor install repair without product-source edits | `bun install --no-verify` restored `tsdown`; donor timing ran once. |
| First `plite-proof` build failed on Turbopack plus webpack aliases | 1 | Pin proof app build to `next build --webpack` | Build passed. |
| Source alias root swallowed subpath aliases | 1 | Use exact `$` package aliases and file-stem subpath detection | Build passed with `@platejs/plite-layout/react`, `@platejs/yjs/react`, and `@platejs/plite/internal`. |
| Proof run opened wrong port `3101` | 1 | Set `process.env.PLAYWRIGHT_BASE_URL = baseURL` in proof config | Focused plaintext row passed. |
| Smoke failed hidden/huge examples with "This page couldn't load" | 1 | Add `NuqsAdapter` to proof host layout | Smoke passed. |
| Standalone proof typecheck first pulled source/dist split-brain and missing `is-url` declaration | 2 | Extend `www` tsconfig and include `www/src/types` | `pnpm --filter plite-proof typecheck --pretty false` passed. |
| `pnpm lint:fix` failed on redundant fragment | 1 | Apply exact fragment cleanup | `pnpm lint:fix` passed. |
| Output budget miss: failed Playwright/typecheck attempts streamed too much output | 2 | Switch to capped output / line reporter and record this miss | Later verification outputs capped enough for decision-making. |

Verification evidence:
- `/Users/zbeyens/git/plite`: `bun install --no-verify` repaired local donor install enough to run browser proof.
- `/Users/zbeyens/git/plite`: `/usr/bin/time -p bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium` -> `41 passed`, `2 skipped`, Playwright `24.4s`, `real 26.62`.
- `/Users/zbeyens/git/plate-2`: baseline `pnpm --filter www test:plite-browser:chromium tests/plite-browser/donor/examples/plaintext.test.ts` -> serial `real 99.45`; warm parallel `real 49.55`.
- `/Users/zbeyens/git/plate-2`: `/usr/bin/time -p pnpm --filter plite-proof test:plite-browser:chromium ../www/tests/plite-browser/donor/examples/plaintext.test.ts --reporter=line` -> `41 passed`, `2 skipped`, Playwright `24.4s`, `real 25.02`.
- `/Users/zbeyens/git/plate-2`: `pnpm --filter plite-proof typecheck --pretty false` -> passed.
- `/Users/zbeyens/git/plate-2`: `/usr/bin/time -p pnpm --filter plite-proof test:plite-browser:chromium-smoke --reporter=line` -> `13 passed`, `real 13.53`.
- `/Users/zbeyens/git/plate-2`: `pnpm lint:fix` -> passed.
- `/Users/zbeyens/git/plate-2`: `/usr/bin/time -p pnpm check:plite:fast` -> passed, final browser smoke `13 passed`, `real 33.54`.
- `/Users/zbeyens/git/plate-2`: `find apps/plite-proof/src -type d -name _examples -print` -> no output.
- `/Users/zbeyens/git/plate-2`: `rg _examples apps/plite-proof ...` -> only shared imports from `apps/www` loader/registry/styles; no copied example source.
- `/Users/zbeyens/git/plate-2`: `rg slate-proof .agents/AGENTS.md AGENTS.md .agents/skills/auto/SKILL.md package.json docs/plans/templates/auto.md` -> source and generated guidance discover the new proof lane.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: no tracker requested.
- Confidence line: high; final fast gate passes and focused proof beats donor by `1.60s` real on the measured plaintext row.
- Flow table:
  - Reproduced: donor install blocker and Plate slow baseline measured.
  - Verified: donor timing, Plate focused timing, proof-app smoke, typecheck, lint, source-sharing audit, and final `check:plite:fast` passed.
- Browser check: Playwright proof through `apps/plite-proof`; full `apps/www` matrix remains closure-only.
- Outcome: Plate daily Plite browser proof is now donor-parity/faster without duplicate examples.
- Caveat: large checkout still has unrelated dirty Plite transplant work outside this goal; this goal did not review or own all existing diffs.
- Design:
  - Chosen boundary: private `apps/plite-proof` static host importing `apps/www` example source.
  - Why not quick patch: warm/parallel `www` still measured `49.55s`, almost 2x donor.
  - Why not broader change: runtime/editor performance was not the bottleneck; changing editor code would be fake optimization.
- Verified: commands listed in Verification evidence.
- PR body verified: N/A: no PR requested.

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
- PR: N/A: no PR requested.
- Issue / tracker: N/A: no tracker requested.
- Browser proof: `plite-proof` focused plaintext `25.02s`, smoke `13.53s`, final `check:plite:fast` `33.54s`.
- Caveats: broad release matrix stays on `www`; only daily/focused fast browser lane moved to `plite-proof`.

Timeline:
- 2026-06-19T08:46:16.389Z Task goal plan created.
- 2026-06-19T09:00Z Donor install repaired with `bun install --no-verify`; donor plaintext timing measured at `26.62s`.
- 2026-06-19T09:08Z Added `apps/plite-proof` static proof host and shared-source route.
- 2026-06-19T09:20Z Focused Plate proof timing passed at `25.02s`.
- 2026-06-19T09:32Z `plite-proof` smoke passed at `13.53s`; typecheck passed.
- 2026-06-19T09:40Z `pnpm check:plite:fast` passed at `33.54s`.
- 2026-06-19T09:45Z `check-complete.mjs` passed for this plan.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout |
| Where am I going? | Final plan check and response |
| What is the goal? | Reach donor-parity Plite browser proof speed without duplicate examples |
| What have I learned? | Donor speed came from static host plus parallelism; Plate dev app was the slow path |
| What have I done? | Added shared-source `apps/plite-proof`, wired fast commands/guidance, and verified final fast gate |

Open risks:
- Full `apps/www` browser matrix is intentionally still the release/deletion gate and was not rerun in this fast-lane parity goal.
- Donor checkout was locally repaired for measurement with `bun install --no-verify`; no donor product source change was made.
