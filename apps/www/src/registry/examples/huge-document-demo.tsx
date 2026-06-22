'use client';

import Link from 'next/link';

import React, {
  type CSSProperties,
  type Dispatch,
  StrictMode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from 'react';

import type { Value } from 'platejs';
import type { Editor } from 'slate';

import {
  createPlateEditor,
  Editable,
  Plate,
  PlateContent,
  Slate,
  useSelected,
} from 'platejs/react';
import { createEditor as slateCreateEditor } from 'slate';
import { withReact } from 'slate-react';

import { createHugeDocumentValue } from '@/registry/examples/values/huge-document-value';
import { Button } from '@/components/ui/button';

const subscribeBrowserPerformanceSupport = () => () => {};

const getUnsupportedBrowserFeature = () => false;

const getBrowserSupportsEventTiming = () =>
  typeof window !== 'undefined' && 'PerformanceEventTiming' in window;

const getBrowserSupportsLoafTiming = () =>
  typeof window !== 'undefined' &&
  'PerformanceLongAnimationFrameTiming' in window;

type EngineStatistics = {
  averageKeyPressDuration: number | null;
  lastKeyPressDuration: number | null;
  lastLongAnimationFrameDuration: number | null;
};

const lastThreeDigitsPattern = /(\d{3})$/;

const defaultStatistics: EngineStatistics = {
  averageKeyPressDuration: null,
  lastKeyPressDuration: null,
  lastLongAnimationFrameDuration: null,
};

const DEFAULT_HUGE_DOCUMENT_BLOCKS = 10_000;
const DEFAULT_HUGE_DOCUMENT_CHUNK_SIZE = 1000;
const HUGE_DOCUMENT_BENCHMARK_SCENARIO_WORKLOAD = 'huge-mixed-block';

const HUGE_DOCUMENT_BLOCK_OPTIONS = [
  2, 1000, 2500, 5000, 7500, 10_000, 15_000, 20_000, 25_000, 30_000, 40_000,
  50_000, 100_000, 200_000,
];

const HUGE_DOCUMENT_CHUNK_SIZE_OPTIONS = [3, 10, 100, 1000];

type EngineKind = 'plate' | 'slate';
type ContentVisibilityMode = 'none' | 'element' | 'chunk';
type MountedEngines = 'both' | EngineKind;

type Config = {
  blocks: number;
  chunking: boolean;
  chunkSize: number;
  chunkDivs: boolean;
  chunkOutlines: boolean;
  contentVisibilityMode: ContentVisibilityMode;
  mountedEngines: MountedEngines;
  showSelectedHeadings: boolean;
  strictMode: boolean;
};

type BenchmarkConfig = {
  blocks: number;
  chunking: boolean;
  chunkSize: number;
  contentVisibility: ContentVisibilityMode;
  scenarioWorkload: string;
};

const DEFAULT_CONFIG: Config = {
  blocks: DEFAULT_HUGE_DOCUMENT_BLOCKS,
  chunking: true,
  chunkSize: DEFAULT_HUGE_DOCUMENT_CHUNK_SIZE,
  chunkDivs: true,
  chunkOutlines: false,
  contentVisibilityMode: 'chunk',
  mountedEngines: 'both',
  showSelectedHeadings: false,
  strictMode: false,
};

function getDocumentSearchParams() {
  if (typeof document === 'undefined') return null;

  return new URLSearchParams(document.location.search);
}

function parseNumber({
  defaultValue,
  key,
  searchParams,
}: {
  defaultValue: number;
  key: string;
  searchParams: URLSearchParams | null;
}) {
  return Number.parseInt(searchParams?.get(key) ?? '', 10) || defaultValue;
}

function parseBoolean({
  defaultValue,
  key,
  searchParams,
}: {
  defaultValue: boolean;
  key: string;
  searchParams: URLSearchParams | null;
}) {
  const value = searchParams?.get(key);

  if (value) return value === 'true';

  return defaultValue;
}

function parseEnum<T extends string>({
  defaultValue,
  key,
  options,
  searchParams,
}: {
  defaultValue: T;
  key: string;
  options: readonly T[];
  searchParams: URLSearchParams | null;
}) {
  const value = searchParams?.get(key) as T | null | undefined;

  if (value && options.includes(value)) return value;

  return defaultValue;
}

function replaceSearchParams(searchParams: URLSearchParams) {
  history.replaceState({}, '', `?${searchParams.toString()}`);
}

function getInitialHugeDocumentConfig() {
  const searchParams = getDocumentSearchParams();

  return {
    blocks: parseNumber({
      defaultValue: DEFAULT_CONFIG.blocks,
      key: 'blocks',
      searchParams,
    }),
    chunking: parseBoolean({
      defaultValue: DEFAULT_CONFIG.chunking,
      key: 'chunking',
      searchParams,
    }),
    chunkSize: parseNumber({
      defaultValue: DEFAULT_CONFIG.chunkSize,
      key: 'chunk_size',
      searchParams,
    }),
    chunkDivs: parseBoolean({
      defaultValue: DEFAULT_CONFIG.chunkDivs,
      key: 'chunk_divs',
      searchParams,
    }),
    chunkOutlines: parseBoolean({
      defaultValue: DEFAULT_CONFIG.chunkOutlines,
      key: 'chunk_outlines',
      searchParams,
    }),
    contentVisibilityMode: parseEnum({
      defaultValue: DEFAULT_CONFIG.contentVisibilityMode,
      key: 'content_visibility',
      options: ['none', 'element', 'chunk'],
      searchParams,
    }),
    mountedEngines: parseEnum({
      defaultValue: DEFAULT_CONFIG.mountedEngines,
      key: 'engines',
      options: ['both', 'plate', 'slate'],
      searchParams,
    }),
    showSelectedHeadings: parseBoolean({
      defaultValue: DEFAULT_CONFIG.showSelectedHeadings,
      key: 'selected_headings',
      searchParams,
    }),
    strictMode: parseBoolean({
      defaultValue: DEFAULT_CONFIG.strictMode,
      key: 'strict',
      searchParams,
    }),
  } satisfies Config;
}

function writeHugeDocumentSearchParams(config: Config) {
  const searchParams = getDocumentSearchParams();

  if (!searchParams) return;

  searchParams.set('blocks', config.blocks.toString());
  searchParams.set('chunking', config.chunking ? 'true' : 'false');
  searchParams.set('chunk_size', config.chunkSize.toString());
  searchParams.set('chunk_divs', config.chunkDivs ? 'true' : 'false');
  searchParams.set('chunk_outlines', config.chunkOutlines ? 'true' : 'false');
  searchParams.set('content_visibility', config.contentVisibilityMode);
  searchParams.set('engines', config.mountedEngines);
  searchParams.set(
    'selected_headings',
    config.showSelectedHeadings ? 'true' : 'false'
  );
  searchParams.set('strict', config.strictMode ? 'true' : 'false');
  replaceSearchParams(searchParams);
}

function getMountedEngines({ mountedEngines }: Pick<Config, 'mountedEngines'>) {
  return mountedEngines === 'both'
    ? (['plate', 'slate'] as const)
    : [mountedEngines];
}

function toBenchmarkConfig({
  blocks,
  chunkSize,
  chunking,
  contentVisibilityMode,
}: Pick<
  Config,
  'blocks' | 'chunkSize' | 'chunking' | 'contentVisibilityMode'
>): BenchmarkConfig {
  return {
    blocks,
    chunking,
    chunkSize,
    contentVisibility: contentVisibilityMode,
    scenarioWorkload: HUGE_DOCUMENT_BENCHMARK_SCENARIO_WORKLOAD,
  };
}

function createHugeDocumentBenchmarkHref(config: Config) {
  const searchParams = new URLSearchParams();
  const benchmarkConfig = toBenchmarkConfig(config);

  searchParams.set('blocks', benchmarkConfig.blocks.toString());
  searchParams.set('chunking', benchmarkConfig.chunking ? 'true' : 'false');
  searchParams.set('chunk_size', benchmarkConfig.chunkSize.toString());
  searchParams.set('content_visibility', benchmarkConfig.contentVisibility);
  searchParams.set('scenario_workload', benchmarkConfig.scenarioWorkload);

  return `/dev/editor-perf?${searchParams.toString()}`;
}

const createEditor = ({
  config,
  engine,
  initialValue,
}: {
  config: Config;
  engine: EngineKind;
  initialValue: Value;
}) => {
  if (engine === 'slate') {
    const editor = withReact(slateCreateEditor());

    editor.getChunkSize = (node) =>
      config.chunking && node === editor ? config.chunkSize : null;

    return editor as Editor;
  }

  return createPlateEditor({
    chunking: config.chunking ? { chunkSize: config.chunkSize } : false,
    nodeId: false,
    value: structuredClone(initialValue),
  }) as unknown as Editor;
};

const Chunk = ({
  attributes,
  children,
  contentVisibilityLowest,
  lowest,
  outline,
}: {
  attributes: any;
  children: React.ReactNode;
  contentVisibilityLowest: boolean;
  lowest?: boolean;
  outline: boolean;
}) => {
  const style: CSSProperties = {
    border: outline ? '1px solid red' : undefined,
    contentVisibility: contentVisibilityLowest && lowest ? 'auto' : undefined,
    marginBottom: outline ? 20 : undefined,
    padding: outline ? 20 : undefined,
  };

  return (
    <div {...attributes} style={style}>
      {children}
    </div>
  );
};

const Heading = ({
  showSelectedHeadings = false,
  style: styleProp,
  ...props
}: React.ComponentProps<'h1'> & { showSelectedHeadings: boolean }) => {
  const selected = useSelected();
  const highlightSelected = showSelectedHeadings && selected;
  const style = {
    ...styleProp,
    color: highlightSelected ? 'green' : undefined,
  };

  return (
    <h1
      {...props}
      data-selected={highlightSelected ? '' : undefined}
      style={style}
    />
  );
};

const Paragraph = 'p';

const Element = ({
  attributes,
  children,
  contentVisibility,
  element,
  showSelectedHeadings,
}: {
  attributes: any;
  children: React.ReactNode;
  contentVisibility: boolean;
  element: { type?: string };
  showSelectedHeadings: boolean;
}) => {
  const style: CSSProperties = {
    contentVisibility: contentVisibility ? 'auto' : undefined,
  };

  switch (element.type) {
    case 'h1':
    case 'heading-one':
      return (
        <Heading
          {...attributes}
          showSelectedHeadings={showSelectedHeadings}
          style={style}
        >
          {children}
        </Heading>
      );
    default:
      return (
        <Paragraph {...attributes} style={style}>
          {children}
        </Paragraph>
      );
  }
};

function EnginePane({
  active,
  config,
  engine,
  onFocus,
  onStatisticsChange,
  rendering,
}: {
  active: boolean;
  config: Config;
  engine: EngineKind;
  onFocus: (engine: EngineKind) => void;
  onStatisticsChange: (
    engine: EngineKind,
    statistics: EngineStatistics
  ) => void;
  rendering: boolean;
}) {
  const [keyPressDurations, setKeyPressDurations] = useState<number[]>([]);
  const [lastLongAnimationFrameDuration, setLastLongAnimationFrameDuration] =
    useState<number | null>(null);

  const initialValue = useMemo(
    () => createHugeDocumentValue({ blocks: config.blocks, engine }),
    [config.blocks, engine]
  );

  const [editor] = useState(() =>
    createEditor({
      config,
      engine,
      initialValue,
    })
  );

  const lastKeyPressDuration = keyPressDurations[0] ?? null;
  const averageKeyPressDuration =
    keyPressDurations.length === 10
      ? Math.round(
          keyPressDurations.reduce((total, duration) => total + duration, 0) /
            10
        )
      : null;

  useEffect(() => {
    onStatisticsChange(engine, {
      averageKeyPressDuration,
      lastKeyPressDuration,
      lastLongAnimationFrameDuration,
    });
  }, [
    averageKeyPressDuration,
    engine,
    lastKeyPressDuration,
    lastLongAnimationFrameDuration,
    onStatisticsChange,
  ]);

  useEffect(() => {
    if (!getBrowserSupportsEventTiming()) return;

    const observer = new PerformanceObserver((list) => {
      if (!active) return;

      list.getEntries().forEach((entry) => {
        if (entry.name !== 'keypress') return;

        const duration = Math.round(
          // @ts-expect-error browser API typing lags the runtime here
          entry.processingEnd - entry.processingStart
        );

        setKeyPressDurations((durations) => [
          duration,
          ...durations.slice(0, 9),
        ]);
      });
    });

    // @ts-expect-error browser API typing lags the runtime here
    observer.observe({ type: 'event', durationThreshold: 16 });

    return () => observer.disconnect();
  }, [active]);

  useEffect(() => {
    if (!getBrowserSupportsLoafTiming()) return;

    const apply = editor.apply;
    let afterOperation = false;

    // eslint-disable-next-line react-hooks/immutability -- Demo component intentionally monkeypatches editor.apply to measure long animation frames
    editor.apply = (operation) => {
      apply(operation);
      afterOperation = true;
    };

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (!afterOperation) return;

        setLastLongAnimationFrameDuration(Math.round(entry.duration));
        afterOperation = false;
      });
    });

    observer.observe({ type: 'long-animation-frame' });

    return () => {
      editor.apply = apply;
      observer.disconnect();
    };
  }, [editor]);

  const renderElement = useCallback(
    (props: any) => (
      <Element
        {...props}
        contentVisibility={config.contentVisibilityMode === 'element'}
        showSelectedHeadings={config.showSelectedHeadings}
      />
    ),
    [config.contentVisibilityMode, config.showSelectedHeadings]
  );

  const renderChunk = useCallback(
    (props: any) => (
      <Chunk
        {...props}
        contentVisibilityLowest={config.contentVisibilityMode === 'chunk'}
        outline={config.chunkOutlines}
      />
    ),
    [config.contentVisibilityMode, config.chunkOutlines]
  );

  const editable = rendering ? (
    <div>Rendering&hellip;</div>
  ) : engine === 'slate' ? (
    <Slate editor={editor as any} initialValue={initialValue as any}>
      <Editable
        placeholder="Enter some text…"
        renderChunk={config.chunkDivs ? renderChunk : undefined}
        renderElement={renderElement}
        spellCheck
      />
    </Slate>
  ) : (
    <Plate editor={editor as any}>
      <PlateContent
        placeholder="Enter some text…"
        renderChunk={config.chunkDivs ? (renderChunk as any) : undefined}
        renderElement={renderElement as any}
        spellCheck
      />
    </Plate>
  );

  const editableWithStrictMode = config.strictMode ? (
    <StrictMode>{editable}</StrictMode>
  ) : (
    editable
  );

  return (
    <section
      onFocusCapture={() => onFocus(engine)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 0,
      }}
    >
      <h2 style={{ margin: 0 }}>{engine === 'plate' ? 'Plate' : 'Slate'}</h2>

      <div
        style={{
          border: '1px solid color-mix(in srgb, currentColor 16%, transparent)',
          borderRadius: 8,
          maxHeight: 560,
          overflow: 'auto',
          padding: 16,
        }}
      >
        {editableWithStrictMode}
      </div>
    </section>
  );
}

function PerformanceControls({
  config,
  setConfig,
  statistics,
}: {
  config: Config;
  setConfig: Dispatch<Partial<Config>>;
  statistics: Record<EngineKind, EngineStatistics>;
}) {
  const [configurationOpen, setConfigurationOpen] = useState(true);
  const supportsEventTiming = useSyncExternalStore(
    subscribeBrowserPerformanceSupport,
    getBrowserSupportsEventTiming,
    getUnsupportedBrowserFeature
  );
  const supportsLoafTiming = useSyncExternalStore(
    subscribeBrowserPerformanceSupport,
    getBrowserSupportsLoafTiming,
    getUnsupportedBrowserFeature
  );

  const renderStatisticValue = (
    mounted: boolean,
    supported: boolean,
    value: number | null
  ): React.ReactNode => {
    if (!mounted) return 'Not mounted';
    if (!supported) return 'Not supported';

    return value ?? '-';
  };

  const mountedEngines = getMountedEngines(config);
  const benchmarkHref = createHugeDocumentBenchmarkHref(config);

  return (
    <div className="performance-controls">
      <div style={{ marginBottom: 16 }}>
        <Button asChild size="sm" variant="outline">
          <Link href={benchmarkHref}>Open in benchmark mode</Link>
        </Button>
      </div>

      <p>
        <label>
          Blocks:{' '}
          <select
            onChange={(event) =>
              setConfig({
                blocks: Number.parseInt(event.target.value, 10),
              })
            }
            value={config.blocks}
          >
            {HUGE_DOCUMENT_BLOCK_OPTIONS.map((blocks) => (
              <option key={blocks} value={blocks}>
                {blocks.toString().replace(lastThreeDigitsPattern, ',$1')}
              </option>
            ))}
          </select>
        </label>
      </p>

      <p>
        <label>
          Mounted editors:{' '}
          <select
            onChange={(event) =>
              setConfig({
                mountedEngines: event.target.value as Config['mountedEngines'],
              })
            }
            value={config.mountedEngines}
          >
            <option value="both">Plate + Slate</option>
            <option value="plate">Plate only</option>
            <option value="slate">Slate only</option>
          </select>
        </label>
      </p>

      <details
        onToggle={(event) => setConfigurationOpen(event.currentTarget.open)}
        open={configurationOpen}
      >
        <summary>Configuration</summary>

        <p>
          <label>
            <input
              checked={config.chunking}
              onChange={(event) =>
                setConfig({
                  chunking: event.target.checked,
                })
              }
              type="checkbox"
            />{' '}
            Chunking enabled
          </label>
        </p>

        {config.chunking && (
          <>
            <p>
              <label>
                <input
                  checked={config.chunkDivs}
                  onChange={(event) =>
                    setConfig({
                      chunkDivs: event.target.checked,
                    })
                  }
                  type="checkbox"
                />{' '}
                Render each chunk as a separate <code>&lt;div&gt;</code>
              </label>
            </p>

            {config.chunkDivs && (
              <p>
                <label>
                  <input
                    checked={config.chunkOutlines}
                    onChange={(event) =>
                      setConfig({
                        chunkOutlines: event.target.checked,
                      })
                    }
                    type="checkbox"
                  />{' '}
                  Outline each chunk
                </label>
              </p>
            )}

            <p>
              <label>
                Chunk size:{' '}
                <select
                  onChange={(event) =>
                    setConfig({
                      chunkSize: Number.parseInt(event.target.value, 10),
                    })
                  }
                  value={config.chunkSize}
                >
                  {HUGE_DOCUMENT_CHUNK_SIZE_OPTIONS.map((chunkSize) => (
                    <option key={chunkSize} value={chunkSize}>
                      {chunkSize}
                    </option>
                  ))}
                </select>
              </label>
            </p>
          </>
        )}

        <p>
          <label>
            Set <code>content-visibility: auto</code> on:{' '}
            <select
              onChange={(event) =>
                setConfig({
                  contentVisibilityMode: event.target
                    .value as Config['contentVisibilityMode'],
                })
              }
              value={config.contentVisibilityMode}
            >
              <option value="none">None</option>
              <option value="element">Elements</option>
              {config.chunking && config.chunkDivs && (
                <option value="chunk">Lowest chunks</option>
              )}
            </select>
          </label>
        </p>

        <p>
          <label>
            <input
              checked={config.showSelectedHeadings}
              onChange={(event) =>
                setConfig({
                  showSelectedHeadings: event.target.checked,
                })
              }
              type="checkbox"
            />{' '}
            Call <code>useSelected</code> in each heading
          </label>
        </p>

        <p>
          <label>
            <input
              checked={config.strictMode}
              onChange={(event) =>
                setConfig({
                  strictMode: event.target.checked,
                })
              }
              type="checkbox"
            />{' '}
            React strict mode (only works in localhost)
          </label>
        </p>
      </details>

      <details>
        <summary>Statistics</summary>

        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
          }}
        >
          <thead>
            <tr>
              <th align="left">Metric</th>
              <th align="right">Plate</th>
              <th align="right">Slate</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>Last keypress (ms)</td>
              <td align="right">
                {renderStatisticValue(
                  mountedEngines.includes('plate'),
                  supportsEventTiming,
                  statistics.plate.lastKeyPressDuration
                )}
              </td>
              <td align="right">
                {renderStatisticValue(
                  mountedEngines.includes('slate'),
                  supportsEventTiming,
                  statistics.slate.lastKeyPressDuration
                )}
              </td>
            </tr>
            <tr>
              <td>Average of last 10 keypresses (ms)</td>
              <td align="right">
                {renderStatisticValue(
                  mountedEngines.includes('plate'),
                  supportsEventTiming,
                  statistics.plate.averageKeyPressDuration
                )}
              </td>
              <td align="right">
                {renderStatisticValue(
                  mountedEngines.includes('slate'),
                  supportsEventTiming,
                  statistics.slate.averageKeyPressDuration
                )}
              </td>
            </tr>
            <tr>
              <td>Last long animation frame (ms)</td>
              <td align="right">
                {renderStatisticValue(
                  mountedEngines.includes('plate'),
                  supportsLoafTiming,
                  statistics.plate.lastLongAnimationFrameDuration
                )}
              </td>
              <td align="right">
                {renderStatisticValue(
                  mountedEngines.includes('slate'),
                  supportsLoafTiming,
                  statistics.slate.lastLongAnimationFrameDuration
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {supportsEventTiming &&
          statistics.plate.lastKeyPressDuration === null &&
          statistics.slate.lastKeyPressDuration === null && (
            <p>
              Focus a pane and type. Events shorter than 16ms may not be
              detected.
            </p>
          )}

        {config.mountedEngines === 'both' && (
          <p>
            Mount one editor at a time for cleaner engine-specific numbers. The
            two-editor view is useful for eyeballing parity, not for honest perf
            baselines.
          </p>
        )}
      </details>
    </div>
  );
}

export default function HugeDocumentDemo() {
  const [activePane, setActivePane] = useState<EngineKind>('slate');
  const [config, baseSetConfig] = useState<Config>(() =>
    getInitialHugeDocumentConfig()
  );
  const [paneVersion, setPaneVersion] = useState(0);
  const [rendering, setRendering] = useState(false);
  const [statistics, setStatistics] = useState<
    Record<EngineKind, EngineStatistics>
  >({
    plate: defaultStatistics,
    slate: defaultStatistics,
  });

  const setConfig = useCallback(
    (partialConfig: Partial<Config>) => {
      const newConfig = { ...config, ...partialConfig };
      const nextActivePane =
        newConfig.mountedEngines === 'both'
          ? activePane
          : newConfig.mountedEngines;

      setRendering(true);
      baseSetConfig(newConfig);
      setActivePane(nextActivePane);
      writeHugeDocumentSearchParams(newConfig);
      setStatistics({
        plate: defaultStatistics,
        slate: defaultStatistics,
      });

      setTimeout(() => {
        setRendering(false);
        setPaneVersion((version) => version + 1);
      });
    },
    [activePane, config]
  );

  const handleStatisticsChange = useCallback(
    (engine: EngineKind, nextStatistics: EngineStatistics) => {
      setStatistics((current) => {
        const previous = current[engine];

        if (
          previous.averageKeyPressDuration ===
            nextStatistics.averageKeyPressDuration &&
          previous.lastKeyPressDuration ===
            nextStatistics.lastKeyPressDuration &&
          previous.lastLongAnimationFrameDuration ===
            nextStatistics.lastLongAnimationFrameDuration
        ) {
          return current;
        }

        return {
          ...current,
          [engine]: nextStatistics,
        };
      });
    },
    []
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
    >
      <p style={{ margin: 0 }}>
        Slate huge-document controls, two isolated editors.
      </p>

      <PerformanceControls
        config={config}
        setConfig={setConfig}
        statistics={statistics}
      />

      <div
        style={{
          display: 'grid',
          gap: 24,
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        }}
      >
        {getMountedEngines(config).map((engine) => (
          <EnginePane
            active={activePane === engine}
            config={config}
            engine={engine}
            key={`${engine}:${paneVersion}`}
            onFocus={setActivePane}
            onStatisticsChange={handleStatisticsChange}
            rendering={rendering}
          />
        ))}
      </div>
    </div>
  );
}
