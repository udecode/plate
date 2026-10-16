import {
  ContentSlice,
  createEditor,
  definePlugin,
  editorReads,
  SelectionApi,
  type SliceLanding,
  type SliceLandingInput,
} from 'platejs';

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

type Equal<T, U> =
  (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

const LandingPlugin = definePlugin('landingContract', {
  readMiddleware: ({ around }) => [
    around(editorReads.slice.landing, ({ input, next }) => {
      const exactInput: Assert<Equal<typeof input, SliceLandingInput>> = true;
      const landed = next(input);
      const exactLanding: Assert<Equal<typeof landed, SliceLanding>> = true;
      void [exactInput, exactLanding];

      // @ts-expect-error A landing middleware passes the whole landing input on.
      next({ slice: input.slice });

      return landed;
    }),
  ],
});

createEditor({ plugins: [LandingPlugin] }).update.slice.replace(
  ContentSlice.closed([]),
  // @ts-expect-error A paste lands at a location; a selected node is replaced through the current selection.
  { at: SelectionApi.nodes([[0]], { mode: 'block' }) }
);
