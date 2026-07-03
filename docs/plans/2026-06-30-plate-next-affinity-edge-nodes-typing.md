# plate-next affinity edge nodes typing

Objective:
Repair Affinity helper editor typing; done when affinity helpers avoid lazy
`BaseEditor<any, any>` and focused Core proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-30-plate-next-affinity-edge-nodes-typing.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Completion threshold:
- No `BaseEditor<any, any>` remains in `packages/core/src/lib/plugins/affinity`.
- `getEdgeNodes` and its Affinity helper cluster use a narrow editor capability
  type instead of a broad plugin-`any` editor.
- `getPluginByType` no longer requires a whole broad editor when it only needs
  plugin lookup state.
- Focused Affinity tests pass.
- Core typecheck, lint, type contracts, and `check:core` pass.

Verification surface:
- `rg -n "BaseEditor<any, any>" packages/core/src/lib/plugins/affinity`
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity`
- `pnpm --filter @platejs/core typecheck`
- `pnpm --filter @platejs/core lint`
- `pnpm exec tsc -p packages/core/tsconfig.type-tests.json --noEmit`
- `pnpm check:core`

Constraints:
- No runtime behavior change.
- No rename pass.
- No public compatibility alias or local cast.
- Preserve the existing Affinity owner.
- Repair the type owner if the local helper smell points at an overtyped Core
  utility.

Boundaries:
- Edited Core plugin lookup typing and Affinity helper cluster only.
- Docs/browser surfaces are not in scope.
- Non-Core packages are out of scope unless this Core type change breaks them.

Output budget strategy:
- Use targeted `sed` reads and narrow `rg` queries under Core plugin files.
- Cap command output and tail broad checks.

Blocked condition:
Blocked only if Affinity helper typing requires a broader public editor type
fork. It did not.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User targeted `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.ts` and the lazy `<any, any>` editor type. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read. |
| Active goal checked or created | yes | Active goal created for this packet. |
| Mode classified as named packet vs broad Core sweep | yes | Named Affinity helper typing packet with related helper sweep. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Narrow capability type and lookup API; no compatibility shim. |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; Core Affinity/plugin lookup files. |
| Output budget strategy recorded | yes | Targeted reads/searches only. |
| Public API fork routing checked | yes | No public API fork required. |
| Gap policy checked | yes | No Plite/Plate gap remains. |
| Related Core sweep policy checked | yes | Swept Affinity helper cluster for `BaseEditor<any, any>`. |
| Review-mode rename freeze checked | yes | No renames. |

Work Checklist:
- [x] First checkpoint captured explicit target, scope, non-goals, stop
      condition, proof commands, and final handoff requirements.
- [x] Mode classified as named file/API packet.
- [x] Best Plate v2 call recorded: narrow capability type, not broad editor.
- [x] Legacy/backcompat decision recorded: no public shim, no cast.
- [x] Hack check recorded: local broad editor type removed.
- [x] Gap ledger updated: N/A, no gap after narrowing `getPluginByType`.
- [x] Related Core sweep row added for Affinity helper cluster.
- [x] Broad Core drift ledger marked N/A because not requested.
- [x] Review matrix filled for inspected API/type surfaces.
- [x] Public API fork routing checked.
- [x] Review-mode rename freeze applied.
- [x] Extracted-file recovery gate closed: no new extracted source owner.
- [x] Safe cleanup packet kept with proof.
- [x] Focused package proof run after code changes.
- [x] Barrel check recorded N/A because no export barrel changed.
- [x] Old compatibility names audited with source search.
- [x] Changed list, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | Source audit, focused tests, typecheck, lint, type contracts, and `check:core` pass. |
| Broad Core drift ledger coverage | no | Record N/A | Named helper packet only. |
| Score gate | no | Record N/A | No broad drift scoring. |
| Best Plate v2 recommendation | yes | Record shape and rejected alternatives | Use `AffinityEditor` narrow capability and narrow `getPluginByType`; reject helper-local `<any, any>`. |
| Plite/Plate gap ledger | yes | Record blocker or N/A | N/A: no missing substrate after lookup narrowing. |
| Related Core sweep after correction | yes | Record query/matches/patched/deferred | `BaseEditor<any, any>` under Affinity returns no matches. |
| Package/API proof | yes | Run focused typecheck/test/lint | Passed. |
| Non-Core package error triage | no | Record N/A | Core-only packet. |
| Source audit | yes | Run exact audit | No Affinity `BaseEditor<any, any>` matches. |
| Rename ledger | no | Record N/A | No renames. |
| Extracted-file inventory | no | Record N/A | No extracted/untracked file owner introduced by this packet. |
| Autoreview / review | no | Record N/A | Focused type-only packet; command proof substituted. |
| Final lint/check | yes | Run scoped lint/check | Core lint and `check:core` pass. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below. |
| Goal plan complete | yes | Run `check-complete.mjs` | Ready for mechanical check. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| checkpoint zero | done | Requirements copied. |
| source read | done | Read Affinity helpers, plugin lookup owner, and editor type owner. |
| implementation | done | Added `AffinityEditor`, narrowed `getPluginByType`, removed Affinity `<any, any>`. |
| proof | done | Tests/type/lint/check commands passed. |
| handoff | done | Plan updated with evidence and risks. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.ts` | 1 | main-parity-cleanup | Affinity | Uses `AffinityEditor`, no broad editor generics. | Keep. |
| `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts` | 1 | main-parity-cleanup | Affinity | Uses `AffinityEditor`. | Keep. |
| `packages/core/src/lib/plugins/affinity/queries/isNodeAffinity.ts` | 1 | main-parity-cleanup | Affinity | Uses `AffinityEditor`. | Keep. |
| `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.ts` | 1 | main-parity-cleanup | Affinity | Uses `AffinityEditor`. | Keep. |
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.ts` | 1 | main-parity-cleanup | Affinity | Local helpers use `AffinityEditor`. | Keep. |
| `packages/core/src/lib/plugins/affinity/types.ts` | 1 | keep-in-plate | Affinity | Defines structural `AffinityEditor` from `BaseEditor.read` plus plugin lookup capability. | Keep. |
| `packages/core/src/lib/plugin/getSlatePlugin.ts#getPluginByType` | 2 | main-parity-cleanup | Core plugin lookup | Parameter narrowed from full broad editor to `getPlugin` + `meta`; callers still pass. | Keep. |
| `packages/core/src/lib/editor/SlateEditor.ts` unknown plugin fallback | 2 | main-parity-cleanup | Core editor types | Unknown plugin fallback changed from `Record<string, unknown>` to `{}`; fake API/tx type contracts still pass. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Affinity helper editor param | `AffinityEditor = Pick<BaseEditor, 'read'> & plugin lookup capability` | `BaseEditor<any, any>`, helper-local cast, plugin-context-only editor | The helper needs reads and plugin lookup, not a fully open editor API/tx surface. | Low. |
| `getPluginByType` | Accept only `getPlugin` + `meta` | Full `BaseEditor<any, any>` parameter | The function does not read/update editor state. | Low. |
| Unknown plugin fallback | `{}` | `Record<string, unknown>` | `{}` still rejects fake APIs and avoids unnecessary variance friction. | Low. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | None | No workaround needed after lookup narrowing. | N/A | N/A | Closed. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| `getEdgeNodes` broad editor typing | `rg -n "BaseEditor<any, any>" packages/core/src/lib/plugins/affinity` | 0 after patch | Affinity helper cluster patched | 0 | None known. |
| `getPluginByType` overtyped full editor | Caller/source review under Core plugin lookup and Affinity | 1 owner plus callers | `getPluginByType` narrowed; Affinity uses derived capability | 0 | Other plugin lookup helpers still broad by design or separate review. |
| Unknown fallback variance | Type contract rerun | fake API/tx probes consumed | Fallback changed to `{}` | 0 | None known. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Narrowed `getPluginByType`; changed unknown plugin fallback to `{}`; added Affinity structural editor type; removed Affinity helper `<any, any>`. |
| tests/proof | No new tests; existing Affinity tests and type contracts prove the change. |
| docs/templates/skills | Updated this autogoal plan only. |
| reverted/quarantined packets | None. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Other non-Affinity `BaseEditor<any, any>` sites still exist | This packet intentionally fixed only the called-out Affinity smell and immediate owner API. | Core plugin/render/runtime helpers | Review next one-by-one or broad sweep; do not treat this as whole-Core cleanup. |

Findings:
- `getEdgeNodes` only needs reads and plugin lookup, not broad editor mutation
  or plugin tx surfaces.
- `getPluginByType` was overtyped as a whole broad editor even though it only
  needs `meta.pluginCache.node.types` and `getPlugin`.
- `Record<string, unknown>` for unknown plugin fallback was too strict for
  assignment variance; `{}` keeps fake API rejection and composes better.

Decisions and tradeoffs:
- Kept Affinity behavior and ownership unchanged.
- Added one narrow `AffinityEditor` type in the Affinity owner instead of
  leaking `BaseEditor<any, any>` through every helper.
- Did not broaden the scope to every Core broad editor site.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Bare `BaseEditor` helper type failed Core typecheck because plugin callback editors are not assignable to the unknown plugin fallback editor | 1 | Narrow the actual capabilities and fix overtyped lookup owner | Resolved by `AffinityEditor`, `getPluginByType` narrowing, and `{}` fallback. |

Verification evidence:
- `rg -n "BaseEditor<any, any>" packages/core/src/lib/plugins/affinity` returned no matches.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity` passed: `43 pass`, `0 fail`.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint:fix` ran and made no final changes after formatting.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm exec tsc -p packages/core/tsconfig.type-tests.json --noEmit` passed.
- `pnpm check:core` passed: `1872 pass`, `85 skip`, `0 fail`.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Affinity helper typing packet is complete. |
| Where am I going? | Run the final mechanical plan check, then close the goal. |
| What is the goal? | Remove lazy broad editor typing from Affinity without behavior regression. |
| What learned? | The true owner fix was narrowing plugin lookup and unknown fallback, not adding another generic alias. |
| What done? | Patched lookup/types/helpers and proved Core green. |

Open risks:
- Low: broader Core still has legitimate and questionable `BaseEditor<any, any>`
  sites outside Affinity, but those were not in this named packet.
