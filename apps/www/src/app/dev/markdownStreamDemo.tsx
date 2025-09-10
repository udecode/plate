'use client';
import { type HTMLAttributes, useCallback, useRef, useState } from 'react';

import { AIChatPlugin, streamInsertChunk } from '@platejs/ai/react';
import { getPluginType, KEYS } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { MarkdownJoiner } from '@/registry/lib/markdown-joiner-transform';
import { Editor, EditorContainer } from '@/registry/ui/editor';
const testScenarios = {
  // Basic markdown with complete elements
  columns: [
    'paragraph\n\n<column',
    '_group',
    '>\n',
    ' ',
    ' <',
    'column',
    ' width',
    '="',
    '33',
    '.',
    '333',
    '333',
    '333',
    '333',
    '336',
    '%">\n',
    '   ',
    ' ',
    '1',
    '\n',
    ' ',
    ' </',
    'column',
    '>\n',
    ' ',
    ' <',
    'column',
    ' width',
    '="',
    '33',
    '.',
    '333',
    '333',
    '333',
    '333',
    '336',
    '%">\n',
    '   ',
    ' ',
    '2',
    '\n',
    ' ',
    ' </',
    'column',
    '>\n',
    ' ',
    ' <',
    'column',
    ' width',
    '="',
    '33',
    '.',
    '333',
    '333',
    '333',
    '333',
    '336',
    '%">\n',
    '   ',
    ' ',
    '3',
    '\n',
    ' ',
    ' </',
    'column',
    '>\n',
    '</',
    'column',
    '_group',
    '>\n\nparagraph',
  ],
  links: [
    '[Link ',
    'to OpenA',
    'I](https://www.openai.com)\n\n',
    '[Link ',
    'to Google',
    'I](https://ww',
    'w.google.com/1',
    '11',
    '22',
    'xx',
    'yy',
    'zz',
    'aa',
    'bb',
    'cc',
    'dd',
    'ee',
    '33)\n\n',
    '[False Positive',
    '11',
    '22',
    '33',
    '44',
    '55',
    '66',
    '77',
    '88',
    '99',
    '100',
  ],
  lists: ['1.', ' number 1\n', '- ', 'List B\n', '-', ' [x] ', 'Task C'],
  listWithImage: [
    '## ',
    'Links ',
    'and ',
    'Images\n\n',
    '- [Link ',
    'to OpenA',
    'I](https://www.openai.com)\n',
    '- ![Sample Image](https://via.placeholder.com/150)\n\n',
  ],
  nestedStructureBlock: [
    '```',
    'javascript',
    '\n',
    'import',
    ' React',
    ' from',
    " '",
    'react',
    "';\n",
    'import',
    ' {',
    ' Plate',
    ' }',
    ' from',
    " '@",
    'ud',
    'ecode',
    '/',
    'plate',
    "';\n\n",
    'const',
    ' Basic',
    'Editor',
    ' =',
    ' ()',
    ' =>',
    ' {\n',
    ' ',
    ' return',
    ' (\n',
    '   ',
    ' <',
    'Plate',
    '>\n',
    '     ',
    ' {/*',
    ' Add',
    ' your',
    ' plugins',
    ' and',
    ' components',
    ' here',
    ' */}\n',
    '   ',
    ' </',
    'Plate',
    '>\n',
    ' ',
    ' );\n',
    '};\n\n',
    'export',
    ' default',
    ' Basic',
    'Editor',
    ';\n',
    '```',
  ],
  table: [
    '| Feature          |',
    ' Plate',
    '.js',
    '                                     ',
    ' ',
    '| Slate.js                                     ',
    ' ',
    '|\n|------------------',
    '|--------------------------------',
    '---------------',
    '|--------------------------------',
    '---------------',
    '|\n| Purpose         ',
    ' ',
    '| Rich text editor framework',
    '                   ',
    ' ',
    '| Rich text editor framework',
    '                   ',
    ' ',
    '|\n| Flexibility     ',
    ' ',
    '| Highly customizable',
    ' with',
    ' plugins',
    '             ',
    ' ',
    '| Highly customizable',
    ' with',
    ' plugins',
    '             ',
    ' ',
    '|\n| Community       ',
    ' ',
    '| Growing community support',
    '                    ',
    ' ',
    '| Established community',
    ' support',
    '                ',
    ' ',
    '|\n| Documentation   ',
    ' ',
    '| Comprehensive documentation',
    ' available',
    '        ',
    ' ',
    '| Comprehensive documentation',
    ' available',
    '        ',
    ' ',
    '|\n| Performance     ',
    ' ',
    '| Optimized for performance',
    ' with',
    ' large',
    ' documents',
    '| Good performance, but',
    ' may',
    ' require',
    ' optimization',
    '|\n| Integration     ',
    ' ',
    '| Easy integration with',
    ' React',
    '                  ',
    ' ',
    '| Easy integration with',
    ' React',
    '                  ',
    ' ',
    '|\n| Use Cases       ',
    ' ',
    '| Suitable for complex',
    ' editing',
    ' needs',
    '           ',
    ' ',
    '| Suitable for complex',
    ' editing',
    ' needs',
    '           ',
    ' ',
    '\n\n',
    'Paragraph ',
    'should ',
    'exist ',
    'from ',
    'table',
  ],
};

export const MarkdownStreamDemo = () => {
  const [selectedScenario, setSelectedScenario] =
    useState<keyof typeof testScenarios>('columns');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const isPauseRef = useRef(false);
  const streamSessionRef = useRef(0);

  const editor = usePlateEditor(
    {
      plugins: [...CopilotKit, ...EditorKit],
      value: [],
    },
    []
  );

  const currentChunks = testScenarios[selectedScenario];
  const transformedCurrentChunks = transformedChunks(currentChunks);

  const onStreaming = useCallback(async () => {
    streamSessionRef.current += 1;
    const sessionId = streamSessionRef.current;

    isPauseRef.current = false;
    setActiveIndex(0);
    // editor.tf.setValue([]);

    editor.setOption(AIChatPlugin, 'streaming', false);
    editor.setOption(AIChatPlugin, '_blockChunks', '');
    editor.setOption(AIChatPlugin, '_blockPath', null);

    for (let i = 0; i < transformedCurrentChunks.length; i++) {
      while (isPauseRef.current) {
        if (sessionId !== streamSessionRef.current) return;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      if (sessionId !== streamSessionRef.current) return;

      setActiveIndex(i + 1);

      const chunk = transformedCurrentChunks[i];

      streamInsertChunk(editor, chunk.chunk, {
        textProps: {
          [getPluginType(editor, KEYS.ai)]: true,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, chunk.delayInMs));

      if (sessionId !== streamSessionRef.current) return;
    }
  }, [editor, transformedCurrentChunks]);

  return (
    <section className="p-20">
      <div className="mb-10">
        {/* Scenario Selection */}
        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium">Test Scenario:</span>
          <select
            className="w-64 rounded border px-3 py-2"
            value={selectedScenario}
            onChange={(e) => {
              setSelectedScenario(e.target.value as keyof typeof testScenarios);
              setActiveIndex(0);
              editor.tf.setValue([]);
            }}
          >
            {Object.entries(testScenarios).map(([key]) => (
              <option key={key} value={key}>
                {key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, (str) => str.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="mb-4 flex gap-2">
          <Button onClick={onStreaming}>Start Streaming</Button>

          <Button onClick={() => (isPauseRef.current = !isPauseRef.current)}>
            {isPauseRef.current ? 'Resume' : 'Pause'}
          </Button>

          <Button
            onClick={() => {
              if (activeIndex > 0) {
                editor.tf.setValue([]);

                editor.setOption(AIChatPlugin, 'streaming', false);
                editor.setOption(AIChatPlugin, '_blockChunks', '');
                editor.setOption(AIChatPlugin, '_blockPath', null);

                for (const chunk of transformedCurrentChunks.slice(
                  0,
                  activeIndex - 1
                )) {
                  streamInsertChunk(editor, chunk.chunk, {
                    textProps: {
                      [getPluginType(editor, KEYS.ai)]: true,
                    },
                  });
                }
                setActiveIndex((prev) => Math.max(0, prev - 1));
              }
            }}
          >
            Prev
          </Button>

          <Button
            onClick={() => {
              if (activeIndex < transformedCurrentChunks.length) {
                editor.tf.setValue([]);

                editor.setOption(AIChatPlugin, 'streaming', false);
                editor.setOption(AIChatPlugin, '_blockChunks', '');
                editor.setOption(AIChatPlugin, '_blockPath', null);

                for (const chunk of transformedCurrentChunks.slice(
                  0,
                  activeIndex + 1
                )) {
                  streamInsertChunk(editor, chunk.chunk, {
                    textProps: {
                      [getPluginType(editor, KEYS.ai)]: true,
                    },
                  });
                }
                setActiveIndex((prev) =>
                  Math.min(transformedCurrentChunks.length, prev + 1)
                );
              }
            }}
          >
            Next
          </Button>

          <Button
            onClick={() => {
              editor.setOption(AIChatPlugin, 'streaming', false);
              editor.setOption(AIChatPlugin, '_blockChunks', '');
              editor.setOption(AIChatPlugin, '_blockPath', null);

              streamInsertChunk(editor, 'test', {
                textProps: {
                  [getPluginType(editor, KEYS.ai)]: true,
                },
              });
            }}
          >
            Test Button
          </Button>
        </div>
      </div>

      <div className="my-2 flex gap-10">
        <div className="w-1/2">
          <h3 className="mb-2 font-semibold">
            Transformed Chunks ({activeIndex}/{transformedCurrentChunks.length})
          </h3>
          <Tokens
            activeIndex={activeIndex}
            chunks={splitChunksByLinebreak(
              transformedCurrentChunks.map((c) => c.chunk)
            )}
          />
        </div>

        <div className="w-1/2">
          <h3 className="mb-2 font-semibold">Editor Output</h3>
          <Plate editor={editor}>
            <EditorContainer className="h-[500px] overflow-y-auto rounded border">
              <Editor
                variant="demo"
                className="pb-[20vh]"
                placeholder="Type something..."
                spellCheck={false}
              />
            </EditorContainer>
          </Plate>
        </div>
      </div>

      <h2 className="mt-8 mb-4 text-xl font-semibold">Raw Token Comparison</h2>
      <div className="my-2 flex gap-10">
        <div className="w-1/2">
          <h3 className="mb-2 font-semibold">Original Chunks</h3>
          <Tokens
            activeIndex={0}
            chunks={splitChunksByLinebreak(currentChunks)}
          />
        </div>

        <div className="w-1/2">
          <h3 className="mb-2 font-semibold">Raw Markdown Text</h3>
          <textarea
            className={cn(
              'h-[500px] w-full overflow-y-auto rounded border p-4 font-mono text-sm'
            )}
            readOnly
            value={currentChunks.join('')}
          />
        </div>
      </div>
    </section>
  );
};

type TChunks = {
  chunks: {
    index: number;
    text: string;
  }[];
  linebreaks: number;
};

function splitChunksByLinebreak(chunks: string[]) {
  const result: TChunks[] = [];
  let current: { index: number; text: string }[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    current.push({ index: i, text: chunk });

    const match = /(\n+)$/.exec(chunk);
    if (match) {
      const linebreaks = match[1].length;
      result.push({
        chunks: [...current],
        linebreaks,
      });
      current = [];
    }
  }

  if (current.length > 0) {
    result.push({
      chunks: [...current],
      linebreaks: 0,
    });
  }

  return result;
}

type TChunk = { chunk: string; delayInMs: number };
const transformedChunks = (chunks: string[]): TChunk[] => {
  const result: TChunk[] = [];
  const joiner = new MarkdownJoiner();
  for (const chunk of chunks) {
    const processed = joiner.processText(chunk);
    if (processed) {
      result.push({ chunk: processed, delayInMs: joiner.delayInMs });
    }
  }
  // flush any remaining buffered content
  const remaining = joiner.flush();
  if (remaining) {
    result.push({ chunk: remaining, delayInMs: joiner.delayInMs });
  }
  return result;
};

const Tokens = ({
  activeIndex,
  chunks,
  ...props
}: {
  activeIndex: number;
  chunks: TChunks[];
} & HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className="my-1 h-[500px] overflow-y-auto rounded bg-gray-100 p-4 font-mono"
      {...props}
    >
      {chunks.map((chunk, index) => {
        return (
          <div key={index} className="py-1">
            {chunk.chunks.map((c, j) => {
              const lineBreak = c.text.replaceAll('\n', '⤶');
              const space = lineBreak.replaceAll(' ', '␣');

              return (
                <span
                  key={j}
                  className={cn(
                    'mx-1 inline-block rounded border p-1',
                    activeIndex && c.index < activeIndex && 'bg-amber-500'
                  )}
                >
                  {space}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
