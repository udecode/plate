# plate-next SlateEditor drift review

Objective:
Deep review `packages/core/src/lib/editor/SlateEditor.ts` against
`origin/main` and decide whether the current Plite-backed type boundary has any
drift regression or cleanup blocker.

Goal plan:
docs/plans/2026-07-02-plate-next-slateeditor-drift-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked: "deep review packages/core/src/lib/editor/SlateEditor.ts has 0 drift regression vs. from main? fully clean ? [$plate-next]"
- mode: named file/API review packet
- target surface: `packages/core/src/lib/editor/SlateEditor.ts` compared to
  `origin/main:packages/core/src/lib/editor/SlateEditor.ts`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: source audit only; no code correction
  was required
- completion threshold summary: source map read, main/current diff classified,
  exported type surface reviewed, old compatibility names audited, focused
  type/lint proof green, and final verdict recorded

First checkpoint:
- Target: `packages/core/src/lib/editor/SlateEditor.ts`.
- Explicit ask: deep review for drift regression versus main and answer whether
  fully clean.
- Duration: none.
- Stop condition: stop if a public API fork or missing Plite/Plate primitive is
  needed; otherwise close after named-file proof.
- Deliverable: verdict, reviewed APIs, drift matrix, related sweep, proof
  commands, blockers, and next owner.
- Broad sweep wording: not present; this is a named-file packet.

Timed checkpoint:
- requested duration: none
- semantics: not timed
- initial confidence score: 60 before source read because this is a public type
  boundary with large drift from main
- improvement loop: compare current/main, inspect callers/type-tests, audit
  removed names, run proof
- final score / loop closure: 96; no behavior/type drift regression found, but
  the filename `SlateEditor.ts` remains stale naming debt by review-mode rename
  freeze

Completion threshold:
- Done when the current file and main file are read, the old `SlateEditor` /
  `TSlateEditor` / `tf` / `transforms` / `getApi` / `getTransforms` surface is
  classified, plugin API/tx inference is checked through type-tests, extracted
  target-scope files are inventoried, proof passes, and this plan passes
  `check-complete`.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep does not apply.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Bridge scoring law checked: no forbidden bridge import/install in target file.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-slateeditor-drift-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: no runtime spec targets this type-only file; use
  Core type-test compilation instead
- package proof: `pnpm --filter @platejs/core typecheck`,
  `pnpm --filter @platejs/core lint`, `pnpm check:core`
- source audits:
  - `git show origin/main:packages/core/src/lib/editor/SlateEditor.ts`
  - current `packages/core/src/lib/editor/SlateEditor.ts`
  - current `packages/core/src/react/editor/PlateEditor.ts`
  - current `packages/core/type-tests/*`
- related Core sweep query / match count / patched count / deferred count:
  completed for old Slate/Plate editor compatibility names and target-scope
  untracked files
- Plite/Plate gap ledger: no blocking gap
- broad Core drift ledger gate: not applicable
- final plan check:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-slateeditor-drift-review.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- Review-mode rename freeze applies. The stale filename is recorded as naming
  debt, not renamed in this packet.
- Extracted-file recovery gate applies to target scope.
- For Core-only targets, ignore non-Core package errors unless caused by the
  current Core/API change.

Boundaries:
- allowed edit scope: this plan only unless the review finds a safe target-file
  fix
- package/API surfaces: Core editor type boundary, plugin API merge, plugin tx
  merge, plugin state merge, plugin registry typing, base/react editor handoff
- docs/browser surfaces: none
- non-goals: broad Core sweep, rename pass, restoring old `SlateEditor` /
  `TSlateEditor` compatibility, Plate v2 full design
- out-of-scope package errors: non-Core packages unless caused by this file

Output budget strategy:
- Use targeted source maps, type-test references, audit counts, and concise
  verdict rows.

Blocked condition:
- none; no public API fork or missing primitive blocks this file.

Current verdict:
- verdict: clean for runtime/type drift; not rename-finished
- confidence: 98
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: the file correctly hard-cuts old Slate editor aliases and models
  Plate's BaseEditor as a Plite editor plus Plate plugin/runtime typing. Type
  contracts prove plugin API/tx/value inference. The stale installed-plugin
  placeholder aliases are cut; the only remaining `Record<string, any>` use is
  the explicit `P = any` escape hatch. Plate plugin type algebra now has a
  private Core owner instead of bloating the public editor type file. The stale
  filename remains because review-mode rename freeze forbids churn.

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero | complete | Prompt target, main comparison, proof, non-goals, and final handoff captured before implementation. | Done. |
| Source map | complete | Current `SlateEditor.ts`, origin/main `SlateEditor.ts`, `PlateEditor.ts`, and type-tests read. | Done. |
| Review matrix | complete | Old Slate aliases hard-cut; current BaseEditor-on-Plite type boundary kept; plugin type algebra extracted; stale filename deferred. | Done. |
| Proof | complete | Core typecheck, lint, and `check:core` passed after extraction. | Done. |
| Closeout | complete | Plan ledgers filled and check-complete rerun. | Final handoff. |

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Target, main comparison, clean verdict threshold, proof, and final handoff captured. |
| `plate-next` skill/rule read | yes | Skill body read before source work. |
| Active goal checked or created | yes | Created this file-backed autogoal plan. |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Best Plite-fit, no compatibility restoration. |
| Broad Core drift ledger initialized when in scope | N/A | Not broad Core. |
| Source of truth and allowed workspace recorded | yes | Current checkout and `origin/main` file evidence. |
| Output budget strategy recorded | yes | Targeted reads/audits and summarized matrices. |
| Public API fork routing checked | yes | No fork needed. |
| Gap policy checked | yes | No Plite/Plate gap blocks the file. |
| Related Core sweep policy checked | yes | Audits recorded. |
| Review-mode rename freeze checked | yes | Stale filename recorded, not renamed. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | Core typecheck, lint, and `check:core` passed after extraction. |
| Broad Core drift ledger coverage | N/A | Not broad Core | Named file packet. |
| Score gate | yes | Record score and owners | Target score 98; only stale filename naming debt remains. |
| Best Plate v2 recommendation | yes | Record current shape and rejected old API | Keep BaseEditor as Plate-on-Plite type boundary. |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No blocking gap. |
| Related Core sweep after correction | yes | Record searches | Installed-plugin aliases removed and type algebra extracted; source audits completed. |
| Package/API proof | yes | Run focused typecheck/lint/check | Core proof passed after extraction. |
| Non-Core package error triage | N/A | No non-Core errors | N/A. |
| Source audit | yes | Audit old compatibility names | Exact audit returned no matches except filename/import path references. |
| Rename ledger | yes | Record rename freeze decision | Stale file path deferred to explicit rename pass. |
| Extracted-file inventory | yes | Inventory target scope | One target-scope untracked file recorded: `pluginRuntimeTypes.ts`. |
| Autoreview / review | N/A | Source review only | Manual source review plus type proof. |
| Final lint/check | yes | Run scoped lint/check | Core lint/typecheck passed; `check:core` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run check-complete | passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `origin/main:packages/core/src/lib/editor/SlateEditor.ts` | 0 | source-map only | main evidence | Main file typed old `@platejs/slate` editor with direct `dom`, `meta`, `tf`, `transforms`, `getApi`, and `getTransforms`. | Used as old behavior evidence, not final API target. |
| `BaseEditor<V, P>` | 0 | keep-in-plate | Core over Plite | Current type composes `PliteRuntimeBaseEditor` with Plate identity, runtime, and plugin runtime. | Keep. |
| `PlateInstalledExtension<P>` | 1 | keep-in-plate | Core plugin typing | This is the type-level bridge that makes Plite understand Plate plugin API/state/tx groups. It is not a runtime bridge dump. | Keep; later type simplification only if inference stays green. |
| `pluginRuntimeTypes.ts` | 0 | keep-in-plate | Core plugin typing | Private Core type owner for Plate plugin input normalization, API override widening, plugin tx/state inference, and the Plate-to-Plite extension type bridge. Not exported by the editor barrel. | Keep. |
| `InstalledPluginApi<P>` / `MergeEditorApiUnion<T>` | 0 | keep-in-plate | Core plugin typing | Type-tests prove duplicate editor API overrides widen stale literals and custom plugin APIs stay inferred. Stale `AnyInstalledPluginApi` / `UnknownInstalledPluginApi` aliases are gone. | Keep. |
| `InstalledPluginTx<P>` | 0 | keep-in-plate | Core plugin typing | Type-tests prove `editor.update((tx) => tx.plugin...)` inference and invalid args fail. Stale `AnyInstalledPluginTx` / `UnknownInstalledPluginTx` aliases are gone. | Keep. |
| `InstalledPluginState<P>` | 0 | keep-in-plate | Core plugin typing | Provides extension state slot for Plate plugin state; no stale direct editor mirror. Stale `AnyInstalledPluginState` / `UnknownInstalledPluginState` aliases are gone. | Keep. |
| `PlateEditorRuntime` | 1 | keep-in-plate | Plate runtime metadata | Keeps Plate-owned plugin caches, input rules, shortcuts, and identity under `runtime`, not old Slate direct state. | Keep. |
| `GetPluginOption` / `GetBasePlugin` | 1 | keep-in-plate | Core plugin options | Preserves typed options/selectors and `getPlugin` return shape without `getApi` / `getTransforms`. | Keep. |
| Deleted `SlateEditor` / `TSlateEditor` exports | 0 | hard-cut | Core public API | Current file exports no `SlateEditor` or `TSlateEditor`; source audit found no current type references. | Keep cut. |
| Deleted `tf` / `transforms` / `getApi` / `getTransforms` | 0 | hard-cut | Core public API | Current file does not expose old transform/API aliases. | Keep cut. |
| File path `SlateEditor.ts` | 2 | defer-with-owner | Core rename debt | File now exports `BaseEditor` only, but path remains old for review-mode stability and barrel continuity. | Defer to explicit rename pass; do not rename in this packet. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| `SlateEditor.ts` type surface | Keep current `BaseEditor<V, P>` as Plate-on-Plite type boundary. | Do not restore `SlateEditor`, `TSlateEditor`, `tf`, `transforms`, `getApi`, `getTransforms`, direct `children`, direct `dom`, or old `meta` mirrors. | Plite owns editor substrate; Plate adds plugin/runtime typing and product composition. | Medium only for later rename from `SlateEditor.ts` to a better file name. |
| `pluginRuntimeTypes.ts` private owner | Keep as private Core plugin type algebra, not a Plite move and not a public export. | Do not move Plate plugin semantics into Plite; do not leave the algebra dumped at the top of `SlateEditor.ts`. | Plite extension merging is generic; Plate plugin config normalization and override widening are Plate semantics. | Low. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No blocking missing primitive found. | N/A | N/A | Existing type/lint/check proof. | Keep. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Old Slate editor type names | `rg -n "\\bSlateEditor\\b|\\bTSlateEditor\\b|getApi\\(|getTransforms\\(|editor\\.tf\\b|editor\\.transforms\\b|@platejs/slate" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 6 path-only / import-path references to `SlateEditor.ts` as a filename | 0 | 6 stale filename references | Naming debt only; no old type/API usage. |
| Target old aliases | `rg -n "\\b(EditorApi|EditorBase|EditorTransforms|InferTransforms|TSlateEditor|SlateEditor|tf|transforms|getApi|getTransforms|KeyboardEventLike|AnyEditorPlugin|EditorPlugin)\\b|@platejs/slate|children: V|dom:|meta: EditorBase" packages/core/src/lib/editor/SlateEditor.ts` | 0 | 0 | 0 | None. |
| Installed-plugin placeholder aliases | `rg -n "AnyInstalledPlugin|UnknownInstalledPlugin|InferInstalledPlugin(Api|Tx|State)" packages/core/src/lib/editor/SlateEditor.ts` | 0 | 1 | 0 | None. |
| Type algebra extraction audit | `rg -n "type IsAny\|type IsUnknown\|type MergeEditorApiUnion\|type InstalledPlugin\|type PlateInstalledExtension\|UnionToIntersection\|EditorExtensionTypeProvider\|InferApi\|InferTx\|InferState" packages/core/src/lib/editor/SlateEditor.ts packages/core/src/lib/editor/pluginRuntimeTypes.ts` | 26 in `pluginRuntimeTypes.ts`, 0 in `SlateEditor.ts` | 1 | 0 | Type algebra now has one private owner. |
| Broad `Record<string, any>` check | `rg -n "Record<string, any>" packages/core/src/lib/editor/SlateEditor.ts packages/core/src/lib/editor/pluginRuntimeTypes.ts` | 3 | 0 | 0 | All three matches are guarded by `IsAny<P>` for the explicit broad editor escape hatch in `pluginRuntimeTypes.ts`. |
| Target untracked inventory | `git ls-files --others --exclude-standard packages/core/src/lib/editor packages/core/type-tests \| sort` | 1 | 1 | 0 | `pluginRuntimeTypes.ts` is the accepted private Core type owner. |

Core drift ledger:
- Applies: N/A
- Manifest command: N/A; user asked named file review, not broad Core sweep.
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this plan
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A for broad ledger; named-file score gate closed above.
- Top drift rows: stale file path `SlateEditor.ts` only.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/editor/SlateEditor.ts` | 1 | defer-with-owner | Core type surface | Type/API surface is clean and type algebra moved out; filename is stale. | Rename only in explicit rename pass. |
| `packages/core/src/lib/editor/pluginRuntimeTypes.ts` | 0 | keep-in-plate | Core plugin typing | New private owner for Plate plugin type inference; no barrel export. | Keep. |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| source review | Core type surface | Current file may hide old Slate editor compat. | Read current/main file, callers, type-tests. | keep | None. |
| old compatibility audit | Core type surface | `SlateEditor`/`TSlateEditor`/`tf`/`getApi` could remain. | Source audits listed above. | keep cut | None. |
| installed-plugin alias cleanup | Core type inference | Placeholder aliases used `Record<string, any>` / `{}` names that looked like final API doctrine. | `packages/core/src/lib/editor/SlateEditor.ts`, Core typecheck/lint/check. | keep | None. |
| plugin type algebra extraction | Core type inference | The top of `SlateEditor.ts` was becoming a type-algebra dump. | `packages/core/src/lib/editor/SlateEditor.ts`, `packages/core/src/lib/editor/pluginRuntimeTypes.ts`, Core typecheck/lint. | keep | None. |
| stale filename | Core naming | File path is old, but rename churn is forbidden in this packet. | `packages/core/src/lib/editor/SlateEditor.ts`, barrel, imports. | defer | Explicit rename pass only. |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/lib/editor/pluginRuntimeTypes.ts` | keep-in-plate | No `origin/main` owner; extracted from current `SlateEditor.ts` after user accepted source-shape cleanup. | Keep as private Core type owner; not exported from `index.ts`. | Core typecheck and lint passed. |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | No failures. | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/core/src/lib/editor/SlateEditor.ts`: removed six installed-plugin placeholder aliases and three dead inference helper aliases; extracted private plugin type algebra to `packages/core/src/lib/editor/pluginRuntimeTypes.ts`; kept `Record<string, any>` only inside the explicit `P = any` escape hatch. |
| tests/proof | Ran Core typecheck, lint, and `check:core` after extraction. |
| docs/templates/skills | Created/updated this autogoal plan. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `SlateEditor.ts` filename | The type is now `BaseEditor`, but the old filename remains. Renaming now would create churn in a review packet. | `packages/core/src/lib/editor/SlateEditor.ts` | Defer to a deliberate rename pass. |
| 2 | `P = any` escape hatch | `Record<string, any>` still exists only when the caller explicitly asks for an any-typed editor. | `packages/core/src/lib/editor/pluginRuntimeTypes.ts` | Keep as the broad `AnyPlateEditor` escape hatch; do not let it leak into normal inference. |
| 3 | Type machinery size | The machinery is still complex because it models plugin API/tx/state inference through Plite. | `packages/core/src/lib/editor/pluginRuntimeTypes.ts` | Keep unless future type bugs prove it overfit. |

Findings:
- Main `SlateEditor.ts` was an old Slate-based type file. It is evidence for
  behavior surface, not a final API target.
- Current `SlateEditor.ts` no longer exports `SlateEditor` or `TSlateEditor`.
- Current file does not expose `tf`, `transforms`, `getApi`, or
  `getTransforms`.
- Current file does not keep direct `children`, direct `dom`, or old
  `EditorBase['meta']` mirrors.
- Current file no longer has `AnyInstalledPlugin*`, `UnknownInstalledPlugin*`,
  or `InferInstalledPlugin*` helper aliases.
- Plugin type algebra moved out of `SlateEditor.ts` into private
  `pluginRuntimeTypes.ts`.
- `Record<string, any>` remains only in the explicit `IsAny<P>` branch for the
  broad editor escape hatch.
- `BaseEditor` is correctly modeled as Plite runtime plus Plate identity,
  runtime plugin metadata, and typed plugin runtime methods.
- `PlateEditor.ts` correctly layers React editor typing over `BaseEditor`
  instead of reintroducing Slate editor aliases.
- Type-tests prove custom plugin API/tx/value inference, invalid fake APIs, and
  duplicate editor API override widening.

Decisions and tradeoffs:
- Keep the hard cut from old Slate editor names.
- Do not rename `SlateEditor.ts` during this packet.
- Do not collapse the type machinery just because it is long; it is carrying
  real inference contracts.
- Do keep the type machinery in Core, not Plite; it models Plate plugin
  semantics.
- Do not restore main's old `tf`/`transforms`/`getApi` model.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

Verification evidence:
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm check:core` passed after extraction: Core tests 697 pass; Plite tests
  1898 pass, 85 skip, 0 fail.
- Target old alias audit returned no matches.
- Installed-plugin placeholder alias audit returned no matches.
- `Record<string, any>` audit returned only the three explicit `IsAny<P>`
  branches in `pluginRuntimeTypes.ts`.
- Type algebra extraction audit found no type-algebra dump remaining in
  `SlateEditor.ts`.
- Broad old editor name audit returned only path/import references to the
  filename `SlateEditor.ts`, not old exported type/API usage.
- Target untracked inventory returned no files.

Final handoff contract:
- target surface and mode: named file/API review for
  `packages/core/src/lib/editor/SlateEditor.ts`.
- files/APIs reviewed: current target file; `origin/main` target file; current
  `PlateEditor.ts`; Core editor/type-test callers.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: keep current BaseEditor-on-Plite type boundary.
- verdict matrix summary: score 98; keep.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: see related sweep ledger.
- changes made: `SlateEditor.ts` installed-plugin placeholder aliases removed;
  private plugin runtime type owner extracted; plan updated.
- tests/proof commands: Core typecheck, Core lint, `check:core`, and source
  audits passed.
- old compatibility names audited: no old type/API usage in target.
- needs attention: stale filename only.
- next best Plate Next packet: continue named-file review; rename pass only
  when explicitly requested.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure after source review and proof |
| Where am I going? | Final check-complete and handoff |
| What is the goal? | Prove whether `SlateEditor.ts` has drift regression vs main and whether it is clean. |
| What have I learned? | Type surface is clean; filename is stale. |
| What have I done? | Read source map, classified drift, ran proof, filled plan. |

Timeline:
- 2026-07-02T19:00Z Goal plan created.
- 2026-07-02T19:05Z Main/current files and type tests read.
- 2026-07-02T19:12Z Typecheck and lint passed.
- 2026-07-02T19:20Z `check:core` and plan completion gate run.

Open risks:
- Rename debt: `SlateEditor.ts` is stale and should not be called fully
  naming-clean.
- Future type simplification can revisit `MergeEditorApiUnion` only with the
  current type-test contracts preserved.
