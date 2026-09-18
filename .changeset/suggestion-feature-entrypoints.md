---
'platejs': patch
---

Add `BaseSuggestionPlugin` at `platejs/suggestion` and `SuggestionPlugin`, `useSuggestionMode`, `useSuggestionChanges`, and `useActiveSuggestion` at `platejs/suggestion/react` for reusable suggestion behavior.

Configure each mounted editor's suggestion intent and projection with `EditorRoot authored`, while loading saved proposals through the complete document value.

Keep pending suggestions and review controls visible when `SuggestionPlugin` switches subsequent input between suggesting and editing.
