import { useEffect } from 'react';
import { createEditor } from 'slate';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import { useStoreEditor } from '../../store/useSlatePluginsSelectors';
import { UseSlatePluginsEffectsOptions } from '../../types/UseSlatePluginsEffectsOptions';
import { flatMapByKey } from '../../utils/flatMapByKey';
import { pipe } from '../../utils/pipe';
import { withSlatePlugins } from '../../utils/withSlatePlugins';

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
  plugins,
}: UseSlatePluginsEffectsOptions) => {
  const {
    setInitialState,
    setValue,
    setEditor,
    setPlugins,
    setPluginKeys,
    clearState,
  } = useSlatePluginsActions(id);
  const storeEditor = useStoreEditor(id);

  useEffect(() => {
    setInitialState();
  }, [setInitialState]);

  // Clear the state by id on unmount.
  useEffect(
    () => () => {
      clearState();
    },
    [clearState]
  );

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
    if (storeEditor) return;

    setEditor(
      pipe(
        createEditor(),
        withSlatePlugins({ id, plugins, options, components })
      )
    );
  }, [storeEditor, components, editor, id, options, plugins, setEditor]);

  // Slate plugins
  useEffect(() => {
    plugins && setPlugins(plugins);
  }, [plugins, setPlugins]);

  useEffect(() => {
    plugins && setPluginKeys(flatMapByKey(plugins, 'pluginKeys'));
  }, [plugins, setPluginKeys]);
};
