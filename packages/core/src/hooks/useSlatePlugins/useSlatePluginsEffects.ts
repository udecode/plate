import { useEffect } from 'react';
import { createEditor } from 'slate';
import { createHistoryPlugin } from '../../plugins/createHistoryPlugin';
import { createReactPlugin } from '../../plugins/createReactPlugin';
import { useStoreEditorEnabled } from '../../stores/slate-plugins/selectors/useStoreEditorEnabled';
import { useStoreEditorRef } from '../../stores/slate-plugins/selectors/useStoreEditorRef';
import { useStoreSlatePlugins } from '../../stores/slate-plugins/selectors/useStoreSlatePlugins';
import { useSlatePluginsActions } from '../../stores/slate-plugins/slate-plugins.actions';
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
    setEditorRef,
    setPlugins,
    setPluginKeys,
    setEnabled,
    clearState,
  } = useSlatePluginsActions<T>(id);
  const storeEditor = useStoreEditorRef<T>(id);
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
      setEditorRef(undefined);
    }
  }, [storeEnabled, storeEditor, setEditorRef]);

  // Slate.editor
  useEffect(() => {
    if (!storeEditor && storeEnabled) {
      setEditorRef(
        pipe(
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
    storeEnabled,
    storePlugins,
    setEditorRef,
  ]);
};
