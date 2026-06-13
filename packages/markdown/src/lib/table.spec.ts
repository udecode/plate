import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

const createTableEditor = () =>
  createTestEditor([
    BaseTablePlugin,
    BaseTableRowPlugin,
    BaseTableCellPlugin,
    BaseTableCellHeaderPlugin,
  ]);

describe('markdown tables', () => {
  it('round-trips a simple GFM table through markdown package surfaces', () => {
    const editor = createTableEditor();
    const input =
      '| Name | Value |\n| ---- | ----- |\n| Alpha | Beta |\n| Gamma | Delta |\n';
    const expected =
      '| Name  | Value |\n| ----- | ----- |\n| Alpha | Beta  |\n| Gamma | Delta |\n';

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        type: 'table',
        children: [
          {
            type: 'tr',
            children: [
              {
                type: 'th',
                children: [{ type: 'p', children: [{ text: 'Name' }] }],
              },
              {
                type: 'th',
                children: [{ type: 'p', children: [{ text: 'Value' }] }],
              },
            ],
          },
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [{ type: 'p', children: [{ text: 'Alpha' }] }],
              },
              {
                type: 'td',
                children: [{ type: 'p', children: [{ text: 'Beta' }] }],
              },
            ],
          },
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [{ type: 'p', children: [{ text: 'Gamma' }] }],
              },
              {
                type: 'td',
                children: [{ type: 'p', children: [{ text: 'Delta' }] }],
              },
            ],
          },
        ],
      },
    ]);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });

  it('keeps unescaped less-than text inside table cells when MDX fallback is used', () => {
    const editor = createTableEditor();
    const input =
      '| Dimension | Basis |\n| --- | --- |\n| Volume trend | a<b |\n';

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Dimension' }] }],
                type: 'th',
              },
              {
                children: [{ type: 'p', children: [{ text: 'Basis' }] }],
                type: 'th',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Volume trend' }] }],
                type: 'td',
              },
              {
                children: [{ type: 'p', children: [{ text: 'a<b' }] }],
                type: 'td',
              },
            ],
            type: 'tr',
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

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Dimension' }] }],
                type: 'th',
              },
              {
                children: [{ type: 'p', children: [{ text: 'Basis' }] }],
                type: 'th',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Volume trend' }] }],
                type: 'td',
              },
              {
                children: [{ type: 'p', children: [{ text: 'a<b' }] }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
      {
        children: [{ text: 'After' }],
        type: 'p',
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

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Dimension' }] }],
                type: 'th',
              },
              {
                children: [{ type: 'p', children: [{ text: 'Basis' }] }],
                type: 'th',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Volume trend' }] }],
                type: 'td',
              },
              {
                children: [{ type: 'p', children: [{ text: 'a<b' }] }],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
      {
        children: [
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Name' }] }],
                type: 'th',
              },
              {
                children: [{ type: 'p', children: [{ text: 'Value' }] }],
                type: 'th',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Later' }] }],
                type: 'td',
              },
              {
                children: [{ type: 'p', children: [{ text: 'Table' }] }],
                type: 'td',
              },
            ],
            type: 'tr',
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

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ type: 'p', children: [{ text: 'Content' }] }],
                type: 'th',
              },
            ],
            type: 'tr',
          },
          {
            children: [
              {
                children: [
                  {
                    type: 'p',
                    children: [{ text: 'ok', underline: true }],
                  },
                ],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
      {
        children: [{ text: '<x>' }],
        type: 'p',
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
            type: 'tr',
            children: [
              {
                type: 'th',
                children: [{ type: 'p', children: [{ text: 'Name' }] }],
              },
              {
                type: 'th',
                children: [{ type: 'p', children: [{ text: 'Value' }] }],
              },
            ],
          },
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [
                  { type: 'p', children: [{ text: 'Alpha' }] },
                  { type: 'p', children: [{ text: 'Beta' }] },
                ],
              },
              {
                type: 'td',
                children: [{ type: 'p', children: [{ text: 'Gamma' }] }],
              },
            ],
          },
        ],
      },
    ] as any;
    const expected =
      '| Name           | Value |\n| -------------- | ----- |\n| Alpha<br/>Beta | Gamma |\n';

    const markdown = serializeMd(editor, { value: input });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject([
      {
        type: 'table',
        children: [
          {
            type: 'tr',
            children: [
              {
                type: 'th',
                children: [{ type: 'p', children: [{ text: 'Name' }] }],
              },
              {
                type: 'th',
                children: [{ type: 'p', children: [{ text: 'Value' }] }],
              },
            ],
          },
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [
                  {
                    type: 'p',
                    children: [
                      { text: 'Alpha' },
                      { text: '\n' },
                      { text: 'Beta' },
                    ],
                  },
                ],
              },
              {
                type: 'td',
                children: [{ type: 'p', children: [{ text: 'Gamma' }] }],
              },
            ],
          },
        ],
      },
    ]);
  });
});
