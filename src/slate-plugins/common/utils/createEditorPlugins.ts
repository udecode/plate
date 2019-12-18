import { PluginEditor, SlatePlugin } from 'slate-react';

export const createEditorPlugins = (
  editorPlugins: PluginEditor[] = [],
  plugins: SlatePlugin[] = []
) => {
  const newEditorPlugins = [...editorPlugins];

  plugins.forEach(({ editor }) => {
    if (editor) {
      newEditorPlugins.push(editor);
    }
  });

  return newEditorPlugins;
};
