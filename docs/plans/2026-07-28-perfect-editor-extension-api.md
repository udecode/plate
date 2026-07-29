# perfect editor extension api

Objective:
Ship the accepted `EditorExtension` API hard cut; done when source, callers,
docs, public contracts, checks, and review pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-28-perfect-editor-extension-api.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- none

Mode:
- `standard` accepted-plan execution.

Completion threshold:
- All accepted public changes are implemented without compatibility aliases:
  descriptor-based `read`; no `mergeTarget` / `selectability` / `exportSlice`
  root slots; `contributions`; `on.*`; no `options`; explicit low-level
  descriptor slot names; `afterPublish`.
- Every source, type, export, Plate adapter, test, docs, example, and changeset
  consumer is migrated; stale-symbol audits return zero outside historical
  planning/research artifacts.
- Focused Plite/Plate type and test proof, strict Plite handoff proof,
  documentation checks, lint, autoreview, and `check-complete` pass.

Verification surface:
- Focused package typechecks/tests for `plite`, `plite-dom`, `plite-react`,
  `plite-history`, `yjs`, and direct Plate package adopters.
- Public/type-contract and extension-configuration tests plus stale-symbol
  source/docs/export audits.
- `pnpm check:plite:dev` during iteration and `pnpm check:plite` at handoff.
- `pnpm lint:fix`, documentation checks required by the changed owners,
  `autoreview`, and the final autogoal checker.

Constraints:
- User explicitly accepted the complete target and authorized execution,
  including documentation.
- No public compatibility aliases or runtime shims.
- Preserve read purity, generator safety, `next()`-once enforcement,
  extension order, configuration rollback, tx-local reads, and inference.
- Do not claim raw-device behavior. Chromium regression proof covers the
  existing browser surface; real Android/iOS device proof remains excluded.

Boundaries:
- In scope: Plite extension public types/runtime/registry, read descriptors,
  all direct packages and Plate adapters, tests/type contracts, exports,
  current docs/examples, and a changeset.
- Source owners: `packages/plite`, `packages/plite-dom`,
  `packages/plite-react`, `packages/plite-history`, `packages/yjs`,
  `packages/core`, and direct package extension declarations.
- Non-goals: compatibility aliases, unrelated editor behavior changes,
  external editor rescan, real-device mobile proof, release publication, and
  historical plan/research rewrites.
- Direct Plate/collaboration adoption owners: `packages/core` normalizer and
  every package declaring raw Plite extensions, including Yjs.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if the accepted shape proves internally contradictory after three
  distinct implementation approaches, or an unrelated environment/tool owner
  prevents every focused verification path.

Plite Plan state:
- status: complete
- phase: prove-and-hand-off
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Every accepted cut, full execution, and docs requirement is recorded above |
| Active goal and plan verified | yes | Active goal names this plan and the all-green threshold |
| Current owners read | yes | Live `EditorExtension`, registry, lifecycle, DOM output, read-policy, Plate normalizer, docs, and production declarations were audited before acceptance |
| Best API target resolved | yes | User accepted the complete 26/26-field `best-api` verdict in chat |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution; no approval pause remains |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one accepted `best-api` verdict.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have complete adoption/deletion answers; no bridge is allowed.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Implement the public types, runtime, registries, descriptors, and lifecycle.
- [x] Migrate every package, Plate adapter, test, type contract, export, and example.
- [x] Rewrite current documentation and add a changeset.
- [x] Run focused proof, stale-symbol audits, strict handoff proof, lint, and autoreview.
- [x] Record final evidence, risks, reboot status, and pass `check-complete`.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | complete: implementation, migration, docs, proof, and review are closed |
| Fresh source evidence | yes | Recheck decision-changing current claims | zero exact stale API symbols; proved source byte-compared against the live checkout |
| Best API review | yes | Implement every accepted P0-P2 shape finding | complete: accepted hard cut implemented with no aliases |
| Conditional risk and adoption | yes | Complete all package/docs/type adoption; browser regression applies, while benchmark/provenance and raw-device claims are N/A | complete: direct adopters, strict Chromium, and current docs are proved |
| Verification recorded | yes | Record fresh source, type, test, docs, lint, and strict Plite proof | complete; exact commands and limitations are below |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | complete |
| Autoreview | yes | Run on the complete implementation and resolve accepted findings | complete: one accepted P2 fixed; second scoped pass returned zero findings |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-28-perfect-editor-extension-api.md` | ready for final checker |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live 26-field API, runtime owners, production consumers, docs, and prior read middleware audited | Implement |
| Decide | complete | User accepted the complete hard-cut target | Implement |
| Implement | complete | Public substrate, registries, lifecycle, all direct adopters, exports, docs, doctrine, and changeset migrated | Prove and hand off |
| Prove and hand off | complete | Focused proof, strict stable-snapshot proof, scoped lint, docs check, stale audit, byte comparison, and clean autoreview | Final handoff |

Decision brief:
- outcome: One coherent editor-wide extension substrate with typed read
  middleware, explicit contribution terminology, grouped callbacks, canonical
  config, and no special app-policy roots.
- chosen shape: Flat `EditorExtension` except `on.*`; descriptor-owned `read`
  and `contributions`; explicit registration nouns; `activate` stays flat.
- strongest rejected alternative: Keep the three special read-policy hooks and
  vague `outputs`/root `on*` fields to minimize churn.
- consequence: A deliberate breaking sweep across Plite, Plate adapters,
  packages, tests, exports, docs, and release notes.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Read policy | `mergeTarget`, `selectability`, `exportSlice` root hooks | `read: ({ around }) => [...]` over typed `editorReads` descriptors | `packages/plite` | Preserve general downstream pure-read extensibility | Core runtime plus Override/Toggle/Table/Diff callers and contracts | focused middleware/read/normalization/slice tests | tx-local state and generator recursion | rearchitect |
| Cross-extension values | `outputs`, `defineExtensionOutput`, `context.outputs` | `contributions`, `defineExtensionPoint`, `getContributions` | `packages/plite`, `packages/plite-dom`, Plate normalizer | The values are ordered typed contributions, not callback output | host codecs, clipboard sugar, configuration contexts, exports/docs/tests | extension configuration/output contracts and DOM package tests | ordering/identity regression | rename |
| Change callbacks | four root `on*` slots | `on.{transactionChange,commit,nodeChange,textChange}` | `packages/plite` plus all extension declarations | One coherent family earns one namespace; `on` does not falsely promise purity | all package declarations, registry, canonicalization, docs/tests | commit/change/transaction contracts and package typechecks | missed callback during migration | rearchitect |
| Runtime input | `options` and `context.options` beside immutable `config` | canonical `config` in lifecycle/configuration contexts; opaque resources close over extension factories | `packages/plite`, history, docs/tests | Remove redundant mutable descriptor channel | history and generic extension contracts | configuration clone/equivalence/lifecycle tests | closure/equivalence assumptions | cut |
| Low-level registrations | `fields`, `effects`, `facets`, `selections` | `stateFields`, `effectTypes`, `facetProviders`, `selectionKinds` | `packages/plite` plus AI/Table consumers | Names declare descriptor kinds instead of looking like runtime values | runtime registry, state-field helper, packages, docs/tests | state/effect/facet/selection contracts | broad mechanical churn | rename |
| Publication callback | `onReady` | `afterPublish` | `packages/plite`, DOM/history/Yjs lifecycle owners | Name the exact publication guarantee | activation contexts, docs/tests, runtime owners | extension publication/rollback/lifecycle tests | ordering regression | rename |
| Stable slots | flat `schema`, `state`, `tx`, `commands`, `corrections`, `api`, `activate`, `validateConfiguration`, identity/composition | keep flat | existing owners | No hierarchy justifies extra nesting | documentation and type surface only | package typechecks and public contracts | none beyond surrounding sweep | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core shape | `packages/plite` | types, read descriptors/runtime, registry, canonicalization, lifecycle contexts | accepted target | core compiles with no old slot/runtime names | focused Plite typecheck/tests |
| 2. Runtime adopters | Plite DOM/React/history/Yjs and Plate core | contribution, callback, config, publication, and normalizer migrations | core shape compiles | direct adopters compile and focused tests pass | package typechecks/tests |
| 3. Feature adopters | direct Plate packages | read registrations, callback namespace, explicit registration names | adapters compile | all production declarations migrated | affected package typechecks/tests |
| 4. Public teaching | exports, docs, examples, changeset | current-state API only | source settled | zero stale current API names | docs/type/export audits |
| 5. Closure | repo proof/review | focused, strict Plite, lint, autoreview, checker | implementation complete | all required gates green | recorded commands and review |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Read middleware fully replaces bespoke policy slots | current special policies and prior general middleware audited | 10 read-registry tests, public type contracts, strict package/browser proof, zero exact special-slot matches | pass |
| Contribution ordering/type identity preserved | current output registry and DOM consumers audited | 3 contribution-registry tests plus 76 DOM public/clipboard tests | pass |
| Lifecycle publication/rollback preserved | current activation implementation and owners audited | 69 configuration/change tests, 12 history tests, and 216 Yjs tests | pass |
| Every production and public consumer migrated | static production declaration inventory and public type audit | direct Plite/Core/Diff/Table/Toggle/Yjs typechecks and focused tests; zero exact stale symbols | pass |
| Current docs teach only the final API | current extension docs audited | `pnpm --filter www check:docs` and current-source audit | pass |

Conditional evidence:
- High-risk scenarios: read middleware accidentally sees committed rather than
  transaction-local state; extension contribution order changes; lifecycle
  cleanup or publication timing changes.
- External research: N/A; accepted source comparison is already complete and
  current repository owners are authoritative.
- Issue/PR provenance: N/A; this is user-authorized local architecture work.
- Browser/benchmark/docs/release/behavior-law owners: strict Chromium and docs
  proof apply. Benchmark, release publication, public-issue provenance, and
  raw-device proof are N/A because no performance, release, issue, or
  hardware-device claim is made.

Findings:
- Current worktree exposes 26 `EditorExtension` fields; the accepted target
  reduces ambiguity while retaining every materially distinct capability.
- `outputs` is a real ordered typed registry used by DOM clipboard and host
  codecs; only its public vocabulary changes.
- `activate` is a real synchronous resource owner used by DOM, history, and
  Yjs and remains flat.
- `onTransactionChange` may mutate the active transaction, so `on` is accurate
  while `observe` would be false advertising.
- `read` is a descriptor-keyed around-middleware registry. It preserves draft
  state, rejects repeated delegation, and runs iterator cleanup on failure.
- `contributions` is an ordered extension-point registry; lifecycle contexts
  expose `getContributions`, immutable `config`, and `afterPublish`.

Decisions and tradeoffs:
- Break compatibility completely to avoid two public extension grammars.
- Keep only `on` nested; category namespaces would add ceremony and vague
  buckets.
- Keep `config` as canonical immutable descriptor data; factory closures own
  opaque runtime resources.

Review fixes:
- Scoped autoreview found one P2: the dispatcher treated an intentional
  `undefined` returned after `next()` as an omitted handler return. The
  dispatcher now preserves the explicit result, every delegating handler
  returns it, and a regression test covers the case.
- The second complete scoped autoreview returned zero findings and judged the
  patch correct.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Live strict browser proof invalidated by unrelated source mtime writes | 2 | Clone the exact checkout with APFS copy-on-write and prove the stable copy | strict proof passed in the stable copy |
| Stable-copy browser proof inherited Node 24 | 1 | Run the complete gate through installed repo Node 22 | passed with `fnm exec --using=v22.22.1` |
| Root lint included unrelated editor-audit/artifact WIP | 1 | Lint the complete task-owned file set and record root-scope ownership | 27 primary task files passed Biome; root failure remains unrelated |
| Published docs route returned 404 | 1 | Verify the docs source owner directly | docs check passed; the Plite docs section is not published in the local site nav |

Verification evidence:
- `pnpm brl` passed after public export changes.
- Focused contracts passed: read registry 10/10, contribution registry 3/3,
  configuration/change 69, Plite DOM public/clipboard 76, history 12, and Yjs
  216.
- Direct package typechecks passed for Plite, Plite DOM, Plite History, Plite
  React, Core, Diff, Table, Toggle, and Yjs. Core was rechecked after two
  unrelated input-rule type edits landed in the live checkout.
- `pnpm --filter www check:docs` passed. Browser navigation to
  `/docs/plite/concepts/08-extensions` returned 404 because the Plite docs
  section is unpublished; no rendered docs claim is made.
- Scoped Biome passed on 27 primary implementation files.
- `git diff --check` passed across every changed package/docs/doctrine owner in
  scope.
- Exact stale-symbol searches returned zero matches for the removed special
  read slots and extension-output vocabulary. Remaining `outputs` and
  `onCommit` matches belong to unrelated projection data or the React provider
  prop.
- `fnm exec --using=v22.22.1 pnpm check:plite` passed in the stable
  copy-on-write checkout: typecheck, package tests, 126 tooling contracts, 69
  benchmark/public contracts, public type/release builds, and Chromium with
  698 passed, 6 skipped, and 78 bounded batches.
- All compared task source, tests, docs, and doctrine byte-match the proved
  snapshot. Two later live Core diffs are confined to unrelated input-rule
  type definitions and pass a fresh Core typecheck.
- Scoped autoreview passed after the one accepted P2 fix; final findings: zero.
- `pnpm check:plite:dev`, root `pnpm lint:fix`, and the www whole-package
  typecheck encountered existing unrelated DnD/editor-audit/current-tree WIP.
  They are not used as green claims.

Final handoff prepared:
- Ownership and target API/runtime: `packages/plite` owns typed reads,
  extension points, lifecycle contexts, and the final descriptor shape.
- Public breaks and Plate/collaboration adoption: complete across DOM, React,
  History, Yjs, Core, Diff, Table, Toggle, tests, exports, and docs.
- Applicable browser/benchmark/docs/provenance decisions: Chromium and docs
  apply; raw devices, benchmark claims, release publication, and issue
  provenance do not.
- Proof and execution risks: no accepted task finding remains. The live
  checkout has unrelated concurrent WIP, recorded above without modification.
- Execution order and user attention: implementation is ready for normal
  review/commit flow; no API decision remains.

Timeline:
- 2026-07-28T23:14:13.921Z Plite Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final closure |
| Where am I going? | Goal checker, then handoff |
| What is the goal? | Ship the complete accepted extension API without aliases |
| What have I learned? | Typed reads and ordered extension points replace app-policy roots without weakening lifecycle or transaction guarantees |
| What have I done? | Implemented, adopted, documented, proved, and reviewed the complete hard cut |

Open risks:
- Real Android/iOS hardware behavior is unproved by explicit user scope.
- Unrelated concurrent checkout edits can invalidate whole-tree monitor runs;
  the task-owned source is byte-matched to the stable strict proof and the two
  later unrelated Core type changes pass fresh typecheck.
