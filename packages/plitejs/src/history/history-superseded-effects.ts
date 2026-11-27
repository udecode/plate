import {
  DocumentChange,
  type EditorDocumentValue,
  mapEffect,
  type Value,
} from '..';
import type { ChangeFacts } from '../core/change/record';
import type { Batch } from './history';
import { historyProgramOf, withHistoryProgram } from './history-step-id';

export type SupersededPendingMapping<V extends Value> = Readonly<{
  after: EditorDocumentValue<V>;
  change: DocumentChange;
  textOnly: boolean;
  anchors?: true;
  crossing?: ChangeFacts;
  supersededEffectKeys?: ReadonlySet<string>;
}>;

export type SupersededMappingJournal<V extends Value> = Readonly<{
  entry: SupersededPendingMapping<V>;
  previous: SupersededMappingJournal<V> | null;
}>;

export const journalEntries = <V extends Value>(
  journal: SupersededMappingJournal<V>
): ReadonlyArray<SupersededPendingMapping<V>> => {
  const entries: Array<SupersededPendingMapping<V>> = [];

  for (
    let item: SupersededMappingJournal<V> | null = journal;
    item;
    item = item.previous
  ) {
    entries.push(item.entry);
  }

  return entries.reverse();
};

export const collectSupersededEffectKeys = <V extends Value>(
  entries: ReadonlyArray<SupersededPendingMapping<V>>
): ReadonlySet<string> | undefined => {
  let combined: Set<string> | null = null;
  let single: ReadonlySet<string> | undefined;

  for (const entry of entries) {
    const keys = entry.supersededEffectKeys;

    if (!keys || keys.size === 0) continue;
    if (!single && !combined) {
      single = keys;
      continue;
    }
    if (!combined) {
      combined = new Set(single);
      single = undefined;
    }
    for (const key of keys) combined.add(key);
  }

  return combined ?? single;
};

export const appendPendingMapping = <V extends Value>(
  previous: SupersededMappingJournal<V> | null,
  entry: SupersededPendingMapping<V>,
  carries: boolean
): SupersededMappingJournal<V> => {
  const coalescedSuperseded =
    previous?.entry.change.empty &&
    entry.change.empty &&
    previous.entry.supersededEffectKeys &&
    entry.supersededEffectKeys
      ? collectSupersededEffectKeys([previous.entry, entry])
      : undefined;

  if (coalescedSuperseded && previous) {
    return Object.freeze({
      entry: Object.freeze({
        after: entry.after,
        change: DocumentChange.empty,
        supersededEffectKeys: coalescedSuperseded,
        textOnly: false,
      }),
      previous: previous.previous,
    });
  }

  if (!carries && previous?.entry.textOnly && entry.textOnly) {
    return Object.freeze({
      entry: Object.freeze({
        after: entry.after,
        change: previous.entry.change.compose(entry.change),
        textOnly: true,
      }),
      previous: previous.previous,
    });
  }

  return Object.freeze({ entry, previous });
};

export const mapBatchEffects = <V extends Value>(
  effects: Batch<V>['effects'],
  mapping: SupersededPendingMapping<V>
) =>
  effects.flatMap((effect) => {
    if (mapping.supersededEffectKeys?.has(effect.type.key)) return [];

    const mappedEffect = mapEffect(effect, mapping.change);

    return mappedEffect ? [mappedEffect] : [];
  });

export const applyEmptyChangeMapping = <V extends Value, TBranch>(
  batchValue: Batch<V>,
  next: TBranch | null,
  nextBase: EditorDocumentValue<V>,
  mapping: SupersededPendingMapping<V>,
  freezeBatch: (batch: Batch<V>) => Batch<V>,
  attach: (
    branch: TBranch | null,
    entry: SupersededPendingMapping<V>
  ) => TBranch | null
): Readonly<{ batchValue: Batch<V>; next: TBranch | null }> => {
  const superseded = mapping.supersededEffectKeys;

  if (!superseded || superseded.size === 0) return { batchValue, next };

  const effects = batchValue.effects.filter(
    (effect) => !superseded.has(effect.type.key)
  );

  return {
    batchValue:
      effects.length === batchValue.effects.length
        ? batchValue
        : withHistoryProgram(
            freezeBatch({ ...batchValue, effects }),
            historyProgramOf(batchValue)
          ),
    next: attach(next, {
      after: nextBase,
      change: DocumentChange.empty,
      supersededEffectKeys: superseded,
      textOnly: false,
    }),
  };
};

export const buildDropMapping = <V extends Value>(
  after: EditorDocumentValue<V>,
  change: DocumentChange,
  supersededEffectKeys: ReadonlySet<string> | undefined,
  textOnly: boolean
): SupersededPendingMapping<V> | null => {
  if (change.empty && !supersededEffectKeys) return null;

  return {
    after,
    change,
    ...(supersededEffectKeys ? { supersededEffectKeys } : {}),
    textOnly: !supersededEffectKeys && textOnly,
  };
};

export const buildPropagatedMapping = <V extends Value>(
  after: EditorDocumentValue<V>,
  change: DocumentChange,
  supersededEffectKeys?: ReadonlySet<string>,
  crossing?: ChangeFacts
): SupersededPendingMapping<V> | null => {
  if (change.empty && !supersededEffectKeys) return null;

  return {
    after,
    change,
    textOnly: false,
    ...(crossing && !change.empty ? { crossing } : {}),
    ...(supersededEffectKeys ? { supersededEffectKeys } : {}),
  };
};

export const buildQueuedHistoryMapping = <V extends Value>(
  after: EditorDocumentValue<V>,
  change: DocumentChange,
  crosses: boolean,
  facts: ChangeFacts,
  supersededEffectKeys: ReadonlySet<string> | undefined,
  textOnly: boolean
): SupersededPendingMapping<V> =>
  Object.freeze({
    after,
    ...(change.empty ? {} : { anchors: true as const }),
    change,
    ...(supersededEffectKeys ? { supersededEffectKeys } : {}),
    textOnly: !supersededEffectKeys && textOnly,
    ...(crosses ? { crossing: facts } : {}),
  });

export const forwardedSupersededMapping = <V extends Value>(
  from: Readonly<{
    mappings: SupersededMappingJournal<V> | null;
  }>,
  next: Readonly<{
    base: EditorDocumentValue<V>;
    mappings: SupersededMappingJournal<V> | null;
  }> | null
): SupersededPendingMapping<V> | null => {
  if (!next || !from.mappings) return null;

  const supersededEffectKeys = collectSupersededEffectKeys(
    journalEntries(from.mappings)
  );

  if (!supersededEffectKeys) return null;

  return {
    after: next.mappings?.entry.after ?? next.base,
    change: DocumentChange.empty,
    supersededEffectKeys,
    textOnly: false,
  };
};
