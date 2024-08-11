import React from 'react';

import type { TSelection, Value } from '@udecode/slate';
import type { SlateProps } from '@udecode/slate-react';

import { pipeOnChange } from '../../lib/utils/pipeOnChange';
import { type PlateId, useEditorRef, usePlateSelectors } from '../stores';

/** Get Slate props stored in a global store. */
export const useSlateProps = ({
  id,
}: {
  id?: PlateId;
}): Omit<SlateProps, 'children'> => {
  const editor = useEditorRef(id);
  const onChangeProp = usePlateSelectors(id).onChange();
  const onValueChangeProp = usePlateSelectors(id).onValueChange();
  const onSelectionChangeProp = usePlateSelectors(id).onSelectionChange();

  const onChange = React.useCallback(
    (newValue: Value) => {
      const eventIsHandled = pipeOnChange(editor, newValue);

      if (!eventIsHandled) {
        onChangeProp?.({ editor, value: newValue });
      }
    },
    [editor, onChangeProp]
  );

  const onValueChange: SlateProps['onValueChange'] = React.useMemo(
    () => (value) => {
      onValueChangeProp?.({ editor, value });
    },
    [editor, onValueChangeProp]
  );

  const onSelectionChange: SlateProps['onSelectionChange'] = React.useMemo(
    () => (selection: TSelection) => {
      onSelectionChangeProp?.({ editor, selection });
    },
    [editor, onSelectionChangeProp]
  );

  return React.useMemo(() => {
    return {
      editor,
      initialValue: editor.children,
      key: editor.key,
      onChange,
      onSelectionChange,
      onValueChange,
      value: editor.children,
    };
  }, [editor, onChange, onSelectionChange, onValueChange]);
};
