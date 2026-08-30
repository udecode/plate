# Object-only node set API

Objective:
Hard-cut positional `nodes.set`; done when only object patches remain, adoption
audits are clean, and affected proofs pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-09-object-only-node-set-api.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard` accepted-target execution. The user accepted the exact object-only
  call shape and said `ok go` on 2026-08-09.

Completion threshold:
- `nodes.set(props, options?)` is the sole public form.
- Plugin-scoped patch objects autocomplete their exact schema-owned property
  keys and retain exact values.
- Zero source, test, docs, or example uses of positional
  `nodes.set(keyOrHandle, value, options?)` remain.
- Positional public types and implementation branches are deleted with no
  compatibility alias or shim.
- Affected Plite/Plate package typechecks, focused tests, lint, P2 autoreview,
  and `check-complete` pass.

Verification surface:
- Source audit of `nodes.set` declarations, implementations, exports, tests,
  docs, and all workspace callers, excluding generated/build dependencies.
- Source-first typecheck for every modified package and focused Plite tests.
- `pnpm lint:fix`, affected doc/example validation where available, and P2
  autoreview.

Constraints:
- Execution is authorized by the user's `ok go` after accepting the exact
  object-only target. This plan records that accepted execution.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Keep transform options separate from node properties.
- Preserve schema-derived key/value checking on object patches; fix the owning
  generic instead of restoring positional overloads or adding annotations.

Boundaries:
- In scope: the Plite `nodes.set` public contract/runtime, compile tests, every
  Plate/Plite consumer, and current-state docs/examples teaching the API.
- Source owners: `packages/plite` for the primitive; consuming packages own
  their object-patch adoption.
- Non-goals: redesigning other node transforms, property persistence, schema
  identity, or plugin APIs.
- Direct Plate/collaboration adoption owners: all matches found by the bounded
  workspace source audit; collaboration is N/A unless that audit finds a call.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if object patches cannot retain schema key/value inference after
  three distinct owner-level generic repairs and no safe inferred surface
  remains; compile evidence must name the minimal failing case.

Plite Plan state:
- status: done
- phase: prove and hand off
- next: complete
- handoff: object-only API, adoption, inference, runtime, docs, and review are
  verified; one unrelated Core compile error remains recorded below

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Object-only API, no compatibility path, schema inference, and later autocomplete requirement are explicit above |
| Active goal and plan verified | yes | `create_goal` active; this exact plan path is in the objective |
| Current owners read | yes | Plite editor interface/runtime, Core plugin runtime types, compile contracts, consumers, docs, and generated reference were audited |
| Best API target resolved | yes | Accepted target: `nodes.set(props, options?)` only; options remain separate |
| Mode and execution boundary resolved | yes | One-shot accepted-target execution; no unrelated API work |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Sole signature and zero positional callers proved |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final AST caller audit, language-service completion probe, typechecks, tests, docs check, and lint are recorded below |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Object patches are the sole accepted shape; reviewer findings were fixed or rejected with the explicit boundary below |
| Conditional risk and adoption | yes | Complete triggered risk/browser/docs work | Dedicated Plite browser routes passed; www registry blocker is unrelated and recorded |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | See Verification evidence |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and execution order | See Final handoff prepared |
| P2 autoreview | yes | Run with `--max-priority P2` | Four review loops fixed index, union, and deletion-sentinel gaps; final remaining table finding is outside this lane and contradicts its earlier accepted hard cut |
| Goal plan complete | yes | Run the autogoal checker | Final checker is the last command after this update |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Owners, scope, public break, and all consumers audited | Decide |
| Decide | completed | Object-only patch law plus exact contextual property inference locked | Prove and hand off |
| Prove and hand off | completed | Source, type, runtime, browser, docs, generated reference, lint, audit, and review proof recorded | Complete |

Decision brief:
- outcome: one obvious, atomic, typed node-property patch API.
- chosen shape: `tx.nodes.set(props, options?)`.
- strongest rejected alternative: retaining `set(keyOrHandle, value, options?)`
  for computed schema properties.
- consequence: schema-owned updates must be expressed as typed patch objects;
  the owning generic must preserve computed-key inference without positional
  escape hatches.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Node property mutation | Four object/key/handle/dynamic overload families | One object-patch overload | Plite editor update primitive | Atomic multi-property writes, fewer concepts, normal TS object syntax | Migrate every consumer/test/doc | Compile-only key/value tests plus runtime set tests | Computed generic keys may widen; repair object typing at owner | cut |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Primitive | `packages/plite` | Public types and runtime dispatch | Accepted object-only target | Positional branches/types removed; object inference preserved | Focused tests and package typecheck |
| 2. Adoption | Plate/Plite consumers | Production, tests, docs, examples | Primitive compiles | Zero positional matches; behavior unchanged | Per-package typecheck/tests and source audit |
| 3. Closure | Workspace | Lint, barrels/changeset if triggered, review, plan | Slices 1-2 pass | No P0-P2 findings; all gates closed | lint, autoreview, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Object patch is sole public form | Current declarations and all call sites | 290 AST-inspected calls; zero calls with more than two arguments | passed |
| Node props stay separate from transform options | Existing object/option split | 61 primitive tests and 555 consumer tests | passed |
| Schema-derived property/value typing survives | Current compile tests | Positive/negative direct, computed, alias, ambiguous-owner, index, union, deletion, and live-node assertions | passed |
| Plugin property autocomplete survives | Real `BaseTextAlignPlugin` author callback | TS 6 language service returned only `textAlign`, with zero diagnostics | passed |

Conditional evidence:
- High-risk scenarios: object patch accidentally accepts wrong schema values;
  computed property patches widen to arbitrary records; option fields are
  mistaken for document props.
- External research: N/A; the accepted target is grounded in current public
  contracts and TypeScript proof.
- Issue/PR provenance: N/A; user-directed local architecture migration.
- Browser/benchmark/docs/release/behavior-law owners: docs and package API
  apply; browser and benchmarks are N/A unless the audit finds a user-visible
  runtime path whose behavior cannot be proven below the browser.

Findings:
- Accepted API law: document properties are the first object argument;
  transform targeting/policy remains the second options argument.

Decisions and tradeoffs:
- Cut every positional overload rather than teaching two equivalent mutation
  paths. Computed schema keys do not justify a second public verb or signature;
  typing must be solved in the object-patch owner.

Review fixes:
- Required a genuine broad string index for the safe `Record<string, unknown>`
  erased escape; concrete broad string and number indexes are rejected.
- Distributed validation across union members so an unsafe index signature
  cannot hide behind `keyof` union intersection behavior.
- Added `undefined` to every public Plite node patch property so atomic deletion
  works with `exactOptionalPropertyTypes`.
- Preserved exact plugin autocomplete, wrong-value rejection, persisted-alias
  enforcement, duplicate-owner rejection, and exact node targets.
- Rejected reviewer requests to ban explicit `any` or checking in a genuinely
  broad plugin definition: those are deliberate TypeScript/base-editor erased
  boundaries, and pretending otherwise breaks structural substitutability.
- Rejected the final table-header migration finding as outside this object-patch
  lane; it targets a separate user-approved schema hard cut already present in
  the review bundle.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Static contextual overload plus permissive fallback lost exact value safety | 1 | Move validation into one inferred generic signature | Exact values and autocomplete both pass |
| Narrow exact-only signature broke editor structural assignability | 1 | Add only the safe erased record boundary | Core variance errors cleared |
| Index detection looked at aggregate keys and missed union members | 1 | Distribute validation over every member | Direct and union index negatives compile |
| Reviewer proposed banning explicit `any` and broad definitions | 1 | Test the structural owner instead of accepting impossible safety | Kept intentional erased boundary; exact contexts remain strict |
| First www registry browser route imported deleted `plate-types.ts` | 1 | Use the dedicated Plite runtime owner | Table and checklist routes passed, including a live checkbox update |
| Core compile proof reaches unrelated Plite React generic error | 1 | Isolate changed compile contracts and record owner | Only `packages/plite-react/src/plugin/with-react.ts:178` remains |

Verification evidence:
- API caller audit: TypeScript AST inspected 290 `.nodes.set` calls under
  `packages`, `apps`, and `content`; positional offenders: 0.
- Autocomplete: TypeScript 6 language service queried the real
  `BaseStylePlugins.ts` text-align callback with an empty patch object; result
  was exactly `["textAlign"]`, semantic diagnostics: 0.
- Plite typecheck: `pnpm --filter @platejs/plite typecheck` passed.
- Core artifact build: `pnpm --filter @platejs/core build` passed.
- Core compile contracts: every changed assertion is accepted; the command
  stops only at pre-existing/shared
  `packages/plite-react/src/plugin/with-react.ts:178` because `dom` is missing
  from an unrelated generic projection.
- Primitive behavior: focused Plite transaction and command suite passed 61/61.
- Consumer behavior: Basic Styles, Footnote, Indent, Layout, Link,
  Legacy list model, List, and Table suites passed 555/555 across 39 files.
- Generated API reference: `pnpm --filter www api-reference:check` passed.
- Formatting/lint: `pnpm lint:fix` passed with no fixes and 15 existing
  oversized-artifact warnings.
- Browser: dedicated Plite table and checklist routes rendered; the checklist
  mutation changed the third checkbox from false to true. The normal www block
  route remains blocked by an unrelated stale registry import of deleted
  `plate-types.ts`.
- P2 autoreview: fixed direct index, union index, and base deletion-sentinel
  findings. The final reported table-header migration is outside this plan.

Final handoff prepared:
- Ownership and target API/runtime: Plite owns one
  `nodes.set(props, options?)` primitive; Core specializes plugin patches from
  the installed schema.
- Public breaks and adoption: positional overloads, runtime normalization, and
  all callers are removed with no alias or shim.
- Inference: exact property completion and values survive, including computed
  persisted aliases and atomic deletion.
- Proof: source audit, compile contracts, 616 focused tests, browser mutation,
  docs/generated reference, lint, and P2 review are complete.
- Remaining risk: only the unrelated Plite React `dom` projection compile error
  and unrelated www stale registry import remain; neither belongs to this API.

Timeline:
- 2026-08-09T20:55:35.101Z Plite Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ground |
| Where am I going? | Decide, prove, prepare handoff |
| What is the goal? | Make object patches the only `nodes.set` API and migrate every caller with inference preserved. |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Open risks:
- Explicit `any` and genuinely broad plugin definitions remain deliberately
  untyped. Exact plugin contexts reject concrete direct and union index maps.
