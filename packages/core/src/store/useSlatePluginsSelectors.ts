import { useCallback } from 'react';
import { Editor } from 'slate';
import { HistoryEditor } from 'slate-history/dist/history-editor';
import { ReactEditor } from 'slate-react';
import { SPEditor } from '../plugins/useSlatePluginsPlugin';
import { SlatePluginsOptions } from '../types/SlatePluginOptions/SlatePluginsOptions';
import { useSlatePluginsStore } from './useSlatePluginsStore';

/**
 * Slate editor with generic type (default is `ReactEditor & HistoryEditor & RandomKeyEditor`).
 */
export const useSPEditor = <
  TEditor extends Editor = ReactEditor & HistoryEditor & SPEditor
>(
  id = 'main'
) =>
  useSlatePluginsStore(
    useCallback((state) => state[id]?.editor as TEditor, [id])
  );

export const useSlatePluginsValue = (id = 'main') =>
  useSlatePluginsStore(useCallback((state) => state[id]?.value ?? [], [id]));

export const usePlugins = (id = 'main') =>
  useSlatePluginsStore(useCallback((state) => state[id]?.plugins ?? [], [id]));

export const useSlatePluginsPluginKeys = (id = 'main') =>
  useSlatePluginsStore(
    useCallback((state) => state[id]?.pluginKeys ?? [], [id])
  );

export const useSlatePluginsOptions = (id = 'main') =>
  useSPEditor(id).options as SlatePluginsOptions;
