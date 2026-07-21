import {
  createEditor,
  defineEditorExtension,
  type DocumentChange,
  type Editor,
  type ValueOf,
} from '@platejs/plite';

type CustomText = {
  text: string;
  bold?: true;
};

type ParagraphElement = {
  type: 'paragraph';
  children: CustomText[];
};

type CustomValue = ParagraphElement[];

type CustomEditor = Editor<CustomValue>;

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: 'paragraph' }] },
];

const extension = defineEditorExtension<CustomEditor>()({
  name: 'generic-extension',
  onTransactionChange(context) {
    const change: DocumentChange = context.change;
    const changedPaths = context.changed.paths();
    const changedRanges = context.changed.topLevelRanges();
    const textChanged = context.changed.has('text');
    const value: Readonly<ValueOf<typeof context.editor>> = context.editor.read(
      (state) => state.children()
    );

    void change;
    void changedPaths;
    void changedRanges;
    void textChanged;
    void value;
  },
  onCommit({ commit, snapshot }) {
    const change: DocumentChange = commit.changes;
    const changedPaths = commit.changed.paths();
    const children: CustomValue = snapshot.children;

    void change;
    void changedPaths;
    void children;
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-commit-listeners',
  // @ts-expect-error extension authors use onCommit
  commitListeners: [() => {}],
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-register',
  // @ts-expect-error extension authors use declarative slots or activate
  register() {},
});

const editor = createEditor({ extensions: [extension] as const, initialValue });
const value: Readonly<CustomValue> = editor.read((state) => state.children());

void value;
