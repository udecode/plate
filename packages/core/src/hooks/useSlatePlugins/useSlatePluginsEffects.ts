import { useEffect } from 'react';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { useWhyDidYouUpdate } from 'use-why-did-you-update';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import { useSlatePluginsEditor } from '../../store/useSlatePluginsEditor';
import { UseSlatePluginsEffectsOptions } from '../../types/UseSlatePluginsEffectsOptions';
import { withRandomKey } from '../../with/randomKeyEditor';

/**
 * Effects to update the slate plugins store from the options.
 * Dynamically updating the options will update the store state.
 */
export const useSlatePluginsEffects = ({
  id,
  value,
  editor,
  components,
  options,
  initialValue,
  withPlugins,
  plugins,
}: UseSlatePluginsEffectsOptions) => {
  const {
    setInitialState,
    setValue,
    setEditor,
    setPlugins,
    setOptions,
    setOption,
    setWithPlugins,
    setElementKeys,
  } = useSlatePluginsActions(id);

  const storeEditor = useSlatePluginsEditor(id);

  useEffect(() => {
    setInitialState();
  }, [setInitialState]);

  // Slate.value
  useEffect(() => {
    initialValue && setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  // Slate.value
  useEffect(() => {
    value && setValue(value);
  }, [setValue, value]);

  // Slate.editor
  useEffect(() => {
    if (editor) {
      (editor as any).id = id;
      setEditor(editor);
    }
  }, [editor, id, setEditor]);

  useEffect(() => {
    withPlugins && setWithPlugins(withPlugins);
  }, [setWithPlugins, withPlugins]);

  useEffect(() => {
    if (!editor && !withPlugins && !storeEditor) {
      setWithPlugins([withReact, withHistory, withRandomKey]);
    }
  }, [editor, setWithPlugins, storeEditor, withPlugins]);

  useEffect(() => {
    console.log('aaa');
  }, []);

  useEffect(() => {
    if (!components) return;

    Object.keys(components).forEach((key) => {
      setOption({
        pluginKey: key,
        optionKey: 'component',
        value: components[key],
      });
    });
  }, [components, setOption]);

  // Slate plugins components
  useEffect(() => {
    options && setOptions(options);
  }, [options, setOptions]);

  // Slate plugins
  useEffect(() => {
    plugins && setPlugins(plugins);
  }, [plugins, setPlugins]);

  useEffect(() => {
    plugins && setElementKeys(plugins.flatMap((p) => p.elementKeys ?? []));
  }, [plugins, setElementKeys]);
};
