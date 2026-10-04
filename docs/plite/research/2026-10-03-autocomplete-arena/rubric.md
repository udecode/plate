# Arena rubric (judge and lead only; runners never see it)

Score each candidate 0 to 4 on each criterion, with one line of evidence per score.

1. Laws by mechanism. Every hard law (1 to 13) and the native constraints (IME epoch owned by DOMInputRuntime, composing flag outliving compositionend, remote and historic commits, owned content roots) holds through a named mechanism, not prose. A law the candidate changes is named with its justification.
2. Ownership and lifetime. Each responsibility has exactly one owner at the right layer (Plite substrate, Plate product policy, copied UI), per VISION.md, docs/vision/plate.md, docs/vision/plite.md and the architecture reference; no competing writable truth; state lives at the right lifetime (document, editor session, mounted view, derived).
3. Interface depth. The four feature call sites (mention, slash, emoji, footnote) stay small and inferred; the public surface is small relative to the capability it hides; no internal stages, wire types or lifecycle leak to callers.
4. Scale. Per-keystroke work is bounded independent of document and paragraph size, with no editor-wide fan-out per mounted popup.
5. Proof. Each law has a direct, cheap test or browser proof; the design needs a physical IME for as few claims as possible.
6. Subtraction. How much code, protocol and public API it deletes or simplifies relative to the built design, without losing a law.
