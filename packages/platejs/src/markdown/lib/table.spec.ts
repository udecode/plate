import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

const createTableEditor = () => createTestEditor();

describe('markdown tables', () => {
  it('round-trips a simple GFM table through markdown package surfaces', () => {
    const editor = createTableEditor();
    const input =
      '| Name | Value |\n| ---- | ----- |\n| Alpha | Beta |\n| Gamma | Delta |\n';
    const expected =
      '| Name  | Value |\n| ----- | ----- |\n| Alpha | Beta  |\n| Gamma | Delta |\n';

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject([
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              {
                header: true,
                type: 'tableCell',
                children: [{ type: 'paragraph', children: [{ text: 'Name' }] }],
              },
              {
                header: true,
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Value' }] },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            children: [
              {
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Alpha' }] },
                ],
              },
              {
                type: 'tableCell',
                children: [{ type: 'paragraph', children: [{ text: 'Beta' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            children: [
              {
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Gamma' }] },
                ],
              },
              {
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Delta' }] },
                ],
              },
            ],
          },
        ],
      },
    ]);

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(markdown).toBe(expected);
    expect(parseTestMarkdown(editor, markdown)).toMatchObject(value);
  });

  it('keeps unescaped less-than text inside table cells', () => {
    const editor = createTableEditor();
    const input =
      '| Dimension | Basis |\n| --- | --- |\n| Volume trend | a<b |\n';

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Dimension' }] },
                ],
                header: true,
                type: 'tableCell',
              },
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Basis' }] },
                ],
                header: true,
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
          {
            children: [
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Volume trend' }] },
                ],
                type: 'tableCell',
              },
              {
                children: [{ type: 'paragraph', children: [{ text: 'a<b' }] }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('keeps blocks after a table cell with less-than text', () => {
    const editor = createTableEditor();
    const input = [
      '| Dimension | Basis |',
      '| --- | --- |',
      '| Volume trend | a<b |',
      '',
      'After',
    ].join('\n');

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Dimension' }] },
                ],
                header: true,
                type: 'tableCell',
              },
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Basis' }] },
                ],
                header: true,
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
          {
            children: [
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Volume trend' }] },
                ],
                type: 'tableCell',
              },
              {
                children: [{ type: 'paragraph', children: [{ text: 'a<b' }] }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
      {
        children: [{ text: 'After' }],
        type: 'paragraph',
      },
    ]);
  });

  it('repairs the fallback table at the MDX split when a later table exists', () => {
    const editor = createTableEditor();
    const input = [
      '| Dimension | Basis |',
      '| --- | --- |',
      '| Volume trend | a<b |',
      '',
      '| Name | Value |',
      '| --- | --- |',
      '| Later | Table |',
    ].join('\n');

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Dimension' }] },
                ],
                header: true,
                type: 'tableCell',
              },
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Basis' }] },
                ],
                header: true,
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
          {
            children: [
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Volume trend' }] },
                ],
                type: 'tableCell',
              },
              {
                children: [{ type: 'paragraph', children: [{ text: 'a<b' }] }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
      {
        children: [
          {
            children: [
              {
                children: [{ type: 'paragraph', children: [{ text: 'Name' }] }],
                header: true,
                type: 'tableCell',
              },
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Value' }] },
                ],
                header: true,
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
          {
            children: [
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Later' }] },
                ],
                type: 'tableCell',
              },
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Table' }] },
                ],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('keeps a parsed table when an unfinished tag streams in after it', () => {
    const editor = createTableEditor();
    const input = [
      '| Content |',
      '| --- |',
      '| <u>ok</u> |',
      '',
      '<callo',
    ].join('\n');

    const value = parseTestMarkdown(editor, input, { partial: true });

    expect(value.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [
                  { type: 'paragraph', children: [{ text: 'Content' }] },
                ],
                header: true,
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
          {
            children: [
              {
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'ok', underline: true }],
                  },
                ],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ]);
    expect(value.children).toHaveLength(1);
  });

  it('serializes multi-paragraph table cells as html breaks inside one paragraph', () => {
    const editor = createTableEditor();
    const input = [
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              {
                header: true,
                type: 'tableCell',
                children: [{ type: 'paragraph', children: [{ text: 'Name' }] }],
              },
              {
                header: true,
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Value' }] },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            children: [
              {
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Alpha' }] },
                  { type: 'paragraph', children: [{ text: 'Beta' }] },
                ],
              },
              {
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Gamma' }] },
                ],
              },
            ],
          },
        ],
      },
    ];
    const expected =
      '| Name           | Value |\n| -------------- | ----- |\n| Alpha<br/>Beta | Gamma |\n';

    const markdown = serializeTestMarkdown(editor, {
      document: { children: input },
    }).data;

    expect(markdown).toBe(expected);
    expect(parseTestMarkdown(editor, markdown).children).toMatchObject([
      {
        type: 'table',
        children: [
          {
            type: 'tableRow',
            children: [
              {
                header: true,
                type: 'tableCell',
                children: [{ type: 'paragraph', children: [{ text: 'Name' }] }],
              },
              {
                header: true,
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Value' }] },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            children: [
              {
                type: 'tableCell',
                children: [
                  {
                    type: 'paragraph',
                    children: [{ text: 'Alpha\nBeta' }],
                  },
                ],
              },
              {
                type: 'tableCell',
                children: [
                  { type: 'paragraph', children: [{ text: 'Gamma' }] },
                ],
              },
            ],
          },
        ],
      },
    ]);
  });

  it.each([{ colSpan: 2 }, { rowSpan: 2 }])(
    'rejects lossy table span serialization: %o',
    (span) => {
      const editor = createTableEditor();

      expect(
        () =>
          serializeTestMarkdown(editor, {
            document: {
              children: [
                {
                  children: [
                    {
                      children: [
                        {
                          ...span,
                          children: [
                            {
                              children: [{ text: 'merged' }],
                              type: 'paragraph',
                            },
                          ],
                          type: 'tableCell',
                        },
                      ],
                      type: 'tableRow',
                    },
                  ],
                  type: 'table',
                },
              ],
            },
          }).data
      ).toThrow('Markdown tables cannot represent rowSpan or colSpan.');
    }
  );
});
