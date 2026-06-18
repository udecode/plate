import type {
  SlateBrowserScenarioStep,
  SlateBrowserWarmLoopOptions,
  SlateBrowserWarmToolbarArrowGauntletOptions,
} from './types';

const createWarmTimingWaitStep = (label: string): SlateBrowserScenarioStep => ({
  kind: 'settle',
  label,
  timeoutMs: 25,
});

const createToolbarMarkClickStep = (
  label: string,
  markButtonTestId: string
): SlateBrowserScenarioStep => ({
  kind: 'clickTestId',
  label,
  testId: markButtonTestId,
});

/** Create repeated warm-up steps for a scenario packet. */
export const createSlateBrowserWarmLoopSteps = ({
  createIteration,
  iterations = 1,
  label = 'warm-loop',
}: SlateBrowserWarmLoopOptions): SlateBrowserScenarioStep[] => {
  const count = Math.max(1, iterations);

  return Array.from({ length: count }, (_, index) =>
    createIteration(index + 1).map((step) => ({
      ...step,
      iteration: index + 1,
      warmLoop: label,
    }))
  ).flat();
};

const createWarmToolbarArrowIteration = ({
  iteration,
  markDOMSelection,
  markButtonTestId,
  markSelection,
  selectedText,
  selectionAfterArrowLeft,
  selectionAfterCollapse,
}: Omit<
  SlateBrowserWarmToolbarArrowGauntletOptions,
  | 'domCaretAfterInsert'
  | 'insertedText'
  | 'selectionAfterInsert'
  | 'textAfterInsert'
> & {
  iteration: number;
}): SlateBrowserScenarioStep[] => [
  {
    kind: 'selectDOM',
    label: `warm-select-word-${iteration}`,
    selection: markSelection,
  },
  {
    kind: 'assertDOMSelection',
    label: `assert-warm-dom-word-selected-${iteration}`,
    selection: markDOMSelection,
  },
  createToolbarMarkClickStep(`warm-bold-on-${iteration}`, markButtonTestId),
  createWarmTimingWaitStep(`warm-wait-after-bold-on-${iteration}`),
  {
    kind: 'assertSelectedText',
    label: `assert-selection-expanded-after-bold-on-${iteration}`,
    text: selectedText,
  },
  createToolbarMarkClickStep(`warm-bold-off-${iteration}`, markButtonTestId),
  createWarmTimingWaitStep(`warm-wait-after-bold-off-${iteration}`),
  {
    kind: 'assertSelectedText',
    label: `assert-selection-expanded-after-bold-off-${iteration}`,
    text: selectedText,
  },
  {
    key: 'ArrowRight',
    kind: 'press',
    label: `warm-arrow-right-after-bold-off-${iteration}`,
  },
  createWarmTimingWaitStep(`warm-wait-after-arrow-right-${iteration}-1`),
  {
    kind: 'assertSelection',
    label: `assert-selection-collapsed-after-arrow-right-${iteration}-1`,
    selection: selectionAfterCollapse,
  },
  {
    key: 'ArrowLeft',
    kind: 'press',
    label: `warm-arrow-left-after-collapse-${iteration}`,
  },
  createWarmTimingWaitStep(`warm-wait-after-arrow-left-${iteration}`),
  {
    kind: 'assertSelection',
    label: `assert-selection-after-arrow-left-${iteration}`,
    selection: selectionAfterArrowLeft,
  },
  {
    kind: 'assertKernelTrace',
    label: `assert-movement-trace-after-warm-arrows-${iteration}`,
    trace: {
      commandKind: 'move-selection',
      movement: {
        axis: 'horizontal',
        ownership: 'model-owned',
        reason: 'model-horizontal-inline-void',
      },
      transition: { allowed: true },
    },
  },
  {
    key: 'ArrowRight',
    kind: 'press',
    label: `warm-arrow-right-after-arrow-left-${iteration}`,
  },
  createWarmTimingWaitStep(`warm-wait-after-arrow-right-${iteration}-2`),
  {
    kind: 'assertSelection',
    label: `assert-selection-collapsed-after-arrow-right-${iteration}-2`,
    selection: selectionAfterCollapse,
  },
];

/** Create a warm toolbar and arrow-navigation scenario. */
export const createSlateBrowserWarmToolbarArrowGauntlet = ({
  domCaretAfterInsert,
  insertedText,
  markDOMSelection,
  markButtonTestId,
  markSelection,
  selectedText,
  selectionAfterArrowLeft,
  selectionAfterCollapse,
  selectionAfterInsert,
  textAfterInsert,
  warmIterationOverrides,
  warmIterations = 1,
}: SlateBrowserWarmToolbarArrowGauntletOptions): SlateBrowserScenarioStep[] => [
  {
    kind: 'rootMouseDown',
    label: 'activate-editor-before-warm-selection',
  },
  ...createSlateBrowserWarmLoopSteps({
    createIteration: (iteration) =>
      createWarmToolbarArrowIteration({
        iteration,
        markDOMSelection:
          warmIterationOverrides?.[iteration - 1]?.markDOMSelection ??
          markDOMSelection,
        markButtonTestId,
        markSelection:
          warmIterationOverrides?.[iteration - 1]?.markSelection ??
          markSelection,
        selectedText,
        selectionAfterArrowLeft:
          warmIterationOverrides?.[iteration - 1]?.selectionAfterArrowLeft ??
          selectionAfterArrowLeft,
        selectionAfterCollapse:
          warmIterationOverrides?.[iteration - 1]?.selectionAfterCollapse ??
          selectionAfterCollapse,
      }),
    iterations: warmIterations,
    label: 'warm-toolbar-arrow',
  }),
  {
    kind: 'type',
    label: 'warm-type-after-toolbar-arrow',
    text: insertedText,
  },
  {
    kind: 'assertKernelTrace',
    label: 'assert-repair-trace-after-warm-type',
    trace: {
      eventFamily: 'repair',
      repairPolicy: { kind: 'repair-caret' },
      transition: { allowed: true },
    },
  },
  {
    focusOwner: 'editor',
    kind: 'assertFocusOwner',
    label: 'assert-focus-after-warm-type',
  },
  {
    kind: 'assertText',
    label: 'assert-text-after-warm-type',
    text: textAfterInsert,
  },
  {
    kind: 'assertSelection',
    label: 'assert-selection-after-warm-type',
    selection: selectionAfterInsert,
  },
  ...(domCaretAfterInsert
    ? [
        {
          kind: 'assertDOMCaret' as const,
          label: 'assert-dom-caret-after-warm-type',
          offset: domCaretAfterInsert.offset,
          text: domCaretAfterInsert.text,
        },
      ]
    : []),
];
