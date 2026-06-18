import {
  createEditor,
  defineEditorExtension,
  type Editor,
  type EditorPublicTransformMiddlewareKey,
  type Value,
} from '@platejs/slate';

type CustomText = {
  text: string;
  bold?: true;
};

type ParagraphElement = {
  type: 'paragraph';
  url?: string;
  children: CustomText[];
};

type ImageElement = {
  type: 'image';
  src: string;
  children: CustomText[];
};

type CustomValue = (ParagraphElement | ImageElement)[];
type CustomEditor = Editor<CustomValue>;

const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: 'paragraph' }] },
];

type AssertNever<T extends never> = T;

const acceptedTransformMiddlewareKeys = [
  'addMark',
  'collapse',
  'delete',
  'deleteBackward',
  'deleteForward',
  'deleteFragment',
  'deselect',
  'insertBreak',
  'insertFragment',
  'insertNode',
  'insertNodes',
  'insertSoftBreak',
  'insertText',
  'liftNodes',
  'mergeNodes',
  'move',
  'moveNodes',
  'removeMark',
  'removeNodes',
  'select',
  'setNodes',
  'setPoint',
  'setSelection',
  'splitNodes',
  'toggleMark',
  'unsetNodes',
  'unwrapNodes',
  'wrapNodes',
] as const satisfies readonly EditorPublicTransformMiddlewareKey[];

type AcceptedTransformMiddlewareKey =
  (typeof acceptedTransformMiddlewareKeys)[number];
type MissingTransformMiddlewareKey = Exclude<
  EditorPublicTransformMiddlewareKey,
  AcceptedTransformMiddlewareKey
>;
type ExtraTransformMiddlewareKey = Exclude<
  AcceptedTransformMiddlewareKey,
  EditorPublicTransformMiddlewareKey
>;
type _NoMissingTransformMiddlewareKey =
  AssertNever<MissingTransformMiddlewareKey>;
type _NoExtraTransformMiddlewareKey = AssertNever<ExtraTransformMiddlewareKey>;

declare module '@platejs/slate' {
  interface EditorStateExtensionGroups<V extends Value = Value> {
    link: {
      nested: {
        canOpen: () => boolean;
      };
      selectedHref: () => string | null;
      value: V;
    };
    table: {
      isInTable: () => boolean;
      rowCount: () => number;
    };
  }

  interface EditorTxExtensionGroups<V extends Value = Value> {
    link: {
      nested: {
        remove: () => void;
      };
      setHref: (href: string) => void;
    };
    media: {
      insertImage: (src: string) => void;
    };
    table: {
      insertRow: () => void;
      rowCount: () => number;
    };
  }
}

const extension = defineEditorExtension<CustomEditor>()({
  name: 'generic-namespace',
  state: {
    link(state) {
      const value: CustomValue = [...state.value.root()];

      return {
        nested: {
          canOpen: () => state.selection.get() != null,
        },
        selectedHref: () => null,
        value,
      };
    },
    table(state) {
      return {
        isInTable: () => state.nodes.hasPath([0]),
        rowCount: () => state.value.root().length,
      };
    },
  },
  tx: {
    link(tx) {
      return {
        nested: {
          remove() {
            tx.nodes.remove({ at: [0] });
          },
        },
        setHref(href) {
          tx.nodes.set({ url: href }, { at: [0] });
        },
      };
    },
    media(tx) {
      return {
        insertImage(src) {
          tx.nodes.insert({
            type: 'image',
            src,
            children: [{ text: '' }],
          } satisfies ImageElement);
        },
      };
    },
    table(tx) {
      return {
        insertRow() {
          tx.nodes.insert(
            {
              type: 'paragraph',
              children: [{ text: 'row' }],
            } satisfies ParagraphElement,
            { at: [tx.value.root().length] }
          );
        },
        rowCount: () => tx.value.root().length,
      };
    },
  },
});

const runtimeExtension = defineEditorExtension({
  name: 'runtime-generic-namespace',
  options: {
    initialMode: 'text' as const,
  },
  setup(context) {
    const initialMode: 'text' = context.options.initialMode;
    const signal: AbortSignal = context.signal;
    const mode = context.runtimeState<'text' | 'cell'>(initialMode);

    void signal;

    return {
      cleanup() {
        mode.set('text');
      },
      state: {
        table(state) {
          return {
            isInTable: () => mode.get() === 'cell' && state.nodes.hasPath([0]),
            rowCount: () => state.value.root().length,
          };
        },
      },
      tx: {
        table(tx) {
          return {
            insertRow() {
              mode.set('cell');
              tx.nodes.insert({
                type: 'paragraph',
                children: [{ text: 'row' }],
              } satisfies ParagraphElement);
            },
            rowCount: () => tx.value.root().length,
          };
        },
      },
    };
  },
});

defineEditorExtension({
  name: 'bad-runtime-command-namespace',
  // @ts-expect-error setup output does not expose public command slots
  setup() {
    return {
      commands: [
        {
          handler: () => false,
          type: 'insert_text',
        },
      ],
    };
  },
});

defineEditorExtension({
  name: 'bad-register-slot',
  // @ts-expect-error extension lifecycle uses setup
  register() {
    return {};
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-link-namespace',
  state: {
    // @ts-expect-error augmented link state groups must return the declared shape
    link() {
      return {
        selectedHref: () => null,
      };
    },
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-command-namespace',
  // @ts-expect-error raw Slate extensions do not expose public command slots
  commands: [
    {
      handler: () => false,
      type: 'insert_text',
    },
  ],
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-engine-transform',
  transforms: {
    // @ts-expect-error engine controls are not transform middleware keys
    normalize() {},
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'middleware-context-typing',
  clipboard: {
    insertData(_data, context) {
      context.state.selection.get();

      // @ts-expect-error clipboard middleware gets state, not tx
      context.tx;

      return context.next();
    },
  },
  queries: {
    text: {
      string(context) {
        context.state.selection.get();

        // @ts-expect-error query middleware gets state, not tx
        context.tx;

        return context.next({ at: context.at, options: context.options });
      },
    },
  },
  transforms: {
    insertText(context) {
      context.tx.selection.get();

      // @ts-expect-error transform middleware gets tx, not separate state
      context.state;

      return context.next({ text: context.text });
    },
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'normalizer-node-typing',
  normalizers: {
    editor(context) {
      const value: CustomValue = context.tx.value.get().children;

      // @ts-expect-error editor normalizers do not expose node entries
      context.entry;
      // @ts-expect-error normalizer tx cannot replace the whole value
      context.tx.value.replace({
        children: value,
        marks: null,
        selection: null,
      });

      context.next();
    },
    node({ entry, next, tx }) {
      const value: CustomValue = tx.value.get().children;

      tx.nodes.insert({
        type: 'paragraph',
        children: [{ text: entry[1].join('.') }],
      } satisfies ParagraphElement);

      // @ts-expect-error normalizer tx cannot recursively normalize
      tx.normalize();
      // @ts-expect-error normalizer tx cannot disable normalizing
      tx.withoutNormalizing(() => {});
      // @ts-expect-error normalizer tx cannot replay arbitrary operations
      tx.operations.replay([]);
      // @ts-expect-error normalizer tx cannot replace the whole value
      tx.value.replace({ children: value, marks: null, selection: null });

      next();
    },
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-top-level-normalize-node',
  // @ts-expect-error extensions use normalizers.node, not a top-level normalizeNode slot
  normalizeNode() {},
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-arbitrary-normalizer-key',
  normalizers: {
    // @ts-expect-error normalizers only exposes typed public lanes
    root() {},
  },
});

const editor = createEditor({ extensions: [extension], initialValue });

const selectedHref: string | null = editor.read((state) =>
  state.link.selectedHref()
);
const customValue: CustomValue = editor.read((state) => state.link.value);
const canOpen: boolean = editor.read((state) => state.link.nested.canOpen());
const tableRowCount: number = editor.read((state) => state.table.rowCount());
const isInTable: boolean = editor.read((state) => state.table.isInTable());

editor.update((tx) => {
  const beforeInsert: number = tx.table.rowCount();
  tx.table.insertRow();
  const afterInsert: number = tx.table.rowCount();

  tx.link.setHref('https://example.com');
  tx.link.nested.remove();
  tx.media.insertImage('image.png');

  void beforeInsert;
  void afterInsert;
});

const assertExtensionNamespacesStayScoped = () => {
  // @ts-expect-error extension groups do not mutate the editor object
  editor.link;

  // @ts-expect-error tx groups do not mutate the editor object
  editor.table.insertRow();

  editor.read((state) => {
    // @ts-expect-error tx-only groups are not exposed in read state
    state.media.insertImage('image.png');
    // @ts-expect-error table transforms are only exposed in update tx
    state.table.insertRow();
  });
};

void assertExtensionNamespacesStayScoped;
void runtimeExtension;
void selectedHref;
void customValue;
void canOpen;
void tableRowCount;
void isInTable;
