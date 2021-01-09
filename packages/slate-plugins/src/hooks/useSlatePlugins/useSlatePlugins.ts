import { useEffect } from 'react';
import { UseSlatePluginsOptions } from './types';
import { useSlatePluginsActions } from './useSlatePluginsSelectors';

/**
 * Control the editor store in one hook: dynamically change the options as you wish and internally it will be saved in the store.
 * Use `useSlatePluginsStore` to select state from the store.
 */
export const useSlatePlugins = (options: UseSlatePluginsOptions = {}) => {
  const {
    key = 'main',
    components,
    value: editorValue,
    plugins,
    editor,
  } = options;

  const {
    setValue,
    setComponents,
    setEditor,
    setPlugins,
  } = useSlatePluginsActions();

  useEffect(() => {
    editorValue && setValue(key, editorValue);
  }, [editorValue, key, setValue]);

  useEffect(() => {
    components && setComponents(key, components);
  }, [components, key, setComponents]);

  useEffect(() => {
    editor && setEditor(key, editor);
  }, [editor, key, setEditor]);

  useEffect(() => {
    plugins && setPlugins(key, plugins);
  }, [key, plugins, setPlugins]);
};
