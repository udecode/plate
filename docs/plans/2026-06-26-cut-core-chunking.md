# Cut Core Chunking

Objective:
Remove dead Core chunking API/docs/source because Plite has no chunking surface, and Core must not keep a wrapper for a deleted substrate feature.

Completion threshold:
The run is complete when live Core source, current API docs, type contracts, and tooling config have no `chunking`, `ChunkingPlugin`, `getChunkSize`, `renderChunk`, `ContentVisibilityChunk`, `PlateChunkProps`, or `RenderChunk` surface; focused package proof passes; `pnpm check:core` passes; this plan passes `check-complete`.

Verification surface:
- Source audit: `rg -n 'chunking|ChunkingPlugin|getChunkSize|renderChunk|ContentVisibilityChunk|PlateChunkProps|RenderChunk' packages/core/src content/docs/api packages/core/type-tests tooling/config -g '*.ts' -g '*.tsx' -g '*.mdx' -g '*.json'`
- Deleted-file audit: `find packages/core/src/lib/plugins/chunking -maxdepth 2 -type f`
- Barrel proof: `pnpm --filter @platejs/core brl`
- Focused proof: `pnpm --filter @platejs/core typecheck`, `pnpm --filter @platejs/core lint`
- Closure proof: `pnpm check:core`
- Goal proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-cut-core-chunking.md`

Constraints:
- Do not add a compatibility alias or shim for chunking.
- Do not move chunking into Plite; the corrected premise is that Plite does not have chunking.
- Keep historical notes outside current API/source docs unless they become confusing product docs.
- Do not touch browser routes unless source proof shows runtime behavior is affected.
- Do not commit or stage anything in this run.

Boundaries:
- Source of truth: `packages/core/src/**`, `content/docs/api/**`, Core barrels, and Core/Plite check scripts.
- Allowed edit scope: Core chunking references and current API docs that expose chunking.
- Browser surfaces: not applicable; this is API/source deletion, not a rendered editor behavior change.
- Package/API surfaces: Core and Plite package proof through `pnpm check:core`.
- Agent/skill surfaces: no `.agents/**` changes required.
- Docs/research surfaces: current API docs only; historical plan/research mentions are not product surface.
- Non-goals: pagination, huge-document behavior, Plite runtime redesign, Plate runtime migration, public docs rewrite.

Output budget strategy:
Use narrow `rg` roots and capped command output. The first broad scan was too noisy, so the corrected audit targets only live Core source, current API docs, type contracts, and tooling config.

Blocked condition:
Block only if `pnpm check:core` fails with a real API/test regression after focused repair, or if a surviving chunking reference is intentionally required by a current public API decision. Neither blocker occurred.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirement captured | yes | User clarified that there is no chunking anymore in Plite, so Core chunking must be hard-cut. |
| Active goal | yes | Active autogoal objective created for cutting Core chunking. |
| Lane resolved | yes | Shared Core/Plite boundary cleanup; runtime behavior routes are out of scope. |
| Source owner named | yes | Core source and current API docs own the stale surface. |
| Output budget | yes | Narrow audits used after broad scan produced too much output. |
| Git boundary | yes | No stage, commit, push, or PR requested. |

Work Checklist:
- [x] Capture the corrected premise: Plite has no chunking and Core should not keep a wrapper.
- [x] Remove Core editor option plumbing for `chunking`.
- [x] Remove `ChunkingPlugin` from Core plugin registration and barrels.
- [x] Remove runtime `getChunkSize` and `runtimeChunking` bridge code.
- [x] Remove `renderChunk`, `RenderChunkProps`, `ContentVisibilityChunk`, and `PlateChunkProps`.
- [x] Delete chunking plugin source and tests.
- [x] Update current API docs so chunking is not advertised.
- [x] Regenerate Core barrels.
- [x] Run focused Core typecheck and lint.
- [x] Run live source/API audit for leftover chunking surface.
- [x] Run `pnpm check:core`.
- [x] Log workflow slowdown from the too-broad initial audit.
- [x] Fill changed list, review attention, stopping checkpoints, and residual risks.
- [x] Run autogoal `check-complete` before closing the goal.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Live surface audit | yes | Verify no current Core/API chunking identifiers remain | `rg` audit returned no matches. |
| Deleted files | yes | Verify deleted chunking directory has no files | `find packages/core/src/lib/plugins/chunking -maxdepth 2 -type f` returned no files. |
| Barrel proof | yes | Regenerate Core barrels | `pnpm --filter @platejs/core brl` passed. |
| Focused package proof | yes | Typecheck and lint Core | `pnpm --filter @platejs/core typecheck` and `pnpm --filter @platejs/core lint` passed. |
| Core/Plite closure proof | yes | Run full Core lane | `pnpm check:core` passed. |
| Browser proof | no | Explain why browser proof is skipped | No rendered route or editor behavior changed; this is source/API deletion. |
| Skill/rule sync | no | Explain why skipped | No `.agents/rules/**` files changed. |
| Autoreview | no | Explain why skipped | User asked for a direct cleanup; proof is deterministic and scoped. Broader autoreview can run before commit. |
| Goal plan complete | yes | Run check-complete | Recorded in Verification evidence after execution. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Requirement capture | complete | Corrected premise recorded: no Plite chunking. | source cut |
| Source cut | complete | Core options, plugin registration, runtime bridge, types, components, tests, and docs cleaned. | audit |
| Audit | complete | No live chunking identifiers remain in the audited current surface. | proof |
| Proof | complete | `pnpm check:core` passed. | closeout |
| Closeout | complete | Plan updated with evidence and final ledgers. | final response |

Changed list:
| Surface | Files |
|---------|-------|
| Core editor/plugin wiring | `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/react/editor/withPlate.ts`, `packages/core/src/lib/plugins/getCorePlugins.ts`, `packages/core/src/lib/editor/BaseEditor.ts`, `packages/core/src/react/editor/createPlateRuntimeEditor.ts` |
| Core tests | `packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts`, `packages/core/src/lib/editor/withPlite.spec.ts`, deleted chunking plugin tests |
| Core types/components/stores | `packages/core/src/lib/types/EditableProps.ts`, `packages/core/src/lib/types/index.ts`, deleted `RenderChunkProps.ts`, `packages/core/src/react/hooks/useEditableProps.ts`, `packages/core/src/react/stores/plate/PlateStore.ts`, `packages/core/src/react/stores/plate/createPlateStore.ts`, `packages/core/src/react/components/PlateContent.tsx`, `packages/core/src/react/components/index.ts`, deleted `ContentVisibilityChunk.tsx`, `packages/core/src/react/components/plate-nodes.tsx` |
| Core chunking plugin | deleted `packages/core/src/lib/plugins/chunking/ChunkingPlugin.ts`, `packages/core/src/lib/plugins/chunking/ChunkingPlugin.spec.ts`, `packages/core/src/lib/plugins/chunking/index.ts`; updated `packages/core/src/lib/plugins/index.ts` |
| Current API docs | `content/docs/api/core.mdx`, `content/docs/api/core/plate-components.mdx`, `content/docs/api/core/plate-components.cn.mdx` |

Workflow slowdowns:
| Slowdown | Repair |
|----------|--------|
| Initial broad `rg` streamed too much historical output. | Switched to narrow current-source/API roots and recorded that this was an operator miss, not a missing skill rule. |
| One audit included a non-existent test path. | Reran against real roots: `packages/core/src`, `content/docs/api`, `packages/core/type-tests`, `tooling/config`. |

Needs your attention:
| Priority | Item |
|----------|------|
| P1 | Review whether historical docs/plans mentioning chunking should be rewritten later for narrative clarity. They are not current API/source surface. |
| P2 | Before commit, run `autoreview` if you want a broader changed-file pass. |

Stopping checkpoints:
| Checkpoint | Status |
|------------|--------|
| Live Core/API chunking surface removed | complete |
| `check:core` closure gate | complete |
| Broader Plate runtime migration | not part of this run |

Verification evidence:
- `rg -n 'chunking|ChunkingPlugin|getChunkSize|renderChunk|ContentVisibilityChunk|PlateChunkProps|RenderChunk' packages/core/src content/docs/api packages/core/type-tests tooling/config -g '*.ts' -g '*.tsx' -g '*.mdx' -g '*.json'` exited with no matches.
- `find packages/core/src/lib/plugins/chunking -maxdepth 2 -type f` returned no files.
- `pnpm --filter @platejs/core brl` passed.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint` passed after import formatting repair.
- `pnpm check:core` passed: Core+Plite typecheck, type contracts, Core lint, Plite lint, Core test batches, and Plite tests all green.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-26-cut-core-chunking.md` passed.

Reboot status:
Complete. If the thread resumes, the active goal should already be closed; otherwise close it without more source edits.

Open risks:
- Historical docs/plans may still mention chunking as old/dead context. That is acceptable for this run because the objective is live API/source deletion.
- Broader Plate runtime migration remains separate work.
