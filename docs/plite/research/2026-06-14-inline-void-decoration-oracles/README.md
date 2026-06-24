# Inline Void And Decoration Oracles

Date: 2026-06-14
Owner: slate-auto / slate-research
Status: promoted-kept

## Question

What external editor source gives Plite better proof for inline void
mentions, async decorations during active input, hovering toolbar selection, and
IME-adjacent behavior that is still heavily browser-scoped locally?

## Scope

- Inline atom/mention selection, copy/paste, drag, and deletion.
- Decoration refresh while typing or composing.
- Hovering/format toolbar selection preservation.
- Browser/native selection or IME proof strategy.

## Exclusions

- Pagination and pagination controls.
- Runtime patches from snippets, issue titles, or docs claims.
- Raw mobile/device claims.

## Local Evidence Gap

Plite now has broad route proof for mentions, async decorations, and hovering
toolbar behavior. Remaining explicit scopes are mostly Chromium-only IME/CDP or
privileged clipboard rows. The research loop should decide whether external
source suggests a Plite-native test packet, benchmark packet, or no-code
decision for those scoped lanes.

## Stop Rule

Stop this shard after reading the strongest local OSS source slices for
ProseMirror, Lexical, Tiptap/Milkdown, and upstream Slate, or earlier if one
lead reaches promotion score.

## Verdict

Promote one proof packet, no runtime patch.

- ProseMirror has direct browser tests for composition surviving decoration
  churn, inline atom arrow traversal, inline decoration boundaries, and scoped
  node-selection clipboard serialization.
- Plite already covers the composition/inline-atom/clipboard invariants with
  `decorations-async.test.ts`, `mentions.test.ts`, and `plite-dom` clipboard
  contracts, with expected Chromium-only or WebKit clipboard transport limits.
- The missing durable proof was a React projection contract for decorations that
  begin/end at inline element boundaries. P106 added
  `packages/plite-react/test/projections-and-selection-contract.tsx` coverage
  and verified the focused row plus the whole contract file. P116 reran the
  focused proof and kept the packet closed.
- Lexical reinforces the same invariant from a different model: mention entities
  block text insertion before/after and carry export/import semantics. It does
  not map cleanly to Plite voids, so it stays a coverage cross-check rather than
  a runtime design import.

Workflow slowdown: broad Lexical/Tiptap/Milkdown source scans are too noisy for
the active context unless redirected to raw files and sliced by exact source
paths. Future research loops should ledger first, then inspect short source
ranges.
