# Ownership And Correction

## Gap Law

When the clean Plate v2 migration cannot be implemented without a missing
primitive, classify the blocker instead of patching around it:

- `Plite gap`: generic editor substrate is missing or too weak: reads,
  updates, transactions, schema, selection, ranges, paths, DOM runtime,
  extension install, history substrate, serialization, or proof harness.
- `Plate gap`: product composition is missing or too weak: plugin typing,
  plugin lifecycle, API/read/update projection, UI/default route,
  registry/docs, product command ergonomics, or Plate package ownership.

For each gap, name:

- exact missing API/capability;
- why a local bridge/helper would be a hack;
- smallest source owner to patch;
- focused proof command or test surface;
- whether the current one-by-one review should stop, patch the gap first, or
  defer with an explicit owner.

## Correction Sweep Law

Every correction creates a related-surface sweep. The sweep is scoped to the
active mode. Do not silently turn a package review into a repo-wide migration.

After any code/template/API correction:

1. Derive the sweep pattern from the exact correction: old symbol, deleted
   wrapper, bridge file, helper shape, plugin owner, Plite primitive, or type
   cast class.
2. Run focused `rg`/caller searches inside the active scope:
   - named file/API: target owner plus the smallest caller graph needed to
     prove the decision;
   - package review: the named package plus the smallest Plite/Core owner that
     blocks that package;
   - Core review: `packages/core/src` and relevant `packages/core/type-tests`;
   - broad sweep/full-loop: the explicitly requested broad manifest.
3. Review every match in that scoped class, not just the first one.
4. Apply the same correction only inside the active scope when it is clearly
   safe.
5. If a broader audit finds matches outside the active scope, do not patch
   them. Add them to the plan as `defer-with-owner`, `Plite gap`, `Plate gap`,
   or `next-package-candidate` with proof needed.
6. Record the sweep query, match count, patched count, deferred count, and
   remaining risk before handoff.

When the correction changes, removes, renames, or reinterprets a reusable
public API or canonical plugin/registry pattern, run `best-api repair`
automatically in the same task. Repair every affected worker rule, bump this
doctrine when its fingerprinted source set changes, regenerate mirrors, then
rerun the scoped correction sweep against the repaired doctrine before package
attestation. Never wait for a separate skill-repair prompt or attest a package
against rules that still teach the rejected shape.

Custom selections follow installed capability truth. A plugin declares the
payload, codec, validator, mapping, and behavior once through
`selectionKinds`; concrete editor reads and updates infer that payload only
when the plugin is installed. Cut every ambient module augmentation, global
selection-kind map, side-effect type import, duplicate registration, and open
custom-kind fallback. Keep a separate earlier `.extend({ selectionKinds })`
stage only when later stages genuinely consume the inferred selection type.
Concrete editor read/update callbacks stay contravariant; callback bivariance
must not let annotations manufacture uninstalled capabilities. Keep exact
tuples invariant, erase only at named internal runtime boundaries, and keep
direct `update.selection` mutation-only. Public editor capability generics
default to the core-only `readonly []` tuple; a bare `Editor` or `BaseEditor`
must not expose arbitrary groups through `any`. Reserve `AnyEditor` for named
internal runtime erasure. Project installed extension capabilities once; never
re-intersect whole React/DOM editor read or update surfaces onto Plate after
their extensions are already installed.
Generic helpers follow the same law: accept only the structural capabilities
they consume, or preserve a layered caller type when returning a view. Never
infer one provider and reconstruct a whole raw editor around it. Keep deliberate
erasure behind a named runtime implementation after the public signature has
preserved exact inference.

This is narrower than a full Core sweep. It is mandatory after a correction,
even for one-by-one review, but it is not permission to update unrelated
packages, docs, examples, or generated surfaces.

## Extracted File Recovery Law

Review mode must inventory extracted files, not only modified files. Before
claiming a Core review pass is clean:

- Run an untracked-file inventory for the target scope, for example
  `git ls-files --others --exclude-standard packages/core | sort`.
- Treat every untracked Core/Plate source, spec, type-test, and config file as a
  required ledger row.
- For each row, compare against `origin/main` to recover behavior and understand
  the former owner. Then choose the best current owner. Recover the old path
  only when it is still the durable owner; merge a one-use extraction into its
  plugin owner instead of restoring it by reflex.
- Every extracted file must end in exactly one bucket:
  `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- New helper folders under an existing plugin require multiple production
  consumers or a real independent boundary. Prior existence on `origin/main`
  does not justify a one-use split.
- Do not give a file or packet a `100` score while any extracted/untracked file
  in scope lacks a ledger row and a bucket.
- Record cosmetic naming ideas as deferred, but complete owner-driven
  merge/delete/rename work in the active packet.

`sweep`, `all core`, `full-loop`, `full review`, and similar broad Core
requests are not autopilot sampling. They mean full Core file review. Do not
close one of those runs after a narrow packet unless every Core source file has
a drift score and the score gate passes.

When the target is Core or a broad Core sweep, stay scoped to Core. Ignore
errors from non-Core packages unless the user named those packages, the current
packet edited them, or the failure proves a Core public API regression. Do not
chase feature-package fallout during a Core cleanup run. Record it as
out-of-scope package drift with the owning package and move on.

## Core Law

Plate Next means:

- Plite owns editor substrate: nodes, operations, selection, read/update,
  transactions, schema, history substrate, DOM/runtime primitives, and editor
  extension installation.
- Plate owns product composition: plugins, UI, app/registry kits, product
  command ergonomics, docs/examples, and app-facing defaults.
- Core must not wrap Plite editor APIs under Plate names.
- Schema cleanup uses the final Plite vocabulary: direct complete/named roots,
  safe omitted `elements`/`unknown` defaults, `schema.element.textBlock()`,
  validator-backed narrow JSON properties, placement-owned
  `role: "metadata"`, `schema.create`, assertion boundaries, and
  `schema.isMarkableVoid`.
- Application schema lineage uses `id` and `version` inside the single
  app-owned `schema` object. Plate element membership is `blockContent`. Plate
  schema queries accept plugin descriptors directly and do not expose
  `schema.handle(Plugin)`.
- Plugin `name` is capability identity only. Persisted identity is published
  through compiled element and property handles. Only the consuming
  application's final schema may override element type, content, groups, or
  property targets and add app-owned properties; `.extend()` and `.configure()`
  cannot, and plugin-owned property keys/value laws stay fixed.
- Descriptor-aware schema builders publish normalized plugin names in their
  structural output, retain nominal descriptors only as private metadata, and
  validate descriptor family against the installed owner before applying the
  policy. Same-name structural objects are not interchangeable descriptors.
- Raw plugin runtime capabilities stay shallow. Exact recursive `Value`, final
  handles, mutation maps, and schema fingerprints may live in opt-in generated
  artifacts so ordinary editor API access remains finite. Generated output
  never owns the runtime plugin array or ordinary editor setup.
- Generated schema contracts are content-addressed data, not trusted caches.
  Fingerprints hash compiled semantic output rather than authoring syntax;
  readers recompute authoritative structure, and restoration compares every
  derived table with current source contributions before publication.
- Normalized schema/compiler/provider witnesses are private implementation
  machinery. If removing a public carrier breaks inference, fix the private
  descriptor compiler rather than restoring the carrier.
- Plate product APIs may compose Plite APIs, but they must not mirror Plite
  namespaces or create a second mutation/read layer.
- No public compat aliases, old Slate shims, or docs for old API names.
- Private bridges are allowed only with owner, deletion gate, and proof.
  They are not allowed to become a dumping ground for displaced product/plugin
  logic.
- If a helper exists only because the migration was hard, cut it.
