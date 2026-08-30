import { createTestEditor } from './__tests__/createTestEditor';

describe('column package surfaces', () => {
  const createColumnEditor = () => createTestEditor();

  it('round-trips a column group through the markdown package surfaces', () => {
    const editor = createColumnEditor();
    const input = `<columnGroup>
  <column width="50%">
    Left column
  </column>

  <column width="50%">
    Right column
  </column>
</columnGroup>
`;

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ text: 'Left column' }],
                type: 'paragraph',
              },
            ],
            type: 'column',
            width: '50%',
          },
          {
            children: [
              {
                children: [{ text: 'Right column' }],
                type: 'paragraph',
              },
            ],
            type: 'column',
            width: '50%',
          },
        ],
        type: 'columnGroup',
      },
    ]);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(input);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });
});
