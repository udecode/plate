/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from '@udecode/plate';
import { BaseHorizontalRulePlugin } from '@udecode/plate-horizontal-rule';
import { deserializeMd } from '@udecode/plate-markdown';
import { jsxt } from '@udecode/plate-test-utils';

import { createTestEditor, defaultPlugins } from './__tests__/createTestEditor';
import { getCurrentBlockPath, streamInsertChunk } from './streamInsertChunk';

jsxt;

describe('steamInsertChunk', () => {
  describe('line breaks', () => {
    it('should correctly process text chunks without newlines', () => {
      const streamChunks = ['chunk1\n\n', 'chunk2', 'chunk3'];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const output = (
        <editor>
          <hp>
            <htext>chunk1</htext>
          </hp>
          <hp>
            <htext>chunk2chunk3</htext>
          </hp>
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });

    it.skip('should handle multiple paragraphs with newlines correctly', () => {
      const streamChunks = ['1', '\n\n2', '\n\n3', '\n\n4', '\n\n5'];

      const { editor } = createTestEditor();

      for (let i = 0; i < streamChunks.length; i++) {
        streamInsertChunk(editor, streamChunks[i]);

        if (i === 0) {
          editor.tf.insertNodes(
            {
              children: [{ text: 'h1' }],
              type: 'h1',
            },
            {
              at: getCurrentBlockPath(editor),
              nextBlock: true,
            }
          );

          // streamingStore.set('blockChunks', '');
          // streamingStore.set('blockPath', null);
        }
      }

      const output = (
        <editor>
          <hp>
            <htext>1</htext>
          </hp>
          <hh1>
            <htext>h1</htext>
          </hh1>
          <hp>
            <htext>2</htext>
          </hp>
          <hp>
            <htext>3</htext>
          </hp>
          <hp>
            <htext>4</htext>
          </hp>
          <hp>
            <htext>5</htext>
          </hp>
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });

    it('should correctly fist chunk with multiple nodes', () => {
      const streamChunks = [
        'chunk1\n\nchunk2\n\nchunk3',
        '\n\nchunk4\n\nchunk5',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const output = (
        <editor>
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
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('marks', () => {
    it('should properly process text with markdown formatting marks', () => {
      const streamChunks = ['hi ', '123', '\n\n **2233**', '\n\n4455'];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const output = (
        <editor>
          <hp>
            <htext>hi 123</htext>
          </hp>
          <hp>
            <htext bold>2233</htext>
          </hp>
          <hp>
            <htext>4455</htext>
          </hp>
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });

    it('should correctly handle markdown formatting at the end of a line', () => {
      const streamChunks = ['hi ', '123', '\n\n 2233', '\n\n 4455', '**6677**'];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const output = (
        <editor>
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
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });

    it('should correctly handle incomplete marks', () => {
      const streamChunks = [
        'This is a **bold',
        '**text',
        ' with _italic_ marks',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const output = (
        <editor>
          <hp>
            <htext>This is a </htext>
            <htext bold>bold</htext>
            <htext>text with </htext>
            <htext italic>italic</htext>
            <htext> marks</htext>
          </hp>
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });

    it('should correctly handle incomplete marks with newlines', () => {
      const streamChunks = ['chunk1\n\n**chunk', '2**'];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const output = (
        <editor>
          <hp>
            <htext>chunk1</htext>
          </hp>
          <hp>
            <htext bold>chunk2</htext>
          </hp>
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('blocks', () => {
    it('should correctly handle codeblock', () => {
      const streamChunks = [
        '```typescript',
        '\nconsole.log("Hello, world!");\n',
        '```\n\n',
        '123',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toEqual(
        deserializeMd(editor, streamChunks.join(''))
      );
    });

    it('should correctly handle codeblock with multiple lines', () => {
      const streamChunks = [
        'two numbers sum:',
        '\n\n```typescript\nfunction sum(a: number, b: number): number ',
        '{\n  return a + b;\n}\n\n// ',
        // 'Example usage:\nconst num1: number = 5;\nconst ',
        // 'sum of 5 and 10 is: 15\n```\n\n',
        // 'end of codeblock',
        '\n```',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toEqual(
        deserializeMd(editor, streamChunks.join(''))
      );
    });

    it('should correctly handle codeblock with newlines', () => {
      const streamChunks = [
        'two numbers sum:\n\n```javascript\nfunction sum(a, b) {\n  return ',
        'a + b;\n',
        '```',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toEqual(
        deserializeMd(editor, streamChunks.join(''))
      );
    });
  });

  describe('list items', () => {
    it('should handle multiple list items with markdown formatting correctly', () => {
      const streamChunks = ['chunk1\n*   ', '**chunk2**\n\n', 'chunk3'];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const output = (
        <editor>
          <hp>
            <htext>chunk1</htext>
          </hp>
          <hp indent={1} listStyleType="disc">
            <htext bold>chunk2</htext>
          </hp>
          <hp>
            <htext>chunk3</htext>
          </hp>
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });

    it('should correctly process complex content with skills list and weather information', () => {
      const streamChunks = [
        "Here's ",
        'the ',
        'information you requested:\n\n**Skills:**\n\n*   **Node.js**\n*   **React**\n*   **TypeScript**\n*   ',
        '**tRPC**\n',
        '*   **Prisma**\n*   **Tailwind CSS**\n*   **Next.js**\n',
        '*   **English**\n*   **French**\n\nThe current temperature in Henan Xinxiang is 12.2°C.\n',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const output = (
        <editor>
          <hp>
            <htext>Here's the information you requested:</htext>
          </hp>
          <hp>
            <htext bold>Skills:</htext>
          </hp>
          <hp indent={1} listStyleType="disc">
            <htext bold>Node.js</htext>
          </hp>
          <hp indent={1} listStart={2} listStyleType="disc">
            <htext bold>React</htext>
          </hp>
          <hp indent={1} listStart={3} listStyleType="disc">
            <htext bold>TypeScript</htext>
          </hp>
          <hp indent={1} listStart={4} listStyleType="disc">
            <htext bold>tRPC</htext>
          </hp>
          <hp indent={1} listStart={5} listStyleType="disc">
            <htext bold>Prisma</htext>
          </hp>
          <hp indent={1} listStart={6} listStyleType="disc">
            <htext bold>Tailwind CSS</htext>
          </hp>
          <hp indent={1} listStart={7} listStyleType="disc">
            <htext bold>Next.js</htext>
          </hp>
          <hp indent={1} listStart={8} listStyleType="disc">
            <htext bold>English</htext>
          </hp>
          <hp indent={1} listStart={9} listStyleType="disc">
            <htext bold>French</htext>
          </hp>
          <hp>
            <htext>
              The current temperature in Henan Xinxiang is 12.2°C.{'\n'}
            </htext>
          </hp>
        </editor>
      ) as any;

      // console.log(JSON.stringify(editor.children), 'fj');
      // console.log(
      //   JSON.stringify(deserializeMd(editor, streamChunks.join(''))),
      //   'fj'
      // );

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('fixures', () => {
    it.skip('should correctly stream chunks with existing paragraph', () => {
      const input = (
        <editor>
          <hp>
            <htext />
            <cursor />
          </hp>
          <hp>
            <htext>existing paragraph</htext>
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <fragment>
          <hp>
            <htext>chunk1chunk2</htext>
          </hp>
          <hp>
            <htext>chunk3</htext>
          </hp>
          <hp>
            <htext>existing paragraph</htext>
          </hp>
        </fragment>
      );

      const editor = createSlateEditor({
        plugins: defaultPlugins,
        selection: input.selection,
        value: input.children,
      }) as any;

      const streamChunks = ['chunk1', 'chunk2\n\n', 'chunk3'];

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toEqual(output);
    });

    it.skip('should correctly handle streaming when cursor is in existing paragraph', () => {
      const input = (
        <editor>
          <hp>
            <htext>existing paragraph</htext>
            <cursor />
          </hp>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <fragment>
          <hp>
            <htext>existing paragraph</htext>
          </hp>
          <hp>
            <htext>chunk1chunk2</htext>
          </hp>
          <hp>
            <htext>chunk3</htext>
          </hp>
        </fragment>
      );

      const editor = createSlateEditor({
        plugins: defaultPlugins,
        selection: input.selection,
        value: input.children,
      }) as any;

      const streamChunks = ['chunk1', 'chunk2\n\n', 'chunk3'];

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toEqual(output);
    });

    it('all markdown nodes should be streamed correctly', () => {
      const streamChunks = [
        '# ',
        'Heading ',
        '1\n\n',
        '## ',
        'Heading ',
        '2\n\n',
        '### ',
        'Heading ',
        '3\n\n',
        '#### ',
        'Heading ',
        '4\n\n',
        '##### ',
        'Heading ',
        '5\n\n',
        '###### ',
        'Heading ',
        '6\n\n',
        '**Bold ',
        'Text**\n\n',
        '*Italic ',
        'Text*\n\n',
        '~~Strikethrough~~\n\n',
        '> ',
        'Blockquote\n\n',
        '- ',
        'Unordered ',
        'list ',
        'item ',
        '1\n',
        '- ',
        'Unordered ',
        'list ',
        'item ',
        '2\n\n',
        '1. ',
        'Ordered ',
        'list ',
        'item ',
        '1\n',
        '2. ',
        'Ordered ',
        'list ',
        'item ',
        '2\n\n',
        '`Inline ',
        'code`\n\n',
        '```python\n',
        '# ',
        'Code ',
        'block\n',
        'print("Hello, ',
        'World!")\n',
        '```\n\n',
        '[Link ',
        'text](https://example.com)\n\n',
        '![Alt ',
        'text](https://example.com/image.jpg)\n\n',
        '---\n\n',
        'Horizontal ',
        'rule\n\n',
        '| ',
        'Header ',
        '1 ',
        '| ',
        'Header ',
        '2 ',
        '|\n',
        '|----------|----------|\n',
        '| ',
        'Row ',
        '1   ',
        ' | ',
        'Data    ',
        ' |\n',
        '| ',
        'Row ',
        '2   ',
        ' | ',
        'Data    ',
        ' |\n\n',
        '- ',
        '[ ',
        '] ',
        'Task ',
        'list ',
        'item ',
        '1\n',
        '- ',
        '[x] ',
        'Task ',
        'list ',
        'item ',
        '2',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        streamInsertChunk(editor, text);
      }

      const basicValue = (
        <fragment>
          <hh1>
            <htext>Heading 1</htext>
          </hh1>
          <hh2>
            <htext>Heading 2</htext>
          </hh2>
          <hh3>
            <htext>Heading 3</htext>
          </hh3>
          <hh4>
            <htext>Heading 4</htext>
          </hh4>
          <hh5>
            <htext>Heading 5</htext>
          </hh5>
          <hh6>
            <htext>Heading 6</htext>
          </hh6>
          <hp>
            <htext bold>Bold Text</htext>
          </hp>
          <hp>
            <htext italic>Italic Text</htext>
          </hp>
          <hp>
            <htext strikethrough>Strikethrough</htext>
          </hp>
          <hblockquote>
            <htext>Blockquote</htext>
          </hblockquote>
          <hp indent={1} listStyleType="disc">
            <htext>Unordered list item 1</htext>
          </hp>
          <hp indent={1} listStart={2} listStyleType="disc">
            <htext>Unordered list item 2</htext>
          </hp>
          <hp indent={1} listStyleType="decimal">
            <htext>Ordered list item 1</htext>
          </hp>
          <hp
            indent={1}
            listRestartPolite={2}
            listStart={2}
            listStyleType="decimal"
          >
            <htext>Ordered list item 2</htext>
          </hp>
          <hp>
            <htext code>Inline code</htext>
          </hp>
          <hcodeblock lang="python">
            <hcodeline># Code block</hcodeline>
            <hcodeline>{`print("Hello, World!")`}</hcodeline>
          </hcodeblock>
          <hp>
            <ha url="https://example.com">Link text</ha>
          </hp>
          <himg
            caption={[{ text: 'Alt text' }]}
            url="https://example.com/image.jpg"
          >
            <htext />
          </himg>
          <element type={BaseHorizontalRulePlugin.key}>
            <htext />
          </element>
          <hp>
            <htext>Horizontal rule</htext>
          </hp>
        </fragment>
      );

      const tableValue = [
        {
          children: [
            {
              children: [
                {
                  children: [{ children: [{ text: 'Header 1' }], type: 'p' }],
                  type: 'th',
                },
                {
                  children: [{ children: [{ text: 'Header 2' }], type: 'p' }],
                  type: 'th',
                },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: 'Row 1' }], type: 'p' }],
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: 'Data' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
            {
              children: [
                {
                  children: [{ children: [{ text: 'Row 2' }], type: 'p' }],
                  type: 'td',
                },
                {
                  children: [{ children: [{ text: 'Data' }], type: 'p' }],
                  type: 'td',
                },
              ],
              type: 'tr',
            },
          ],
          type: 'table',
        },
      ];

      const taskListValue = (
        <fragment>
          <hp checked={false} indent={1} listStyleType="todo">
            <htext>Task list item 1</htext>
          </hp>
          <hp checked={true} indent={1} listStart={2} listStyleType="todo">
            <htext>Task list item 2</htext>
          </hp>
        </fragment>
      );

      expect(editor.children).toEqual([
        ...basicValue,
        ...tableValue,
        ...taskListValue,
      ]);
    });

    it('incomplete line breaks', () => {
      const chunks = [
        'Here is an example that includes various Markdown blocks and decorations:\n',
        '\n',
        '# Heading 1\n',
        '\n',
        '## Heading 2\n',
        '\n',
        '### Heading 3',
      ];

      const { editor } = createTestEditor();

      for (const text of chunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toEqual(deserializeMd(editor, chunks.join('')));
    });

    it('should correctly handle incomplete math block', () => {
      const chunks = [
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
      ];

      const { editor } = createTestEditor();

      for (const text of chunks) {
        streamInsertChunk(editor, text);
      }

      const result = editor.children;

      expect(result).toEqual(deserializeMd(editor, chunks.join('')));
    });

    it('should correctly handle incomplete inline math', () => {
      const chunks = [
        'inline math:\n\n',
        '$$a^2 ',
        '+ ',
        'b^2 ',
        '= ',
        'c^2$$',
      ];

      const { editor } = createTestEditor();

      for (const text of chunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toMatchSnapshot();
    });

    // FIXME:Need to find a way to disable automatic conversion (https://example.com) to links it's should be text (remark-gfm).
    it.skip('should correctly handle incomplete link', () => {
      const chunks = ['[Link ', 'text](', 'https://example.com', ')'];

      const { editor } = createTestEditor();

      for (const text of chunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toEqual(deserializeMd(editor, chunks.join('')));
    });

    // missing space and \n
    it.skip('should correctly handle incomplete todo list and table', () => {
      const chunks = [
        '*',
        ' Lists',
        '  \n',
        ' ',
        ' *',
        ' [',
        ' ]',
        ' todo',
        '  \n',
        ' ',
        ' *',
        ' [',
        'x',
        ']',
        ' done',
      ];

      const { editor } = createTestEditor();

      for (const text of chunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toEqual(deserializeMd(editor, chunks.join('')));
    });

    it('stream insert lists', () => {
      const chunks = ['1. 1', '\n\n', 'xxx\n\n', '2. 2'];

      const { editor } = createTestEditor();

      for (const text of chunks) {
        streamInsertChunk(editor, text);
      }

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

    it('streaming insert incomplete mdx tag', () => {
      const chunks = ['**bold**, _italic_,', '<u>', 'underline', '</', 'u>'];

      const { editor } = createTestEditor();

      for (const text of chunks) {
        streamInsertChunk(editor, text);
      }

      expect(editor.children).toMatchSnapshot();
    });
  });
});
