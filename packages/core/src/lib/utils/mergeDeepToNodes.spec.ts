import { ElementApi, TextApi } from '@platejs/plite';

import { mergeDeepToNodes } from './mergeDeepToNodes';

const withNestedElement = () => ({
  children: [
    { text: 'test' },
    {
      children: [{ text: 'test' }],
      type: 'p',
    },
    { text: 'test' },
  ],
  type: 'li',
});

const withEditorRoot = () => ({ children: [withNestedElement()] });

const isStructuralDescendant = ([node, path]: [unknown, number[]]) =>
  !(
    path.length === 0 &&
    typeof node === 'object' &&
    node !== null &&
    'children' in node &&
    Array.isArray(node.children) &&
    !('type' in node)
  ) &&
  (ElementApi.isElement(node) || TextApi.isText(node));

const isStructuralElement = (entry: [unknown, number[]]) =>
  isStructuralDescendant(entry) && ElementApi.isElement(entry[0]);

describe('mergeDeepToNodes', () => {
  it('merges props into the root node and all descendants by default', () => {
    const node = {
      children: [
        {
          children: [{ text: 'test' }],
          type: 'p',
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
          type: 'p',
        },
      ],
    });
  });

  describe('descendant queries', () => {
    it('matches a standalone text node', () => {
      const node = { text: 'test' };

      mergeDeepToNodes({
        node: node as any,
        query: {
          filter: isStructuralDescendant,
        },
        source: { a: 1 },
      });

      expect(node).toEqual({ a: 1, text: 'test' });
    });

    it.each([
      {
        expected: {
          a: 1,
          children: [
            { a: 1, text: 'test' },
            {
              a: 1,
              children: [{ a: 1, text: 'test' }],
              type: 'p',
            },
            { a: 1, text: 'test' },
          ],
          type: 'li',
        },
        label: 'element roots',
        node: withNestedElement(),
      },
      {
        expected: [
          {
            a: 1,
            children: [
              { a: 1, text: 'test' },
              {
                a: 1,
                children: [{ a: 1, text: 'test' }],
                type: 'p',
              },
              { a: 1, text: 'test' },
            ],
            type: 'li',
          },
        ],
        label: 'editor roots',
        node: withEditorRoot(),
      },
    ])('applies props to all descendants for $label', ({ expected, node }) => {
      mergeDeepToNodes({
        node: node as any,
        query: {
          filter: isStructuralDescendant,
        },
        source: { a: 1 },
      });

      if (
        'children' in node &&
        Array.isArray(node.children) &&
        !('type' in node)
      ) {
        expect(node).not.toHaveProperty('a');
        expect(node.children).toEqual(expected);
      } else {
        expect(node).toEqual(expected);
      }
    });

    it('calls the source factory for each matched node', () => {
      const node = withNestedElement();
      let calls = 0;

      mergeDeepToNodes({
        node: node as any,
        query: {
          filter: isStructuralDescendant,
        },
        source: () => ({ order: ++calls }),
      });

      expect(calls).toBe(5);
      expect(node).toEqual({
        children: [
          { order: 2, text: 'test' },
          {
            children: [{ order: 4, text: 'test' }],
            order: 3,
            type: 'p',
          },
          { order: 5, text: 'test' },
        ],
        order: 1,
        type: 'li',
      });
    });
  });

  describe('element queries', () => {
    it('leaves text nodes untouched', () => {
      const node = { text: 'test' };

      mergeDeepToNodes({
        node: node as any,
        query: {
          filter: isStructuralElement,
        },
        source: { a: 1 },
      });

      expect(node).toEqual({ text: 'test' });
    });

    it.each([
      {
        expected: {
          a: 1,
          children: [
            { text: 'test' },
            {
              a: 1,
              children: [{ text: 'test' }],
              type: 'p',
            },
            { text: 'test' },
          ],
          type: 'li',
        },
        label: 'element roots',
        node: withNestedElement(),
      },
      {
        expected: [
          {
            a: 1,
            children: [
              { text: 'test' },
              {
                a: 1,
                children: [{ text: 'test' }],
                type: 'p',
              },
              { text: 'test' },
            ],
            type: 'li',
          },
        ],
        label: 'editor roots',
        node: withEditorRoot(),
      },
    ])('applies props only to element nodes for $label', ({
      expected,
      node,
    }) => {
      mergeDeepToNodes({
        node: node as any,
        query: {
          filter: isStructuralElement,
        },
        source: { a: 1 },
      });

      if (
        'children' in node &&
        Array.isArray(node.children) &&
        !('type' in node)
      ) {
        expect(node).not.toHaveProperty('a');
        expect(node.children).toEqual(expected);
      } else {
        expect(node).toEqual(expected);
      }
    });
  });
});
