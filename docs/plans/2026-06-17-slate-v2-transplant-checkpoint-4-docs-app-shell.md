# slate v2 transplant checkpoint 4 docs app shell

Objective:
Complete Slate v2 transplant Checkpoint 4: add a Slate docs IA under `content/docs/slate/**` and Slate example shell routes under `/examples/slate/*`, without closing browser behavior proof yet.

Goal plan:
docs/plans/2026-06-17-slate-v2-transplant-checkpoint-4-docs-app-shell.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- docs
- browser
- package-api

Automation source:
- type: continuation of user-requested Slate v2 transplant checkpoint sequence
- prompt / link: user said "go" after Checkpoint 3 pause
- lane: transplant / docs and app shell
- surface / route / package: `content/docs/slate/**`, docs navigation/source config, `apps/www` Slate example routes
- invocation mode: one checkpoint, one-shot execution, pause after completion
- minimum runtime / deadline: N/A: no timed checkpoint in this step
- completion threshold summary: Slate docs section and `/examples/slate/*` app routes exist, compile/typecheck in focused commands, and no hidden `Plate repo root` dependency is introduced.

Completion threshold:
- `content/docs/slate/**` exists as the Slate docs section, separate from the Plate docs section.
- Docs navigation/source config can discover the Slate docs section without treating Slate as Plate plugin docs.
- `/examples/slate/*` routes exist in `apps/www` as proof route shells for later browser tests.
- Routes/examples use transplanted root packages from `packages/**`, not `Plate repo root`.
- Focused docs/app compile or typecheck commands pass, or a real blocker is recorded with owner and next proof.
- This checkpoint does not port the full browser proof suite, claim final visual behavior, migrate Plate runtime, delete `Plate repo root`, create PR/commit/push, or create release changesets.
- Closure is legal only when this checkpoint's source-of-truth rows, proof commands, changed list, review-attention rows, stopping checkpoints, workflow slowdowns, and final handoff contract are complete or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-4-docs-app-shell.md` passes.

Verification surface:
- Source audit of docs/content config and app routes.
- Focused docs/app checks discovered from `apps/www/package.json` and repo scripts.
- Source audit proving no new `Plate repo root` route/doc runtime dependency.
- Optional local dev server/browser smoke only if a route can run cheaply; browser behavior proof closure remains Checkpoint 5.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-4-docs-app-shell.md`.

Constraints:
- Copy every explicit user requirement into this plan before implementation.
- Keep this checkpoint scoped; do not silently start the next checkpoint.
- Use root `VISION.md` and relevant existing docs app conventions for durable taste.
- Do not create PRs, commits, pushes, release claims, compatibility aliases, or runtime shims.
- Keep Slate and Plate docs clearly separated: `content/docs/slate/**` for Slate, `content/docs/**` for Plate.
- Publish all eight beta packages later; do not label `slate-layout` experimental.
- Pause after this checkpoint with a concise summary before continuing.

Boundaries:
- Source of truth: Checkpoint 3 tooling parity, transplanted Slate packages, current `apps/www` docs/app structure, root `VISION.md`.
- Allowed edit scope: docs content, docs source/navigation config, `apps/www` example route shell, package import examples only if needed for route compile, and this goal plan.
- Browser surfaces: route existence/smoke only; no full browser behavior proof closure.
- Package/API surfaces: import usage only; no public API shape changes or aliases.
- Agent/skill surfaces: no skill source changes unless the workflow itself blocks.
- Docs/research surfaces: `content/docs/slate/**` and minimal generated/index docs needed to make the section discoverable.
- Non-goals: Playwright/browser proof port, beta release CI, full Plate runtime migration, deleting `Plate repo root`, PR/commit/push, public aliases, runtime shims, changesets.

Output budget strategy:
- Use focused `rg --files` and package.json reads. Cap source reads to relevant docs/app config files. Do not stream huge generated docs or transplanted package trees unless a compile failure points there.

Blocked condition:
- Stop only if docs/app shell requires a public API fork, broad Fumadocs rearchitecture, or route proof cannot compile without Checkpoint 5 browser infrastructure. Otherwise keep the checkpoint scoped and finish.

Automation state:
- lane: transplant / docs and app shell
- surface: `content/docs/slate/**`, docs nav/source config, `apps/www` Slate example routes
- mode: one-shot checkpoint
- minimum_runtime: N/A
- target_deadline: checkpoint completion, then pause
- current_loop: 5
- current_checkpoint: final-handoff
- current_checkpoint_status: complete
- next_checkpoint: checkpoint-5-browser-proof
- goal_status: ready-to-close

Current verdict:
- verdict: checkpoint-complete
- confidence: 0.93
- next owner: auto
- keep / revert / quarantine call: keep
- reason: Slate docs IA and app route shells compile, routes return 200, and no hidden donor dependency was introduced. Full browser behavior proof remains the next checkpoint.

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-4-docs-app-shell.md` passes.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Evidence / exit rule |
|------------|-------|--------|----------|----------------------|
| checkpoint-zero | auto | complete | P0 | Requirements copied, root `VISION.md` read, and checkpoint boundaries recorded. |
| status | auto | complete | P0 | Current docs/app structure inspected: single `content/docs` collection, `content/docs/meta.json` nav, app routes under `apps/www/src/app/(app)`. |
| implementation | auto | complete | P0 | Slate docs IA, route shell, app package deps/aliases, and stale collaboration demo hard cut applied. |
| verification | auto | complete | P0 | `www` docs/typecheck, route HTTP smoke, and no-hidden-donor audits passed. |
| final-handoff | auto | complete | P0 | Handoff ledgers complete and pause before Checkpoint 5. |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | kept |
| 1 | Add Slate docs IA | status, implementation | `content/docs/meta.json`, `content/docs/slate/*.mdx` | Put Slate docs under `content/docs/slate/**` without making a separate docs source layer. | kept |
| 2 | Add Slate example routes | implementation | `/examples/slate`, `/examples/slate/[example]`, shared data/client files | Provide app routes for later browser proof, separate from docs pages. | kept |
| 3 | Add app package deps and source aliases | implementation, verification | `apps/www/package.json`, `apps/www/tsconfig.json`; `pnpm --filter www typecheck` | The app must resolve transplanted `@platejs/*` Slate source packages without `Plate repo root` or stale dist output. | kept |
| 4 | Hard-cut stale Plate Yjs demo imports | implementation, verification | `collaboration-demo.tsx`, `remote-cursor-overlay.tsx`, registry metadata; `pnpm --filter www typecheck` | `@platejs/yjs` now means Slate Yjs; old Plate `YjsPlugin` imports were invalid and must not be shimmed. | kept |
| 5 | Client-only Slate route island | verification | 500 before, 200 after; `slate-example-island.tsx` | Slate React editor setup is client-runtime code and crashed during server render. | kept |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Checkpoint 4 scope, non-goals, proof gates, and pause requirement copied before implementation. |
| `auto` source rule read or fallback recorded | yes | Generated `$auto` skill is absent on this branch; using `docs/plans/templates/auto.md` fallback. |
| `vision` read as checkpoint zero | yes | Root `VISION.md` read; Slate/Plate boundary and docs current-state tone apply. |
| Active goal checked or created | yes | Created Checkpoint 4 goal for this plan. |
| Lane resolved | yes | Lane: transplant/docs app shell. |
| Invocation mode and timebox recorded | yes | One checkpoint, no timed runtime, pause after completion. |
| Source of truth and allowed workspaces recorded | yes | Root repo only; `Plate repo root` must not be a route/doc runtime dependency. |
| Output budget strategy recorded | yes | Exact audits and capped file reads only. |

Work Checklist:
- [x] First checkpoint requirement extraction is complete.
- [x] Objective, threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Lane and owning workspace/package/app proof are named.
- [x] Current docs/app conventions are inspected before edits.
- [x] Checkpoint supervisor table has been reconciled after the seed.
- [x] Each loop ends with a checkpoint mutation decision.
- [x] Packet ledger contains one row per changed/proof packet.
- [x] Changed list is current and includes only this checkpoint.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Workflow slowdowns are logged or marked none.
- [x] Output budget discipline is followed.
- [x] Docs pack: Slate docs section exists under `content/docs/slate/**`.
- [x] Docs pack: docs config/navigation discovers Slate separately from Plate docs.
- [x] Browser pack: `/examples/slate/*` route shell exists and compiles.
- [x] Browser pack: Checkpoint 5 browser behavior proof is explicitly not claimed here.
- [x] Package/API pack: examples import only current `@platejs/*` package names, with no compat aliases.
- [x] Package/API pack: release artifact decision is recorded.
- [x] Package/API pack: package-owned checks or N/A reason are recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run proof commands/artifacts named in this plan | `pnpm --filter www check:docs`, `pnpm --filter www typecheck`, HTTP route smoke all passed. |
| Dynamic checkpoint reconciliation | complete | Prove the plan was updated from evidence | Mutation ledger includes source-alias, Yjs hard-cut, and client-only island updates found during proof. |
| Workspace authority proof | complete | Record cwd/tool for every proof command | All commands ran in `/Users/zbeyens/git/plate-2`. |
| Final lint/check | complete | Run scoped or root checks named by the checkpoint | Biome format for changed docs/routes; `www` docs/typecheck passed. |
| Changed list / review attention / stopping checkpoints | complete | Fill final handoff ledgers from current evidence | Ledgers below. |
| Workflow slowdown review | complete | Log slow steps or N/A | Logged below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-17-slate-v2-transplant-checkpoint-4-docs-app-shell.md` | final command passes |
| Docs source proof | complete | Audit docs source/nav config and Slate docs files | `content/docs/meta.json` and `content/docs/slate/*.mdx`; `www check:docs` passed. |
| Route compile proof | complete | Run focused `apps/www` route/docs checks | `www typecheck` passed and HTTP smoke returned 200 for every Slate docs/example route. |
| No `Plate repo root` runtime dependency | complete | `rg` audit for new docs/routes/config surfaces | No hits for `Plate repo root`, `../slate-v2`, or raw `slate`/`slate-react` imports in new docs/routes. |
| Browser behavior proof deferral | complete | Record that route shell is not Checkpoint 5 proof | Explicitly deferred; HTTP smoke proves route availability only. |
| Release artifact classification | complete | Record whether this creates user-visible package release delta | Docs/app shell and example routes are user-visible app/docs changes; no package runtime API change. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | plan created and requirements copied | status |
| Status and source read | complete | `content/docs/meta.json`, app route conventions, package scripts inspected | implementation |
| Implementation | complete | docs, route shell, deps/aliases, Yjs demo hard-cut, no-SSR island | verification |
| Verification | complete | focused docs/typecheck/audit/HTTP smoke passed | final handoff |
| Final handoff and goal-plan check | complete | ledgers complete; check-complete command passes | final response |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------|----------|------|
| Docs IA | 1 | auto | Slate docs can live under the existing docs collection as `content/docs/slate/**` with a dedicated nav band. | `content/docs/meta.json`, `content/docs/slate/*.mdx` | `pnpm --filter www check:docs` | keep | Fill full docs later. |
| Example route shell | 2 | auto | `/examples/slate/*` should be app routes, not docs pages, so browser proof can target behavior surfaces. | `apps/www/src/app/(app)/examples/slate/**` | HTTP smoke 200 for index and nine example routes | keep | Checkpoint 5 ports browser proof. |
| App source resolution | 3 | auto | `apps/www` must resolve transplanted packages from source, not stale dist or `.tmp`. | `apps/www/package.json`, `apps/www/tsconfig.json` | `pnpm --filter www typecheck` | keep | Revisit if root source-entry debt is fixed globally. |
| Collaboration demo hard cut | 4 | auto | Old Plate Yjs demo imports are invalid after `@platejs/yjs` becomes Slate Yjs; no compat shim. | `collaboration-demo.tsx`, `remote-cursor-overlay.tsx`, registry metadata | `pnpm --filter www typecheck` | keep | Plate collaboration/Yjs migration owns real replacement. |
| Client-only editor island | 5 | auto | Slate React editor setup is client-runtime only; SSR route rendering crashes transform registry. | `slate-example-island.tsx`, `[example]/page.tsx` | 500 before; HTTP smoke 200 after | keep | Browser behavior proof still pending. |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `pnpm --filter www typecheck` first pass | auto | one failed pass | App exposed two real integration issues: stale Yjs demo imports and Slate source/dist split. | Missing `YjsPlugin`/`UnifiedProvider`, then source alias fixes. | Fixed in this checkpoint. |
| Dynamic route HTTP smoke first pass | auto | one failed pass | Slate editor client was server-rendered and crashed before client runtime. | `Editor transform registry has not been initialized.` | Added no-SSR Slate example island. |
| Browser tool lane | auto | N/A | Browser-use / in-app Browser tool was not exposed in this turn. | HTTP smoke only. | Keep Checkpoint 5 as browser proof owner; do not overclaim. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | No package runtime API changes. App route shell added. Existing Plate collaboration demo and remote cursor slot hard-cut away from invalid old Yjs imports. |
| tests/oracles/browser proof | Added HTTP route smoke evidence only. No Playwright/browser behavior oracle port in this checkpoint. |
| benchmarks/metrics/targets | None. |
| examples/docs | Added Slate docs pages and Slate app example routes for plaintext, richtext, markdown shortcuts, history, selection/navigation, editable voids, custom placeholder, hidden/dom, and huge document. |
| skills/workflow | No skill source changes. Goal plan updated with discovered proof requirements. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Old Plate collaboration/Yjs demo is now a local shell | It previously imported APIs that do not exist in transplanted `@platejs/yjs`. A shim would be fake compat. | `apps/www/src/registry/examples/collaboration-demo.tsx` | Accept the hard cut for transplant; schedule Plate collaboration/Yjs migration as its own lane. |
| 2 | Checkpoint 5 browser proof is still not done | Route 200 is not editor behavior proof. | `/examples/slate/*` | Continue to Playwright/browser route proof next. |
| 3 | Slate docs are an app/docs shell, not the full public docs set | Checkpoint 4 only creates IA and entry docs. | `content/docs/slate/*.mdx` | Expand after route proof and package DX checks. |
| 4 | `@platejs/slate-legacy` still exists in `apps/www` | This is the tracked Checkpoint 1 migration scaffold, not a new compat alias. | `apps/www/package.json` | Keep until Plate runtime migration removes it. |
| 5 | Browser tool was unavailable in this runtime | I could not use the required browser plugin lane. | tool availability | Treat HTTP smoke as route availability proof only. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| C5 | soft pause | Continue to browser proof port? | This is the next lossless transplant checkpoint and must target `/examples/slate/*`. | Playwright/browser behavior suite port. | Docs/app shell can stand. | Continue with Checkpoint 5 after this pause. | `/examples/slate/*` |
| PYJS | soft pause | When to replace the Plate collaboration demo with real v2 Yjs behavior? | The stale demo was invalid after package rename; real behavior belongs to Plate migration, not route shell. | Full collaboration demo. | Shell avoids broken imports. | Defer to Plate runtime/Yjs migration lane. | `collaboration-demo.tsx` |

Findings:
- `content/docs/slate/**` works cleanly with the existing docs source and root docs nav; no separate Fumadocs source layer was needed.
- Slate example routes must be app routes because the browser proof should hit behavior pages, not MDX docs wrappers.
- Slate React editor setup is client-runtime code in this app; SSR needs a client-only island.
- `@platejs/yjs` collision exposed stale Plate Yjs demo code. Hard-cutting the demo shell was the correct no-compat move for this checkpoint.

Decisions and tradeoffs:
- Do not claim browser behavior proof in Checkpoint 4; route shell only.
- Keep `content/docs/slate/**` under the existing docs collection instead of adding another generated source layer.
- Use current `@platejs/*` imports in examples only; no raw `slate` package names and no `Plate repo root` dependency.
- Do not add compatibility shims for old Plate Yjs APIs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `pnpm --filter www typecheck` failed on stale Yjs demo imports | 1 | Hard-cut invalid demo imports instead of aliasing. | Fixed. |
| `pnpm --filter www typecheck` failed on Slate source/dist resolution | 1 | Add explicit app TS path aliases for transplanted source packages. | Fixed. |
| Dynamic `/examples/slate/*` routes returned 500 | 1 | Inspect server error and move Slate editor to no-SSR island. | Fixed. |

Verification evidence:
- `pnpm install` in `/Users/zbeyens/git/plate-2` passed and synced generated skill/docs outputs.
- `pnpm exec biome format --write content/docs/meta.json content/docs/slate/*.mdx apps/www/src/app/'(app)'/examples/slate/**/*.tsx apps/www/src/app/'(app)'/examples/slate/*.ts apps/www/src/app/'(app)'/examples/slate/*.tsx apps/www/src/registry/examples/collaboration-demo.tsx apps/www/src/registry/ui/remote-cursor-overlay.tsx apps/www/src/registry/registry-examples.ts apps/www/src/registry/registry-ui.ts` passed across the changed files.
- `pnpm --filter www check:docs` passed.
- `pnpm --filter www typecheck` passed.
- Dev server `PORT=3100 pnpm --filter www dev` started successfully.
- HTTP route smoke passed with 200 for `/docs/slate`, `/docs/slate/installation`, `/docs/slate/react`, `/docs/slate/packages`, `/docs/slate/examples`, `/examples/slate`, and every `/examples/slate/*` route.
- `rg -n "\\Plate repo root|\\.\\./slate-v2|from 'slate'|from \"slate\"|from 'slate-react'|from \"slate-react\"" content/docs/slate apps/www/src/app/'(app)'/examples/slate` returned no hits.
- `rg -n "slate-legacy" content/docs/slate apps/www/src/app/'(app)'/examples/slate apps/www/package.json` returned only the existing `apps/www/package.json` dependency.

Final handoff contract:
- Goal plan: complete; check-complete command passes.
- Lane: Slate v2 transplant Checkpoint 4, docs/app shell.
- Surface and route/package: `content/docs/slate/**`, `content/docs/meta.json`, `apps/www` Slate examples, app TS/package wiring, stale registry Yjs shell.
- Invocation mode and checkpoint count: one checkpoint, pause after completion.
- Proof: `pnpm --filter www check:docs`, `pnpm --filter www typecheck`, route HTTP smoke, no-hidden-donor audits.
- Changed list: recorded above.
- Needs your attention: old Plate collaboration demo hard cut, Checkpoint 5 browser proof, Slate docs still shell-level.
- Stopping checkpoints to unblock: C5 and PYJS recorded above.
- Residual risks: no real browser interaction proof yet; route smoke is not behavior proof.
- Next owner: auto Checkpoint 5 for browser proof.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Checkpoint 4 implementation and verification complete; final check-complete pending. |
| Where am I going? | Pause before Checkpoint 5 browser proof. |
| What is the goal? | Create Slate docs/app shell without claiming browser behavior proof. |
| What have I learned? | Existing docs source can host Slate under `content/docs/slate/**`; Slate example editors need a client-only island; stale Plate Yjs demo imports must be cut. |
| What have I done? | Added Slate docs IA, example routes, app source wiring, no-SSR editor island, and focused verification. |

Timeline:
- 2026-06-17 Auto goal plan created.
- 2026-06-17 Slate docs/app shell implemented and verified.

Open risks:
- Full browser/editor behavior proof is not complete until Checkpoint 5.
- Plate collaboration/Yjs public demo is a shell until the Plate runtime/Yjs migration lane replaces it.
