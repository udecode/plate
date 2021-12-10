import { useCallback, useMemo } from 'react';
import {
  getPlateActions,
  usePlateSelectors,
} from '../../stores/plate/platesStore';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { SlateProps } from '../../types/slate/SlateProps';
import { TNode } from '../../types/slate/TNode';
import { UseSlatePropsOptions } from '../../types/UseSlatePropsOptions';
import { pipeOnChange } from '../../utils/pipeOnChange';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = ({
  id,
  onChange: onChangeProp,
}: UseSlatePropsOptions = {}): Omit<SlateProps, 'children'> => {
  const editor = usePlateEditorRef(id);
  const keyPlugins = usePlateSelectors(id).keyPlugins();
  const value = usePlateSelectors(id).value();

  const onChange = useCallback(
    (newValue: TNode[]) => {
      if (!editor || !keyPlugins) return;

      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        onChangeProp?.(newValue);
      }

      getPlateActions(id).value(newValue);
    },
    [onChangeProp, editor, id, keyPlugins]
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
