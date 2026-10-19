import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  definePlugin,
  editorReads,
  schema,
  SelectionApi,
} from 'plitejs';

import { dom } from '../src/dom';
import { createDataTransfer } from '../src/testing/createDataTransfer';
import {
  text,
  paragraph,
  heading,
  media,
  LandingSchema,
  NotesSchema,
  SharedPortalSchema,
  NestedPortalSchema,
  rootOwner,
  pasteOutcome,
} from './support/slice-landing';

describe('paste over selected blocks', () => {
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
    editor.update.selection.set(
      SelectionApi.nodes([[0]], { mode: 'block', root: 'notes' })
    );
    editor.api.dom.clipboard.insertData(
      createDataTransfer(new Map([['text/plain', '1234567']]))
    );

    assert.deepEqual(seen, ['notes', 2]);
    assert.deepEqual(editor.read.root('notes'), [
      paragraph('123456'),
      paragraph('b'),
    ]);
    assert.deepEqual(editor.read.children(), [paragraph('mmmmmm')]);
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

  it('drops the root of the only owner a paste replaces in a closed schema', () => {
    const landed = [true, { children: [paragraph('x'), paragraph('aa')] }];

    assert.deepEqual(
      [SharedPortalSchema, LandingSchema].map((plugin) => {
        const editor = createEditor({
          initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
          initialValue: {
            children: [rootOwner('body:1'), paragraph('aa')],
            roots: { 'body:1': [paragraph('Body')] },
          },
          plugins: [plugin],
        });

        return [
          editor.update.slice.replace(ContentSlice.closed([paragraph('x')])),
          editor.read.value(),
        ];
      }),
      [landed, landed]
    );
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
});
