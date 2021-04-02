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
export const getState = (
  state: SlatePluginsState,
  id?: string | null
): State | undefined => {
  if (id) return state[id];

  const keys = Object.keys(state);
  if (!keys.length) return;

  return state[keys[0]];
};

export const useStoreState = (id?: string) =>
  useSlatePluginsStore((state) => getState(state, id), shallow);

/**
 * Slate editor with generic type (default is `ReactEditor & HistoryEditor & RandomKeyEditor`).
 */
export const useStoreEditor = <
  T extends TEditor | undefined = ReactEditor & HistoryEditor
>(
  id?: string
) =>
  useSlatePluginsStore((state) => getState(state, id)?.editor) as
    | (T & SPEditor)
    | undefined;

export const useStoreEditorEnabled = (id?: string) =>
  useSlatePluginsStore((state) => getState(state, id)?.enabled);
export const useStoreEditorValue = (id?: string) =>
  useSlatePluginsStore((state) => getState(state, id)?.value);
export const useStoreSlatePlugins = (id?: string) =>
  useSlatePluginsStore((state) => getState(state, id)?.plugins);

export const useStoreSlatePluginKeys = (id?: string) =>
  useSlatePluginsStore((state) => getState(state, id)?.pluginKeys);

export const useStoreEditorOptions = (id?: string) =>
  useStoreEditor(id)?.options;
