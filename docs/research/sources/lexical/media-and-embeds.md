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

## Captioned images and named slots

- The Lexical playground `ImageNode` is a `DecoratorNode` whose caption is a separate nested `LexicalEditor` (`facebook/lexical@dd5c41b1:packages/lexical-playground/src/nodes/ImageNode.tsx:134`, `facebook/lexical@dd5c41b1:packages/lexical-playground/src/nodes/ImageComponent.tsx`). Lexical also implements experimental named slots on `ElementNode` or `DecoratorNode` inside one `EditorState` (`facebook/lexical@dd5c41b1:packages/lexical/src/LexicalSlot.ts`, `facebook/lexical@dd5c41b1:packages/lexical/src/__tests__/unit/LexicalSlotSelection.test.ts`; https://lexical.dev/docs/concepts/named-slots), and the playground PullQuote, with quote and attribution regions, is a concrete consumer (`facebook/lexical@dd5c41b1:packages/lexical-playground/src/plugins/PullQuoteExtension/PullQuoteNode.tsx`, `facebook/lexical@dd5c41b1:packages/lexical-playground/__tests__/e2e/PullQuoteSlot.spec.mjs`). Both show that an atomic host with editable content is a real capability, but a nested editor adds ownership work one caption does not need, named slots suit several independent regions, and neither decides Enter behavior. Source: `docs/plite/research/2026-09-21-media-object-editable-content/README.md:109`, `:114` and `rejected-ledger.tsv:3` (2026-09-21; tests read, not run).
