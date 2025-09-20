---
"@platejs/suggestion": minor
---

- Add `SkipSuggestionDeletes` utility to extract text while excluding removed suggestions
- Add transient suggestions support with `getTransientSuggestionKey` and filtering options
- Unify adjacent insert/remove suggestion IDs for better UI handling
- Improve `acceptSuggestion` to support inline elements like links
- Add `transient` parameter to `getSuggestionProps` and `suggestion.nodes()` APIs