import { Editor } from 'slate';
import { useEditor } from 'slate-react';
import { SlatePluginsOptions } from '../types/SlatePluginOptions/SlatePluginsOptions';

export const getOptions = (editor: Editor) =>
  (editor?.options ?? {}) as SlatePluginsOptions;

export const getPluginOptions = (editor: Editor, pluginKey: string) =>
  getOptions(editor)[pluginKey] ?? {};

export const getPluginsOptions = (editor: Editor, pluginKeys: string[]) =>
  pluginKeys.map((pluginKey) => getPluginOptions(editor, pluginKey));

export const getPluginType = (editor: Editor, pluginKey: string): string =>
  getPluginOptions(editor, pluginKey).type ?? pluginKey;

export const useEditorOptions = () => {
  return getOptions(useEditor());
};

export const useEditorPluginOptions = (pluginKey: string) => {
  return getPluginOptions(useEditor(), pluginKey);
};

export const useEditorPluginType = (pluginKey: string) => {
  return getPluginType(useEditor(), pluginKey);
};
