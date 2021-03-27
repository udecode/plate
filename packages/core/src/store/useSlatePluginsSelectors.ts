import { useCallback } from 'react';
import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SlatePluginsOptions } from '../types/SlatePluginOptions/SlatePluginsOptions';
import { SPEditor } from '../types/SPEditor';
import { useSlatePluginsStore } from './useSlatePluginsStore';

/**
 * Slate editor with generic type (default is `ReactEditor & HistoryEditor & RandomKeyEditor`).
 */
export const useStoreEditor = <
  TEditor extends Editor = ReactEditor & HistoryEditor & SPEditor
>(
  id = 'main'
) =>
  useSlatePluginsStore(
    useCallback((state) => state[id]?.editor as TEditor, [id])
  );

export const useStoreEditorValue = (id = 'main') =>
  useSlatePluginsStore(useCallback((state) => state[id]?.value ?? [], [id]));

export const useStoreSlatePlugins = (id = 'main') =>
  useSlatePluginsStore(useCallback((state) => state[id]?.plugins ?? [], [id]));

export const useStoreSlatePluginKeys = (id = 'main') =>
  useSlatePluginsStore(
    useCallback((state) => state[id]?.pluginKeys ?? [], [id])
  );

export const useStoreEditorOptions = (id = 'main') =>
  useStoreEditor(id).options as SlatePluginsOptions;
