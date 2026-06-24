import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { Editor, Range } from '@platejs/plite';
import {
  type PliteDecorationSource,
  usePliteRangeDecorationSource,
} from '@platejs/plite-react';

import type {
  YjsProviderStatus,
  YjsRemoteCursor,
  YjsRemoteCursorData,
  YjsState,
} from '../core';
import { getEditorYjsState } from '../core/editor-yjs';
import { pathsEqual } from '../core/path';
import { isRecord } from '../core/record';

type YjsDOMApi = {
  readonly isFocused?: () => boolean;
  readonly resolveRangeRect?: (range: Range) => unknown;
};

export type YjsRemoteCursorDecorationData<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = {
  readonly clientId: number;
  readonly cursor: YjsRemoteCursor<TCursorData>;
  readonly data?: TCursorData;
};

export type UseYjsRemoteCursorDecorationSourceOptions<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  TDecorationData = YjsRemoteCursorDecorationData<TCursorData>,
> = {
  readonly decorate?: (cursor: YjsRemoteCursor<TCursorData>) => TDecorationData;
  /** Values that should recompute decoration data when decorate closes over React state. */
  readonly deps?: readonly unknown[];
  readonly id?: string;
};

export type YjsRemoteCursorOverlayPosition<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  TPositionData = YjsRemoteCursorDecorationData<TCursorData>,
> = {
  readonly clientId: number;
  readonly cursor: YjsRemoteCursor<TCursorData>;
  readonly data: TPositionData;
  readonly range: Range;
  readonly rect: DOMRect | null;
};

export type UseYjsRemoteCursorOverlayPositionsOptions<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  TPositionData = YjsRemoteCursorDecorationData<TCursorData>,
> = {
  readonly data?: (cursor: YjsRemoteCursor<TCursorData>) => TPositionData;
  /** Values that should recompute overlay data when data closes over React state. */
  readonly deps?: readonly unknown[];
};

const DEFAULT_CURSOR_DECORATION_SOURCE_ID = 'yjs-remote-cursors';
const DOM_RECT_FIELDS = [
  'bottom',
  'height',
  'left',
  'right',
  'top',
  'width',
  'x',
  'y',
] as const;
const EMPTY_DEPS: readonly unknown[] = [];

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const readYjsState = <T>(editor: Editor, selector: (state: YjsState) => T): T =>
  editor.read((state) => selector(getEditorYjsState(state)));

const useYjsRevision = (
  editor: Editor,
  subscribe: (state: YjsState, listener: () => void) => () => void,
  getSnapshot: (editor: Editor) => number
): number =>
  useSyncExternalStore(
    (listener) => readYjsState(editor, (state) => subscribe(state, listener)),
    () => getSnapshot(editor),
    () => getSnapshot(editor)
  );

const useYjsAwarenessValue = <T>(
  editor: Editor,
  selector: (state: YjsState) => T
): T => {
  useYjsAwarenessRevision(editor);

  return readYjsState(editor, selector);
};

const useYjsProviderValue = <T>(
  editor: Editor,
  selector: (state: YjsState) => T
): T => {
  useYjsProviderRevision(editor);

  return readYjsState(editor, selector);
};

const createCursorData = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(
  cursor: YjsRemoteCursor<TCursorData>
): YjsRemoteCursorDecorationData<TCursorData> => {
  const data: {
    data?: TCursorData;
    clientId: number;
    cursor: YjsRemoteCursor<TCursorData>;
  } = {
    clientId: cursor.clientId,
    cursor,
  };

  if (cursor.data !== undefined) {
    data.data = cursor.data;
  }

  return data;
};

const createDefaultCursorData = <
  TCursorData extends YjsRemoteCursorData,
  TData,
>(
  cursor: YjsRemoteCursor<TCursorData>
): TData => createCursorData(cursor) as TData;

const isYjsDOMApi = (value: unknown): value is YjsDOMApi =>
  isRecord(value) &&
  (value.isFocused === undefined || typeof value.isFocused === 'function') &&
  (value.resolveRangeRect === undefined ||
    typeof value.resolveRangeRect === 'function');

const isDOMRectLike = (value: unknown): value is DOMRect =>
  isRecord(value) && rectFieldsAreNumbers(value);

const rectFieldsAreNumbers = (value: Record<string, unknown>): boolean => {
  let index = 0;

  while (index < DOM_RECT_FIELDS.length) {
    const field = DOM_RECT_FIELDS[index];

    if (typeof value[field] !== 'number') {
      return false;
    }
    index++;
  }

  return true;
};

const getYjsDOMApi = (editor: Editor): YjsDOMApi | undefined => {
  const api = isRecord(editor) ? editor.api : undefined;

  if (!isRecord(api)) {
    return;
  }

  return isYjsDOMApi(api.dom) ? api.dom : undefined;
};

const resolveCursorRect = (editor: Editor, range: Range): DOMRect | null => {
  const resolveRangeRect = getYjsDOMApi(editor)?.resolveRangeRect;

  if (resolveRangeRect === undefined) {
    return null;
  }

  try {
    const rect = resolveRangeRect(range);

    return isDOMRectLike(rect) ? rect : null;
  } catch {
    return null;
  }
};

const isEditorFocused = (editor: Editor): boolean =>
  getYjsDOMApi(editor)?.isFocused?.() === true;

const pointsEqual = (a: Range['anchor'], b: Range['anchor']): boolean =>
  a.offset === b.offset && pathsEqual(a.path, b.path);

const rangesEqual = (a: Range, b: Range): boolean =>
  pointsEqual(a.anchor, b.anchor) && pointsEqual(a.focus, b.focus);

const rectsEqual = (a: DOMRect | null, b: DOMRect | null): boolean => {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }

  let index = 0;

  while (index < DOM_RECT_FIELDS.length) {
    const field = DOM_RECT_FIELDS[index];

    if (a[field] !== b[field]) {
      return false;
    }
    index++;
  }

  return true;
};

const countOwnEnumerableKeys = (value: Record<string, unknown>): number => {
  let count = 0;

  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      count++;
    }
  }

  return count;
};

const shallowEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) {
    return true;
  }
  if (!isRecord(a) || !isRecord(b)) {
    return false;
  }

  let keyCount = 0;

  for (const key in a) {
    if (!Object.hasOwn(a, key)) {
      continue;
    }
    if (!Object.hasOwn(b, key) || !Object.is(a[key], b[key])) {
      return false;
    }
    keyCount++;
  }

  return keyCount === countOwnEnumerableKeys(b);
};

const isRemoteCursorLike = (value: unknown): value is YjsRemoteCursor => {
  if (
    !isRecord(value) ||
    typeof value.clientId !== 'number' ||
    !('selection' in value)
  ) {
    return false;
  }

  for (const key in value) {
    if (!Object.hasOwn(value, key)) {
      continue;
    }
    if (key !== 'clientId' && key !== 'data' && key !== 'selection') {
      return false;
    }
  }

  return true;
};

const remoteCursorsEqual = (a: unknown, b: unknown): boolean =>
  isRemoteCursorLike(a) &&
  isRemoteCursorLike(b) &&
  a.clientId === b.clientId &&
  shallowEqual(a.data, b.data);

const overlayDataEqual = (a: unknown, b: unknown): boolean => {
  if (Object.is(a, b)) {
    return true;
  }
  if (!isRecord(a) || !isRecord(b)) {
    return false;
  }

  let keyCount = 0;

  for (const key in a) {
    if (!Object.hasOwn(a, key)) {
      continue;
    }
    if (!Object.hasOwn(b, key)) {
      return false;
    }
    keyCount++;
    if (key === 'cursor') {
      if (isRemoteCursorLike(a.cursor) || isRemoteCursorLike(b.cursor)) {
        if (!remoteCursorsEqual(a.cursor, b.cursor)) {
          return false;
        }
        continue;
      }
      if (isRecord(a.cursor) && isRecord(b.cursor)) {
        if (!shallowEqual(a.cursor, b.cursor)) {
          return false;
        }
        continue;
      }
      if (!Object.is(a.cursor, b.cursor)) {
        return false;
      }
      continue;
    }
    if (key === 'data' && isRecord(a.data) && isRecord(b.data)) {
      if (!shallowEqual(a.data, b.data)) {
        return false;
      }
      continue;
    }
    if (!Object.is(a[key], b[key])) {
      return false;
    }
  }

  return keyCount === countOwnEnumerableKeys(b);
};

const overlayPositionsEqual = <
  TCursorData extends YjsRemoteCursorData,
  TPositionData,
>(
  a: readonly YjsRemoteCursorOverlayPosition<TCursorData, TPositionData>[],
  b: readonly YjsRemoteCursorOverlayPosition<TCursorData, TPositionData>[]
): boolean => {
  if (a.length !== b.length) {
    return false;
  }

  let index = 0;

  while (index < a.length) {
    const position = a[index];
    const next = b[index];

    if (
      position === undefined ||
      next === undefined ||
      position.clientId !== next.clientId ||
      !rangesEqual(position.range, next.range) ||
      !rectsEqual(position.rect, next.rect) ||
      !overlayDataEqual(position.data, next.data)
    ) {
      return false;
    }
    index++;
  }

  return true;
};

const readYjsRemoteCursorOverlayPositions = <
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  TPositionData = YjsRemoteCursorDecorationData<TCursorData>,
>(
  editor: Editor,
  options: UseYjsRemoteCursorOverlayPositionsOptions<TCursorData, TPositionData>
): readonly YjsRemoteCursorOverlayPosition<TCursorData, TPositionData>[] =>
  readYjsState(editor, (state) => {
    const cursors = state.remoteCursors<TCursorData>();
    const positions = new Array<
      YjsRemoteCursorOverlayPosition<TCursorData, TPositionData>
    >(cursors.length);
    let writeIndex = 0;
    let index = 0;

    while (index < cursors.length) {
      const cursor = cursors[index];

      if (cursor === undefined) {
        throw new Error(
          'Cannot read overlay positions from a sparse cursor array.'
        );
      }

      const range = cursor.selection;

      if (range === null) {
        index++;
        continue;
      }

      const data =
        options.data === undefined
          ? createDefaultCursorData<TCursorData, TPositionData>(cursor)
          : options.data(cursor);

      positions[writeIndex] = {
        clientId: cursor.clientId,
        cursor,
        data,
        range,
        rect: resolveCursorRect(editor, range),
      };
      writeIndex++;
      index++;
    }

    positions.length = writeIndex;

    return positions;
  });

export const getYjsAwarenessRevision = (editor: Editor): number =>
  readYjsState(editor, (state) => state.awarenessRevision());

export const getYjsProviderRevision = (editor: Editor): number =>
  readYjsState(editor, (state) => state.providerRevision());

export const getYjsProviderStatus = (
  editor: Editor
): YjsProviderStatus | null =>
  readYjsState(editor, (state) => state.providerStatus());

export const getYjsProviderSynced = (editor: Editor): boolean | null =>
  readYjsState(editor, (state) => state.providerSynced());

export function useYjsAwarenessRevision(editor: Editor): number {
  return useYjsRevision(
    editor,
    (state, listener) => state.subscribeAwareness(listener),
    getYjsAwarenessRevision
  );
}

export function useYjsProviderRevision(editor: Editor): number {
  return useYjsRevision(
    editor,
    (state, listener) => state.subscribeProvider(listener),
    getYjsProviderRevision
  );
}

export function useYjsProviderStatus(editor: Editor): YjsProviderStatus | null {
  return useYjsProviderValue(editor, (state) => state.providerStatus());
}

export function useYjsProviderSynced(editor: Editor): boolean | null {
  return useYjsProviderValue(editor, (state) => state.providerSynced());
}

export function useYjsRemoteCursor<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(editor: Editor, clientId: number): YjsRemoteCursor<TCursorData> | null {
  return useYjsAwarenessValue(editor, (state) =>
    state.remoteCursor<TCursorData>(clientId)
  );
}

export function useYjsRemoteCursors<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(editor: Editor): readonly YjsRemoteCursor<TCursorData>[] {
  return useYjsAwarenessValue(editor, (state) =>
    state.remoteCursors<TCursorData>()
  );
}

export function useYjsRemoteCursorDecorationSource<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  TDecorationData = YjsRemoteCursorDecorationData<TCursorData>,
>(
  editor: Editor,
  options: UseYjsRemoteCursorDecorationSourceOptions<
    TCursorData,
    TDecorationData
  > = {}
): PliteDecorationSource<TDecorationData> {
  const awarenessRevision = useYjsAwarenessRevision(editor);
  const decorateRefreshDeps = options.deps ?? EMPTY_DEPS;
  const optionsRef = useRef(options);
  const id = options.id ?? DEFAULT_CURSOR_DECORATION_SOURCE_ID;
  optionsRef.current = options;

  const source = usePliteRangeDecorationSource<TDecorationData>(editor, {
    deps: [awarenessRevision, ...decorateRefreshDeps],
    id,
    read: () =>
      readYjsState(editor, (state) => {
        const cursors = state.remoteCursors<TCursorData>();
        const slices = new Array<{
          readonly data: TDecorationData;
          readonly key: string;
          readonly range: Range;
        }>(cursors.length);
        let writeIndex = 0;
        let index = 0;

        while (index < cursors.length) {
          const cursor = cursors[index];

          if (cursor === undefined) {
            throw new Error(
              'Cannot read decoration slices from a sparse cursor array.'
            );
          }

          const range = cursor.selection;

          if (range === null) {
            index++;
            continue;
          }

          const decorate = optionsRef.current.decorate;
          const data =
            decorate === undefined
              ? createDefaultCursorData<TCursorData, TDecorationData>(cursor)
              : decorate(cursor);

          slices[writeIndex] = {
            data,
            key: `${id}:${cursor.clientId}`,
            range,
          };
          writeIndex++;
          index++;
        }

        slices.length = writeIndex;

        return slices;
      }),
  });

  useEffect(() => {
    source.refresh({
      forceInvalidate: true,
      reason: 'external',
      requiresDOMSelectionExport: isEditorFocused(editor),
    });
  }, [awarenessRevision, source, ...decorateRefreshDeps]);

  return source;
}

export function useYjsRemoteCursorOverlayPositions<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  TPositionData = YjsRemoteCursorDecorationData<TCursorData>,
>(
  editor: Editor,
  options: UseYjsRemoteCursorOverlayPositionsOptions<
    TCursorData,
    TPositionData
  > = {}
): readonly [
  readonly YjsRemoteCursorOverlayPosition<TCursorData, TPositionData>[],
  () => void,
] {
  const awarenessRevision = useYjsAwarenessRevision(editor);
  const dataRefreshDeps = options.deps ?? EMPTY_DEPS;
  const animationFrameRef = useRef<number | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const readPositions = useCallback(
    () =>
      readYjsRemoteCursorOverlayPositions<TCursorData, TPositionData>(
        editor,
        optionsRef.current
      ),
    [editor]
  );
  const [positions, setPositions] = useState(readPositions);
  const positionsRef = useRef(positions);
  const refresh = useCallback(() => {
    const next = readPositions();

    if (overlayPositionsEqual(positionsRef.current, next)) {
      return;
    }

    positionsRef.current = next;
    setPositions(next);
  }, [readPositions]);
  const cancelScheduledRefresh = useCallback(() => {
    if (typeof window === 'undefined' || animationFrameRef.current === null) {
      return;
    }

    window.cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = null;
  }, []);
  const refreshAfterEditorLayout = useCallback(() => {
    refresh();

    if (
      typeof window === 'undefined' ||
      typeof window.requestAnimationFrame !== 'function'
    ) {
      return;
    }

    cancelScheduledRefresh();
    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      refresh();
    });
  }, [cancelScheduledRefresh, refresh]);

  useIsomorphicLayoutEffect(() => {
    refresh();
  }, [awarenessRevision, refresh, ...dataRefreshDeps]);

  useIsomorphicLayoutEffect(() => {
    const unsubscribe = editor.subscribe(() => {
      refreshAfterEditorLayout();
    });

    return () => {
      unsubscribe();
      cancelScheduledRefresh();
    };
  }, [cancelScheduledRefresh, editor, refreshAfterEditorLayout]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.addEventListener('resize', refresh);
    window.addEventListener('scroll', refresh, true);

    return () => {
      window.removeEventListener('resize', refresh);
      window.removeEventListener('scroll', refresh, true);
    };
  }, [refresh]);

  return [positions, refresh];
}
