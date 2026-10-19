# Finalize platejs entrypoint ownership

Objective:
Finalize platejs entrypoint ownership; done when every export, adoption slice,
runtime gate, and proof is resolved and the plan checker passes; plan
docs/plans/2026-08-28-finalize-platejs-entrypoint-ownership.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-28-finalize-platejs-entrypoint-ownership.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard`

Completion threshold:
- Binary completion: all seven execution slices are implemented; all 21
  current root feature families and both React-only families have one canonical
  public owner; every adopter, runtime, package, docs, skill, changeset, size,
  lint, typecheck, browser, and review gate passes; and `check-complete` passes.

Verification surface:
- Source audit of `packages/platejs/package.json`,
  `packages/platejs/src/root.tsx`, `packages/platejs/src/react/index.tsx`, and
  `tooling/entrypoints/entrypoint-dag.mjs`.
- Source audit of direct `platejs` and `platejs/react` consumers under
  `apps/**`, `content/**`, and `packages/**`, excluding generated registry
  output.
- Planning check with
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-finalize-platejs-entrypoint-ownership.md`.
- Accepted execution closes with focused package tasks, generated Turbo and
  Oxlint contract tests, packed release-artifact proof, strict Plite/Plate
  checks, www typecheck, and relevant Browser proof.

Constraints:
- The user accepted this exact target and invoked one-shot execution with
  `go all` on 2026-08-29.
- `platejs` remains Plate's sole editor distribution; Plate applications and
  sibling Plate packages never import or install `plitejs`.
- No `platejs/core`, `platejs/basic`, `BasicKit`, public compatibility alias,
  duplicate symbol export, or runtime shim.
- Root ownership does not imply automatic editor installation or membership in
  an app kit. Registry/app source keeps composition policy.
- Preserve document schema identities and behavior. This is an import/export,
  runtime-isolation, and tooling cut, not a persisted-data rewrite.
- `legacy-list-model` remains an explicit maintenance-only entrypoint. Its planned
  deprecation does not authorize removal in this cut.
- Templates remain CI-owned output and are not edited manually.

Boundaries:
- In scope: `packages/platejs` public exports and source barrels; exact
  entrypoint runtime/dependency metadata; generated per-entrypoint Turbo tasks;
  Oxlint DAG enforcement; package consumers; docs/examples/registry imports;
  packed peer, runtime, declaration, tree-shaking, and size proof; changeset;
  and affected Vision/rule sources plus generated skill mirrors.
- Source owners: `packages/platejs/**`, `tooling/entrypoints/**`,
  `tooling/oxlint/**`, relevant `tooling/scripts/**`, `oxlint.config.ts`,
  generated `packages/platejs/turbo.json` and package scripts, source docs and
  app/registry consumers, and the smallest affected `.agents/rules/**` and
  `docs/vision/plate.md` owners.
- Non-goals: feature behavior redesign, new package-kit composition,
  `legacy-list-model` removal, unrelated advanced-entrypoint renaming, package
  publication, PR creation, and manual template edits.
- Direct Plite boundary owners: no public Plite API change is planned. Existing
  `plitejs/dom` and `plitejs/diff` imports remain declared DAG edges and must
  pass isolated Node/headless proof. If execution proves a real substrate
  runtime leak, stop that slice and route the smallest Plite repair through
  `plite-plan`; do not hide it in Plate glue.

Output budget strategy:
- Read named owners first. Count consumer matches before printing them. Exclude
  `node_modules`, `dist`, `.next`, `.turbo`, generated registry output, and
  public registry JSON from exploratory searches. Persist only the plan and
  intentional source/generated outputs.

Blocked condition:
- Execution stops only at a proven Plite/runtime owner gap, an unavoidable public
  collision, or a failing packed/browser proof whose correct fix changes this
  accepted target. Ordinary migration volume, failing focused checks, or
  generated-output churn are repair work, not blockers.

Plate Plan state:
- status: completed
- phase: final-handoff
- next: none
- handoff: complete; local current tree is verified and unpublished

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Root may export standard plugins; no `platejs/basic`; list and indent remain root; table/media and other independent capabilities use subpaths; Turbo, Oxlint, peers, size, runtime, docs, and skill gates are included. |
| Active goal and plan verified | yes | Active goal points to this exact plan path. |
| Current owners read | yes | Live package exports, root/React barrels, peer metadata, entrypoint DAG, Turbo generator, Oxlint DAG plugin, runtime proof generator, and packed checker inspected. |
| Best API target resolved | yes | `best-api` review selected one app-facing root, no `/basic`, one canonical symbol owner, and app/registry-owned kit composition. |
| Mode and execution boundary resolved | yes | One-shot execution of the exact user-accepted target. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Slice 1: canonical DAG, runtime, dependency, peer, and singleton partition contract is implemented and tested.
- [x] Slice 2: package exports and barrels are hard-cut with one public owner per moved symbol.
- [x] Slice 3: every source adopter and teaching import is migrated without changing kit composition.
- [x] Slice 4: generated Turbo tasks and Oxlint enforce exact per-entrypoint ownership and invalidation.
- [x] Slice 5: Node, headless, SSR, browser, optional-peer, DCE, and entrypoint-size proofs pass.
- [x] Slice 6: docs, Vision, source skills, generated mirrors, registry output, and breaking changeset are current.
- [x] Slice 7: lint fixes, strict checks, Browser proof, allowed review, plan checker, and final handoff are complete.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary completion | yes | Implement and prove all seven slices | passed: every slice below is implemented and verified |
| Fresh source evidence | yes | Recheck decision-changing current claims after implementation | passed: exports, barrels, DAG, consumers, peers, runtime metadata, generated configs, docs, and release artifacts reread on the final tree |
| Best API repair | yes | Repair durable API doctrine, affected source skills, and generated mirrors | passed: Vision and five source rules updated; `pnpm install` regenerated matching skill mirrors |
| Conditional risk and adoption | yes | Close all triggered runtime, peer, size, docs, registry, and browser work | passed: packed runtime, exact peer, DCE, size, docs, registry, and browser gates are green |
| Verification recorded | yes | Record focused and repository-wide proof on final source | passed: exact receipts recorded under Verification evidence |
| Handoff prepared | yes | Prepare concise outcome, proof, residual risk, and unpublished state | passed: final handoff below records the local verified and unpublished state |
| P1 autoreview | no | Repo law forbids Autoreview on `next` | branch verified as `next`; skipped by policy |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-28-finalize-platejs-entrypoint-ownership.md` | passed after final ledger update on 2026-08-29 |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live exports, source barrels, peers, DAG, Turbo, Oxlint, runtime and packed owners inspected. | Decide |
| Decide | completed | Canonical owner manifest, rejected alternatives, adoption, risks, and proof resolved below. | Prove and hand off |
| Prove and hand off | completed | Plan checker and final user handoff prepared. | User acceptance, then execution goal |
| Execute slices 1-7 | completed | All seven slices, focused proof, strict Plite proof, full repository check, generated registry, and Browser routes passed on 2026-08-29. | Final handoff |

Decision brief:
- outcome: one `platejs` npm package with a useful standard root and explicit
  independent feature subpaths, without a `/basic` taxonomy or duplicate
  ownership.
- chosen shape: `platejs` owns core plus basic nodes, basic styles, code block,
  indent, link, and list. `platejs/react` owns their React counterparts. Every
  other current root feature gets exactly one explicit subpath, with
  `<feature>/react` only where a React adapter exists.
- strongest rejected alternative: a light root plus `platejs/basic`. It adds an
  extra import concept, makes "basic" preset membership a permanent API debate,
  and duplicates the app/registry EditorKit job.
- consequence: existing consumers of moved descriptors receive hard-cut import
  rewrites. There are no aliases; feature behavior and persisted identities stay
  unchanged.

Canonical owner manifest:

| Family | Headless owner | React owner | Decision |
| --- | --- | --- | --- |
| Core/editor/plugin/schema/codec/history framework contracts | `platejs` | `platejs/react` | keep root |
| basic-nodes | `platejs` | `platejs/react` | keep root |
| basic-styles | `platejs` | `platejs/react` | keep root |
| code-block | `platejs` | `platejs/react` | keep root |
| indent | `platejs` | `platejs/react` | keep root |
| link | `platejs` | `platejs/react` | keep root |
| list | `platejs` | `platejs/react` | keep root |
| callout | `platejs/callout` | `platejs/callout/react` | move |
| combobox | `platejs/combobox` | none currently | move |
| comment | `platejs/comment` | `platejs/comment/react` | move |
| date | `platejs/date` | `platejs/date/react` | move |
| find-replace | `platejs/find-replace` | none currently | move |
| footnote | `platejs/footnote` | `platejs/footnote/react` | move |
| layout/columns | `platejs/layout` | `platejs/layout/react` | move |
| media, including image | `platejs/media` | `platejs/media/react` | move |
| mention | `platejs/mention` | `platejs/mention/react` | move |
| slash-command | `platejs/slash-command` | `platejs/slash-command/react` | move |
| suggestion | `platejs/suggestion` | `platejs/suggestion/react` | move |
| table | `platejs/table` | `platejs/table/react` | move |
| tag | `platejs/tag` | `platejs/tag/react` | move |
| toc | `platejs/toc` | `platejs/toc/react` | move |
| toggle | `platejs/toggle` | `platejs/toggle/react` | move |
| cursor UI | none | `platejs/cursor/react` | move from React root |
| resizable UI | none | `platejs/resizable/react` | move from React root |

Existing advanced entrypoints retain their current canonical owners:

- `platejs/ai[/react]`, `code-drawing[/react]`, `csv`, `diff`, `dnd/react`,
  `docx`, `dom`, `emoji[/react]`, `excalidraw[/react]`, `floating/react`,
  `history`, `hyperscript`, `juice`, `legacy-list-model[/react]`, `markdown`,
  `math[/react]`, `migrations`, `page-layout[/react]`, `static`,
  `tabbable[/react]`, and `yjs[/react]`.
- `platejs/math/katex.css` and `platejs/package.json` remain non-JavaScript
  exports.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Package root | Core plus all 21 standard families | Core plus six standard families | `packages/platejs/src/root.tsx` | Root is the normal Plate facade, not a core-only tollbooth | Remove moved exports and rewrite consumers | Root export audit, public symbol ownership check, packed root consumer | Accidental duplicate or missing export | rearchitect |
| `/basic` | Absent | Remains absent | app/registry EditorKit | "Basic" is preset policy, not an honest capability owner | No adopter | Negative export/docs audit | Future reintroduction as convenience alias | cut |
| Root standard families | Six selected families currently mixed with all others | basic-nodes, basic-styles, code-block, indent, link, list only | `platejs` and `platejs/react` | Broadly universal single-flow rich-text primitives with required dependency closure | Existing imports remain | package tests, headless and React runtime proof, root size/DCE gate | Root/client leak or hidden optional peer | keep |
| Independent feature families | Fifteen families reexported from root | One public `<feature>` owner each | feature entrypoint | Independent schema/workflow/runtime jobs deserve discoverable isolation | AST-aware import rewrite across apps, packages, docs, examples | export parity, no-root-duplicate audit, focused feature tests | Large caller migration | move |
| Table | Reexported from root/React root | `platejs/table[/react]` only | table | Two-dimensional selection, navigation, clipboard, sizing, and cell structure are one independent subsystem | Rewrite table imports and preserve EditorKit membership | table package tests, packed headless/client proof, table demo Browser smoke | Users confuse kit membership with API ownership | move |
| Media/image | Reexported from root/React root | `platejs/media[/react]` only | media | Image belongs with the asset/embed/placeholder subsystem; splitting image creates two owners | Rewrite image/media imports together | media tests, packed proof, image/media Browser smoke | Root duplicate or media/image split | move |
| List/indent | Reexported from root/React root | Stay in root; list keeps its declared dependency on indent | root standard families | Both are linear text-flow capabilities; indent also serves non-list blocks | No public import migration | DAG edge, focused list/indent tests | Treating dependency as package ownership | keep |
| React feature APIs | All standard React adapters reexported from `platejs/react` | Root React mirrors only root-owned families; feature adapters use `<feature>/react`; cursor/resizable become React-only feature paths | React core plus feature adapters | Runtime and semantic ownership stay discoverable | Rewrite imports; no aliases | client browser proof for every client entrypoint; root-to-React negative lint | declaration or client code leaks into headless owners | move |
| Default editor composition | Registry/app kits | Remains registry/app kits | copied registry/application | Package roots export descriptors, not product membership arrays | Update imports only; preserve array order/membership | registry source audit and representative demos | Accidental kit behavior change | keep |
| Optional peers | Package-wide optional metadata with DAG ownership | Each subpath may reach only its declared optional peers; root reaches none | canonical DAG plus packed checker | Peer metadata does not isolate runtime reachability by itself | Update entrypoint peer metadata and isolated fixtures | exact optional-peer closure for every public export | Unused consumers must install unrelated peers | gate |
| Entrypoint DAG and Oxlint | Current feature directories are private `standard/*` owners and root/React aggregates allow all | Root-private entries for six standard families; public entries for moved families; exact cross-feature and React edges | `tooling/entrypoints/entrypoint-dag.mjs` and Oxlint plugin | One machine-readable graph must own source boundaries and optional peers | Generate rule/task fixtures from target manifest | DAG unit tests and package lint | Cross-import cycle or undeclared dependency | rearchitect |
| Turbo | Standard headless families share `core`; all standard React adapters share `react` | One internal task partition per feature/adapter plus small root/react facade partitions; aggregate package tasks remain handoff gates | generated package Turbo config | Public colocation must not destroy package-era cache granularity | Regenerate scripts/config; omit empty work | generator unit/slow tests, affected-file fan-out fixtures, two-run cache receipts | Over-invalidating all Plate or missing downstream invalidation | rearchitect |
| Runtime proof | Canonical `headless/ssr/client` metadata and four proof lanes exist, but generic client/headless smoke is shallow | Every public entrypoint gets a real proof receipt: Node import, headless initialization without DOM/React, SSR render without DOM, or browser execution | entrypoint runtime generator, packed checker, apps/plite proof | Classification must describe executable behavior, not barrel syntax | Add proof metadata/factories for new subpaths and strengthen weak generic rows | isolated packed Node consumers, SSR consumer, generated browser test | Import-only tests falsely bless runtime failures | rearchitect |
| Bundle size/tree shaking | Bare and unused named DCE collapse to baseline | Preserve zero-growth DCE and add committed minified consumer-size snapshots for root and every new entrypoint; budget changes require an explicit diff | packed release checker | Tree shaking and entrypoint cost need executable evidence | Generate sorted size baseline after final cut | DCE equality plus size snapshot checker | Toolchain noise or hidden cross-entrypoint reachability | gate |
| Docs/examples/skills | Root imports teach moved features and rules describe broad standard roots | Canonical imports only; latest-state docs; durable root-vs-feature rule in Vision and affected source skills | docs, registry, `docs/vision/plate.md`, `.agents/rules/**` | Public ownership is unfinished while teaching surfaces disagree | Sweep source docs/callers, run registry generation when applicable, run `best-api repair`, regenerate skills | zero stale imports/docs claims, docs checks, www typecheck, Browser proof | Generated output or worker skill stays stale | move |
| `legacy-list-model` | Explicit maintenance-only subpaths | Unchanged in this execution | `platejs[/react]` | Removal needs separate explicit authority and persisted/adopter proof | None | unchanged export audit | Scope creep | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Freeze the executable contract | DAG/tooling | Encode the canonical owner manifest, runtime classes, dependencies, peer requirements, and singleton task partitions; add failing/target contract fixtures first | Accepted plan and current source reread | DAG tests express every target path, forbid duplicates, and model exact dependent fan-out | `node --test tooling/scripts/entrypoint-dag-plugin.test.mjs tooling/scripts/entrypoint-turbo.test.mjs tooling/scripts/entrypoint-turbo.slow.test.mjs` |
| 2. Hard-cut package exports | `packages/platejs` | Add 30 public JavaScript subpaths, curate root and React barrels, update tsdown/declaration inputs, run barrels, and remove all duplicate root exports | Slice 1 graph is authoritative | Every moved symbol exists only at its target; root families remain intact | `pnpm brl`; focused platejs typecheck/test; export-ownership audit |
| 3. Migrate every adopter | apps/packages/content/registry | Rewrite public imports by canonical owner without changing kit membership/order or editor behavior; repair internal Plate entrypoint imports through declared edges | New subpaths compile | Zero stale moved-symbol imports from `platejs` or `platejs/react`; no Plate consumer imports `plitejs` | AST/source audit, affected package/app typechecks, docs checks |
| 4. Restore package-era iteration speed | Turbo/Oxlint | Generate per-feature lint/typecheck/test partitions, exact inputs, upstream dependencies and dependent expansion; enforce the DAG and peer edges in Oxlint; do not create shared-dist parallel writers | Source ownership is final | One feature edit invalidates its owner and true dependents only; unrelated feature tasks cache; aggregate build stays atomic | Turbo generator tests, dry-run task graph receipts, `pnpm entrypoint:turbo:check`, package lint |
| 5. Close runtime, peer and size claims | runtime/packed proof owners | Give every new public entrypoint a real runtime receipt; preserve four proof lanes; isolate optional peers; retain DCE and add entrypoint size snapshots | Package builds cleanly | All public runtime entrypoints are imported in Node; all headless entries initialize without DOM/React; SSR renders without DOM; all client entries execute in a browser; peer and size gates pass | `pnpm plite:release:packages`; focused apps/plite browser proof; contract tests |
| 6. Repair teaching and release artifacts | docs/registry/skills/changesets | Update current-state imports and ownership docs; specifically audit `plate-feature`, `plate-plugin-creator`, `plate-ui`, `docs-creator`, `plate-next`, `plate-plan`, and `best-api` source rules; update the smallest Vision owner; regenerate mirrors; add the breaking Plate changeset | Runtime/package target is stable | No stale teaching, source/mirror parity, registry output current where applicable, one truthful changeset | `pnpm install`; source audits; docs checks; `pnpm --filter www typecheck`; registry generation on `next` when source changes |
| 7. Full closure | repository | Run scoped lint fixes, strict checks, representative Browser routes, review, and final plan evidence | Slices 1-6 green | No accepted P1 finding, no stale import/export, no failing gate, and final current-source evidence recorded | scoped `lint:fix`; `pnpm check:plite`; `pnpm check`; Browser proof; P1 autoreview unless branch law forbids it |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Canonical ownership covers the bounded current surface | `root.tsx` lists 21 families; React root lists those adapters plus cursor/resizable; manifest above assigns all rows | Generated export ownership test proves each moved symbol present once and absent from root | passed |
| Root stays useful without `/basic` | Root target retains core plus six standard families; app kits keep composition | Compile the three documented ideal import paths and audit package exports for no `./basic` | passed |
| Root and headless subpaths are Node-safe | Runtime DAG and packed checker already model `headless` and isolated optional peers | Node-import all JS exports; initialize each headless proof with no `window`, `document`, React, or undeclared optional peer | passed |
| SSR remains DOM-free | `platejs/static` already owns `plate-static-html` proof | Render packed static entrypoint in Node and verify the server-side example plus `plate-to-html.tsx` path does not import client React entrypoints | passed |
| Client paths work in a real browser | Generated apps/plite client proof already imports canonical client rows | Each row returns a feature-specific browser receipt; Playwright asserts full target set and representative table/media/list demos | passed |
| Optional peers stay isolated | Package manifest marks advanced peers optional; DAG records per-entrypoint peers | Isolated packed consumer installs only each entrypoint's exact peer closure and forbids every unrelated peer | passed |
| Tree shaking prevents root bundle explosion | Packed checker already compares unused bare/named imports with baseline | Existing DCE equality remains green; sorted minified consumer-size snapshot covers root and every new entrypoint | passed |
| Turbo scales at least as well as package-era tasks | Current generator maps source files to entrypoints and task partitions | Fixtures prove owner-only invalidation, upstream dependency invalidation, dependent expansion, config fan-out, cache hit on unchanged rerun, and no parallel shared-dist build | passed |
| Oxlint enforces the entrypoint graph | Current custom rule checks import/export/type/dynamic-import edges and peers | Fixtures cover root-to-feature, root-to-React, feature-to-undeclared-feature, undeclared peer, cycle, and legal declared dependencies | passed |
| No stale consumers or teaching | Current corpus has hundreds of root/React imports and moved-feature references | AST/source audit reports zero moved symbols imported from root; docs/registry/typecheck and generated skill parity pass | passed |

Conditional evidence:
- High-risk scenarios:
  1. A moved feature remains reexported through root declarations or a shared
     chunk. The symbol-ownership audit and packed declaration graph must fail.
  2. A supposedly headless entrypoint imports React, touches DOM globals during
     initialization, or requires an unrelated optional peer. Isolated runtime
     consumers must fail without those packages/globals.
  3. An import rewrite changes EditorKit membership/order or splits image from
     media. Registry source diff and representative browser demos must prove
     unchanged composition and behavior.
  4. The one-package Turbo graph invalidates every feature or misses a real
     dependent. Generator fixtures and two-run cache receipts must prove both
     positive and negative invalidation.
  5. Root or a subpath silently grows because of cross-entrypoint reachability.
     DCE equality and committed minified consumer-size snapshots must expose
     the increase.
- External research: narrow ProseKit evidence was considered during Best API
  review. Its `defineBasicExtension()` includes image and table, confirming
  that `basic` is preset membership rather than a durable API owner. No broader
  editor audit is needed because the target is resolved.
- Issue/PR provenance: N/A; this is a user-directed local architecture plan,
  not issue- or PR-backed work.
- Docs/registry/browser/release/behavior-law owners: docs, registry imports,
  package release artifacts, runtime proofs, changeset, and Browser proof all
  apply. No feature behavior-law rewrite applies because behavior and persisted
  identity are constrained unchanged.

Findings:
- `packages/platejs/src/root.tsx` reexports core plus the six accepted standard
  feature families. The fifteen independent families are absent from root.
- `packages/platejs/src/react/index.tsx` mirrors only the six root-owned React
  feature adapters. Thirteen feature adapters plus cursor and resizable use
  their canonical feature paths.
- `packages/platejs/package.json` publishes 64 exports: root, 61 JavaScript
  subpaths, the Math CSS export, and `package.json`. Advanced peers remain
  optional.
- Internal DAG edges include footnote/mention/slash-command to
  combobox, list to indent, suggestion to `plitejs/diff`, and code-block/media/
  table runtime contributions to `plitejs/dom`. Those edges remain explicit;
  public location does not erase dependencies.
- Generated Turbo partitions give every feature and adapter its own task inputs
  while aggregate build remains atomic.
- Oxlint reads the canonical DAG for import, export, import-type, dynamic-import,
  optional-peer, React, Plite, and cycle boundaries.
- Packed proof covers NodeNext/Bundler declarations, Node imports, headless
  initialization, SSR, browser execution, optional-peer closure, DCE, and 31
  committed entrypoint size snapshots.

Decisions and tradeoffs:
- Keep plugins in root -> `platejs` is the app-facing framework facade and the
  six retained families are standard primitives -> risk is root growth, gated
  by semantic ownership, DCE, peers, and size proof.
- Reject `/basic` -> it adds a subjective preset namespace and another import
  concept -> app/registry EditorKit remains the complete default-editor owner.
- Keep list and indent root -> they are one-dimensional text-flow capabilities;
  list's dependency on indent does not make either a separate subsystem.
- Keep table and media explicit -> they own independent interaction and data
  systems even when the default EditorKit includes them.
- Use one canonical path per symbol -> hard-cut imports instead of aliases ->
  migration is larger but the final API stays unambiguous.
- Preserve atomic package build -> parallel entrypoint builds writing shared
  `dist` are race-prone -> source-first lint/typecheck/test get fine-grained
  caches while release assembly remains one package build.
- Keep package-wide optional peer declarations -> npm cannot scope peer
  metadata by export -> executable DAG and isolated packed consumers enforce
  actual per-entrypoint reachability.

Review fixes:
- Corrected the initial temptation to create `platejs/basic`: the final target
  keeps the useful root and places complete composition in registry/app kits.
- Tightened the earlier root-family list by keeping list/indent root and moving
  find-replace to its independent tool entrypoint.
- Added explicit `legacy-list-model` non-removal because maintenance-only status is
  not deletion authority.
- Added real execution receipts and size snapshots; import-only and DCE-only
  proof would be too weak for the expanded subpath surface.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| One exploratory runtime-proof search included generated public registry JSON and produced truncated output | 1 | Exclude `apps/www/public/r/**` and count matches before printing consumers | Later plan evidence uses named source owners and bounded counts only. |

Verification evidence:
- `pnpm brl`, `pnpm --filter platejs lint`, `pnpm --filter platejs test`, and
  forced Plate typecheck passed: 72 lint partitions, 122 test partitions, and
  80 typecheck tasks.
- `pnpm entrypoint:turbo:check` passed generated task/source-path parity and the
  AST consumer/root ownership audit. The contract suites passed 56 tests.
- `pnpm plite:release:packages` passed four packed packages, 81 public subpaths,
  NodeNext/Bundler declarations, DCE, 76 runtime imports, 40 React-free
  headless executions, one DOM-free SSR execution, 37 exact optional-peer
  closures, and 31 exact Plate consumer size snapshots.
- `pnpm check:plite` passed 90 typecheck tasks, 140 package test tasks, 219
  tooling contracts, 25 benchmark tests, production app build, and 711
  Chromium tests with eight intentional skips.
- `pnpm --filter www typecheck`, `pnpm --filter www check:docs`,
  `pnpm test:manifests`, and `pnpm --filter www build:registry` passed. Registry
  generation materialized 378 canonical payloads and 15 sparse overlays.
- `pnpm install` regenerated the affected source skill mirrors after the Vision
  and source-rule repair. The breaking `platejs` changeset is
  `.changeset/consolidate-platejs-package.md`.
- Browser rendered `/docs/examples/server-side` and
  `/docs/examples/plate-to-html` with the expected content and zero console
  errors. The generated apps/plite runtime route passed in the strict Chromium
  lane.
- `pnpm check` passed formatting, type-aware lint, four package builds, all 93
  package typecheck tasks, 639 shared fast tests, every isolated fast suite,
  190 shared slow tests, and every isolated slow suite.
- P1 Autoreview did not apply because the current branch is `next`, where repo
  law forbids it.
- `check-complete.mjs` passed against this final ledger on 2026-08-29.

Final handoff prepared:
- Ownership and target API: root keeps core plus basic-nodes, basic-styles,
  code-block, indent, link, and list; fifteen families and two React-only
  families get the canonical subpaths listed above; no `/basic` or duplicates.
- Public breaks and adoption: all moved root/React imports are hard-cut across
  packages, apps, docs, examples, and registry source. Kit membership and
  behavior remain unchanged.
- Runtime and tooling: exact peer closure, per-entrypoint Turbo/Oxlint
  ownership, four runtime proof lanes, DCE, and size snapshots are executable
  gates.
- Teaching and release: current docs, Vision, source skills, generated mirrors,
  registry output, release tooling, and the major Plate changeset use the final
  owners.
- State: the entire current checkout is verified locally. Nothing was committed,
  pushed, published, or released by this execution.

Timeline:
- 2026-08-28T23:12:11.233Z Plate Plan created.
- 2026-08-29 current source, public exports, optional peers, DAG, Turbo,
  Oxlint, runtime proofs, packed checker, docs/registry adoption scope, and
  ProseKit basic precedent reviewed.
- 2026-08-29 final target, risks, execution slices, proof matrix, and handoff
  resolved.
- 2026-08-29 all seven execution slices, generated outputs, packed/runtime
  proof, strict Plite proof, full repository check, and Browser proof completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Completed local implementation and final handoff |
| Where am I going? | No remaining execution step; publication is outside this task |
| What is the goal? | Hard-cut one truthful canonical owner for every Plate root and feature API without losing runtime isolation or task granularity |
| What have I learned? | `/basic` is preset policy; root may own standard descriptors; table/media are independent; entrypoint tasks preserve package-era iteration granularity |
| What have I done? | Implemented the full hard cut, migrated consumers, generated enforcement, repaired stale mocks/release fixtures, and passed every required proof |

Open risks:
- No blocking implementation risk remains. Future toolchain changes may alter
  the committed entrypoint-size snapshots; the checker requires an explicit
  reviewed baseline update instead of accepting silent growth.
