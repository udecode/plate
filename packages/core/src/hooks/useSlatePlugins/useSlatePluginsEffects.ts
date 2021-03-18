import { useEffect } from 'react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import { useSlatePluginsEditor } from '../../store/useSlatePluginsEditor';
import { UseSlatePluginsEffectsOptions } from '../../types/UseSlatePluginsEffectsOptions';

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
  } = useSlatePluginsActions(id);
  const _editor = useSlatePluginsEditor(id);

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
    console.log(editor);
    if (_editor) return;

    if (editor || options || components || plugins) {
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

      // Default type is the plugin key
      Object.keys(_options).forEach((key) => {
        if (!_options[key].type) _options[key].type = key;
      });

      const withOverrides =
        plugins?.flatMap((p) => p.withOverrides ?? []) ?? [];

      setEditor({
        editor,
        withOverrides,
        options: _options,
      });
    }
  }, [_editor, components, editor, id, options, plugins, setEditor]);

  // Slate plugins
  useEffect(() => {
    console.log('plugins');
    plugins && setPlugins(plugins);
  }, [plugins, setPlugins]);

  useEffect(() => {
    plugins && setPluginKeys(plugins.flatMap((p) => p.pluginKeys ?? []));
  }, [plugins, setPluginKeys]);
};
