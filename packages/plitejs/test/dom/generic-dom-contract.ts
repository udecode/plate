import {
  ContentSlice,
  createEditor,
  definePlugin,
  type Editor,
  type Node as PliteNode,
  type Value,
} from 'plitejs';
import { dom, domCommands, type HostCodec, hostCodecs } from 'plitejs/dom';

type CustomText = {
  text: string;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomValue = ParagraphElement[];

declare const dataTransfer: DataTransfer;
declare const domOptions: import('plitejs/dom').DOMEditorOptions;
declare const pliteNode: PliteNode;

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: '' }] },
];
const jsonCodec: HostCodec<CustomValue> = {
  format: 'application/x-custom-value+json',
  key: 'custom-value-json',
  parse: ({ data, state }) => {
    const children: readonly ParagraphElement[] = state.children();

    return data ? ContentSlice.closed<CustomValue>(children) : null;
  },
  owns: [{ kind: 'schema' }],
  serialize: ({ slice, state }) => {
    const content: ReadonlyArray<CustomText | ParagraphElement> = slice.content;
    const children: readonly ParagraphElement[] = state.children();

    return JSON.stringify({ children, content });
  },
};

const DomPlugin = dom();
const ImagePlugin = definePlugin('img', {
  update: () => ({
    insert: ({ url }: { url: string }) => {
      void url;
    },
  }),
});
type ImageEditor = Editor<Value, readonly [typeof ImagePlugin]>;
const TypedClipboardPlugin = definePlugin('typed-clipboard-handler', {
  dependencies: [ImagePlugin],
  commands: ({ around }) => [
    around(domCommands.insertData, ({ state }) =>
      state.transaction((tx) => {
        tx.img.insert({ url: 'https://example.com/image.png' });

        // @ts-expect-error Dependency transactions preserve command inputs.
        tx.img.insert({ src: 'https://example.com/image.png' });
      })
    ),
  ],
});
const ClipboardPlugin = definePlugin('clipboard-handler', {
  commands: ({ around }) => [
    around(domCommands.insertData, ({ next, state }) => {
      state.selection();

      return next();
    }),
  ],
});
const HostCodecsPlugin = hostCodecs('custom-value-host-codecs', [jsonCodec]);
const editor = createEditor({
  plugins: [DomPlugin, HostCodecsPlugin, ClipboardPlugin, TypedClipboardPlugin],
  initialValue,
});

declare const imageEditor: ImageEditor;

void imageEditor;

editor.api.dom.focus();
editor.api.dom.resolvePath(pliteNode);
editor.api.dom.clipboard.insertData(dataTransfer);
editor.api.dom.clipboard.writeSelection(dataTransfer);

const plainEditor = createEditor({ initialValue });

// @ts-expect-error DOM methods are installed plugin API only
plainEditor.api.dom.focus();

// @ts-expect-error clipboard is installed by the DOM plugin only
plainEditor.api.dom.clipboard.insertData(dataTransfer);

// @ts-expect-error clipboard export is installed by the DOM plugin only
plainEditor.api.dom.clipboard.writeSelection(dataTransfer);

const insertionOnlyEditor = createEditor({
  plugins: [dom({ clipboard: false })],
  initialValue,
});

// @ts-expect-error clipboard is disabled explicitly
insertionOnlyEditor.api.dom.clipboard.insertData(dataTransfer);

// @ts-expect-error clipboard export is disabled explicitly
insertionOnlyEditor.api.dom.clipboard.writeSelection(dataTransfer);

const maybeClipboardEditor = createEditor({
  plugins: [dom(domOptions)],
  initialValue,
});

// @ts-expect-error clipboard export is not guaranteed by dynamic options
maybeClipboardEditor.api.dom.clipboard.writeSelection(dataTransfer);

// @ts-expect-error DOM methods are not exposed on the clipboard capability
editor.api.dom.clipboard.resolvePath(pliteNode);

editor.read((state) => {
  // @ts-expect-error DOM is not replayable read state
  state.dom.focus();
});

editor.update((tx) => {
  // @ts-expect-error DOM is not replayable transaction state
  tx.dom.focus();

  tx.dom.insertData(dataTransfer);
});

plainEditor.update((tx) => {
  // @ts-expect-error clipboard is installed by the DOM plugin only
  tx.dom.insertData(dataTransfer);
});

insertionOnlyEditor.update((tx) => {
  // @ts-expect-error clipboard is disabled explicitly
  tx.dom.insertData(dataTransfer);
});

maybeClipboardEditor.update((tx) => {
  // @ts-expect-error clipboard is not guaranteed by dynamic options
  tx.dom.insertData(dataTransfer);
});
