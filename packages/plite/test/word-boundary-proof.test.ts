import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fc from 'fast-check';

import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  type EditorExtensionReference,
  type Element,
  schema,
} from '@platejs/plite';
import { getCharacterDistance } from '../src/text-units';
import { getWordDistances } from '../src/utils/string';

type Point = {
  offset: number;
  path: readonly number[];
};

type WordBoundaryCase = Readonly<{
  backward: readonly number[];
  classification: 'equivalent' | 'incompatible' | 'new-value';
  forward: readonly number[];
  label: string;
  text: string;
}>;

const donorWordBoundaryCases: readonly WordBoundaryCase[] = [
  {
    backward: [7, 6, 2, 0],
    classification: 'equivalent',
    forward: [0, 1, 5, 7],
    label: 'simple words',
    text: 'a bbb c',
  },
  {
    backward: [12, 9, 2, 0],
    classification: 'equivalent',
    forward: [0, 3, 12],
    label: 'surrounding whitespace',
    text: '  a      bbb',
  },
  {
    backward: [11, 10, 3, 0],
    classification: 'equivalent',
    forward: [0, 1, 4, 11],
    label: 'punctuation runs',
    text: 'a. b??? / c',
  },
  {
    backward: [4, 2, 0],
    classification: 'equivalent',
    forward: [0, 1, 3, 4],
    label: 'trailing separator',
    text: 'a b ',
  },
  {
    backward: [20, 19, 13, 7, 2, 0],
    classification: 'incompatible',
    forward: [0, 1, 6, 12, 18, 20],
    label: 'mixed Latin and RTL stays in logical model order',
    text: 'a واحد اثنين ثلاثة b',
  },
  {
    backward: [4, 3, 2, 1, 0],
    classification: 'incompatible',
    forward: [0, 1, 2, 3, 4],
    label: 'CJK uses the pinned scalar profile instead of host ICU',
    text: '两只兔子',
  },
  {
    backward: [18, 15, 0],
    classification: 'new-value',
    forward: [0, 14, 18],
    label: 'tag flag and keycap emoji stay whole',
    text: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 #️⃣',
  },
  {
    backward: [12, 4, 0],
    classification: 'new-value',
    forward: [0, 3, 12],
    label: 'keycap and ZWJ emoji stay whole',
    text: '#️⃣ 👩‍❤️‍👨',
  },
  {
    backward: [2, 0],
    classification: 'new-value',
    forward: [0, 2],
    label: 'combining mark stays attached to its base',
    text: 'n\u0303',
  },
];

const offsetsFromDistances = (
  text: string,
  distances: readonly number[],
  reverse: boolean
) => {
  let offset = reverse ? text.length : 0;

  return [
    offset,
    ...distances.map((distance) => {
      offset += reverse ? -distance : distance;

      return offset;
    }),
  ];
};

const getCollapsedPoint = (editor: ReturnType<typeof createEditor>): Point => {
  const selection = editor.read((state) => state.selection());

  assert.ok(selection);
  assert.equal(selection.kind, 'text');
  assert.deepEqual(selection.anchor, selection.focus);

  return selection.anchor;
};

const assertMovementSequence = (
  editor: ReturnType<typeof createEditor>,
  expected: readonly Point[],
  reverse: boolean
) => {
  assert.deepEqual(getCollapsedPoint(editor), expected[0]);

  for (const point of expected.slice(1)) {
    editor.update((tx) => {
      tx.selection.move({ reverse, unit: 'word' });
    });

    assert.deepEqual(getCollapsedPoint(editor), point);
  }

  editor.update((tx) => {
    tx.selection.move({ reverse, unit: 'word' });
  });
  assert.deepEqual(getCollapsedPoint(editor), expected.at(-1));
};

const createMovementEditor = (
  children: Descendant[],
  selection: Point,
  extensions: readonly EditorExtensionReference[] = []
) =>
  createEditor({
    extensions,
    initialSelection: {
      kind: 'text',
      anchor: selection,
      focus: selection,
    },
    initialValue: children,
  });

const InlineVoidSchema = defineEditorSchema({
  elements: {
    paragraph: { content: schema.content.open() },
    token: { inline: true, void: 'inline' },
  },
  id: 'word-boundary-inline-void-proof',
  root: schema.content.types(['paragraph']),
  unknown: 'preserve',
  version: 1,
});

const graphemeBoundaryOffsets = (text: string) => {
  const offsets = new Set([0]);
  let offset = 0;

  while (offset < text.length) {
    const distance = getCharacterDistance(text.slice(offset));

    assert.ok(distance > 0);
    offset += distance;
    offsets.add(offset);
  }

  return offsets;
};

describe('deterministic logical word-boundary proof', () => {
  it('translates donor rows into the pinned Plite profile', () => {
    for (const testCase of donorWordBoundaryCases) {
      assert.deepEqual(
        offsetsFromDistances(
          testCase.text,
          getWordDistances(testCase.text),
          false
        ),
        testCase.forward,
        `${testCase.classification}: ${testCase.label} forward`
      );
      assert.deepEqual(
        offsetsFromDistances(
          testCase.text,
          getWordDistances(testCase.text, true),
          true
        ),
        testCase.backward,
        `${testCase.classification}: ${testCase.label} backward`
      );
    }
  });

  it('moves across block boundaries without flattening structural points', () => {
    const children: Element[] = [
      { type: 'paragraph', children: [{ text: 'abc def' }] },
      { type: 'paragraph', children: [{ text: ' efg' }] },
    ];

    assertMovementSequence(
      createMovementEditor(children, { path: [0, 0], offset: 0 }),
      [
        { path: [0, 0], offset: 0 },
        { path: [0, 0], offset: 3 },
        { path: [0, 0], offset: 7 },
        { path: [1, 0], offset: 0 },
        { path: [1, 0], offset: 4 },
      ],
      false
    );
    assertMovementSequence(
      createMovementEditor(children, { path: [1, 0], offset: 4 }),
      [
        { path: [1, 0], offset: 4 },
        { path: [1, 0], offset: 1 },
        { path: [1, 0], offset: 0 },
        { path: [0, 0], offset: 7 },
        { path: [0, 0], offset: 4 },
        { path: [0, 0], offset: 0 },
      ],
      true
    );
  });

  it('maps logical word boundaries across adjacent formatted leaves', () => {
    const children: Element[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'a' },
          { text: ' ' },
          { text: 'bb', bold: true },
          { text: 'b', italic: true },
          { text: ' ' },
          { text: 'c' },
        ],
      },
    ];

    assertMovementSequence(
      createMovementEditor(children, { path: [0, 0], offset: 0 }),
      [
        { path: [0, 0], offset: 0 },
        { path: [0, 0], offset: 1 },
        { path: [0, 3], offset: 1 },
        { path: [0, 5], offset: 1 },
      ],
      false
    );
    assertMovementSequence(
      createMovementEditor(children, { path: [0, 5], offset: 1 }),
      [
        { path: [0, 5], offset: 1 },
        { path: [0, 5], offset: 0 },
        { path: [0, 2], offset: 0 },
        { path: [0, 0], offset: 0 },
      ],
      true
    );
  });

  it('crosses an inline void without entering its hidden text child', () => {
    const children: Element[] = [
      {
        type: 'paragraph',
        children: [
          { text: 'one ' },
          { type: 'token', children: [{ text: '' }] },
          { text: ' two' },
        ],
      },
    ];
    const extensions = [InlineVoidSchema];

    assertMovementSequence(
      createMovementEditor(children, { path: [0, 0], offset: 0 }, extensions),
      [
        { path: [0, 0], offset: 0 },
        { path: [0, 0], offset: 3 },
        { path: [0, 2], offset: 4 },
      ],
      false
    );
    assertMovementSequence(
      createMovementEditor(children, { path: [0, 2], offset: 4 }, extensions),
      [
        { path: [0, 2], offset: 4 },
        { path: [0, 2], offset: 1 },
        { path: [0, 0], offset: 0 },
      ],
      true
    );
  });

  it('makes seeded generated progress without splitting graphemes', () => {
    const atom = fc.constantFrom(
      'a',
      'אב',
      '中',
      'n\u0303',
      '#️⃣',
      '👩‍❤️‍👨',
      '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      ' ',
      '???',
      ' / '
    );

    fc.assert(
      fc.property(
        fc
          .array(atom, { maxLength: 12, minLength: 1 })
          .map((atoms) => atoms.join('')),
        (text) => {
          const graphemeOffsets = graphemeBoundaryOffsets(text);

          for (const reverse of [false, true]) {
            const first = getWordDistances(text, reverse);
            const second = getWordDistances(text, reverse);
            const offsets = offsetsFromDistances(text, first, reverse);

            assert.deepEqual(first, second);
            assert.ok(first.every((distance) => distance > 0));
            assert.equal(
              first.reduce((total, distance) => total + distance, 0),
              text.length
            );
            assert.ok(
              offsets.every((offset) => graphemeOffsets.has(offset)),
              `${JSON.stringify(text)} split a grapheme at ${offsets.join(',')}`
            );
          }
        }
      ),
      {
        numRuns: 256,
        seed: 0xc_12,
      }
    );
  });
});
