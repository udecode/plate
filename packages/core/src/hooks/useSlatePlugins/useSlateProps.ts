import { useCallback, useMemo } from 'react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import {
  useStoreEditor,
  useStorePlugins,
  useStoreValue,
} from '../../store/useSlatePluginsSelectors';
import { SlateProps } from '../../types/SlateProps';
import { TNode } from '../../types/TNode';
import { UseSlatePropsOptions } from '../../types/UseSlatePropsOptions';
import { pipeOnChange } from '../../utils/pipeOnChange';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = ({
  id,
  onChange: _onChange,
}: UseSlatePropsOptions = {}): (() => Omit<SlateProps, 'children'>) => {
  const { setValue } = useSlatePluginsActions(id);
  const editor = useStoreEditor(id);
  const value = useStoreValue(id);
  const plugins = useStorePlugins(id);

  const onChange = useMemo(
    () => (newValue: TNode[]) => {
      setValue(newValue);

      pipeOnChange(editor, plugins)(newValue);

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
