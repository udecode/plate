import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineExtension,
  defineEditorSchema,
  DocumentChange,
  ElementApi,
  property,
  schema,
  type SchemaContent,
  type SchemaElement,
  target,
  TextApi,
} from '@platejs/plite';
import fc from 'fast-check';

const inlineContent = schema.content.any(
  [schema.content.text(), schema.content.group('inline')],
  { default: 'text', min: 1 }
);

const defineContractSchema = (
  id: string,
  elements: Readonly<Record<string, SchemaElement>>
) => {
  const declarations = Object.fromEntries(
    Object.entries(elements).map(([type, input]) => [
      type,
      input.content !== undefined ||
      input.void === 'block' ||
      input.void === 'inline' ||
      input.void === 'markable-inline'
        ? input
        : {
            content: input.inline ? inlineContent : schema.content.open(),
            ...input,
          },
    ])
  );

  return defineEditorSchema('schema:derived', {
    elements: {
      'test-root': { content: schema.content.open() },
      ...declarations,
    },
    id,
    root: schema.content.type('test-root'),
    unknown: 'reject',
    version: 1,
  });
};

describe('editor schema', () => {
  it('rejects non-JSON document properties at create and update boundaries', () => {
    const sparse = Array.from({ length: 1 }) as unknown[];
    const circular: Record<string, unknown> = {};
    const accessor = {} as Record<string, unknown>;
    const symbolKey = { value: true } as Record<PropertyKey, unknown>;
    const customObject = new (class {
      value = true;
    })();

    delete sparse[0];
    circular.self = circular;
    Object.defineProperty(accessor, 'value', {
      enumerable: true,
      get: () => 'value',
    });
    symbolKey[Symbol('hidden')] = true;

    const values = [
      undefined,
      -0,
      Number.NaN,
      Number.POSITIVE_INFINITY,
      new Date(0),
      new Map([['key', 'value']]),
      () => 'value',
      Symbol('value'),
      circular,
      sparse,
      accessor,
      symbolKey,
      customObject,
    ];

    for (const value of values) {
      assert.throws(() =>
        createEditor({
          initialValue: [
            {
              children: [{ text: 'body' }],
              payload: value,
              type: 'paragraph',
            },
          ],
        })
      );
    }

    const editor = createEditor({
      initialValue: [{ children: [{ text: 'body' }], type: 'paragraph' }],
    });

    for (const value of values.filter((value) => value !== undefined)) {
      assert.throws(() =>
        editor.update((tx) => {
          tx.nodes.set({ payload: value }, { at: [0] });
        })
      );
      assert.deepEqual(editor.read.value().children, [
        { children: [{ text: 'body' }], type: 'paragraph' },
      ]);
    }

    for (const value of values) {
      assert.throws(
        () =>
          createEditor({
            initialValue: {
              children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
              meta: { payload: value },
            },
          }),
        /JSON-compatible data/
      );
      assert.throws(
        () =>
          editor.read.schema.assertDocument({
            children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
            meta: { payload: value },
          }),
        /JSON-compatible data/
      );
      assert.throws(
        () =>
          editor.read.schema.assertFragment([
            {
              children: [{ text: 'body' }],
              payload: value,
              type: 'paragraph',
            },
          ]),
        /JSON-compatible data/
      );
    }
  });

  it('accepts canonical JSON property trees across schema boundaries', () => {
    const jsonValue = fc
      .jsonValue({ maxDepth: 4 })
      .map((value) => JSON.parse(JSON.stringify(value)) as unknown);

    fc.assert(
      fc.property(jsonValue, (payload) => {
        const children = [
          {
            children: [{ text: 'body' }],
            payload,
            type: 'paragraph',
          },
        ];
        const editor = createEditor({ initialValue: children });

        assert.deepEqual(editor.read.children(), children);
        assert.doesNotThrow(() => editor.read.schema.assertFragment(children));
        editor.update((tx) => {
          tx.nodes.set({ payload }, { at: [0] });
        });
        assert.deepEqual(editor.read.children()[0]?.payload, payload);
      }),
      { numRuns: 100, seed: 0x5_c4_8e_4a }
    );

    const shared = { nested: [null, true, false, 0, 1.5, 'value'] };
    const nullPrototype = Object.assign(Object.create(null), {
      left: shared,
      right: shared,
    });
    const editor = createEditor({
      initialValue: [
        {
          children: [{ text: 'body' }],
          payload: nullPrototype,
          type: 'paragraph',
        },
      ],
    });

    assert.deepEqual(editor.read.children()[0]?.payload, {
      left: shared,
      right: shared,
    });
  });

  it('rejects non-JSON schema defaults and construction input', () => {
    const invalidProperty = { payload: new Date(0) };
    const fromProperties = defineEditorSchema(
      'schema:invalid-create-properties',
      {
        elements: {
          paragraph: {
            content: schema.content.text(),
            properties: { payload: property.json() },
          } as const,
        },
        id: 'invalid-create-properties',
        root: schema.content.type('paragraph'),
        unknown: 'reject',
        version: 1,
      }
    );

    assert.throws(
      () =>
        createEditor({
          extensions: [fromProperties],
        }).read.schema.create('paragraph', invalidProperty),
      /JSON-compatible data/
    );
    assert.throws(
      () => property.json({ default: new Date(0) as never }),
      /plain JSON objects|JSON-compatible data/
    );
  });

  it('keeps schema-less editors permissive and closes schema-bound documents', () => {
    assert.doesNotThrow(() =>
      createEditor({
        initialValue: [
          { type: 'unknown', children: [{ arbitrary: true, text: 'open' }] },
        ],
      })
    );

    const closedSchema = defineEditorSchema('schema:closed-document', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      id: 'closed-document',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });

    assert.throws(
      () =>
        createEditor({
          extensions: [closedSchema],
          initialValue: [{ type: 'unknown', children: [{ text: 'closed' }] }],
        }),
      /unknown editor element type "unknown"/i
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [closedSchema],
          initialValue: {
            children: [{ type: 'paragraph', children: [{ text: 'main' }] }],
            roots: {
              undeclared: [
                { type: 'paragraph', children: [{ text: 'extra' }] },
              ],
            },
          },
        }),
      /undeclared editor root "undeclared"/i
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [closedSchema],
          initialValue: [
            {
              children: [{ text: 'closed' }],
              mystery: true,
              type: 'paragraph',
            },
          ],
        }),
      /unknown element property "mystery"/i
    );

    const editor = createEditor({
      extensions: [closedSchema],
      initialValue: [{ children: [{ text: 'before' }], type: 'paragraph' }],
    });
    const before = editor.read.value();
    const decoded = DocumentChange.fromJSON(
      DocumentChange.between(before, {
        ...before,
        children: [
          {
            children: [{ text: 'after' }],
            mystery: true,
            type: 'paragraph',
          },
        ],
      }).toJSON()
    );

    assert.throws(
      () => editor.update((tx) => tx.changes.apply(decoded)),
      /unknown element property "mystery"/i
    );
    assert.equal(editor.read.text.string([]), 'before');
  });

  it('counts exact and prefix property declarations in a closed vocabulary', () => {
    const extension = defineEditorSchema(
      'schema:closed-exact-prefix-properties',
      {
        elements: {
          cell: {
            content: schema.content.text({ default: 'text', min: 1 }),
            properties: {
              colSpan: property.number(),
              variant: property.string(),
            },
          } as const,
        },
        id: 'closed-exact-prefix-properties',
        properties: [
          schema.elementProperty(
            schema.key.prefix('suggestion_'),
            property.json(),
            { target: target.type('cell') }
          ),
        ],
        root: schema.content.group('block', {
          default: { type: 'cell' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      }
    );

    assert.doesNotThrow(() =>
      createEditor({
        extensions: [extension],
        initialValue: [
          {
            children: [{ text: '' }],
            colSpan: 2,
            suggestion_insert: { id: 'insert' },
            type: 'cell',
            variant: 'wide',
          },
        ],
      })
    );
  });

  it('compiles structural root grammar and validates each named root', () => {
    const extension = defineEditorSchema('schema:root-grammar', {
      elements: {
        heading: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      id: 'root-grammar',
      root: schema.content.all(
        [
          schema.content.group('block'),
          schema.content.not(schema.content.type('heading')),
        ],
        { default: { type: 'paragraph' }, min: 1 }
      ),
      roots: {
        header: schema.content.type('heading', {
          default: { type: 'heading' },
          min: 1,
        }),
      },
      unknown: 'reject',
      version: 1,
    });

    assert.doesNotThrow(() =>
      createEditor({
        extensions: [extension],
        initialValue: {
          children: [{ type: 'paragraph', children: [{ text: 'body' }] }],
          roots: {
            header: [{ type: 'heading', children: [{ text: 'title' }] }],
          },
        },
      })
    );
    const conflictingExtension = defineEditorSchema(
      'schema:conflicting-owned-content-root',
      {
        elements: {
          paragraph: {
            content: schema.content.text({ default: 'text', min: 1 }),
          } as const,
          'paragraph-portal': {
            content: schema.content.text({ default: 'text', min: 1 }),
            contentRoots: {
              body: schema.content.type('paragraph'),
            },
          } as const,
          'portal-portal': {
            content: schema.content.text({ default: 'text', min: 1 }),
            contentRoots: {
              body: schema.content.type('paragraph-portal'),
            },
          } as const,
        },
        id: 'conflicting-owned-content-root',
        root: schema.content.group('block'),
        unknown: 'reject',
        version: 1,
      }
    );

    assert.throws(
      () =>
        createEditor({
          extensions: [conflictingExtension],
          initialValue: {
            children: [
              {
                childRoots: { body: 'shared:1' },
                type: 'paragraph-portal',
                children: [{ text: '' }],
              },
              {
                childRoots: { body: 'shared:1' },
                type: 'portal-portal',
                children: [{ text: '' }],
              },
            ],
            roots: {
              'shared:1': [
                { type: 'paragraph', children: [{ text: 'shared' }] },
              ],
            },
          },
        }),
      /root "shared:1" has conflicting projected content grammars/i
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [extension],
          initialValue: {
            children: [{ type: 'heading', children: [{ text: 'wrong' }] }],
            roots: {
              header: [{ type: 'heading', children: [{ text: 'title' }] }],
            },
          },
        }),
      /primary root.*cannot contain "heading"/
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [extension],
          initialValue: {
            children: [{ type: 'paragraph', children: [{ text: 'body' }] }],
            roots: {
              header: [{ type: 'paragraph', children: [{ text: 'wrong' }] }],
            },
          },
        }),
      /root "header".*cannot contain "paragraph"/
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [extension],
          initialValue: [{ type: 'paragraph', children: [{ text: 'body' }] }],
        }),
      /root "header" is missing/u
    );
    const filled = createEditor({ extensions: [extension] });

    assert.deepEqual(filled.read.children(), [
      { type: 'paragraph', children: [{ text: '' }] },
    ]);
    assert.deepEqual(filled.read.root('header'), [
      { type: 'heading', children: [{ text: '' }] },
    ]);
  });

  it('rejects every root grammar that can admit text nodes', () => {
    const createWithRoot = (content: SchemaContent) =>
      createEditor({
        extensions: [
          defineEditorSchema('schema:element-only-root', {
            elements: {
              paragraph: {
                content: schema.content.text({ default: 'text', min: 1 }),
              } as const,
            },
            id: 'element-only-root',
            root: content,
            unknown: 'reject',
            version: 1,
          }),
        ],
        initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
      });

    assert.throws(
      () => createWithRoot(schema.content.text()),
      /primary root grammar cannot allow text nodes/i
    );
    assert.throws(
      () =>
        createWithRoot(
          schema.content.any([
            schema.content.text(),
            schema.content.type('paragraph'),
          ])
        ),
      /primary root grammar cannot allow text nodes/i
    );
    assert.throws(
      () =>
        createWithRoot(
          schema.content.type('paragraph', {
            default: 'text',
            min: 1,
          })
        ),
      /defaults to text, but text is not allowed/i
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [
            defineEditorSchema('schema:element-only-content-root', {
              elements: {
                portal: {
                  content: schema.content.text({ default: 'text', min: 1 }),
                  contentRoots: {
                    body: schema.content.text(),
                  },
                } as const,
              },
              id: 'element-only-content-root',
              root: schema.content.type('portal'),
              unknown: 'reject',
              version: 1,
            }),
          ],
          initialValue: [{ children: [{ text: '' }], type: 'portal' }],
        }),
      /projected root grammar.*cannot allow text nodes/i
    );
  });

  it('applies each declared root default during sparse writes', () => {
    const extension = defineEditorSchema('schema:per-root-construction', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        'root-inline': {
          content: schema.content.text({ default: 'text', min: 1 }),
          inline: true,
        } as const,
      },
      id: 'per-root-construction',
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      roots: {
        header: schema.content.type('root-inline', {
          default: { type: 'root-inline' },
          min: 2,
        }),
      },
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({
      extensions: [extension],
      initialValue: {
        children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
        roots: {
          header: [
            { children: [{ text: 'a' }], type: 'root-inline' },
            { children: [{ text: 'b' }], type: 'root-inline' },
          ],
        },
      },
    });

    editor.update((tx) => tx.nodes.remove({ at: [0] }));
    editor.update((tx) => tx.roots.replace('header', []));

    assert.deepEqual(editor.read.children(), [
      { children: [{ text: '' }], type: 'paragraph' },
    ]);
    assert.deepEqual(editor.read.root('header'), [
      { children: [{ text: '' }], type: 'root-inline' },
      { children: [{ text: '' }], type: 'root-inline' },
    ]);
  });

  it('validates element-owned content roots with their declared grammar', () => {
    const extension = defineEditorSchema('schema:owned-content-root', {
      elements: {
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        portal: {
          content: schema.content.text({ default: 'text', min: 1 }),
          contentRoots: {
            body: schema.content.group('block', {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        } as const,
      },
      id: 'owned-content-root',
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });

    assert.doesNotThrow(() =>
      createEditor({
        extensions: [extension],
        initialValue: {
          children: [
            {
              childRoots: { body: 'portal:1' },
              type: 'portal',
              children: [{ text: '' }],
            },
          ],
          roots: {
            'portal:1': [
              { type: 'paragraph', children: [{ text: 'projected' }] },
            ],
          },
        },
      })
    );
    assert.doesNotThrow(() =>
      createEditor({
        extensions: [extension],
        initialValue: {
          children: [
            {
              childRoots: { body: 'shared:1' },
              type: 'portal',
              children: [{ text: 'first projection' }],
            },
            {
              childRoots: { body: 'shared:1' },
              type: 'portal',
              children: [{ text: 'second projection' }],
            },
          ],
          roots: {
            'shared:1': [{ type: 'paragraph', children: [{ text: 'shared' }] }],
          },
        },
      })
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [extension],
          initialValue: [
            { type: 'portal', children: [{ text: 'missing root' }] },
          ],
        }),
      /portal.*missing.*content roots/i
    );
  });

  it('validates and resolves structural text-property specs', () => {
    const extension = defineEditorSchema('schema:text-properties', {
      elements: {
        code: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      id: 'text-properties',
      properties: [
        schema.textProperty('bold', property.boolean(), {
          target: target.type('paragraph'),
        }),
        schema.textProperty('commentIds', property.set(property.string())),
      ],
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });

    const editor = createEditor({
      extensions: [extension],
      initialValue: [
        {
          type: 'paragraph',
          children: [{ bold: true, commentIds: ['a'], text: 'valid' }],
        },
      ],
    });

    assert.deepEqual(editor.read.schema.getVocabulary(), {
      elementTypes: ['code', 'paragraph'],
      groupNames: ['all', 'block', 'element', 'inline', 'text', 'textBlock'],
      propertyIds: [
        'text:bold@5eb442dc342d2ba3',
        'text:commentIds@7be7598c1cfeca58',
      ],
      rootNames: [],
    });
    assert.throws(
      () =>
        createEditor({
          extensions: [extension],
          initialValue: [
            {
              type: 'paragraph',
              children: [{ bold: 'yes', text: 'invalid' }],
            },
          ],
        }),
      /text property "bold".*boolean/
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [extension],
          initialValue: [
            {
              type: 'paragraph',
              children: [{ mystery: true, text: 'invalid' }],
            },
          ],
        }),
      /unknown text property "mystery"/i
    );
    assert.throws(
      () =>
        createEditor({
          extensions: [extension],
          initialValue: [
            {
              type: 'code',
              children: [{ bold: true, text: 'invalid target' }],
            },
          ],
        }),
      /text property "bold".*cannot target.*code/
    );

    const createPendingMarksEditor = (type: 'code' | 'paragraph') =>
      createEditor({
        extensions: [extension],
        initialSelection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
          kind: 'text',
        },
        initialValue: [{ children: [{ text: '' }], type }],
      });
    const paragraphEditor = createPendingMarksEditor('paragraph');

    assert.throws(
      () =>
        paragraphEditor.update((tx) =>
          tx.marks.set({
            // @ts-expect-error runtime validation rejects unknown marks
            mystery: true,
          })
        ),
      /unknown text property "mystery"/i
    );
    assert.throws(
      () =>
        paragraphEditor.update((tx) =>
          tx.marks.set({
            // @ts-expect-error runtime validation rejects invalid mark values
            bold: 'yes',
          })
        ),
      /text property "bold".*boolean/i
    );
    assert.throws(
      () =>
        paragraphEditor.update((tx) =>
          tx.marks.set({
            // @ts-expect-error runtime validation rejects invalid mark values
            commentIds: 'not-an-array',
          })
        ),
      /text property "commentIds".*array/i
    );

    const codeEditor = createPendingMarksEditor('code');

    assert.throws(
      () => codeEditor.update((tx) => tx.marks.set({ bold: true })),
      /text property "bold".*cannot target.*code/i
    );
  });

  it('applies text-property merge, split, type-change, and cursor semantics', () => {
    const extension = defineEditorSchema('schema:text-property-behavior', {
      elements: {
        code: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
        paragraph: {
          content: schema.content.text({ default: 'text', min: 1 }),
        } as const,
      },
      id: 'text-property-behavior',
      properties: [
        schema.textProperty('commentIds', property.set(property.string()), {
          typeChange: 'preserve-if-allowed',
        }),
        schema.textProperty('sticky', property.boolean(), {
          target: target.type('paragraph'),
          typeChange: 'preserve-if-allowed',
        }),
        schema.textProperty('transient', property.boolean(), {
          split: 'drop',
        }),
      ],
      root: schema.content.group('block', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({
      extensions: [extension],
      initialSelection: {
        kind: 'text',
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 4 },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [
            {
              commentIds: ['a'],
              sticky: true,
              text: 'word',
              transient: true,
            },
          ],
        },
      ],
    });

    editor.update((tx) => tx.marks.add('commentIds', ['a', 'b']));
    const firstBlock = editor.read.children()[0];

    assert.ok(ElementApi.isElement(firstBlock));

    const firstText = firstBlock.children[0];

    assert.ok(TextApi.isText(firstText));
    assert.deepEqual(firstText.commentIds, ['a', 'b']);
    const propertyOperations = editor.read
      .lastCommit()
      ?.changes.toJSON()
      .primary?.flatMap((section) => section.properties?.operations ?? []);

    assert.deepEqual(
      propertyOperations?.filter(({ key }) => key === 'commentIds'),
      [{ key: 'commentIds', type: 'add', values: ['b'] }]
    );

    const concurrentValue = [
      {
        type: 'paragraph',
        children: [{ commentIds: ['a'], text: 'word' }],
      },
    ];
    const createConcurrentEditor = () =>
      createEditor({
        extensions: [extension],
        initialSelection: {
          kind: 'text',
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 4 },
        },
        initialValue: structuredClone(concurrentValue),
      });
    const left = createConcurrentEditor();
    const right = createConcurrentEditor();
    const removal = createConcurrentEditor();

    left.update((tx) => tx.marks.add('commentIds', ['left']));
    right.update((tx) => tx.marks.add('commentIds', ['right']));
    removal.update((tx) => tx.marks.remove('commentIds'));

    assert.deepEqual(
      removal.read
        .lastCommit()
        ?.changes.toJSON()
        .primary?.flatMap((section) => section.properties?.operations ?? [])
        .filter(({ key }) => key === 'commentIds'),
      [{ key: 'commentIds', type: 'remove', values: ['a'] }]
    );

    const before = { children: concurrentValue };
    const leftChange = left.read.lastCommit()!.changes;
    const rightChange = right.read.lastCommit()!.changes;
    const removalChange = removal.read.lastCommit()!.changes;
    const leftInverse = leftChange.invert(before);
    const inverseOperations = leftInverse
      .toJSON()
      .primary?.flatMap((section) => section.properties?.operations ?? []);

    assert.deepEqual(
      inverseOperations?.filter(({ key }) => key === 'commentIds'),
      [{ key: 'commentIds', type: 'remove', values: ['left'] }]
    );
    assert.deepEqual(leftInverse.apply(leftChange.apply(before)), before);

    const transformed = DocumentChange.transform(
      leftChange,
      rightChange,
      before
    );
    const viaLeft = transformed.b.apply(leftChange.apply(before));
    const viaRight = transformed.a.apply(rightChange.apply(before));

    assert.deepEqual(viaLeft, viaRight);
    assert.deepEqual(viaLeft, {
      children: [
        {
          type: 'paragraph',
          children: [{ commentIds: ['a', 'left', 'right'], text: 'word' }],
        },
      ],
    });

    const removalAndAddition = DocumentChange.transform(
      removalChange,
      rightChange,
      before
    );
    const viaRemoval = removalAndAddition.b.apply(removalChange.apply(before));
    const viaAddition = removalAndAddition.a.apply(rightChange.apply(before));

    assert.deepEqual(viaRemoval, viaAddition);
    assert.deepEqual(viaRemoval, {
      children: [
        {
          type: 'paragraph',
          children: [{ commentIds: ['right'], text: 'word' }],
        },
      ],
    });

    editor.update((tx) => {
      tx.nodes.split({ at: { path: [0, 0], offset: 2 } });
    });
    const rightBlock = editor.read.children()[1];

    assert.ok(ElementApi.isElement(rightBlock));

    const rightText = rightBlock.children[0];

    assert.ok(TextApi.isText(rightText));

    assert.equal(rightText.transient, undefined);
    assert.deepEqual(rightText.commentIds, ['a', 'b']);
    assert.equal('sticky' in rightText ? rightText.sticky : undefined, true);

    editor.update((tx) => {
      tx.nodes.set({ type: 'code' }, { at: [1] });
    });
    const changedBlock = editor.read.children()[1];

    assert.ok(ElementApi.isElement(changedBlock));

    const changedText = changedBlock.children[0];

    assert.ok(TextApi.isText(changedText));

    assert.equal(
      'sticky' in changedText ? changedText.sticky : undefined,
      undefined
    );
    assert.deepEqual(changedText.commentIds, ['a', 'b']);

    const edgeEditor = createEditor({
      extensions: [
        defineEditorSchema('schema:non-inclusive-property', {
          elements: {
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
          },
          id: 'non-inclusive-property',
          properties: [
            schema.textProperty('edge', property.boolean(), {
              inclusive: false,
            }),
          ],
          root: schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'reject',
          version: 1,
        }),
      ],
      initialSelection: {
        kind: 'text',
        anchor: { path: [0, 1], offset: 0 },
        focus: { path: [0, 1], offset: 0 },
      },
      initialValue: [
        {
          type: 'paragraph',
          children: [{ edge: true, text: 'left' }, { text: 'right' }],
        },
      ],
    });

    assert.deepEqual(edgeEditor.read.marks(), {});

    edgeEditor.update.selection.set({
      anchor: { path: [0, 0], offset: 4 },
      focus: { path: [0, 0], offset: 4 },
      kind: 'text',
    });

    assert.deepEqual(edgeEditor.read.marks(), {});
  });

  it('compiles content, defaults, wrapping, and validation from element specs', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:compiled-schema', {
          elements: {
            caption: {
              content: schema.content.text(),
              groups: ['inline-container'],
            } as const,
            figure: {
              content: schema.content.type('caption'),
              groups: ['section-child'],
            } as const,
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
              groups: ['section-child'],
            } as const,
            section: {
              content: schema.content.group('section-child', {
                default: { type: 'paragraph' },
                min: 1,
              }),
            } as const,
          },
          groups: {
            'inline-container': {},
            'section-child': {},
          },
          id: 'compiled-schema',
          root: schema.content.type('section'),
          unknown: 'reject',
          version: 1,
        }),
      ],
    });

    assert.deepEqual(editor.read.schema.create('section'), {
      type: 'section',
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    });
    assert.deepEqual(
      editor.read.schema.findWrapping(
        { type: 'section', children: [] },
        { text: 'caption' }
      ),
      ['paragraph']
    );
    assert.deepEqual(
      editor.read.schema.findWrapping(
        { type: 'section', children: [] },
        { type: 'caption', children: [{ text: '' }] }
      ),
      ['figure']
    );
    const value = {
      children: [
        {
          type: 'section',
          children: [{ type: 'paragraph', children: [{ text: 'target' }] }],
        },
      ],
    };
    editor.update.value.replace(value);
    const fitted = editor.read.slice.fit(
      {
        content: [
          {
            type: 'figure',
            children: [{ type: 'caption', children: [{ text: 'fitted' }] }],
          },
        ],
        openEnd: 0,
        openStart: 0,
      },
      {
        at: {
          anchor: { offset: 0, path: [0, 0, 0] },
          focus: { offset: 6, path: [0, 0, 0] },
        },
      }
    );

    assert.ok(fitted);
    assert.deepEqual(fitted.changes.apply(value), {
      children: [
        {
          type: 'section',
          children: [
            {
              type: 'figure',
              children: [{ type: 'caption', children: [{ text: 'fitted' }] }],
            },
          ],
        },
      ],
    });
    assert.doesNotThrow(() =>
      editor.read.schema.assertFragment([
        {
          type: 'section',
          children: [{ type: 'paragraph', children: [{ text: 'valid' }] }],
        },
      ])
    );
    assert.throws(
      () =>
        editor.read.schema.assertFragment([
          {
            type: 'section',
            children: [{ type: 'caption', children: [{ text: 'invalid' }] }],
          },
        ]),
      /section.*cannot contain.*caption/
    );
  });

  it('enforces explicit nested content grammar in derived schemas', () => {
    const valid = [
      {
        children: [
          {
            children: [{ children: [{ text: 'valid' }], type: 'derived-cell' }],
            type: 'derived-row',
          },
        ],
        type: 'derived-table',
      },
    ];
    const editor = createEditor({
      extensions: [
        defineExtension('derived-nested-content', {
          schema: {
            elements: {
              'derived-cell': {
                content: schema.content.text({ min: 1 }),
              },
              'derived-row': {
                content: schema.content.type('derived-cell', { min: 1 }),
              },
              'derived-table': {
                content: schema.content.type('derived-row', { min: 1 }),
              },
            },
          },
        }),
      ],
      initialValue: valid,
    });
    const invalid = [
      {
        children: [
          {
            children: [{ children: [{ text: 'invalid' }], type: 'paragraph' }],
            type: 'derived-row',
          },
        ],
        type: 'derived-table',
      },
    ];

    assert.throws(
      () => editor.read.schema.assertDocument({ children: invalid }),
      /derived-row.*cannot contain.*paragraph/
    );
    assert.throws(
      () => editor.read.schema.assertFragment(invalid),
      /derived-row.*cannot contain.*paragraph/
    );
    assert.throws(
      () =>
        editor.update((tx) => {
          tx.nodes.set({ type: 'paragraph' } as never, { at: [0, 0, 0] });
        }),
      /derived-row.*cannot contain.*paragraph/
    );
    assert.deepEqual(editor.read.children(), valid);
  });

  it('fits closed external content through primary and named root grammar', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:external-root-fit', {
          elements: {
            caption: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
            figure: {
              content: schema.content.type('caption', {
                default: { type: 'caption' },
                min: 1,
              }),
            } as const,
            heading: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
            section: {
              content: schema.content.type('figure', {
                default: { type: 'figure' },
                min: 1,
              }),
            } as const,
          },
          id: 'external-root-fit',
          root: schema.content.type('section', {
            default: { type: 'section' },
            min: 1,
          }),
          roots: {
            header: schema.content.type('heading'),
          },
          unknown: 'reject',
          version: 1,
        }),
      ],
    });
    editor.update.value.replace({
      children: [{ children: [{ text: 'caption' }], type: 'caption' }] as any,
      selection: null,
    });
    assert.deepEqual(editor.read.children(), [
      {
        children: [
          {
            children: [{ children: [{ text: 'caption' }], type: 'caption' }],
            type: 'figure',
          },
        ],
        type: 'section',
      },
    ]);
    assert.equal(editor.read.selection(), null);
    assert.doesNotThrow(() =>
      editor.update.value.replace({
        children: [...editor.read.children()],
        selection: null,
      })
    );

    editor.update((tx) => {
      tx.roots.create('header', [{ text: 'title' }] as any);
    });
    assert.deepEqual(editor.read.root('header'), [
      { children: [{ text: 'title' }], type: 'heading' },
    ]);

    editor.update.value.replace({ children: [] as any, selection: null });
    assert.deepEqual(editor.read.children(), [
      {
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'caption' }],
            type: 'figure',
          },
        ],
        type: 'section',
      },
    ]);

    const before = editor.read.value();
    const selectionBefore = editor.read.selection();
    let commits = 0;
    const unsubscribe = editor.subscribeCommit(() => {
      commits++;
    });

    assert.throws(
      () =>
        editor.update.value.replace({
          children: [{ children: [{ text: 'nope' }], type: 'unknown' }] as any,
          selection: null,
        }),
      /unknown editor element type "unknown"/i
    );
    unsubscribe();
    assert.deepEqual(editor.read.value(), before);
    assert.deepEqual(editor.read.selection(), selectionBefore);
    assert.equal(commits, 0);
  });

  it('fits open slices by closing shared and independent edges', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:open-slice-schema', {
          elements: {
            caption: {
              content: schema.content.text({ default: 'text', min: 1 }),
            } as const,
            figure: {
              content: schema.content.type('caption', {
                default: { type: 'caption' },
                min: 1,
              }),
              groups: ['section-child'],
            } as const,
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
              groups: ['section-child'],
            } as const,
            section: {
              content: schema.content.group('section-child', {
                default: { type: 'paragraph' },
                min: 1,
              }),
            } as const,
          },
          groups: { 'section-child': {} },
          id: 'open-slice-schema',
          root: schema.content.type('section'),
          unknown: 'reject',
          version: 1,
        }),
      ],
    });
    const nested = {
      type: 'figure',
      children: [{ type: 'caption', children: [{ text: 'open' }] }],
    };
    const value = {
      children: [
        {
          type: 'section',
          children: [{ type: 'paragraph', children: [{ text: '' }] }],
        },
      ],
    };
    editor.update.value.replace(value);
    const at = {
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0] },
    };
    const preserved = editor.read.slice.fit(
      {
        content: [nested],
        openEnd: 1,
        openStart: 1,
      },
      { at }
    );

    assert.ok(preserved);
    assert.deepEqual(preserved.changes.apply(value), {
      children: [{ type: 'section', children: [nested] }],
    });

    const opened = editor.read.slice.fit(
      {
        content: [nested],
        openEnd: 2,
        openStart: 2,
      },
      { at }
    );

    assert.ok(opened);
    assert.deepEqual(opened.changes.apply(value), {
      children: [
        {
          type: 'section',
          children: [{ type: 'paragraph', children: [{ text: 'open' }] }],
        },
      ],
    });
    assert.throws(
      () =>
        editor.read.slice.fit(
          {
            content: [{ text: 'not-deep-enough' }],
            openEnd: 1,
            openStart: 0,
          },
          { at }
        ),
      /open end exceeds its element context/
    );
    assert.throws(
      () =>
        editor.read.slice.fit(
          {
            content: [],
            openEnd: 0,
            openStart: -1,
          },
          { at }
        ),
      /open depths must be non-negative integers/
    );
  });

  it('rolls back an invalid compiled schema batch atomically', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.install(
          defineContractSchema('invalid-batch', {
            'invalid-owner': {
              content: schema.content.group('missing-group'),
            } as const,
            'valid-before-rollback': {} as const,
          })
        ),
      /references unknown group "missing-group"/i
    );
    assert.equal(editor.read.schema.element('valid-before-rollback'), null);
    assert.equal(editor.read.schema.element('invalid-owner'), null);
  });

  it('validates schema-backed property kinds and custom predicates', () => {
    const editor = createEditor({
      extensions: [
        defineContractSchema('property-validation', {
          callout: {
            content: schema.content.text(),
            properties: {
              count: property.number(),
              tone: property.string({
                validate: (value): value is string =>
                  value === 'info' || value === 'warn',
                validationVersion: 1,
              }),
            },
          } as const,
        }),
      ],
    });

    assert.throws(
      () =>
        editor.read.schema.assertFragment([
          {
            type: 'callout',
            count: 'two',
            children: [{ text: '' }],
          },
        ]),
      /count.*number/
    );
    assert.throws(
      () =>
        editor.read.schema.assertFragment([
          {
            type: 'callout',
            tone: 'error',
            children: [{ text: '' }],
          },
        ]),
      /tone.*fails custom property validation/i
    );
  });

  it('enforces required properties and materializes canonical defaults', () => {
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:required-properties', {
          elements: {
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
              properties: {
                align: property.string({
                  default: 'start',
                  omitDefault: true,
                }),
                id: property.string({ required: true }),
                tone: property.string({ default: 'neutral' }),
              },
            } as const,
          },
          id: 'required-properties',
          properties: [
            schema.textProperty('weight', property.number({ default: 400 }), {
              target: target.type('paragraph'),
            }),
          ],
          root: schema.content.type('paragraph'),
          unknown: 'reject',
          version: 1,
        }),
      ],
    });

    assert.throws(
      () => editor.read.schema.create('paragraph'),
      /paragraph.*requires property "id"/i
    );
    assert.deepEqual(editor.read.schema.create('paragraph', { id: 'p1' }), {
      children: [{ text: '', weight: 400 }],
      id: 'p1',
      tone: 'neutral',
      type: 'paragraph',
    });
    assert.throws(
      () =>
        editor.read.schema.assertFragment([
          {
            children: [{ text: '', weight: 400 }],
            tone: 'neutral',
            type: 'paragraph',
          },
        ]),
      /requires property "id"/i
    );
    assert.throws(
      () =>
        editor.read.schema.assertFragment([
          {
            children: [{ text: '' }],
            id: 'p1',
            tone: 'neutral',
            type: 'paragraph',
          },
        ]),
      /requires canonical property "weight"/i
    );

    const requiredTextEditor = createEditor({
      extensions: [
        defineEditorSchema('schema:required-text-property', {
          elements: {
            paragraph: {
              content: schema.content.text(),
            } as const,
          },
          id: 'required-text-property',
          properties: [
            schema.textProperty('markId', property.string({ required: true }), {
              target: target.type('paragraph'),
            }),
          ],
          root: schema.content.type('paragraph'),
          unknown: 'reject',
          version: 1,
        }),
      ],
    });

    assert.throws(
      () =>
        requiredTextEditor.read.schema.assertFragment([
          {
            children: [{ text: '' }],
            type: 'paragraph',
          },
        ]),
      /requires property "markId"/i
    );
    assert.doesNotThrow(() =>
      requiredTextEditor.read.schema.assertFragment([
        {
          children: [{ markId: 'm1', text: '' }],
          type: 'paragraph',
        },
      ])
    );

    const generatedTextEditor = createEditor({
      extensions: [
        defineEditorSchema('schema:generated-text-property', {
          elements: {
            paragraph: { content: schema.content.text() },
          },
          properties: [
            schema.textProperty(
              'textId',
              property.string({ generate: () => 't1' }),
              { target: target.type('paragraph') }
            ),
          ],
          root: schema.content.type('paragraph'),
          unknown: 'reject',
        }),
      ],
    });

    assert.throws(
      () =>
        generatedTextEditor.read.schema.assertFragment([
          { children: [{ text: '' }], type: 'paragraph' },
        ]),
      /requires canonical property "textId"/i
    );
    assert.doesNotThrow(() =>
      generatedTextEditor.read.schema.assertFragment([
        {
          children: [{ text: '', textId: 't1' }],
          type: 'paragraph',
        },
      ])
    );
  });

  it('materializes generated properties during local construction', () => {
    let nextId = 0;
    const editor = createEditor({
      extensions: [
        defineEditorSchema('schema:generated-properties', {
          elements: {
            paragraph: {
              content: schema.content.text({ default: 'text', min: 1 }),
            },
          },
          properties: [
            schema.elementProperty(
              'id',
              property.string({ generate: () => `p${++nextId}` }),
              {
                copy: 'drop',
                split: 'drop',
                target: target.group('element'),
              }
            ),
          ],
          root: schema.content.type('paragraph'),
          unknown: 'reject',
        }),
      ],
      initialValue: [
        { children: [{ text: 'source' }], id: 'source', type: 'paragraph' },
      ],
    });

    assert.deepEqual(editor.read.schema.create('paragraph'), {
      children: [{ text: '' }],
      id: 'p1',
      type: 'paragraph',
    });
    assert.deepEqual(editor.read.schema.create('paragraph', { id: 'fixed' }), {
      children: [{ text: '' }],
      id: 'fixed',
      type: 'paragraph',
    });
    assert.throws(
      () =>
        editor.read.schema.assertFragment([
          { children: [{ text: '' }], type: 'paragraph' },
        ]),
      /requires canonical property "id"/i
    );

    editor.update((tx) => {
      tx.blocks.duplicate({ at: [0, 0] });
    });
    assert.deepEqual(
      editor.read
        .children()
        .map((node) => (ElementApi.isElement(node) ? node.id : undefined)),
      ['source', 'p2']
    );
  });

  it('owns element predicates for app-defined specs', () => {
    const editor = createEditor();
    const cleanup = editor.install(
      defineContractSchema('schema-contract', {
        badge: { selectable: false } as const,
        image: { void: 'block' } as const,
        link: { inline: true } as const,
        mention: { void: 'markable-inline' } as const,
        readonly: { readOnly: true } as const,
      })
    );

    assert.equal(
      editor.read((state) =>
        state.schema.isInline({ type: 'link', children: [] })
      ),
      true
    );
    assert.equal(
      editor.read((state) =>
        state.schema.isVoid({ type: 'image', children: [] })
      ),
      true
    );
    assert.equal(
      editor.read((state) =>
        state.schema.isSelectable({ type: 'badge', children: [] })
      ),
      false
    );
    assert.equal(
      editor.read((state) =>
        state.schema.isReadOnly({ type: 'readonly', children: [] })
      ),
      true
    );
    assert.equal(
      editor.read((state) =>
        state.schema.isMarkableVoid({
          type: 'mention',
          children: [{ text: '' }],
        })
      ),
      true
    );

    cleanup();

    assert.equal(
      editor.read((state) =>
        state.schema.isVoid({ type: 'image', children: [] })
      ),
      false
    );
  });

  it('registers compiled element declarations through extensions', () => {
    const editor = createEditor();
    const cleanup = editor.install(
      defineContractSchema('embed', { embed: { void: 'block' } as const })
    );

    assert.equal(
      editor.read((state) =>
        state.schema.isVoid({ type: 'embed', children: [] })
      ),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.element('embed')?.behavior.voidKind),
      'block'
    );

    cleanup();

    assert.equal(
      editor.read((state) => state.schema.element('embed')),
      null
    );
  });

  it('rejects invalid void declarations', () => {
    const editor = createEditor();
    assert.throws(
      () =>
        editor.install(
          defineContractSchema('boolean-void-flag', {
            'boolean-void-flag': { void: true as never } as const,
          })
        ),
      /void/i
    );
  });

  it('rejects duplicate element specs', () => {
    const editor = createEditor();
    editor.install(
      defineContractSchema('image', { image: { void: 'block' } as const })
    );

    assert.throws(
      () =>
        editor.install(
          defineExtension('other-image', {
            schema: {
              elements: {
                image: { content: inlineContent, inline: true },
              },
            },
          })
        ),
      /element type "image".*owned by both/i
    );
  });

  it('rejects reserved extension-owned element property names', () => {
    const editor = createEditor();

    assert.throws(
      () =>
        editor.install(
          defineContractSchema('bad-properties', {
            'bad-cell': {
              properties: { type: property.string() },
            } as const,
          })
        ),
      /property.*reserved key "type"/i
    );
  });

  it('exposes schema through read and update views', () => {
    const editor = createEditor();
    editor.install(
      defineContractSchema('mention', {
        mention: { void: 'markable-inline' } as const,
      })
    );

    const readInline = editor.read((state) =>
      state.schema.isInline({ type: 'mention', children: [{ text: '' }] })
    );
    let txMarkable = false;

    editor.update((tx) => {
      txMarkable = tx.schema.isMarkableVoid({
        type: 'mention',
        children: [{ text: '' }],
      });
    });

    assert.equal(readInline, true);
    assert.equal(txMarkable, true);
  });

  it('resolves element behavior policy from specs', () => {
    const editor = createEditor();
    editor.install(
      defineContractSchema('element-behavior', {
        'editable-embed': { void: 'editable-island' } as const,
        'mention-card': {
          atom: true,
          isolating: true,
          keyboardSelectable: true,
        } as const,
      })
    );

    const atom = { type: 'mention-card', children: [{ text: 'label' }] };
    const island = { type: 'editable-embed', children: [{ text: 'inside' }] };

    assert.equal(
      editor.read((state) => state.schema.isAtom(atom)),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.isIsolating(atom)),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.isKeyboardSelectable(atom)),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.isEditableIsland(island)),
      true
    );
    assert.equal(
      editor.read((state) => state.schema.isAtom(island)),
      false
    );
  });

  it('reads element property defaults without exposing implementation equality', () => {
    const editor = createEditor();
    const TableSchema = defineEditorSchema('schema:table-properties', {
      elements: {
        'table-cell': {
          content: schema.content.open(),
          properties: {
            colSpan: property.number({ default: 1 }),
            locked: property.boolean({ default: false }),
            role: property.string({ default: 'cell' }),
          },
        },
      },
      id: 'table-properties',
      root: schema.content.type('table-cell'),
      unknown: 'reject',
      version: 1,
    });

    editor.install(TableSchema);
    const cell = {
      type: 'table-cell',
      children: [{ text: '' }],
    };
    const colSpanHandle = schema.handle.property(
      schema.handle.element(TableSchema, 'table-cell'),
      'colSpan'
    );

    assert.equal(
      editor.read((state) => state.schema.getProperty(cell, 'colSpan')),
      1
    );
    assert.equal(
      editor.read((state) => state.schema.getProperty(cell, 'locked')),
      false
    );
    assert.equal(
      editor.read((state) => state.schema.getProperty(cell, 'role')),
      'cell'
    );
    assert.equal(
      editor.read(
        (state) =>
          state.schema.property({
            key: 'colSpan',
            placement: 'element',
            type: 'table-cell',
          })?.value.kind
      ),
      'number'
    );
    assert.equal(
      editor.read.schema.property(colSpanHandle)?.value.kind,
      'number'
    );
    assert.deepEqual(cell, {
      type: 'table-cell',
      children: [{ text: '' }],
    });

    const inheritedCell = Object.assign(Object.create({ colSpan: 99 }), cell);
    let getterCalled = false;
    const accessorCell = { ...cell };

    Object.defineProperty(accessorCell, 'colSpan', {
      get: () => {
        getterCalled = true;

        return 99;
      },
    });

    assert.equal(
      editor.read.schema.getProperty(inheritedCell, colSpanHandle),
      1
    );
    assert.equal(
      editor.read.schema.getProperty(accessorCell, colSpanHandle),
      1
    );
    assert.equal(getterCalled, false);
  });

  it('resolves property defaults through exact element variants', () => {
    const editor = createEditor();
    editor.install(
      defineContractSchema('table-property-variants', {
        'table-cell': {
          properties: { colSpan: property.number({ default: 1 }) },
        } as const,
        'wide-table-cell': {
          properties: { colSpan: property.number({ default: 2 }) },
        } as const,
      })
    );

    assert.equal(
      editor.read((state) =>
        state.schema.getProperty(
          { type: 'wide-table-cell', children: [{ text: '' }] },
          'colSpan'
        )
      ),
      2
    );
  });

  it('keeps property-handle reads placement-safe and parent-optional', () => {
    const tone = schema.textProperty(
      'tone',
      property.string({ default: 'neutral' })
    );
    const paragraphTone = schema.textProperty(
      'paragraphTone',
      property.string({ default: 'body' }),
      { target: target.type('paragraph') }
    );
    const nonParagraphTone = schema.textProperty(
      'nonParagraphTone',
      property.string({ default: 'other' }),
      { target: target.not(target.type('paragraph')) }
    );
    const rank = schema.elementProperty(
      'rank',
      property.number({ default: 1 }),
      { target: target.type('paragraph') }
    );
    const editor = createEditor();

    editor.install(
      defineEditorSchema('schema:property-handle-placement', {
        elements: {
          heading: { content: schema.content.text() },
          paragraph: { content: schema.content.text() },
        },
        properties: [tone, paragraphTone, nonParagraphTone, rank],
        root: schema.content.type('paragraph'),
      })
    );
    const toneHandle = schema.handle.property(tone);
    const paragraphToneHandle = schema.handle.property(paragraphTone);
    const rankHandle = schema.handle.property(rank);
    const paragraph = { type: 'paragraph', children: [{ text: '' }] };
    const text = paragraph.children[0]!;
    const heading = {
      type: 'heading',
      children: [{ paragraphTone: 'wrong-target', text: '' }],
    };

    assert.equal(editor.read.schema.getProperty(text, toneHandle), 'neutral');
    assert.equal(editor.read.schema.getProperty(text, 'tone'), 'neutral');
    assert.equal(
      editor.read.schema.getProperty({ ...text, tone: 'warm' }, toneHandle),
      'warm'
    );
    assert.equal(
      editor.read.schema.getProperty(text, paragraphToneHandle),
      undefined
    );
    assert.equal(
      editor.read.schema.getProperty(text, 'paragraphTone'),
      undefined
    );
    assert.equal(
      editor.read.schema.getProperty(text, 'nonParagraphTone'),
      undefined
    );
    assert.equal(
      editor.read.schema.getProperty(heading.children[0]!, 'nonParagraphTone', {
        parent: heading,
      }),
      'other'
    );
    assert.equal(
      editor.read.schema.getProperty(text, paragraphToneHandle, {
        parent: paragraph,
      }),
      'body'
    );
    assert.equal(
      editor.read.schema.getProperty(text, 'paragraphTone', {
        parent: paragraph,
      }),
      'body'
    );
    assert.equal(
      editor.read.schema.getProperty(
        heading.children[0]!,
        paragraphToneHandle,
        { parent: heading }
      ),
      undefined
    );
    assert.equal(
      editor.read.schema.getProperty({ ...heading, rank: 2 }, rankHandle),
      undefined
    );
    assert.equal(
      editor.read.schema.getProperty(
        { ...paragraph, tone: 'wrong-placement' },
        toneHandle
      ),
      undefined
    );
    assert.equal(
      editor.read.schema.getProperty({ ...text, rank: 2 }, rankHandle, {
        parent: paragraph,
      }),
      undefined
    );
  });
});
