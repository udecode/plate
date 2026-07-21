import {
  createEditor,
  type DocumentChange,
  type EditorCommit,
  type EditorMarksOf,
  type EditorReplaceChildrenOptions,
  type ElementOf,
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
editor.update.nodes.replace(
  { type: 'paragraph', children: [{ text: 'replacement' }] },
  { at: callout, select: true }
);
editor.update.nodes.replace(callout, {
  // @ts-expect-error replace requires an exact path or live node target
  at: {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
});

const leaf: TextOf<typeof editor> = { text: 'typed', bold: true };
const marks: EditorMarksOf<typeof editor> = { code: true };
const staticChildren: Readonly<CustomValue> = editor.read((state) =>
  state.children()
);
const changes: DocumentChange | undefined = editor.read.lastCommit()?.changes;
const commit: EditorCommit<CustomValue> | null = editor.read((state) =>
  state.lastCommit()
);

editor.update((tx) => {
  tx.value.replace({
    children: [...staticChildren],
    selection: {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
      kind: 'text',
      marks,
    },
  });
});

void leaf;
void marks;
void changes;
void commit;
