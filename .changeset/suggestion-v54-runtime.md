---
"@platejs/suggestion": major
---

Export `BaseSuggestionPluginState` and `SuggestionPluginState` as the complete
mutable state contracts for the headless and React suggestion descriptors.

Move suggestion queries and mutations to `BaseSuggestionPlugin` and the
installed editor API, and register suggestion marks and metadata in compiled
schemas with versioned inline validation.

**Migration:** Read pure value helpers from `editor.api.suggestion`, snapshot
queries from `editor.read.suggestion`, and mutations from
`editor.update.suggestion`:

```tsx
const identity = editor.api.suggestion.createIdentity();
const fragment = editor.api.suggestion.createFragment(input, identity);
const nextValue = editor
  .plugin(BaseSuggestionPlugin)
  .api.diff(previousValue, value);
const entries = editor.read.suggestion.nodes();

editor.update.suggestion.accept(description);
editor.update.suggestion.reject(description);
editor.update.suggestion.setNodes(options);
```

Use `SuggestionUpdatePolicy.skip` for updates that bypass suggestion tracking
and `SUGGESTION_TRANSIENT_KEY` for transient metadata. Remove `withSuggestion`,
`diffToSuggestions`, and standalone suggestion query, transform, and utility
imports.
