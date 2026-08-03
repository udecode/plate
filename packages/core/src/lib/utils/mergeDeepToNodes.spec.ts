import { NodeApi } from '@platejs/plite';

import { mergeDeepToNodes } from './mergeDeepToNodes';

const createNestedElement = () => ({
  children: [
    { text: 'test' },
    {
      children: [{ text: 'test' }],
      type: 'paragraph',
    },
    { text: 'test' },
  ],
  type: 'listItem',
});

describe('mergeDeepToNodes', () => {
  it('merges props into the root node and all descendants by default', () => {
    const node = {
      children: [
        {
          children: [{ text: 'test' }],
          type: 'paragraph',
        },
      ],
    };

    mergeDeepToNodes({
      node: node as any,
      source: { a: 1 },
    });

    expect(node).toEqual({
      a: 1,
      children: [
        {
          a: 1,
          children: [{ a: 1, text: 'test' }],
          type: 'paragraph',
        },
      ],
    });
  });

  describe('descendant queries', () => {
    it('matches a standalone text node', () => {
      const node = { text: 'test' };

      mergeDeepToNodes({
        node: node as any,
        match: NodeApi.isDescendant,
        source: { a: 1 },
      });

      expect(node).toEqual({ a: 1, text: 'test' });
    });

    it('applies props to all descendants for element roots', () => {
      const node = createNestedElement();
      const expected = {
        a: 1,
        children: [
          { a: 1, text: 'test' },
          {
            a: 1,
            children: [{ a: 1, text: 'test' }],
            type: 'paragraph',
          },
          { a: 1, text: 'test' },
        ],
        type: 'listItem',
      };

      mergeDeepToNodes({
        node: node as any,
        match: NodeApi.isDescendant,
        source: { a: 1 },
      });

      expect(node).toEqual(expected);
    });

    it('calls the source factory for each matched node', () => {
      const node = createNestedElement();
      let calls = 0;

      mergeDeepToNodes({
        node: node as any,
        match: NodeApi.isDescendant,
        source: () => ({ order: ++calls }),
      });

      expect(calls).toBe(5);
      expect(node).toEqual({
        children: [
          { order: 2, text: 'test' },
          {
            children: [{ order: 4, text: 'test' }],
            order: 3,
            type: 'paragraph',
          },
          { order: 5, text: 'test' },
        ],
        order: 1,
        type: 'listItem',
      });
    });
  });

  describe('element queries', () => {
    it('leaves text nodes untouched', () => {
      const node = { text: 'test' };

      mergeDeepToNodes({
        node: node as any,
        match: NodeApi.isElement,
        source: { a: 1 },
      });

      expect(node).toEqual({ text: 'test' });
    });

    it('applies props only to element nodes for element roots', () => {
      const node = createNestedElement();
      const expected = {
        a: 1,
        children: [
          { text: 'test' },
          {
            a: 1,
            children: [{ text: 'test' }],
            type: 'paragraph',
          },
          { text: 'test' },
        ],
        type: 'listItem',
      };

      mergeDeepToNodes({
        node: node as any,
        match: NodeApi.isElement,
        source: { a: 1 },
      });

      expect(node).toEqual(expected);
    });
  });
});
