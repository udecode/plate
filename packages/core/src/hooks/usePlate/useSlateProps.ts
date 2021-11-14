import { useCallback, useMemo } from 'react';
import { usePlateActions } from '../../stores/plate/plate.actions';
import { usePlateEditorWithPlugins } from '../../stores/plate/selectors/usePlateEditorRef';
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
  const editor = usePlateEditorWithPlugins(id)!;
  const value = usePlateValue(id);

  const onChange = useCallback(
    (newValue: TNode[]) => {
      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        _onChange?.(newValue);
      }

      setValue(newValue);
    },
    [_onChange, editor, setValue]
  );

  return useMemo(
    () => ({
      key: editor.key,
      editor,
      onChange,
      value,
    }),
    [editor, onChange, value]
  );
};
