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
    case 'custom':
      return `${label}: custom non-replayable`;
    default:
      return `${label}: ${step.kind}`;
  }
};

const toReplayValue = (
  value: unknown
): { replayable: boolean; value: unknown } => {
  if (typeof value === 'function') {
    return { replayable: false, value: undefined };
  }

  if (value instanceof RegExp) {
    return {
      replayable: true,
      value: {
        flags: value.flags,
        source: value.source,
        type: 'RegExp',
      },
    };
  }

  if (Array.isArray(value)) {
    let replayable = true;
    const arrayValue = value
      .map((entry) => {
        const result = toReplayValue(entry);
        replayable &&= result.replayable;
        return result.value;
      })
      .filter((entry) => entry !== undefined);

    return { replayable, value: arrayValue };
  }

  if (value && typeof value === 'object') {
    let replayable = true;
    const objectValue = Object.fromEntries(
      Object.entries(value)
        .map(([key, entry]) => {
          const result = toReplayValue(entry);
          replayable &&= result.replayable;
          return [key, result.value] as const;
        })
        .filter(([, entry]) => entry !== undefined)
    );

    return { replayable, value: objectValue };
  }

  return { replayable: true, value };
};

/** Serialize a scenario step into a replayable description. */
export const serializeScenarioStepForReplay = (
  step: PliteBrowserScenarioStep,
  index: number
): PliteBrowserScenarioReplayStep => {
  const { value, replayable } = toReplayValue(step);
  const replayValue =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};

  return {
    iteration: step.iteration,
    kind: step.kind,
    label: getScenarioStepLabel(step, index),
    replayable,
    summary: summarizeScenarioStep(step, index),
    value: replayValue,
    warmLoop: step.warmLoop,
  };
};

/** Create a replay artifact from scenario metadata and steps. */
export const createScenarioReplay = (
  steps: readonly PliteBrowserScenarioStep[]
): PliteBrowserScenarioReplay => {
  const replaySteps = steps.map(serializeScenarioStepForReplay);

  return {
    replayable: replaySteps.every((step) => step.replayable),
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
