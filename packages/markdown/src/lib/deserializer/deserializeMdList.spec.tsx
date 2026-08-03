/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
jsxt;

describe('deserializeMdList - comprehensive coverage', () => {
  const editor = createTestEditor();

  it('preserves ordered-list starts after setValue normalizes the value', () => {
    const editor = createTestEditor();
    const input = `
1. First list item

Break between lists.

2. Second list item
3. Third list item
`.trim();

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject([
      {
        children: [{ text: 'First list item' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'decimal',
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
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Third list item' }],
        indent: 1,
        listStart: 3,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
    ]);

    editor.update.value.replace(value);

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'First list item' }],
        indent: 1,
        listStyleType: 'decimal',
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
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Third list item' }],
        indent: 1,
        listStart: 3,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
    ]);
  });

  it('deserializes a single Markdown string containing all list edge cases', () => {
    /**
     * Explanation of this Markdown:
     *
     * 1. Ordered list (starts at 1), 2 items
     * 2. Blank line
     * 3. Ordered list with custom start=3
     * 4. Blank line
     * 5. Mixed bullet -> sub-bullet -> sub-ordered
     * 6. Blank line
     * 7. A bullet item with an indented blockquote
     * 8. Blank line
     * 9. Star bullet item + an empty item + multiple blank lines
     * 10. Another bullet list with code fence inside a sub-bullet
     * 11. Deeply nested ordered list (3 levels) + bullet sibling
     */
    const input = `
1. Item A
2. Item B

3. Custom start item
4. Another item

- Bullet outer
   - Nested bullet
      1. Nested ordered

- A bullet with a blockquote:
   > This is inside blockquote
   > And so on

* Star bullet
*

- Some item

- Another bullet
   - Sub bullet
      \`\`\`
      console.info("code fence");
      \`\`\`

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
        listStart: 1,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Item B' }],
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'paragraph',
      },

      // 2) Blank line

      // 3) Ordered list with custom start=3
      {
        children: [{ text: 'Custom start item' }],
        indent: 1,
        listStart: 3,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Another item' }],
        indent: 1,
        listStart: 4,
        listStyleType: 'decimal',
        type: 'paragraph',
      },

      // 4) Blank line

      // 5) Mixed bullet -> sub-bullet -> sub-ordered
      {
        children: [{ text: 'Bullet outer' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Nested bullet' }],
        indent: 2,
        listStyleType: 'disc',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Nested ordered' }],
        indent: 3,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'paragraph',
      },

      // 6) Blank line

      // 7) Bullet item with indented blockquote
      {
        children: [{ text: 'A bullet with a blockquote:' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'paragraph',
      },
      // The blockquote lines become paragraphs at indent + 1 (if your parser merges them),
      // or in some implementations, they might remain at indent 1. Adapt if needed.
      // If your logic doesn't treat blockquotes as separate paragraphs inside the list,
      // you'll see them in a single paragraph. Tweak as needed.
      {
        children: [
          {
            children: [{ text: 'This is inside blockquote\nAnd so on' }],
            type: 'paragraph',
          },
        ],
        // Might become indent: 2, or remain indent: 1, depending on how your parser merges them.
        // We'll guess indent: 2 for demonstration.
        indent: 2,
        type: 'blockquote',
      },

      // 8) Blank line

      // 9) Star bullet item + empty item
      {
        children: [{ text: 'Star bullet' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'paragraph',
      },
      // Extra blank lines produce no tokens

      {
        children: [{ text: 'Some item' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'paragraph',
      },

      // 10) Another bullet with sub bullet + code fence
      {
        children: [{ text: 'Another bullet' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Sub bullet' }],
        indent: 2,
        listStyleType: 'disc',
        type: 'paragraph',
      },
      {
        children: [
          {
            children: [{ text: 'console.info("code fence");' }],
            type: 'codeLine',
          },
        ],
        indent: 3,
        type: 'codeBlock',
      },

      // 11) Deeply nested ordered list
      {
        children: [{ text: 'a' }],
        indent: 1,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: 'b' }],
        indent: 2,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      {
        children: [{ text: 'c' }],
        indent: 3,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'paragraph',
      },
      // followed by sibling bullet at indent 2
      {
        children: [{ text: 'sibling bullet' }],
        indent: 2,
        listStyleType: 'disc',
        type: 'paragraph',
      },
    ];

    expect(editor.api.markdown.deserialize(input).children).toEqual(output);
  });

  it('deserializes an empty list', () => {
    const input = `
    - list
      - list
    - list
    - list
    - 
      `;

    expect(editor.api.markdown.deserialize(input).children).toMatchSnapshot();
  });

  it('deserializes a todo list', () => {
    const input = `
    - [ ] todo list
    - [x] todo list
    `;
    expect(editor.api.markdown.deserialize(input).children).toMatchSnapshot();
  });
});
