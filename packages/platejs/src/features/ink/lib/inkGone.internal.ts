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
  getRecordSetVersion,
  type Node,
  type Path,
  readRecord,
  type RecordSetVersion,
  readShownRecords,
  recordSetChanges,
  type RuntimeAnyEditor,
} from '../../../facade';

export type InkGone = Readonly<{ next?: string; previous?: string }>;

export const COPIES = 'ink-copies';

export const GONE = 'ink-gone';

export const MARKS = 'ink-marks';

type GoneTx = Readonly<{
  changes: Readonly<{ apply: (change: DocumentChange) => void }>;
  unique: Readonly<{
    holder: (field: 'id', id: string) => EditorUniqueHolder | null;
  }>;
}>;

const ADD_LOOKBACK_UPDATES = 4;

type Departure = readonly [after: EditorDocumentValue, gap: Path];

type GoneSession = {
  departed: Map<string, Departure>;
  holdCounts: Map<string, number>;
  kept: Map<string, Readonly<{ order: number; place: InkGone }>>;
  pending: Map<string, InkGone>;
  queued: Map<string, Set<string>>;
  recent: Array<
    Readonly<{ departed: ReadonlyMap<string, Departure>; order: number }>
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
      pending: new Map(),
      queued: new Map(),
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
  departed: ReadonlyMap<string, Departure>,
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
        kept.set(id, { order, place: gapPlace(...place) });
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

const goneOf = (record: Readonly<Record<string, unknown>> | undefined) =>
  record && {
    ...(typeof record.next === 'string' ? { next: record.next } : {}),
    ...(typeof record.previous === 'string'
      ? { previous: record.previous }
      : {}),
  };

export const goneIn = (version: RecordSetVersion, id: string) =>
  goneOf(readRecord(version, id));

const NAMING_FIELDS = [
  [COPIES, ['block']],
  [GONE, ['id', 'next', 'previous']],
] as const;

type NamedBlocks = {
  names: Map<`${'block' | 'id' | Side} ${string}`, Set<string>>;
  versions: Map<string, RecordSetVersion>;
};

const namedBlocks = new WeakMap<object, NamedBlocks>();

export const namedInkBlocks = (editor: RuntimeAnyEditor) => {
  const owner = getEditorRuntimeOwner(editor);
  const store = readShownRecords(editor);
  let named = namedBlocks.get(owner);

  if (!named) {
    named = { names: new Map(), versions: new Map() };
    namedBlocks.set(owner, named);
  }

  const { names, versions } = named;

  for (const [set, fields] of NAMING_FIELDS) {
    const before = versions.get(set) ?? null;
    const after = getRecordSetVersion(store, set);

    for (const id of recordSetChanges(before, after)) {
      for (const [version, step] of [
        [before, -1],
        [after, 1],
      ] as const) {
        const record = readRecord(version, id);

        for (const field of fields) {
          const block = field === 'id' && record ? id : record?.[field];

          if (typeof block !== 'string') continue;

          const key = `${field} ${block}` as const;
          const ids = names.get(key) ?? new Set();

          if (step > 0) names.set(key, ids.add(id));
          else if (ids.delete(id) && ids.size === 0) names.delete(key);
        }
      }
    }
    versions.set(set, after);
  }

  return names;
};

const sameGone = (a: InkGone | undefined, b: InkGone) =>
  a !== undefined && a.next === b.next && a.previous === b.previous;

export const idOf = (node: Node | null) =>
  ElementApi.isElement(node) && typeof node.id === 'string'
    ? node.id
    : undefined;

const metrics = { besides: 0, chains: 0, hops: 0, reads: 0 };

export const getInkGoneMetrics = () => Object.freeze({ ...metrics });

export const besideAt = (
  document: EditorDocumentValue,
  gap: Path,
  step: -1 | 1,
  skips?: (path: Path) => boolean
) => {
  metrics.besides += 1;

  const parent = gap.slice(0, -1);
  let [index] = gap.slice(-1);

  if (step === -1) index -= 1;
  while (true) {
    const path = [...parent, index];
    const node = index >= 0 ? getDocumentValueNode(document, path) : null;

    if (node) {
      const id = idOf(node);

      if (id && !skips?.(path)) return { id, path };
      index += step;
    } else if (parent.length > 0) {
      const [up] = parent.splice(-1);

      index = up + step;
    } else {
      return undefined;
    }
  }
};

const beside = (document: EditorDocumentValue, gap: Path, step: -1 | 1) =>
  besideAt(document, gap, step)?.id;

const goneFrom = (previous: string | undefined, next: string | undefined) => ({
  ...(next ? { next } : {}),
  ...(previous ? { previous } : {}),
});

const gapPlace = (after: EditorDocumentValue, gap: Path) =>
  goneFrom(beside(after, gap, -1), beside(after, gap, 1));

export const blockAbove = (document: EditorDocumentValue, gap: Path) =>
  beside(document, gap, -1);

type Side = 'next' | 'previous';

export type GoneMemo = Readonly<Record<Side, ReadonlyMap<string, string>>>;

export type GoneMemoWriter = Readonly<
  Record<Side, Map<string, string>> & { walked: Set<string> }
>;

export type GoneWalk<H> = Readonly<{
  holder: (id: string) => H | undefined;
  record: (id: string) => InkGone | undefined;
}>;

export const reachGone = <H>(
  walk: GoneWalk<H>,
  from: string,
  side: Side,
  memo: GoneMemo | GoneMemoWriter | undefined,
  count: { chains: number; hops: number }
) => {
  const seen = new Set([from]);
  let last = from;
  let found: Readonly<{ holder: H; id: string; side: Side }> | undefined;

  count.chains += 1;
  while (true) {
    const to = memo?.[side].get(last);

    if (to !== undefined && !seen.has(to)) {
      last = to;
      seen.add(to);
    }

    const at = walk.record(last)?.[side];

    if (at === undefined || seen.has(at)) break;
    count.hops += 1;

    const holder = walk.holder(at);

    if (holder !== undefined) {
      found = { holder, id: at, side };
      break;
    }
    if (!walk.record(at)) break;
    last = at;
    seen.add(at);
  }
  if (memo && 'walked' in memo) {
    for (const block of seen) {
      memo.walked.add(block);
      if (block !== last) memo[side].set(block, last);
    }
  }

  return { found, last };
};

export const walkGone = <H>(
  walk: GoneWalk<H>,
  id: string,
  memo: GoneMemo | GoneMemoWriter | undefined,
  count: { chains: number; hops: number }
) => {
  const { found: above, last } = reachGone(walk, id, 'previous', memo, count);
  const next = (from: string) =>
    reachGone(walk, from, 'next', memo, count).found;
  const belowTop = () => next(last);
  const belowBlock = () => (last === id ? undefined : next(id));

  return { found: above ?? belowTop() ?? belowBlock(), last };
};

const currentSession = (editor: RuntimeAnyEditor) => {
  const session = sessions.get(getEditorRuntimeOwner(editor));

  return session?.update?.deref() === getActiveEditorUpdateId(editor)
    ? session
    : undefined;
};

export const captureGone = (
  editor: RuntimeAnyEditor,
  tx: GoneTx & Readonly<{ tags: Readonly<{ has: (tag: string) => boolean }> }>,
  after: EditorDocumentValue,
  [gap, id]: readonly [Path, string],
  memo: GoneMemo | undefined
) => {
  const update = getActiveEditorUpdateId(editor);

  if (!update) return;

  const session = sessionOf(getEditorRuntimeOwner(editor));

  if (session.update?.deref() !== update) {
    const departed = new Map<string, Departure>();
    session.runs += 1;
    const order = session.runs;
    const { recent } = session;

    session.update = new WeakRef(update);
    session.departed = departed;
    session.pending = new Map();
    session.queued = new Map();
    afterActiveTransactionEnds(
      editor,
      () => {
        const at = recent.findIndex((run) => run.order > order);

        recent.splice(at === -1 ? recent.length : at, 0, { departed, order });
        if (recent.length > ADD_LOOKBACK_UPDATES) recent.shift();
        keepHeldChains(session, departed, order);
      },
      { beforeListeners: true }
    );
  }

  session.departed.set(id, [after, gap]);
  if (tx.tags.has('collaboration')) return;

  const names = namedInkBlocks(editor);
  const { pending, queued } = session;
  const walk = {
    holder: (block: string) => tx.unique.holder('id', block) ?? undefined,
    record: (block: string) => pending.get(block) ?? savedGone(editor, block),
  };
  const gone = (block: string) => !walk.holder(block);
  const named = (side: Side) =>
    [
      ...new Set(
        [names, queued].flatMap((map) => [...(map.get(`${side} ${id}`) ?? [])])
      ),
    ].filter(
      (block) =>
        gone(block) &&
        (!pending.has(block) || pending.get(block)?.[side] === id)
    );
  const asNext = named('next');
  const namers = named('previous');
  const copied = names.has(`block ${id}`) || session.holdCounts.has(id);
  const watched = copied || names.has(`id ${id}`) || pending.has(id);

  if (!watched && asNext.length + namers.length === 0) return;

  const place = gapPlace(after, gap);
  const atGap = (block: string) => {
    const { found } = walkGone(walk, block, memo, metrics);

    return found
      ? found.id === place[found.side]
      : place.previous === undefined && place.next === undefined;
  };
  const saved = walk.record(id);
  const was = saved?.previous;
  const right = watched
    ? was !== undefined &&
      (was === place.previous ||
        (gone(was) && walk.record(was) !== undefined && atGap(was))) &&
      (asNext.length === 0 ||
        saved?.next === place.next ||
        reachGone(walk, id, 'next', memo, metrics).found?.id === place.next)
    : [...asNext, ...namers].every(atGap);

  if (right) return;
  pending.set(id, place);
  for (const key of Object.entries(place).map((pair) => pair.join(' '))) {
    queued.set(key, (queued.get(key) ?? new Set()).add(id));
  }
};

export const hasPendingGone = (editor: RuntimeAnyEditor) =>
  !!currentSession(editor)?.pending.size;

const savedGone = (editor: RuntimeAnyEditor, id: string) => {
  metrics.reads += 1;

  return goneIn(getRecordSetVersion(readShownRecords(editor), GONE), id);
};

const writeGone = (
  editor: RuntimeAnyEditor,
  tx: GoneTx,
  ids: Iterable<string>,
  placeOf: (id: string) => InkGone | undefined,
  writes: (saved: InkGone | undefined, place: InkGone) => boolean
) => {
  const queue = [...ids];
  const done = new Set<string>();
  const texts = new Map<string, string>();

  for (const id of queue) {
    if (done.has(id)) continue;
    done.add(id);

    const place = placeOf(id);

    if (!place) continue;
    if (!writes(savedGone(editor, id), place)) continue;
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

export const flushGone = (editor: RuntimeAnyEditor, tx: GoneTx) => {
  const session = currentSession(editor);

  if (!session) return;

  const { pending } = session;

  session.pending = new Map();
  writeGone(
    editor,
    tx,
    pending.keys(),
    (id) => (tx.unique.holder('id', id) ? undefined : pending.get(id)),
    (saved, place) => !sameGone(saved, place)
  );
};

export const addGone = (
  editor: RuntimeAnyEditor,
  tx: GoneTx & Readonly<{ value: () => EditorDocumentValue }>,
  copies: ReadonlyArray<Readonly<{ record: Readonly<{ block: string }> }>>
) => {
  const blocks = copies.map(({ record }) => record.block);
  const current = currentSession(editor)?.departed;
  const session = sessions.get(getEditorRuntimeOwner(editor));
  const recent = session?.recent ?? [];
  const standing = new Map<string, InkGone>();
  const stand = (id: string) => {
    const holder = tx.unique.holder('id', id);

    if (holder?.root !== 'main' || standing.has(id)) return;

    const { path } = holder;
    const value = tx.value();
    const past = [...path.slice(0, -1), (path.at(-1) ?? 0) + 1];

    standing.set(id, goneFrom(beside(value, path, -1), beside(value, past, 1)));
  };

  for (const block of blocks) {
    stand(block);
    for (const side of Object.values(standing.get(block) ?? {})) stand(side);
  }
  writeGone(
    editor,
    tx,
    standing.keys(),
    (id) => standing.get(id),
    (saved, place) => !sameGone(saved, place)
  );
  writeGone(
    editor,
    tx,
    blocks,
    (id) => {
      if (tx.unique.holder('id', id)) return undefined;

      const departure =
        current?.get(id) ??
        (session?.kept.has(id)
          ? undefined
          : recent.findLast((run) => run.departed.has(id))?.departed.get(id));

      return departure ? gapPlace(...departure) : session?.kept.get(id)?.place;
    },
    (saved) => saved === undefined
  );
};
