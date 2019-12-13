import { createEditor } from 'slate';
import { PluginEditor } from 'slate-react';

export const createCustomEditor = (plugins: PluginEditor[]) => {
  let editor = createEditor();

  plugins.forEach(plugin => {
    editor = plugin(editor);
  });

  return editor;
};
