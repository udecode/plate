'use client';

import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { AIChatPlugin, streamInsertChunk } from '@platejs/ai/react';
import { getPluginType, KEYS } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { models } from '@/registry/components/editor/settings-dialog';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { MarkdownJoiner } from '@/registry/lib/markdown-joiner-transform';
import {
  DEFAULT_PLAYBACK_BURST_SIZE,
  DEFAULT_PLAYBACK_DELAY_IN_MS,
  getNextPlaybackIndex,
  getPlaybackDelayInMs,
  liveMarkdownEditorsArticleChunks,
  playbackBurstSizeOptions,
  playbackDelayOptions,
} from '@/registry/lib/markdown-streaming-demo-data';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const CAPITALIZE_REGEX = /([A-Z])/g;
const FIRST_CHAR_REGEX = /^./;
const COPY_FEEDBACK_DURATION_MS = 1800;
const DEFAULT_AI_MODEL = 'openai/gpt-4.1-mini';
const DEFAULT_AI_PROMPT =
  'Write a markdown article about streaming markdown editors with headings, bullet lists, a table, one blockquote, one link, and one fenced code block.';
const EMPTY_EDITOR_VALUE = [
  {
    children: [{ text: '' }],
    type: 'p',
  },
] as const;

const testScenarios = {
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
  liveMarkdownEditorsArticle: liveMarkdownEditorsArticleChunks,
} as const;

type ScenarioId = keyof typeof testScenarios;
type SourceMode = 'preset' | 'ai' | 'pasted';
type AiStreamStatus = 'idle' | 'loading' | 'streaming' | 'done' | 'error';
type TChunk = { chunk: string; delayInMs: number };
type AppliedStreamingState = {
  appliedCount: number;
  prefixMarkdown: string;
  sourceIdentity: string;
  streamedChunks: string[];
};

type EditorRenderBoundaryProps = {
  children: ReactNode;
  currentChunkLabel: string;
  onReset: () => void;
  resetKey: string;
};

type EditorRenderBoundaryState = {
  errorMessage: string | null;
};

class EditorRenderBoundary extends Component<
  EditorRenderBoundaryProps,
  EditorRenderBoundaryState
> {
  state: EditorRenderBoundaryState = {
    errorMessage: null,
  };

  static getDerivedStateFromError(error: unknown): EditorRenderBoundaryState {
    return {
      errorMessage:
        error instanceof Error ? error.message : 'Unknown editor render error.',
    };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error('Streaming demo editor crashed.', error, info);
  }

  componentDidUpdate(previousProps: EditorRenderBoundaryProps) {
    if (
      this.state.errorMessage &&
      previousProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ errorMessage: null });
    }
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <div className="flex h-full items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="space-y-3 text-red-900 text-sm">
            <strong className="block text-base">Editor output crashed</strong>
            <p>{this.state.errorMessage}</p>
            <p>Current chunk: {this.props.currentChunkLabel}</p>
            <Button
              type="button"
              variant="outline"
              onClick={this.props.onReset}
            >
              Reset editor pane
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function formatScenarioLabel(value: string) {
  return value
    .replace(CAPITALIZE_REGEX, ' $1')
    .replace(FIRST_CHAR_REGEX, (character) => character.toUpperCase());
}

function summarizeChunk(chunk: string) {
  if (chunk.length === 0) return '(empty)';

  return chunk
    .replaceAll('\n', '\\n')
    .replaceAll('\t', '\\t')
    .replaceAll(' ', '·');
}

function serializeChunksForClipboard(chunks: readonly string[]) {
  return JSON.stringify(chunks, null, 2);
}

function parseSerializedChunks(source: string) {
  const parsed = JSON.parse(source) as unknown;

  if (
    !Array.isArray(parsed) ||
    parsed.some((chunk) => typeof chunk !== 'string')
  ) {
    throw new Error('Chunks must be a JSON array of strings.');
  }

  return [...parsed];
}

function cloneEditorValue() {
  return JSON.parse(JSON.stringify(EMPTY_EDITOR_VALUE));
}

function resetStreamingState(editor: any) {
  editor.setOption(AIChatPlugin, 'streaming', false);
  editor.setOption(AIChatPlugin, '_blockChunks', '');
  editor.setOption(AIChatPlugin, '_blockPath', null);
  editor.setOption(AIChatPlugin, '_mdxName', null);

  if (editor.selection) {
    editor.tf.deselect();
  }

  editor.tf.setValue(cloneEditorValue());
}

function applyChunk(editor: any, chunk: string) {
  streamInsertChunk(editor, chunk, {
    textProps: {
      [getPluginType(editor, KEYS.ai)]: true,
    },
  });
}

function replayChunks(editor: any, chunks: string[], count: number) {
  resetStreamingState(editor);

  for (let index = 0; index < count; index += 1) {
    const chunk = chunks[index];

    if (!chunk) {
      break;
    }

    applyChunk(editor, chunk);
  }
}

function isChunkPrefix(
  previousChunks: readonly string[],
  nextChunks: readonly string[]
) {
  if (previousChunks.length > nextChunks.length) {
    return false;
  }

  return previousChunks.every((chunk, index) => chunk === nextChunks[index]);
}

function transformChunks(chunks: readonly string[]): TChunk[] {
  const result: TChunk[] = [];
  const joiner = new MarkdownJoiner();

  for (const chunk of chunks) {
    const processed = joiner.processText(chunk);

    if (processed) {
      result.push({ chunk: processed, delayInMs: joiner.delayInMs });
    }
  }

  const remaining = joiner.flush();

  if (remaining) {
    result.push({ chunk: remaining, delayInMs: joiner.delayInMs });
  }

  return result;
}

function encodeEditorTree(editorChildren: unknown) {
  return JSON.stringify(editorChildren, null, 2);
}

type ChunkChipListProps = {
  activeIndex: number;
  chunks: readonly TChunk[];
  onSelect: (index: number) => void;
};

function ChunkChipList({ activeIndex, chunks, onSelect }: ChunkChipListProps) {
  return (
    <div className="grid flex-1 auto-rows-min grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3 overflow-y-auto pr-1">
      {chunks.map(({ chunk }, index) => (
        <button
          key={index}
          type="button"
          className={cn(
            'min-h-20 rounded-2xl bg-slate-900 px-3 py-2 text-left text-slate-100 shadow-sm transition',
            index < activeIndex
              ? 'ring-2 ring-sky-400'
              : 'opacity-95 hover:opacity-100'
          )}
          onClick={() => onSelect(index + 1)}
        >
          <span className="mb-2 block text-slate-400 text-xs">
            #{index + 1}
          </span>
          <code className="block whitespace-pre-wrap break-all font-mono text-sm">
            {summarizeChunk(chunk)}
          </code>
        </button>
      ))}
    </div>
  );
}

function InfoCard({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: ReactNode;
  title: string;
}) {
  return (
    <section className="flex h-[700px] min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 space-y-1">
        <h2 className="font-semibold text-2xl text-slate-900">{title}</h2>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </section>
  );
}

export const MarkdownStreamDemo = () => {
  const [selectedScenario, setSelectedScenario] =
    useState<ScenarioId>('columns');
  const [sourceMode, setSourceMode] = useState<SourceMode>('preset');
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackBurstSize, setPlaybackBurstSize] = useState(
    DEFAULT_PLAYBACK_BURST_SIZE
  );
  const [playbackDelayInMs, setPlaybackDelayInMs] = useState(
    DEFAULT_PLAYBACK_DELAY_IN_MS
  );
  const [treeJson, setTreeJson] = useState(
    encodeEditorTree(EMPTY_EDITOR_VALUE)
  );
  const [aiPrompt, setAiPrompt] = useState(DEFAULT_AI_PROMPT);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_AI_MODEL);
  const [aiRawChunks, setAiRawChunks] = useState<string[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiStatus, setAiStatus] = useState<AiStreamStatus>('idle');
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [copyChunksStatus, setCopyChunksStatus] = useState<
    'idle' | 'copied' | 'error'
  >('idle');
  const [pasteChunksStatus, setPasteChunksStatus] = useState<
    'idle' | 'loaded' | 'error'
  >('idle');
  const [pastedChunks, setPastedChunks] = useState<string[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const copyStatusTimerRef = useRef<number | null>(null);
  const pasteStatusTimerRef = useRef<number | null>(null);
  const appliedStreamingStateRef = useRef<AppliedStreamingState>({
    appliedCount: 0,
    prefixMarkdown: '',
    sourceIdentity: 'preset:columns',
    streamedChunks: [],
  });

  const editor = usePlateEditor(
    {
      plugins: [...CopilotKit, ...EditorKit],
      value: cloneEditorValue(),
    },
    []
  );

  const currentScenarioChunks = useMemo(
    () => testScenarios[selectedScenario],
    [selectedScenario]
  );

  const rawChunks = useMemo(() => {
    if (sourceMode === 'ai') {
      return aiRawChunks;
    }

    if (sourceMode === 'pasted') {
      return [];
    }

    return currentScenarioChunks;
  }, [aiRawChunks, currentScenarioChunks, sourceMode]);

  const transformedCurrentChunks = useMemo(() => {
    if (sourceMode === 'pasted') {
      return pastedChunks.map((chunk) => ({
        chunk,
        delayInMs: 0,
      }));
    }

    return transformChunks(rawChunks);
  }, [pastedChunks, rawChunks, sourceMode]);

  const currentMarkdown = useMemo(
    () =>
      transformedCurrentChunks
        .slice(0, activeIndex)
        .map((item) => item.chunk)
        .join(''),
    [activeIndex, transformedCurrentChunks]
  );

  const joinedChunkStrings = useMemo(
    () => transformedCurrentChunks.map((item) => item.chunk),
    [transformedCurrentChunks]
  );

  const currentSourceLabel =
    sourceMode === 'ai'
      ? aiStatus === 'idle'
        ? 'AI prompt'
        : 'Live AI stream'
      : sourceMode === 'pasted'
        ? 'Pasted chunks'
        : formatScenarioLabel(selectedScenario);
  const sourceIdentity =
    sourceMode === 'preset' ? `preset:${selectedScenario}` : sourceMode;
  const currentChunkLabel =
    activeIndex === 0 ? 'before first chunk' : `#${activeIndex}`;
  const editorBoundaryResetKey = `${sourceIdentity}:${activeIndex}`;

  function stopAiStream() {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }

  async function handleCopyChunks() {
    try {
      await navigator.clipboard.writeText(
        serializeChunksForClipboard(joinedChunkStrings)
      );
      setCopyChunksStatus('copied');
    } catch {
      setCopyChunksStatus('error');
    }
  }

  async function handlePasteChunks() {
    let initialValue = '';

    try {
      initialValue = await navigator.clipboard.readText();
    } catch {}

    const pastedValue = window.prompt(
      'Paste the chunk array exported from Copy chunks.',
      initialValue
    );

    if (pastedValue == null) {
      return;
    }

    try {
      const parsedChunks = parseSerializedChunks(pastedValue);

      stopAiStream();
      setSourceMode('pasted');
      setPastedChunks(parsedChunks);
      setAiStatus('idle');
      setAiError(null);
      setAiProvider(null);
      setIsPlaying(false);
      setActiveIndex(parsedChunks.length);
      setPasteChunksStatus('loaded');
    } catch (error) {
      setPasteChunksStatus('error');
      setAiError(
        error instanceof Error
          ? error.message
          : 'Failed to parse pasted chunks.'
      );
    }
  }

  function switchToPresetMode(nextScenario?: ScenarioId) {
    stopAiStream();
    setSourceMode('preset');
    setPastedChunks([]);
    setAiStatus('idle');
    setAiError(null);
    setAiProvider(null);
    setIsPlaying(false);
    setActiveIndex(0);

    if (nextScenario) {
      setSelectedScenario(nextScenario);
    }
  }

  async function handleGenerateAiStream() {
    const prompt = aiPrompt.trim();

    if (!prompt) {
      setAiError('Prompt is required.');
      return;
    }

    stopAiStream();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setSourceMode('ai');
    setAiError(null);
    setAiRawChunks([]);
    setAiStatus('loading');
    setAiProvider(null);
    setIsPlaying(false);
    setActiveIndex(0);
    resetStreamingState(editor);
    setTreeJson(encodeEditorTree(EMPTY_EDITOR_VALUE));

    try {
      const response = await fetch('/api/dev/markdown-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: selectedModel, prompt }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let message = `AI request failed with status ${response.status}.`;

        try {
          const payload = (await response.json()) as { error?: string };

          if (payload.error) {
            message = payload.error;
          }
        } catch {}

        throw new Error(message);
      }

      if (!response.body) {
        throw new Error('AI response did not include a stream body.');
      }

      setAiStatus('streaming');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const rawLine of lines) {
          const line = rawLine.trim();

          if (!line) {
            continue;
          }

          const event = JSON.parse(line) as {
            chunk?: string;
            error?: string;
            provider?: string;
            type: 'chunk' | 'done' | 'error';
          };

          if (event.type === 'chunk' && typeof event.chunk === 'string') {
            setAiRawChunks((previous) => [...previous, event.chunk!]);
          }

          if (typeof event.provider === 'string') {
            setAiProvider(event.provider);
          }

          if (event.type === 'error') {
            throw new Error(event.error ?? 'Unknown AI streaming error.');
          }

          if (event.type === 'done') {
            setAiStatus('done');
          }
        }
      }

      if (buffer.trim()) {
        const event = JSON.parse(buffer.trim()) as {
          chunk?: string;
          error?: string;
          provider?: string;
          type: 'chunk' | 'done' | 'error';
        };

        if (event.type === 'chunk' && typeof event.chunk === 'string') {
          setAiRawChunks((previous) => [...previous, event.chunk!]);
        }

        if (typeof event.provider === 'string') {
          setAiProvider(event.provider);
        }

        if (event.type === 'error') {
          throw new Error(event.error ?? 'Unknown AI streaming error.');
        }
      }

      setAiStatus((previous) =>
        previous === 'error' || previous === 'idle' ? previous : 'done'
      );
    } catch (error) {
      if (controller.signal.aborted) {
        setAiStatus((previous) =>
          previous === 'done'
            ? previous
            : aiRawChunks.length > 0
              ? 'done'
              : 'idle'
        );
        return;
      }

      setAiStatus('error');
      setAiError(error instanceof Error ? error.message : 'Unknown AI error.');
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }

  useEffect(
    () => () => {
      stopAiStream();

      if (copyStatusTimerRef.current != null) {
        window.clearTimeout(copyStatusTimerRef.current);
      }

      if (pasteStatusTimerRef.current != null) {
        window.clearTimeout(pasteStatusTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (copyChunksStatus === 'idle') return;

    if (copyStatusTimerRef.current != null) {
      window.clearTimeout(copyStatusTimerRef.current);
    }

    copyStatusTimerRef.current = window.setTimeout(() => {
      setCopyChunksStatus('idle');
      copyStatusTimerRef.current = null;
    }, COPY_FEEDBACK_DURATION_MS);

    return () => {
      if (copyStatusTimerRef.current != null) {
        window.clearTimeout(copyStatusTimerRef.current);
      }
    };
  }, [copyChunksStatus]);

  useEffect(() => {
    if (pasteChunksStatus === 'idle') return;

    if (pasteStatusTimerRef.current != null) {
      window.clearTimeout(pasteStatusTimerRef.current);
    }

    pasteStatusTimerRef.current = window.setTimeout(() => {
      setPasteChunksStatus('idle');
      pasteStatusTimerRef.current = null;
    }, COPY_FEEDBACK_DURATION_MS);

    return () => {
      if (pasteStatusTimerRef.current != null) {
        window.clearTimeout(pasteStatusTimerRef.current);
      }
    };
  }, [pasteChunksStatus]);

  useEffect(() => {
    const chunks = transformedCurrentChunks.map((item) => item.chunk);
    const appliedState = appliedStreamingStateRef.current;
    const needsReplay =
      appliedState.sourceIdentity !== sourceIdentity ||
      activeIndex < appliedState.appliedCount ||
      !isChunkPrefix(appliedState.streamedChunks, chunks);

    if (activeIndex === 0) {
      if (
        appliedState.appliedCount !== 0 ||
        appliedState.sourceIdentity !== sourceIdentity
      ) {
        resetStreamingState(editor);
        appliedStreamingStateRef.current = {
          appliedCount: 0,
          prefixMarkdown: '',
          sourceIdentity,
          streamedChunks: [],
        };
      }

      setTreeJson(encodeEditorTree(editor.children));
      return;
    }

    if (needsReplay) {
      replayChunks(editor, chunks, activeIndex);
      appliedStreamingStateRef.current = {
        appliedCount: activeIndex,
        prefixMarkdown: chunks.slice(0, activeIndex).join(''),
        sourceIdentity,
        streamedChunks: chunks.slice(0, activeIndex),
      };
      setTreeJson(encodeEditorTree(editor.children));
      return;
    }

    if (activeIndex > appliedState.appliedCount) {
      let prefixMarkdown = appliedState.prefixMarkdown;

      for (
        let index = appliedState.appliedCount;
        index < activeIndex;
        index += 1
      ) {
        const chunk = chunks[index];

        if (!chunk) {
          break;
        }

        prefixMarkdown += chunk;
        applyChunk(editor, chunk);
      }

      appliedStreamingStateRef.current = {
        appliedCount: activeIndex,
        prefixMarkdown,
        sourceIdentity,
        streamedChunks: chunks.slice(0, activeIndex),
      };
    }

    setTreeJson(encodeEditorTree(editor.children));
  }, [activeIndex, editor, sourceIdentity, transformedCurrentChunks]);

  useEffect(() => {
    if (sourceMode !== 'ai') return;
    if (aiStatus === 'idle' || aiStatus === 'error') return;

    setActiveIndex(transformedCurrentChunks.length);
  }, [aiStatus, sourceMode, transformedCurrentChunks.length]);

  useEffect(() => {
    if (!isPlaying) return;
    if (activeIndex >= transformedCurrentChunks.length) {
      setIsPlaying(false);
      return;
    }

    const timer = window.setTimeout(
      () => {
        setActiveIndex((previous) =>
          getNextPlaybackIndex(
            previous,
            transformedCurrentChunks.length,
            playbackBurstSize
          )
        );
      },
      getPlaybackDelayInMs(
        playbackDelayInMs,
        transformedCurrentChunks[activeIndex]?.delayInMs ?? 0
      )
    );

    return () => window.clearTimeout(timer);
  }, [
    activeIndex,
    isPlaying,
    playbackBurstSize,
    playbackDelayInMs,
    transformedCurrentChunks,
  ]);

  return (
    <section className="space-y-6 p-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-slate-500 text-xs uppercase tracking-[0.2em]">
                Plate / Streaming
              </p>
              <h1 className="mt-2 font-semibold text-4xl text-slate-950">
                Markdown streaming demo
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600 text-sm">
                This page now includes the richer debugging workflow from the
                Streamdown demo, but it still runs the real Plate
                <code className="mx-1 rounded bg-slate-100 px-1.5 py-0.5">
                  streamInsertChunk
                </code>
                path only.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="block text-slate-500 text-xs uppercase tracking-wide">
                  Scenario
                </span>
                <strong className="mt-1 block text-slate-900">
                  {formatScenarioLabel(selectedScenario)}
                </strong>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="block text-slate-500 text-xs uppercase tracking-wide">
                  Source
                </span>
                <strong className="mt-1 block text-slate-900">
                  {currentSourceLabel}
                </strong>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="block text-slate-500 text-xs uppercase tracking-wide">
                  Progress
                </span>
                <strong className="mt-1 block text-slate-900">
                  {activeIndex}/{transformedCurrentChunks.length}
                </strong>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="block text-slate-500 text-xs uppercase tracking-wide">
                  Adapter
                </span>
                <strong className="mt-1 block text-slate-900">
                  Plate streamInsertChunk
                </strong>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="block text-slate-500 text-xs uppercase tracking-wide">
                  Preset Delay
                </span>
                <strong className="mt-1 block text-slate-900">
                  {playbackDelayInMs} ms
                </strong>
              </div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                <span className="block text-slate-500 text-xs uppercase tracking-wide">
                  Burst Size
                </span>
                <strong className="mt-1 block text-slate-900">
                  {playbackBurstSize}
                </strong>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex min-w-72 flex-col gap-2 text-slate-600 text-sm">
              <span className="font-medium text-slate-800">Scenario</span>
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                value={selectedScenario}
                onChange={(event) => {
                  switchToPresetMode(event.target.value as ScenarioId);
                }}
              >
                {Object.keys(testScenarios).map((scenario) => (
                  <option key={scenario} value={scenario}>
                    {formatScenarioLabel(scenario)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-48 flex-col gap-2 text-slate-600 text-sm">
              <span className="font-medium text-slate-800">Preset delay</span>
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                value={playbackDelayInMs}
                onChange={(event) => {
                  setPlaybackDelayInMs(Number(event.target.value));
                }}
              >
                {playbackDelayOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex min-w-48 flex-col gap-2 text-slate-600 text-sm">
              <span className="font-medium text-slate-800">Burst size</span>
              <select
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
                value={playbackBurstSize}
                onChange={(event) => {
                  setPlaybackBurstSize(Number(event.target.value));
                }}
              >
                {playbackBurstSizeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPlaying(false);
                  setActiveIndex(0);
                }}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={activeIndex === 0}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveIndex((previous) => Math.max(0, previous - 1));
                }}
              >
                Prev
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={activeIndex >= transformedCurrentChunks.length}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveIndex((previous) =>
                    Math.min(transformedCurrentChunks.length, previous + 1)
                  );
                }}
              >
                Next
              </Button>
              <Button
                type="button"
                onClick={() => setIsPlaying((previous) => !previous)}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsPlaying(false);
                  setActiveIndex(transformedCurrentChunks.length);
                }}
              >
                Jump to end
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="font-semibold text-2xl text-slate-900">AI Prompt</h2>
          <p className="text-slate-500 text-sm">
            Stream a real AI markdown response into Plate&apos;s dev demo to
            catch chunk-boundary bugs that preset cases might miss.
          </p>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <label className="flex min-h-0 flex-col gap-2 text-slate-600 text-sm">
            <span className="font-medium text-slate-800">Prompt</span>
            <textarea
              className="min-h-40 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="Describe the markdown response you want to stream..."
            />
          </label>

          <label className="flex min-h-0 flex-col gap-2 text-slate-600 text-sm">
            <span className="font-medium text-slate-800">Model</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm"
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
            >
              {models.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              disabled={aiStatus === 'loading' || aiStatus === 'streaming'}
              onClick={() => {
                void handleGenerateAiStream();
              }}
            >
              Generate with AI
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={aiStatus !== 'loading' && aiStatus !== 'streaming'}
              onClick={() => stopAiStream()}
            >
              Stop AI
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={sourceMode === 'preset'}
              onClick={() => switchToPresetMode()}
            >
              Use preset scenario
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-slate-600 text-sm">
            <span>Status: {aiStatus}</span>
            <span>Model: {selectedModel}</span>
            <span>Provider path: {aiProvider ?? 'pending'}</span>
            <span>Raw AI chunks: {aiRawChunks.length}</span>
            <span>Joined chunks: {transformedCurrentChunks.length}</span>
          </div>
        </div>

        <p
          className={cn(
            'mt-4 text-sm',
            aiError ? 'text-red-600' : 'text-slate-500'
          )}
        >
          {aiError
            ? aiError
            : 'Prefer AI_GATEWAY_API_KEY if you want to switch across OpenAI, Google, Anthropic, and other providers. If that is missing, the demo falls back to OPENAI_API_KEY for OpenAI models only.'}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <InfoCard
          title="Chunks"
          description="These are the transformed chunks after the local MarkdownJoiner pass."
        >
          <div className="mb-4 flex flex-wrap justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={joinedChunkStrings.length === 0}
              onClick={() => {
                void handleCopyChunks();
              }}
            >
              {copyChunksStatus === 'copied'
                ? 'Copied'
                : copyChunksStatus === 'error'
                  ? 'Copy failed'
                  : 'Copy chunks'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void handlePasteChunks();
              }}
            >
              {pasteChunksStatus === 'loaded'
                ? 'Loaded'
                : pasteChunksStatus === 'error'
                  ? 'Paste failed'
                  : 'Paste chunks'}
            </Button>
          </div>

          <ChunkChipList
            activeIndex={activeIndex}
            chunks={transformedCurrentChunks}
            onSelect={(index) => {
              setIsPlaying(false);
              setActiveIndex(index);
            }}
          />
        </InfoCard>

        <InfoCard
          title="Editor output"
          description="Real Plate streamInsertChunk running against the current joined chunks."
        >
          <EditorRenderBoundary
            currentChunkLabel={currentChunkLabel}
            onReset={() => {
              setIsPlaying(false);
              resetStreamingState(editor);
              appliedStreamingStateRef.current = {
                appliedCount: 0,
                prefixMarkdown: '',
                sourceIdentity,
                streamedChunks: [],
              };
              setTreeJson(encodeEditorTree(editor.children));
            }}
            resetKey={editorBoundaryResetKey}
          >
            <Plate editor={editor}>
              <EditorContainer className="h-full overflow-y-auto rounded-2xl border border-slate-200 bg-white">
                <Editor
                  variant="demo"
                  className="min-h-full pb-[20vh]"
                  placeholder="Streaming output will appear here..."
                  spellCheck={false}
                />
              </EditorContainer>
            </Plate>
          </EditorRenderBoundary>
        </InfoCard>

        <InfoCard
          title="Raw markdown"
          description="The currently streamed prefix concatenated as markdown text."
        >
          <textarea
            className="h-full w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 font-mono text-slate-900 text-sm shadow-sm"
            readOnly
            value={currentMarkdown}
          />
        </InfoCard>

        <InfoCard
          title="Editor tree"
          description="The raw Slate tree after the current streaming step."
        >
          <pre className="h-full overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-slate-900 p-4 font-mono text-slate-100 text-sm">
            {treeJson}
          </pre>
        </InfoCard>
      </div>
    </section>
  );
};
