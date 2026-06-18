import { createEditor, type Node as SlateNode } from '@platejs/slate';
import { dom } from '@platejs/slate-dom';

type CustomText = {
  text: string;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomValue = ParagraphElement[];

declare const dataTransfer: DataTransfer;
declare const slateNode: SlateNode;

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: '' }] },
];

const DomExtension = dom();
const editor = createEditor({ extensions: [DomExtension], initialValue });

editor.api.dom.focus();
editor.api.dom.resolvePath(slateNode);
editor.api.clipboard.insertData(dataTransfer);
editor.api.clipboard.writeSelection(dataTransfer);

const plainEditor = createEditor({ initialValue });

// @ts-expect-error DOM methods are installed extension API only
plainEditor.api.dom.focus();

// @ts-expect-error clipboard methods are installed extension API only
plainEditor.api.clipboard.insertData(dataTransfer);

// @ts-expect-error clipboard is a sibling capability, not nested under dom
editor.api.dom.clipboard.insertData(dataTransfer);

// @ts-expect-error DOM methods are not exposed on the clipboard capability
editor.api.clipboard.resolvePath(slateNode);

editor.read((state) => {
  // @ts-expect-error DOM is not replayable read state
  state.dom.focus();
});

editor.update((tx) => {
  // @ts-expect-error DOM is not replayable transaction state
  tx.dom.focus();
});
