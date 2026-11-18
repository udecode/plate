import {
  type ConflictRecords,
  DocumentChange,
  type DocumentChangeJson,
  getInternalDocumentChangeRecords,
  rebaseDocumentChange,
  unequalRecordPuts,
} from '../../core/change/document-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import { SYNC_REBASE, sameDocument } from '../protocol';
import { MOVED } from './decision';
import {
  type BatchOrigin,
  conflictOn,
  type KeptReason,
  provenanceOf,
  type SavedBatch,
} from './outbox';

export const frameChangeOf = (frame: string) =>
  DocumentChange.fromJSON(JSON.parse(frame).change);

export type ShownBatch = Extract<SavedBatch, { state: 'saved' | 'sent' }>;

export const isShown = (batch: SavedBatch): batch is ShownBatch =>
  batch.state === 'saved' || batch.state === 'sent';

export const shownValue = (
  confirmed: JsonEditorValue,
  batches: readonly SavedBatch[]
) =>
  batches
    .filter(isShown)
    .reduce(
      (value, batch) => DocumentChange.fromJSON(batch.change).apply(value),
      confirmed
    );

/** What a shown batch becomes when it leaves the chain. */
export const leaving = (
  batch: ShownBatch,
  before: JsonEditorValue | undefined,
  reason: KeptReason | null,
  records?: ConflictRecords
): SavedBatch => {
  const origin =
    batch.origin ?? (before && { before, change: batch.change, since: [] });
  const withOrigin = origin ? { origin } : {};

  if (batch.state === 'sent') {
    return reason
      ? { ...batch, ...withOrigin, reason, state: 'kept' }
      : {
          ...provenanceOf(batch),
          frame: batch.frame,
          ...withOrigin,
          ...(records ? { records } : {}),
          state: 'withheld',
        };
  }

  return {
    ...provenanceOf(batch),
    change: batch.change,
    ...withOrigin,
    reason: reason ?? conflictOn(records),
    state: 'kept',
  };
};

const stepOf = (batch: SavedBatch) => batch.decision?.step ?? null;

export const batchToTakeBack = (
  batches: readonly SavedBatch[],
  step: string
) => {
  const latest = batches.findLast((batch) => stepOf(batch) === step);

  return latest?.decision?.step && !latest.decision.superseded ? latest : null;
};

export const superseded = (
  tail: readonly SavedBatch[],
  settled: SavedBatch
): SavedBatch[] => {
  const step = stepOf(settled);

  return tail.flatMap((batch) =>
    step !== null &&
    batch.state === 'kept' &&
    batch.seq < settled.seq &&
    batch.decision?.step === step
      ? [{ ...batch, decision: { ...batch.decision, superseded: true } }]
      : []
  );
};

const mergedBetween = (
  batches: readonly SavedBatch[],
  step: string | null,
  from: number,
  to: number
) =>
  step === null
    ? []
    : batches.filter(
        (other) =>
          other.mergedInto === step && other.seq > from && other.seq < to
      );

export const takeBackGroups = (batches: readonly SavedBatch[]) => {
  const bySeq = new Map(batches.map((batch) => [batch.seq, batch]));
  const groups = new Map<number, number>();

  for (const batch of batches.toReversed()) {
    if (
      batch.state !== 'saved' ||
      batch.takesBackSeq === undefined ||
      groups.has(batch.seq)
    ) {
      continue;
    }

    const target = bySeq.get(batch.takesBackSeq);

    if (!target) continue;

    const group = [
      target,
      ...mergedBetween(batches, stepOf(target), target.seq, batch.seq),
      batch,
    ];

    if (
      group.every(
        (member) => member.state === 'saved' && !groups.has(member.seq)
      )
    ) {
      for (const member of group) groups.set(member.seq, batch.seq);
    }
  }

  return groups;
};

export type KeepAs = (batch: SavedBatch) => KeptReason | null;

/**
 * A shown batch after `carried` moved the document it applies at: the batch
 * rebuilt there, a reason to keep it, or null to rebase it.
 */
export type CrossAs = (
  batch: ShownBatch,
  before: JsonEditorValue,
  carried: DocumentChange
) => KeptReason | ShownBatch | null;

export const shownAt = (
  batches: readonly SavedBatch[],
  at: JsonEditorValue
) => {
  const positions = new Map<number, JsonEditorValue>();
  let before: JsonEditorValue | undefined = at;

  for (const batch of batches) {
    if (!isShown(batch) || !before) continue;
    positions.set(batch.seq, before);
    try {
      before = DocumentChange.fromJSON(batch.change).apply(before);
    } catch {
      before = undefined;
    }
  }

  return positions;
};

export const withdrawn = (
  batches: readonly SavedBatch[],
  at: JsonEditorValue,
  keepAs: KeepAs = () => null
) => {
  const positions = shownAt(batches, at);

  return batches.map((batch) =>
    isShown(batch)
      ? leaving(batch, positions.get(batch.seq), keepAs(batch))
      : batch
  );
};

export type Fits = (before: JsonEditorValue, change: DocumentChange) => boolean;

const INVALID: KeptReason = { kind: 'invalid' };

const crossedRecords = (
  own: DocumentChange,
  entry: DocumentChange,
  held: ConflictRecords = []
) => {
  const added = unequalRecordPuts(entry, own).filter(
    ({ id, set }) =>
      !held.some((record) => record.id === id && record.set === set)
  );

  return added.length > 0 ? [...held, ...added] : null;
};

const withConflictsOfLaterEntry = (
  batch: SavedBatch,
  entry: DocumentChange
): SavedBatch => {
  if (batch.state === 'withheld') {
    const records = crossedRecords(
      frameChangeOf(batch.frame),
      entry,
      batch.records
    );

    return records ? { ...batch, records } : batch;
  }
  if (batch.state === 'kept' && batch.reason.kind === 'conflict') {
    const records = crossedRecords(
      DocumentChange.fromJSON(batch.change),
      entry,
      batch.reason.records
    );

    return records ? { ...batch, reason: conflictOn(records) } : batch;
  }

  return batch;
};

export const withConflictsOfTeammate = (
  batches: readonly SavedBatch[],
  entry: DocumentChange
) =>
  getInternalDocumentChangeRecords(entry).size === 0
    ? batches
    : batches.map((batch) => withConflictsOfLaterEntry(batch, entry));

const crossedOrigin = (
  { origin }: Readonly<{ origin?: BatchOrigin }>,
  change: DocumentChangeJson,
  before: JsonEditorValue,
  carried: DocumentChange
): BatchOrigin =>
  origin
    ? { ...origin, since: [...origin.since, carried.toJSON()] }
    : { before, change, since: [carried.toJSON()] };

export const hiddenPast = (
  batch: SavedBatch,
  carried: DocumentChange
): SavedBatch =>
  isShown(batch) || carried.empty || !batch.origin
    ? batch
    : {
        ...batch,
        origin: {
          ...batch.origin,
          since: [...batch.origin.since, carried.toJSON()],
        },
      };

export const crossChain = (
  change: DocumentChange,
  at: JsonEditorValue,
  batches: readonly SavedBatch[],
  {
    cancels,
    crossAs = () => null,
    fits,
  }: Readonly<{
    cancels?: ReadonlyMap<number, number>;
    crossAs?: CrossAs;
    fits?: Fits;
  }> = {}
) => {
  let carried = change;
  let before = at;
  const next: SavedBatch[] = [];
  const dropped: number[] = [];
  const groupDrops = new Map<number, boolean>();
  const out = new Set(
    batches.flatMap((batch) => (isShown(batch) ? [] : [batch.seq]))
  );

  for (const batch of batches) {
    if (!isShown(batch)) {
      next.push(hiddenPast(batch, carried));
      continue;
    }

    const own = DocumentChange.fromJSON(batch.change);
    const after = own.apply(before);
    const group = cancels?.get(batch.seq);

    if (group !== undefined && !groupDrops.has(group)) {
      groupDrops.set(group, !carried.empty);
    }
    if (group !== undefined && groupDrops.get(group)) {
      dropped.push(batch.seq);
      carried = own.invert(before).compose(carried, after);
      before = after;
      continue;
    }

    const crossed =
      batch.state === 'saved' &&
      batch.takesBackSeq !== undefined &&
      out.has(batch.takesBackSeq)
        ? MOVED
        : crossAs(batch, before, carried);

    if (crossed && 'state' in crossed) {
      const rebuilt = DocumentChange.fromJSON(crossed.change);
      const moved = carried.apply(before);

      next.push(crossed);
      carried = sameDocument(rebuilt.apply(moved), after)
        ? DocumentChange.between(after, after)
        : own.invert(before).compose(carried, after).compose(rebuilt, after);
      before = after;
      continue;
    }

    const rebase = crossed
      ? null
      : rebaseDocumentChange(carried, own, before, SYNC_REBASE);
    const unfit =
      rebase?.kind === 'pair' &&
      fits !== undefined &&
      !fits(carried.apply(before), rebase.b);

    if (rebase?.kind === 'pair' && !unfit) {
      const moved = rebase.b.toJSON();

      next.push(
        carried.empty
          ? { ...batch, change: moved }
          : {
              ...batch,
              change: moved,
              origin: crossedOrigin(batch, batch.change, before, carried),
            }
      );
      carried = rebase.a;
    } else {
      next.push(
        leaving(
          carried.empty
            ? batch
            : {
                ...batch,
                origin: crossedOrigin(batch, batch.change, before, carried),
              },
          before,
          crossed ?? (unfit && batch.state === 'saved' ? INVALID : null),
          rebase && rebase.kind !== 'pair' ? rebase.records : undefined
        )
      );
      out.add(batch.seq);
      carried = own.invert(before).compose(carried, after);
    }
    before = after;
  }

  return { batches: next, carried, dropped };
};
