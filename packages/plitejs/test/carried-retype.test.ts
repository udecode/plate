import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineCommand,
  defineEditorSchema,
  type EditorUpdateTransaction,
  property,
  schema,
  target,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';

type Node = Record<string, unknown> & { children?: Node[]; text?: string };

const lines = schema.content.types(['heading', 'paragraph'], {
  default: { type: 'paragraph' },
  min: 1,
});
const QuoteColor = defineEditorSchema('carried-retype', {
  elements: {
    box: { content: lines },
    heading: { content: schema.content.text() },
    paragraph: { content: schema.content.text() },
    quote: { content: lines },
  },
  id: 'carried-retype',
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
  ],
  root: schema.content.types(['box', 'paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const commit = (
  value: unknown,
  author: string,
  intent: 'edit' | 'propose',
  run: (tx: EditorUpdateTransaction) => void
) => {
  const editor = createEditor({
    initialValue: value as never,
    plugins: [
      QuoteColor,
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => author,
        intent,
        now: () => 1,
      }),
    ],
  });

  editor.update((tx) => run(tx));

  return editor.read.value().children as unknown as Node[];
};

const texts = (nodes: readonly Node[]): Node[] =>
  nodes.flatMap((node) => (node.children ? texts(node.children) : [node]));

const retype = defineCommand('carried-retype.box-to-quote', {
  build: ({ state }) =>
    state.transaction((tx) => tx.nodes.set({ type: 'quote' }, { at: [0] })),
});

describe('a retype over content a pending join keeps where it was', () => {
  for (const intent of ['edit', 'propose'] as const) {
    it(`${intent === 'edit' ? 'Editing' : 'Suggesting'} retypes a box to a quote while Dave’s Backspace joins its paragraph into its heading, and the paragraph’s text stores no color`, () => {
      const dave = commit(
        [
          {
            children: [
              { children: [{ text: 'h' }], type: 'heading' },
              { children: [{ color: 'u', text: 'ab' }], type: 'paragraph' },
            ],
            type: 'box',
          },
        ],
        'dave',
        'propose',
        (tx) => {
          const caret = { offset: 0, path: [0, 1, 0] };

          tx.selection.set({ anchor: caret, focus: caret });
          tx.text.deleteBackward({ unit: 'character' });
        }
      );
      const [quote] = commit(dave, 'alice', intent, (tx) => tx.command(retype));

      assert.deepEqual(
        {
          colors: texts([quote]).flatMap(({ color }) =>
            color === undefined ? [] : [color]
          ),
          type: quote.type,
        },
        { colors: [], type: 'quote' }
      );
    });
  }
});
