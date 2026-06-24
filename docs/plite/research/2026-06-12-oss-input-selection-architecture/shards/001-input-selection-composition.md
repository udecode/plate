# Input, Selection, And Composition Shard

CodeMirror was the strongest source in this shard. It records composition as a
state machine with:

- `composing` count;
- first-change marker;
- `compositionEndedAt`;
- Safari pending-key window;
- pending DOM-change window after compositionend.

The portable lesson is not to copy that shape. The lesson is that composition
tests must cover interference:

- model change fully overlaps active composition;
- model change partially overlaps active composition;
- model change happens inside active composition;
- model change happens elsewhere and composition survives;
- rapid consecutive compositions;
- DOM span merge/extension around IME text.

Plite already covers several adjacent classes: formatted text, select-all
replacement, cross-paragraph replacement, rapid consecutive composition, async
decoration refresh, WebKit compositionend, hidden DOM boundaries, inline void
boundaries, and undo.

The first promoted gap is the non-overlapping model update class. The Plite row
starts native Chromium IME composition, applies a model `insert_text` operation
before the composition point through the browser handle, commits the
composition, and asserts the committed text and model selection land at the
adjusted caret.

The second promoted gap is model deletion starting at the composition point. The
Plite row starts native Chromium IME composition, applies a model `remove_text`
operation at the composition point, commits the composition, and asserts the
deleted model text stays deleted while the composition lands at that point.

Deeper inside-composition DOM-span mutation semantics are still queued, not
patched. Synthetic composition helpers do not keep an active DOM composition text
node before commit, so they are the wrong proof surface for that class. A future
packet should add a helper only if it can observe or mutate the real active DOM
composition span honestly.
