# plite declaration merge hard cut plan

Objective:
Plan Plite declaration-merge hard cut; done when score >=0.92 with source-grounded API plan; plan docs/plans/2026-06-28-plite-declaration-merge-hard-cut-plan.md.

Goal plan:
docs/plans/2026-06-28-plite-declaration-merge-hard-cut-plan.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Completion threshold:
- Ready for review when the plan chooses a no-declaration-merge Plite type architecture, cites live source for the current implementation, lists execution phases and proof gates, scores >= 0.92 with no dimension below 0.85, and `check-complete` passes.

Verification surface:
- Source audits in `packages/plite`, `packages/plite-history`, `packages/plite-react`, `packages/core`, `tooling/scripts`, `VISION.md`, `docs/vision/*.md`, and three relevant `docs/solutions/**` notes.
- Planning-only command proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plite-declaration-merge-hard-cut-plan.md`.
- Execution proof is deferred to the accepted implementation plan and listed below.

Constraints:
- Planning mode only. Do not edit Plite implementation, package docs, or tests until the user accepts this plan.
- No public compatibility aliases, no public runtime shims, no declaration merging as a Plite API story.
- Keep Plite unopinionated; Plate product typing remains above Plite and cannot hide Plite type gaps.
- Preserve creation-time extension inference, disabled-extension tombstones, duplicate extension-name latest-wins behavior, and runtime group conflict errors.

Boundaries:
- Edited now: this plan only.
- Read/audited now: `.agents/skills/auto/SKILL.md`, `.agents/skills/autogoal/SKILL.md`, `.agents/skills/plite-plan/SKILL.md`, `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `packages/plite/**`, `packages/plite-history/**`, `packages/plite-react/**`, `tooling/scripts/check-core.mjs`, relevant `docs/solutions/**`.
- Execution scope after approval: `packages/plite`, `packages/plite-history`, `packages/plite-react`, `packages/core` only where Plate consumes Plite types, `tooling/scripts/check-core.mjs`, type tests, public API tests, and Plite docs/examples if they teach the affected API.

Blocked condition:
- Block only if implementation reveals TypeScript cannot infer installed extension groups from tuples without either unacceptable casts or losing value-generic inference. No blocker found in planning.

Plite Plan lane state:
- plite_plan_lane_status: ready_for_review
- current_pass: closure-score-and-final-gates
- current_pass_status: complete
- next_pass: user-review
- next_action: wait for accepted execution request
- final_handoff_status: emitted

Current verdict:
- verdict: cut declaration merging from Plite public and internal type architecture
- confidence: 0.933
- keep / cut / revise call: cut ambient extension registries, keep extension tuple inference, revise lifecycle direct methods to include installed extension groups
- reason: current source already has the right tuple backbone; ambient group interfaces and isolated typecheck are the wrong leftover owner.

Completion rule:
- `update_goal(status: complete)` is legal only after this plan is filled, closure gates are resolved, and `check-complete` passes.
- Implementation starts only after a later explicit execution request.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read `.agents/skills/auto/SKILL.md`, `.agents/skills/autogoal/SKILL.md`, `.agents/skills/plite-plan/SKILL.md`. |
| Active goal checked or created | yes | `get_goal` returned no goal; `create_goal` created this Plite planning goal. |
| Source of truth read before edits | yes | Read `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, and live Plite source anchors listed in Findings. |
| `docs/solutions` checked for non-trivial existing-code work | yes | Read exact relevant solution notes: custom-types no ambient augmentation, declaration-merging recovery, extension composition creation-time inference. |
| Live `Plate repo root` grounding needed for current-state claims | yes | Current-state claims cite `packages/plite/src/interfaces/editor.ts`, `packages/plite-history/src/history-extension.ts`, `packages/plite-react/src/plugin/with-react.ts`, and `tooling/scripts/check-core.mjs`. |

Work Checklist:
- [x] Requirement extraction complete: user wants no declaration merging, best Plite type/source architecture, likely `as const` / tuple-inference direction, planning first.
- [x] Short objective plus lane outcome, pass schedule, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] One-pass-per-activation policy resolved: user asked for the absolute best plan; this activation completes the planning pass set and stops before implementation.
- [x] Live source grounding recorded for current implementation claims.
- [x] Issue ledger / ClawSweeper pass skipped: N/A because this is not issue-backed and no external issue claim changes.
- [x] Research and ecosystem synthesis skipped: N/A because no external editor evidence is needed; this is a TypeScript/Plite source design decision.
- [x] Intent/boundary record and decision brief complete.
- [x] Scorecard recorded with evidence; total score 0.933 and no dimension below 0.85.
- [x] Applicable implementation-skill review matrix applied or skipped with concrete reason.
- [x] Plite maintainer objection ledger complete for the breaking type/API change.
- [x] Verification workspace gate recorded for execution claims.
- [x] TDD used for behavior/proof changes skipped: N/A for planning-only; execution plan requires type contracts before source cuts.
- [x] Browser proof captured skipped: N/A for planning-only type architecture; browser proof only if docs/examples or runtime direct lifecycle facade changes affect app behavior.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Fill source-grounded plan and run check-complete | Plan completed; check-complete command recorded in Verification evidence. |
| Plite source, runtime, browser, package, public API, or issue-fix claim | yes | Record live source proof or mark as planning-only | Current API claims cite live files; implementation commands are listed as future execution gates. |
| Issue ledger or PR reference changed | no | No issue/PR/reference artifact changed | N/A: planning-only API design, no public issue claim. |
| Autoreview for uncommitted implementation changes | no | Skip because only this plan changed | N/A: no implementation code changed. |
| Final user-review handoff | yes | Emit final handoff | Final response summarizes decisions and points to this plan. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plite-declaration-merge-hard-cut-plan.md` | See Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | Live source inventory below | intent/boundary closed |
| Related issue discovery | skipped | N/A: no issue-backed claim | issue ledger skipped |
| Issue-ledger pass | skipped | N/A: no issue-backed claim | intent/boundary closed |
| Intent/boundary and decision brief | complete | Decision brief below | research skipped |
| Research, ecosystem strategy, live-source refresh | complete | Live source and `docs/solutions` notes used; external research skipped | pressure passes closed |
| Performance/DX/migration/regression/simplicity pressure passes | complete | Scorecard, objection ledger, proof matrix | objection ledger closed |
| Plite maintainer objection ledger | complete | Ledger rows below | high-risk pass closed |
| High-risk deliberate mode | complete | Premortem rows below | ecosystem pass skipped |
| Ecosystem maintainer pass | skipped | N/A: not public queue work | revision closed |
| Revision pass | complete | Chosen option revised to include direct lifecycle facade for installed groups | issue sync skipped |
| Issue sync accounting | skipped | N/A: no issue/PR references changed | closure closed |
| Closure score and final gates | complete | Score 0.933; closure gates resolved | user review |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React 19.2 runtime performance | 0.20 | 0.90 | Runtime maps stay unchanged; execution only changes type inference and optional direct lifecycle proxy for installed groups. |
| Plite-close unopinionated DX | 0.20 | 0.96 | Cuts global augmentation, keeps creation-time extension inference, and exposes groups under `editor.read`, `editor.update`, and `editor.api`. |
| Plate and collaboration migration backbone | 0.15 | 0.93 | Plate can consume typed Plite extension tokens; history/collab packages no longer mutate global Plite types. |
| Regression-proof testing strategy | 0.20 | 0.95 | Type contracts, negative contracts, runtime extension tests, `check:core`, and zero-augmentation audit listed as gates. |
| Research evidence completeness | 0.15 | 0.91 | Live source plus relevant local solution notes are enough; external research intentionally skipped. |
| shadcn-style composability and minimalism | 0.10 | 0.95 | Inline extension arrays infer types; `as const` only for hoisted arrays; no ambient setup file ceremony. |

Source-backed architecture north star:
- target shape: extension-token / tuple inference is the only type owner for installed `api`, `state`, and `tx` groups.
- source evidence: `createEditor` already uses `const TExtensions`; `EditorInstalled*Groups` already derives from resolved installed extensions; `createReactEditor` already builds `[react(), history(), ...custom] as const`.
- rejected drift: ambient `EditorStateExtensionGroups` / `EditorTxExtensionGroups`, declaration-merge tests, and `check:core` isolated declaration-merge typecheck batches.
- migration posture: breaking public type cut; no compat alias; docs teach current Plite only.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
|---------|----------------|----------------|---------------------------|----------|---------|
| Extension installation | `createEditor({ extensions: [history(), checklist()] })` with `const TExtensions` inference | Inline arrays need no `as const`; hoisted arrays use `as const` or `satisfies readonly EditorExtension[]` | Cut ambient setup files; app code moves custom groups into extension values | `packages/plite/src/create-editor.ts` overloads and `docs/solutions/...extension-composition...` | keep |
| Read groups | `editor.read((state) => state.history.undos())` and target `editor.read.history.undos()` | Callback for multi-read work; direct read group for one-off calls | Extension groups derive from installed tuple | `packages/plite/src/interfaces/editor.ts` current `EditorRead` and `EditorInstalledStateGroups` | revise |
| Update groups | `editor.update((tx) => tx.history.undo())` and target `editor.update.history.undo()` | Callback for transactions; direct update group for one-off commands | Direct facade must call `editor.update` internally, not root command APIs | `packages/plite/src/core/editor-lifecycle-api.ts` core direct update proxy | revise |
| Runtime handles | `editor.api.history.run(...)`, `editor.getApi(historyExtension)` | Host/service APIs stay under `editor.api`; token lookup remains collision-safe | No string lookup, no declaration merge | `packages/plite/src/create-editor.ts` proxy and `BaseEditor.getApi` | keep |
| Ambient registries | No `EditorStateExtensionGroups`, no `EditorTxExtensionGroups`, no `declare module '@platejs/plite'` | Zero global type setup | Hard cut; no public aliases | `rg` inventory found active uses in history, tests, index, react, and check-core | cut |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
|-------|---------------|------------------|--------|----------|---------|
| Runtime state/tx group registry | Plite runtime maps | Keep string-keyed runtime registration and conflict errors | Avoids over-typed runtime metadata or slower registration | `packages/plite/src/core/extension-registry.ts` | keep |
| Installed group type derivation | `interfaces/editor.ts` | Derive group result directly from extension descriptor/setup factory return types | Avoids global registry overriding local inference | `EditorStateSlotsFromExtension`, `EditorTxSlotsFromExtension`, `EditorStateGroupResult`, `EditorTxGroupResult` | revise |
| Extension descriptor typing | `defineEditorExtension` | Preserve literal extension object; optionally add helper aliases for state/tx group maps without ambient interfaces | Avoids exported generic ceremony at call sites | `packages/plite/src/core/editor-extension.ts` | revise |
| History typing | `@platejs/plite-history` | Export typed `HistoryExtension` carrying local history API/state/tx groups | Avoids `declare module '@platejs/plite'` and `plite-react` registry lookups | `packages/plite-history/src/history-extension.ts` | cut ambient, keep local token |
| React default typing | `@platejs/plite-react` | `ReactEditor<V, T>` = `Editor<V, readonly [ReactExtension, HistoryExtension, ...T]>` | Avoids fallback lookup through `EditorStateExtensionGroups` | `packages/plite-react/src/plugin/with-react.ts` | revise |
| Core check tooling | `tooling/scripts/check-core.mjs` | Delete isolated declaration-merge test batches after tests are no-ambient | Faster and simpler Core/Plite test typecheck | `requiresIsolatedTestTypecheck` function | cut |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
|---------|-----------------|------------------|------------------|----------|---------|
| React editor creation | `createReactEditor({ extensions: [myExtension] })` | React installs `react()` and `history()` first; custom tuple appends | Type-only change; no render behavior change | `packages/plite-react/src/plugin/with-react.ts` | keep |
| Dynamic extension install | `editor.extend(extension)` remains runtime-only cleanup | Typed install belongs to creation-time tuple; dynamic refinement is not promised | Avoids fake TS mutation of an existing variable | `BaseEditor.extend` returns cleanup only | keep |
| Direct lifecycle facade | `editor.read.<group>.*`, `editor.update.<group>.*` for installed groups | Same group names as callback `state`/`tx`; no root clutter | Proxy reads/writes through existing `read`/`update`, no new runtime owner | `editor-lifecycle-api.ts` already proxies core groups | add in execution |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
|----------|------------------------|------------------------|----------|---------|---------|
| Plate plugin tx/api inference | Plite exposes tuple-derived `Editor<V, TExtensions>` only | Plate plugin tuple inference maps to Plite extensions; no ambient Plite augmentation from Plate | Do not redesign Plate plugin API in this plan | `packages/core/src/lib/plugin/BasePlugin.ts`, `packages/core/src/lib/editor/withPlite.ts` seen as consumers | keep boundary |
| Core/Plite check speed | No isolated declaration-merge type batches | `check:core` can typecheck test files in one generated config per package | Do not broaden to all Plate packages | `tooling/scripts/check-core.mjs` | improve |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
|----------|------------------------|---------------------|----------|---------|---------|
| Yjs/history typing | Collaboration extensions carry their own state/tx/API groups as tokens | Future Yjs extension follows history pattern without declaring into Plite | Do not design Yjs product UI now | Plite history is current concrete extension package | keep |

Intent / boundary record:
- intent: remove declaration merging as a Plite mechanism and replace it with local extension-value inference.
- outcome: a reviewable execution plan that can hard-cut ambient group types without losing extension DX.
- in-scope: Plite source types, history/react extension typings, type contracts, `check:core` declaration-merge exception, docs/examples that teach extension typing.
- non-goals: public queue work, Plate v2 plugin redesign, browser behavior optimization, runtime behavior changes beyond direct lifecycle facade if accepted.
- decision boundaries: implementation waits for user acceptance; if TypeScript inference fails for generic history groups, return for review with minimal failing fixture.
- unresolved user-decision points: none; recommendation is firm.

Decision brief:
- principles: local value inference beats global mutation; creation-time extension lists are the public composition source; direct lifecycle methods are sugar over `read`/`update`, not root commands.
- top drivers: declaration merging causes hidden global state, isolated typecheck batches, impossible per-editor extension isolation, and worse agent maintainability.
- viable options: keep ambient registries; cut all groups and require casts; infer from extension tuple only; token-only API with no `state`/`tx` groups.
- chosen option: infer `api`, `state`, and `tx` groups from installed extension values; remove ambient registries; add direct lifecycle facade for installed extension groups.
- rejected alternatives: global module augmentation, CustomTypes-style setup files, stringly `getApi`, root `editor.history` commands, and casts in tests/docs.
- consequences: breaking type migration for any consumer augmenting Plite; cleaner package boundaries; simpler test typecheck; stronger per-editor typing.
- follow-ups: execute plan, then update Plite docs/examples and any Plate Core consumers that relied on ambient group types.

Issue accounting:
| Issue / cluster | Claim category | Exact claim | Why | Proof route | V2 sync ledger | PR line |
|-----------------|----------------|-------------|-----|-------------|----------------|---------|
| N/A | no issue | No GitHub issue/PR claim changes | Planning-only API design | N/A | N/A | N/A |

Issue-ledger sync status:
- ClawSweeper related-issue pass: N/A, no issue-backed claim.
- generated live gitcrawl rows read: N/A.
- manual v2 sync ledger update: N/A.
- fork issue dossier update: N/A.
- issue coverage matrix update: N/A.
- PR description sync: N/A.

Ecosystem strategy synthesis:
| System | Source | Mechanism | Avoids | Steal | Reject | Plite target | Verdict |
|--------|--------|-----------|--------|-------|--------|--------------|---------|
| TypeScript local source | `packages/plite/src/create-editor.ts`, `packages/plite/src/interfaces/editor.ts` | `const TExtensions` tuple inference plus installed group derivation | global ambient mutation | preserve tuple inference | ambient registries | descriptor-derived groups | keep |
| Local solution memory | three `docs/solutions/developer-experience/*plite*` notes | prior failure evidence | repeating CustomTypes/ambient pollution | creation-time inference | site-wide augmentation | no ambient setup files | keep |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Plite target | Proof route | Owner | Status |
|------------------|-----------------|--------------|-------------|-------|--------|
| Extension state group inference | Ambient `EditorStateExtensionGroups` made `state.foo` typed globally | Installed extension tuple makes `state.foo` typed only on that editor | Rewrite `generic-extension-install-contract.ts` and `extension-namespace-contract.ts` without `declare module` | Plite execution | planned |
| Extension tx group inference | Ambient `EditorTxExtensionGroups` made `tx.foo` typed globally | Installed extension tuple makes `tx.foo` typed only on that editor | Negative plain-editor and disabled-extension type tests | Plite execution | planned |
| History default in React | `plite-react` reads global history group interfaces | React tuple includes typed `HistoryExtension` | `plite-react` typecheck and React editor history type contract | Plite React execution | planned |
| Tooling speed | `check:core` isolates declaration-merge tests | One generated typecheck config per package | `pnpm check:core` after deleting isolated branch | Tooling execution | planned |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
|---------|----------|----------------|------------------------|-----------------|--------|
| Extension typing only | No browser behavior touched | N/A | N/A for planning; if direct lifecycle facade changes runtime proxy, run package tests first and browser only if docs/examples route changes | No browser claim | N/A |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
|-------|-----------|---------|--------|-------|
| Source inventory includes active ambient Plite group users | `/Users/zbeyens/git/plate-2` | `rg -n "declare module '@platejs/plite'|EditorStateExtensionGroups|EditorTxExtensionGroups|requiresIsolatedTestTypecheck" packages/plite packages/plite-react packages/plite-history tooling/scripts --glob '!**/dist/**' --glob '!**/node_modules/**'` | Found active uses in `plite-history`, `plite`, `plite-react`, tests, `check-core` | planning |
| Existing tuple inference backbone exists | `/Users/zbeyens/git/plate-2` | source read: `create-editor.ts`, `interfaces/editor.ts`, `with-react.ts` | `const TExtensions`, `EditorInstalled*Groups`, and React default tuple already exist | planning |
| Future implementation proof | `/Users/zbeyens/git/plate-2` | `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/plite-react --filter=./packages/core` | To run in execution mode | Plite execution |
| Future package tests | `/Users/zbeyens/git/plate-2` | `pnpm --filter @platejs/plite test && pnpm --filter @platejs/plite-history test && pnpm --filter @platejs/plite-react test` | To run in execution mode | Plite execution |
| Future core/plite integrated proof | `/Users/zbeyens/git/plate-2` | `pnpm check:core` | To run after deleting isolated declaration-merge branch | Plite/Core execution |
| Future zero-ambient audit | `/Users/zbeyens/git/plate-2` | `rg -n "declare module '@platejs/plite'|EditorStateExtensionGroups|EditorTxExtensionGroups" packages/plite packages/plite-react packages/plite-history tooling/scripts --glob '!**/dist/**' --glob '!**/node_modules/**'` | Must return no active matches | Plite execution |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| vercel-react-best-practices | no | N/A | No React component behavior change in plan | none |
| performance | yes | applied as pressure lens | Runtime maps stay; no hot path rewrite required | direct facade must proxy existing lifecycle only |
| tdd | yes | planned for execution | Type contracts must be rewritten before source cut | proof gates added |
| shadcn | no | N/A | No UI/component composition surface | none |
| react-useeffect | no | N/A | No React effects touched | none |

High-risk deliberate-mode pre-mortem:
| Risk | Trigger | Failure mode | Mitigation | Proof | Status |
|------|---------|--------------|------------|-------|--------|
| Generic history loses `Value` inference | Cutting ambient `EditorStateExtensionGroups<V>` | `state.history.undos()` becomes `Batch<Value>[]` instead of `Batch<CustomValue>[]` | Make `HistoryExtension` carry generic factory return types locally | Type contract with `createEditor<CustomValue>({ extensions: [history()] })` | planned |
| Direct lifecycle facade overpromises dynamic extensions | Adding `editor.read.history` / `editor.update.history` | Dynamic `editor.extend(history())` appears typed when it is not | Type direct groups only from creation-time `TExtensions`; dynamic extension stays runtime-only | Negative dynamic-extension type contract | planned |
| Plate consumes broken Plite group types | Changing Plite extension generics | Core plugin tx inference regresses | Run Core typecheck and focused plugin tx tests; do not hide with `any` | `pnpm check:core` plus targeted Core type specs | planned |
| Runtime conflict semantics drift | Changing group type derivation | Duplicate group conflicts stop throwing or latest-wins changes incorrectly | Do not touch runtime registry semantics; keep existing tests | Package tests | planned |

Plite maintainer objection ledger:
| Change | Objection | Tradeoff | Evidence | Migration/docs/proof answer | Verdict |
|--------|-----------|----------|----------|-----------------------------|---------|
| Remove ambient extension group interfaces | Existing consumers may like `declare module` setup files | Break once to remove global state and per-test isolation | Current active uses are internal/test/history only by source audit | Docs teach `extensions: [...]`; tests prove no ambient setup | keep |
| Use extension tuple as only type source | Hoisted arrays may need `as const` | Honest TypeScript tuple boundary beats global magic | `createEditor` already uses `const TExtensions`; docs/solutions endorse creation-time inference | First examples inline arrays; advanced docs mention `as const` for hoisted arrays | keep |
| Add direct lifecycle facade for installed extension groups | More runtime proxy surface | Same lifecycle namespace, less callback boilerplate, no root clutter | Core direct read/update proxies already exist | Package tests prove it calls through `read`/`update` | keep |
| Remove `check:core` isolated declaration-merge batches | If tests still need ambient, typecheck fails | Good failure; ambient use is now forbidden | `requiresIsolatedTestTypecheck` exists only for `declare module '@platejs/plite'` | Delete after no-ambient test rewrite | keep |

Hard cuts and rejected alternatives:
| Option / API | Keep / cut / reject | Why | Migration cost | Evidence | Follow-up |
|--------------|---------------------|-----|----------------|----------|-----------|
| `EditorStateExtensionGroups` export | cut | Public global extension registry is declaration-merging API | Consumers move group typing into extension values | Exported from `packages/plite/src/index.ts` | execution |
| `EditorTxExtensionGroups` export | cut | Same issue for tx groups | Same | Exported from `packages/plite/src/index.ts` | execution |
| `declare module '@platejs/plite'` in history/tests | cut | Cross-package global mutation | Rewrite history token and type tests | Active matches found by rg | execution |
| Fallback/cast-based tests | reject | Hides lost inference | Replace with positive/negative type contracts | Existing tests use ambient declarations | execution |
| Dynamic `editor.extend` type refinement | reject for now | TS cannot honestly mutate an already-bound editor variable | Dynamic install remains runtime-only | `BaseEditor.extend` returns cleanup | document in tests/docs |
| Full Plate plugin API redesign | defer | Not required to cut Plite declaration merging | None now | Plate is consumer, not owner | route to `plate-plan` later |

Plan deltas from review:
- Initial direction was only "cut declaration merging"; revised target also types direct lifecycle extension groups so the new architecture improves DX rather than only deleting.
- Historical `docs/solutions` declaration-merging recovery is treated as superseded by current Plite vision and user direction, not ignored.
- Runtime maps are explicitly kept; this is not a runtime registry rewrite.

Open questions and decision-changing evidence:
| Question | Why it matters | Evidence needed | Owner | Status |
|----------|----------------|-----------------|-------|--------|
| Can generic `HistoryExtension` preserve `V` without ambient interfaces? | It is the hardest type case | Failing/passing type fixture during execution | Plite execution | no blocker; plan has mitigation |
| Should direct lifecycle facade ship in same packet? | It broadens runtime proxy surface | If type-only cut is large, split after no-ambient cut | Plite execution | recommendation: include if simple, split if it delays core cut |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| 1. Type-test red pass | plite-plan execution | Rewrite/add no-ambient type contracts first | User accepts plan | Tests fail until ambient registries are removed or source is fixed | `tsc`/package typecheck targeted files |
| 2. Core type architecture cut | plite-plan execution | Remove `EditorStateExtensionGroups` / `EditorTxExtensionGroups`; derive results from extension factory returns | Red tests exist | Plite compiles; installed groups infer from tuples | Plite typecheck |
| 3. History/React token typing | plite-history/plite-react | Make `history()` and `createReactEditor()` carry local group types | Core type cut compiles | History and React editor types work without ambient imports | package typecheck/tests |
| 4. Direct lifecycle facade | plite execution | Add installed extension groups to `EditorRead` / `EditorUpdate` direct method surfaces if not too invasive | tuple group types stable | `editor.read.history.*` / `editor.update.history.*` type and runtime tests pass | Plite tests |
| 5. Tooling hard cut | tooling owner | Remove isolated declaration-merge typecheck path | no active `declare module` tests | `check:core` has no declaration-merge branch and passes | `pnpm check:core` |
| 6. Docs/examples cleanup | docs-creator if touched | Update Plite docs/examples that mention custom extension typing | Source/tests green | Docs teach no ambient setup files | `pnpm --filter www check:docs` if docs touched |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact check | plate-2 | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plite-declaration-merge-hard-cut-plan.md` | plan/template integrity | run at close |
| active ambient inventory | plate-2 | `rg -n "declare module '@platejs/plite'|EditorStateExtensionGroups|EditorTxExtensionGroups|requiresIsolatedTestTypecheck" packages/plite packages/plite-react packages/plite-history tooling/scripts --glob '!**/dist/**' --glob '!**/node_modules/**'` | current cut list | complete |
| execution typecheck | plate-2 | `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/plite-history --filter=./packages/plite-react --filter=./packages/core` | package type graph | planned |
| execution tests | plate-2 | `pnpm --filter @platejs/plite test && pnpm --filter @platejs/plite-history test && pnpm --filter @platejs/plite-react test` | runtime/type contracts | planned |
| integrated Core/Plite gate | plate-2 | `pnpm check:core` | Core + Plite source/test/type integration | planned |

Final user-review handoff outline:
- accepted plan items: cut ambient group registries; infer from extension tuple; preserve runtime maps; type direct lifecycle groups; delete tooling exception.
- before / after API shape: `declare module '@platejs/plite'` -> `createEditor({ extensions: [myExtension] })` and extension-carried groups.
- hard cuts: `EditorStateExtensionGroups`, `EditorTxExtensionGroups`, history module augmentation, declaration-merge tests, isolated check-core branch.
- issue claims and non-claims: no issue claim.
- proof gates: source audit, type contracts, package tests, `check:core`, zero-ambient audit.
- accepted-plan execution handoff: run `plite-plan` execution or `auto` with this plan path after approval.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score >= 0.92 and no dimension below 0.85 | scorecard rows cite evidence | complete: 0.933, min dimension 0.90 |
| all pass rows complete or skipped with evidence | phase/pass table closed | complete |
| issue/reference sync closed | issue-ledger sync status closed | complete: N/A |
| live source grounding complete | source-backed rows cite current owners | complete |
| workspace verification recorded | verification workspace gate closed | complete for planning; execution gates listed |
| autoreview clean or N/A | no implementation code changed | complete: N/A |
| final handoff emitted or lane remains open for review | final response summarises plan | complete after final response |
| `check-complete` passes | `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plite-declaration-merge-hard-cut-plan.md` | complete after command pass |

Findings:
- `packages/plite/src/create-editor.ts` already uses `const TExtensions`, so inline extension arrays can infer installed extension types.
- `packages/plite/src/interfaces/editor.ts` already has `EditorInstalledStateGroups`, `EditorInstalledTxGroups`, and `EditorInstalledApiGroups`; the bad part is the ambient registry fallback through `EditorStateExtensionGroups` / `EditorTxExtensionGroups`.
- `packages/plite-history/src/history-extension.ts` is the only active package source with `declare module '@platejs/plite'`.
- `packages/plite-react/src/plugin/with-react.ts` imports `EditorStateExtensionGroups` / `EditorTxExtensionGroups` to infer history fallback types; it should depend on the history extension token type instead.
- `tooling/scripts/check-core.mjs` isolates tests that contain `declare module '@platejs/plite'`; this is tooling debt created by declaration merging.
- `docs/solutions/developer-experience/2026-05-17-plite-extension-composition-hard-cuts-need-creation-time-inference-and-browser-proof.md` supports creation-time inference and disabled-extension tombstones.
- `docs/solutions/developer-experience/2026-04-15-plite-custom-types-path-recovery-must-not-reintroduce-global-ambient-site-augmentation.md` warns against broad ambient augmentation.
- `docs/solutions/developer-experience/2026-04-15-plite-package-declaration-merging-recovery-must-start-from-base-aliases-not-example-casts.md` is now superseded for public direction but useful as a list of failure modes to avoid.

Decisions and tradeoffs:
- Cut global declaration merging: worth the breaking type change because it removes hidden global state and makes per-editor extension sets honest.
- Keep runtime extension maps: runtime registration/conflict behavior is already correct and should not be rearchitected for a type-only problem.
- Use extension descriptor return types as source of truth: the extension value knows its `api`, `state`, and `tx`; Plite should not ask a global interface to repeat it.
- Add direct lifecycle extension groups if implementation stays small: it converts the cut into a DX win, not just a cleanup.
- Keep `editor.extend` runtime-only for typing: fake dynamic type mutation would be worse than requiring creation-time extension lists for typed groups.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `docs/solutions` scan streamed noisy matches because `BaseEditor` widened the query | 1 | Read exact relevant solution notes only | Corrected; note recorded for next activation |

External/browser findings:
- No external web/browser evidence used.
- No browser behavior claim made.

Timeline:
- 2026-06-28T19:29:17Z Plite Plan goal plan created.
- 2026-06-28T19:34:09Z Live source inventory and prior solution notes read.
- 2026-06-28T19:34:09Z Plan filled with no-declaration-merge target architecture and execution gates.

Verification evidence:
- Source audit: active declaration-merge surfaces found in `packages/plite-history/src/history-extension.ts`, `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/index.ts`, `packages/plite-react/src/plugin/with-react.ts`, three Plite type tests, and `tooling/scripts/check-core.mjs`.
- Source audit: docs/content have no active `declare module '@platejs/plite'` teaching surface outside historical solution/changelog material.
- Command to run at close: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plite-declaration-merge-hard-cut-plan.md`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Planning goal complete, waiting for check-complete and user review. |
| Where am I going? | Stop before implementation unless user accepts execution. |
| What is the goal? | Pick the best Plite no-declaration-merge type architecture. |
| What have I learned? | Tuple inference exists; ambient group registries are the leftover wrong owner. |
| What have I done? | Created and filled the Plite plan with source-backed decisions and proof gates. |

Open risks:
- Execution may reveal history's generic `V` inference needs a small helper type or explicit `HistoryExtension` descriptor. That is expected and should be handled in phase 3, not by restoring ambient interfaces.
