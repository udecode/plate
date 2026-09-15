import { DocumentIndex } from '../core/change/document-index';
import {
  applyPropertyModifications,
  type RootChangeJson,
} from '../core/change/root-change';
import {
  jsonEqual,
  PreparedTokenSlice,
  type JsonEditorValue,
} from '../core/change/tokens';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type { Point } from '../interfaces/point';
import type { Range } from '../interfaces/range';
import type { AuthoredRangeProjection } from './anchors';
import { authoredContentLocations } from './counterparts';
import {
  readAuthoredFragmentOrder,
  readAuthoredFragmentProjection,
  readAuthoredMarkupFragments,
  readAuthoredRemovalIntervals,
} from './markup';
import { resolveAuthoredPosition, type AuthoredSpan } from './positions';
import { readRecord, records } from './record-tree';
import {
  createAuthoredContentSlice,
  createAuthoredRetainedSlice,
  readAuthoredRetainedContent,
  readAuthoredTextBoundary,
} from './retained';
import {
  authoredContributionSteps,
  authoredDependants,
  hasAuthoredContent,
  materializeAuthoredEdit,
  type AuthoredRecord,
  type AuthoredState,
} from './state';
import {
  authoredContentSpans,
  authoredPositionRoot,
  authoredRootNodes,
  resolveAuthoredRetainedPosition,
  type AuthoredTarget,
  type AuthoredPositionRoots,
} from './steps';
import type {
  AuthoredChange,
  AuthoredChangeContent,
  AuthoredChangeDetails,
  AuthoredChangeLocation,
  AuthoredChangePart,
  AuthoredChangeReview,
  AuthoredQuery,
} from './types';

export const validateAuthoredQuery = (
  query: Omit<AuthoredQuery, 'cursor' | 'limit'>
) => {
  if (!query || typeof query !== 'object' || Array.isArray(query)) {
    throw new Error('Invalid authored query.');
  }
  if (
    query.authorId !== undefined &&
    (typeof query.authorId !== 'string' ||
      !query.authorId ||
      query.authorId.includes('\u0000'))
  ) {
    throw new Error('Invalid authored query author.');
  }
  if (
    query.status !== undefined &&
    !['accepted', 'conflicted', 'pending', 'rejected'].includes(query.status)
  ) {
    throw new Error('Invalid authored query status.');
  }
  if (
    (query.from !== undefined &&
      (!Number.isSafeInteger(query.from) || query.from < 0)) ||
    (query.to !== undefined &&
      (!Number.isSafeInteger(query.to) || query.to < 0)) ||
    (query.from !== undefined &&
      query.to !== undefined &&
      query.from > query.to)
  ) {
    throw new Error('Invalid authored query interval.');
  }
};

const CHANGE_READS = new WeakMap<
  AuthoredState,
  Map<
    string,
    Array<
      Readonly<{
        positions: AuthoredPositionRoots;
        result: AuthoredChange;
        value: JsonEditorValue;
      }>
    >
  >
>();

export const readAuthoredChange = (
  change: AuthoredRecord,
  state: AuthoredState,
  positions: AuthoredPositionRoots,
  value: JsonEditorValue
): AuthoredChange => {
  let reads = CHANGE_READS.get(state);
  if (!reads) {
    reads = new Map();
    CHANGE_READS.set(state, reads);
  }
  const previous = reads.get(change.id) ?? [];
  const cached = previous.find(
    (entry) => entry.positions === positions && entry.value === value
  );
  if (cached) return cached.result;

  const ranges: Range[] = [];
  const seen = new Set<string>();
  const indexes = new Map<string, DocumentIndex>();
  const document = (root: string) => {
    let index = indexes.get(root);
    if (!index) {
      index = DocumentIndex.fromValue(authoredRootNodes(value, root));
      indexes.set(root, index);
    }

    return index;
  };
  const add = (root: string, from: number | null, to: number | null) => {
    if (from === null || to === null || from > to) return;
    const key = `${root}:${from}:${to}`;
    if (seen.has(key)) return;
    seen.add(key);
    const native = document(root);
    const anchor = native.pointAt(from, 1);
    const focus = from === to ? anchor : native.pointAt(to, -1);
    if (anchor && focus) {
      ranges.push({
        anchor: { ...anchor, ...(root === 'main' ? {} : { root }) },
        focus: { ...focus, ...(root === 'main' ? {} : { root }) },
      });
    }
  };
  for (const [, id] of records(change.operations)) {
    const operation = readRecord(state.operations, id);
    if (!operation || operation.kind !== 'edit') continue;
    for (const step of authoredContributionSteps(operation)) {
      for (const [targetIndex, target] of step.targets.entries()) {
        const section = (
          'forward' in step
            ? target.root === 'main'
              ? step.forward.primary
              : step.forward.roots?.[target.root]
            : undefined
        )?.[target.section];
        const length =
          section?.length ??
          ('forward' in step ? undefined : step.targets[targetIndex].length);
        let inserted = false;
        for (const retained of target.inserted) {
          const fragments = [
            ...authoredContentSpans(positions, target.root, retained),
          ].toSorted(
            (left, right) =>
              left.root.localeCompare(right.root) ||
              left.from - right.from ||
              left.to - right.to
          );
          let visible: (typeof fragments)[number] | null = null;
          for (const fragment of fragments) {
            if (
              visible?.root === fragment.root &&
              visible.to >= fragment.from
            ) {
              visible = {
                from: visible.from,
                root: visible.root,
                to: Math.max(visible.to, fragment.to),
              };
            } else {
              if (visible) add(visible.root, visible.from, visible.to);
              visible = fragment;
            }
          }
          if (visible) add(visible.root, visible.from, visible.to);
          inserted ||= fragments.length > 0;
        }
        if (!inserted) {
          const root =
            authoredPositionRoot(
              positions,
              target.root,
              target.from,
              'right'
            ) ?? target.root;
          const index = readRecord(positions, root)?.positions;
          if (!index) continue;
          add(
            root,
            resolveAuthoredPosition(index, target.from, 'right', 'collapse'),
            resolveAuthoredPosition(
              index,
              target.to,
              length === 0 ? 'right' : 'left',
              'collapse'
            )
          );
        }
      }
    }
  }
  const result = snapshotEditorJsonValue(
    {
      authorId: change.authorId,
      createdAt: change.createdAt,
      dependencies: change.dependencies,
      id: change.id,
      kind: change.kind,
      ranges,
      revision: change.revision,
      status: change.status,
      updatedAt: change.updatedAt,
    },
    'Authored change view'
  );
  previous.unshift({ positions, result, value });
  if (previous.length > 4) previous.pop();
  reads.set(change.id, previous);

  return result;
};

type DetailsProjection = Pick<
  AuthoredRangeProjection,
  'positions' | 'state' | 'value'
>;

const pointInRoot = (point: Point, root: string): Point =>
  root === 'main' ? point : { ...point, root };

const rangeLocation = (
  root: string,
  document: DocumentIndex,
  from: number,
  to: number
): AuthoredChangeLocation | null => {
  const anchor = document.pointAt(from, 1);
  const focus = from === to ? anchor : document.pointAt(to, -1);

  return anchor && focus
    ? {
        kind: 'range',
        range: {
          anchor: pointInRoot(anchor, root),
          focus: pointInRoot(focus, root),
        },
      }
    : null;
};

const targetLocation = (
  target: AuthoredTarget,
  projection: DetailsProjection
): Readonly<{ location: AuthoredChangeLocation | null; root: string }> => {
  const root =
    authoredPositionRoot(
      projection.positions,
      target.root,
      target.afterFrom,
      'right'
    ) ?? target.root;
  const positions = readRecord(projection.positions, root);
  if (!positions?.present) return { location: null, root };
  const at =
    !target.afterFrom.left && !target.afterFrom.right
      ? 0
      : resolveAuthoredRetainedPosition(
          projection.state,
          positions.positions,
          target.afterFrom
        );
  if (at === null) return { location: null, root };
  const document = DocumentIndex.fromValue(
    authoredRootNodes(projection.value, root)
  );
  const boundary = document.childBoundaryAt(at);
  if (boundary) {
    return {
      location: {
        index: boundary.index,
        kind: 'children',
        path: boundary.parentPath,
      },
      root,
    };
  }

  return { location: rangeLocation(root, document, at, at), root };
};

const insertedContent = (
  target: AuthoredTarget,
  section: RootChangeJson[number],
  projection: DetailsProjection
): readonly AuthoredChangeContent[] => {
  const result: AuthoredChangeContent[] = [];
  const seen = new Set<string>();

  for (const span of target.inserted) {
    for (const location of authoredContentLocations(
      projection.positions,
      span
    )) {
      const from = location.from + location.fromOffset - location.span.offset;
      const to = location.from + location.toOffset - location.span.offset;
      const key = `${location.root}:${from}:${to}`;
      if (from >= to || seen.has(key)) continue;
      seen.add(key);
      const positions = readRecord(projection.positions, location.root);
      if (!positions?.present) continue;
      const document = DocumentIndex.fromValue(
        authoredRootNodes(projection.value, location.root)
      );
      result.push({
        content: createAuthoredRetainedSlice(
          document,
          from,
          to,
          positions.positions
        ).slice,
        location: rangeLocation(location.root, document, from, to),
        root: location.root,
      });
    }
  }

  if (result.length || !section.replacement?.length) return result;
  const root =
    authoredPositionRoot(
      projection.positions,
      target.root,
      target.from,
      'right'
    ) ?? target.root;
  const positions = readRecord(projection.positions, root);
  if (!positions?.present) return result;
  const from = resolveAuthoredPosition(
    positions.positions,
    target.from,
    'right',
    'collapse'
  );
  const to = resolveAuthoredPosition(
    positions.positions,
    target.to,
    'left',
    'collapse'
  );
  if (from === null || to === null || from > to) return result;
  const document = DocumentIndex.fromValue(
    authoredRootNodes(projection.value, root)
  );
  const replacement = PreparedTokenSlice.fromJSON(section.replacement);
  const projected = DocumentIndex.fromTokens(
    PreparedTokenSlice.concat([
      document.slice(0, from),
      replacement,
      document.slice(to),
    ])
  );
  const placement = targetLocation(target, projection);
  result.push({
    content: createAuthoredContentSlice(
      projected,
      from,
      from + replacement.length
    ),
    location: placement.location,
    root: placement.root,
  });

  return result;
};

const boundaryPoint = (
  target: AuthoredTarget,
  endpoint: NonNullable<
    ReturnType<typeof readAuthoredTextBoundary>
  >['position'],
  projection: DetailsProjection
): Readonly<{ point: Point | null; root: string }> => {
  const position = { left: null, right: endpoint };
  const root =
    authoredPositionRoot(
      projection.positions,
      target.root,
      position,
      'right'
    ) ?? target.root;
  const positions = readRecord(projection.positions, root);
  if (!positions?.present) return { point: null, root };
  const offset = resolveAuthoredPosition(
    positions.positions,
    position,
    'right',
    'collapse'
  );
  const point =
    offset === null
      ? null
      : DocumentIndex.fromValue(
          authoredRootNodes(projection.value, root)
        ).pointAt(offset, 1);

  return { point: point ? pointInRoot(point, root) : null, root };
};

const changedProperties = (
  value: Readonly<Record<string, unknown>>,
  keys: ReadonlySet<string>
) =>
  Object.freeze(
    Object.fromEntries(
      [...keys].flatMap((key) =>
        Object.hasOwn(value, key) ? [[key, value[key]]] : []
      )
    )
  );

const propertyPath = (
  target: AuthoredTarget,
  projection: DetailsProjection
): Readonly<{ path: readonly number[] | null; root: string }> => {
  const span = target.removed[0];
  if (!span) return { path: null, root: target.root };
  const location = authoredContentLocations(projection.positions, span).next()
    .value;
  if (!location) return { path: null, root: target.root };
  const document = DocumentIndex.fromValue(
    authoredRootNodes(projection.value, location.root)
  );
  const node = document.nodeStartingAt(
    location.from + span.offset - location.span.offset
  );

  return { path: node?.path ?? null, root: location.root };
};

const sameAuthoredContent = (
  left: readonly AuthoredSpan[],
  right: readonly AuthoredSpan[]
) => {
  let rightIndex = 0;
  let rightOffset = 0;
  for (const span of left) {
    let offset = 0;
    while (offset < span.length) {
      const other = right[rightIndex];
      if (
        !other ||
        span.origin !== other.origin ||
        span.offset + offset !== other.offset + rightOffset
      ) {
        return false;
      }
      const length = Math.min(span.length - offset, other.length - rightOffset);
      offset += length;
      rightOffset += length;
      if (rightOffset === other.length) {
        rightIndex += 1;
        rightOffset = 0;
      }
    }
  }

  return rightIndex === right.length;
};

const readReviews = (
  change: AuthoredRecord,
  state: AuthoredState
): readonly AuthoredChangeReview[] => {
  const reviews: AuthoredChangeReview[] = [];
  for (const [, identity] of records(change.reviews)) {
    const operation = readRecord(state.operations, identity);
    if (!operation || operation.kind === 'edit') continue;
    const review = {
      action: operation.action,
      active: change.heads.includes(operation.id),
      authorId: operation.authorId,
      changeIds: operation.selection.changes.map(({ id }) => id),
      createdAt: operation.time,
      id: operation.id,
    };
    reviews.push(
      operation.kind === 'undo'
        ? { ...review, kind: 'undo', undoOf: operation.undoOf }
        : {
            ...review,
            kind: operation.kind === 'decide' ? 'decision' : 'resolution',
            undoOf: null,
          }
    );
  }

  return reviews;
};

const readParts = (
  change: AuthoredRecord,
  state: AuthoredState,
  proposed: DetailsProjection
): AuthoredChangeDetails['parts'] => {
  const operations = [...records(change.operations)].flatMap(([, identity]) => {
    const operation = readRecord(state.operations, identity);
    return operation?.kind === 'edit' ? [operation] : [];
  });
  if (operations.some((operation) => !hasAuthoredContent(operation))) {
    return { reason: 'retention', status: 'unavailable' };
  }

  const items: AuthoredChangePart[] = [];
  for (const operation of operations) {
    if (!hasAuthoredContent(operation) || operation.retained) continue;
    for (const step of materializeAuthoredEdit(operation).steps) {
      const sectionFor = (target: AuthoredTarget) =>
        (target.root === 'main'
          ? step.forward.primary
          : step.forward.roots?.[target.root])?.[target.section];
      const moveDestinations = new Map<AuthoredTarget, AuthoredTarget>();
      const movedTargets = new Set<AuthoredTarget>();
      for (const target of step.targets) {
        const retained = readAuthoredRetainedContent(target);
        if (retained?.kind !== 'move') continue;
        const destination = step.targets.find(
          (candidate) =>
            candidate !== target &&
            candidate.removed.length === 0 &&
            sameAuthoredContent(target.removed, candidate.inserted)
        );
        if (destination) {
          moveDestinations.set(target, destination);
          movedTargets.add(destination);
        }
      }
      for (const target of step.targets) {
        if (movedTargets.has(target)) continue;
        const section = sectionFor(target);
        if (!section) continue;
        const boundary = readAuthoredTextBoundary(target, section);
        if (boundary) {
          const at = boundaryPoint(target, boundary.position, proposed);
          items.push({
            action: section.length === 0 ? 'split' : 'join',
            at: at.point,
            kind: 'boundary',
            root: at.root,
          });
          continue;
        }
        const retained = readAuthoredRetainedContent(target);
        if (section.properties && retained?.kind === 'properties') {
          const keys = new Set(
            section.properties.operations.map(({ key }) => key)
          );
          const after = applyPropertyModifications(
            retained.properties,
            section.properties.operations
          );
          if (!jsonEqual(retained.properties, after)) {
            const location = propertyPath(target, proposed);
            items.push({
              after: changedProperties(after, keys),
              before: changedProperties(retained.properties, keys),
              kind: 'properties',
              nodeKind: retained.nodeKind,
              path: location.path,
              root: location.root,
            });
          }
          continue;
        }
        if (!section.replacement) continue;

        const placement = targetLocation(target, proposed);
        const before =
          retained && retained.kind !== 'properties'
            ? {
                content: retained.slice,
                location: placement.location,
                root: placement.root,
              }
            : null;
        const destination = moveDestinations.get(target);
        const destinationSection = destination
          ? sectionFor(destination)
          : undefined;
        const after =
          destination && destinationSection
            ? insertedContent(destination, destinationSection, proposed)
            : insertedContent(target, section, proposed);
        const action =
          retained?.kind === 'move'
            ? ('move' as const)
            : before
              ? after.length
                ? ('replace' as const)
                : ('delete' as const)
              : ('insert' as const);

        if (!before && after.length === 0) continue;
        if (after.length === 0) {
          items.push({ action, after: null, before, kind: 'content' });
          continue;
        }
        after.forEach((content, index) => {
          items.push({
            action: index === 0 ? action : 'insert',
            after: content,
            before: index === 0 ? before : null,
            kind: 'content',
          });
        });
      }
      for (const target of step.rootTargets) {
        const before = target.before?.present ?? false;
        const after = target.after?.present ?? false;
        if (before !== after) {
          items.push({ after, before, kind: 'root', root: target.root });
        }
      }
    }
  }

  return { items: Object.freeze(items), status: 'available' };
};

const REVIEW_PARTS = new WeakMap<
  AuthoredState,
  Map<
    string,
    Readonly<{
      accepted: DetailsProjection;
      proposed: DetailsProjection;
      result: AuthoredChangeDetails['parts'];
    }>
  >
>();

/** Current review content, after amendments and their inverses are reconciled. */
export const readAuthoredReviewParts = (
  change: AuthoredRecord,
  accepted: DetailsProjection,
  proposed: DetailsProjection
): AuthoredChangeDetails['parts'] => {
  let reads = REVIEW_PARTS.get(proposed.state);
  if (!reads) {
    reads = new Map();
    REVIEW_PARTS.set(proposed.state, reads);
  }
  const cached = reads.get(change.id);
  if (
    cached?.accepted.positions === accepted.positions &&
    cached.accepted.value === accepted.value &&
    cached.proposed.positions === proposed.positions &&
    cached.proposed.value === proposed.value
  ) {
    return cached.result;
  }
  const operations = [...records(change.operations)].flatMap(([, identity]) => {
    const operation = readRecord(proposed.state.operations, identity);
    return operation?.kind === 'edit' ? [operation] : [];
  });
  if (operations.some((operation) => !hasAuthoredContent(operation))) {
    const result = { reason: 'retention', status: 'unavailable' } as const;
    reads.set(change.id, { accepted, proposed, result });
    return result;
  }

  type Interval = { from: number; root: string; to: number };
  const insertions: Interval[] = [];
  const boundaries: AuthoredSpan[] = [];
  const ownRemovals = readAuthoredRemovalIntervals(change, proposed.state);
  const boundaryItems: AuthoredChangePart[] = [];
  const hiddenBoundaries: Array<{
    origins: ReadonlySet<string>;
    part: AuthoredChangePart;
  }> = [];
  const boundaryKeys = new Set<string>();
  const roots = new Map<string, boolean>();
  const moves: Array<{
    after: Interval[];
    spans: readonly AuthoredSpan[];
  }> = [];
  const intervals = (spans: readonly AuthoredSpan[]) =>
    spans.flatMap((span) =>
      [...authoredContentLocations(proposed.positions, span)].map((entry) => ({
        from: entry.from + entry.fromOffset - entry.span.offset,
        root: entry.root,
        to: entry.from + entry.toOffset - entry.span.offset,
      }))
    );
  const containsSpan = (container: AuthoredSpan, span: AuthoredSpan) =>
    container.origin === span.origin &&
    container.offset <= span.offset &&
    container.offset + container.length >= span.offset + span.length;
  const boundaryTokens = (
    target: AuthoredTarget,
    section: RootChangeJson[number]
  ) => {
    if (section.length === 0) return section.replacement ?? [];
    const retained = readAuthoredRetainedContent(target);
    return retained && retained.kind !== 'properties'
      ? DocumentIndex.fromValue(retained.slice.content)
          .slice(retained.from, retained.to)
          .toJSON()
      : [];
  };
  const isElementBoundary = (tokens: ReturnType<typeof boundaryTokens>) =>
    tokens.length >= 2 &&
    tokens[0]?.kind === 'close' &&
    tokens.at(-1)?.kind === 'open' &&
    tokens.every(
      (token) =>
        (token.kind === 'open' || token.kind === 'close') &&
        token.nodeKind === 'element'
    );

  for (const operation of operations) {
    if (!hasAuthoredContent(operation)) continue;
    const { steps } = materializeAuthoredEdit(operation);
    let hasElementBoundary = false;
    let hasTextBoundary = false;
    for (const step of steps) {
      for (const target of step.targets) {
        const section = (
          target.root === 'main'
            ? step.forward.primary
            : step.forward.roots?.[target.root]
        )?.[target.section];
        if (!section) continue;
        hasTextBoundary ||= !!readAuthoredTextBoundary(target, section);
        hasElementBoundary ||= isElementBoundary(
          boundaryTokens(target, section)
        );
      }
    }
    for (const step of steps) {
      const movedTargets = new Set<AuthoredTarget>();
      for (const target of step.targets) {
        const retained = readAuthoredRetainedContent(target);
        if (retained?.kind !== 'move') continue;
        const destination = step.targets.find(
          (candidate) =>
            candidate !== target &&
            candidate.removed.length === 0 &&
            sameAuthoredContent(target.removed, candidate.inserted)
        );
        if (destination) {
          moves.push({
            after: intervals(destination.inserted),
            spans: target.removed,
          });
          movedTargets.add(target);
          movedTargets.add(destination);
        }
      }
      for (const target of step.targets) {
        if (movedTargets.has(target)) continue;
        const section = (
          target.root === 'main'
            ? step.forward.primary
            : step.forward.roots?.[target.root]
        )?.[target.section];
        if (!section) continue;
        const boundary = readAuthoredTextBoundary(target, section);
        if (boundary) {
          boundaries.push(...boundary.spans);
          const split = section.length === 0;
          const paragraphBoundary =
            hasElementBoundary ||
            boundaryTokens(target, section).some(
              (token) =>
                (token.kind === 'open' || token.kind === 'close') &&
                token.nodeKind === 'element'
            );
          const visible = split
            ? intervals(
                boundary.spans.filter((span) => span.birth === change.id)
              ).length > 0
            : boundary.spans.some(
                (span) =>
                  span.birth !== change.id &&
                  intervals([span]).length === 0 &&
                  (ownRemovals.get(span.origin) ?? []).some(
                    (own) =>
                      own.from < span.offset + span.length &&
                      own.to > span.offset
                  )
              );
          const key = JSON.stringify([
            split,
            boundary.spans.map(({ origin, offset, length }) => [
              origin,
              offset,
              length,
            ]),
          ]);
          if (paragraphBoundary && visible && !boundaryKeys.has(key)) {
            const at = boundaryPoint(target, boundary.position, proposed);
            boundaryItems.push({
              action: split ? 'split' : 'join',
              at: at.point,
              kind: 'boundary',
              root: at.root,
            });
            boundaryKeys.add(key);
          }
          if (paragraphBoundary && split && !visible) {
            const at = boundaryPoint(target, boundary.position, proposed);
            hiddenBoundaries.push({
              origins: new Set(boundary.spans.map((span) => span.origin)),
              part: {
                action: 'split',
                at: at.point,
                kind: 'boundary',
                root: at.root,
              },
            });
          }
          continue;
        }
        if (
          hasTextBoundary &&
          isElementBoundary(boundaryTokens(target, section))
        ) {
          boundaries.push(...target.inserted, ...target.removed);
          continue;
        }
        if (section.replacement) {
          insertions.push(
            ...intervals(
              target.inserted.filter((span) => span.birth === change.id)
            )
          );
        }
      }
      for (const target of step.rootTargets) {
        if (!roots.has(target.root)) {
          roots.set(target.root, target.before?.present ?? false);
        }
      }
    }
  }

  const documents = new Map<string, DocumentIndex>();
  const document = (root: string) => {
    let value = documents.get(root);
    if (!value) {
      value = DocumentIndex.fromValue(authoredRootNodes(proposed.value, root));
      documents.set(root, value);
    }
    return value;
  };
  const mergeIntervals = (values: readonly Interval[]) => {
    const sorted = values.toSorted(
      (left, right) =>
        left.root.localeCompare(right.root) ||
        left.from - right.from ||
        left.to - right.to
    );
    const result: Interval[] = [];
    for (const interval of sorted) {
      if (interval.from >= interval.to) continue;
      const previous = result.at(-1);
      if (previous?.root === interval.root && previous.to >= interval.from) {
        previous.to = Math.max(previous.to, interval.to);
      } else result.push({ ...interval });
    }
    return result;
  };
  const content = ({ root, from, to }: Interval): AuthoredChangeContent => ({
    content: createAuthoredContentSlice(document(root), from, to),
    location: rangeLocation(root, document(root), from, to),
    root,
  });
  const remaining = mergeIntervals(insertions);
  const items: AuthoredChangePart[] = [...boundaryItems];
  for (const fragment of readAuthoredMarkupFragments(
    change.id,
    accepted,
    proposed
  )) {
    if (fragment.kind === 'properties') {
      const keys = new Set(
        [
          ...new Set([
            ...Object.keys(fragment.before),
            ...Object.keys(fragment.after),
          ]),
        ].filter((key) => !jsonEqual(fragment.before[key], fragment.after[key]))
      );
      if (keys.size > 0) {
        items.push({
          after: changedProperties(fragment.after, keys),
          before: changedProperties(fragment.before, keys),
          kind: 'properties',
          nodeKind: fragment.nodeKind,
          path: fragment.path,
          root: fragment.root,
        });
      }
      continue;
    }
    const spans = readAuthoredFragmentOrder(fragment)?.spans ?? [];
    if (
      spans.length > 0 &&
      spans.every((span) =>
        boundaries.some((boundary) => containsSpan(boundary, span))
      )
    ) {
      continue;
    }
    const { placement } = fragment;
    const location: AuthoredChangeLocation | null = !placement
      ? null
      : placement.kind === 'children'
        ? placement
        : {
            kind: 'range',
            range: {
              anchor: pointInRoot(placement.point, fragment.root),
              focus: pointInRoot(placement.point, fragment.root),
            },
          };
    const before = {
      content: fragment.slice,
      location,
      root: fragment.root,
    };
    if (fragment.kind === 'move') {
      const move = moves.find((candidate) =>
        spans.some((span) =>
          candidate.spans.some((moved) => containsSpan(moved, span))
        )
      );
      const after = mergeIntervals(move?.after ?? []);
      items.push({
        action: 'move',
        after: after[0] ? content(after[0]) : null,
        before,
        kind: 'content',
      });
      continue;
    }
    const offset =
      placement?.kind === 'text'
        ? document(fragment.root).positionAt(placement.point)
        : null;
    const index = remaining.findIndex(
      (interval) =>
        interval.root === fragment.root &&
        offset !== null &&
        (interval.from === offset || interval.to === offset)
    );
    const after = index !== -1 ? remaining.splice(index, 1)[0] : null;
    items.push({
      action: after ? 'replace' : 'delete',
      after: after ? content(after) : null,
      before,
      kind: 'content',
    });
  }
  for (const interval of remaining) {
    items.push({
      action: 'insert',
      after: content(interval),
      before: null,
      kind: 'content',
    });
  }
  const recovered = new Map<string, Array<{ from: number; to: number }>>();
  for (const dependant of authoredDependants(proposed.state, change.id)) {
    for (const fragment of readAuthoredMarkupFragments(
      dependant.id,
      accepted,
      proposed
    )) {
      if (fragment.kind !== 'delete') continue;
      const fragmentSpans = readAuthoredFragmentOrder(fragment)?.spans ?? [];
      const hidden = hiddenBoundaries.find(
        (boundary) =>
          fragmentSpans.length > 0 &&
          fragmentSpans.every(
            (span) =>
              boundary.origins.has(span.origin) &&
              boundaries.some((candidate) => containsSpan(candidate, span))
          )
      );
      if (hidden) {
        if (!items.includes(hidden.part)) items.push(hidden.part);
        continue;
      }
      const projection = readAuthoredFragmentProjection(
        fragment,
        proposed.state
      );
      if (!projection) continue;
      const values: Interval[] = [];
      for (const span of fragmentSpans) {
        if (span.birth !== change.id) continue;
        let missing = [{ from: span.offset, to: span.offset + span.length }];
        for (const covered of recovered.get(span.origin) ?? []) {
          missing = missing.flatMap((range) =>
            covered.from >= range.to || covered.to <= range.from
              ? [range]
              : [
                  ...(covered.from > range.from
                    ? [{ from: range.from, to: covered.from }]
                    : []),
                  ...(covered.to < range.to
                    ? [{ from: covered.to, to: range.to }]
                    : []),
                ]
          );
        }
        recovered.set(span.origin, [
          ...(recovered.get(span.origin) ?? []),
          ...missing,
        ]);
        for (const range of missing) {
          for (const entry of authoredContentLocations(projection.positions, {
            ...span,
            offset: range.from,
            length: range.to - range.from,
          })) {
            values.push({
              from: entry.from + entry.fromOffset - entry.span.offset,
              root: entry.root,
              to: entry.from + entry.toOffset - entry.span.offset,
            });
          }
        }
      }
      for (const interval of mergeIntervals(values)) {
        const retained = DocumentIndex.fromValue(
          authoredRootNodes(projection.value, interval.root)
        );
        const { placement } = fragment;
        items.push({
          action: 'insert',
          after: {
            content: createAuthoredContentSlice(
              retained,
              interval.from,
              interval.to
            ),
            location:
              placement?.kind === 'text'
                ? {
                    kind: 'range',
                    range: {
                      anchor: pointInRoot(placement.point, fragment.root),
                      focus: pointInRoot(placement.point, fragment.root),
                    },
                  }
                : placement,
            root: fragment.root,
          },
          before: null,
          kind: 'content',
        });
      }
    }
  }
  for (const [root, before] of roots) {
    const after = readRecord(proposed.positions, root)?.present ?? false;
    if (before !== after) items.push({ after, before, kind: 'root', root });
  }
  const result = { items: Object.freeze(items), status: 'available' } as const;
  reads.set(change.id, { accepted, proposed, result });
  return result;
};

export const hasAuthoredReviewContent = (
  change: AuthoredRecord,
  accepted: DetailsProjection,
  proposed: DetailsProjection
) => {
  if (change.kind === 'insert') {
    const operations = records(change.operations);
    const first = operations.next().value;
    if (first && operations.next().done) {
      const operation = readRecord(proposed.state.operations, first[1]);
      if (operation?.kind === 'edit') {
        for (const step of authoredContributionSteps(operation)) {
          for (const target of step.targets) {
            for (const span of target.inserted) {
              if (
                span.birth === change.id &&
                !authoredContentLocations(proposed.positions, span).next().done
              ) {
                return true;
              }
            }
          }
        }
      }
    }
  }
  const parts = readAuthoredReviewParts(change, accepted, proposed);
  return parts.status === 'unavailable' || parts.items.length > 0;
};

const DETAIL_READS = new WeakMap<
  AuthoredState,
  Map<
    string,
    Array<
      Readonly<{
        currentPositions: AuthoredPositionRoots;
        currentValue: JsonEditorValue;
        proposedPositions: AuthoredPositionRoots;
        proposedValue: JsonEditorValue;
        acceptedPositions: AuthoredPositionRoots;
        acceptedValue: JsonEditorValue;
        result: AuthoredChangeDetails;
      }>
    >
  >
>();

export const readAuthoredChangeDetails = (
  change: AuthoredRecord,
  current: DetailsProjection,
  proposed: DetailsProjection,
  accepted: DetailsProjection
): AuthoredChangeDetails => {
  let reads = DETAIL_READS.get(current.state);
  if (!reads) {
    reads = new Map();
    DETAIL_READS.set(current.state, reads);
  }
  const previous = reads.get(change.id) ?? [];
  const cached = previous.find(
    (entry) =>
      entry.currentPositions === current.positions &&
      entry.currentValue === current.value &&
      entry.proposedPositions === proposed.positions &&
      entry.proposedValue === proposed.value &&
      entry.acceptedPositions === accepted.positions &&
      entry.acceptedValue === accepted.value
  );
  if (cached) return cached.result;
  const result = snapshotEditorJsonValue(
    {
      change: readAuthoredChange(
        change,
        current.state,
        current.positions,
        current.value
      ),
      parts:
        change.status === 'pending' || change.status === 'conflicted'
          ? readAuthoredReviewParts(change, accepted, proposed)
          : readParts(change, current.state, proposed),
      reviews: readReviews(change, current.state),
    },
    'Authored change details'
  );
  previous.unshift({
    currentPositions: current.positions,
    currentValue: current.value,
    proposedPositions: proposed.positions,
    proposedValue: proposed.value,
    acceptedPositions: accepted.positions,
    acceptedValue: accepted.value,
    result,
  });
  if (previous.length > 4) previous.pop();
  reads.set(change.id, previous);

  return result;
};
