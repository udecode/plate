import { DocumentIndex } from '../core/change/document-index';
import type { JsonEditorValue } from '../core/change/tokens';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type { Selection } from '../interfaces/editor';
import { PathApi } from '../interfaces/path';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import { getDefined } from '../internal/get-defined';
import {
  authoredPositionAt,
  decodeAuthoredPosition,
  resolveAuthoredPosition,
  type AuthoredPosition,
  type AuthoredPositions,
} from './positions';
import { readRecord } from './record-tree';
import {
  authoredContributionSteps,
  authoredOriginOperation,
  type AuthoredState,
} from './state';
import {
  authoredPositionRoot,
  authoredRootNodes,
  type AuthoredPositionRoots,
} from './steps';

export type AuthoredSelectionPosition = Readonly<{
  association: 'left' | 'right';
  position: AuthoredPosition;
}>;

export type AuthoredViewSelection = Readonly<{
  points: readonly AuthoredSelectionPosition[];
  root: string;
  selection: NonNullable<Selection>;
}> | null;

export const decodeAuthoredViewSelection = (
  value: unknown
): AuthoredViewSelection => {
  if (value === null) return null;
  const record = (
    input: unknown,
    keys: readonly string[]
  ): Record<string, unknown> => {
    if (
      !input ||
      typeof input !== 'object' ||
      Array.isArray(input) ||
      Object.keys(input).length !== keys.length ||
      Object.keys(input).some((key) => !keys.includes(key))
    ) {
      throw new Error('Invalid authored history selection.');
    }
    return input as Record<string, unknown>;
  };
  const captured = record(value, ['points', 'root', 'selection']);
  if (
    typeof captured.root !== 'string' ||
    !captured.root ||
    captured.root.includes('\u0000') ||
    !captured.selection ||
    !SelectionApi.isSelection(captured.selection) ||
    !Array.isArray(captured.points)
  ) {
    throw new Error('Invalid authored history selection.');
  }
  const { selection } = captured;
  if (
    captured.points.length !==
    (SelectionApi.isNode(selection) ? selection.paths.length : 2)
  ) {
    throw new Error('Invalid authored history selection points.');
  }
  const points = captured.points.map((input) => {
    const point = record(input, ['association', 'position']);
    if (point.association !== 'left' && point.association !== 'right') {
      throw new Error('Invalid authored history selection association.');
    }
    return {
      association: point.association,
      position: decodeAuthoredPosition(point.position),
    } satisfies AuthoredSelectionPosition;
  });
  return snapshotEditorJsonValue(
    { points, root: captured.root, selection },
    'Authored history selection'
  );
};

export const captureAuthoredSelection = (
  selection: Selection,
  root: string,
  roots: AuthoredPositionRoots,
  value: JsonEditorValue
): AuthoredViewSelection => {
  if (!selection) return null;
  const positions = readRecord(roots, root)?.positions;
  if (!positions) throw new Error('Missing authored selection root.');
  const document = DocumentIndex.fromValue(authoredRootNodes(value, root));
  const capture = (
    position: number,
    association: 'left' | 'right'
  ): AuthoredSelectionPosition => ({
    association,
    position: authoredPositionAt(positions, position),
  });
  const affinity =
    SelectionApi.isText(selection) && selection.affinity === 'backward'
      ? 'left'
      : 'right';
  const points = SelectionApi.isNode(selection)
    ? selection.paths.map((path) =>
        capture(document.nodeRange(path).from, 'right')
      )
    : RangeApi.isCollapsed(selection)
      ? [
          capture(document.positionAt(selection.anchor), affinity),
          capture(document.positionAt(selection.focus), affinity),
        ]
      : [
          capture(
            document.positionAt(selection.anchor),
            RangeApi.isBackward(selection) ? 'left' : 'right'
          ),
          capture(
            document.positionAt(selection.focus),
            RangeApi.isBackward(selection) ? 'right' : 'left'
          ),
        ];
  return snapshotEditorJsonValue(
    { points, root, selection },
    'Authored view selection'
  );
};

const resolveViewPosition = (
  position: AuthoredPosition,
  association: 'left' | 'right',
  index: AuthoredPositions,
  root: string,
  state: AuthoredState,
  visited = new Set<AuthoredPosition>()
): number | null => {
  if (visited.has(position)) return null;
  visited.add(position);
  const resolved = resolveAuthoredPosition(
    index,
    position,
    association,
    'collapse'
  );
  if (resolved !== null) return resolved;
  for (const side of association === 'left'
    ? (['left', 'right'] as const)
    : (['right', 'left'] as const)) {
    const endpoint = position[side];
    if (!endpoint) continue;
    const operation = authoredOriginOperation(state, endpoint.origin);
    if (operation?.kind !== 'edit') continue;
    for (const target of authoredContributionSteps(operation).flatMap(
      (step) => step.targets
    )) {
      if (target.root !== root) continue;
      if (
        !target.inserted.some(
          (span) =>
            span.origin === endpoint.origin &&
            span.offset <= endpoint.offset &&
            endpoint.offset <= span.offset + span.length
        )
      ) {
        continue;
      }
      const mapped = resolveViewPosition(
        association === 'left' ? target.from : target.to,
        association,
        index,
        root,
        state,
        visited
      );
      if (mapped !== null) return mapped;
    }
  }
  return null;
};

export const resolveAuthoredSelection = (
  captured: AuthoredViewSelection,
  roots: AuthoredPositionRoots,
  value: JsonEditorValue,
  state: AuthoredState
): Selection => {
  if (!captured) return null;
  const { selection } = captured;
  const pointRoots = captured.points.map(
    ({ position, association }) =>
      authoredPositionRoot(roots, captured.root, position, association) ??
      captured.root
  );
  const root = pointRoots[0] ?? captured.root;
  if (pointRoots.some((current) => current !== root)) return null;
  const positions = readRecord(roots, root);
  if (!positions?.present) return null;
  const document = DocumentIndex.fromValue(authoredRootNodes(value, root));
  const resolved = captured.points.map(({ position, association }) =>
    resolveViewPosition(position, association, positions.positions, root, state)
  );
  if (SelectionApi.isNode(selection)) {
    const paths = resolved.map((position) =>
      position === null ? null : document.nodeStartingAt(position)?.path
    );
    if (paths.some((path) => !path)) return null;
    const retainedPaths = paths.map((path) => [...getDefined(path)]);
    return SelectionApi.nodes(
      [getDefined(retainedPaths[0]), ...retainedPaths.slice(1)],
      {
        anchorPath:
          retainedPaths[
            selection.paths.findIndex((path) =>
              PathApi.equals(path, selection.anchorPath)
            )
          ],
        focusPath:
          retainedPaths[
            selection.paths.findIndex((path) =>
              PathApi.equals(path, selection.focusPath)
            )
          ],
        ...(root === 'main' ? {} : { root }),
      }
    );
  }
  const points = resolved.map((position, index) => {
    const point =
      position === null
        ? null
        : document.pointAt(
            position,
            captured.points[index].association === 'left' ? -1 : 1
          );
    return point ? { ...point, ...(root === 'main' ? {} : { root }) } : null;
  });
  const [anchor, focus] = points;
  return anchor && focus
    ? Object.freeze({ ...selection, anchor, focus })
    : null;
};
