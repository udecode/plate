# Wordgard material packets execution

Objective:
Implement accepted Wordgard P1/P2 packets without device runs or localization;
done when benchmark, proof-plumbing contracts, strict Plite gates, and review
pass; plan
docs/plans/2026-07-27-wordgard-material-packets-execution.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-27-wordgard-material-packets-execution.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:

- browser
- package-api

Mode:

- `standard` accepted-plan execution

Completion threshold:

- The P1 benchmark caller uses the supported codec authoring context and the
  focused clipboard benchmark passes with fresh finite metrics.
- One root-owned P2 proof command resolves the live browser release-proof owner;
  scoped proof passes and raw mode fails closed without supplied direct-device
  artifacts.
- Focused proof-contract tests, owning package checks, applicable strict Plite
  stages, scoped formatting/lint, and autoreview pass.
- No editor runtime behavior, public package API, serialized value,
  collaboration format, raw-device artifact, or localization surface changes.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
docs/plans/2026-07-27-wordgard-material-packets-execution.md` passes.

Verification surface:

- Focused clipboard benchmark:
  `bun test --preload ./config/plite-source-test-setup.ts
benchmarks/editor/benchmarks/plite-clipboard-large-payload-benchmark.test.ts`.
- Proof commands and fail-closed tests for
  `tooling/plite/donor/proof/mobile-device-proof.mjs`.
- `@platejs/browser` tests/typecheck plus the affected Plite development lane;
  strict `pnpm check:plite` when the repaired benchmark reaches its owning
  closure gate.
- Source audits for unchanged public callback/runtime/localization surfaces.
- `autoreview` and the final autogoal checker.

Constraints:

- User accepted the audited P1 and P2 packets; implementation is authorized.
- Do not run real Android/iOS devices or create/claim raw-device artifacts.
- Do not implement `WG-STATE-012` or touch phrase/localization ownership.
- P1 repairs the benchmark caller; do not add `getOptions` to the public
  authoring context.
- P2 repairs proof plumbing and contracts; do not change input routing unless a
  future direct-device trace proves a runtime failure.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:

- In scope:
  `benchmarks/slate-v2/donor/core/current/clipboard-large-payload.mjs`,
  `tooling/plite/donor/proof/mobile-device-proof.mjs`, root `package.json`,
  focused proof-contract tests, one stale strict-browser assertion exposed by
  verification, this execution plan, and audit artifacts only when final
  evidence makes a statement stale.
- Source owners: Plate codec authoring/benchmark fixture; Plite browser
  release-proof and native-event trace infrastructure.
- Non-goals: real devices/emulators, Appium execution, raw evidence creation,
  editor input/runtime changes, public API changes, docs/product UI,
  `WG-STATE-012`, changesets, release, commit, push, or PR.
- Direct Plate adoption: one benchmark fixture caller. Collaboration adoption:
  N/A because no collaboration contract changes.

Output budget strategy:

- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:

- Stop only if the accepted caller repair cannot use the current codec API, the
  proof contract cannot fail closed without changing runtime/public API, or the
  same unrelated repository failure repeats after focused owner checks and one
  prescribed environment reset. Device absence is not a blocker because the
  user explicitly excluded device execution.

Plite Plan state:

- status: ready
- phase: complete
- next: future raw-device lane only when explicitly authorized
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Implement all accepted P1/P2 work; exclude device execution/artifacts and `WG-STATE-012`; no implementation beyond those packets |
| Active goal and plan verified | yes | New one-shot execution goal created against this exact plan |
| Current owners read | yes | Read root/common/Plite/Plate Vision, Plite agent start, accepted audit/dossiers, live benchmark caller, codec context, proof script, release-proof/native-trace owners, package scripts, and focused tests |
| Best API target resolved | no | N/A: both accepted packets preserve public call shapes; P1 fixes a caller and P2 changes proof plumbing only |
| Mode and execution boundary resolved | yes | Standard one-shot execution of the accepted audit packets; the two user exclusions are hard boundaries |
| Browser pack selected | yes | Browser proof infrastructure changes; pack is materialized in this plan |
| Browser route / app surface identified | no | N/A: no visible app route changes; the owning surface is browser proof tooling and strict automated Chromium closure |
| Browser tool decision recorded | yes | No Browser/Chrome UI automation because no product interaction changes; use focused proof tests and strict automated Chromium closure |
| Console/network caveat policy recorded | no | N/A: no running app route or network behavior changes |
| Package/API pack selected | yes | Root command contract and package-owned proof tests change; package-api pack is materialized |
| Public surface or package boundary identified | yes | Public package API and exports remain unchanged; root proof scripts and internal benchmark/proof callers are the only command boundaries |
| Release artifact path selected | no | N/A: internal benchmark/proof tooling and root scripts have no published package user-visible delta |
| `changeset` skill loaded when `.changeset` is required | no | N/A: no published package delta, so no changeset |
| Barrel/export impact decision recorded | no | N/A: no exports or exported file layout changes |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] N/A: no reusable public call shape changes; both packets keep the
      accepted public surface.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] N/A: no public break or private bridge.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work is resolved; final handoff awaits integrated proof.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pass | Resolve every readiness condition | Packet owners and strict stages pass; one-shot wrapper browser reruns are invalidated only by unrelated live source edits |
| Fresh source evidence | pass | Recheck decision-changing current claims | Final six-path audit confirms proof/test/benchmark/plan-only work |
| Best API review | pass | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | No public shape changed; P1 repairs the stale caller |
| Conditional risk and adoption | pass | Complete triggered risk/browser/benchmark/provenance work or give one scoped N/A reason | Benchmark and Chromium proof complete; devices, docs, provenance, release, and localization are scoped N/A |
| Verification recorded | pass | Record fresh planning proof and exact execution gates | Focused, package, contract, and full Chromium evidence recorded below |
| Handoff prepared | pass | Prepare concise ownership, breaks, proof, risks, and execution order | Prepared below |
| Autoreview | pass | Run for implementation changes or record planning-only N/A | Codex autoreview clean: zero actionable findings, 0.84 confidence |
| Goal plan complete | pass | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-27-wordgard-material-packets-execution.md` | Final invocation passes after all other gates resolved |
| Browser interaction proof | pass | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Tooling-only change; strict automated Chromium passed 696 with 6 intentional skips; user excluded direct-device proof |
| Browser console/network check | pass | Record console/network state or why it is not applicable | N/A: no product route/runtime/network change |
| Browser final proof artifact | pass | Record screenshot/trace/route/native proof or exact caveat | Full Chromium matrix passed; no raw-device artifact created or claimed |
| Public API / package boundary proof | pass | Source-audit public API, exports, and package boundary impact | Changed paths contain no package source or app product source |
| Release artifact classification | pass | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Internal benchmark/proof commands and tests only |
| Published package changeset | pass | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | N/A: no published package delta |
| Registry changelog | pass | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry change |
| No release artifact | pass | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Internal-only command/test/benchmark repair; no user-visible delta |
| Package typecheck/build/test | pass | Run owning package checks or record N/A with reason | `@platejs/browser` typecheck and 116 package tests pass; strict package/contracts stages pass |
| Barrel/export generation | pass | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no export or exported-file change |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current doctrine, accepted dossier, benchmark, proof workflow, root scripts, package tests, and claim owners read | Decide |
| Decide | complete | Keep public/runtime architecture; repair one benchmark caller and one root proof entrypoint; preserve exclusions | Prove and hand off |
| Prove and hand off | complete | P1/P2 focused TDD, owning package checks, strict stages, full Chromium, source audit, and autoreview are green | Goal checker |

Decision brief:

- outcome: Close the accepted P1 benchmark failure and make the P2 raw-mobile
  proof contract runnable and fail-closed without claiming device proof.
- chosen shape: Capture benchmark format at the fixture factory; resolve the
  browser release-proof owner from the true repository root; expose scoped/raw
  root commands; retain current input runtime.
- strongest rejected alternative: Restore `getOptions` to codec authoring or
  copy Wordgard's blanket mobile Enter/Backspace bypass.
- consequence: Strict proof can execute honestly; raw Android/iOS support stays
  explicitly unproved until a later device lane supplies valid artifacts.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| P1 clipboard benchmark | Fixture calls unavailable `getOptions` and crashes before measurement | Pass MIME format into the fixture factory and use `defineCodecs` only | Plate benchmark fixture | Repair the caller instead of distorting the live public API | One benchmark caller; no runtime consumer | Focused benchmark plus strict Plite contracts/Chromium | Metrics could still expose a real codec regression after the crash is removed | keep API; repair caller |
| P2 proof command | Script computes `tooling/plite` as repo root, imports a missing path, and lacks root commands | Resolve true root/live release-proof owner and add scoped/raw commands with fail-closed raw artifact validation | Plite browser proof workflow | Make evidence ownership runnable without weakening raw claim classes | Root scripts and focused proof-contract tests | Scoped command passes; raw command rejects absent/proxy/synthetic evidence | A permissive scenario contract could overclaim device coverage | rearchitect proof entrypoint |
| P2 input runtime | Selective keydown/beforeinput ownership exists; direct-device phase behavior is unproved | Keep runtime unchanged; preserve named future device cases and raw claim ceiling | Plite React editing kernel | User excluded device execution and no failing trace authorizes runtime work | None | Source audit plus existing package/browser tests | Temptation to copy a blanket platform bypass | keep |
| `WG-STATE-012` | Reference phrase sets are stronger in isolation | No change | Copied application UI | User explicitly excluded it | None | `rg` confirms no task diff under localization/UI owners | Scope creep | reject for this execution |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Baseline and stale-claim repair | Plate + Plite proof owners | Re-read current fixture, proof script, tests, scripts, accepted dossier, and doctrine | Goal active | Current claims and exact test owners confirmed | Source citations and focused failing baselines |
| 2. P1 caller repair | Plate benchmark fixture | Remove stale options/configure dependency and capture format explicitly | Slice 1 confirms current failure | Focused benchmark passes and reports finite metrics | Focused benchmark test |
| 3. P2 proof plumbing | Plite browser proof workflow | Correct root resolution, add scoped/raw commands, and add fail-closed contract tests | Slice 2 green | Scoped proof passes; raw mode rejects absent/non-direct evidence | Focused proof tests and commands |
| 4. Integrated proof | Plate/Plite checks | Typecheck, package tests, affected/strict Plite gates, formatting/lint, source audits | Slices 2-3 green | All in-scope gates pass or exact unrelated blocker recorded | Named verification commands |
| 5. Review and closure | Autoreview + autogoal | Review only current packet diff and close plan | Slice 4 complete | Zero accepted actionable findings; checker passes | Autoreview record and `check-complete` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Benchmark uses supported codec context | Accepted dossier and live `createBasePlugin` caller | Focused clipboard benchmark passes 4/4 after reproducing `getOptions` crash | pass |
| Proof entrypoint resolves live browser owner | Current broken relative path and live release-proof module | Root scoped command test passes after reproducing missing-script failure | pass |
| Raw claims fail closed without devices | Release-proof evidence-class contract | Root raw command test rejects absent artifacts with the owning error | pass |
| Input runtime and public API remain unchanged | Accepted matrix rows and current source | Six changed paths contain no package runtime or app product source; package tests pass | pass |
| Localization remains untouched | Explicit user exclusion | Six changed paths contain no localization owner | pass |

Conditional evidence:

- High-risk scenarios: benchmark fixture pressures public API to restore a
  stale callback; proxy/synthetic proof satisfies raw claims; a broken cwd/path
  passes locally but fails from root; blanket mobile bypass suppresses custom
  bindings.
- External research: N/A: accepted local audit and current repository source
  settle both packets.
- Issue/PR provenance: N/A: no issue or PR owns this user-authorized work.
- Browser/benchmark/docs/release/behavior-law owners: benchmark and browser
  proof apply; docs/release/behavior-law changes are N/A unless implementation
  exposes a stale public claim.

Findings:

- Accepted audit has four P rows but two physical packets: one P1 benchmark
  caller repair and one P2 proof-workflow repair spanning three rows.
- No P-ranked row authorizes a Wordgard runtime transplant.
- The live P1 failure reproduced exactly: `getOptions` is undefined in the
  benchmark's initial codec callback. Passing `benchmarkPlateFormat` into the
  fixture factory makes all four benchmark authority rows pass without a core
  change.
- The live P2 command had two ownership errors: no root scripts and a relative
  import rooted under `tooling/plite`. Resolving the repository root and live
  browser proof module closes scoped execution; raw mode still requires
  external device artifacts and fails closed without them.
- Strict Chromium exposed one committed stale button label in a codec proof
  test (`options` versus the current `state`). The exact row failed
  deterministically, the assertion was updated, and the focused row plus the
  full matrix passed.

Decisions and tradeoffs:

- Preserve current public/runtime architecture and repair proof callers. This
  keeps the change small while making strict claims executable.
- Raw device support remains unclaimed. A runnable raw command is useful even
  when this execution deliberately supplies no device artifact.

Review fixes:

- Strict proof repair: align the codec descriptor browser assertion with the
  current state terminology. No product code changed.
- Autoreview: no accepted/actionable findings; no review-triggered code change.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| `pnpm check:plite:dev` expanded through shared root inputs into unrelated `@platejs/callout` TS2883 errors | 1 | Prove owning packages and strict Plite-only stages | Browser owner and strict Plite stages passed independently |
| Strict Chromium invalidated by concurrent source changes | 2 | Wait for a stable source hash and resume bounded batches | Stable run completed |
| Codec descriptor browser test targeted stale `options` label | 2 | Verify rendered label, patch the clean committed assertion, rerun focused/full proof | Focused 1/1 and full Chromium pass |
| 1000-page pagination predicate timed out once | 1 | Rerun the exact row before changing code | Isolated row passed in 1.8s; resumed matrix passed |
| Final `pnpm check:plite` wrapper hit active unrelated floating-owner deletions before package/contracts/browser stages | 1 | Preserve passed scoped/strict-stage evidence and report the external owner | `@platejs/browser` remains green; floating/link files are outside the six-path packet |
| Collaboration cursor geometry assertion failed once | 1 | Rerun the exact row before changing code | Isolated row passed in 1.7s; no product change |
| Strict Chromium was invalidated by later floating and indent source edits | 2 | Resume only on a stable fingerprint; retain the completed packet-state matrix | Wrapper typecheck/packages/contracts pass; packet-state Chromium already passed 696 |
| Initial localization source-audit grep matched exclusion prose and an import path | 1 | Audit changed paths instead of arbitrary diff text | Six-path audit passed |

Verification evidence:

- `bun test --preload ./config/plite-source-test-setup.ts
packages/browser/test/core/mobile-device-proof-command.test.ts`: red 0/1
  before scoped command/path repair, then green 1/1; red 1/2 before raw command,
  then green 2/2.
- `bun test --preload ./config/plite-source-test-setup.ts
benchmarks/editor/benchmarks/plite-clipboard-large-payload-benchmark.test.ts`:
  reproduced 3 pass / 1 fail on unavailable `getOptions`, then passed 4/4
  after the caller repair.
- Combined focused proof:
  `bun test --preload ./config/plite-source-test-setup.ts
packages/browser/test/core/mobile-device-proof-command.test.ts
packages/browser/test/core/release-proof.test.ts
packages/browser/test/core/playwright-native-event-trace.test.ts
benchmarks/editor/benchmarks/plite-clipboard-large-payload-benchmark.test.ts`
  passed 19/19.
- `bun run test:mobile-device-proof` passed and explicitly reported that
  semantic/proxy rows cannot satisfy raw mobile claims.
- `pnpm turbo typecheck --filter=./packages/browser` passed.
- `pnpm --filter @platejs/browser test` passed 116/116.
- The strict Plite typecheck, package-test, and contract stages passed before
  the final six-path audit; the contract run included 126 Node tests, 66 Bun
  tests, 42 benchmark targets, and public type builds.
- Focused codec descriptor Chromium proof passed 1/1 after reproducing the
  stale-label failure. Full strict Chromium passed 696 with 6 intentional
  skips across 78 bounded batches.
- Final `pnpm check:plite` reached green typecheck, package tests, contracts,
  builds, public types, and 42 benchmark targets. Its Chromium stage was twice
  invalidated by live out-of-packet source edits (`packages/floating`, then
  `packages/indent`); the completed packet-state Chromium matrix remains the
  browser authority.
- Root Biome checked its three applicable paths; donor/browser paths preserve
  their existing single-quote style; scoped `git diff HEAD --check` passed.
- The final changed-path audit contains exactly six files and no package
  runtime, app product, localization, export, or registry owner.

Final handoff prepared:

- Ownership and target API/runtime: benchmark caller and browser proof
  workflow only; public/runtime owners unchanged.
- Public breaks and Plate/collaboration adoption: none.
- Applicable browser/benchmark/docs/provenance decisions: benchmark and
  Chromium apply; device, docs, provenance, registry, and release are N/A.
- Proof and execution risks: direct Android/iOS behavior remains unclaimed;
  a single uninterrupted wrapper run is unavailable while unrelated owners
  keep changing source during fingerprinted Chromium proof.
- Execution order and user attention: packet is complete after autoreview and
  the goal checker; device work remains a later explicit lane.

Timeline:

- 2026-07-27T20:09:40.691Z Plite Plan created.
- 2026-07-27T20:11Z One-shot goal created with real-device execution and
  `WG-STATE-012` excluded.
- 2026-07-27T20:14:51Z P1 and P2 focused red-green cycles passed; integrated
  package, strict, formatting, and review gates remain.
- 2026-07-27T22:35Z Full Chromium passed 696/696 executed tests after repairing
  one stale committed assertion; 6 intentional skips.
- 2026-07-27T22:40Z Final six-path source/format/proof audit passed; formal
  strict wrapper is externally blocked by active floating/link owner work.
- 2026-07-27T22:45Z Codex autoreview returned zero actionable findings at 0.84
  confidence.
- 2026-07-27T22:51Z Final strict wrapper passed typecheck, packages, contracts,
  builds, public types, and benchmark targets; browser resumption was
  invalidated only by later out-of-packet source changes.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | P1/P2 implementation, proof, and review complete |
| Where am I going? | Goal checker and handoff |
| What is the goal? | Close accepted P1/P2 packets without device runs or localization work |
| What have I learned? | Both failures were proof/caller ownership defects; no public or runtime change is needed |
| What have I done? | Repaired benchmark caller and root proof commands, corrected one stale strict assertion, and completed scoped plus Chromium proof |

Open risks:

- The final strict wrapper cannot retain a single Chromium fingerprint while
  unrelated owners change source. Its typecheck, package, contract, build,
  public-type, and benchmark stages are green, and a full packet-state Chromium
  matrix passed 696 executed tests.
- Direct Android/iOS phase behavior remains deliberately unproved until a
  future device lane supplies artifacts.
