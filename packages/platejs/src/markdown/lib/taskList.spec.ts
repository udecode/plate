import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

describe('markdown task lists', () => {
  it('round-trips checked state through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = '- [ ] open\n- [x] done\n';
    const expected = '* [ ] open\n* [x] done\n';

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject([
      {
        checked: false,
        children: [{ text: 'open' }],
        indent: 1,
        listType: 'task',
        type: 'paragraph',
      },
      {
        checked: true,
        children: [{ text: 'done' }],
        indent: 1,
        listType: 'task',
        type: 'paragraph',
      },
    ]);

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(markdown).toBe(expected);
    expect(parseTestMarkdown(editor, markdown)).toMatchObject(value);
  });
});
