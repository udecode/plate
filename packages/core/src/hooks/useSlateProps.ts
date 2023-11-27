import { useCallback, useMemo } from 'react';
import { Value } from '@udecode/slate';
import { SlateProps } from '@udecode/slate-react';

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
  const value = usePlateSelectors().value({ scope: id });
  const setValue = usePlateActions().value({ scope: id });
  const onChangeProp = usePlateSelectors().onChange({ scope: id })?.fn;

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
      initialValue: value,
    };
  }, [editor, onChange, value]);
};
