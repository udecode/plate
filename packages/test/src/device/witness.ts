import type { BrowserNativeEventTraceEntry } from '../playwright/types';

/** The `keydown` key a soft-keyboard tap produces, or null for none. */
export type DeviceWitnessKey = string | null;

export type DeviceWitnessPlatform = 'android' | 'ios';

/** One lane gesture, before the lane measures its trace range. */
export type DeviceWitnessGesture =
  | { kind: 'back'; label: string }
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
  | 'isComposing'
  | 'isTrusted'
  | 'key'
  | 'keyCode'
  | 'seq'
  | 'type'
>;

const HANGUL = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;

const expectedKey = (
  step: DeviceWitnessStep,
  platform: DeviceWitnessPlatform
): DeviceWitnessKey => {
  if (step.kind === 'key') return step.key;
  if (step.kind === 'strip') return platform === 'ios' ? null : 'Unidentified';
  return null;
};

/**
 * Judge whether a trace could only have come from the lane's own touches.
 *
 * Every event that can deliver input must be trusted, and every event must
 * fall inside a step window. Every `keydown` must carry the key its step
 * produces, be an IME companion of a trusted Enter/13 in that same step, or
 * repeat and close the composition already active before that Enter step.
 * Every `beforeinput` needs its own preceding `keydown`, except a
 * composition commit carried by a content touch, an autocorrect replacement
 * that shares its key's `keydown`, and on iOS a commit by a candidate-bar tap
 * or by Return, a Korean syllable join that pairs `deleteContentBackward`
 * with Hangul `insertText` on one `keydown`, and a repeated composition draft
 * in one keyed step. Every `input` needs its own preceding `beforeinput` of
 * the same input type. A key or strip step that expects a key must show one,
 * except an iOS Return that commits the open composition. Content touches
 * must deliver a `pointerdown` near their target. An insertion that copies
 * all of this from inside a real tap window is indistinguishable here; the
 * guarded DevTools connection is what blocks it.
 */
export const judgeDeviceWitness = ({
  events,
  platform = 'android',
  steps,
  tolerancePx = 4,
}: {
  events: readonly WitnessEvent[];
  platform?: DeviceWitnessPlatform;
  steps: readonly DeviceWitnessStep[];
  tolerancePx?: number;
}): DeviceWitnessViolation[] => {
  const violations: DeviceWitnessViolation[] = [];
  const ordered = steps.toSorted((a, b) => a.seqStart - b.seqStart);
  const traced = events
    .filter((event) => event.type !== 'selectionchange')
    .toSorted((a, b) => a.seq - b.seq);
  const enterSteps = new Set(
    ordered.filter(
      (step) =>
        expectedKey(step, platform) === 'Enter' &&
        traced.some(
          (event) =>
            event.seq >= step.seqStart &&
            event.seq < step.seqEnd &&
            event.type === 'keydown' &&
            event.isTrusted &&
            event.key === 'Enter' &&
            event.keyCode === 13
        )
    )
  );

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
  let stepCompositionData: string | null = null;
  let stepCompositionInputData: string | null = null;
  let pendingKeydowns = 0;
  // A canceled beforeinput sends no input, so unmatched ones stay pending.
  let pendingBeforeInputs: Array<string | null> = [];
  let currentStep: DeviceWitnessStep | null = null;
  const backEscapes = new Set<DeviceWitnessStep>();
  const iosEnterCommitSteps = new Set<DeviceWitnessStep>();
  const pointerSteps = new Set<DeviceWitnessStep>();
  const keyedSteps = new Set<DeviceWitnessStep>();

  for (const [index, event] of traced.entries()) {
    const step =
      ordered.find(
        (candidate) =>
          event.seq >= candidate.seqStart && event.seq < candidate.seqEnd
      ) ?? null;
    const at = { seq: event.seq, step: step?.label ?? null };

    if (step !== currentStep) {
      stepCompositionData = compositionOpen ? compositionData : null;
      stepCompositionInputData = null;
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
      if (step.kind === 'back') {
        if (
          event.isTrusted &&
          event.key === 'Escape' &&
          !backEscapes.has(step)
        ) {
          backEscapes.add(step);
        } else {
          violations.push({
            ...at,
            detail: `keydown key ${event.key}, expected at most one Escape`,
            rule: 'wrong-key',
          });
        }
        continue;
      }

      const key = expectedKey(step, platform);
      const [update, before, input, end] = traced.slice(index + 1, index + 5);
      const compositionCommit =
        key === 'Enter' &&
        compositionOpen &&
        stepCompositionData !== null &&
        compositionData === stepCompositionData &&
        event.isComposing === true &&
        update?.type === 'compositionupdate' &&
        update.isTrusted &&
        update.data === compositionData &&
        before?.type === 'beforeinput' &&
        before.isTrusted &&
        before.isComposing === true &&
        before.inputType === 'insertCompositionText' &&
        before.data === compositionData &&
        input?.type === 'input' &&
        input.isTrusted &&
        input.isComposing === true &&
        input.inputType === 'insertCompositionText' &&
        input.data === compositionData &&
        end?.type === 'compositionend' &&
        end.data === compositionData &&
        end.seq < step.seqEnd;
      // An IME-driven delete can arrive as Unidentified instead of Backspace.
      const matches =
        event.key === key ||
        (key === 'Backspace' && event.key === 'Unidentified') ||
        (event.isTrusted &&
          event.key === 'Unidentified' &&
          event.keyCode === 229 &&
          (enterSteps.has(step) || compositionCommit));

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

      // On iOS Safari, tapping a word in the candidate bar or confirming an
      // active composition with Return commits the open composition with no
      // keydown.
      const iosCompositionCommit =
        platform === 'ios' &&
        compositionOpen &&
        (step.kind === 'strip' ||
          (step.kind === 'key' &&
            step.key === 'Enter' &&
            stepCompositionData !== null)) &&
        (event.inputType === 'insertCompositionText' ||
          event.inputType === 'deleteCompositionText' ||
          event.inputType === 'insertFromComposition');

      // The iPhone keyboard's autocorrect replaces the word before the key's
      // own text, so the replacement shares that key's keydown.
      const autocorrect =
        step.kind === 'key' && event.inputType === 'insertReplacementText';

      // On iOS Safari, a Korean jamo that joins the preceding syllable emits
      // deleteContentBackward followed by Hangul insertText for one keydown.
      const nextBeforeInput = traced
        .slice(index + 1)
        .find((candidate) => candidate.type === 'beforeinput');
      const iosKoreanJoinDelete =
        platform === 'ios' &&
        step.kind === 'key' &&
        !compositionOpen &&
        event.inputType === 'deleteContentBackward' &&
        nextBeforeInput !== undefined &&
        nextBeforeInput.seq < step.seqEnd &&
        nextBeforeInput.isTrusted &&
        nextBeforeInput.inputType === 'insertText' &&
        typeof nextBeforeInput.data === 'string' &&
        HANGUL.test(nextBeforeInput.data);

      // On iOS Safari, resuming Pinyin composition after replacing an expanded
      // selection can repeat the same composition draft twice in one step.
      const iosDuplicateCompositionUpdate =
        platform === 'ios' &&
        step.kind === 'key' &&
        keyedSteps.has(step) &&
        compositionOpen &&
        event.isTrusted &&
        event.isComposing === true &&
        event.inputType === 'insertCompositionText' &&
        event.data !== null &&
        event.data === stepCompositionInputData &&
        event.data === compositionData;

      pendingBeforeInputs.push(event.inputType ?? null);
      if (pendingKeydowns > 0) {
        if (
          event.inputType === 'insertCompositionText' &&
          event.isComposing === true
        ) {
          stepCompositionInputData = event.data;
        }
        if (!autocorrect && !iosKoreanJoinDelete) pendingKeydowns -= 1;
      } else if (
        !touchCommit &&
        !iosCompositionCommit &&
        !iosDuplicateCompositionUpdate
      ) {
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
      if (
        platform === 'ios' &&
        step.kind === 'key' &&
        step.key === 'Enter' &&
        compositionOpen &&
        stepCompositionData !== null &&
        event.isTrusted &&
        event.data === stepCompositionData
      ) {
        iosEnterCommitSteps.add(step);
      }
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
    if (
      expectedKey(step, platform) !== null &&
      !keyedSteps.has(step) &&
      !iosEnterCommitSteps.has(step)
    ) {
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
