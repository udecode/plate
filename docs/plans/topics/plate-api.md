# Plate plugin API

The ledger asks how a Plate plugin relates to Plite's installed extension and which lookup callers use. The 2026-10-04 audit stopped. One shared nominal descriptor sits behind `editor.plugin` and `tx.plugin` over Plite's installed owner, and `YjsPlugin.create`, `.require` and `.map` replaced the handwritten factories. Every stronger deletion or replacement lane still loses to that design. `node tooling/scripts/review-ledger.mjs show plate-api` prints the scope's history.

## Public API

A plugin that needs app resources is a frozen factory; each `.create()` returns one fresh descriptor with its own resource closure.

```ts
const Yjs = YjsPlugin.create({ doc, initialReady: true });

export const CollaborationPlugin = YjsPlugin.require('awareness').map(
  ({ api, editor }) => ({
    decorate: collaborationCursorDecoration({ api, editor }),
  })
);
```

Reusable transaction code selects a plugin group by descriptor, or by name when importing the descriptor would add the wrong package dependency.

```tsx
// apps/www/src/registry/components/editor/block-menu.tsx
editor.update((tx) => {
  if (!tx.blocks.reset({ unset: ['level'] })) return;
  if (editor.plugin(BaseListPlugin).installed) {
    tx.plugin(BaseListPlugin).clear();
  }
});
```

## Layer and owner

```text
Plite definePlugin ─────────┐
                            ├─ one nominal PluginReference
Plate definePlugin ─────────┘
              ↓ Plate-only product compilation when applicable
private compiled entry + original descriptor + source ancestors
              ↓ Plite candidate publication
separate installed record and editor.plugin(Descriptor)
```

| Responsibility | Decision |
| --- | --- |
| Plite | Descriptor nominality, dependency and conflict admission, source ancestry, installed records, atomic publication and rollback, and editor and view portal liveness. |
| Plate | Terminal configuration, ordered prior-stage inference, schema, stores, codecs, shortcuts, rendering and lifecycle compilation, reached through `plitejs/internal`. |
| Types | A lazy owner-supplied capability provider on the shared reference; Plite extracts its return type and never knows Plate's product fields. |
| `tx.plugin(pluginOrName)` | Selects the already-materialized group on the current transaction; a literal name keeps its inference, a widened name returns `unknown`, and an uninstalled name or one without transaction methods is refused. Generated editors keep direct `tx[Plugin.name]` groups. |
| React authoring | Mounted-view attributes, DOM handlers and root slots stay at the React entrypoint. |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Moving Plate's authoring compiler into Plite | Raw consumers never needed prior-stage inference, terminal configuration or editor-local stores; Plite's Vision rejects an extension `config` channel. |
| Deleting Plate lowering | Product declarations still compile into Plite capabilities. |
| Renaming `extension` to `plugin` on the old machinery | Cosmetic until shared identity removed the synthetic stage references, the alias graph and the `extensionByName` remap. |
| An unrestricted `plugin` alias, or a second Plate installation authority | Two spellings for one projection, or a second installed truth. |
| Required resources on `.configure()` or `.extend()` | One verb with two jobs across 185 consumer overrides, or authoring mixed with resource construction. |
| A definition-plus-install tuple for every plugin | Taxes static plugins to replace a constructor. |
| Splitting Yjs into base, presence and compaction plugins | One binding and cleanup lifetime would gain cross-plugin coordination. |
| Plugin options on `createEditor` | Relocates construction and hurts discoverability. |
| Importing `plugins.generated.ts` or an app-wide transaction union into reusable registry code | Couples copied source to one application or adds a second type owner. |

## What other editors do

Not compared in this scope; the [editor comparison](editor-comparison.md) holds the cross-editor reads.

## Main changes

- Raw Plite, headless Plate and React Plate publish one frozen descriptor family through one installed portal; synthetic stage extensions, `registerEditorExtensionAlias`, `extensionByName` and the portal adapter are deleted. Across 1 to 512 plugins, Plate and raw runtime p50 ratios were at most 0.846 of baseline, and type check, instantiation and memory stayed within budget.

## Open work

- The shared-identity proof ran one Chromium mounted-view replay; a cross-browser matrix and third-party app migration are unproven. owner: zbeyens. stop: the next `plate-api` review.
