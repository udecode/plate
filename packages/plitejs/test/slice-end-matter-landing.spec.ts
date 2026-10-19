import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  editorReads,
  schema,
  SelectionApi,
  type Descendant,
} from 'plitejs';
import { history } from 'plitejs/history';

import { getEditorSchema } from '../src/core/editor-runtime';
import { fitSlicePlacements } from '../src/core/public-state';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const note = (text: string) => ({
  type: 'endnote',
  children: [paragraph(text)],
});
const container = (children: readonly Descendant[]) => ({
  type: 'container',
  children,
});
const range = (path: number[], offset = 0) => ({
  anchor: { path, offset },
  focus: { path, offset },
});
const caret = (path: number[], offset = 0) =>
  SelectionApi.text(range(path, offset));
const noteSchema = (endMatter = true, nestedOnly = false) => {
  const blocks = () =>
    schema.content.types(['paragraph', 'container', 'endnote', 'portal'], {
      default: { type: 'paragraph' },
      min: 1,
    });
  return defineEditorSchema('endnote-landing', {
    id: 'endnote-landing',
    version: 1,
    unknown: 'reject',
    elements: {
      paragraph: { content: schema.content.text({ min: 1, default: 'text' }) },
      container: { content: blocks() },
      endnote: {
        content: blocks(),
        ...(endMatter ? { slice: { endMatter: true } } : {}),
      },
      portal: {
        content: schema.content.text({ min: 1, default: 'text' }),
        object: true,
        contentRoots: {
          body: {
            content: schema.content.types(
              ['paragraph', 'container', 'endnote'],
              {
                default: { type: 'paragraph' },
                min: 1,
              }
            ),
            ownership: 'exclusive',
          },
        },
      },
    },
    root: nestedOnly
      ? schema.content.types(['paragraph', 'container'], {
          default: { type: 'paragraph' },
          min: 1,
        })
      : blocks(),
  });
};

describe('end matter landing', () => {
  for (const method of ['fragment', 'slice', 'transaction'] as const) {
    it(`lands endnotes after the document through ${method}`, () => {
      const before = [
        container([paragraph('abcd')]),
        paragraph('tail'),
        paragraph(''),
        paragraph(''),
      ];
      const selection = caret([0, 0, 0], 2);
      const editor = createEditor({
        plugins: [noteSchema(), history()],
        initialValue: before,
        initialSelection: selection,
      });
      const content = [paragraph('X'), note('NOTE')];
      if (method === 'fragment') editor.update.fragment.replace(content);
      else if (method === 'slice') {
        editor.update.slice.replace(ContentSlice.closed(content));
      } else {
        editor.update((tx) => tx.slice.replace(ContentSlice.closed(content)));
      }
      assert.deepEqual(editor.read.children(), [
        container([paragraph('abXcd')]),
        paragraph('tail'),
        note('NOTE'),
        paragraph(''),
        paragraph(''),
      ]);
      assert.deepEqual(editor.read.selection(), range([0, 0, 0], 3));
      editor.api.history.undo();
      assert.deepEqual(
        [editor.read.children(), editor.read.selection()],
        [before, range([0, 0, 0], 2)]
      );
      editor.api.history.redo();
      editor.api.history.undo();
      assert.deepEqual(
        [editor.read.children(), editor.read.selection()],
        [before, range([0, 0, 0], 2)]
      );
    });
  }

  it('lands a hanging paste and its endnotes in the named root that holds the site', () => {
    const at = { offset: 1, path: [0, 0], root: 'caption' };
    const editor = createEditor({
      plugins: [noteSchema()],
      initialValue: {
        children: [
          paragraph('main'),
          paragraph('more'),
          paragraph('last'),
          {
            type: 'portal',
            children: [{ text: 'P' }],
            childRoots: { body: 'caption' },
          },
        ],
        roots: { caption: [paragraph('ab')] },
      },
      initialSelection: SelectionApi.text({ anchor: at, focus: at }),
    });
    assert.equal(
      editor.update.fragment.replace([paragraph('X'), note('NOTE')], {
        hanging: true,
      }),
      true
    );
    const after = { offset: 2, path: [0, 0], root: 'caption' };
    assert.deepEqual(
      [editor.read.value().roots, editor.read.selection()],
      [
        { caption: [paragraph('aXb'), note('NOTE')] },
        { anchor: after, focus: after },
      ],
      'the hanging paste and its caret land in the named root'
    );
  });

  it('replaces a selected block and removes a selected note whole', () => {
    for (const selected of [paragraph('old'), note('old')]) {
      const editor = createEditor({
        plugins: [noteSchema()],
        initialValue: [selected, paragraph('tail')],
        initialSelection: SelectionApi.nodes([[0]], { mode: 'block' }),
      });
      assert.equal(editor.update.fragment.replace([note('new')]), true);
      assert.deepEqual(editor.read.children(), [
        paragraph('tail'),
        note('new'),
      ]);
    }
  });

  it('keeps the caret when a lone note is pasted into an empty trailing block', () => {
    const editor = createEditor({
      plugins: [noteSchema()],
      initialValue: [paragraph('body'), paragraph('')],
      initialSelection: caret([1, 0]),
    });
    editor.update.fragment.replace([note('new')]);
    assert.deepEqual(
      [editor.read.children(), editor.read.selection()],
      [[paragraph('body'), note('new'), paragraph('')], range([2, 0])]
    );
  });

  for (const [site, selection] of [
    ['caret', caret([2, 0])],
    ['selected block', SelectionApi.nodes([[2]], { mode: 'block' })],
  ] as const) {
    it(`puts the flow at its empty ${site} and the notes after it`, () => {
      const editor = createEditor({
        plugins: [noteSchema()],
        initialValue: [paragraph('body'), paragraph(''), paragraph('')],
        initialSelection: selection,
      });
      editor.update.fragment.replace([paragraph('X'), note('N')]);
      assert.deepEqual(
        [editor.read.children(), editor.read.selection()],
        [
          [paragraph('body'), paragraph(''), paragraph('X'), note('N')],
          range([2, 0], 1),
        ],
        'the flow stays at its empty site, before the notes'
      );
    });
  }

  it('lands a lone note before the empty paragraphs left once its selected block goes', () => {
    const editor = createEditor({
      plugins: [noteSchema()],
      initialValue: [paragraph('a'), paragraph(''), paragraph('')],
      initialSelection: SelectionApi.nodes([[2]], { mode: 'block' }),
    });
    editor.update.fragment.replace([note('N')]);
    assert.deepEqual(
      editor.read.children(),
      [paragraph('a'), note('N'), paragraph('')],
      'the note lands before the trailing empty paragraph'
    );
  });

  for (const [text, offset, flow, kept] of [
    ['abcd', 1, [], 'a'],
    ['hello', 2, [paragraph('X')], 'heX'],
  ] as const) {
    it(`replaces an expanded site that crosses the note boundary with ${flow.length} flow blocks and keeps the note`, () => {
      const editor = createEditor({
        plugins: [noteSchema()],
        initialValue: [paragraph(text), paragraph('')],
        initialSelection: SelectionApi.text({
          anchor: { path: [0, 0], offset },
          focus: { path: [1, 0], offset: 0 },
        }),
      });
      editor.update.fragment.replace([...flow, note('new')]);
      assert.deepEqual(
        [editor.read.children(), editor.read.selection()],
        [[paragraph(kept), note('new')], range([0, 0], kept.length)],
        'the replaced range keeps the pasted note'
      );
    });
  }

  const title = { type: 'title', children: [{ text: '' }] };

  for (const [site, selection, landed] of [
    [
      'a caret',
      caret([2, 0]),
      [title, paragraph(''), note('N'), paragraph('')],
    ],
    [
      'a selected paragraph',
      SelectionApi.nodes([[1]], { mode: 'block' }),
      [title, paragraph(''), note('N')],
    ],
  ] as const) {
    it(`lands notes after a required empty title and paragraph from ${site}`, () => {
      const editor = createEditor({
        plugins: [
          defineEditorSchema('endnote-title', {
            id: 'endnote-title',
            version: 1,
            unknown: 'reject',
            elements: {
              title: {
                content: schema.content.text({ min: 1, default: 'text' }),
              },
              paragraph: {
                content: schema.content.text({ min: 1, default: 'text' }),
              },
              endnote: {
                content: schema.content.types(['paragraph'], {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                slice: { endMatter: true },
              },
            },
            root: schema.content.prefix(
              [{ element: 'title' }, { element: 'paragraph' }],
              schema.content.types(['paragraph', 'endnote'], {
                default: { type: 'paragraph' },
                min: 1,
              })
            ),
          }),
        ],
        initialValue: [title, paragraph(''), paragraph('')],
        initialSelection: selection,
      });
      assert.equal(
        editor.update.fragment.replace([note('N')]),
        true,
        'the notes land after the required title and paragraph'
      );
      assert.deepEqual(editor.read.children(), landed);
    });
  }

  it('falls back to the site when the root only accepts notes in a container', () => {
    const editor = createEditor({
      plugins: [noteSchema(true, true)],
      initialValue: [container([paragraph('ab')]), paragraph('tail')],
      initialSelection: caret([0, 0, 0], 1),
    });
    editor.update.fragment.replace([paragraph('X'), note('new')]);
    assert.deepEqual(editor.read.children(), [
      container([paragraph('a'), paragraph('X'), note('new'), paragraph('b')]),
      paragraph('tail'),
    ]);
  });

  it('dissolves a landing read output before its length cut', () => {
    const editor = createEditor({
      plugins: [
        noteSchema(),
        definePlugin('open-note-landing', {
          readMiddleware: ({ around }) => [
            around(editorReads.slice.landing, () => ({
              slice: ContentSlice.fromJSON({
                content: [note('words')],
                openStart: 2,
                openEnd: 2,
              }),
            })),
          ],
        }),
      ],
      initialValue: [paragraph('ab'), paragraph('tail')],
      initialSelection: caret([0, 0], 1),
      maxLength: 9,
    });
    editor.update.fragment.replace([paragraph('X')]);
    assert.deepEqual(editor.read.children(), [
      paragraph('aworb'),
      paragraph('tail'),
    ]);
  });

  it('keeps a truncated closed note at the root and trailing text at the site', () => {
    const editor = createEditor({
      plugins: [noteSchema()],
      initialValue: [paragraph('abcd')],
      initialSelection: caret([0, 0], 2),
      maxLength: 8,
    });
    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [paragraph('X'), note('123456')],
        openStart: 1,
        openEnd: 0,
      })
    );
    assert.deepEqual(editor.read.children(), [paragraph('abXcd'), note('123')]);
  });

  for (const named of [false, true]) {
    it(`keeps roots owned by objects in notes moved out of placement parents${named ? ' in a named root' : ''}`, () => {
      const cells = [
        container([paragraph('old')]),
        container([paragraph('old')]),
      ];
      const editor = createEditor({
        plugins: [noteSchema()],
        initialValue: named
          ? {
              children: [
                {
                  type: 'portal',
                  children: [{ text: 'P' }],
                  childRoots: { body: 'cells' },
                },
              ],
              roots: { cells },
            }
          : cells,
      });
      const at = named
        ? createEditorView(editor, { root: 'cells' }).read((state) => [
            state.key([0]),
            state.key([1]),
          ])
        : [[0], [1]];
      const slice = ContentSlice.fromJSON({
        content: [
          paragraph('X'),
          {
            type: 'endnote',
            children: [
              {
                type: 'portal',
                children: [{ text: 'P' }],
                childRoots: { body: 'caption' },
              },
            ],
          },
        ],
        openStart: 0,
        openEnd: 0,
        roots: { caption: [paragraph('owned')] },
      });
      let result = false;
      editor.update(() => {
        result = fitSlicePlacements(editor, slice, {
          placements: at.map((target) => {
            assert.ok(target);
            return { at: target, content: slice.content };
          }),
        });
      });
      assert.equal(
        result,
        true,
        'the fill keeps the roots its moved notes own'
      );
      const { children, roots = {} } = editor.read.value();
      assert.deepEqual(
        (named ? roots.cells : children)?.map((node) => node.type),
        ['container', 'container', 'endnote', 'endnote']
      );
      assert.deepEqual(
        Object.entries(roots)
          .filter(([name]) => name !== 'cells')
          .map(([, owned]) => owned),
        [[paragraph('owned')], [paragraph('owned')]]
      );
    });
  }

  it('bounds fitting to one extra write per placement carrying end matter', () => {
    const count = (
      endMatter: boolean,
      withNotes: boolean,
      placements: boolean
    ) => {
      const editor = createEditor({
        plugins: [noteSchema(endMatter)],
        initialValue: placements
          ? [container([paragraph('a')]), container([paragraph('b')])]
          : [paragraph('body')],
        initialSelection: caret(placements ? [0, 0, 0] : [0, 0], 1),
      });
      const content = placements
        ? [paragraph('X'), ...(withNotes ? [note('N')] : [])]
        : Array.from({ length: 2000 }, (_, index) => [
            paragraph('X'),
            ...(withNotes && index % 10 === 0 ? [note('N')] : []),
          ]).flat();
      const schemaApi = getEditorSchema(editor);
      const original = schemaApi.fit;
      let calls = 0;
      const fit = spyOn(schemaApi, 'fit').mockImplementation((...args) => {
        calls += 1;
        return original(...args);
      });
      try {
        let written = false;
        if (placements) {
          editor.update(() => {
            written = fitSlicePlacements(editor, ContentSlice.closed(content), {
              placements: [
                { at: [0], content },
                { at: [1], content },
              ],
            });
          });
        } else {
          written = editor.update.fragment.replace(content);
        }
        assert.equal(written, true);
      } finally {
        fit.mockRestore();
      }
      return calls;
    };
    for (const placements of [false, true]) {
      const plain = count(true, false, placements);
      assert.equal(
        plain,
        count(false, false, placements),
        'plain pastes must not add a fitting write'
      );
      assert.equal(
        count(true, true, placements),
        plain + (placements ? 2 : 1),
        'end matter must add exactly one fitting write per placement'
      );
    }
  });
});
