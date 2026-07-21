import {
  createEditor,
  defineEditorExtension,
  editorCommands,
  type Editor,
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

type RuntimeMode = {
  get: () => 'cell' | 'text';
  set: (value: 'cell' | 'text') => void;
};

const runtimeModes = new WeakMap<Editor, RuntimeMode>();
const getRuntimeMode = (editor: Editor) => {
  const mode = runtimeModes.get(editor);

  if (!mode) throw new Error('Runtime extension is not active.');

  return mode;
};

const runtimeExtension = defineEditorExtension({
  activate(editor, context) {
    let currentMode: 'cell' | 'text' = context.options.initialMode;
    const signal: AbortSignal = context.signal;
    const mode: RuntimeMode = {
      get: () => currentMode,
      set: (value) => {
        currentMode = value;
      },
    };

    runtimeModes.set(editor, mode);
    context.onCleanup(() => {
      if (runtimeModes.get(editor) === mode) runtimeModes.delete(editor);
    });
    void signal;
  },
  name: 'runtime-generic-namespace',
  options: {
    initialMode: 'text' as const,
  },
  state: {
    table(state, editor) {
      const mode = getRuntimeMode(editor);

      return {
        isInTable: () => mode.get() === 'cell' && state.nodes.hasPath([0]),
        rowCount: () => state.children().length,
      };
    },
  },
  tx: {
    table(tx, editor) {
      const mode = getRuntimeMode(editor);

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
});

defineEditorExtension({
  name: 'bad-register-slot',
  // @ts-expect-error extension registration is declarative
  register() {
    return {};
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-command-namespace',
  commands: [
    // @ts-expect-error command registrations come from typed command handles
    {
      handler: () => false,
    },
  ],
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-engine-transform',
  // @ts-expect-error Plite extensions expose pure commands, not transforms
  transforms: {
    normalize() {},
  },
});

defineEditorExtension<CustomEditor>()({
  name: 'middleware-context-typing',
  clipboard: {
    insertData(_data, context) {
      context.tx.selection();

      // @ts-expect-error clipboard middleware reads through its transaction
      context.state;

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
  commands: [
    editorCommands.insertText.handle((context, next) => {
      context.state.selection();
      context.command.text;

      // @ts-expect-error pure command handlers do not receive a live tx
      context.tx;

      return next({ ...context.command, text: context.command.text });
    }),
  ],
});

defineEditorExtension<CustomEditor>()({
  name: 'correction-typing',
  corrections: [
    {
      event: 'content',
      correct({ entry, tx }) {
        const value: CustomValue = tx.value().children;

        tx.schema.isInline(entry[0]);
        tx.nodes.insert({
          type: 'paragraph',
          children: [{ text: entry[1].join('.') }],
        } satisfies ParagraphElement);

        // @ts-expect-error correction tx cannot recursively normalize
        tx.normalize();
        // @ts-expect-error correction tx cannot replace the whole value
        tx.value.replace({ children: value, selection: null });
      },
    },
  ],
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-legacy-normalizers-slot',
  // @ts-expect-error extensions use declarative corrections
  normalizers: {},
});

defineEditorExtension<CustomEditor>()({
  name: 'bad-correction-event',
  corrections: [
    {
      // @ts-expect-error corrections only expose declared events
      event: 'root',
      correct() {},
    },
  ],
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

const _assertNormalizationApisStayPrivate = () => {
  editor.update((tx) => {
    // @ts-expect-error normalization scheduling is not a transaction API
    tx.normalize();
  });

  // @ts-expect-error full repair lives at editor.update.value.repair
  editor.update.normalize();
};

editor.update.value.repair();
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
