import {
  ContentSlice,
  createEditor,
  type Node as PliteNode,
} from '@platejs/plite';
import { defineHostCodec, dom, hostCodecs } from '@platejs/plite-dom';

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
const HostCodecsExtension = hostCodecs('custom-value-host-codecs', [jsonCodec]);
const editor = createEditor({
  extensions: [DomExtension, HostCodecsExtension],
  initialValue,
});

editor.api.dom.focus();
editor.api.dom.resolvePath(pliteNode);
editor.api.clipboard.insertData(dataTransfer);
editor.api.clipboard.writeSelection(dataTransfer);

const plainEditor = createEditor({ initialValue });

// @ts-expect-error DOM methods are installed extension API only
plainEditor.api.dom.focus();

plainEditor.api.clipboard.insertData(dataTransfer);

// @ts-expect-error clipboard export is installed by the DOM extension only
plainEditor.api.clipboard.writeSelection(dataTransfer);

const insertionOnlyEditor = createEditor({
  extensions: [dom({ clipboard: false })],
  initialValue,
});

insertionOnlyEditor.api.clipboard.insertData(dataTransfer);

// @ts-expect-error clipboard export is disabled explicitly
insertionOnlyEditor.api.clipboard.writeSelection(dataTransfer);

const maybeClipboardEditor = createEditor({
  extensions: [dom(domOptions)],
  initialValue,
});

// @ts-expect-error clipboard export is not guaranteed by dynamic options
maybeClipboardEditor.api.clipboard.writeSelection(dataTransfer);

// @ts-expect-error clipboard is a sibling capability, not nested under dom
editor.api.dom.clipboard.insertData(dataTransfer);

// @ts-expect-error DOM methods are not exposed on the clipboard capability
editor.api.clipboard.resolvePath(pliteNode);

editor.read((state) => {
  // @ts-expect-error DOM is not replayable read state
  state.dom.focus();
});

editor.update((tx) => {
  // @ts-expect-error DOM is not replayable transaction state
  tx.dom.focus();
});
