import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import fc from 'fast-check';

import { DocumentIndex } from '../src/core/change/document-index';
import type { JsonNode } from '../src/core/change/tokens';

type ReferenceEntry = {
  contentFrom: number;
  contentTo: number;
  from: number;
  kind: 'element' | 'text';
  path: readonly number[];
  to: number;
};

const comparePaths = (left: readonly number[], right: readonly number[]) => {
  for (let index = 0; index < Math.min(left.length, right.length); index++) {
    const difference = left[index]! - right[index]!;

    if (difference !== 0) return difference;
  }

  return left.length - right.length;
};

const nodeLength = (node: JsonNode): number =>
  typeof node.text === 'string'
    ? node.text.length + 2
    : node.children.reduce((length, child) => length + nodeLength(child), 2);

const indexEntries = (nodes: readonly JsonNode[]) => {
  const entries: ReferenceEntry[] = [];
  let position = 0;

  const visit = (node: JsonNode, path: readonly number[]) => {
    const from = position++;
    const contentFrom = position;
    let kind: ReferenceEntry['kind'];

    if (typeof node.text === 'string') {
      kind = 'text';
      position += node.text.length;
    } else {
      kind = 'element';
      node.children.forEach((child, index) => {
        visit(child, [...path, index]);
      });
    }

    const contentTo = position;

    position++;
    entries.push({
      contentFrom,
      contentTo,
      from,
      kind,
      path,
      to: position,
    });
  };

  nodes.forEach((node, index) => {
    visit(node, [index]);
  });

  return { entries, length: position };
};

const childBoundaryAt = (
  nodes: readonly JsonNode[],
  position: number,
  contentFrom = 0,
  parentPath: readonly number[] = []
): { index: number; parentPath: readonly number[] } | null => {
  let from = contentFrom;

  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index]!;
    const length = nodeLength(node);

    if (position === from) return { index, parentPath };

    if (
      typeof node.text !== 'string' &&
      from < position &&
      position < from + length
    ) {
      return childBoundaryAt(node.children, position, from + 1, [
        ...parentPath,
        index,
      ]);
    }

    from += length;
  }

  return position === from ? { index: nodes.length, parentPath } : null;
};

const nodeStartingAt = (entries: readonly ReferenceEntry[], position: number) =>
  entries.find((entry) => entry.from === position) ?? null;

const textAt = (entries: readonly ReferenceEntry[], position: number) =>
  entries.find(
    (entry) =>
      entry.kind === 'text' &&
      entry.contentFrom <= position &&
      position <= entry.contentTo
  ) ?? null;

const pointAt = (
  entries: readonly ReferenceEntry[],
  position: number,
  assoc: -1 | 1
) => {
  const texts = entries
    .filter((entry) => entry.kind === 'text')
    .sort((left, right) => left.contentFrom - right.contentFrom);
  const containing = texts.filter(
    (entry) => entry.contentFrom <= position && position <= entry.contentTo
  );

  if (containing.length > 0) {
    const entry = assoc < 0 ? containing[0]! : containing.at(-1)!;

    return {
      offset: Math.max(
        0,
        Math.min(
          entry.contentTo - entry.contentFrom,
          position - entry.contentFrom
        )
      ),
      path: [...entry.path],
    };
  }

  const before = texts.filter((entry) => entry.contentTo < position).at(-1);
  const after = texts.find((entry) => entry.contentFrom > position);
  const entry = assoc < 0 ? (before ?? after) : (after ?? before);

  if (!entry) return null;

  return {
    offset: entry === before ? entry.contentTo - entry.contentFrom : 0,
    path: [...entry.path],
  };
};

const nodeRangesTouching = (
  entries: readonly ReferenceEntry[],
  from: number,
  to: number
) =>
  entries
    .filter((entry) => entry.from <= to && entry.to >= from)
    .sort(
      (left, right) =>
        left.path.length - right.path.length ||
        comparePaths(left.path, right.path)
    );

const assertEquivalentQueries = (nodes: readonly JsonNode[]) => {
  const document = DocumentIndex.fromValue(nodes);
  const reference = indexEntries(nodes);

  assert.equal(document.length, reference.length);

  for (let position = 0; position <= reference.length; position++) {
    assert.deepEqual(
      document.childBoundaryAt(position),
      childBoundaryAt(nodes, position),
      `child boundary at ${position}`
    );
    assert.deepEqual(
      document.nodeStartingAt(position),
      nodeStartingAt(reference.entries, position),
      `node start at ${position}`
    );
    assert.deepEqual(
      document.textAt(position),
      textAt(reference.entries, position),
      `text at ${position}`
    );

    for (const assoc of [-1, 1] as const) {
      assert.deepEqual(
        document.pointAt(position, assoc),
        pointAt(reference.entries, position, assoc),
        `point at ${position} with association ${assoc}`
      );
    }

    for (const to of [position, Math.min(reference.length, position + 3)]) {
      assert.deepEqual(
        document.nodeRangesTouching(position, to),
        nodeRangesTouching(reference.entries, position, to),
        `touching range ${position}..${to}`
      );
    }
  }

  for (const entry of reference.entries) {
    assert.deepEqual(document.nodeRange(entry.path), {
      from: entry.from,
      to: entry.to,
    });

    if (entry.kind === 'text') {
      assert.equal(
        document.positionAt({ offset: 0, path: entry.path }),
        entry.contentFrom
      );
      assert.equal(
        document.positionAt({
          offset: entry.contentTo - entry.contentFrom,
          path: entry.path,
        }),
        entry.contentTo
      );
    }
  }
};

const textNode = fc
  .record({
    bold: fc.option(fc.boolean(), { nil: undefined }),
    text: fc.string({ maxLength: 4 }),
  })
  .map(({ bold, text }) =>
    bold === undefined ? ({ text } as JsonNode) : ({ bold, text } as JsonNode)
  );
const shallowElement = fc
  .record({
    children: fc.array(textNode, { maxLength: 3 }),
    type: fc.constantFrom('paragraph', 'inline'),
  })
  .map((node) => node as JsonNode);
const nestedElement = fc
  .record({
    children: fc.array(fc.oneof(textNode, shallowElement), { maxLength: 3 }),
    type: fc.constantFrom('section', 'quote'),
  })
  .map((node) => node as JsonNode);
const documentNodes = fc.array(
  fc.oneof(textNode, shallowElement, nestedElement),
  { maxLength: 4 }
);

describe('resolved token cursor', () => {
  it('matches the previous query semantics at structural and empty boundaries', () => {
    const nodes: readonly JsonNode[] = [
      { children: [], type: 'empty' },
      {
        children: [
          { text: '' },
          { children: [{ text: 'ab' }, { text: '' }], type: 'nested' },
          { text: 'c' },
        ],
        type: 'section',
      },
      { text: '' },
    ];

    assertEquivalentQueries(nodes);

    const document = DocumentIndex.fromValue(nodes);

    for (const position of [-1, document.length + 1]) {
      assert.equal(document.childBoundaryAt(position), null);
      assert.equal(document.nodeStartingAt(position), null);
      assert.equal(document.textAt(position), null);
      assert.throws(() => document.pointAt(position), RangeError);
    }
  });

  it('matches generated position, range, and public path queries', () => {
    fc.assert(
      fc.property(documentNodes, (nodes) => {
        assertEquivalentQueries(nodes);
      }),
      { numRuns: 200, seed: 0x5e_ed_c0_de }
    );
  });
});
