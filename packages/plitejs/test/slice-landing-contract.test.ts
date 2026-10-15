import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  type Descendant,
  editorCommands,
  editorReads,
  property,
  schema,
  SelectionApi,
  type SliceLanding,
  type SliceLandingInput,
  target,
  transfer,
} from 'plitejs';
import { history } from 'plitejs/history';

import { createAuthoredPlugin } from '../src/authored/authored';
import {
  dispatchCommand,
  evaluateCommandWithState,
} from '../src/core/command-registry';
import { registerEditorContent } from '../src/core/content';
import {
  getEditorStateView,
  withEditorUpdateRootScope,
} from '../src/core/public-state';
import { setTargetRuntime } from '../src/core/target-runtime';
import { dom, domCommands } from '../src/dom';

const text = () => schema.content.text({ default: 'text', min: 1 });
const paragraph = (value: string, props: object = {}) => ({
  type: 'paragraph',
  ...props,
  children: [{ text: value }],
});
const heading = (value: string) => ({
  type: 'heading',
  children: [{ text: value }],
});
const media = (caption: string) => ({
  type: 'media',
  children: [{ text: caption }],
});
const blocks = () =>
  schema.content.types(['paragraph', 'heading', 'media', 'portal', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  });

const LandingSchema = defineEditorSchema('schema:slice-landing', {
  elements: {
    heading: { content: text() },
    media: { content: text(), object: true },
    paragraph: { content: text(), properties: { align: property.string() } },
    portal: {
      content: text(),
      contentRoots: {
        body: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    quote: {
      content: schema.content.types(['paragraph', 'portal'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  properties: [
    schema.elementProperty('indent', property.number(), {
      target: target.types(['heading', 'paragraph']),
      typeChange: 'preserve-if-allowed',
    }),
  ],
  root: blocks(),
  unknown: 'reject',
});
const NotesSchema = defineEditorSchema('schema:slice-landing-notes', {
  ...LandingSchema.schema,
  roots: { notes: blocks() },
});

const HeaderNotesSchema = defineEditorSchema('schema:slice-landing-header', {
  ...LandingSchema.schema,
  roots: { header: blocks(), notes: blocks() },
});

const SharedPortalSchema = defineEditorSchema('schema:slice-landing-shared', {
  ...LandingSchema.schema,
  elements: {
    ...LandingSchema.schema.elements,
    portal: {
      content: text(),
      contentRoots: {
        body: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
  },
});

const NestedPortalSchema = defineEditorSchema('schema:slice-landing-nested', {
  ...LandingSchema.schema,
  elements: {
    ...LandingSchema.schema.elements,
    portal: {
      content: text(),
      contentRoots: {
        body: {
          content: schema.content.types(['paragraph', 'portal'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
  },
});

const rootOwner = (root: string, caption = 'P') => ({
  childRoots: { body: root },
  children: [{ text: caption }],
  type: 'portal',
});

const carried = (root: string) =>
  ContentSlice.fromJSON({
    content: [rootOwner(root)],
    openEnd: 0,
    openStart: 0,
    roots: { [root]: [paragraph('X')] },
  });

const pasteOutcome = (
  editor: ReturnType<typeof createEditor>,
  slice: ContentSlice
) => {
  const before = {
    selection: editor.read.selection(),
    value: editor.read.value(),
  };
  const result = editor.update.slice.replace(slice);

  return {
    after: { selection: editor.read.selection(), value: editor.read.value() },
    before,
    result,
  };
};

const SingleNoteSchema = defineEditorSchema(
  'schema:slice-landing-single-note',
  {
    ...LandingSchema.schema,
    roots: {
      notes: schema.content.types(['paragraph', 'heading'], {
        default: { type: 'paragraph' },
        max: 1,
        min: 1,
      }),
    },
  }
);

const caret = (path: number[], offset = 0) =>
  SelectionApi.text({ anchor: { offset, path }, focus: { offset, path } });

const landing = (
  name: string,
  land: (
    input: SliceLandingInput,
    next: (input?: SliceLandingInput) => SliceLanding
  ) => SliceLanding
) =>
  definePlugin(name, {
    readMiddleware: ({ around }) => [
      around(editorReads.slice.landing, ({ input, next }) =>
        land(input, (override) => (override ? next(override) : next()))
      ),
    ],
  });

const proposeOnEmpty = (content: Descendant[], omit?: string[]) =>
  landing('propose-on-empty', (input, next) => {
    const landed = next();

    return input.target.kind === 'empty'
      ? {
          ...landed,
          replaceEmpty: {
            omitTargetProperties: omit,
            slice: ContentSlice.closed(content),
          },
        }
      : landed;
  });

describe('slice landing', () => {
  it('replaces the resolved empty block with an admitted proposal', () => {
    const before = [paragraph('Before'), paragraph(''), paragraph('After')];
    const editor = createEditor({
      initialSelection: caret([1, 0]),
      initialValue: before,
      plugins: [LandingSchema, history(), proposeOnEmpty([paragraph('Head')])],
    });
    const keys = [0, 1, 2].map((index) => editor.read.key([index]));
    const emptyAnchor = editor.anchor([1], { deletion: 'drop' });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('Before'),
      paragraph('Head'),
      paragraph('After'),
    ]);
    assert.deepEqual(
      [0, 1, 2].map((index) => editor.read.key([index]) === keys[index]),
      [true, false, true],
      'only the replaced block loses its key'
    );
    assert.equal(emptyAnchor.release(), null);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 4, path: [1, 0] },
      focus: { offset: 4, path: [1, 0] },
    });

    editor.api.history.undo();

    assert.deepEqual(editor.read.children(), before);
    assert.deepEqual(editor.read.selection(), {
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });

  it('fits the landing slice and leaves no root behind when the parent refuses the proposal', () => {
    const editor = createEditor({
      initialSelection: caret([0, 0, 0]),
      initialValue: [{ type: 'quote', children: [paragraph('')] }],
      plugins: [
        LandingSchema,
        landing('propose-refused', (input, next) => ({
          ...next(),
          replaceEmpty: {
            slice: ContentSlice.fromJSON({
              content: [
                {
                  type: 'quote',
                  children: [
                    {
                      childRoots: { body: 'body:1' },
                      children: [{ text: '' }],
                      type: 'portal',
                    },
                  ],
                },
              ],
              openEnd: 0,
              openStart: 0,
              roots: { 'body:1': [paragraph('Body')] },
            }),
          },
        })),
      ],
    });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.value(), {
      children: [{ type: 'quote', children: [paragraph('Plain')] }],
    });
  });

  it('ignores a proposal when Plite resolved the target as context', () => {
    const forge = landing('forge-empty-target', (input, next) =>
      next({
        ...input,
        target: { block: [paragraph(''), [1]], kind: 'empty' },
      })
    );
    const editor = createEditor({
      initialSelection: caret([0, 0], 4),
      initialValue: [paragraph('Text'), paragraph('')],
      plugins: [LandingSchema, forge, proposeOnEmpty([media('Object')])],
    });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('!')])),
      true
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('Text!'),
      paragraph(''),
    ]);
  });

  it('replaces the block Plite resolved, not the one a middleware passed on', () => {
    const forge = landing('forge-other-block', (input, next) =>
      next({
        ...input,
        target: { block: [paragraph(''), [2]], kind: 'empty' },
      })
    );
    const editor = createEditor({
      initialSelection: caret([1, 0]),
      initialValue: [paragraph('Text'), paragraph(''), paragraph('')],
      plugins: [LandingSchema, forge, proposeOnEmpty([media('Object')])],
    });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.children(), [
      paragraph('Text'),
      media('Object'),
      paragraph(''),
    ]);
  });

  it('refuses a proposal that adds text past maxLength', () => {
    const editor = createEditor({
      initialSelection: caret([0, 0]),
      initialValue: [paragraph('')],
      maxLength: 0,
      plugins: [LandingSchema, proposeOnEmpty([paragraph('Added')])],
    });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([media('')])),
      true
    );
    assert.deepEqual(editor.read.children(), [media('')]);
  });

  it('limits a landing slice that adds text past maxLength', () => {
    const editor = createEditor({
      initialSelection: caret([0, 0]),
      initialValue: [paragraph('')],
      maxLength: 0,
      plugins: [
        LandingSchema,
        landing('add-text', () => ({
          slice: ContentSlice.closed([paragraph('Added')]),
        })),
      ],
    });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([media('')])),
      false
    );
    assert.deepEqual(editor.read.children(), [paragraph('')]);
  });

  for (const [head, omit, landed] of [
    [
      paragraph('Pasted', { align: 'left' }),
      undefined,
      paragraph('Pasted', { align: 'left', indent: 1 }),
    ],
    [paragraph('Pasted'), ['indent'], paragraph('Pasted', { align: 'center' })],
    [heading('Pasted'), undefined, { ...heading('Pasted'), indent: 1 }],
    [media('Pasted'), undefined, media('Pasted')],
  ] as const) {
    it(`lands a ${head.type} head${omit ? ' without omitted properties' : ''} with the target properties it may keep`, () => {
      const editor = createEditor({
        initialSelection: caret([0, 0]),
        initialValue: [paragraph('', { align: 'center', indent: 1 })],
        plugins: [
          LandingSchema,
          proposeOnEmpty([head], omit ? [...omit] : undefined),
        ],
      });

      assert.equal(
        editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
        true
      );
      assert.deepEqual(editor.read.children(), [landed]);
    });
  }

  it('resolves the target in the root that holds the caret', () => {
    const notesCaret = SelectionApi.text({
      anchor: { offset: 0, path: [0, 0], root: 'notes' },
      focus: { offset: 0, path: [0, 0], root: 'notes' },
    });
    const layouts = [
      { main: 'Body', notes: '' },
      { main: '', notes: 'note' },
    ];
    const targets = layouts.map(({ main, notes }) => {
      let seen: SliceLandingInput['target'] | undefined;
      const editor = createEditor({
        initialValue: {
          children: [paragraph(main)],
          roots: { notes: [paragraph(notes)] },
        },
        plugins: [
          NotesSchema,
          landing('record-target', (input, next) => {
            seen = input.target;

            return next();
          }),
        ],
      });

      editor.update.selection.set(notesCaret);
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]));

      return seen;
    });

    assert.deepEqual(targets, [
      { block: [paragraph(''), [0]], kind: 'empty', root: 'notes' },
      { block: [paragraph('note'), [0]], kind: 'context', root: 'notes' },
    ]);
  });

  it('resolves the target in the root an explicit target names, not the view root', () => {
    let seen: SliceLandingInput['target'] | undefined;
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { header: [paragraph('Head')], notes: [paragraph('')] },
      },
      plugins: [
        HeaderNotesSchema,
        landing('record-target', (input, next) => {
          seen = input.target;

          return next();
        }),
      ],
    });

    createEditorView(editor, { root: 'header' }).update.slice.replace(
      ContentSlice.closed([paragraph('Plain')]),
      { at: { offset: 0, path: [0, 0], root: 'notes' } }
    );

    assert.deepEqual(seen, {
      block: [paragraph(''), [0]],
      kind: 'empty',
      root: 'notes',
    });
  });

  it('keeps the properties of the empty block an explicit target names through a view', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('', { align: 'right' })],
        roots: { notes: [paragraph('', { align: 'left' })] },
      },
      plugins: [NotesSchema, proposeOnEmpty([paragraph('Head')])],
    });

    createEditorView(editor).update.slice.replace(
      ContentSlice.closed([paragraph('Plain')]),
      { at: { offset: 0, path: [0, 0], root: 'notes' } }
    );

    assert.deepEqual(editor.read.root('notes'), [
      paragraph('Head', { align: 'left' }),
    ]);
  });

  it('lands a paste dispatched through a named-root view in the view root', () => {
    const results = ['', 'KEEP'].map((header) => {
      const editor = createEditor({
        initialValue: {
          children: [paragraph('', { align: 'right' })],
          roots: {
            header: [paragraph(header, { align: 'left' })],
            notes: [paragraph('')],
          },
        },
        plugins: [HeaderNotesSchema, proposeOnEmpty([paragraph('Head')])],
      });

      dispatchCommand(
        createEditorView(editor, { root: 'header' }),
        editorCommands.replaceSlice,
        {
          options: { at: { offset: 0, path: [0, 0] } },
          slice: ContentSlice.closed([paragraph('Plain')]),
        }
      );

      return [editor.read.root('header'), editor.read.children()];
    });

    assert.deepEqual(results, [
      [
        [paragraph('Head', { align: 'left' })],
        [paragraph('', { align: 'right' })],
      ],
      [
        [paragraph('PlainKEEP', { align: 'left' })],
        [paragraph('', { align: 'right' })],
      ],
    ]);
  });

  it('replaces no empty block that content rules removed from the landing', () => {
    const results = [
      {
        children: [paragraph('Before'), paragraph('', { align: 'gone' })],
        path: [1, 0],
      },
      {
        children: [paragraph('', { align: 'gone' }), paragraph('After')],
        path: [0, 0],
      },
    ].map(({ children, path }) => {
      const editor = createEditor({
        initialSelection: caret(path),
        initialValue: children,
        plugins: [LandingSchema, proposeOnEmpty([paragraph('Head')])],
      });

      registerEditorContent(editor, (_reader, node) => node?.align !== 'gone');
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]));

      return editor.read.children();
    });

    assert.deepEqual(results, [
      [paragraph('BeforePlain'), paragraph('', { align: 'gone' })],
      [paragraph('', { align: 'gone' }), paragraph('PlainAfter')],
    ]);
  });

  it('keeps the properties of the empty block in the caret root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('', { align: 'right' })],
        roots: { notes: [paragraph('', { align: 'left' })] },
      },
      plugins: [NotesSchema, proposeOnEmpty([paragraph('Head')])],
    });

    editor.update.selection.set(
      SelectionApi.text({
        anchor: { offset: 0, path: [0, 0], root: 'notes' },
        focus: { offset: 0, path: [0, 0], root: 'notes' },
      })
    );

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.root('notes'), [
      paragraph('Head', { align: 'left' }),
    ]);
    assert.deepEqual(editor.read.children(), [
      paragraph('', { align: 'right' }),
    ]);
  });

  it('closes an open proposal whose roots it copied', () => {
    const editor = createEditor({
      initialSelection: caret([0, 0]),
      initialValue: [paragraph('')],
      plugins: [
        SharedPortalSchema,
        landing('propose-copied-root', (input, next) => ({
          ...next(),
          replaceEmpty: {
            slice: ContentSlice.fromJSON({
              content: [
                {
                  childRoots: { body: 'body:1' },
                  children: [{ text: 'Copied' }],
                  type: 'portal',
                },
              ],
              openEnd: 1,
              openStart: 1,
              roots: { 'body:1': [paragraph('Body')] },
            }),
          },
        })),
      ],
    });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.value(), {
      children: [
        {
          childRoots: { body: 'body:1:copy' },
          children: [{ text: 'Copied' }],
          type: 'portal',
        },
      ],
      roots: { 'body:1:copy': [paragraph('Body')] },
    });
  });

  it('admits a proposal against the children of the caret root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('A'), paragraph('B')],
        roots: { notes: [paragraph('')] },
      },
      plugins: [SingleNoteSchema, proposeOnEmpty([heading('Head')])],
    });

    editor.update.selection.set(
      SelectionApi.text({
        anchor: { offset: 0, path: [0, 0], root: 'notes' },
        focus: { offset: 0, path: [0, 0], root: 'notes' },
      })
    );

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.root('notes'), [heading('Head')]);
  });

  it('admits a nested proposal against its parent in the caret root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { notes: [{ type: 'quote', children: [paragraph('')] }] },
      },
      plugins: [NotesSchema, proposeOnEmpty([paragraph('Head')])],
    });

    editor.update.selection.set(
      SelectionApi.text({
        anchor: { offset: 0, path: [0, 0, 0], root: 'notes' },
        focus: { offset: 0, path: [0, 0, 0], root: 'notes' },
      })
    );

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.root('notes'), [
      { type: 'quote', children: [paragraph('Head')] },
    ]);
  });

  it('closes an open proposal that names an existing shared root', () => {
    const editor = createEditor({
      initialSelection: caret([1, 0]),
      initialValue: {
        children: [
          {
            childRoots: { body: 'body:1' },
            children: [{ text: '' }],
            type: 'portal',
          },
          paragraph(''),
        ],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [
        SharedPortalSchema,
        landing('propose-uncopied-root', (input, next) => ({
          ...next(),
          replaceEmpty: {
            slice: ContentSlice.fromJSON({
              content: [
                {
                  childRoots: { body: 'body:1' },
                  children: [{ text: 'Copied' }],
                  type: 'portal',
                },
              ],
              openEnd: 1,
              openStart: 1,
            }),
          },
        })),
      ],
    });

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.children(), [
      {
        childRoots: { body: 'body:1' },
        children: [{ text: '' }],
        type: 'portal',
      },
      {
        childRoots: { body: 'body:1' },
        children: [{ text: 'Copied' }],
        type: 'portal',
      },
    ]);
  });

  it('does not read an inherited object key as a copied root', () => {
    const portal = (root: string, label: string) => ({
      childRoots: { body: root },
      children: [{ text: label }],
      type: 'portal',
    });
    const results = ['constructor', 'toString'].map((name) => {
      const editor = createEditor({
        initialSelection: caret([1, 0]),
        initialValue: {
          children: [portal(name, ''), paragraph('')],
          roots: { [name]: [paragraph('Shared')] },
        },
        plugins: [
          SharedPortalSchema,
          landing('propose-inherited-root', (input, next) => ({
            ...next(),
            replaceEmpty: {
              slice: ContentSlice.fromJSON({
                content: [portal(name, 'A'), portal('copied', 'B')],
                openEnd: 1,
                openStart: 1,
                roots: { copied: [paragraph('Copied')] },
              }),
            },
          })),
        ],
      });

      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]));

      return editor.read.value();
    });

    assert.deepEqual(
      results,
      ['constructor', 'toString'].map((name) => ({
        children: [
          portal(name, ''),
          portal(name, 'A'),
          portal('copied:copy', 'B'),
        ],
        roots: {
          [name]: [paragraph('Shared')],
          'copied:copy': [paragraph('Copied')],
        },
      }))
    );
  });

  it('replaces an empty block in a named-root view', () => {
    const roots: Array<string | undefined> = [];
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { notes: [paragraph('')] },
      },
      plugins: [
        NotesSchema,
        landing('record-root', (input, next) => {
          roots.push(input.target.root);

          return next();
        }),
        proposeOnEmpty([heading('Head')]),
      ],
    });
    const notes = createEditorView(editor, { root: 'notes' });

    notes.update.selection.set(caret([0, 0]));

    assert.equal(
      notes.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(roots, ['notes']);
    assert.deepEqual(editor.read.root('notes'), [heading('Head')]);
    assert.deepEqual(editor.read.children(), [paragraph('Main')]);
  });

  it('shows a paste over selected blocks as a limited slice on the first block', () => {
    const seen: unknown[] = [];
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0], [2]], { mode: 'block' }),
      initialValue: [paragraph('aa'), paragraph('b'), paragraph('cc')],
      maxLength: 5,
      plugins: [
        LandingSchema,
        landing('record-input', (input, next) => {
          seen.push(input.source.content, input.slice.content, input.target);

          return next();
        }),
      ],
    });

    editor.update.slice.replace(ContentSlice.closed([paragraph('123456')]));

    assert.deepEqual(seen, [
      [paragraph('123456')],
      [paragraph('1234')],
      { block: [paragraph('aa'), [0]], kind: 'context' },
    ]);
    assert.deepEqual(editor.read.children(), [
      paragraph('1234'),
      paragraph('b'),
    ]);
  });

  it('reads the target root through the landing state from any editor', () => {
    const notesPoint = { offset: 0, path: [0, 0], root: 'notes' };
    const read = (
      dispatch: (editor: ReturnType<typeof createEditor>) => void
    ) => {
      let seen: unknown;
      const editor = createEditor({
        initialValue: {
          children: [paragraph('Main'), paragraph('More')],
          roots: { header: [paragraph('Head')], notes: [paragraph('Note')] },
        },
        plugins: [
          HeaderNotesSchema,
          definePlugin('record-state', {
            readMiddleware: ({ around }) => [
              around(editorReads.slice.landing, ({ input, next, state }) => {
                const path = input.target.block?.[1];

                seen = [
                  state.view.root(),
                  path && state.nodes.get(path)?.[0],
                  state.children().length,
                ];

                return next();
              }),
            ],
          }),
        ],
      });

      dispatch(editor);

      return seen;
    };
    const plain = ContentSlice.closed([paragraph('Plain')]);

    assert.deepEqual(
      [
        read((editor) => {
          editor.update.slice.replace(plain, { at: notesPoint });
        }),
        read((editor) => {
          createEditorView(editor, { root: 'header' }).update.slice.replace(
            plain,
            { at: notesPoint }
          );
        }),
        read((editor) => {
          createEditorView(createEditorView(editor, { root: 'header' }), {
            root: 'header',
          }).update.slice.replace(plain, { at: notesPoint });
        }),
        read((editor) => {
          editor.update.selection.set(
            SelectionApi.nodes([[0]], { mode: 'block', root: 'notes' })
          );
          editor.update.slice.replace(plain);
        }),
        read((editor) => {
          createEditorView(editor, { root: 'header' }).update.slice.replace(
            plain,
            { at: editor.read.key(editor.read.children()[0]) }
          );
        }),
      ],
      [
        ['notes', paragraph('Note'), 1],
        ['notes', paragraph('Note'), 1],
        ['notes', paragraph('Note'), 1],
        ['notes', paragraph('Note'), 1],
        [undefined, paragraph('Main'), 2],
      ]
    );
  });

  it('builds a state for another root only for a landing handler', () => {
    const readFactoryCalls = (withHandler: boolean) => {
      let calls = 0;
      const editor = createEditor({
        initialValue: {
          children: [paragraph('Main')],
          roots: { header: [paragraph('Head')], notes: [paragraph('Note')] },
        },
        plugins: [
          HeaderNotesSchema,
          definePlugin('count-reads', {
            read: () => {
              calls += 1;
              return {};
            },
          }),
          ...(withHandler
            ? [
                definePlugin('pass-landing', {
                  readMiddleware: ({ around }) => [
                    around(editorReads.slice.landing, ({ next }) => next()),
                  ],
                }),
              ]
            : []),
        ],
      });
      const paste = () =>
        editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]), {
          at: { offset: 0, path: [0, 0], root: 'notes' },
        });

      paste();
      const before = calls;
      paste();

      return calls - before;
    };

    assert.deepEqual([readFactoryCalls(false), readFactoryCalls(true)], [0, 1]);
  });

  it('proposes on the empty block a content rule leaves the paste in', () => {
    const editor = createEditor({
      initialSelection: caret([0, 0]),
      initialValue: [
        paragraph('', { align: 'gone' }),
        paragraph('', { align: 'live' }),
      ],
      plugins: [LandingSchema, proposeOnEmpty([paragraph('Head')])],
    });

    registerEditorContent(editor, (_reader, node) => node?.align !== 'gone');
    editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]));

    assert.deepEqual(editor.read.children(), [
      paragraph('', { align: 'gone' }),
      paragraph('Head', { align: 'live' }),
    ]);
  });

  it('gives an empty target where a hanging range or a node key lands', () => {
    const results = (['range', 'key'] as const).map((at) => {
      const editor = createEditor({
        initialValue: [paragraph(''), paragraph('After')],
        plugins: [LandingSchema, proposeOnEmpty([paragraph('Head')])],
      });
      const plain = ContentSlice.closed([paragraph('Plain')]);

      if (at === 'range') {
        editor.update.selection.set(
          SelectionApi.text({
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 0, path: [1, 0] },
          })
        );
        editor.update.slice.replace(plain);
      } else {
        editor.update.slice.replace(plain, {
          at: editor.read.key(editor.read.children()[0]),
        });
      }

      return editor.read.children();
    });

    assert.deepEqual(results, [
      [paragraph('Head'), paragraph('After')],
      [paragraph('Head'), paragraph('After')],
    ]);
  });

  it('joins open paste edges in an undeclared named root', () => {
    const results = ([2, 1, 0, 'key'] as const).map((at) => {
      const editor = createEditor({
        initialValue: {
          children: [paragraph('Body')],
          roots: { header: [paragraph('ab')] },
        },
      });

      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [paragraph('12')],
          openEnd: 1,
          openStart: 1,
        }),
        {
          at:
            at === 'key'
              ? editor.read.key(editor.read.root('header')[0])
              : { offset: at, path: [0, 0], root: 'header' },
        }
      );

      return [editor.read.root('header'), editor.read.children()];
    });

    assert.deepEqual(
      results,
      [
        paragraph('ab12'),
        paragraph('a12b'),
        paragraph('12ab'),
        paragraph('12ab'),
      ].map((header) => [[header], [paragraph('Body')]])
    );
  });

  it('joins open edges in an undeclared named root through the raw slice APIs', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Body')],
        roots: { notes: [paragraph('ab')] },
      },
    });
    const slice = ContentSlice.fromJSON({
      content: [paragraph('12')],
      openEnd: 1,
      openStart: 1,
    });
    const at = { offset: 1, path: [0, 0], root: 'notes' };
    const before = editor.read.value();
    const fitted = editor.read((state) => state.slice.fit(slice, { at }));

    editor.update((tx) => {
      tx.slice.replace(slice, { at });
    });

    assert.deepEqual(
      [
        fitted && fitted.changes.apply(before).roots?.notes,
        editor.read.root('notes'),
      ],
      [[paragraph('a12b')], [paragraph('a12b')]]
    );
  });

  it('reads earlier draft changes in the target root through the landing state', () => {
    const results = (['update', 'extend', 'projected'] as const).map(
      (draft) => {
        let seen: unknown;
        const editor = createEditor({
          initialValue: {
            children: [paragraph('Main')],
            roots: { notes: [paragraph('Note')] },
          },
          plugins: [
            NotesSchema,
            dom(),
            definePlugin('record-draft', {
              readMiddleware: ({ around }) => [
                around(editorReads.slice.landing, ({ input, next, state }) => {
                  const path = input.target.block?.[1];

                  seen = path && state.nodes.get(path)?.[0];

                  return next();
                }),
              ],
            }),
          ],
        });
        const at = { offset: 0, path: [0, 0], root: 'notes' };
        const input = {
          options: { at },
          slice: ContentSlice.closed([paragraph('Plain')]),
        };

        if (draft === 'update') {
          editor.update((tx) => {
            tx.text.insert('ZZ', { at });
            tx.command(editorCommands.replaceSlice, input);
          });
        } else if (draft === 'extend') {
          editor.read((state) => {
            const typed = state.transaction((tx) => {
              tx.text.insert('ZZ', { at });
            });

            state.transaction.extend(typed, () => {
              evaluateCommandWithState(
                editor,
                editorCommands.replaceSlice,
                getEditorStateView(editor),
                input
              );
            });
          });
        } else {
          const data = new Map([['text/plain', 'Plain']]);

          editor.read((state) => {
            const typed = state.transaction((tx) => {
              tx.text.insert('ZZ', { at });
              tx.selection.set({ anchor: at, focus: at });
            });

            state.transaction.extend(typed, () => {
              withEditorUpdateRootScope(editor, 'notes', () => {
                evaluateCommandWithState(
                  editor,
                  domCommands.insertData,
                  getEditorStateView(editor),
                  {
                    files: [] as unknown as FileList,
                    getData: (type: string) => data.get(type) ?? '',
                    types: [...data.keys()],
                  } as unknown as DataTransfer
                );
              });
            });
          });
        }

        return seen;
      }
    );

    assert.deepEqual(results, [
      paragraph('ZZNote'),
      paragraph('ZZNote'),
      paragraph('ZZNote'),
    ]);
  });

  it('lands a DOM paste over selected blocks in their root and its limit', () => {
    const seen: unknown[] = [];
    const editor = createEditor({
      initialValue: {
        children: [paragraph('mmmmmm')],
        roots: { notes: [paragraph('aa'), paragraph('b')] },
      },
      maxLength: 7,
      plugins: [
        NotesSchema,
        dom(),
        definePlugin('record-root', {
          readMiddleware: ({ around }) => [
            around(editorReads.slice.landing, ({ next, state }) => {
              seen.push(state.view.root(), state.children().length);

              return next();
            }),
          ],
        }),
      ],
    });
    const data = new Map([['text/plain', '1234567']]);

    editor.update.selection.set(
      SelectionApi.nodes([[0]], { mode: 'block', root: 'notes' })
    );
    editor.api.dom.clipboard.insertData({
      files: [] as unknown as FileList,
      getData: (type: string) => data.get(type) ?? '',
      types: [...data.keys()],
    } as unknown as DataTransfer);

    assert.deepEqual(seen, ['notes', 2]);
    assert.deepEqual(editor.read.root('notes'), [
      paragraph('123456'),
      paragraph('b'),
    ]);
    assert.deepEqual(editor.read.children(), [paragraph('mmmmmm')]);
  });

  it('trims plugin output past the length limit to the limit', () => {
    const run = (
      initialSelection:
        | ReturnType<typeof caret>
        | ReturnType<typeof SelectionApi.nodes>,
      content: Descendant[]
    ) => {
      const editor = createEditor({
        initialSelection,
        initialValue: [paragraph('ab'), paragraph('c')],
        maxLength: 5,
        plugins: [
          LandingSchema,
          landing('grow', () => ({
            slice: ContentSlice.fromJSON({ content, openEnd: 1, openStart: 1 }),
          })),
        ],
      });

      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [paragraph('1')],
          openEnd: 1,
          openStart: 1,
        })
      );

      return editor.read.children();
    };

    assert.deepEqual(
      [
        run(caret([0, 0], 2), [paragraph('WXYZQ')]),
        run(SelectionApi.nodes([[0]], { mode: 'block' }), [paragraph('WXYZQ')]),
        run(SelectionApi.nodes([[0]], { mode: 'block' }), [
          paragraph('WX'),
          paragraph('YZQ'),
        ]),
      ],
      [
        [paragraph('abWX'), paragraph('c')],
        [paragraph('WXYZ'), paragraph('c')],
        [paragraph('WX'), paragraph('YZ'), paragraph('c')],
      ]
    );
  });

  it('replaces a selected object block whole with an open paste', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: [media('cap'), paragraph('tail')],
      plugins: [LandingSchema],
    });

    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [paragraph('12'), paragraph('34')],
        openEnd: 1,
        openStart: 1,
      })
    );

    assert.deepEqual(
      [editor.read.children(), editor.read.selection()],
      [
        [paragraph('12'), paragraph('34'), paragraph('tail')],
        {
          anchor: { offset: 2, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        },
      ]
    );
  });

  it('copies the content roots a paste carries over a selected block', () => {
    const portal = (root: string) => ({
      childRoots: { body: root },
      children: [{ text: 'P' }],
      type: 'portal',
    });
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: [paragraph('aa'), paragraph('')],
      plugins: [LandingSchema],
    });

    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [portal('body:1')],
        openEnd: 0,
        openStart: 0,
        roots: { 'body:1': [paragraph('Body')] },
      })
    );

    assert.deepEqual(editor.read.value(), {
      children: [portal('body:1:copy'), paragraph('')],
      roots: { 'body:1:copy': [paragraph('Body')] },
    });
  });

  it('keeps the block that owns copied roots when an open paste replaces a selected block', () => {
    const portal = (root: string) => ({
      childRoots: { body: root },
      children: [{ text: 'P' }],
      type: 'portal',
    });
    const copied = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      }),
      initialValue: {
        children: [portal('body:1'), paragraph('tail')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    }).read.slice.export();
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: [paragraph('aa'), paragraph('')],
      plugins: [LandingSchema],
    });

    editor.update.slice.replace(copied);

    assert.deepEqual(editor.read.value(), {
      children: [portal('body:1:copy'), paragraph('')],
      roots: { 'body:1:copy': [paragraph('Body')] },
    });
  });

  it('deletes the selected blocks an empty paste replaces', () => {
    const results = [[[0]], [[1]], [[0], [1]]].map((paths) => {
      const editor = createEditor({
        initialSelection: SelectionApi.nodes(paths as [number[]], {
          mode: 'block',
        }),
        initialValue: [paragraph('abc'), paragraph('def')],
      });

      return [
        editor.update.slice.replace(ContentSlice.empty),
        editor.read.children(),
        editor.read.selection(),
      ];
    });

    const at = (offset: number) => ({ offset, path: [0, 0] });

    assert.deepEqual(results, [
      [true, [paragraph('def')], { anchor: at(0), focus: at(0) }],
      [true, [paragraph('abc')], { anchor: at(3), focus: at(3) }],
      [true, [], null],
    ]);
  });

  const pasteEmptyOverLastNote = (
    notes: Array<ReturnType<typeof paragraph>>
  ) => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[notes.length - 1]], {
        mode: 'block',
        root: 'notes',
      }),
      initialValue: {
        children: [paragraph('m1'), paragraph('m2'), paragraph('m3')],
        roots: { notes },
      },
      plugins: [NotesSchema],
    });

    return [
      editor.update.slice.replace(ContentSlice.empty),
      editor.read.root('notes'),
      editor.read.selection(),
    ];
  };

  it('deletes the last selected block of a named root on an empty paste', () => {
    const at = { offset: 2, path: [0, 0], root: 'notes' };

    assert.deepEqual(
      pasteEmptyOverLastNote([paragraph('bc'), paragraph('de')]),
      [true, [paragraph('bc')], { anchor: at, focus: at }]
    );
  });

  it('empties the only selected block of a named root on an empty paste', () => {
    assert.deepEqual(pasteEmptyOverLastNote([paragraph('bc')]), [
      true,
      [paragraph('')],
      null,
    ]);
  });

  it('deletes the quote around the only paragraph an empty paste replaces', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[1, 0]], { mode: 'block' }),
      initialValue: [
        paragraph('bc'),
        { type: 'quote', children: [paragraph('ghij')] },
      ],
      plugins: [LandingSchema],
    });
    const at = { offset: 2, path: [0, 0] };

    assert.deepEqual(
      [
        editor.update.slice.replace(ContentSlice.empty),
        editor.read.children(),
        editor.read.selection(),
      ],
      [true, [paragraph('bc')], { anchor: at, focus: at }]
    );
  });

  it('lands the text of an open block whose content roots the paste does not carry over a selected block', () => {
    const portal = (root: string) => ({
      childRoots: { body: root },
      children: [{ text: 'P' }],
      type: 'portal',
    });
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[1]], { mode: 'block' }),
      initialValue: {
        children: [portal('body:1'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });

    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [portal('body:1')],
        openEnd: 1,
        openStart: 1,
      })
    );

    assert.deepEqual(editor.read.value(), {
      children: [portal('body:1'), paragraph('P')],
      roots: { 'body:1': [paragraph('Body')] },
    });
  });

  it('replaces a selected block that owns an exclusive root with another owner of that root', () => {
    const portal = (caption: string) => ({
      childRoots: { body: 'body:1' },
      children: [{ text: caption }],
      type: 'portal',
    });
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: {
        children: [portal('P'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(ContentSlice.closed([portal('Q')])),
        editor.read.value(),
      ],
      [
        true,
        {
          children: [portal('Q'), paragraph('aa')],
          roots: { 'body:1': [paragraph('Body')] },
        },
      ]
    );
  });

  it('refuses a paste over selected blocks that adds a second owner of an exclusive root', () => {
    const { after, before, result } = pasteOutcome(
      createEditor({
        initialSelection: SelectionApi.nodes([[1]], { mode: 'block' }),
        initialValue: {
          children: [rootOwner('body:1'), paragraph('aa')],
          roots: { 'body:1': [paragraph('Body')] },
        },
        plugins: [LandingSchema],
      }),
      ContentSlice.closed([rootOwner('body:1')])
    );

    assert.deepEqual([result, after], [false, before]);
  });

  it('lands a second owner of a shared root over selected blocks', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[1]], { mode: 'block' }),
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [SharedPortalSchema],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(ContentSlice.closed([rootOwner('body:1')])),
        editor.read.value(),
      ],
      [
        true,
        {
          children: [rootOwner('body:1'), rootOwner('body:1')],
          roots: { 'body:1': [paragraph('Body')] },
        },
      ]
    );
  });

  it('refuses a paste over selected blocks that names a root the document lacks', () => {
    const { after, before, result } = pasteOutcome(
      createEditor({
        initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
        initialValue: [paragraph('aa')],
        plugins: [LandingSchema],
      }),
      ContentSlice.closed([rootOwner('body:missing')])
    );

    assert.deepEqual([result, after], [false, before]);
  });

  it('refuses a paste whose copied root holds a block naming a root the paste lacks', () => {
    const { after, before, result } = pasteOutcome(
      createEditor({
        initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
        initialValue: [paragraph('aa')],
        plugins: [NestedPortalSchema],
      }),
      ContentSlice.fromJSON({
        content: [rootOwner('body:1')],
        openEnd: 0,
        openStart: 0,
        roots: { 'body:1': [rootOwner('body:missing')] },
      })
    );

    assert.deepEqual([result, after], [false, before]);
  });

  it('refuses a paste over selected blocks whose nested blocks break the schema', () => {
    const { after, before, result } = pasteOutcome(
      createEditor({
        initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
        initialValue: [paragraph('aa')],
        plugins: [LandingSchema],
      }),
      ContentSlice.closed([{ type: 'quote', children: [heading('x')] }])
    );

    assert.deepEqual([result, after], [false, before]);
  });

  it('refuses a paste over the only owner of a shared root', () => {
    const { after, before, result } = pasteOutcome(
      createEditor({
        initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
        initialValue: {
          children: [rootOwner('body:1'), paragraph('aa')],
          roots: { 'body:1': [paragraph('Body')] },
        },
        plugins: [SharedPortalSchema],
      }),
      ContentSlice.closed([paragraph('x')])
    );

    assert.deepEqual([result, after], [false, before]);
  });

  it('drops the exclusive root of the only owner a paste replaces', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(ContentSlice.closed([paragraph('x')])),
        editor.read.value(),
      ],
      [true, { children: [paragraph('x'), paragraph('aa')] }]
    );
  });

  it('lands a paste carrying roots over a range that holds the owner of an exclusive root', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [1, 0] },
      }),
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(
          ContentSlice.fromJSON({
            content: [rootOwner('body:1')],
            openEnd: 0,
            openStart: 0,
            roots: { 'body:1': [paragraph('X')] },
          })
        ),
        editor.read.value(),
      ],
      [
        true,
        {
          children: [rootOwner('body:1:copy'), paragraph('aa')],
          roots: { 'body:1:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('lands the plain paste when a closed proposal adds a second owner of an exclusive root', () => {
    const editor = createEditor({
      initialSelection: caret([1, 0]),
      initialValue: {
        children: [rootOwner('body:1'), paragraph('')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema, proposeOnEmpty([rootOwner('body:1', 'Copied')])],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
        editor.read.children(),
      ],
      [true, [rootOwner('body:1'), paragraph('Plain')]]
    );
  });

  it('lands a paste carrying a root after an earlier step in its update', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa'), paragraph('bb')],
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.insert(paragraph('new'), { at: [2] });
      result = tx.slice.replace(carried('body:1'), {
        at: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 2, path: [1, 0] },
        },
      });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [
            paragraph('aa'),
            rootOwner('body:1:copy'),
            paragraph('new'),
          ],
          roots: { 'body:1:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('drops an exclusive root an earlier step orphaned when a slice write lands', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      result = tx.slice.replace(carried('src'), {
        at: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
      });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [rootOwner('src:copy')],
          roots: { 'src:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('keeps an exclusive root whose owner a later step restores after a paste elsewhere', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa'), paragraph('cc')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
      tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }));
      result = tx.command(editorCommands.replaceSlice, {
        slice: ContentSlice.closed([paragraph('x')]),
      });
      tx.nodes.insert(rootOwner('body:1'), { at: [0] });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [rootOwner('body:1'), paragraph('x'), paragraph('cc')],
          roots: { 'body:1': [paragraph('Body')] },
        },
      ]
    );
  });

  it('lands a paste over selected blocks while an earlier step leaves a second exclusive owner that a later step removes', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa'), paragraph('cc')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.insert(rootOwner('body:1', 'dup'), { at: [3] });
      tx.selection.set(SelectionApi.nodes([[1]], { mode: 'block' }));
      result = tx.command(editorCommands.replaceSlice, {
        slice: ContentSlice.closed([paragraph('x')]),
      });
      tx.nodes.remove({ at: [3] });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [rootOwner('body:1'), paragraph('x'), paragraph('cc')],
          roots: { 'body:1': [paragraph('Body')] },
        },
      ]
    );
  });

  it('lands a paste over selected blocks while an earlier step leaves an owner missing its roots that a later step removes', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa'), paragraph('cc')],
      plugins: [LandingSchema],
    });
    let result: boolean | undefined;

    editor.update((tx) => {
      tx.nodes.insert(
        { children: [{ text: 'P' }], type: 'portal' },
        { at: [2] }
      );
      tx.selection.set(SelectionApi.nodes([[0]], { mode: 'block' }));
      result = tx.command(editorCommands.replaceSlice, {
        slice: ContentSlice.closed([paragraph('x')]),
      });
      tx.nodes.remove({ at: [2] });
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [true, { children: [paragraph('x'), paragraph('cc')] }]
    );
  });

  it('lands a closed embed pasted mid-paragraph as text and drops its carried root', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      }),
      initialValue: [paragraph('aa')],
      plugins: [LandingSchema],
    });

    const result = editor.update.slice.replace(carried('src'));

    assert.deepEqual(
      [result, editor.read.value()],
      [true, { children: [paragraph('aPa')] }]
    );
  });

  it('lands a paste carrying a root dispatched at a caret outside an update', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      }),
      initialValue: [paragraph('aa'), paragraph('')],
      plugins: [LandingSchema],
    });

    const result = dispatchCommand(editor, editorCommands.replaceSlice, {
      slice: carried('src'),
    });

    assert.deepEqual(
      [result, editor.read.value()],
      [
        true,
        {
          children: [paragraph('aa'), rootOwner('src:copy')],
          roots: { 'src:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('drops a root an earlier slice write created when a later one replaces its owner', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa'), paragraph('cc')],
      plugins: [SharedPortalSchema],
    });
    let results: boolean[] = [];

    editor.update((tx) => {
      results = [
        tx.slice.replace(carried('first'), {
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 2, path: [0, 0] },
          },
        }),
        tx.slice.replace(carried('second'), {
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
        }),
      ];
    });

    assert.deepEqual(
      [results, editor.read.value()],
      [
        [true, true],
        {
          children: [rootOwner('second:copy'), paragraph('cc')],
          roots: { 'second:copy': [paragraph('X')] },
        },
      ]
    );
  });

  it('moves a range holding the owner of an exclusive root to a block edge', () => {
    const editor = createEditor({
      initialValue: {
        children: [rootOwner('body:1'), paragraph('aa'), paragraph('cc')],
        roots: { 'body:1': [paragraph('Body')] },
      },
      plugins: [LandingSchema, transfer()],
    });

    const moved = editor.api.transfer.move({
      range: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 1, path: [1, 0] },
      },
      to: { edge: 'after', key: editor.key([2]) },
    });

    assert.deepEqual(
      [moved.status, editor.read.value()],
      [
        'moved',
        {
          children: [
            paragraph('a'),
            paragraph('cc'),
            rootOwner('body:1:copy'),
            paragraph('a'),
          ],
          roots: { 'body:1:copy': [paragraph('Body')] },
        },
      ]
    );
  });

  it('writes the proposal for an empty block when the limit empties the landing output', () => {
    const editor = createEditor({
      initialSelection: caret([1, 0]),
      initialValue: [paragraph('Full'), paragraph('')],
      maxLength: 4,
      plugins: [
        LandingSchema,
        landing('propose', () => ({
          replaceEmpty: {
            slice: ContentSlice.closed([paragraph('', { align: 'center' })]),
          },
          slice: ContentSlice.closed([paragraph('X')]),
        })),
      ],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(ContentSlice.closed([paragraph('')])),
        editor.read.children(),
      ],
      [true, [paragraph('Full'), paragraph('', { align: 'center' })]]
    );
  });

  it('lands an implicit paste at the caret the target runtime reports in a command frame', () => {
    const struck = {
      authored: [{ at: 1, author: 'carol', change: 'carol:1', kind: 'delete' }],
      text: 'xyz',
    };
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'ab' }, struck, { text: 'cd' }],
        },
      ],
      plugins: [
        LandingSchema,
        createAuthoredPlugin({ authorId: 'bob', intent: 'edit' }),
      ],
    });

    setTargetRuntime(editor, {
      resolveImplicitTarget: () => caret([0, 2], 1),
    });
    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [paragraph('Q')],
        openEnd: 1,
        openStart: 1,
      })
    );

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [{ text: 'ab' }, struck, { text: 'cQd' }],
      },
    ]);
  });

  it('refuses a paste over selected blocks when the limit cuts the landing output to nothing', () => {
    const ImageSchema = defineEditorSchema('schema:slice-landing-image', {
      elements: {
        image: { void: 'block' },
        paragraph: { content: text() },
      },
      root: schema.content.types(['paragraph', 'image'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
    });
    const before = [
      { type: 'image', children: [{ text: '' }] },
      paragraph('abcde'),
    ];
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
      initialValue: before,
      maxLength: 5,
      plugins: [
        ImageSchema,
        landing('grow', () => ({
          slice: ContentSlice.closed([paragraph('X')]),
        })),
      ],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(ContentSlice.closed([paragraph('')])),
        editor.read.children(),
      ],
      [false, before]
    );
  });

  it('refuses a paste over a range when the limit cuts the landing output to nothing', () => {
    const editor = createEditor({
      initialSelection: SelectionApi.text({
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      }),
      initialValue: [paragraph('abcde')],
      maxLength: 3,
      plugins: [
        LandingSchema,
        landing('grow', () => ({
          slice: ContentSlice.closed([paragraph('X')]),
        })),
      ],
    });

    assert.deepEqual(
      [
        editor.update.slice.replace(ContentSlice.closed([paragraph('')])),
        editor.read.children(),
      ],
      [false, [paragraph('abcde')]]
    );
  });

  it('lands an implicit paste in the root of the caret the target runtime reports, within that root', () => {
    const seen: unknown[] = [];
    const editor = createEditor({
      initialValue: {
        children: [paragraph('a')],
        roots: { header: [paragraph('h')], notes: [paragraph('abcd')] },
      },
      maxLength: 5,
      plugins: [
        HeaderNotesSchema,
        definePlugin('record-roots', {
          readMiddleware: ({ around }) => [
            around(editorReads.slice.landing, ({ input, next, state }) => {
              seen.push([input.target.root, state.view.root()]);

              return next();
            }),
          ],
        }),
      ],
    });

    setTargetRuntime(editor, {
      resolveImplicitTarget: () =>
        SelectionApi.text({
          anchor: { offset: 1, path: [0, 0], root: 'notes' },
          focus: { offset: 1, path: [0, 0], root: 'notes' },
        }),
    });
    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [paragraph('1234')],
        openEnd: 1,
        openStart: 1,
      })
    );

    assert.deepEqual(
      [editor.read.root('notes'), seen],
      [[paragraph('a1bcd')], [['notes', 'notes']]]
    );
  });

  it('keeps the paste options over a selected inline node', () => {
    const MentionSchema = defineEditorSchema('schema:slice-landing-mention', {
      elements: {
        mention: { void: 'inline' },
        paragraph: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('mention')],
            { default: 'text', min: 1 }
          ),
        },
      },
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
    });
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0, 1]], { mode: 'block' }),
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'a' },
            { type: 'mention', children: [{ text: '' }] },
            { text: 'b' },
          ],
        },
      ],
      plugins: [MentionSchema],
    });

    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [paragraph('X')],
        openEnd: 1,
        openStart: 1,
      }),
      { voids: true }
    );

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [
          { text: 'a' },
          { type: 'mention', children: [{ text: 'X' }] },
          { text: 'b' },
        ],
      },
    ]);
  });

  it('lands an implicit paste at the caret the target runtime reports', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa'), paragraph('bb')],
      plugins: [LandingSchema],
    });

    setTargetRuntime(editor, { resolveImplicitTarget: () => caret([0, 0], 1) });
    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [paragraph('X')],
        openEnd: 1,
        openStart: 1,
      })
    );

    assert.deepEqual(editor.read.children(), [
      paragraph('aXa'),
      paragraph('bb'),
    ]);
  });

  it('reads the target root when a root view evaluates a paste with the owner state', () => {
    const seen: unknown[] = [];
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { header: [paragraph('Head')], notes: [paragraph('Note')] },
      },
      plugins: [
        HeaderNotesSchema,
        definePlugin('record-roots', {
          readMiddleware: ({ around }) => [
            around(editorReads.slice.landing, ({ input, next, state }) => {
              seen.push([input.target.root, state.view.root()]);

              return next();
            }),
          ],
        }),
      ],
    });

    editor.read(() => {
      evaluateCommandWithState(
        createEditorView(editor, { root: 'header' }),
        editorCommands.replaceSlice,
        getEditorStateView(editor),
        {
          options: { at: { offset: 0, path: [0, 0] } },
          slice: ContentSlice.closed([paragraph('Plain')]),
        }
      );
    });

    assert.deepEqual(seen, [[undefined, undefined]]);
  });

  it('replaces a selected void or empty container whole', () => {
    const ContainerSchema = defineEditorSchema(
      'schema:slice-landing-container',
      {
        elements: {
          box: {
            content: schema.content.type('paragraph', { min: 0 }),
          },
          image: { void: 'block' },
          paragraph: { content: text() },
        },
        root: schema.content.types(['paragraph', 'box', 'image'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
      }
    );
    const results = [
      { type: 'box', children: [] },
      { type: 'image', children: [{ text: '' }] },
    ].map((selected) => {
      const editor = createEditor({
        initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
        initialValue: [selected, paragraph('tail')],
        plugins: [ContainerSchema],
      });

      editor.update.slice.replace(ContentSlice.closed([paragraph('X')]));

      return editor.read.children();
    });

    assert.deepEqual(results, [
      [paragraph('X'), paragraph('tail')],
      [paragraph('X'), paragraph('tail')],
    ]);
  });

  it('inserts at a block boundary beside an empty block without replacing it', () => {
    const seen: unknown[] = [];
    const editor = createEditor({
      initialValue: [paragraph('')],
      plugins: [
        LandingSchema,
        landing('record-target', (input, next) => {
          seen.push(input.target);

          return next();
        }),
        proposeOnEmpty([paragraph('Head')]),
      ],
    });

    editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]), {
      at: [1],
    });

    assert.deepEqual(seen, [{ block: null, kind: 'context' }]);
    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      paragraph('Plain'),
    ]);
  });
});

describe('slice landing intent', () => {
  it('tells the landing read whether each caller copies or moves', () => {
    const intentsOf = (
      caller: 'drop copy' | 'drop move' | 'nodes' | 'paste'
    ) => {
      const intents: unknown[] = [];
      const editor = createEditor({
        initialSelection:
          caller === 'nodes'
            ? SelectionApi.nodes([[1]], { mode: 'block' })
            : caret([0, 0], 1),
        initialValue: [paragraph('ab'), paragraph('cd')],
        plugins: [
          LandingSchema,
          transfer(),
          landing('record-intent', (input, next) => {
            intents.push(input.intent);

            return next();
          }),
        ],
      });

      if (caller === 'paste' || caller === 'nodes') {
        editor.update.slice.replace(ContentSlice.closed([paragraph('x')]));
      } else {
        editor.api.transfer[caller === 'drop copy' ? 'copy' : 'move']({
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
          to: { point: { offset: 1, path: [1, 0] } },
        });
      }

      return intents;
    };

    assert.deepEqual(
      (['paste', 'nodes', 'drop copy', 'drop move'] as const).map(intentsOf),
      [['copy'], ['copy'], ['copy'], ['move']]
    );
  });
});
