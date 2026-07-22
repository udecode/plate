import type { MdList, MdListItem, MdParagraph, MdText } from '../mdast';

import {
  createTestEditor,
  getTestSerializeOptions,
} from '../__tests__/createTestEditor';
import { listToMdastTree } from './listToMdastTree';

const editor = createTestEditor();
const runtimeOptions = getTestSerializeOptions(editor);

const getList = (parent: MdListItem, index: number): MdList => {
  const node = parent.children[index];

  if (node?.type !== 'list') throw new Error('Expected nested list');

  return node;
};

const getListItem = (list: MdList, index: number): MdListItem => {
  const node = list.children[index];

  if (!node) throw new Error('Expected list item');

  return node;
};

const getParagraph = (item: MdListItem, index: number): MdParagraph => {
  const node = item.children[index];

  if (node?.type !== 'paragraph') throw new Error('Expected paragraph');

  return node;
};

const getText = (paragraph: MdParagraph, index: number): MdText => {
  const node = paragraph.children[index];

  if (node?.type !== 'text') throw new Error('Expected text');

  return node;
};

describe('listToMdastTree', () => {
  it('convert a flat list correctly', () => {
    const nodes = [
      {
        children: [{ text: 'list1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'list2' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(result).toEqual({
      children: [
        {
          checked: null,
          children: [
            {
              children: [{ type: 'text', value: 'list1' }],
              type: 'paragraph',
            },
          ],
          spread: false,
          type: 'listItem',
        },
        {
          checked: null,
          children: [
            {
              children: [{ type: 'text', value: 'list2' }],
              type: 'paragraph',
            },
          ],
          spread: false,
          type: 'listItem',
        },
      ],
      ordered: false,
      spread: false,
      start: 1,
      type: 'list',
    });
  });

  it('convert a nested list correctly', () => {
    const nodes = [
      {
        children: [{ text: 'list1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'list2' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'list3' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(result).toEqual({
      children: [
        {
          checked: null,
          children: [
            {
              children: [{ type: 'text', value: 'list1' }],
              type: 'paragraph',
            },
          ],
          spread: false,
          type: 'listItem',
        },
        {
          checked: null,
          children: [
            {
              children: [{ type: 'text', value: 'list2' }],
              type: 'paragraph',
            },
            {
              children: [
                {
                  checked: null,
                  children: [
                    {
                      children: [{ type: 'text', value: 'list3' }],
                      type: 'paragraph',
                    },
                  ],
                  spread: false,
                  type: 'listItem',
                },
              ],
              ordered: false,
              spread: false,
              start: 1,
              type: 'list',
            },
          ],
          spread: false,
          type: 'listItem',
        },
      ],
      ordered: false,
      spread: false,
      start: 1,
      type: 'list',
    });
  });

  it('handle ordered lists correctly', () => {
    const nodes = [
      {
        children: [{ text: 'list1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'list2' }],
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(result).toEqual({
      children: [
        {
          checked: null,
          children: [
            {
              children: [{ type: 'text', value: 'list1' }],
              type: 'paragraph',
            },
          ],
          spread: false,
          type: 'listItem',
        },
        {
          checked: null,
          children: [
            {
              children: [{ type: 'text', value: 'list2' }],
              type: 'paragraph',
            },
          ],
          spread: false,
          type: 'listItem',
        },
      ],
      ordered: true,
      spread: false,
      start: 1,
      type: 'list',
    });
  });

  it('handle complex nested lists with different indentation levels', () => {
    const nodes = [
      {
        children: [{ text: 'level1-1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'level2-1' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'level3-1' }],
        indent: 3,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'level2-2' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'level1-2' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    // The structure should correctly represent the indentation levels
    expect(result.children).toHaveLength(2); // Two top-level items
    expect(result.children[0].children).toHaveLength(2); // First item has paragraph and nested list
    expect(getList(result.children[0], 1).children).toHaveLength(2); // Nested list has two items
  });

  it('throw error for empty nodes', () => {
    expect(() => listToMdastTree([], runtimeOptions)).toThrow(
      'Cannot create a list from empty nodes'
    );
  });

  it('handle mixed ordered and unordered nested lists', () => {
    const nodes = [
      {
        children: [{ text: 'unordered 1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'ordered 1' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'ordered 2' }],
        indent: 2,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'unordered sub' }],
        indent: 3,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(result.ordered).toBe(false);
    const orderedList = getList(result.children[0], 1);

    expect(orderedList.ordered).toBe(true);
    expect(getList(getListItem(orderedList, 1), 1).ordered).toBe(false);
  });

  it('split sibling nested lists when style changes at same indent', () => {
    const nodes = [
      {
        children: [{ text: 'parent bullet' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'child ordered' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'child bullet' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(result.ordered).toBe(false);
    expect(getList(result.children[0], 1).ordered).toBe(true);
    expect(getList(result.children[0], 2).ordered).toBe(false);
  });

  it('handle ordered lists with different start numbers', () => {
    const nodes = [
      {
        children: [{ text: 'start from 3' }],
        indent: 1,
        listStart: 3,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'nested start from 5' }],
        indent: 2,
        listStart: 5,
        listStyleType: 'decimal',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(result.ordered).toBe(true);
    expect(result.start).toBe(3);
    expect(getList(result.children[0], 1).start).toBe(5);
  });

  it('handle deep nesting followed by shallow items', () => {
    const nodes = [
      {
        children: [{ text: 'level 1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'level 2' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'level 3' }],
        indent: 3,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'level 4' }],
        indent: 4,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'back to level 1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(result.children).toHaveLength(2);
    const level2List = getList(result.children[0], 1);
    const level3List = getList(getListItem(level2List, 0), 1);
    const level3Paragraph = getParagraph(getListItem(level3List, 0), 0);

    expect(getText(level3Paragraph, 0).value).toBe('level 3');
    expect(getText(getParagraph(result.children[1], 0), 0).value).toBe(
      'back to level 1'
    );
  });

  it('handle list items with rich text content', () => {
    const nodes = [
      {
        children: [
          { text: 'normal ', type: 'text' },
          { bold: true, text: 'bold', type: 'text' },
          { text: ' and ', type: 'text' },
          { italic: true, text: 'italic', type: 'text' },
        ],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          { text: 'with ', type: 'text' },
          {
            children: [{ text: 'link', type: 'text' }],
            type: 'a',
            url: 'https://example.com',
          },
        ],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    const firstItem = getParagraph(result.children[0], 0).children;

    expect(firstItem).toHaveLength(4);
    expect(JSON.stringify(firstItem[1])).toContain('strong');
    expect(JSON.stringify(firstItem[3])).toContain('emphasis');

    const nestedList = getList(result.children[0], 1);
    const nestedItem = getParagraph(getListItem(nestedList, 0), 0).children;

    expect(JSON.stringify(nestedItem)).toContain('link');
    expect(JSON.stringify(nestedItem)).toContain('https://example.com');
  });

  it('handle todo lists correctly', () => {
    const nodes = [
      {
        checked: true,
        children: [{ text: 'todo 1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'todo',
        type: 'p',
      },
      {
        checked: false,
        children: [{ text: 'todo 2' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'todo',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(result).toMatchSnapshot();
  });

  it('handle spread option correctly', () => {
    const nodes = [
      {
        children: [{ text: 'list1' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'list2' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ];

    // Test with spread: false (default)
    const resultNoSpread = listToMdastTree(nodes, {
      ...runtimeOptions,
    });

    expect(resultNoSpread.spread).toBe(false);

    // Test with spread: true
    const resultWithSpread = listToMdastTree(nodes, {
      ...runtimeOptions,
      spread: true,
    });

    expect(resultWithSpread.spread).toBe(true);
  });

  it('creates sibling nested lists when the style changes at the same indent', () => {
    const nodes = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'unordered child' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [{ text: 'ordered child' }],
        indent: 2,
        listStart: 3,
        listStyleType: 'decimal',
        type: 'p',
      },
    ];

    const result = listToMdastTree(nodes, runtimeOptions);
    const nestedChildren = result.children[0].children.slice(1);

    expect(nestedChildren).toEqual([
      {
        children: [
          {
            checked: null,
            children: [
              {
                children: [{ type: 'text', value: 'unordered child' }],
                type: 'paragraph',
              },
            ],
            spread: false,
            type: 'listItem',
          },
        ],
        ordered: false,
        spread: false,
        start: 1,
        type: 'list',
      },
      {
        children: [
          {
            checked: null,
            children: [
              {
                children: [{ type: 'text', value: 'ordered child' }],
                type: 'paragraph',
              },
            ],
            spread: false,
            type: 'listItem',
          },
        ],
        ordered: true,
        spread: false,
        start: 3,
        type: 'list',
      },
    ]);
  });

  it('wraps block-id list items individually when block ids are enabled', () => {
    const nodes = [
      {
        children: [{ text: 'first' }],
        id: 'block-a',
        indent: 1,
        listStart: 7,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: 'second' }],
        indent: 1,
        listStart: 8,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        checked: true,
        children: [{ text: 'todo' }],
        id: 'block-c',
        indent: 1,
        listStart: 1,
        listStyleType: 'todo',
        type: 'p',
      },
    ];

    const result = listToMdastTree(
      nodes,
      { ...runtimeOptions, spread: true, withBlockId: true },
      true
    );

    expect(result).toEqual({
      children: [
        {
          attributes: [
            {
              name: 'id',
              type: 'mdxJsxAttribute',
              value: 'block-a',
            },
          ],
          children: [
            {
              children: [
                {
                  checked: null,
                  children: [
                    {
                      children: [{ type: 'text', value: 'first' }],
                      type: 'paragraph',
                    },
                  ],
                  spread: true,
                  type: 'listItem',
                },
              ],
              ordered: true,
              spread: true,
              start: 1,
              type: 'list',
            },
          ],
          data: { _mdxExplicitJsx: true },
          name: 'block',
          type: 'mdxJsxFlowElement',
        },
        {
          children: [
            {
              checked: null,
              children: [
                {
                  children: [{ type: 'text', value: 'second' }],
                  type: 'paragraph',
                },
              ],
              spread: true,
              type: 'listItem',
            },
          ],
          ordered: true,
          spread: true,
          start: 2,
          type: 'list',
        },
        {
          attributes: [
            {
              name: 'id',
              type: 'mdxJsxAttribute',
              value: 'block-c',
            },
          ],
          children: [
            {
              children: [
                {
                  checked: true,
                  children: [
                    {
                      children: [{ type: 'text', value: 'todo' }],
                      type: 'paragraph',
                    },
                  ],
                  spread: true,
                  type: 'listItem',
                },
              ],
              ordered: false,
              spread: true,
              start: undefined,
              type: 'list',
            },
          ],
          data: { _mdxExplicitJsx: true },
          name: 'block',
          type: 'mdxJsxFlowElement',
        },
      ],
      type: 'fragment',
    });
  });
});
