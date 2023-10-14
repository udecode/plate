import { useCallback, useMemo, useRef } from 'react';
import { Value } from '@udecode/slate';
import { SlateProps } from '@udecode/slate-react';
import isEqual from 'lodash/isEqual.js';

import { PlateId, usePlateActions, usePlateSelectors } from '../stores';
import { useEditorRef } from '../stores/plate/selectors/useEditorRef';
import { pipeOnChange } from '../utils/pipeOnChange';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = <V extends Value>({
  id,
}: {
  id?: PlateId;
}): Omit<SlateProps, 'children'> => {
  const editor = useEditorRef(id);
  const value = usePlateSelectors(id).value();
  const setValue = usePlateActions(id).value();
  const onChangeProp = usePlateSelectors(id).onChange()?.fn;
  const onSelectionChangeProp = usePlateSelectors(id).onSelectionChange()?.fn;
  const onValueChangeProp = usePlateSelectors(id).onValueChange()?.fn;
  const prevValueRef = useRef<Value | null>(value);


  const onChange = useCallback(
    (newValue: V) => {
      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        onChangeProp?.(newValue);
        if (prevValueRef.current !== null) {
          if (isEqual(newValue, prevValueRef.current)) {
            onSelectionChangeProp?.(newValue);
          }
          else{
            onValueChangeProp?.(newValue);
          }
        }
      }

      setValue(newValue);
      prevValueRef.current = newValue;
    },
    [editor, setValue, onChangeProp]
  );

  return useMemo(() => {
    return {
      key: editor.key,
      editor,
      onChange,
      value,
      initialValue: value,
    };
  }, [editor, onChange, value]);
};
