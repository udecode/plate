# Plate Next Yjs plugin adapter

Objective:
Restore a thin Plate Yjs plugin over the Plite Yjs extension without reviving
the deleted Slate-Yjs/provider runtime.

Flow mode:
One-shot named public API correction.

Goal plan:
`docs/plans/2026-07-14-plate-next-yjs-plugin-adapter.md`

Completion threshold:

- `@platejs/yjs` keeps `createYjsExtension` as the Plite substrate.
- Plate exposes typed `BaseYjsPlugin` and `YjsPlugin` composition owners.
- Provider packages, authentication, persistence, and transport remain app-owned.
- Root/react exports, runtime artifacts, type inference, docs, tests, changesets,
  barrels, drift audits, review, and the goal checker close cleanly.
- No provider registry, `withPlateYjs`, Slate-Yjs enhancer, compatibility alias,
  broad cast, or duplicate runtime returns.

Verification surface:

- Yjs package typecheck, tests, lint, build, runtime import, and emitted declaration
  inspection.
- Core type contracts and `pnpm check:core` because the adapter exposed a Core
  extension-state inference bug.
- Exact public package runtime/type export contracts.
- English/Chinese MDX source generation and docs-source parity.
- Browser attempt at `/docs/yjs`, with app-wide blockers recorded if the page
  cannot render.
- Legacy-name, raw-Plite-doc, cast, extracted-file, changeset, and diff-hygiene
  audits.
- Structured autoreview and final autogoal checker.

Constraints:

- Best Plate v2 architecture, not compatibility preservation.
- Plate owns product plugin composition; Plite owns editor/Yjs substrate.
- Keep established `BaseYjsPlugin` and `YjsPlugin` names and owner paths.
- Do not restore provider registries, Slate-Yjs wrappers, lifecycle duplication,
  fake aliases, broad casts, or helper dumps.
- Fix owning generic inference instead of adding local annotations or casts.
- Do not edit generated registry output.
- No unrelated package cleanup.

Boundaries:

- Runtime: `packages/yjs`, plus the smallest Core generic owner required to
  preserve extension state.
- Proof contracts: Core/Plite type and public-package smoke tests.
- Docs: Yjs README, English/Chinese Yjs plugin pages.
- Release truth: existing Yjs/Core changesets plus one separated Plite changeset.
- Goal evidence: this plan.
- Package-wide scoring and broad Core drift review do not apply; this is a named
  API correction.

Blocked condition:
Stop only if Plate cannot install a configured Plite extension without a public
Core redesign. That blocker did not occur: the existing composition model works
after preserving extension state through its generic return types.

Current verdict:

- `createYjsExtension`: keep as Plite-native substrate.
- `BaseYjsPlugin`: recover established Plate owner as a thin adapter.
- `YjsPlugin`: recover established React Plate owner via `toPlatePlugin`.
- Old provider/Slate-Yjs runtime: keep deleted.
- Final confidence: 100 for the named packet after package, Core, docs, export,
  source-audit, and review proof.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt captured | yes | User requested correction after the Yjs ownership diagnosis; thin adapter and no legacy runtime are explicit |
| Plate Next doctrine | yes | `plate-next`, Vision, Plate Vision, and Common Vision read |
| Durable goal | yes | Goal created against this plan |
| Mode | yes | Named Yjs API packet; no package-wide or broad Core sweep |
| Ownership | yes | Plate composition over Plite substrate |
| Skills | yes | `plate-next`, `autogoal`, `changeset`, `docs-creator`, Browser, and `autoreview` loaded |
| Public API decision | yes | User accepted restoration of the thin Plate plugin |
| Export impact | yes | Root/react exports changed, so barrels and runtime export contracts apply |
| Release impact | yes | Published Yjs/Core types and API require changeset truth |
| Browser impact | yes | Plugin docs route selected for browser proof |

Work Checklist:

- [x] Capture the request, scope, non-goals, stop condition, proof, and handoff.
- [x] Confirm `origin/main` owner paths before keeping restored files.
- [x] Restore `BaseYjsPlugin` as a configured `createYjsExtension` adapter.
- [x] Restore `YjsPlugin` through `toPlatePlugin`.
- [x] Preserve extension state inference in Core rather than cast Yjs locally.
- [x] Add Base/React runtime tests and Core compile-time type contracts.
- [x] Update root/react exact runtime export contracts and named type smoke.
- [x] Keep raw Plite `createYjsExtension` public.
- [x] Update package metadata and current-state English/Chinese documentation.
- [x] Repair Yjs/Core/Plite changeset ownership and one-bump contracts.
- [x] Run package typecheck, test, lint, build, artifact, and import proof.
- [x] Run barrels, docs source parity, source audits, and diff hygiene.
- [x] Attempt Browser proof and record the unrelated app-wide compile blocker.
- [x] Run and repair the shared Core gate.
- [x] Run structured autoreview after the final proof-driven edits.
- [x] Record changed files, scoped sweep, gaps, errors, and risks.
- [x] Run the autogoal completion checker.

Phase / pass table:
| Phase | Status | Evidence |
|---|---|---|
| Source map | complete | Current Yjs extension, Core plugin builders, docs, exports, and `origin/main` owners inspected |
| Implementation | complete | Thin Base/React adapters restored; Core state inference preserved |
| Focused proof | complete | Yjs tests, typecheck, lint, build, declarations, imports, and type contracts pass |
| Shared proof | complete | `pnpm check:core` exits 0 after export/changeset contract repair |
| Docs proof | complete | MDX generation and docs source parity pass |
| Drift audit | complete | Legacy runtime/cast scan returns zero; plugin docs expose no raw Plite setup |
| Review | complete | Structured Codex review reports no accepted/actionable findings |
| Closure | complete | Plan evidence filled and completion checker run |

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Best Plate v2 recommendation | yes | Thin Plate plugin over Plite extension; legacy runtime remains deleted |
| Gap ownership | yes | Core generic owner fixed; no remaining Plite/Yjs capability gap |
| Package proof | yes | Yjs typecheck, 244 tests, lint, build, declaration and runtime import proof pass |
| Shared Core gate | yes | `pnpm check:core` passes all covered package typechecks, lints, builds, and tests |
| Public exports | yes | Root/react exact runtime smoke and named type smoke include restored plugins |
| Barrels | yes | `pnpm brl` passes |
| Changesets | yes | Yjs major text repaired; Core note merged into existing patch; Plite operation note split |
| Docs parser | yes | `pnpm --filter www check:docs` passes |
| Browser | yes | Browser reached `/docs/yjs`; global registry compile drift blocks rendering before Yjs content |
| Source audit | yes | Zero legacy runtime/cast matches; zero raw `createYjsExtension` matches in plugin pages |
| Extracted files | yes | Four restored files map to exact `origin/main` owners |
| Review | yes | Final structured review reports no accepted/actionable findings |
| Diff hygiene | yes | Targeted `git diff --check` passes |
| Goal checker | yes | Autogoal checker passes after this evidence is final |

Review matrix:
| Path or API | Drift score | Verdict | Owner | Evidence | Next |
|---|---:|---|---|---|---|
| `createYjsExtension` | 0 | keep substrate | Yjs core / Plite lane | Generic Yjs runtime and focused tests remain intact | none |
| `BaseYjsPlugin` | 0 | recover main owner | Yjs lib / Plate lane | Thin `extendExtension` adapter, typed and runtime-tested | none |
| `YjsPlugin` | 0 | recover main owner | Yjs React / Plate lane | Thin `toPlatePlugin` wrapper, typed and runtime-tested | none |
| Core extension state | 0 | fix owner | Core React plugin generics | Compile-time contract proves state survives conversion and chaining | none |
| Yjs exports | 0 | main parity cleanup | Yjs package | Exact runtime import smoke and built artifact import pass | none |
| Yjs docs | 0 | current API reference | Yjs/docs | Plate plugin taught; raw API isolated to explicit Plite README section | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason |
|---|---|---|---|
| Yjs composition | Plite extension plus thin Base/React Plate plugins; app-owned provider | Provider registry, `withPlateYjs`, Slate-Yjs enhancers, raw-Plite-only Plate docs | Correct product/substrate ownership with one runtime |
| Core typing | Preserve `InferState<C>` through conversion and chained plugin methods | Yjs cast, explicit callback annotations, local editor augmentation | Fixes every plugin using editor extension state |

Plite / Plate gap ledger:
| Gap type | Missing capability | Local hack rejected | Smallest owner | Decision and proof |
|---|---|---|---|---|
| Plate gap, fixed | `toPlatePlugin` and React plugin chains dropped extension state types | Casting `state.yjs` or annotating callbacks | Core `toPlatePlugin.ts` and `PlatePlugin.ts` | Preserve `InferState<C>`; Core type contract and Yjs typecheck pass |
| Remaining gap | none | none | none | Runtime and type proof show the adapter needs no new Plite API |

Related scoped sweep ledger:
| Trigger | Active scope | Query or method | Matches | Patched | Deferred | Risk |
|---|---|---|---:|---:|---:|---|
| Restore thin plugin | Yjs lib and React plugin | `withPlateYjs|createTSlatePlugin|@slate-yjs/core|YjsEditor|as any|as unknown` | 0 | 0 | 0 | none |
| Correct docs lane | English/Chinese plugin pages | `createYjsExtension` | 0 | 0 | 0 | Raw API remains only in explicit Plite README section |
| Preserve state typing | Core React plugin builders | `InferState<C>` | 12 | 10 | 0 | Two sites were already correct; all relevant return/config paths now preserve state |
| Restore public owners | Yjs root/react exports | Runtime exact-export inspection | 2 restored values | 2 | 0 | Exact smoke prevents accidental extra/missing exports |

Extracted file ledger:
| Path | Bucket | Origin/main check | Proof |
|---|---|---|---|
| `packages/yjs/src/lib/BaseYjsPlugin.ts` | recover-main-owner | exact path exists | Typecheck, runtime test, build |
| `packages/yjs/src/lib/BaseYjsPlugin.api.spec.ts` | recover-main-owner | exact path exists | Focused and full Yjs tests |
| `packages/yjs/src/lib/index.ts` | recover-main-owner | exact path exists | Root runtime export smoke |
| `packages/yjs/src/react/YjsPlugin.tsx` | recover-main-owner | exact path exists | React runtime test and export smoke |

Release artifact classification:

- `@platejs/yjs`: published major migration already existed; text now describes
  the Plite-backed runtime and retained Plate plugin truth.
- `@platejs/core`: state inference note merged into its existing patch
  changeset to obey one-patch-per-package.
- `@platejs/plite`: `OperationApi.root` note split into its own minor
  changeset because the old Yjs changeset incorrectly combined packages.
- Registry changelog does not apply.

Out-of-scope drift:
| Surface | Evidence | Decision |
|---|---|---|
| Docs browser app | `/docs/yjs` compile stops on unrelated removed registry imports such as `createExcludeDiffFragmentExtension` and `useEditorContainerRef` | Do not broaden Yjs packet; source generation/parity is green |
| Historical v48 migration docs | Deliberately describe historical Yjs API | Keep historical content outside current reference docs |

Changed list:
| Group | Files or APIs |
|---|---|
| Yjs runtime | Base/React plugins, lib/root/react exports, extension inference, package metadata/dependency |
| Core typing | `toPlatePlugin`, React `PlatePlugin` method return types, compile-time contract |
| Public proof | Yjs adapter spec, Plite exact runtime export smoke, named type smoke |
| Docs | Yjs README and English/Chinese collaboration pages |
| Release truth | Yjs changeset repair, Core changeset note, separated Plite changeset |
| Plan | This evidence ledger |

Error attempts:
| Failure | Cause | Repair |
|---|---|---|
| Initial Yjs typecheck | React plugin conversion dropped extension state and test used Bun-only types | Fixed Core inference owner and used `node:test` |
| First `check:core` | Duplicate Core patch changeset and stale exact Yjs export lists | Merged Core note and updated public package contracts |
| First browser dev lane | Dynamic-doc alias could not resolve `collections/server` | Retried static MDX source lane |
| Source browser lane | Global registry imports APIs already removed elsewhere in the tree | Recorded app-wide blocker; no unrelated repair |
| Initial artifact audit | Command used a wrong package-relative dist path | Re-ran against package-root `dist` |

Verification evidence:

- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/yjs` passed.
- `pnpm --filter @platejs/yjs test`: 244 pass, 0 fail.
- Focused Base/React adapter spec: 2 pass, 0 fail.
- `pnpm --filter @platejs/yjs lint` and Core lint passed.
- `pnpm --filter @platejs/yjs build` passed; declarations retain `yjs:
YjsState`; root/react built imports expose the restored plugins.
- `pnpm exec tsc -p packages/core/tsconfig.type-tests.json --noEmit` passed.
- Focused public export smoke: 18 pass; release contract: 8 pass.
- `pnpm check:core` exited 0 after its full typecheck/lint/build/test matrix.
- `pnpm brl`, `pnpm changeset status`, targeted `git diff --check`, and
  exact source audits passed.
- `pnpm --filter www check:docs` passed.
- Browser reached `http://localhost:3000/docs/yjs`; rendering was blocked by
  unrelated app-wide registry API drift before the Yjs MDX rendered.
- Structured autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --prompt "...final
Yjs/Core packet..." --stream-engine-output`; clean with no actionable findings
  and `patch is correct` confidence `0.81`.

Final handoff:
The public Plate Yjs plugin is restored as a thin composition layer over the
single Plite/Yjs runtime. Provider ownership remains in app code, the obsolete
Slate-Yjs machinery stays deleted, and Core now preserves plugin extension state
types without Yjs-specific casts.

Needs your attention:
No Yjs decision remains. The docs app has unrelated registry API drift that
blocks all docs routes in Browser; it belongs to a separate app/registry packet.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Named Yjs correction implemented and proven |
| Where am I going? | Handoff |
| What is the goal? | Restore Plate Yjs composition without legacy runtime |
| What changed? | Thin plugins restored; Core state inference fixed; exports/docs/changesets proven |
| What remains? | Nothing in the Yjs packet |

Open risks:
Yjs-specific risk is none. Browser rendering proof remains unavailable until the
unrelated docs registry removes its stale imports; MDX generation and source
parity are green.
