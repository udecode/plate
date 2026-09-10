# view element attributes api

Objective:
Ship one public Plate React API for sparse mounted-view element attributes,
migrate navigation feedback and block placeholders to it, and prove that the
private keyed runtime keeps bounded fan-out without making per-node callbacks
hook-bearing.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-09-04-view-element-attributes-api.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:

- docs
- agent-native
- browser
- package-api
- performance-observability

Mode:

- deep

Completion threshold:

- `render.useViewElementAttributes` is inferred from `createPlatePlugin`, owns
  one hook host per enabled plugin per mounted view, and returns sparse safe
  attributes keyed by `NodeKey`.
- Navigation feedback and block placeholders use that field; neither imports
  private publication nor manually subscribes to the whole editor store.
- `inject.nodeProps.transformProps` and functional `render.attributes` remain
  pure and hook-free. Callback replacement remounts the hook program.
- Source precedence follows compiled plugin order, not publication timing.
- Matched production benchmarks, focused behavior/type tests, package checks,
  docs parsing, browser proof, generated-rule parity, and this plan checker pass.

Verification surface:

- Source/type/runtime: `PlatePlugin`, compiled plugin cache, `EditorRefEffect`,
  `rendered-attributes`, both migrated plugins, and focused tests.
- Performance: actual Plate React mounts at 100, 1,000, and 10,000 element
  hosts plus a paired public-versus-private authoring probe.
- Package/docs: Plate entrypoint gates, `check:plite:dev`, full `pnpm check`,
  `www` source build, changeset, barrels, doctrine version, and generated rules.
- Browser: fresh API-reference and block-placeholder demo loads with DOM,
  accessibility, console, and network inspection.

Constraints:

- Use at most three checkpointed phases and pivot if a phase fails its proof.
- Add no compatibility alias or runtime shim.
- Keep the keyed store/provider/publisher and source IDs private.
- Do not mix virtualization, CodeMirror, code-line removal, or viewport-only
  token materialization into this API repair.
- Do not commit, push, or open a PR.

Boundaries:

- In scope: Plate React plugin types, hook hosting, keyed attributes,
  deterministic ordering, two feature migrations, docs, doctrine, tests,
  benchmarks, browser proof, and release metadata.
- Source owners: `PlatePlugin`, plugin resolution/cache, `EditorRefEffect`, and
  `rendered-attributes`; feature plugins only author sparse entries.
- Non-goals: a public store/provider/manager API, refs/events, structural
  components, inline text decoration, block virtualization, and code editing.
- Direct Plite owners remain `NodeKey`, `PliteRootEditor`, and mounted-view
  lifecycle. Hook-based authoring belongs to Plate React.

Output budget strategy:

- Read named owners first; store large benchmark evidence in receipts.

Blocked condition:

- Block only if type inference requires public transport, callback replacement
  cannot preserve React hook law, precedence cannot be deterministic, or the
  paired final benchmark breaks its frozen budget after one owner-level repair.

Plate Plan state:

- status: complete
- phase: prove-and-hand-off
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Objective, boundaries, three checkpoints, benchmark-first demand, and no-CodeMirror boundary are explicit |
| Active goal and plan verified | yes | Active goal names the API, two migrations, proof lanes, and this plan |
| Current owners read | yes | Plugin type/cache, hook host, keyed runtime, feature producers, tests, docs, and prior receipt were inspected |
| Best API target resolved | yes | One `render.useViewElementAttributes` field; no public transport nouns |
| Runtime scale applicability resolved | yes | Host count and changed-key fan-out are material |
| Pre-acceptance Benchmark probe selected | yes | Frozen 100/1k/10k cohorts, paired control, render counters, and correctness guards |
| Mode and execution boundary resolved | yes | Deep one-shot execution in three slices |
| Docs lane and source owner | yes | API reference and plugin guide teach `PlatePlugin` runtime law in English and Chinese |
| Agent source and mirror boundary | yes | `.agents/rules/**` is source; `pnpm install` generated mirrors |
| Browser route and tool | yes | Browser on `/docs/api/core/plate-plugin` and `/blocks/block-placeholder-demo` |
| Console/network policy | yes | Fresh final loads require zero console errors, failed requests, and HTTP errors |
| Exact reporter case | no | Local architecture delivery, not a report-backed bug claim |
| Package/release boundary | yes | Published `platejs/react` type/runtime API; existing `platejs` major changeset amended |
| Barrel impact | yes | Public types export from `react/core`; `pnpm brl` required |
| Production detector | no | In-process library primitive has no production telemetry owner; receipts store aggregate timings and counters only |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, cache, exports, and consumers were source-audited.
- [x] `best-api` resolved the reusable call shape before target lock.
- [x] Scale-sensitive acceptance uses matched executable receipts.
- [x] Every decision has an owner, adoption path, proof, risk, and verdict.
- [x] Plite owns neutral view identity; Plate React owns plugin hook authoring.
- [x] Public and private boundaries have complete adoption/deletion answers.
- [x] Three execution slices and focused proof are concrete and complete.
- [x] Docs use current-state voice and source-backed API names, types, routes,
      imports, examples, and safe-attribute limits.
- [x] English and Chinese docs received a final file-edit Unslop audit with
      technical literals preserved.
- [x] Source rules, generated mirrors, doctrine version 141, and discoverability
      were verified.
- [x] Browser routes, interaction, expected state, accessibility, console, and
      network results were verified on final local source.
- [x] Pixel controls are not applicable because this is a DOM/API behavior
      claim, not a reported paint defect.
- [x] Fresh pushed-ref and clean-checkout certification are not applicable;
      the result is explicitly local and unpushed.
- [x] Package boundary, changeset, barrel generation, typechecks, builds, and
      tests are recorded.
- [x] Normal, large, and pathological cohorts include cold timing, warm
      percentiles, sample counts, noise, deterministic render work, source
      hashes, and correctness guards.
- [x] No protected data, network payload, database query, cache, pool, index,
      or scheduler applies to this in-memory UI path.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | All scoped decision, adoption, performance, docs, package, browser, and review gates resolved |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source hashes are embedded in both receipts; ownership scan repeated |
| Best API review | yes | Resolve all P0/P1 call-shape findings | Narrow sparse-data field accepted; private transport and generic hook escape hatch rejected |
| Pre-acceptance scale proof | yes | Compare matched owner and target | Paired 31-sample receipt passes all three cohorts |
| Production scale rerun | yes | Rerun actual Plate mount after final runtime edits | Production receipt captured 2026-09-04T17:17:30.309Z with final source hashes |
| Conditional risk and adoption | yes | Complete triggered lanes | StrictMode, callback topology, precedence, safe filtering, docs, package, and browser covered |
| Verification recorded | yes | Record fresh commands and outcomes | See Verification evidence |
| Handoff prepared | yes | State ownership, breaks, proof, and risks | See Final handoff prepared |
| P1 autoreview | no | Explain policy waiver | Current branch is `next`; repository policy forbids `autoreview` on `next` |
| Goal plan complete | yes | Run `check-complete` | `[autogoal] complete` on the final plan |
| Docs source-backed audit | yes | Compare claims to current source | API names, safe attributes, lifetime, precedence, and purity match current owners |
| Required Unslop pass | yes | Audit every edited docs artifact | `VISION.md`, Plate vision, two API pages, and two plugin guides audited after claims stabilized |
| Requirements disclosure | yes | Classify public and private laws | Public authoring, private transport, package release, and runtime ownership are explicit |
| Docs links/routes/parser | yes | Verify routes and MDX | Both live leaf routes load; `pnpm --filter www build:source` passed |
| Plugin page specifics | yes | Apply plugin docs doctrine | Current-state setup and inferred callback example included |
| Agent source/generated sync | yes | Regenerate and validate | `pnpm install`; doctrine v141 fingerprint and 2 active/44 retired validation passed |
| Agent action discoverability | yes | Trace user intent to owning guidance | `best-api`, `plate-plan`, plugin authoring, Plate UI, and docs rules all teach the split |
| Agent-native review | yes | Close P0/P1 findings | PASS; no feature imports private publication and generated guidance contains the public field |
| Browser interaction proof | yes | Exercise final routes | API disclosure renders; placeholder appears on focus and clears on blur |
| Browser console/network | yes | Inspect final loads | API: 51 responses; demo: 131 responses; zero failed/error responses and zero console errors |
| Browser artifact | yes | Record inspectable proof | Final DOM attributes plus accessibility text on both routes; screenshot not needed for a non-pixel claim |
| Exact case replay | no | Explain exclusion | No external report or claimed bad ref exists |
| Final ref/fingerprints | no | State local authority | Local unpushed source only; receipt SHA-256 identities cover production, fixture, and harness inputs |
| Clean final runtime | no | State local authority | No fixed/shipped claim; Browser used a freshly restarted local server |
| Retry-free native stability | no | Explain exclusion | No native selection, compositor, DnD, or pixel claim |
| Public API/package proof | yes | Audit exports and boundary | Types exported from `platejs/react`; runtime transport remains internal |
| Runtime scale contract | yes | Close performance pack | Paired and production receipts pass correctness and deterministic fan-out bounds |
| Release artifact classification | yes | Classify user-visible delta | Published `platejs` major API/runtime delta |
| Published package changeset | yes | Update one package artifact | `.changeset/utils-plite-node-types.md` amended; no forbidden minor bump |
| Registry changelog | no | Explain exclusion | No registry source changed in this packet |
| No release artifact | no | Explain exclusion | A package changeset applies and exists |
| Package typecheck/build/test | yes | Run owning checks | Focused Plate gates and `check:plite:dev` pass; full `pnpm check` has only unrelated failures recorded below |
| Barrel/export generation | yes | Regenerate barrels | `pnpm brl` passed |
| Warm latency budget | yes | Apply paired frozen budget | Public p50 and p95 pass at 100, 1k, and 10k |
| Large/stress scaling | yes | Keep changed-key work bounded | Exactly one producer call per move and at most two host renders through 10k |
| Cold and failure paths | yes | Record cold mount and invalid inputs | Production cold/mount timings recorded; invalid refs/events/style/data rejected by tests |
| Payload and fan-out | no | Explain exclusion | No serialized/network payload or queries; two changed-key notifications are the relevant fan-out |
| Correctness guard | yes | Preserve model, selection, text, and attributes | All production rows report true and focused tests pass |
| Before/after receipt | yes | Preserve comparable evidence | Paired private/public receipt and old per-node comparison recorded below |
| Detector and privacy | no | Explain exclusion | No production detector owner and no protected data enters either harness |
| Performance regression check | yes | Run deterministic harnesses | Both final receipts pass |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, prior runtime, hard-cut target, and frozen probes established | Decide |
| Decide | complete | Public shape and private runtime accepted by source/type and paired scale proof | Prove and hand off |
| Prove and hand off | complete | Adoption, tests, benchmarks, docs, Browser, generation, and owning gates passed; unrelated full-check failures isolated | User review |

Decision brief:

- outcome: plugins author sparse exact-view element attributes without running
  hooks per element or knowing private publication machinery.
- chosen shape: `render.useViewElementAttributes(context) => readonly
  { key, attributes }[]`, mounted once per enabled plugin and view.
- strongest rejected alternative: hook-bearing `render.attributes` or
  `inject.nodeProps.transformProps`; both are conditional per-node paths and
  would reproduce the original performance and hook-order bug.
- consequence: the public API stays small while Plate privately owns filtering,
  cleanup, deterministic merging, and per-key subscriptions.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Public authoring | Feature hooks imported private publication | Inferred sparse field | `PlatePlugin` | Public intent is attributes, not transport | Both producers migrated | Type contracts, docs, source scan | Generic escape-hatch growth | accept narrow field |
| Runtime | Keyed maps and per-node subscribers | Retain privately | `rendered-attributes` | Bounded fan-out is already correct | Public host adapts entries | Paired and production receipts | Store lifecycle under StrictMode | accept after regression fix |
| Hook lifetime | Name-keyed callback host | Identity-keyed hook program | `EditorRefEffect` | Hook topology needs stable component identity | Applies to generic and attribute hooks | Different-hook-count replacement test | Intentional local state reset | accept |
| Precedence | Publication insertion timing | Compiled plugin rank | cache and private store | Effects cannot define semantics | Rank passed privately | Reverse timing test | Duplicate plugin names invalid upstream | accept |
| Pure callbacks | Boundary was under-taught | Explicit hook-free contract | types, docs, doctrine | They run conditionally per node | Teaching updated | Type/source/docs audit | Runtime cannot ban arbitrary misuse | accept |
| Inline/structure | Existing render mechanisms | Keep current owners | decorations and components | Attribute API has one job | No migration | docs/source audit | Misuse by authors | accept |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Prove host | Plate React runtime | Field, cache, identity host, order, navigation | Frozen target | Types, lifecycle, precedence, navigation, paired benchmark passed | Focused tests/types and receipts |
| 2. Complete adoption | Block placeholder | Exact-view focus/composition/read-only behavior | Slice 1 green | No private feature import; intrinsic/default/custom hosts pass | StrictMode unit and Browser proof |
| 3. Hard-cut and teach | Docs/package/doctrine | Public docs, changeset, generated rules, broad gates | Slice 2 green | One public authoring API; closure gates green | Builds, checks, Browser, version and plan validation |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Callback is inferred and view-scoped | Canonical React plugin field | Compile-only contract without callback annotation or cast | pass |
| Hooks do not multiply by element count | One host beside per-plugin effects | Two StrictMode mount calls independent of 100/1k/10k nodes | pass |
| Callback replacement is React-safe | Callback identity keys program | Different hook counts replace cleanly with cleanup | pass |
| Fan-out stays bounded | Per-key subscriber store retained | At most two host renders per move through 10k | pass |
| Precedence is deterministic | Compiled order is explicit input | Reverse publication timing preserves winner | pass |
| Features preserve behavior | Two private publishers identified | Focused tests and placeholder Browser interaction | pass |
| Teaching matches runtime | Named source/docs/rule owners | Build, generated mirror validation, and source audit | pass |

Scale contract:

- Applicability: element-host count and sparse key fan-out are material.
- Cohorts: 100, 1,000, and 10,000 full DOM element hosts; one moving target.
- Frozen paired gate: public p50 no more than private plus `max(1 ms, 15%)`;
  public p95 no more than private plus `max(2 ms, 20%)`; one producer call and
  at most two host renders per move; 5 warmups and 31 alternating samples.
- Paired private/public p50/p95 milliseconds: 100 `0.303/0.709` versus
  `0.272/0.476`; 1,000 `0.654/0.953` versus `0.708/1.278`; 10,000
  `25.045/31.621` versus `24.774/32.918`. Every row passes.
- Production cold editor/mount and warm p50/p95 milliseconds: 100
  `41.634/73.832`, `1.337/1.882`; 1,000 `114.329/214.211`, `4.501/10.285`;
  10,000 `1144.462/1479.513`, `57.755/73.285`.
- Deterministic production result: one render per host on mount, at most two
  target-host renders per move, exact target attributes, and unchanged model,
  selection, and text in every row.
- Historical per-node hook p95 was `29.093/183.301/1784.798` ms with
  `100/1,000/10,000` hook executions. It remains rejected.
- The initial single historical keyed packet was too noisy at 10k. A repeated
  control varied by 28 ms, so the paired same-process probe became the frozen
  decision gate before its first target run.
- Receipts:
  `docs/plans/artifacts/2026-09-04-cleanup-hook-bearing-render-injection/rendered-attributes.mounted.receipt.json`
  and
  `docs/plans/artifacts/2026-09-04-view-element-attributes-api/authoring-path.mounted.receipt.json`.

Conditional evidence:

- High risk: StrictMode replay, callback topology replacement, reverse
  publication timing, invalid attributes, producer removal, focus/blur, and
  10,000 hosts all have direct proof.
- External research and issue provenance: not applicable to this local
  Plate-owned API execution; the earlier editor research informed the accepted
  plan but is not a current fact dependency.
- Registry changelog: not applicable because this packet changes no registry
  source.
- Native pixel and clean pushed-ref gates: not applicable because no paint bug,
  external report, commit, push, PR, or shipped claim is made.

Findings:

- The keyed runtime was worth keeping. The dirty part was forcing feature
  plugins to understand its private transport.
- Browser proof found two bugs missed by the first unit pass: placeholder focus
  subscribed through the wrong editor owner, and provider effect cleanup killed
  the store during React StrictMode replay. Both were fixed at their owners.
- A view-local store needs no provider teardown method. Unmount makes it
  unreachable, while subscriber and source effects already clean themselves.
- Explicit compiled order is required; map insertion timing is not semantics.

Decisions and tradeoffs:

- Keep one private keyed runtime and expose only sparse desired attributes.
- Allow only `className`, `placeholder`, string/number `style`, and primitive
  `aria-*`/`data-*`; reject refs and events.
- Remount on callback identity change. Preserving hook-local state across a new
  hook program would be dishonest and unsafe.
- Use `decorate` for inline ranges and component/slot APIs for structure.

Agent capability map:

- Intent: design view attributes in `best-api` and adopt them in `plate-plan`.
- Authoring: `PlatePlugin` exposes the inferred callback; plugin authoring and
  Plate UI rules constrain its job.
- Runtime: `EditorRefEffect` hosts it and private `rendered-attributes` owns
  keyed publication, validation, merging, and subscription.
- Teaching: generated skills and English/Chinese docs use the same name and
  lifetime.
- Proof: type contracts, behavior tests, paired benchmark, production
  benchmark, Browser, docs build, doctrine validation, and repo checks.

Review fixes:

- Fixed exact-view focus subscription after Browser showed that the placeholder
  did not react to focus.
- Removed provider destruction after StrictMode effect replay permanently
  disabled later publications; added a StrictMode regression test.
- Corrected lifecycle wording from “runs once” to one mounted hook host with
  normal rerenders.
- Agent-native review passed with no remaining P0/P1 finding.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| `pnpm exec vitest` unavailable | 1 | Use the package's Bun test lane | Focused Bun tests passed |
| Placeholder focus stayed stale in Browser | 1 | Subscribe through mounted Plate context hooks | Focus/blur proof passed |
| StrictMode replay disabled publication | 1 | Remove destructive provider effect cleanup | Regression and Browser proof passed |
| Single historical 10k timing packet was noisy | 1 | Freeze paired same-process comparison | All paired gates passed |

Verification evidence:

- Focused Bun suite: 114 passed, 0 failed, 391 assertions across seven files.
- `platejs` `typecheck:entrypoint:react`, `typecheck:contracts`,
  `test:entrypoint:react`, and `lint:entrypoint:react` passed.
- `pnpm --filter www build:source`, `pnpm brl`, and `pnpm check:plite:dev`
  passed; the latter covered 85 typecheck tasks, package builds, contracts, and
  three Chromium smoke tests on the final formatted source.
- Full `pnpm check` reaches only unrelated failures: formatting in
  `dom-coverage-boundaries.tsx`, `schema-reconfiguration.tsx`, and registry
  `code-block.tsx`; the latter two also have unused-import or React ref-render
  lint errors. All 15 Plate files initially reported by the command are clean.
- Doctrine v141 validation passed with fingerprint
  `sha256:bca97a7e425ca19ea9109ef9c8044d7f61a73977f16f74efa58bc04e67be3327`,
  2 active versions, and 44 retired versions.
- Browser API route: public name, example, safe types, private ordering, and
  pure callback split rendered; 51 responses, zero failures/errors, and zero
  console errors.
- Browser demo route: focused empty block gained placeholder attribute/class
  and accessible placeholder text; blur cleared both; 122 responses, zero
  failures/errors, and zero console errors.

Final handoff prepared:

- Ownership: public authoring lives on `PlatePlugin`; keyed transport remains
  private to Plate React.
- Adoption: navigation and placeholders use the public field; old feature-level
  private imports are gone.
- Proof: inference, lifecycle, ordering, validation, StrictMode, behavior,
  performance, docs, owning package checks, browser, and generated-doctrine
  lanes passed.
- Remaining risk: Happy DOM timings are not browser INP or layout claims. The
  deterministic fan-out and exact Browser behavior are the durable guarantees.
- Publication status: local and unpushed; no commit, push, PR, or release.

Timeline:

- 2026-09-04T16:27:02.191Z Plate Plan created.
- 2026-09-04T17:27:50.454Z final production benchmark captured.
- 2026-09-04T17:28:02.556Z final paired benchmark captured.
- 2026-09-04 implementation, adoption, Browser repair, docs, doctrine, and
  package proof completed locally.
- 2026-09-04 final `check:plite:dev` and goal-plan validation passed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Local handoff ready |
| Where am I going? | User review |
| What is the goal? | One public view-attribute authoring API over private bounded keyed fan-out |
| What have I learned? | StrictMode and exact-view focus ownership were the real lifecycle traps |
| What have I done? | Implemented, migrated, benchmarked, documented, browser-tested, and validated the API |

Open risks:

- Happy DOM timings do not claim browser layout or INP. The full repo check is
  blocked by unrelated Plite-example and registry code-block formatting/lint;
  no known blocker remains in this API packet.
