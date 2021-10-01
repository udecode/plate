import { useCallback, useMemo } from 'react';
import { usePlateActions } from '../../stores/plate/plate.actions';
import { useStoreEditorRef } from '../../stores/plate/selectors/useStoreEditorRef';
import { useStoreEditorValue } from '../../stores/plate/selectors/useStoreEditorValue';
import { useStorePlate } from '../../stores/plate/selectors/useStorePlate';
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
  const { setValue } = usePlateActions(id);
  const editor = useStoreEditorRef(id);
  const value = useStoreEditorValue(id);
  const plugins = useStorePlate(id);

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
