'use client';
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
} from 'lucide-react';
import type { EditorDocumentValue } from 'platejs';
import { AIChatPlugin } from 'platejs/ai/react';
import { Plate, useCreateEditor } from 'platejs/react';
import React, {
  type HTMLAttributes,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Editor,
  EditorContainer,
  EditorView,
} from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { MarkdownJoiner } from '@/registry/lib/markdown-joiner-transform';

import { BaseEditorRenderers } from '../components/editor/plugins-static';

const CAPITALIZE_REGEX = /([A-Z])/g;
const FIRST_CHAR_REGEX = /^./;
const TRAILING_NEWLINES_REGEX = /(\n+)$/;

const testScenarios = {
  // Basic markdown with complete elements
  columns: [
    'paragraph\n\n<column',
    'Group',
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
    'Group',
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
    '| %%PLITE_JS%%                                     ',
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

export default function MarkdownStreamingDemo() {
  const [selectedScenario, setSelectedScenario] =
    useState<keyof typeof testScenarios>('columns');
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const pausedRef = useRef(false);
  const [paused, setPaused] = useState(false);
  const streamSessionRef = useRef(0);
  const [staticValue, setStaticValue] = useState<EditorDocumentValue>({
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
  });
  const [streaming, setStreaming] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [isPlateStatic, setIsPlateStatic] = useState(false);
  const [speed, setSpeed] = useState<number | null>(null);

  const editor = useCreateEditor(
    {
      plugins: EditorKit,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    },
    []
  );
  const aiChat = editor.plugin(AIChatPlugin);
  const requestRef = useRef<number | undefined>(undefined);

  const currentChunks = testScenarios[selectedScenario];
  const transformedCurrentChunks = transformedChunks(currentChunks);

  const setPausedState = useCallback((nextPaused: boolean) => {
    pausedRef.current = nextPaused;
    setPaused(nextPaused);
  }, []);

  // Every action owns a generation; an older async loop must never write again.
  const cancel = useCallback(() => {
    streamSessionRef.current += 1;
    setStreaming(false);
    setPausedState(false);
  }, [setPausedState]);

  useEffect(
    () => () => {
      streamSessionRef.current += 1;
      pausedRef.current = false;
    },
    []
  );

  const reset = () => {
    cancel();
    setPlaybackError(null);
    setActiveIndex(0);
    editor.update.value.replace({ children: [] });
    setStaticValue({
      children: [{ type: 'paragraph', children: [{ text: '' }] }],
    });
    aiChat.api.reset();
    editor.update((tx) => {
      const point = tx.points.start([0]);
      if (point) tx.selection.set({ anchor: point, focus: point });
    });
    requestRef.current = aiChat.api.start({
      mode: 'insert',
      toolName: 'generate',
    });
  };

  const applyChunk = (index: number) => {
    if (isPlateStatic) {
      const source = transformedCurrentChunks
        .slice(0, index + 1)
        .map(({ chunk }) => chunk)
        .join('');
      const value = editor.api.markdown.deserialize(source);
      const assertDocument: (value: EditorDocumentValue) => void =
        editor.read.schema.assertDocument;
      assertDocument(value);
      setStaticValue(value);
    } else {
      const id = requestRef.current;
      if (id === undefined) {
        throw new Error('The demo has no active AI request.');
      }
      aiChat.api.receive(
        id,
        transformedCurrentChunks
          .slice(0, index + 1)
          .map(({ chunk }) => chunk)
          .join('')
      );
      const operation = aiChat.store.get('operation');
      if (operation?.error) throw new Error(operation.error);
    }
    setActiveIndex(index + 1);
  };

  const reportError = (cause: unknown, index: number) => {
    setPlaybackError(
      `${selectedScenario}, chunk ${index + 1}: ${
        cause instanceof Error ? cause.message : String(cause)
      }`
    );
    cancel();
  };

  const onStreaming = async () => {
    reset();
    const sessionId = streamSessionRef.current;
    setStreaming(true);
    for (let index = 0; index < transformedCurrentChunks.length; index++) {
      while (pausedRef.current && sessionId === streamSessionRef.current) {
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }
      if (sessionId !== streamSessionRef.current) return;
      try {
        applyChunk(index);
      } catch (error) {
        reportError(error, index);
        return;
      }
      await new Promise((resolve) => {
        setTimeout(resolve, speed ?? transformedCurrentChunks[index].delayInMs);
      });
    }
    if (sessionId === streamSessionRef.current) {
      setStreaming(false);
      if (requestRef.current !== undefined) {
        aiChat.api.finish(requestRef.current);
      }
    }
  };

  const onNavigate = (targetIndex: number) => {
    if (targetIndex < 0 || targetIndex > transformedCurrentChunks.length) {
      return;
    }
    reset();
    for (let index = 0; index < targetIndex; index++) {
      try {
        applyChunk(index);
      } catch (error) {
        reportError(error, index);
        return;
      }
    }
  };

  const onPrev = () => {
    onNavigate(activeIndex - 1);
  };
  const onNext = () => {
    onNavigate(activeIndex + 1);
  };

  return (
    <section className="h-full overflow-y-auto p-20">
      <div className="mb-10 rounded bg-gray-100 p-4">
        {/* Scenario Selection */}
        <div className="mb-4">
          <span className="mb-2 block text-sm font-medium">Test Scenario:</span>
          <select
            aria-label="Test scenario"
            className="w-64 rounded border px-3 py-2"
            value={selectedScenario}
            onChange={(e) => {
              setSelectedScenario(e.target.value as keyof typeof testScenarios);
              reset();
            }}
          >
            {Object.entries(testScenarios).map(([key]) => (
              <option key={key} value={key}>
                {key
                  .replace(CAPITALIZE_REGEX, ' $1')
                  .replace(FIRST_CHAR_REGEX, (str) => str.toUpperCase())}
              </option>
            ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="mb-4 flex items-center gap-2">
          <Button aria-label="Previous chunk" onClick={onPrev}>
            <ChevronFirstIcon />
          </Button>

          <Button
            aria-label={
              streaming && !paused ? 'Pause' : paused ? 'Resume' : 'Play'
            }
            onClick={() => {
              if (streaming) {
                setPausedState(!pausedRef.current);
              } else {
                void onStreaming();
              }
            }}
          >
            {paused || !streaming ? <PlayIcon /> : <PauseIcon />}
          </Button>

          <Button aria-label="Next chunk" onClick={onNext}>
            <ChevronLastIcon />
          </Button>

          <Button aria-label="Reset" onClick={reset}>
            <RotateCcwIcon />
          </Button>

          <Button
            onClick={() => {
              setIsPlateStatic(!isPlateStatic);
              reset();
            }}
          >
            Switch to {isPlateStatic ? 'Plate' : 'PlateStatic'}
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <span className="block text-sm font-medium">Speed:</span>
          <select
            aria-label="Playback speed"
            className="rounded border px-2 py-1"
            value={speed ?? 'default'}
            onChange={(e) => {
              setSpeed(
                e.target.value === 'default' ? null : Number(e.target.value)
              );
            }}
          >
            {['default', 10, 100, 200].map((ms) => (
              <option key={ms} value={ms}>
                {ms === 'default'
                  ? 'Default'
                  : ms === 10
                    ? 'Fast(10ms)'
                    : ms === 100
                      ? 'Medium(100ms)'
                      : ms === 200
                        ? 'Slow(200ms)'
                        : `${ms}ms`}
              </option>
            ))}
          </select>
          <span className="text-sm text-muted-foreground">
            The default speed is 10ms, but it adjusts to 100ms when streaming a
            table or code block.
          </span>
        </div>

        <div className="my-4 h-2 w-full rounded bg-gray-200">
          <div
            className="h-2 rounded bg-primary transition-all duration-300"
            style={{
              width: `${(activeIndex / (transformedCurrentChunks.length || 1)) * 100}%`,
            }}
          />
        </div>

        <span className="text-sm text-muted-foreground">
          Plate uses the AI streaming adapter. PlateStatic parses the complete
          accumulated Markdown at each step.
        </span>
      </div>

      {playbackError && (
        <p role="alert" className="text-destructive">
          {playbackError}
        </p>
      )}

      <div className="my-2 flex gap-10">
        <div className="w-1/2">
          <h3 className="mb-2 font-semibold">
            Transformed Chunks ({activeIndex}/{transformedCurrentChunks.length})
          </h3>
          <Tokens
            activeIndex={activeIndex}
            chunkClick={onNavigate}
            chunks={splitChunksByLinebreak(
              transformedCurrentChunks.map((c) => c.chunk)
            )}
          />
        </div>

        <div className="w-1/2">
          <h3 className="mb-2 font-semibold">Editor Output</h3>
          {isPlateStatic ? (
            <EditorView
              className="h-[500px] overflow-y-auto rounded border"
              editor={editor}
              value={staticValue}
              renderers={BaseEditorRenderers}
            />
          ) : (
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
          )}
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
}

type TChunks = {
  chunks: Array<{
    index: number;
    text: string;
  }>;
  linebreaks: number;
};

function splitChunksByLinebreak(chunks: string[]) {
  const result: TChunks[] = [];
  let current: Array<{ index: number; text: string }> = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    current.push({ index: i, text: chunk });

    const match = TRAILING_NEWLINES_REGEX.exec(chunk);
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
  chunkClick,
  chunks,
  ...props
}: {
  activeIndex: number;
  chunks: TChunks[];
  chunkClick?: (index: number) => void;
} & HTMLAttributes<HTMLDivElement>) => (
  <div
    className="my-1 h-[500px] overflow-y-auto rounded bg-gray-100 p-4 font-mono"
    {...props}
  >
    {chunks.map((chunk) => (
      <div key={chunk.chunks[0]?.index ?? 'empty'} className="py-1">
        {chunk.chunks.map((c) => {
          const lineBreak = c.text.replaceAll('\n', '⤶');
          const space = lineBreak.replaceAll(' ', '␣');

          return (
            <button
              key={c.index}
              className={cn(
                'mx-1 inline-block rounded border p-1',
                activeIndex && c.index < activeIndex && 'bg-amber-400'
              )}
              onClick={() => chunkClick?.(c.index + 1)}
              type="button"
            >
              {space}
            </button>
          );
        })}
      </div>
    ))}
  </div>
);
