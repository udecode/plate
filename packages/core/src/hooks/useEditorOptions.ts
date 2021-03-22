import { Editor } from 'slate';
import { SlatePluginsEditor } from '../plugins/useSlatePluginsPlugin';
import { SlatePluginsOptions } from '../types/SlatePluginOptions/SlatePluginsOptions';
import { useEditorStatic } from './useEditorStatic';

export const getOptions = (editor: Editor): SlatePluginsOptions =>
  (editor as SlatePluginsEditor)?.options ?? {};

export const getPluginOptions = (editor: Editor, pluginKey: string) =>
  getOptions(editor)[pluginKey] ?? {};

export const getPluginsOptions = (editor: Editor, pluginKeys: string[]) =>
  pluginKeys.map((pluginKey) => getPluginOptions(editor, pluginKey));

export const getPluginType = (editor: Editor, pluginKey: string): string =>
  getPluginOptions(editor, pluginKey).type ?? pluginKey;

export const useEditorOptions = () => {
  return getOptions(useEditorStatic());
};

export const useEditorPluginOptions = (pluginKey: string) => {
  return getPluginOptions(useEditorStatic(), pluginKey);
};

export const useEditorPluginType = (pluginKey: string) => {
  return getPluginType(useEditorStatic(), pluginKey);
};
