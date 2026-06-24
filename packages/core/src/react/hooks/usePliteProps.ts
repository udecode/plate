import React from 'react';

import type { Value } from '@platejs/plite';
import type { PliteProps as RuntimePliteProps } from '@platejs/plite-react';

import { useAtomStoreValue } from 'jotai-x';

import { useEditorRef, useIncrementVersion, usePlateStore } from '../stores';
import { pipeOnChange } from '../utils/pipeOnChange';

type PliteComponentProps = Omit<RuntimePliteProps, 'children'>;

interface PliteProps extends PliteComponentProps {
  key: React.Key;
}

/** Get Plite props stored in a global store. */
export const usePliteProps = ({ id }: { id?: string }): PliteProps => {
  const editor = useEditorRef(id);
  const store = usePlateStore(id);
  const onChangeProp = useAtomStoreValue(store, 'onChange');
  const onValueChangeProp = useAtomStoreValue(store, 'onValueChange');
  const onSelectionChangeProp = useAtomStoreValue(store, 'onSelectionChange');
  const updateVersionEditor = useIncrementVersion('versionEditor', id);
  const updateVersionSelection = useIncrementVersion('versionSelection', id);
  const updateVersionValue = useIncrementVersion('versionValue', id);

  const onChange = React.useCallback(
    (newValue: Value) => {
      updateVersionEditor();
      const eventIsHandled = pipeOnChange(editor, newValue);

      if (!eventIsHandled) {
        onChangeProp?.({ editor, value: newValue });
      }
    },
    [editor, onChangeProp, updateVersionEditor]
  );

  const onValueChange: PliteComponentProps['onValueChange'] = React.useMemo(
    () => (value) => {
      updateVersionValue();
      onValueChangeProp?.({ editor, value: value as Value });
    },
    [editor, onValueChangeProp, updateVersionValue]
  );

  const onSelectionChange: PliteComponentProps['onSelectionChange'] =
    React.useMemo(
      () => (selection) => {
        updateVersionSelection();
        onSelectionChangeProp?.({ editor, selection });
      },
      [editor, onSelectionChangeProp, updateVersionSelection]
    );

  return React.useMemo(
    () => ({
      key: editor.meta.key,
      editor: editor as unknown as PliteComponentProps['editor'],
      onChange,
      onSelectionChange,
      onValueChange,
    }),
    [editor, onChange, onSelectionChange, onValueChange]
  );
};
