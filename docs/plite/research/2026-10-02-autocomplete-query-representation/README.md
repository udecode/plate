# Autocomplete query representation in external editors

Question: does a trigger autocomplete (mention, slash, emoji) keep its query in
ordinary document text with a tracked range, or in a separate input element?
For each editor: query representation, IME and composition, Android, screen
reader ARIA, input rules inside the query, undo and collaboration.

Scope: `autocomplete`. Layer: Plate product UX, with Plite input and IME.
Governing review: `2026-10-01-autocomplete-ordinary-text-prototype` (pursue
ordinary text). This run feeds a `best-api-review` of whether to return to an
input element.

Evidence gap: the October 1 reviews cite Lexical and Tiptap as design support
without a dimension-by-dimension source read, and never compared an editor that
isolates the query in its own input.

Stop rule: one shard per editor family, plus Plate's own history. Stop when
every family has a source-cited row for each dimension, or a named gap.

Promotion owner: `best-api-review` for the verdict; `verify` for any test
packet.

Exclusions: no product code, no measured packets, no closed-source editors
beyond observed behavior labeled as such.

## Verdict

Keep the query in ordinary editor text. Do not return to an input element.

Of the twelve external designs read in shards 001 to 003, only Atlassian's
type-ahead since editor-core 149 keeps the query out of the document, in a
view-local nested contenteditable with `role=combobox`. It pays for that with
custom history steps and browser-specific workarounds, and none of the
surveyed editors shows Android proof for isolation (shard 003).

Plate's own 2024 reason for the input element was assistive technology
(shard 005). That reason still applies. In Chromium the old input exposes a
combobox with expanded and popup state, and the shipped editor root exposes a
textbox (shard 004). The repair belongs in the current owner: while a popup is
open, the editor root takes `role=combobox`, `aria-expanded` and
`aria-haspopup`. Chromium then exposes the same combobox state as the old
input. A real screen reader run decides whether a live region is also needed,
and it is the one observation that could reopen isolation.

The review record is `2026-10-02-autocomplete-input-element-rechallenge`.
Page: https://claude.ai/artifact/9VDnFkvAkK9F1aM3ox43Vu

## Counts

Each count comes from the ledgers in this directory.

- Sources read: 13, eight local clones and five npm packages
  (`repo-registry.tsv`).
- External issues and pull requests read: 41 issues and 10 pull requests
  (`read-log.tsv`, kinds `issue` and `pr`).
- Plate history: 56 issues, 40 discussions and 23 pull requests (shard 005).
- Leads kept: 60 (`lead-ledger.tsv`). Overlapping accessibility leads from
  different shards stay separate rows; none were merged.
- Leads promoted: 2 (`promoted-ledger.tsv`). Rejections: 3
  (`rejected-ledger.tsv`).

Next shard: none. The next observation is a real screen reader run, which
belongs to `verify`, not to research.
