import {
  createEditor,
  defineEditorExtension,
  type Editor,
  type Operation,
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
  operations: {
    apply(context) {
      const operation: Operation<CustomValue> = context.operation;
      const value: Readonly<ValueOf<typeof context.editor>> =
        context.editor.read((state) => state.value.root());

      context.next(operation);
      void value;
    },
  },
  onCommit({ commit, snapshot }) {
    const operation: Operation<CustomValue> | undefined = commit.operations[0];
    const children: CustomValue = snapshot.children;

    void operation;
    void children;
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-operation-middlewares',
  // @ts-expect-error extension authors use operations.apply
  operationMiddlewares: [() => {}],
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-commit-listeners',
  // @ts-expect-error extension authors use onCommit
  commitListeners: [() => {}],
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-register',
  // @ts-expect-error extension authors use setup
  register() {},
});

const editor = createEditor({ extensions: [extension], initialValue });
const value: Readonly<CustomValue> = editor.read((state) => state.value.root());

void value;
