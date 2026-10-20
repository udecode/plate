import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

describe('markdown date element', () => {
  it('round-trips inline date elements through the markdown package surfaces [EDIT-DATE-MDX-001]', () => {
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

  it('reads attribute-bearing date elements into the canonical node value [EDIT-DATE-MDX-001]', () => {
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

  it('reads authored child text as written and writes it as a text attribute [EDIT-DATE-MDX-001]', () => {
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
    expect(markdown).toBe('Date: <date text="sometime next week" />\n');
  });

  it('upgrades safe legacy child-text dates onto the canonical attribute writer [EDIT-DATE-MDX-001]', () => {
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

  it('reads a v1 date written as a value attribute into the canonical day [EDIT-DATE-MDX-001]', () => {
    const editor = createTestEditor();

    expect(
      parseTestMarkdown(editor, 'Date: <date value="Mon Mar 23 2026" />')
        .children
    ).toMatchObject([
      { children: [{ text: 'Date: ' }, { value: '2026-03-23' }, { text: '' }] },
    ]);
  });

  it('keeps v1-shaped text naming an impossible day as authored text [EDIT-DATE-MDX-001]', () => {
    const editor = createTestEditor();

    for (const text of ['Fri Feb 30 2026', 'Tue Mar 23 2026']) {
      expect(
        parseTestMarkdown(editor, `Date: <date>${text}</date>`).children
      ).toMatchObject([
        { children: [{ text: 'Date: ' }, { value: text }, { text: '' }] },
      ]);
    }
  });

  it.each([
    ['sometime next week', '<date text="sometime next week" />'],
    ['Mon Mar 23 2026', '<date text="Mon Mar 23 2026" />'],
    [' sometime next week ', '<date text=" sometime next week " />'],
    [' 2026-03-23 ', '<date text=" 2026-03-23 " />'],
    ['one\n\ntwo', '<date text="one&#10;&#10;two" />'],
    ['next\n\nweek', '<date text="next&#10;&#10;week" />'],
    [':smile:', '<date text=":smile:" />'],
    ['next :smile:', '<date text="next :smile:" />'],
    ['one\u0000two', '<date text="one&#0;two" />'],
  ])('round-trips stored text %j as %s [EDIT-DATE-MDX-001]', (stored, tag) => {
    const editor = createTestEditor();
    const serialized = serializeTestMarkdown(editor, {
      document: {
        children: [
          {
            children: [
              { text: 'Date: ' },
              { children: [{ text: '' }], type: 'date', value: stored },
              { text: ' due' },
            ],
            type: 'paragraph',
          },
        ],
      },
    });
    const parsed = editor.api.markdown.parse(serialized.data);

    expect(serialized.data).toBe(`Date: ${tag} due\n`);
    expect(parsed.ok && parsed.document.children).toMatchObject([
      { children: [{ text: 'Date: ' }, { value: stored }, { text: ' due' }] },
    ]);
    expect(serialized.diagnostics).toEqual([]);
    expect(parsed.diagnostics).toEqual([]);
  });

  it('writes a day the host zone skipped as a text attribute that reads back the same [EDIT-DATE-MDX-001]', () => {
    const originalTimeZone = process.env.TZ ?? 'UTC';
    process.env.TZ = 'Pacific/Apia';

    try {
      const editor = createTestEditor();
      const serialized = serializeTestMarkdown(editor, {
        document: {
          children: [
            {
              children: [
                { text: 'Date: ' },
                { children: [{ text: '' }], type: 'date', value: '2011-12-30' },
                { text: '' },
              ],
              type: 'paragraph',
            },
          ],
        },
      });

      expect(serialized.data).toBe('Date: <date text="2011-12-30" />\n');
      expect(parseTestMarkdown(editor, serialized.data).children).toMatchObject(
        [
          {
            children: [
              { text: 'Date: ' },
              { value: '2011-12-30' },
              { text: '' },
            ],
          },
        ]
      );
    } finally {
      process.env.TZ = originalTimeZone;
    }
  });
});
