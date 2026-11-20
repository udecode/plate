import type { EditorUniqueHolder } from '../../../core';
import {
  afterActiveTransactionEnds,
  canonicalRecordJson,
  DocumentChange,
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
  changes: Readonly<{ apply: (change: DocumentChange) => void }>;
  unique: Readonly<{
    holder: (field: 'id', id: string) => EditorUniqueHolder | null;
  }>;
  value: () => Readonly<{ records?: SavedRecords }>;
}>;

const ADD_LOOKBACK_UPDATES = 4;

type GoneSession = {
  departed: Map<string, InkGone>;
  holdCounts: Map<string, number>;
  kept: Map<string, Readonly<{ order: number; place: InkGone }>>;
  pending: Set<string>;
  recent: Array<
    Readonly<{ departed: ReadonlyMap<string, InkGone>; order: number }>
  >;
  runs: number;
  update: WeakRef<object> | undefined;
};

const sessions = new WeakMap<object, GoneSession>();

const sessionOf = (owner: object) => {
  let session = sessions.get(owner);

  if (!session) {
    session = {
      departed: new Map(),
      holdCounts: new Map(),
      kept: new Map(),
      pending: new Set(),
      recent: [],
      runs: 0,
      update: undefined,
    };
    sessions.set(owner, session);
  }

  return session;
};

const keepHeldChains = (
  { holdCounts, kept }: GoneSession,
  departed: ReadonlyMap<string, InkGone>,
  order: number
) => {
  let grew = holdCounts.size > 0;

  while (grew) {
    grew = false;

    const named = new Set(
      [...kept.values()].flatMap(({ place }) => [place.next, place.previous])
    );

    for (const [id, place] of departed) {
      const saved = kept.get(id);

      if (saved && saved.order >= order) continue;
      if (saved || holdCounts.has(id) || named.has(id)) {
        kept.set(id, { order, place });
        grew = true;
      }
    }
  }
};

export const holdInkBlock = (editor: RuntimeAnyEditor, block: string) => {
  const session = sessionOf(getEditorRuntimeOwner(editor));

  session.holdCounts.set(block, (session.holdCounts.get(block) ?? 0) + 1);

  let released = false;

  return () => {
    if (released) return;
    released = true;

    const count = (session.holdCounts.get(block) ?? 1) - 1;

    if (count > 0) session.holdCounts.set(block, count);
    else session.holdCounts.delete(block);
    if (session.holdCounts.size === 0) session.kept.clear();
  };
};

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

  const session = sessionOf(getEditorRuntimeOwner(editor));

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
      keepHeldChains(session, departed, order);
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
  const texts = new Map<string, string>();

  for (const id of queue) {
    if (done.has(id)) continue;
    done.add(id);

    const place = placeOf(id);

    if (!place || tx.unique.holder('id', id)) continue;

    const saved = goneIn(records, id);

    if (!writes(saved, place)) continue;
    texts.set(id, canonicalRecordJson(place));
    for (const neighbor of [place.next, place.previous]) {
      if (neighbor !== undefined && !done.has(neighbor)) queue.push(neighbor);
    }
  }
  if (texts.size === 0) return;
  tx.changes.apply(
    DocumentChange.fromJSON({
      records: { [GONE]: Object.fromEntries(texts) },
      version: 3,
    })
  );
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
  const session = sessions.get(getEditorRuntimeOwner(editor));
  const recent = session?.recent ?? [];

  writeGone(
    tx,
    [block],
    (id) =>
      current?.get(id) ??
      session?.kept.get(id)?.place ??
      recent.findLast((run) => run.departed.has(id))?.departed.get(id),
    (saved) => saved === undefined
  );
};
