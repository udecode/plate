# plate-next single block runtime cut

Objective:
Cut the Core `installRuntimeSingleBlock` and `installRuntimeSingleLine` hacks by moving the behavior into the owning utils plugins.

Completion threshold:
- `SingleBlockPlugin` owns its single-block normalizer and break transforms through a Plite editor extension.
- `SingleLinePlugin` owns its single-line normalizer, break suppression, and post-commit line-break cleanup through a Plite editor extension.
- Core no longer contains `installRuntimeSingleBlock`, `installRuntimeSingleLine`, `cleanupRuntimeSingleLine`, or `RUNTIME_SINGLE_LINE_*`.
- Existing single-block and single-line behavior tests pass.
- Core + Utils typecheck, lint, and build pass.

Verification surface:
- Exact source audit for deleted Core installer names and constants.
- Focused utils plugin tests.
- Core + Utils typecheck, lint, and build.

Constraints:
- No git add, commit, push, or PR.
- No public compat alias or shim.
- Do not delete single-block/single-line behavior; delete only the Core ownership hack.

Boundaries:
- Lane: Plate Next / Core runtime cleanup.
- Owner move: Core runtime switchboard to `@platejs/utils` plugin definitions.
- Browser proof: not applicable; this is package runtime behavior covered by plugin tests.

Blocked condition:
No blocker hit. The moved extensions typecheck and the existing behavior tests pass.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User targeted `installRuntimeSingleBlock` and asked whether it can be cut. |
| Skills read | yes | `plate-next`, `hard-cut`, and `autogoal` read. |
| Lane resolved | yes | Plate Next / Core runtime ownership cleanup. |
| Scope constrained | yes | SingleBlock and SingleLine installer ownership only. |

Work Checklist:
- [x] Inspect Core installer implementation.
- [x] Inspect owning `SingleBlockPlugin` and `SingleLinePlugin`.
- [x] Move SingleBlock behavior into `SingleBlockPlugin`.
- [x] Move SingleLine behavior into `SingleLinePlugin`.
- [x] Delete Core installers, cleanup helper, constants, and install-loop calls.
- [x] Run exact source audit for deleted names.
- [x] Run focused tests.
- [x] Run Core + Utils typecheck, lint, and build.
- [x] Record transient resolver failure and rerun after build settled.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Deleted-name audit | yes | `rg` found no `installRuntimeSingleBlock`, `installRuntimeSingleLine`, `cleanupRuntimeSingleLine`, `RUNTIME_SINGLE_LINE`, or old runtime extension names in Core/Utils source. |
| Focused tests | yes | `pnpm --filter @platejs/utils exec bun test src/lib/plugins/single-block/SingleBlockPlugin.spec.ts src/lib/plugins/single-block/SingleLinePlugin.spec.ts` passed, 12 tests. |
| Typecheck | yes | `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` passed. |
| Lint | yes | `pnpm --filter @platejs/utils lint && pnpm --filter @platejs/core lint` passed. |
| Build | yes | `pnpm turbo build --filter=./packages/core --filter=./packages/utils` passed. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Inspect | complete | Core and utils plugin ownership read. |
| Move behavior | complete | Extensions moved into utils plugin files. |
| Delete Core hack | complete | Installers and loop calls removed. |
| Proof | complete | Focused tests, typecheck, lint, build passed. |
| Handoff | complete | Remaining risk recorded below. |

Changed list:
- `packages/core/src/react/editor/createPlateRuntimeEditor.ts`
- `packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts`
- `packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts`
- `docs/plans/2026-06-26-plate-next-single-block-runtime-cut.md`

Verification evidence:
- `rg -n "installRuntimeSingle(Block|Line)|cleanupRuntimeSingleLine|RUNTIME_SINGLE_LINE|plate:single-(block|line):runtime" packages/core/src packages/utils/src --glob '!**/dist/**'` -> no matches.
- `pnpm --filter @platejs/utils exec bun test src/lib/plugins/single-block/SingleBlockPlugin.spec.ts src/lib/plugins/single-block/SingleLinePlugin.spec.ts` -> 12 pass.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/utils` -> 11 successful tasks.
- `pnpm --filter @platejs/utils lint && pnpm --filter @platejs/core lint` -> pass.
- `pnpm turbo build --filter=./packages/core --filter=./packages/utils` -> 10 successful tasks.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | SingleBlock and SingleLine runtime hack cut is complete. |
| Where am I going? | Hand off this packet. |
| What is the goal? | Move ownership from Core runtime switchboard to the owning utils plugins. |
| What have I learned? | Core owned behavior that the utility plugins should install themselves. |
| What have I done? | Moved the Plite extensions into the plugins and deleted the Core installers. |

Open risks:
- `createPlateRuntimeEditor.ts` still has more feature installers that likely belong in their owning packages.
- One focused test run failed during a parallel build with package-resolution noise, then passed immediately after the build settled.
