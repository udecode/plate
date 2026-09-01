# collapse find index into find owner

Objective:
Remove the shallow Find index module while preserving behavior and scale; done
when focused tests, registry proof, source audit, and the exact scalability
rerun pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-collapse-find-index-into-find-owner.md

Template:
docs/plans/templates/architecture-cleanup.md

Primary template:
docs/plans/templates/architecture-cleanup.md

Applied packs:
- performance-observability (docs/plans/templates/packs/performance-observability.md)

Linked plans:
- None.

Cleanup source:
- type: user-selected local architecture cleanup
- id / link: `apps/www/src/registry/components/editor/find-index.ts`
- title: collapse Find index into its canonical owner
- requested surface: copied Find registry implementation and its benchmark proof
- cleanup intent: delete the shallow generic helper file while retaining the measured keyed index
- acceptance criteria: one meaningful registry-local owner, no `find-index.ts` references, unchanged Find behavior, zero benchmark hard guards, and current generated registry output

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
- initial confidence / cleanliness score: 96% review confidence; file boundary scored 2.0/10
- improvement loop: keep only if ownership and navigation improve without scale or behavior regression
- final score / loop closure: 98% cleanliness confidence; packet kept after
  source-hash-bound benchmark, focused behavior, registry, static, and Browser
  proof

Completion threshold:
- `find-index.ts` is deleted; its generic exports and registry entry have zero
  references; the keyed index is private to the canonical Find owner; focused
  Find tests pass; registry generation is current; the exact scalability
  harness reports `scales-through-stress` with zero hard guards on the final
  production source; and the final source audit shows no public Plate/Plite API.
- Architecture-cleanup closure is legal only when source map, deslop inventory,
  candidate matrix, agent-navigation score, packet ledger, proof evidence,
  changed list, and final handoff are complete or explicitly N/A, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-collapse-find-index-into-find-owner.md`
  passes.

Verification surface:
- Pre/post benchmark:
  `TRANSIENT_PROJECTION_BENCH_STRICT=1 bun --expose-gc --preload ./config/plite-source-aliases.ts packages/platejs/scripts/transient-projection/benchmark-scalability.ts --output=<receipt>`.
- Correctness: `bun test apps/www/src/registry/components/editor/find.spec.tsx`.
- Registry: `pnpm --filter www build:registry`.
- Static proof: scoped `rg` for `find-index`, `createFindMatchIndex`,
  `getFindMatchesAtPath`, registry ownership, and generated output.
- Browser: exact Find demo interaction if the registry build exposes a runnable
  demo; otherwise record the existing behavior test as the owning proof and the
  exact browser blocker.

Constraints:
- Do not split files because they are large.
- Prefer delete, merge, inline, or simplify over extraction when that improves
  comprehension.
- Do not change public API, product UX, or behavior under a cleanup packet.
- Focused proof comes before broad proof.
- No dirty speculative work at handoff: keep, revert, or quarantine.

Boundaries:
- Source of truth: `find.tsx`, `find-index.ts`, `find.spec.tsx`,
  `registry-features.ts`, transient-projection benchmark source/artifacts,
  Find docs, root/detail Vision, and `.agents/AGENTS.md`.
- Allowed edit scope: copied Find registry source, its registry manifest and
  generated registry output, benchmark imports/production exercise, focused
  tests/oracles, this plan, and generated artifacts.
- Plite / Plate boundary: Find remains copied Plate registry product behavior;
  no Plite change.
- Public API boundary: no Plate or Plite public API; any exported registry-local
  symbol exists only to connect the copied Find UI to its local owner.
- Browser surface: Find demo behavior only; no styling or UX change.
- Package/API surface: no package export or package dependency change.
- Non-goals: no Find UX change, no Replace implementation, no search algorithm
  change, no debounce, no public index/cache API, no unrelated cleanup.

Output budget strategy:
- Read exact Find, registry, benchmark, and generated-manifest files only; cap
  searches with scoped roots and `head`; store benchmark detail in artifacts
  and inspect summaries instead of streaming raw samples.

Blocked condition:
- Stop only if the production-path benchmark cannot exercise the moved owner,
  registry generation cannot complete after one evidence-backed repair, or the
  post-packet benchmark/test result fails twice with no narrower autonomous fix.

Cleanup state:
- task_type: architecture-cleanup
- task_complexity: normal, scale-sensitive narrow packet
- current_phase: closeout
- current_phase_status: complete
- next_phase: final response
- goal_status: complete after mechanical plan check

Current verdict:
- verdict: delete the shallow module; keep the algorithm private inside the meaningful registry-local Find plugin/result owner
- cleanliness confidence: 98% after implementation and proof
- next owner: none for this Find packet
- keep / revert / quarantine call: keep
- reason: runtime, invalidation, query publication, projection, and their benchmark now share one owner; React presentation stays in the copied family file

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-collapse-find-index-into-find-owner.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Accepted cut recorded: delete the file, keep the index, use one deeper registry-local Find owner, preserve behavior/scale, add no public API. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| `architecture-cleanup` loaded | yes | `.agents/skills/architecture-cleanup/SKILL.md` read completely. |
| Active goal checked or created | yes | Goal created for this exact plan and completion threshold. |
| Source of truth read before analysis | yes | Root/detail Vision, `.agents/AGENTS.md`, Find source/tests/docs/registry, and benchmark source/artifact inspected. |
| VISION fit gate read | yes | Registry-local one-owner behavior and deep-module laws reaffirm the cut; no durable doctrine change. |
| Plite / Plate boundary selected | yes | Copied Plate registry owner; Plite remains unchanged. |
| Cleanup surface selected | yes | `find-index.ts`, canonical `FindResultOwner`, registry manifest/output, benchmark and focused test. |
| Non-goals recorded | yes | Boundaries section records UX, Replace, matcher, public API, and unrelated cleanup exclusions. |
| Output budget strategy recorded | yes | Exact-file reads, scoped searches, capped output, benchmark artifacts. |
| Implementation authority decided | yes | User said `go`; narrow behavior-neutral cleanup is authorized. |
| Proof strategy selected | yes | Exact pre/post benchmark, focused Find test, registry generation, source audit, and browser gate. |
| Runtime scale applicability resolved | yes | Hot per-match/per-leaf projection; performance pack applied and exact pre/post receipt required. |
| Performance pack selected | yes | `performance-observability` materialized into this plan. |
| User-facing operation and runtime owner identified | yes | Find query publication and per-leaf decoration projection; current owner is `FindResultOwner` plus its keyed path index. |
| Scale variables and cohorts fixed | yes | Leaves and matches vary independently: normal 100/100, large 1k/1k, stress 1/10k, pathological 10k/10k from the owning harness. |
| Budget frozen before target measurement | yes | Existing hard guards remain fixed: zero failures and `scales-through-stress`; each post-packet Find cohort must stay under 16.67 ms and at or below `max(pre p95 + pre packet noise, pre p95 * 1.25)`; a breach gets one matched confirmation rerun before revert/quarantine. |
| Baseline and target probe selected | yes | Baseline is current source-hash-bound keyed helper; target is the same algorithm private to the actual Find behavior owner and exercised through the production module. |
| Correctness guard selected | yes | Three focused `find.spec.tsx` behavior tests plus benchmark projected-count assertions. |
| Production detector decision recorded | no | N/A: local copied UI contains no production telemetry; source-hash-bound deterministic harness has no protected data. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is recorded above.
- [x] Source map records largest files, owner files, package exports, public /
      private boundaries, tests, and proof owners for the surface below.
- [x] Deslop inventory records wrappers, pass-through modules, duplicate
      helpers, vague names, stale compatibility, over-broad barrels, orphan
      tests, and stale source-owner oracles below.
- [x] Candidate matrix ranks four candidates; the prompt names one 26-line
      file, so the five-candidate broad-surface minimum is N/A.
- [x] Every candidate has a decision: delete, merge, inline, simplify, split,
      keep, defer, reject, or plan.
- [x] Every candidate records an agent-navigation score: files-to-read,
      owners-touched, proof clarity, public/private clarity, and net effect.
- [x] Anti-confetti rule applied: no split is accepted without durable owner,
      stable name, focused proof, and lower future navigation cost.
- [x] Merge/delete/inline are considered as seriously as extraction.
- [x] VISION fit is recorded; current deep-module and copied-registry family
      doctrine settles the target, so no Vision edit is needed.
- [x] Implementation packet is behavior-neutral, public-API-neutral, narrow,
      reversible, and has focused test, benchmark, registry, static, and Browser proof.
- [x] The hot-owner packet has a frozen pre-packet scale receipt and exact
      post-packet production rerun plus correctness guard; paper complexity or
      "benchmark later" did not justify keep.
- [x] The implementation packet ended `keep` after all named gates passed.
- [x] Source-owner oracle repaired: registry metadata/generated payload,
      changelog target files, benchmark fingerprints, and benchmark execution
      point at `find-plugin.ts`; behavior tests remain location-neutral.
- [x] Focused Find tests and benchmark ran before registry/browser breadth.
- [x] Broad proof after import churn: registry build, changelog check, registry
      source check, final Browser replay, and focused lint passed.
- [x] Workspace authority recorded: every command below ran in
      `/Users/zbeyens/git/plate-2` unless the evidence names `apps/www`.
- [x] Output budget discipline followed: exact roots, capped searches, compact
      `jq` summaries, and JSON benchmark artifacts were used.
- [x] Performance pack: `before.json` captured the source-hash-bound current
      owner before implementation.
- [x] Performance pack: `owner-final.json` measures actual
      `FindResultOwner.search()` publication and `matchesAt()` projection with
      matcher reads, index builds, publications, lookups, and match counts.
- [x] Performance pack: normal, large, stress, and pathological cohorts cover
      independent leaf/match growth.
- [x] Performance pack: artifacts record warm p50/p75/p95, samples, warmups,
      packet noise, memory cardinality, and deterministic work; cold duration
      is N/A because the harness has no cold row and this move adds no startup
      work.
- [x] Performance pack: N/A disposable target; the selected target moves the
      identical proven algorithm and the final harness directly executes its
      production owner.
- [x] Performance pack: before/final artifacts preserve matched machine,
      fixture, cohorts, strict frame budget, source identities, and correctness
      assertions; final proof adds the actual owner execution path.
- [x] Performance pack: fan-out inspected; publication remains one matcher read
      plus one index build, projection one lookup per text leaf, subscriptions
      and retained work unchanged, and pagination is N/A.
- [x] Performance pack: no new pool, cache, index, projection, store, or
      scheduler was added; the existing measured index moved to its owner.
- [x] Performance pack: N/A database transaction rule; no database work.
- [x] Performance pack: artifacts contain synthetic text/cardinality only and
      no credentials, headers, tenant/person identifiers, or protected data.
- [x] Performance pack: deterministic benchmark extended to exercise the
      installed `FindPlugin` and actual `FindResultOwner` instead of exporting
      the index for proof.
- [x] Performance pack: no budget override was used.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the command, proof, source audit, or artifact check named in this plan | Passed: focused tests, final strict benchmark, registry generation/source/changelog checks, static audit, lint, and Browser replay. |
| Source map complete | yes | Record current owners, largest files, exports, tests, and proof owners | Source map records old and final owners plus proof surfaces. |
| Deslop inventory complete | yes | Record concrete stale/shallow/duplicated/over-split surfaces | Inventory isolates the 26-line generic pseudo-owner and stale proof/registry links. |
| Candidate matrix complete | yes | Rank candidates with facts, action, owner, proof, and decision | Four narrow candidates resolved; smaller named surface makes five-row minimum N/A. |
| Agent-navigation score complete | yes | Record before/after files-to-read / owner / proof clarity changes | Runtime/perf understanding moved from two files/two claimed owners to one `find-plugin.ts` owner; UI remains one `find.tsx`; end-to-end stays two files with explicit ownership. |
| Anti-confetti gate | yes | Prove accepted splits reduce navigation cost or record no split accepted | File count stays two, but shallow helper is replaced by a deep runtime owner containing plugin, result lifecycle, private index, and its direct benchmark path. |
| Delete / merge / inline gate | yes | Record considered simplifications and why accepted/rejected | Deleted `find-index.ts`, merged its algorithm into the runtime owner, rejected all-inline because it couples Node proof to client UI aliases. |
| VISION fit gate | yes | Confirm fit to VISION.md or record sync-vision/stop decision | Existing deep-module, one-plugin-owner, and copied registry family doctrine fully covers the result; no Vision change. |
| Implementation packet gate | yes | For every code packet, record keep/revert/quarantine and focused proof | One packet kept after all proof; no production artifact remains reverted or quarantined. |
| Hot-owner scale preservation | yes | Compare matched pre/post normal/large/stress cohorts with frozen budget, deterministic cost, timing/noise, source identities, and correctness guard | `before.json` and `owner-final.json`; zero hard guards, linear counters, all final owner rows under 16.67 ms, focused tests green. |
| Source-owner oracle gate | yes | Repair or add tests/oracles when ownership moves, or N/A | Benchmark measured inputs/execution, registry manifest/payload, and changelog target now name `find-plugin.ts`; behavior tests stayed location-neutral. |
| Public API / behavior safety gate | yes | Prove no public API/product behavior changed, or route to plan owner | No package export; private index has zero external references; 3 tests and exact browser interaction passed. |
| Package/API proof | no | Run relevant package/export/type/build proof when package boundaries changed, or N/A | N/A: only an internal benchmark script changed under `packages/platejs`; no shipped package source, export, dependency, or changeset. |
| Browser proof | yes | Run Browser/Playwright proof when visible behavior changed, or N/A | Fresh `/blocks/find-demo`: Mod+F, query `match`, 2 highlights/1 active, Enter 1->2->1, Escape closes, focus returns, zero console warnings/errors. |
| Final lint/check | yes | Run focused/broad lint/typecheck/test appropriate to touched files | Focused Ultracite, 3 Find tests, registry source check, registry build, and changelog check passed. App-wide `tsc` was attempted and has four unrelated existing errors with no Find diagnostic. |
| Output budget discipline | yes | Verify no unbounded high-volume output was streamed, or record recovery | Reads/searches were scoped; large benchmark data stayed in artifacts; registry output was command-owned and capped. |
| Timed checkpoint | no | If duration was requested, keep improving until elapsed, then finish current packet cleanly; otherwise N/A | N/A: no duration requested. |
| Final handoff contract | yes | Fill changed list, cleanup counts, proof, needs-review, residual risks, and next owner | Completed below. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-31-collapse-find-index-into-find-owner.md` | Pass: `[autogoal] complete`. |
| Pre-acceptance scale proof | yes | Record executable current-versus-target comparison across applicable cohorts, frozen budget, deterministic cost, timing/noise, source identities, and correctness result | Baseline frozen before edit; final actual-owner harness records four cohorts, strict budget, counters, fingerprints, and assertions. |
| Warm latency budget | yes | Prove the changed operation stays within its warm percentile budget using the owning harness | Worst final Find row: pathological publication p95 16.465 ms; projection p95 5.719 ms; both below 16.67 ms. |
| Large/stress scaling | yes | Prove cost stays within the declared growth/budget across applicable large, stress, and pathological cohorts | All publication/projection rows green; pathological work is 1 matcher read + 10k builds + 10k lookups, not 100m comparisons. |
| Cold and failure paths | no | Measure cold behavior and prove failure handling remains owned | N/A: file ownership move adds no startup/failure path; existing search exception ownership and focused behavior tests are unchanged; harness has no cold row. |
| Payload and fan-out | no | Record payload bytes plus query/render/subscription/cardinality evidence | N/A payload/network; artifacts record match/leaf cardinality, one result publication, one lookup per text leaf, and unchanged subscription lifecycle. |
| Production-path rerun | yes | Rerun the same cohort/budget contract on final production path and source identity | `owner-final.json` imports `FindPlugin`/`getFindOwner`, calls `search()` and `matchesAt()`, and fingerprints final `find-plugin.ts`/`find.tsx`. |
| Correctness guard | yes | Run selected behavior/native/data-integrity guard on measured final path | Final `bun test .../find.spec.tsx`: 3 pass, 0 fail; benchmark projected counts equal matcher counts. |
| Before/after receipt | yes | Record comparable baseline and final evidence | `before.json` records the pre-move exact helper; `owner-final.json` records final actual-owner publication/projection with the same cohorts, machine, strict budget, and linear work law. |
| Detector and privacy | no | Prove owning runtime detector covers changed operation without protected data, or record N/A | N/A: no production detector/telemetry; deterministic artifacts use synthetic text and cardinalities only. |
| Performance regression check | yes | Run deterministic performance harness and relevant checks in owning workspace | Exact strict transient-projection command passed with `scales-through-stress` and zero hard guards. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | goal created; skills, methodology, Vision, policy, and target source read | source map |
| Source map | complete | source, consumer, registry, docs, test, and benchmark owners recorded | deslop inventory |
| Deslop inventory | complete | one shallow generic helper and its proof/registry coupling isolated | candidate matrix |
| Candidate matrix | complete | four narrow candidates ranked; deeper registry-local plugin owner selected | cleanup packets / owner routing |
| Cleanup packets / owner routing | complete | `find-index.ts` deleted; runtime moved to `find-plugin.ts`; index private; registry/benchmark owners updated | verification |
| Verification | complete | focused tests/lint, actual-owner benchmark, registry/changelog/source checks, static audit, and Browser replay green; broad tsc failure proven unrelated | closeout |
| Closeout | complete | plan and final handoff filled; only mechanical plan check remains | final response |

Candidate matrix:
| Rank | Strength | Candidate | Files | Facts | Navigation score | Recommendation | Owner | Proof | Decision |
|------|----------|-----------|-------|-------|------------------|----------------|-------|-------|----------|
| 1 | Strong | Delete `find-index.ts`; move plugin runtime, result owner, and private keyed index into `find-plugin.ts`; leave React presentation/hooks in `find.tsx` | `find.tsx`, `find-index.ts`, proposed `find-plugin.ts`, registry manifest, benchmark | Index has one production owner; plugin/result lifecycle is already coherent; pure TS module remains directly benchmarkable without app UI aliases | Before: two files and a fake helper owner for runtime; after: one runtime owner plus one UI owner, one file per bug class, proof imports the runtime owner; easier | merge shallow helper plus split meaningful runtime owner | architecture-cleanup with Plate UI topology | pre/post exact benchmark, focused Find tests, registry build, source audit | split |
| 2 | Worth exploring | Inline the index into `find.tsx` and delete all sibling source | `find.tsx`, `find-index.ts`, benchmark | Lowest file count, but the Node benchmark would import client UI, Lucide, and `@/` app aliases or require a benchmark-only export/runner change | One file to read, but mixed UI/runtime proof and benchmark coupling make owner/proof clarity worse | Reject file-count win because it makes the production proof boundary dishonest | plate-ui | source dependency trace and benchmark runner imports | reject |
| 3 | Strong | Keep current `find-index.ts` | current two source files | Algorithm and receipt are green, but `RangedValue` plus two exports provide no independent product job | Two files for one runtime behavior; public/private intent unclear; unchanged | Delete the pseudo-owner while preserving its algorithm | architecture-cleanup | consumer trace | delete |
| 4 | Strong | Promote the path index into public Plate or Plite API | package exports plus registry consumer | No second product consumer, no substitution job, and Find is copied product behavior | More owners, more API, worse navigation and compatibility cost | Reject completely | best-api only if future independent consumers appear | terminal-consumer audit | reject |

Source map:
- Runtime owner: `FindResultOwner` and local `FindPlugin` in `find-plugin.ts`; the
  former owns query snapshots, per-match subscriptions, ordered results,
  active selection, rescans, and the keyed anchor-path projection.
- Presentation owner: `FindBar`, `FindLeaf`, `useFindController`, and `FindKit`
  in `find.tsx`.
- Shallow module: `find-index.ts` is 26 lines and exports two generic functions
  around one `Map` field consumed only by `FindResultOwner` in production.
- Registry owner: `registry-features.ts` copies `find.tsx` and `find-plugin.ts`;
  generated registry files mirror that manifest.
- Public boundary: no package barrel or docs page exports the index helpers;
  Find docs teach only `FindKit` and `useFindController`.
- Behavior oracle: `find.spec.tsx` covers inline-descendant matching,
  navigation/rescan, accessibility, focus, and non-persistence.
- Scale oracle: `benchmark-scalability.ts` owns normal, large, stress, and
  pathological matcher/projection rows and source fingerprints.

Deslop inventory:
- wrappers/pass-through: `find-index.ts` is a shallow data-structure wrapper.
- duplicate helpers: none in production; the benchmark is proof, not reuse.
- vague names/generality: `RangedValue` and generic `TMatch` claim reuse that
  terminal-consumer search does not show.
- stale compatibility/aliases: none.
- over-broad barrels/public exports: none; keep the replacement registry-local.
- orphan tests: none; current Find tests assert behavior rather than filenames.
- stale source-owner oracle: repaired; the registry manifest and benchmark
  fingerprint name `find-plugin.ts`, the meaningful runtime owner.
- shadcn workflow: N/A; no primitive, variant, markup, or style changes.
- registry changelog: N/A; installed behavior and public install item remain
  identical, with only an internal copied-source filename replacement.

Packet ledger:
| Packet | Action | Owner | Files | Proof | Scale receipt / N/A | Result | Next |
|--------|--------|-------|-------|-------|---------------------|--------|------|
| Find owner collapse | Delete shallow index file; split plugin/result runtime from React presentation; update registry and benchmark ownership | copied Find registry component | `find.tsx`, `find-index.ts` -> `find-plugin.ts`, registry metadata/output, benchmark | focused Find tests, exact benchmark, registry build/source/changelog, static audit, Browser | before `before.json`: zero hard guards, combined indexed p95 0.178/0.866/5.040/11.688 ms; final `owner-final.json`: zero hard guards, actual-owner publication p95 0.079/0.658/5.403/16.465 ms and projection 0.110/0.551/0.002/5.719 ms; pathological flat 3574.994 ms and 100m comparisons | keep | no further Find cleanup |

Cleanup counts:
- delete: 1 shallow module
- merge: 1 keyed-index algorithm into its runtime owner
- inline: 0 accepted; one all-inline candidate rejected
- simplify: 1 generic two-helper contract reduced to a private feature function
- split: 1 meaningful runtime/presentation boundary
- keep: 1 scale-critical keyed algorithm
- defer: 0
- reject: 2 candidates
- plan: 0

Changed list:
- code/runtime/API: added registry-local `find-plugin.ts`; reduced `find.tsx` to
  controller hook/presentation/kit; deleted `find-index.ts`; updated Find
  registry metadata and generated payload; no Plate/Plite public API.
- tests/oracles: transient-projection benchmark now installs `FindPlugin` and
  exercises actual `FindResultOwner.search()`/`matchesAt()`; existing 3-test
  behavior oracle unchanged; existing changelog target regenerated.
- docs/plans: this plan plus source-hash-bound `before.json` and
  `owner-final.json` receipts.
- skills/workflow: none changed; architecture-cleanup, benchmark, Plate UI,
  registry changelog, and Browser doctrine applied.
- reverted/quarantined: disposable benchmark-only direct-index probe removed;
  no production change reverted or quarantined.

Needs review:
- None within the Find packet. The existing app-wide TypeScript failures remain
  with their current owners and contain no Find diagnostic.

Open risks:
- None within the Find packet. The app-wide TypeScript gate remains red on four
  unrelated existing diagnostics; this limits the claim to the focused Find,
  registry, benchmark, and Browser proof recorded below.

Verification evidence:
- command: `bun test apps/www/src/registry/components/editor/find.spec.tsx`
  in `/Users/zbeyens/git/plate-2` -> pre-packet 3 pass, 0 fail.
- command: exact strict transient-projection benchmark writing
  `docs/plans/artifacts/find-owner-cleanup/before.json` ->
  `scales-through-stress`, zero hard guards, source fingerprints recorded.
- artifact: `before.json` -> normal 0.178 ms p95, large 0.866 ms,
  stress 5.040 ms, pathological 11.688 ms; rejected flat pathological
  control 1756.547 ms and 100,000,000 comparisons.
- artifact: `owner-final.json` -> actual Find owner publication p95
  0.079/0.658/5.403/16.465 ms and projection p95
  0.110/0.551/0.002/5.719 ms across normal/large/stress/pathological;
  pathological flat control 3574.994 ms; zero hard guards and
  `scales-through-stress`.
- command: final focused Ultracite + Find test + registry source check -> pass;
  3 tests, 0 failures.
- command: `pnpm --filter www build:registry` and changelog `--check` -> pass;
  generated Find payload contains only `find.tsx` and `find-plugin.ts`.
- source-audit: deleted file and old helper names have zero live source,
  registry, generated payload, or benchmark references; index builder appears
  only as a private function and owner call in `find-plugin.ts`.
- browser: fresh `/blocks/find-demo` on a restarted dev server -> query `match`
  produced 2 highlights and 1 active result; Enter advanced and wrapped;
  Escape closed and restored editor focus; zero console warnings/errors.
- command: app-wide `tsc --noEmit -p tsconfig.json` -> unrelated failure in
  `src/lib/source.ts`, Plate live/static node generic constraints, and Plite
  inactive selection; no Find diagnostic.

Final handoff contract:
- Source roots inspected: Find registry source/test/docs/metadata/generated
  payload, transient-projection benchmark/artifacts, Vision, agent rules, and
  existing changelog owner.
- Candidate count and top recommendation: four; delete the shallow helper and
  replace it with one deep registry-local plugin/result runtime owner.
- Cleanup counts: delete 1, merge 1, simplify 1, split 1, keep 1, reject 2;
  inline/defer/plan 0.
- Agent-navigation score changes: runtime/perf moved from two files and two
  claimed owners to one `find-plugin.ts`; UI stays in one `find.tsx`; end-to-end
  remains two files with explicit owner names and direct proof.
- Packets applied with keep/revert/quarantine result: one packet kept; no
  production revert/quarantine.
- Proof commands/source audits: focused lint/test, strict actual-owner
  benchmark, registry build/source/changelog, zero-stale-symbol audit, and
  fresh Browser replay all passed.
- Hot-owner pre/post scale receipts: `before.json` and `owner-final.json` as
  detailed above; final decision `scales-through-stress`, zero hard guards.
- Rejected/deferred candidates: rejected all-inline mixed owner and public
  Plate/Plite index API; deferred none.
- Needs-review list: none for Find.
- Residual risks: app-wide TypeScript gate is red on four unrelated existing
  diagnostics; the focused Find surfaces are green.
- Next owner and exact first command/file: no further Find owner; after the
  unrelated TypeScript owners are repaired, rerun
  `pnpm --filter www exec tsc --noEmit -p tsconfig.json`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|---|---:|---|---|
| Cross-run relative timing was noisy while the benchmark still imported the helper | 1 | Remove the proof-only export and measure the actual installed owner | Final owner benchmark passed all four cohorts under 16.67 ms with zero hard guards. |
| Focused Ultracite command used root-relative paths from `apps/www` | 1 | Rerun from repository root | Passed on all four changed source files. |
| App-wide TypeScript check reported unrelated current-tree failures | 1 | Keep Find scope and use focused lint/test/registry/browser proof | No Find diagnostic; exact unrelated files recorded above. |

Timeline:
- 2026-08-31T11:38:17.478Z Architecture-cleanup goal plan created.
- 2026-08-31 Prompt requirements, boundaries, scale contract, and proof strategy frozen before implementation.
- 2026-08-31 Pre-packet correctness passed 3/3 Find tests; exact strict benchmark passed with zero hard guards and current source fingerprints.
- 2026-08-31 Deleted the shallow file, moved runtime/index ownership into `find-plugin.ts`, and rewired registry/benchmark ownership.
- 2026-08-31 Final actual-owner benchmark, focused tests/lint, registry build/source/changelog, static audit, and fresh Browser replay passed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after green final proof |
| Where am I going? | Mechanical plan check, goal completion, final response |
| What is the goal? | Delete `find-index.ts` without deleting its scale-critical keyed index or changing Find behavior/API. |
| What have I learned? | The benchmark must execute the real `FindResultOwner`; proof-only helper exports are architecture debt too. |
| What is done? | Shallow file deleted, private index colocated, runtime/presentation owner split established, registry/generated output current, all scoped proof green. |
