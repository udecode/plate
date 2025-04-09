/** @jsx jsxt */

import { type SlateEditor, createSlateEditor } from '@udecode/plate';
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
} from '@udecode/plate-basic-marks/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { jsxt } from '@udecode/plate-test-utils';
import { ParagraphPlugin } from '@udecode/plate/react';

import { markdownPlugin } from '../../../../../apps/www/src/registry/default/components/editor/plugins/markdown-plugin';
import {
  getChunkTrimmed,
  getNextBlockPath,
  steamInsertChunk,
  streamingStore,
} from './steamInsertChunk';

jsxt;

// Helper function to create input and editor with common configuration
const createTestEditor = () => {
  const input = (
    <editor>
      <hp>
        <cursor />
      </hp>
    </editor>
  ) as any as SlateEditor;

  const defaultPlugins = [
    ParagraphPlugin,
    BoldPlugin,
    CodePlugin,
    ItalicPlugin,
    StrikethroughPlugin,
    IndentPlugin,
    IndentListPlugin,
    markdownPlugin,
  ];

  const editor = createSlateEditor({
    plugins: defaultPlugins,
    selection: input.selection,
    value: input.children,
  }) as any;

  return { editor, input };
};

describe('steamInsertChunk', () => {
  beforeEach(() => {
    streamingStore.set('blockChunks', '');
    streamingStore.set('blockPath', null);
  });

  describe('line breaks', () => {
    it('should correctly process text chunks without newlines', () => {
      const streamChunks = ['chunk1\n\n', 'chunk2', 'chunk3'];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        steamInsertChunk(editor, text);
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

    it('should handle multiple paragraphs with newlines correctly', () => {
      const streamChunks = ['1', '\n\n2', '\n\n3', '\n\n4', '\n\n5'];

      const { editor } = createTestEditor();

      for (let i = 0; i < streamChunks.length; i++) {
        steamInsertChunk(editor, streamChunks[i]);

        if (i === 0) {
          editor.tf.insertNodes(
            {
              children: [{ text: 'h1' }],
              type: 'h1',
            },
            {
              at: getNextBlockPath(editor),
              nextBlock: true,
            }
          );
          streamingStore.set('blockChunks', '');
          streamingStore.set('blockPath', null);
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
        steamInsertChunk(editor, text);
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
        steamInsertChunk(editor, text);
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
        steamInsertChunk(editor, text);
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
        steamInsertChunk(editor, text);
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
        steamInsertChunk(editor, text);
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
        steamInsertChunk(editor, text);
      }

      const output = (
        <editor>
          <hcodeblock lang="typescript">
            <hcodeline>
              <htext>console.log("Hello, world!");</htext>
            </hcodeline>
          </hcodeblock>
          <hp>
            <htext>123</htext>
          </hp>
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });

    it('should correctly handle codeblock with multiple lines', () => {
      const streamChunks = [
        'two numbers sum:',
        '\n\n```typescript\nfunction sum(a: number, b: number): number ',
        '{\n  return a + b;\n}\n\n// ',
        'Example usage:\nconst num1: number = 5;\nconst ',
        'num2: number = 10;\nconst result: number ',
        '= sum(num1, num2);\n\nconsole.log(`The sum of ${num1} ',
        'and ${num2} is: ${result}`); // Output: The ',
        'sum of 5 and 10 is: 15\n```\n\n',
        'end of codeblock',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        steamInsertChunk(editor, text);
      }

      const output = [
        {
          children: [
            {
              text: 'two numbers sum:',
            },
          ],
          type: 'p',
        },
        {
          children: [
            {
              children: [
                {
                  text: 'function sum(a: number, b: number): number ',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: '{',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: '  return a + b;',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: '}',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: '// Example usage:',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: 'const num1: number = 5;',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: 'const num2: number = 10;',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: 'const result: number = sum(num1, num2);',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: '',
                },
              ],
              type: 'code_line',
            },
            {
              children: [
                {
                  text: 'console.log(`The sum of ${num1} and ${num2} is: ${result}`); // Output: The sum of 5 and 10 is: 15',
                },
              ],
              type: 'code_line',
            },
          ],
          lang: 'typescript',
          type: 'code_block',
        },
        {
          children: [
            {
              text: 'end of codeblock',
            },
          ],
          type: 'p',
        },
      ] as any;

      expect(editor.children).toEqual(output);
    });

    it('should correctly handle codeblock with newlines', () => {
      const streamChunks = [
        'two numbers sum:\n\n```javascript\nfunction sum(a, b) {\n  return ',
        'a + b;\n',
        '```',
      ];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        steamInsertChunk(editor, text);
      }

      const output = [
        {
          children: [{ text: 'two numbers sum:' }],
          type: 'p',
        },
        {
          children: [
            {
              children: [{ text: 'function sum(a, b) {' }],
              type: 'code_line',
            },
            {
              children: [{ text: '  return a + b;' }],
              type: 'code_line',
            },
          ],
          lang: 'javascript',
          type: 'code_block',
        },
      ] as any;

      expect(editor.children).toEqual(output);
    });
  });

  describe('list items', () => {
    it('should handle multiple list items with markdown formatting correctly', () => {
      /** Upstream bug need to fixes deserializeMd */

      const streamChunks = ['chunk1\n*   ', '**chunk2**\n\n', 'chunk3'];

      const { editor } = createTestEditor();

      for (const text of streamChunks) {
        steamInsertChunk(editor, text);
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
        steamInsertChunk(editor, text);
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
            <htext>The current temperature in Henan Xinxiang is 12.2°C.</htext>
          </hp>
        </editor>
      ) as any;

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('fixures', () => {
    it('should correctly stream chunks with existing paragraph', () => {
      const input = (
        <editor>
          <hp>
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
            <htext>chunk1 chunk2</htext>
          </hp>
          <hp>
            <htext>existing paragraph</htext>
          </hp>
        </fragment>
      );

      const defaultPlugins = [
        ParagraphPlugin,
        BoldPlugin,
        CodePlugin,
        ItalicPlugin,
        StrikethroughPlugin,
        IndentPlugin,
        IndentListPlugin,
        markdownPlugin,
      ];

      const editor = createSlateEditor({
        plugins: defaultPlugins,
        selection: input.selection,
        value: input.children,
      }) as any;

      const streamChunks = ['chunk1 ', 'chunk2'];

      for (const text of streamChunks) {
        steamInsertChunk(editor, text);
      }

      console.log(JSON.stringify(editor.children), 'fj');

      expect(editor.children).toEqual(output);
    });
  });
});

describe('getChunkTrimmed', () => {
  it('should correctly trim the chunk', () => {
    const original = 'chunk1\n\n123\n\n';

    const trimmed = getChunkTrimmed(original, 'p');

    expect(trimmed).toBe('\n\n');

    const original2 = 'chunk1\n\n123\n\nchunk2';

    const trimmed2 = getChunkTrimmed(original2, 'p');

    expect(trimmed2).toBe('');

    const original3 = 'chunk1\n\n123\n\nchunk2  ';

    const trimmed3 = getChunkTrimmed(original3, 'p');

    expect(trimmed3).toBe('  ');
  });
});
