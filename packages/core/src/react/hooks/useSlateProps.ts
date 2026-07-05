import React from 'react';

import type { Selection, Value, ValueOf } from '@platejs/plite';
import type { PliteProps as RuntimePliteProps } from '@platejs/plite-react';

import { useAtomStoreValue } from 'jotai-x';

import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { useEditorRef, usePlateStore } from '../stores';
import { pipeOnChange } from '../utils/pipeOnChange';

type SlateComponentProps = Omit<
  RuntimePliteProps,
  'children' | 'onChange' | 'onSelectionChange' | 'onValueChange'
>;

interface PlateSlateProps extends SlateComponentProps {
  key: React.Key;
  onChange?: (value: Value) => void;
  onSelectionChange?: (selection: Selection) => void;
  onValueChange?: (value: Value) => void;
}

/** Get Slate props stored in a global store. */
export const useSlateProps = ({ id }: { id?: string }): PlateSlateProps => {
  const editor = useEditorRef(id);
  const store = usePlateStore(id);
  const onChangeProp = useAtomStoreValue(store, 'onChange');
  const onValueChangeProp = useAtomStoreValue(store, 'onValueChange');
  const onSelectionChangeProp = useAtomStoreValue(store, 'onSelectionChange');

  const onChange = React.useCallback(
    (newValue: Value) => {
      const eventIsHandled = pipeOnChange(editor, newValue);

      if (!eventIsHandled) {
        onChangeProp?.({
          editor,
          value: newValue as ValueOf<typeof editor>,
        });
      }
    },
    [editor, onChangeProp]
  );

  const onValueChange: PlateSlateProps['onValueChange'] = React.useMemo(
    () => (value) => {
      onValueChangeProp?.({
        editor,
        value: value as ValueOf<typeof editor>,
      });
    },
    [editor, onValueChangeProp]
  );

  const onSelectionChange: PlateSlateProps['onSelectionChange'] = React.useMemo(
    () => (selection) => {
      onSelectionChangeProp?.({ editor, selection });
    },
    [editor, onSelectionChangeProp]
  );

  return React.useMemo(
    () => ({
      key: getPlateEditorInstanceKey(editor),
      editor: editor as unknown as SlateComponentProps['editor'],
      onChange,
      onSelectionChange,
      onValueChange,
    }),
    [editor, onChange, onSelectionChange, onValueChange]
  );
};
