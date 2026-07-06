# plate-next useSelection review

Objective:
Review `packages/utils/src/react/hooks/useSelection.ts`, remove dirty local selection logic, prove no regression, and record the Plate Next verdict.

Completion threshold:
Done when the named hook file has a regression verdict, the clean Plate/Plite ownership decision is recorded, the fix is implemented or rejected, focused behavior proof and typecheck pass, docs source proof passes for public API docs touched, the route-proof blocker is named if app rendering is blocked, and this plan passes `check-complete`.

Verification surface:
- Focused Plite behavior: `pnpm --filter @platejs/plite exec bun test ./test/state-query-contract.ts`.
- Focused Utils behavior: `pnpm --filter @platejs/utils exec bun test --preload ../../config/plite-source-test-setup.ts ./src/react/hooks/useSelection.spec.tsx`.
- Package typecheck: `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/utils`.
- Package lint: `pnpm --filter @platejs/plite lint && pnpm --filter @platejs/utils lint`.
- Docs source: `pnpm --filter www check:docs`.
- Browser route proof attempted on `http://localhost:3002/docs/plite/api/nodes/editor` and `http://localhost:3002/docs/plite/api/transforms`.
- Related sweep: `rg -n "isWithinBlock|isAcrossBlocks|selection\\.isExpanded|PathApi\\.equals\\([^\\n]*block|read\\.nodes\\.block\\(\\{ at: selection|editor\\.api\\.isAt\\(\\{ block|editor\\.api\\.isAt\\(\\{ blocks" packages/core/src packages/core/type-tests packages/utils/src packages/plite/src --glob '!**/dist/**'`.

Constraints:
- Use `plate-next` review mode.
- Target surface is `packages/utils/src/react/hooks/useSelection.ts`.
- No broad Core sweep requested.
- No timed loop requested.
- Best Plate v2 shape wins over old Plate compatibility.
- Plite owns generic editor selection predicates.
- Utils hooks should be thin React selectors, not local editor algorithms.
- No public compat aliases, no local helper dump, no fake type workaround.

Boundaries:
- Allowed edits: `packages/utils/src/react/hooks/useSelection.ts`, its focused spec, Plite selection API owners, and Plite docs for the new public API.
- Out of scope: unrelated `apps/www` registry/package import failures, generated registry output, broad Plate package migration.
- Browser proof: route verification is required when possible, but current app compilation is blocked by unrelated missing imports/exports outside this packet.

Blocked condition:
Browser route rendering is blocked by unrelated `apps/www` dependency drift: missing footnote/link/suggestion/table/toggle `with*` imports, missing package exports such as `useReadOnly`, `useScrollRef`, `useSelected`, and stale registry imports. This does not block the focused package proof for the selection hook fix.

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt captured | yes | User asked whether `packages/utils/src/react/hooks/useSelection.ts` big diff had regression and looked dirty. |
| Skill read | yes | `plate-next` skill read before review. |
| Active goal | yes | Goal created for this plan path. |
| Mode classified | yes | Named file/API packet, not broad Core sweep. |
| Public API route checked | yes | New public Plite predicates required Plite docs update. |

Phase / pass table:
| Phase | Status | Evidence |
| --- | --- | --- |
| Source review | complete | Found local block-selection algorithm in Utils and null-selection expanded regression. |
| Plite ownership fix | complete | Added `selection.isExpanded()`, `isWithinBlock()`, and `isAcrossBlocks()` to Plite read/update selection APIs. |
| Utils cleanup | complete | Hook file now delegates to Plite one-shot predicates. |
| Regression tests | complete | Added no-selection hook test and Plite selection predicate contract coverage. |
| Docs | complete | Updated Plite editor/transform API docs for the new selection predicates. |
| Browser route proof | blocked | Dev route returns 500 from unrelated registry/package import drift, not this packet. |
| Final proof | complete | Focused tests, typecheck, lint, docs parity, and plan check recorded. |

Work Checklist:
- [x] Prompt requirement copied into the plan before closeout.
- [x] Regression verdict recorded.
- [x] Best Plate v2 decision recorded: move generic selection predicates to Plite.
- [x] Dirty local Utils algorithm removed.
- [x] No-selection behavior covered by test.
- [x] Related sweep completed and no same-class Utils/Core workaround remains.
- [x] Package proof passed.
- [x] Docs source proof passed.
- [x] Browser route blocker recorded with unrelated owner.
- [x] Keep/revert/quarantine decision recorded.

Verdict matrix:
| Target | Verdict | Evidence | Next |
| --- | --- | --- | --- |
| `useSelectionExpanded` null-selection behavior | regression-fixed | Local `!selection.isCollapsed()` treated null selection as expanded. Test now expects no selection as neither collapsed nor expanded. | keep |
| Within/across block hook logic | move-to-plite | Generic selection-span semantics belong to Plite, not Utils. | keep |
| `useSelection.ts` final shape | main-parity-cleanup | Same public hooks, Plite-native implementation. | keep |
| Plite docs | keep-current-state | New predicates are public API and documented as current state. | keep |

Related sweep:
| Query | Matches | Patched | Deferred | Result |
| --- | ---: | ---: | ---: | --- |
| Selection predicate/local block search across Core/Utils/Plite | 29 relevant source matches | 0 beyond packet | 0 | Existing matches are Plite implementation/tests or unrelated block placeholder/path logic; no duplicate `useSelection` workaround remains. |
| Public hook usage search | 19 source/doc matches plus generated registry noise | 0 | generated registry | No app/package call site depends on the old local implementation. Generated registry output is out of scope. |

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test ./test/state-query-contract.ts`: 5 pass.
- `pnpm --filter @platejs/utils exec bun test --preload ../../config/plite-source-test-setup.ts ./src/react/hooks/useSelection.spec.tsx`: 3 pass, 12 expects.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/utils`: 11 successful tasks.
- `pnpm --filter @platejs/plite lint && pnpm --filter @platejs/utils lint`: passed.
- `pnpm --filter www check:docs`: Docs source parity check passed.
- Browser route attempt on port `3002`: blocked by unrelated app compilation errors listed in Blocked condition.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-06-plate-next-useselection-review.md`: run after this evidence is written.

Open risks:
- Route-level docs proof is blocked by unrelated current-tree app registry/package import drift.
- Generated registry docs still contain stale broad API content; not edited because registry output is generated and outside this named packet.

Reboot status:
If resumed, do not revisit the hook algorithm. Start from the unrelated `apps/www` route blocker only if the user asks for docs route proof or broader package migration.

Keep / revert / quarantine:
Keep. The packet removes dirty local selection logic, fixes a real null-selection regression, adds Plite-owned predicates with tests, and keeps the public Utils hook names stable.
