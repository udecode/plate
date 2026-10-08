# Lexical: media and embeds

## Decorators

- **A decorator pasted on a blank line.** Pasting a decorator node, here a YouTube embed, on a blank line inserts it before that line and shows Lexical's block-cursor DOM ('Pasting a decorator node on a blank line inserts before the line', `facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/CopyAndPaste/lexical/CopyAndPaste.spec.mjs:769`). Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:235`. Limit: not rerun.

## Images

- **Images e2e.** `Images.spec.mjs` covers:
  - deleting a clicked, selected image with Backspace;
  - moving the caret into and out of images with the arrow keys, also vertically and with Shift;
  - URL and upload dialogs, image dimensions, drag and drop, and the caption editor;
  - replacing a NodeSelection of several nodes.

  The keyboard rows treat the image as an atomic, selectable block. Source: `docs/editor-test-harvester/lexical/plite-processing-ledger.md:920-923`, `:864`, extracted on 2026-05-09 from an unpinned Lexical checkout. Limit: not rerun.
