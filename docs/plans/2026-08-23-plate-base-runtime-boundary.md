# Plate Base runtime boundary

Objective:
Close the Plate Base runtime boundary decision; done when binary readiness
gates pass; plan docs/plans/2026-08-23-plate-base-runtime-boundary.md.

Flow mode:
one-shot execution of the accepted plan

Goal plan:
docs/plans/2026-08-23-plate-base-runtime-boundary.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- Binary readiness: live claims sourced, one owner per responsibility, every
  decision resolved, every public break has adoption and proof, execution
  slices are concrete, conditional gates are resolved, and `check-complete`
  passes.

Verification surface:
- Planning: exact import/reexport reachability from `createBaseEditor`, package
  manifests and exports, Base/React type owners, existing package-boundary
  tests, and current Node/static/plugin documentation.
- Mechanical planning closure:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-plate-base-runtime-boundary.md`.
- Execution commands will be limited to the accepted Core, Plate facade,
  package-artifact, type-contract, React-regression, docs, and changeset owners.

Constraints:
- Planning only until the user explicitly accepts this exact plan and invokes
  `plate-plan` against it.
- No public compatibility aliases or runtime shims.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.
- Preserve the selected public call sites: `createBaseEditor` from `platejs`
  and React editor construction from `platejs/react`.
- Preserve Base descriptor support for server-safe static/RSC components unless
  a separate `best-api` decision proves a better public shape.
- Do not equate server-safe execution with a zero-React declaration/install
  promise that current public teaching does not explicitly make.

Boundaries:
- In scope: Base root runtime reachability, the Core/Plate package manifests and
  exports that publish it, the Base-versus-React type boundary, current boundary
  tests, and public Node/static teaching.
- Source owners: `packages/core`, `packages/plate`, package-build/config owners,
  focused boundary tests, and directly affected docs.
- Non-goals: HTML/Markdown ownership, paragraph/root policy, general package
  slimming, performance optimization, registry work, Plite redesign, product
  implementation during this planning goal, commits, pushes, or PRs.
- Direct Plite boundary owners: `@platejs/plite-dom` remains the Base DOM
  substrate; `@platejs/plite-react` remains React-adapter-owned and must not be
  evaluated by the Base root import.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if current package/build tooling cannot express an isolated
  no-React runtime-reachability proof and no narrower source or built-artifact
  audit can determine the owner, or if a newly discovered public requirement
  forces a different call shape that needs user judgment.

Plate Plan state:
- status: blocked
- phase: execution_slice_5
- next: repair the 40 schema-adoption failures in their owning migration work, then resume this goal for a fresh closure audit
- handoff: implementation_ready_goal_blocked

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | User invoked `plate-plan go`; scope is the narrow Base runtime boundary selected in the immediately preceding `best-api` review; planning must stop before implementation. |
| Active goal and plan verified | yes | Active goal `01a02eac-9e8c-7231-b8b5-8741be30b509`; this file is the named goal plan. |
| Current owners read | yes | Core root and React entrypoints, Base and React constructors, native descriptor owners, Core and facade manifests/exports/build configs, build-artifact checks, type contracts, Vision, and Node/static/plugin docs were read from the current checkout. |
| Best API target resolved | yes | Preceding `best-api review`: keep public imports unchanged; make Base runtime imports stop evaluating React/ReactDOM; do not select a physical package split without evidence. |
| Mode and execution boundary resolved | yes | `standard`, agent-led plan hardening; plan-only until explicit acceptance of this exact file. |
| Accepted execution authorized | yes | On 2026-08-23 the user replied `go` to the handoff for this exact plan; one-shot execution is authorized without commit, push, PR, or release mutation. |

Work Checklist:
- [x] Skill analysis complete: explicit `plate-plan` invocation selects
  `--standard`; Plate Plan requires Autogoal and the `plate-plan` template;
  `best-api` already selected the public call shape; no implementation worker
  skill applies during planning.
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and private bridge policy have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved with scoped reasons.
- [x] Source-runtime and emitted-artifact contracts fail for the expected current React reachability.
- [x] Base DOM and React descriptor owners are split without duplicate identity or compatibility path.
- [x] Source-runtime, identity, type, barrel, and emitted-artifact gates pass.
- [x] Shared build enforcement and its fixtures fail closed at the configured root entries.
- [x] Changeset handling is correct relative to `main`; manifests and current docs remain accurate.
- [x] Focused tests, Core/Plate typechecks/builds, and lint pass.
- [ ] `check:core` passes; its source-adoption phase currently reports 40 unrelated checkout failures and no packet file.
- [x] Browser `/blocks/playground` mounts and commits an edit with no relevant console failure.
- [x] P1 `autoreview` has no accepted open finding after in-scope repair and reruns; final clean certification is unavailable because unrelated plan files changed during each bundle review.
- [x] Final execution evidence, risks, reboot status, and mechanical closure result are recorded.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Planning readiness | yes | Preserve the accepted architecture and scope | The accepted decision ledger, risks, slices, and proof matrix remain the execution contract. |
| Binary execution readiness | blocked | Complete Slices 1-5 and every checked work item | `check:core` is red on 40 out-of-scope schema-adoption findings. |
| Fresh execution evidence | yes | Record red/green commands, type/build/check results, Browser evidence, and final source audit | Recorded below, including the failed root-check boundary. |
| Best API repair | no, unchanged public API | Stop if implementation requires a reusable public shape change | The accepted target preserves every public import, constructor, option, and plugin call; no doctrine repair applies unless that fact changes. |
| Conditional risk and adoption | yes | Close descriptor identity, static types, artifact checker, changeset, docs, manifest, barrel, and Browser gates | All scoped gates pass; no standalone changeset or docs/manifest edit applies. |
| P1 autoreview | partial | Run `autoreview --max-priority P1` after implementation proof; repair accepted in-scope findings within Plate's three-invocation cap | Invocation 2 exposed one needless source export; it was removed and all affected proof reran. Invocation 3 reported zero findings, then refused clean certification because an unrelated plan changed concurrently. The cap is exhausted. |
| Final handoff | yes | Report actual ownership, proof, unchanged contracts, and remaining risk without claiming release | This plan records a local implementation with explicit checkout-level blockers; no release claim. |
| Goal plan complete | blocked | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-plate-base-runtime-boundary.md` after all evidence is current | Expected to remain red until `check:core` passes; the review cap forbids another review of this unchanged scope. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current source, artifact, manifest, type, test, docs, and Vision owners audited. | Decide |
| Decide | complete | Private owner cut, preserved public shape, unchanged install topology, and artifact oracle selected. | Prove and hand off |
| Prove and hand off | complete | Failure cases, execution slices, proof commands, and acceptance boundary recorded. | Accepted execution |
| Slice 1: source red contract and owner cut | complete | Base contract failed because `react(...)` ran, then passed after the mixed module was deleted; no compatibility path remains. | Slice 2 |
| Slice 2: behavior and types | complete | Base runtime spec passes 1/1, React identity passes 11/11, the private files stay out of barrels, and Core/Plate typechecks pass. | Slice 3 |
| Slice 3: artifact enforcement | complete | Two isolated RED fixtures proved the missing transitive checker and missing direct-build hook forwarding; 12/12 verifier tests and both configured package builds pass. | Slice 4 |
| Slice 4: release note and docs audit | complete | `main` has no `createBaseEditor`; this branch-only correctness repair gets no standalone changeset. Existing v54 changesets own the public release delta. Manifests and Node/static/plugin docs have no task diff and remain accurate. | Slice 5 |
| Slice 5: closure and review | blocked | Focused proof, types, builds, lint, and Browser pass. `check:core` has 40 unrelated adoption failures. Final P1 output has zero findings but cannot certify a moving checkout; the three-invocation cap is exhausted. | Repair the checkout-level backlog, then start a fresh accepted closure run if clean certification is still required. |

Decision brief:
- outcome: Make the Base runtime boundary real without inventing a new public
  API or prematurely splitting package topology.
- chosen shape: Keep `platejs` and `platejs/react`; the Base root must not
  evaluate `@platejs/plite-react`, `react`, `react-dom`, or
  `react-compiler-runtime`. Preserve type-only static/RSC component authoring
  unless live evidence changes the decision.
- strongest rejected alternative: Physically split Base and React packages now.
- consequence: Execution first repairs the literal source/runtime owner and
  adds artifact proof; package topology changes only if that proof exposes an
  unresolved installation or declaration requirement, which would stop this
  plan and return the public decision to `best-api`.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Base runtime reachability | `createBaseEditor` always installs `DOMPlugin`; that plugin imports a shared module which eagerly calls `react(...)`. | The emitted `@platejs/core` root closure contains none of `@platejs/plite-react`, `react`, `react-dom`, or `react-compiler-runtime`. | Plate Core Base runtime | `createBaseEditor` is the documented non-React constructor. | Private hard cut; public imports and options stay unchanged. | Source graph plus transitive emitted-entrypoint import check. | Removing DOM behavior or missing a hidden local chunk. | `rearchitect` |
| DOM descriptor identity | One shared module creates the exact DOM descriptor consumed by both `DOMPlugin` and `react({ dom })`. | Base owns one private DOM descriptor; React imports that exact identity without Base importing React. | `packages/core/src/lib/plugins/dom` | Plite React composition requires the exact DOM descriptor, not a second `dom()` call. | Move the descriptor to `plateDOMExtension.internal.ts`; delete the mixed-owner module without an alias. | Existing extension identity assertions and React editor behavior. | A duplicate descriptor can compile yet fail capability lookup. | `move` |
| React descriptor | The mixed-owner module creates `plateReactExtension`, and Base reaches the module merely to get the DOM descriptor. | `getPlateCorePlugins.ts` owns and creates the React descriptor from the Base-owned DOM descriptor. | Plate Core React editor owner | The React descriptor has one production consumer and belongs beside React core installation. | Update direct private test imports; expose no new public export. | React descriptor/API identity assertions plus browser editing proof. | Moving it can alter initialization order or exact identity. | `inline` |
| Public call shape | `@platejs/core` and `platejs` publish root, `/react`, and `/static` entrypoints; `platejs` root re-exports Core. | Keep all package names, exports, constructors, options, and plugin calls unchanged. | Core and Plate facade entrypoints | The selected API already expresses the user jobs; the bug is private reachability. | None. | Public typechecks and unchanged entrypoint assertions. | Accidental barrel export or declaration drift. | `keep` |
| Package/install topology | Core directly depends on `@platejs/plite-react` and carries React peers because one package also publishes `/react` and static React types. | Keep dependencies and peers unchanged in this packet; make no zero-React installation promise. | Core/Plate manifests | Installed code is not the same as evaluated code; moving dependencies would require a physical package split. | None. Any manifest split requires a new accepted plan. | Manifest diff must be empty; emitted root closure proves runtime isolation. | Conflating runtime safety with install purity. | `keep` |
| Base static component authoring | Base plugin definitions intentionally accept React component types for static/RSC and live consumers. | Preserve component inference and static rendering contracts. | Plate Core Base types and static adapter | Vision explicitly assigns root-level `component` to Base and Plate authoring. | None. | Core typecheck, existing typed render contract, and static tests through `check:core`. | A declaration purge breaks a supported user job while fixing the wrong layer. | `keep` |
| Built artifact oracle | Build validation checks artifact existence and declaration shape, but not transitive external imports per entrypoint. | Direct-package builds accept entrypoint-specific forbidden runtime packages and report the local import path to a violation. | Shared direct-package build verifier, configured by Core and Plate | The invariant must survive bundling and chunk changes. | Add internal config only; no product API. Configure only root entries, leaving `/react` and `/static` free to use React. | Node fixture tests plus Core and Plate builds. | A shallow or package-wide scan gives false confidence or false failures. | `add` |
| Public Node/static teaching | Node docs say base imports are server-safe/non-React; static docs separately use React for rendering. They do not promise dependency-free installation. | Keep current wording; implementation must satisfy it. | Docs owner | Current teaching already describes the intended runtime and static jobs accurately. | No docs edit unless execution uncovers a narrower verified contract. | Re-read named pages after artifact proof; docs build only if text changes. | Adding module-internal detail would make docs brittle; leaving a failed claim would be worse. | `keep` |
| Release note | `createBaseEditor` and the Base runtime are branch-local additions relative to `main`; existing v54 changesets already own that release delta. | Add no standalone changeset for a correctness repair to an API that has never shipped. | Changeset owner | Release notes describe what users upgrading from `main` observe, not intermediate branch defects. | None. | `main` symbol audit, existing changeset audit, and final diff. | Inventing release history for an unshipped defect. | `keep` |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Cut the mixed owner | Plate Core Base + React | Add private `packages/core/src/lib/plugins/dom/plateDOMExtension.internal.ts`; update `DOMPlugin.ts`; create the React descriptor in `getPlateCorePlugins.ts`; delete `internal/plugin/plateNativeExtensions.ts`; update `TPlateEditorCore.spec.ts`. | Accepted plan and current shared descriptor path. | Base source closure has no value import from `@platejs/plite-react`; React uses the exact Base DOM descriptor; no compatibility file remains. | Focused Core test, source reachability audit, `pnpm --filter @platejs/core brl`. |
| 2. Preserve behavior and types | Plate Core tests/types | Keep the existing Base/React identity assertions; add isolated `packages/core/src/lib/editor/createBaseEditor.runtime.spec.ts`, which mocks `@platejs/plite-react`, dynamically imports the Core root, creates a Base editor, and asserts its DOM API without loading the mock; retain static component inference coverage. | Slice 1 source cut. | Base DOM API, React DOM/API identity, `createBaseEditor`, `createPlateEditor`, and component authoring all pass. | `pnpm --filter @platejs/core exec bun test ./src/lib/editor/createBaseEditor.runtime.spec.ts`; then the same command for `./src/react/editor/TPlateEditorCore.spec.ts`; `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plate`. |
| 3. Make the boundary executable | Build tooling + Core/Plate configs | Extend the direct-package artifact verifier with transitive local ESM import traversal and `runtimeImportBoundaries: [{ entry: 'dist/index.js', forbiddenPackages: [...] }]`; match exact package names and subpaths, report the local import path, and fail on missing local chunks. Add fixtures; configure Core and Plate root entries against the four React runtime packages. | Slice 1 and the emitted root contract. | Builds fail with an import path when a forbidden package is reachable from a configured root, while `/react` and `/static` remain legal. | `node --test tooling/scripts/check-package-build-artifacts.test.mjs`; `pnpm turbo build --filter=./packages/core --filter=./packages/plate`. |
| 4. Record user impact | Changeset + docs audit | Compare the final behavior with `main`, audit existing v54 changesets, re-read Node/static/plugin docs, and edit only when the release or docs contract is incomplete. | Green artifact and type proof. | No branch-only changeset; no manifest changes; docs remain source-backed. | `main` symbol audit, existing changeset audit, and manifest/docs diff inspection. |
| 5. Close the accepted execution | Core/Plate verification + Plate UI | Run focused proof, `check:core`, lint, a React editor Browser smoke, then P1 `autoreview`; repair only verified in-scope P0/P1 findings and rerun affected gates. | Slices 1-4 complete. | All gates pass; `/blocks/playground` mounts and commits an edit; no open P0/P1 finding; no product scope expansion. | `pnpm check:core`; `pnpm lint:fix`; Browser against `/blocks/playground` from `pnpm --filter www dev`; P1 `autoreview` within the three-invocation cap. |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Current failure is real | `withPlite-CUz9Fw6m.js`, reachable from Core root, imports `@platejs/plite-react`; source path is `createBaseEditor` -> `getCorePlugins` -> `DOMPlugin` -> mixed native-extension module. | Source and build-hook RED contracts failed on the exact missing isolation, then passed after the owner cut and checker integration. | passed |
| Base keeps DOM capability | `getCorePlugins` always installs `DOMPlugin`; `DOMPlugin` extends the Plite DOM descriptor. | Base editor test passes 1/1 and asserts `editor.api.dom`; Core type/build proof is green. | passed |
| Base root does not evaluate React runtime | Current emitted Core root closure includes `@platejs/plite-react`; current Plate root delegates to `@platejs/core`. | Core and Plate root builds forbid `@platejs/plite-react`, `react`, `react-dom`, and `react-compiler-runtime` through every emitted local chunk. | passed |
| React uses the canonical DOM/React graph | Existing `TPlateEditorCore.spec.ts` checks exact DOM and React descriptor APIs for new and reconfigured React editors. | Updated identity assertions pass 11/11 without a second DOM descriptor; Browser editing passes with zero console warnings/errors. | passed |
| Public API and inference do not move | Root and `/react` barrels already publish the selected constructors; no target export changes. | Core/Plate typechecks pass 13/13; rebuilt public artifacts do not export `plateReactExtension`; the descriptor is module-private. | passed |
| Static/RSC authoring survives | Vision and typed Core tests require root-level `component`; static docs construct a Base editor with React static components. | Core type contracts pass inside the 13-task typecheck; no React type-removal diff exists. | passed |
| Install topology stays honest | Core and Plate manifests currently carry React dependencies/peers for sibling entrypoints. | Manifest diff is empty; no release note makes an installation-purity claim. | passed |
| Build oracle is durable | Direct build hook already owns artifact validation after tsdown completes. | 12/12 fixtures prove transitive local chunk traversal, exact package/subpath matching, legal React sibling entries, hook forwarding, and missing-chunk failure. | passed |

Conditional evidence:
- High-risk scenario 1: another Base-owned chunk imports a React runtime after
  the descriptor move. Blast radius is every Node/Base consumer. The emitted
  root traversal must fail with the local import path. Hard-cut answer: repair
  that literal owner; do not add a lazy import, loader exception, or shim.
- High-risk scenario 2: React constructs a second DOM descriptor. Types can stay
  green while Plite capability lookup fails. Blast radius is every interactive
  editor. Exact descriptor/API assertions and Browser editing must pass.
  Hard-cut answer: keep one Base-owned DOM descriptor and make React consume it.
- High-risk scenario 3: removing React reachability also removes component
  declarations used by static/RSC authors. Blast radius is Base plugin authoring
  and static rendering. Core type contracts and static tests must pass. Hard-cut
  answer: restore type-only authoring; do not restore a React value import.
- High-risk scenario 4: the artifact checker scans only the entry file or bans
  all package entries. That produces false confidence or breaks `/react` and
  `/static`. Fixture tests must traverse multiple local chunks and scope the
  ban to configured root entries. Hard-cut answer: fix the checker before
  accepting the runtime claim.
- Rollback policy: there is no compatibility bridge. If an execution slice
  cannot satisfy its focused proof, revert that slice and stop. A physical
  package split or public call-shape change requires a revised `best-api` and
  accepted Plate Plan, not an improvisation inside this packet.
- External research: not applicable. The decision is checkout-specific and
  current source plus emitted artifacts are authoritative.
- Issue/PR provenance: not applicable. This work has no public issue or PR
  authority and the plan permits no GitHub mutation.
- Docs: current Node/static/plugin pages are the target contract and require no
  edit by default. Edit only if final proof narrows that contract.
- Browser: applies only as React regression proof and because `packages/**`
  changes require Browser verification; use `/blocks/playground`. It does not
  prove the Node import boundary.
- Registry: not applicable; no copied UI or registry contract changes.
- Release: no standalone changeset applies because the repaired API and bug
  never existed on `main`; existing v54 changesets own the public delta.
  Publishing, committing, pushing, and PR creation are outside this plan.
- Barrels: run the Core barrel generator because a file moves under an exported
  folder; the new `.internal.ts` owner must not become public.
- Public API repair: not applicable because this plan preserves every reusable
  public call shape. Any discovered need to change one stops execution and
  returns to `best-api repair`.

Findings:
- `packages/core/src/lib/editor/withPlite.ts:883` always asks
  `getCorePlugins()` for Base core plugins; `getCorePlugins.ts:31-34` includes
  `DOMPlugin`.
- `DOMPlugin.ts:15,213` imports and extends `plateDOMExtension` from
  `internal/plugin/plateNativeExtensions.ts`. That module imports
  `@platejs/plite-react` and eagerly calls `react({ dom })` at lines 2 and 6-8.
  This is the literal mixed owner.
- `getPlateCorePlugins.ts:16-20` adapts the same DOM plugin and consumes the
  React descriptor. `TPlateEditorCore.spec.ts:55-90` proves exact DOM and React
  descriptor identity for new and reconfigured React editors. A second
  `dom()` descriptor is therefore invalid even if its fields look identical.
- Core exports separate root, `/react`, and `/static` artifacts
  (`packages/core/package.json:33-56`); the facade mirrors that topology
  (`packages/plate/package.json:33-38`). `platejs` root re-exports Core while
  `platejs/react` re-exports Core React (`packages/plate/src/index.tsx:1-13`,
  `packages/plate/src/react/index.tsx:1-10`). No public export move is needed.
- The current emitted Core root reaches four local files and imports
  `@platejs/plite-react` from `withPlite-CUz9Fw6m.js`. The emitted Plate root
  imports only `@platejs/core`, `@platejs/plite`, `@platejs/utils`, and
  `@udecode/utils`; its React leak is transitive through Core.
- Core directly depends on `@platejs/plite-react` and React-owned packages and
  declares mandatory React peers (`packages/core/package.json:74-109`). Plate
  also declares React peers (`packages/plate/package.json:53-67`). Those
  manifests support sibling `/react` and static jobs, so this plan makes no
  zero-React installation claim.
- Base component types are deliberate, not accidental leakage:
  `PluginDefinition.ts:906-908` defines React component authoring and Vision
  requires root-level `component` for static/RSC and live consumers
  (`docs/vision/plate.md:243-260`). Existing typed proof is
  `defineBasePlugin.typed.spec.ts:736-755`.
- Current docs already draw the correct user boundary: Node scripts use base
  imports and `createBaseEditor` without a React tree
  (`content/docs/installation/node.mdx:6-14,32-67,145-181`), while static/RSC
  rendering intentionally uses React (`content/docs/(guides)/static.mdx:1-16,
  43-60,98-167`).
- `assertPackageBuildArtifacts` currently validates public artifact existence,
  declarations, and private brands only. The direct-package build hook invokes
  it after build (`tooling/config/direct-package.config.mts:34-39`). This is the
  correct owner for an entrypoint-specific emitted import invariant.

Decisions and tradeoffs:
- Keep public imports and package names -> avoids new permanent concepts ->
  requires exact artifact proof that the narrow runtime hard cut is sufficient.
- Preserve Base static/RSC component authoring -> protects a current user job ->
  means “Base” is a runtime boundary, not automatically a zero-React type
  vocabulary promise.
- Move only the DOM descriptor to a private Base owner -> preserves exact Plite
  identity -> React must import that private identity, but Base never imports
  back into React.
- Inline the React descriptor at its one production owner -> deletes the mixed
  module -> tests use a direct private import and no new barrel surface.
- Keep manifests unchanged -> avoids pretending one multi-entry package can
  shed its React install contract -> users get the promised Node runtime fix,
  not a false dependency-purity claim.
- Put enforcement in the emitted-artifact build hook -> catches chunking drift
  -> adds a small generic build-config concept, justified because source-only
  tests cannot prove published entrypoint reachability.
- Reject dynamic imports and compatibility aliases -> they hide wrong
  ownership and weaken failure signals -> the private hard cut is simpler.

Review fixes:
- Rejected the report's immediate physical package split; current evidence
  proves one mixed source owner, not a package-topology failure.
- Preserved the exact DOM descriptor identity after noticing that two `dom()`
  calls would pass shape checks but violate Plite capability lookup.
- Upgraded proof from source grep to transitive emitted-entrypoint enforcement.
- Narrowed documentation claims to runtime evaluation and explicitly kept the
  current install/declaration closure.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Ad hoc emitted-import scanner over-escaped its regex and reported an empty closure | 2 | Simplify the parser and validate it against visible static imports | Corrected scan found Core root's four local files and `@platejs/plite-react`; no product or plan decision relied on the bad output. |
| Focused Bun command forced the root config from the package cwd, so its relative preload could not resolve | 1 | Use the package-owned config through `pnpm --filter @platejs/core exec bun test <file>` | Corrected command produced the expected behavioral RED, then the GREEN results below. |
| `*-contract.ts` was treated as a barrel source and pulled `bun:test` into the package build graph | 1 | Rename the isolated mock test to `.spec.ts`; `check:core` already isolates module-mocking specs | Core barrel generation removed the accidental export; public barrel audit is empty and the clean typecheck build has no `bun:test` warning. |
| The first runtime-import regex escaped double quotes while using Unicode mode, which Node rejects | 1 | Use ordinary quote classes and rerun the isolated verifier | The corrected parser loaded successfully; all 12 verifier fixtures and both configured package builds passed. |
| P1 review invocation 1 found no defect but detected concurrent checkout drift | 1 | Prove packet hashes were stable, wait for the unrelated plan writer to settle, and rerun | Packet hashes were stable; an unrelated untracked plan changed during review. Invocation 2 used the settled tree. |
| P1 review invocation 2 reported the React descriptor as exported from a barrel-facing module | 1 | Verify curated public artifacts, then remove the source-level export anyway because the test can use the production plugin graph | Built public artifacts never exported the descriptor, so there was no shipped API leak. The source export was still needless: it is module-private and the identity test now uses `getPlateCorePlugins()[1]`. |

Verification evidence:
- Current source chain verified on 2026-08-23:
  `createBaseEditor` -> `getCorePlugins` -> `DOMPlugin` ->
  `plateNativeExtensions` -> `@platejs/plite-react`.
- Current emitted-artifact scan verified that `packages/core/dist/index.js`
  reaches `HtmlPlugin-CumZWoOM.js`, `pluginNodeClass-DCJJpVpA.js`, and
  `withPlite-CUz9Fw6m.js`; that closure imports `@platejs/plite-react`.
- Current facade scan verified that `packages/plate/dist/index.js` delegates to
  `@platejs/core` and has no direct React import. Both root entries therefore
  need configured checks, with Core owning the transitive fix.
- Current source search found only three production consumers/definitions of
  the native descriptors: `DOMPlugin.ts`, `getPlateCorePlugins.ts`, and the
  mixed module; the fourth consumer is the focused identity test.
- Current manifests, public exports, direct build hook, typed Base component
  contract, Vision, and named Node/static/plugin docs were read. No external
  source was used.
- Planning changed only this durable plan. Product tests and Browser were not
  run because execution remains behind explicit acceptance.
- Planning evidence is bound to source SHA
  `33557a72cc6b393c4646af46cf0348f0e49efa99`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-23-plate-base-runtime-boundary.md`
  passed on 2026-08-23.
- RED: `pnpm --filter @platejs/core exec bun test ./src/lib/editor/createBaseEditor.runtime.spec.ts`
  failed 0/1 because the React extension sentinel was created while the Base
  editor and DOM API otherwise initialized correctly.
- GREEN: the same Base runtime contract passed 1/1 after moving the exact DOM
  descriptor to `lib/plugins/dom` and constructing the React descriptor only in
  `react/editor/getPlateCorePlugins.ts`.
- GREEN: `pnpm --filter @platejs/core exec bun test ./src/react/editor/TPlateEditorCore.spec.ts`
  passed 11/11 and 45 assertions, including exact DOM/React capability identity
  for new and reconfigured React editors.
- GREEN: `pnpm --filter @platejs/core brl` completed; searches of the Core root,
  editor, DOM, and internal barrels found no runtime spec or private descriptor
  export.
- GREEN: `pnpm turbo typecheck --filter=./packages/core --filter=./packages/plate`
  passed all 13 tasks, including Core runtime/test/type contracts, clean package
  builds, and the Plate facade typecheck.
- RED: the first transitive artifact fixture failed 1/9 with `Missing expected
  exception`, proving the checker did not inspect a local chunk for
  `@platejs/plite-react/internal`.
- GREEN: after adding fail-closed local ESM traversal, the artifact verifier
  passed 9/9 fixtures.
- RED: the direct-package build-hook fixture then failed 1/10 with `Missing
  expected rejection`, proving configured boundaries were not forwarded into
  artifact validation.
- GREEN: `node --test tooling/scripts/check-package-build-artifacts.test.mjs`
  passed 12/12, including transitive package/subpath rejection, direct build
  hook enforcement, legal React sibling entries, and missing-chunk failure.
- GREEN: `pnpm turbo build --filter=./packages/core --filter=./packages/plate`
  passed all 12 tasks with the Core and Plate `dist/index.js` root boundaries
  active.
- Release/docs audit: neither local nor `origin/main` publishes
  `createBaseEditor`; the current branch introduces it under existing v54
  changesets. A new fix changeset would describe an unshipped branch defect, so
  none was added. Core/Plate manifests and named Node/static/plugin docs have
  no task diff and still match the proven runtime-only boundary.
- P1 review scope baseline: review the accepted Base-root runtime invariant in
  the current checkout. Core Base owns one exact DOM descriptor; Core React
  consumes it; shared direct-build tooling enforces the Core and Plate emitted
  root boundary. Public imports, manifests, static types, and behavior stay
  unchanged. The packet is 12 code/config files with 142 added and 21 removed
  non-test lines, plus focused tests; unrelated plan files are outside the
  review scope.
- GREEN: `pnpm lint:fix` completed across 4,190 files. It emitted only the
  repository's existing module-type performance warnings.
- Root gate: `pnpm check:core` passed its 6 runner-contract tests, 3 declaration
  leak tests plus source audit, 8 declaration-brand tests, and 61 schema-audit
  contract tests. The following source-adoption audit failed on 40 existing
  checkout findings across registry, docs, and unrelated packages. None names a
  file in this packet. Fixing that backlog would violate this plan's boundary.
- Browser: `pnpm --filter www dev` served `/blocks/playground` with HTTP 200.
  The editor mounted, committed `Plate Base runtime smoke` into an ordinary
  paragraph, and `tab.dev.logs` returned no warning or error.
- P1 review invocation 1 (`autoreview --mode local --max-priority P1`) reported
  zero findings and 0.91 confidence, then refused certification because an
  unrelated untracked plan changed during review.
- P1 review invocation 2 reported one P1: `plateReactExtension` was exported
  from a barrel-facing source module. Rebuilt curated public artifacts proved
  it was never a package export, but the source export was needless. The
  descriptor is now module-private and the identity test uses the production
  `getPlateCorePlugins()[1]` descriptor.
- GREEN after the review repair: Base 1/1; React identity 11/11 with 45
  assertions; artifact fixtures 12/12; Core/Plate typechecks 13/13; Core/Plate
  builds 12/12; lint; and explicit absence of `plateReactExtension` from source
  exports plus `dist/react/index.js` and `dist/react/index.d.ts`.
- P1 review invocation 3 reported zero findings with 0.96 confidence. It again
  refused clean certification because an unrelated plan changed during the
  review. Plate's three-invocation cap is exhausted; no accepted finding
  remains, but this checkout is not claimed review-clean.
- Mechanical closure: `node .agents/skills/autogoal/scripts/check-complete.mjs
  docs/plans/2026-08-23-plate-base-runtime-boundary.md` exited 1 with one
  unchecked Work Checklist item: the explicitly recorded `check:core` gate.
- Closure retry 2/3: a fresh `pnpm check:core` rerun passed the same runner,
  declaration, brand, and 61 schema-audit contract phases, then reproduced the
  exact same 40 source-adoption failures. Packet file fingerprints are
  unchanged and no packet file appears in the failure list. The blocker is a
  stable current-branch backlog, not transient concurrent writes.
- Closure retry 3/3: the authoritative root command again passed every phase
  before the source-adoption audit and returned the identical 40 failures. The
  packet fingerprints remain unchanged. The strict blocked threshold is met;
  widening this accepted runtime-boundary packet into the independent schema,
  codec, migration, registry, docs, and Yjs owners would be dishonest scope
  expansion.

Final handoff prepared:
- Ownership and target API: Core Base owns the exact DOM descriptor; Core React
  owns `react({ dom })`; build tooling enforces emitted entrypoint boundaries.
  Keep `createBaseEditor` from `platejs` and React APIs from `platejs/react`.
- Public breaks and adoption: none. Delete the mixed private module without an
  alias and update private consumers/tests. Add no branch-only changeset.
- Runtime/package/docs/browser decisions: Base roots forbid four React runtime
  packages; manifests and docs stay; Browser verifies only React regression on
  `/blocks/playground`; registry and release mutation do not apply.
- Proof and execution risks: hidden chunks, duplicate DOM identity, static type
  regression, and a shallow/overbroad artifact checker each have a focused gate
  and hard-cut response above.
- Execution order and user attention: accept this exact plan, then run Slices
  1-5 in order. Stop for user judgment only if evidence requires a package
  split or public API change. Do not implement from this planning run.

Timeline:
- 2026-08-23T13:00:46.999Z Plate Plan created.
- 2026-08-23 Plate Plan and Autogoal requirements loaded; active goal created;
  prompt requirements, scope, execution boundary, and initial decision rows
  materialized before further source exploration.
- 2026-08-23 Grounded the exact runtime path, descriptor identity law, public
  entrypoints, manifests, emitted chunks, build hooks, type contracts, Vision,
  and current docs; resolved the target and proof owner.
- 2026-08-23 Completed risk pressure, execution slicing, proof matrix, and
  acceptance handoff without changing product code.
- 2026-08-23 User accepted this exact plan with `go`; created a new one-shot
  execution goal and reopened implementation, proof, Browser, and review gates.
- 2026-08-23 Added the Base public-runtime sentinel, captured the expected RED,
  deleted the mixed descriptor module, and reached GREEN for the Base contract
  and all focused identity tests.
- 2026-08-23 Renamed the sentinel from a build-visible contract file to an
  isolated spec, regenerated Core barrels, proved no private export, and passed
  Core/Plate typechecks across 13 tasks.
- 2026-08-23 Added transitive emitted-root enforcement to the shared direct
  build hook, captured both missing-check RED states, passed 12/12 fixtures,
  and passed Core/Plate builds with both root boundaries active.
- 2026-08-23 Corrected the planned release-note decision after proving that
  `createBaseEditor` does not exist on `main`; kept existing v54 changeset
  coverage and confirmed no task diff in manifests or named docs.
- 2026-08-23 Passed focused tests, 13-task typecheck, 12-task build, lint, and
  live Browser editing. `check:core` stopped on 40 unrelated schema-adoption
  findings after its earlier contract phases passed.
- 2026-08-23 Ran the three allowed P1 review invocations. Removed one needless
  source-level React descriptor export, reran every affected gate, and received
  zero final findings. Concurrent unrelated plan writes prevented clean helper
  certification in each final bundle.
- 2026-08-23 Goal continuation 2 reran `check:core` from the current checkout;
  the identical 40 out-of-scope adoption failures remain. Recorded strict
  blocked-audit count 2/3 without changing their owners.
- 2026-08-23 Goal continuation 3 reproduced the same current-checkout failure
  set with unchanged packet fingerprints. Marked the goal blocked after the
  required 3/3 audit instead of weakening the gate or absorbing unrelated work.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Execution Slice 5 blocked at checkout-level closure |
| Where am I going? | Handoff the proven packet and exact unrelated blockers without a false clean claim. |
| What is the goal? | Make the accepted Base runtime boundary true and prove it without changing public API or install topology. |
| What have I learned? | One mixed private module violates the runtime boundary; exact DOM identity and Base static types must survive the cut. |
| What have I done? | Completed the owner cut, durable artifact enforcement, release/docs audit, focused proof, Browser check, P1 repair, and all affected reruns. |

Open risks:
- `check:core` remains red on 40 out-of-scope schema-adoption findings. The
  packet's files do not appear in that failure list. The same condition has
  repeated on 3/3 consecutive goal turns; goal closure is blocked until those
  owning migrations restore the root gate.
- The final P1 review has zero findings, but unrelated plan files changed while
  every final bundle was reviewed. The three-invocation cap is exhausted, so
  the whole checkout cannot be called review-clean in this run.
- The artifact scanner intentionally supports emitted static ESM imports,
  reexports, and literal dynamic imports. A future non-literal loader would
  need explicit checker support rather than silent acceptance.
- React remains in package dependency and declaration closure by design. A
  future zero-React installation goal is a different package-topology project.
- Browser proof can catch React initialization regressions but cannot prove the
  Node import boundary; only the emitted root oracle supports that claim.
