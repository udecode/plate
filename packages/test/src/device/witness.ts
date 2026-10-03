import type { BrowserNativeEventTraceEntry } from '../playwright/types';

/** The `keydown` key a soft-keyboard tap produces, or null for none. */
export type DeviceWitnessKey = 'Backspace' | 'Enter' | 'Unidentified' | null;

/** One lane gesture, before the lane measures its trace range. */
export type DeviceWitnessGesture =
  | {
      kind: 'content';
      label: string;
      /** Viewport point in CSS pixels that the touch aimed at. */
      target?: { x: number; y: number };
    }
  | {
      kind: 'key';
      label: string;
      /** The key this tap must produce. */
      key: DeviceWitnessKey;
    }
  | { kind: 'strip'; label: string };

/** One lane gesture and the trace sequence range its input may occupy. */
export type DeviceWitnessStep = DeviceWitnessGesture & {
  /** First trace `seq` that belongs to this step. */
  seqStart: number;
  /** First trace `seq` after the step settled. */
  seqEnd: number;
};

export type DeviceWitnessRule =
  | 'missing-key'
  | 'missing-pointer'
  | 'outside-window'
  | 'overlap'
  | 'pointer-miss'
  | 'unexpected-pointer'
  | 'unpaired-input'
  | 'untrusted'
  | 'wrong-key';

export type DeviceWitnessViolation = {
  detail: string;
  rule: DeviceWitnessRule;
  seq: number | null;
  step: string | null;
};

type WitnessEvent = Pick<
  BrowserNativeEventTraceEntry,
  | 'clientX'
  | 'clientY'
  | 'data'
  | 'inputType'
  | 'isTrusted'
  | 'key'
  | 'seq'
  | 'type'
>;

// Gboard reports every key but Enter and Backspace as Unidentified, and a
// suggestion-strip tap as Unidentified keydowns; a content touch sends none.
const expectedKey = (step: DeviceWitnessStep): DeviceWitnessKey => {
  if (step.kind === 'key') return step.key;
  return step.kind === 'strip' ? 'Unidentified' : null;
};

/**
 * Judge whether a trace could only have come from the lane's own touches.
 *
 * Every event that can deliver input must be trusted, and every event must
 * fall inside a step window. Every `keydown` must carry the key its step
 * produces. Every `beforeinput` needs its own preceding `keydown`, except a
 * composition commit carried by a content touch, and every `input` needs its
 * own preceding `beforeinput` of the same input type. A key or strip step
 * that expects a key must show one. Content touches must deliver a
 * `pointerdown` near their target. An insertion that copies all of this from
 * inside a real tap window is indistinguishable here; the guarded DevTools
 * connection is what blocks it.
 */
export const judgeDeviceWitness = ({
  events,
  steps,
  tolerancePx = 4,
}: {
  events: readonly WitnessEvent[];
  steps: readonly DeviceWitnessStep[];
  tolerancePx?: number;
}): DeviceWitnessViolation[] => {
  const violations: DeviceWitnessViolation[] = [];
  const ordered = steps.toSorted((a, b) => a.seqStart - b.seqStart);
  const traced = events
    .filter((event) => event.type !== 'selectionchange')
    .toSorted((a, b) => a.seq - b.seq);

  for (const [index, step] of ordered.entries()) {
    const next = ordered[index + 1];

    if (next && step.seqEnd > next.seqStart) {
      violations.push({
        detail: `${step.label} ends at ${step.seqEnd} after ${next.label} starts at ${next.seqStart}`,
        rule: 'overlap',
        seq: null,
        step: step.label,
      });
    }
  }

  let compositionOpen = false;
  let compositionData: string | null = null;
  let pendingKeydowns = 0;
  // A canceled beforeinput sends no input, so unmatched ones stay pending.
  let pendingBeforeInputs: Array<string | null> = [];
  let currentStep: DeviceWitnessStep | null = null;
  const pointerSteps = new Set<DeviceWitnessStep>();
  const keyedSteps = new Set<DeviceWitnessStep>();

  for (const event of traced) {
    const step =
      ordered.find(
        (candidate) =>
          event.seq >= candidate.seqStart && event.seq < candidate.seqEnd
      ) ?? null;
    const at = { seq: event.seq, step: step?.label ?? null };

    if (step !== currentStep) {
      currentStep = step;
      pendingKeydowns = 0;
      pendingBeforeInputs = [];
    }
    // A selection write while composing makes the browser end the
    // composition from script; that compositionend repeats the last trusted
    // update and delivers no new text.
    const scriptEnd =
      event.type === 'compositionend' &&
      compositionOpen &&
      event.data === compositionData;

    if (!event.isTrusted && !scriptEnd) {
      violations.push({ ...at, detail: event.type, rule: 'untrusted' });
    }
    if (!step) {
      violations.push({
        ...at,
        detail: `${event.type} outside every lane gesture`,
        rule: 'outside-window',
      });
      continue;
    }

    if (event.type === 'keydown') {
      const key = expectedKey(step);
      // An IME-driven delete can arrive as Unidentified instead of Backspace.
      const matches =
        event.key === key ||
        (key === 'Backspace' && event.key === 'Unidentified');

      if (!matches) {
        violations.push({
          ...at,
          detail: `keydown key ${event.key}, expected ${key ?? 'none'}`,
          rule: 'wrong-key',
        });
      }
      pendingKeydowns += 1;
      keyedSteps.add(step);
    } else if (event.type === 'beforeinput') {
      const touchCommit =
        step.kind === 'content' &&
        compositionOpen &&
        event.inputType === 'insertCompositionText';

      pendingBeforeInputs.push(event.inputType ?? null);
      if (pendingKeydowns > 0) pendingKeydowns -= 1;
      else if (!touchCommit) {
        violations.push({
          ...at,
          detail: `${event.inputType} without its own keydown`,
          rule: 'unpaired-input',
        });
      }
    } else if (event.type === 'input') {
      const match = pendingBeforeInputs.indexOf(event.inputType ?? null);

      if (match === -1) {
        violations.push({
          ...at,
          detail: `input ${event.inputType} without its own beforeinput`,
          rule: 'unpaired-input',
        });
      } else {
        pendingBeforeInputs.splice(match, 1);
      }
    } else if (event.type === 'compositionstart') {
      compositionOpen = true;
    } else if (event.type === 'compositionupdate') {
      if (event.isTrusted) compositionData = event.data;
    } else if (event.type === 'compositionend') {
      compositionOpen = false;
      compositionData = null;
    } else if (event.type === 'pointerdown') {
      if (step.kind !== 'content' || !step.target) {
        violations.push({
          ...at,
          detail: `pointerdown during ${step.kind} step`,
          rule: 'unexpected-pointer',
        });
      } else {
        pointerSteps.add(step);

        const dx = Math.abs((event.clientX ?? Number.NaN) - step.target.x);
        const dy = Math.abs((event.clientY ?? Number.NaN) - step.target.y);

        if (!(dx <= tolerancePx && dy <= tolerancePx)) {
          violations.push({
            ...at,
            detail: `pointerdown at ${event.clientX},${event.clientY}, target ${step.target.x},${step.target.y}`,
            rule: 'pointer-miss',
          });
        }
      }
    }
  }

  for (const step of ordered) {
    if (expectedKey(step) !== null && !keyedSteps.has(step)) {
      violations.push({
        detail: `the ${step.label} tap produced no keydown`,
        rule: 'missing-key',
        seq: null,
        step: step.label,
      });
    }
    if (step.kind === 'content' && !pointerSteps.has(step)) {
      violations.push({
        detail: 'the touch never reached the page',
        rule: 'missing-pointer',
        seq: null,
        step: step.label,
      });
    }
  }

  return violations;
};
