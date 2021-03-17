import { useEffect } from 'react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
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
  withOverrides,
  plugins,
}: UseSlatePluginsEffectsOptions) => {
  const {
    setInitialState,
    setValue,
    setEditor,
    setPlugins,
    setElementKeys,
  } = useSlatePluginsActions(id);

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
    if (editor || withOverrides || options || components) {
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

      setEditor({ editor, withOverrides, options: _options });
    }
  }, [components, editor, id, options, setEditor, withOverrides]);

  // Slate plugins
  useEffect(() => {
    plugins && setPlugins(plugins);
  }, [plugins, setPlugins]);

  useEffect(() => {
    plugins && setElementKeys(plugins.flatMap((p) => p.elementKeys ?? []));
  }, [plugins, setElementKeys]);
};
