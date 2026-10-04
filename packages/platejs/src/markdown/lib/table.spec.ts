import katex from 'katex';
import remarkGfm from 'remark-gfm';

import {
  BaseParagraphPlugin,
  createEditor,
  type Descendant,
  NodeApi,
} from '../../core';
import { BaseTablePlugin } from '../../features/table';
import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';
import { MarkdownPlugin } from './MarkdownPlugin';

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

  it('keeps line breaks inside a table cell on one row', () => {
    const editor = createTableEditor();
    const cell = (text: string) => ({
      type: 'tableCell',
      children: [{ type: 'paragraph', children: [{ text }] }],
    });
    const row = (texts: string[], header?: true) => ({
      type: 'tableRow',
      children: texts.map((text) => ({
        ...cell(text),
        ...(header && { header }),
      })),
    });
    const input = [
      {
        type: 'table',
        children: [row(['A', 'B'], true), row(['a\nb', 'c\n'])],
      },
    ];

    const markdown = serializeTestMarkdown(editor, {
      document: { children: input },
    }).data;

    expect(markdown).toBe(
      '| A       | B       |\n| ------- | ------- |\n| a<br/>b | c<br /> |\n'
    );
    expect(parseTestMarkdown(editor, markdown).children).toMatchObject(input);
  });

  describe('cells holding blocks', () => {
    type Node = Record<string, unknown> & { children: Node[] | Text[] };
    type Text = Record<string, unknown> & { text: string };

    const paragraph = (text: string, props: object = {}): Node => ({
      ...props,
      children: [{ text }],
      type: 'paragraph',
    });
    const inline = (props: object, text = ''): Node => ({
      children: [
        { text: '' },
        { children: [{ text }], ...props } as Node,
        { text: '' },
      ],
      type: 'paragraph',
    });
    const cell = (children: Node[], props: object = {}): Node => ({
      ...props,
      children,
      type: 'tableCell',
    });
    const table = (rows: Node[][]) => ({
      children: [
        {
          children: rows.map((children) => ({ children, type: 'tableRow' })),
          type: 'table',
        },
      ],
    });
    const headed = (content: Node[]) =>
      table([
        [
          cell([paragraph('A')], { header: true }),
          cell([paragraph('B')], { header: true }),
        ],
        [cell(content), cell([paragraph('sentinel')])],
      ]);
    const serialize = (
      document: ReturnType<typeof table>,
      lossPolicy?: 'allow' | 'reject'
    ) => createTableEditor().api.markdown.serialize({ document, lossPolicy });
    const write = (document: ReturnType<typeof table>) => {
      const result = serialize(document);

      if (!result.ok) throw new Error(result.diagnostics[0].message);

      return result;
    };
    const bodyCellChildren = (markdown: string, editor = createTableEditor()) =>
      parseTestMarkdown(editor, markdown).children.flatMap((node) =>
        node.type === 'table'
          ? node.children
              .slice(1)
              .map((row) =>
                (row as { children: Descendant[] }).children.map(
                  (tableCell) =>
                    (tableCell as { children: Descendant[] }).children
                )
              )
          : []
      );
    const oneCell = (content: string) => `| A |\n| - |\n| ${content} |\n`;
    const bodyCells = (markdown: string) =>
      bodyCellChildren(markdown).map((row) =>
        row.map((children) =>
          children.map((block) => NodeApi.string(block)).join('')
        )
      );

    it('writes list paragraphs in a cell as one line of HTML lists', () => {
      const { data } = write(
        headed([
          paragraph('Intro'),
          paragraph('ship', { checked: true, indent: 1, listType: 'task' }),
          paragraph('step', { indent: 1, listType: 'numbered' }),
          paragraph('sub', { indent: 2, listType: 'bulleted' }),
        ])
      );

      expect(data.split('\n')[2]).toBe(
        '| Intro<ul><li><input type="checkbox" checked disabled /> ship</li></ul><ol><li>step<ul><li>sub</li></ul></li></ol> | sentinel |'
      );
    });

    it.each([
      {
        rows: [
          [
            cell([paragraph('A')]),
            cell([paragraph('B')]),
            cell([paragraph('C')]),
          ],
          [
            cell([paragraph('merged')], { colSpan: 2 }),
            cell([paragraph('sentinel')]),
          ],
        ],
        lastRow: ['merged', '', 'sentinel'],
        span: 'colSpan',
      },
      {
        rows: [
          [cell([paragraph('A')]), cell([paragraph('B')])],
          [cell([paragraph('merged')], { rowSpan: 2 }), cell([paragraph('x')])],
          [cell([paragraph('sentinel')])],
        ],
        lastRow: ['', 'sentinel'],
        span: 'rowSpan',
      },
    ])(
      'writes a cell merged by $span in its first slot',
      ({ lastRow, rows, span }) => {
        const result = write(table(rows));

        expect({
          lastRow: bodyCells(result.data).at(-1),
          omitted: result.diagnostics.flatMap((diagnostic) =>
            diagnostic.code === 'markdown-property-omitted'
              ? [diagnostic.key]
              : []
          ),
        }).toEqual({ lastRow, omitted: [span] });
      }
    );

    it('refuses merged cells that would need too many empty cells', () => {
      const result = serialize(
        table([
          [cell([paragraph('wide')], { colSpan: 50_000 })],
          [cell([paragraph('a')])],
          [cell([paragraph('b')])],
        ])
      );

      expect(
        result.diagnostics.map(({ code, severity, ...rest }) => [
          code,
          severity,
          'nodeType' in rest ? rest.nodeType : undefined,
        ])
      ).toEqual([['markdown-unsupported-node', 'error', 'table']]);
    });

    it('writes a tall table whose cells span rows', () => {
      const rows = Array.from({ length: 250 }, () => [
        [cell([paragraph('merged')], { rowSpan: 2 }), cell([paragraph('a')])],
        [cell([paragraph('b')])],
      ]).flat();

      expect(bodyCells(write(table(rows)).data)).toHaveLength(499);
    });

    it('writes a heading in a cell as inline content with its link', () => {
      const { data } = write(
        headed([
          paragraph('a'),
          {
            ...inline({ type: 'link', url: 'https://x.dev' }, 'h'),
            level: 2,
            type: 'heading',
          },
        ])
      );

      expect(data.split('\n')[2]).toBe(
        '| a<br/>[h](https://x.dev) | sentinel |'
      );
    });

    it.each([
      { lossPolicy: 'allow' as const, outcome: '| kept | sentinel |' },
      { lossPolicy: 'reject' as const, outcome: 'error' },
    ])(
      'drops a block a cell cannot hold under $lossPolicy',
      ({ lossPolicy, outcome }) => {
        const result = serialize(
          headed([
            paragraph('kept'),
            { children: [{ text: '' }], type: 'horizontalRule' },
          ]),
          lossPolicy
        );

        expect(
          result.ok
            ? result.data.split('\n')[2]
            : result.diagnostics.find(
                (diagnostic) =>
                  'nodeType' in diagnostic &&
                  diagnostic.nodeType === 'thematicBreak'
              )?.severity
        ).toBe(outcome);
      }
    );

    it('writes "|" in inline math as the same TeX symbol', () => {
      const { data } = write(
        headed([
          inline({ latex: String.raw`\|x\| + |y|`, type: 'inlineEquation' }),
        ])
      );

      expect(data.split('\n')[2]).toBe(
        String.raw`| $\Vert x\Vert  + \vert y\vert $ | sentinel |`
      );
    });

    it("reads main's cell lists back into list paragraphs", () => {
      expect(
        bodyCellChildren(
          oneCell(
            'Intro<ul><li><input type="checkbox" checked disabled /> ship</li><li><input type="checkbox" disabled /> test</li><li>note</li></ul><ol start="3"><li>step<ul><li>sub<br/><br /></li></ul></li></ol>'
          )
        )[0][0]
      ).toMatchObject([
        { children: [{ text: 'Intro' }], type: 'paragraph' },
        {
          checked: true,
          children: [{ text: 'ship' }],
          indent: 1,
          listType: 'task',
        },
        {
          checked: false,
          children: [{ text: 'test' }],
          indent: 1,
          listType: 'task',
        },
        { children: [{ text: 'note' }], indent: 1, listType: 'bulleted' },
        {
          children: [{ text: 'step' }],
          indent: 1,
          listStart: 3,
          listType: 'numbered',
        },
        { children: [{ text: 'sub\n\n' }], indent: 2, listType: 'bulleted' },
      ]);
    });

    it('reads an ordered list right after another as a restart', () => {
      expect(
        bodyCellChildren(
          oneCell('<ol><li>a</li></ol><ol start="5"><li>b</li></ol>')
        )[0][0][1]
      ).toMatchObject({ children: [{ text: 'b' }], listRestart: 5 });
    });

    it('round-trips a cell list starting at 0', () => {
      const content = [
        paragraph('a', { indent: 1, listStart: 0, listType: 'numbered' }),
      ];

      expect(bodyCellChildren(write(headed(content)).data)[0][0]).toMatchObject(
        content
      );
    });

    it("keeps a paragraph's trailing break before a list", () => {
      expect(
        NodeApi.string(
          bodyCellChildren(oneCell('a<br /><ul><li>b</li></ul>'))[0][0][0]
        )
      ).toBe('a\n');
    });

    it('keeps cell lists literal in an editor without List', () => {
      // Guard: lifting runs without a list decoder would turn them into
      // lists, or fail the deep one on the depth limit below.
      const editor = createEditor({
        plugins: [
          BaseParagraphPlugin,
          BaseTablePlugin,
          MarkdownPlugin.configure({
            initialState: { remarkPlugins: [remarkGfm] },
          }),
        ],
      });
      const deep = `${'<ul><li>a'.repeat(30)}${'</li></ul>'.repeat(30)}`;

      const result = editor.api.markdown.parse(
        oneCell(`<ul><li>a</li></ul> and ${deep}`),
        { limits: { maxDepth: 20 } }
      );

      expect(
        result.ok &&
          NodeApi.string(
            (result.document.children[0] as { children: Descendant[] })
              .children[1]
          )
      ).toBe(`<ul><li>a</li></ul> and ${deep}`);
    });

    it('fails a cell list nested past the depth limit', () => {
      const result = createTableEditor().api.markdown.parse(
        oneCell('<ul><li>a<ul><li>b<ul><li>c</li></ul></li></ul></li></ul>'),
        { limits: { maxDepth: 5 } }
      );

      expect(result.diagnostics.map(({ code }) => code)).toContain(
        'markdown-limit-exceeded'
      );
    });

    it('keeps a cell holding only a non-breaking space', () => {
      // Guard: a blank check that trims Unicode spaces would read it as empty.
      expect(bodyCells(oneCell('&nbsp;'))).toEqual([['\u00A0']]);
    });

    it('reads an empty cell back as an empty paragraph', () => {
      const { data } = write(headed([paragraph('')]));

      expect(NodeApi.string(bodyCellChildren(data)[0][0][0])).toBe('');
    });

    it('round-trips an image between paragraphs unchanged', () => {
      const content = [
        paragraph('a'),
        { children: [{ text: '' }], type: 'image', url: 'https://x.dev/i.png' },
        paragraph('b'),
      ];
      const once = write(headed(content)).data;
      const twice = write(
        headed(bodyCellChildren(once)[0][0] as unknown as Node[])
      ).data;

      expect(twice).toBe(once);
    });

    it('round-trips list paragraphs in a cell', () => {
      const content = [
        paragraph('Intro'),
        paragraph('ship', { checked: true, indent: 1, listType: 'task' }),
        paragraph('step', { indent: 1, listType: 'numbered' }),
        paragraph('sub\n', { indent: 2, listType: 'bulleted' }),
      ];

      expect(bodyCellChildren(write(headed(content)).data)[0][0]).toMatchObject(
        content
      );
    });

    it('keeps a verb command in inline math by changing its delimiter', () => {
      const { data } = write(
        headed([
          inline({ latex: String.raw`\verb|x|`, type: 'inlineEquation' }),
        ])
      );

      expect(data.split('\n')[2]).toBe(String.raw`| $\verb!x!$ | sentinel |`);
    });

    it.each([
      { bold: false, read: 'a\nb', text: 'a\r\nb' },
      { bold: false, read: 'c\n', text: 'c\r\n' },
      { bold: true, read: 'a\nb', text: 'a\r\nb' },
      { bold: true, read: 'a\n\nb', text: 'a\r\n\r\nb' },
    ])(
      'reads a CRLF line ending in a cell as one break: $text, bold $bold',
      ({ bold, read, text }) => {
        const content: Node = {
          children: [{ ...(bold && { bold }), text }],
          type: 'paragraph',
        };

        expect(
          NodeApi.string(
            bodyCellChildren(write(headed([content])).data)[0][0][0]
          )
        ).toBe(read);
      }
    );

    it.each([
      String.raw`P(\text{A|B})`,
      String.raw`\text{a| b}`,
      String.raw`\text{$|x|$}`,
      String.raw`\frac{|x|}{2}`,
    ])('keeps inline math with "|" rendering the same: %s', (latex) => {
      const [[cellBlocks, sentinel]] = bodyCellChildren(
        write(headed([inline({ latex, type: 'inlineEquation' })])).data
      );
      const equation = (cellBlocks[0] as { children: Node[] }).children.find(
        (node) => node.type === 'inlineEquation'
      ) as { latex: string } | undefined;
      const rendered = (tex: string) =>
        katex
          .renderToString(tex, { output: 'html' })
          .replaceAll(/<[^>]+>/g, '');

      expect(rendered(equation?.latex ?? '')).toBe(rendered(latex));
      expect(NodeApi.string(sentinel[0])).toBe('sentinel');
    });

    it.each([
      String.raw`\verb*a|a`,
      String.raw`\verb|ab\c`,
      String.raw`\text{a\|b}`,
      String.raw`\text a{b|c}`,
      '\\text{\\char`|}',
      String.raw`\fbox{a|b}`,
      String.raw`\colorbox{red}{a|b}`,
      String.raw`\begin{array}{c|c}a&b\end{array}`,
    ])(
      'writes inline math as text when the writer cannot place its "|": %s',
      (latex) => {
        expect(
          bodyCells(
            write(headed([inline({ latex, type: 'inlineEquation' })])).data
          )
        ).toEqual([[latex, 'sentinel']]);
      }
    );

    it('reports no folded boundary beside an image', () => {
      const result = write(
        headed([
          paragraph('a'),
          {
            children: [{ text: '' }],
            type: 'image',
            url: 'https://x.dev/i.png',
          },
        ])
      );

      expect(
        result.diagnostics.filter(
          (diagnostic) =>
            'nodeType' in diagnostic && diagnostic.nodeType === 'paragraph'
        )
      ).toEqual([]);
    });

    it.each([
      {
        carrier: 'inline code holding a backslash before "|"',
        content: [
          {
            children: [{ code: true, text: String.raw`a\|b` }],
            type: 'paragraph',
          },
        ],
      },
      {
        carrier: 'a list item with code holding a newline',
        content: [
          {
            children: [{ code: true, text: 'a\nb' }],
            indent: 1,
            listType: 'bulleted',
            type: 'paragraph',
          },
        ],
      },
      {
        carrier: 'inline math holding a newline',
        content: [inline({ latex: 'x\n+1', type: 'inlineEquation' })],
      },
      ...['https://x.dev/a|b', 'mailto:a|b@x.dev'].map((url) => ({
        carrier: `an autolink to ${url}`,
        content: [
          {
            children: [
              { text: '' },
              {
                children: [{ text: url.replace('mailto:', '') }],
                type: 'link',
                url,
              },
              { text: '' },
            ],
            type: 'paragraph',
          },
        ],
      })),
      {
        carrier: 'a tag attribute holding "|"',
        content: [
          {
            children: [{ fontFamily: 'Foo|Bar', text: 'x' }],
            type: 'paragraph',
          },
        ],
      },
    ])('keeps the row on one line around $carrier', ({ content }) => {
      expect(bodyCells(write(headed(content as Node[])).data)).toEqual([
        [expect.any(String), 'sentinel'],
      ]);
    });
  });

  it('gives a short row the empty cells a committed table would get', () => {
    const editor = createTableEditor();
    const result = editor.api.markdown.parseSlice(
      '| a | b |\n| - | - |\n| c |',
      { lossPolicy: 'allow', partial: true }
    );

    if (!result.ok) throw new Error(result.diagnostics[0].message);
    const parsed = result.slice.content;

    editor.update({ history: 'skip' }).value.replace({ children: [...parsed] });

    // A preview renders the parse without the table correction, so it must
    // already be what the editor commits.
    expect(editor.read.children()).toEqual(parsed);
    expect(parsed).toMatchObject([
      { children: [{}, { children: [{}, {}] }], type: 'table' },
    ]);
  });
});
