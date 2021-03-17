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
  withOverrides,
  onChange,
  onDOMBeforeInput,
  renderElement,
  decorate,
  decorateDeps,
  editableProps,
  onDOMBeforeInputDeps,
  onKeyDown,
  onKeyDownDeps,
  renderElementDeps,
  renderLeaf,
  renderLeafDeps,
}: UseSlatePluginsOptions) => {
  useSlatePluginsEffects({
    id,
    components,
    plugins,
    withOverrides,
    initialValue,
    editor,
    value,
    options,
  });

  return {
    getSlateProps: useSlateProps({
      id,
      onChange,
    }),
    getEditableProps: useEditableProps({
      id,
      decorate,
      decorateDeps,
      editableProps,
      onDOMBeforeInput,
      onDOMBeforeInputDeps,
      onKeyDown,
      onKeyDownDeps,
      plugins,
      renderElement,
      renderElementDeps,
      renderLeaf,
      renderLeafDeps,
    }),
  };
};
