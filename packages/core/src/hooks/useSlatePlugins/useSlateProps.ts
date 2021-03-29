import { useMemo } from 'react';
import { useSlatePluginsActions } from '../../store/useSlatePluginsActions';
import {
  useStoreEditor,
  useStoreEditorValue,
  useStoreSlatePlugins,
} from '../../store/useSlatePluginsSelectors';
import { SlateProps } from '../../types/SlateProps';
import { SPEditor } from '../../types/SPEditor';
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
  const editor = useStoreEditor<SPEditor | undefined>(id);
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
