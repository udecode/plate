import React from 'react';

import type { Value } from '@udecode/slate';
import type { SlateProps } from '@udecode/slate-react';

import { pipeOnChange } from '../../shared/utils/pipeOnChange';
import {
  type PlateId,
  useEditorRef,
  usePlateActions,
  usePlateSelectors,
} from '../stores';

/** Get Slate props stored in a global store. */
export const useSlateProps = ({
  id,
}: {
  id?: PlateId;
}): Omit<SlateProps, 'children'> => {
  const editor = useEditorRef(id);
  const value = usePlateSelectors(id).value();
  const setValue = usePlateActions(id).value();
  const onChangeProp = usePlateSelectors(id).onChange();
  const onValueChangeProp = usePlateSelectors(id).onValueChange();
  const onSelectionChangeProp = usePlateSelectors(id).onSelectionChange();

  const onChange = React.useCallback(
    (newValue: Value) => {
      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        onChangeProp?.(newValue);
      }

      setValue(newValue);
    },
    [editor, setValue, onChangeProp]
  );

  const onValueChange = React.useMemo(
    () => onValueChangeProp,
    [onValueChangeProp]
  );

  const onSelectionChange = React.useMemo(
    () => onSelectionChangeProp,
    [onSelectionChangeProp]
  );

  return React.useMemo(() => {
    return {
      editor,
      initialValue: value,
      key: editor.key,
      onChange,
      onSelectionChange,
      onValueChange,
      value,
    };
  }, [editor, onChange, onSelectionChange, onValueChange, value]);
};
