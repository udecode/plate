import { useEffect } from 'react';
import { createEditor, Editor } from 'slate';
import { createHistoryPlugin } from '../../plugins/createHistoryPlugin';
import { createReactPlugin } from '../../plugins/createReactPlugin';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import {
  useStoreEditor,
  useStoreEditorEnabled,
  useStoreSlatePlugins,
} from '../../store/useSlatePluginsSelectors';
import { SPEditor } from '../../types/SPEditor';
import { UseSlatePluginsEffectsOptions } from '../../types/UseSlatePluginsEffectsOptions';
import { flatMapByKey } from '../../utils/flatMapByKey';
import { pipe } from '../../utils/pipe';
import { withSlatePlugins } from '../../utils/withSlatePlugins';

/**
 * Effects to update the slate plugins store from the options.
 * Dynamically updating the options will update the store state.
 */
export const useSlatePluginsEffects = <T extends SPEditor = SPEditor>({
  id = 'main',
  value,
  editor,
  enabled = true,
  components,
  options,
  initialValue,
  plugins,
}: UseSlatePluginsEffectsOptions<T>) => {
  const {
    setInitialState,
    setValue,
    setEditor,
    setPlugins,
    setPluginKeys,
    setEnabled,
    clearState,
  } = useSlatePluginsActions<T>(id);
  const storeEditor = useStoreEditor(id);
  const storeEnabled = useStoreEditorEnabled(id);
  const storePlugins = useStoreSlatePlugins(id);

  // Clear the state on unmount.
  useEffect(
    () => () => {
      clearState();
    },
    [clearState, id]
  );

  useEffect(() => {
    setInitialState({
      enabled: true,
      plugins: [],
      pluginKeys: [],
      value: [],
    });
  }, [setInitialState]);

  // Slate.value
  useEffect(() => {
    initialValue && setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  // Slate.value
  useEffect(() => {
    value && setValue(value);

    !initialValue && !value && setValue([{ children: [{ text: '' }] }]);
  }, [initialValue, setValue, value]);

  useEffect(() => {
    setEnabled(enabled);
  }, [enabled, setEnabled]);

  // Slate plugins
  useEffect(() => {
    setPlugins(plugins ?? [createReactPlugin(), createHistoryPlugin()]);
  }, [plugins, setPlugins]);

  useEffect(() => {
    plugins && setPluginKeys(flatMapByKey(plugins, 'pluginKeys'));
  }, [plugins, setPluginKeys]);

  useEffect(() => {
    if (storeEditor && !storeEnabled) {
      setEditor(undefined);
    }
  }, [storeEnabled, setEditor, storeEditor]);

  // Slate.editor
  useEffect(() => {
    if (!storeEditor && storeEnabled) {
      setEditor(
        pipe<Editor, T>(
          editor ?? createEditor(),
          withSlatePlugins<T>({
            id,
            plugins: storePlugins,
            options,
            components,
          })
        )
      );
    }
  }, [
    storeEditor,
    components,
    editor,
    id,
    options,
    plugins,
    setEditor,
    storeEnabled,
    storePlugins,
  ]);
};
