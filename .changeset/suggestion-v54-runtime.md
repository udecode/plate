---
"@platejs/suggestion": major
---

Move suggestion queries and mutations to Plite reads, transactions, and update policies.

**Migration:** Read suggestion data from `editor.plugin(BaseSuggestionPlugin).api`. Use `SuggestionUpdatePolicy.skip` for updates that bypass suggestion tracking.
