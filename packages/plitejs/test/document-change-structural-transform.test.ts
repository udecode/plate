import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DocumentIndex } from '../src/core/change/document-index';
import {
  insertNodeChange,
  insertTextChange,
  mergeNodeChange,
  removeNodeChange,
  RootChange,
  setNodeChange,
} from '../src/core/change/root-change';
import type { JsonNode } from '../src/core/change/tokens';

const paragraph = (text: string): JsonNode => ({
  children: [{ text }],
  type: 'paragraph',
});

const quote = (...children: JsonNode[]): JsonNode => ({
  children,
  type: 'quote',
});

const heading = (text: string): JsonNode => ({
  children: [{ text }],
  type: 'heading',
});

const restoreBold = (before: DocumentIndex) =>
  RootChange.between(
    before,
    DocumentIndex.fromValue([
      { children: [{ bold: true, text: 'ab' }], type: 'heading' },
      paragraph('cd'),
    ])
  );

const splitQuote = (before: DocumentIndex) =>
  RootChange.between(
    before,
    DocumentIndex.fromValue([
      quote(paragraph('ab'), paragraph('Y')),
      quote(paragraph('cd')),
    ])
  );

const splitFirstLine = (before: DocumentIndex) =>
  RootChange.between(
    before,
    DocumentIndex.fromValue([
      paragraph('a'),
      paragraph('bc'),
      paragraph('defg'),
    ])
  );

const textOf = (node: JsonNode): string =>
  node.text ?? (node.children ?? []).map(textOf).join('');

const composed = (
  document: DocumentIndex,
  ...steps: Array<(document: DocumentIndex) => RootChange>
) =>
  steps.reduce(
    (change, step) => change.compose(step(change.apply(document))),
    RootChange.empty(document.length)
  );

const retypedJoin = (document: DocumentIndex, path: readonly number[]) => {
  const above = [...path.slice(0, -1), (path.at(-1) ?? 0) - 1, 0];
  const removal = removeNodeChange(document, path);

  return removal.compose(
    insertTextChange(
      removal.apply(document),
      above,
      textOf(document.node(above)).length,
      textOf(document.node(path))
    )
  );
};

// The whole document replaced, as a region diff sends a merge.
const replaced = (before: DocumentIndex, after: readonly JsonNode[]) =>
  RootChange.create(before, {
    from: 0,
    insert: DocumentIndex.fromValue(after).slice(0),
    to: before.length,
  });

// Rebased by position, a whole replacement and an edit inside it converge on
// the second argument's tree, so each argument order pins its own tree.
const assertEachOrder = (
  before: DocumentIndex,
  merger: RootChange,
  other: RootChange,
  expected: Readonly<{
    mergerFirst: readonly JsonNode[];
    otherFirst: readonly JsonNode[];
  }>
) => {
  for (const [a, b, tree] of [
    [merger, other, expected.mergerFirst],
    [other, merger, expected.otherFirst],
  ] as const) {
    const transformed = RootChange.transformInDocument(a, b, before);

    assert.deepEqual(transformed.b.apply(a.apply(before)).value, tree);
    assert.deepEqual(transformed.a.apply(b.apply(before)).value, tree);
  }
};

const assertTransformsTo = (
  before: DocumentIndex,
  merger: RootChange,
  other: RootChange,
  expected: readonly JsonNode[]
) => {
  for (const [a, b] of [
    [merger, other],
    [other, merger],
  ] as const) {
    const transformed = RootChange.transformInDocument(a, b, before);

    assert.deepEqual(transformed.b.apply(a.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(b.apply(before)).value, expected);
  }
};

describe('structural document change transform', () => {
  it('keeps a nested concurrent edit through a wrapper relocation', () => {
    const before = DocumentIndex.fromValue([
      { children: [paragraph('alpha')], type: 'quote' },
    ]);
    const remote = insertTextChange(before, [0, 0, 0], 5, '!');
    const unwrap = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('alpha')])
    );
    const transformed = RootChange.transformInDocument(remote, unwrap, before);
    const expected = [paragraph('alpha!')];

    assert.deepEqual(transformed.b.apply(remote.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(unwrap.apply(before)).value, expected);
  });

  it('does not replay a structural intent already satisfied remotely', () => {
    const before = DocumentIndex.fromValue([paragraph('Hello world!')]);
    const remote = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('Hello '), paragraph('world!!')])
    );
    const local = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('Hello '), paragraph('world!')])
    );
    const transformed = RootChange.transformInDocument(remote, local, before);
    const expected = [paragraph('Hello '), paragraph('world!!')];

    assert.equal(transformed.b.empty, true);
    assert.deepEqual(transformed.b.apply(remote.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(local.apply(before)).value, expected);
  });

  it('replays a structural change through an unrelated sibling insertion', () => {
    const before = DocumentIndex.fromValue([paragraph('Hello world!')]);
    const remote = RootChange.between(
      before,
      DocumentIndex.fromValue([
        paragraph('Hello world!'),
        paragraph('world! after'),
      ])
    );
    const local = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('Hello '), paragraph('world!')])
    );
    const transformed = RootChange.transformInDocument(remote, local, before);
    const expected = [
      paragraph('Hello '),
      paragraph('world!'),
      paragraph('world! after'),
    ];

    assert.deepEqual(transformed.b.apply(remote.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(local.apply(before)).value, expected);
  });

  it('preserves an insertion at the boundary of a concurrent deletion', () => {
    const before = DocumentIndex.fromValue([paragraph('alphaLin fragment')]);
    const remote = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('alpha AdaLin fragment')])
    );
    const local = RootChange.between(
      before,
      DocumentIndex.fromValue([paragraph('alpha')])
    );
    const transformed = RootChange.transformInDocument(remote, local, before);
    const expected = [paragraph('alpha Ada')];

    assert.deepEqual(transformed.b.apply(remote.apply(before)).value, expected);
    assert.deepEqual(transformed.a.apply(local.apply(before)).value, expected);
  });

  it('joins a restored bold line and a merged plain line without restyling either', () => {
    const before = DocumentIndex.fromValue([heading(''), paragraph('cd')]);

    assertTransformsTo(
      before,
      RootChange.create(before, {
        from: before.nodeRange([0]).from + 1,
        to: before.nodeRange([1]).from + 1,
      }),
      restoreBold(before),
      [
        {
          children: [{ bold: true, text: 'ab' }, { text: 'cd' }],
          type: 'heading',
        },
      ]
    );
  });

  it('rebases a merge into an empty line sent as one replacement against a restored bold line by position', () => {
    const before = DocumentIndex.fromValue([heading(''), paragraph('cd')]);

    assertEachOrder(
      before,
      replaced(before, [heading('cd')]),
      restoreBold(before),
      {
        mergerFirst: [
          { children: [{ bold: true, text: 'ab' }], type: 'heading' },
          paragraph('cd'),
        ],
        otherFirst: [heading('cd')],
      }
    );
  });

  it('keeps typing at the junction when a merge also edits the line above', () => {
    const before = DocumentIndex.fromValue([
      paragraph('ef'),
      paragraph('ab'),
      paragraph('cd'),
    ]);

    assertTransformsTo(
      before,
      composed(
        before,
        (document) => insertTextChange(document, [0, 0], 2, 'Z'),
        (document) => mergeNodeChange(document, [2])
      ),
      insertTextChange(before, [1, 0], 2, 'X'),
      [paragraph('efZ'), paragraph('abXcd')]
    );
  });

  it('rebases a merge sent as one replacement that also edits the line above by position', () => {
    const before = DocumentIndex.fromValue([
      paragraph('ef'),
      paragraph('ab'),
      paragraph('cd'),
    ]);

    assertEachOrder(
      before,
      replaced(before, [paragraph('efZ'), paragraph('abcd')]),
      insertTextChange(before, [1, 0], 2, 'X'),
      {
        mergerFirst: [paragraph('ef'), paragraph('abX'), paragraph('cd')],
        otherFirst: [paragraph('efZ'), paragraph('abcd')],
      }
    );
  });

  it('keeps the second quote when the other side splits it out of a quote whose lines a peer merges', () => {
    const before = DocumentIndex.fromValue([
      quote(paragraph('ab'), paragraph('cd')),
    ]);

    assertTransformsTo(
      before,
      mergeNodeChange(before, [0, 1]),
      splitQuote(before),
      [quote(paragraph('abY')), quote(paragraph('cd'))]
    );
  });

  it('rebases a merge in a quote sent as one replacement against a split out of the quote by position', () => {
    const before = DocumentIndex.fromValue([
      quote(paragraph('ab'), paragraph('cd')),
    ]);

    assertEachOrder(
      before,
      replaced(before, [quote(paragraph('abcd'))]),
      splitQuote(before),
      {
        mergerFirst: [
          quote(paragraph('ab'), paragraph('Y')),
          quote(paragraph('cd')),
        ],
        otherFirst: [quote(paragraph('abcd'))],
      }
    );
  });

  it('keeps the split when a merge meets a split of its first line', () => {
    const before = DocumentIndex.fromValue([
      paragraph('abc'),
      paragraph('defg'),
    ]);

    assertTransformsTo(
      before,
      mergeNodeChange(before, [1]),
      splitFirstLine(before),
      [paragraph('a'), paragraph('bcdefg')]
    );
  });

  it('rebases a merge sent as a removal of the first line and a retype into the second against a split of the first by position', () => {
    const before = DocumentIndex.fromValue([
      paragraph('abc'),
      paragraph('defg'),
    ]);
    const removal = removeNodeChange(before, [0]);

    assertEachOrder(
      before,
      removal.compose(
        insertTextChange(removal.apply(before), [0, 0], 0, 'abc')
      ),
      splitFirstLine(before),
      {
        mergerFirst: [paragraph('a'), paragraph('bc'), paragraph('defg')],
        otherFirst: [paragraph('abcdefg')],
      }
    );
  });

  it('keeps typing in a merged line when the same change merges the lines above', () => {
    const before = DocumentIndex.fromValue(
      ['xx', 'yy', 'ab', 'cd', 'ij', 'kk'].map(paragraph)
    );
    const merger = composed(
      before,
      (document) => mergeNodeChange(document, [3]),
      (document) => mergeNodeChange(document, [1])
    );

    assertTransformsTo(
      before,
      merger,
      insertTextChange(before, [3, 0], 1, 'Y'),
      ['xxyy', 'abcYd', 'ij', 'kk'].map(paragraph)
    );
  });

  it('rebases two merges sent as retypes by position', () => {
    const before = DocumentIndex.fromValue(
      ['xx', 'yy', 'ab', 'cd', 'ij', 'kk'].map(paragraph)
    );

    assertEachOrder(
      before,
      composed(
        before,
        (document) => retypedJoin(document, [3]),
        (document) => retypedJoin(document, [1])
      ),
      insertTextChange(before, [3, 0], 1, 'Y'),
      {
        mergerFirst: ['xx', 'yy', 'ab', 'cYd', 'ij', 'kk'].map(paragraph),
        otherFirst: ['xxyy', 'abcd', 'ij', 'kk'].map(paragraph),
      }
    );
  });

  it('keeps typing in a merged line when the same change adds a line beside it', () => {
    const before = DocumentIndex.fromValue([paragraph('ab'), paragraph('cd')]);
    const typed = insertTextChange(before, [1, 0], 1, 'Y');

    for (const [index, expected] of [
      [1, ['abcYd', 'ef']],
      [0, ['ef', 'abcYd']],
    ] as const) {
      const merger = composed(
        before,
        (document) => mergeNodeChange(document, [1]),
        (document) => insertNodeChange(document, [index], paragraph('ef'))
      );

      assertTransformsTo(before, merger, typed, expected.map(paragraph));
    }
  });

  it('rebases a merge sent as a retype beside an added line by position', () => {
    const before = DocumentIndex.fromValue([paragraph('ab'), paragraph('cd')]);

    for (const [index, otherFirst] of [
      [1, ['abcd', 'ef']],
      [0, ['ef', 'abcd']],
    ] as const) {
      assertEachOrder(
        before,
        composed(
          before,
          (document) => retypedJoin(document, [1]),
          (document) => insertNodeChange(document, [index], paragraph('ef'))
        ),
        insertTextChange(before, [1, 0], 1, 'Y'),
        {
          mergerFirst: [paragraph('ab'), paragraph('cYd')],
          otherFirst: otherFirst.map(paragraph),
        }
      );
    }
  });

  it("does not read typing the next line's text at the end of a line as a merge", () => {
    const before = DocumentIndex.fromValue([paragraph('ab'), paragraph('cd')]);
    const typed = insertTextChange(before, [1, 0], 1, 'Y');
    const retyped = (document: DocumentIndex) =>
      insertTextChange(document, [0, 0], 2, 'cd');
    const mergers = [
      composed(before, retyped, (document) =>
        insertTextChange(document, [1, 0], 1, 'X')
      ),
      composed(
        before,
        retyped,
        (document) => insertNodeChange(document, [1], paragraph('xx')),
        (document) => insertTextChange(document, [2, 0], 1, 'X')
      ),
      composed(
        before,
        retyped,
        (document) =>
          setNodeChange(
            document,
            [1],
            { type: 'heading' },
            { type: 'paragraph' }
          ),
        (document) => insertTextChange(document, [1, 0], 1, 'X')
      ),
    ];

    for (const merger of mergers) {
      for (const [a, b] of [
        [merger, typed],
        [typed, merger],
      ] as const) {
        const transformed = RootChange.transformInDocument(a, b, before);
        const result = transformed.b.apply(a.apply(before)).value;

        assert.deepEqual(transformed.a.apply(b.apply(before)).value, result);
        assert.equal(textOf(result[0]), 'abcd');
        assert.match(textOf(result.at(-1) ?? paragraph('')), /^c(XY|YX)d$/);
      }
    }
  });

  it('keeps typing in a merged line when a merge in a quote arrives with typing outside the quote', () => {
    const before = DocumentIndex.fromValue([
      quote(paragraph('ab'), paragraph('cd')),
      paragraph('zz'),
    ]);
    const merger = composed(
      before,
      (document) => mergeNodeChange(document, [0, 1]),
      (document) => insertTextChange(document, [1, 0], 2, 'Z')
    );

    assertTransformsTo(
      before,
      merger,
      insertTextChange(before, [0, 1, 0], 1, 'Y'),
      [quote(paragraph('abcYd')), paragraph('zzZ')]
    );
  });

  it('rebases a merge in a quote sent as a retype with typing outside the quote by position', () => {
    const before = DocumentIndex.fromValue([
      quote(paragraph('ab'), paragraph('cd')),
      paragraph('zz'),
    ]);

    assertEachOrder(
      before,
      composed(
        before,
        (document) => retypedJoin(document, [0, 1]),
        (document) => insertTextChange(document, [1, 0], 2, 'Z')
      ),
      insertTextChange(before, [0, 1, 0], 1, 'Y'),
      {
        mergerFirst: [
          quote(paragraph('ab'), paragraph('cYd')),
          paragraph('zz'),
        ],
        otherFirst: [quote(paragraph('abcd')), paragraph('zzZ')],
      }
    );
  });

  it('keeps typing in a merged line when one change merges lines in a quote and removes a line above it', () => {
    const before = DocumentIndex.fromValue([
      paragraph('ef'),
      paragraph('gh'),
      quote(paragraph('ab'), paragraph('cd')),
    ]);

    assertTransformsTo(
      before,
      composed(
        before,
        (document) => removeNodeChange(document, [1]),
        (document) => mergeNodeChange(document, [1, 1])
      ),
      insertTextChange(before, [2, 1, 0], 1, 'X'),
      [paragraph('ef'), quote(paragraph('abcXd'))]
    );
  });

  it('rebases one replacement that merges lines in a quote and removes a line above it by position', () => {
    const before = DocumentIndex.fromValue([
      paragraph('ef'),
      paragraph('gh'),
      quote(paragraph('ab'), paragraph('cd')),
    ]);

    assertEachOrder(
      before,
      replaced(before, [paragraph('ef'), quote(paragraph('abcd'))]),
      insertTextChange(before, [2, 1, 0], 1, 'X'),
      {
        mergerFirst: [
          paragraph('ef'),
          paragraph('gh'),
          quote(paragraph('ab'), paragraph('cXd')),
        ],
        otherFirst: [paragraph('ef'), quote(paragraph('abcd'))],
      }
    );
  });

  it('keeps typing in a merged line when one change merges lines in a quote and types in the line above it', () => {
    const before = DocumentIndex.fromValue([
      paragraph('ef'),
      quote(paragraph('ab'), paragraph('cd')),
    ]);

    assertTransformsTo(
      before,
      composed(
        before,
        (document) => insertTextChange(document, [0, 0], 2, 'Z'),
        (document) => mergeNodeChange(document, [1, 1])
      ),
      insertTextChange(before, [1, 0, 0], 1, 'X'),
      [paragraph('efZ'), quote(paragraph('aXbcd'))]
    );
  });

  it('rebases one replacement that merges lines in a quote and types in the line above it by position', () => {
    const before = DocumentIndex.fromValue([
      paragraph('ef'),
      quote(paragraph('ab'), paragraph('cd')),
    ]);

    assertEachOrder(
      before,
      replaced(before, [paragraph('efZ'), quote(paragraph('abcd'))]),
      insertTextChange(before, [1, 0, 0], 1, 'X'),
      {
        mergerFirst: [
          paragraph('ef'),
          quote(paragraph('aXb'), paragraph('cd')),
        ],
        otherFirst: [paragraph('efZ'), quote(paragraph('abcd'))],
      }
    );
  });

  it('keeps typing out of an equal line above when a change merges the two lines below it', () => {
    const before = DocumentIndex.fromValue([
      paragraph('abcd'),
      paragraph('ab'),
      paragraph('cd'),
    ]);

    assertTransformsTo(
      before,
      mergeNodeChange(before, [2]),
      insertTextChange(before, [2, 0], 1, 'X'),
      [paragraph('abcd'), paragraph('abcXd')]
    );
  });

  it('rebases one replacement that merges two lines below an equal line by position', () => {
    const before = DocumentIndex.fromValue([
      paragraph('abcd'),
      paragraph('ab'),
      paragraph('cd'),
    ]);

    assertEachOrder(
      before,
      replaced(before, [paragraph('abcd'), paragraph('abcd')]),
      insertTextChange(before, [2, 0], 1, 'X'),
      {
        mergerFirst: [paragraph('abcd'), paragraph('ab'), paragraph('cXd')],
        otherFirst: [paragraph('abcd'), paragraph('abcd')],
      }
    );
  });
});
