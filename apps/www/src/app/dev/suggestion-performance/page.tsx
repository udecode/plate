'use client';

import type { Value } from 'platejs';
import { DefaultAuthoredPlugin } from 'platejs/authored';
import {
  createEditor,
  EditorContainer,
  EditorRoot,
  type Editor,
  useEditor,
} from 'platejs/react';
import { VirtualizedEditorContent } from 'platejs/react/virtualized';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import * as React from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { SuggestionKit } from '@/registry/components/editor/suggestion';

import { getSuggestionViewStore } from '../../../../../../packages/platejs/src/react/features/suggestion/suggestion-view.internal';
import { DecorationContext } from '../../../../../../packages/plitejs/src/react/decoration-context';
import {
  SUGGESTION_PERFORMANCE_CASES,
  type SuggestionPerformanceCohort,
  type SuggestionPerformanceCounterDelta,
  type SuggestionPerformanceHarness,
  type SuggestionPerformanceLatency,
  type SuggestionPerformanceMetrics,
  type SuggestionPerformancePass,
  type SuggestionPerformanceResult,
} from './contract';

const PASS_COUNT = 3;
const SAMPLES_PER_PASS = 50;
const STABILITY_PASSES = 5;
const WARMUPS_PER_PASS = 10;
const ACTIVE_ATTRIBUTE = 'data-editor-suggestion-active';

type MeasuredDecorationStore = Readonly<{
  getMetrics: () => SuggestionPerformanceMetrics;
}>;

type Fixture = Readonly<{
  authoredFingerprint: string;
  changeIds: readonly [string, string];
  editor: Editor;
}>;

type SuggestionRefreshStore = NonNullable<
  ReturnType<typeof getSuggestionViewStore>
>;

type MountedView = Readonly<{
  editor: Editor;
  manager: MeasuredDecorationStore;
  refreshStore: SuggestionRefreshStore;
  root: HTMLElement;
}>;

const summarize = (
  samples: readonly number[]
): SuggestionPerformanceLatency => {
  const sorted = [...samples].sort((left, right) => left - right);

  if (sorted.length === 0) {
    return { max: 0, mean: 0, min: 0, p95: 0, p99: 0, samples: [] };
  }

  const percentile = (ratio: number) =>
    sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * ratio) - 1)];

  return {
    max: sorted.at(-1) ?? 0,
    mean: samples.reduce((total, sample) => total + sample, 0) / samples.length,
    min: sorted[0],
    p95: percentile(0.95),
    p99: percentile(0.99),
    samples: [...samples],
  };
};

const counterDelta = (
  before: SuggestionPerformanceMetrics,
  after: SuggestionPerformanceMetrics
): SuggestionPerformanceCounterDelta => ({
  changedBucketCount: after.changedBucketCount - before.changedBucketCount,
  sourceReadCount: after.sourceReadCount - before.sourceReadCount,
  wakeCount: after.wakeCount - before.wakeCount,
});

const maxCounterDelta = (
  current: SuggestionPerformanceCounterDelta,
  candidate: SuggestionPerformanceCounterDelta
): SuggestionPerformanceCounterDelta => ({
  changedBucketCount: Math.max(
    current.changedBucketCount,
    candidate.changedBucketCount
  ),
  sourceReadCount: Math.max(current.sourceReadCount, candidate.sourceReadCount),
  wakeCount: Math.max(current.wakeCount, candidate.wakeCount),
});

const assertCounterDelta = (
  actual: SuggestionPerformanceCounterDelta,
  expected: SuggestionPerformanceCounterDelta,
  label: string
) => {
  if (
    actual.changedBucketCount !== expected.changedBucketCount ||
    actual.sourceReadCount !== expected.sourceReadCount ||
    actual.wakeCount !== expected.wakeCount
  ) {
    throw new Error(
      `${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`
    );
  }
};

const assertBoundedCounterDelta = (
  actual: SuggestionPerformanceCounterDelta,
  maximum: number,
  label: string
) => {
  if (
    actual.changedBucketCount < 0 ||
    actual.changedBucketCount > maximum ||
    actual.sourceReadCount < 0 ||
    actual.sourceReadCount > maximum ||
    actual.wakeCount < 0 ||
    actual.wakeCount > maximum
  ) {
    throw new Error(
      `${label}: expected counters between 0 and ${maximum}, received ${JSON.stringify(actual)}`
    );
  }
};

const authoredFingerprint = (editor: Editor) =>
  editor
    .plugin(DefaultAuthoredPlugin)
    .read.changes()
    .items.map(({ id, revision, status }) => `${id}:${revision}:${status}`)
    .join('|');

const changeBlockIndexes = (nodeCount: number, changeCount: number) =>
  Array.from({ length: changeCount }, (_, index) => {
    if (index < 2) return index;

    return (
      2 +
      Math.floor(((index - 2) * (nodeCount - 2)) / Math.max(changeCount - 2, 1))
    );
  });

const createFixture = (cohort: SuggestionPerformanceCohort): Fixture => {
  const config = SUGGESTION_PERFORMANCE_CASES[cohort];
  const initialValue: Value = Array.from(
    { length: config.nodeCount },
    (_, index) => ({
      children: [{ text: `Suggestion performance node ${index}` }],
      type: 'paragraph',
    })
  );
  const editor = createEditor({
    initialValue,
    plugins: [...BasicBlocksKit, ...SuggestionKit],
    userId: 'suggestion-performance',
  });
  const changeIds: string[] = [];

  editor.plugin(SuggestionPlugin).api.setMode('suggesting');
  for (const blockIndex of changeBlockIndexes(
    config.nodeCount,
    config.changeCount
  )) {
    editor.update((transaction) => {
      const text = `Suggestion performance node ${blockIndex}`;

      changeIds.push(transaction.authored.propose());
      transaction.text.insert('!', {
        at: { offset: text.length, path: [blockIndex, 0] },
      });
    });
  }

  if (
    changeIds.length !== config.changeCount ||
    !changeIds[0] ||
    !changeIds[1]
  ) {
    throw new Error(
      'Suggestion performance fixture did not create its changes'
    );
  }

  return {
    authoredFingerprint: authoredFingerprint(editor),
    changeIds: [changeIds[0], changeIds[1]],
    editor,
  };
};

const activeMarker = (view: MountedView, changeId: string) =>
  view.root.querySelector<HTMLElement>(
    `[data-editor-authored-change="${CSS.escape(changeId)}"][${ACTIVE_ATTRIBUTE}]`
  );

const marker = (view: MountedView, changeId: string) => {
  const element = view.root.querySelector<HTMLElement>(
    `[data-editor-authored-change="${CSS.escape(changeId)}"]`
  );

  if (!element) {
    throw new Error(`Mounted view is missing suggestion marker ${changeId}`);
  }

  return element;
};

const waitForActiveMarker = (
  view: MountedView,
  changeId: string,
  startedAt: { value: number }
) =>
  new Promise<number>((resolve, reject) => {
    if (activeMarker(view, changeId)) {
      resolve(performance.now() - startedAt.value);
      return;
    }

    const observer = new MutationObserver(() => {
      if (!activeMarker(view, changeId)) return;

      globalThis.clearTimeout(timeout);
      observer.disconnect();
      resolve(performance.now() - startedAt.value);
    });
    const timeout = globalThis.setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Suggestion ${changeId} did not become active`));
    }, 5000);

    observer.observe(view.root, {
      attributeFilter: [ACTIVE_ATTRIBUTE],
      attributes: true,
      subtree: true,
    });
  });

const waitForSemanticInvalidation = (
  store: SuggestionRefreshStore,
  expectedNodeKeys: number,
  startedAt: { value: number }
) =>
  new Promise<number>((resolve, reject) => {
    let stop = () => {};
    const timeout = globalThis.setTimeout(() => {
      stop();
      reject(
        new Error('Suggestion activation did not invalidate semantic keys')
      );
    }, 5000);

    stop = store.subscribeRefresh((nodeKeys) => {
      globalThis.clearTimeout(timeout);
      stop();
      if (nodeKeys.length !== expectedNodeKeys) {
        reject(
          new Error(
            `Expected ${expectedNodeKeys} semantic node keys, received ${nodeKeys.length}`
          )
        );
        return;
      }
      resolve(performance.now() - startedAt.value);
    });
  });

const waitForNoActiveMarker = (view: MountedView) =>
  new Promise<void>((resolve, reject) => {
    if (!view.root.querySelector(`[${ACTIVE_ATTRIBUTE}]`)) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      if (view.root.querySelector(`[${ACTIVE_ATTRIBUTE}]`)) return;

      globalThis.clearTimeout(timeout);
      observer.disconnect();
      resolve();
    });
    const timeout = globalThis.setTimeout(() => {
      observer.disconnect();
      reject(
        new Error('Mounted suggestion view did not clear its active marker')
      );
    }, 5000);

    observer.observe(view.root, {
      attributeFilter: [ACTIVE_ATTRIBUTE],
      attributes: true,
      subtree: true,
    });
  });

const clearActiveMarkers = async (
  views: readonly [MountedView, MountedView]
) => {
  for (const view of views) {
    const editable = view.root.querySelector<HTMLElement>(
      '[data-editor="true"]'
    );

    if (!editable) {
      throw new Error('Mounted suggestion view is missing its editor');
    }
    if (!view.root.querySelector(`[${ACTIVE_ATTRIBUTE}]`)) continue;

    const cleared = waitForNoActiveMarker(view);

    editable.click();
    await cleared;
  }
};

const assertViewHealth = (view: MountedView, label: string) => {
  const metrics = view.manager.getMetrics();

  if (metrics.sourceObserverCount !== 1) {
    throw new Error(
      `${label}: expected one suggestion source observer, received ${metrics.sourceObserverCount}`
    );
  }
  if (metrics.failureCount !== 0 || metrics.invalidRangeDropCount !== 0) {
    throw new Error(
      `${label}: decoration manager reported ${JSON.stringify(metrics)}`
    );
  }
};

const measureClick = async ({
  activeView,
  changeId,
  expectedActiveDelta = 2,
  siblingView,
}: {
  activeView: MountedView;
  changeId: string;
  expectedActiveDelta?: 1 | 2;
  siblingView: MountedView;
}) => {
  const activeBefore = activeView.manager.getMetrics();
  const siblingBefore = siblingView.manager.getMetrics();
  const startedAt = { value: 0 };
  const target = marker(activeView, changeId);
  const activeReady = waitForActiveMarker(activeView, changeId, startedAt);
  const semanticReady = waitForSemanticInvalidation(
    activeView.refreshStore,
    expectedActiveDelta,
    startedAt
  );

  startedAt.value = performance.now();
  target.click();
  const [semanticLatency, domLatency] = await Promise.all([
    semanticReady,
    activeReady,
  ]);
  const activeAfter = activeView.manager.getMetrics();
  const siblingAfter = siblingView.manager.getMetrics();
  const activeDelta = counterDelta(activeBefore, activeAfter);
  const siblingDelta = counterDelta(siblingBefore, siblingAfter);

  assertBoundedCounterDelta(
    activeDelta,
    expectedActiveDelta,
    'active view click fanout'
  );
  assertCounterDelta(
    siblingDelta,
    { changedBucketCount: 0, sourceReadCount: 0, wakeCount: 0 },
    'sibling view click fanout'
  );
  assertViewHealth(activeView, 'active view');
  assertViewHealth(siblingView, 'sibling view');

  if (activeView.root.querySelectorAll(`[${ACTIVE_ATTRIBUTE}]`).length !== 1) {
    throw new Error(
      'Active suggestion view must paint exactly one active marker'
    );
  }
  if (siblingView.root.querySelector(`[${ACTIVE_ATTRIBUTE}]`)) {
    throw new Error(
      'Sibling suggestion view painted another view active state'
    );
  }

  return { activeDelta, domLatency, semanticLatency, siblingDelta };
};

const runPass = async (
  views: readonly [MountedView, MountedView],
  changeIds: readonly [string, string],
  activeViewIndex: 0 | 1
): Promise<SuggestionPerformancePass> => {
  await clearActiveMarkers(views);
  const activeView = views[activeViewIndex];
  const siblingView = views[activeViewIndex === 0 ? 1 : 0];

  for (let index = 0; index < WARMUPS_PER_PASS; index++) {
    await measureClick({
      activeView,
      changeId: changeIds[index % changeIds.length],
      expectedActiveDelta: index === 0 ? 1 : 2,
      siblingView,
    });
  }

  const semanticSamples: number[] = [];
  const domSamples: number[] = [];
  let maxActiveDelta: SuggestionPerformanceCounterDelta = {
    changedBucketCount: 0,
    sourceReadCount: 0,
    wakeCount: 0,
  };
  let maxSiblingDelta = maxActiveDelta;

  for (let index = 0; index < SAMPLES_PER_PASS; index++) {
    const sample = await measureClick({
      activeView,
      changeId: changeIds[index % changeIds.length],
      siblingView,
    });

    semanticSamples.push(sample.semanticLatency);
    domSamples.push(sample.domLatency);
    maxActiveDelta = maxCounterDelta(maxActiveDelta, sample.activeDelta);
    maxSiblingDelta = maxCounterDelta(maxSiblingDelta, sample.siblingDelta);
  }

  return {
    activeView: activeViewIndex,
    clickCount: SAMPLES_PER_PASS,
    dom: summarize(domSamples),
    maxActiveDelta,
    maxSiblingDelta,
    semantic: summarize(semanticSamples),
  };
};

const createHarness = ({
  cohort,
  fixture,
  views,
}: {
  cohort: SuggestionPerformanceCohort;
  fixture: Fixture;
  views: readonly [MountedView, MountedView];
}): SuggestionPerformanceHarness => ({
  async run(): Promise<SuggestionPerformanceResult> {
    const modelBefore = JSON.stringify(fixture.editor.read.children());
    const selectionBefore = JSON.stringify(
      views.map((view) => view.editor.read.selection())
    );

    for (let index = 0; index < STABILITY_PASSES; index++) {
      await clearActiveMarkers(views);
      const activeViewIndex = (index % 2) as 0 | 1;

      await measureClick({
        activeView: views[activeViewIndex],
        changeId: fixture.changeIds[index % fixture.changeIds.length],
        expectedActiveDelta: 1,
        siblingView: views[activeViewIndex === 0 ? 1 : 0],
      });
    }

    const passes: SuggestionPerformancePass[] = [];

    for (let index = 0; index < PASS_COUNT; index++) {
      passes.push(
        await runPass(views, fixture.changeIds, (index % 2) as 0 | 1)
      );
    }

    return {
      authoredStateUnchanged:
        authoredFingerprint(fixture.editor) === fixture.authoredFingerprint,
      changeCount: SUGGESTION_PERFORMANCE_CASES[cohort].changeCount,
      cohort,
      distinctViewManagers: views[0].manager !== views[1].manager,
      modelUnchanged:
        JSON.stringify(fixture.editor.read.children()) === modelBefore,
      mountedViewCount: views.length,
      nodeCount: SUGGESTION_PERFORMANCE_CASES[cohort].nodeCount,
      passes,
      selectionUnchanged:
        JSON.stringify(views.map((view) => view.editor.read.selection())) ===
        selectionBefore,
      sourceObserverCounts: [
        views[0].manager.getMetrics().sourceObserverCount,
        views[1].manager.getMetrics().sourceObserverCount,
      ],
      stabilityPasses: STABILITY_PASSES,
    };
  },
});

function MetricsProbe({
  index,
  onView,
}: {
  index: 0 | 1;
  onView: (
    index: 0 | 1,
    editor: Editor | null,
    manager: MeasuredDecorationStore | null
  ) => void;
}) {
  const editor = useEditor();
  const manager = React.useContext(DecorationContext) as
    | (MeasuredDecorationStore & object)
    | null;

  React.useLayoutEffect(() => {
    if (!manager || typeof manager.getMetrics !== 'function') {
      throw new Error(
        'Suggestion performance metrics require a decoration manager'
      );
    }

    onView(index, editor, manager);
    return () => onView(index, null, null);
  }, [editor, index, manager, onView]);

  return null;
}

const isCohort = (value: string | null): value is SuggestionPerformanceCohort =>
  value !== null && Object.hasOwn(SUGGESTION_PERFORMANCE_CASES, value);

export default function SuggestionPerformancePage() {
  const [cohort, setCohort] =
    React.useState<SuggestionPerformanceCohort | null>(null);
  const [failure, setFailure] = React.useState<string | null>(null);
  const [fixture, setFixture] = React.useState<Fixture | null>(null);
  const [probeVersion, setProbeVersion] = React.useState(0);
  const startedRef = React.useRef(false);
  const managerRefs = React.useRef<
    [MeasuredDecorationStore | null, MeasuredDecorationStore | null]
  >([null, null]);
  const editorRefs = React.useRef<[Editor | null, Editor | null]>([null, null]);
  const viewRootRefs = React.useRef<[HTMLElement | null, HTMLElement | null]>([
    null,
    null,
  ]);

  const onView = React.useCallback(
    (
      index: 0 | 1,
      editor: Editor | null,
      manager: MeasuredDecorationStore | null
    ) => {
      editorRefs.current[index] = editor;
      managerRefs.current[index] = manager;
      setProbeVersion((version) => version + 1);
    },
    []
  );

  React.useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    queueMicrotask(() => {
      const requested = new URLSearchParams(window.location.search).get(
        'cohort'
      );

      if (!isCohort(requested)) {
        setFailure(
          `Unknown suggestion performance cohort: ${requested ?? 'missing'}`
        );
        return;
      }

      setCohort(requested);
      try {
        setFixture(createFixture(requested));
      } catch (error) {
        setFailure(error instanceof Error ? error.message : String(error));
      }
    });
  }, []);

  React.useEffect(() => {
    if (!cohort || !fixture) return undefined;
    const firstManager = managerRefs.current[0];
    const secondManager = managerRefs.current[1];
    const firstEditor = editorRefs.current[0];
    const secondEditor = editorRefs.current[1];
    const firstRoot = viewRootRefs.current[0];
    const secondRoot = viewRootRefs.current[1];

    if (
      !firstEditor ||
      !secondEditor ||
      !firstManager ||
      !secondManager ||
      !firstRoot ||
      !secondRoot
    ) {
      return undefined;
    }
    const firstRefreshStore = getSuggestionViewStore(firstEditor);
    const secondRefreshStore = getSuggestionViewStore(secondEditor);

    if (!firstRefreshStore || !secondRefreshStore) return undefined;
    const views = [
      {
        editor: firstEditor,
        manager: firstManager,
        refreshStore: firstRefreshStore,
        root: firstRoot,
      },
      {
        editor: secondEditor,
        manager: secondManager,
        refreshStore: secondRefreshStore,
        root: secondRoot,
      },
    ] as const;

    try {
      for (const [index, view] of views.entries()) {
        assertViewHealth(view, `mounted view ${index}`);
        for (const changeId of fixture.changeIds) marker(view, changeId);
      }
    } catch (error) {
      queueMicrotask(() => {
        setFailure(error instanceof Error ? error.message : String(error));
      });
      return undefined;
    }

    const harness = createHarness({ cohort, fixture, views });

    window.__suggestionPerformanceHarness = harness;
    document.documentElement.dataset.suggestionPerformanceReady = cohort;

    return () => {
      if (window.__suggestionPerformanceHarness === harness) {
        delete window.__suggestionPerformanceHarness;
      }
      delete document.documentElement.dataset.suggestionPerformanceReady;
    };
  }, [cohort, fixture, probeVersion]);

  if (failure) {
    return <output data-suggestion-performance-error>{failure}</output>;
  }
  if (!cohort || !fixture) {
    return (
      <output data-suggestion-performance-loading>Building fixture</output>
    );
  }

  return (
    <main data-suggestion-performance-cohort={cohort}>
      {([0, 1] as const).map((index) => (
        <section
          key={index}
          ref={(element) => {
            viewRootRefs.current[index] = element;
          }}
          data-suggestion-performance-view={index}
        >
          <EditorRoot readOnly editor={fixture.editor} suppressInstanceWarning>
            <MetricsProbe index={index} onView={onView} />
            <EditorContainer
              style={{
                height: 320,
                overflowY: 'auto',
                position: 'relative',
              }}
            >
              <VirtualizedEditorContent
                aria-label={`Suggestion performance view ${index + 1}`}
                estimatedBlockSize={32}
                overscan={4}
              />
            </EditorContainer>
          </EditorRoot>
        </section>
      ))}
    </main>
  );
}
