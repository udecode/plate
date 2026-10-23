import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import {
  createEditor,
  createEditorView,
  defineCommand,
  definePluginSlot,
  defineEditorSchema,
  type EditorUpdateTransaction,
  property,
  schema,
  target,
  transfer,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import { authoredTestApi } from './support/authored';

type Node = Record<string, unknown> & { children?: Node[]; text?: string };
type Intent = 'edit' | 'propose';
type Plugin = ReturnType<typeof defineEditorSchema>;

const authoredEditor = (
  plugin: Plugin,
  value: unknown,
  author: string,
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
      transfer(),
    ],
  });

const commit = (
  plugin: Plugin,
  value: unknown,
  author: string,
  intent: Intent,
  run: (tx: EditorUpdateTransaction) => void
) => {
  const editor = authoredEditor(plugin, value, author, intent);

  editor.update((tx) => run(tx));

  return editor.read.value().children as unknown as Node[];
};

const decide = (
  plugin: Plugin,
  value: unknown,
  action: 'accept' | 'reject',
  change: string
) => {
  const editor = authoredEditor(plugin, value, 'zed');

  authoredTestApi(editor).decide({ action, changes: [change] });

  return editor.read.value().children as unknown as Node[];
};

const unmarked = (nodes: readonly Node[]): Node[] =>
  nodes.map(({ authored: _authored, children, ...rest }) =>
    children ? { ...rest, children: unmarked(children) } : rest
  );

const Bold = defineEditorSchema('carried-moves-bold', {
  elements: {
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
  id: 'carried-moves-bold',
  properties: [
    schema.textProperty('bold', property.boolean()),
    schema.elementProperty('url', property.string(), {
      target: target.type('link'),
    }),
  ],
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const notInQuote = (type: string) =>
  target.and(
    target.type(type),
    target.not(target.parent(target.type('quote')))
  );

const colorSchema = (
  id: string,
  properties: Array<ReturnType<typeof schema.textProperty>>,
  quoted: readonly string[] = ['paragraph'],
  version = 1
) =>
  defineEditorSchema(id, {
    elements: {
      box: {
        content: schema.content.types(['paragraph'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      heading: { content: schema.content.text() },
      paragraph: { content: schema.content.text() },
      quote: {
        content: schema.content.types([...quoted], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id,
    properties,
    root: schema.content.types(['box', 'heading', 'paragraph', 'quote'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'preserve',
    version,
  });

const leftOut = (value: string) =>
  property.string({ default: value, omitDefault: true });

const QuoteColor = colorSchema('carried-moves-quote-color', [
  schema.textProperty('color', leftOut('u'), {
    target: notInQuote('paragraph'),
  }),
]);

const QuoteHeadingColor = colorSchema(
  'carried-moves-quote-heading-color',
  [
    schema.textProperty('color', leftOut('u'), {
      target: notInQuote('paragraph'),
      typeChange: 'preserve-if-allowed',
    }),
    schema.textProperty('color', leftOut('w'), {
      target: notInQuote('heading'),
      typeChange: 'preserve-if-allowed',
    }),
  ],
  ['heading', 'paragraph']
);

const QuotedHeadings = colorSchema(
  'carried-moves-quoted-headings',
  [
    schema.textProperty('color', leftOut('u'), {
      target: notInQuote('paragraph'),
    }),
  ],
  ['heading', 'paragraph']
);

const Enums = colorSchema('carried-moves-enums', [
  schema.textProperty(
    'color',
    property.enum(['u', 'v'], { default: 'u', omitDefault: true }),
    { target: notInQuote('paragraph') }
  ),
  schema.textProperty(
    'color',
    property.enum(['w', 'x'], { default: 'w', omitDefault: true }),
    {
      target: target.and(
        target.type('paragraph'),
        target.parent(target.type('quote'))
      ),
    }
  ),
]);

const OnlyParagraphs = colorSchema('carried-moves-only-paragraphs', [
  schema.textProperty('color', leftOut('u'), {
    target: target.type('paragraph'),
  }),
]);

const Links = defineEditorSchema('carried-moves-links', {
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
    quote: {
      content: schema.content.types(['heading', 'paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 'carried-moves-links',
  properties: [
    schema.textProperty('color', leftOut('u'), {
      target: notInQuote('paragraph'),
    }),
    schema.elementProperty('ref', leftOut('u'), {
      target: target.and(
        target.type('link'),
        target.parent(notInQuote('paragraph'))
      ),
    }),
  ],
  root: schema.content.types(['heading', 'paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'preserve',
  version: 1,
});

const RefInParagraph = defineEditorSchema('carried-moves-ref-in-paragraph', {
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
  id: 'carried-moves-ref-in-paragraph',
  properties: [
    schema.elementProperty('ref', property.string(), {
      target: target.and(
        target.type('link'),
        target.parent(target.type('paragraph'))
      ),
    }),
  ],
  root: schema.content.types(['heading', 'paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'preserve',
  version: 1,
});

const OpenBox = defineEditorSchema('carried-moves-open-box', {
  elements: {
    box: { content: schema.content.open({ default: 'text', min: 1 }) },
  },
  id: 'carried-moves-open-box',
  properties: [
    schema.textProperty('color', leftOut('u'), {
      target: target.type('box'),
    }),
  ],
  root: schema.content.types(['box'], { default: { type: 'box' }, min: 1 }),
  unknown: 'preserve',
  version: 1,
});

const Titles = defineEditorSchema('carried-moves-titles', {
  elements: {
    quote: {
      content: schema.content.types(['title'], {
        default: { type: 'title' },
        min: 1,
      }),
    },
    title: {
      content: schema.content.text(),
      slice: { preserveContext: true },
    },
  },
  id: 'carried-moves-titles',
  properties: [
    schema.textProperty('color', leftOut('u'), {
      target: notInQuote('title'),
    }),
  ],
  root: schema.content.types(['title', 'quote'], {
    default: { type: 'title' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const Code = defineEditorSchema('carried-moves-code', {
  elements: {
    code_block: {
      content: schema.content.types(['code_line'], {
        default: { type: 'code_line' },
        min: 1,
      }),
      slice: { preserveContext: true },
    },
    code_line: { content: schema.content.text() },
    paragraph: { content: schema.content.text() },
    quote: {
      content: schema.content.types(['paragraph', 'code_block'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  id: 'carried-moves-code',
  properties: [
    schema.textProperty('color', leftOut('u'), {
      target: notInQuote('paragraph'),
    }),
  ],
  root: schema.content.types(['code_block', 'paragraph', 'quote'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
  version: 1,
});

const plainEditor = (plugin: Plugin, value: unknown) =>
  createEditor({ initialValue: value as never, plugins: [plugin, transfer()] });

const edit = (
  plugin: Plugin,
  value: unknown,
  run: (tx: EditorUpdateTransaction) => void
) => {
  const editor = plainEditor(plugin, value);

  editor.update((tx) => run(tx));

  return editor.read.value().children as unknown as Node[];
};

const p = (text: string, color?: string): Node => ({
  children: [color === undefined ? { text } : { color, text }],
  type: 'paragraph',
});
const block = (type: string, ...children: Node[]): Node => ({
  children,
  type,
});
const quoteQ = block('quote', p('q'));
const wrapAt = (tx: EditorUpdateTransaction, at: number[]) =>
  tx.nodes.wrap({ children: [], type: 'quote' }, { at });
const range = (
  [anchorPath, anchorOffset]: [number[], number],
  [focusPath, focusOffset]: [number[], number]
) => ({
  anchor: { offset: anchorOffset, path: anchorPath },
  focus: { offset: focusOffset, path: focusPath },
});
const heading = (text: string): Node => block('heading', { text });
const link = (text: string, ref?: string): Node => ({
  children: [{ text }],
  type: 'link',
  ...(ref === undefined ? {} : { ref }),
});
const backspaceAt = (path: number[]) => (tx: EditorUpdateTransaction) => {
  tx.selection.set(range([path, 0], [path, 0]));
  tx.text.deleteBackward({ unit: 'character' });
};
/** A command whose transaction runs `run`, so an authored editor frames it. */
const framed = (name: string, run: (tx: EditorUpdateTransaction) => void) => {
  const command = defineCommand(`carried-moves.${name}`, {
    build: ({ state }) => state.transaction((tx) => run(tx)),
  });

  return (tx: EditorUpdateTransaction) => tx.command(command);
};
const mergeEqualTexts = (nodes: readonly Node[]): Node[] =>
  nodes.reduce<Node[]>((out, node) => {
    const next = node.children
      ? { ...node, children: mergeEqualTexts(node.children) }
      : node;
    const last = out.at(-1);
    const { text: _last, ...lastProps } = last ?? {};
    const { text: _next, ...nextProps } = next;

    if (
      last?.text !== undefined &&
      next.text !== undefined &&
      isDeepStrictEqual(lastProps, nextProps)
    ) {
      out[out.length - 1] = { ...last, text: last.text + next.text };
    } else {
      out.push(next);
    }

    return out;
  }, []);
const texts = (nodes: readonly Node[]): Node[] =>
  nodes.flatMap((node) => (node.children ? texts(node.children) : [node]));
const linkInParagraph = (ref = 'u') => [
  block('paragraph', { text: 'a' }, link('bc', ref), { text: 'd' }),
  block('quote', heading('h')),
];
const dragLinkIntoHeading = (
  editor: ReturnType<typeof plainEditor>,
  from: [number[], number] = [[0, 0], 1]
) =>
  editor.api.transfer.move({
    range: range(from, [[0, 2], 0]),
    to: { point: { offset: 1, path: [1, 0, 0] } },
  }).status;
const linkInHeading = [
  p('ad'),
  block('quote', block('heading', { text: 'h' }, link('bc'), { text: '' })),
];
const titleAb = [
  block('title', { color: 'u', text: 'ab' }),
  block('quote', block('title', { text: '' })),
];
const dragOutOfTitle = (editor: ReturnType<typeof plainEditor>) =>
  editor.api.transfer.move({
    range: range([[0, 0], 1], [[0, 0], 2]),
    to: { point: { offset: 0, path: [1, 0, 0] } },
  }).status;
const codeThenColored = [
  block('code_block', block('code_line', { text: 'xy' })),
  p('ab', 'u'),
  quoteQ,
];
const dragOutOfCode = (editor: ReturnType<typeof plainEditor>) =>
  editor.api.transfer.move({
    range: range([[0, 0, 0], 1], [[1, 0], 1]),
    to: { point: { offset: 1, path: [2, 0, 0] } },
  }).status;
const codeMoved = [
  block('code_block', block('code_line', { text: 'x' })),
  p('b', 'u'),
  block(
    'quote',
    p('q'),
    block('code_block', block('code_line', { text: 'y' })),
    p('a')
  ),
];
const proposedView = (plugin: Plugin, value: unknown) =>
  unmarked(
    authoredTestApi(authoredEditor(plugin, value, 'zed')).project('proposed')
      .value.children as unknown as Node[]
  );

describe('carried moves', () => {
  describe('plain editors', () => {
    it('C1: applies a delete and a wrap in one update, and the text stores no color', () => {
      assert.deepEqual(
        edit(QuoteColor, [p('ab', 'u'), quoteQ], (tx) => {
          tx.text.delete({ at: range([[0, 0], 0], [[0, 0], 1]) });
          wrapAt(tx, [0]);
        }),
        [block('quote', p('b')), quoteQ]
      );
    });

    it('C3: wraps a paragraph beside a new heading that holds equal content', () => {
      const colored = {
        children: [{ color: 'u', text: 'a' }],
        type: 'heading',
      };

      assert.deepEqual(
        edit(QuoteHeadingColor, [p('a', 'u'), quoteQ], (tx) => {
          tx.nodes.insert(colored, { at: [1] });
          wrapAt(tx, [0]);
        }),
        [block('quote', p('a')), colored, quoteQ]
      );
    });

    it('C4 guard: refuses a new paragraph holding the color in the quote, whatever equal content stands elsewhere', () => {
      assert.throws(
        () =>
          edit(QuoteColor, [p('a', 'u'), quoteQ], (tx) =>
            tx.nodes.insert(p('a', 'u'), { at: [1, 1] })
          ),
        /cannot target/
      );
    });

    it('C5 guard: refuses wrapping a heading that stores the paragraph default, after its text becomes equal to a paragraph’s', () => {
      assert.throws(
        () =>
          edit(
            QuoteHeadingColor,
            [
              p('a', 'u'),
              { children: [{ color: 'u', text: 'b' }], type: 'heading' },
            ],
            (tx) => {
              tx.text.delete({ at: range([[1, 0], 0], [[1, 0], 1]) });
              tx.text.insert('a', { at: { offset: 0, path: [1, 0] } });
              wrapAt(tx, [1]);
            }
          ),
        /cannot target/
      );
    });

    it('C6 guard: refuses a transfer of a paragraph storing the color into a quote in another root', () => {
      const Card = defineEditorSchema('carried-moves-card', {
        elements: {
          card: {
            content: schema.content.text({ default: 'text', min: 1 }),
            contentRoots: {
              body: {
                content: schema.content.types(['paragraph', 'quote'], {
                  default: { type: 'paragraph' },
                  min: 1,
                }),
                ownership: 'exclusive',
              },
            },
          },
          paragraph: { content: schema.content.text() },
          quote: {
            content: schema.content.types(['paragraph'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
          },
        },
        id: 'carried-moves-card',
        properties: [
          schema.textProperty('color', leftOut('u'), {
            target: notInQuote('paragraph'),
          }),
        ],
        root: schema.content.types(['card', 'paragraph', 'quote'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'preserve',
        version: 1,
      });
      const start = [
        p('a', 'u'),
        {
          childRoots: { body: 'card:1' },
          children: [{ text: '' }],
          type: 'card',
        },
      ];
      const editor = createEditor({
        initialValue: {
          children: start,
          roots: { 'card:1': [quoteQ] },
        } as never,
        plugins: [Card, transfer()],
      });
      const body = createEditorView(editor, { root: 'card:1' });
      let status: string;

      try {
        ({ status } = body.api.transfer.move({
          from: editor,
          nodes: [editor.key([0])!],
          to: { edge: 'after', key: body.key([0, 0])! },
        }));
      } catch (error) {
        assert.match(String(error), /cannot target/);
        status = 'threw';
      }

      assert.notEqual(status, 'moved');
      assert.deepEqual(editor.read.value(), {
        children: start,
        roots: { 'card:1': [quoteQ] },
      });
    });

    it('C7: moves a paragraph into a quote and drops the color', () => {
      assert.deepEqual(
        edit(QuoteColor, [p('a', 'u'), quoteQ], (tx) =>
          tx.nodes.move({ at: [0], to: [1, 1] })
        ),
        [block('quote', p('q'), p('a'))]
      );
    });

    it('C7: transfers a paragraph into a quote of the same root and drops the color', () => {
      const editor = plainEditor(QuoteColor, [p('a', 'u'), quoteQ]);
      const result = editor.api.transfer.move({
        nodes: [editor.key([0])!],
        to: { edge: 'after', key: editor.key([1, 0])! },
      });

      assert.deepEqual(
        { children: editor.read.value().children, status: result.status },
        { children: [block('quote', p('q'), p('a'))], status: 'moved' }
      );
    });

    it('C8: retypes a box to a quote, and its paragraph’s text stores no color', () => {
      assert.deepEqual(
        edit(QuoteColor, [block('box', p('a', 'u'))], (tx) =>
          tx.nodes.set({ type: 'quote' }, { at: [0] })
        ),
        [block('quote', p('a'))]
      );
    });

    describe('C9: a text drag into a quoted paragraph of the same root', () => {
      const drag = (
        start: Node[],
        selection: ReturnType<typeof range>,
        offset: number
      ) => {
        const editor = plainEditor(QuoteColor, start);
        const result = editor.api.transfer.move({
          range: selection,
          to: { point: { offset, path: [start.length - 1, 0, 0] } },
        });

        return {
          children: editor.read.value().children,
          status: result.status,
        };
      };

      it('moves b after q and drops its color', () => {
        assert.deepEqual(
          drag([p('ab', 'u'), quoteQ], range([[0, 0], 1], [[0, 0], 2]), 1),
          {
            children: [p('a', 'u'), block('quote', p('qb'))],
            status: 'moved',
          }
        );
      });

      it('moves b to the quoted paragraph’s start and drops its color', () => {
        assert.deepEqual(
          drag([p('ab', 'u'), quoteQ], range([[0, 0], 1], [[0, 0], 2]), 0),
          {
            children: [p('a', 'u'), block('quote', p('bq'))],
            status: 'moved',
          }
        );
      });

      it('moves a payload of two paragraphs and drops their colors', () => {
        assert.deepEqual(
          drag(
            [p('ab', 'u'), p('cd', 'u'), quoteQ],
            range([[0, 0], 1], [[1, 0], 1]),
            1
          ),
          {
            children: [p('ad', 'u'), block('quote', p('qb'), p('c'))],
            status: 'moved',
          }
        );
      });
    });

    it('drags a range holding a link that stores the left-out ref into a quoted heading, and the link stores no ref', () => {
      const editor = plainEditor(Links, linkInParagraph());
      const status = dragLinkIntoHeading(editor);

      assert.deepEqual(
        { children: editor.read.value().children, status },
        { children: linkInHeading, status: 'moved' }
      );
    });

    it('drags the tail of a link that stores the left-out ref into a quoted heading, and only the moved half stores no ref', () => {
      const editor = plainEditor(Links, linkInParagraph());
      const status = dragLinkIntoHeading(editor, [[0, 1, 0], 1]);

      assert.deepEqual(
        { children: editor.read.value().children, status },
        {
          children: [
            block('paragraph', { text: 'a' }, link('b', 'u'), { text: 'd' }),
            block(
              'quote',
              block('heading', { text: 'h' }, link('c'), { text: '' })
            ),
          ],
          status: 'moved',
        }
      );
    });

    it('guard: refuses dragging a link whose ref is not the left-out default into a quoted heading', () => {
      const editor = plainEditor(Links, linkInParagraph('x'));

      assert.notEqual(dragLinkIntoHeading(editor), 'moved');
      assert.deepEqual(editor.read.value().children, linkInParagraph('x'));
    });

    it('drags the tail of a title that keeps its slice context into a quoted title, and only the moved letter stores no color', () => {
      const editor = plainEditor(Titles, titleAb);
      const status = dragOutOfTitle(editor);

      assert.deepEqual(
        { children: editor.read.value().children, status },
        {
          children: [
            block('title', { color: 'u', text: 'a' }),
            block('quote', block('title', { text: 'b' })),
          ],
          status: 'moved',
        }
      );
    });

    it('drags from inside a code block that keeps its context through a colored paragraph into a quote, and the moved text stores no color', () => {
      const editor = plainEditor(Code, codeThenColored);
      const status = dragOutOfCode(editor);

      assert.deepEqual(
        { children: editor.read.value().children, status },
        { children: codeMoved, status: 'moved' }
      );
    });

    it('moves a text that stores the left-out color into a parent type an open schema never declared, and the text stores no color', () => {
      assert.deepEqual(
        edit(
          OpenBox,
          [
            block('box', { color: 'u', text: 'a' }),
            block('box', block('foreign', { text: 'q' })),
          ],
          (tx) => tx.nodes.move({ at: [0, 0], to: [1, 0, 1] })
        ),
        [
          block('box', { text: '' }),
          block('box', block('foreign', { text: 'qa' })),
        ]
      );
    });

    it('applies an insertion, a split and a wrap of the tail in one update on every run, and the tail stores no color', () => {
      // The former-place sweep keeps its runs in a treap with random
      // priorities, so a lookup that depends on their order fails only on
      // some runs.
      for (let run = 0; run < 40; run += 1) {
        assert.deepEqual(
          edit(QuoteColor, [p('ab', 'u')], (tx) => {
            tx.text.insert('z', { at: { offset: 0, path: [0, 0] } });
            tx.nodes.split({ at: { offset: 2, path: [0, 0] } });
            wrapAt(tx, [1]);
          }),
          [p('za', 'u'), block('quote', p('b'))],
          `run ${run}`
        );
      }
    });

    it('C10 guard: refuses wrapping a heading that kept the paragraph default through a retype', () => {
      const editor = plainEditor(QuoteHeadingColor, [p('a', 'u'), quoteQ]);

      editor.update((tx) => tx.nodes.set({ type: 'heading' }, { at: [0] }));
      assert.deepEqual(editor.read.value().children[0], {
        children: [{ color: 'u', text: 'a' }],
        type: 'heading',
      });
      assert.throws(
        () => editor.update((tx) => wrapAt(tx, [0])),
        /cannot target/
      );
    });

    it('C11: wraps a paragraph whose color the quote declares another way, and the text reads the quote’s default', () => {
      const editor = plainEditor(Enums, [p('a', 'u')]);

      editor.update((tx) => wrapAt(tx, [0]));
      const [quote] = editor.read.value().children as unknown as Node[];
      const paragraph = quote.children![0];

      assert.deepEqual(quote, block('quote', p('a')));
      assert.equal(
        editor.read.schema.getProperty(
          paragraph.children![0] as never,
          'color',
          {
            ancestors: [quote as never],
            parent: paragraph as never,
          }
        ),
        'w'
      );
    });

    it('C12: Backspace at the start of a paragraph merges it into a heading, and the text stores no color', () => {
      assert.deepEqual(
        edit(OnlyParagraphs, [heading('h'), p('ab', 'u')], backspaceAt([1, 0])),
        [heading('hab')]
      );
    });

    it('D5 guard: refuses a moved text that merges with an inserted one storing the color', () => {
      assert.throws(
        () =>
          edit(QuoteColor, [p('a', 'u'), quoteQ], (tx) => {
            tx.nodes.move({ at: [0], to: [1, 1] });
            tx.nodes.insert({ color: 'u', text: 'b' } as never, {
              at: [0, 1, 1],
            });
          }),
        /cannot target/
      );
    });

    it('G1 guard: one update that wraps and unwraps keeps the color', () => {
      assert.deepEqual(
        edit(QuoteColor, [p('a', 'u')], (tx) => {
          wrapAt(tx, [0]);
          tx.nodes.unwrap({ at: [0] });
        }),
        [p('a', 'u')]
      );
    });

    it('G1: a wrap and an unwrap with a finalize between give the paragraph back storing nothing', () => {
      const editor = plainEditor(QuoteColor, [p('a', 'u')]);

      editor.update((tx) => wrapAt(tx, [0]));
      editor.update((tx) => tx.nodes.unwrap({ at: [0] }));
      assert.deepEqual(editor.read.value().children, [p('a')]);
    });

    it('G2: a move before a migration that writes the document drops the color as without the migration', () => {
      const slot = definePluginSlot('carried-moves-revision');
      const revision = (version: number) =>
        colorSchema(
          'carried-moves-revision',
          [
            schema.textProperty('color', leftOut('u'), {
              target: notInQuote('paragraph'),
            }),
            ...(version === 2
              ? [
                  schema.elementProperty('align', property.string(), {
                    target: target.type('heading'),
                  }),
                ]
              : []),
          ],
          ['paragraph'],
          version
        );
      const editor = createEditor({
        initialValue: [p('a', 'u'), block('heading', { text: 'h' }), quoteQ],
        plugins: [slot.of(revision(1)), transfer()],
      });

      editor.update((tx) => {
        tx.nodes.move({ at: [0], to: [2, 1] });
        tx.plugins.reconfigure(slot, revision(2), {
          migrate: ({ document }) => ({
            ...document,
            children: document.children.map((node) =>
              (node as Node).type === 'heading'
                ? { ...node, align: 'left' }
                : node
            ),
          }),
        });
      });
      assert.deepEqual(editor.read.value().children, [
        { ...block('heading', { text: 'h' }), align: 'left' },
        block('quote', p('q'), p('a')),
      ]);
    });

    it('G2: moves on both sides of a split that settles the draft each drop the color', () => {
      const editor = plainEditor(QuoteColor, [
        p('a', 'u'),
        p('b', 'u'),
        p('cd'),
        quoteQ,
      ]);

      editor.update((tx) => {
        tx.nodes.move({ at: [0], to: [3, 1] });
        tx.selection.set({
          anchor: { offset: 1, path: [1, 0] },
          focus: { offset: 1, path: [1, 0] },
        });
        tx.nodes.split();
        tx.nodes.move({ at: [0], to: [3, 2] });
      });
      assert.deepEqual(editor.read.value().children, [
        p('c'),
        p('d'),
        block('quote', p('q'), p('a'), p('b')),
      ]);
    });
  });

  describe('authored editors', () => {
    const decideAll = (
      plugin: Plugin,
      value: unknown,
      decisions: ReadonlyArray<
        Readonly<{ action: 'accept' | 'reject'; changes: string[] }>
      >
    ) => {
      const editor = authoredEditor(plugin, value, 'zed');

      authoredTestApi(editor).decide(decisions);

      return mergeEqualTexts(unmarked(editor.read.value().children));
    };
    const rejected = (plugin: Plugin, value: unknown, ...changes: string[]) =>
      decideAll(
        plugin,
        value,
        changes.map((change) => ({ action: 'reject', changes: [change] }))
      );
    const accepted = (plugin: Plugin, value: unknown, ...changes: string[]) =>
      decideAll(plugin, value, [{ action: 'accept', changes }]);
    const assertUncolored = (quote: Node, ...letters: string[]) => {
      const inside = texts([quote]);

      assert.equal(quote.type, 'quote', JSON.stringify(quote));
      assert.ok(
        letters.every((letter) => inside.some(({ text }) => text === letter)),
        JSON.stringify(quote)
      );
      assert.ok(
        inside.every(({ color }) => color === undefined),
        JSON.stringify(quote)
      );
    };
    const bobStrikesB = () =>
      commit(QuoteColor, [p('ab', 'u'), quoteQ], 'bob', 'propose', (tx) =>
        tx.text.delete({ at: range([[0, 0], 1], [[0, 0], 2]) })
      );

    it('C1: an Editing update deletes text and wraps the paragraph, and the text stores no color', () => {
      const written = commit(
        QuoteColor,
        [p('ab', 'u'), quoteQ],
        'alice',
        'edit',
        (tx) => {
          tx.text.delete({ at: range([[0, 0], 1], [[0, 0], 2]) });
          wrapAt(tx, [0]);
        }
      );

      assert.deepEqual(unmarked(written), [block('quote', p('a')), quoteQ]);
    });

    it('C10 guard: an Editing wrap refuses a heading that kept the paragraph default through a retype', () => {
      const editor = authoredEditor(
        QuoteHeadingColor,
        [p('a', 'u'), quoteQ],
        'alice'
      );

      editor.update((tx) => tx.nodes.set({ type: 'heading' }, { at: [0] }));
      assert.deepEqual(unmarked(editor.read.value().children as never)[0], {
        children: [{ color: 'u', text: 'a' }],
        type: 'heading',
      });
      assert.throws(
        () => editor.update((tx) => wrapAt(tx, [0])),
        /cannot target/
      );
    });

    it('C12: an Editing Backspace merges a paragraph into a heading, and the text stores no color', () => {
      assert.deepEqual(
        unmarked(
          commit(
            OnlyParagraphs,
            [heading('h'), p('ab', 'u')],
            'alice',
            'edit',
            backspaceAt([1, 0])
          )
        ),
        [heading('hab')]
      );
    });

    it('Editing refuses a carried value that is not the left-out default, while proposing and then accepting the same change drops it where it lands', () => {
      const start = [heading('h'), p('ab', 'v')];

      assert.throws(
        () =>
          commit(OnlyParagraphs, start, 'alice', 'edit', backspaceAt([1, 0])),
        /cannot target/
      );

      const proposed = commit(
        OnlyParagraphs,
        start,
        'alice',
        'propose',
        backspaceAt([1, 0])
      );

      assert.deepEqual(accepted(OnlyParagraphs, proposed, 'alice'), [
        heading('hab'),
      ]);
    });

    it('D1: one suggestion inserts a letter mid-text and wraps the paragraph; accepting drops the color and rejecting gives it back', () => {
      const written = commit(
        QuoteColor,
        [p('ab', 'u')],
        'alice',
        'propose',
        (tx) => {
          tx.text.insert('x', { at: { offset: 1, path: [0, 0] } });
          wrapAt(tx, [0]);
        }
      );

      assert.deepEqual(accepted(QuoteColor, written, 'alice'), [
        block('quote', p('axb')),
      ]);
      assert.deepEqual(rejected(QuoteColor, written, 'alice'), [p('ab', 'u')]);
    });

    it('D8: a proposed Backspace merging links whose ref has no place in the heading records, and the review document keeps the refs under the paragraph', () => {
      const start = [
        heading('h'),
        block(
          'paragraph',
          { text: '' },
          link('a', 'x'),
          { text: '' },
          link('b', 'y'),
          { text: '' }
        ),
      ];
      const written = commit(
        RefInParagraph,
        start,
        'dave',
        'propose',
        backspaceAt([1, 0])
      );

      assert.deepEqual(
        written[1].children!.flatMap((node) =>
          node.type === 'link' ? [node.ref] : []
        ),
        ['x', 'y']
      );
      assert.deepEqual(rejected(RefInParagraph, written, 'dave'), start);
    });

    it('D10 guard: an Editing wrap refuses a heading text whose place another change has pending, before and after rejecting it', () => {
      const ed = commit(
        QuoteHeadingColor,
        [heading('a'), quoteQ],
        'ed',
        'edit',
        (tx) => tx.nodes.set({ color: 'u' }, { at: [0, 0] })
      );
      const bob = commit(QuoteHeadingColor, ed, 'bob', 'propose', (tx) =>
        tx.nodes.set({ type: 'paragraph' }, { at: [0] })
      );

      assert.throws(
        () =>
          commit(QuoteHeadingColor, bob, 'alice', 'edit', (tx) =>
            wrapAt(tx, [0])
          ),
        /cannot target/
      );

      const editor = authoredEditor(QuoteHeadingColor, bob, 'zed');

      authoredTestApi(editor).decide({ action: 'reject', changes: ['bob'] });
      assert.throws(
        () =>
          commit(
            QuoteHeadingColor,
            editor.read.value().children,
            'alice',
            'edit',
            (tx) => wrapAt(tx, [0])
          ),
        /cannot target/
      );
    });

    describe('M1: a proposed Backspace merges a paragraph whose text stores the color directly into a heading', () => {
      const start = [heading('h'), p('ab')];
      const ed = () =>
        commit(OnlyParagraphs, start, 'ed', 'edit', (tx) =>
          tx.nodes.set({ color: 'u' }, { at: [1, 0] })
        );

      it('records, and the preview and accepting Dave give hab with no color', () => {
        const written = commit(
          OnlyParagraphs,
          ed(),
          'dave',
          'propose',
          backspaceAt([1, 0])
        );

        assert.deepEqual(proposedView(OnlyParagraphs, written), [
          heading('hab'),
        ]);
        assert.deepEqual(accepted(OnlyParagraphs, written, 'dave'), [
          heading('hab'),
        ]);
        assert.deepEqual(rejected(OnlyParagraphs, written, 'dave'), [
          heading('h'),
          p('ab', 'u'),
        ]);
      });

      it('accepting Dave with an unrelated change gives zhab with no color', () => {
        const carol = commit(OnlyParagraphs, ed(), 'carol', 'propose', (tx) =>
          tx.text.insert('z', { at: { offset: 0, path: [0, 0] } })
        );
        const written = commit(
          OnlyParagraphs,
          carol,
          'dave',
          'propose',
          backspaceAt([1, 0])
        );

        assert.deepEqual(accepted(OnlyParagraphs, written, 'carol', 'dave'), [
          heading('zhab'),
        ]);
      });
    });

    describe('M2: later proposals at a heading whose pending join holds a colored paragraph', () => {
      const start = [
        block('heading', { text: '' }, link('h'), { text: '' }),
        p('ab', 'u'),
      ];
      const dave = () =>
        commit(Links, start, 'dave', 'propose', backspaceAt([1, 0]));
      const keepsColorUnderParagraph = (written: readonly Node[]) =>
        assert.ok(
          written.some(
            (node) =>
              node.type === 'paragraph' &&
              texts([node]).some(
                ({ color, text }) => color === 'u' && text === 'ab'
              )
          ),
          JSON.stringify(written)
        );

      it('Dave records and the proposed view shows no color at the heading', () => {
        const written = dave();

        keepsColorUnderParagraph(written);
        assert.ok(
          texts(proposedView(Links, written)).every(
            ({ color }) => color === undefined
          )
        );
      });

      it('Alice proposing to unlink h records', () => {
        const written = commit(
          Links,
          dave(),
          'alice',
          'propose',
          framed('unlink', (tx) => tx.nodes.unwrap({ at: [0, 1] }))
        );

        keepsColorUnderParagraph(written);
        assert.ok(
          texts(proposedView(Links, written)).every(
            ({ color }) => color === undefined
          )
        );
      });

      it('Alice typing at the heading’s end records', () => {
        const written = commit(
          Links,
          dave(),
          'alice',
          'propose',
          framed('type-at-end', (tx) => {
            const [node] = tx.nodes.get([0])! as unknown as [Node];
            const last = node.children!.length - 1;

            tx.text.insert('x', {
              at: {
                offset: node.children![last].text!.length,
                path: [0, last],
              },
            });
          })
        );

        keepsColorUnderParagraph(written);
        assert.match(
          texts(proposedView(Links, written))
            .map(({ text }) => text)
            .join(''),
          /habx/
        );
      });
    });

    for (const intent of ['edit', 'propose'] as const) {
      const mode = intent === 'edit' ? 'Editing' : 'Suggesting';
      const settle = (plugin: Plugin, value: readonly Node[]) =>
        intent === 'edit' ? unmarked(value) : accepted(plugin, value, 'alice');
      const givesBack = (
        plugin: Plugin,
        value: readonly Node[],
        start: Node[]
      ) => {
        if (intent === 'propose') {
          assert.deepEqual(rejected(plugin, value, 'alice'), start);
        }
      };

      it(`C2: ${mode} inserts a letter and wraps the paragraph, and rejecting gives the color back`, () => {
        const start = [p('a', 'u'), quoteQ];
        const written = commit(QuoteColor, start, 'alice', intent, (tx) => {
          tx.text.insert('x', { at: { offset: 1, path: [0, 0] } });
          wrapAt(tx, [0]);
        });

        assert.deepEqual(settle(QuoteColor, written), [
          block('quote', p('ax')),
          quoteQ,
        ]);
        givesBack(QuoteColor, written, start);
      });

      it(`C7: ${mode} moves a paragraph into a quote and drops the color`, () => {
        const start = [p('a', 'u'), quoteQ];
        const written = commit(QuoteColor, start, 'alice', intent, (tx) =>
          tx.nodes.move({ at: [0], to: [1, 1] })
        );

        assert.deepEqual(settle(QuoteColor, written), [
          block('quote', p('q'), p('a')),
        ]);
        givesBack(QuoteColor, written, start);
      });

      it(`C8: ${mode} retypes a box to a quote, and its paragraph’s text stores no color`, () => {
        const start = [block('box', p('a', 'u'))];
        const written = commit(QuoteColor, start, 'alice', intent, (tx) =>
          tx.nodes.set({ type: 'quote' }, { at: [0] })
        );

        assert.deepEqual(settle(QuoteColor, written), [block('quote', p('a'))]);
        givesBack(QuoteColor, written, start);
      });

      describe(`C9: a ${mode} text drag into a quoted paragraph of the same root`, () => {
        const drag = (
          start: Node[],
          selection: ReturnType<typeof range>,
          offset: number
        ) => {
          const editor = authoredEditor(QuoteColor, start, 'alice', intent);
          const result = editor.api.transfer.move({
            range: selection,
            to: { point: { offset, path: [start.length - 1, 0, 0] } },
          });

          assert.equal(result.status, 'moved');

          return editor.read.value().children as unknown as Node[];
        };

        it('moves b after q and drops its color, and rejecting gives ab back', () => {
          const start = [p('ab', 'u'), quoteQ];
          const written = drag(start, range([[0, 0], 1], [[0, 0], 2]), 1);

          assert.deepEqual(settle(QuoteColor, written), [
            p('a', 'u'),
            block('quote', p('qb')),
          ]);
          givesBack(QuoteColor, written, start);
        });

        it('moves a payload of two paragraphs and drops their colors', () => {
          const start = [p('ab', 'u'), p('cd', 'u'), quoteQ];
          const written = drag(start, range([[0, 0], 1], [[1, 0], 1]), 1);

          assert.deepEqual(settle(QuoteColor, written), [
            p('ad', 'u'),
            block('quote', p('qb'), p('c')),
          ]);
          givesBack(QuoteColor, written, start);
        });
      });

      it(`${mode} drags a range holding a link that stores the left-out ref into a quoted heading, and the link stores no ref`, () => {
        const editor = authoredEditor(
          Links,
          linkInParagraph(),
          'alice',
          intent
        );

        assert.equal(dragLinkIntoHeading(editor), 'moved');

        const written = editor.read.value().children as unknown as Node[];

        assert.deepEqual(settle(Links, written), linkInHeading);
        givesBack(Links, written, linkInParagraph());
      });

      it(`${mode} drags the tail of a title that keeps its slice context into a quoted title, and only the moved letter stores no color`, () => {
        const editor = authoredEditor(Titles, titleAb, 'alice', intent);

        assert.equal(dragOutOfTitle(editor), 'moved');

        const written = editor.read.value().children as unknown as Node[];

        assert.deepEqual(settle(Titles, written), [
          block('title', { color: 'u', text: 'a' }),
          block('quote', block('title', { text: 'b' })),
        ]);
        givesBack(Titles, written, titleAb);
      });

      it(`${mode} drags from inside a code block that keeps its context through a colored paragraph into a quote, and the moved text stores no color`, () => {
        const editor = authoredEditor(Code, codeThenColored, 'alice', intent);

        assert.equal(dragOutOfCode(editor), 'moved');

        const written = editor.read.value().children as unknown as Node[];

        assert.deepEqual(settle(Code, written), codeMoved);
        givesBack(Code, written, codeThenColored);
      });

      it(`C11: ${mode} wraps a paragraph whose color the quote declares another way`, () => {
        const start = [p('a', 'u')];
        const written = commit(Enums, start, 'alice', intent, (tx) =>
          wrapAt(tx, [0])
        );

        assert.deepEqual(settle(Enums, written), [block('quote', p('a'))]);
        givesBack(Enums, written, start);
      });

      it(`D2: ${mode} wraps through replaceChildren beside Bob’s struck letter, and the color drops on both`, () => {
        const wrapWhole = (tx: EditorUpdateTransaction) => {
          const [node] = tx.nodes.get([0])! as unknown as [Node];

          tx.nodes.replaceChildren([block('quote', node)] as never, {
            at: [],
            count: 1,
          });
        };

        for (const write of [wrapWhole, framed('wrap-whole', wrapWhole)]) {
          const bob = bobStrikesB();
          const written = commit(QuoteColor, bob, 'alice', intent, write);

          assertUncolored(
            written.find(({ type }) => type === 'quote')!,
            'a'
          );
          assert.deepEqual(accepted(QuoteColor, written, 'bob', 'alice'), [
            block('quote', p('a')),
            quoteQ,
          ]);
          givesBack(QuoteColor, written, mergeEqualTexts(unmarked(bob)));
        }
      });

      it(`D3: ${mode} moves the paragraph beside Bob’s struck letter into the quote, and the color drops on both`, () => {
        const move = (tx: EditorUpdateTransaction) =>
          tx.nodes.move({ at: [0], to: [1, 1] });

        for (const write of [move, framed('move-into-quote', move)]) {
          const bob = bobStrikesB();
          const written = commit(QuoteColor, bob, 'alice', intent, write);

          assertUncolored(written.at(-1)!, 'a', 'b');
          givesBack(QuoteColor, written, mergeEqualTexts(unmarked(bob)));
        }

        const editor = authoredEditor(
          QuoteColor,
          bobStrikesB(),
          'alice',
          intent
        );
        const result = editor.api.transfer.move({
          nodes: [editor.key([0])!],
          to: { edge: 'after', key: editor.key([1, 0])! },
        });

        assert.equal(result.status, 'moved');
        assertUncolored(
          (editor.read.value().children as unknown as Node[]).at(-1)!,
          'a',
          'b'
        );
      });

      it(`D4 guard: ${mode} refuses moving a paragraph whose color Bob proposes`, () => {
        const ed = commit(QuoteColor, [p('a'), quoteQ], 'ed', 'edit', (tx) =>
          tx.nodes.set({ color: 'x' }, { at: [0, 0] })
        );
        const bob = commit(QuoteColor, ed, 'bob', 'propose', (tx) =>
          tx.nodes.set({ color: 'u' }, { at: [0, 0] })
        );

        assert.throws(
          () =>
            commit(QuoteColor, bob, 'alice', intent, (tx) =>
              tx.nodes.move({ at: [0], to: [1, 1] })
            ),
          /cannot target/
        );
      });

      describe(`D11 to D13: ${mode} wraps a heading in a quote through a command while Dave’s Backspace joins a paragraph into it`, () => {
        const wrapHeading = framed('wrap-heading', (tx) => wrapAt(tx, [0]));
        const wrapsUnder = (plugin: Plugin, start: Node[]) => {
          const dave = commit(
            plugin,
            start,
            'dave',
            'propose',
            backspaceAt([1, 0])
          );

          return commit(plugin, dave, 'alice', intent, wrapHeading);
        };

        it('D11: the paragraph’s text stores no color', () => {
          const start = [heading('h'), p('ab', 'u')];
          const written = wrapsUnder(QuotedHeadings, start);

          assert.ok(
            texts(written).every(({ color }) => color === undefined),
            JSON.stringify(written)
          );
          if (intent === 'propose') {
            assert.deepEqual(
              rejected(QuotedHeadings, written, 'alice', 'dave'),
              start
            );
          }
        });

        it('D12: the link stores no ref', () => {
          const start = [
            heading('h'),
            block('paragraph', { text: '' }, link('ab', 'u'), { text: '' }),
          ];
          const written = wrapsUnder(Links, start);

          assert.doesNotMatch(JSON.stringify(unmarked(written)), /"ref"/);
          if (intent === 'propose') {
            assert.deepEqual(rejected(Links, written, 'alice', 'dave'), start);
          }
        });

        it('D13: headings that leave out another color judge the text where the review document keeps it', () => {
          const start = [heading('h'), p('ab', 'u')];
          const written = wrapsUnder(QuoteHeadingColor, start);

          assert.ok(
            texts(written).every(({ color }) => color === undefined),
            JSON.stringify(written)
          );
        });
      });

      it(`G1${intent === 'edit' ? ' guard' : ''}: ${mode} wraps and unwraps in one command and keeps the color`, () => {
        const written = commit(
          QuoteColor,
          [p('a', 'u')],
          'alice',
          intent,
          framed('wrap-unwrap', (tx) => {
            wrapAt(tx, [0]);
            tx.nodes.unwrap({ at: [0] });
          })
        );

        assert.deepEqual(settle(QuoteColor, written), [p('a', 'u')]);
      });

      it(`G1: ${mode} wraps and unwraps as two commands and gives the paragraph back storing nothing`, () => {
        const written = commit(
          QuoteColor,
          [p('a', 'u')],
          'alice',
          intent,
          (tx) => {
            framed('wrap', (inner) => wrapAt(inner, [0]))(tx);
            framed('unwrap', (inner) => inner.nodes.unwrap({ at: [0] }))(tx);
          }
        );

        assert.deepEqual(settle(QuoteColor, written), [p('a')]);
      });
    }
  });

  describe('D6: a suggested property change after a mid-text insertion', () => {
    for (const offset of [0, 1, 2, 3]) {
      it(`unsets bold on every letter after an insertion at offset ${offset}`, () => {
        const proposed = commit(
          Bold,
          [{ children: [{ bold: true, text: 'abc' }], type: 'paragraph' }],
          'alice',
          'propose',
          (tx) => {
            tx.text.insert('x', { at: { offset, path: [0, 0] } });
            tx.nodes.unset('bold', { at: [0, 0] });
          }
        );
        const text = `${'abc'.slice(0, offset)}x${'abc'.slice(offset)}`;

        assert.deepEqual(unmarked(decide(Bold, proposed, 'accept', 'alice')), [
          { children: [{ text }], type: 'paragraph' },
        ]);
      });
    }

    it('guard: unsets bold on the letters beside a struck one after an insertion in the same framed command', () => {
      const bold = [
        { children: [{ bold: true, text: 'abc' }], type: 'paragraph' },
      ];
      const bob = commit(Bold, bold, 'bob', 'propose', (tx) =>
        tx.text.delete({
          at: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 2, path: [0, 0] },
            kind: 'text',
          },
        })
      );
      const insertAndUnset = defineCommand('carried-moves.insert-and-unset', {
        build: ({ state }) =>
          state.transaction((tx) => {
            tx.text.insert('x', { at: { offset: 1, path: [0, 0] } });
            tx.nodes.unset('bold', { at: [0, 0] });
          }),
      });
      const proposed = commit(Bold, bob, 'alice', 'propose', (tx) =>
        tx.command(insertAndUnset)
      );

      assert.deepEqual(unmarked(decide(Bold, proposed, 'accept', 'alice')), [
        {
          children: [{ text: 'a' }, { bold: true, text: 'b' }, { text: 'xc' }],
          type: 'paragraph',
        },
      ]);
    });

    it('unsets bold on the empty texts beside a link as next does', () => {
      const proposed = commit(
        Bold,
        [
          {
            children: [
              { bold: true, text: '' },
              {
                children: [{ bold: true, text: 'ab' }],
                type: 'link',
                url: 'u',
              },
              { bold: true, text: '' },
            ],
            type: 'paragraph',
          },
        ],
        'alice',
        'propose',
        (tx) => {
          tx.text.insert('x', { at: { offset: 1, path: [0, 1, 0] } });
          tx.nodes.unset('bold', { at: [0, 0] });
          tx.nodes.unset('bold', { at: [0, 1, 0] });
          tx.nodes.unset('bold', { at: [0, 2] });
        }
      );

      assert.deepEqual(unmarked(decide(Bold, proposed, 'accept', 'alice')), [
        {
          children: [
            { text: '' },
            { children: [{ text: 'axb' }], type: 'link', url: 'u' },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ]);
    });
  });
});
