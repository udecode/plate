import { faker } from '@faker-js/faker';
import {
  parseAsBoolean,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
} from 'nuqs';
import type { Editor, Value } from 'plitejs';
import { history } from 'plitejs/history';
import {
  createEditor as createReactEditor,
  Editable,
  type RenderElementProps,
  EditorRoot,
  useElementSelected,
} from 'plitejs/react';
import { VirtualizedEditable } from 'plitejs/react/virtualized';
import React, {
  type CSSProperties,
  StrictMode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  renderingMode: 'complete' | 'virtualized';
  virtualizedOverscan: number;
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
const renderingModeOptions = ['complete', 'virtualized'] as const;

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
  renderingMode: parseAsStringLiteral(renderingModeOptions)
    .withDefault('virtualized')
    .withOptions({ clearOnDefault: false }),
  virtualizedOverscan: parseAsBoundedInteger(0, 1000).withDefault(0),
  editorHeight: parseAsBoundedInteger(120, 2000).withDefault(420),
  showSelectedHeadings: parseAsBoolean.withDefault(false),
  strictMode: parseAsBoolean.withDefault(false),
  virtualizedEstimatedBlockSize: parseAsBoundedInteger(1, 1000).withDefault(48),
};

const hugeDocumentUrlKeys = {
  contentVisibilityMode: 'content_visibility',
  documentSeed: 'seed',
  renderingMode: 'rendering',
  virtualizedOverscan: 'overscan',
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
  const initialValue: Array<Value[number]> = [];
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
// React-owned examples should use `useEditor`.
const createEditor = (_config: Config, initialValue: Value) =>
  createReactEditor({ plugins: [history()], initialValue });

type SurfaceStatistics = {
  boundaryCount: number;
  domNodeCount: number;
  mountedBlockCount: number;
};

const useSurfaceStatistics = (
  rootRef: React.RefObject<HTMLDivElement | null>,
  renderingMode: Config['renderingMode'],
  version: number
) => {
  const [statistics, setStatistics] = useState<SurfaceStatistics | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) return undefined;

    const measure = () => {
      const mountedBlockCount =
        renderingMode === 'virtualized'
          ? root.querySelectorAll('[data-editor-virtualized-row]').length
          : root.querySelectorAll(':scope > [data-editor-node="element"]')
              .length;

      setStatistics({
        boundaryCount: root.querySelectorAll('[data-editor-viewport-boundary]')
          .length,
        domNodeCount: root.querySelectorAll('*').length + 1,
        mountedBlockCount,
      });
    };
    const observer = new MutationObserver(measure);

    measure();
    observer.observe(root, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [renderingMode, rootRef, version]);

  return statistics;
};

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
  const editableRef = useRef<HTMLDivElement>(null);
  const surfaceStatistics = useSurfaceStatistics(
    editableRef,
    config.renderingMode,
    editorVersion
  );

  const setConfig = useCallback(
    (partialConfig: Partial<Config>) => {
      const newConfig = { ...config, ...partialConfig };

      setIsRendering(true);
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
      }, 0);
    },
    [config, setQueryConfig]
  );

  useEffect(() => {
    const initialValueKey = `${config.documentSeed}:${config.blocks}`;

    if (editorInitialValueKeyRef.current === initialValueKey) {
      return undefined;
    }

    let replaceTimeout: ReturnType<typeof setTimeout> | undefined;

    const renderTimeout = setTimeout(() => {
      setIsRendering(true);

      replaceTimeout = setTimeout(() => {
        const nextInitialValue = getInitialValue(
          config.blocks,
          config.documentSeed
        );

        editorInitialValueKeyRef.current = initialValueKey;
        setIsRendering(false);
        setEditor(createEditor(config, nextInitialValue));
        setEditorVersion((n) => n + 1);
      }, 0);
    }, 0);

    return () => {
      clearTimeout(renderTimeout);

      if (replaceTimeout) {
        clearTimeout(replaceTimeout);
      }
    };
  }, [config]);

  const editableStyle = useMemo<CSSProperties>(
    () => ({
      height: config.editorHeight,
      outline: '1px solid #ddd',
      overflowY: 'auto',
      scrollbarGutter: 'stable',
    }),
    [config.editorHeight]
  );

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
      <EditorRoot editor={editor} key={editorVersion}>
        {config.renderingMode === 'virtualized' ? (
          <VirtualizedEditable
            autoFocus
            estimatedBlockSize={config.virtualizedEstimatedBlockSize}
            id="huge-document-editor"
            overscan={config.virtualizedOverscan}
            placeholder="Enter some text…"
            ref={editableRef}
            renderElement={Element}
            spellCheck
            style={editableStyle}
          />
        ) : (
          <Editable
            autoFocus
            id="huge-document-editor"
            placeholder="Enter some text…"
            ref={editableRef}
            renderElement={Element}
            spellCheck
            style={editableStyle}
          />
        )}
      </EditorRoot>
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
        editor={editor}
        setConfig={setConfig}
        surfaceStatistics={surfaceStatistics}
      />

      {editableWithStrictMode}
    </>
  );
};

const Heading = ({
  children,
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

  return (
    <h1 ref={ref} {...props} style={styleProp}>
      {children}
    </h1>
  );
};

const SelectedHeading = ({
  children,
  style: styleProp,
  ref,
  ...props
}: React.ComponentProps<'h1'> & {
  ref?: React.Ref<HTMLHeadingElement>;
}) => {
  const selected = useElementSelected();
  const style = { ...styleProp, color: selected ? 'green' : undefined };
  return (
    <h1 ref={ref} {...props} style={style}>
      {children}
    </h1>
  );
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
    case 'heading-one': {
      return (
        <Heading
          {...attributes}
          showSelectedHeadings={showSelectedHeadings}
          style={style}
        >
          {children}
        </Heading>
      );
    }
    default: {
      return (
        <Paragraph {...attributes} style={style}>
          {children}
        </Paragraph>
      );
    }
  }
};

const PerformanceControls = ({
  editor,
  config,
  setConfig,
  surfaceStatistics,
}: {
  editor: Editor;
  config: Config;
  setConfig: SetConfig;
  surfaceStatistics: SurfaceStatistics | null;
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
    if (!SUPPORTS_EVENT_TIMING) return undefined;

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

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!SUPPORTS_LOAF_TIMING) return undefined;

    let afterDocumentChange = false;
    const unsubscribe = editor.subscribeCommit((commit) => {
      if (commit.changed.has('document')) {
        afterDocumentChange = true;
      }
    });

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (afterDocumentChange) {
          setLastLongAnimationFrameDuration(Math.round(entry.duration));
          afterDocumentChange = false;
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
          onChange={(event) => {
            setConfig({
              blocks: Number.parseInt(event.target.value, 10),
            });
          }}
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
              onChange={(event) => {
                setConfig({
                  contentVisibilityMode: toContentVisibilityMode(
                    event.target.value
                  ),
                });
              }}
              value={config.contentVisibilityMode}
            >
              <NativeSelectOption value="none">None</NativeSelectOption>
              <NativeSelectOption value="element">Elements</NativeSelectOption>
            </NativeSelect>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="huge-document-rendering">Rendering:</Label>
            <NativeSelect
              id="huge-document-rendering"
              onChange={(event) => {
                setConfig({
                  renderingMode: event.target.value as Config['renderingMode'],
                });
              }}
              value={config.renderingMode}
            >
              <NativeSelectOption value="complete">
                Complete DOM
              </NativeSelectOption>
              <NativeSelectOption value="virtualized">
                Virtualized
              </NativeSelectOption>
            </NativeSelect>
          </div>

          {config.renderingMode === 'virtualized' && (
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="huge-document-overscan">Overscan:</Label>
              <Input
                id="huge-document-overscan"
                min={0}
                onChange={(event) => {
                  setConfig({
                    virtualizedOverscan: Number.parseInt(
                      event.target.value,
                      10
                    ),
                  });
                }}
                type="number"
                value={config.virtualizedOverscan}
              />
            </div>
          )}

          {config.renderingMode === 'virtualized' && (
            <div className="flex flex-wrap items-center gap-2">
              <Label htmlFor="huge-document-estimated-block-size">
                Estimated block size:
              </Label>
              <Input
                id="huge-document-estimated-block-size"
                min={1}
                onChange={(event) => {
                  setConfig({
                    virtualizedEstimatedBlockSize: Number.parseInt(
                      event.target.value,
                      10
                    ),
                  });
                }}
                type="number"
                value={config.virtualizedEstimatedBlockSize}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="huge-document-editor-height">Editor height:</Label>
            <Input
              id="huge-document-editor-height"
              min={120}
              onChange={(event) => {
                setConfig({
                  editorHeight: Number.parseInt(event.target.value, 10),
                });
              }}
              type="number"
              value={config.editorHeight}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Switch
              checked={config.showSelectedHeadings}
              id="huge-document-show-selected-headings"
              onCheckedChange={(checked) => {
                setConfig({
                  showSelectedHeadings: checked,
                });
              }}
            />
            <Label htmlFor="huge-document-show-selected-headings">
              Call <code>useElementSelected</code> in each heading
            </Label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Switch
              checked={config.strictMode}
              id="huge-document-strict-mode"
              onCheckedChange={(checked) => {
                setConfig({
                  strictMode: checked,
                });
              }}
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
            Rendering mode:{' '}
            <output data-test-id="huge-document-rendering-mode">
              {config.renderingMode}
            </output>
          </p>

          <p>
            Mounted top-level blocks:{' '}
            <output data-test-id="huge-document-mounted-top-level-count">
              {surfaceStatistics?.mountedBlockCount ?? '-'}
            </output>
          </p>

          <p>
            Pending top-level blocks:{' '}
            <output data-test-id="huge-document-pending-top-level-count">
              {surfaceStatistics
                ? Math.max(
                    0,
                    config.blocks - surfaceStatistics.mountedBlockCount
                  )
                : '-'}
            </output>
          </p>

          <p>
            DOM coverage boundaries:{' '}
            <output data-test-id="huge-document-dom-coverage-boundary-count">
              {surfaceStatistics?.boundaryCount ?? '-'}
            </output>
          </p>

          <p>
            DOM nodes:{' '}
            <output data-test-id="huge-document-dom-node-count">
              {surfaceStatistics?.domNodeCount ?? '-'}
            </output>
          </p>

          <p>
            Virtualized viewport boundaries:{' '}
            <output data-test-id="huge-document-viewport-boundary-count">
              {surfaceStatistics?.boundaryCount ?? '-'}
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
