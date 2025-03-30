import { createTestEditor } from '../__tests__/createTestEditor';
import { indentListToMdastTree } from './indentListToMdastTree';

const editor = createTestEditor();

describe('indentListToMdastTree', () => {
  it('should convert a flat list correctly', () => {
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

    const result = indentListToMdastTree(nodes as any, {
      editor,
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
          type: 'listItem',
        },
      ],
      ordered: false,
      start: 1,
      type: 'list',
    });
  });

  it('should convert a nested list correctly', () => {
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

    const result = indentListToMdastTree(nodes as any, {
      editor,
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
                  type: 'listItem',
                },
              ],
              ordered: false,
              start: 1,
              type: 'list',
            },
          ],
          type: 'listItem',
        },
      ],
      ordered: false,
      start: 1,
      type: 'list',
    });
  });

  it('should handle ordered lists correctly', () => {
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

    const result = indentListToMdastTree(nodes as any, {
      editor,
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
          type: 'listItem',
        },
      ],
      ordered: true,
      start: 1,
      type: 'list',
    });
  });

  it('should handle complex nested lists with different indentation levels', () => {
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

    const result = indentListToMdastTree(nodes as any, {
      editor,
    }) as any;

    // The structure should correctly represent the indentation levels
    expect(result.children).toHaveLength(2); // Two top-level items
    expect(result.children[0].children).toHaveLength(2); // First item has paragraph and nested list
    expect(result.children[0].children[1].children).toHaveLength(2); // Nested list has two items
  });

  it('should throw error for empty nodes', () => {
    expect(() => indentListToMdastTree([], { editor })).toThrow(
      'Cannot create a list from empty nodes'
    );
  });

  it('should handle mixed ordered and unordered nested lists', () => {
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

    const result = indentListToMdastTree(nodes as any, {
      editor,
    }) as any;

    expect(result.ordered).toBe(false);
    expect(result.children[0].children[1].ordered).toBe(true);
    expect(result.children[0].children[1].children[1].children[1].ordered).toBe(
      false
    );
  });

  it('should handle ordered lists with different start numbers', () => {
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

    const result = indentListToMdastTree(nodes as any, {
      editor,
    }) as any;

    expect(result.ordered).toBe(true);
    expect(result.start).toBe(3);
    expect(result.children[0].children[1].start).toBe(5);
  });

  it('should handle deep nesting followed by shallow items', () => {
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

    const result = indentListToMdastTree(nodes as any, {
      editor,
    }) as any;

    expect(result.children).toHaveLength(2);
    expect(
      result.children[0].children[1].children[0].children[1].children[0]
        .children[0].children[0].value
    ).toBe('level 3');
    expect(result.children[1].children[0].children[0].value).toBe(
      'back to level 1'
    );
  });

  it('should handle list items with rich text content', () => {
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

    const result = indentListToMdastTree(nodes as any, {
      editor,
    }) as any;

    const firstItem = result.children[0].children[0].children;

    expect(firstItem).toHaveLength(4);
    expect(JSON.stringify(firstItem[1])).toContain('strong');
    expect(JSON.stringify(firstItem[3])).toContain('emphasis');

    const nestedItem = result.children[0].children[1].children;

    expect(JSON.stringify(nestedItem[0])).toContain('link');
    expect(JSON.stringify(nestedItem[0])).toContain('https://example.com');
  });
});
