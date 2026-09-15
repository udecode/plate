import { definePlugin } from 'platejs';

import { domCommands } from '../src/dom';

const ImagePlugin = definePlugin('img', {
  update: () => ({
    insert: ({ url }: { url: string }) => {
      void url;
    },
  }),
}).extend(() => ({
  commands: ({ around }) => [
    around(domCommands.insertData, ({ state }) =>
      state.transaction((tx) => {
        tx.img.insert({ url: 'https://example.com/image.png' });

        // @ts-expect-error The installed image transaction keeps its input type.
        tx.img.insert({ src: 'https://example.com/image.png' });
      })
    ),
  ],
}));

const ContextFreeClipboardPlugin = definePlugin('contextFreeClipboard', {
  commands: ({ handle }) => [
    handle(domCommands.insertData, ({ state }) => state.transaction(() => {})),
  ],
});

void ImagePlugin;
void ContextFreeClipboardPlugin;
