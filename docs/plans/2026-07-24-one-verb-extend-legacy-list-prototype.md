# one verb extend legacy list prototype

Objective:
Prove one-verb `.extend()` on `BaseListPlugin` only; done when Core/legacy-list-model
type, runtime, declaration, and browser gates pass with zero type regression.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-24-one-verb-extend-legacy-list-prototype.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- package-api
- browser

Mode:
- `standard`; the user accepted the one-verb direction and explicitly said to
  prototype it before any hard cut.

Completion threshold:
- The existing `.extend*()` surface remains intact.
- Only `packages/platejs/src/features/list/src/lib/BaseListPlugin.ts` adopts the new
  one-verb path.
- New compile-only regression tests prove staged inference without casts,
  `any`, callback parameter annotations, `satisfies`, or helper/ferry types.
- Core focused tests/typecheck and legacy-list-model tests/typecheck/declaration
  proof pass with no attributable regression.
- The legacy-list-model browser demo renders and the exercised list interaction has
  no new console/network failure.
- Autoreview has zero accepted actionable findings and `check-complete` passes.

Verification surface:
- Core builder source and compile-only inference tests.
- Focused Core runtime plugin tests.
- `platejs` package tests, source-first typecheck, and declaration
  output check.
- Browser proof on the standalone legacy-list-model demo route if present; otherwise
  the nearest source-owned runnable legacy-list-model route with the exact caveat
  recorded.
- Scoped `rg` audits for adoption boundary and forbidden type workarounds.

Constraints:
- Execution is authorized by the user's explicit `ok go`.
- Do not hard-cut or remove any `.extend*()` method in this packet.
- Stop before retaining the prototype if it causes a type regression that the
  owning Core generic cannot repair cleanly.
- Do not fake inference with casts, `any`, explicit callback parameter types,
  `satisfies`, decorative config aliases, or helper/ferry types.
- Keep current filenames and topology; no line ceiling.
- No public compatibility aliases or runtime shims.
- Preserve existing runtime behavior and public legacy-list-model call shapes.

Boundaries:
- In scope: the minimum Core plugin-builder type/runtime owners and focused
  tests needed to express the accepted `.extend({ api, read, update,
  selectors, ... })` author shape; one adoption in
  `packages/platejs/src/features/list/src/lib/BaseListPlugin.ts`; focused package tests,
  release artifact, browser proof, and this plan.
- Source owners: `packages/core/src/lib/plugin/*`, the matching Core plugin
  runtime resolver/merge owners, Core type tests, and
  `packages/platejs/src/features/list/src/lib/BaseListPlugin.ts`.
- Non-goals: migrating any other plugin/package, deleting specialized
  `.extend*()` methods, compatibility cleanup, unrelated list behavior or file
  colocation, and skill/doctrine repair.
- Direct Plite boundary owners: transaction state-view publication in
  `tx-only.ts`, `interfaces/editor.ts`, `editor-lifecycle-api.ts`, and the
  internal export. Live RED proof showed speculative and active transactions
  need read-group methods without exposing them as direct updates.

Output budget strategy:
- Read the full coherent `BaseListPlugin.ts` owner in bounded chunks; read exact
  Core type/runtime owners and focused tests. Count/file-list repo-wide
  `.extend({ api })` collisions before printing matches. Exclude generated
  output, dependencies, build caches, and unrelated packages from broad scans.

Blocked condition:
- Stop this packet when the cleanest owner-generic implementation still
  regresses existing Core/legacy-list-model inference, declaration emit, runtime
  behavior, or the runnable browser surface. Preserve existing `.extend*()`
  APIs and report the exact failing proof; do not start the hard cut.

Plate Plan state:
- status: done
- phase: prove-and-hand-off
- next: none; await a separate hard-cut decision
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Exact scope, no-hard-cut boundary, type-regression stop, and workaround bans are recorded above |
| Active goal and plan verified | yes | Goal `019f89e5-1b47-7f02-b27b-293bbd49566d` names this exact plan |
| Current owners read | yes | Read all 2,563 lines of `BaseListPlugin.ts`; read Core `BasePlugin.ts`, `PluginConfig.ts`, `createBasePlugin.ts`, `resolvePlugin.ts`, `resolvePlugins.ts`, `mergePlugins.ts`, plugin runtime types, and Plite extension/state/transaction owners |
| Best API target resolved | yes | Accepted target from the active user design thread: one repeated `.extend()` widening verb; this packet tests it without removing specialized verbs |
| Mode and execution boundary resolved | yes | Standard one-shot execution; only BaseListPlugin adoption plus owning Core prerequisite |
| Package/API pack selected | yes | Public Core authoring API/type surface changes |
| Public surface or package boundary identified | yes | `@platejs/core` builder API plus internal `platejs` adoption |
| Release artifact path selected | yes | Compare against `main`; add one Core changeset if retained public delta exists; no legacy-list-model changeset absent user-visible delta |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read completely before edits |
| Barrel/export impact decision recorded | yes | No expected file/export move; run `pnpm brl` only if live implementation changes exported layout |
| Browser pack selected | yes | `packages/**` change requires runnable package-facing browser proof |
| Browser route / app surface identified | yes | Candidate `/blocks/list-demo`; verify live route before proof |
| Browser tool decision recorded | yes | Use Browser plugin for ordinary route interaction |
| Console/network caveat policy recorded | yes | Record all new errors; do not claim clean if existing noise cannot be distinguished |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset` for a retained Core public delta; no registry changelog.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset. N/A: this is package source.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`. legacy-list-model adoption is internal if behavior/API is unchanged.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes. Additive prototype only; hard cut forbidden.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof. Open the legacy-list-model demo, create/toggle a list, and confirm visible list behavior.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Retain prototype; no attributable type/runtime regression |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source-first typecheck, runtime tests, declaration emit, scoped topology audit |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Accepted repeated `.extend()` checkpoint model; no hard cut in this packet |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work | One-file adoption, Core/Plite owner repair, package proof, Browser A/B |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and results below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section below |
| Autoreview | yes | Run implementation review | Clean: zero accepted/actionable findings |
| Goal plan complete | yes | Run `check-complete.mjs` | Run after this final plan update |
| Public API / package boundary proof | yes | Audit public API, exports, and package boundary impact | Additive Core author API; internal Plite marker/export; list adoption only |
| Release artifact classification | yes | Classify published deltas | Core and Plite patch changesets; no legacy-list-model release delta |
| Published package changeset | yes | Add package changesets and prove no forbidden minor | `unified-plugin-extend.md` and `transaction-read-groups.md`, both patch |
| Registry changelog | no | Registry-only work uses registry changelog | No registry source changed by this packet |
| No release artifact | yes | Explain packages without artifact | legacy-list-model adoption preserves behavior and consumer API |
| Package typecheck/build/test | yes | Run owning package checks | 16/16 type tasks; Core 98/98; list build; list 88/90 with two exact A/B baselines |
| Barrel/export generation | yes | Run scoped barrels | Core and Plite `brl` completed with no generated delta |
| Browser interaction proof | yes | Exercise target route/interaction | Demo rendered; numbered-list click was exact A/B tested |
| Browser console/network check | yes | Record console/network state | Toggle crash reproduced with unified `.extend()` and old `.extendTx`; no prototype-attributable error |
| Browser final proof artifact | yes | Record route/DOM/native proof or caveat | `/blocks/list-demo` DOM showed heading, Cats, Navy blue; interaction caveat recorded |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Full legacy-list-model owner and exact Core/Plite accumulator/runtime owners read | Write RED type contract |
| Decide | complete | RED contracts required Core accumulation plus Plite transaction read parity | Implement minimum substrate and one adoption |
| Prove and hand off | complete | Type/runtime/declaration/build/browser A/B/review proof recorded | Separate hard-cut decision |

Decision brief:
- outcome: prove whether one widening `.extend()` verb can carry the full
  inferred plugin author context on one real large plugin.
- chosen shape: repeated `.extend(...)` stages accumulate inferred plugin API,
  reads, updates, selectors, and ordinary descriptor contributions; existing
  specialized methods remain during the experiment.
- strongest rejected alternative: mix `.extend()` and `.extend*()` permanently
  by capability. That creates two typing models and makes author choice
  arbitrary.
- consequence: retain only if the owning generic/runtime path is clean and all
  old inference stays green; otherwise stop before adoption/hard cut.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Core author builder | `.extend()` widens a partial subset; specialized verbs own other capability destinations | One `.extend()` stage can widen every supported author destination while specialized verbs remain callable | Core plugin builder | Proves the final one-verb model without a repo hard cut | Core-only substrate plus focused type/runtime tests | RED/GREEN compile-only test, Core runtime tests/typecheck | Generic key widening or runtime routing collision | accepted for bounded prototype |
| legacy-list-model owner | `BaseListPlugin` uses staged specialized builder calls | Only this plugin uses repeated `.extend()` stages | `BaseListPlugin.ts` | Largest coherent real owner exercises staged inference | No other package adoption | legacy-list-model typecheck/tests/declaration/browser | Inference loss inside long chain | accepted with stop gate |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Contract | Core | Compile-only and runtime regression tests | Current builder fails exact target call shape | Observe RED without workarounds | Focused Core test command |
| 2. Substrate | Core | Minimum generic and runtime fan-out | RED contract exists | GREEN contract; existing specialized methods still pass | Core tests/typecheck |
| 3. Adoption | legacy-list-model | `BaseListPlugin.ts` only | Core substrate GREEN | No specialized calls remain in this one file; package inference passes | legacy-list-model tests/typecheck/declaration |
| 4. Closure | release/browser/review | Changeset if main-relative public delta; browser proof; autoreview | Code/package proof GREEN | All gates recorded or exact type-regression stop reported | route proof, review, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Exact final author shape infers across repeated stages | Current Core builder/type tests | Compile-only contract covers API/read/update/selectors/spec and active tx | passed |
| Runtime portal/update behavior is unchanged | Current resolver/merge owners | Core focused runtime 98/98; new case has 13 assertions | passed |
| BaseListPlugin alone can adopt with no type workaround | Full source owner and scoped adoption audit | list typecheck/build/declaration; no specialized builder remains in target | passed |
| Package-facing list behavior has no prototype regression | Standalone demo source | Demo renders; toggle crash reproduces identically under `.extendTx` A/B | passed with baseline caveat |

Conditional evidence:
- High-risk scenarios: public generic accumulation, declaration emit, runtime
  routing, active transaction reuse, and backward compatibility of existing
  `.extend*()` calls.
- External research: N/A; current Core source/types/tests are authoritative.
- Issue/PR provenance: N/A; direct user-requested local API experiment.
- Docs/registry/browser/release/behavior-law owners: browser and Core changeset
  apply if retained; docs/registry do not unless live adoption proves otherwise.

Findings:
- Prior accepted design rejects a permanent split between `.extend()` and
  capability-specific widening verbs; this packet tests that design on one
  large owner before deletion.
- `BaseListPlugin.ts` is the single coherent headless behavior owner; its full
  chain must be read, not sampled.
- The file contained five `.extendTx()` stages and seven
  `.extendExtension()` stages. All 12 authoring stages now use `.extend()`;
  unrelated `state.transaction.extend(...)` calls remain transaction APIs.
- The accepted target is exact: `.extend()` contributions use plugin-scoped
  `api`, state-bound `read`, transaction-bound `update`, `selectors`, and
  `extension`; ordered calls are the inference checkpoints.
- Current Core `.extend()` accumulates only options, root API, and selectors.
  Its callback result is merged as generic plugin config, so selectors are not
  published and `read` / `update` / `extension` do not exist.
- Plite already models state groups on `editor.read` and tx groups on
  `editor.update`, but active/spec transactions currently omit installed state
  groups. A truthful transaction-local `read` needs that owner repaired rather
  than a Plate cast or nested committed read.
- The only live plugin `.extend({ api })` root-API behavior found is a focused
  Core collision test; production callers use `.extendEditorApi()` or editor
  extensions. The prototype must still make any semantic repurposing explicit.

Decisions and tradeoffs:
- Keep all specialized builders during the experiment -> isolates inference
  risk from deletion risk -> temporary duplicate authoring paths are allowed
  only for this proof packet.
- Prototype is a bounded Core type/runtime experiment, not the
  `prototype` skill's terminal-logic or UI-prototype branch -> no fake
  throwaway app is created.
- Compile `read` to a Plite state group and `update` to a Plite tx group under
  the plugin key -> root and portal call shapes stay aligned and active
  transactions observe their own draft -> requires focused Plite transaction
  state-group parity proof.

Review fixes:
- Narrowed the unified overload to capability-bearing contributions so legacy
  config-only `.extend(options)` inference remains unchanged.
- Removed a narrowed `context.editor.read` type that violated existing editor
  variance; plugin-local `context.read` and factory `state` retain inference.
- Preserved direct option inference instead of widening options through the
  unified capability contract.
- Kept `txRead` internal and excluded read methods from one-shot direct update
  dispatch while retaining them in active/spec transaction views.
- Final autoreview: zero accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Expected RED: current `.extend()` treats read/update contracts as option widening and exposes no editor/portal groups | 1 | Repair owning Core/Plite accumulation and publication | Resolved by unified capability contract and state/tx publication |
| Narrowing `context.editor.read` caused Core variance failures | 1 | Keep own plugin reads on `context.read`; leave editor aggregate structurally broad | Resolved; full Core typecheck passes |
| Unified overload captured legacy config-only `.extend(options)` and regressed option inference | 1 | Require at least one special capability key before selecting unified overload | Resolved; existing Core contracts pass |
| `BaseTodoListPlugin.update.toggle` disappeared during early inference | 1 | Infer direct capability fields before accumulation | Resolved; emitted declaration contains `toggle: () => void` |
| Two legacy-list-model tests fail on current shared source | 2 | Exact A/B with old `.extendTx` plus source inspection | Baseline: stale diagnostic regex and malformed nested-list fixture; identical under old path |
| Browser numbered-list toggle throws from OverridePlugin correction | 1 | Reload and exact A/B with main stage restored to `.extendTx` | Baseline/shared-tree failure; identical error and unchanged DOM under both paths |

Verification evidence:
- RED: `pnpm --filter @platejs/core typecheck:contracts` reported missing
  contextual state/tx and missing accumulated editor/portal groups.
- `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plite
  --filter=./packages/platejs/src/features/list` -> 16/16 tasks passed.
- Core focused runtime command -> 98/98 tests, 242 assertions.
- Unified runtime case -> 1/1 test, 13 assertions.
- legacy-list-model explicit runtime command -> 88/90; both failures reproduced
  unchanged with the old `.extendTx` path and are itemized above.
- `pnpm --filter platejs build` -> passed; declaration retains
  `ListPluginTransaction`, inferred task-list `toggle`, and contains no `any`.
- Scoped Biome -> 16/16 files clean after one formatting fix.
- Scoped Core and Plite `brl` -> passed with no generated barrel delta.
- Browser `/blocks/list-demo` -> rendered expected list DOM; exact
  unified/old toggle A/B produced the same pre-existing correction error.
- `.agents/skills/autoreview/scripts/autoreview --mode local` -> clean, zero
  accepted/actionable findings.

Final handoff prepared:
- Ownership and target API: repeated `.extend()` can add plugin API, read,
  update, selectors, and raw editor extensions with prior-stage inference.
- Public breaks and adoption: none; every specialized `.extend*()` remains.
  Only `BaseListPlugin.ts` adopts the prototype.
- Runtime/package decision: retain the additive prototype. Core/Plite/list
  type and declaration gates are green; Core runtime is green.
- Caveats: two list tests and the demo list toggle are broken on the shared
  source independently of this prototype, proven by exact old/new A/B.
- Next action: do not hard-cut yet. Make that a separate packet after the
  baseline list/schema correction failure is owned or explicitly accepted.
- Proof and execution risks: the unified API itself is green; the shared
  list/schema correction failure blocks a clean browser/list-suite claim.
- Execution order and user attention: preserve specialized builders, repair or
  accept the baseline list failures, then decide the hard cut separately.

Timeline:
- 2026-07-24T18:26:32.960Z Plate Plan created.
- 2026-07-24T18:34:00Z Read the complete legacy-list-model owner and the exact
  Core/Plite accumulator, publication, portal, and transaction owners.
- 2026-07-24T18:38:00Z Added the public-interface unified List compile contract
  and observed the expected Core typecheck RED.
- 2026-07-24T21:20:00Z Final Core/Plite/list typecheck passed 16/16 tasks;
  Core runtime passed 98/98 and list declaration build passed.
- 2026-07-24T21:25:00Z Browser A/B reproduced the same list-toggle correction
  crash with unified `.extend()` and old `.extendTx`.
- 2026-07-24T21:30:00Z Autoreview returned zero accepted/actionable findings.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prototype and stop-gated proof complete |
| Where am I going? | No hard cut in this packet; separate decision after baseline ownership |
| What is the goal? | Prove one-verb `.extend()` without type regression or hard cut |
| What have I learned? | One accumulator works cleanly; read groups need transaction-local Plite publication |
| What have I done? | Implemented Core/Plite substrate, migrated only BaseListPlugin.ts, and completed type/runtime/declaration/browser A/B/review proof |

Open risks:
- No unresolved prototype type risk. Legacy config-only inference and existing
  specialized methods pass their contracts.
- Shared list/schema correction remains broken in two package rows and the
  browser toggle path; exact old/new A/B proves it is independent.
