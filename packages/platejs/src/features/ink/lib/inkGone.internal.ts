import type { EditorUniqueHolder } from '../../../core';
import {
  afterActiveTransactionEnds,
  type EditorDocumentValue,
  ElementApi,
  getActiveEditorUpdateId,
  getDocumentValueNode,
  getEditorRuntimeOwner,
  type Node,
  type Path,
  type RuntimeAnyEditor,
} from '../../../facade';

export type InkGone = Readonly<{ next?: string; previous?: string }>;

export type SavedRecords = Readonly<
  Record<string, Readonly<Record<string, Readonly<Record<string, unknown>>>>>
>;

export const GONE = 'ink-gone';

type GoneTx = Readonly<{
  records: Readonly<{
    drop: (set: string, id: string) => void;
    put: (set: string, id: string, record: InkGone) => void;
  }>;
  unique: Readonly<{
    holder: (field: 'id', id: string) => EditorUniqueHolder | null;
  }>;
  value: () => Readonly<{ records?: SavedRecords }>;
}>;

const ADD_LOOKBACK_UPDATES = 4;

type GoneSession = {
  departed: Map<string, InkGone>;
  pending: Set<string>;
  recent: Array<
    Readonly<{ departed: ReadonlyMap<string, InkGone>; order: number }>
  >;
  runs: number;
  update: WeakRef<object> | undefined;
};

const sessions = new WeakMap<object, GoneSession>();

export const goneIn = (records: SavedRecords | undefined, id: string) => {
  const record = records?.[GONE]?.[id];

  return (
    record && {
      ...(typeof record.next === 'string' ? { next: record.next } : {}),
      ...(typeof record.previous === 'string'
        ? { previous: record.previous }
        : {}),
    }
  );
};

const sameGone = (a: InkGone | undefined, b: InkGone) =>
  a !== undefined && a.next === b.next && a.previous === b.previous;

export const idOf = (node: Node | null) =>
  ElementApi.isElement(node) && typeof node.id === 'string'
    ? node.id
    : undefined;

const beside = (document: EditorDocumentValue, gap: Path, step: -1 | 1) => {
  const parent = gap.slice(0, -1);
  let [index] = gap.slice(-1);

  if (step === -1) index -= 1;
  while (true) {
    const node =
      index >= 0 ? getDocumentValueNode(document, [...parent, index]) : null;

    if (node) {
      const id = idOf(node);

      if (id) return id;
      index += step;
    } else if (parent.length > 0) {
      const [up] = parent.splice(-1);

      index = up + step;
    } else {
      return undefined;
    }
  }
};

const currentSession = (editor: RuntimeAnyEditor) => {
  const session = sessions.get(getEditorRuntimeOwner(editor));

  return session?.update?.deref() === getActiveEditorUpdateId(editor)
    ? session
    : undefined;
};

export const captureGone = (
  editor: RuntimeAnyEditor,
  tags: Readonly<{ has: (tag: string) => boolean }>,
  after: EditorDocumentValue,
  { gap, id }: Readonly<{ gap: Path; id: string }>
) => {
  const update = getActiveEditorUpdateId(editor);

  if (!update) return;

  const owner = getEditorRuntimeOwner(editor);
  let session = sessions.get(owner);

  if (!session) {
    session = {
      departed: new Map(),
      pending: new Set(),
      recent: [],
      runs: 0,
      update: undefined,
    };
    sessions.set(owner, session);
  }
  if (session.update?.deref() !== update) {
    const departed = new Map<string, InkGone>();
    session.runs += 1;
    const order = session.runs;
    const { recent } = session;

    session.update = new WeakRef(update);
    session.departed = departed;
    session.pending = new Set();
    afterActiveTransactionEnds(editor, () => {
      const at = recent.findIndex((run) => run.order > order);

      recent.splice(at === -1 ? recent.length : at, 0, { departed, order });
      if (recent.length > ADD_LOOKBACK_UPDATES) recent.shift();
    });
  }

  const next = beside(after, gap, 1);
  const previous = beside(after, gap, -1);

  session.departed.set(id, {
    ...(next ? { next } : {}),
    ...(previous ? { previous } : {}),
  });

  const savedByPeer = tags.has('collaboration');

  if (!savedByPeer) session.pending.add(id);
};

export const hasPendingGone = (editor: RuntimeAnyEditor) =>
  !!currentSession(editor)?.pending.size;

const writeGone = (
  tx: GoneTx,
  ids: Iterable<string>,
  placeOf: (id: string) => InkGone | undefined,
  writes: (saved: InkGone | undefined, place: InkGone) => boolean
) => {
  const { records } = tx.value();
  const queue = [...ids];
  const done = new Set<string>();

  for (const id of queue) {
    if (done.has(id)) continue;
    done.add(id);

    const place = placeOf(id);

    if (!place || tx.unique.holder('id', id)) continue;

    const saved = goneIn(records, id);

    if (!writes(saved, place)) continue;
    if (saved) tx.records.drop(GONE, id);
    tx.records.put(GONE, id, place);
    for (const neighbor of [place.next, place.previous]) {
      if (neighbor !== undefined && !done.has(neighbor)) queue.push(neighbor);
    }
  }
};

export const flushGone = (
  editor: RuntimeAnyEditor,
  tx: GoneTx,
  named: (id: string) => boolean
) => {
  const session = currentSession(editor);

  if (!session) return;

  const { records } = tx.value();
  const ids = [...session.pending].filter(
    (id) => named(id) || goneIn(records, id) !== undefined
  );
  const { departed } = session;

  session.pending = new Set();
  writeGone(
    tx,
    ids,
    (id) => departed.get(id),
    (saved, place) => !sameGone(saved, place)
  );
};

export const addGone = (
  editor: RuntimeAnyEditor,
  tx: GoneTx,
  block: string
) => {
  const current = currentSession(editor)?.departed;
  const recent = sessions.get(getEditorRuntimeOwner(editor))?.recent ?? [];

  writeGone(
    tx,
    [block],
    (id) =>
      current?.get(id) ??
      recent.findLast((run) => run.departed.has(id))?.departed.get(id),
    (saved) => saved === undefined
  );
};
