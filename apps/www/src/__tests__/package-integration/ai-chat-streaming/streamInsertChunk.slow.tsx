/** @jsx jsxt */

import { deserializeMd } from '@platejs/markdown';
import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from './__tests__/createTestEditor';
import { streamInsertChunk } from '../../../../../../packages/ai/src/react/ai-chat/streaming/streamInsertChunk';

jsxt;

const streamChunks = (chunks: string[]) => {
  const { editor } = createTestEditor();

  for (const chunk of chunks) {
    streamInsertChunk(editor, chunk);
  }

  return editor;
};

const getStreamedMarkdown = (chunks: string[]) => {
  const editor = streamChunks(chunks);

  return { editor, expected: deserializeMd(editor, chunks.join('')) };
};

const getChunkRegroupingState = (groupings: string[][]) => {
  const fullSource = groupings[0]?.join('');
  const expected = streamChunks(groupings[0] ?? []).children;

  return {
    expected,
    fullSource,
    outputs: groupings.map((chunks) => streamChunks(chunks).children),
    sameSource: groupings.every((chunks) => chunks.join('') === fullSource),
  };
};

describe('streamInsertChunk', () => {
  describe('paragraph boundaries', () => {
    it('starts a new paragraph after a trailing blank line', () => {
      const editor = streamChunks(['chunk1\n\n', 'chunk2', 'chunk3']);

      const output = (
        <fragment>
          <hp>
            <htext>chunk1</htext>
          </hp>
          <hp>
            <htext>chunk2chunk3</htext>
          </hp>
        </fragment>
      ) as any;

      expect(editor.children).toEqual(output);
    });

    it('splits the first streamed chunk into multiple paragraphs', () => {
      const editor = streamChunks([
        'chunk1\n\nchunk2\n\nchunk3',
        '\n\nchunk4\n\nchunk5',
      ]);

      const output = (
        <fragment>
          <hp>
            <htext>chunk1</htext>
          </hp>
          <hp>
            <htext>chunk2</htext>
          </hp>
          <hp>
            <htext>chunk3</htext>
          </hp>
          <hp>
            <htext>chunk4</htext>
          </hp>
          <hp>
            <htext>chunk5</htext>
          </hp>
        </fragment>
      ) as any;

      expect(editor.children).toEqual(output);
    });
  });

  describe('inline formatting', () => {
    it('applies marks that close in later chunks', () => {
      const editor = streamChunks([
        'This is a **bold',
        '**text',
        ' with _italic_ marks',
      ]);

      const output = (
        <fragment>
          <hp>
            <htext>This is a </htext>
            <htext bold>bold</htext>
            <htext>text with </htext>
            <htext italic>italic</htext>
            <htext> marks</htext>
          </hp>
        </fragment>
      ) as any;

      expect(editor.children).toEqual(output);
    });

    it('keeps marks that close at the end of a paragraph', () => {
      const editor = streamChunks([
        'hi ',
        '123',
        '\n\n 2233',
        '\n\n 4455',
        '**6677**',
      ]);

      const output = (
        <fragment>
          <hp>
            <htext>hi 123</htext>
          </hp>
          <hp>
            <htext>2233</htext>
          </hp>
          <hp>
            <htext>4455</htext>
            <htext bold>6677</htext>
          </hp>
        </fragment>
      ) as any;

      expect(editor.children).toEqual(output);
    });

    it('builds inline equations across chunk boundaries', () => {
      const editor = streamChunks([
        'inline math:\n\n',
        '$$a^2 ',
        '+ ',
        'b^2 ',
        '= ',
        'c^2$$',
      ]);

      expect(editor.children).toEqual([
        {
          children: [{ text: 'inline math:' }],
          type: 'p',
        },
        {
          children: [
            { text: '' },
            {
              children: [{ text: '' }],
              texExpression: 'a^2 + b^2 = c^2',
              type: 'inline_equation',
            },
            { text: '' },
          ],
          type: 'p',
        },
      ]);
    });

    it('keeps inline html-like formatting once tags close', () => {
      const editor = streamChunks([
        '**bold**, _italic_,',
        '<u>',
        'underline',
        '</u>',
      ]);

      expect(editor.children).toEqual([
        {
          children: [
            { bold: true, text: 'bold' },
            { text: ', ' },
            { italic: true, text: 'italic' },
            { text: ',' },
            { text: 'underline', underline: true },
          ],
          type: 'p',
        },
      ]);
    });
  });

  describe('lists', () => {
    it('streams marked list items split across chunks', () => {
      const editor = streamChunks(['chunk1\n*   ', '**chunk2**\n\n', 'chunk3']);

      const output = (
        <fragment>
          <hp>
            <htext>chunk1</htext>
          </hp>
          <hp indent={1} listStyleType="disc">
            <htext bold>chunk2</htext>
          </hp>
          <hp>
            <htext>chunk3</htext>
          </hp>
        </fragment>
      ) as any;

      expect(editor.children).toEqual(output);
    });

    it('keeps consecutive marked list items in the same list', () => {
      const editor = streamChunks([
        '- *',
        '*Syntax Highlighting:** Improves',
        ' readability',
        ' by',
        ' highlighting',
        ' markdown',
        ' syntax',
        '.\n',
        '- *',
        '*Collaboration:** Allows multiple',
        ' users',
        ' to',
        ' edit',
        ' the',
        ' same',
        ' document',
      ]);

      const [firstBlock, secondBlock] = editor.children as any[];

      expect(firstBlock).toEqual({
        children: [
          { bold: true, text: 'Syntax Highlighting:' },
          {
            text: ' Improves readability by highlighting markdown syntax.',
          },
        ],
        indent: 1,
        listStyleType: 'disc',
        type: 'p',
      });

      expect(secondBlock?.type).toBe('p');
      expect(secondBlock?.indent).toBe(1);
      expect(secondBlock?.listStyleType).toBe('disc');
      expect(secondBlock?.children?.[0]?.bold).toBe(true);
      expect(secondBlock?.children?.[0]?.text).toBe('Collaboration:');
      expect(secondBlock?.children?.[1]?.text).toBe(
        ' Allows multiple users to edit the same document'
      );
    });

    it('preserves ordered list numbering after a paragraph break', () => {
      const editor = streamChunks(['1. 1', '\n\n', 'xxx\n\n', '2. 2']);

      const output = (
        <fragment>
          <hp indent={1} listStyleType="decimal">
            <htext>1</htext>
          </hp>
          <hp>
            <htext>xxx</htext>
          </hp>
          <hp
            indent={1}
            listRestartPolite={2}
            listStart={2}
            listStyleType="decimal"
          >
            <htext>2</htext>
          </hp>
        </fragment>
      ) as any;

      expect(editor.children).toEqual(output);
    });
  });

  describe('markdown block contracts', () => {
    it.each([
      [
        'fenced code blocks split across chunks',
        [
          '```typescript',
          '\nconsole.log("Hello, world!");\n',
          '```\n\n',
          '123',
        ],
      ],
      [
        'multiline fenced code blocks',
        [
          'two numbers sum:',
          '\n\n```typescript\nfunction sum(a: number, b: number): number ',
          '{\n  return a + b;\n}\n\n// ',
          '\n```',
        ],
      ],
      [
        'code blocks with newline-heavy chunk boundaries',
        [
          'two numbers sum:\n\n```javascript\nfunction sum(a, b) {\n  return ',
          'a + b;\n',
          '```',
        ],
      ],
      [
        'mixed heading chunks with incomplete blank lines',
        [
          'Here is an example that includes various Markdown blocks and decorations:\n',
          '\n',
          '# Heading 1\n',
          '\n',
          '## Heading 2\n',
          '\n',
          '### Heading 3',
        ],
      ],
      [
        'block and inline math content',
        [
          'Here is an example of Markdown with math:\n',
          '\n',
          'To display an inline equation, you can use single dollar signs: $E = mc^2$.\n',
          '\n',
          'For a block equation, use double dollar signs:\n',
          '\n',
          '$$\n',
          'a^2 + b^2 = c^2\n',
          '$$\n',
          '\n',
          'These examples show how to include mathematical expressions in Markdown.',
        ],
      ],
      [
        'a mixed markdown document',
        [
          '# ',
          'Heading 1\n\n',
          '**Bold',
          ' Text**\n\n',
          '- ',
          'Unordered list item 1\n',
          '\n',
          '```python\n',
          'print("Hello, ',
          'World!")\n',
          '```\n\n',
          '[Link ',
          'text](https://example.com)\n\n',
          '| Header 1 | Header 2 |\n',
          '|----------|----------|\n',
          '| Row 1    | Data     |\n\n',
          '- [ ] Task list item 1',
        ],
      ],
    ])('matches deserializeMd for %s', (_label, chunks) => {
      const { editor, expected } = getStreamedMarkdown(chunks);

      expect(editor.children).toEqual(expected);
    });
  });

  describe('chunk regrouping invariance', () => {
    it.each([
      [
        'mixed inline formatting and paragraph boundaries',
        [
          [
            'Intro',
            '\n\nThis has **bo',
            'ld** and <u>',
            'underline',
            '</u>',
            '\n\ntail',
          ],
          ['Intro\n\nThis has **bold** ', 'and <u>underline</u>\n\n', 'tail'],
          ['Intro\n\nThis has **bold** and <u>underline</u>\n\ntail'],
        ],
      ],
      [
        'ordered list restarts after a paragraph break',
        [
          ['1', '. First', '\n\nbridge', '\n\n2', '. Second'],
          ['1. First\n\n', 'bridge\n\n2. Second'],
          ['1. First\n\nbridge\n\n2. Second'],
        ],
      ],
      [
        'inline math and fenced code blocks',
        [
          [
            'Equation ',
            '$$a^2 ',
            '+ b^2 ',
            '= c^2$$',
            '\n\n```ts',
            '\nconst x = 1;\n',
            '```\n\nafter',
          ],
          [
            'Equation $$a^2 + b^2 = c^2$$\n\n',
            '```ts\nconst x = 1;\n```\n\n',
            'after',
          ],
          ['Equation $$a^2 + b^2 = c^2$$\n\n```ts\nconst x = 1;\n```\n\nafter'],
        ],
      ],
    ])('keeps the final editor state stable for %s', (_label, groupings) => {
      const { expected, outputs, sameSource } =
        getChunkRegroupingState(groupings);

      expect(sameSource).toBe(true);

      for (const output of outputs) {
        expect(output).toEqual(expected);
      }
    });
  });
});
