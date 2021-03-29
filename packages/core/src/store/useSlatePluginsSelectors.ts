import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SlatePluginsState, State } from '../types/SlatePluginsStore';
import { SPEditor } from '../types/SPEditor';
import { TEditor } from '../types/TEditor';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const getState = (
  state: SlatePluginsState,
  id = 'main'
): State | undefined => state[id];

export const useStoreState = (id?: string) =>
  useSlatePluginsStore((state) => getState(state, id));

/**
 * Slate editor with generic type (default is `ReactEditor & HistoryEditor & RandomKeyEditor`).
 */
export const useStoreEditor = <
  T extends TEditor | undefined = ReactEditor & HistoryEditor
>(
  id?: string
) =>
  useSlatePluginsStore((state) => getState(state, id)?.editor) as T & SPEditor;

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
