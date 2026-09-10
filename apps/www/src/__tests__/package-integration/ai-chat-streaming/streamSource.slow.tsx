import { describe, expect, it } from 'bun:test';

import { MarkdownPlugin } from '../../../../../../packages/platejs/src/markdown';
import { createMarkdownStream } from '../../../../../../packages/platejs/src/markdown/lib/internal/createMarkdownStream';
import { createTestEditor } from './__tests__/createTestEditor';

const fixtures = [
  'A **bold** word and _italic_ text.\n\nLast paragraph.',
  'Heading\n=======\n\nParagraph',
  '[link][target]\n\n[target]: https://example.com',
  'first  \nline\n\nlast  ',
  'paragraph\n\n<columnGroup>\n<column width="50%">\nleft\n</column>\n<column width="50%">\nright\n</column>\n</columnGroup>\n\nlast',
  '<callout icon="a > b">\n<callout icon="x">\nNested **text**\n</callout>\n</callout>',
  '<img src="https://example.com/a.png" alt="hello" />',
  '<unknown value={"a > b"}>\ntext\n</unknown>',
  '```js\nconst x = "**literal**";\n```\n\nlast',
  '```mdx\n<columnGroup>\ntext\n</columnGroup>\n```',
  '- first\n\n  continued\n- second\n\nlast',
  '1. first\n2. next\n\n   continued\n\nlast',
  '| a | b |\n| - | - |\n| c | d |\n\nlast',
  'Hello :smile: and @bob\n\nlast',
  'Math\n\n$$\nx+y\n$$\n\nlast',
  'A reference[^one].\n\n[^one]: Footnote **content**.',
  'An inline [link](https://example.com) and ![image](https://example.com/a.png).',
  'See www.example.com and user@example.com.',
  '<!-- a comment -->\n\nSome text',
];

describe('AI raw-source parsing', () => {
  for (const [fixture, source] of fixtures.entries()) {
    for (const size of [1, 16, 128]) {
      it(`matches complete Markdown for fixture ${fixture}, chunks ${size}`, () => {
        const { editor } = createTestEditor();
        const parser = createMarkdownStream(editor);
        let cumulative = '';
        for (let offset = 0; offset < source.length; offset += size) {
          cumulative += source.slice(offset, offset + size);
          parser.update(cumulative);
          expect(parser.source).toBe(cumulative);
          expect(parser.value).toEqual(
            editor.api.markdown.deserialize(cumulative).children
          );
        }
        expect(parser.value).toEqual(
          editor.api.markdown.deserialize(source).children
        );
      });
    }
  }

  it('does no work for duplicates and resets progress for replacement snapshots', () => {
    const { editor } = createTestEditor();
    const parser = createMarkdownStream(editor);
    const value = parser.update('First **bold**.\n\nSecond.');
    const { metrics } = parser;
    expect(parser.update(parser.source)).toBe(value);
    expect(parser.metrics).toEqual(metrics);
    expect(parser.update('Replacement _text_.')).toEqual(
      editor.api.markdown.deserialize('Replacement _text_.').children
    );
  });

  it('retains settled node identities while parsing new raw source', () => {
    const { editor } = createTestEditor();
    const parser = createMarkdownStream(editor);
    const first = parser.update('First **bold**.\n\nSecond.')[0];
    const next = parser.update('First **bold**.\n\nSecond.\n\nThird.');
    expect(next[0]).toBe(first);
    expect(next).toEqual(
      editor.api.markdown.deserialize(parser.source).children
    );
  });

  it('runs unknown global transforms against complete source', () => {
    const { editor } = createTestEditor();
    editor.plugin(MarkdownPlugin).store.set({
      remarkPlugins: [
        () => (tree) => {
          const count = tree.children.length;
          for (const node of tree.children) {
            if (node.type === 'paragraph') {
              node.children = [{ type: 'text', value: String(count) }];
            }
          }
        },
      ],
    });
    const parser = createMarkdownStream(editor);
    parser.update('First.\n\nSecond.');
    const source = 'First.\n\nSecond.\n\nThird.';
    expect(parser.update(source)).toEqual(
      editor.api.markdown.deserialize(source).children
    );
  });
});
