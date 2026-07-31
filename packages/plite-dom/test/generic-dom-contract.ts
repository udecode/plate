import {
  ContentSlice,
  createEditor,
  defineEditorExtension,
  type Editor,
  type EditorExtensionContribution,
  type EditorExtensionDefinitionInput,
  type Node as PliteNode,
} from '@platejs/plite';
import {
  clipboardHandler,
  defineHostCodec,
  dom,
  type DOMClipboardHandler,
  hostCodecs,
} from '@platejs/plite-dom';

type CustomText = {
  text: string;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomValue = ParagraphElement[];

declare const dataTransfer: DataTransfer;
declare const domOptions: import('@platejs/plite-dom').DOMEditorOptions;
declare const pliteNode: PliteNode;

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: '' }] },
];
const jsonCodec = defineHostCodec<CustomValue>({
  format: 'application/x-custom-value+json',
  key: 'custom-value-json',
  parse: ({ data, state }) => {
    const children: readonly ParagraphElement[] = state.children();

    return data ? ContentSlice.closed<CustomValue>(children) : null;
  },
  owns: [{ kind: 'schema' }],
  serialize: ({ slice, state }) => {
    const content: readonly (CustomText | ParagraphElement)[] = slice.content;
    const children: readonly ParagraphElement[] = state.children();

    return JSON.stringify({ children, content });
  },
});

const DomExtension = dom();
const ImageExtension = defineEditorExtension({
  name: 'img',
  update: () => ({
    insert: ({ url }: { url: string }) => {
      void url;
    },
  }),
});
const typedClipboardContribution = clipboardHandler({
  insertData(_data, { transaction }) {
    transaction.img.insert({ url: 'https://example.com/image.png' });

    // @ts-expect-error Dependency transactions preserve command inputs.
    transaction.img.insert({ src: 'https://example.com/image.png' });

    return true;
  },
});
const TypedClipboardExtension = defineEditorExtension({
  dependencies: [ImageExtension],
  contributions: [typedClipboardContribution],
  name: 'typed-clipboard-handler',
});
const ClipboardExtension = defineEditorExtension({
  name: 'clipboard-handler',
  contributions: [
    clipboardHandler({
      insertData(_data, { next, transaction }) {
        transaction.selection();

        return next();
      },
    }),
  ],
});
const HostCodecsExtension = hostCodecs('custom-value-host-codecs', [jsonCodec]);
const editor = createEditor({
  extensions: [
    DomExtension,
    HostCodecsExtension,
    ClipboardExtension,
    TypedClipboardExtension,
  ],
  initialValue,
});

declare const imageClipboardContribution: EditorExtensionContribution<
  DOMClipboardHandler<ImageEditor>,
  ImageEditor
>;

const weakEditorContributions: NonNullable<
  EditorExtensionDefinitionInput<Editor<CustomValue>>['contributions']
> = [
  // @ts-expect-error A contribution cannot require unavailable editor capabilities.
  imageClipboardContribution,
];

void weakEditorContributions;

editor.api.dom.focus();
editor.api.dom.resolvePath(pliteNode);
editor.api.dom.clipboard.insertData(dataTransfer);
editor.api.dom.clipboard.writeSelection(dataTransfer);

const plainEditor = createEditor({ initialValue });

// @ts-expect-error DOM methods are installed extension API only
plainEditor.api.dom.focus();

// @ts-expect-error clipboard is installed by the DOM extension only
plainEditor.api.dom.clipboard.insertData(dataTransfer);

// @ts-expect-error clipboard export is installed by the DOM extension only
plainEditor.api.dom.clipboard.writeSelection(dataTransfer);

const insertionOnlyEditor = createEditor({
  extensions: [dom({ clipboard: false })],
  initialValue,
});

// @ts-expect-error clipboard is disabled explicitly
insertionOnlyEditor.api.dom.clipboard.insertData(dataTransfer);

// @ts-expect-error clipboard export is disabled explicitly
insertionOnlyEditor.api.dom.clipboard.writeSelection(dataTransfer);

const maybeClipboardEditor = createEditor({
  extensions: [dom(domOptions)],
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
  // @ts-expect-error clipboard is installed by the DOM extension only
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
