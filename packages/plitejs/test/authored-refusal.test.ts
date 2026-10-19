import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  authoredVeto,
  ContentSlice,
  createEditor,
  DocumentChange,
  editorCommands,
  defineEditorSchema,
  definePlugin,
  property,
  schema,
  target,
  transfer,
} from 'plitejs';
import { projectAuthoredDocument } from 'plitejs/authored';

import { createAuthoredPlugin } from '../src/authored/authored';

const blocks = (generates = false) =>
  defineEditorSchema('authored-refusal-blocks', {
    elements: {
      box: {
        content: schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      paragraph: schema.element.textBlock({
        properties: { listType: property.string() },
      }),
    },
    id: 'authored-refusal-blocks',
    properties: [
      schema.textProperty('bold', property.boolean()),
      ...(generates
        ? [
            schema.elementProperty(
              'id',
              property.string({ generate: () => 'generated' }),
              { role: 'metadata', target: target.group('element') }
            ),
          ]
        : []),
    ],
    root: schema.content.types(['paragraph', 'box'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  });

// Boxes stand in for tables, a listType for list items.
const vetoes = definePlugin('vetoes', {
  contributions: [
    authoredVeto.of((element) => (element.type === 'box' ? 'box' : null)),
    authoredVeto.of((element, touch) =>
      element.listType && touch !== 'content' ? 'list' : null
    ),
  ],
});

const paragraph = (text: string, props: Record<string, unknown> = {}) => ({
  type: 'paragraph',
  ...props,
  children: [{ text }],
});
const initial = () => [
  paragraph('before'),
  { type: 'box', children: [paragraph('inside')] },
  paragraph('item', { listType: 'disc' }),
  paragraph('after'),
];

const make = (
  intent: 'edit' | 'propose' = 'propose',
  options: { generates?: boolean; value?: unknown[] } = {}
) => {
  const editor = createEditor({
    initialValue: (options.value ?? initial()) as never,
    plugins: [
      blocks(options.generates),
      vetoes,
      createAuthoredPlugin({
        authorId: 'bob',
        createChangeId: () => 'bob:1',
        intent,
        now: () => 1,
      }),
    ],
  });
  const refusals: unknown[] = [];

  (
    editor as unknown as {
      api: {
        authored: {
          subscribeRefusals: (listener: (refusal: unknown) => void) => void;
        };
      };
    }
  ).api.authored.subscribeRefusals((refusal) => refusals.push(refusal));

  return { editor, refusals };
};
const point = (path: number[], offset: number) => ({ offset, path });

describe('authored refusal', () => {
  it('records text inserted at the end of a list item', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.text.insert('X', { at: point([2, 0], 4) });
    });

    assert.deepEqual(refusals, []);
    assert.equal(editor.read.text.string([2]), 'itemX');
    assert.equal(editor.read.authored.changes().items.length, 1);
  });

  it('records deleting the last character of a list item', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point([2, 0], 3), focus: point([2, 0], 4) },
      });
    });

    assert.deepEqual(refusals, []);
    assert.equal(editor.read.authored.changes().items[0]?.kind, 'delete');
  });

  it('records a bold run typed at the end of a list item', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.nodes.insert({ bold: true, text: 'X' }, { at: [2, 1] });
    });

    assert.deepEqual(refusals, []);
    assert.equal(editor.read.text.string([2]), 'itemX');
    assert.equal(editor.read.authored.changes().items.length, 1);
  });

  it('records removing the last text leaf of a list item', () => {
    const { editor, refusals } = make('propose', {
      value: [
        paragraph('before'),
        { type: 'box', children: [paragraph('inside')] },
        {
          type: 'paragraph',
          listType: 'disc',
          children: [{ text: 'item' }, { bold: true, text: 'X' }],
        },
        paragraph('after'),
      ],
    });

    editor.update((tx) => {
      tx.nodes.remove({ at: [2, 1] });
    });

    assert.deepEqual(refusals, []);
    assert.equal(editor.read.authored.changes().items[0]?.kind, 'delete');
  });

  it('refuses two plain paragraphs pasted into the middle of a list item', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.slice.replace(
        ContentSlice.closed([paragraph('one'), paragraph('two')]),
        { at: point([2, 0], 2) }
      );
    });

    assert.deepEqual(editor.read.children(), initial());
    assert.deepEqual(
      refusals.map((refusal) => (refusal as { reasons: string[] }).reasons),
      [['list']]
    );
  });

  it('refuses a mark on a whole text leaf inside a vetoed block', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point([1, 0, 0], 0),
        focus: point([1, 0, 0], 6),
      });
      tx.marks.add('bold', true);
    });

    assert.deepEqual(editor.read.children(), initial());
    assert.deepEqual(
      refusals.map((refusal) => (refusal as { reasons: string[] }).reasons),
      [['box']]
    );
  });

  it('refuses typing inside a vetoed block whole and reports why', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.text.insert('X', { at: point([1, 0, 0], 2) });
    });

    assert.deepEqual(editor.read.children(), initial());
    assert.deepEqual(refusals, [
      {
        code: 'veto',
        message: 'Suggesting cannot change box yet.',
        reasons: ['box'],
      },
    ]);
  });

  it('refuses a selection across a vetoed block, so nothing half-applies', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point([0, 0], 3), focus: point([3, 0], 2) },
      });
    });

    assert.deepEqual(editor.read.children(), initial());
    assert.deepEqual(
      refusals.map((refusal) =>
        [...(refusal as { reasons: string[] }).reasons].sort()
      ),
      [['box', 'list']]
    );
  });

  it('refuses turning a paragraph into a list item', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.nodes.set({ listType: 'decimal' }, { at: [0] });
    });

    assert.deepEqual(editor.read.children(), initial());
    assert.equal(refusals.length, 1);
  });

  it('refuses turning a list item back into a paragraph', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.nodes.unset('listType', { at: [2] });
    });

    assert.deepEqual(editor.read.children(), initial());
    assert.deepEqual(
      refusals.map((refusal) => (refusal as { reasons: string[] }).reasons),
      [['list']]
    );
  });

  it('refuses inserting a vetoed block', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.nodes.insert(
        { type: 'box', children: [paragraph('new')] },
        { at: [4] }
      );
    });

    assert.deepEqual(editor.read.children(), initial());
    assert.equal(refusals.length, 1);
  });

  it('records a suggestion in a paragraph next to a list and between blocks', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.text.insert('!', { at: point([3, 0], 0) });
      tx.nodes.insert(paragraph('between'), { at: [3] });
    });

    assert.deepEqual(refusals, []);
    assert.deepEqual(
      editor.read
        .children()
        .map((_, index) => editor.read.text.string([index])),
      ['before', 'inside', 'item', 'between', '!after']
    );
  });

  it('records edits at the edges of the paragraphs either side of a list item', () => {
    const { editor, refusals } = make('propose', {
      value: [
        paragraph('one'),
        paragraph('two', { listType: 'disc' }),
        paragraph('three'),
      ],
    });

    editor.update((tx) => {
      tx.text.insert('!', { at: point([0, 0], 3) });
    });
    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point([0, 0], 2), focus: point([0, 0], 3) },
      });
    });
    editor.update((tx) => {
      tx.text.insert('?', { at: point([2, 0], 0) });
    });
    editor.update((tx) => {
      tx.text.delete({
        at: { anchor: point([2, 1], 0), focus: point([2, 1], 1) },
      });
    });
    editor.update((tx) => {
      tx.nodes.insert(paragraph('new'), { at: [2] });
    });
    editor.update((tx) => {
      tx.nodes.insert(paragraph('above'), { at: [1] });
    });
    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(refusals, []);
    assert.deepEqual(
      editor.read
        .children()
        .map((_, index) => editor.read.text.string([index])),
      ['one', 'above', 'two', 'new', '?three']
    );
  });

  it('records removing the paragraph right before a list item', () => {
    const { editor, refusals } = make('propose', {
      value: [paragraph('one'), paragraph('two', { listType: 'disc' })],
    });

    editor.update((tx) => {
      tx.nodes.remove({ at: [0] });
    });

    assert.deepEqual(refusals, []);
    assert.equal(editor.read.authored.changes().items.length, 1);
  });

  it('keeps a refusal caught inside the update from publishing anything', () => {
    const { editor, refusals } = make();

    editor.update((tx) => {
      tx.selection.set({
        anchor: point([1, 0, 0], 0),
        focus: point([1, 0, 0], 0),
      });
      try {
        tx.command(editorCommands.insertText, { text: 'X' });
      } catch {
        // The update goes on as if the command had not run.
      }
      tx.text.insert('Y', { at: point([0, 0], 0) });
    });

    assert.deepEqual(editor.read.children(), initial());
    assert.equal(refusals.length, 1);
  });

  it('refuses moving a paragraph into a vetoed block as a policy refusal', () => {
    const editor = createEditor({
      initialValue: initial() as never,
      plugins: [
        blocks(),
        vetoes,
        transfer(),
        createAuthoredPlugin({ authorId: 'bob', intent: 'propose' }),
      ],
    });

    const outcome = editor.api.transfer.move({
      nodes: [editor.key([0])!],
      to: { edge: 'after', key: editor.key([1, 0])! },
    });

    assert.deepEqual(outcome, { reason: 'policy', status: 'refused' });
    assert.deepEqual(editor.read.children(), initial());
  });

  it('refuses deleting a named root while Suggesting and reports it', () => {
    // An open schema lets a document hold roots it does not declare.
    const open = defineEditorSchema('authored-refusal-open', {
      elements: { paragraph: schema.element.textBlock() },
      id: 'authored-refusal-open',
      root: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'preserve',
      version: 1,
    });
    const editor = createEditor({
      initialValue: {
        children: [paragraph('main')],
        roots: { aux: [paragraph('side')] },
      } as never,
      plugins: [
        open,
        createAuthoredPlugin({ authorId: 'bob', intent: 'propose' }),
      ],
    });
    const refusals: unknown[] = [];

    (
      editor as unknown as {
        api: {
          authored: {
            subscribeRefusals: (listener: (refusal: unknown) => void) => void;
          };
        };
      }
    ).api.authored.subscribeRefusals((refusal) => refusals.push(refusal));
    const before = editor.read.value();

    editor.update((tx) => {
      tx.changes.apply(
        DocumentChange.fromJSON({ deleteRoots: ['aux'], version: 3 })
      );
    });

    assert.deepEqual(editor.read.value(), before);
    assert.deepEqual(refusals, [
      {
        code: 'unrepresentable',
        message:
          'Suggesting cannot delete a named root; suggest deleting its content.',
        reasons: [],
      },
    ]);
  });

  it('lets Editing change vetoed blocks', () => {
    const { editor, refusals } = make('edit');

    editor.update((tx) => {
      tx.text.insert('X', { at: point([1, 0, 0], 0) });
      tx.nodes.set({ listType: 'decimal' }, { at: [0] });
    });

    assert.deepEqual(refusals, []);
    assert.equal(editor.read.text.string([1]), 'Xinside');
  });

  it('refuses Suggesting and projections that would decide changes when the schema generates values', () => {
    const marked = [
      {
        ...paragraph('kept', { id: 'p1' }),
        children: [
          {
            text: 'new',
            authored: [
              { at: 1, author: 'ann', change: 'ann:1', kind: 'insert' },
            ],
          },
        ],
      },
    ];
    const { editor, refusals } = make('edit', {
      generates: true,
      value: marked,
    });
    const api = editor as unknown as {
      api: { authored: { setView: (view: unknown) => void } };
      read: { authored: { view: () => unknown } };
    };

    api.api.authored.setView({ intent: 'propose' });

    assert.deepEqual(api.read.authored.view(), { intent: 'edit' });
    assert.deepEqual(
      refusals.map((refusal) => (refusal as { code: string }).code),
      ['generated-values']
    );
    assert.deepEqual(
      projectAuthoredDocument(editor.read.value(), {
        editor,
        projection: 'accepted',
      }),
      {
        diagnostics: [
          {
            code: 'authored-generated-values',
            message:
              'This schema generates property values, so its documents with suggestions have no accepted or proposed projection.',
            severity: 'error',
          },
        ],
        ok: false,
        pending: 1,
      }
    );
  });
});
