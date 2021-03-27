import { UseSlatePluginsOptions } from '../../types/UseSlatePluginsOptions';
import { useEditableProps } from './useEditableProps';
import { useSlatePluginsEffects } from './useSlatePluginsEffects';
import { useSlateProps } from './useSlateProps';

/**
 * Run `useSlatePluginsEffects` and props getter for `Slate` and `Editable` components.
 * Use `useSlatePluginsStore` to select store state.
 */
export const useSlatePlugins = ({
  id,
  components,
  editor,
  initialValue,
  value,
  options,
  plugins,
  onChange,
  editableProps,
}: UseSlatePluginsOptions) => {
  useSlatePluginsEffects({
    id,
    components,
    plugins,
    initialValue,
    editor,
    value,
    options,
  });

  return {
    slateProps: useSlateProps({
      id,
      onChange,
    }),
    editableProps: useEditableProps({
      id,
      editableProps,
    }),
  };
};
