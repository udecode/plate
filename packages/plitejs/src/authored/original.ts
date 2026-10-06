import { ChangeDraft } from '../core/change/builder';
import { DocumentIndex } from '../core/change/document-index';
import {
  RootChange,
  applyPropertyModifications,
} from '../core/change/root-change';
import {
  jsonEqual,
  PreparedTokenSlice,
  type JsonToken,
} from '../core/change/tokens';
import { ContentSlice as SliceCodec } from '../core/content-slice';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type { ContentSlice } from '../interfaces/editor';
import { NodeApi, type Descendant } from '../interfaces/node';
import { getDefined } from '../internal/get-defined';
import { authoredInsertionOrigin } from './counterparts';
import { orderAuthoredFragments } from './fragment-order';
import {
  decodeAuthoredPosition,
  authoredPositionSpans,
  authoredOriginSpans,
  authoredPositionAt,
  resolveAuthoredPosition,
  replaceAuthoredPositions,
  type AuthoredPositions,
  type AuthoredPosition,
  type AuthoredSpan,
} from './positions';
import {
  decodeFlatAuthoredPositionRoots,
  encodeFlatAuthoredPositionRoots,
} from './positions-codec';
import {
  readRecord,
  records,
  writeRecord,
  removeRecord,
  type RecordTree,
} from './record-tree';
import {
  createAuthoredContentSlice,
  decodeAuthoredRetainedData,
  createAuthoredRetainedSlice,
  readAuthoredRetainedContent,
  readAuthoredTextBoundary,
  type AuthoredRetainedData,
} from './retained';
import {
  authoredContentRemovals,
  authoredContributionSteps,
  isAuthoredEditVisible,
  maximalAuthoredHeads,
  observesAuthoredOperation,
  type AuthoredEdit,
  type AuthoredEditIdentity,
  type AuthoredRecord,
  type AuthoredState,
} from './state';
import {
  mapAuthoredChange,
  authoredMovementTargets,
  authoredOperationOrigin,
  authoredRootNodes,
  type AuthoredTarget,
} from './steps';
import type { AuthoredChangePart } from './types';

type Lane = Readonly<{
  slice: ContentSlice;
  positions: AuthoredPositions;
  from: number;
  to: number;
}>;
const makeLane = (value: Lane): Lane =>
  snapshotEditorJsonValue(
    {
      slice: value.slice,
      from: value.from,
      to: value.to,
      positions: value.positions,
    },
    'Authored original lane'
  );
const encodeLane = (root: string, lane: Lane | null) =>
  lane === null
    ? null
    : snapshotEditorJsonValue(
        {
          slice: lane.slice,
          from: lane.from,
          to: lane.to,
          positions: encodeFlatAuthoredPositionRoots(
            writeRecord(null, root, {
              birth: null,
              present: true,
              positions: lane.positions,
            })
          ),
        },
        'Authored original lane'
      );
type Part = Readonly<{
  root: string;
  at: AuthoredPosition;
  before: Lane | null;
  after: Lane | null;
  format?: Extract<AuthoredChangePart, { kind: 'properties' }>;
  source?: Readonly<{ root: string; at: AuthoredPosition }>;
}>;
export type AuthoredOriginal = Readonly<{ parts: RecordTree<Part> | null }>;
type Hit = Readonly<{ id: string; from: number; to: number }>;
type Index = RecordTree<readonly Hit[]> | null;
const INDEXES = new WeakMap<AuthoredOriginal, Index>();
const spans = (lane: Lane | null) =>
  lane
    ? [...authoredPositionSpans(lane.positions, lane.from, lane.to)].map(
        (entry) => ({
          ...entry.span,
          offset: entry.span.offset + Math.max(lane.from - entry.from, 0),
          length: Math.min(lane.to, entry.to) - Math.max(lane.from, entry.from),
        })
      )
    : [];
const updateIndex = (
  previousIndex: Index,
  id: string,
  before: Part | null,
  after: Part | null
) => {
  let index = previousIndex;
  const next = new Map<string, Hit[]>();
  const afterLane = after?.after;
  if (afterLane) {
    for (const entry of authoredPositionSpans(
      afterLane.positions,
      afterLane.from,
      afterLane.to
    )) {
      const { span } = entry;
      const hits = next.get(span.origin) ?? [];
      const from = span.offset + Math.max(afterLane.from - entry.from, 0);
      hits.push({
        id,
        from,
        to:
          from +
          Math.min(afterLane.to, entry.to) -
          Math.max(afterLane.from, entry.from),
      });
      next.set(span.origin, hits);
    }
  }
  const origins = new Set<string>();
  const beforeLane = before?.after;
  if (beforeLane) {
    for (const { span } of authoredPositionSpans(
      beforeLane.positions,
      beforeLane.from,
      beforeLane.to
    )) {
      origins.add(span.origin);
    }
  }
  for (const origin of next.keys()) origins.add(origin);
  for (const origin of origins) {
    const current = readRecord(index, origin) ?? [];
    const values = [
      ...current.filter((hit) => hit.id !== id),
      ...(next.get(origin) ?? []),
    ];
    if (jsonEqual(current, values)) continue;
    index = values.length
      ? writeRecord(index, origin, values)
      : removeRecord(index, origin);
  }
  return index;
};
const indexOf = (original: AuthoredOriginal) => {
  if (INDEXES.has(original)) return INDEXES.get(original) ?? null;
  let index: Index = null;
  for (const [id, part] of records(original.parts)) {
    index = updateIndex(index, id, null, part);
  }
  INDEXES.set(original, index);
  return index;
};
const laneOf = (data: AuthoredRetainedData | null | undefined): Lane | null => {
  if (!data || data.kind === 'properties') return null;
  const content = readAuthoredRetainedContent({
    retained: data,
  } as AuthoredTarget);
  return content && content.kind !== 'properties' ? makeLane(content) : null;
};
const rootsOf = (root: string, lane: Lane) =>
  writeRecord(null, root, {
    birth: null,
    present: true,
    positions: lane.positions,
  });
const valueOf = (root: string, lane: Lane) =>
  root === 'main'
    ? {
        children: lane.slice.content,
        ...(lane.slice.roots ? { roots: lane.slice.roots } : {}),
      }
    : {
        children: [],
        roots: { ...lane.slice.roots, [root]: lane.slice.content },
      };
const locate = (
  index: Index,
  position: AuthoredPosition,
  state: AuthoredState
): { id: string; position: AuthoredPosition } | null => {
  if (!index) return null;
  const pending = [position];
  const visited = new Set<string>();
  while (pending.length) {
    const current = pending.pop();
    if (!current) break;
    for (const side of ['left', 'right'] as const) {
      const endpoint = current[side];
      if (!endpoint) continue;
      const hit = (readRecord(index, endpoint.origin) ?? []).find(
        (candidate) =>
          candidate.from <= endpoint.offset && endpoint.offset <= candidate.to
      );
      if (hit) return { id: hit.id, position: current };
    }
    for (const side of ['right', 'left'] as const) {
      const endpoint = current[side];
      if (!endpoint) continue;
      const key = JSON.stringify(endpoint);
      if (visited.has(key)) continue;
      visited.add(key);
      const insertion = authoredInsertionOrigin(state, {
        birth: null,
        placement: null,
        properties: {},
        origin: endpoint.origin,
        offset: endpoint.offset - (side === 'left' ? 1 : 0),
        length: 1,
      });
      if (insertion) pending.push(insertion.position);
    }
  }
  return null;
};
const editLane = (
  lane: Lane,
  from: number,
  to: number,
  tokens: readonly JsonToken[],
  inserted: readonly AuthoredSpan[]
): Lane => {
  const document = DocumentIndex.fromValue(lane.slice.content);
  const change = RootChange.create(document, [
    { from, to, insert: PreparedTokenSlice.fromTokens(tokens) },
  ]);
  const after = change.apply(document);
  const positions = replaceAuthoredPositions(
    lane.positions,
    from,
    to,
    inserted
  );
  const nextFrom = change.mapPos(lane.from, -1);
  const nextTo = change.mapPos(lane.to, 1);
  if (nextFrom === null || nextTo === null) {
    throw new Error('Original lane boundary was removed.');
  }
  return makeLane(
    createAuthoredRetainedSlice(
      after,
      nextFrom,
      nextTo,
      positions,
      lane.slice.roots
    )
  );
};

const replaceOriginalLane = (
  root: string,
  destination: Lane,
  contribution: Lane,
  replacement: Lane | null,
  operationId: string
): Lane => {
  const sourcePositions = contribution.positions;
  const destinationPositions = destination.positions;
  const from = resolveAuthoredPosition(
    destinationPositions,
    authoredPositionAt(sourcePositions, contribution.from),
    'right',
    'collapse'
  );
  const to = resolveAuthoredPosition(
    destinationPositions,
    authoredPositionAt(sourcePositions, contribution.to),
    'left',
    'collapse'
  );
  if (from === null || to === null || to < from) {
    throw new Error('Cannot locate moved original contribution.');
  }
  const document = DocumentIndex.fromValue(destination.slice.content);
  const source = replacement
    ? DocumentIndex.fromValue(replacement.slice.content)
    : null;
  const tokens =
    source && replacement
      ? source.slice(replacement.from, replacement.to).toJSON()
      : [];
  const originalTokens = DocumentIndex.fromValue(contribution.slice.content)
    .slice(contribution.from, contribution.to)
    .toJSON();
  if (
    [...tokens, ...originalTokens].some(
      (token) => token.kind !== 'text' && token.nodeKind === 'element'
    )
  ) {
    return editLane(destination, from, to, tokens, spans(replacement));
  }
  const touched = [
    ...document.nodeRangesTouching(from, to),
    ...document.openContextAt(from),
    ...document.openContextAt(to),
  ].find((node) => node.kind === 'text');
  const first = touched;
  if (!first) {
    return editLane(destination, from, to, tokens, spans(replacement));
  }
  const parentPath = first.path.slice(0, -1);
  const parent = parentPath.length ? document.node(parentPath) : null;
  const children =
    parent && 'children' in parent
      ? getDefined(parent.children)
      : document.value;
  let low = getDefined(first.path.at(-1));
  let high = low;
  while (low > 0 && 'text' in children[low - 1]) low -= 1;
  while (high + 1 < children.length && 'text' in children[high + 1]) high += 1;
  const runFrom = document.nodeRange([...parentPath, low]).from;
  const runTo = document.nodeRange([...parentPath, high]).to;
  if (from < runFrom || to > runTo) {
    throw new Error(
      'Original text contribution crosses structural boundaries.'
    );
  }
  const pieces: Array<{
    text: string;
    props: Record<string, unknown>;
    spans: AuthoredSpan[];
  }> = [];
  const collect = (
    index: DocumentIndex,
    lane: Lane,
    begin: number,
    end: number
  ) => {
    for (const node of index.nodeRangesTouching(begin, end)) {
      if (node.kind !== 'text') continue;
      const start = Math.max(begin, node.from + 1);
      const stop = Math.min(end, node.to - 1);
      if (stop <= start) continue;
      const value = index.node(node.path);
      if (typeof value.text !== 'string') continue;
      const { text, ...props } = value;
      pieces.push({
        text: text.slice(start - node.from - 1, stop - node.from - 1),
        props,
        spans: [...authoredPositionSpans(lane.positions, start, stop)].map(
          (entry) => ({
            ...entry.span,
            offset: entry.span.offset + Math.max(start - entry.from, 0),
            length: Math.min(stop, entry.to) - Math.max(start, entry.from),
          })
        ),
      });
    }
  };
  collect(document, destination, runFrom, from);
  if (source && replacement) {
    collect(source, replacement, replacement.from, replacement.to);
  }
  collect(document, destination, to, runTo);
  const groups: typeof pieces = [];
  for (const piece of pieces) {
    const previous = groups.at(-1);
    if (previous && jsonEqual(previous.props, piece.props)) {
      previous.text += piece.text;
      previous.spans.push(...piece.spans);
    } else groups.push(piece);
  }
  if (!groups.length) groups.push({ text: '', props: {}, spans: [] });
  const output: JsonToken[] = [];
  const positions: AuthoredSpan[] = [];
  for (const [index, group] of groups.entries()) {
    output.push(
      { kind: 'open', nodeKind: 'text', props: group.props },
      ...(group.text ? [{ kind: 'text' as const, text: group.text }] : []),
      { kind: 'close', nodeKind: 'text' }
    );
    const boundary = {
      birth: null,
      placement: null,
      properties: {},
      origin: `${operationId}:original:${root}:${runFrom}`,
      offset: index * 2,
      length: 1,
    };
    positions.push(boundary, ...group.spans, {
      ...boundary,
      offset: index * 2 + 1,
    });
  }
  return editLane(destination, runFrom, runTo, output, positions);
};

const sliceLane = (lane: Lane, from: number, to: number) =>
  makeLane(
    createAuthoredRetainedSlice(
      DocumentIndex.fromValue(lane.slice.content),
      from,
      to,
      lane.positions,
      lane.slice.roots
    )
  );

const laneIntervals = (lane: Lane, content: readonly AuthoredSpan[]) => {
  const intervals = content
    .flatMap((span) =>
      authoredOriginSpans(lane.positions, span.origin, {
        from: span.offset,
        to: span.offset + span.length,
      }).map((entry) => ({
        from: Math.max(
          lane.from,
          entry.from + Math.max(span.offset - entry.span.offset, 0)
        ),
        to: Math.min(
          lane.to,
          entry.from +
            Math.min(
              span.offset + span.length - entry.span.offset,
              entry.span.length
            )
        ),
      }))
    )
    .filter(({ from, to }) => from < to)
    .sort((a, b) => a.from - b.from);
  const merged: Array<{ from: number; to: number }> = [];
  for (const interval of intervals) {
    const previous = merged.at(-1);
    if (previous && interval.from <= previous.to) {
      previous.to = Math.max(previous.to, interval.to);
    } else merged.push({ ...interval });
  }
  return merged;
};

const trimOriginalLane = (lane: Lane, removed: readonly AuthoredSpan[]) => {
  const intervals = laneIntervals(lane, removed);
  if (!intervals.length) return undefined;
  let { from } = lane;
  let { to } = lane;
  for (const interval of intervals) {
    if (interval.from === from) from = interval.to;
    else if (interval.to === to) to = interval.from;
    else return undefined;
  }
  return from < to ? sliceLane(lane, from, to) : null;
};

const uncapturedBefore = (lane: Lane, parts: RecordTree<Part> | null) => {
  const covered = laneIntervals(
    lane,
    [...records(parts)].flatMap(([, part]) => spans(part.before))
  );
  const remaining: Lane[] = [];
  let { from } = lane;
  for (const interval of covered) {
    if (from < interval.from) {
      remaining.push(sliceLane(lane, from, interval.from));
    }
    from = interval.to;
  }
  if (from < lane.to) remaining.push(sliceLane(lane, from, lane.to));
  return remaining;
};

const pairedLane = (
  before: Lane | null,
  after: Lane,
  from: number,
  to: number
): Lane | null => {
  if (!before) return null;
  const { positions } = before;
  const start = resolveAuthoredPosition(
    positions,
    authoredPositionAt(after.positions, from),
    'right',
    'collapse'
  );
  const end = resolveAuthoredPosition(
    positions,
    authoredPositionAt(after.positions, to),
    'left',
    'collapse'
  );
  return start !== null && end !== null && start < end
    ? sliceLane(before, start, end)
    : null;
};

const movementRange = (part: Part, removed: AuthoredTarget) => {
  const { after } = part;
  if (part.root !== removed.root || !after) return null;
  const ranges = removed.removed.flatMap((span) =>
    authoredOriginSpans(after.positions, span.origin, {
      from: span.offset,
      to: span.offset + span.length,
    })
      .map((entry) => ({
        from: Math.max(
          after.from,
          entry.from + Math.max(span.offset - entry.span.offset, 0)
        ),
        to: Math.min(
          after.to,
          entry.from +
            Math.min(
              span.offset + span.length - entry.span.offset,
              entry.span.length
            )
        ),
      }))
      .filter((range) => range.from < range.to)
  );
  return ranges.length
    ? {
        from: Math.min(...ranges.map((range) => range.from)),
        to: Math.max(...ranges.map((range) => range.to)),
      }
    : null;
};

export const updateAuthoredOriginal = (
  previous: AuthoredOriginal | null | undefined,
  operation: AuthoredEdit,
  state: AuthoredState
): AuthoredOriginal | null | undefined => {
  if (!operation.proposal) return null;
  if (operation.retained) return previous;
  if (
    previous === undefined ||
    operation.steps.some((step) =>
      step.targets.some((target) => target.insertedContent === undefined)
    )
  ) {
    return undefined;
  }
  let original: AuthoredOriginal = previous ?? { parts: null };
  let index = indexOf(original);
  let { parts } = original;
  const save = (id: string, part: Part) => {
    index = updateIndex(index, id, readRecord(parts, id), part);
    parts = writeRecord(parts, id, part);
  };
  for (const [stepIndex, step] of operation.steps.entries()) {
    const movement = authoredMovementTargets(step.targets);
    if (movement) {
      const { removed, inserted } = movement;
      let before = laneOf(removed.retained);
      let after = laneOf(inserted.insertedContent);
      if (!before || !after) {
        throw new Error('Missing original movement content.');
      }
      if (spans(before).every((span) => span.birth === operation.changeId)) {
        before = null;
      }
      let source = { root: removed.root, at: removed.from };
      for (const [id, part] of records(parts)) {
        const moved = movementRange(part, removed);
        if (!moved || !part.after) continue;
        if (part.source) ({ source } = part);
        const contribution = sliceLane(part.after, moved.from, moved.to);
        const paired =
          moved.from === part.after.from && moved.to === part.after.to
            ? part.before
            : pairedLane(part.before, part.after, moved.from, moved.to);
        if (before) {
          before = replaceOriginalLane(
            removed.root,
            before,
            contribution,
            paired,
            operation.id
          );
        } else if (paired) before = paired;
        after = replaceOriginalLane(
          inserted.root,
          after,
          contribution,
          contribution,
          operation.id
        );
        index = updateIndex(index, id, part, null);
        parts = removeRecord(parts, id);
        for (const [from, to] of [
          [part.after.from, moved.from],
          [moved.to, part.after.to],
        ]) {
          if (from >= to) continue;
          save(JSON.stringify([id, from, to]), {
            ...part,
            after: sliceLane(part.after, from, to),
            before: pairedLane(part.before, part.after, from, to),
          });
        }
      }
      const first = removed.removed[0];
      const id = JSON.stringify(['move', first.origin, first.offset]);
      save(id, {
        root: inserted.root,
        at: inserted.from,
        source,
        before: before && before.from < before.to ? before : null,
        after,
      });
      continue;
    }
    for (const savedTarget of step.targets) {
      let target = savedTarget;
      const section = (
        target.root === 'main'
          ? step.forward.primary
          : step.forward.roots?.[target.root]
      )?.[target.section];
      if (!section || readAuthoredTextBoundary(target, section)) continue;
      if (
        section.properties &&
        target.retained?.kind === 'properties' &&
        operation.directFormatting
      ) {
        const ownedSpans =
          target.retained.spans?.filter(
            (span) =>
              span.origin === authoredOperationOrigin(operation.id, target.root)
          ) ?? [];
        if (!ownedSpans.length) continue;
        target = {
          ...target,
          retained: { ...target.retained, spans: ownedSpans },
        };
      }
      if (!section.replacement && !section.properties) continue;
      const ids = new Set<string>();
      for (const span of target.retained?.kind === 'properties'
        ? (target.retained.spans ?? target.removed)
        : target.removed) {
        for (const hit of readRecord(index, span.origin) ?? []) {
          if (hit.from < span.offset + span.length && span.offset < hit.to) {
            ids.add(hit.id);
          }
        }
      }
      let insertion =
        section.replacement && target.inserted.length
          ? locate(index, target.from, state)
          : null;
      if (insertion) {
        const lane = readRecord(parts, insertion.id)?.after;
        const at = lane
          ? resolveAuthoredPosition(
              lane.positions,
              insertion.position,
              'right',
              'collapse'
            )
          : null;
        if (
          !lane ||
          at === null ||
          (section.replacement?.every((token) => token.kind === 'text')
            ? !DocumentIndex.fromValue(lane.slice.content)
                .openContextAt(at)
                .some((entry) => entry.kind === 'text')
            : at <= lane.from || at >= lane.to)
        ) {
          insertion = null;
        }
      }
      const insertionId = insertion?.id;
      if (insertionId) ids.add(insertionId);
      let trimmedStructure = false;
      for (const id of ids) {
        const part = readRecord(parts, id);
        if (!part) throw new Error('Missing indexed original contribution.');
        const lane = part.after;
        if (!lane) continue;
        const allowInsertion = !!section.properties || id === insertionId;
        if (
          section.replacement?.length === 0 &&
          !section.properties &&
          target.inserted.length === 0 &&
          (resolveAuthoredPosition(
            lane.positions,
            target.from,
            'right',
            'collapse'
          ) === null ||
            resolveAuthoredPosition(
              lane.positions,
              target.to,
              'left',
              'collapse'
            ) === null)
        ) {
          const after = trimOriginalLane(lane, target.removed);
          if (after !== undefined) {
            save(id, { ...part, after });
            trimmedStructure = true;
            continue;
          }
        }
        const mapped = mapAuthoredChange({
          state,
          changeId: operation.changeId,
          operationId: operation.id,
          direction: 'forward',
          properties: {
            state,
            isVisible: (edit) => edit.changeId === operation.changeId,
          },
          insertionBounds: { root: part.root, from: lane.from, to: lane.to },
          positions: rootsOf(part.root, lane),
          value: valueOf(part.root, lane),
          steps: [
            {
              ...step,
              rootTargets: [],
              targets: [
                allowInsertion
                  ? { ...target, from: insertion?.position ?? target.from }
                  : { ...target, inserted: [], insertedContent: null },
              ],
              forward: allowInsertion
                ? step.forward
                : {
                    ...step.forward,
                    ...(target.root === 'main'
                      ? {
                          primary: getDefined(step.forward.primary).map(
                            (entry, i) =>
                              i === target.section
                                ? { ...entry, replacement: [] }
                                : entry
                          ),
                        }
                      : {
                          roots: {
                            ...step.forward.roots,
                            [target.root]: (
                              step.forward.roots?.[target.root] ?? []
                            ).map((entry, i) =>
                              i === target.section
                                ? { ...entry, replacement: [] }
                                : entry
                            ),
                          },
                        }),
                  },
            },
          ],
        });
        const { after } = new ChangeDraft(valueOf(part.root, lane)).apply(
          mapped.change
        );
        const nodes = authoredRootNodes(after, part.root);
        const delta =
          DocumentIndex.fromValue(nodes).length -
          DocumentIndex.fromValue(lane.slice.content).length;
        const mappedRoot = readRecord(mapped.positions, part.root);
        if (!mappedRoot) throw new Error('Missing mapped original root.');
        save(id, {
          ...part,
          after: makeLane({
            ...lane,
            slice: { ...lane.slice, content: nodes as ContentSlice['content'] },
            positions: mappedRoot.positions,
            to: lane.to + delta,
          }),
        });
      }
      if (trimmedStructure) {
        const before = laneOf(target.retained);
        if (before) {
          for (const [partIndex, lane] of uncapturedBefore(
            before,
            parts
          ).entries()) {
            save(
              JSON.stringify([
                operation.id,
                stepIndex,
                target.root,
                target.section,
                partIndex,
              ]),
              {
                root: target.root,
                at: target.from,
                before: lane,
                after: null,
              }
            );
          }
        }
      }
      if (section.properties) {
        if (!ids.size && target.retained?.kind === 'properties') {
          const key = JSON.stringify([
            'properties',
            target.root,
            target.removed[0]?.origin,
            target.removed[0]?.offset,
          ]);
          const priorPart = readRecord(parts, key);
          const before =
            priorPart?.format?.before ?? target.retained.properties;
          save(key, {
            root: target.root,
            at: target.from,
            before: null,
            after: null,
            format: {
              kind: 'properties',
              nodeKind: target.retained.nodeKind,
              root: target.root,
              path: null,
              before,
              after: applyPropertyModifications(
                priorPart?.format?.after ?? before,
                section.properties.operations
              ),
            },
          });
        }
        continue;
      }
      const baseRemoved = target.removed.some(
        (span) => span.birth !== operation.changeId
      );
      let insertedLane = insertionId ? null : laneOf(target.insertedContent);
      if (
        insertedLane &&
        target.inserted.some((span) => span.birth !== operation.changeId)
      ) {
        const owned = [
          ...authoredPositionSpans(
            insertedLane.positions,
            insertedLane.from,
            insertedLane.to
          ),
        ].filter((entry) => entry.span.birth === operation.changeId);
        if (owned.length) {
          insertedLane = makeLane(
            createAuthoredRetainedSlice(
              DocumentIndex.fromValue(insertedLane.slice.content),
              Math.max(insertedLane.from, owned[0].from),
              Math.min(insertedLane.to, getDefined(owned.at(-1)).to),
              insertedLane.positions,
              insertedLane.slice.roots
            )
          );
        } else insertedLane = null;
      }
      if (
        (baseRemoved && !ids.size) ||
        (!insertionId && target.inserted.length)
      ) {
        const id = JSON.stringify([
          operation.id,
          stepIndex,
          target.root,
          target.section,
        ]);
        save(id, {
          root: target.root,
          at: target.from,
          before: baseRemoved ? laneOf(target.retained) : null,
          after: !insertionId ? insertedLane : null,
        });
      }
    }
  }
  original = snapshotEditorJsonValue({ parts }, 'Authored original');
  INDEXES.set(original, index);
  return original;
};
type SavedPart = Omit<Part, 'before' | 'after'> & {
  before: ReturnType<typeof encodeLane>;
  after: ReturnType<typeof encodeLane>;
};
const PART_ENCODINGS = new WeakMap<Part, SavedPart>();
const encodePart = (part: Part): SavedPart => {
  const previous = PART_ENCODINGS.get(part);
  if (previous) return previous;
  const encoded = snapshotEditorJsonValue(
    {
      ...part,
      before: encodeLane(part.source?.root ?? part.root, part.before),
      after: encodeLane(part.root, part.after),
    },
    'Authored original part'
  );
  PART_ENCODINGS.set(part, encoded);
  return encoded;
};
export const encodeAuthoredOriginal = (
  original: AuthoredOriginal | null | undefined
): unknown =>
  original == null
    ? original
    : snapshotEditorJsonValue(
        {
          parts: [...records(original.parts)].map(([id, part]) => [
            id,
            encodePart(part),
          ]),
        },
        'Authored original checkpoint'
      );
const originalRecord = (input: unknown, keys: readonly string[]) => {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).length !== keys.length ||
    Object.keys(input).some((key) => !keys.includes(key))
  ) {
    throw new Error('Invalid authored original fields.');
  }
  return input as Record<string, unknown>;
};
const originalId = (input: unknown): string => {
  if (typeof input !== 'string' || !input || input.includes('\u0000')) {
    throw new Error('Invalid authored original identity.');
  }
  return input;
};
const decodeOriginalLane = (input: unknown, root: string): Lane | null => {
  if (input === null) return null;
  const data = originalRecord(input, ['slice', 'positions', 'from', 'to']);
  const slice = SliceCodec.fromJSON(data.slice);
  const roots = decodeFlatAuthoredPositionRoots(data.positions);
  const entries = [...records(roots)];
  const entry = readRecord(roots, root);
  const { length } = DocumentIndex.fromValue(slice.content);
  if (
    entries.length !== 1 ||
    !entry ||
    !entry.present ||
    entry.birth !== null ||
    (entry.positions.root?.length ?? 0) !== length ||
    typeof data.from !== 'number' ||
    !Number.isSafeInteger(data.from) ||
    typeof data.to !== 'number' ||
    !Number.isSafeInteger(data.to) ||
    data.from < 0 ||
    data.to < data.from ||
    data.to > length
  ) {
    throw new Error('Invalid authored original content positions.');
  }
  return makeLane({
    slice,
    positions: entry.positions,
    from: data.from,
    to: data.to,
  });
};
const decodeOriginalFormat = (input: unknown, root: string): Part['format'] => {
  const data = originalRecord(input, [
    'kind',
    'nodeKind',
    'root',
    'path',
    'before',
    'after',
  ]);
  if (data.kind !== 'properties' || data.root !== root || data.path !== null) {
    throw new Error('Invalid authored original properties.');
  }
  const properties = (value: unknown) => {
    const retained = decodeAuthoredRetainedData({
      kind: 'properties',
      nodeKind: data.nodeKind,
      properties: value,
      spans: data.nodeKind === 'text' ? [] : null,
    });
    if (retained?.kind !== 'properties') {
      throw new Error('Invalid authored original properties.');
    }
    return retained.properties;
  };
  return {
    kind: 'properties',
    nodeKind: data.nodeKind as 'text' | 'element',
    root,
    path: null,
    before: properties(data.before),
    after: properties(data.after),
  };
};
export const decodeAuthoredOriginal = (
  input: unknown
): AuthoredOriginal | null => {
  if (input === null) return null;
  const data = originalRecord(input, ['parts']);
  if (!Array.isArray(data.parts)) {
    throw new Error('Invalid authored original parts.');
  }
  let parts: AuthoredOriginal['parts'] = null;
  for (const item of data.parts) {
    if (!Array.isArray(item) || item.length !== 2) {
      throw new Error('Invalid authored original part.');
    }
    const id = originalId(item[0]);
    if (readRecord(parts, id)) {
      throw new Error('Duplicate authored original part.');
    }
    const raw = item[1];
    const part = originalRecord(raw, [
      'root',
      'at',
      'before',
      'after',
      ...(raw && typeof raw === 'object' && 'format' in raw ? ['format'] : []),
      ...(raw && typeof raw === 'object' && 'source' in raw ? ['source'] : []),
    ]);
    const root = originalId(part.root);
    const move =
      part.source === undefined
        ? undefined
        : originalRecord(part.source, ['root', 'at']);
    const source = move
      ? { root: originalId(move.root), at: decodeAuthoredPosition(move.at) }
      : undefined;
    const before = decodeOriginalLane(part.before, source?.root ?? root);
    const after = decodeOriginalLane(part.after, root);
    const format =
      part.format === undefined
        ? undefined
        : decodeOriginalFormat(part.format, root);
    if (format && (before || after || source)) {
      throw new Error('Mixed authored original part.');
    }
    parts = writeRecord(parts, id, {
      root,
      at: decodeAuthoredPosition(part.at),
      before,
      after,
      ...(format ? { format } : {}),
      ...(source ? { source } : {}),
    });
  }
  return snapshotEditorJsonValue({ parts }, 'Authored original');
};
const refreshedOriginalSlice = (
  lane: Lane,
  state: AuthoredState,
  markers: readonly AuthoredEditIdentity[]
): ContentSlice | null => {
  const removed: Array<{ from: number; to: number }> = [];
  for (const entry of authoredPositionSpans(
    lane.positions,
    lane.from,
    lane.to
  )) {
    for (const removal of authoredContentRemovals(state, entry.span)) {
      if (
        removal.value.proposal ||
        !markers.some((marker) =>
          isAuthoredEditVisible(state, removal.value, (operation) =>
            observesAuthoredOperation(marker, operation)
          )
        )
      ) {
        continue;
      }
      const from = Math.max(
        lane.from,
        entry.from + Math.max(removal.from - entry.span.offset, 0)
      );
      const to = Math.min(
        lane.to,
        entry.to,
        entry.from + removal.to - entry.span.offset
      );
      if (from < to) removed.push({ from, to });
    }
  }
  if (!removed.length) return lane.slice;
  const merged: typeof removed = [];
  for (const interval of removed.sort(
    (left, right) => left.from - right.from
  )) {
    const previous = merged.at(-1);
    if (previous && interval.from <= previous.to) {
      previous.to = Math.max(previous.to, interval.to);
    } else merged.push({ ...interval });
  }
  const document = DocumentIndex.fromValue(lane.slice.content);
  const edits: typeof removed = [];
  const visit = (node: Descendant, path: number[]) => {
    const range = document.nodeRange(path);
    const from = Math.max(lane.from, range.from);
    const to = Math.min(lane.to, range.to);
    if (
      from < to &&
      merged.some((interval) => interval.from <= from && to <= interval.to)
    ) {
      edits.push(range);
      return;
    }
    if (NodeApi.isElement(node)) {
      node.children.forEach((child, index) => visit(child, [...path, index]));
      return;
    }
    for (const interval of merged) {
      const start = Math.max(range.from + 1, interval.from);
      const end = Math.min(range.to - 1, interval.to);
      if (start < end) edits.push({ from: start, to: end });
    }
  };
  lane.slice.content.forEach((node, index) => visit(node, [index]));
  if (!edits.length) return lane.slice;
  const change = RootChange.create(
    document,
    edits.map((edit) => ({ ...edit, insert: PreparedTokenSlice.empty }))
  );
  const after = change.apply(document);
  const from = change.mapPos(lane.from, -1);
  const to = change.mapPos(lane.to, 1);
  if (from === null || to === null || from >= to || !after.length) return null;
  return {
    ...createAuthoredContentSlice(after, from, to),
    ...(lane.slice.roots ? { roots: lane.slice.roots } : {}),
  };
};

export const readAuthoredOriginal = (
  change: AuthoredRecord,
  state: AuthoredState
) => {
  const { original } = change;
  if (original === null) return null;
  if (!original) {
    return { status: 'unavailable' as const, reason: 'legacy' as const };
  }
  const candidates = [...records(change.operations)].flatMap(([, id]) => {
    const operation = readRecord(state.operations, id);
    return operation?.kind === 'edit' &&
      operation.refreshOriginal &&
      isAuthoredEditVisible(state, operation, () => true)
      ? [operation]
      : [];
  });
  const heads = new Set(
    maximalAuthoredHeads(
      state.operations,
      candidates.map((operation) => operation.id)
    )
  );
  const markers = candidates.filter((operation) => heads.has(operation.id));
  const originalOwners = [...records(state.changes)]
    .map(([, record]) => record)
    .filter(
      (record) =>
        record.id === change.id ||
        record.status === 'pending' ||
        record.status === 'conflicted'
    );
  const following = new Map<string, AuthoredPosition['right']>();
  for (const owner of originalOwners) {
    for (const [, operationId] of records(owner.operations)) {
      const operation = readRecord(state.operations, operationId);
      if (operation?.kind !== 'edit') continue;
      for (const [stepIndex, step] of [
        ...authoredContributionSteps(operation),
      ].entries()) {
        for (const target of step.targets) {
          following.set(
            JSON.stringify([
              operation.id,
              stepIndex,
              target.root,
              target.section,
            ]),
            target.to.right
          );
        }
      }
    }
  }
  const originals = originalOwners.flatMap((record) =>
    [...records(record.original?.parts ?? null)].map(([id, part]) => ({
      id,
      part,
      changeId: record.id,
    }))
  );
  const deletions = originals.flatMap(({ id, part, changeId }) => {
    const lane = part.before;
    if (!lane) return [];
    const content = spans(lane);
    if (!content.length) return [];
    const mergeable =
      changeId === change.id &&
      !part.after &&
      !part.format &&
      !part.source &&
      DocumentIndex.fromValue(lane.slice.content)
        .slice(lane.from, lane.to)
        .toJSON()
        .every((token) => token.kind === 'text');
    return [
      {
        part,
        mergeable,
        root: part.root,
        slot: { id, changeId, side: 'text' as const },
        order: {
          key: id,
          position: part.at,
          spans: content,
          before: part.at.left,
          after: following.get(id) ?? null,
        },
      },
    ];
  });
  const ordered = orderAuthoredFragments(deletions, {
    state,
    positions: state.projectedPositions,
    value: state.projected ?? { children: [] },
  });
  const combined = new Map<Part, Part | null>();
  for (let index = 0; index < ordered.length; index++) {
    if (!ordered[index].mergeable) continue;
    const first = ordered[index].part;
    const part = { ...first };
    const content = [...ordered[index].order.spans];
    while (index + 1 < ordered.length) {
      const next = ordered[index + 1];
      const root = readRecord(state.projectedPositions, part.root);
      const lastSpan = getDefined(content.at(-1));
      const nextSpan = next.order.spans[0];
      if (
        !root ||
        !next.mergeable ||
        next.root !== part.root ||
        content.some((left) =>
          next.order.spans.some(
            (right) =>
              left.origin === right.origin &&
              left.offset < right.offset + right.length &&
              right.offset < left.offset + left.length
          )
        )
      ) {
        break;
      }
      const end = resolveAuthoredPosition(
        root.positions,
        {
          left: {
            origin: lastSpan.origin,
            offset: lastSpan.offset + lastSpan.length,
          },
          right: null,
        },
        'left',
        'collapse'
      );
      const start = resolveAuthoredPosition(
        root.positions,
        {
          left: null,
          right: { origin: nextSpan.origin, offset: nextSpan.offset },
        },
        'right',
        'collapse'
      );
      if (end === null || start !== end) break;
      const lane = getDefined(part.before);
      part.before = replaceOriginalLane(
        part.root,
        lane,
        { ...lane, from: lane.to },
        next.part.before,
        change.id
      );
      content.push(...next.order.spans);
      combined.set(next.part, null);
      index += 1;
    }
    combined.set(first, part);
  }
  const items: AuthoredChangePart[] = [];
  for (const [, originalPart] of records(original.parts)) {
    const part = combined.has(originalPart)
      ? combined.get(originalPart)
      : originalPart;
    if (!part) continue;
    if (part.format) {
      items.push(part.format);
      continue;
    }
    const before =
      part.before && part.before.from < part.before.to
        ? {
            content: part.before.slice,
            location: null,
            root: part.source?.root ?? part.root,
          }
        : null;
    const content =
      part.after && part.after.from < part.after.to
        ? markers.length
          ? refreshedOriginalSlice(part.after, state, markers)
          : part.after.slice
        : null;
    const after = content ? { content, location: null, root: part.root } : null;
    if (before || after) {
      items.push({
        kind: 'content',
        action: before
          ? after
            ? part.source
              ? 'move'
              : 'replace'
            : 'delete'
          : 'insert',
        before,
        after,
      });
    }
  }
  return { status: 'available' as const, items };
};
