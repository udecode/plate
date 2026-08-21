import type {
  OffsetExpectation,
  SelectionSnapshotExpectation,
  PliteBrowserNormalizedScenarioMetadata,
  PliteBrowserScenarioMetadata,
  PliteBrowserScenarioReductionCandidate,
  PliteBrowserScenarioReductionCandidateSummary,
  PliteBrowserScenarioReplay,
  PliteBrowserScenarioReplayStep,
  PliteBrowserScenarioStep,
  PliteBrowserTransportClaim,
} from './types';

type ScenarioStepKind = PliteBrowserScenarioStep['kind'];
type ValueValidator = (value: unknown) => boolean;
type ScenarioStepShape = {
  optional?: Record<string, ValueValidator>;
  required?: Record<string, ValueValidator>;
  validate?: (value: Record<string, unknown>) => boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  (Object.getPrototypeOf(value) === Object.prototype ||
    Object.getPrototypeOf(value) === null);

const readJsonArrayValues = (value: unknown[]): unknown[] | null => {
  if (
    Object.keys(value).length !== value.length ||
    Reflect.ownKeys(value).length !== value.length + 1
  ) {
    return null;
  }

  const values: unknown[] = [];

  for (let index = 0; index < value.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, index);

    if (!descriptor?.enumerable || !('value' in descriptor)) return null;

    values.push(descriptor.value);
  }

  return values;
};

const readJsonObjectEntries = (
  value: Record<string, unknown>
): [string, unknown][] | null => {
  const keys = Object.keys(value);

  if (Reflect.ownKeys(value).length !== keys.length) return null;

  const entries: [string, unknown][] = [];

  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor?.enumerable || !('value' in descriptor)) return null;

    entries.push([key, descriptor.value]);
  }

  return entries;
};

const isJsonValue = (
  value: unknown,
  ancestors = new Set<object>()
): boolean => {
  if (
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'string'
  ) {
    return true;
  }

  if (typeof value === 'number') return Number.isFinite(value);
  if (!value || typeof value !== 'object' || ancestors.has(value)) return false;

  const entries = Array.isArray(value)
    ? readJsonArrayValues(value)
    : isRecord(value)
      ? readJsonObjectEntries(value)?.map(([, entry]) => entry)
      : null;

  if (!entries) return false;

  ancestors.add(value);
  const valid = entries.every((entry) => isJsonValue(entry, ancestors));
  ancestors.delete(value);

  return valid;
};

const isJsonRecord = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && isJsonValue(value);
const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean';
const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
const isNonnegativeNumber = (value: unknown): value is number =>
  isNumber(value) && value >= 0;
const isNonnegativeInteger = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0;
const isString = (value: unknown): value is string => typeof value === 'string';
const isNonemptyString: ValueValidator = (value) =>
  isString(value) && value.length > 0;
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);
const isNonemptyStringArray: ValueValidator = (value) =>
  isStringArray(value) && value.length > 0;
const isPath = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every(isNonnegativeInteger);
const isPathOrNull: ValueValidator = (value) => value === null || isPath(value);
const isStringOrStringArray: ValueValidator = (value) =>
  isString(value) || isStringArray(value);
const isOneOf =
  (...values: readonly string[]): ValueValidator =>
  (value) =>
    typeof value === 'string' && values.includes(value);
const isOffsetExpectation: ValueValidator = (value) =>
  isNonnegativeInteger(value) ||
  (Array.isArray(value) &&
    value.length === 2 &&
    value.every((entry) => isNonnegativeInteger(entry)) &&
    value[0] <= value[1]);
const isSelectionPoint = (value: unknown, validateOffset: ValueValidator) =>
  isRecord(value) &&
  isPath(value.path) &&
  validateOffset(value.offset) &&
  Object.keys(value).every((key) => key === 'offset' || key === 'path');
const isSelection = (value: unknown, validateOffset: ValueValidator): boolean =>
  isRecord(value) &&
  value.kind === 'text' &&
  isSelectionPoint(value.anchor, validateOffset) &&
  isSelectionPoint(value.focus, validateOffset) &&
  Object.keys(value).every(
    (key) => key === 'anchor' || key === 'focus' || key === 'kind'
  );
const isSelectionSnapshot: ValueValidator = (value) =>
  isSelection(value, isNonnegativeInteger);
const isSelectionExpectation: ValueValidator = (value) =>
  isSelection(value, isOffsetExpectation);
const isDOMSelectionExpectation: ValueValidator = (value) =>
  isRecord(value) &&
  (value.anchorNodeText === null || isString(value.anchorNodeText)) &&
  isOffsetExpectation(value.anchorOffset) &&
  (value.focusNodeText === null || isString(value.focusNodeText)) &&
  isOffsetExpectation(value.focusOffset) &&
  Object.keys(value).every((key) =>
    ['anchorNodeText', 'anchorOffset', 'focusNodeText', 'focusOffset'].includes(
      key
    )
  );
const isCaretExpectation: ValueValidator = (value) =>
  isRecord(value) &&
  isNonnegativeInteger(value.offset) &&
  isString(value.text) &&
  Object.keys(value).every((key) => key === 'offset' || key === 'text');

const isValidatedRecord = (
  value: unknown,
  fields: Record<string, ValueValidator>,
  requireOne = false
): value is Record<string, unknown> => {
  if (!isRecord(value)) return false;

  const keys = Object.keys(value);

  return (
    (!requireOne || keys.length > 0) &&
    keys.every((key) => fields[key]?.(value[key]) === true)
  );
};

const hasOrderedNumberBounds = (value: Record<string, unknown>) =>
  !Object.hasOwn(value, 'min') ||
  !Object.hasOwn(value, 'max') ||
  (isNumber(value.min) && isNumber(value.max) && value.min <= value.max);

const isNullable =
  (validate: ValueValidator): ValueValidator =>
  (value) =>
    value === null || validate(value);
const isDOMSelectionLocationExpectation: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    {
      anchorOffset: isNullable(isNonnegativeInteger),
      anchorPath: isPathOrNull,
      anchorText: isNullable(isString),
      isCollapsed: isNullable(isBoolean),
    },
    true
  );
const isNonnegativeIntegerRange: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    { max: isNonnegativeInteger, min: isNonnegativeInteger },
    true
  ) && hasOrderedNumberBounds(value);
const isNumberBudget: ValueValidator = (value) => {
  if (isNonnegativeInteger(value)) return true;
  if (
    !isValidatedRecord(
      value,
      {
        exact: isNonnegativeInteger,
        max: isNonnegativeInteger,
        min: isNonnegativeInteger,
      },
      true
    )
  ) {
    return false;
  }

  const hasExact = Object.hasOwn(value, 'exact');
  const hasRange = Object.hasOwn(value, 'max') || Object.hasOwn(value, 'min');

  return hasExact ? !hasRange : hasRange && hasOrderedNumberBounds(value);
};
const renderKinds = [
  'core-time',
  'dom-text-sync',
  'editable',
  'element',
  'leaf',
  'root-plan',
  'runtime-time',
  'selector',
  'spacer',
  'text',
  'void',
] as const;
const isRenderKindBudget: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    Object.fromEntries(renderKinds.map((kind) => [kind, isNumberBudget])),
    true
  );
const isRenderBudget: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    { byKind: isRenderKindBudget, total: isNumberBudget },
    true
  );
const isRenderedDOMShapeExpectation: ValueValidator = (value) =>
  isValidatedRecord(value, {
    blockIndex: isNonnegativeInteger,
    domSelectionTarget: isDOMSelectionLocationExpectation,
    innerText: isString,
    lineBoxCount: (entry) =>
      isNonnegativeInteger(entry) || isNonnegativeIntegerRange(entry),
    noUnexpectedZeroWidthBreaks: (entry) => entry === true,
    textContent: isString,
    zeroWidthBreakCount: isNonnegativeInteger,
    zeroWidthCount: isNonnegativeInteger,
  }) && Object.keys(value).some((key) => key !== 'blockIndex');
const isSelectionContractExpectation: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    {
      domSelection: isDOMSelectionExpectation,
      domSelectionTarget: isDOMSelectionLocationExpectation,
      hasVisibleEditorSelection: isBoolean,
      hasVisibleSelection: isBoolean,
      noDoubleSelectionHighlight: (entry) => entry === true,
      selectedText: isString,
      selection: isSelectionExpectation,
    },
    true
  );

const isKernelMovement: ValueValidator = (value) =>
  isValidatedRecord(value, {
    axis: isOneOf(
      'document',
      'horizontal',
      'line',
      'unknown',
      'vertical',
      'word'
    ),
    extend: isBoolean,
    key: isString,
    ownership: isOneOf('model-owned', 'native-allowed'),
    reason: isOneOf(
      'model-document-boundary',
      'model-horizontal-inline-void',
      'model-line-browser',
      'model-word-boundary',
      'native-selection-key',
      'native-vertical-layout'
    ),
    reverse: isNullable(isBoolean),
  });
const isKernelSelectionPolicy: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    {
      kind: isOneOf(
        'clear',
        'export-model',
        'import-dom',
        'none',
        'partial-dom',
        'preserve-model'
      ),
      reason: isOneOf(
        'internal-control',
        'model-owned',
        'native-selection',
        'not-requested',
        'partial-dom-backed',
        'selection-clear',
        'unknown-selection'
      ),
    },
    true
  );
const isKernelRepairPolicy: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    {
      kind: isOneOf(
        'force-render',
        'none',
        'repair-caret',
        'repair-text',
        'sync-selection'
      ),
      reason: isOneOf(
        'force-render',
        'not-requested',
        'repair-caret',
        'repair-caret-after-text-insert',
        'repair-text',
        'sync-selection'
      ),
    },
    true
  );
const isKernelTransition: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    { allowed: isBoolean, reason: isNullable(isString) },
    true
  );
const isKernelTraceExpectation: ValueValidator = (value) =>
  isValidatedRecord(
    value,
    {
      commandKind: isNullable(
        isOneOf(
          'format',
          'delete',
          'delete-both',
          'delete-fragment',
          'history',
          'insert-break',
          'insert-data',
          'insert-text',
          'move-selection',
          'select',
          'select-all',
          'set-block',
          'transpose-character',
          'toggle-mark'
        )
      ),
      eventFamily: isOneOf(
        'beforeinput',
        'blur',
        'click',
        'compositionend',
        'compositionstart',
        'compositionupdate',
        'copy',
        'cut',
        'dragend',
        'dragover',
        'dragstart',
        'drop',
        'focus',
        'input',
        'keydown',
        'mousedown',
        'paste',
        'repair',
        'selectionchange'
      ),
      movement: isNullable(isKernelMovement),
      ownership: isOneOf(
        'app-owned',
        'deferred',
        'model-owned',
        'native-allowed',
        'native-denied',
        'no-op'
      ),
      repairPolicy: isKernelRepairPolicy,
      selectionChangeOrigin: isOneOf(
        'browser-handle',
        'native-user',
        'programmatic-export',
        'repair-induced',
        'unknown'
      ),
      selectionPolicy: isKernelSelectionPolicy,
      selectionSource: isOneOf(
        'app-owned',
        'composition-owned',
        'dom-current',
        'internal-control',
        'model-owned',
        'partial-dom-backed',
        'unknown'
      ),
      stateAfter: isOneOf(
        'app-owned',
        'clipboard',
        'composition',
        'dom-selection',
        'dragging',
        'idle',
        'internal-control',
        'model-owned',
        'partial-dom-backed',
        'repairing'
      ),
      stateBefore: isOneOf(
        'app-owned',
        'clipboard',
        'composition',
        'dom-selection',
        'dragging',
        'idle',
        'internal-control',
        'model-owned',
        'partial-dom-backed',
        'repairing'
      ),
      targetOwner: isOneOf(
        'app-owned',
        'editor',
        'internal-control',
        'outside-editor',
        'partial-dom',
        'unknown'
      ),
      transition: isKernelTransition,
    },
    true
  );

const commonScenarioStepFields: Record<string, ValueValidator> = {
  iteration: isNonnegativeInteger,
  label: isString,
  warmLoop: isString,
};

const scenarioStepShapes = {
  activateShell: {
    required: {
      buttonName: isString,
      expectedSelection: isSelectionExpectation,
    },
  },
  applyChange: {
    optional: { tag: isStringOrStringArray },
    required: { change: isJsonRecord },
  },
  applyValueChange: {
    optional: { tag: isStringOrStringArray },
    required: { value: isJsonRecord },
  },
  assertBlockTexts: {
    optional: { startIndex: isNonnegativeInteger },
    required: { texts: isStringArray },
  },
  assertCapturedNodeKeyPath: {
    required: { name: isString, path: isPathOrNull },
  },
  assertDOMCaret: {
    required: { offset: isNonnegativeInteger, text: isString },
  },
  assertDOMSelection: {
    required: { selection: isDOMSelectionExpectation },
  },
  assertFocusOwner: {
    required: {
      focusOwner: isOneOf(
        'contenteditable',
        'editor',
        'internal-control',
        'none',
        'outside'
      ),
    },
  },
  assertKernelTrace: { required: { trace: isKernelTraceExpectation } },
  assertLastCommit: {},
  assertLastCommitIncludesTags: {
    required: { tags: isNonemptyStringArray },
  },
  assertLastCommitTags: { required: { tags: isStringArray } },
  assertLocatorCount: {
    optional: {
      count: isNonnegativeInteger,
      max: isNonnegativeInteger,
      min: isNonnegativeInteger,
    },
    required: { selector: isString },
    validate: (value) => {
      const hasCount = Object.hasOwn(value, 'count');
      const hasRange =
        Object.hasOwn(value, 'max') || Object.hasOwn(value, 'min');

      return hasCount ? !hasRange : hasRange && hasOrderedNumberBounds(value);
    },
  },
  assertLocatorCss: {
    optional: {
      index: isNonnegativeInteger,
      notValue: isString,
      value: isString,
    },
    required: { property: isString, selector: isString },
    validate: (value) =>
      Object.hasOwn(value, 'value') || Object.hasOwn(value, 'notValue'),
  },
  assertLocatorText: {
    optional: { contains: isNonemptyString, text: isString },
    required: { selector: isString },
    validate: (value) =>
      Object.hasOwn(value, 'contains') || Object.hasOwn(value, 'text'),
  },
  assertLocatorVerticalGap: {
    optional: { max: isNumber, min: isNumber },
    required: { afterSelector: isString, beforeSelector: isString },
    validate: (value) =>
      (Object.hasOwn(value, 'max') || Object.hasOwn(value, 'min')) &&
      hasOrderedNumberBounds(value),
  },
  assertLocatorVerticalOffset: {
    optional: { max: isNumber, min: isNumber },
    required: { innerSelector: isString, selector: isString },
    validate: (value) =>
      (Object.hasOwn(value, 'max') || Object.hasOwn(value, 'min')) &&
      hasOrderedNumberBounds(value),
  },
  assertModelSelectionExpanded: {},
  assertModelText: { required: { text: isNonemptyString } },
  assertRenderBudget: { required: { budget: isRenderBudget } },
  assertRenderedDOMShape: {
    required: { shape: isRenderedDOMShapeExpectation },
  },
  assertSelectedText: { required: { text: isString } },
  assertSelection: { required: { selection: isSelectionExpectation } },
  assertSelectionContract: {
    required: { expectation: isSelectionContractExpectation },
  },
  assertSelectionLocation: {
    required: { location: isDOMSelectionLocationExpectation },
  },
  assertText: { required: { text: isNonemptyString } },
  assertWindowSelectionText: {
    optional: {
      contains: isNonemptyString,
      notEmpty: isBoolean,
      text: isString,
    },
    validate: (value) =>
      value.notEmpty === true ||
      Object.hasOwn(value, 'contains') ||
      Object.hasOwn(value, 'text'),
  },
  captureNodeKey: { required: { name: isString, path: isPath } },
  clickSelector: { required: { selector: isString } },
  clickTestId: { required: { testId: isString } },
  clickTextOffset: {
    required: { offset: isNonnegativeInteger, path: isPath },
  },
  composeText: {
    optional: {
      committedText: isString,
      steps: isStringArray,
      transport: isOneOf('native', 'synthetic'),
    },
    required: { text: isString },
  },
  deleteBackward: {},
  deleteForward: {},
  doubleClickTextOffset: {
    optional: { selectedText: isString },
    required: { offset: isNonnegativeInteger, path: isPath },
  },
  dragTextSelection: {
    optional: {
      endXOffset: isNumber,
      index: isNonnegativeInteger,
      startXOffset: isNumber,
      steps: isNonnegativeInteger,
      yOffset: isNumber,
    },
    required: { selector: isString },
  },
  dropHtml: {
    optional: { text: isString },
    required: { html: isString },
  },
  fillControl: {
    required: { selector: isString, value: isString },
  },
  focus: {},
  insertText: { required: { text: isString } },
  mutateTextDOM: {
    optional: {
      data: isString,
      inputType: isString,
      selectionOffset: isNonnegativeInteger,
    },
    required: { path: isPath, text: isString },
  },
  pasteHtml: {
    optional: { text: isString },
    required: { html: isString },
  },
  pasteText: { required: { text: isString } },
  press: { required: { key: isString } },
  resetRenderProfiler: {},
  rootClick: {},
  rootMouseDown: {},
  select: { required: { selection: isSelectionSnapshot } },
  selectAll: {},
  selectDOM: { required: { selection: isSelectionSnapshot } },
  settle: { optional: { timeoutMs: isNonnegativeNumber } },
  snapshot: { required: { label: isString } },
  type: { required: { text: isString } },
  typeThenUndo: {
    required: {
      caretAfterType: isCaretExpectation,
      caretAfterUndo: isCaretExpectation,
      expectedModelTextAfterType: isString,
      expectedModelTextAfterUndo: isString,
      text: isString,
    },
  },
  undo: { optional: { expectedModelTextBefore: isString } },
} satisfies Record<ScenarioStepKind, ScenarioStepShape>;

const decodeScenarioStep = (
  value: unknown,
  path: string
): PliteBrowserScenarioStep => {
  if (!isJsonRecord(value)) {
    throw new TypeError(`${path} must be a JSON object.`);
  }
  if (!isString(value.kind) || !Object.hasOwn(scenarioStepShapes, value.kind)) {
    throw new TypeError(`${path}.kind is not a supported scenario step.`);
  }

  const kind = value.kind as ScenarioStepKind;
  const shape: ScenarioStepShape = scenarioStepShapes[kind];
  const required = shape.required ?? {};
  const optional = { ...commonScenarioStepFields, ...shape.optional };
  const allowedKeys = new Set([
    'kind',
    ...Object.keys(required),
    ...Object.keys(optional),
  ]);

  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      throw new TypeError(`${path}.${key} is not valid for ${kind}.`);
    }
  }
  for (const [key, validate] of Object.entries(required)) {
    if (!Object.hasOwn(value, key) || !validate(value[key])) {
      throw new TypeError(`${path}.${key} is invalid for ${kind}.`);
    }
  }
  for (const [key, validate] of Object.entries(optional)) {
    if (Object.hasOwn(value, key) && !validate(value[key])) {
      throw new TypeError(`${path}.${key} is invalid for ${kind}.`);
    }
  }
  if (shape.validate && !shape.validate(value)) {
    throw new TypeError(`${path} does not contain a meaningful assertion.`);
  }

  return value as PliteBrowserScenarioStep;
};

const omitAbsentScenarioStepFields = (
  step: PliteBrowserScenarioStep
): Record<string, unknown> => {
  if (
    !isRecord(step) ||
    !isString(step.kind) ||
    !Object.hasOwn(scenarioStepShapes, step.kind)
  ) {
    return step;
  }

  const shape: ScenarioStepShape =
    scenarioStepShapes[step.kind as ScenarioStepKind];
  const optional = { ...commonScenarioStepFields, ...shape.optional };
  const required = shape.required ?? {};

  return Object.fromEntries(
    Object.entries(step).filter(
      ([key, value]) =>
        value !== undefined ||
        !Object.hasOwn(optional, key) ||
        Object.hasOwn(required, key)
    )
  );
};

/** Create candidate reduced scenarios from a failing scenario result. */
export const createScenarioReductionCandidates = (
  steps: readonly PliteBrowserScenarioStep[]
): PliteBrowserScenarioReductionCandidate[] => {
  const candidates: PliteBrowserScenarioReductionCandidate[] = [];
  let warmRange: {
    end: number;
    iteration: number;
    start: number;
    warmLoop: string;
  } | null = null;

  const addWarmRangeCandidate = () => {
    if (!warmRange) return;
    if (warmRange.start === 0 && warmRange.end === steps.length) return;

    candidates.push({
      kind: 'iteration',
      label: `${warmRange.warmLoop}:iteration:${warmRange.iteration}`,
      removedRange: { end: warmRange.end, start: warmRange.start },
      removedSteps: steps.slice(warmRange.start, warmRange.end),
      steps: [
        ...steps.slice(0, warmRange.start),
        ...steps.slice(warmRange.end),
      ],
    });
  };

  for (const [index, step] of steps.entries()) {
    if (!step.warmLoop || step.iteration === undefined) {
      addWarmRangeCandidate();
      warmRange = null;
      continue;
    }

    if (
      warmRange &&
      warmRange.warmLoop === step.warmLoop &&
      warmRange.iteration === step.iteration
    ) {
      warmRange.end = index + 1;
      continue;
    }

    addWarmRangeCandidate();
    warmRange = {
      end: index + 1,
      iteration: step.iteration,
      start: index,
      warmLoop: step.warmLoop,
    };
  }

  addWarmRangeCandidate();

  for (let length = steps.length - 1; length > 0; length -= 1) {
    candidates.push({
      kind: 'prefix',
      label: `prefix:${length}`,
      removedRange: { end: steps.length, start: length },
      removedSteps: steps.slice(length),
      steps: steps.slice(0, length),
    });
  }

  for (let start = 1; start < steps.length; start += 1) {
    candidates.push({
      kind: 'suffix',
      label: `suffix:${start}`,
      removedRange: { end: start, start: 0 },
      removedSteps: steps.slice(0, start),
      steps: steps.slice(start),
    });
  }

  for (let index = 0; index < steps.length; index += 1) {
    candidates.push({
      kind: 'single-step',
      label: `without:${index}`,
      removedRange: { end: index + 1, start: index },
      removedSteps: steps.slice(index, index + 1),
      steps: [...steps.slice(0, index), ...steps.slice(index + 1)],
    });
  }

  return candidates.filter((candidate) => candidate.steps.length > 0);
};

const getScenarioStepLabel = (step: PliteBrowserScenarioStep, index: number) =>
  step.label ?? `${index}:${step.kind}`;

const summarizeTextPayload = (text: string) => {
  const preview = text.length > 24 ? `${text.slice(0, 24)}...` : text;

  return `"${preview}" len=${text.length}`;
};

const summarizeSelectionOffset = (offset: OffsetExpectation) =>
  Array.isArray(offset) ? `${offset[0]}..${offset[1]}` : `${offset}`;

const summarizeSelectionPoint = (point: {
  offset: OffsetExpectation;
  path: readonly number[];
}) => `${point.path.join('.')}:${summarizeSelectionOffset(point.offset)}`;

const summarizeSelectionPayload = (selection: SelectionSnapshotExpectation) =>
  `${summarizeSelectionPoint(selection.anchor)} -> ${summarizeSelectionPoint(
    selection.focus
  )}`;

/** Summarize a scenario step for logs and reduction output. */
export const summarizeScenarioStep = (
  step: PliteBrowserScenarioStep,
  index: number
) => {
  const label = getScenarioStepLabel(step, index);

  switch (step.kind) {
    case 'assertSelection':
    case 'select':
    case 'selectDOM':
      return `${label}: ${step.kind} ${summarizeSelectionPayload(
        step.selection
      )}`;
    case 'assertSelectionContract':
      return `${label}: assertSelectionContract`;
    case 'assertSelectedText':
    case 'assertText':
    case 'insertText':
    case 'pasteText':
    case 'type':
      return `${label}: ${step.kind} ${summarizeTextPayload(step.text)}`;
    case 'mutateTextDOM':
      return `${label}: mutateTextDOM ${step.path.join(
        '.'
      )} ${summarizeTextPayload(step.text)}`;
    case 'composeText':
      return `${label}: composeText ${summarizeTextPayload(step.text)} via ${
        step.transport ?? 'default'
      }`;
    case 'press':
      return `${label}: press ${step.key}`;
    case 'clickSelector':
      return `${label}: clickSelector ${step.selector}`;
    case 'clickTestId':
      return `${label}: clickTestId ${step.testId}`;
    case 'clickTextOffset':
    case 'doubleClickTextOffset':
      return `${label}: ${step.kind} ${step.path.join('.')}:${step.offset}${
        step.kind === 'doubleClickTextOffset' && step.selectedText !== undefined
          ? ` selects ${summarizeTextPayload(step.selectedText)}`
          : ''
      }`;
    case 'dragTextSelection':
      return `${label}: dragTextSelection ${step.selector}`;
    case 'assertWindowSelectionText': {
      if (step.text !== undefined) {
        return `${label}: assertWindowSelectionText ${summarizeTextPayload(
          step.text
        )}`;
      }
      if (step.contains !== undefined) {
        return `${label}: assertWindowSelectionText contains ${summarizeTextPayload(
          step.contains
        )}`;
      }

      return `${label}: assertWindowSelectionText ${
        step.notEmpty ? 'not empty' : 'current'
      }`;
    }
    default:
      return `${label}: ${step.kind}`;
  }
};

const toReplayValue = (
  value: unknown,
  ancestors = new Set<object>()
): { replayable: boolean; value: unknown } => {
  if (
    value === undefined ||
    typeof value === 'bigint' ||
    typeof value === 'function' ||
    typeof value === 'symbol'
  ) {
    return { replayable: false, value: undefined };
  }

  if (typeof value === 'number' && !Number.isFinite(value)) {
    return { replayable: false, value: undefined };
  }

  if (Array.isArray(value)) {
    const values = readJsonArrayValues(value);

    if (!values || ancestors.has(value)) {
      return { replayable: false, value: undefined };
    }

    ancestors.add(value);
    let replayable = true;
    const arrayValue = values.map((entry) => {
      const result = toReplayValue(entry, ancestors);
      replayable &&= result.replayable;
      return result.value;
    });
    ancestors.delete(value);

    return { replayable, value: arrayValue };
  }

  if (value && typeof value === 'object') {
    const prototype = Object.getPrototypeOf(value);
    const entries =
      prototype === Object.prototype || prototype === null
        ? readJsonObjectEntries(value as Record<string, unknown>)
        : null;

    if (!entries || ancestors.has(value)) {
      return { replayable: false, value: undefined };
    }

    ancestors.add(value);
    let replayable = true;
    const objectValue = Object.fromEntries(
      entries.map(([key, entry]) => {
        const result = toReplayValue(entry, ancestors);
        replayable &&= result.replayable;
        return [key, result.value] as const;
      })
    );
    ancestors.delete(value);

    return { replayable, value: objectValue };
  }

  return { replayable: true, value };
};

/** Serialize a scenario step into a replayable description. */
export const serializeScenarioStepForReplay = (
  step: PliteBrowserScenarioStep,
  index: number
): PliteBrowserScenarioReplayStep => {
  const { value, replayable } = toReplayValue(
    omitAbsentScenarioStepFields(step)
  );

  if (!replayable) {
    throw new TypeError(
      `Browser scenario step "${getScenarioStepLabel(step, index)}" is not serializable. Use editor.scenario.runImperative for arbitrary browser code.`
    );
  }

  const replayValue = decodeScenarioStep(value, `scenario.steps[${index}]`);

  return {
    ...(step.iteration === undefined ? {} : { iteration: step.iteration }),
    kind: step.kind,
    label: getScenarioStepLabel(step, index),
    replayable: true,
    summary: summarizeScenarioStep(step, index),
    value: replayValue,
    ...(step.warmLoop === undefined ? {} : { warmLoop: step.warmLoop }),
  };
};

const decodeScenarioReplayStep = (
  value: unknown,
  index: number
): PliteBrowserScenarioReplayStep => {
  const path = `replay.steps[${index}]`;

  if (!isJsonRecord(value)) {
    throw new TypeError(`${path} must be a JSON object.`);
  }

  const allowedKeys = new Set([
    'iteration',
    'kind',
    'label',
    'replayable',
    'summary',
    'value',
    'warmLoop',
  ]);

  for (const key of Object.keys(value)) {
    if (!allowedKeys.has(key)) {
      throw new TypeError(`${path}.${key} is not valid replay metadata.`);
    }
  }
  if (
    value.replayable !== true ||
    !isString(value.kind) ||
    !isString(value.label) ||
    !isString(value.summary) ||
    (Object.hasOwn(value, 'iteration') &&
      !isNonnegativeInteger(value.iteration)) ||
    (Object.hasOwn(value, 'warmLoop') && !isString(value.warmLoop))
  ) {
    throw new TypeError(`${path} has invalid replay metadata.`);
  }

  const step = decodeScenarioStep(value.value, `${path}.value`);
  const expectedLabel = getScenarioStepLabel(step, index);
  const expectedSummary = summarizeScenarioStep(step, index);

  if (
    value.kind !== step.kind ||
    value.label !== expectedLabel ||
    value.summary !== expectedSummary ||
    value.iteration !== step.iteration ||
    value.warmLoop !== step.warmLoop
  ) {
    throw new TypeError(`${path} metadata does not match its scenario step.`);
  }

  return {
    ...(step.iteration === undefined ? {} : { iteration: step.iteration }),
    kind: step.kind,
    label: expectedLabel,
    replayable: true,
    summary: expectedSummary,
    value: step,
    ...(step.warmLoop === undefined ? {} : { warmLoop: step.warmLoop }),
  };
};

/** Decode and validate a canonical JSON scenario replay artifact. */
export const decodeScenarioReplay = (
  value: unknown
): PliteBrowserScenarioReplay => {
  if (!isJsonRecord(value)) {
    throw new TypeError('Scenario replay must be a JSON object.');
  }
  if (
    value.replayable !== true ||
    !Array.isArray(value.steps) ||
    Object.keys(value).some((key) => key !== 'replayable' && key !== 'steps')
  ) {
    throw new TypeError('Scenario replay has an unsupported shape.');
  }

  return {
    replayable: true,
    steps: value.steps.map(decodeScenarioReplayStep),
  };
};

/** Create a replay artifact from scenario metadata and steps. */
export const createScenarioReplay = (
  steps: readonly PliteBrowserScenarioStep[]
): PliteBrowserScenarioReplay => {
  const replaySteps = steps.map(serializeScenarioStepForReplay);

  return {
    replayable: true,
    steps: replaySteps,
  };
};

/** Summarize a scenario reduction candidate for handoff output. */
export const summarizeScenarioReductionCandidate = ({
  kind,
  label,
  removedSteps,
  removedRange,
  steps,
}: PliteBrowserScenarioReductionCandidate): PliteBrowserScenarioReductionCandidateSummary => ({
  kind,
  label,
  removedStepLabels: removedSteps.map(getScenarioStepLabel),
  removedStepSummaries: removedSteps.map(summarizeScenarioStep),
  removedRange,
  replay: createScenarioReplay(steps),
  stepLabels: steps.map(getScenarioStepLabel),
  stepSummaries: steps.map(summarizeScenarioStep),
});

/** Normalize scenario metadata with defaults for transport and labels. */
export const normalizeScenarioMetadata = (
  metadata: PliteBrowserScenarioMetadata = {}
): PliteBrowserNormalizedScenarioMetadata => ({
  capabilities: Array.from(new Set(metadata.capabilities ?? [])).sort(),
  claim: classifyScenarioTransportClaim(metadata),
  platform: metadata.platform ?? null,
  transport: metadata.transport ?? null,
});

/** Classify the proof strength of a scenario transport claim. */
export const classifyScenarioTransportClaim = ({
  platform,
  transport,
}: PliteBrowserScenarioMetadata): PliteBrowserTransportClaim => {
  if (!transport) {
    return platform === 'mobile' ? 'playwright-mobile-viewport' : 'unspecified';
  }

  const normalized = transport.toLowerCase();

  if (normalized.includes('synthetic-datatransfer')) {
    return 'synthetic-datatransfer';
  }

  if (platform === 'mobile') {
    if (normalized.includes('composition')) {
      return 'mobile-synthetic-composition';
    }

    if (normalized.includes('semantic') || normalized.includes('handle')) {
      return 'mobile-semantic-handle';
    }

    if (normalized.includes('keyboard')) {
      return 'playwright-mobile-keyboard';
    }

    return 'playwright-mobile-viewport';
  }

  if (normalized.includes('native-composition')) {
    return 'desktop-native-ime-composition';
  }

  if (normalized.includes('synthetic-composition')) {
    return 'synthetic-composition';
  }

  if (normalized.includes('clipboard')) {
    return 'desktop-native-clipboard';
  }

  if (normalized.includes('semantic') || normalized.includes('handle')) {
    return normalized.includes('keyboard') || normalized.includes('click')
      ? 'mixed-native-and-semantic'
      : 'desktop-semantic-handle';
  }

  if (normalized.includes('native') || normalized.includes('keyboard')) {
    return 'desktop-native-keyboard';
  }

  return 'unspecified';
};
