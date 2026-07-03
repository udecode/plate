# plate-next node-id plugin drift

Objective:
Review `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` for Plate Next drift and decide whether the helper scaffolding belongs in Plite, Plate, or the trash.

Goal plan:
docs/plans/2026-07-01-plate-next-node-id-plugin-drift.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- plate-next named-file review

Plate Next source:
- prompt / link: user asked whether the new `InlineFlagElement`, `NodeIdBatchUpdate`, `now`, `defaultNodeIdFilter`, and loose element-like predicate in `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` should move to Plite or be cut.
- mode: named file/API review, not broad Core sweep.
- target surface: `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` and matching NodeId specs.
- review target: best Plate v2 migration on top of Plite, not legacy compatibility.
- broad Core sweep: no; related correction sweep only.
- correction-triggered related Core sweep: yes.
- completion threshold summary: NodeId runtime behavior lives in the NodeId owner, fake helper/type scaffolding is cut, Plite boundary is named, focused proof and `check:core` pass, and the removed-name audit has no matches.

First checkpoint:
- Explicit target: review NodeIdPlugin helper drift and decide if helpers move to Plite.
- Explicit examples: `InlineFlagElement`, `NodeIdBatchUpdate`, `now`, `defaultNodeIdFilter`, `isNodeIdElementLike`.
- Scope boundary: Core NodeId plugin and related NodeId proof.
- Non-goal: broad Core sweep, package sweep, naming cleanup, or public API redesign.
- Stop condition: close after best Plate v2 verdict, safe cleanup, related sweep, focused tests, `check:core`, and autogoal check.
- Final handoff: verdict, files changed, proof, Plite/Plate gap, related sweep, and next attention item.

Timed checkpoint:
- requested duration: none.
- semantics: scoped packet closure.
- initial confidence score: 65, because the helper drift was real and the loose predicate looked like a possible Plite leak.
- improvement loop: inspect main owner, inspect Plite predicates, cut scaffolding, add targeted NodeId operation proof, run focused and Core gates.
- final score / loop closure: 100 for this named packet.

Completion threshold:
- The reviewed helpers have a verdict: `move-to-plite`, `keep-in-plate`, `main-parity-cleanup`, or `hard-cut`.
- No fake alias, top-level one-use helper, broad custom type, or old `withNodeId` surface remains.
- Inserted-node id reuse and text-leaf skip behavior are covered by NodeId tests.
- `pnpm check:core` passes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-node-id-plugin-drift.md` passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  - `pnpm --filter @platejs/core exec bun test src/lib/plugins/node-id/NodeIdPlugin.spec.tsx`
- package proof:
  - `pnpm --filter @platejs/core typecheck`
  - `pnpm --filter @platejs/core lint`
  - `pnpm check:core`
- source audits:
  - `rg -n "BaseNodeIdPlugin|InlineFlagElement|NodeIdBatchUpdate|setNodeIdBatch|const now =|isNodeIdElementLike|normalizeInitialValue|createTSlatePlugin|overrideEditor|withNodeId|editor\\.tf|editor\\.children|editor\\.api\\.isBlock|editor\\.api\\.some" packages/core/src/lib/plugins/node-id packages/core/src -g '*.ts' -g '*.tsx'`
- related Core sweep query / match count / patched count / deferred count: audit above, 0 matches, 0 remaining, 0 deferred.
- Plite/Plate gap ledger: no blocking gap.
- broad Core drift ledger gate: N/A, scoped file review.
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-01-plate-next-node-id-plugin-drift.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of inventing a compatibility workaround.
- After every correction, run a related Core sweep across `packages/core/src` and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
- Review-mode rename freeze: no rename pass in this packet.
- Extracted-file recovery gate: inventory untracked files in NodeId scope before scoring.
- Private bridges require owner, deletion gate, and proof.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- For Core-only targets, ignore non-Core package errors unless the package is named, touched, or the failure proves a Core public API regression.

Boundaries:
- allowed edit scope: `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts`, `packages/core/src/lib/plugins/node-id/NodeIdPlugin.spec.tsx`, and this plan.
- package/API surfaces: Core NodeId plugin only.
- docs/browser surfaces: none.
- non-goals: no Plite API rename, no broad Core packet, no package migration.
- out-of-scope package errors: none observed.

Output budget strategy:
- Use targeted `sed`/`rg` reads and command tails.

Blocked condition:
- If Plite lacked a strict way to distinguish Text from operation-property objects, stop and route to `plite-plan`. It did not block this packet.

Current verdict:
- verdict: main-parity-cleanup plus hard-cut scaffolding.
- confidence: 100 for NodeIdPlugin scoped drift.
- next owner: plate-next.
- keep / revert / quarantine call: keep.
- reason: behavior is in the NodeId owner, loose operation-property handling is local policy, and proof is green.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint copied target, examples, scope, stop condition, and proof |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | This autogoal plan tracks the packet |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API review |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source and constraints |
| Broad Core drift ledger initialized when in scope | N/A | Not a broad Core sweep |
| Source of truth and allowed workspace recorded | yes | Boundaries section |
| Output budget strategy recorded | yes | Output budget strategy section |
| Public API fork routing checked | yes | No public API fork |
| Gap policy checked | yes | No blocking Plite/Plate gap |
| Related Core sweep policy checked | yes | Audit command recorded |
| Review-mode rename freeze checked | yes | No rename pass |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan before closeout.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for every reviewed target.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim, duplicate Plate wrapper around Plite, old command fallback, or old docs path is kept.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated: no blocking Plite/Plate gap.
- [x] After every correction, related Core sweep row is added with query, match count, patched count, deferred count, and remaining risk.
- [x] Broad Core sweep gate marked N/A because this is a named file review.
- [x] Bridge scoring law applied: NodeId behavior stays in NodeIdPlugin, not in a forbidden bridge.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation; none existed here.
- [x] Review-mode rename freeze applied.
- [x] Extracted-file recovery gate closed: no untracked NodeId files.
- [x] Safe cleanup packet kept with proof.
- [x] Focused package proof run after code changes.
- [x] `pnpm brl` not needed; no exports/barrels changed.
- [x] Old compatibility names source-audited.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused NodeId proof | `pnpm --filter @platejs/core exec bun test src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` passed, 21 tests |
| Broad Core drift ledger coverage | no | Mark N/A | Named file/API packet |
| Score gate | yes | Prove scoped drift fixed or owned | All reviewed helpers have verdicts |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Best Plate v2 recommendation table |
| Plite/Plate gap ledger | yes | Record blocker or N/A | No blocking gap |
| Related Core sweep after correction | yes | Run same-class Core search/review | Removed-name audit had 0 matches |
| Package/API proof | yes | Run focused typecheck/test/lint and Core gate | Commands listed in proof |
| Non-Core package error triage | yes | Classify if any appear | None observed |
| Source audit | yes | Run exact audit for removed helper names | 0 matches |
| Rename ledger | no | No rename pass | N/A |
| Extracted-file inventory | yes | Record untracked file command and row count | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/node-id | sort` returned 0 rows |
| Autoreview / review | no | Scoped Plate Next review packet | N/A |
| Final lint/check | yes | Run scoped lint/check | Core lint and `pnpm check:core` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Final sections below |
| Goal plan complete | yes | Run autogoal `check-complete` | recorded after final command |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `NodeIdPlugin.ts` / `InlineFlagElement` | 2 -> 0 | hard-cut | NodeIdPlugin | One-use cast wrapper, not a durable concept | Removed; inline narrow cast at the call site |
| `NodeIdPlugin.ts` / `NodeIdBatchUpdate` and `setNodeIdBatch` | 2 -> 0 | hard-cut | NodeIdPlugin | One-use helper/type only existed for local normalize batching | Removed; local `updates` and `applyUpdates` live inside `tx.normalize` |
| `NodeIdPlugin.ts` / `now` | 1 -> 0 | hard-cut | NodeIdPlugin | Wrapper added no owner or testability | Removed; inline timing expression |
| `NodeIdPlugin.ts` / `defaultNodeIdFilter` | 0 | keep-in-plate | NodeIdPlugin | Existing option default and fast-path identity check | Kept |
| `NodeIdPlugin.ts` / loose element-like predicate | 3 -> 0 | main-parity-cleanup | NodeIdPlugin | Split operation `properties` are not Plite elements, but NodeId must decide whether id policy applies | Kept local as `hasElementType`; do not move to Plite |
| `NodeIdPlugin.ts` / `BaseNodeIdPlugin` alias | 2 -> 0 | hard-cut | NodeIdPlugin | Fake alias after migration | Removed; export plugin directly |
| `NodeIdPlugin.spec.tsx` / insert behavior | 2 -> 0 | main-parity-cleanup | NodeIdPlugin tests | Insert-id normalization was the risky runtime behavior previously owned by `withNodeId` | Added focused regression rows |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| NodeId insert/split id policy | Keep operation normalization in `NodeIdPlugin` via Plite extension hooks | Do not move loose property-object predicates into Plite; do not recreate `withNodeId`; do not dump into a runtime bridge | NodeId is Plate product/plugin policy; Plite element checks must stay strict | Low |
| Normalization batching | Keep batching local inside `tx.normalize` | No exported local helper/type for one call path | Smaller and closer to main ownership | Low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | No missing Plite primitive blocks this packet | N/A | N/A | N/A | Close |
| defer-with-owner | If operation-property predicates repeat across plugins, Plite may need a deliberate operation-props helper | A loose `ElementApi.isElement` variant would weaken Plite correctness | plite-plan | Repeated call sites outside NodeId | Defer until repeated evidence exists |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed NodeId scaffolding and old API names | `rg -n "BaseNodeIdPlugin|InlineFlagElement|NodeIdBatchUpdate|setNodeIdBatch|const now =|isNodeIdElementLike|normalizeInitialValue|createTSlatePlugin|overrideEditor|withNodeId|editor\\.tf|editor\\.children|editor\\.api\\.isBlock|editor\\.api\\.some" packages/core/src/lib/plugins/node-id packages/core/src -g '*.ts' -g '*.tsx'` | 0 | 0 | 0 | none |
| Extracted NodeId file inventory | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/node-id | sort` | 0 | 0 | 0 | none |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| NodeIdPlugin named-file drift review | complete | Helper verdicts recorded, scoped cleanup applied, focused NodeId tests passed, Core gate passed |

Core drift ledger:
- Applies: no.
- Manifest command: N/A.
- Manifest owner: N/A.
- Optional type-test owner: N/A.
- Ledger location: N/A.
- Expected row count: N/A.
- Actual row count: N/A.
- Missing row count: N/A.
- Extra row count: N/A.
- Score gate: N/A.
- Top drift rows: N/A.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts` | 0 | main-parity-cleanup plus hard-cut scaffolding | NodeIdPlugin | Focused tests, Core typecheck, Core lint, `check:core`, audit 0 matches | keep |
| `packages/core/src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` | 0 | main-parity proof | NodeIdPlugin tests | New tests cover inserted ids and text-leaf skip behavior | keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| NodeId helper drift cleanup | plate-next | Scaffolding added during migration should not become final API or Plite surface | NodeIdPlugin, NodeIdPlugin.spec | keep | next Plate Next file review |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| none | N/A | N/A | no extracted NodeId files | inventory command returned 0 rows |

Changed files:
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.ts`
- `packages/core/src/lib/plugins/node-id/NodeIdPlugin.spec.tsx`
- `docs/plans/2026-07-01-plate-next-node-id-plugin-drift.md`

Proof:
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/node-id/NodeIdPlugin.spec.tsx` passed, 21 tests.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/core lint` passed.
- `pnpm check:core` passed, 1874 pass, 85 skip, 0 fail.
- Removed-helper audit returned no matches.
- Extracted-file inventory returned no rows.

Verification evidence:
- Inserted nodes preserve unique existing ids.
- Inserted text leaves do not receive ids by default.
- Split-node operation property handling remains local NodeId policy, not a loose Plite element API.

Open risks:
- If another plugin needs to run schema-like policy against operation `properties`, design that explicitly in Plite instead of widening `ElementApi.isElement`.

Reboot status:
- Done; no active command remains.

Keep / revert / quarantine:
- keep.

Needs attention:
- None for this packet. The next meaningful review is another Core file with similar migrated scaffolding, not NodeId.

Final score:
- 100 / 100 for the scoped NodeIdPlugin packet.
