import { useCallback } from 'react';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { State } from '../types/SlatePluginsStore';
import { SPEditor } from '../types/SPEditor';
import { useSlatePluginsStore } from './useSlatePluginsStore';

export const useStoreState = (id = 'main'): State | undefined =>
  useSlatePluginsStore(useCallback((state) => state[id], [id]));

/**
 * Slate editor with generic type (default is `ReactEditor & HistoryEditor & RandomKeyEditor`).
 */
export const useStoreEditor = <
  TEditor extends SPEditor | undefined = ReactEditor & HistoryEditor & SPEditor
>(
  id?: string
) => useStoreState(id)?.editor as TEditor;

export const useStoreEditorEnabled = (id?: string) =>
  useStoreState(id)?.enabled;
export const useStoreEditorValue = (id?: string) => useStoreState(id)?.value;
export const useStoreSlatePlugins = (id?: string) => useStoreState(id)?.plugins;

export const useStoreSlatePluginKeys = (id?: string) =>
  useStoreState(id)?.pluginKeys;

export const useStoreEditorOptions = (id?: string) =>
  useStoreEditor(id)?.options;
