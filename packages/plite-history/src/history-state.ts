import {
  DocumentChange,
  mapEffect,
  type Editor,
  type EditorDocumentValue,
  type EditorSchemaIdentity,
  type Value,
} from '@platejs/plite';
import {
  type AnyEditor,
  areEditorSchemaIdentitiesEqual,
  getInternalDocumentChangeClassificationEntries,
  getInternalDocumentChangeRootKeys,
  MAIN_ROOT_KEY,
  mapSelectionThroughChange,
} from '@platejs/plite/internal';

import type { Batch, History } from './history';
import type { HistoryBatchGroup } from './history-merge-policy';

type HistoryStack = 'redos' | 'undos';

type PendingMapping<V extends Value> = Readonly<{
  before: EditorDocumentValue<V>;
  change: DocumentChange;
  textOnly: boolean;
}>;

type MappingJournal<V extends Value> = Readonly<{
  entry: PendingMapping<V>;
  previous: MappingJournal<V> | null;
}>;

type HistoryBranch<V extends Value> = Readonly<{
  base: EditorDocumentValue<V>;
  batch: Batch<V>;
  depth: number;
  group: HistoryBatchGroup | null;
  mappings: MappingJournal<V> | null;
  next: HistoryBranch<V> | null;
}>;

type HistoryStore<V extends Value> = Readonly<{
  maxDepth: number;
  redos: HistoryBranch<V> | null;
  revision: number;
  schema: EditorSchemaIdentity;
  snapshot: History<V> | null;
  undos: HistoryBranch<V> | null;
}>;

const HISTORY = new WeakMap<AnyEditor, HistoryStore<Value>>();

export const captureHistoryState = (editor: AnyEditor) => HISTORY.get(editor);

export const restoreHistoryState = (
  editor: AnyEditor,
  state: HistoryStore<Value> | undefined
) => {
  if (state) HISTORY.set(editor, state);
  else HISTORY.delete(editor);
};

const createStore = <V extends Value>(editor: Editor<V>): HistoryStore<V> => ({
  maxDepth: 100,
  redos: null,
  revision: 0,
  schema: editor.read.schema.identity(),
  snapshot: null,
  undos: null,
});

const getStore = <V extends Value>(editor: Editor<V>): HistoryStore<V> => {
  let store = HISTORY.get(editor) as HistoryStore<V> | undefined;

  if (!store) {
    store = createStore(editor);
    HISTORY.set(editor, store as HistoryStore<Value>);
  }

  return store;
};

const setStore = <V extends Value>(
  editor: Editor<V>,
  store: HistoryStore<V>
) => {
  HISTORY.set(editor, store as HistoryStore<Value>);
};

const publish = <V extends Value>(
  editor: Editor<V>,
  store: HistoryStore<V>,
  patch: Partial<
    Pick<HistoryStore<V>, 'maxDepth' | 'redos' | 'schema' | 'undos'>
  >
) => {
  const next = Object.freeze({
    ...store,
    ...patch,
    revision: store.revision + 1,
    snapshot: null,
  });

  setStore(editor, next);

  return next;
};

const cloneFrozen = <T>(value: T): T => {
  const clone = structuredClone(value);
  const pending: object[] =
    clone && typeof clone === 'object' ? [clone as object] : [];
  const seen = new WeakSet<object>();

  while (pending.length > 0) {
    const item = pending.pop()!;

    if (seen.has(item)) continue;
    seen.add(item);
    for (const nested of Object.values(item)) {
      if (nested && typeof nested === 'object') pending.push(nested);
    }
    Object.freeze(item);
  }

  return clone;
};

const omitPrimaryPointRoot = <T extends { readonly root?: string }>(
  point: T
) => {
  if (point.root !== MAIN_ROOT_KEY) return point;

  const { root: _root, ...rest } = point;

  return rest;
};

const omitPrimarySelectionRoot = <T extends Batch['selectionAfter']>(
  selection: T
): T =>
  (selection
    ? {
        ...selection,
        anchor: omitPrimaryPointRoot(selection.anchor),
        focus: omitPrimaryPointRoot(selection.focus),
      }
    : null) as T;

const additionalRoot = (root: string | undefined) =>
  root && root !== MAIN_ROOT_KEY ? root : undefined;

export const freezeHistoryBatch = <V extends Value>(
  batch: Batch<V>
): Batch<V> => {
  const { selectionAfterRoot, selectionBeforeRoot, ...value } = batch;
  const afterRoot = additionalRoot(selectionAfterRoot);
  const beforeRoot = additionalRoot(selectionBeforeRoot);

  return Object.freeze({
    ...value,
    effects: Object.freeze(
      batch.effects.map((effect) => Object.freeze({ ...effect }))
    ),
    selectionAfter: cloneFrozen(omitPrimarySelectionRoot(batch.selectionAfter)),
    ...(afterRoot ? { selectionAfterRoot: afterRoot } : {}),
    selectionBefore: cloneFrozen(
      omitPrimarySelectionRoot(batch.selectionBefore)
    ),
    ...(beforeRoot ? { selectionBeforeRoot: beforeRoot } : {}),
  });
};

const freezeBatch = freezeHistoryBatch;

const branch = <V extends Value>(
  batch: Batch<V>,
  base: EditorDocumentValue<V>,
  next: HistoryBranch<V> | null,
  mappings: MappingJournal<V> | null = null,
  group: HistoryBatchGroup | null = null
): HistoryBranch<V> =>
  Object.freeze({
    base,
    batch: freezeBatch(batch),
    depth: (next?.depth ?? 0) + 1,
    group,
    mappings,
    next,
  });

const clipBranch = <V extends Value>(
  value: HistoryBranch<V> | null,
  maxDepth: number
): HistoryBranch<V> | null => {
  if (!value || maxDepth === 0) return null;
  if (value.depth <= maxDepth) return value;

  const kept: HistoryBranch<V>[] = [];
  let current: HistoryBranch<V> | null = value;

  while (current && kept.length < maxDepth) {
    kept.push(current);
    current = current.next;
  }

  let clipped: HistoryBranch<V> | null = null;
  for (const item of kept.toReversed()) {
    clipped = branch(item.batch, item.base, clipped, item.mappings, item.group);
  }

  return clipped;
};

const pushBranch = <V extends Value>(
  value: HistoryBranch<V> | null,
  batchValue: Batch<V>,
  base: EditorDocumentValue<V>,
  maxDepth: number,
  group: HistoryBatchGroup | null = null
) => branch(batchValue, base, clipBranch(value, maxDepth - 1), null, group);

const addMapping = <V extends Value>(
  value: HistoryBranch<V> | null,
  entry: PendingMapping<V>
): HistoryBranch<V> | null => {
  if (!value) return null;

  const previous = value.mappings;
  const mappings =
    previous?.entry.textOnly && entry.textOnly
      ? Object.freeze({
          entry: Object.freeze({
            before: previous.entry.before,
            change: previous.entry.change.compose(entry.change),
            textOnly: true,
          }),
          previous: previous.previous,
        })
      : Object.freeze({ entry, previous });

  return Object.freeze({ ...value, mappings });
};

const journalEntries = <V extends Value>(
  journal: MappingJournal<V>
): readonly PendingMapping<V>[] => {
  const entries: PendingMapping<V>[] = [];

  for (
    let item: MappingJournal<V> | null = journal;
    item;
    item = item.previous
  ) {
    entries.push(item.entry);
  }

  return entries.reverse();
};

const resolveHead = <V extends Value>(
  editor: Editor<V>,
  value: HistoryBranch<V>
): HistoryBranch<V> | null => {
  if (!value.mappings) return value;

  let batchBase = value.base;
  let batchValue = value.batch;
  let next = value.next;

  for (const mapping of journalEntries(value.mappings)) {
    const nextBase = batchValue.change.apply(
      batchBase
    ) as EditorDocumentValue<V>;
    const batchChange =
      mapping.textOnly && isTextOnlyMapping(batchValue.change)
        ? DocumentChange.between(batchBase, nextBase)
        : batchValue.change;
    const mappedFirst = DocumentChange.transform(
      mapping.change,
      batchChange,
      batchBase
    );
    const transformed = {
      a: mappedFirst.b,
      b: mappedFirst.a,
    };
    const mappedBatchBase = mapping.change.apply(batchBase);
    const mappedNextBase = transformed.b.apply(nextBase);

    batchValue = freezeBatch<V>({
      ...batchValue,
      change: transformed.a,
      effects: batchValue.effects.flatMap((effect) => {
        const mapped = mapEffect(effect, mapping.change);

        return mapped ? [mapped] : [];
      }),
      selectionAfter: mapSelectionThroughChange(
        editor,
        batchValue.selectionAfter,
        mapping.change,
        batchBase,
        mappedBatchBase,
        batchValue.selectionAfterRoot ?? MAIN_ROOT_KEY
      ),
      selectionBefore: mapSelectionThroughChange(
        editor,
        batchValue.selectionBefore,
        transformed.b,
        nextBase,
        mappedNextBase,
        batchValue.selectionBeforeRoot ?? MAIN_ROOT_KEY
      ),
    });
    if (!transformed.b.empty) {
      next = addMapping<V>(next, {
        before: nextBase,
        change: transformed.b,
        textOnly: false,
      });
    }
    batchBase = mappedBatchBase as EditorDocumentValue<V>;
  }

  if (batchValue.change.empty && batchValue.effects.length === 0) return next;

  return branch<V>(batchValue, batchBase, next);
};

const resolveTop = <V extends Value>(
  editor: Editor<V>,
  value: HistoryBranch<V> | null
): HistoryBranch<V> | null => {
  let current = value;

  while (current?.mappings) current = resolveHead(editor, current);

  return current;
};

const resolveAll = <V extends Value>(
  editor: Editor<V>,
  value: HistoryBranch<V> | null
) => {
  const newest: Readonly<{
    base: EditorDocumentValue<V>;
    batch: Batch<V>;
    group: HistoryBatchGroup | null;
  }>[] = [];
  let current = value;

  while (current) {
    current = resolveTop(editor, current);
    if (!current) break;
    newest.push({
      base: current.base,
      batch: current.batch,
      group: current.group,
    });
    current = current.next;
  }

  let resolved: HistoryBranch<V> | null = null;
  for (let index = newest.length - 1; index >= 0; index--) {
    const entry = newest[index]!;

    resolved = branch(entry.batch, entry.base, resolved, null, entry.group);
  }

  return {
    batches: Object.freeze(newest.toReversed().map((entry) => entry.batch)),
    branch: resolved,
  };
};

const fromBatches = <V extends Value>(
  batches: readonly Batch<V>[],
  base: EditorDocumentValue<V>,
  maxDepth: number
) => {
  const entries: Array<{
    base: EditorDocumentValue<V>;
    batch: Batch<V>;
  }> = [];
  let currentBase = base;

  for (const batchValue of batches.slice(-maxDepth).toReversed()) {
    entries.push({ base: currentBase, batch: batchValue });
    currentBase = batchValue.change.apply(
      currentBase
    ) as EditorDocumentValue<V>;
  }

  let value: HistoryBranch<V> | null = null;
  for (const entry of entries.toReversed()) {
    value = branch(entry.batch, entry.base, value);
  }

  return value;
};

/** Publish activation options and the live schema as one history revision. */
export const configureHistoryState = <V extends Value>(
  editor: Editor<V>,
  maxDepth: number
) => {
  const store = getStore(editor);
  const schema = editor.read.schema.identity();
  const schemaChanged = !areEditorSchemaIdentitiesEqual(store.schema, schema);

  if (store.maxDepth === maxDepth && !schemaChanged) return false;

  publish(editor, store, {
    maxDepth,
    redos: schemaChanged ? null : clipBranch(store.redos, maxDepth),
    schema,
    undos: schemaChanged ? null : clipBranch(store.undos, maxDepth),
  });

  return schemaChanged;
};

/** Reset both branches when a configuration publishes a new schema identity. */
export const synchronizeHistorySchema = <V extends Value>(editor: Editor<V>) =>
  configureHistoryState(editor, getStore(editor).maxDepth);

export const getHistory = <V extends Value>(editor: Editor<V>): History<V> => {
  const store = getStore(editor);

  if (store.snapshot) return store.snapshot;

  const redos = resolveAll(editor, store.redos);
  const undos = resolveAll(editor, store.undos);
  const snapshot = Object.freeze({
    redos: redos.batches,
    revision: store.revision,
    schema: store.schema,
    undos: undos.batches,
  });

  setStore(
    editor,
    Object.freeze({
      ...store,
      redos: redos.branch,
      snapshot,
      undos: undos.branch,
    })
  );

  return snapshot;
};

export const peekHistoryEntry = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack
) => {
  const store = getStore(editor);
  const resolved = resolveTop(editor, store[stack]);

  if (resolved !== store[stack]) {
    setStore(
      editor,
      Object.freeze({
        ...store,
        [stack]: resolved,
        snapshot: null,
      })
    );
  }

  return resolved
    ? Object.freeze({ batch: resolved.batch, group: resolved.group })
    : undefined;
};

export const peekHistoryBatch = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack
) => peekHistoryEntry(editor, stack)?.batch;

export const writeHistory = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack,
  batchValue: Batch<V>,
  options: Readonly<{
    clearRedos?: boolean;
    group?: HistoryBatchGroup | null;
  }> = {}
) => {
  const store = getStore(editor);

  publish(editor, store, {
    [stack]: pushBranch(
      store[stack],
      batchValue,
      editor.read.value(),
      store.maxDepth,
      options.group ?? null
    ),
    ...(options.clearRedos ? { redos: null } : {}),
  });
};

export const replaceHistoryHead = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack,
  batchValue: Batch<V>,
  options: Readonly<{
    clearRedos?: boolean;
    group?: HistoryBatchGroup | null;
  }> = {}
) => {
  const store = getStore(editor);
  const resolved = resolveTop(editor, store[stack]);

  if (!resolved) throw new Error(`Missing ${stack} history batch.`);

  publish(editor, store, {
    [stack]: branch(
      batchValue,
      editor.read.value(),
      resolved.next,
      null,
      options.group ?? null
    ),
    ...(options.clearRedos ? { redos: null } : {}),
  });
};

export const completeHistoryAction = <V extends Value>(
  editor: Editor<V>,
  source: HistoryStack,
  destination: HistoryStack,
  batchValue: Batch<V>,
  discardRedos = false
) => {
  const store = getStore(editor);
  const resolved = resolveTop(editor, store[source]);

  if (!resolved) throw new Error(`Missing ${source} history batch.`);

  const current = editor.read.value();
  let nextSource = resolveTop(editor, resolved.next);

  if (nextSource) {
    const correction = DocumentChange.between(nextSource.base, current);

    if (!correction.empty) {
      nextSource = addMapping(nextSource, {
        before: nextSource.base,
        change: correction,
        textOnly: isTextOnlyMapping(correction),
      });
    }
  }

  publish(editor, store, {
    [destination]: pushBranch(
      store[destination],
      batchValue,
      current,
      store.maxDepth,
      resolved.group
    ),
    [source]: nextSource,
    ...(discardRedos ? { redos: null } : {}),
  });
};

export const clearHistoryStack = <V extends Value>(
  editor: Editor<V>,
  stack: HistoryStack
) => {
  const store = getStore(editor);

  if (!store[stack]) return;
  publish(editor, store, { [stack]: null });
};

const isTextOnlyMapping = (change: DocumentChange) => {
  const classifications = [
    ...getInternalDocumentChangeClassificationEntries(change),
  ];

  return (
    change.createRoots.size === 0 &&
    change.deleteRoots.size === 0 &&
    getInternalDocumentChangeRootKeys(change).length > 0 &&
    classifications.length > 0 &&
    classifications.every(
      ([, classification]) =>
        classification.text === true &&
        !classification.properties &&
        !classification.structure
    )
  );
};

export const queueHistoryMapping = <V extends Value>(
  editor: Editor<V>,
  change: DocumentChange,
  before: EditorDocumentValue<V>
) => {
  if (change.empty) return;

  const store = getStore(editor);
  const mapping = Object.freeze({
    before,
    change,
    textOnly: isTextOnlyMapping(change),
  });

  publish(editor, store, {
    redos: addMapping(store.redos, mapping),
    undos: addMapping(store.undos, mapping),
  });
};

export const clearHistoryState = (editor: Editor) => {
  HISTORY.delete(editor);
};

export const replaceHistoryState = <V extends Value>(
  editor: Editor<V>,
  value: Pick<History<V>, 'redos' | 'schema' | 'undos'>
) => {
  const store = getStore(editor);
  const base = editor.read.value();
  const next = Object.freeze({
    ...store,
    redos: fromBatches(value.redos, base, store.maxDepth),
    revision: store.revision + 1,
    schema: value.schema,
    snapshot: null,
    undos: fromBatches(value.undos, base, store.maxDepth),
  });

  setStore(editor, next);

  return getHistory(editor);
};
