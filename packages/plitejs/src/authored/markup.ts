import type { NativeAuthoredFragment } from '../core/authored-runtime';
import { ChangeDraft } from '../core/change/builder';
import { DocumentChange } from '../core/change/document-change';
import { DocumentIndex } from '../core/change/document-index';
import {
  applyPropertyModifications,
  invertPropertyModifications,
} from '../core/change/root-change';
import { jsonEqual, nodeProps } from '../core/change/tokens';
import { profileCoreDuration } from '../core/profiling';
import { inheritEditorProjectionIndexes } from '../core/public-state';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type {
  AnyEditor as Editor,
  EditorDocumentValue,
} from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import type { AuthoredRangeProjection } from './anchors';
import {
  authoredContentLocations,
  authoredInsertionOrigin,
  authoredCounterpartIntervals,
} from './counterparts';
import type { AuthoredFragmentOrder } from './fragment-order';
import {
  authoredPositionAt,
  authoredPositionSpans,
  resolveAuthoredPosition,
  type AuthoredSpan,
} from './positions';
import {
  matchingAuthoredProperties,
  restoreAuthoredProperties,
} from './properties';
import { readRecord, records, writeRecord } from './record-tree';
import {
  createAuthoredRetainedSlice,
  readAuthoredRetainedContent,
} from './retained';
import {
  authoredOrderKey,
  authoredContentRemovals,
  authoredTextPropertyWrites,
  authoredOperationPropertySteps,
  isAuthoredEditVisible,
  hasAuthoredContent,
  materializeAuthoredEdit,
  retainedAuthoredOperations,
  type AuthoredEdit,
  type AuthoredRecord,
  type AuthoredState,
} from './state';
import {
  authoredPositionRoot,
  authoredRootNodes,
  resolveAuthoredRetainedPosition,
  mapAuthoredChange,
  projectAuthoredTextProperties,
  type AuthoredTarget,
} from './steps';

type Interval = Readonly<{ from: number; to: number }>;

const FRAGMENT_PROJECTIONS = new WeakMap<
  NativeAuthoredFragment,
  Omit<AuthoredRangeProjection, 'state'>
>();
const FRAGMENT_BOUNDS = new WeakMap<
  NativeAuthoredFragment,
  Readonly<{ from: number; to: number }>
>();
const FRAGMENT_ORDER = new WeakMap<
  NativeAuthoredFragment,
  AuthoredFragmentOrder
>();

export const readAuthoredFragmentOrder = (fragment: NativeAuthoredFragment) =>
  FRAGMENT_ORDER.get(fragment) ?? null;

export const readAuthoredFragmentBounds = (fragment: NativeAuthoredFragment) =>
  FRAGMENT_BOUNDS.get(fragment) ?? null;

export const readAuthoredFragmentProjection = (
  fragment: NativeAuthoredFragment,
  state: AuthoredState
): AuthoredRangeProjection | null => {
  const projection = FRAGMENT_PROJECTIONS.get(fragment);
  return projection ? { ...projection, state } : null;
};

export const inheritAuthoredFragmentProjection = (
  editor: Editor,
  previous: NativeAuthoredFragment,
  current: NativeAuthoredFragment
) => {
  const before = FRAGMENT_PROJECTIONS.get(previous);
  const after = FRAGMENT_PROJECTIONS.get(current);
  if (!before || !after || before.value === after.value) return;
  const change = DocumentChange.between(before.value, after.value);
  const value = change.empty
    ? before.value
    : new ChangeDraft(before.value).apply(change).after;
  inheritEditorProjectionIndexes(
    editor,
    before.value as EditorDocumentValue,
    value as EditorDocumentValue,
    change
  );
  FRAGMENT_PROJECTIONS.set(current, { ...after, value });
};

const subtractIntervals = (input: Interval, removed: readonly Interval[]) => {
  let remaining = [input];
  for (const part of removed) {
    remaining = remaining.flatMap((range) => {
      if (part.from >= range.to || part.to <= range.from) return [range];
      return [
        ...(range.from < part.from
          ? [{ from: range.from, to: part.from }]
          : []),
        ...(part.to < range.to ? [{ from: part.to, to: range.to }] : []),
      ];
    });
  }
  return remaining;
};

const REMOVAL_INTERVALS = new WeakMap<
  AuthoredState,
  Map<string, ReadonlyMap<string, readonly Interval[]>>
>();

export const readAuthoredRemovalIntervals = (
  change: AuthoredRecord,
  state: AuthoredState
) => {
  let reads = REMOVAL_INTERVALS.get(state);
  if (!reads) {
    reads = new Map();
    REMOVAL_INTERVALS.set(state, reads);
  }
  const cached = reads.get(change.id);
  if (cached) return cached;
  const origins = new Map<string, Interval[]>();
  const update = (span: AuthoredSpan, remove: boolean) => {
    const range = { from: span.offset, to: span.offset + span.length };
    const values = (origins.get(span.origin) ?? []).flatMap((interval) =>
      subtractIntervals(interval, [range])
    );
    if (remove) values.push(range);
    values.sort((left, right) => left.from - right.from);
    const merged: Interval[] = [];
    for (const value of values) {
      const previous = merged.at(-1);
      if (previous && previous.to >= value.from) {
        merged[merged.length - 1] = {
          from: previous.from,
          to: Math.max(previous.to, value.to),
        };
      } else merged.push(value);
    }
    origins.set(span.origin, merged);
  };
  for (const [, identity] of records(change.operations)) {
    const operation = readRecord(state.operations, identity);
    if (!operation || !hasAuthoredContent(operation) || operation.retained) {
      continue;
    }
    for (const step of materializeAuthoredEdit(operation).steps) {
      const targets = step.targets.filter((target) => {
        const section = (
          target.root === 'main'
            ? step.forward.primary
            : step.forward.roots?.[target.root]
        )?.[target.section];
        return section?.replacement !== undefined;
      });
      for (const target of targets) {
        for (const span of target.removed) update(span, true);
      }
      for (const target of targets) {
        for (const span of target.inserted) update(span, false);
      }
    }
  }
  reads.set(change.id, origins);
  return origins;
};

const contentLocations = (
  projection: AuthoredRangeProjection,
  span: AuthoredSpan
) => authoredContentLocations(projection.positions, span);

const isRestoredMove = (
  target: AuthoredTarget,
  proposed: AuthoredRangeProjection
) => {
  const locations = target.removed.flatMap((span) => [
    ...contentLocations(proposed, span),
  ]);
  const first = locations[0];
  const last = locations.at(-1);
  if (
    !first ||
    !last ||
    locations.some((location) => location.root !== target.root)
  ) {
    return false;
  }
  const root = readRecord(proposed.positions, target.root);
  if (!root?.present) return false;
  const before = target.from.left
    ? resolveAuthoredPosition(
        root.positions,
        { left: target.from.left, right: null },
        'left'
      )
    : 0;
  const after = target.to.right
    ? resolveAuthoredPosition(
        root.positions,
        { left: null, right: target.to.right },
        'right'
      )
    : (root.positions.root?.length ?? 0);
  return (
    before === first.from + first.fromOffset - first.span.offset &&
    after === last.from + last.toOffset - last.span.offset
  );
};

const placement = (
  target: AuthoredTarget,
  projection: AuthoredRangeProjection
): Pick<NativeAuthoredFragment, 'placement' | 'root'> => {
  const root =
    authoredPositionRoot(
      projection.positions,
      target.root,
      target.afterFrom,
      'right'
    ) ?? target.root;
  const positions = readRecord(projection.positions, root);
  if (!positions?.present) return { placement: null, root };
  const at =
    !target.afterFrom.left && !target.afterFrom.right
      ? 0
      : resolveAuthoredRetainedPosition(
          projection.state,
          positions.positions,
          target.afterFrom
        );
  if (at === null) return { placement: null, root };
  const document = DocumentIndex.fromValue(
    authoredRootNodes(projection.value, root)
  );
  const boundary = document.childBoundaryAt(at);
  if (boundary) {
    return {
      placement: {
        kind: 'children',
        path: boundary.parentPath,
        index: boundary.index,
      },
      root,
    };
  }
  const point = document.pointAt(at, 1);
  return { placement: point ? { kind: 'text', point } : null, root };
};

const acceptedCounterpart = (
  accepted: AuthoredRangeProjection,
  spans: readonly AuthoredSpan[]
) => {
  if (
    !spans.length ||
    spans.some(
      (span) =>
        span.birth !== null &&
        readRecord(accepted.state.changes, span.birth)?.status !== 'accepted'
    )
  ) {
    return undefined;
  }
  const locations = spans.flatMap((span) => [
    ...contentLocations(accepted, span),
  ]);
  const start = locations[0];
  const end = locations.at(-1);
  if (!start || !end) return null;
  if (start.root !== end.root) return undefined;
  const from = start.from + start.fromOffset - start.span.offset;
  const to = end.from + end.toOffset - end.span.offset;
  if (from >= to) return null;
  return createAuthoredRetainedSlice(
    DocumentIndex.fromValue(authoredRootNodes(accepted.value, start.root)),
    from,
    to,
    getDefined(readRecord(accepted.positions, start.root)).positions,
    accepted.value.roots
  );
};

const canJoinAcceptedCounterparts = (
  before: AuthoredSpan,
  after: AuthoredSpan,
  accepted: AuthoredRangeProjection,
  proposed: AuthoredRangeProjection,
  operation: AuthoredEdit
) => {
  const left = [...contentLocations(accepted, before)].at(-1);
  const right = contentLocations(accepted, after).next().value;
  if (!left || !right) return true;
  if (left.root !== right.root) return false;
  const from = left.from + left.toOffset - left.span.offset;
  const to = right.from + right.fromOffset - right.span.offset;
  if (from >= to) return from === to;
  const { positions } = getDefined(readRecord(accepted.positions, left.root));
  const intervals = authoredCounterpartIntervals({
    from,
    to,
    operation,
    positions,
    proposed: proposed.positions,
    spans: [],
    state: accepted.state,
  });
  return (
    intervals.length === 1 &&
    intervals[0].from === from &&
    intervals[0].to === to
  );
};

const compileAuthoredMarkupFragments = (
  changeId: string,
  accepted: AuthoredRangeProjection,
  proposed: AuthoredRangeProjection
): readonly NativeAuthoredFragment[] => {
  const { state } = proposed;
  const change = readRecord(state.changes, changeId);
  if (
    !change ||
    (change.status !== 'pending' && change.status !== 'conflicted')
  ) {
    return [];
  }
  const result: NativeAuthoredFragment[] = [];
  const ownRemovals = readAuthoredRemovalIntervals(change, state);
  const claimed = new Map<string, Interval[]>();
  const properties = new Map<
    string,
    {
      fragment: Extract<NativeAuthoredFragment, { kind: 'properties' }>;
      writers: Readonly<Record<string, string>>;
    }
  >();
  const operations = [...retainedAuthoredOperations(state, change)];
  for (const operation of operations) {
    if (operation?.kind !== 'edit') continue;
    for (const [stepIndex, step] of operation.steps.entries()) {
      for (const target of step.targets) {
        const retained = readAuthoredRetainedContent(target);
        if (!retained || retained.kind === 'properties') continue;
        if (retained.kind === 'move' && isRestoredMove(target, proposed)) {
          continue;
        }
        const runs: Array<{
          accepted: boolean;
          from: number;
          to: number;
          spans: AuthoredSpan[];
        }> = [];
        const cuts = new Map<string, Set<number>>();
        const livePositions = readRecord(
          proposed.positions,
          target.root
        )?.positions;
        if (livePositions) {
          const start = resolveAuthoredPosition(
            livePositions,
            { left: target.afterFrom.left, right: null },
            'left',
            'collapse'
          );
          const end = resolveAuthoredPosition(
            livePositions,
            { left: null, right: target.afterFrom.right },
            'right',
            'collapse'
          );
          if (start !== null && end !== null && start < end) {
            for (const entry of authoredPositionSpans(
              livePositions,
              start,
              end
            )) {
              const insertion = authoredInsertionOrigin(state, entry.span);
              const anchor =
                insertion?.association === 'left'
                  ? (insertion.position.left ?? insertion.position.right)
                  : (insertion?.position.right ?? insertion?.position.left);
              if (!anchor) continue;
              const at = resolveAuthoredPosition(
                retained.positions,
                { left: anchor, right: anchor },
                'right',
                'collapse'
              );
              if (at === null || at <= retained.from || at >= retained.to) {
                continue;
              }
              const offsets = cuts.get(anchor.origin) ?? new Set<number>();
              offsets.add(anchor.offset);
              cuts.set(anchor.origin, offsets);
            }
          }
        }
        for (const span of target.removed) {
          const locations = [...contentLocations(accepted, span)].sort(
            (left, right) => left.fromOffset - right.fromOffset
          );
          for (let index = 1; index < locations.length; index++) {
            const before = locations[index - 1];
            const after = locations[index];
            if (
              before.toOffset === after.fromOffset &&
              !canJoinAcceptedCounterparts(
                {
                  ...span,
                  offset: before.fromOffset,
                  length: before.toOffset - before.fromOffset,
                },
                {
                  ...span,
                  offset: after.fromOffset,
                  length: after.toOffset - after.fromOffset,
                },
                accepted,
                proposed,
                operation
              )
            ) {
              const offsets = cuts.get(span.origin) ?? new Set<number>();
              offsets.add(after.fromOffset);
              cuts.set(span.origin, offsets);
            }
          }
        }
        let offset = 0;
        for (const span of target.removed) {
          if (
            span.birth !== changeId &&
            (retained.kind !== 'move' || span.placement !== changeId)
          ) {
            const current = [...contentLocations(proposed, span)];
            const visible =
              retained.kind === 'move'
                ? current
                    .filter((entry) => entry.span.placement === changeId)
                    .map((entry) => ({
                      from: entry.fromOffset,
                      to: entry.toOffset,
                    }))
                : subtractIntervals(
                    { from: span.offset, to: span.offset + span.length },
                    current.map((entry) => ({
                      from: entry.fromOffset,
                      to: entry.toOffset,
                    }))
                  );
            const removed =
              retained.kind === 'move'
                ? visible
                : visible.flatMap((part) =>
                    (ownRemovals.get(span.origin) ?? []).flatMap((own) => {
                      const from = Math.max(part.from, own.from);
                      const to = Math.min(part.to, own.to);
                      return from < to ? [{ from, to }] : [];
                    })
                  );
            const directRemovals = [...authoredContentRemovals(state, span)]
              .filter(
                (entry) =>
                  entry.value.changeId !== changeId &&
                  isAuthoredEditVisible(
                    state,
                    entry.value,
                    (edit) =>
                      readRecord(state.changes, edit.changeId)?.status ===
                      'accepted'
                  )
              )
              .flatMap((entry) =>
                // A later visible restore keeps the text accepted, so only the
                // part still missing from the accepted projection is removed.
                subtractIntervals(
                  { from: entry.from, to: entry.to },
                  [...contentLocations(accepted, span)].map((location) => ({
                    from: location.fromOffset,
                    to: location.toOffset,
                  }))
                )
              );
            const birth = span.birth && readRecord(state.changes, span.birth);
            for (const interval of (birth && birth.status === 'rejected'
              ? []
              : removed
            ).flatMap((part) =>
              subtractIntervals(part, [
                ...(claimed.get(span.origin) ?? []),
                ...directRemovals,
              ]).flatMap((remainder) => {
                const boundaries = [
                  remainder.from,
                  ...[...(cuts.get(span.origin) ?? [])]
                    .filter((cut) => remainder.from < cut && cut < remainder.to)
                    .sort((a, b) => a - b),
                  remainder.to,
                ];
                return boundaries
                  .slice(1)
                  .map((to, index) => ({ from: boundaries[index], to }));
              })
            )) {
              const from = offset + interval.from - span.offset;
              const to = offset + interval.to - span.offset;
              const piece = {
                ...span,
                offset: interval.from,
                length: interval.to - interval.from,
              };
              const isAccepted =
                span.birth === null ||
                readRecord(state.changes, span.birth)?.status === 'accepted';
              const previous = runs.at(-1);
              if (
                previous?.to === from &&
                !cuts.get(span.origin)?.has(interval.from) &&
                previous.accepted === isAccepted &&
                (!isAccepted ||
                  canJoinAcceptedCounterparts(
                    getDefined(previous.spans.at(-1)),
                    piece,
                    accepted,
                    proposed,
                    operation
                  ))
              ) {
                previous.to = to;
                previous.spans.push(piece);
              } else {
                runs.push({ accepted: isAccepted, from, to, spans: [piece] });
              }
              const used = claimed.get(span.origin) ?? [];
              used.push(interval);
              claimed.set(span.origin, used);
            }
          }
          offset += span.length;
        }
        for (const run of runs) {
          const { tokens } = DocumentIndex.fromValue(
            retained.slice.content
          ).slice(retained.from + run.from, retained.from + run.to);
          // Text boundaries reconcile leaf shape without retaining visible content.
          if (
            !tokens.some(
              (token) => token.kind === 'text' || token.nodeKind === 'element'
            )
          ) {
            continue;
          }
          const currentAccepted = acceptedCounterpart(accepted, run.spans);
          if (currentAccepted === null) continue;
          let fragment =
            currentAccepted ??
            (run.from === 0 && run.to === retained.to - retained.from
              ? retained
              : createAuthoredRetainedSlice(
                  DocumentIndex.fromValue(retained.slice.content),
                  retained.from + run.from,
                  retained.from + run.to,
                  retained.positions,
                  retained.slice.roots
                ));
          const id = JSON.stringify([
            operation.id,
            target.root,
            stepIndex,
            target.section,
            run.from,
          ]);
          let projection: AuthoredRangeProjection = {
            positions: writeRecord(null, target.root, {
              birth: null,
              positions: fragment.positions,
              present: true,
            }),
            state,
            value:
              target.root === 'main'
                ? { children: fragment.slice.content }
                : {
                    children: Object.freeze([]),
                    roots: { [target.root]: fragment.slice.content },
                  },
          };
          for (const [, amendmentId] of records(change.operations)) {
            const amendment = readRecord(state.operations, amendmentId);
            if (
              amendment?.kind !== 'edit' ||
              amendment.retained !== id ||
              !hasAuthoredContent(amendment)
            ) {
              continue;
            }
            const mapped = mapAuthoredChange({
              state,
              changeId,
              operationId: amendment.id,
              direction: 'forward',
              positions: projection.positions,
              value: projection.value,
              steps: materializeAuthoredEdit(amendment).steps,
            });
            const { after } = new ChangeDraft(projection.value).apply(
              mapped.change
            );
            const nodes = authoredRootNodes(after, target.root);
            const beforeLength = DocumentIndex.fromValue(
              fragment.slice.content
            ).length;
            fragment = {
              from: fragment.from,
              positions: getDefined(readRecord(mapped.positions, target.root))
                .positions,
              slice: {
                ...fragment.slice,
                content: nodes as typeof fragment.slice.content,
              },
              to:
                fragment.to +
                DocumentIndex.fromValue(nodes).length -
                beforeLength,
            };
            projection = { state, positions: mapped.positions, value: after };
          }
          const propertyOperations = new Set<string>();
          for (const span of run.spans) {
            for (const write of authoredTextPropertyWrites(state, span)) {
              propertyOperations.add(write.value.operation.id);
            }
          }
          if (propertyOperations.size) {
            const mapped = projectAuthoredTextProperties({
              before: projection.value,
              change: DocumentChange.empty,
              changeId,
              operationId: operation.id,
              positions: projection.positions,
              value: projection.value,
              properties: {
                state,
                isVisible: (edit) =>
                  readRecord(state.changes, edit.changeId)?.status !==
                  'rejected',
              },
              steps: [...propertyOperations].flatMap((propertyOperationId) => {
                const op = readRecord(state.operations, propertyOperationId);
                return op?.kind === 'edit'
                  ? authoredOperationPropertySteps(state, op)
                  : [];
              }),
            });
            if (
              !mapped.change.empty ||
              mapped.positions !== projection.positions
            ) {
              const { after } = new ChangeDraft(projection.value).apply(
                mapped.change
              );
              const nodes = authoredRootNodes(after, target.root);
              const delta =
                DocumentIndex.fromValue(nodes).length -
                DocumentIndex.fromValue(fragment.slice.content).length;
              fragment = {
                ...fragment,
                slice: {
                  ...fragment.slice,
                  content: nodes as typeof fragment.slice.content,
                },
                positions: getDefined(readRecord(mapped.positions, target.root))
                  .positions,
                to: fragment.to + delta,
              };
              projection = { state, positions: mapped.positions, value: after };
            }
          }
          const document = DocumentIndex.fromValue(fragment.slice.content);
          const anchor = document.pointAt(fragment.from, 1);
          const focus = document.pointAt(fragment.to, -1);
          const descriptor = snapshotEditorJsonValue(
            {
              authorId: change.authorId,
              changeId,
              id,
              kind: retained.kind,
              ...placement(
                {
                  ...target,
                  afterFrom: cuts.size
                    ? authoredPositionAt(
                        retained.positions,
                        retained.from + run.from
                      )
                    : target.afterFrom,
                },
                proposed
              ),
              range: anchor && focus ? { anchor, focus } : null,
              slice: fragment.slice,
            },
            'Authored retained fragment'
          );
          const { root } = descriptor;
          FRAGMENT_ORDER.set(descriptor, {
            after: target.to.right,
            before: target.from.left,
            key: `${authoredOrderKey(operation.clock, operation.id)}:${
              descriptor.id
            }`,
            position: target.afterFrom,
            spans: run.spans,
          });
          FRAGMENT_BOUNDS.set(descriptor, {
            from: fragment.from,
            to: fragment.to,
          });
          FRAGMENT_PROJECTIONS.set(descriptor, {
            positions: writeRecord(null, root, {
              birth: null,
              positions: fragment.positions,
              present: true,
            }),
            value:
              root === 'main'
                ? { children: fragment.slice.content }
                : {
                    children: Object.freeze([]),
                    roots: { [root]: fragment.slice.content },
                  },
          });
          result.push(descriptor);
        }
      }
    }
  }
  for (const operation of operations.reverse()) {
    if (
      operation?.kind !== 'edit' ||
      operation.inverseOf ||
      !isAuthoredEditVisible(
        state,
        operation,
        (edit) =>
          readRecord(state.changes, edit.changeId)?.status !== 'rejected'
      )
    ) {
      continue;
    }
    for (const step of [...operation.steps].reverse()) {
      for (const target of step.targets) {
        const retained = readAuthoredRetainedContent(target);
        if (retained?.kind !== 'properties') continue;
        const forward = (
          target.root === 'main'
            ? step.forward.primary
            : step.forward.roots?.[target.root]
        )?.[target.section].properties;
        if (!forward) continue;
        const inverse = invertPropertyModifications(
          retained.properties,
          forward.operations
        );
        const spans = retained.spans ?? target.removed.slice(0, 1);
        for (const span of spans) {
          if (span.birth === changeId) continue;
          for (const entry of contentLocations(proposed, span)) {
            const document = DocumentIndex.fromValue(
              authoredRootNodes(proposed.value, entry.root)
            );
            const position = entry.from + entry.fromOffset - entry.span.offset;
            const node =
              retained.nodeKind === 'text'
                ? document.textAt(position)
                : document.nodeStartingAt(position);
            if (!node) continue;
            const id = JSON.stringify([changeId, entry.root, node.path]);
            const existing = properties.get(id);
            const after = nodeProps(document.node(node.path));
            const writers = existing?.writers ?? entry.span.properties;
            const modifications = matchingAuthoredProperties(
              writers,
              inverse,
              target.inserted[0]?.properties ?? {}
            );
            const before = applyPropertyModifications(
              existing?.fragment.before ?? after,
              modifications
            );
            properties.set(id, {
              fragment: {
                authorId: change.authorId,
                changeId,
                id,
                kind: 'properties',
                placement: {
                  kind: 'children',
                  path: node.path.slice(0, -1),
                  index: getDefined(node.path.at(-1)),
                },
                root: entry.root,
                after,
                before,
                nodeKind: retained.nodeKind,
                path: node.path,
              },
              writers: restoreAuthoredProperties(
                writers,
                span.properties,
                modifications
              ),
            });
          }
        }
      }
    }
  }
  for (const { fragment } of properties.values()) {
    if (!jsonEqual(fragment.before, fragment.after)) {
      result.push(
        snapshotEditorJsonValue(fragment, 'Authored property fragment')
      );
    }
  }
  return Object.freeze(result);
};

const FRAGMENT_READS = new WeakMap<
  AuthoredState,
  Map<
    string,
    {
      accepted: AuthoredRangeProjection['value'];
      proposed: AuthoredRangeProjection['value'];
      result: readonly NativeAuthoredFragment[];
    }
  >
>();

export const readAuthoredMarkupFragments = (
  changeId: string,
  accepted: AuthoredRangeProjection,
  proposed: AuthoredRangeProjection
) => {
  let reads = FRAGMENT_READS.get(proposed.state);
  if (!reads) {
    reads = new Map();
    FRAGMENT_READS.set(proposed.state, reads);
  }
  const cached = reads.get(changeId);
  if (
    cached?.accepted === accepted.value &&
    cached.proposed === proposed.value
  ) {
    return cached.result;
  }
  const result = profileCoreDuration('authored-markup', () =>
    compileAuthoredMarkupFragments(changeId, accepted, proposed)
  );
  reads.set(changeId, {
    accepted: accepted.value,
    proposed: proposed.value,
    result,
  });
  return result;
};
