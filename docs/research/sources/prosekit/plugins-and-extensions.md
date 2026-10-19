# ProseKit: plugins and extensions

## Handler registration and order

- **Handler order.** In `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/core/src/extensions`, `events/dom-event.spec.ts`, `events/focus.spec.ts` and `keymap.spec.ts` pin that a DOM event handler added with `editor.use` to a mounted editor receives events at once and stops once disposed, that a focus-change handler fires once per real focus change however often `focus()` or `blur()` repeats, and that keymaps call the highest-priority handler first. Plate resolves plugins when the editor is created and publishes one frozen shortcut table in deterministic order (`packages/platejs/src/react/utils/shortcuts.spec.tsx`); `packages/platejs/src/react/utils/dispatchPlateShortcut.spec.ts` pins priority order and the fall-through when a higher-priority handler declines. A search of `packages/platejs/src` and `packages/plitejs/src` found no API that registers a plugin or handler on a live editor on 2026-10-08 (inferred from that search) (`docs/editor-test-harvester/prosekit/report.md:136`).

## Extension composition

- **Typed composition.** The specs under `editor`, `facets` and `extensions` in `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/core/src` pin builder, union, facet, schema and priority composition: extensions expose stable typed contributions with deterministic ownership. Plite has no facet system to compare: commit e0c1500b95 (2026-09-15) deleted its facet module and facet contracts. Plate composes plugins when it resolves them, and `packages/platejs/src/internal/plugin/resolvePlugins.spec.tsx` pins application order, dependencies installed once, and refusal of dependency cycles and conflicting same-name roots (`docs/editor-test-harvester/prosekit/report.md:148`).

## Headless UI

- **Headless UI.** `prosekit/prosekit@3fbfe7906c3448328e80c1c1333647d08e50907e:packages/web/src` and ProseKit's framework packages test autocomplete helpers, resize math, anchors and reactive adapters. In each, headless UI state and geometry stay framework adapters over the selection and document state the editor owns. Plate's own UI owns these surfaces, and ProseKit serves as API prior art (`docs/editor-test-harvester/prosekit/report.md:150`).
