import { defineBasePlugin } from '@platejs/core';
import { clipboardHandler } from '@platejs/plite-dom';

const ImagePlugin = defineBasePlugin('img', {
  update: () => ({
    insert: ({ url }: { url: string }) => {
      void url;
    },
  }),
}).extend(() => ({
  contributions: [
    clipboardHandler({
      insertData(_data, { tx }) {
        tx.img.insert({ url: 'https://example.com/image.png' });

        // @ts-expect-error The installed image transaction keeps its input type.
        tx.img.insert({ src: 'https://example.com/image.png' });

        return true;
      },
    }),
  ],
}));

const ContextFreeClipboardPlugin = defineBasePlugin('contextFreeClipboard', {
  contributions: [
    clipboardHandler({
      insertData() {
        return true;
      },
    }),
  ],
});

declare const editor: import('@platejs/core').BaseEditor;

const rejectedEditorFirstHandler = {
  insertData() {
    return true;
  },
};

// @ts-expect-error clipboardHandler accepts exactly one handler argument.
clipboardHandler(editor, rejectedEditorFirstHandler);

void ImagePlugin;
void ContextFreeClipboardPlugin;
