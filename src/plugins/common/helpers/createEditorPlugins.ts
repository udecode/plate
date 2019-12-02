import { Plugin, PluginEditor } from 'slate-react';

export const createEditorPlugins = (
  editorPlugins: PluginEditor[] = [],
  plugins: Plugin[] = []
) => {
  const newEditorPlugins = [...editorPlugins];

  plugins.forEach(({ editor }) => {
    if (editor) {
      newEditorPlugins.push(editor);
    }
  });

  return newEditorPlugins;
};
