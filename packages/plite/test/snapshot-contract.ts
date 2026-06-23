import assert from 'node:assert/strict';
import {
  createEditor,
  type Descendant,
  type EditorCommit,
  type EditorElementSpec,
  type Operation,
  OperationApi,
  type Path,
} from '../src';
import { runEditorTransaction as runInternalEditorTransaction } from '../src/core/public-state';
import {
  Editor,
  getCachedFullRootReplaceTopLevelRuntimeIds,
  getEditorRuntime,
  projectRangeInSnapshot,
} from '../src/internal';

const runEditorTransaction = (
  editor: Parameters<typeof runInternalEditorTransaction>[0],
  fn: Parameters<typeof runInternalEditorTransaction>[1],
  options: Parameters<typeof runInternalEditorTransaction>[2] = {}
) =>
  runInternalEditorTransaction(editor, fn, {
    authority: 'explicit',
    ...options,
  });

let extensionIndex = 0;

const defineElement = (
  editor: ReturnType<typeof createEditor>,
  spec: EditorElementSpec
) => {
  editor.extend({
    name: `snapshot-contract-element-${extensionIndex++}`,
    elements: [spec],
  });
};

const applyOperation = (
  editor: ReturnType<typeof createEditor>,
  operation: Operation
) => {
  editor.update((tx) => {
    tx.operations.replay([operation]);
  });
};

const getMarks = (editor: ReturnType<typeof createEditor>) =>
  editor.read((state) => state.marks.get());

const createChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'beta' }],
  },
];

const createLegacyBlockChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'two' }],
  },
];

const createLegacyMoveChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one two three' }],
  },
];

const createLegacySingleBlockChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
];

const createLegacyDeleteBoundaryChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'word' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'another' }],
  },
];

const createLegacyInlineDeleteChildren = (): Descendant[] => [
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
  } as Descendant,
];

const createLegacyInlineDeleteInsideChildren = (): Descendant[] => [
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
  } as Descendant,
];

const createLegacyInlineBoundaryChildren = (): Descendant[] => [
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
  } as Descendant,
];

const createLegacyInlineAfterChildren = (): Descendant[] => [
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
  } as Descendant,
];

const createLegacyWrappedBlockChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'word' }],
  },
];

const createLegacyNestedBlockChildren = (): Descendant[] => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
    ],
  } as Descendant,
];

const createLegacyNestedBlockAcrossChildren = (): Descendant[] => [
  {
    type: 'quote',
    a: true,
    children: createLegacyBlockChildren(),
  } as Descendant,
];

const createLegacyQuoteChildren = (...texts: string[]): Descendant[] => [
  {
    type: 'quote',
    children: texts.map((text) => ({
      type: 'paragraph',
      children: [{ text }],
    })),
  } as Descendant,
];

const createLegacyNestedBlockStartChildren = (): Descendant[] => [
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
    )[0]!.children,
  } as Descendant,
];

const createLegacyNestedBlockMultipleChildren = (): Descendant[] => [
  ...createLegacyQuoteChildren('one', 'two'),
];

const createLegacyLiftFullChildren = (): Descendant[] => [
  ...createLegacyQuoteChildren('one', 'two', 'three', 'four', 'five', 'six'),
];

const createLegacyLiftPairChildren = createLegacyNestedBlockMultipleChildren;

const createLegacyLiftTripleChildren = (): Descendant[] => [
  ...createLegacyQuoteChildren('one', 'two', 'three'),
];

const createExpandedChildren = (): Descendant[] => [
  ...createChildren(),
  {
    type: 'paragraph',
    children: [{ text: 'gamma' }],
  },
];

const createStyledChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    align: 'left',
    children: [{ text: 'alpha', bold: true }],
  } as Descendant,
  {
    type: 'paragraph',
    align: 'right',
    children: [{ text: 'beta' }],
  } as Descendant,
];

const createMergeTextChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [
      { text: 'al', bold: true },
      { text: 'pha', bold: true },
    ],
  } as Descendant,
];

const createElementMergeChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    data: true,
    children: [{ text: 'before' }],
  } as Descendant,
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
  } as Descendant,
];

const createWrapChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'alpha' }],
  },
];

const createListWrapperChildren = (): Descendant[] => [
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
  } as Descendant,
];

const createUnwrapChildren = (): Descendant[] => [
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
  } as Descendant,
];

const createTopLevelUnwrapChildren = (): Descendant[] => [
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
  } as Descendant,
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
    ],
  } as Descendant,
];

const createLiftOnlyChildChildren = (): Descendant[] => [
  {
    type: 'quote',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
  } as Descendant,
];

const createLiftSiblingChildren = (): Descendant[] => [
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
  } as Descendant,
];

const createElementSplitChildren = (): Descendant[] => [
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
  } as Descendant,
];

const getBlockTexts = (children: readonly Descendant[]) =>
  children.map((node) => {
    assert.ok('children' in node);
    return node.children
      .map((child) => ('text' in child ? child.text : ''))
      .join('');
  });

it('withoutNormalizing suppresses custom normalization until manual normalize', () => {
  const editor = createEditor();
  let runs = 0;
  const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;
  let runsInsideCallback = 0;

  getEditorRuntime(editor).normalizeNode = (...args) => {
    runs += 1;
    originalNormalizeNode(...args);
  };

  Editor.withoutNormalizing(editor, () => {
    Editor.replace(editor, {
      children: createChildren(),
      selection: null,
      marks: null,
    });

    runsInsideCallback = runs;
  });

  assert.equal(runsInsideCallback, 0);
  assert.equal(runs > 0, true);

  editor.update((tx) => {
    Editor.normalize(editor);
  });

  assert.equal(runs > 0, true);
});

it('withoutNormalizing normalizes split dirty paths instead of the full document', () => {
  const editor = createEditor();
  const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;
  const normalizedTopLevelPaths: number[] = [];

  getEditorRuntime(editor).normalizeNode = (entry, options) => {
    const [, path] = entry;

    if (path.length === 1) {
      normalizedTopLevelPaths.push(path[0]!);
    }

    originalNormalizeNode(entry, options);
  };

  Editor.replace(editor, {
    children: Array.from({ length: 256 }, (_value, index) => ({
      type: 'paragraph',
      children: [{ text: `line ${index}` }],
    })),
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
    marks: null,
  });

  normalizedTopLevelPaths.length = 0;

  editor.update((tx) => {
    tx.break.insert();
  });

  assert.equal(normalizedTopLevelPaths.includes(200), false);
  assert.ok(normalizedTopLevelPaths.some((path) => path <= 1));
  assert.deepEqual(
    getBlockTexts(Editor.getSnapshot(editor).children).slice(0, 3),
    ['li', 'ne 0', 'line 1']
  );
});

it('mirrors the legacy transforms/normalization/split_node-and-insert_node.tsx oracle row', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });

  Editor.replace(editor, {
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
    marks: null,
  });

  Editor.withoutNormalizing(editor, () => {
    Editor.splitNodes(editor, {
      at: [0],
      position: 1,
    });
    Editor.splitNodes(editor, {
      at: [2],
      position: 1,
    });
    applyOperation(editor, {
      type: 'insert_node',
      path: [2, 1],
      node: { text: '' },
    });
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
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

  Editor.replace(editor, {
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
    marks: null,
  });

  Editor.mergeNodes(editor, { at: [1] });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'two' }],
    },
  ]);
});

it('shouldNormalize runs once per custom normalization pass, not once per entry', () => {
  const editor = createEditor();
  const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;
  const shouldNormalizeCalls: Array<{
    iteration: number;
    operation?: unknown;
  }> = [];
  const normalizedPaths: Path[] = [];

  getEditorRuntime(editor).shouldNormalize = (options) => {
    shouldNormalizeCalls.push(options);
    return shouldNormalizeCalls.length === 1;
  };

  getEditorRuntime(editor).normalizeNode = (entry, options) => {
    normalizedPaths.push(entry[1]);
    originalNormalizeNode(entry, options);
  };

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(shouldNormalizeCalls, [
    { explicit: false, iteration: 0, operation: undefined },
  ]);
  assert.equal(normalizedPaths.length, 5);
});

it('shouldNormalize can skip a custom normalization pass for the current transaction', () => {
  const editor = createEditor();
  const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;
  const shouldNormalizeCalls: Array<{
    iteration: number;
    operation?: unknown;
  }> = [];

  getEditorRuntime(editor).shouldNormalize = (options) => {
    shouldNormalizeCalls.push(options);
    return false;
  };

  getEditorRuntime(editor).normalizeNode = (entry, options) => {
    const [node] = entry;

    if (Editor.isEditor(node) && Editor.getChildren(editor).length < 2) {
      Editor.insertNodes(
        editor,
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        { at: [1] }
      );
      return;
    }

    originalNormalizeNode(entry, options);
  };

  Editor.replace(editor, {
    children: [
      {
        type: 'title',
        children: [{ text: 'Only title' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(shouldNormalizeCalls, [
    { explicit: false, iteration: 0, operation: undefined },
  ]);
  assert.equal(Editor.getSnapshot(editor).children.length, 1);
});

it('Editor.normalize marks the custom normalization pass as explicit', () => {
  const editor = createEditor();
  const shouldNormalizeCalls: Array<{
    explicit?: boolean;
    iteration: number;
    operation?: unknown;
  }> = [];

  getEditorRuntime(editor).shouldNormalize = (options) => {
    shouldNormalizeCalls.push(options);
    return false;
  };

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  shouldNormalizeCalls.length = 0;

  Editor.normalize(editor);

  assert.deepEqual(shouldNormalizeCalls, [
    { explicit: true, iteration: 0, operation: undefined },
  ]);
});

it('fails intentionally when custom normalization revisits an earlier draft state', () => {
  const editor = createEditor();

  getEditorRuntime(editor).normalizeNode = (entry) => {
    const [node] = entry;

    if (!Editor.isEditor(node)) {
      return;
    }

    if (Editor.getChildren(editor).length === 1) {
      Editor.insertNodes(
        editor,
        {
          type: 'paragraph',
          children: [{ text: '' }],
        },
        { at: [1] }
      );
      return;
    }

    Editor.removeNodes(editor, { at: [1] });
  };

  assert.throws(() => {
    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ],
      selection: null,
      marks: null,
    });
  }, /revisited an earlier draft state|no-progress|debt/i);
});

it('treats semantic id prop changes as normalization progress', () => {
  const editor = createEditor();
  const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;

  getEditorRuntime(editor).normalizeNode = (entry, options) => {
    const [node, path] = entry;

    if (
      path.length === 1 &&
      !Editor.isEditor(node) &&
      'children' in node &&
      node.type === 'paragraph' &&
      (node as Descendant & { id?: string }).id !== 'kept'
    ) {
      Editor.setNodes(editor, { id: 'kept' }, { at: path });
      return;
    }

    originalNormalizeNode(entry, options);
  };

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.equal(
    (Editor.getSnapshot(editor).children[0] as Descendant & { id?: string }).id,
    'kept'
  );
});

it('normalizeNode can enforce a descendant-level node rewrite with supported transforms', () => {
  const editor = createEditor();
  const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;

  getEditorRuntime(editor).normalizeNode = (entry, options) => {
    const [node, path] = entry;

    if (path.length > 0 && 'children' in node && node.type === 'heading') {
      Editor.setNodes(
        editor,
        {
          type: 'paragraph',
        },
        { at: path }
      );
      return;
    }

    originalNormalizeNode(entry, options);
  };

  Editor.replace(editor, {
    children: [
      {
        type: 'heading',
        children: [{ text: 'nested' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  const snapshot = Editor.getSnapshot(editor);

  assert.deepEqual(snapshot.children, [
    {
      type: 'paragraph',
      children: [{ text: 'nested' }],
    },
  ]);
});

it('normalizeNode can wrap stray top-level text and inline children through fallbackElement', () => {
  const editor = createEditor();
  const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;

  defineElement(editor, { type: 'chip', inline: true });
  getEditorRuntime(editor).normalizeNode = (entry, options) => {
    originalNormalizeNode(entry, {
      ...options,
      fallbackElement: () => ({
        type: 'paragraph',
        children: [{ text: '' }],
      }),
    });
  };

  Editor.replace(editor, {
    children: [
      { text: 'alpha' } as Descendant,
      {
        type: 'chip',
        children: [{ text: 'beta' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }],
    },
    {
      type: 'paragraph',
      children: [
        { text: '' },
        {
          type: 'chip',
          children: [{ text: 'beta' }],
        },
        { text: '' },
      ],
    },
  ]);
});

it('normalizeNode inserts an empty text child into empty elements', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
});

it('normalizes empty elements inserted by replace_children replay', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: null,
    marks: null,
  });

  applyOperation(editor, {
    type: 'replace_children',
    path: [],
    index: 0,
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    newChildren: [
      {
        type: 'paragraph',
        children: [],
      } as Descendant,
    ],
    selection: null,
    newSelection: null,
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ]);
});

it('normalizes empty elements inserted by replace_fragment replay', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'quote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'alpha' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  applyOperation(editor, {
    type: 'replace_fragment',
    path: [0],
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    newChildren: [
      {
        type: 'paragraph',
        children: [],
      } as Descendant,
    ],
    selection: null,
    newSelection: null,
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
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

it('normalizeNode inserts spacer text around inline-only children', () => {
  const editor = createEditor();

  defineElement(editor, { type: 'link', inline: true });

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            children: [{ text: 'beta' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
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

  defineElement(editor, { type: 'link', inline: true });

  Editor.replace(editor, {
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
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.insertNodes(editor, {
    type: 'link',
    children: [{ text: 'example' }],
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
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

it('normalizeNode removes a stray top-level text child after insertNodes', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
    marks: null,
  });

  Editor.insertNodes(editor, { text: 'stray' }, { at: [0] });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
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

it('normalizeNode removes a stray block-only inline child after insertNodes', () => {
  const editor = createEditor();

  defineElement(editor, { type: 'link', inline: true });

  Editor.replace(editor, {
    children: [
      {
        type: 'quote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'alpha' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  Editor.insertNodes(
    editor,
    {
      type: 'link',
      children: [{ text: 'stray' }],
    },
    { at: [0, 1] }
  );

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'quote',
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ],
    },
  ]);
});

it('normalizeNode removes a stray top-level text child during replace', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      { text: 'stray' } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: 'beta' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'beta' }],
    },
  ]);
});

it('Editor.normalize explicitly merges adjacent compatible text children in inline-style containers', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createMergeTextChildren(),
    selection: null,
    marks: null,
  });

  Editor.normalize(editor);

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha', bold: true }],
    },
  ]);
});

it('Editor.normalize explicitly removes empty adjacent text in inline-style containers', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'alpha', bold: true },
          { text: '', bold: true },
          { text: 'beta', bold: true },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  Editor.normalize(editor);

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'alphabeta', bold: true }],
    },
  ]);
});

it('Editor.normalize explicitly flattens block wrappers inside inline-style containers', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'alpha' },
          {
            type: 'quote',
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'beta' }],
              },
            ],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  Editor.normalize(editor);

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'alphabeta' }],
    },
  ]);
});

it('normalizeNode removes a stray block-only inline child during replace', () => {
  const editor = createEditor();

  defineElement(editor, { type: 'link', inline: true });

  Editor.replace(editor, {
    children: [
      {
        type: 'quote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'alpha' }],
          },
          {
            type: 'link',
            children: [{ text: 'stray' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'quote',
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'alpha' }],
        },
      ],
    },
  ]);
});

it('normalizeNode flattens a direct block child inserted into an inline-style container', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }, { text: 'gamma' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  Editor.insertNodes(
    editor,
    {
      type: 'paragraph',
      children: [{ text: 'beta' }],
    },
    { at: [0, 1] }
  );

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'paragraph',
      children: [{ text: 'alpha' }, { text: 'beta' }, { text: 'gamma' }],
    },
  ]);
});

it('markableVoid lets addMark and removeMark target the text child inside a void element', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'mention', void: 'markable-inline' });
  const getMention = (snapshot: ReturnType<typeof Editor.getSnapshot>) =>
    snapshot.children[0].children.find(
      (child) => 'children' in child && child.type === 'mention'
    ) as Descendant & {
      children: Array<Descendant & { bold?: boolean }>;
    };

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          {
            type: 'mention',
            character: 'Ada',
            children: [{ text: '' }],
          },
        ],
      } as Descendant,
    ],
    selection: {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.addMark(editor, 'bold', true);

  let snapshot = Editor.getSnapshot(editor);
  let mention = getMention(snapshot);

  assert.equal(mention.children[0]?.bold, true);
  assert.equal(snapshot.marks, null);

  Editor.removeMark(editor, 'bold');

  snapshot = Editor.getSnapshot(editor);
  mention = getMention(snapshot);

  assert.equal(mention.children[0]?.bold, undefined);
  assert.equal(snapshot.marks, null);
});

it('insertBreak splits the current top-level block and moves selection into the new block', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak replaces the next soft break with a block split', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha\nbeta' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 'alpha'.length },
      focus: { path: [0, 0], offset: 'alpha'.length },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak repeatedly splits trailing empty blocks and moves selection to the document end', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
    marks: null,
  });

  editor.update((tx) => {
    tx.break.insert();
    tx.break.insert();
    tx.break.insert();
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [3, 0], offset: 0 },
    focus: { path: [3, 0], offset: 0 },
  });
});

it('insertBreak from an empty selectable block void creates a trailing block', () => {
  const editor = createEditor();

  defineElement(editor, { type: 'thematic-break', void: 'block' });

  Editor.replace(editor, {
    children: [
      {
        type: 'thematic-break',
        children: [{ text: '' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertSoftBreak from an empty selectable block void creates a trailing block', () => {
  const editor = createEditor();

  defineElement(editor, { type: 'thematic-break', void: 'block' });

  Editor.replace(editor, {
    children: [
      {
        type: 'thematic-break',
        children: [{ text: '' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.insertSoftBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak after marked text moves selection into the new block', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'plain ' }, { bold: true, text: 'marked' }],
      },
    ],
    selection: {
      anchor: { path: [0, 1], offset: 6 },
      focus: { path: [0, 1], offset: 6 },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak before marked text moves the marked leaf into the new block', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'plain ' }, { bold: true, text: 'marked' }],
      },
    ],
    selection: {
      anchor: { path: [0, 1], offset: 0 },
      focus: { path: [0, 1], offset: 0 },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak at the start of text opens a blank block before the text', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: '🙂or🙁' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('insertBreak before an inline at block start opens a blank block before the inline', () => {
  const editor = createEditor();

  defineElement(editor, { type: 'link', inline: true });

  Editor.replace(editor, {
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
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [1, 1, 0], offset: 0 },
    focus: { path: [1, 1, 0], offset: 0 },
  });
});

it('insertBreak inside a nested block splits the nested block without splitting its container', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
      anchor: { path: [0, 0, 0], offset: 11 },
      focus: { path: [0, 0, 0], offset: 11 },
    },
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 0 },
  });
});

it('deleteBackward removes a trailing empty nested block line', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.deleteBackward(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [0, 0, 0], offset: '// Add the initial value.'.length },
    focus: { path: [0, 0, 0], offset: '// Add the initial value.'.length },
  });
});

it('insertBreak inside a list item splits the item and keeps the list wrapper', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
      anchor: { path: [0, 0, 0], offset: 'one'.length },
      focus: { path: [0, 0, 0], offset: 'one'.length },
    },
    marks: null,
  });

  editor.update(() => {
    Editor.insertBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 0 },
  });
});

it('insertSoftBreak splits the current block through its own command', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    },
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertSoftBreak(editor);
  });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [2, 0], offset: 0 },
  });
});

it('insertFragment keeps nested selection paths under the insertion ancestor', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
      anchor: { path: [0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0, 0], offset: 1 },
    },
    marks: null,
  });

  Editor.insertFragment(editor, [
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

  assert.deepEqual(Editor.getSnapshot(editor).selection, {
    anchor: { path: [0, 1, 0, 0], offset: 2 },
    focus: { path: [0, 1, 0, 0], offset: 2 },
  });
});

it('publishes once after a transaction and keeps same-version reads stable', () => {
  const editor = createEditor();
  const snapshots = [Editor.getSnapshot(editor)];
  let notifications = 0;

  Editor.subscribe(editor, (snapshot) => {
    notifications += 1;
    snapshots.push(snapshot);
  });

  Editor.replace(editor, {
    children: createChildren(),
    marks: { bold: true },
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const before = Editor.getSnapshot(editor);
  const beforeAgain = Editor.getSnapshot(editor);

  assert.equal(before, beforeAgain);

  editor.update((tx) => {
    Editor.insertText(editor, '!', { at: { path: [0, 0], offset: 5 } });
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 0], offset: 6 },
    });
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(notifications, 2);
  assert.equal(after.children[0].children[0].text, 'alpha!');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });
  assert.deepEqual(after.marks, { bold: true });
  assert.notEqual(before, after);
});

it('keeps text snapshots stable across later path-stable text commits', () => {
  const editor = createEditor();
  const snapshots: ReturnType<typeof Editor.getSnapshot>[] = [];

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  });

  Editor.subscribe(editor, (snapshot) => {
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

it('publishes one path-stable snapshot for batched text commits', () => {
  const editor = createEditor();
  const snapshots: ReturnType<typeof Editor.getSnapshot>[] = [];

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = Editor.getSnapshot(editor);

  Editor.subscribe(editor, (snapshot) => {
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
  const snapshots: ReturnType<typeof Editor.getSnapshot>[] = [];

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  const before = Editor.getSnapshot(editor);

  Editor.subscribe(editor, (snapshot) => {
    snapshots.push(snapshot);
  });

  Editor.select(editor, {
    anchor: { path: [1, 0], offset: 2 },
    focus: { path: [1, 0], offset: 2 },
  });

  const after = snapshots.at(-1)!;

  assert.equal(snapshots.length, 1);
  assert.equal(after.index, before.index);
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 2 },
    focus: { path: [1, 0], offset: 2 },
  });
  assert.equal(after.children, before.children);
  assert.equal(after.version, before.version + 1);
});

it('publishes touched runtime ids for collapsed insert_text operations', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  const snapshot = Editor.getSnapshot(editor);
  const blockRuntimeId = snapshot.index.pathToId['0'];
  const runtimeId = snapshot.index.pathToId['0.0'];

  assert.ok(blockRuntimeId);
  assert.ok(runtimeId);

  Editor.subscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editor.update((tx) => {
    applyOperation(editor, {
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: '!',
    });
  });

  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0]?.classes, ['text']);
  assert.deepEqual(changes[0]?.dirtyPaths, [[], [0], [0, 0]]);
  assert.equal(changes[0]?.dirtyScope, 'paths');
  assert.equal(changes[0]?.childrenChanged, true);
  assert.equal(changes[0]?.selectionChanged, false);
  assert.equal(changes[0]?.marksChanged, false);
  assert.deepEqual(changes[0]?.touchedRuntimeIds, [runtimeId]);
  assert.deepEqual(changes[0]?.nodeImpactRuntimeIds, [
    blockRuntimeId,
    runtimeId,
  ]);
  assert.deepEqual(changes[0]?.decorationImpactRuntimeIds, [
    blockRuntimeId,
    runtimeId,
  ]);
});

it('notifies snapshot subscribers with commit metadata for operation replay', () => {
  const editor = createEditor();
  const callOrder: string[] = [];
  const changes: EditorCommit[] = [];

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
    marks: null,
  });

  Editor.subscribe(editor, (_snapshot, change) => {
    callOrder.push('subscribe');
    if (change) {
      changes.push(change);
    }
  });

  editor.update((tx) => {
    tx.operations.replay([
      {
        type: 'insert_text',
        path: [0, 0],
        offset: 5,
        text: '!',
      },
    ]);
  });

  assert.deepEqual(callOrder, ['subscribe']);
  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0]?.classes, ['text']);
  assert.equal(
    Editor.getSnapshot(editor).children[0].children[0].text,
    'alpha!'
  );
});

it('publishes selection-only dirtiness without touched runtime ids', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  const initialSnapshot = Editor.getSnapshot(editor);
  const initialBlockRuntimeId = initialSnapshot.index.pathToId['0'];
  const initialTextRuntimeId = initialSnapshot.index.pathToId['0.0'];

  Editor.subscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editor.update((tx) => {
    Editor.select(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
  });

  const snapshot = Editor.getSnapshot(editor);
  const selectedBlockRuntimeId = snapshot.index.pathToId['1'];
  const selectedTextRuntimeId = snapshot.index.pathToId['1.0'];

  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0]?.classes, ['selection']);
  assert.deepEqual(changes[0]?.dirtyPaths, []);
  assert.equal(changes[0]?.dirtyScope, 'none');
  assert.equal(changes[0]?.childrenChanged, false);
  assert.equal(changes[0]?.selectionChanged, true);
  assert.equal(changes[0]?.marksChanged, false);
  assert.deepEqual(changes[0]?.touchedRuntimeIds, []);
  assert.deepEqual(changes[0]?.nodeImpactRuntimeIds, []);
  assert.deepEqual(changes[0]?.selectionImpactRuntimeIds, [
    initialTextRuntimeId,
    initialBlockRuntimeId,
    selectedTextRuntimeId,
    selectedBlockRuntimeId,
  ]);
  assert.deepEqual(
    changes[0]?.decorationImpactRuntimeIds,
    changes[0]?.selectionImpactRuntimeIds
  );
});

it('keeps small top-level expanded selection impact precise', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  Editor.replace(editor, {
    children: Array.from({ length: 12 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block ${index}` }],
    })),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  const initialSnapshot = Editor.getSnapshot(editor);
  const runtimeId = (path: string) => initialSnapshot.index.pathToId[path];

  Editor.subscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editor.update(() => {
    Editor.select(editor, {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [6, 0], offset: 'block 6'.length },
    });
  });

  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0]?.classes, ['selection']);
  assert.deepEqual(changes[0]?.selectionImpactRuntimeIds, [
    runtimeId('0.0'),
    runtimeId('0'),
    runtimeId('2.0'),
    runtimeId('2'),
    runtimeId('6.0'),
    runtimeId('6'),
    runtimeId('3'),
    runtimeId('3.0'),
    runtimeId('4'),
    runtimeId('4.0'),
    runtimeId('5'),
    runtimeId('5.0'),
  ]);
  assert.deepEqual(
    changes[0]?.affectedSelectionRuntimeIds,
    changes[0]?.selectionImpactRuntimeIds
  );
  assert.deepEqual(
    changes[0]?.decorationImpactRuntimeIds,
    changes[0]?.selectionImpactRuntimeIds
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

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.subscribe(editor, () => {});

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

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  const unsubscribe = Editor.subscribeSource(editor, 'text', () => {
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

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  const unsubscribe = [
    Editor.subscribeSource(editor, 'commit', () => {
      sourceCalls.push('commit');
    }),
    Editor.subscribeSource(editor, 'selection', () => {
      sourceCalls.push('selection');
    }),
    Editor.subscribeSource(editor, 'text', () => {
      sourceCalls.push('text');
    }),
    Editor.subscribeSource(editor, 'node', () => {
      sourceCalls.push('node');
    }),
    Editor.subscribeSource(editor, 'decoration', () => {
      sourceCalls.push('decoration');
    }),
    Editor.subscribeSource(editor, 'root', () => {
      sourceCalls.push('root');
    }),
  ];

  editor.update((tx) => {
    tx.selection.set({
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

  Editor.replace(editor, {
    children: Array.from({ length: 200 }, (_, index) => ({
      type: 'paragraph',
      children: [{ text: `block ${index}` }],
    })),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

  Editor.subscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  editor.update(() => {
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [199, 0], offset: 'block 199'.length },
    });
  });

  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0]?.classes, ['selection']);
  assert.equal(changes[0]?.selectionImpactRuntimeIds, null);
  assert.equal(changes[0]?.affectedSelectionRuntimeIds, null);
  assert.equal(changes[0]?.decorationImpactRuntimeIds, null);
});

it('publishes replace-level broad invalidation for Editor.replace', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  Editor.subscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'changed' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0]?.classes, ['replace']);
  assert.deepEqual(changes[0]?.dirtyPaths, []);
  assert.equal(changes[0]?.dirtyScope, 'all');
  assert.equal(changes[0]?.childrenChanged, true);
  assert.equal(changes[0]?.selectionChanged, false);
  assert.equal(changes[0]?.marksChanged, false);
  assert.equal(changes[0]?.touchedRuntimeIds, null);
  assert.equal(changes[0]?.nodeImpactRuntimeIds, null);
  assert.equal(changes[0]?.decorationImpactRuntimeIds, null);
});

it('publishes marks-only dirtiness without pretending the document paths changed', () => {
  const editor = createEditor();
  const changes: EditorCommit[] = [];

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.subscribe(editor, (_snapshot, change) => {
    if (change) {
      changes.push(change);
    }
  });

  Editor.addMark(editor, 'bold', true);

  assert.equal(changes.length, 1);
  assert.deepEqual(changes[0]?.classes, ['mark']);
  assert.deepEqual(changes[0]?.dirtyPaths, []);
  assert.equal(changes[0]?.dirtyScope, 'none');
  assert.equal(changes[0]?.childrenChanged, false);
  assert.equal(changes[0]?.selectionChanged, false);
  assert.equal(changes[0]?.marksChanged, true);
  assert.deepEqual(changes[0]?.touchedRuntimeIds, []);
  assert.deepEqual(changes[0]?.nodeImpactRuntimeIds, []);
});

it('keeps selection null for replayed insert_text just like the transaction path', () => {
  const directEditor = createEditor();
  const transactionEditor = createEditor();

  Editor.replace(directEditor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });
  Editor.replace(transactionEditor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  applyOperation(directEditor, {
    type: 'insert_text',
    path: [0, 0],
    offset: 5,
    text: '!',
  });

  runEditorTransaction(transactionEditor, (tx) => {
    applyOperation(transactionEditor, {
      type: 'insert_text',
      path: [0, 0],
      offset: 5,
      text: '!',
    });
  });

  assert.equal(Editor.getSnapshot(directEditor).selection, null);
  assert.equal(Editor.getSnapshot(transactionEditor).selection, null);
  assert.deepEqual(
    Editor.getSnapshot(directEditor),
    Editor.getSnapshot(transactionEditor)
  );
});

it('publishes an immutable cloned selection for direct insert_text apply', () => {
  const editor = createEditor();
  const selection = {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  };

  Editor.replace(editor, {
    children: createChildren(),
    selection,
    marks: null,
  });

  applyOperation(editor, {
    type: 'insert_text',
    path: [0, 0],
    offset: 5,
    text: '!',
  });

  const snapshot = Editor.getSnapshot(editor);

  assert.deepEqual(snapshot.selection, {
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });
  assert.notEqual(snapshot.selection, selection);
  assert.notEqual(snapshot.selection?.anchor, selection.anchor);
  assert.throws(() => {
    (
      snapshot.selection as NonNullable<typeof snapshot.selection>
    ).anchor.offset = 99;
  });
  assert.equal(Editor.getSnapshot(editor).selection?.anchor.offset, 6);
  assert.throws(() => {
    (
      snapshot.selection as NonNullable<typeof snapshot.selection>
    ).anchor.path[0] = 9;
  });
  assert.deepEqual(Editor.getSnapshot(editor).selection?.anchor.path, [0, 0]);
});

it('falls back to the transaction path for direct text ops when custom normalization is overridden', () => {
  const editor = createEditor();
  const originalNormalizeNode = getEditorRuntime(editor).normalizeNode;

  getEditorRuntime(editor).normalizeNode = (entry, options) => {
    const [node, path] = entry;

    if (
      path.length === 1 &&
      !Editor.isEditor(node) &&
      'children' in node &&
      node.type === 'paragraph' &&
      (node as Descendant & { normalized?: boolean }).normalized !== true &&
      node.children.some((child) => 'text' in child && child.text.includes('!'))
    ) {
      Editor.setNodes(editor, { normalized: true }, { at: path });
      return;
    }

    originalNormalizeNode(entry, options);
  };

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  applyOperation(editor, {
    type: 'insert_text',
    path: [0, 0],
    offset: 5,
    text: '!',
  });

  const firstBlock = Editor.getSnapshot(editor).children[0] as Descendant & {
    normalized?: boolean;
  };

  assert.equal(firstBlock.normalized, true);
});

it('replacement publishes a new snapshot without mutating the previous one', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  const previous = Editor.getSnapshot(editor);

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'changed' }],
      },
    ],
    selection: null,
    marks: { italic: true },
  });

  const current = Editor.getSnapshot(editor);

  assert.equal(previous.children[0].children[0].text, 'alpha');
  assert.equal(current.children[0].children[0].text, 'changed');
  assert.equal(current.version, previous.version + 1);
  assert.deepEqual(current.marks, { italic: true });
});

it('state marks return the current text leaf marks for a collapsed selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha', bold: true }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
    marks: null,
  });

  assert.deepEqual(getMarks(editor), { bold: true });
});

it('state marks are direction-independent for expanded marked selections', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'al', bold: true },
          { text: 'pha', bold: true },
        ],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 1], offset: 3 },
    },
    marks: null,
  });

  assert.deepEqual(getMarks(editor), { bold: true });

  editor.update((tx) => {
    tx.selection.set({
      anchor: { path: [0, 1], offset: 3 },
      focus: { path: [0, 0], offset: 0 },
    });
  });

  assert.deepEqual(getMarks(editor), { bold: true });
});

it('Editor.addMark stores explicit marks for collapsed insertion and Editor.insertText uses them', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'plain' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
    marks: null,
  });

  Editor.addMark(editor, 'bold', true);

  assert.deepEqual(getMarks(editor), { bold: true });

  Editor.insertText(editor, '!');

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { bold?: boolean }>;
  };

  assert.deepEqual(snapshot.marks, null);
  assert.deepEqual(snapshot.selection, {
    anchor: { path: [0, 1], offset: 1 },
    focus: { path: [0, 1], offset: 1 },
  });
  assert.deepEqual(firstBlock.children, [
    { text: 'plain' },
    { text: '!', bold: true },
  ]);
});

it('Editor.removeMark can clear inherited leaf marks for the next collapsed insertion', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'bold', bold: true }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.removeMark(editor, 'bold');

  assert.deepEqual(getMarks(editor), {});

  Editor.insertText(editor, '!');

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { bold?: boolean }>;
  };

  assert.deepEqual(snapshot.marks, null);
  assert.deepEqual(snapshot.selection, {
    anchor: { path: [0, 1], offset: 1 },
    focus: { path: [0, 1], offset: 1 },
  });
  assert.deepEqual(firstBlock.children, [
    { text: 'bold', bold: true },
    { text: '!' },
  ]);
});

it('Editor.toggleMark clears an inherited collapsed mark before the next insertion', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'bold', bold: true }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.toggleMark(editor, 'bold', true);

  assert.deepEqual(getMarks(editor), {});

  Editor.insertText(editor, '!');

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { bold?: boolean }>;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'bold', bold: true },
    { text: '!' },
  ]);
});

it('tx.marks.toggle defaults to true and clears inherited collapsed marks', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'bold', bold: true }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  editor.update((tx) => {
    tx.marks.toggle('bold');
  });

  assert.deepEqual(getMarks(editor), {});

  Editor.insertText(editor, '!');

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { bold?: boolean }>;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'bold', bold: true },
    { text: '!' },
  ]);
});

it('Editor.addMark applies bold across an expanded selection while preserving existing marks', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'ab' },
          { text: 'cd', italic: true },
          { text: 'ef', underline: true },
        ],
      } as Descendant,
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 2], offset: 1 },
    },
    marks: null,
  });

  Editor.addMark(editor, 'bold', true);

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
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

it('Editor.removeMark clears bold only inside an expanded subrange', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'alpha', bold: true }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.removeMark(editor, 'bold');

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { bold?: boolean }>;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'a', bold: true },
    { text: 'lph' },
    { text: 'a', bold: true },
  ]);
});

it('preserves custom node properties across replacement snapshots', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createStyledChildren(),
    selection: null,
    marks: null,
  });

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
    align?: string;
    children: Array<Descendant & { bold?: boolean }>;
  };

  assert.equal(firstBlock.align, 'left');
  assert.equal(firstBlock.children[0]?.bold, true);
});

it('preserves runtime ids when moving a node inside the proof subset', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
  });

  const before = Editor.getSnapshot(editor);
  const firstId = before.index.pathToId['0'];

  assert.ok(firstId);

  editor.update((tx) => {
    Editor.moveNodes(editor, {
      at: [0],
      to: [2],
    });
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.index.pathToId['1'], firstId);
  assert.equal(after.children[1].children[0].text, 'alpha');
});

it('keeps adjacent compatible text siblings separate after move_node until normalization is explicit', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
    marks: null,
  });

  Editor.moveNodes(editor, { at: [0, 0], to: [1, 0] });

  assert.deepEqual(Editor.getSnapshot(editor).children, [
    {
      type: 'block',
      children: [{ text: '' }],
    },
    {
      type: 'block',
      children: [{ text: 'one' }, { text: 'two' }],
    },
  ]);
});

it('supports insert_node and remove_node operation replay while keeping sibling ids stable', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
  });

  const before = Editor.getSnapshot(editor);
  const alphaId = before.index.pathToId['0'];
  const alphaTextId = before.index.pathToId['0.0'];
  const betaId = before.index.pathToId['1'];

  assert.ok(alphaId);
  assert.ok(alphaTextId);
  assert.ok(betaId);

  applyOperation(editor, {
    type: 'insert_node',
    path: [0],
    node: {
      type: 'paragraph',
      children: [{ text: 'zero' }],
    },
  });

  const afterInsert = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(afterInsert.children), [
    'zero',
    'alpha',
    'beta',
  ]);
  assert.equal(afterInsert.index.pathToId['1'], alphaId);
  assert.equal(afterInsert.index.pathToId['2'], betaId);

  applyOperation(editor, {
    type: 'remove_node',
    path: [1],
    node: afterInsert.children[1]!,
  });

  const afterRemove = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(afterRemove.children), ['zero', 'beta']);
  assert.equal(afterRemove.index.pathToId['1'], betaId);
  assert.equal(afterRemove.index.idToPath[alphaId], undefined);
  assert.equal(afterRemove.index.idToPath[alphaTextId], undefined);
  assert.equal(
    Object.values(afterRemove.index.pathToId).includes(alphaId),
    false
  );
  assert.equal(
    Object.values(afterRemove.index.pathToId).includes(alphaTextId),
    false
  );
});

it('supports path-based insertNodes/removeNodes transforms in one outer transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  });

  const before = Editor.getSnapshot(editor);
  const alphaId = before.index.pathToId['0'];
  const betaId = before.index.pathToId['1'];

  editor.update((tx) => {
    Editor.insertNodes(
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
    Editor.removeNodes(editor, { at: [3] });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['zero', 'one', 'alpha']);
  assert.equal(after.index.pathToId['2'], alphaId);
  assert.equal(after.selection, null);
  assert.equal(after.index.pathToId['3'], undefined);
  assert.notEqual(after.index.pathToId['0'], alphaId);
  assert.notEqual(after.index.pathToId['1'], betaId);
});

it('supports set_node and path-based setNodes while keeping runtime ids stable', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createStyledChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const blockId = before.index.pathToId['0'];
  const textId = before.index.pathToId['0.0'];

  applyOperation(editor, {
    type: 'set_node',
    path: [0],
    newProperties: {
      type: 'quote',
      align: 'center',
    },
  });

  editor.update((tx) => {
    Editor.setNodes(
      editor,
      {
        italic: true,
      },
      { at: [0, 0] }
    );
  });

  const after = Editor.getSnapshot(editor);
  const firstBlock = after.children[0] as Descendant & {
    align?: string;
    children: Array<Descendant & { bold?: boolean; italic?: boolean }>;
    type: string;
  };

  assert.equal(firstBlock.type, 'quote');
  assert.equal(firstBlock.align, 'center');
  assert.equal(firstBlock.children[0]?.bold, true);
  assert.equal(firstBlock.children[0]?.italic, true);
  assert.equal(after.index.pathToId['0'], blockId);
  assert.equal(after.index.pathToId['0.0'], textId);
});

it('supports property removal through set_node and path-based unsetNodes while keeping runtime ids stable', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createStyledChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const blockId = before.index.pathToId['0'];
  const textId = before.index.pathToId['0.0'];

  applyOperation(editor, {
    type: 'set_node',
    path: [0],
    properties: {
      align: 'left',
    },
    newProperties: {},
  });

  editor.update((tx) => {
    Editor.unsetNodes(editor, 'bold', { at: [0, 0] });
  });

  const after = Editor.getSnapshot(editor);
  const firstBlock = after.children[0] as Descendant & {
    align?: string;
    children: Array<Descendant & { bold?: boolean }>;
  };

  assert.equal(firstBlock.align, undefined);
  assert.equal(firstBlock.children[0]?.bold, undefined);
  assert.equal(after.index.pathToId['0'], blockId);
  assert.equal(after.index.pathToId['0.0'], textId);
});

it('supports remove_text operation replay and rebases selection inward', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const textId = before.index.pathToId['0.0'];

  applyOperation(editor, {
    type: 'remove_text',
    path: [0, 0],
    offset: 1,
    text: 'lp',
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'aha');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  });
  assert.equal(after.index.pathToId['0.0'], textId);
});

it('supports exact remove_text operation replay while keeping runtime ids stable', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const textId = before.index.pathToId['1.0'];

  editor.update((tx) => {
    tx.operations.replay([
      {
        type: 'remove_text',
        path: [1, 0],
        offset: 1,
        text: 'et',
      },
    ]);
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[1].children[0].text, 'ba');
  assert.equal(after.selection, null);
  assert.equal(after.index.pathToId['1.0'], textId);
});

it('supports split_node on a text path and keeps the original id on the left branch', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const leftId = before.index.pathToId['0.0'];

  applyOperation(editor, {
    type: 'split_node',
    path: [0, 0],
    position: 3,
    properties: {},
  });

  const after = Editor.getSnapshot(editor);
  const commit = Editor.getLastCommit(editor);

  assert.equal(after.children[0].children[0].text, 'alp');
  assert.equal(after.children[0].children[1].text, 'ha');
  assert.equal(after.index.pathToId['0.0'], leftId);
  assert.notEqual(after.index.pathToId['0.1'], leftId);
  assert.equal(commit?.structureChanged, true);
  assert.equal(commit?.textChanged, true);
  assert.deepEqual(commit?.dirtyTextRuntimeIds, [leftId]);
  assert.deepEqual(commit?.textDirtyRuntimeIds, [leftId]);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 1], offset: 0 },
    focus: { path: [0, 1], offset: 0 },
  });
});

it('supports point-based splitNodes helper calls on text nodes, splits the containing block, and keeps left-branch ids stable', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const leftId = before.index.pathToId['1.0'];

  Editor.splitNodes(editor, {
    at: { path: [1, 0], offset: 2 },
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[1].children[0].text, 'be');
  assert.equal(after.children[2].children[0].text, 'ta');
  assert.equal(after.index.pathToId['1.0'], leftId);
  assert.notEqual(after.index.pathToId['2.0'], leftId);
  assert.equal(after.selection, null);
});

it('supports split_node on an element path, keeps the legacy leading empty text, and preserves moved descendant ids', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: {
      anchor: { path: [0, 2], offset: 2 },
      focus: { path: [0, 2], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const leftId = before.index.pathToId['0'];
  const linkId = before.index.pathToId['0.1'];
  const trailingTextId = before.index.pathToId['0.2'];

  applyOperation(editor, {
    type: 'split_node',
    path: [0],
    position: 1,
    properties: { data: true },
  });

  const after = Editor.getSnapshot(editor);
  const leftBlock = after.children[0] as Descendant & { data?: boolean };
  const rightBlock = after.children[1] as Descendant & { data?: boolean };

  assert.equal(leftBlock.data, true);
  assert.equal(rightBlock.data, true);
  assert.equal(leftBlock.children.length, 1);
  assert.equal(rightBlock.children.length, 3);
  assert.deepEqual(rightBlock.children[0], { text: '' });
  assert.equal(after.index.pathToId['0'], leftId);
  assert.equal(after.index.pathToId['1.1'], linkId);
  assert.equal(after.index.pathToId['1.2'], trailingTextId);
  assert.notEqual(after.index.pathToId['1'], leftId);
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 2], offset: 2 },
    focus: { path: [1, 2], offset: 2 },
  });
});

it('supports path-based splitNodes helper calls on element nodes with the legacy leading empty text', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: {
      anchor: { path: [0, 2], offset: 2 },
      focus: { path: [0, 2], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const leftId = before.index.pathToId['0'];
  const linkId = before.index.pathToId['0.1'];

  Editor.splitNodes(editor, {
    at: [0],
    position: 1,
  });

  const after = Editor.getSnapshot(editor);
  const leftBlock = after.children[0] as Descendant & { data?: boolean };
  const rightBlock = after.children[1] as Descendant & { data?: boolean };

  assert.equal(leftBlock.data, true);
  assert.equal(rightBlock.data, true);
  assert.equal(leftBlock.children.length, 1);
  assert.equal(rightBlock.children.length, 3);
  assert.deepEqual(rightBlock.children[0], { text: '' });
  assert.equal(after.index.pathToId['0'], leftId);
  assert.equal(after.index.pathToId['1.1'], linkId);
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 2], offset: 2 },
    focus: { path: [1, 2], offset: 2 },
  });
});

it('supports merge_node on a text path and keeps the left branch id', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createMergeTextChildren(),
    selection: {
      anchor: { path: [0, 1], offset: 2 },
      focus: { path: [0, 1], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const leftId = before.index.pathToId['0.0'];
  const rightId = before.index.pathToId['0.1'];

  applyOperation(editor, {
    type: 'merge_node',
    path: [0, 1],
    position: 2,
    properties: { bold: true },
  });

  const after = Editor.getSnapshot(editor);
  const firstText = after.children[0].children[0] as Descendant & {
    bold?: boolean;
  };

  assert.equal(after.children[0].children.length, 1);
  assert.equal(firstText.text, 'alpha');
  assert.equal(firstText.bold, true);
  assert.equal(after.index.pathToId['0.0'], leftId);
  assert.equal(after.index.pathToId['0.1'], undefined);
  assert.notEqual(leftId, rightId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('supports path-based mergeNodes helper calls on text nodes and keeps the left branch id', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createMergeTextChildren(),
    selection: {
      anchor: { path: [0, 1], offset: 1 },
      focus: { path: [0, 1], offset: 1 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const leftId = before.index.pathToId['0.0'];

  Editor.mergeNodes(editor, { at: [0, 1] });

  const after = Editor.getSnapshot(editor);
  const firstText = after.children[0].children[0] as Descendant & {
    bold?: boolean;
  };

  assert.equal(after.children[0].children.length, 1);
  assert.equal(firstText.text, 'alpha');
  assert.equal(firstText.bold, true);
  assert.equal(after.index.pathToId['0.0'], leftId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('supports merge_node on an element path and preserves moved descendant ids', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'link', inline: true });

  Editor.replace(editor, {
    children: createElementMergeChildren(),
    selection: {
      anchor: { path: [1, 1], offset: 2 },
      focus: { path: [1, 1], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const leftId = before.index.pathToId['0'];
  const movedSpacerId = before.index.pathToId['1.0'];
  const movedLinkId = before.index.pathToId['1.1'];
  const movedTextId = before.index.pathToId['1.2'];

  applyOperation(editor, {
    type: 'merge_node',
    path: [1],
    position: 1,
    properties: { data: true },
  });

  const after = Editor.getSnapshot(editor);
  const block = after.children[0] as Descendant & { data?: boolean };

  assert.equal(after.children.length, 1);
  assert.equal(block.data, true);
  assert.equal(block.children.length, 4);
  assert.equal(after.index.pathToId['0'], leftId);
  assert.equal(after.index.pathToId['0.1'], movedSpacerId);
  assert.equal(after.index.pathToId['0.2'], movedLinkId);
  assert.equal(after.index.pathToId['0.3'], movedTextId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 3], offset: 2 },
    focus: { path: [0, 3], offset: 2 },
  });
});

it('supports path-based mergeNodes helper calls on element nodes', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'link', inline: true });

  Editor.replace(editor, {
    children: createElementMergeChildren(),
    selection: {
      anchor: { path: [1, 1], offset: 1 },
      focus: { path: [1, 1], offset: 1 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const leftId = before.index.pathToId['0'];
  const movedSpacerId = before.index.pathToId['1.0'];
  const movedLinkId = before.index.pathToId['1.1'];

  Editor.mergeNodes(editor, { at: [1] });

  const after = Editor.getSnapshot(editor);
  const block = after.children[0] as Descendant & { data?: boolean };

  assert.equal(after.children.length, 1);
  assert.equal(block.data, true);
  assert.equal(block.children.length, 4);
  assert.equal(after.index.pathToId['0'], leftId);
  assert.equal(after.index.pathToId['0.1'], movedSpacerId);
  assert.equal(after.index.pathToId['0.2'], movedLinkId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 3], offset: 1 },
    focus: { path: [0, 3], offset: 1 },
  });
});

it('supports setSelection helper calls once the live transaction selection has been seeded explicitly', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 6 },
    });
    Editor.setSelection(editor, {
      anchor: { path: [0, 0], offset: 1 },
    });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('supports deselect helper calls against the live transaction selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    Editor.deselect(editor);
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.selection, null);
});

it('supports collapse helper calls to the anchor against the live transaction selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });
    Editor.collapse(editor, { edge: 'anchor' });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('supports collapse helper calls to the end against the live transaction selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    },
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    Editor.select(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 5 },
    });
    Editor.collapse(editor, { edge: 'end' });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 5 },
    focus: { path: [1, 0], offset: 5 },
  });
});

it('supports setPoint helper calls on the focus edge against the live transaction selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 3 },
    });
    Editor.setPoint(
      editor,
      {
        offset: 2,
      },
      { edge: 'focus' }
    );
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports setPoint helper calls on the start edge against a backward live selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    },
    marks: null,
  });

  editor.update((tx) => {
    Editor.select(editor, {
      anchor: { path: [1, 0], offset: 3 },
      focus: { path: [0, 0], offset: 2 },
    });
    Editor.setPoint(
      editor,
      {
        offset: 0,
      },
      { edge: 'start' }
    );
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 3 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('supports move helper calls on both edges within the current text node', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  Editor.select(editor, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 3 },
  });
  Editor.move(editor, { distance: 2 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/anchor/basic.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'anchor' });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('mirrors the legacy move/both/distance.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { distance: 6 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 10 },
    focus: { path: [0, 0], offset: 10 },
  });
});

it('mirrors the legacy move/anchor/backward.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 10 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'anchor' });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 10 },
  });
});

it('mirrors the legacy move/focus/distance.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'focus', distance: 4 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 10 },
  });
});

it('mirrors the legacy move/start/backward.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'start' });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/end/distance.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end', distance: 3 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 12 },
  });
});

it('mirrors the legacy move/anchor/distance.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 11 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'anchor', distance: 3 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 7 },
    focus: { path: [0, 0], offset: 11 },
  });
});

it('mirrors the legacy move/anchor/reverse-basic.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'anchor', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('mirrors the legacy move/both/backward.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 11 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/both/basic-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy move/end/backward.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end' });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 10 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/focus/expanded.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'focus' });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 7 },
  });
});

it('mirrors the legacy move/start/expanded.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'start' });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/end/expanded.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end' });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 10 },
  });
});

it('mirrors the legacy move/anchor/reverse-distance.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'anchor', reverse: true, distance: 3 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('mirrors the legacy move/both/distance-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 10 },
    },
    marks: null,
  });

  Editor.move(editor, { reverse: true, distance: 6 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/end/distance-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end', reverse: true, distance: 3 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('mirrors the legacy move/start/distance-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'start', reverse: true, distance: 3 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/focus/distance-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 11 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'focus', reverse: true, distance: 6 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/end/backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 8 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/focus/backward.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'focus', distance: 7 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 8 },
    focus: { path: [0, 0], offset: 11 },
  });
});

it('mirrors the legacy move/start/distance.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'start', distance: 3 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 7 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/anchor/reverse-backward.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'anchor', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/start/backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'start', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy move/both/backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 10 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy move/both/expanded.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 10 },
    },
    marks: null,
  });

  Editor.move(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 11 },
  });
});

it('mirrors the legacy move/both/expanded-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 10 },
    },
    marks: null,
  });

  Editor.move(editor, { reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/end/to-backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 7 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end', reverse: true, distance: 6 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('mirrors the legacy move/start/from-backward.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'start', distance: 7 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 11 },
  });
});

it('mirrors the legacy move/start/to-backward.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'start', distance: 8 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 12 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/anchor/collapsed.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'anchor' });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 10 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/both/collapsed.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/end/collapsed-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 8 },
  });
});

it('mirrors the legacy move/focus/collapsed-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 9 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'focus', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 9 },
    focus: { path: [0, 0], offset: 8 },
  });
});

it('mirrors the legacy move/end/expanded-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 8 },
  });
});

it('mirrors the legacy move/focus/expanded-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 6 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'focus', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('mirrors the legacy move/start/expanded-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'start', reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 9 },
  });
});

it('mirrors the legacy move/end/from-backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 8 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'end', reverse: true, distance: 7 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy move/focus/to-backward-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyMoveChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 11 },
    },
    marks: null,
  });

  Editor.move(editor, { edge: 'focus', reverse: true, distance: 10 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('supports move helper calls on the start edge of a backward selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  Editor.select(editor, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 1 },
  });
  Editor.move(editor, { edge: 'start', distance: 1, reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('supports move helper calls inside an outer transaction using the live draft selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    });
    Editor.move(editor, { distance: 2 });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('supports move helper calls across mixed-inline sibling text leaves in one block', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  Editor.select(editor, {
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });
  Editor.move(editor, { distance: 1 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 1, 0], offset: 1 },
    focus: { path: [0, 1, 0], offset: 1 },
  });
});

it('supports reverse move helper calls across mixed-inline sibling text leaves in one block', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  Editor.select(editor, {
    anchor: { path: [0, 2], offset: 0 },
    focus: { path: [0, 2], offset: 0 },
  });
  Editor.move(editor, { reverse: true, distance: 1 });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 1, 0], offset: 8 },
    focus: { path: [0, 1, 0], offset: 8 },
  });
});

it('supports move helper calls across mixed-inline siblings inside an outer transaction using the live draft selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [0, 0], offset: 6 },
    });
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 0], offset: 7 },
    });
    Editor.move(editor, { distance: 1 });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 1, 0], offset: 1 },
    focus: { path: [0, 1, 0], offset: 1 },
  });
});

it('supports select helper calls with a point and creates a collapsed selection', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  Editor.select(editor, {
    path: [1, 0],
    offset: 2,
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 2 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports select helper calls with a point inside an outer transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    Editor.select(editor, {
      path: [1, 0],
      offset: 5,
    });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 5 },
    focus: { path: [1, 0], offset: 5 },
  });
});

it('supports select helper calls with a path and creates a node range', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  Editor.select(editor, [0]);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('supports select helper calls with a path inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    Editor.select(editor, [2]);
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [2, 0], offset: 5 },
  });
});

it('mirrors the legacy select/path.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacySingleBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.select(editor, [0, 0]);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy select/point.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacySingleBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.select(editor, {
    path: [0, 0],
    offset: 1,
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('mirrors the legacy select/range.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacySingleBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy setPoint/offset.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'foo' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
    marks: null,
  });

  Editor.move(editor);
  Editor.setPoint(
    editor,
    {
      offset: 0,
    },
    { edge: 'focus' }
  );

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('mirrors the legacy deselect/basic.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacySingleBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.deselect(editor);

  const after = Editor.getSnapshot(editor);

  assert.equal(after.selection, null);
});

it('supports path-based wrapNodes helper calls and preserves the moved node id', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createWrapChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const paragraphId = before.index.pathToId['0'];

  Editor.wrapNodes(
    editor,
    {
      type: 'quote',
      children: [],
    },
    { at: [0] }
  );

  const after = Editor.getSnapshot(editor);
  const wrapper = after.children[0] as Descendant & { type: string };

  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.children.length, 1);
  assert.equal(after.index.pathToId['0.0'], paragraphId);
});

it('supports range-based wrapNodes helper calls across top-level block spans and preserves moved block ids', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const firstId = before.index.pathToId['0'];
  const secondId = before.index.pathToId['1'];

  Editor.wrapNodes(
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

  const after = Editor.getSnapshot(editor);
  const wrapper = after.children[0] as Descendant & { type: string };

  assert.equal(after.children.length, 1);
  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.children.length, 2);
  assert.equal(after.index.pathToId['0.0'], firstId);
  assert.equal(after.index.pathToId['0.1'], secondId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0, 0], offset: 2 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
});

it('supports path-based wrapNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    Editor.wrapNodes(
      editor,
      {
        type: 'quote',
        children: [],
      },
      { at: [2] }
    );
  });

  const after = Editor.getSnapshot(editor);
  const wrapper = after.children[2] as Descendant & { type: string };

  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.children.length, 1);
  assert.equal(wrapper.children[0].children[0].text, 'gamma');
});

it('mirrors the legacy wrapNodes/path/block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyWrappedBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.wrapNodes(
    editor,
    {
      type: 'quote',
      a: true,
      children: [],
    } as Descendant,
    { at: [0] }
  );

  const after = Editor.getSnapshot(editor);
  const wrapper = after.children[0] as Descendant & {
    a?: boolean;
    type: string;
  };

  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.a, true);
  assert.equal(wrapper.children[0].children[0].text, 'word');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0, 0], offset: 0 },
    focus: { path: [0, 0, 0], offset: 0 },
  });
});

it('mirrors the legacy wrapNodes/block/block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyWrappedBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.wrapNodes(editor, {
    type: 'quote',
    a: true,
    children: [],
  } as Descendant);

  const after = Editor.getSnapshot(editor);
  const wrapper = after.children[0] as Descendant & {
    a?: boolean;
    type: string;
  };

  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.a, true);
  assert.equal(wrapper.children[0].children[0].text, 'word');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0, 0], offset: 0 },
    focus: { path: [0, 0, 0], offset: 0 },
  });
});

it('mirrors the legacy wrapNodes/block/block-across.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    },
    marks: null,
  });

  Editor.wrapNodes(editor, {
    type: 'quote',
    a: true,
    children: [],
  } as Descendant);

  const after = Editor.getSnapshot(editor);
  const wrapper = after.children[0] as Descendant & {
    a?: boolean;
    type: string;
  };

  assert.equal(after.children.length, 1);
  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.a, true);
  assert.deepEqual(getBlockTexts(wrapper.children), ['one', 'two']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0, 0], offset: 2 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
});

it('mirrors the legacy wrapNodes/block/block-end.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createExpandedChildren(),
    selection: {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [2, 0], offset: 5 },
    },
    marks: null,
  });

  Editor.wrapNodes(editor, {
    type: 'quote',
    a: true,
    children: [],
  } as Descendant);

  const after = Editor.getSnapshot(editor);
  const wrapper = after.children[1] as Descendant & {
    a?: boolean;
    type: string;
  };

  assert.equal(after.children.length, 2);
  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.a, true);
  assert.deepEqual(getBlockTexts(wrapper.children), ['beta', 'gamma']);
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0, 0], offset: 0 },
    focus: { path: [1, 1, 0], offset: 5 },
  });
});

it('supports selection-based wrapNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    Editor.select(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [2, 0], offset: 3 },
    });
    Editor.wrapNodes(editor, {
      type: 'quote',
      children: [],
    });
  });

  const after = Editor.getSnapshot(editor);
  const wrapper = after.children[1] as Descendant & { type: string };

  assert.equal(after.children.length, 2);
  assert.equal(wrapper.type, 'quote');
  assert.equal(wrapper.children.length, 2);
  assert.deepEqual(getBlockTexts(wrapper.children), ['beta', 'gamma']);
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0, 0], offset: 1 },
    focus: { path: [1, 1, 0], offset: 3 },
  });
});

it('supports list formatting flows by turning selected top-level blocks into list items and wrapping them', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    },
    marks: null,
  });

  Editor.setNodes(editor, { type: 'list-item' }, { at: [0] });
  Editor.setNodes(editor, { type: 'list-item' }, { at: [1] });
  Editor.wrapNodes(editor, {
    type: 'bulleted-list',
    children: [],
  });

  const snapshot = Editor.getSnapshot(editor);
  const wrapper = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { type?: string }>;
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
    anchor: { path: [0, 0, 0], offset: 1 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
});

it('supports numbered list formatting flows with list-item children', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 'two'.length },
    },
    marks: null,
  });

  Editor.setNodes(editor, { type: 'list-item' }, { at: [0] });
  Editor.setNodes(editor, { type: 'list-item' }, { at: [1] });
  Editor.wrapNodes(editor, {
    type: 'numbered-list',
    children: [],
  });

  const snapshot = Editor.getSnapshot(editor);
  const wrapper = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { type?: string }>;
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
    anchor: { path: [0, 0, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 'two'.length },
  });
});

it('supports path-based unwrapNodes helper calls and preserves moved child ids', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createUnwrapChildren(),
    selection: {
      anchor: { path: [0, 1, 0], offset: 2 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const firstChildId = before.index.pathToId['0.0'];
  const secondChildId = before.index.pathToId['0.1'];

  Editor.unwrapNodes(editor, { at: [0] });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 2);
  assert.equal(after.index.pathToId['0'], firstChildId);
  assert.equal(after.index.pathToId['1'], secondChildId);
});

it('supports range-based unwrapNodes helper calls across top-level wrapper spans and preserves moved child ids', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createTopLevelUnwrapChildren(),
    selection: {
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [1, 0, 0], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const alphaId = before.index.pathToId['0.0'];
  const betaId = before.index.pathToId['0.1'];
  const gammaId = before.index.pathToId['1.0'];

  Editor.unwrapNodes(editor, {
    at: {
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [1, 0, 0], offset: 2 },
    },
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta', 'gamma']);
  assert.equal(after.index.pathToId['0'], alphaId);
  assert.equal(after.index.pathToId['1'], betaId);
  assert.equal(after.index.pathToId['2'], gammaId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [2, 0], offset: 2 },
  });
});

it('mirrors the legacy unwrapNodes/path/block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyNestedBlockChildren(),
    selection: null,
    marks: null,
  });

  Editor.unwrapNodes(editor, { at: [0] });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.equal(after.children[0].children[0].text, 'word');
});

it('mirrors the legacy unwrapNodes/match-block/block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyNestedBlockAcrossChildren(),
    selection: {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.unwrapNodes(editor);

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 2);
  assert.deepEqual(getBlockTexts(after.children), ['one', 'two']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('mirrors the legacy unwrapNodes/match-block/block-across.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyNestedBlockAcrossChildren(),
    selection: {
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
    marks: null,
  });

  Editor.unwrapNodes(editor);

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 2);
  assert.deepEqual(getBlockTexts(after.children), ['one', 'two']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('mirrors the legacy unwrapNodes/match-block/block-end.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'quote',
        a: true,
        children: createExpandedChildren(),
      } as Descendant,
    ],
    selection: {
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 2, 0], offset: 5 },
    },
    marks: null,
  });

  Editor.unwrapNodes(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta', 'gamma']);
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [2, 0], offset: 5 },
  });
});

it('mirrors the legacy unwrapNodes/match-block/block-middle.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
      } as Descendant,
    ],
    selection: {
      anchor: { path: [0, 2, 0], offset: 0 },
      focus: { path: [0, 3, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.unwrapNodes(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
  ]);
  assert.deepEqual(after.selection, {
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [3, 0], offset: 0 },
  });
});

it('mirrors the legacy unwrapNodes/match-block/block-start.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyNestedBlockStartChildren(),
    selection: {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.unwrapNodes(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
  ]);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('supports path-based unwrapNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.wrapNodes(
      editor,
      {
        type: 'quote',
        children: [],
      },
      { at: [1] }
    );
    Editor.unwrapNodes(editor, { at: [1] });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta']);
});

it('mirrors the legacy unwrapNodes/path/block-multiple.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyNestedBlockMultipleChildren(),
    selection: null,
    marks: null,
  });

  Editor.unwrapNodes(editor, { at: [0] });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['one', 'two']);
});

it('supports selection-based unwrapNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.select(editor, {
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 1 },
    });
    Editor.wrapNodes(editor, {
      type: 'quote',
      children: [],
    });
    Editor.unwrapNodes(editor);
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta']);
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 1 },
    focus: { path: [1, 0], offset: 1 },
  });
});

it('supports path-based liftNodes helper calls for an only child and preserves the moved node id', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLiftOnlyChildChildren(),
    selection: {
      anchor: { path: [0, 0, 0], offset: 2 },
      focus: { path: [0, 0, 0], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const paragraphId = before.index.pathToId['0.0'];

  Editor.liftNodes(editor, { at: [0, 0] });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.equal(after.children[0].children[0].text, 'alpha');
  assert.equal(after.index.pathToId['0'], paragraphId);
});

it('supports path-based liftNodes helper calls for a first child', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLiftSiblingChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const firstChildId = before.index.pathToId['0.0'];

  Editor.liftNodes(editor, { at: [0, 0] });

  const after = Editor.getSnapshot(editor);
  const trailingWrapper = after.children[1] as Descendant & { type: string };

  assert.equal(after.children.length, 2);
  assert.equal(after.children[0].children[0].text, 'one');
  assert.equal(after.index.pathToId['0'], firstChildId);
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(
    trailingWrapper.children.map((child) => child.children[0].text),
    ['two', 'three']
  );
});

it('mirrors the legacy liftNodes/path/block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyNestedBlockChildren(),
    selection: null,
    marks: null,
  });

  Editor.liftNodes(editor, { at: [0, 0] });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.equal(after.children[0].children[0].text, 'word');
});

it('mirrors the legacy liftNodes/path/first-block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyLiftPairChildren(),
    selection: null,
    marks: null,
  });

  Editor.liftNodes(editor, { at: [0, 0] });

  const after = Editor.getSnapshot(editor);
  const trailingWrapper = after.children[1] as Descendant & { type: string };

  assert.equal(after.children[0].children[0].text, 'one');
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(trailingWrapper.children), ['two']);
});

it('mirrors the legacy liftNodes/path/last-block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyLiftPairChildren(),
    selection: null,
    marks: null,
  });

  Editor.liftNodes(editor, { at: [0, 1] });

  const after = Editor.getSnapshot(editor);
  const leadingWrapper = after.children[0] as Descendant & { type: string };

  assert.equal(leadingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(leadingWrapper.children), ['one']);
  assert.equal(after.children[1].children[0].text, 'two');
});

it('mirrors the legacy liftNodes/path/middle-block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyLiftTripleChildren(),
    selection: null,
    marks: null,
  });

  Editor.liftNodes(editor, { at: [0, 1] });

  const after = Editor.getSnapshot(editor);
  const leadingWrapper = after.children[0] as Descendant & { type: string };
  const trailingWrapper = after.children[2] as Descendant & { type: string };

  assert.equal(leadingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(leadingWrapper.children), ['one']);
  assert.equal(after.children[1].children[0].text, 'two');
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(trailingWrapper.children), ['three']);
});

it('mirrors the legacy liftNodes/selection/block-full.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyLiftFullChildren(),
    selection: {
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 5, 0], offset: 3 },
    },
    marks: null,
  });

  Editor.liftNodes(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), [
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
  ]);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [5, 0], offset: 3 },
  });
});

it('supports path-based liftNodes helper calls for a middle child', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLiftSiblingChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const middleChildId = before.index.pathToId['0.1'];

  Editor.liftNodes(editor, { at: [0, 1] });

  const after = Editor.getSnapshot(editor);
  const leadingWrapper = after.children[0] as Descendant & { type: string };
  const trailingWrapper = after.children[2] as Descendant & { type: string };

  assert.equal(after.children.length, 3);
  assert.equal(leadingWrapper.type, 'quote');
  assert.deepEqual(
    leadingWrapper.children.map((child) => child.children[0].text),
    ['one']
  );
  assert.equal(after.children[1].children[0].text, 'two');
  assert.equal(after.index.pathToId['1'], middleChildId);
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(
    trailingWrapper.children.map((child) => child.children[0].text),
    ['three']
  );
});

it('supports path-based liftNodes helper calls for a last child', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLiftSiblingChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const lastChildId = before.index.pathToId['0.2'];

  Editor.liftNodes(editor, { at: [0, 2] });

  const after = Editor.getSnapshot(editor);
  const leadingWrapper = after.children[0] as Descendant & { type: string };

  assert.equal(after.children.length, 2);
  assert.equal(leadingWrapper.type, 'quote');
  assert.deepEqual(
    leadingWrapper.children.map((child) => child.children[0].text),
    ['one', 'two']
  );
  assert.equal(after.children[1].children[0].text, 'three');
  assert.equal(after.index.pathToId['1'], lastChildId);
});

it('supports range-based liftNodes helper calls across top-level wrapper-child spans and preserves moved ids', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLiftSiblingChildren(),
    selection: {
      anchor: { path: [0, 0, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const firstId = before.index.pathToId['0.0'];
  const secondId = before.index.pathToId['0.1'];

  Editor.liftNodes(editor, {
    at: {
      anchor: { path: [0, 0, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
  });

  const after = Editor.getSnapshot(editor);
  const trailingWrapper = after.children[2] as Descendant & { type: string };

  assert.deepEqual(getBlockTexts(after.children), ['one', 'two', '']);
  assert.equal(after.index.pathToId['0'], firstId);
  assert.equal(after.index.pathToId['1'], secondId);
  assert.equal(trailingWrapper.type, 'quote');
  assert.deepEqual(getBlockTexts(trailingWrapper.children), ['three']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports path-based liftNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    Editor.wrapNodes(
      editor,
      {
        type: 'quote',
        children: [],
      },
      { at: [2] }
    );
    Editor.liftNodes(editor, { at: [2, 0] });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta', 'gamma']);
});

it('supports selection-based liftNodes inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    });
    Editor.wrapNodes(editor, {
      type: 'quote',
      children: [],
    });
    Editor.liftNodes(editor);
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports list outdent flows by lifting selected list items and restoring paragraph blocks', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createListWrapperChildren(),
    selection: {
      anchor: { path: [0, 0, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
    marks: null,
  });

  Editor.liftNodes(editor);
  Editor.setNodes(editor, { type: 'paragraph' }, { at: [0] });
  Editor.setNodes(editor, { type: 'paragraph' }, { at: [1] });

  const snapshot = Editor.getSnapshot(editor);

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
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
});

it('supports delete helper calls with an exact block path and preserves surviving ids', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const firstId = before.index.pathToId['0'];

  Editor.delete(editor, { at: [1] });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.equal(after.children[0].children[0].text, 'alpha');
  assert.equal(after.index.pathToId['0'], firstId);
  assert.equal(after.selection, null);
});

it('mirrors the legacy delete/path/block.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  Editor.delete(editor, { at: [1] });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['one']);
  assert.equal(after.selection, null);
});

it('supports delete helper calls with an exact path inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [2] }
    );
    Editor.delete(editor, { at: [2] });
  });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['alpha', 'beta']);
  assert.equal(after.selection, null);
});

it('supports delete helper calls with an exact point and removes one forward character', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const textId = before.index.pathToId['0.0'];

  Editor.delete(editor, {
    at: { path: [0, 0], offset: 2 },
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'alha');
  assert.equal(after.index.pathToId['0.0'], textId);
});

it('supports delete helper calls with an exact point, reverse, and distance inside the current text node', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const textId = before.index.pathToId['0.0'];

  Editor.delete(editor, {
    at: { path: [0, 0], offset: 3 },
    reverse: true,
    distance: 2,
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'aha');
  assert.equal(after.index.pathToId['0.0'], textId);
});

it('supports delete helper calls with an exact point across mixed-inline sibling leaves in one block', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  Editor.delete(editor, {
    at: { path: [0, 0], offset: 6 },
    distance: 1,
  });

  const after = Editor.getSnapshot(editor);
  const link = after.children[0].children[1] as Descendant & {
    children: Descendant[];
  };

  assert.equal(link.children[0].text, 'yperlink');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 0 },
  });
});

it('supports delete helper calls with an exact point across an adjacent top-level block boundary', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const firstBlockId = before.index.pathToId['0'];

  Editor.delete(editor, {
    at: { path: [0, 0], offset: 5 },
    distance: 1,
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(getBlockTexts(after.children), ['alphabeta']);
  assert.equal(after.index.pathToId['0'], firstBlockId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('supports delete helper calls across adjacent nested block boundaries without splitting the container', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const codeBlockId = before.index.pathToId['0'];
  const firstLineId = before.index.pathToId['0.0'];

  editor.update((tx) => {
    Editor.delete(editor, {
      at: { path: [0, 0, 0], offset: 5 },
      distance: 1,
    });
  });

  const after = Editor.getSnapshot(editor);
  const codeBlock = after.children[0] as Descendant & {
    type: string;
    children: Array<Descendant & { type: string; children: Descendant[] }>;
  };

  assert.equal(after.children.length, 1);
  assert.equal(codeBlock.type, 'code-block');
  assert.equal(codeBlock.children.length, 1);
  assert.equal(codeBlock.children[0].type, 'code-line');
  assert.deepEqual(codeBlock.children[0].children, [{ text: 'alphabeta' }]);
  assert.equal(after.index.pathToId['0'], codeBlockId);
  assert.equal(after.index.pathToId['0.0'], firstLineId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0, 0], offset: 5 },
    focus: { path: [0, 0, 0], offset: 5 },
  });
});

it('supports delete helper calls with an exact point inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    },
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    Editor.delete(editor, {
      at: { path: [1, 0], offset: 4 },
    });
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[1].children[0].text, 'beta');
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 4 },
    focus: { path: [1, 0], offset: 4 },
  });
});

it('supports delete helper calls with the current same-text selection and collapses inward', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    },
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const textId = before.index.pathToId['0.0'];

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'aha');
  assert.equal(after.index.pathToId['0.0'], textId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('mirrors the legacy delete/selection/character-middle.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'wrd');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('mirrors the legacy delete/point/basic.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyDeleteBoundaryChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['wordanother']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('mirrors the legacy delete/point/basic-reverse.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyBlockChildren(),
    selection: {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    },
    marks: null,
  });

  Editor.delete(editor, { reverse: true });

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['onetwo']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy delete/point/inline.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyInlineBoundaryChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

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
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy delete/selection/character-start.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'ord');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('mirrors the legacy delete/selection/character-end.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'wor');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('mirrors the legacy delete/selection/block-middle.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
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
      anchor: { path: [1, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['one', 'to', 'three']);
  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 1 },
    focus: { path: [1, 0], offset: 1 },
  });
});

it('mirrors the legacy delete/selection/block-across.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyDeleteBoundaryChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

  assert.deepEqual(getBlockTexts(after.children), ['woother']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 2 },
  });
});

it('mirrors the legacy delete/selection/inline-inside.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyInlineDeleteInsideChildren(),
    selection: {
      anchor: { path: [0, 1, 0], offset: 2 },
      focus: { path: [0, 1, 0], offset: 3 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);
  const link = after.children[0].children[1] as Descendant & {
    children: Descendant[];
  };

  assert.equal(link.children[0].text, 'wod');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 1, 0], offset: 2 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
});

it('collapses outside an inline after deleting its first selected character', () => {
  const editor = createEditor();

  defineElement(editor, { inline: true, type: 'link' });
  Editor.replace(editor, {
    children: createLegacyInlineDeleteInsideChildren(),
    selection: {
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 1 },
    },
    marks: null,
  });

  Editor.delete(editor, { reverse: true });

  const after = Editor.getSnapshot(editor);
  const link = after.children[0].children[1] as Descendant & {
    children: Descendant[];
  };

  assert.equal(link.children[0].text, 'ord');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });
});

it('collapses outside an inline after deleting its last selected character', () => {
  const editor = createEditor();

  defineElement(editor, { inline: true, type: 'link' });
  Editor.replace(editor, {
    children: createLegacyInlineDeleteInsideChildren(),
    selection: {
      anchor: { path: [0, 1, 0], offset: 3 },
      focus: { path: [0, 1, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.delete(editor, { reverse: false });

  const after = Editor.getSnapshot(editor);
  const link = after.children[0].children[1] as Descendant & {
    children: Descendant[];
  };

  assert.equal(link.children[0].text, 'wor');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 2], offset: 0 },
    focus: { path: [0, 2], offset: 0 },
  });
});

it('mirrors the legacy delete/selection/inline-over.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyInlineDeleteChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 2], offset: 4 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);
  const remainingTexts = after.children[0].children
    .map((child) => ('text' in child ? child.text : ''))
    .join('');

  assert.equal(remainingTexts, 'oe');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('deletes equivalent forward and backward expanded selections across text, block, and inline boundaries', () => {
  const cases = [
    {
      assertSnapshot(snapshot: ReturnType<typeof Editor.getSnapshot>) {
        assert.equal(snapshot.children[0].children[0].text, 'wd');
        assert.deepEqual(snapshot.selection, {
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
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 0], offset: 3 },
      },
    },
    {
      assertSnapshot(snapshot: ReturnType<typeof Editor.getSnapshot>) {
        assert.deepEqual(getBlockTexts(snapshot.children), ['woother']);
        assert.deepEqual(snapshot.selection, {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [0, 0], offset: 2 },
        });
      },
      children: createLegacyDeleteBoundaryChildren,
      name: 'block boundary',
      selection: {
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [1, 0], offset: 2 },
      },
    },
    {
      assertSnapshot(snapshot: ReturnType<typeof Editor.getSnapshot>) {
        const remainingTexts = snapshot.children[0].children
          .map((child) => ('text' in child ? child.text : ''))
          .join('');

        assert.equal(remainingTexts, 'oe');
        assert.deepEqual(snapshot.selection, {
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        });
      },
      children: createLegacyInlineDeleteChildren,
      configure(editor: ReturnType<typeof createEditor>) {
        defineElement(editor, { inline: true, type: 'link' });
      },
      name: 'inline boundary',
      selection: {
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
            anchor: testCase.selection.focus,
            focus: testCase.selection.anchor,
          }
        : testCase.selection;

      testCase.configure?.(editor);
      Editor.replace(editor, {
        children: testCase.children(),
        marks: null,
        selection,
      });
      Editor.delete(editor);

      return Editor.getSnapshot(editor);
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

  Editor.replace(editor, {
    children: createLegacyInlineDeleteInsideChildren(),
    selection: {
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 4 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);
  const link = after.children[0].children[1] as Descendant & {
    children: Descendant[];
  };

  assert.equal(link.children[0].text, '');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 0 },
  });
});

it('mirrors the legacy delete/selection/inline-after.tsx oracle row', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createLegacyInlineAfterChildren(),
    selection: {
      anchor: { path: [0, 2], offset: 0 },
      focus: { path: [0, 2], offset: 1 },
    },
    marks: null,
  });

  Editor.delete(editor);

  const after = Editor.getSnapshot(editor);

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
    anchor: { path: [0, 2], offset: 0 },
    focus: { path: [0, 2], offset: 0 },
  });
});

it('supports delete helper calls with an explicit non-empty range across adjacent mixed-inline sibling leaves', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  Editor.delete(editor, {
    at: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 1, 0], offset: 2 },
    },
  });

  const after = Editor.getSnapshot(editor);
  const link = after.children[0].children[1] as Descendant & {
    children: Descendant[];
  };

  assert.equal(after.children[0].children[0].text, 'befo');
  assert.equal(link.children[0].text, 'perlink');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('supports delete helper calls with an explicit non-empty range across a fully covered interior inline subtree', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  Editor.delete(editor, {
    at: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 2], offset: 2 },
    },
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'befo');
  assert.equal(after.children[0].children[1].text, 'ter');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('supports delete helper calls with an explicit non-empty range across an adjacent top-level block boundary', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  const before = Editor.getSnapshot(editor);
  const firstBlockId = before.index.pathToId['0'];

  Editor.delete(editor, {
    at: {
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [1, 0], offset: 2 },
    },
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(getBlockTexts(after.children), ['alphta']);
  assert.equal(after.index.pathToId['0'], firstBlockId);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 4 },
    focus: { path: [0, 0], offset: 4 },
  });
});

it('supports delete helper calls with the current same-text selection inside an outer transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 4 },
    });
    Editor.delete(editor);
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'aa!');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('supports delete helper calls with the current non-empty selection across adjacent mixed-inline sibling leaves inside an outer transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [0, 0], offset: 6 },
    });
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 1, 0], offset: 1 },
    });
    Editor.delete(editor);
  });

  const after = Editor.getSnapshot(editor);
  const link = after.children[0].children[1] as Descendant & {
    children: Descendant[];
  };

  assert.equal(after.children[0].children[0].text, 'before');
  assert.equal(link.children[0].text, 'yperlink');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 6 },
    focus: { path: [0, 0], offset: 6 },
  });
});

it('supports delete helper calls with the current non-empty selection across a fully covered interior inline subtree inside an outer transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [0, 0], offset: 6 },
    });
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 7 },
      focus: { path: [0, 2], offset: 1 },
    });
    Editor.delete(editor);
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'before!');
  assert.equal(after.children[0].children[1].text, 'fter');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 7 },
    focus: { path: [0, 0], offset: 7 },
  });
});

it('supports delete helper calls with the current non-empty selection across an adjacent top-level block boundary inside an outer transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [1, 0], offset: 2 },
    });
    Editor.delete(editor);
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(getBlockTexts(after.children), ['alphata!']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('supports delete helper calls with the current collapsed selection, reverse, and distance inside an outer transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
    Editor.select(editor, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    Editor.delete(editor, { reverse: true, distance: 2 });
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children[0].children[0].text, 'alp!');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 3 },
    focus: { path: [0, 0], offset: 3 },
  });
});

it('supports delete helper calls with the current collapsed selection across mixed-inline sibling leaves in one block', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.select(editor, {
      anchor: { path: [0, 2], offset: 0 },
      focus: { path: [0, 2], offset: 0 },
    });
    Editor.delete(editor, { reverse: true, distance: 1 });
  });

  const after = Editor.getSnapshot(editor);
  const link = after.children[0].children[1] as Descendant & {
    children: Descendant[];
  };

  assert.equal(link.children[0].text, 'hyperlin');
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 2], offset: 0 },
    focus: { path: [0, 2], offset: 0 },
  });
});

it('supports delete helper calls with the current collapsed selection across an adjacent top-level block boundary inside an outer transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    Editor.insertText(editor, '!', {
      at: { path: [1, 0], offset: 4 },
    });
    Editor.select(editor, {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    });
    Editor.delete(editor, { reverse: true, distance: 1 });
  });

  const after = Editor.getSnapshot(editor);

  assert.equal(after.children.length, 1);
  assert.deepEqual(getBlockTexts(after.children), ['alphabeta!']);
  assert.deepEqual(after.selection, {
    anchor: { path: [0, 0], offset: 5 },
    focus: { path: [0, 0], offset: 5 },
  });
});

it('supports operation replay through implicit transactions', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
  });

  applyOperation(editor, {
    type: 'insert_text',
    path: [1, 0],
    offset: 4,
    text: '!',
  });

  const snapshot = Editor.getSnapshot(editor);

  assert.equal(snapshot.children[1].children[0].text, 'beta!');
  assert.equal(snapshot.version, 2);
  assert.equal(Editor.getOperations(editor).length, 1);
});

it('stages replacement inside the active transaction', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
  });

  editor.update((tx) => {
    Editor.replace(editor, {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'fresh' }],
        },
      ],
      selection: null,
    });

    Editor.insertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
  });

  const snapshot = Editor.getSnapshot(editor);

  assert.equal(snapshot.version, 2);
  assert.equal(snapshot.children.length, 1);
  assert.equal(snapshot.children[0].children[0].text, 'fresh!');
});

it('publishes immutable snapshots detached from public editor fields', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
  });

  const snapshot = Editor.getSnapshot(editor);

  assert.throws(() => {
    (snapshot.children as Descendant[]).push({
      type: 'paragraph',
      children: [{ text: 'oops' }],
    });
  });

  assert.throws(() => {
    (snapshot.index.pathToId as Record<string, string>)['0'] = 'broken';
  });
  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'mutated' }],
      },
    ],
    selection: null,
    marks: null,
  });

  const reread = Editor.getSnapshot(editor);

  assert.notEqual(reread, snapshot);
  assert.equal(snapshot.children[0].children[0].text, 'alpha');
  assert.equal(reread.children[0].children[0].text, 'mutated');
});

it('deep-freezes snapshot selections including point paths', () => {
  const editor = createEditor();
  const selection = {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  };

  Editor.replace(editor, {
    children: createChildren(),
    selection,
  });

  const snapshot = Editor.getSnapshot(editor);

  assert.deepEqual(snapshot.selection, selection);
  assert.notEqual(snapshot.selection, selection);
  assert.notEqual(snapshot.selection?.anchor.path, selection.anchor.path);
  assert.throws(() => {
    (
      snapshot.selection as NonNullable<typeof snapshot.selection>
    ).anchor.path[0] = 9;
  });
  assert.deepEqual(Editor.getSnapshot(editor).selection?.anchor.path, [0, 0]);
});

it('deep-freezes nested marks instead of sharing nested payloads', () => {
  const editor = createEditor();
  const marks = {
    style: {
      color: 'red',
    },
  };

  Editor.replace(editor, {
    children: createChildren(),
    marks,
  });

  const snapshot = Editor.getSnapshot(editor);

  marks.style.color = 'blue';

  assert.equal(
    (snapshot.marks as { style: { color: string } }).style.color,
    'red'
  );
  assert.throws(() => {
    (snapshot.marks as { style: { color: string } }).style.color = 'green';
  });
});

it('uses addMark as the active mark write path', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'plain' }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    },
    marks: null,
  });

  Editor.addMark(editor, 'bold', true);

  assert.deepEqual(Editor.getSnapshot(editor).marks, { bold: true });
  assert.deepEqual(getMarks(editor), { bold: true });

  Editor.insertText(editor, '!');

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { bold?: boolean }>;
  };

  assert.deepEqual(snapshot.marks, null);
  assert.deepEqual(snapshot.selection, {
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

  Editor.replace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'hi', italic: true }],
      },
    ],
    selection: {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 2 },
    },
    marks: null,
  });

  Editor.addMark(editor, 'bold', true);

  assert.deepEqual(getMarks(editor), { italic: true, bold: true });

  Editor.insertText(editor, '!');

  const snapshot = Editor.getSnapshot(editor);
  const firstBlock = snapshot.children[0] as Descendant & {
    children: Array<Descendant & { bold?: boolean; italic?: boolean }>;
  };

  assert.deepEqual(firstBlock.children, [
    { text: 'hi', italic: true },
    { text: '!', italic: true, bold: true },
  ]);
});

it('uses select as the selection write path', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: {
      anchor: { path: [1, 0], offset: 4 },
      focus: { path: [1, 0], offset: 4 },
    },
  });
  Editor.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  });

  Editor.insertText(editor, '!');

  const snapshot = Editor.getSnapshot(editor);

  assert.equal(snapshot.children[0].children[0].text, '!alpha');
  assert.deepEqual(snapshot.selection, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
});

it('keeps ids stable across repeated replace calls in one outer transaction', () => {
  const singleReplaceEditor = createEditor();
  const doubleReplaceEditor = createEditor();

  Editor.replace(singleReplaceEditor, {
    children: createChildren(),
  });
  Editor.replace(doubleReplaceEditor, {
    children: createChildren(),
  });

  runEditorTransaction(singleReplaceEditor, (tx) => {
    Editor.replace(singleReplaceEditor, {
      children: createExpandedChildren(),
    });
  });

  runEditorTransaction(doubleReplaceEditor, (tx) => {
    Editor.replace(doubleReplaceEditor, {
      children: createExpandedChildren(),
    });
    Editor.replace(doubleReplaceEditor, {
      children: createExpandedChildren(),
    });
  });

  assert.equal(
    Editor.getSnapshot(singleReplaceEditor).index.pathToId['2.0'],
    Editor.getSnapshot(doubleReplaceEditor).index.pathToId['2.0']
  );
});

it('projects a cross-block range into local text segments keyed by runtime id', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  });

  const snapshot = Editor.getSnapshot(editor);
  const leftId = snapshot.index.pathToId['0.0'];
  const rightId = snapshot.index.pathToId['1.0'];

  assert.ok(leftId);
  assert.ok(rightId);

  assert.deepEqual(
    Editor.projectRange(editor, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    }),
    [
      {
        runtimeId: leftId,
        path: [0, 0],
        start: 2,
        end: 5,
      },
      {
        runtimeId: rightId,
        path: [1, 0],
        start: 0,
        end: 2,
      },
    ]
  );
});

it('projects ranges against an explicit snapshot for internal projection stores', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  });

  const snapshot = Editor.getSnapshot(editor);
  const leftId = snapshot.index.pathToId['0.0'];
  const rightId = snapshot.index.pathToId['1.0'];

  assert.ok(leftId);
  assert.ok(rightId);

  Editor.replace(editor, {
    children: [{ children: [{ text: 'replaced' }] }],
    selection: null,
  });

  assert.deepEqual(
    projectRangeInSnapshot(snapshot, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 2 },
    }),
    [
      {
        runtimeId: leftId,
        path: [0, 0],
        start: 2,
        end: 5,
      },
      {
        runtimeId: rightId,
        path: [1, 0],
        start: 0,
        end: 2,
      },
    ]
  );
});

it('reuses cached full-root replace indexes for top-level runtime ids', () => {
  const editor = createEditor();
  const children = Array.from({ length: 12 }, (_value, index) => ({
    type: 'paragraph',
    children: [{ text: `block ${index}` }],
  }));

  Editor.replace(editor, {
    children,
    selection: null,
  });

  const unsubscribe = Editor.subscribe(editor, () => {});
  const operation: Operation = {
    children,
    index: 0,
    newChildren: [{ type: 'paragraph', children: [{ text: '' }] }],
    newSelection: null,
    path: [],
    selection: null,
    type: 'replace_children',
  };

  try {
    applyOperation(editor, operation);

    const committedDeleteOperation =
      Editor.getLastCommit(editor)?.operations[0];

    assert(committedDeleteOperation);
    assert.equal(committedDeleteOperation.type, 'replace_children');

    applyOperation(editor, OperationApi.inverse(committedDeleteOperation));

    const committedUndoOperation = Editor.getLastCommit(editor)?.operations[0];

    assert(committedUndoOperation);
    assert.equal(committedUndoOperation.type, 'replace_children');

    const topLevelRuntimeIds = getCachedFullRootReplaceTopLevelRuntimeIds(
      committedUndoOperation
    );
    const restored = Editor.getSnapshot(editor);

    assert.deepEqual(
      topLevelRuntimeIds,
      Array.from(
        { length: 12 },
        (_value, index) => restored.index.pathToId[index]
      )
    );
    assert.equal(
      topLevelRuntimeIds?.includes(restored.index.pathToId['0.0']!),
      false
    );
  } finally {
    unsubscribe();
  }
});

it('projects a collapsed range into a zero-width local segment', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
    selection: null,
  });

  const snapshot = Editor.getSnapshot(editor);
  const leftId = snapshot.index.pathToId['0.0'];

  assert.ok(leftId);
  assert.deepEqual(
    Editor.projectRange(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    }),
    [
      {
        runtimeId: leftId,
        path: [0, 0],
        start: 3,
        end: 3,
      },
    ]
  );
});

it('keeps runtime ids unique across replace commits that allocate new nodes', () => {
  const editor = createEditor();

  Editor.replace(editor, {
    children: createChildren(),
  });

  Editor.replace(editor, {
    children: createExpandedChildren(),
  });

  Editor.replace(editor, {
    children: [
      ...createExpandedChildren(),
      {
        type: 'paragraph',
        children: [{ text: 'delta' }],
      },
    ],
  });

  const ids = Object.values(Editor.getSnapshot(editor).index.pathToId);

  assert.equal(new Set(ids).size, ids.length);
});
