# @udecode/plate-suggestion

## 48.0.0

## 46.0.1

### Patch Changes

- [#4124](https://github.com/udecode/plate/pull/4124) by [@felixfeng33](https://github.com/felixfeng33) – Fix `diffToSuggestions` to adapt to the new suggestion structure.

## 45.0.3

### Patch Changes

- [#4101](https://github.com/udecode/plate/pull/4101) by [@felixfeng33](https://github.com/felixfeng33) – Fix suggestion `api.node` when pass id.

## 45.0.0

### Major Changes

- [#4064](https://github.com/udecode/plate/pull/4064) by [@felixfeng33](https://github.com/felixfeng33) – Note: This plugin is currently in an experimental phase and breaking changes may be introduced without a major version bump.

  - Add Suggestion UI
  - Remove: `findSuggestionNode` use `findSuggestionProps.ts` instead
  - Remove `addSuggestionMark.ts`
  - Remove `useHooksSuggestion.ts` as we've updated the activeId logic to no longer depend on useEditorSelector

## 44.0.2

## 44.0.0

## 43.0.0

## 42.2.4

### Patch Changes

- [#4012](https://github.com/udecode/plate/pull/4012) by [@zbeyens](https://github.com/zbeyens) – Fix overrideEditor insertText missing options

## 42.0.0

## 41.0.0

## 40.2.8

### Patch Changes

- [#3819](https://github.com/udecode/plate/pull/3819) by [@LunaticMuch](https://github.com/LunaticMuch) – Added license to package.json

## 40.0.0

## 39.0.0

## 38.0.1

### Patch Changes

- [#3526](https://github.com/udecode/plate/pull/3526) by [@zbeyens](https://github.com/zbeyens) – Prefix base plugin with `Base`

## 38.0.0

## 37.0.0

### Major Changes

- [#3420](https://github.com/udecode/plate/pull/3420) by [@zbeyens](https://github.com/zbeyens) –
  - `createSuggestionPlugin` -> `SuggestionPlugin`
  - Move `suggestionStore` to `SuggestionPlugin`
  - Remove `SuggestionProvider` and its hooks
  - Remove `useSuggestionStates` (replaced by direct option access)
  - Remove `useSuggestionSelectors` (replaced by option selectors)
  - Remove `useSuggestionActions` (replaced by api methods)
  - Replace `useUpdateSuggestion` with `api.suggestion.updateSuggestion`
  - Replace `useAddSuggestion` with `api.suggestion.addSuggestion`
  - Replace `useRemoveSuggestion` with `api.suggestion.removeSuggestion`
  - Replace `useSuggestionById` with `options.suggestionById`
  - Replace `useSuggestionUserById` with `options.suggestionUserById`
  - Replace `useCurrentSuggestionUser` with `options.currentSuggestionUser`
  - Remove `editor.activeSuggestionId`, use plugin option
  - Remove `useSetIsSuggesting`, use `editor.setOption`
  - Remove `useSetActiveSuggestionId`, use `editor.setOption`
  - Remove `editor.isSuggesting`, use plugin option
  - Remove `SuggestionEditorProps` type

## 36.0.0

## 35.3.1

## 34.0.0

## 33.0.2

### Patch Changes

- [#3187](https://github.com/udecode/plate/pull/3187) by [@zbeyens](https://github.com/zbeyens) – Fix types

## 33.0.0

## 32.0.0

## 31.0.0

## 30.9.0

## 30.8.0

## 30.6.1

## 30.6.0

## 30.5.3

### Patch Changes

- [`4cbed7159`](https://github.com/udecode/plate/commit/4cbed7159d51f7427051686e45bcf2a8899aeede) by [@zbeyens](https://github.com/zbeyens) – Move `@udecode/plate-common` to peerDeps to fix a bug when multiple instances were installed

## 30.5.2

## 30.5.0

### Minor Changes

- [#2945](https://github.com/udecode/plate/pull/2945) by [@12joan](https://github.com/12joan) – Refactor `slateDiff` into `@udecode/plate-diff` and add `diffToSuggestions` instead

## 30.4.5

## 30.4.3

### Patch Changes

- [#2935](https://github.com/udecode/plate/pull/2935) by [@zbeyens](https://github.com/zbeyens) – fix lodash import

## 30.4.2

### Patch Changes

- [#2933](https://github.com/udecode/plate/pull/2933) by [@zbeyens](https://github.com/zbeyens) – fix slateTextDiff

## 30.4.1

### Patch Changes

- [#2930](https://github.com/udecode/plate/pull/2930) by [@zbeyens](https://github.com/zbeyens) – fork diff-match-patch to fix ESM import

## 30.4.0

### Minor Changes

- [#2900](https://github.com/udecode/plate/pull/2900) by [@zbeyens](https://github.com/zbeyens) – slate-diff

## 30.1.2

## 30.0.0

## 29.1.0

## 29.0.1

## 29.0.0

## 28.0.0

## 27.0.3

## 27.0.0

### Patch Changes

- [#2763](https://github.com/udecode/plate/pull/2763) by [@12joan](https://github.com/12joan) –
  - Migrate store to jotai@2

## 25.0.1

## 25.0.0

## 24.5.2

## 24.4.0

### Minor Changes

- [#2675](https://github.com/udecode/plate/pull/2675) by [@zbeyens](https://github.com/zbeyens) – Support slate-react 0.99.0

## 24.3.6

## 24.3.5

## 24.3.2

## 24.3.1

## 24.3.0

## 24.2.0

## 24.0.2

## 24.0.1

## 24.0.0

## 23.7.4

## 23.7.0

## 23.6.0

## 23.3.1

## 23.3.0

## 22.0.2

## 22.0.1

## 22.0.0

## 21.5.0

## 21.4.2

## 21.4.1

## 21.3.2

## 21.3.1

### Patch Changes

- [#2412](https://github.com/udecode/plate/pull/2412) by [@zbeyens](https://github.com/zbeyens) – 🐛 fix imports

## 21.3.0

### Minor Changes

- [#2410](https://github.com/udecode/plate/pull/2410) by [@zbeyens](https://github.com/zbeyens) – ✨ Suggestion plugin

## 21.1.5

## 21.0.0

## 20.7.2

## 20.7.0

## 20.4.0
