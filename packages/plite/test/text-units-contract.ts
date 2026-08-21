import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Element, NodeApi } from '@platejs/plite';
import { getSnapshot as editorGetSnapshot } from '@platejs/plite/internal';

import { getCharacterDistance, getWordDistance } from '../src/text-units';
import { getWordDistances } from '../src/utils/string';

type LexicalGraphemeCase = {
  backwardDistances: readonly number[];
  description: string;
  forwardDistances: readonly number[];
  text: string;
};

const lexical7163GraphemeCases: readonly LexicalGraphemeCase[] = [
  {
    backwardDistances: [3],
    description: 'Hangul conjoining jamo sequence',
    forwardDistances: [3],
    text: '\u1100\u1161\u11A8',
  },
  {
    backwardDistances: [2],
    description: 'Tamil ni grapheme sequence',
    forwardDistances: [2],
    text: '\u0BA8\u0BBF',
  },
  {
    backwardDistances: [2, 2],
    description: 'Devanagari kshi sequence',
    forwardDistances: [2, 2],
    text: '\u0915\u094D\u0937\u093F',
  },
  {
    backwardDistances: [11],
    description: 'emoji sequence combined with zero-width joiners',
    forwardDistances: [11],
    text: '\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66',
  },
  {
    backwardDistances: [4],
    description: 'emoji sequence with skin-tone modifier',
    forwardDistances: [4],
    text: '\uD83D\uDC4F\uD83C\uDFFD',
  },
  {
    backwardDistances: [2],
    description: 'Arabic text with accent',
    forwardDistances: [2],
    text: '\u0647\u064E',
  },
  {
    backwardDistances: [2],
    description: 'Latin text with decomposed combining character',
    forwardDistances: [2],
    text: 'n\u0303',
  },
  {
    backwardDistances: [2],
    description: 'BMP emoji with variation selector',
    forwardDistances: [2],
    text: '\u2764\uFE0F',
  },
  {
    backwardDistances: [3],
    description: 'keycap emoji sequence',
    forwardDistances: [3],
    text: '#\uFE0F\u20E3',
  },
  {
    backwardDistances: [1, 2, 2, 2, 1],
    description: 'Hindi word',
    forwardDistances: [1, 2, 2, 2, 1],
    text: '\u0905\u0928\u0941\u091A\u094D\u091B\u0947\u0926',
  },
  {
    backwardDistances: [2, 2],
    description: 'Korean jamo sequence',
    forwardDistances: [2, 2],
    text: '\u1103\u1167\u1109\u1170',
  },
  {
    backwardDistances: [2, 2, 2, 2, 2],
    description: 'multiple emoji outside the BMP',
    forwardDistances: [2, 2, 2, 2, 2],
    text: '\uD83C\uDF37\uD83C\uDF81\uD83D\uDCA9\uD83D\uDE1C\uD83D\uDC4D',
  },
  {
    backwardDistances: [19],
    description: 'ZWJ emoji cluster with skin tones',
    forwardDistances: [19],
    text: '\uD83D\uDC69\uD83C\uDFFD\u200D\uD83D\uDC68\uD83C\uDFFD\u200D\uD83D\uDC76\uD83C\uDFFD\u200D\uD83D\uDC66\uD83C\uDFFD',
  },
  {
    backwardDistances: [6],
    description: 'rainbow flag emoji with variation selector',
    forwardDistances: [6],
    text: '\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08',
  },
  {
    backwardDistances: [2],
    description: 'surrogate-pair CJK extension character',
    forwardDistances: [2],
    text: '\uD862\uDF4E',
  },
];

const unicodeWordCases = [
  {
    backwardDistances: [1, 1, 1, 1],
    description: 'Chinese scalar boundaries',
    forwardDistances: [1, 1, 1, 1],
    text: '两只兔子',
  },
  {
    backwardDistances: [1, 1, 1, 1, 1],
    description: 'Japanese mixed kanji and hiragana',
    forwardDistances: [1, 1, 1, 1, 1],
    text: '今日は世界',
  },
  {
    backwardDistances: [1, 2],
    description: 'decomposed kana combining mark',
    forwardDistances: [2, 1],
    text: 'は\u3099世',
  },
  {
    backwardDistances: [1, 1, 3, 1, 1],
    description: 'Chinese and Latin script transitions',
    forwardDistances: [1, 1, 3, 1, 1],
    text: '中文ABC测试',
  },
  {
    backwardDistances: [1, 1, 2],
    description: 'supplementary-plane CJK ideograph',
    forwardDistances: [2, 1, 1],
    text: '𠮞野家',
  },
  {
    backwardDistances: [1, 3],
    description: 'ideograph variation sequence',
    forwardDistances: [3, 1],
    text: '禰\u{E0100}家',
  },
  {
    backwardDistances: [1, 1, 1],
    description: 'ideographic zero and Bopomofo scalars',
    forwardDistances: [1, 1, 1],
    text: '\u3007\u3105\u31A0',
  },
  {
    backwardDistances: [2, 1],
    description: 'CJK compatibility ideographs',
    forwardDistances: [1, 2],
    text: '\uF900\u{2F800}',
  },
  {
    backwardDistances: [2, 2, 2, 2, 2, 2, 2, 2, 2],
    description: 'CJK unified ideograph extensions B through J',
    forwardDistances: [2, 2, 2, 2, 2, 2, 2, 2, 2],
    text: '\u{20000}\u{2A700}\u{2B740}\u{2B820}\u{2CEB0}\u{2EBF0}\u{30000}\u{31350}\u{323B0}',
  },
] as const;

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const point = (offset: number) => ({ path: [0, 0], offset });

const createTextEditor = (text: string, offset: number) => {
  const editor = createEditor();

  editor.update((tx) => {
    tx.value.replace({
      children: [paragraph(text)],
      selection: {
        kind: 'text' as const,
        anchor: point(offset),
        focus: point(offset),
      },
    });
  });

  return editor;
};

const getEditorText = (editor: ReturnType<typeof createEditor>) =>
  NodeApi.string({
    type: 'root',
    children: editorGetSnapshot(editor).children,
  });

const collectCharacterDistances = (text: string, reverse = false) => {
  const distances: number[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const distance = getCharacterDistance(remaining, reverse);
    distances.push(distance);
    remaining = reverse
      ? remaining.slice(0, remaining.length - distance)
      : remaining.slice(distance);
  }

  return distances;
};

const assertUnitCharacterDeletion = (
  testCase: LexicalGraphemeCase,
  reverse: boolean
) => {
  const distances = reverse
    ? testCase.backwardDistances
    : testCase.forwardDistances;
  const editor = createTextEditor(
    testCase.text,
    reverse ? testCase.text.length : 0
  );

  for (const distance of distances) {
    const before = getEditorText(editor);
    const expected = reverse
      ? before.slice(0, before.length - distance)
      : before.slice(distance);
    const expectedOffset = reverse ? expected.length : 0;

    editor.update((tx) => {
      tx.text.delete({ reverse, unit: 'character' });
    });

    assert.equal(getEditorText(editor), expected, testCase.description);
    assert.deepEqual(editorGetSnapshot(editor).selection, {
      kind: 'text',
      anchor: point(expectedOffset),
      focus: point(expectedOffset),
    });
  }

  assert.equal(getEditorText(editor), '');
};

const assertUnitCharacterMovement = (
  testCase: LexicalGraphemeCase,
  reverse: boolean
) => {
  const distances = reverse
    ? testCase.backwardDistances
    : testCase.forwardDistances;
  const editor = createTextEditor(
    testCase.text,
    reverse ? testCase.text.length : 0
  );
  let expectedOffset = reverse ? testCase.text.length : 0;

  for (const distance of distances) {
    expectedOffset = reverse
      ? expectedOffset - distance
      : expectedOffset + distance;

    editor.update((tx) => {
      tx.selection.move({ reverse, unit: 'character' });
    });

    assert.deepEqual(
      editorGetSnapshot(editor).selection,
      {
        kind: 'text',
        anchor: point(expectedOffset),
        focus: point(expectedOffset),
      },
      testCase.description
    );
  }
};

describe('plite text-units contract', () => {
  it('measures basic grapheme distance left-to-right', () => {
    assert.equal(getCharacterDistance('a'), 1);
    assert.equal(getCharacterDistance('🙂🙂'), 2);
    assert.equal(getCharacterDistance('🏁🇨🇳🏁🇨🇳'), 2);
    assert.equal(getCharacterDistance('👩‍❤️‍👨👩‍❤️‍👨'), 8);
  });

  it('measures basic grapheme distance right-to-left', () => {
    assert.equal(getCharacterDistance('a', true), 1);
    assert.equal(getCharacterDistance('🇨🇳🎌', true), 2);
    assert.equal(getCharacterDistance('🏴🏳️', true), 3);
  });

  it('keeps CRLF as one grapheme cluster', () => {
    assert.equal(getCharacterDistance('\r\n'), 2);
    assert.equal(getCharacterDistance('\r\n', true), 2);
    assert.equal(getCharacterDistance('\r\nx'), 2);
    assert.equal(getCharacterDistance('x\r\n', true), 2);
    assert.equal(getCharacterDistance('\rx'), 1);
    assert.equal(getCharacterDistance('x\r', true), 1);
    assert.equal(getCharacterDistance('\u0007\u0301'), 1);
    assert.deepEqual(collectCharacterDistances('\r\nx'), [2, 1]);
    assert.deepEqual(collectCharacterDistances('x\r\n', true), [2, 1]);
  });

  it('measures word distance left-to-right', () => {
    assert.equal(getWordDistance('hello foobarbaz'), 5);
    assert.equal(getWordDistance("Don't do this"), 5);
    assert.equal(getWordDistance("I'm ok"), 3);
  });

  it('measures word distance right-to-left', () => {
    assert.equal(getWordDistance('hello foobarbaz', true), 9);
    assert.equal(getWordDistance("Don't", true), 5);
    assert.equal(getWordDistance("Don't do this", true), 4);
    assert.equal(getWordDistance("I'm", true), 3);
  });

  it('handles punctuation and keycap sequences consistently', () => {
    assert.equal(getCharacterDistance('#️⃣#️⃣'), 3);
    assert.equal(getCharacterDistance('*️⃣*️⃣'), 3);
    assert.equal(getWordDistance("Don't do this", true), 4);
  });

  it('measures punctuation and emoji word edges directionally', () => {
    assert.equal(getWordDistance(',🙂 alpha'), 3);
    assert.equal(getWordDistance('🙂, alpha'), 2);
    assert.equal(getWordDistance('alpha,🙂', true), 2);
    assert.equal(getWordDistance('alpha 🙂,', true), 3);
  });

  it('uses the pinned CJK scalar profile for word boundaries', () => {
    for (const testCase of unicodeWordCases) {
      assert.deepEqual(
        getWordDistances(testCase.text),
        testCase.forwardDistances,
        `${testCase.description} forward`
      );
      assert.deepEqual(
        getWordDistances(testCase.text, true),
        testCase.backwardDistances,
        `${testCase.description} backward`
      );
    }
  });

  it('keeps punctuation around markup-like words in the directional unit', () => {
    assert.deepEqual(
      getWordDistances('a <textarea>!', true).slice(0, 2),
      [10, 3]
    );
  });

  it('keeps CJK positions, movement, and deletion on the same boundaries', () => {
    for (const testCase of unicodeWordCases) {
      for (const [reverse, distances] of [
        [false, testCase.forwardDistances],
        [true, testCase.backwardDistances],
      ] as const) {
        const initialOffset = reverse ? testCase.text.length : 0;
        const expectedOffsets = [initialOffset];

        for (const distance of distances) {
          expectedOffsets.push(
            expectedOffsets.at(-1)! + (reverse ? -distance : distance)
          );
        }

        const positionsEditor = createTextEditor(testCase.text, initialOffset);
        const positionOffsets = Array.from(
          positionsEditor.read.points.positions({
            at: [0],
            reverse,
            unit: 'word',
          }),
          ({ offset }) => offset
        );

        assert.deepEqual(
          positionOffsets,
          expectedOffsets,
          `${testCase.description} positions`
        );

        const moveEditor = createTextEditor(testCase.text, initialOffset);

        for (const offset of expectedOffsets.slice(1)) {
          moveEditor.update((tx) => {
            tx.selection.move({ reverse, unit: 'word' });
          });

          assert.deepEqual(
            editorGetSnapshot(moveEditor).selection,
            {
              kind: 'text',
              anchor: point(offset),
              focus: point(offset),
            },
            `${testCase.description} movement`
          );
        }

        for (let index = 1; index < expectedOffsets.length; index++) {
          const from = expectedOffsets[index - 1]!;
          const to = expectedOffsets[index]!;
          const deleteEditor = createTextEditor(testCase.text, from);

          deleteEditor.update((tx) => {
            tx.text.delete({ reverse, unit: 'word' });
          });

          assert.equal(
            getEditorText(deleteEditor),
            testCase.text.slice(0, Math.min(from, to)) +
              testCase.text.slice(Math.max(from, to)),
            `${testCase.description} deletion`
          );
        }
      }
    }
  });

  it('moves word selection across soft line boundaries', () => {
    const forward = createTextEditor('one\ntwo three', 3);

    forward.update((tx) => {
      tx.selection.move({ unit: 'word' });
    });

    assert.deepEqual(editorGetSnapshot(forward).selection, {
      kind: 'text',
      anchor: point(7),
      focus: point(7),
    });

    const backward = createTextEditor('one\ntwo three', 4);

    backward.update((tx) => {
      tx.selection.move({ reverse: true, unit: 'word' });
    });

    assert.deepEqual(editorGetSnapshot(backward).selection, {
      kind: 'text',
      anchor: point(0),
      focus: point(0),
    });
  });

  it('moves word selection across whitespace-padded soft line boundaries', () => {
    const forward = createTextEditor('foo \nbar', 3);

    forward.update((tx) => {
      tx.selection.move({ unit: 'word' });
    });

    assert.deepEqual(editorGetSnapshot(forward).selection, {
      kind: 'text',
      anchor: point(8),
      focus: point(8),
    });

    const backward = createTextEditor('foo\n bar', 5);

    backward.update((tx) => {
      tx.selection.move({ reverse: true, unit: 'word' });
    });

    assert.deepEqual(editorGetSnapshot(backward).selection, {
      kind: 'text',
      anchor: point(0),
      focus: point(0),
    });
  });

  it('moves word selection backward past an asterisk soft-line prefix', () => {
    const text = 'Hello world\n* Hello world';
    const editor = createTextEditor(text, text.length);
    const expectedOffsets = [20, 14, 6, 0];

    for (const offset of expectedOffsets) {
      editor.update((tx) => {
        tx.selection.move({ reverse: true, unit: 'word' });
      });

      assert.deepEqual(editorGetSnapshot(editor).selection, {
        kind: 'text',
        anchor: point(offset),
        focus: point(offset),
      });
    }
  });

  it('moves word selection through padded words in both directions', () => {
    const text = '  123 abc 456  def  ';
    const editor = createTextEditor(text, text.length);

    for (const offset of [15, 10, 6, 2, 0]) {
      editor.update((tx) => {
        tx.selection.move({ reverse: true, unit: 'word' });
      });

      assert.deepEqual(editorGetSnapshot(editor).selection, {
        kind: 'text',
        anchor: point(offset),
        focus: point(offset),
      });
    }

    for (const offset of [5, 9, 13, 18, 20]) {
      editor.update((tx) => {
        tx.selection.move({ unit: 'word' });
      });

      assert.deepEqual(editorGetSnapshot(editor).selection, {
        kind: 'text',
        anchor: point(offset),
        focus: point(offset),
      });
    }
  });

  it('measures portable Lexical #7163 Unicode destructive rows', () => {
    for (const testCase of lexical7163GraphemeCases) {
      assert.deepEqual(
        collectCharacterDistances(testCase.text),
        testCase.forwardDistances,
        `${testCase.description} forward`
      );
      assert.deepEqual(
        collectCharacterDistances(testCase.text, true),
        testCase.backwardDistances,
        `${testCase.description} backward`
      );
    }
  });

  it('deletes portable Lexical #7163 Unicode rows by Plite character units', () => {
    for (const testCase of lexical7163GraphemeCases) {
      assertUnitCharacterDeletion(testCase, false);
      assertUnitCharacterDeletion(testCase, true);
    }
  });

  it('moves over portable Lexical #7163 Unicode rows by Plite character units', () => {
    for (const testCase of lexical7163GraphemeCases) {
      assertUnitCharacterMovement(testCase, false);
      assertUnitCharacterMovement(testCase, true);
    }
  });
});
