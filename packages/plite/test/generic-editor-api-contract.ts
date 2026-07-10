import {
  createEditor,
  type EditorCommit,
  type EditorMarksOf,
  type EditorReplaceChildrenOptions,
  type ElementOf,
  type Operation,
  type TextOf,
} from '@platejs/plite';

type CustomText = {
  text: string;
  bold?: true;
  code?: true;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type QuoteElement = {
  type: 'quote';
  children: CustomText[];
};

type CalloutElement = {
  type: 'callout';
  children: CustomText[];
  icon: string;
};

type CustomValue = (CalloutElement | ParagraphElement | QuoteElement)[];

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: '' }] },
];

const editor = createEditor<CustomValue>({ initialValue });

editor.update((tx) => {
  tx.nodes.set<ElementOf<typeof editor>>({ type: 'quote' });
  tx.marks.add('bold' satisfies keyof EditorMarksOf<typeof editor>, true);
  tx.text.insert('typed');
});

const callout: CalloutElement = {
  type: 'callout',
  children: [{ text: '' }],
  icon: 'info',
};

editor.update.nodes.set({ icon: 'warning' }, { at: callout });
// @ts-expect-error targeted CalloutElement has no href property
editor.update.nodes.set({ href: '/wrong' }, { at: callout });

const replaceChildrenOptions: EditorReplaceChildrenOptions = { at: callout };

editor.update.nodes.replaceChildren([{ text: 'replacement' }], {
  ...replaceChildrenOptions,
});

const leaf: TextOf<typeof editor> = { text: 'typed', bold: true };
const marks: EditorMarksOf<typeof editor> = { code: true };
const staticChildren: Readonly<CustomValue> = editor.read((state) =>
  state.children()
);
const operations: readonly Operation<CustomValue>[] = editor.read((state) =>
  state.operations()
);
const commit: EditorCommit<CustomValue> | null = editor.read((state) =>
  state.lastCommit()
);

editor.update((tx) => {
  tx.value.replace({ children: [...staticChildren], selection: null, marks });
});

void leaf;
void marks;
void operations;
void commit;
