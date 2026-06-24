---
"@slate/yjs": patch
---

Add the first-party Yjs collaboration package with operation-level text, node,
remove, split, merge, move, set, replace-children, replace-fragment,
insert-fragment, delete-fragment, wrap, unwrap, and lift collaboration support.
The package includes selection relative-position conversion, awareness/provider
lifecycle handling, React remote cursor hooks, split undo/redo repair, virtual
merge/wrapper refs for concurrent remote edits, and traceable broad
replace-fragment fallback for identity-risk paths.

Fix offline split undo/redo convergence, split-history redo preservation,
right-side text repair, no-op replace fragments, cursor repair, and structural
Yjs path repair for concurrent wrap, move, merge, unwrap, reconnect, and nested
paragraph crash cases. Pin the audited Yjs UndoManager stack contract.
