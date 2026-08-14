# Execute EQ-P1 recursive array equality

Objective:
Execute accepted EQ-P1 in Plite; done when red-green equality proof,
property/benchmark checks, package gates, changeset, and P2 review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-execute-eq-p1-recursive-array-equality.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard`, accepted-plan execution. The user explicitly said “Execute the
  plan” after the Slate audit stopped at the `EQ-P1` acceptance boundary.

Completion threshold:
- A public `TextApi.equals` test fails before the fix and passes after it for
  structurally equal nested arrays containing cloned objects and arrays.
- Existing equality laws plus deterministic JSON-value property checks pass,
  including negative nested mutation, length, order, array/object, primitive,
  and missing-key-versus-`undefined` cases.
- The public import, signature, and export stay unchanged; the private equality
  owner remains `packages/plite/src/utils/deep-equal.ts`.
- A bounded current-versus-candidate benchmark records the shallow hot-path and
  representative nested scaling; no meaningful shallow p95 regression is
  accepted.
- Focused tests, `@platejs/plite` source-first typecheck,
  `pnpm check:plite:dev`, scoped formatting/lint, the main-relative changeset
  decision, and P2 `autoreview --max-priority P2` are recorded. Changed-owner
  gates and review pass; unrelated current-tree failures remain explicit.
- The execution plan records fresh evidence and `check-complete.mjs` passes.

Verification surface:
- Source audit: `TextApi.equals`, private deep-equality implementation, package
  export, existing fixtures, direct consumers, and current `main` release
  baseline for the changeset.
- TDD: focused public equality test observed red, then focused and full
  deep-equality tests green.
- Property proof: deterministic bounded JSON values through the public
  `TextApi.equals` observer.
- Performance: focused benchmark for shallow text equality and nested arrays,
  with current/candidate comparison or an equivalent stable threshold.
- Package proof: `pnpm turbo typecheck --filter=./packages/plite`,
  `pnpm check:plite:dev`, and scoped Biome check for changed paths.
- Review: P2 `autoreview` over the exact implementation/test/changeset boundary,
  then rerun proof after accepted fixes.

Constraints:
- The accepted public shape is fixed: no new export, option, mode, alias,
  dependency, compatibility path, or call-site migration.
- Preserve Plite's object law that a missing key equals explicit `undefined`.
- Preserve array length/order semantics and array-versus-object distinction.
- Keep the implementation bounded for the shallow text/leaf hot path.
- Do not execute any other Slate audit packet or mutate public GitHub state.
- Do not edit `templates/**`, commit, push, or create a PR.

Boundaries:
- In scope: `packages/plite/src/utils/deep-equal.ts`, the smallest public
  equality behavior tests/fixtures, a focused benchmark only if no suitable
  owner exists, one `@platejs/plite` changeset, and this execution plan.
- Source owners: `TextApi.equals` is the public observer;
  `packages/plite/src/utils/deep-equal.ts` is the private runtime owner.
- Non-goals: public API changes, Plate plugin work, DOM/React/browser behavior,
  collaboration/history formats, fixture-runner transplantation, and all
  deferred Slate audit rows.
- Direct Plate/collaboration adoption owners: N/A; behavior improves behind the
  unchanged Plite API and serialized data shape.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.
- Exclude generated trees, dependencies, build output, and unrelated dirty
  packages. Cap source reads and review output to the named equality packet.

Blocked condition:
- Stop only if the accepted law contradicts current public types/data ownership,
  a focused benchmark shows unavoidable material shallow regression, or the
  owning package gates fail from the equality patch with no safe narrower fix.

Plite Plan state:
- status: complete
- phase: handoff
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Execute accepted `EQ-P1`; implementation, behavior proof, benchmark, changeset, review, and final handoff are in scope. Other audit packets, GitHub mutation, and git shipping are out of scope. |
| Active goal and plan verified | yes | New one-shot goal names this exact execution plan after the audit goal completed. |
| Current owners read | yes | Read root/Plite/common Vision, `docs/plite/agent-start.md`, the source Plite Plan rule, `TextApi.equals`, private `isDeepEqual`, public exports, existing fixtures, normalization/schema consumers, package scripts, target registry, Slate donor source/tests, and main release baseline. |
| Best API target resolved | yes | Accepted audit review keeps `TextApi.equals` unchanged; no reusable public call-shape change. |
| Mode and execution boundary resolved | yes | Standard accepted-plan execution; user authorization is “Execute the plan.” |

Work Checklist:
- [x] Every explicit request, scope boundary, stop condition, deliverable,
      verification surface, success threshold, and final handoff requirement is
      captured before implementation.
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
| Binary readiness | yes | Resolve every readiness condition | Changed-owner behavior, fixtures, typecheck, formatting, benchmarks, and review pass. The broad current-tree gate remains non-release-ready only because three unrelated package tests and three unrelated adopter type errors already exist outside this packet. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source diff, public `TextApi.equals` observer, private export boundary, tests, package baseline, and exact reviewer bundle were re-read after the last repair. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | The accepted audit verdict keeps the root-exported `TextApi.equals` call and signature unchanged; the repair stays private to `deep-equal.ts`. |
| Conditional risk and adoption | yes | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Performance, stack depth, wide short-circuit, prototype-own-key, and Slate provenance risks have proof. Browser/docs/adoption are scoped out because no UI, teaching, public API, or data shape changed. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact red, green, fixtures, full-package boundary, typecheck, benchmark, Biome, changeset, affected gate, and P2 review results are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Ownership, unchanged public surface, proof, current-tree limitations, and no-follow-up state are recorded below. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Three grounded P2 findings were repaired with new red-green proof. The final exact two-file isolated review reports no accepted/actionable findings and rates the patch correct at 0.95. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-execute-eq-p1-recursive-array-equality.md` | Final checker run is recorded in Verification evidence. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live Vision, source, tests, exports, donor behavior, benchmark owners, and release baseline read | Decide |
| Decide | completed | Accepted one private recursive relation; public shape and migration remain unchanged | Prove and hand off |
| Prove and hand off | completed | Five execution slices completed; exact proof and current-tree limitations recorded | None |

Decision brief:
- outcome: cloned nested JSON arrays compare structurally through the existing
  public `TextApi.equals` call.
- chosen shape: recursively reuse the private equality relation for array
  members; retain current object normalization and primitive equality laws.
- strongest rejected alternative: generic deep-equality dependency or public
  equality mode. Both enlarge surface and machinery for one private law.
- consequence: existing consumers gain truthful equality with no adoption or
  serialized-data change; the hot-path benchmark becomes the main risk gate.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Nested JSON-array equality | Array members compared by identity inside an otherwise recursive private equality relation | Array length/order plus every nested JSON member compare structurally with lazy iterative traversal | `packages/plite/src/utils/deep-equal.ts`; public observer `TextApi.equals` | Plite node properties are JSON-native; clone identity must not define equality | Automatic behind unchanged call sites; no Plate/collaboration migration | Public red-green test, deterministic property laws, stack/wide proof, benchmark, package gates | Cycle behavior remains outside the serializable Plite value domain | implemented |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Red public law | Plite test owner | Add one nested cloned array/object equality case through `TextApi.equals` | Accepted audit packet and live owner confirmed | Fails for the expected identity-comparison reason | Focused Bun test |
| 2. Minimal runtime fix | Plite equality owner | Recurse through array members; delete stale unsupported-value claim | Slice 1 is red | Tracer test and all existing equality fixtures pass | Focused then full equality tests |
| 3. Class proof | Plite test owner | Add negative nested mutation/order/length/type cases and bounded deterministic JSON property laws | Slice 2 green | Behavior class passes without implementation-coupled assertions | Focused/full equality tests |
| 4. Hot-path proof | Plite benchmark owner | Measure shallow text equality and representative nested arrays | Runtime shape stable | Recorded workload shows no meaningful shallow p95 regression and finite nested scaling | Focused benchmark command/artifact |
| 5. Package/release closure | Plite package owner | Typecheck, affected Plite gate, main-relative changeset audit, scoped format/lint, P2 review | Slices 1-4 green | Zero relevant failures or accepted review findings | Package commands, changeset audit, autoreview |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Nested cloned arrays compare equal | Slate #6092 plus accepted `SLATE-DEEP-ARRAY-001` dossier | Public `TextApi.equals` case observed red (`false !== true`) before the fix and green after it | passed |
| Unequal nested JSON values stay unequal | Existing fixture corpus and accepted dossier | Negative nested mutation/order/length/type cases plus 400 fast-check runs | passed |
| Existing object/primitive/array laws remain stable | Current Plite fixtures | 13 filtered fixture rows pass; focused public suite passes 5/5; full package passes 1436/1439 with only three named unrelated failures | passed |
| Public API and serialized shape do not change | Best API verdict and current exports/types | Source audit and `@platejs/plite` source-first typecheck pass; only the private helper changed | passed |
| Shallow hot path stays healthy | Accepted dossier performance gate | Three alternating p95 samples are 1.122x, 1.168x, and 1.012x versus the legacy relation; nested 512/64 scaling is 4.46x, 4.32x, and 4.36x | passed |
| Package change is handoff-ready | Root package rules | Scoped Biome, typecheck, changeset audit, and final P2 review pass. Broad `check:plite:dev` is blocked by unrelated list/table adopter type errors | passed with current-tree limitation |

Conditional evidence:
- High-risk scenarios: (1) cloned nested values stay falsely unequal; (2)
  recursive comparison changes missing-key/`undefined` or array/object laws;
  (3) shallow equality regresses because every path pays recursive machinery.
- External research: N/A; accepted local editor-audit evidence and live
  `../slate-audit` source own the donor claim.
- Issue/PR provenance: Slate PR #6092, already classified and accepted as
  `SLATE-DEEP-ARRAY-001`; no public mutation authority.
- Browser/docs: N/A because this is a private deterministic model comparison
  with no browser/UI or public teaching change. Benchmark, behavior-law, and
  release owners apply.

Findings:
- The accepted audit identifies identity-only array member comparison as the
  only material Slate delta gap.
- Live `isDeepEqual` confirms the array branch compares members with `!==` and
  claims complex array values are unsupported, while object members already
  recurse. `TextApi.equals` is the unchanged public observer.
- `TextApi` is exported from `@platejs/plite`; the private `isDeepEqual` utility
  is not part of the package root export.
- Existing direct consumers are normalization/schema laws. Existing fixtures
  cover flat arrays, objects, primitives, array/object distinction, and
  missing-key/`undefined`, but not cloned nested values inside arrays.
- Both `main` and `origin/main` lack `packages/plite`. Per the Changeset skill,
  there is no main-relative package delta to describe, so a changeset is N/A
  unless later source proves a different release baseline.
- The first recursive implementation overflowed the call stack on a 200,000
  level acyclic array. An iterative traversal fixed depth safety.
- Direct property lookup confused inherited prototype values with missing own
  keys. Own-value reads now preserve the existing missing-versus-`undefined`
  law even for keys such as `toString`.
- A pair worklist was depth-safe but allocated and read the entire width before
  comparing the first member. Lazy array/object frames reduce auxiliary storage
  to traversal depth and stop after the first unequal array member.

Decisions and tradeoffs:
- Keep one private recursive relation. Reject dependency, mode flag, public
  helper, compatibility behavior, and copied Slate fixture machinery.
- Use a scalar identity fast path plus lazy iterative frames. This is more code
  than direct recursion, but it preserves shallow cost, avoids JavaScript call
  stack limits, and avoids width-sized worklists.
- Preserve the documented serializable-value domain. Cycle detection would add
  machinery for values Plite rejects and is deliberately out of scope.
- Do not create a misleading changeset for a package absent from current main;
  record the source audit as the release decision.

Review fixes:
- P2 stack overflow: added a 200,000-level red case and replaced direct
  recursion with iterative traversal.
- P2 prototype-colliding keys: added `toString` red cases and centralized own
  property reads.
- P2 width-sized worklist: added a 100,000-member proxy read-count red case and
  replaced eager pair pushes with lazy depth-first frames.
- After the required two-cycle pause, the third finding remained the same
  equality owner and accepted performance invariant, so it stayed in scope.
- Final P2 review: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Focused `vitest` command unavailable | 1 | Read the package script instead of installing another runner | Used the owning Bun test script. |
| Temporary benchmark could not resolve the workspace alias | 1 | Point the disposable benchmark at the absolute live source entry | Benchmark ran without changing package code. |
| Direct recursive candidate exceeded the 1.25 shallow p95 limit and overflowed at pathological depth | 2 candidate shapes | Preserve scalar identity fast path and move complex traversal to iterative frames | Three final p95 samples pass; 200,000-level proof passes. |
| A 20,000-level depth case did not expose the recursion bug | 1 | Raise the deterministic case to the proven failing boundary | The 200,000-level case observed `RangeError` red, then passed after repair. |
| `pnpm run reinstall` could not remove a non-empty `.pnpm` directory after the Biome binary disappeared | 1 | Do not repeat reinstall; run ordinary `pnpm install` | Install completed and scoped Biome/typecheck recovered. |
| Full `@platejs/plite` test run has three unrelated failures | 2 confirmations | Isolate changed-owner tests and name the external failures | Equality suite is 5/5 and fixtures 13/13; full run is 1436/1439. |
| Broad and changed-file `check:plite:dev` runs fail in unrelated adopters | 2 | Preserve the exact failure boundary rather than editing dirty list/table work | Current-tree limitation recorded; changed-owner proof is green. |

Verification evidence:
- Red proof: the cloned nested public case returned `false`; the deep stack case
  threw `RangeError`; the prototype case returned the wrong equality; and the
  wide proxy observed 100,000 indexed reads instead of 1 before their repairs.
- `pnpm --filter @platejs/plite test test/text-equality.test.ts`: 5 pass, 0
  fail. Covers clone equality, negative/normalization laws, 400 generated runs,
  200,000-level stack safety, and one-read wide-array short-circuiting.
- `PLITE_FIXTURE_FILTER=utils/deep-equal pnpm --filter @platejs/plite test
  ./test/index.slow.ts`: 13 pass, 0 fail, including all 11 equality fixtures.
- `pnpm --filter @platejs/plite test`: 1436 pass, 3 unrelated fail. The failures
  are exact internal exports after an unrelated `getNodeKeyDOMValue` addition,
  pending-changeset count from unrelated files, and an existing discarded-spec
  node-key identity assertion.
- `pnpm turbo typecheck --filter=./packages/plite`: pass.
- `pnpm exec biome check packages/plite/src/utils/deep-equal.ts
  packages/plite/test/text-equality.test.ts`: pass.
- Disposable alternating benchmark, three runs: shallow p95 candidate/legacy
  ratios 1.122, 1.168, 1.012 against the 1.25 limit; nested 512/64 ratios 4.46,
  4.32, 4.36 against the 12 limit.
- `pnpm check:plite:dev` and the changed-file-isolated form both reach adopter
  typecheck and fail outside this packet at `packages/list/src/lib/BaseListPlugin.ts`
  and `packages/table/src/lib/BaseTablePlugin.ts` / `src/react/TablePlugin.tsx`.
- Changeset: N/A. `packages/plite` is absent from both `main` and `origin/main`,
  so no main-relative released-package change exists to describe.
- Browser/docs: N/A. The unchanged public model equality has no rendered route,
  UI, native-browser behavior, or new reference surface.
- Final isolated `autoreview --mode local --max-priority P2`: clean, no
  accepted/actionable findings; patch correctness 0.95.
- `git diff --check` over the source, test, and plan boundary: pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-14-execute-eq-p1-recursive-array-equality.md`: final pass.

Final handoff prepared:
- Ownership and target API/runtime: private Plite equality now compares nested
  JSON structurally through the unchanged root-exported `TextApi.equals`.
- Public breaks and Plate/collaboration adoption: none. Call sites, types,
  exports, serialized shape, and release migration are unchanged.
- Applicable browser/benchmark/docs/provenance decisions: benchmark and Slate
  dossier apply; browser/docs are scoped N/A; no public GitHub state changed.
- Proof and execution risks: focused and property proof, fixtures, typecheck,
  performance limits, and P2 review pass. Broad current-tree closure still has
  named unrelated failures, so this is not a claim that the whole checkout is
  release-green.
- Execution order and user attention: all accepted `EQ-P1` slices are complete.
  No implementation decision remains for the user.

Timeline:
- 2026-08-14T12:49:37.613Z Plite Plan created.
- 2026-08-14 User acceptance mapped to standard one-shot execution; Vision,
  live owners, donor behavior, tests, exports, benchmark registry, and main
  release baseline read before the red test.
- 2026-08-14 Public red-green law implemented, then expanded with generated,
  pathological-depth, prototype-key, and wide-short-circuit proof.
- 2026-08-14 Three P2 review findings repaired; final exact-boundary review is
  clean and handoff evidence is complete.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Accepted `EQ-P1` execution and focused closure are complete. |
| Where am I going? | Handoff; no further packet is authorized. |
| What is the goal? | Implement accepted recursive nested-array equality with public red-green proof, bounded performance, package closure, and P2 review. |
| What have I learned? | Correct equality needs lazy iterative traversal plus own-property reads; eager recursion and eager worklists both violate accepted bounds. |
| What have I done? | Implemented the private repair, added public behavior/property/pathology proof, benchmarked it, verified package ownership, and closed P2 review. |

Open risks:
- Cyclic values remain outside Plite's documented and validated serializable
  value domain. No cycle machinery was added.
- The whole checkout is not release-green: unrelated internal-export,
  changeset, node-key, list, and table work currently fail broad gates. They do
  not invalidate the changed-owner equality proof.
