import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentChangeRecords,
  getInternalDocumentRootChange,
  valueRoot,
  valueRootIndex,
  withoutRetainedRecordSets,
} from '../../core/change/document-change';
import { jsonEqual } from '../../core/change/json';
import type { RootChange } from '../../core/change/root-change';
import type { JsonEditorValue, JsonNode } from '../../core/change/tokens';
import {
  getRecordText,
  getValueRecords,
  type RecordOps,
  recordOpsBetween,
} from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { sameDocument } from '../protocol';
import type { SyncGrant, SyncWriteCheck } from './grant';
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
          (id) =>
            getRecordText(store, set, id) === getRecordText(written, set, id)
        )
    );
  });
};

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

  const roots = new Map<string, RootChange>();

  for (const [index, { after }] of windows.entries()) {
    const { end, root, start } = walk.windows[index];

    if (
      !jsonEqual(
        valueRoot(head, root).slice(start, end),
        valueRoot(entry.after, root).slice(after.start, after.end)
      )
    ) {
      return null;
    }

    const written = valueRootIndex(entry.after, root);
    const current = valueRootIndex(head, root);
    const part = getInternalDocumentRootChange(inverse, root)?.within(
      written.childPosition([], after.start),
      written.childPosition([], after.end)
    );

    if (!part) return null;
    roots.set(
      root,
      part.embed(current.length, current.childPosition([], start))
    );
  }

  return createInternalDocumentChange(roots, {
    records: getInternalDocumentChangeRecords(inverse),
  });
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

const resultOf = (change: DocumentChange, head: JsonEditorValue) => {
  try {
    return change.apply(head);
  } catch {
    return null;
  }
};

type Blocks = Readonly<{
  added: readonly JsonNode[];
  dropped: readonly JsonNode[];
}>;

type Changed = Readonly<{
  blocks: ReadonlyMap<string, Blocks>;
  records: RecordOps;
}>;

const rootsOf = (value: JsonEditorValue) => [
  'main',
  ...Object.keys(value.roots ?? {}),
];

const changedBlocks = (
  from: readonly JsonNode[],
  to: readonly JsonNode[]
): Blocks => {
  let start = 0;
  let fromEnd = from.length;
  let toEnd = to.length;

  while (
    start < fromEnd &&
    start < toEnd &&
    jsonEqual(from[start], to[start])
  ) {
    start += 1;
  }
  while (
    fromEnd > start &&
    toEnd > start &&
    jsonEqual(from[fromEnd - 1], to[toEnd - 1])
  ) {
    fromEnd -= 1;
    toEnd -= 1;
  }

  return {
    added: to.slice(start, toEnd),
    dropped: from.slice(start, fromEnd),
  };
};

const changedBetween = (
  head: JsonEditorValue,
  after: JsonEditorValue
): Changed | 'roots' => {
  const roots = rootsOf(head);
  const afterRoots = new Set(rootsOf(after));

  if (
    roots.length !== afterRoots.size ||
    roots.some((root) => !afterRoots.has(root))
  ) {
    return 'roots';
  }

  return {
    blocks: new Map(
      roots.map((root) => [
        root,
        changedBlocks(valueRoot(head, root), valueRoot(after, root)),
      ])
    ),
    records: recordOpsBetween(getValueRecords(head), getValueRecords(after)),
  };
};

const holds = (nodes: readonly JsonNode[], block: JsonNode) =>
  nodes.some((node) => jsonEqual(node, block));

const couldRestore = (entry: PutEntry, { blocks, records }: Changed) => {
  const written = getInternalDocumentChangeRecords(entry.change);
  const windows = new Map(
    windowsOf(entry).map((window) => [window.before.root, window])
  );

  return (
    [...records].every(([set, ids]) =>
      [...ids.keys()].every((id) => written.get(set)?.has(id) === true)
    ) &&
    [...blocks].every(([root, { added, dropped }]) => {
      if (added.length === 0 && dropped.length === 0) return true;

      const window = windows.get(root);

      if (!window) return false;

      const { after, before } = window;
      const putBack = valueRoot(entry.before, root).slice(
        before.start,
        before.end
      );
      const takenOut = valueRoot(entry.after, root).slice(
        after.start,
        after.end
      );

      return (
        added.every((block) => holds(putBack, block)) &&
        dropped.every((block) => holds(takenOut, block))
      );
    })
  );
};

export const ownTakeBack = (
  entries: readonly LaterEntry[],
  writer: string,
  grant: SyncGrant,
  covers: SyncWriteCheck,
  head: JsonEditorValue,
  after: JsonEditorValue,
  schema: CompiledEditorSchema
): DocumentChange | null => {
  const changed = changedBetween(head, after);

  for (let index = entries.length - 1; index >= 0; index -= 1) {
    if (entries[index].writer !== writer) continue;

    const entry = putEntryAt(entries, index);

    if (changed !== 'roots' && !couldRestore(entry, changed)) continue;

    const change = takeBack(entry, head, schema);
    const result = change && resultOf(change, head);

    if (
      result &&
      sameDocument(result, after) &&
      covers(entry, grant, schema).kind === 'covered'
    ) {
      return change;
    }
  }

  return null;
};
