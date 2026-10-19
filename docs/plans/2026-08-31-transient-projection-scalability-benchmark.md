# Transient projection scalability benchmark

Objective:
Make transient projection scale across every applicable lane; done when all
curves and hard-counter guards pass with an evidence-backed scaling verdict.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-31-transient-projection-scalability-benchmark.md

Template:
docs/plans/templates/benchmark.md

Primary template:
docs/plans/templates/benchmark.md

## Benchmark Source

- request: measure the new transient projection layer first, then fix and
  optimize every proven owner; API breaks and rearchitecture are authorized
- scope: Plite Decoration and Widget projection, Plate plugin lowering, Yjs
  remote-cursor cache and React adapters, copied Find lowering, retained
  selection, floating geometry, examples, teardown, and stress
- invocation: $benchmark transient projection scalability
- candidate-identity: ref: direct next checkout at base
  377a77a537971b793a4ddbb34cc13797fdfeee15 plus the artifact measured-input
  fingerprint
- plate-main-identity: ref: origin/main=cce36d378b2f1e5c775dafe1a67c2215165c982c
- plite-identity: fingerprint: current Plite source in the artifact manifest
- slate-identity: N/A: inapplicable because no raw Slate substrate changed
- named-symptom: prove bounded work through 1,000 remote cursors, 10,000
  Widgets, and 100k text with 10k Find matches
- final-artifacts: artifact: docs/plans/artifacts/transient-projection-scalability/node-benchmark.json

First checkpoint:
- Capture every requirement and all nine default lanes before measurement.
- Freeze candidate, baseline, fixture, action, host, correctness, and artifact
  identities.
- Stop later lanes at the first conclusive cause, fix that owner, rerun the
  exact red lane, then resume breadth.

Timed checkpoint:
- requested duration: none
- semantics: N/A: no duration or hard stop requested
- start / deadline: N/A: no timed checkpoint
- final loop closure: every applicable lane closes before handoff

Completion threshold:
- Timing rows use at least 30 warm samples; p99 appears only on 100-sample rows.
- Cursor cohorts cover 1, 10, 100, and 1,000 clients.
- One metadata or selection update performs one decode, zero or one resolution
  pass, at most two endpoint conversions, one keyed projection, and one keyed
  runtime wake independent of total cursor count.
- Membership changes publish ids once. Ordinary editor commits perform zero
  Yjs endpoint resolutions.
- Widget updates resolve and wake one item with zero unrelated wakes through
  10,000 items.
- Find covers 100k text and 10k matches. Indexed projection performs O(leaves +
  matches) work and remains below the 16.667 ms interaction budget.
- Teardown retains zero listeners, registrations, or subscriber wakes after a
  1,000-cursor cleanup.
- Exact package, type, Browser, example, geometry, and strict Plite gates pass.
- Benchmark validation with --complete and the Autogoal checker pass.

Verification surface:
- benchmark: the registered transient projection runner and the artifact above
- correctness: Plite projection contracts, Yjs focused and partition tests,
  copied Find tests, type inference, public import smoke, and registry parity
- Browser: the five-route transient geometry matrix, all Yjs examples, the
  exact collaboration lifecycle, and an in-app Browser replay
- closure: pnpm check:plite:dev followed by pnpm check:plite on a stable checkout

Constraints:
- Correctness and native editing behavior outrank metric movement.
- Do not hide latency with debounce, delayed work, changed fixtures, or reduced
  DOM.
- Add no public cursor package, public mutation store, or compatibility layer
  without an independent current user job.
- Fix the durable owner, rerun its exact red lane, then resume breadth.
- Do not commit, push, open a PR, publish, or release.
- Work directly in this checkout; do not create a worktree.

Boundaries:
- allowed: Plite React projection internals, Plate plugin and Yjs adapters,
  copied registry UI, examples, docs, tests, benchmark target, generated
  registry output, changeset, and required agent methodology repair
- non-goals: Replace, Comments, Suggestions, DnD architecture, unrelated
  product work, commit, push, PR, or release

Output budget strategy:
- Save raw samples and fingerprints in the JSON artifact.
- Keep this plan to decisions, percentile summaries, counters, proof commands,
  and failure history.

Blocked condition:
- Stop strict closure when another writer mutates monitored source. Resume only
  after that writer is idle and a fresh fingerprint stays stable.

## Comparison Signature

| Field | Candidate | Baseline | Comparable evidence |
|---|---|---|---|
| ref / dirty fingerprint | direct next base 377a77a5 plus measured-input hashes | immutable origin/main cce36d37 | artifact: node-benchmark.json sourceIdentity |
| lockfile / package manager | pnpm 9.15.0; candidate lockfile hash in manifest | pnpm 9.15.0; main lockfile hash recorded | artifact: node-benchmark.json sourceIdentity |
| build mode / host / port | current source; www dev at localhost:3000 | immutable main dev host at localhost:3100 | artifact: plan host ledger and node-benchmark.json environment |
| browser / machine / viewport / DPR | Codex Browser; macOS arm64 Apple M5 Max; 1422x800 DPR 1.8 | same machine and Browser | artifact: plan Browser ledger and node-benchmark.json environment |
| route / fixture / document / plugins | two local providers, two editors, three Y.Docs | old one-editor WebRTC fixture | artifact: source hashes prove product fixtures differ, so timing comparison is rejected |
| setup / action / DOM strategy | edit Ada, observe Lin, cursor label, full DOM | historical fixture cannot perform the same action | artifact: current smoke is correctness-only, not a main timing claim |
| warmups / samples / interleave order | 20 warmups; five packets of 20; five pathological samples | causal controls use the same current fixture and schedule | artifact: node-benchmark.json config and raw samples |

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured | yes | Measurement preceded optimization; full repair authority was recorded later. |
| Timed checkpoint parsed | no | N/A: no duration requested. |
| Benchmark methodology read | yes | Benchmark and Autogoal sources were read completely. |
| Active goal created | yes | One-shot scalability goal owns this plan. |
| Candidate and baseline identities recorded | yes | Exact refs and content hashes are above and in the artifact. |
| Target discovery complete | yes | Registry validates 45 targets; the focused target fills the real owner gap. |
| Correctness oracle identified | yes | Package, Browser, geometry, lifecycle, and teardown oracles are named above. |
| All default lanes inventoried | yes | Nine ordered rows below; Slate alone is inapplicable. |
| Browser strategy selected | yes | In-app Browser plus bounded Chromium proof. |
| Mutation authority recorded | yes | Runtime/API rearchitecture allowed; git and release mutation not allowed. |

Work Checklist:
- [x] Capture every explicit requirement, scope boundary, and completion gate.
- [x] Measure before optimizing.
- [x] Reject the incomparable current-versus-main timing claim.
- [x] Prove TPROJ-001 and TPROJ-002 with causal controls.
- [x] Run Best API plus Plite and Plate boundary review.
- [x] Hard-cut the broad React cursor-list and public cursor-source APIs.
- [x] Add the private keyed projection mutation kernel.
- [x] Make Yjs awareness, Widget, and Decoration publication keyed and lazy.
- [x] Replace copied Find nested filtering with one path index.
- [x] Rerun exact benchmarks and correctness before resuming breadth.
- [x] Prove mount, trusted editing, examples, geometry, teardown, and stress.
- [x] Repair the Regression workflow exposed by a failed-fix replay.
- [x] Regenerate registry and skill mirrors and prove zero stale APIs.
- [x] Record the final strict command as the last read-only operation so no
      later plan edit invalidates its fingerprint.
- [x] Final handoff reports identities, causes, metrics, proof, and residual
      limits.

## Benchmark Lane Table

| Order | Lane | Applies | Status | Evidence | Next |
|---|---|---|---|---|---|
| 1 | source-and-host-readiness | yes | complete | 45 targets validated; refs, hosts, fixtures, correctness, and fingerprints recorded. | none |
| 2 | current-vs-main-product-smoke | yes | complete | Current two-peer route is healthy; main owns a different broken fixture, so timing comparison is rejected. | none |
| 3 | plate-vs-plite-decomposition | yes | complete | Target separates cache, keyed projection, Widget, matcher, and Find lowering. | none |
| 4 | owner-microbench-and-trace | yes | complete | TPROJ-001 and TPROJ-002 were proven, fixed, and exactly rerun. | none |
| 5 | product-mount-matrix | yes | complete | Package React/Yjs render contracts and browser route mounts pass. | none |
| 6 | trusted-editing-matrix | yes | complete | Retry-free selection, typing, reconnect, undo/redo, and geometry actions pass. | none |
| 7 | plite-vs-pinned-slate | no | N/A: inapplicable - no raw Slate substrate or comparable Slate projection layer changed | Boundary audit proves the work starts at Plite React and Plate integration. | none |
| 8 | example-breadth | yes | complete | All four Yjs browser rows and the five-route geometry matrix pass. | none |
| 9 | large-and-stress | yes | complete | 1,000 cursors, 10,000 Widgets, 100k text, 10k matches, zero-retention teardown, and full Chromium coverage are exercised. | final strict command after checkout freeze |

## Current Cause Checkpoint

- state: none
- cause-id: N/A: TPROJ-001 and TPROJ-002 are resolved in Cause History
- lane: N/A: no active red lane remains
- comparable-baseline: N/A: no active cause remains
- material-delta: N/A: final deltas are retained in Cause History and the metric table
- isolated-owner: N/A: both isolated owners are fixed
- causal-intervention: N/A: no intervention remains active
- correctness-guard-result: N/A: final correctness is recorded below
- fix-class: N/A: no active fix remains
- long-term-target: N/A: accepted targets are implemented
- decision-owner: N/A: no decision remains open
- layer-plan: N/A: Plite and Plate plans were applied
- compatibility-verdict: N/A: completed hard cuts are recorded below
- fix-owner: N/A: no implementation owner remains active
- benchmark-command: N/A: final command is recorded in Cause History
- benchmark-rerun: N/A: final command is recorded in Cause History
- benchmark-rerun-result: N/A: final results are recorded in Cause History
- correctness-command: N/A: final commands are recorded in Cause History
- correctness-rerun: N/A: final commands are recorded in Cause History
- correctness-rerun-result: N/A: final results are recorded in Cause History
- resume-lane: N/A: all applicable lanes are complete

## Cause History

| Cause ID | Lane | Decision | Fix Class | Long-Term Target | Decision Owner | Layer Plan | Compatibility Verdict | Fix Owner | Causal Evidence | Pre-Fix Correctness | Benchmark Command | Benchmark Result | Correctness Command | Post-Fix Correctness | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| TPROJ-001 | owner-microbench-and-trace | kept | runtime-architecture | private keyed per-cursor projection with no broad list, map, node, or source reread | best-api | plite-plan + plate-plan | hard-cut: broad React cursor list and public cursor source had no preserving hard law or production consumer | private Plite kernel plus Plate Yjs awareness, Widget, and plugin adapters | 1,000 projection wakes became 1; final keyed selection p95 is 0.585 ms | pass: 19 Plite Widget, 23 Yjs, and 3 Find tests were green before the fix | TRANSIENT_PROJECTION_BENCH_STRICT=1 bun --expose-gc --preload ./config/plite-source-aliases.ts packages/platejs/scripts/transient-projection/benchmark-scalability.ts --output=docs/plans/artifacts/transient-projection-scalability/node-benchmark.json | pass: zero hard guards and scales-through-stress | pnpm --filter plitejs exec vitest run --config ./vitest.config.mjs test/react/widget-layer-contract.test.tsx test/react/stable-id-mapped-source.test.ts test/react/keyed-projection-delta.test.ts && bun test --preload ./config/plite-source-test-setup.ts packages/platejs/test/yjs/awareness-contract.spec.ts packages/platejs/test/yjs/react-contract.spec.tsx && bun test apps/www/src/registry/components/editor/find.spec.tsx | pass: 27 Plite projection, 24 Yjs, and 3 Find tests | artifact: node-benchmark.json plus package and Browser proof |
| TPROJ-002 | owner-microbench-and-trace | kept | internal-implementation | build one path index per Find publication and perform one keyed lookup per leaf | benchmark | N/A: copied registry implementation has no layer API decision | N/A: public API and behavior remain unchanged | copied Find registry component | 100,000,000 comparisons became 10,000 index inserts plus 10,000 lookups; p95 fell from 1164.974 ms to 9.588 ms | pass: Find 3 tests were green before the fix | TRANSIENT_PROJECTION_BENCH_STRICT=1 bun --expose-gc --preload ./config/plite-source-aliases.ts packages/platejs/scripts/transient-projection/benchmark-scalability.ts --output=docs/plans/artifacts/transient-projection-scalability/node-benchmark.json | pass: zero hard guards and scales-through-stress | pnpm --filter plitejs exec vitest run --config ./vitest.config.mjs test/react/widget-layer-contract.test.tsx test/react/stable-id-mapped-source.test.ts test/react/keyed-projection-delta.test.ts && bun test --preload ./config/plite-source-test-setup.ts packages/platejs/test/yjs/awareness-contract.spec.ts packages/platejs/test/yjs/react-contract.spec.tsx && bun test apps/www/src/registry/components/editor/find.spec.tsx | pass: 27 Plite projection, 24 Yjs, and 3 Find tests | artifact: node-benchmark.json plus Find route proof |

## API and layer decision

Decision: do not add /cursor, platejs/cursor, a public keyed mutation store, or
another overlay manager. Yjs presence, inline range paint, and exact-view
geometry have different owners and lifetimes.

Before:

    const cursors = useYjsRemoteCursors(editor);
    const selectionSource = useYjsRemoteCursorDecorationSource(editor);

After:

    const clientIds = useYjsRemoteCursorIds(editor);
    const cursor = useYjsRemoteCursor(editor, clientId);
    const geometry = useYjsRemoteCursorGeometry(editor, clientId, {
      editableRef,
    });

The broad React cursor list and public cursor Decoration source are hard cuts.
The imperative aggregate snapshot remains an explicit caller-paid O(n) read.
The public Plite Decoration contract stays read-only. Private keyed mutation is
owned by the Plite projection kernel and consumed only through Plate internals.

Packet ledger:
| Packet | Cause | Result | Correctness | Decision | Next |
|---|---|---|---|---|---|
| readiness | Current and main may be timing-comparable. | Fixtures and transports differ; main errors. | Current Browser smoke clean. | invalidate timing comparison; keep correctness proof | owner decomposition |
| TPROJ-001 red | Broad Yjs publication scales with total cursor count. | 1,000 projected ranges and wakes; 11.966 ms p95. | Pre-fix oracles pass. | keep cause and hard-cut broad React APIs | private keyed kernel |
| TPROJ-001 green | One changed cursor should map and wake once. | One projection and wake; 0.585 ms p95 at 1,000. | Package and Browser oracles pass. | keep fix | resume breadth |
| TPROJ-002 red | Find filters every match for every leaf. | 100m comparisons; 1164.974 ms p95. | Find parity passes. | keep cause | path index |
| TPROJ-002 green | One index build plus keyed leaf lookup is sufficient. | 20k indexed work units; 9.588 ms p95. | Find and route proof pass. | keep fix | resume breadth |
| TPROJ-003 | Disconnect published a cursor callback before membership cleanup. | Exact reconnect test failed deterministically. | Red stack named the missing removal law. | fix guard and repair Regression lifecycle methodology | add/update/remove/teardown proof |
| TPROJ-004 | Mobile example shell laid selector and main side by side; cursor labels also overflowed. | Exact 390px lifecycle test failed at card and label bounds. | Red geometry assertions were deterministic. | fix copied UI and shell owners | five retry-free replays |

Metric table:
| Lane / action | Samples | Baseline | Final current | Delta / counters | Artifact |
|---|---|---|---|---|---|
| Yjs keyed selection at 1,000 cursors | 100 | pre-fix 11.966 ms p95 and 1,000 wakes | p50 0.406, p75 0.438, p95 0.585, p99 1.963, max 1.973 ms | 20.5x faster; 1 projection and 1 wake | artifact: node-benchmark.json |
| Yjs keyed metadata at 1,000 cursors | 100 | pre-fix broad total-n traversal | p95 0.052 ms | 1 decode, 0 resolutions, 1 projection, 1 wake | artifact: node-benchmark.json |
| Plite Widget update at 10,000 items | 100 | N/A: absolute scaling row | p95 0.551 ms | 1 resolve, 1 changed wake, 0 unrelated wakes | artifact: node-benchmark.json |
| Find matcher, 100k text and 10k matches | 5 | N/A: absolute scaling row | p95 8.816 ms; p99 omitted | 1 matcher read, 10k matches | artifact: node-benchmark.json |
| Find projection, 10k leaves and 10k matches | 5 | flat scan p95 1164.974 ms | indexed p95 9.588 ms; p99 omitted | 121.5x faster; 100m comparisons replaced by 20k indexed work units | artifact: node-benchmark.json |
| Yjs teardown at 1,000 cursors | 1 lifecycle | retained work must be zero | 13.948 ms cleanup | 1 listener before, 0 after, 0 post-cleanup wakes | artifact: node-benchmark.json |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|---|---|---|---|
| Named threshold | yes | Zero hard-guard failures | pass: scales-through-stress; worst current p95 9.588 ms. |
| Every applicable lane | yes | Complete or concrete N/A | pass: all eight applicable lanes complete; Slate row inapplicable. |
| Exact benchmark reruns | yes | Rerun kept causes | pass: final strict target has zero red rows. |
| Correctness | yes | Package and product oracles | pass: 27 Plite, 24 focused Yjs, 215 Yjs partition, and 3 Find tests. |
| Browser breadth | yes | Geometry, Yjs, mobile, reconnect, teardown | pass: five-route matrix, four Yjs rows, and exact lifecycle 5/5. |
| Source and API hygiene | yes | Types, imports, stale names, barrels | pass: 84-task typecheck, zero stale broad APIs, pnpm brl. |
| Registry | yes | Production and development generation | pass: build:registry and rd materialized 367 payloads and 15 overlays. |
| Changeset | yes | Published Plate and Plite major behavior | pass: .changeset/transient-editor-geometry.md owns both packages. |
| Agent methodology | yes | Source/mirror parity and workflow proof | pass: 79 Regression tests and plate-next resource parity. |
| Scoped lint | yes | Final source format and lint | pass: scoped Ultracite check. |
| Affected Plite gate | yes | pnpm check:plite:dev | pass: type, package, contracts, public types, and smoke. |
| Strict Plite handoff | yes | pnpm check:plite on a stable fingerprint | final read-only command; two earlier zero-assertion runs reached 75/79 before sibling task fix ai changed AIChatPlugin.ts. Result belongs in the final handoff because editing this plan afterward would invalidate it. |
| Autoreview | no | N/A: repository law forbids autoreview on next | N/A: forbidden on next. |
| Plan validation | yes | Benchmark --complete and Autogoal checker | run after this plan is sealed and before strict proof. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|---|---|---|---|
| Intake and comparison authority | complete | refs, hashes, hosts, 45-target registry | diagnosis |
| Ordered diagnosis | complete | TPROJ-001 and TPROJ-002 proven | owner repair |
| Fix and exact rerun | complete | zero hard guards and package correctness | breadth |
| Remaining breadth | complete | geometry, Yjs examples, lifecycle 5/5, teardown, stress | closure |
| Review and closeout | complete | generation, lint, type, dev gate, plan seal | strict read-only command |

Findings:
- The generic Plite Widget store already scaled. The Yjs adapter defeated it by
  rebuilding broad lists, maps, and Decoration projections.
- Forced invalidation was only half the Yjs defect. The durable fix required a
  private stable-id mutation kernel, lazy aggregate reads, keyed subscriptions,
  and package-owned plugin source registration.
- NodeApi.findTextRanges was not the Find bottleneck. Copied UI lowering caused
  the 100m comparison explosion.
- /cursor would have been an import bucket, not a performance owner. The best
  public API is the existing ids plus keyed child hooks.
- Browser proof found two correctness defects that timing alone could not:
  disconnect ordering and mobile layout/label overflow.

### Performance

- applicability: applied
- repeated units: cursor, Widget, projection bucket, text leaf, Find match
- cohorts: cursor 1/10/100/1,000; Widget through 10,000; Find through 100k text,
  10k leaves, and 10k matches
- budgets: one changed cursor decodes, maps, and wakes once; one Widget update
  resolves and wakes once; Find query publishes one index and each leaf reads
  one bucket
- interaction budget: every current p95 is below 16.667 ms
- p99 policy: only 100-sample rows report p99; five-sample pathological rows
  use p50/p75/p95/max and p99 null
- claim limit: local Apple M5 Max results prove algorithmic scaling and bounded
  counters, not production RUM latency

Decisions and tradeoffs:
- Add one internal benchmark target, not a public diagnostics API.
- Keep public Decoration read-only and private mutation private.
- Keep aggregate cursor reads explicit and caller-paid.
- Pay O(matches) once when Find publishes rather than O(leaves * matches) on
  every decoration pass.
- Fix the Plite example shell at its mobile layout owner; do not hide overflow.

Harness and methodology repairs:
- Registered target 45 because prior targets measured only proxies.
- Corrected the pathological Find fixture to exactly 10,000 matches.
- Embedded production-input fingerprints and raw samples.
- Added 1,000-cursor teardown with listener and post-cleanup wake guards.
- Extended Regression keyed-subscription cases to require add, update, remove,
  and teardown proof; regenerated skill mirrors and proved parity.

Error attempts:
| Error / failed attempt | Count | Resolution |
|---|---|---|
| Truncated broad source reads | 3 | Re-read exact authoritative ranges before acting. |
| Baseline dev command treated port as a directory | 1 | Started immutable main with next dev -p 3100. |
| Main product fixture was incomparable and erroneous | 1 | Rejected timing delta; retained current correctness smoke only. |
| Disconnect removed membership after keyed cursor notification | 2 exact reds | Added the removal guard, durable reconnect test, and Regression lifecycle contract. |
| Remote cursor label exceeded mobile overlay | 1 | Measured and clamped label position in copied UI. |
| Plite mobile shell placed selector and main in one row | 1 | Made the provider column-oriented below lg and retained intrinsic-width guards. |
| Find index field inferred mutable Map | 1 | Typed the consumer as ReadonlyMap. |
| Dynamic plugin component failed lint then createElement typing | 2 | Used a stable component reference with a typed render-prop object. |
| Strict proof saw active sibling writes | 2 | Both runs reached 75/79 with zero assertion failures; wait for fix ai to become idle, then start a fresh fingerprint. |

Verification evidence:
- TRANSIENT_PROJECTION_BENCH_STRICT=1 bun --expose-gc --preload
  ./config/plite-source-aliases.ts
  packages/platejs/scripts/transient-projection/benchmark-scalability.ts
  --output=docs/plans/artifacts/transient-projection-scalability/node-benchmark.json
  reports zero hard guards and scales-through-stress.
- Plite projection contracts: 27/27.
- Yjs focused contracts: 24/24.
- Plate Yjs partition: 215/215.
- Find contracts: 3/3.
- Source-first typecheck: 84/84 tasks.
- Yjs Browser breadth: 4/4.
- Transient geometry Browser matrix: 5/5.
- Exact collaboration lifecycle: 5/5 consecutive retry-free runs.
- pnpm check:plite:dev: pass.
- Registry production and development generation: pass.
- Barrels, scoped lint, zero stale APIs, and agent mirror parity: pass.

Final handoff contract:
- candidate and baseline: exact refs and content hashes above
- first causes: TPROJ-001 broad Yjs publication; TPROJ-002 nested Find lowering
- final verdict: scales-through-stress with zero hard guards
- public result: no /cursor layer; keep ids plus keyed child hooks; hard-cut
  both broad React cursor APIs
- implementation result: private Plite keyed kernel, keyed/lazy Plate Yjs
  adapters, private plugin source, copied Find path index
- product result: reconnect, selection, geometry, mobile layout, examples, and
  teardown all pass
- release result: existing major Plate and Plite changeset retained; no commit,
  push, PR, publish, or release
- last operation: strict Plite proof on a stable checkout, reported without
  editing this fingerprinted plan afterward

Timeline:
- 2026-08-31: created the measurement-first goal and registered target 45.
- 2026-08-31: proved nine hard-guard failures across TPROJ-001 and TPROJ-002.
- 2026-08-31: rejected /cursor, accepted the private keyed kernel, and hard-cut
  broad React cursor APIs.
- 2026-08-31: implemented Yjs and Find fixes; exact benchmark became
  scales-through-stress with zero hard guards.
- 2026-08-31: Browser exposed and verified the disconnect and mobile-layout
  repairs; exact lifecycle passed five consecutive runs.
- 2026-08-31: package, registry, lint, type, agent parity, and affected Plite
  gates passed.
- 2026-08-31: two strict runs reached batch 75/79 with no test failure before
  the active sibling fix ai task changed monitored AIChatPlugin.ts.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Code and plan are sealed; waiting for the sibling writer to become idle. |
| Where am I going? | Final benchmark fingerprint check, plan validators, in-app Browser replay, then strict Plite proof as the last read-only command. |
| What is the goal? | Prove transient projection scales across every real owner and product consumer. |
| What have I learned? | The right abstraction is private keyed mutation under existing public lifetimes, not a public cursor package. |
| What have I done? | Fixed every measured cause, cut broad APIs, resumed all lanes, and proved focused product breadth. |

Open risks:
- Strict closure must start only after the active sibling task fix ai stops
  writing this checkout.
- Final performance numbers are local calibration; production RUM is outside
  this goal.
