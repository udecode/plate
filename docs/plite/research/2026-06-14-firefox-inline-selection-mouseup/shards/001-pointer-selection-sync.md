# Pointer Selection Sync Shard

Scope:
- Sample WPT, upstream Slate, ProseMirror, Lexical, and GitHub issue search for
  Firefox/contenteditable inline-link selection collapse precedent.

Sources sampled:
- WPT `editing` and `selection` raw search.
- %%UPSTREAM_PLITE_CAP%% `playwright/integration/examples/inlines.test.ts`.
- ProseMirror `view/src/selection.ts`, `view/src/input.ts`,
  `view/src/domobserver.ts`.
- Lexical `packages/lexical/src/LexicalEvents.ts`.
- GitHub issue search for `Firefox contenteditable selection mouseup link`.

Top leads:
- ProseMirror: native pointer selection is allowed to stay browser-owned during
  mouseDown/mouseup in targeted cases, with delayed synchronization and DOM
  observer current-selection tracking.
- Lexical: targeted browser-order quirks can store a correct selection and
  restore it later during `selectionchange` cleanup.

Rejected leads:
- WPT anchor/link editing fixtures are useful background, not direct pointer
  mouseup collapse proof.
- %%UPSTREAM_PLITE_CAP%% inline selection row is skipped as unstable, not stronger than
  the current Plite oracle.
- GitHub issue query had no useful hits.

Promotion:
- Keep P18/P21/P22. The current Plite repair matches the useful invariant:
  capture actual expanded DOM selection evidence, replay only when Firefox
  collapses it, and prove model/native/DOM/no-double-highlight with screenshots.

Next query:
- None for this packet. Reopen only if another browser-specific pointer
  selection collapse appears.
