import { createBasePlugin } from '@platejs/core';
import { clipboardHandler } from '@platejs/plite-dom';

const ImagePlugin = createBasePlugin({
  name: 'img',
  update: () => ({
    insert: ({ url }: { url: string }) => {
      void url;
    },
  }),
}).extend(() => ({
  contributions: [
    clipboardHandler({
      insertData(_data, { transaction: tx }) {
        tx.img.insert({ url: 'https://example.com/image.png' });

        // @ts-expect-error The installed image transaction keeps its input type.
        tx.img.insert({ src: 'https://example.com/image.png' });

        return true;
      },
    }),
  ],
}));

const ContextFreeClipboardPlugin = createBasePlugin({
  contributions: [
    clipboardHandler({
      insertData() {
        return true;
      },
    }),
  ],
  name: 'context-free-clipboard',
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
