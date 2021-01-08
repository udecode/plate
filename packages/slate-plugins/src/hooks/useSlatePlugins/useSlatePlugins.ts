import { useEffect, useMemo, useState } from 'react';
import { pipe } from '@udecode/slate-plugins-core';
import type { UseSlatePluginsOptionType } from './types';
import { slatePluginStore } from '.';

/**
 * @description This plugin is the base of your Editor, you can dynamically change the contents as you wish and internally, it will be automatically reflected on your editor
 * @see @todo LINK TO THE DOCS PAGE
 * @requires key
 * @param options UseSlatePluginsOptionType
 */
export const useSlatePlugins = (options: UseSlatePluginsOptionType) => {
  /**
   * @description This will allow component level store with fallback which allows multiple editor compositions.
   */
  const [
    {
      editor: stateEditor,
      withPlugins,
      plugins,
      setComponents,
      setWithPlugins,
      setEditor,
      setPlugins,
    },
  ] = useState(() => slatePluginStore());

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
