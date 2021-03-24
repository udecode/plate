import { useCallback, useMemo } from 'react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import {
  usePlugins,
  useSlatePluginsValue,
  useSPEditor,
} from '../../store/useSlatePluginsSelectors';
import { SlateProps } from '../../types/SlateProps';
import { TNode } from '../../types/TNode';
import { UseSlatePropsOptions } from '../../types/UseSlatePropsOptions';
import { onChangePlugins } from '../../utils/onChangePlugins';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = ({
  id,
  onChange: _onChange,
}: UseSlatePropsOptions = {}): (() => Omit<SlateProps, 'children'>) => {
  const { setValue } = useSlatePluginsActions(id);
  const editor = useSPEditor(id);
  const value = useSlatePluginsValue(id);
  const plugins = usePlugins(id);

  const onChange = useMemo(
    () => (newValue: TNode[]) => {
      setValue(newValue);

      onChangePlugins(editor, plugins)(newValue);

      _onChange?.(newValue);
    },
    [_onChange, editor, plugins, setValue]
  );

  return useCallback(
    () => ({
      key: editor?.key,
      editor,
      onChange,
      value,
    }),
    [editor, onChange, value]
  );
};
