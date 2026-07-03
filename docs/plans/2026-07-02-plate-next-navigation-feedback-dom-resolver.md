# plate-next navigation-feedback dom resolver

Objective:
Remove the local DOM resolver/type-guard smell from navigation feedback, keep DOM resolution owned by Plite DOM typing, and repair the Plate Next rule so the pattern is not repeated.

Goal plan:
docs/plans/2026-07-02-plate-next-navigation-feedback-dom-resolver.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: User pointed at `DOMResolver` / `hasDOMResolver` in `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` and invoked `plate-next`.
- mode: named Core file/API review packet.
- target surface: navigation feedback DOM resolution and adjacent refresh boundary.
- review target: best Plate v2 migration on top of Plite, not legacy compatibility.
- broad Core sweep: no; target was one named file plus related smell sweep.
- correction-triggered related Core sweep: yes; DOM resolver structural guards and direct base-Core React refresh calls.
- completion threshold summary: no local structural DOM resolver guard remains; base transform uses typed Plite DOM API; React refresh is owned by React navigation plugin; focused tests, Core typecheck, Core lint, skill mirror audit, and plan check pass.

First checkpoint:
- Explicit requirement captured: fix the dirty `DOMResolver` / `hasDOMResolver` pattern in `flashTarget.ts`.
- Explicit requirement captured: use and repair `plate-next`.
- Scope boundary: Core navigation feedback packet, not a broad Core sweep.
- Stop condition: stop when the named file is clean, related same-class smell sweep is clean/deferred, proof is green, and the plan passes.
- Final handoff: changed list, proof commands, sweep result, and remaining review items.

Timed checkpoint:
- requested duration: none.
- semantics: not timed.
- initial confidence score: 72; the DOM helper was gone during inspection, but proof exposed a base-Core React refresh dependency.
- improvement loop: repaired both the DOM resolver smell and the adjacent refresh ownership smell.
- final score / loop closure: 96; focused proof is green and remaining direct React refresh call is isolated to the React plugin owner.

Completion threshold:
- Named file/API packet is complete when `flashTarget.ts` has no local DOM resolver type guard, no base-Core direct `editor.api.react.refreshDecorations()` dependency, the React refresh owner is explicit, same-class source audits are clean, `.agents/rules/plate-next.mdc` and generated `.agents/skills/plate-next/SKILL.md` contain the new guardrail, and focused Core proof passes.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx`.
- package proof: `pnpm turbo typecheck --filter=./packages/core`; `pnpm --filter @platejs/core lint`.
- source audits: `rg -n "type DOMResolver|hasDOMResolver|resolveDOMNode.*unknown|as \\{[^\\n]*resolveDOMNode|type .*Resolver.*resolveDOMNode|resolveDOMNode\\?:|dom\\??\\.resolveDOMNode\\?" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'`; `rg -n "editor\\.api\\.react\\.refreshDecorations\\(\\)" packages/core/src/lib packages/core/src/internal packages/core/type-tests --glob '*.{ts,tsx}'`.
- related Core sweep query / match count / patched count / deferred count: DOM resolver query had zero remaining matches; base-Core React refresh query had zero remaining matches; React-owner query leaves one accepted React plugin match.
- Plite/Plate gap ledger: no Plite gap. Plate gap found and fixed: navigation feedback needed a semantic refresh hook rather than direct base-Core React API use.
- broad Core drift ledger gate: not applicable; user gave one named file, not `sweep` / `all core` / `full-loop`.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-navigation-feedback-dom-resolver.md`.

Constraints:
- Plate owns navigation feedback product behavior.
- Plite DOM owns DOM node resolution; Core must call `editor.api.dom.resolveDOMNode` directly.
- Base Core plugins must not depend directly on React runtime APIs.
- No local structural guards, bridge dumps, broad `any`, fake aliases, or helper wrappers.
- Skill repair goes through `.agents/rules/plate-next.mdc`; generated `SKILL.md` is synced with Skiller.
- No broad Core sweep was requested; related-surface sweep is required and sufficient.

Boundaries:
- allowed edit scope: `packages/core/src/lib/plugins/navigation-feedback/**`, `packages/core/src/react/plugins/navigation-feedback/**`, `.agents/rules/plate-next.mdc`, generated `.agents/skills/plate-next/SKILL.md`, and this plan.
- package/API surfaces: Core navigation feedback API gained `navigation.refresh()` as an internal semantic renderer-refresh hook; base implementation is no-op, React implementation calls Plite React refresh.
- docs/browser surfaces: none.
- non-goals: no full Core drift ledger, no rename pass, no package sweep, no docs pass.
- out-of-scope package errors: none observed.

Output budget strategy:
- Use targeted `sed`/`rg` reads and focused proof only.
- Do not stream broad Core manifests because this is a named-file packet.

Blocked condition:
- Blocked only if Core typecheck failed from a Plite/Plate API typing gap that could not be repaired inside this packet. It did not block.

Current verdict:
- verdict: main-parity-cleanup plus skill self-repair.
- confidence: 96.
- next owner: plate-next.
- keep / revert / quarantine call: keep.
- reason: the runtime path is cleaner than the dirty helper, and proof is green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Requirement copied into First checkpoint: fix `DOMResolver` / `hasDOMResolver`; repair `plate-next`. |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md`; patched `.agents/rules/plate-next.mdc`. |
| Active goal checked or created | yes | Active goal created for the navigation feedback DOM resolver repair. |
| Mode classified as named packet vs broad Core sweep | yes | Classified as named Core file/API packet; broad sweep not requested. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plite DOM owns resolution; Plate navigation owns feedback refresh; no compat shim. |
| Broad Core drift ledger initialized when in scope | no | Not in scope because user named one file and smell; related sweep used instead. |
| Source of truth and allowed workspace recorded | yes | Source rule is `.agents/rules/plate-next.mdc`; workspace is `/Users/zbeyens/git/plate-2`. |
| Output budget strategy recorded | yes | Targeted reads and focused proof recorded above. |
| Public API fork routing checked | yes | No public design fork needed; `navigation.refresh()` is a semantic plugin hook under existing navigation API. |
| Gap policy checked | yes | No Plite gap; Plate refresh owner gap fixed in React navigation plugin. |
| Related Core sweep policy checked | yes | DOM resolver and base React refresh searches recorded. |
| Review-mode rename freeze checked | yes | No files or public concepts renamed. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan before closeout.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded: cut local DOM structural guard, keep Plite DOM as owner, keep React refresh in React navigation owner.
- [x] Legacy/backcompat decision recorded: no compat alias or old Slate fallback kept.
- [x] Hack check recorded: no local `DOMResolver`, `hasDOMResolver`, `unknown` resolver guard, or base-Core React dependency remains.
- [x] Gap ledger updated: no Plite gap; Plate refresh owner gap fixed.
- [x] Related Core sweep row added with query, match count, patched count, deferred count, and remaining risk.
- [x] Broad Core sweep marked not applicable.
- [x] Bridge scoring law checked: no bridge introduced.
- [x] Review matrix filled for inspected files/APIs.
- [x] Public API forks checked and not needed.
- [x] Review-mode rename freeze applied.
- [x] Extracted-file recovery gate marked not applicable because no extracted files were introduced.
- [x] Safe cleanup packet kept with proof.
- [x] Focused package proof run after code changes.
- [x] `pnpm brl` marked not applicable because exports/barrels did not change.
- [x] Old compatibility names source-audited.
- [x] Changed list, top drift rows, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused navigation feedback specs | `10 pass, 0 fail` for lib and React navigation feedback specs. |
| Broad Core drift ledger coverage | no | Record not applicable | Named-file packet only; related sweep performed. |
| Score gate | yes | Score named files and own high drift | `flashTarget.ts` and React navigation owner score 96 after proof. |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Plite DOM direct call; navigation semantic refresh hook; reject DOM guard and base React API call. |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No Plite gap; Plate refresh owner gap fixed. |
| Related Core sweep after correction | yes | Run same-class Core searches | DOM resolver query clean; base-Core React refresh query clean. |
| Package/API proof | yes | Run Core typecheck and focused tests | Core typecheck passed; focused specs passed. |
| Non-Core package error triage | yes | Classify any non-Core failures | No non-Core failures observed. |
| Source audit | yes | Run exact audit for removed compatibility names | DOM resolver and base React refresh audits clean. |
| Rename ledger | no | Record no rename | No rename proposed or applied. |
| Extracted-file inventory | no | Record no extracted files in scope | No new extracted Core files introduced. |
| Autoreview / review | no | Focused proof sufficient for tiny packet | No separate autoreview run. |
| Final lint/check | yes | Run scoped lint/check | `pnpm --filter @platejs/core lint` passed. |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | See below. |
| Goal plan complete | yes | Run plan checker | Check recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Inspect | complete | Compared current `flashTarget.ts` with `origin/main`; found current DOM call direct but adjacent React refresh drift. |
| Patch | complete | Removed null/undefined normalization, routed refresh through navigation API, patched Plate Next rule. |
| Sweep | complete | DOM resolver and base React refresh audits clean. |
| Proof | complete | Focused specs, Core typecheck, Core lint passed. |
| Closeout | complete | Plan filled and checked. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` | 1 | main-parity-cleanup | Plate navigation feedback | Calls `editor.api.dom.resolveDOMNode` directly; calls `editor.api.navigation.refresh()` instead of React. | keep |
| `packages/core/src/lib/plugins/navigation-feedback/types.ts` | 1 | keep-in-plate | Plate navigation API | Adds semantic `refresh()` hook under navigation. | keep |
| `packages/core/src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` | 1 | keep-in-plate | Plate navigation API | Base implementation no-ops, so base editor remains valid. | keep |
| `packages/core/src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.ts` | 1 | keep-in-plate | React navigation owner | React variant overrides `navigation.refresh()` with `editor.api.react.refreshDecorations()`. | keep |
| `.agents/rules/plate-next.mdc` | 0 | skill-repair | Plate Next source rule | Adds explicit ban on local structural guards around Plite editor APIs. | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| DOM node resolution in navigation feedback | Direct `editor.api.dom.resolveDOMNode(node)` | Local `DOMResolver`, `hasDOMResolver`, `unknown` guard, `toDOMNode` fallback | Plite DOM owns the typed DOM bridge. | none |
| Decoration refresh after active target changes | `editor.api.navigation.refresh()` with base no-op and React override | Direct base-Core `editor.api.react.refreshDecorations()`; optional React probing in base transform | Navigation owns the product event; React owner owns decoration refresh implementation. | low; API is semantic but public under navigation |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | Plite DOM API already exists | none | source audit and typecheck | closed |
| Plate gap | renderer refresh ownership for navigation feedback | Base plugin calling React API breaks base editors | React navigation plugin | focused lib and React specs | fixed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove DOM resolver structural guard | `rg -n "type DOMResolver|hasDOMResolver|resolveDOMNode.*unknown|as \\{[^\\n]*resolveDOMNode|type .*Resolver.*resolveDOMNode|resolveDOMNode\\?:|dom\\??\\.resolveDOMNode\\?" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` | 0 after patch | 1 current file cleaned | 0 | none |
| Remove base-Core React refresh dependency | `rg -n "editor\\.api\\.react\\.refreshDecorations\\(\\)" packages/core/src/lib packages/core/src/internal packages/core/type-tests --glob '*.{ts,tsx}'` | 0 after patch | 1 current file cleaned | 0 | direct call remains only in React owner, accepted |
| Skill self-repair mirror audit | `rg -n "local structural type guards|DOMResolver|hasDOMResolver|resolveDOMNode" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md` | 2 files | 1 source rule, 1 generated mirror | 0 | none |

Core drift ledger:
- Applies: no.
- Manifest command: not run.
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`.
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`.
- Ledger location: not applicable for named packet.
- Expected row count: not applicable.
- Actual row count: not applicable.
- Missing row count: not applicable.
- Extra row count: not applicable.
- Score gate: named packet only; no score `>=2` remains in inspected targets.
- Top drift rows: none in scope.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` | 1 | main-parity-cleanup | Plate navigation feedback | No DOM guard; no base React refresh dependency. | keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| navigation feedback DOM/refresh cleanup | plate-next | local DOM resolver guard and base React refresh call were migration sludge | Core navigation feedback files, Plate Next rule, focused tests/typecheck/lint | keep | continue one-by-one Core review |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | not applicable | no extracted files introduced | closed | source patch only |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | no non-Core failures observed | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `flashTarget.ts`, navigation feedback plugin/types, React navigation plugin. |
| tests/proof | no test files changed; existing focused specs cover behavior. |
| docs/templates/skills | `.agents/rules/plate-next.mdc`, generated `.agents/skills/plate-next/SKILL.md`, this plan. |
| reverted/quarantined packets | none. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `navigation.refresh()` is now an API method | It is semantic and clean, but still public on `editor.api.navigation`. | `packages/core/src/lib/plugins/navigation-feedback/types.ts` | Keep unless you want hidden plugin lifecycle instead. |

Findings:
- The pasted `DOMResolver` helper is not present after the repair; the file uses typed Plite DOM resolution directly.
- Focused proof exposed an adjacent owner bug: base navigation feedback assumed React decoration refresh exists.

Decisions and tradeoffs:
- Kept DOM resolution in Plite DOM.
- Kept navigation feedback in Plate Core.
- Moved decoration refresh implementation to the React navigation owner through a semantic navigation hook.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Focused tests failed because base editor lacked `editor.api.react.refreshDecorations()` | 1 | Move refresh ownership out of base transform | Fixed with `navigation.refresh()` base no-op plus React override |

Verification evidence:
- `pnpm prepare` passed and regenerated `.agents/skills/plate-next/SKILL.md`.
- `rg -n "local structural type guards|DOMResolver|hasDOMResolver|resolveDOMNode" .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md` found the new guardrail in both source and generated mirror.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx` passed: 10 tests, 31 assertions.
- `pnpm turbo typecheck --filter=./packages/core` passed.
- `pnpm --filter @platejs/core lint` passed.
- DOM resolver source audit returned no matches.
- Base-Core React refresh source audit returned no matches.

Final handoff contract:
- target surface and mode: named Core navigation feedback file/API packet.
- files/APIs reviewed: `flashTarget.ts`, navigation feedback API/types, React navigation feedback plugin, Plate Next skill rule.
- broad Core drift score coverage: not applicable.
- best Plate v2 recommendation: typed Plite DOM direct call; semantic Plate navigation refresh; React implementation in React owner.
- verdict matrix summary: all inspected rows keep/main-parity cleanup; no Plite blocker.
- Plite/Plate gaps or blockers: none open.
- related Core sweep query/matches/patched/deferred: recorded above.
- changes made: recorded above.
- tests/proof commands: recorded above.
- old compatibility names audited: DOM resolver helper and base React refresh audited.
- needs attention: only whether public `navigation.refresh()` is acceptable taste.
- next best Plate Next packet: continue reviewing Core files that still expose helper/cast smells.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after focused Plate Next packet. |
| Where am I going? | Ready to hand off or continue the next Core review item. |
| What is the goal? | Keep navigation feedback cleanly layered over Plite DOM and React owners. |
| What have I learned? | DOM resolver helper was avoidable; base Core also had a React refresh dependency. |
| What have I done? | Cleaned the file, repaired owner boundary, patched the skill, and ran proof. |

Timeline:
- 2026-07-02 Goal plan created.
- 2026-07-02 Inspected `flashTarget.ts`, `origin/main`, DOM API ownership, and navigation specs.
- 2026-07-02 Patched runtime/API and Plate Next rule.
- 2026-07-02 Ran focused tests, Core typecheck, Core lint, source audits, and mirror audit.

Open risks:
- Low: `editor.api.navigation.refresh()` is a visible API method. It is cleaner than a base React dependency, but it is worth taste-review if you want this kept internal later.
