import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import shallow from 'zustand/shallow';
import { SlatePluginsState, State } from '../types/SlatePluginsStore';
import { SPEditor } from '../types/SPEditor';
import { TEditor } from '../types/TEditor';
import { useSlatePluginsStore } from './useSlatePluginsStore';

/**
 * If id is defined, get the state by id.
 * Else, get the first state.
 */
export const getState = <T extends SPEditor = SPEditor>(
  state: SlatePluginsState<T>,
  id?: string | null
): State<T> | undefined => {
  if (id) return state[id];

  const keys = Object.keys(state);
  if (!keys.length) return;

  return state[keys[0]];
};

export const useStoreState = (id?: string | null) =>
  useSlatePluginsStore((state) => getState(state, id), shallow);

/**
 * Get editor ref.
 */
export const useStoreEditorRef = <T extends SPEditor = SPEditor>(
  id?: string | null
) => useSlatePluginsStore((state) => getState<T>(state as any, id)?.editorRef);

/**
 * Get editor state.
 */
export const useStoreEditorState = <T extends SPEditor = SPEditor>(
  id?: string | null
) => useSlatePluginsStore((state) => getState<T>(state as any, id)?.editorRef);

export const useStoreEditorEnabled = (id?: string | null) =>
  useSlatePluginsStore((state) => getState(state, id)?.enabled);
export const useStoreEditorValue = (id?: string | null) =>
  useSlatePluginsStore((state) => getState(state, id)?.value);
export const useStoreSlatePlugins = (id?: string | null) =>
  useSlatePluginsStore((state) => getState(state, id)?.plugins);

export const useStoreSlatePluginKeys = (id?: string | null) =>
  useSlatePluginsStore((state) => getState(state, id)?.pluginKeys);

export const useStoreEditorOptions = (id?: string | null) =>
  useStoreEditorRef(id)?.options;
