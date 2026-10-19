import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from '../__tests__/createTestEditor';
import { nameDocumentListIds } from '../__tests__/nameListIds';

const editor = createTestEditor();

describe('editor.api.markdown.serialize list', () => {
  it('keeps the trailing hard break in a list item', () => {
    const document = parseTestMarkdown(editor, '- a<br/>\n\nEND\n');
    const result = serializeTestMarkdown(editor, { document });

    expect(nameDocumentListIds(parseTestMarkdown(editor, result.data))).toEqual(
      nameDocumentListIds(document)
    );
  });

  it('numbers an indent 0 item as the level above an indent 1 item', () => {
    const input = [0, 1, 0].map((indent, index) => ({
      children: [{ text: 'ABC'[index] }],
      indent,
      listId: 'z',
      listType: 'numbered',
      type: 'paragraph',
    }));

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe('1. A\n   1. B\n2. C\n');
  });

  it.each([
    ['an item with a second paragraph', '* A\n\n  Second\n'],
    ["a parent's paragraph after its sublist", '* A\n\n  * B\n\n  Parent\n'],
    ["a child's second paragraph", '* A\n  * B\n\n    Child\n'],
    ['two continuation paragraphs', '* A\n\n  One\n\n  Two\n'],
    [
      'a continuation, then a sublist, then a sibling',
      '* A\n\n  Para\n\n  * B\n\n* C\n',
    ],
  ])('keeps %s inside its list item', (_, markdown) => {
    const document = parseTestMarkdown(editor, markdown);
    const result = serializeTestMarkdown(editor, { document });

    expect({
      codes: result.diagnostics.map(({ code }) => code),
      document: nameDocumentListIds(parseTestMarkdown(editor, result.data)),
    }).toEqual({ codes: [], document: nameDocumentListIds(document) });
  });

  it('reports the indent of a paragraph whose list item has closed', () => {
    const document = parseTestMarkdown(
      editor,
      '* A\n\n  * B\n\n  Parent\n\n  Extra\n'
    );
    const [item, child, parent, extra] = document.children;
    const result = serializeTestMarkdown(editor, {
      document: {
        ...document,
        children: [item, child, parent, { ...extra, indent: 3 }],
      },
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'markdown-property-omitted',
        key: 'indent',
        model: expect.objectContaining({ path: [3] }),
      })
    );
  });

  it('reports the indent of a paragraph under an item that skipped a level', () => {
    const item = (text: string, indent: number) => ({
      children: [{ text }],
      indent,
      listId: 'L',
      listType: 'bulleted',
      type: 'paragraph',
    });
    const result = serializeTestMarkdown(editor, {
      document: {
        children: [
          item('A', 1),
          item('B', 3),
          item('C', 2),
          { children: [{ text: 'D' }], indent: 3, type: 'paragraph' },
        ],
      },
    });

    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'markdown-property-omitted',
        key: 'indent',
        model: expect.objectContaining({ path: [3] }),
      })
    );
  });

  it('keeps a bare URL inside a list item', () => {
    const input = [
      {
        children: [
          { text: 'see ' },
          {
            children: [{ text: 'https://x.dev' }],
            type: 'link',
            url: 'https://x.dev',
          },
          { text: ' end' },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe('* see https://x.dev end\n');
  });

  it('serialize unordered lists', () => {
    const input = [
      {
        children: [{ text: 'List item 1' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'List item 2' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* List item 1\n* List item 2\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize ordered lists', () => {
    const input = [
      {
        children: [{ text: 'List item 1' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'List item 2' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const expected = '1. List item 1\n2. List item 2\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize mixed nested lists', () => {
    const input = [
      {
        children: [{ text: 'List item 1' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'List item 1.1' }],
        indent: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const expected = '* List item 1\n  1. List item 1.1\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize nested indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* parent\n  * child\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize nested ordered indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const expected = '1. parent\n   1. child\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize deeply nested indented list items without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'grandchild' }],
        indent: 3,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* parent\n  * child\n    * grandchild\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize sibling nested indented lists when style changes at same indent', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'ordered child' }],
        indent: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'bullet child' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* parent\n  1. ordered child\n  * bullet child\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize nested indented list followed by sibling item without empty lines', () => {
    const input = [
      {
        children: [{ text: 'parent' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'child' }],
        indent: 2,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [{ text: 'sibling' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* parent\n  * child\n* sibling\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize lists with formatted text', () => {
    const input = [
      {
        children: [
          { text: 'Normal text and ' },
          { bold: true, text: 'bold text' },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
      {
        children: [
          { italic: true, text: 'Italic text' },
          { text: ' and normal text' },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected =
      '* Normal text and **bold text**\n* _Italic text_ and normal text\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize restarted ordered lists separated by a paragraph', () => {
    const input = [
      {
        children: [{ text: 'First list item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Break between lists.' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'Second list item' }],
        indent: 1,
        listStart: 2,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: 'Third list item' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const expected =
      '1. First list item\n\nBreak between lists.\n\n2. Second list item\n3. Third list item\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });

  it('serialize lists with links', () => {
    const input = [
      {
        children: [
          { text: 'Text with ' },
          {
            children: [{ text: 'a link' }],
            type: 'link',
            url: 'https://example.com',
          },
        ],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ];

    const expected = '* Text with [a link](https://example.com)\n';

    expect(
      serializeTestMarkdown(editor, { document: { children: input } }).data
    ).toBe(expected);
  });
});

describe('editor.api.markdown.serialize list membership', () => {
  const item = (text: string, extra: Record<string, unknown> = {}) => ({
    children: [{ text }],
    indent: 1,
    listType: 'numbered',
    type: 'paragraph',
    ...extra,
  });
  const serialize = (children: Array<Record<string, unknown>>) =>
    serializeTestMarkdown(editor, {
      document: { children: children as never },
    });
  const roundTrip = (source: string) => {
    const document = parseTestMarkdown(editor, source);
    const result = serializeTestMarkdown(editor, { document });

    expect(result.diagnostics).toEqual([]);
    expect(nameDocumentListIds(parseTestMarkdown(editor, result.data))).toEqual(
      nameDocumentListIds(document)
    );

    return document;
  };

  it('round-trips plain and task items of one list as one list', () => {
    const document = roundTrip('- plain\n- [ ] task\n- plain again\n');

    expect(new Set(document.children.map(({ listId }) => listId)).size).toBe(1);
  });

  it("round-trips a first sublist in its parent's list", () => {
    roundTrip('1. a\n   - b\n2. c\n');
  });

  it.each([
    [
      'a forced restart',
      [item('A', { listId: 'a' }), item('B', { listId: 'a', listRestart: 5 })],
      'listRestart',
    ],
    [
      'a list continued past a paragraph',
      [
        item('A', { listId: 'a' }),
        { children: [{ text: 'Note' }], type: 'paragraph' },
        item('B', { listId: 'a' }),
      ],
      'listId',
    ],
    [
      "a first sublist with an id other than its parent's",
      [
        item('A', { listId: 'a' }),
        item('B', { indent: 2, listId: 'b' }),
        item('C', { listId: 'a' }),
      ],
      'listId',
    ],
  ])('reports %s once', (_name, children, key) => {
    expect(
      serialize(children).diagnostics.map((diagnostic) =>
        diagnostic.code === 'markdown-property-omitted' ? diagnostic.key : ''
      )
    ).toEqual([key]);
  });

  it('writes a typed start of 1 without a report', () => {
    expect(
      serialize([
        item('A', { listId: 'a', listStart: 1 }),
        item('B', { listId: 'a' }),
      ]).diagnostics
    ).toEqual([]);
  });

  it('writes a list from 1 and reports it when its last number passes nine digits [EDIT-LIST-START-MD-401]', () => {
    const result = serialize([
      item('A', { listId: 'a', listStart: 999_999_999 }),
      item('B', { listId: 'a' }),
    ]);

    expect(result.data).toBe('1. A\n2. B\n');
    expect(
      result.diagnostics.map((diagnostic) =>
        diagnostic.code === 'markdown-property-omitted' ? diagnostic.key : ''
      )
    ).toEqual(['listStart']);
  });
});
