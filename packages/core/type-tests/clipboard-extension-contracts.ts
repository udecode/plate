import { createBasePlugin } from '@platejs/core';

const ImagePlugin = createBasePlugin({
  key: 'img',
})
  .extendTx(() => () => ({
    insert: ({ url }: { url: string }) => {
      void url;
    },
  }))
  .extendExtension(() => ({
    clipboard: {
      insertData(_data, { tx }) {
        tx.img.insert({ url: 'https://example.com/image.png' });

        // @ts-expect-error The installed image transaction keeps its input type.
        tx.img.insert({ src: 'https://example.com/image.png' });

        return true;
      },
    },
  }));

void ImagePlugin;
