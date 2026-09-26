import { useSyncExternalStore } from 'react';

import { PathApi, RangeApi, type Range, type Value } from '..';
import { readAuthoredFragmentView } from '../core/authored-runtime';
import { subscribeEditorDOMScope } from '../dom/plugin/dom-editor';
import { readDOMFragmentParent } from '../dom/plugin/dom-fragment-view';
import type { Decoration, DecorationSource } from './decoration-source';
import {
  getSnapshot as editorGetSnapshot,
  toInternalRoot,
} from './editable/runtime-editor-api';
import { canUseNativeViewSelection } from './editable/selection-projected-dom';
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
  'data-editor-view-selection': 'true',
  style: Object.freeze({
    backgroundColor: 'Highlight',
    color: 'HighlightText',
  }),
});
const EMPTY_DECORATIONS = Object.freeze([]) as readonly Decoration[];

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

const readDecorations = <V extends Value>(
  editor: ReactRuntimeEditor<V>,
  ownerKey: string | null
): readonly Decoration[] => {
  const selection = readPliteViewSelection(editor);

  if (
    !selection ||
    isPliteViewSelectionCollapsed(selection) ||
    canUseNativeViewSelection(editor, selection)
  ) {
    return EMPTY_DECORATIONS;
  }

  const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const fragmentId = readAuthoredFragmentView(editor)?.fragment.id ?? null;
  const roots = editor.read((state) => ({
    ...createPliteViewBoundaryRootMap(state.value()),
    [viewRoot]: state.children(),
  }));
  const decorations = selection.segments.parts.flatMap((segment, index) => {
    if (
      segment.root !== viewRoot ||
      segment.ownerKey !== ownerKey ||
      (segment.fragment?.id ?? null) !== fragmentId
    ) {
      return [];
    }

    const anchor = resolveEndpoint(roots, segment, segment.start);
    const focus = resolveEndpoint(roots, segment, segment.end);

    if (!anchor || !focus) return [];

    const range = { anchor, focus };

    if (RangeApi.isCollapsed(range)) return [];

    return [
      Object.freeze({
        attributes: VIEW_SELECTION_ATTRIBUTES,
        key: `${PLITE_VIEW_SELECTION_DECORATION_SOURCE_ID}:${segment.root}:${
          segment.ownerKey ?? 'main'
        }:${index}`,
        range,
      }),
    ];
  });

  return decorations.length === 0
    ? EMPTY_DECORATIONS
    : Object.freeze(decorations);
};

const getInputKeys = <V extends Value>(
  editor: ReactRuntimeEditor<V>,
  decorations: readonly Decoration[]
) => {
  const snapshot = editorGetSnapshot(editor);

  return decorations.flatMap(({ range }) => {
    const [start] = RangeApi.edges(range);
    const nodeKey = snapshot.index.keyAt(start.path);

    return nodeKey ? [nodeKey] : [];
  });
};

export const createPliteViewSelectionDecorationSource = <V extends Value>(
  editor: ReactRuntimeEditor<V>,
  owner: PliteViewBoundaryOwner | null = null
): DecorationSource<unknown> => {
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
      let previousInputKeys = getInputKeys(editor, cachedDecorations);
      const update = (forceInvalidate = false) => {
        cachedSelection = readPliteViewSelection(editor);
        cachedDecorations = readDecorations(editor, ownerKey);
        const nextInputKeys = getInputKeys(editor, cachedDecorations);

        refresh({
          nodeKeys: forceInvalidate
            ? 'all'
            : [...new Set([...previousInputKeys, ...nextInputKeys])],
        });
        previousInputKeys = nextInputKeys;
      };
      update();
      const stopSelection = subscribePliteViewSelection(
        editor,
        (notification) => update(notification?.forceInvalidate)
      );
      const stopDOM = subscribeEditorDOMScope(
        readDOMFragmentParent(editor) ?? editor,
        () => update()
      );
      return () => {
        stopSelection();
        stopDOM();
      };
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

const EMPTY_FRAGMENT_KEYS = Object.freeze([]) as readonly string[];
const FRAGMENT_KEYS = new WeakMap<
  object,
  Readonly<{ identity: string; keys: readonly string[] }>
>();

const readViewSelectionFragmentKeys = (editor: ReactRuntimeEditor<any>) => {
  const selection = readPliteViewSelection(editor);
  if (!selection || canUseNativeViewSelection(editor, selection)) {
    return EMPTY_FRAGMENT_KEYS;
  }
  const keys = [
    ...new Set(
      selection.segments.parts.flatMap(({ fragment }) =>
        fragment ? [JSON.stringify([fragment.changeId, fragment.id])] : []
      )
    ),
  ].sort();
  if (keys.length === 0) return EMPTY_FRAGMENT_KEYS;
  const identity = JSON.stringify(keys);
  const cached = FRAGMENT_KEYS.get(editor);
  if (cached?.identity === identity) return cached.keys;
  const snapshot = Object.freeze(keys);

  FRAGMENT_KEYS.set(editor, { identity, keys: snapshot });
  return snapshot;
};

export const usePliteViewSelectionFragmentKeys = (
  editor: ReactRuntimeEditor<any>
) =>
  useSyncExternalStore(
    (listener) => subscribePliteViewSelection(editor, listener),
    () => readViewSelectionFragmentKeys(editor),
    () => EMPTY_FRAGMENT_KEYS
  );
