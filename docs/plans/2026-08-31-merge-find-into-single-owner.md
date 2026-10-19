# merge find into single owner

Objective:
Merge Find into one registry family file; done when stale split references are
zero and focused tests, exact scale, registry, and browser proof pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-merge-find-into-single-owner.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- performance-observability (docs/plans/templates/packs/performance-observability.md)
- browser (docs/plans/templates/packs/browser.md)

Linked plans:
- None.

Cleanup source:
- type: user-corrected local architecture cleanup
- id / link: `apps/www/src/registry/components/editor/find.tsx` and
  `apps/www/src/registry/components/editor/find-plugin.ts`
- title: merge Find into one registry family owner
- requested surface: copied Find registry source, registry manifest/output,
  exact transient-projection benchmark, and focused visible behavior
- cleanup intent: delete the unique `*-plugin.ts` sibling and colocate its
  private runtime, plugin descriptor, React controller, UI, and kit in `find.tsx`
- acceptance criteria: one copied source file, zero `find-plugin` references,
  unchanged Find behavior, zero benchmark hard guards, and current generated
  registry output

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable checkpoints: scope, non-goals,
  timing/duration, stop conditions, deliverables, final handoff sections,
  verification surface, and success criteria.
- Do not continue into implementation until this extraction is complete or
  explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: N/A: none requested
- semantics: N/A: one-shot completion threshold
- initial confidence / cleanliness score: 97% after live topology and import proof
- improvement loop: keep only if one-file ownership preserves exact runtime,
  scale, registry output, and Browser behavior
- final score / loop closure: 100%; single-file ownership passed every named
  source, correctness, scale, registry, type, and Browser gate

Completion threshold:
- `find.tsx` owns the complete copied Find family; `find-plugin.ts` is deleted;
  registry metadata/generated payload and benchmark inputs contain zero
  `find-plugin` references; focused tests pass; the final production-path
  benchmark reports `scales-through-stress` with zero hard guards; a fresh
  `/blocks/find-demo` Browser session passes five retry-free interaction runs
  with no console errors; and the goal-plan checker passes.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-merge-find-into-single-owner.md`
  passes.

Verification surface:
- Baseline receipt:
  `docs/plans/artifacts/find-owner-cleanup/single-file-before.json`, captured
  from the exact current two-file source after the older receipt's plugin hash
  proved stale.
- Final benchmark:
  `TRANSIENT_PROJECTION_BENCH_STRICT=1 bun --expose-gc --preload ./config/plite-source-aliases.ts packages/platejs/scripts/transient-projection/benchmark-scalability.ts --output=docs/plans/artifacts/find-owner-cleanup/single-file-final.json`.
- Correctness: `bun test apps/www/src/registry/components/editor/find.spec.tsx`.
- Registry: `pnpm --filter www build:registry`, registry source check, and
  changelog generator check.
- Static proof: scoped `rg` for `find-plugin` plus generated Find payload file count.
- Browser: `/blocks/find-demo`, query `match`, navigation wrap, close/focus,
  five retry-free runs, and console inspection.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: current Find source/spec, `registry-features.ts`, generated
  Find payload, transient-projection benchmark/receipt, existing registry
  changelog source/output, root/detail Vision, and Plate UI family doctrine.
- Allowed edit scope: those Find registry owners, benchmark imports/measured
  inputs, generated registry/changelog output, this plan, and final receipt.
- Plite / Plate boundary: copied Plate registry feature; no Plite source change.
- Public API boundary: no Plate/Plite package API; preserve existing exported
  registry symbols and behavior while changing only file ownership.
- Browser surface: Find demo only; no styling, copy, or interaction change.
- Package/API surface: benchmark script only under `packages/platejs`; no
  shipped package source, export, dependency, or changeset.
- Non-goals: no Replace feature, matcher/search algorithm change, debounce,
  store redesign, public Find API, style change, or unrelated cleanup.

Output budget strategy:
- Read named files and bounded ranges only; exclude generated registry breadth
  except exact Find/changelog targets; keep benchmark samples in JSON artifacts
  and inspect compact summaries.

Blocked condition:
- Stop only if the one-file production module cannot load in the benchmark
  runner, registry generation fails after one source-backed repair, or exact
  performance/correctness/browser proof fails twice without a narrower fix.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal, scale-sensitive narrow packet
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete after goal-plan checker

Current verdict:
- verdict: merge runtime and UI into `find.tsx`; delete `find-plugin.ts`
- cleanliness confidence: 100% after final proof
- next owner: none; future Replace work starts as a separate audited feature job
- keep / revert / quarantine call: keep
- reason: Find is the only `*-plugin.ts` sibling, no independent terminal
  product consumer exists, and the exact benchmark runner imports `find.tsx`
  successfully

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-merge-find-into-single-owner.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User authorized the accepted single-file merge; scope, non-goals, proof, stop condition, deliverables, and handoff are recorded above. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `architecture-cleanup` loaded | yes | Skill read completely; delete/merge and anti-confetti laws select one family file. |
| Active goal checked or created | yes | No active goal existed; exact measurable goal created for this plan. |
| Source of truth read before analysis | yes | Current Find source/spec, registry manifest/output, benchmark, Vision/Plate UI doctrine, and prior final receipt inspected. |
| VISION fit gate read | yes | Existing one-family/open-code doctrine settles the merge; no Vision edit needed. |
| Plite / Plate boundary selected | yes | Copied Plate registry behavior; Plite unchanged. |
| Cleanup surface selected | yes | Two Find source files, their registry/generated ownership, and exact benchmark import/fingerprint. |
| Non-goals recorded | yes | Boundaries exclude behavior, UX, matcher, Replace, public API, and unrelated cleanup. |
| Output budget strategy recorded | yes | Named files, bounded searches, compact artifact summaries. |
| Implementation authority decided | yes | User said `go` after accepting the merge. |
| Proof strategy selected | yes | Focused test, exact benchmark, registry/changelog/source checks, static audit, and five-run Browser replay. |
| Runtime scale applicability resolved | yes | Per-match publication and per-leaf projection are hot; performance pack and exact pre/post receipts apply. |
| Performance pack selected | yes | `performance-observability` materialized. |
| User-facing operation and runtime owner identified | yes | Find query publication and leaf projection owned by the private `FindResultOwner` and `FindPlugin`. |
| Scale variables and cohorts fixed | yes | Existing harness fixes normal 100/100, large 1k/1k, stress 1/10k, and pathological 10k/10k leaf/match cohorts. |
| Budget frozen before target measurement | yes | Final rows must have zero hard guards, report `scales-through-stress`, and stay below 16.67 ms. One matched confirmation rerun is allowed for a threshold-adjacent first result. Cross-run relative latency is diagnostic because the pathological row has one five-sample packet; no speedup claim is allowed from it. |
| Baseline and target probe selected | yes | Baseline is source-matched `single-file-before.json`; target is the identical owner imported from merged `find.tsx`. |
| Correctness guard selected | yes | Three focused Find behavior tests plus benchmark projected-count assertions and Browser interaction. |
| Production detector decision recorded | no | N/A: copied local UI has no production telemetry; deterministic synthetic artifact contains no protected data. |
| Browser pack selected | yes | Browser pack materialized because registry source is interactive. |
| Browser route / app surface identified | yes | `/blocks/find-demo`. |
| Browser tool decision recorded | yes | In-app Browser is the correct ordinary app surface; no native OS/Chrome action applies. |
| Console/network caveat policy recorded | yes | Fresh final page must have zero console warnings/errors; unrelated dev asset requests are reported if present. |
| Observable browser case captured | no | N/A: behavior-neutral cleanup, not a report-backed bug; replay checks Mod+F, query `match`, two results, navigation wrap, Escape, and editor focus. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles.
- [x] Candidate matrix ranks four candidates; the user named the exact two-file
      surface, so the five-candidate broad audit minimum is N/A.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: the unique split has no independent terminal
      product consumer and is rejected.
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; existing family doctrine is sufficient, so no
      `sync-vision` work is needed.
- [x] Implementation packets are behavior-neutral, public-API-neutral, narrow,
      reversible, and have focused proof.
- [x] Every hot-owner packet has a frozen pre-packet scale receipt and exact
      post-packet production rerun plus correctness guard; paper complexity or
      "benchmark later" cannot justify keep.
- [x] Each implementation packet ends keep, revert, or quarantine: keep.
- [x] Source-owner oracle is added or repaired when ownership moves, or N/A
      reason is recorded.
- [x] Focused proof is run before broad proof for changed code.
- [x] Broad proof is run after multiple packets, import churn, or public/package
      boundary changes.
- [x] Workspace authority recorded: every proof command names the cwd/tool that
      owns the analyzed or changed behavior.
- [x] Output budget discipline recorded and followed: broad searches are
      scoped, capped, counted, or artifacted instead of streamed.
- [x] Performance pack: comparable current-owner receipt captured before the target.
- [x] Performance pack: complete query, publication, and projection work measured with matcher reads, index builds, publications, lookups, projected matches, and flat comparisons.
- [x] Performance pack: normal, large, stress, and pathological cohorts exercised.
- [x] Performance pack: warm percentiles, five-packet configuration, 20 samples per packet, 20 warmups, clock noise, and deterministic counters recorded. Cold duration and payload bytes are N/A because this topology move adds no cold owner or network payload.
- [x] Performance pack: disposable target prototype is N/A; the production family module loaded directly in the existing benchmark runner before implementation.
- [x] Performance pack: current and target use the same harness, cohorts, action, environment, correctness guard, and recorded source identities.
- [x] Performance pack: result cardinality, one matcher read, one publication, 10,000 index builds, 10,000 lookups, and 10,000 projected matches inspected; pagination and network queries are N/A.
- [x] Performance pack: no pooling, cache, index, projection, store, or scheduler was added; the existing measured owner only moved files.
- [x] Performance pack: database transaction work is N/A; Find is in-memory editor work.
- [x] Performance pack: synthetic evidence contains no user or protected data.
- [x] Performance pack: the existing deterministic harness already covered the changed path; its import and source fingerprint oracle were repaired.
- [x] Performance pack: no budget override accepted. The first target result was threshold-adjacent, so the one allowed confirmation rerun governed closure.
- [x] Browser pack: route, interaction path, and expected visible outcome were recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console warnings/errors were zero. Network tracing is N/A for this behavior-neutral in-memory path; the fresh route returned HTTP 200.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Browser pack: reporter-visible paint proof is N/A; no paint or styling claim is made, and DOM/interaction state directly proves the unchanged behavior.
- [x] Browser pack: a reporter-visible paint claim is proved from classified
      pixels captured in the named interaction phase, with known-correct
      single-layer, known-absent, and known-invalid duplicate-layer controls
      through the identical capture path. The proof records
      `positive-control: pass`, `negative-control: pass`, and
      `duplicate-control: pass`. Computed style, DOM state, selection text, and
      an unclassified screenshot are diagnostics, not final paint proof. N/A:
      no paint claim.
- [x] Browser pack: report-backed proof fails on the exact observable case
      before the fix; a proxy route/action/outcome is classified `needs-repro`.
      N/A: architecture cleanup, not a report-backed behavior fix.
- [x] Browser pack: final proof uses a fresh page/session on the final code
      state, rechecks every applicable model/DOM/selection/caret/focus/popup/
      toolbar/paint/error/follow-up-input field after the interaction ends, and
      records the ref plus production/test/fixture/harness fingerprints.
- [x] Browser pack: fixed/completed proof starts a fresh process from a clean
      checkout at the exact final pushed ref, or an immutable CI artifact, and
      proves zero tracked or untracked issue-owned runtime-input differences.
      Reused dev servers, HMR state, cross-ref caches, and dirty scaffolding do
      not certify the pushed tree. N/A: this is an uncommitted local candidate;
      no pushed-ref or shipped/fixed claim is made.
- [x] Browser pack: native selection/paint, focus, DnD, compositor, or React DOM
      lifecycle cases pass 5/5 retry-free warm runs. When Chrome is the reported
      surface, the entire final replay and warm ledger run in exact Chrome;
      otherwise the limitation blocks fixed/completed wording.
- [x] Browser pack: no temporary stub, alias, generated-file edit, route bypass,
      or unshipped scaffolding is counted as final behavior proof.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | All named proof passed; checker is the final command. |
| Source map complete | yes | Record owners and proof | Final one-file owner and all proof consumers recorded. |
| Deslop inventory complete | yes | Record stale/over-split surfaces | Unique shallow sibling and repaired oracles recorded. |
| Candidate matrix complete | yes | Rank candidates | Four bounded candidates decided. |
| Agent-navigation score complete | yes | Record navigation change | Two source files and two proof inputs became one source file and one proof input. |
| Anti-confetti gate | yes | Record no split accepted | No split accepted; the unique split was deleted. |
| Delete / merge / inline gate | yes | Record simplifications | One file deleted and merged into the family owner; public promotion rejected. |
| VISION fit gate | yes | Confirm fit | Existing family doctrine fits; no Vision change. |
| Implementation packet gate | yes | Record result and proof | One packet kept after all proof. |
| Hot-owner scale preservation | yes | Compare exact receipts | Baseline and final artifacts cover normal through pathological cohorts; final has zero hard guards. |
| Source-owner oracle gate | yes | Repair ownership checks | Benchmark import/fingerprint, registry manifest, generated payload, and changelog target point to `find.tsx`. |
| Public API / behavior safety gate | yes | Prove unchanged contract | Exports preserved; focused tests and 5/5 Browser replay passed. |
| Package/API proof | no | N/A | No shipped package source/export/dependency change; www typecheck covers the benchmark import. |
| Browser proof | yes | Run interaction proof | Fresh `/blocks/find-demo` passed 5/5 retry-free cycles. |
| Final lint/check | yes | Run appropriate checks | Focused Ultracite, Find test, www typecheck, registry source, and changelog checks passed. |
| Output budget discipline | yes | Verify bounded output | Searches were scoped; benchmark breadth lives in JSON receipts. One accidental broad JSON content print was identified and subsequent inspection was narrowed. |
| Timed checkpoint | no | N/A | No duration requested. |
| Final handoff contract | yes | Fill all closure fields | Completed below. |
| Goal plan complete | yes | Run checker | Final checker runs after this ledger update. |
| Pre-acceptance scale proof | yes | Compare exact source-matched paths | Fresh two-file baseline and one-file target use the identical harness/cohorts. |
| Warm latency budget | yes | Prove frame budget | Final worst current p95 14.974 ms, below 16.67 ms, with zero hard guards. |
| Large/stress scaling | yes | Prove all cohorts | Normal, large, stress, and pathological rows are green. |
| Cold and failure paths | no | N/A | File colocation adds no cold/failure owner; existing search error handling is unchanged and covered by type/behavior proof. |
| Payload and fan-out | yes | Record deterministic work | Pathological current path: one matcher read, 10,000 index builds, one publication, 10,000 lookups, 10,000 projected matches; no network payload. |
| Production-path rerun | yes | Rerun final owner | Final artifact imports the merged production `find.tsx` and fingerprints it. |
| Correctness guard | yes | Run behavior guard | Three focused tests and 5/5 Browser cycles passed. |
| Before/after receipt | yes | Record receipts | `single-file-before.json` and `single-file-final.json`. |
| Detector and privacy | no | N/A | No production detector or real data; deterministic synthetic fixtures only. |
| Performance regression check | yes | Run strict harness | Final decision `scales-through-stress`, zero hard guards. |
| Browser interaction proof | yes | Exercise Find lifecycle | Open, query, next, wrap, close, and editor focus passed. |
| Browser console/network check | yes | Record state | Zero console warnings/errors; route returned HTTP 200; network-sensitive work is N/A. |
| Browser final proof artifact | yes | Record route/native proof | Browser interaction receipt is recorded below; screenshot waived because no paint claim. |
| Exact case replay | no | N/A | Not a report-backed behavior fix. |
| Final ref and fingerprints | yes | Record local ref and hashes | Local HEAD and SHA-256 values recorded below. |
| Clean final runtime | no | N/A | Local uncommitted candidate; no fixed/shipped/pushed-ref claim. |
| Retry-free stability | yes | Run five warm cycles | 5/5 in the in-app Browser, no retry. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | goal, skills, methodology, doctrine, current source, and exact user correction read | source map |
| Source map | complete | two files, one product owner, registry/generated and proof consumers mapped | deslop inventory |
| Deslop inventory | complete | unique over-split family and stale future oracles identified | candidate matrix |
| Candidate matrix | complete | four exact candidates resolved; single-file merge selected | cleanup packets / owner routing |
| Cleanup packets / owner routing | complete | one reversible behavior-neutral packet applied | verification |
| Verification | complete | tests, typecheck, strict scale, registry, static, and Browser proof green | closeout |
| Closeout | complete | ledger and handoff complete; checker is final command | final response |

Source map:
- `find.tsx`: 488-line complete client family owner for the private
  snapshot/index, editor-scoped `FindResultOwner`, `getFindOwner`, `FindPlugin`,
  React controller, leaf, bar, and kit.
- `find-plugin.ts`: absent.
- Consumer graph: the transient-projection benchmark imports `FindPlugin` and
  `getFindOwner` from `find.tsx`; no second product owner exists.
- Registry owner: the `find` item copies only `find.tsx`; generated `find.json`,
  registry index, and changelog target mirror that owner.
- Package/public boundary: neither file is a package export; generated copied
  source exposes registry symbols only.
- Behavior proof: `find.spec.tsx`; scale proof:
  `benchmark-scalability.ts`; visible proof: `/blocks/find-demo`.
- Analog audit: every other production registry-local plugin declaration in
  `autoformat.tsx`, `block-menu.tsx`, `discussion.tsx`, `fixed-toolbar.tsx`,
  and `floating-toolbar.tsx` is colocated with its feature owner.

Deslop inventory:
- over-split family: `find-plugin.ts` is the only `*-plugin.ts` sibling in the
  flat editor registry and has one product owner.
- proof-driven boundary: benchmark import was treated as another consumer, but
  `bun --preload ./config/plite-source-aliases.ts -e "await import('./apps/www/src/registry/components/editor/find.tsx')"`
  proves the runner can import the family file directly.
- wrappers/pass-through modules: none after the earlier generic index helper cut.
- duplicate helpers/compatibility aliases/over-broad barrels/orphan tests: none.
- stale source-owner oracles after merge: registry metadata/generated payload,
  changelog target, benchmark import, and measured source inputs must all move
  to the one file.
- shadcn component work: N/A; markup, primitives, styling, and dependencies stay unchanged.
- changelog decision: existing generated target must be regenerated, but a new
  user-facing entry is N/A because behavior and installed feature contract are unchanged.

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Merge plugin/runtime/UI/kit into `find.tsx`; delete sibling | two source files -> one | One terminal product owner; benchmark imports the family file successfully; family doctrine prefers one readable file | Before: 2 source files/1 product owner/2 proof imports; after: 1 source file/1 owner/1 proof import; easier | Merge and preserve private runtime concept | architecture-cleanup + plate-ui | exact test, benchmark, registry, static, Browser | merge |
| 2 | Weak | Keep current two-file split | current files | Only second consumer is proof; unique registry topology | Two files for one installed family; public/private intent less obvious; worse | Reject | architecture-cleanup | terminal consumer and analog audit | reject |
| 3 | Weak | Promote `FindPlugin`/owner into `platejs/find` | package plus registry | No second product consumer or independent substitution job | More packages/API/compatibility; much worse | Reject public machinery | best-api if real consumers appear | package consumer audit | reject |
| 4 | Weak | Remove `FindPlugin` and keep UI-only local state | `find.tsx` | Loses commit-driven rescan and efficient decoration owner | One file but behavior/perf ownership worsens | Preserve plugin/runtime inside family file | plate-ui | behavior tests and benchmark | keep |

Packet ledger:
| Packet | Action | Owner | Files | Proof | Scale receipt / N/A | Result | Next |
|--------|--------|-------|-------|-------|---------------------|--------|------|
| Single-file Find owner | Move sibling contents into family file, delete sibling, repair registry/benchmark oracles | copied Find registry item | Find source, registry metadata/output, benchmark, plan/receipt | focused test, exact benchmark, registry/changelog/static, five-run Browser | baseline `single-file-before.json`: zero hard guards, worst current p95 6.584 ms, projection p95 5.255 ms; final: zero hard guards, worst current p95 14.974 ms, projection p95 5.182 ms | keep | none |

Cleanup counts:
- delete: 1 file (`find-plugin.ts`)
- merge: 1 family owner
- inline: 0; this is a full owner merge, not a one-use expression inline
- simplify: 3 ownership oracles (registry, generated payload/changelog, benchmark)
- split: 0
- keep: 1 private runtime design inside the family file
- defer: 0
- reject: 3 alternatives
- plan: 0 follow-up packets

Changed list:
- code/runtime/API: merged all Find runtime/UI/kit code into
  `apps/www/src/registry/components/editor/find.tsx`; deleted the sibling;
  preserved every exported symbol and behavior.
- tests/oracles: repaired `registry-features.ts`, generated `find.json` and
  registry index, existing changelog target, and benchmark import/measured
  input; test source unchanged.
- docs/plans: this plan plus frozen pre/post receipts under
  `docs/plans/artifacts/find-owner-cleanup/`.
- skills/workflow: none.
- reverted/quarantined: first threshold-adjacent target timing was not accepted;
  one pre-authorized confirmation rerun replaced the final receipt and passed.

Needs review:
- None. The relative pathological publication p95 moved from 6.584 ms to
  14.974 ms across runs, but the row has one five-sample packet and cannot
  support a relative speed claim. The governing absolute 16.67 ms guard and
  deterministic work contract pass. This cleanup claims preserved scale, not
  improved speed.

Open risks:
- No blocking risk. Relative one-packet timing remains noisy, so this packet
  makes no claim that colocation improves runtime speed.

Verification evidence:
- CWD for every shell proof: `/Users/zbeyens/git/plate-2`.
- Focused behavior: `bun test apps/www/src/registry/components/editor/find.spec.tsx`
  passed 3 tests, 17 expectations, 0 failures.
- Focused lint: Ultracite check on `find.tsx`, `registry-features.ts`, and the
  benchmark script passed.
- Broad type proof: `pnpm --filter www exec tsc --noEmit -p tsconfig.json`
  passed.
- Registry: `pnpm --filter www build:registry` generated 366 payloads and 15
  overlays; changelog write/check passed 97 events; registry source check passed.
- Static owner audit: sibling absent; scoped `find-plugin` search empty; Find
  payload contains exactly one target, `@components/editor/find.tsx`; changelog
  target contains exactly the one source file.
- Final strict scale receipt: decision `scales-through-stress`, zero hard
  guards, worst current p95 14.973625 ms, pathological projection p95
  5.182375 ms, and flat baseline p95 1546.310834 ms. Pathological deterministic
  work is one matcher read, 10,000 index builds, one result publication, 10,000
  lookups, and 10,000 projected matches versus 100,000,000 flat comparisons.
- Browser: fresh `/blocks/find-demo` session passed 5/5 retry-free runs of
  `Mod+F`, query `match`, `1 of 2`, Enter to `2 of 2`, Enter wrap to `1 of 2`,
  Escape close, and editor-focus restoration. Every state had two matches and
  exactly one active highlight. Console warnings/errors: zero.
- Final local ref: `377a77a537971b793a4ddbb34cc13797fdfeee15` plus uncommitted candidate inputs.
  SHA-256: Find source `9a2c4bc227e6bc063364a0be1ff4ce44a27d3ced6f65057113933898da9b17f4`;
  test `889a58fbdc5dca3dba410c03737a5c244245fdb36e0488de7af501d3e165c077`;
  benchmark `b2490d891cb5c20561d2f41766464c636dab0611691f98f2d1c5cf593c6c9ec6`;
  registry manifest `aab35d41807a642d7e2eb156a50e1ffce479c9a3161ac59d0db2663add96ebdc`;
  generated Find payload `c0a65523c012b1621cdd07cc0a8d5f6c0f2d69cdf50bb3631f85805a55ca3602`;
  final receipt `80825945c94d6df869165a2f79fe78a07321778b6fa42f70336c2c7a7842a428`.

Final handoff contract:
- Source roots inspected: copied Find source/spec, registry manifest/generated
  output/changelog, exact benchmark and receipts, Vision, and Plate UI doctrine.
- Candidate count and top recommendation: four; merge the complete family into
  `find.tsx`.
- Cleanup counts: delete 1, merge 1, simplify 3 oracles, keep 1 runtime design,
  reject 3, split/defer/plan 0.
- Agent-navigation score changes: two source files and two proof inputs became
  one source file and one proof input; product owner count remains one.
- Packets applied with keep/revert/quarantine result: one packet, keep.
- Proof commands/source audits: recorded in Verification evidence.
- Hot-owner pre/post scale receipts: `single-file-before.json` and
  `single-file-final.json`; both pass zero hard guards.
- Rejected/deferred candidates: keep split, promote package API, and remove the
  runtime rejected; nothing deferred.
- Needs-review list: none.
- Residual risks: relative one-packet publication latency is noisy and makes no
  speedup claim; absolute scale and deterministic work are green.
- Next owner and exact first command/file: none. If Replace becomes a real job,
  start with `best-api audit find-replace` against `find.tsx`; do not reopen a
  second file by default.

Timeline:
- 2026-08-31T12:46:50.456Z Architecture-cleanup goal plan created.
- 2026-08-31 Previous receipt rejected because its `find-plugin.ts` hash no
  longer matched current source; fresh exact baseline passed with zero hard
  guards and `scales-through-stress`.
- 2026-08-31 Single-file owner implemented. First final benchmark result was
  0.146 ms above the 16.67 ms guard; the one allowed matched confirmation passed
  at 14.974 ms with zero hard guards.
- 2026-08-31 Registry, type, static, and five-run Browser proof passed; packet kept.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout complete; checker is the final gate. |
| Where am I going? | Final response. |
| What is the goal? | One copied Find source file with unchanged behavior and preserved scale. |
| What have I learned? | The runtime is a valid private concept, but not a valid second file. |
