import { getDefined } from '../../../internal/get-defined';
import { cloneJson, jsonEqual, type JsonRecord } from '../json';
import {
  applyPropDeltaToRecord,
  isEmptyPropDelta,
  normalizeV4SetValues,
  subtractV4SetValues,
  type V4PropDelta,
  type V4Step,
} from './types';

export type V4EscalationReason =
  | 'cycle'
  | 'inline-wrap-crossing'
  | 'move-conflict'
  | 'not-adjacent'
  | 'root-conflict'
  | 'target-deleted';

export type V4StepOutcome = 'applied' | 'satisfied';

export type V4PairTransform =
  | Readonly<{
      aPrime: readonly V4Step[];
      bOutcome: V4StepOutcome;
      bPrime: readonly V4Step[];
      ok: true;
    }>
  | Readonly<{
      ok: false;
      reason: V4EscalationReason;
    }>;

export type V4TextStep = Extract<
  V4Step,
  { op: 'delete_text' | 'format_text' | 'insert_text' }
>;

const propDeltaOf = (step: V4PropDelta): V4PropDelta => ({
  ...(step.add ? { add: step.add } : {}),
  ...(step.remove ? { remove: step.remove } : {}),
  ...(step.set ? { set: step.set } : {}),
  ...(step.unset ? { unset: step.unset } : {}),
});

/**
 * Strip keys and set members from an earlier delta `a` that a later delta `b`
 * overrides under the unified room-order LWW conflict law (`b` wins).
 */
export const stripOverriddenPropDelta = (
  a: V4PropDelta,
  b: V4PropDelta
): V4PropDelta => {
  const bScalarKeys = new Set<string>([
    ...Object.keys(b.set ?? {}),
    ...(b.unset ?? []),
  ]);
  const bSetKeys = new Set<string>([
    ...Object.keys(b.add ?? {}),
    ...Object.keys(b.remove ?? {}),
  ]);

  const set: JsonRecord = {};
  const unset: string[] = [];
  const add: Record<string, unknown[]> = {};
  const remove: Record<string, unknown[]> = {};

  if (a.set) {
    for (const [key, value] of Object.entries(a.set)) {
      if (bScalarKeys.has(key)) continue;
      if (bSetKeys.has(key) && Array.isArray(value)) {
        const bKeyDelta: V4PropDelta = {
          ...(b.add?.[key] ? { add: { [key]: b.add[key] } } : {}),
          ...(b.remove?.[key] ? { remove: { [key]: b.remove[key] } } : {}),
        };
        const merged = applyPropDeltaToRecord({ [key]: value }, bKeyDelta);

        if (Object.hasOwn(merged, key)) {
          set[key] = cloneJson(merged[key]);
        } else {
          unset.push(key);
        }
        continue;
      }
      set[key] = cloneJson(value);
    }
  }

  if (a.unset) {
    for (const key of a.unset) {
      if (bScalarKeys.has(key)) continue;
      if (bSetKeys.has(key)) {
        const added = b.add?.[key] ?? [];
        const removed = b.remove?.[key] ?? [];
        const remaining = normalizeV4SetValues(
          subtractV4SetValues(added, removed)
        );

        if (remaining.length > 0) {
          set[key] = remaining;
        } else {
          unset.push(key);
        }
        continue;
      }
      unset.push(key);
    }
  }

  if (a.add) {
    for (const [key, values] of Object.entries(a.add)) {
      if (bScalarKeys.has(key)) continue;
      const overridden = b.remove?.[key] ?? [];
      const kept = normalizeV4SetValues(
        subtractV4SetValues(values, overridden)
      );

      if (kept.length > 0) add[key] = kept;
    }
  }

  if (a.remove) {
    for (const [key, values] of Object.entries(a.remove)) {
      if (bScalarKeys.has(key)) continue;
      const overridden = b.add?.[key] ?? [];
      const kept = normalizeV4SetValues(
        subtractV4SetValues(values, overridden)
      );

      if (kept.length > 0) remove[key] = kept;
    }
  }

  return {
    ...(Object.keys(add).length > 0 ? { add } : {}),
    ...(Object.keys(remove).length > 0 ? { remove } : {}),
    ...(Object.keys(set).length > 0 ? { set } : {}),
    ...(unset.length > 0 ? { unset: [...new Set(unset)].sort() } : {}),
  };
};

/**
 * Strip keys explicitly assigned by `overridingProps` (e.g. `split_node.props`)
 * from a property delta propagated onto the split's newly created right sibling.
 */
export const stripFixedPropsFromDelta = (
  delta: V4PropDelta,
  overridingProps: Readonly<JsonRecord> | undefined
): V4PropDelta => {
  if (!overridingProps || Object.keys(overridingProps).length === 0) {
    return delta;
  }

  return stripOverriddenPropDelta(delta, { set: overridingProps });
};

const applyRemoveDeltaToMarks = (
  marks: Readonly<JsonRecord> | undefined,
  remove: Readonly<Record<string, readonly unknown[]>> | undefined
): Readonly<JsonRecord> | undefined => {
  if (!marks || !remove) return marks;

  let changed = false;
  const next: JsonRecord = { ...marks };

  for (const [key, toRemove] of Object.entries(remove)) {
    const existing = next[key];

    if (!Array.isArray(existing) || toRemove.length === 0) continue;

    const remaining = subtractV4SetValues(existing, toRemove);

    if (remaining.length === existing.length) continue;
    changed = true;
    if (remaining.length === 0) delete next[key];
    else next[key] = normalizeV4SetValues(remaining);
  }

  if (!changed) return marks;

  return Object.keys(next).length > 0 ? next : undefined;
};

const splitFormatForEmbeddedInsert = (
  fmt: Extract<V4Step, { op: 'format_text' }>,
  ins: Extract<V4Step, { op: 'insert_text' }>
): Readonly<{
  fmtPrime: ReadonlyArray<Extract<V4Step, { op: 'format_text' }>>;
  insPrime: Extract<V4Step, { op: 'insert_text' }>;
}> => {
  const len = ins.text.length;
  const leftLen = ins.offset - fmt.offset;
  const rightLen = fmt.offset + fmt.length - ins.offset;
  const hasRemove =
    fmt.remove !== undefined && Object.keys(fmt.remove).length > 0;
  const hasOther =
    (fmt.set !== undefined && Object.keys(fmt.set).length > 0) ||
    (fmt.unset !== undefined && fmt.unset.length > 0) ||
    (fmt.add !== undefined && Object.keys(fmt.add).length > 0);

  if (!hasRemove) {
    return {
      fmtPrime: [
        { ...fmt, length: leftLen, offset: fmt.offset },
        { ...fmt, length: rightLen, offset: ins.offset + len },
      ],
      insPrime: ins,
    };
  }

  const strippedMarks = applyRemoveDeltaToMarks(ins.marks, fmt.remove);
  const insPrime: Extract<V4Step, { op: 'insert_text' }> =
    strippedMarks === ins.marks
      ? ins
      : strippedMarks
        ? { ...ins, marks: strippedMarks }
        : {
            offset: ins.offset,
            op: 'insert_text',
            target: ins.target,
            text: ins.text,
          };

  if (!hasOther) {
    return {
      fmtPrime: [{ ...fmt, length: fmt.length + len, offset: fmt.offset }],
      insPrime,
    };
  }

  const { remove: fmtRemove, ...rest } = fmt;

  return {
    fmtPrime: [
      { ...rest, length: leftLen, offset: fmt.offset },
      { ...rest, length: rightLen, offset: ins.offset + len },
      {
        length: fmt.length + len,
        offset: fmt.offset,
        op: 'format_text',
        remove: fmtRemove,
        target: fmt.target,
      },
    ],
    insPrime,
  };
};

/**
 * Transform a 1D text/mark step pair on the same text-bearing element under
 * one canonical left-to-right sequential UTF-16 TP-1 frame (`a` admitted before
 * `b`, so `b` wins on overlapping conflicts and sits right on equal-offset
 * inserts).
 */
export const transformSameTargetTextPair = (
  a: V4TextStep,
  b: V4TextStep
): V4PairTransform => {
  const { target } = a;

  if (a.op === 'insert_text' && b.op === 'insert_text') {
    const lenA = a.text.length;
    const lenB = b.text.length;

    if (a.offset <= b.offset) {
      return {
        aPrime: [a],
        bOutcome: 'applied',
        bPrime: [{ ...b, offset: b.offset + lenA }],
        ok: true,
      };
    }

    return {
      aPrime: [{ ...a, offset: a.offset + lenB }],
      bOutcome: 'applied',
      bPrime: [b],
      ok: true,
    };
  }

  if (a.op === 'insert_text' && b.op === 'delete_text') {
    const lenA = a.text.length;
    const bStart = b.offset;
    const bEnd = b.offset + b.length;

    if (lenA === 0 || b.length === 0) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }
    if (a.offset <= bStart) {
      return {
        aPrime: [a],
        bOutcome: 'applied',
        bPrime: [{ ...b, offset: bStart + lenA }],
        ok: true,
      };
    }
    if (a.offset >= bEnd) {
      return {
        aPrime: [{ ...a, offset: a.offset - b.length }],
        bOutcome: 'applied',
        bPrime: [b],
        ok: true,
      };
    }

    const leftLen = a.offset - bStart;
    const rightLen = bEnd - a.offset;

    return {
      aPrime: [{ ...a, offset: bStart }],
      bOutcome: 'applied',
      bPrime: [
        { length: leftLen, offset: bStart, op: 'delete_text', target },
        { length: rightLen, offset: bStart + lenA, op: 'delete_text', target },
      ],
      ok: true,
    };
  }

  if (a.op === 'delete_text' && b.op === 'insert_text') {
    const lenB = b.text.length;
    const aStart = a.offset;
    const aEnd = a.offset + a.length;

    if (a.length === 0 || lenB === 0) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }
    if (b.offset <= aStart) {
      return {
        aPrime: [{ ...a, offset: aStart + lenB }],
        bOutcome: 'applied',
        bPrime: [b],
        ok: true,
      };
    }
    if (b.offset >= aEnd) {
      return {
        aPrime: [a],
        bOutcome: 'applied',
        bPrime: [{ ...b, offset: b.offset - a.length }],
        ok: true,
      };
    }

    const leftLen = b.offset - aStart;
    const rightLen = aEnd - b.offset;

    return {
      aPrime: [
        { length: leftLen, offset: aStart, op: 'delete_text', target },
        { length: rightLen, offset: aStart + lenB, op: 'delete_text', target },
      ],
      bOutcome: 'applied',
      bPrime: [{ ...b, offset: aStart }],
      ok: true,
    };
  }

  if (a.op === 'delete_text' && b.op === 'delete_text') {
    const aStart = a.offset;
    const aEnd = a.offset + a.length;
    const bStart = b.offset;
    const bEnd = b.offset + b.length;

    if (aEnd <= bStart) {
      return {
        aPrime: [a],
        bOutcome: 'applied',
        bPrime: [{ ...b, offset: bStart - a.length }],
        ok: true,
      };
    }
    if (bEnd <= aStart) {
      return {
        aPrime: [{ ...a, offset: aStart - b.length }],
        bOutcome: 'applied',
        bPrime: [b],
        ok: true,
      };
    }

    const ovStart = Math.max(aStart, bStart);
    const ovEnd = Math.min(aEnd, bEnd);
    const overlap = ovEnd - ovStart;
    const remA = a.length - overlap;
    const remB = b.length - overlap;
    const minStart = Math.min(aStart, bStart);

    return {
      aPrime:
        remA > 0
          ? [{ length: remA, offset: minStart, op: 'delete_text', target }]
          : [],
      bOutcome: remB > 0 ? 'applied' : 'satisfied',
      bPrime:
        remB > 0
          ? [{ length: remB, offset: minStart, op: 'delete_text', target }]
          : [],
      ok: true,
    };
  }

  if (a.op === 'insert_text' && b.op === 'format_text') {
    const lenA = a.text.length;

    if (b.length === 0) {
      return {
        aPrime: [a],
        bOutcome: lenA > 0 ? 'satisfied' : 'applied',
        bPrime: lenA > 0 ? [] : [b],
        ok: true,
      };
    }
    if (lenA === 0) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }
    if (a.offset <= b.offset) {
      return {
        aPrime: [a],
        bOutcome: 'applied',
        bPrime: [{ ...b, offset: b.offset + lenA }],
        ok: true,
      };
    }
    if (a.offset >= b.offset + b.length) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const { fmtPrime, insPrime } = splitFormatForEmbeddedInsert(b, a);

    return {
      aPrime: [insPrime],
      bOutcome: 'applied',
      bPrime: fmtPrime,
      ok: true,
    };
  }

  if (a.op === 'format_text' && b.op === 'insert_text') {
    const lenB = b.text.length;

    if (a.length === 0) {
      return {
        aPrime: lenB > 0 ? [] : [a],
        bOutcome: 'applied',
        bPrime: [b],
        ok: true,
      };
    }
    if (lenB === 0) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }
    if (b.offset <= a.offset) {
      return {
        aPrime: [{ ...a, offset: a.offset + lenB }],
        bOutcome: 'applied',
        bPrime: [b],
        ok: true,
      };
    }
    if (b.offset >= a.offset + a.length) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const { fmtPrime, insPrime } = splitFormatForEmbeddedInsert(a, b);

    return {
      aPrime: fmtPrime,
      bOutcome: 'applied',
      bPrime: [insPrime],
      ok: true,
    };
  }

  if (a.op === 'delete_text' && b.op === 'format_text') {
    if (b.length === 0) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const aStart = a.offset;
    const aEnd = a.offset + a.length;
    const bStart = b.offset;
    const bEnd = b.offset + b.length;

    if (aEnd <= bStart) {
      return {
        aPrime: [a],
        bOutcome: 'applied',
        bPrime: [{ ...b, offset: bStart - a.length }],
        ok: true,
      };
    }
    if (bEnd <= aStart) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const overlap = Math.min(aEnd, bEnd) - Math.max(aStart, bStart);
    const remLen = b.length - overlap;

    return {
      aPrime: [a],
      bOutcome: remLen > 0 ? 'applied' : 'satisfied',
      bPrime:
        remLen > 0
          ? [{ ...b, length: remLen, offset: Math.min(aStart, bStart) }]
          : [],
      ok: true,
    };
  }

  if (a.op === 'format_text' && b.op === 'delete_text') {
    if (a.length === 0) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const aStart = a.offset;
    const aEnd = a.offset + a.length;
    const bStart = b.offset;
    const bEnd = b.offset + b.length;

    if (bEnd <= aStart) {
      return {
        aPrime: [{ ...a, offset: aStart - b.length }],
        bOutcome: 'applied',
        bPrime: [b],
        ok: true,
      };
    }
    if (aEnd <= bStart) {
      return { aPrime: [a], bOutcome: 'applied', bPrime: [b], ok: true };
    }

    const overlap = Math.min(aEnd, bEnd) - Math.max(aStart, bStart);
    const remLen = a.length - overlap;

    return {
      aPrime:
        remLen > 0
          ? [{ ...a, length: remLen, offset: Math.min(aStart, bStart) }]
          : [],
      bOutcome: 'applied',
      bPrime: [b],
      ok: true,
    };
  }

  // format_text vs format_text (unified LWW room-order conflict law: b wins)
  const fA = a as Extract<V4Step, { op: 'format_text' }>;
  const fB = b as Extract<V4Step, { op: 'format_text' }>;

  if (fA.length === 0 && fB.length === 0) {
    if (fA.offset !== fB.offset) {
      return { aPrime: [fA], bOutcome: 'applied', bPrime: [fB], ok: true };
    }

    const remDelta = stripOverriddenPropDelta(propDeltaOf(fA), propDeltaOf(fB));

    return {
      aPrime: isEmptyPropDelta(remDelta)
        ? []
        : [
            {
              ...remDelta,
              length: 0,
              offset: fA.offset,
              op: 'format_text',
              target,
            },
          ],
      bOutcome: 'applied',
      bPrime: [fB],
      ok: true,
    };
  }

  if (fA.length === 0 || fB.length === 0) {
    return { aPrime: [fA], bOutcome: 'applied', bPrime: [fB], ok: true };
  }

  const aStart = fA.offset;
  const aEnd = fA.offset + fA.length;
  const bStart = fB.offset;
  const bEnd = fB.offset + fB.length;

  if (aEnd <= bStart || bEnd <= aStart) {
    return { aPrime: [fA], bOutcome: 'applied', bPrime: [fB], ok: true };
  }

  const ovStart = Math.max(aStart, bStart);
  const ovEnd = Math.min(aEnd, bEnd);
  const aDelta = propDeltaOf(fA);
  const bDelta = propDeltaOf(fB);
  const ovDelta = stripOverriddenPropDelta(aDelta, bDelta);
  const aPrime: V4Step[] = [];

  if (aStart < ovStart) {
    aPrime.push({
      ...aDelta,
      length: ovStart - aStart,
      offset: aStart,
      op: 'format_text',
      target,
    });
  }
  if (!isEmptyPropDelta(ovDelta)) {
    aPrime.push({
      ...ovDelta,
      length: ovEnd - ovStart,
      offset: ovStart,
      op: 'format_text',
      target,
    });
  }
  if (ovEnd < aEnd) {
    aPrime.push({
      ...aDelta,
      length: aEnd - ovEnd,
      offset: ovEnd,
      op: 'format_text',
      target,
    });
  }

  return {
    aPrime,
    bOutcome: 'applied',
    bPrime: [fB],
    ok: true,
  };
};

/**
 * Transform a length-1 inline insertion at `{ id: target, offset }` against a
 * 1D text/mark step on the SAME `target`.
 */
export const transformInlineInsertWithText = (
  inlineInsert: Extract<V4Step, { op: 'insert_node' }> & {
    to: Readonly<{ id: string; offset: number }>;
  },
  textStep: V4TextStep,
  inlineIsA: boolean
): V4PairTransform => {
  const insOff = inlineInsert.to.offset;
  const { target } = textStep;

  if (textStep.op === 'insert_text') {
    const len = textStep.text.length;
    const inlineGoesLeft = inlineIsA
      ? insOff <= textStep.offset
      : insOff < textStep.offset;

    if (inlineGoesLeft) {
      const nextText: V4Step = { ...textStep, offset: textStep.offset + 1 };

      return inlineIsA
        ? {
            aPrime: [inlineInsert],
            bOutcome: 'applied',
            bPrime: [nextText],
            ok: true,
          }
        : {
            aPrime: [nextText],
            bOutcome: 'applied',
            bPrime: [inlineInsert],
            ok: true,
          };
    }

    const nextInsert: V4Step = {
      ...inlineInsert,
      to: { id: target, offset: insOff + len },
    };

    return inlineIsA
      ? {
          aPrime: [nextInsert],
          bOutcome: 'applied',
          bPrime: [textStep],
          ok: true,
        }
      : {
          aPrime: [textStep],
          bOutcome: 'applied',
          bPrime: [nextInsert],
          ok: true,
        };
  }

  if (textStep.op === 'delete_text') {
    const dStart = textStep.offset;
    const dEnd = textStep.offset + textStep.length;

    if (textStep.length === 0) {
      return inlineIsA
        ? {
            aPrime: [inlineInsert],
            bOutcome: 'applied',
            bPrime: [textStep],
            ok: true,
          }
        : {
            aPrime: [textStep],
            bOutcome: 'applied',
            bPrime: [inlineInsert],
            ok: true,
          };
    }
    if (insOff <= dStart) {
      const nextDel: V4Step = { ...textStep, offset: dStart + 1 };

      return inlineIsA
        ? {
            aPrime: [inlineInsert],
            bOutcome: 'applied',
            bPrime: [nextDel],
            ok: true,
          }
        : {
            aPrime: [nextDel],
            bOutcome: 'applied',
            bPrime: [inlineInsert],
            ok: true,
          };
    }
    if (insOff >= dEnd) {
      const nextIns: V4Step = {
        ...inlineInsert,
        to: { id: target, offset: insOff - textStep.length },
      };

      return inlineIsA
        ? {
            aPrime: [nextIns],
            bOutcome: 'applied',
            bPrime: [textStep],
            ok: true,
          }
        : {
            aPrime: [textStep],
            bOutcome: 'applied',
            bPrime: [nextIns],
            ok: true,
          };
    }

    const leftLen = insOff - dStart;
    const rightLen = dEnd - insOff;
    const splitDel: V4Step[] = [
      { length: leftLen, offset: dStart, op: 'delete_text', target },
      { length: rightLen, offset: dStart + 1, op: 'delete_text', target },
    ];
    const shiftedIns: V4Step = {
      ...inlineInsert,
      to: { id: target, offset: dStart },
    };

    return inlineIsA
      ? {
          aPrime: [shiftedIns],
          bOutcome: 'applied',
          bPrime: splitDel,
          ok: true,
        }
      : {
          aPrime: splitDel,
          bOutcome: 'applied',
          bPrime: [shiftedIns],
          ok: true,
        };
  }

  // format_text vs inline insert_node
  if (textStep.length === 0) {
    return inlineIsA
      ? { aPrime: [inlineInsert], bOutcome: 'satisfied', bPrime: [], ok: true }
      : { aPrime: [], bOutcome: 'applied', bPrime: [inlineInsert], ok: true };
  }
  if (insOff <= textStep.offset) {
    const nextFmt: V4Step = { ...textStep, offset: textStep.offset + 1 };

    return inlineIsA
      ? {
          aPrime: [inlineInsert],
          bOutcome: 'applied',
          bPrime: [nextFmt],
          ok: true,
        }
      : {
          aPrime: [nextFmt],
          bOutcome: 'applied',
          bPrime: [inlineInsert],
          ok: true,
        };
  }
  if (insOff >= textStep.offset + textStep.length) {
    return inlineIsA
      ? {
          aPrime: [inlineInsert],
          bOutcome: 'applied',
          bPrime: [textStep],
          ok: true,
        }
      : {
          aPrime: [textStep],
          bOutcome: 'applied',
          bPrime: [inlineInsert],
          ok: true,
        };
  }

  const leftLen = insOff - textStep.offset;
  const rightLen = textStep.offset + textStep.length - insOff;
  const splitFmt: V4Step[] = [
    { ...textStep, length: leftLen, offset: textStep.offset },
    { ...textStep, length: rightLen, offset: insOff + 1 },
  ];

  return inlineIsA
    ? {
        aPrime: [inlineInsert],
        bOutcome: 'applied',
        bPrime: splitFmt,
        ok: true,
      }
    : {
        aPrime: splitFmt,
        bOutcome: 'applied',
        bPrime: [inlineInsert],
        ok: true,
      };
};

/**
 * Transform a `wrap_inline` step on `target` against a 1D text/mark step on
 * the SAME `target`.
 */
export const transformWrapInlineWithText = (
  wrap: Extract<V4Step, { op: 'wrap_inline' }>,
  textStep: V4TextStep,
  wrapIsA: boolean
): V4PairTransform => {
  const wStart = wrap.offset;
  const wEnd = wrap.offset + wrap.length;
  const wrapperId = wrap.node.id;

  if (typeof wrapperId !== 'string' || wrapperId.length === 0) {
    return { ok: false, reason: 'inline-wrap-crossing' };
  }

  if (textStep.op === 'insert_text') {
    const len = textStep.text.length;

    if (textStep.offset <= wStart) {
      const nextWrap: V4Step = { ...wrap, offset: wStart + len };

      return wrapIsA
        ? {
            aPrime: [nextWrap],
            bOutcome: 'applied',
            bPrime: [textStep],
            ok: true,
          }
        : {
            aPrime: [textStep],
            bOutcome: 'applied',
            bPrime: [nextWrap],
            ok: true,
          };
    }
    if (textStep.offset >= wEnd) {
      const nextText: V4Step = {
        ...textStep,
        offset: textStep.offset + (1 - wrap.length),
      };

      return wrapIsA
        ? { aPrime: [wrap], bOutcome: 'applied', bPrime: [nextText], ok: true }
        : { aPrime: [nextText], bOutcome: 'applied', bPrime: [wrap], ok: true };
    }

    // Insert strictly inside wrapped span -> lands inside wrapper!
    const innerInsert: V4Step = {
      ...textStep,
      offset: textStep.offset - wStart,
      target: wrapperId,
    };
    const grownWrap: V4Step = { ...wrap, length: wrap.length + len };

    return wrapIsA
      ? {
          aPrime: [grownWrap],
          bOutcome: 'applied',
          bPrime: [innerInsert],
          ok: true,
        }
      : {
          aPrime: [innerInsert],
          bOutcome: 'applied',
          bPrime: [grownWrap],
          ok: true,
        };
  }

  if (textStep.op === 'delete_text') {
    const dStart = textStep.offset;
    const dEnd = textStep.offset + textStep.length;

    if (dEnd <= wStart) {
      const nextWrap: V4Step = { ...wrap, offset: wStart - textStep.length };

      return wrapIsA
        ? {
            aPrime: [nextWrap],
            bOutcome: 'applied',
            bPrime: [textStep],
            ok: true,
          }
        : {
            aPrime: [textStep],
            bOutcome: 'applied',
            bPrime: [nextWrap],
            ok: true,
          };
    }
    if (dStart >= wEnd) {
      const nextDel: V4Step = {
        ...textStep,
        offset: dStart + (1 - wrap.length),
      };

      return wrapIsA
        ? { aPrime: [wrap], bOutcome: 'applied', bPrime: [nextDel], ok: true }
        : { aPrime: [nextDel], bOutcome: 'applied', bPrime: [wrap], ok: true };
    }
    if (dStart >= wStart && dEnd <= wEnd) {
      const innerDel: V4Step = {
        length: textStep.length,
        offset: dStart - wStart,
        op: 'delete_text',
        target: wrapperId,
      };
      const shrunkWrap: V4Step = {
        ...wrap,
        length: wrap.length - textStep.length,
      };

      return wrapIsA
        ? {
            aPrime: [shrunkWrap],
            bOutcome: 'applied',
            bPrime: [innerDel],
            ok: true,
          }
        : {
            aPrime: [innerDel],
            bOutcome: 'applied',
            bPrime: [shrunkWrap],
            ok: true,
          };
    }

    return { ok: false, reason: 'inline-wrap-crossing' };
  }

  // format_text vs wrap_inline
  if (textStep.length === 0) {
    return wrapIsA
      ? { aPrime: [wrap], bOutcome: 'satisfied', bPrime: [], ok: true }
      : { aPrime: [], bOutcome: 'applied', bPrime: [wrap], ok: true };
  }

  const fStart = textStep.offset;
  const fEnd = textStep.offset + textStep.length;

  if (fEnd <= wStart) {
    return wrapIsA
      ? { aPrime: [wrap], bOutcome: 'applied', bPrime: [textStep], ok: true }
      : { aPrime: [textStep], bOutcome: 'applied', bPrime: [wrap], ok: true };
  }
  if (fStart >= wEnd) {
    const nextFmt: V4Step = {
      ...textStep,
      offset: fStart + (1 - wrap.length),
    };

    return wrapIsA
      ? { aPrime: [wrap], bOutcome: 'applied', bPrime: [nextFmt], ok: true }
      : { aPrime: [nextFmt], bOutcome: 'applied', bPrime: [wrap], ok: true };
  }
  if (fStart >= wStart && fEnd <= wEnd) {
    const innerFmt: V4Step = {
      ...textStep,
      offset: fStart - wStart,
      target: wrapperId,
    };

    return wrapIsA
      ? { aPrime: [wrap], bOutcome: 'applied', bPrime: [innerFmt], ok: true }
      : { aPrime: [innerFmt], bOutcome: 'applied', bPrime: [wrap], ok: true };
  }

  return { ok: false, reason: 'inline-wrap-crossing' };
};

/**
 * Transform an `unwrap_inline` step (at `inlineOff` with `innerLen` inside
 * `parent`) against a 1D text/mark step on `parent`.
 */
export const transformUnwrapInlineWithText = (
  unwrap: Extract<V4Step, { op: 'unwrap_inline' }>,
  inlineOff: number,
  innerLen: number,
  textStep: V4TextStep,
  unwrapIsA: boolean
): V4PairTransform => {
  const delta = innerLen - 1;
  const { target } = textStep;

  if (textStep.op === 'insert_text') {
    const nextText: V4Step =
      textStep.offset > inlineOff
        ? { ...textStep, offset: textStep.offset + delta }
        : textStep;

    return unwrapIsA
      ? { aPrime: [unwrap], bOutcome: 'applied', bPrime: [nextText], ok: true }
      : { aPrime: [nextText], bOutcome: 'applied', bPrime: [unwrap], ok: true };
  }

  if (textStep.op === 'delete_text') {
    const dStart = textStep.offset;
    const dEnd = textStep.offset + textStep.length;

    if (dEnd <= inlineOff) {
      return unwrapIsA
        ? {
            aPrime: [unwrap],
            bOutcome: 'applied',
            bPrime: [textStep],
            ok: true,
          }
        : {
            aPrime: [textStep],
            bOutcome: 'applied',
            bPrime: [unwrap],
            ok: true,
          };
    }
    if (dStart > inlineOff) {
      const nextDel: V4Step = { ...textStep, offset: dStart + delta };

      return unwrapIsA
        ? { aPrime: [unwrap], bOutcome: 'applied', bPrime: [nextDel], ok: true }
        : {
            aPrime: [nextDel],
            bOutcome: 'applied',
            bPrime: [unwrap],
            ok: true,
          };
    }

    return { ok: false, reason: 'inline-wrap-crossing' };
  }

  // format_text on parent vs unwrap_inline
  if (textStep.length === 0) {
    return unwrapIsA
      ? { aPrime: [unwrap], bOutcome: 'applied', bPrime: [textStep], ok: true }
      : { aPrime: [textStep], bOutcome: 'applied', bPrime: [unwrap], ok: true };
  }

  const fStart = textStep.offset;
  const fEnd = textStep.offset + textStep.length;

  if (fEnd <= inlineOff) {
    return unwrapIsA
      ? { aPrime: [unwrap], bOutcome: 'applied', bPrime: [textStep], ok: true }
      : { aPrime: [textStep], bOutcome: 'applied', bPrime: [unwrap], ok: true };
  }
  if (fStart > inlineOff) {
    const nextFmt: V4Step = { ...textStep, offset: fStart + delta };

    return unwrapIsA
      ? { aPrime: [unwrap], bOutcome: 'applied', bPrime: [nextFmt], ok: true }
      : { aPrime: [nextFmt], bOutcome: 'applied', bPrime: [unwrap], ok: true };
  }

  // Format spans over the inline slot: split around the unwrapped inner units
  // so unwrapped content is not formatted on either replay order.
  const pieces: V4Step[] = [];
  const leftLen = inlineOff - fStart;
  const rightLen = fEnd - (inlineOff + 1);

  if (leftLen > 0) {
    pieces.push({ ...textStep, length: leftLen, offset: fStart, target });
  }
  if (rightLen > 0) {
    pieces.push({
      ...textStep,
      length: rightLen,
      offset: inlineOff + innerLen,
      target,
    });
  }

  return unwrapIsA
    ? {
        aPrime: [unwrap],
        bOutcome: pieces.length > 0 ? 'applied' : 'satisfied',
        bPrime: pieces,
        ok: true,
      }
    : { aPrime: pieces, bOutcome: 'applied', bPrime: [unwrap], ok: true };
};

export const isTextStep = (step: V4Step): step is V4TextStep =>
  step.op === 'insert_text' ||
  step.op === 'delete_text' ||
  step.op === 'format_text';

export const sameV4Json = (left: unknown, right: unknown): boolean =>
  jsonEqual(left, right);

export { getDefined };
