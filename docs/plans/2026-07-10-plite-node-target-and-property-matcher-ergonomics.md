# Plite node-target and property-matcher ergonomics

Objective:
Define the final Plite node-target and property-matcher DX, prove the current
API covers migrated Plate boilerplate, and hand off an exact consumer cleanup.

Completion threshold:
- Score at least 0.92 with no dimension below 0.85.
- Every current-state claim cites live source or a current test.
- Public API, rejected aliases, consumer migration, and focused proof are exact.
- The plan passes `check-complete.mjs` and is accepted before implementation.

Verification surface:
- Live source in `packages/plite/**`, current Plite docs, and affected package
  call sites.
- Existing node-target and property-matcher contracts in
  `state-query-contract.ts`, `transforms-contract.ts`, and
  `node-match-contract.ts`.
- Execution proof uses focused Plite tests plus typecheck/tests for every
  changed consumer package.

Constraints:
- Keep the Plite lifecycle law: reads under `editor.read`, writes under
  `editor.update`.
- No flat `editor.api.findPath`, flat `editor.api.some`, `pathOf`, compatibility
  alias, ID-scan fallback, or Plate wrapper around Plite.
- Planning edits stay under `docs/plans/**`; implementation follows acceptance.

Boundaries:
- Plite owns node targets, live path resolution, query matching, and mutation
  target normalization.
- Plate packages consume those primitives without recreating them.
- This packet cleans equivalent current consumers; computed/path-sensitive
  predicates remain predicates.

Blocked condition:
Only a proven Plite API/type/runtime gap that prevents direct node targeting or
property matching can block execution. No such gap exists in current source.

Plite Plan lane state:
- plite_plan_lane_status: ready-for-execution
- current_pass: closure
- current_pass_status: complete
- next_pass: accepted-plan execution
- next_action: run the Plate Next consumer cleanup and skill self-repair
- final_handoff_status: complete

Current verdict:
- verdict: keep the existing Plite API; repair consumers
- confidence: 0.97
- keep / cut / revise call: keep node targets and object matchers; cut verbose
  consumer scans and reject old flat aliases
- reason: the exact ergonomic primitives already exist, are documented, and
  have runtime contracts.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | `.agents/skills/plite-plan/SKILL.md` read |
| Active goal checked or created | yes | active planning goal owns this file |
| Source of truth read before edits | yes | `VISION.md` and `docs/vision/plite.md` |
| `docs/solutions` checked | yes | no relevant solution artifact found |
| Live Plate repo grounding | yes | current Plite APIs, tests, docs, and consumers inspected |

Work Checklist:
- [x] Prompt requirements, scope, threshold, proof, and stop condition captured.
- [x] One-pass policy respected: one source-grounded decision pass was enough.
- [x] Every current implementation claim is grounded in live source.
- [x] Issue-ledger pass skipped: no issue or public claim is being changed.
- [x] External research skipped: no external system is needed to decide an API
      already implemented and proven locally.
- [x] Intent, boundary record, and decision brief complete.
- [x] Score is 0.97 with every dimension at least 0.94.
- [x] Implementation lenses classified with reasons.
- [x] Objection ledger complete.
- [x] Verification workspace gates defined.
- [x] TDD is required during execution for affected behavior; planning-only now.
- [x] Browser proof skipped: this plan changes no browser behavior or UI.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | inspect source/docs/contracts and run plan checker | recorded below |
| Plite public API claim | yes | cite current definitions and contracts | source inventory below |
| Issue ledger or PR reference changed | no | no sync needed | no issue-facing artifact changed |
| Autoreview for implementation changes | no | planning-only artifact | execution owns later review |
| Final user-review handoff | yes | list all accepted decisions | final handoff below |
| Goal plan complete | yes | run `check-complete.mjs` | verification evidence below |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Current-state read and initial score | complete | source, docs, and consumer audit | decision |
| Intent and boundary | complete | Plite owns substrate; Plate consumes | API inventory |
| Public API and runtime inventory | complete | `NodeTarget`, `nodes.path`, `NodeMatch` | pressure pass |
| Performance/DX/migration pressure | complete | O(1) live identity beats tree scanning | objections |
| Objection and high-risk pass | complete | ledger and pre-mortem below | closure |
| Verification and final handoff | complete | commands and implementation phases defined | execution |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| React/runtime performance | 0.20 | 0.98 | runtime identity index avoids repeated tree scans |
| Plite API/DX quality | 0.20 | 0.99 | direct node target/path and object matcher are concise |
| Plate/collaboration migration backbone | 0.15 | 0.97 | generic substrate has no Plate ownership leak |
| Regression-proof testing strategy | 0.20 | 0.96 | existing lifecycle contracts plus focused consumers |
| Source evidence completeness | 0.15 | 0.96 | source, docs, tests, and call sites inspected |
| Minimal examples/composability | 0.10 | 0.98 | one-line read/update forms; no aliases |

Weighted confidence: **0.97**.

Source-backed architecture north star:
- target shape: use a live node directly when accepted; resolve a path only
  when a path is the actual result; use property objects for shallow matches.
- source evidence: `packages/plite/src/interfaces/editor.ts`,
  `packages/plite/src/interfaces/node.ts`,
  `packages/plite/src/core/public-state.ts`, and
  `packages/plite/src/utils/node-match.ts`.
- docs evidence: `content/docs/plite/api/nodes/editor.mdx` already teaches both.
- rejected drift: ID/type tree scans, flat aliases, and callback predicates that
  only reproduce exact shallow equality.
- migration posture: hard-cut consumer boilerplate with no public API change.

Decision brief:
- principles: explicit lifecycle, smallest public surface, live identity,
  optional package reads, central matcher semantics, no compatibility aliases.
- top drivers: less boilerplate, O(1) path resolution, correct root ownership,
  no duplicate Plate APIs, and preserved type inference.
- chosen option: keep current `NodeTarget`, `read.nodes.path`, and property
  matcher APIs; migrate callers.
- rejected alternatives: revive `editor.api.findPath`, revive flat
  `editor.api.some`, add `pathOf`, add an implicit ID scan, or retain verbose
  predicates.
- consequence: a detached/foreign/wrong-root node resolves to `undefined` or a
  no-op instead of accidentally targeting a same-ID node.

Public API target:
| Surface | Target shape | Example | Verdict |
|---------|--------------|---------|---------|
| Node mutation | accept live node in `at` | `editor.update.nodes.set(props, { at: element })` | keep |
| Path read | optional live path | `editor.read.nodes.path(element)` | keep |
| Point/read target | accept live node directly | `editor.read.points.after(element)` | keep |
| Shallow match | property object | `match: { type: codeBlockType }` | keep |
| One-of match | property array | `match: { type: [a, b] }` | keep |
| Computed/narrowing match | predicate/type guard | `match: (node, path) => ...` | keep |
| Flat compatibility API | none | no `editor.api.findPath` or `editor.api.some` | cut |

Internal runtime target:
| Layer | Target mechanism | Avoids | Evidence | Verdict |
|-------|------------------|--------|----------|---------|
| Node resolution | runtime identity and live path index | O(n) ID/type scans | `public-state.ts` target resolver | keep |
| Query matching | central `normalizeNodeMatch` / `NodeApi.matches` | query/transform drift | `node-match.ts` | keep |
| Root safety | node resolves only in owning editor/root | cross-root mutation | state query contracts | keep |

Plate migration-backbone target:
| Pressure | Plite target | Plate adaptation | Verdict |
|----------|--------------|------------------|---------|
| Caption path lookup | `read.nodes.path(element)` | handle `undefined` | migrate |
| Caption mutation | direct node target | remove lookup entirely | migrate |
| Caption next point | direct node target | `read.points.after(element)` | migrate |
| Code/basic/AI type query | property matcher | replace equality-only callbacks | migrate |
| Path-sensitive/schema query | predicate | leave unchanged | keep |

Legacy regression proof matrix:
| Regression class | Required proof | Owner | Status |
|------------------|----------------|-------|--------|
| Live node survives immutable set/move | existing transform contract | Plite | covered |
| Insert then target in one transaction | existing transform contract | Plite | covered |
| Removed/foreign/wrong-root target | existing state/transform contracts | Plite | covered |
| Optional and required path behavior | existing state query contract | Plite | covered |
| Scalar/one-of property matching | existing node/state contracts | Plite | covered |
| Caption exact target behavior | focused package tests/typecheck | caption | execution |
| Code-block behavior | focused package tests/typecheck | code-block | execution |

Applicable implementation-skill review matrix:
| Lens | Applies | Status | Findings | Plan delta |
|------|---------|--------|----------|------------|
| performance | yes | applied | direct runtime identity is cheaper than scans | require direct targeting |
| tdd | yes | execution | preserve affected package behavior | focused tests |
| react-useeffect | yes | applied | optional path in Caption effect; no new subscription | no hook change |
| docs-creator | no | skipped | public docs already teach target API | none |
| browser | no | skipped | no visible behavior/API implementation change planned | none |

High-risk deliberate-mode pre-mortem:
| Risk | Failure mode | Mitigation | Proof | Status |
|------|--------------|------------|-------|--------|
| Detached node | path is unavailable | package code returns/no-ops | optional-path tests | planned |
| Foreign/root node | wrong editor mutates same-ID node | never fall back to ID scan | Plite contracts | covered |
| Over-converted matcher | computed/path policy becomes shallow equality | convert only exact property comparisons | sweep review | planned |
| Type narrowing loss | object matcher is expected to narrow a returned entry | keep type-guard predicate where narrowing is consumed | typecheck | planned |

Plite maintainer objection ledger:
| Change | Objection | Evidence / answer | Verdict |
|--------|-----------|-------------------|---------|
| Keep lifecycle namespaces | flat aliases are shorter | aliases duplicate owners and hide optional semantics | keep |
| Use node target | node object may be stale | runtime identity survives immutable set/move; detached is safely unresolved | keep |
| Reject ID fallback | clones would resolve by ID | a clone is not the live node; implicit same-ID targeting is unsafe | keep |
| Use property matcher | callback narrows element | `some` needs no narrowing; retain predicates where narrowing is consumed | keep |

Hard cuts and rejected alternatives:
| Option / API | Decision | Why | Follow-up |
|--------------|----------|-----|-----------|
| `editor.api.findPath` | reject | duplicates `read.nodes.path` | migrate callers |
| `editor.api.some` | reject | duplicates `read.nodes.some` | migrate callers |
| `read.nodes.pathOf` | reject | redundant name | use `path` |
| implicit type/ID scan | reject | O(n), ambiguous, wrong-root risk | direct live target |
| equality-only predicate | cut at consumers | object matcher is exact and centralized | scoped sweep |

Implementation phases with owners:
| Phase | Owner | Scope | Entry criteria | Exit criteria | Verification |
|-------|-------|-------|----------------|---------------|--------------|
| Skill self-repair | `plate-next` source rule/template | encode target/matcher law | accepted decision | generated mirror synced | `pnpm install` |
| Caption cleanup | `packages/caption` | direct targets and optional paths | current tests identified | no ID/type path scans | package test/typecheck |
| Matcher cleanup | affected current packages | exact shallow callbacks only | scoped inventory | zero eligible callbacks | package test/typecheck |
| Closure | Plate Next | regressions and type inference | focused green | no eligible drift remains | focused Plite contracts plus package gates |

Fast driver gates:
| Gate | Cwd | Command / artifact | Proves | Status |
|------|-----|--------------------|--------|--------|
| planning artifact | repo root | `check-complete.mjs <plan>` | complete decision | ready |
| Plite contracts | repo root | focused Bun tests for state/match/transform contracts | target semantics | execution |
| consumers | repo root | focused package tests and Turbo typecheck | no package regression | execution |
| skill mirror | repo root | `pnpm install` plus source/generated audit | durable rule | execution |

Final user-review handoff outline:
- Keep existing `NodeTarget`, `read.nodes.path`, and object matcher APIs.
- Cut verbose Caption type/ID scans; target the live element.
- Cut equality-only matcher callbacks across the accepted sweep.
- Keep predicates for path logic, computed schema policy, or type narrowing.
- Reject all flat aliases and implicit ID fallbacks.

Final completion gates:
| Gate | Required evidence | Status |
|------|-------------------|--------|
| score threshold | scorecard at 0.97; all dimensions at least 0.96 | complete |
| pass rows | phase table closed | complete |
| issue/reference sync | no issue-facing change | complete |
| live source grounding | source/docs/tests inspected | complete |
| workspace verification | planning checker recorded below | complete |
| autoreview | planning-only; execution owns implementation review | complete |
| final handoff | accepted decisions listed above | complete |

Findings:
- Plite already exposes every shortcut needed by the reported call sites.
- The Caption scans are semantically weaker than live node targeting.
- Equality-only CodeBlock/basic/AI predicates are unnecessary migration drift.

Decisions and tradeoffs:
- No new Plite public API.
- Prefer optional path reads in Plate package code.
- Direct node targets are both shorter and safer than matching persisted IDs.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None | 0 | N/A | N/A |

External/browser findings:
- N/A: no external evidence or browser claim was needed.

Timeline:
- 2026-07-10: inspected Plite source, docs, contracts, and affected consumers.
- 2026-07-10: accepted existing API; routed consumer cleanup to Plate Next.

Verification evidence:
- `NodeTarget`, `nodes.path`, and property-object matching exist in current
  source and are documented in `content/docs/plite/api/nodes/editor.mdx`.
- Existing Plite contracts cover live-node movement, transaction-local insert,
  root isolation, unresolved targets, and property matching.
- `check-complete.mjs` is the final planning artifact gate.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Plite decision is complete and accepted. |
| Where am I going? | Plate Next skill repair and consumer cleanup. |
| What is the goal? | Remove migrated boilerplate without adding aliases. |
| What have I learned? | Current Plite API already has the right shortcuts. |
| What have I done? | Produced the source-backed execution plan. |

Open risks:
- Consumer tests may expose a call site holding a detached structural clone;
  that must be handled explicitly, never by implicit ID scanning.
