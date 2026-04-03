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
