import React from 'react';

import type { Value } from '@platejs/slate';

import { useAtomStoreValue } from 'jotai-x';

import { useEditorRef, useIncrementVersion, usePlateStore } from '../stores';
import { pipeOnChange } from '../utils/pipeOnChange';

type SlateComponentProps = Omit<
  React.ComponentProps<typeof import('../slate-react').Slate>,
  'children'
>;

interface PlateSlateProps extends SlateComponentProps {
  key: React.Key;
}

/** Get Slate props stored in a global store. */
export const useSlateProps = ({ id }: { id?: string }): PlateSlateProps => {
  const editor = useEditorRef(id);
  const store = usePlateStore(id);
  const onChangeProp = useAtomStoreValue(store, 'onChange');
  const onValueChangeProp = useAtomStoreValue(store, 'onValueChange');
  const onSelectionChangeProp = useAtomStoreValue(store, 'onSelectionChange');
  const updateVersionEditor = useIncrementVersion('versionEditor', id);
  const updateVersionSelection = useIncrementVersion('versionSelection', id);
  const updateVersionValue = useIncrementVersion('versionValue', id);

  const onChange = React.useCallback(
    (newValue: SlateComponentProps['initialValue']) => {
      updateVersionEditor();
      const eventIsHandled = pipeOnChange(editor, newValue as Value);

      if (!eventIsHandled) {
        onChangeProp?.({ editor, value: newValue as Value });
      }
    },
    [editor, onChangeProp, updateVersionEditor]
  );

  const onValueChange: SlateComponentProps['onValueChange'] = React.useMemo(
    () => (value) => {
      updateVersionValue();
      onValueChangeProp?.({ editor, value: value as Value });
    },
    [editor, onValueChangeProp, updateVersionValue]
  );

  const onSelectionChange: SlateComponentProps['onSelectionChange'] =
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
      editor: editor as unknown as SlateComponentProps['editor'],
      initialValue: editor.children as SlateComponentProps['initialValue'],
      onChange,
      onSelectionChange,
      onValueChange,
    }),
    [editor, onChange, onSelectionChange, onValueChange]
  );
};
