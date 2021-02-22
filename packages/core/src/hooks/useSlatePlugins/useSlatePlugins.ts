import { useEffect } from 'react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsSelectors';
import { UseSlatePluginsOptions } from '../../types/UseSlatePluginsOptions';
import { useEditableProps } from './useEditableProps';
import { useSlateProps } from './useSlateProps';

/**
 * Dynamically updating the options will update the store state.
 * Use `useSlatePluginsStore` to select the state from the store.
 */
export const useSlatePlugins = (options: UseSlatePluginsOptions = {}) => {
  const { key, editor, value, components, plugins } = options;

  const {
    setValue,
    setEditor,
    setPlugins,
    setComponents,
  } = useSlatePluginsActions();

  // Slate.value
  useEffect(() => {
    value && setValue(value, key);
  }, [value, key, setValue]);

  // Slate.editor
  useEffect(() => {
    editor && setEditor(editor, key);
  }, [editor, key, setEditor]);

  // Slate plugins components
  useEffect(() => {
    components && setComponents(components, key);
  }, [components, key, setComponents]);

  // Slate plugins
  useEffect(() => {
    plugins && setPlugins(plugins, key);
  }, [key, plugins, setPlugins]);

  return {
    getSlateProps: useSlateProps(options),
    getEditableProps: useEditableProps(options),
  };
};
