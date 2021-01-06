import { useMemo, useState } from 'react';
import { pipe } from '@udecode/slate-plugins-core';
import type { UseSlatePluginsOptionType } from './types';
import { useSlatePluginStore } from './useSlatePluginStore';

export const useSlatePlugins = (options: UseSlatePluginsOptionType) => {
  const {
    editor: stateEditor,
    withPlugins,
    plugins,
    setComponents,
    setWithPlugins,
    setEditor,
    setPlugins,
  } = useSlatePluginStore();

  if (options.editor) setEditor(options.editor);
  if (options.components) setComponents(options.components);
  if (options.withPlugins) setWithPlugins(options.withPlugins);
  if (options.plugins) setPlugins(options.plugins);

  const [editorValue, setEditorValue] = useState(options.initialValue);

  const editor = useMemo(() => pipe(stateEditor(), ...withPlugins), []);

  return {
    editor,
    plugins,
    editorValue,
    setEditorValue,
  };
};
