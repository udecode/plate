import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  type Descendant,
  schema,
  SelectionApi,
  transfer,
} from 'plitejs';
import { history } from 'plitejs/history';

import {
  text,
  paragraph,
  heading,
  media,
  LandingSchema,
  NotesSchema,
  SharedPortalSchema,
  rootOwner,
  caret,
  landing,
  proposeOnEmpty,
} from './support/slice-landing';

describe('slice landing', () => {
  it('replaces the resolved empty block with an admitted proposal', () => {
    const before = [paragraph('Before'), paragraph(''), paragraph('After')];
    const editor = createEditor({
      initialSelection: caret([1, 0]),
      initialValue: before,
      plugins: [LandingSchema, history(), proposeOnEmpty([paragraph('Head')])],
    });
    const keys = [0, 1, 2].map((index) => editor.key([index]));
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
      [0, 1, 2].map((index) => editor.key([index]) === keys[index]),
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
