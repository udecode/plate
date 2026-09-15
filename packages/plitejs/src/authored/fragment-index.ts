import type { NativeAuthoredFragmentSlot } from '../core/authored-runtime';
import { DocumentIndex } from '../core/change/document-index';
import { getEditorProjectionSnapshotIndex } from '../core/public-state';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type { AnyEditor as Editor, NodeKey, Value } from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import type { Path } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { getDefined } from '../internal/get-defined';
import type { AuthoredRangeProjection } from './anchors';
import {
  orderAuthoredFragments,
  type AuthoredFragmentOrder,
} from './fragment-order';
import {
  authoredIntervalsFrom,
  matchingAuthoredIntervals,
  removeAuthoredInterval,
  writeAuthoredInterval,
  type AuthoredInterval,
  type AuthoredIntervals,
} from './intervals';
import {
  readAuthoredFragmentOrder,
  readAuthoredFragmentBounds,
  readAuthoredFragmentProjection,
  readAuthoredMarkupFragments,
} from './markup';
import { authoredPositionSpans, type AuthoredPosition } from './positions';
import { readAuthoredChange } from './read';
import {
  readRecord,
  recordTreeFromSortedEntries,
  records,
  removeRecord,
  writeRecord,
  type RecordTree,
} from './record-tree';
import { readAuthoredFragmentRenderScopes } from './render';
import { readAuthoredRetainedContent } from './retained';
import {
  matchingAuthoredChanges,
  authoredContributionSteps,
  retainedAuthoredOperations,
  type AuthoredContribution,
  type AuthoredOperation,
  type AuthoredState,
} from './state';
import { authoredRootNodes } from './steps';

type Watch = Readonly<{
  interval: AuthoredInterval<string>;
  origin: string;
}>;
type Binding = Readonly<{
  bucket: string;
  order: AuthoredFragmentOrder | null;
  root: string;
  slot: NativeAuthoredFragmentSlot;
}>;
type IndexedChange = Readonly<{
  boundaries: readonly string[];
  bindings: readonly Binding[];
  locations: readonly string[];
  nodeKeys: readonly NodeKey[];
  relations: readonly string[];
  roots: readonly string[];
  watches: readonly Watch[];
}>;

export type AuthoredFragmentIndex = Readonly<{
  boundaries: RecordTree<RecordTree<true>> | null;
  buckets: RecordTree<
    Readonly<{
      bindings: readonly Binding[];
      slots: readonly NativeAuthoredFragmentSlot[];
    }>
  > | null;
  changes: RecordTree<IndexedChange> | null;
  locations: RecordTree<RecordTree<true>> | null;
  origins: RecordTree<NonNullable<AuthoredIntervals<string>>> | null;
  relations: RecordTree<RecordTree<true>> | null;
  roots: RecordTree<RecordTree<true>> | null;
}>;

export const authoredFragmentBucket = (root: string, nodeKey?: NodeKey) =>
  JSON.stringify(nodeKey ? ['node', root, nodeKey] : ['root', root]);

const compareKeys = (left: string, right: string) =>
  left < right ? -1 : left > right ? 1 : 0;

const indexChange = (
  editor: Editor,
  changeId: string,
  accepted: AuthoredRangeProjection,
  proposed: AuthoredRangeProjection
): IndexedChange | null => {
  const change = readRecord(proposed.state.changes, changeId);
  if (
    !change ||
    (change.status !== 'pending' && change.status !== 'conflicted')
  ) {
    return null;
  }
  const watches: Watch[] = [];
  const watched = new Set<string>();
  const boundaries = new Set<string>();
  const roots = new Set<string>();
  const relations = new Set<string>();
  const watch = (
    origin: string,
    from: number,
    to: number,
    insertion: boolean
  ) => {
    const key = JSON.stringify([origin, from, to, insertion]);
    if (watched.has(key)) return;
    watched.add(key);
    watches.push({
      interval: {
        value: changeId,
        from,
        id: JSON.stringify([changeId, watches.length]),
        insertion,
        to,
      },
      origin,
    });
  };
  const position = (value: AuthoredPosition) => {
    for (const endpoint of [value.left, value.right]) {
      if (endpoint) {
        watch(endpoint.origin, endpoint.offset, endpoint.offset, true);
      }
    }
  };
  for (const [, operationId] of records(change.operations)) {
    const operation = readRecord(proposed.state.operations, operationId);
    if (!operation || operation.kind !== 'edit') continue;
    for (const step of authoredContributionSteps(operation)) {
      for (const target of step.rootTargets) roots.add(target.root);
      for (const target of step.targets) {
        roots.add(target.root);
        for (const endpoint of [
          target.from,
          target.to,
          target.afterFrom,
          target.afterTo,
        ]) {
          position(endpoint);
        }
        for (const span of [...target.inserted, ...target.removed]) {
          watch(span.origin, span.offset, span.offset + span.length, true);
        }
      }
    }
  }
  let hasMarkup = false;
  for (const operation of retainedAuthoredOperations(proposed.state, change)) {
    for (const step of operation.steps) {
      for (const target of step.targets) {
        if (!readAuthoredRetainedContent(target)) continue;
        hasMarkup = true;
        roots.add(target.root);
        if (!target.afterFrom.left && !target.afterFrom.right) {
          boundaries.add(target.root);
        }
        position(target.afterFrom);
        for (const span of target.removed) {
          watch(span.origin, span.offset, span.offset + span.length, true);
          if (span.birth && span.birth !== changeId) relations.add(span.birth);
        }
      }
    }
  }
  const locations = new Set<string>();
  const nodeKeys = new Set<NodeKey>();
  for (const projection of [accepted, proposed]) {
    const indexes = new Map<
      string,
      ReturnType<typeof getEditorProjectionSnapshotIndex>
    >();
    const index = (root: string) => {
      let current = indexes.get(root);
      if (!current) {
        current = getEditorProjectionSnapshotIndex(
          editor,
          authoredRootNodes(projection.value, root) as Value
        );
        indexes.set(root, current);
      }
      return current;
    };
    for (const range of readAuthoredChange(
      change,
      projection.state,
      projection.positions,
      projection.value
    ).ranges) {
      const [start, end] = RangeApi.edges(range);
      const root = start.root ?? 'main';
      if ((end.root ?? 'main') !== root) continue;
      const nodes = authoredRootNodes(projection.value, root) as Value;
      for (const [, path] of NodeApi.texts(
        { children: nodes, type: '' },
        { from: start.path, to: end.path }
      )) {
        const key = index(root).keyAt(path);
        if (key) nodeKeys.add(key);
      }
      const [firstChild = 0] = start.path;
      const [lastChild = firstChild] = end.path;
      for (let child = firstChild; child <= lastChild; child++) {
        const key = index(root).keyAt([child]);
        if (key) locations.add(authoredFragmentBucket(root, key));
      }
    }
  }
  const bindings: Binding[] = [];
  const fragments = hasMarkup
    ? readAuthoredMarkupFragments(changeId, accepted, proposed)
    : [];
  const scopesByRoot = new Map<
    string,
    ReturnType<typeof readAuthoredFragmentRenderScopes>
  >();
  for (const fragment of fragments) {
    const { root, placement } = fragment;
    roots.add(root);
    const local = readAuthoredFragmentProjection(fragment, proposed.state);
    const bounds = readAuthoredFragmentBounds(fragment);
    if (local && bounds) {
      const { positions } = getDefined(readRecord(local.positions, root));
      for (const entry of authoredPositionSpans(
        positions,
        0,
        positions.root?.length ?? 0
      )) {
        const cuts = [
          ...new Set([
            entry.from,
            Math.max(entry.from, Math.min(entry.to, bounds.from)),
            Math.max(entry.from, Math.min(entry.to, bounds.to)),
            entry.to,
          ]),
        ].sort((a, b) => a - b);
        for (let index = 1; index < cuts.length; index++) {
          const from = cuts[index - 1];
          const to = cuts[index];
          watch(
            entry.span.origin,
            entry.span.offset + from - entry.from,
            entry.span.offset + to - entry.from,
            bounds.from <= from && to <= bounds.to
          );
        }
        if (entry.span.birth && entry.span.birth !== changeId) {
          relations.add(entry.span.birth);
        }
      }
    }
    if (!placement) continue;
    const nodes = authoredRootNodes(proposed.value, root) as Value;
    const document = DocumentIndex.fromValue(nodes);
    let path: Path | null;
    let side: NativeAuthoredFragmentSlot['side'];
    if (fragment.kind === 'properties') {
      ({ path } = fragment);
      side = 'properties';
    } else if (placement.kind === 'text') {
      ({ path } = placement.point);
      side = 'text';
    } else {
      const parent = placement.path.length
        ? document.node(placement.path)
        : null;
      const children = parent?.children ?? nodes;
      if (children[placement.index]) {
        path = [...placement.path, placement.index];
        side = 'before';
      } else if (children[placement.index - 1]) {
        path = [...placement.path, placement.index - 1];
        side = 'after';
      } else {
        path = placement.path.length ? placement.path : null;
        side = 'children';
      }
    }
    const key = path
      ? getEditorProjectionSnapshotIndex(editor, nodes).keyAt(path)
      : null;
    if (path && !key) {
      throw new Error('Missing authored fragment docking node.');
    }
    if (path) {
      const start = document.nodeRange(path).from;
      const { positions } = getDefined(readRecord(proposed.positions, root));
      for (const entry of authoredPositionSpans(positions, start, start + 1)) {
        const offset = entry.span.offset + start - entry.from;
        watch(entry.span.origin, offset, offset + 1, false);
      }
    }
    bindings.push({
      bucket: authoredFragmentBucket(root, key ?? undefined),
      order: readAuthoredFragmentOrder(fragment),
      root,
      slot: { changeId, id: fragment.id, side },
    });
    let scopes = scopesByRoot.get(root);
    if (!scopes) {
      scopes = readAuthoredFragmentRenderScopes(
        editor,
        fragments.filter((current) => current.root === root),
        proposed,
        root
      );
      scopesByRoot.set(root, scopes);
    }
    const scope = scopes.get(fragment.id);
    if (scope) {
      const scopeKey = scope.length
        ? getDefined(
            getEditorProjectionSnapshotIndex(editor, nodes).keyAt(scope)
          )
        : undefined;
      bindings.push({
        bucket: authoredFragmentBucket(root, scopeKey),
        order: readAuthoredFragmentOrder(fragment),
        root,
        slot: { changeId, id: fragment.id, side: 'structure' },
      });
    }
  }
  return snapshotEditorJsonValue(
    {
      bindings,
      boundaries: [...boundaries],
      locations: [...locations],
      nodeKeys: [...nodeKeys],
      relations: [...relations],
      roots: [...roots],
      watches,
    },
    'Authored fragment bindings'
  );
};

const replaceChange = (
  index: AuthoredFragmentIndex,
  changeId: string,
  current: IndexedChange | null,
  changed: Set<string>
): AuthoredFragmentIndex => {
  const previous = readRecord(index.changes, changeId);
  if (!previous && !current) return index;
  const next = { ...index };
  for (const { bucket } of previous?.bindings ?? []) {
    const remaining = (readRecord(next.buckets, bucket)?.bindings ?? []).filter(
      ({ slot }) => slot.changeId !== changeId
    );
    next.buckets = remaining.length
      ? writeRecord(next.buckets, bucket, {
          bindings: remaining,
          slots: remaining.map(({ slot }) => slot),
        })
      : removeRecord(next.buckets, bucket);
    changed.add(bucket);
  }
  for (const { origin, interval } of previous?.watches ?? []) {
    const remaining = removeAuthoredInterval(
      readRecord(next.origins, origin),
      interval
    );
    next.origins = remaining
      ? writeRecord(next.origins, origin, remaining)
      : removeRecord(next.origins, origin);
  }
  for (const bucket of previous?.locations ?? []) {
    const remaining = removeRecord(
      readRecord(next.locations, bucket),
      changeId
    );
    next.locations = remaining
      ? writeRecord(next.locations, bucket, remaining)
      : removeRecord(next.locations, bucket);
  }
  for (const bucket of current?.locations ?? []) {
    next.locations = writeRecord(
      next.locations,
      bucket,
      writeRecord(readRecord(next.locations, bucket), changeId, true)
    );
  }
  for (const field of ['roots', 'relations', 'boundaries'] as const) {
    for (const key of previous?.[field] ?? []) {
      const remaining = removeRecord(readRecord(next[field], key), changeId);
      next[field] = remaining
        ? writeRecord(next[field], key, remaining)
        : removeRecord(next[field], key);
    }
    for (const key of current?.[field] ?? []) {
      next[field] = writeRecord(
        next[field],
        key,
        writeRecord(readRecord(next[field], key), changeId, true)
      );
    }
  }
  for (const binding of current?.bindings ?? []) {
    const { bucket } = binding;
    const bindings = [
      ...(readRecord(next.buckets, bucket)?.bindings ?? []),
      binding,
    ];
    next.buckets = writeRecord(next.buckets, bucket, {
      bindings,
      slots: bindings.map(({ slot }) => slot),
    });
    changed.add(bucket);
  }
  for (const { origin, interval } of current?.watches ?? []) {
    next.origins = writeRecord(
      next.origins,
      origin,
      writeAuthoredInterval(readRecord(next.origins, origin), interval)
    );
  }
  next.changes = current
    ? writeRecord(next.changes, changeId, current)
    : removeRecord(next.changes, changeId);
  return next;
};

const orderBuckets = (
  index: AuthoredFragmentIndex,
  changed: ReadonlySet<string>,
  proposed: AuthoredRangeProjection
) => {
  let { buckets } = index;
  for (const bucket of changed) {
    const current = readRecord(buckets, bucket);
    if (!current || current.bindings.length < 2) continue;
    const bindings = orderAuthoredFragments(current.bindings, proposed);
    buckets = writeRecord(buckets, bucket, {
      bindings,
      slots: bindings.map(({ slot }) => slot),
    });
  }
  return buckets === index.buckets ? index : { ...index, buckets };
};

export const createAuthoredFragmentIndex = (
  editor: Editor,
  accepted: AuthoredRangeProjection,
  proposed: AuthoredRangeProjection
) => {
  const indexed: Array<readonly [string, IndexedChange]> = [];
  for (const status of ['pending', 'conflicted'] as const) {
    for (const { change } of matchingAuthoredChanges(proposed.state, {
      status,
    })) {
      const current = indexChange(editor, change.id, accepted, proposed);
      if (current) indexed.push([change.id, current]);
    }
  }
  indexed.sort(([left], [right]) => compareKeys(left, right));
  const memberships = (read: (change: IndexedChange) => readonly string[]) => {
    const grouped = new Map<string, string[]>();
    for (const [id, change] of indexed) {
      for (const key of read(change)) {
        const ids = grouped.get(key) ?? [];
        ids.push(id);
        grouped.set(key, ids);
      }
    }
    return recordTreeFromSortedEntries(
      [...grouped]
        .sort(([left], [right]) => compareKeys(left, right))
        .map(([key, ids]) => [
          key,
          getDefined(
            recordTreeFromSortedEntries(
              ids.sort().map((id) => [id, true] as const)
            )
          ),
        ])
    );
  };
  const bindings = new Map<string, Binding[]>();
  const origins = new Map<string, Array<AuthoredInterval<string>>>();
  for (const [, change] of indexed) {
    for (const binding of change.bindings) {
      const current = bindings.get(binding.bucket) ?? [];
      current.push(binding);
      bindings.set(binding.bucket, current);
    }
    for (const watch of change.watches) {
      const current = origins.get(watch.origin) ?? [];
      current.push(watch.interval);
      origins.set(watch.origin, current);
    }
  }
  return {
    boundaries: memberships(({ boundaries }) => boundaries),
    buckets: recordTreeFromSortedEntries(
      [...bindings]
        .sort(([left], [right]) => compareKeys(left, right))
        .map(([bucket, current]) => {
          const ordered = orderAuthoredFragments(current, proposed);
          return [
            bucket,
            { bindings: ordered, slots: ordered.map(({ slot }) => slot) },
          ] as const;
        })
    ),
    changes: recordTreeFromSortedEntries(indexed),
    locations: memberships(({ locations }) => locations),
    origins: recordTreeFromSortedEntries(
      [...origins]
        .sort(([left], [right]) => compareKeys(left, right))
        .map(([origin, intervals]) => [
          origin,
          getDefined(authoredIntervalsFrom(intervals)),
        ])
    ),
    relations: memberships(({ relations }) => relations),
    roots: memberships(({ roots }) => roots),
  };
};

export const authoredFragmentIndexNodeKeys = (
  index: AuthoredFragmentIndex,
  changeIds?: Iterable<string>
) => {
  const nodeKeys = new Set<NodeKey>();
  const changes = changeIds
    ? [...changeIds].flatMap((id) => {
        const change = readRecord(index.changes, id);
        return change ? [change] : [];
      })
    : [...records(index.changes)].map(([, change]) => change);
  for (const change of changes) {
    for (const nodeKey of change.nodeKeys) nodeKeys.add(nodeKey);
  }
  return nodeKeys;
};

export const updateAuthoredFragmentIndex = (
  editor: Editor,
  index: AuthoredFragmentIndex,
  before: AuthoredState,
  accepted: AuthoredRangeProjection,
  proposed: AuthoredRangeProjection,
  operations: readonly AuthoredOperation[]
) => {
  const affected = new Set<string>();
  const changed = new Set<string>();
  const overlap = (origin: string, from: number, to: number) => {
    for (const { value: id } of matchingAuthoredIntervals(
      readRecord(index.origins, origin),
      from,
      to
    )) {
      affected.add(id);
    }
  };
  const edit = (operation: AuthoredContribution) => {
    for (const step of authoredContributionSteps(operation)) {
      for (const { root } of step.rootTargets) {
        for (const [id] of records(readRecord(index.roots, root))) {
          affected.add(id);
        }
      }
      for (const target of step.targets) {
        if (!target.from.left) {
          for (const [id] of records(
            readRecord(index.boundaries, target.root)
          )) {
            affected.add(id);
          }
        }
        for (const span of [...target.removed, ...target.inserted]) {
          overlap(span.origin, span.offset, span.offset + span.length);
        }
        for (const endpoint of [
          target.from.left,
          target.from.right,
          target.to.left,
          target.to.right,
        ]) {
          if (endpoint) {
            overlap(endpoint.origin, endpoint.offset, endpoint.offset);
          }
        }
      }
    }
  };
  for (const operation of operations) {
    if (operation.kind === 'edit') {
      affected.add(operation.changeId);
      edit(operation);
    } else {
      for (const { id } of operation.selection.changes) {
        affected.add(id);
        for (const [related] of records(readRecord(index.relations, id))) {
          affected.add(related);
        }
        const change =
          readRecord(before.changes, id) ??
          readRecord(proposed.state.changes, id);
        for (const [, operationId] of records(change?.operations ?? null)) {
          const selected = readRecord(proposed.state.operations, operationId);
          if (selected?.kind === 'edit') edit(selected);
        }
      }
    }
  }
  let next = index;
  const nodeKeys = authoredFragmentIndexNodeKeys(index, affected);
  for (const id of affected) {
    next = replaceChange(
      next,
      id,
      indexChange(editor, id, accepted, proposed),
      changed
    );
  }
  for (const nodeKey of authoredFragmentIndexNodeKeys(next, affected)) {
    nodeKeys.add(nodeKey);
  }
  return {
    affected,
    changed,
    index: orderBuckets(next, changed, proposed),
    nodeKeys,
  };
};
