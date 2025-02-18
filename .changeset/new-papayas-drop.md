---
'@udecode/plate-suggestion': major
---

Note: This plugin is currently in an experimental phase and breaking changes may be introduced without a major version bump.

- Add Suggestion UI
- Remove: `findSuggestionNode` use `findSuggestionProps.ts` instead
- Remove `addSuggestionMark.ts`
- Remove `useHooksSuggestion.ts` as we've updated the activeId logic to no longer depend on useEditorSelector
