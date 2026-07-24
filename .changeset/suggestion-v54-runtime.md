---
"@platejs/suggestion": major
---

Move suggestion queries and mutations to `BaseSuggestionPlugin` and the
installed editor API, and register suggestion marks and metadata in compiled
schemas with versioned inline validation.

**Migration:** Read suggestion data and helpers from
`editor.plugin(BaseSuggestionPlugin).api`. Replace standalone suggestion
transforms with `editor.update.suggestion`:

```tsx
editor.update.suggestion.accept(description);
editor.update.suggestion.reject(description);
editor.update.suggestion.setNodes(options);
```

Use `SuggestionUpdatePolicy.skip` for updates that bypass suggestion tracking
and `SUGGESTION_TRANSIENT_KEY` for transient metadata. Remove `withSuggestion`
and standalone suggestion query, transform, and utility imports.
