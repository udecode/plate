# Public exports and package boundaries

Page: https://claude.ai/artifact/BSNn3ZMB8v9PG9KQf351Gi

The two distributions and what each one's public entrypoints expose. `plitejs` is the raw editor that proof apps import, and `platejs` is the product framework that Plate apps install. The ledger asks which independently consumed entrypoints justify their distribution boundary, and which facades or optional-dependency boundaries can disappear. Three earlier changes landed: the entrypoint categories and optional-peer subpaths (2026-08-28), facade dogfooding, so only exact bridge modules in `packages/platejs` import `plitejs` (2026-08-30), and the hidden `getCorePlugins` helper (2026-09-12 review, commit `e0c1500b95`). Both 2026-08 executions were recovered on 2026-09-18 with historical, unbound proof. The 2026-10-04 audit's Pursue was built on 2026-10-06 in `docs/plans/2026-10-05-distribution-review.md`. Framework hooks and carrier types live only on `plitejs/internal`, which shares no binding with any public entrypoint, and a guard in `pnpm check` fails when one leaks back. Its decision page is `docs/research/decisions/plate-core-ownership.md`.

## Public API

A Plate app imports from `platejs`.

```ts
// content/docs/(guides)/document-model.mdx
import { ElementApi, NodeApi } from 'platejs';
```

A raw proof app imports from `plitejs`.

```ts
// apps/www/src/app/(app)/examples/plite/_examples/authored-changes.tsx
import { defineEditorSchema, property, schema } from 'plitejs';
```

Plate's facade takes framework hooks from the bridge, so the same names do not resolve from `platejs` in apps.

```ts
// packages/platejs/src/facade.ts
export {
  isPlugin as isRuntimePlugin,
  MAIN_ROOT_KEY,
  repairEditorValue,
  setEditorTransactionViewTransform,
} from 'plitejs/internal';
```

Plate's render pipes take both renderer capability setters from `plitejs/react`.

```ts
// packages/platejs/src/react/utils/pipeRenderLeaf.internal.tsx
import {
  setDOMTextSyncRendererCapability,
  setRetainedTextFlowRendererCapability,
} from '../plite-react';
```

## What other editors do

Read from source at Lexical `dd5c41b13`, prosemirror-view `ca4c78e`, prosemirror-state `ffad5d9` and prosemirror-model `6264de0`, Tiptap `91c51be53`, Slate `945a484df`, and codemirror-view `fbff59b` and codemirror-state `9c80127`. None was built or run. No editor ships a separate internal subpath. Only Slate's core package keeps its internal state off its root. In the others an app can reach the internals from a public root at runtime, and the editors differ in whether the published declarations hide them.

| Editor | How its own packages reach internals | App can import them from the root | Declarations hide them |
| --- | --- | --- | --- |
| Lexical | From the `lexical` root; internal fields are underscore-prefixed and some root functions carry `@internal`, such as `getRegisteredNodeOrThrow` | Yes, with full types | No; `@internal` only drops items from the docs site |
| ProseMirror | `@internal` members stay on runtime objects, and sibling packages reach them through `as any`; test hooks are `__`-prefixed root exports | Yes at runtime | Yes; its build compiles with `stripInternal` |
| Tiptap | No internal tier; core re-exports every module, and `@tiptap/pm/view` is `export * from 'prosemirror-view'` | Yes, everything | No own internals to hide; the ProseMirror types are already stripped |
| Slate | `slate-dom` exports its internal WeakMaps, such as `EDITOR_TO_ELEMENT`, from its root for `slate-react`; core `slate` keeps its maps off its root | `slate-dom` maps yes; core maps no | No |
| CodeMirror 6 | The view uses only public `@codemirror/state` names; its root exports an `@internal` test object | Yes at runtime | Yes; `stripInternal` |

With the tagged `plitejs` values behind `plitejs/internal`, Plite is stricter than any of these. Tiptap's `@tiptap/pm` has the same shape as `platejs` over `plitejs`: an `export *` of a core root passes along whatever that root exports.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| Framework hooks live only on the bridge | Plite | `plitejs/internal` (`packages/plitejs/src/internal/index.ts`, DAG node `internal`, depends on `root`) | Two npm packages share Plite's module state only through one published channel |
| Both renderer capability setters, their keys and their readers get one owner | Plite | `plitejs/react`, `packages/plitejs/src/react/dom-text-sync.ts` | Raw renderers use both setters (`cross-editor-adapters.mjs:57,76-78`, `react-text-flow-browser-matrix.mjs:62-68`), and Plate already imports `plitejs/react` from `react-core` |
| Plate imports hooks only from the bridge | Plate | `platejs` `core` partition (`packages/platejs/src/facade.ts`, which the DAG lets import `plitejs/internal`) | The facade is the exact bridge leaf `VISION.md:45` allows |
| The bridge guard | Tooling | `tooling/scripts/check-plite-bridge.mjs` on `@typescript/typescript6`, its own `plite-bridge` step in `tooling/scripts/check.mjs` | The TypeScript 6 checker resolves export stars, aliases and declaration tags exactly; the census on it runs in about 1.3 seconds over both packages |

## Main changes

- `packages/plitejs/package.json` and `packages/platejs/package.json` own the export maps. `plitejs` ships the root, `./internal` and its DOM, React, history, collaboration and other subpaths; `platejs` ships the root and one subpath per feature and framework layer.
- `packages/platejs/src/core.tsx:3` re-exports the whole `plitejs` root, and `tooling/scripts/check-plite-release-artifacts.mjs` fails a packed release whose `platejs` root does not mirror the `plitejs` root.
- `packages/platejs/src/facade.ts` is the bridge module. It imports public names from `plitejs`, and framework hooks, private carriers and document-shape readers from `plitejs/internal`.
- `packages/plitejs/src/internal/index.ts` is the first-party bridge subpath.
- `tooling/entrypoints/entrypoint-dag.mjs` says which entrypoint may import which.
- `apps/www/api-reference.config.json` excludes internal symbols from the generated API reference.
- `plitejs/internal` exports only framework hooks and private carriers, and shares no runtime value (Phase 2) and then no type (Phase 3) with any public `plitejs` or `platejs` entrypoint.
- Every name removed from a public entrypoint carries `@internal` at its declaration, so the guard's tag rule catches a later re-export even when the name is module-only.
- `resolveEntrypointEdge` in `tooling/entrypoints/entrypoint-dag.mjs` resolves a relative import to its file before classifying it, so `'../../internal'` counts as the bridge, not the root (probe P5).
- `packages/plitejs/src/react/dom-text-sync.ts` owns both renderer capability keys, both setters and both readers; Plate's copy in `retainedTextFlowRenderer.internal.ts` is deleted.
- `packages/plitejs/src/react/internal/index.ts`, a barrel with no entry, export or importer, is deleted. The `react/internal` entry in `apps/plite/next.config.ts`'s shared alias list stays, because it also serves `platejs/react/internal`.
- `tooling/scripts/check-plite-bridge.mjs` runs as the `plite-bridge` step of `pnpm check` on the TypeScript 6 checker. It fails when a public entrypoint exports a bridge binding or a binding tagged `@internal`, or when an export-map branch has no source owner.
- `tooling/scripts/check-declaration-consumer.mjs` runs in `plite:public-types`. It emits declarations for inferred `platejs` and `plitejs` exports in a scratch app, fails when one names `plitejs/internal`, and keeps the TS2883 findings in a shrink-only baseline, `tooling/entrypoints/declaration-consumer-baseline.json`.

## Open work

- Whether `useClaimEditableDOMCommit` is a raw-renderer author contract or a bridge hook. Next probe: a raw `renderElement` that reads an external store, with and without the claim. owner: zbeyens, tracked here. stop: the raw `renderElement` probe decides it.
- The guard covers only Plite's bridge, so a Plate-only hook on a `platejs` entrypoint passes. owner: zbeyens, tracked here. stop: a Plate-side guard lands, or a review accepts the hole.
- `apps/www/api-reference.config.json` gives one exclude reason per entrypoint, so it cannot tell an author contract without a page from a framework hook; a reason per symbol would close the guard's remaining hole for new untagged hooks. owner: zbeyens, tracked here. stop: the config takes a reason per symbol.
- Whether `getEditorRuntimeOwner` and `setEditorReadOnly` should become editor members, per `docs/vision/plite.md:242-246`. `useModelEditor()` is not a drop-in replacement for `getEditorRuntimeOwner(useEditor())`: the first reads the nearest provider (`packages/platejs/src/react/stores/plate/useEditor.ts:36`), the second resolves runtime ownership (`packages/plitejs/src/core/editor-runtime.ts:233`). owner: zbeyens, route `best-api`, tracked here. stop: a `best-api` verdict on both helpers.
- `compileEditorSchemaContract` takes the private `AnyEditor` type (`packages/plitejs/src/create-editor.ts:367-370`), so its public signature names a carrier. owner: zbeyens, tracked here. stop: its signature names only public types.
- An app cannot emit declarations for an inferred `platejs` editor, plugin, command or schema: TypeScript reports TS2883 because `platejs` bundles Plite's types into private chunks. `tooling/entrypoints/declaration-consumer-baseline.json` lists the 8 current findings and only shrinks. owner: zbeyens, tracked here. stop: the baseline is empty.
- The guard does not follow `const` aliases, type aliases or interface extension, so those republish a hook as a new binding. owner: zbeyens, tracked here. stop: the guard follows aliases, or a review accepts the hole.
- `tooling/entrypoints/declaration-consumer-baseline.json` accepts a hand edit; moving it onto `tooling/scripts/finding-baseline.mjs` bounds it by the base commit. owner: zbeyens, tracked here. stop: the consumer baseline runs through `finding-baseline.mjs`.
- Plite tests import testing helpers and bridge hooks from two barrels; importing their owning modules would decouple them. owner: zbeyens, tracked here. stop: the tests import owning modules, or a review keeps the barrels.
- The DAG's directory condition prefers `x/index` over a same-named `x` file, unlike TypeScript; no live import hits it. owner: zbeyens, tracked here. stop: the DAG matches TypeScript's order, or a live import needs the current one.
- `check-plate-schema-adoption.mjs:5394` looks for `packages/platejs/src/index.ts`, but the root is `index.tsx`, so that rule never fires. owner: zbeyens, tracked in `docs/plans/topics/correct.md` Open work. stop: the rule reads the real root file.
- The four shared-source reflect lessons wait as `docs/plans/artifacts/2026-10-05-distribution-review/dotai-reflect-lessons.patch` for the owner's dotai commit; until it lands and syncs, the Autopilot, Long runs, Panel review and plan-page shape changes hold only in that patch, and their smokes have not run. owner: zbeyens, tracked here. stop: the patch lands in dotai and syncs here, or you drop it.
- The nine reflect backlog mechanisms listed under the Close of `docs/plans/2026-10-05-distribution-review.md`. owner: zbeyens, tracked here. stop: each mechanism lands or you drop it.
- Older `plitejs` changesets, such as `.changeset/plite-commit-subscription.md`, announce removals of names no published `plitejs` had, since `plitejs` is published only as a 0.0.1 placeholder. owner: zbeyens, route `changeset`, tracked here. stop: the `changeset` skill rewrites or keeps each one.
