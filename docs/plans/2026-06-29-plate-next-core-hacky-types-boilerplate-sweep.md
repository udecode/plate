# plate-next core hacky types boilerplate sweep

Objective:
Sweep uncommitted Core/Plite changes for hacky types and boilerplate, moving generic editor capability gaps into Plite where Core would otherwise need dirty code.

Completion threshold:
Done when target hack patterns are either removed, moved into Plite as first-class capability, or recorded with a next-owner deletion packet; every touched Core/Plite file has a ledger row; focused proof and `pnpm check:core` pass.

Verification surface:
Core and Plite source/type tests, targeted plugin tests for Parser/InputRules/DOM/NodeId/injected props, Plite clipboard contracts, related source audits, touched-file drift ledger, and final `pnpm check:core`.

Constraints:
No rename pass, no public compat aliases, no staging/commit, no unrelated packages, no local Core shim when Plite owns the generic editor capability, and no green-test-only claim for large bridge files.

Boundaries:
Allowed edits were `packages/core`, `packages/plite`, `tooling/scripts/check-core.mjs`, and this autogoal plan/artifacts. Browser/docs surfaces were out of scope. Remaining bridge/generic cleanup is owned by future `plate-next` packets.

Blocked condition:
None. The packet is complete; remaining high-drift files are review attention items, not blockers for this target smell sweep.

Explicit request checkpoint:
- Skill: `plate-next`.
- Scope: review uncommitted Core files, especially hacky types and boilerplate like `packages/core/src/lib/plugins/ParserPlugin.ts` API.
- Authority: patch Core and Plite when Plite needs a real capability so Core does not carry local shims.
- Non-goal: do not rename, stage, commit, or broaden into unrelated packages.
- Stop condition: target smells are fixed or ledgered, focused proof and `pnpm check:core` pass.
- Final handoff: changed list, proof, remaining review attention, and next owner.

Artifacts:
- changed file manifest: `docs/plans/artifacts/2026-06-29-plate-next-core-hacky-types-boilerplate-sweep/touched-files.txt`
- Core source manifest: `docs/plans/artifacts/2026-06-29-plate-next-core-hacky-types-boilerplate-sweep/core-manifest.txt`
- untracked Core/Plite inventory: `docs/plans/artifacts/2026-06-29-plate-next-core-hacky-types-boilerplate-sweep/untracked-core-plite.txt`
- source risk audit: `docs/plans/artifacts/2026-06-29-plate-next-core-hacky-types-boilerplate-sweep/source-risk-audit.txt`
- related sweep ledger: `docs/plans/artifacts/2026-06-29-plate-next-core-hacky-types-boilerplate-sweep/related-sweeps.tsv`
- touched drift ledger: `docs/plans/artifacts/2026-06-29-plate-next-core-hacky-types-boilerplate-sweep/touched-drift-ledger.tsv`

Scope counts:
- touched Core/Plite/tooling files: 199 rows plus header in touched drift ledger.
- Core source manifest: 385 rows.
- untracked Core/Plite files: 3 rows.
- missing touched ledger rows: 0.
- extra touched ledger rows: 0.

Implemented packets:
- Plite clipboard extension API: `editor.api.clipboard.insertData(dataTransfer)` composes `clipboard.insertData` middleware, supports `next(data?)`, and fails closed when no middleware handles the data.
- ParserPlugin: removed local `ClipboardApi` shim and uses the Plite clipboard extension slot.
- InputRulesPlugin: removed local `ClipboardApi` shim and uses the Plite clipboard extension slot with replacement data delegation.
- Input rule helpers: removed pass-through aliases over `editor.update.*`.
- DOMPlugin: helper functions accept `BaseEditor` directly; `scrollIntoView` is typed on `DomConfig` instead of hidden in a local structural cast.
- Parser pipe helpers: accept `AnyBasePlugin[]`, removing `p as any` plugin context casts.
- NodeIdPlugin: removed `filter(entry as never)` casts.
- injected node props: changed style typing from the false `CSSStyleDeclaration` shape to plain style objects, and removed local indexing/style casts.
- `check:core`: builds the Plite artifact before Core runtime tests so Core tests do not run against stale Plite dist output.

Related sweeps:
- Clipboard shims: only the Plite owner remains.
- Input-rule pass-through helper names: 0 matches.
- DOM `editor as never` helper calls: 0 matches.
- Parser pipe `p as any` casts: 0 matches.
- NodeId `filter(entry as never)` casts: 0 matches.
- Inject-node-props style/indexing casts: 0 target-pattern matches.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured | yes | Explicit request checkpoint copied before closeout |
| Plate Next source applied | yes | Used Plate/Plite boundary law and no-shim policy |
| Active autogoal created | yes | Goal objective references this plan path |
| Broad touched-file review ledger | yes | `touched-drift-ledger.tsv` has 199 touched rows plus header |

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Target smells fixed or ledgered | yes | source risk audit and related sweeps recorded |
| Plite gaps fixed in Plite | yes | clipboard extension API added in Plite |
| Focused proof | yes | Parser/InputRules/DOM/NodeId/injected-props/clipboard tests passed |
| Broad proof | yes | `pnpm check:core` passed |
| Remaining risk recorded | yes | high-drift review attention rows listed |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Plan and manifest | done | touched/core/untracked manifests written |
| Plite capability repair | done | clipboard API and contracts green |
| Core shim cleanup | done | Parser/InputRules/DOM/NodeId/injected-props cleanups green |
| Related sweeps | done | related-sweeps.tsv and source-risk-audit.txt written |
| Final proof | done | `pnpm check:core` passed |

Remaining review attention:
- `packages/core/src/lib/editor/withPlite.ts`: still a large migration bridge with casts/root mapping/plugin extension adaptation. It needs a separate bridge deletion packet; green tests do not make it clean.
- `packages/core/src/internal/plugin/resolvePlugins.ts`: dynamic plugin extension/override/input-rule plumbing still has broad casts. Separate plugin generic cleanup packet.
- `packages/core/src/internal/plugin/resolvePlugin.ts`: internal configuration/input-rule metadata casts remain. Separate plugin generic cleanup packet.
- `packages/core/src/react/plugins/SlateReactExtensionPlugin.ts`: still has React plugin adaptation casts. Defer to React plugin hardening.

Proof:
- `pnpm --filter @platejs/core exec bun test ./src/lib/plugins/dom/DOMPlugin.spec.ts ./src/lib/plugins/input-rules/createInputRules.spec.ts ./src/lib/plugins/input-rules/createRuleFactory.spec.ts ./src/lib/plugins/input-rules/createTextSubstitutionInputRule.spec.ts ./src/lib/plugins/node-id/NodeIdPlugin.spec.tsx ./src/lib/plugins/ParserPlugin.spec.ts` passed: 34 pass.
- `pnpm --filter @platejs/core exec bun test ./src/internal/plugin/pluginInjectNodeProps.spec.ts ./src/lib/plugins/dom/DOMPlugin.spec.ts ./src/lib/plugins/node-id/NodeIdPlugin.spec.tsx ./src/lib/plugins/ParserPlugin.spec.ts ./src/lib/plugins/input-rules/createInputRules.spec.ts` passed: 33 pass.
- `pnpm --filter @platejs/plite exec bun test ./test/extension-methods-contract.ts -t "extension clipboard middleware receives read-only state without tx"` passed: 1 pass.
- `pnpm --filter @platejs/plite exec bun test ./test/clipboard-contract.ts` passed: 40 pass.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plite` passed.
- `pnpm check:core` passed: typecheck, type contracts, Core lint, Plite lint, Plite artifact build, Core 683 tests, Plite 1872 pass / 85 skipped.

Verification evidence:
Fresh final evidence is `pnpm check:core` passing after all patches, with Core 683 tests passing and Plite 1872 tests passing / 85 skipped. Focused plugin and Plite clipboard commands also passed before the final gate.

Verdict:
- keep this packet.
- Confidence: 92/100 for the target smell class.
- Next owner: `plate-next` bridge deletion / plugin generic cleanup.

Reboot status:
No reboot needed. Current state can resume from the review-attention list if the next packet continues bridge deletion or plugin generic cleanup.

Open risks:
Large migration bridge and plugin-resolution generic debt remain in `withPlite.ts`, `resolvePlugins.ts`, `resolvePlugin.ts`, and `SlateReactExtensionPlugin.ts`; they are explicitly not cleaned by this Parser/InputRules/DOM shim packet.

Work Checklist:
- [x] Prompt requirements copied.
- [x] Plate Next source/rules applied.
- [x] Active autogoal created.
- [x] Touched file ledger generated.
- [x] Related sweeps recorded.
- [x] Plite gaps fixed in Plite instead of Core shims.
- [x] Focused tests passed.
- [x] `check:core` passed.
- [x] Remaining high-drift files named with next owner.
