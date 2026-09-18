import { freezeOwnedJsonValue } from '../core/clone';
import { snapshotEditorJsonValue } from '../core/value-codec';
import {
  readRecord,
  recordAtOrBefore,
  records,
  recordTreeFromSortedOwnedEntries,
  removeRecord,
  writeRecord,
  type RecordTree,
} from './record-tree';

export type AuthoredPosition = Readonly<{
  left: Readonly<{ offset: number; origin: string }> | null;
  right: Readonly<{ offset: number; origin: string }> | null;
}>;

export const decodeAuthoredPosition = (input: unknown): AuthoredPosition => {
  const record = (
    value: unknown,
    keys: readonly string[]
  ): Record<string, unknown> => {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      Object.keys(value).length !== keys.length ||
      Object.keys(value).some((key) => !keys.includes(key))
    ) {
      throw new Error('Invalid authored position.');
    }
    return value as Record<string, unknown>;
  };
  const data = record(input, ['left', 'right']);
  const endpoint = (value: unknown) => {
    if (value === null) return null;
    const point = record(value, ['offset', 'origin']);
    if (
      typeof point.offset !== 'number' ||
      !Number.isSafeInteger(point.offset) ||
      point.offset < 0 ||
      typeof point.origin !== 'string' ||
      !point.origin ||
      point.origin.includes('\u0000')
    ) {
      throw new Error('Invalid authored position endpoint.');
    }
    return { offset: point.offset, origin: point.origin };
  };
  return { left: endpoint(data.left), right: endpoint(data.right) };
};

export type AuthoredSpan = Readonly<{
  birth: string | null;
  length: number;
  offset: number;
  origin: string;
  placement: string | null;
  properties: Readonly<Record<string, string>>;
}>;

type PositionNode = Readonly<{
  height: number;
  id: string;
  left: PositionNode | null;
  length: number;
  right: PositionNode | null;
  span: AuthoredSpan;
}>;

type PositionLocator = Readonly<{ node: PositionNode; parent: string | null }>;

export type AuthoredPositions = Readonly<{
  deleted: RecordTree<
    RecordTree<Readonly<{ length: number; position: AuthoredPosition }>>
  > | null;
  nodes: RecordTree<PositionLocator> | null;
  origins: RecordTree<RecordTree<string>> | null;
  root: PositionNode | null;
}>;

let nextNodeId = 0;
const offsetKey = (offset: number) => String(offset).padStart(16, '0');

const node = (
  span: AuthoredSpan,
  left: PositionNode | null,
  right: PositionNode | null,
  id = String((nextNodeId += 1))
) =>
  freezeOwnedJsonValue({
    height: 1 + Math.max(left?.height ?? 0, right?.height ?? 0),
    id,
    left,
    length: (left?.length ?? 0) + span.length + (right?.length ?? 0),
    right,
    span,
  });

const balance = (
  span: AuthoredSpan,
  left: PositionNode | null,
  right: PositionNode | null,
  id: string
): PositionNode => {
  if (left && left.height > (right?.height ?? 0) + 1) {
    if (left.right && left.right.height > (left.left?.height ?? 0)) {
      const pivot = left.right;
      return node(
        pivot.span,
        node(left.span, left.left, pivot.left, left.id),
        node(span, pivot.right, right, id),
        pivot.id
      );
    }
    return node(
      left.span,
      left.left,
      node(span, left.right, right, id),
      left.id
    );
  }
  if (right && right.height > (left?.height ?? 0) + 1) {
    if (right.left && right.left.height > (right.right?.height ?? 0)) {
      const pivot = right.left;
      return node(
        pivot.span,
        node(span, left, pivot.left, id),
        node(right.span, pivot.right, right.right, right.id),
        pivot.id
      );
    }
    return node(
      right.span,
      node(span, left, right.left, id),
      right.right,
      right.id
    );
  }
  return node(span, left, right, id);
};

const join = (
  left: PositionNode | null,
  middle: PositionNode,
  right: PositionNode | null
): PositionNode => {
  if (left && left.height > (right?.height ?? 0) + 1) {
    return balance(
      left.span,
      left.left,
      join(left.right, middle, right),
      left.id
    );
  }
  if (right && right.height > (left?.height ?? 0) + 1) {
    return balance(
      right.span,
      join(left, middle, right.left),
      right.right,
      right.id
    );
  }
  return node(middle.span, left, right, middle.id);
};

const takeFirst = (
  root: PositionNode
): readonly [PositionNode, PositionNode | null] => {
  if (!root.left) return [root, root.right];
  const [first, left] = takeFirst(root.left);
  return [first, balance(root.span, left, root.right, root.id)];
};

const merge = (
  left: PositionNode | null,
  right: PositionNode | null
): PositionNode | null => {
  if (!left) return right;
  if (!right) return left;
  const [first, rest] = takeFirst(right);
  return join(left, first, rest);
};

const split = (
  root: PositionNode | null,
  position: number
): readonly [PositionNode | null, PositionNode | null] => {
  if (!root) return [null, null];
  const start = root.left?.length ?? 0;
  const end = start + root.span.length;
  if (position < start) {
    const [left, middle] = split(root.left, position);
    return [left, join(middle, root, root.right)];
  }
  if (position > end) {
    const [middle, right] = split(root.right, position - end);
    return [join(root.left, root, middle), right];
  }
  if (position === start) return [root.left, join(null, root, root.right)];
  if (position === end) return [join(root.left, root, null), root.right];
  const length = position - start;
  const left = node({ ...root.span, length }, null, null, root.id);
  const right = node(
    {
      ...root.span,
      length: root.span.length - length,
      offset: root.span.offset + length,
    },
    null,
    null
  );
  return [join(root.left, left, null), join(null, right, root.right)];
};

function* nodes(root: PositionNode | null): Generator<PositionNode> {
  if (!root) return;
  yield* nodes(root.left);
  yield root;
  yield* nodes(root.right);
}

const publishPositions = (
  previous: AuthoredPositions,
  root: PositionNode | null,
  removed: PositionNode | null
): AuthoredPositions => {
  let nextNodes = previous.nodes;
  let { origins } = previous;
  const forgetOrigin = (span: AuthoredSpan) => {
    const entries = removeRecord(
      readRecord(origins, span.origin),
      offsetKey(span.offset)
    );
    origins = entries
      ? writeRecord(origins, span.origin, entries)
      : removeRecord(origins, span.origin);
  };
  for (const removedNode of nodes(removed)) {
    const old = readRecord(previous.nodes, removedNode.id);
    if (old && old.node.span.offset === removedNode.span.offset) {
      forgetOrigin(old.node.span);
      nextNodes = removeRecord(nextNodes, removedNode.id);
    }
  }
  const collect = (current: PositionNode | null, parent: string | null) => {
    if (!current) return;
    const old = readRecord(previous.nodes, current.id);
    if (old?.node === current && old.parent === parent) return;
    nextNodes = writeRecord(
      nextNodes,
      current.id,
      snapshotEditorJsonValue(
        { node: current, parent },
        'Authored position locator'
      )
    );
    if (
      !old ||
      old.node.span !== current.span ||
      !readRecord(origins, current.span.origin)
    ) {
      if (
        old &&
        (old.node.span.origin !== current.span.origin ||
          old.node.span.offset !== current.span.offset)
      ) {
        forgetOrigin(old.node.span);
      }
      origins = writeRecord(
        origins,
        current.span.origin,
        writeRecord(
          readRecord(origins, current.span.origin),
          offsetKey(current.span.offset),
          current.id
        )
      );
    }
    if (old?.node === current) return;
    collect(current.left, current.id);
    collect(current.right, current.id);
  };
  collect(root, null);
  return snapshotEditorJsonValue(
    { deleted: previous.deleted, nodes: nextNodes, origins, root },
    'Authored positions'
  );
};

export const createAuthoredPositions = (
  length: number,
  origin: string
): AuthoredPositions => {
  const root = length
    ? node(
        {
          birth: null,
          length,
          offset: 0,
          origin,
          placement: null,
          properties: {},
        },
        null,
        null
      )
    : null;
  return publishPositions(
    { deleted: null, nodes: null, origins: null, root: null },
    root,
    null
  );
};

export const replaceAuthoredPositions = (
  index: AuthoredPositions,
  from: number,
  to: number,
  spans: readonly AuthoredSpan[]
): AuthoredPositions => {
  if (
    !Number.isSafeInteger(from) ||
    !Number.isSafeInteger(to) ||
    from < 0 ||
    to < from ||
    to > (index.root?.length ?? 0) ||
    spans.some((span) => !Number.isSafeInteger(span.length) || span.length < 1)
  ) {
    throw new Error('Invalid authored position edit.');
  }
  const [left, tail] = split(index.root, from);
  const [removed, right] = split(tail, to - from);
  let { deleted } = index;
  if (removed) {
    const position = {
      left: authoredPositionAt(index, from).left,
      right: authoredPositionAt(index, to).right,
    };
    for (const { span } of nodes(removed)) {
      deleted = writeRecord(
        deleted,
        span.origin,
        writeRecord(
          readRecord(deleted, span.origin),
          offsetKey(span.offset),
          snapshotEditorJsonValue(
            { length: span.length, position },
            'Removed authored position'
          )
        )
      );
    }
  }
  let middle: PositionNode | null = null;
  for (const span of spans) middle = merge(middle, node(span, null, null));
  return publishPositions(
    { ...index, deleted },
    merge(merge(left, middle), right),
    removed
  );
};

export const authoredPositionsFromSpans = (
  spans: readonly AuthoredSpan[],
  deleted: AuthoredPositions['deleted'] = null
): AuthoredPositions => {
  let total = 0;
  for (const span of spans) {
    if (!Number.isSafeInteger(span.length) || span.length < 1) {
      throw new Error('Invalid authored position edit.');
    }
    total += span.length;
    if (!Number.isSafeInteger(total)) {
      throw new Error('Invalid authored position length.');
    }
  }
  const build = (from: number, to: number): PositionNode | null => {
    if (from === to) return null;
    const middle = Math.floor((from + to) / 2);
    return node(spans[middle], build(from, middle), build(middle + 1, to));
  };
  const root = build(0, spans.length);
  const locators: Array<readonly [string, PositionLocator]> = [];
  const byOrigin = new Map<string, PositionNode[]>();
  const collect = (current: PositionNode | null, parent: string | null) => {
    if (!current) return;
    locators.push([
      current.id,
      freezeOwnedJsonValue({ node: current, parent }),
    ]);
    const fragments = byOrigin.get(current.span.origin) ?? [];
    fragments.push(current);
    byOrigin.set(current.span.origin, fragments);
    collect(current.left, current.id);
    collect(current.right, current.id);
  };
  collect(root, null);
  const origins: Array<readonly [string, RecordTree<string>]> = [];
  for (const [origin, fragments] of byOrigin) {
    fragments.sort((left, right) => left.span.offset - right.span.offset);
    for (let i = 1; i < fragments.length; i++) {
      const previous = fragments[i - 1].span;
      if (previous.offset + previous.length > fragments[i].span.offset) {
        throw new Error('Overlapping authored position origins.');
      }
    }
    const entries = recordTreeFromSortedOwnedEntries(
      fragments.map((fragment) => [
        offsetKey(fragment.span.offset),
        fragment.id,
      ])
    );
    if (entries) origins.push([origin, entries]);
  }
  const byKey = (
    left: readonly [string, unknown],
    right: readonly [string, unknown]
  ) => (left[0] < right[0] ? -1 : left[0] > right[0] ? 1 : 0);
  return freezeOwnedJsonValue({
    deleted,
    nodes: recordTreeFromSortedOwnedEntries(locators.sort(byKey)),
    origins: recordTreeFromSortedOwnedEntries(origins.sort(byKey)),
    root,
  });
};

export const insertAuthoredPositionBatch = (
  index: AuthoredPositions,
  insertions: ReadonlyArray<
    Readonly<{
      at: number;
      spans: readonly AuthoredSpan[];
    }>
  >
): AuthoredPositions => {
  if (!insertions.length) return index;
  const length = index.root?.length ?? 0;
  let previousAt = -1;
  let total = length;
  for (const insertion of insertions) {
    if (
      !Number.isSafeInteger(insertion.at) ||
      insertion.at <= previousAt ||
      insertion.at > length
    ) {
      throw new Error('Invalid authored position insertion order.');
    }
    previousAt = insertion.at;
    for (const span of insertion.spans) {
      if (!Number.isSafeInteger(span.length) || span.length < 1) {
        throw new Error('Invalid authored position edit.');
      }
      total += span.length;
      if (!Number.isSafeInteger(total)) {
        throw new Error('Invalid authored position length.');
      }
    }
  }
  // Sparse edits should retain sharing with an already fragmented index.
  if (insertions.length < (index.nodes?.count ?? 0)) {
    let next = index;
    for (const insertion of insertions.toReversed()) {
      next = replaceAuthoredPositions(
        next,
        insertion.at,
        insertion.at,
        insertion.spans
      );
    }
    return next;
  }
  const spans: AuthoredSpan[] = [];
  let insertionIndex = 0;
  for (const entry of authoredPositionSpans(index)) {
    let { from } = entry;
    const append = (to: number) => {
      if (to > from) {
        spans.push(
          from === entry.from && to === entry.to
            ? entry.span
            : {
                ...entry.span,
                length: to - from,
                offset: entry.span.offset + from - entry.from,
              }
        );
      }
      from = to;
    };
    while (
      insertionIndex < insertions.length &&
      insertions[insertionIndex].at <= entry.to
    ) {
      const insertion = insertions[insertionIndex];
      insertionIndex += 1;
      append(insertion.at);
      spans.push(...insertion.spans);
    }
    append(entry.to);
  }
  // A zero-length baseline has no spans to visit.
  for (; insertionIndex < insertions.length; insertionIndex++) {
    spans.push(...insertions[insertionIndex].spans);
  }
  return authoredPositionsFromSpans(spans, index.deleted);
};

export function* authoredPositionSpans(
  index: AuthoredPositions,
  from = 0,
  to = index.root?.length ?? 0
): Generator<Readonly<{ from: number; span: AuthoredSpan; to: number }>> {
  if (from >= to) return;
  function* visit(
    current: PositionNode | null,
    offset: number
  ): Generator<Readonly<{ from: number; span: AuthoredSpan; to: number }>> {
    if (!current || offset >= to || offset + current.length <= from) return;
    const start = offset + (current.left?.length ?? 0);
    yield* visit(current.left, offset);
    if (start < to && start + current.span.length > from) {
      yield {
        from: start,
        span: current.span,
        to: start + current.span.length,
      };
    }
    yield* visit(current.right, start + current.span.length);
  }
  yield* visit(index.root, 0);
}

type AuthoredLivePosting = Readonly<{
  from: number;
  span: AuthoredSpan;
  to: number;
}>;
const AUTHORED_LIVE_POSTINGS = new WeakMap<
  AuthoredPositions,
  ReadonlyMap<string, readonly AuthoredLivePosting[]>
>();
const AUTHORED_CONTENT_BOUNDS = new WeakMap<
  AuthoredPositions,
  WeakMap<object, readonly [number, number] | null>
>();

const authoredLivePostings = (index: AuthoredPositions) => {
  const cached = AUTHORED_LIVE_POSTINGS.get(index);
  if (cached) return cached;
  const postings = new Map<string, AuthoredLivePosting[]>();
  for (const posting of authoredPositionSpans(index)) {
    const origin = postings.get(posting.span.origin) ?? [];
    origin.push(posting);
    postings.set(posting.span.origin, origin);
  }
  const result = new Map(
    [...postings].map(([origin, entries]) => [
      origin,
      Object.freeze(
        entries.sort((left, right) => left.span.offset - right.span.offset)
      ),
    ])
  );
  AUTHORED_LIVE_POSTINGS.set(index, result);
  return result;
};

/** Finds the live envelope of a retained authored-content lineage. */
export const authoredPositionContentBounds = (
  index: AuthoredPositions,
  content: ReadonlyMap<
    string,
    ReadonlyArray<Readonly<{ from: number; to: number }>>
  >
): readonly [number, number] | null => {
  let cache = AUTHORED_CONTENT_BOUNDS.get(index);
  if (!cache) {
    cache = new WeakMap();
    AUTHORED_CONTENT_BOUNDS.set(index, cache);
  }
  if (cache.has(content)) return cache.get(content) ?? null;

  const postings = authoredLivePostings(index);
  let from = Number.POSITIVE_INFINITY;
  let to = Number.NEGATIVE_INFINITY;
  for (const [origin, intervals] of content) {
    for (const posting of postings.get(origin) ?? []) {
      const spanFrom = posting.span.offset;
      const spanTo = spanFrom + posting.span.length;
      for (const interval of intervals) {
        if (interval.from >= spanTo || spanFrom >= interval.to) continue;
        from = Math.min(
          from,
          posting.from + Math.max(interval.from, spanFrom) - spanFrom
        );
        to = Math.max(
          to,
          posting.from + Math.min(interval.to, spanTo) - spanFrom
        );
      }
    }
  }
  const result = from < to ? ([from, to] as const) : null;
  cache.set(content, result);
  return result;
};

export const authoredPositionAt = (
  index: AuthoredPositions,
  position: number
): AuthoredPosition => {
  const length = index.root?.length ?? 0;
  if (!Number.isSafeInteger(position) || position < 0 || position > length) {
    throw new Error('Invalid authored position.');
  }
  const left = position
    ? [...authoredPositionSpans(index, position - 1, position)][0]
    : null;
  const right =
    position < length
      ? [...authoredPositionSpans(index, position, position + 1)][0]
      : null;
  return snapshotEditorJsonValue(
    {
      left: left
        ? {
            offset: left.span.offset + position - left.from,
            origin: left.span.origin,
          }
        : null,
      right: right
        ? {
            offset: right.span.offset + position - right.from,
            origin: right.span.origin,
          }
        : null,
    },
    'Authored position'
  );
};

const resolveEndpoint = (
  index: AuthoredPositions,
  endpoint: NonNullable<AuthoredPosition['left']>,
  side: 'left' | 'right'
): number | null => {
  const fragments = readRecord(index.origins, endpoint.origin);
  const entry = recordAtOrBefore(
    fragments,
    offsetKey(side === 'left' ? endpoint.offset - 1 : endpoint.offset)
  );
  const locator = entry ? readRecord(index.nodes, entry[1]) : null;
  if (
    !locator ||
    endpoint.offset < locator.node.span.offset ||
    endpoint.offset > locator.node.span.offset + locator.node.span.length
  ) {
    return null;
  }
  let position =
    (locator.node.left?.length ?? 0) +
    endpoint.offset -
    locator.node.span.offset;
  let current = locator;
  while (current.parent) {
    const parent = readRecord(index.nodes, current.parent);
    if (!parent) throw new Error('Missing authored position parent.');
    if (parent.node.right?.id === current.node.id) {
      position += (parent.node.left?.length ?? 0) + parent.node.span.length;
    } else if (parent.node.left?.id !== current.node.id) {
      throw new Error('Invalid authored position parent.');
    }
    current = parent;
  }
  return current.node.id === index.root?.id ? position : null;
};

export const resolveAuthoredPosition = (
  index: AuthoredPositions,
  position: AuthoredPosition,
  association: 'left' | 'right' = 'right',
  deletion: 'collapse' | 'detach' = 'detach'
): number | null => {
  const order =
    association === 'right'
      ? (['right', 'left'] as const)
      : (['left', 'right'] as const);
  const visited = new Set<AuthoredPosition>();
  const resolve = (target: AuthoredPosition): number | null => {
    if (visited.has(target)) return null;
    visited.add(target);
    if (!target.left && !target.right) return index.root ? null : 0;
    for (const side of order) {
      const endpoint = target[side];
      if (endpoint) {
        const resolved = resolveEndpoint(index, endpoint, side);
        if (resolved !== null) return resolved;
      }
    }
    if (deletion === 'collapse') {
      for (const side of order) {
        const endpoint = target[side];
        if (!endpoint) continue;
        const offset = endpoint.offset - (side === 'left' ? 1 : 0);
        const removed = recordAtOrBefore(
          readRecord(index.deleted, endpoint.origin),
          offsetKey(offset)
        );
        if (!removed || Number(removed[0]) + removed[1].length <= offset) {
          continue;
        }
        const resolved = resolve(removed[1].position);
        if (resolved !== null) return resolved;
      }
    }
    return null;
  };
  return resolve(position);
};

export const authoredOriginSpans = (
  index: AuthoredPositions,
  origin: string,
  range?: Readonly<{ from: number; to: number }>
) => {
  const tree = readRecord(index.origins, origin);
  function* matching() {
    if (!range) {
      yield* records(tree);
      return;
    }
    if (range.to <= range.from) return;
    const first = recordAtOrBefore(tree, offsetKey(range.from));
    if (first) yield first;
    for (const entry of records(tree, {
      after: first?.[0] ?? offsetKey(range.from),
    })) {
      if (Number(entry[0]) >= range.to) break;
      yield entry;
    }
  }
  return [...matching()].flatMap(([, id]) => {
    const locator = readRecord(index.nodes, id);
    if (!locator) throw new Error('Missing authored position fragment.');
    if (
      range &&
      locator.node.span.offset + locator.node.span.length <= range.from
    ) {
      return [];
    }
    const from = resolveEndpoint(
      index,
      { origin, offset: locator.node.span.offset },
      'right'
    );
    if (from === null) throw new Error('Detached authored position fragment.');
    return [
      {
        from,
        span: locator.node.span,
        to: from + locator.node.span.length,
      },
    ];
  });
};
