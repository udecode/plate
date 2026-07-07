import {
  createEditor,
  defineEditorExtension,
  type Editor,
  type EditorPublicTransformMiddlewareKey,
} from '@platejs/plite';

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
  'replaceChildren',
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

const extension = defineEditorExtension<CustomEditor>()({
  name: 'generic-namespace',
  state: {
    link(state) {
      const value: CustomValue = [...state.children()];

      return {
        nested: {
          canOpen: () => state.selection() != null,
        },
        selectedHref: () => null,
        value,
      };
    },
    table(state) {
      return {
        isInTable: () => state.nodes.hasPath([0]),
        rowCount: () => state.children().length,
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
        setHref(href: string) {
          tx.nodes.set({ url: href }, { at: [0] });
        },
      };
    },
    media(tx) {
      return {
        insertImage(src: string) {
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
            { at: [tx.children().length] }
          );
        },
        rowCount: () => tx.children().length,
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
            rowCount: () => state.children().length,
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
            rowCount: () => tx.children().length,
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
  name: 'bad-command-namespace',
  // @ts-expect-error raw Plite extensions do not expose public command slots
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
      context.state.selection();

      // @ts-expect-error clipboard middleware gets state, not tx
      context.tx;

      return context.next();
    },
  },
  queries: {
    text: {
      string(context) {
        context.state.selection();

        // @ts-expect-error query middleware gets state, not tx
        context.tx;

        return context.next({ at: context.at, options: context.options });
      },
    },
  },
  transforms: {
    insertText(context) {
      context.tx.selection();

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
      const value: CustomValue = context.tx.value().children;

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
      const value: CustomValue = tx.value().children;

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

const editor = createEditor({ extensions: [extension] as const, initialValue });

const selectedHref: string | null = editor.read((state) =>
  state.link.selectedHref()
);
const customValue: CustomValue = editor.read((state) => state.link.value);
const canOpen: boolean = editor.read((state) => state.link.nested.canOpen());
const tableRowCount: number = editor.read((state) => state.table.rowCount());
const isInTable: boolean = editor.read((state) => state.table.isInTable());
const directSelectedHref: string | null = editor.read.link.selectedHref();
const directCustomValue: CustomValue = editor.read.link.value;
const directCanOpen: boolean = editor.read.link.nested.canOpen();
const directTableRowCount: number = editor.read.table.rowCount();
const directIsInTable: boolean = editor.read.table.isInTable();

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
editor.update.table.insertRow();
editor.update.link.setHref('https://example.com');
editor.update.media.insertImage('image.png');

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
void directSelectedHref;
void directCustomValue;
void directCanOpen;
void directTableRowCount;
void directIsInTable;
