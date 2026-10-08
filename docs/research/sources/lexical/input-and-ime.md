# Lexical: input and ime

## Composition ownership

- Lexical models composition ownership explicitly: `$setCompositionKey()` stores the active composition node key and marks the old and new composition nodes writable when ownership changes; dirty-node transforms skip the active composition node; a composition-key change forces a synchronous flush; and text-node split and merge transfer composition ownership when the composing node moves. The inspected slices have no explicit tests for edits that overlap a composition. Source and historical source slices: `docs/plite/research/2026-06-12-ime-overlap-policy/sources/lexical-summary.md:1-15`. Limit: unpinned local checkout read on 2026-06-12.
