import { useMemo } from 'react';
import { createEditor } from 'slate';
import { PluginEditor, SlatePlugin } from 'slate-react';
import { createEditorPlugins } from '../utils';

export const useCreateEditor = (
  editorPlugins: PluginEditor[] = [],
  plugins: SlatePlugin[] = []
) =>
  useMemo(() => {
    let editor = createEditor();

    const newEditorPlugins = createEditorPlugins(editorPlugins, plugins);

    newEditorPlugins.forEach(plugin => {
      editor = plugin(editor);
    });

    return editor;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
