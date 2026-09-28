import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from '../__tests__/createTestEditor';

describe('Markdown references', () => {
  it('resolves reference links and images against their definitions', () => {
    const editor = createTestEditor();

    expect(
      parseTestMarkdown(
        editor,
        'See [Plate][docs] and ![logo][img].\n\n[docs]: https://platejs.org\n[img]: /logo.png'
      ).children
    ).toMatchObject([
      {
        children: [
          { text: 'See ' },
          {
            children: [{ text: 'Plate' }],
            type: 'link',
            url: 'https://platejs.org',
          },
          { text: ' and ' },
        ],
        type: 'paragraph',
      },
      { alt: 'logo', type: 'image', url: '/logo.png' },
      expect.anything(),
    ]);
  });

  it('keeps block content inside footnote definitions', () => {
    const editor = createTestEditor();
    const { children } = parseTestMarkdown(
      editor,
      'Note[^1]\n\n[^1]: > quoted'
    );

    expect(children.at(-1)).toMatchObject({
      children: [{ type: 'blockquote' }],
      ref: '1',
      type: 'footnoteDefinition',
    });
  });

  it('keeps footnote labels distinct after label normalization', () => {
    const editor = createTestEditor();
    const footnote = (ref: string) => ({
      children: [{ children: [{ text: ref }], type: 'paragraph' }],
      ref,
      type: 'footnoteDefinition',
    });
    const markdown = serializeTestMarkdown(editor, {
      document: {
        children: [
          {
            children: [
              { text: 'x' },
              { children: [{ text: '' }], ref: 'A', type: 'footnoteReference' },
              { text: 'y' },
              { children: [{ text: '' }], ref: 'a', type: 'footnoteReference' },
              { text: '' },
            ],
            type: 'paragraph',
          },
          footnote('A'),
          footnote('a'),
        ],
      } as never,
    }).data;

    expect(markdown).toContain('[^A]');
    expect(markdown).toContain('[^a-2]');
    expect(
      parseTestMarkdown(editor, markdown)
        .children.filter(
          (node) => 'type' in node && node.type === 'footnoteDefinition'
        )
        .map((node) => ('ref' in node ? node.ref : undefined))
    ).toEqual(['A', 'a-2']);
  });

  it('warns when a footnote reference has no definition', () => {
    const editor = createTestEditor();

    expect(
      editor.api.markdown.serialize({
        document: {
          children: [
            {
              children: [
                { text: 'x' },
                {
                  children: [{ text: '' }],
                  ref: 'missing',
                  type: 'footnoteReference',
                },
                { text: '' },
              ],
              type: 'paragraph',
            },
          ],
        } as never,
      })
    ).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          code: 'markdown-unsupported-node',
          nodeType: 'footnoteReference',
          severity: 'warning',
        }),
      ],
      ok: true,
    });
  });
});
