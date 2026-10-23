import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  defineEditorSchema,
  type Editor,
  editorCommands,
  property,
  schema,
  target,
  transfer,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { readLedgerWork } from '../src/authored/ledger/work';
import { DocumentIndex } from '../src/core/change/document-index';
import { getCompiledEditorSchema } from '../src/core/plugin-registry';
import { tracksPlaces } from '../src/core/schema-compiler';
import { type CoreWork, readCoreWork } from '../src/core/work';

type Node = Record<string, unknown> & { children?: Node[]; text?: string };
type Intent = 'edit' | 'propose';

const PLACE_WORK = [
  'canonicalNodes',
  'formerPlaceCalls',
  'formerPlaceVisits',
  'landingSources',
  'relocations',
] as const;

type PlaceWork = Record<(typeof PLACE_WORK)[number], number>;

const placeWork = (run: () => void): PlaceWork => {
  const before = readCoreWork();

  run();

  const after = readCoreWork();

  return Object.fromEntries(
    PLACE_WORK.map((key) => [key, after[key] - before[key]])
  ) as Pick<CoreWork, (typeof PLACE_WORK)[number]>;
};

const QuoteColor = defineEditorSchema('carried-moves-work-quote-color', {
  elements: {
    paragraph: { content: schema.content.text() },
    quote: {
      content: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 'carried-moves-work-quote-color',
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
    schema.elementProperty('accent', property.string(), {
      target: target.type('quote'),
    }),
  ],
  root: schema.content.types(['paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'preserve',
  version: 1,
});

const paragraphs = (
  count: number,
  text: (index: number) => string,
  colored = true
) =>
  Array.from({ length: count }, (_, index) => ({
    children: [
      colored ? { color: 'u', text: text(index) } : { text: text(index) },
    ],
    type: 'paragraph',
  }));

const quoteQ = {
  children: [{ children: [{ text: 'q' }], type: 'paragraph' }],
  type: 'quote',
};

const caretAtEnd = (editor: Editor, path: number[]) => {
  const leaf = path.reduce<Node>((node, index) => node.children![index], {
    children: editor.read.children() as unknown as Node[],
  });
  const point = { offset: leaf.text!.length, path };

  editor.update((tx) => tx.selection.set({ anchor: point, focus: point }));
};

const typeTen = (editor: Editor) =>
  placeWork(() => {
    for (let key = 0; key < 10; key += 1) {
      editor.update((tx) => tx.text.insert('x'));
    }
  });

/** The tokens of the blocks after the first, which a sweep moves. */
const tokensAfterFirst = (editor: Editor) => {
  const children = editor.read.children();
  const index = DocumentIndex.fromValue(children);

  return children.slice(1).reduce((sum, _, at) => {
    const { from, to } = index.nodeRange([at + 1]);

    return sum + to - from;
  }, 0);
};

const Bold = defineEditorSchema('carried-moves-work-bold', {
  elements: { paragraph: { content: schema.content.text() } },
  id: 'carried-moves-work-bold',
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

let ids = 0;
const authoredEditor = (
  plugin: ReturnType<typeof defineEditorSchema>,
  value: readonly Node[],
  intent: Intent
) =>
  createEditor({
    initialValue: value as never,
    plugins: [
      plugin,
      createAuthoredPlugin({
        authorId: 'alice',
        createChangeId: () => `alice:${(ids += 1)}`,
        createTagId: () => `alice-tag:${(ids += 1)}`,
        intent,
        now: () => 1,
      }),
    ],
  });

const struckParagraph = {
  authored: [{ at: 1, author: 'bob', change: 'bob:1', kind: 'delete' }],
  children: [
    {
      authored: [{ at: 1, author: 'bob', change: 'bob:1', kind: 'delete' }],
      text: 'gone',
    },
  ],
  type: 'paragraph',
};

/** The index reads and mapped letters of each bold set, unset and set again. */
const boldSetWork = (
  length: number,
  intent: Intent,
  framed: boolean
): Array<Readonly<{ letters: number; reads: number }>> => {
  const reads = spyOn(DocumentIndex.prototype, 'openContextAt');
  const leaf = { children: [{ text: 'x'.repeat(length) }], type: 'paragraph' };
  const editor = authoredEditor(
    Bold,
    framed ? [struckParagraph, leaf] : [leaf],
    intent
  );
  const at = framed ? [1, 0] : [0, 0];

  try {
    return [true, false, true].map((bold) => {
      const before = reads.mock.calls.length;
      const letters = readLedgerWork().lettersMapped;

      editor.update((tx) => {
        if (framed) {
          tx.command(editorCommands.setNodes, {
            options: { at },
            props: { bold },
          });
        } else {
          tx.nodes.set({ bold }, { at });
        }
      });
      assert.equal(
        (editor.read.children()[at[0]] as Node).children?.[0]?.bold ?? false,
        bold,
        'input missing: the set did not apply'
      );

      return {
        letters: readLedgerWork().lettersMapped - letters,
        reads: reads.mock.calls.length - before,
      };
    });
  } finally {
    reads.mockRestore();
  }
};

describe('carried moves work', () => {
  for (const intent of ['edit', 'propose'] as const) {
    const mode = intent === 'edit' ? 'an Editing' : 'a Suggesting';

    it(`reads the index at most next's 5 times for ${mode} bold set on a 100,000-character leaf, as on a 1,000-character one`, () => {
      const short = boldSetWork(1000, intent, false);
      const long = boldSetWork(100_000, intent, false);

      assert.ok(long.every(({ reads }) => reads <= 5));
      assert.deepEqual(long, short);
    });

    it(`does as much work for ${mode} framed bold set on a 10,000 and a 100,000 character leaf as on a 1,000-character one`, () => {
      const short = boldSetWork(1000, intent, true);

      assert.ok(short.every(({ letters }) => letters > 0));
      assert.deepEqual(boldSetWork(10_000, intent, true), short);
      assert.deepEqual(boldSetWork(100_000, intent, true), short);
    });
  }

  for (const intent of [null, 'edit', 'propose'] as const) {
    const mode = intent
      ? `in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`
      : 'in a plain editor';

    it(`records no relocation and looks up no former place for ten letters typed on a colored paragraph ${mode}`, () => {
      const value = [paragraphs(1, () => 'a')[0], quoteQ];
      const editor = intent
        ? authoredEditor(QuoteColor, value, intent)
        : createEditor({ initialValue: value as never, plugins: [QuoteColor] });

      caretAtEnd(editor, [0, 0]);

      const work = typeTen(editor);

      assert.match(
        (editor.read.children()[0] as Node)
          .children!.map(({ text }) => text)
          .join(''),
        /^axxxxxxxxxx$/,
        'input missing: the letters did not land'
      );
      assert.equal(work.relocations, 0);
      assert.equal(work.formerPlaceCalls, 0);
    });
  }

  it('G3: a mark kept out of code blocks tracks places', () => {
    const Code = defineEditorSchema('carried-moves-work-code', {
      elements: {
        code: { content: schema.content.text() },
        paragraph: { content: schema.content.text() },
      },
      id: 'carried-moves-work-code',
      properties: [
        schema.textProperty('bold', property.boolean(), {
          target: target.not(target.parent(target.type('code'))),
        }),
      ],
      root: schema.content.types(['code', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const editor = createEditor({ plugins: [Code] });

    assert.equal(tracksPlaces(getCompiledEditorSchema(editor)), true);
  });

  for (const intent of [null, 'edit', 'propose'] as const) {
    const mode = intent
      ? `in ${intent === 'edit' ? 'Editing' : 'Suggesting'}`
      : 'in a plain editor';

    it(`traces and records no place for a drag of two paragraphs' text in a schema that tracks none ${mode}`, () => {
      const editor = createEditor({
        initialValue: ['ab', 'cd', 'ef'].map((text) => ({
          children: [{ text }],
          type: 'paragraph',
        })) as never,
        plugins: [
          Bold,
          ...(intent
            ? [
                createAuthoredPlugin({
                  authorId: 'alice',
                  createChangeId: () => `alice:${(ids += 1)}`,
                  intent,
                  now: () => 1,
                }),
              ]
            : []),
          transfer(),
        ],
      });
      let status = '';
      const work = placeWork(() => {
        ({ status } = editor.api.transfer.move({
          range: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 1, path: [1, 0] },
          },
          to: { point: { offset: 1, path: [2, 0] } },
        }));
      });

      assert.equal(tracksPlaces(getCompiledEditorSchema(editor)), false);
      assert.equal(status, 'moved', 'input missing: the drag did not move');
      const { canonicalNodes: _opened, ...placed } = work;

      assert.deepEqual(placed, {
        formerPlaceCalls: 0,
        formerPlaceVisits: 0,
        landingSources: 0,
        relocations: 0,
      });
    });
  }

  it('traces as many landing sources for a drag of one word out of a paragraph of 1,000 links as of 10, in a schema that tracks places', () => {
    const Links = defineEditorSchema('carried-moves-work-links', {
      elements: {
        link: { content: schema.content.text(), inline: true },
        paragraph: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('link')],
            { default: 'text', min: 1 }
          ),
        },
        quote: {
          content: schema.content.types(['paragraph'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      id: 'carried-moves-work-links',
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
      root: schema.content.types(['paragraph', 'quote'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
      version: 1,
    });
    const traced = (links: number) => {
      const editor = createEditor({
        initialValue: [
          {
            children: [
              { text: 'word ' },
              ...Array.from({ length: links }, () => [
                { children: [{ text: 'l' }], type: 'link' },
                { text: ' ' },
              ]).flat(),
            ],
            type: 'paragraph',
          },
          quoteQ,
        ] as never,
        plugins: [Links, transfer()],
      });
      let status = '';
      const work = placeWork(() => {
        ({ status } = editor.api.transfer.move({
          range: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 4, path: [0, 0] },
          },
          to: { point: { offset: 1, path: [1, 0, 0] } },
        }));
      });

      assert.equal(tracksPlaces(getCompiledEditorSchema(editor)), true);
      assert.equal(status, 'moved', 'input missing: the drag did not move');

      return work.landingSources;
    };

    assert.equal(traced(1000), traced(10));
  });

  for (const intent of [null, 'edit'] as const) {
    const mode = intent ? 'in Editing' : 'in a plain editor';

    it(`opens a constant number of nodes for a quote's own property change, at 10 and 100 paragraphs ${mode}`, () => {
      const opened = (count: number) => {
        const value = [
          {
            children: paragraphs(count, (index) => `line ${index}`, false),
            type: 'quote',
          },
        ];
        const editor = intent
          ? authoredEditor(QuoteColor, value, intent)
          : createEditor({
              initialValue: value as never,
              plugins: [QuoteColor],
            });
        const work = placeWork(() =>
          editor.update((tx) => tx.nodes.set({ accent: 'a1' }, { at: [0] }))
        );

        assert.equal((editor.read.children()[0] as Node).accent, 'a1');

        return work.canonicalNodes;
      };

      assert.equal(opened(100), opened(10));
    });

    /** Former-place visits per moved token for paragraphs carried into a quote. */
    const sweep = (operation: 'moves' | 'wrap', count: number) => {
      const value = [
        quoteQ,
        ...paragraphs(count, (index) =>
          operation === 'moves' ? 'a' : `paragraph ${index}`
        ),
      ];
      const editor = intent
        ? authoredEditor(QuoteColor, value, intent)
        : createEditor({ initialValue: value as never, plugins: [QuoteColor] });
      const moved = tokensAfterFirst(editor);
      const work = placeWork(() =>
        editor.update((tx) => {
          if (operation === 'wrap') {
            tx.nodes.wrap(
              { children: [], type: 'quote' },
              {
                at: {
                  anchor: { offset: 0, path: [1, 0] },
                  focus: { offset: 1, path: [count, 0] },
                },
              }
            );
          } else {
            for (let at = 0; at < count; at += 1) {
              tx.nodes.move({ at: [1], to: [0, 1 + at] });
            }
          }
        })
      );
      const quote = editor.read.children()[
        operation === 'wrap' ? 1 : 0
      ] as Node;

      assert.equal(
        quote.children!.length,
        operation === 'wrap' ? count : count + 1,
        'input missing: the paragraphs did not land in the quote'
      );
      assert.ok(
        quote.children!.every(
          ({ children }) => children![0].color === undefined
        )
      );
      assert.ok(work.relocations > 0, 'input missing: nothing relocated');
      assert.ok(
        work.formerPlaceVisits <= 2 * moved,
        `${work.formerPlaceVisits} visits for ${moved} moved tokens`
      );

      return work.formerPlaceVisits / moved;
    };

    it(`examines at most twice the moved tokens in formerPlace for a wrap of 10, 100 and 1,000 paragraphs into a quote ${mode}`, () => {
      for (const count of [10, 100, 1000]) sweep('wrap', count);
    });

    if (!intent) {
      it(`examines at most twice the moved tokens in formerPlace for one move each of 10 and 100 paragraphs into a quote ${mode}`, () => {
        for (const count of [10, 100]) sweep('moves', count);
      });

      it(`examines as many former-place visits per moved token for one move each of 1,000 paragraphs into a quote as of 100 ${mode}`, () => {
        assert.equal(sweep('moves', 1000), sweep('moves', 100));
      });
    }

    it(`records as many relocations for a letter typed with an active mark at 100 paragraphs as at 2,000 ${mode}`, () => {
      const relocations = (count: number) => {
        const value = paragraphs(count, () => 'a');
        const editor = intent
          ? authoredEditor(QuoteColor, value, intent)
          : createEditor({
              initialValue: value as never,
              plugins: [QuoteColor],
            });

        caretAtEnd(editor, [count >> 1, 0]);

        return placeWork(() =>
          editor.update((tx) => {
            tx.marks.add('bold', true);
            tx.text.insert('x');
          })
        ).relocations;
      };

      assert.equal(relocations(2000), relocations(100));
    });
  }
});
