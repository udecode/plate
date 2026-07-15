import React from 'react';

import type { Selection, Value, ValueOf } from '@platejs/plite';
import type { PliteProps as RuntimePliteProps } from '@platejs/plite-react';

import { useAtomStoreValue } from 'jotai-x';

import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { useEditorRef, usePlateStore } from '../stores';
import { pipeOnChange } from '../utils/pipeOnChange';

type PliteComponentProps = Omit<
  RuntimePliteProps,
  'children' | 'onChange' | 'onSelectionChange' | 'onValueChange'
>;

interface PlateRootProps extends PliteComponentProps {
  key: React.Key;
  onChange?: (value: Value) => void;
  onSelectionChange?: (selection: Selection) => void;
  onValueChange?: (value: Value) => void;
}

/** Get the Plite root props stored in a Plate store. */
export const usePlateRootProps = ({ id }: { id?: string }): PlateRootProps => {
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

  const onValueChange = React.useCallback(
    (value: Value) => {
      onValueChangeProp?.({ editor, value: value as ValueOf<typeof editor> });
    },
    [editor, onValueChangeProp]
  );

  const onSelectionChange = React.useCallback(
    (selection: Selection) => {
      onSelectionChangeProp?.({ editor, selection });
    },
    [editor, onSelectionChangeProp]
  );

  return React.useMemo(
    () => ({
      key: getPlateEditorInstanceKey(editor),
      editor,
      onChange,
      onSelectionChange,
      onValueChange,
    }),
    [editor, onChange, onSelectionChange, onValueChange]
  );
};
