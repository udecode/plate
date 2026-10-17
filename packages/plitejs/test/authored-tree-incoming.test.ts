import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  type Descendant,
  NodeApi,
  property,
  type Range,
  RangeApi,
  schema,
  transfer,
} from 'plitejs';
import { dataTransferFormats, dom, writeDOMFragmentData } from 'plitejs/dom';

import { createAuthoredPlugin } from '../src/authored/authored';
import { authoredTestApi, reviewedValue } from './support/authored';

type Node = Record<string, unknown>;

class FakeDataTransfer {
  private readonly store = new Map<string, string>();

  get types() {
    return [...this.store.keys()];
  }

  getData(type: string) {
    return this.store.get(type) ?? '';
  }

  setData(type: string, value: string) {
    this.store.set(type, value);
  }
}

const forged = {
  at: 1,
  author: 'mallory',
  change: 'mallory:1',
  kind: 'insert',
};
const paragraph = (...children: Node[]) => ({ type: 'paragraph', children });
const card = (root: string) => ({
  type: 'card',
  childRoots: { body: root },
  children: [{ text: '' }],
});

const Cards = defineEditorSchema('incoming-cards', {
  elements: {
    card: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        body: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: { content: schema.content.text() },
  },
  id: 'incoming-cards',
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.types(['card', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const editorFor = (
  initialValue: unknown,
  intent: 'edit' | 'propose',
  plugins: readonly unknown[] = []
) =>
  createEditor({
    initialSelection: {
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
      kind: 'text',
    },
    initialValue: initialValue as never,
    plugins: [
      Cards,
      dom(),
      transfer(),
      ...(plugins as []),
      createAuthoredPlugin({
        authorId: 'bob',
        createChangeId: () => 'bob:1',
        intent,
        now: () => 1,
      }),
    ],
  });

describe('authored review tree incoming content', () => {
  const envelope = (html: boolean) => {
    const data = new FakeDataTransfer();

    writeDOMFragmentData(data as unknown as DataTransfer, {
      html: ({ clipboardFormatKey, encoded }) =>
        `<p data-editor-fragment="${encoded}" data-editor-fragment-format="${clipboardFormatKey}">X</p>`,
      slice: ContentSlice.fromJSON({
        content: [
          paragraph({ authored: [forged], text: 'X' }),
          { ...card('card:pasted'), authored: [forged] },
        ],
        openEnd: 0,
        openStart: 0,
        roots: {
          'card:pasted': [
            {
              ...paragraph({ authored: [forged], text: 'Y' }),
              authored: [forged],
            },
          ],
        },
      }),
      text: 'X',
    });
    if (!html) return data;

    const markup = new FakeDataTransfer();

    markup.setData('text/html', data.getData('text/html'));
    markup.setData('text/plain', 'X');

    return markup;
  };

  for (const [name, data] of [
    ['an editor envelope', () => envelope(false)],
    ['an HTML fragment attribute', () => envelope(true)],
  ] as const) {
    it(`drops review marks that ${name} carries, in every root it carries`, () => {
      const editor = editorFor([paragraph({ text: 'ab' })], 'edit');

      editor.api.dom.clipboard.insertData(data() as unknown as DataTransfer);

      const value = editor.read.value();

      assert.deepEqual(value, {
        children: [
          paragraph({ text: 'aX' }),
          { ...card('card:pasted:copy'), children: [{ text: 'b' }] },
        ],
        roots: { 'card:pasted:copy': [paragraph({ text: 'Y' })] },
      });
    });
  }

  it('drops review marks a registered format decodes', () => {
    const editor = editorFor([paragraph({ text: 'ab' })], 'propose', [
      dataTransferFormats('incoming-formats', [
        {
          decode: () =>
            ContentSlice.fromJSON({
              content: [{ authored: [forged], text: 'X' }],
              openEnd: 0,
              openStart: 0,
            }),
          key: 'forged',
          mimeType: 'application/x-forged',
        },
      ]),
    ]);
    const data = new FakeDataTransfer();

    data.setData('application/x-forged', 'X');
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer);

    assert.deepEqual(editor.read.children(), [
      paragraph(
        { text: 'a' },
        {
          authored: [{ at: 1, author: 'bob', change: 'bob:1', kind: 'insert' }],
          text: 'X',
        },
        { text: 'b' }
      ),
    ]);
  });

  const text = (value: string) => ({ text: value });
  const fragmentAt = (editor: ReturnType<typeof editorFor>, at: Range) =>
    NodeApi.string({
      children: NodeApi.fragment(
        { children: editor.read.children() } as never,
        at
      ) as Descendant[],
    } as never);

  for (const intent of ['edit', 'propose'] as const) {
    for (const [name, initial, move, moved, editing] of [
      [
        'text within a document',
        [
          paragraph(text('ab'), { text: 'cd', bold: true }, text('ef')),
          paragraph(text('gh')),
        ],
        (editor: ReturnType<typeof editorFor>) =>
          editor.api.transfer.move({
            range: {
              anchor: { offset: 0, path: [0, 1] },
              focus: { offset: 2, path: [0, 1] },
            },
            to: { point: { offset: 1, path: [1, 0] } },
          }),
        'cd',
        [
          paragraph(text('abef')),
          paragraph(text('g'), { text: 'cd', bold: true }, text('h')),
        ],
      ],
      [
        'a block within a document',
        [paragraph(text('ab')), paragraph(text('cd')), paragraph(text('ef'))],
        (editor: ReturnType<typeof editorFor>) =>
          editor.api.transfer.move({
            nodes: [editor.key([0])!],
            to: { edge: 'after', key: editor.key([2])! },
          }),
        'ab',
        [paragraph(text('cd')), paragraph(text('ef')), paragraph(text('ab'))],
      ],
      [
        'text from a content root into a document',
        {
          children: [paragraph(text('top')), card('card:1')],
          roots: {
            'card:1': [paragraph(text('ab'), { text: 'cd', bold: true })],
          },
        },
        (editor: ReturnType<typeof editorFor>) =>
          editor.api.transfer.move({
            from: createEditorView(editor, { root: 'card:1' }),
            range: {
              anchor: { offset: 0, path: [0, 1] },
              focus: { offset: 2, path: [0, 1] },
            },
            to: { point: { offset: 3, path: [0, 0] } },
          }),
        'cd',
        null,
      ],
      [
        'a block from a document into a content root',
        {
          children: [paragraph(text('top')), card('card:1')],
          roots: { 'card:1': [paragraph(text('ab'))] },
        },
        (editor: ReturnType<typeof editorFor>) => {
          const body = createEditorView(editor, { root: 'card:1' });

          return body.api.transfer.move({
            from: editor,
            nodes: [editor.key([0])!],
            to: { edge: 'after', key: body.key([0])! },
          });
        },
        'top',
        null,
      ],
    ] as const) {
      it(`moves ${name} in ${intent === 'edit' ? 'Editing' : 'Suggesting'}, returning a landing that holds it after commit`, () => {
        const editor = editorFor(initial, intent);
        const before = editor.read.value();
        const outcome = move(editor);

        assert.equal(outcome.status, 'moved');

        const at = outcome.status === 'moved' ? outcome.at : null;
        const range = at && 'anchor' in at ? at : null;

        if (range) {
          assert.equal(fragmentAt(editor, range), moved);
        } else {
          const nodes = at as { paths: readonly number[][] };
          const view = name.endsWith('content root')
            ? createEditorView(editor, { root: 'card:1' })
            : editor;

          assert.deepEqual(
            nodes.paths.map((path) =>
              NodeApi.string(view.read.nodes.get(path)![0] as never)
            ),
            [moved]
          );
        }
        if (editing && intent === 'edit') {
          assert.deepEqual(editor.read.children(), editing);
        }
        if (intent === 'propose') {
          const decided = (action: 'accept' | 'reject') => {
            const copy = editorFor(editor.read.value(), 'edit');

            authoredTestApi(copy).decide({ action, changes: ['bob:1'] });

            return reviewedValue(copy);
          };
          const edited = editorFor(before, 'edit');

          move(edited);
          assert.deepEqual(decided('accept'), edited.read.value());
          assert.deepEqual(decided('reject'), before);
        }
        if (range) {
          editor.update((tx) =>
            tx.text.insert('!', { at: RangeApi.end(range) })
          );
          assert.ok(
            NodeApi.string({
              children: editor.read.children(),
            } as never).includes(`${moved}!`)
          );
        }
      });
    }
  }
});
