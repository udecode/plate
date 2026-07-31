import {
  createEditor,
  defineEditorExtension,
  type DocumentChange,
  type ValueOf,
} from '@platejs/plite';

type CustomText = {
  readonly bold?: true;
  readonly text: string;
};

type ParagraphElement = {
  readonly children: readonly CustomText[];
  readonly type: 'paragraph';
};

type CustomValue = readonly ParagraphElement[];

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: 'paragraph' }] },
];

const extension = defineEditorExtension({
  name: 'generic-extension',
  on: {
    transactionChange(context) {
      const change: DocumentChange = context.change;
      const changedPaths = context.changed.paths();
      const changedRanges = context.changed.topLevelRanges();
      const textChanged = context.changed.has('text');
      const value: Readonly<ValueOf<typeof context.editor>> =
        context.editor.read((state) => state.children());

      void change;
      void changedPaths;
      void changedRanges;
      void textChanged;
      void value;
    },
    commit({ commit, snapshot }) {
      const change: DocumentChange = commit.changes;
      const changedPaths = commit.changed.paths();
      const children = snapshot.children;

      void change;
      void changedPaths;
      void children;
    },
  },
});

defineEditorExtension({
  name: 'bad-commit-listeners',
  // @ts-expect-error extension authors use on.commit
  commitListeners: [() => {}],
});

defineEditorExtension({
  api(context) {
    void context.editor;
    void context.getContributions;
    void context.root;
    // @ts-expect-error API factories do not own candidate identity.
    void context.name;
    // @ts-expect-error API factories do not own the candidate schema.
    void context.schema;

    return {};
  },
  name: 'api-context-contract',
});

defineEditorExtension({
  name: 'bad-register',
  // @ts-expect-error extension authors use declarative slots or activate
  register() {},
});

defineEditorExtension({
  name: 'bad-read-middleware',
  // @ts-expect-error read builds an owner namespace; middleware belongs in readMiddleware
  read: ({ around }) => {
    void around;

    return {};
  },
});

defineEditorExtension({
  name: 'bad-validation-config',
  // @ts-expect-error Plite extensions validate the candidate context, not Plate config
  validate: ({ config }) => {
    void config;
  },
});

const editor = createEditor<CustomValue, readonly [typeof extension]>({
  extensions: [extension] as const,
  initialValue,
});
const value: Readonly<CustomValue> = editor.read((state) => state.children());

void value;
