import { SlatePluginsOptions } from '../types/SlatePluginOptions/SlatePluginsOptions';
import { SPEditor } from '../types/SPEditor';
import { useEditorStatic } from './useEditor';

export const getOptions = (editor: SPEditor): SlatePluginsOptions =>
  (editor as SPEditor)?.options ?? {};

export const getPluginOptions = (editor: SPEditor, pluginKey: string) =>
  getOptions(editor)[pluginKey] ?? {};

export const getPluginsOptions = (editor: SPEditor, pluginKeys: string[]) =>
  pluginKeys.map((pluginKey) => getPluginOptions(editor, pluginKey));

export const getPluginType = (editor: SPEditor, pluginKey: string): string =>
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
