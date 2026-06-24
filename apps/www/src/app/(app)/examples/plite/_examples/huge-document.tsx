import { faker } from '@faker-js/faker';
import {
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import React, {
  type CSSProperties,
  StrictMode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { Editor, Value } from '@platejs/plite';
import {
  createReactEditor,
  Editable,
  type EditableDOMStrategyMetrics,
  type EditableProps,
  type RenderElementProps,
  Plite,
  useElementSelected,
} from '@platejs/plite-react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Switch } from '@/components/ui/switch';
import { parseAsBoundedInteger, replaceQueryOptions } from './query-controls';

const SUPPORTS_EVENT_TIMING =
  typeof window !== 'undefined' && 'PerformanceEventTiming' in window;

const SUPPORTS_LOAF_TIMING =
  typeof window !== 'undefined' &&
  'PerformanceLongAnimationFrameTiming' in window;

interface Config {
  blocks: number;
  contentVisibilityMode: 'none' | 'element';
  documentSeed: string;
  editorHeight: number;
  domStrategyMode: 'auto' | 'full' | 'staged' | 'virtualized';
  domStrategyOverscan: number;
  domStrategyThreshold: number;
  showSelectedHeadings: boolean;
  strictMode: boolean;
  virtualizedEstimatedBlockSize: number;
}

type RenderConfig = {
  contentVisibility: boolean;
  showSelectedHeadings: boolean;
};

type SetConfig = (partialConfig: Partial<Config>) => void;

type EventTimingEntry = PerformanceEntry & {
  processingEnd: number;
  processingStart: number;
};

type EventTimingObserverInit = PerformanceObserverInit & {
  durationThreshold: number;
  type: 'event';
};

const RenderConfigContext = React.createContext<RenderConfig>({
  contentVisibility: false,
  showSelectedHeadings: false,
});

const blocksOptions = [
  2, 1000, 2500, 5000, 7500, 10_000, 15_000, 20_000, 25_000, 30_000, 40_000,
  50_000, 100_000, 200_000,
];

const formatBlocksOption = (blocks: number) =>
  new Intl.NumberFormat('en-US').format(blocks);

const contentVisibilityModeOptions = ['none', 'element'] as const;
const domStrategyModeOptions = [
  'auto',
  'full',
  'staged',
  'virtualized',
] as const;

const toContentVisibilityMode = (
  value: string
): Config['contentVisibilityMode'] =>
  value === 'element' ? 'element' : 'none';

const hugeDocumentQueryParsers = {
  blocks: parseAsBoundedInteger(1, 200_000).withDefault(10_000),
  contentVisibilityMode: parseAsStringLiteral(
    contentVisibilityModeOptions
  ).withDefault('none'),
  documentSeed: parseAsString.withDefault('default'),
  domStrategyMode: parseAsStringLiteral(domStrategyModeOptions)
    .withDefault('virtualized')
    .withOptions({ clearOnDefault: false }),
  domStrategyOverscan: parseAsBoundedInteger(0, 1000).withDefault(0),
  domStrategyThreshold: parseAsBoundedInteger(1, 200_000).withDefault(2000),
  editorHeight: parseAsBoundedInteger(120, 2000).withDefault(420),
  showSelectedHeadings: parseAsBoolean.withDefault(false),
  strictMode: parseAsBoolean.withDefault(false),
  virtualizedEstimatedBlockSize: parseAsBoundedInteger(1, 1000).withDefault(48),
};

const hugeDocumentUrlKeys = {
  contentVisibilityMode: 'content_visibility',
  documentSeed: 'seed',
  domStrategyMode: 'strategy',
  domStrategyOverscan: 'overscan',
  domStrategyThreshold: 'threshold',
  editorHeight: 'editor_height',
  showSelectedHeadings: 'selected_headings',
  strictMode: 'strict',
  virtualizedEstimatedBlockSize: 'estimated_block_size',
};

const cachedInitialValueBySeed = new Map<string, Value>();
const maxCachedInitialValueBlocks = 50_000;

const getNumericDocumentSeed = (seed: string) =>
  seed === 'default'
    ? 1
    : Array.from(seed).reduce(
        (value, character) =>
          (Math.imul(value, 31) + character.charCodeAt(0)) >>> 0,
        0
      );

const generateInitialValue = (blocks: number, seed: string) => {
  const initialValue: Value = [];
  faker.seed(getNumericDocumentSeed(seed));

  for (let i = 0; i < blocks; i++) {
    if (i % 100 === 0) {
      initialValue.push({
        type: 'heading-one',
        children: [{ text: faker.lorem.sentence() }],
      });
    } else {
      initialValue.push({
        type: 'paragraph',
        children: [{ text: faker.lorem.paragraph() }],
      });
    }
  }

  return initialValue;
};

const getInitialValue = (blocks: number, seed: string) => {
  if (blocks > maxCachedInitialValueBlocks) {
    return generateInitialValue(blocks, seed);
  }

  const cachedInitialValue = cachedInitialValueBySeed.get(seed);

  if (cachedInitialValue && cachedInitialValue.length >= blocks) {
    return cachedInitialValue.slice(0, blocks);
  }

  const initialValue = generateInitialValue(blocks, seed);

  cachedInitialValueBySeed.set(seed, initialValue);

  return initialValue.slice();
};

const fallbackInitialValue: Value = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

// The huge-document bench remounts editors from URL/config controls. Normal
// React-owned examples should use `usePliteEditor`.
const createEditor = (_config: Config, initialValue: Value) =>
  createReactEditor({ initialValue });

const toDOMStrategy = (config: Config): EditableProps['domStrategy'] => {
  switch (config.domStrategyMode) {
    case 'full':
    case 'staged':
    case 'auto':
      return config.domStrategyMode;
    case 'virtualized':
      return {
        estimatedBlockSize: config.virtualizedEstimatedBlockSize,
        overscan: config.domStrategyOverscan,
        threshold: config.domStrategyThreshold,
        type: 'virtualized',
      };
  }
};

const hasBoundedEditableScroller = (config: Config) =>
  config.domStrategyMode === 'staged' ||
  config.domStrategyMode === 'virtualized';

const toBoundedEditableStyle = (config: Config): CSSProperties | undefined =>
  hasBoundedEditableScroller(config)
    ? {
        height: config.editorHeight,
        outline: '1px solid #ddd',
        scrollbarGutter: 'stable',
        overflowY: 'auto',
      }
    : undefined;

const formatMetric = (value: boolean | number | string | null | undefined) =>
  value ?? '-';

const HugeDocumentExample = () => {
  const [config, setQueryConfig] = useQueryStates(hugeDocumentQueryParsers, {
    ...replaceQueryOptions,
    urlKeys: hugeDocumentUrlKeys,
  });
  const [isRendering, setIsRendering] = useState(false);
  const [editor, setEditor] = useState(() =>
    createEditor(
      config,
      typeof window === 'undefined'
        ? fallbackInitialValue
        : getInitialValue(config.blocks, config.documentSeed)
    )
  );
  const editorInitialValueKeyRef = useRef(
    `${config.documentSeed}:${config.blocks}`
  );
  const [editorVersion, setEditorVersion] = useState(0);
  const [domStrategyMetrics, setDOMStrategyMetrics] =
    useState<EditableDOMStrategyMetrics | null>(null);

  const setConfig = useCallback(
    (partialConfig: Partial<Config>) => {
      const newConfig = { ...config, ...partialConfig };

      setIsRendering(true);
      setDOMStrategyMetrics(null);
      editorInitialValueKeyRef.current = `${newConfig.documentSeed}:${newConfig.blocks}`;
      void setQueryConfig(newConfig);

      setTimeout(() => {
        const nextInitialValue = getInitialValue(
          newConfig.blocks,
          newConfig.documentSeed
        );

        setIsRendering(false);
        setEditor(createEditor(newConfig, nextInitialValue));
        setEditorVersion((n) => n + 1);
      });
    },
    [config, setQueryConfig]
  );

  useEffect(() => {
    const initialValueKey = `${config.documentSeed}:${config.blocks}`;

    if (editorInitialValueKeyRef.current === initialValueKey) {
      return;
    }

    let replaceTimeout: ReturnType<typeof setTimeout> | undefined;

    const renderTimeout = setTimeout(() => {
      setIsRendering(true);
      setDOMStrategyMetrics(null);

      replaceTimeout = setTimeout(() => {
        const nextInitialValue = getInitialValue(
          config.blocks,
          config.documentSeed
        );

        editorInitialValueKeyRef.current = initialValueKey;
        setIsRendering(false);
        setEditor(createEditor(config, nextInitialValue));
        setEditorVersion((n) => n + 1);
      });
    });

    return () => {
      clearTimeout(renderTimeout);

      if (replaceTimeout) {
        clearTimeout(replaceTimeout);
      }
    };
  }, [config]);

  const domStrategy = useMemo(() => toDOMStrategy(config), [config]);

  const editableStyle = useMemo(() => toBoundedEditableStyle(config), [config]);

  const renderConfig = useMemo(
    () => ({
      contentVisibility: config.contentVisibilityMode === 'element',
      showSelectedHeadings: config.showSelectedHeadings,
    }),
    [config.contentVisibilityMode, config.showSelectedHeadings]
  );

  const editable = isRendering ? (
    <div>Rendering&hellip;</div>
  ) : (
    <RenderConfigContext.Provider value={renderConfig}>
      <Plite editor={editor} key={editorVersion}>
        <Editable
          autoFocus
          domStrategy={domStrategy}
          id="huge-document-editor"
          onDOMStrategyMetrics={setDOMStrategyMetrics}
          placeholder="Enter some text…"
          renderElement={Element}
          spellCheck
          style={editableStyle}
        />
      </Plite>
    </RenderConfigContext.Provider>
  );

  const editableWithStrictMode = config.strictMode ? (
    <StrictMode>{editable}</StrictMode>
  ) : (
    editable
  );

  return (
    <>
      <PerformanceControls
        config={config}
        domStrategyMetrics={domStrategyMetrics}
        editor={editor}
        setConfig={setConfig}
      />

      {editableWithStrictMode}
    </>
  );
};

const Heading = ({
  style: styleProp,
  showSelectedHeadings = false,
  ref,
  ...props
}: React.ComponentProps<'h1'> & {
  showSelectedHeadings: boolean;
  ref?: React.Ref<HTMLHeadingElement>;
}) => {
  if (showSelectedHeadings) {
    return <SelectedHeading ref={ref} style={styleProp} {...props} />;
  }

  return <h1 ref={ref} {...props} aria-selected={false} style={styleProp} />;
};

const SelectedHeading = ({
  style: styleProp,
  ref,
  ...props
}: React.ComponentProps<'h1'> & {
  ref?: React.Ref<HTMLHeadingElement>;
}) => {
  const selected = useElementSelected();
  const style = { ...styleProp, color: selected ? 'green' : undefined };
  return <h1 ref={ref} {...props} aria-selected={selected} style={style} />;
};

const Paragraph = 'p';

const Element = ({ attributes, children, element }: RenderElementProps) => {
  const { contentVisibility, showSelectedHeadings } =
    React.useContext(RenderConfigContext);
  const style = {
    containIntrinsicSize: contentVisibility ? 'auto 64px' : undefined,
    contentVisibility: contentVisibility ? 'auto' : undefined,
  } satisfies CSSProperties;

  switch (element.type) {
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

const PerformanceControls = ({
  editor,
  config,
  domStrategyMetrics,
  setConfig,
}: {
  editor: Editor;
  config: Config;
  domStrategyMetrics: EditableDOMStrategyMetrics | null;
  setConfig: SetConfig;
}) => {
  const [configurationOpen, setConfigurationOpen] = useState(true);
  const [keyPressDurations, setKeyPressDurations] = useState<number[]>([]);
  const [lastLongAnimationFrameDuration, setLastLongAnimationFrameDuration] =
    useState<number | null>(null);

  const lastKeyPressDuration: number | null = keyPressDurations[0] ?? null;

  const averageKeyPressDuration =
    keyPressDurations.length === 10
      ? Math.round(keyPressDurations.reduce((total, d) => total + d) / 10)
      : null;
  const visibleBlocksOptions = useMemo(
    () =>
      Array.from(new Set([...blocksOptions, config.blocks])).sort(
        (left, right) => left - right
      ),
    [config.blocks]
  );

  useEffect(() => {
    if (!SUPPORTS_EVENT_TIMING) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'keypress') {
          const eventEntry = entry as EventTimingEntry;
          const duration = Math.round(
            eventEntry.processingEnd - eventEntry.processingStart
          );
          setKeyPressDurations((durations) => [
            duration,
            ...durations.slice(0, 9),
          ]);
        }
      });
    });

    observer.observe({
      durationThreshold: 16,
      type: 'event',
    } as EventTimingObserverInit);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!SUPPORTS_LOAF_TIMING) return;

    let afterOperation = false;
    const unsubscribe = editor.subscribeCommit((change) => {
      if (change.operations.length) {
        afterOperation = true;
      }
    });

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (afterOperation) {
          setLastLongAnimationFrameDuration(Math.round(entry.duration));
          afterOperation = false;
        }
      });
    });

    // Register the observer for events
    observer.observe({ type: 'long-animation-frame' });

    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [editor]);

  return (
    <div className="performance-controls">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor="huge-document-blocks">Blocks:</Label>
        <NativeSelect
          id="huge-document-blocks"
          onChange={(event) =>
            setConfig({
              blocks: Number.parseInt(event.target.value, 10),
            })
          }
          value={config.blocks}
        >
          {visibleBlocksOptions.map((blocks) => (
            <NativeSelectOption key={blocks} value={blocks}>
              {formatBlocksOption(blocks)}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      <Collapsible onOpenChange={setConfigurationOpen} open={configurationOpen}>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost">
            Configuration
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="huge-document-content-visibility">
              Set <code>content-visibility: auto</code> on:
            </Label>
            <NativeSelect
              id="huge-document-content-visibility"
              onChange={(event) =>
                setConfig({
                  contentVisibilityMode: toContentVisibilityMode(
                    event.target.value
                  ),
                })
              }
              value={config.contentVisibilityMode}
            >
              <NativeSelectOption value="none">None</NativeSelectOption>
              <NativeSelectOption value="element">Elements</NativeSelectOption>
            </NativeSelect>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="huge-document-dom-strategy">DOM strategy:</Label>
            <NativeSelect
              id="huge-document-dom-strategy"
              onChange={(event) =>
                setConfig({
                  domStrategyMode: event.target
                    .value as Config['domStrategyMode'],
                })
              }
              value={config.domStrategyMode}
            >
              <NativeSelectOption value="auto">Auto</NativeSelectOption>
              <NativeSelectOption value="full">Full</NativeSelectOption>
              <NativeSelectOption value="staged">Staged</NativeSelectOption>
              <NativeSelectOption value="virtualized">
                Virtualized
              </NativeSelectOption>
            </NativeSelect>
          </div>

          {config.domStrategyMode === 'virtualized' && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="huge-document-overscan">Overscan:</Label>
                <Input
                  id="huge-document-overscan"
                  min={0}
                  onChange={(event) =>
                    setConfig({
                      domStrategyOverscan: Number.parseInt(
                        event.target.value,
                        10
                      ),
                    })
                  }
                  type="number"
                  value={config.domStrategyOverscan}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="huge-document-threshold">Threshold:</Label>
                <Input
                  id="huge-document-threshold"
                  min={1}
                  onChange={(event) =>
                    setConfig({
                      domStrategyThreshold: Number.parseInt(
                        event.target.value,
                        10
                      ),
                    })
                  }
                  type="number"
                  value={config.domStrategyThreshold}
                />
              </div>
            </>
          )}

          {hasBoundedEditableScroller(config) && (
            <>
              {config.domStrategyMode === 'virtualized' && (
                <div className="flex flex-wrap items-center gap-2">
                  <Label htmlFor="huge-document-estimated-block-size">
                    Estimated block size:
                  </Label>
                  <Input
                    id="huge-document-estimated-block-size"
                    min={1}
                    onChange={(event) =>
                      setConfig({
                        virtualizedEstimatedBlockSize: Number.parseInt(
                          event.target.value,
                          10
                        ),
                      })
                    }
                    type="number"
                    value={config.virtualizedEstimatedBlockSize}
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Label htmlFor="huge-document-editor-height">
                  Editor height:
                </Label>
                <Input
                  id="huge-document-editor-height"
                  min={120}
                  onChange={(event) =>
                    setConfig({
                      editorHeight: Number.parseInt(event.target.value, 10),
                    })
                  }
                  type="number"
                  value={config.editorHeight}
                />
              </div>
            </>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Switch
              checked={config.showSelectedHeadings}
              id="huge-document-show-selected-headings"
              onCheckedChange={(checked) =>
                setConfig({
                  showSelectedHeadings: checked,
                })
              }
            />
            <Label htmlFor="huge-document-show-selected-headings">
              Call <code>useElementSelected</code> in each heading
            </Label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Switch
              checked={config.strictMode}
              id="huge-document-strict-mode"
              onCheckedChange={(checked) =>
                setConfig({
                  strictMode: checked,
                })
              }
            />
            <Label htmlFor="huge-document-strict-mode">
              React strict mode (only works in localhost)
            </Label>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Collapsible defaultOpen>
        <CollapsibleTrigger asChild>
          <Button type="button" variant="ghost">
            Statistics
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <p>
            Last keypress (ms):{' '}
            {SUPPORTS_EVENT_TIMING
              ? (lastKeyPressDuration ?? '-')
              : 'Not supported'}
          </p>

          <p>
            Average of last 10 keypresses (ms):{' '}
            {SUPPORTS_EVENT_TIMING
              ? (averageKeyPressDuration ?? '-')
              : 'Not supported'}
          </p>

          <p>
            Last long animation frame (ms):{' '}
            {SUPPORTS_LOAF_TIMING
              ? (lastLongAnimationFrameDuration ?? '-')
              : 'Not supported'}
          </p>

          <p>
            Requested DOM strategy:{' '}
            <output data-test-id="huge-document-requested-strategy">
              {formatMetric(domStrategyMetrics?.requestedStrategy)}
            </output>
          </p>

          <p>
            Effective DOM strategy:{' '}
            <output data-test-id="huge-document-effective-strategy">
              {formatMetric(domStrategyMetrics?.effectiveStrategy)}
            </output>
          </p>

          <p>
            Mounted top-level blocks:{' '}
            <output data-test-id="huge-document-mounted-top-level-count">
              {formatMetric(domStrategyMetrics?.mountedTopLevelCount)}
            </output>
          </p>

          <p>
            Pending top-level blocks:{' '}
            <output data-test-id="huge-document-pending-top-level-count">
              {formatMetric(domStrategyMetrics?.pendingTopLevelCount)}
            </output>
          </p>

          <p>
            DOM coverage boundaries:{' '}
            <output data-test-id="huge-document-dom-coverage-boundary-count">
              {formatMetric(domStrategyMetrics?.domCoverageBoundaryCount)}
            </output>
          </p>

          <p>
            DOM nodes:{' '}
            <output data-test-id="huge-document-dom-node-count">
              {formatMetric(domStrategyMetrics?.domNodeCount)}
            </output>
          </p>

          <p>
            Virtualized viewport boundaries:{' '}
            <output data-test-id="huge-document-viewport-boundary-count">
              {formatMetric(
                domStrategyMetrics?.viewportVirtualizationBoundaryCount
              )}
            </output>
          </p>

          {SUPPORTS_EVENT_TIMING && lastKeyPressDuration === null && (
            <p>Events shorter than 16ms may not be detected.</p>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default HugeDocumentExample;
