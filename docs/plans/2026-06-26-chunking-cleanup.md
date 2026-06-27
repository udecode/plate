# chunking cleanup

Objective:
Clean Core chunking wrapper; done when standalone withChunking file/export is gone and focused Core proof passes.

Flow mode:
One-shot execution.

Goal plan:
docs/plans/2026-06-26-chunking-cleanup.md

Primary template:
docs/plans/templates/auto.md, compacted for a micro cleanup after the required Auto/autogoal reads.

Applied packs:
- none

Completion threshold:
- No `withChunking` source, export, import, or test remains under current Core/Plite source.
- `ChunkingPlugin` still proves default and configured `getChunkSize` behavior.
- `createPlateRuntimeEditor` still proves default and configured chunking behavior.
- Core barrel generation, typecheck, lint, and `pnpm check:core` pass.

Verification surface:
- Source audit: `rg -n 'withChunking' packages/core/src packages/plite packages/plite-react -g '*.ts' -g '*.tsx'`.
- Package proof: `pnpm --filter @platejs/core brl`.
- Package proof: `pnpm --filter @platejs/core test -- packages/core/src/lib/plugins/chunking/ChunkingPlugin.spec.ts`.
- Package proof: `pnpm --filter @platejs/core test -- packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts -t 'ChunkingPlugin'`.
- Package proof: `pnpm --filter @platejs/core typecheck`.
- Package proof: `pnpm --filter @platejs/core lint`.
- Closure proof: `pnpm check:core`.

Constraints:
- Do not create public compat aliases.
- Do not weaken configured chunking behavior.
- Do not move unrelated Plite/Plate runtime APIs in this packet.
- Do not use Browser proof; this is source/runtime API cleanup with no UI route touched.

Boundaries:
- Allowed: `packages/core/src/lib/plugins/chunking/**`, `packages/core/src/react/editor/createPlateRuntimeEditor.ts`, this plan.
- Generated barrel updates allowed through `pnpm --filter @platejs/core brl`.
- Not in scope: broader Plate runtime bridge deletion, Plite DOM strategy architecture, docs, examples, benchmarks, release, commit.

Output budget strategy:
- Read only the named chunking files, exact runtime references, and focused proof output. Broad searches used `rg` with exact symbols and capped output.

Blocked condition:
- Stop only if configured `ChunkingPlugin` cannot preserve legacy non-runtime behavior while removing the standalone `withChunking` file, or if Core/Plite checks fail without a local owner.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User asked what `packages/core/src/lib/plugins/chunking/withChunking.ts` is; cleanup target captured. |
| `auto` source rule read | yes | `.agents/skills/auto/SKILL.md` read in chunks through EOF. |
| `autogoal` source rule read | yes | `.agents/skills/autogoal/SKILL.md` read in chunks through EOF. |
| Active goal checked or created | yes | `get_goal` returned no active goal; goal created for this cleanup. |
| Lane resolved | yes | Plate/Core cleanup lane touching `@platejs/core`; no public queue or current-tree closure routing. |
| Invocation mode and timebox recorded | yes | One-shot micro execution; no duration requested. |
| Output budget strategy recorded | yes | Exact-symbol reads and focused commands only. |

Work Checklist:
- [x] Explain what `withChunking.ts` was: a tiny legacy `overrideEditor` shim that installed `editor.getChunkSize`.
- [x] Audit current call sites and runtime handling.
- [x] Delete standalone `withChunking.ts` and its public export.
- [x] Move the legacy non-runtime behavior inline into `ChunkingPlugin`.
- [x] Keep runtime chunking handled by `runtimeChunking` instead of importing the old wrapper.
- [x] Rename the focused spec to `ChunkingPlugin.spec.ts`.
- [x] Verify no `withChunking` references remain.
- [x] Run focused Core proof and `pnpm check:core`.
- [x] Record workflow slowdown from Core package test filtering.
- [x] Update final changed list, review attention, stopping checkpoints, verification, and risks.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Source audit | yes | Prove `withChunking` is gone. | `rg -n 'withChunking' packages/core/src packages/plite packages/plite-react -g '*.ts' -g '*.tsx'` returned no matches. |
| Package/API proof | yes | Regenerate barrels and run Core checks. | `pnpm --filter @platejs/core brl`, typecheck, lint, tests, and `pnpm check:core` passed. |
| Behavior proof | no | Not a browser-visible behavior packet. | Legacy and runtime chunking unit specs passed. |
| Browser proof | no | No app/content route changed. | Not applicable. |
| Workflow slowdown review | yes | Record avoidable command friction. | `pnpm --filter @platejs/core test -- <file>` ignored file args and ran 739 tests; `check:core` batched correctly. |
| Goal plan complete | yes | Run mechanical plan checker. | To run after this plan update. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Source read | complete | Read chunking plugin, deleted wrapper, runtime special-case, specs, render usage. | Patch |
| Patch | complete | Removed wrapper/export and rewired runtime detection to `runtimeChunking`. | Verify |
| Verify | complete | Core tests/type/lint/check passed. | Close |
| Close | complete | Plan updated with evidence and risk rows. | Final response |

Packet ledger:
| Packet | Owner | Hypothesis / failure signature | Files / commands | Decision |
|--------|-------|--------------------------------|------------------|----------|
| chunking-wrapper-cut | auto/Core | Standalone `withChunking` is migration sludge; keep only inline legacy install and runtime flag. | `ChunkingPlugin.ts`, `index.ts`, `createPlateRuntimeEditor.ts`, chunking spec rename. | keep |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| `pnpm --filter @platejs/core test -- <file>` | @platejs/core test script | about 1.4s per run | File filter was ignored and all 115 Core test files ran. | 739 pass, 0 fail. | keep for now; `check:core` owns reliable batching. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Deleted public `withChunking` export/file; inlined legacy chunking install in `ChunkingPlugin`; runtime now strips chunking override by `runtimeChunking` flag. |
| tests/oracles/browser proof | Renamed `withChunking.spec.ts` to `ChunkingPlugin.spec.ts`; no Browser proof needed. |
| benchmarks/metrics/targets | none |
| examples/docs | none |
| skills/workflow | none |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Legacy `editor.getChunkSize` still exists. | It is retained only for old non-runtime Plate content; Plite runtime does not appear to consume it. | `packages/core/src/lib/editor/BaseEditor.ts` and `packages/core/src/lib/plugins/chunking/ChunkingPlugin.ts` | Accept this packet, then cut the legacy branch in the broader Plate v2 runtime cleanup. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none | none | No user decision needed. | Packet is a safe source cleanup. | none | all cleanup work | Continue broader Core runtime bridge deletion separately. | this plan |

Findings:
- `withChunking.ts` only set `editor.getChunkSize`.
- Runtime `createPlateRuntimeEditor` already reimplemented chunking and stripped the legacy override through a special case.
- `@platejs/plite-react` owns current segmented DOM strategy; Core `renderChunk/getChunkSize` is legacy content-branch surface.

Decisions and tradeoffs:
- Keep legacy `getChunkSize` behavior inline for now because `createBaseEditor` tests still cover it.
- Do not move chunking into Plite in this packet; the active request was about the stale wrapper file, not a full DOM strategy rearchitecture.
- Remove `withChunking` as public/exported shape because it is not a public API worth preserving.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Core package test file filter ignored | 2 | Use `check:core` for reliable Core batching. | Recorded as workflow slowdown. |

Verification evidence:
- `rg -n 'withChunking' packages/core/src packages/plite packages/plite-react -g '*.ts' -g '*.tsx'` -> no matches.
- `pnpm --filter @platejs/core brl` -> passed.
- `pnpm --filter @platejs/core test -- packages/core/src/lib/plugins/chunking/ChunkingPlugin.spec.ts` -> passed, but ran all Core tests: 739 pass, 0 fail.
- `pnpm --filter @platejs/core test -- packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts -t 'ChunkingPlugin'` -> passed, but ran all Core tests: 739 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck` -> passed.
- `pnpm --filter @platejs/core lint` -> passed, 398 files checked.
- `pnpm check:core` -> passed: Core+Plite typecheck, type contracts, lint, Core tests, and Plite tests.

Final handoff contract:
- Goal plan: docs/plans/2026-06-26-chunking-cleanup.md
- Lane: Plate/Core cleanup
- Surface and route/package: `@platejs/core` chunking plugin
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: one-shot micro cleanup, no timebox, one packet
- Behavior gates and visual proof: unit/runtime chunking specs passed; no browser-visible route touched
- Primary metric baseline/latest/best and stop reason: not a perf packet
- Bugs fixed and oracles added: stale wrapper/export removed; spec renamed around the real owner
- Benchmark/skill/docs repairs: none
- Workflow slowdowns and repairs: Core package test filter ignored file args; recorded, no script repair in this packet
- Changed list: see table above
- Needs your attention: legacy `editor.getChunkSize` remains as broader runtime cleanup debt
- Stopping checkpoints to unblock: none
- Accepted deferrals and residual risks: broader legacy content branch/chunking API cut deferred to Plate v2 runtime cleanup
- Next owner: broader `auto` / Plate runtime bridge deletion lane if continuing cleanup

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Chunking cleanup verification complete. |
| Where am I going? | Mechanical plan check, goal completion, final handoff. |
| What is the goal? | Remove standalone `withChunking` without regressing chunking behavior. |
| What have I learned? | The file was legacy override glue; runtime already owns chunking through a separate installer. |
| What have I done? | Deleted wrapper/export, inlined legacy install, kept runtime flag, ran Core/Plite proof. |
| What changed in the checkpoint plan? | Compacted auto template to a micro cleanup ledger with closed evidence. |

Open risks:
- `editor.getChunkSize` itself is still legacy API debt, but cutting it belongs to the broader legacy Plate content branch removal, not this wrapper cleanup.

Timeline:
- 2026-06-26T11:06:07.938Z Goal plan created.
- 2026-06-26T11:06Z Source audit found `withChunking.ts` as legacy `overrideEditor` glue.
- 2026-06-26T11:07Z Deleted wrapper/export and rewired runtime handling.
- 2026-06-26T11:08Z Core/Plite verification passed.
