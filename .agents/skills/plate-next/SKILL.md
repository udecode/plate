---
description: 'Plate Next cleanup supervisor: deeply review and migrate Plate surfaces to be Plite-perfect, hard-cut old Slate/Plate compatibility sludge, route plans vs implementation, and run auto-style timed/full loops.'
argument-hint: '[specific API|path|package|current tree|hours|full-loop|batch-loop]'
disable-model-invocation: true
name: plate-next
metadata:
  skiller:
    source: .agents/rules/plate-next.mdc
---

# Plate Next

Handle $ARGUMENTS.

Use this when the user wants Codex to do the review they keep doing manually:
open a migrated Plate file/API, ask why every compatibility helper exists, and
cut or move it until Plate is a clean product layer on top of Plite.

This is a wrapper skill, not a new execution engine. It uses `autogoal` for
state, `plate-plan` for public API forks, `architecture-cleanup` for source
shape/deslop, and `auto` for implementation/proof loops. Its distinct job is
the Plate Next review lens: make Plate Plite-perfect and stop old Slate/Plate
compatibility from becoming the final API.

## Use When

- The user invokes `plate-next`.
- The user asks "why is this file/helper here?" during Plate migration.
- The user wants a file-by-file or API-by-API Plate v2 cleanup pass.
- The target is Core, Plate runtime, plugin API, package migration, docs/API
  mismatch, or old Slate compatibility in Plate.
- The user gives no target and expects autopilot to find the next Plate cleanup
  risk.
- The user gives a duration such as `1h`, `8h`, or `overnight`.

## Do Not Use When

- The target is pure Plite substrate design: use `plite-plan`.
- The target is public GitHub issue/PR/security queue: use `maintainer`.
- The target is already-applied current-tree closure before commit: use
  `autoclosure`.
- The task is one ordinary local patch with no Plate/Plite boundary question:
  use `task`.

## Invocation

Same user-facing shape as `auto`:

- `plate-next`
- `plate-next editor.api`
- `plate-next packages/core/src/lib/utils/isType.ts`
- `plate-next packages/table`
- `plate-next current tree`
- `plate-next 2h`
- `plate-next all core packages full-loop`

No argument means autopilot: scan the highest-risk Plate Next surfaces and pick
the next cleanup packet without asking.

## Review Mode: Best Plate V2, Main As Evidence

When the user asks for a review, suggestion, "best", "why is this here?", or a
named-file Plate Next pass, default to review mode.

Review mode is the interactive lane where the user points at one file/API at a
time and expects the best Plate v2 migration recommendation. The target is not
legacy Plate compatibility. The target is a clean Plate product layer on top of
Plite.

Use `origin/main` as evidence, not as the final API target:

- preserve user-visible behavior unless a breaking change is explicitly part of
  the accepted Plate v2 direction;
- preserve old ownership when it still describes the product concern;
- recover accidentally extracted code when the split is just migration noise;
- do not keep old API shapes, compatibility aliases, shims, wrappers, or
  `with*` glue just because `origin/main` had them.

Rules:

- For one-by-one review, give the best migration call first: `cut`, `move to
  Plite`, `keep in Plate`, `private bridge with deletion gate`, or `blocker`.
- No legacy backwards compatibility by default. If the clean path requires
  breaking old Plate API, say so and recommend the break.
- No hacks. Do not route displaced product/plugin behavior into bridge files,
  helper dumps, `any` casts, duplicate Plate wrappers around Plite APIs, or
  fake aliases.
- Do not add local structural type guards around Plite-owned editor APIs. A
  helper like `type DOMResolver` / `hasDOMResolver` for
  `editor.api.dom.resolveDOMNode` is a failed migration: either call the typed
  Plite API directly or fix the owning Plite/Plate API type.
- Never type inferred types in tests or examples. If `origin/main` relied on
  inline callback inference, keep that shape. Do not add local helper aliases
  like `PreInsertOptions`, explicit callback parameter annotations, or
  `Parameters<typeof fn>` plumbing just to silence TypeScript. Fix the owning
  API/source typing so the call site stays inferred.
- Do not add local fixture-shape aliases in tests, such as
  `type EditorFixture = { children; selection }`, to hide weak hyperscript
  typing. If many tests need the same JSX/editor fixture shape, repair or
  export the test-utils owner type and let call sites use that source-owned
  fixture type without local casts.
- Preserve main-style inline test setup. Do not extract `const plugins`,
  `const options`, helper variables, or wrapper factories from a test just to
  placate migrated types when `origin/main` kept the setup inline. Inline
  editor/plugin construction is part of the reviewed API shape; if inline
  inference fails, fix the source typing or explicitly classify a
  Plite/Plate gap instead of reshaping the test.
- If the correct answer needs missing substrate, stop and name the exact
  `Plite gap` or `Plate gap` instead of inventing a local workaround.
- Rename churn is forbidden by default in review mode. Do not rename files,
  folders, plugin keys, exported symbols, helper names, or test filenames just
  because the new name is cleaner. Keep the current `HEAD` name until the
  behavior/API diff is reviewed.
- If a rename looks desirable, write it to `docs/plans/pre-renaming.md` with
  current name, proposed name, owner, reason, and recovery notes. Apply it only
  after the user explicitly accepts the rename pass.
- Added/deleted pairs that are mostly rename noise are a review failure. Restore
  the old path/name for the current packet, then document the later rename.
- Exceptions need a concrete reason: the old name is actively false, the file no
  longer has an owner, the rename is required for a public API hard cut already
  accepted by the user, or keeping both names would break tests/types.
- Compare the current owner/name/role with `origin/main` before suggesting
  renames, deletions, or new owner topology.
- Do not suggest renaming established Core plugins, helpers, options, or public
  concepts unless the user explicitly asks for naming cleanup, full Plate v2
  closure, or a public API redesign.
- Prefer "keep the main owner, repair the implementation" over "invent a
  better name" during review mode.
- If code moved from old Slate/Plate APIs to Plite primitives, preserve the
  existing Plate owner when that owner still describes the product concern, but
  do not preserve a legacy API shape merely for compatibility.
- Treat rename/new-plugin/new-wrapper suggestions as later Plate v2 closure
  unless the existing name is actively false or harmful for the current packet.
- In review-mode final answers, separate:
  - `best Plate v2 migration now`;
  - `Plite/Plate gap or blocker`;
  - `related Core sweep result`;
  - `do not do`.

Concrete correction:

- `OverridePlugin` is the main-code owner for plugin node override behavior.
  During review mode, do not suggest renaming it to a new concept.
- A helper like `installPlateElementSpecsExtension` sitting in a huge editor
  file is migration plumbing. Do not defend that placement as final taste.
  Prefer moving or extracting the Plite element-spec installation under the
  existing `OverridePlugin` owner or an adjacent `override/` internal helper,
  while keeping the `OverridePlugin` name/key unless the user asks for the
  later rename pass.
- The drift to cut is duplicate API wrapping, `any`, stale `getPluginByType`
  runtime lookup, or a special installer in the huge editor file. The review
  target is main-parity ownership plus Plite-native implementation.
- Examples of names to freeze during review mode even when they are not the
  eventual best name: `SlateExtensionPlugin`/`PliteExtensionPlugin`,
  `withScrolling`, `withPlate`, `withPlite`, `withStatic`, `withHOC`, and
  existing `T*` test filenames. Put later names in `pre-renaming.md`, not in the
  active behavioral diff.

## Gap Law

When the clean Plate v2 migration cannot be implemented without a missing
primitive, classify the blocker instead of patching around it:

- `Plite gap`: generic editor substrate is missing or too weak: reads,
  updates, transactions, schema, selection, ranges, paths, DOM runtime,
  extension install, history substrate, serialization, or proof harness.
- `Plate gap`: product composition is missing or too weak: plugin typing,
  plugin lifecycle, plugin API/tx extension, UI/default route, registry/docs,
  product command ergonomics, or Plate package ownership.

For each gap, name:

- exact missing API/capability;
- why a local bridge/helper would be a hack;
- smallest source owner to patch;
- focused proof command or test surface;
- whether the current one-by-one review should stop, patch the gap first, or
  defer with an explicit owner.

## Correction Sweep Law

Every correction creates a related-surface sweep. Do not fix one file and stop
while the same smell remains elsewhere in Core.

After any code/template/API correction:

1. Derive the sweep pattern from the exact correction: old symbol, deleted
   wrapper, bridge file, helper shape, plugin owner, Plite primitive, or type
   cast class.
2. Run focused `rg`/caller searches across `packages/core/src` and relevant
   `packages/core/type-tests`.
3. Review every match in the same class, not just the first one.
4. Apply the same correction when it is clearly safe.
5. If a match is not safe, add it to the plan as `defer-with-owner`,
   `Plite gap`, or `Plate gap` with proof needed.
6. Record the sweep query, match count, patched count, deferred count, and
   remaining risk before handoff.

This is narrower than a full Core sweep. It is mandatory after a correction,
even for one-by-one review.

## Extracted File Recovery Law

Review mode must inventory extracted files, not only modified files. Before
claiming a Core review pass is clean:

- Run an untracked-file inventory for the target scope, for example
  `git ls-files --others --exclude-standard packages/core | sort`.
- Treat every untracked Core/Plate source, spec, type-test, and config file as a
  required ledger row.
- For each row, compare against `origin/main` ownership before deciding. If the
  file already exists on `origin/main`, recover the old path/name/colocation
  first, even if the final Plate v2 name should be different later.
- Every extracted file must end in exactly one bucket:
  `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- New helper folders under an existing plugin are allowed only when that folder
  already exists in `origin/main` or the plan explains why the old owner no
  longer fits.
- Do not give a file or packet a `100` score while any extracted/untracked file
  in scope lacks a ledger row and a bucket.
- Put postponed naming taste in `docs/plans/pre-renaming.md`; do not leave
  Added/Deleted rename soup in the active review diff.

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
- Plate owns product composition: plugins, UI, registry, kits, product command
  ergonomics, docs/examples, and app-facing defaults.
- Core must not wrap Plite editor APIs under Plate names.
- Plate product APIs may compose Plite APIs, but they must not mirror Plite
  namespaces or create a second mutation/read layer.
- No public compat aliases, old Slate shims, or docs for old API names.
- Private bridges are allowed only with owner, deletion gate, and proof.
  They are not allowed to become a dumping ground for displaced product/plugin
  logic.
- If a helper exists only because the migration was hard, cut it.

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
- helpers in `packages/core` that are really generic node/range/selection/
  schema/runtime behavior.
- `any`/`unknown` casts hiding type loss from migration.
- explicit callback/helper types in tests that replace inference from
  `createBasePlugin`, `createBaseEditor`, plugin config, tx groups, or editor
  API calls.
- local JSX/editor fixture aliases in tests, especially `{ children; selection
  }` shapes that should come from `@platejs/test-utils`.
- duplicate Plate helpers around Plite APIs.
- docs/examples that teach legacy compatibility instead of latest state.

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
  `NodeIdPlugin` with insert-id normalization in the bridge is `<=45`;
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

## Full Core Sweep Law

When the target is broad Core review, use full-manifest mode:

- Enumerate every file under `packages/core/src/**/*.{ts,tsx,mts,cts}`.
- Include `packages/core/type-tests/**/*.{ts,tsx,mts,cts}` when public type
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
  - `5`: public API/runtime blocker; stop broad execution and route to
    `plate-plan` or the owning API plan.
- Score caps:
  - forbidden bridge hack: confidence score `0`;
  - direct import/install of forbidden bridge: confidence score `<=25`;
  - real owner file with behavior displaced into forbidden bridge: confidence
    score capped by the Bridge Scoring Law;
  - public API/type surface touched while a forbidden bridge remains:
    confidence score `<=75`.
- Score gate:
  - the autogoal plan's Core drift ledger must record the manifest command,
    expected row count, actual row count, missing/extra row count, and top drift
    rows before closure.
  - Any score `>=2` needs an owner, evidence, and next action.
  - Any score `>=4` cannot close as `keep-in-plate`; it must be fixed,
    hard-cut, moved, quarantined, or deferred with owner/proof.
  - The final handoff must list the top drift rows and next owner.

This rule exists because a targeted parser sweep missed
`packages/core/src/lib/plugins/affinity/AffinityPlugin.ts`. A future sweep must
prove it looked at that file and every peer, even when the first packet is
green.

## Loop

Use the dedicated Plate Next plan template unless a public API design fork
requires `plate-plan` first:

```bash
node .agents/skills/autogoal/scripts/create-goal-scratchpad.mjs \
  --template plate-next \
  --title "plate-next <surface>"
```

Checkpoint zero must copy the user's exact target, duration, non-goals, stop
rules, and final-handoff expectations into the plan.

Then loop:

1. Read `VISION.md`, `docs/vision/plate.md`, `docs/vision/common.md`, and the
   target source/tests/docs.
2. Build the right source map:
   - named file/API: public API, internal bridge, caller graph, tests,
     docs/examples, package exports, and related correction-sweep pattern;
   - broad Core sweep: full Core manifest plus drift ledger for every file.
3. Build the extracted-file inventory for the target scope and give every
   untracked/extracted file a bucket before scoring confidence.
4. Fill the review matrix for every relevant helper/API in the target. For
   broad Core sweep, every Core file gets a drift score before any closure
   claim.
5. In review mode, prefer `main-parity-cleanup` when the concept exists in
   `origin/main` and only the migrated implementation drifted.
6. If the next choice is a public API fork, route to `plate-plan` and stop
   implementation until the plan is accepted.
7. If the smell is source shape, route to `architecture-cleanup`.
8. If the decision is safe, implement the smallest cleanup packet.
9. After every correction, run the related Core sweep required by Correction
   Sweep Law and patch/defer all same-class matches.
10. Run focused proof: package typecheck/test/build when needed, plus `pnpm brl`
   if exports/barrels changed.
   - For Core-only targets, prefer `pnpm check:core` and Core-focused tests.
     Non-Core package failures are not blockers unless that package is named,
     touched, or the failure proves the Core API broke it.
11. Run source audits for removed legacy names.
12. For full Core sweep, close the autogoal template's drift-ledger score gate.
13. Keep/revert/quarantine the packet in the plan.
14. Pick the next packet. In timed mode, keep going until the minimum runtime
    elapsed, then finish or quarantine the active packet.

## Autopilot Priority

When no target is provided, inspect in this order:

1. Core public API/runtime files touched by the Plate migration.
2. `packages/core/src/react/editor/createPlateRuntimeEditor.ts`.
3. Core plugin API types and plugin resolver/installers.
4. Old Slate compatibility surfaces in Core/package exports.
5. Plate packages still importing or wrapping legacy substrate behavior.
6. Docs/examples teaching old APIs.
7. Tests with fake compatibility assertions instead of current behavior.

## Proof

For Core/Plite boundary cleanup, prefer:

```bash
pnpm check:core
pnpm turbo typecheck --filter=./packages/<touched-package>
pnpm --filter @platejs/<touched-package> test
pnpm --filter @platejs/<touched-package> build
```

Use focused tests first. Run broader gates only before closing a risky packet.
If a broader command reports errors in packages outside the named/touched
scope, do not fix them in Plate Next by default. Classify them as out-of-scope
package drift unless the failure is caused by the current Core/API change.
For broad Core sweeps, the Plate Next autogoal template owns the drift ledger,
manifest count, score gate, and top-drift handoff. Keep this template-only.

If a source audit is the proof, make it exact and small:

```bash
rg -n 'oldName|old\\.api|legacyHelper' packages/core/src packages/*/src --glob '!**/dist/**'
```

## Final Handoff

Report:

- target surface and mode;
- files/APIs reviewed;
- verdict matrix: main-parity-cleanup, move-to-plite, keep-in-plate, hard-cut,
  Plite gap, Plate gap, private-bridge, defer-with-owner;
- changes made;
- related Core sweep query, match count, patched count, deferred count;
- tests/proof commands;
- old compatibility names audited;
- Plite/Plate gaps or blockers;
- anything that still needs the user's taste review;
- next best Plate Next packet.
