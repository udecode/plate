import assert from 'node:assert/strict';

import {
  createEditor as createPliteEditor,
  defineExtension,
  defineEditorSchema,
  type Descendant,
  ElementApi,
  type Element,
  type EditorCommit,
  property,
  schema,
  SelectionApi,
  type TextInsertFragmentOptions,
} from 'plitejs';

import { DocumentIndex } from '../src/core/change/document-index';
import {
  applyTransactionSpec,
  runEditorTransaction as runInternalEditorTransaction,
} from '../src/core/public-state';
import {
  addMark as editorAddMark,
  collapse as editorCollapse,
  delete as editorDelete,
  deleteBackward as editorDeleteBackward,
  deselect as editorDeselect,
  getSnapshot as editorGetSnapshot,
  insertBreak as editorInsertBreak,
  insertNodes as editorInsertNodes,
  insertSoftBreak as editorInsertSoftBreak,
  insertText as editorInsertText,
  isEditor as editorIsEditor,
  mergeNodes as editorMergeNodes,
  move as editorMove,
  moveNodes as editorMoveNodes,
  projectRangeInSnapshot,
  projectRange as editorProjectRange,
  removeMark as editorRemoveMark,
  removeNodes as editorRemoveNodes,
  replace as editorReplaceBase,
  select as editorSelect,
  setPoint as editorSetPoint,
  setSelection as editorSetSelection,
  setNodes as editorSetNodes,
  splitNodes as editorSplitNodes,
  subscribe as editorSubscribe,
  subscribeSource as editorSubscribeSource,
  toggleMark as editorToggleMark,
  liftNodes as editorLiftNodes,
  unwrapNodes as editorUnwrapNodes,
  unsetNodes as editorUnsetNodes,
  wrapNodes as editorWrapNodes,
} from '../src/internal';

type NestedTextElement = {
  a?: boolean;
  readonly children: ReadonlyArray<{
    readonly children: ReadonlyArray<{ readonly text: string }>;
  }>;
  type: string;
};

it('maps replacement identities with work bounded by changed nodes', () => {
  const blocks = 128;
  const value = (prefix: string) =>
    Array.from({ length: blocks }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `${prefix}-${index} same suffix` }],
    }));
  const editor = createPliteEditor();
  editor.update((tx) =>
    tx.value.replace({
      children: value('before'),
      marks: null,
      selection: null,
    })
  );
  const before = editorGetSnapshot(editor);
  const beforeKey = before.index.keyAt([blocks - 1, 0]);
  const children = value('after');
  const readNode = DocumentIndex.prototype.node;
  let reads = 0;
  DocumentIndex.prototype.node = function node(...args) {
    reads += 1;
    return readNode.apply(this, args);
  };
  try {
    editor.update((tx) =>
      tx.value.replace({ children, marks: null, selection: null })
    );
  } finally {
    DocumentIndex.prototype.node = readNode;
  }
  const after = editorGetSnapshot(editor);
  assert.deepEqual(after.children, children);
  assert.equal(before.index.keyAt([blocks - 1, 0]), beforeKey);
  assert.equal(
    before.children[blocks - 1].children[0].text,
    'before-127 same suffix'
  );
  const key = after.index.keyAt([blocks - 1, 0]);
  editor.update((tx) =>
    tx.text.insert('!', { at: { path: [blocks - 1, 0], offset: 0 } })
  );
  assert.equal(editorGetSnapshot(editor).index.keyAt([blocks - 1, 0]), key);
  assert.equal(
    after.children[blocks - 1].children[0].text,
    'after-127 same suffix'
  );
  assert.ok(
    reads <= blocks * 64,
    `replacement identity work must be linear; read ${reads} nodes`
  );
});

type LegacySnapshotInput = Omit<
  Parameters<typeof editorReplaceBase>[1],
  'children'
> & {
  children: Descendant[];
};

const editorReplace = editorReplaceBase as unknown as (
  editor: Parameters<typeof editorReplaceBase>[0],
  input: LegacySnapshotInput
) => void;

const replaceSlice = (
  editor: ReturnType<typeof createEditor>,
  content: readonly Descendant[],
  options?: TextInsertFragmentOptions
) =>
  editor.update((tx) => {
    tx.fragment.replace(content, options);
  });

const runEditorTransaction = (
  editor: Parameters<typeof runInternalEditorTransaction>[0],
  fn: Parameters<typeof runInternalEditorTransaction>[1],
  options: Parameters<typeof runInternalEditorTransaction>[2] = {}
) =>
  runInternalEditorTransaction(editor, fn, {
    authority: 'explicit',
    ...options,
  });

const inlineContent = schema.content.any(
  [schema.content.text(), schema.content.types(['inline', 'link', 'mention'])],
  { default: 'text', min: 1 }
);
const blockContent = schema.content.types(
  [
    'article',
    'block',
    'bulleted-list',
    'code-block',
    'container',
    'heading',
    'list-item',
    'numbered-list',
    'paragraph',
    'quote',
    'section',
    'thematic-break',
  ],
  { default: { type: 'paragraph' }, min: 1 }
);

const SnapshotContractSchema = defineEditorSchema('schema:snapshot-contract', {
  elements: {
    article: { content: blockContent } as const,
    block: { content: inlineContent } as const,
    'bulleted-list': {
      content: schema.content.type('list-item', {
        default: { type: 'list-item' },
        min: 1,
      }),
    } as const,
    'code-block': {
      content: schema.content.type('code-line', {
        default: { type: 'code-line' },
        min: 1,
      }),
    } as const,
    'code-line': { content: inlineContent } as const,
    container: { content: blockContent } as const,
    heading: { content: inlineContent } as const,
    inline: { content: inlineContent, inline: true } as const,
    link: { content: inlineContent, inline: true } as const,
    'list-item': { content: inlineContent } as const,
    mention: { void: 'markable-inline' } as const,
    'numbered-list': {
      content: schema.content.type('list-item', {
        default: { type: 'list-item' },
        min: 1,
      }),
    } as const,
    paragraph: {
      content: inlineContent,
      properties: {
        id: property.string(),
        rootWrap: property.boolean(),
      },
    } as const,
    quote: { content: blockContent } as const,
    section: { content: blockContent } as const,
    'thematic-break': { void: 'block' } as const,
  },
  id: 'snapshot-contract',
  properties: [schema.textProperty('segment', property.boolean())],
  root: schema.content.types(
    [
      'article',
      'block',
      'bulleted-list',
      'code-block',
      'container',
      'heading',
      'list-item',
      'numbered-list',
      'paragraph',
      'quote',
      'section',
      'thematic-break',
    ],
    { default: { type: 'paragraph' }, min: 1 }
  ),
  unknown: 'preserve',
  version: 1,
});

const createEditor = ((options = {}) =>
  createPliteEditor({
    ...options,
    extensions: [SnapshotContractSchema],
  })) as typeof createPliteEditor;

const getMarks = (editor: ReturnType<typeof createEditor>) =>
  editor.read((state) => state.marks());

const createChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const createLegacyBlockChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'two' }],
  },
];

const createLegacyMoveChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one two three' }],
  },
];

const createLegacySingleBlockChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
];

const createLegacyDeleteBoundaryChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'word' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'another' }],
  },
];

const createLegacyInlineDeleteChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [
      { text: 'one' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'two' }],
      },
      { text: 'three' },
    ],
  },
];

const createLegacyInlineDeleteInsideChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [
      { text: '' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'word' }],
      },
      { text: '' },
    ],
  },
];

const createLegacyInlineBoundaryChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
  {
    type: 'paragraph',
    children: [
      { text: 'two' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'three' }],
      },
      { text: 'four' },
    ],
  },
];

const createLegacyInlineAfterChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [
      { text: 'one' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'two' }],
      },
      { text: 'a' },
    ],
  },
];

const createLegacyWrappedBlockChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'word' }],
  },
];

const createLegacyNestedBlockChildren = (): Element[] => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
    ],
  },
];

const createLegacyNestedBlockAcrossChildren = (): Element[] => [
  {
    type: 'quote',
    a: true,
    children: createLegacyBlockChildren(),
  },
];

const createLegacyQuoteChildren = (...texts: string[]): Element[] => [
  {
    type: 'quote',
    children: texts.map((text) => ({
      type: 'paragraph',
      children: [{ text }],
    })),
  },
];

const createLegacyNestedBlockStartChildren = (): Element[] => [
  {
    type: 'quote',
    a: true,
    children: createLegacyQuoteChildren(
      'one',
      'two',
      'three',
      'four',
      'five',
      'six'
    )[0].children,
  },
];

const createLegacyNestedBlockMultipleChildren = (): Element[] => [
  ...createLegacyQuoteChildren('one', 'two'),
];

const createLegacyLiftFullChildren = (): Element[] => [
  ...createLegacyQuoteChildren('one', 'two', 'three', 'four', 'five', 'six'),
];

const createLegacyLiftPairChildren = createLegacyNestedBlockMultipleChildren;

const createLegacyLiftTripleChildren = (): Element[] => [
  ...createLegacyQuoteChildren('one', 'two', 'three'),
];

const createExpandedChildren = (): Element[] => [
  ...createChildren(),
  {
    type: 'paragraph',
    children: [{ text: 'gamma' }],
  },
];

const createStyledChildren = (): Element[] => [
  {
    type: 'paragraph',
    align: 'left',
    children: [{ text: 'alpha', bold: true }],
  },
  {
    type: 'paragraph',
    align: 'right',
    children: [{ text: 'beta' }],
  },
];

const createMergeTextChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [
      { text: 'al', bold: true },
      { text: 'pha', bold: true },
    ],
  },
];

const createElementMergeChildren = (): Element[] => [
  {
    type: 'paragraph',
    data: true,
    children: [{ text: 'before' }],
  },
  {
    type: 'paragraph',
    data: true,
    children: [
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'two' }],
      },
      { text: 'after' },
    ],
  },
];

const createWrapChildren = (): Element[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
];

const createListWrapperChildren = (): Element[] => [
  {
    type: 'bulleted-list',
    children: [
      {
        type: 'list-item',
        children: [{ text: 'one' }],
      },
      {
        type: 'list-item',
        children: [{ text: 'two' }],
      },
    ],
  },
];

const createUnwrapChildren = (): Element[] => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ],
  },
];

const createTopLevelUnwrapChildren = (): Element[] => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ],
  },
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
    ],
  },
];

const createLiftOnlyChildChildren = (): Element[] => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
  },
];

const createLiftSiblingChildren = (): Element[] => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'one' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'three' }],
      },
    ],
  },
];

const createElementSplitChildren = (): Element[] => [
  {
    type: 'paragraph',
    data: true,
    children: [
      { text: 'before' },
      {
        type: 'link',
        url: 'https://example.com',
        children: [{ text: 'hyperlink' }],
      },
      { text: 'after' },
    ],
  },
];

const getBlockTexts = (children: readonly Descendant[]) =>
  children.map((node) => {
    assert.ok(ElementApi.isElement(node));
    return node.children
      .map((child) => ('text' in child ? child.text : ''))
      .join('');
  });

it('defers custom normalization until the outer update commits', () => {
  const editor = createEditor();
  let runs = 0;
  let runsInsideCallback = 0;

  editor.install(
    defineExtension('deferred-correction-observer', {
      corrections: [
        {
          correct() {
            runs += 1;
          },
          event: 'content',
        },
      ],
    })
  );

  editor.update(() => {
    editorReplace(editor, {
      children: createChildren(),
      selection: null,
    });

    runsInsideCallback = runs;
  });

  assert.equal(runsInsideCallback, 0);
  assert.equal(runs > 0, true);

  editor.update.value.repair();

  assert.equal(runs > 0, true);
});

it('normalizes split dirty paths instead of the full document', () => {
  const editor = createEditor();
  const normalizedTopLevelPaths: number[] = [];

  editor.install(
    defineExtension('dirty-path-observer', {
      corrections: [
        {
          correct({ entry: [, path] }) {
            if (path.length === 1) {
              normalizedTopLevelPaths.push(path[0]);
            }
          },
          event: 'content',
        },
      ],
    })
  );

  editorReplace(editor, {
    children: Array.from({ length: 256 }, (_value, index) => ({
      type: 'paragraph',
      children: [{ text: `line ${index}` }],
    })),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  normalizedTopLevelPaths.length = 0;

  editor.update((tx) => {
    tx.break.insert();
  });

  assert.equal(normalizedTopLevelPaths.includes(200), false);
  assert.ok(normalizedTopLevelPaths.some((path) => path <= 1));
  assert.deepEqual(
    getBlockTexts(editorGetSnapshot(editor).children).slice(0, 3),
    ['li', 'ne 0', 'line 1']
  );
});

it('mirrors the legacy transforms/normalization/split_node-and-insert_node.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          { text: '' },
          { type: 'inline', children: [{ text: 'one' }] },
          { text: '' },
        ],
      },
      {
        type: 'block',
        children: [
          { text: '' },
          { type: 'inline', children: [{ text: 'two' }] },
          { text: '' },
        ],
      },
    ],
    selection: null,
  });

  editor.update((tx) => {
    tx.nodes.split({
      at: [0],
      position: 1,
    });
    tx.nodes.split({
      at: [2],
      position: 1,
    });
    tx.nodes.insert({ text: '' }, { at: [2, 1] });
  });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'block',
      children: [{ text: '' }],
    },
    {
      type: 'block',
      children: [
        { text: '' },
        { type: 'inline', children: [{ text: 'one' }] },
        { text: '' },
      ],
    },
    {
      type: 'block',
      children: [{ text: '' }],
    },
    {
      type: 'block',
      children: [
        { text: '' },
        { type: 'inline', children: [{ text: 'two' }] },
        { text: '' },
      ],
    },
  ]);
});

it('shouldMergeNodesRemovePrevNode can remove an empty previous sibling during mergeNodes', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
    ],
    selection: null,
  });

  editorMergeNodes(editor, { at: [1] });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'two' }],
    },
  ]);
});

it('fails intentionally when custom normalization revisits an earlier draft state', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'alpha' }] },
      { type: 'paragraph', children: [{ text: 'beta' }] },
    ],
    selection: null,
  });

  editor.install(
    defineExtension('cycling-root-correction', {
      corrections: [
        {
          correct({ tx }) {
            if (tx.nodes.children().length === 1) {
              tx.nodes.insert(
                {
                  type: 'paragraph',
                  children: [{ text: '' }],
                },
                { at: [1] }
              );
              return;
            }

            tx.nodes.remove({ at: [1] });
          },
          event: 'children',
          query: 'root',
        },
      ],
    })
  );

  assert.throws(() => {
    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ],
      selection: null,
    });
  }, /Structural correction cycle/);
});

it('treats semantic id prop changes as normalization progress', () => {
  const editor = createEditor();

  editor.install(
    defineExtension('semantic-id-correction', {
      corrections: [
        {
          correct({ entry: [node, path], tx }) {
            if (
              path.length === 1 &&
              !editorIsEditor(node) &&
              ElementApi.isElement(node) &&
              node.type === 'paragraph' &&
              (node as Element & { id?: string }).id !== 'kept'
            ) {
              tx.nodes.set({ id: 'kept' }, { at: path });
            }
          },
          event: 'content',
        },
      ],
    })
  );

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  assert.equal(
    (editorGetSnapshot(editor).children[0] as Element & { id?: string }).id,
    'kept'
  );
});

it('a registered correction can enforce a descendant-level node rewrite', () => {
  const editor = createEditor();

  editor.install(
    defineExtension('heading-correction', {
      corrections: [
        {
          correct({ entry: [node, path], tx }) {
            if (
              path.length > 0 &&
              'children' in node &&
              node.type === 'heading'
            ) {
              tx.nodes.set(
                {
                  type: 'paragraph',
                },
                { at: path }
              );
            }
          },
          event: 'content',
        },
      ],
    })
  );

  editorReplace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: 'nested' }],
      },
    ],
    selection: null,
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'nested' }],
    },
  ]);
});

it('a root correction can wrap a semantically matched top-level block', () => {
  const editor = createEditor();

  editor.install(
    defineExtension('root-block-content', {
      corrections: [
        {
          correct: ({ entry, tx }) => {
            const [, path] = entry;
            const index = tx.nodes
              .children()
              .findIndex(
                (child) =>
                  ElementApi.isElement(child) && child.rootWrap === true
              );

            if (index === -1) return;

            tx.nodes.wrap(
              { type: 'quote', children: [] },
              {
                at: [...path, index],
              }
            );
          },
          event: 'content',
          query: 'root',
        },
      ],
    })
  );

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        rootWrap: true,
        children: [{ text: 'alpha' }],
      },
      { type: 'paragraph', children: [{ text: 'beta' }] },
    ],
    selection: null,
  });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'quote',
      children: [
        {
          type: 'paragraph',
          rootWrap: true,
          children: [{ text: 'alpha' }],
        },
      ],
    },
    { type: 'paragraph', children: [{ text: 'beta' }] },
  ]);
});

it('the correction kernel inserts an empty text child into empty elements', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [],
      },
    ],
    selection: null,
  });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
});

it('normalizes empty elements inserted by a root replacement', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
  });

  editor.update((tx) => {
    tx.value.replace({
      children: [{ type: 'paragraph', children: [] }],
      selection: null,
    });
  });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
});

it('normalizes empty elements inserted by a nested replacement', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'quote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'alpha' }],
          },
        ],
      },
    ],
    selection: null,
  });

  editor.update((tx) => {
    tx.nodes.remove({ at: [0, 0] });
    tx.nodes.insert({ type: 'paragraph', children: [] } as Descendant, {
      at: [0, 0],
    });
  });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'quote',
      children: [
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
      ],
    },
  ]);
});

it('the correction kernel inserts spacer text around inline-only children', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            children: [{ text: 'beta' }],
          },
        ],
      },
    ],
    selection: null,
  });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'link',
          children: [{ text: 'beta' }],
        },
        { text: '' },
      ],
    },
  ]);
});

it('insertNodes keeps an inline node in the selected empty paragraph', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'after' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorInsertNodes(editor, {
    type: 'link',
    children: [{ text: 'example' }],
  });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'link',
          children: [{ text: 'example' }],
        },
        { text: '' },
      ],
    },
    {
      type: 'paragraph',
      children: [{ text: 'after' }],
    },
  ]);
});

it('the correction kernel removes stray top-level text after insertNodes', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ],
    selection: null,
  });

  editorInsertNodes(editor, { text: 'stray' }, { at: [0] });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'beta' }],
    },
  ]);
});

it('editorNormalize explicitly merges adjacent compatible text children in inline-style containers', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createMergeTextChildren(),
    selection: null,
  });

  editor.update.value.repair();

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha', bold: true }],
    },
  ]);
});

it('editorNormalize explicitly removes empty adjacent text in inline-style containers', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'alpha', bold: true },
          { text: '', bold: true },
          { text: 'beta', bold: true },
        ],
      },
    ],
    selection: null,
  });

  editor.update.value.repair();

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'alphabeta', bold: true }],
    },
  ]);
});

it('the correction kernel flattens direct blocks in inline-style containers', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'alpha', bold: true },
          { text: 'gamma', italic: true },
        ],
      },
    ],
    selection: null,
  });

  editorInsertNodes(
    editor,
    {
      type: 'paragraph',
      children: [{ text: 'beta' }],
    },
    { at: [0, 1] }
  );

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [
        { text: 'alpha', bold: true },
        { text: 'beta' },
        { text: 'gamma', italic: true },
      ],
    },
  ]);
});

it('markableVoid lets addMark and removeMark target the text child inside a void element', () => {
  const editor = createEditor();
  const getMention = (snapshot: ReturnType<typeof editorGetSnapshot>) =>
    snapshot.children[0].children.find(
      (child) => 'children' in child && child.type === 'mention'
    ) as Element & {
      children: Array<Element & { bold?: boolean }>;
    };

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'mention',
            character: 'Ada',
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    },
  });

  editorAddMark(editor, 'bold', true);

  let snapshot = editorGetSnapshot(editor);
  let mention = getMention(snapshot);

  assert.equal(mention.children[0]?.bold, true);

  editorRemoveMark(editor, 'bold');

  snapshot = editorGetSnapshot(editor);
  mention = getMention(snapshot);

  assert.equal(mention.children[0]?.bold, undefined);
});

it('insertBreak splits the current top-level block and moves selection into the new block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  editor.update((_tx) => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'beta' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak preserves a node selection without inventing an aggregate target', () => {
  const children = [
    { type: 'paragraph', children: [{ text: 'one' }] },
    { type: 'paragraph', children: [{ text: 'middle' }] },
    { type: 'paragraph', children: [{ text: 'three' }] },
  ];
  const selection = SelectionApi.nodes([[0], [2]]);
  const editor = createEditor({
    initialSelection: selection,
    initialValue: children,
  });

  editorInsertBreak(editor);

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, children);
  assert.deepEqual(snapshot.selection, selection);
});

it('insertBreak replaces the next soft break with a block split', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha\nbeta' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 'alpha'.length },
      focus: { path: [0, 0], offset: 'alpha'.length },
    },
  });

  editor.update(() => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'beta' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak repeatedly splits trailing empty blocks and moves selection to the document end', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  editor.update((tx) => {
    tx.break.insert();
    tx.break.insert();
    tx.break.insert();
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [3, 0], offset: 0 },
    focus: { path: [3, 0], offset: 0 },
  });
});

it('insertBreak from an empty selectable block void creates a trailing block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'thematic-break',
        children: [{ text: '' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editor.update(() => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'thematic-break',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertSoftBreak from an empty selectable block void creates a trailing block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'thematic-break',
        children: [{ text: '' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editor.update(() => {
    editorInsertSoftBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'thematic-break',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak after marked text moves selection into the new block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'plain ' }, { bold: true, text: 'marked' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1], offset: 6 },
      focus: { path: [0, 1], offset: 6 },
    },
  });

  editor.update(() => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'plain ' }, { bold: true, text: 'marked' }],
    },
    {
      type: 'paragraph',
      children: [{ bold: true, text: '' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak before marked text moves the marked leaf into the new block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'plain ' }, { bold: true, text: 'marked' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    },
  });

  editor.update(() => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'plain ' }],
    },
    {
      type: 'paragraph',
      children: [{ bold: true, text: 'marked' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak at the start of text opens a blank block before the text', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: '🙂or🙁' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editor.update(() => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '🙂or🙁' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak before an inline at block start opens a blank block before the inline', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          {
            type: 'link',
            children: [{ text: 'link' }],
          },
          { text: ' after' },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    },
  });

  editor.update(() => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'link',
          children: [{ text: 'link' }],
        },
        { text: ' after' },
      ],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 1, 0], offset: 0 },
    focus: { path: [1, 1, 0], offset: 0 },
  });
});

it('insertBreak inside a nested block splits the nested block without splitting its container', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'code-block',
        language: 'javascript',
        children: [
          {
            type: 'code-line',
            children: [{ text: 'const value = true' }],
          },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 11 },
      focus: { path: [0, 0, 0], offset: 11 },
    },
  });

  editor.update((_tx) => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'code-block',
      language: 'javascript',
      children: [
        {
          type: 'code-line',
          children: [{ text: 'const value' }],
        },
        {
          type: 'code-line',
          children: [{ text: ' = true' }],
        },
      ],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 0 },
  });
});

it('deleteBackward removes a trailing empty nested block line', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'code-block',
        language: 'javascript',
        children: [
          {
            type: 'code-line',
            children: [{ text: '// Add the initial value.' }],
          },
          {
            type: 'code-line',
            children: [{ text: '' }],
          },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    },
  });

  editor.update(() => {
    editorDeleteBackward(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'code-block',
      language: 'javascript',
      children: [
        {
          type: 'code-line',
          children: [{ text: '// Add the initial value.' }],
        },
      ],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 0, 0], offset: '// Add the initial value.'.length },
    focus: { path: [0, 0, 0], offset: '// Add the initial value.'.length },
  });
});

it('insertBreak inside a list item splits the item and keeps the list wrapper', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'bulleted-list',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'onetwo' }],
          },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 'one'.length },
      focus: { path: [0, 0, 0], offset: 'one'.length },
    },
  });

  editor.update(() => {
    editorInsertBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'bulleted-list',
      children: [
        {
          type: 'list-item',
          children: [{ text: 'one' }],
        },
        {
          type: 'list-item',
          children: [{ text: 'two' }],
        },
      ],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 0 },
  });
});

it('insertSoftBreak inserts a newline through its own command', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    },
  });

  editor.update((_tx) => {
    editorInsertSoftBreak(editor);
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
    {
      type: 'paragraph',
      children: [{ text: '\nbeta' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 1 },
    focus: { path: [1, 0], offset: 1 },
  });
});

it('slice replacement keeps nested selection paths under the insertion ancestor', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'article',
        children: [
          {
            type: 'section',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'xx' }],
              },
            ],
          },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0, 0], offset: 1 },
    },
  });

  replaceSlice(editor, [
    {
      type: 'paragraph',
      children: [{ text: 'AA' }],
    },
    {
      type: 'container',
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'BB' }],
        },
      ],
    },
  ]);

  assert.deepEqual(editorGetSnapshot(editor).selection, {
    kind: 'text',
    anchor: { path: [0, 0, 2, 0, 0], offset: 2 },
    focus: { path: [0, 0, 2, 0, 0], offset: 2 },
  });
});

it('publishes once after a transaction and keeps same-version reads stable', () => {
  const editor = createEditor();
  const snapshots = [editorGetSnapshot(editor)];
  let notifications = 0;

  editorSubscribe(editor, (snapshot) => {
    notifications += 1;
    snapshots.push(snapshot);
  });

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
      marks: { bold: true },
    },
  });

  const before = editorGetSnapshot(editor);
  const beforeAgain = editorGetSnapshot(editor);

  assert.equal(before, beforeAgain);

  editor.update((_tx) => {
    editorInsertText(editor, '!', { at: { path: [0, 0], offset: 5 } });
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    });
  });

  const after = editorGetSnapshot(editor);

  assert.equal(notifications, 2);
  assert.equal(after.children[0].children[0].text, 'alpha!');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });
  assert.notEqual(before, after);
});

it('keeps text snapshots stable across later path-stable text commits', () => {
  const editor = createEditor();
  const snapshots: Array<ReturnType<typeof editorGetSnapshot>> = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editorSubscribe(editor, (snapshot) => {
    snapshots.push(snapshot);
  });

  editor.update((tx) => {
    tx.text.insert('!', {
      at: { path: [0, 0], offset: 5 },
    });
  });

  const first = snapshots.at(-1)!;

  editor.update((tx) => {
    tx.text.insert('?', {
      at: { path: [0, 0], offset: 6 },
    });
  });

  const second = snapshots.at(-1)!;

  assert.equal(first.children[0].children[0].text, 'alpha!');
  assert.equal(second.children[0].children[0].text, 'alpha!?');
  assert.equal(first.children[1], second.children[1]);
});

it('keeps node keys unique when replacing a complete marked text leaf', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'prefix ' },
          { bold: true, text: 'bold' },
          { text: ', ' },
          { italic: true, text: 'italic' },
        ],
      },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 4 },
    },
  });

  const before = editorGetSnapshot(editor);
  const replacedId = before.index.keyAt([0, 1]);
  const trailingId = before.index.keyAt([0, 2]);

  editor.update((tx) => {
    tx.text.insert('p');
  });

  const after = editorGetSnapshot(editor);
  const ids = after.index.entries().map(([nodeKey]) => nodeKey);

  assert.deepEqual(after.children[0].children, [
    { text: 'prefix ' },
    { bold: true, text: 'p' },
    { text: ', ' },
    { italic: true, text: 'italic' },
  ]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(after.index.keyAt([0, 1]), replacedId);
  assert.equal(after.index.keyAt([0, 2]), trailingId);
});

it('publishes one path-stable snapshot for batched text commits', () => {
  const editor = createEditor();
  const snapshots: Array<ReturnType<typeof editorGetSnapshot>> = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);

  editorSubscribe(editor, (snapshot) => {
    snapshots.push(snapshot);
  });

  editor.update((tx) => {
    tx.text.insert('!', {
      at: { path: [0, 0], offset: 5 },
    });
    tx.text.insert('?', {
      at: { path: [0, 0], offset: 6 },
    });
    tx.text.insert('!', {
      at: { path: [1, 0], offset: 4 },
    });
  });

  const after = snapshots.at(-1)!;

  assert.equal(snapshots.length, 1);
  assert.equal(after.children[0].children[0].text, 'alpha!?');
  assert.equal(after.children[1].children[0].text, 'beta!');
  assert.equal(before.children[0].children[0].text, 'alpha');
  assert.equal(before.children[1].children[0].text, 'beta');
  assert.equal(after.index, before.index);
});

it('reuses snapshot indexes for selection-only listener snapshots', () => {
  const editor = createEditor();
  const snapshots: Array<ReturnType<typeof editorGetSnapshot>> = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const before = editorGetSnapshot(editor);

  editorSubscribe(editor, (snapshot) => {
    snapshots.push(snapshot);
  });

  editorSelect(editor, {
    anchor: { path: [1, 0], offset: 2 },
    focus: { path: [1, 0], offset: 2 },
  });

  const after = snapshots.at(-1)!;

  assert.equal(snapshots.length, 1);
  assert.equal(after.index, before.index);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 2 },
    focus: { path: [1, 0], offset: 2 },
  });
  assert.equal(after.children, before.children);
  assert.equal(after.version, before.version + 1);
});

it('publishes touched node keys for collapsed text changes', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const snapshot = editorGetSnapshot(editor);
  const blockNodeKey = snapshot.index.keyAt([0]);
  const nodeKey = snapshot.index.keyAt([0, 0]);

  assert.ok(blockNodeKey);
  assert.ok(nodeKey);

  editorSubscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
  });

  assert.equal(changes.length, 1);
  assert.equal(changes[0]?.changed.has('text'), true);
  assert.deepEqual(changes[0]?.changed.topLevelRanges(), [[0, 0]]);
  assert.equal(changes[0]?.changed.has('document'), true);
  assert.equal(changes[0]?.selectionChanged, false);
  assert.deepEqual(changes[0]?.changed.nodeKeys('node'), [
    blockNodeKey,
    nodeKey,
  ]);
  assert.deepEqual(changes[0]?.changed.nodeKeys('decoration'), [
    blockNodeKey,
    nodeKey,
  ]);
});

it('notifies snapshot subscribers with canonical commit metadata', () => {
  const editor = createEditor();
  const callOrder: string[] = [];
  const changes: EditorCommit[] = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  editorSubscribe(editor, (_snapshot, change) => {
    callOrder.push('subscribe');
    if (change) {
      changes.push(change);
    }
  });

  editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
  });

  assert.deepEqual(callOrder, ['subscribe']);
  assert.equal(changes.length, 1);
  assert.equal(changes[0]?.changed.has('text'), true);
  assert.equal(
    editorGetSnapshot(editor).children[0].children[0].text,
    'alpha!'
  );
});

it('publishes selection-only dirtiness without touched node keys', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const initialSnapshot = editorGetSnapshot(editor);
  const initialBlockNodeKey = initialSnapshot.index.keyAt([0]);
  const initialTextNodeKey = initialSnapshot.index.keyAt([0, 0]);

  editorSubscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editor.update((_tx) => {
    editorSelect(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  const snapshot = editorGetSnapshot(editor);
  const selectedBlockNodeKey = snapshot.index.keyAt([1]);
  const selectedTextNodeKey = snapshot.index.keyAt([1, 0]);

  assert.equal(changes.length, 1);
  assert.equal(changes[0]?.changed.has('selection'), true);
  assert.equal(changes[0]?.changed.has('document'), false);
  assert.equal(changes[0]?.selectionChanged, true);
  assert.deepEqual(changes[0]?.changed.nodeKeys('node'), []);
  assert.deepEqual(changes[0]?.changed.nodeKeys('selection'), [
    initialTextNodeKey,
    initialBlockNodeKey,
    selectedTextNodeKey,
    selectedBlockNodeKey,
  ]);
  assert.deepEqual(
    changes[0]?.changed.nodeKeys('decoration'),
    changes[0]?.changed.nodeKeys('selection')
  );
});

it('keeps small top-level expanded selection impact precise', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  editorReplace(editor, {
    children: Array.from({ length: 12 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block ${index}` }],
    })),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const initialSnapshot = editorGetSnapshot(editor);
  const nodeKey = (path: string) =>
    initialSnapshot.index.keyAt(path.split('.').map(Number));

  editorSubscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editor.update(() => {
    editorSelect(editor, {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [6, 0], offset: 'block 6'.length },
    });
  });

  assert.equal(changes.length, 1);
  assert.equal(changes[0]?.changed.has('selection'), true);
  assert.deepEqual(changes[0]?.changed.nodeKeys('selection'), [
    nodeKey('0.0'),
    nodeKey('0'),
    nodeKey('2.0'),
    nodeKey('2'),
    nodeKey('6.0'),
    nodeKey('6'),
    nodeKey('3'),
    nodeKey('3.0'),
    nodeKey('4'),
    nodeKey('4.0'),
    nodeKey('5'),
    nodeKey('5.0'),
  ]);
  assert.deepEqual(
    changes[0]?.changed.nodeKeys('selection'),
    changes[0]?.changed.nodeKeys('selection')
  );
  assert.deepEqual(
    changes[0]?.changed.nodeKeys('decoration'),
    changes[0]?.changed.nodeKeys('selection')
  );
});

it('does not rebuild root snapshots for selection-only subscriber commits', () => {
  const editor = createEditor();
  const profiledIds: string[] = [];
  const previousProfiler = (
    globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: unknown;
    }
  ).__PLITE_REACT_RENDER_PROFILER__;

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorSubscribe(editor, () => {});

  try {
    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record?: (event: { id: string; kind: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record(event) {
        if (event.kind === 'core-time') {
          profiledIds.push(event.id);
        }
      },
    };

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 1 },
      });
    });
  } finally {
    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
  }

  assert.ok(profiledIds.includes('build-change'));
  assert.equal(profiledIds.includes('next-snapshot'), false);
});

it('does not materialize listener snapshots for irrelevant source subscribers', () => {
  const editor = createEditor();
  const profiledIds: string[] = [];
  const sourceCalls: string[] = [];
  const previousProfiler = (
    globalThis as typeof globalThis & {
      __PLITE_REACT_RENDER_PROFILER__?: unknown;
    }
  ).__PLITE_REACT_RENDER_PROFILER__;

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const unsubscribe = editorSubscribeSource(editor, 'text', () => {
    sourceCalls.push('text');
  });

  try {
    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: {
          record?: (event: { id: string; kind: string }) => void;
        };
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = {
      record(event) {
        if (event.kind === 'core-time') {
          profiledIds.push(event.id);
        }
      },
    };

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 1 },
      });
    });
  } finally {
    unsubscribe();
    (
      globalThis as typeof globalThis & {
        __PLITE_REACT_RENDER_PROFILER__?: unknown;
      }
    ).__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
  }

  assert.deepEqual(sourceCalls, []);
  assert.ok(profiledIds.includes('notify-listeners'));
  assert.ok(profiledIds.includes('notify-commit-listeners'));
  assert.equal(profiledIds.includes('listener-snapshot'), false);
  assert.equal(profiledIds.includes('notify-source-listeners'), false);
});

it('routes selection-only commits through source subscribers only', () => {
  const editor = createEditor();
  const sourceCalls: string[] = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const unsubscribe = [
    editorSubscribeSource(editor, 'commit', () => {
      sourceCalls.push('commit');
    }),
    editorSubscribeSource(editor, 'selection', () => {
      sourceCalls.push('selection');
    }),
    editorSubscribeSource(editor, 'text', () => {
      sourceCalls.push('text');
    }),
    editorSubscribeSource(editor, 'node', () => {
      sourceCalls.push('node');
    }),
    editorSubscribeSource(editor, 'decoration', () => {
      sourceCalls.push('decoration');
    }),
    editorSubscribeSource(editor, 'root', () => {
      sourceCalls.push('root');
    }),
  ];

  editor.update((tx) => {
    tx.selection.set({
      kind: 'text',
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  assert.deepEqual(sourceCalls, ['commit', 'selection']);

  unsubscribe.forEach((entry) => {
    entry();
  });
});

it('uses broad selection impact for large cross-document selections', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  editorReplace(editor, {
    children: Array.from({ length: 200 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block ${index}` }],
    })),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorSubscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editor.update(() => {
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [199, 0], offset: 'block 199'.length },
    });
  });

  assert.equal(changes.length, 1);
  assert.equal(changes[0]?.changed.has('selection'), true);
  assert.equal(changes[0]?.changed.nodeKeys('selection').length, 400);
  assert.equal(changes[0]?.changed.nodeKeys('decoration').length, 400);
});

it('publishes replace-level broad invalidation for editorReplace', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editorSubscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'changed' }],
      },
    ],
    selection: null,
  });

  assert.equal(changes.length, 1);
  assert.equal(changes[0]?.changed.has('replace'), true);
  assert.equal(changes[0]?.changed.has('document'), true);
  assert.equal(changes[0]?.selectionChanged, false);
  assert.ok(changes[0]?.changed.nodeKeys('node').length > 0);
  assert.ok(changes[0]?.changed.nodeKeys('decoration').length > 0);
});

it('publishes marks-only dirtiness without pretending the document paths changed', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorSubscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editorAddMark(editor, 'bold', true);

  assert.equal(changes.length, 1);
  assert.equal(changes[0]?.changed.has('marks'), true);
  assert.equal(changes[0]?.changed.has('document'), false);
  assert.equal(changes[0]?.selectionChanged, false);
  assert.deepEqual(changes[0]?.changed.nodeKeys('node'), []);
});

it('publishes an immutable cloned selection for a text change', () => {
  const editor = createEditor();
  const selection = {
    kind: 'text' as const,
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  };

  editorReplace(editor, {
    children: createChildren(),
    selection,
  });

  editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });
  assert.ok(SelectionApi.isText(snapshot.selection));
  assert.notEqual(snapshot.selection, selection);
  assert.notEqual(snapshot.selection.anchor, selection.anchor);
  assert.throws(() => {
    (
      snapshot.selection as NonNullable<typeof snapshot.selection>
    ).anchor.offset = 99;
  });
  const currentSelection = editorGetSnapshot(editor).selection;

  assert.ok(SelectionApi.isText(currentSelection));
  assert.equal(currentSelection.anchor.offset, 6);
  assert.throws(() => {
    (
      snapshot.selection as NonNullable<typeof snapshot.selection>
    ).anchor.path[0] = 9;
  });
  const currentSelectionAfterMutation = editorGetSnapshot(editor).selection;

  assert.ok(SelectionApi.isText(currentSelectionAfterMutation));
  assert.deepEqual(currentSelectionAfterMutation.anchor.path, [0, 0]);
});

it('runs custom corrections after text changes', () => {
  const editor = createEditor();

  editor.install(
    defineExtension('direct-text-correction', {
      corrections: [
        {
          correct({ entry: [node, path], tx }) {
            if (
              path.length === 1 &&
              !editorIsEditor(node) &&
              ElementApi.isElement(node) &&
              node.type === 'paragraph' &&
              (node as Element & { normalized?: boolean }).normalized !==
                true &&
              node.children.some(
                (child) =>
                  'text' in child &&
                  typeof child.text === 'string' &&
                  child.text.includes('!')
              )
            ) {
              tx.nodes.set({ normalized: true }, { at: path });
            }
          },
          event: 'content',
        },
      ],
    })
  );

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((tx) => {
    tx.text.insert('!', { at: { path: [0, 0], offset: 5 } });
  });

  const firstBlock = editorGetSnapshot(editor).children[0] as Element & {
    normalized?: boolean;
  };

  assert.equal(firstBlock.normalized, true);
});

it('replacement publishes a new snapshot without mutating the previous one', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const previous = editorGetSnapshot(editor);

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'changed' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
      marks: { italic: true },
    },
  });

  const current = editorGetSnapshot(editor);

  assert.equal(previous.children[0].children[0].text, 'alpha');
  assert.equal(current.children[0].children[0].text, 'changed');
  assert.equal(current.version, previous.version + 1);
  assert.deepEqual(current.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 7 },
    focus: { path: [0, 0], offset: 7 },
    marks: { italic: true },
  });
});

it('state marks return the current text leaf marks for a collapsed selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha', bold: true }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  assert.deepEqual(getMarks(editor), { bold: true });
});

it('state marks are direction-independent for expanded marked selections', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'al', bold: true },
          { text: 'pha', bold: true, segment: true },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 1], offset: 3 },
    },
  });

  assert.deepEqual(getMarks(editor), { bold: true });

  editor.update((tx) => {
    tx.selection.set({
      kind: 'text',
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  assert.deepEqual(getMarks(editor), { bold: true });
});

it('editorAddMark stores explicit marks for collapsed insertion and editorInsertText uses them', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'plain' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  editorAddMark(editor, 'bold', true);

  assert.deepEqual(getMarks(editor), { bold: true });

  editorInsertText(editor, '!');

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    children: Array<Element & { bold?: boolean }>;
  };

  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 1], offset: 1 },
    focus: { path: [0, 1], offset: 1 },
  });
  assert.deepEqual(firstBlock.children, [
    { text: 'plain' },
    { text: '!', bold: true },
  ]);
});

it('editorRemoveMark can clear inherited leaf marks for the next collapsed insertion', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'bold', bold: true }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorRemoveMark(editor, 'bold');

  assert.deepEqual(getMarks(editor), {});

  editorInsertText(editor, '!');

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    children: Array<Element & { bold?: boolean }>;
  };

  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 1], offset: 1 },
    focus: { path: [0, 1], offset: 1 },
  });
  assert.deepEqual(firstBlock.children, [
    { text: 'bold', bold: true },
    { text: '!' },
  ]);
});

it('editorToggleMark clears an inherited collapsed mark before the next insertion', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'bold', bold: true }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorToggleMark(editor, 'bold', true);

  assert.deepEqual(getMarks(editor), {});

  editorInsertText(editor, '!');

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    children: Array<Element & { bold?: boolean }>;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'bold', bold: true },
    { text: '!' },
  ]);
});

it('tx.marks.toggle defaults to true and clears inherited collapsed marks', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'bold', bold: true }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editor.update((tx) => {
    tx.marks.toggle('bold');
  });

  assert.deepEqual(getMarks(editor), {});

  editorInsertText(editor, '!');

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    children: Array<Element & { bold?: boolean }>;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'bold', bold: true },
    { text: '!' },
  ]);
});

it('editorAddMark applies bold across an expanded selection while preserving existing marks', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'ab' },
          { text: 'cd', italic: true },
          { text: 'ef', underline: true },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 2], offset: 1 },
    },
  });

  editorAddMark(editor, 'bold', true);

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    children: Array<
      Descendant & { bold?: boolean; italic?: boolean; underline?: boolean }
    >;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'a' },
    { text: 'b', bold: true },
    { text: 'cd', italic: true, bold: true },
    { text: 'e', underline: true, bold: true },
    { text: 'f', underline: true },
  ]);
});

it('editorRemoveMark clears bold only inside an expanded subrange', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha', bold: true }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorRemoveMark(editor, 'bold');

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    children: Array<Element & { bold?: boolean }>;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'a', bold: true },
    { text: 'lph' },
    { text: 'a', bold: true },
  ]);
});

for (const backward of [false, true]) {
  for (const mark of ['bold', 'italic']) {
    it(`preserves a ${backward ? 'backward' : 'forward'} range through repeated ${mark} split and merge`, () => {
      const children = [
        {
          type: 'paragraph',
          children: [
            { text: 'This is editable ' },
            { text: 'rich', bold: true },
            { text: ' text, ' },
          ],
        },
        { type: 'paragraph', children: [{ text: 'unrelated' }] },
      ];
      const editor = createPliteEditor({ initialValue: children });
      const start = { path: [0, 0], offset: 8 };
      const end = { path: [0, 0], offset: 16 };
      const selection = backward
        ? { anchor: end, focus: start }
        : { anchor: start, focus: end };
      editor.update.selection.set(selection);
      const before = editorGetSnapshot(editor);
      const firstKey = before.index.keyAt([0, 0]);
      const unrelatedKey = before.index.keyAt([1, 0]);

      for (let iteration = 0; iteration < 3; iteration++) {
        editor.update.marks.toggle(mark);
        const markedStart = { path: [0, 1], offset: 0 };
        const markedEnd = { path: [0, 1], offset: 8 };
        assert.deepEqual(
          editor.read.selection(),
          backward
            ? { anchor: markedEnd, focus: markedStart }
            : { anchor: markedStart, focus: markedEnd }
        );
        editor.update.marks.toggle(mark);
        assert.deepEqual(editor.read.selection(), selection);
        assert.deepEqual(editor.read.children(), children);
        assert.equal(editorGetSnapshot(editor).index.keyAt([0, 0]), firstKey);
        assert.equal(
          editorGetSnapshot(editor).index.keyAt([1, 0]),
          unrelatedKey
        );
        assert.deepEqual(before.children, children);
      }

      editorCollapse(editor, { edge: 'end' });
      editorInsertText(editor, 'W');
      assert.deepEqual(getBlockTexts(editor.read.children()), [
        'This is editableW rich text, ',
        'unrelated',
      ]);
      assert.deepEqual(editor.read.selection(), {
        anchor: { path: [0, 0], offset: 17 },
        focus: { path: [0, 0], offset: 17 },
      });
      assert.deepEqual(before.children, children);
    });
  }
}

it('preserves custom node properties across replacement snapshots', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createStyledChildren(),
    selection: null,
  });

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    align?: string;
    children: Array<Element & { bold?: boolean }>;
  };

  assert.equal(firstBlock.align, 'left');
  assert.equal(firstBlock.children[0]?.bold, true);
});

it('preserves node keys when moving a node inside the proof subset', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
  });

  const before = editorGetSnapshot(editor);
  const firstId = before.index.keyAt([0]);

  assert.ok(firstId);

  editor.update((_tx) => {
    editorMoveNodes(editor, {
      at: [0],
      to: [2],
    });
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.index.keyAt([1]), firstId);
  assert.equal(after.children[1].children[0].text, 'alpha');
});

it('keeps node keys injective when prepending sibling moves across parents', () => {
  const editor = createPliteEditor({
    initialValue: [
      {
        type: 'list',
        children: [
          {
            type: 'item',
            children: [
              { type: 'content', children: [{ text: '1' }] },
              {
                type: 'list',
                children: [
                  { type: 'item', children: [{ text: '11' }] },
                  { type: 'item', children: [{ text: '12' }] },
                ],
              },
            ],
          },
          {
            type: 'item',
            children: [
              { type: 'content', children: [{ text: '2' }] },
              {
                type: 'list',
                children: [
                  { type: 'item', children: [{ text: '21' }] },
                  { type: 'item', children: [{ text: '22' }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  const before = editorGetSnapshot(editor);
  const destinationId = before.index.keyAt([0, 0]);
  const firstMovedId = before.index.keyAt([0, 1, 1, 0]);
  const secondMovedId = before.index.keyAt([0, 1, 1, 1]);

  assert.ok(destinationId);
  assert.ok(firstMovedId);
  assert.ok(secondMovedId);

  editor.update((tx) => {
    const first = tx.anchor([0, 1, 1, 0], {
      association: 'forward',
      deletion: 'drop',
    });
    const second = tx.anchor([0, 1, 1, 1], {
      association: 'forward',
      deletion: 'drop',
    });
    const secondPath = second.resolve();

    assert.ok(secondPath);
    tx.nodes.move({ at: secondPath, to: [0, 0, 1, 0] });

    const firstPath = first.resolve();

    assert.deepEqual(firstPath, [0, 1, 1, 0]);
    tx.nodes.move({ at: firstPath, to: [0, 0, 1, 0] });
    tx.nodes.remove({ at: [0, 1, 1] });
  });

  const snapshot = editorGetSnapshot(editor);
  const entries = snapshot.index.entries();

  assert.equal(
    new Set(entries.map(([nodeKey]) => nodeKey)).size,
    entries.length
  );
  assert.deepEqual(snapshot.index.pathOf(destinationId), [0, 0]);
  assert.deepEqual(snapshot.index.pathOf(firstMovedId), [0, 0, 1, 0]);
  assert.deepEqual(snapshot.index.pathOf(secondMovedId), [0, 0, 1, 1]);
  for (const [nodeKey, path] of entries) {
    assert.equal(snapshot.index.keyAt([...path]), nodeKey);
    assert.deepEqual(snapshot.index.pathOf(nodeKey), path);
  }
});

it('canonicalizes adjacent compatible text siblings after move_node', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [{ text: 'one' }],
      },
      {
        type: 'block',
        children: [{ text: 'two' }],
      },
    ],
    selection: null,
  });

  editorMoveNodes(editor, { at: [0, 0], to: [1, 0] });

  assert.deepEqual(editorGetSnapshot(editor).children, [
    {
      type: 'block',
      children: [{ text: '' }],
    },
    {
      type: 'block',
      children: [{ text: 'onetwo' }],
    },
  ]);
});

it('skips canonical rebuilding for exact same-parent block moves', () => {
  const children = Array.from({ length: 1000 }, (_, index) => ({
    type: 'block',
    children: [{ text: `block-${index}` }],
  }));
  const editor = createEditor({ initialValue: children });
  const profilerGlobal = globalThis as typeof globalThis & {
    __PLITE_REACT_RENDER_PROFILER__?: {
      record: (event: { id: string }) => void;
    };
  };
  const previousProfiler = profilerGlobal.__PLITE_REACT_RENDER_PROFILER__;
  const events: string[] = [];

  profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = {
    record: ({ id }) => events.push(id),
  };

  try {
    editorMoveNodes(editor, { at: [0], to: [999] });
  } finally {
    profilerGlobal.__PLITE_REACT_RENDER_PROFILER__ = previousProfiler;
  }

  assert.equal(
    events.filter((id) => id === 'representation-move-locality-hit').length,
    0
  );
  assert.equal(editor.read.text.string([999]), 'block-0');
  assert.equal(editorGetSnapshot(editor).children.length, 1000);
});

it('supports path-based insertNodes/removeNodes transforms in one outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const alphaId = before.index.keyAt([0]);
  const betaId = before.index.keyAt([1]);

  editor.update((_tx) => {
    editorInsertNodes(
      editor,
      [
        {
          type: 'paragraph',
          children: [{ text: 'zero' }],
        },
        {
          type: 'paragraph',
          children: [{ text: 'one' }],
        },
      ],
      { at: [0] }
    );
    editorRemoveNodes(editor, { at: [3] });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['zero', 'one', 'alpha']);
  assert.equal(after.index.keyAt([2]), alphaId);
  assert.equal(after.selection, null);
  assert.equal(after.index.keyAt([3]), null);
  assert.notEqual(after.index.keyAt([0]), alphaId);
  assert.notEqual(after.index.keyAt([1]), betaId);
});

it('supports path-based node property updates while keeping node keys stable', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createStyledChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const blockId = before.index.keyAt([0]);
  const textId = before.index.keyAt([0, 0]);

  editor.update((tx) => {
    tx.nodes.set({ type: 'heading', align: 'center' }, { at: [0] });
    editorSetNodes(
      editor,
      {
        italic: true,
      },
      { at: [0, 0] }
    );
  });

  const after = editorGetSnapshot(editor);
  const firstBlock = after.children[0] as Element & {
    align?: string;
    children: Array<Element & { bold?: boolean; italic?: boolean }>;
    type: string;
  };

  assert.equal(firstBlock.type, 'heading');
  assert.equal(firstBlock.align, 'center');
  assert.equal(firstBlock.children[0]?.bold, true);
  assert.equal(firstBlock.children[0]?.italic, true);
  assert.equal(after.index.keyAt([0]), blockId);
  assert.equal(after.index.keyAt([0, 0]), textId);
});

it('supports path-based property removal while keeping node keys stable', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createStyledChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const blockId = before.index.keyAt([0]);
  const textId = before.index.keyAt([0, 0]);

  editor.update((_tx) => {
    editorUnsetNodes(editor, 'align', { at: [0] });
    editorUnsetNodes(editor, 'bold', { at: [0, 0] });
  });

  const after = editorGetSnapshot(editor);
  const firstBlock = after.children[0] as Element & {
    align?: string;
    children: Array<Element & { bold?: boolean }>;
  };

  assert.equal(firstBlock.align, undefined);
  assert.equal(firstBlock.children[0]?.bold, undefined);
  assert.equal(after.index.keyAt([0]), blockId);
  assert.equal(after.index.keyAt([0, 0]), textId);
});

it('rebases selection inward when deleting text', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  const before = editorGetSnapshot(editor);
  const textId = before.index.keyAt([0, 0]);

  editor.update((tx) => {
    tx.text.delete({
      at: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
    });
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'aha');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  });
  assert.equal(after.index.keyAt([0, 0]), textId);
});

it('keeps node keys stable through an exact text deletion', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const textId = before.index.keyAt([1, 0]);

  editor.update((tx) => {
    tx.text.delete({
      at: {
        kind: 'text',
        anchor: { path: [1, 0], offset: 1 },
        focus: { path: [1, 0], offset: 3 },
      },
    });
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[1].children[0].text, 'ba');
  assert.equal(after.selection, null);
  assert.equal(after.index.keyAt([1, 0]), textId);
});

it('supports point-based splitNodes helper calls on text nodes, splits the containing block, and keeps left-branch ids stable', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const leftId = before.index.keyAt([1, 0]);

  editorSplitNodes(editor, {
    at: { path: [1, 0], offset: 2 },
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[1].children[0].text, 'be');
  assert.equal(after.children[2].children[0].text, 'ta');
  assert.equal(after.index.keyAt([1, 0]), leftId);
  assert.notEqual(after.index.keyAt([2, 0]), leftId);
  assert.equal(after.selection, null);
});

it('supports path-based splitNodes helper calls on element nodes with the legacy leading empty text', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 2], offset: 2 },
      focus: { path: [0, 2], offset: 2 },
    },
  });

  const before = editorGetSnapshot(editor);
  const leftId = before.index.keyAt([0]);
  const linkId = before.index.keyAt([0, 1]);

  editorSplitNodes(editor, {
    at: [0],
    position: 1,
  });

  const after = editorGetSnapshot(editor);
  const leftBlock = after.children[0] as Element & { data?: boolean };
  const rightBlock = after.children[1] as Element & { data?: boolean };

  assert.equal(leftBlock.data, true);
  assert.equal(rightBlock.data, true);
  assert.equal(leftBlock.children.length, 1);
  assert.equal(rightBlock.children.length, 3);
  assert.deepEqual(rightBlock.children[0], { text: '' });
  assert.equal(after.index.keyAt([0]), leftId);
  assert.equal(after.index.keyAt([1, 1]), linkId);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 2], offset: 2 },
    focus: { path: [1, 2], offset: 2 },
  });
});

it('supports path-based mergeNodes helper calls on element nodes', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementMergeChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 1], offset: 1 },
      focus: { path: [1, 1], offset: 1 },
    },
  });

  const before = editorGetSnapshot(editor);
  const leftId = before.index.keyAt([0]);
  const mergedBlockId = before.index.keyAt([1]);
  const movedSpacerId = before.index.keyAt([1, 0]);
  const movedLinkId = before.index.keyAt([1, 1]);

  assert.ok(mergedBlockId);

  editorMergeNodes(editor, { at: [1] });

  const after = editorGetSnapshot(editor);
  const block = after.children[0] as Element & { data?: boolean };

  assert.equal(after.children.length, 1);
  assert.equal(block.data, true);
  assert.equal(block.children.length, 3);
  assert.equal(after.index.keyAt([0]), leftId);
  assert.equal(after.index.pathOf(mergedBlockId), null);
  assert.equal(after.index.keyAt([0, 1]), movedLinkId);
  assert.notEqual(after.index.keyAt([0, 1]), movedSpacerId);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 2], offset: 1 },
    focus: { path: [0, 2], offset: 1 },
  });
});

it('supports setSelection helper calls once the live transaction selection has been seeded explicitly', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 6 },
    });
    editorSetSelection(editor, {
      anchor: { path: [0, 0], offset: 1 },
    });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('supports deselect helper calls against the live transaction selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    editorDeselect(editor);
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.selection, null);
});

it('supports collapse helper calls to the anchor against the live transaction selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });
    editorCollapse(editor, { edge: 'anchor' });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('supports collapse helper calls to the end against the live transaction selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    editorSelect(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 5 },
    });
    editorCollapse(editor, { edge: 'end' });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 5 },
    focus: { path: [1, 0], offset: 5 },
  });
});

it('supports setPoint helper calls on the focus edge against the live transaction selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });
    editorSetPoint(
      editor,
      {
        offset: 2,
      },
      { edge: 'focus' }
    );
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports setPoint helper calls on the start edge against a backward live selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    },
  });

  editor.update((_tx) => {
    editorSelect(editor, {
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [0, 0], offset: 2 },
    });
    editorSetPoint(
      editor,
      {
        offset: 0,
      },
      { edge: 'start' }
    );
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 3 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('supports move helper calls on both edges within the current text node', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editorSelect(editor, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 3 },
  });
  editorMove(editor, { distance: 2 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/anchor/basic.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
  });

  editorMove(editor, { edge: 'anchor' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('mirrors the legacy move/both/distance.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { distance: 6 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 10 },
    focus: { path: [0, 0], offset: 10 },
  });
});

it('mirrors the legacy move/anchor/backward.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 10 },
    },
  });

  editorMove(editor, { edge: 'anchor' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 10 },
  });
});

it('mirrors the legacy move/focus/distance.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
  });

  editorMove(editor, { edge: 'focus', distance: 4 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 10 },
  });
});

it('mirrors the legacy move/start/backward.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { edge: 'start' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/end/distance.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'end', distance: 3 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 12 },
  });
});

it('mirrors the legacy move/anchor/distance.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 11 },
    },
  });

  editorMove(editor, { edge: 'anchor', distance: 3 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 7 },
    focus: { path: [0, 0], offset: 11 },
  });
});

it('mirrors the legacy move/anchor/reverse-basic.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
  });

  editorMove(editor, { edge: 'anchor', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('mirrors the legacy move/both/backward.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 11 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/both/basic-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy move/end/backward.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { edge: 'end' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 10 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/focus/expanded.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
  });

  editorMove(editor, { edge: 'focus' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 7 },
  });
});

it('mirrors the legacy move/start/expanded.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'start' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/end/expanded.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'end' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 10 },
  });
});

it('mirrors the legacy move/anchor/reverse-distance.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
  });

  editorMove(editor, { edge: 'anchor', reverse: true, distance: 3 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('mirrors the legacy move/both/distance-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 10 },
    },
  });

  editorMove(editor, { reverse: true, distance: 6 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/end/distance-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'end', reverse: true, distance: 3 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('mirrors the legacy move/start/distance-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'start', reverse: true, distance: 3 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/focus/distance-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 11 },
    },
  });

  editorMove(editor, { edge: 'focus', reverse: true, distance: 6 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/end/backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { edge: 'end', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 8 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/focus/backward.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { edge: 'focus', distance: 7 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 8 },
    focus: { path: [0, 0], offset: 11 },
  });
});

it('mirrors the legacy move/start/distance.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'start', distance: 3 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 7 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/anchor/reverse-backward.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { edge: 'anchor', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/start/backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { edge: 'start', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy move/both/backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy move/both/expanded.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 10 },
    },
  });

  editorMove(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 11 },
  });
});

it('mirrors the legacy move/both/expanded-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 10 },
    },
  });

  editorMove(editor, { reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/end/to-backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 7 },
    },
  });

  editorMove(editor, { edge: 'end', reverse: true, distance: 6 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('mirrors the legacy move/start/from-backward.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { edge: 'start', distance: 7 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 11 },
  });
});

it('mirrors the legacy move/start/to-backward.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'start', distance: 8 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 12 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/anchor/collapsed.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'anchor' });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 10 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/both/collapsed.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/end/collapsed-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'end', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 8 },
  });
});

it('mirrors the legacy move/focus/collapsed-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'focus', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 8 },
  });
});

it('mirrors the legacy move/end/expanded-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'end', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 8 },
  });
});

it('mirrors the legacy move/focus/expanded-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
  });

  editorMove(editor, { edge: 'focus', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/start/expanded-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
  });

  editorMove(editor, { edge: 'start', reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/end/from-backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorMove(editor, { edge: 'end', reverse: true, distance: 7 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/focus/to-backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 11 },
    },
  });

  editorMove(editor, { edge: 'focus', reverse: true, distance: 10 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('supports move helper calls on the start edge of a backward selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editorSelect(editor, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 1 },
  });
  editorMove(editor, { edge: 'start', distance: 1, reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('supports move helper calls inside an outer transaction using the live draft selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    editorMove(editor, { distance: 2 });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('supports move helper calls across mixed-inline sibling text leaves in one block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editorSelect(editor, {
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });
  editorMove(editor, { distance: 1 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 1 },
    focus: { path: [0, 1, 0], offset: 1 },
  });
});

it('supports reverse move helper calls across mixed-inline sibling text leaves in one block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editorSelect(editor, {
    anchor: { path: [0, 2], offset: 0 },
    focus: { path: [0, 2], offset: 0 },
  });
  editorMove(editor, { reverse: true, distance: 1 });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 8 },
    focus: { path: [0, 1, 0], offset: 8 },
  });
});

it('supports move helper calls across mixed-inline siblings inside an outer transaction using the live draft selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [0, 0], offset: 6 },
    });
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    editorMove(editor, { distance: 1 });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 1 },
    focus: { path: [0, 1, 0], offset: 1 },
  });
});

it('supports select helper calls with a point and creates a collapsed selection', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editorSelect(editor, {
    path: [1, 0],
    offset: 2,
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 2 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports select helper calls with a point inside an outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    editorSelect(editor, {
      path: [1, 0],
      offset: 5,
    });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 5 },
    focus: { path: [1, 0], offset: 5 },
  });
});

it('supports select helper calls with a path and creates a node range', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editorSelect(editor, [0]);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('supports select helper calls with a path inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    editorSelect(editor, [2]);
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [2, 0], offset: 5 },
  });
});

it('mirrors the legacy select/path.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacySingleBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorSelect(editor, [0, 0]);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy select/point.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacySingleBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorSelect(editor, {
    path: [0, 0],
    offset: 1,
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('mirrors the legacy select/range.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacySingleBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorSelect(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy setPoint/offset.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'foo' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  editorMove(editor);
  editorSetPoint(
    editor,
    {
      offset: 0,
    },
    { edge: 'focus' }
  );

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('mirrors the legacy deselect/basic.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacySingleBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorDeselect(editor);

  const after = editorGetSnapshot(editor);

  assert.equal(after.selection, null);
});

it('supports path-based wrapNodes helper calls and preserves the moved node id', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createWrapChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  const before = editorGetSnapshot(editor);
  const paragraphId = before.index.keyAt([0]);

  editorWrapNodes(
    editor,
    {
      type: 'quote',
      children: [],
    },
    { at: [0] }
  );

  const after = editorGetSnapshot(editor);
  const wrapper = after.children[0] as Element & { type: string };

  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.children.length, 1);
  assert.equal(after.index.keyAt([0, 0]), paragraphId);
});

it('supports range-based wrapNodes helper calls across top-level block spans and preserves moved block ids', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    },
  });

  const before = editorGetSnapshot(editor);
  const firstId = before.index.keyAt([0]);
  const secondId = before.index.keyAt([1]);

  editorWrapNodes(
    editor,
    {
      type: 'quote',
      children: [],
    },
    {
      at: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [1, 0], offset: 2 },
      },
    }
  );

  const after = editorGetSnapshot(editor);
  const wrapper = after.children[0] as Element & { type: string };

  assert.equal(after.children.length, 1);
  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.children.length, 2);
  assert.equal(after.index.keyAt([0, 0]), firstId);
  assert.equal(after.index.keyAt([0, 1]), secondId);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0, 0], offset: 2 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
});

it('supports path-based wrapNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    editorWrapNodes(
      editor,
      {
        type: 'quote',
        children: [],
      },
      { at: [2] }
    );
  });

  const after = editorGetSnapshot(editor);
  const wrapper = after.children[2] as NestedTextElement;

  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.children.length, 1);
  assert.equal(wrapper.children[0].children[0].text, 'gamma');
});

it('mirrors the legacy wrapNodes/path/block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyWrappedBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorWrapNodes(
    editor,
    { type: 'quote', a: true, children: [] },
    { at: [0] }
  );

  const after = editorGetSnapshot(editor);
  const wrapper = after.children[0] as NestedTextElement;

  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.a, true);
  assert.equal(wrapper.children[0].children[0].text, 'word');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0, 0], offset: 0 },
    focus: { path: [0, 0, 0], offset: 0 },
  });
});

it('mirrors the legacy wrapNodes/block/block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyWrappedBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  editorWrapNodes(editor, { type: 'quote', a: true, children: [] });

  const after = editorGetSnapshot(editor);
  const wrapper = after.children[0] as NestedTextElement;

  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.a, true);
  assert.equal(wrapper.children[0].children[0].text, 'word');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0, 0], offset: 0 },
    focus: { path: [0, 0, 0], offset: 0 },
  });
});

it('mirrors the legacy wrapNodes/block/block-across.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    },
  });

  editorWrapNodes(editor, { type: 'quote', a: true, children: [] });

  const after = editorGetSnapshot(editor);
  const wrapper = after.children[0] as Element & {
    a?: boolean;
    type: string;
  };

  assert.equal(after.children.length, 1);
  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.a, true);
  assert.deepEqual(getBlockTexts(wrapper.children), ['one', 'two']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0, 0], offset: 2 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
});

it('mirrors the legacy wrapNodes/block/block-end.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createExpandedChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [2, 0], offset: 5 },
    },
  });

  editorWrapNodes(editor, { type: 'quote', a: true, children: [] });

  const after = editorGetSnapshot(editor);
  const wrapper = after.children[1] as Element & {
    a?: boolean;
    type: string;
  };

  assert.equal(after.children.length, 2);
  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.a, true);
  assert.deepEqual(getBlockTexts(wrapper.children), ['beta', 'gamma']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0, 0], offset: 0 },
    focus: { path: [1, 1, 0], offset: 5 },
  });
});

it('supports selection-based wrapNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    editorSelect(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [2, 0], offset: 3 },
    });
    editorWrapNodes(editor, {
      type: 'quote',
      children: [],
    });
  });

  const after = editorGetSnapshot(editor);
  const wrapper = after.children[1] as Element & { type: string };

  assert.equal(after.children.length, 2);
  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.children.length, 2);
  assert.deepEqual(getBlockTexts(wrapper.children), ['beta', 'gamma']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0, 0], offset: 1 },
    focus: { path: [1, 1, 0], offset: 3 },
  });
});

it('supports list formatting flows by turning selected top-level blocks into list items and wrapping them', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    },
  });

  editorSetNodes(editor, { type: 'list-item' }, { at: [0] });
  editorSetNodes(editor, { type: 'list-item' }, { at: [1] });
  editorWrapNodes(editor, {
    type: 'bulleted-list',
    children: [],
  });

  const snapshot = editorGetSnapshot(editor);
  const wrapper = snapshot.children[0] as Element & {
    children: Array<Element & { type?: string }>;
    type?: string;
  };

  assert.equal(wrapper.type, 'bulleted-list');
  assert.deepEqual(wrapper.children, [
    {
      type: 'list-item',
      children: [{ text: 'one' }],
    },
    {
      type: 'list-item',
      children: [{ text: 'two' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 0, 0], offset: 1 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
});

it('supports numbered list formatting flows with list-item children', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 'two'.length },
    },
  });

  editorSetNodes(editor, { type: 'list-item' }, { at: [0] });
  editorSetNodes(editor, { type: 'list-item' }, { at: [1] });
  editorWrapNodes(editor, {
    type: 'numbered-list',
    children: [],
  });

  const snapshot = editorGetSnapshot(editor);
  const wrapper = snapshot.children[0] as Element & {
    children: Array<Element & { type?: string }>;
    type?: string;
  };

  assert.equal(wrapper.type, 'numbered-list');
  assert.deepEqual(wrapper.children, [
    {
      type: 'list-item',
      children: [{ text: 'one' }],
    },
    {
      type: 'list-item',
      children: [{ text: 'two' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 0, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 'two'.length },
  });
});

it('supports path-based unwrapNodes helper calls and preserves moved child ids', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createUnwrapChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 2 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
  });

  const before = editorGetSnapshot(editor);
  const firstChildId = before.index.keyAt([0, 0]);
  const secondChildId = before.index.keyAt([0, 1]);

  editorUnwrapNodes(editor, { at: [0] });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 2);
  assert.equal(after.index.keyAt([0]), firstChildId);
  assert.equal(after.index.keyAt([1]), secondChildId);
});

it('supports range-based unwrapNodes helper calls across top-level wrapper spans and preserves moved child ids', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createTopLevelUnwrapChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [1, 0, 0], offset: 2 },
    },
  });

  const before = editorGetSnapshot(editor);
  const alphaId = before.index.keyAt([0, 0]);
  const betaId = before.index.keyAt([0, 1]);
  const gammaId = before.index.keyAt([1, 0]);

  editorUnwrapNodes(editor, {
    at: {
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [1, 0, 0], offset: 2 },
    },
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta', 'gamma']);
  assert.equal(after.index.keyAt([0]), alphaId);
  assert.equal(after.index.keyAt([1]), betaId);
  assert.equal(after.index.keyAt([2]), gammaId);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [2, 0], offset: 2 },
  });
});

it('mirrors the legacy unwrapNodes/path/block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyNestedBlockChildren(),
    selection: null,
  });

  editorUnwrapNodes(editor, { at: [0] });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.equal(after.children[0].children[0].text, 'word');
});

it('mirrors the legacy unwrapNodes/match-block/block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyNestedBlockAcrossChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    },
  });

  editorUnwrapNodes(editor);

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 2);
  assert.deepEqual(getBlockTexts(after.children), ['one', 'two']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('mirrors the legacy unwrapNodes/match-block/block-across.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyNestedBlockAcrossChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
  });

  editorUnwrapNodes(editor);

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 2);
  assert.deepEqual(getBlockTexts(after.children), ['one', 'two']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('mirrors the legacy unwrapNodes/match-block/block-end.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'quote',
        a: true,
        children: createExpandedChildren(),
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 2, 0], offset: 5 },
    },
  });

  editorUnwrapNodes(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta', 'gamma']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [2, 0], offset: 5 },
  });
});

it('mirrors the legacy unwrapNodes/match-block/block-middle.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'quote',
        a: true,
        children: [
          { type: 'paragraph', children: [{ text: 'one' }] },
          { type: 'paragraph', children: [{ text: 'two' }] },
          { type: 'paragraph', children: [{ text: 'three' }] },
          { type: 'paragraph', children: [{ text: 'four' }] },
          { type: 'paragraph', children: [{ text: 'five' }] },
          { type: 'paragraph', children: [{ text: 'six' }] },
        ],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 2, 0], offset: 0 },
      focus: { path: [0, 3, 0], offset: 0 },
    },
  });

  editorUnwrapNodes(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
  ]);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [3, 0], offset: 0 },
  });
});

it('mirrors the legacy unwrapNodes/match-block/block-start.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyNestedBlockStartChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    },
  });

  editorUnwrapNodes(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
  ]);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('supports path-based unwrapNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorWrapNodes(
      editor,
      {
        type: 'quote',
        children: [],
      },
      { at: [1] }
    );
    editorUnwrapNodes(editor, { at: [1] });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta']);
});

it('mirrors the legacy unwrapNodes/path/block-multiple.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyNestedBlockMultipleChildren(),
    selection: null,
  });

  editorUnwrapNodes(editor, { at: [0] });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['one', 'two']);
});

it('supports selection-based unwrapNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorSelect(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
    editorWrapNodes(editor, {
      type: 'quote',
      children: [],
    });
    editorUnwrapNodes(editor);
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 1 },
    focus: { path: [1, 0], offset: 1 },
  });
});

it('supports path-based liftNodes helper calls for an only child and preserves the moved node id', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLiftOnlyChildChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [0, 0, 0], offset: 2 },
    },
  });

  const before = editorGetSnapshot(editor);
  const paragraphId = before.index.keyAt([0, 0]);

  editorLiftNodes(editor, { at: [0, 0] });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.equal(after.children[0].children[0].text, 'alpha');
  assert.equal(after.index.keyAt([0]), paragraphId);
});

it('supports path-based liftNodes helper calls for a first child', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLiftSiblingChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const firstChildId = before.index.keyAt([0, 0]);

  editorLiftNodes(editor, { at: [0, 0] });

  const after = editorGetSnapshot(editor);
  const trailingWrapper = after.children[1] as NestedTextElement;

  assert.equal(after.children.length, 2);
  assert.equal(after.children[0].children[0].text, 'one');
  assert.equal(after.index.keyAt([0]), firstChildId);
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(
    trailingWrapper.children.map((child) => child.children[0].text),
    ['two', 'three']
  );
});

it('mirrors the legacy liftNodes/path/block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyNestedBlockChildren(),
    selection: null,
  });

  editorLiftNodes(editor, { at: [0, 0] });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.equal(after.children[0].children[0].text, 'word');
});

it('mirrors the legacy liftNodes/path/first-block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyLiftPairChildren(),
    selection: null,
  });

  editorLiftNodes(editor, { at: [0, 0] });

  const after = editorGetSnapshot(editor);
  const trailingWrapper = after.children[1] as Element & { type: string };

  assert.equal(after.children[0].children[0].text, 'one');
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(trailingWrapper.children), ['two']);
});

it('mirrors the legacy liftNodes/path/last-block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyLiftPairChildren(),
    selection: null,
  });

  editorLiftNodes(editor, { at: [0, 1] });

  const after = editorGetSnapshot(editor);
  const leadingWrapper = after.children[0] as Element & { type: string };

  assert.equal(leadingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(leadingWrapper.children), ['one']);
  assert.equal(after.children[1].children[0].text, 'two');
});

it('mirrors the legacy liftNodes/path/middle-block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyLiftTripleChildren(),
    selection: null,
  });

  editorLiftNodes(editor, { at: [0, 1] });

  const after = editorGetSnapshot(editor);
  const leadingWrapper = after.children[0] as Element & {
    children: Array<{ children: Array<{ text: string }> }>;
    type: string;
  };
  const trailingWrapper = after.children[2] as Element & {
    children: Array<{ children: Array<{ text: string }> }>;
    type: string;
  };

  assert.equal(leadingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(leadingWrapper.children), ['one']);
  assert.equal(after.children[1].children[0].text, 'two');
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(trailingWrapper.children), ['three']);
});

it('mirrors the legacy liftNodes/selection/block-full.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyLiftFullChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 5, 0], offset: 3 },
    },
  });

  editorLiftNodes(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
  ]);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [5, 0], offset: 3 },
  });
});

it('supports path-based liftNodes helper calls for a middle child', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLiftSiblingChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const middleChildId = before.index.keyAt([0, 1]);

  editorLiftNodes(editor, { at: [0, 1] });

  const after = editorGetSnapshot(editor);
  const leadingWrapper = after.children[0] as NestedTextElement;
  const trailingWrapper = after.children[2] as NestedTextElement;

  assert.equal(after.children.length, 3);
  assert.equal(leadingWrapper.type, 'quote');
  assert.deepEqual(
    leadingWrapper.children.map((child) => child.children[0].text),
    ['one']
  );
  assert.equal(after.children[1].children[0].text, 'two');
  assert.equal(after.index.keyAt([1]), middleChildId);
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(
    trailingWrapper.children.map((child) => child.children[0].text),
    ['three']
  );
});

it('supports path-based liftNodes helper calls for a last child', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLiftSiblingChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const lastChildId = before.index.keyAt([0, 2]);

  editorLiftNodes(editor, { at: [0, 2] });

  const after = editorGetSnapshot(editor);
  const leadingWrapper = after.children[0] as NestedTextElement;

  assert.equal(after.children.length, 2);
  assert.equal(leadingWrapper.type, 'quote');
  assert.deepEqual(
    leadingWrapper.children.map((child) => child.children[0].text),
    ['one', 'two']
  );
  assert.equal(after.children[1].children[0].text, 'three');
  assert.equal(after.index.keyAt([1]), lastChildId);
});

it('supports range-based liftNodes helper calls across top-level wrapper-child spans and preserves moved ids', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLiftSiblingChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
  });

  const before = editorGetSnapshot(editor);
  const firstId = before.index.keyAt([0, 0]);
  const secondId = before.index.keyAt([0, 1]);

  editorLiftNodes(editor, {
    at: {
      anchor: { path: [0, 0, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
  });

  const after = editorGetSnapshot(editor);
  const trailingWrapper = after.children[2] as Element & { type: string };

  assert.deepEqual(getBlockTexts(after.children), ['one', 'two', '']);
  assert.equal(after.index.keyAt([0]), firstId);
  assert.equal(after.index.keyAt([1]), secondId);
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(trailingWrapper.children), ['three']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports path-based liftNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    editorWrapNodes(
      editor,
      {
        type: 'quote',
        children: [],
      },
      { at: [2] }
    );
    editorLiftNodes(editor, { at: [2, 0] });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta', 'gamma']);
});

it('supports selection-based liftNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });
    editorWrapNodes(editor, {
      type: 'quote',
      children: [],
    });
    editorLiftNodes(editor);
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports list outdent flows by lifting selected list items and restoring paragraph blocks', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createListWrapperChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
  });

  editorLiftNodes(editor);
  editorSetNodes(editor, { type: 'paragraph' }, { at: [0] });
  editorSetNodes(editor, { type: 'paragraph' }, { at: [1] });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'one' }],
    },
    {
      type: 'paragraph',
      children: [{ text: 'two' }],
    },
  ]);
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports delete helper calls with an exact block path and preserves surviving ids', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const firstId = before.index.keyAt([0]);

  editorDelete(editor, { at: [1] });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.equal(after.children[0].children[0].text, 'alpha');
  assert.equal(after.index.keyAt([0]), firstId);
  assert.equal(after.selection, null);
});

it('mirrors the legacy delete/path/block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
  });

  editorDelete(editor, { at: [1] });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['one']);
  assert.equal(after.selection, null);
});

it('supports delete helper calls with an exact path inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    editorDelete(editor, { at: [2] });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta']);
  assert.equal(after.selection, null);
});

it('supports delete helper calls with an exact point and removes one forward character', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const textId = before.index.keyAt([0, 0]);

  editorDelete(editor, {
    at: { path: [0, 0], offset: 2 },
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'alha');
  assert.equal(after.index.keyAt([0, 0]), textId);
});

it('supports delete helper calls with an exact point, reverse, and distance inside the current text node', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const textId = before.index.keyAt([0, 0]);

  editorDelete(editor, {
    at: { path: [0, 0], offset: 3 },
    reverse: true,
    distance: 2,
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'aha');
  assert.equal(after.index.keyAt([0, 0]), textId);
});

it('supports delete helper calls with an exact point across mixed-inline sibling leaves in one block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editorDelete(editor, {
    at: { path: [0, 0], offset: 6 },
    distance: 1,
  });

  const after = editorGetSnapshot(editor);
  const link = after.children[0].children[1] as Element & {
    children: Element[];
  };

  assert.equal(link.children[0].text, 'yperlink');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 0 },
  });
});

it('supports delete helper calls with an exact point across an adjacent top-level block boundary', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const firstBlockId = before.index.keyAt([0]);

  editorDelete(editor, {
    at: { path: [0, 0], offset: 5 },
    distance: 1,
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(getBlockTexts(after.children), ['alphabeta']);
  assert.equal(after.index.keyAt([0]), firstBlockId);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('supports delete helper calls across adjacent nested block boundaries without splitting the container', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'code-block',
        children: [
          {
            type: 'code-line',
            children: [{ text: 'alpha' }],
          },
          {
            type: 'code-line',
            children: [{ text: 'beta' }],
          },
        ],
      },
    ],
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const codeBlockId = before.index.keyAt([0]);
  const firstLineId = before.index.keyAt([0, 0]);

  editor.update((_tx) => {
    editorDelete(editor, {
      at: { path: [0, 0, 0], offset: 5 },
      distance: 1,
    });
  });

  const after = editorGetSnapshot(editor);
  const codeBlock = after.children[0] as Element & {
    type: string;
    children: Array<Element & { type: string; children: Element[] }>;
  };

  assert.equal(after.children.length, 1);
  assert.equal(codeBlock.type, 'code-block');
  assert.equal(codeBlock.children.length, 1);
  assert.equal(codeBlock.children[0].type, 'code-line');
  assert.deepEqual(codeBlock.children[0].children, [{ text: 'alphabeta' }]);
  assert.equal(after.index.keyAt([0]), codeBlockId);
  assert.equal(after.index.keyAt([0, 0]), firstLineId);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0, 0], offset: 5 },
    focus: { path: [0, 0, 0], offset: 5 },
  });
});

it('supports delete helper calls with an exact point inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    },
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    editorDelete(editor, {
      at: { path: [1, 0], offset: 4 },
    });
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[1].children[0].text, 'beta');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 4 },
    focus: { path: [1, 0], offset: 4 },
  });
});

it('supports delete helper calls with the current same-text selection and collapses inward', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  const before = editorGetSnapshot(editor);
  const textId = before.index.keyAt([0, 0]);

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'aha');
  assert.equal(after.index.keyAt([0, 0]), textId);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('mirrors the legacy delete/selection/character-middle.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'wrd');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('mirrors the legacy delete/point/basic.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyDeleteBoundaryChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['wordanother']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy delete/point/basic-reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    },
  });

  editorDelete(editor, { reverse: true });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['onetwo']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy delete/point/inline.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyInlineBoundaryChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(after.children[0].children, [
    { text: 'onetwo' },
    {
      type: 'link',
      url: 'https://example.com',
      children: [{ text: 'three' }],
    },
    { text: 'four' },
  ]);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy delete/selection/character-start.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'ord');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('mirrors the legacy delete/selection/character-end.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 4 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'wor');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy delete/selection/block-middle.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'one' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'three' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['one', 'to', 'three']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [1, 0], offset: 1 },
    focus: { path: [1, 0], offset: 1 },
  });
});

it('mirrors the legacy delete/selection/block-across.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyDeleteBoundaryChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['woother']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  });
});

it('mirrors the legacy delete/selection/inline-inside.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyInlineDeleteInsideChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 2 },
      focus: { path: [0, 1, 0], offset: 3 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);
  const link = after.children[0].children[1] as Element & {
    children: Element[];
  };

  assert.equal(link.children[0].text, 'wod');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 2 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
});

it('collapses outside an inline after deleting its first selected character', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyInlineDeleteInsideChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 1 },
    },
  });

  editorDelete(editor, { reverse: true });

  const after = editorGetSnapshot(editor);
  const link = after.children[0].children[1] as Element & {
    children: Element[];
  };

  assert.equal(link.children[0].text, 'ord');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('collapses outside an inline after deleting its last selected character', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyInlineDeleteInsideChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 3 },
      focus: { path: [0, 1, 0], offset: 4 },
    },
  });

  editorDelete(editor, { reverse: false });

  const after = editorGetSnapshot(editor);
  const link = after.children[0].children[1] as Element & {
    children: Element[];
  };

  assert.equal(link.children[0].text, 'wor');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 2], offset: 0 },
    focus: { path: [0, 2], offset: 0 },
  });
});

it('mirrors the legacy delete/selection/inline-over.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyInlineDeleteChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 2], offset: 4 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);
  const remainingTexts = after.children[0].children
    .map((child) => ('text' in child ? child.text : ''))
    .join('');

  assert.equal(remainingTexts, 'oe');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('deletes equivalent forward and backward expanded selections across text, block, and inline boundaries', () => {
  const cases = [
    {
      assertSnapshot(snapshot: ReturnType<typeof editorGetSnapshot>) {
        assert.equal(snapshot.children[0].children[0].text, 'wd');
        assert.deepEqual(snapshot.selection, {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        });
      },
      children: () => [
        {
          type: 'paragraph',
          children: [{ text: 'word' }],
        },
      ],
      name: 'same text',
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
    },
    {
      assertSnapshot(snapshot: ReturnType<typeof editorGetSnapshot>) {
        assert.deepEqual(getBlockTexts(snapshot.children), ['woother']);
        assert.deepEqual(snapshot.selection, {
          kind: 'text',
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        });
      },
      children: createLegacyDeleteBoundaryChildren,
      name: 'block boundary',
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [1, 0], offset: 2 },
      },
    },
    {
      assertSnapshot(snapshot: ReturnType<typeof editorGetSnapshot>) {
        const remainingTexts = snapshot.children[0].children
          .map((child) => ('text' in child ? child.text : ''))
          .join('');

        assert.equal(remainingTexts, 'oe');
        assert.deepEqual(snapshot.selection, {
          kind: 'text',
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        });
      },
      children: createLegacyInlineDeleteChildren,
      name: 'inline boundary',
      selection: {
        kind: 'text' as const,
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 2], offset: 4 },
      },
    },
  ];

  for (const testCase of cases) {
    const run = (invert: boolean) => {
      const editor = createEditor();
      const selection = invert
        ? {
            kind: 'text' as const,
            anchor: testCase.selection.focus,
            focus: testCase.selection.anchor,
          }
        : testCase.selection;

      editorReplace(editor, {
        children: testCase.children(),
        selection,
      });
      editorDelete(editor);

      return editorGetSnapshot(editor);
    };

    const forward = run(false);
    const backward = run(true);

    testCase.assertSnapshot(forward);
    testCase.assertSnapshot(backward);
    assert.deepEqual(
      backward.children,
      forward.children,
      `${testCase.name} backward selection deletes different content`
    );
    assert.deepEqual(
      backward.selection,
      forward.selection,
      `${testCase.name} backward selection collapses differently`
    );
  }
});

it('mirrors the legacy delete/selection/inline-whole.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyInlineDeleteInsideChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 4 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);
  const link = after.children[0].children[1] as Element & {
    children: Element[];
  };

  assert.equal(link.children[0].text, '');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 0 },
  });
});

it('mirrors the legacy delete/selection/inline-after.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyInlineAfterChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 2], offset: 0 },
      focus: { path: [0, 2], offset: 1 },
    },
  });

  editorDelete(editor);

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.children[0].children, [
    { text: 'one' },
    {
      type: 'link',
      url: 'https://example.com',
      children: [{ text: 'two' }],
    },
    { text: '' },
  ]);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 2], offset: 0 },
    focus: { path: [0, 2], offset: 0 },
  });
});

it('supports delete helper calls with an explicit non-empty range across adjacent mixed-inline sibling leaves', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editorDelete(editor, {
    at: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
  });

  const after = editorGetSnapshot(editor);
  const link = after.children[0].children[1] as Element & {
    children: Element[];
  };

  assert.equal(after.children[0].children[0].text, 'befo');
  assert.equal(link.children[0].text, 'perlink');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('supports delete helper calls with an explicit non-empty range across a fully covered interior inline subtree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editorDelete(editor, {
    at: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 2], offset: 2 },
    },
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'befoter');
  assert.equal(after.children[0].children.length, 1);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('supports delete helper calls with an explicit non-empty range across an adjacent top-level block boundary', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = editorGetSnapshot(editor);
  const firstBlockId = before.index.keyAt([0]);

  editorDelete(editor, {
    at: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [1, 0], offset: 2 },
    },
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(getBlockTexts(after.children), ['alphta']);
  assert.equal(after.index.keyAt([0]), firstBlockId);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('supports delete helper calls with the current same-text selection inside an outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    editorDelete(editor);
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'aa!');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('supports delete helper calls with the current non-empty selection across adjacent mixed-inline sibling leaves inside an outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [0, 0], offset: 6 },
    });
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 1, 0], offset: 1 },
    });
    editorDelete(editor);
  });

  const after = editorGetSnapshot(editor);
  const link = after.children[0].children[1] as Element & {
    children: Element[];
  };

  assert.equal(after.children[0].children[0].text, 'before');
  assert.equal(link.children[0].text, 'yperlink');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('supports delete helper calls with the current non-empty selection across a fully covered interior inline subtree inside an outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [0, 0], offset: 6 },
    });
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 2], offset: 1 },
    });
    editorDelete(editor);
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'before!fter');
  assert.equal(after.children[0].children.length, 1);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 7 },
    focus: { path: [0, 0], offset: 7 },
  });
});

it('supports delete helper calls with the current non-empty selection across an adjacent top-level block boundary inside an outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [1, 0], offset: 2 },
    });
    editorDelete(editor);
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(getBlockTexts(after.children), ['alphata!']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('supports delete helper calls with the current collapsed selection, reverse, and distance inside an outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    editorDelete(editor, { reverse: true, distance: 2 });
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'alp!');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('supports delete helper calls with the current collapsed selection across mixed-inline sibling leaves in one block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorSelect(editor, {
      anchor: { path: [0, 2], offset: 0 },
      focus: { path: [0, 2], offset: 0 },
    });
    editorDelete(editor, { reverse: true, distance: 1 });
  });

  const after = editorGetSnapshot(editor);
  const link = after.children[0].children[1] as Element & {
    children: Element[];
  };

  assert.equal(link.children[0].text, 'hyperlin');
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 1, 0], offset: 8 },
    focus: { path: [0, 1, 0], offset: 8 },
  });
});

it('supports delete helper calls with the current collapsed selection across an adjacent top-level block boundary inside an outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  editor.update((_tx) => {
    editorInsertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    editorSelect(editor, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    editorDelete(editor, { reverse: true, distance: 1 });
  });

  const after = editorGetSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(getBlockTexts(after.children), ['alphabeta!']);
  assert.deepEqual(after.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('stages replacement inside the active transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
  });

  editor.update((_tx) => {
    editorReplace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'fresh' }],
        },
      ],
      selection: null,
    });

    editorInsertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
  });

  const snapshot = editorGetSnapshot(editor);

  assert.equal(snapshot.version, 2);
  assert.equal(snapshot.children.length, 1);
  assert.equal(snapshot.children[0].children[0].text, 'fresh!');
});

it('publishes immutable snapshots detached from public editor fields', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
  });

  const snapshot = editorGetSnapshot(editor);

  assert.throws(() => {
    (snapshot.children as Element[]).push({
      type: 'paragraph',
      children: [{ text: 'oops' }],
    });
  });

  assert.throws(() => {
    Object.assign(snapshot.index, { keyAt: () => 'broken' });
  });
  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'mutated' }],
      },
    ],
    selection: null,
  });

  const reread = editorGetSnapshot(editor);

  assert.notEqual(reread, snapshot);
  assert.equal(snapshot.children[0].children[0].text, 'alpha');
  assert.equal(reread.children[0].children[0].text, 'mutated');
});

it('deep-freezes snapshot selections including point paths', () => {
  const editor = createEditor();
  const selection = {
    kind: 'text' as const,
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  };

  editorReplace(editor, {
    children: createChildren(),
    selection,
  });

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.selection, selection);
  assert.ok(SelectionApi.isText(snapshot.selection));
  assert.notEqual(snapshot.selection, selection);
  assert.notEqual(snapshot.selection.anchor.path, selection.anchor.path);
  assert.throws(() => {
    (
      snapshot.selection as NonNullable<typeof snapshot.selection>
    ).anchor.path[0] = 9;
  });
  const currentSelection = editorGetSnapshot(editor).selection;

  assert.ok(SelectionApi.isText(currentSelection));
  assert.deepEqual(currentSelection.anchor.path, [0, 0]);
});

it('deep-freezes nested marks instead of sharing nested payloads', () => {
  const editor = createEditor();
  const marks = {
    style: {
      color: 'red',
    },
  };

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
      marks,
    },
  });

  const snapshot = editorGetSnapshot(editor);

  marks.style.color = 'blue';

  assert.ok(SelectionApi.isText(snapshot.selection));
  const snapshotMarks = snapshot.selection.marks as {
    style: { color: string };
  };

  assert.equal(snapshotMarks.style.color, 'red');
  assert.throws(() => {
    snapshotMarks.style.color = 'green';
  });
});

it('uses addMark as the active mark write path', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'plain' }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
  });

  editorAddMark(editor, 'bold', true);

  assert.deepEqual(editorGetSnapshot(editor).selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
    marks: { bold: true },
  });
  assert.deepEqual(getMarks(editor), { bold: true });

  editorInsertText(editor, '!');

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    children: Array<Element & { bold?: boolean }>;
  };

  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 1], offset: 1 },
    focus: { path: [0, 1], offset: 1 },
  });
  assert.deepEqual(firstBlock.children, [
    { text: 'plain' },
    { text: '!', bold: true },
  ]);
});

it('preserves inherited leaf marks when addMark is collapsed', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'hi', italic: true }],
      },
    ],
    selection: {
      kind: 'text' as const,
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
  });

  editorAddMark(editor, 'bold', true);

  assert.deepEqual(getMarks(editor), { italic: true, bold: true });

  editorInsertText(editor, '!');

  const snapshot = editorGetSnapshot(editor);
  const firstBlock = snapshot.children[0] as Element & {
    children: Array<Element & { bold?: boolean; italic?: boolean }>;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'hi', italic: true },
    { text: '!', italic: true, bold: true },
  ]);
});

it('uses select as the selection write path', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: {
      kind: 'text' as const,
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    },
  });
  editorSelect(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });

  editorInsertText(editor, '!');

  const snapshot = editorGetSnapshot(editor);

  assert.equal(snapshot.children[0].children[0].text, '!alpha');
  assert.deepEqual(snapshot.selection, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('keeps ids stable across repeated replace calls in one outer transaction', () => {
  const editor = createEditor();
  let firstNodeKey: string | null = null;
  let secondNodeKey: string | null = null;

  editorReplace(editor, {
    children: createChildren(),
  });

  runEditorTransaction(editor, () => {
    editorReplace(editor, {
      children: createExpandedChildren(),
    });
    firstNodeKey = editorGetSnapshot(editor).index.keyAt([2, 0]);
    editorReplace(editor, {
      children: createExpandedChildren(),
    });
    secondNodeKey = editorGetSnapshot(editor).index.keyAt([2, 0]);
  });

  assert.ok(firstNodeKey);
  assert.equal(secondNodeKey, firstNodeKey);
  assert.equal(editorGetSnapshot(editor).index.keyAt([2, 0]), firstNodeKey);
});

it('projects a cross-block range into local text segments keyed by node key', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const snapshot = editorGetSnapshot(editor);
  const leftKey = snapshot.index.keyAt([0, 0]);
  const rightKey = snapshot.index.keyAt([1, 0]);

  assert.ok(leftKey);
  assert.ok(rightKey);

  assert.deepEqual(
    editorProjectRange(editor, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    }),
    [
      {
        key: leftKey,
        path: [0, 0],
        start: 2,
        end: 5,
      },
      {
        key: rightKey,
        path: [1, 0],
        start: 0,
        end: 2,
      },
    ]
  );
});

it('projects ranges against an explicit snapshot for internal projection stores', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const snapshot = editorGetSnapshot(editor);
  const leftKey = snapshot.index.keyAt([0, 0]);
  const rightKey = snapshot.index.keyAt([1, 0]);

  assert.ok(leftKey);
  assert.ok(rightKey);

  editorReplace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'replaced' }] }],
    selection: null,
  });

  assert.deepEqual(
    projectRangeInSnapshot(snapshot, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    }),
    [
      {
        key: leftKey,
        path: [0, 0],
        start: 2,
        end: 5,
      },
      {
        key: rightKey,
        path: [1, 0],
        start: 0,
        end: 2,
      },
    ]
  );
});

it('projects only selected leaves in wide blocks and cross-block ranges', () => {
  for (const wideBlock of [false, true]) {
    const editor = createEditor();
    editorReplace(editor, {
      children: wideBlock
        ? [
            {
              type: 'paragraph',
              children: Array.from({ length: 1000 }, (_, index) => ({
                text: 'text',
                part: index,
              })),
            },
          ]
        : Array.from({ length: 1000 }, () => ({
            type: 'paragraph',
            children: [{ text: 'text' }],
          })),
      selection: null,
    });
    const original = editorGetSnapshot(editor);
    let keyReads = 0;
    const snapshot = {
      ...original,
      index: {
        ...original.index,
        keyAt: (path: number[]) => {
          keyReads += 1;
          return original.index.keyAt(path);
        },
      },
    };
    const start = { path: wideBlock ? [0, 998] : [998, 0], offset: 1 };
    const end = { path: wideBlock ? [0, 999] : [999, 0], offset: 2 };
    const expected = [
      {
        key: original.index.keyAt(start.path),
        path: start.path,
        start: 1,
        end: 4,
      },
      { key: original.index.keyAt(end.path), path: end.path, start: 0, end: 2 },
    ];
    const projected = projectRangeInSnapshot(snapshot, {
      anchor: start,
      focus: end,
    });
    assert.deepEqual(projected, expected);
    assert.equal(keyReads, 2);
    assert.equal(Object.isFrozen(projected), true);
    assert.equal(Object.isFrozen(projected[0].path), true);
    assert.deepEqual(
      projectRangeInSnapshot(snapshot, { anchor: end, focus: start }),
      expected
    );
    assert.throws(() =>
      projectRangeInSnapshot(snapshot, {
        anchor: { ...start, offset: 5 },
        focus: end,
      })
    );
    editor.update.text.insert('x', { at: start });
    assert.deepEqual(
      projectRangeInSnapshot(snapshot, { anchor: start, focus: end }),
      expected
    );
  }
});

it('reuses repeated snapshot projection work without caching mutable range inputs', () => {
  const editor = createPliteEditor({
    initialValue: [{ type: 'paragraph', children: [{ text: 'abcd' }] }],
  });
  const original = editorGetSnapshot(editor);
  let keyReads = 0;
  const snapshot = {
    ...original,
    index: {
      ...original.index,
      keyAt: (path: number[]) => {
        keyReads += 1;
        return original.index.keyAt(path);
      },
    },
  };
  const range = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 1 },
  };
  const first = projectRangeInSnapshot(snapshot, range);
  for (let index = 0; index < 100; index += 1) {
    assert.deepEqual(
      projectRangeInSnapshot(snapshot, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      }),
      first
    );
  }
  assert.equal(keyReads, 1);
  range.focus.offset = 2;
  assert.equal(projectRangeInSnapshot(snapshot, range)[0].end, 2);
  assert.equal(first[0].end, 1);
  range.focus.offset = 99;
  assert.throws(
    () => projectRangeInSnapshot(snapshot, range),
    /outside text bounds/
  );
  editor.update.nodes.replace(
    { type: 'paragraph', children: [{ text: 'new' }] },
    { at: [0] }
  );
  range.focus.offset = 1;
  const current = projectRangeInSnapshot(editorGetSnapshot(editor), range);
  assert.notEqual(current[0].key, first[0].key);
  assert.deepEqual(projectRangeInSnapshot(snapshot, range), first);
});

it('projects a collapsed range into a zero-width local segment', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
  });

  const snapshot = editorGetSnapshot(editor);
  const leftKey = snapshot.index.keyAt([0, 0]);

  assert.ok(leftKey);
  assert.deepEqual(
    editorProjectRange(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    }),
    [
      {
        key: leftKey,
        path: [0, 0],
        start: 3,
        end: 3,
      },
    ]
  );
});

it('keeps node keys unique across replace commits that allocate new nodes', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
  });

  editorReplace(editor, {
    children: createExpandedChildren(),
  });

  editorReplace(editor, {
    children: [
      ...createExpandedChildren(),
      {
        type: 'paragraph',
        children: [{ text: 'delta' }],
      },
    ],
  });

  const ids = editorGetSnapshot(editor)
    .index.entries()
    .map(([nodeKey]) => nodeKey);

  assert.equal(new Set(ids).size, ids.length);
});

it('keeps prepared transaction-spec runtime paths total through reconstruction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      { type: 'paragraph', children: [{ text: 'alpha' }] },
      { type: 'paragraph', children: [{ text: 'beta' }] },
      { type: 'paragraph', children: [{ text: 'gamma' }] },
    ],
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [2, 0], offset: 2 },
    },
  });

  const before = editorGetSnapshot(editor);
  const survivingTextNodeKey = before.index.keyAt([0, 0]);
  const mergedTextNodeKey = before.index.keyAt([2, 0]);

  const spec = editor.read((state) =>
    state.transaction((tx) => {
      tx.fragment.delete();
    })
  );

  assert.ok(spec);
  editor.update(() => applyTransactionSpec(editor, spec));

  const snapshot = editorGetSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    { type: 'paragraph', children: [{ text: 'almma' }] },
  ]);
  assert.ok(survivingTextNodeKey);
  assert.ok(mergedTextNodeKey);
  assert.equal(snapshot.index.keyAt([0, 0]), survivingTextNodeKey);
  assert.equal(snapshot.index.pathOf(mergedTextNodeKey), null);

  const entries = snapshot.index.entries();

  assert.equal(entries.length, 2);
  for (const [nodeKey, path] of entries) {
    assert.equal(snapshot.index.keyAt([...path]), nodeKey);
    assert.deepEqual(snapshot.index.pathOf(nodeKey), path);
  }
});
