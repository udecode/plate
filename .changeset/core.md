---
'@udecode/plate-core': major
---

- Upgraded to `zustand-x@6`
  - `eventEditorSelectors` -> `EventEditorStore.get`
  - `eventEditorActions` -> `EventEditorStore.set`
  - `useEventEditorSelectors` -> `useEventEditorValue(key)`
- Upgraded to `jotai-x@2`
  - `usePlateEditorStore` -> `usePlateStore`
  - `usePlateActions` -> `usePlateSet`
  - Remove `editor.setPlateState`, use `usePlateSet` instead
  - `usePlateSelectors` -> `usePlateValue`
  - `usePlateStates` -> `usePlateState`
- Moving plugin options hooks into standalone hooks to be compatible with React Compiler
  - `editor.useOption`, `ctx.useOption` -> `usePluginOption(plugin, key, ...args)`
  - `editor.useOptions`, `ctx.useOptions` -> `usePluginOption(plugin, 'state')`
  - New hook `usePluginOptions(plugin, selector)` to select plugin options (Zustand way).
- We were supporting adding selectors to plugins using `extendOptions`. Those were mixed up with the options state, leading to potential conflicts and confusion.
  - The plugin method is renamed to `extendSelectors`
  - Selectors are now internally stored in `plugin.selectors` instead of `plugin.options`, but this does not change how you access those: using `editor.getOption(plugin, 'selectorName')`, `ctx.getOption('selectorName')` or above hooks.
  - Selector types are no longer in the 2nd generic type of `PluginConfig`, we're adding a 5th generic type for it.

```ts
// Before:
export type BlockSelectionConfig = PluginConfig<
  'blockSelection',
  { selectedIds?: Set<string>; } & BlockSelectionSelectors,
>;

// After:
export type BlockSelectionConfig = PluginConfig<
  'blockSelection',
  { selectedIds?: Set<string>; },
  {}, // API
  {}, // Transforms
  BlockSelectionSelectors, // Selectors
}>
```
