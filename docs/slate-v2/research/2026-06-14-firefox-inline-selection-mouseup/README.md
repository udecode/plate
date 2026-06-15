# Firefox Inline Selection Mouseup

Question: after the Slate v2 Firefox inline-link drag repair, is there external
prior art for pointer/native-selection ownership that should change the next
Slate-native proof or runtime owner?

Scope:
- Firefox/contenteditable pointer selection, mouseup collapse, selectionchange,
  inline links, and visual/native oracle shape.
- Local source reads first: WPT, upstream Slate, ProseMirror, Lexical.
- No runtime patch from research snippets.
- Pagination, raw mobile, and broad issue-ledger closure are out of scope.

Current verdict:
- Keep the P18 Slate-native repair and P21/P22 visual proof.
- ProseMirror and Lexical both support the same high-level invariant: native
  browser selection is an asynchronous/pointer-owned surface and editors should
  synchronize or restore only from captured evidence, not eagerly overwrite it.
- No external source found a more specific Firefox isolated-link mouseup rule
  than the local Slate v2 route proof.

Stop rule:
- Stop this shard after the strongest local-source leads are recorded and
  either promoted or rejected.

Promotion:
- `selection:pointer-native-dom-first-sync:docs-packet` promoted as a
  no-runtime-change decision. Current Slate-native proof already implements the
  needed behavior and visual oracle.
