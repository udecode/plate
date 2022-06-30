import { useCallback, useEffect, useMemo, useState } from 'react';
import { PlateProps } from '../../components/plate/Plate';
import { Value } from '../../slate/editor/TEditor';
import { SlateProps } from '../../slate/types/SlateProps';
import {
  getPlateActions,
  usePlateSelectors,
} from '../../stores/plate/platesStore';
import { usePlateEditorRef } from '../../stores/plate/selectors/usePlateEditorRef';
import { normalizeInitialValue } from '../../utils/plate/normalizeInitialValue';
import { pipeOnChange } from '../../utils/plate/pipeOnChange';

/**
 * Get Slate props stored in a global store.
 */
export const useSlateProps = <V extends Value>({
  id,
}: Pick<PlateProps<V>, 'id'> = {}): Omit<SlateProps, 'children'> => {
  const editor = usePlateEditorRef(id);
  const keyPlugins = usePlateSelectors(id).keyPlugins();
  const value = usePlateSelectors(id).value();
  const onChangeProp = usePlateSelectors(id).onChange();
  const [normalizedInitialValue, setNormalizedInitialValue] = useState(false);

  useEffect(() => {
    if (!editor || !value || normalizedInitialValue) return;

    normalizeInitialValue(editor, value);

    setNormalizedInitialValue(true);
  }, [editor, id, normalizedInitialValue, value]);

  const onChange = useCallback(
    (newValue: V) => {
      if (!editor || !keyPlugins) return;

      const eventIsHandled = pipeOnChange(editor)(newValue);

      if (!eventIsHandled) {
        onChangeProp?.(newValue);
      }

      getPlateActions(id).value(newValue);
    },
    [onChangeProp, editor, id, keyPlugins]
  );

  return useMemo(() => {
    if (!editor || !normalizedInitialValue) return {};

    return {
      key: editor.key,
      editor,
      onChange,
      value,
    };
  }, [editor, normalizedInitialValue, onChange, value]);
};
