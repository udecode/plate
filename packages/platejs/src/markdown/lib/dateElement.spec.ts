import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

describe('markdown date element', () => {
  it('round-trips inline date elements through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = 'Date: <date>2024-01-01</date>';
    const expected = 'Date: <date value="2024-01-01" />\n';

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject([
      {
        children: [
          { text: 'Date: ' },
          {
            children: [{ text: '' }],
            value: '2024-01-01',
            type: 'date',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(markdown).toBe(expected);
    expect(parseTestMarkdown(editor, markdown)).toMatchObject(value);
  });

  it('reads attribute-bearing date elements into the canonical node value', () => {
    const editor = createTestEditor();
    const input = 'Date: <date value="2024-01-01" />';

    const value = parseTestMarkdown(editor, input);
    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(value.children).toMatchObject([
      {
        children: [
          { text: 'Date: ' },
          {
            children: [{ text: '' }],
            value: '2024-01-01',
            type: 'date',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
    expect(markdown).toBe('Date: <date value="2024-01-01" />\n');
  });

  it('keeps non-normalizable legacy child text on the raw fallback path', () => {
    const editor = createTestEditor();
    const input = 'Date: <date>sometime next week</date>';

    const value = parseTestMarkdown(editor, input);
    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(value.children).toMatchObject([
      {
        children: [
          { text: 'Date: ' },
          {
            children: [{ text: '' }],
            value: 'sometime next week',
            type: 'date',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
    expect(markdown).toBe('Date: <date>sometime next week</date>\n');
  });

  it('upgrades safe legacy child-text dates onto the canonical attribute writer', () => {
    const editor = createTestEditor();
    const input = 'Date: <date>Mon Mar 23 2026</date>';

    const value = parseTestMarkdown(editor, input);
    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(value.children).toMatchObject([
      {
        children: [
          { text: 'Date: ' },
          {
            children: [{ text: '' }],
            value: '2026-03-23',
            type: 'date',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
    expect(markdown).toBe('Date: <date value="2026-03-23" />\n');
  });
});
