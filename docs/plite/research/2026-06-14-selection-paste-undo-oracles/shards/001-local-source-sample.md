# Local Source Sample

## Scope

Sample nearby editor repos for paste, undo/redo, and selection synchronization
testing ideas. Treat source reads as leads only until converted to Plite-native
proof.

## Sources Sampled

- ProseMirror view clipboard, selection sync, and history selection tests.
- Lexical clipboard, history, beforeinput, HTML copy/paste, and selection
  mutation fixtures.
- Tiptap selection decoration and link paste helper.
- Plite current coverage for history, richtext paste, and paste-html import.
- Monaco wrapper files were sampled and rejected as no direct oracle evidence.

## Top Leads

- Same `text/html` and `text/plain` clipboard payloads should go through plain
  text insertion so active marks survive paste. This became P45 and was kept.
- Undo/redo selection restore/rebase is a strong invariant, but current Plite
  v2 history contracts already cover the exact class sampled here.
- DOM/model selection bidirectional sync remains a useful audit criterion for
  browser rows.
- Inverse selection mutation matrices are worth using when a specific mutation
  gap appears.

## Rejected Leads

- Monaco local files sampled here were wrappers around core features, not
  source-backed Plite oracle material.

## Promotions

- P45 kept `clipboard:same-html-plain-prefers-plain` with:
  - package contract for active marks in plain clipboard fallback;
  - richtext browser row for same-html/plain paste under active bold;
  - example handlers delegating wrapper-only HTML/plain payloads to the
    plain-text fallback.

## Next Query

- Next research should be narrower: either selection mutation matrix generation
  or beforeinput/targetRange oracle design. Do not open pagination from this
  shard.
