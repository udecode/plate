# Navigation Feedback Flash Target DOM API

Objective:
Remove the local DOM API casts from `flashTarget` and make Core use typed DOM/redecorate APIs.

Prompt requirements:
- Target: `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts`.
- Complaint: local `editor.api as { dom?: ...; toDOMNode?: ... }` cast is migration sludge.
- Skill: `plate-next`.
- Mode: named Core review packet, not broad Core sweep.
- Stop condition: local casts/fallbacks removed, typed owner repaired, focused Core proof green, source audit clean.

Completion threshold:
Done when `flashTarget` calls typed `editor.api.dom.resolveDOMNode` and `editor.api.redecorate`, `DOMPlugin` owns the typed DOM-node API surface, focused navigation/DOM tests pass, React navigation proof passes, Core typecheck/lint pass, and source audit finds no removed DOM/redecorate cast pattern in the touched owner.

Verification surface:
Core navigation-feedback tests, Core DOM plugin tests, React navigation-feedback test, EditorMethodsEffect redecorate test, Core typecheck, Core lint, and exact source audit.

Constraints:
Do not keep legacy `toDOMNode`. Do not use local `editor.api as ...` casts for DOM or `redecorate`. Do not move product behavior into a bridge. Preserve the existing navigation-feedback owner/name.

Boundaries:
Allowed edits are `DOMPlugin`, `flashTarget`, focused navigation-feedback tests, and this plan. Plite DOM internals, public docs, browser route proof, and broad Core sweep are out of scope.

Blocked condition:
No blocker remained. A blocker would be a missing Plite DOM API or a public API fork needing `plate-plan`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | Target and complaint copied above. |
| Skill read | yes | `plate-next` read before edits. |
| Mode classified | yes | Named Core review packet, not broad sweep. |
| Main as evidence | yes | `origin/main` used one old `editor.api.toDOMNode(node)` call; kept behavior but not compatibility alias. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Source map | done | Read `flashTarget`, `DOMPlugin`, `SlateExtensionPlugin`, React DOM bridge, and main file. |
| Patch | done | DOM node resolution promoted to typed `DOMPlugin` API; navigation feedback uses typed calls. |
| Sweep | done | Same-class audit found no remaining DOM/redecorate cast in target owner. |
| Proof | done | Focused tests, typecheck, lint, and source audit passed. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `flashTarget` DOM resolution cast | 4 | hard-cut | Navigation feedback + DOMPlugin | It guessed `dom.resolveDOMNode`, `dom.assertDOMNode`, and legacy `toDOMNode` locally. | Removed; use `editor.api.dom.resolveDOMNode(node)`. |
| `flashTarget` `redecorate` cast | 3 | hard-cut | SlateExtensionPlugin API | `CorePluginApi` already includes typed `redecorate`. | Removed; call `editor.api.redecorate()`. |
| `DOMPlugin` DOM-node API type | 3 | main-parity-cleanup | DOMPlugin | Core DOM API lacked typed node resolution, forcing callers to cast. | Added typed `resolveDOMNode`/`assertDOMNode` composition with base-editor fallback. |
| `NavigationFeedbackPlugin.spec.ts` | 1 | keep | Navigation feedback proof | Proves `flashTarget` marks a DOM element through typed `dom.resolveDOMNode`. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|----------------------|--------|------------------|
| `flashTarget` DOM lookup | `editor.api.dom.resolveDOMNode(node)` | local cast, optional DOM shape, old `toDOMNode`, try/catch compatibility fallback | DOM resolution is DOMPlugin/Plite DOM capability, not navigation-feedback-owned guessing. | None. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | N/A | N/A | N/A | N/A | Existing Plite DOM API was enough. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed DOM/redecorate casts in navigation feedback | `rg -n "domApi|toDOMNode|resolveDOMNode\\?:|assertDOMNode\\?:|redecorate\\?: unknown|editor\\.api as \\{[^\\n]*(dom|redecorate)" packages/core/src/lib/plugins/navigation-feedback packages/core/src/lib/plugins/dom packages/core/src --glob '!**/dist/**'` | 0 | 0 | 0 | None. Unrelated keyboard cast remains outside this packet. |

Extracted-file inventory:
| Scope | Command | Result | Decision |
|-------|---------|--------|----------|
| Named packet scope | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/navigation-feedback packages/core/src/lib/plugins/dom docs/plans/2026-06-30-navigation-feedback-flash-target-dom-api.md` | No extracted source files; plan file is expected. | N/A. |

Verification evidence:
Fresh final evidence.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts src/lib/plugins/dom/DOMPlugin.spec.ts` passed, 11 tests.
- `pnpm --filter @platejs/core exec bun test src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx src/react/components/EditorMethodsEffect.spec.tsx` passed, 3 tests.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint:fix` passed.
- Source audit above passed with zero matches.

Reboot status:
Current. If resumed, rerun the verification evidence commands before expanding scope.

Open risks:
None for this packet. The unrelated keyboard API cast in `SlateReactExtensionPlugin` remains a separate Plate Next target.

Changed files:
- `packages/core/src/lib/plugins/dom/DOMPlugin.ts`
- `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts`
- `packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts`
- `docs/plans/2026-06-30-navigation-feedback-flash-target-dom-api.md`

Keep / revert / quarantine:
- Keep.
- Reason: removes local API guessing and puts the DOM node API in the typed DOM owner with focused proof.

Work Checklist:
- [x] Prompt requirements captured.
- [x] `plate-next` skill read.
- [x] VISION, Plate vision, and Common vision read.
- [x] Mode classified as named Core packet.
- [x] Main behavior checked as evidence.
- [x] Legacy `toDOMNode` fallback rejected.
- [x] DOM/redecorate casts removed from `flashTarget`.
- [x] DOMPlugin typed owner repaired.
- [x] Focused navigation/DOM tests passed.
- [x] React navigation/redecorate tests passed.
- [x] Core typecheck passed.
- [x] Core lint passed.
- [x] Source audit passed.
- [x] Changed list recorded.
