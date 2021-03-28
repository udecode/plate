import { useEffect } from 'react';
import { createEditor } from 'slate';
import { getHistoryPlugin } from '../../plugins/getHistoryPlugin';
import { getReactPlugin } from '../../plugins/getReactPlugin';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import {
  useStoreEditor,
  useStoreEditorEnabled,
  useStoreSlatePlugins,
  useStoreState,
} from '../../store/useSlatePluginsSelectors';
import { UseSlatePluginsEffectsOptions } from '../../types/UseSlatePluginsEffectsOptions';
import { flatMapByKey } from '../../utils/flatMapByKey';
import { pipe } from '../../utils/pipe';
import { withSlatePlugins } from '../../utils/withSlatePlugins';

/**
 * Effects to update the slate plugins store from the options.
 * Dynamically updating the options will update the store state.
 */
export const useSlatePluginsEffects = ({
  id = 'main',
  value,
  editor,
  enabled = true,
  components,
  options,
  initialValue,
  plugins,
}: UseSlatePluginsEffectsOptions) => {
  const {
    setInitialState,
    setValue,
    setEditor,
    setPlugins,
    setPluginKeys,
    setEnabled,
    clearState,
  } = useSlatePluginsActions(id);
  const storeEditor = useStoreEditor(id);
  const storeEnabled = useStoreEditorEnabled(id);
  const storeState = useStoreState(id);
  const storePlugins = useStoreSlatePlugins(id);

  // Clear the state on unmount.
  useEffect(
    () => () => {
      clearState();
    },
    [clearState]
  );

  useEffect(() => {
    if (!storeState) {
      setInitialState({
        enabled: true,
        plugins: [],
        pluginKeys: [],
        value: [],
      });
    }
  }, [
    clearState,
    enabled,
    initialValue,
    plugins,
    setInitialState,
    storeState,
    value,
  ]);

  // Slate.value
  useEffect(() => {
    initialValue && setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setValue]);

  // Slate.value
  useEffect(() => {
    value && setValue(value);
  }, [setValue, value]);

  useEffect(() => {
    setEnabled(enabled);
  }, [enabled, setEnabled]);

  // Slate plugins
  useEffect(() => {
    setPlugins(plugins ?? [getReactPlugin(), getHistoryPlugin()]);
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
        pipe(
          editor ?? createEditor(),
          withSlatePlugins({ id, plugins: storePlugins, options, components })
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
