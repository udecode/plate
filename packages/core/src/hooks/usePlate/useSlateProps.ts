import { useCallback, useMemo } from 'react';
import { usePlateActions } from '../../stores/plate/plate.actions';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { usePlateKey } from '../../stores/plate/selectors/usePlateKey';
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
  const keyPlugins = usePlateKey('keyPlugins', id);
  const value = usePlateValue(id);

  const onChange = useCallback(
    (newValue: TNode[]) => {
      if (!editor || !keyPlugins) return;

      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        _onChange?.(newValue);
      }

      setValue(newValue);
    },
    [_onChange, editor, keyPlugins, setValue]
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
