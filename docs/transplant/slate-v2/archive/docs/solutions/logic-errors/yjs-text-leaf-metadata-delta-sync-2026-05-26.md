---
title: Reconcile Yjs text deltas with Slate leaf metadata
date: 2026-05-26
last_updated: 2026-05-29
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - Concurrent offline mark edits disappear after reconnect.
  - Mark removals can be undone by stale slate:text-leaves metadata.
  - Versioned same-text split and merge documents can reload removed marks.
  - Older metadata-only documents lose marks during later text edits.
  - Null-valued Slate text attributes fail a Yjs round trip.
  - Formatted Yjs text can import as XML-like markup instead of plain Slate text.
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-yjs, yjs, text-leaves, delta-attributes, reconnect]
---

# Reconcile Yjs text deltas with Slate leaf metadata

## Problem
`@slate/yjs` stores text formatting in two places: Yjs `XmlText` delta
attributes and `slate:text-leaves` metadata. Reconnect merges need to trust live
Yjs delta attributes for concurrent edits while still using metadata for Slate
leaf boundaries and older documents.

## Symptoms
- One peer adds `bold` while another adds `italic`; reconnect can keep only one
  mark.
- One peer removes a mark while another adds a mark; stale metadata can bring
  the removed mark back.
- Split and merge operations with unchanged text can update metadata without
  updating Yjs delta attributes.
- Versionless metadata-only documents can lose formatting when later operations
  read the text through the delta-only path.
- Versioned documents saved by same-text split or merge operations can keep a
  uniform Yjs delta while metadata holds the only record of a mark removal.
- Slate text attributes with value `null` are present in metadata but absent
  from `XmlText.toDelta()`, so reads must preserve them explicitly.

## What Didn't Work
- Reading `slate:text-leaves` wholesale preserves legacy boundaries, but it
  ignores concurrent Yjs mark merges and removals.
- Reading only `XmlText.toDelta()` preserves concurrent mark edits, but it
  collapses Slate leaf boundaries and drops metadata-only legacy marks.
- Treating all metadata as fallback in versioned documents reintroduces stale
  marks after a remote Yjs format operation removes or changes them.
- Treating Yjs delta omission as always authoritative drops valid Slate
  attributes whose value is `null`.

## Solution
Read text leaves by comparing metadata ranges with current Yjs delta spans:

```ts
const readOptions = getYjsTextReadOptions(sharedRoot)
const leaves = readYjsText(sharedText, readOptions)
```

For versioned roots, use metadata as the boundary map and prefer delta
attributes for formatting. Metadata falls back only where Yjs has no value for a
key it cannot represent, such as a `null` Slate attribute, or where a uniform
delta key spans metadata entries that explicitly split that key and every
present metadata value agrees with the delta value:

```ts
const getNullMetadataFallbackAttributes = (
  metadataAttributes: Record<string, unknown>,
  deltaAttributes: Record<string, unknown>
) =>
  Object.fromEntries(
    Object.entries(metadataAttributes).filter(
      ([key, value]) => value === null && !hasOwn(deltaAttributes, key)
    )
  )
```

For versionless legacy roots, pass read options through split, merge, remove,
move, clone, and child-index helpers so metadata-only attributes stay visible
during operation encoding. Before the first local edit versions a legacy root,
backfill Yjs delta attributes from metadata.

When text content is unchanged, `setYjsTextLeaves` updates Yjs delta attributes
with `format()` before refreshing `slate:text-leaves`. This keeps same-text
split and merge operations from drifting metadata away from the CRDT payload.

Do not read formatted text with `Y.XmlText.toString()`. That API serializes
formatting as XML-like tags. Read plain Slate text from `toDelta()` instead:

```ts
const getYjsTextContent = (node: Y.XmlText) =>
  node
    .toDelta()
    .map((part) => (typeof part.insert === 'string' ? part.insert : ''))
    .join('')
```

Use the same plain-text helper for Slate import, split-history boundaries, and
operation encoders that slice text by Slate offsets.

## Why This Works
Yjs deltas are the conflict-resolution authority for live text formatting.
Slate metadata is still required because Slate exposes adjacent leaves and empty
leaves that a plain delta cannot fully describe. The reconciliation layer keeps
those responsibilities separate: delta attributes decide current formatting,
metadata decides Slate boundaries and metadata-only split removals, and `null`
metadata gets a narrow fallback because Yjs omits it from deltas.
If metadata says `color:red` while the delta says `color:blue`, the delta wins;
the metadata fallback is for omissions, not conflicting stale values.

## Prevention
- Add regressions for concurrent mark addition, mark removal, partial same-key
  formatting, same-text split/merge, versioned metadata-only split removals,
  metadata-only legacy docs, and `null` text-attribute round trips.
- Any helper that maps Slate paths to Yjs text leaves should pass root-derived
  read options instead of calling `readYjsText()` with defaults.
- When `setYjsTextLeaves` keeps the same plain text, verify both metadata and
  Yjs delta attributes change.
- Keep package test filenames discoverable by the package test command; use
  `.test.ts` for `bun --filter @slate/yjs test`.
- Add a reconnect test for formatted `Y.XmlText` that asserts Slate imports
  plain text plus marks, never serialized markup.

## Related Issues
- `docs/solutions/logic-errors/yjs-offline-split-reconnect-merge-2026-05-25.md`
- `docs/solutions/logic-errors/yjs-backspace-merge-normalization-reconnect-2026-05-25.md`
- `docs/solutions/runtime-errors/yjs-disconnected-undo-history-offset-2026-05-25.md`
