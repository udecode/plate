---
"@platejs/suggestion": major
---

Move suggestion queries and mutations to Plite reads, transactions, and update
policies, and register suggestion marks and metadata in compiled schemas.

**Migration:** Read suggestion data from `editor.plugin(BaseSuggestionPlugin).api`. Use `SuggestionUpdatePolicy.skip` for updates that bypass suggestion tracking.
