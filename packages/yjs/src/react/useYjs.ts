import type {
  Editor,
  EditorStateViewProvider,
  Range,
  Value,
} from '@platejs/plite';
import {
  type PliteDecorationSource,
  type ReactEditor,
  usePliteRangeDecorationSource,
} from '@platejs/plite-react';
import { getInstalledEditorExtension } from '@platejs/plite/internal';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

import type {
  YjsProviderStatus,
  YjsRemoteCursor,
  YjsRemoteCursorData,
  YjsState,
} from '../core';
import {
  type EditorYjsCursorDataFor,
  type EditorYjsStateFor,
  getEditorYjsState,
} from '../core/editor-yjs';
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

type YjsCursorDataForEditor<
  V extends Value,
  TExtensions extends readonly unknown[],
> = EditorYjsCursorDataFor<V, TExtensions>;

type YjsStateForEditor<
  V extends Value,
  TExtensions extends readonly unknown[],
> = EditorYjsStateFor<V, TExtensions>;

type YjsReadEditor<
  V extends Value,
  TExtensions extends readonly unknown[],
> = Pick<Editor<V, TExtensions>, 'read'>;

type YjsOverlayEditor = Readonly<{
  api: Readonly<{
    dom: Readonly<{
      resolveRangeRect: (range: Range) => DOMRect | null;
    }>;
  }>;
  read: Readonly<{
    view: Readonly<{ isFocused: () => boolean }>;
  }>;
  subscribe: (listener: () => void) => () => void;
}>;

type YjsLayeredOverlayEditor = YjsOverlayEditor &
  EditorStateViewProvider<() => unknown>;

type YjsCursorDataForRuntimeEditor<TEditor> =
  TEditor extends EditorStateViewProvider<infer TStateFactory>
    ? ReturnType<TStateFactory> extends Readonly<{
        yjs: YjsState<infer TCursorData>;
      }>
      ? TCursorData
      : YjsRemoteCursorData
    : YjsRemoteCursorData;

const readYjsState = <
  T,
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: YjsReadEditor<V, TExtensions>,
  selector: (state: YjsStateForEditor<V, TExtensions>) => T
): T => editor.read((state) => selector(getEditorYjsState(state)));

const useYjsRevision = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  subscription: 'subscribeAwareness' | 'subscribeProvider',
  getSnapshot: (editor: Editor<V, TExtensions>) => number
): number => {
  const subscribe = useCallback(
    (listener: () => void) =>
      readYjsState(editor, (state) => state[subscription](listener)),
    [editor, subscription]
  );
  const readSnapshot = useCallback(
    () => getSnapshot(editor),
    [editor, getSnapshot]
  );

  return useSyncExternalStore(subscribe, readSnapshot, readSnapshot);
};

const useYjsAwarenessValue = <
  T,
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>,
  selector: (state: YjsStateForEditor<V, TExtensions>) => T
): T => {
  useYjsAwarenessRevision(editor);

  return readYjsState(editor, selector);
};

const useYjsProviderValue = <
  T,
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: YjsReadEditor<V, TExtensions>,
  selector: (state: YjsStateForEditor<V, TExtensions>) => T
): T => {
  const subscribe = useCallback(
    (listener: () => void) =>
      readYjsState(editor, (state) => state.subscribeProvider(listener)),
    [editor]
  );
  const readSnapshot = () => readYjsState(editor, selector);

  return useSyncExternalStore(subscribe, readSnapshot, readSnapshot);
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

const isEditorFocused = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>
): boolean => editor.read.view.isFocused();

const resolveCursorRect = (
  editor: YjsOverlayEditor,
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
    index += 1;
  }

  return true;
};

const countOwnEnumerableKeys = (value: Record<string, unknown>): number => {
  let count = 0;

  for (const key in value) {
    if (Object.hasOwn(value, key)) {
      count += 1;
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
    keyCount += 1;
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
    keyCount += 1;
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
  a: ReadonlyArray<YjsRemoteCursorOverlayPosition<TCursorData, TPositionData>>,
  b: ReadonlyArray<YjsRemoteCursorOverlayPosition<TCursorData, TPositionData>>
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
    index += 1;
  }

  return true;
};

const readYjsRemoteCursorOverlayPositions = <
  TPositionData = never,
  TEditor extends YjsOverlayEditor = YjsOverlayEditor,
>(
  editor: TEditor,
  options:
    | UseYjsRemoteCursorOverlayPositionsOptions<
        YjsCursorDataForRuntimeEditor<TEditor>
      >
    | UseYjsRemoteCursorOverlayPositionsOptions<
        YjsCursorDataForRuntimeEditor<TEditor>,
        TPositionData
      >
): ReadonlyArray<
  YjsRemoteCursorOverlayPosition<
    YjsCursorDataForRuntimeEditor<TEditor>,
    | TPositionData
    | YjsRemoteCursorDecorationData<YjsCursorDataForRuntimeEditor<TEditor>>
  >
> =>
  readYjsState(editor as unknown as Editor, (state) => {
    const cursors = state.remoteCursors() as unknown as ReadonlyArray<
      YjsRemoteCursor<YjsCursorDataForRuntimeEditor<TEditor>>
    >;
    const positions = new Array<
      YjsRemoteCursorOverlayPosition<
        YjsCursorDataForRuntimeEditor<TEditor>,
        | TPositionData
        | YjsRemoteCursorDecorationData<YjsCursorDataForRuntimeEditor<TEditor>>
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
        index += 1;
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
      writeIndex += 1;
      index += 1;
    }

    positions.length = writeIndex;

    return positions;
  });

export const getYjsAwarenessRevision = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>
): number => readYjsState(editor, (state) => state.awarenessRevision());

export const getYjsProviderRevision = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: Editor<V, TExtensions>
): number => readYjsState(editor, (state) => state.providerRevision());

export const getYjsProviderStatus = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: YjsReadEditor<V, TExtensions>
): YjsProviderStatus | null =>
  readYjsState(editor, (state) => state.providerStatus());

export const getYjsProviderSynced = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: YjsReadEditor<V, TExtensions>
): boolean | null => readYjsState(editor, (state) => state.providerSynced());

function useYjsAwarenessRevision<
  V extends Value,
  TExtensions extends readonly unknown[],
>(editor: Editor<V, TExtensions>): number {
  return useYjsRevision(editor, 'subscribeAwareness', getYjsAwarenessRevision);
}

export function useYjsProviderStatus<
  V extends Value,
  TExtensions extends readonly unknown[],
>(editor: YjsReadEditor<V, TExtensions>): YjsProviderStatus | null {
  return useYjsProviderValue(editor, (state) => state.providerStatus());
}

export function useYjsProviderSynced<
  V extends Value,
  TExtensions extends readonly unknown[],
>(editor: YjsReadEditor<V, TExtensions>): boolean | null {
  return useYjsProviderValue(editor, (state) => state.providerSynced());
}

export function useYjsRemoteCursor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  clientId: number
): YjsRemoteCursor<YjsCursorDataForEditor<V, TExtensions>> | null {
  return useYjsAwarenessValue(editor, (state) => state.remoteCursor(clientId));
}

export function useYjsRemoteCursors<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>
): ReadonlyArray<YjsRemoteCursor<YjsCursorDataForEditor<V, TExtensions>>> {
  return useYjsAwarenessValue(editor, (state) => state.remoteCursors());
}

export function useYjsRemoteCursorDecorationSource<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  options?: UseYjsRemoteCursorDecorationSourceOptions<
    YjsCursorDataForEditor<V, TExtensions>
  >
): PliteDecorationSource<
  YjsRemoteCursorDecorationData<YjsCursorDataForEditor<V, TExtensions>>
>;
export function useYjsRemoteCursorDecorationSource<
  TDecorationData,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  options: UseYjsRemoteCursorDecorationSourceOptions<
    YjsCursorDataForEditor<V, TExtensions>,
    TDecorationData
  > & {
    readonly decorate: (
      cursor: YjsRemoteCursor<YjsCursorDataForEditor<V, TExtensions>>
    ) => TDecorationData;
  }
): PliteDecorationSource<TDecorationData>;
export function useYjsRemoteCursorDecorationSource<
  TDecorationData,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: Editor<V, TExtensions>,
  options:
    | UseYjsRemoteCursorDecorationSourceOptions<
        YjsCursorDataForEditor<V, TExtensions>
      >
    | UseYjsRemoteCursorDecorationSourceOptions<
        YjsCursorDataForEditor<V, TExtensions>,
        TDecorationData
      > = {}
): PliteDecorationSource<
  | TDecorationData
  | YjsRemoteCursorDecorationData<YjsCursorDataForEditor<V, TExtensions>>
> {
  const awarenessRevision = useYjsAwarenessRevision(editor);
  const optionsRef = useRef(options);
  const id = options.id ?? DEFAULT_CURSOR_DECORATION_SOURCE_ID;

  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const source = usePliteRangeDecorationSource<
    V,
    TExtensions,
    | TDecorationData
    | YjsRemoteCursorDecorationData<YjsCursorDataForEditor<V, TExtensions>>
  >(editor, {
    id,
    read: () =>
      editor.read((state) => {
        if (!getInstalledEditorExtension(editor, 'yjs')) return [];

        const cursors = getEditorYjsState(state).remoteCursors();
        const slices = new Array<{
          readonly data:
            | TDecorationData
            | YjsRemoteCursorDecorationData<
                YjsCursorDataForEditor<V, TExtensions>
              >;
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
            index += 1;
            continue;
          }

          const { decorate } = optionsRef.current;
          const data =
            decorate === undefined
              ? createCursorData(cursor)
              : decorate(cursor);

          slices[writeIndex] = {
            data,
            key: `${id}:${cursor.clientId}`,
            range,
          };
          writeIndex += 1;
          index += 1;
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
  TEditor extends YjsLayeredOverlayEditor,
>(
  editor: TEditor,
  options?: UseYjsRemoteCursorOverlayPositionsOptions<
    YjsCursorDataForRuntimeEditor<TEditor>
  >
): readonly [
  ReadonlyArray<
    YjsRemoteCursorOverlayPosition<
      YjsCursorDataForRuntimeEditor<TEditor>,
      YjsRemoteCursorDecorationData<YjsCursorDataForRuntimeEditor<TEditor>>
    >
  >,
  () => void,
];
export function useYjsRemoteCursorOverlayPositions<
  TPositionData,
  TEditor extends YjsLayeredOverlayEditor,
>(
  editor: TEditor,
  options: UseYjsRemoteCursorOverlayPositionsOptions<
    YjsCursorDataForRuntimeEditor<TEditor>,
    TPositionData
  > & {
    readonly data: (
      cursor: YjsRemoteCursor<YjsCursorDataForRuntimeEditor<TEditor>>
    ) => TPositionData;
  }
): readonly [
  ReadonlyArray<
    YjsRemoteCursorOverlayPosition<
      YjsCursorDataForRuntimeEditor<TEditor>,
      TPositionData
    >
  >,
  () => void,
];
export function useYjsRemoteCursorOverlayPositions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactEditor<V, TExtensions>,
  options?: UseYjsRemoteCursorOverlayPositionsOptions<
    YjsCursorDataForEditor<V, TExtensions>
  >
): readonly [
  ReadonlyArray<
    YjsRemoteCursorOverlayPosition<
      YjsCursorDataForEditor<V, TExtensions>,
      YjsRemoteCursorDecorationData<YjsCursorDataForEditor<V, TExtensions>>
    >
  >,
  () => void,
];
export function useYjsRemoteCursorOverlayPositions<
  TPositionData,
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: ReactEditor<V, TExtensions>,
  options: UseYjsRemoteCursorOverlayPositionsOptions<
    YjsCursorDataForEditor<V, TExtensions>,
    TPositionData
  > & {
    readonly data: (
      cursor: YjsRemoteCursor<YjsCursorDataForEditor<V, TExtensions>>
    ) => TPositionData;
  }
): readonly [
  ReadonlyArray<
    YjsRemoteCursorOverlayPosition<
      YjsCursorDataForEditor<V, TExtensions>,
      TPositionData
    >
  >,
  () => void,
];
export function useYjsRemoteCursorOverlayPositions<
  TPositionData,
  TEditor extends YjsOverlayEditor,
>(
  editor: TEditor,
  options:
    | UseYjsRemoteCursorOverlayPositionsOptions<
        YjsCursorDataForRuntimeEditor<TEditor>
      >
    | UseYjsRemoteCursorOverlayPositionsOptions<
        YjsCursorDataForRuntimeEditor<TEditor>,
        TPositionData
      > = {}
): readonly [
  ReadonlyArray<
    YjsRemoteCursorOverlayPosition<
      YjsCursorDataForRuntimeEditor<TEditor>,
      | TPositionData
      | YjsRemoteCursorDecorationData<YjsCursorDataForRuntimeEditor<TEditor>>
    >
  >,
  () => void,
] {
  const awarenessRevision = useYjsAwarenessRevision(
    editor as unknown as Editor
  );
  const animationFrameRef = useRef<number | null>(null);
  const optionsRef = useRef(options);

  useIsomorphicLayoutEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const readPositions = useCallback(
    () =>
      readYjsRemoteCursorOverlayPositions<TPositionData, TEditor>(
        editor,
        optionsRef.current
      ),
    [editor]
  );
  const [positions, setPositions] = useState(() =>
    readYjsRemoteCursorOverlayPositions<TPositionData, TEditor>(editor, options)
  );
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
      return undefined;
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
