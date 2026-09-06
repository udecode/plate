import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

describe('gfm package surfaces', () => {
  describe.each([
    undefined,
    false,
    true,
  ])('link context with resourceLink=%s', (resourceLink) => {
    it.each([
      'https://example.com/file.',
      'https://example.com/a_b_',
      'https://[::1]/docs',
    ])('preserves surrounding text for %s', (url) => {
      const editor = createTestEditor();
      const value = [
        {
          children: [
            { text: 'Before ' },
            { children: [{ text: url }], type: 'a', url },
            { text: ' after.' },
          ],
          type: 'p',
        },
      ];
      const markdown = serializeMd(editor, {
        remarkStringifyOptions: { resourceLink },
        value,
      });

      expect(deserializeMd(editor, markdown)).toEqual(value);
    });
  });

  it.each([
    'https://example.com/a<b>',
    'https://example.com/a b',
    'https://example.com/a\\b',
    'https://example.com/file.',
    'https://example.com/file,',
    'https://example.com/file)',
    'https://example.com/file?',
    'https://example.com/file;',
  ])('preserves link text through Markdown serialization: %s', (url) => {
    const editor = createTestEditor();
    const value = [
      {
        children: [{ children: [{ text: url }], type: 'a', url }],
        type: 'p',
      },
    ];

    const markdown = serializeMd(editor, { value });
    const parsed = unified().use(remarkParse).parse(markdown);
    const htmlNodes: unknown[] = [];
    visit(parsed, 'html', (node) => {
      htmlNodes.push(node);
    });

    expect(htmlNodes).toEqual([]);
    expect(deserializeMd(editor, markdown)[0].children[0]).toMatchObject(
      value[0].children[0]
    );
  });

  it.each([
    {
      expected: 'https://platejs.org\n',
      input: 'https://platejs.org',
      output: [
        {
          children: [
            {
              children: [{ text: 'https://platejs.org' }],
              type: 'a',
              url: 'https://platejs.org',
            },
          ],
          type: 'p',
        },
      ],
      title: 'round-trips a bare autolink literal',
    },
    {
      expected: 'Visit https://platejs.org for docs.\n',
      input: 'Visit https://platejs.org for docs.',
      output: [
        {
          children: [
            { text: 'Visit ' },
            {
              children: [{ text: 'https://platejs.org' }],
              type: 'a',
              url: 'https://platejs.org',
            },
            { text: ' for docs.' },
          ],
          type: 'p',
        },
      ],
      title: 'round-trips an autolink literal inside surrounding text',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject(output);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });

  it('respects resourceLink when serializing bare autolink literals', () => {
    const editor = createTestEditor();
    const value = [
      {
        children: [
          {
            children: [{ text: 'https://platejs.org' }],
            type: 'a',
            url: 'https://platejs.org',
          },
        ],
        type: 'p',
      },
    ];

    expect(
      serializeMd(editor, {
        remarkStringifyOptions: { resourceLink: true },
        value: value as any,
      })
    ).toBe('[https://platejs.org](https://platejs.org)\n');
  });

  it('round-trips footnote references and definitions as dedicated nodes', () => {
    const editor = createTestEditor();
    const input = '[^1]\n\n[^1]: Footnote text';
    const expected = '[^1]\n\n[^1]: Footnote text\n';

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            children: [{ text: 'Footnote text' }],
            type: 'p',
          },
        ],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });
});
