import React from 'react';

import type { Editor, TSelection, Value } from '@udecode/slate';
import type { UnknownObject } from '@udecode/utils';

import { useAtomStoreValue } from 'jotai-x';

import { useEditorRef, useIncrementVersion, usePlateStore } from '../stores';
import { pipeOnChange } from '../utils/pipeOnChange';

interface SlateProps extends UnknownObject {
  children: React.ReactNode;
  editor: Editor;
  initialValue: Value;
  onChange?: (value: Value) => void;
  onSelectionChange?: (selection: TSelection) => void;
  onValueChange?: (value: Value) => void;
}

/** Get Slate props stored in a global store. */
export const useSlateProps = ({
  id,
}: {
  id?: string;
}): Omit<SlateProps, 'children'> => {
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

  const onValueChange: SlateProps['onValueChange'] = React.useMemo(
    () => (value) => {
      updateVersionValue();
      onValueChangeProp?.({ editor, value });
    },
    [editor, onValueChangeProp, updateVersionValue]
  );

  const onSelectionChange: SlateProps['onSelectionChange'] = React.useMemo(
    () => (selection: TSelection) => {
      updateVersionSelection();
      onSelectionChangeProp?.({ editor, selection });
    },
    [editor, onSelectionChangeProp, updateVersionSelection]
  );

  return React.useMemo(() => {
    return {
      key: editor.key,
      editor,
      initialValue: editor.children,
      value: editor.children,
      onChange,
      onSelectionChange,
      onValueChange,
    };
  }, [editor, onChange, onSelectionChange, onValueChange]);
};
