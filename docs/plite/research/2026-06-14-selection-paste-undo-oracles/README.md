# Selection Paste Undo Oracles

## Question

What editor testing patterns from nearby OSS editors should Plite import as
Plite-native proof for paste, undo/redo, and selection synchronization?

## Scope

- Local source only for code-level claims.
- Repos sampled: Plite upstream, ProseMirror, Lexical, Tiptap, Monaco.
- Explicit exclusions: copyrighted code.
- Promotion target: Playwright or `plite-browser` test/oracle packets first;
  benchmark or plan packets only if the source evidence demands it.

## Stop Rule

Stop this shard after one bounded source sample per repo family plus one scored
lead table. Promote only leads that can become a focused Plite-native command.

## Current Verdict

Complete first shard. The strongest portable invariant came from clipboard
handling: when `text/html` carries only the same plain text payload, treat the
paste as plain text so collapsed active formatting survives. Plite had a
package fallback path but missed active marks in the transaction-level
clipboard fallback, and the richtext HTML handler had an exact-match guard that
missed browser-normalized wrapper HTML.

Promoted and kept in P45:

- `plite-dom` plain-text clipboard fallback applies collapsed active marks.
- Richtext/paste-html examples delegate wrapper-only HTML/plain payloads to the
  plain-text fallback.
- New package and Playwright regressions cover the invariant.

Other sampled leads are useful but either already covered by existing Plite
tests or closed by later focused packets.

Later closure:

- `selection:inverse-mutation-matrix` was promoted and kept in P48. P115
  refreshed the focused proof so this artifact no longer presents it as an open
  candidate.
