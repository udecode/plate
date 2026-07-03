# plate-next static renderer spec any cleanup

Objective:
Remove `as any` from the named static renderer specs and repair owner typing so the tests use inferred Plate/Plite APIs.

Completion threshold:
The four named specs have zero `as any`, `: any`, `<any>`, or `unknown as` casts. Same-class static spec casts found by the related sweep are removed. Focused static renderer tests, Core typecheck, Core lint, static-spec source audits, and `pnpm check:core` pass.

Verification surface:
- Named specs: `packages/core/src/static/pipeRenderElementStatic.spec.tsx`, `pluginRenderElementStatic.spec.tsx`, `pluginRenderLeafStatic.spec.tsx`, `pluginRenderTextStatic.spec.tsx`.
- Related static specs: `serializeHtml.node-props.spec.ts`, `internal/getPlainText.spec.ts`.
- Owner type surfaces: `createBasePlugin`, render prop types, static renderer return types, `check:core` source-test aliases.

Constraints:
- No local `any` casts to hide renderer typing.
- Preserve main-style inline test setup.
- Fix owning API/type contracts when the test needs casts.
- Keep Core tests source-first; do not make `check:core` depend on stale package `dist`.

Boundaries:
This was a named static-renderer spec cleanup, not a broad Core drift sweep. I also patched same-class static spec casts and the `check:core` harness blockers discovered by proof.

Blocked condition:
None.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | User named four static renderer specs with `as any` slop. |
| Skill read | yes | `plate-next` read and applied. |
| Goal active | yes | Existing active goal confirmed by `get_goal`. |
| Mode classified | yes | Named file/API packet with correction sweep, not broad Core sweep. |
| Gap policy checked | yes | No Plite/Plate design blocker; source typing gaps patched directly. |

Work Checklist:
- [x] Read the named specs and static renderer owner types.
- [x] Remove test-side `as any` casts from all four named specs.
- [x] Repair static leaf/text/element renderer return types so no-match children are legal.
- [x] Repair `createBasePlugin` render input typing so static wrapper callbacks infer props.
- [x] Add injected attribute support to render prop attributes without test casts.
- [x] Sweep related static specs for same-class `as any` casts and remove safe matches.
- [x] Keep `check:core` source-first by aliasing Core/Plate package imports instead of requiring stale dist.
- [x] Remove Core input-rules test dependency on external feature packages.
- [x] Update Plite DOM public export smoke for `writeDOMFragmentData`.
- [x] Run focused tests, typecheck, lint, audits, and `pnpm check:core`.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Named spec cleanup | complete | Exact named-spec cast audit has no matches. |
| Source type repair | complete | Core typecheck passes. |
| Related static sweep | complete | Broader static spec cast audit has no matches. |
| Check-core repair | complete | `pnpm check:core` passes after source-first harness fixes. |

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused 6-file static test command passed: 14 pass. |
| Related Core sweep | yes | `rg -n "as any|: any|<any>|unknown as" packages/core/src/static --glob "*.spec.ts*"` returned no matches. |
| Package/API proof | yes | `pnpm --filter @platejs/core typecheck`, `pnpm --filter @platejs/core lint`, and `pnpm check:core` passed. |
| Non-Core package error triage | yes | Core input-rules spec no longer imports CodeBlock/Math packages; source aliases keep package proof source-first. |
| Source audit | yes | Named-spec and static-spec cast audits returned no matches. |
| Final check | yes | This plan is ready for `check-complete.mjs`. |

Review matrix:
| Path / API | Verdict | Owner | Evidence | Next |
|------------|---------|-------|----------|------|
| `packages/core/src/static/*Render*Static.spec.tsx` | main-parity-cleanup | Core static tests | Casts removed, real render props used. | keep |
| `packages/core/src/static/pluginRenderLeafStatic.tsx` | main-parity-cleanup | Core static renderer | Return type now matches children fallback. | keep |
| `packages/core/src/static/pluginRenderTextStatic.tsx` | main-parity-cleanup | Core static renderer | Return type now matches children fallback. | keep |
| `packages/core/src/static/pluginRenderElementStatic.tsx` | main-parity-cleanup | Core static renderer | Return type accepts wrapper React nodes. | keep |
| `packages/core/src/lib/plugin/createBasePlugin.ts` | main-parity-cleanup | Core plugin API | Render input uses full `BasePlugin` render shape. | keep |
| `packages/core/src/lib/types/Render*Props.ts` | main-parity-cleanup | Core render props | Injected attrs are typeable without casts. | keep |
| `tooling/scripts/check-core.mjs` | keep-in-plate | Core proof harness | Core tests now preload source aliases. | keep |
| `packages/core/src/react/utils/inputRules.spec.tsx` | main-parity-cleanup | Core input-rules tests | Removed external feature-package imports from Core lane. | keep |
| `packages/plite/test/public-package-import-smoke.test.ts` | main-parity-cleanup | Plite public export proof | Listed `writeDOMFragmentData`. | keep |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | none | none | none | no blocker |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove static spec `any` casts | `rg -n "as any|: any|<any>|unknown as" packages/core/src/static --glob "*.spec.ts*"` | 6 related matches after named files | 6 | 0 | none |
| Remove feature-package imports from Core test | `rg -n "@platejs/code-block|@platejs/math|from ['\"]platejs" packages/core/src/react/utils/inputRules.spec.tsx` | 0 after patch | 0 | 0 | none |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/static/pipeRenderElementStatic.spec.tsx src/static/pluginRenderElementStatic.spec.tsx src/static/pluginRenderLeafStatic.spec.tsx src/static/pluginRenderTextStatic.spec.tsx src/static/serializeHtml.node-props.spec.ts src/static/internal/getPlainText.spec.ts` -> 14 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `rg -n "as any|: any|<any>|unknown as" packages/core/src/static --glob "*.spec.ts*"` -> no matches.
- `rg -n "@platejs/code-block|@platejs/math|from ['\"]platejs" packages/core/src/react/utils/inputRules.spec.tsx` -> no matches.
- `pnpm check:core` -> pass: Core 699 pass; Plite 1898 pass, 85 skip.

Reboot status:
Use this plan and rerun `pnpm check:core` if interrupted. No active blocker remained.

Open risks:
None for this packet. Production static renderer files still contain older internal casts outside this named spec cleanup; they need a separate source cleanup packet, not a hidden test-cast fix.
