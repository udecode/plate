# Hard-cut Yjs public entrypoints

Objective:
Execute the accepted Yjs entrypoint hard cut; done when all adoption, packed,
docs, browser, strict Plite, and P1 review gates pass; plan
`docs/plans/2026-08-23-hard-cut-yjs-public-entrypoints.md`.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-23-hard-cut-yjs-public-entrypoints.md

Template:
docs/plans/templates/plite-plan.md

Primary template:
docs/plans/templates/plite-plan.md

Applied packs:
- `package-api`
- `docs`

Mode:
- `standard`: the accepted target is a public package break spanning Yjs,
  Plite React, Plate adoption, docs/examples, source aliases, and packed proof.

Completion threshold:
- All five accepted execution slices are applied without a compatibility path.
- Exact owned-source audits find zero public `@platejs/yjs/core` references and
  zero `YjsPlugin` imports from `@platejs/yjs/react`.
- Yjs package tests/typecheck, Plite contracts, packed entrypoint boundaries,
  docs parsing/typecheck, three focused Chromium files, and strict
  `pnpm check:plite` pass.
- `best-api repair`, P1 `autoreview`, and final `check-complete` close with no
  unresolved required finding or gate.

Verification surface:
- Current-source audit of Yjs exports, build entries, dependency metadata,
  source aliases, terminal consumers, package/type smokes, release fixtures,
  docs, and examples.
- One resolved concept ledger, ordered execution slices, three realistic risk
  scenarios, and an exact packed runtime/declaration proof matrix.
- `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-23-hard-cut-yjs-public-entrypoints.md`.
- Final implementation proof from focused package/type checks, isolated packed
  Node/NodeNext/Bundler consumers, docs checks, three Chromium files, strict
  Plite, exact source audits, `best-api repair`, and P1 `autoreview`.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plite-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve Yjs collaboration behavior, schema identity, provider ownership,
  and Plite/Plate runtime law; this plan changes package reachability and public
  imports, not collaboration semantics.
- Treat external beta adoption as unknown. Do not infer low adoption from the
  repository-only consumer inventory.

Boundaries:
- In scope: `@platejs/yjs` export map, build entries and barrels; optional-peer
  reachability; source aliases; package/type/import contracts; packed release
  fixtures; Yjs README and Plite/Plate collaboration docs/examples; current
  application consumers; one `@platejs/yjs` changeset decision.
- Source owners: `packages/yjs`, package/release artifact scripts, consuming
  Plite/Plate source aliases and type smokes, and Yjs teaching surfaces.
- Non-goals: collaboration runtime redesign, provider behavior, history,
  browser/device behavior, performance, Yjs compaction, the unrelated
  `plite-history` and `plite-react` README defects, a `release-ready` producer,
  publication, commit, push, or PR.
- Direct Plate/collaboration adoption owners: `BaseYjsPlugin`, `YjsPlugin`,
  Plate collaboration docs/example imports, Plite Yjs examples, public package
  smokes, and packed package-boundary fixtures.

Prompt requirements:
- [x] `@platejs/yjs` is the Plite/Yjs kernel entrypoint.
- [x] `@platejs/yjs/react` contains Plite React hooks and must not reach
  `@platejs/core`.
- [x] `@platejs/yjs/plate` contains `BaseYjsPlugin` and `YjsPlugin`.
- [x] `@platejs/yjs/core` is removed without a public alias or compatibility
  bridge.
- [x] Adoption covers exports, build entries, peer boundaries, source aliases,
  current consumers, Plate collaboration surfaces, docs/examples, public
  import/type smokes, and packed release fixtures.
- [x] Execution proof covers isolated packed runtime imports plus NodeNext and
  Bundler declaration consumers for `.`, `/react`, and `/plate`.
- [x] External beta adoption remains unknown.
- [x] Unrelated README repairs and `release-ready` producer work stay outside
  this plan; package-only publication remains the selected claim.
- [x] This activation produces a plan only and stops before implementation.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if a decision-changing current owner cannot be read or if live
  source proves the accepted import map violates a hard runtime/package law and
  `best-api` cannot resolve it from available evidence. Unknown external beta
  adoption is recorded as migration risk, not a planning blocker.

Plite Plan state:
- status: complete
- phase: execution closed
- next: none; every accepted implementation and proof gate is closed
- handoff: complete

Execution activation:
- [x] User accepted this exact plan with `go` after the planning handoff.
- [x] New one-shot execution goal names this plan and all required proof lanes.
- [x] Scope remains the accepted Yjs entrypoint hard cut; no collaboration
  redesign, unrelated README repair, release-ready producer, publication, git
  commit, push, or PR is authorized.
- [x] Output stays bounded to named package, config, adopter, docs, proof, and
  review owners; generated history, old plans, binaries, build output, and
  broad repository scans stay excluded.

Execution Work Checklist:
- [x] Slice 1: root, `/react`, `/plate`, and deleted `/core` package topology is
  implemented with dependency-honest peers and package contracts.
- [x] Slice 2: source aliases, transplant mapping, public smokes, and isolated
  packed runtime/declaration fixtures match the final package map.
- [x] Slice 3: Plate/Plite adopters, mocks, README, EN/CN docs, and examples use
  only the final entrypoints.
- [x] Slice 4: the existing major Yjs changeset describes the final 53.x-to-v54
  migration and barrel/export generation is resolved.
- [x] Slice 5: focused packages, packed boundaries, docs, three Chromium files,
  strict Plite, `best-api repair`, and P1 `autoreview` pass.
- [x] Exact stale-path audits pass and no compatibility alias, shim, dead test,
  or branch-history release prose remains.
- [x] Final evidence, execution risks, reboot state, and handoff are current.

Execution Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Final public package map | yes | Implement root, `/react`, and `/plate`; delete public `/core` | `@platejs/yjs` tests: 221 passed; source-first Yjs typecheck passed |
| Complete owned adoption | yes | Migrate aliases, smokes, consumers, docs, examples, and fixtures | Zero bounded stale imports; schema, table/Yjs, demo, source alias, and public smoke owners pass |
| Published migration note | yes | Amend the existing major Yjs changeset relative to 53.x | Existing major Yjs changeset names root, `/react`, and `/plate`; no second changeset |
| Focused package and contract proof | yes | Pass Yjs tests/typecheck and Plite contract owners | Yjs 221 tests and 11-task typecheck pass; final contracts pass 171 Node tests, 74 Bun tests, 44 benchmark targets, public package types, and all 13 builds |
| Packed runtime and declarations | yes | Pass isolated Node, NodeNext, and Bundler proof for all three entrypoints | `pnpm plite:release:boundaries` passes all root, `/react`, and `/plate` fixtures |
| Docs and adopter proof | yes | Pass docs parser/typecheck and exact source audits | docs source build and full www typecheck pass |
| Browser proof | yes | Pass the three named Chromium files with no runtime errors | Focused Chromium batch passes 4/4; fresh in-app Browser replay proves reconnect undo/redo |
| Strict Plite proof | yes | Pass `pnpm check:plite` on final bytes | Passed in 392.7s on exact final product bytes: all typechecks, package tests, contracts, public types, 13 builds, and Chromium with 709 passed, 8 intentional skips, and 79 bounded batches |
| Best API repair | yes | Audit final public call shape and repair stale doctrine/workers if required | complete: optional-peer reachability doctrine added to `best-api` and shared Vision; `pnpm install` regenerated mirrors; resource parity and stale-shape audits pass; no worker contradiction found |
| P1 autoreview | yes | Resolve every current P0/P1 finding within the three-invocation cap | Invocations 1 and 2 were clean. Invocation 3 reviewed the broad checkout after formatting; its only P1 quoted this plan's obsolete pre-fix red result and is rejected by the exact 3/3 focused rerun and final 709-test strict pass. Its second chunk found no defect. |
| Goal plan complete | yes | Pass final `check-complete` after all real evidence is recorded | `[autogoal] complete` on the closed execution plan |

Execution phase table:
| Slice | Status | Evidence | Next |
| --- | --- | --- | --- |
| 1. Package entries | completed | Root is kernel-only, `/react` is hook-only, `/plate` owns both Plate adapters; 221 tests and Yjs typecheck pass | Preserve while closing wider contracts |
| 2. Proof and aliases | completed | Final aliases and public smokes pass; packed root, `/react`, and `/plate` runtime/declaration fixtures pass | Preserve through strict proof |
| 3. Adopters and docs | completed | Terminal consumers, mocks, README, EN/CN docs, and examples migrated; docs source and www typecheck pass | Preserve through final audit |
| 4. Release artifact | completed | Existing major Yjs changeset amended; `pnpm brl` passes 57/57 | Preserve through final audit |
| 5. Closure | completed | Focused Chromium, strict Plite, API repair, scoped lint, the three-invocation P1 review cap, and final plan receipt are closed | Local handoff |

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Exact target, adoption, proof, exclusions, and planning stop boundary are copied under `Prompt requirements`. |
| Active goal and plan verified | yes | Active goal objective names this exact plan path; flow is agent-led plan hardening. |
| Current owners read | yes | Read `packages/yjs` entries, metadata, tests, README, release/type smokes, aliases, terminal app consumers, focused browser owners, and both Plite and Plate docs lanes at HEAD `33557a72cc6b393c4646af46cf0348f0e49efa99`. |
| Best API target resolved | yes | Accepted review target: root Plite/Yjs, `/react` Plite React hooks, `/plate` Plate adapters, `/core` removed. |
| Mode and execution boundary resolved | yes | `standard`, planning only; implementation requires explicit acceptance and a second `plite-plan` invocation. |
| Package/API pack selected | yes | Public package exports, boundary, declarations, and release artifacts change. |
| Public surface or package boundary identified | yes | `@platejs/yjs` root, `/core`, `/react`, proposed `/plate`, optional peers, and packed consumers. |
| Release artifact path selected | yes | Update the existing major `.changeset/plite-yjs-attribute-keys.md`; describe the final v54 entrypoints relative to the Plate-only 53.x `main` baseline, not the branch-only `/core` path. |
| `changeset` skill loaded when `.changeset` is required | yes | `.agents/skills/changeset/SKILL.md` read; changeset must describe user impact relative to `main`. |
| Barrel/export impact decision recorded | yes | Export map and entry files change; execution must run the repository-required `pnpm brl` gate and include generated barrel changes if any. |
| Docs pack selected | yes | Yjs package README, collaboration docs, and examples must adopt the selected imports. |
| `docs-creator` loaded | yes | `.agents/skills/docs-creator/SKILL.md` read for source-backed current-state teaching. |
| Docs lane selected | yes | Package README/API reference plus Plate collaboration plugin/feature teaching. |
| Target docs and nearest sibling docs read | yes | Read `packages/yjs/README.md`, Plite Yjs, Plate Yjs EN/CN, collaboration example, and the neighboring Plite DOM and Plate Comment pages. No page topology change is needed. |
| Docs style doctrine read | yes | Read all 269 lines of `.agents/skills/docs-creator/rules/style-and-structure.md`; execution uses current-state, source-backed import teaching. |
| Documented source owner identified | yes | `packages/yjs` exports and adapter barrels own every documented Yjs import. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports/behavior claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and private implementation paths have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: update one existing major changeset; no registry changelog.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only classification is rejected because the published package changes.
- [x] Package/API pack: no-artifact classification is rejected because package users see a breaking delta from 53.x.
- [x] Package/API pack: the hard cut has no compatibility alias or runtime bridge.
- [x] Package/API pack: package-owned typecheck, test, build, packed-boundary, and declaration proof are exact.
- [x] Package/API pack: root barrel generation and the existing major release note are execution work.
- [x] Docs pack: docs lane, targets, nearest siblings, and source owner are recorded.
- [x] Docs pack: named imports, routes, demos, and ownership claims are tied to live source.
- [x] Docs pack: execution uses current-state reference voice.
- [x] Docs pack: existing leaf links and three executable browser routes are identified.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Owners, hard cut, adopters, slices, proof, release artifact, docs, risks, and stop boundary are resolved below. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Source audit used HEAD `33557a72cc6b393c4646af46cf0348f0e49efa99`; local `main` and `origin/main` package manifests were read separately. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding | Accepted target is root Plite/Yjs, `/react` Plite hooks, `/plate` Plate adapters, and no `/core`; final `best-api repair`, mirror regeneration, and resource parity pass. |
| Conditional risk and adoption | yes | Resolve triggered risk/browser/Benchmark/provenance work | Browser, docs, release, and adoption apply and are specified; Benchmark, external research, and issue/PR provenance do not apply for this package-shape plan. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | See Proof matrix and Verification evidence. |
| Handoff prepared | yes | Prepare ownership, breaks, proof, risks, and execution order | See Final handoff prepared. |
| P1 autoreview | yes | Review the scoped implementation through `autoreview --max-priority P1` | Invocations 1 and 2 were clean; invocation 3's sole stale finding is rejected by exact current proof, and its second chunk found no defect. No accepted P0/P1 finding remains. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-hard-cut-yjs-public-entrypoints.md` | Final execution receipt passed with `[autogoal] complete`. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Current root reaches `BaseYjsPlugin -> @platejs/core`; current `/react` reaches `YjsPlugin -> @platejs/core/react`; target removes both reachability paths. |
| Release artifact classification | yes | Classify the user-visible delta | Published breaking package API/types/import change relative to 53.x. |
| Published package changeset | yes | Update one changeset for `@platejs/yjs` | Update existing major `.changeset/plite-yjs-attribute-keys.md`; state final root, `/react`, and `/plate` migration relative to 53.x. Never present branch-only `/core` as a released removal. |
| Registry changelog | no | Registry-only changes use registry changelog | Registry code only adopts the package import; the published package owns the delta, so no registry changelog. |
| No release artifact | no | Internal/docs/test-only changes may omit artifacts | Rejected: this is a published major API change. |
| Package typecheck/build/test | yes | Run owning checks | `pnpm --filter @platejs/yjs test`; `pnpm turbo typecheck --filter=./packages/yjs`; `pnpm plite:release:boundaries`; then strict `pnpm check:plite`. |
| Barrel/export generation | yes | Regenerate exports after file/entry changes | Run `pnpm brl`, inspect generated changes, and retain only source-owned output permitted by repository rules. |
| Docs source-backed claim audit | yes | Verify all entrypoint teaching against exports | README and Plite/Plate docs teach root, `/react`, and `/plate` from the final package entries. |
| Docs links / routes / previews | yes | Verify current leaf links and routes | No page topology or preview changes; verify existing links plus `/examples/plite/yjs-collaboration`, `/examples/plite/yjs-hocuspocus`, and `/examples/plite/collaboration-demo`. |
| Docs MDX/content parser | yes | Parse changed MDX | Run `pnpm --filter www build:source` and `pnpm --filter www typecheck`. |
| Plugin page specifics | yes | Keep Plate setup and ownership exact | Split `YjsPlugin` imports to `/plate`, keep hooks on `/react`, update EN/CN ownership teaching, and do not invent kit or API changes. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live package, metadata, adopters, docs, smokes, release fixtures, and baselines read | Decide |
| Decide | complete | Accepted import map and hard-cut adoption resolved in the decision ledger | Prove and hand off |
| Prove and hand off | complete | Exact execution slices, failure scenarios, proof gates, and command prepared | User acceptance |

Decision brief:
- outcome: one execution-ready hard-cut plan for dependency-honest Yjs public
  entrypoints, complete in-repository adoption, and exact packed proof.
- chosen shape: root = Plite/Yjs; `/react` = Plite React hooks; `/plate` = Plate
  adapters; `/core` = removed.
- strongest rejected alternative: keep `/core` as a compatibility alias and
  leave `YjsPlugin` under `/react`.
- consequence: users migrate Plate imports to `/plate`; Plite root and React
  consumers no longer resolve Plate; package exports, tests, docs, and release
  fixtures move atomically.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Root kernel | `src/index.ts` exports `./core` and `./lib`; `BaseYjsPlugin` in `./lib` imports `@platejs/core` | Root exports only the internal Plite/Yjs kernel in `src/core`; no Plate or React declaration/runtime reachability | `packages/yjs/src/index.ts`, `src/core/**` | Package roots must link with their required dependencies | Move root smoke expectations for awareness, provider, selection, policy, and `yjs`; remove Plate symbols from root expectations | Isolated packed root under Node, NodeNext, and Bundler with Core, Plite React, and React forbidden | A declaration-only re-export can retain Core even when runtime JavaScript looks clean | rearchitect |
| Plite React hooks | `src/react/index.ts` exports hooks and `YjsPlugin`; the plugin imports `@platejs/core/react` | `/react` exports only `useYjs*` helpers and their types | `packages/yjs/src/react/**` | Framework hooks and Plate composition have different dependency laws | Existing Plite examples, remote cursor overlay, Plite docs, and hook mocks stay on `/react`; split mixed imports | Isolated packed `/react` under Node, NodeNext, and Bundler with `@platejs/core` forbidden | A mixed barrel or type import can pull Core back into `/react` | rearchitect |
| Plate adapters | No public `/plate`; `BaseYjsPlugin` lives in `src/lib`, while `YjsPlugin` lives in `src/react` | `src/plate/index.ts` exports both `BaseYjsPlugin` and `YjsPlugin`; package export and build entry are `./plate` and `plate/index` | `packages/yjs/src/plate/**`, package manifest, tsdown config | One explicit adapter entrypoint makes the optional Core dependency honest | Move adapter files/tests; migrate Plate demo, its mock, EN/CN Yjs docs, collaboration example ownership, README, and public smokes | Isolated packed `/plate` runtime plus NodeNext/Bundler declarations with Core/React dependencies installed | Missing source alias or optional peer metadata can pass source tests but fail tarball consumers | add |
| Public `/core` | Export map, build entry, aliases, smokes, README, transplant map, and release fixture expose `/core` | No package export, build entry, alias, teaching, smoke expectation, or compatibility bridge; internal `src/core` remains private | Package manifest, tsdown, alias owners, smokes, transplant script | Root already is the canonical Plite/Yjs kernel | Update all 17 bounded `/core` owners found by exact search | Exact export-key contract and zero bounded stale-specifier audit; do not add a dead-API regression test | Unknown beta consumers break immediately by design | cut |
| Peer and artifact boundary | Core is optional in metadata but reachable from root; release policy allows Core package-wide and only proves `/core` without Plate | Plite and Yjs remain root requirements; Plite React/React and Core remain optional adapter peers; release proof isolates `.`, `/react`, and `/plate` separately | `packages/yjs/package.json`, package contract, `check-plite-release-artifacts.mjs` | Optional peers are meaningful only when clean entrypoints avoid them | Update package contract wording, allowed-runtime comment, three isolated fixtures, success receipt, and contract tests | `pnpm plite:release:boundaries` proves physical closure, Node runtime, NodeNext, and Bundler for all three entries | Package-wide allowlists can hide an entrypoint leak unless each fixture forbids the wrong peer | repair |
| Source aliases and consumers | Eleven tsconfig owners and the transplant map name `/core`; Plate code imports `YjsPlugin` from `/react` | Replace `/core` aliases with `/plate`; keep hook-only `/react`; split Plate imports; keep Plite root/hook imports unchanged | Config/tooling owners, `apps/www`, `apps/plite`, docs/transplant | Source-first tests must model the packed map exactly | Update the 11 tsconfigs, source-alias assertion, transplant map, app registry demo/test, package smokes, and teaching surfaces | Exact bounded `rg`, source-alias tests, package tests, www typecheck, focused browser routes | A wildcard alias can make local source pass while the packed export fails | migrate |
| Release and docs | Existing major changeset covers the v54 Yjs rewrite but not the selected entrypoint map; docs teach Plate from `/react` and list `/core` | Amend the one major changeset with final imports; teach current root, `/react`, and `/plate` ownership without changelog voice | `.changeset/plite-yjs-attribute-keys.md`, README, Plite Yjs, Plate Yjs EN/CN, collaboration example | The migration must be accurate relative to released 53.x, where `/core` never existed | No new page, registry changelog, or `release-ready` producer | Changeset audit, MDX build, www typecheck, link/route checks | Branch-history wording could falsely advertise `/core` as a released API | amend |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Establish dependency-honest entries | Yjs package | Move both Plate adapters under `src/plate`; make root kernel-only and `/react` hooks-only; replace `/core` with `/plate` in exports/build | Accepted four-part API target | Source topology, package map, peers, and package contract agree; no alias exists | Focused Yjs tests and typecheck |
| 2. Repair source and packed contracts | Plite proof/tooling | Update public import/type smokes, 11 tsconfig aliases, source-alias assertion, transplant map, release checker fixtures/messages, and checker tests | Final package entries from slice 1 | Source-first and packed maps are identical; root/react/plate have separate dependency fixtures | `pnpm check:plite:contracts`; `pnpm plite:release:boundaries` |
| 3. Migrate terminal adopters and teaching | www, Yjs docs | Split Plate adapter imports to `/plate`; keep hooks on `/react`; update demo mock, README, Plate Yjs EN/CN, collaboration example, and audit Plite Yjs | Stable package specifiers | No bounded `/core`; no `YjsPlugin` from `/react`; no false Plate ownership under root | Registry unit test, docs parser, www typecheck, exact searches |
| 4. Record the public break | Changeset and barrels | Amend the existing major Yjs changeset relative to 53.x; run barrel generation | Final diff from slices 1-3 | One major Yjs changeset describes final imports; generated export state matches source | Changeset inspection; `pnpm brl`; package build |
| 5. Close implementation | Plite Plan execution owner | Run focused browsers, strict handoff, `best-api repair`, and P1 autoreview; repair any source-backed finding without widening scope | Slices 1-4 green | Exact plan gates pass and no unresolved P0/P1 finding remains | Three focused Chromium files; `pnpm check:plite`; `autoreview --max-priority P1` |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Root is Plite/Yjs-only | Current leak was `index -> lib/BaseYjsPlugin -> @platejs/core` | Packed root runs and typechecks with Core, Plite React, and React forbidden | passed |
| `/react` is Plite React-only | Current leak was `react/index -> YjsPlugin -> @platejs/core/react` | Packed `/react` runs and typechecks with Core forbidden | passed |
| `/plate` owns both adapters | Live symbols were split across two folders | Exact export/build contracts and packed `/plate` Node, NodeNext, and Bundler fixture pass | passed |
| `/core` has no public bridge | Seventeen bounded owners named it; released 53.x did not | Export-key/package-smoke contracts and bounded zero-reference audit pass; no compatibility test added | passed |
| Peers match entrypoint reachability | Optional Core metadata conflicted with root reachability | Three isolated physical dependency trees pass with entrypoint-specific forbidden peers | passed |
| Source aliases match package exports | Eleven tsconfigs and transplant tooling mapped `/core` | Source alias contracts and exact root/react/plate map audit pass | passed |
| Plate and Plite adopters compile | Plate demo mixed hooks and plugin under `/react` | Yjs tests/typecheck, registry demo unit, full www typecheck, and public smokes pass | passed |
| Teaching matches the final package | README and Plate EN/CN docs taught `YjsPlugin` from `/react` | Source-backed import audit and docs source build pass; no page topology delta | passed |
| Runtime behavior is unchanged | Accepted scope changes reachability, not collaboration law | Focused collaboration Chromium passes 4/4; closure rows pass 3/3 after final formatting; strict Plite passes all 709 runnable Chromium tests | passed |
| Release note describes the released delta | Both 53.x baselines are Plate-only and have no `/core` | One amended major Yjs changeset names root, `/react`, and `/plate` without branch-history language | passed |

Conditional evidence:
- High-risk scenarios:
  1. Root JavaScript stops importing Core but `dist/index.d.ts` still reaches a
     Plate type through a re-export. The isolated NodeNext/Bundler root fixture
     must fail when Core is absent if this happens.
  2. `/react` keeps a mixed barrel or transitive type import to
     `@platejs/core/react`. Its isolated fixture forbids Core while compiling
     and importing the packed subpath.
  3. Source aliases make apps green while the tarball omits `/plate`, or one
     docs/demo import still names `/core` or gets `YjsPlugin` from `/react`.
     Exact searches, export-key contracts, packed proof, www typecheck, and
     focused browsers cover the mismatch.
- External research: N/A. The accepted API target is already resolved from the
  source-grounded review; external beta adoption is unknowable from this repo
  and is retained as an explicit breaking-change risk.
- Issue/PR provenance: N/A. This is a local architecture-plan activation, not
  issue- or PR-backed work.
- Browser: applies at execution because package-facing examples and the Plate
  registry demo change imports. Run focused Chromium for
  `yjs-collaboration.test.ts`, `yjs-hocuspocus.test.ts`, and
  `collaboration-demo.test.ts`; this proves synthetic Chromium behavior only.
- Benchmark: N/A. No performance mechanism or threshold changes.
- Docs and release: apply through source-backed EN/CN imports, MDX parsing,
  www typecheck, the existing major Yjs changeset, and package-only claims.
- Behavior law and Vision: `best-api repair` made entrypoint-specific optional
  peer reachability explicit in `.agents/rules/best-api.mdc` and
  `docs/vision/common.md`; generated mirrors and resource parity are exact.

Findings:
- At HEAD `33557a72cc6b393c4646af46cf0348f0e49efa99`, the root statically reaches
  Core through `src/lib/BaseYjsPlugin.ts`; `/react` reaches Core through
  `src/react/YjsPlugin.tsx`. Optional peer metadata therefore lies about what a
  root-only Plite consumer needs.
- The public break is contained but not tiny: 17 bounded current files name
  `/core`, including 11 tsconfig owners, package smokes, the transplant map,
  README, source-alias test, and packed release fixture.
- Plate terminal adoption is concentrated in the collaboration registry demo,
  its mock, package README, Plate Yjs EN/CN docs, collaboration-example
  teaching, and public smokes. Plite examples and cursor components keep their
  root and `/react` imports.
- Existing packed proof already runs runtime, NodeNext, and Bundler checks, but
  it proves only `/core` without Plate/React. It must become three isolated
  entrypoint fixtures, not one package-wide allowlist claim.
- Both 53.x baselines expose root and `/react` only. `/core` is branch-only, so
  changeset prose must describe the final v54 import map rather than narrate
  internal branch history.

Decisions and tradeoffs:
- Use a hard cut with no alias -> one canonical import per layer outweighs
  compatibility convenience -> external beta consumers must migrate and remain
  an explicitly unknown adoption risk.
- Keep package-only publication -> no `release-ready` producer belongs in this
  plan -> broad release claims remain unavailable by design.

Review fixes:
- Narrowed the original package-wide scan to exact current owners and excluded
  generated release history, old plans, research, templates, and binary assets.
- Reclassified the release artifact from a future decision to an amendment of
  the existing major Yjs changeset.
- Added separate declaration/runtime fixtures for root, `/react`, and `/plate`,
  plus explicit source-alias, docs, registry, and browser adopters.

Blocking patch case:
- `case_id`: `plite-yjs-entrypoints:offline-peer-history-after-reconnect`
- Source: this accepted execution plan and
  `apps/plite/tests/plite-browser/donor/examples/collaboration-demo.test.ts`.
- Owner/class: Plate collaboration example chrome; history display/reactivity
  plus collaboration/replay.
- Route/setup/action: Chromium on `/examples/plite/collaboration-demo`; type
  `!` in Ada, select the last character, disconnect Lin, type `L` in Lin, type
  `A` at Ada's start, reconnect Lin, then invoke `Undo Lin`.
- Expected: both editors converge before undo, Lin keeps one local undo item,
  and undo removes only Lin's `L` from both editors.
- Red result: the editors converge, but both displayed history depths stay at
  zero and `Undo Lin` remains disabled until the 45-second test timeout. The
  exact file failed twice, once in the three-file batch and once alone.
- Red ref: `dirty:33557a72cc6b393c4646af46cf0348f0e49efa99`.
- Red fingerprints: demo
  `162fe90aa6324a04d1e0f5dcd64bd17ba0e23443b58c11dbd9a51f08afd14928`;
  Base adapter
  `49c609ff4c5445210a3ca1ac1889d3dd25df420f8ac2df641a5008d74e347e8b`;
  React adapter
  `3cd8fe1c76c415fcd4ecaa9f65efd7b094d054982a95fb89a1d2d2958744078b`;
  browser test
  `4ef8233a86606fc87fabc4740d45896caed7f7e9e035161a736b09626315f8a0`;
  runner
  `9ca53b7b5d72073ddcb839f294f3fa8e167e8073d6699af20a6ffdc2fa5ddd8b`;
  app config
  `5193a487896e3892d20460c2658b3a6dcfc275dbf72716132ca952747af58710`.
- Allowed edit boundary: the example if its displayed history contract is
  wrong, otherwise the proven Plate/Plite history-Yjs owner and this exact
  browser proof. No compatibility entrypoint, timing wait, or test weakening.
- Required proof: exact Chromium file, package/model owner test if the bug is
  below the example, fresh Browser route check, strict Plite, and final P1
  review.
- Falsification and root cause: commit-level instrumentation proved Lin's real
  undo stack reaches depth one before reconnect and remains one after the
  remote import. The prior generic editor selector also read depth one, but the
  out-of-`PlateRoot` control stayed rendered at zero. Yjs and history model law
  were therefore false alarms; the example subscribed to the wrong UI state
  boundary.
- Fix: `PeerControls` uses `useSyncExternalStore` over
  `editor.subscribeCommit` and the immutable `editor.read.history()` snapshot.
  No Yjs, history, provider, or browser-test behavior changed.
- Green result: fresh in-app Browser replay showed `Undo 1`, removed only Lin's
  offline `L`, and exposed `Redo 1`. The exact production-build Chromium file
  passed 1/1, then the Yjs collaboration, Hocuspocus, and collaboration-demo
  batch passed 4/4.
- Green fingerprints: demo
  `e6d33f5fd56296fb41080b30aea8c10528d756c734fcce660325bddeada17cba`;
  demo unit
  `805dc447d3a622a068fcfbc2cd1e11866a43be1e6eea68ebad1ce788d14c8e08`;
  unchanged browser case
  `4ef8233a86606fc87fabc4740d45896caed7f7e9e035161a736b09626315f8a0`.

Strict-gate closure:
- The first `pnpm check:plite` attempt reached Chromium after every package,
  contract, public-type, and build lane passed, then reproduced staged path
  failures at `[600, 0]` and `[5000, 0]` outside Yjs ownership.
- Commit and render instrumentation proved the browser handle and editor model
  already held `[600, 0]`, while the mounted DOM stayed on blocks 0-15. The
  production React Compiler cached the mutable external-store read in
  `useGenericSelector`; `'use no memo'` restores `useSyncExternalStore` snapshot
  invalidation. A production browser-handle regression locks the remote path.
- A separate 10k select-all row exposed a proof-harness error: an explicit
  `partial-dom-backed` model selection without projected markers was required
  to invent a projected selection. The harness now requires projected equality
  only when projected markers exist, with a Browser core regression for stale
  native selection plus an authoritative model handle.
- A fresh proof-app export then exposed a latent Trusted Types test defect. Its
  CSP prevented the Next host from booting before Plite ran. The test installs
  an application default policy before navigation and rejects one sentinel, so
  Next may boot while enforcement and Plite clipboard parsing remain proven.
- Final focused proof passes Browser core 106/106 and the three production rows
  3/3. Final `pnpm check:plite` passes in 392.7s with all typechecks, package
  tests, 171 Node contracts, 74 Bun contracts, 44 benchmark targets, public
  types, 13 builds, and Chromium at 709 passed, 8 intentional skips, and 79
  bounded batches.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Initial `rg` included a nonexistent `scripts` path and counted historical plan/research matches | 1 | Query named owners with exact globs and exclude generated/history paths | Resolved with bounded current-owner lists; 17 `/core` files and 11 tsconfig owners identified |
| Initial app scan used nonexistent `apps/plite/app` and traversed generated/binary app assets | 1 | Read exact `apps/www/src` consumers and `apps/plite/tests/plite-browser` files | Resolved; three executable browser routes and terminal imports identified |
| A refresh search combined an exact adapter-path query with generic `src/lib` and touched generated app artifacts | 1 | Restrict follow-up searches to Yjs and named adopter paths | Resolved; no further broad generated-tree scan used |
| First Yjs package test found `test/react-contract.spec.tsx` importing `YjsPlugin` from the old React barrel | 1 | Move the test's adapter import to `../src/plate` and rerun the same package gate | Resolved; rerun passed 221 tests with zero failures |
| Parallel Yjs test/typecheck output exceeded the orchestration response budget | 1 | Rerun each lane separately with bounded tail output and preserve pipe failures | Resolved; both bounded reruns exited zero |
| First strict `pnpm check:plite` run timed out in two staged huge-document rows | 1 | Stop the app server and rerun the exact Chromium file with one worker | Reproduced: 6 passed, 2 failed; not suite contention and outside Yjs ownership |
| Restarted strict Chromium stopped on the Trusted Types paste row before the editor mounted | 1 | Capture page errors and separate host bootstrap from Plite clipboard parsing | Resolved with an application default policy plus a rejected sentinel; exact row and final strict pass |
| Final scoped lint found one shadowed helper parameter and formatting drift | 1 | Rename the parameter, format only the five closure files, and rerun exact proof | Resolved; scoped lint passes, Browser core is 106/106, and production closure rows are 3/3 |
| P1 invocation 3 ran from the main checkout instead of the isolated 44-file review repository | 1 | Keep the invocation cap, finish both bounded chunks, and validate findings against current proof | Its sole P1 relied on obsolete red text in this plan and is rejected by exact and strict green proof; chunk 2 found no defect |
| Guessed a nonexistent `check-resources.mjs` command after skill regeneration | 1 | Inspect the owning scripts and use their documented check mode | Resolved with `node .agents/rules/plate-next/scripts/sync-resources.mjs --check`: resources exact |
| First scoped-review temp setup used a disallowed broad cleanup command; second used zsh's reserved `path` variable | 2 | Use an explicit temp repository, explicit `git rm` targets, and task-specific variable names | Resolved; the 39-file scoped bundle reviewed cleanly without touching source |

Verification evidence:
- Current source cursor: HEAD `33557a72cc6b393c4646af46cf0348f0e49efa99`.
- Release baselines read independently: local `main`
  `cae8cc4554760242d168b2740a5e4a4bf3ef7826` (`@platejs/yjs@53.0.0`) and
  `origin/main` `bc7104f7dd009a0c2da78cffaee1108b4c430f46`
  (`@platejs/yjs@53.2.0`). Both are Plate-only root/React packages and neither
  publishes `/core`.
- Read live package export/build/peer owners, package contract tests, public
  import/type smokes, release-artifact implementation, source-alias tests,
  exact terminal consumers, three browser tests, changeset pre-state, target
  docs, nearest siblings, and all docs style rules.
- Exact bounded searches establish the adoption set and preserve the unknown
  external-beta boundary; repository inventory is not claimed as ecosystem
  coverage.
- `pnpm --filter @platejs/yjs test` passed 221 tests across 28 files with zero
  failures after moving the React contract's Plate adapter import.
- `pnpm turbo typecheck --filter=./packages/yjs` passed 11 of 11 source-first
  graph tasks.
- `pnpm check:plite:contracts` passed 171 Node contracts, 74 Bun tests, all 44
  benchmark-target contracts, public package types, and all 13 package builds.
- `pnpm plite:release:boundaries` passed isolated packed runtime, NodeNext, and
  Bundler consumers for Yjs root, `/react`, and `/plate`.
- Docs source build, full www typecheck, schema adoption (61), table/Yjs (15),
  collaboration demo unit (4), barrel generation (57/57), and bounded stale
  import audits pass.
- Fresh in-app Browser replay proves reconnect undo/redo; the focused production
  Chromium collaboration batch passes 4/4.
- Final `pnpm check:plite` passed in 392.7s on exact final product bytes: every package/type/contract/build
  lane passed, and Chromium completed 79 bounded batches with 709 passed and 8
  intentional skips.
- Final post-format closure proof passed Browser core 106/106 and the staged
  remote selection, staged 10k select-all/paste/undo, and Trusted Types rows
  3/3 on a freshly rebuilt production Plite app.
- `best-api repair` updated source doctrine and shared Vision; `pnpm install`
  regenerated mirrors, and `sync-resources.mjs --check` reports exact parity.
- Scoped P1 autoreview command:
  `.agents/skills/autoreview/scripts/autoreview --mode local --max-priority P1`
  against the 39-file Yjs bundle. Invocation 1 was clean at 0.96 confidence.
  Invocation 2 reviewed that bundle plus the five strict-closure files and was
  clean at 0.84 confidence. Invocation 3 included the broad checkout after the
  final formatting rename; its only P1 repeated this plan's stale pre-fix red
  evidence and is rejected because both its cited row and full strict are green.
  Its second chunk found no defect at 0.94 confidence. The three-invocation cap
  is exhausted with no accepted P0/P1 finding.
- Planning mechanical receipt: `node
  .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-23-hard-cut-yjs-public-entrypoints.md` passed with
  `[autogoal] complete` on the closed execution plan.

Final handoff prepared:
- Outcome: the Yjs hard cut, complete repository adoption, packed proof, docs,
  focused browser proof, API repair, and P1 review are complete.
- Ownership and target API/runtime: Yjs root owns the Plite/Yjs kernel;
  `/react` owns Plite React hooks; `/plate` owns both Plate adapters; `/core`
  has no public path.
- Public breaks and Plate/collaboration adoption: hard cut all `/core` aliases;
  move `BaseYjsPlugin` and `YjsPlugin` to `/plate`; split mixed Plate imports;
  keep root/hook Plite imports stable.
- Applicable browser/Benchmark/docs/provenance decisions: three focused
  Chromium routes and EN/CN/docs parsing apply; Benchmark and issue/PR
  provenance do not.
- Proof and execution risks: packed declaration leakage, mixed `/react`
  reachability, and source-vs-tarball alias drift are closed; external beta
  consumers remain unknowable from repository evidence.
- Remaining blocker: none inside the accepted implementation and proof scope.
  Publication, commit, push, PR, and release claims remain unauthorized and
  unproved.

Timeline:
- 2026-08-23T13:07:05.204Z Plite Plan created.
- 2026-08-23 Prompt requirements, goal boundary, packs, accepted API target,
  and explicit non-goals recorded before broad source exploration.
- 2026-08-23 Live package, adopter, docs, proof, and release-baseline grounding
  completed; broad scans replaced with exact current-owner inventories.
- 2026-08-23 Decision ledger, execution slices, risk scenarios, conditional
  gates, and final handoff resolved for planning-only completion.
- 2026-08-23 `check-complete` passed for the final plan artifact.
- 2026-08-23 Execution activated under a new one-shot goal; package topology,
  aliases, packed fixtures, adopters, docs, and changeset received the first
  implementation pass.
- 2026-08-23 First Yjs package test passed 211 tests and exposed one stale
  React-contract adapter import; the import moved to the Plate entrypoint.
- 2026-08-23 The corrected Yjs package rerun passed 221 tests with zero
  failures, and the source-first Yjs typecheck passed all 11 graph tasks.
- 2026-08-24 Packed boundaries, final contracts, docs, adopters, barrels, and
  the focused Chromium collaboration batch passed.
- 2026-08-24 Collaboration history display moved to commit-backed immutable
  snapshots after browser proof falsified Yjs/history model failure.
- 2026-08-24 `best-api repair` made optional-peer entrypoint reachability
  explicit; generated resources are exact.
- 2026-08-24 P1 autoreview invocation 1 returned no finding at 0.96 confidence.
- 2026-08-24 Strict Plite reproduced two independent staged huge-document
  materialization timeouts; execution stopped at the accepted scope boundary.
- 2026-08-24 Production instrumentation isolated React Compiler snapshot
  caching, explicit partial-DOM harness policy, and Trusted Types host startup
  as three separate closure defects; each received focused regression proof.
- 2026-08-24 Final strict Plite passed every lane and all 79 Chromium batches;
  final scoped lint and post-format focused proof passed.
- 2026-08-24 P1 invocations 2 and 3 closed the final implementation bytes with
  no accepted finding; one stale broad-bundle finding was rejected against
  exact current proof.
- 2026-08-24 Final `check-complete` returned `[autogoal] complete` on the
  closed execution plan.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Execution is closed; all five slices and every accepted proof gate are green. |
| Where am I going? | Local handoff; no implementation or proof work remains. |
| What is the goal? | Execute the accepted Yjs public-entrypoint hard cut with exact final-byte proof. |
| What have I learned? | Entrypoint reachability is closed at source, packed runtime, and declaration levels; production React snapshots and partial-DOM proof require explicit owners. |
| What have I done? | Implemented and adopted the hard cut, repaired collaboration history display and strict browser proof owners, and passed strict Plite plus P1 review. |

Open risks:
- External beta adoption is unknown; execution must describe a breaking
  migration without claiming the repository inventory is exhaustive.
- Publication, commit, push, PR, and release readiness remain unproved and
  unauthorized.

Acceptance command:

`$plite-plan docs/plans/2026-08-23-hard-cut-yjs-public-entrypoints.md`
