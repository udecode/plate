import { useSyncExternalStore } from 'react';

import { PathApi, RangeApi, type Range } from '..';
import type {
  PliteDecoration,
  PliteDecorationSource,
} from './decoration-source';
import {
  getSnapshot as editorGetSnapshot,
  toInternalRoot,
} from './editable/runtime-editor-api';
import type { ReactRuntimeEditor } from './plugin/react-editor';
import {
  createPliteViewBoundaryRootMap,
  getPliteViewBoundaryOwnerKey,
  resolvePliteViewBoundarySegmentEndpoint,
  type PliteViewBoundaryRangeEndpoint,
  type PliteViewBoundaryRangeSegment,
  type PliteViewBoundaryOwner,
} from './view-boundary-graph';
import {
  isPliteViewSelectionCollapsed,
  readPliteViewSelection,
  subscribePliteViewSelection,
} from './view-selection';

export const PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID = 'plite-view-selection';

const VIEW_SELECTION_ATTRIBUTES = Object.freeze({
  'data-plite-view-selection': 'true',
  style: Object.freeze({
    backgroundColor: 'Highlight',
    color: 'HighlightText',
  }),
});
const EMPTY_DECORATIONS = Object.freeze([]) as readonly PliteDecoration[];

const rootPointForSegment = (
  point: Range['anchor'],
  root: PliteViewBoundaryRangeSegment['root']
): Range['anchor'] => ({
  ...(root === 'main' ? {} : { root }),
  offset: point.offset,
  path: [...point.path],
});

const resolveEndpoint = (
  roots: ReturnType<typeof createPliteViewBoundaryRootMap>,
  segment: PliteViewBoundaryRangeSegment,
  endpoint: PliteViewBoundaryRangeEndpoint
) =>
  endpoint.kind === 'point'
    ? rootPointForSegment(endpoint.point, segment.root)
    : resolvePliteViewBoundarySegmentEndpoint(roots, segment, endpoint);

const readDecorations = (
  editor: ReactRuntimeEditor<any>,
  ownerKey: string | null
): readonly PliteDecoration[] => {
  const selection = readPliteViewSelection(editor);

  if (!selection || isPliteViewSelectionCollapsed(selection)) {
    return EMPTY_DECORATIONS;
  }

  const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const roots = editor.read((state) =>
    createPliteViewBoundaryRootMap(state.value())
  );
  const decorations = selection.segments.parts.flatMap((segment, index) => {
    if (segment.root !== viewRoot || segment.ownerKey !== ownerKey) return [];

    const anchor = resolveEndpoint(roots, segment, segment.start);
    const focus = resolveEndpoint(roots, segment, segment.end);

    if (!anchor || !focus) return [];

    const range = { anchor, focus };

    if (RangeApi.isCollapsed(range)) return [];

    return [
      Object.freeze({
        attributes: VIEW_SELECTION_ATTRIBUTES,
        key: `${PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID}:${segment.root}:${segment.ownerKey ?? 'main'}:${index}`,
        range,
      }),
    ];
  });

  return decorations.length === 0
    ? EMPTY_DECORATIONS
    : Object.freeze(decorations);
};

const getInputKeys = (
  editor: ReactRuntimeEditor<any>,
  decorations: readonly PliteDecoration[]
) => {
  const snapshot = editorGetSnapshot(editor);

  return decorations.flatMap(({ range }) => {
    const [start] = RangeApi.edges(range);
    const nodeKey = snapshot.index.keyAt(start.path);

    return nodeKey ? [nodeKey] : [];
  });
};

export const createPliteViewSelectionDecorationSource = (
  editor: ReactRuntimeEditor<any>,
  owner: PliteViewBoundaryOwner | null = null
): PliteDecorationSource<unknown> => {
  const ownerKey = owner ? getPliteViewBoundaryOwnerKey(owner) : null;
  let cachedSelection = readPliteViewSelection(editor);
  let cachedDecorations = readDecorations(editor, ownerKey);
  const resolveDecorations = () => {
    const selection = readPliteViewSelection(editor);

    if (selection !== cachedSelection) {
      cachedSelection = selection;
      cachedDecorations = readDecorations(editor, ownerKey);
    }

    return cachedDecorations;
  };

  return Object.freeze({
    id: PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID,
    observe: ({ refresh }) => {
      let previousInputKeys = getInputKeys(editor, resolveDecorations());

      refresh({ nodeKeys: previousInputKeys });

      return subscribePliteViewSelection(editor, (notification) => {
        cachedSelection = readPliteViewSelection(editor);
        cachedDecorations = readDecorations(editor, ownerKey);
        const nextInputKeys = getInputKeys(editor, cachedDecorations);

        refresh({
          nodeKeys: notification?.forceInvalidate
            ? 'all'
            : [...new Set([...previousInputKeys, ...nextInputKeys])],
        });
        previousInputKeys = nextInputKeys;
      });
    },
    read: ({ entry: [, path] }) =>
      resolveDecorations().filter(({ range }) =>
        PathApi.equals(RangeApi.edges(range)[0].path, path)
      ),
  });
};

export const usePliteViewSelectionPresence = (editor: object) =>
  useSyncExternalStore(
    (listener) => subscribePliteViewSelection(editor, listener),
    () => readPliteViewSelection(editor) !== null,
    () => false
  );
