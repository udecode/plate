import {
  authoredOriginSpans,
  authoredPositionSpans,
  createAuthoredPositions,
  replaceAuthoredPositions,
  resolveAuthoredPosition,
  type AuthoredPosition,
  type AuthoredPositions,
  type AuthoredSpan,
} from './positions';
import { readRecord, records } from './record-tree';
import {
  authoredOriginOperation,
  authoredContributionSteps,
  observesAuthoredOperation,
  type AuthoredContribution,
  type AuthoredEditIdentity,
  type AuthoredState,
} from './state';
import type { AuthoredPositionRoots, AuthoredTarget } from './steps';

export type AuthoredContentLocation = Readonly<{
  from: number;
  fromOffset: number;
  root: string;
  span: AuthoredSpan;
  to: number;
  toOffset: number;
}>;

export const isLaterAuthoredInsertion = (
  state: AuthoredState,
  operation: AuthoredEditIdentity | null,
  span: AuthoredSpan
) => {
  const insertion = authoredOriginOperation(state, span.origin);
  return (
    !!operation &&
    !!insertion &&
    insertion.id !== operation.id &&
    !observesAuthoredOperation(operation, insertion)
  );
};

export function* authoredContentLocations(
  positions: AuthoredPositionRoots,
  span: AuthoredSpan
): Generator<AuthoredContentLocation> {
  for (const [root, entry] of records(positions)) {
    if (!entry.present) continue;
    for (const current of authoredOriginSpans(entry.positions, span.origin, {
      from: span.offset,
      to: span.offset + span.length,
    })) {
      const from = Math.max(span.offset, current.span.offset);
      const to = Math.min(
        span.offset + span.length,
        current.span.offset + current.span.length
      );
      if (from < to) yield { ...current, fromOffset: from, toOffset: to, root };
    }
  }
}

export const authoredInsertionOrigin = (
  state: AuthoredState,
  span: AuthoredSpan
): Readonly<{
  position: AuthoredPosition;
  association: 'left' | 'right';
}> | null => {
  const operation = authoredOriginOperation(state, span.origin);
  if (!operation) return null;
  const previous: AuthoredTarget[] = [];
  for (const step of authoredContributionSteps(operation)) {
    for (const target of step.targets) {
      if (
        !target.inserted.some(
          (current) =>
            current.origin === span.origin &&
            current.offset <= span.offset &&
            span.offset < current.offset + current.length
        )
      ) {
        previous.push(target);
        continue;
      }
      if (!target.association && target.removed.length > 0) return null;
      let position = target.from;
      if (!target.association) {
        const removed = previous.findLast(
          (current) =>
            current.root === target.root &&
            current.removed.length > 0 &&
            current.inserted.length === 0 &&
            current.afterFrom.left?.origin === position.left?.origin &&
            current.afterFrom.left?.offset === position.left?.offset &&
            current.afterFrom.right?.origin === position.right?.origin &&
            current.afterFrom.right?.offset === position.right?.offset
        );
        if (removed) position = removed.to;
      }
      const association =
        target.association ?? (position.left ? 'left' : 'right');
      return { position, association };
    }
  }
  return null;
};

export const resolveConcurrentAuthoredInsertion = (
  state: AuthoredState,
  positions: AuthoredPositions,
  operationId: string,
  target: AuthoredTarget
): number | null => {
  const operation = readRecord(state.operations, operationId);
  if (!operation || target.removed.length || !target.inserted.length) {
    return null;
  }
  const left = target.from.left
    ? resolveAuthoredPosition(
        positions,
        { left: target.from.left, right: null },
        'left',
        'collapse'
      )
    : 0;
  const right = target.from.right
    ? resolveAuthoredPosition(
        positions,
        { left: null, right: target.from.right },
        'right',
        'collapse'
      )
    : (positions.root?.length ?? 0);
  if (left === null || right === null || left >= right) return null;
  const owner = (
    span: Pick<AuthoredSpan, 'origin' | 'offset'>,
    visited = new Set<string>()
  ): AuthoredContribution | null => {
    const identity = `${span.origin}:${span.offset}`;
    if (visited.has(identity)) return null;
    visited.add(identity);
    const origin = authoredOriginOperation(state, span.origin);
    if (!origin) return null;
    for (const step of authoredContributionSteps(origin)) {
      for (const inserted of step.targets) {
        if (
          !inserted.inserted.some(
            (current) =>
              current.origin === span.origin &&
              current.offset <= span.offset &&
              span.offset < current.offset + current.length
          )
        ) {
          continue;
        }
        if (
          inserted.from.left?.origin === target.from.left?.origin &&
          inserted.from.left?.offset === target.from.left?.offset &&
          inserted.from.right?.origin === target.from.right?.origin &&
          inserted.from.right?.offset === target.from.right?.offset
        ) {
          return origin;
        }
        for (const side of ['left', 'right'] as const) {
          const endpoint = inserted.from[side];
          if (!endpoint) continue;
          const ancestor = owner(
            {
              origin: endpoint.origin,
              offset: endpoint.offset - (side === 'left' ? 1 : 0),
            },
            visited
          );
          if (ancestor) return ancestor;
        }
      }
    }
    return null;
  };
  let concurrent = false;
  for (const entry of authoredPositionSpans(positions, left, right)) {
    const insertion = owner(entry.span);
    if (
      !insertion ||
      insertion.id === operation.id ||
      observesAuthoredOperation(operation, insertion)
    ) {
      continue;
    }
    concurrent = true;
    if (insertion.id > operation.id) return Math.max(left, entry.from);
  }
  return concurrent ? right : null;
};

export const authoredOriginalLocation = (
  state: AuthoredState,
  positions: AuthoredPositionRoots,
  span: AuthoredSpan
): Readonly<{
  offset: number;
  placement: string | null;
  root: string;
}> | null => {
  const visited = new Set<string>();
  const resolve = (
    current: AuthoredSpan,
    after = false
  ): ReturnType<typeof authoredOriginalLocation> => {
    const location = authoredContentLocations(positions, current).next().value;
    if (location) {
      return {
        offset:
          location.from +
          location.fromOffset -
          location.span.offset +
          (after ? 1 : 0),
        placement: location.span.placement,
        root: location.root,
      };
    }
    const key = JSON.stringify([current.origin, current.offset]);
    if (visited.has(key)) return null;
    visited.add(key);
    const origin = authoredInsertionOrigin(state, current);
    if (!origin) return null;
    const endpoint = origin.position[origin.association];
    return endpoint
      ? resolve(
          {
            ...current,
            origin: endpoint.origin,
            offset: endpoint.offset - (origin.association === 'left' ? 1 : 0),
            length: 1,
          },
          origin.association === 'left'
        )
      : null;
  };
  return resolve(span);
};

export const authoredCounterpartIntervals = (input: {
  from: number;
  to: number;
  operation: AuthoredEditIdentity | null;
  positions: AuthoredPositions;
  proposed: AuthoredPositionRoots;
  spans: readonly AuthoredSpan[];
  state: AuthoredState;
}) => {
  const intervals: Array<{ from: number; to: number; spans: AuthoredSpan[] }> =
    [];
  const originals = replaceAuthoredPositions(
    createAuthoredPositions(0, ''),
    0,
    0,
    input.spans
  );
  const append = (part: { from: number; to: number; span: AuthoredSpan }) => {
    const previous = intervals.at(-1);
    if (previous && previous.to === part.from) {
      previous.to = part.to;
      previous.spans.push(part.span);
    } else intervals.push({ from: part.from, to: part.to, spans: [part.span] });
  };
  let gap: Array<Parameters<typeof append>[0]> | null = [];
  for (const entry of authoredPositionSpans(
    input.positions,
    input.from,
    input.to
  )) {
    const from = Math.max(input.from, entry.from);
    const to = Math.min(input.to, entry.to);
    const span = {
      ...entry.span,
      offset: entry.span.offset + from - entry.from,
      length: to - from,
    };
    const hiddenInsertion =
      isLaterAuthoredInsertion(input.state, input.operation, span) &&
      authoredContentLocations(input.proposed, span).next().done;
    if (hiddenInsertion) {
      gap?.push({ from, to, span });
      continue;
    }
    const parts = [
      ...authoredOriginSpans(originals, span.origin, {
        from: span.offset,
        to: span.offset + span.length,
      }),
    ]
      .flatMap(({ span: original }) => {
        const start = Math.max(original.offset, span.offset);
        const end = Math.min(
          original.offset + original.length,
          span.offset + span.length
        );
        return start < end
          ? [
              {
                from: from + start - span.offset,
                to: from + end - span.offset,
                original,
              },
            ]
          : [];
      })
      .sort((left, right) => left.from - right.from);
    let cursor = from;
    for (const part of parts) {
      // A skipped original origin assigns the whole intervening gap to other targets.
      if (part.from > cursor) gap = null;
      gap?.forEach(append);
      const status = part.original?.placement
        ? readRecord(input.state.changes, part.original.placement)?.status
        : undefined;
      const restored = {
        ...span,
        offset: span.offset + part.from - from,
        length: part.to - part.from,
        placement:
          status === 'pending' || status === 'conflicted'
            ? (part.original?.placement ?? span.placement)
            : span.placement,
      };
      append({ from: part.from, to: part.to, span: restored });
      gap = [];
      cursor = part.to;
    }
    if (cursor < to) gap = null;
  }
  gap?.forEach(append);
  return intervals;
};
