import { useEffect } from 'react';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import { useSlatePluginsEditor } from '../../store/useSlatePluginsEditor';
import { UseSlatePluginsOptions } from '../../types/UseSlatePluginsOptions';
import { withRandomKey } from '../../with/randomKeyEditor';
import { useEditableProps } from './useEditableProps';
import { useSlatePluginsEffects } from './useSlatePluginsEffects';
import { useSlateProps } from './useSlateProps';

/**
 * Run `useSlatePluginsEffects` and props getter for `Slate` and `Editable` components.
 * Use `useSlatePluginsStore` to select store state.
 */
export const useSlatePlugins = ({
  id,
  editor,
  initialValue,
  value,
  options,
  plugins,
  withPlugins,
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
    plugins,
    withPlugins,
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
