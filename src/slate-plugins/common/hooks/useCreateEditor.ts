import { useMemo } from 'react';
import { createEditor } from 'slate';
import { PluginEditor, SlatePlugin } from 'slate-react';
import { createEditorPlugins } from '../utils';

export const useCreateEditor = (
  editorPlugins: PluginEditor[] = [],
  plugins: SlatePlugin[] = []
) => {
  const rawEditor = useMemo(() => createEditor(), []);

  return useMemo(() => {
    const newEditorPlugins = createEditorPlugins(editorPlugins, plugins);

    let editor = rawEditor;
    newEditorPlugins.forEach(plugin => {
      editor = plugin(editor);
    });

    return editor;
  }, [editorPlugins, plugins, rawEditor]);
};
