import { useCallback, useMemo } from 'react';
import { usePlateActions } from '../../stores/plate/plate.actions';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { usePlatePlugins } from '../../stores/plate/selectors/usePlatePlugins';
import { usePlateValue } from '../../stores/plate/selectors/usePlateValue';
import { SlateProps } from '../../types/slate/SlateProps';
import { TNode } from '../../types/slate/TNode';
import { UseSlatePropsOptions } from '../../types/UseSlatePropsOptions';
import { pipeOnChange } from '../../utils/pipeOnChange';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = ({
  id,
  onChange: _onChange,
}: UseSlatePropsOptions = {}): Omit<SlateProps, 'children'> => {
  const { setValue } = usePlateActions(id);
  const editor = usePlateEditorRef(id);
  const value = usePlateValue(id);
  const plugins = usePlatePlugins(id);

  const onChange = useCallback(
    (newValue: TNode[]) => {
      if (!editor) return;

      const eventIsHandled = pipeOnChange(editor, plugins)(newValue);

      if (!eventIsHandled) {
        _onChange?.(newValue);
      }

      setValue(newValue);
    },
    [_onChange, editor, plugins, setValue]
  );

  return useMemo(
    () => ({
      key: editor?.key,
      editor,
      onChange,
      value,
    }),
    [editor, onChange, value]
  );
};
