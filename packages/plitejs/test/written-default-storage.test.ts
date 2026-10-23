import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  defineEditorSchema,
  diffEditorSchemaContracts,
  editorCommands,
  type EditorUpdateTransaction,
  property,
  readEditorSchemaContract,
  schema,
  SelectionApi,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { createEditorSchemaContract } from '../src/core/schema-compiler';
import { compileEditorSchemaContributions } from '../src/internal';
import { authoredTestApi } from './support/authored';

type Node = Record<string, unknown> & { children?: Node[]; text?: string };
type Value = Readonly<{ children: Node[] }>;
type Intent = 'edit' | 'propose';
type Plugin = ReturnType<typeof defineEditorSchema>;

const editorFor = (
  plugin: Plugin,
  value: unknown,
  author = 'zed',
  intent: Intent = 'edit'
) =>
  createEditor({
    initialValue: value as never,
    plugins: [
      plugin,
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => author,
        intent,
        now: () => 1,
      }),
    ],
  });

const commit = (
  plugin: Plugin,
  value: unknown,
  author: string,
  intent: Intent,
  run: (tx: EditorUpdateTransaction) => void
) => {
  const editor = editorFor(plugin, value, author, intent);

  editor.update((tx) => run(tx));

  return editor.read.value() as unknown as Value;
};

const decide = (
  plugin: Plugin,
  value: unknown,
  action: 'accept' | 'reject',
  change: string
) => {
  const editor = editorFor(plugin, value);
  const result = authoredTestApi(editor).decide({ action, changes: [change] });

  return { result, value: editor.read.value() as unknown as Value };
};

const unmarked = (nodes: readonly Node[]): Node[] =>
  nodes.map(({ authored: _authored, children, ...rest }) =>
    children ? { ...rest, children: unmarked(children) } : rest
  );

const linkIn = (type: string, link: Node) => ({
  children: [{ text: '' }, link, { text: '' }],
  type,
});
const inlineSchema = (
  id: string,
  properties: Parameters<typeof defineEditorSchema>[1]['properties']
) =>
  defineEditorSchema(id, {
    elements: {
      heading: {
        content: schema.content.any(
          [schema.content.text(), schema.content.type('link')],
          { default: 'text', min: 1 }
        ),
      },
      link: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
      },
      paragraph: {
        content: schema.content.any(
          [schema.content.text(), schema.content.type('link')],
          { default: 'text', min: 1 }
        ),
      },
    },
    id,
    properties,
    root: schema.content.types(['heading', 'paragraph'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'preserve',
    version: 1,
  });
const linkInParagraph = target.and(
  target.type('link'),
  target.parent(target.type('paragraph'))
);
const linkInHeading = target.and(
  target.type('link'),
  target.parent(target.type('heading'))
);

const Marks = defineEditorSchema('schema:written-defaults', {
  elements: { paragraph: { content: schema.content.text() } },
  id: 'written-defaults',
  properties: [
    schema.textProperty(
      'bold',
      property.boolean({ default: false, omitDefault: true })
    ),
  ],
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

describe('written default storage', () => {
  it('stores a written value equal to its left-out default through a save and reload', () => {
    const written = commit(
      Marks,
      [{ children: [{ text: 'a' }], type: 'paragraph' }],
      'ed',
      'edit',
      (tx) => tx.nodes.set({ bold: false }, { at: [0, 0] })
    );
    const reloaded = editorFor(Marks, JSON.parse(JSON.stringify(written)));

    assert.deepEqual(reloaded.read.value().children, [
      { children: [{ bold: false, text: 'a' }], type: 'paragraph' },
    ]);
  });

  const fingerprintWithoutStorageRevision = 'fnv1a64:270fc4f64c21a83f';
  const contracts = () => {
    const contract = createEditorSchemaContract(
      compileEditorSchemaContributions([
        { contribution: Marks.schema, pluginName: Marks.name },
      ])
    );
    const { storageRevision: _storageRevision, ...withoutRevision } =
      JSON.parse(JSON.stringify(contract));

    return {
      contract,
      older: {
        ...withoutRevision,
        fingerprint: fingerprintWithoutStorageRevision,
        identity: {
          ...withoutRevision.identity,
          fingerprint: fingerprintWithoutStorageRevision,
        },
      },
    };
  };

  it('gives a schema with a left-out default a new fingerprint and still reads its older contract', () => {
    const { contract, older } = contracts();

    assert.notEqual(contract.fingerprint, fingerprintWithoutStorageRevision);
    assert.equal(
      readEditorSchemaContract(older)?.fingerprint,
      fingerprintWithoutStorageRevision
    );
    assert.equal(
      readEditorSchemaContract(JSON.parse(JSON.stringify(contract)))
        ?.fingerprint,
      contract.fingerprint
    );
  });

  it('names the storage revision as a change an older contract must migrate across', () => {
    const { contract, older } = contracts();
    const diff = diffEditorSchemaContracts(older, contract);

    assert.deepEqual(diff.changes, [
      {
        from: '0',
        impact: 'migration-required',
        kind: 'storage-revision-changed',
        path: 'storageRevision',
        to: '1',
      },
    ]);
    assert.equal(diff.requiresMigration, true);
  });

  it('needs no migration when a schema starts leaving a default out, and still needs one when it stops', () => {
    const contractOf = (
      ...properties: Array<ReturnType<typeof schema.textProperty>>
    ) => {
      const plugin = defineEditorSchema('written-defaults-adopt', {
        elements: { paragraph: { content: schema.content.text() } },
        id: 'written-defaults-adopt',
        properties,
        root: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      });

      return createEditorSchemaContract(
        compileEditorSchemaContributions([
          { contribution: plugin.schema, pluginName: plugin.name },
        ])
      );
    };
    const color = (omitDefault: boolean) =>
      schema.textProperty(
        'color',
        property.string({ default: 'u', omitDefault })
      );
    const filled = contractOf(color(false));
    const leftOut = contractOf(color(true));
    const withTone = contractOf(
      color(false),
      schema.textProperty(
        'tone',
        property.string({ default: 'v', omitDefault: true })
      )
    );

    assert.deepEqual(
      {
        existing: diffEditorSchemaContracts(filled, leftOut).requiresMigration,
        added: diffEditorSchemaContracts(filled, withTone).requiresMigration,
        stops: diffEditorSchemaContracts(leftOut, filled).requiresMigration,
      },
      { added: false, existing: false, stops: true }
    );
  });

  it('names a return to a contract without the storage revision as a change that needs a migration', () => {
    const { contract, older } = contracts();

    assert.equal(
      diffEditorSchemaContracts(contract, older).requiresMigration,
      true
    );
  });

  it('keeps a filled default active in its exclusive group, as next does', () => {
    const tone = schema.property.exclusive('written-defaults-filled-tone');
    const Filled = defineEditorSchema('written-defaults-filled', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'written-defaults-filled',
      properties: [
        schema.textProperty('color', property.string({ default: 'u' }), {
          exclusive: [tone],
        }),
        schema.textProperty('highlight', property.boolean(), {
          exclusive: [tone],
        }),
      ],
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const colored = [
      { children: [{ color: 'u', text: 'a' }], type: 'paragraph' },
    ];

    assert.deepEqual(
      commit(Filled, colored, 'ed', 'edit', (tx) =>
        tx.nodes.set({ highlight: true }, { at: [0, 0] })
      ).children,
      colored
    );
  });

  it('stores a pending write an older editor left out, after a retype changed the default', () => {
    const PlacedUrl = inlineSchema('written-defaults-placed-url', [
      schema.elementProperty(
        'url',
        property.string({ default: 'v', omitDefault: true }),
        { target: linkInParagraph }
      ),
      schema.elementProperty(
        'url',
        property.string({ default: 'w', omitDefault: true }),
        { target: linkInHeading }
      ),
    ]);
    const proposed = commit(
      PlacedUrl,
      [
        linkIn('heading', {
          children: [{ text: 'ab' }],
          type: 'link',
          url: 'u',
        }),
      ],
      'alice',
      'propose',
      (tx) => tx.nodes.set({ url: 'w' }, { at: [0, 1] })
    );
    const older = JSON.parse(JSON.stringify(proposed));

    delete older.children[0].children[1].url;
    const retyped = commit(PlacedUrl, older, 'ed', 'edit', (tx) =>
      tx.nodes.set({ type: 'paragraph' }, { at: [0] })
    );
    const loaded = editorFor(
      PlacedUrl,
      retyped
    ).read.value() as unknown as Value;

    assert.equal(loaded.children[0]?.children?.[1]?.url, 'w');
    assert.deepEqual(
      unmarked(decide(PlacedUrl, loaded, 'accept', 'alice').value.children),
      [
        linkIn('paragraph', {
          children: [{ text: 'ab' }],
          type: 'link',
          url: 'w',
        }),
      ]
    );
  });

  describe('a rejected split whose left half is gone', () => {
    const split = (plugin: Plugin, start: Node) =>
      commit(plugin, [start], 'carol', 'propose', (tx) =>
        tx.nodes.split({
          always: true,
          at: { offset: 1, path: [0, 1, 0] },
          match: (node) => (node as Node).type === 'link',
        })
      );

    it('keeps a value written on the right half after the cut', () => {
      const Refs = inlineSchema('written-defaults-refs', [
        schema.elementProperty('ref', property.string(), {
          split: 'drop',
          target: target.type('link'),
        }),
      ]);
      const carol = split(
        Refs,
        linkIn('paragraph', {
          children: [{ text: 'ab' }],
          ref: 'r1',
          type: 'link',
        })
      );
      const ed = commit(Refs, carol, 'ed', 'edit', (tx) => {
        tx.nodes.set({ ref: 'z' }, { at: [0, 3] });
        tx.nodes.remove({ at: [0, 1] });
      });
      const { result, value } = decide(Refs, ed, 'reject', 'carol');

      assert.equal(result.status, 'applied');
      assert.deepEqual(unmarked(value.children), [
        linkIn('paragraph', {
          children: [{ text: 'b' }],
          ref: 'z',
          type: 'link',
        }),
      ]);
    });

    it('gives back the saved value over a default a place filled', () => {
      const FilledRefs = inlineSchema('written-defaults-filled-refs', [
        schema.elementProperty('ref', property.string({ default: 'w' }), {
          split: 'drop',
          target: linkInParagraph,
        }),
        schema.elementProperty('ref', property.string({ default: 'z' }), {
          split: 'drop',
          target: linkInHeading,
        }),
      ]);
      const carol = split(
        FilledRefs,
        linkIn('paragraph', {
          children: [{ text: 'ab' }],
          ref: 'r1',
          type: 'link',
        })
      );
      const ed = commit(FilledRefs, carol, 'ed', 'edit', (tx) => {
        tx.nodes.set({ type: 'heading' }, { at: [0] });
        tx.nodes.remove({ at: [0, 1] });
      });
      const { result, value } = decide(FilledRefs, ed, 'reject', 'carol');

      assert.equal(result.status, 'applied');
      assert.deepEqual(unmarked(value.children), [
        linkIn('heading', {
          children: [{ text: 'b' }],
          ref: 'r1',
          type: 'link',
        }),
      ]);
    });
  });

  describe('a written default where its key cannot stand', () => {
    const QuoteColor = defineEditorSchema('written-defaults-quote-color', {
      elements: {
        box: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        paragraph: { content: schema.content.text() },
        quote: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      id: 'written-defaults-quote-color',
      properties: [
        schema.textProperty(
          'color',
          property.string({ default: 'u', omitDefault: true }),
          {
            target: target.and(
              target.type('paragraph'),
              target.not(target.parent(target.type('quote')))
            ),
          }
        ),
        schema.textProperty('bold', property.boolean()),
      ],
      root: schema.content.types(['box', 'paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'preserve',
      version: 1,
    });
    const plainEdit = (
      value: unknown,
      run: (tx: EditorUpdateTransaction) => void
    ) => {
      const editor = createEditor({
        initialValue: value as never,
        plugins: [QuoteColor],
      });

      editor.update((tx) => run(tx));

      return editor.read.value().children;
    };
    const paragraph = (...children: Node[]) => ({
      children,
      type: 'paragraph',
    });
    const block = (type: string, ...children: Node[]) => ({ children, type });
    const withQuote = [
      { children: [{ text: 'a' }], type: 'paragraph' },
      {
        children: [{ children: [{ text: 'q' }], type: 'paragraph' }],
        type: 'quote',
      },
    ];

    it('refuses a new node that holds it, whatever equal content stands elsewhere', () => {
      const colored = commit(QuoteColor, withQuote, 'ed', 'edit', (tx) =>
        tx.nodes.set({ color: 'u' }, { at: [0, 0] })
      );

      assert.throws(
        () =>
          commit(QuoteColor, colored, 'ed', 'edit', (tx) =>
            tx.nodes.insert(
              { children: [{ color: 'u', text: 'a' }], type: 'paragraph' },
              { at: [1, 1] }
            )
          ),
        /cannot target/
      );
    });

    describe('texts the dropped color alone told apart', () => {
      it('merge when a retype of their paragraph’s box drops it', () => {
        assert.deepEqual(
          plainEdit(
            [block('box', paragraph({ color: 'u', text: 'a' }, { text: 'b' }))],
            (tx) => tx.nodes.set({ type: 'quote' }, { at: [0] })
          ),
          [block('quote', paragraph({ text: 'ab' }))]
        );
      });

      it('merge when a join of their paragraph’s box into a quote drops it', () => {
        assert.deepEqual(
          plainEdit(
            [
              block('quote', paragraph({ text: 'q' })),
              block('box', paragraph({ color: 'u', text: 'a' }, { text: 'b' })),
            ],
            (tx) => tx.nodes.merge({ at: [1] })
          ),
          [block('quote', paragraph({ text: 'q' }), paragraph({ text: 'ab' }))]
        );
      });

      it('stay apart when another property still tells them apart', () => {
        assert.deepEqual(
          plainEdit(
            [
              block(
                'box',
                paragraph({ color: 'u', text: 'a' }, { bold: true, text: 'b' })
              ),
            ],
            (tx) => tx.nodes.set({ type: 'quote' }, { at: [0] })
          ),
          [block('quote', paragraph({ text: 'a' }, { bold: true, text: 'b' }))]
        );
      });

      it('merge when a proposed retype lands on a pending join, and accepting both gives one text', () => {
        const retype = defineCommand('written-defaults.box-to-quote', {
          build: ({ state }) =>
            state.transaction((tx) =>
              tx.nodes.set({ type: 'quote' }, { at: [0] })
            ),
        });
        const joined = commit(
          QuoteColor,
          [
            block(
              'box',
              paragraph({ color: 'u', text: 'a' }),
              paragraph({ text: 'b' })
            ),
          ],
          'dave',
          'propose',
          (tx) => {
            const caret = { offset: 0, path: [0, 1, 0] };

            tx.selection.set({ anchor: caret, focus: caret });
            tx.text.deleteBackward({ unit: 'character' });
          }
        );
        const retyped = commit(QuoteColor, joined, 'alice', 'propose', (tx) =>
          tx.command(retype)
        );
        const decided = decide(
          QuoteColor,
          decide(QuoteColor, retyped, 'accept', 'dave').value,
          'accept',
          'alice'
        );

        assert.deepEqual(unmarked(decided.value.children), [
          block('quote', paragraph({ text: 'ab' })),
        ]);
      });
    });
  });

  describe('typing over a heading whose text stores a size only headings hold', () => {
    const Sizes = defineEditorSchema('written-defaults-sizes', {
      elements: {
        heading: { content: schema.content.text() },
        paragraph: { content: schema.content.text() },
      },
      id: 'written-defaults-sizes',
      properties: [
        schema.textProperty(
          'size',
          property.string({ default: 'normal', omitDefault: true }),
          { target: target.type('heading') }
        ),
        schema.textProperty('bold', property.boolean()),
      ],
      root: schema.content.types(['heading', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const selections = {
      'the heading as a node': SelectionApi.nodes([[0]], { mode: 'block' }),
      'a range from the heading into the next paragraph': {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [1, 0] },
      },
    };
    const typeOver = (
      title: Record<string, unknown>,
      selection: (typeof selections)[keyof typeof selections],
      intent?: Intent
    ) => {
      const start = [
        { children: [{ ...title, text: 'Title' }], type: 'heading' },
        { children: [{ text: 'b' }], type: 'paragraph' },
      ];
      const editor = intent
        ? editorFor(Sizes, start, 'zed', intent)
        : createEditor({ initialValue: start as never, plugins: [Sizes] });

      editor.update((tx) => {
        tx.selection.set(selection);
        tx.command(editorCommands.insertText, { text: 'x' });
      });

      const typed = editor.read.value();

      return intent
        ? decide(Sizes, typed, 'accept', 'zed').value.children
        : unmarked(typed.children as Node[]);
    };
    const typedOver = (selection: object, text: Node) =>
      'anchor' in selection
        ? [{ children: [text], type: 'paragraph' }]
        : [
            { children: [text], type: 'paragraph' },
            { children: [{ text: 'b' }], type: 'paragraph' },
          ];

    for (const [name, selection] of Object.entries(selections)) {
      for (const intent of [undefined, 'propose'] as const) {
        it(`types a paragraph without the size over ${name}${intent ? ' in Suggesting' : ''}`, () => {
          assert.deepEqual(
            unmarked(typeOver({ size: 'normal' }, selection, intent)),
            typedOver(selection, { text: 'x' })
          );
        });
      }

      it(`keeps a mark the paragraph holds when typing over ${name}`, () => {
        assert.deepEqual(
          typeOver({ bold: true, size: 'normal' }, selection),
          typedOver(selection, { bold: true, text: 'x' })
        );
      });

      it(`refuses a size other than the default when typing over ${name}, as next does`, () => {
        assert.throws(
          () => typeOver({ size: 'big' }, selection),
          /cannot target text under "paragraph"/
        );
      });
    }

    it('types a paragraph without the size over headings named by range when nothing is selected', () => {
      const editor = createEditor({
        initialValue: [
          { children: [{ size: 'normal', text: 'A' }], type: 'heading' },
          { children: [{ size: 'normal', text: 'B' }], type: 'heading' },
        ] as never,
        plugins: [Sizes],
      });

      editor.update((tx) => {
        tx.command(editorCommands.insertText, {
          options: {
            at: {
              anchor: { offset: 0, path: [0, 0] },
              focus: { offset: 1, path: [1, 0] },
            },
          },
          text: 'x',
        });
      });

      assert.deepEqual(editor.read.value().children, [
        { children: [{ text: 'x' }], type: 'paragraph' },
      ]);
    });

    it('keeps a size that only another place leaves out when typing over a paragraph that holds it', () => {
      const SizesByPlace = defineEditorSchema(
        'written-defaults-sizes-by-place',
        {
          elements: {
            heading: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          id: 'written-defaults-sizes-by-place',
          properties: [
            schema.textProperty(
              'size',
              property.string({ default: 'normal', omitDefault: true }),
              { target: target.type('heading') }
            ),
            schema.textProperty(
              'size',
              property.string({ default: 'small', omitDefault: true }),
              { target: target.type('paragraph') }
            ),
          ],
          root: schema.content.types(['heading', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'reject',
          version: 1,
        }
      );
      const editor = createEditor({
        initialValue: [
          { children: [{ size: 'normal', text: 'a' }], type: 'paragraph' },
        ] as never,
        plugins: [SizesByPlace],
      });

      editor.update((tx) => {
        tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }));
        tx.command(editorCommands.insertText, { text: 'x' });
      });

      assert.deepEqual(editor.read.value().children, [
        { children: [{ size: 'normal', text: 'x' }], type: 'paragraph' },
      ]);
    });

    const acrossIntoHeading = {
      'typing over a range from inside a paragraph to the heading’s end': (
        tx: EditorUpdateTransaction
      ) => tx.command(editorCommands.insertText, { text: 'x' }),
      'deleting that range with the keyboard, then typing': (
        tx: EditorUpdateTransaction
      ) => {
        tx.command(editorCommands.deleteFragment, { direction: 'backward' });
        tx.command(editorCommands.insertText, { text: 'x' });
      },
    };

    for (const [name, run] of Object.entries(acrossIntoHeading)) {
      for (const intent of [undefined, 'propose'] as const) {
        it(`types the paragraph’s text without the size after ${name}${intent ? ' in Suggesting' : ''}`, () => {
          const start = [
            { children: [{ text: 'ab' }], type: 'paragraph' },
            { children: [{ size: 'normal', text: 'Title' }], type: 'heading' },
          ];
          const editor = intent
            ? editorFor(Sizes, start, 'zed', intent)
            : createEditor({ initialValue: start as never, plugins: [Sizes] });

          editor.update((tx) => {
            tx.selection.set({
              anchor: { offset: 2, path: [0, 0] },
              focus: { offset: 5, path: [1, 0] },
            });
            run(tx);
          });

          const typed = editor.read.value();

          assert.deepEqual(
            unmarked(
              (intent
                ? decide(Sizes, typed, 'accept', 'zed').value.children
                : typed.children) as Node[]
            ),
            [{ children: [{ text: 'abx' }], type: 'paragraph' }]
          );
        });
      }
    }

    for (const title of [
      { size: 'normal' },
      { bold: true, size: 'normal' },
    ] as const) {
      it(`proposes retyping a heading after typing at its end, where its text stores ${Object.keys(title).join(' and ')}`, () => {
        const start = [
          { children: [{ text: 'ab' }], type: 'paragraph' },
          { children: [{ ...title, text: 'Title' }], type: 'heading' },
          { children: [{ text: 'b' }], type: 'paragraph' },
        ];
        const editor = createEditor({
          initialValue: start as never,
          plugins: [
            Sizes,
            createAuthoredPlugin({
              authorId: 'zed',
              createChangeId: () => 'zed',
              createTagId: () => 'tag',
              intent: 'propose',
              now: () => 1,
            }),
          ],
        });

        editor.update((tx) => {
          const end = { offset: 5, path: [1, 0] };

          tx.selection.set({ anchor: end, focus: end });
          tx.command(editorCommands.insertText, { text: 'x' });
          tx.nodes.set({ type: 'paragraph' }, { at: [1] });
        });

        const typed = editor.read.value();
        const removal = (key: string, before: unknown) => ({
          at: 1,
          author: 'zed',
          before,
          change: 'zed',
          id: 'tag',
          key,
          kind: 'format',
          write: { kind: 'remove' },
        });

        assert.deepEqual(
          {
            accepted: decide(Sizes, typed, 'accept', 'zed').value.children,
            rejected: decide(Sizes, typed, 'reject', 'zed').value.children,
            typed: typed.children,
          },
          {
            accepted: [
              start[0],
              { children: [{ text: 'Titlex' }], type: 'paragraph' },
              start[2],
            ],
            rejected: start,
            typed: [
              start[0],
              {
                authored: [
                  {
                    at: 1,
                    author: 'zed',
                    before: 'heading',
                    change: 'zed',
                    id: 'tag',
                    key: 'type',
                    kind: 'format',
                    write: { kind: 'set', value: 'paragraph' },
                  },
                ],
                children: [
                  {
                    authored: Object.entries(title).map(([key, before]) =>
                      removal(key, before)
                    ),
                    text: 'Title',
                  },
                  {
                    authored: [
                      { at: 1, author: 'zed', change: 'zed', kind: 'insert' },
                    ],
                    text: 'x',
                  },
                ],
                type: 'paragraph',
              },
              start[2],
            ],
          }
        );
      });
    }

    it('carries a mark but not the size to the line Enter opens once it becomes a paragraph', () => {
      const editor = createEditor({
        initialValue: [
          {
            children: [{ bold: true, size: 'normal', text: 'Title' }],
            type: 'heading',
          },
        ] as never,
        plugins: [Sizes],
      });

      editor.update((tx) => {
        const end = { offset: 5, path: [0, 0] };

        tx.selection.set({ anchor: end, focus: end });
        tx.command(editorCommands.insertBreak);
        tx.nodes.set({ type: 'paragraph' }, { at: [1] });
        tx.command(editorCommands.insertText, { text: 'x' });
      });

      assert.deepEqual(editor.read.value().children[1], {
        children: [{ bold: true, text: 'x' }],
        type: 'paragraph',
      });
    });
  });

  describe('a text that stores its place’s left-out default', () => {
    const byPlace = (
      key: string,
      paragraphDefault: string,
      headingDefault: string
    ) =>
      defineEditorSchema(`written-defaults-${key}-by-place`, {
        elements: {
          heading: { content: schema.content.text() },
          paragraph: { content: schema.content.text() },
        },
        id: `written-defaults-${key}-by-place`,
        properties: [
          schema.textProperty(
            key,
            property.string({ default: paragraphDefault, omitDefault: true }),
            {
              target: target.type('paragraph'),
              typeChange: 'preserve-if-allowed',
            }
          ),
          schema.textProperty(
            key,
            property.string({ default: headingDefault, omitDefault: true }),
            {
              target: target.type('heading'),
              typeChange: 'preserve-if-allowed',
            }
          ),
          schema.textProperty('bold', property.boolean(), {
            typeChange: 'preserve-if-allowed',
          }),
        ],
        root: schema.content.types(['heading', 'paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      });
    const Colors = byPlace('color', 'u', 'w');

    it('gives a letter typed after a bold toggle the color its line stores', () => {
      const editor = createEditor({
        initialValue: [
          { children: [{ color: 'u', text: 'ab' }], type: 'paragraph' },
        ] as never,
        plugins: [Colors],
      });

      editor.update((tx) => {
        const end = { offset: 2, path: [0, 0] };

        tx.selection.set({ anchor: end, focus: end });
        tx.marks.toggle('bold');
        tx.command(editorCommands.insertText, { text: 'c' });
        tx.nodes.set({ type: 'heading' }, { at: [0] });
      });

      assert.deepEqual(editor.read.value().children, [
        {
          children: [
            { color: 'u', text: 'ab' },
            { bold: true, color: 'u', text: 'c' },
          ],
          type: 'heading',
        },
      ]);
    });

    const toggles = [
      {
        block: 'heading',
        key: 'size',
        plugin: byPlace('size', 'small', 'normal'),
        retype: 'paragraph',
        value: 'normal',
      },
      {
        block: 'paragraph',
        key: 'color',
        plugin: Colors,
        retype: 'heading',
        value: 'u',
      },
    ];

    for (const { block, key, plugin, retype, value } of toggles) {
      it(`removes a stored ${key} it toggles over a range as over the selected ${block}, so a retype reads the new place’s default`, () => {
        const toggleThenRetype = (selection: object) => {
          const editor = createEditor({
            initialValue: [
              { children: [{ [key]: value, text: 'ab' }], type: block },
            ] as never,
            plugins: [plugin],
          });

          editor.update((tx) => {
            tx.selection.set(selection as never);
            tx.marks.toggle(key, value);
            tx.nodes.set({ type: retype }, { at: [0] });
          });

          return editor.read.value().children;
        };
        const retyped = [{ children: [{ text: 'ab' }], type: retype }];

        assert.deepEqual(
          {
            node: toggleThenRetype(
              SelectionApi.nodes([[0]], { mode: 'block' })
            ),
            range: toggleThenRetype({
              anchor: { offset: 0, path: [0, 0] },
              focus: { offset: 2, path: [0, 0] },
            }),
          },
          { node: retyped, range: retyped }
        );
      });
    }
  });

  describe('compiling', () => {
    const start = [{ children: [{ text: 'ab' }], type: 'paragraph' }];

    it('refuses an exclusive group member whose default differs by place', () => {
      const tone = schema.property.exclusive('written-defaults-tone');
      const grouped = (headingDefault: string) =>
        defineEditorSchema('written-defaults-grouped', {
          elements: {
            heading: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          id: 'written-defaults-grouped',
          properties: [
            schema.textProperty(
              'color',
              property.string({ default: 'u', omitDefault: true }),
              { exclusive: [tone], target: target.type('paragraph') }
            ),
            schema.textProperty(
              'color',
              property.string({ default: headingDefault, omitDefault: true }),
              { exclusive: [tone], target: target.type('heading') }
            ),
            schema.textProperty('highlight', property.boolean(), {
              exclusive: [tone],
            }),
          ],
          root: schema.content.types(['heading', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'preserve',
          version: 1,
        });

      assert.throws(
        () => editorFor(grouped('w'), start),
        /exclusive group member whose default differs by place/
      );
      assert.doesNotThrow(() => editorFor(grouped('u'), start));
    });

    it('compiles an exclusive group member whose filled default differs by place', () => {
      const tone = schema.property.exclusive('written-defaults-filled-place');
      const filled = defineEditorSchema('written-defaults-filled-place', {
        elements: {
          heading: { content: schema.content.text() },
          paragraph: { content: schema.content.text() },
        },
        id: 'written-defaults-filled-place',
        properties: [
          schema.textProperty('color', property.string({ default: 'u' }), {
            exclusive: [tone],
            target: target.type('paragraph'),
          }),
          schema.textProperty('color', property.string({ default: 'w' }), {
            exclusive: [tone],
            target: target.type('heading'),
          }),
          schema.textProperty('highlight', property.boolean(), {
            exclusive: [tone],
          }),
        ],
        root: schema.content.types(['heading', 'paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'preserve',
        version: 1,
      });

      assert.doesNotThrow(() =>
        editorFor(filled, [
          { children: [{ color: 'u', text: 'ab' }], type: 'paragraph' },
        ])
      );
    });

    it('refuses a prefix and an exact key whose left-out defaults differ by place in an exclusive group', () => {
      const tone = schema.property.exclusive('written-defaults-prefix-tone');
      const prefixed = (exactDefault: string) =>
        defineEditorSchema('written-defaults-prefix-grouped', {
          elements: {
            heading: { content: schema.content.text() },
            paragraph: { content: schema.content.text() },
          },
          id: 'written-defaults-prefix-grouped',
          properties: [
            schema.textProperty(
              schema.key.prefix('color_'),
              property.string({ default: 'u', omitDefault: true }),
              { exclusive: [tone], target: target.type('paragraph') }
            ),
            schema.textProperty(
              'color_x',
              property.string({ default: exactDefault, omitDefault: true }),
              { exclusive: [tone], target: target.type('heading') }
            ),
            schema.textProperty('highlight', property.boolean(), {
              exclusive: [tone],
            }),
          ],
          root: schema.content.types(['heading', 'paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          unknown: 'preserve',
          version: 1,
        });

      assert.throws(
        () => editorFor(prefixed('w'), start),
        /exclusive group member whose default differs by place/
      );
      assert.doesNotThrow(() => editorFor(prefixed('u'), start));
    });

    it('refuses a key whose split rule differs by place', () => {
      const refs = (headingSplit: 'drop' | 'preserve') =>
        inlineSchema('written-defaults-split-by-place', [
          schema.elementProperty('ref', property.string(), {
            split: 'drop',
            target: linkInParagraph,
          }),
          schema.elementProperty('ref', property.string(), {
            split: headingSplit,
            target: linkInHeading,
          }),
        ]);

      assert.throws(
        () => editorFor(refs('preserve'), start),
        /drops on a split in one place and keeps in another/
      );
      assert.doesNotThrow(() => editorFor(refs('drop'), start));
    });

    it('refuses a prefix and an exact key whose split rules differ by place', () => {
      const refs = (exactSplit: 'drop' | 'preserve') =>
        inlineSchema('written-defaults-prefix-split', [
          schema.elementProperty(
            schema.key.prefix('data_'),
            property.string(),
            {
              split: 'drop',
              target: linkInParagraph,
            }
          ),
          schema.elementProperty('data_ref', property.string(), {
            split: exactSplit,
            target: linkInHeading,
          }),
        ]);

      assert.throws(
        () => editorFor(refs('preserve'), start),
        /drops on a split in one place and keeps in another/
      );
      assert.doesNotThrow(() => editorFor(refs('drop'), start));
    });
  });
});
