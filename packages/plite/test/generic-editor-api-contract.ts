import {
  createEditor,
  type EditorCommit,
  type EditorMarksOf,
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

type CustomValue = (ParagraphElement | QuoteElement)[];

const editor = createEditor<CustomValue>();

editor.update((tx) => {
  tx.nodes.set<ElementOf<typeof editor>>({ type: 'quote' });
  tx.marks.add('bold' satisfies keyof EditorMarksOf<typeof editor>, true);
  tx.text.insert('typed');
});

const leaf: TextOf<typeof editor> = { text: 'typed', bold: true };
const marks: EditorMarksOf<typeof editor> = { code: true };
const staticChildren: Readonly<CustomValue> = editor.read((state) =>
  state.value.root()
);
const operations: readonly Operation<CustomValue>[] = editor.read((state) =>
  state.value.operations()
);
const commit: EditorCommit<CustomValue> | null = editor.read((state) =>
  state.value.lastCommit()
);

editor.update((tx) => {
  tx.value.replace({ children: [...staticChildren], selection: null, marks });
});

void leaf;
void marks;
void operations;
void commit;
