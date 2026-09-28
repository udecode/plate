/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from '../__tests__/createTestEditor';

jsxt;

describe('deserializeMdList - comprehensive coverage', () => {
  const editor = createTestEditor();

  it('preserves ordered-list starts after setValue normalizes the value', () => {
    const innerEditor = createTestEditor();
    const input = `
1. First list item

Break between lists.

2. Second list item
3. Third list item
`.trim();

    const value = parseTestMarkdown(innerEditor, input);

    expect(value.children).toMatchObject([
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
        listRestart: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Third list item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
    ]);

    innerEditor.update.value.replace(value);

    expect(innerEditor.read.value().children).toMatchObject([
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
        listRestart: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Third list item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
    ]);
  });

  it('preserves an ordered list that starts at zero', () => {
    const value = parseTestMarkdown(editor, '0. Zero\n1. One');

    expect(value.children).toMatchObject([
      {
        children: [{ text: 'Zero' }],
        indent: 1,
        listRestart: 0,
        listType: 'numbered',
      },
      {
        children: [{ text: 'One' }],
        indent: 1,
        listType: 'numbered',
      },
    ]);
    expect(serializeTestMarkdown(editor, { document: value }).data).toBe(
      '0. Zero\n1. One\n'
    );
  });

  it('deserializes representable flat-list edge cases from one source', () => {
    /**
     * Explanation of this Markdown:
     *
     * 1. Ordered list (starts at 1), 2 items
     * 2. Blank line
     * 3. Ordered list with custom start=3
     * 4. Blank line
     * 5. Mixed bullet -> sub-bullet -> sub-ordered
     * 6. Blank line
     * 7. Star bullet item + an empty item + multiple blank lines
     * 8. Another nested bullet list
     * 9. Deeply nested ordered list (3 levels) + bullet sibling
     */
    const input = `
1. Item A
2. Item B

3. Custom start item
4. Another item

- Bullet outer
   - Nested bullet
      1. Nested ordered

* Star bullet
*

- Some item

- Another bullet
   - Sub bullet

1. a
   1. b
      1. c
   - sibling bullet
`.trim();

    const output = [
      // 1) Ordered list: #1, #2
      {
        children: [{ text: 'Item A' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Item B' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },

      // 2) Blank line

      // 3) Ordered list with custom start=3
      {
        children: [{ text: 'Custom start item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Another item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },

      // 4) Blank line

      // 5) Mixed bullet -> sub-bullet -> sub-ordered
      {
        children: [{ text: 'Bullet outer' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Nested bullet' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Nested ordered' }],
        indent: 3,
        listType: 'numbered',
        type: 'paragraph',
      },

      // 6) Star bullet item + empty item
      {
        children: [{ text: 'Star bullet' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      // Extra blank lines produce no tokens

      {
        children: [{ text: 'Some item' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },

      // 7) Another bullet with a sub-bullet
      {
        children: [{ text: 'Another bullet' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Sub bullet' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
      // 8) Deeply nested ordered list
      {
        children: [{ text: 'a' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'b' }],
        indent: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'c' }],
        indent: 3,
        listType: 'numbered',
        type: 'paragraph',
      },
      // followed by sibling bullet at indent 2
      {
        children: [{ text: 'sibling bullet' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    expect(parseTestMarkdown(editor, input).children).toEqual(output);
  });

  it('deserializes an empty list', () => {
    const input = ['', '- list', '  - list', '- list', '- list', '- ', ''].join(
      '\n'
    );

    expect(parseTestMarkdown(editor, input).children).toMatchSnapshot();
  });

  it('deserializes a todo list', () => {
    const input = `
- [ ] todo list
- [x] todo list
`;
    expect(parseTestMarkdown(editor, input).children).toMatchSnapshot();
  });
});
