# Lexical Summary

Lexical does not provide the same explicit overlap-policy rows in the inspected
slices, but its implementation makes composition ownership first-class:

- `$setCompositionKey()` stores the active composition node key and marks old
  and new composition nodes writable when ownership changes
  (`../lexical/packages/lexical/src/LexicalUtils.ts:487-514`).
- Dirty-node transforms skip the active composition node
  (`../lexical/packages/lexical/src/LexicalUpdates.ts:198-330`).
- A composition key change forces synchronous flush
  (`../lexical/packages/lexical/src/LexicalUpdates.ts:965-986`).
- Text node splitting and merging transfer composition ownership when a
  composing node moves
  (`../lexical/packages/lexical/src/nodes/LexicalTextNode.ts:840-1145`).

Plite pressure:

Do not treat native composition as loose event noise. Model active composition
ownership explicitly enough that overlapping edits can cancel it and stale
native end events can be ignored safely.

