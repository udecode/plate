import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from '@platejs/table';

import remarkGfm from 'remark-gfm';

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

const createCellTable = (cellChildren: any[]) =>
  [
    {
      type: 'table',
      children: [
        {
          type: 'tr',
          children: [
            {
              type: 'th',
              children: [{ type: 'p', children: [{ text: 'A' }] }],
            },
            {
              type: 'th',
              children: [{ type: 'p', children: [{ text: 'B' }] }],
            },
          ],
        },
        {
          type: 'tr',
          children: [
            { type: 'td', children: cellChildren },
            {
              type: 'td',
              children: [{ type: 'p', children: [{ text: 'z' }] }],
            },
          ],
        },
      ],
    },
  ] as any;

const getFirstCellChildren = (value: any) =>
  value[0].children[1].children[0].children;

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

  it('round-trips html lists inside table cells as indent lists', () => {
    const editor = createTableEditor();
    const input =
      '| Name | Notes                                                  |\n' +
      '| ---- | ------------------------------------------------------ |\n' +
      '| A    | <ul><li>one</li><li>**two**<br/>more</li></ul>         |\n' +
      '| B    | intro<ol><li>[link](https://platejs.org)</li></ol>end |\n';

    const value = deserializeMd(editor, input);

    expect((value as any)[0].children[1].children[1].children).toEqual([
      {
        children: [{ text: 'one' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
      {
        children: [
          { bold: true, text: 'two' },
          { text: '\n' },
          { text: 'more' },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);
    expect((value as any)[0].children[2].children[1].children).toEqual([
      { children: [{ text: 'intro' }], type: 'p' },
      {
        children: [
          {
            children: [{ text: 'link' }],
            type: 'a',
            url: 'https://platejs.org',
          },
        ],
        indent: 1,
        listStart: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      { children: [{ text: 'end' }], type: 'p' },
    ]);
    expect(serializeMd(editor, { value: value as any })).toBe(
      '| Name | Notes                                                 |\n' +
        '| ---- | ----------------------------------------------------- |\n' +
        '| A    | <ul><li>one</li><li>**two**<br/>more</li></ul>        |\n' +
        '| B    | intro<ol><li>[link](https://platejs.org)</li></ol>end |\n'
    );
  });

  it('round-trips nested html lists inside table cells', () => {
    const editor = createTableEditor();
    const input =
      '| Notes                                            |\n' +
      '| ------------------------------------------------ |\n' +
      '| <ul><li>a<ol><li>b</li></ol></li><li>c</li></ul> |\n';

    const value = deserializeMd(editor, input);

    expect((value as any)[0].children[1].children[0].children).toMatchObject([
      { children: [{ text: 'a' }], indent: 1, listStyleType: 'disc' },
      { children: [{ text: 'b' }], indent: 2, listStyleType: 'decimal' },
      { children: [{ text: 'c' }], indent: 1, listStyleType: 'disc' },
    ]);
    expect(serializeMd(editor, { value: value as any })).toBe(input);
  });

  it('serializes list paragraphs in table cells without breaking the row', () => {
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
                children: [{ type: 'p', children: [{ text: 'A' }] }],
              },
            ],
          },
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [
                  { type: 'p', children: [{ text: 'intro' }] },
                  {
                    type: 'p',
                    indent: 1,
                    listStyleType: 'disc',
                    children: [{ text: 'one' }],
                  },
                  {
                    type: 'p',
                    indent: 1,
                    listStyleType: 'disc',
                    children: [{ text: 'two' }],
                  },
                  {
                    type: 'p',
                    children: [{ text: 'line' }, { text: '\nbreak' }],
                  },
                  { type: 'p', children: [{ text: 'outro' }] },
                ],
              },
            ],
          },
        ],
      },
    ] as any;
    const expected =
      '| A                                                              |\n' +
      '| -------------------------------------------------------------- |\n' +
      '| intro<ul><li>one</li><li>two</li></ul>line<br/>break<br/>outro |\n';

    const markdown = serializeMd(editor, { value: input });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject([
      {
        children: [
          {},
          {
            children: [
              {
                children: [
                  { children: [{ text: 'intro' }], type: 'p' },
                  { children: [{ text: 'one' }], listStyleType: 'disc' },
                  { children: [{ text: 'two' }], listStyleType: 'disc' },
                  {
                    children: [
                      { text: 'line' },
                      { text: '\n' },
                      { text: 'break' },
                      { text: '\n' },
                      { text: 'outro' },
                    ],
                    type: 'p',
                  },
                ],
              },
            ],
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('keeps a trailing line break in a table-cell list item on the row', () => {
    const editor = createTableEditor();
    const value = createCellTable([
      {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [{ text: 'a\n' }],
      },
    ]);

    const markdown = serializeMd(editor, { value });

    expect(markdown.split('\n')[2]).toBe('| <ul><li>a<br /></li></ul> | z |');
    expect(getFirstCellChildren(deserializeMd(editor, markdown))).toEqual([
      {
        children: [{ text: 'a' }, { text: '\n' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      },
    ]);
  });

  it('applies allowNode.serialize to table-cell list paragraphs', () => {
    const editor = createTableEditor();
    const value = createCellTable([
      {
        id: 'hidden',
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [{ text: 'secret' }],
      },
      {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [{ text: 'shown' }],
      },
    ]);

    const markdown = serializeMd(editor, {
      allowNode: { serialize: (node: any) => node.id !== 'hidden' },
      value,
    });

    expect(markdown).toContain('| <ul><li>shown</li></ul> | z |');
    expect(markdown).not.toContain('secret');
  });

  it('applies allowNode.deserialize to table-cell list wrappers', () => {
    const editor = createTableEditor();
    const input = '| A | B |\n| - | - |\n| <ul><li>a</li></ul>x | z |\n';

    expect(
      getFirstCellChildren(
        deserializeMd(editor, input, {
          allowNode: { deserialize: (node: any) => node.name !== 'ul' },
        })
      )
    ).toEqual([{ children: [{ text: 'x' }], type: 'p' }]);
    expect(
      getFirstCellChildren(
        deserializeMd(editor, input, {
          allowNode: { deserialize: (node: any) => node.name !== 'li' },
        })
      )
    ).toEqual([{ children: [{ text: 'x' }], type: 'p' }]);
  });

  it('applies the markdown list node filter to table-cell lists', () => {
    const editor = createTableEditor();

    expect(
      getFirstCellChildren(
        deserializeMd(
          editor,
          '| A | B |\n| - | - |\n| <ul><li>a</li></ul> | z |\n',
          {
            disallowedNodes: ['list'],
          }
        )
      )
    ).toEqual([{ children: [{ text: '<ul><li>a</li></ul>' }], type: 'p' }]);
  });

  it('keeps html link destinations in table-cell list items', () => {
    const editor = createTableEditor();
    const input =
      '| A | B |\n| - | - |\n| <ul><li><a href="https://platejs.org">docs</a></li></ul> | z |\n';

    expect(getFirstCellChildren(deserializeMd(editor, input))).toMatchObject([
      {
        children: [
          {
            children: [{ text: 'docs' }],
            type: 'a',
            url: 'https://platejs.org',
          },
        ],
        listStyleType: 'disc',
      },
    ]);
  });

  it('keeps the text fallback for table-cell list items with block children', () => {
    const editor = createTableEditor();
    const input =
      '| A | B |\n| - | - |\n| <ul><li><p>one</p><p>two</p></li></ul> | z |\n';

    expect(getFirstCellChildren(deserializeMd(editor, input))).toEqual([
      {
        children: [{ text: '<ul><li><p>one</p><p>two</p></li></ul>' }],
        type: 'p',
      },
    ]);
  });

  it('round-trips todo list items inside table cells', () => {
    const editor = createTableEditor();
    const value = createCellTable([
      {
        checked: true,
        type: 'p',
        indent: 1,
        listStyleType: 'todo',
        children: [{ text: 'done' }],
      },
      {
        checked: false,
        type: 'p',
        indent: 1,
        listStyleType: 'todo',
        children: [{ text: 'open' }],
      },
    ]);

    const markdown = serializeMd(editor, { value });

    expect(markdown.split('\n')[2]).toBe(
      '| <ul><li><input type="checkbox" checked disabled /> done</li><li><input type="checkbox" disabled /> open</li></ul> | z |'
    );
    expect(getFirstCellChildren(deserializeMd(editor, markdown))).toEqual(
      getFirstCellChildren(value)
    );
  });

  it('round-trips the start number of ordered lists inside table cells', () => {
    const editor = createTableEditor();
    const value = createCellTable([
      {
        listRestartPolite: 5,
        listStart: 5,
        type: 'p',
        indent: 1,
        listStyleType: 'decimal',
        children: [{ text: 'five' }],
      },
      {
        listStart: 6,
        type: 'p',
        indent: 1,
        listStyleType: 'decimal',
        children: [{ text: 'six' }],
      },
    ]);

    const markdown = serializeMd(editor, { value });

    expect(markdown.split('\n')[2]).toBe(
      '| <ol start="5"><li>five</li><li>six</li></ol> | z |'
    );

    const deserialized = deserializeMd(editor, markdown);

    expect(getFirstCellChildren(deserialized)).toEqual(
      getFirstCellChildren(value)
    );

    editor.tf.setValue(deserialized);

    expect(getFirstCellChildren(editor.children)).toMatchObject([
      { listStart: 5 },
      { listStart: 6 },
    ]);
  });

  it('serializes table-cell lists without remark-mdx', () => {
    const editor = createTableEditor();
    const value = createCellTable([
      {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [{ text: 'one' }],
      },
    ]);

    expect(
      serializeMd(editor, { remarkPlugins: [remarkGfm], value }).split('\n')[2]
    ).toBe('| <ul><li>one</li></ul> | z |');
  });

  it('keeps list paragraph props for allowNode.serialize', () => {
    const editor = createTableEditor();
    const value = createCellTable([
      {
        id: 'keep',
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [{ text: 'kept' }],
      },
    ]);

    const markdown = serializeMd(editor, {
      allowNode: {
        serialize: (node: any) =>
          node.type !== 'p' ||
          (node.id === 'keep' && node.listStyleType === 'disc'),
      },
      value,
    });

    expect(markdown.split('\n')[2]).toBe('| <ul><li>kept</li></ul> |   |');
  });

  it('keeps literal checkbox text in a table-cell bullet item', () => {
    const editor = createTableEditor();
    const value = createCellTable([
      {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [{ text: '[x] literal' }],
      },
    ]);

    const markdown = serializeMd(editor, { value });

    expect(getFirstCellChildren(deserializeMd(editor, markdown))).toEqual(
      getFirstCellChildren(value)
    );
  });

  it('keeps adjacent ordered table-cell lists apart', () => {
    const editor = createTableEditor();
    const row =
      '| <ol><li>a</li></ol><ol start="5"><li>b</li></ol><ol><li>c</li></ol> | z |';
    const input = `| A | B |\n| - | - |\n${row}\n`;

    const value = deserializeMd(editor, input);

    expect(getFirstCellChildren(value)).toMatchObject([
      { listStart: 1 },
      { listRestart: 5, listStart: 5 },
      { listRestart: 1, listStart: 1 },
    ]);

    editor.tf.setValue(value);

    expect(serializeMd(editor, { value: editor.children }).split('\n')[2]).toBe(
      row
    );
  });

  it('round-trips an empty table-cell list item as empty text', () => {
    const editor = createTableEditor();
    const value = createCellTable([
      {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [{ text: '' }],
      },
    ]);

    const markdown = serializeMd(editor, { value });

    expect(getFirstCellChildren(deserializeMd(editor, markdown))).toEqual(
      getFirstCellChildren(value)
    );
  });

  it('restarts every html ordered list in a table cell', () => {
    const editor = createTableEditor();
    const row =
      '| <ol><li>a</li></ol><ul><li>b</li></ul><ol start="5"><li>c</li></ol><ol start="6"><li>d</li></ol> | z |';
    const input = `| A | B |\n| - | - |\n${row}\n`;

    const value = deserializeMd(editor, input);

    expect(getFirstCellChildren(value)).toMatchObject([
      { listStart: 1 },
      { listStyleType: 'disc' },
      { listRestart: 5 },
      { listRestart: 6 },
    ]);

    editor.tf.setValue(value);

    expect(serializeMd(editor, { value: editor.children }).split('\n')[2]).toBe(
      row
    );
  });

  it('keeps the text fallback for html list numbering it cannot store', () => {
    const editor = createTableEditor();

    for (const list of [
      '<ol reversed><li>a</li><li>b</li></ol>',
      '<ol><li value="5">a</li></ol>',
      '<ol start="0"><li>a</li></ol>',
      '<ol start="-1"><li>a</li></ol>',
      '<ol start="9007199254740993"><li>a</li></ol>',
      '<ul><li><input type="checkbox" checked={false} /> a</li></ul>',
    ]) {
      expect(
        getFirstCellChildren(
          deserializeMd(editor, `| A | B |\n| - | - |\n| ${list} | z |\n`)
        )
      ).toMatchObject([{ type: 'p' }]);
      expect(
        getFirstCellChildren(
          deserializeMd(editor, `| A | B |\n| - | - |\n| ${list} | z |\n`)
        )[0].listStyleType
      ).toBeUndefined();
    }
  });

  it('reads html integer starts with leading zeros', () => {
    const editor = createTableEditor();

    expect(
      getFirstCellChildren(
        deserializeMd(
          editor,
          '| A | B |\n| - | - |\n| <ol start="05"><li>a</li></ol> | z |\n'
        )
      )
    ).toMatchObject([{ listRestartPolite: 5, listStart: 5 }]);
  });
});
