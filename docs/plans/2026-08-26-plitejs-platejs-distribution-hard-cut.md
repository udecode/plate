# PliteJS and PlateJS distribution hard cut

Objective:
Replace the current Plate and Plite package graph with two default
distributions: `plitejs` for the raw editor substrate and `platejs` for the
product framework. The cut is complete only when package ownership, public
editor vocabulary, facade parity, dependency policy, versioning, monorepo
adoption, release artifacts, bundle isolation, and beta publication proof all
agree.

Flow mode:
agent-led plan hardening

Goal plan:
`docs/plans/2026-08-26-plitejs-platejs-distribution-hard-cut.md`

Primary template:
`docs/plans/templates/plite-plan.md`

Applied packs:

- `package-api`

Mode:

- `deep`: the accepted target crosses package identity, export topology,
  React and non-React entrypoints, public types, ecosystem imports, versioning,
  release artifacts, and bundler behavior. It does not change editor behavior
  or make a performance-improvement claim.

Completion threshold:

- Planning is binary-ready when every current package has one disposition,
  every replaced public editor-instance API has one target, every execution
  phase has entry and exit gates, release scenarios are resolved, proof is
  measurable, and the Autogoal completeness checker passes.
- Implementation is complete only after the final source audit, package and
  browser gates, packed-consumer matrix, beta publication, clean-room install,
  and npm metadata read-back pass on the same release commits.

Verification surface:

- Planning evidence: current `next` package manifests and entrypoints,
  constructor and hook owners, package dependency graph, docs and registry
  imports, Changesets configuration, release scripts, and current Vision.
- Implementation proof: source-first package typechecks, public type contracts,
  explicit export and facade-parity checks, packed NodeNext and Bundler
  consumers, esbuild reachability and gzip comparisons, Plite browser proof,
  representative Plate registry demos, root `pnpm check`, beta installation,
  and exact npm metadata read-back.

Constraints:

- This artifact is planning only. Product edits start after the user accepts
  this exact plan and invokes its execution owner.
- `plitejs` and `platejs` are the only default editor distributions.
- Plate application and Plate extension authors install and import `platejs`,
  never `plitejs`.
- `platejs` owns `plitejs` as a normal runtime dependency and exposes the
  approved Plite surface through corresponding Plate entrypoints.
- `@platejs/*` is reserved for a separate subsystem, toolchain, or explicit
  maintenance lane. Being an optional editor feature is not enough.
- Package and entrypoint identify the editor layer. Public editor-instance APIs
  use one unqualified vocabulary.
- React and non-React entrypoints may provide different implementations under
  the same public name.
- There are no public compatibility aliases, proxy packages, forwarding
  entrypoints, mode flags, or runtime shims.
- Plate preserves Plite document, transaction, selection, DOM, history, and
  publication laws. This cut does not redesign editor behavior.
- Package exports are explicit. Public `internal` entrypoints are removed;
  anything Plate genuinely needs becomes a named public Plite contract or stays
  private inside `plitejs`.
- Package subpaths and import direction own bundle isolation. Peer dependencies
  are not used as a fake tree-shaking mechanism.

Boundaries:

- In scope: package consolidation and naming; source topology; exports; editor
  constructor, type, React lifetime, and context vocabulary; dependency and
  peer ownership; retained advanced packages; all monorepo consumers; current
  docs, examples, registry sources, tests, benchmarks, configuration, release
  scripts, changesets, and beta proof.
- Direct owners: `packages/plite*`, `packages/core`, `packages/plate`, all
  absorbed feature packages, retained `@platejs/*` packages, `apps/plite`,
  `apps/www`, package and release tooling, root and detail Vision, and affected
  agent doctrine.
- Non-goals: new editor semantics, a StarterKit or EditorKit export, feature
  redesign, performance tuning, third-party compatibility code, automatic
  source codemods, stable-channel promotion, and deletion of the separately
  maintained classic-list implementation.
- Historical changelogs may retain old names. Executable source, current docs,
  current examples, generated registry source, and published declarations may
  not.
- Accepting the implementation plan authorizes repository changes. npm publish,
  dist-tag changes, and npm deprecation require an explicit release instruction
  at the rollout phase.

Output budget strategy:

- Use owner-first source reads and counted audits. Store large export and import
  classifications as machine-readable execution artifacts only when the
  package manifests and parity tests cannot remain the canonical owners.

Blocked condition:

- Stop only if live source proves that one proposed survivor serves no
  independent job, one retained API has two incompatible current jobs, the
  release lane cannot publish the required dependency order, or explicit npm
  release authority is absent at rollout. A failing implementation gate routes
  back to its owning phase; it does not weaken the target.

Plite Plan state:

- status: planning-complete
- phase: handoff
- next: user acceptance, then Phase 0 through Phase 8
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Constraints preserve the accepted two-distribution model, Plate-only application dependency, full curated facade, one editor vocabulary, and hard cut. |
| Active goal and plan verified | yes | The active goal points to this exact plan and measures planning completeness. |
| Current owners read | yes | `VISION.md`, both layer Vision files, current package manifests and entrypoints, constructor and context owners, Changesets config, and packed-release checker were inspected from `next`. |
| Best API target resolved | yes | Accepted target: package-selected `createEditor` and `Editor`; React-selected `useEditor`; explicit context hooks; no branded aliases. |
| Mode and execution boundary resolved | yes | Deep planning is complete; repository implementation waits for plan acceptance and npm mutation waits for release authority. |
| Package/API pack selected | yes | Package identity, exports, API, types, dependencies, and publication all change. |
| Public surface or package boundary identified | yes | The entrypoint and package-disposition tables classify every current editor package. |
| Release artifact path selected | yes | Published deltas use one `.changeset` file per affected surviving package; absorbed packages receive no fake release. Registry-only changelog does not apply. |
| `changeset` skill loaded when `.changeset` is required | yes | The plan follows its one-package-per-file, version-bump, current-state prose, and main-relative classification rules. |
| Barrel/export impact decision recorded | yes | Execution runs `pnpm brl`, preserves curated entrypoints, and exhaustively checks every explicit package export. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, package, release, and proof claims cite live source.
- [x] Reusable public call shape has one accepted `best-api` verdict.
- [x] Every concept-level decision has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and private implementation boundaries have adoption and deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix selects package changesets.
- [x] Package/API pack: `.changeset` work follows the loaded `changeset` rules.
- [x] Package/API pack: registry-only changelog is excluded because this is a published package cut.
- [x] Package/API pack: no-artifact handling is limited to absorbed packages that will not publish another version.
- [x] Package/API pack: the public break is an explicit hard cut.
- [x] Package/API pack: package-owned typecheck, build, test, pack, and consumer proof is specified.
- [x] Package/API pack: generated barrels and release notes have named owners and commands.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve package, API, adoption, release, and proof decisions | The target tables and nine execution phases contain no product-choice gap. |
| Fresh source evidence | yes | Recheck decision-changing current owners | Package manifests, barrels, constructor hooks, Changesets config, and artifact checker were read on 2026-08-26. |
| Best API review | yes | Carry the accepted call shape into `best-api repair` during execution | The public API cut table names every editor-instance replacement and retained distinct job. |
| Conditional risk and adoption | yes | Assign all triggered docs, browser, release, and package work | Conditional evidence and proof matrix name each owner and gate. |
| Verification recorded | yes | Record planning proof and exact execution commands | Verification evidence and proof matrix provide both. |
| Handoff prepared | yes | State ownership, breaks, order, proof, and user authority | Final handoff prepared section is complete. |
| P1 autoreview | no | Planning-only review | Repository policy excludes `autoreview` for this planning artifact; implementation uses its applicable current-branch review rule. |
| Goal plan complete | yes | Run the Autogoal completeness checker | The checker command is the final planning gate. |
| Public API / package boundary proof | yes | Audit all current packages, target exports, and facade exceptions | Package disposition, entrypoint, and API cut tables are exhaustive at package level. |
| Release artifact classification | yes | Classify every surviving and absorbed package | Surviving published packages receive changesets; absorbed packages stop publishing; release authority is separate. |
| Published package changeset | yes | Add one file per affected surviving package during Phase 6 | `plitejs` and `platejs` receive breaking entries; retained packages use the bump dictated by their public install/export delta from `main`. |
| Registry changelog | no | Package/API cut, not registry-only behavior | Registry source import rewrites do not claim a registry feature change. |
| No release artifact | yes, absorbed packages | Do not invent changesets for packages deleted before publication | npm deprecation, where applicable, is a separate Phase 8 rollout action after a live publication census. |
| Package typecheck/build/test | yes | Run source-first checks, release packs, and behavior proof | Exact commands and consumers are listed in the proof matrix. |
| Barrel/export generation | yes | Run `pnpm brl` after moves and export edits | Phase 5 pairs generation with explicit export and declaration audits. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Current doctrine, packages, public creators, consumers, and release tooling inspected | Decide |
| Decide | complete | Package disposition, API cut, dependency policy, version policy, and rollout order fixed | Prove and hand off |
| Prove and hand off | complete | Plan mechanically checked and execution gates prepared | User review |

Decision brief:

- Outcome: two default installs, two source owners, one editor-instance
  vocabulary, and a small honest advanced-package set.
- Chosen shape: `plitejs` owns raw core plus explicit substrate subpaths;
  `platejs` normally depends on it, mirrors approved substrate subpaths, and
  owns ordinary Plate feature subpaths.
- Strongest rejected alternative: preserve dozens of scoped packages behind a
  meta-package. That reduces install commands but keeps package ownership,
  version noise, declaration edges, and internal imports fragmented.
- Second rejected alternative: put every advanced integration into `platejs`
  and hide its vendors as optional peers. That turns one package into a list of
  manual vendor installs and makes independent subsystems harder to test and
  release.
- Consequence: this is a broad source break. Plate 53 remains the compatibility
  lane; the new topology proves itself on beta without aliases.

Current source evidence:

- `VISION.md:38-45` assigns raw editor law to Plite and product/editor framework
  law to Plate. `VISION.md:89-97` rejects legacy APIs kept only for familiarity.
- `packages/plate/src/index.tsx:1-13` is already a facade, but it publicly leaks
  `@platejs/core`, `@platejs/plite`, `@platejs/utils`, `createBaseEditor`, and a
  blind `@udecode/utils` barrel.
- `packages/plate/package.json:33-67` exposes four entrypoints while requiring
  Core, Plite, Utils, React, and React DOM at package level.
- `packages/plite/package.json:43-54` and
  `packages/plite-react/package.json:44-55` expose public `internal` paths.
- `packages/plite-react/src/hooks/use-plite-editor.ts:14-52` and
  `packages/core/src/react/editor/usePlateEditor.ts:54-74` implement the same
  component-owned editor job under branded names.
- `packages/plite-react/src/hooks/use-editor.tsx:9-27` and
  `packages/core/src/react/stores/plate/createPlateStore.ts:181-213` use
  `useEditor` for mounted-context retrieval, colliding with the ideal creation
  hook name.
- `.changeset/config.json:5-16` globally links `platejs`, every `@platejs/*`,
  and unrelated `@udecode/*` packages.
- `.changeset/pre.json` is already in `beta` mode with v53 initial versions for
  the v54 Plate line. It has no `plitejs` entry, so the new 1.0 beta needs an
  explicit pre-state migration rather than a blind package rename.
- `tooling/scripts/check-plite-release-artifacts.mjs:46-127` already owns
  packed exports, dependency direction, declaration consumers, isolated
  installs, and dead-code elimination, but hardcodes the old package graph.
- Ninety-nine production source files currently import
  `@platejs/plite/internal` or `@platejs/plite-react/internal`. Forty-three are
  in Core and nine are in Yjs; the rest span Plite adapters and feature
  packages. Package consolidation cannot turn that accidental boundary into a
  renamed public `internal` path.
- Current built root declarations collide on `DefinitionOf`. Current React
  runtime exports show Plate replacements for `useEditor`, editor selector/state
  hooks, and element hooks while other shared hooks are identity reexports.
  Facade parity therefore needs an explicit alternative set, not only an export
  count.

## Target package topology

### `plitejs` entrypoints

| Public specifier            | Owner                                                                                          | Dependency rule                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `plitejs`                   | raw model, schema, extensions, transactions, state, selection, value utilities, `createEditor` | Node-safe; no DOM or React runtime import                                         |
| `plitejs/dom`               | DOM bridge, browser utilities, and `DOMEditor`                                                 | May use DOM implementation dependencies; no React                                 |
| `plitejs/history`           | canonical history extension and APIs                                                           | Depends only on root contracts                                                    |
| `plitejs/hyperscript`       | JSX/hyperscript document construction                                                          | Depends only on root contracts                                                    |
| `plitejs/page-layout`       | framework-neutral page measurement and pagination primitives                                   | No React runtime import                                                           |
| `plitejs/page-layout/react` | React page-layout adapters                                                                     | Superset of `plitejs/page-layout`; React peers apply only when this path is used  |
| `plitejs/react`             | React view, providers, hooks, editable, React editor construction                              | Superset of `plitejs` plus approved DOM contracts; no implicit history install    |
| `plitejs/diff`              | generic document diff                                                                          | Remains substrate-level because it consumes Plite documents without Plate plugins |
| `plitejs/testing`           | hyperscript and data-transfer test helpers                                                     | Development-only subpath; no separate published package                           |
| `plitejs/package.json`      | package metadata                                                                               | Explicit export                                                                   |

`plitejs/internal` does not exist. Cross-entrypoint code uses private relative
modules inside the package. A type or value needed by an external package must
pass public API review before becoming a named supported export.

### `platejs` entrypoints

| Public specifier                                                                                                                               | Owner                                                                                              | Facade rule                                                                              |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `platejs`                                                                                                                                      | non-React Plate plugin runtime, HTML/static-independent product APIs, `createEditor`, and `Editor` | Reexports approved `plitejs` root values by identity, except explicit Plate replacements |
| `platejs/react`                                                                                                                                | Plate React editor, stores, components, lifecycle hooks, and React plugin runtime                  | Superset of `platejs` and approved `plitejs/react`, except explicit Plate replacements   |
| `platejs/static`                                                                                                                               | static rendering and `createStaticEditor`                                                          | Distinct rendering job; no branded editor variant                                        |
| `platejs/migrations`                                                                                                                           | serialized-data migration utilities                                                                | Retained because persisted data is a hard boundary, not a compatibility alias            |
| `platejs/dom`, `platejs/history`, `platejs/hyperscript`, `platejs/page-layout`, `platejs/page-layout/react`, `platejs/diff`, `platejs/testing` | Plate-facing mirrors of matching Plite subpaths                                                    | Runtime values and public types must be identity-equal to the `plitejs` owner            |
| `platejs/<feature>`                                                                                                                            | one ordinary headless Plate feature                                                                | Explicit export; no wildcard package exports                                             |
| `platejs/<feature>/react`                                                                                                                      | that feature's React adapter when one exists                                                       | Superset of its headless path; importing the headless path must not load React           |
| `platejs/math/katex.css`                                                                                                                       | math CSS                                                                                           | Sole intentional feature side effect and declared precisely in `sideEffects`             |
| `platejs/package.json`                                                                                                                         | package metadata                                                                                   | Explicit export                                                                          |

The `platejs` root does not export every feature barrel. Feature discoverability
comes from explicit package subpaths and docs. This prevents unbundled Node and
SSR imports from evaluating unrelated feature modules.

### Package disposition

| Current package or group                                                                                                                                                                                                                                                                                                           | Target                                                                       | Verdict and reason                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@platejs/plite`                                                                                                                                                                                                                                                                                                                   | `plitejs`                                                                    | Rename and become the sole raw source package. The scoped package was not the intended public identity.                                          |
| `@platejs/plite-dom`                                                                                                                                                                                                                                                                                                               | `plitejs/dom`                                                                | Merge; DOM is a substrate layer, not an independently versioned product.                                                                         |
| `@platejs/plite-history`                                                                                                                                                                                                                                                                                                           | `plitejs/history`                                                            | Merge; history must move with the editor change contract.                                                                                        |
| `@platejs/plite-hyperscript`                                                                                                                                                                                                                                                                                                       | `plitejs/hyperscript`                                                        | Merge; it has no independent runtime or version job.                                                                                             |
| `@platejs/plite-react`                                                                                                                                                                                                                                                                                                             | `plitejs/react`                                                              | Merge; React is an entrypoint-selected adapter.                                                                                                  |
| `@platejs/plite-layout`                                                                                                                                                                                                                                                                                                            | `plitejs/page-layout` and `plitejs/page-layout/react`                        | Merge while preserving headless/React isolation; the source owns page measurement rather than generic layout.                                    |
| `@platejs/diff`                                                                                                                                                                                                                                                                                                                    | `plitejs/diff`, mirrored as `platejs/diff`                                   | Move down; source ownership is generic Plite-document comparison.                                                                                |
| `@platejs/test-utils`                                                                                                                                                                                                                                                                                                              | `plitejs/testing`, mirrored as `platejs/testing`                             | Merge; current exports are Plite hyperscript and data-transfer helpers.                                                                          |
| `@platejs/core`                                                                                                                                                                                                                                                                                                                    | `platejs` root, React, static, and private modules                           | Delete package; it is the Plate implementation, not an optional capability.                                                                      |
| `@platejs/utils`                                                                                                                                                                                                                                                                                                                   | curated `platejs` root/React exports and private utilities                   | Delete package; keep only Plate-owned public helpers, never blind future `@udecode/*` reexports.                                                 |
| `@platejs/basic-nodes`, `basic-styles`, `callout`, `code-block`, `combobox`, `comment`, `csv`, `cursor`, `date`, `dnd`, `emoji`, `find-replace`, `floating`, `footnote`, `indent`, `link`, `list`, `markdown`, `math`, `media`, `mention`, `resizable`, `slash-command`, `suggestion`, `tabbable`, `table`, `tag`, `toc`, `toggle` | Matching `platejs/<feature>` and optional `/<feature>/react` subpaths        | Merge. These are ordinary editor capabilities; optional usage is not an independent package job.                                                 |
| `@platejs/layout`                                                                                                                                                                                                                                                                                                                  | `platejs/columns` and `platejs/columns/react`                                | Merge and rename. Its source owns `BaseColumnPlugin` and `ColumnPlugin`; calling it generic layout would collide with Plite page layout.         |
| `@platejs/ai`                                                                                                                                                                                                                                                                                                                      | retain                                                                       | Separate AI subsystem with AI SDK peers, streaming/UI policy, and an independent release surface.                                                |
| `@platejs/browser`                                                                                                                                                                                                                                                                                                                 | retain                                                                       | Separate Playwright/browser proof toolchain; peers on `plitejs`.                                                                                 |
| `@platejs/cli`                                                                                                                                                                                                                                                                                                                     | retain                                                                       | Separate executable/toolchain with TypeScript and esbuild ownership.                                                                             |
| `@platejs/code-drawing`                                                                                                                                                                                                                                                                                                            | retain                                                                       | Separate multi-renderer subsystem with CodeMirror, Mermaid, PlantUML, Viz, and Flowchart engines.                                                |
| `@platejs/docx`, `docx-import`, `docx-export`, `docx-paste`                                                                                                                                                                                                                                                                        | one `@platejs/docx` package with `/import`, `/export`, and `/paste` subpaths | Retain one advanced DOCX subsystem; delete its three implementation packages.                                                                    |
| `@platejs/excalidraw`                                                                                                                                                                                                                                                                                                              | retain                                                                       | Separate third-party canvas integration and release risk.                                                                                        |
| `@platejs/juice`                                                                                                                                                                                                                                                                                                                   | retain                                                                       | Separate server/export integration with a large HTML/CSS processing dependency tree.                                                             |
| `@platejs/yjs`                                                                                                                                                                                                                                                                                                                     | retain                                                                       | Separate collaboration protocol shared by Plite and Plate; no collaboration code enters either default root.                                     |
| `@platejs/list-classic`                                                                                                                                                                                                                                                                                                            | retain as maintenance-only                                                   | Explicit exception. Do not merge legacy behavior into the default package and do not delete its behavior without its separate removal authority. |
| `@plate/scripts` and `@udecode/*`                                                                                                                                                                                                                                                                                                  | retain outside the distribution cut                                          | Internal tooling and generic libraries are not editor distributions. They leave the global Plate version group.                                  |

Final public editor packages are therefore `plitejs`, `platejs`, and nine scoped
survivors: AI, Browser, CLI, Code Drawing, DOCX, Excalidraw, Juice, Yjs, and the
maintenance-only Classic List package.

## Public editor-instance API cut

| Job                                     | `plitejs`               | `plitejs/react`              | `platejs`               | `platejs/react`                     |
| --------------------------------------- | ----------------------- | ---------------------------- | ----------------------- | ----------------------------------- |
| Construct an editor                     | `createEditor(options)` | `createEditor(options)`      | `createEditor(options)` | `createEditor(options)`             |
| Editor instance type                    | `Editor`                | `Editor`                     | `Editor`                | `Editor`                            |
| Constructor options                     | `CreateEditorOptions`   | `CreateEditorOptions`        | `CreateEditorOptions`   | `CreateEditorOptions`               |
| Own one editor for a component lifetime | not applicable          | `useEditor(options, deps?)`  | not applicable          | `useEditor(options, deps?)`         |
| Read required mounted context           | not applicable          | `useEditorContext()`         | not applicable          | `useEditorContext({ id? })`         |
| Read optional mounted context           | not applicable          | `useOptionalEditorContext()` | not applicable          | `useOptionalEditorContext({ id? })` |

Hard deletions from public exports:

- `createReactEditor`, `createBaseEditor`, and `createPlateEditor`
- `usePliteEditor`, `usePlateEditor`, `useActiveEditor`, and
  `usePlateViewEditor`
- public editor-instance aliases `BaseEditor`, `ReactEditor`, `PlateEditor`, and
  `PlateEditorReference`
- their branded option aliases
- the public `ReactEditor` value alias when it only forwards `DOMEditor`
- public `editor?: Editor` constructor injection/upgrader options

Retained distinct jobs:

- `createStaticEditor`, `StaticEditor`, and renamed `useStaticEditor` remain
  explicit because static rendering is not a Plate-versus-Plite brand variant.
- Raw `Plite` and product `Plate` providers remain in their owning packages
  because they own different runtime/store jobs. `platejs/react` exposes the
  complete Plate provider/content alternative and does not mirror the raw
  `Plite` provider merely to claim facade breadth.
- Internal apply functions may compose layers, but they are private and cannot
  accept an externally branded editor as a compatibility path.

Facade exception set:

- `createEditor`, `Editor`, `CreateEditorOptions`, `useEditor`,
  `useEditorContext`, `useOptionalEditorContext`, and their correlated option
  types are Plate replacements on the corresponding Plate entrypoint.
- Plate's `DefinitionOf` is a complete superset that extracts both reexported
  Plite extension definitions and Plate plugin definitions. It replaces the
  raw collision without losing the Plite job.
- Plate store/component alternatives replace `useEditorSelection`,
  `useEditorSelector`, `useEditorState`, `useElement`, and `useOptionalElement`
  on `platejs/react`. Shared Plite React hooks such as focus, composing, DOM
  scope, view state, and element selection remain identity reexports.
- `Plate`, `PlateContent`, and Plate node renderers are complete alternatives
  to the raw Plite provider/editable/renderers on `platejs/react`. Raw component
  names stay available from `plitejs/react`, not from the Plate facade.
- Plate-specific plugin, store, component, and migration APIs are additive.
- Every other approved Plite export is reexported by identity from the matching
  Plate subpath. The parity test fails on an unclassified missing export or a
  new name collision.

## Dependency policy

- `platejs` declares a normal dependency on `plitejs`. Plate applications and
  ordinary Plate packages do not declare `plitejs` themselves.
- Host runtimes and user-selected singleton integrations are peers: React,
  React DOM, Yjs, AI SDKs, React DnD, and equivalent vendor hosts.
- React and React DOM are optional peers at the package level so headless roots
  install and import without them. Documentation for `/react` requires them.
- Feature implementation details remain normal dependencies. Users should not
  install the Remark stack, Floating UI internals, parsers, or small utility
  libraries one by one merely to make the package manifest look smaller.
- Large integrations with their own public model remain scoped survivor
  packages and own their dependencies.
- Optional peers solve host ownership and package-manager warnings. They do not
  solve bundling. Explicit subpaths, side-effect metadata, and import topology
  solve bundling.
- `platejs` source may import private `plitejs` contracts only in its substrate
  adapter owner. Merged Plate features import private Plate modules, not the
  package's own public specifier.
- Retained Plate-only packages peer on `platejs` and use it for public types.
  Only `@platejs/browser` and the raw Yjs entrypoints may peer directly on
  `plitejs`.
- No default root imports React, Yjs, AI SDK, React DnD, CodeMirror, Mermaid,
  Excalidraw, DOCX, Juice, or feature-only CSS.

## Version and release policy

- `plitejs` starts an independent `1.0.0-beta.0` line from the owned npm
  placeholder. Stable `1.0.0` follows only after beta proof.
- `platejs` remains on its v54 beta line. It does not copy the Plite version.
- During beta, `platejs` pins the exact published `plitejs` prerelease. This
  prevents npm from resolving an unproved engine beta.
- After both packages are stable, `platejs` may use the compatible `^1.0.0`
  range. A Plite major requires an explicit Plate adoption release.
- A Plite public API or behavior change that reaches the Plate facade always
  triggers Plate facade-parity proof and a Plate changeset. This is release
  coupling, not version-number coupling.
- Scoped survivor packages version independently and declare explicit
  compatible peer ranges. Their versions do not imply the Plate or Plite
  version.
- Remove the global Changesets linked group. Do not place `plitejs`, `platejs`,
  scoped survivors, or generic `@udecode/*` packages in one replacement group.
- Changesets remain one package per file. `plitejs` and `platejs` receive
  breaking entries for the cut. A retained package receives the bump dictated
  by its own public install/export delta from `main`; the DOCX consolidation is
  breaking. Absorbed packages receive no synthetic release.
- Release order is strict: publish and verify `plitejs` beta, publish and verify
  `platejs` plus changed survivor betas, run clean-room installs, then deprecate
  only absorbed v54 cut-line prereleases that a live census proves were
  published.
- Beta uses the beta dist-tag. Stable promotion is a separate release-lanes
  decision and is outside this plan.
- Plate 53 and its existing package graph remain installable. No v54 shim makes
  old third-party imports appear compatible.

## Decision ledger

| Surface             | Current                                             | Target                                             | Owner                              | Adoption                                | Proof                                              | Main risk                    | Verdict                |
| ------------------- | --------------------------------------------------- | -------------------------------------------------- | ---------------------------------- | --------------------------------------- | -------------------------------------------------- | ---------------------------- | ---------------------- |
| Raw distribution    | Six scoped Plite runtime packages                   | One `plitejs` package with explicit subpaths       | Plite                              | Move source and every raw consumer      | Packed exports, types, Node import, browser matrix | Cross-subpath runtime import | merge                  |
| Plate foundation    | `platejs` facade over Core and Utils                | Core and Utils physically owned by `platejs`       | Plate                              | Move source, remove workspace packages  | Package build/types and no old dependency edges    | Internal cycles              | merge                  |
| Ordinary features   | About thirty scoped packages                        | `platejs/<feature>` subpaths                       | Plate feature owners               | Move in dependency order                | Per-cluster tests and export consumers             | Accidental root loading      | merge                  |
| Advanced features   | Mixed with ordinary packages                        | Nine explicit survivors                            | Named subsystem owners             | Rewrite to new public dependencies      | Isolated packed consumers                          | Duplicate Plite or React     | retain                 |
| DOCX                | Four packages                                       | One package with three subpaths                    | DOCX                               | Move import/export/paste source         | DOCX tests and pack                                | Heavy root import            | merge internally       |
| Classic list        | Separate legacy package                             | Separate maintenance-only package                  | Classic list                       | Dependency import update only           | Existing package tests                             | Legacy enters default        | retain outside default |
| Editor constructors | Four branded public factories                       | `createEditor` selected by entrypoint              | Plite and Plate constructor owners | Rewrite all callers and docs            | Runtime and type contracts                         | Wrong layer selected         | replace                |
| React lifecycle     | Two branded creator hooks                           | `useEditor` selected by entrypoint                 | Plite and Plate React owners       | Rewrite component-owned callers         | Hook lifetime tests                                | Context collision            | replace                |
| React context       | Two `useEditor` context hooks plus nullable variant | `useEditorContext` and `useOptionalEditorContext`  | React context owners               | Rewrite mounted consumers               | Provider/context tests                             | Creator/context confusion    | rename                 |
| Editor types        | Raw, Base, React, Plate variants                    | `Editor` selected by entrypoint                    | Public declaration owners          | Rewrite annotations and inference tests | NodeNext/Bundler declaration consumers             | Type widening                | replace                |
| Facade              | Blind star reexports and leaks                      | Corresponding subpaths plus explicit exception set | `platejs`                          | Curate entrypoints                      | Export parity and identity                         | Silent collision             | replace                |
| Internal exports    | Public `/internal` paths                            | Private modules or promoted named contracts        | Owning package                     | Migrate all internal consumers          | No public internal export                          | Hidden ecosystem use         | delete                 |
| Dependency model    | Runtime packages and all-version linked group       | Normal Plate-to-Plite edge and scoped peers        | Package manifests and Changesets   | Rewrite manifests and lockfile          | Scenario matrix and clean installs                 | Release skew                 | replace                |
| Bundle isolation    | Many physical packages                              | Explicit subpaths and reachability gates           | Release artifact checker           | Rewrite checker                         | Metafile, gzip, absent-module assertions           | Kitchen-sink root            | prove                  |
| Current teaching    | Old package and constructor names                   | Two installs and unqualified vocabulary            | Docs and registry                  | Source-backed rewrite                   | Docs check, registry build, browser                | Stale generated code         | replace                |

## Execution phases

### Phase 0 — Lock the contract and make drift visible

Owner: `best-api repair`, then `plite-plan` with `plate-plan` for the facade.

Actions:

1. Update the smallest relevant root, Plite, and Plate Vision statements to the
   accepted package and editor-instance vocabulary.
2. Define explicit final export maps in the two package manifests and a small
   facade exception fixture used by package tests.
3. Rewrite the package-direction contract around the final two distributions
   and survivor allowlist.
4. Classify every production import from current Plite internal entrypoints:
   same-package Plite code becomes private relative code after consolidation;
   generic extension/collaboration/view capabilities become narrow named public
   APIs in their real root, DOM, React, or History owner; Plate-only assertions,
   compiler glue, and helpers move to Plate. Do not create a generic
   `framework`, `unsafe`, or renamed `internal` dumping ground.
5. Refactor all cross-package internal consumers before the old entrypoint is
   removed. Public additions must describe a reusable user job and pass
   `best-api repair`; access to a private function is not a job.
6. Add positive type contracts for the four `createEditor` entrypoints, two
   `useEditor` entrypoints, context hooks, inferred editor capabilities, and
   facade identity. Do not add tests whose only assertion is that a dead alias
   is absent.
7. Audit affected worker skills and rules for stale teaching; update source
   rules, bump versioned doctrine when its source set changes, then run
   `pnpm install` to regenerate mirrors.

Exit gate:

- One accepted export/exception contract exists, doctrine teaches it, and the
  new positive contracts identify the source moves required by later phases.
- No production file outside the source set that will become `plitejs` imports
  a Plite internal entrypoint. Every promoted capability has one named public
  job and owner.

### Phase 1 — Consolidate Plite into `plitejs`

Owner: Plite package layer.

Actions:

1. Rename the workspace package and repository directory owner to `plitejs`.
2. Move DOM, History, Hyperscript, React, Page Layout, Diff, and Testing sources into
   the explicit target subpaths without forwarding packages.
3. Replace public React constructor/type/lifecycle/context names with the target
   vocabulary. Remove public internal exports and the redundant `ReactEditor`
   alias over `DOMEditor`.
4. Update build, test, tsconfig path aliases, Bun/Vitest setup, Plite app aliases,
   benchmark targets, and the browser proof package.
5. Configure the multi-entry build to preserve one implementation identity
   across subpaths through shared chunks or preserved modules. Do not bundle a
   private editor runtime copy into each entrypoint.
6. Rewrite raw Plite consumers. Temporary direct `plitejs` imports in packages
   that Phase 2 or 3 will absorb are allowed only inside the branch and are
   eliminated before handoff.
7. Delete the six old Plite workspace packages plus standalone Diff and Test
   Utils after their last source reference moves.

Exit gate:

- `plitejs` builds, typechecks, passes focused package and Chromium proof,
  packs every explicit subpath, and imports in a clean Node project without
  React or DOM globals.
- Internal imports among the merged Plite layers are private relative imports;
  the package manifest and emitted declarations expose no `internal` path.
- Packed imports of the same root, DOM, extension, and schema values through
  different Plite subpaths resolve to the same runtime objects.

### Phase 2 — Make `platejs` the physical Plate foundation

Owner: Plate package layer.

Actions:

1. Move Core and Utils source into `packages/plate`, preserving private owner
   folders for runtime, React, static, and utilities.
2. Implement `platejs -> plitejs` as a normal dependency.
3. Replace editor constructors, types, lifecycle hooks, context hooks, and
   static hook names with the target vocabulary. Remove public editor injection.
4. Replace blind `@udecode/*` barrels with explicit Plate-owned exports. Generic
   libraries may remain implementation dependencies but do not silently expand
   the Plate API.
5. Add corresponding Plate facade subpaths for the approved Plite roots and
   implement the explicit exception set.
6. Apply the same multi-entry identity rule to Plate so root, React, static,
   facade, and feature subpaths share one Plate runtime rather than bundled
   copies.
7. Rewrite every remaining package to depend on `platejs` instead of
   `@platejs/core` or `@platejs/utils`; delete those workspace packages after
   the last dependency and import moves.

Exit gate:

- `platejs`, `platejs/react`, and `platejs/static` build and typecheck; root
  clean-room import works without React; Plite facade values are identity-equal;
  no package manifest references Core or Utils.
- Cross-entrypoint Plate plugins, editor guards, and stores resolve one runtime
  identity in the packed package.

### Phase 3 — Absorb ordinary Plate features

Owner: each current feature owner, coordinated by `plate-plan`.

Actions:

1. Move features in dependency order so every slice stays buildable:
   - leaves: Basic Nodes, Basic Styles, Callout, Code Block, Comment, CSV, Date,
     Find/Replace, Tag, ToC, Toggle;
   - shared foundations: Combobox, Columns, Cursor, Floating, Indent, Resizable;
   - dependents: Link, List, Footnote, Mention, Emoji, Slash Command;
   - document/interaction cluster: DnD, Media, Suggestion, Tabbable, Table;
   - serialization/rendering cluster: Markdown and Math.
2. Give each feature one headless subpath and a React child subpath only when
   source proves both jobs exist. The current Plate Layout package moves to
   `platejs/columns`; it does not share the Plite page-layout path.
3. Convert cross-feature imports to private relative owner imports inside
   `packages/plate`; no public self-imports.
4. Preserve precise side-effect metadata. The Katex stylesheet is listed; JS
   feature modules remain side-effect free.
5. Delete each old feature workspace package immediately after its imports,
   manifest edges, tests, and entrypoint move.

Exit gate:

- Every ordinary package in the disposition table is gone, every target
  subpath passes its source-first test/typecheck cluster, and a package-root
  reachability audit proves features are not evaluated from `platejs`.

### Phase 4 — Normalize advanced survivors

Owner: each retained subsystem owner.

Actions:

1. Rewrite AI, CLI, Code Drawing, Excalidraw, Juice, and Classic List to consume
   `platejs` and its feature subpaths, with compatible Plate peers.
2. Merge DOCX Import, Export, and Paste into one `@platejs/docx` source package
   and expose explicit subpaths.
3. Rewrite Browser to peer on `plitejs` and preserve optional Playwright use.
4. Rewrite Yjs raw paths to peer on `plitejs`, Plate adapters to peer on
   `platejs`, and keep React/Yjs optionality isolated by subpath.
5. Remove direct Plite imports from Plate-only survivors. Browser and raw Yjs
   are the only allowlisted exceptions.

Exit gate:

- Each survivor packs and installs with only its documented hosts, DOCX has no
  sibling implementation packages, Yjs is absent from default bundles, and
  Classic List stays outside `platejs`.

### Phase 5 — Complete monorepo adoption and current teaching

Owner: `docs-creator`, registry source owners, and package tooling owners.

Actions:

1. Rewrite apps, docs, registry sources, examples, tests, benchmarks, CLI
   fixtures, configuration aliases, and release scripts to final imports.
2. Teach `pnpm add plitejs` for raw editors and `pnpm add platejs` for Plate.
   Advanced pages add only their scoped package and true host peers.
3. Rewrite current-state API docs around package-selected `createEditor`,
   `Editor`, `useEditor`, and context hooks. Release notes own old-to-new import
   mapping; current reference docs describe only the final state.
4. Run `pnpm brl`. Preserve curated entrypoints rather than replacing them with
   indiscriminate generated stars.
5. On `next`, run `pnpm --filter www build:registry` for registry source changes.
   Do not hand-edit `templates/**`; restore any local verification rewrite there.
6. Run exact source audits for old package specifiers and rejected public names,
   excluding immutable history and explicit release-note mappings.

Exit gate:

- Executable/current surfaces have zero stale imports or rejected editor names,
  generated owners are current, docs checks pass, and one Plite route plus one
  Plate block demo render through Browser with real editor interaction.

### Phase 6 — Replace linked versioning and author release artifacts

Owner: `changeset` and `release-lanes`.

Actions:

1. Inspect the release delta from `main` only for Changesets classification;
   architecture decisions remain grounded on `next`.
2. Remove the global linked group and prove independent release scenarios:
   Plite-only patch, Plate-only patch, facade-reaching Plite change, one advanced
   package change, DOCX break, and mixed beta release.
3. Add one changeset per surviving affected package. Never combine package
   names in one file and never use a forbidden `minor` shortcut for a real
   Plate break.
4. Initialize the `plitejs` 1.0 beta through release tooling rather than manual
   version edits; keep `platejs` on the existing v54 beta lane.
5. Add and test a release-lane pre-state migration: re-read npm baselines for
   every survivor, seed `plitejs` from its current `0.0.1` baseline, add any
   survivor missing from the active pre-state, remove deleted workspace
   identities, preserve Plate's v53-to-v54 initial version, and prove Changesets
   computes `plitejs@1.0.0-beta.0` beside `platejs@54.0.0-beta.N`. Do not exit
   and re-enter beta in a way that resets the Plate lane.
6. Update recursive dependent-changeset preparation so it follows real runtime
   and facade edges rather than glob-wide version linking.
7. Generate release notes with the exact package and import mapping. Do not add
   runtime compatibility code.
8. Extend and test the beta release command with resumable stages: version the
   complete release once, publish only `plitejs`, verify it, then publish
   `platejs` and survivors. A retry must skip an already-published identical
   Plite version and must stop on mismatched npm metadata.

Exit gate:

- Dry-run release output contains the intended packages and dependency ranges
  for all six scenarios, with no unrelated global bumps and no unpublished
  dependency reference.
- A staged-publish dry run proves that Plate cannot publish before the exact
  Plite beta exists and passes read-back.

### Phase 7 — Run full closure proof on packed artifacts

Owner: package proof harness, Plite browser proof, and root verification.

Actions:

1. Rewrite `check-plite-release-artifacts.mjs` around the final package and
   subpath graph. Keep explicit export, declaration, direction, isolated
   dependency, duplicate-version, and DCE checks.
2. Pack `plitejs`, `platejs`, and every changed survivor. Install tarballs into
   clean NodeNext and Bundler consumers with no workspace links.
3. Run the facade export/identity matrix and the bundle reachability matrix.
4. Run focused package checks, `pnpm check:plite:dev`, strict
   `pnpm check:plite`, browser matrix, registry proof, and root `pnpm check`.
5. Re-run doctrine mirror parity and exact stale-name audits on the final tree.

Exit gate:

- All commands and budgets in the proof matrix pass on one immutable commit;
  packed consumers resolve one Plite runtime and no source or workspace link.

### Phase 8 — Publish beta, verify, then mark old packages

Owner: `release-lanes`, after explicit npm release authority.

Actions:

1. Publish `plitejs@1.0.0-beta.0` first and read back version, dist-tag, exports,
   files, dependency metadata, and integrity from npm.
2. Install that exact public tarball into the clean Plite consumer and rerun the
   smallest runtime/type/bundle smoke.
3. Publish `platejs@54.0.0-beta.N` and changed survivor betas against that exact
   Plite beta; repeat npm read-back and clean Plate plus advanced-package installs.
4. Compare public tarball hashes/metadata with the locally proved artifacts or
   rerun equivalent proof against npm artifacts.
5. Query npm for every absorbed package. Deprecate only published v54
   prereleases belonging to this cut, with a concise replacement subpath.
   Preserve v53 stable packages for the v53 compatibility lane; unpublished
   scoped Plite packages need no ceremony.
6. Leave `latest` unchanged. Record the beta evidence and remaining ecosystem
   feedback window.

Exit gate:

- Public beta installs reproduce local proof, `platejs` resolves the verified
  Plite beta, absorbed published v54 prereleases point to their replacement,
  v53 remains untouched, and no stable dist-tag moved.

## Adoption map

| Consumer                     | Final dependency/import law                                                 | Phase         |
| ---------------------------- | --------------------------------------------------------------------------- | ------------- |
| Raw Plite apps and tests     | Depend on `plitejs`; import matching substrate subpaths                     | 1 and 5       |
| Plate apps and registry      | Depend on `platejs`; never declare or import `plitejs`                      | 2, 3, and 5   |
| Merged Plate features        | Private modules inside `packages/plate`; no self-package imports            | 3             |
| Plate-only scoped survivors  | Peer on and import `platejs`                                                | 4             |
| Browser proof                | Peer on and import `plitejs`                                                | 1 and 4       |
| Yjs raw integration          | Peer on `plitejs` and Yjs; Plate adapter peers on `platejs`                 | 4             |
| Third-party Plate extensions | Import public types and helpers from `platejs`; old major remains available | Release notes |
| Docs and examples            | Teach only final installs and current imports                               | 5             |
| Templates                    | Updated through registry/workflow owners, never by hand                     | 5             |
| Changesets and CI            | Model actual dependency edges and independent versions                      | 6             |

## Proof matrix

| Claim                                     | Planning evidence                                                             | Execution proof                                                                                       | Acceptance                                                                                                                                         |
| ----------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plite is one package                      | Six current package manifests and hardcoded release list                      | `pnpm turbo typecheck --filter=plitejs`; package tests; packed export audit                           | One `plitejs` package exposes every listed subpath                                                                                                 |
| Plate is one default package              | Current facade plus Core/Utils/feature dependency graph                       | `pnpm turbo typecheck --filter=platejs`; feature-cluster tests                                        | No Core, Utils, or ordinary feature workspace package remains                                                                                      |
| Plate users do not need Plite imports     | Accepted facade law                                                           | Clean app with only `platejs`; manifest/import audit                                                  | App compiles, runs, and has no direct `plitejs` declaration                                                                                        |
| Roots are headless-safe                   | Current package-wide React peers expose risk                                  | Packed Node import with optional peers omitted                                                        | `import('plitejs')` and `import('platejs')` work without React or DOM globals                                                                      |
| React paths own React                     | Separate current React packages                                               | Packed React consumer and Browser interaction                                                         | React constructors/hooks mount, edit, select, and unmount correctly                                                                                |
| One editor vocabulary preserves inference | Current six creator/hook names and type contracts                             | Type tests for all four entrypoints and two hooks                                                     | Options infer value/extensions/plugins without callback annotations or casts                                                                       |
| Context and creation are unambiguous      | Current `useEditor` collision                                                 | Provider/context and lifecycle tests                                                                  | Creation uses `useEditor`; retrieval uses explicit context hooks                                                                                   |
| Plate facade is complete                  | Current blind reexports                                                       | Runtime/type export-set comparison plus identity assertions                                           | Every Plite export is mirrored, replaced, or rejected by the small exception set                                                                   |
| No duplicate Plite runtime                | Plate normal dependency plus survivor peers and a new multi-entry build       | Clean install resolution graph plus cross-subpath and cross-package identity tests                    | Exactly one compatible `plitejs` instance and one implementation identity resolve                                                                  |
| Bundle size does not explode              | Current DCE harness already compares empty, bare, and named bundles           | esbuild metafiles and gzip comparison for root, React, one leaf, Markdown, Math, AI, and Yjs omission | Bare import collapses to baseline; named root/React/leaf is at most 5% or 2 KiB gzip above equivalent pre-cut owner; unrelated clusters are absent |
| Heavy integrations stay isolated          | Survivor dependency inventory                                                 | Metafile absent-module assertions                                                                     | Default bundles contain no AI, Yjs, CodeMirror, Mermaid, Excalidraw, DOCX, or Juice modules                                                        |
| CSS remains correct                       | Math package currently declares one CSS side effect                           | Pack and bundler CSS consumer                                                                         | Katex CSS survives explicit import; no other feature creates an implicit side effect                                                               |
| Package declarations are consumable       | Existing checker supports NodeNext and Bundler consumers                      | Rewritten packed declaration matrix for every subpath                                                 | Zero consumer diagnostics and zero workspace paths                                                                                                 |
| Internal ownership is real                | Ninety-nine production files currently cross old internal entrypoints         | Owner classification, source refactor, package export audit, and declaration scan                     | No cross-package internal import and no public `internal`, `unsafe`, or generic framework escape hatch                                             |
| Runtime behavior is unchanged             | Boundary law and non-goal                                                     | `pnpm check:plite`, full browser matrix, representative Plate demos                                   | Model, DOM, selection, focus, follow-up typing, and unmount proof stay green                                                                       |
| Release versions are independent          | Current global linked group and active v54 pre-state prove the migration risk | Changesets pre-state migration plus dry-run scenario matrix                                           | Plite computes 1.0 beta beside Plate 54 beta; only causally affected packages bump; Plate pins the proved Plite beta                               |
| Published artifacts match proof           | Local pack is insufficient                                                    | npm metadata/integrity read-back and clean install                                                    | Public beta repeats local package, type, and smoke proof                                                                                           |
| Old teaching is gone                      | Current docs and examples contain branded creators and packages               | `rg` audit, docs check, registry build, Browser                                                       | No stale executable/current import or rejected editor-instance name                                                                                |

Recommended command order during implementation:

1. `pnpm install` when manifests, lockfile, or doctrine mirrors change.
2. `pnpm turbo typecheck --filter=plitejs` and focused Plite tests.
3. `pnpm turbo typecheck --filter=platejs` and focused Plate tests.
4. Focused retained-package typechecks/tests for each moved dependency cluster.
5. `pnpm brl` after exported source moves.
6. `pnpm check:plite:dev` during each substrate slice.
7. `pnpm --filter www build:registry` after registry source adoption on `next`.
8. Rewritten `pnpm plite:release:packages` and isolated tarball consumers.
9. `pnpm check:plite` and `pnpm check:plite:browser-matrix` at closure.
10. `pnpm check` before any PR or release handoff.

Conditional evidence:

- High-risk scenarios: applied. Release skew, duplicate Plite copies, React
  leakage, optional-peer absence, facade collision, CSS side effects, internal
  package cycles, declaration drift, and public/local artifact mismatch each
  have a named proof row.
- External editor research: not applied. Tiptap and other package precedents
  informed the accepted direction earlier, but this execution plan depends only
  on the accepted product choice and current Plate/Plite source.
- Issue/PR provenance: not applicable. This is a user-directed architecture cut,
  not a public issue or PR claim.
- Browser: applied because package source and editor-facing examples change.
  Use Browser for a Plite route and a standalone Plate block demo, then the
  repository browser matrix for engine coverage.
- Benchmark: no performance-improvement claim. Bundle reachability and gzip
  comparisons are package correctness gates owned by the release harness, not
  a runtime benchmark project.
- Docs: applied through `docs-creator` after package contracts lock.
- Release: applied through `changeset` and `release-lanes`; external publication
  stays behind explicit authority.
- Behavior law: unchanged, therefore full regression proof is required but no
  new behavior doctrine is introduced.

Decisions and tradeoffs:

- A peer dependency is not isolation. It delegates installation/version
  ownership. Subpaths and import graphs prevent bundle leakage.
- Installing one large package increases local `node_modules` and tarball size.
  That is accepted. Making users install every internal parser/vendor manually
  would defeat the one-package goal.
- Root barrels stay curated and small. “One package” does not mean “one import
  path that evaluates everything.”
- Full Plate facade coverage is corresponding-subpath coverage, not flattening
  all Plite modules into `platejs` root.
- Version lines are independent. The facade creates release obligations, not a
  reason to bump unrelated packages.
- Classic List remains separate because merging legacy behavior into the
  default is worse than one explicit maintenance exception. Its deletion is a
  separate product decision.
- Static rendering keeps distinct names because it is a different job. Brand
  variants for the same live editor job are deleted.
- No compatibility layer is planned. The ecosystem cost is real, but carrying
  two package ontologies indefinitely is worse.

Review fixes:

- Removed the draft duplicate start gate.
- Rejected a broad optional-peer policy; only host/singleton dependencies are
  peers.
- Moved generic Diff and Testing ownership to Plite.
- Merged DnD, Markdown, Math, Emoji, and Media into Plate because optional
  features alone do not justify packages.
- Preserved explicit subpaths instead of a root kitchen-sink barrel.
- Split code completion from npm rollout authority.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Plan file replacement used two operations in one patch | 1 | Delete and add in separate `apply_patch` calls | Recreated the file through the required patch tool. |
| Package-coverage one-liner contained shell-active backticks | 1 | Use single-quoted JavaScript with plain string concatenation | The safe rerun found every current editor package in the plan. |
| TypeScript 7 package exposed no compiler API for declaration export inspection | 2 | Parse the rolled-up declaration export block and pair it with runtime identity checks | The fallback found the root and React collision sets without changing source. |

Verification evidence:

- Read the current Plite and Plate Vision owners and found the existing raw
  substrate/product framework boundary.
- Enumerated every `packages/*/package.json`, its internal dependencies,
  external dependencies, peers, and exports; every editor package is present in
  the disposition table.
- Read the current Plite, Plite React, Core, and Plate barrels and the concrete
  creator/context implementations.
- Confirmed the global Changesets linked group and the old package list in the
  packed-release harness.
- Confirmed current math CSS side-effect handling and existing isolated
  dependency/DCE proof capabilities.
- Ran
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-26-plitejs-platejs-distribution-hard-cut.md`
  as the mechanical planning close gate.

Final handoff prepared:

- Ownership and target API/runtime: Plite owns raw laws in `plitejs`; Plate owns
  product behavior in `platejs`; corresponding Plate subpaths facade Plite;
  editor-instance vocabulary is unqualified and selected by entrypoint.
- Public breaks: old scoped Plite/Core/Utils/ordinary feature packages and
  branded editor creators/types/hooks disappear without aliases. Existing v53
  remains available.
- Adoption: all raw consumers move to `plitejs`; all Plate consumers and
  Plate-only survivors move to `platejs`; Browser and raw Yjs are the only
  direct Plite survivor exceptions.
- Proof: package, type, facade, DCE, dependency, browser, docs, release-scenario,
  and npm read-back gates are explicit.
- Main risks: accidental heavy root imports, Plite/Plate beta skew, duplicate
  Plite copies, declaration widening, and stale generated imports. Each has a
  falsifying test.
- Execution order: contract, Plite, Plate foundation, ordinary features,
  advanced survivors, adoption, release graph, packed closure, beta rollout.
- User attention: accept this plan to start repository work; give a separate
  explicit release instruction before Phase 8 mutates npm.

Timeline:

- 2026-08-26: plan created, source-grounded, package cut resolved, and handoff
  prepared.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Planning complete; implementation has not been authorized. |
| Where am I going? | Phase 0 contract lock, then the eight dependent implementation and rollout phases. |
| What is the goal? | Two default distributions with one editor vocabulary and proved package isolation. |
| What have I learned? | The current facade points in the right direction, but Core, Utils, ordinary features, branded constructors, and global linked versioning preserve the old graph. |
| What have I done? | Classified every package, fixed the public API cut, version policy, release order, adoption map, and proof matrix. |

Open risks:

- npm publication and deprecation are intentionally blocked on explicit release
  authority; repository implementation can finish through Phase 7 first.
- A hidden third-party import of a current public `internal` path will break.
  That is accepted by the hard cut and documented only in release notes.
- Package consolidation may expose private source cycles that separate package
  builds currently mask. Phase 3 moves dependency clusters in order and rejects
  public self-imports.
- The 5% or 2 KiB gzip comparison may reveal a real root or React regression.
  The response is to fix import ownership, not relax the budget without source
  proof.
