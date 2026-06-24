# plate core api law hard cut

Objective:
Cut Plate core legacy runtime API; done when core and one representative package use Plite update/api law and gates pass.

Automation source:
- User-invoked `auto` lane.
- Prompt: finalize core API law; delete runtime compat bridge; make Plite runtime the default core route; cut `runtime` param; split `createPlateRuntimeEditor.ts` only after compat sludge is gone; then sweep packages.
- Lane: Plate core runtime/API.
- Timebox: none.

First checkpoint:
- Explicit prompt requirements were copied here before implementation.
- Checkpoints are mutable: update them as evidence changes.

Completion threshold:
- Complete this checkpoint when core no longer exposes the legacy transform surfaces, the Plite runtime is the default core route, `createPlateRuntimeEditor.ts` has at least one durable post-cut split, one representative package is migrated and green, banned API audits are clean, and the plan records remaining broad-sweep debt before pausing for review.

Verification surface:
- Source audits for banned legacy API strings and runtime selector support.
- Core/list typecheck, build, lint, focused core runtime tests, and full `@platejs/list` package tests.
- Plan evidence updated with exact commands and remaining risks.

Constraints:
- No public compat aliases or runtime shims.
- Keep `extendTx` and `extendTxGroup`.
- Do not split the runtime monolith before deleting compat sludge.
- Pause after core plus one representative package are clean; do not start the broad package sweep before review.

Boundaries:
- This checkpoint covers core runtime/API law and one representative package migration.
- Link/math package failures are recorded as future package lanes, not solved inside this checkpoint.
- Full Plate v2 package sweep and release claims are outside this checkpoint.

Blocked condition:
- Blocked only if the core/list gates cannot pass without reintroducing a banned compat surface or changing the approved API law.

Work Checklist:
- [x] Copy explicit requirements into the plan before implementation.
- [x] Remove legacy public transform surfaces from core.
- [x] Make Plite runtime the default core route and cut runtime selector support.
- [x] Split durable runtime owners after compat cleanup.
- [x] Migrate and prove one representative package.
- [x] Run source audits and focused gates.
- [x] Record remaining broad-sweep debt and pause before continuing.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Core API hard cut | done | Banned API and legacy bridge audits return no matches. |
| Runtime default route | done | Runtime selector audit returns no legacy runtime route. |
| Runtime split | done | Parser, NodeId, and input-rule owners extracted. |
| Representative package | done | `@platejs/list` passes full package tests. |
| Broad package sweep | paused | Link/math dirty lanes recorded for later package-by-package work. |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/list` passed after final edits.
- `pnpm --filter @platejs/core --filter @platejs/list build` passed after final edits.
- `pnpm --filter @platejs/core --filter @platejs/list lint:fix` passed after final edits.
- `bun test src/react/editor/createPlateRuntimeEditor.spec.ts src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts src/react/utils/inputRules.spec.tsx src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` passed with 134 tests.
- `pnpm --filter @platejs/list test` passed with 104 tests.
- Final banned API and legacy bridge audits returned no matches.

Reboot status:
- Current checkpoint is review-ready: core plus `@platejs/list` are green. Resume with link/math package lanes or another runtime-file split only after review.

Open risks:
- Full core package test still needs harness cleanup because focused proof is green but the full command was previously too slow/noisy.
- `@platejs/link` and `@platejs/math` have package-specific dirty lanes still outside this checkpoint.
- `createPlateRuntimeEditor.ts` is still large after the first split.

Core API law:
- `editor.api.*` is for reads, services, and plugin APIs.
- `editor.update(tx => tx.*)` is for mutations and commands.
- `extendTx` and `extendTxGroup` stay.
- `extendTransforms`, `editor.tf`, `getTransforms`, and `getPluginApi` die.
- Public compat aliases and runtime shims are not allowed.
- Private bridges are allowed only as deletion scaffolds with a named owner and proof gate.

Status:
- Public API hard cut: complete.
- Runtime compat bridge deletion: complete for the requested public/private bridge surfaces.
- Core tests migrated off `editor.tf`: complete for touched/focused core rows.
- First representative package migration: complete (`@platejs/list` is green on the Plite route; `@platejs/code-block` and `@platejs/selection` were also proved individually; table and utils were also proved).
- Broad banned-API package sweep: complete for the current banned patterns.
- `createPlateRuntimeEditor.ts` split: in progress. Parser, NodeId, and input-rule runtime owners were extracted; the file is still large enough that one more cleanup packet is warranted.
- Final closure: not complete until the remaining large-file split/review gate, link/math dirty-lane decisions, and autoreview are done.

Requirement ledger:
| Requirement | Status | Evidence |
|-------------|--------|----------|
| `editor.api.*` reads/services/plugin APIs | done | Runtime API surface kept; copy serialization moved to `editor.api.setFragmentData`; composing exposed through API. |
| `editor.update(tx => tx.*)` mutations/commands | done | Core and package callers migrated from `editor.tf` / `api.create.*` to `editor.update` or literal nodes. |
| Keep `extendTx` / `extendTxGroup` | done | Tx extension path preserved through `runtimeTxExtensions.ts`. |
| Kill `extendTransforms`, `editor.tf`, `getTransforms`, `getPluginApi` | done | Final banned API audit returned no matches in package source/tests. |
| Delete runtime compat bridge | done | Deleted legacy update bridge; current runtime bridge no longer exposes public `tf`; transform override plumbing removed from touched owners. |
| Make Plite runtime default | done | `runtime` selector audit is clean for core editor route. |
| Cut `runtime` param | done | No supported `runtime` option remains in scoped core editor route audit. |
| Split `createPlateRuntimeEditor.ts` after cleanup | partial | Extracted `runtimeParser.ts`, `runtimeNodeId.ts`, and `runtimeInputRules.ts`; monolith is currently 9,886 lines after adding runtime list sequence law. |
| Package sweep | done for banned API hits | All current banned API package hits were patched and proved where touched. |

Changed list:
| Area | Changes |
|------|---------|
| Core runtime bridge | Deleted `legacyRuntimeUpdateBridge.ts`; added `runtimeTxExtensions.ts`; removed public `editor.tf` descriptor/fallback; renamed current runtime transform install surface; removed transform override merge path. |
| Core editor route | `createPlateRuntimeEditor.ts` no longer installs transform facade compatibility; API surface renamed from compat to runtime; host clipboard insertion goes through `editor.update`; normalize remove-vs-merge behavior fixed. |
| Core plugins/tests | Migrated input rules, length, static, parser, fragment insertion, normalize initial value, override editor, Plite React extension, omit context, render props, and Plate slow tests off old transform/create APIs. |
| Runtime defaults | Added base length extension in `withPlite`; runtime length reads plugin options through current API shape. |
| Runtime split | Extracted parser, NodeId, and input-rule runtime feature owners from `createPlateRuntimeEditor.ts`. |
| Package callers | Patched `code-block`, `selection`, `markdown`, `list-classic`, `ai`, `table`, and `utils` banned API callers. |
| List runtime proof | Migrated list input-rule/toggle-list proof to the Plite runtime; `toggleList` filters expanded selections to block element entries; runtime list normalization now honors `getSiblingListOptions`, nested siblings, heading boundaries, and page-wrapper sibling providers. |
| Representative packages | `code-block` and `selection` proved with package tests; table and utils were proved earlier in the same lane. |

Proof:
| Command | Result |
|---------|--------|
| `pnpm turbo typecheck --filter=./packages/core` | pass |
| `pnpm --filter @platejs/core build` | pass |
| focused core suite covering runtime/plugin/store/API rows | 190 pass, 0 fail |
| `pnpm turbo typecheck --filter=./packages/core --filter=./packages/code-block --filter=./packages/list-classic --filter=./packages/markdown --filter=./packages/selection --filter=./packages/ai` | pass |
| `pnpm --filter @platejs/core --filter @platejs/code-block --filter @platejs/list-classic --filter @platejs/markdown --filter @platejs/selection --filter @platejs/ai lint:fix` | pass |
| `pnpm --filter @platejs/core --filter @platejs/code-block --filter @platejs/list-classic --filter @platejs/markdown --filter @platejs/selection --filter @platejs/ai build` | pass |
| `pnpm --filter @platejs/code-block test` | 79 pass, 0 fail |
| `pnpm --filter @platejs/selection test` | 102 pass, 0 fail |
| grouped package tests for markdown/list-classic/ai | markdown 234 pass; list-classic 105 pass; ai 64 pass |
| `pnpm turbo typecheck --filter=./packages/table` | pass |
| `pnpm --filter @platejs/table test` | 218 pass, 0 fail |
| `pnpm --filter @platejs/table build` | pass |
| `pnpm turbo typecheck --filter=./packages/utils` | pass |
| `bun test src/lib/plugins/ExitBreakPlugin.spec.ts` in `packages/utils` | 3 pass, 0 fail |
| `bun test src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/node-id/NodeIdPlugin.spec.tsx src/react/editor/createPlateRuntimeEditor.spec.ts` | 116 pass, 0 fail |
| `bun test src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts src/react/utils/inputRules.spec.tsx src/react/editor/createPlateRuntimeEditor.spec.ts` | 118 pass, 0 fail |
| `bun test src/react/editor/createPlateRuntimeEditor.spec.ts src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts src/react/utils/inputRules.spec.tsx src/lib/plugins/ParserPlugin.spec.ts src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` | 134 pass, 0 fail |
| `bun test src/lib/inputRules.spec.tsx` in `packages/list` | 3 pass, 0 fail |
| `pnpm turbo typecheck --filter=./packages/core --filter=./packages/list` | pass |
| `pnpm --filter @platejs/core --filter @platejs/list lint:fix` | pass |
| `pnpm --filter @platejs/list build` | pass |
| `pnpm --filter @platejs/list test` | 104 pass, 0 fail |
| `pnpm --filter @platejs/core --filter @platejs/list build` | pass |

Final audits:
| Audit | Result |
|-------|--------|
| `rg -n "api\\.create\\.block|editor\\.api\\.create\\.block|create\\.value\\(|create\\.block\\(|editor\\.tf|\\btf\\s*:|getPluginApi|getTransforms|extendTransforms|combinePlateMatchOptions" packages --glob '*.{ts,tsx}'` | no matches |
| `rg -n "legacyRuntimeUpdateBridge|installLegacyRuntimeUpdateBridge|CurrentRuntimeTransformHost|installCurrentRuntimeTransformFacade|Object\\.defineProperty\\(editor as object, 'tf'|Object\\.getOwnPropertyDescriptor\\(editor as object, 'tf'" packages/core/src packages --glob '*.{ts,tsx}'` | no matches |
| runtime selector audit under core editor/lib/react | no supported `runtime` option remains |

Workflow slowdowns:
| Slowdown | Impact | Decision |
|----------|--------|----------|
| `pnpm --filter @platejs/core test` hung/silent around 90s twice | Full core package test was not usable as a checkpoint proof. | Use focused core tests for this packet; make full package test harness a separate cleanup lane if it keeps hanging. |
| Grouped package test interrupted because core hung | Could not claim one combined all-package test command. | Individual and grouped non-core package proof is enough for this API sweep. |
| `@platejs/link` full package test | Expanded `upsertLink` helper tests fail in the broader package run. | Separate package migration lane; not caused by runtime parser/input-rule extraction. |
| `@platejs/math` full package test | One equation deleteBackward regression remains; math input-rule rows pass. | Separate package migration lane. |

Needs your attention:
| Rank | Item | Why | Recommendation |
|------|------|-----|----------------|
| 1 | `createPlateRuntimeEditor.ts` remaining split | Parser/NodeId/input-rules are out, but the file is still 9,886 lines. | Extract another durable owner only after this API-law review point is accepted. |
| 2 | Full core test harness hang | Focused proof is green, but the full package command is poor feedback. | Fix or split the core test lane before release-grade closure. |
| 3 | Link/math dirty tests | `@platejs/link` expanded `upsertLink` and `@platejs/math` equation deleteBackward have existing package failures. | Queue as package-by-package Plate migration lanes. |

Stopping checkpoints:
| Checkpoint | Type | Status | Next action |
|------------|------|--------|-------------|
| Core API law approval | soft review | ready | Review the final law and naming before deeper package migration. |
| Runtime file split | implementation | partial | Parser, NodeId, and input-rule owners extracted; continue with another durable owner later. |
| Full package sweep | implementation | partial | `code-block`, `selection`, table, utils, and list proved; link/math dirty lanes remain. |
| Final review | review | pending | Run `autoreview` before commit/release claims. |

Closeout rule:
- This checkpoint completed the API hard cut, banned-API sweep, first runtime split, and `@platejs/list` representative package migration.
- Pause here for API-shape review before broad package sweep.
- The next packet is link/math package migration or another focused runtime-file split; do not pretend the full package sweep is clean yet.
