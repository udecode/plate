import assert from 'node:assert/strict';

import {
  createEditor,
  type Descendant,
  type EditorElementSpec,
  NodeApi,
  PathApi,
} from '../src';

let extensionIndex = 0;

const defineElement = (
  editor: ReturnType<typeof createEditor>,
  spec: EditorElementSpec
) => {
  editor.extend({
    name: `query-contract-element-${extensionIndex++}`,
    elements: [spec],
  });
};

const defineVoidFlag = (editor: ReturnType<typeof createEditor>) => {
  defineElement(editor, {
    type: 'void-flag',
    match: (element) =>
      Boolean((element as { type?: string }).type) &&
      Boolean((element as { void?: boolean }).void),
    void: 'block',
  });
};

const defineInlineVoidFlag = (editor: ReturnType<typeof createEditor>) => {
  defineElement(editor, {
    type: 'inline-void-flag',
    match: (element) =>
      element.type === 'inline' &&
      Boolean((element as { void?: boolean }).void),
    void: 'inline',
  });
};

const defineNonSelectableFlag = (editor: ReturnType<typeof createEditor>) => {
  defineElement(editor, {
    type: 'non-selectable-flag',
    match: (element) =>
      Boolean((element as { nonSelectable?: boolean }).nonSelectable),
    selectable: false,
  });
};

const getStart = (
  editor: ReturnType<typeof createEditor>,
  ...args: Parameters<ReturnType<typeof createEditor>['read']> extends never
    ? never
    : [at: Parameters<typeof editorPoint>[1]]
) => editor.read((state) => state.points.start(args[0]));

const getEnd = (
  editor: ReturnType<typeof createEditor>,
  at: Parameters<typeof editorPoint>[1]
) => editor.read((state) => state.points.end(at));

const getNodeEntry = (
  editor: ReturnType<typeof createEditor>,
  at: Parameters<typeof editorPath>[1],
  options?: Parameters<typeof editorPath>[2]
) => editor.read((state) => state.nodes.get(editorPath(editor, at, options)));

const getNodeEntries = (
  editor: ReturnType<typeof createEditor>,
  options?: Parameters<ReturnType<typeof createEditor>['read']>[0] extends (
    state: infer State
  ) => unknown
    ? State extends { nodes: { entries: (options?: infer Options) => unknown } }
      ? Options
      : never
    : never
) => editor.read((state) => state.nodes.toArray(options));

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

const createVoidBlockPairChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    void: true,
    children: [{ text: 'one' }],
  } as Descendant,
  {
    type: 'paragraph',
    void: true,
    children: [{ text: 'two' }],
  } as Descendant,
];

const createVoidSplitChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    void: true,
    children: [{ text: 'one' }, { text: 'two' }],
  } as Descendant,
];

const createSelectableVoidBetweenBlocksChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
  {
    type: 'video',
    children: [{ text: '' }],
  } as Descendant,
  {
    type: 'paragraph',
    children: [{ text: 'two' }],
  },
];

const createNonSelectableBlockChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
  {
    type: 'paragraph',
    nonSelectable: true,
    children: [{ text: 'two' }],
  } as Descendant,
  {
    type: 'paragraph',
    children: [{ text: 'three' }],
  },
];

const createLeadingNonSelectableBlockChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    nonSelectable: true,
    children: [{ text: 'two' }],
  } as Descendant,
  {
    type: 'paragraph',
    children: [{ text: 'three' }],
  },
];

const createTrailingNonSelectableBlockChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [{ text: 'one' }],
  },
  {
    type: 'paragraph',
    nonSelectable: true,
    children: [{ text: 'two' }],
  } as Descendant,
];

const createNonSelectableInlineChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [
      { text: 'one' },
      {
        type: 'inline',
        nonSelectable: true,
        children: [{ text: 'two' }],
      },
      { text: 'three' },
    ],
  } as Descendant,
];

const createLeadingNonSelectableInlineChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [
      {
        type: 'inline',
        nonSelectable: true,
        children: [{ text: 'two' }],
      },
      { text: 'three' },
    ],
  } as Descendant,
];

const createTrailingNonSelectableInlineChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [
      { text: 'one' },
      {
        type: 'inline',
        nonSelectable: true,
        children: [{ text: 'two' }],
      },
    ],
  } as Descendant,
];

const createNonSelectableInlineVoidChildren = (): Descendant[] => [
  {
    type: 'paragraph',
    children: [
      { text: 'one' },
      {
        type: 'inline',
        void: true,
        nonSelectable: true,
        children: [{ text: '' }],
      },
      { text: 'three' },
    ],
  } as Descendant,
];

const createSingleBlockChildren = (): Descendant[] => [
  {
    type: 'block',
    children: [{ text: 'one' }],
  } as Descendant,
];

const createTwoBlockChildren = (): Descendant[] => [
  {
    type: 'block',
    children: [{ text: 'one' }],
  } as Descendant,
  {
    type: 'block',
    children: [{ text: 'two' }],
  } as Descendant,
];

const createNestedBlockChildren = (): Descendant[] => [
  {
    type: 'block',
    children: [
      {
        type: 'block',
        children: [{ text: 'one' }],
      },
    ],
  } as Descendant,
];

const createInlineBlockChildren = (): Descendant[] => [
  {
    type: 'block',
    children: [
      { text: 'one' },
      {
        type: 'inline',
        children: [{ text: 'two' }],
      },
      { text: 'three' },
    ],
  } as Descendant,
];

const createNestedInlineChildren = (): Descendant[] => [
  {
    type: 'block',
    children: [
      { text: 'one' },
      {
        type: 'inline',
        children: [
          { text: 'two' },
          {
            type: 'inline',
            children: [{ text: 'three' }],
          },
          { text: 'four' },
        ],
      },
      { text: 'five' },
    ],
  } as Descendant,
];

const createVoidBlockChildren = (): Descendant[] => [
  {
    type: 'block',
    void: true,
    children: [{ text: 'one' }, { text: 'two' }],
  } as Descendant,
];

const createVoidInlineChildren = (): Descendant[] => [
  {
    type: 'block',
    children: [
      { text: 'one' },
      {
        type: 'inline',
        void: true,
        children: [{ text: 'two' }],
      },
      { text: 'three' },
    ],
  } as Descendant,
];

const createMarkableVoidChildren = (): Descendant[] => [
  {
    type: 'block',
    children: [
      { text: 'word' },
      {
        type: 'inline',
        void: true,
        markable: true,
        children: [{ text: '', bold: true }],
      },
      { text: '' },
    ],
  } as Descendant,
];

it('above exposes the current traversal API', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'link', inline: true });

  editorReplace(editor, {
    children: [
      {
        type: 'quote',
        children: [
          {
            type: 'paragraph',
            children: [
              { text: 'one ' },
              {
                type: 'link',
                children: [{ text: 'two' }],
              },
              { text: ' three' },
            ],
          },
        ],
      } as Descendant,
    ],
    selection: {
      anchor: { path: [0, 0, 1, 0], offset: 1 },
      focus: { path: [0, 0, 1, 0], offset: 1 },
    },
    marks: null,
  });

  assert.deepEqual(editorAbove(editor, { at: [0, 0, 1, 0] }), [
    {
      type: 'link',
      children: [{ text: 'two' }],
    },
    [0, 0, 1],
  ]);
  assert.deepEqual(
    editorAbove(editor, {
      at: [0, 0, 1, 0],
      match: (node) =>
        'type' in node &&
        (node as Descendant & { type?: string }).type === 'paragraph',
    }),
    [
      {
        type: 'paragraph',
        children: [
          { text: 'one ' },
          {
            type: 'link',
            children: [{ text: 'two' }],
          },
          { text: ' three' },
        ],
      },
      [0, 0],
    ]
  );
});

it('mirrors the legacy above/block-lowest.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [{ text: 'one ' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAbove(editor, {
      at: [0, 0, 0],
      match: (node) =>
        'type' in node &&
        (node as Descendant & { type?: string }).type === 'block' &&
        editorIsBlock(editor, node),
      mode: 'lowest',
    }),
    [
      {
        type: 'block',
        children: [{ text: 'one ' }],
      },
      [0, 0],
    ]
  );
});

it('mirrors the legacy above/block-highest.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [{ text: 'one' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAbove(editor, {
      at: [0, 0, 0],
      match: (node) =>
        'type' in node &&
        (node as Descendant & { type?: string }).type === 'block' &&
        editorIsBlock(editor, node),
      mode: 'highest',
    }),
    [
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [{ text: 'one' }],
          },
        ],
      },
      [0],
    ]
  );
});

it('mirrors the legacy above/inline.tsx oracle row', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          { text: 'one' },
          {
            type: 'inline',
            children: [{ text: 'two' }],
          },
          { text: 'three' },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAbove(editor, {
      at: [0, 1, 0],
      match: (node) =>
        'type' in node &&
        (node as Descendant & { type?: string }).type === 'inline' &&
        editorIsInline(editor, node),
    }),
    [
      {
        type: 'inline',
        children: [{ text: 'two' }],
      },
      [0, 1],
    ]
  );
});

it('mirrors the legacy above/point.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [{ text: 'one' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAbove(editor, { at: { path: [0, 0, 0], offset: 1 } }),
    [
      {
        type: 'block',
        children: [{ text: 'one' }],
      },
      [0, 0],
    ]
  );
});

it('mirrors the legacy above/potential-parent.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [
              {
                type: 'block',
                children: [{ text: 'one' }],
              },
            ],
          },
          {
            type: 'block',
            children: [{ text: 'two' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAbove(editor, {
      at: [0, 0, 1],
      match: (node) =>
        'type' in node &&
        (node as Descendant & { type?: string }).type === 'block' &&
        editorIsBlock(editor, node),
    }),
    [
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [{ text: 'one' }],
          },
        ],
      },
      [0, 0],
    ]
  );
});

it('mirrors the legacy above/range.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [
              {
                type: 'block',
                children: [{ text: 'one' }],
              },
            ],
          },
          {
            type: 'block',
            children: [{ text: 'two' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAbove(editor, {
      at: {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      },
      match: (node) =>
        'type' in node &&
        (node as Descendant & { type?: string }).type === 'block' &&
        editorIsBlock(editor, node),
    }),
    [
      {
        type: 'block',
        children: [
          {
            type: 'block',
            children: [
              {
                type: 'block',
                children: [{ text: 'one' }],
              },
            ],
          },
          {
            type: 'block',
            children: [{ text: 'two' }],
          },
        ],
      },
      [0],
    ]
  );
});

it('mirrors the legacy edges/end/start/path/point/node/parent/range oracle rows', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createSingleBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorEdges(editor, [0]), [
    { path: [0, 0], offset: 0 },
    { path: [0, 0], offset: 3 },
  ]);
  assert.deepEqual(editorEdges(editor, { path: [0, 0], offset: 1 }), [
    { path: [0, 0], offset: 1 },
    { path: [0, 0], offset: 1 },
  ]);
  assert.deepEqual(
    editorEdges(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    }),
    [
      { path: [0, 0], offset: 1 },
      { path: [0, 0], offset: 3 },
    ]
  );

  assert.deepEqual(getStart(editor, [0]), { path: [0, 0], offset: 0 });
  assert.deepEqual(getStart(editor, { path: [0, 0], offset: 1 }), {
    path: [0, 0],
    offset: 1,
  });
  assert.deepEqual(
    getStart(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 3 },
    }),
    { path: [0, 0], offset: 1 }
  );

  assert.deepEqual(getEnd(editor, [0]), { path: [0, 0], offset: 3 });
  assert.deepEqual(getEnd(editor, { path: [0, 0], offset: 1 }), {
    path: [0, 0],
    offset: 1,
  });
  assert.deepEqual(
    getEnd(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 2 },
    }),
    { path: [0, 0], offset: 2 }
  );

  assert.deepEqual(editorPath(editor, [0]), [0]);
  assert.deepEqual(editorPath(editor, { path: [0, 0], offset: 1 }), [0, 0]);
  assert.deepEqual(editorPoint(editor, [0]), { path: [0, 0], offset: 0 });
  assert.deepEqual(editorPoint(editor, [0], { edge: 'end' }), {
    path: [0, 0],
    offset: 3,
  });
  assert.deepEqual(editorPoint(editor, { path: [0, 0], offset: 1 }), {
    path: [0, 0],
    offset: 1,
  });

  assert.deepEqual(getNodeEntry(editor, [0]), [
    {
      type: 'block',
      children: [{ text: 'one' }],
    },
    [0],
  ]);
  assert.deepEqual(getNodeEntry(editor, { path: [0, 0], offset: 1 }), [
    { text: 'one' },
    [0, 0],
  ]);
  assert.deepEqual(editorParent(editor, [0, 0]), [
    {
      type: 'block',
      children: [{ text: 'one' }],
    },
    [0],
  ]);
  assert.deepEqual(editorParent(editor, { path: [0, 0], offset: 1 }), [
    {
      type: 'block',
      children: [{ text: 'one' }],
    },
    [0],
  ]);
  assert.deepEqual(editorRange(editor, [0]), {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 3 },
  });
  assert.deepEqual(editorRange(editor, { path: [0, 0], offset: 1 }), {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 1 },
  });
  assert.deepEqual(
    editorRange(editor, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 1 },
    }),
    {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [0, 0], offset: 1 },
    }
  );

  editorReplace(editor, {
    children: createTwoBlockChildren(),
    selection: null,
    marks: null,
  });

  const spanningRange = {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  };

  assert.deepEqual(editorPath(editor, spanningRange), []);
  assert.deepEqual(
    editorPath(editor, spanningRange, { edge: 'start' }),
    [0, 0]
  );
  assert.deepEqual(editorPath(editor, spanningRange, { edge: 'end' }), [1, 0]);
  assert.deepEqual(editorPoint(editor, spanningRange), {
    path: [0, 0],
    offset: 1,
  });
  assert.deepEqual(editorPoint(editor, spanningRange, { edge: 'end' }), {
    path: [1, 0],
    offset: 2,
  });
  const rangeNode = getNodeEntry(editor, spanningRange);
  assert.equal(editorIsEditor(rangeNode[0]), true);
  assert.deepEqual(rangeNode[1], []);
  assert.deepEqual(getNodeEntry(editor, spanningRange, { edge: 'start' }), [
    { text: 'one' },
    [0, 0],
  ]);
  assert.deepEqual(getNodeEntry(editor, spanningRange, { edge: 'end' }), [
    { text: 'two' },
    [1, 0],
  ]);
  assert.deepEqual(editorParent(editor, spanningRange, { edge: 'start' }), [
    {
      type: 'block',
      children: [{ text: 'one' }],
    },
    [0],
  ]);
  assert.deepEqual(editorParent(editor, spanningRange, { edge: 'end' }), [
    {
      type: 'block',
      children: [{ text: 'two' }],
    },
    [1],
  ]);
  assert.deepEqual(editorRange(editor, spanningRange), spanningRange);
});

it('resolves element path edges to nested text points', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'link', inline: true });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'a' },
          {
            type: 'link',
            children: [{ text: 'bc' }],
          },
          { text: 'd' },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorRange(editor, [0]), {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 2], offset: 1 },
  });
  assert.deepEqual(editorRange(editor, [0, 1]), {
    anchor: { path: [0, 1, 0], offset: 0 },
    focus: { path: [0, 1, 0], offset: 2 },
  });
  assert.deepEqual(editorEdges(editor, [0, 1]), [
    { path: [0, 1, 0], offset: 0 },
    { path: [0, 1, 0], offset: 2 },
  ]);

  const backwardRange = {
    anchor: { path: [0, 2], offset: 1 },
    focus: { path: [0, 0], offset: 0 },
  };

  assert.deepEqual(editorPoint(editor, backwardRange), {
    path: [0, 0],
    offset: 0,
  });
  assert.deepEqual(editorPoint(editor, backwardRange, { edge: 'end' }), {
    path: [0, 2],
    offset: 1,
  });
});

it('mirrors the legacy string oracle rows', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });
  defineElement(editor, {
    type: 'void-flag',
    match: (element) => Boolean((element as { void?: boolean }).void),
    void: 'block',
  });

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [{ text: 'one' }, { text: 'two' }],
      } as Descendant,
      {
        type: 'block',
        children: [{ text: 'three' }, { text: 'four' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.equal(editorString(editor, [0, 0]), 'one');
  assert.equal(editorString(editor, [0]), 'onetwo');
  assert.equal(editorString(editor, []), 'onetwothreefour');

  editorReplace(editor, {
    children: createInlineBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorString(editor, [0, 1]), 'two');

  editorReplace(editor, {
    children: createVoidBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorString(editor, [0]), '');
  assert.equal(editorString(editor, [0], { voids: true }), 'onetwo');
});

it('mirrors the legacy has*/is* editor predicate oracle rows', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });
  defineElement(editor, {
    type: 'void-flag',
    match: (element) => Boolean((element as { void?: boolean }).void),
    void: 'block',
  });

  editorReplace(editor, {
    children: createNestedBlockChildren(),
    selection: null,
    marks: null,
  });

  const nestedBlock = getNodeEntry(editor, [0])[0] as Descendant & {
    children: Descendant[];
  };
  assert.equal(editorHasBlocks(editor, nestedBlock), true);
  assert.equal(editorHasInlines(editor, nestedBlock), false);
  assert.equal(editorHasTexts(editor, nestedBlock), false);

  editorReplace(editor, {
    children: createSingleBlockChildren(),
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    marks: null,
  });

  const block = getNodeEntry(editor, [0])[0] as Descendant & {
    children: Descendant[];
  };
  assert.equal(editorHasBlocks(editor, block), false);
  assert.equal(editorHasInlines(editor, block), true);
  assert.equal(editorHasTexts(editor, block), true);
  assert.equal(editorIsBlock(editor, block), true);
  assert.equal(editorIsInline(editor, block), false);
  assert.equal(editorIsVoid(editor, block), false);
  assert.equal(
    editorIsEmpty(editor, { type: 'block', children: [{ text: '' }] }),
    true
  );
  assert.equal(editorIsEmpty(editor, { type: 'block', children: [] }), true);
  assert.equal(editorIsEmpty(editor, block), false);
  assert.equal(editorIsStart(editor, { path: [0, 0], offset: 0 }, [0]), true);
  assert.equal(editorIsStart(editor, { path: [0, 0], offset: 2 }, [0]), false);
  assert.equal(editorIsEnd(editor, { path: [0, 0], offset: 3 }, [0]), true);
  assert.equal(editorIsEnd(editor, { path: [0, 0], offset: 2 }, [0]), false);
  assert.equal(editorIsEdge(editor, { path: [0, 0], offset: 0 }, [0]), true);
  assert.equal(editorIsEdge(editor, { path: [0, 0], offset: 2 }, [0]), false);
  assert.equal(editorIsEdge(editor, { path: [0, 0], offset: 3 }, [0]), true);

  editorReplace(editor, {
    children: createInlineBlockChildren(),
    selection: null,
    marks: null,
  });

  const inline = getNodeEntry(editor, [0, 1])[0] as Descendant & {
    children: Descendant[];
  };
  assert.equal(editorHasBlocks(editor, inline), false);
  assert.equal(editorHasInlines(editor, inline), true);
  assert.equal(editorHasTexts(editor, inline), true);
  assert.equal(editorIsBlock(editor, inline), false);
  assert.equal(editorIsInline(editor, inline), true);
  assert.equal(editorIsVoid(editor, inline), false);
  assert.equal(
    editorIsEmpty(editor, { type: 'inline', children: [{ text: '' }] }),
    true
  );
  assert.equal(editorIsEmpty(editor, { type: 'inline', children: [] }), true);
  assert.equal(editorIsEmpty(editor, inline), false);

  editorReplace(editor, {
    children: createNestedInlineChildren(),
    selection: null,
    marks: null,
  });

  const nestedInline = getNodeEntry(editor, [0, 1])[0] as Descendant & {
    children: Descendant[];
  };
  assert.equal(editorHasBlocks(editor, nestedInline), false);
  assert.equal(editorHasInlines(editor, nestedInline), true);
  assert.equal(editorHasTexts(editor, nestedInline), false);

  editorReplace(editor, {
    children: createVoidBlockChildren(),
    selection: null,
    marks: null,
  });

  const voidBlock = getNodeEntry(editor, [0])[0] as Descendant & {
    children: Descendant[];
  };
  assert.equal(editorIsVoid(editor, voidBlock), true);
  assert.equal(editorIsEmpty(editor, voidBlock), false);

  editorReplace(editor, {
    children: createVoidInlineChildren(),
    selection: null,
    marks: null,
  });

  const voidInline = getNodeEntry(editor, [0, 1])[0] as Descendant & {
    children: Descendant[];
  };
  assert.equal(editorIsVoid(editor, voidInline), true);
  assert.equal(editorIsEmpty(editor, voidInline), false);
});

it('mirrors the legacy mark-read oracle rows', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });
  defineElement(editor, {
    type: 'void-flag',
    match: (element) => Boolean((element as { void?: boolean }).void),
    void: 'block',
  });

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          { text: 'plain ' },
          { text: 'bold', bold: true },
          { text: ' plain' },
        ],
      } as Descendant,
      {
        type: 'block',
        children: [{ text: 'block two' }],
      } as Descendant,
    ],
    selection: {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 1], offset: 4 },
    },
    marks: null,
  });

  assert.deepEqual(getMarks(editor), { bold: true });

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [{ text: 'block one' }],
      } as Descendant,
      {
        type: 'block',
        children: [{ text: 'block two', bold: true }],
      } as Descendant,
      {
        type: 'block',
        children: [{ text: 'block three', bold: true }],
      } as Descendant,
    ],
    selection: {
      anchor: { path: [2, 0], offset: 0 },
      focus: { path: [0, 0], offset: 9 },
    },
    marks: null,
  });

  assert.deepEqual(getMarks(editor), { bold: true });

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          { text: 'plain' },
          { text: 'bold text that isbold', bold: true },
          { text: 'bold italic', bold: true, italic: true },
        ],
      } as Descendant,
      {
        type: 'block',
        children: [{ text: 'block two' }],
      } as Descendant,
    ],
    selection: {
      anchor: { path: [0, 1], offset: 17 },
      focus: { path: [0, 1], offset: 17 },
    },
    marks: null,
  });

  assert.deepEqual(getMarks(editor), { bold: true });

  editorReplace(editor, {
    children: createMarkableVoidChildren(),
    selection: {
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 0 },
    },
    marks: null,
  });
  defineElement(editor, {
    type: 'markable-flag',
    match: (element) => Boolean((element as { markable?: boolean }).markable),
    void: 'markable-inline',
  });

  assert.deepEqual(getMarks(editor), { bold: true });

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          { text: 'word' },
          {
            type: 'inline',
            void: true,
            markable: true,
            children: [{ text: '', bold: true }],
          },
          { text: 'bold', bold: true },
          {
            type: 'inline',
            void: true,
            markable: true,
            children: [{ text: '', bold: true, italic: true }],
          },
          { text: 'bold italic', bold: true, italic: true },
          { text: '' },
        ],
      } as Descendant,
    ],
    selection: {
      anchor: { path: [0, 1, 0], offset: 0 },
      focus: { path: [0, 4], offset: 11 },
    },
    marks: null,
  });

  assert.deepEqual(getMarks(editor), { bold: true });
});

it('positions exposes the current point-iteration API across offset, character, word, and block units', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'link', inline: true });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'one' },
          {
            type: 'link',
            children: [{ text: 'two' }],
          },
          { text: 'three' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: 'four five' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Array.from(editorPositions(editor, { at: [0] })), [
    { path: [0, 0], offset: 0 },
    { path: [0, 0], offset: 1 },
    { path: [0, 0], offset: 2 },
    { path: [0, 0], offset: 3 },
    { path: [0, 1, 0], offset: 0 },
    { path: [0, 1, 0], offset: 1 },
    { path: [0, 1, 0], offset: 2 },
    { path: [0, 1, 0], offset: 3 },
    { path: [0, 2], offset: 0 },
    { path: [0, 2], offset: 1 },
    { path: [0, 2], offset: 2 },
    { path: [0, 2], offset: 3 },
    { path: [0, 2], offset: 4 },
    { path: [0, 2], offset: 5 },
  ]);

  assert.deepEqual(
    Array.from(editorPositions(editor, { at: [], unit: 'character' })),
    [
      { path: [0, 0], offset: 0 },
      { path: [0, 0], offset: 1 },
      { path: [0, 0], offset: 2 },
      { path: [0, 0], offset: 3 },
      { path: [0, 1, 0], offset: 1 },
      { path: [0, 1, 0], offset: 2 },
      { path: [0, 1, 0], offset: 3 },
      { path: [0, 2], offset: 1 },
      { path: [0, 2], offset: 2 },
      { path: [0, 2], offset: 3 },
      { path: [0, 2], offset: 4 },
      { path: [0, 2], offset: 5 },
      { path: [1, 0], offset: 0 },
      { path: [1, 0], offset: 1 },
      { path: [1, 0], offset: 2 },
      { path: [1, 0], offset: 3 },
      { path: [1, 0], offset: 4 },
      { path: [1, 0], offset: 5 },
      { path: [1, 0], offset: 6 },
      { path: [1, 0], offset: 7 },
      { path: [1, 0], offset: 8 },
      { path: [1, 0], offset: 9 },
    ]
  );

  assert.deepEqual(
    Array.from(editorPositions(editor, { at: [1], unit: 'word' })),
    [
      { path: [1, 0], offset: 0 },
      { path: [1, 0], offset: 4 },
      { path: [1, 0], offset: 9 },
    ]
  );

  assert.deepEqual(
    Array.from(
      editorPositions(editor, { at: [], unit: 'block', reverse: true })
    ),
    [
      { path: [1, 0], offset: 9 },
      { path: [1, 0], offset: 0 },
      { path: [0, 2], offset: 5 },
      { path: [0, 0], offset: 0 },
    ]
  );
});

it('positions returns no points for stale range endpoints but still rejects invalid live offsets', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'one' }],
      },
    ],
    selection: null,
    marks: null,
  });

  const staleRange = {
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 3 },
  };

  assert.deepEqual(Array.from(editorPositions(editor, { at: staleRange })), []);

  assert.throws(
    () =>
      Array.from(
        editorPositions(editor, {
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 999 },
          },
        })
      ),
    /Point offset 999 is outside text bounds/
  );
});

it('mirrors the legacy positions/path/inline.tsx oracle row', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          { text: 'one' },
          {
            type: 'inline',
            children: [{ text: 'two' }],
          },
          { text: 'three' },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Array.from(editorPositions(editor, { at: [0, 1] })), [
    { path: [0, 1, 0], offset: 0 },
    { path: [0, 1, 0], offset: 1 },
    { path: [0, 1, 0], offset: 2 },
    { path: [0, 1, 0], offset: 3 },
  ]);
});

it('mirrors the legacy positions/all/inline-fragmentation.tsx oracle row', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          { text: '1' },
          {
            type: 'inline',
            children: [{ text: '2' }],
          },
          { text: '3' },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Array.from(editorPositions(editor, { at: [] })), [
    { path: [0, 0], offset: 0 },
    { path: [0, 0], offset: 1 },
    { path: [0, 1, 0], offset: 0 },
    { path: [0, 1, 0], offset: 1 },
    { path: [0, 2], offset: 0 },
    { path: [0, 2], offset: 1 },
  ]);
});

it('unhangRange exposes the current hanging-range API', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'another' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorUnhangRange(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    }),
    {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    }
  );

  assert.deepEqual(
    editorUnhangRange(editor, {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 0 },
    }),
    {
      anchor: { path: [0, 0], offset: 2 },
      focus: { path: [1, 0], offset: 0 },
    }
  );
});

const unhangOracleCases = [
  {
    name: 'mirrors the legacy unhangRange/block-hanging.tsx oracle row',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'word' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'another' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/collapsed.tsx oracle row',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'one' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/text-hanging.tsx oracle row',
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'before' }, { text: 'selected' }, { text: 'after' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 2], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 6 },
      focus: { path: [0, 2], offset: 0 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/block-hanging-over-void.tsx oracle row',
    configure: (editor: ReturnType<typeof createEditor>) => {
      defineElement(editor, { type: 'block', void: 'block' });
    },
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'This is a first paragraph' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'This is the second paragraph' }],
      },
      {
        type: 'block',
        children: [{ text: 'This void paragraph gets skipped over' }],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [3, 0], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 28 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/block-hanging-over-void-with-voids-option.tsx oracle row',
    configure: (editor: ReturnType<typeof createEditor>) => {
      defineElement(editor, { type: 'block', void: 'block' });
    },
    options: { voids: true },
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'This is a first paragraph' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'This is the second paragraph' }],
      },
      {
        type: 'block',
        children: [{ text: '' }],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [3, 0], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 28 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/block-hanging-over-non-empty-void-with-voids-option.tsx oracle row',
    configure: (editor: ReturnType<typeof createEditor>) => {
      defineElement(editor, { type: 'block', void: 'block' });
    },
    options: { voids: true },
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'This is a first paragraph' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'This is the second paragraph' }],
      },
      {
        type: 'block',
        children: [{ text: 'This is the third paragraph' }],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [3, 0], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [2, 0], offset: 27 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/inline-at-end.tsx oracle row',
    configure: (editor: ReturnType<typeof createEditor>) => {
      defineElement(editor, { type: 'inline', inline: true });
      defineInlineVoidFlag(editor);
    },
    options: { voids: true },
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is a first paragraph' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 0 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/multi-block-inline-at-end.tsx oracle row',
    configure: (editor: ReturnType<typeof createEditor>) => {
      defineElement(editor, { type: 'inline', inline: true });
      defineInlineVoidFlag(editor);
    },
    options: { voids: true },
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is the first paragraph' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [
          { text: 'This is the second paragraph' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [2, 0], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 2], offset: 0 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/not-hanging-inline-at-end.tsx oracle row',
    configure: (editor: ReturnType<typeof createEditor>) => {
      defineElement(editor, { type: 'inline', inline: true });
      defineInlineVoidFlag(editor);
    },
    options: { voids: true },
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is the first paragraph' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: 'This is the second paragraph' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 2], offset: 0 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/not-hanging-multi-block-inline-at-end.tsx oracle row',
    configure: (editor: ReturnType<typeof createEditor>) => {
      defineElement(editor, { type: 'inline', inline: true });
      defineInlineVoidFlag(editor);
    },
    options: { voids: true },
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'This is the first paragraph' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [
          { text: 'This is the second paragraph' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: 'This is the third paragraph' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 2], offset: 0 },
    },
    expected: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 2], offset: 0 },
    },
  },
  {
    name: 'mirrors the legacy unhangRange/inline-range-normal.tsx oracle row',
    configure: (editor: ReturnType<typeof createEditor>) => {
      defineElement(editor, { type: 'inline', inline: true });
      defineInlineVoidFlag(editor);
    },
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'Block before' }],
      },
      {
        type: 'paragraph',
        children: [
          { text: 'Some text before ' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: '' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: 'Another block' }],
      },
    ] as Descendant[],
    selection: {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 1, 0], offset: 0 },
    },
    expected: {
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 1, 0], offset: 0 },
    },
  },
];

for (const testCase of unhangOracleCases) {
  it(testCase.name, () => {
    const editor = createEditor();
    testCase.configure?.(editor);

    editorReplace(editor, {
      children: testCase.children,
      selection: null,
      marks: null,
    });

    assert.deepEqual(
      editorUnhangRange(editor, testCase.selection, testCase.options),
      testCase.expected
    );
  });
}

it('nodes supports pass and universal on the current traversal contract', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'section',
        pass: true,
        children: [
          {
            type: 'paragraph',
            match: true,
            children: [{ text: 'one' }],
          },
        ],
      } as Descendant,
      {
        type: 'section',
        children: [
          {
            type: 'paragraph',
            match: true,
            children: [{ text: 'two' }],
          },
          {
            type: 'paragraph',
            pass: true,
            match: true,
            children: [{ text: 'three' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    Array.from(
      getNodeEntries(editor, {
        at: [],
        match: (node) => !!(node as Record<string, unknown>).match,
        pass: ([node]) => !!(node as Record<string, unknown>).pass,
      })
    ),
    [
      [
        {
          type: 'paragraph',
          match: true,
          children: [{ text: 'two' }],
        },
        [1, 0],
      ],
      [
        {
          type: 'paragraph',
          pass: true,
          match: true,
          children: [{ text: 'three' }],
        },
        [1, 1],
      ],
    ]
  );

  assert.deepEqual(
    Array.from(
      getNodeEntries(editor, {
        at: [],
        match: (node) => !!(node as Record<string, unknown>).match,
        mode: 'lowest',
        universal: true,
      })
    ),
    [
      [
        {
          type: 'paragraph',
          match: true,
          children: [{ text: 'one' }],
        },
        [0, 0],
      ],
      [
        {
          type: 'paragraph',
          match: true,
          children: [{ text: 'two' }],
        },
        [1, 0],
      ],
      [
        {
          type: 'paragraph',
          pass: true,
          match: true,
          children: [{ text: 'three' }],
        },
        [1, 1],
      ],
    ]
  );
});

it('state node query helpers keep lazy traversal and early-exit first-match checks', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'target',
        children: [{ text: 'one' }],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
      {
        type: 'target',
        children: [{ text: 'three' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  const entries = editor.read((state) =>
    state.nodes.toArray({
      at: [],
      match: (node) => 'type' in node && node.type === 'target',
    })
  );

  assert.deepEqual(
    entries.map(([, path]) => path),
    [[0], [2]]
  );

  let mappedEntries = 0;
  const mappedPaths = editor.read((state) =>
    state.nodes.toArray(
      {
        at: [],
        match: (node) => 'type' in node && node.type === 'target',
      },
      ([, path]) => {
        mappedEntries += 1;

        return path;
      }
    )
  );

  assert.deepEqual(mappedPaths, [[0], [2]]);
  assert.equal(mappedEntries, 2);

  let findVisits = 0;
  const found = editor.read((state) =>
    state.nodes.find({
      at: [],
      match: (node) => {
        findVisits += 1;

        return 'type' in node && node.type === 'target';
      },
    })
  );

  assert.deepEqual(found?.[1], [0]);
  assert.equal(findVisits, 2);

  let someVisits = 0;
  const hasTarget = editor.read((state) =>
    state.nodes.some({
      at: [],
      match: (node) => {
        someVisits += 1;

        return 'type' in node && node.type === 'target';
      },
    })
  );

  assert.equal(hasTarget, true);
  assert.equal(someVisits, 2);

  const hasMissing = editor.read((state) =>
    state.nodes.some({
      at: [],
      match: (node) => 'type' in node && node.type === 'missing',
    })
  );

  assert.equal(hasMissing, false);
});

it('nodes covers sibling and range traversal for nested inline documents', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'link', inline: true });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'A1' },
          {
            type: 'link',
            children: [{ text: 'A3' }],
          },
          { text: 'A4' },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: 'B1' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    Array.from(NodeApi.children(editor, [])).map(([, path]) => path),
    [[0], [1], [2]]
  );
  assert.deepEqual(
    Array.from(NodeApi.children(editor, [], { reverse: true })).map(
      ([, path]) => path
    ),
    [[2], [1], [0]]
  );
  assert.deepEqual(
    Array.from(NodeApi.children(editor, [0])).map(([, path]) => path),
    [
      [0, 0],
      [0, 1],
      [0, 2],
    ]
  );
  assert.deepEqual(
    Array.from(NodeApi.descendants(editor)).map(([, path]) => path),
    [[0], [0, 0], [0, 1], [0, 1, 0], [0, 2], [1], [1, 0], [2], [2, 0]]
  );

  const partialRange = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [1, 0], offset: 2 },
  };

  assert.deepEqual(
    Array.from(
      getNodeEntries(editor, {
        at: partialRange,
        mode: 'lowest',
      })
    ).map(([, path]) => path),
    [
      [0, 0],
      [0, 1, 0],
      [0, 2],
      [1, 0],
    ]
  );
  assert.deepEqual(
    Array.from(
      getNodeEntries(editor, {
        at: partialRange,
        match: (node) => 'type' in node,
        mode: 'lowest',
      })
    ).map(([, path]) => path),
    [[0, 1], [1]]
  );
});

it('nodes expose ancestry, sibling order, and common ancestor relationships', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'foo' }, { text: 'bar' }, { text: 'baz' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'qux' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    Array.from(NodeApi.ancestors(editor, [0, 2])).map(([, path]) => path),
    [[], [0]]
  );
  assert.deepEqual(
    Array.from(NodeApi.ancestors(editor, [0, 2], { reverse: true })).map(
      ([, path]) => path
    ),
    [[0], []]
  );

  assert.deepEqual(NodeApi.common(editor, [0, 0], [0, 2]), [
    {
      type: 'paragraph',
      children: [{ text: 'foo' }, { text: 'bar' }, { text: 'baz' }],
    },
    [0],
  ]);

  const rootCommon = NodeApi.common(editor, [0, 1], [1, 0]);

  assert.equal(editorIsEditor(rootCommon[0]), true);
  assert.deepEqual(rootCommon[1], []);
  assert.deepEqual(PathApi.common([0, 0], [0, 2]), [0]);
  assert.deepEqual(PathApi.common([0, 1], [1, 0]), []);
  assert.deepEqual(PathApi.previous([0, 2]), [0, 1]);
  assert.deepEqual(PathApi.next([0, 1]), [0, 2]);
  assert.equal(PathApi.hasPrevious([0, 0]), false);
  assert.equal(PathApi.hasPrevious([0, 1]), true);
  assert.equal(PathApi.isBefore([0, 0], [0, 1]), true);
  assert.equal(PathApi.isBefore([0, 1], [1, 0]), true);
  assert.equal(PathApi.isBefore([1, 0], [0, 1]), false);
  assert.equal(PathApi.isParent([0], [0, 2]), true);
  assert.equal(PathApi.isAncestor([], [1, 0]), true);
  assert.equal(PathApi.isParent([], [1, 0]), false);
});

it('resolves nested list ancestry and terminal list-item paths', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'section',
        children: [
          {
            type: 'bulleted-list',
            children: [
              {
                type: 'list-item',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'one' }],
                  },
                  {
                    type: 'bulleted-list',
                    children: [
                      {
                        type: 'list-item',
                        children: [
                          {
                            type: 'paragraph',
                            children: [{ text: 'two' }],
                          },
                          {
                            type: 'numbered-list',
                            children: [
                              {
                                type: 'list-item',
                                children: [
                                  {
                                    type: 'paragraph',
                                    children: [{ text: 'three' }],
                                  },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                type: 'list-item',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'four' }],
                  },
                ],
              },
            ],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  const isType = (path: number[], type: string) => {
    const node = NodeApi.get(editor, path);

    return !editorIsEditor(node) && 'type' in node && node.type === type;
  };
  const isList = (path: number[]) =>
    isType(path, 'bulleted-list') || isType(path, 'numbered-list');
  const listLevelPaths = (path: number[]) =>
    PathApi.levels(path).filter((levelPath) => isList(levelPath));

  const topListPath = [0, 0];
  const firstTopItemPath = [0, 0, 0];
  const secondTopItemPath = [0, 0, 1];
  const nestedListPath = [0, 0, 0, 1];
  const nestedItemPath = [0, 0, 0, 1, 0];
  const deepestListPath = [0, 0, 0, 1, 0, 1];
  const deepestItemPath = [0, 0, 0, 1, 0, 1, 0];

  assert.deepEqual(listLevelPaths(deepestListPath), [
    topListPath,
    nestedListPath,
    deepestListPath,
  ]);
  assert.deepEqual(listLevelPaths(deepestItemPath), [
    topListPath,
    nestedListPath,
    deepestListPath,
  ]);
  assert.deepEqual(listLevelPaths(secondTopItemPath), [topListPath]);
  assert.equal(PathApi.levels(deepestListPath).filter(isList).length, 3);
  assert.equal(isType(firstTopItemPath.concat(1), 'bulleted-list'), true);
  assert.equal(NodeApi.has(editor, PathApi.next(firstTopItemPath)), true);
  assert.equal(NodeApi.has(editor, PathApi.next(nestedItemPath)), false);
  assert.equal(NodeApi.has(editor, PathApi.next(deepestItemPath)), false);
  assert.equal(NodeApi.has(editor, PathApi.next(secondTopItemPath)), false);
});

it('nodes exposes nested text leaves and text content for element queries', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'block',
        children: [
          { text: 'Foo' },
          {
            type: 'block',
            children: [{ text: 'Bar' }, { text: 'Baz' }],
          },
          { text: 'Qux' },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    Array.from(NodeApi.texts(editor)).map(([, path]) => path),
    [
      [0, 0],
      [0, 1, 0],
      [0, 1, 1],
      [0, 2],
    ]
  );
  assert.deepEqual(NodeApi.first(editor, [0]), [{ text: 'Foo' }, [0, 0]]);
  assert.deepEqual(NodeApi.last(editor, [0]), [{ text: 'Qux' }, [0, 2]]);
  assert.equal(NodeApi.string(getNodeEntry(editor, [0])[0]), 'FooBarBazQux');
});

it('nodes reverse returns the exact inverse of forward matches', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'a' },
          {
            type: 'nested',
            children: [{ text: 'b' }],
          },
          { text: 'c' },
          {
            type: 'nested',
            children: [{ text: 'd' }],
          },
        ],
      } as Descendant,
      {
        type: 'paragraph',
        children: [{ text: 'e' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  const match = (node: Descendant) =>
    'type' in node && (node.type === 'paragraph' || node.type === 'nested');
  const paths = (options: { reverse?: boolean } = {}) =>
    Array.from(
      getNodeEntries(editor, {
        at: [],
        match,
        ...options,
      })
    ).map(([, path]) => path.join('.'));

  const forward = paths();

  assert.deepEqual(forward, ['0', '0.1', '0.3', '1']);
  assert.deepEqual(paths({ reverse: true }), [...forward].reverse());
});

it('positions exposes selectable voids atomically and enters void content only when enabled', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'mention', void: 'block' });

  editorReplace(editor, {
    children: [
      {
        type: 'mention',
        children: [
          { text: 'one' },
          {
            type: 'chip',
            children: [{ text: 'two' }],
          },
          { text: 'three' },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Array.from(editorPositions(editor, { at: [] })), [
    { path: [0, 0], offset: 0 },
  ]);
  assert.deepEqual(
    Array.from(editorPositions(editor, { at: [], voids: true })),
    [
      { path: [0, 0], offset: 0 },
      { path: [0, 0], offset: 1 },
      { path: [0, 0], offset: 2 },
      { path: [0, 0], offset: 3 },
      { path: [0, 1, 0], offset: 0 },
      { path: [0, 1, 0], offset: 1 },
      { path: [0, 1, 0], offset: 2 },
      { path: [0, 1, 0], offset: 3 },
      { path: [0, 2], offset: 0 },
      { path: [0, 2], offset: 1 },
      { path: [0, 2], offset: 2 },
      { path: [0, 2], offset: 3 },
      { path: [0, 2], offset: 4 },
      { path: [0, 2], offset: 5 },
    ]
  );
});

it('positions uses element spec atom and editable-island policies', () => {
  const editor = createEditor();
  defineElement(editor, { atom: true, type: 'token' });
  defineElement(editor, { type: 'editable-embed', void: 'editable-island' });

  editorReplace(editor, {
    children: [
      {
        type: 'token',
        children: [{ text: 'one' }],
      },
      {
        type: 'editable-embed',
        children: [{ text: 'two' }],
      },
    ] as Descendant[],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Array.from(editorPositions(editor, { at: [0] })), [
    { path: [0, 0], offset: 0 },
  ]);
  assert.deepEqual(
    Array.from(editorPositions(editor, { at: [0], voids: true })),
    [
      { path: [0, 0], offset: 0 },
      { path: [0, 0], offset: 1 },
      { path: [0, 0], offset: 2 },
      { path: [0, 0], offset: 3 },
    ]
  );
  assert.deepEqual(Array.from(editorPositions(editor, { at: [1] })), [
    { path: [1, 0], offset: 0 },
    { path: [1, 0], offset: 1 },
    { path: [1, 0], offset: 2 },
    { path: [1, 0], offset: 3 },
  ]);
});

it('moves from a text block into a selectable block void before the following block', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'video', void: 'block' });

  editorReplace(editor, {
    children: createSelectableVoidBetweenBlocksChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, { path: [0, 0], offset: 3 }), {
    path: [1, 0],
    offset: 0,
  });
  assert.deepEqual(editorBefore(editor, { path: [2, 0], offset: 0 }), {
    path: [1, 0],
    offset: 0,
  });

  editor.update((tx) => {
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 3 },
      focus: { path: [0, 0], offset: 3 },
    });
    editorMove(editor);
  });
  assert.deepEqual(editorGetSelection(editor), {
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });

  editor.update((tx) => {
    editorMove(editor);
  });
  assert.deepEqual(editorGetSelection(editor), {
    anchor: { path: [2, 0], offset: 0 },
    focus: { path: [2, 0], offset: 0 },
  });
});

it('Editor exposes a narrowed static read/query layer for the current public surface', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'link', inline: true });

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'one ' },
          {
            type: 'link',
            children: [{ text: 'two' }],
          },
          { text: ' three' },
        ],
      } as Descendant,
      {
        type: 'quote',
        children: [
          {
            type: 'paragraph',
            children: [{ text: 'four' }],
          },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  const paragraph = getNodeEntry(editor, [0])[0] as Descendant & {
    children: Descendant[];
    type: string;
  };
  const quote = getNodeEntry(editor, [1])[0] as Descendant & {
    children: Descendant[];
    type: string;
  };
  const sameBlockRange = {
    anchor: { path: [0, 1, 0], offset: 1 },
    focus: { path: [0, 2], offset: 2 },
  };
  const spanningRange = {
    anchor: { path: [0, 1, 0], offset: 1 },
    focus: { path: [1, 0, 0], offset: 2 },
  };

  assert.deepEqual(editorPath(editor, sameBlockRange), [0]);
  assert.deepEqual(editorPath(editor, spanningRange), []);
  assert.deepEqual(
    editorPath(editor, spanningRange, { edge: 'end' }),
    [1, 0, 0]
  );
  assert.deepEqual(getStart(editor, [0]), { path: [0, 0], offset: 0 });
  assert.deepEqual(getEnd(editor, [0]), { path: [0, 2], offset: 6 });
  assert.deepEqual(editorEdges(editor, spanningRange), [
    { path: [0, 1, 0], offset: 1 },
    { path: [1, 0, 0], offset: 2 },
  ]);
  assert.deepEqual(editorPoint(editor, [1], { edge: 'start' }), {
    path: [1, 0, 0],
    offset: 0,
  });
  assert.deepEqual(editorFirst(editor, spanningRange), [
    { text: 'two' },
    [0, 1, 0],
  ]);
  assert.deepEqual(editorLast(editor, [1]), [{ text: 'four' }, [1, 0, 0]]);
  assert.deepEqual(editorRange(editor, [1]), {
    anchor: { path: [1, 0, 0], offset: 0 },
    focus: { path: [1, 0, 0], offset: 4 },
  });
  assert.deepEqual(getNodeEntry(editor, sameBlockRange), [paragraph, [0]]);
  assert.deepEqual(editorParent(editor, { path: [1, 0, 0], offset: 2 }), [
    quote.children[0],
    [1, 0],
  ]);
  assert.deepEqual(
    Array.from(
      getNodeEntries(editor, {
        at: [],
        match: (node) =>
          'type' in node &&
          (node as Descendant & { type?: string }).type === 'paragraph',
        mode: 'lowest',
      })
    ),
    [
      [paragraph, [0]],
      [quote.children[0], [1, 0]],
    ]
  );
  assert.deepEqual(
    Array.from(editorLevels(editor, { at: { path: [0, 1, 0], offset: 1 } })),
    [
      [getNodeEntry(editor, [])[0], []],
      [paragraph, [0]],
      [paragraph.children[1], [0, 1]],
      [{ text: 'two' }, [0, 1, 0]],
    ]
  );
  assert.deepEqual(editorNext(editor, { at: [0] }), [quote, [1]]);
  assert.deepEqual(editorPrevious(editor, { at: [1] }), [paragraph, [0]]);
  assert.equal(editorString(editor, [0]), 'one two three');
  assert.equal(editorString(editor, spanningRange), 'wo threefo');
  assert.deepEqual(editorFragment(editor, [1]), [
    {
      type: 'quote',
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'four' }],
        },
      ],
    },
  ]);
  assert.deepEqual(
    editorFragment(editor, {
      anchor: { path: [0, 1, 0], offset: 1 },
      focus: { path: [0, 1, 0], offset: 1 },
    }),
    []
  );
  assert.equal(editorHasPath(editor, [1, 0, 0]), true);
  assert.equal(editorHasPath(editor, [9]), false);
  assert.equal(editorHasInlines(editor, paragraph), true);
  assert.equal(editorHasTexts(editor, paragraph), false);
  assert.equal(editorHasBlocks(editor, quote), true);
  assert.equal(editorIsBlock(editor, paragraph), true);
  assert.equal(
    editorIsEmpty(editor, {
      type: 'paragraph',
      children: [{ text: '' }],
    }),
    true
  );
  assert.equal(editorIsStart(editor, { path: [0, 0], offset: 0 }, [0]), true);
  assert.equal(editorIsEnd(editor, { path: [0, 2], offset: 6 }, [0]), true);
  assert.equal(editorIsEdge(editor, { path: [0, 2], offset: 6 }, [0]), true);
});

it('Editor static read/query helpers see the live draft tree inside an outer transaction', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  let observed:
    | {
        firstString: string;
        insertedPathExists: boolean;
        shiftedNodeString: string;
        lastPoint: { path: number[]; offset: number };
      }
    | undefined;

  editor.update((tx) => {
    editorInsertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'zero' }],
      },
      { at: [0] }
    );

    observed = {
      firstString: editorString(editor, [0]),
      insertedPathExists: editorHasPath(editor, [2]),
      shiftedNodeString: editorString(editor, [2]),
      lastPoint: getEnd(editor, [2]),
    };
  });

  assert.deepEqual(observed, {
    firstString: 'zero',
    insertedPathExists: true,
    shiftedNodeString: 'beta',
    lastPoint: { path: [2, 0], offset: 4 },
  });
});

it('supports editorAfter across supported top-level block boundaries', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, { path: [0, 0], offset: 5 }), {
    path: [1, 0],
    offset: 0,
  });
});

it('mirrors the legacy editorLevels/success.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'element',
        children: [{ text: '' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Array.from(editorLevels(editor, { at: [0, 0] })), [
    [getNodeEntry(editor, [])[0], []],
    [
      {
        type: 'element',
        children: [{ text: '' }],
      },
      [0],
    ],
    [{ text: '' }, [0, 0]],
  ]);
});

it('mirrors the legacy editorLevels/reverse.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'element',
        children: [{ text: '' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    Array.from(editorLevels(editor, { at: [0, 0], reverse: true })),
    [
      [{ text: '' }, [0, 0]],
      [
        {
          type: 'element',
          children: [{ text: '' }],
        },
        [0],
      ],
      [getNodeEntry(editor, [])[0], []],
    ]
  );
});

it('mirrors the legacy editorLevels/match.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'element',
        a: true,
        children: [{ text: '', a: true }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    Array.from(
      editorLevels(editor, {
        at: [0, 0],
        match: (node) => Boolean((node as { a?: boolean }).a),
      })
    ),
    [
      [
        {
          type: 'element',
          a: true,
          children: [{ text: '', a: true }],
        },
        [0],
      ],
      [{ text: '', a: true }, [0, 0]],
    ]
  );
});

it('mirrors the legacy editorLevels/voids-false.tsx oracle row', () => {
  const editor = createEditor();
  defineVoidFlag(editor);

  editorReplace(editor, {
    children: [
      {
        type: 'element',
        void: true,
        children: [{ text: '' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(Array.from(editorLevels(editor, { at: [0, 0] })), [
    [getNodeEntry(editor, [])[0], []],
    [
      {
        type: 'element',
        void: true,
        children: [{ text: '' }],
      },
      [0],
    ],
  ]);
});

it('mirrors the legacy editorLevels/voids-true.tsx oracle row', () => {
  const editor = createEditor();
  defineVoidFlag(editor);

  editorReplace(editor, {
    children: [
      {
        type: 'element',
        void: true,
        children: [{ text: '' }],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    Array.from(editorLevels(editor, { at: [0, 0], voids: true })),
    [
      [getNodeEntry(editor, [])[0], []],
      [
        {
          type: 'element',
          void: true,
          children: [{ text: '' }],
        },
        [0],
      ],
      [{ text: '' }, [0, 0]],
    ]
  );
});

it('mirrors the legacy editorNext/default.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorNext(editor, { at: [0] }), [
    {
      type: 'paragraph',
      children: [{ text: 'two' }],
    },
    [1],
  ]);
});

it('returns undefined when editorNext is called from the root path', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorNext(editor, { at: [] }), undefined);
  assert.equal(
    editor.read((state) => state.nodes.next({ at: [] })),
    undefined
  );
});

it('mirrors the legacy editorNext/block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorNext(editor, {
      at: [0],
      match: (node) => 'type' in node && editorIsBlock(editor, node),
    }),
    [
      {
        type: 'paragraph',
        children: [{ text: 'two' }],
      },
      [1],
    ]
  );
});

it('mirrors the legacy editorNext/text.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorNext(editor, {
      at: [0],
      match: (node) => 'text' in node,
    }),
    [{ text: 'two' }, [1, 0]]
  );
});

it('mirrors the legacy editorPrevious/default.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorPrevious(editor, { at: [1] }), [
    {
      type: 'paragraph',
      children: [{ text: 'one' }],
    },
    [0],
  ]);
});

it('returns undefined when getting the previous node from the root path', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorPrevious(editor, { at: [] }), undefined);
  assert.equal(
    editor.read((state) => state.nodes.previous({ at: [] })),
    undefined
  );
});

it('mirrors the legacy editorPrevious/block.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorPrevious(editor, {
      at: [1],
      match: (node) => 'type' in node && editorIsBlock(editor, node),
    }),
    [
      {
        type: 'paragraph',
        children: [{ text: 'one' }],
      },
      [0],
    ]
  );
});

it('mirrors the legacy editorPrevious/text.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorPrevious(editor, {
      at: [1],
      match: (node) => 'text' in node,
    }),
    [{ text: 'one' }, [0, 0]]
  );
});

it('supports editorBefore across supported top-level block boundaries', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorBefore(editor, { path: [1, 0], offset: 0 }), {
    path: [0, 0],
    offset: 5,
  });
});

it('supports editorAfter across top-level block boundaries inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  let point: { path: readonly number[]; offset: number } | undefined;

  editor.update((tx) => {
    editorInsertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [1] }
    );
    point = editorAfter(editor, { path: [0, 0], offset: 5 });
  });

  assert.deepEqual(point, {
    path: [1, 0],
    offset: 0,
  });
});

it('supports move helper calls across supported top-level block boundaries', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    editorSelect(editor, {
      anchor: { path: [0, 0], offset: 5 },
      focus: { path: [0, 0], offset: 5 },
    });
    editorMove(editor, { distance: 1 });
  });

  const after = editorGetSnapshot(editor);

  assert.deepEqual(after.selection, {
    anchor: { path: [1, 0], offset: 0 },
    focus: { path: [1, 0], offset: 0 },
  });
});

it('supports editorAfter and editorBefore with top-level block paths', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, [0]), {
    path: [1, 0],
    offset: 0,
  });
  assert.deepEqual(editorBefore(editor, [1]), {
    path: [0, 0],
    offset: 5,
  });
});

it('mirrors the legacy editorBefore/path.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorBefore(editor, [1, 0]), {
    path: [0, 0],
    offset: 3,
  });
});

it('mirrors the legacy editorAfter/path.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, [0, 0]), {
    path: [1, 0],
    offset: 0,
  });
});

it('mirrors the legacy editorBefore/point.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren().slice(0, 1),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorBefore(editor, { path: [0, 0], offset: 1 }), {
    path: [0, 0],
    offset: 0,
  });
});

it('mirrors the legacy editorAfter/point.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren().slice(0, 1),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, { path: [0, 0], offset: 1 }), {
    path: [0, 0],
    offset: 2,
  });
});

it('supports editorAfter and editorBefore with supported mixed-inline descendant paths', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, [0, 1]), {
    path: [0, 2],
    offset: 0,
  });
  assert.deepEqual(editorBefore(editor, [0, 1]), {
    path: [0, 0],
    offset: 6,
  });
});

it('supports editorAfter with a top-level block path inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  let point: { path: readonly number[]; offset: number } | undefined;

  editor.update((tx) => {
    editorInsertNodes(
      editor,
      {
        type: 'paragraph',
        children: [{ text: 'gamma' }],
      },
      { at: [1] }
    );
    point = editorAfter(editor, [0]);
  });

  assert.deepEqual(point, {
    path: [1, 0],
    offset: 0,
  });
});

it('supports editorAfter on a point within the current text node', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, { path: [0, 0], offset: 1 }), {
    path: [0, 0],
    offset: 2,
  });
});

it('supports editorBefore and editorAfter on a range by using the start/end edges', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorBefore(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    }),
    { path: [0, 0], offset: 0 }
  );
  assert.deepEqual(
    editorAfter(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    }),
    { path: [1, 0], offset: 3 }
  );
});

it('mirrors the legacy editorBefore/range.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorBefore(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    }),
    { path: [0, 0], offset: 0 }
  );
});

it('mirrors the legacy editorAfter/range.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAfter(editor, {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    }),
    { path: [1, 0], offset: 3 }
  );
});

it('returns undefined when editorBefore or editorAfter hits the document boundary', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorBefore(editor, { path: [0, 0], offset: 0 }), undefined);
  assert.equal(editorAfter(editor, { path: [1, 0], offset: 4 }), undefined);
});

it('mirrors the legacy editorBefore/start.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorBefore(editor, [0, 0]), undefined);
});

it('mirrors the legacy editorAfter/end.tsx oracle row', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createLegacyBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorAfter(editor, [1, 0]), undefined);
});

it('supports editorAfter inside an outer transaction using the live draft tree', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createChildren(),
    selection: null,
    marks: null,
  });

  let point: { path: readonly number[]; offset: number } | undefined;

  editor.update((tx) => {
    editorInsertText(editor, '!', {
      at: { path: [0, 0], offset: 5 },
    });
    point = editorAfter(editor, { path: [0, 0], offset: 5 });
  });

  assert.deepEqual(point, { path: [0, 0], offset: 6 });
});

it('supports editorAfter across mixed-inline sibling text leaves in one block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, { path: [0, 0], offset: 6 }), {
    path: [0, 1, 0],
    offset: 0,
  });
});

it('supports editorBefore across mixed-inline sibling text leaves in one block', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: createElementSplitChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorBefore(editor, { path: [0, 2], offset: 0 }), {
    path: [0, 1, 0],
    offset: 9,
  });
});

it('supports editorAfter across mixed-inline siblings inside an outer transaction using the live draft tree', () => {});

it('supports editorBefore and editorAfter with voids: true on path and point locations', () => {
  const editor = createEditor();
  defineVoidFlag(editor);

  editorReplace(editor, {
    children: createVoidBlockPairChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorBefore(editor, [1, 0], { voids: true }), {
    path: [0, 0],
    offset: 3,
  });
  assert.deepEqual(
    editorBefore(editor, { path: [0, 0], offset: 1 }, { voids: true }),
    {
      path: [0, 0],
      offset: 0,
    }
  );
  assert.deepEqual(
    editorAfter(editor, { path: [0, 0], offset: 1 }, { voids: true }),
    {
      path: [0, 0],
      offset: 2,
    }
  );
});

it('supports editorBefore and editorAfter with voids: true on range and split-void paths', () => {
  const editor = createEditor();
  defineVoidFlag(editor);

  editorReplace(editor, {
    children: createVoidSplitChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, [0, 0], { voids: true }), {
    path: [0, 1],
    offset: 0,
  });
  assert.deepEqual(
    editorBefore(
      editor,
      {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 1], offset: 2 },
      },
      { voids: true }
    ),
    { path: [0, 0], offset: 0 }
  );
  assert.deepEqual(
    editorAfter(
      editor,
      {
        anchor: { path: [0, 0], offset: 1 },
        focus: { path: [0, 1], offset: 2 },
      },
      { voids: true }
    ),
    { path: [0, 1], offset: 3 }
  );
});

it('supports editorBefore and editorAfter by skipping non-selectable blocks', () => {
  const editor = createEditor();
  defineNonSelectableFlag(editor);

  editorReplace(editor, {
    children: createNonSelectableBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorBefore(editor, { path: [2, 0], offset: 0 }), {
    path: [0, 0],
    offset: 3,
  });
  assert.deepEqual(editorAfter(editor, { path: [0, 0], offset: 3 }), {
    path: [2, 0],
    offset: 0,
  });

  editorReplace(editor, {
    children: createLeadingNonSelectableBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorBefore(editor, { path: [1, 0], offset: 0 }), undefined);

  editorReplace(editor, {
    children: createTrailingNonSelectableBlockChildren(),
    selection: null,
    marks: null,
  });

  assert.equal(editorAfter(editor, { path: [0, 0], offset: 3 }), undefined);
});

it('supports editorBefore and editorAfter by skipping non-selectable inline descendants', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });
  defineNonSelectableFlag(editor);

  editorReplace(editor, {
    children: createNonSelectableInlineChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorBefore(editor, { path: [0, 2], offset: 0 }), {
    path: [0, 0],
    offset: 3,
  });
  assert.deepEqual(editorAfter(editor, { path: [0, 0], offset: 3 }), {
    path: [0, 2],
    offset: 0,
  });

  editorReplace(editor, {
    children: createLeadingNonSelectableInlineChildren(),
    selection: null,
    marks: null,
  });

  let point: { path: readonly number[]; offset: number } | undefined;

  editor.update((tx) => {
    editorReplace(editor, {
      children: createLeadingNonSelectableInlineChildren(),
      selection: null,
      marks: null,
    });
    point = editorBefore(editor, { path: [0, 1], offset: 0 });
  });

  assert.equal(point, undefined);

  editorReplace(editor, {
    children: createTrailingNonSelectableInlineChildren(),
    selection: null,
    marks: null,
  });

  editor.update((tx) => {
    editorReplace(editor, {
      children: createTrailingNonSelectableInlineChildren(),
      selection: null,
      marks: null,
    });
    point = editorAfter(editor, { path: [0, 0], offset: 3 });
  });

  assert.equal(point, undefined);
});

it('supports editorAfter by skipping non-selectable inline void descendants', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });
  defineVoidFlag(editor);
  defineNonSelectableFlag(editor);

  editorReplace(editor, {
    children: createNonSelectableInlineVoidChildren(),
    selection: null,
    marks: null,
  });

  assert.deepEqual(editorAfter(editor, { path: [0, 0], offset: 3 }), {
    path: [0, 2],
    offset: 0,
  });
});

it('supports character movement around inline voids as atomic boundaries', () => {
  const editor = createEditor();
  defineElement(editor, { type: 'inline', inline: true });
  defineVoidFlag(editor);

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [
          { text: 'one' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: 'two' },
          {
            type: 'inline',
            void: true,
            children: [{ text: '' }],
          },
          { text: '!' },
        ],
      } as Descendant,
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAfter(editor, { path: [0, 0], offset: 3 }, { unit: 'character' }),
    { path: [0, 1, 0], offset: 0 }
  );
  assert.deepEqual(
    editorAfter(editor, { path: [0, 1, 0], offset: 0 }, { unit: 'character' }),
    { path: [0, 2], offset: 0 }
  );
  assert.deepEqual(
    editorBefore(editor, { path: [0, 2], offset: 0 }, { unit: 'character' }),
    { path: [0, 1, 0], offset: 0 }
  );
  assert.deepEqual(
    editorBefore(editor, { path: [0, 1, 0], offset: 0 }, { unit: 'character' }),
    { path: [0, 0], offset: 3 }
  );
  assert.deepEqual(
    editorAfter(editor, { path: [0, 2], offset: 3 }, { unit: 'character' }),
    { path: [0, 3, 0], offset: 0 }
  );
  assert.deepEqual(
    editorAfter(editor, { path: [0, 3, 0], offset: 0 }, { unit: 'character' }),
    { path: [0, 4], offset: 0 }
  );
  assert.deepEqual(
    editorBefore(editor, { path: [0, 4], offset: 0 }, { unit: 'character' }),
    { path: [0, 3, 0], offset: 0 }
  );
  assert.deepEqual(
    editorBefore(editor, { path: [0, 3, 0], offset: 0 }, { unit: 'character' }),
    { path: [0, 2], offset: 3 }
  );
});

it('supports editorBefore and editorAfter unit-based traversal', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'paragraph',
        children: [{ text: 'one two' }],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAfter(editor, { path: [0, 0], offset: 0 }, { unit: 'word' }),
    { path: [0, 0], offset: 3 }
  );
  assert.deepEqual(
    editorBefore(editor, { path: [0, 0], offset: 7 }, { unit: 'word' }),
    { path: [0, 0], offset: 4 }
  );
  assert.deepEqual(
    editorAfter(editor, { path: [0, 0], offset: 0 }, { unit: 'character' }),
    { path: [0, 0], offset: 1 }
  );
});

it('supports editorAfter character traversal across nested text-block boundaries', () => {
  const editor = createEditor();

  editorReplace(editor, {
    children: [
      {
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [{ text: '' }],
              },
              {
                type: 'table-cell',
                children: [{ text: 'Human' }],
              },
            ],
          },
        ],
      },
    ],
    selection: null,
    marks: null,
  });

  assert.deepEqual(
    editorAfter(
      editor,
      { path: [0, 0, 0, 0], offset: 0 },
      { unit: 'character' }
    ),
    { path: [0, 0, 1, 0], offset: 0 }
  );
});
