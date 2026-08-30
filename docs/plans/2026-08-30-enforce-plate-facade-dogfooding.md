# Enforce Plate facade dogfooding

Objective:
Enforce Plate facade dogfooding; done when only exact bridge modules import
`plitejs` and authorable Plate source, proof, and doctrine pass.

User correction:
- Plate specs, tests, slow tests, and `__tests__` fixtures are first-party
  authoring surfaces. They must not receive a blanket raw-Plite exemption.
- Mirror the one missing Plite public subpath as `platejs/testing`, migrate all
  Plate source tests to Plate-owned root/DOM/React/testing leaves, and retain
  only file-exact lower-distribution bridge or parity-proof exceptions.
- Completion requires zero raw `plitejs*` module imports anywhere under
  `packages/platejs/src/**` outside the exact bridge allowlist, no wildcard
  test exclusions in the raw-import rule, and packed proof for the new public
  testing entrypoint.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-30-enforce-plate-facade-dogfooding.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- agent-native
- package-api

Mode:
- `standard`

Completion threshold:
- Zero production `plitejs*` imports outside an exact reviewed facade,
  replacement, or proxy bridge allowlist.
- Zero `plitejs*` DAG edges from authorable Plate feature/plugin entrypoints;
  those edges route through the matching Plate source owner.
- Existing public packed exports and runtime identities remain unchanged;
  `platejs/testing` is the one additive identity-preserving public mirror.
- Best API doctrine, Plate Vision, affected worker rules, and generated skill
  mirrors teach the exact bridge law.
- Focused DAG/lint/type/build/package proof, agent-native review, P1
  autoreview, and `check-complete` pass with zero accepted findings.

Verification surface:
- Source audit of all production imports under `packages/platejs/src/**`,
  classified into facade/replacement bridges versus authorable code.
- Entrypoint DAG and Oxlint workflow tests plus `platejs` lint/typecheck/build.
- `pnpm brl`, packed Plate/Plite facade parity and package-direction proof.
- `pnpm install`, source/mirror audit, agent-native review, and P1 autoreview.

Constraints:
- The user explicitly accepted the concrete Best API target with `ok go`; this
  file is the one-shot execution ledger for that accepted target.
- No public compatibility aliases or runtime shims.
- Do not shrink Plite capability coverage merely to make the import audit pass.
- Preserve public export names, runtime identity, React/headless isolation,
  plugin inference, and package entrypoint ownership.
- Use relative source-owner imports inside `packages/platejs`; never self-import
  the published `platejs` specifier.
- Edit `.agents/rules/**` sources and regenerate mirrors with `pnpm install`;
  never edit generated `SKILL.md` files.
- Do not publish, commit, push, or open a PR.

Boundaries:
- In scope: `packages/platejs` facade/replacement topology and imports,
  entrypoint DAG/Oxlint enforcement and tests, focused package/release proof,
  Best API and Plate doctrine, affected worker rules, generated mirrors, and
  this plan.
- Source owners: `packages/platejs/src/**`,
  `tooling/entrypoints/entrypoint-dag.mjs`,
  `tooling/oxlint/entrypoint-dag-plugin.mjs`, `oxlint.config.ts`, focused
  tooling tests, `.agents/rules/**`, `VISION.md`, and `docs/vision/plate.md`.
- Non-goals: public API renames/removals, feature behavior changes, new public
  internal entrypoints, public docs rewrite, registry changes, release or Git
  mutation, and raw Plite proof/example policy.
- Direct Plite boundary owners: exact root/DOM/diff/history/hyperscript/layout/
  React facade leaves; exact Plate replacement adapters for deliberately
  replaced or omitted Plite APIs; packed facade identity tests. Directory-wide
  or package-wide authority is forbidden.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if an unavoidable module cycle, declaration break, or runtime
  identity failure proves authorable code cannot consume a Plate-owned source
  surface without changing the accepted public API, and no smaller owner repair
  remains.

Plate Plan state:
- status: complete
- phase: done
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | User includes first-party plugins and anything a Plate user can author in the consumer boundary; raw imports must be exact bridge-only. |
| Active goal and plan verified | yes | Active goal names this exact plan and binary boundary. |
| Current owners read | yes | `VISION.md`, `docs/vision/common.md`, `docs/vision/plate.md`, facade entrypoints, DAG, Oxlint, packed parity proof, and representative feature plugins read. |
| Best API target resolved | yes | Best API verdict: retain complete identity facade; cut raw import authority from authorable Plate code; no second public facade. |
| Mode and execution boundary resolved | yes | Standard one-shot execution; user authorized the concrete target with `ok go`. |
| Agent-native pack selected | yes | `.agents/rules/**` doctrine changes and generated mirrors apply. |
| Agent-facing action surface identified | yes | Future API/architecture agents must distinguish exact facade bridge files from first-party authorable consumers. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; run `pnpm install`; audit `.agents/skills/**` mirrors. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded before agent-source edits; final parity map is recorded below with zero accepted findings. |
| Package/API pack selected | yes | Package import direction, entrypoint DAG, facade parity, and packed proof apply. |
| Public surface or package boundary identified | yes | Existing exports stay stable; add `platejs/testing` as the missing Plite public-subpath mirror while narrowing raw-import authority. |
| Release artifact path selected | yes | `.changeset/plate-testing-facade.md` records the additive `platejs/testing` package API. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before authoring the one-package `platejs` patch changeset. |
| Barrel/export impact decision recorded | yes | A private source leaf may be added and the public root reexport source may move without export delta; run `pnpm brl` because exported-folder topology changes. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: the no-artifact path is N/A because the additive `platejs/testing` export has a patch changeset.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Correction: `platejs/testing` mirrors `plitejs/testing` and is present in package, DAG, build, type, and packed manifests.
- [x] Correction: every Plate source spec/test/slow fixture imports Plate-owned leaves rather than raw `plitejs*`.
- [x] Correction: Oxlint and parser-backed inventory include tests and contain no wildcard Plate-test exemption.
- [x] Correction: changeset, doctrine repair, mirrors, package proof, packed proof, and final P1 review are complete.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | complete | Resolve every readiness condition | Exact bridge inventory, adoption, doctrine, strict packed proof, and correction review are complete. |
| Fresh source evidence | complete | Recheck decision-changing current claims | Parser-backed source audit checks all 823 production source files; the final package matrix checks packed artifacts. |
| Best API review | complete | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted target completes the exhaustive facade with `platejs/testing` and deletes package-wide/test-wide raw-import authority. |
| Conditional risk and adoption | complete | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Vision/agent doctrine updated; browser, registry, public docs, and issue provenance do not apply to this structural package boundary. |
| Verification recorded | complete | Record fresh planning proof and exact execution gates | Focused package checks and the final strict 80-subpath packed matrix are recorded below. |
| Handoff prepared | complete | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff below records the additive public testing subpath, no breaking change, proof, and no known remaining risk. |
| P1 autoreview | complete | Run with `--max-priority P1` for implementation changes; P2/P3 are opt-in only, or record planning-only N/A | Correction invocations 1 and 2 found valid issues now fixed; invocation 3 is clean at 0.96 confidence. |
| Goal plan complete | complete | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-30-enforce-plate-facade-dogfooding.md` | `[autogoal] complete` after the final ledger update. |
| Agent source / generated sync | complete | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` and Plate Next v124 validation green |
| Agent action discoverability | complete | Source-audit the skill/rule path an agent will read | Best API, Plate Plan, Plugin Creator, Feature, UI, and Plate Next sources/mirrors teach the exact bridge law |
| Agent-native review | complete | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | parity map below; zero accepted findings |
| Public API / package boundary proof | complete | Source-audit public API, exports, and package boundary impact | Existing proxies remain direct; `platejs/testing` directly mirrors `plitejs/testing`; packed proof passed 80 subpaths and runtime/declaration parity. |
| Release artifact classification | complete | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published additive package API: consumers can import Plite test helpers from `platejs/testing`. |
| Published package changeset | complete | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | `.changeset/plate-testing-facade.md` gives only `platejs` a permitted patch bump and names the new public import. |
| Registry changelog | complete | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | N/A: no registry source changed. |
| No release artifact | complete | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: a release artifact is required and present because `platejs/testing` is a new public subpath. |
| Package typecheck/build/test | complete | Run owning package checks or record N/A with reason | 79/79 typecheck tasks, 122/122 package test tasks, Yjs 212/212 focused tests, package builds, and the strict 80-subpath packed matrix are green. |
| Barrel/export generation | complete | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` green; private `.internal.ts` leaves remain excluded and public proxy barrels remain direct. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live Vision, facade, DAG, lint, packed parity, and representative plugin owners read | Decide |
| Decide | complete | Best API target, owners, bridge exceptions, execution slices, and proof locked below | Execute and prove |
| Original prove and hand off | complete | The pre-correction scope passed its package, packed consumer, doctrine, boundary, and final P1 gates. | User correction superseded final handoff |
| Test-boundary correction | complete | Testing facade, migration, enforcement, doctrine, changeset, strict packed proof, and clean final correction review are green. | User review |

Decision brief:
- outcome: First-party Plate plugins/features/components that model work an
  external Plate author can perform consume only Plate-owned source surfaces;
  raw Plite imports exist only in exact facade and replacement leaves.
- chosen shape: Keep exhaustive identity-preserving Plate facade coverage,
  introduce or reuse private source leaves that back the public facade, route
  authorable code through those leaves or existing Plate entrypoint owners, and
  enforce the boundary mechanically.
- strongest rejected alternative: Retain package-wide `plitejs` access and
  patch only the five feature bypasses. Rejected because Core and React plugin
  implementations would still have privileged authoring APIs and the same
  drift would recur.
- consequence: Internal source topology and DAG permissions change; public
  imports, behavior, types, and packed identity do not.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Raw Plite import authority | Entire `packages/platejs/**` is exempt | Exact facade/proxy/replacement files only | Oxlint + entrypoint DAG | Package ownership is too coarse after consolidation | File-exact restriction and negative tests | Production import audit and lint tests | Missed legitimate replacement adapter | rearchitect |
| Root Plite identities | `core.tsx` blind-reexports `plitejs`; Core files import raw directly | One private identity leaf backs public root exports; authorable Core code imports that leaf | Plate root facade | Avoid cycles while guaranteeing public reachability | Rewire approved identity imports; keep raw `createEditor` replacement explicit | Packed facade diff and identity checks | Accidental export alias/collision | bridge |
| Matching Plite subpaths | Public proxies exist, but five feature entries bypass them | Feature/plugin entries import Plate DOM/diff/history/React source owners | Matching `platejs/*` entrypoint | Internal DAG must expose the same dependency as external authors | Replace raw specifiers and internal/external DAG edges | DAG test, lint, package typecheck/build | Runtime classification exposes a false headless claim | move |
| Plate replacement/omission adapters | Raw APIs are mixed through broad Core/React directories | Exact private replacement leaves/files retain raw access | Plate compiler/runtime and React/static adapters | Plate must implement intentional collisions without publishing raw components/hooks | Consolidate or allowlist only actual replacements | Exception-set audit and focused adapter tests | Cycles or duplicate runtime identity | bridge |
| Doctrine and worker routing | Vision says only the package owner imports Plite; Best API says facade owner without file precision | Exact source owner law plus first-party dogfooding requirement | Best API + root/Plate Vision + affected workers | Future agents otherwise recreate package-wide authority | Repair sources, bump versioned doctrine if changed, regenerate mirrors | Source/mirror audit and agent-native review | Overcopying doctrine across workers | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Boundary inventory | Plate Plan | Classify every production raw import as facade, replacement, authorable, or stale | Accepted target | complete: ten exact production bridge files, all other imports rewired | production `rg` audit |
| 2. Facade topology | `packages/platejs` | Add/reuse facade leaves; route authorable Core/React/static/feature code through Plate owners | Inventory locked | complete | 79-task package typecheck and 80-subpath packed size proof green |
| 3. Mechanical enforcement | Entrypoint DAG + Oxlint | Replace feature external edges, add file-exact raw restriction and negative/positive tests | Source imports settled | complete: bypass fails closed; canonical Plate edge passes | 21 DAG tests and scoped Oxlint green |
| 4. Doctrine repair | Best API + Vision + affected workers | Encode exact facade owner and first-party dogfooding law | Code target stable | complete at Plate Next v124 | `pnpm install`, source/mirror audit, agent-native review, version validation |
| 5. Closure | Plate/package/review owners | Barrels, focused/full package proof, packed proof, P1 autoreview, plan checker | All slices implemented | complete with zero remaining accepted findings | Named commands and plan evidence |
| 6. Test-boundary correction | Plate testing facade + enforcement | Add `platejs/testing`, migrate specs/type tests, remove wildcard exemptions, retain React parity proof | User correction | complete | Strict packed run and correction review invocation 3 green; plan checker follows ledger close |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| External Plate authors never need raw Plite for Plate authoring | Root/Plate Vision and complete packed facade exception set | Compile/package proof plus zero authorable raw imports | green |
| First-party feature plugins dogfood matching Plate entrypoints | Five declared raw feature edges and representative source imports | DAG edges and imports route through Plate; focused feature checks | green |
| Raw bridge authority is exact | Package-wide lint exemption and mixed Core/React ownership | File-exact allowlist, negative fixtures, zero unclassified production imports | green |
| Public facade identity and exports do not change | Current packed facade diff/identity proof | `pnpm plite:release:packages` | green |
| Agent doctrine cannot regress to package-wide authority | Current Best API/Vision wording and worker audit | Source/mirror audit plus agent-native review | green |

Conditional evidence:
- High-risk scenarios: (1) internal source rewiring creates a cycle or duplicate
  Plite runtime; (2) a Plate replacement accidentally resolves to raw Plite;
  (3) headless/root entrypoints gain React or optional-peer reachability.
- External research: N/A: current Plate/Plite ownership and packed artifacts
  decide this internal boundary.
- Issue/PR provenance: N/A: direct user architecture correction, no tracker.
- Docs/registry/browser/release/behavior-law owners: Vision, agent doctrine,
  and package release metadata apply. Public docs, registry, and Browser proof
  are N/A because the additive testing subpath has no rendered or copied-UI
  surface. The patch changeset records the public export; packed proof validates
  its types, identity, and runtime consumers.

Findings:
- `oxlint.config.ts` exempts the entire `packages/platejs/**` tree from the raw
  Plite import ban.
- The DAG declares five production feature bypasses: Code Block, Media,
  Suggestion, Table, and Table React.
- Packed release proof already enforces root/React exception sets and exact
  identity for DOM, diff, history, hyperscript, and layout mirrors.
- Production raw imports are concentrated in mixed `core`, `react-core`, and
  `static` partitions plus exact proxy leaves, proving the package/entrypoint
  granularity is too broad for enforcement.

Decisions and tradeoffs:
- Keep complete corresponding-subpath facade parity; reducing exports would
  force Plate plugin authors back to a second dependency.
- Do not make package source self-import `platejs`; relative owner imports avoid
  package duplication and cycles.
- Private bridge files survive only for executable facade identity or explicit
  Plate replacements/omissions. Their deletion trigger is a Plite API move or a
  Plate replacement removal; broad convenience is not retention evidence.
- Add one `platejs` patch changeset because `platejs/testing` is a new public
  subpath; do not describe the internal import migration.

Review fixes:
- P1 invocation 1 caught a mechanical rewrite of the persisted default Yjs
  root namespace from `plitejs` to a facade path. Restored `plitejs`, added an
  API regression test, and audited all 823 source files for non-module facade
  literals.
- P1 invocation 2 caught that the new allowlist equality test matched any
  quoted `plitejs` runtime string. Replaced the regex with Babel parsing of
  import, export, dynamic import, require, and TypeScript import-type module
  specifiers. The restored Yjs key is legal while raw imports still fail.
- P1 invocation 3 reported zero findings and judged the patch correct at 0.91
  confidence.
- Correction-scope P1 invocation 1 caught deletion of the React-view editor
  compatibility assertion. Added an exact private Plite React type bridge and
  restored both assignments without exposing the lower import in the type test.
- The same correction review caught stale no-artifact claims. Reclassified
  `platejs/testing` as an additive public API and recorded the required
  one-package patch changeset throughout the gates and handoff.
- Correction-scope P1 invocation 2 caught mixed completion state and stale v123
  closure language in this plan. The ledger now records the v124 correction as
  the only current handoff state.
- Correction-scope P1 invocation 3 reported zero findings and judged the final
  correction correct at 0.96 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Inline Node regex escaping failed before any file write | 1 | Use exact quoted string replacement for the mechanical rewrite | resolved |
| Indirect star facade changed declarations and added about 9 KB per entrypoint | 2 | Keep public star facades direct; use explicit named internal forwarding leaves | resolved; declaration consumers green and max reviewed bridge delta 516 bytes |
| `check:core` found mechanical import formatting drift | 2 | Run one package-wide formatter pass over the 94 touched files | resolved |
| P1 review found a persisted Yjs namespace rewritten as an import path | 1 | Restore the protocol key, add behavior coverage, and AST-audit facade literals | resolved; 212 Yjs tests green |
| P1 review found the raw-import inventory conflated runtime strings and module specifiers | 1 | Parse module syntax instead of searching quoted text | resolved; 21 enforcement tests and final review green |
| Correction review found a removed React compatibility type assertion | 1 | Route the lower React type through one exact private parity leaf and restore the assertions | resolved; focused React-core and contract typechecks green |
| Correction review found stale no-artifact plan claims | 1 | Classify `platejs/testing` as additive public API and record its patch changeset | resolved; plan and changeset agree |

Verification evidence:
- `node --test tooling/scripts/entrypoint-dag-plugin.test.mjs`: 21/21 green,
  including parser-backed equality between actual raw imports and exact bridge
  files.
- Scoped `pnpm exec oxlint`: green for Plate source and changed entrypoint tooling.
- `pnpm entrypoint:turbo:generate`: regenerated the DAG-owned task/type graph.
- `pnpm --filter platejs typecheck`: 79/79 tasks green, including the new
  testing entrypoint and all type contracts.
- `pnpm --filter platejs test`: 122/122 package test tasks green after migrating
  85 source/type-test files.
- `pnpm --filter platejs lint`: 71/71 tasks green with no Plate test exemption.
- `pnpm --filter platejs test:partition:yjs`: 212/212 tests green, including
  the persisted default root namespace regression.
- `pnpm plite:entrypoint-sizes:update`: reviewed and recorded the explicit
  forwarding cost after runtime/declaration/DCE consumers passed: 4 packed
  packages, 80 public subpaths, 75 runtime entrypoints, 40 React-free headless
  entrypoints, one DOM-free SSR entrypoint, and 37 exact optional-peer closures.
- Final `pnpm plite:release:packages`: green for 4 packed packages, 80 public
  subpaths, runtime/declaration parity, NodeNext/Bundler declarations, package
  direction, Node import for 75 runtime entrypoints, SSR, bare/named DCE, 40
  React-free headless entrypoints, one DOM-free SSR entrypoint, and 37 exact
  optional-peer closures.
- The original strict packed run was green for 4 packed packages, 79 public
  subpaths, NodeNext/Bundler declaration consumers, runtime/declaration export
  parity, Node import, SSR, bare/named DCE, 74 runtime entrypoints, 39
  React-free headless entrypoints, one DOM-free SSR entrypoint, and 37 exact
  optional-peer closures.
- `pnpm brl`: green; public barrels remain direct and private internal leaves
  remain private.
- `pnpm check:core`: green across Core contracts/audits, 91 type tasks, 85 lint
  tasks, Plite/Plate/Test graphs, and 84 CLI tests.
- `pnpm install` plus `version.mjs validate`: generated mirrors current and
  Plate Next v124 registry valid.
- Original-scope P1 autoreview used all three permitted invocations and ended
  clean. Correction-scope invocation 1 found the React parity-test weakening
  and stale release classification; invocation 2 found stale mixed completion
  state in this ledger; all findings are fixed. Invocation 3 is clean at 0.96
  confidence.

Agent-native parity map:
- action: author or refactor a first-party Plate plugin, feature, component,
  spec, type test, fixture, or entrypoint that needs a Plite primitive;
- human path: import the public `platejs` root or matching public subpath,
  including `platejs/testing` for test helpers;
- agent path: Plugin Creator/Feature/UI route package and test source to the
  relative named facade leaf and forbid direct `plitejs` imports without a
  test-glob escape;
- enforcement: file-exact Oxlint allowlist, DAG edges, parsed module-specifier
  equality across `src`, `test`, and `type-tests`, package type/build/tests,
  and packed identity proof;
- source versus mirror: `.agents/rules/**` remains authoritative and generated
  `.agents/skills/**` was regenerated; Plate Next validation proves parity;
- verdict: equivalent capability and failure visibility; zero accepted agent-
  native findings.

Autoreview scope baseline:
- request: include plugins and every user-authorable first-party Plate surface
  in the consumer boundary;
- violated invariant: package-wide raw Plite authority let internal authors
  bypass the public Plate facade and matching subpath owners;
- owner boundary: `packages/platejs` facade leaves, entrypoint DAG/Oxlint, and
  the smallest Best API/Plate doctrine chain;
- intended behavior: existing public exports/identity stay stable,
  `platejs/testing` completes the lower-distribution mirror, and direct raw
  imports fail everywhere outside the exact reviewed leaves;
- excluded contracts: no public API rename/removal, feature behavior change,
  release action, registry/UI change, or public internal entrypoint; the
  additive `platejs/testing` facade is explicitly in scope.

Handoff:
- owner: exact public proxy and private replacement leaves in
  `packages/platejs`, enforced by Oxlint and the entrypoint DAG;
- break: none; `platejs/testing` is additive and existing public imports,
  names, types, runtime identity, and behavior are preserved;
- result: every first-party authorable Plate surface now consumes Plate-owned
  named source leaves or matching entrypoint owners, while only exact reviewed
  bridge files import raw `plitejs*`;
- proof: focused verification, final strict packed proof, and correction P1
  invocation 3 are green;
- release/browser: `platejs` patch changeset present; no registry changelog or
  Browser run because the new testing import has no copied or rendered UI;
- remaining risk: none known.

Final handoff prepared:
- Ownership and target API: exact Plate proxy/replacement leaves own raw Plite;
  all first-party authorable code consumes Plate-owned source leaves.
- Public breaks and adoption: no breaking change; `platejs/testing` is additive,
  all first-party tests are adopted, and enforcement rejects future bypasses.
- Applicable runtime/package/docs/browser decisions: package and packed
  runtime/type consumers pass; Vision, agent doctrine, and the patch changeset
  are current; public docs, registry, and Browser do not apply.
- Proof and execution risks: focused and strict packed gates plus final P1
  review pass; no known risk remains.
- Execution order and user attention: implementation is complete and ready for
  inspection; no commit, push, PR, or release is authorized.

Timeline:
- 2026-08-30T16:32:49.615Z Plate Plan created.
- 2026-08-30: Implemented exact bridges, rewired production source, replaced
  raw feature DAG edges, added enforcement tests, and repaired source doctrine
  for the original scope at Plate Next v123.
- 2026-08-30: Fixed both accepted P1 review findings, passed the final review,
  full package proof, strict packed consumer matrix, and prepared handoff.
- 2026-08-30: User identified the blanket spec exemption. Added
  `platejs/testing`, migrated 85 test/type-test files, removed wildcard Plate
  test exemptions, advanced doctrine to v124, and fixed three correction-review
  findings across two invocations.
- 2026-08-30: Final strict 80-subpath packed proof and correction-scope P1
  invocation 3 passed; the correction is complete.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | User inspection |
| What is the goal? | Only exact facade/replacement bridges import raw Plite; all authorable Plate code dogfoods Plate |
| What have I learned? | Test and type-test globs are consumer boundaries, not exemption boundaries; `testing` was the one missing public Plite mirror. |
| What have I done? | Added the testing facade, migrated every Plate test import, enforced exact parsed imports across all Plate test surfaces, restored React parity proof, and repaired doctrine/release metadata. |

Open risks:
- None known.
