# Plite selection fragment helpers

Objective:
Decide whether `useSelectionFragment.ts` should keep local fragment/prop logic or move the missing API to Plite or Plate.

Completion threshold:
Done when live source proves the current drift, the Plite/Plate ownership decision is recorded, rejected alternatives are named, next execution owner is clear, and this plan passes `check-complete`.

Verification surface:
- Source diff: `git diff -- packages/utils/src/react/hooks/useSelectionFragment.ts`.
- Main evidence: `git show origin/main:packages/slate/src/internal/editor-extension/prop.ts` and matching `prop.spec.tsx`.
- Current Plite API evidence: `packages/plite/src/interfaces/editor.ts` and `packages/plite/src/core/public-state.ts`.
- Current Plate/Core evidence: `packages/core/src/lib/plugin/getSlatePlugin.ts`.
- Peer caller evidence: `packages/selection/src/react/hooks/useBlockSelectionNodes.ts`.
- Related audit: `rg -n "api\\.prop|\\.prop\\(\\{ nodes|EditorPropOptions|useSelectionFragmentProp" packages/core/src packages/utils/src packages/selection/src packages/*/src --glob '!**/dist/**'`.

Constraints:
- Planning mode only; no implementation in this pass.
- No public compat aliases or old `editor.api.prop` resurrection.
- Plite stays unopinionated; Plate owns plugin/product aggregate helpers.
- Do not leave behavior-critical helper logic inside a React hook.

Boundaries:
- In scope: `packages/utils/src/react/hooks/useSelectionFragment.ts`, old Slate `prop` semantics, Plite `fragment({ unwrap })`, Plate/Core shared helper ownership, `packages/selection` peer caller.
- Out of scope: broad package migration, docs route/browser proof, registry output, unrelated stale package imports.

Blocked condition:
No blocker for planning. Implementation should wait for user acceptance because the best fix adds or moves a reusable public/internal API.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Skills read | yes | `plate-next` and `plite-plan` read for named-file plus boundary decision. |
| Active goal | yes | Active goal created for this ownership review. |
| Live source | yes | Current diff, main source, Plite API, Core helper, and peer caller read. |
| Planning only | yes | This pass records the API decision and stops. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Current-state read | complete | Current Utils hook reimplements unwrap and prop aggregation locally. | plan review |
| Boundary audit | complete | Plite already owns `fragment({ unwrap })`; Plate owns plugin container-type knowledge. | plan review |
| Main behavior audit | complete | Old `prop` returned default for empty/missing block/text props and undefined for mixed values. | plan review |
| Peer sweep | complete | `packages/selection` still needs the same fragment prop aggregation. | plan review |
| Decision | complete | Split owner: Plite fragment read, Plate/Core fragment prop aggregation. | user acceptance |

Work Checklist:
- [x] User target copied: `packages/utils/src/react/hooks/useSelectionFragment.ts`.
- [x] Dirty diff reviewed against `origin/main`.
- [x] Current Plite fragment API checked.
- [x] Old prop semantics checked from main source and tests.
- [x] Peer caller search completed.
- [x] Plite vs Plate ownership decision recorded.
- [x] Rejected alternatives recorded.
- [x] Next execution owner recorded.

Current verdict:
- Verdict: revise.
- Confidence: 0.94.
- Keep / cut / revise call: revise current Utils diff before package review can score 100.
- Reason: it duplicates Plite fragment unwrap and regresses old shared-prop semantics inside a React hook.

Scorecard:
| Dimension | Weight | Score | Evidence |
| --- | ---: | ---: | --- |
| React/runtime performance | 0.20 | 0.95 | Hook should stay a thin selector over reusable helpers, avoiding duplicated traversal logic per hook. |
| Plite API/DX quality | 0.20 | 0.93 | `fragment({ unwrap })` is already the right Plite substrate read; no need to add Plate plugin-container concepts to Plite. |
| Plate and collaboration migration backbone | 0.15 | 0.93 | Shared fragment-prop helper gives Utils and Selection one Plate-owned route. |
| Regression-proof testing strategy | 0.20 | 0.95 | Main `prop.spec.tsx` gives exact behavior to port into current tests. |
| Research evidence completeness | 0.15 | 0.91 | Live source is enough; no external editor evidence needed. |
| shadcn-style composability and minimalism | 0.10 | 0.95 | Call sites remain small: read fragment, ask shared helper for prop. |

Decision brief:
- Chosen option: keep `editor.read.fragment({ at, unwrap })` in Plite; add or restore a Plate/Core shared helper for fragment property aggregation; update Utils and Selection to consume it.
- Why: fragment extraction and unwrap are generic editor substrate; plugin container types and aggregate toolbar/property semantics are Plate product/framework concerns.
- Consequence: no `editor.api.prop` compatibility alias, but no duplicated hook-local algorithm either.
- Adoption answer: current callers switch from `editor.api.prop({ nodes, ...options })` or local `getSharedFragmentProp(...)` to the new Plate-owned helper.

Public API target:
| Surface | Proposed shape | User-facing DX | Compatibility / migration | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- |
| Plite fragment read | `editor.read.fragment({ at, unwrap })` | already clean | keep | `EditorFragmentReadOptions` has `unwrap`; implementation unwraps recursively | keep |
| Plate fragment prop aggregation | `getFragmentProp(nodes, options)` or equivalent exported from Core/Plate utils | one helper used by hooks/packages | hard-cut old `editor.api.prop` name | old `prop.ts` behavior and two current callers | revise |
| Utils hook | `useSelectionFragment()` delegates to Plite fragment with `unwrap: getContainerTypes(editor)` | thin selector | no local traversal helpers | current dirty diff lines 18-80 | revise |
| Selection hook | `useBlockSelectionFragmentProp()` uses same helper | consistent package behavior | removes stale `EditorPropOptions` / `editor.api.prop` | peer caller still uses old API | revise |

Internal runtime target:
| Layer | Current owner | Target mechanism | Avoids | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- |
| fragment extraction | Plite | existing `editor.read.fragment({ at, unwrap })` | Plate wrapper around Plite reads | Plite source already supports it | keep |
| shared property aggregation | Plate/Core | pure helper over `Descendant[]` using old semantics | hook-local duplicated traversal and Plite pollution | old Slate `prop.ts`/specs | revise |

Hook / component / render DX target:
| Surface | Call-site shape | Composition rule | Performance rule | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- |
| `useSelectionFragment` | one selector, one Plite read | unwrap types from Plate plugin cache | no extra helper recursion in hook | current local `unwrapContainerNodes` duplicates Plite | revise |
| `useSelectionFragmentProp` | one selector plus shared helper | Plate property semantics reused | no ad hoc recursive collect/filter | current `filter(undefined)` changes behavior | revise |

Plate migration-backbone target:
| Pressure | Plite substrate target | Plate adaptation route | Non-goal | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- |
| Old `editor.api.fragment` | `editor.read.fragment({ at, unwrap })` | direct read in hooks/packages | no alias | current Plite source | keep |
| Old `editor.api.prop` | no Plite equivalent | shared Plate helper | no `editor.api.prop` resurrection | Utils and Selection both need it | revise |

Collaboration migration-backbone target:
| Pressure | Plite substrate target | Collaboration route | Non-goal | Evidence | Verdict |
| --- | --- | --- | --- | --- | --- |
| fragment property reads | pure read over current selected nodes | no collab-specific API needed | no operation/log change | read-only helper | keep |

Rejected alternatives:
- Put `getSharedFragmentProp` in Plite: rejected because `mode: block/text/all` toolbar-style aggregation and plugin container-type behavior are Plate concerns.
- Keep helper local in `useSelectionFragment.ts`: rejected because `packages/selection` needs the same semantics and the local version already regressed missing-prop behavior.
- Restore `editor.api.prop`: rejected because it revives the old Plate/Slate API shape and competes with current `editor.read` / helper boundaries.
- Add `editor.read.fragment.prop(...)`: rejected for now because property aggregation is not raw fragment extraction; it would pollute Plite with Plate toolbar semantics.

Objection ledger:
| Change | Likely objection | Steelman | Evidence | Verdict |
| --- | --- | --- | --- | --- |
| Shared helper instead of Plite method | App code may want this everywhere | True, but it is Plate app/editor framework sugar, not core editor substrate | helper depends on feature semantics and old `EditorPropOptions` behavior | keep |
| Hard-cut `editor.api.prop` | Package migration needs more edits | True, but public compat aliases are banned and the helper is a clean migration target | VISION no-alias law | keep |
| Use old prop semantics | Old behavior may be quirky | True, but existing toolbar/package behavior likely expects default-on-missing and undefined-on-mixed | main `prop.spec.tsx` | keep |

Legacy regression proof matrix:
| Regression class | Legacy behavior | Target | Proof route | Owner | Status |
| --- | --- | --- | --- | --- | --- |
| empty nodes | returns `defaultValue` | same | port old `prop.spec.tsx` | Plate/Core helper | planned |
| missing block prop | returns `defaultValue` | same | port old `prop.spec.tsx` | Plate/Core helper | planned |
| mixed block prop values | returns `undefined` | same | port old `prop.spec.tsx` | Plate/Core helper | planned |
| text mode missing prop | returns `defaultValue` | same | add/port spec | Plate/Core helper | planned |
| all mode mixed values | returns `undefined` | same | port old `prop.spec.tsx` | Plate/Core helper | planned |

Browser stress / parity strategy:
| Surface | Scenario | Browser/device | Command or proof route | Expected signal | Status |
| --- | --- | --- | --- | --- | --- |
| hook behavior | package hook tests | none | focused Bun/Vitest package tests | values match legacy prop matrix | planned |

Verification workspace gate:
| Claim | Workspace | Command | Result | Owner |
| --- | --- | --- | --- | --- |
| current diff is dirty | plate repo root | `git diff -- packages/utils/src/react/hooks/useSelectionFragment.ts` | local unwrap/prop helpers added | plate-next |
| Plite already supports fragment unwrap | plate repo root | source read of `packages/plite/src/interfaces/editor.ts` and `packages/plite/src/core/public-state.ts` | `unwrap?: readonly string[]` exists and implementation unwraps | plite |
| peer package still needs prop helper | plate repo root | related `rg` plus `packages/selection/src/react/hooks/useBlockSelectionNodes.ts` | old `editor.api.prop` remains | Plate package migration |

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Named verification threshold | yes | Source audit and plan decision | completed in this plan |
| Plite public API claim | yes | Source evidence for existing `fragment({ unwrap })` | recorded |
| Implementation changes | no | Planning-only pass | no source implementation patched |
| Final user-review handoff | yes | List accepted decisions and next owner | final response |
| Goal plan complete | yes | `check-complete` | command runs after plan write |

Verification evidence:
- `packages/utils/src/react/hooks/useSelectionFragment.ts` current diff adds local `unwrapContainerNodes`, `collectNodes`, and `getSharedFragmentProp`.
- `origin/main:packages/slate/src/internal/editor-extension/prop.ts` has the old aggregate property behavior.
- `origin/main:packages/slate/src/internal/editor-extension/prop.spec.tsx` covers empty, missing, shared, mixed, text, and all modes.
- `packages/plite/src/interfaces/editor.ts` already exposes `EditorFragmentReadOptions.unwrap`.
- `packages/plite/src/core/public-state.ts` already unwraps fragment nodes in Plite.
- `packages/selection/src/react/hooks/useBlockSelectionNodes.ts` still calls stale `editor.api.prop({ nodes })`.

Open risks:
- Need user approval before implementation because this creates or restores a shared Plate/Core helper and touches two packages.
- The exact helper name is still a small taste decision; recommended name is `getFragmentProp`, matching old changelog wording and obvious call-site intent.

Execution addendum:

Work checklist:
- [x] Added `packages/core/src/lib/utils/getFragmentProp.ts`.
- [x] Ported old prop behavior into `packages/core/src/lib/utils/getFragmentProp.spec.ts`.
- [x] Exported `getFragmentProp` / `GetFragmentPropOptions` from Core utils.
- [x] Updated `packages/utils/src/react/hooks/useSelectionFragment.ts` to use `editor.read.fragment({ unwrap })`.
- [x] Updated `packages/utils/src/react/hooks/useSelectionFragment.ts` to use the shared helper for prop aggregation.
- [x] Updated `packages/selection/src/react/hooks/useBlockSelectionNodes.ts` to use the shared helper and remove stale `EditorPropOptions` / `editor.api.prop`.
- [x] Ran stale-pattern sweep for `api.prop`, `EditorPropOptions`, local unwrap, and local shared-prop helpers in affected packages.
- [x] Ran focused semantic tests.
- [x] Ran package typecheck/lint where the packages are currently migratable.
- [x] Recorded Selection package typecheck blocker separately instead of hiding it in this packet.

Execution evidence:
| Claim | Command | Result |
| --- | --- | --- |
| Core helper preserves legacy prop semantics | `pnpm --filter @platejs/core exec bun test src/lib/utils/getFragmentProp.spec.ts` | 7 pass |
| Utils hook behavior still works | `pnpm --filter @platejs/utils exec bun test --preload ../../config/plite-source-test-setup.ts src/react/hooks/useSelectionFragment.spec.tsx` | 2 pass |
| Core and Utils types are green | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` | pass |
| Core lint is green | `pnpm --filter @platejs/core lint` | pass |
| Utils lint is green | `pnpm --filter @platejs/utils lint` | pass |
| Selection lint is green | `pnpm --filter @platejs/selection lint` | pass |
| Edited Selection hook compiles syntactically/modules resolve | `bun build packages/selection/src/react/hooks/useBlockSelectionNodes.ts --outdir /tmp/plate-selection-hook-check --target browser --format esm` | pass |
| Core public barrel updated | `pnpm --filter @platejs/core brl` | pass |
| Core artifact refreshed for dependent package tests | `pnpm --filter @platejs/core build` | pass |

Related sweep:
| Query | Result |
| --- | --- |
| `rg -n "api\\.prop|\\.prop\\(\\{ nodes|EditorPropOptions|getSharedFragmentProp|unwrapContainerNodes|collectNodes" packages/core/src packages/utils/src packages/selection/src --glob '!**/dist/**'` | no matches |
| `rg -n "getFragmentProp|GetFragmentPropOptions" packages/core/src packages/utils/src packages/selection/src packages/plate/src --glob '!**/dist/**'` | only the new helper, tests, export, and two intended consumers |

Selection package blocker:
`pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils --filter=./packages/selection` is blocked by unrelated `@platejs/selection` migration debt outside this hook: stale `SlateEditor`, `TElement`, `TRange`, `editor.tf`, `createSlateEditor`, old API groups, and test spy typings across Selection package files. This packet did not broaden into that package migration.

Final verdict:
- Verdict: implemented.
- Confidence: 0.96 for the accepted helper/caller packet.
- Remaining risk: `@platejs/selection` package-wide typecheck is not green until the broader Selection migration is done.

Reboot status:
This packet is complete. Next owner is `plate-next packages/selection` if we want the whole Selection package migrated/typecheck-green.
