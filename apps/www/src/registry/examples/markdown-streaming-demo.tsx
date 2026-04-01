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

import {
  AIChatPlugin,
  resetStreamInsertChunk,
  streamInsertChunk,
} from '@platejs/ai/react';
import { getPluginType, KEYS } from 'platejs';
import { Plate, usePlateEditor } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EditorKit } from '@/registry/components/editor/editor-kit';
import {
  type MarkdownStreamingChunk,
  transformMarkdownStreamingChunks,
} from '@/registry/lib/markdown-streaming-chunks';
import {
  DEFAULT_MARKDOWN_STREAMING_DEMO_SCENARIO_ID,
  DEFAULT_PLAYBACK_BURST_SIZE,
  DEFAULT_PLAYBACK_DELAY_IN_MS,
  type MarkdownStreamingDemoScenarioId,
  getNextPlaybackIndex,
  getPlaybackDelayInMs,
  markdownStreamingDemoScenarios,
  playbackBurstSizeOptions,
  playbackDelayOptions,
} from '@/registry/lib/markdown-streaming-demo-data';
import { Editor, EditorContainer } from '@/registry/ui/editor';

const TRAILING_LINEBREAK_REGEX = /(\n+)$/;
const COPY_FEEDBACK_DURATION_MS = 1800;
const EMPTY_EDITOR_VALUE = [
  {
    children: [{ text: '' }],
    type: 'p',
  },
] as const;

type SourceMode = 'preset' | 'pasted';
type TChunk = MarkdownStreamingChunk;
type AppliedStreamingState = {
  appliedCount: number;
  sourceIdentity: string;
  streamedChunks: string[];
};
type TChunks = {
  chunks: {
    index: number;
    text: string;
  }[];
  linebreaks: number;
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
    console.error('Registry markdown streaming demo crashed.', error, info);
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
  resetStreamInsertChunk(editor);

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
  const chunkBatch = chunks.slice(0, count).join('');

  if (chunkBatch.length > 0) {
    applyChunk(editor, chunkBatch);
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

function splitChunksByLinebreak(chunks: readonly string[]) {
  const result: TChunks[] = [];
  let current: { index: number; text: string }[] = [];

  for (let index = 0; index < chunks.length; index += 1) {
    const chunk = chunks[index];
    current.push({ index, text: chunk });

    const match = TRAILING_LINEBREAK_REGEX.exec(chunk);

    if (match) {
      result.push({
        chunks: [...current],
        linebreaks: match[1].length,
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

function transformChunks(chunks: readonly string[]): TChunk[] {
  return transformMarkdownStreamingChunks(chunks);
}

function encodeEditorTree(editorChildren: unknown) {
  return JSON.stringify(editorChildren, null, 2);
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

function Tokens({
  activeIndex,
  chunkClick,
  chunks,
}: {
  activeIndex: number;
  chunks: TChunks[];
  chunkClick?: (index: number) => void;
}) {
  return (
    <div className="h-full overflow-y-auto rounded-2xl bg-slate-100 p-4 font-mono">
      {chunks.map((chunk, index) => (
        <div key={index} className="py-1">
          {chunk.chunks.map((c, chunkIndex) => {
            const lineBreak = c.text.replaceAll('\n', '⤶');
            const space = lineBreak.replaceAll(' ', '␣');

            return (
              <span
                key={chunkIndex}
                role="button"
                className={cn(
                  'mx-1 inline-block rounded border p-1 text-xs transition',
                  activeIndex && c.index < activeIndex
                    ? 'bg-amber-400'
                    : 'bg-white hover:bg-slate-50'
                )}
                onClick={() => chunkClick?.(c.index + 1)}
              >
                {space}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function MarkdownStreamingDemo() {
  const [selectedScenario, setSelectedScenario] =
    useState<MarkdownStreamingDemoScenarioId>(
      DEFAULT_MARKDOWN_STREAMING_DEMO_SCENARIO_ID
    );
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
  const [demoError, setDemoError] = useState<string | null>(null);
  const [copyChunksStatus, setCopyChunksStatus] = useState<
    'idle' | 'copied' | 'error'
  >('idle');
  const [pasteChunksStatus, setPasteChunksStatus] = useState<
    'idle' | 'loaded' | 'error'
  >('idle');
  const [pastedChunks, setPastedChunks] = useState<string[]>([]);
  const copyStatusTimerRef = useRef<number | null>(null);
  const pasteStatusTimerRef = useRef<number | null>(null);
  const appliedStreamingStateRef = useRef<AppliedStreamingState>({
    appliedCount: 0,
    sourceIdentity: `preset:${DEFAULT_MARKDOWN_STREAMING_DEMO_SCENARIO_ID}`,
    streamedChunks: [],
  });

  const editor = usePlateEditor(
    {
      plugins: EditorKit,
      value: cloneEditorValue(),
    },
    []
  );

  const selectedScenarioDefinition =
    markdownStreamingDemoScenarios[selectedScenario];
  const scenarioEntries = Object.entries(markdownStreamingDemoScenarios) as [
    MarkdownStreamingDemoScenarioId,
    (typeof markdownStreamingDemoScenarios)[MarkdownStreamingDemoScenarioId],
  ][];
  const currentScenarioChunks = selectedScenarioDefinition.chunks;

  const rawChunks = useMemo(() => {
    if (sourceMode === 'pasted') {
      return pastedChunks;
    }

    return currentScenarioChunks;
  }, [currentScenarioChunks, pastedChunks, sourceMode]);

  const transformedCurrentChunks = useMemo(
    () => transformChunks(rawChunks),
    [rawChunks]
  );

  const currentMarkdown = useMemo(
    () =>
      transformedCurrentChunks
        .slice(0, activeIndex)
        .map((item) => item.chunk)
        .join(''),
    [activeIndex, transformedCurrentChunks]
  );

  const rawActiveIndex = useMemo(() => {
    if (activeIndex === 0) {
      return 0;
    }

    const lastAppliedChunk =
      transformedCurrentChunks[
        Math.min(activeIndex - 1, transformedCurrentChunks.length - 1)
      ];

    return lastAppliedChunk ? lastAppliedChunk.rawEndIndex + 1 : 0;
  }, [activeIndex, transformedCurrentChunks]);
  const rawChunksByLine = useMemo(
    () => splitChunksByLinebreak(rawChunks),
    [rawChunks]
  );

  const currentSourceLabel =
    sourceMode === 'pasted'
      ? 'Pasted chunks'
      : selectedScenarioDefinition.label;
  const sourceIdentity =
    sourceMode === 'preset' ? `preset:${selectedScenario}` : 'pasted';
  const currentChunkLabel =
    activeIndex === 0 ? 'before first chunk' : `#${activeIndex}`;
  const editorBoundaryResetKey = `${sourceIdentity}:${activeIndex}`;

  async function handleCopyChunks() {
    try {
      await navigator.clipboard.writeText(
        serializeChunksForClipboard(rawChunks)
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

    // biome-ignore lint/suspicious/noAlert: dev-only chunk import helper for local debugging.
    const pastedValue = window.prompt(
      'Paste the chunk array exported from Copy chunks.',
      initialValue
    );

    if (pastedValue == null) {
      return;
    }

    try {
      const parsedChunks = parseSerializedChunks(pastedValue);

      setSourceMode('pasted');
      setPastedChunks(parsedChunks);
      setDemoError(null);
      setIsPlaying(false);
      setActiveIndex(transformChunks(parsedChunks).length);
      setPasteChunksStatus('loaded');
    } catch (error) {
      setPasteChunksStatus('error');
      setDemoError(
        error instanceof Error
          ? error.message
          : 'Failed to parse pasted chunks.'
      );
    }
  }

  function switchToPresetMode(nextScenario?: MarkdownStreamingDemoScenarioId) {
    setSourceMode('preset');
    setPastedChunks([]);
    setDemoError(null);
    setIsPlaying(false);
    setActiveIndex(0);

    if (nextScenario) {
      setSelectedScenario(nextScenario);
    }
  }

  useEffect(
    () => () => {
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
        sourceIdentity,
        streamedChunks: chunks.slice(0, activeIndex),
      };
      setTreeJson(encodeEditorTree(editor.children));
      return;
    }

    if (activeIndex > appliedState.appliedCount) {
      const chunkBatch = chunks
        .slice(appliedState.appliedCount, activeIndex)
        .join('');

      if (chunkBatch.length > 0) {
        applyChunk(editor, chunkBatch);
      }

      appliedStreamingStateRef.current = {
        appliedCount: activeIndex,
        sourceIdentity,
        streamedChunks: chunks.slice(0, activeIndex),
      };
    }

    setTreeJson(encodeEditorTree(editor.children));
  }, [activeIndex, editor, sourceIdentity, transformedCurrentChunks]);

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
    <section className="h-full overflow-y-auto p-8 md:p-12">
      <div className="space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-slate-500 text-xs uppercase tracking-[0.2em]">
                  Plate / Blocks
                </p>
                <h1 className="mt-2 font-semibold text-4xl text-slate-950">
                  Markdown streaming demo
                </h1>
                <p className="mt-3 max-w-3xl text-slate-600 text-sm">
                  This registry example now includes the same richer debugging
                  workflow from the local dev demo, while still using
                  Plate&apos;s real
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
                    {selectedScenarioDefinition.label}
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
                    switchToPresetMode(
                      event.target.value as MarkdownStreamingDemoScenarioId
                    );
                  }}
                >
                  {scenarioEntries.map(([scenarioId, scenario]) => (
                    <option key={scenarioId} value={scenarioId}>
                      {scenario.label}
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

        <div className="grid gap-6 xl:grid-cols-2">
          <InfoCard
            title="Chunks"
            description={
              <>
                These are the original chunks before the local MarkdownJoiner
                pass. Joined chunks: {transformedCurrentChunks.length}
              </>
            }
          >
            <div className="flex h-full min-h-0 flex-col">
              <div className="mb-4 flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  disabled={sourceMode === 'preset'}
                  onClick={() => switchToPresetMode()}
                >
                  Use preset scenario
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={rawChunks.length === 0}
                  onClick={() => {
                    void handleCopyChunks();
                  }}
                >
                  {copyChunksStatus === 'copied'
                    ? 'Copied'
                    : copyChunksStatus === 'error'
                      ? 'Copy failed'
                      : 'Copy raw chunks'}
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
                      : 'Paste raw chunks'}
                </Button>
              </div>
              {demoError ? (
                <p className="mb-4 text-red-600 text-sm">{demoError}</p>
              ) : null}

              <div className="min-h-0 flex-1">
                <Tokens
                  activeIndex={rawActiveIndex}
                  chunks={rawChunksByLine}
                  chunkClick={(index) => {
                    const joinedIndex = transformedCurrentChunks.findIndex(
                      (chunk) => chunk.rawEndIndex >= index - 1
                    );

                    setIsPlaying(false);
                    setActiveIndex(
                      joinedIndex === -1
                        ? transformedCurrentChunks.length
                        : joinedIndex + 1
                    );
                  }}
                />
              </div>
            </div>
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
      </div>
    </section>
  );
}
