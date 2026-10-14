import {
  ContentSlice,
  createEditor,
  definePlugin,
  editorReads,
  type NodeSelection,
  type ReplaceSliceCommand,
  SelectionApi,
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

type IsAny<T> = 0 extends 1 & T ? true : false;
type IsNever<T> = [T] extends [never] ? true : false;
type Equal<T, U> =
  (<V>() => V extends T ? 1 : 2) extends <V>() => V extends U ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;

const LandingPlugin = definePlugin('landingContract', {
  readMiddleware: ({ around }) => [
    around(editorReads.slice.landing, ({ input, next, state }) => {
      const exactInput: Assert<
        Equal<typeof input, Readonly<ReplaceSliceCommand>>
      > = true;
      const inputNotAny: Assert<Equal<IsAny<typeof input>, false>> = true;
      const inputNotNever: Assert<Equal<IsNever<typeof input>, false>> = true;
      const result = next(input);
      const exactResult: Assert<Equal<typeof result, ReplaceSliceCommand>> =
        true;
      const resultNotAny: Assert<Equal<IsAny<typeof result>, false>> = true;
      const resultNotNever: Assert<Equal<IsNever<typeof result>, false>> = true;
      void [
        exactInput,
        inputNotAny,
        inputNotNever,
        exactResult,
        resultNotAny,
        resultNotNever,
      ];
      state.nodes.get([0]);
      // @ts-expect-error Landing preparation requires a ContentSlice.
      next({ slice: 'text' });
      return result;
    }),
  ],
});

const editor = createEditor({ plugins: [LandingPlugin] });
const slice = ContentSlice.closed([
  { type: 'paragraph', children: [{ text: 'Paste' }] },
]);
const at = SelectionApi.nodes([[0]]);
const exactTarget: Assert<Equal<typeof at, NodeSelection>> = true;
const targetNotAny: Assert<Equal<IsAny<typeof at>, false>> = true;
const targetNotNever: Assert<Equal<IsNever<typeof at>, false>> = true;
void [exactTarget, targetNotAny, targetNotNever];
editor.update.slice.replace(slice, { at });
editor.update.fragment.replace(slice.content, { at });
editor.read.slice.fit(slice, { at });
editor.update((tx) => {
  tx.slice.replace(slice, { at });
  tx.fragment.replace(slice.content, { at });
  // @ts-expect-error Text insertion does not accept a detached node selection.
  tx.text.insert('text', { at });
  // @ts-expect-error Fragment deletion retains its location target contract.
  tx.fragment.delete({ at });
});
