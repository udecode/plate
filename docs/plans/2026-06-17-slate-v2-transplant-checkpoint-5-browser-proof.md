# slate v2 transplant checkpoint 5 browser proof

Objective:
Complete Slate v2 transplant Checkpoint 5: port browser behavior proof to `/examples/slate/*`; done when focused browser tests and app checks pass.

Goal plan:
docs/plans/2026-06-17-slate-v2-transplant-checkpoint-5-browser-proof.md

Template:
docs/plans/templates/task.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (docs/plans/templates/packs/browser.md)
- package-api (docs/plans/templates/packs/package-api.md)

Task source:
- type: continuation of user-approved Slate v2 transplant checkpoints
- id / link: Checkpoint 5 after `docs/plans/2026-06-17-slate-v2-transplant-checkpoint-4-docs-app-shell.md`
- title: Slate v2 transplant Checkpoint 5 browser proof
- acceptance criteria: Browser/Playwright proof hits `/examples/slate/*`, covers stable editor routes from Checkpoint 4, uses transplanted `@platejs/*` packages, does not rely on `Plate repo root`, does not start Plate runtime migration, and pauses after this checkpoint.

Timed checkpoint:
- requested duration: N/A
- semantics: one checkpoint, pause after completion
- initial confidence score: N/A: route checklist and executable pass/fail tests are better than a timed confidence score here.
- improvement loop: fix browser proof blockers discovered by focused Playwright/app checks until this checkpoint is green or a real blocker is recorded.
- final score / loop closure: final confidence recorded after proof.

Completion threshold:
- A repo-owned browser proof suite exists for `/examples/slate/*` in the Plate app, not `Plate repo root`.
- Focused proof covers these Checkpoint 4 routes at minimum: plaintext, richtext, markdown-shortcuts, history, selection-navigation, editable-voids, custom-placeholder, hidden-dom, huge-document.
- Proof verifies route load, editor visibility, no runtime page errors, text insertion/model text, native/model selection agreement where the route exercises selection, and at least one screenshot/visual sanity artifact path or explicit no-artifact caveat.
- Focused proof command passes locally against `apps/www`.
- `pnpm --filter www check:docs` and `pnpm --filter www typecheck` pass after edits.
- Source audits show no hidden `Plate repo root` dependency, no raw `slate` / `slate-react` imports in new route/test surfaces, and no public compatibility aliases.
- Checkpoint 5 does not migrate Plate runtime, delete `Plate repo root`, create PR/commit/push, add release changesets, or claim raw-device/mobile proof.
- Task closure is legal only when the source-of-truth acceptance criteria are
  satisfied or explicitly narrowed, required verification evidence is recorded,
  code-review and release-artifact gates are closed when applicable, tracker/PR
  sync is complete or marked N/A with reason, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-5-browser-proof.md` passes.

Verification surface:
- Focused app browser proof command for the new `/examples/slate/*` route suite.
- `pnpm --filter www check:docs`.
- `pnpm --filter www typecheck`.
- Source audit with `rg` over new test/app surfaces for `Plate repo root`, raw `slate` imports, and stale route paths.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-5-browser-proof.md`.

Constraints:
- Preserve existing user-facing behavior outside the task scope.
- Prefer the durable ownership boundary over caller-by-caller patches.
- Do not create PRs, comments, commits, or pushes unless the task/user/skill
  requires them.
- Do not add broad ceremony when the task is trivial or docs-only.
- Use current `@platejs/*` package names only.
- Do not add compatibility aliases, runtime shims, or raw `slate` imports.
- Do not broaden into full Plate runtime migration, Yjs migration, release CI, docs expansion, or `Plate repo root` deletion.
- Browser behavior proof must hit `/examples/slate/*`, not docs pages.
- Pause after this checkpoint with a concise summary before continuing.

Boundaries:
- Source of truth: Checkpoint 4 plan, root `VISION.md`, transplanted packages under `packages/**`, donor `apps/www/tests/slate-browser/donor/examples/*` as reference only.
- Allowed edit scope: `apps/www` Playwright/browser proof config/spec helpers, `/examples/slate/*` route shell if proof exposes a route bug, app package scripts/deps only if needed for browser proof, and this goal plan.
- Browser surface: `http://localhost:3100/examples/slate/*` or an equivalent configured `PLAYWRIGHT_BASE_URL` for the Plate app.
- Tracker sync: N/A: local transplant checkpoint, no issue/PR sync requested.
- Non-goals: Plate runtime migration, full donor suite port, pagination architecture, raw mobile/device proof, deleting `Plate repo root`, PR/commit/push, release artifacts, changesets.

Output budget strategy:
- Use focused `rg`/`sed` reads for Playwright config, donor example specs, browser harness exports, and route files.
- Cap command output with `max_output_tokens`; do not stream full donor suites, generated docs, `.next`, test-results, or package trees.
- Save any long Playwright artifacts to normal test output and summarize paths instead of dumping logs.

Blocked condition:
- Stop only if a real browser proof cannot run in this checkout because required browser dependencies are missing/corrupt after focused install/typecheck repair, or if proving the required behavior requires public API/runtime architecture beyond Checkpoint 5. Record exact blocker, failing command, and next owner.

Task state:
- task_type: browser proof / transplant checkpoint
- task_complexity: normal
- current_phase: closeout
- current_phase_status: complete
- next_phase: hard pause before Plate runtime migration
- goal_status: complete

Current verdict:
- verdict: checkpoint-complete
- confidence: 0.94
- next owner: human checkpoint before Plate runtime migration
- reason: Plate app browser proof now exercises `/examples/slate/*` with route load, editor handle, model text, typing, undo/redo, native/model selection agreement, placeholder, editable void/hidden DOM, huge-doc scroll/type, screenshot artifact, docs check, typecheck, and source audits. Confidence is capped below 1.0 because this checkpoint is Chromium-focused and does not port the entire donor browser suite.

Pre-solution issue challenge:
- reporter claim: Route 200s are insufficient; Checkpoint 5 must prove real Slate editor behavior in the Plate app.
- suggested diagnosis or fix: Port focused donor browser proof to `/examples/slate/*` using transplanted `@platejs/browser` helpers.
- repro ladder:
  - tests / source-level repro: source read shows donor proof in `apps/www/tests/slate-browser/donor/examples/*` and transplanted `@platejs/browser/playwright` helpers in `packages/browser`.
  - Playwright / automated browser: required for this checkpoint.
  - Browser plugin: tool search exposed no callable browser-use/in-app Browser controller; record waiver unless a later tool becomes available.
  - screenshot / visual proof: include a screenshot or exact artifact caveat from the Playwright run.
- reproduction verdict: valid checkpoint gap
- validity verdict: valid
- best long-term fix boundary: app-level Playwright/browser proof under `apps/www`, backed by `@platejs/browser`, not donor `.tmp` tests.
- harsh honest feedback: If this only checks URLs, it is another fake checkpoint. It must type/select/edit in the actual app routes.
- hard-stop decision: continue; no blocker yet.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-5-browser-proof.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the
  durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Timed checkpoint parsed | yes | N/A: no duration in "go"; one checkpoint then pause. |
| Skill analysis before edits | yes | `autogoal` skill read; `$auto` generated skill absent in this checkout, using task template with browser/package-api packs. |
| Active goal checked or created | yes | `get_goal` returned no active goal; new goal will use this plan. |
| Source of truth read before edits | yes | Root `VISION.md`, Checkpoint 4 plan, donor Playwright config/specs, browser harness exports, and `apps/www/package.json` inspected. |
| Tracker comments and attachments read | no | N/A: local transplant checkpoint, no tracker. |
| Video transcript evidence required | no | N/A: no video/input attachment for this checkpoint. |
| Pre-solution issue challenge required | yes | Recorded above: gap is valid; route 200 is not browser behavior proof. |
| Reproduction verdict before implementation | yes | Valid checkpoint gap; no code fix until proof suite boundary is selected. |
| Repro escalation ladder selected | yes | Repo-owned Playwright/browser proof first; Browser plugin waiver if unavailable; screenshot/artifact caveat recorded at close. |
| Suggested fix reviewed against durable boundary | yes | Durable boundary is `apps/www` proof suite using `@platejs/browser`, not donor `.tmp` execution. |
| `docs/solutions` checked for non-trivial existing-code work | no | N/A: transplant checkpoint with explicit predecessor plan and donor source; no historical solution lookup needed. |
| TDD decision before behavior change or bug fix | yes | Browser proof-first: write focused app route proof before route/runtime fixes unless source compile blocks. |
| Branch decision for code-changing task | yes | N/A: user asked checkpoint continuation only; no branch/PR/commit. |
| Release artifact decision | yes | N/A: test/app proof only unless a package runtime/API fix becomes necessary. |
| Browser tool decision for browser surface | yes | Use repo Playwright suite; tool_search did not expose a Browser controller, so Browser plugin proof is waived unless it appears later. |
| PR expectation decision | yes | N/A: no PR requested. |
| Tracker sync expectation decision | yes | N/A: no tracker requested. |
| Output budget strategy recorded | yes | Focused reads and capped outputs recorded above. |
| Browser pack selected | yes | Applied `browser` pack. |
| Browser route / app surface identified | yes | `/examples/slate/*` in `apps/www`. |
| Browser tool decision recorded | yes | Repo-owned Playwright for executable proof; Browser plugin unavailable. |
| Console/network caveat policy recorded | yes | Playwright specs must collect page console/runtime errors where useful; final handoff records caveats. |
| Package/API pack selected | yes | Applied `package-api` because app package scripts/deps and public proof harness imports may change. |
| Public surface or package boundary identified | yes | App proof imports `@platejs/browser/playwright` and `@platejs/*` Slate packages; no public package API change intended. |
| Release artifact path selected | yes | N/A: no published package user-visible delta intended for browser proof. |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no changeset required unless runtime package behavior changes. |
| Barrel/export impact decision recorded | yes | N/A unless exported package files change; no barrel work intended. |

Work Checklist:
- [x] If a duration was requested, it is recorded as minimum active work unless
      explicitly marked hard stop; when no better metric exists, initial and
      final confidence scores are recorded. N/A: no duration was requested; final confidence is 0.94.
- [x] Short objective plus outcome, completion threshold, verification surface,
      constraints, boundaries, and blocked condition are concrete in this plan.
- [x] Task source classified with source type, id/link, title, task type,
      acceptance criteria, caveats, likely files/routes/packages, browser
      surface, and root-cause layer.
- [x] Required video or screen-recording evidence is cached/read as normalized
      `<video-transcripts>` XML, or marked N/A with reason. N/A: no video or screen recording was provided.
- [x] For public tracker bug reports, behavior claims, technical diagnoses, or
      suggested fixes, reporter claims are challenged before implementation
      with a recorded verdict: `valid`, `not reproduced`, `invalid`,
      `wont-fix`, `partially valid`, or `platform limitation`. Feature, docs,
      support, or cleanup requests with no bug claim may mark reproduction `N/A` with reason. Verdict: valid checkpoint gap.
- [x] Repro escalation ladder followed for bug/behavior claims: focused
      test/source-level repro first when applicable; existing repo-owned
      Playwright regression/test harness next when available and useful as
      executable coverage; do not use standalone Playwright, Puppeteer, or raw
      DevTools as a substitute for the repo Browser policy;
      `[@Browser](plugin://browser@openai-bundled)` next when tests or
      Playwright cannot reproduce or cannot model the surface honestly;
      screenshot or explicit visual-proof waiver when visual/native state matters. Repo Playwright was the proof owner; Browser plugin was unavailable; screenshot artifact was captured.
- [x] Hard-stop rule followed for bug/behavior claims: no code when the issue
      is not reproduced, invalid, or won't-fix; partial validity pivots to the
      best long-term fix and records what was wrong or incomplete in the issue's proposed path. Route 200 was incomplete proof; app-level browser proof fixed the gap.
- [x] Nearby repo instructions and implementation patterns read before edits.
- [x] Implementation fixes the right ownership boundary, or the narrower choice
      is recorded with reason. Boundary: `apps/www` proof suite and route shell/resolver fixes, not donor `.tmp` execution.
- [x] Release artifact requirement recorded: changeset, registry changelog, or
      N/A with reason. N/A: no published package behavior/API/types delta; app proof/test/tooling only.
- [x] Final handoff shape decided: checkpoint summary with changed files, proof, bugs fixed, caveats, and pause before Plate runtime migration.
- [x] Branch handling recorded for code-changing work: N/A: user asked direct checkpoint continuation only; no commit/PR/branch action.
- [x] Local-env-rot retry policy recorded for any surprising repo-wide failure:
      N/A: failures were deterministic config/browser/module identity issues; no reinstall signal.
- [x] Workspace authority recorded: proof commands ran from `/Users/zbeyens/git/plate-2` against `apps/www`.
- [x] High-risk note recorded for public API, runtime, package-boundary,
      browser behavior, agent-action, or command-contract changes, or marked
      N/A with reason. Risk: Next/Turbopack subpath aliasing can hide module identity bugs; proof targets root and `internal`/React/browser paths.
- [x] Review/autoreview target selected from actual diff state for non-trivial
      implementation work, or marked N/A with reason. N/A for this checkpoint close: user explicitly asked pause after each checkpoint; run `autoreview` before commit/merge.
- [x] Agent-native review decision recorded for `.agents/**`, `.claude/**`,
      `.codex/**`, skills, hooks, commands, prompts, or user-action tooling. N/A: no agent/tooling files changed.
- [x] Output budget discipline recorded and followed: broad searches were scoped and capped; no generated trees or donor suites were dumped.
- [x] Browser pack: route, interaction path, and expected visible outcome were recorded before proof.
- [x] Browser pack: browser proof uses repo-owned Playwright; Browser plugin controller was unavailable and waived.
- [x] Browser pack: console and network errors are checked by `recordSlateBrowserRuntimeErrors(page)` in every test; no Slate runtime errors were asserted.
- [x] Browser pack: screenshot artifact recorded below.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: no artifact; test/app proof and app dependency/script only.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules. N/A: no changeset needed.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: no registry output touched.
- [x] Package/API pack: no-artifact decision: no published package user-visible delta from `main`; browser proof tooling/app route shell only.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. N/A: no public shape change.
- [x] Package/API pack: package-owned typecheck/build/test proof recorded below.
- [x] Package/API pack: generated barrels or release notes are updated when required. N/A: no exported package files changed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | `pnpm --filter www test:slate-browser`, `pnpm --filter www check:docs`, `pnpm --filter www typecheck`, scoped Biome check, and source audits passed. |
| Pre-solution issue challenge verdict | yes | Record reporter claim, suggested fix, repro verdict, validity verdict, durable boundary, and hard-stop/pivot decision before implementation | Recorded above; verdict valid; durable boundary is app route proof using transplanted packages. |
| Repro escalation ladder | yes | For bug/behavior claims, record test/source-level, Playwright, Browser, and screenshot/visual-proof outcomes or N/A/blocker reasons before `not reproduced` | Source read -> repo Playwright -> screenshot artifact; Browser plugin unavailable and waived. |
| Bug reproduced before fix | yes | Record failing test/repro or N/A with reason | Browser proof exposed real failures before fix: missing Chromium, wrong 3101 default, Turbopack multi-worker panic, and editor transform registry crash from module identity split. |
| Targeted behavior verification | yes | Run focused test/proof for changed behavior or record N/A | `pnpm --filter www test:slate-browser` passed 15 tests. |
| TypeScript or typed config changed | yes | Run relevant typecheck | `pnpm --filter www typecheck` passed. |
| Package exports or file layout changed | no | Run `pnpm brl` before final verification and keep generated barrel updates | N/A: no exported package files or barrel layout changed. |
| Package manifests, lockfile, or install graph changed | yes | Run `pnpm install` and relevant package checks | `pnpm install` passed after adding app dependency; app typecheck and browser suite passed. |
| Agent rules or skills changed | no | Run `pnpm install` and verify generated skill sync | N/A: no `.agents/**` or skill sources changed. |
| Workspace authority proof | yes | Run verification in the owning repo/package/app/route/tool and record cwd; do not count the wrong workspace as proof | Commands ran in `/Users/zbeyens/git/plate-2`; owning app is `apps/www`. |
| Browser surface changed | yes | Capture Browser Use proof or record explicit waiver/blocker | Repo Playwright proof passed; Browser controller was unavailable in this runtime. |
| Browser final proof | yes | Attach screenshot or exact browser verification caveat when browser proof applies | Screenshot artifact: `apps/www/test-results/slate-browser/slate-examples-Slate-app-e-b0edb-s-and-captures-visual-proof-chromium/slate-huge-document-proof.png`. |
| CI-controlled template output changed | no | Restore generated template output or record why it is intentionally kept | N/A: no template output touched. |
| Package behavior or public API changed | no | Add a changeset or record why no changeset applies | N/A: no published package behavior/API/types/config/runtime delta; app route proof only. |
| User-visible registry output changed | no | Use the registry-changelog pack or record N/A | N/A: no registry files changed. |
| Docs or content changed | no | Load `docs-creator` for public docs/content/API/example changes or record N/A | N/A: no public docs/content changed in this checkpoint; only goal plan updated. |
| High-risk mini gate | yes | For public API/runtime/package-boundary/browser/agent-action/command-contract changes, record realistic failure mode, proof plan, and why the chosen boundary is right; otherwise N/A | Failure mode was false-green route shell and package module identity split; proof plan hits app routes with `@platejs/browser/playwright`. |
| Agent-native review for agent/tooling changes | no | Load agent-native reviewer or record N/A | N/A: no agent-action/tooling files changed. |
| Local install corruption suspected | no | Run `pnpm run reinstall` once, rerun the exact failing command, or record N/A | N/A: failures matched config/browser/module identity, not install corruption. |
| Autoreview for non-trivial implementation changes | no | Load autoreview or record N/A | N/A for checkpoint pause: user requested per-checkpoint summary; run `autoreview` before commit/merge. |
| PR create or update | no | Run `check` before PR work and sync PR body to the task-style final handoff | N/A: no PR requested. |
| Task-style PR body verified | no | Verify PR body with `gh pr view --json body` | N/A: no PR. |
| PR proof image hosting | no | If PR body needs browser proof, replace local image paths with hosted GitHub URLs or record N/A | N/A: no PR. |
| Tracker sync-back | no | Post concise issue/Linear sync after PR exists, or record N/A/blocker | N/A: local checkpoint only. |
| Final handoff contract | yes | Fill final handoff fields below | Filled below. |
| Final lint | yes | Run `pnpm lint:fix` or scoped equivalent | `pnpm exec biome check --write ...` passed with no fixes. |
| Output budget discipline | yes | Verify no unbounded high-volume command output was streamed | Passed: focused reads/audits; no broad generated output streamed. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish the current loop cleanly; otherwise N/A | N/A: no duration requested. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-5-browser-proof.md` | To run after this plan update. |
| Browser interaction proof | yes | Exercise the target route/interaction with the approved browser tool or record blocker | `pnpm --filter www test:slate-browser` passed 15 tests against `/examples/slate/*`. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | `recordSlateBrowserRuntimeErrors(page)` asserted no runtime errors in every test; only NO_COLOR/FORCE_COLOR Node warnings appeared. |
| Browser final proof artifact | yes | Record screenshot/trace/route proof or exact caveat | Huge-doc screenshot artifact path recorded above. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | `rg` audit found no `Plate repo root`, `../slate-v2`, raw `slate`, or raw `slate-react` imports in new proof/app route surfaces; only existing app `@platejs/slate-legacy` dependency matched separately. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | No published user-visible package delta; app proof/test/config only. |
| Published package changeset | no | If published package users see a delta, load `changeset` and add/update changeset | N/A: no published package delta. |
| Registry changelog | no | If registry-only, use the registry-changelog pack | N/A: no registry change. |
| No release artifact | yes | Record the exact reason | Test/app proof only; no published package behavior/API/types/config/runtime delta. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | `pnpm --filter www typecheck` and `pnpm --filter www test:slate-browser` passed. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported package files changed. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | Root/Checkpoint 4/donor proof/browser harness/app route files read. | done |
| Implementation | complete | Added app Playwright proof, app script/dependency, client mount gate, and Next subpath aliases. | done |
| Verification | complete | App docs check, typecheck, browser suite, lint, and source audits passed. | done |
| PR / tracker sync | complete | N/A: no PR/tracker requested. | done |
| Closeout | complete | Plan updated; final response pauses before Plate runtime migration. | done |

Findings:
- Route 200 was a false proof. The initial app route could still fail before editor mount.
- `next/dynamic(..., { ssr: false })` was not the right long-term shell for this proof route. A mount-gated client component avoids constructing the Slate editor before the client runtime is ready.
- Turbopack could resolve `@platejs/slate` root and subpaths through different identities. That left the editor transform registry initialized in one module instance and read from another, causing `Editor transform registry has not been initialized`.
- Serializing the Slate browser suite avoids a cold-start Turbopack multi-worker panic and makes the checkpoint deterministic.
- The focused proof now checks route load, `__slateBrowserHandle`, model text, typing, undo/redo, selection, placeholder, void/hidden DOM, huge-doc scroll/type, and screenshot capture.

Decisions and tradeoffs:
- Keep Checkpoint 5 focused on app proof, not full donor suite parity. Full donor suite expansion belongs after this checkpoint if desired.
- Use `@platejs/browser/playwright` as first-party proof infrastructure. Do not invent app-local selector soup.
- Alias common workspace package subpaths in `apps/www/next.config.ts` so source-mode app dev has one module identity for root and subpath imports.
- Keep `workers: 1` for this proof suite. Browser proof stability matters more than parallel speed here.
- Do not add changesets: this is app proof/test/config behavior, not published package API/runtime behavior.

Implementation notes:
- `apps/www/package.json`: added `@platejs/browser` app dependency and `test:slate-browser` script.
- `apps/www/playwright.slate.config.ts`: added focused Chromium Playwright config for `/examples/slate/*`, base URL plumbing, serial workers, and dev-server startup.
- `apps/www/tests/slate-browser/slate-examples.spec.ts`: added 15 browser tests for all current Slate example routes and core behavior proof.
- `apps/www/src/app/(app)/examples/slate/slate-example-client.tsx`: replaced the dynamic island with a real mounted client shell and inner editor.
- `apps/www/src/app/(app)/examples/slate/[example]/page.tsx`: points to `SlateExampleClient`.
- `apps/www/src/app/(app)/examples/slate/slate-example-island.tsx`: removed dead dynamic wrapper.
- `apps/www/next.config.ts`: aliases common workspace subpaths for source/dev resolution.
- `pnpm-lock.yaml`: updated by `pnpm install` for the app dependency.

Review fixes:
- N/A: no separate autoreview run in this checkpoint. Recommendation: run `autoreview` before commit/merge.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Playwright config used ESM-incompatible `import.meta` path handling | 1 | Make config CJS-safe for current app execution | Removed `import.meta` usage in config. |
| Local Playwright browser executable missing | 1 | Install the required browser binary | `pnpm exec playwright install chromium` passed. |
| Browser proof tried default `http://localhost:3101` | 1 | Set the proof base URL explicitly for the Plate app | `process.env.PLAYWRIGHT_BASE_URL = baseURL` in config. |
| Cold app startup panicked under parallel Playwright workers | 1 | Serialize the focused suite | `workers: 1`, `fullyParallel: false`. |
| Editor crashed with transform registry not initialized | 1 | Fix client mount and package module identity, not the test | Added mounted client shell and workspace subpath aliases. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2`: passed after adding `@platejs/browser` to `apps/www`.
- `pnpm exec biome check --write apps/www/next.config.ts apps/www/package.json apps/www/playwright.slate.config.ts apps/www/tests/slate-browser/slate-examples.spec.ts "apps/www/src/app/(app)/examples/slate/slate-example-client.tsx" "apps/www/src/app/(app)/examples/slate/[example]/page.tsx" docs/plans/2026-06-17-slate-v2-transplant-checkpoint-5-browser-proof.md`: passed, no fixes.
- `pnpm --filter www check:docs`: passed; docs source parity passed.
- `pnpm --filter www typecheck`: passed; docs source parity, registry source check, app TS, and package integration TS passed.
- `pnpm --filter www test:slate-browser`: passed 15 Chromium tests in 13.0s.
- Source audit: `rg` found no `Plate repo root`, `../slate-v2`, raw `slate`, or raw `slate-react` imports in new proof/app route surfaces.
- Source audit: `rg slate-legacy` found only `apps/www/package.json` existing dependency scaffold, not new proof imports.
- Screenshot artifact: `apps/www/test-results/slate-browser/slate-examples-Slate-app-e-b0edb-s-and-captures-visual-proof-chromium/slate-huge-document-proof.png`.

Final handoff contract:
- PR line: N/A: no PR requested.
- Issue / tracker line: N/A: local transplant checkpoint only.
- Confidence line: 0.94; capped because this is Chromium-focused checkpoint proof, not full donor/browser-matrix parity.
- Flow table:
  - Reproduced: route-shell-only proof was invalid; app browser suite exposed runtime/config/module identity failures.
  - Verified: focused `/examples/slate/*` browser suite, docs check, typecheck, lint, and source audits passed.
- Browser check: `pnpm --filter www test:slate-browser` passed 15 tests.
- Outcome: Checkpoint 5 complete; hard pause before full Plate runtime migration.
- Caveat: Browser plugin was unavailable, so repo-owned Playwright is the proof. No Firefox/WebKit/raw mobile/full donor suite claim.
- Design:
  - Chosen boundary: `apps/www` proof suite and app route shell/resolver fixes.
  - Why not quick patch: URL checks were bullshit; tests needed real edit/selection/model proof.
  - Why not broader change: Plate runtime migration is explicitly after this hard checkpoint.
- Verified: commands and audits listed above.
- PR body verified: N/A: no PR.

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
- PR: N/A.
- Issue / tracker: N/A.
- Browser proof: passed in Plate app route suite.
- Caveats: Chromium-only; Browser plugin unavailable; no raw mobile; no full donor suite parity.

Timeline:
- 2026-06-17T19:15:22.587Z Task goal plan created.
- 2026-06-17T19:xxZ Added focused `apps/www` Slate browser proof suite and script.
- 2026-06-17T19:xxZ Fixed Playwright config base URL, local Chromium dependency, serial worker stability, client mount, and workspace subpath aliasing.
- 2026-06-17T19:xxZ `pnpm --filter www check:docs` passed.
- 2026-06-17T19:xxZ `pnpm --filter www typecheck` passed.
- 2026-06-17T19:xxZ `pnpm --filter www test:slate-browser` passed 15 tests.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint 5 closeout |
| Where am I going? | Pause before full Plate runtime migration |
| What is the goal? | Prove transplanted Slate examples behave in the Plate app route surface |
| What have I learned? | Route 200 is not enough; app proof caught resolver/client runtime failures |
| What have I done? | Added browser proof, fixed route shell/resolver issues, verified app checks |

Open risks:
- Full donor browser suite is not ported yet.
- Chromium-only proof; no Firefox/WebKit/raw mobile claim.
- Browser plugin proof was waived because the runtime exposed no callable Browser controller.
- `apps/www` still carries the temporary `@platejs/slate-legacy` dependency scaffold from earlier transplant checkpoints; this checkpoint did not add or use it in new proof code.
- Hard pause remains before Plate runtime migration.
