import {
  createEditor,
  defineExtension,
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
const initialValue: CustomValue = [
  { type: 'paragraph', children: [{ text: 'paragraph' }] },
];

const LinkExtension = defineExtension('link', {
  read: ({ state }) => ({
    nested: {
      canOpen: () => state.selection() != null,
    },
    selectedHref: () => null as string | null,
    value: () => [...state.children()] as CustomValue,
  }),
  update: ({ tx }) => ({
    nested: {
      remove() {
        tx.nodes.remove({ at: [0] });
      },
    },
    setHref(href: string) {
      tx.nodes.set({ url: href }, { at: [0] });
    },
  }),
});

const MediaExtension = defineExtension('media', {
  update: ({ tx }) => ({
    insertImage(src: string) {
      tx.nodes.insert({
        type: 'image',
        src,
        children: [{ text: '' }],
      } satisfies ImageElement);
    },
  }),
});

const TableExtension = defineExtension('table', {
  read: ({ state }) => ({
    isInTable: () => state.nodes.hasPath([0]),
    rowCount: () => state.children().length,
  }),
  update: ({ tx }) => ({
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
  }),
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

const runtimeExtension = defineExtension('runtimeTable', {
  activate(context) {
    const { editor } = context;
    let currentMode: 'cell' | 'text' = 'text';
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
  read: ({ editor, state }) => {
    const mode = getRuntimeMode(editor);

    return {
      isInTable: () => mode.get() === 'cell' && state.nodes.hasPath([0]),
      rowCount: () => state.children().length,
    };
  },
  update: ({ editor, tx }) => {
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
});

defineExtension('bad-register-slot', {
  // @ts-expect-error extension registration is declarative
  register() {
    return {};
  },
});

defineExtension('bad-command-namespace', {
  // @ts-expect-error command registrations require a full registration
  commands: () => [
    {
      handler: () => false,
    },
  ],
});

defineExtension('bad-engine-transform', {
  // @ts-expect-error Plite extensions expose pure commands, not transforms
  transforms: {
    normalize() {},
  },
});

defineExtension('middleware-context-typing', {
  commands: ({ around }) => [
    around(editorCommands.insertText, ({ next, ...context }) => {
      context.state.selection();
      context.input.text;

      // @ts-expect-error pure command handlers do not receive a live tx
      context.tx;

      return next({ ...context.input, text: context.input.text });
    }),
  ],
});

defineExtension('correction-typing', {
  corrections: [
    {
      event: 'content',
      correct({ entry, tx }) {
        const value = tx.value().children;

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

defineExtension('bad-legacy-normalizers-slot', {
  // @ts-expect-error extensions use declarative corrections
  normalizers: {},
});

defineExtension('bad-correction-event', {
  corrections: [
    {
      // @ts-expect-error corrections only expose declared events
      event: 'root',
      correct() {},
    },
  ],
});

const editor = createEditor({
  extensions: [LinkExtension, MediaExtension, TableExtension] as const,
  initialValue,
});

const selectedHref: string | null = editor.read((state) =>
  state.link.selectedHref()
);
const customValue: CustomValue = editor.read((state) => state.link.value());
const canOpen: boolean = editor.read((state) => state.link.nested.canOpen());
const tableRowCount: number = editor.read((state) => state.table.rowCount());
const isInTable: boolean = editor.read((state) => state.table.isInTable());
const directSelectedHref: string | null = editor.read.link.selectedHref();
const directCustomValue: CustomValue = editor.read.link.value();
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
