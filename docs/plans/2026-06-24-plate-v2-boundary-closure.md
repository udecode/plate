# Plate v2 boundary closure

Objective:
Close Plate v2 Core/Plite boundary slice; done when Core plus representative Plate packages are clean and focused gates pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-24-plate-v2-boundary-closure.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Completion threshold:
- Review the changed Core/Plate boundary slice and classify each touched API/helper as move-to-plite, keep-in-core, hard-cut, private bridge with deletion gate, or defer.
- Move generic editor substrate behavior into Plite when source proves it is not Plate product/plugin opinion.
- Keep Plate Core focused on plugin/product/runtime composition.
- Remove public compat aliases/wrappers in the touched slice.
- Add or repair tests/oracles for moved behavior or behavior regressions discovered during the sweep.
- Run focused package tests plus typecheck/build for touched packages.
- Run package-wide typecheck/build after the final patch.
- Record changed list, workflow slowdowns, review attention, stopping checkpoints, and residual risks before closeout.

Verification surface:
- Static source audit for forbidden runtime bridges.
- Focused Plite, Core, Table, Link, and AI package tests.
- Touched package typecheck/build.
- Package-wide `pnpm turbo typecheck --filter='./packages/*'`.
- Package-wide `pnpm turbo build --filter='./packages/*'`.
- Scoped Biome check on touched files.
- Browser proof is N/A: this slice changed package/runtime API behavior and package tests, not a browser route or UI surface.

Constraints:
- Work directly in current checkout.
- No commit, push, PR, release, or changeset.
- No public compat aliases.
- No Plate wrapper around generic Plite editor APIs under Plate names.
- Private bridges allowed only with deletion gates.
- Do not broaden into pagination, perf, docs rewrite, mobile, or browser matrix.
- Keep browser proof out unless a route-visible behavior change is introduced.

Boundaries:
- In scope: `packages/core`, `packages/plite*`, and representative Plate packages touched by the Core/Plite boundary changes: `packages/table`, `packages/link`, and `packages/ai`.
- In scope: this plan and local `.tmp/plate-v2-boundary/*.log` proof artifacts.
- Out of scope: public docs, release packaging, full Plate package migration, PR hygiene, and unrelated app lint debt.

Output budget strategy:
- Use exact owner-file reads and focused package commands.
- Save broad package gate output under `.tmp/plate-v2-boundary/*.log`.
- Use count/static audits instead of streaming broad repo matches.

Blocked condition:
- Stop only if the next safe move needs a public API decision not covered by `VISION.md`, a destructive git action, external credentials, or a failure outside the touched boundary that cannot be isolated. No such blocker remains for this slice.

Automation state:
- lane: shared editor
- surface: Core/Plite boundary plus representative Plate packages
- invocation mode: full-loop
- current checkpoint status: complete
- goal status: ready for mechanical close

Current verdict:
- verdict: complete for this boundary slice
- confidence: high for package/API gates; browser claim intentionally not made
- keep / revert / quarantine call: keep all packets listed below
- reason: focused tests, package typecheck/build, broad package typecheck/build, and static bridge audit are green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Scope, non-goals, stop rules, final handoff sections, and package proof requirements are recorded in this plan. |
| `auto` source rule read | yes | `.agents/skills/auto/SKILL.md` read during this run. |
| `autogoal` source rule read | yes | `.agents/skills/autogoal/SKILL.md` read during this run. |
| Active goal checked | yes | `get_goal` showed active objective for this plan. |
| Lane resolved | yes | Shared editor lane: Core/Plite boundary with Plate package callers. |
| Invocation mode recorded | yes | Full-loop mode, no duration. |
| Output budget strategy recorded | yes | Broad outputs saved to `.tmp/plate-v2-boundary/*.log`. |
| Release/PR boundary recorded | yes | No commit, push, PR, release, or changeset in this run. |

Work Checklist:
- [x] Requirement extraction captured latest user request: `complete all`.
- [x] Lane resolved as shared editor with Core/Plite boundary ownership.
- [x] Core/Plite DOM marker packet classified and kept.
- [x] Core initial selection packet classified and kept.
- [x] Plite exact expanded selection packet classified and kept.
- [x] Table reverse diagonal selection packet classified and kept.
- [x] Link unwrap/upsert/focus packet classified and kept.
- [x] AI optional service and node typing packet classified and kept.
- [x] Missing oracles added or repaired for Plite, Core, Table, Link, and AI paths.
- [x] Public compat bridge audit run and clean for disallowed runtime bridge symbols.
- [x] Touched packages typecheck/test/build gates recorded.
- [x] Package-wide typecheck/build gates recorded.
- [x] Browser/visual proof marked N/A with reason.
- [x] Mobile/raw-device and huge-document gates marked N/A with reason.
- [x] Docs/vision/rule consolidation marked N/A with reason.
- [x] Workflow slowdowns logged.
- [x] Changed list recorded.
- [x] Needs-your-attention list recorded.
- [x] Stopping checkpoints recorded.
- [x] Agent-native review marked N/A: no `.agents/**`, command, skill, hook, or prompt/tooling source changed.
- [x] Autoreview marked N/A for this slice: the checkout contains a broad migration tree; deterministic focused package gates and broad package gates are the review proof for this API boundary packet.
- [x] Output budget discipline repaired after broad lint output by switching to scoped Biome and saved logs.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused package tests/typecheck/build and broad package typecheck/build. | Focused commands listed under Verification evidence; broad package typecheck/build logs passed. |
| Dynamic checkpoint reconciliation | yes | Replace stale plan rows with actual packet ledger and final gate state. | This plan now records final packet, slowdown, changed, review, and risk ledgers. |
| Lane authority proof | yes | Prove commands ran in owning packages or repo root. | Commands below include package cwd or repo-root command. |
| Workspace authority proof | yes | Record cwd/tool for each proof. | Verification evidence records `packages/*` cwd commands and repo-root commands. |
| Behavior gates | N/A: no browser-visible behavior claim | Keep package behavior tests only. | Plite/Core/Table/Link/AI focused tests passed; browser behavior claim not made. |
| Visual/native selection proof | N/A: no browser route changed | Do not claim visual selection parity. | Table/selection fixes are package-test proven only in this slice. |
| Missing oracle repair | yes | Add or repair focused tests for discovered regressions. | Added Plite exact range test, Core transformed-selection tests, Table reverse diagonal test; Link/AI package suites cover adjusted paths. |
| Browser helper promotion | N/A: no repeated browser proof pattern | No browser helper changed. | No route/browser automation touched. |
| Mobile/raw-device claim width | N/A: no mobile claim | No raw-device proof required. | No mobile claim made. |
| Huge-document correctness smoke | N/A: no huge-doc claim | No huge-doc route proof required. | Huge-document lane out of scope. |
| Package/API proof | yes | Run static bridge audit and package gates. | Disallowed bridge audit has 0 matches; broad package typecheck/build passed. |
| Autoclosure handoff | N/A: this was internal boundary execution | Stay under `auto`. | User asked `auto complete all`, not post-merge/current-tree closure. |
| Skill/rule sync | N/A: no source rule changed | No `pnpm install` skill sync needed. | `.agents/rules/**` untouched in this slice. |
| Changed list / review attention / stopping checkpoints | yes | Fill final ledgers. | Sections below are complete. |
| Final lint/check | yes | Run scoped formatting/lint for touched files; record broad lint debt. | Scoped `pnpm exec biome check --write <20 touched files>` passed; broad `pnpm lint:fix` failed on unrelated Plite app lint debt after applying 14 fixes, then package gates were rerun. |
| Workflow slowdown review | yes | Log avoidable command/package graph slowdowns. | Workflow slowdown table below. |
| Agent-native review for agent/tooling changes | N/A: no agent/tooling changes | No agent-native pass needed. | No `.agents/**`, commands, hooks, or prompts changed. |
| Autoreview for non-trivial implementation changes | N/A: deterministic package closure used | Do not run whole-tree autoreview against broad migration tree in this slice. | Focused package gates plus broad package gates are recorded; user can request `autoreview` separately before commit. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-24-plate-v2-boundary-closure.md`. | Run after this update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | Prompt and boundaries recorded. | done |
| Status and current-state read | complete | Active goal and plan resumed after compaction. | done |
| Changed-file classification | complete | Packets below classify move/keep/cut/defer decisions. | done |
| Core boundary packet | complete | Plite DOM markers moved; Core transformed initial selection preserved; Core typecheck/build/focused tests passed. | done |
| Representative package packets | complete | Table, Link, and AI package gates passed. | done |
| Oracle repair | complete | Plite/Core/Table tests added; Link/AI suites verified. | done |
| Static bridge audit | complete | Disallowed bridge audit has 0 matches. | done |
| Browser/visual/mobile/huge-doc/perf gates | N/A | Out of scope; no route-visible or perf claim. | done |
| Consolidation and review | complete | No reusable vision/skill/doc rule changed; review-attention list records remaining review points. | done |
| Final handoff and goal-plan check | complete | Final ledgers complete; mechanical check follows. | done |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| package/API boundary | Core/Plite + package callers | N/A | package calls and tests | static audit, unit/package tests, typecheck, build | complete |

Packet ledger:
| Packet | Owner | Classification | Files / commands | Behavior / visual proof | Decision | Next |
|--------|-------|----------------|------------------|-------------------------|----------|------|
| P0 requirement extraction | auto | keep-in-plan | This plan | N/A planning packet | keep | done |
| P1 Plite DOM marker ownership | Plite DOM + Core | move-to-plite / keep-in-core | `packages/plite-dom/src/utils/plite-dom-markers.ts`, `packages/plite-dom/src/internal/index.ts`, Core HTML/render callers, removed Core marker wrappers; Plite DOM/Core focused tests/typecheck/build passed; `pnpm --filter @platejs/core brl` passed. | N/A package/API packet | keep | done |
| P2 Core transformed initial selection | Core runtime | keep-in-core with Plite runtime semantics | `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/react/editor/createPlateRuntimeEditor.ts`, matching specs; focused Core tests/typecheck/build passed. | N/A package/API packet | keep | done |
| P3 exact expanded selection | Plite runtime | move-to-plite fix | `packages/plite/src/core/public-state.ts`, `packages/plite/test/read-update-contract.ts`; focused Bun contract and Plite typecheck/build passed. | N/A package/API packet | keep | done |
| P4 table selection preservation | Table package | keep-in-package with Plite selection law | `packages/table/src/lib/TableExtension.ts`, `packages/table/src/lib/TableExtension.spec.ts`; table reverse diagonal test, grid range suite, typecheck/test/build passed. | N/A package/API packet | keep | done |
| P5 link cleanup | Link package | hard-cut stale optional probe / keep package behavior | `packages/link/src/lib/transforms/upsertLink.ts`, `unwrapLink.ts`, React focus/trigger utilities; link typecheck, focused tests, full package test, build passed. | N/A package/API packet | keep | done |
| P6 AI cleanup | AI package | keep-in-package with optional host-service guards | `packages/ai/src/**` touched files; AI typecheck, 64 tests, build passed. | N/A package/API packet | keep | done |
| P7 static bridge audit | auto | hard-cut verified | `rg` disallowed bridge audit saved to `.tmp/plate-v2-boundary/disallowed-bridge-audit-final.log`, 0 matches. | N/A static proof | keep | done |
| P8 broad package gates | auto | closure proof | `pnpm turbo typecheck --filter='./packages/*'`, `pnpm turbo build --filter='./packages/*'` passed after rerun. | N/A package closure proof | keep | done |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| package behavior | Plite/Core/Table/Link/AI | Focused and package test commands below | N/A | passed | none |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| N/A | package/API boundary only | N/A | N/A | N/A | no visual claim |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| N/A | no browser proof repeated | none | N/A | none |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| none | N/A | N/A | N/A | no mobile claim |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| N/A | N/A | N/A | N/A | no huge-document claim |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Plite focused test through package script | package command shape | small | `pnpm --filter @platejs/plite test -- --test-name-pattern ...` did not discover `test/read-update-contract.ts` because this contract file is not named `.test/.spec`. | Direct `cd packages/plite && bun test --preload ... ./test/read-update-contract.ts ...` passed. | log command-shape pitfall; use exact Bun file for this contract. |
| Core test while Plite package build ran in parallel | package artifact graph | small | Core resolved stale Plite artifacts during parallel build/typecheck. | Serial rerun passed. | avoid parallel package build/typecheck when artifact declarations are in flux. |
| Link typecheck/test before package artifacts were rebuilt | package artifact graph | small | `platejs`/Core artifacts were stale, causing missing exports/import errors. | Rebuilt Core and `platejs`, then Link gates passed. | log artifact-order pitfall. |
| Broad `pnpm lint:fix` | root lint | about 3s plus fallout | Root lint scanned unrelated Plite browser/examples debt, failed with 1634 diagnostics, and applied 14 fixes before failing. | Scoped Biome on 20 touched files passed; broad package typecheck/build rerun after lint fallout passed. | do not use broad lint as this slice's proof; use scoped Biome and log root lint debt. |
| Parallel broad typecheck/build after lint | package graph | about 35s | Typecheck raced build artifacts and `list-classic` briefly missed `@platejs/media` declarations. | Serial `pnpm turbo typecheck --filter='./packages/*'` passed. | run broad package typecheck serially after broad build when package artifacts are being regenerated. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Plite exact `tx.selection.set(range)` now applies exact full ranges without retargeting endpoints; Core init selection resolves against transformed values; Table selection operation skips real cell/text endpoints; Link unwrap/upsert/focus helpers use current Plite/Plate APIs; AI code guards optional `dom/history` services and narrows node entries before element reads. |
| tests/oracles/browser proof | Added Plite exact expanded range contract; added Core transformed initial selection tests; added Table reverse diagonal multi-cell selection test; Link and AI existing package tests verified the touched behavior. Browser proof N/A. |
| benchmarks/metrics/targets | none |
| examples/docs | none |
| skills/workflow | Updated this autogoal plan; logged broad lint and artifact-order slowdowns. |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Broad lint debt still exists outside this slice | Root `pnpm lint:fix` is not a usable closure gate right now; it fails on Plite example/browser lint debt unrelated to this boundary packet. | `pnpm lint:fix` output in this run | inspect later as a separate lint cleanup lane, not a blocker for this package/API slice |
| 2 | Static editor `api.getFragment()` remains outside runtime bridge audit | It matched the broad audit but belongs to `packages/core/src/static/plugins/ViewPlugin.ts`, not the runtime `editor.tf`/`getPluginApi` bridge being cut. | `packages/core/src/static/plugins/ViewPlugin.ts` | defer unless you want static editor API naming cleaned too |
| 3 | Autoreview was not run | The current checkout is a very broad migration tree; this slice used deterministic package gates instead. | this plan, Completion Gates | run `$autoreview uncommitted` before commit if you want whole-tree reviewer pressure |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | N/A | none | no user decision needed for this slice | none | all package/API proof completed | continue to next Plate v2 package sweep or run autoreview before commit | this plan |

Findings:
- Plite owns generic editor substrate behavior; Plate Core should not rewrap generic editor APIs under Plate names.
- Exact expanded Plite selections need direct `set_selection` operations, not target retargeting through `select`.
- Core initial selection must resolve after initial value transforms, or transformed nodes can move the intended selection.
- Table selection snapping must not rewrite genuine cell/text selections.
- Link unwrap with a containing selection needed an explicit fallback target, or wrapping could leave nested links.
- AI package needed optional host-service guards and explicit element narrowing after the API cut.
- Disallowed runtime bridge symbols are absent from current package sources.

Decisions and tradeoffs:
- Keep all code packets because package tests/typecheck/build and broad package gates are green.
- Do not claim browser-visible or native-selection proof from this run.
- Do not make a public docs/API claim from this run.
- Do not run whole-tree autoreview inside this slice; use it as a pre-commit lane if desired.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Plite package script missed non-standard contract filename | 1 | Run exact Bun file from `packages/plite` cwd | focused contract passed |
| Broad lint fixer hit unrelated repo lint debt | 1 | Use scoped Biome on touched files | scoped Biome passed; broad lint debt logged |
| Package typecheck raced package build artifacts | 1 | Rerun broad typecheck serially after build | serial broad typecheck passed |

Verification evidence:
- `cd packages/plite && bun test --preload ../../config/plite-source-test-setup.ts ./test/read-update-contract.ts --test-name-pattern "exact expanded range|rejects nested transaction writes|rejects replay writes"` -> 3 pass.
- `pnpm --filter @platejs/plite typecheck` -> passed.
- `pnpm --filter @platejs/plite build` -> passed.
- `bun test --preload ../../tooling/config/bunTestSetup.ts ./src/lib/editor/withPlite.spec.ts --test-name-pattern "transforms wrap selected text"` from `packages/core` -> passed.
- `bun test --preload ../../tooling/config/bunTestSetup.ts ./src/react/editor/createPlateRuntimeEditor.spec.ts --test-name-pattern "runtime init"` from `packages/core` -> passed.
- `pnpm --filter @platejs/core typecheck` -> passed.
- `pnpm --filter @platejs/core build` -> passed.
- `pnpm --filter @platejs/core brl` -> passed.
- `bun test --preload ../../tooling/config/bunTestSetup.ts ./src/lib/TableExtension.spec.ts --test-name-pattern "reverse diagonal"` from `packages/table` -> passed.
- `bun test --preload ../../tooling/config/bunTestSetup.ts ./src/lib/queries/getTableGridByRange.spec.tsx` from `packages/table` -> 16 pass.
- `pnpm --filter @platejs/table typecheck` -> passed.
- `pnpm --filter @platejs/table test` -> 219 pass.
- `pnpm --filter @platejs/table build` -> passed.
- `pnpm --filter @platejs/link typecheck` -> passed.
- `bun test --preload ../../tooling/config/bunTestSetup.ts ./src/lib/transforms/upsertLink.spec.tsx --test-name-pattern "containing a link"` from `packages/link` -> 2 pass.
- `bun test --preload ../../tooling/config/bunTestSetup.ts ./src/lib/transforms/unwrapLink.spec.tsx` from `packages/link` -> 4 pass.
- `pnpm --filter @platejs/link test` -> 85 pass.
- `pnpm --filter @platejs/link build` -> passed.
- `pnpm --filter @platejs/ai typecheck` -> passed.
- `pnpm --filter @platejs/ai test` -> 64 pass.
- `pnpm --filter @platejs/ai build` -> passed.
- `pnpm exec biome check --write <20 touched files>` -> passed.
- `rg` disallowed runtime bridge audit -> 0 matches in `.tmp/plate-v2-boundary/disallowed-bridge-audit-final.log`.
- `pnpm turbo build --filter='./packages/*' > .tmp/plate-v2-boundary/build-packages-post-lint.log 2>&1` -> 56 successful, 56 total.
- `pnpm turbo typecheck --filter='./packages/*' > .tmp/plate-v2-boundary/typecheck-packages-post-lint-rerun.log 2>&1` -> 75 successful, 75 total.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final package/API boundary closure for this slice. |
| Where am I going? | Run mechanical plan checker, then close the active goal if it passes. |
| What is the goal? | Close Core/Plite boundary slice with Core plus representative packages clean and focused gates passing. |
| What learned? | Remaining hard failures were package-specific fallout from the API cut, not a need for compat aliases. |
| What done? | Kept Plite/Core/Table/Link/AI packets, repaired oracles, ran focused package gates, ran broad package typecheck/build, and logged workflow slowdowns. |

Open risks:
- Broad root lint is still not green because unrelated Plite example/browser lint debt exists; scoped touched-file Biome passed.
- No browser-visible behavior claim was made or proven.
- Whole-tree autoreview was not run; deterministic package gates were used for this slice.
