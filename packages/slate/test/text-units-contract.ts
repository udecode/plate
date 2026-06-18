import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Editor } from '@platejs/slate/internal';

import { createEditor, type Descendant, NodeApi } from '../src';
import { getCharacterDistance, getWordDistance } from '../src/text-units';

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
    text: '\u0647\u064e',
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
    text: '\u2764\ufe0f',
  },
  {
    backwardDistances: [3],
    description: 'keycap emoji sequence',
    forwardDistances: [3],
    text: '#\ufe0f\u20e3',
  },
  {
    backwardDistances: [1, 2, 2, 2, 1],
    description: 'Hindi word',
    forwardDistances: [1, 2, 2, 2, 1],
    text: '\u0905\u0928\u0941\u091a\u094d\u091b\u0947\u0926',
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
    text: '\ud83c\udf37\ud83c\udf81\ud83d\udca9\ud83d\ude1c\ud83d\udc4d',
  },
  {
    backwardDistances: [19],
    description: 'ZWJ emoji cluster with skin tones',
    forwardDistances: [19],
    text: '\ud83d\udc69\ud83c\udffd\u200d\ud83d\udc68\ud83c\udffd\u200d\ud83d\udc76\ud83c\udffd\u200d\ud83d\udc66\ud83c\udffd',
  },
  {
    backwardDistances: [6],
    description: 'rainbow flag emoji with variation selector',
    forwardDistances: [6],
    text: '\ud83c\udff3\ufe0f\u200d\ud83c\udf08',
  },
  {
    backwardDistances: [2],
    description: 'surrogate-pair CJK extension character',
    forwardDistances: [2],
    text: '\ud862\udf4e',
  },
];

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const point = (offset: number) => ({ path: [0, 0], offset });

const createTextEditor = (text: string, offset: number) => {
  const editor = createEditor();

  editor.update((tx) => {
    tx.value.replace({
      children: [paragraph(text)],
      marks: null,
      selection: {
        anchor: point(offset),
        focus: point(offset),
      },
    });
  });

  return editor;
};

const getEditorText = (editor: ReturnType<typeof createEditor>) =>
  NodeApi.string(Editor.getSnapshot(editor));

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
    assert.deepEqual(Editor.getSnapshot(editor).selection, {
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
      Editor.getSnapshot(editor).selection,
      {
        anchor: point(expectedOffset),
        focus: point(expectedOffset),
      },
      testCase.description
    );
  }
};

describe('slate text-units contract', () => {
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

  it('moves word selection across soft line boundaries', () => {
    const forward = createTextEditor('one\ntwo three', 3);

    forward.update((tx) => {
      tx.selection.move({ unit: 'word' });
    });

    assert.deepEqual(Editor.getSnapshot(forward).selection, {
      anchor: point(7),
      focus: point(7),
    });

    const backward = createTextEditor('one\ntwo three', 4);

    backward.update((tx) => {
      tx.selection.move({ reverse: true, unit: 'word' });
    });

    assert.deepEqual(Editor.getSnapshot(backward).selection, {
      anchor: point(0),
      focus: point(0),
    });
  });

  it('moves word selection across whitespace-padded soft line boundaries', () => {
    const forward = createTextEditor('foo \nbar', 3);

    forward.update((tx) => {
      tx.selection.move({ unit: 'word' });
    });

    assert.deepEqual(Editor.getSnapshot(forward).selection, {
      anchor: point(8),
      focus: point(8),
    });

    const backward = createTextEditor('foo\n bar', 5);

    backward.update((tx) => {
      tx.selection.move({ reverse: true, unit: 'word' });
    });

    assert.deepEqual(Editor.getSnapshot(backward).selection, {
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

      assert.deepEqual(Editor.getSnapshot(editor).selection, {
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

      assert.deepEqual(Editor.getSnapshot(editor).selection, {
        anchor: point(offset),
        focus: point(offset),
      });
    }

    for (const offset of [5, 9, 13, 18, 20]) {
      editor.update((tx) => {
        tx.selection.move({ unit: 'word' });
      });

      assert.deepEqual(Editor.getSnapshot(editor).selection, {
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

  it('deletes portable Lexical #7163 Unicode rows by Slate character units', () => {
    for (const testCase of lexical7163GraphemeCases) {
      assertUnitCharacterDeletion(testCase, false);
      assertUnitCharacterDeletion(testCase, true);
    }
  });

  it('moves over portable Lexical #7163 Unicode rows by Slate character units', () => {
    for (const testCase of lexical7163GraphemeCases) {
      assertUnitCharacterMovement(testCase, false);
      assertUnitCharacterMovement(testCase, true);
    }
  });
});
