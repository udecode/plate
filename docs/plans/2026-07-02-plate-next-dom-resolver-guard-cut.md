# plate-next dom resolver guard cut

Objective:
Cut local `DOMResolver` / `hasDOMResolver` guards; done when source audit finds no matches and focused Core proof passes.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-02-plate-next-dom-resolver-guard-cut.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Completion threshold:
- `DOMResolver`, `hasDOMResolver`, and same-class local DOM resolver guard aliases are absent from Core.
- Navigation feedback keeps using the typed Plite DOM API directly.
- Focused NavigationFeedback test and Core typecheck pass.

Verification surface:
- source audit over `packages/core/src` and `packages/core/type-tests`
- focused Core navigation-feedback test
- Core package typecheck

Constraints:
- No local structural type guards around `editor.api.dom.resolveDOMNode`.
- No Plate wrapper around Plite DOM API.
- No rename churn.
- No broad Core sweep; this is a named guard-cut packet.

Boundaries:
- Allowed files: `packages/core/src/lib/plugins/navigation-feedback/**`, this plan.
- No docs/browser changes.
- No package sweep outside Core.

Output budget strategy:
- Use exact `rg` patterns and focused proof output only.

Blocked condition:
- Blocked only if `BaseEditor['api']['dom'].resolveDOMNode` is not typed strongly enough to call directly. Evidence showed it is already called directly.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User requested removal of the shown `DOMResolver` / `hasDOMResolver` local guard. |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read. |
| Active goal checked or created | yes | Created active goal for this audit packet. |
| Mode classified as named packet vs broad Core sweep | yes | Named guard-cut packet. |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Use typed Plite DOM API directly. |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep. |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; Core navigation feedback owner. |
| Output budget strategy recorded | yes | Exact `rg` and focused commands. |
| Public API fork routing checked | yes | No API fork needed. |
| Gap policy checked | yes | No Plite/Plate gap. |
| Related Core sweep policy checked | yes | Exact same-class guard audit run. |
| Review-mode rename freeze checked | yes | No renames. |

Work Checklist:
- [x] First checkpoint complete: user requirement, scope, stop condition, and proof captured.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded: hard-cut local guard; call typed Plite DOM API directly.
- [x] Legacy/backcompat decision recorded: no local compat guard kept.
- [x] Hack check recorded: source audit found no `DOMResolver` / `hasDOMResolver` helpers left.
- [x] Gap ledger updated: no blocker.
- [x] Related Core sweep row added.
- [x] Broad Core sweep rows N/A: not requested.
- [x] Bridge scoring law N/A: no bridge involved.
- [x] Review matrix filled.
- [x] Public API forks N/A.
- [x] Rename freeze applied.
- [x] Extracted-file recovery N/A: no new files.
- [x] Safe packet kept: audit confirms the requested cut is already true.
- [x] Focused package proof run.
- [x] `pnpm brl` N/A: no exports changed.
- [x] Old compatibility names source-audited.
- [x] Changed list and needs-attention rows filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove guard absent and focused Core proof green. | Source audit no matches; NavigationFeedback spec 8 pass; Core typecheck 9 successful tasks. |
| Broad Core drift ledger coverage | no | N/A | Named packet only. |
| Score gate | yes | Review inspected rows. | All inspected rows score clean. |
| Best Plate v2 recommendation | yes | Record recommendation. | Direct typed Plite DOM API call. |
| Plite/Plate gap ledger | yes | Record blocker or N/A. | No gap. |
| Related Core sweep after correction | yes | Audit same-class local guards. | `rg -n "DOMResolver|hasDOMResolver|type ExistingDomApi|hasDOMResolver\\(" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` -> no matches. |
| Package/API proof | yes | Run focused test/typecheck. | Commands passed. |
| Non-Core package error triage | no | N/A | No non-Core command run. |
| Source audit | yes | Exact audit for removed names. | No matches. |
| Rename ledger | no | N/A | No rename. |
| Extracted-file inventory | no | N/A | No new files. |
| Autoreview / review | no | N/A | Narrow audit packet, no code changed. |
| Final lint/check | yes | Focused proof. | Test and typecheck passed. |
| Changed list / top drift / needs attention | yes | Fill ledgers. | Filled. |
| Goal plan complete | yes | Run check-complete. | To run. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Locate guard | complete | `rg` found no `DOMResolver` / `hasDOMResolver` matches; `flashTarget.ts` already calls `editor.api.dom.resolveDOMNode(node)` directly. | none |
| Focused proof | complete | NavigationFeedback spec and Core typecheck passed. | close goal |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` | 0 | main-parity-cleanup | Core navigation feedback | Direct typed `editor.api.dom.resolveDOMNode(node)` call at line 49. | keep |
| `DOMResolver` / `hasDOMResolver` | 0 | hard-cut | none | Exact source audit found no matches. | none |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| DOM node resolver access | Use `editor.api.dom.resolveDOMNode(node)` directly. | Local `DOMResolver` type, `hasDOMResolver` guard, optional fallback wrappers. | DOM API is typed by Plite/Plate owner; local guards hide type drift. | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | no workaround needed | N/A | source audit and focused Core proof | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove local DOM resolver guard | `rg -n "DOMResolver|hasDOMResolver|type ExistingDomApi|hasDOMResolver\\(" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` | 0 | 0 | 0 | none |

Core drift ledger:
- Applies: no, named packet only.
- Manifest command: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/navigation-feedback/transforms/flashTarget.ts` | 0 | clean | Core navigation feedback | Direct typed DOM API call. | none |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| DOM resolver guard cut | Core navigation feedback | Local structural DOM resolver guards are sludge. | Source audit, NavigationFeedback spec, Core typecheck. | keep current clean state | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | N/A | N/A | no new files | source audit only |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | none; requested guard was already absent in current source |
| tests/proof | focused proof commands run |
| docs/templates/skills | this plan only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| N/A | none | no unresolved taste call | N/A | N/A |

Findings:
- The bad `DOMResolver` / `hasDOMResolver` local guard is already gone.
- `flashTarget.ts` already uses the correct typed API: `editor.api.dom.resolveDOMNode(node)`.

Decisions and tradeoffs:
- Do not add another helper.
- Do not patch Plite; no gap was found.

Review fixes:
- N/A: no code change required.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| none | 0 | N/A | N/A |

Verification evidence:
- `rg -n "DOMResolver|hasDOMResolver|type ExistingDomApi|hasDOMResolver\\(" packages/core/src packages/core/type-tests --glob '*.{ts,tsx}'` -> no matches.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.ts` -> 8 pass, 0 fail.
- `pnpm turbo typecheck --filter=./packages/core` -> 9 successful tasks.

Final handoff contract:
- target surface and mode: named Core guard-cut audit.
- files/APIs reviewed: `flashTarget.ts`, Core same-class DOM resolver guard audit.
- broad Core drift score coverage: N/A.
- best Plate v2 recommendation: direct typed DOM API call.
- verdict matrix summary: hard-cut guard already true.
- Plite/Plate gaps or blockers: none.
- related Core sweep query/matches/patched/deferred: 0/0/0.
- changes made: plan only.
- tests/proof commands: recorded above.
- old compatibility names audited: yes.
- needs attention: none.
- next best Plate Next packet: continue package sweep only if user asks.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Guard-cut audit complete. |
| Where am I going? | Run goal-plan checker, then close goal. |
| What is the goal? | Prove `DOMResolver` / `hasDOMResolver` are gone and Core proof passes. |
| What have I learned? | Current source already has the desired direct Plite DOM API call. |
| What have I done? | Audited source, ran focused proof, updated plan. |

Timeline:
- 2026-07-02T12:16:41Z Goal created.
- 2026-07-02T12:17:00Z Source audit and focused proof passed.

Open risks:
- none
