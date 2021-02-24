import { useEffect } from 'react';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import { useSlatePluginsEditor } from '../../store/useSlatePluginsEditor';
import { UseSlatePluginsOptions } from '../../types/UseSlatePluginsOptions';
import { withRandomKey } from '../../with/randomKeyEditor';
import { useEditableProps } from './useEditableProps';
import { useSlateProps } from './useSlateProps';

/**
 * Dynamically updating the options will update the store state.
 * Use `useSlatePluginsStore` to select the state from the store.
 */
export const useSlatePlugins = (options: UseSlatePluginsOptions = {}) => {
  const {
    id,
    editor,
    initialValue,
    value,
    components,
    plugins,
    withPlugins,
  } = options;

  const {
    setInitialState,
    setValue,
    setEditor,
    setPlugins,
    setComponents,
    setWithPlugins,
  } = useSlatePluginsActions(id);

  const storeEditor = useSlatePluginsEditor(id);

  useEffect(() => {
    setInitialState();
  }, [id, setInitialState]);

  // Slate.value
  useEffect(() => {
    initialValue && setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  // Slate.value
  useEffect(() => {
    value && setValue(value);
  }, [value, setValue]);

  // Slate.editor
  useEffect(() => {
    editor && setEditor(editor);
  }, [editor, setEditor]);

  useEffect(() => {
    withPlugins && setWithPlugins(withPlugins);
  }, [setWithPlugins, withPlugins]);

  useEffect(() => {
    if (!editor && !withPlugins && !storeEditor) {
      setWithPlugins([withReact, withHistory, withRandomKey]);
    }
  }, [editor, setWithPlugins, storeEditor, withPlugins]);

  // Slate plugins components
  useEffect(() => {
    components && setComponents(components);
  }, [components, setComponents]);

  // Slate plugins
  useEffect(() => {
    plugins && setPlugins(plugins);
  }, [plugins, setPlugins]);

  return {
    getSlateProps: useSlateProps(options),
    getEditableProps: useEditableProps(options),
  };
};
