# Authored direct-checkpoint implementation

Objective:

Implement and prove one versioned, directly loadable native authored
checkpoint. Opening a current document must avoid operation-log reduction and
pending-edit projection replay while preserving the public API, authored and
collaboration semantics, continued editing, and real-time suggestion behavior.

Completion threshold:

The result is complete when current state loads directly; versions 1–3 migrate;
malformed or corrupt values reject; authored and Yjs behavior remains green;
10,000 tracked changes meet the frozen Bun and Node load, edit, decision, save
and payload gates; the three reported browser regressions have focused E2E
proof; and the plan, review ledger and owning Vision statement match the final
implementation.

Verification surface:

- Plite authored state, decisions, anchors, positions, retention, format,
  state-field decoding, generic initial metadata, public snapshots and Yjs
  shared-effect checkpoints.
- Plate input-rule `insertBreak` middleware and authored suggestion decoration.
- Authored/Yjs behavior partitions, migration/corruption contracts, package
  types, focused lint, Chromium E2E, production benchmark and profiler events.

Constraints:

- Product source, tests, benchmark artifacts and owning doctrine are authorized
  in the current checkout. Git publication, release and external messages are
  outside this request.
- Keep `initialValue` and `editor.read.value()` unchanged. Add no public loader,
  cache, trusted-input flag, worker or background replay protocol.
- Stop performance experimentation after three consecutive trials without a
  positive effect. All three accepted pivots improved the measured path.
- Preserve strict input detachment and validation, delayed-peer facts, stable
  identities, decisions, anchors, named roots and configurable retained history.

Boundaries:

- In scope: versioned authored persistence, direct runtime hydration, retained
  body lifetime, collaboration snapshots, suggestion input/presentation fixes,
  focused E2E, benchmarks and the smallest current decision/Vision repair.
- Plite remains the authored state owner; Plate remains the workflow and UI
  owner. Generic state-field infrastructure changes only at its decoding and
  metadata-detachment boundary.
- New public persistence calls, editor replacement, mandatory CRDT ownership,
  UI redesign, publication and release are excluded.

Blocked condition:

Block only if native authored/collaboration laws require a user-visible product
decision or the local package/browser tools remain unavailable after bounded
repair. Neither condition occurred.

Plite Plan state:

- status: complete
- phase: prove and hand off
- next: user review
- handoff: prepared

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Requirements and authority | pass | Full implementation, optimization and pivot authority captured; no publication |
| First-principles target | pass | Direct current-state authority retained under native authored ownership; replay authority and duplicate mirrors cut |
| Public API target | pass | Existing `initialValue` and `read.value()` calls retained; no new public protocol |
| Scale contract | pass | 100/1,000/10,000 cohorts and 10,000 stress budgets frozen before final measurements |
| Correctness guards | pass | Authored, Yjs, migration, corruption, type and browser surfaces selected |
| Production telemetry | N/A | Deterministic local library benchmark uses a synthetic fixture and no protected data |

Work Checklist:

- [x] Current persistence, runtime, collaboration, Plate input and suggestion
      presentation owners were traced.
- [x] The maximum-value hard cut removed operation reduction and pending replay
      as the normal current-state authority.
- [x] Version 4 directly checkpoints accepted/projected documents, changes,
      positions, operation facts and checksum-bound retained bodies.
- [x] Versions 1, 2 and 3 migrate; unknown future versions and corrupt bodies
      reject.
- [x] Registered codecs detach their persisted input before generic metadata is
      deeply snapshotted, avoiding a duplicate whole-checkpoint copy.
- [x] Continued editing, decisions, anchors, retention and collaboration were
      preserved.
- [x] Enter falls through the input-rule middleware when no rule handles it.
- [x] Suggestion decorations refresh after projected state settles, clip ranges
      to current text and use node-specific keys.
- [x] Focused E2E covers first-paint decoration, rapid cursor navigation and
      Enter inside a suggestion.
- [x] The final production path clears all frozen Bun and Node gates.
- [x] Vision, decision history and immutable review record describe the accepted
      architecture and its proof limits.

Completion Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Direct current-state load | pass | Version 4 decodes current facts and projections; profiler emits no `authored-reduce` or `authored-map` load event |
| Migration and corruption | pass | v1/v2/v3 migration, unknown-v5 rejection and retained-body checksum cases pass |
| Authored correctness | pass | Authored partition passes 280 tests |
| Collaboration correctness | pass | Yjs partition passes 289 tests |
| Type and lint | pass | Plite source/test types, Plate react-core types and focused Ultracite pass |
| Browser regressions | pass | Chromium suggestion spec passes all 3 first-paint/navigation/Enter scenarios with runtime error capture |
| 10,000 load budget | pass | Bun 562.6 ms and Node 515.7 ms medians, both below 650 ms |
| Relative improvement | pass | Bun 78.0% / 1,992.3 ms and Node 79.2% / 1,966.6 ms faster than matched replay baselines |
| First edit and decision | pass | Both stay inside the combined 25% and 10 ms regression rule |
| Save and payload | pass | Save stays within 2x; v4 is 16,471,746 bytes versus v1 at 17,125,993 bytes |
| P1 Autoreview | N/A | Branch is `next`, where Task prohibits Autoreview |
| Publication | N/A | No commit, push, PR, release or external message was requested |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, hard laws, baseline and frozen budget recorded | Direct checkpoint selected |
| Decide | complete | Version 4 current facts plus cold retained bodies beat replay and mirror alternatives | Production path adopted |
| Implement | complete | Codec, runtime, metadata boundary, input-rule and decoration fixes landed locally | Final proof run |
| Prove and hand off | complete | Correctness, browser, benchmark, profiler, Vision and review ledger complete | User review |

Decision brief:

- Outcome: a saved authored document opens as a ready-to-edit native state
  without re-executing historical operations or replaying pending projection.
- Chosen shape: version 4 stores validated current accepted/projected documents,
  changes and positions directly. Compact operation facts remain current;
  checksum-bound JSON bodies remain cold until a decision/history read.
- Public shape: keep `initialValue`, `editor.read.value()` and the optional
  authored capability exactly as callers already use them.
- Strongest cut: remove operation replay as current-state authority and reject a
  duplicate live-state mirror, loader, trust switch and background replay.
- Presentation: Plate refreshes suggestion decoration after the authored
  projection commit settles; Slate input-rule middleware delegates unhandled
  Enter to the normal break owner.

Decision ledger:

| Surface | Final owner and shape | Reason | Adoption | Proof | Verdict |
| --- | --- | --- | --- | --- | --- |
| Public persistence | Plite `initialValue` / `read.value()` | No independent loading job exists | No caller change | API/type audit | keep |
| Current state | Authored version 4 direct facts and projections | Opening should validate present facts once | v1–v3 migrate | benchmark + authored corpus | rearchitect |
| Retained operation bodies | Authored checksum-bound encoded JSON | Decisions/history need content; normal open does not | decode on demand | corruption + decisions | keep cold |
| Generic metadata | State codecs decode first; remaining metadata detaches before return | Preserve immutability without duplicate deep copy | core boundary update | value-codec contract | rearchitect |
| Collaboration | Existing shared-effect owner carries the direct checkpoint | Atomic delivery and delayed-peer laws remain independent | existing transport path | Yjs partition | keep owner |
| Enter handling | Input-rule middleware delegates when unhandled | Middleware must not swallow native editor behavior | Plate plugin fix | 26 input-rule tests + E2E | repair |
| Suggestion decoration | Plate projection observer refreshes after settle with clipped, node-keyed ranges | First paint must match committed content | UI fix | 3 Chromium E2E | repair |
| Duplicate mirror/protocol | deleted from target | Adds authority, bytes and coordination without a user job | none | 44.25 MB rejected probe | cut |

Execution slices:

| Slice | Owner | Exit | Proof | Status |
| --- | --- | --- | --- | --- |
| Codec and migration | Plite authored/value codec | v1–v3 migrate; v4 and malformed input are exact | migration/corruption contracts | complete |
| Runtime hydration | Plite authored runtime | current facts load directly and remain editable | authored corpus + profiler | complete |
| Collaboration/retention | Authored effect + Yjs | direct checkpoint keeps decisions, anchors and delayed-peer facts | authored/Yjs partitions | complete |
| Product interaction | Plate input/suggestion UI | cursor, Enter and first-paint decoration behave synchronously to the user | Chromium E2E | complete |
| Production optimization | Benchmark + Plite core | frozen load/edit/decision/save/payload gates pass | final benchmark packet | complete |
| Durable closure | Task + Best API Review | Vision, decision page, review ledger and task receipt agree | ledger/checker | complete |

Proof matrix:

| Claim | Evidence | Status |
| --- | --- | --- |
| Public calls remain unchanged | Existing exports and type checks | pass |
| Saved current state is complete and detached | version/migration/corruption/value-codec tests | pass |
| Normal v4 load performs no historical reconstruction | absence of profiler reduce/map events | pass |
| Editing, decisions, retention, anchors and Yjs survive | authored 280 + Yjs 289 | pass |
| Cursor, Enter and decoration bugs are fixed | focused Chromium E2E 3/3 | pass |
| Work is not shifted beyond accepted budgets | first edit, decision, save and payload medians | pass |
| Final source matches measured bundle | 469-file manifest and fixture hashes validated after run | pass |

Scale contract:

- Operation: `createEditor({ initialValue })` through first complete document
  read, then first edit, decision and save.
- Cohorts: 100, 1,000 and 10,000 paragraph all-pending tracked-change fixtures.
- Frozen 10,000 gate: median at most 650 ms and at least 75% plus 1.5 seconds
  faster than the matched replay path in both Bun and Node, with three
  fresh-process interleaved pairs. First edit/decision fail only when both 25%
  and 10 ms worse; save at most 2x; payload at most 2x old state.
- Final fixture SHA-256:
  `50380317af35b4493cdd914a202c213f241e64c2bb4af90c7e6653ffce61853c`.
- Final bundle SHA-256:
  `5f727cddf970e90c45b97807ae446010721bcf35d760ac9886ce5aeef3833c3a`;
  manifest covers 469 source files.
- Bun medians: replay 2,554.844 ms; v4 562.592 ms; first edit 40.182 →
  19.956 ms; decision 12.491 → 20.532 ms; save 66.564 → 69.703 ms.
- Node medians: replay 2,482.363 ms; v4 515.744 ms; first edit 19.457 →
  10.073 ms; decision 3.340 → 6.883 ms; save 22.853 → 43.585 ms.
- Smaller v4 medians remain monotone: Bun 20.970 / 75.772 / 562.592 ms;
  Node 26.816 / 81.239 / 515.744 ms for 100 / 1,000 / 10,000.

Decision trail:

- The redundant opaque mirror stored 44.25 MB, ran slower and admitted two
  current-state authorities; it was rejected.
- A direct object checkpoint initially remained around 0.90–0.94 seconds. The
  cause was generic metadata detachment deeply copying the checkpoint after the
  authored codec had already decoded it.
- Skipping a redundant owned-operation input copy improved the path modestly.
- Keeping checksum-bound retained bodies encoded until decision/history access
  improved load by roughly 15% and reduced saved bytes.
- Moving registered codec decoding ahead of generic metadata detachment removed
  the duplicate whole-checkpoint copy and produced the final 0.52–0.56 second
  medians. Each of the three accepted pivots had a positive measured effect, so
  the user's three-no-impact stop condition never triggered.
- One benchmark run aborted because another checkout task changed
  `target-runtime.ts` after bundle creation. The source-identity guard caught it;
  a stable-source rebuild and full rerun produced the final packet.
- Version 4 cold bodies initially exposed imported-ID and corruption-fixture
  assumptions. Format rewriting and corruption cases were repaired before the
  final correctness run.

Verification evidence:

- `pnpm --filter plitejs test:partition:authored` — 280 pass, 0 fail.
- `pnpm --filter plitejs test:partition:yjs` — 289 pass, 0 fail.
- `pnpm --filter plitejs typecheck` — 13/13 partitions pass.
- `pnpm --filter plitejs typecheck:tests` — test types pass.
- `bun test ./packages/platejs/src/react/utils/inputRules.spec.tsx` — 26
  pass, 0 fail, 71 assertions.
- `pnpm --filter platejs typecheck:partition:react-core` — pass.
- Focused Ultracite check across the 12 changed product/test files — pass.
- `PLAYWRIGHT_BASE_URL=http://localhost:3000 pnpm --filter www
  test:www-browser:chromium tests/browser/suggestion.spec.ts` — 3/3 pass with
  console, page-error and failed-request capture.
- `final-summary.json` — all correctness, source identity and frozen performance
  gates pass for three Bun and three Node pairs.
- `final-profile-bun.log` and `final-profile-node.log` — no load-time
  `authored-reduce` or `authored-map` event.
- `node tooling/scripts/review-ledger.mjs record ...`, `render`, `check` — final
  authored review recorded and generated ledger validated.
- `node .agents/skills/autogoal/scripts/check-complete.mjs ...` — this plan
  validates complete.

Open risks:

- Three samples support medians and observed ranges, not p95/p99 claims.
- The synthetic all-pending paragraph fixture does not establish a universal
  ProseMirror comparison or a retained-heap ceiling.
- Browser proof covers Chromium on the authored-suggestion route.
- Node save has limited headroom at 43.585 ms against the 45.706 ms frozen
  bound; the direct load result does not depend on moving work to first edit.
