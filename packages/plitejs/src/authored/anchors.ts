import type { AnchorOptions } from '../core/anchor';
import type { NativeAuthoredRangeBinding } from '../core/authored-runtime';
import { DocumentIndex } from '../core/change/document-index';
import { getRangeEndpointAssociations } from '../core/change/range-association';
import type { JsonEditorValue } from '../core/change/tokens';
import { snapshotEditorJsonValue } from '../core/value-codec';
import type { AnyEditor as Editor } from '../interfaces/editor';
import type { Path } from '../interfaces/path';
import { RangeApi, type Range } from '../interfaces/range';
import { getDefined } from '../internal/get-defined';
import {
  authoredOriginSpans,
  authoredPositionAt,
  authoredPositionContentBounds,
  authoredPositionSpans,
  decodeAuthoredPosition,
  resolveAuthoredPosition,
  type AuthoredPosition,
} from './positions';
import { readRecord, records } from './record-tree';
import {
  authoredContentLineage,
  authoredOriginOperation,
  type AuthoredState,
} from './state';
import {
  authoredPositionRoot,
  authoredRootNodes,
  type AuthoredPositionRoots,
} from './steps';

type RetainedRange = Readonly<{
  anchor: AuthoredPosition;
  content: ReadonlyArray<
    Readonly<{
      length: number;
      offset: number;
      origin: string;
    }>
  >;
  documentId: string;
  direction: 'backward' | 'collapsed' | 'forward';
  focus: AuthoredPosition;
  root: string;
}>;

export type AuthoredRangeProjection = Readonly<{
  positions: AuthoredPositionRoots;
  state: AuthoredState;
  value: JsonEditorValue;
}>;

export const bindAuthoredDocumentPath = (
  path: Path,
  options: AnchorOptions<Path>,
  read: (view?: Editor) => AuthoredRangeProjection | null,
  isAborted: () => boolean,
  draftPath?: () => Path | null | undefined
) => {
  const root = options.root ?? 'main';
  const initial = read();
  if (!initial) {
    throw new Error('Install authored changes before binding a path.');
  }
  const { documentId } = initial.state;
  const capture = (
    currentPath: Path | null,
    current: AuthoredRangeProjection
  ) => {
    if (!currentPath) return null;
    const positions = readRecord(current.positions, root);
    if (!positions?.present) {
      throw new Error('Cannot anchor a missing document root.');
    }
    if (!currentPath.length) return { kind: 'root' as const };
    const document = DocumentIndex.fromValue(
      authoredRootNodes(current.value, root)
    );
    let start: number;
    let kind: 'node' | 'boundary';
    try {
      start = document.nodeRange(currentPath).from;
      kind = 'node';
    } catch {
      start = document.childPosition(
        currentPath.slice(0, -1),
        getDefined(currentPath.at(-1))
      );
      kind = 'boundary';
    }
    return { kind, position: authoredPositionAt(positions.positions, start) };
  };
  let retained = capture(path, initial);
  return {
    resolve(view?: Editor): Path | null {
      if (isAborted()) return null;
      const draft = draftPath?.();
      if (draft !== undefined) {
        if (!view) return draft;
        const captureProjection = read();
        if (!captureProjection) return null;
        retained = capture(draft, captureProjection);
      }
      const current = read(view);
      if (!current || current.state.documentId !== documentId || !retained) {
        return null;
      }
      const positions = readRecord(current.positions, root);
      if (!positions?.present) return null;
      if (retained.kind === 'root') return [];
      const { position } = retained;
      if (retained.kind === 'node' && options.deletion === 'drop') {
        const endpoint = position.right;
        if (
          !endpoint ||
          !authoredOriginSpans(positions.positions, endpoint.origin).some(
            ({ span }) =>
              span.offset <= endpoint.offset &&
              endpoint.offset < span.offset + span.length
          )
        ) {
          return null;
        }
      }
      const offset = resolveAuthoredPosition(
        positions.positions,
        position,
        retained.kind === 'node' || options.association !== 'backward'
          ? 'right'
          : 'left',
        options.deletion === 'drop' ? 'detach' : 'collapse'
      );
      if (offset === null) return null;
      const document = DocumentIndex.fromValue(
        authoredRootNodes(current.value, root)
      );
      if (retained.kind === 'node') {
        return document.nodeStartingAt(offset)?.path.slice() ?? null;
      }
      const boundary = document.childBoundaryAt(offset);
      return boundary ? [...boundary.parentPath, boundary.index] : null;
    },
    settle() {
      const draft = draftPath?.();
      if (draft !== undefined) {
        const current = read();
        if (current) retained = capture(draft, current);
      }
    },
  };
};

const decodeRange = (input: unknown): RetainedRange => {
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
      throw new Error('Invalid retained range.');
    }
    return value as Record<string, unknown>;
  };
  const identity = (value: unknown) => {
    if (typeof value !== 'string' || !value || value.includes('\u0000')) {
      throw new Error('Invalid retained range identity.');
    }
    return value;
  };
  const integer = (value: unknown, minimum = 0) => {
    if (
      typeof value !== 'number' ||
      !Number.isSafeInteger(value) ||
      value < minimum
    ) {
      throw new Error('Invalid retained range offset.');
    }
    return value;
  };
  const data = record(input, [
    'anchor',
    'content',
    'documentId',
    'direction',
    'focus',
    'root',
  ]);
  if (
    !Array.isArray(data.content) ||
    (data.direction !== 'backward' &&
      data.direction !== 'collapsed' &&
      data.direction !== 'forward')
  ) {
    throw new Error('Invalid retained range content.');
  }
  return {
    anchor: decodeAuthoredPosition(data.anchor),
    content: data.content.map((item) => {
      const span = record(item, ['length', 'offset', 'origin']);
      return {
        length: integer(span.length, 1),
        offset: integer(span.offset),
        origin: identity(span.origin),
      };
    }),
    documentId: identity(data.documentId),
    direction: data.direction,
    focus: decodeAuthoredPosition(data.focus),
    root: identity(data.root),
  };
};

export const bindAuthoredDocumentRange = (
  input: Readonly<{ range: Range }> | Readonly<{ saved: unknown }>,
  options: AnchorOptions<Range>,
  read: (view?: Editor) => AuthoredRangeProjection | null,
  isAborted: () => boolean,
  draftRange?: () => Range | null | undefined
): NativeAuthoredRangeBinding => {
  const initial = read();
  if (!initial) {
    throw new Error(
      'Install authored changes before binding a retained range.'
    );
  }
  const root =
    options.root ??
    ('range' in input ? input.range.anchor.root : undefined) ??
    'main';
  const capture = (
    range: Range | null,
    current: AuthoredRangeProjection
  ): RetainedRange => {
    if (!range) {
      return snapshotEditorJsonValue(
        {
          anchor: { left: null, right: null },
          focus: { left: null, right: null },
          content: [],
          direction: 'collapsed',
          documentId: current.state.documentId,
          root,
        },
        'Detached editor range'
      );
    }
    const positions = readRecord(current.positions, root);
    if (!positions?.present) {
      throw new Error('Cannot anchor a missing document root.');
    }
    const document = DocumentIndex.fromValue(
      authoredRootNodes(current.value, root)
    );
    const anchor = document.positionAt(range.anchor);
    const focus = document.positionAt(range.focus);
    const from = Math.min(anchor, focus);
    const to = Math.max(anchor, focus);
    return snapshotEditorJsonValue(
      {
        anchor: authoredPositionAt(positions.positions, anchor),
        content: [...authoredPositionSpans(positions.positions, from, to)].map(
          ({ from: start, to: end, span }) => ({
            origin: span.origin,
            offset: span.offset + Math.max(0, from - start),
            length: Math.min(to, end) - Math.max(from, start),
          })
        ),
        documentId: current.state.documentId,
        direction: RangeApi.isCollapsed(range)
          ? 'collapsed'
          : RangeApi.isBackward(range)
            ? 'backward'
            : 'forward',
        focus: authoredPositionAt(positions.positions, focus),
        root,
      },
      'Retained editor range'
    );
  };
  let retained: RetainedRange;
  if ('saved' in input) {
    retained = snapshotEditorJsonValue(
      decodeRange(input.saved),
      'Retained editor range'
    );
    if (
      retained.documentId !== initial.state.documentId ||
      retained.root !== root
    ) {
      throw new Error('The saved range belongs to another document or root.');
    }
    for (const origin of new Set([
      retained.anchor.left?.origin,
      retained.anchor.right?.origin,
      retained.focus.left?.origin,
      retained.focus.right?.origin,
      ...retained.content.map((span) => span.origin),
    ])) {
      if (
        origin === undefined ||
        origin.startsWith(`${retained.documentId}:base:`)
      ) {
        continue;
      }
      if (!authoredOriginOperation(initial.state, origin)) {
        throw new Error(
          'The saved range requires unavailable authored history.'
        );
      }
    }
  } else {
    retained = capture(input.range, initial);
  }
  return {
    resolve(view) {
      if (isAborted()) return null;
      const draft = draftRange?.();
      if (draft !== undefined) {
        if (!view) return draft;
        const captureProjection = read();
        if (!captureProjection) return null;
        retained = capture(draft, captureProjection);
      }
      const current = read(view);
      if (!current) return null;
      if (current.state.documentId !== retained.documentId) return null;
      const associations = getRangeEndpointAssociations(
        retained.direction,
        options.association
      );
      if (retained.content.length) {
        const lineage = authoredContentLineage(
          current.state,
          retained.content,
          options.association ?? 'inward'
        );
        const live = [...records(current.positions)]
          .filter(([, positions]) => positions.present)
          .map(([candidateRoot, positions]) => ({
            bounds: authoredPositionContentBounds(positions.positions, lineage),
            positions,
            root: candidateRoot,
          }))
          .filter(
            (
              entry
            ): entry is typeof entry & {
              bounds: readonly [number, number];
            } => entry.bounds !== null
          );
        if (live.length === 1) {
          const [{ bounds, root: resolvedRoot }] = live;
          const document = DocumentIndex.fromValue(
            authoredRootNodes(current.value, resolvedRoot)
          );
          const offsets =
            retained.direction === 'backward'
              ? ([bounds[1], bounds[0]] as const)
              : bounds;
          const points = offsets.map((offset, index) => {
            const point = document.pointAt(offset, associations[index]);
            return point
              ? {
                  ...point,
                  ...(resolvedRoot === 'main' ? {} : { root: resolvedRoot }),
                }
              : null;
          });
          return points[0] && points[1]
            ? snapshotEditorJsonValue(
                { anchor: points[0], focus: points[1] },
                'Resolved editor range'
              )
            : null;
        }
        if (live.length > 1 || options.deletion === 'drop') return null;

        const collapseRoot =
          authoredPositionRoot(
            current.positions,
            root,
            retained.anchor,
            associations[0] === -1 ? 'left' : 'right'
          ) ?? root;
        const positions = readRecord(current.positions, collapseRoot);
        if (!positions?.present) return null;
        const offset = resolveAuthoredPosition(
          positions.positions,
          retained.anchor,
          associations[0] === -1 ? 'left' : 'right',
          'collapse'
        );
        if (offset === null) return null;
        const document = DocumentIndex.fromValue(
          authoredRootNodes(current.value, collapseRoot)
        );
        const point = document.pointAt(offset, associations[0]);
        if (!point) return null;
        const resolved = {
          ...point,
          ...(collapseRoot === 'main' ? {} : { root: collapseRoot }),
        };
        return snapshotEditorJsonValue(
          { anchor: resolved, focus: resolved },
          'Resolved editor range'
        );
      }
      const pointRoots = [retained.anchor, retained.focus].map(
        (position, index) =>
          authoredPositionRoot(
            current.positions,
            root,
            position,
            associations[index] === -1 ? 'left' : 'right'
          ) ?? root
      );
      if (pointRoots[0] !== pointRoots[1]) return null;
      const resolvedRoot = pointRoots[0];
      const positions = readRecord(current.positions, resolvedRoot);
      if (!positions?.present) return null;
      const document = DocumentIndex.fromValue(
        authoredRootNodes(current.value, resolvedRoot)
      );
      const points = [retained.anchor, retained.focus].map(
        (position, index) => {
          const resolved = resolveAuthoredPosition(
            positions.positions,
            position,
            associations[index] === -1 ? 'left' : 'right',
            options.deletion === 'drop' ? 'detach' : 'collapse'
          );
          const point =
            resolved === null
              ? null
              : document.pointAt(resolved, associations[index]);
          return point
            ? {
                ...point,
                ...(resolvedRoot === 'main' ? {} : { root: resolvedRoot }),
              }
            : null;
        }
      );
      return points[0] && points[1]
        ? snapshotEditorJsonValue(
            { anchor: points[0], focus: points[1] },
            'Resolved editor range'
          )
        : null;
    },
    serialize() {
      if (isAborted()) {
        throw new Error('Cannot save a range from an aborted transaction.');
      }
      const draft = draftRange?.();
      if (draft !== undefined) {
        const current = read();
        if (!current) {
          throw new Error(
            'Install authored changes before saving a draft range.'
          );
        }
        retained = capture(draft, current);
      }
      return retained;
    },
  };
};
