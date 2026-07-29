import { createBasePlugin } from '@platejs/core';

const ImagePlugin = createBasePlugin({
  key: 'img',
  update: () => ({
    insert: ({ url }: { url: string }) => {
      void url;
    },
  }),
}).extend(() => ({
  extension: {
    clipboard: {
      insertData(_data, { transaction: tx }) {
        tx.img.insert({ url: 'https://example.com/image.png' });

        // @ts-expect-error The installed image transaction keeps its input type.
        tx.img.insert({ src: 'https://example.com/image.png' });

        return true;
      },
    },
  },
}));

void ImagePlugin;
