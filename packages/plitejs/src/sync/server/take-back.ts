import {
  DocumentChange,
  getInternalDocumentChangeRecords,
  valueRoot,
  withoutRetainedRecordSets,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import type { JsonEditorValue, JsonNode } from '../../core/change/tokens';
import {
  applyRecordOps,
  deriveValue,
  getRecord,
  getValueRecords,
  showValueRecords,
} from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { sameDocument } from '../protocol';
import { type LaterEntry, walkWindow, windowsOf } from './window';

export type { LaterEntry } from './window';

export type PutEntry = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
  /** The entries admitted since, oldest first. */
  later: readonly LaterEntry[];
  writer: string;
}>;

const inverseOf = (
  { before, change }: PutEntry,
  { recordSets }: CompiledEditorSchema
) => withoutRetainedRecordSets(change.invert(before), recordSets);

const keepsItsRecords = (entry: PutEntry, head: JsonEditorValue) => {
  const written = getValueRecords(entry.after);

  return [...entry.later.map(({ after }) => after), head].every((value) => {
    const store = getValueRecords(value);

    return [...getInternalDocumentChangeRecords(entry.change)].every(
      ([set, ids]) =>
        [...ids.keys()].every(
          (id) => getRecord(store, set, id) === getRecord(written, set, id)
        )
    );
  });
};

const withRoot = (
  value: JsonEditorValue,
  root: string,
  nodes: readonly JsonNode[]
): JsonEditorValue =>
  deriveValue(
    value,
    root === 'main'
      ? { children: nodes }
      : { roots: { ...value.roots, [root]: nodes } }
  );

const blocksBack = (
  entry: PutEntry,
  head: JsonEditorValue,
  inverse: DocumentChange
) => {
  const windows = windowsOf(entry);
  const walk = walkWindow(
    windows.map(({ after }) => after),
    entry.later
  );

  if (walk === 'crossed') return null;
  if ([...walk.writers].some((writer) => writer !== entry.writer)) return null;

  let value: JsonEditorValue = {
    children: head.children,
    ...(head.roots ? { roots: head.roots } : {}),
  };

  for (const [index, { after, before }] of windows.entries()) {
    const { end, root, start } = walk.windows[index];
    const current = valueRoot(head, root);

    if (
      !jsonEqual(
        current.slice(start, end),
        valueRoot(entry.after, root).slice(after.start, after.end)
      )
    ) {
      return null;
    }
    value = withRoot(value, root, [
      ...current.slice(0, start),
      ...valueRoot(entry.before, root).slice(before.start, before.end),
      ...current.slice(end),
    ]);
  }

  showValueRecords(
    value,
    applyRecordOps(
      getValueRecords(head),
      getInternalDocumentChangeRecords(inverse)
    )
  );

  return DocumentChange.between(head, value);
};

export const putAllIndexOf = (
  changes: readonly DocumentChange[],
  set: string,
  ids: readonly string[]
) => {
  const putsOf = (change: DocumentChange) => {
    const ops = getInternalDocumentChangeRecords(change).get(set);

    return ids.filter((id) => typeof ops?.get(id) === 'string').length;
  };
  const index = changes.findLastIndex((change) => putsOf(change) > 0);

  return index !== -1 && putsOf(changes[index]) === ids.length ? index : null;
};

export const putEntryAt = (
  entries: readonly LaterEntry[],
  index: number
): PutEntry => ({ ...entries[index], later: entries.slice(index + 1) });

export const takeBack = (
  entry: PutEntry,
  head: JsonEditorValue,
  schema: CompiledEditorSchema
): DocumentChange | null => {
  if (!keepsItsRecords(entry, head)) return null;

  const inverse = inverseOf(entry, schema);

  if (
    entry.later.every(({ writer }) => writer === entry.writer) &&
    sameDocument(head, entry.after)
  ) {
    return inverse;
  }

  return entry.change.createRoots.size > 0 || entry.change.deleteRoots.size > 0
    ? null
    : blocksBack(entry, head, inverse);
};
