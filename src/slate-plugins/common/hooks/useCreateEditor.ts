import { useMemo } from 'react';
import { createEditor } from 'slate';
import { PluginEditor } from 'slate-react';

export const useCreateEditor = (plugins: PluginEditor[]) =>
  useMemo(() => {
    let editor = createEditor();

    plugins.forEach(plugin => {
      editor = plugin(editor);
    });

    return editor;
  }, [plugins]);
