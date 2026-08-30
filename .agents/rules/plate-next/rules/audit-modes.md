# Audit Modes

## Review Matrix

Every inspected file/API/helper gets one verdict:

- `main-parity-cleanup`: keep the `origin/main` owner/name/concept, but repair
  the migrated implementation so it uses Plite correctly.
- `move-to-plite`: generic editor substrate belongs in Plite, with Plite tests.
- `keep-in-plate`: product-level behavior with a distinct Plate user job.
- `hard-cut`: old Slate/Plate compat, alias, wrapper, or duplicate API dies.
- `Plite gap`: clean migration blocked by missing Plite substrate; patch Plite
  first or defer with owner/proof.
- `Plate gap`: clean migration blocked by missing Plate product/plugin
  architecture; patch Plate owner first or defer with owner/proof.
- `private-bridge`: temporary internal scaffold with deletion gate and no
  public export. This verdict is only valid for a tiny adapter that preserves
  current behavior while its owner is being migrated. It is forbidden for a
  file that centralizes product/plugin logic from multiple owners.
- `recover-main-owner`: extracted or renamed file restored to the
  `origin/main` owner/path/name for review readability.
- `merge-existing-owner`: helper folded back into the existing owner because
  the split added navigation cost without durable ownership.
- `justify-new-proof-tooling`: new config/spec/type-test harness kept because
  it closes a real proof gap and has no old source owner.
- `defer-with-owner`: real but unsafe to do in this packet; name owner/proof.

Default suspicion list:

- `with*` wrappers that just install a Plite extension or call another helper.
- `extendEditor` callback semantics, `extendTransforms`, `editor.tf`,
  `editor.transforms`, `plugin.transforms`, `getTransforms`, `getPluginApi`,
  old `getApi` surfaces, and command fallbacks that compete with
  `editor.read`, `editor.api`, or `editor.update`.
- helpers in `packages/platejs` that are really generic node/range/selection/
  schema/runtime behavior.
- `any`/`unknown` casts hiding type loss from migration.
- explicit callback/helper types in tests that replace inference from
  `defineBasePlugin`, Plate `createEditor`, exact definitions, update groups, or editor
  API calls.
- local variable annotations that duplicate an obvious initializer type,
  especially `const x: NodeEntry<...>[] = editor.read...`,
  `const x: Value = [...]`, or `const x: Editor = create...` when the
  initializer should own inference. Empty arrays and external boundaries are
  the exception, not the default.
- plugin export annotations/casts that replace inference from
  `defineBasePlugin`, `definePlatePlugin`, `toPlatePlugin`, or chained
  `.extend()` calls. They cap the file below `100` until removed or justified as
  a real external boundary.
- any `PluginConfig` alias, public `__config`, caller-supplied whole-plugin
  factory generic, `InferConfig`, or
  `type FooConfig = DefinitionOf<typeof FooPlugin>`. Keep explicit domain
  capability contracts separate, name extracted definitions `FooDefinition`,
  and let the plugin definition infer.
- imported Plite `defineExtension(plugin.name, {... })` or
  `defineExtension(PLUGINS.foo, {... })` around an inline plugin
  native-field contribution. The plugin builder owns inline contextual typing,
  callback-return typing, and exact definition normalization.
  Independently reusable standalone Plite descriptors may use the imported
  helper and compose as dependencies. A Plate context identity helper that only recovers erased inference
  is leaked compiler machinery: fix the owning generic and delete it.
- one-line `editor.read((state) => state.*())` or `editor.update((tx) => {
tx.*(); })` wrappers when the direct one-shot method exists. These cap the
  file below `100` until replaced or justified as grouped transaction/snapshot
  logic.
- bare or `{ force: true }` explicit normalization in feature-package
  production code without a named full-root semantic invariant. Such a file is
  capped below `50`; a comment, green snapshot, or old leaf-coalescing fixture
  is not sufficient evidence.
- transform/input-rule/command callbacks that mutate through `editor.update.*`
  while an active `tx` should be available. Inline single-owner behavior into
  the callback so it captures `tx`; pass `tx` to another function only when a
  proven shared or independent owner survives. Do not scatter local
  `editor.update` calls inside the callback.
- plugin-owned functions whose signatures carry `editor`, `api`, `read`, `tx`,
  `store`, resolved plugin state values, or resolved plugin type
  instead of domain inputs. Operation options are not plumbing. Review the full
  owner chain for an earlier honest staged API/tx capability before accepting
  the helper.
- live node state, arguments, DOM attributes, or protocol fields named `id` or
  `ids`. Plite live identity is `NodeKey`; resolve it through `editor.key`,
  contextual `state.key`, or active `tx.key`, reverse through `nodes.path`, and
  name feature values `key` or `keys`. Keep persisted `element.id` distinct and
  optional through `ElementIdPlugin`; never serialize a `NodeKey`.
- later tx stages that call an earlier method through a portal one-shot,
  `context.update`, or `editor.update.*` instead of
  `tx.plugin(Plugin)` or a generated direct `tx.pluginName` group. Computed
  `tx[plugin.name]` and `tx.extension(...)` are equally rejected.
- nested `editor.update.*` calls inside any `editor.update` callback,
  especially `editor.update.withoutNormalizing(() => { editor.update.* })`.
  The owning API should pass `({ tx })`, and the callback must mutate through
  that `tx`.
- multiple consecutive `editor.update.*` calls that implement one user action.
  They must be one transaction group at minimum, and `tx` from context is the
  preferred shape when the caller is already inside a transform lane.
- local JSX/editor fixture aliases in tests, especially `{ children; selection
}` shapes that should come from `@platejs/test`.
- duplicate Plate helpers around Plite APIs.
- arbitrary root editor object fields such as `editor.propsChanges`,
  `editor.someCache`, direct property assignment bags, or interface extensions
  that smuggle plugin/product state onto the public `Editor`.
- docs/examples that teach legacy compatibility instead of latest state.
- React trees split into one file per sibling component or hook, especially
  `components/` / `hooks/` taxonomies and nested barrels where one feature
  family is the only durable owner. Multiple siblings inside that family do
  not establish reuse.
- copied registry source outside the flat `components/editor` install
  namespace, including Plate components under `components/ui`,
  `components/plate`, or nested `editor/plugins`, `editor/kits`,
  `editor/nodes`, `editor/hooks`, and feature folders. `components/ui` belongs
  only to the selected shadcn primitive layer.
- registry item or feature filenames ending in `-kit`. The feature item/file is
  `foo`; its stable app-owned plugin tuple is `FooKit`, including one-descriptor
  features. Package roots remain forbidden from exporting opinionated kits.
- modern copied-registry item or filenames ending in `-node`, `-element`, or
  another implementation-role suffix. A standalone renderer uses the semantic
  feature name (`blockquote`, `media-image`); aggregates such as
  `basic-blocks` compose it. Split every live/static source pair into `foo` and
  `foo-static`. Classic remains maintenance-only for behavior and parity, but
  that policy never permits a stale `*-node` item or filename when the owner is
  explicitly touched.
- shallow copied-registry feature shells that export `FooKit` while importing
  their sole renderer or family-only UI from `foo-node`, `foo-buttons`,
  `foo-toast`, or another one-consumer sibling. Merge that source into `foo`
  (and static-only source into `foo-static`), delete the obsolete registry item
  and path, and preserve a sibling only for an independently installable main
  component, the one allowed semantic controller, or proven cross-feature
  reuse.
- primitive variants that install to different editor paths, branch on the
  chosen base at runtime, leak `asChild` / `render` into shared feature code,
  or ship a shared helper justified only by mutually exclusive Radix/Base/Aria
  implementations. Require one installed target plus variant type and browser
  proof.
- `useFooState -> useFoo`, `stateHook -> propsHook`, `useFooProps`, or
  `ReturnType<typeof useFooState>` component pipelines.
- exported hooks whose only terminal consumers are one copied registry family,
  package wrappers that feed only that family, or one custom hook per
  subcomponent.
- public providers/stores with no independent lifecycle or cross-family
  consumer.
- `forwardRef`, React 18 compatibility branches, or generic component
  factories/HOCs hiding a small fixed component family.

## Bridge Scoring Law

Passing tests do not make a bridge clean. During Plate Next scoring, a file can
reach 100 only when its behavior lives in the right owner.

- A file like `currentRuntimeBridge.ts` that collects displaced command,
  input-rule, node-id, affinity, DOM, or change-listener behavior from several
  owners is a forbidden bridge hack. Score it `0` until it is deleted.
- Any file that imports or installs such a bridge is capped at `25`, even when
  `check:core` passes.
- An owner file whose real runtime behavior was moved into the bridge is capped:
  `InputRulesPlugin` with input-rule execution in the bridge is `<=5`;
  `ElementIdPlugin` with persisted-ID lifecycle work in the bridge is `<=45`;
  `AffinityPlugin` with edge insertion/selection behavior in the bridge is
  `<=55`; `PliteExtensionPlugin` with change dispatch in the bridge is `<=45`.
- Private tx/plugin adapters that only connect Plate plugin tx groups into
  Plite are capped at `50` until package-level type and behavior proof shows
  the adapter is the final boundary, not migration sludge.
- Public type/plugin/editor surface files touched while a forbidden bridge
  remains are capped at `75`; green typecheck is not enough.
- Do not raise a capped file to 100 by pointing at `pnpm check:core`. Raise it
  only by moving the logic back to the correct owner, deleting the bridge
  dependency, and running focused owner proof.

## Full Plate foundation Sweep Law

When the target is broad Plate foundation review, use full-manifest mode:

- Enumerate every file under `packages/platejs/src/**/*.{ts,tsx,mts,cts}`.
- Include `packages/platejs/type-tests/**/*.{ts,tsx,mts,cts}` when public type
  surfaces, plugin typing, package API, or runtime typing are in scope.
- Create `docs/plans/artifacts/<plan-slug>/core-drift-ledger.tsv`.
- Every file in the manifest gets one row. No sampling, no "highest-risk only",
  no closing after a representative packet.
- Every row needs `path`, `drift_score`, `verdict`, `owner`, `evidence`, and
  `next`.
- Drift score rubric:
  - `0`: clean/current owner, no action.
  - `1`: tiny naming/style smell, no architecture risk.
  - `2`: moderate drift; owner and next action required.
  - `3`: real Plate/Plite boundary risk; fix or defer with owner/proof.
  - `4`: major compatibility sludge, duplicate runtime/API, or migration hack;
    cannot be kept without explicit owner and deletion gate.
  - `5`: public API/runtime blocker; stop broad execution and route call shape
    to `best-api`, then runtime/adoption to the owning layer plan.
- Score caps:
  - forbidden bridge hack: confidence score `0`;
  - direct import/install of forbidden bridge: confidence score `<=25`;
  - real owner file with behavior displaced into forbidden bridge: confidence
    score capped by the Bridge Scoring Law;
  - public API/type surface touched while a forbidden bridge remains:
    confidence score `<=75`.
- Score gate:
  - the autogoal plan's Plate foundation drift ledger must record the manifest command,
    expected row count, actual row count, missing/extra row count, and top drift
    rows before closure.
  - Any score `>=2` needs an owner, evidence, and next action.
  - Any score `>=4` cannot close as `keep-in-plate`; it must be fixed,
    hard-cut, moved, quarantined, or deferred with owner/proof.
  - The final handoff must list the top drift rows and next owner.

This rule exists because a targeted parser sweep missed
`packages/platejs/src/lib/plugins/affinity/AffinityPlugin.ts`. A future sweep must
prove it looked at that file and every peer, even when the first packet is
green.

## Package Review Mode

When the target is one package, use package review mode. This is review-first,
not migration-first.

Package review mode exists for the user's manual review flow: they want to
review one package carefully, then decide whether the next package is safe. Do
not treat `plate-next packages/<name>` as permission to sweep the repo or move
to the next package.

Rules:

- Freeze scope to the named package plus the smallest Plite/Plate foundation owner needed
  to remove a blocker found in that package.
- Do not update docs, examples, package callers outside the named package,
  unrelated packages, generated registries, or broad repo surfaces from package
  mode. If the same API smell appears elsewhere, record it as a deferred row or
  next package candidate.
- Do not run `apps/www`, `www` dev server, docs routes, registry demos, or
  browser proof during package review mode unless the user explicitly targets
  `apps/www`, `content/docs`, registry/docs UI, or asks for browser/docs proof.
  Package review proof is package-local plus the smallest Plite/Plate foundation owner
  proof. If content docs were touched only because a Plite/Plate foundation API name
  changed, run source/docs parity at most and record route proof as deferred.
- A hard-cut decision discovered in one package still lands package by package.
  Do not run a global caller rewrite unless the user explicitly says
  `all packages`, `current tree`, `full-loop`, `sweep`, or names the broader
  owner.
- If a package packet needs a Plite/Plate foundation fix, patch only that smallest owner
  and the package proof needed for the current package. Do not opportunistically
  migrate every consumer of the new owner API.
- Before implementation, generate a package file manifest and materialize one
  checkbox per reviewed file in the autogoal plan.
- Treat every production file under `transforms/`, `queries/`, `utils/`,
  `helpers/`, and similar helper folders, plus every standalone production
  function that accepts `editor`, `api`, `read`, `tx`, `store`, resolved plugin
  state values, or resolved plugin type, as a mandatory owner-topology
  row. Operation options are domain inputs and do not trigger this row. Package
  review cannot close from a few representative helpers. Inline/delete each
  single-owner row, replace plugin-owned plumbing with an earlier honest staged
  capability, or record concrete multiple-consumer/independent-boundary
  evidence.
- Manifest inputs:
  - `packages/<name>/src/**/*.{ts,tsx,mts,cts}`;
  - package-local specs, test-utils, type-tests, fixtures, and examples when
    they live outside `src`;
  - package docs/examples only when the package review touches that public
    surface.
- Every file row needs `path`, `score`, `verdict`, `owner`, `evidence`, and
  `next`.
- A file row may be checked `[x]` only at score `100`.
- Helper rows may score `100` only when topology matches durable ownership:
  plugin behavior is colocated in the plugin owner and repeated callers use its
  scoped API; a separate helper needs a real non-plugin, cross-plugin,
  cross-layer, transaction-composition, standalone public, or proof-tooling
  owner. React rows apply `plate-ui`: one component-family owner plus zero or
  one semantic controller. Direct local hooks do not earn another file;
  sibling exports, subcomponent hooks, or app-wrapper consumers do not justify
  new public owners. A separate provider/store row needs independent lifecycle
  or cross-family reuse. Line count never justifies extraction.
- Score `100` means all of these are true:
  - no behavior regression versus `origin/main`;
  - no type regression;
  - inline inference is preserved, with no fake explicit callback annotations,
    `as any`, or local helper types hiding weak owner types;
  - no plugin-owned helper threads editor/runtime plumbing that an earlier
    inferred API/tx stage can own;
  - staged tx-to-tx reuse stays on `tx.plugin(Plugin)` or a generated direct
    `tx.pluginName` group and has compile/runtime proof;
  - a native runtime callback that consumes staged API has runtime proof for lazy
    `context.api` publication;
  - no legacy compat alias, shim, old command fallback, or duplicate wrapper
    around Plite APIs remains;
  - Plite/Plate ownership is correct;
  - owner/name/path changes are justified by durable ownership rather than
    compatibility or cosmetic churn;
  - focused package proof or a justified source audit proves the row.
- Anything below `100` stays unchecked with a concrete reason and next action.
- Green package tests alone do not make a file `100`.
- Do not move to the next package until every file is either checked at `100`
  or explicitly deferred for user review with reason, owner, and proof needed.
- Safe defects found during package review may be patched, but the loop must
  keep returning to the current package checklist until it closes or the user
  redirects.
- If the package becomes part of the Plate foundation/Plite boundary proof, update
  `tooling/scripts/check-core.mjs` in the same packet before closeout. Plate foundation
  adjacent package review is not done with package-local proof alone.
- Package metadata diffs are reviewed from real imports, not from an assumed
  package shape. Plate package source/runtime code imports `platejs`; raw
  substrate owners import `plitejs`; shared Plate contracts import the
  matching `platejs` entrypoint; and one-owner helpers stay local. For every
  `package.json` diff, audit
  `packages/<name>/src` and runtime entrypoints, then classify each dependency
  delta as `direct-runtime`, `external-peer`, `test-tooling-convention`, or
  `cut`. Keep React as a peer when the package exposes React surfaces. Cut
  dependencies with no source/runtime import. Do not add package-local test
  harness dependencies like `@platejs/test` only because specs import
  them unless repo-wide tooling convention or package-local tooling requires
  it.
- Every completed package review must add its package slug to
  `reviewedPackageSlugs` in `tooling/scripts/check-core.mjs` before closure.
  Exclude only a deferred/blocked review or a package whose plan explicitly
  records why it does not belong in `check:core`.
- Every completed package review must also have an entry in
  `.agents/rules/plate-next/versions.json`. A newly reviewed package may be
  attested directly at `latestVersion` only after its full current-doctrine
  review closes. Record the final source fingerprint, local verification date,
  and evidence plan, then run `version.mjs validate` and
  `version.mjs status <package>`. The package is not complete unless status is
  `current`.
- When a package is hard-deleted, remove it from `reviewedPackageSlugs`, move
  its version entry to `retiredPackages`, and record retirement date/evidence.
  Do not erase its history or leave it in the active sync queue.
- Broad Plate v2 redesign, cross-package migrations, or package-to-package
  fallout are out of scope unless the current package exposes a real blocker
  that cannot be fixed in its owner.
- Package-mode final handoff must include `out-of-scope matches discovered`
  when a source audit found broader callers. Those rows are routing hints, not
  permission to patch them.
