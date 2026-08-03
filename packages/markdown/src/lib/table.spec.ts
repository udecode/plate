import { createTestEditor } from './__tests__/createTestEditor';

const createTableEditor = () => createTestEditor();

describe('markdown tables', () => {
  it('round-trips a simple GFM table through markdown package surfaces', () => {
    const editor = createTableEditor();
    const input =
      '| Name | Value |\n| ---- | ----- |\n| Alpha | Beta |\n| Gamma | Delta |\n';
    const expected =
      '| Name  | Value |\n| ----- | ----- |\n| Alpha | Beta  |\n| Gamma | Delta |\n';

    const value = editor.api.markdown.deserialize(input);

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

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });

  it('keeps unescaped less-than text inside table cells when MDX fallback is used', () => {
    const editor = createTableEditor();
    const input =
      '| Dimension | Basis |\n| --- | --- |\n| Volume trend | a<b |\n';

    const value = editor.api.markdown.deserialize(input);

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

  it('keeps blocks after a table cell that falls back from incomplete MDX', () => {
    const editor = createTableEditor();
    const input = [
      '| Dimension | Basis |',
      '| --- | --- |',
      '| Volume trend | a<b |',
      '',
      'After',
    ].join('\n');

    const value = editor.api.markdown.deserialize(input);

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

    const value = editor.api.markdown.deserialize(input);

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

  it('keeps a parsed table when incomplete MDX starts after the table', () => {
    const editor = createTableEditor();
    const input = ['| Content |', '| --- |', '| <u>ok</u> |', '', '<x>'].join(
      '\n'
    );

    const value = editor.api.markdown.deserialize(input);

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
      {
        children: [{ text: '<x>' }],
        type: 'paragraph',
      },
    ]);
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

    const markdown = editor.api.markdown.serialize({
      value: { children: input },
    });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown).children).toMatchObject([
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
                    children: [
                      { text: 'Alpha' },
                      { text: '\n' },
                      { text: 'Beta' },
                    ],
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
});
