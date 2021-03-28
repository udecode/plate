import { useEffect } from 'react';
import { createEditor } from 'slate';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import {
  useStoreEditor,
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
  const state = useStoreState(id);

  // Clear the state on unmount.
  useEffect(
    () => () => {
      clearState();
    },
    [clearState]
  );

  useEffect(() => {
    if (!state) {
      setInitialState({
        enabled,
        plugins,
        pluginKeys: [],
        value: value ?? initialValue,
      });
    }
  }, [
    clearState,
    enabled,
    initialValue,
    plugins,
    setInitialState,
    state,
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

  useEffect(() => {
    if (storeEditor && !enabled) {
      setEditor(undefined);
    }
  }, [enabled, setEditor, storeEditor]);

  // Slate.editor
  useEffect(() => {
    if (!storeEditor && enabled) {
      setEditor(
        pipe(
          editor ?? createEditor(),
          withSlatePlugins({ id, plugins, options, components })
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
    enabled,
  ]);

  // Slate plugins
  useEffect(() => {
    plugins && setPlugins(plugins);
  }, [plugins, setPlugins]);

  useEffect(() => {
    plugins && setPluginKeys(flatMapByKey(plugins, 'pluginKeys'));
  }, [plugins, setPluginKeys]);
};
