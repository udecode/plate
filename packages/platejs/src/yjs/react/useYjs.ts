import { useCallback, useSyncExternalStore } from 'react';

import type { Editor as PlateEditor, Value } from '../../core';
import { getEditorRuntimeOwner } from '../../core';
import {
  type PliteWidgetGeometry,
  type UsePliteWidgetGeometryOptions,
  usePliteWidgetGeometry,
} from '../../react/core';
import type {
  YjsProviderStatus,
  YjsRemoteCursor,
  YjsRemoteCursorData,
} from '../core';
import {
  type EditorYjsCursorDataFor,
  type EditorYjsStateFor,
  getEditorYjsState,
} from '../core/editor-yjs';
import {
  getYjsCursorCache,
  getYjsCursorWidgetStore,
} from './cursor-widget-store';

export type YjsRemoteCursorDecorationData<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> = {
  readonly clientId: number;
  readonly cursor: YjsRemoteCursor<TCursorData>;
  readonly data?: TCursorData;
};

export type UseYjsRemoteCursorGeometryOptions = UsePliteWidgetGeometryOptions;

type YjsCursorDataForEditor<
  V extends Value,
  TExtensions extends readonly unknown[],
> = EditorYjsCursorDataFor<V, TExtensions>;

type YjsStateForEditor<
  V extends Value,
  TExtensions extends readonly unknown[],
> = EditorYjsStateFor<V, TExtensions>;

type YjsReadEditor<V extends Value, TExtensions extends readonly unknown[]> =
  | PlateEditor<V, TExtensions>
  | Parameters<typeof getEditorRuntimeOwner>[0];

const readYjsState = <
  T,
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: YjsReadEditor<V, TExtensions>,
  selector: (state: YjsStateForEditor<V, TExtensions>) => T
): T =>
  getEditorRuntimeOwner(editor).read((state) =>
    selector(getEditorYjsState(state) as YjsStateForEditor<V, TExtensions>)
  );

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

export const getYjsAwarenessRevision = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: YjsReadEditor<V, TExtensions>
): number => readYjsState(editor, (state) => state.awarenessRevision());

export const getYjsProviderRevision = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  editor: YjsReadEditor<V, TExtensions>
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
  editor: YjsReadEditor<V, TExtensions>,
  clientId: number
): YjsRemoteCursor<YjsCursorDataForEditor<V, TExtensions>> | null {
  const cache = getYjsCursorCache<YjsCursorDataForEditor<V, TExtensions>>(
    getEditorRuntimeOwner(editor)
  );
  const subscribe = useCallback(
    (listener: () => void) => cache.subscribeCursor(clientId, listener),
    [cache, clientId]
  );
  const getSnapshot = useCallback(
    () => cache.remoteCursor(clientId),
    [cache, clientId]
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useYjsRemoteCursorIds<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(editor: YjsReadEditor<V, TExtensions>): readonly number[] {
  const cache = getYjsCursorCache<YjsCursorDataForEditor<V, TExtensions>>(
    getEditorRuntimeOwner(editor)
  );

  return useSyncExternalStore(
    cache.subscribeIds,
    cache.remoteCursorIds,
    cache.remoteCursorIds
  );
}

export function useYjsRemoteCursorGeometry<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  editor: YjsReadEditor<V, TExtensions>,
  clientId: number,
  options: UseYjsRemoteCursorGeometryOptions
): PliteWidgetGeometry | null {
  const store = getYjsCursorWidgetStore<YjsCursorDataForEditor<V, TExtensions>>(
    getEditorRuntimeOwner(editor)
  );

  return usePliteWidgetGeometry(store, String(clientId), options);
}
