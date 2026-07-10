import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { type Element, ElementApi, type Node, NodeApi } from '@platejs/plite';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const isElement = (node: Node): node is Element => ElementApi.isElement(node);

describe('NodeApi.matches', () => {
  it('matches scalar, one-of, and empty property values', () => {
    const node = paragraph('one');

    assert.equal(NodeApi.matches(node, { type: 'paragraph' }), true);
    assert.equal(
      NodeApi.matches(node, { type: ['heading', 'paragraph'] }),
      true
    );
    assert.equal(NodeApi.matches(node, { type: ['heading'] }), false);
    assert.equal(NodeApi.matches(node, { type: [] }), false);
  });

  it('passes the path to predicates', () => {
    const node = paragraph('one');

    assert.equal(
      NodeApi.matches(node, (_node, path) => path[0] === 2, [2]),
      true
    );
    assert.equal(
      NodeApi.matches(node, (_node, path) => path[0] === 2, [1]),
      false
    );
  });

  it('preserves predicate type narrowing', () => {
    const node: Node = paragraph('one');

    if (!NodeApi.matches(node, isElement)) {
      throw new Error('Expected an element.');
    }

    assert.equal(node.children[0]?.text, 'one');
  });
});
