---
'platejs': major
---

Require React and React DOM 19.2 or newer.

Ignore schema-declared metadata properties when computing suggestion diffs, including configured persisted element-ID keys.

Export `BaseSuggestionPluginState` as the mutable state contract for suggestion tracking and review.

Move suggestion queries and mutations to `BaseSuggestionPlugin` and the installed editor API, and register suggestion marks and metadata in compiled schemas with versioned inline validation. Infer `nodes()` and `nodeEntries()` results as descendant entries rather than exposing the editor root through the broad `Node` union.

Let suggestion leaf components inspect suggestion metadata without receiving the underlying text string.

**Migration:** Read pure value helpers from `editor.api.suggestion`, snapshot queries from `editor.read.suggestion`, and mutations from `editor.update.suggestion`:

```tsx
const identity = editor.api.suggestion.createIdentity();
const fragment = editor.api.suggestion.createFragment(input, identity);
const nextValue = editor
  .plugin(BaseSuggestionPlugin)
  .api.diff(previousValue, value);
const reviews = editor.read.suggestion.reviews();

editor.update.suggestion.accept(reviewId);
editor.update.suggestion.reject(reviewId);
editor.update.suggestion.setNodes(options);
```

Use `SuggestionUpdatePolicy.skip` for updates that bypass suggestion tracking and `SUGGESTION_TRANSIENT_KEY` for transient metadata. Remove `withSuggestion`, `diffToSuggestions`, and standalone suggestion query, transform, and utility imports.

Subscribe to current review groups with `useSuggestionReviews()`. Accept and reject resolve the selected ID against the current document, preserving overlapping changes. Copied review cards own labels, date formatting, and active-card state.
