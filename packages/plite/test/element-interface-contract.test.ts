import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, ElementApi, NodeApi } from '@platejs/plite';

describe('ElementApi', () => {
  it('rejects typeless structural ancestors as elements', () => {
    assert.equal(ElementApi.isElement({ children: [] }), false);
  });

  it('requires a string type', () => {
    for (const type of [null, undefined, 1, false, {}]) {
      assert.equal(ElementApi.isElement({ children: [], type }), false);
    }

    assert.equal(
      ElementApi.isElement({ children: [], type: 'paragraph' }),
      true
    );
  });

  it('keeps shallow and deep child validation distinct', () => {
    const element = {
      children: [{ children: [] }],
      type: 'paragraph',
    };

    assert.equal(ElementApi.isElement(element), true);
    assert.equal(ElementApi.isElement(element, { deep: true }), false);
    assert.equal(
      ElementApi.isElement(
        {
          children: [
            {
              children: [{ text: '' }],
              type: 'blockquote',
            },
          ],
          type: 'paragraph',
        },
        { deep: true }
      ),
      true
    );
  });

  it('still rejects editors', () => {
    const editor = Object.assign(createEditor(), { type: 'paragraph' });

    assert.equal(ElementApi.isElement(editor), false);
  });

  it('applies the base shape to element lists and custom discriminants', () => {
    assert.equal(ElementApi.isElementList([{ children: [] }]), false);
    assert.equal(
      ElementApi.isElementList([{ children: [], type: 'paragraph' }]),
      true
    );
    assert.equal(
      ElementApi.isElementType(
        { children: [], source: 'heading-large' },
        'heading-large',
        'source'
      ),
      false
    );
    assert.equal(
      ElementApi.isElementType(
        {
          children: [],
          source: 'heading-large',
          type: 'paragraph',
        },
        'heading-large',
        'source'
      ),
      true
    );
  });
});

describe('NodeApi element guards', () => {
  it('rejects typeless ancestors through every public node predicate', () => {
    const value = { children: [] };

    assert.equal(NodeApi.isElement(value), false);
    assert.equal(NodeApi.isDescendant(value), false);
    assert.equal(NodeApi.isNode(value), false);
    assert.equal(NodeApi.isNodeList([value]), false);
  });

  it('applies deep element validation through node lists', () => {
    assert.equal(
      NodeApi.isNodeList(
        [
          {
            children: [{ children: [] }],
            type: 'paragraph',
          },
        ],
        { deep: true }
      ),
      false
    );
  });
});
