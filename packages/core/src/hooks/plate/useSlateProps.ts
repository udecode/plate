import { useCallback, useMemo } from 'react';
import { Value } from '../../slate/editor/TEditor';
import { SlateProps } from '../../slate/types/SlateProps';
import {
  PlateId,
  usePlateActions,
  usePlateSelectors,
} from '../../stores/index';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { pipeOnChange } from '../../utils/plate/pipeOnChange';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = <V extends Value>({
  id,
}: {
  id?: PlateId;
}): Omit<SlateProps, 'children'> => {
  const editor = usePlateEditorRef(id);
  const value = usePlateSelectors(id).value();
  const setValue = usePlateActions(id).value();
  const onChangeProp = usePlateSelectors(id).onChange()?.fn;

  const onChange = useCallback(
    (newValue: V) => {
      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        onChangeProp?.(newValue);
      }

      setValue(newValue);
    },
    [editor, setValue, onChangeProp]
  );

  return useMemo(() => {
    return {
      key: editor.key,
      editor,
      onChange,
      value,
    };
  }, [editor, onChange, value]);
};
