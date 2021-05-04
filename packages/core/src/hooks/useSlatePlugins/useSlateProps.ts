import { useMemo } from 'react';
import { useStoreEditorRef } from '../../stores/slate-plugins/selectors/useStoreEditorRef';
import { useStoreEditorValue } from '../../stores/slate-plugins/selectors/useStoreEditorValue';
import { useStoreSlatePlugins } from '../../stores/slate-plugins/selectors/useStoreSlatePlugins';
import { useSlatePluginsActions } from '../../stores/slate-plugins/slate-plugins.actions';
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
}: UseSlatePropsOptions = {}): Omit<SlateProps, 'children'> => {
  const { setValue } = useSlatePluginsActions(id);
  const editor = useStoreEditorRef(id);
  const value = useStoreEditorValue(id);
  const plugins = useStoreSlatePlugins(id);

  return useMemo(
    () => ({
      key: editor?.key,
      editor,
      onChange: (newValue: TNode[]) => {
        setValue(newValue);

        editor && pipeOnChange(editor, plugins)(newValue);

        _onChange?.(newValue);
      },
      value,
    }),
    [_onChange, editor, plugins, setValue, value]
  );
};
