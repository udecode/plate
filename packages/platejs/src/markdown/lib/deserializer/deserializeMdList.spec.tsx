/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from '../__tests__/createTestEditor';
import { nameListIds } from '../__tests__/nameListIds';

jsxt;

describe('deserializeMdList - comprehensive coverage', () => {
  const editor = createTestEditor();

  it('preserves ordered-list starts after setValue normalizes the value [EDIT-LIST-START-MD-401]', () => {
    const innerEditor = createTestEditor();
    const input = `
1. First list item

Break between lists.

2. Second list item
3. Third list item
`.trim();

    const value = parseTestMarkdown(innerEditor, input);
    const expected = [
      {
        children: [{ text: 'First list item' }],
        indent: 1,
        listId: 'a',
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
        listId: 'b',
        listStart: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Third list item' }],
        indent: 1,
        listId: 'b',
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    expect(nameListIds(value.children)).toEqual(expected);

    innerEditor.update.value.replace(value);

    expect(nameListIds(innerEditor.read.value().children)).toEqual(expected);
  });

  it('keeps the starts of two sublists under one item [EDIT-LIST-START-MD-401]', () => {
    const innerEditor = createTestEditor();

    innerEditor.update.value.replace(
      parseTestMarkdown(
        innerEditor,
        '1. Parent\n\n   2. Two\n\n   Between\n\n   5. Five\n'
      )
    );

    expect(
      innerEditor.read
        .children()
        .map((node, index) =>
          node.listType ? innerEditor.read.list.ordinal([index]) : null
        )
    ).toEqual([1, 2, null, 5]);
  });

  it('preserves an ordered list that starts at zero [EDIT-LIST-START-MD-401]', () => {
    const value = parseTestMarkdown(editor, '0. Zero\n1. One');

    expect(nameListIds(value.children)).toMatchObject([
      {
        children: [{ text: 'Zero' }],
        indent: 1,
        listId: 'a',
        listStart: 0,
        listType: 'numbered',
      },
      {
        children: [{ text: 'One' }],
        indent: 1,
        listId: 'a',
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
        listId: 'a',
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Item B' }],
        indent: 1,
        listId: 'a',
        listType: 'numbered',
        type: 'paragraph',
      },

      // 2) Blank line

      // 3) The same loose list continues, so its own start does not count
      {
        children: [{ text: 'Custom start item' }],
        indent: 1,
        listId: 'a',
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Another item' }],
        indent: 1,
        listId: 'a',
        listType: 'numbered',
        type: 'paragraph',
      },

      // 4) Blank line

      // 5) Mixed bullet -> sub-bullet -> sub-ordered
      {
        children: [{ text: 'Bullet outer' }],
        indent: 1,
        listId: 'b',
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Nested bullet' }],
        indent: 2,
        listId: 'b',
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Nested ordered' }],
        indent: 3,
        listId: 'b',
        listType: 'numbered',
        type: 'paragraph',
      },

      // 6) Star bullet item + empty item
      {
        children: [{ text: 'Star bullet' }],
        indent: 1,
        listId: 'c',
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        indent: 1,
        listId: 'c',
        listType: 'bulleted',
        type: 'paragraph',
      },
      // Extra blank lines produce no tokens

      {
        children: [{ text: 'Some item' }],
        indent: 1,
        listId: 'd',
        listType: 'bulleted',
        type: 'paragraph',
      },

      // 7) Another bullet with a sub-bullet
      {
        children: [{ text: 'Another bullet' }],
        indent: 1,
        listId: 'd',
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Sub bullet' }],
        indent: 2,
        listId: 'd',
        listType: 'bulleted',
        type: 'paragraph',
      },
      // 8) Deeply nested ordered list
      {
        children: [{ text: 'a' }],
        indent: 1,
        listId: 'e',
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'b' }],
        indent: 2,
        listId: 'e',
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'c' }],
        indent: 3,
        listId: 'e',
        listType: 'numbered',
        type: 'paragraph',
      },
      // A second sublist under "a" starts its own list
      {
        children: [{ text: 'sibling bullet' }],
        indent: 2,
        listId: 'f',
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    expect(nameListIds(parseTestMarkdown(editor, input).children)).toEqual(
      output
    );
  });
});

describe('separate Markdown lists', () => {
  const twoLists = '1. A\n2. B\n\nNote\n\n1. C\n2. D\n';
  const caretAt = (
    editor: ReturnType<typeof createTestEditor>,
    text: string
  ) => {
    const index = editor.read
      .children()
      .findIndex(
        (node) => 'children' in node && node.children[0]?.text === text
      );

    editor.update.selection.set({
      anchor: { offset: 0, path: [index, 0] },
      focus: { offset: 0, path: [index, 0] },
      kind: 'text',
    });

    return index;
  };
  const numbers = (editor: ReturnType<typeof createTestEditor>) =>
    editor.read
      .children()
      .map((_, index) => editor.read.list.ordinal([index]) ?? null);
  const load = (source: string) => {
    const editor = createTestEditor();

    editor.update.value.replace(parseTestMarkdown(editor, source));

    return editor;
  };

  it('keeps the second list counting from 1 after Backspace at its first item [EDIT-LIST-START-MD-401]', () => {
    const editor = load(twoLists);

    caretAt(editor, 'C');
    editor.update.text.deleteBackward();

    expect(numbers(editor)).toEqual([1, 2, null, null, 1]);
  });

  it('keeps the second list separate when its first item moves below the next [EDIT-LIST-START-MD-401]', () => {
    const editor = load(twoLists);

    editor.update.nodes.move({ at: [3], to: [4] });

    expect(numbers(editor)).toEqual([1, 2, null, 1, 2]);
  });

  it('keeps a raw insert of a second parse in its own list [EDIT-LIST-START-MD-401]', () => {
    const editor = load('1. A\n2. B\n');
    const second = editor.api.markdown.parseSlice('1. X\n2. Y\n');

    if (!second.ok) throw new Error('Expected a parsed slice');
    editor.update.nodes.insert(
      [
        { children: [{ text: 'Note' }], type: 'paragraph' },
        ...second.slice.content,
      ],
      { at: [2] }
    );
    caretAt(editor, 'X');
    editor.update.text.deleteBackward();

    expect(numbers(editor)).toEqual([1, 2, null, null, 1]);
  });

  it('keeps two pasted Markdown lists separate [EDIT-LIST-START-MD-401]', () => {
    const editor = load('Intro\n');
    const pasted = editor.api.markdown.parseSlice(twoLists);

    if (!pasted.ok) throw new Error('Expected a parsed slice');
    editor.update.selection.set({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
      kind: 'text',
    });
    editor.update.slice.replace(pasted.slice);
    caretAt(editor, 'C');
    editor.update.text.deleteBackward();

    expect(numbers(editor).slice(-2)).toEqual([null, 1]);
  });

  it('joins only the first pasted list to the list item it lands in', () => {
    const editor = createTestEditor();

    editor.update.value.replace({
      children: [
        {
          children: [{ text: 'X' }],
          indent: 1,
          listId: 'existing',
          listType: 'numbered',
          type: 'paragraph',
        },
        {
          children: [{ text: '' }],
          indent: 1,
          listId: 'existing',
          listType: 'numbered',
          type: 'paragraph',
        },
      ],
    });
    editor.update.selection.set({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
      kind: 'text',
    });

    const pasted = editor.api.markdown.parseSlice(twoLists);

    if (!pasted.ok) throw new Error('Expected a parsed slice');
    editor.update.slice.replace(pasted.slice);

    expect(
      editor.read
        .children()
        .map((node) => (node.listType ? node.listId === 'existing' : null))
    ).toEqual([true, true, true, null, false, false]);
  });

  it('joins a list pasted over two items to the list it starts in', () => {
    const editor = load('1. A\n2. B\n3. C\n4. D\n');
    const pasted = editor.api.markdown.parseSlice('1. b\n2. c\n');

    if (!pasted.ok) throw new Error('Expected a parsed slice');
    editor.update.selection.set({
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 1, path: [2, 0] },
      kind: 'text',
    });
    editor.update.slice.replace(pasted.slice);

    expect(numbers(editor)).toEqual([1, 2, 3, 4]);
  });

  it('keeps a list copied from another editor out of the destination lists [EDIT-LIST-START-MD-401]', () => {
    const destination = load('1. A\n2. B\n\nNote\n');
    const source = load('1. X\n2. Y\n');

    destination.api.transfer.move({
      from: source,
      nodes: [source.key([0])!, source.key([1])!],
      to: { edge: 'after', key: destination.key([2])! },
    });
    caretAt(destination, 'X');
    destination.update.text.deleteBackward();

    expect(numbers(destination)).toEqual([1, 2, null, null, 1]);
  });
});
