import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import type { Editor, Range } from '@platejs/plite';
import { getInstalledEditorExtension } from '@platejs/plite/internal';
import {
  type PliteDecorationSource,
  type ReactEditor,
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

export type YjsRemoteCursorDecorationData<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = {
  readonly clientId: number;
  readonly cursor: YjsRemoteCursor<TCursorData>;
  readonly data?: TCursorData;
};

export type UseYjsRemoteCursorDecorationSourceOptions<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
  TDecorationData = undefined,
> = {
  readonly id?: string;
  /** Explicit invalidation token for mutable data read by `decorate`. */
  readonly revision?: unknown;
} & ([TDecorationData] extends [undefined]
  ? { readonly decorate?: undefined }
  : {
      readonly decorate: (
        cursor: YjsRemoteCursor<TCursorData>
      ) => TDecorationData;
    });

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
  TPositionData = undefined,
> = {
  /** Explicit invalidation token for mutable data read by `data`. */
  readonly revision?: unknown;
} & ([TPositionData] extends [undefined]
  ? { readonly data?: undefined }
  : {
      readonly data: (cursor: YjsRemoteCursor<TCursorData>) => TPositionData;
    });

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

const isEditorFocused = (editor: Editor): boolean =>
  editor.read.view.isFocused();

const resolveCursorRect = (
  editor: ReactEditor,
  range: Range
): DOMRect | null => {
  try {
    return editor.api.dom.resolveRangeRect(range);
  } catch {
    return null;
  }
};

const pointsEqual = (a: Range['anchor'], b: Range['anchor']): boolean =>
  a.offset === b.offset && a.root === b.root && pathsEqual(a.path, b.path);

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
  TPositionData = never,
>(
  editor: ReactEditor,
  options:
    | UseYjsRemoteCursorOverlayPositionsOptions<TCursorData>
    | UseYjsRemoteCursorOverlayPositionsOptions<TCursorData, TPositionData>
): readonly YjsRemoteCursorOverlayPosition<
  TCursorData,
  TPositionData | YjsRemoteCursorDecorationData<TCursorData>
>[] =>
  readYjsState(editor, (state) => {
    const cursors = state.remoteCursors<TCursorData>();
    const positions = new Array<
      YjsRemoteCursorOverlayPosition<
        TCursorData,
        TPositionData | YjsRemoteCursorDecorationData<TCursorData>
      >
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
          ? createCursorData(cursor)
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
>(
  editor: Editor,
  options?: UseYjsRemoteCursorDecorationSourceOptions<TCursorData>
): PliteDecorationSource<YjsRemoteCursorDecorationData<TCursorData>>;
export function useYjsRemoteCursorDecorationSource<
  TCursorData extends YjsRemoteCursorData,
  TDecorationData,
>(
  editor: Editor,
  options: UseYjsRemoteCursorDecorationSourceOptions<
    TCursorData,
    TDecorationData
  > & {
    readonly decorate: (
      cursor: YjsRemoteCursor<TCursorData>
    ) => TDecorationData;
  }
): PliteDecorationSource<TDecorationData>;
export function useYjsRemoteCursorDecorationSource<
  TCursorData extends YjsRemoteCursorData,
  TDecorationData,
>(
  editor: Editor,
  options:
    | UseYjsRemoteCursorDecorationSourceOptions<TCursorData>
    | UseYjsRemoteCursorDecorationSourceOptions<
        TCursorData,
        TDecorationData
      > = {}
): PliteDecorationSource<
  TDecorationData | YjsRemoteCursorDecorationData<TCursorData>
> {
  const awarenessRevision = useYjsAwarenessRevision(editor);
  const optionsRef = useRef(options);
  const id = options.id ?? DEFAULT_CURSOR_DECORATION_SOURCE_ID;
  optionsRef.current = options;

  const source = usePliteRangeDecorationSource<
    TDecorationData | YjsRemoteCursorDecorationData<TCursorData>
  >(editor, {
    id,
    read: () =>
      editor.read((state) => {
        if (!getInstalledEditorExtension(editor, 'yjs')) return [];

        const cursors = getEditorYjsState(state).remoteCursors<TCursorData>();
        const slices = new Array<{
          readonly data:
            | TDecorationData
            | YjsRemoteCursorDecorationData<TCursorData>;
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
              ? createCursorData(cursor)
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
  }, [awarenessRevision, editor, options.revision, source]);

  return source;
}

export function useYjsRemoteCursorOverlayPositions<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
>(
  editor: ReactEditor,
  options?: UseYjsRemoteCursorOverlayPositionsOptions<TCursorData>
): readonly [
  readonly YjsRemoteCursorOverlayPosition<
    TCursorData,
    YjsRemoteCursorDecorationData<TCursorData>
  >[],
  () => void,
];
export function useYjsRemoteCursorOverlayPositions<
  TCursorData extends YjsRemoteCursorData,
  TPositionData,
>(
  editor: ReactEditor,
  options: UseYjsRemoteCursorOverlayPositionsOptions<
    TCursorData,
    TPositionData
  > & {
    readonly data: (cursor: YjsRemoteCursor<TCursorData>) => TPositionData;
  }
): readonly [
  readonly YjsRemoteCursorOverlayPosition<TCursorData, TPositionData>[],
  () => void,
];
export function useYjsRemoteCursorOverlayPositions<
  TCursorData extends YjsRemoteCursorData,
  TPositionData,
>(
  editor: ReactEditor,
  options:
    | UseYjsRemoteCursorOverlayPositionsOptions<TCursorData>
    | UseYjsRemoteCursorOverlayPositionsOptions<TCursorData, TPositionData> = {}
): readonly [
  readonly YjsRemoteCursorOverlayPosition<
    TCursorData,
    TPositionData | YjsRemoteCursorDecorationData<TCursorData>
  >[],
  () => void,
] {
  const awarenessRevision = useYjsAwarenessRevision(editor);
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
  }, [awarenessRevision, options.revision, refresh]);

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
