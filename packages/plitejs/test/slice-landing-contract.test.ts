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
} from 'plitejs';
import { history } from 'plitejs/history';

import { dispatchCommand } from '../src/core/command-registry';
import { registerEditorContent } from '../src/core/content';

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

  it('fits the landing slice when an open proposal names a root it did not copy', () => {
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
      paragraph('Plain'),
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

      return editor.read.children();
    });

    assert.deepEqual(results, [
      [portal('constructor', ''), paragraph('Plain')],
      [portal('toString', ''), paragraph('Plain')],
    ]);
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
});
