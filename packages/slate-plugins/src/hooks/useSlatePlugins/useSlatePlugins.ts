import { useEffect, useMemo, useState } from 'react';
import { pipe } from '@udecode/slate-plugins-core';
import type { UseSlatePluginsOptionType } from './types';
import { useSlatePluginStore } from './useSlatePluginStore';

/**
 * @description This plugin is the base of your Editor, you can dynamically change the contents as you wish and internally, it will automatically reflect on your editor
 * @see @todo LINK TO THE DOCS PAGE
 * @requires key
 * @param options UseSlatePluginsOptionType
 */
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

  useEffect(() => {
    if (options.editor) setEditor(options.editor);
    if (options.components) setComponents(options.components);
    if (options.withPlugins) setWithPlugins(options.withPlugins);
    if (options.plugins) setPlugins(options.plugins);
  }, [
    options.editor,
    options.components,
    options.withPlugins,
    options.plugins,
  ]);

  const [editorValue, setEditorValue] = useState(options.initialValue);

  const editor = useMemo(() => pipe(stateEditor(), ...withPlugins), []);

  return {
    editor,
    withPlugins,
    plugins,
    setComponents,
    setWithPlugins,
    setEditor,
    setPlugins,
    editorValue,
    setEditorValue,
  };
};
