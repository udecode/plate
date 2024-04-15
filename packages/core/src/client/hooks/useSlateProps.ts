import React from 'react';
import { Value } from '@udecode/slate';
import { SlateProps } from '@udecode/slate-react';

import { pipeOnChange } from '../../utils/pipeOnChange';
import {
  PlateId,
  useEditorRef,
  usePlateActions,
  usePlateSelectors,
} from '../stores';

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
  const onChangeProp = usePlateSelectors(id).onChange();

  const onChange = React.useCallback(
    (newValue: V) => {
      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        onChangeProp?.(newValue);
      }

      setValue(newValue);
    },
    [editor, setValue, onChangeProp]
  );

  return React.useMemo(() => {
    return {
      key: editor.key,
      editor,
      onChange,
      value,
      initialValue: value,
    };
  }, [editor, onChange, value]);
};
