import { useEffect } from 'react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import { useSlatePluginsEditor } from '../../store/useSlatePluginsSelectors';
import { useSlatePluginsStore } from '../../store/useSlatePluginsStore';
import { UseSlatePluginsEffectsOptions } from '../../types/UseSlatePluginsEffectsOptions';
import { flatMapKey } from '../../utils/flatMapKey';

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
  const storeEditor = useSlatePluginsEditor(id);

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

    const _options = options ?? {};

    if (components) {
      // Merge components into options
      Object.keys(components).forEach((key) => {
        _options[key] = {
          component: components[key],
          ..._options[key],
        };
      });
    }

    setEditor({
      editor,
      plugins,
      options: _options,
    });
  }, [storeEditor, components, editor, id, options, plugins, setEditor]);

  // Slate plugins
  useEffect(() => {
    plugins && setPlugins(plugins);
  }, [plugins, setPlugins]);

  useEffect(() => {
    plugins && setPluginKeys(flatMapKey(plugins, 'pluginKeys') as any);
  }, [plugins, setPluginKeys]);
};
