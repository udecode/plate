'use client';
import {
  ChevronFirstIcon,
  ChevronLastIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  SquareIcon,
} from 'lucide-react';
import {
  type Descendant,
  type Editor as PlateEditor,
  type EditorDocumentValue,
  type Element as PlateElement,
  ElementApi,
} from 'platejs';
import type { MarkdownSliceParseResult } from 'platejs/markdown';
import { EditorRoot, useCreateEditor, useStaticEditor } from 'platejs/react';
import {
  type HTMLAttributes,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AlignKit } from '@/registry/components/editor/align';
import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { BasicMarksKit } from '@/registry/components/editor/basic-marks';
import { CalloutKit } from '@/registry/components/editor/callout';
import { CodeBlockKit } from '@/registry/components/editor/code-block';
import { ColumnKit } from '@/registry/components/editor/column';
import { DateKit } from '@/registry/components/editor/date';
import { DetailsKit } from '@/registry/components/editor/details';
import { DndKit } from '@/registry/components/editor/dnd';
import {
  Editor,
  EditorContainer,
  EditorFrame,
  EditorView,
} from '@/registry/components/editor/editor';
import { FontKit } from '@/registry/components/editor/font';
import { FootnoteKit } from '@/registry/components/editor/footnote';
import { LineHeightKit } from '@/registry/components/editor/line-height';
import { LinkKit } from '@/registry/components/editor/link';
import { ListKit } from '@/registry/components/editor/list';
import { MarkdownKit } from '@/registry/components/editor/markdown';
import { MathKit } from '@/registry/components/editor/math';
import { MediaKit } from '@/registry/components/editor/media';
import { MentionKit } from '@/registry/components/editor/mention';
import { TableKit } from '@/registry/components/editor/table';
import { TocKit } from '@/registry/components/editor/toc';

import { BaseEditorKit } from '../components/editor/plugins-static';

// The editable preview holds streamed content only, like the static one. AI
// and suggestions record every node write as an authored change, so a preview
// editor with them could only replace its whole value. Columns, media and
// tables render drag handles, which need DndKit.
const PreviewKit = [
  ...DndKit,
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...DetailsKit,
  ...TocKit,
  ...MediaKit,
  ...CalloutKit,
  ...ColumnKit,
  ...MathKit,
  ...DateKit,
  ...LinkKit,
  ...MentionKit,
  ...FootnoteKit,
  ...BasicMarksKit,
  ...FontKit,
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,
  ...MarkdownKit,
] as const;

const CAPITALIZE_REGEX = /([A-Z])/g;
const FIRST_CHAR_REGEX = /^./;
const TRAILING_NEWLINES_REGEX = /(\n+)$/;
const WORD_REGEX = /\S+\s*|\s+/g;

const scenarios = {
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
    '| %%EDITOR%%                                       ',
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

type Scenario = keyof typeof scenarios | 'custom';
type StreamStatus = 'finished' | 'idle' | 'paused' | 'stopped' | 'streaming';

// One streamed response. The demo owns its source, abort signal, preview
// cadence and parse hint; the Markdown API only parses the accumulated draft.
type Stream = {
  controller: AbortController;
  draft: string;
  /** The latest partial result, which the next preview continues. */
  previous: MarkdownSliceParseResult | undefined;
  published: boolean;
  timer: ReturnType<typeof setTimeout> | null;
};

const statusLabels: Record<StreamStatus, string> = {
  finished: 'Finished: strict parse',
  idle: 'Ready',
  paused: 'Paused: partial preview',
  stopped: 'Stopped: strict parse',
  streaming: 'Streaming: partial preview',
};

export default function MarkdownStreamingDemo() {
  const [scenario, setScenario] = useState<Scenario>('columns');
  const [source, setSource] = useState(() => scenarios.columns.join(''));
  // 0 streams the recorded tokens, or words for custom source.
  const [chunkSize, setChunkSize] = useState(0);
  const [delay, setDelay] = useState(10);
  const [preview, setPreview] = useState<'editable' | 'static'>('editable');
  const [position, setPosition] = useState(0);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<Stream | null>(null);
  const published = useRef<readonly Descendant[]>([]);
  const pausedRef = useRef(false);
  const delayRef = useRef(delay);

  const editor = useCreateEditor(
    {
      plugins: PreviewKit,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    },
    []
  );
  const editorStatic = useStaticEditor(
    {
      plugins: BaseEditorKit,
    },
    []
  );
  // The static preview renders each parse as a document; nothing is edited.
  const [staticDocument, setStaticDocument] = useState<EditorDocumentValue>();
  const latestOutput = useMemo(
    () => ({ document: staticDocument, error, status }),
    [staticDocument, error, status]
  );
  // A static render that falls behind the stream skips to the latest parse.
  // The status and error describe the rendered parse, so they come from the
  // same deferred state. The editable preview edits its editor at once.
  const deferredOutput = useDeferredValue(latestOutput);
  const output = preview === 'static' ? deferredOutput : latestOutput;
  // Rendering reads every block's decorations, so the static output renders
  // only for a new parse, not for chunk arrivals or each parse's urgent pass.
  const staticOutput = useMemo(
    () => (
      <EditorView
        className="h-[500px] overflow-y-auto rounded border"
        document={output.document}
        editor={editorStatic}
      />
    ),
    [editorStatic, output.document]
  );

  const chunks = useMemo(() => {
    if (chunkSize > 0) {
      const characters = Array.from(source);

      return Array.from(
        { length: Math.ceil(characters.length / chunkSize) },
        (_, index) =>
          characters.slice(index * chunkSize, (index + 1) * chunkSize).join('')
      );
    }

    return scenario === 'custom'
      ? (source.match(WORD_REGEX) ?? [])
      : scenarios[scenario];
  }, [chunkSize, scenario, source]);

  useEffect(() => () => cancelStream(streamRef), []);

  // Previews parse the unfinished prefix and the final parse is strict. Both
  // continue the stream's latest preview and publish outside the undo history.
  const publish = (
    draft: string,
    final: boolean,
    previous?: MarkdownSliceParseResult
  ) => {
    const target = preview === 'static' ? editorStatic : editor;
    const result = target.api.markdown.parseSlice(
      draft,
      final ? { previous } : { lossPolicy: 'allow', partial: true, previous }
    );
    const nodes: readonly Descendant[] = result.ok ? result.slice.content : [];

    if (preview === 'static') {
      // Parsed slices hold top-level blocks.
      const blocks = nodes.filter((node): node is PlateElement =>
        ElementApi.isElement(node)
      );

      setStaticDocument(blocks.length > 0 ? { children: blocks } : undefined);
    } else {
      splice(editor, published.current, nodes);
      published.current = nodes;
    }
    setError(result.ok ? null : result.diagnostics[0].message);

    return result.ok ? result : undefined;
  };

  const cancel = () => {
    cancelStream(streamRef);
    pausedRef.current = false;
  };

  // Finish and deliberate stop parse the current draft once, strictly.
  const finalize = (stream: Stream, nextStatus: 'finished' | 'stopped') => {
    if (streamRef.current !== stream) return;
    const { previous } = stream;

    cancel();
    publish(stream.draft, true, previous);
    setStatus(nextStatus);
  };

  const reset = () => {
    cancel();
    editor.update({ history: 'skip' }).value.replace({ children: [] });
    setStaticDocument(undefined);
    published.current = [];
    setPosition(0);
    setStatus('idle');
    setError(null);
  };

  const run = async (from: number) => {
    cancel();

    const stream: Stream = {
      controller: new AbortController(),
      draft: chunks.slice(0, from).join(''),
      previous: undefined,
      published: false,
      timer: null,
    };
    const { signal } = stream.controller;
    const publishPreview = () => {
      stream.timer = null;
      if (!signal.aborted) {
        stream.previous = publish(stream.draft, false, stream.previous);
      }
    };

    streamRef.current = stream;
    setStatus('streaming');
    setError(null);

    for (let index = from; index < chunks.length; index++) {
      if (index > from) await waitForChunk(delayRef.current, signal);
      while (pausedRef.current && !signal.aborted) {
        await waitForChunk(100, signal);
      }
      if (signal.aborted) return;

      stream.draft += chunks[index];
      setPosition(index + 1);
      // Publish the first chunk at once, then the latest draft every 32 ms.
      if (stream.published) {
        stream.timer ??= setTimeout(publishPreview, 32);
      } else {
        stream.published = true;
        publishPreview();
      }
    }

    finalize(stream, 'finished');
  };

  const stop = () => {
    const stream = streamRef.current;

    if (stream) finalize(stream, 'stopped');
  };

  // Moving to a chunk replaces the stream with that prefix. The complete
  // source takes the strict parse.
  const navigate = (index: number) => {
    if (index < 0 || index > chunks.length) return;

    const complete = index === chunks.length;

    cancel();
    publish(chunks.slice(0, index).join(''), complete);
    setPosition(index);
    setStatus(complete ? 'finished' : 'idle');
  };

  const onPlay = () => {
    if (status === 'streaming') {
      pausedRef.current = true;
      setStatus('paused');
    } else if (status === 'paused') {
      pausedRef.current = false;
      setStatus('streaming');
    } else {
      void run(status === 'idle' && position < chunks.length ? position : 0);
    }
  };

  const active = status === 'streaming' || status === 'paused';

  return (
    <section className="h-full overflow-y-auto p-20">
      <div className="mb-10 rounded bg-gray-100 p-4">
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Scenario:</span>
            <select
              aria-label="Scenario"
              className="w-64 rounded border px-3 py-2"
              value={scenario}
              onChange={(e) => {
                const next = e.target.value as Scenario;

                reset();
                setScenario(next);
                if (next !== 'custom') setSource(scenarios[next].join(''));
              }}
            >
              {Object.keys(scenarios).map((key) => (
                <option key={key} value={key}>
                  {key
                    .replace(CAPITALIZE_REGEX, ' $1')
                    .replace(FIRST_CHAR_REGEX, (str) => str.toUpperCase())}
                </option>
              ))}
              {scenario === 'custom' && <option value="custom">Custom</option>}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Chunks:</span>
            <select
              aria-label="Chunk size"
              className="rounded border px-2 py-1"
              value={chunkSize}
              onChange={(e) => {
                reset();
                setChunkSize(Number(e.target.value));
              }}
            >
              <option value={0}>
                {scenario === 'custom' ? 'Words' : 'Recorded tokens'}
              </option>
              {[16, 64, 256].map((size) => (
                <option key={size} value={size}>
                  {size} characters
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Delay:</span>
            <select
              aria-label="Chunk delay"
              className="rounded border px-2 py-1"
              value={delay}
              onChange={(e) => {
                delayRef.current = Number(e.target.value);
                setDelay(delayRef.current);
              }}
            >
              {[10, 50, 100, 200].map((ms) => (
                <option key={ms} value={ms}>
                  {ms} ms
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Preview:</span>
            <select
              aria-label="Preview"
              className="rounded border px-2 py-1"
              value={preview}
              onChange={(e) => {
                reset();
                setPreview(e.target.value === 'static' ? 'static' : 'editable');
              }}
            >
              <option value="editable">Editable</option>
              <option value="static">Static</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Button
            aria-label="Previous chunk"
            onClick={() => navigate(position - 1)}
          >
            <ChevronFirstIcon />
          </Button>

          <Button
            aria-label={
              status === 'streaming'
                ? 'Pause streaming'
                : status === 'paused'
                  ? 'Resume streaming'
                  : 'Start streaming'
            }
            onClick={onPlay}
          >
            {status === 'streaming' ? <PauseIcon /> : <PlayIcon />}
          </Button>

          <Button aria-label="Stop streaming" disabled={!active} onClick={stop}>
            <SquareIcon />
          </Button>

          <Button
            aria-label="Next chunk"
            onClick={() => navigate(position + 1)}
          >
            <ChevronLastIcon />
          </Button>

          <Button aria-label="Reset streaming" onClick={reset}>
            <RotateCcwIcon />
          </Button>
        </div>

        <p className="text-sm text-muted-foreground">
          Previews publish the first chunk at once, then the latest draft every
          32 ms, each continuing the previous partial parse. Finishing or
          stopping parses the draft strictly; reset and other changes cancel the
          stream without a final parse.
        </p>

        <div className="my-4 h-2 w-full rounded bg-gray-200">
          <div
            className="h-2 rounded bg-primary transition-all duration-300"
            style={{
              width: `${(position / (chunks.length || 1)) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="my-2 flex gap-10">
        <div className="w-1/2">
          <h3 className="mb-2 font-semibold">
            Chunks ({position}/{chunks.length})
          </h3>
          <Tokens
            activeIndex={position}
            chunkClick={navigate}
            chunks={splitChunksByLinebreak(chunks)}
          />
        </div>

        <div className="w-1/2">
          <h3 className="mb-2 font-semibold">Editor Output</h3>
          <p
            className="mb-2 text-sm text-muted-foreground"
            data-stream-status={output.status}
          >
            {statusLabels[output.status]}
          </p>
          {output.error && (
            <p className="mb-2 text-sm text-destructive" data-stream-error="">
              {output.error}
            </p>
          )}
          {preview === 'static' ? (
            staticOutput
          ) : (
            <EditorRoot editor={editor}>
              <EditorFrame className="h-[500px] rounded border">
                <EditorContainer>
                  <Editor
                    variant="demo"
                    className="pb-[20vh]"
                    placeholder="Type something..."
                    spellCheck={false}
                  />
                </EditorContainer>
              </EditorFrame>
            </EditorRoot>
          )}
        </div>
      </div>

      <h2 className="mt-8 mb-4 text-xl font-semibold">Markdown Source</h2>
      <textarea
        aria-label="Markdown source"
        className="h-[300px] w-full overflow-y-auto rounded border p-4 font-mono text-sm"
        spellCheck={false}
        value={source}
        onChange={(e) => {
          reset();
          setScenario('custom');
          setSource(e.target.value);
        }}
      />
    </section>
  );
}

// The editable preview is a live editor, so each parse is an edit. A continued
// parse returns unchanged leading blocks as the same objects: keep them and
// replace only the tail. With nothing shared, replacing the value is cheaper.
function splice(
  editor: PlateEditor,
  published: readonly Descendant[],
  nodes: readonly Descendant[]
) {
  let start = 0;

  while (start < nodes.length && published[start] === nodes[start]) {
    start += 1;
  }
  if (start === 0) {
    editor.update({ history: 'skip' }).value.replace({ children: nodes });
  } else {
    editor.update({ history: 'skip' }, (tx) => {
      tx.nodes.replaceChildren(nodes.slice(start), { at: [], index: start });
    });
  }
}

// Cancel, replacement and unmount abort arrivals and drop the pending
// preview and the parse hint. Nothing is parsed or published.
function cancelStream(streamRef: { current: Stream | null }) {
  const stream = streamRef.current;

  streamRef.current = null;
  if (!stream) return;
  stream.controller.abort();
  stream.previous = undefined;
  if (stream.timer) clearTimeout(stream.timer);
}

function waitForChunk(delay: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const timeout = setTimeout(done, delay);
    function done() {
      clearTimeout(timeout);
      signal.removeEventListener('abort', done);
      resolve();
    }
    signal.addEventListener('abort', done, { once: true });
  });
}

type TChunks = {
  chunks: Array<{
    index: number;
    text: string;
  }>;
  linebreaks: number;
};

function splitChunksByLinebreak(chunks: readonly string[]) {
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
