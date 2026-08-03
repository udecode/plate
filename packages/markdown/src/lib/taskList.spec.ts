import { createTestEditor } from './__tests__/createTestEditor';

describe('markdown task lists', () => {
  it('round-trips checked state through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = '- [ ] open\n- [x] done\n';
    const expected = '* [ ] open\n* [x] done\n';

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject([
      {
        checked: false,
        children: [{ text: 'open' }],
        indent: 1,
        listStyleType: 'todo',
        type: 'paragraph',
      },
      {
        checked: true,
        children: [{ text: 'done' }],
        indent: 1,
        listStyleType: 'todo',
        type: 'paragraph',
      },
    ]);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });
});
