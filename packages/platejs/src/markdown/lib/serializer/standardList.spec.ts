import { createTestEditor } from '../__tests__/createTestEditor';

const editor = createTestEditor();

describe('editor.api.markdown.serialize list', () => {
  it('serialize unordered lists', () => {
    const input = [
      {
        children: [{ text: 'List item 1' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'List item 2' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* List item 1\n* List item 2\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize ordered lists', () => {
    const input = [
      {
        children: [{ text: 'List item 1' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'List item 2' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const expected = '1. List item 1\n2. List item 2\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize mixed nested lists', () => {
    const input = [
      {
        children: [{ text: 'List item 1' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'List item 1.1' }],
        indent: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const expected = '* List item 1\n  1. List item 1.1\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize nested indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* parent\n  * child\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize nested ordered indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const expected = '1. parent\n   1. child\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize deeply nested indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'grandchild' }],
        indent: 3,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* parent\n  * child\n    * grandchild\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize sibling nested indented lists when style changes at same indent', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'ordered child' }],
        indent: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'bullet child' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* parent\n  1. ordered child\n  * bullet child\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize nested indented list followed by sibling item without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'sibling' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* parent\n  * child\n* sibling\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize lists with formatted text', () => {
    const input = [
      {
        children: [
          { text: 'Normal text and ' },
          { bold: true, text: 'bold text' },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [
          { italic: true, text: 'Italic text' },
          { text: ' and normal text' },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected =
      '* Normal text and **bold text**\n* _Italic text_ and normal text\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize restarted ordered lists separated by a paragraph', () => {
    const input = [
      {
        children: [{ text: 'First list item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Break between lists.' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Second list item' }],
        indent: 1,
        listStart: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Third list item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const expected =
      '1. First list item\n\nBreak between lists.\n\n2. Second list item\n3. Third list item\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });

  it('serialize lists with links', () => {
    const input = [
      {
        children: [
          { text: 'Text with ' },
          {
            children: [{ text: 'a link' }],
            type: 'link',
            url: 'https://example.com',
          },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* Text with [a link](https://example.com)\n';

    expect(editor.api.markdown.serialize({ value: { children: input } })).toBe(
      expected
    );
  });
});
